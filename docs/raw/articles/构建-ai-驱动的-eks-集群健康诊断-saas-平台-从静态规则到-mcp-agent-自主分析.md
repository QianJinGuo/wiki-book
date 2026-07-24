---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/build-ai-eks-cluster-diagnosis-saas-platform
ingested: 2026-07-24
feed_name: AWS China Blog
source_published: 2026-07-24
sha256: 82ea49931155ae377612fb4b583754fca8384993099a098ebfcd77d4f156b714
---

# 构建 AI 驱动的 EKS 集群健康诊断 SaaS 平台 – 从静态规则到 MCP Agent 自主分析

摘要：本文介绍了一个面向 Amazon EKS 用户的 AI 驱动集群健康诊断 SaaS 平台，该平台通过”确定性规则 + AI 关联分析 + MCP Agent 自主诊断”三层架构，实现从静态规则检查到 AI Agent 按需实时采集集群数据的智能化运维诊断，帮助用户快速定位集群配置风险并获得可执行的修复建议。  
  
**目录**

01 一、背景：EKS 集群运维排错的现实困境

02 二、平台功能概览

03 三、整体架构：异步事件驱动

04 四、核心能力：结合 Amazon EKS MCP Server 的 AI 自主诊断

05 五、Scan Worker 流水线详解

06 六、功能演示 Walkthrough

07 七、部署与体验

08 八、总结与展望

* * *

## **一、背景：EKS 集群运维排错的现实困境**

