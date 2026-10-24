# Frontier post-training recipe review with Finbarr Timbers

> 📊 Level ⭐⭐⭐ | 11.0KB

→ [原文存档](https://www.interconnects.ai/p/frontier-post-training-recipe-review)

## 核心要点

1. **AI2 post-training framework (RLHF + SFT 配方)** — Finbarr Timbers 公开了 Ai2 的 post-training recipe，强调 SFT（supervised fine-tuning）与 RLHF 的协同配方，包含 reward model 的训练数据构成与对齐策略。
2. **Frontier 模型 post-training 的工程权衡** — 在 RLHF 的 PPO 阶段，KL 散度约束与 reward shaping 的工程取舍；RLHF 在 chain-of-thought、math、code 等 capability 上的差异化效果。
3. **Open-weight 模型的 post-training 局限性** — 为什么 open-weight 模型如 OLMo 在 post-training 后仍落后 frontier（GPT-4、Claude 3.5）模型，关键在 data quality + iteration speed。
4. **RLHF vs DPO vs RLAIF** — Timbers 比较 RLHF、DPO（Direct Preference Optimization）、RLAIF（RL from AI Feedback）的 trade-off，特别是 DPO 在中小规模模型上的替代价值。
5. **数据混合与 curriculum learning** — post-training 数据的 mix ratio（SFT data / preference data / instruction data）对最终 alignment 质量的影响，curriculum learning 在 post-training 中的实际应用。

## 与现有实体的差异化

- **[Olmo Hybrid](https://github.com/QianJinGuo/wiki-public/blob/main/entities/olmo-hybrid-and-future-llm-architectures.md)**：Olmo Hybrid 重点在 architecture（hybrid GDN + attention），本文重点在 post-training recipe 维度。
- **OLMO 系列**：Open-weight 模型的架构/训练，但 post-training 工程视角更稀缺，本文填补该角度。

## 深度分析

### 阶段拆解：每一段在买什么信号

这场对话比一般配方史多走的一步，是把演化读成「信号类型」的替换，而不是模型名单的更迭。InstructGPT 的三段式里，SFT 买示范、reward model 买人类偏好、PPO 买在线优化；Tülu 3 把 DPO 与 [RLVR](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/rlvr-reinforcement-learning-verified-reasoning.md) 并列，可验证的对错第一次进入主链路；到 2026 年，整合本身变成了独立阶段——student 采样自己的轨迹，按领域路由给对应 teacher，逐 token 做 reverse-KL 对齐。

最实质的语义漂移发生在 SFT 上：它从「一般有用的一阶段」退化为「给 RL 提供冷启动」。Timbers 指出这是 R1 之后的分水岭，同期 DPO 从领先配方中基本消失，偏好信号被折进 reward model 或 RL 的 reward 项。 Lambert 给了这个现象一个可检验的解释：OLMo 的 SFT 数据大量来自 Qwen/DeepSeek 的输出，与 base 的分布差得远，DPO 恰好能补上这道缝；而当 SFT 数据来自自家 on-policy rollout 时缝变小，DPO 的边际收益随之消失。 这比「DPO 过时了」强得多——它预测的是 DPO 的价值随 SFT 数据来源而变，而不是随年份而变。也因此，把这条论证接到 [预训练与 SFT 的分工](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/llm-pretraining-vs-sft.md)、[PPO/DPO/GRPO 演进](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/llm-rl-algorithms-ppo-dpo-grpo-marl-evolution-2026.md) 这类按算法分类的框架上时，需要额外一层「数据来源」的坐标，否则会读错。

### 被高估的整合手段，与被低估的偏好损失

Timbers 对当下的 MOPD 热潮下了一个不客气的判据：不少配方变迁是 fashion 驱动的，而不是 rigorous ablation 的结果。他的反例是 Nemotron-3 Super——在一个「传统 RLHF stage 已经不时髦」的语境里照跑它，并且报告了相当大的增益。

MOPD 自身的公开证据反而是残缺的。Nemotron-3 Ultra 自己写了：训练 pipeline 差异很大的 teacher 无法靠朴素的 on-policy distillation 合并，因为 teacher 与 student 用不同 SFT 数据训练时会形成不同的 reasoning 行为与输出分布，student 的轨迹对 teacher 而言是 OOD，监督信号的质量与可靠性随之下降。 更根本的是一个空白：trace-distillation SFT 与 [on-policy distillation](https://github.com/QianJinGuo/wiki-public/blob/main/entities/on-policy-distillation-vs-offline-distillation-loster.md) 的相对增益，至今没人量过，Timbers 是把它当作 open question 提出来的。 同时 MAI-Thinking-1、Kimi K2.5、GLM-5 都在不用 MOPD 的情况下交付了有竞争力的模型——这至少说明它不是前沿的必要条件，只是当下最流行的一种整合解。

被低估的那一侧是偏好信号本身。Lambert 的观察是：一个相当颗粒度的 contrastive loss，居然能把数学、代码、推理策略一起带动，这一点在他看来相当反直觉；他的推论是 preference-based loss 配上可验证输出（例如 DPO on verifiable rewards）仍有未被开采的空间，只是智识上不够性感，所以做的人少。 顺着这条线，Timbers 举了一个更少被讨论的信号源：用同家族更大/更小的模型、或训练早期/晚期的 checkpoint 互相比对来合成 preference pairs（OLMo-3 的 delta learning 路线），并类比 diffusion 的 classifier-free guidance——那里已经证明「训练更靠后的模型 vs 更靠前的模型」是一个可引导的强信号。他推测这类自造偏好可能更 robust，只是最大的几家 lab 不需要这么做，所以引用得少。

### 这套配方的规模依赖性

Lambert 对「把 frontier 配方搬回小模型」给了一个明确否定：OLMo 是 7–30B，在这个尺度上照搬 DeepSeek 式 RL-first 未必有用。 OLMo-3 的实际选择是把 reasoning 移植进既有的三阶段配方——更快、更稳，但天花板更低，因为它没有重建 R1 那条链路。

更深的一层是：配方的复杂度上限由组织并行度决定。Lambert 反复说 post-training 的一大半工作是「把算力和数据拧成一条 workstream」，也就是在编排 org chart；Tülu 3 的三段式之所以简单，直接原因是 AI2 无法按 Llama 3 的规模扩张团队。 MOPD 在 2026 年流行的组织解释也在此：单领域的 SFT-then-RL 是被充分理解、可并行的，训练 N 个 specialist 比跑一个混合了 math/code/agentic 的巨型 RL 更好分派，也更容易在多个团队间切开。

由此对小团队的真实建议不是「抄配方」，而是「抄顺序」：先在单一领域把 SFT→RL 跑通、拿到一个 strong specialist，再谈整合；并且一次只改一个变量。Timbers 用 MAI 的「conservative recipe + 执行到位」佐证后者——同时改太多，配方很容易在自己的复杂度下崩塌，他在职业生涯中见过多次。

### 怎么知道一个阶段值回了它的成本

对话里最接近「证据」的东西，是 Nemotron Ultra 论文里那张 recovery 表：它同时给出 teacher 的分数、RLVR student 的起点、以及 OPD 之后的落点，于是「OPD 吃掉了 teacher 多少差距」第一次可以被读出来。但连 Lambert 都承认这张表和配套文字写得难以解析，他读了很久仍在追问 on-policy distillation 的起点到底是哪个 checkpoint。 这本身是个方法论提示：如果一份技术报告不能让人从外部重建 recovery rate，它实际上没有交出可复用的证据。

可用的评估纪律因此退化成三条：看有没有起点-终点对照（而不是只报终局分数）；看 ablation 是否只动一个变量；看论文有没有写失败模式。Nemotron 把 teacher pipeline 不匹配这个失败写了出来，属于罕见的诚实，也正因为写了，外部才知道 cross-teacher alignment 会演变成组织难题。

最后一类是 folklore 检测：GLM-5 与 Kimi K2.5 都用了 temperature schedule，却主张完全相反的方向——一个说要从高温降到低温，一个说要从低温升到高温；两边都能 work，说明这类超参目前是经验而非机制。同样，difficulty curriculum / difficulty filtering 只在 GLM-5 里被认真讨论（可对照 [GLM-5.3 post-training 技术博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/glm-53-post-training-technical-blog-zhipu-xhs-2026.md)），NVIDIA 与 MAI 的报告几乎不提。 读配方时该问的不是「他们设了什么值」，而是「这个值有没有被单独消融过」——这也是把这篇访谈和 [DeepSeek V4 训练方法](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepseek-v4-training-methodology.md) 一类工程复盘并读时，唯一能穿透的读法。

## 实践启示

- Frontier 模型 post-training 仍是 closed 关键护城河，open-weight 模型追赶困难。
- DPO 在中小规模（≤13B）模型上替代 RLHF 的可行性上升，工程门槛更低。
- SFT → preference tuning 的两阶段 post-training 范式仍是主流，但 RLHF 的 reward model 训练数据质量是关键。
- post-training 的 iteration speed 是 frontier labs 的核心能力（闭环从 data collection → training → eval）。

→ [原文存档](https://www.interconnects.ai/p/frontier-post-training-recipe-review)

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/reinforcement-learning-rlhf.md)

---

