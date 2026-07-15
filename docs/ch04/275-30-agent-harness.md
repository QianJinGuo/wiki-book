# 从 30 分钟手搓 Agent，到 Harness 成为\"新后端

## Ch04.275 从 30 分钟手搓 Agent，到 Harness 成为\"新后端

> 📊 Level ⭐⭐ | 9.5KB | `entities/cong-30-fen-zhong-shou-gu-agent-dao-harness-cheng-wei-xin-hou-duan.md`

# 从 30 分钟手搓 Agent，到 Harness 成为"新后端"
架构师（JiaGouX）  我们都是架构师！
前段时间我们整理过一个demo：《 [ 30分钟手搓 Agent：LLM + Tools + Loop + Memory 跑通最小闭环 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409091&idx=1&sn=3c40343aefdf11fdb208588a44033e14&scene=21#wechat_redirect>) 》，我把 Agent 简化成一个很小的循环：
模型看任务，选择工具，程序执行工具，把结果写回上下文，再进入下一轮。
几十行代码就能跑起来。Demo 通了以后，确实挺有成就感。

## 相关实体
- [从 30 分钟手搓 Agent到 Harness 成为新后端](../ch05/099-harness.html)
- [Agentic Ai System Architecture Harness Skill Mcp](../ch05/084-harness-skill.html)
- [Code As Agent Harness Survey](../ch09/051-code-as-agent-harness.html)
- [Agentscope Java Harness Framework Enterprise Distributed](../ch05/099-harness.html)
- [Huggingface Ai Agent Glossary Model Scaffolding Harness Tool Skill Subagent](ch04/030-ai-agent.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/cong-30-fen-zhong-shou-gu-agent-dao-harness-cheng-wei-xin-hou-duan.md)

- [yoonho lee: text optimization as a legitimate learning mecha](https://github.com/QianJinGuo/wiki/blob/main/entities/yoonho-lee-text-optimization-as-legitimate-learning-mechanism.md)

## 深度分析

### 三层架构演进：从最小循环到新后端

文章揭示了 Agent 架构演进的三层逻辑：

**第一层（30分钟手搓Agent）**：解决 Agent 的「动起来」问题。核心是 LLM + Tools + Loop + Memory 的最小闭环，几十行代码就能验证思路。这层的局限在于工具被收窄到固定函数数组，无法应对真实业务中跨进程、跨语言、长时间运行的任务。

**第二层（Harness工程系统）**：解决 Agent 的「跑得稳」问题。上下文管理、工具、状态、权限、恢复和验证构成 loop 外的工程系统。这一层的关键洞察是：当 1 个 Agent 接 5 个后端系统是 5 条路径，但 4 个 Agent 接 5 个后端系统就变成 80 条路径——复杂度随 Agent 数量指数增长。

**第三层（Harness成为新后端）**：解决 Agent 的「接业务」问题。当 Agent 真要进业务系统，Harness 开始承担后端职责：Worker/Function/Trigger（参与者/能力/入口）成为后端设计的核心抽象。运行时能力目录替代静态工具列表，成为 Agent 调用系统的入口。

### 运行时能力目录的核心价值

文章区分了两个概念：传统服务发现告诉程序「服务在哪里」，而运行时能力目录告诉 Agent「此刻系统实际能做什么」。前者是静态地址，后者是动态能力清单。这个区别在 Agent 场景下至关重要——Agent 需要知道的不只是某个服务存在，还要知道这个能力的输入输出schema、owner、版本、权限，以及它此刻是否在线、是否能被调用。

iii.dev 项目展示了一个具体实现：Worker 连接时注册 functions 和 triggers，断开时自动从 registry 移除。Agent 可以订阅能力变化事件（新 function 上线、旧 worker 下线），这比启动时加载静态工具列表灵活得多。

### 统一 Trace 的架构意义

文章在代码层面指出了一个关键细节：`InvokeFunction` 和 `InvocationResult` 都携带 `traceparent` 和 `baggage`。这意味着跨语言、跨进程、跨队列的调用链可以被串起来。在 Agent 场景下，这个能力尤为关键——一个任务可能涉及浏览器 worker 做 UI 验证、沙箱 worker 做代码执行、Python worker 做数据分析，它们的调用结果需要落在同一条 trace 里才能排障。

### Agent 作为后端参与者的范式转变

文章引用了官方文档的核心观点：「An agent is a worker. Its tools are functions. Its memory is state. Its orchestration is triggers.」这个等式把 Agent 从「被调用的工具使用者」变成了「后端系统的平等参与者」。Agent 可以主动调用其他 worker，也会被 HTTP、队列、cron、状态变化触发。这种双向性是传统后端服务不曾有的特性。

## 实践启示

### 给内部 Agent 系统的第一版架构建议

如果要为内部 Agent 系统做第一版架构，文章建议重点关注四个设计动作：

**1. 能力目录优先于 Prompt 工程**

先建立工具的 ID、描述、输入输出 schema、owner、版本、权限和观测信息。能力目录是 Agent 与后端系统交互的界面，把这个界面设计好，prompt 调优才有基础。

**2. Worker 生命周期作为正常路径处理**

Agent 系统中 worker 断开、重启、超时、重复注册、半失败会频繁发生。代码层面的断线重连机制和 engine 侧的 function_owners 维护是关键实现细节。

**3. 从「Agent 主动调用」扩展到「业务事件触发」**

Agent 不应只是被人类 prompt 驱动的执行器，也应该能响应业务事件：线上告警触发 incident_triage、cron 触发 release_notes 生成、文件上传触发 document_reader、审批通过触发 sandbox::execute_plan。当 Agent 进入事件驱动模型，它就真正融入了后端执行体系。

**4. Trace 协议层设计先行**

跨语言、跨进程、跨队列的执行路径没有统一 trace 的话，排查问题只能靠「把所有日志 grep 一遍」。在架构设计阶段就把 traceparent/baggage 的传播机制定下来，后续排障会省大量力气。

### 需要提前预判的六个边界问题

**中心 Engine 可用性**：当 routing、registry、trigger、observability 都向同一个运行时收拢，这个运行时自己就变成承重点。需要提前考虑水平扩展、状态后端、备份恢复方案。

**统一原语不等于统一语义**：HTTP、队列、cron、状态变化都可以建模成 trigger，但失败语义完全不同。HTTP 关心延迟和响应，队列关心重复消费和死信，cron 关心锁和错过执行窗口。抽象能减少需要理解的东西，但替不了这些工程事实。

**能力目录膨胀治理**：如果每个 worker 都随意注册 function，目录会越来越乱。命名规范、版本策略、owner、权限、废弃流程要提前设计。

**动态 Worker 的安全边界**：Agent 拉起 sandbox、浏览器、临时服务很强，但涉及执行代码、访问网络、读取文件、调用内部 API 时必须有 RBAC、沙箱隔离、资源配额和审计。

**许可证和生态边界**：当前 engine 是 Elastic License 2.0，SDK 是 Apache 2.0。内部研究、验证思路、学习架构没问题，商业化二开和分发要单独看条款。

**上下文工程不会自动消失**：运行时目录告诉 Agent 系统有哪些能力，但不能替它决定当前任务该看哪段上下文。哪些事实进入窗口、哪些状态留在 session 外、哪些探索交给独立工作区，仍需独立设计。

### 自检问题清单

文章结尾给出了一个值得反复追问的问题：「我们的后端，离一个 Agent 能理解、能参与、能恢复、能追踪的系统，还有哪些缺口？」具体可以拆解为：

- **可发现性**：Agent 能否查询此刻系统里有哪些在线能力，而不是只能看到启动时的静态工具列表？
- **可恢复性**：Worker 断开重连后，Agent 能否自动感知并继续执行，而不是任务直接失败？
- **可追踪性**：跨 worker 的调用链是否有统一 trace ID，能否从一次调用回溯完整路径？
- **可触发性**：Agent 能否被业务事件（HTTP/队列/cron/状态变化）触发，而不只是被人类 prompt 驱动？
- **可治理性**：能力目录是否有 owner、版本、权限控制，废弃流程是否清晰？

---

