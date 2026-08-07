---
source_url: "https://mp.weixin.qq.com/s/ZTg1bEd2Vx2h7TakM7060w"
source_author: "陈梓康"
source_title: "参数化 Memory 漫谈（纯干货）"
source_date: "2026-08-07"
source_publication: "微信公众号（阿里技术）"
ingested: "2026-08-07"
sha256: "346d1c3ea7315d39d08184557f7b6dae79014613d71829091d91088471fa28e3"
---

# 参数化 Memory 漫谈（纯干货）

> 阿里技术（陈梓康），2026 年第 49 篇，阅读约 100 分钟。手工撰写，AI 仅资料搜集校稿。超长综述教学文，覆盖参数化记忆全谱系。

## 01 前言：Memory 到底是什么？

自迭代的核心问题：**如何把海量经验压缩成可执行的更新方向**。传统神经网络误差可经 loss 反传做 delta；LLM 自迭代的 bad case 是语义层面失败（意图理解/工具时机/上下文压缩丢约束/风险判断/看似合理不改变决策），无法直接做 delta 求和，需先理解→归因→聚类→压缩。

「Compression is Intelligence」接近 Hutter Prize 思想的概括（压缩维基百科文本推动通用智能研究；近年实证：LLM 外部语料压缩效率与下游 benchmark 高度相关）。

**工作性定义**：Memory = LLM 自迭代中的**外部 optimizer state**——保存的不是历史记录，而是历史经评价、归因、压缩后形成的可复用结构（我为什么错/哪类任务易错/下次如何处理/什么算更好/是否已验证/留外部还是固化参数）。连接过去表现与未来更新。

## 02 LLM 时代之前的自适应元学习：MAML

**MAML**（Model-Agnostic Meta-Learning, ICML 2017, Finn/Abbeel/Levine）：训练初始参数 θ，使从 θ 出发经 1-2 步梯度更新就能在新任务上表现好——不是存具体答案，是存「可快速改写的结构」，即 easy-to-fine-tune 模型。

- **与普通 pretraining 区别**：普通训练压缩跨任务平均规律（当前参数表现好）；MAML 压缩跨任务快速适应结构（当前参数经少量更新后表现好）。训练目标从「当前能力」迁移到「可适应性」
- **算法**：内循环（一个任务上快速适应：K 样本算 loss→一步梯度下降→任务参数 θ'）；外循环（用更新后 θ' 的任务 loss 反传更新原始 θ——「学习如何更快学习任务」）
- **梯度穿过梯度**：外循环目标含 θ' = θ − α∇L(θ)，求导涉及二阶 Hessian-vector products。一阶近似在 MiniImagenet 接近完整版 +33% 加速 → Reptile (ICLR 2018)、ANIL (ICLR 2020)
- **正弦函数例子**：普通预训练学到「平均形状」，MAML 学到的 θ 看到 5 个点→梯度→正确振幅相位——保存的是正弦函数家族的**可适应结构**，参数化记忆雏形
- **双层记忆解释**：慢记忆 θ（跨任务共性：任务家族/有用特征/易改写方向/避免少样本过拟合）vs 快记忆（新任务少量样本：类别/振幅相位/用户差异/调整方向）
- **Model-Agnostic 的代价**：需要任务分布 p(T)、每任务少量样本、可定义任务 loss、可求梯度、训练测试可迁移结构。限制：任务分布偏离失效；二阶计算成本高；LLM 全参数 MAML 成本高（→ MAML+adapter/LoRA/prefix/soft prompt/tool policy/small personalized module）；梯度适应≠完整自进化（LLM 自迭代还涉及语义评价/工具/长期记忆/数据构造/验证回滚/安全约束）
- **延伸阅读**：CAVIA/ANIL（快速学习可能来自高质量特征复用而非大规模参数重写）；LEO（低维 latent embedding 适应，铺垫 LoRA）；iMAML（隐式梯度降内存，指向计算图开销瓶颈）

**Meta-SGD**（ICML 2017）：MAML 压缩成好的 θ；Meta-SGD 进一步压缩成好的 θ + 好的更新方向 + 好的学习率——「更新几何」。

