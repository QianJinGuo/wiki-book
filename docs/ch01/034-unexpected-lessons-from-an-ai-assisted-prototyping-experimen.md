# Unexpected lessons from an AI-assisted prototyping experiment

## Ch01.034 Unexpected lessons from an AI-assisted prototyping experiment

> 📊 Level ⭐ | 8.8KB | `entities/adobe-design-unexpected-lessons-ai-prototyping-2026.md`

# Unexpected lessons from an AI-assisted prototyping experiment

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/adobe-design-unexpected-lessons-ai-prototyping-2026.md)

## 摘要

Adobe Design 的 Veronica Peitong Chen 在 2026 年 6 月复盘了一个在 Adobe Firefly 团队内部进行的"AI 辅助原型设计"实验。小组由 1 名 PM、3 名工程师和 1 名设计师组成，仅用 8 个工作日就把两个新功能（Precision Flow、Markup）交付到生产构建。文章最有价值的洞见不是速度，而是"邻近性（proximity）"重塑了设计-工程-产品的协作形态——距离消失，约束被前置，但协作不仅没有弱化反而被强化。

## 核心要点

- **作者**: Veronica Peitong Chen (Adobe Design)
- **来源**: [https://adobe.design/ideas/unexpected-lessons-from-an-ai-assisted-prototyping-experiment](https://adobe.design/ideas/unexpected-lessons-from-an-ai-assisted-prototyping-experiment)
- **评分**: v=7, c=7, v×c=49, stars=4

## 深度分析

### 出发点：传统设计流程的"翻译损耗"

传统的产品构建遵循"研究 → 定义 → 探索 → spec → 交付"的线性节奏，每个阶段都会引入偏离原始设计意图的风险。一个工作流经常需要数百个画面"小心拼接"来近似一段"完整体验"，整个流程被"用来证明进度的 artifact"驱动，而非为快速反馈优化。

实验的提问很简单：**当 AI 辅助原型直接发生在产品代码库里时，会发生什么？**

### 实验设置：4 人 pod + 真实代码库 + 真实约束

- 团队组成：1 PM + 3 工程师 + 1 设计师（作者），刻意小而跨职能。
- 工作对象：Adobe Firefly 的真实代码库，**不是**独立原型环境。
- 时间窗：8 个工作日，两个新功能（**Precision Flow**——单字 prompt 通过滑块浏览多种结果；**Markup**——草绘新元素、圈定修改区域、添加生成指令）进入生产构建。

工作流被刻意重构：从简要的 PRD 对齐开始，立刻进入 "design → build → feedback" 循环。设计师直接用 AI 编码工具把 Firefly 代码库的切片一片片搭起来，工程评审通过后直接合并到主干，让团队在"工作还没完全成形"时就能看到。

### 核心洞见一：邻近性放大了什么

> When the distance between idea and implementation shrinks, things shift: Design decisions can inform the product while it's still taking shape.

三个具体变化：

1. **设计意图直接喂给产品本身**，而不是几周后在评审会上"对账"。
2. **约束在它浮现的瞬间就被解决**，而不是延后到评审环节再集中暴露。
3. **工程师响应的是真实实现**，而不是基于推断的行为假设。

这些变化让反馈更早、更有用——基于团队"真正能用的东西"。

### 核心洞见二：设计师的时间分配被重写

过去一个功能要做几十个屏幕、详细注释、用 Figma 把流程连起来。邻近性让作者重新分配时间：

- Figma 变成"和设计团队 jam、共绘想法、评估关键 frame"的工具，而不是规范每一帧。
- 关键交互用 20-60 分钟画几张关键屏幕就足够，剩下时间直接进入 AI 编码。
- **设计决策"在当下被做"**，因为它们直接基于产品的实际行为。

### 核心洞见三：迭代变细粒度、可观察的副作用被前置

在 Markup 这个功能上，作者的迭代节奏是：先用一把 brush → 加文字 markup → 加图片 markup → 每一段单独测，再合并。边缘 case 提前浮现、系统交互变清晰，甚至无障碍问题（对比度、focus 状态、交互）也因为能在真实体验里测试而更容易处理——而不是事后靠文档补。

### 核心洞见四：协作不是被弱化，而是被强化

> One of the most persistent misconceptions about vibe coding is that it makes collaboration less necessary. In practice, the opposite is true.

- **工程师角色更深**：保证生产稳定、提升体验质量、压力测试交互、搭建支撑快速迭代所需的基础设施与护栏。
- **产品角色同样关键**：命名"对的问题"、对齐合作伙伴、跨团队编排优先级。
- 因为工作更早变得"可触摸"，协作形态从**交接（handoff）**转为**重叠（overlap）**：进行中的构建 + 现场走查，让研究、法务、QE、品牌等团队在"决策仍可变"的窗口里就被纳入讨论。

### 核心洞见五：基础功没有消失

> Empathy, judgment, taste, and craft don't disappear when you're building instead of specifying.

作者诚实地承认：邻近性不替代基本功；它把"严谨"挪到了"想法变成真实体验"的更近处。当没人独自工作时效果最好。

### 留下的开放问题

实验没产出"成品系统"或"打磨好的剧本"，只是一个快照。三个值得继续思考的问题：

1. **节奏**——vibe coding 会无情地把人往前拽，需要纪律给自己留"抬头透气"的窗口。
2. **高度**——当注意力被"具体实现"吸走，设计师如何保持广角视野？
3. **设计**——哪些问题更适合更传统的流程？

## 实践启示

- **小而跨职能的 pod 适合 AI 辅助原型**：4 人（PM + 3 工程师 + 1 设计师）能在 8 个工作日内把功能推进到生产环境，说明组织形态与 AI 工具的杠杆率比想象的更紧。
- **Figma 与代码库的分工**：让 Figma 退回到"共创与对齐方向"，把执行交给 AI 编码工具，可以避免"几百帧规范文档"的浪费。
- **决策前置**：邻近性能让"约束浮现的当下"就被处理，而不是等到评审环节才暴露——这要求团队接受"工作还不完美就共享"的姿态。
- **协作窗口前移**：在决策仍可变时，把研究/法务/QE/品牌团队纳入，能让"返工"成本降低。
- **诚实看待局限性**：作者明确指出"none of this worked because of the tools"——基础功（empathy, judgment, taste, craft）没变，工具只是把它们放到更接近决策点的位置。

## 相关实体

- [特斯拉百万年薪招数据标注员，朝九晚五，无需ai经验](../ch05/088-ai.html)
- [system over model, tested: reproducing mythos's freebsd find](../ch12/030-mythos.html)
- [from doer to director: the ai mindset shift](ch01/033-from-doer-to-director-the-ai-mindset-shift.html)
- [DDoSing Software Delivery Pipelines](ch01/981-20.html)
- [How my non-engineering team at Sentry learned to ship](ch01/451-how-my-non-engineering-team-at-sentry-learned-to-ship.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/adobe-design-unexpected-lessons-ai-prototyping-2026.md)

---

