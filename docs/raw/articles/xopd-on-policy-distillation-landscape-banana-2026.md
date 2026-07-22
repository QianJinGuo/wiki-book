---
source_url: "https://mp.weixin.qq.com/s/hmxau7imqx0eYgtNLh9R2Q"
ingested: 2026-06-23
sha256: bea945577ec4f300
---

# xOPD 全景梳理：16 篇论文拆解 On-Policy Distillation 的六个维度

大模型智能｜分享
来源 | 知乎
作者 | banana

OPD相关的论文这几个月每周冒出好几篇，剧本和当年xPO(DPO之后),xGRPO(GRPO之后)几乎一样，大家围着它做排列组合。本文试图对近期这一波工作进行初步梳理——哪些工作是同一个问题换说法、哪些是动了不同的模块。

## 01 AOPD：把 advantage 切成正负两半分别处理

AOPD[1] 的视角很直白。GRPO的 policy gradient 在不同 advantage 区域 SNR 差别巨大：零 advantage 区域梯度消失，负 advantage 区域是高方差噪声，正 advantage 区域才是真正可信的学习信号。

所以作者按 advantage 符号切两段——正 advantage 保留 policy gradient(exploitation），非正 advantage 换成直接的KL散度最小化(imitation)。实验上strong init+4.09%、weak init+8.34%。

## 02 SOD：在 tool-use agent 上把信号衰减做出来

Hy 这篇 SOD[2] 关心一个非常具体的失效模式——tool-call 场景下，一个 hallucinated tool 调用会让后续轨迹彻底污染，teacher在被污染的状态上给的 supervision全是噪声，vanilla OPD 因为是 token-level uniform 影响会很大。

它的解法是把轨迹按 tool observation切成K+1个step，每个 step算一个散度分数，然后用比值做自适应权重：student越走越偏（divergence上升）时把teacher信号衰减，重新对齐时再恢复。

本质上是给teacher supervision加了一个"信任度门"。

效果上，0.6B 学生在 AIME2025 拿 26%，是首个 sub-1B 做到这个水平的模型，相对 OPD +20.86%。

## 03 ROPD：质疑"OPD 必须是 logit 匹配"

NUS+腾讯的ROPD[3] 在打破 OPD 的一个隐含假设——teacher 信号必须是 logits。

它的做法分两步。对每个prompt，对比 4 条 teacher 回答和 8 条 student 回答，用 LLM 生成 4-12 条带权重的评分项；然后让 LLM 在每条 student rollout 上按这些 rubric 打 0/1，加权得分直接喂 GRPO 当 reward。

整个流程不需要teacher logits，所以GPT-5.2这类纯黑盒 teacher 也能蒸馏。

关键的数字是 AUC——rubric reward 在预测最终 correctness 上 AUC 0.90，teacher logits AUC 只有 0.35（基本随机）。换句话说，当 teacher 给的 logit 信号 AUC 接近随机时，再去优化 reverse KL 是缘木求鱼。

10× 样本效率、6.3× wall-clock 加速。它把 OPD 名字里的 "distillation" 必须是 logit 匹配这件事质疑了。

## 04 Apple Unmasking OPD：揭示很多 token 的梯度本就是噪声

Apple这篇unmasking 工作[4] 回答"OPD 到底什么时候 work、什么时候不 work"。

• 在 student 失败的轨迹上，teacher信号cosine alignment~0.05，显著正向
• 在student已经成功的轨迹上，alignment ≈ 0.001，几乎正交——白白浪费梯度预算
• token级方差极大(std~0.83)，同一条路径里 alignment 在正负之间反复横跳
• 只保留 positive alignment 的 token，能用 52% 的 token 拿到 10-15× 的有效信号

它提出了一个"comprehensibility假设"——梯度信号只有在student能parse 时才有用。0.6B 小模型用self-distillation 比用 32B 外部 teacher 好 2-3×；1.7B 用同家族 8B teacher 又能反超；复杂数学题上 summarized teacher trace 反而坏事，因为小模型读不懂压缩后的论证。

## 05 Uni-OPD：把 token-level 和 trajectory-level 拧到一起

Hy的Uni-OPD[5] 指出 vanilla OPD 的一个隐藏 bug——token 级 reverse KL加起来未必跟最终outcome一致。比如student写了一条错答案但token模式很像teacher高频区，trajectory-level的distillation return反而比对的那条还高。

它的修复是outcome-guided margin calibration：定义轨迹级回报，要求它跟outcome reward序保持一致——如果不满足，对正确轨迹的G加直到margin修复。

外加从student/teacher双视角的数据均衡(offline difficulty+online correctness balancing)。multi-teacher也支持，30B → 4B/30B→1.7B 都有+1.5~+3 pt增益。

本质上是把 OPD 跟 RLVR 桥接起来，让 token 级 KL 不再"自说自话"，而是接受 trajectory 级 outcome 的监督。

## 06 Lightning OPD：把 on-policy 换成 on-distribution

Lightning OPD[6] 的洞察——OPD 真正贵的不是 KL 计算，是 teacher inference。所以他们证明了一个定理：只要 SFT 阶段和 OPD 阶段用同一个 teacher，那么把 teacher 在 SFT rollout 上的logits预先算一次缓存下来，跟在线OPD共享同一个最优解（gradient bias 可控）。

收益是4×算力节省，Qwen3-8B 30 GPU·hr拿AIME24 69.9%。

严格意义上这就不再是 "on-policy"，而是 "on-distribution that the teacher saw"——但工程上极有价值。这个 trick 几乎跟其他所有 xOPD 正交，可以直接叠加到任何方法上。

## 07 OPSDL：长上下文场景下让模型"短的自己"教"长的自己"

百度的 OPSDL[7] 解决的是一个特定场景的问题——模型在长上下文里 rollout 时容易被无关信息干扰，但同一个模型在短上下文里其实是可靠的。所以与其找一个外部长上下文 teacher（贵且未必更好），不如让模型自己来当老师：student 在完整长上下文里 rollout，但抽出真正相关的短上下文片段，让模型在那个短上下文里给自己 supervision。

它本质上是 self-distillation 加上一层 privileged information——privileged 的不是答案、不是更多 context，而是"被精简过的、模型能更好处理"的 context。机制上和 Apple 那篇 comprehensibility 假设互相印证：teacher 信号好不好用，关键看 student 能不能parse；模型自己的短上下文版本是它最能parse的 teacher。

## 08 Self-Distilled Reasoner：把 self-distillation 作为 RLVR 替代品

Self-Distilled Reasoner[8]（UCLA+Meta）是把OPSD(On-Policy Self-Distillation)这个名字正式立起来的工作。它的设定很干净——同一个模型实例化两份策略：teacher看到question加privileged information（已验证的推理轨迹或ground truth），student 只看到，两份策略共享同一份权重。

student 自己 rollout，再让两份策略在 student 的轨迹上各打一次概率，最小化每个位置的散度，梯度只回传给 student 那一侧。

它有两个值得专门记下来的发现。

第一是forward KL在这个设定下反而胜出。前面所有外部 teacher 的 OPD 都用 reverse KL，理由是 mode-seeking——避免小 student 被强迫覆盖大 teacher 那些它根本表达不出来的 mode。Self-Distilled Reasoner 的 ablation 显示在 self-distillation 设定下 forward KL 在 per-token 监督上更稳。

原因也不绕：teacher 和 student 共享同一份权重，capacity gap 这件事根本不存在；teacher conditional 不过是 student conditional 在 PI 加持下被 sharpen 过的版本，它给 student 提起来的每一个 token 都是 student 本来就能表达、只是没注意到该提的。这种情况下你恰恰希望 student 把 mass 铺到每个被 PI 抬起来的 token 上，mode-covering 才是你想要的行为。

第二是per-token KL clipping的必要性。文章发现stylistic token（标点、连接词这种）的per-token divergence显著高于真正承载推理的token，不做clipping就会被这些噪声主导。简单的逐token截断让训练稳定、且能在百步内快速收敛。

效果上，OPSD 在多个数学推理 benchmark 上比 GRPO 拿到 4-8×的token效率，且超过off-policy distillation。

## 09 SDPO：第一篇把自蒸馏接到 RLVR 上

SDPO[9]提出的解法是：让同一个模型同时当student和teacher。teacher 多看到一些 privileged context——具体来说，是学生自己写出来的某条正确 rollout——然后用这个 teacher 在每个 token 位置上的概率作为更可靠的信号，给 student 提供 token 级反馈。

它的核心隐喻是"用完成态反过来教过程态"——既然这条路最终走通了，那么在已知它会走通的条件下反推每一步的概率，就比在不知道结局的情况下硬猜要靠谱。

## 10 SRPO：让教师只在学生犯错时出手

SRPO[9] 在 SDPO 基础上加了 sample routing。teacher 看的还是正确 rollout、loss 还是 logit KL，唯一的改动是：只在错误轨迹（reward = 0）上用 SDPO loss，正确轨迹（reward = 1）退回 vanilla GRPO，再配一个 entropy-aware 的动态权重。

直觉很朴素——学生做错的时候才需要老师指，做对的时候让学生自己跑。

## 11 RLSD：让教师变成更新幅度的调节器

RLSD[10]换了一种完全不同的写法。teacher 的 privileged context不再是某条rollout，而是ground-truth answer——让 teacher 在"知道标准答案"的条件下重新对每条轨迹的每个 token 打概率。

更彻底的是，loss也不用KL了——它直接把师生token概率比当作 advantage 上的 per-token weight。verifiable reward决定update 方向，teacher 只决定 magnitude——每个 token 该被加权多少。

## 12 RLRT：第一次把 update direction 反过来

RLRT[11] 的反转特别值得品。它把 RLSD 的 token 权重分子分母对调，并且只在正确轨迹上 apply，错误轨迹完全退回 vanilla GRPO。

从「在所有轨迹上奖励教师偏好的 token」变成「在成功轨迹上奖励学生偏离教师选的 token」。仅仅这么一个翻转，Qwen3-4B-Base 在6个数学 benchmark 上比 GRPO +18%。

它的论据是information asymmetry。teacher多看了ground truth，会偏向标准解法；如果student在某个关键位置选了一个反常识但走通了的token，teacher 因为多看到了标准解法，根本不会选这个token——它会选课本里的标准做法。

RLRT 重点强化的就是"高位置上为正"的那些 token——critical position 上的 self-driven exploration。

## 13 RLCSD：用对错对比抵消蒸馏信号里的风格漂移

RLCSD[13]（清华，2026.06）跟 RLSD/RLRT 是同一支——都让模型拿自己 group 里的 sibling rollout 当 privileged context，再用师生信号去调 GRPO 的 advantage。但它先抓出了这条线一个一直没被正面命名的病。

它管这个病叫 privilege-induced style drift。OPSD 让teacher看一条正确解再回头给student打分，问题是 teacher 看了答案之后倾向于写得更直接、更短，于是师生那个gap信号的大头压在style token上——"Wait"、"Therefore"、格式符号这类，而不是真正承载推理的数字和算符。

论文给的数字很直观：style token上的信号均值 0.263，task token只有0.083，差了3倍。

它的解法很巧——既然"看了提示就会发生的风格偏移"跟提示对不对无关，那就拿一条错的提示来做对照。把一条incorrect rollout也包成一模一样的"参考解"模板喂给teacher，算一遍gap；再用正确提示算一遍 gap；两者相减。模板逐字节相同，所以两边共享的那部分风格漂移在相减里直接抵消，剩下的才是真正跟任务有关的信号。

效果上，Qwen3的1.7B/4B/8B加Olmo-3-7B，在AMC23/AIME24/AIME25和Knights-and-Knaves上一致超过GRPO和OPSD/SDPO/SRPO/RLSD，逻辑推理的OOD设定提升尤其大。

## 14 SDAR：多轮 agent 场景下，把 OPSD 从主目标降级为门控辅助项

SDAR[14]（浙大+美团+清华，2026.05）切的是又一个具体场景——多轮 agent。它先指出一个观察：把OPSD 直接套到多轮 agent 训练上会塌，原因有两层。

一是multi-turn instability——每一轮的输出会变成下一轮的 context，错误会跨轮复利，导致 teacher 在污染上下文上的 supervision 不稳定。

二是asymmetric trust in privileged guidance——teacher 用的 privileged context 经常是 skill-conditioned，如果检索本身就不完美，teacher给出的"否定信号"就未必可信。

它的解法是把OPSD从主目标降级为门控辅助项。teacher endorse（正向 gap）的 token，门打开，蒸馏信号被加强；teacher reject（负向 gap）的 token，门关小，软性衰减。

在ALFWorld、WebShop、Search-QA三个agent benchmark上比GRPO +7~+10pt。

## 15 Many Faces of OPD：把"OPSD 何时 work、何时塌"问到底

UIUC+人大+北大这篇[15]（2026.05）做的是一件 self-distillation 这条线长期缺的事——把"OPSD 什么时候 work、什么时候不 work"系统地拆开来回答。

它的核心论断是 OPSD 的 student 在数学上学到的不是任何一个具体的 PI-conditioned teacher，而是所有 PI 上的边际聚合策略。

当 PI 是 shared-rule（系统提示词、风格指令、对齐偏好这种"对一类问题都成立的潜在规则"），聚合恰好就是你想让 student 内化的那条规则。OPSD 在 CharacterBench、EmotionBench、system prompt 内化这类任务上显著超过 GRPO 和 PPO。

当 PI 是 instance-specific（具体某道题的 ground truth、某份特定文档），聚合等于把各题各异的解题路径硬拍成一个糊。OPSD 在 Math500/AIME24/AIME25 上全线失败。

最有意思的失败模式是：student 在 inference 时会幻觉性地说出"如参考答案上所言"——它学到的不是解题能力，而是"有 GT 在条件里"这件事的统计痕迹。

## 16 TrOPD：给 reverse-KL 估计量画一个信任区域

TrOPD[16] 针对的是 vanilla OPD 一个很底层的工程兼数值问题。为了省显存，长推理任务上的 reverse KL 一般不算全词表，而是用 K1 这个无偏估计量。但当师生分布差很远时，student 采出来的 token 在 teacher 那里概率极低，policy gradient会冲向∞——巨大的梯度 outlier 直接把训练搞崩。

它的解法是借了 speculative decoding 的思路定义一个信任区域。teacher 认可的 token 完全信任、照常走 reverse KL；teacher 不认可的 token 落到 outlier 区，按概率被划出去。对 outlier 区它没有简单丢弃，而是换成 forward KL——从teacher的 top-k 视角反过来给监督。

## 17 异同：差异点其实就几条

把上面这些工作横向铺开看，差异点可以提炼成几个问题——每篇论文的设计都是在回答这几个问题里的某几个。

关于 loss 怎么写——是 reverse KL（vanilla/SDPO/SRPO），是token概率比当 advantage weight（RLSD/RLRT），是按 advantage 符号切两段 RL/KL（AOPD），是按信任区域在 reverse-KL 和forward-KL之间切换（TrOPD），是rubric reward喂GRPO（ROPD），是把outcome reward拿来约束 trajectory-level KL 序（Uni-OPD），还是把 OPSD 整体降级成 sigmoid 门控辅助项（SDAR）。

关于教师信号怎么来——是 white-box logits（vanilla 大多数），是black-box rubric/verbal（ROPD），是 self-distill privileged context（SDPO/RLSD/RLRT/SDAR），是同一条query下正确与错误sibling rollout 的对比（RLCSD），还是模型自己的不同 mode（OPSDL）。

关于哪些 token 或 sample 该被加权——是均匀（vanilla），是按 advantage 符号（AOPD），是按step divergence（SOD），是按师生概率比划信任区域、把outlier单独处理（TrOPD），是按teacher endorse/reject 极性（SDAR），是用对错对比抵消风格漂移、把信号集中到 task token（RLCSD），是只在 r=0（SRPO），是只在 r=1（RLRT），还是按 teacher-student alignment 的 cosine 过滤（Apple）。

关于教师拉学生的方向——绝大多数工作都是把student往 teacher 拉，RLRT 第一个反过来；Apple 用诊断告诉我们其实有些token上根本不该拉，因为信号本身是负价值的；TrOPD则提醒了第三种情况——有些 token 不是不该拉，而是 reverse-KL 这个估计量在那里数值上就会爆，得换个方向（forward KL）去拉。

关于算力/数据效率——是在线sampling（默认），是 offline cache（Lightning），还是self-distill不需要外部teacher（OPSDL/RLVR 自蒸馏整条线）。

关于PI的结构——self-distillation这一支还多一根隐藏轴：你喂给 teacher的privileged information是shared-rule，还是instance-specific。Many Faces of OPD给出的实验结论是这两种PI 在 OPSD下命运截然不同。

## 18 一些思考

从这一波工作中能看出一条隐藏的演化主线。

vanilla OPD 默认教师全程上手把手——Apple 的诊断说很多时候它在帮倒忙——SOD 说它该有信任度门——TrOPD 说它的话甚至有时在数值上根本没法听——ROPD 说它的 logit 信号 AUC 还不到 0.5——Lightning 说它根本不用全程在场——SRPO 说它在学生做对的时候该闭嘴——RLCSD 说它给的信号里混了一层风格腔调——SDAR 说它的拒绝信号本身就未必可信——RLRT 说成功时它该退场到只剩"标记哪些 token 是学生自己做的"这一鉴别功能。

到 RLRT 这里，"教师"这个词已经几乎是反讽了——它只负责告诉学生"什么不是你的"，而 reward 负责告诉学生"什么是对的"，两个信号一拼，学生独有的探索能力被精准放大。

这一波 xOPD 表面上是各种 loss 变种竞赛，底下那条主线其实是——我们正在学习"教师"这个概念在 student 学习过程里到底该出现在哪些位置、以什么强度、起什么作用。

当 PI 是 shared-rule 时，"在更好信息下的自己"就是那条规律的化身，蒸馏即内化；当 PI 是 instance-specific 时，"在更好信息下的自己"是个永远到达不了的状态，蒸馏即幻觉。

OPD 会是终局吗？我的判断是不会，但它揭示的视角会是终局的一部分。OPD 真正的贡献不在"反向 KL + 学生采样"这个特定的 loss 形式，而在它揭示了一个更底层的认识——post-training 的 teacher signal 不应该是静态的，它应该跟着 student 当前的状态、能力、置信度、对错动态调整。

## 19 Reading List

| Paper | 链接 | 必读? |
|-------|------|-------|
| Thinking Machines OPD blog | thinkingmachines.ai/blog/on-policy-distillation | ⭐⭐⭐ 入门 |
| A Survey of OPD for LLMs | arXiv 2604.00626 | ⭐⭐⭐ 全景 |
| Apple Unmasking OPD | arXiv 2605.10889 | ⭐⭐⭐⭐ 诊断 |
| Many Faces of OPD | arXiv 2605.11182 | ⭐⭐⭐⭐ OPSD 何时 work |
| RLRT (Rebellious Student) | arXiv 2605.10781 | ⭐⭐⭐ 教师角色翻转 |
| RLCSD | arXiv 2606.11709 | ⭐⭐⭐ 对比抵消风格漂移 |
| Self-Distilled Reasoner | arXiv 2601.18734 | ⭐⭐⭐ OPSD 源头工作 |
| SDAR | arXiv 2605.15155 | ⭐⭐⭐ 多轮 agent 自蒸馏 |
| TrOPD | arXiv 2606.01249 | ⭐⭐⭐ 信任区域 + outlier |
| SOD | arXiv 2605.07725 | ⭐⭐⭐ tool-use Agent |
| ROPD | arXiv 2605.07396 | ⭐⭐⭐ 信号源解放 |
| Lightning OPD | arXiv 2604.13010 | ⭐⭐⭐ offline 缓存 |
| Uni-OPD | arXiv 2605.03677 | ⭐⭐ dual-perspective |
| AOPD | arXiv 2605.06387 | ⭐⭐ 非对称 |
| OPSDL | arXiv 2604.17535 | ⭐⭐ 长上下文自蒸馏 |
| SDPO / SRPO / RLSD | arXiv 2601.20802 / 2604.02288 / 2604.03128 | ⭐⭐ RLVR 自蒸馏支线 |
| SFT, RL, and OPD (nrehiew blog) | http://nrehiew.github.io/blog/sft_rl_opd | ⭐⭐ on-policy vs teacher 能力 |

引用链接

[1] AOPD: https://arxiv.org/abs/2605.06387
[2] SOD: https://arxiv.org/abs/2605.07725
[3] ROPD: https://arxiv.org/abs/2605.07396
[4] unmasking 工作: https://arxiv.org/abs/2605.10889
[5] Uni-OPD: https://arxiv.org/abs/2605.03677
[6] Lightning OPD: https://arxiv.org/abs/2604.13010
[7] OPSDL: https://arxiv.org/abs/2604.17535
[8] Self-Distilled Reasoner: https://arxiv.org/abs/2601.18734
[9] SDPO: https://arxiv.org/abs/2601.20802
[10] RLSD: https://arxiv.org/abs/2604.02288
[11] RLRT: https://arxiv.org/abs/2604.03128
[12] nrehiew 那篇 blog: http://nrehiew.github.io/blog/sft_rl_opd/
[13] RLCSD: https://arxiv.org/abs/2606.11709
[14] SDAR: https://arxiv.org/abs/2605.15155
[15] Many Faces of On-Policy Distillation: https://arxiv.org/abs/2605.11182
[16] TrOPD: https://arxiv.org/abs/2606.01249
