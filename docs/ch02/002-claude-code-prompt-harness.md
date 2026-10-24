# Claude Code Prompt 与上下文 Harness 设计

> 📊 Level ⭐ | 4.8KB

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.8**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/claude-code-prompt-context-harness.md`，一手来源仍见下方 sources。

## 机制与论文
- [AgentScope Java Harness Framework 2.0 — 企业级 Agent 分布式场景的 Harness 实现 (Java 2.0 重大升级)](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentscope-java-harness-framework-enterprise-distributed.md) — AgentScope Java全版
- [晓斌：从 People-Oriented 到 Agent-Oriented Infra —— 意图驱动 + 代码沉淀的进化体](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-oriented-infra-intent-driven-code-sedimentation.md) — Agent-Oriented Infra长文
- [Coding Harness 工程本质：从 Pi 到 OpenClaw](https://github.com/QianJinGuo/wiki-public/blob/main/entities/pi-openclaw-coding-harness.md) — Harness八能力+五工程模式：Context像投影8441字rv9
- Anthropic N-days: Frontier Agent Vulnerability Research — N-day研究
- [一篇看懂 Agent Harness 的结构！ — 12组件+7决策完整框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-12-components-7-decisions.md) — harness 12组件框架
- 深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践 — 三维度源码：23模块拼装+自适应分块+双层Memory
- [GLM-5.2 is the step change for open agents](https://github.com/QianJinGuo/wiki-public/blob/main/entities/glm-52-is-the-step-change-for-open-agents.md) — Interconnects评GLM-5.2开放Agent跃迁
- [Agent Harness 解析：智能体架构深度拆解](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-architecture-deep-dive-aksahy.md) — harness解剖深度
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](https://github.com/QianJinGuo/wiki-public/blob/main/entities/深入理解-claude-code-源码中的-agent-harness-构建之道.md) — 16095字源码8步循环
- [从 Prompt 到 Harness：Claude 官方学习资料](https://github.com/QianJinGuo/wiki-public/blob/main/entities/from-prompt-to-harness-claude-official.md) — Harness五子系统闭环解读
- [原始文章存档](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-search-architecture-tencent-2026.md) — ripgrep五层过滤
- [Claude Opus 4.7 并不是一次全面升级，甚至部分能力大幅衰退](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-opus-47.md) — 4.7衰退面分析
- [复旦北大 AHE：Agentic Harness Engineering 瓶颈分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/fudan-peking-ahe-agentic-harness-engineering.md) — AHE三支柱可观测性5622字深析版
- [Claude Code and What Comes Next](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-and-what-comes-next.md) — 压缩/Skills/Subagents

## 工程实践
- Tencent Vibe Coding to Agentic Engineering Backend — 全流程串终端会话实践
- [高德广告工程 Harness/SDD 体系演进：从\](https://github.com/QianJinGuo/wiki-public/blob/main/entities/gaode-sdd-harness-team-ai-coding-paradigm-ibjfu.md) — SDD+Harness团队级范式11119字
- Build a serverless image editing agent with Amazon Bedrock AgentCore harness — 图像编辑agent
- AWS Bedrock Agentcore Quality Optimization Flywheel — 质量飞轮
- [AI 生产开发工作流：OpenSpec 规范驱动 + Superpowers 工具链](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-production-development-workflow-openspec-superpowers-gstack.md) — 三件套工作流
- [2 小时，0 行手写代码，我用 Claude 做了一个生产级 VSCode 插件](https://github.com/QianJinGuo/wiki-public/blob/main/entities/2-小时0-行手写代码我用-claude-做了一个生产级-vscode-插件.md) — 实践复盘有具体经验教训
- [Claude Code 上下文工程 —— Anthropic 团队的工程实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-context-engineering-anthropic-thariq.md) — 上下文工程官方表述
- [Anthropic Managed Agents：用 K8s 思路虚拟化 Agent 组件](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-managed-agents-scaling.md) — 宠物到牛群
- [长周期-agent-详解-从-ralph-loop-到可接管-harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/长周期-agent-详解-从-ralph-loop-到可接管-harness.md) — Ralph loop到接管harness
- [从零复刻 Claude Code：Harness 构建学习笔记](https://github.com/QianJinGuo/wiki-public/blob/main/entities/准备开一个新坑从零复刻一个-claude-codenn目标是在这个过程中和大家一起学习-claude-code-的-harness-是如何做的nnclaude-.md) — easy-agent复刻路线图

## 延伸导航
- [Agent 工程全景指南](https://github.com/QianJinGuo/wiki-public/blob/main/moc/agent-engineering-guide.md)

## 关联

- 同题异语种孪生页：[深入理解 Claude Code 源码中的 Agent Harness 构建之道 V2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/深入理解-claude-code-源码中的-agent-harness-构建之道-v2.md)（归并候选，提案卡 #11 批1）

---

