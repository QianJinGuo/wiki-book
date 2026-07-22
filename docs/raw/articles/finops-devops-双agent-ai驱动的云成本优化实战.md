sha256: 7c91ea3a28ef0ee0245ab90a1f49faf5223e54f1269050ff7af6bc77db73d86b
---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/finops-devops-agent-ai-cost-optimize/
ingested: 2026-06-29
feed_name: AWS China Blog
source_published: 2026-06-29T02:12:19Z
---

# FinOps + DevOps 双Agent — AI驱动的云成本优化实战

摘要：本文通过一个FinOps云财务管理案例，展示如何利用 AI Agent 协作实现端到端的 AWS 云成本优化闭环：从费用异常发现、根因分析、运行时验证到安全清理，两个 Agent 各司其职、无缝衔接，最终为节省每月 约$4,100 的不必要支出。  
  
**目录**

01 1\. 背景：AI Agent 时代的 FinOps 新范式

02 2\. 案例概述：一次意外的发现

03 3\. 第一阶段：FinOps Agent — 费用异常发现与深度分析

04 4\. 协作交接：从分析到执行的桥梁

05 5\. 第二阶段：DevOps Agent — 验证、审计与执行

06 6\. 成果总结

07 7\. 技术洞察与最佳实践

08 8\. 结束语

* * *

## **1\. 背景：AI Agent 时代的 FinOps 新范式**

### 1.1 FinOps 的”最后一公里”难题

在 FinOps 实践中经常面临一个尴尬的局面：

  * 发现问题容易 — Cost Explorer、Budgets 等工具能快速定位费用异常
  * 定位根因难 — 费用数据只能告诉你”花了多少钱”，但无法回答”为什么在花钱”
  * 安全执行更难 — 即使确认了浪费，清理时还需要评估依赖关系、避免影响生产系统



传统做法是：FinOps 团队发现异常 → 提工单给运维团队 → 运维排查确认 → 审批后执行清理。这个流程往往需要数天甚至数周，期间费用持续产生。

### 1.2 AWS 的新武器：FinOps Agent 与 DevOps Agent

随着 AI 技术的快速发展，AWS 在 2026 年陆续发布了两款 Frontier Agent，为云成本优化带来了全新的可能：

AWS FinOps Agent（2026年6月 Preview）— 一款面向 FinOps 从业者和工程团队的 AI 代理，能够：

  * 回答成本相关问题，提供即时费用洞察
  * 自动调查成本异常，关联 CloudTrail 事件定位根因
  * 发现优化机会，生成可执行的建议
  * 按自定义计划运行定期 FinOps 工作流
  * 将结果推送到 Jira 或 Slack



[AWS DevOps Agent](<https://aws.amazon.com/cn/devops-agent/>)（2026年3月 GA）— 一款始终在线的自主运维工程师，能够：

  * 自动关联跨工具链的运维数据（指标、日志、代码部署）
  * 解决并主动预防事件
  * 优化应用可靠性和性能
  * 处理跨 AWS、多云和本地环境的按需 SRE 任务
  * 支持 3-5 倍更快的事件解决速度



本文将展示一种新的范式：FinOps Agent + DevOps Agent 协作，将整个成本优化流程从”天级”压缩到”小时级”，并确保每一步都有充分的验证和安全保障。

## **2\. 案例概述：一次意外的发现**

某云管理员负责企业内大量AWS账户的管理成本与运维管理，在 AWS FinOps Agent 发布 Preview 的第一时间，在作者所在的亚马逊云科技的支持下展开试用。本想只是简单体验一下新功能，没想到 Agent 在几分钟内就揪出了一个隐藏了 18 个月的”成本黑洞”——3 个区域的 SageMaker Canvas 会话在无人使用的情况下 24/7 空转，每月占用4100美元。

更有意思的是，当 FinOps Agent 触达自身能力边界时，它主动生成了一份结构化的排查清单，引导作者无缝切换到 DevOps Agent 完成验证和清理。整个过程就像两位专家接力赛跑——一位负责”发现问题”，另一位负责”解决问题”。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/25/finops-devops-agent-ai-cost-optimize-1.png>) [图1]  
---  
项目 | 详情  
---|---  
发现时间 | 2026年6月  
问题根因 | 3个区域的 SageMaker Canvas 会话 24/7 空闲运行  
涉及区域 | us-east-1, us-west-2, ap-southeast-1  
月度浪费 | ~$4,100  
清理资源 | 3 Canvas Apps, 3 Domains, 3 EFS, 3 EMR Serverless, 6 S3 桶, 8 IAM Roles  
  
