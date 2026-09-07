# Ch07 技能、工具与 MCP

> Agent 的手脚：Skill 系统、MCP 协议、Tool Use

> 本章收录 **61 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 5 |
| ⭐⭐ 工程师 | 需编程基础 | 8 |
| ⭐⭐⭐ 专家 | 需ML基础 | 18 |
| ⭐⭐⭐⭐ 科学家 | 需研究背景 | 17 |
| ⭐⭐⭐⭐⭐ 大师 | 前沿/哲学 | 13 |

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
- [004. 重新定义Skill开发：保姆级教程&一站式开发助手发布](ch07/004-skill)
- [005. Building and connecting a production-ready ecommerce MCP server using Amazon Bedrock AgentCore and Mistral AI Studio](ch07/005-building-and-connecting-a-production-ready-ecommerce-mcp-ser)
- [006. 电商 AI 操作系统崛起：从「工具人」到「All in One」+ 行业 KnowHow Skill 化 + 5 巨头 Headless 布局](ch07/006-ai-all-in-one-knowhow-skill-5-headless)
- [007. Agent Loop 架构三层模型：Loop + Skill + Orchestrator](ch07/007-agent-loop-loop-skill-orchestrator)
- [008. 你写的 Skill，及格了吗？](ch07/008-skill)
- [009. 我用 SKILL.md 做了一个简历生成器](ch07/009-skill-md)
- [010. Skill 版本对比五大原则：从'两个数字比大小'到工程化质量门禁](ch07/010-skill)
- [011. 如何构建生产准备的AI代理：MCP、CLI与技能——适合合适的工作的工具](ch07/011-ai-mcp-cli)
- [012. Introducing the MDN MCP server](ch07/012-introducing-the-mdn-mcp-server)
- [013. 当我把AI变成一个\"算法\"：Skill工程化设计的心路历程](ch07/013-ai-skill)
- [014. Embabel](ch07/014-embabel)
- [015. 微信读书官方skill与huashu-weread增强版](ch07/015-skill-huashu-weread)
- [016. Securing AI Agents: AWS × Cisco AI Defense 给 MCP / A2A 加上企业级护栏](ch07/016-securing-ai-agents-aws-cisco-ai-defense-mcp-a2a)
- [017. OpenClaw 深度架构分析：Agent 引擎、多源 Skill 系统、子 Agent steer 重定向、五层容错](ch07/017-openclaw-agent-skill-agent-steer)
- [018. MapSatisfyBench：首个以满意度为核心目标的地图智能体评测基准](ch07/018-mapsatisfybench)
- [019. AI-Infra-Auto-Driven-SKILLS v0.1.0：给 Codex / Claude Code 的推理框架工作流](ch07/019-ai-infra-auto-driven-skills-v0-1-0-codex-claude-code)
- [020. Autonomous Vulnerability Hunting with MCP](ch07/020-autonomous-vulnerability-hunting-with-mcp)
- [021. 高德扫街榜 HermesAgent 配图系统：VLM + Skill + 语言驱动的生产级 Agent 架构](ch07/021-hermesagent-vlm-skill-agent)
- [022. AWS DevOps Agent × MCP Server：打通混合云网络排障的最后一公里](ch07/022-aws-devops-agent-mcp-server)
- [023. skill-up: 阿里开源 Agent Skill 评测框架](ch07/023-skill-up-agent-skill)
- [024. 李继刚 ljg Skills 系列（四）：表达写作类 Skill](ch07/024-ljg-skills-skill)
- [025. SkillX — 层次化技能知识库](ch07/025-skillx)
- [026. Skill Craft：Claude Skill 质量工程工具](ch07/026-skill-craft-claude-skill)
- [027. Anthropic Claude Skill 9 类任务分类法](ch07/027-anthropic-claude-skill-9)
- [028. 李继刚 23 个 Skills 深度拆解——认知工序流水线](ch07/028-23-skills)
- [029. Multica — 开源 Managed Agents 平台](ch07/029-multica-managed-agents)
- [030. 龙虾之父教你省钱：开源Skill给你的Skill减肥](ch07/030-skill-skill)
- [031. SkillComposer: 生成式技能组合](ch07/031-skillcomposer)
- [032. 我把 Claude Design 做成了 Skill，人人都能成为顶级网站设计师](ch07/032-claude-design-skill)
- [033. ai-skill-evolution底层逻辑](ch07/033-ai-skill-evolution)
- [034. 网盘存量代码迁移实战：我们如何用三层架构管住 AI 的输出](ch07/034-ai)
- [035. Skill 产品哲学：歸藏做了爆款 Skill 后的产品反思](ch07/035-skill-skill)
- [036. Anthropic 最新博客：MCP 没死，它又来了](ch07/036-anthropic-mcp)
- [037. Hermes自进化完整闭环：Skill创建复用修补链路](ch07/037-hermes-skill)
- [038. Skill自进化三路线：Trace2Skill归纳法 / EvoSkill验证闭环 / SkillOpt训练范式](ch07/038-skill-trace2skill-evoskill-skillopt)
- [039. MCP-based Interactive PDF Text Extraction from Amazon S3](ch07/039-mcp-based-interactive-pdf-text-extraction-from-amazon-s3)
- [040. Matt Pocock Skills — AI编程技能集合](ch07/040-matt-pocock-skills-ai)
- [041. Meta Skill](ch07/041-meta-skill)
- [042. 京东健康 OPC 团队产品全流程 Skill 探索](ch07/042-opc-skill)
- [043. Claude Code MCP Server](ch07/043-claude-code-mcp-server)
- [044. Claude Code Skills 实战指南 — 发现机制、编写与安全](ch07/044-claude-code-skills)
- [045. CLI、MCP 和 CLI+Skill，应该如何选？](ch07/045-cli-mcp-cli-skill)
- [046. The new AI lock-in](ch07/046-the-new-ai-lock-in)
- [047. Skill 版本管理五大原则：从越改越差到持续演进](ch07/047-skill)
- [048. Skill Craft — Claude Skill 质量工程框架](ch07/048-skill-craft-claude-skill)
- [049. Skill Hub：企业级 AI 经验资产化的关键（组织能力视角）— winty 前端Q 3 篇合集：组织资产 + 质量门禁 4 关 + 生命周期 6 阶段治理](ch07/049-skill-hub-ai-winty-q-3-4-6)
- [050. Microsoft Agent Framework Tools 总览：4 类工具 + Provider 矩阵 + Tool Approval](ch07/050-microsoft-agent-framework-tools-4-provider-tool-ap)
- [051. Skill 设计模式](ch07/051-skill)
- [052. 企业级 Skill 8 块最小骨架 + 8 条 checklist 设计规范](ch07/052-skill-8-8-checklist)
- [053. AI Agents Security Survey: Attack and Defense](ch07/053-ai-agents-security-survey-attack-and-defense)
- [054. Claude Code Skills / MCP / Rules 源码分析](ch07/054-claude-code-skills-mcp-rules)
- [055. Hermes Agent 满配 12 层配置完整指南（从裸装到 24h Agent 团队）](ch07/055-hermes-agent-12-24h-agent)
- [056. 重新定义Skill开发：保姆级教程&一站式开发助手](ch07/056-skill)
- [057. StarAgent/Drogo WebTerminal CLI：阿里基础设施把 WebTerminal 变成 Agent 手脚（CLI 才是 Skill 的执行面）](ch07/057-staragent-drogo-webterminal-cli-webterminal-agent-cli)
- [058. Agent 记忆存储方案深度洞察：6 大流派分歧、Wiki 编译 vs 原始数据之争、Hermes Agent 启示](ch07/058-agent-6-wiki-vs-hermes-agent)
- [059. Wiki Evolver](ch07/059-wiki-evolver)
- [060. Perplexity 内部 Skill 设计指南：四维体系与维护方法论](ch07/060-perplexity-skill)
- [061. Claude Code SKILL.md 写作指南](ch07/061-claude-code-skill-md)
