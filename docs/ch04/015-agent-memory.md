# Agent Memory 架构本质

> 📊 Level ⭐ | 5.1KB | `entities/agent-memory-architecture.md`

# Agent Memory 架构本质

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.85**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/agent-memory-architecture.md`，一手来源仍见下方 sources。

## 机制与论文
- [AgentScope Java Harness Framework 2.0 — 企业级 Agent 分布式场景的 Harness 实现 (Java 2.0 重大升级)](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentscope-java-harness-framework-enterprise-distributed.md) — AgentScope Java全版
- [Agent Harness 架构设计与实现：生产级 Agent 系统落地指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-architecture-design-production-guide.md) — 七层金字塔生产指南
- [Context Window Management Comparison](https://github.com/QianJinGuo/wiki-public/blob/main/entities/context-window-management-comparison.md) — 四框架对比rv9
- [AI Memory Architecture: Deep Dive](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-memory-architecture-deep-dive.md) — 29k记忆架构深度
- [AI Coding Agent 记忆系统](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-coding-agent-memory-system.md) — 分层记忆设计
- [Building for the Rising Complexity of Agentic Systems with Extreme Co-Design](https://github.com/QianJinGuo/wiki-public/blob/main/entities/nvidia-agentic-systems-extreme-co-design.md) — 三种交互模式+33分钟真实trace+prompt caching挑战
- [Self-Harness：上海AI Lab 提出的 Agent 自我改进 Harness 范式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/self-harness-shanghai-ai-lab-agent-improves-harness.md) — Self-Harness范式14191字深度
- [Prime Agent — 以 RLM + Continual Harness 双抽象为核心的自改进编码 Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/prime-agent-self-improving-rlm-agent.md) — RLM+Continual Harness：harness状态可CRUD

## 工程实践
- ['长周期 Agent 详解：从 Ralph Loop 到可接管 Harness'](https://github.com/QianJinGuo/wiki-public/blob/main/entities/long-running-agent-ralph-loop-handover-harness-ruofei.md) — 三类漂移+5张卡治理12390字rv10全版
- [Loop Engineering:不再写提示词,而是设计替你写提示词的循环——先写刹车再写循环（19 来源深度合并：Addy Osmani / Boris Cherny+Peter Steinberger / 教科书 / 若飞 工程现场 / TechFarrari 批判 / 若飞 实用指南 / 爱范儿 科普批判 / AllenTang Karpathy 尺子 / winty 7架构中文主流视角 / AutoResearch 5 决策 / 三层结构 + 三款产品对比 + Ralph Loop + 准备度总表 / Shubham Saboo PM 视角 / 若飞 吴恩达三层Loop）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/loop-engineering-addy-osmani-challengehub.md) — 19来源合并Loop Engineering巨著73742字rv10
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-vibe-coding-agentic-engineering-v4.md) — v4 8090字rv10：可验证性上限+MenuGen警示
- [Claude Code 源码核心机制详解](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-core-internals.md) — 源码机制18k主版
- [Claude Code Openclaw Memory Comparison](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-openclaw-memory-comparison.md) — 记忆系统对比rv9
- [Harness Engineering 综合性指南（ConardLi 系列 · 含 Beautiful Article 实证 + Reacticle 协议）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-comprehensive-guide-conardli.md) — ConardLi六层架构14634字rv9
- [CPU 缓存类比下的 Agent 上下文管理：L1/L2/L3 层级架构与 execute_code 单工具设计](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cpu-cache-analogy-agent-context-management-liwen.md) — L1/L2/L3缓存类比
- [Fable 5 的信号:Agent 开始拼 Runtime — 架构师若飞的 Runtime Contract 工程化拆解](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-fable-5-agent-runtime-contract-ruofei-2026.md) — Runtime Contract拆解
- [Claude Code Openclaw Usage Ettin](../ch09/105-claude-code-openclaw-usage-ettin.html) — Ettin rerank集成
- [Personal AI 工作台：Claude 18 动作框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ruofei-personal-ai-workbench-18-actions.md) — Personal Harness六层工作台：环境工程>提示词技巧
- [场景营销前端 AI Coding — 从问题到方案](https://github.com/QianJinGuo/wiki-public/blob/main/entities/frontend-ai-coding-problem-to-solution-taobao.md) — 注意力坍塌+外置DeepResearch分离
- [Harness Engineering 系统性解读](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-systematic-explainer.md) — 李宏毅课程解读7933字最全版
- [腾讯 Token 优化实战 — 省 Token 和用好 AI 是同一件事](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tencent-token-optimization-agent-architecture.md) — context rot四步工程化
- [Claude Code 27 条技巧：从工具清单到工程升级路径](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-27-tips-engineering-upgrade-jiagoux-2026.md) — 27技巧全版
- [如何利用 AgentCore + OpenViking 快速搭建具备高效记忆的 Agent](https://github.com/QianJinGuo/wiki-public/blob/main/entities/如何利用-agentcore-openviking-快速搭建具备高效记忆的-agent.md) — 双方案记忆选型四维
- [百亿补贴 C 端 AI Coding 实战：基于 SDD 的服务端 AI Coding 实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/百亿补贴-c-端-ai-coding-实战基于-sdd-的服务端-ai-coding-实践.md) — spec唯一真相源自进化记忆

---

