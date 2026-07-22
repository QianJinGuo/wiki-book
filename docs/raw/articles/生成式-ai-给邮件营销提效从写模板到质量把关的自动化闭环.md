---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/generative-ai-efficiency-boost-template-automation
ingested: 2026-07-01
sha256: 808c6507c507cd8bbd9ce93fa1c4e06bcb715aa6bcec1b9856233f371f8f4fd6
feed_name: AWS China Blog
source_published: 2026-06-26
---

# 生成式 AI 给邮件营销提效：从写模板到质量把关的自动化闭环

摘要：通过生成式AI帮助营销人员优化邮件模版，并通过该方案全方位跟踪邮件生命周期，实现邮件营销的完美闭环。

**目录**

01 一、前言

02 二、整体架构

03 三、一键部署：用 AWS CDK 拉起完整生产环境

04 四、关键功能解析

05 五、关键技术点：可送达性追踪与合规

06 六、关键技术点：原生 MCP 集成（让 AI Agent 直接发信）

07 七、总结：对运营团队意味着什么

* * *

## **一、前言**

对运营和增长团队来说，邮件依然是 ROI 最高的触达渠道之一 —— 成本低、可衡量、能精细化分群。但真正决定效果的，从来不是”把邮件发出去”，而是这几件事：

  * 进不进收件箱：辛苦写的活动邮件，如果掉进垃圾箱，打开率直接归零。可送达性背后是发信信誉、模板质量、合规配置的综合结果。
  * 合不合规：Gmail、Yahoo 已经对批量发件人强制要求一键退订，不合规的邮件会被直接拦截甚至拉黑域名，影响所有后续发送。
  * 算不算得清账：发了多少、送达多少、多少被退信、谁打开了、谁点击了 —— 没有逐封的数据，就没法优化下一波活动。
  * 划不划算：随着发送量上涨，按消息计费的托管服务成本会线性甚至超线性增长；而模板创作、A/B 测试又依赖稀缺的设计与文案人力。



很多团队在 AWS 上用 Amazon Pinpoint 来解决这些问题，但 Pinpoint 将于 2026 年 10 月 30 日终止支持，正在用它的团队需要尽早规划替代方案。本文要介绍的 SES Sender，就是面向这个场景的一个选择：一套构建在 AWS SES 之上的自托管、开源、多团队协作的邮件营销与可送达性管理平台。

它最值得关注的一点，是把生成式 AI 真正用在了运营最痛的环节 —— 模板创作与质量把关：AI 不只是帮你写文案，还会从可送达性、打开率、移动端体验、合规等多个维度给模板打分，并直接告诉你哪里要改、怎么改。下面从架构到能力，逐一拆解它如何帮运营团队”少花钱、不踩坑、提效率”。

## **二、整体架构**

核心设计点：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/25/generative-ai-efficiency-boost-template-automation-1.png>) [图1]  
---  
  
  1. 单 Writer 发送引擎：只有 ENABLE_SENDER=true 的实例运行发送线程池，其余实例只提供 API 并把任务写进 DB。这让 API 层可以横向扩展，同时避免多实例争抢 SES 配额导致 Throttling。
  2. 无公网 Webhook 的事件追踪：不暴露公网回调地址，而是后端主动长轮询 SQS，保持服务私有。
  3. AI 解耦：模板优化/评测是独立的 AI 调用层，支持 Bedrock 与任意 OpenAI 兼容端



## **三、一键部署：用 AWS CDK 拉起完整生产环境**