在日常支持 [Amazon Elastic Kubernetes Service ](<https://www.amazonaws.cn/eks/>)的过程中，我们经常会遇到一类典型场景：我们的集群运行了一段时间，Pod 偶尔调度失败、DNS 解析变慢、节点资源看起来还有余量但新 Pod 就是起不来。一线工程师提交问题工单时，往往只能描述表象，而根因可能藏在[Amazon VPC](<https://aws.amazon.com/cn/vpc/>) CNI 的 IP 预热策略、CoreDNS 的 ndots 配置、或者节点组跨 AZ 分布不均等多个因素的组合中。

一位资深的 EKS 工程师排查这类问题，通常需要执行 20 多条kubectl和aws cli命令，逐一检查节点状态、Pod 事件、安全组规则、子网 IP 余量、HPA 配置等。这个过程耗时 2-3 小时，且高度依赖个人经验 —— 不同工程师检查的维度和深度差异很大。

市面上已有一些静态扫描工具（如 kube-score、kubepug），但它们的局限性也很明显：这些工具仅兼容通用 K8s 集群，原生不支持 EKS 的特有配置检查（如节点组、VPC CNI、EKS Access Entry 等），目前市面上也没有专门针对 EKS 集群的健康扫描方案。此外还有以下不足：

  * 规则是固定的，无法根据集群的业务特征（在线服务 vs 批处理、是否使用 Spot 实例）做场景化判断
  * 各规则独立运行，无法发现”单 AZ 部署 + 无 PDB + CoreDNS 副本不足”这类组合风险
  * 输出是通过/不通过，缺乏对”为什么这是个问题”和”具体怎么修”的解释



这促使我们思考：能否构建一个平台，把资深工程师的诊断经验编码为确定性规则，再用大模型补足规则覆盖不到的关联分析和场景化判断？进一步地，能否让 AI Agent 在生成诊断报告时，主动从集群中补充采集实时数据（Pod 状态、事件、指标等），使得最终输出的分析结论更加全面和可信？

基于这个思路，我们构建了这个 [Amazon EKS](<https://aws.amazon.com/cn/eks/>) 集群智能健康诊断 SaaS 平台。本文将详细介绍其架构设计、核心能力，以及如何通过 Amazon EKS MCP Server 实现 Agent 的自主深度诊断。

## **二、平台功能概览**

这个 SaaS 平台的核心定位是：面向 Amazon EKS 用户的 AI 驱动集群健康诊断平台。用户只需在 Web 页面填写集群信息（Role ARN、集群名称、Region），点击”开始扫描”，即可在 2-5 分钟内获得一份包含 AI 深度分析的 HTML 健康体检报告。

### 2.1 六维度健康评估

平台内置 32 条检查规则，覆盖 EKS 集群运维的六个核心维度：

维度 | 维度  
---|---  
基础架构 | 节点组实例类型多样性、自动伸缩组件（Karpenter/CA）、Amazon EKS 版本生命周期  
网络 | VPC CNI 参数调优、CoreDNS ndots 配置、NodeLocal DNSCache、子网 IP 余量  
安全合规 | API Server 端点访问模式、审计日志、Secrets 加密、Pod Identity/IRSA 使用  
应用适配性 | Pod 探针配置、资源 Request/Limit、PDB 配置、Spot 中断处理  
存储 | gp2 → gp3 迁移、StorageClass 回收策略、EBS CSI Driver 版本  
API 兼容性 | 废弃 API 检测（150+ 条记录），类似 kubepug 但集成在完整流程中  
  
### 2.2 AI 深度分析

静态规则扫描完成后，平台将检查结果的结构化摘要传入大模型（支持通义千问、MiniMax、DeepSeek 等多种后端），生成如下内容：

  * 整体分析：用自然语言解读集群的整体健康状况和关键风险
  * 关联风险分析：识别多个配置项组合产生的复合风险（如”单 AZ + 无 PDB = 单点故障”）
  * 个性化修复建议：引用具体资源名称，给出可直接执行的 kubectl 命令或 YAML 配置的建议
  * 改进路线图：按优先级排列的修复步骤



### 2.3 Agent 自主深度诊断

在静态规则和 AI 总结之上，平台引入了基于 Amazon EKS MCP Server 的自主分析 Agent。Agent 不仅阅读基础扫描报告，还能通过 MCP 协议实时访问集群资源——查看 Pod 事件、读取日志、获取 [Amazon CloudWatch](<https://www.amazonaws.cn/cloudwatch/>) 指标，——对疑似问题进行二次自动探查与根因分析。这是本平台区别于传统扫描工具的核心差异化能力，后文将详细展开。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/22/build-ai-eks-cluster-diagnosis-saas-platform-1.png>) [图1]  
---  
  
## **三、整体架构：异步事件驱动**

本平台采用 [Amazon Elastic Container Service ](<https://www.amazonaws.cn/ecs/>) 搭配 [Amazon Fargate](<https://www.amazonaws.cn/fargate/>)，以及 [Amazon Simple Queue Service](<https://www.amazonaws.cn/sqs/>) 的异步事件驱动模式，将 API 接入层和扫描执行层彻底解耦。

### 3.1 架构组件

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/22/build-ai-eks-cluster-diagnosis-saas-platform-2.png>) [图2]  
---  
  
其中 Scan Worker 流程图如下：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/22/build-ai-eks-cluster-diagnosis-saas-platform-3.png>) [图3]  
---  
  
### 3.2 请求生命周期

一次完整的扫描请求经历以下阶段：

  1. 提交请求：用户在 Web 前端填写集群信息，点击”开始扫描”。前端调用POST /scans，API Service 生成唯一的scan_id，将任务消息发送到 SQS Scan Queue，同时在 [Amazon DynamoDB](<https://aws.amazon.com/cn/dynamodb/>) 中创建一条状态为queued的记录，立即返回scan_id给前端。
  2. 异步执行：Scan Worker 通过 SQS 长轮询（WaitTimeSeconds=20）获取任务消息。拿到消息后，先将 DynamoDB 状态更新为 running，然后执行完整的六步流水线。
  3. 状态轮询：前端每 5 秒调用GET /scans?scan_id=xxx查询状态。当状态变为completed时，响应中包含报告的 Amazon Simple Storage Service 预签名 URL。
  4. 查看报告：用户点击链接，浏览器直接从 S3 加载 HTML 报告。预签名 URL 有效期 1 小时。



这个设计带来几个关键优势：

  * 无超时限制：Scan Worker 运行在 ECS Fargate 上，没有 [Amazon Lambda](<https://www.amazonaws.cn/lambda/>) 的 15 分钟限制，Agent 深度分析可以从容执行多轮工具调用
  * 天然并发控制：SQS 的 VisibilityTimeout 机制确保同一任务不会被重复处理；多个 Scan Worker 实例可以并行消费队列
  * 失败重试：如果 Worker 处理失败（不删除 SQS 消息），消息会在 VisibilityTimeout 过期后重新可见，自动触发重试
  * 按账号隔离：owner_id从用户的 Role ARN 中提取 12 位 Amazon Web Service 账号 ID，DynamoDB 的 GSI 确保用户只能查看自己账号的扫描记录



### 3.3 跨账号安全访问

SaaS 模式下，平台需要访问用户的 EKS 集群。我们采用标准的跨账号 Amazon Security Token Service 的 AssumeRole 方案：

  * 用户在自己的账号中创建一个只读 [Amazon Identity and Access Management ](<https://www.amazonaws.cn/iam/>) Role，Trust Policy 允许平台部署方账号 AssumeRole，并配置 ExternalId 防止 confused deputy 攻击。
  * 用户在集群中创建只读 ClusterRole + ClusterRoleBinding，通过 EKS Access Entry 将 IAM Role 映射到 K8s RBAC。
  * Scan Worker 通过 STS 获取 15 分钟有效的临时凭证，全程只读访问，不做任何写操作。



整个用户端配置约 10 分钟一次性完成，我们可以通过一键配置脚本customer_setup.sh自动创建所有必要的 IAM 和 K8s 资源。

## **四、核心能力：结合 Amazon EKS MCP Server 的 AI 自主诊断**

静态规则扫描能覆盖已知的最佳实践偏差，AI 总结能做关联分析和自然语言解读。但两者都有一个共同的局限：它们只能分析开发者预先编码的固定数据集。

既然原有的流水线已经在调用 K8s API 收集集群数据，引入 MCP Server 是否显得有些多余？

这背后的关键差异，其实是“被动采集”与“主动探索”的区别。关键不再是“我们预先采集了什么”，而是“谁在主导下一步的采集”：

  * ConfigScanner（硬编码采集）：开发者在代码中预先定义了要采集的资源类型——Nodes、Pods、Deployments、HPA、安全组等。无论集群实际存在什么问题，采集的数据范围都是固定的。AI 只能在这个固定数据集上做分析。
  * Agent + MCP Server（AI 按需采集）：AI 读完静态扫描结果后，自主判断需要补充哪些数据。比如静态扫描发现 CoreDNS ndots=5，AI 可以自己决定去查 CoreDNS Pod 的 CPU 使用率和最近的事件，来判断 DNS 查询放大是否已经造成实际影响 —— 这个”查 CoreDNS CPU”的决策不是开发者预先写在代码里的。



换句话说，MCP Server 的价值不在于”能访问集群”（ConfigScanner 也可以实现），而在于让 AI 获得了灵活的、按需的集群数据访问能力。开发者不需要为每种可能的分析路径都预先编写采集逻辑，AI 通过标准化的 MCP 工具接口自行决定需要看什么。这使得诊断报告的深度不再受限于开发者的预设，而是由 AI 根据实际发现的问题动态扩展。

### 4.1 什么是 MCP（Model Context Protocol）

MCP 是一种开放协议，定义了 AI 模型与外部工具之间的标准化通信方式。简单来说，它让大模型能够”调用工具” —— 不是通过硬编码的 API 调用，而是通过一个标准化的协议层，模型可以发现可用工具、理解工具的输入输出 schema、决定何时调用哪个工具、并处理工具返回的结果。

[Amazon EKS MCP Server](<https://awslabs.github.io/mcp/servers/eks-mcp-server>)是 Amazon Web Service官方开源的 MCP Server 实现，它为 AI 模型提供了对 EKS 集群的资源管理工具和实时状态可见性。关键能力包括：

  * Kubernetes 资源管理：list/get/describe 各类 K8s 资源（Pods、Deployments、Services、Nodes 等）
  * 日志和事件获取：读取 Pod 日志、获取资源相关的 K8s Events
  * [Amazon CloudWatch](<https://aws.amazon.com/cn/cloudwatch/>) 集成：查询 Container Insights 指标（CPU/Memory 使用率、网络流量等）
  * EKS Insights：获取 EKS 集群的配置洞察和升级就绪性评估
  * 故障排查知识库：搜索 EKS 故障排查指南



### 4.2 Agent 的工作流程

在 Scan Worker 的六步流水线中，Agent 深度分析是第五步（AgentAnalyzer）。它的执行逻辑如下：
    
    
    # services/scan_worker/main.py 中的流水线（这里做了简化）
    # Step 1-3: 静态扫描 + 规则检查 + AI 总结
    config = scanner.scan()
    results = engine.run(config)
    recommendations = analyzer.analyze(results, config)
    # Step 4: Agent 深度分析
    agent_analyzer = AgentAnalyzer(
        cluster_name=cluster_name,
        region=region,
        role_arn=role_arn,          # 用户 IAM Role
        external_id=external_id,
        ai_provider="openai",
    )
    agent_narrative = agent_analyzer.analyze(
        static_report_summary=static_summary,  # 前三步的结果摘要
        customer_prompt=prompt,                # 用户在提交扫描时填写的关注点（可选）
    )
    

其中customer_prompt是用户在 Web 前端提交扫描请求时可以选填的一段文字，用来告诉 Agent 自己特别关注的方向（例如”最近 Pod 调度经常失败”）。Agent 会据此调整数据采集的侧重点。如果用户不填，Agent 则按自己的判断全面分析。这段提示词只影响 Agent 的采集方向，不会干预静态规则扫描和 AI 总结的内容。

AgentAnalyzer.analyze()内部的执行步骤：

  1. 获取凭证：通过 STS AssumeRole 获取用户集群的临时凭证（15 分钟有效）
  2. 启动 Amazon EKS MCP Server：将临时凭证通过环境变量注入给 Amazon EKS MCP Server 子进程，通过 JSON-RPC over stdio 完成协议握手，获取可用工具列表
  3. 构建 Agent：创建 ChatAgent 实例，传入 MCP 工具定义。ChatAgent 支持OpenAI 兼容 API，在调用 LLM 时自动将工具定义转换OpenAI 的 function calling
  4. 自主分析循环：Agent 阅读静态扫描摘要，自主决定需要调用哪些 MCP 工具来进一步调查，自动执行多次工具调用（最多 10 次），全程无需用户介入，最终生成深度分析报告
  5. 断开连接：终止Amazon EKS MCP Server 子进程，释放资源



AgentAnalyzer.analyze()数据流程图：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/22/build-ai-eks-cluster-diagnosis-saas-platform-4.png>) [图4]  
---  
  
### 4.3 MCP 协议带来的灵活性：从’固定采集’到’按需探查’

传统方式下，如果要让大模型”看到”集群状态，需要在代码中硬编码数据采集逻辑——提前决定采集哪些数据、以什么格式传给模型。这意味着模型只能分析开发者预设的数据，无法根据实际情况灵活调整。

MCP 协议改变了这个范式。通过标准化的工具发现和调用机制，模型可以：

  * 按需采集：静态扫描发现某个节点组的 Pod 重启次数异常高，Agent 可以主动调用get_pod_logs查看具体的错误日志，或调用get_k8s_events查看相关事件
  * 逐步深入：先用list_k8s_resources获取概览，发现异常后用manage_k8s_resource（read 操作）获取详情，再用get_cloudwatch_metrics查看历史趋势
  * 跨维度关联：发现 DNS 查询延迟高后，Agent 可以同时查看 CoreDNS Pod 的资源使用率和节点的网络指标，判断是 CoreDNS 本身过载还是底层网络问题



以下是 Agent 与 MCP Server 交互的一个实际示例（这里做了简化）：
    
    
    # Agent 的思考过程（由 LLM 驱动）：
    # "静态扫描显示 CoreDNS ndots=5，我需要确认 CoreDNS Pod 的实际负载情况"
    # Agent 调用 MCP 工具 1: 列出 CoreDNS Pod
    → list_k8s_resources(cluster_name="eks-nx09", kind="Pod",
                         namespace="kube-system", label_selector="k8s-app=kube-dns")
    # Agent 调用 MCP 工具 2: 获取 CoreDNS Pod 的事件
    → get_k8s_events(cluster_name="eks-nx09", kind="Pod",
                     name="coredns-xxx", namespace="kube-system")
    # Agent 调用 MCP 工具 3: 查看 CloudWatch 指标
    → get_cloudwatch_metrics(cluster_name="eks-nx09",
                             metric_name="pod_cpu_utilization",
                             namespace="ContainerInsights",
                             dimensions={"PodName": "coredns-xxx"})
    # Agent 综合分析后输出：
    # "CoreDNS 两个副本的 CPU 使用率持续在 70% 以上，结合 ndots=5 导致的
    #  额外 DNS 查询放大，建议：1) 将 ndots 调整为 2；2) 启用 NodeLocal DNSCache；
    #  3) 考虑将 CoreDNS 副本数从 2 增加到 4"
    

### 4.4 中国区适配

Amazon EKS MCP Server 目前原生不支持 Amazon Web Service中国区（默认使用全球区域的 STS 端点和分区配置）。在本项目中，我们对 Amazon EKS MCP Server 进行了适配修改，使其能够识别中国区 Region（cn-north-1 / cn-northwest-1），自动使用正确的中国区 STS 端点（sts.cn-northwest-1.amazonaws.com.cn）和 aws-cn 分区生成 Kubernetes API 的 Bearer Token。具体实现上，通过环境变量 AWS_REGION=cn-northwest-1 注入给 Amazon EKS MCP Server 子进程，修改后的 Server 会根据 Region 前缀判断分区并选择对应的端点。

Amazon EKS MCP Server项目链接（不支持中国区）：

<https://awslabs.github.io/mcp/servers/eks-mcp-server>

<https://github.com/awslabs/mcp/tree/main/src/eks-mcp-server>

### 4.5 凭证安全设计

Agent 访问用户集群的凭证链路经过精心设计：

  1. Scan Worker 通过 STS AssumeRole 获取用户集群的临时凭证（有效期 15 分钟）
  2. 临时凭证通过环境变量（AWS_ACCESS_KEY_ID、AWS_SECRET_ACCESS_KEY、AWS_SESSION_TOKEN）注入给Amazon EKS MCP Server 子进程
  3. Amazon EKS MCP Server 使用这些凭证访问用户的 EKS 集群，受限于用户配置的只读 ClusterRole
  4. 扫描完成后，Amazon EKS MCP Server 子进程被终止，凭证随进程消亡；即使不终止，15 分钟后凭证也会自动过期



整个过程中，用户的凭证不会被持久化到磁盘或数据库，仅存在于进程内存中。

## **五、Scan Worker 流水线详解**

Scan Worker 是整个平台的计算核心，作为独立的 ECS Service 运行，从 SQS 长轮询获取任务后执行六步流水线。下面逐步拆解每个阶段的实现。

### 5.1 Step 1: STS AssumeRole — 获取客户集群凭证

Scan Worker 拿到 SQS 消息后，第一步是通过 STS AssumeRole 获取客户集群的临时凭证（有效期 15 分钟）。这些凭证用于后续所有对客户 K8s API 和 Amazon Web Service API 的访问。

### 5.2 Step 2: ConfigScanner — 集群配置采集

ConfigScanner 负责通过 K8s API 和 Amazon Web Service API 采集集群的全量配置数据。在 SaaS 模式下，它先通过 STS AssumeRole 获取临时凭证，然后用这些凭证初始化 K8s 客户端和 Amazon Web Service 客户端。采集的数据包括：

  * K8s 层：Nodes、Pods、Deployments、DaemonSets、HPA、PDB、Services、ConfigMaps、ServiceAccounts、Ingresses、NetworkPolicies、StorageClasses
  * Amazon Web Service 层：EKS 集群配置、节点组详情（实例类型、容量类型、AZ 分布）、子网信息、安全组规则



### 5.3 Step 3: CheckEngine — 确定性规则检查

CheckEngine 对采集到的配置数据执行 32 条预定义规则。每条规则输出：通过/不通过、风险等级（Critical/Warning/Info）、当前值、建议值、涉及的具体资源列表。这一步是零幻觉的——规则逻辑是确定性的代码，不依赖 AI 推理。

### 5.4 Step 4: AIAnalyzer — 大模型智能分析

AIAnalyzer 将 CheckEngine 的结果进行智能聚合（不是把原始数据全部丢给模型，而是提取关键摘要），然后调用大模型生成叙述性分析。这里有一个关键的工程细节：信息降噪。

一个 200 节点集群的原始 Node 列表可能有 30,000 tokens，但我们只传”节点数: 200, 实例类型: m5.large, t3.medium”（约 50 tokens）。对于 500 个缺少探针的 Pod，我们传”500 个容器缺少探针 + 前 15 个示例名称”（约 200 tokens）。这种先用规则引擎做信息降噪、再让 AI 做深度分析的分层策略，既控制了 token 成本，又保证了分析质量。

### 5.5 Step 5: AgentAnalyzer — MCP Agent 深度分析

这是本平台的差异化核心，已在第 4 节详细介绍。Agent 基于前三步的结果，自主决定需要进一步调查的方向，通过 MCP 工具实时采集数据，生成静态规则覆盖不到的深度洞察。

### 5.6 Step 6: HtmlRenderer — 报告生成

最终，所有分析结果（规则检查明细、AI 叙述性分析、Agent 深度分析）被整合为一份结构化的 HTML 报告，包含：

  * 执行摘要（评分仪表盘、关键指标）
  * 六维度评分雷达图
  * 检查项明细表格（可按维度和风险等级筛选）
  * AI 深度分析章节（整体分析 + 关联风险 + 改进路线图）
  * Agent 深度分析章节（实时数据采集结果 + 根因分析 + 具体建议）
  * 问题资源详情（可折叠列表）



报告上传到 S3 后，通过预签名 URL 提供给用户访问。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/22/build-ai-eks-cluster-diagnosis-saas-platform-5.png>) [图5]  
---  
  
## **六、功能演示 Walkthrough**

以下是一次完整的扫描流程演示，目标集群为eks-nx09（cn-northwest-1 区域）。

### 6.1 配置 AI 后端

进入 Web 前端的”AI 配置”页面，选择 AI Provider（本次演示使用通义千问），填入 API Key 和 Base URL。配置保存在浏览器本地，不会上传到服务端。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/22/build-ai-eks-cluster-diagnosis-saas-platform-6.png>) [图6]  
---  
  
### 6.2 提交扫描请求

回到”集群扫描”页面，填写：
    
    
    Role ARN：arn:aws-cn:iam::xxxxxxxxxxxx:role/EksHealthCheckReadOnly
    External ID：a12a227a-602e-4fca-a46c-yyyyyyyyyyyy
    集群名称：eks-test-cluster
    区域：cn-northwest-1
    

点击”开始扫描”后，前端立即收到scan_id和status: queued的响应，页面进入轮询状态。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/22/build-ai-eks-cluster-diagnosis-saas-platform-7.png>) [图7]  
---  
  
### 6.3 扫描执行过程

在 ECS Task 后台，Scan Worker 的日志显示流水线的执行进度（下面的日志时间上是倒序的，其中还删除了一些不关键的 INFO 日志）：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/22/build-ai-eks-cluster-diagnosis-saas-platform-8.png>) [图8]  
---  
  
### 6.4 查看报告

前端轮询到 status: completed 后，”扫描结果”页面显示评分概览和报告链接。点击”查看完整 HTML 报告”，浏览器打开一份结构化的健康体检报告。

报告中值得关注的几个亮点：

  * 检查项明细表：清晰列出每条未通过规则的 ID、维度、风险等级、当前值和建议值
  * AI 深度分析章节：大模型对所有未通过项做了关联分析，指出”9 个节点组均使用单一实例类型”与”未检测到自动伸缩组件”的组合意味着集群在实例类型容量不足时没有 fallback 能力

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/22/build-ai-eks-cluster-diagnosis-saas-platform-9.png>) [图9]  
---  
  
  * Agent 深度分析章节：Agent 通过 MCP 工具实时查看了 CoreDNS Pod 的状态和节点事件，确认了 ndots=5 导致的 DNS 查询放大问题，并给出了包含具体 kubectl edit 命令的修复步骤

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/22/build-ai-eks-cluster-diagnosis-saas-platform-10.png>) [图10]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/22/build-ai-eks-cluster-diagnosis-saas-platform-11.png>) [图11]  
---  
  