## 03-04 Transformer 参数本身是否就是 Memory？

### FFN-as-KV（Transformer FFN Layers Are Key-Value Memories）

FFN 两层线性+非线性 ≈ 未归一化 key-value memory：第一层矩阵是 keys（被特定输入模式激活），第二层是 values（影响输出词表分布）。FFN 占典型 Transformer 参数预算约 2/3。实验：key 像模式检测器（65-80% top-trigger prefixes 可归入模式）；层越高模式越语义化；value 诱导输出词表分布；单次前向激活多个 memory cells 加权组合。

### Knowledge Neurons（BERT cloze）

用 integrated gradients 衡量 FFN 中间神经元对正确答案概率的贡献 + 多 prompt 模板 refinement 保留跨表达共享神经元 = knowledge neurons。抑制→正确答案概率 -29.03%；放大→+31.17%。「知识手术」更新事实 change rate 48.5%/success 34.4%（随机神经元 0.0%）；关系擦除提升被擦除关系 perplexity。**定位≠可靠写入**（cloze 任务、preliminary case studies）。

### ROME（Rank-One Model Editing, Locating and Editing Factual Associations in GPT）

事实 = (subject, relation, object)。causal tracing 定位：事实召回与**中间层 MLP 模块**强相关，关键 token 是 subject 最后 token。三步：找 key（subject 最后 token 在目标 MLP 层的内部表示）→ 求 value（优化写入 residual stream 后预测新 object 的 value）→ rank-one update 写参数（受约束线性代数：目标 key 读新 value，尽量减少对其他 key 干扰）。GPT-2 XL 上 efficacy 99.8/paraphrase 88.1/specificity 24.2；引入 CounterFact（efficacy/paraphrase generalization/neighborhood specificity 三指标）。**写入的是 subject-relation-object 形式事实关联**，不等同完整知识系统，逻辑后果不自动传播。

### MEMIT（Mass-Editing Memory in a Transformer）

单点编辑扩展到批量：一次写入大量事实关联，GPT-J 6B/GPT-NeoX 20B 扩展到数千条。把 MLP 当 linear associative memory，normal equation 推导 batch update；用经验二阶矩（uncentered covariance/Gram matrix）近似旧 keys 分布——常见激活方向更强保护（区别于均匀正则化 λ）。写入分布式分散到一段 critical MLP layers（causal mediation analysis 定位）。CounterFact 10,000 edits：GPT-J 综合 85.8 vs ROME 50.3 vs MEND 23.1。**关键张力：memorization vs preservation**——任何可扩展 Memory 系统必须同时处理写入与保留。覆盖范围有限（directional relations 为主，无时间/空间/数学/程序性/对称知识）。

### 把记忆写入参数的难度（限制几何）

1. **Generalization 与 locality 难同时满足**：编辑太窄只原 prompt 有效；太宽误伤邻近事实
2. **定位≠编辑最优位置**（NeurIPS 2023 Does Localization Inform Editing?）：causal tracing 位置与 ROME/MEMIT 编辑成功率几乎不相关——localization 回答信息在哪被携带，editing 回答哪里干预最能改变行为，两个问题可能不同
3. **多次编辑引入干扰遗忘**（Model Editing at Scale, 2024）：ROME/MEMIT 规模化优于 MEND/fine-tuning，但新编辑持续影响其他事实，可能 gradual → catastrophic forgetting；knowledge attenuation（redundant parameter interference + update weight disentanglement）
4. **事实编辑≠完整知识更新**：时间变化/多跳推理/反事实一致性/程序知识/偏好/安全约束都超出 factual triples
5. **参数修改未必代价最低**（Can We Edit Factual Knowledge by ICL?, EMNLP 2023）：in-context editing 可达竞争成功率 + 更少 over-editing/遗忘——外部上下文/RAG/adapter 可能更稳定

## 05 小参数增量作为「可插拔记忆」

主参数写入有局部性/干扰/连续编辑问题 → 把 Memory 写进更小可控可回滚的参数模块：θ（冻结基座）+ φ（任务/用户/领域/经验簇参数记忆）。

