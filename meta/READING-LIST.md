# 📚 Agent 工程精选阅读清单

> **从 3379 篇文章中提炼出的 Agent/AI 精读路线**
>
> 策略：先用 20 篇核心文章建立 Agent 工程全景认知（约 10 小时），
> 再用 30 篇补充文章深入各子领域，最后按需扩展到全部 ⭐⭐⭐ 文章。

---

## 📊 全局数据

| 指标 | 数值 |
|------|------|
| 全书总文章 | 3,379 篇 |
| ⭐⭐⭐ 必读 | 231 篇 (6.8%) |
| Agent 相关 ⭐⭐⭐ | **~90 篇** |
| Tier 1 冲刺 | 20 篇 (约 10 小时) |
| Tier 2 深入 | 30 篇 (约 12 小时) |
| Tier 3 全面 | 剩余 40+ 篇 (按需) |

---

## 🗺️ 学习路线总览

```
Tier 1: 建立全景 (20篇, ~10h)
  │
  ├─ 🏗️ Harness Engineering (5篇) — Agent 的工程基座
  ├─ 🧠 Agent Architecture (5篇) — 架构演进与设计范式
  ├─ 💾 Context & Memory (3篇) — 上下文管理核心
  ├─ 🤝 Multi-Agent (3篇) — 多智能体协作
  ├─ 💻 AI Coding Agent (2篇) — 编程 Agent 实战
  └─ 📏 Evaluation (2篇) — 评测方法论
  │
Tier 2: 深入子域 (30篇, ~12h)
  │
  ├─ Harness 进阶 (8篇)
  ├─ Agent 架构进阶 (8篇)
  ├─ Context/Memory 进阶 (4篇)
  ├─ Multi-Agent 进阶 (4篇)
  ├─ AI Coding 进阶 (3篇)
  └─ 工具与基础设施 (3篇)
  │
Tier 3: 全面覆盖 (40+篇, 按需)
```

---

## 🏆 Tier 1：核心冲刺 (20篇, 约 10 小时)

> **目标：10 小时内建立 Agent 工程的完整心智模型**
> 阅读顺序：按轨道并行，每个轨道内部按编号顺序

### 🏗️ 轨道 A：Harness Engineering (5篇, ~2.5h)

> Harness = Agent 的工程外壳，决定 Agent 能否在生产环境可靠运行

| # | 文件 | 标题 | 字数 | 预计 | 状态 |
|---|------|------|------|------|------|
| A1 | `docs/ch05/112-harness-engineering-ai.md` | **Harness Engineering：AI 能在真正"出事会炸"的后端系统里写代码吗？** | 2182 | 15min | ☐ |
| A2 | `docs/ch05/117-harness-engineering.md` | **Harness Engineering 四根支柱与四要素架构** | 847 | 8min | ☐ |
| A3 | `docs/ch05/116-harness-engineering-ashby.md` | **Harness Engineering 从理论到实战：Ashby 定律** | 898 | 8min | ☐ |
| A4 | `docs/ch05/118-claude-harness-generator-evaluator-context-reset.md` | **Claude Harness 设计：Generator-Evaluator 与 Context Reset** | 1019 | 10min | ☐ |
| A5 | `docs/ch04/687-agent-harnesses-are-dead-long-live-agent-harnesses.md` | **Agent Harnesses Are Dead. Long Live Agent Harnesses.** | 331 | 5min | ☐ |

### 🧠 轨道 B：Agent 架构 (5篇, ~2.5h)

> 从单 Agent 到多 Agent，从 ReAct 到 Unified Policy，理解架构演进全貌

