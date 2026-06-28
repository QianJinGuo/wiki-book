## Ch15.021 LLM Post-Training全景指南：从RLHF到GRPO再到AgenticRL

> 📊 Level ⭐⭐⭐ | 7.6KB | `entities/llm-post-training-full-guide.md`

## 核心框架
**SFT教模型"说什么"**，偏好优化教模型"怎么选"，**RL教模型"怎么想"**——三者层层递进，构成完整Post-training体系。

## 训练方法演进
### SFT（监督微调）
教会模型输出的格式和风格，本质是模仿，无法超越训练数据的能力。LoRA/QLoRA只需训练0.1%~1%参数。

### RLHF（三步）
1. SFT冷启动
2. 训练Reward Model（人类偏好排序）
3. PPO优化（四模型：Policy + Reference + Reward + Critic）

### GRPO（DeepSeek 2025）
用相对排序取代Critic模型，减少30%~50%计算开销。**DeepSeek-R1**首次证明纯RL（GRPO + RLVR，不需要SFT）就能涌现推理能力（Aha moment）。

### DPO及变体（Offline）
DPO用分类损失替代RL，但无法从探索中学习。**SimPO**稳定梯度、**ORPO**处理类别不平衡、**KTO**只需Pointwise标签适用于高风险领域。

### DAPO（解决Entropy Collapse）
四大改进：Clip-Higher（放宽正样本上界）、Dynamic Sampling（过滤无区分度prompt）、Overlong Filtering（超长回答不惩罚）、Token-level Loss（按token计算）。

## 完整流水线
```
SFT冷启动 → RL推理训练(GRPO/DAPO+RLVR) → 偏好对齐(DPO/RLHF) → 拒绝采样+蒸馏
```

## 前沿方向
- **Agentic RL**：Search-R1/ReTool，从单轮问答到多轮推理+工具调用
- **Reward Model演进**：PRM（步骤评分）、Generative RM（LLM as judge）、Multi-objective RM
- **Synthetic Data**："生成-验证-训练"循环成为标准范式

## 深度分析
### 从SFT到RL的范式跃迁
SFT本质是模仿学习，模型只能学会训练数据中已经存在的知识和能力，无法涌现新能力。RL则是真正让模型学习"决策"——在给定状态下探索不同动作，根据奖励信号调整策略。这解释了为什么DeepSeek-R1-Zero能通过纯RL涌现出训练数据中并不存在的"Aha moment"自我反思能力。

### GRPO vs PPO：计算效率的实质
GRPO用相对排序替代PPO的Critic模型，节省30%~50%计算开销，但核心价值不在节省资源，而在于打破了PPO的四模型架构对探索空间的限制。当Critic模型拟合价值函数时，它天然会抑制那些Reward Model评分接近的回答，压缩策略熵。GRPO直接用G个样本的相对排序计算Advantage，绕过了价值函数的中间层，允许策略更自由地探索。

### DAPO对Entropy Collapse的针对性修复
熵坍塌是RL训练中策略快速收敛到确定性策略的现象。传统PPO/GRPO的clipping机制只限制负advantage的采样，对正advantage样本的过度利用没有约束。DAPO的Clip-Higher策略专门放宽正样本上界，本质上是鼓励策略在已被证明有效的动作附近保持一定的随机性，而不是迅速收敛到单一最优动作。这是一种有节制的" exploitation with controlled exploration"平衡。

### Agentic RL的核心挑战
从单轮问答到多轮工具调用，Agentic RL面临三个根本性挑战：多轮交互的credit assignment（如何将最终奖励归因到中间每一步动作）、稀疏奖励（不像数学/代码有明确验证器，多数场景缺乏可计算的奖励信号）、推理与工具使用的资源竞争（CoT消耗token预算，影响实际任务完成效率）。这些挑战决定了Agentic RL短期内难以成为主流训练范式，更多是特定垂直场景的定制化方案。

## 实践启示
1. **训练路线选择**：若目标是在数学/代码等可验证领域提升推理能力，优先考虑GRPO+RLVR组合，跳过SFT冷启动；若需要对齐通用对话风格，则保留SFT作为冷启动。
2. **Entropy监控是训练稳定性指标**：在GRPO/DAPO训练中，监控策略熵变化比单纯看Reward分数更能预测训练健康度——熵快速下降通常是熵坍塌的前兆。
3. **小模型蒸馏的工程价值**：DeepSeek-R1证明大模型推理能力可蒸馏到1.5B小规模模型，这对边缘部署场景有重大实际意义。实践中可在阶段四用拒绝采样过滤高质量数据，用更少参数达到接近大模型的效果。
4. **Reward Model设计优先于算法选择**：无论是PPO/GRPO还是DPO，奖励信号质量决定了上限。在可验证领域优先考虑RLVR（可验证奖励），在开放域优先投入Generative RM的建设。
5. **混合训练策略**：实践中Online RL（PPO/GRPO）与Offline DPO通常结合使用——先用DPO建立基础能力，再用Online RL微调提升上限。纯Online训练方差大、不稳定，纯Offline则容易遇到能力天花板。

## 相关概念
- Scaling Laws — 扩展定律与训练效率
- [Agent自我改进六条路](ch04-047-agent-自我改进的六条路.html) — RL训练与Agent对齐
- [百万年薪学习计划](ch03-021-page-021.html) — 学习路线参考

## 相关实体
- [百度文心大模型后训练进化（ERNIE 3.0→5.0）](ch04-519-appo-agentic-procedural-policy-optimization-amap-ml-ag.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-post-training-full-guide.md)

- [Token 退化问题：分词器与后训练数据分布失配](ch01-264-token-退化问题-分词器与后训练数据分布失配.html)
- [Self Taught Rlvr](ch01-640-self-taught-rlvr-综述.html)
- [Llm Rl Algorithms Ppo Dpo Grpo Marl Evolution 2026](ch01-725-2026-llm-rl-ppo-dpo-grpo-rl.html)
- [Slim Cuhk Skill Lifecycle Agentic Rl](ch04-132-ontoz-palantir.html)
- [frontier post-training recipe review with finbarr timbers](ch01-895-google-gemini-embedding-2.html)
- [goodfire predictive data debugging：可解释性指导 post-training 数据塑形](ch01-232-three-years-from-gpt-3-to-gemini-3.html)
- MOC

---
