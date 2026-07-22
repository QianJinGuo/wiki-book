---
title: claude-code-kairos-paradigm-2026
source_url: https://mp.weixin.qq.com/s/Ecq8x7GLYT7RhHFHB64SXQ
source: wechat
publish_date: 2026-05-07
tags: [wechat, article, claude, agent, coding]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 56f77dafae154f0a50798064a721806496353ffcfcf65039cad1fe09326bbe6b
---
在 Claude Code 的代码中，如果只算 KAIROS 出现的次数，其出现了 154 次；如果算上以其为前缀的变量啥的，其出现了 365 次。KAIROS 是什么？简单来说，KAIROS 是 Claude Code 未来的 AI 形态，一个在恰当时机出现的，一直在线的协同工作伙伴。
KAIROS (καιρός) 源自古希腊语，意为「正确的、关键的或合宜的时刻」，代表定性的、超越时序的「时机」或「关键瞬间」。
KAIROS 这件事，重点从来不在于它多了几个工具开关，也不在于文档里写了多少「常驻助手」「主动工作」这种产品话术。它真正改变的，是 Claude Code 的运行范式：从「终端里的同步问答器」，切到「长期在线、异步协作、跨渠道接入、能自己维持工作节奏的常驻代理」。
问题也在这里。KAIROS 现在的仓库状态，远没有到「产品封版」的程度。外围能力已经长出不少，主闭环还没彻底打穿。Bridge、Brief、频道消息、每日记忆日志、后台任务基础设施，这些都不是 PPT。assistant 主入口、gate、proactive 状态、session discovery 这些地方，又明显还是 stub。
KAIROS 改写的不是功能，是运行模型
普通 CLI 的交互模型很简单：用户打开终端，输入一条指令，模型分析上下文，调用工具，给出回答，进程结束。这个模式有一个天然上限：AI 只在用户看着终端的时候存在。用户不在，系统就不工作。外部事件来了，也接不住。
KAIROS 想改掉的，就是这个上限。它想要的模型是：会话可以长期存在、进程重启后还能接回原来的会话、外部系统可以把消息推到这个会话里、用户没有新输入时 Agent 也能继续推进任务。
从代码现状看，KAIROS 已经是一组能力家族。已有的子功能包括：KAIROS_BRIEF、KAIROS_CHANNELS、KAIROS_PUSH_NOTIFICATION、KAIROS_GITHUB_WEBHOOKS、KAIROS_DREAM。工具注册层能看到：SleepTool、SendUserFileTool、PushNotificationTool、SubscribePRTool。
KAIROS 的动作集合变成：等待、监听、回传、唤醒、跨渠道接入、持续维持上下文。这说明它的定位已经不再是单纯的「本地操作器」，它正往「工作流中枢」走。
Bridge 是 KAIROS 最关键的基础设施之一
Bridge 的数据流：远端入口收到用户消息，通过 bridge 拉取工作，创建或恢复 REPL，会话继续执行，再把结果回传。
代码里关键点在 useReplBridge。assistant 模式下会启用 perpetual bridge session，目的是让远端看到的是同一条持续会话，而不是每次 CLI 启动都开一条新的 session。
但真实闭环卡住的地方，不在 Bridge 本身，而在几个关键层：身份判定（isAssistantMode() 返回 false）、gate 放行（isKairosEnabled() 返回 false）、会话发现（discovery 返回空数组）、proactive 状态模块还是 stub。
KAIROS 为什么必须改写记忆系统
普通模式下，长期记忆更接近「主题文件 + 索引」：新信息被整理成相对成型的 topic files，MEMORY.md 维护索引。这个模式适合短周期会话。
KAIROS 场景不一样。它面对的是：长时间持续执行、高频事件流输入、用户不一定实时盯着、外部渠道消息可能随时插入、大量信息是过程态不适合立刻主题化。
daily log 方案：白天先 append-only 记录到当日日志，不急着重组和提炼，后续再把成熟信息蒸馏成长期 memory。这是典型的事件流优先设计。
KAIROS 还想把 session transcript 也纳入记忆蒸馏输入。这意味着长期记忆的来源，不再只靠模型「当前轮总结出的信息」，而是开始吸收完整工作轨迹。
Brief 不是 UI 花活
Brief 是异步协作场景里的输出压缩层。在异步工作场景（后台任务跑了两小时、外部 webhook 触发检查、Slack 推来状态更新）里，Brief 用最低认知成本传递足够状态。这是工程问题，不是文案问题。
KAIROS 的产品价值，核心在五个地方：
1. 留存会显著提升——常驻会话、跨重启续接、长期记忆、异步回传组合起来，用户会开始把 Claude Code 当成「当前项目的长期协作体」
2. 任务完成度会提升——后台执行、sleep 唤醒、外部事件驱动，补上了高价值任务的缺口
3. 渠道覆盖会扩大——channels、push、bridge、webhook，触点明显增加
4. 粘性会增强——上下文越深，替换成本越高
5. 产品想象空间抬高——竞争对象从 coding assistant 变成开发团队的操作层代理
KAIROS 的代价主要有四类：
1. 系统复杂度暴涨——长生命周期会话、bridge 重连、幂等外部事件、后台任务状态、唤醒节奏
2. 成本模型会变差——tick + sleep 本质上是用更多调用换取持续在线行为
3. 安全与信任门槛更高——trusted directory 检查、KAIROS gate 是产品级放行逻辑
4. 产品承诺和实现闭环还没完全对齐——主入口和核心状态闭环仍有明显缺口
当前仓库成熟度评估：
- 产品意图非常清楚：方向一致，不是东一块西一块拼起来的
- 框架布线已经做了很多：工具层、提示词层、bridge 层、memory prompt 分叉、channel notification
- 关键外围能力有真实实现：Bridge perpetual session、频道消息接入、Brief 规则、daily-log memory prompt
- 主入口和核心状态闭环仍有明显缺口：assistant 主模块、gate、session discovery、proactive 状态、session transcript 等地方还是 stub