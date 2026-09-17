# Hermes Agent 自进化机制源码解析

> 📊 Level ⭐ | 5.3KB

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.75**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/hermes-agent-self-evolving.md`，一手来源仍见下方 sources。

## 机制与论文
- [深度拆解 Hermes Agent 记忆系统](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-memory-system-openclaw-comparison.md) — 记忆成本账四层体系15260字rv10最深版
- [SkillOS: Learning Skill Curation for Self-Evolving Agents](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-os-learning-skill-curation-self-evolving-agents.md) — SkillOS策展RL架构清晰rv10
- [Hermes Agent Skill 互优化：SkillEvolver × Darwin × EmbodiSkill 4 轮闭环](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-skill-crossover-optimization.md) — SkillEvolver×Darwin×EmbodiSkill互优化13412字
- [Agent Memory 模块化框架与评测：Memory in the LLM Era 4 模块 + 10 方案对比 + 新方法 F1 38.79 + 4 条工程原则](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-memory-modular-framework.md) — 四组件统一框架
- [Agentic RL 六框架实践地图：从算法到系统的长程智能体训练](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentic-rl-frameworks-practices-long-horizon-wolfe-2026.md) — RL六框架地图
- [Hermes Agent 深度解析（阿里云/飞樰）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-deep-dive.md) — 自进化内外双路径+四维工程7934字rv9全版
- [LLM agent脚手架如何具备自进化能力？——以hermes agent为例](https://github.com/QianJinGuo/wiki-public/blob/main/entities/llm-agent脚手架如何具备自进化能力以hermes-agent为例.md) — Hermes自进化15402字最全版
- [Agent 记忆存储方案深度洞察：6 大流派分歧、Wiki 编译 vs 原始数据之争、Hermes Agent 启示](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-memory-storage-six-schools-wiki-compile-vs-raw-data-debate.md) — 六派之争全版
- [Harness Engineering 综合论述：为什么 2026 年真正重要的是它（含 ECC 开源实现案例）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-paradigm-comprehensive-2026.md) — 综合论述17305字含ECC案例rv9
- [Agent Harness Engineering: A Survey — ETCLOVG Taxonomy](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-engineering-survey-etcvlovg-taxonomy.md) — ETCLOVG分类补充
- [Claude Fable 5 提示词泄漏 — 1585 行 120K 字符的产品运行时控制平面与安全工程启示](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-fable-5-prompt-leak-runtime-control-plane-vibecoder-2026.md) — 1585行控制平面
- AI Memory Architecture: Deep Dive — 29k记忆架构深度
- [Memory in the LLM Era: Modular Architectures and Strategies in a Unified Framework](https://github.com/QianJinGuo/wiki-public/blob/main/entities/memory-in-the-llm-era-iclr2026.md) — 四组件统一框架10658字
- [深度解析 Hermes Agent 如何实现自进化及其 Prompt / Context / Harness 的设计实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-tools-research.md) — Hermes自进化解析

## 工程实践
- [滴滴 IBG 智能客服质检系统：3 管线（意图 86% / 合规 90%+ / VOC）+ 企业 LLM 落地方法论](https://github.com/QianJinGuo/wiki-public/blob/main/entities/didi-ibg-customer-experience-llm-quality-inspection-3-pipelines.md) — 三管线质检14k
- [Qoder Skills 完全指南 + Agent Skill 迭代式编写 — AI 按你的标准执行](https://github.com/QianJinGuo/wiki-public/blob/main/entities/qoder-skills-完全指南从零开始让-ai-按你的标准执行-v2.md) — 菜单菜谱比喻+三级渐进披露18168字rv9全版
- [Hermes Agent 满配 12 层配置完整指南（从裸装到 24h Agent 团队）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-12-layer-full-configuration-guide.md) — 12层满配指南11566字rv9
- [企业级 Skill 8 块最小骨架 + 8 条 checklist 设计规范](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-design-spec-8-block-checklist-winty.md) — 8块骨架checklist设计规范
- [Harness Engineering 综合性指南（ConardLi 系列 · 含 Beautiful Article 实证 + Reacticle 协议）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-comprehensive-guide-conardli.md) — ConardLi六层架构14634字rv9
- [Skill Hub：企业级 AI 经验资产化的关键（组织能力视角）— winty 前端Q 3 篇合集：组织资产 + 质量门禁 4 关 + 生命周期 6 阶段治理](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-hub-organization-asset-winty.md) — Skill组织资产化治理五件事
- [Karpathy CLAUDE.md — 四条行为准则让 AI 编程 Agent 减少结构性失败](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-claude-md-rules.md) — CLAUDE.md四行为准则rv9
- [Claude Code Skills 实战指南 — 发现机制、编写与安全](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-skills-practical-guide-discovery-frontmatter.md) — 发现机制与安全
- [Skill 版本管理五大原则：从越改越差到持续演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-version-management-semantic-versioning-practices-winty.md) — skill语义化版本五原则
- [Chromium AI Coding 开发体系](https://github.com/QianJinGuo/wiki-public/blob/main/entities/chromium-ai-coding-development-system.md) — Chromium AI基建

---