- **Prefix-Tuning**（ACL 2021）：冻结 LM 只优化连续 task-specific prefix（每层 key/value activations），约 0.1% 参数接近 full fine-tuning，low-data/unseen-topic 更有优势；重参数化训练后只存 prefix；天然支持 per-user personalization。限制：占用 attention 序列长度/优化敏感/行为引导参数非精确知识库
- **LoRA**（2021）：冻结 W 学低秩增量 ΔW=BA，训练参数 -10,000×、GPU 内存 -3×；推理可 merge 无延迟。**低 intrinsic rank 假设**（适配所需权重变化在低维子空间）——经验写入所需变化天然低秩则 Memory 不必占完整参数空间。限制：rank 强约束、插入位置 heuristic、**无 Memory 生命周期管理**（何时写/写什么/去重/冲突/遗忘/验证）
- **QLoRA**（NeurIPS 2023）：基座 4-bit NF4 量化，梯度传 LoRA adapter。小参数增量天然适合「多记忆并存」（θ+φ_user_A / θ+φ_project_X 分离）

## 06 参数不变时模型是否仍在学习？—— ICL

### Induction Heads（Olsson et al., Anthropic 2022）

「归纳头可能是大型 Transformer 中所有 ICL 的实际主要机制」——preliminary and indirect evidence，34 个 Transformer 训练全程 50,000+ 次注意力头消融。induction head = 完成 [A][B]…[A]→[B] 序列补全：previous-token head（第 1 层拷贝前一 token 信息）+ induction head（第 2 层 attend 上次 A 之后的 token 并复制）。两个动作：prefix matching + copying。**ICL score** = loss(500th token) − loss(50th token)（越负越会用 context）。**相变（phase change）**：约 2.5×10⁹–5×10⁹ token 处（训练 1-2%），ICL score 从 <0.15 nats 跳到 ≈0.4 nats 后恒定——induction bump，1 层模型永不发生。per-token loss analysis（固定探针 token 的 PCA 轨迹转向）验证收益精确集中在 induction 规则能猜对的 token 上（哈利波特 Mrs. Dursley 例）。**抽象模式匹配**：大模型表示足够抽象时 [A*][B*]…[A]→[B]（嵌入空间相近）——如逐词翻译（the≈le）。few-shot = 表示空间的 soft nearest-neighbor（核回归）。

### ICL 的算法视角（Akyürek et al. ICLR 2023; von Oswald et al. ICML 2023）

- **Akyürek**：in-context learner 在激活里编码隐式小模型，前向传播中「训练」它。用线性回归作探针：Transformer 能实现 GD（O(d) hidden size 一步）、岭回归闭式解（O(d²)）、OLS。行为对比：无噪线性回归下 ICL 与 OLS 吻合度最高。probe 隐藏态：w 和矩统计量在后段层才可解码、且 MLP 探针才读得出（非线性编码）——证据强度：线性探针成功 > MLP 探针成功 > 仅行为匹配
- **von Oswald**：一层 linear self-attention（LSA，去 softmax）的前向更新**精确等价**于对 in-context 样本做一步梯度下降。训练真的收敛到构造（权重可视化余弦 ≈1.00）。K 层 ≈ K 步 GD；GD++（曲率修正 preconditioning）超朴素 GD。**softmax vs linear**：等价性只在 linear attention 精确成立，softmax 层学到 copying（使能机制）→ induction head 是「GD 式 ICL 的特例/前置步骤」
- **两条路线**：机制可解释（Olsson，看电路，真实 LM 强项）vs 隐式优化算法（Akyürek/von Oswald，看算法，数学精确但合成任务 + linear attention）。**共同结论：参数冻结 ≠ 不学习，学习被搬进前向传播的激活空间**
- **争议**：Dai et al.（GPT 的 ICL ≈ 隐式 finetuning，meta-gradient）；Shen/Mishra/Khashabi（ICML 2024）直指设定不真实——LLaMA-7B 上 ICL 对示例顺序敏感而 GD 不敏感，「equivalence remains an open hypothesis」；Alignment Forum 复核（attention map 余弦最高 0.687 远不到 1）；理论撑腰（Mahankali：单层 LSA 一步 GD 可证最优；Ahn：预条件 GD）
- **Function classes**（Garg et al. NeurIPS 2022）：ICL 研究开山之作，train from scratch 学线性函数媲美 OLS，稀疏线性超 LS 接近 Lasso，决策树 100 个示例学未见过的树
- **callback**：ICL 是不写参数的「快学习」，对应 MAML 内循环（慢权重=meta-parameters，快适应=隐式 GD）；一份不落盘的参数化 Memory（Δw 只在激活里算完就丢）；容量被 context 长度卡死 → 通向 test-time learning

