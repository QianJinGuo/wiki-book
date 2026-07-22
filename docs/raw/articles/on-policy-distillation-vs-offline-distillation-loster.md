---
title: "对比离线蒸馏！为什么选择OPD？"
author: Loster（知乎）
date: 2026-05-19
source_url: https://mp.weixin.qq.com/s/JljnDWerzMzlUl0BMblKXg
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
source: https://mp.weixin.qq.com/s/JljnDWerzMzlUl0BMblKXg
ingested: 2026-05-19
sha256: b5fc034fe8efed1d15d1e70ebc3db5793a031cf1b0638aef64b3319d14878a19
---
---
# 对比离线蒸馏！为什么选择OPD？
（正文约8000字，来源：知乎 Losster，大模型智能公众号，2026-05-19，LLM对齐与后训练领域技术深度分析）
## 核心定义
### 离线蒸馏（Off-Policy Distillation / SFT）
让大模型（Teacher）生成一批固定数据，小模型（Student）通过监督微调（SFT）去模仿。
### 在线蒸馏（On-Policy Distillation, OPD）
小模型自己生成回答（采样自身轨迹），然后由大模型对这些"小模型自己写出来的内容"进行逐词（Token-level）打分或提供 Logits 指导。
## 为什么是"现在"——5个决定性原因
### 1. 解决暴露偏差与复合误差（Exposure Bias & Compounding Error）
**传统SFT痛点**：像"让新手看国际象棋特级大师的对局录像"。新手看到精妙走法，但这些走法发生在大帅的棋局状态中。小模型一旦某一步偏离大师轨迹，就会进入训练从未见过的状态——一步错步步错，最终幻觉或胡言乱语。
**OPD优势**：让小模型自己在棋盘上走，老师在旁边对每一步打分。小模型不仅学到正确走法，更学会了在犯错后如何纠正自己（Recover from mistakes）。
### 2. 完美结合强化学习"探索"与蒸馏"稠密奖励"
**传统RL缺陷**：只在模型生成完整段落后给一个标量奖励（答对+1，答错-1），稀疏奖励导致训练方差极大，极难收敛。
**OPD优势**：Teacher给出Token级别、极其稠密的反馈（每个词的概率分布或对错评分）。既保留RL针对当前策略优化的优势，又极大降低算力成本，提升收敛稳定性。
### 3. 解决复杂推理中的"能力错位"
离线蒸馏强迫小模型去走它"走不通"的路（GPT-4能用的复杂逻辑链路，7B/8B小模型没有足够参数容量硬背），导致学成四不像。
OPD允许小模型用自己当前的智力水平去探索解法，只要最终能推导正确答案，Teacher就顺着小模型思路给予正向强化。
### 4. 克服KL散度的"模式平均"问题
**Forward KL（离线蒸馏/SFT）**：Mode-Covering——强迫小模型覆盖Teacher所有可能性，最终学到"平均值"（毫无意义的废话）。
**Reverse KL（OPD）**：Mode-Seeking——小模型只需找到能被Teacher认可的一种解法，精通一种答法即可，大幅提升生成质量。
### 5. 基础设施和生态的突破
**跨分词器对齐（Cross-Tokenizer Distillation）**：GOLD、ULD等技术通过词表投影和序列对齐，实现跨模型家族在线蒸馏（如用Qwen教Llama）。
**异步训练框架成熟**：verl（One-Step/Two-Step异步调度器）+ DeepSpeed + vLLM打通，异步并行让算力不再成为瓶颈。
## 数学原理：Forward KL vs Reverse KL
### Forward KL（SFT的本质）
**目标**：最大化似然估计（MLE），等价于最小化Forward KL
**Forward KL公式**：
D_KL(P_T || P_θ) = Σ P_T(x) · log[P_T(x)/P_θ(x)]
**Mode-Covering特性**：当P_T(x)>0但P_θ(x)→0时，KL散度爆炸。小模型必须尽力拉宽概率分布覆盖Teacher所有高概率区域，容量有限的小模型会学到几个模式中间的"空白区域"，产生幻觉。
**通俗理解**：即使你不懂，也要把老师的所有思路都背下来。
### Reverse KL（OPD的本质）
**目标**：最小化Reverse KL，等价于带熵正则化的强化学习目标
**Reverse KL公式**：
D_KL(P_θ || P_T) = Σ P_θ(x) · log[P_θ(x)/P_T(x)]
**Reward解释**：第2项E[log P_T(x)]代表学生采样句子在Teacher看来"有多好"=奖励函数
**Entropy解释**：第1项-E[P_θ]代表学生策略的熵，鼓励保持多样性防止Mode Collapse
**Mode-Seeking特性**：只要找到Teacher中某一个高概率区域并驻留，KL散度就很小。容量友好+解决暴露偏差。
**通俗理解**：用你自己的思路解题，只要老师觉得对就行。
## OPD vs RL的优势
### 1. 信号密度（Dense vs Sparse）
**传统RL**：500步推理最后答案错了只能给Reward=0，信用分配问题极难。
**OPD**：Step-level Reward + Logits输出软标签（"你选A概率10%，选B概率80%"），提供极其密集的梯度信息。
### 2. 成本与扩展性
**RLHF**：人类标注慢、成本高，面对复杂数学证明或长代码人类也无法准确打分。
**OPD**：用GPT-4/DeepSeek-R1等超强Teacher替代人类，24小时不间断为百万条轨迹打分，千万级数据强化学习成为可能。
### 3. 遇制奖励黑客（Reward Hacking）
**纯RL**：模型会寻找规则漏洞（如插入不可见特殊字符骗过评测机）。
**OPD**：Teacher不仅看结果，还评价过程逻辑连贯性、语言格式，能有效遏制学生通过"走捷径"骗分。
### 4. 优化空间平滑性
**纯RL**：在未知环境中盲目试错，方差极大，模型容易早期崩溃。
**OPD**：有教师策略存在，学生表现极差时教师也能提供明确引导方向。
## 核心对比表
| 维度 | SFT（离线蒸馏） | OPD（在线蒸馏） |
|------|----------------|-----------------|
| KL方向 | Forward KL: D_KL(P_T\|\|P_θ) | Reverse KL: D_KL(P_θ\|\|P_T) |
| 采样来源 | 从教师（数据集）采样 | 从学生（当前策略）采样 |
| 数学目标 | 最小化交叉熵（MLE） | 最大化期望奖励+熵正则化 |
| 分布特性 | Mode-Covering（覆盖多峰） | Mode-Seeking（寻求单峰） |
| 通俗理解 | 不懂也要背老师所有思路 | 用自己思路解题，老师认可即可 |
| 典型问题 | 暴露偏差、能力鸿沟、幻觉 | Mode Collapse（需加熵惩罚） |
## 关键洞见
在线蒸馏让小模型能够"在实践中学习，在自己的错误中成长"，不仅解决了长文本崩溃问题，还在远低于纯强化学习成本的前提下，逼近前沿模型性能表现。