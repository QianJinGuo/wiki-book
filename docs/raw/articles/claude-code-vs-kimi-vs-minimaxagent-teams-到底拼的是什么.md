---
source: wechat
source_url: https://mp.weixin.qq.com/s/uYPjM9ldS7-fkNKGAk1_mA
ingested: 2026-07-10
feed_name: 科技充电站
wechat_mp_fakeid: MP_WXS_3237134318
source_published: 2026-05-21
sha256: 2ec01f27fc2b5f751d9e8af8d6bff4361eab4023598c6d3dbc0848472af26b46
---

# Claude Code vs Kimi vs MiniMax：Agent Teams 到底拼的是什么？

大家好，我是行小招。

最近 Agent Teams 这个概念又热起来了，Claude Code 在推 agent teams，Kimi K2.5 直接把 Agent Swarm 做成了一个模型能力，MiniMax Mavis 则把 Owner、Worker、Verifier 这一套做成了产品里的协作机制。

我看完这几家的实现后，体感很明确：Agent Teams 不是让一堆 agent 坐在一起开会，也不是把 prompt 写成“你是架构师、你是测试、你是安全专家”这么简单。

真正有价值的 Agent Teams，拼的是外面那层 harness，说白了：模型负责聪明，harness 负责管住聪明，没有 harness，多 agent 很容易变成一群很贵的复读机。

我现在用 AI 写代码、查资料、做自动化，最烦的不是它不会，而是它跑着跑着就失忆、停住、跑偏。

一个复杂任务给出去，本来有 7 个步骤，它做到第 3 个就开始问“是否继续”，这不是它不努力，而是单 agent 对“任务到底结束没结束”没有物理感知，只能在上下文里猜。

更麻烦的是长任务：日志、网页、报错、搜索结果一多，context 就开始腐烂，前面约束过的东西，它后面可能忘了，前面定好的风格，它后面可能变了，尼玛就像一个人加班到凌晨三点，嘴上说自己没问题，手已经开始乱敲了。

还有一个很现实的体验：如果 agent 接在 IM 或 IDE 里，用户想要的是秒回，后台任务想要的是几分钟甚至几十分钟，单 agent 把这俩线程混在一起，就很容易出现两种结果，要么秒回一堆废话，要么半天没动静。

所以 Agent Teams 的第一性问题，不是“能不能多开几个 agent”，而是：谁来决定任务怎么拆，谁来决定什么时候停，谁来隔离上下文，谁来验收结果。

**多 agent 的价值，不在于人多，而在于能不能把混乱变成流程。**

##  Harness 才是主角

这里有个很关键的公式：Agent = Model + Harness，Model 是大脑，Harness 是控制平面，工具权限、上下文隔离、任务队列、状态机、审批门禁、日志观测、成本控制，基本都在 harness 这一层。

如果没有 harness，多 agent 只是“多几个大脑同时说话”。听起来很热闹，实际很容易共识塌陷，几个 agent 互相附和，结果一起错，token 还烧得贼快。

我比较认可的 Agent Teams，至少要有这 6 层东西：

控制层  |  要解决的问题  |  典型做法
---|---|---
调度流  |  长任务不能跑着跑着停  |  状态机、任务队列、Ralph Loop
工具层  |  agent 不能随便碰高危工具  |  MCP、沙盒、权限分级
记忆层  |  context 不能无限塞  |  文件即内存、摘要落盘、按需读取
门控层  |  不能无限循环自嗨  |  Plan、Execute、Verify 分阶段
安全层  |  高风险动作必须拦住  |  approval gate、凭据隔离、人类确认
观测层  |  出事要知道谁干的  |  telemetry、任务日志、成本统计

这张表其实比“哪个模型更聪明”更重要：模型再强，如果没有这些东西，长任务一上来还是会变成玄学。

##  Claude Code：最像工程团队

Claude Code 的 Agent Teams，最适合放在软件工程场景里看，它不是简单的 subagent：subagent 更像“我派你出去查一下，回来给我一个摘要”，用完就没了，Agent Teams 里的 teammate 更像一个长期在线的同事，有自己的 context，可以直接跟其他 teammate 通信，也可以认领任务。

Claude Code 这套设计里，我最喜欢两个点：一个是共享 task list，任务不是靠主 agent 嘴上记着，而是落在本地文件里，有状态、有依赖、有 claim 机制，多个 teammate 抢任务时，还会用 file locking 防止竞态。

另一个是 mailbox，agent 之间不是把所有信息广播到一个大群里，而是点对点发消息，前端 agent 需要问后端接口，就发给后端，安全 reviewer 不需要知道 UI 细节，就别污染它的 context。

这就很工程化了，甚至有点像把一个小型研发团队塞进终端里，再加上 tmux 或 iTerm2 分屏，人可以看到每个 teammate 在干啥，这种可观测性对 coding agent 很关键。

但它的边界也很明显：Claude Code 官方也说 agent teams 还是实验能力，而且 token 成本会随着 teammate 数量上涨，它适合独立工作流并行，不适合同一个文件里几个人同时动刀。

**Claude Code 的强项不是“群殴”，而是把工程协作搬进 agent runtime。**

##  Kimi K2.5：最像搜索集团军

Kimi K2.5 的 Agent Swarm 是另一种路线：Claude Code 更偏本地工程目录里的深挖，Kimi 更偏“广度搜索”。官方资料里写得很直接：K2.5 Agent Swarm 可以自组织最多 100 个 sub-agents，执行最多 1500 次并行工具调用，在大规模研究、长文写作、批量下载这类任务里，端到端耗时最高能降到原来的 1/4.5。

