# Harness Engineering 系统梳理

> 📊 Level ⭐ | 5.4KB | `entities/harness-engineering-systematic-framework.md`

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.75**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/harness-engineering-systematic-framework.md`，一手来源仍见下方 sources。

## 机制与论文
- [Agent Harness Engineering: A Survey](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-engineering-survey-2026.md) — harness工程survey
- [Agent Harness 架构设计与实现：生产级 Agent 系统落地指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-architecture-design-production-guide.md) — 七层金字塔生产指南
- [Harness 到底是什么？看看 OpenClaw、Hermes、Claude Code 的演绎吧](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-7-layers-openclaw-hermes-claude-code-p1anu.md) — 三框架演绎七层模型12857字rv9
- [Hermes Agent 深度解析（阿里云/飞樰）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-deep-dive.md) — 自进化内外双路径+四维工程7934字rv9全版
- [Hugging Face AI Agent 术语表：Model / Agent / Scaffolding / Harness / Context Engineering / Policy / Tool / Skill / Sub-agent 完整区分](https://github.com/QianJinGuo/wiki-public/blob/main/entities/huggingface-ai-agent-glossary-model-scaffolding-harness-tool-skill-subagent.md) — HF术语表16399字：Scaffolding/Harness/Policy辨析
- [Harness Engineering for Self-Improvement — 翁荔 Lilian Weng 系统梳理 Harness 自我提升研究全景](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-self-improvement-survey-lilian-weng.md) — 翁荔RSI全景：ACE→MCE→DGM谱系
- [Agentic Loop Engineering 工程手册：17 种 Loop 工程化技术的可复现实证框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentic-loop-engineering-handbook-empirical-framework.md) — 17种loop实证
- [生产级 Harness 的 12 大组件以及主流框架对比](https://github.com/QianJinGuo/wiki-public/blob/main/entities/production-harness-12-components-framework-comparison.md) — 12组件+OS类比：TerminalBench 30名外→第5名9722字rv9
- [王云鹤眼中的Harness：复杂优化问题，AGI灵魂争夺之战](https://github.com/QianJinGuo/wiki-public/blob/main/entities/wangyunhe-harness-optimization-agentsoul.md) — Agent=Models+Harness联合优化
- [Is Grep All You Need? — 检索 × Harness × 交付方式耦合三元组（PwC 论文 arXiv 2605.15184 解读）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/is-grep-all-you-need-pwc-retrieval-harness-coupling.md) — grep vs vector×harness×交付耦合三元组rv9
- [Hidden Technical Debt of AI Systems: Agent Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hidden-technical-debt-agent-harness.md) — Harness层五维技术债
- [AI Coding 的底层框架：一切优化都是在对抗熵增——信息论视角](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-coding-entropy-framework-baidu-geek-2026.md) — 信息论统一框架
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](https://github.com/QianJinGuo/wiki-public/blob/main/entities/深入理解-claude-code-源码中的-agent-harness-构建之道.md) — 16095字源码8步循环
- [刚刚，翁荔博客又上新：通过Harness工程实现AI自我提升](https://github.com/QianJinGuo/wiki-public/blob/main/entities/刚刚翁荔博客又上新通过harness工程实现ai自我提升.md) — RSI路径与七挑战

## 工程实践
- ['Harness Engineering：AI 从](061-harness-engineering.html) — 六层架构+七大反模式+分级决策树19712字rv9
- [Claude Harness 设计：Generator-Evaluator 架构与 Context Reset 演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-generator-evaluator-anthropic.md) — Generator-Evaluator+context reset 10329字rv9全版
- [深度拆解 Claude Code：12 个可复用的 Agentic Harness 设计模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-agentic-harness-design-patterns.md) — 12个harness模式
- [Harness Engineering 综合性指南（ConardLi 系列 · 含 Beautiful Article 实证 + Reacticle 协议）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-comprehensive-guide-conardli.md) — ConardLi六层架构14634字rv9
- [Impeccable：把 AI 前端设计变成可检查的工作流 — 33.4k Star 开源项目深度分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/impeccable-frontend-design-skill-harness-vibecoder.md) — Impeccable四层架构9210字rv9全版
- [Subagents 详解：Claude Code 如何避免上下文污染](https://github.com/QianJinGuo/wiki-public/blob/main/entities/subagents-详解claude-code-如何避免上下文污染.md) — 上下文卫生subagent详解
- [超级个体到超级组织：李志飞 CodeBanana 组织转型实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/super-individual-to-super-organization-tencent-research-2026.md) — 超级组织转型CodeBanana
- [CLAUDE.md](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-source-leak-lifecycle-analysis.md) — 8步生命周期10k
- [QQ音乐 Harness Engineering 实践（大仓多服务场景）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/qq-music-harness-engineering-monorepo-microservices.md) — 代码产出=AI能力×上下文质量（乘法）15606字rv9
- [Harness 减法工程——删掉 61% 之后什么该留（L0-L3 四层归属）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tdsql-harness-subtraction-l0-l3-tencent-2026-08-06.md) — 减法工程L0-L3四层归属

---

