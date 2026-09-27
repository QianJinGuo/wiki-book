# Hermes Agent 记忆系统深度拆解

> 📊 Level ⭐⭐⭐ | 10.0KB

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.8**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/hermes-agent-memory-system-vs-openclaw.md`，一手来源仍见下方 sources。

## 机制与论文
- [深度拆解 Hermes Agent 记忆系统](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-memory-system-openclaw-comparison.md) — 记忆成本账四层体系15260字rv10最深版
- [17种Agent架构演进：控制流设计的完整演化史](https://github.com/QianJinGuo/wiki-public/blob/main/entities/17-agent-architectures-evolution.md) — 17架构系统拆解高价值
- [AI Agent 架构设计（七）：Skills 系统设计（OpenClaw、Claude Code、Hermes Agent 对比）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-system-design-three-way-comparison.md) — 三框架skill系统设计对比
- [Coding Harness 工程本质：从 Pi 到 OpenClaw](https://github.com/QianJinGuo/wiki-public/blob/main/entities/pi-openclaw-coding-harness.md) — Harness八能力+五工程模式：Context像投影8441字rv9
- Context Window Management Comparison — 四框架对比rv9
- [800行代码实现 Open Claw 的 Tool、消息总线、子Agent管理架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/open-claw-tool-bus-subagent-architecture.md) — 薄抽象显式控制流8802字rv9全版
- [Hermes Agent 闭环学习机制](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-closed-learning-loop.md) — 闭环学习飞轮+Nudge触发+spawn_background_review
- 深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践 — 三维度源码：23模块拼装+自适应分块+双层Memory
- How AI Agent Memory Works — 记忆五层+六架构权衡科普
- [Skill 系统：Agent 如何把经验沉淀成可复用能力](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-skill-system-winty.md) — Memory vs Skill本质区别7749字最全版
- [Hermes Agent 为什么火了？和 OpenClaw 龙虾比一比](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-vs-openclaw-comparison.md) — 爱马仕vs龙虾：控制面vs成长型定位对比
- Gepa Optimize Anything — ASI+Pareto前沿，声明式通用文本优化API
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

## 深度分析

### 记忆的本质是成本会计，不是存储问题

这篇文章最有价值的重构，是把"Agent 记忆"从"存得多不多、搜得回不回得来"重新定义为**一组成本结构各异的账本**。热记忆（MEMORY.md + USER.md，约 2200 + 1375 字符上限）是每轮必付的固定成本；session_search 是按需支付的检索成本；Skills 是一次性沉淀、多次复用的摊销成本；Honcho 是可选的外部订阅成本。四层各有独立预算，互不挤占。一个容易被忽视的细节：热记忆用**字符数**而非 token 数做上限——实现朴素，但彻底解耦了特定模型的 tokenizer，换来的是可预测、可移植的容量契约。这正是 [Working Set Vs Long Term Memory](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/working-set-vs-long-term-memory.md) 所说的 working set 纪律：热记忆不是"重要内容缓存"，而是**准入门槛极高的摘要层**。

### frozen snapshot：提示词稳定性高于记忆即时性

Hermes 的写入语义是"立即落盘、但不立即生效"：会话中途写入的记忆马上持久化，却要等下一次会话才进入 system prompt 快照。表面看是延迟，实质是把记忆即时性明确让位给 prompt cache 命中率——前缀每变一次，供应商侧的缓存就失效一次，长会话的边际成本陡增。这与 [存之有序，治之有矩](https://github.com/QianJinGuo/wiki-public/blob/main/entities/存之有序治之有矩agent-记忆系统的工程实践与演进.md) 中"写入纪律与 prompt cache 冲突"的观察相互印证：**记忆写入频率本身就是一种成本，且计入的是推理账单而非存储账单**。对应到 [Context Window Economics](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-window-economics.md) 的框架，这是用请求级延迟换取会话级经济性的典型交易。

### 压缩是状态迁移，不是删减

"压缩前的 memory flush"是全文工程密度最高的一段：长会话触发 compaction 之前，先跑一轮只开放 memory 工具的专门调用，把用户偏好、反复出现的修正模式提取进 durable memory，然后才压缩旧历史、重建缓存。关键认知是——**压缩不是把历史变短，而是把任务状态迁移到更稳定的位置**。如果省略 flush，摘要会不可逆地磨薄关键事实；事后无法从"被摘要过的历史"里恢复从未被提取的信息。这与 [Memory Consolidation Decay](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/memory-consolidation-decay.md) 描述的固化（consolidation）机制同构：短期记忆必须主动写入长期层，否则自然衰减即丢失。

### 记忆是提示词供应链的一环

Hermes 对 memory 写入做内容安全检查（提示词注入、凭证泄露、SSH 后门暗示、不可见 Unicode），因为它把记忆视为**提示词供应链**：日志里混入恶意文本只污染一次响应，热记忆里混入"忽略之前所有指令"则会跨会话、跨任务反复激活。这把记忆系统的威胁模型从"数据完整性"升级为"执行完整性"——记忆条目一旦进入 system prompt，就获得了与开发者提示词同级的信任，却缺少同等强度的输入审查。[Prompt Injection Defense](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/prompt-injection-defense.md) 的结论在此同样适用：信任边界应按**注入位置**而非**数据来源**划分。

### OpenClaw 与 Hermes：控制面与执行面的分工

文末的对比拒绝给出胜负：OpenClaw 把长期状态放进 memory plane 和 workspace，服务于多入口、强治理的 Gateway 场景；Hermes 把重心放在 cache-aware 执行型 runtime，服务于本地长任务与过程经验沉淀。真正被修正的是一种流行的错误记忆观——"存得越多、搜得越全，Agent 就越好用"。更多记忆意味着更多成本：全塞进提示词破坏缓存，全交给搜索则召回与摘要质量成为瓶颈，错误经验沉淀成 skill 还会持续误导。深度版对比可延伸至 [Hermes Agent Memory System Openclaw Comparison](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-memory-system-openclaw-comparison.md) 与 [Hermes Agent Closed Learning Loop](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-closed-learning-loop.md)。

## 实践启示

1. **给热记忆设准入清单**：只有用户偏好、环境事实、稳定约定配得上进 MEMORY.md / system prompt；任务进度、完成日志、一次性 TODO 留在会话层。热记忆条目按提示词供应链标准做写入校验。
2. **建"档案室"而非"随身背包"**：历史会话单独存档，提供关键词搜索 + 按 session 聚合 + 局部截断 + 便宜模型摘要召回；不要指望把全部历史塞进上下文。
3. **压缩前先 flush**：任何长会话 compaction 之前，安排一轮只开放 memory 工具的 durable state extraction，把偏好与重复模式显式提取；等摘要磨薄后再补救为时已晚。
4. **Skills 当作运行时 SOP 管理**：主上下文只注入紧凑的 skills index，按需加载全文；把已验证的做事方法变成可检索、可更新、可审查的资产，而非依赖"越用越灵"的玄学。
5. **守护提示词稳定性优先级最高**：动态上下文（如外部 recall）挂到用户消息附近而不是改前缀；宁可牺牲一步的记忆即时性，换取整个会话的缓存命中与成本可控。

## 延伸导航
- [OpenClaw 的架构设计为什么值得研究？它与 Hermes/Claude Code 的核心差异？](https://github.com/QianJinGuo/wiki-public/blob/main/moc/openclaw-architecture.md)
- [Agent Memory 架构选择的关键决策点是什么？](https://github.com/QianJinGuo/wiki-public/blob/main/moc/agent-memory-architecture-decision-points.md)
- [Agent 工程全景指南](https://github.com/QianJinGuo/wiki-public/blob/main/moc/agent-engineering-guide.md)

---

