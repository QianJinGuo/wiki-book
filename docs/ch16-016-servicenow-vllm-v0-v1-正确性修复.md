## Ch16.016 ServiceNow vLLM V0→V1 正确性修复

> 📊 Level ⭐⭐⭐ | 8.3KB | `entities/servicenow-vllm-correctness-huggingface.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/servicenow-vllm-correctness-huggingface.md)

## 核心问题：训练-推理 logprob 不匹配

PipelineRL 的训练器直接消费 rollout 产生的 token logprobs 来计算策略比率、KL 散度、clip rate、entropy 和 reward。任何 logprob 计算语义的变化都会改变训练动态。

vLLM V1 默认返回**原始模型输出的 logprobs**（在 temperature scaling、penalties、top-k/top-p 过滤之前），而 PipelineRL 期望的是**经过采样器处理的分布的 logprobs**。这一语义差异导致初始 V1 跑通后，clip rate、KL、entropy、reward 全面漂移。

## 四个后端修复

### 1. Logprob 语义修复

设置 `logprobs-mode=processed_logprobs` 移除了明显的均值偏移，使策略比率均值稳定在 1.0 附近。但训练曲线仍有差距——说明单一修复不够，下一个问题在推理路径本身。

### 2. 运行时默认值对齐

V1 的 prefix caching（默认开启）和 async scheduling（默认开启）引入了 V0 不存在的执行路径差异。在 online RL 场景下，prefix cache 命中可能在权重更新边界之前重用已计算状态，导致 actor 拿到过期推理结果。

对齐配置：

```yaml
vllm_config:
  use_v1: true
  vllm_kwargs:
    logprobs-mode: processed_logprobs
    enable-prefix-caching: false
    async-scheduling: false
```

### 3. Inflight Weight Updates 语义对齐

V0 的权重同步机制：阻塞在引擎边界 → 加载新权重 → 恢复执行，不显式清除缓存。V1 等效方案：

```python
await engine.pause_generation(mode="keep", clear_cache=False)
await engine_client.collective_rpc_async(
    "receive_weight_update",
    args=(request.model_dump_json(),),
)
await engine.resume_generation()
```

关键：`mode="keep"` 和 `clear_cache=False` 匹配了 V0 的隐式语义。

### 4. fp32 lm_head 最终投影精度

即使前三项修复完成，最终 parity 仍需要 fp32 `lm_head`。MiniMax-M1 技术报告和 ScaleRL 论文都独立发现了这个问题：RL 更新直接消费 token logprobs，而 lm_head 输出的 logits 精度变化会传播到 logprobs，进而影响策略比率、KL 散度和 clip rate。

## 核心工程原则：先修后端，再谈目标

ServiceNow 的经验是：**错误的顺序（先改目标函数再修后端）会导致目标侧的修正掩盖后端问题，使训练曲线难以解读**。正确的问题分解应该是：

1. 推理后端是否产生了正确的 logprobs？
2. 给定正确的 logprobs，目标函数是否还需要 off-policy 或 async 修正？

这两个问题需要分离处理。

## 相关实体

- ServiceNow vLLM Correctness（更完整的分析）
- vLLM V0→V1 迁移中的 logprob 差异修复

## 深度分析

vLLM V0 到 V1 的迁移表面上是同一个推理引擎的版本升级，实际上是一次架构重写带来的行为契约变化。 ServiceNow 团队设定的迁移目标"让 V1 返回与 V0 等效的 rollout logprobs"看似技术性极强，实则揭示了 RL 训练系统中的一个深层依赖：训练器对推理后端的输出语义做了隐式假设。这些假设在 V0 时代是正确的，但在 V1 重写后若不显式声明和强制对齐，就会成为训练不稳定的隐秘根源。

logprobs 的语义差异（原始模型输出 vs. 采样器处理后分布）是四个修复中最初级但也最关键的一个。 它之所以关键，不是因为修复困难，而是因为它揭示了一个更普遍的问题：推理引擎版本升级时，默认配置的语义变化往往不会出现在升级指南中，却会直接影响消费推理输出的上游系统。这一问题在 PipelineRL 这类直接消费 token logprobs 计算训练目标的架构中尤为致命——logprob 均值偏移直接体现为策略比率的系统性偏差。

prefix caching 在 RL 推理中的危险性被这一案例充分暴露。 Prefix caching 的设计目的是通过重用已计算的 KV cache 加速推理，这在静态场景（固定模型权重、固定对话前缀）下是合理的优化。然而，在 online RL 场景下，模型权重在训练过程中持续更新，prefix cache 命中可能在权重更新边界之前重用已计算状态，导致 actor 获取与当前权重不对应的过期推理结果。这一问题在异步调度和并发请求混合时进一步复杂化，因为缓存失效边界与权重更新边界的对齐无法得到保障。

fp32 lm_head 的发现在多个独立研究中得到印证（MiniMax-M1 技术报告、ScaleRL 论文），表明这是一个跨团队、跨方法的普遍性问题而非 ServiceNow 特有。 fp16 lm_head 输出的 logits 精度变化通过 logprobs 传播到 RL 更新的每一个计算环节——策略比率、KL 散度、clip rate 均受影响。这意味着在大型 RL 训练任务中，lm_head 投影精度的选择并非性能优化问题，而是正确性前提。ScaleRL 将 fp32 logits/head 计算纳入标准 RL 配方，意味着这一实践正在从个别案例上升为社区共识。

ServiceNow 总结的核心工程原则——"先修后端，再谈目标"——具有超出 vLLM 迁移场景的方法论价值。 在引入任何目标侧修正（truncated importance sampling、off-policy correction、async correction）之前，必须首先确保推理后端在等效条件下运行。这一原则的反面教训同样重要：在推理后端行为未对齐的情况下，目标侧的修正会与后端问题产生混合效应，使得训练曲线难以解读，也无法判断改进来源于修正本身还是后端修复的附带结果。

## 实践启示

- **推理引擎升级时的必检清单**：在将推理引擎升级到新版本后，第一步应验证 rollout logprobs 与旧版本的语义等效性，而非直接进行目标函数调优或训练超参数调整；具体检查项应包括 logprobs 计算位置（原始输出 vs. 采样后）、默认精度（fp16 vs. fp32）和默认优化项（prefix caching、async scheduling）的状态变化。
- **online RL 场景下禁用 prefix caching**：在模型权重持续更新的训练场景中，prefix caching 引入的缓存重用语义与权重更新边界可能产生冲突；建议在 online RL 训练中显式设置 `enable-prefix-caching: false`，直到推理引擎提供权重更新感知的缓存失效机制。
- **inflight weight update 的语义声明**：在实现权重更新逻辑时，应明确声明 `mode` 和 `clear_cache` 参数的语义选择并与推理引擎版本对齐；`mode="keep"` 和 `clear_cache=False` 的组合匹配了 V0 的隐式语义，但新引擎版本可能有不同的默认值，需要显式对齐。
- **lm_head 投影精度作为 RL 正确性前提**：对于直接消费 token logprobs 的 RL 训练系统，建议将 fp32 lm_head 作为基线配置而非可选优化；这一选择与 ScaleRL 论文的推荐一致，在不引入显著性能损失的情况下消除了数值精度传播这一隐蔽的正确性风险。
- **问题分解的工程顺序**：当训练曲线出现异常时，应严格遵循"推理后端等效性 → 目标函数修正"的处理顺序；在确认推理后端正确性之前，避免在目标侧引入修正——否则修正效果与后端修复效果混合，使得训练异常的根因诊断变得不可信。

---
