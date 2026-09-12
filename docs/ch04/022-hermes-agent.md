# Hermes Agent 记忆系统深度拆解

> 📊 Level ⭐ | 4.9KB | `entities/hermes-agent-memory-system-vs-openclaw.md`

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.8**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/hermes-agent-memory-system-vs-openclaw.md`，一手来源仍见下方 sources。

## 机制与论文
- [深度拆解 Hermes Agent 记忆系统](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-memory-system-openclaw-comparison.md) — 记忆成本账四层体系15260字rv10最深版
- [17种Agent架构演进：控制流设计的完整演化史](https://github.com/QianJinGuo/wiki-public/blob/main/entities/17-agent-architectures-evolution.md) — 17架构系统拆解高价值
- [AI Agent 架构设计（七）：Skills 系统设计（OpenClaw、Claude Code、Hermes Agent 对比）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-system-design-three-way-comparison.md) — 三框架skill系统设计对比
- [Coding Harness 工程本质：从 Pi 到 OpenClaw](https://github.com/QianJinGuo/wiki-public/blob/main/entities/pi-openclaw-coding-harness.md) — Harness八能力+五工程模式：Context像投影8441字rv9
- [Context Window Management Comparison](https://github.com/QianJinGuo/wiki-public/blob/main/entities/context-window-management-comparison.md) — 四框架对比rv9
- [800行代码实现 Open Claw 的 Tool、消息总线、子Agent管理架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/open-claw-tool-bus-subagent-architecture.md) — 薄抽象显式控制流8802字rv9全版
- [Hermes Agent 闭环学习机制](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-closed-learning-loop.md) — 闭环学习飞轮+Nudge触发+spawn_background_review
- [深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-prompt-context-harness.md) — 三维度源码：23模块拼装+自适应分块+双层Memory
- [How AI Agent Memory Works](114-how-ai-agent-memory-works.html) — 记忆五层+六架构权衡科普
- [Skill 系统：Agent 如何把经验沉淀成可复用能力](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-skill-system-winty.md) — Memory vs Skill本质区别7749字最全版
- [Hermes Agent 为什么火了？和 OpenClaw 龙虾比一比](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-vs-openclaw-comparison.md) — 爱马仕vs龙虾：控制面vs成长型定位对比
- [Gepa Optimize Anything](../ch01/455-gepa-optimize-anything.html) — ASI+Pareto前沿，声明式通用文本优化API
- [Hermes自进化完整闭环：Skill创建复用修补链路](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-self-evolution-closed-loop-skill-reuse-winty.md) — 6阶段闭环+npm案例12→9→6步
- [AI Agent Gateway 架构设计 — OpenClaw/Claude Code/Hermes 三框架对比](https://github.com/QianJinGuo/wiki-public/blob/main/entities/gateway-architecture-openclaw-claude-hermes-comparison.md) — 三框架Gateway哲学横向对比，源码级细节
- [nanobot：4000行极简 Agent 框架架构解析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/nanobot-agent-framework-architecture-deep-dive.md) — 3935行vs LangChain 43万行的极简哲学
- [Claude Code vs Hermes — Session 工程师 vs Goal Runtime](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-vs-hermes-session-vs-goal-lifecycle.md) — session vs goal
- [OpenClaw与Hermes源码架构对比](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-hermes-source-code-agent-architecture-review.md) — 双框架源码对比：OpenClaw四亮点+Hermes四补充

## 工程实践
- [Impeccable：把 AI 前端设计变成可检查的工作流 — 33.4k Star 开源项目深度分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/impeccable-frontend-design-skill-harness-vibecoder.md) — Impeccable四层架构9210字rv9全版
- [Claude Code Prompt 提示词体系源码解析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-prompt-source-analysis.md) — 六大prompt模块全版
- [MemOS Hermes 记忆插件](https://github.com/QianJinGuo/wiki-public/blob/main/entities/memos-hermes-plugin.md) — MemOS插件：智能去重+混合检索7225字
- [数据级 Harness：架构师 JiaGouX 解读 Anthropic 95% 数据分析与 5 个反直觉边界](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-95pct-data-analysis-jiagoux-data-level-harness-20260606.md) — 数据级harness解读
- [高德 Marketing AutoResearch：AI Native 营销增长经营托管框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/autoresearch-marketing-growth-amap-ai-native.md) — 营销经营托管
- [存之有序，治之有矩——Agent 记忆系统的工程实践与演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/存之有序治之有矩agent-记忆系统的工程实践与演进.md) — 写入纪律prompt cache冲突
- [阿里云 MSE AI 任务调度 + Agent Sandbox：动态休眠/唤醒 OpenClaw Agent 成本下降 90%+](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aliyun-mse-ai-task-scheduling-agent-sandbox-cost-90-percent.md) — 休眠唤醒短条borderline

## 延伸导航
- [OpenClaw 的架构设计为什么值得研究？它与 Hermes/Claude Code 的核心差异？](https://github.com/QianJinGuo/wiki-public/blob/main/moc/openclaw-architecture.md)
- [Agent Memory 架构选择的关键决策点是什么？](https://github.com/QianJinGuo/wiki-public/blob/main/moc/agent-memory-architecture-decision-points.md)
- [Agent 工程全景指南](https://github.com/QianJinGuo/wiki-public/blob/main/moc/agent-engineering-guide.md)

---