| # | 文件 | 标题 | 字数 | 预计 | 状态 |
|---|------|------|------|------|------|
| B1 | `docs/ch04/669-17-agent-architecture-evolution.md` | **17种 Agent 架构演进：控制流设计的完整演化史** | 1558 | 12min | ☐ |
| B2 | `docs/ch04/670-cpu-agent-l1-l2-l3-execute-code.md` | **CPU 缓存类比下的 Agent 上下文管理：L1/L2/L3** | 1072 | 10min | ☐ |
| B3 | `docs/ch01/1190-claude-code.md` | **Claude Code 架构深度解析** | 1861 | 15min | ☐ |
| B4 | `docs/ch01/1224-codex-codex-app-agent-harness-runtime.md` | **Codex 全链路架构：Agent Harness Runtime** | 592 | 6min | ☐ |
| B5 | `docs/ch04/671-you-can-t-afford-to-lead-agentic-engineering-from-the-sideli.md` | **You can't afford to lead agentic engineering from the sidelines** | 2115 | 15min | ☐ |

### 💾 轨道 C：Context & Memory (3篇, ~1.5h)

> Agent 的记忆与上下文管理是性能瓶颈的关键

| # | 文件 | 标题 | 字数 | 预计 | 状态 |
|---|------|------|------|------|------|
| C1 | `docs/ch01/1195-memory-in-the-llm-era-modular-architectures-and-strategies.md` | **Memory in the LLM Era: Modular Architectures** | 759 | 8min | ☐ |
| C2 | `docs/ch01/1187-subagents-claude-code.md` | **Subagents 详解：Claude Code 如何避免上下文污染** | 1412 | 12min | ☐ |
| C3 | `docs/ch01/1200-claude-code.md` | **Claude Code 七层记忆架构** | 697 | 7min | ☐ |

### 🤝 轨道 D：Multi-Agent (3篇, ~1.5h)

> 多智能体协作是 Agent 工程的下一个前沿

| # | 文件 | 标题 | 字数 | 预计 | 状态 |
|---|------|------|------|------|------|
| D1 | `docs/ch01/1199-claude-code-agent-agent.md` | **Claude Code 多智能体协作体系设计** | 958 | 10min | ☐ |
| D2 | `docs/ch04/674-multi-agent-factory-mission.md` | **Multi-Agent 架构：Factory Mission 系统的方法论** | 629 | 6min | ☐ |
| D3 | `docs/ch01/1219-icml-2026-multi-agent-orchestrator.md` | **ICML 2026 Multi-Agent Orchestrator 过程评估** | 333 | 5min | ☐ |

### 💻 轨道 E：AI Coding Agent (2篇, ~1h)

> 编程 Agent 是 Agent 工程最成熟的应用场景

| # | 文件 | 标题 | 字数 | 预计 | 状态 |
|---|------|------|------|------|------|
| E1 | `docs/ch09/174-fastcontext-coding-agent.md` | **FastContext 微软开源 Coding Agent** | 526 | 6min | ☐ |
| E2 | `docs/ch09/176-ai-coding-agent-token.md` | **AI Coding Agent Token 成本控制五层模型** | 356 | 5min | ☐ |

### 📏 轨道 F：Evaluation (2篇, ~1h)

> 不会评测就不会改进

| # | 文件 | 标题 | 字数 | 预计 | 状态 |
|---|------|------|------|------|------|
| F1 | `docs/ch01/1193-ai-agent-5-l1-l2-l3-6-benchmark-llm-as-jud.md` | **AI Agent 评测实战：5 维指标 + L1/L2/L3** | 1655 | 12min | ☐ |
| F2 | `docs/ch05/129-hscodecomp-acl-2026-agent.md` | **HSCodeComp：阿里 ACL 2026 层级规则应用 Agent 基准** | 230 | 4min | ☐ |

---

## 🥈 Tier 2：深入子域 (30篇, 约 12 小时)

> **前提：完成 Tier 1**
> 按兴趣和工作需要选择轨道深入

### 🏗️ Harness 进阶 (8篇)

