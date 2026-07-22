---
title: "万字长文 | 带你由浅入深了解 Loop Engineering：从手动 Prompt 到设计系统的跃迁"
source_url: "https://mp.weixin.qq.com/s/g41IfUrp1SP8fhosq9t1lA"
author: "梦朝思夕 (梦朝思夕技术与管理博客)"
published: 2026-06-16
ingested: 2026-06-28
language: zh
type: raw
sha256: "7356db50976a1bf24a4a9dd3c9c07279efdcc0cea812cf4d989b8714627871c0"
---

# 万字长文 | 带你由浅入深了解 Loop Engineering：从手动 Prompt 到设计系统的跃迁

## 第一层：直觉建立——从手工作坊到自动化工厂

### 四次抽象跃迁

**第一次跃迁：Prompt Engineering——学会跟机器说话**

最早的时候，问题是：AI 能力很强，但你得会说它才听得懂。同样一个需求，有人说"帮我写个登录页面"，有人说"用 React + TypeScript 写一个包含邮箱验证和 OAuth 的登录组件，样式参考 Tailwind 默认主题"——得到的代码质量天差地别。

于是人们开始研究怎么写好 Prompt。少样本示例（Few-shot）、思维链（Chain of Thought）、角色设定——这些技巧的核心，都是在解决同一个问题：如何精确表达意图。

Prompt Engineering 解决的是"表达"问题。但很快，一个更深层的问题暴露了。

**第二次跃迁：Context Engineering——让机器看到足够多的东西**

你写了一个完美的 Prompt，AI 也给出了不错的代码。但你很快发现：它不知道你的项目用了哪个版本的框架，不知道你已有的工具函数怎么调用，不知道你们团队的代码规范是什么。

Context Engineering 应运而生。项目结构、依赖版本、代码规范、历史变更——这些不是写在 Prompt 里的，而是通过文件系统、代码索引、RAG 检索等方式动态注入的。

Google 的 Addy Osmani 对此有一个总结："Context engineering is about making sure the model has the right information at the right time." Claude Code 的 Boris Cherny 也说过类似的话：他们花在优化上下文上的时间，远多于优化 Prompt 本身。

**第三次跃迁：Harness/Hammer Engineering——给AI套上缰绳**

2025年中到2026年初，一批工程团队开始系统性地解决这个问题。他们的思路是：写一个外层脚本或框架，负责调用 AI、执行验证、收集结果、决定是否继续循环。

这个脚本就是 Harness——一条套在 AI 身上的缰绳。

Harness Engineering 的正式命名来自2026年2月。HashiCorp 联合创始人 Mitchell Hashimoto 在《My AI Adoption Journey》一文中首次系统提出了框架；一周后的2月11日，OpenAI 官方工程博客正式采用了这个术语。

但 Harness Engineering 有一个根本局限：你的 Harness 懂怎么跑测试，但不懂怎么查日志；另一个 Harness 会做代码审查，但不会做部署。它们是脚本，不是框架。

**第四次跃迁：Loop Engineering——从脚本到系统**

Loop Engineering 的出现，正是为了解决 Harness Engineering 留下的两个问题：可复用性和设计语言。

它做了一次关键的抽象：不再问"这个任务需要什么样的脚本"，而是问"一个能自主运行的循环，由哪些要素构成？"

用 Addy Osmani 的话说："Loop engineering is replacing yourself as the person who prompts the agent. You design the system that does it instead."

### 四次跃迁对比

| 维度 | Prompt Eng. | Context Eng. | Harness Eng. | Loop Eng. |
|------|-------------|--------------|--------------|-----------|
| 解决什么问题 | 如何精确表达意图 | 如何让AI看到足够信息 | 如何让AI自动跑验证循环 | 如何设计通用可复用的自主循环系统 |
| 你的角色 | 指令的编写者 | 信息的组织者 | 脚本的编写者 | 系统的设计者 |
| 类比 | 学会跟机器说话 | 给机器配上完整的工作台 | 给机器套上缰绳 | 建一条自动化流水线 |
| 核心动作 | 写Prompt | 注入上下文 | 写驱动脚本 | 设计循环架构 |
| 局限 | AI看不到项目全貌 | 每轮仍需人工驱动 | 每个Harness只管一种任务 | 循环中的判断与纠错 |
| 代表实践 | CoT、Few-shot | RAG、CLAUDE.md | SWE-agent、Aider、Devin | Claude Code Loop、Codex |

## 第二层：机制拆解——设计一个 Loop 到底要做什么

### 五要素拆解

