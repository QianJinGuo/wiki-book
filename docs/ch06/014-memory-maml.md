# 参数化 Memory 漫谈：从 MAML 到测试时学习的完整谱系

## Ch06.014 参数化 Memory 漫谈：从 MAML 到测试时学习的完整谱系

> 📊 Level ⭐⭐ | 12.7KB | `entities/parametric-memory-survey-chenzikang-alitech-2026.md`

# 参数化 Memory 漫谈：从 MAML 到测试时学习的完整谱系

## 摘要

阿里技术（陈梓康）超长综述教学文（约 100 分钟阅读，手工撰写 AI 仅校稿），系统梳理参数化 Memory 全谱系：工作性定义（**Memory = LLM 自迭代中的外部 optimizer state**）→ MAML/Meta-SGD 元学习（易改写初始化）→ FFN-as-KV/Knowledge Neurons/ROME/MEMIT 知识编辑（写事实但难规模化）→ Prefix/LoRA/QLoRA 低秩增量（可插拔但无生命周期）→ ICL（不落盘的激活空间隐式学习）→ 显式记忆层（PKM/Memory Layer at Scale/PEER/Sparse Memory FT：容量计算解耦+离散地址）→ 测试时学习（TTT/Titans/统一框架：更新规则变可学习量）→ RAG（外部记忆）→ Agent 经验系统（Reflexion/Voyager/进化程序/Self-Evolving Memory：演化 optimizer 自己）。

## 核心定义

自迭代核心问题：**如何把海量经验压缩成可执行的更新方向**。LLM bad case 是语义层面失败（意图理解/工具时机/压缩丢约束），无法直接做 delta 求和，需理解→归因→聚类→压缩。「Compression is Intelligence」≈ Hutter Prize 思想。

**Memory 工作性定义** = LLM 自迭代中的**外部 optimizer state**——保存历史经评价、归因、压缩后的可复用结构（我为什么错/哪类任务易错/下次如何处理/什么算更好/是否已验证/留外部还是固化参数），连接过去表现与未来更新。

## 谱系一：元学习——把经验压缩成「易改写」

- **MAML**（ICML 2017）：训练初始参数 θ 使从 θ 出发经 1-2 步梯度更新在新任务上表现好——存「可快速改写的结构」非具体答案。普通训练压缩跨任务平均规律；**MAML 压缩跨任务快速适应结构**（训练目标从「当前能力」迁移到「可适应性」）。内循环学一个任务、外循环学如何更快学习任务；梯度穿过梯度（Hessian-vector products，一阶近似 +33% 加速 → Reptile/ANIL）
- **双层记忆解释**：慢记忆 θ（跨任务共性/易改写方向）vs 快记忆（新任务少量样本/当前任务信息）
- **Meta-SGD**：MAML 压缩成好的 θ；Meta-SGD 进一步压缩成好的 θ + 更新方向 + 学习率（更新几何）
- 限制：任务分布偏离失效/二阶成本/LLM 全参数 MAML 不现实 → MAML+LoRA/adapter/prefix 方向

## 谱系二：知识编辑——在参数里写事实

- **FFN-as-KV**：FFN ≈ 未归一化 key-value memory（第一层矩阵是 keys 被模式激活，第二层 values 影响输出分布），占参数预算 2/3；key 像模式检测器（65-80% 可归入模式），层越高越语义化
- **Knowledge Neurons**（BERT cloze）：integrated gradients + 多模板 refinement 定位共享神经元；抑制 -29.03%/放大 +31.17% 正确概率。「知识手术」更新事实 change rate 48.5%。**定位≠可靠写入**
- **ROME**（Rank-One Model Editing）：causal tracing 定位事实召回在中间层 MLP；三步（找 subject key → 优化 value → rank-one update）；受约束线性代数——目标 key 读新 value 尽量少干扰其他 key。GPT-2 XL efficacy 99.8；引入 CounterFact（efficacy/paraphrase generalization/neighborhood specificity）
- **MEMIT**（批量编辑）：normal equation 推导 batch update，经验二阶矩近似旧 key 分布（常见激活方向更强保护）；分布式写入一段 critical MLP layers。10,000 edits GPT-J 综合 85.8 vs ROME 50.3 vs MEND 23.1。**任何可扩展 Memory 必须同时处理 memorization 与 preservation**
- **难度（限制几何）**：Generalization 与 locality 难同时满足；定位≠编辑最优位置（Does Localization Inform Editing? 位置与编辑成功率几乎不相关）；连续编辑引入 gradual→catastrophic forgetting；事实编辑≠完整知识更新（时间/多跳/反事实/程序/偏好/安全都超出）；in-context editing 可能比梯度编辑更稳定副作用更少

