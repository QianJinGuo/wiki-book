# 5 Years and $5M Later: Inventing a New Programming Language for Web Development Was a Mistake (Wasp 复盘)

## Ch03.073 5 Years and $5M Later: Inventing a New Programming Language for Web Development Was a Mistake (Wasp 复盘)

> 📊 Level ⭐⭐ | 11.4KB | `entities/5-years-and-5m-later-inventing-a-new.md`

# 5 Years and $5M Later: Inventing a New Programming Language for Web Development Was a Mistake

Wasp 创始人 Matija Sosic 公开复盘：花了 5 年、烧掉 500 万美金、走完 YC，才意识到「为 Web 开发发明一门新语言」是个错误决定。文章诚实拆解了「我们当初为什么觉得这是好主意」「开发者真实的反馈是什么」「IDE 工具链投入为什么是压垮骆驼的最后一根稻草」「为什么改用 TypeScript SDK 之后底层 Wasp 一切照旧」。核心结论：**Wasp 的护城河从来不是语言本身，而是「编译期对整个全栈应用的高层规范理解」**——既能让人类一眼看懂应用结构，也让 AI Agent 更容易推理与维护。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/5-years-and-5m-later-inventing-a-new.md)

## 摘要

Wasp 想做的是 "Rails / Laravel for JS"，但拉伸到前端——一个跨整个 Web 应用栈的「通用框架」。2021 年与孪生兄弟 Martin 进入 YC，共募资 500 万美金。最初设计是发明一门新的 DSL 来抽象常见 Web 应用模式，类似 Terraform 但作用于 Web 栈（React + Node.js + Prisma）。五年下来发现：开发者爱这个 idea，但「容忍」这门语言——`-lang` 后缀让人误以为是要替代 JavaScript，Haskell 实现细节意外强化了「这是 Haskell-based 语言」的错误定位，自建 IDE 支持的工作量超出想象。最终决定保留 Wasp 编译器内核不变，只把「前端 DSL」换成 TypeScript SDK，迎来更平滑的 onboarding 与更好的 AI Agent 兼容性。

## 核心要点

- **失败本质**：DSL 在工程上没问题，错的是**包装与定位**——开发者根本来不及评估技术优劣，看到 `-lang` 就把它分到了「Rust / Java」那一类的 mental bucket
- **三大客户异议反复出现**：
  1. "wasp-lang" 是要替代 JavaScript 吗？（不是，但定位太强难纠正）
  2. 跟我的 IDE 和现有工具链兼容吗？（每个生态都要自己重建）
  3. 我不想学 Haskell（虽然终端用户永远不写 Haskell，但 Haskell 标签洗不掉）
- **IDE 工具链是真正的压垮稻草**：自研 language server + VS Code 扩展，依赖 Prisma DSL 嵌入语言、与 React/Node.js 跨文件引用，最终只达到了「理想体验的 80%」
- **真正的护城河**：高层级应用规范（`main.wasp` / 现在的 `main.wasp.ts`）让 Wasp 在编译期理解整个应用拓扑（路由、查询、async job、entity 关系）
- **`wasp studio` 命令**：可视化 Wasp 在编译期「看到」的应用结构，让开发者在生成目标代码前就能推理
- **TypeScript SDK 切换的代价**：「**只是替换了编译器的前端**」——后端、生成器、运行时一切照旧；用户从此每个编辑器都开箱即用，可以用条件、循环、import 拆分配置（如自实现 file-based routing）
- **AI 友好性是新增价值**：AI Agent 写代码越多，开发者越需要「结构化、有意见」的框架来约束输出——这是 Django / Rails / Laravel 复兴的同一逻辑，Wasp 在 JS 生态里复刻它
- **核心教训**：「我们当初对『语言』和『规范』几乎不区分——其实它们是两件不同的事，规范才是价值所在」

## 深度分析

### DSL 的两难：技术正确不等于市场正确

Wasp 团队是 Haskell 老兵，对 DSL + 编译器 + 形式化规范有深厚的执念。从纯工程角度看，他们的决定完全合理：

- DSL 能强制约束应用结构，避免 boilerplate
- 编译期检查能在部署前发现错误
- 高层规范让人类和工具都能推理整个应用

但市场反馈无情：**「开发者爱这个 idea，但容忍这门语言」**。这句话本身就是反常识——技术圈通常假设「技术更优 → 用户更爱」，但 Wasp 的经历证明：在工具生态中，**定位（positioning）比技术更优先**。`-lang` 后缀和 GitHub 上「Languages: Haskell 90%」这两个细节，把 Wasp 推进了「太早期、风险太大」的心理桶里，技术优势根本得不到评估机会。

### 「我们以为是语言，其实是规范」是最有价值的认知

文中最值得反复读的一段：

> "When we started Wasp, the terms 'language' and 'specification' were basically synonyms to us. We couldn't imagine one without the other. But watching developers use Wasp and seeing what they are excited about, it became clear it was never the language. It was the fact that Wasp has a full understanding of their entire app via a high-level spec."

