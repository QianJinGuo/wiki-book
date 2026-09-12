# Anthropic 官方 Agent Harness 平台：Claude Managed Agents 完整指南

> 📊 Level ⭐ | 5.4KB | `entities/anthropic-官方-agent-harness-平台claude-managed-agents-完整指南.md`

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.8**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/anthropic-官方-agent-harness-平台claude-managed-agents-完整指南.md`，一手来源仍见下方 sources。

## 机制与论文
- [晓斌：从 People-Oriented 到 Agent-Oriented Infra —— 意图驱动 + 代码沉淀的进化体](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-oriented-infra-intent-driven-code-sedimentation.md) — Agent-Oriented Infra长文
- [Agent Harness Engineering: A Survey](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-engineering-survey-2026.md) — harness工程survey
- [Harness 到底是什么？看看 OpenClaw、Hermes、Claude Code 的演绎吧](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-7-layers-openclaw-hermes-claude-code-p1anu.md) — 三框架演绎七层模型12857字rv9
- [Claude Opus 4.7 发布分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-opus-4-7-launch.md) — 4.7发布分析
- [刚刚Opus 4.7发布，相比4.6核心变化，与Claude Code搭配最佳实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/刚刚opus-47发布相比46核心变化与claude-code搭配最佳实践.md) — 6588字最全发布分析
- [Anthropic N-days: Frontier Agent Vulnerability Research](../ch04/315-anthropic-n-days-frontier-agent-vulnerability-research.html) — N-day研究
- [Claude Opus 4.8 系统卡片深度分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-opus-48-system-card-analysis.md) — RSP放松批判
- [王云鹤眼中的Harness：复杂优化问题，AGI灵魂争夺之战](https://github.com/QianJinGuo/wiki-public/blob/main/entities/wangyunhe-harness-optimization-agentsoul.md) — Agent=Models+Harness联合优化
- [Claude 4/5 Sonnet & Opus Release Notes](428-claude-4-5-sonnet-opus-release-notes.html) — 发布时间线与能力
- [LLM 自我提升系统综述 — Yang 等 113 页四阶段闭环框架（Zesearch NLP Lab）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/llm-self-improvement-system-survey-zesearch-nlp-2026.md) — 113页自提升综述：四阶段闭环+评估控制层

## 工程实践
- ['Harness Engineering：AI 从](../ch05/061-harness-engineering.html) — 六层架构+七大反模式+分级决策树19712字rv9
- [Claude Harness 设计：Generator-Evaluator 架构与 Context Reset 演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-generator-evaluator-anthropic.md) — Generator-Evaluator+context reset 10329字rv9全版
- [刚刚Opus 4.7发布，相比4.6核心变化，与Claude Code搭配最佳实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/opus-4-7-launch-claude-code-best-practices-wechat.md) — Opus 4.7核心变化+CC六新功能14779字rv9
- ['Harness Engineering：AI 能在真正](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineeringai-能在真正出事会炸的后端系统里写代码吗.md) — 腾讯CDN LEGO五层架构+对抗式CR全版
- [CLAUDE.md](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-source-leak-lifecycle-analysis.md) — 8步生命周期10k
- [Claude Code Skills / MCP / Rules 源码分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-skills-mcp-rules-source-analysis.md) — 三个注入位置
- [Anthropic Claude Managed Agents 平台正式发布](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-claude-managed-agents-platform-2026.md) — 平台发布14k主版
- [阿里工程师 Harness 工程化实践 (双案例合并)](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-alibaba-java-case-study.md) — 阿里Java双案例合并15565字全版
- [Harness不是目的，知识才是护城河 —— 一个AI工程交付团队的知识沉淀实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness不是目的知识才是护城河-一个ai工程交付团队的知识沉淀实践.md) — 知识五层存储×五类型×三成熟度15831字
- [Anthropic Institute《When AI builds itself》深度解读：AI 进入 AI 研发执行层、瓶颈迁移与研发级 Harness（架构师 JiaGouX）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-institute-when-ai-builds-itself-jiagoux-interpretation.md) — 解读短条borderline
- [面向大型代码库的 Claude Code 团队落地经验与扩展策略（Agent Harness）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-large-codebase-team-deployment-agent-harness.md) — 13模式全版
- [我把 Karpathy 的 AutoResearch 搬到了软件开发领域，效果炸了](https://github.com/QianJinGuo/wiki-public/blob/main/entities/我把-karpathy-的-autoresearch-搬到了软件开发领域效果炸了.md) — val loss换多维评分
- [精选 10 个开发者常用的 AI 智能体技能（Agent Skills）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/精选-10-个开发者常用的-ai-智能体技能agent-skills.md) — 四类技能质量筛选节点
- [你写的 Skill，及格了吗？](https://github.com/QianJinGuo/wiki-public/blob/main/entities/你写的-skill及格了吗.md) — D1元数据定生死评估框架

## 延伸导航
- [Anthropic 生态与战略](https://github.com/QianJinGuo/wiki-public/blob/main/moc/anthropic-ecosystem.md)

## 关联

- 同题异语种孪生页：[Claude Managed Agents Developer Guide](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-managed-agents-developer-guide.md)（归并候选，提案卡 #11 批1）
- 同题异语种孪生页：[Anthropic Agent Skills Design Patterns 14](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-agent-skills-design-patterns-14.md)（归并候选，提案卡 #11 批1）
- 同题异语种孪生页：[Anthropic Claude Code Large Codebase Best Practices 50002A089323](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-claude-code-large-codebase-best-practices-50002a089323.md)（归并候选，提案卡 #11 批1）

---