## 谱系三：低秩增量——可插拔记忆

- **Prefix-Tuning**（ACL 2021）：冻结 LM 只优化连续 task-specific prefix，约 0.1% 参数接近全量 fine-tuning；天然支持 per-user personalization。限制：占用序列长度/行为引导非精确知识库
- **LoRA**（2021）：冻结 W 学低秩增量 ΔW=BA，训练参数 -10,000×；**低 intrinsic rank 假设**——经验写入所需变化天然低秩则 Memory 不必占完整参数空间。限制：rank 强约束/插入位置 heuristic/**无生命周期管理**（何时写/去重/冲突/遗忘/验证全不负责）
- **QLoRA**（NeurIPS 2023）：4-bit 量化 + LoRA；天然适合「多记忆并存」（θ+φ_user_A / θ+φ_project_X 分离）

## 谱系四：ICL——参数不变时激活空间的隐式学习

- **Induction Heads**（Anthropic 2022）：induction head = [A][B]…[A]→[B] 序列补全（previous-token head 拷贝 + induction head 匹配复制）；ICL score = loss(500th)−loss(50th)；**相变**约 2.5-5×10⁹ token 处（训练 1-2%），ICL score 从 <0.15 跳到 ≈0.4 nats 后恒定；per-token loss 分析验证收益精确集中 induction 规则猜对的 token；抽象模式匹配 [A*][B*]…[A]→[B]（嵌入空间相近，如逐词翻译）
- **隐式优化算法**：Akyürek（ICLR 2023）激活里编码隐式小模型线性回归探针；von Oswald（ICML 2023）**一层 linear self-attention 前向精确等价于一步 GD**（训练真收敛到构造，余弦 ≈1.00），K 层 ≈ K 步 GD，induction head 是「GD 式 ICL 特例」；Dai et al. ICL ≈ 隐式 finetuning（meta-gradient）
- **共同结论：参数冻结 ≠ 不学习，学习搬进前向传播的激活空间**。争议：Shen et al.（ICML 2024）ICL 对示例顺序敏感而 GD 不敏感，「equivalence remains an open hypothesis」；Alignment Forum 复核 attention map 余弦最高 0.687
- **callback**：ICL = 不写参数的「快学习」对应 MAML 内循环；一份不落盘的参数化 Memory（Δw 算完就丢）；容量被 context 卡死 → 通向 test-time learning

## 谱系五：显式记忆层——容量计算解耦 + 离散地址

- **PKM**（NeurIPS 2019）：key 数拉百万级 + top-k 求和，**容量与计算解耦**（参数随 N 线性、FLOPs 随 k）；product keys 两步检索亚线性。12 层插一层超 24 层 baseline
- **Memory Layers at Scale**（Meta 2024）：128B memory parameters 同 FLOPs 超 2× dense 和 MoE；**收益在 factual 任务最集中**（FFN-as-KV 存模式→输出倾向，事实问答最接近查表）
- **PEER**（DeepMind 2024）：一百万单神经元专家 + product key 检索（地址内容分家），逐 token 现场拼装宽 FFN；**统一概念：槽位=宽度归零的专家，专家=宽度放大的槽位，memory layer 和 MoE 同一设计空间两端**
- **Sparse Memory Finetuning**（Meta 2025）：知识平摊离散槽位访问天然稀疏，TF-IDF 找新知识专属地址只开 top-t 槽位梯度。旧能力损耗：全量 -89%/LoRA -71%/**sparse FT -11%**——LoRA 稀疏在方向上仍串扰，槽位微调稀疏在坐标上结构隔离

## 谱系六：测试时学习（TTL）——写入时机推迟到推理中

推理中写入没有标签 → 梯度从哪来？三条答案线：

- **监督信号免费**（Dynamic evaluation：每 token 天然是前文标签）；**信号缺席就制造**（TTT-2020 旋转预测自监督头，确立 test-time training 名字）；**从任务结构挖**（ARC-TTT：leave-one-out + 几何增广造训练数据，任务专属 LoRA 答完即弃，8B 53.0% 追平人类平均——同一批演示 ICL 走前向隐式消费、TTT 走反向显式消费，显然后者更好）
- **TTT Layers**（2024）：**隐藏状态 = 内层模型的权重 W，更新规则 = 一步自监督学习**，每 token 先训后测；对照 MAML 是双层结构逐 token 版；把 von Oswald「前向隐式等价 GD」从解释翻转成设计原则
- **Titans**（Google 2025）：给写入配**动量（惊讶度/梯度范数）+ 遗忘（数据依赖 weight decay）**；LMM 模块 + attention 短期 + persistent memory 任务级；MAC/MAG/MAL 三种组装，MAC 长上下文扩到 2M+ 超 GPT-4；消融 weight decay > momentum > conv
- **Test-time regression 统一框架**：过去五年高效注意力变体各对应一个经典估计器——linear attention=线性回归、delta rule=递归最小二乘、**softmax attention=Nadaraya-Watson 核回归**（逐字推导，副产品 QKNorm 理论解释）；softmax 非参数一侧精确，其余参数一侧有损恒定
- **FlashMemory**（2026-06 对照组）：Neural Memory Indexer 预测预取 KV 块，物理 KV cache 压到 13.5% 精度反升（attention denoiser）；**TTT 学往状态写什么，FlashMemory 学从状态读什么——共同点：记忆决策从固定启发式换成被训练的小模型**
- 边界：规模证据停在学术档/状态寿命不过会话边界（跨会话由外部系统承接）/写入时机前移投毒面前移

## 谱系七：RAG 与 Agent 经验系统

- **RAG**：持久状态在模型权重外按需取回——便于更新/删除/追溯/扩容；与参数化 Memory 非替代（后者擅长低延迟/深融合/泛化）。长期记忆需写入/更新/遗忘/回写；retrieval 正变成可学习策略
- **Reflexion**（NeurIPS 2023）：verbal reinforcement learning——语言反思当 episodic memory，**mem 与 Adam 动量同构（Memory=外部 optimizer state 最字面实现）**；换来 append-only（无编辑干扰）+ optimizer state 人类可读；软肋：评估器坏梯度方向就反
- **Voyager**（2023）：技能库=程序化 Memory（验证过的 JS 函数，质量不变量）；程序载体三性质：精确回放/组合性（记忆条目第一次互相引用）/免遗忘。代价：泛化让渡给冻结基座
- **可演化程序结构**：STOP/ADAS/AFlow/AlphaEvolve——LM 只当变异算子；AFlow 搜出的 workflow 让小模型以 GPT-4o 约 4.55% 推理开销超过 GPT-4o（「任务怎么拆」结构记忆顶掉参数容量）；AlphaEvolve 4×4 复矩阵 48 次标量乘破 Strassen 56 年纪录。**评估器移进记忆系统内部**（上限从生成器多强移到评估器多真）
- **Self-Evolving Memory（2026）**：演化记忆机制本身——EvolveMem 演化检索配置（LoCoMo F1 0.305→0.543）；CluE 逐簇演化抽取 prompt（三类全正 +9.04%，对照 Mem0 增益翻号）；MemMA 探针自检回写（去探针掉 11.19 点）；**MemRL 在 episodic memory 上学 Q 值**（「语义相似≠任务相关」第一次拿到学习信号层面处理，ALFWorld 0.324→0.507）。套路已出现三次：MAML 学初始化、Meta-SGD 学学习率、Titans 学动量遗忘门、现在轮到经验系统演化 optimizer 自己

## 与其他实体的关系

- **agent-memory-* 系列**（main-contradiction/engineering-tax/evaluation-landscape 等）：全部聚焦**外部记忆系统**（上下文调度/存储工程/评测/安全注入）；本实体补上**参数内部记忆**谱系（元学习/知识编辑/记忆层/TTL）——两条线互补，共同构成 Memory 全景
- **tencentdb-agent-memory-hierarchical**：TencentDB 是外部记忆分层治理实例；本实体提供底层机制解释（为什么外部记忆需要治理——参数写入的干扰/遗忘问题迫使经验外移）
- **llm-self-improvement-system-survey**：自改进综述关注训练流程；本实体从 Memory 视角重读同一批方法（MAML/Reflexion/进化）

## 来源

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/parametric-memory-survey-chenzikang-alitech-2026.md)

---

