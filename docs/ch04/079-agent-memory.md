# Agent Memory 架构本质

> 📊 Level ⭐⭐⭐ | 13.5KB

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.85**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/agent-memory-architecture.md`，一手来源仍见下方 sources。

## 机制与论文
- [AgentScope Java Harness Framework 2.0 — 企业级 Agent 分布式场景的 Harness 实现 (Java 2.0 重大升级)](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentscope-java-harness-framework-enterprise-distributed.md) — AgentScope Java全版
- [Agent Harness 架构设计与实现：生产级 Agent 系统落地指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-architecture-design-production-guide.md) — 七层金字塔生产指南
- Context Window Management Comparison — 四框架对比rv9
- AI Memory Architecture: Deep Dive — 29k记忆架构深度
- [AI Coding Agent 记忆系统](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-coding-agent-memory-system.md) — 分层记忆设计
- [Building for the Rising Complexity of Agentic Systems with Extreme Co-Design](https://github.com/QianJinGuo/wiki-public/blob/main/entities/nvidia-agentic-systems-extreme-co-design.md) — 三种交互模式+33分钟真实trace+prompt caching挑战
- [Self-Harness：上海AI Lab 提出的 Agent 自我改进 Harness 范式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/self-harness-shanghai-ai-lab-agent-improves-harness.md) — Self-Harness范式14191字深度
- [Prime Agent — 以 RLM + Continual Harness 双抽象为核心的自改进编码 Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/prime-agent-self-improving-rlm-agent.md) — RLM+Continual Harness：harness状态可CRUD

## 深度分析

### 边界划分：Memory ≠ State ≠ Policy ≠ Profile

这篇文章最有工程价值的一步是先把四个常被混用的概念切开。State 是 session 内的短期运行态，会话结束即销毁；Memory 是跨 session 持续存在、可影响未来决策的结构化历史。Policy 管"允许与禁止"，属于外部规范，不应被 memory 系统动态改写——这一点在 [harness 生产指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-architecture-design-production-guide.md) 的权限分层中也有对应设计。Profile 则只是记忆的一个低维输出产物（显式快照层），不是记忆本身。由此得到的定义是：记忆是带来源、作用域、时间权重和可修正性的历史对象，而不是"把聊天记录再存一份"。

另一个容易踩的坑是把蒸馏等同于记忆：摘要、reflection、session summary 只是 write–manage–read 闭环中管理环节的一个操作。蒸馏擅长留下结论，不擅长留下结论的形成轨迹——"用户偏好 TypeScript"这条摘要丢失了偏好如何形成、在什么上下文成立、是否正在漂移。做完摘要就停、没有冲突检测与回溯修正的系统，本质是在归档而非记忆。

### 四个建模对象：意图是涌现的，不是字段

文章把记忆的建模对象拆成四类，超出常见的"用户偏好"单维度视角：

| 模型 | 覆盖内容 | 典型失效模式 |
|------|---------|------------|
| 用户模型 | 偏好、决策模式及其演变轨迹 | 把快照当人格，追不上态度转变 |
| 任务模型 | 被否决的方案、已确认结论、未完成承诺 | 重复推荐已被明确拒绝的方案 |
| 世界模型 | 仓库结构、API 约束、组织规则、数据新鲜度 | 大量"个性化错误"源于没注意环境已变化 |
| 自我模型 | 失败路径、工具不稳定场景、暂定假设 | Agent 不是在学习，而是在重复犯错 |

关键论断是：意图不是存在某个字段里的东西，而是四层模型长期耦合后浮现的上层能力——如同跟了三年的助理"懂你"，不是因为背了一本偏好手册，而是同时理解脾气、进度、环境与自身能力边界。这一框架与 [三层记忆底座](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-substrate-three-layer.md) 的分层思路互补：一个回答"存什么"，一个回答"放哪层"。

### 六维度记忆单元与五类记录类型

若把记忆做成可计算对象，至少需要内容、类型、置信度、来源、作用域、时间与衰减六个维度。其中类型学值得单独展开：event 是高确定性事实；assertion 是用户明确声明、可直接推翻的；belief 是 Agent 自己推断的、需靠新证据逐步修正；constraint 的权威来源在 memory 子系统之外——memory 可以记录它但不应定义或修改它；commitment 是已做出但未完成的承诺。这个五分类直接决定了每条记录的更新策略：assertion 可以被新声明直接覆盖，belief 必须走证据积累，constraint 只读。

来源（provenance）维度同样关键：行为证据通常比口头表态更值得写入预算——"用户说过不喜欢 ORM"只是 assertion，而连续三次索要 ORM 方案后又手写 SQL 的行为模式可以提炼为 belief，且 provenance 更硬。

### 写入是预算分配问题，读取要从语义召回升级到任务约束

写入的本质是 decision under budget：存储、检索、未来注意力三重有限，写入要决定的是哪些信息值得获得对未来决策的影响力——不看单条信息的绝对价值，而看它相对于已有记忆的**边际价值**。与已有信念冲突的新信号（一直保守的用户突然要求尝试 alpha）是高价值信号，应优先写入。

读取侧的传统 RAG 式语义召回有一个结构性盲区：真正有价值的记忆调用往往反直觉。用户问"帮我写缓存方案"，最相关的记忆可能不是上次讨论缓存的对话，而是三个月前提到的黑五流量问题——那条信息决定了设计约束，但在语义空间里与"缓存"距离很远。升级方向是把 `retrieve(query)` 换成 `read(task_context, belief_graph)`：先由任务理解层判断当前决策真正受什么约束，再检索对应记忆，最后评估其在当前情境下的适用性。这与 上下文管理四框架对比 中按任务相关性而非表面相似度选取上下文的实践一致。

管理链路是"最容易偷懒也最关键"的一环，至少要做五件事：整合、冲突处理、衰减与遗忘、来源追踪、权限治理。其中冲突处理尤其反直觉——"以最新为准"是偷懒的蒸馏思维，更合理的做法是保留矛盾并建模为"该维度上的偏好是情境依赖的"，读取时按当前情境选择。遗忘则不是 bug：不能忘的系统会被旧判断拖死，遗忘是防止过拟合现实的必要机制。更深的洞察是——死的不是经验本身，而是失去更新机制的经验；few-shot 示例、摘要、fine-tuned preference profile 并不天然低级，一旦脱离持续校正闭环就从资产变成惯性。

### 治理视角：每一步都在决定"谁被允许持续影响未来"

文章把整个记忆系统收敛到一个治理问题：写入决定什么信息获得对未来的影响力，管理决定什么信念保持有效，读取决定什么记忆进入当下决策，遗忘决定什么经验退出舞台——四个动作没有一个是容量问题，全是治理问题。评测标准也随之转向：从"能不能 recall"到"能不能 update、能不能 abstain、能不能 handle drift、能不能 selective forget"。自我修正的要求是把用户不满意的响应回溯到记忆层归因——是召回错了、belief 过期了、还是 belief 没错但被错误应用到当前 scope；只在回答层打补丁而不修上游假设，等于没有学习。这一治理立场与 [Agent 记忆生命周期哲学](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-lifecycle-philosophies.md) 中"记忆需要生命周期管理而非无限追加"的主张同向。

## 实践启示

1. **建 memory 前先划四条边界**：把 State、Policy、Profile 从 Memory 中显式排除——State 随 session 销毁，Policy 只读（memory 不许改写权限边界），Profile 只是输出快照。边界不清是大多数"有存储没记忆"系统的第一根病因。
2. **按五类型设计更新策略**：给每条记录打 event / assertion / belief / constraint / commitment 标签，assertion 可被新声明覆盖、belief 必须走证据修正、constraint 只读、commitment 需要闭环追踪。没有类型学的记忆系统会把"用户随口一说"和"Agent 深度推断"同等对待。
3. **写入用边际价值而非绝对价值筛选**：与既有信念冲突的信号优先写入，行为证据的 provenance 优先于口头表态；存储预算内先问"这条信息相对于已有记忆新增了什么"，而不是"这条信息本身好不好"。
4. **冲突保留而非覆盖**：遇到新旧偏好矛盾时不要"以最新为准"，建模为情境依赖偏好并在读取时按当前上下文选择——用户"白天要简洁、深度报告要详尽"不是矛盾，是作用域不同的两条记忆。
5. **把读取接口从 retrieve(query) 升级为 read(task_context, belief_graph)**：先判断当前决策受什么约束，再去找对应记忆，最后做情境适用性评估；不要指望语义相似度召回能捞到"三个月前黑五流量"这类与当前 query 语义距离很远的硬约束。
6. **用 update/abstain/drift/selective-forget 评测记忆系统**：不要只测 recall。负反馈必须回溯到记忆层归因（召回错 / belief 过期 / scope 错配），并定期清理失去更新机制的经验——脱离校正闭环的 few-shot 示例和偏好快照会从资产变成惯性。

## 工程实践
- ['长周期 Agent 详解：从 Ralph Loop 到可接管 Harness'](https://github.com/QianJinGuo/wiki-public/blob/main/entities/long-running-agent-ralph-loop-handover-harness-ruofei.md) — 三类漂移+5张卡治理12390字rv10全版
- [Loop Engineering:不再写提示词,而是设计替你写提示词的循环——先写刹车再写循环（19 来源深度合并：Addy Osmani / Boris Cherny+Peter Steinberger / 教科书 / 若飞 工程现场 / TechFarrari 批判 / 若飞 实用指南 / 爱范儿 科普批判 / AllenTang Karpathy 尺子 / winty 7架构中文主流视角 / AutoResearch 5 决策 / 三层结构 + 三款产品对比 + Ralph Loop + 准备度总表 / Shubham Saboo PM 视角 / 若飞 吴恩达三层Loop）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/loop-engineering-addy-osmani-challengehub.md) — 19来源合并Loop Engineering巨著73742字rv10
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-vibe-coding-agentic-engineering-v4.md) — v4 8090字rv10：可验证性上限+MenuGen警示
- [Claude Code 源码核心机制详解](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-core-internals.md) — 源码机制18k主版
- Claude Code Openclaw Memory Comparison — 记忆系统对比rv9
- [Harness Engineering 综合性指南（ConardLi 系列 · 含 Beautiful Article 实证 + Reacticle 协议）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-comprehensive-guide-conardli.md) — ConardLi六层架构14634字rv9
- [CPU 缓存类比下的 Agent 上下文管理：L1/L2/L3 层级架构与 execute_code 单工具设计](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cpu-cache-analogy-agent-context-management-liwen.md) — L1/L2/L3缓存类比
- [Fable 5 的信号:Agent 开始拼 Runtime — 架构师若飞的 Runtime Contract 工程化拆解](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-fable-5-agent-runtime-contract-ruofei-2026.md) — Runtime Contract拆解
- Claude Code Openclaw Usage Ettin — Ettin rerank集成
- [Personal AI 工作台：Claude 18 动作框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ruofei-personal-ai-workbench-18-actions.md) — Personal Harness六层工作台：环境工程>提示词技巧
- [场景营销前端 AI Coding — 从问题到方案](https://github.com/QianJinGuo/wiki-public/blob/main/entities/frontend-ai-coding-problem-to-solution-taobao.md) — 注意力坍塌+外置DeepResearch分离
- [Harness Engineering 系统性解读](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-systematic-explainer.md) — 李宏毅课程解读7933字最全版
- [腾讯 Token 优化实战 — 省 Token 和用好 AI 是同一件事](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tencent-token-optimization-agent-architecture.md) — context rot四步工程化
- [Claude Code 27 条技巧：从工具清单到工程升级路径](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-27-tips-engineering-upgrade-jiagoux-2026.md) — 27技巧全版
- [如何利用 AgentCore + OpenViking 快速搭建具备高效记忆的 Agent](https://github.com/QianJinGuo/wiki-public/blob/main/entities/如何利用-agentcore-openviking-快速搭建具备高效记忆的-agent.md) — 双方案记忆选型四维
- [百亿补贴 C 端 AI Coding 实战：基于 SDD 的服务端 AI Coding 实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/百亿补贴-c-端-ai-coding-实战基于-sdd-的服务端-ai-coding-实践.md) — spec唯一真相源自进化记忆

---