## 07 如何设计 Memory 压缩机制？

统一公式：Memory 作为 Compressor，m = Cφ(history, task) 后由 pθ 读取。四问：m 是什么形态（离散文本/gist token/summary vector/memory slot/KV cache/hidden state）；Cφ 是否任务相关（task-agnostic 可预计算 vs query-aware 更精准复用性差）；训练目标（重构/预测后续 token/完成任务/保留关键信息/压缩成本）；pθ 是否需训练（黑盒只能读离散文本，白盒可读 soft vector）。

- **Compressive Transformer**（2020）：继承 Transformer-XL，最旧 memories 先压缩再入 secondary FIFO compressed memory。WikiText-103 17.1 perplexity/Enwik8 0.97 bpc。压缩函数：mean/max pooling/1D conv/dilated conv/most-used selection；辅助损失：auto-encoding（保留全部）vs **attention-reconstruction loss（保留未来会被注意的信息）——效果最好**。**核心原则：好的压缩目标未必是完整重构过去，而是保留未来读取机制真正会用的信息**
- **Gist Tokens**（2023）：训练模型把 prompt 压缩进少量 gist tokens 的 hidden activations，只改 attention mask（input/output 不能 attend prompt，可 attend gist tokens）——instruction finetuning 同时学 instruction following + prompt compression。LLaMA-7B/FLAN-T5-XXL 最高 26x compression、40% FLOPs reduction。限制：不透明/主要适合 instruction/需 gisting 训练/高压缩率丢细粒度/黑盒不友好
- **AutoCompressors**：长文档切 segments 各压缩成 summary vectors 作为 soft prompts 传给后续。OPT/Llama-2 最高 30,720 tokens。递归更新、增量压缩、LM 目标无人工标注。限制：需训练/不可读/间接验证/跨模型迁移有限
- **ICAE**（In-context Autoencoder）：LoRA-adapted LLM 做 encoder + target LLM 自身做 decoder，memory slots 双目标（autoencoding 恢复原文 + LM 支持预测 + instruction fine-tune 服务任务）。约 1% 额外参数 4x compression。限制：4x 克制/需训练/不可读/autoencoding≠复杂推理
- **LLMLingua**：压缩回离散文本 token（黑盒可用）。coarse-to-fine prompt compression（budget controller + token-level iterative compression + instruction tuning distribution alignment）。最高 20x compression 性能损失较小
- **LongLLMLingua**：question-aware prompt compression（受 Lost in the Middle 启发：关键信息位置敏感，中间性能下降）。NaturalQuestions 4x 更少 tokens 提升 21.4%；LooGLE 94% cost reduction。**压缩提高性能不只是降低成本**（关键信息密度低/位置差/噪声多）
- **LLMLingua-2**：数据蒸馏视角——GPT-4 蒸馏压缩数据，prompt compression 转成 token classification（preserve/discard），Transformer encoder 用双向上下文。小模型快 3-6x，1.6-2.9x end-to-end latency speedup
- **本质差异**：soft compression（压缩率潜力高/模型读更自然/人类难审计/需目标模型配合训练）vs discrete compression（可审计/黑盒可用/保留证据链/高压缩率丢细节）。**压缩结果面向模型不只看人；压缩必须任务相关；黑盒优先离散，白盒可探索软压缩**

## 08 显式参数化记忆层

规格：容量大（与算力解耦）、读取稀疏（每 token 只碰少数槽位）、地址离散（写入能点名）。

