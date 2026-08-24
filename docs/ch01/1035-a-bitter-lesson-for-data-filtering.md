# A Bitter Lesson for Data Filtering

## Ch01.1035 A Bitter Lesson for Data Filtering

> 📊 Level ⭐⭐ | 6.1KB | `entities/a-bitter-lesson-for-data-filtering-e8807d.md`

# A Bitter Lesson for Data Filtering

## 摘要

本文（arXiv:2605.19407，作者 Christopher Mohri、John Duchi 与 Tatsunori Hashimoto）通过面向"高计算、数据稀缺"（high compute, data-scarce）区间的新 scaling studies，考察了大模型预训练中的数据过滤问题。核心发现反直觉且极具冲击力：当算力足够时，最好的数据过滤器就是不过滤数据——充分训练的大参数模型不仅能容忍低质量与干扰（distractor）数据，反而会从中受益。这一结论直接挑战了"预训练必须过滤出高质量数据"的主流信念，并与 Rich Sutton 的 "Bitter Lesson" 形成深刻呼应。

## 核心要点

- **反直觉的核心结论**：在足够算力支持下，"the best data filter is no data filter"——过滤本身不再是预训练的必要条件。
- **大模型从"差"数据中获益**：sufficiently trained 的大参数模型不仅容忍低质量和干扰数据，反而利用它们获得更好的训练效果。
- **挑战主流信念**：论文针对"只保留高质量信息对预训练至关重要"这一普遍认知提出了实证层面的质疑。
- **与 Bitter Lesson 一脉相承**：与 Rich Sutton 的经典论断一致——不要过度注入人类归纳偏置，让 scale 与学习算法自己发挥作用。
- **数据过滤是一种先验注入**：过滤规则编码了人类对"什么数据值得学"的判断，本质上是另一种形式的人为 inductive bias。
- **明确的适用边界**：结论限于 high compute、data-scarce 场景；数据丰富、算力受限的常规训练中过滤仍有价值。
- **研究定位**：arXiv 预印本（2026-05-19 提交），cs.LG/cs.AI，完整方法学与消融细节有待全文与同行评审确认。

## 深度分析

### 1. 核心发现：算力足够时，不过滤就是最好的过滤

论文通过专门面向 high compute、data-scarce 区间的 scaling studies 发现，随着训练算力与模型规模增长，数据过滤带来的收益逐渐消失甚至转为负值。作者给出的解释方向是：大模型在充分训练后具备从"噪声"中自行提取信号的能力，那些名义上低质量或被当作干扰（distractor）的数据，实际上提供了更宽的分布覆盖与额外的正则化信号，反而有助于模型学到更鲁棒的表示。

### 2. 与 Rich Sutton "Bitter Lesson" 的思想呼应

Rich Sutton 的经典教训是：AI 研究数十年的经验表明，把人类知识直接内建到系统里往往先赢后输，而依靠通用方法（搜索、学习）+ 规模化算力的路线最终胜出。本文把这一逻辑延伸到了数据工程：过滤规则正是"把人类对数据质量的直觉判断注入学习过程"的一种形式。论文的实验结果表明，当算力足够大时，这类人为先验不仅多余，甚至可能损害模型从原始数据分布中学习的能力——这正是 Bitter Lesson 在数据维度上的又一次印证。

### 3. 数据过滤作为先验注入：人工干预的隐性成本

任何过滤 pipeline 都隐含一组关于"什么值得学"的假设：质量打分器、启发式规则、去重阈值，本质上都是把人类归纳偏置（inductive bias）写进训练流程。其隐性成本包括：过滤标准的构建与维护需要大量人力；质量判据（如困惑度、规则打分）往往与下游任务目标错位；更关键的是，过滤可能系统性丢弃对泛化有用的长尾信息。论文的发现提示：在 scale 足够大的前提下，让模型直接面对未过滤数据、自行完成信号提取，可能比人工设计的筛选更优。

### 4. 边界条件：high compute、data-scarce 而非 data-rich、compute-limited

论文结论不能无条件外推。研究明确限定在"高计算、数据稀缺"区间——即算力充裕、但可用数据（尤其是高质量数据）相对不足的极端场景，此时保留一切数据是在为模型提供更多学习信号。而对于数据丰富、算力受限的常见预训练场景，过滤仍是控制训练成本、提升样本效率的必要手段。理解实验设定是正确应用结论的前提：把"不要过滤"直接照搬到数据丰富的 pipeline，可能适得其反。

## 实践启示

1. **按算力与数据比例决策过滤策略**：先判断自己处于"高计算-数据稀缺"还是"数据丰富-计算受限"区间；前者考虑放宽甚至移除过滤，后者保留必要的质量筛选。
2. **保留更多长尾与"低质量"数据**：在大规模预训练中，不再默认低质量数据是负担，可将其视为额外的分布覆盖与正则化来源。
3. **用 scaling studies 代替直觉决策**：在调整过滤 pipeline 前，先做小规模、变算力的对比实验，观察"过滤与否"随规模增长的趋势，用数据而非信念指导决策。
4. **重新审视数据工程中的高成本环节**：去重、质量打分、启发式过滤等环节既消耗算力又可能破坏泛化能力，值得逐项验证其真实收益。
5. **关注全文与后续同行评审**：当前仅有 abstract，完整实验设置、数据规模与消融细节需阅读 PDF 确认；重大 pipeline 变更应等待更充分的证据。

## 相关实体

- [Agent Executor Googles Distributed Agent Runtime Da1Bb4](../ch03/006-agent.html)
- [Architecture Data Foundations For Ai Powered Search](ch01/1195-architecture-data-foundations-for-ai-powered-search.html)
- [Running An Ai Native Engineering Org](ch01/060-running-an-ai-native-engineering-org.html)
- [Minimax Agent Team Mavis Owner Worker Verifier](ch01/1533-owner-worker-verifier.html)
- [打造可靠的 Ai 编程环境Claude Code Hooks 完整开发者指南 V2](../ch03/085-claude-code.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/a-bitter-lesson-for-data-filtering-e8807d.md)

---

