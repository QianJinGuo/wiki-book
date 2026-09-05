---
title: "最近 AI 圈有个新概念又火了，叫 Loop Engineering"
source_url: "https://mp.weixin.qq.com/s/Tzyekcte8cnUoCw32q85Fg"
ingested: 2026-07-01
sha256: 89999b6a709c3b441e32aac7f2ae8d57015bc680ad41af6fa264a820d92b296c
---

最近 AI 圈有个新概念又火了，叫 Loop Engineering   

这又是咋回事呢？   

起源是这样的：6 月 7 号，OpenClaw 创始人 Peter 发了一句话引爆社区：You shouldn't be prompting coding agents anymore. You should be designing loops that prompt your agents   

几天后 Claude Code 负责人 Boris Cherny 在演讲里又说了几乎一样的话   

两个大佬同时表态，社区就把这件事又提炼成了一个新范式 — Loop Engineering。   

简单理解：Loop Engineering 是设计一套能在无人干预的情况下让 Agent 能自主循环执行任务直到达成目标的系统。   

你定义触发条件、目标、验证方式和退出机制，系统自己跑、自己检查、自己决定下一步 — 直到满足终止条件或主动停下来喊你。   

Google 的工程师把 Loop 拆成五块加一个记忆层：   

Automations — 定时或事件触发，让 Loop 自己醒过来。   

Worktrees — 多个 Agent 并行跑时各自独立分支，不互相踩文件。   

Skills — 把项目约定、风格规范写成 Markdown，Agent 每次启动直接读取。   

Connectors — 通过 MCP 协议接入 GitHub、数据库，让 Loop 能在真实环境里操作而不只是 "告诉你该怎么做"。   

SubAgents — 写代码的和审代码的采用不同的 Agent。   

跟 Harness 是啥关系呢？   

Harness 指 Agent 运行时的外壳：系统提示词、工具集、验证规则、上下文管理 — 解决的是一个 Agent 单次跑得靠不靠谱的问题。   

Loop 在 Harness 上面一层。   

它把 Harness 里的 Agent 变成可被重复调度、能自我校验、能产出持续状态的组件，再加上调度、并行隔离、分工协作这些系统级能力。   

Loop 不会取代 Harness，而是把 Harness 当积木来组装更大的系统。   

又是新瓶装旧酒？   

坦白说，底层思想不新，上面都是老概念。   

但旧酒装进新瓶之后确实发生了质变：   

模型能力到位了 — 当下的模型能真正理解目标并做出合理的循环内决策，而不只是机械执行。   

产品内建了 — Codex 和 Claude Code 都把 Worktree、Skills、SubAgent 做成了内置功能，不再需要你自己糊一堆脚本。   

成本边界可控了 — /goal 会用独立小模型判断是否完成，有最大迭代数、预算上限等刹车机制。   

所以更准确的说法是：原理不新，但工程化落地的条件刚刚成熟。   

就像神经网络 1950 年代就有，真正爆发得等 GPU 和数据规模就位。   

Loop Engineering 也是类似的故事 — 概念早已存在，可行性是 2026 年才到位的。

关闭

更多

名称已清空

微信扫一扫赞赏作者
喜欢作者
其它金额

赞赏后展示我的头像

作品
暂无作品
喜欢作者
其它金额
¥

最低赞赏 ¥0
确定

返回
其它金额

更多

赞赏金额
¥
最低赞赏 ¥0
1
2
3
4
5
6
7
8
9
0
.

北京
,
2026年6月15日 23:03