- **Product Key Memory（PKM, NeurIPS 2019）**：FFN 改动两处——key 数从几千到十万百万级 + 求和收窄到 top-k。参数量随 N 线性、FLOPs 随 k 增长，**容量与计算解耦**。product keys：query 劈两半，两本子码本各 top-k，笛卡尔积组合再 top-k，复杂度从 O(N) 降到亚线性。12 层模型插一层 memory 超 24 层 baseline 且推理快一倍。多头访问 + query batchnorm 防死地址。限制：只读不写/槽位不可解释/利用率靠训练技巧
- **Memory Layers at Scale（Meta FAIR 2024）**：固定 FLOPs 预算，增量参数花在 memory vs dense vs MoE 谁划算。Llama 若干层 FFN 替换 memory layer、多记忆层共享池、跨 GPU 分片查表。128B memory parameters/1T tokens：同 FLOPs 下超 2× 算力 dense 模型、超 compute/parameter 双匹配 MoE；**收益在 factual 任务最集中**（FFN-as-KV 存「模式→输出倾向」，事实问答最接近查表；推理类改善有限）。代价：参数占 HBM 占通信，带宽成新瓶颈
- **PEER（Mixture of A Million Experts, DeepMind 2024）**：单元缩到宽度 1，一百万个专家每个单神经元。地址与内容分家（KV 分离：product key 负责检索、u/v 负责计算）；h 个 query 头共享专家池各自两步检索 top-k、softmax 门控。每 token 激活约 h×k 个神经元 = 逐 token 现场拼装宽度 hk 的 FFN。isoFLOP 压过 dense FFN/粗粒度 MoE/纯查表 PKM。**统一概念：槽位=宽度归零的专家，专家=宽度放大的槽位，memory layer 和 MoE 同一设计空间两端**
- **Sparse Memory Finetuning（Meta FAIR 2025）**：memory layer 改变了「共享权重写事实」的前提——知识平摊离散槽位，访问天然稀疏，新知识住哪不用归因算法猜（前向一遍访问记录就是地址）。TF-IDF 打分找新数据高频/背景低频槽位，只对 top-t 槽位开梯度其余冻结。同等新知识获取下旧能力损耗：全量微调 -89%、LoRA -71%、**sparse memory FT -11%**——LoRA 稀疏在方向上（新旧共享方向仍串扰），槽位微调稀疏在坐标上（干扰结构层面隔离）。限制：需预训练就是 memory-layer 架构/逻辑后果不自动传播/事实注入场景为主
- **小结**：容量大（PKM/scaling 证实）、读取稀疏（product keys 亚线性）、地址离散（sparse finetuning 隔离干扰）→ 写入成本降到「少量槽位几个梯度步」后，**写入时机可以推迟到部署后、推理中** → 下一章

## 09 测试时学习（Test-Time Learning/TTL）

写入发生在推理中 → 没有标签 → 梯度从哪来？

