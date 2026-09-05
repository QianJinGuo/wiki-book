---
source: wechat
source_url: https://mp.weixin.qq.com/s/8j-32WsW1duv_p7xDC5FAg
ingested: 2026-07-06
feed_name: 阿里云云原生
wechat_mp_fakeid: MP_WXS_3537616032
source_published: 2026-07-06
sha256: 1e9118408ca6c97334aff1f6506d9fdca7a729198bec83ddf1aeefc8d1102dc7
vxc: 64
---


# 智能体构建与进化——Agent 开源开发者沙龙·深圳站精彩回顾 & PPT 下载

近日，智能体构建与进化——Agent 开源开发者沙龙·深圳站圆满落幕。本场活动吸引了 150+ 名技术从业者深度参与，深度分享了 AgentTeams 、AgentScope 2.0 、 Nacos Skill、Blade AI、 AI Agent、UnifieModel 等相关议题，并设置了动手实操环节。

关注公众号，后台回复：0706

免费获得深圳站讲师 PPT 合辑

 _**精彩回顾**_

  


  


  


 _Cloud Native_

议题一：

从 HiClaw 到 AgentTeams：多运行时 Worker、生产级控制面与企业协作能力升级丨肖京(亦盏)，阿里云智能高级技术专家，AgentTeams Maintainer

AgentTeams 是阿里云面向企业级的多 Agent 协作平台（前身 HiClaw）。其核心采用 Team Leader-Worker 分层架构，基于 Matrix 协议实现人与 Agent Teams 间的透明协作，支持不同引擎混编。平台提供本地单机到云上 PaaS 的平滑演进，集成统一鉴权、沙箱隔离及可观测性，有效支撑企业级多 Agent 复杂业务的规模化部署与治理。

议题二：

使用 AgentScope 2.0 Harness 框架构建分布式、企业级智能体！丨刘军(陆龟），AgentScope Core Maintainer

AgentScope 2.0 是阿里开源的企业级分布式智能体框架。其核心 Harness 提出“Workspace 作为真相源”，通过上下文压缩与双层长期记忆解决 Token 膨胀问题。支持子智能体并行编排与沙箱隔离，提供个人助手、多租户平台等四种应用形态，通过灵活配置满足从单机到分布式不同规模的业务需求。

议题三：

Nacos Skill 管理最佳实践：从个人经验到团队 AI 资产丨杨翊(席翁)，Nacos Maintainer

针对多 Agent 技能散落痛点，Nacos 社区推出 AI Skill 管理最佳实践，将 Skill 转化为可管理的核心资产。该方案构建了从个人 Local Mode 到企业 Registry Mode 的演进路径，依托 Nacos AI Registry 实现命名空间隔离、安全扫描与版本灰度发布。结合 SkillClaw 工具，系统打通了“产生-治理-分发”全链路闭环，在保障技能高效共享与复用的同时，全面满足生产级的安全合规要求。

议题四：

LoongSuite Pilot：让每一个 AI Coding Agent 可观测、可评估、可审计丨王方(方羞)，阿里云智能高级研发工程师，loongsuite-pilot Maintainer

LoongSuite Pilot 是专为端侧 AI 编程 Agent 设计的可观测性工具。采用 ALL IN ONE 架构，通过 Hook 等技术非侵入式采集 Cursor 等 Agent 的全链路行为，并标准化为 OpenTelemetry GenAI 语义规范数据。它能精准分析 Token 消耗、追踪 Agent 执行效果、对比 Agent 性能并提供安全审计，是保障 AI Agent 从“能用”走向“好用”及“可控”的关键基础设施。

议题五：

Blade AI：用状态机“驯服” LLM——五层安全、两层验证、渐进式 Skill 加载与经验闭环的混沌工程 Agent 架构丨蒋泽林(林曜)，Blade-AI Core Maintainer

聚焦于解决动手类 Agent 从“会做”到“敢做”的工程落地难题，提出了一套包含十二道安全关卡的治理框架。通过将自然语言意图转化为不可篡改的“合同”，实施严格的权限隔离、双层验证（程序事实+LLM 语义）以及独立的自动恢复机制，确保了 Agent 在生产环境中的高风险操作具备可审计性与兜底能力，实现了从混沌工程到生产级自主操作的跨越。

议题六：

AI Agent 时代需要的不是更多数据，而是一个语义层丨张鑫(千乘)，阿里云智能可观测技术专家，开源项目 UnifiedModel 负责人

单纯增加数据量或上下文长度无法解决 Agent 在复杂系统中的“盲人摸象”困境，核心在于补足“结构”缺失。通过构建由“对象 + 关系”组成的语义层（UnifiedModel：https://github.com/alibaba/UnifiedModel ），将企业资产、运行数据与系统关系转换为可查询、可演进的数字孪生对象图，使 Agent 能通过标准 SPL 语法进行渐进式查询与自发现，从而真正“看懂”复杂系统。

此外，现场设置了动手实操环节，讲师详细介绍了 AgentTeams 现场部署+简单场景体验，并带领用户现场动手实操，互动交流热烈。
