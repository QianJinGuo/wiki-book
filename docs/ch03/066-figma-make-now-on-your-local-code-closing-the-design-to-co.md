# Figma Make, Now on Your Local Code: Closing the Design-to-Code Loop

## Ch03.066 Figma Make, Now on Your Local Code: Closing the Design-to-Code Loop

> 📊 Level ⭐⭐ | 12.4KB | `entities/figma-make-now-on-your-local-code-3e6a33.md`

# Figma Make, Now on Your Local Code: Closing the Design-to-Code Loop

> Source: Figma Blog, "Figma Make, now on your local code", 2026-05-28. URL: https://www.figma.com/blog/figma-make-now-on-your-local-code/

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/figma-make-now-on-your-local-code-3e6a33.md)

## 摘要

2026-05-28 Figma 推出 Make 的新能力——在桌面端 Beta 应用中支持直接对接本地生产代码库做可视化编辑。核心定位是「设计 vs 代码」是假二元对立：Figma 不强迫用户在设计画布、原型 playground、生产代码之间二选一，而是提供 Agent 驱动的「直接编辑 + 标注 + Git 流程 + 跨画布和代码库的协作」完整工作流。Beta 期间不消耗 credits。

## 核心要点

- **核心主张：设计 vs 代码是假对立**。Figma 平台的设计哲学是「在正确的时刻给你正确的工具」，所以要打通从设计画布到生产代码库。
- **代码现状对照 10 年前的设计**。Figma 刚推出时设计是离线单人模式，今天更多人用 Agent 写代码，但代码工具还停留在 2016 协作水平。IDE 和 terminal 对很多人来说不像「家」。
- **直接编辑代码库（visual edits）**。在 Make 中选中元素、调整属性、改变布局/颜色/字体/尺寸，Agent 找到相关代码并编辑以让 UI 反映设计。
- **标注（annotations）补充交互/动画**。对那些超出属性编辑范围的变化（如交互/动画），可以在屏幕上标注元素描述想要什么，标注可以一次引用多个元素。这提供了「直接编辑」和「标准 prompt」之间的灵活中间选项。
- **Git 流程集成（branch/commit/PR）**。发布到生产代码应通过团队的开发流程有意图地进行。打开 PR 之前，更改存储为本地 commit。Make 支持 Git 工作流（创建分支、撤销 commit 等），让工程团队像 review 其他 PR 一样 review 这些更改。
- **跨工具协作：把 Make 改动发成文件/分支**。让 Make 编辑本地代码库的更改可以作为文件分享，发送链接后队友 checkout 分支查看并继续构建。
- **画布与代码库的双向同步**。从 Make 复制屏幕/页面/组件粘贴到 Figma 画布作为 layers，与团队协作编辑；Figma 检测到更改后会提示带回 Make，应用到代码。目标是「完全关闭循环」——画布和代码库在同一个地方。
- **Beta 限制**：仅 Mac Beta 桌面应用，需要公司代码库访问权限（非技术用户已简化但仍需具备），不消耗 credits 但有限制名额。

## 深度分析

### 1. 行业判断：代码工具停留在 2016 协作水平

Figma 给出的行业判断是「尽管有这么多创新，我们用来处理代码的工具仍然非常早期。我们在协作方面仍停留在 2016 年」。 这是个有意识的对标——Figma 之所以能颠覆 Sketch/Photoshop，靠的就是把设计从「离线单人模式」变成「实时多人云协作」。把同样的范式套到代码上是 Figma 的目标：让设计-原型-代码的切换变成「在同一个平台里换工具」而不是「在 Figma、VS Code、GitHub、终端之间切换」。这个判断的逻辑是：当前 AI 写代码的能力跃迁正在发生，但协作工具没有跟上——这是 Figma 看到的市场窗口。给做产品架构师的启示是：当一项核心能力（这里是 LLM 写代码）发生跃迁时，**协作层往往是被低估的瓶颈**。Figma 的赌注是 10 年后代码工具会像今天的 Figma 一样实时多人协作。

### 2. 直接编辑 + 标注的混合交互模式

Make 的核心交互是「选中元素 → 调整属性 → Agent 编辑代码」——这是「直接编辑」（Direct Editing）。 但当变化超出属性范围（如交互/动画），就用「标注」（Annotation）——在屏幕上注释，Agent 据此操作。 这套设计的精妙在于：① 简单变化是确定性的（颜色、字体、尺寸），用直接编辑；② 复杂变化是非确定性的（交互逻辑、动画），用 prompt 风格的标注。把「哪些变化应该用确定性操作、哪些用 prompt 风格操作」显式建模为产品选择，而不是把所有变化都塞进同一个 chat box。这是 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 在设计工具上的具体体现：**工具的交互模式本身就是一种 control plane 设计**。

### 3. Git 流程是生产代码的「质量门槛」

Figma 明确把「生产代码发布应该通过团队的开发流程有意图地进行」作为产品约束。 具体落地是：所有更改在打开 PR 之前都是本地 commit；Make 支持分支创建、撤销 commit；工程团队像 review 其他 PR 一样 review 设计师的更改。 这条线连到 [Karpathy 访谈](../ch04/235-agentic.html) 里反复强调的「Agentic Engineering 不是 Vibe Coding，验证体系决定 Agent 自动化能走多远」——Figma 在产品层面把这条原则具象化：无论 Agent 怎么生成代码，最终必须经过 Git 工作流和 PR review，这是「承重墙」的具体形态。给做内部工具的启示是：**当引入 AI 写代码能力时，必须把 Git 工作流作为默认约束，而不是可选**。

