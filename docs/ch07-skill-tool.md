# Ch07 技能、工具与 MCP

> Agent 的手脚：Skill 系统、MCP 协议、Tool Use

> 本章收录 **71 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 6 |
| ⭐⭐ 工程师 | 需编程基础 | 10 |
| ⭐⭐⭐ 专家 | 需ML基础 | 21 |
| ⭐⭐⭐⭐ 科学家 | 需研究背景 | 19 |
| ⭐⭐⭐⭐⭐ 大师 | 前沿/哲学 | 15 |

---

## 导读

Agent 能不能"动手做事"，取决于它有什么工具。

本章涵盖三个层面：Tool Use（模型调用外部 API 的基础能力）、MCP（Anthropic 推出的 Model Context Protocol，工具的 USB-C）、以及 Skill System（可复用的程序性记忆，把经验封装成可执行的模块）。

你会看到 winty 的 Skill Hub 如何把企业级 AI 经验资产化，微软的 Agent Framework Tools 如何用 4 类工具 + 7 列矩阵做选型，以及 Skill 版本管理的五大原则——语义化版本 + 灰度发布 + 质量门禁。

工具不是越多越好——设计得当的 3 个工具胜过设计粗糙的 30 个。

---



---

## 本章内容

- [001. Create Custom MCP Catalogs and Profiles](ch07/001-create-custom-mcp-catalogs-and-profiles)
- [002. 高德交易 VOC 自动排查：基于 Hermes 的多 Agent 架构实践](ch07/002-voc-hermes-agent)
- [003. 腾讯企业微信团队 Skill 流水线：AI代码生成率94%的需求开发全流程](ch07/003-skill-ai-94)
- [004. Building and connecting a production-ready ecommerce MCP server using Amazon Bedrock AgentCore and Mistral AI Studio](ch07/004-building-and-connecting-a-production-ready-ecommerce-mcp-ser)
- [005. 25个Skills详解：从生产力清单到AI工作流资产](ch07/005-25-skills-ai)
- [006. Perplexity 首次公开了内部 Skill 设计指南](ch07/006-perplexity-skill)
- [007. 电商 AI 操作系统崛起：从「工具人」到「All in One」+ 行业 KnowHow Skill 化 + 5 巨头 Headless 布局](ch07/007-ai-all-in-one-knowhow-skill-5-headless)
- [008. Agent Loop 架构三层模型：Loop + Skill + Orchestrator](ch07/008-agent-loop-loop-skill-orchestrator)
- [009. 你写的 Skill，及格了吗？](ch07/009-skill)
- [010. 我用 SKILL.md 做了一个简历生成器](ch07/010-skill-md)
- [011. Skill 版本对比五大原则：从'两个数字比大小'到工程化质量门禁](ch07/011-skill)
- [012. 如何构建生产准备的AI代理：MCP、CLI与技能——适合合适的工作的工具](ch07/012-ai-mcp-cli)
- [013. CLI系列④·选型CLI、MCP还是API？](ch07/013-cli-cli-mcp-api)
- [014. Introducing the MDN MCP server](ch07/014-introducing-the-mdn-mcp-server)
- [015. 当我把AI变成一个\"算法\"：Skill工程化设计的心路历程](ch07/015-ai-skill)
- [016. 让 Amazon Quick 操作飞书：构建远程 MCP 服务的设计实践](ch07/016-amazon-quick-mcp)
- [017. 三层 Agent 架构：Skill / SubAgent / Agent Team 工程实践](ch07/017-agent-skill-subagent-agent-team)
- [018. Embabel](ch07/018-embabel)
- [019. 微信读书官方skill与huashu-weread增强版](ch07/019-skill-huashu-weread)
- [020. Securing AI Agents: AWS × Cisco AI Defense 给 MCP / A2A 加上企业级护栏](ch07/020-securing-ai-agents-aws-cisco-ai-defense-mcp-a2a)
- [021. Qoder Skills 完全指南](ch07/021-qoder-skills)
- [022. OpenClaw 深度架构分析：Agent 引擎、多源 Skill 系统、子 Agent steer 重定向、五层容错](ch07/022-openclaw-agent-skill-agent-steer)
- [023. MapSatisfyBench：首个以满意度为核心目标的地图智能体评测基准](ch07/023-mapsatisfybench)
- [024. AI-Infra-Auto-Driven-SKILLS v0.1.0：给 Codex / Claude Code 的推理框架工作流](ch07/024-ai-infra-auto-driven-skills-v0-1-0-codex-claude-code)
- [025. 使用 Kiro 和 MCP 自动化大规模升级 RDS MySQL 8.0 至 RDS MySQL 8.4](ch07/025-kiro-mcp-rds-mysql-8-0-rds-mysql-8-4)
- [026. Autonomous Vulnerability Hunting with MCP](ch07/026-autonomous-vulnerability-hunting-with-mcp)
- [027. 高德扫街榜 HermesAgent 配图系统：VLM + Skill + 语言驱动的生产级 Agent 架构](ch07/027-hermesagent-vlm-skill-agent)
- [028. AWS DevOps Agent × MCP Server：打通混合云网络排障的最后一公里](ch07/028-aws-devops-agent-mcp-server)
- [029. skill-up: 阿里开源 Agent Skill 评测框架](ch07/029-skill-up-agent-skill)
- [030. 李继刚 ljg Skills 系列（四）：表达写作类 Skill](ch07/030-ljg-skills-skill)
- [031. Skill Craft：Claude Skill 质量工程工具](ch07/031-skill-craft-claude-skill)
- [032. 重新定义Skill开发：保姆级教程&一站式开发助手发布](ch07/032-skill)
- [033. Anthropic Claude Skill 9 类任务分类法](ch07/033-anthropic-claude-skill-9)
- [034. 李继刚 23 个 Skills 深度拆解——认知工序流水线](ch07/034-23-skills)
- [035. Multica — 开源 Managed Agents 平台](ch07/035-multica-managed-agents)
- [036. 龙虾之父教你省钱：开源Skill给你的Skill减肥](ch07/036-skill-skill)
- [037. SkillComposer: 生成式技能组合](ch07/037-skillcomposer)
- [038. 我把 Claude Design 做成了 Skill，人人都能成为顶级网站设计师](ch07/038-claude-design-skill)
- [039. ai-skill-evolution底层逻辑](ch07/039-ai-skill-evolution)
- [040. 网盘存量代码迁移实战：我们如何用三层架构管住 AI 的输出](ch07/040-ai)
- [041. Skill 产品哲学：歸藏做了爆款 Skill 后的产品反思](ch07/041-skill-skill)
- [042. Hermes自进化完整闭环：Skill创建复用修补链路](ch07/042-hermes-skill)
- [043. Skill自进化三路线：Trace2Skill归纳法 / EvoSkill验证闭环 / SkillOpt训练范式](ch07/043-skill-trace2skill-evoskill-skillopt)
- [044. MCP-based Interactive PDF Text Extraction from Amazon S3](ch07/044-mcp-based-interactive-pdf-text-extraction-from-amazon-s3)
- [045. Matt Pocock Skills — AI编程技能集合](ch07/045-matt-pocock-skills-ai)
- [046. Anthropic knowledge-work-plugins 源码拆解：4 种组件、3 级加载、2 层记忆、岗位型插件市场](ch07/046-anthropic-knowledge-work-plugins-4-3-2)
- [047. SkillOpt — 微软训练 Skill 文档的方法论](ch07/047-skillopt-skill)
- [048. Meta Skill](ch07/048-meta-skill)
- [049. Autobrowse Browserbase Persistent Skill](ch07/049-autobrowse-browserbase-persistent-skill)
- [050. 京东健康 OPC 团队产品全流程 Skill 探索](ch07/050-opc-skill)
- [051. Claude Code MCP Server](ch07/051-claude-code-mcp-server)
- [052. Claude Code Skills 实战指南 — 发现机制、编写与安全](ch07/052-claude-code-skills)
- [053. CLI、MCP 和 CLI+Skill，应该如何选？](ch07/053-cli-mcp-cli-skill)
- [054. The new AI lock-in](ch07/054-the-new-ai-lock-in)
- [055. Skill 版本管理五大原则：从越改越差到持续演进](ch07/055-skill)
- [056. Skill Craft — Claude Skill 质量工程框架](ch07/056-skill-craft-claude-skill)
- [057. Skill Hub：企业级 AI 经验资产化的关键（组织能力视角）— winty 前端Q 3 篇合集：组织资产 + 质量门禁 4 关 + 生命周期 6 阶段治理](ch07/057-skill-hub-ai-winty-q-3-4-6)
- [058. Microsoft Agent Framework Tools 总览：4 类工具 + Provider 矩阵 + Tool Approval](ch07/058-microsoft-agent-framework-tools-4-provider-tool-ap)
- [059. Skill 设计模式](ch07/059-skill)
- [060. 工作流的 Skill 怎么写？从 7 个顶级 Skill 中提炼的模式与最佳实践](ch07/060-skill-7-skill)
- [061. 企业级 Skill 8 块最小骨架 + 8 条 checklist 设计规范](ch07/061-skill-8-8-checklist)
- [062. AI Agents Security Survey: Attack and Defense](ch07/062-ai-agents-security-survey-attack-and-defense)
- [063. Claude Code Skills / MCP / Rules 源码分析](ch07/063-claude-code-skills-mcp-rules)
- [064. Hermes Agent 满配 12 层配置完整指南（从裸装到 24h Agent 团队）](ch07/064-hermes-agent-12-24h-agent)
- [065. 重新定义Skill开发：保姆级教程&一站式开发助手](ch07/065-skill)
- [066. StarAgent/Drogo WebTerminal CLI：阿里基础设施把 WebTerminal 变成 Agent 手脚（CLI 才是 Skill 的执行面）](ch07/066-staragent-drogo-webterminal-cli-webterminal-agent-cli)
- [067. Agent 记忆存储方案深度洞察：6 大流派分歧、Wiki 编译 vs 原始数据之争、Hermes Agent 启示](ch07/067-agent-6-wiki-vs-hermes-agent)
- [068. Wiki Evolver](ch07/068-wiki-evolver)
- [069. Perplexity 内部 Skill 设计指南：四维体系与维护方法论](ch07/069-perplexity-skill)
- [070. Claude Code SKILL.md 写作指南](ch07/070-claude-code-skill-md)
- [071. Wiki Evolver Skill System Design (GPT-5.5 Copilot Session)](ch07/071-wiki-evolver-skill-system-design-gpt-5-5-copilot-session)