## **3\. 第一阶段：FinOps Agent — 费用异常发现与深度分析**

### 3.1 费用全景扫描

AWS FinOps Agent 刚刚发布 Preview，决定用一个测试账号来测试它的分析能力。第一步，先让它对当月费用做一次全面体检：

》提示词

分析我本月的 AWS 费用情况，按服务维度展示 Top 10 的费用分布

设计意图：用自然语言发起分析，让 Agent 自行决定展示维度和粒度

FinOps Agent 立即返回了结构化的费用概览。为了更直观地理解数据，进一步要求可视化展示：

》提示词

请以图表形式展示，包含关键指标卡片和服务费用分布

设计意图：触发 Agent 的可视化能力，生成包含 KPI 卡片、柱状图、饼图的完整报表

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/25/finops-devops-agent-ai-cost-optimize-2.png>) [图2 FinOps Agent 费用总览报表]  
---  
  
关键发现：

  * MTD 总花费：$4,211.96（日均 $351）
  * 月度预测：按当前趋势将达到 ~$10,530
  * Top 1 服务：[Amazon SageMaker](<https://aws.amazon.com/cn/sagemaker/>)，占比 36%（$1,515）
  * 其他主要服务：EC2（16.4%）、Bedrock（9.9%）、Glue（7.5%）



SageMaker 以绝对优势占据费用榜首，这立即引起了警觉——最近并没有在 SageMaker 上运行任何训练任务。

### 3.2 SageMaker 深度下钻

》 提示词

SageMaker 费用异常偏高，请深入分析其费用构成和根因

设计意图：从”是什么”到”为什么”，引导 Agent 进行根因分析

FinOps Agent 对 SageMaker 费用进行深度分析，发现了关键线索：

  * 费用来源：98.5% 来自 Canvas:Session-Hrs（Canvas 会话时长），共 $1,492.78
  * 运行模式：24/7 持续运行，从未关闭
  * 覆盖范围：3 个 AWS 区域费用几乎完全对称（各约 $497）
  * 日均费用：$138.84，完全稳定无波动

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/25/finops-devops-agent-ai-cost-optimize-3.png>) [图3 FinOps Agent 对 SageMaker Canvas 的深度分析]  
---  
  
接下来，追问了这个问题存在多久：

》提示词

这个 Canvas 费用是什么时候开始出现的？请展示历史趋势

设计意图：追溯历史，判断这是新问题还是长期积累

FinOps Agent 返回了 12 个月的历史趋势，结论令人震惊：

时间段 | 月费用 | 备注  
---|---|---  
2025-06 ~ 2025-07 | ~$2,800 | 2个区域运行  
2025-08 起 | ~$4,100-4,240 | 新增第3个区域  
累计至今 | $47,629 | 从未间断  
  
### 3.3 触达能力边界 — 协作的起点

这里出现了关键转折。当试图深入了解 Canvas 的运行时状态时：

》 提示词

这些 Canvas 会话当前在执行什么任务？是否有活跃的训练或推理作业？

FinOps Agent 诚实地回应：

FinOps Agent 回复（关键片段）

我可以看到费用数据显示 Canvas 会话在 3 个区域运行，但成本账单数据不包含 Canvas 会话正在执行什么任务的信息——那是运行时/操作数据，不是账单数据。

这是整个协作流程中最关键的时刻 — Agent 明确识别出自身的能力边界，而不是猜测或编造答案。

FinOps Agent 的能力边界表：

