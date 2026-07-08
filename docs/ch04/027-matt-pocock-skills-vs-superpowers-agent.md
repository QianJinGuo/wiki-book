# Matt Pocock Skills vs Superpowers：Agent 技能工程的两条路线

## Ch04.027 Matt Pocock Skills vs Superpowers：Agent 技能工程的两条路线

> 📊 Level ⭐ | 2.5KB | `entities/matt-pocock-skills-vs-superpowers-comparison.md`

# Matt Pocock Skills vs Superpowers：Agent 技能工程的两条路线

> Matt Pocock 的 skills 仓库（15.4 万 star）代表了与 Superpowers（24.7 万 star）截然相反的 Agent 技能工程哲学：**最小锚点 vs 强制流程**。

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

## 关联

- [Superpowers 三器合一](../ch05/090-ai-coding.html) — Superpowers 在 Comet+OpenSpec 流水线中的角色
- [Agent vs Workflow 控制权连续谱](ch04/597-agent-vs-workflow.html) — "控制权交给谁"是这场路线之争的本质

---

