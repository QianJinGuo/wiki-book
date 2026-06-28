## Ch16.019 vLLM V0 to V1: Correctness Before Corrections in RL

> 📊 Level ⭐⭐⭐ | 4.6KB | `entities/servicenow-vllm-correctness.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/servicenow-vllm-correctness-huggingface.md)

## 深度分析
vLLM V0 到 V1 是实质性重写，而非增量迭代。ServiceNow AI 的这篇博客核心贡献是展示了在 RL 训练中进行推理引擎迁移时，如何系统性地隔离和修复正确性差距，而非直接诉诸目标函数层面的修正。    
**logprobs 语义不匹配是首个拦路虎。** vLLM V1 默认返回原始模型输出的 logprobs（在 temperature scaling、penalties、top-k/top-p 过滤之前），而 PipelineRL 期望的是经过采样器处理的分布的 logprobs。设置 `logprobs-mode=processed_logprobs` 修复了均值偏移，但训练曲线仍有差距——说明单一修复不够，下一个问题的根因在推理路径本身。    
**V1 运行时默认值引入的隐性差异。**  prefix caching（默认开启）和 async scheduling（默认开启）在 V1 中与 V0 行为不同。prefix caching 在 online RL 场景下尤其危险：前缀缓存命中可能在权重更新边界之前重用已计算状态，导致 actor 拿到过期推理结果。禁用 prefix caching 和 async scheduling 是还原 V0 等效行为的必要步骤。    
**inflight weight update 的语义对齐。** V0 的权重同步机制本质上是：阻塞在引擎边界 → 加载新权重 → 恢复执行，不显式清除缓存状态。V1 的等效方案是 `pause_generation(mode="keep", clear_cache=False)` → RPC 传递权重更新 → `resume_generation()`。关键在于 `mode="keep"` 和 `clear_cache=False` 匹配了 V0 的隐式语义。    
**fp32 lm_head 的必要性有独立文献支撑。** MiniMax-M1 技术报告已经发现 RL 训练/推理 token 概率不匹配问题并归因于 LM 输出头，ScaleRL 论文也将 fp32 logits/head 计算纳入大规模 RL 配方并 ablation 验证。这是 RL 推理引擎迁移时不可忽略的数值精度问题，因为 logprobs 直接进入策略比率、KL 和裁剪计算。    

## 实践启示
**推理引擎迁移时先做后端等效性验证，再调整 RL 目标函数。** 这是 ServiceNow 最核心的经验。错误的顺序（先改目标函数再修后端）会导致目标侧的修正掩盖后端问题，使训练曲线难以解读，无法判断收益来源是目标改进还是后端补偿。    
**online RL 场景下 prefix caching 需要特别谨慎。** 论文描述的问题本质是：缓存的生命周期管理在权重异步更新场景下与静态推理场景不同步。如果你的 RL pipeline 有并发请求、异步调度或 inflight weight updates，prefix caching 可能引入难以察觉的状态污染。    
**logprobs 模式选择是 vLLM V1 迁移的第一个检查项。** 任何 PipelineRL/GSPO/PPO/GRPO 系统在切换到 V1 前，首先确认 `logprobs-mode` 设置与训练器期望一致。默认值差异会导致所有 downstream metrics（clip rate、KL、entropy、reward）全面漂移。    
**lag 是有用的运行时诊断信号。** 初始 V1 路径在训练后期携带更多持续性 lag，最终 V1 修正路径的 lag 曲线更接近 V0 参考。这提供了一个可直接观察的训练健康度指标——如果你的 rollout engine 和 trainer 之间的权重 lag 在训练后期持续扩大，说明后端同步机制可能存在问题。    
**后端等效性恢复后，下一步是 async/off-policy 清理。** 保持 rollout 时刻的 behavior policy logprobs，在优化时重新计算 trainer-side old policy logprobs，将后端差异修正与策略更新比率分离，跟踪 ESS 等诊断指标——这些是后端 parity 达成后的自然下一步。    

## 相关实体
- servicenow vllm correctness huggingface

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/vllm-v0-to-v1-correctness-before-corrections.md)

- vLLM V0→V1 迁移中的 logprob 差异修复
- 无惧off-policy偏移！bengio团队解绑后训练，大模型rl提速50倍

---
