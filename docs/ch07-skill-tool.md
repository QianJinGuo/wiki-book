# Ch07 技能、工具与 MCP

> Agent 的手脚：Skill 系统、MCP 协议、Tool Use

> 本章收录 **81 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐⭐ 工程师 | 需编程基础 | 80 |
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

- [001. Skill Hub：企业级 AI 经验资产化的关键（组织能力视角）— winty 前端Q 3 篇合集：组织资产 + 质量门禁 4 关 + 生命周期 6 阶段治理](ch07/001-skill-hub-ai-winty-q-3-4-6)
- [002. Skill 设计模式](ch07/002-skill)
- [003. 工作流的 Skill 怎么写？从 7 个顶级 Skill 中提炼的模式与最佳实践](ch07/003-skill-7-skill)
- [004. 企业级 Skill 8 块最小骨架 + 8 条 checklist 设计规范](ch07/004-skill-8-8-checklist)
- [005. AI Agents Security Survey: Attack and Defense](ch07/005-ai-agents-security-survey-attack-and-defense)
- [006. Claude Code Skills / MCP / Rules 源码分析](ch07/006-claude-code-skills-mcp-rules)
- [007. Hermes Agent 满配 12 层配置完整指南（从裸装到 24h Agent 团队）](ch07/007-hermes-agent-12-24h-agent)
- [008. 重新定义Skill开发：保姆级教程&一站式开发助手](ch07/008-skill)
- [009. StarAgent/Drogo WebTerminal CLI：阿里基础设施把 WebTerminal 变成 Agent 手脚（CLI 才是 Skill 的执行面）](ch07/009-staragent-drogo-webterminal-cli-webterminal-agent-cli)
- [010. ai-skill-evolution底层逻辑](ch07/010-ai-skill-evolution)
- [011. 我把 Claude Design 做成了 Skill，人人都能成为顶级网站设计师](ch07/011-claude-design-skill)
- [012. Agent 记忆存储方案深度洞察：6 大流派分歧、Wiki 编译 vs 原始数据之争、Hermes Agent 启示](ch07/012-agent-6-wiki-vs-hermes-agent)
- [013. 网盘存量代码迁移实战：我们如何用三层架构管住 AI 的输出](ch07/013-ai)
- [014. Skill 产品哲学：歸藏做了爆款 Skill 后的产品反思](ch07/014-skill-skill)
- [015. Wiki Evolver](ch07/015-wiki-evolver)
- [016. Anthropic 最新博客：MCP 没死，它又来了](ch07/016-anthropic-mcp)
- [017. Hermes自进化完整闭环：Skill创建复用修补链路](ch07/017-hermes-skill)
- [018. Perplexity 内部 Skill 设计指南：四维体系与维护方法论](ch07/018-perplexity-skill)
- [019. MCP-based Interactive PDF Text Extraction from Amazon S3](ch07/019-mcp-based-interactive-pdf-text-extraction-from-amazon-s3)
- [020. MCP tool design: Practical approaches and tradeoffs](ch07/020-mcp-tool-design-practical-approaches-and-tradeoffs)
- [021. Embabel](ch07/021-embabel)
- [022. Claude Code SKILL.md 写作指南](ch07/022-claude-code-skill-md)
- [023. Anthropic knowledge-work-plugins 源码拆解：4 种组件、3 级加载、2 层记忆、岗位型插件市场](ch07/023-anthropic-knowledge-work-plugins-4-3-2)
- [024. Matt Pocock Skills — AI编程技能集合](ch07/024-matt-pocock-skills-ai)
- [025. Meta Skill](ch07/025-meta-skill)
- [026. 三层 Agent 架构：Skill / SubAgent / Agent Team 工程实践](ch07/026-agent-skill-subagent-agent-team)
- [027. Claude Code MCP Server](ch07/027-claude-code-mcp-server)
- [028. SkillOpt — 微软训练 Skill 文档的方法论](ch07/028-skillopt-skill)
- [029. 微信读书官方skill与huashu-weread增强版](ch07/029-skill-huashu-weread)
- [030. Securing AI Agents: AWS × Cisco AI Defense 给 MCP / A2A 加上企业级护栏](ch07/030-securing-ai-agents-aws-cisco-ai-defense-mcp-a2a)
- [031. Skill自进化三路线：Trace2Skill归纳法 / EvoSkill验证闭环 / SkillOpt训练范式](ch07/031-skill-trace2skill-evoskill-skillopt)
- [032. 电商 AI 操作系统崛起：从「工具人」到「All in One」+ 行业 KnowHow Skill 化 + 5 巨头 Headless 布局](ch07/032-ai-all-in-one-knowhow-skill-5-headless)
- [033. 京东健康 OPC 团队产品全流程 Skill 探索](ch07/033-opc-skill)
- [034. Qoder Skills 完全指南](ch07/034-qoder-skills)
- [035. Claude Code Skills 实战指南 — 发现机制、编写与安全](ch07/035-claude-code-skills)
- [036. 啊？我刚开源的 Skills 已经 7K Star 了？！](ch07/036-skills-7k-star)
- [037. CLI、MCP 和 CLI+Skill，应该如何选？](ch07/037-cli-mcp-cli-skill)
- [038. The new AI lock-in](ch07/038-the-new-ai-lock-in)
- [039. MapSatisfyBench：首个以满意度为核心目标的地图智能体评测基准](ch07/039-mapsatisfybench)
- [040. Autobrowse Browserbase Persistent Skill](ch07/040-autobrowse-browserbase-persistent-skill)
- [041. Wiki Evolver Skill System Design (GPT-5.5 Copilot Session)](ch07/041-wiki-evolver-skill-system-design-gpt-5-5-copilot-session)
- [042. 使用 Kiro 和 MCP 自动化大规模升级 RDS MySQL 8.0 至 RDS MySQL 8.4](ch07/042-kiro-mcp-rds-mysql-8-0-rds-mysql-8-4)
- [043. AI-Infra-Auto-Driven-SKILLS v0.1.0：给 Codex / Claude Code 的推理框架工作流](ch07/043-ai-infra-auto-driven-skills-v0-1-0-codex-claude-code)
- [044. 高德扫街榜 HermesAgent 配图系统：VLM + Skill + 语言驱动的生产级 Agent 架构](ch07/044-hermesagent-vlm-skill-agent)
- [045. Autonomous Vulnerability Hunting with MCP](ch07/045-autonomous-vulnerability-hunting-with-mcp)
- [046. AWS DevOps Agent × MCP Server：打通混合云网络排障的最后一公里](ch07/046-aws-devops-agent-mcp-server)
- [047. OpenClaw 深度架构分析：Agent 引擎、多源 Skill 系统、子 Agent steer 重定向、五层容错](ch07/047-openclaw-agent-skill-agent-steer)
- [048. Skill 版本管理五大原则：从越改越差到持续演进](ch07/048-skill)
- [049. Skill Craft — Claude Skill 质量工程框架](ch07/049-skill-craft-claude-skill)
- [050. Agent Loop 架构三层模型：Loop + Skill + Orchestrator](ch07/050-agent-loop-loop-skill-orchestrator)
- [051. SkillX — 层次化技能知识库](ch07/051-skillx)
- [052. Skill Craft：Claude Skill 质量工程工具](ch07/052-skill-craft-claude-skill)
- [053. Anthropic MCP 重新定义：Tool Search + 代码编排](ch07/053-anthropic-mcp-tool-search)
- [054. 重新定义Skill开发：保姆级教程&一站式开发助手发布](ch07/054-skill)
- [055. 你写的 Skill，及格了吗？](ch07/055-skill)
- [056. 我用 SKILL.md 做了一个简历生成器](ch07/056-skill-md)
- [057. 高德交易 VOC 自动排查：基于 Hermes 的多 Agent 架构实践](ch07/057-voc-hermes-agent)
- [058. 李继刚 ljg Skills 系列（四）：表达写作类 Skill](ch07/058-ljg-skills-skill)
- [059. Anthropic 官方生产级 Agent 最佳实践：12 个可复用的 MCP 设计模式](ch07/059-anthropic-agent-12-mcp)
- [060. Anthropic Claude Skill 9 类任务分类法](ch07/060-anthropic-claude-skill-9)
- [061. AI + Skills 打通中间件迁移：Android 到鸿蒙定位服务实践](ch07/061-ai-skills-android)
- [062. Skill 版本对比五大原则：从'两个数字比大小'到工程化质量门禁](ch07/062-skill)
- [063. Multica — 开源 Managed Agents 平台](ch07/063-multica-managed-agents)
- [064. 龙虾之父教你省钱：开源Skill给你的Skill减肥](ch07/064-skill-skill)
- [065. 李继刚 23 个 Skills 深度拆解——认知工序流水线](ch07/065-23-skills)
- [066. 如何构建生产准备的AI代理：MCP、CLI与技能——适合合适的工作的工具](ch07/066-ai-mcp-cli)
- [067. CLI系列④·选型CLI、MCP还是API？](ch07/067-cli-cli-mcp-api)
- [068. 让 Amazon Quick 操作飞书：构建远程 MCP 服务的设计实践](ch07/068-amazon-quick-mcp)
- [069. Introducing the MDN MCP server](ch07/069-introducing-the-mdn-mcp-server)
- [070. 当我把AI变成一个\"算法\"：Skill工程化设计的心路历程](ch07/070-ai-skill)
- [071. skill-mcp — 把 AI 技能当软件包管理（MCP 权限网关 + 只调度不执行的 Pipeline）](ch07/071-skill-mcp-ai-mcp-pipeline)
- [072. SkillComposer: 生成式技能组合](ch07/072-skillcomposer)
- [073. Building and connecting a production-ready ecommerce MCP server using Amazon Bedrock AgentCore and Mistral AI Studio](ch07/073-building-and-connecting-a-production-ready-ecommerce-mcp-ser)
- [074. Create Custom MCP Catalogs and Profiles](ch07/074-create-custom-mcp-catalogs-and-profiles)
- [075. PagePilot — PC端AI测试Skill设计与实战](ch07/075-pagepilot-pc-ai-skill)
- [076. 25个Skills详解：从生产力清单到AI工作流资产](ch07/076-25-skills-ai)
- [077. Perplexity 首次公开了内部 Skill 设计指南](ch07/077-perplexity-skill)
- [078. Codex Record & Replay：GUI 演示到可复用 Skill 的工作流捕获](ch07/078-codex-record-replay-gui-skill)
- [079. 一份可信来源，终结 Skill 管理混乱：Skill 治理最佳实践](ch07/079-skill-skill)
- [080. 让Skill“有图可依”：openJiuwen首发多模态Skill范式Skill-Omni](ch07/080-skill-openjiuwen-skill-skill-omni)
- [081. Microsoft Agent Framework Tools 总览：4 类工具 + Provider 矩阵 + Tool Approval](ch07/081-microsoft-agent-framework-tools-4-provider-tool-ap)
