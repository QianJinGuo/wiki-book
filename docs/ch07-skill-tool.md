# Ch07 技能、工具与 MCP

> Agent 的手脚：Skill 系统、MCP 协议、Tool Use

> 本章收录 **114 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐⭐ 工程师 | 需编程基础 | 61 |
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

- [001. Skill Hub：企业级 AI 经验资产化的关键（组织能力视角）— winty 前端Q 3 篇合集：组织资产 + 质量门禁 4 关 + 生命周期 6 阶段治理](ch07-001-skill-hub-企业级-ai-经验资产化的关键-组织能力视角-winty-前端q-3-篇合集-组织资产-质量.html)
- [002. Skill 设计模式](ch07-002-skill.html)
- [003. 工作流的 Skill 怎么写？从 7 个顶级 Skill 中提炼的模式与最佳实践](ch07-003-工作流的-skill-怎么写-从-7-个顶级-skill-中提炼的模式与最佳实践.html)
- [004. 企业级 Skill 8 块最小骨架 + 8 条 checklist 设计规范](ch07-004-企业级-skill-8-块最小骨架-8-条-checklist-设计规范.html)
- [005. AI Agents Security Survey: Attack and Defense](ch07-005-ai-agents-security-survey-attack-and-defense.html)
- [006. claude code skills mcp rules source analysis](ch07-006-claude-code-skills-mcp-rules-source-analysis.html)
- [007. Hermes Agent 满配 12 层配置完整指南（从裸装到 24h Agent 团队）](ch07-007-hermes-agent-满配-12-层配置完整指南-从裸装到-24h-agent-团队.html)
- [008. 重新定义Skill开发：保姆级教程&一站式开发助手](ch07-008-skill.html)
- [009. StarAgent/Drogo WebTerminal CLI：阿里基础设施把 WebTerminal 变成 Agent 手脚（CLI 才是 Skill 的执行面）](ch07-009-staragent-drogo-webterminal-cli-阿里基础设施把-webterminal-变成-agent.html)
- [010. ai-skill-evolution底层逻辑](ch07-010-ai-skill-evolution底层逻辑.html)
- [011. 我把 Claude Design 做成了 Skill，人人都能成为顶级网站设计师](ch07-011-我把-claude-design-做成了-skill-人人都能成为顶级网站设计师.html)
- [012. Agent 记忆存储方案深度洞察：6 大流派分歧、Wiki 编译 vs 原始数据之争、Hermes Agent 启示](ch07-012-agent-记忆存储方案深度洞察-6-大流派分歧-wiki-编译-vs-原始数据之争-hermes-agent-启示.html)
- [013. 网盘存量代码迁移实战：我们如何用三层架构管住 AI 的输出](ch07-013-网盘存量代码迁移实战-我们如何用三层架构管住-ai-的输出.html)
- [014. Skill 产品哲学：歸藏做了爆款 Skill 后的产品反思](ch07-014-skill-产品哲学-歸藏做了爆款-skill-后的产品反思.html)
- [015. Wiki Evolver](ch07-015-wiki-evolver.html)
- [016. Anthropic 最新博客：MCP 没死，它又来了](ch07-016-anthropic-最新博客-mcp-没死-它又来了.html)
- [017. Hermes自进化完整闭环：Skill创建复用修补链路](ch07-017-hermes自进化完整闭环-skill创建复用修补链路.html)
- [018. Perplexity 内部 Skill 设计指南：四维体系与维护方法论](ch07-018-perplexity-skill.html)
- [019. Embabel](ch07-019-embabel.html)
- [020. Claude Code SKILL.md 写作指南](ch07-020-claude-code-skill-md-写作指南.html)
- [021. Anthropic knowledge-work-plugins 源码拆解：4 种组件、3 级加载、2 层记忆、岗位型插件市场](ch07-021-anthropic-knowledge-work-plugins-4-3-2.html)
- [022. Meta Skill](ch07-022-meta-skill.html)
- [023. 三层 Agent 架构：Skill / SubAgent / Agent Team 工程实践](ch07-023-三层-agent-架构-skill-subagent-agent-team-工程实践.html)
- [024. Claude Code MCP Server](ch07-024-claude-code-mcp-server.html)
- [025. SkillOpt — 微软训练 Skill 文档的方法论](ch07-025-skillopt-微软训练-skill-文档的方法论.html)
- [026. 微信读书官方skill与huashu-weread增强版](ch07-026-微信读书官方skill与huashu-weread增强版.html)
- [027. Securing AI Agents: AWS × Cisco AI Defense 给 MCP / A2A 加上企业级护栏](ch07-027-securing-ai-agents-aws-cisco-ai-defense-给-mcp-a2a-加上企业级.html)
- [028. 电商 AI 操作系统崛起：从「工具人」到「All in One」+ 行业 KnowHow Skill 化 + 5 巨头 Headless 布局](ch07-028-电商-ai-操作系统崛起-从-工具人-到-all-in-one-行业-knowhow-skill-化-5-巨头.html)
- [029. Qoder Skills 完全指南](ch07-029-qoder-skills.html)
- [030. CLI、MCP 和 CLI+Skill，应该如何选？](ch07-030-cli-mcp-和-cli-skill-应该如何选.html)
- [031. The new AI lock-in](ch07-031-the-new-ai-lock-in.html)
- [032. MapSatisfyBench：首个以满意度为核心目标的地图智能体评测基准](ch07-032-mapsatisfybench-首个以满意度为核心目标的地图智能体评测基准.html)
- [033. Matt Pocock Skills — AI编程技能集合](ch07-033-matt-pocock-skills-ai.html)
- [034. autobrowse browserbase persistent skill](ch07-034-autobrowse-browserbase-persistent-skill.html)
- [035. 使用 Kiro 和 MCP 自动化大规模升级 RDS MySQL 8.0 至 RDS MySQL 8.4](ch07-035-使用-kiro-和-mcp-自动化大规模升级-rds-mysql-8-0-至-rds-mysql-8-4.html)
- [036. AI-Infra-Auto-Driven-SKILLS v0.1.0：给 Codex / Claude Code 的推理框架工作流](ch07-036-ai-infra-auto-driven-skills-v0-1-0-给-codex-claude-code-的推理.html)
- [037. Wiki Evolver Skill System Design (GPT-5.5 Copilot Session)](ch07-037-wiki-evolver-skill-system-design-gpt-5-5-copilot-session.html)
- [038. Autonomous Vulnerability Hunting with MCP](ch07-038-autonomous-vulnerability-hunting-with-mcp.html)
- [039. AWS DevOps Agent × MCP Server：打通混合云网络排障的最后一公里](ch07-039-aws-devops-agent-mcp-server-打通混合云网络排障的最后一公里.html)
- [040. Skill 版本管理五大原则：从越改越差到持续演进](ch07-040-skill-版本管理五大原则-从越改越差到持续演进.html)
- [041. Skill Craft — Claude Skill 质量工程框架](ch07-041-skill-craft-claude-skill.html)
- [042. SkillX — 层次化技能知识库](ch07-042-skillx.html)
- [043. Skill Craft：Claude Skill 质量工程工具](ch07-043-skill-craft-claude-skill-质量工程工具.html)
- [044. Anthropic MCP 重新定义：Tool Search + 代码编排](ch07-044-anthropic-mcp-重新定义-tool-search-代码编排.html)
- [045. 重新定义Skill开发：保姆级教程&一站式开发助手发布](ch07-045-重新定义skill开发-保姆级教程-一站式开发助手发布.html)
- [046. 你写的 Skill，及格了吗？](ch07-046-你写的-skill-及格了吗.html)
- [047. 我用 SKILL.md 做了一个简历生成器](ch07-047-我用-skill-md-做了一个简历生成器.html)
- [048. AI + Skills 打通中间件迁移：Android 到鸿蒙定位服务实践](ch07-048-ai-skills-打通中间件迁移-android-到鸿蒙定位服务实践.html)
- [049. Skill 版本对比五大原则：从'两个数字比大小'到工程化质量门禁](ch07-049-skill-版本对比五大原则-从-两个数字比大小-到工程化质量门禁.html)
- [050. Multica — 开源 Managed Agents 平台](ch07-050-multica-managed-agents.html)
- [051. 龙虾之父教你省钱：开源Skill给你的Skill减肥](ch07-051-龙虾之父教你省钱-开源skill给你的skill减肥.html)
- [052. 如何构建生产准备的AI代理：MCP、CLI与技能——适合合适的工作的工具](ch07-052-如何构建生产准备的ai代理-mcp-cli与技能-适合合适的工作的工具.html)
- [053. CLI系列④·选型CLI、MCP还是API？](ch07-053-cli-cli-mcp-api.html)
- [054. 让 Amazon Quick 操作飞书：构建远程 MCP 服务的设计实践](ch07-054-让-amazon-quick-操作飞书-构建远程-mcp-服务的设计实践.html)
- [055. Introducing the MDN MCP server](ch07-055-introducing-the-mdn-mcp-server.html)
- [056. 当我把AI变成一个\"算法\"：Skill工程化设计的心路历程](ch07-056-ai-skill.html)
- [057. Create Custom MCP Catalogs and Profiles](ch07-057-create-custom-mcp-catalogs-and-profiles.html)
- [058. 25个Skills详解：从生产力清单到AI工作流资产](ch07-058-25-skills-ai.html)
- [059. Perplexity 首次公开了内部 Skill 设计指南](ch07-059-perplexity-首次公开了内部-skill-设计指南.html)
- [060. Anthropic 官方生产级 Agent 最佳实践：12 个可复用的 MCP 设计模式](ch07-060-anthropic-官方生产级-agent-最佳实践-12-个可复用的-mcp-设计模式.html)
- [061. Skill自进化三路线：Trace2Skill归纳法 / EvoSkill验证闭环 / SkillOpt训练范式](ch07-061-skill-trace2skill-evoskill-skillopt.html)
- [062. Microsoft Agent Framework Tools 总览：4 类工具 + Provider 矩阵 + Tool Approval](ch07-062-鹅厂-skill-写作完整-playbook-14-章节-end-to-end-实战-工程化评估-腾讯一线踩坑.html)
