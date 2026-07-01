# What is AX? John Maeda on Accessibility as Ability

## Ch03.102 What is AX? John Maeda on Accessibility as Ability

> 📊 Level ⭐⭐ | 6.2KB | `entities/2026-06-11-what-is-ax.md`

# What is AX? John Maeda on Accessibility as Ability

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/2026-06-11-what-is-ax.md)

## 摘要

John Maeda 在这篇文章中提出 **AX（Agent Experience / Accessibility Experience）** 概念，将"无障碍"从"为残障人士提供便利"重新定义为"面向所有人的通用能力设计"。文章通过个人体验——法兰克福对话博物馆的全黑导览、与盲人同事共事的经历——论证了一个核心命题：在 Agent 时代，传统 UX 的"驾驶舱"范式正在被 AX 的"判断界面"范式取代。这篇文章不是一篇技术文档，而是一篇设计哲学宣言，它重新定义了人机交互的核心假设。

## 核心要点

### 1. AX 重新定义了 Accessibility

Maeda 的核心洞察：我们一直把 Accessibility 理解为"为少数人做的额外工作"，但它实际上是**为所有人的基础设计**。每个人都会经历能力受限的时刻——单手操作手机、嘈杂环境看视频、强光下看屏幕。AX 不是事后补丁，而是设计阶段就应该内建的决策。

### 2. UX 的"驾驶舱"正在失效

Maeda 用了一个极好的隐喻：他一辈子都在设计"驾驶舱"——菜单、标签页、流程、仪表盘、确认对话框。这些设计的前提假设是：**总是一个人在操控界面**。但 Agent 时代的到来打破了这个假设。

### 3. Norman 的"两个海湾"在 Agent 时代重新分配

Don Norman 提出的执行海湾（Gulf of Execution）和评估海湾（Gulf of Evaluation）在 Agent 时代发生了根本性转变：

- **执行海湾趋近于零**——你不再需要"操作门把手"，你说"我要出去"就出去了
- **评估海湾被撕开**——Agent 做的事对不对？怎么检查？怎么引导？怎么信任？
- **屏幕的工作变了**——从"发生工作的表面"变成"发生判断的表面"

### 4. "双手"隐喻：Chat + Canvas

Maeda 提出了一个精妙的设计框架：Chat 是一只手（表达意图），Canvas 是另一只手（检查结果）。单有 Chat 就像只用一只手工作。**真正的 AX 需要双手并用**——一只手说你要什么，另一只手看是否得到了。

### 5. 盲人可能是 Agent 时代的"原住民"

文章最具洞察力的观点：最适应 Agent 时代的可能不是传统"高级用户"，而是那些长期通过语言、结构、序列、记忆来导航计算的人——盲人用户。他们处理合成语音的速度是普通人的 2-3 倍。法兰克福博物馆里，灯灭的那一刻，"残障"瞬间变成了"能力"。

## 深度分析

### 从 UX 到 AX 的范式转移

Maeda 的文章触及了一个更深层的命题：**人机交互的隐喻正在从"操控"变为"委托"**。UX 时代，用户是"飞行员"，界面是"驾驶舱"；AX 时代，用户是"委托人"，界面是"工作台+审判席"。

这个转变有三个层面：

1. **认知负担的迁移**：从"如何操作"迁移到"如何判断"。用户不再需要学习复杂的菜单结构和操作流程，但需要学会如何审查 Agent 的产出、识别错误、做出决策。

2. **设计目标的转变**：从"降低操作门槛"到"降低判断门槛"。好的 AX 设计不是让按钮更容易按，而是让 Agent 的行为更透明、可审查、可引导。

3. **用户能力的重新评估**：传统的"高级用户"（键盘快捷键大师、仪表盘专家）可能不是 AX 时代的最强选手。真正的能力在于**快速理解 Agent 的意图和产出**，而非快速操控界面。

### Erika Hall 的"对话是最古老的界面"

Maeda 引用了 Erika Hall 2018 年《Conversational Design》中的观点：没有婴儿天生会用下拉菜单，但每个婴儿天生会表达意图（哭、伸手、注视）。Chat 的突破不是让计算机学会说话，而是**让意图移到了前台**。

这个观察对 Agent 设计的启示是：不要试图教用户使用 Agent，而是让 Agent 理解用户。交互的重心应该放在意图解析和反馈循环上，而不是命令语法和操作流程。

### 对 AI/Agent 产品设计的启示

1. **自适应交互**：Agent 应该根据用户的能力状态（环境、注意力、设备）调整交互方式，而非一套固定 UI 适配所有人
2. **多模态输出**：语音 + 视觉 + 文本的组合本质上就是 AX——它覆盖了不同的能力场景
3. **自然语言交互**：降低了技术能力门槛，是天然的 AX 实践
4. **可审查性设计**：Agent 做了什么、为什么这么做、结果是否正确——这些判断需要专门的设计支撑
5. **上下文感知**：最好的 Agent 工具是那些在用户分心、用手机、在嘈杂环境中依然好用的工具——这是设计约束，不是功能需求

## 实践启示

- **Agent 产品设计**：投入与"执行设计"同等的资源做"判断设计"——让用户能快速审查、比较、修正 Agent 的产出
- **无障碍即通用设计**：不要把 Accessibility 当作合规清单，它是面向所有人的基础设计哲学
- **Canvas 不是可选项**：纯 Chat 界面在复杂任务中是"一只手工作"的设计缺陷，需要可视化审查界面配合
- **用户能力重评估**：不要假设"高级用户"就是最熟悉技术操作的人，Agent 时代的核心能力是理解和判断
- **渐进式信任**：Agent 界面需要设计信任建立机制，让用户逐步学会何时信任、何时审查、何时介入

## 相关实体

- [Context Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/context-engineering.md)
- [Claude Code HTML Artifact Workflow](ch03/073-claude-code.md)
- [Claude Dispatch and the Power of Interfaces](ch01/436-claude-dispatch-and-the-power-of-interfaces.md)
- [MOC: Coding Agent Practice](https://github.com/QianJinGuo/wiki/blob/main/moc/coding-agent-practice.md)

---

