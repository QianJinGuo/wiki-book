# Matt Pocock Skills vs Superpowers：Agent 技能工程的两条路线

## Ch04.529 Matt Pocock Skills vs Superpowers：Agent 技能工程的两条路线

> 📊 Level ⭐⭐ | 4.6KB | `entities/matt-pocock-skills-vs-superpowers-comparison.md`

# Matt Pocock Skills vs Superpowers：Agent 技能工程的两条路线

> Matt Pocock 的 skills 仓库（15.4 万 star）代表了与 Superpowers（24.7 万 star）截然相反的 Agent 技能工程哲学：**最小锚点 vs 强制流程**。

→ [深度原文存档：四大支柱与元方法论](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/12-行-vs-689-行-mattpocock-skills-与-superpowers-的路线之争.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/matt-pocock-skills-vs-superpowers.md)

## 核心哲学对比

- **Superpowers**：假设模型会偷懒、会给自己找理由，把每条退路堵死。hook 从会话第一秒上强度
- **Matt Pocock Skills**：假设模型大概率会做对，skill 只负责在关键处给一个最小的锚点。21 个 skill 手动触发，13 个禁用自动调用

## 工程流水线

五步链路：/grill-with-docs（连环拷问）→ /to-prd（合成 PRD）→ /to-issues（切分 issue）→ /implement（独立执行）→ /code-review（审查收官）

## 三个精巧设计

1. **CONTEXT.md 项目词典**：把领域驱动设计的通用语言概念搬给 agent，让 agent 用更少 token 更精准沟通
2. **disable-model-invocation 隐藏触发**：21 个中有 13 个不进入模型上下文，配 /ask-matt 路由 skill 兜底
3. **最小锚点原则**：TDD 仅 36 行，引用经典软件工程（Kent Beck、Ousterhout 深模块），把经典书压缩成 agent 可执行形态

## 量化对比

| 维度 | Matt Pocock | Superpowers |
|------|------------|-------------|
| 总行数 | 1,321 | 3,300+ |
| Skill 数量 | 21 | 14 |
| TDD skill | 36 行 | 371 行 |
| Writing-skills | — | 689 行（红旗表） |
| 触发 | 手动斜杠占多数 | hook 强推 |
| 控制假设 | 最小锚点 | 堵死退路 |
| GitHub Stars | 15.4 万 | 24.7 万 |

## 四大支柱框架（源码深度解析）

新文章以 v1.1.0 源码为准，提炼出 mattpocock/skills 的四根设计支柱:

1. **Grilling（12 行）**：解决"Agent 没做我想要的"。引用《Pragmatic Programmer》"No-one knows exactly what they want"。区分 fact（agent 自查）vs decision（需用户拍板）。grill-me（无 codebase）和 grill-with-docs（有 codebase）都委托给 grilling 原语。

2. **CONTEXT.md**：解决"Agent 太啰嗦"。在 grilling 过程中编项目词典，来自 Eric Evans《Domain-Driven Design》ubiquitous language 概念。配套 domain-modeling（74 行）主动维护。

3. **TDD + 反馈回路**：解决"代码不 work"。tdd 仅 36 行，核心是红绿循环加三个反模式（Implementation-coupled、Tautological、Horizontal slicing），解法是 vertical slice / tracer bullet。配套 diagnosing-bugs（134 行）拆成 6 个 phase。

4. **深模块/架构**：解决"代码成了泥球"。引用 Kent Beck 和 Ousterhout（The best modules are deep）。codebase-design（114 行）定义 Module、Interface、Implementation、Depth（as-leverage）、Seam、Adapter、Leverage、Locality。

四根支柱全是经典软件工程书压成 agent 可执行的最小形态。

## Writing-Great-Skills 元方法论

83 行正文 + GLOSSARY.md，核心美德是 predictability（过程一致而非输出一致）:
- **Leading words**：利用模型预训练知识的词，如 fog of war、tracer bullet
- **Progressive disclosure**：细节委托给上层 skill
- **Completion criterion**：反模式是 premature completion
- **Negation**：不要写"别想大象"这类否定式指令

解释了 grilling 12 行能工作的三个原因：leading words、progressive disclosure、明确 completion criterion。

## 关联

- [Superpowers 三器合一](../ch05/095-ai-coding.html) — Superpowers 在 Comet+OpenSpec 流水线中的角色
- [Agent vs Workflow 控制权连续谱](ch04/620-agent-vs-workflow.html) — "控制权交给谁"是这场路线之争的本质

---

