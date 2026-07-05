# Yoonho Lee: Text Optimization as a Legitimate Learning Mechanism

## Ch01.414 Yoonho Lee: Text Optimization as a Legitimate Learning Mechanism

> 📊 Level ⭐⭐ | 10.9KB | `entities/yoonho-lee-text-optimization-as-legitimate-learning-mechanism.md`

> → [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/yoonholee-text-optimization-as-legitimate-learning-mechanism.md)

# Yoonho Lee: Text Optimization as a Legitimate Learning Mechanism

## 一句话总结

Yoonho Lee (BAIR) 在 2026-06-08 发表立场论文，把 text optimization（prompts/memory/retrieval/harness 等 mutable text layer）作为与 weights optimization 等价但**独立且互补**的学习机制，三层论证 + 多个实验支持。

## 核心论证（三层）

### 1. Text optimization 是合法的 update mechanism

- 部署中的 AI 系统不再是隔离的 parameter vector，而是 stateful compound AI system（参引 BAIR 2024 博客）
- 行为调节 state 包括：weights（gradient-based）+ prompts + memory + retrieval indices + harness code
- 关键问题不是"哪个好"，而是"**哪类信息应该更新到哪个 target**"
- Text optimization 和 weight optimization 在功能上**扮演相同角色**：根据新信息改变未来行为

### 2. Text optimization 在低数据场景下 sample-efficient 优势巨大

- Kolmogorov 风格压缩直觉：短而高似然的 text 描述长度低，对应有利的归纳偏置
- 引用 3 个 arxiv 实证：2103.08493、2012.15723、2507.19457 — 文本优化在低数据 regime 比权重优化**高数个数量级**的 sample efficiency
- 实践模式：用 text layer 来 eliciting and composing 已有能力，再蒸馏回 weights（参引 Anthropic Claude's Constitution、OpenAI Deliberative Alignment）

### 3. Text optimization 开启新的 scaling axis: update-time compute

- 类比 inference-time scaling 让 model 在单次 inference 投入更多 compute
- Reflective text optimization 让 system 在**单次 experience** 中投入更多 compute 学习
- 这是一个新的 axis，与训练时 compute scaling、推理时 compute scaling **正交**

## 关键概念：Text Layer

"By text optimization, I broadly mean methods that modify the mutable text layer around a model: prompts, context, filesystem state, memory, retrieval databases, and model harnesses."

即围绕 model 的所有可修改文本制品 — 这与 agent harness 的范畴几乎完全重合。

## 与现有实体的关系（不同 layer 的共存）

| 维度 | 本 entity (Yoonho Lee) | GEPA optimize_anything | Agent Harness Engineering Survey |
|------|----------------------|------------------------|----------------------------------|
| 层 | 理论立场 / 论证 | 工具 API 实现 | 系统综述（学术） |
| 主张 | Text opt 是合法学习机制 | 提供 universal API 优化任何 text | ETCLOVG 七层 taxonomy |
| 实证 | 引用 3+ arxiv | 8 领域 SOTA | 30+ paper 综合 |
| 时间 | 2026-06-08 | 2026-02-18 | 2026-05-15 |

**Yoonho Lee 的独特价值**：把"text optimization"作为**学习机制**的理论合法性确立，这是上游论证。GEPA 是在此合法性下设计的工具，Harness Survey 是把这些机制系统化。

## 引用要点

- "We should treat text and weights as siblings, with different cost/capacity/failure tradeoffs" — Yoonho Lee, BAIR
- "Good text updates are **compact patches to a pretrained world prior**" — 文本优化的归纳偏置
- 实践蒸馏循环：text layer 优化 → 蒸馏到 weights（**新一阶段的 scaling 范式**）

## 实践启示

1. **不应用 weight-only 视角看 agent** — agent 系统的"学习"很大一部分发生在 text layer
2. **sample efficiency 在生产中至关重要** — text optimization 在 few-shot 场景比 fine-tuning 强
3. **update-time compute 是新增 axis** — 应与 inference-time compute scaling 一起纳入架构设计
4. **选择 update target 是产品决策** — 不同信息类型应更新到不同 target（prompt vs memory vs retrieval vs weights）

## 相关研究（出自原博客）

