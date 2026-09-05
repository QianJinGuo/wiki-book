---
title: glm5-scaling-pain-inference
source_url: https://mp.weixin.qq.com/s/9YdGXrqCPr90yDpdFf5Txg
publish_date: 2026-04-30
tags: [wechat, article, agent, coding]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: faa241caf530ae126ece991eb8bc9bbab186761b01b415c3fc0586834b43d9c4
---

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