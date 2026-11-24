# SGLang

> 📊 Level ⭐⭐⭐ | 9.0KB

## 概述
SGLang（Structured Generation Language）是由 LMSYS 团队主导、UC Berkeley / CMU / Stability AI 等机构联合开发的开源 LLM 推理服务框架。它的差异化不在于再造一个更快的 attention kernel，而是把**前缀复用（prefix reuse）**当成一等公民：RadixAttention 用基数树（radix tree）在运行时索引 KV Cache 前缀，让多轮对话、System Prompt、工具 Schema 这类高度重复的输入自动变成可共享缓存；在此之上叠加 HiCache 多级 KV Cache、结构化输出约束解码与 Router 多实例调度，形成面向 Agent 工作流的 serving 栈。

在智谱 GLM-5 推理复盘里，SGLang 是承载 Coding Agent 长上下文负载的引擎：由 HiCache 加载时序引发的 BugFix #2 已通过 Pull Request #22811 回馈 SGLang 社区，智谱同时提出了 LayerSplit 分层 KV Cache 方案。

## 核心能力
- **RadixAttention + 自动前缀复用**：以 radix tree 在运行时自动发现并复用跨请求的公共前缀，无需手工声明 prefix；多轮对话与工具调用链的 Prefill 成本被摊销为接近零的增量。
- **HiCache 多级 KV Cache**：在 GPU HBM 与 CPU 内存之间分级缓存，历史前缀从 CPU 侧异步 swap-in。关键设计是 **Load Stream**（加载 KV Cache 与 Indexer Cache）与 **Forward Stream**（Index 计算 → Sparse Attention）重叠执行，使换入不阻塞推理吞吐。
- **LayerSplit 层间 KV Cache 切分**：每张 GPU 只持有部分层的 KV Cache；Prefill 时由持有该层的 CP rank 在 Attention 前把该层 Cache 广播给相关 rank，并让广播与 indexer 计算重叠。整体只额外引入约为 KV Cache 规模 1/8 的 Indexer Cache 广播开销。
- **结构化输出（Structured Output）**：基于压缩有限状态机（FSM）的约束解码，使模型直接产出合法 JSON / Regex / EBNF，Agent 工具调用参数不再依赖"先生成再修复"。
- **Router 与多实例调度**：内置 Router 做缓存感知（cache-aware）路由，把共享前缀的请求导向同一实例以提高命中率；配合 PD（Prefill-Decode）分离部署与 Context Parallel 调度支撑大规模线上服务。
- **位置关系（vs vLLM）**：vLLM 的 PagedAttention + 连续批处理定义了高吞吐 serving 的显存管理基线，SGLang 在同一基线上把前缀复用、多级缓存与工作流状态管理做成显式能力；二者是同一技术谱系上的相邻点，而非替代关系。

## 深度分析

### 一、HiCache 加载时序 Bug：前缀复用把正确性带进了流水线
Coding Agent 场景显著推高了输入长度（平均超过 70K tokens），同时伴随很高的前缀复用率，这使 HiCache（多级 KV Cache）成为线上服务的关键优化。系统从 CPU 内存异步 swap-in 历史前缀缓存，并通过 Load Stream 与 Forward Stream 的重叠执行提升吞吐：Load Stream 负责加载 KV Cache 与 Indexer Cache，Forward Stream 依次执行 Index 计算与后续 Sparse Attention。理论上 Forward Stream 中的 Indexer 计算必须在对应的 Indexer Cache 完成加载后才能启动，但原始实现并未显式表达这条依赖——Indexer 算子启动时没有对 Load Indexer Cache 的完成建立同步约束，于是 Forward Stream 可能先于 Load Stream 完成数据加载就开始执行，形成 **Read-before-Ready** 的访问模式。修复方式是在 Indexer 算子启动前引入与 Load Stream 的同步点，确保该层级 Indexer Cache 已就绪；修复上线后该类时序异常完全消失。

结构性含义比现象更重要：一旦被复用的 KV 数据改由异步路径加载，缓存层与计算层之间就多出一条隐式依赖，"要不要加同步点"应被当作可回归的正确性契约评审，而非性能取舍。

### 二、Prefix-cache 命中率经济学：为什么 LayerSplit 对 Agent 负载特别有效
Coding Agent 负载的典型特征是上下文长、Prefix Cache 命中率高（实验条件为命中率 90%、请求长度 40k–120k），Context Parallel（CP）因此成为线上 Prefill 节点的主要并行策略。但 SGLang 当时的开源实现存在 KV Cache 冗余存储问题，有限的 KV Cache 容量成了 GPU 计算利用率的限制因素。LayerSplit 让每张 GPU 只持有部分层的 KV Cache，显著降低单卡显存占用；实验结果显示吞吐提升幅度在 10% 至 132% 之间，且上下文越长收益越显著。

