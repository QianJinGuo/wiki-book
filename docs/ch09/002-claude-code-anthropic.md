# Claude Code 大型代码库最佳实践 — Anthropic 企业级部署指南

> 📊 Level ⭐ | 5.2KB | `entities/claude-code-large-codebase-enterprise-deployment.md`

# Claude Code 大型代码库最佳实践 — Anthropic 企业级部署指南

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.8**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/claude-code-large-codebase-enterprise-deployment.md`，一手来源仍见下方 sources。

## 机制与论文
- [晓斌：从 People-Oriented 到 Agent-Oriented Infra —— 意图驱动 + 代码沉淀的进化体](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-oriented-infra-intent-driven-code-sedimentation.md) — Agent-Oriented Infra长文
- [SkillOpt](../ch05/055-skillopt.html) — SkillOpt最全8328字rv10
- [Harness 到底是什么？看看 OpenClaw、Hermes、Claude Code 的演绎吧](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-7-layers-openclaw-hermes-claude-code-p1anu.md) — 三框架演绎七层模型12857字rv9
- [Claude Opus 4.7 发布分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-opus-4-7-launch.md) — 4.7发布分析
- [刚刚Opus 4.7发布，相比4.6核心变化，与Claude Code搭配最佳实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/刚刚opus-47发布相比46核心变化与claude-code搭配最佳实践.md) — 6588字最全发布分析
- [Context Window Management Comparison](https://github.com/QianJinGuo/wiki-public/blob/main/entities/context-window-management-comparison.md) — 四框架对比rv9
- [Harness Engineering 综合论述：为什么 2026 年真正重要的是它（含 ECC 开源实现案例）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-paradigm-comprehensive-2026.md) — 综合论述17305字含ECC案例rv9
- [Anthropic N-days: Frontier Agent Vulnerability Research](../ch04/312-anthropic-n-days-frontier-agent-vulnerability-research.html) — N-day研究
- [800行代码实现 Open Claw 的 Tool、消息总线、子Agent管理架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/open-claw-tool-bus-subagent-architecture.md) — 薄抽象显式控制流8802字rv9全版
- [王云鹤眼中的Harness：复杂优化问题，AGI灵魂争夺之战](https://github.com/QianJinGuo/wiki-public/blob/main/entities/wangyunhe-harness-optimization-agentsoul.md) — Agent=Models+Harness联合优化
- [深度拆解：AI 智能体 Harness 的构造（译）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-agent-harness-construction-akshay.md) — harness构造译全版

## 工程实践
- [Loop Engineering:不再写提示词,而是设计替你写提示词的循环——先写刹车再写循环（19 来源深度合并：Addy Osmani / Boris Cherny+Peter Steinberger / 教科书 / 若飞 工程现场 / TechFarrari 批判 / 若飞 实用指南 / 爱范儿 科普批判 / AllenTang Karpathy 尺子 / winty 7架构中文主流视角 / AutoResearch 5 决策 / 三层结构 + 三款产品对比 + Ralph Loop + 准备度总表 / Shubham Saboo PM 视角 / 若飞 吴恩达三层Loop）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/loop-engineering-addy-osmani-challengehub.md) — 19来源合并Loop Engineering巨著73742字rv10
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](https://github.com/QianJinGuo/wiki-public/blob/main/entities/boris-cherny-新访谈开发工具正在从-ide-变成-agent-控制台.md) — Boris访谈rv10全版
- [Claude Code 源码核心机制详解](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-core-internals.md) — 源码机制18k主版
- [Claude Code Openclaw Memory Comparison](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-openclaw-memory-comparison.md) — 记忆系统对比rv9
- [Claude Code 可控性：软规则无法变成硬约束](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-governance-soft-rules.md) — 200k Ghost治理主版
- [Anthropic发布「AI原生创业公司」手册：涵盖全流程四大核心阶段，一人公司法典来了](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-ai-native-startup-handbook.md) — 创业四阶段手册
- [刚刚Opus 4.7发布，相比4.6核心变化，与Claude Code搭配最佳实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/opus-4-7-launch-claude-code-best-practices-wechat.md) — Opus 4.7核心变化+CC六新功能14779字rv9
- [Anthropic 内部 95% 数据分析自动化：分析 Agent 技术栈 + Skill 框架（21%→95% 准确率）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-95pct-data-analysis-skill-stack-architecture.md) — 95%技术栈26k
- [MAC（multi-agent-coding）：Skills + Hooks 两层 Harness —— 完全委托 0-20% 的解法](https://github.com/QianJinGuo/wiki-public/blob/main/entities/mac-multi-agent-coding-skills-hooks-harness.md) — Skills概率层+Hooks确定性层两层Harness
- [Claude Code 一周年回顾：Boris Cherny + Cat Wu 的完整时间线](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-first-year-retrospective-boris-cat-2026.md) — 一周年回顾14k主版
- [Claude Code 在大型代码库中的实战经验：从哪里入手？怎么做对？](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-large-codebase-harness-configuration.md) — 大型代码库17k原版
- [Claude Code Routines：从工具到队友的主动 Agent 模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-routines-proactive-agent.md) — Routines三能力
- [Claude Code 七种自定义方法：官方全景指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-seven-customization-methods-anthropic-official.md) — 七种自定义对比

## 延伸导航
- [Claude Code 生态完全指南](https://github.com/QianJinGuo/wiki-public/blob/main/moc/claude-code-complete-guide.md)
- [Loop Engineering 主题地图 (MOC)](https://github.com/QianJinGuo/wiki-public/blob/main/moc/loop-engineering.md)

---

