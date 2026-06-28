## Ch16.004 glm5-scaling-pain-inference

> 📊 Level ⭐⭐ | 14.6KB | `entities/glm5-scaling-pain-inference.md`

# glm5-scaling-pain-inference
对 Scaling Law 的信仰不仅驱动着我们在模型参数与数据规模上不断突破，也同样在不断逼近 Infra 工程的极限，这一过程伴随着不可避免的阵痛，我们称之为" Scaling Pain "。
随着大模型应用从简单对话全面转向更复杂的、更长程的 Coding Agent 任务，我们的推理基础设施迎来了前所未有的压力，每天承受着数亿次 Coding Agent 调用。过去几周，部分用户在使用 GLM-5 系列模型执行复杂 Coding Agent 任务时，遭遇了多种异常：乱码、复读，以及偶现的生僻字。这些问题在标准推理环境下是不存在的，只在高并发、长上下文的 Coding Agent 场景下才会触发，很难稳定复现。
我们经过数周的推演、排查与压测，最终定位并修复了几个相互独立的底层竞态 Bug，并对其中所反映的系统瓶颈进行了针对性优化，显著提高了推理系统的稳定性和效率。
---

## 从线下复现到异常识别
自 3 月起，我们在 GLM-5 的线上监控和用户反馈中观察到三类异常现象：**乱码（garbled output）、复读（repetition），以及生僻字（rare character）**。这些现象在表面上与长上下文场景下常见的"降智"相似，但由于我们并没有上线任何降低模型精度的优化，一个更关键的问题是：**异常究竟源于模型本身，还是源于推理链路？**
如果源于模型，异常会表现为针对特定输入的稳定、可重复行为；反之，若异常与系统压力或运行时状态相关，则更可能指向推理基础设施中的链路或状态管理问题。
排查初期，我们先对用户反馈的 bad cases 做本地回放，并将同一批请求重复推理数百次，但始终未能复现异常，说明大概率不是模型本身的问题。为进一步模拟线上环境的压力，我们对线上日志做脱敏处理，并尽可能保留原始并发分布与请求时序，在本地进行全量回放。起初仍未复现异常，直到进一步调整 PD 分离比例并持续提高系统负载，模拟高峰期的 Prefill 堆积和 Decode 侧 KV Cache 压力后，才在约每万次请求中稳定复现 3-5 次异常。这种"与请求内容无关、与系统压力相关"的特征，说明问题可能来自高负载下的推理状态管理。
与此同时，线下复现的异常频率仍低于线上反馈的频率，说明现有检测方法可能存在漏检，或仍有部分触发场景尚未覆盖。
**如何可靠识别异常输出成为了新的挑战。** 三类异常中，复读相对容易检测，而乱码与生僻字比较棘手。我们尝试过正则表达式、字符集匹配等启发式方法，也尝试过基于模型判别的方式，但前者存在明显的漏判与误伤，后者则难以满足大规模消融实验的效率要求。
在反复分析推理日志后，我们发现了一个意想不到的切入点：**投机采样（Speculative Decoding）指标可以作为异常检测的重要参考。**
投机采样原本是一个性能优化技术，先由草稿模型生成候选 token，再由目标模型校验并决定是否接受，从而在不改变最终输出分布的前提下提升 decode 效率。如图 1 所示，我们观察到，两个指标在异常发生时呈现出稳定模式：

- **乱码和生僻字**：通常伴随极低的 spec_accept_length（目标模型连续接受的 draft token 前缀长度），即草稿模型生成的候选 token 几乎全部被目标模型拒绝，表明目标模型所看到的 KV Cache 状态与草稿模型预期之间存在显著偏差。
- **复读**：通常伴随偏高的 spec_accept_rate（draft token 被接受的比例），表明损坏的 KV Cache 可能使注意力模式退化，并将生成过程推向高置信度的重复循环。
基于上述观察，我们进一步实现了一套在线异常监控策略：当 spec_accept_length 持续低于 1.4 且生成长度已超过 128 token，或 spec_accept_rate 超过 0.96 时，系统主动中止当前生成，并将请求交由负载均衡器重试。
--- See also [Karpathy Vibe Coding To Agentic Engineering](ch04-122-hy3-preview-agent.html)