除了适合本地开发验证的 docker-compose，SES Sender 还提供一套基于[AWS CDK](<https://aws.amazon.com/cn/cdk/>)的基础设施即代码方案：在自己的账号里，一条命令即可拉起一套完整的生产环境，无需手动创建 [Amazon VPC](<https://aws.amazon.com/cn/vpc/>)、数据库或 Amazon SES 的事件链路。

### 3.1 部署后创建的资源

一次部署会自动编排出与前面架构图一致的全套托管资源：

网络与入口：一个跨两个可用区的 Amazon VPC；前端通过 [Amazon CloudFront](<https://aws.amazon.com/cn/cloudfront/>)（自带 HTTPS）回源到 Application Load Balancer（ALB），再转发至容器。

计算层：[Amazon ECS](<https://aws.amazon.com/cn/ecs/>) on [AWS Fargate](<https://aws.amazon.com/cn/fargate/>) 运行 frontend、backend、mcp 三个服务，彼此通过 ECS Service Connect 以 http://backend:8000 互通；发送引擎、定时调度与 [Amazon SQS](<https://aws.amazon.com/cn/sqs/>) 长轮询均运行在 backend 中。

数据与事件：[Amazon Aurora](<https://aws.amazon.com/cn/rds/aurora/>) MySQL（Serverless v2）作为数据库；Amazon SES 的 Configuration Set 启用 VDM，并自动建好 Amazon SES → [Amazon SNS](<https://aws.amazon.com/cn/sns/>) → Amazon SQS 的事件链路与 [Amazon CloudWatch](<https://aws.amazon.com/cn/cloudwatch/>) 指标维度——即前文“可送达性追踪”所依赖的管道。

密钥管理：JWT 密钥、数据库密码、MCP API Key 均由 [AWS Secrets Manager](<https://aws.amazon.com/cn/secrets-manager/>) 生成并注入容器；容器全程使用 IAM 角色，不涉及任何长期访问密钥（AK/SK）。

### 3.2 安全默认：最小暴露

部署遵循最小暴露原则，与系统“保持服务私有”的设计一脉相承：ALB 不直接对公网开放，其安全组仅放行 Amazon CloudFront 托管的源站前缀列表，外部无法绕过 CloudFront 直连 ALB；默认模式下，Amazon ECS 任务与 Amazon Aurora 均位于私有子网并经 NAT 出网，数据库不可公网访问。对于 VPC 配额受限的账号，方案另提供复用现有 VPC 的部署模式。

### 3.3 前置条件与部署步骤

前置条件：本机安装 Node.js、Docker 与已配置凭证的 AWS CLI（容器镜像将在本地构建并推送至 Amazon ECR）；目标区域已开通 Amazon SES。部署步骤如下：
    
    
    git clone https://github.com/aws-samples/sample-ses-sender.git
    cd cdk && npm install
    npx cdk bootstrap      # 首次在该账号/区域使用，仅需执行一次
    npm run deploy         # 自动构建镜像并创建全部资源
    

部署完成后，输出中的 AppUrl 即为访问地址，默认管理员账号为 admin / admin123，首次登录后应立即修改。需要注意的是，Amazon SES 新账户默认处于沙箱模式，仅能向已验证的地址发送邮件；正式群发前需在控制台申请生产访问权限，并完成发件域名或邮箱的验证。

### 3.4 测试后清理资源

为避免持续产生费用，体验完成后可一键销毁本方案创建的全部资源：
    
    
    cd cdk && npm run destroy
    

其中 Amazon Aurora 会按默认策略保留一份快照以防误删，如确认不再需要，可在 [Amazon RDS](<https://aws.amazon.com/cn/rds/>) 控制台手动删除该快照。

## **四、关键功能解析**

### 4.1 兼容原有pinpoint功能以及邮件发送全生命周期跟踪

1\. 客群管理

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/25/generative-ai-efficiency-boost-template-automation-2.png>) [图2]  
---  
  
2\. 手工发送

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/25/generative-ai-efficiency-boost-template-automation-3.png>) [图3]  
---  
  
3\. 定时发送

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/25/generative-ai-efficiency-boost-template-automation-4.png>) [图4]  
---  
  
4\. 指标追踪

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/25/generative-ai-efficiency-boost-template-automation-5.png>) [图5]  
---  
  
5\. 发送明细查看

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/25/generative-ai-efficiency-boost-template-automation-6.png>) [图6]  
---  
  
### 4.2 把生成式 AI 嵌进模板创作链路

这是 SES Sender 与 Pinpoint 最大的差异点 —— Pinpoint 没有内置的生成式 AI 模板优化、多维评测或修复建议能力。SES Sender 的 AI 模块由三个独立功能组成，全部支持多 Provider、多模型。

### 4.3 多 AI Provider 架构

AI 配置是 DB 驱动的，用户可以注册多个模型并在调用时选择。底层支持两类 Provider：

  * [AWS Bedrock](<https://aws.amazon.com/cn/bedrock/>)：通过 boto3 的 bedrock-runtime converse() API 调用 Claude 等模型，
  * OpenAI 兼容端点：任意实现 /chat/completions 的服务（默认模型 gpt-4o），Bearer 认证，api_base 可配。这意味着 GPT-4o、本地大模型、或任何 OpenAI 形态的网关（如 LiteLLM）都能接入。



这种设计让平台不被单一 AI 供应商绑定 —— 既能用 Bedrock 享受 IAM 免密钥，也能切到自建模型控制成本。

### 4.4 功能 A：AI 模板优化

一键让 AI 重写邮件模板，沿 6 个维度优化：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/25/generative-ai-efficiency-boost-template-automation-7.png>) [图7]  
---  
  
优化维度：可送达性（垃圾词、HTML 结构）、打开率（主题行）、点击率（CTA 按钮/链接）、移动端适配、合规（退订链接、发件人标识）、HTML 质量（内联 CSS、编码）。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/25/generative-ai-efficiency-boost-template-automation-8.png>) [图8]  
---  
  
