---
title: "**一、关于 Kollab**"
source_url: 
ingested: 
sha256: 4397c5a3eae53bfa663ee7b09ac1ebcf8eb5e3ddc9ab87a14991db357ef2cda6
tags: [rss, article]
---

# 对抗 Agent 遗忘：Kollab 基于Amazon Bedrock AgentCore 的团队AI工作空间实践

摘要：Kollab 是团队共享 AI 工作空间。本文介绍如何结合 Amazon Bedrock AgentCore 和 S3 构建持久化工作空间,让 Agent 任务跨 Runtime 续跑。

**目录**

01 一、关于 Kollab

02 二、架构设计：Agent产品的稳定性

03 三、架构设计：真值源

04 四．真实工作流

05 五、总结

* * *

## **一、关于 Kollab**

[Kollab](<https://kollab.im/product>) 以“团队”作为使用单位构建 AI 工作空间，让团队和 Agent 在同一个空间里一起跟踪、迭代、完成真实工作。项目、文档、知识库条目与 Agent 汇聚一处，团队的讨论、决策与产出都可复用。而反复出现的工作，像是调研、内容生产和项目计划这些，则可以沉淀为 Skills，由 Agent 稳定复跑。

### 1.1 近千个 Connector连机外部生态，把团队工具接进来

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/26/on-amazon-bedrock-agentcore-ai-practice-1.png>) [图1：Kollab Connector 生态]  
---  
  
Agent 能不能在团队里真正落地，不在于它多聪明，而在于它能不能进入团队已经在用的工具。比如工程师团队，产品周报要在GitHub、Notion、Slack、Drive、Linear 之间反复切换；Agent若接不进这些工具，就只能替团队完成”写”那一小段，前后的上下文整理仍要落回用户身上。