这就不是普通框架层面多开几个 agent 了，Kimi 把并发编排能力放进了训练里，用 PARL，也就是 Parallel-Agent Reinforcement Learning，让 orchestrator 学会什么时候拆任务、什么时候并行、什么时候别为了并行而并行，这个点很鸡贼，也很重要。

因为多 agent 最容易出现两种假繁荣：一种是串行崩塌，嘴上说并行，实际还是一个一个做；另一种是虚假并发，开了 100 个 agent，结果每个都没干正事，纯纯装了个寂寞。

Kimi 的价值在于：它试图让模型自己学会并发拓扑，而不是完全依赖人类提前写 workflow，用在人类不清楚资料分布、需要大范围撒网的任务上，这个路线很香。

但它也不是万能：Swarm 很适合“找信息、归纳信息、交叉验证信息”，未必天然适合“在一个代码仓库里精细改 7 个模块”，后者更需要权限、文件归属、测试门禁和可回滚的工程治理。

**Kimi 的强项是规模化探索，它解决的是广度，不是所有场景里的深度治理。**

##  MiniMax Mavis：最像产品化工作流

MiniMax Mavis 这次让我比较感兴趣的地方，不是它说自己有多少 agent，而是它把单 agent 的几个真实痛点讲得很产品化：长任务会突然停，context 变长后质量下降，复杂任务会阻塞用户交互，prompt 角色扮演做不到真正分工，这些问题我都有体感，而且很真实。

Mavis 的思路是用状态机接管流程，把前台响应和后台执行拆开：用户发来一个复杂任务，前台先快速确认，后台再让不同角色推进，状态从等待、执行、校验、失败重试到完成，不靠模型自己拍脑袋，而是由代码里的状态机推进。

它里面的 Owner、Worker、Verifier 也很有意思：Owner 拆任务和调度，Worker 负责执行，Verifier 负责独立验证。关键是 Worker 和 Verifier 的上下文要隔离，Verifier 不能被 Worker 的思路污染，Worker 说“我做好了”，Verifier 要像一个不近人情的质检一样去查链接、查事实、查格式、查代码是否真能跑。

这对 Office 文档、长篇研报、业务流程类 agent 很关键，因为这些任务不是只要“看起来像完成了”，而是要能交付、能追溯、能被人接着用。

当然，Mavis 这块公开资料没有 Claude Code 和 Kimi 那么细，它的底层实现细节，我们目前更多能看到产品叙事和发布信息，所以我会谨慎一点看：方向很对，但具体工程成熟度还要看真实使用体感。

**MiniMax 的强项是把 agent 从聊天框里拽出来，放进一个可治理的产品流程。**

##  三家到底怎么选

如果只看 Agent Teams 这个词，三家都在讲多 agent，但放到真实场景里，它们其实不是一个物种。

维度  |  Claude Code Agent Teams  |  Kimi K2.5 Agent Swarm  |  MiniMax Mavis Agent Teams
---|---|---|---
核心场景  |  本地代码工程、重构、review  |  大规模研究、搜索、资料处理  |  长任务产品化、IM 交互、文档交付
协作形态  |  teammate 对等协作  |  orchestrator 调度百级 swarm  |  Owner、Worker、Verifier 分工
关键能力  |  task list、mailbox、tmux 可观测  |  PARL 训练出的并发编排  |  状态机、前后端解耦、对抗验证
最大价值  |  把工程协作显性化  |  把搜索吞吐拉满  |  把长任务流程产品化
主要风险  |  token 贵、实验能力、协作开销  |  广度强，精细工程治理要另看  |  公开细节少，需看实际体验

我的判断是：如果你主要做代码仓库里的复杂改造，Claude Code 这条路线最值得研究，它的核心不是“多开”，而是任务依赖、消息通信、权限和可观测性，这些都是工程协作里绕不开的东西。

如果你做的是深度调研、竞品分析、资料收集、批量网页处理，Kimi 的 Agent Swarm 更有想象力，它把问题从“一个 agent 怎么更聪明”换成了“一群 agent 怎么更快覆盖信息空间”。

如果你做的是面向用户的产品化 agent，尤其是 IM、办公文档、企业流程，MiniMax Mavis 的方向值得看：前台不阻塞、后台有状态、交付有 Verifier，这比单纯堆模型靠谱得多。

##  我真正关心的选型点

如果让我自己做 Agent Teams，我不会先问“能开几个 agent”，我会先问 5 个问题：

问题  |  为什么重要
---|---
任务状态是不是落盘  |  不落盘，长任务迟早被 context 拖死
agent 之间是不是隔离  |  不隔离，多角色只是 prompt cosplay
验证者是不是独立  |  不独立，自检很容易变成自我安慰
高风险动作有没有验证  |  没有 approval gate，越自动越危险
成本有没有熔断  |  没有 retry 上限，账单会替你做决定

这也是我看这波 Agent Teams 最深的感受：未来的差距不只在模型，更在 runtime 和 harness。

模型像武林高手，招式越来越强，但真正能打大仗的，不是单挑王，而是粮草、军纪、斥候、军法官和后勤系统，没有这些，再强的高手也只能打擂台，打不了战役。

所以，Agent Teams 不是 AI 开始“组队打工”这么简单，它标志着 agent 从聊天产品，开始往工程基础设施走。

别急着迷信 swarm，也别急着嫌弃单 agent。

先看你的任务是不是值得拆，再看你的 harness 管不管得住：管不住，10 个 agent 只是 10 倍混乱，管得住，3 个 agent 就可能是真团队。

* * *

我是行小招，持续探索 AI 在个人和企业中的落地场景，交给 AI 的是任务，留给自己的是思考。欢迎转发给你身边做技术和产品的同学，一起追逐这个时代！