- **Dynamic evaluation**（Krause ICML 2018）：评估时按段读序列，对刚见片段算 LM loss 做梯度步再预测后文——语言建模监督信号免费（每 token 天然是前文标签）。PTB/WikiText/enwik8 稳定改善。代价：更新整个模型成本高/学习率和时机手工设定
- **TTT-2020**（Sun ICML 2020，图像）：信号缺席就制造——Y 形网络共享特征提取器 + 分类头 + 旋转预测自监督头，联合训练使梯度相关；测试时无标签样本先在自己增广副本上做梯度步再分类。确立了 test-time training 这个名字
- **ARC-TTT**（Akyürek，ICML 2025 The Surprising Effectiveness of Test-Time Training）：ARC 任务 n 个演示对（2-3 个）→ leave-one-out（轮流藏第 i 对当考题）变 n 条训练样本 + 可逆几何增广（旋转/翻转/转置同步变换）扩到数百条 → 任务专属 LoRA 训练（基座冻结）→ 推理多增广视角各自预测逆变换还原 + 层级投票（同视角内再跨视角）→ 提交答案 LoRA 即弃。8B 模型 ARC 公开验证集 53.0%（纯神经公开方法 SOTA +25%），与程序合成集成 61.9% 追平人类平均。**同一批演示在 ICL 走前向隐式消费、在 TTT 走反向显式消费，显然后者更好**。共同洞察：监督信号藏在输入自身结构里（序列自回归结构/图像几何结构/演示对可拆分结构）
- **TTT Layers**（Learning to (Learn at Test Time), 2024）：序列建模层拆三件——隐藏状态、更新规则、输出规则。RNN 隐藏状态定长向量固定函数；attention 是增长 KV cache 追加；**TTT 隐藏状态 = 内层模型的权重 W，更新规则 = 一步自监督学习**。每 token 先训后测：训练步（低维投影重构另一投影，学不好变成梯度改写 W）+ 预测步（查询更新后的 W）。TTT-Linear/TTT-MLP。细节：type mismatch（重构标签 LN 归一化 vs 解码头未归一化——类型不匹配，修法给解码端也加 LN）；mini-batch TTT + 对偶形式改矩阵乘解决逐 token 串行；125M-1.3B 追平/超过 Transformer 和 Mamba，Mamba 16k 上下文后困惑度停止下降 TTT 持续受益。**对照 MAML：双层结构的逐 token 版**（外环学任务分布共性，内环少量证据快速适应，步进频率提到每 token 一次，适应对象缩到一层隐藏状态）。**对照 von Oswald：把「前向隐式等价 GD」从解释翻转成设计原则——先选内层学习器再让架构显式执行更新**
- **Titans**（Learning to Memorize at Test Time, Google 2025）：TTT 内环对每 token 无差别一步 GD，没有轻重没有遗忘 → LMM（Long-term Memory Model）给写入配**动量 + 遗忘**。三行公式：关联记忆损失（≈Compressive Transformer attention-reconstruction loss 在线化）；梯度范数=「惊讶度」（违背记忆预期大梯度大写入，动量让惊讶跨 token 延续，数据依赖门控）；数据依赖 weight decay = 遗忘门。**Titans = LMM 模块 + attention 短期 + persistent memory（数据无关可学习 token，任务级知识）**。三种组装：MAC（记忆作上下文）/MAG（记忆作门）/MAL（记忆层）。长上下文 MAC 最好扩到 2M+，BABILong 超所有基线含 GPT-4；消融贡献排序 weight decay > momentum > conv > persistent memory。限制：非线性递归更新并行化靠分块近似/官方代码未放出
- **Test-time regression 统一框架**（Wang/Shi/Fox 2025）：关联召回拆成记忆+检索——记忆侧对全部 KV 解加权回归，检索侧拿查询过拟合好的回归器。三个旋钮完全刻画每个序列层：关联权重（管遗忘）/回归器函数类（管容量）/优化算法（管更新规则）。**过去五年高效注意力变体各对应一个经典估计器**：linear attention=线性回归（无记忆矩阵）；delta rule=递归最小二乘；Gated DeltaNet=递归最小二乘+门控；xLSTM=递归最小二乘+逐元素门控；**softmax attention=Nadaraya-Watson 核回归（键查询归一化后指数平滑核与缩放点积严格相等——softmax attention 被逐字推导出来，副产品 QKNorm 理论解释）**。断层线：softmax attention 非参数一侧（记忆=样本全集不压缩，精确）；其余参数一侧（拟合进定长权重，有损恒定开销）。后续：Local Linear Attention（局部线性回归新注意力层）
- **FlashMemory**（2026-06，对照组）：严格说不属 TTL（backbone 推理中不动），补读路径另一半——Neural Memory Indexer 预测接下来用哪些细粒度 KV 块（lookahead）只预取进显存，全局 128:1 HCA 块保底。LongBench-v2/LongMemEval/RULER 物理 KV cache 压到 13.5% 精度反升 0.6 点（attention denoiser：删掉上下文里噪声多于信息）；500K 长度 KV 开销削减 90%。**TTT/Titans 学往状态里写什么，FlashMemory 学从状态里读什么——共同点：记忆决策从固定启发式换成被训练的小模型**
- **边界**：规模证据停在学术档（TTT 1.3B/Titans 无代码，工业界 2026 年中选改读路径不动写路径）；状态寿命不过会话边界（TTT/Titans 随序列结束丢弃，ARC-TTT 任务 LoRA 即弃——跨会话记忆由外部系统承接）；评测与知识更新/受控遗忘/拒答/来源追溯表格对不上；写入时机前移 → 投毒面前移（推理期写入直面对抗输入，无系统性工作）

