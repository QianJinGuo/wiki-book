# TokenSpeed: A Speed-of-Light LLM Inference Engine for AI Agents

## Ch01.605 TokenSpeed: A Speed-of-Light LLM Inference Engine for AI Agents

> 📊 Level ⭐⭐ | 7.4KB | `entities/lightseek-token-speed-inference.md`

# TokenSpeed: A Speed-of-Light LLM Inference Engine for AI Agents

## 摘要

**TokenSpeed** 是 LightSeek Foundation 开发的开源 LLM 推理引擎，专为 Agentic 工作负载（如 [Claude Code](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-coding-agent-from-helloworld-to-production.md)、Codex、Cursor 等 Coding Agent）从第一性原理设计。其核心创新包括：编译器支持的并行建模机制、C++/Python 混合的高性能调度器、编译时 KV 缓存安全管理、可插拔分层内核系统，以及与 SMG 集成的低开销 CPU 请求入口。在 NVIDIA Blackwell 上，TokenSpeed 对标 TensorRT-LLM，在 Coding Agent 场景下 Pareto 前沿全面领先约 9-11%。

## 核心要点

### 为什么需要专门的 Agentic 推理引擎？

Agentic Coding 已从 Demo 阶段进入规模化生产。Claude Code、Codex、Cursor 等系统产生了海量 token 需求，推动了数十 GW 级数据中心建设。在这个规模下，推理编排效率至关重要——即使 GPU 吞吐量的小幅提升，也能在整个生产集群中转化为显著的容量节省。

Coding Agent 的推理负载特征与传统 LLM 服务截然不同：
- **上下文长度**：常规超过 50K tokens
- **多轮对话**：单次会话往往跨越数十轮
- **延迟敏感**：生成速度直接影响用户体验
- **目标函数**：最大化每 GPU TPM（tokens/minute），同时保持每用户 TPS（tokens/second）下限（通常 70 TPS，有时 200+ TPS）

### 四大核心组件

#### 1. 编译器建模层（Modeling Layer）

采用**局部 SPMD**（Single Program, Multiple Data）设计，在性能和可用性之间取得平衡：

- 开发者在模块边界指定 I/O 放置注解（placement annotations）
- 轻量级静态编译器自动生成所需的集合操作（collective operations）
- 消除手动实现通信逻辑的需要
- 支持异构加速器

#### 2. 高性能调度器（TokenSpeed Scheduler）

**控制平面与执行平面解耦**：

- **控制平面**（C++ 实现）：有限状态机 + 类型系统，在编译时而非运行时强制安全的资源管理。请求生命周期、KV 缓存资源、重叠时序通过显式 FSM 转换和所有权语义表示
- **执行平面**（Python 实现）：保持开发效率，支持更快的特性和更低的认知负担

关键设计：KV 缓存状态转移和使用在编译时验证，正确性由可验证的控制系统而非约定来保证。

#### 3. 可插拔分层内核系统（TokenSpeed Kernel）

将内核从核心引擎中分离，作为一等公民的模块化子系统：

- 可移植的公共 API
- 集中式注册和选择模型
- 有组织的实现
- 可扩展的异构加速器插件机制
- 精选依赖
- 统一的快速迭代基础设施

**TokenSpeed MLA（Multi-head Latent Attention）** 是亮点之一：
- **Prefill 内核**：二进制版本使用 NVIDIA 内部调优参数微调 softmax 实现，在所有五种典型 Coding Agent prefill 工作负载上超越 TensorRT-LLM
- **Decode 内核**：将 q_seqlen 轴折叠到 head 轴以更好填充 BMM1 M tile，提升 Tensor Core 利用率（在某些用例中 num_heads 较小）
- **已被 vLLM 采纳**：TokenSpeed MLA 已合并到 vLLM 主线

#### 4. SMG 集成

与 PyTorch SMG（Static Memory Graph）集成，提供低开销的 CPU 侧请求入口点。

## 深度分析

### 与 TensorRT-LLM 的性能对比

TokenSpeed 在 NVIDIA Blackwell 上对标 TensorRT-LLM（当前 Blackwell 上的 SOTA），使用 Kimi K2.5 模型和 SWE-smith traces（接近生产 Coding Agent 流量）进行评估：

**Pareto 前沿对比**（Attention TP4 + MoE TP4 配置）：
- 最小延迟场景（batch size 1）：TokenSpeed 快约 **9%**
- 100 TPS/User 附近：TokenSpeed 吞吐量高约 **11%**

**MLA 内核对比**：
- Prefil：TokenSpeed MLA 在所有五种典型 prefill 工作负载上超越 TensorRT-LLM（带长前缀 KV 缓存的 Coding Agent 场景）
- Decode：在典型投机解码工作负载（batch size 4/8/16 + 长前缀 KV 缓存）上，延迟几乎减半

### 控制平面安全设计

TokenSpeed 调度器的核心创新是将 KV 缓存安全管理从运行时提升到编译时：

- **FSM 状态转移**：请求的每个生命周期阶段（创建、调度、执行、完成）都有明确的状态转换
- **所有权语义**：KV 缓存块的所有权在编译时确定，运行时无法违反
- **类型系统约束**：C++ 类型系统编码了资源约束，编译器拒绝不安全的代码路径

这种设计消除了传统推理引擎中常见的 KV 缓存竞争条件和悬垂引用问题。

### 开发时间线与成熟度

- **开发起始**：2026 年 3 月中旬
- **当前状态**：引擎和内核仍在积极开发中，生产级加固计划在未来一个月内完成
- **开源地址**：github.com/lightseekorg/tokenspeed

### 协作生态

TokenSpeed 的开发涉及广泛的行业协作：

| 合作方 | 贡献领域 |
|--------|----------|
| NVIDIA DevTech | 内核优化、Blackwell 支持 |
| AMD Triton | AMD 平台支持 |
| Qwen Inference | Qwen 3.6 模型优化 |
| Together AI | 模型优化、异构部署 |
| Mooncake | MoE 优化 |
| EvalScope | 基准测试框架 |
| NVIDIA Dynamo | 分布式运行时集成 |

## 实践启示

1. **推理优化是 Agent 落地的关键瓶颈**：选择 LLM 服务商或部署方案时，推理延迟应作为核心评估维度，尤其在 Coding Agent 场景
2. **MLA 内核优化价值巨大**：对于使用 DeepSeek V4、Kimi K2.5 等 MLA 架构模型的场景，TokenSpeed MLA 可带来显著的延迟降低
3. **编译时安全 > 运行时检查**：将资源管理约束编码到类型系统中，可以在不牺牲性能的前提下保证正确性
4. **控制平面/执行平面分离是好模式**：C++ 控制平面保证正确性，Python 执行平面保持灵活性，这种分离适用于其他高性能系统
5. **关注 PD 分离支持**：TokenSpeed 的 PD（Prefill-Decode）分离支持正在开发中，这将是下一个重要的性能提升点
6. **开源推理引擎的竞争格局**：TensorRT-LLM、vLLM、SGLang、TokenSpeed 形成四方竞争，用户应根据工作负载特征选择

## 相关实体

- [NVIDIA Agentic Systems Co-Design](../ch04/616-agentic.html)
- [Agentic Coding](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-coding-agent-from-helloworld-to-production.md)
- [LLM 推理优化](https://github.com/QianJinGuo/wiki/blob/main/concepts/inference-optimization.md)
- [vLLM](ch01/947-vllm.html)
- [MOC: LLM 研究前沿](https://github.com/QianJinGuo/wiki/blob/main/moc/llm-research-frontiers.md)

---

