# How LLMs Actually Work: 0xkato Transformer Walkthrough

> 📊 Level ⭐⭐⭐ | 11.9KB

> 原文存档：[原文存档](https://www.0xkato.xyz/how-llms-actually-work/)

## 概述

0xkato 2026-06-01 发布的 transformer 完整 walkthrough 长文，9 节系统覆盖 LLM 内部机制，**避免数学**但保留工程准确性。目标读者：能读 modern LLM papers 和 model cards 的人。

**9 节路径**（即 transformer pipeline 的"数据流"）：
1. Tokens — 字符串如何变整数序列
2. Embeddings — 整数如何获得语义
3. Positional encoding — 模型如何知道 token 顺序
4. Attention — tokens 如何相互通信
5. Multi-head attention — 多种关系并行追踪
6. Feed-forward network — 模型"存储结构"的主要载体
7. Residual stream + layer norm — 深度堆叠可训练性
8. Next-token prediction — 实际输出 + generation loop
9. Architecture vs trained weights — 跨模型共性 vs 差异性

**风格特征**：每节穿插 "Tiny explainer" 灰色小框（如 vector / vocabulary / positional encoding 定义），让非专业读者也能跟上。

## 关键内容精要

### 1. Tokenization
- **核心机制**：string → 整数 ID 序列，每个 ID 对应 vocabulary 中一个 entry
- **现代 vocabulary size**：数万到数十万
- **Subword 分词**：whole-word vocab 太大、character-level 太小 → subword 折中
  - "tokenization" → ["token", "ization"]
  - "running" → ["run", "ning"]
- **多 tokenizer 并存**：
  - GPT 系列用 BPE 变种
  - LLaMA 系列用 SentencePiece
- **著名"strawberry 计数 R 失败"现象**：不是 counting 失败，是 LLM 操作 token ID 而非字母

### 2. Embeddings
- **Embedding matrix**：vocab_size × hidden_size 查找表（7B 模型 4096 dim）
- **语义几何**：相似 token 邻近（"king" ≈ "queen"），arithmetic 有时工作（`king − man + woman ≈ queen`）
- **核心局限**：embedding 不携带位置信息

### 3. Positional encoding
- **核心问题**：plain self-attention 不知道 word order（"dog bites" vs "bites dog" 顺序颠倒）
- **Vaswani 2017 sinusoidal**：给每个 position 一个 sine/cosine 模式，加到 embedding 上
- **RoPE（Su et al. 2021）**：现代 LLaMA 系模型用 rotation-based 方案，更好的 length extrapolation

### 4. Attention + 5. Multi-head
- **Self-attention**：tokens 相互 share information
- **Multi-head**：并行追踪多种关系（语法、语义、上下文依赖...）

### 6. Feed-forward network
- **存储结构的主要载体**：参数量在 FFN 中通常占大头
- 这是"模型 knowledge 集中地"的概念框架

### 7. Residual stream + Layer norm
- **Residual stream**：让 deep stack 可训练（gradient flow）
- **Layer norm**：稳定训练

### 8. Next-token prediction
- 模型实际输出 = vocabulary 上的概率分布
- **Generation loop**：predict → sample → append → repeat

### 9. Architecture vs trained weights
- **跨模型共性**：所有 modern LLM 共享 transformer skeleton
- **跨模型差异**：训练数据、scale、configuration、post-training

## 实践价值

- **0 数学门槛**：避开公式但保工程准确性——适合 onboarding 工程师 / 研究者
- **可读 LLM papers**：读完能区分 paper 中讲的"哪段对应 transformer 哪部分"
- **Tiny explainer 设计**：把概念凝练成 1 段，可作为团队内部 onboarding 材料
- **Vaswani 2017 + Su 2021 引用**：原始论文锚点准确

## 与现有 LLM 架构实体的差异化

`entities/agent-security-three-step-sequence-harness-governance-identity-crewai.md` 等大量 entities 涉及 LLM 应用层（agent / harness），但**没有任何现有 entity 专门做"LLM 内部机制 walkthrough"**——本 entity 填补了"基础架构教学层"的空白。

适合做以下 wiki 内部引用：
- `concepts/llm-architecture` 章节的入门 reference（待该 concept 存在时再链接）
- 新人工程师 onboarding 路径上的"必读材料"

## 上线状态

- 原文 URL: https://www.0xkato.xyz/how-llms-actually-work/
- 作者：0xkato
- 发布日期：2026-06-01
- 阅读时长：26 分钟
- 篇幅：~30KB（含 tiny explainer callouts）

## 深度分析

### 1. 从 token ID 到语义几何：两步"赋予意义"的机制链
0xkato 的 walkthrough 把"模型如何理解文字"拆成两个可分离的步骤，这条机制链是全文的主轴。第一步是 tokenization：模型从不直接读文字，读的是整数 ID，每个 ID 指向固定 vocabulary 中的一个条目，现代 LLM 的 vocabulary 通常在数万到数十万条目之间。token 通常不是整词而是 subword——整词 vocabulary 太大且无法泛化到新词，字符级 vocabulary 太小、迫使模型从零学习最简单的模式，subword 是两者之间的效率折中，最常见的片段成为单 token，罕见词由小片段组合。第二步是 embedding：ID 本身只是 embedding matrix 的行索引，本身无任何含义；模型查表取出一行 hidden size 长度的向量（7B 级模型每 token 4096 个数），语义相近的 token（king 与 queen、Paris 与 France）在这个空间中彼此邻近，而这种几何结构不是硬编码的，完全从"预测文本"这一训练目标中涌现。值得注意的是查表是逐 token 独立进行的：每行向量只由该 token 的 ID 决定，与序列中的邻居无关，这一设计为下一步的位置缺口埋下伏笔。向量算术（king − man + woman ≈ queen）只是"有时"有效——几何携带真实语义结构，但不是可靠的推理接口。

### 2. 位置缺口：attention 天生不知道词序
walkthrough 最精确的一处澄清是：embedding 阶段的向量与位置完全无关——"dog" 的向量无论出现在 prompt 第一个词还是第五个词都相同，这是结构性缺陷而非实现细节，原文明确称之为 "a problem"。plain self-attention 没有内置的词序表示，没有位置信号就无法知道 "dog" 在 "bites" 之前还是之后，因此必须把每个 token 的位置注入计算过程。Vaswani 2017 的方案是给每个 position 分配独立的数字模式（由不同频率的 sine/cosine 波生成），在其余处理开始前直接加到 embedding 上，使 "dog" 在位置 1 和位置 100 的表示不再相同。原始存档恰好在此处截断（86 行）；RoPE 等现代旋转方案仅记载于本实体上文精要，本节不对存档之外的细节作引证。

### 3. 随文澄清的三个常见误解
其一是 strawberry 计数失败：LLM 数错 "strawberry" 里 R 的个数，不是 counting 能力缺陷，而是模型只操作恰好拼出该词的 token ID、从不直接接触字母。其二是"模型读文字"的直觉：从 tokenizer 到 embedding 的整条链路都建立在整数与查表之上，这是解释模型对拼写变化与多语言覆盖差异的前提。其三是"所有模型 tokenizer 相同"：GPT 系用 BPE 变种、LLaMA 系用 SentencePiece，选择影响 compute 成本（更少 token = 更少计算）与多语言覆盖，但基本形态一致——文本进、整数出。三个误解共享同一个根源——模型的全部操作对象是整数 ID 而非字符串——这也是 walkthrough 选择以 tokenization 作为叙事起点的深层理由：起点选错，后续每一层的直觉都会偏。

### 4. 对上下文长度行为的含义
把机制链接到 context 行为上：由于 attention 本身无序、位置完全依赖注入的 per-position 模式，模型在长序列上的表现由位置编码方案的外推特性决定——这是位置编码一节与 context window 议题的直接接口，也解释了为何不同模型在长上下文下表现分化。同时，pipeline 后段在原文目录中只有定位性描述——multi-head 并行追踪多种关系、FFN 承载大部分存储结构、residual stream + layer norm 使深层堆叠可训练——说明该文的核心价值是建立"每一节对应模型哪个部件"的心智地图而非逐机制展开；读者据此可对照 model cards，把各家模型的差异归位到训练数据、scale、configuration 与 post-training。

## 实践启示

### 1. 用 tokenizer 可视化工具检查你的提示词
在提交重要提示词前，用 tokenizer 工具检查 token 分割——某些措辞可能产生不理想的 token 序列。

### 2. 按任务类型而非感觉设定温度
代码生成/数学推理：温度 0-0.2；创意写作/头脑风暴：0.7-1.0；通用对话：0.3-0.5。这是实践验证的经验范围。

### 3. 利用 attention 热力图调试输出
当 LLM 给出错误答案时，检查 attention 热力图（如果可用）——模型可能关注了错误的输入部分，而非"不理解"问题。

### 4. 将 LLM 机制知识纳入团队培训
不要只教"如何写提示词"，还要教"为什么这样写"——机制理解使团队能独立解决新问题而非依赖模板。

### 5. 对非技术用户隐藏机制但保留影响
面向非技术用户的 AI 产品应隐藏 tokenization/sampling 细节，但通过预设配置（"精确模式"/"创意模式"）让用户间接控制这些参数。

## 相关实体
- Context Window Management Comparison
- Gepa Optimize Anything
- [Ai Phishing Attacks Are On The Rise Are You Prepared Bitward](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-phishing-attacks-are-on-the-rise-are-you-prepared-bitward.md)
- [Aws Sagemaker Azerbaijani Lm](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-sagemaker-azerbaijani-lm.md)
- [Code As Agent Harness Survey](https://github.com/QianJinGuo/wiki-public/blob/main/entities/code-as-agent-harness-survey.md)

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/llm-research-frontiers.md)
## 原文链接

→ [原文存档](https://www.0xkato.xyz/how-llms-actually-work/)

---

