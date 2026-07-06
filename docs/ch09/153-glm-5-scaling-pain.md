# GLM-5 Scaling Pain 推理复盘

## Ch09.153 GLM-5 Scaling Pain 推理复盘

> 📊 Level ⭐⭐⭐⭐ | 11.3KB | `entities/glm5-scaling-pain.md`

## 概述
智谱团队 2026 年披露 GLM-5 在高并发 Coding Agent 场景下遭遇的推理稳定性问题及修复方案。核心问题：乱码（garbled output）、复读（repetition）、生僻字（rare character）三类异常，根因分别定位到 PD 分离架构下 KV Cache 竞态和 HiCache 加载时序两个独立 Bug，以及 LayerSplit KV Cache 分层存储优化。

## 三类异常现象
| 异常 | 特征 | 检测信号 |
|------|------|---------|
| 乱码 | 随机字符异常 | spec_accept_length 极低 |
| 复读 | 输出重复循环 | spec_accept_rate 偏高 |
| 生僻字 | 罕见 Unicode 输出 | spec_accept_length 极低 |
**发现**：投机采样（Speculative Decoding）指标可作为异常检测信号——这是该技术的创新用法延伸。

## 根因一：PD 分离架构下 KV Cache 竞态
### 问题机制
Prefill-Decode 分离架构下，Abort 信号未正确传播至 Prefill 侧：
```
Req1 Abort → Decode 回收 KV Cache → Req2 复用同一地址 →
P1 的 KV 写入仍在进行 → 覆盖 Req2 的 KV Cache → 异常输出
```

### 修复方案
在 Abort 与 KV Cache 回收之间建立显式同步：

- Decode 触发 Abort 后向 Prefill 发送通知
- Prefill 返回"可释放"信号（RDMA 未开始 或 所有写入已完成）
- Decode 收到确认后才允许回收/复用 KV Cache
**效果**：异常率从万分之十几降至万分之三以下。

## 根因二：HiCache 加载时序缺失
### 问题机制
Load Stream（加载 KV Cache/Indexer Cache）与 Forward Stream（Index 计算 + Sparse Attention）存在流水线依赖未显式表达——Forward Stream 可能在数据加载完成前就开始执行，出现 **Read-before-Ready**。

### 修复方案
Indexer 算子启动前引入与 Load Stream 的同步点，确保数据就绪后才开始计算。
**已提交 SGLang PR #22811。效果：相同负载下异常完全消失。**

## 优化：LayerSplit KV Cache 分层存储
### 核心思路
每张 GPU 不再保存全部层的 KV Cache，而是仅持有部分层 → 显著降低单卡显存占用。
计算时持有某一层 KV Cache 的 rank 将该层广播给其他 rank，KV Cache 广播与 indexer 计算时间上相互掩盖。额外开销仅为 Indexer Cache 广播（KV Cache 的 1/8）。

### 效果
| 条件 | 提升幅度 |
|------|---------|
| 90% Prefix Cache 命中率 | 10% – 132% 吞吐提升 |
| 上下文越长 | 收益越显著 |

## 关键工程洞察
1. **异常检测新方法**：投机采样指标（spec_accept_length / spec_accept_rate）可用于推理质量的实时监控
2. **PD 分离架构的一致性约束**：跨节点的数据传输与显存复用必须建立显式一致性保证
3. **Cache 优化方向**：分层存储（LayerSplit）可在不增加通信成本的前提下降低显存压力
4. **Scaling Pain 本质**：追求 Scaling Law 必须有同等强度的系统工程支撑

## 相关链接
- 技术 blog（推荐）：https://z.ai/blog/scaling-pain
- SGLang PR #22811：https://github.com/sgl-project/sglang/pull/22811