### 6.5 扫描历史

在”扫描历史”页面，可以查看该账号下所有历史扫描记录，包括扫描时间、集群名称、状态和报告链接。这为定期体检和趋势对比提供了基础。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/22/build-ai-eks-cluster-diagnosis-saas-platform-12.png>) [图12]  
---  
  
## **七、部署与体验**

本平台的部署代码及容器镜像定义均已工程化封装，以下展示部署流程供参考，帮助读者理解整体部署步骤。

整体部署包含以下容器化服务：

服务 | 说明  
---|---  
API | 接收扫描请求，管理扫描生命周期  
Scan Worker | 执行集群健康检查扫描  
Chat Worker | 基于报告的多轮对话 Agent  
Frontend | 前端控制台  
  
### 7.1 一键部署（AWS Cloud Development Kit）
    
    
    # 下载并解压代码
    # 直接点击下载 eks_health_check 源码压缩包 放到终端中，然后在终端中执行以下命令来解压：
    unzip eks_health_check-main.zip -d eks_health_check
    cd eks_health_check
    # 预装 Amazon EKS MCP Server 依赖（Scan Worker 容器内执行）
    bash mcp/setup_mcp_venv.sh
    # 部署后端基础设施（ECS + SQS + DynamoDB + S3）
    cd infra
    python -m venv .venv && source .venv/bin/activate
    pip install -r requirements.txt
    cdk bootstrap
    # 使用如下三种方式部署
    ## 最简部署（自动创建 VPC，HTTP 监听器）
    cdk deploy
    ## 使用已有 VPC 和子网
    cdk deploy \
      -c vpc_id=vpc-0123456789abcdef0 \
      -c subnet_ids='["subnet-aaa","subnet-bbb","subnet-ccc"]'
    ## 对于使用 https 和权限边界的场景
    cdk deploy \
      -c vpc_id=vpc-0123456789abcdef0 \
      -c subnet_ids='["subnet-aaa","subnet-bbb"]' \
      -c certificate_arn=arn:aws-cn:acm:cn-north-1:123456789012:certificate/xxx \
      -c environment=prod \
      -c permissions_boundary_arn=arn:aws-cn:iam::123456789012:policy/BoundaryPolicy
    