FinOps Agent 能做的 | FinOps Agent 不能做的  
---|---  
分析费用数据和趋势 |  查询 Canvas 运行时状态  
识别异常支出模式 |  确认是否有活跃任务  
计算历史累计成本 |  检查关联资源依赖  
生成优化建议 |  执行资源清理操作  
  
作者随即提出了协作的想法：

》提示词

我可以通过 DevOps Agent 来查询这些运行时信息吗？请帮我准备一份排查清单

FinOps Agent 的回应再次展示了清晰的边界意识：

〉FinOps Agent 回复（关键片段）

DevOps Agent 不在我的能力范围内 — 我专注于 AWS 成本和账单分析，没有连接到 SageMaker 运行时 API 或 CloudTrail 的工具。​如果你的环境中有配置 DevOps Agent，它应该能执行类似这样的查询…​需要我帮你准备一份给 DevOps 团队的问题清单，方便他们去排查吗？

作者确认后，FinOps Agent 生成了一份包含背景说明、CLI 命令、期望答案和处理建议的完整排查清单。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/25/finops-devops-agent-ai-cost-optimize-4.png>) [图4 FinOps Agent 生成的 DevOps 排查清单（含 CLI 命令）]  
---  
  
这种”知道自己不知道什么，并主动搭建协作桥梁”的能力，是 AI Agent 协作的基础。

### 3.4 再次确认只读边界

故事还有一个有趣的尾声。当在 DevOps Agent 完成排查后，回到 FinOps Agent 尝试执行删除：

》提示词

Canvas 资源已确认不再使用，请执行删除操作

〉FinOps Agent 回复

我需要说明一点：我是只读的 FinOps 成本分析工具，没有执行 AWS 资源删除操作的能力。

这不是 Agent 的”缺陷”，而是安全设计。 FinOps Agent 始终坚守只读边界，即使用户明确要求执行操作，也不会越权。

## **4\. 协作交接：从分析到执行的桥梁**

FinOps Agent 生成的排查清单，本质上是一份协作协议。它定义了：

FinOps Agent 输出 → DevOps Agent 输入  
---  
1\. 目标资源：3个区域的 Canvas 会话  
2\. 验证命令：aws sagemaker list-apps …  
3\. 决策条件：如果无活跃任务 → 可安全关闭  
4\. 预期收益：~$4,100/月  
5\. 风险提示：需确认无外部依赖  
  
这种结构化的交接方式，确保了信息的完整传递，避免了人工沟通中常见的信息丢失。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/25/finops-devops-agent-ai-cost-optimize-5.png>) [图5 FinOps Agent提供给DevOps Agent查询内容]  
---  
  
## **5\. 第二阶段：DevOps Agent — 验证、审计与执行**

### 5.1 运行时状态验证

》 提示词

请帮助检查 SageMaker Canvas 异常情况，下面是费用排查清单背景说明 账单数据显示 SageMaker Canvas 会话在 3 个区域持续 24/7 运行，从未关闭，累计费用已达 $47,629（2025年6月至今）。区域 月均费用 开始时间us-east-1 ~$1,400 2025年6月前（最早可查us-east-1 / us-west-2 / ap-southeast-1）us-west-2 ~$1,400 2025年6月前（最早可查）ap-southeast-1 ~$1,400 2025年8月中旬新增

设计意图：提供DevOps Agent中背景信息，对Canvas资源进行确认（直接复制了Finops Agent发现的信息进行查询）

DevOps Agent 先并行查询 3 个区域的 Canvas 应用状态，然后返回了确认结果

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/25/finops-devops-agent-ai-cost-optimize-6.png>) [图6 DevOps Agent检查结果]  
---  
  
### 5.2 确认Canvas上运行的任务类型

》提示词

请帮助检查 Canvas 上当前运行任务是什么

设计意图：通过DevOps Agent查询Canvas上是否在运行相关任务

结论：3 个 Canvas 会话完全空闲，只是保持 InService 状态持续计费，从未被实际使用。**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/25/finops-devops-agent-ai-cost-optimize-7.png>) [图7 DevOps Agent验证 Canvas运行状态]  
---  
  