这是一个非常深刻的范畴混淆。**语言**是承载规范的形式；**规范**是被表达的内容。Wasp 团队执着于发明新的形式，却没意识到价值在内容上——任何能完整表达「应用拓扑」的形式（DSL、TypeScript、YAML 都行）都能产生同样的护城河。

这与 [AI 友好架构设计](../ch05/022-ai-friendly.md)中的核心思想完全一致：能让 AI 和人类同时推理应用结构的「单一真理源（single source of truth）」才是关键，载体是 DSL 还是 TS 是次要选择。

### IDE 工具链：被严重低估的隐藏成本

文中讲述的「IDE 是压垮骆驼的最后一根稻草」对所有想做 DSL / 新语言的人都是必读：

> "Once we dove deeper into building tooling for a custom language, we quickly realized the entire ecosystem is built for 'standard' JavaScript and TypeScript frameworks. Anything else, and you're on your own, hitting walls really fast."

自己开发 language server + VS Code 扩展之后，团队还得处理 Wasp 嵌入 Prisma DSL、引用 React/Node.js 跨文件符号的复杂性——最终只到达「理想体验的 80%」。在今天 JS 开发者对 IDE 体验的预期下，这 20% 缺口足以让大量评估者直接关掉。

对所有「我要发明一门新 DSL」的项目：**先把『现有 IDE 完美支持』的成本算进 roadmap**。如果做不到 95%+，认真考虑用宿主语言的 SDK 而不是 DSL。

### 为什么 AI 编程时代反而强化了 Wasp 的价值

文章后段提到一个反直觉观察：**AI 写代码越多，「结构化、有意见」的框架反而更受欢迎**。

逻辑链条：

1. AI 生成代码时，如果框架本身没意见，AI 会做出无数等价但不一致的选择
2. 开发者审查 AI 代码的频率下降，等价的不一致变成长期维护负债
3. 「有意见」的框架（Rails、Django、Laravel、Wasp）强制单一表达方式，让 AI 生成的代码更可预测、更易审查

文中提到一个客户「试了 10 种 stack 最后落到 Wasp」的案例——这条产品 / market fit 信号现在反而比 5 年前更强。Wasp 的护城河在 AI 时代不是减弱而是放大。

这与 [AI Coding Agent 走向生产](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-coding-agent-from-helloworld-to-production.md)中的「framework opinionation 是 AI 时代的新需求」论点完全互锁。

### 「不是用户告诉我们语言不行，是我们自己受不了维护成本」

最反直觉的细节是：**采用 Wasp 的开发者大都不介意这门语言**，问题完全来自内部维护负担。这给所有 DSL 项目一个判断标准——**不要等用户抱怨语言才决定切换，要看维护团队的实际负担曲线**。当工具链投入持续超过预期时，即使用户没意见，长期也撑不下去。

### Wasp 没有死，只是换了前端

文章名字虽然叫「发明新语言是个错误」，但 Wasp 本身（编译器、运行时、生成器、`wasp studio`）一切照旧。这个区分非常重要：

- 错的是「**面向用户**的 DSL 选择」（输入端）
- 对的是「编译期理解整个应用」这件事本身（中间表示与输出端）

把这个例子做成 [harness 工程](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)的反面教材也很合适：harness 的中间表示（IR）应该尽可能稳定，输入语言可以多样。把 IR 和输入语言绑定到 1:1 是过早优化。

## 实践启示

1. **「发明新语言」前先做包装测试**：用 `-lang` 后缀、Haskell 提及这类细节做小规模 A/B，看心理桶分类是否会害死项目
2. **DSL 不是价值，规范才是**：能让人类和 AI 同时推理应用拓扑的「单一真理源」才是护城河——载体可以是 DSL、TS、YAML 任一种
3. **把 IDE 工具链成本写进 roadmap**：新 DSL 至少要达到 IDE 体验 95%+ 才能被主流采纳；做不到就用 SDK
4. **不要等用户骂才换技术**：维护团队的实际负担曲线比用户反馈更早预警
5. **AI 时代「有意见的框架」反而更受欢迎**：让 AI 生成的代码可预测可审查，是反 boilerplate 之外的新价值
6. **核心 IR 应当与输入语言解耦**：换前端不动后端是健康的架构信号
7. **失败复盘公开化是顶级 marketing**：诚实拆解决策的文章本身就是最好的 onboarding——比任何宣传 blog 都更能建立信任

## 相关实体

- [Ai Friendly Architecture Design Taobao](../ch05/022-ai-friendly.md) — AI 友好架构设计
- [Anthropic Claude Code Large Codebase Best Practices 50002A089323](../ch01/342-anthropic-claude-code.md) — 大代码库最佳实践
- [Ai Coding Agent From Helloworld To Production](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-coding-agent-from-helloworld-to-production.md) — AI Coding Agent 走向生产
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — Harness 工程框架
- [Harness Engineering Paradigm Shift](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-paradigm-shift.md) — Harness 工程范式转移
- [qwen code skill testing framework: recording, playback, and](../ch04/262-skill.md)

---