### 7.2 用户端配置

在用户账号中执行一键配置脚本

export EHC_SAAS_ACCOUNT_ID=<服务方账号ID>

./scripts/customer_setup.sh setup

脚本会自动创建只读 IAM Role、K8s ClusterRole + ClusterRoleBinding、EKS Access Entry，并输出需要填入 Web 前端的 Role ARN 和 External ID。 scripts/customer_setup.sh 脚本支持如下多种参数，以满足不同场景的要求：
    
    
    --region <REGION>            AWS 区域（默认: cn-north-1）
    --role-name <NAME>           IAM Role 名称（默认: EksHealthCheckReadOnly）
    --external-id <ID>           ExternalId（默认: 自动生成 UUID）
    --permissions-boundary <ARN> Permissions Boundary ARN（满足安全合规要求）
    --account-id <ID>            您的 AWS 账号 ID（默认: 自动从 STS 获取）
    

## **八、总结与展望**

本文介绍了一个面向 Amazon EKS 用户的 AI 驱动集群健康诊断 SaaS 平台。它的核心设计理念是分层分析：

1\. 确定性规则层：32 条检查规则提供零幻觉的基线检查，覆盖已知的最佳实践偏差

2\. AI 总结层：大模型对规则检查结果做关联分析和场景化判断，生成人类可读的深度解读

