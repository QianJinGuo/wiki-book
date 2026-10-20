# HybridAgent：潜空间思考 + 文本行动的统一 Agent

> 📊 Level ⭐ | 12.5KB

## 核心命题：让同一个模型在一次生成中自主切换"想"与"说/做"

Stanford、UIUC、Together AI、Meta 的工作要填的是一道老鸿沟：**agentic 交互必须用文本，但逐 token 文本推理又慢又贵；latent reasoning 高效却调不了工具、也难被审计**。HybridAgent 的定位不是折中而是**分工**——"think beyond text while still acting through it"：同一次生成里，模型在潜空间做循环、快速、可检查的内心思考，再用文本发 tool call、收 observation，模式切换由模型自己决定。结果：11 个 benchmark 上 14B 版本平均超越最强 agentic baseline **17.4%**，文本 token 少 **35.5%–54.7%**、推理快 **1.8×–2.6×**、成本降 **2.7×–3.7×**，且 latent 思考可被翻译成人类可读伪文本供审计。

## 两条路线各自的死结

- **纯文本 Agent**：每个中间想法都要付出解码成本（长链条 token 开销巨大），且连续高维内部表征被强行压成离散文字造成信息损失。
- **Latent reasoning（Coconut、SoftThinking 等）**：①连续 latent 向量无法写成 tool call 文本发给环境，多轮 agentic 交互无从谈起；②latent 缺乏可读语义，训练难监督、推理难审计调试。实验侧的旁证很直接：纯 latent 方法在 agentic 任务上几乎不可用（个位数）。

## 架构四件套

**HybridLink（表征翻译器）**：已有 latent 方法把最后一层 hidden state 直接当下一步输入，在混合生成中会因**hidden state 与输入 embedding 空间的表征失配**而崩。HybridLink 用"线性投影 + 激活 + **残差**"把 hidden state 映射回输入 embedding 空间：残差原样保留 h_t 已编码的语义，可学习投影只对齐分布差异——因此极轻，**4B 模型仅约 10M 参数**。

**锚点 token 切换模式**：生成 `<latent>` 后下一步前向改用 HybridLink 替代 LM head 与 embedding 层进入连续推理；每个 latent step 检查当前向量与哪个 token embedding 最近，**最近邻是 `</latent>` 时退出**。文本段与 latent 段的长度、频率**完全由模型动态决定，无预设结构**。

**顺带的可解释性**：退出条件本身就是解释器——把每个 latent step 映射到最近 token embedding 得到"伪文本"。探针显示模型越大、训练越完整，latent span 越落在"既可读又紧扣当前问题"的区域。

**KV 即工作记忆**：混合轨迹夹着 latent 向量、无法 tokenize 回 context，HybridAgent 直接把累积 KV cache 当连续工作记忆跨轮复用——文本、latent、工具观测进同一输入空间，第 1 轮后记忆保留完整混合上下文，后续轮继续追加 KV 而**无需文本重构**；附录证明缓存前向与完整前缀前向**逐位等价**（Lossless Multi-Turn Working Memory，位置归纳 + 因果注意力）。

## 训练：SFT 稳生成、RL 定"何时想"

**数据管线（54K 混合轨迹，零人工标注）**：Step Segmentation 切原子推理步并记字符偏移 → Mode Assignment 用外部 LLM 专家判断每步归文本还是 latent，并用目标模型自身的 **token 级预测熵**做互补信号（**低熵=有把握 → latent，高熵 → 文本**）→ Visibility Audit 由独立 LLM critic 检查"遮住 latent 段后剩余文本是否足以理解决策"，不足则恢复为文本 → 合并相邻 latent 步、插锚点，并校验**去掉锚点可逐字节还原原轨迹**。设计哲学：模型已会做的搬进 latent 快跑，关键且需审计的留在文本。

