# Is Grep All You Need? — 检索 × Harness × 交付方式耦合三元组（PwC 论文 arXiv 2605.15184 解读）

## Ch05.044 Is Grep All You Need? — 检索 × Harness × 交付方式耦合三元组（PwC 论文 arXiv 2605.15184 解读）

> 📊 Level ⭐⭐ | 11.1KB | `entities/is-grep-all-you-need-pwc-retrieval-harness-coupling.md`

# Is Grep All You Need? — 检索 × Harness × 交付方式耦合三元组

## 论文与作者

**论文**：*Is Grep All You Need?*（来自普华永道，arXiv 2605.15184）

**核心问题**：面对一堆历史对话或文档，到底是上 **grep** 这种字面检索，还是上 **vector** 这种语义检索？社区主流答案常常是"**vector 一定更高级**"。

**论文给出的更扎心结论**：是，但有严格前提。

## 相关实体
- [Lucasfcostacom Blog Backpressure Is All You Need](/ch01-007-backpressure-is-all-you-need/)
- [Google Agentic Rag Sufficient Context Agent Framesqa](/ch01-297-google-agentic-rag-sufficient-context-agent-framesqa-90/)
- [Ai Native Startup Cyberfund Guide](/ch04-449-how-to-build-an-ai-native-startup/)
- [Harness Engineering Comprehensive Guide Conardli](/ch05-009-harness-engineering-综合性指南-conardli-系列-含-beautiful-article/)
- Huggingface Ai Agent Glossary Model Scaffolding Harness Tool Skill Subagent

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/is-grep-all-you-need-pwc-retrieval-harness-coupling.md)

## 三个核心实验发现

### 1. Inline 交付时 grep 10/10 赢 vector（差距最高 23.3pp）

在 **LongMemEval** 这类长记忆对话问答上：
- **inline 交付**时 grep 在 **10/10 个 harness-model 组合**里都赢过 vector
- 差距**高达 23.3 个百分点**

**LongMemEval 是什么**：长记忆对话 QA 基准。论文采用其中 **116 题的 LongMemEval-S 子集**，覆盖 6 个类别。

### 2. 改成交付到磁盘（read）后 vector 反超

**关键反直觉**：只要把"**工具结果直接塞回上下文**"换成"**写到磁盘让模型自己 read**"：
- **5/10 的组合里 vector 反过来赢了 grep**
- **索引完全没动**

### 3. 同样 Claude Opus 换 harness 准确率差 16pp

**核心洞察**：**harness 的撬动力，可与换检索器、换模型相提并论**。

## 核心概念定义

| 概念 | 含义 |
|---|---|
| **LongMemEval** | 长记忆对话 QA 基准，116 题 LongMemEval-S 子集，覆盖 6 个类别 |
| **inline 模式** | 工具调用执行结果**作为 tool_result 消息原样附在对下文里**，模型下一步推理可直接看到完整结果 |
| **file-read 模式** | 工具结果**写到磁盘，让模型自己 read** 文件 |

## 主实验结论

**在主实验的内联模式下，grep 在所有工具模型组合中都优于向量检索**。

## 论文深层主张

> "**retrieval × harness × delivery 是一个耦合三元组**。社区习惯于把检索器、orchestration、context engineering 当作独立设计选项分别消融，但这篇论文证明**它们之间存在非线性相互作用**——任何'消融实验'得到的单变量结论都很难外推到生产。"

**这是论文最具方法论价值的主张**：
- 三个变量**非线性耦合**
- 单独消融一个变量得到的结论**不可外推**
- 评估方法论本身的修正

## 论文标题的精确答案

> "Is grep all you need?" 的答案是：**是，但有严格前提**：
- ✅ **inline 交付**
- ✅ **长记忆对话**
- ✅ **字面证据型问题**
- ❌ **一旦换任何一个变量，结论可能反转**

## 论文呼吁的研究方向

务实且可执行：
1. **混合检索策略** — 按问题类型在 grep / vector 间切换
2. **覆盖更多厂商 CLI**
3. **把"非聊天语料"也纳入对比**

## 对 Agent 工程师的核心借鉴

> "**别再问'该用 grep 还是 vector'，先决定 harness 把结果交给模型的方式，再做检索器选型。**"

**决策顺序翻转**：
- ❌ 旧：先选检索器 → 再配 harness → 最后定交付方式
- ✅ 新：**先定交付方式**（inline vs file-read）→ **再做检索器选型**（grep vs vector）

**决策顺序变化背后的逻辑**：
- inline 模式下 grep 优势大（字面证据直接喂给模型）
- file-read 模式下 vector 优势大（语义索引 + 模型主动探索）
- **交付方式决定检索器最优解**

## 与已有实体的关系

- claude md init anthropic architecture — Anthropic harness 架构
- `Mac Multi Agent Coding Skills Hooks Harness` — Skills + Hooks 两层 harness
- `Agent Harness Context Management Working Set` — 上下文管理
- **本论文独特价值**：用**量化实验**证明 **harness 设计选择（特别是交付方式）是与检索器选型同等量级的决策**