### 5.3 创建溯源（CloudTrail 审计）

》 提示词

请检查这些 Canvas 资源的创建审计日志，包括创建时间、创建者和创建方式

设计意图：追溯责任人，理解资源创建的上下文

DevOps Agent 尝试追溯这些资源的创建者和创建方式：

区域 | Domain 创建时间 | Canvas 启动时间 | 创建方式  
---|---|---|---  
us-east-1 | 2023-12-17 | 2024-12-06 | Quick Setup 向导  
us-west-2 | 2024-12-06 | 2024-12-06 | Quick Setup 向导  
ap-southeast-1 | 2025-08-23 | 2025-08-23 | Quick Setup 向导  
  
关键发现：

  * 所有 Domain 命名遵循 `QuickSetupDomain-{timestamp}` 模式
  * 使用 IAM 认证模式，未绑定具体用户身份
  * User Profile 为默认配置（`default-{timestamp}`）



这揭示了一个常见的”便利陷阱”：Quick Setup 向导让创建 SageMaker 环境变得极其简单，但用户可能在探索后忘记关闭，导致持续计费。

### 5.4 关联资源全面扫描

》提示词

这些 Canvas 环境还关联了哪些其他 AWS 资源？请做一次全面扫描

设计意图：从”谁创建的”转向”影响范围有多大”，为清理做准备

这是 DevOps Agent 提供的核心价值之一 — 全面识别 Canvas 创建的所有关联资源：

资源类型 | 数量 | 状态 | 费用影响  
---|---|---|---  
EFS 文件系统 | 3 | 基本为空（最大 4.5MB） | 可忽略  
EMR Serverless 应用 | 3 | CREATED（空闲） | 无（空闲不计费）  
IAM Roles | 8 | 大部分从未使用 | 无（IAM 免费）  
IAM Policies | 3 | 附加在上述 Roles | 无  
S3 存储桶 | 6 | Canvas 工件存储 | 少量存储费  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/25/finops-devops-agent-ai-cost-optimize-8.png>) [图8]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/25/finops-devops-agent-ai-cost-optimize-9.png>) [图9 DevOps Agent 的关联资源扫描报告]  
---  
  
### 5.5 依赖关系与影响评估

接下来是整个流程中最关键的安全环节：

》提示词

我计划回收这个 Canvas 资源及其关联资源。请确认这些资源没有被其他系统或服务所依赖，确保回收操作不会对现有生产环境造成影响。

设计意图：一句话同时传达了目标（回收）、约束（不影响生产）和期望输出（依赖分析报告）。这是高质量提示词的典范 — 目标明确、边界清晰、输出可验证。

DevOps Agent 不仅识别了要删除的资源，还明确标注了不能删除的共享资源：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/25/finops-devops-agent-ai-cost-optimize-10.png>) [图10 DevOps Agent 不仅识别了要删除的资源，还明确标注了不能删除的共享资源]  
---  
  
进一步确认了与现有系统的独立性：

》 提示词

这套 Canvas 环境与我现有的 Notebook 实例是否存在关联？删除 Canvas 是否会影响 Notebook 的正常运行？

设计意图：确认 Canvas 与现有 Notebook 实例的关系，避免误删

独立确认结果：

  * Notebook 实例 SA0531pe — 与 Canvas Domain 完全独立，删除 Canvas 不受影响



### 5.6 生成清理脚本并执行

在充分了解风险后，先确认了哪些需要手动处理：

》提示词

有哪些资源需要手动删除？是因为技术限制无法自动删除，还是因为存在风险需要人工确认？

设计意图：区分”不能做”和”不应该做”，理解 Agent 的决策逻辑

确认安全后，给出了明确授权：

》提示词

确认无风险的资源请一并清理，生成完整的清理脚本

设计意图：在充分了解风险后才给出授权，而非盲目操作