**HybridSFT 两阶段**：①格式与 HybridLink 激活——先文本 SFT 让 backbone 学会在合适时机吐锚点，再冻结 backbone 训练 HybridLink 对齐方向与模长；②**自我条件化（Self-Conditioned）**——只做激活会留下 latent 特有的**曝光偏差**：激活阶段 latent 位置吃的是 ground-truth embedding（HybridLink 输出只算 loss、不回喂），推理时却吃自己的输出，未经量化的连续向量让任何小偏差都成为"训练时没见过的输入"并沿几十到几百步 **复利式放大**。解法是两遍前向：第一遍 teacher-force 得到"模型自己预测的下一步 latent 输入"，第二遍用预测值替换后联合训练（文本位置 CE、latent 位置回归）——**backbone 学会读自己的 latent 输出，HybridLink 学会写 backbone 能读的输入**，训练—推理鸿沟被闭合（本质是把 scheduled sampling 搬到连续空间）。

**HybridRL 的两个补丁**：PPO/GRPO 需要每个位置的 token 级似然，而 latent 位置是确定性连续向量、没有采样概率。①**混合策略分解**：latent 转移由固定 HybridLink 确定性产生（概率 1）、工具观测来自环境，真正的采样只发生在文本位置 → 混合轨迹的似然只分解在采样文本位置上，**只在文本 token 上做似然比更新就足以优化完整轨迹**；②**精确 Rollout 回放**：记录每步 latent 输入/文本/观测，更新时固定 latent 输入、用一次可微前向回放整条轨迹重算文本位置似然，附录**梯度等价定理**保证回放点处逐 token clip 目标梯度恰等于完整轨迹的 advantage 加权似然梯度。奖励只有三项（正确性、格式惩罚、多工具使用），**没有任何模式使用奖励**——何时进 latent、进多久交给 RL 自己发现。

## 实验：11 个 benchmark、三个规模

**agentic 主结果**：HybridAgent (14B) GAIA **52.4** / WebWalker **49.5** / HLE **16.0** / SealQA **24.3–37.8** / DSQA **21.7–46.8**，对比 ARPO (14B) 43.7 / 40.5 / 10.0 / 17.1–22.8 / 16.3–38.2；8B 版 43.7 / 42.5 / 14.4 / 22.5–35.8 / 20.0–40.7。三个要点：相对最强 agentic baseline 平均 **+17.4%**；**14B 在 GAIA/WebWalker/SealQA 上反超所有前沿大模型 Agent**（含 GPT-5.6-Luna、Kimi-K3）；纯 latent 方法几乎不可用。**数学与知识（14B）**：43.3 / 45.8 / 88.2 / 55.1 / 81.7 / 34.5（AIME25/AIME26/MATH500/GPQA-D/MedQA/MuSiQue），HybridSFT 较文本/latent baseline 平均 +18.5%、HybridRL 再 +10.4%；4B 上仍平均超 ARPO 2.0pp。**测试时扩展**：pass@k（k=4…64）所有规模稳定上升且比纯文本更受益于采样预算。

**效率与成本**：文本 token 约 **1/2.7**、总生成步数最多 -54%、墙钟 **2.1×**；每百万题成本 4B 359→**98 美元（3.7×）**、8B 439→**121（3.6×）**、14B 470→**176（2.7×）**——**latent step 仍按一次完整前向计费，没有把 latent 当免费**。

## 机制解剖：两个模式各司其职的证据