几个值得注意的工程细节：

  * 多模态输入：通过 _load_images 把 /uploads/… 本地文件或 HTTP URL 加载为 base64 传给模型（5MB 上限），用户可以丢一张设计稿让 AI 参考。
  * 迭代式精修：接受 user_feedback 参数，用户可以基于 AI 上一次的产出继续提要求（”按钮再大一点”、”语气更正式”）。
  * 变量保护：优化过程中严格保留 {{name}}、{{unsubscribe_url}} 等模板占位符，并保持原始语言。
  * 稳健 JSON 解析：大模型输出经常带 markdown 围栏或半残的 JSON，_parse_ai_json 通过括号/引号深度解析容错，避免一次格式异常就整体失败。



### 4.5 功能 B：AI 多维评测

这是更”硬核”的一块 —— 对一个模板沿 8 个可送达性维度并发打分，且支持多模型 × 多维度的矩阵评测：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/25/generative-ai-efficiency-boost-template-automation-9.png>) [图9]  
---  
  
8 个维度各自评分（0-100），并给出问题清单与建议：

  1. 送达率：垃圾词、SPF/DKIM/DMARC、发件人信誉
  2. 主题行质量：30-50 字符、个性化、紧迫感、A/B 潜力
  3. 反垃圾邮件合规：CAN-SPAM、GDPR、退订、实际地址
  4. HTML 质量：内联 CSS、表格布局、无 JS、alt 标签、DOCTYPE
  5. 移动端适配：响应式、14px+ 字号、44px+ 按钮、单列、媒体查询
  6. ISP 兼容性：Gmail 102KB 截断、Outlook VML、Yahoo、暗色模式
  7. 内容质量：文本:图片 60:40 比例、CTA 清晰度
  8. 合规性：退订链接、List-Unsubscribe 头、隐私/退出



并发评测 8 个维度（每个维度一次独立的模型调用），把原本串行的 8 次大模型请求压缩到接近单次的耗时。多模型时可以横向比较不同模型对同一模板的判断。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/25/generative-ai-efficiency-boost-template-automation-10.png>) [图10]  
---  
  
### 4.6 功能 C：逐维度修复建议

评测发现某个维度分数低，可以让 AI 针对该维度的具体问题生成修复方案 —— 返回 fixes[]，每条含 issue / fix / code 代码片段，外加 key_changes 摘要。用户可以一次只修一个薄弱维度，并直接拿到可粘贴的 HTML 代码。

