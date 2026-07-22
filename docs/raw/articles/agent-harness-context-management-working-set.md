---
sha256: 8a1a91dc5491b0780b34fff379f726b77393b17597b792419d848bb4eb54aa7b
title: "Agent Harness 上下文管理：聊天记录还是工作集？"
source_url: "https://mp.weixin.qq.com/s/JEjyY1x-Gx3_tvH0intQ1w"
author: "JiaGouX（若飞转发）"
publisher: "微信公众号 - 架构师（JiaGouX）"
published_date: "2026-04-30"
ingested: "2026-04-30"
review_value: 8.5
review_confidence: 7
review_recommendation: "strong"
review_stars: 4
type: raw
tags: [agent-harness, context-management, working-set, compaction, contextual-boundaries, claude-code, openclaw, memory, pi]
  - "agent-harness"
  - "context-management"
  - "working-set"
  - "compaction"
  - "contextual-boundaries"
  - "claude-code"
  - "openclaw"
  - "letta"
  - "pi"
sources: []
created: 2026-05-10
updated: 2026-05-10
---
# Agent Harness 上下文管理：聊天记录还是工作集？
> Source: https://mp.weixin.qq.com/s/JEjyY1x-Gx3_tvH0intQ1w
## 核心论点
**上下文窗口 ≠ 聊天记录，而是工作集。**
Agent 的竞争，正在从"模型能想多远"，转向"系统能不能把它放进一个可靠的长循环里"。
上下文管理每一次取舍，背后押的都是同一个赌：**harness 替模型多管一点，还是相信模型自己能管好**。
## 上下文窗口 vs 聊天记录
| 聊天记录思路 | 工作集思路 |
|------------|-----------|
| 从头到尾保留所有对话 | 每一轮筛选"当下能用"的视图 |
| 上下文是消息历史 | 上下文是系统维护的工作区 |
| 压缩 = 总结 | 压缩 = 状态迁移到持久层 |
**关键洞察**：上下文管理会直接改变 Agent 的行为。文件只给前 2000 行，模型自然会学用 offset 翻；grep 只给 preview，模型会先缩小搜索范围。约束最后都会回到模型的工作方式里。
## 四框架横向对比
### 文件读取
| 系统 | 限制 |
|------|------|
| Pi | 最多 2000 行或 50KB，末尾提示用 offset 继续读 |
| OpenClaw | bootstrap 单文件最多 12000 字符，总共最多 60000；工具输出 16000 字符或上下文 30% |
| Claude Code | 超过 256KB 先 stat 拒绝；读完后按 token 预算兜底；默认返回 2000 行 |
| Letta Code | 超过 10MB 拒绝；默认 2000 行窗口；超出的写到 overflow 文件 |
**设计姿态**：没人再假设模型会天然节制。Harness 先把预算守住，再靠工具描述、错误消息和 continuation hint 把模型教会怎么分段读。
### 工具输出管理
- 每类工具输出给字符/token 上限
- 超大输出只留开头、结尾或 preview
- 完整内容写到磁盘或服务端
- 给模型一个可继续访问的路径/ID/检索工具
- 幂等调用做去重，不让同一份内容反复进上下文
**Claude Code pre-query optimization**：每次 API 调用前都处理工具输出，超大输出写到磁盘再替换成 preview——平时就整理工作集，不等窗口快满再救火。
### 会话压缩（compaction）
**最容易被写轻的一块。** 真正难的不是压成摘要，而是**压完之后模型还能接着干活**。
长任务历史包含：
- 用户真实目标
- 已经排除的方案
- 读过的文件
- 做过的修改
- 踩过的错误
- 测试失败原因
- 还没完成的下一步
**四档压缩策略光谱**：
1. **确定性驱逐**：到阈值按比例丢最早一段消息，留尾巴。便宜稳定，但任务计划可能被冲走
2. **LLM 总结**：要丢的部分交给模型压成摘要，再前置回去。质量高但贵
3. **Checkpoint + 记忆迁移**：压缩前先自我整理，把关键状态写到 memory 文件或独立工作区，再让正式 compaction 收尾
4. **结构化分维压缩**：Claude Code 的做法，按 primary request / technical concepts / files and code / errors and fixes / pending tasks / current work 分维度保留
**被忽略的边界 case**：compaction 本身也会撑爆窗口。兜底方案：先把工具返回钳到小阈值再重试；仍然不行就对 transcript 做中间截断（留头留尾、丢中间）；或按 API-round 成组扔掉最旧的几组。
### Sub-Agent 隔离
| 系统 | 隔离策略 |
|------|---------|
| Pi | 给子任务起新进程，子 Agent 只拿到任务字符串 |
| OpenClaw | 默认 fresh isolated session，不带父 transcript |
| Claude Code | typed-agent 路径空白对话，只把委派 prompt 当唯一用户消息 |
| Letta Code | fork 和非 fork 两路；非 fork 也是 fresh headless instance |
**本质**：隔离之后，最小必要上下文到底是什么？OpenClaw 给子 Agent 过滤 AGENTS.md、TOOLS.md、SOUL.md；Claude Code 给 async agents 设工具 allowlist——都是在回答这个问题。
## 上下文即内存层级
把几个系统摊开看，动作很像传统计算系统的内存层级：
| 计算系统 | Agent Harness | 工程含义 |
|---------|--------------|---------|
| 寄存器最快但最小 | 寄存器 = 模型当前注意力 | 极小但极快 |
| 缓存稍大 | 缓存 = 近期工具输出、previews | 中等速度、中等大小 |
| 内存再大一些 | 内存 = 分页/压缩后工作集 | 较大但有预算 |
| 磁盘最慢但最多 | 磁盘 = overflow 文件、memory repo、检索索引 | 最大但需主动访问 |
| 页面错误 | 模型说"找不到刚才读过的信息" | 需要主动恢复 |
| Swap | overflow 文件、memory repo、检索索引、结构化 summary | 上下文 offload |
**核心洞察**：不要把上下文窗口当成无限滚动的聊天记录。它更像一个由系统持续维护的工作区。
## Anthropic Managed Agents 的关键设计
**Session 不等于 Claude 的上下文窗口。**
- session = 持久事件日志，可以在窗口外保存可恢复的上下文
- harness 决定每一轮把哪些事件切片、变换、组织好，放回模型窗口
- Claude 上下文窗口只是当下工作区，不背全部历史的保存责任
**拆法**：session（事件日志）、harness（组织窗口）、sandbox（执行工具和代码）——三个绑在一起短期省事，任务一长恢复/隔离/权限/调试都会变重。
## 九条工程自查
1. 可能返回大内容的工具，有没有**硬上限**？
2. 截断时有没有提供**继续访问的路径**？
3. 分页参数有没有写进**工具描述**？
4. 会话压缩**到底保留了什么**？（目标/关键文件/已做修改/失败原因/当前计划/下一步动作分开保）
5. 压缩时有没有守住**工具调用边界**？（不能切掉 tool call 但留下 tool result）
6. 子智能体**默认是否隔离**？
7. 有没有把**稳定状态迁到持久层**？
8. 系统有没有**可观测性**？（token 用量/截断/压缩触发/summary 维度）
9. session、harness、sandbox 有没有**解耦**？
## 三篇文章的关联
1. **Sub-Agent vs Agent Team**：多 Agent 架构先看上下文边界——能干净切开的用 Sub-Agent，必须共享状态的才考虑 Agent Team
2. **Subagent 上下文卫生**：Subagent 是 Harness 的上下文卫生工具——把探索过程挡在父窗口外，主窗口只拿回结果
3. **本文（上下文管理）**：边界切出来之后，每个工作区里的上下文怎么被读、被压、被迁移、被恢复
**上下文管理决定系统能不能持续协作。**
## 参考来源
- Aparna Dhinakaran, "Context Management in Agent Harnesses"
- Andrej Karpathy, 让 Agent 进入更长循环的讨论
- Matt Pocock / Oren Melamed, 1M 上下文与 sub-agent 的讨论
- Letta, "The Context Constitution"
- Anthropic Claude Managed Agents 官方文档
- Anthropic Engineering, "Scaling Managed Agents: Decoupling the brain from the hands"