## 相关页面
[原始存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/glm5-scaling-pain-inference.md) — 完整正文
[SGLang](../ch04/542-agent-assisted-sglang-ai-llm.md) — 本次 BugFix #2 修复代码已提交至 SGLang 开源社区
[推理系统优化](https://github.com/QianJinGuo/wiki/blob/main/concepts/inference-optimization.md) — LayerSplit 等推理效率优化技术

## 深度分析
### 1. PD 分离架构的根本矛盾
PD（Prefill-Decode）分离架构将两个阶段解耦到不同节点，本质上是以一致性延迟换取调度灵活性。然而，当两个阶段独立演进时，任何涉及共享状态的决策——如 KV Cache 的回收与复用——都必须建立显式的一致性协议。Abort 信号的语义在分离架构下不再是本地事件通知，而是一个需要跨节点协调的分布式协议。
原始 Bug 的核心在于：Decode 侧对 KV Cache 回收时，并未确认 Prefill 侧对该地址的写入是否已完成。这意味着显存复用策略实际上依赖了未声明的时间假设——假设"回收即意味着写入已结束"。在高并发压力下，这种隐式假设被并发时序打破。

### 2. 投机采样指标的双重用途
投机采样（Speculative Decoding）本是性能优化技术，其 spec_accept_length 和 spec_accept_rate 反映的是草稿模型与目标模型之间输出分布的一致性程度。GLM-5 团队发现这两项指标在 KV Cache 状态异常时呈现显著偏差，从而将其转化为异常检测信号。
这一发现的深层含义在于：**推理系统的某些故障会首先破坏模型输出分布的内部一致性**，而这种破坏在最终输出被用户感知之前就反映在中间指标上。这为实时质量监控提供了一条不依赖输出内容分析的低成本路径。

### 3. HiCache 流水线依赖的隐性耦合
HiCache 的 Load Stream 与 Forward Stream 在原始实现中以流水线方式重叠执行，但两者之间存在未被显式建模的数据依赖。Indexer 算子在启动时未对待使用的 Indexer Cache 建立同步约束——这是一个典型的"看起来对但实际错"的并发反模式。
问题本质是：**流水线的正确性不能仅靠性能优化意识来保证，必须在每一条数据依赖路径上显式声明同步约束**。

### 4. LayerSplit 的设计取舍
LayerSplit 通过让每张 GPU 仅持有部分层的 KV Cache 以降低单卡显存占用，代价是引入额外的广播通信。但设计者将 KV Cache 广播与 Indexer 计算在时间上相互重叠，使得额外开销仅为 Indexer Cache 广播（KV Cache 的 1/8）。
这反映了一个在大规模推理系统中的常见优化哲学：**用通信换显存，用流水线换同步**。关键在于找到两项开销在特定负载特征（高 Prefix Cache 命中率 + 长上下文）下相互掩盖的甜蜜点。

### 5. Scaling Pain 的本质
" Scaling Pain "并非偶发故障，而是追求 Scaling Law 过程中系统能力与模型能力之间存在时延的必然表征。每一次参数规模或数据规模的跨越，都会解锁新的推理压力分布特征，要求 Infra 团队在模型上线后重新审视那些"本来工作正常"的设计假设。

## 实践启示
1. **PD 分离架构中的 KV Cache 回收必须伴随显式同步**：Abort 信号需要被设计为分布式协议，而非本地事件通知。Decode 侧在回收 KV Cache 槽位前，应等待 Prefill 侧确认所有相关写入已完成或尚未开始。
2. **投机采样指标可作为推理质量的"金丝雀"**：将 spec_accept_length 和 spec_accept_rate 纳入线上监控告警体系，可以在用户感知到异常输出之前提前发现 KV Cache 或注意力机制的异常状态。
3. **流水线依赖必须在数据依赖路径上显式建模**：任何"数据使用者等待数据生产者"的模式都需要在代码层面建立同步点，不能依赖执行顺序的宽松假设。HiCache 的 Load/Forward Stream 分离应被视为一个反面教材。
4. **分层存储优化需匹配通信与计算的重叠策略**：LayerSplit 类的优化在设计时应优先考虑广播通信与计算时间的掩盖手段，否则额外引入的通信开销会侵蚀显存优化带来的收益。
5. **异常复现策略需要模拟真实压力分布**：GLM-5 团队在本地回放时未复现异常，直到调整 PD 分离比例并持续加压后才稳定复现。这说明高并发场景的异常往往与系统负载而非特定输入强相关，压测复现需要保留原始并发分布与请求时序。
6. **BugFix 应优先考虑通用性并回馈社区**：HiCache 的修复以 PR #22811 提交至 SGLang 开源社区，这意味着同样的问题可能在其他使用相同代码库的团队中复现，开源回馈有助于整个生态的可靠性提升。

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/coding-agent-practice.md)

---
