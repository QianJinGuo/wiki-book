# How LLMs Actually Work: 0xkato Transformer Walkthrough

## Ch01.1181 How LLMs Actually Work: 0xkato Transformer Walkthrough

> 📊 Level ⭐⭐⭐ | 8.8KB | `entities/how-llms-actually-work-0xkato.md`

# How LLMs Actually Work: 0xkato Transformer Walkthrough

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/how-llms-actually-work-0xkato.md)

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

### 1. "LLM 如何工作"的教育必要性
在 LLM 被广泛使用但很少被理解的当下，0xKato 的拆解填补了一个关键空白：大多数 LLM 用户不了解 tokenization、attention、sampling 的工作原理，导致错误的使用预期和不合理的信任/不信任。

### 2. Tokenization 是理解 LLM 行为的第一把钥匙
LLM 不是"读文字"而是"读 token"——这一事实解释了 LLM 的许多"奇怪"行为：对拼写变化的敏感度、对某些语言的处理劣势、对重复 token 的偏好。理解 tokenization 是理解 LLM 能力边界的前提。

### 3. Sampling 温度的工程含义
温度参数不只是"创造性旋钮"——它控制的是概率分布的熵，直接影响输出的多样性和可重复性。温度=0 时输出确定但保守，温度高时输出多样但不可控。工程实践中应根据任务类型而非"感觉"设定温度。

### 4. Attention 机制的可解释性价值
Attention 权重的可视化是理解"模型在看什么"的最佳工具——它不是黑箱，而是可审查的加权图。对安全敏感场景，attention 热力图可以揭示模型是否在关注正确的输入部分。

### 5. 从机制理解到使用策略
理解 LLM 的工作机制直接导向更好的使用策略：知道 tokenization 的特性后可以优化提示词格式、知道 sampling 的特性后可以调参、知道 attention 的特性后可以设计上下文结构。

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
- [Context Window Management Comparison](https://github.com/QianJinGuo/wiki/blob/main/entities/context-window-management-comparison.md)
- [Gepa Optimize Anything](ch01/362-gepa-optimize-anything.html)
- [Ai Phishing Attacks Are On The Rise Are You Prepared Bitward](https://github.com/QianJinGuo/wiki/blob/main/entities/AI-phishing-attacks-are-on-the-rise-Are-you-prepared-Bitward.md)
- [Aws Sagemaker Azerbaijani Lm](../ch05/079-ai.html)
- [Code As Agent Harness Survey](../ch09/052-code-as-agent-harness.html)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/llm-research-frontiers.md)
## 原文链接

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/how-llms-actually-work-0xkato.md)

---

