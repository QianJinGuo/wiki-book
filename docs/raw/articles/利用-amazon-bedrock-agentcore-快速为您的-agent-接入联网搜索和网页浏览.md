---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/leveraging-amazon-bedrock-agentcore-quick
ingested: 2026-07-10
feed_name: AWS China Blog
source_published: 2026-07-10
sha256: 3c7528cfb0a1a0d075ac9aa965f5212880d0ff2577bbeaf396356693d1e8ddca
---

# 利用 Amazon Bedrock AgentCore 快速为您的 Agent 接入联网搜索和网页浏览

中文版本 | [English Version](<https://aws.amazon.com/cn/blogs/china/leveraging-amazon-bedrock-agentcore-quick-en/>)  
  
摘要：用 Amazon Bedrock AgentCore 的托管 Web Search 与 Browser 工具，通过一个标准 MCP 端点，为任意支持 MCP 的 Agent（Claude Code、Cline 等）接入实时联网搜索与网页浏览能力。客户端只需一个 URL 加一个 Token，部署只需AWS CLI 初始化加一条 helm install；数据不出 AWS，工具调用本身不额外消耗模型 token。

**目录**

01 一、引言

02 二、先看最终效果

03 三、两步部署到你自己的 AWS

04 四、为什么用 Amazon Bedrock AgentCore 的托管工具

05 五、成本

06 六、小结

07 七、参考链接

* * *

## **一、引言**

大语言模型的知识停留在训练截止时刻——它难以回答「今天的新闻」「一小时前发布的版本」这类问题。 本文带你用 [Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/>) 的托管能力，为任意支持 MCP(Model Context Protocol) 的 Agent（Claude Code、Cline、OpenCode 或你自研的 Agent）接入两项能力：

  * 联网搜索：基于 Amazon 互联网搜索引擎 + 知识图谱，返回结构化、带出处的实时结果；
  * 网页浏览：用托管的无头浏览器读取任意 URL 的正文，甚至完成自动化操作。



整套服务以一个标准 MCP 端点对外提供，部署只需两步，客户端接入只需几行配置。

### 背景和企业痛点

给单个 Agent 接联网并不难，自己用脚本调一个搜索 API、起一个 Chrome，似乎也能跑通。 真正的挑战出现在企业内部把 Agent 规模化部署之后——几十上百个 Agent、成千上万次 并发的搜索与网页抓取请求同时打过来，自建方案的技术债会集中爆发：

  * 自建无头 Chrome 的运维负担：浏览器进程内存占用高，易崩溃、卡死，或被反爬机制封禁； 还要自行实现进程池、健康检查、崩溃重启、并发限流、镜像安全更新……每一项都是长期投入， 且在高并发下容易引发级联故障。
  * 第三方搜索 API 的脆弱性：配额、限流、计费、各家返回格式不一、随时可能变更或下线， 查询还会流出到外部，带来合规审查。
  * 弹性与成本的两难：为应对峰值预留大量常驻浏览器实例，平峰期会产生大量闲置成本；若不 预留，峰值时又容易过载。



Amazon Bedrock AgentCore 用托管 + 无服务器（Serverless）的方式系统性地解决了这些问题：

  * 无服务器弹性：搜索与浏览器会话由 AWS 按需供给、自动伸缩。从 1 个请求到大规模并发， 你都无需预置或运维任何浏览器/搜索集群，平峰期也不为闲置实例付费。（注：单个 Browser 资源 默认有并发会话上限，超大并发需评估拆分多个 Browser 资源或申请提额，以官方 Service Quotas 为准。)
  * 稳定性更高：浏览器会话隔离（每个会话运行在独立的微虚拟机 microVM 中）、到期自动回收由 平台负责；搜索是 Amazon 构建并运营的托管引擎，不依赖随时可能变动的第三方转发。规模化并发 场景下，稳定性通常优于自建方案。
  * 托管能力助力合规：会话隔离、[AWS CloudTrail](<https://aws.amazon.com/cn/cloudtrail/>) 审计（记录控制面 API 调用）、查询不出 AWS, 显著降低企业安全与合规的审查负担。但在 AWS 责任共担模型下，IAM、数据治理与留存策略仍由你 自行负责——这些能力是「助力」合规，而非「自动满足」合规。



一句话：它把「让单个 Agent 联网」的实验性脚本，升级为「让企业内全部 Agent 稳定联网」 的生产级基础设施。

## 二、先看最终效果

假设服务已经部署在 `https://your-host.example.com/mcp`（下一章给出部署命令），你的 Agent 接入它只需要一段配置。

**在 MCP 客户端中接入**

把下面这段加入客户端的 MCP 配置文件（例如 `mcp.json`）：
    
    
    {
      "mcpServers": {
        "web": {
          "type": "http",
          "url": "https://your-host.example.com/mcp",
          "headers": {
            "Authorization": "Bearer YOUR_TOKEN"
          }
        }
      }
    }
    

如果你用的是 Claude Code，一行命令即可添加：
    
    
    claude mcp add --transport http web https://your-host.example.com/mcp \
      --header "Authorization: Bearer YOUR_TOKEN"
    

接入后，Agent 会获得以下工具能力：

工具 | 作用 | 典型场景  
---|---|---  
**`web_search`** | 联网搜索，返回结构化、带出处的实时结果 | 查最新资讯、行情、竞品动态、事实核查  
**`web_fetch`** | 读取指定 URL 的正文（自动渲染动态网页） | 精读某篇文章、文档、产品页  
**`web_browser`** （可选） | 完整的浏览器自动化 | 需要点击、填表、登录、多标签页、截图等交互流程  
  
其中 `web_browser` 是一个有状态的浏览器操作工具，支持的动作覆盖一次完整的浏览 流程：

  * 会话管理：`init_session`（开启会话）、`close`（关闭会话）
  * 页面导航：`navigate`（打开网址）、`refresh`（刷新）、`back` / `forward`（前进后退）
  * 元素交互：`click`（点击）、`type`（输入）、`press_key`（按键）、`evaluate`（执行脚本）
  * 内容提取：`get_text`（取正文）、`get_html`（取 HTML）、`screenshot`（截图）、 `get_cookies`（读 Cookie）
  * 高级能力：`set_cookies`、`new_tab` / `switch_tab` / `close_tab` / `list_tabs` （多标签页）、`network_intercept`（网络拦截）、`execute_cdp`（底层浏览器协议直通）



默认仅启用 `web_search` 和 `web_fetch` 这两个无状态工具，已能覆盖绝大多数「搜索 + 读取」需求；需要复杂网页操作时再开启 `web_browser` 即可。 

**直接对你的 Agent 说话**

接好之后无需任何额外操作，直接用自然语言提问即可。例如：

Prompt:「帮我搜索 2026 年最新的 AI Agent 框架，并对比它们的优缺点。」 

Agent 会自动调用 `web_search` 拿到实时结果并归纳。再比如：

Prompt:「读取 https://example.com/blog/whats-new 这篇文章，用三句话总结要点。」 

Agent 会调用 `web_fetch` 抓取该网页正文后总结。

Prompt:「先搜索 Kubernetes Gateway API 的最新进展，再打开官方文档页确认 v1.5 的稳定特性。」 

这种「搜索 + 读取」的组合，正是让 Agent 给出有出处、可核实答案的关键。

就这么简单——读者侧只需配置一个 URL 和一个 Token。下一章告诉你如何把这个服务部署 出来。

## 三、两步部署到你自己的 AWS

前提：你已经有一个 Amazon Elastic Kubernetes Service（[Amazon EKS](<https://aws.amazon.com/cn/eks/>)）集群，并安装了入口网关。

注：本文的入口路由基于 Envoy Gateway；若你用其他 Ingress，替换路由资源即可。 

本章所有命令都可直接复制运行，不依赖任何本地代码或文件。

版本要求：AgentCore Web Search 工具与 Gateway 的 `connector` target 类型于 2026 年 6 月 GA。请将 AWS CLI / boto3 升级到该日期之后的版本；较旧版本（如 aws-cli 2.34.x）本地 服务模型尚不含 `connector` 类型，会在创建 target 时报参数校验失败。先 `aws --version` 确认并升级。 

**第一步：用 AWS CLI 初始化 AgentCore 与权限**

1）创建 AgentCore Gateway 并接入托管的 Web Search 工具。 联网搜索能力通过一个 AgentCore Gateway 暴露；网页浏览用的是内置浏览器，无需任何创建。

区域说明：Web Search 工具当前仅在 `us-east-1` 提供，因此 Gateway 与 Web Search target 必须建在 `us-east-1`（下面命令的默认值已正确）。Browser 工具的可用区域更广（覆盖 AgentCore 的多个区域），本文为简化统一放在 `us-east-1`。 
    
    
    REGION=us-east-1
    ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    
    # 1. 创建 Gateway 执行角色(供 AgentCore 调用托管连接器)
    aws iam create-role --role-name BedrockSearchGatewayRole \
      --assume-role-policy-document '{
        "Version":"2012-10-17",
        "Statement":[{"Effect":"Allow",
          "Principal":{"Service":"bedrock-agentcore.amazonaws.com"},
          "Action":"sts:AssumeRole"}]}'
    
    aws iam put-role-policy --role-name BedrockSearchGatewayRole \
      --policy-name websearch --policy-document "{
        \"Version\":\"2012-10-17\",
        \"Statement\":[
          {\"Effect\":\"Allow\",\"Action\":\"bedrock-agentcore:InvokeGateway\",
           \"Resource\":\"arn:aws:bedrock-agentcore:${REGION}:${ACCOUNT}:gateway/*\"},
          {\"Effect\":\"Allow\",\"Action\":\"bedrock-agentcore:InvokeWebSearch\",
           \"Resource\":\"arn:aws:bedrock-agentcore:${REGION}:aws:tool/web-search.v1\"}]}"
    
    # 2. 创建 MCP 协议、IAM 鉴权的 Gateway
    GW_ID=$(aws bedrock-agentcore-control create-gateway \
      --region "$REGION" --name bedrock-search-gw \
      --role-arn "arn:aws:iam::${ACCOUNT}:role/BedrockSearchGatewayRole" \
      --protocol-type MCP --authorizer-type AWS_IAM \
      --query 'gatewayId' --output text)
    
    # 3. 在 Gateway 上挂载托管的 web-search 连接器
    aws bedrock-agentcore-control create-gateway-target \
      --region "$REGION" --gateway-identifier "$GW_ID" --name web-search \
      --target-configuration '{"mcp":{"connector":{"source":{"connectorId":"web-search"},
        "configurations":[{"name":"WebSearch","parameterValues":{}}]}}}' \
      --credential-provider-configurations '[{"credentialProviderType":"GATEWAY_IAM_ROLE"}]'
    
    # 记下 Gateway 的 MCP 地址(部署时要用)
    aws bedrock-agentcore-control get-gateway --region "$REGION" \
      --gateway-identifier "$GW_ID" --query 'gatewayUrl' --output text
    

