## Ch16.015 vLLM V0→V1 迁移中的 logprob 差异修复

> 📊 Level ⭐⭐⭐ | 9.4KB | `entities/vllm-v0-to-v1-correctness-before-corrections.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/vllm-v0-to-v1-correctness-before-corrections.md)

## 核心发现
- V1 默认返回 **raw logprobs**（未经后处理），而 trainer 期望 **processed logprobs**
- V1 的 prefix caching / async scheduling 改变了执行路径
- 先修 backend 再调 objective，不要反过来
- Clip rate 是最敏感的 mismatch 指示器

## 影响范围
所有使用 vLLM 做 rollout generation 的 online RL 方法（PPO、GRPO、GSPO）

## 相关链接
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/vllm-v0-to-v1-correctness-before-corrections.md)

## 相关实体
<!-- ⚠️ 以下交叉引用在 lint 时未通过，请确认 slug 后再取消注释 -->
<!-- - servicenow vllm correctness -->
<!-- - servicenow vllm correctness huggingface -->

## 深度分析
### 背景：为什么 V0→V1 迁移是个高风险操作
vLLM 的 V1 引擎对 V0 做了大量底层重构，包括调度器架构、内存管理、KV cache 分配策略和 logprob 计算路径的重大变化。对于大多数推理场景，这些变化是透明的、性能正交的。但对于 **RL 训练**（尤其是需要精确 token-level logprob 的 PPO/GRPO/GSPO），这些变化直接影响了 `logprob` 的数值语义，进而影响 policy gradient 的计算精度。
V0 的 logprob 输出经过完整的 `temperature → repetition_penalty → min_length/truncate` 后处理流水线。而 V1 为了降低延迟，默认返回 **raw model logits** 经过 log-softmax 后的值，跳过了这部分后处理。这导致即使模型权重完全相同，V0 和 V1 的 `logprob` 也会系统性偏差。

### 四个 backend 问题的逐层解析
**问题一：Logprob Semantics（最关键）**
V1 新增的 `logprobs_mode` 参数控制 logprob 的计算方式。默认值在 V0 和 V1 之间存在语义差异：V0 默认执行完整后处理，V1 默认不执行。当 `use_v1: true` 时，必须显式设置 `logprobs_mode: "processed_logprobs"` 来恢复 V0 语义。否则 reward shaping、entropy bonus、value estimation 全部会带上系统性偏差。
这个问题的影响范围极广：所有依赖 `logprob` 计算 advantage estimation 的 RL 方法都会受影响。PPO 的 clipped surrogate objective 直接依赖 `logprob` 比率，GRPO 的 group-relative advantage 依赖 `logprob` 的精确值。哪怕 0.01 的均值偏移，在数万次迭代的累积下也会导致训练曲线漂移。
**问题二：Runtime Defaults — Prefix Caching 与 Async Scheduling**
V1 引入了 prefix caching（相同 prompt 前缀的 KV cache 复用）和 async scheduling（异步 token 生成调度）。这两个优化在推理场景下是重大性能收益，但在 RL 训练中引入了非确定性：相同 `input_ids` 可能因为 cache 命中状态不同而走不同的执行路径，导致 `logprob` 在 token 位置上有微小差异。
对于 RL 训练的可复现性（reproducibility）要求，这种不确定性是不可接受的。ServiceNow-AI 团队的建议是：在训练阶段显式关闭这两个特性（`enable_prefix_caching: false`, `async_scheduling: false`），只在推理部署时启用。
**问题三：Inflight Weight Updates**
V1 的权重更新路径（weight update during inference）与 V0 有差异。这主要影响的是 online RL 中的 weight update 频率和时机。如果在 rollout 过程中进行权重更新（常见于 PPO 的 async PPO 变体），V1 可能因为权重同步时机不同导致 logprob 计算不一致。
**问题四：fp32 lm_head 精度**
`lm_head`（final projection layer）的计算精度在 V0 和 V1 默认配置下可能不同。V0 有时依赖 implicit FP8 或混合精度优化，而 V1 的默认精度策略可能不同。确保 `lm_head` 在 FP32 下运行可以避免低精度累积误差影响 logprob 精度。

### Clip Rate 作为Mismatch 指示器
PPO 和 GRPO 训练中，clip rate（被 clip 的 policy ratio 的比例）是一个关键的可观测指标。正常训练时，clip rate 通常在 1%–20% 区间。如果 clip rate 出现剧烈波动（尤其是从极低突然升高）或训练曲线出现"台阶式"突变，这通常是 logprob 不匹配的信号。ServiceNow-AI 特别指出：在 V0→V1 迁移的初期，clip rate 是最容易读到的系统性 mismatch 信号，应该作为第一优先级监控指标。

## 实践启示
### 迁移检查清单
在将 RL 训练 pipeline 从 V0 切换到 V1 时，以下配置是**必须**验证的：
```
vllm_config:
  use_v1: true
  vllm_kwargs:
    logprobs_mode: processed_logprobs    # 恢复 V0 logprob 语义
    enable_prefix_caching: false           # 关闭 cache 非确定性
    async_scheduling: false                # 关闭 async 调度非确定性
    lm_head_precision: fp32               # 确保 lm_head 精度对齐
```

### 推荐迁移策略
**阶段一：逐项隔离验证**
不要一次性切换所有配置。先在固定随机种子下，对比 V0 和 V1 相同输入的 logprob 输出。使用一个简单的 dummy prompt（如 "The capital of France is"），对比每个 token 位置的 logprob 差异。如果差异超过 `1e-3`，说明 logprob 语义未对齐。
**阶段二：短期 RL 跑分**
在确认 logprob 数值对齐后，用一个小型模型（如 1B–3B）在短数据集上做 100–500 步的 RL 训练。对比 V0 和 V1 的训练曲线（特别是 clip rate 和 policy entropy）。如果两者在 1% 以内对齐，再切换到完整训练。
**阶段三：prod 迁移后持续监控**
V1 的默认行为会随着 vLLM 版本更新而变化。每次升级 vLLM 后，都应该重新跑一遍上述对齐验证 pipeline。

### 对不同 RL 方法的影响差异
- **PPO**：对 logprob 精度最敏感，因为 PPO 的 importance sampling ratio (`π_new/π_old`) 直接依赖精确 logprob 值
- **GRPO**：相对宽容一些，group-relative advantage 计算会做归一化，但 logprob 均值偏差仍会影响 advantage baseline
- **GSPO**（格尔茨随机策略优化）：和 GRPO 类似，但由于采样策略更激进，logprob 不匹配会放大采样方差

### 配置管理的工程建议
建议在 RL 训练代码中，通过环境变量或 config 文件集中管理 vLLM 的版本兼容配置，而非散落在各个调用点。这样可以在切换 V0/V1 时保持单一配置来源，减少因配置不一致导致的难以复现的 bug。
---

## 总结
vLLM V0→V1 迁移中的 logprob 差异，本质上是 **推理引擎默认行为变化** 与 **RL 训练对数值精度的严格要求** 之间的冲突。核心修复路径是：显式设置 `logprobs_mode: processed_logprobs`，关闭 prefix caching 和 async scheduling 确保执行路径确定性，并在训练初期以 clip rate 为核心监控指标验证对齐状态。不要在 backend 未对齐的情况下尝试通过调整 RL objective 来"掩盖"问题——那样只会引入更难追踪的隐式错误。

---
