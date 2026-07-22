---
title: Harness 到底是什么？看看 OpenClaw、Hermes、Claude Code 的演绎吧
source_url: https://mp.weixin.qq.com/s/p1aNuDIXXnZPLvU2D6MwXQ
publish_date: 2026-05-07
tags: [wechat, article, claude, agent, harness, coding, openclaw]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 84cf8b0ea895d806d71eeffa6d326be6e55369df0d5651cd1a07757c1409ab4e
---
# Harness 到底是什么？看看 OpenClaw、Hermes、Claude Code 的演绎吧
> Source: https://mp.weixin.qq.com/s/p1aNuDIXXnZPLvU2D6MwXQ
> Author: 叶小钗 (AI训练营)
> Date: 2026-05-07
> Collected: 2026-05-07
## 内容
Harness 最近有些小火，但这东西跟 OpenClaw 和 Hermes 不一样，到现在都只有个框架性描述：为 Agent 的稳定执行而生。要了解 Harness 不仅要看大概念，最好借助现在实际运行的很好的 Agent 框架，比如 Claude Code、OpenClaw、Hermes。
Martin Fowler 在 2026 年 4 月写的文章里，把 Harness Engineering 直接定义成一套围绕 coding agent 的信任建设模型，核心是通过上下文、约束、反馈回路和工程结构，让人逐步敢把任务交给 Agent。
Anthropic 自己也在官方工程文章里直接把 Claude Code 叫作一种优秀的 harness，并且进一步讨论了 long-running agents 和 long-running application development 里的 harness design。
## 模型与工程
过去两年大模型公司主要围绕 Agent 生态：语义理解、视觉生成、长上下文、工具调用、多模态、电脑操作、浏览器操作。
业界有一个重要假设：只要模型不断更强，应用自然就会自己长出来。但实际情况是长上下文和 tool calling 稳定性上来以后，Agent 这条线确实一下子变得好做了很多。但问题是：**模型强，不等于工程就稳。**
总有很多跳出的边界：
- 模型无论如何依旧会工具调用不准、不稳
- 模型能理解复杂输入，但在持续推进一个长任务时候依旧吃力
- 模型能写出代码，不代表它知道自己到底写对了没有
而工程架构的意义在于，让 Agent 稳定地把事情做完。2025 年到 2026 年，Agent 讨论的重心开始明显变化：
- 以前大家讨论 Prompt 怎么写
- 后来讨论 Context 怎么喂
- 现在真正开始讨论：Agent 运行起来以后，还缺什么系统能力
## 什么是 Harness
Harness 是把模型能力变成持续、稳定、可验证产品能力的那套系统集合。
**Prompt → Context → Harness** 的演进：
1. **Prompt Engineering**：把行业 know-how 翻译成自然语言指令。few-shot、role prompt、CoT、输出格式约束、提示词模板。
2. **Context Engineering**：哪些私有知识带进来、哪些历史聊天保留、如何压缩超长上下文、如何做检索、如何让模型不失忆。核心是数据工程。
3. **Harness Engineering**：Agent 开始不满足于问答，开始调工具、跑代码、拆任务、看页面、写文档、多轮循环、长时执行、子 Agent 委派、中断恢复、测试与验收。
## 三个框架对比
### 1. OpenClaw：先把 Agent 管住
OpenClaw 的官方文档和仓库公开能力，明显偏受控运行时。把 Skills、Gateway、安全边界、Sub-agents、Sandbox 都拆得很清楚。
- 使用 AgentSkills-compatible 的 skill folder，每个技能目录里有 SKILL.md，加载时按环境、配置和依赖做过滤
- 假设 personal assistant security model，信任边界内的个人助理部署
- **系统工程目标**：先把权限、边界、角色、技能、执行环境组织起来，再让 Agent 干活
- **工程方向**：怎么让 Agent 安全、稳定、受控地执行任务？
### 2. Hermes：先让 Agent 长本事
Hermes把自己定义为 "the self-improving AI agent"，核心能力写成学习闭环：
- creates skills from experience
- improves them during use
- nudges itself to persist knowledge
- searches its own past conversations
- builds a deepening model of who you are across sessions
官方文档明确提供 8 种 external memory provider，built-in MEMORY.md / USER.md 始终存在，同时只能启用一个外部 provider。
- **系统工程目标**：先让 Agent 学会从经验中成长，再慢慢补边界和治理
- **工程方向**：怎么让 Agent 越用越强、越用越像一个长期助手？
### 3. Claude Code
Anthropic 官方已经把与 Claude Code 同源的能力开放成 Claude Agent SDK，明确说这套 SDK 提供的正是 Claude Code 背后的 tools、agent loop 和 context management。
连续写了几篇工程文章，专门讲：长时 agent 的 harness 怎么设计、application development 场景下 harness 怎么优化、Claude Code 为什么本身就是一个优秀 harness。
Claude Code 的价值不只是模型强，而是：它已经把模型之外那一整套工程壳子做到相当重要了。
## Harness 七层模型
### 第一层：角色与规则
一个模型接到任务后，第一件事不是调工具，而是先明确：它是谁、负责规划/执行还是验收、边界在哪、碰到不确定情况怎么办。
- **OpenClaw**：Skill 是人写的，规则是人定的，边界是系统设的，Agent 更多是在框架内执行
- **Hermes**：更愿意把一部分能力判断交给 Agent 自己，比如什么时候生成新 Skill，什么时候更新旧 Skill
- **Claude Code**：把角色和节奏预埋进系统，agent loop、context management、长时任务 initializer / coding agent 分工
### 第二层：记忆系统
任务变长后产生大量中间结果：拆出来的子任务、讨论过的方案、当前做到哪一步、用户偏好、历史错误、成功经验。
- **OpenClaw**：对记忆态度很克制，更接近可替换能力位
- **Hermes**：完整体系：内置 MEMORY.md、USER.md，叠加 external memory provider，再叠加 session search
- **Claude Code**：强调长时任务里，清晰 artifact 和 handoff 特别重要，让下一次 session 能接着做
记忆系统的本质：任务过程能不能留下痕迹，系统下次还能不能接上做展开。
### 第三层：上下文加载机制
真实 Agent 场景里模型前面能看的东西越来越多：角色与规则、历史对话、记忆、技能、工具结果、当前任务……问题就来了：**不是信息不够，而是信息太多。**
- **OpenClaw** 的 Skills 加载逻辑本质是一种上下文过滤：按环境、配置和依赖去筛
- **Hermes**：session search 不是把历史原文一股脑塞回来，而是先检索，再经过处理；支持 context engine plugin
**核心问题**：如何在每一轮只给模型当前最需要的那部分？做不好这层，系统会两头出问题：看得太少像失忆，看得太多开始变蠢。
### 第四层：稳定执行
工具怎么接、命令怎么跑、文件怎么读写、页面怎么查看、代码怎么执行、结果怎么回收……这些 Tools 动作全部依赖工程关注，因为它们依赖于第三方，必定经常出问题。
- **OpenClaw**：典型安全优先的运行时
- **Hermes**：更像执行后端可切换，可以跑在本地、VPS、GPU 集群和接近零空闲成本的 serverless 环境
**本层目标**：把语言判断稳定地变成真实动作。没有这一层、这一层做不好，就会经常出错。
### 第五层：有效循环
Agent 会因为要处理复杂的问题，不可避免进入循环：理解任务→决定下一步→执行→读结果→判断下一步，一直循环到收口。
- **OpenClaw**：多 Agent、skills、runtime 围绕循环推进做
- **Hermes**：把 delegate、skills、memory、search、provider hooks 都嵌在这个循环里
**核心问题**：会不会空耗 token 和时间，却没有实质推进？系统工程里担心的不是循环，而是钱花了，事情没干。
### 第六层：评分与可观测性
模型最大的问题之一，不是不会做，而是经常觉得自己已经做完了。系统不能只听模型自己汇报"我完成了"，而是要能通过测试、日志、页面验收、运行指标、人工审查、Benchmark 等方式，真实地看到它做了什么、做到什么程度、结果到底好不好。
- **OpenClaw**：制度化，靠规则、沙箱、受控执行去约束结果
- **Hermes**：学习闭环，把执行结果、错误路径、成功经验逐步沉淀成 Skill 或 Memory
**本层目标**：不要让模型稀里糊涂自己给自己打高分。
### 第七层：中断恢复
模型在循环往复的时候，整体 SOP 会不会后退、如何后退就很关键了。真实世界任务会中断、会超时、会切 session、会失败重试。
- **Hermes**：通过 MEMORY、USER、session search、external provider 把接续做成系统能力
- **OpenClaw**：更偏流程与痕迹受控
**本层目标**：如何把断掉的任务重新接起来？
## OpenClaw 中的 Harness 具体实现
### MCP/工具链
Tools 解决能做什么；Skills 解决这些事具体该怎么做。
Tools 出点问题，整个流程就断了，而且这是依赖于第三方的，本来就容易出问题：
- API 变动
- 权限变动
- 插件失效、插件参数变化
OpenClaw 把 Tools、Plugins、Gateway、外部能力接入都放进一个有边界感的系统里，让模型能不能在一个被约束的能力平面里稳定地调工具。
### Skills
Skills 是方法稳定器，让模型不要过于发散；Skill 的 Workflow 提示词会进一步带来稳定性，可以把高频任务的方法沉淀下来。
但 OpenClaw 这种平台型 Agent 中 Skills 问题也同样明显：
- Skill 可能来自第三方
- Skill 本质上会进入 prompt 构造链路，模型本来就脆弱，很容易被恶意或低质量提示词污染
- 一旦 skill 机制失控，Agent 的方法层就会整体失真
OpenClaw 的兜底策略：把 Skills 放进受控加载链里，比如 plugin skills 只是低优先级路径，同名 skill 会被 bundled / managed / agent / workspace skill 覆盖；workspace 和 extra-dir 的 skill discovery 只接受解析后 realpath 仍留在配置根目录内的 skill root 和 SKILL.md，避免路径穿越和任意逃逸。
### Runtime
OpenClaw 在执行复杂任务时会进入循环：理解问题→决定下一步→调工具、读文件、跑代码→看返回结果→判断接下来该做什么→循环到任务真正收口。
真实情况都是 BUG 频出：模型可能跑着跑着提前收尾，明明事情还没做完就告诉你已经处理好了；可能做了一半又绕回原地，重复调用同一个工具。
Runtime 承担：把 Agent 的行为从一堆零散动作组织成一条真正能推进任务的流程。包括整个项目的可观测性和中断重试的逻辑。
## 结语
Harness 不是模块，而是一条咬硬骨头走出来的方法论。
Agent 从会答、到会做、到能稳定做完，整条链上缺的所有工程能力，这就是 Harness：
- 一开始只是接工具
- 然后发现工具不稳，要加规则
- 再发现规则不够，要加 Skills
- 再发现 Skills 还不够，要加 Runtime 和 Workflow
- 再发现任务会假完成，就要补评分与可观测性
- 再发现任务会中断，就得补恢复能力
Harness 以后未必还叫 Harness，但这条路，肯定不会消失。