2）创建 IRSA（IAM Roles for Service Accounts）角色，让 Amazon EKS Pod 以最小权限访问 AgentCore。 下面的命令用集群的 OIDC Provider 绑定到服务的 ServiceAccount,全程仅用 AWS CLI，不引入任何文件：
    
    
    CLUSTER=; CLUSTER_REGION=; GW_REGION=us-east-1
    ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    OIDC=$(aws eks describe-cluster --name "$CLUSTER" --region "$CLUSTER_REGION" \
      --query 'cluster.identity.oidc.issuer' --output text | sed 's~https://~~')
    
    # 信任策略:仅允许 bedrock-search 命名空间下的同名 ServiceAccount 假设此角色
    aws iam create-role --role-name BedrockSearchIRSARole \
      --assume-role-policy-document "{
        \"Version\":\"2012-10-17\",
        \"Statement\":[{\"Effect\":\"Allow\",
          \"Principal\":{\"Federated\":\"arn:aws:iam::${ACCOUNT}:oidc-provider/${OIDC}\"},
          \"Action\":\"sts:AssumeRoleWithWebIdentity\",
          \"Condition\":{\"StringEquals\":{
            \"${OIDC}:aud\":\"sts.amazonaws.com\",
            \"${OIDC}:sub\":\"system:serviceaccount:bedrock-search:bedrock-search\"}}}]}"
    
    # 权限:仅浏览器会话 + 调用 Gateway
    aws iam put-role-policy --role-name BedrockSearchIRSARole \
      --policy-name bedrock-search --policy-document "{
        \"Version\":\"2012-10-17\",
        \"Statement\":[
          {\"Effect\":\"Allow\",\"Action\":[
            \"bedrock-agentcore:StartBrowserSession\",\"bedrock-agentcore:StopBrowserSession\",
            \"bedrock-agentcore:GetBrowserSession\",\"bedrock-agentcore:ListBrowserSessions\",
            \"bedrock-agentcore:UpdateBrowserStream\",
            \"bedrock-agentcore:ConnectBrowserAutomationStream\",
            \"bedrock-agentcore:ConnectBrowserLiveViewStream\"],\"Resource\":\"*\"},
          {\"Effect\":\"Allow\",\"Action\":\"bedrock-agentcore:InvokeGateway\",
           \"Resource\":\"arn:aws:bedrock-agentcore:${GW_REGION}:${ACCOUNT}:gateway/*\"}]}"
    
    echo "IRSA 角色:arn:aws:iam::${ACCOUNT}:role/BedrockSearchIRSARole"
    

**第二步：用 Helm 一键部署到 EKS**

服务的 Helm Chart 已公开发布，任何人都可以直接安装，无需克隆任何仓库。把上两步得到 的 Gateway 地址、IRSA 角色 ARN，以及你自定义的访问 Token 填入即可：
    
    
    helm install bedrock-search oci://ghcr.io/aws300/bedrock-search \
      --version 0.2.0 \
      --namespace bedrock-search --create-namespace \
      --set-string bedrockSearch.host=your-host.example.com \
      --set-string bedrockSearch.search.gatewayUrl="" \
      --set-string bedrockSearch.irsaRoleArn="arn:aws:iam:::role/BedrockSearchIRSARole" \
      --set bedrockSearch.browser.enabled=true \
      --set 'bedrockSearch.auth.tokens={YOUR_TOKEN}'
    

部署完成后，服务即在 https://your-host.example.com/mcp 提供 MCP 端点。把这个地址和 Token 填进客户端配置（见本文开头的接入示例），你的 Agent 就具备联网搜索与网页浏览能力了。

上面开启了 `browser` 浏览器自动化工具（默认即开启）。如果某个 MCP 客户端不需要它， 只需把接入地址改为 `https://your-host.example.com/mcp?browser=off`，即可对该客户端单独 隐藏 `browser`、只保留 `web_search` 和 `web_fetch`，无需改动服务端配置。 

生成一个强 `Token:openssl rand -hex 32`。请勿使用示例值。 该 Helm Chart 与容器镜像已公开发布（ `oci://ghcr.io/aws300/bedrock-search`），任何人都可 匿名 `helm install` 直接安装，无需克隆任何仓库。企业可在此基础上二次定制（如调整鉴权方式、 资源规格、增删工具等）后，推送到自己的镜像仓库与 Chart 仓库再行部署。 

## 四、为什么用 Amazon Bedrock AgentCore 的托管工具

很多联网方案只是对第三方搜索引擎的简单封装。AgentCore 的两个托管工具在架构上有本质 不同。

**Web Search 工具：Amazon 自营的互联网搜索引擎**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/10/leveraging-amazon-bedrock-agentcore-quick-1.png>) [图1.Web Search 工具：经 AgentCore Gateway 调用 Amazon 自营互联网搜索引擎、知识图谱与语义片段抽取]  
---  
  
它的优势体现在四个方面：

  * 覆盖广：Amazon 自营的互联网搜索引擎，覆盖数百亿网页，长尾问题也能命中，而不只是 搜到最热门的页面。
  * 持续更新，够新鲜：索引持续刷新，新内容数分钟内即可反映。问「今天发生了什么」, 返回的就是今天的事。
  * 知识图谱兜底事实：对「谁担任某职位」「某公司何时成立」这类事实性问题，用知识图谱 给出高置信答案，减少模型仅凭网页片段拼凑导致的事实漂移。
  * 面向模型上下文的语义抽取：返回与查询相关的语义片段，而不是整页 HTML——每个 token 的信息密度更高，引用更精准。



此外，查询全程在 AWS 内部完成，不发往第三方搜索引擎，对有数据出境合规要求的团队是 一项关键优势。

**Browser 工具：托管的隔离浏览器沙箱**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/10/leveraging-amazon-bedrock-agentcore-quick-2.png>) [图2.Browser 工具：经 MCP 服务调用 AgentCore Browser Tool，驱动托管的隔离无头 Chrome 读取动态网页]  
---  
  