DevOps Agent 生成了按依赖顺序排列的 8 步清理脚本：
    
    
    # Step 1: 删除 Canvas Apps（停止计费的关键步骤）
    # Step 2: 删除 JupyterServer App
    # Step 3: 删除 EMR Serverless Applications
    # Step 4: 删除 User Profiles
    # Step 5: 删除 Domains（含 EFS 自动清理）
    # Step 6: 删除 S3 桶
    # Step 7: 删除 IAM Roles（需先 detach policies）
    # Step 8: 删除 IAM Policies
    

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/25/finops-devops-agent-ai-cost-optimize-11.png>) [图11 DevOps Agent 生成的完整清理脚本]  
---  
  
脚本设计的几个亮点：

  1. 依赖顺序：先删 App → 再删 Profile → 最后删 Domain，避免依赖冲突
  2. 等待机制：关键步骤间加入 `sleep`，确保异步删除完成
  3. 安全边界：明确排除了共享资源（VPC/子网/KMS）
  4. 可选步骤：S3 桶标记为”确认无需保留数据后再删除”



### 5.7 执行后验证

DevOps Agent没有对环境进行删除的权限，作者通过运行DevOps Agent提供的CLI命令删除了相关资源。并对返回DevOps Agent进行删除后的验证工作

》提示词

脚本已执行完成，请重新扫描所有区域，确认资源已全部清理

设计意图：让 Agent 验证清理结果，形成闭环

DevOps Agent 再次扫描所有区域，确认清理完成：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/25/finops-devops-agent-ai-cost-optimize-12.png>) [图12 DevOps Agent 确认所有资源已清理完成]  
---  
  
## **6\. 成果总结**

### 6.1 财务影响

指标 | 金额  
---|---  
月度节省 | ~$4,100  
历史累计浪费 | ~$47,629  
  
### 6.2 清理资源清单

资源类型 | 数量  
---|---  
Canvas Apps | 3  
JupyterServer App | 1  
SageMaker Domains | 3  
EFS 文件系统 | 3  
EMR Serverless 应用 | 3  
User Profiles | 4  
S3 存储桶 | 6  
IAM Roles | 8  
IAM Policies | 3  
总计 | 34 个资源  
  
**下一步行动：**

