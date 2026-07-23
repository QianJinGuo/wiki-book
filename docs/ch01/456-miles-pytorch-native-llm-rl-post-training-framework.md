# Miles: PyTorch-Native LLM RL Post-Training Framework

## Ch01.456 Miles: PyTorch-Native LLM RL Post-Training Framework

> 📊 Level ⭐⭐ | 9.3KB | `entities/pytorch-miles-llm-rl-post-training.md`

# Miles: PyTorch-Native LLM RL Post-Training Framework

Miles 是 RadixArk 推出的开源 LLM RL 后训练框架，以 PyTorch 为核心，组合 SGLang（rollout）、NVIDIA Megatron-LM（训练）和 Ray（编排）构建可组合的大规模 RL 训练流水线。

## 背景：为什么需要 Miles

强化学习已成为 LLM 后训练的核心环节，但随着模型从密集架构向混合专家（MoE）过渡，并在 NVIDIA Blackwell/Hopper 等分布式专用硬件上运行，RL 后训练已不再只是一个训练循环——它是一个分布式系统问题。

现代 LLM RL 框架需要协调多个复杂组件：
- **Rollout workers** 必须以高吞吐量生成样本
- **Trainers** 必须高效消费样本并计算稳定的策略更新
- **Rollout 策略与训练策略**必须保持同步（尤其是 MoE 路由行为）
- **低精度方案**需要在全流水线中保持一致
- **长时运行任务**需要可观测性、checkpoint 和容错机制

Miles 正是为此场景设计的。

## 架构亮点

Miles 的核心设计是将 RL 训练分解为四个可组合层：

| 层级 | 组件 | 职责 |
|------|------|------|
| 编排层 | Ray | 分布式作业调度、容错、资源管理 |
| Rollout 层 | SGLang | 高吞吐量推理，样本生成 |
| 训练层 | Megatron-LM | 可扩展训练，流水线/模型/序列并行 |
| 通用层 | PyTorch | 统一数值计算与模型定义 |

**SGLang for Rollout**：SGLang 作为 rollout 引擎，优化了高吞吐 LLM 推理。它处理 RL 的样本生成阶段——模型生成响应由奖励模型评估。SGLang 的高效批处理和 tensor parallelism 使其适合快速生成大量训练样本。

**Megatron-LM for Training**：Megatron-LM 提供训练骨干网，支持流水线并行、tensor 并行和序列并行，使 Miles 能够跨数百 GPU 扩展。MoE-aware alignment 确保 rollout 和训练阶段的路由行为保持一致。

**Ray for Orchestration**：Ray 负责分布式作业调度、资源管理和容错。长时间运行的 RL 训练作业可从节点故障中自动恢复，checkpoint 内置于工作流中。Ray 的分布式调度器协调集群中的 rollout workers 和 training workers。

**PyTorch as Common Layer**：PyTorch 作为统一的数值和模型定义层，研究人员可以自定义模型、损失函数和训练循环，无需学习特定框架的 API。Trainer 本身被设计为小型且可插拔——核心训练逻辑与基础设施脚手架分离。

这种分层设计使得研究人员可以只关注 trainer 层的定制，而不需要处理分布式基础设施的复杂性。

## 关键技术特性

- **统一的低精度方案**：FP8/BF16/INT4 在 rollout 和训练间保持一致性，消除精度不匹配问题。这解决了多框架堆叠时常见的精度不对称 bug——例如 rollout 阶段使用 FP16 但训练阶段使用 BF16，导致策略梯度计算中的数值漂移。
- **MoE-aware 对齐**：rollout 和训练阶段的路由 logits 同步，防止 MoE 路由漂移导致的策略偏差。这对于 MoE 模型至关重要——如果 rollout 时将 token 路由到专家 A 但训练时路由到专家 B，策略梯度将基于错误的专家输出计算。
- **NVIDIA NCCL/RDMA 快速权重同步**：rollout 和训练 worker 间通过 RDMA 高速同步权重，最小化同步开销
- **内置可观测性**：rollout 吞吐量、训练吞吐量、策略分歧度、reward 趋势等指标通过标准监控接口暴露
- **Ray-based 容错**：支持长时间运行的 checkpoint 自动恢复，适用于可能持续数天或数周的训练作业

## 深度分析

### RL 后训练的分布式系统本质

