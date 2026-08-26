---
source_url: https://mp.weixin.qq.com/s/UEMvxXDM4yYwur5C_8L0fw
ingested: 2026-08-26
sha256: e41b598c2d447a99158f49a80dec2c570cac68f7a8dacbac175d1d452ed8aeaa
title: "Grok Bot 0.18 代码泄露，Agent 的五层运行时解读"
author: VibeCoder
source: Vibe编码 (微信公众号)
score_v: 8
score_c: 6
score_vc: 48
decision: entity
---

# Grok Bot 0.18 代码泄露，Agent 的五层运行时解读

2026 年 8 月 23 日，一个 Grok Bot 0.18.0 的非官方重建仓库出现在 GitHub。社区把它叫作"Grok Build 源码泄露"，但作者澄清这混了两个产品，也放大了证据。固定样本确实来自正式分发：macOS 包由 Anysphere Developer ID 签名并通过 Apple 公证。原包里没有标准 source map，也没有官方 monorepo。真正暴露的是三组约 145 万行的运行时 CJS bundle，里面保留了大量函数名、注释、源路径和模块边界，足够让第三方把 Host、Coordinator、Agent runtime 和执行协议恢复成可读 TypeScript。

## 先把"泄露"背景讲准
这次对象是 Grok Bot。它在 8 月 11 日进入 early beta，定位是拥有持久云电脑、能跨浏览器、文件、终端和插件工作的 AI 队友。名字相近的 Grok Build 是终端编码 Agent，7 月已经由官方开源。仓库作者也写得很明确：这是 unofficial、source-oriented reconstruction。source/ 可以帮助追运行时调用链，模块命名与边界仍可能经过重写。前端的情况更严格，发行包只有优化后的 renderer bundle；仓库里的可读前端依靠字节锚点和协议行为恢复，不能当成官方 React 源码。更准确地把这次定性为"公开客户端引发的高保真实现重建"，已接近"实现泄露"，离"原始源码仓库泄露"还有证据距离。

## Agent 不是聊天窗口
把代码顺着一次 sendPrompt 读下去，会看到六层：Renderer、Electron main/preload、Node coordinator、Host/transcript、Agent runtime，以及末端执行 surface。Renderer 负责消息、卡片和 Computer 画面。preload 只暴露窄 bridge 与单 owner 的 MessagePort。Coordinator 接住 renderer RPC，再连接长期运行的 Host。Host 持有 transcript、幂等接收、每个 Agent 的 turn lane 和用户可见状态。进入 turn shell 后，系统才建立 generation、权限 epoch、隐私模式、MCP discovery 和 box readiness。Production owner 把本轮 resource accessor、prompt session、summary session 与 tool host 绑好，AnysphereAgent.runStream 才恢复 conversation state，进入模型与工具循环。

聊天窗口是控制面。任务能跑很久，靠的是后面的持久 Host、明确 owner 和状态提交协议。这条链路还有两个很稳的细节。输入端用 nonce 加 digest 做 durable acceptance，网络重试不会生成重复回合；状态端用 generation fence，旧 turn 被新消息打断后，即使晚到也不能覆盖新状态。

## Prompt 要由运行时兑现
Grok Bot 的基础提示词规定了一套固定节奏：先回复，选择正确的工作 surface，边做边报，展示证据，再把任务闭环。更关键的规则藏在消息语义里：普通 assistant text 主要服务内部活动流，只有 SendMessage 才算真正发给用户。

只靠提示词，长任务很容易安静地调用几十次工具。这里加了两道 runtime 监督。Agent 在第一次回复前先用工具，start-of-turn middleware 会塞入提醒；连续工具调用超过阈值还没有消息，send-message middleware 会催它汇报。turn 结束时，transcript runtime 再检查 SendMessage 是否真的进入用户可见记录。Prompt 是行为合同，middleware 负责巡检，settlement 负责验收。模型偶尔偏离指令很正常，系统不能把全部可靠性押在"它这次会记得"。

System prompt 也不是一段静态人格。它按固定顺序拼接 profile、身份、时区、memory、automation、workflow、channels、Agent directory、MCP、box 与 Computer 能力。Profile 和 memory 在同一个 compaction epoch 内冻结，避免长 turn 中途改变系统身份或过去事实。

## Toolset 本身就是权限策略
很多 Agent 框架启动时把工具全部注册好，再靠提示词告诉模型哪些能用。Grok Bot 每轮重新构建 toolset。主 Agent、Subagent、共享房间、Computer 未就绪、MCP 尚未发现，拿到的工具都不同。Shared room 会再缩成白名单。Subagent 的配置缺失时可以直接得到空工具集。没有本轮 resource accessor 的能力不会出现在 schema 里，执行器缺失时也会 fail closed。

这带来一个很实用的工程判断：工具是否存在，本身就是 Policy。模型看不到无权使用的能力，schema 与 executor 不会出现一边存在、一边失联的尴尬状态。低频 MCP 工具还采用二级发现，先暴露 meta tool，等 live projection 成立后再加载具体 connector，减少上下文浪费。