| # | 文件 | 标题 | 字数 | 预计 | 状态 |
|---|------|------|------|------|------|
| G1 | `docs/ch05/113-loss-function-development-lfd-goal-elvis-sun.md` | Loss Function Development (LFD) — 损失函数开发与 /goal 循环 | 1850 | 12min | ☐ |
| G2 | `docs/ch05/114-harness-100-cache-agent.md` | Harness 工程实践复盘：100% Cache 命中的 Agent | 913 | 8min | ☐ |
| G3 | `docs/ch05/115-dipg-host-research-verify-agent-verify-c-aigc.md` | DIPG 蚂蚁保 Host-Research-Verify 三 Agent 闭环 | 1308 | 10min | ☐ |
| G4 | `docs/ch05/119-harness-ai.md` | Harness不是目的，知识才是护城河 | 758 | 8min | ☐ |
| G5 | `docs/ch05/120-stripe-minions-deerflow-2-0.md` | 墙比模型更重要：Stripe Minions + 字节 DeerFlow 2.0 + 蚂蚁支小助 | 586 | 6min | ☐ |
| G6 | `docs/ch05/122-2026-harness-engineering.md` | 为什么 2026 年真正重要的是 Harness Engineering？ | 568 | 6min | ☐ |
| G7 | `docs/ch05/125-better-harness-agent-harness.md` | Better-Harness：Agent Harness 自动优化方法论 | 401 | 5min | ☐ |
| G8 | `docs/ch05/133-harness-m-autoharness.md` | Harness进化论文 — M⋆记忆程序进化与AutoHarness动作约束 | 195 | 4min | ☐ |

### 🧠 Agent 架构进阶 (8篇)

| # | 文件 | 标题 | 字数 | 预计 | 状态 |
|---|------|------|------|------|------|
| H1 | `docs/ch04/692-agentic-rl-token-in-token-out-done-right.md` | Agentic RL: Token-In, Token-Out Done Right | 829 | 8min | ☐ |
| H2 | `docs/ch04/682-harness-engineering-nl2sql-multi-agent.md` | 阿里数据研发 Harness Engineering：NL2SQL × Multi-Agent × 知识工程 | 452 | 5min | ☐ |
| H3 | `docs/ch04/690-agent-protocol-6-runtime.md` | Agent Protocol 不变层：跨框架的 6 个稳定 Runtime 对象 | 399 | 5min | ☐ |
| H4 | `docs/ch01/1270-hermes-agent-9.md` | Hermes Agent 9 模块系统架构 | 404 | 5min | ☐ |
| H5 | `docs/ch01/1269-pi-agent.md` | Pi Agent：极简核心 + 事件总线扩展框架 | 189 | 3min | ☐ |
| H6 | `docs/ch04/684-karpathy-vibe-coding-agentic-engineering.md` | Karpathy：从 Vibe Coding 到 Agentic Engineering | 474 | 5min | ☐ |
| H7 | `docs/ch04/675-tokenspeed-agentic-inference-engine.md` | Tokenspeed Agentic Inference Engine | 751 | 8min | ☐ |
| H8 | `docs/ch01/1215-agentium-agent.md` | Agentium — 从零实现 Agent 系统的开源框架 | 509 | 6min | ☐ |

### 💾 Context & Memory 进阶 (4篇)

| # | 文件 | 标题 | 字数 | 预计 | 状态 |
|---|------|------|------|------|------|
| I1 | `docs/ch01/1191-recent-developments-in-llm-architectures-kv-sharing-mhc-a.md` | LLM Architectures: KV Sharing, mHC, Compressed Attention | 1857 | 15min | ☐ |
| I2 | `docs/ch01/1203-deepseek-v4-flash-pro-million-token-context-and-trillion.md` | DeepSeek V4 Flash & Pro: Million-Token Context | 782 | 8min | ☐ |
| I3 | `docs/ch01/1239-residual-context-diffusion-rcd-apple.md` | Apple Residual Context Diffusion | 319 | 5min | ☐ |
| I4 | `docs/ch01/1272-llm-kv-cache-prefix-caching-agent-90.md` | LLM KV Cache Prefix Caching Agent 命中率 90% | 355 | 5min | ☐ |

### 🤝 Multi-Agent 进阶 (4篇)