## BugFix #1：PD 分离架构下的 KV Cache 竞态
### 原因分析：异步 Abort 引发的 KV Cache 复用竞态
为限制尾延迟，推理引擎中引入了基于超时的请求终止机制：当 Prefill 阶段未在规定时间内完成时，Decode 侧会对请求执行 Abort，并回收其占用的 KV Cache 资源。
然而，该 Abort 信号未被正确传播至 Prefill 侧，同时 Decode 侧也缺乏判断 KV Cache 是否可安全回收与复用的充分信息。因此，在 Decode Abort 并将对应 KV Cache 空间分配给新请求之后，先前已发起的 RDMA 写入以及正在执行的 Prefill 计算仍持续执行，未被同步取消。
**具体时序（两个请求在 PD 分离架构下的交互）：**
1. Req1 被发送至 Prefill-1（P1）和 Decode（D）
2. 由于调度或排队等原因，Req1 在 P1 侧经历了一段等待后才开始执行 Prefill Forward
3. Decode 侧在一段时间内未收到对应的 KV Cache 数据，触发超时机制，并对 Req1 执行 Abort
4. Decode 侧回收 Req1 占用的 KV Cache 槽位，但没有正确通知 P1
5. 新请求 Req2 到达，被分配至 Prefill-2（P2）和 Decode，由于内存复用策略，被分配到与 Req1 相同的 KV Cache 地址
6. P2 开始执行 Prefill Forward 并进行 KV Transfer，并在较短时间内完成，使 Decode 侧进入生成阶段
7. 与此同时，P1 侧针对 Req1 发起的 KV Cache 写入仍在继续，其数据会写入已被 Req2 复用的显存区域，从而覆盖 Req2 的部分 KV Cache
8. **最终，Req2 在 Decode 阶段读取到被覆盖的数据，导致生成结果异常**

### 修复方案：KV Cache 释放的时序一致性保证
为消除上述竞态，在推理引擎中引入了更严格的时序约束，在请求终止与 KV Cache 写入完成之间建立显式同步关系：

- Decode 在触发 Abort 后，会向 Prefill 侧发送通知
- Prefill 仅在以下条件满足时返回"可释放"信号：相关 RDMA 写入尚未开始，或所有已提交写入均已完成
- Decode 仅在收到该确认后，才允许回收并复用对应的 KV Cache 槽位
**修复效果**：异常输出的发生率由约万分之十几下降至万分之三以下。
---

## BugFix #2：HiCache 加载时序缺失
### 原因分析：流水线同步缺失导致的 read-before-ready
Coding Agent 场景显著提高了输入长度（平均超过 70K tokens），同时伴随较高的前缀复用率。这类负载使 HiCache（多级 KV Cache）成为线上服务中的关键优化手段。然而，在 KV Cache 换入与计算重叠执行的情况下，当前实现未能保证数据在使用前已完成加载，导致可能出现未就绪 KV Cache 被访问的情况。
系统会从 CPU 内存异步换入（swap-in）历史前缀缓存，并通过 Load Stream 与 Forward Stream 的重叠执行来提高吞吐。Load Stream 负责加载 KV Cache 与 Indexer Cache，而 Forward Stream 依次执行 Index 计算与后续的 Sparse Attention。
理论上，Forward Stream 中的 Indexer 计算应在对应的 Indexer Cache 完成加载后才能启动。然而，在原始实现中，该依赖未被显式表达。具体而言，Indexer 算子在启动时未对 Load Indexer Cache 的完成建立同步约束。因此，Forward Stream 可能先于 Load Stream 完成数据加载而开始执行，从而出现 **Read-before-Ready** 的访问模式。

### 修复方案：重构算子流水线的原子性
在 Indexer 算子启动前引入与 Load Stream 的同步点，确保对应层级的 Indexer Cache 已完成加载。Forward Stream 仅在数据就绪后才启动计算。
**该修复上线后，在相同负载条件下，由执行时序不一致引起的异常完全消失，系统行为趋于稳定。**
该修复已通过 Pull Request #22811 提交至 SGLang 社区。
---