对比 Pinpoint：Pinpoint 提供模板与个性化，但没有任何生成式 AI 的模板优化、多维评测或代码级修复能力。SES Sender 把”写模板 → AI 评分 → 逐项修复 → 再评分”做成了一个闭环。

## **五、关键技术点：可送达性追踪与合规**

### 5.1 事件追踪：SNS → SQS → 后端长轮询

SES Sender 不暴露公网 Webhook，而是后端用一个 daemon 线程 长轮询 SQS 队列

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/25/generative-ai-efficiency-boost-template-automation-11.png>) [图11]  
---  
  
它会处理 SNS 订阅确认消息、解包 SNS 包裹的 SES 通知、处理完后删除消息。只有配置了 SQS_QUEUE_URL 才启动 —— 没配也不影响正常发信，只是没有逐封追踪。配套的 setup-ses-events.sh 脚本能一键创建 SNS Topic、SQS 队列、订阅和 SES 事件目标。

### 5.2 双层指标

  * 逐封明细（来自 SQS 事件）：每个收件人的精确状态（送达 / 退信 / 退信类型与诊断码 / 打开次数与首次打开时间 / 点击次数 / 投诉时间），在”邮件明细”页可筛选、可导出 CSV。
  * 批次聚合指标：从 CloudWatch 的 AWS/SES 命名空间按 batch_id 维度拉取 Send / Delivery / Open / Bounce / Complaint / Click，并计算退信率等。引擎打的 EmailTags 正是为此服务。



对比 Pinpoint：SES Sender 在批次（CloudWatch）和单收件人（SQS 事件）两个粒度上都能拿到可送达性指标，且无需任何公网回调端点。

### 5.3 RFC 8058 一键退订

合规层面，SES Sender 实现了 Gmail / Yahoo 强制要求的一键退订

  * 每封邮件带上 List-Unsubscribe 与 List-Unsubscribe-Post: List-Unsubscribe=One-Click 头；
  * 退订 token 用 HMAC-SHA256 签名（对 email|source_email），base64url 编码，验证时常量时间比较，杜绝伪造；
  * 提供 POST /unsubscribe（RFC 8058 机器端点）和 GET /unsubscribe（浏览器确认页，可自定义标题/副标题/原因/按钮文案/品牌色/Logo）；
  * 已退订联系人在后续发送中自动跳过，退订记录可在”退订管理”页恢复。



### 5.4 黑名单与配额

  * 全局黑名单：启动时从 DB 加载到内存 Set，后台线程每 60 秒刷新，发送时 O(1) 检查，不产生逐封 DB 查询。支持单条添加、批量上传（txt/csv/xlsx）、模板下载。
  * 每用户每日配额：管理员可为每个用户设置日发送上限（默认 1000/天），超额返回 HTTP 429，UTC 零点重置，UI 用进度条展示。



## **六、关键技术点：原生 MCP 集成（让 AI Agent 直接发信）**

SES Sender 把整个平台能力封装成 MCP（Model Context Protocol）工具，AI 助手可以用自然语言操作发信。提供三种运行模式：

  * 完整 stdio：15+ 个独立工具；
  * 精简 stdio：1 个路由工具 + Skill 文档（约 200 token 上下文，推荐）；
  * 远程 HTTP：HTTP 服务监听 8808 端口，/mcp 端点，/health 健康检查，已打包进 docker-compose.yml。



认证用 MCP_API_KEY，支持 x-api-key 头、Authorization: Bearer 或 ?key= URL 参数。已验证可对接 Claude Desktop、Claude Code、Cursor、Kiro、Cline。

工具覆盖登录、看板、配额、客群/联系人/模板列表、批量发送、发送进度、发送历史、批次指标、邮件明细搜索、定时任务管理、退订列表等。这让”每周一早上 9 点给会员发周报”这种操作可以完全通过对话完成。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/25/generative-ai-efficiency-boost-template-automation-12.png>) [图12]  
---  
  
## **七、总结：对运营团队意味着什么**