| # | 文件 | 标题 | 字数 | 预计 | 状态 |
|---|------|------|------|------|------|
| J1 | `docs/ch01/1208-factory-mission-multi-agent-architecture.md` | Factory Mission Multi Agent Architecture | 794 | 8min | ☐ |
| J2 | `docs/ch01/1218-agentteams-claude-tag.md` | AgentTeams 和 Claude Tag 都进入群聊模式 | 513 | 6min | ☐ |
| J3 | `docs/ch04/672-asana-agentic-work-management-platform-work-graph-as-agent.md` | Asana Work Graph as Agentic OS | 1240 | 10min | ☐ |
| J4 | `docs/ch04/677-agent-room.md` | 协作涌现：Agent Room 的多智能体决策框架 | 273 | 4min | ☐ |

### 💻 AI Coding 进阶 (3篇)

| # | 文件 | 标题 | 字数 | 预计 | 状态 |
|---|------|------|------|------|------|
| K1 | `docs/ch09/177-dockerless.md` | Dockerless: 免环境补丁验证器 | 291 | 4min | ☐ |
| K2 | `docs/ch09/178-glm-5-scaling-pain.md` | GLM-5 Scaling Pain 推理复盘 | 471 | 5min | ☐ |
| K3 | `docs/ch01/1236-claude-code.md` | Claude Code 架构解析 | 471 | 5min | ☐ |

### 🔧 工具与基础设施 (3篇)

| # | 文件 | 标题 | 字数 | 预计 | 状态 |
|---|------|------|------|------|------|
| L1 | `docs/ch07/83-microsoft-agent-framework-tools-4-provider-tool-ap.md` | Microsoft Agent Framework Tools 总览 | 1760 | 12min | ☐ |
| L2 | `docs/ch11/276-agentscope-java-2-0-harness.md` | AgentScope Java 2.0：企业级分布式 Harness 框架 | 1550 | 12min | ☐ |
| L3 | `docs/ch11/279-build-a-highly-scalable-serverless-langgraph-multi-agent-sys.md` | Build a highly scalable serverless LangGraph multi-agent system | 621 | 6min | ☐ |

---

## 🥉 Tier 3：全面覆盖 (40+篇, 按需)

> **前提：完成 Tier 1 + 感兴趣的 Tier 2 轨道**
> 按主题索引，遇到具体问题时查阅

### Agent RL & Training
- `docs/ch04/673-appo-agentic-procedural-policy-optimization-amap-ml-ag.md` — APPO 阿里高德 Agent RL 信用分配 (782词)
- `docs/ch04/685-best-practices-for-multi-turn-reinforcement-learning-in-amaz.md` — Multi-Turn RL Best Practices (323词)
- `docs/ch04/695-llm-agentic-rl.md` — 训练LLM智能体的七条实战经验 (207词)
- `docs/ch01/1211-qwen-skill-rm-agent-skill.md` — Qwen Skill-RM：把奖励模型做成可复用Agent Skill (614词)
- `docs/ch01/1295-reducing-doom-loops-with-final-token-preference-optimization.md` — Reducing Doom Loops with FTPO (519词)

### Agent 安全与治理
- `docs/ch04/702-securing-the-future-of-ai-agents.md` — Securing the future of AI agents (368词)
- `docs/ch05/126-cloud-use-agent.md` — Cloud Use 框架：Agent 作为云上受治理主体 (300词)
- `docs/ch05/127-superpowers-6-0-reviewer-progress-ledger-model.md` — Superpowers 6.0 反作弊重写 (508词)

### 行业 Agent 实战
- `docs/ch04/686-ai-agent-react-unified-policy.md` — 火山引擎 AI 搜索千万级 Agent 架构演进 (382词)
- `docs/ch04/693-agentscope-workbuddy-agent.md` — 阿里 AgentScope WorkBuddy 实践拆解 (249词)
- `docs/ch01/1235-growbrain-agentic.md` — 淘宝 GrowBrain Agentic 内容成长引擎 (343词)
- `docs/ch01/1202-i-o-2026-welcome-to-the-agentic-gemini-era.md` — I/O 2026: Agentic Gemini Era (957词)
- `docs/ch01/1277-redis-agentic-ai-flowers-with-iris.md` — Redis Agentic AI (259词)

