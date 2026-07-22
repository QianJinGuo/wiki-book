---
title: "Loop Engineering 概念解析、思考与实践"
source_url: "https://mp.weixin.qq.com/s/ael7aIEoomk4AU84E-mpGg"
author: "飞樰 (阿里技术)"
published: 2026-06-16
ingested: 2026-06-28
language: zh
type: raw
sha256: "abfa307bf81fecaa44ea9da519676a1253101dc2c37673015846e71c821110fb"
---

# Loop Engineering 概念解析、思考与实践

## 01 背景

AI 领域最近出现一个新的概念，叫做 Loop（循环）或者叫 Loop Engineering（循环工程）。

Anthropic 公司 Claude Code 的负责人 Boris Cherny 明确表示，他在使用 Claude Code 时已经不再手写提示词 Prompt 了，而是转向编写 Loop，用 Loop 来驱动工作流的完成。OpenClaw 的创始人 Peter Steinberger 也在 X 上指出，不应该再用传统的提示词去指挥 Agent，而应该通过设计 Loop 来引导 Agent 的行为。Andrej Karpathy 也强调"你必须把你自己从 Loop 的执行过程中移除出去"。

6 月初，Google AI 总监 Addy Osmani 专门写了一篇文章，正式定义了「Loop Engineering」这个概念，并在文章开头给出核心定义：Loop engineering is replacing yourself as the person who prompts the agent. You design the system that does it instead.

## 02 Agent Loop vs Loop Engineering

要理解 Loop Engineering，首先需要搞清楚这个 Loop 与基础的 Agent Loop 的本质区别。

**Agent Loop**：Agent 本身就是一个 Loop。大模型运行一次就是"输入一段话、输出一段话"，想让 Agent 持续、自动化地运行，就必须把它构建成一个 Loop。核心逻辑：输入 → 大模型输出 → 如果是 Function Call 则执行工具并再次输入 → 如果是 Response 则结束。无论现在的 Agent 有多复杂，底层都是基于这个简单的原理构建的。

**Loop Engineering**：大佬们说的这个 Loop，跟底层的 Agent Loop 完全不是一回事。底层的 Agent Loop 是 Agent 最核心的基础循环，现在已经是默认的基础设施了。而他们真正想表达的 Loop 以及 Loop Engineering，是构建在 Agent 之上或者说 Harness 之上的，是一种由人来设计和控制 Agent 使用方式的新的范式。

## 03 「人机协同循环」重构为「自动化验收闭环」

当高频地使用"继续"、"报错"、"回滚"这些指令去催促模型完善、调试或修改错误时，这个动作本身是不是也可以自动化？

大佬们提出所谓的 Loop 和 Loop Engineering，本质上就是想解决这个问题：能不能在提完需求之后，模型不用等人再去喊"检查错误或"不符合预期"，而是先对自己说这些话，主动完成验证？

这已经不是底层那个小的执行 Agent Loop 了，而是一个更上层的、面向需求验收的外部 Loop。

**演进路径**：从 Coding 到 Vibe Coding，是从「写代码」变成了「提需求」；而从 Vibe Coding 到 Loop Engineering，则是从"提一个需求"变成了"提一套闭环流程"。

Loop Engineering 本质上就是一种可以循环起来的 Pipeline。触发方式有两种：人工触发和定时触发。

## 04 Loop Engineering 的六大核心框架

根据 Addy Osmani 的定义，一个完整的 Loop 主要包含以下六个核心部分：

**1. Automations（自动化）**

有了 Automations，Loop 就可以定时循环了。Codex 可以创建自动化任务：选好项目、定好要跑的 Prompt、设好频率。Claude Code 靠 Cron 调度和 Hook 实现，支持 /loop 命令和 /goal 命令。

**2. Worktrees（工作树隔离）**

只要同时跑多个 Agent，就很容易有文件冲突的问题。使用 Git 的 Worktree 就能解决这个问题，它本质上是一个独立的工作目录，有自己的分支，但共享同一个仓库历史。

Codex 直接把 Worktree 支持内置进去了。Claude Code 也提供了相同的隔离能力：可以用 --worktree 参数在一个独立的 checkout 里开启会话，也可以给子 Agent 设置 isolation: worktree。

**3. Skills（可进化的技能包）**

Skill 就是一种可渐进式披露、可复用的能力包。在 Loop Engineering 这里，如果 Skill 具备自我沉淀的能力，它就能在 Loop 的每一次循环中不断更新、积累经验，变成一种"活的知识"。

**4. Connectors / Plugins（连接器 / 插件）**

Connectors / Plugins 本质上就是 MCP 及其延伸的各类工具，负责把各种外部 API 工具接入 Agent。没有 Connectors，Agent 就只是一个封闭的推理引擎；有了它，Agent 才具备完成实际任务的行动能力。

**5. Sub Agents（子智能体）**

Sub Agents 可以理解为在主 Loop 运行过程中动态生成的「分支智能体」。当主 Agent 完成开发任务后，可以生成一个独立的验收 Sub Agent 来检查结果。这种设计刻意制造了一种"博弈"的关系，用角色隔离来打破认知盲区。

**6. 状态（State）**

状态管理，可以用 Markdown 文件来记录（AGENTS.md 或专门的进度文件），也可以通过 MCP 连接器对接 Linear 等项目管理工具。

## 05 简单实践与思考

一个简单的文本分类任务 Loop 实践：

**传统方式**：写一个提示词，告诉模型分类标准和数据样例，让它输出分类结果；然后人工检查准确率，发现不准就手动反馈调整。

**Loop 方式**：把"验证"和"迭代"直接写进 Loop 的定义里。设定量化目标，比如"在 100 条测试数据上，准确率 ≥95% 或者错误率 ≤5%"。Agent 就会自主循环打磨，不断逼近这个指标，无需人工中途干预。

**关键区别**：这个过程完全由 Agent 自主驱动完成的 Loop，不依赖任何外部开源框架或预置代码。Agent 会在 Loop 运行中自己构建一套验证与优化机制。

**建议**：如果流程是固定的，直接写成脚本；如果确实需要模型每天介入、做动态判断，那就做成可复用的 Skill。不要每天重跑 Loop 浪费 token。

## 06 Loop 不是银弹，用之前需要先想清楚

Loop 不是什么横空出世的全新技术，只是在原有基础上把自动化又往前推了一步。

**特别提醒**：用 Loop 的时候，需求和验证标准必须比原来写得更加明确。因为用 Loop 之后，中间过程人不参与了，如果开头没把需求写清楚、没把验证逻辑定义明白，Loop 很可能从一开始就跑偏了。

Loop 对使用者描述需求和验证的能力要求其实更高了。对于顶尖大牛来说这可能不是问题；但对大多数人来说，如果发现很难把需求和验证写清楚、把控不住 Loop 的效果，那还是建议老老实实回到 Human-in-the-Loop 的模式。

**技术方法论没有对错，只有适不适合。**

## 07 总结

本文内容只是技术探索过程中的一些心得与总结，纯属一家之言、经验之谈。

## References

[1] Loop Engineering：https://addyosmani.com/blog/loop-engineering/
[2] Loop Engineering: Build Self-Running Coding Agents 2026：https://www.the-ai-corner.com/p/loop-engineering-coding-agents-2026