## 优化：KV Cache 分层存储 LayerSplit
上述两个竞态问题揭示了一个共同的系统瓶颈：在长上下文的 Coding Agent Serving 场景中，Prefill 阶段主导了系统性能。
为了控制 Prefill 排队带来的 TTFT，我们引入了超时 Abort；为了缓解 Prefill 侧 KV Cache 容量压力，我们引入了 HiCache。在修复这些状态一致性问题后，我们进一步回到瓶颈本身：如何提升 Prefill 吞吐、降低 Prefill 侧 KV Cache 显存压力。为此，我们设计并实现了 **KV Cache 分层存储方案 LayerSplit**。
Coding Agent 负载通常呈现出上下文长度较长、Prefix Cache 命中率较高的特征。Context Parallel（CP）成为线上 Prefill 节点的主要并行策略。然而，现有的 SGLang 开源实现存在 KV Cache 冗余存储的问题，导致有限的 KV Cache 容量成为 GPU 计算资源利用率的限制因素。
**LayerSplit 方案**：每张 GPU 不再保存全部层的 KV Cache，而是仅持有部分层的 KV Cache，从而显著降低单卡的显存占用。
在计算过程中，不同 CP rank 按照协同方式完成 Prefill：持有某一层 KV Cache 的 rank 会在执行 Attention 计算前，将该层 Cache 广播给其他相关 rank。为降低通信开销，进一步设计了 KV Cache 广播与 indexer 计算的重叠机制，使二者在时间上相互掩盖。整体流程中仅引入了 Indexer Cache 广播的额外开销，其规模约为 KV Cache 的 1/8，因此整体通信成本较低。
**实验结果（Cache 命中率 90% 条件下，请求长度 40k-120k）：**

- 系统吞吐量提升幅度在 **10% 至 132%** 之间
- 上下文长度越长，收益越显著
---

## 总结
当智能真正进入高并发、长上下文的 Coding Agent 场景后，推理基础设施的挑战已经不只是吞吐、延迟和可用性，**维护它的输出质量变得至关重要**。每一次对 Scaling Law 的追求，都必须有同等强度的系统工程作为支撑。
---
**参考链接：**

- 技术 blog 原版（推荐阅读，含完整图表）：https://z.ai/blog/scaling-pain
- SGLang PR #22811（HiCache 修复已开源）：https://github.com/sgl-project/sglang/pull/22811
- 中科加禾 × 中国科学院计算技术研究所处理器芯片全国重点实验室 联合研究

## 深度分析
GLM-5的Scaling Pain案例揭示了高并发Coding Agent场景下推理系统面临的核心挑战：
**1. 异常检测的范式创新**：投机采样指标（spec_accept_length/spec_accept_rate）被发现可用于异常检测，这是将性能优化技术转化为可观测性工具的典型案例。乱码/生僻字与低spec_accept_length相关，复读与高spec_accept_rate相关，形成稳定的异常模式指纹。
**2. 竞态Bug的隐蔽性与系统性**：两个Bug（PD分离KV Cache竞态、HiCache加载时序）都是典型的分布式系统状态一致性问题的不同表现形式。它们的共同特征是：只在高负载、长上下文场景下触发，难以本地稳定复现，根因隐藏在对时序敏感的状态管理中。
**3. 系统瓶颈的根源**：两个Bug的修复揭示了共同的系统瓶颈——Prefill阶段主导了Coding Agent场景的系统性能。LayerSplit优化正是针对这一瓶颈的根本性解决方案，通过KV Cache分层存储降低单卡显存压力。

## 实践启示
1. **利用性能优化技术的副产物进行异常检测**：投机采样原本是性能优化手段，但其指标（spec_accept_length、spec_accept_rate）在异常时呈现稳定模式，可作为在线监控的锚点。这种"用优化技术的副产物做可观测性"的思路值得借鉴。
2. **高负载压测是暴露隐式Bug的必要条件**：本地回放无法稳定复现异常，只有在接近真实负载的条件下（调整PD分离比例、持续提高系统负载）才能稳定触发。线上问题排查需要构建压力环境模拟能力。
3. **时序一致性是分布式推理系统的核心 invariant**：KV Cache释放必须与RDMA写入完成建立显式同步，流水线各阶段必须在数据就绪后才能启动计算。任何违反这一原则的设计都可能引入隐蔽的竞态条件。
4. **修复应优先于优化**：在两个竞态Bug修复之前，LayerSplit等优化方案的效果会被系统不稳定掩盖。先修Bug，再做优化，才能获得可衡量的效果提升。
## 相关实体

- [lightseek token speed inference](ch12-023-inference-theft-as-ai-endpoint-attack-surface-vercel-token.html)
- MOC

---
