# Jane Street — 形式化方法与编程的未来

> 📊 Level ⭐⭐ | 7.8KB

> Source: [原文存档](https://blog.janestreet.com/formal-methods-at-jane-street-index/)

## 概述

Jane Street 工程师在 2026-06 发表的一篇立场文章，**核心论点是 Agent 编码时代改变了形式化方法（formal methods）的成本/收益结构**：随着 LLM 编写代码越来越快、Agent 自动执行 build/test loop，人工写的代码量增加 vs 验证时间预算未变 → 形式化验证从"奢侈品"重新成为"必要安全网"。

## 核心论点

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

## 深度分析

### 一、成本结构反转：写代码变便宜，相信代码变贵

原文给出历史单价：seL4 花 25 人年验证 8,700 行 C，每行约对应 23 行证明、半个工作日。 这是不可并行的人力。若 Agent 让产出变 10 倍而验证带宽不变，待验证队列即增 10 倍——约束从"写得出来吗"转向"敢不敢信"。

人工 review 是 O(n)：每行新增都要重读。形式化 spec 打破线性，因其成本挂在**不变量**而非**实现行数**上：一条"账户总额守恒"约束一万个生成变体，∀x.P(x) 只证一次，排除的错误空间却是组合性的。边际验证成本随代码量趋零，人的阅读成本恒等于代码量。

### 二、为什么 spec 是可证伪的接口

差别不是精度，是**有没有裁决者**。

自然语言意图不可证伪。"注意边界情况"没有任何程序能判定，错误延后到生产才显形。类型检查器、TLC、Lean 内核则是机器 oracle：输出"通过"或"一个反例"。这让 Agent 能**自闭环**——生成、检查、被反驳、修复——无需人充当裁判：判断被换成了机器可执行的判断。

spec 是**模型无关的资产**：代码随模型换代重生成，spec 不贬值。实现变成消耗品后，固定资产从代码转移到 spec——这才是"specification is the asset"的严格含义。

### 三、分层的现实路径

形式化是成本与保证强度同增的阶梯：

- **L0 类型系统**——成本近零，给 ∀ 级保证。原文关键经验是 OxCaml 的类型层数据竞争检查：能阻止数据竞争，就能去掉**所有**数据竞争；类型错误是编译期、局部、可自修复的信号，故 Agent 受益最大。
- **L1 性质测试 + fuzz**——自动搜反例，但只能证明存在 bug，不能证明不存在：覆盖不了程序可能探索的状态空间。
- **L2 轻量 spec（TLA+ / Alloy）**——针对并发、协议、权限这类"状态机小、状态空间爆炸"的边界，性价比拐点。
- **L3 完整证明（Coq/Rocq/Lean）**——seL4 级别，只在"错了即灾难且 spec 清晰"处成立。

对 Agent 代码，回报序是 L0 → L2 → L1 → L3。L0 居首在它是唯一**每次生成都自动执行、人不付额外注意力**的层，还压缩搜索空间：类型收窄后 slop 分支减少。L2 次之：并发与权限是 Agent 最易写对语法、写错语义处。Jane Street 自身即存在性证明：25 年 OCaml + 强类型文化，使其既有资格谈"把 spec 集成进类型系统"，也有能力改语言。

### 四、反论与边界

**成本不在写 spec，在维护 spec。** 真正开销是双向漂移：代码改一次，证明重 discharge 一次；spec 过期后你证明的是一个已不存在的程序，而工具继续报"通过"。这与 [验证者悖论](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/verifier-paradox.md) 同构：验证设施本身最缺验证。

**低覆盖率给出虚假安全感。** 验证 10% 核心、放过 90% 胶水，bug 只会迁移到胶水里——"内核已证明、驱动仍有洞"是这类项目的典型终局。买到的是证书，不是安全网。

**LLM 生成的 spec 也需验证。** 同一 Agent 既写 spec 又写实现，产出一对"互相自洽但共同错误"的东西：spec 退化为模型误解的同义反复。所有权须留在人手里；spec review 应比 code review 杠杆更高——这也是 [Agent 形式化验证](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-formal-verification-ai-code.md) 绕不开的前置问题。

**原文自带后门。** 脚注承认复杂证明仍需人类指引，"消除所有数据竞争"也承认 `Obj.magic` 这类逃生舱；加之 Jane Street 既控制语言、又有一群催着要类型特性的用户，多数组织皆无——文章带招聘宣言成分，乐观值得打折。

## 实践启示

- **形式化 spec 不再是"学术玩具"**: Agent 时代它成为"如何把自然语言意图转成可执行代码"的最佳中间层
- **类型 + 性质测试 + formal spec 是三段式**: 类型层面（TypeScript/Rust）+ property-based（fast-check）+ 形式化（Lean/TLA+）
- **从哪里入手**: 选最影响安全的边界（auth、payment、concurrency）写 spec；不要一上来对所有代码 formalize

## 与其他工作的关联

- [Claude Code 大型代码库 Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-large-codebase-harness-configuration.md) — 同主题 AI 编程 vs 验证
- [AI Friendly 架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-friendly-architecture-design.md) — 形式化 spec 是 AI-friendly 的一种表达
- [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md) — spec 即 harness 的一种特殊形式

## 原文链接

→ [原文存档](https://blog.janestreet.com/formal-methods-at-jane-street-index/)

---