### Vibe Coding & Browser Harness
- `docs/ch05/121-harness-vibe-coding.md` — Harness 工程可视化：Vibe Coding (261词)
- `docs/ch05/132-browser-use-v0-13-browser-harness.md` — browser-use v0.13 Browser Harness (308词)
- `docs/ch05/128-code-is-cheap-harness-slop.md` — Code is cheap: Harness 方法论 (177词)
- `docs/ch05/130-harness-agent-17-agent.md` — 阿里 Harness 工程实战：Agent 自主迭代 17 小时 (283词)

### 模型与推理架构 (Agent 底层)
- `docs/ch01/1201-olmo hybrid-and-the-hybrid-architecture-wave-2026.md` — Olmo Hybrid Architecture Wave (1150词)
- `docs/ch01/1230-nvidia-nemotron-3-ultra-hybrid-transformer-mamba-moe-for-ag.md` — NVIDIA Nemotron 3 Ultra (728词)
- `docs/ch01/1243-how-llms-actually-work-0xkato-transformer-walkthrough.md` — How LLMs Actually Work (571词)
- `docs/ch01/1238-unlimited-ocr-reference-sliding-window-attention-ocr.md` — 百度 Unlimited OCR: 长文档常量 KV Cache (491词)
- `docs/ch01/1265-nvidia-token.md` — NVIDIA 推理软件栈：更低 Token 成本 (341词)

### 评测与 Benchmark
- `docs/ch01/1197-mobilitybench-agent-transitlm-rllm.md` — MobilityBench Agent 基准 (598词)
- `docs/ch04/681-agent-world.md` — Agent-World：智能体与环境协同进化 (319词)
- `docs/ch05/095-harness.md` — Harness 工程搭建式业务 Agent 评测 (1106词)

---

## 📈 阅读进度追踪

### Tier 1 进度
- [ ] 轨道 A Harness Engineering: 0/5 完成
- [ ] 轨道 B Agent Architecture: 0/5 完成
- [ ] 轨道 C Context & Memory: 0/3 完成
- [ ] 轨道 D Multi-Agent: 0/3 完成
- [ ] 轨道 E AI Coding: 0/2 完成
- [ ] 轨道 F Evaluation: 0/2 完成

**总进度: 0/20 (0%)**

### Tier 2 进度
- [ ] Harness 进阶: 0/8
- [ ] Agent 架构进阶: 0/8
- [ ] Context/Memory 进阶: 0/4
- [ ] Multi-Agent 进阶: 0/4
- [ ] AI Coding 进阶: 0/3
- [ ] 工具与基础设施: 0/3

**总进度: 0/30 (0%)**

---

## 🎯 学习建议

### 时间规划
| 阶段 | 投入 | 产出 |
|------|------|------|
| Tier 1 冲刺 | 10 小时 (5天×2h) | Agent 工程全景心智模型 |
| Tier 2 深入 | 12 小时 (按兴趣选) | 2-3个子领域深度理解 |
| Tier 3 按需 | 持续积累 | 特定问题的专家级认知 |

### 阅读策略
1. **先读标题和开头段落** — 决定是否需要精读
2. **短文 (<500词) 直接精读** — 信息密度高，3-5分钟就能读完
3. **长文 (>1000词) 先看结构** — 读小标题和结论，按需深入
4. **读完后写一句话总结** — 强制输出比被动阅读有效 10 倍
5. **关联已有知识** — 用 `[[wikilink]]` 把新知识连入知识图谱

### 优先级排序
- 🔴 **最优先**: Harness Engineering (A1-A4) — 这是你工程实践的核心
- 🟡 **次优先**: Agent Architecture (B1-B3) — 理解主流架构才能做选择
- 🟢 **按需**: 其他轨道 — 根据当前项目需要选择

---

*生成时间: 2026-07-24 | 数据源: wiki-book v1.3.5 (3379篇)*
*策略: 20→50→90 渐进式精读 | 总核心阅读量: ~22,000 词 (~10万字)*
