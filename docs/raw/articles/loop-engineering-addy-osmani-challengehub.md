---
title: "Loop Engineering：不再写提示词，而是设计替你写提示词的循环"
source_url: "https://mp.weixin.qq.com/s/vmGx9IELbWgKZqHm-M3G5w"
ingested: 2026-06-10
sha256: 07178174a745ef5bb3c918c4ba1cac4e17c607ab6e15e202249fea6854ff591b
type: source
tags: [wechat, loop-engineering, harness, codex, claude-code, addy-osmani]
---

# Loop Engineering 来了：你不再亲手写 Prompt，而是写"循环"

循环工程：别再亲手给智能体写提示词了，去设计那个替你写提示词的系统

所谓循环工程（Loop Engineering），就是把"那个给智能体写提示词的人"——也就是你自己——给替换掉，转而由你去设计一套系统，让它替你干这件事。这里说的"循环"（loop），可以理解成一个递归式的目标：你定义好一个目的，然后让 AI 不断迭代，直到任务完成。

原文链接：https://addyosmani.com/blog/loop-engineering/

Peter Steinberger 前不久说："你不该再去给编程智能体写提示词了，你应该去设计那些替你给智能体写提示词的循环。"无独有偶，Anthropic 旗下 Claude Code 的负责人 Boris Cherny 也说过类似的话："我现在已经不给 Claude 写提示词了。我有一堆循环在跑，它们替我给 Claude 写提示词、自己琢磨接下来该干嘛。我的工作就是写循环。"

过去差不多两年里，从编程智能体那儿榨出点东西的方式一直是：你写一个像样的提示词，把足够的上下文喂给它。你敲一段字，看它返回什么，再敲下一段。智能体是个工具，而你得自始至终一直握着它，一来一回。这种模式现在基本算翻篇了。

如今你要做的，是搭一个小系统：它自己去找活、把活分出去、检查结果、记下哪些做完了，然后决定下一步干啥，最后由这套系统去戳那些智能体，而不是你亲自去戳。笔者之前写过它的一个近亲——智能体框架工程（agent harness engineering），讲的是给单个智能体打造它运行所在的那个环境；也写过工厂模式（factory model），也就是那套用来造软件的系统。循环工程比框架（harness）还要再高一层。说到底它仍然是个框架，只不过这个框架是定时跑的，会自己派生出一堆小帮手，还能自己喂自己。

## 五个模块 + 记忆

一个循环需要五样东西，再加一个用来"记事"的地方：

1. 自动化任务（Automations）：按计划自动触发，自己完成发现问题和分类筛选
2. 工作树（Worktrees）：让两个并行干活的智能体不会互相踩脚
3. 技能（Skills）：把那些智能体本来只能靠瞎猜的项目知识写下来
4. 插件和连接器（Plugins / Connectors）：把智能体接到你本来就在用的那些工具上
5. 子智能体（Sub-agents）：让一个出主意，另一个来检查

第六样东西——记忆（memory）。一个 markdown 文件、一块 Linear 看板，什么都行，只要它活在单次对话之外，能记住哪些做完了、接下来该做啥。模型在两次运行之间会把一切都忘光，所以记忆必须落在磁盘上，而不能待在上下文里。智能体会忘，但代码仓库不会。

Codex vs Claude Code 对照：

| 零件 | Codex 应用 | Claude Code |
|------|-----------|-------------|
| 自动化任务 | Automations 标签页、/goal | cron、/loop、/goal、hooks、GitHub Actions |
| 工作树 | 每个线程内置工作树 | git worktree、--worktree、isolation: worktree |
| 技能 | SKILL.md、$name 调用 | SKILL.md |
| 插件/连接器 | MCP 连接器 + 插件 | MCP 服务器 + 插件 |
| 子智能体 | .codex/agents/ TOML 定义 | .claude/agents/ + 智能体团队 |
| 状态 | Markdown / Linear | AGENTS.md / MCP → Linear |

## 自动化任务：循环的心跳

在 Codex 里，Automations 标签页建排程，挑项目/提示词/节奏/环境，发现进 Triage 收件箱，没发现自动归档。OpenAI 内部用于 issue 分类、CI 失败汇总、提交简报、bug 追查。

Claude Code 靠 /loop（按节奏反复跑）、/goal（跑到条件满足为止，有独立小模型验证是否完成）、hooks、cron、GitHub Actions。

## 工作树：并行不冲突

两个智能体改同一个文件 = 两个工程师没打招呼提交。git worktree 给每个智能体独立工作目录，共享仓库历史。

## 技能：不用每次重新解释项目

技能 = 把项目知识写在 SKILL.md 里，智能体每轮都读到。没有技能，循环每轮从零推导项目；有了技能，开始有"复利"。技能是"创作"格式，插件是"分发"方式。

## 插件和连接器：让循环碰到真实工具

连接器（MCP 之上）让智能体读 issue 跟踪、查数据库、戳 API、发 Slack。Codex 和 Claude Code 都讲 MCP 这套"普通话"，写的连接器通常直接互通。

## 子智能体：干活的和检查的分开

写代码的模型给自己改作业太宽容。分开验证者能逮住第一个把自己说服了的问题。/goal 底层就是这套：全新模型判断循环是否完成，不是干活的模型自己判断。

## 一个循环长什么样

自动化任务每天早上跑 → 调分类技能 → 读 CI 失败/issue/提交 → 写入 markdown/Linear → 每条发现开工作树 → 派子智能体起草修复 → 第二个子智能体审查 → 连接器开 PR/更新工单 → 搞不定的进收件箱。状态文件是脊梁骨，记着试过什么、什么过了、什么还开着。

## 三个仍然搞不定的问题

1. 验证仍在头上：无人值守跑着 = 无人值守犯着错。"做完了"是声明不是证明
2. 理解债（comprehension debt）：循环越快交付你没写的代码，"真实存在"和"你实际搞懂"的鸿沟越大
3. 认知投降（cognitive surrender）：最舒服的姿势恰是最危险的——循环给啥收啥。设计循环带判断力是解药，为逃避思考则是助燃剂

设计循环比提示词工程更难，不是更简单。Cherny 的意思不是工作变容易了，而是杠杆的支点挪了位置。