- Anthropic Claude's Constitution（text layer 蒸馏到 weights 的早期范例）
- OpenAI Deliberative Alignment（text layer alignment → weights）
- arxiv 2103.08493、2012.15723、2507.19457（text optimization sample efficiency 实证）

## 立场 vs 工具的差异

| 角度 | 立场（Yoonho） | 工具（GEPA） |
|------|---------------|-------------|
| 解决的问题 | "text opt 是否合法" | "如何实施 text opt" |
| 受众 | ML 研究者 + 决策者 | 工程师 |
| 输出 | 论证 + 范式转变 | API + 8 领域基准 |

两者**互补**：立场为工具提供合法性背书，工具为立场提供落地路径。

## 深度分析

**1. Text Optimization 重塑了"学习"的定义边界**

传统 ML 理论将学习等同于 weight update，但 Yoonho Lee 的论证将学习扩展到任何"根据新信息改变未来行为"的操作。这不仅是术语游戏，而是打开了设计空间：信息应该写入 weights 还是 text layer？论文的 routing 框架（stable → weights, volatile/local/auditable → text）本质上是信息生命周期管理理论。

**2. 低数据场景的 sample-efficiency 优势有深层理论支撑**

论文援引 Kolmogorov 风格压缩直觉：短而高似然的 text 描述长度低，对应有利归纳偏置。这与 PAC-Bayes 框架一致：text 作为 hypothesis 的描述长度远短于 weight delta，因此在小样本下更易找到正确假设。2103.08493、2012.15723、2507.19457 三个实证研究提供了量化支撑。

**3. Update-time compute 是第三 scaling axis，但本质是"可回滚的决策"**

类比 inference-time scaling 让单次推理投入更多 compute，update-time compute 让单次经验的学习投入更多 compute。关键在于 text space 的"fork and compare"特性：SGD 的参数向量每次更新都会提交，而 text optimization 可以提出多个假设、测试、然后选择接受或拒绝。这在失败代价高的场景（医疗、法律、具身智能）有独特价值。

**4. "Weights 是唯一真正学习"的认识论根源**

论文追溯到 GOFAI 时代的历史反弹：当年符号系统假设过度强调显式操作，神经网络证明了"知识可以住在 weights 里"。但现在 pendulum 摆过头了 — 人类认知本身大量依赖外部制品（书籍、论文、代码），Hutchins 的 ship navigation 和 Clark & Chalmers 的 Extended Mind 都支持"认知边界可超出单体内部状态"。这为 text as learning target 提供了认知科学层面的合法性。

**5. 实践蒸馏循环揭示了 staged learning 新范式**

Text layer 作为"staging ground"：先用它测试和提炼行为假设，再决定是否蒸馏到 weights。Anthropic Constitution、OpenAI Deliberative Alignment、Cursor、Hippoocratic AI 等案例表明这是当前 SOTA 的主流做法。这本质上是 dual-process 理论在系统层面的实现：fast text-layer adaptation + slow weight consolidation。

## 与现有 [Hermes Agent Skill Crossover Optimization](ch04/255-skill.md) 的关系

- hermes-agent-skill-crossover-optimization = 工程实践（Hermes agent 中 skill 进化）
- yoonho text-optimization = 理论立场（text 作为合法学习目标）
- 共存：理论 → 实践，跨层 cross-link

## 实践启示

1. **建立信息路由意识**：不是所有信息都应写入 weights — volatile/local/auditable 信息（用户偏好、临时 context、正在测试的假设）应留在 text layer，只有 stable/generalizable 的知识才值得 amortization 成本
2. **在小样本场景优先 text optimization**：当训练数据稀缺或获取成本高时（如垂类 Agent、冷启动），先通过 text layer eliciting 已有能力，而非立即尝试 fine-tuning
3. **设计可检视的 text artifact**：text layer 的核心优势是 auditable — 确保 text update 可被检查、roll back 和 composition，这是 weights update 无法提供的透明度
4. **利用 update-time compute 做 hypothesis testing**：在高风险决策场景（医疗、法律、金融），用 text space 的 fork-and-compare 能力在提交前充分测试多种行动方案
5. **构建 text-to-weights distillation pipeline**：将 text layer 视为 staging ground，设计从 text 到 weights 的定期 distillation 机制，把成功的 text patch 转化为 model 的长效能力

---

