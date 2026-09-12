# Martin Fowler AI 研发 Harness：非确定性承重层

> 📊 Level ⭐ | 4.9KB | `entities/martin-fowler-ai-rd-harness-nondeterminism.md`

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.8**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/martin-fowler-ai-rd-harness-nondeterminism.md`，一手来源仍见下方 sources。

## 机制与论文
- [AgentScope Java Harness Framework 2.0 — 企业级 Agent 分布式场景的 Harness 实现 (Java 2.0 重大升级)](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentscope-java-harness-framework-enterprise-distributed.md) — AgentScope Java全版
- [晓斌：从 People-Oriented 到 Agent-Oriented Infra —— 意图驱动 + 代码沉淀的进化体](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-oriented-infra-intent-driven-code-sedimentation.md) — Agent-Oriented Infra长文
- [Agent Harness 架构设计与实现：生产级 Agent 系统落地指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-architecture-design-production-guide.md) — 七层金字塔生产指南
- [Kimi Work：通用 Agent 战场从云端迁移到本地](https://github.com/QianJinGuo/wiki-public/blob/main/entities/kimi-work-codex-vibe-working-paradigm-shift.md) — Vibe Working开启+本地Harness 20356字rv9
- [Rein：4 模块 + 5 类型边界防止 agent.go 膨胀到 3000 行](https://github.com/QianJinGuo/wiki-public/blob/main/entities/rein-go-agent-4-modules-5-type-boundaries.md) — 4模块+5类型边界+7不变量：数据契约防上帝文件
- [Hugging Face AI Agent 术语表：Model / Agent / Scaffolding / Harness / Context Engineering / Policy / Tool / Skill / Sub-agent 完整区分](https://github.com/QianJinGuo/wiki-public/blob/main/entities/huggingface-ai-agent-glossary-model-scaffolding-harness-tool-skill-subagent.md) — HF术语表16399字：Scaffolding/Harness/Policy辨析
- [State of Memory in Agent Harness — mem0 视角的九大 harness 横评](https://github.com/QianJinGuo/wiki-public/blob/main/entities/state-of-memory-in-agent-harness-mem0-2026.md) — 九大harness记忆横评
- [Coding Harness 工程本质：从 Pi 到 OpenClaw](https://github.com/QianJinGuo/wiki-public/blob/main/entities/pi-openclaw-coding-harness.md) — Harness八能力+五工程模式：Context像投影8441字rv9
- [Context Window Management Comparison](https://github.com/QianJinGuo/wiki-public/blob/main/entities/context-window-management-comparison.md) — 四框架对比rv9
- [Harness Engineering 综合论述：为什么 2026 年真正重要的是它（含 ECC 开源实现案例）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-paradigm-comprehensive-2026.md) — 综合论述17305字含ECC案例rv9
- [Anthropic N-days: Frontier Agent Vulnerability Research](../ch04/315-anthropic-n-days-frontier-agent-vulnerability-research.html) — N-day研究
- [Martin Fowler AI 研发提醒：Harness 承重层](https://github.com/QianJinGuo/wiki-public/blob/main/entities/martin-fowler-ai-rd-harness-nondeterminism-devnote.md) — Fowler：非确定性协作者+Harness承重层10228字rv9全版
- [The Coming Loop](../ch01/479-the-coming-loop.html) — Ronacher两种循环区分
- ['Harness 之后：状态边界与失败闭环（若飞续篇）'](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-之后-状态边界与失败闭环-ruofei.md) — 运行时契约/提交闸门/失败回写10308字全版

## 工程实践
- ['长周期 Agent 详解：从 Ralph Loop 到可接管 Harness'](https://github.com/QianJinGuo/wiki-public/blob/main/entities/long-running-agent-ralph-loop-handover-harness-ruofei.md) — 三类漂移+5张卡治理12390字rv10全版
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-vibe-coding-agentic-engineering-v4.md) — v4 8090字rv10：可验证性上限+MenuGen警示
- [柚漫剧 AI 全流程提效拆解](https://github.com/QianJinGuo/wiki-public/blob/main/entities/yumanju-ai-full-flow-efficiency.md) — rv10全流程提效规则基建
- [Claude Code 源码核心机制详解](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-core-internals.md) — 源码机制18k主版
- [Harness Engineering：让 Coding Agent 可靠完成长程任务](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-long-term-agent-tasks.md) — 长程任务四原则+3000行粒度公式rv9
- [wow-harness v3：AI 开发的治理协议](https://github.com/QianJinGuo/wiki-public/blob/main/entities/wow-harness-v3-governance-protocol.md) — 事件溯源跨session治理协议
- [Codex /goal：长任务Agent的目标运行时](https://github.com/QianJinGuo/wiki-public/blob/main/entities/codex-goal-agent-runtime.md) — goal运行时rv9主版
- [高德 AI-Native 生产线（第 3 期）：7x24 Self-Healing Pipeline + Agent 自进化](https://github.com/QianJinGuo/wiki-public/blob/main/entities/gaode-ai-native-7x24-pipeline-self-healing.md) — 7×24自愈生产线15428字rv9全版
- [Harness Engineering 综合性指南（ConardLi 系列 · 含 Beautiful Article 实证 + Reacticle 协议）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-comprehensive-guide-conardli.md) — ConardLi六层架构14634字rv9
- [Perplexity Computer Empirical Study: How AI Agents Reshape Knowledge Work](https://github.com/QianJinGuo/wiki-public/blob/main/entities/perplexity-computer-knowledge-work-empirical-study.md) — 105天HBS级实证：行为从搜索转向验证

## 延伸导航
- [Agent 工程全景指南](https://github.com/QianJinGuo/wiki-public/blob/main/moc/agent-engineering-guide.md)

---