## Context 需要四条通道
长任务最怕压缩之后丢掉承诺。这个实现没有把所有连续性都塞进 summary。Summary 只管对话语义。unused context 低于 10,000 tokens 或 10% 时启动后台摘要，到 5,000 tokens 或 5% 才允许持久化。碰到 token 或图片限制，会切成阻塞式 summary。输入过大时使用 max-min fair allocation：小消息先保全，大消息共享剩余预算，用户查询块会被额外保护。这样一份巨型工具日志不会吃掉全部历史。Durable Blocks 保存计划、待办、项目根、运行模式、自动化和技能。Memory 再拆成 profile 与 recent，并给 user、project、agent 不同预算与写入边界。GUI 子任务还有 latest image，穿过 compaction 后仍能看到当前页面。这四条通道各管一件事：语义、承诺、长期事实、视觉状态。摘要写差了，任务计划还在；长期偏好也不会挤掉当轮消息。

## Approval 绑定动作，也绑定页面
安全链有两层。Local-tool permission 管"能不能碰用户机器"，状态是 never、ask、always。一次批准绑定 Agent、tool call、动作、目标和 direction epoch；新 turn 会退休旧批准，同方向内的重复拒绝也会被记住。Auto-review 再判断这次副作用是否越过策略。Shell、MCP、Computer、cloud agent、subagent 都有独立 surface。分类失败默认 reject。Computer 操作会把具体动作、目的、box 和页面 display-state identity 一起纳入批准，用户点完允许后，执行前还要重新检查页面。窗口或页面已经变了，旧卡立刻失效。脚本执行也有类似约束。系统会把可执行文件、包脚本和规范化 target 补进审查对象，对脚本内容计算 SHA-256。用户批准的是那次动作和当时内容，不是一张永久通行证。

这里也有边界。Electron 主窗口启用了 context isolation 并关闭 Node integration，Chromium sandbox 却是关闭状态，进程还追加了 no-sandbox。它的安全主要来自窄 bridge、协议校验和业务权限，不能宣传成 OS 级隔离。

## 回复也要支持故障恢复
整套实现最少见的部分，是它把回复当成了可恢复 side effect。SendMessage 能发送文本、图片组、附件、widget、secret 和 thread。Turn result 会记录发送数与 reaction；两者都没有出现，系统认为交付义务尚未完成，最多再跑三次隐藏 nudge。消息接受、发送与确认也不是一个瞬间动作。Ack obligation 会持久化，进程中断或重启后可以 redrive。系统无法确认旧动作是否完成时，会要求用户重新发送，不会假装成功。新用户消息还有更高优先级，可以中断旧 turn；旧 run 的 late checkpoint 又会被 generation fence 丢弃。这几块连起来，reply 就有了和文件写入相似的可靠性语义：接收幂等、执行可中断、状态防回滚、交付可补偿。

## Router 很有意思，但它属于扩展
仓库里的 Router 设置页很容易让人误判。它支持 Cursor、Claude Code、Codex 与 OpenRouter，也加了本地 Docker box。这些内容是重建作者明确列出的扩展。非 Cursor provider 会在 Coordinator 处分流，使用本地 transcript 和一段很短的 Router prompt。Claude Code 走临时 MCP bridge，Codex 走 Responses SSE，OpenRouter 走 AI SDK，最多执行 8 个 turn 或 step。这条旁路没有完整经过原生 Host 的 prompt assembly、memory freeze、durable conversation state 和长循环。它证明了同一套 UI 协议可以挂多个 provider。它没有证明 Grok Bot 0.18 原生 Agent 就是这段简化 Router。

固定 commit 下，作者跑过 TypeScript typecheck 和 10 个高信息量契约测试，覆盖 Codex SSE/tool continuation、截断流 fail-closed、MCP 转换、transcript 持久化、Router 设置与 updater guard。当前环境是 Node 24.19.0，项目声明 Node 26.5，所以这组结果只证明源码契约可运行，不代表正式打包验证通过。

## 总结
拆完这套运行时，作者带走五个判断。Prompt 是合同。Middleware 与 settlement 才能让行为要求真正落地。Toolset 是策略。每轮最小化装配能力，比给模型一张全局工具表稳得多。Context 要分层。语义、承诺、长期事实和视觉状态各走一条通道。Approval 要绑定状态。动作、内容、方向、页面任一变化，都应该让旧授权失效。Reply 是交付。Acceptance、ack 与 redrive 让中断后的任务还能继续兑现。

这份重建代码最大的价值，不是满足我们看闭源实现的好奇心。它给了一份罕见的 Agent runtime 切面：模型只负责下一步判断，可靠性来自模型外的一整圈协议。至于这样的共享云电脑模式能否长期守住凭据和隔离边界，作者表示会继续盯着后续版本。
