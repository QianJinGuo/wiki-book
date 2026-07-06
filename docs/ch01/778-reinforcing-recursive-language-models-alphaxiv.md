# Reinforcing Recursive Language Models | alphaXiv

## Ch01.778 Reinforcing Recursive Language Models | alphaXiv

> 📊 Level ⭐⭐ | 5.2KB | `entities/alphaxiv-reinforcement-learning-for-rlms.md`

> → [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/alphaxiv-reinforcement-learning-for-rlms.md)

## Summary
7×8=56 - Article ingested from newsletter candidate pipeline.

## Notes
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/alphaxiv-reinforcement-learning-for-rlms.md)

## 深度分析
**核心贡献：单策略统一训练 parent 和 child RLM**
本文提出了一个关键洞察：不需要分别为 parent RLM 和 child RLM 训练两个独立策略模型。通过让 child RLM rollouts 继承 parent RLM 的 advantage，可以用一个共享策略同时扮演 parent decomposer 和 child sub-agent 两种角色 。
这种设计避免了双策略训练的繁琐管道，同时通过 GRPO 的 group-relative advantage 计算确保训练稳定。关键实现细节是 child loss 除以 $k_g$（child 数量）以平衡权重，防止当 $k_g \gg 1$ 时 child rollouts 主导梯度更新 。
**分步式训练的重要性**
文章详细描述了 RLM 训练中一个重要但常被忽视的细节：每一步 turn 不共享前缀，用户 prompt 在每个 turn 都被重新追加而非累积到 chat history 中 。这意味着一个 trajectory 产生 N 个独立的 training samples，而不是一个连贯序列。
这与传统 chat RL 完全不同——传统 chat RL 中每个 trajectory 是一个完整序列，而 RLM 的 step-wise 结构要求每个 turn 单独计算 log-prob 并共享最终 advantage 。这种设计确保原始用户查询不会深埋在模型 context window 中，且每个 turn 都重新被提醒其任务。
**Cold-start SFT 的必要性**
对于小模型（如 Qwen3.5-4B），即使有精心设计的 prompt 和预定义工具，没有 SFT 阶段的情况下 pass@16 分数为零 。RLM-based tasks 超出了大多数小模型的能力边界。实验表明，在完整 RL 训练集上进行 SFT 会导致 entropy collapse 和训练不稳定，而在小规模 holdout 集上做 SFT 则训练稳定且有效 。
**Rubric-based Reward 优于 Verifiable Reward**
文章发现使用 F1 span overlap 作为 reward 信号过于嘈杂，因为同一问题可能有多种正确文本选择 。最终采用 rubric-based LLM judges，提供原始查询、真实文本和预测文本，能更稳健地防止 reward hacking。这一发现与 retrieval agent 训练中的经验一致。

## 实践启示
**1. RLM 训练策略分层设计**
从实验结果来看，当前 RLM 训练分为三个层次：详细策略 prompt（1500 tokens）→ 简化 prompt（200 tokens）→ 未来无 prompt 的 RLM-native 模型 。对于生产部署，建议先用详细策略 prompt 快速验证任务可行性，再逐步简化。
**2. 并行化带来的双重收益**
证据选择任务的多论文场景揭示了一个重要规律：sequential reasoning 会让 LLMs 进入"prefix trap"（执着于首次探索的方向），而并行化不仅改善 wall-clock time，还直接提升任务性能 。在设计 RLM 任务时，优先识别可并行分解的子任务。
**3. 训练稳定性关键点**

- SFT 阶段使用 held-out 小数据集而非完整训练集
- Step-wise RL 中只有对应最后一 step 的 rollouts 才被纳入 GRPO group 计算 advantage
- Child rollouts 的 loss 需要除以 $k_g$ 做归一化
- 多 child 并行时需处理 REPL timeout 的 race conditions 
**4. 从 SFT 到 RL 的演进路径**
纯 SFT 可教会模型 RLM scaffold 语法（REPL 导航、子调用格式），但无法训练特定任务的 RLM behavior 。强化学习则在保留基础 scaffold 能力的同时，针对具体任务优化行为，避免了纯 SFT 的 catastrophic forgetting。
**5. 未来方向：策略发现而非执行**
文章的 ablation 实验表明，简化 prompt 收敛略低且不稳定，但经过课程学习可能可以解决 。长远目标不是优化执行，而是让更大的 RLM-native 模型自主发现人类未曾想到的新策略来分解和解决长上下文难题。

## 相关实体
> [主题导航](https://github.com/QianJinGuo/wiki/blob/main/queries/ai-model-research-latest-directions.md)

- [Reinforcing Recursive Language Models | alphaXiv](ch01/804-reinforcing-recursive-language-models-alphaxiv.md)
- [Language Models and Meaning](ch01/488-language-models-and-meaning.md)
- [Language Models and Meaning](ch01/488-language-models-and-meaning.md)

---