纯搜索工具只能给出网页摘要；读取某个指定 URL 的完整正文，需要一个真正的浏览器。 AgentCore Browser Tool 的优势：

  * 托管、零运维：无需自己维护浏览器集群，会话由 AWS 托管并自动回收。
  * 会话隔离、可观测：每个会话运行在独立的微虚拟机（microVM）中，资源与文件系统相互隔离， 并支持 AWS CloudTrail 审计（会话录制/回放需使用自定义浏览器配置，录制内容存入你自己的 S3 桶）。
  * 能处理动态页面：真实 Chrome 内核可执行 JavaScript，能读取需要渲染的现代网页，而 不仅仅是静态 HTML。



两者结合，Agent 就拥有了「先用 Amazon 搜索引擎检索、再用真实浏览器精读」的完整闭环。

## 五、成本

这套方案的成本结构很清晰：

  * 工具调用本身不额外消耗大模型 token：搜索与网页读取这两个动作是对 AgentCore 的直接 调用，请求路径上没有额外的 LLM 推理。但要注意：Agent 决定「是否搜索、读哪个页面」通常仍由 模型推理驱动；且搜索结果与网页正文一旦回灌进对话上下文，会作为输入 token 被模型正常计费 （这往往是网页浏览场景里 token 的大头）。
  * 按用量计费：Web Search 按查询次数计费；Browser Tool 按活跃资源消耗(vCPU·时 + 内存 GB·时，按秒计，空闲与 I/O 等待时间免费）计费，而非按会话挂起的墙钟时长。服务内置了 浏览器会话的空闲回收与并发上限，避免会话被遗忘而持续占用资源。
  * 基础设施轻量：服务本身是一个无状态适配层，在 EKS 上占用很小（默认请求约 0.1 vCPU / 128Mi)。