- **自我条件化消融（14B）**：Base 4.9/3.0/47.0 → +格式激活 20.6/19.8/62.4 → +HybridLink 激活 23.8/22.5/73.8 → **+自我条件化 32.5/31.7/84.2**（AIME25/26、MATH500）；仅激活远不够，自我条件化再提 **30.5%**，并把伪文本从"不可读的 embedding 几何伪影"变成清晰连贯文本。
- **RL 训练动态**：随训练推进生成份额从文本转向 latent，奖励与工具调用同步增强——**自发学会"内部多思考、外部少说话"**；奖励消融显示三项互补（去掉正确性 -6.4%~-17.8%、格式 -4.7%~-6.9%、工具奖励主要作用于 agentic：GAIA -11.2%、WebWalker -3.5%，MATH500 几乎无影响）。
- **latent 因果干预（MATH500）**：无干预 84.6/88.2；**语义替换（跨问题 44.8/48.6、随机 token 41.2/44.6）造成 44.9%–51.3% 的毁灭性下降，且比幅度更大的高斯噪声（72.6/66.4）伤得更重**——性能依赖 latent 的**语义内容**而非几何幅度；块内乱序 73.2/76.4、单步截断 72.2/75.0 各掉 13.4%–15.0%，说明**顺序与推理深度**被功能性利用；最近 token 替换 **82.6/87.2** 几乎无损，与"latent 天然贴近词表 embedding"互证。
- **HybridLink 结构消融（14B）**：Identity 71.4/73.7/24.5 → 1 层 83.6/79.7/28.5 → 1 层+残差 86.4/80.3/31.0 → 2 层 85.8/81.0/31.5 → **2 层+残差 88.2/81.7/34.5**；残差在两种深度都带来平均 **4.3%** 提升（"残差保语义、投影管对齐"）。
- **文本接口未被削弱**：有效工具调用率更高、执行成功率与文本 Agent 持平（**99.7%**）、调工具题目准确率高 2.2%–44.1%、有用调用率高 4.5%–7.7%。
- **可审计性（560 题，观察者只见文本步/工具调用/输出）**：文本 token 302 vs 596、284 vs 497，latent 步 170/183；但**每百 token 关键推理步 0.72 vs 0.57、0.86 vs 0.67（+26%–28%）**；弱监视器 AUROC 0.840 vs 0.772、0.860 vs 0.818，强监视器 0.961 vs 0.935、0.989 vs 0.990；首个错误定位 99.2 vs 94.2、98.1 vs 100.0；修复率增益 **+9.1 vs +3.4**、**+5.4 vs +3.5**；答案泄漏率 <1%。**暴露文本少 43%–49% 而关键步密度反增**——把一半以上计算搬进 latent 没让 Agent 变得"不可管"。

## 三条理论保证与边界

①无损多轮工作记忆（缓存前向 ≡ 完整前缀前向，逐位等价）；②混合策略分解（似然只落在采样文本位置，重要性比率良定义）；③梯度等价（回放点逐 token clip 梯度 = 完整轨迹 advantage 加权似然梯度）。三者把"混合轨迹上做 RL"从工程 hack 变成有理论依据的算法。**边界**：latent 只能经提供方持有的 HybridLink 读出，**天然形成一种专有推理保护机制**（无文本可泄漏，且提供方可在用户看不到的部分做安全监控）——对前沿模型 API 部署有启发；未来可围绕"latent 工作记忆是一等公民"构建新型 harness（直接对 KV 做上下文管理、按模式调度工作流、Agent 间用混合轨迹通信），并用 latent 可审计性做步级信用分配与坏轨迹剪枝；当前仅在 Qwen3-Base（≤14B）验证。

## 与相关实体的关系

- 与 [CoLT 潜空间思维链](https://github.com/QianJinGuo/wiki-public/blob/main/entities/colt-eccv-2026-latent-thought-chain-multimodal-reasoning.md)、[LIFT 隐空间信息反馈](https://github.com/QianJinGuo/wiki-public/blob/main/entities/lift-latent-information-feedback-transformer-arxiv-2026.md)、[全带宽隐空间反馈](https://github.com/QianJinGuo/wiki-public/blob/main/entities/full-bandwidth-transformer-latent-feedback-arxiv-2608-08888.md) 同属"把推理搬进连续空间"，但那三者解决的是**单轮推理/表征反馈**，HybridAgent 解决的是**多轮 agentic 交互中 latent 与工具调用的共存**（含 RL 可训练性、KV 工作记忆与审计）。
- 与 [ReHarness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/reharness-recurrent-harness-backward-revision-2026-10-13.md) 同源信源（AGI研习社技术报告级解读档）与同一"长程能力"主题，但 ReHarness 改的是记忆修订，本文改的是**推理媒介**。
- 与 [Agent Harness 演化论](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-evolution-from-llm-call-to-harness-tencent-2026.md) 的运行时视角互补：本文给出"KV 作为一等工作记忆"的 harness 新方向，以及"模型自主决定何时进入内部思考"的模式调度范式。
- 效率/成本口径（按 H100 小时与峰值利用率折算每百万题成本、且 latent step 照计一次前向）与 [AI 研发自动化（arXiv 2609.36054）](https://mp.weixin.qq.com/s/FCvH1DCned1UDi1Zds_l7A) 的成本讨论可对照阅读。

→ [原文存档](https://mp.weixin.qq.com/s/x4B6dK9GnLNNajdjc6QPrQ)

---