### 4. 画布与代码库的双向同步是「闭环」

Make 的真正野心是「完全关闭循环」——把屏幕和元素从 Make 拿到 Figma Design 让团队评论、编辑、玩，决策完成后再带回代码。 「画布和代码库在同一个地方，没有正确的开始地点，只有工作和最适合你所在阶段的工具。」 这种「双向同步」模式的关键技术挑战是：① 视觉层的更改（设计工具侧）如何映射到代码层（哪些文件、哪些属性）；② 代码层的更改（Agent 自动修改）如何反映回设计工具侧；③ 如何处理「一方更新、另一方在编辑中」的冲突。Figma 用的策略是「Figma 检测到更改后会提示带回 Make」——这是乐观合并 + 用户确认的模式。这种「无缝切换工具」的设计哲学，本质上是在做 [Harness](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 在设计-代码工作流上的应用：让 Agent 能够在两个语义层之间无损转换。

### 5. Agent 可控性边界：哪些变化绕过 review

值得注意的是，Figma Make 的直接编辑模式（属性调整）绕过了用户对生成代码的 review——用户只看到 UI 变化，Agent 在背后改代码。 但通过 PR 工作流，所有最终更改都会进入正常的 review 流程。 这种「即时反馈 + 延迟审核」的模式是 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 的典型设计：让 Agent 在小颗粒度上自由行动（属性编辑是低风险的），但在大颗粒度上接受人类 review（PR review 是高门槛的）。给做内部工具架构师的启示是：**设计 Agent 工具时，要分清楚哪些操作可以「即时反馈 + 延迟 review」组合，哪些必须「即时 review + 同步审核」**。属性编辑属于前者，代码生成属于后者。

### 6. Beta 限制透露的产品策略

Figma 在 Beta 期做了三个限制：① 仅 Mac 桌面应用；② 需要公司代码库访问权限（设计师已具备但非技术用户仍在简化流程）；③ 不消耗 credits 但限制名额。 透露的产品策略是：先验证「有代码库权限的设计师」这一最成熟用户群的工作流，再向非技术用户扩展；先用免费 Beta 收集使用模式，再公布 AI credits 定价。这与传统 SaaS 推出的「先广后窄」策略相反，是「先窄后广」的早期采用者策略。给做产品发布的启示是：**当新交互范式有不确定性时，先用免费 Beta 锁定最成熟用户群，再用他们的实际使用模式来设计后续扩展路径**，比一上来就做大众市场更稳妥。

## 实践启示

1. **代码协作工具是 AI 时代被低估的瓶颈**：当 LLM 写代码能力跃迁时，协作层往往没跟上。Figma 的赌注是 10 年后代码工具会像今天的 Figma 一样实时多人协作。给内部工具团队的启示是评估自己的代码协作工具时，看是否支持「Agent 即时生成 + 人类异步 review」的工作流。
2. **设计 Agent 工具要分清楚「即时反馈 + 延迟 review」与「即时 review + 同步审核」的边界**：属性级别的低风险操作可以前者（直接编辑 → PR review），代码生成的高风险操作必须后者（生成 → 同步 review）。
3. **Git 工作流是 AI 写代码的默认质量门槛**：当引入 AI 写代码能力时，必须把分支/提交/PR review 作为默认约束，不能让 Agent 绕过。Figma Make 强制所有更改通过 Git 流程是产品层面的「承重墙」设计。
4. **标注（Annotation）是「直接编辑」和「Prompt」之间的灵活中间层**：当操作超出属性级别（如交互/动画），用标注让 Agent 理解上下文；标注可以一次引用多个元素，提供比单个 prompt 更丰富的语义。
5. **画布-代码双向同步需要乐观合并 + 用户确认**：Figma 的做法是「检测到更改后提示带回 Make」——这是处理「一方更新、另一方在编辑中」冲突的产品模式。给做 IDE 集成的启示是双向同步的冲突解决策略要提前设计。
6. **新交互范式先用免费 Beta 锁定最成熟用户群**：Figma 的「仅 Mac + 仅成熟用户 + 免费 Beta」是「先窄后广」策略。一上来就做大众市场风险太高，先验证成熟用户群的工作流再用其使用模式设计扩展更稳妥。
7. **工具的交互模式本身就是 control plane 设计**：Make 显式建模了「哪些变化用确定性操作（直接编辑）、哪些用 prompt 风格操作（标注）」，这是 Harness Engineering 在设计工具上的具体体现。给做内部工具的启示是：不要把所有变化都塞进同一个 chat box。

## 相关实体

- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](../ch04/235-agentic.html)
- [Vibe Coding Agentic Engineering Convergence Simon Willison](../ch04/422-vibe-coding-agentic-engineering.html)
- [两万字详解Claude Code源码核心机制](ch03/076-claude-code.html)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](../ch05/039-agent-harness.html)
- [一文带你弄懂 Ai 圈爆火的新概念Harness Engineering](../ch05/052-harness-engineering.html)
- [Karpathy Vibe Coding Agentic Engineering](../ch04/132-karpathy-vibe-coding-agentic-engineering.html)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](ch03/046-agent.html)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](../ch11/224-openclaw.html)

---