3\. Agent 自主诊断层：通过Amazon EKS MCP Server，Agent 能像真正的工程师一样主动采集实时数据，对疑似问题进行二次探查和根因分析

在架构层面，SQS + ECS Fargate 的异步解耦设计确保了平台的可靠性和并发能力，跨账号 STS AssumeRole 方案保障了安全性。

后续我们计划在以下方向继续演进：

  * 定时扫描与趋势对比：通过 [Amazon EventBridge](<https://docs.amazonaws.cn/eventbridge/latest/userguide/>) 定时触发扫描，对比不同时间点的健康评分变化
  * AI 预评估规则适用性：扫描前让 AI 根据集群特征动态跳过不适用的规则（如使用 Karpenter 的集群跳过节点组多样性检查）
  * 运行指标集成：采集 CloudWatch Metrics / Prometheus 的运行时指标，让 AI 从”配置是否合理”升级为”配置是否匹配实际负载”



**下一步行动：**

**相关产品：**

  * [Amazon EKS](<https://aws.amazon.com/cn/eks/?p=bl_pr_eks_l=1>) — 托管式 Kubernetes 服务
  * [Amazon ECS](<https://aws.amazon.com/cn/ecs/?p=bl_pr_ecs_l=2>) — 完全托管的容器编排服务
  * [Amazon SQS](<https://aws.amazon.com/cn/sqs/?p=bl_pr_sqs_l=3>) — 托管式消息队列
  * [Amazon IAM](<https://aws.amazon.com/cn/iam/?p=bl_pr_iam_l=4>) — 身份管理和访问权限
  * [Amazon S3](<https://aws.amazon.com/cn/s3/?p=bl_pr_s3_l=5>) — 适用于 AI、分析和存档的几乎无限的安全对象存储



**相关文章：**

  * [基于 Amazon Bedrock AgentCore Runtime 部署 Apache Doris MCP Server为 Quick Suite 等 AI 客户端提供原生数据分析能力](<https://aws.amazon.com/cn/blogs/china/runtime-deploy-apache-doris-mcp-server-quick-suite-ai-analytics/?p=bl_ar_l=1>)
  * [在 Amazon EKS 上构建安全的 AI Agent 沙箱](<https://aws.amazon.com/cn/blogs/china/amazon-eks-build-security-ai-agent/?p=bl_ar_l=2>)
  * [Amazon EFS 目录级配额监控：多租户 SaaS方案](<https://aws.amazon.com/cn/blogs/china/amazon-efs-monitoring-multi-tenant-saas-solution/?p=bl_ar_l=3>)
  * [在Amazon EKS上部署OpenClaw AI Agent：基于Kata Containers的企业级沙箱实践](<https://aws.amazon.com/cn/blogs/china/deploying-openclaw-ai-agent-on-amazon-eks/?p=bl_ar_l=4>)
  * [让 Amazon Quick 操作飞书：构建远程 MCP 服务的设计实践](<https://aws.amazon.com/cn/blogs/china/amazon-quick-build-mcp-service-design-practice/?p=bl_ar_l=5>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 张旭

西云数据技术支持工程师，拥有10+年复杂问题的解决经验，精通 Amazon EKS、Amazon code 系列等亚马逊云科技服务，擅长在 DevOps 领域为客户解决各种疑难问题。

### 张星晨

西云数据技术支持工程师，专注于亚马逊云容器化解决方案，在 Amazon EKS、Amazon ECS 等领域具备丰富的实践经验，擅长容器领域的架构设计与故障排查，致力于深度技术实践，助力企业构建高可靠、可扩展的现代化容器平台。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
