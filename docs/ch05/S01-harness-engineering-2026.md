# Harness Engineering 的 2026：从提示词工程到运行时控制

> 🧭 综合·演进 | 信源 7 篇

<!-- syn-slug: harness-engineering-2026 -->

一年前，"Harness"还是圈内黑话；今天，Anthropic 官方文档、字节 TRAE 指南、腾讯技术工程博客都在用这个词。本章的十几个信源拼出了这条演进线的全貌，单看任何一篇都只能看到局部。

## 三次重心迁移

站内被引用最多的一篇 [Harness 架构深度拆解](../ch04/127-agent-harness) 给出了被广泛转述的三段划分，本章的其他信源从各自角度印证了它：

| 阶段 | 核心问题 | 工程重点 |
|------|---------|---------|
| Prompt Engineering | 模型听得懂吗 | 优化指令表达 |
| Context Engineering | 信息给够了吗 | 优化信息供给 |
| Harness Engineering | 执行中能持续做对吗 | 优化运行控制系统 |

迁移的驱动力不是技术时尚，而是失败模式的更替：当模型能力过了"听不懂"和"看不见"的门槛后，剩下的失败全部发生在**多步执行的过程中**——工具用错、状态丢失、错误传播、无法恢复。

## 2026 年的三个收敛点

**第一，循环先于智能。** [Loop Engineering 半年实战](050-loop-engineering-claude-ship)与 [核心模式梳理](005-harness-engineering)都把"设计替你写提示词的循环"放在收益第一位：先写刹车（验证、预算、人工接管点），再写循环体。顺序相反的团队（先堆智能再补刹车）在本章案例里反复付出返工代价。

**第二，规格成为控制面。** [Claude 官方学习资料](028-prompt-harness-claude)与 [TRAE 的 Harness 指南](020-trae-harness-engineering)不约而同把规格（spec / SDD）当作 Harness 的静态一半：提示词负责"这一次怎么做"，规格负责"这类任务永远怎么做"。动态循环 + 静态规格，构成运行时控制的两个把手。

**第三，分类学开始出现。** [A Survey — ETCLOVG 分类学](078-agent-harness-engineering-a-survey-etclovg-taxonomy)试图给这个野蛮生长的领域建立坐标系——一个领域开始出分类学，通常意味着它的低垂果实已被摘完，剩下的分歧需要精确的词汇才能讨论。

## 悬而未决

- **Harness 会不会被模型吸收？** [Claude Code 深度理解](011-claude-code-harness-deep-understanding)记录了一种预期：上下文工程终将内化到模型里，Harness 退化为薄壳。而 [Cloudflare Flue 平台](001-bringing-more-agent-harnesses-and-frameworks-to-cloudflare)的实践走向反面——Harness 组件化、平台化，越做越厚。本章编者按当前的证据倾向前者影响小模型、后者影响生产系统，两条线将长期并行。
- **评测缺位**：各信源都声称自己的循环更好，但没有一个跨 Harness 的公共基准。谁先补上这一块，谁就定义下一阶段的议程。

---