## 10 RAG：把记忆放在参数之外

RAG 本身就是 Memory 的一种——知识留在外部存储，retrieval 寻址 + generator 使用。外部存储非参数但 retriever/reranker/reader/memory policy 有参数。「外部记忆」≠「系统无参数」。与参数化 Memory 非替代：前者便于更新/删除/追溯/扩容，后者擅长低延迟/深融合/泛化。

长期记忆系统不只是 query→retrieve→generate，还要写入/更新/遗忘/回写。retrieval 正变成可学习策略（2026 ACL/EACL 工作：模型自己决定何时检索/缺什么/去哪找/何时找够）。RAG 未解决：写入（哪些交互值得保存/存原文摘要图节点还是 hidden state）、寻址（语义相似≠任务相关；时间/否定/多跳/异构难统一）、使用（检索到证据≠generator 相信正确组合准确引用）、生命周期（更新/冲突/遗忘/删除/权限/来源）、成本。

## 11 Agent 时代：记忆写入「经验系统」

基座权重全程冻结，学习全部落在权重之外。

- **Reflexion**（NeurIPS 2023）：把二值信号变成改进——Evaluator 打标量 → Self-Reflection 读入产出指认失败原因+下次对策的自然语言 → 反思追加 episodic buffer → Actor 下轮拼进 context 重试。**verbal reinforcement learning**（评价从 loss 换语言反思，归因从反传换因果推理，承载体从参数换 context）。AlfWorld 134 任务 12 轮完成 130（比 ReAct +22 绝对点）、HumanEval pass@1 80.1→91.0%、HotPotQA +20 点。**mem 与 Adam 动量同构——Memory 是外部 optimizer state 的最字面实现**。换来 append-only（无编辑干扰遗忘）+ optimizer state 人类可读。代价：1-3 条窗口千字节装不下事实积累；只能在冻结模型已会的行为里选择；buffer 绑定单任务即弃。软肋：评估器坏语言梯度方向就反（MBPP 假阳性测试使 Reflexion 低于重试基线）
- **Voyager**（2023）：技能库作为程序化 Memory——每个学会的行为固化成 Mineflayer API JavaScript 函数。三件套：automatic curriculum（出下一个难度合适任务）+ iterative prompting（环境反馈/执行报错/self-verification 三路信号改代码）+ skill library（积累）。写入端门槛：技能必须通过 GPT-4 self-verification 才入库（质量不变量）；读取端向量寻址（功能描述嵌入 key，top-5 拼 prompt）。160 轮内 unique items 3.3×、行进距离 2.3×、技术树里程碑最快 15.3×。消融：去技能库物品曲线趋平；GPT-4 换 GPT-3.5 全系统塌掉。**程序载体三性质**：精确回放（执行语义确定）、组合性（技能互调形成调用图，记忆条目第一次互相引用）、免遗忘（append-only 无共享底座干扰严格为零）。代价：泛化被整体让渡给冻结基座。边界：可验证在 Minecraft 便宜，现实 verifier 贵（GUI 无单元测试级判据）
- **可演化程序结构**（STOP/ADAS/AFlow/AlphaEvolve）：控制流本身是代码没理由豁免优化——LM 全程冻结只当变异算子，累积全在程序制品和评估记录。STOP（自指 improver 递归，GPT-4 写出的 improver 自发出现 beam search/遗传算法/模拟退火；反面样本：试图关掉执行沙箱——效用与出题人意图缝隙被搜索利用）；ADAS（meta-agent 用代码定义新 agent，档案存全部历史设计与分数，DROP +13.6 F1/MGSM +14.4 点换基座增益保留）；AFlow（workflow 代码图 + MCTS 搜索，六 benchmark 平均超 SOTA 5.7%，**搜出的 workflow 让小模型以 GPT-4o 约 4.55% 推理开销超过 GPT-4o——「任务怎么拆」结构记忆顶掉一部分参数容量**）；AlphaEvolve（DeepMind 生产刻度：进化程序库 MAP-Elites+岛屿种群保多样性，Gemini 2.0 Flash 出吞吐 Pro 出质量，变异 diff 产出；数学栏 4×4 复矩阵 48 次标量乘破 Strassen 56 年纪录、kissing number 592→593；工程栏 Borg 回收 0.7% 算力/Gemini kernel +23%/FlashAttention +32.5%）。**两个默认值被改**：评估器移进记忆系统内部（系统上限从生成器多强移到评估器多真）；淘汰准则换目标（RAG 全存按相似度取、Reflexion 只留最近、进化库为覆盖度存——MAP-Elites 明确保当前非最优解因为它们是后代的父本）
- **Self-Evolving Memory（2026 新方向）**：前三节演化记忆内容，记忆机制（抽取 prompt/检索相似度/取回用法）仍是超参数 → 2026 组工作演化整条管道。**EvolveMem**（2605.13941）：retrieval configuration 与内容一起演化（top-k/融合方式权重/时间衰减半衰期进结构化配置，「评估→诊断→提案→守护」循环，守护自动回滚退化提案，还会发明动作空间外配置维度），LoCoMo F1 0.305→0.543 越 SimpleMem 0.432。**BEHEMOTH/CluE**（2604.11610）：基准（18 数据集分 personalization/problem-solving/agentic 三类按记忆效用打分）+ 方法（训练样本按抽取场景聚类、逐簇归因、跨簇合成演化抽取 prompt）。增益翻号证据：Mem0 抽取策略 personalization +29.96% 到 problem-solving −3.70%；CluE 逐簇演化三类同时为正 +9.04%。**MemMA**（2603.18718）：construction/retrieval/utilization 进多智能体协调循环（Meta-Thinker 出策略/Memory Manager 执行增删改/Query Reasoner 迭代改写查询），session 收尾自造 5 探针 QA 考暂态记忆，答错定位构建缺陷回写——使用端失败信号回流构建端。LoCoMo 插 LightMem 后端 ACC 75.66→81.58，去探针自检掉 11.19 点。**MemRL**（2601.03192）：episodic memory 上学 Q 值挑高价值经验（三元组=意图向量+成功轨迹+可学习效用标量；检索两相：相似度阈值召回 + 相似度×效用混合分 TopK；任务结束按成败 one-step TD 更新效用）。语义相似度降级成召回门槛，**「语义相似≠任务相关」第一次拿到学习信号层面处理**。ALFWorld 成功率 0.324→0.507。**套路已出现三次：MAML 学初始化、Meta-SGD 学学习率、Titans 学动量遗忘门、现在轮到经验系统演化 optimizer 自己**

