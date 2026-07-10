# 拆解OpenClaw架构（八）：多Agent编排与自主运行

## Ch01.1121 拆解OpenClaw架构（八）：多Agent编排与自主运行

> 📊 Level ⭐⭐ | 3.3KB | `entities/拆解openclaw架构八多agent编排与自主运行.md`

# 拆解OpenClaw架构（八）：多Agent编排与自主运行

**来源**: 科技充电站

**发布日期**: 2026-03-05

**原文链接**: https://mp.weixin.qq.com/s/yLrwrkhhhSnHy0z6jWIPuQ

---

AI 时代，有两种行为：

一种，活在别人的评测里，把模型的强当自己的强，痴人说梦；

另一种，活在真实的实战里，用最顶级的 AI，武装自己。

前者在噪音里坐享"技术平权"，后者在 疼痛中完成"自我进化"。

朋友们好，我是行小招。

这是 OpenClaw 深度技术解析系列的第八篇，也是最后一篇。前七篇我们从消息流水线拆到人格系统，从 Agent Runner 聊到记忆系统，再到工具链、Skills 生态、安全机制，基本上把一个 AI Agent 从"接收消息"到"安全执行"的完整链路走了一遍。

上篇结尾我说，下一站是多 Agent 编排。安全机制解决的是"一个 Agent 能不能被信任"的问题，而多 Agent 编排要回答的是一个更大的问题： 当你有多个 Agent 的时候，它们怎么协作、怎么通信、谁来调度？

一个 Agent 是聊天机器人，一群 Agent 是什么？OpenClaw 给出的答案是：一个自主运行的 AI 系统。

先看最基本的操作，一个 Agent 怎么"生"出另一个 Agent。

OpenClaw 用  sessions_spawn  工具实现子 Agent 生成。调用这个工具，父 Agent 不会阻塞等待，而是 立即返回 一个结构：

{ "status": "accepted", "runId": "xxx", "childSessionKey": "agent:main:subagent:a1b2c3" }

三个关键设计值得拆开看。

第一，非阻塞， 父 Agent 发出 spawn 请求后继续干自己的事，子 Agent 在后台独立运行。这跟操作系统的  fork()  思路类似，生完就放手，不搞同步等待。

第二，隔离的 session key， 子 Agent 的 session key 格式是  agent:{agentId}:subagent:{uuid}  ，跟父 Agent 的 session 完全隔离。为什么要这么做？因为 session 是 OpenClaw 里的资源边界，隔离 session 就意味着隔离上下文、隔离状态、隔离工具权限，子 Agent 默认拿到所有工具，但 session 工具和系统工具被禁止使用，更细粒度的限制还包括  gateway  、  cron  等管理类工具，以及  memory_search  、  memory_get  等记忆工具。

第三，完成后主动汇报， 子 Agent 跑完任务后会执行一个 announce 步骤，把结果（状态 + 转录路径）投递到请求者的 channel。投递策略也很讲究：先尝试直接投递，失败了走队列回退，再失败就重试，不是简单的 fire-and-forget，而是有韧性的结果交付。

但这里面有一个非常重要的 硬限制 ：子 Agent 不能再生成子 Agent。

代码里的实现简单粗暴：

if (isSubagentSessionKey(requesterSessionKey)) {  
  return jsonResult({ status: "forbidden" });  
}

就一个 if 判断，连参数都不用看，session key 格式一匹配就直

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/拆解openclaw架构八多agent编排与自主运行.md)

---

