# Ch07 技能、工具与 MCP

> Agent 的手脚：Skill 系统、MCP 协议、Tool Use

> 本章收录 **97 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 1 |
| ⭐⭐ 工程师 | 需编程基础 | 95 |
| ⭐⭐⭐ 专家 | 需ML基础 | 1 |

---

## 导读

Agent 能不能"动手做事"，取决于它有什么工具。

本章涵盖三个层面：Tool Use（模型调用外部 API 的基础能力）、MCP（Anthropic 推出的 Model Context Protocol，工具的 USB-C）、以及 Skill System（可复用的程序性记忆，把经验封装成可执行的模块）。

你会看到 winty 的 Skill Hub 如何把企业级 AI 经验资产化，微软的 Agent Framework Tools 如何用 4 类工具 + 7 列矩阵做选型，以及 Skill 版本管理的五大原则——语义化版本 + 灰度发布 + 质量门禁。

工具不是越多越好——设计得当的 3 个工具胜过设计粗糙的 30 个。

---



---

## 本章内容

- [001. MCP 协议史诗级更新](ch07/001-mcp)
- [002. Skill Hub：企业级 AI 经验资产化的关键（组织能力视角）— winty 前端Q 3 篇合集：组织资产 + 质量门禁 4 关 + 生命周期 6 阶段治理](ch07/002-skill-hub-ai-winty-q-3-4-6)
- [003. Skill 设计模式](ch07/003-skill)
- [004. 工作流的 Skill 怎么写？从 7 个顶级 Skill 中提炼的模式与最佳实践](ch07/004-skill-7-skill)
- [005. 企业级 Skill 8 块最小骨架 + 8 条 checklist 设计规范](ch07/005-skill-8-8-checklist)
- [006. AI Agents Security Survey: Attack and Defense](ch07/006-ai-agents-security-survey-attack-and-defense)
- [007. Claude Code Skills / MCP / Rules 源码分析](ch07/007-claude-code-skills-mcp-rules)
- [008. Hermes Agent 满配 12 层配置完整指南（从裸装到 24h Agent 团队）](ch07/008-hermes-agent-12-24h-agent)
- [009. 重新定义Skill开发：保姆级教程&一站式开发助手](ch07/009-skill)
- [010. 我把 Claude Design 做成了 Skill，人人都能成为顶级网站设计师](ch07/010-claude-design-skill)
- [011. ai-skill-evolution底层逻辑](ch07/011-ai-skill-evolution)
- [012. StarAgent/Drogo WebTerminal CLI：阿里基础设施把 WebTerminal 变成 Agent 手脚（CLI 才是 Skill 的执行面）](ch07/012-staragent-drogo-webterminal-cli-webterminal-agent-cli)
- [013. Agent 记忆存储方案深度洞察：6 大流派分歧、Wiki 编译 vs 原始数据之争、Hermes Agent 启示](ch07/013-agent-6-wiki-vs-hermes-agent)
- [014. 网盘存量代码迁移实战：我们如何用三层架构管住 AI 的输出](ch07/014-ai)
- [015. Skill 产品哲学：歸藏做了爆款 Skill 后的产品反思](ch07/015-skill-skill)
- [016. Wiki Evolver](ch07/016-wiki-evolver)
- [017. Anthropic 最新博客：MCP 没死，它又来了](ch07/017-anthropic-mcp)
- [018. Perplexity 内部 Skill 设计指南：四维体系与维护方法论](ch07/018-perplexity-skill)
- [019. Hermes自进化完整闭环：Skill创建复用修补链路](ch07/019-hermes-skill)
- [020. 三层 Agent 架构：Skill / SubAgent / Agent Team 工程实践](ch07/020-agent-skill-subagent-agent-team)
- [021. MCP tool design: Practical approaches and tradeoffs](ch07/021-mcp-tool-design-practical-approaches-and-tradeoffs)
- [022. MCP-based Interactive PDF Text Extraction from Amazon S3](ch07/022-mcp-based-interactive-pdf-text-extraction-from-amazon-s3)
- [023. Matt Pocock Skills — AI编程技能集合](ch07/023-matt-pocock-skills-ai)
- [024. Embabel](ch07/024-embabel)
- [025. Claude Code SKILL.md 写作指南](ch07/025-claude-code-skill-md)
- [026. Anthropic knowledge-work-plugins 源码拆解：4 种组件、3 级加载、2 层记忆、岗位型插件市场](ch07/026-anthropic-knowledge-work-plugins-4-3-2)
- [027. Skill自进化三路线：Trace2Skill归纳法 / EvoSkill验证闭环 / SkillOpt训练范式](ch07/027-skill-trace2skill-evoskill-skillopt)
- [028. SkillOpt — 微软训练 Skill 文档的方法论](ch07/028-skillopt-skill)
- [029. Meta Skill](ch07/029-meta-skill)
- [030. Autobrowse Browserbase Persistent Skill](ch07/030-autobrowse-browserbase-persistent-skill)
- [031. 京东健康 OPC 团队产品全流程 Skill 探索](ch07/031-opc-skill)
- [032. Claude Code MCP Server](ch07/032-claude-code-mcp-server)
- [033. Claude Code Skills 实战指南 — 发现机制、编写与安全](ch07/033-claude-code-skills)
- [034. 微信读书官方skill与huashu-weread增强版](ch07/034-skill-huashu-weread)
- [035. Securing AI Agents: AWS × Cisco AI Defense 给 MCP / A2A 加上企业级护栏](ch07/035-securing-ai-agents-aws-cisco-ai-defense-mcp-a2a)
- [036. 电商 AI 操作系统崛起：从「工具人」到「All in One」+ 行业 KnowHow Skill 化 + 5 巨头 Headless 布局](ch07/036-ai-all-in-one-knowhow-skill-5-headless)
- [037. Qoder Skills 完全指南](ch07/037-qoder-skills)
- [038. 啊？我刚开源的 Skills 已经 7K Star 了？！](ch07/038-skills-7k-star)
- [039. CLI、MCP 和 CLI+Skill，应该如何选？](ch07/039-cli-mcp-cli-skill)
- [040. The new AI lock-in](ch07/040-the-new-ai-lock-in)
- [041. Wiki Evolver Skill System Design (GPT-5.5 Copilot Session)](ch07/041-wiki-evolver-skill-system-design-gpt-5-5-copilot-session)
- [042. OpenClaw 深度架构分析：Agent 引擎、多源 Skill 系统、子 Agent steer 重定向、五层容错](ch07/042-openclaw-agent-skill-agent-steer)
- [043. MapSatisfyBench：首个以满意度为核心目标的地图智能体评测基准](ch07/043-mapsatisfybench)
- [044. AI-Infra-Auto-Driven-SKILLS v0.1.0：给 Codex / Claude Code 的推理框架工作流](ch07/044-ai-infra-auto-driven-skills-v0-1-0-codex-claude-code)
- [045. 使用 Kiro 和 MCP 自动化大规模升级 RDS MySQL 8.0 至 RDS MySQL 8.4](ch07/045-kiro-mcp-rds-mysql-8-0-rds-mysql-8-4)
- [046. 我给 WorkBuddy 加浏览器 Skill](ch07/046-workbuddy-skill)
- [047. Autonomous Vulnerability Hunting with MCP](ch07/047-autonomous-vulnerability-hunting-with-mcp)
- [048. 高德扫街榜 HermesAgent 配图系统：VLM + Skill + 语言驱动的生产级 Agent 架构](ch07/048-hermesagent-vlm-skill-agent)
- [049. 改 Skill 的可重复流程 — 评测与轨迹驱动（孙成心）](ch07/049-skill)
- [050. AWS DevOps Agent × MCP Server：打通混合云网络排障的最后一公里](ch07/050-aws-devops-agent-mcp-server)
- [051. Skill 版本管理五大原则：从越改越差到持续演进](ch07/051-skill)
- [052. Anthropic 官方生产级 Agent 最佳实践：12 个可复用的 MCP 设计模式](ch07/052-anthropic-agent-12-mcp)
- [053. 让Skill"有图可依"：openJiuwen首发多模态Skill范式Skill-Omni](ch07/053-skill-openjiuwen-skill-skill-omni)
- [054. skill-up: 阿里开源 Agent Skill 评测框架](ch07/054-skill-up-agent-skill)
- [055. Agent Loop 架构三层模型：Loop + Skill + Orchestrator](ch07/055-agent-loop-loop-skill-orchestrator)
- [056. Create Custom MCP Catalogs and Profiles](ch07/056-create-custom-mcp-catalogs-and-profiles)
- [057. 李继刚 ljg Skills 系列（四）：表达写作类 Skill](ch07/057-ljg-skills-skill)
- [058. Skill Craft — Claude Skill 质量工程框架](ch07/058-skill-craft-claude-skill)
- [059. How Smartsheet built a remote MCP server on AWS](ch07/059-how-smartsheet-built-a-remote-mcp-server-on-aws)
- [060. SkillX — 层次化技能知识库](ch07/060-skillx)
- [061. AIOps MCP Agent](ch07/061-aiops-mcp-agent)
- [062. Skill Craft：Claude Skill 质量工程工具](ch07/062-skill-craft-claude-skill)
- [063. Anthropic MCP 重新定义：Tool Search + 代码编排](ch07/063-anthropic-mcp-tool-search)
- [064. 重新定义Skill开发：保姆级教程&一站式开发助手发布](ch07/064-skill)
- [065. 你写的 Skill，及格了吗？](ch07/065-skill)
- [066. 我用 SKILL.md 做了一个简历生成器](ch07/066-skill-md)
- [067. 高德交易 VOC 自动排查：基于 Hermes 的多 Agent 架构实践](ch07/067-voc-hermes-agent)
- [068. WorkBuddy Skill 全拆解](ch07/068-workbuddy-skill)
- [069. Anthropic Claude Skill 9 类任务分类法](ch07/069-anthropic-claude-skill-9)
- [070. NeurIPS 2026 Rebuttal Skill — 开源论文回复 Skill 工作流](ch07/070-neurips-2026-rebuttal-skill-skill)
- [071. AI + Skills 打通中间件迁移：Android 到鸿蒙定位服务实践](ch07/071-ai-skills-android)
- [072. Skill 版本对比五大原则：从'两个数字比大小'到工程化质量门禁](ch07/072-skill)
- [073. 李继刚 23 个 Skills 深度拆解——认知工序流水线](ch07/073-23-skills)
- [074. Multica — 开源 Managed Agents 平台](ch07/074-multica-managed-agents)
- [075. 龙虾之父教你省钱：开源Skill给你的Skill减肥](ch07/075-skill-skill)
- [076. 腾讯企业微信团队 Skill 流水线：AI代码生成率94%的需求开发全流程](ch07/076-skill-ai-94)
- [077. 如何构建生产准备的AI代理：MCP、CLI与技能——适合合适的工作的工具](ch07/077-ai-mcp-cli)
- [078. CLI系列④·选型CLI、MCP还是API？](ch07/078-cli-cli-mcp-api)
- [079. 让 Amazon Quick 操作飞书：构建远程 MCP 服务的设计实践](ch07/079-amazon-quick-mcp)
- [080. Introducing the MDN MCP server](ch07/080-introducing-the-mdn-mcp-server)
- [081. 当我把AI变成一个\"算法\"：Skill工程化设计的心路历程](ch07/081-ai-skill)
- [082. SkillComposer: 生成式技能组合](ch07/082-skillcomposer)
- [083. Building and connecting a production-ready ecommerce MCP server using Amazon Bedrock AgentCore and Mistral AI Studio](ch07/083-building-and-connecting-a-production-ready-ecommerce-mcp-ser)
- [084. skill-mcp — 把 AI 技能当软件包管理（MCP 权限网关 + 只调度不执行的 Pipeline）](ch07/084-skill-mcp-ai-mcp-pipeline)
- [085. PagePilot — PC端AI测试Skill设计与实战](ch07/085-pagepilot-pc-ai-skill)
- [086. LibTV把导演的手艺装进了Skill商店，我拿三支片子验了验](ch07/086-libtv-skill)
- [087. 25个Skills详解：从生产力清单到AI工作流资产](ch07/087-25-skills-ai)
- [088. Perplexity 首次公开了内部 Skill 设计指南](ch07/088-perplexity-skill)
- [089. Codex Record & Replay：GUI 演示到可复用 Skill 的工作流捕获](ch07/089-codex-record-replay-gui-skill)
- [090. 一份可信来源，终结 Skill 管理混乱：Skill 治理最佳实践](ch07/090-skill-skill)
- [091. 面向复杂业务场景的智能分析 Skills 架构设计与演进实践](ch07/091-skills)
- [092. 10万+Skill 背后：腾讯SkillHub如何帮用户找到真正好用的那20%](ch07/092-10-skill-skillhub-20)
- [093. KnowAct-GUIClaw — 哈工大「Know Deeply, Act Perfectly」自进化 GUI Agent](ch07/093-knowact-guiclaw-know-deeply-act-perfectly-gui-agent)
- [094. Amazon EKS MCP Server](ch07/094-amazon-eks-mcp-server)
- [095. MCP Protocol](ch07/095-mcp-protocol)
- [096. Hermes 上线 /learn 模式：从任何地方提炼任何 Skill](ch07/096-hermes-learn-skill)
- [097. Microsoft Agent Framework Tools 总览：4 类工具 + Provider 矩阵 + Tool Approval](ch07/097-microsoft-agent-framework-tools-4-provider-tool-ap)