## 工程启示

### 1. 别再做"消融实验"幻觉

```
传统消融：
  A. grep 准确率 80%
  B. vector 准确率 75%
  结论：grep 更好 → 选 grep

论文证明这是错的：
  实际可能是 A. grep+inline = 80%
             B. vector+inline = 75%
             C. grep+file-read = 60%
             D. vector+file-read = 85%
  → vector+file-read 是最优解
```

### 2. 评估方法论必须升级

- **不能只报告检索器准确率** — 必须同时报告**交付方式**
- **不能只比较模型 — 必须同时比较 harness 组合**
- **多变量联合优化** 才接近生产真相

### 3. 选型决策树（推荐）

```
Q1: 你的 harness 怎么交付工具结果？
├── inline（直接进 context）→ grep 优先
└── file-read（写到磁盘让模型读）→ vector 优先

Q2: 问题是字面证据型还是语义型？
├── 字面证据型 → grep
└── 语义型 → vector

Q3: 长记忆对话还是一次性任务？
├── 长记忆（跨多次 session）→ grep 优势
└── 一次性 → 取决于交付方式
```

## 核心金句

- "**Grep 搜索竟然比 RAG 还好用？**"
- "**Vector 一定更高级吗？不一定**"
- "**Inline 交付时 grep 10/10 赢 vector，差距最高 23.3pp**"
- "**索引完全没动，只改交付方式，5/10 组合结论反转**"
- "**Harness 的撬动力，可与换检索器、换模型相提并论**"
- "**检索 × harness × delivery 是一个耦合三元组**"
- "**它们之间存在非线性相互作用**"
- "**任何'消融实验'得到的单变量结论都很难外推到生产**"
- "**别再问'该用 grep 还是 vector'，先决定 harness 把结果交给模型的方式**"
- "**决策顺序翻转：先交付方式，再检索器**"

## 深度分析

- **耦合效应颠覆单变量评估范式**：论文最核心的方法论贡献在于揭示了 retrieval × harness × delivery 三者的非线性相互作用。传统 Agent 系统评估往往先固定 harness 和 delivery 方式，再单独比较检索器——这种单变量消融得到的结论无法外推到生产环境，因为三个变量之间存在显著的交互效应 。

- **inline/file-read 交付方式是关键分水岭**：实验显示仅改变工具结果的交付方式（inline vs file-read），就能让 5/10 的 model-harness 组合得出相反的检索器结论。这说明交付方式不是实现细节，而是与检索器选型同等量级的架构决策 。

- **grep 在字面证据型任务中的结构性优势**：当问题需要定位精确字符串或代码片段时，grep 的准确率在 inline 模式下显著优于 vector——因为检索结果直接作为文本片段返回，模型无需再做语义解码，而 vector 的语义匹配反而可能引人无关上下文 。

- **LongMemEval 基准揭示了跨 Session 记忆的真实挑战**：长记忆对话场景要求模型在跨越多个历史 Session 的上下文中定位信息，这种场景对检索和 harness 都提出了与一次性任务截然不同的要求，grep 的优势在这种场景下尤为突出 。

- **社区认知偏差与本文的矫正意义**：主流观点倾向于认为 vector 检索在语义理解上天然优于 grep，但本文通过系统性实验证明这种认知在特定条件下成立，却不可泛化。这对 Agent 工程师的实践决策有重要纠偏价值 。

## 实践启示

- **拿到新项目时，先问 harness 的交付方式**：在做检索架构选型之前，必须先明确工具结果是通过 inline 消息还是 file-read 方式传递给模型——这直接决定了应该优先考虑 grep 还是 vector，而不是凭直觉选择更"高级"的语义检索 。

- **建立双轨检索策略**：对于字面证据型查询（如代码定位、日志搜索、配置查找）使用 grep；对于语义理解型查询（如概念解释、摘要生成）使用 vector，并在 harness 层实现自动路由切换 。

- **评估 Agent 系统时必须报告完整的 triplet 配置**：在评测报告中不仅要记录检索器类型和模型，还要记录 harness 的交付方式，否则结论无法与其他系统比较，也不可复现 。

- **警惕"消融实验幻觉"**：如果只在一种 harness 配置下得出 grep vs vector 的结论，不要将该结论推广到其他 harness 配置。正确的做法是为每种实际使用的 harness-delivery 组合分别做评测 。

- **将交付方式纳人架构评审**：在设计 Agent 系统时，应该像对待模型选型和检索器选型一样，将工具结果的交付方式（inline vs file-read）纳人正式的架构评审决策点，而不是作为实现细节事后补充 。

## 关联阅读

- `Agent Harness Context Management Working Set` — Harness 上下文管理 Working Set 模式，与本文交付方式决策呼应
- `Harness Engineering Framework` — Harness 工程框架，提供了 triplet 之外的工程化视角
- `Protocol H Hierarchical Agentic Rag Enterprise` — Agentic RAG 企业级协议，与检索器选型直接相关
- `Better Harness Eval Trace Methodology` — Harness 评估方法论，呼应本文的多变量联合优化主张

---