**相关产品：**

  * [Amazon DevOps Agent](<https://aws.amazon.com/cn/devops-agent/?p=bl_pr_devops-agent_l=1>) — 解决和预防事故的代理
  * [Amazon SageMaker](<https://aws.amazon.com/cn/sagemaker/?p=bl_pr_sagemaker_l=2>) — 适用于所有数据、分析和 AI 的中心
  * [Amazon IAM](<https://aws.amazon.com/cn/iam/?p=bl_pr_iam_l=3>) — 身份管理和访问权限
  * [Amazon EMR](<https://aws.amazon.com/cn/emr/?p=bl_pr_emr_l=4>) — 轻松运行大数据框架
  * [Amazon EFS](<https://aws.amazon.com/cn/efs/?p=bl_pr_efs_l=5>) — 弹性文件存储



## **7\. 技术洞察与最佳实践**

### 7.1 SageMaker Canvas 的”隐性成本陷阱”

SageMaker Canvas 的计费模型是按会话运行时间计费（~$1.90/小时），而非按实际使用量。这意味着：

  * 即使没有训练任何模型，只要会话处于 InService 状态就会持续计费
  * Quick Setup 向导创建的环境默认不会自动关闭
  * 多区域部署会成倍放大这个问题



建议：定期审计 SageMaker Canvas/Studio 会话状态，对超过 7 天无活跃任务的会话设置自动告警。

### 7.2 Quick Setup 的”便利陷阱”

AWS Quick Setup 向导极大降低了服务使用门槛，但也带来了隐患：

  * 创建的资源命名为 `QuickSetupDomain-{timestamp}`，缺乏业务语义
  * 默认 User Profile 不绑定具体用户，难以追溯责任人
  * 关联创建大量辅助资源（EFS、EMR Serverless、IAM Roles），用户可能不知道它们的存在



建议：在组织层面通过 SCP（Service Control Policy）限制 Quick Setup 的使用，或要求必须添加 Owner 标签。

### 7.3 提示词设计的艺术 — 如何高效引导 Agent 协作

本案例中的提示词展示了几个关键技巧：

技巧 1：渐进式深入

“分析我本月的 AWS 费用情况”         –>全景扫描”SageMaker 费用异常偏高，请深入分析”  –> 聚焦根因”这个费用是什么时候开始出现的”         –> 历史追溯

不需要一次性给出完美指令，而是像与专家对话一样逐步深入。

技巧 2：在一句话中同时传达目标、约束和期望输出

“我计划回收这个Canvas资源，       <– 目标同时帮我确认下与其相关的资源       <– 范围并不被其他外部对象所使用。         <– 约束确保回收操作不会对现有生产环境造成影响。”       <– 安全边界

技巧 3：适时转向，不纠结于 Agent 的局限

“这个问题先放一边。现在看一下 Canvas 还关联了哪些其他资源”

当 Agent 在某个方向上无法提供更多信息时，果断转向更有价值的方向。

技巧 4：充分了解风险后再授权

“需要手动删除的，是技术限制还是存在风险？” <–先理解”确认无风险的资源请一并清理”             <–再授权

### 7.4 Agent 协作的设计哲学

本案例展示了一种有效的 AI Agent 协作模式：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/25/finops-devops-agent-ai-cost-optimize-13.png>) [图13]  
---  
  
核心设计原则：

  1. 关注点分离：分析归分析，执行归执行，各自专注擅长的领域
  2. 最小权限：FinOps Agent 只读，DevOps Agent 可写但需用户确认
  3. 结构化交接：通过排查清单传递上下文，避免信息丢失
  4. 人在回路：关键决策（是否删除）由人类做出，Agent 提供信息支撑



### 7.5 可复用的检查清单

基于本案例，建议将以下检查纳入定期 FinOps 审计：

  * 检查所有区域的 SageMaker Canvas/Studio 会话状态
  * 审计 Quick Setup 创建的资源（搜索 `QuickSetupDomain` 前缀）
  * 验证 EMR Serverless 应用是否有实际工作负载
  * 检查 IAM Roles 的最后使用时间，识别”僵尸角色”
  * 确认 EFS 文件系统的实际使用量
  * 审计跨区域重复部署的资源



## **8\. 结束语**

这个案例展示了 AI Agent 协作在云成本优化中的巨大潜力：

1\. 速度：从发现到清理完成，整个流程在数小时内完成，而非传统的数天

2\. 深度：Agent 能够进行多层次的分析（费用 → 服务 → 资源 → 依赖），远超人工排查的效率

3\. 安全：通过系统化的依赖分析和影响评估，确保清理操作不会影响生产系统

4\. 可追溯：整个过程有完整的对话记录，便于审计和知识沉淀

FinOps Agent 和 DevOps Agent 不是来替代人的，而是让人从繁琐的数据收集和命令执行中解放出来，专注于真正需要判断力的决策和治理。为什么本文发现浪费能持续 18 个月无人察觉？因为传统工具只能告诉你”花了多少”，却无法告诉你”为什么在花”。FinOps Agent + DevOps Agent 的协作，正是为了填补这个鸿沟。

云的复杂度只会越来越高，账单上的”黑洞”也不会自动消失。但有了 AI Agent 的协作，我们第一次有机会在问题变大之前就发现并解决它。让每一分云成本都有迹可查、有人负责——这才是 FinOps 真正该有的样子。

*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 倪晓峻

亚马逊云科技客户解决方案经理，负责帮助客户加速云计算旅程，参与项目管理、咨询与设计工作，具有超过十五年以上企业客户服务经验。在企业级解决方案，混合云架构，运营集成等领域有着广泛的实践经验。

### 李刚

亚马逊云科技客户解决方案经理，负责帮助企业客户加速云计算旅程，工作涵盖项目管理、技术咨询与架构设计。他拥有超过二十年的项目管理经验和企业客户服务经验，在项目管理、企业级解决方案、混合云架构及运营集成等领域有着广泛的实践经验。 擅长深入理解客户的业务需求，协调跨团队资源，帮助客户制定并执行长期云战略，同时确保安全合规和运营卓越。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