Miles 的架构揭示了 RL 后训练的一个深层事实：**当模型规模超过某个阈值后，RL 训练问题本质上是一个分布式系统问题，而非机器学习问题**。现代 LLM RL 的四个关键阶段（rollout、reward 计算、策略更新、同步）各自需要不同的硬件拓扑和通信模式——rollout 需要高吞吐推理（计算密集），reward 计算需要快速缓存访问（内存密集），策略更新需要梯度通信（网络密集）。将这些阶段组合到一个流水线中，需要的是系统设计而非算法创新。

### 组合性（Composability）vs 一体化（Monolithic）

Miles 选择了组合式架构（SGLang + Megatron + Ray + PyTorch），而不是构建一个一体化的 RL 框架。这种选择带来了以下权衡：

**优势**：
- 每个组件可以独立升级（如用 vLLM 替换 SGLang）
- 研究人员可以复用现有基础设施和专业知识
- 更容易针对特定硬件进行优化

**劣势**：
- 跨组件的调试更加困难（错误可能跨越 4 个系统的边界）
- 版本兼容性管理成为运维负担
- 端到端的性能调优需要理解所有四个组件的交互

对比之下，DeepSeek V4 的训练栈更倾向于一体化方案（自定义训练器 + 定制硬件），在极致性能上可能更优，但可复现性和可定制性较差。

### MoE-aware Alignment 的关键性

MoE-aware 对齐是 Miles 中最被低估的技术贡献。在 MoE 模型中，每个 token 由 router 网络分配到特定专家。如果 rollout 和训练阶段的 router 行为不一致（例如由于精度差异、dropout 模式不同或 batch 分布差异），策略梯度将基于错误的归因进行计算——模型可能奖励或惩罚了错误的专家选择。

Miles 通过在 rollout 和训练之间同步 router logits 来解决这个问题，确保两个阶段的专家分配一致。这类似于在分布式训练中保持模型参数同步的重要性——但对于 MoE，不仅是参数需要同步，路由决策也需要同步。

### 可观测性作为 RL 训练的关键基础设施

Miles 内置的可观测性（rollout 吞吐量、策略分歧度、reward 趋势）揭示了 RL 训练中一个常被忽视的需求：**RL 训练比监督训练更需要实时监控**。监督训练的损失曲线通常平滑可预测，但 RL 的 reward 信号可能剧烈波动，策略分歧度可以指示训练是否收敛到有效策略。没有这些指标，RL 训练的调试几乎是盲目的。

## 实践启示

1. **组合式 RL 框架是当前的最佳折中**：虽然一体化方案（如 DeepSeek V4 的自定义训练器）可能获得更极致的性能，但组合式框架（Miles 模式）更适合绝大多数团队。它允许团队复用现有 PyTorch 生态，降低迁移成本，且每个组件都可以独立优化。

2. **从密集模型过渡到 MoE 时，RL 训练栈需要重新评估**：MoE 的路由行为引入了新的不一致维度——确保 rollout 和训练的路由对齐至关重要。如果你的团队正在从 Dense LLM 迁移到 MoE 架构，Miles 的 MoE-aware alignment 是迁移的关键参考点。

3. **低精度一致性比低精度本身更重要**：在训练的不同阶段使用不同的精度格式会导致数值漂移，累积累计可能显著影响模型质量。选择一套贯穿全流水线的统一低精度方案（如全程 FP8），比在单个阶段追求更低精度更重要。

4. **RL 训练的可观测性基础设施需要在第一天就构建**：不要等训练跑偏了再添加监控。策略分歧度、reward 分布、rollout 吞吐量应该在实验启动时就可视化。Miles 将这些指标通过标准接口暴露，这是它的设计智慧——可观测性不是事后添加的锦上添花，而是 RL 训练的核心基础设施。

5. **考虑从 SGLang 开始，而非直接上 Megatron**：如果你的团队刚进入 RL 后训练领域，可以先只使用 SGLang 做 rollout + 简单的训练器组合（单 GPU 或小规模数据并行），验证 RL 训练流程的正确性，再逐步引入 Megatron 的并行策略和 Ray 的集群编排。Miles 的组合式架构支持这种渐进式扩展路径。

## 相关实体

- [SGLang](../ch04/600-agent-assisted-sglang-ai-llm.html) — Miles 使用 SGLang 作为 rollout 引擎
- [LLM RL 算法概览](ch01/882-llm.html)
- [DeepSeek V4 训练方法论](ch01/669-deepseek-v4.html)
- [前沿后训练配方回顾](../ch05/090-ai.html)
- [百度文心后训练演进](../ch05/090-ai.html)
- [PyTorch 训练循环实践](../ch05/090-ai.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/pytorch-miles-llm-rl-post-training-2026.md)

---