高命中率意味着 Prefill 的算力成本已被缓存摊销掉大半，瓶颈从 compute 迁移到 KV Cache 的**存储容量与换入带宽**——此时"每卡存全部层"是最浪费的一种布局。LayerSplit 把每卡存储降到约 1/N_layer，用一次层广播替代多份冗余副本，本质上是把稀缺资源（HBM 容量）换成相对充裕的资源（互联带宽）。

### 三、SGLang 与 vLLM：互补的是负载形状，不是功能清单
vLLM 抽象的负载是"无状态、一次性、追求高吞吐的请求"，PagedAttention 解决显存碎片与连续批处理效率；SGLang 抽象的负载是"有状态、长前缀、多轮演进的工作流"。Coding Agent 这类请求的形状是输入极长、增量极短、前缀高度重复——正是 radix 前缀复用与多级缓存收益最大的地方。

所以两者不是"谁取代谁"，而是分工：突发、短上下文的批量请求交给 vLLM，长上下文、高前缀命中、需要状态管理的工作流交给 SGLang。生产系统里二者常共存于同一平台的不同请求路径上，选型应基于真实 trace 的形状分布，而非 benchmark 单点吞吐。

### 四、稳定性与运维教训：一致性是被复用数据的隐藏账单
同一篇复盘中的 BugFix #1 是更早的一次同类事故。为限制尾延迟，引擎引入基于超时的请求终止：Prefill 超时未完成时，Decode 侧会 Abort 请求并回收其 KV Cache。但 Abort 信号未正确传播到 Prefill 侧，Decode 侧也缺乏判断 KV Cache 可否安全回收的信息，于是 Decode 回收槽位并把同一块显存分配给新请求后，先前已发起的 RDMA 写入与仍在执行的 Prefill 计算并未被同步取消，直接覆盖了新请求的 KV Cache，导致其在 Decode 阶段读到被污染的数据、生成结果异常。修复方式是在"请求终止"与"KV Cache 写入完成"之间建立显式同步：Decode Abort 后通知 Prefill，Prefill 仅在确认相关 RDMA 写入尚未开始或已全部完成时才返回"可释放"信号，Decode 收到确认后才允许回收复用；异常输出发生率由约万分之十几降至万分之三以下。

两条 bug 的共同结构是"内存复用 + 异步执行 + 缺少显式依赖"。KV Cache 复用带来的全部性能收益，都以"生命周期与就绪状态被正确表达"为代价预付。其典型故障指纹不是崩溃率或 OOM，而是**万分之一量级的输出质量异常**，且不触发任何 crash 告警。

## 实践启示
1. **按真实 trace 的形状选引擎。** 按上下文长度与前缀命中率分桶：长上下文、高命中的桶对 SGLang 的分层缓存收益最敏感；低复用的桶用 vLLM 更划算。
2. **把前缀命中率当成一等 SLI。** 它直接决定 Prefill 成本与 TTFT 尾部，也决定 LayerSplit / HiCache 这类优化是否值得投入；命中率下滑应与延迟、错误率进同一块看板。
3. **对任何"重叠执行"的优化先写清依赖契约。** 重叠必须有显式同步点；Code Review 时把"这里是否需要 barrier"当成可回归的正确性问题，而不是性能取舍。
4. **KV Cache 生命周期必须有明确的 owner 与释放协议。** 超时 Abort、抢占、请求取消都要与 KV 写入完成做同步，否则复用同一块显存的两个请求会互相污染。
5. **单独监控异常输出率的量级变化。** 万分之几与万分之十几的差异不会触发 crash / OOM 告警，但正是缓存一致性 bug 的典型指纹，必须独立设阈值并做版本对比。
6. **长上下文优先做容量工程而非算力工程。** 命中率高、Prefill 已被缓存摊销后，瓶颈通常是 KV Cache 容量与换入带宽；应把 LayerSplit、HiCache 与 CP 组合使用。

## 相关页面
[GLM-5 Scaling Pain 推理复盘](https://github.com/QianJinGuo/wiki-public/blob/main/entities/glm5-scaling-pain.md) — 包含 HiCache BugFix #2 的详细分析
- [基于SGLang的大模型推理部署实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/sglang-inference-deployment-practice-benchmark-tuning.md) — Benchmark 方法论、部署方案选型与调优实战指南
- [vLLM](https://github.com/QianJinGuo/wiki-public/blob/main/entities/vllm.md) — PagedAttention 与连续批处理，SGLang 的对照与互补引擎
- [Agent-Assisted SGLang 开发](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-assisted-sglang-development-lmsys-2026-07.md) — SGLang 自身的 AI 辅助框架工程实践

---