**1. Automations：让循环自己启动**

Loop 的第一个瓶颈是启动。Automations 有两种典型形态：
- 定时触发（Heartbeat）：每隔固定时间跑一轮
- 事件触发（Webhook）：当某个事件发生时启动循环

Automations 是 Loop 的"心跳"，没有它，Loop 就是一个需要人工启动的脚本，跟 Harness 没有本质区别。

**2. Worktrees：让循环不会踩自己的脚**

Loop 的第二个瓶颈是隔离。Worktrees 借用了 Git 的 worktree 概念：为每个任务创建一个独立的工作区，互不干扰。

关键区别在于：分支的创建和切换是由 Loop 自动管理的，不需要你手动 git checkout -b。

Worktrees 是 Loop 的"隔离舱"，没有它，并行任务会互相踩踏。

**3. Skills：让循环越来越懂你的项目**

Loop 的第三个瓶颈是项目知识。Skills 是项目知识的固化载体，把隐性知识显式地存储在 Loop 可以随时调用的地方。常见形式包括：
- CLAUDE.md / AGENTS.md：项目根目录的 Markdown 文件
- 自定义指令集：针对特定类型任务的标准化步骤和检查清单
- 示例代码库：AI 可以参考的"正确写法"样本

Skills 是 Loop 的"肌肉记忆"，没有它，Loop 每一轮都在重新学习。

**4. Connectors：让循环能触碰真实世界**

Loop 的第四个瓶颈是行动能力。Connectors 是 Loop 与外部工具的接口，让 AI 能够执行终端命令、读写文件系统、调用 API、访问数据库。

Connectors 是 Loop 的"手和脚"，没有它，Loop 只能"想"不能"做"。

**5. Sub-agents：让循环自己检查自己**

这是 Loop 最容易被忽略、也最危险的瓶颈。如果 AI 既写代码又审代码，那它就是在自己给自己打分。

Sub-agents 的核心思想是制造者与检查者的分离。一个 Agent 负责生成代码（Builder），另一个 Agent 负责审查代码（Reviewer）。

但 Maker-Checker 有一个被忽视的盲区：如果 Builder 和 Reviewer 用的是同一个底模，它们的盲区高度重合。

**第六个要素：Memory——跨循环的记忆**

Memory 是让 Loop 从"能跑"变成"跑得好"的关键变量。它需要记住：上次跑到哪了、什么方案失败了、项目的变化。

### Loop 的解剖结构

大多数现代 AI 编程 Agent 的循环逻辑，都可以追溯到 2022 年 Princeton 和 Google 联合提出的 ReAct 模式（Reason + Act）。

一个真正能跑的 Loop，需要在骨架上装配六个关键组件：

1. **Goal——目标定义**：具体到可以评估、尽可能拆成可测试的子任务、限定范围
2. **Tools——工具集**：代码执行、文件系统访问、终端/Shell、搜索与文档查找、测试运行器
3. **Context——上下文管理**：压缩历史、结构化日志、按需刷新
4. **Termination Logic——终止逻辑**：成功条件、失败条件、升级路径
5. **Error Recovery——错误恢复**：区分可恢复/不可恢复、避免同策略重试
6. **Guardrails——护栏**：资源类焊死、认知类可插拔

### 四种常见的 Loop 模式

**模式一：Retry Loop——最简单的循环**

逻辑：AI 生成，验证，失败则反馈错误信息，AI 重新生成，再验证，直到通过或达到最大重试次数。

陷阱：Thrashing（空转）。如果 AI 的修改方向一直是错的，Retry Loop 不会自己发现。

**模式二：Plan-Execute-Verify——先想再做再查**

逻辑：AI 先制定计划（Plan），按计划逐步执行（Execute），执行完后验证整体结果（Verify）。

陷阱：Overfitting to Tests（过拟合测试）。AI 可能会为了让测试通过而"作弊"。

**模式三：Explore-Narrow——先广后深**

逻辑：AI 先广泛探索代码库（Explore），理解整体结构和依赖关系，缩小范围定位到关键代码（Narrow）。

陷阱：Context Drift（上下文漂移）。探索阶段如果耗时过长，AI 可能会"走神"。

**模式四：Human-in-the-Loop——关键节点的人类把关**

逻辑：Loop 自动运行，但在特定节点暂停，等待人类确认后再继续。

陷阱：Cognitive Surrender（认知投降）。人类面对 AI 的方案，倾向于直接点"确认"，而不是认真审查。

## 第三层：决策框架——Loop 是加速器还是麻醉剂

