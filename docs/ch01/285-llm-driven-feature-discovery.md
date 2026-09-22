# LLM-Driven Feature Discovery

> 📊 Level ⭐⭐⭐ | 7.8KB

> **来源**: [LLM-Driven Feature Discovery](https://www.alignmentforum.org/posts/WAZWA6FPQvH8okouJ/llm-driven-feature-discovery)

## 摘要

LLM-Driven Feature Discovery 是一套**不访问模型内部**的行为定性刻画方法：让黑箱 LLM autorater 把对话拆出的每类片段转写成 10-20 条自然语言 "feature"，再做语义嵌入、分类型聚类、逐簇命名。作者称之为 "black box SAE"——与稀疏自编码器解决同一问题（把模型文本特征化）却不依赖激活；10 万条聊天记录产出约 2 万个 user/thought/response 特征，许多簇描述了有意思的 Gemini 行为，而从 user 特征预测 thought/response 特征大多失败。

## 核心要点

- **解决"定性发现"**：发现新行为、找出某行为的成因、找出行为之间意外的相关性——标准 benchmark 不回答这些问题。
- **黑箱 SAE 定位**：只需模型输出、不需要权重/激活/梯度，可用于任何只开放 API 的模型；但特征不对应激活方向。
- **分类型聚类是关键设计**：user / thought / response 三路各自嵌入、各自聚类，避免用户意图与模型内部行为混池。
- **与 EDW 相近但更简单**：EDW 优化嵌入方向再映射成自然语言谓词；本方法无监督，每 prompt 只需一次 LLM 调用。
- **一正一负**：许多簇描述有意思的 Gemini 行为（token 预算意识、现实 vs 角色扮演判断、无限循环）；从 user 特征预测 thought/response 特征则大多失败。作者已停手，欢迎社区接手。

## 方法管线

1. **选数据集**：挑一个模型对话（transcript）数据集。
2. **切片段**：把每条对话切成 user turns、thoughts、assistant responses 三类。
3. **特征化**：让黑箱 LLM autorater 对每个片段生成 10-20 条 "feature"（片段中显著/有趣/重要的方面）；autorater 一次只看一个片段。
4. **嵌入**：为每条 feature 取语义嵌入。
5. **聚类**：分别对 user、thought、response 三路嵌入做聚类。
6. **命名**：每簇随机给语言模型 100 条 feature，要求产出"一个约 5 词的简洁标签，概括这些 feature 的共同主题"。

prompt 上，autorater 先看一批示例 feature 定"感觉"，再要求优先满足三点：**interestingness**（是否代表新颖或意外的行为）、**appropriate abstraction**（既不过窄到只适用少量样本，也不过宽到失去区分度）、**uniqueness**（宁可少而不同）；并约束只用小写字母 a-z 使聚类更干净。

## 深度分析

### 黑箱 SAE：不碰激活也能把文本特征化

作者说他们"有时候把这项工作想成一种 black box SAE"。SAE 拿激活做稀疏重建、得到成千上万个隐方向，再用 LLM 给方向写解释；本方法跳过激活，直接让 LLM 把文本转写成 feature 再聚类。

收益是**解释为什么这个特征适用更清楚**、**特征层级更高**、**不需要模型内部**；代价是**不能用它 steering**（与激活无关）且**计算更贵**。

### 无监督 vs EDW：一次调用换来的简洁

作者是做完之后才发现 EDW（Explaining Datasets in Words: Statistical Models with Natural Language Parameters）思路相近：EDW 在嵌入空间优化方向再映射成自然语言 feature（"predicates"），所以两者**输出形态相似**。

差别在调用成本与监督信号：本方法每 prompt 只需一次 LLM 调用、无监督、不需要一个目标来优化嵌入方向。取舍因此清楚——**要最小化某个特定统计模型的误差**，EDW 更合适；**只想要低成本看一眼分布里有什么行为**，本方法更直接。但作者**没做实验对比**，这是设计层面推断。

### 阴性结果：thought / response 几乎无法由用户话轮预测

全文信息量最大的实验：对**最常见的 1000 个 thought 簇与 assistant 簇**训练 logistic regression probe，输入是稀疏二值向量（出现的 feature 置 1），报告 test F1（precision 与 recall 的平均）。该指标难在 precision——probe 必须有极低的假阳率，因为多数 transcript 上该特征本就不出现。结果是"大多数情况下效果不好"。

解读：

- **thought/response 层与用户话轮只有很弱的可预测关系**：模型内部发生什么不像用户输入的直接函数，更像由模型自身状态与采样过程驱动。
- **只看输入侧的评估会系统性漏掉行为**：若审计只看用户话轮去推演 agent 内部在做什么，就会错过 thought 层最有趣的信号；评估必须**直接观察 thought 与 response**。
- **对 coco / simulated-agent 类研究是提醒**：依赖用户侧输入建模或复现 agent 行为时预测上限可能很低；thought/response 应是一等观测对象，而非派生量。

（以上解读为本文整理，原文只报告了 probe 指标与定性结论。）

### 方法的边界

- **粒度受簇标签限制**：每簇压成约 5 词标签，簇内差异被抹平；命名质量取决于随机抽出的那 100 条 feature。
- **特征层级偏粗**：按对话块而非 token 产出，每上下文 20-30 条 feature，远少于 SAE 的数千，无法细粒度定位。
- **不能干预，且成本更高**：与模型计算无关，无法像 SAE 方向那样 steering；每片段还要一次 autorater 调用。
- **"有意思"由 LLM 打分**：每次给 10 个簇附示例打 1-100 分以保持校准，但仍是 LLM 判断；且会过滤掉泄露用户信息、或只描述 Gemini thought 特异部分的簇。

## 实践启示

1. **把定性发现当成独立一层能力**：先用这类方法回答"分布里存在哪些行为"，再为有价值的行为写定量指标与 benchmark。
2. **优先聚类 thought 层**：model thoughts 里有许多有意思的高层特征，中间档与低档簇在定性上仍是"好"特征，不要只看最有趣那一档。
3. **分片段类型聚类，不要混池**：user / thought / response 各自聚类，否则用户侧意图与模型侧行为互相污染，簇的可解释性会塌掉。
4. **在 autorater prompt 里显式约束三件事**：interestingness、appropriate abstraction、uniqueness；字符集约束（只用 a-z）可降低聚类噪声。
5. **不要用输入侧 probe 代替直接观测**：从用户话轮预测 thought/response 的 F1 会很低，评估、审计与红队设计应把 thought 与 response 作为直接观测对象。

→ [原文存档](https://www.alignmentforum.org/posts/WAZWA6FPQvH8okouJ/llm-driven-feature-discovery)

## 相关实体

- Sparse Autoencoders — 本文对照的白箱方法
- [Natural Language Autoencoders](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-nla-natural-language-autoencoders.md) — 用自然语言解释模型内部
- [Mechanistic Interpretability](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/mechanistic-interpretability.md) — 白箱可解释性大框架
- [Activation Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/activation-engineering.md) — 本方法因缺激活方向而做不到的事

## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关: Agent 架构

---