实际费用以 AWS 官方定价为准，建议在测试阶段用 AWS Cost Explorer 观察 AgentCore 的实际用量。

## 六、小结

借助 [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/>) AgentCore 的托管 Web Search 与 Browser 工具，我们用一个标准 MCP 端点，就为任意 Agent 提供了实时联网搜索与网页浏览能力，而且：

  * 接入极简——客户端只需一个 URL 加一个 Token;
  * 部署极简——AWS CLI 初始化 + 一条 `helm install` 即可上线；
  * 数据不出 AWS、结果更准、不额外消耗模型 token。



无论你是在构建客服 Agent、研究助手，还是竞品监控工具，这都是一种低门槛、可快速落地的 联网增强方案。现在就在你自己的 AWS 账户上动手试试吧。

**下一步行动：**

**相关产品：**

  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=1>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/?p=bl_pr_bedrock-agentcore_l=2>) — 加快代理投入生产的速度
  * [Amazon EKS](<https://aws.amazon.com/cn/eks/?p=bl_pr_eks_l=3>) — 托管式 Kubernetes 服务
  * [Amazon IAM](<https://aws.amazon.com/cn/iam/?p=bl_pr_iam_l=4>) — 身份管理和访问权限
  * [Amazon CloudTrail](<https://aws.amazon.com/cn/cloudtrail/?p=bl_pr_cloudtrail_l=5>) — 审计跟踪



**相关文章：**

  * [自己的工具自己控：MCP Server、Amazon Bedrock AgentCore、Quick Suite集成指南](<https://aws.amazon.com/cn/blogs/china/tool-mcp-server-amazon-bedrock-agentcore-quick/?p=bl_ar_l=1>)
  * [基于 Amazon Bedrock AgentCore Runtime 部署 Apache Doris MCP Server为 Quick Suite 等 AI 客户端提供原生数据分析能力](<https://aws.amazon.com/cn/blogs/china/runtime-deploy-apache-doris-mcp-server-quick-suite-ai-analytics/?p=bl_ar_l=2>)
  * [从手动到智能：用 Kiro CLI + OpenSearch MCP 让每个人都成为 OpenSearch 专家](<https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/?p=bl_ar_l=3>)
  * [别让你的 Amazon Bedrock 模型为他人”打工”——API 调用安全防护指南](<https://aws.amazon.com/cn/blogs/china/amazon-bedrock-model-api-invocation-security-guide/?p=bl_ar_l=4>)
  * [使用Amazon Bedrock + 自建ECS Docker Sandbox实现Agent 程序化工具调用Programmatic Tool Calling](<https://aws.amazon.com/cn/blogs/china/programmatic-tool-calling-agent-using-bedrock-and-ecs-docker-sandbox/?p=bl_ar_l=5>)



## 七、参考链接

  * [Amazon Bedrock AgentCore 产品页](<https://aws.amazon.com/bedrock/agentcore/>)
  * [Amazon Bedrock AgentCore 开发者文档](<https://docs.aws.amazon.com/bedrock-agentcore/>)
  * [Model Context Protocol（MCP）官方规范](<https://modelcontextprotocol.io/>)
  * [Amazon EKS 用户指南：为服务账户配置 IAM 角色（IRSA）](<https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html>)



*文中涉及的区域可用性与 API 形态请以 AWS 官方文档为准。*

*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 李南希

亚马逊云科技解决方案架构师，拥有超过十年的头部互联网企业研发经验，在物联网、AI/ML、低代码、iDaaS 及零信任安全等领域拥有深厚背景。现专注于车联网、Agentic AI、自动驾驶及具身智能机器人的技术咨询与落地。

### Cathy Huang

亚马逊云科技解决方案架构师，专注于汽车行业云架构与 AI 原生应用。她支持客户在智能座舱、自动驾驶数据闭环、车云协同、AI Agent 与具身智能等方向进行技术创新与架构落地，帮助企业构建面向全球化业务的智能云平台。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