### 落地现状：三款产品的 Loop 能力对比

| Loop维度 | Claude Code | OpenAI Codex | OpenCode |
|----------|-------------|--------------|----------|
| Automations | /loop 原生指令，三种模式 | Triggers 自动化流水线，事件驱动 | 无原生指令，需自行搭建 |
| Worktrees | Git worktree 原生支持 | 沙箱容器隔离 | 多会话并行+LSP上下文隔离 |
| Skills | CLAUDE.md+项目索引自动构建 | AGENTS.md+代码库语义索引 | AGENTS.md+可复用技能包 |
| Connectors | 完整终端+文件系统+MCP | 终端+文件系统+MCP+90+插件 | MCP+LSP深度集成 |
| Sub-agents | 内置三类子代理，Agent View管理 | 内置代码审查，多智能体并行 | Client-Server架构多会话协作 |
| Memory | 会话内+CLAUDE.md+Auto Memory | Chronicle截屏记忆+向量检索 | AGENTS.md+结构化摘要与回放 |
| Loop开箱度 | 最成熟 | 较成熟 | 需自行组装 |

### 成本公式：Loop 的经济学

基础公式：单次 Loop 成本 = 平均迭代次数 × 单次迭代 token 消耗 × token 单价 × 并行实例数

更现实的成本公式：实际月成本 = 基础成本 × Thrashing 系数

Thrashing 系数取决于 Loop 设计质量——Skills 是否充分、终止逻辑是否清晰、Sub-agent 是否到位。设计良好的 Loop，Thrashing 系数可能在 1.5-2 之间；设计粗糙的 Loop，系数可能飙到 5 甚至 10。

### 三大风险：Loop 越顺滑，危险越大

**风险一：Comprehension Debt——理解债务**

Loop 替你写了大量代码，但你并没有真正理解这些代码。时间一长，你的代码库里有大量"你知道它能跑，但不知道它为什么能跑"的部分。

应对：Loop 生成的代码必须经过人类 Code Review；定期做"代码审计日"；在 Skills 中强制规定代码风格和架构约定。

**风险二：Cognitive Surrender——认知投降**

你不再审查 Loop 的输出，只是机械地点"确认"。不是因为输出一定正确，而是因为审查太累了。

应对：在人类确认环节提供结构化决策辅助；随机抽检；设置"红色按钮"。

**风险三：Verification Gap——验证缺口**

Loop 的验证手段覆盖不了所有可能的错误类型。测试能验证功能正确性，但验证不了性能退化、安全漏洞、用户体验退化。

应对：在 Verify 阶段加入非功能性检查；建立"回归测试金字塔"；对于关键模块，设置"变更影响分析"。

### 组织准备度：什么时候该开始？

**三个前置问题：**
1. 你的团队现在用 AI 编程的痛点是什么？Loop 是加速器，不是纠偏器
2. 你的团队有没有能力审查 AI 生成的代码？审查 AI 代码需要的是"读懂陌生代码并判断其正确性"的能力
3. 你的团队愿意为"看不见的工作"和"看不见的账单"买单吗？

**准备度总表：**

| 维度 | 暂缓 | 可以试点 | 就绪 |
|------|------|----------|------|
| Token预算 | 月均API < $1,000 | 月均API $1,000-$5,000 | 月均API > $5,000 |
| Prompt Engineering | 团队大部分人不熟悉AI编程 | 核心成员能写结构化指令 | 团队普遍掌握CoT、Few-shot |
| Context Engineering | 没有CLAUDE.md或等价物 | 有CLAUDE.md但不常更新 | 主动维护项目知识库，定期迭代 |
| Code Review | 没有系统化CR流程 | 有CR但对AI代码审查深度不足 | 能对AI代码做有效审查 |
| 质量卡口 | 测试覆盖率低，缺乏自动化测试 | 有基本测试但缺乏非功能性检查 | 回归测试金字塔完整 |
| 组织文化 | 只看产出不看投入 | 愿意投入但需要明确ROI | 接受"看不见的工作"的价值 |

### 收束

Loop doesn't know the difference. You do.

Loop 是一个加速器。它能让 AI 编程的效率提升一个数量级，Boris Cherny 一个月 4 万行代码就是证明。但加速器没有方向感。它可以让你跑得更快，也可以让你更快地跑向错误的方向。

设计你的 Loop，但设计它的时候，要像一个打算继续做工程师的人那样设计，而不是像一个打算把方向盘交出去的人。

Build the loop. But build it like someone who intends to stay the engineer.
