# Jane Street — 形式化方法与编程的未来

## Ch12.111 Jane Street — 形式化方法与编程的未来

> 📊 Level ⭐⭐ | 3.9KB | `entities/jane-street-formal-methods-future-programming.md`

# Jane Street — 形式化方法与编程的未来

> Source: [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jane-street-formal-methods-future-programming.md)

## 概述

Jane Street 工程师在 2026-06 发表的一篇立场文章，**核心论点是 Agent 编码时代改变了形式化方法（formal methods）的成本/收益结构**：随着 LLM 编写代码越来越快、Agent 自动执行 build/test loop，人工写的代码量增加 vs 验证时间预算未变 → 形式化验证从"奢侈品"重新成为"必要安全网"。

## 核心论点（v=7, c=7, v×c=49）

**关键 framing**: 文章提出"形式化验证的双重作用"——
1. **验证 Agent 生成的代码**: 防止 LLM 在无人监督下输出有 bug 的代码
2. **规范（spec）本身是 AI 时代的资产**: 形式化 spec 比非形式化文档更适合 Agent 推理

> "The specification *is* the asset — formal specs become the high-bandwidth interface between humans and AI agents."

**为什么现在变重要**：
- 代码量增速 >> 验证时间（Agent 可以一晚写 1000 行，PR review 仍需人力）
- 类型系统 + TLA+/Coq/Lean 等轻量形式化工具的成熟
- "Agent ↔ Spec" 工作流比 "Agent ↔ 自然语言" 更可证伪

## 关键洞察

1. **Spec 回归 = 程序验证 = Agent 时代的形式化复兴** — Jane Street 自己用 OCaml + formal specs 多年（反例：Mirage、async RPC stack）；现在这模式从 trading 扩展到 LLM 工作流
2. **代价结构变了** — 过去：spec 写起来贵（"为什么不用 Rust 类型系统凑合？"）；现在：spec 写起来对 Agent 而言极便宜（LLM 可以从形式化 spec 生成实现）
3. **不只是找 bug** — formal spec 在 Agent loop 中是"规约锚点"，可被回归测试、formal refutation、property-based testing 复用
4. **门槛降低** — Lean 4 + TLA+ 的开发者体验显著改善；Jane Street 指出一些 internal tool 已能让 trader 直接写 spec 而非代码

## 实践启示

- **形式化 spec 不再是"学术玩具"**: Agent 时代它成为"如何把自然语言意图转成可执行代码"的最佳中间层
- **类型 + 性质测试 + formal spec 是三段式**: 类型层面（TypeScript/Rust）+ property-based（fast-check）+ 形式化（Lean/TLA+）
- **从哪里入手**: 选最影响安全的边界（auth、payment、concurrency）写 spec；不要一上来对所有代码 formalize

## 与其他工作的关联

- [Claude Code 大型代码库 Harness](../ch03/075-claude-code.md) — 同主题 AI 编程 vs 验证
- [AI Friendly 架构](../ch05/022-ai-friendly.md) — 形式化 spec 是 AI-friendly 的一种表达
- [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — spec 即 harness 的一种特殊形式

## 原文链接

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jane-street-formal-methods-future-programming.md)

---

