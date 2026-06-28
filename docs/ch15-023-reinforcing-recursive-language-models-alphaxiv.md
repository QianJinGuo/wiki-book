## Ch15.023 Reinforcing Recursive Language Models | alphaXiv

> 📊 Level ⭐⭐⭐ | 6.4KB | `entities/reinforcing-recursive-language-models-alphaxiv.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/reinforcing-recursive-language-models-alphaxiv.md)

## 核心要点
- 通过 RL 在单一共享策略下训练父 RLM 和子 RLM
- 小模型可学习特定任务的 RLM 行为，无法通过 prompt 或 SFT 唤起
- 适用于对 RLM 有基本了解的技术读者

## 深度分析
1. **单一策略统一父子角色是工程可行且优雅的设计**
   传统观点认为训练父子 RLM 需要两套独立策略和双套奖励信号，但本文证明只需一个 policy，通过 `rlm_query` / `rlm_query_batched` 调用让子 RLM 在同一次 rollout 中被采样，子 rollouts 继承父的 advantage。这将多智能体信用分配问题转化为单策略优化问题，大幅简化训练 pipeline 。
2. **逐步训练（Stepwise Training）重新定义了 RL 训练样本边界**
   RLM scaffold 每个 turn 重塑 user prompt 而非累积历史，导致一个完整 rollout 产生 N 个独立训练样本，每个样本只对最后一个 action 计算梯度。这一特性与标准 chat RL 不同——无法将完整 rollout 当作单一样本训练，需要 GRPO 组内所有 turn 共享最终 advantage。文章用数学归纳法证明了这一递归结构的合理性：子树损失 = 当前节点损失 + 1/k_g × 子节点子树损失 。
3. **冷启动 SFT 的数据集规模比模型规模更关键**
   小模型（4B）直接 RL 面临"边缘能力"困境：RLM scaffold 复杂度超出模型原生能力，导致 0 pass@16。解决方案不是加大 SFT 数据量，恰恰相反——在完整 RL 数据集上做 SFT 会导致 KL spike 和 reward collapse，而在 held-out 少量数据（数十条）上做 SFT 才能保持 entropy 并稳定训练。曲线显示 full-dataset SFT 在 4 epochs 后迅速崩溃，small-holdout SFT 则平稳上升 。
4. **Rubric-based LLM Judge 比可验证奖励更鲁棒**
   可验证奖励（F1 character-span overlap）对证据选择任务噪声极大——同一问题存在多种合法答案选段。团队转而使用 rubric-based judge（提供 query + ground truth + prediction），显著降低 reward hacking。这一发现在多个 RL 训练文献中得到印证 。
5. **RLM 的终极目标是策略发现（Strategy Discovery）而非策略执行**
   当前 RLM 依赖 1500+ token 的详细策略提示来描述 REPL 操作和子任务分解方式，这本质上是"让模型执行人类想好的策略"。真正的突破点在于：当 RLM scale 到足够强时，应该能够自己发现人类未曾想到的分解策略——就像 DeepSeek-R1 通过 RL 自发产生 CoT 推理一样。这一目标将 RLM 从"推理执行器"重新定位为"推理发现器"，scale up 模型尺寸后策略发现将成为训练的主要任务 。

## 实践启示
1. **先用 small-holdout SFT 做冷启动，再跑 RL，别用 full-dataset SFT**
   如果你的小模型（≤7B）在 RLM scaffold 上 RL 效果差，先检查是否有冷启动 SFT 阶段。如果已有 SFT，检查是否用了 held-out subset 而非全部数据。full-dataset SFT 导致的 entropy collapse 是不可恢复的训练事故 。
2. **RLM advantage 跨层级广播时要做归一化**
   子 RLM 数量 k_g 会直接影响梯度幅度——当一个父 RLM spawn 大量子 RLM 时，如果不做 1/k_g 归一化，子 rollouts 会主导梯度更新，导致父 RLM 训练不足。这在并行度高的任务（如多论文证据选择）中尤为关键 。
3. **遇到 noisy verifiable rewards 时优先换用 rubric-based LLM judge**
   如果任务指标（F1/BLEU/accuracy）存在多解性或标注不一致，不要硬调 reward function，直接上一套 rubric-based judge。参考 aws-reinforcement-fine-tuning-llm-as-judge 的工程实现，rubric 设计要包含评分维度和对应的 answer key 。
4. **Stepwise RL 训练时监控 clip rate 而非 loss**
   Stepwise 结构意味着每个 turn 独立计算 gradient，传统的 loss 平滑曲线可能掩盖问题。关注 GRPO clip rate——正常区间 1%-20%，如果出现骤降或台阶式突变，通常是 logprob 计算出现了系统性偏差 。
5. **生产部署 RLM 时优先考虑延迟而非单次 accuracy**
   RL fine-tuned 4B RLM 的 eval score（0.60）略低于 Claude Sonnet 4.6（0.607），但延迟从 60s 降至 7s（8.5x 提升）。在长上下文、多论文并行处理场景下，wall-clock time 的改善往往是产品是否可用的决定性因素 。
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/reinforcing-recursive-language-models-alphaxiv.md)

## 相关实体
- [Language Models and Meaning](ch01-373-language-models-and-meaning.html)
- [Cost effective deployment of vision-language models for pet behavior detection on AWS Inferentia2](ch11-177-chroma-vs-qdrant.html)
- [Language Models and Meaning](ch01-373-language-models-and-meaning.html)

---