抛开技术细节，从运营和业务的角度，SES Sender 带来的价值可以归纳为四点：

  1. 更省成本：直接用 SES 的发信价格（远低于多数托管营销服务），没有按消息叠加的平台费；数据和系统都在自己手里，规模越大越划算。
  2. 更高效率：AI 把”写模板—检查质量—修改—再检查”这个原本依赖设计和文案人力的循环自动化了。运营可以独立产出高质量、合规、移动端友好的邮件，不必每次都排期等设计资源。
  3. 更稳合规：一键退订、黑名单、退订自动跳过、每日配额这些”踩了就影响整个域名信誉”的合规要点都内建好了，降低账号被封、域名被拉黑的风险。
  4. 更可衡量：每封邮件的送达、退信、打开、点击都能追踪到人，活动效果一目了然，为下一轮分群和优化提供依据。



适合什么样的团队：希望自主掌控邮件触达、在意数据归属与成本、想用 AI 提升内容产能，或者正在为 Amazon Pinpoint 终止支持寻找平滑替代方案的运营/增长团队。如果你的核心诉求是短信、App 推送、跨渠道旅程编排等多渠道营销自动化，则需要评估”专注邮件单渠道”是否满足业务需要 —— 这也是 SES Sender 与 Pinpoint 在定位上的根本差异。

一句话：SES Sender 让邮件营销从”拼人力、拼预算”变成”拼策略、拼数据”，而 AI 是这中间最大的提效杠杆。

**下一步行动：**

**相关产品：**

  * [Amazon SQS](<https://aws.amazon.com/cn/sqs/?p=bl_pr_sqs_l=1>) — 托管式消息队列
  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=2>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon SNS](<https://aws.amazon.com/cn/sns/?p=bl_pr_sns_l=3>) — 发布/订阅和推送通知
  * [Amazon CloudWatch](<https://aws.amazon.com/cn/cloudwatch/?p=bl_pr_cloudwatch_l=4>) — 可观测性工具
  * [Amazon IAM](<https://aws.amazon.com/cn/iam/?p=bl_pr_iam_l=5>) — 身份管理和访问权限



**相关文章：**

  * [不只是 Chatbot：如何设计一个真正可执行的 Agentic Commerce 电商系统](<https://aws.amazon.com/cn/blogs/china/beyond-chatbot-how-to-design-a-truly-executable-agentic-commerce-ecommerce-system/?p=bl_ar_l=1>)
  * [Multi-Agent 架构在零售供应链运营中的实践：贯穿数据、洞察与行动](<https://aws.amazon.com/cn/blogs/china/multi-agent-architecture-retail-practice/?p=bl_ar_l=2>)
  * [快时尚电商行业智能体设计思路与应用实践（七）Amazon Bedrock AgentCore Runtime 深度解析和场景分析](<https://aws.amazon.com/cn/blogs/china/amazon-bedrock-agentcore-runtime-deep-dive-and-scenario-analysis/?p=bl_ar_l=3>)
  * [Firecracker在航空营销多智能体中的应用](<https://aws.amazon.com/cn/blogs/china/application-of-firecracker-in-aviation-marketing-multi-agent-systems/?p=bl_ar_l=4>)
  * [（下篇）Solutions Memory：让 AI Agent 从成功案例中持续学习 —— 双 Memory 架构实践](<https://aws.amazon.com/cn/blogs/china/solutions-memory-ai-agent-case-study-memory-architecture-practice/?p=bl_ar_l=5>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 郭俊龙

亚马逊云科技解决方案架构师，主要负责游戏行业客户解决方案设计，比较擅长云原生微服务以及大数据方案设计和实践。

### 柴飙

亚马逊云科技技术客户经理，主要支持零售电商、汽车行业客户的架构优化、成本管理、技术咨询与交付工作。曾供职于IBM，拥有多年企业级产品研发经验，并发表过10余项专利。

### 丁明义

亚马逊云科技技术客户经理，专注支持游戏出海及金融科技行业企业级客户，覆盖架构优化、成本管理、技术咨询等方向，在游戏行业云架构、大数据技术选型与方案落地方面有丰富实践经验

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