[Kollab](<https://kollab.im/product>) 目前提供近千个 Connector，覆盖 AI 自动化、生产力、沟通、销售市场、业务运营、开发数据、金融电商、内容设计等九大类，统一基于 Model Context Protocol (MCP) 接入，分两条主线：广度靠托管目录，Gmail、Google Drive、Slack、Calendar 等第三方 SaaS 一键启用，凭据留在后端 secret，不进浏览器；深度靠标准 MCP OAuth 2.1，Notion、GitHub、Flowus 等核心场景 token 留在服务端，任何符合 MCP 规范的 server都能加进来。

Connector 在 Space（工作空间）而非用户维度启用，每个 Space 自主决定装哪些、给谁用，token 与配额按 Space 隔离。Slack、飞书、Telegram、企业微信这些 Bot 入口本质也是 Connector，目的是让 Agent出现在团队已在使用的对话窗口，而不是要求团队再访问新网站。

接入只是任务的起点。任务从日常工具里发起，跨多个 SaaS 拉数据、写结果，要经过多轮 LLM推理和工具调用，用户也可能中途离开、稍后回来追问。要让这一切在生产环境里稳定完成，接下来真正要面对的，是 Agent 产品的稳定性。

## **二、架构设计：Agent产品的稳定性**

Agent 产品的工程挑战，不在于让任务跑起来，而在于跑稳。[Kollab](<https://kollab.im/product>) 也遇到了所有 Agent团队都要过的关卡：”跑得动，但跑不稳”。跑得稳有两层含义：上线前，需要稳定、安全、可扩展的底层环境；上线后，基础设施还要应对真实业务的并发波动，空闲时控成本，高峰时自动扩容接流量。运行时平台的选择是成产品能否走稳的关键。

[Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/>) 正是面向这类场景的托管代理平台，让 AI Agent 在 AWS 上安全、大规模地构建与运行。[Kollab](<https://kollab.im/product>) 选择它的关键原因有几点：

  * 多租户强隔离与弹性扩展。AgentCore 以 session 为边界，每个 session 拥有独立的上下文、权限和运行状态，依托虚拟化级别的隔离按需创建，任务结束后快速销毁，确保多团队、多工作空间并发运行互不干扰。底层运行时按需弹性扩展，随负载自动伸缩。
  * 企业级安全与私有网络接入。AgentCore 支持 [Amazon VPC](<https://aws.amazon.com/cn/vpc/>) 连接与 AWS PrivateLink，使 Agent 可以通过私有网络安全地接入内部系统。



使用 AgentCore 这类弹性架构，必须面对所有弹性计算平台共有的设计挑战：Runtime 会被随时回收。在享受弹性伸缩与按量付费的同时，底层实例也会因空闲回收、扩缩容或节点调度而被随时启停。这也意味着，Runtime 内的临时状态—会话上下文、中间文件、工具调用记录都会随资源回收而消失。

## **三、架构设计：真值源**

为了让 Runtime 回收不等于工作空间的遗忘，[Kollab](<https://kollab.im/product>) 在 AgentCore 之上引入 [Amazon S3](<https://aws.amazon.com/cn/s3/>) 作为工作空间的唯一真值源(single source of truth)：Runtime本地仅保留可重建的工作副本，会话记录、中间产物与元数据通过双向同步持续落到 S3；实例回收后，下次启动即可从 S3 恢复上下文继续推进。AgentCore 负责弹性与隔离，S3 负责真值持久化，共同构成 [Kollab](<https://kollab.im/product>)的Agent记忆架构。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/26/on-amazon-bedrock-agentcore-ai-practice-2.png>) [图2]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/26/on-amazon-bedrock-agentcore-ai-practice-3.jpg>) [图3：Kollab 基于 AgentCore 与 S3 的架构]  
---  
  
### 3.1 Amazon S3 存工作空间的真值

[Kollab](<https://kollab.im/product>) 的记忆是团队共享、文件承载、跨session访问的，S3在这些维度上都贴合：每个工作空间可以映射为独立prefix，不同session、不同 Bot按前缀访问，天然隔离；长周期产出的 markdown 记忆、会话记录与artifact也与 S3的容量和持久性匹配。更重要的是，保护客户数据的机密性与安全性是 [Kollab](<https://kollab.im/product>) 产品的底线：访问权限遵循最小化原则（IAM 按 prefix 授权），数据全程加密（静态SSE-KMS, 传输TLS）

### 3.2 核心机制：工作空间Runtime与S3双向同步

S3 作为真值源，Runtime 与 S3 之间的同步是由两个动作构成：hydrate（从 S3 把工作空间状态加载回 Runtime 本地）与 sync（把本地的最新状态同步回写到 S3）。Runtime 启动或恢复时执行 hydrate，任务推进过程中每当发生重要事件（工具调用完成、阶段性产物生成、会话段落结束），通过 sync 回写到对应前缀。为了让用户获得接近瞬时的恢复体验，hydrate 按先恢复对话历史让用户继续交互，较大的文件同步在后台并行完成。

为了提升体验感，AgentCore Runtime 内部还有 Session Storage 作为 session 级的热缓存。它挂载到 Runtime 指定路径，由平台透明地保留工作目录的当前状态：当同一 session 因空闲被回收后在短期内恢复时，新的 session 可以挂载回同一份目录，用户几乎感受不到中断。Session Storage 是一个短期存储，超出边界时仍然以 S3 为准。

这套架构带来的三个用户可感知的产品行为：

  * 任务跨时段、跨设备续跑：早上启动的周报，午休后仍能接续进度。
  * 工作区产物可被长期追溯与复用：草稿、数据、artifact 留在团队空间，数周后仍可回查并带进下一个任务。
  * Skills 稳定复跑：高频流程做成 Skill 后每次执行一致，跑到第 100 次记忆依然正确，输出仍可预期。



## **四．真实工作流**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/26/on-amazon-bedrock-agentcore-ai-practice-4.png>) [图4：Kollab 真实工作流]  
---  
  
把上述设计串联起来看：用户在Slack让[Kollab](<https://kollab.im/product>) Agent”梳理本季度所有GitHub Issue并整理成产品周报”，阶段性产物sync到S3。3小时后用户回来追问进度，新Runtime启动后从S3读回工作空间，Agent从断点继续，最终把完整周报写入Notion（Notion工具按Issue ID幂等判重，重放不会产生重复页面）。

### 4.1 定时任务 ，让 Agent 在同一 session 中持续累积

跨时段续跑只是持久化的第一层价值。第二层在用户完全不在场的时候才显现——定时任务。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/26/on-amazon-bedrock-agentcore-ai-practice-5.png>) [图5：定时任务在同一 session 中持续累积]  
---  
  
在 [Kollab](<https://kollab.im/product>)，一个定时任务从首次触发开始就绑定到固定的 conversation（source_conversation_id）。每次到点，新 Runtime 从 S3 恢复这个conversation 的工作区，昨天写到一半的 Markdown、上周比对过的 Issue 列表都还在。

举个例子。用户配置一个每天早 8 点的 cron 任务：“汇总过去 24 小时的 GitHub Issue 进展，写到团队 Notion 周报草稿”。第一次执行时工作区是空的，Agent 建立基础结构，写入第一次记录。第二次执行时 Runtime 从 S3 恢复，看到昨天的结构后只补充新进展。一个月后累积的是一份连续追踪了三十天的进展报告，而不是三十份互不知情的快照。

AgentCore 提供按需触发的弹性，S3提供跨触发的状态持久化，定时任务因此从一个”触发器”变成一个长期在跑、状态持续叠加的 Agent。

## **五、总结**

从“跑得动”走到“跑得稳”，系统设计的基本前提很重要。[Kollab](<https://kollab.im/product>)团队在 AWS上把这套架构跑到生产之后，给出两条对在弹性服务上构建 Agent 的设计原则：工程判断需要以真值为准，Runtime 本地状态只视作临时副本；Agent 代码围绕“可能被重放或被中断“这个前提来设计。两条合起来是同一件事：把持久化交给 S3，代码负责适配 Runtime 的 dynamic（动态变化）。

**下一步行动：**

**相关产品：**

  * [Amazon S3](<https://aws.amazon.com/cn/s3/?p=bl_pr_s3_l=1>) — 适用于 AI、分析和存档的几乎无限的安全对象存储
  * [Amazon Connect](<https://aws.amazon.com/cn/connect/?p=bl_pr_connect_l=2>) — AI 客户体验解决方案
  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=3>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/?p=bl_pr_bedrock-agentcore_l=4>) — 加快代理投入生产的速度
  * [Amazon VPC](<https://aws.amazon.com/cn/vpc/?p=bl_pr_vpc_l=5>) — 隔离云网络



**相关文章：**

  * [实现工作流程现代化：Amazon WorkSpaces 现已为人工智能代理提供专属桌面（预览版）](<https://aws.amazon.com/cn/blogs/china/modernize-your-workflows-amazon-workspaces-now-gives-ai-agents-their-own-desktop-preview/?p=bl_ar_l=1>)
  * [基于 Amazon EKS 和 Graviton 构建多租户 AI Agent 平台：OpenClaw on Kubernetes 实践](<https://aws.amazon.com/cn/blogs/china/build-multi-tenant-ai-agent-on-eks-graviton-openclaw-k8s-practice/?p=bl_ar_l=2>)
  * [自己的工具自己控：MCP Server、Amazon Bedrock AgentCore、Quick Suite集成指南](<https://aws.amazon.com/cn/blogs/china/tool-mcp-server-amazon-bedrock-agentcore-quick/?p=bl_ar_l=3>)
  * [三剑合璧Quick Suite + Agent Core + Kiro联动实践：海外物流报价助手实战](<https://aws.amazon.com/cn/blogs/china/quick-suite-agent-core-kiro-logistics-quote-assistant/?p=bl_ar_l=4>)
  * [用 Kiro CLI 自动搭建 FluentBit 日志采集方案：两种 EKS 埋点数据落地 S3 Parquet 的实战对比](<https://aws.amazon.com/cn/blogs/china/kiro-cli-fluentbit-logging-solution-eks-s3-parquet-comparison/?p=bl_ar_l=5>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### Louisa Liu

亚马逊AWS解决方案架构师，位于香港，负责种类业务繁多的中小型企业及初创公司在AWS的解决方案架构设计，同时支持客户业务出海与全球化部署。拥有多年海外工作经验，曾在澳大利亚AWS负责企业客户的云上技术支持与最佳实践落地。

### 颜飞

[Kollab](<https://kollab.im/product>) 技术与产品架构负责人，负责 AI Agent 平台、AgentCore 运行时、技能生态、服务端与前端核心体验建设，聚焦 AI 原生工作流、多模型能力和产品工程化落地。

### 曹科技

[Kollab](<https://kollab.im/product>) 后端架构研发负责人，负责服务端核心架构、AgentCore 后端链路、任务调度、数据存储与运行时基础设施建设，聚焦复杂业务系统抽象、高并发服务稳定性和 AI Agent 平台的长期可演进性。

* * *

## 亚马逊云科技中国峰会

开发者挑战赛现场开启，基于真实业务场景亲手构建 Agent。 [](<https://aws.amazon.com/cn/events/summits/shanghai/?ectrk=jyLXNovBYB51qgzUEipIpZcxlfE5%2Bs7NfDTnZwR7hFYtQmPUSToTuN%2FZO5doh20ZJ%2FloW6Rom0l3P4LLcoyUPA%3D%3D&sc_icampaign=glb-summit-blog-p2&sc_ichannel=ha&sc_iplace=blog&trk=ab30be54-aedd-480a-9364-ab0bf98e982d>) |   
---|---