## 12 Benchmark

长期记忆 benchmark 无包打天下总分，先问测的是「记住后回答问题」「管理长期记忆系统」还是「把记忆用于后续行动」。2026 年 3 月后值得关注：LongMemEval-V2（web agent 长期经验，451 道人工题覆盖静态状态回忆/动态状态追踪/工作流知识/环境陷阱/错误前提识别，历史最长 500 条 trajectory 约 1.15 亿 tokens，work in progress）。

## N 未讨论的乌云

完全记忆算法还有：某些子能力、压缩关系、评估与当前技术缺口（知识更新/受控遗忘/拒答/来源追溯等评测几乎无人测）。

## 总结

「很多工作不过昙花一现，但仔细阅读后思考会被大脑自动压缩成独有的记忆。」全文主线：Memory = LLM 自迭代的外部 optimizer state；参数化记忆从 MAML（易改写初始化）→ 知识编辑（ROME/MEMIT 写事实但难规模化）→ 低秩增量（LoRA/Prefix 可插拔但无生命周期）→ ICL（不落盘的激活空间隐式学习）→ 显式记忆层（PKM/Memory Layer/PEER/Sparse FT 容量计算解耦+离散地址）→ 测试时学习（TTT/Titans 把更新规则变可学习量）→ RAG（外部记忆）→ Agent 经验系统（Reflexion 语言反思/Voyager 技能库/进化程序/Self-Evolving Memory 演化 optimizer 自己）。
