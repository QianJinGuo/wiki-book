# 异步调用模式：Serverless 流水线中调用 Agent（避免空闲计算成本）

## Ch11.195 异步调用模式：Serverless 流水线中调用 Agent（避免空闲计算成本）

> 📊 Level ⭐⭐ | 7.2KB | `entities/asynchronous-agent-invocation-patterns-serverless-pipelines.md`

# 异步调用模式：Serverless 流水线中调用 Agent（避免空闲计算成本）

> **Background**：本文基于 AWS ML Blog 对 Amazon Bedrock AgentCore 异步调用模式的系统分析建立。核心问题是通用且可迁移的——Agent 在回答前会"思考"一段时间，而阻塞式调用会让调用方在等待期间持续付费。文章给出三种异步模式（task-token 回调 / 直接服务集成 / durable function）及其与阻塞反模式的成本对比。

## 核心问题：Agent 的"思考时间"让阻塞调用浪费计算

Agent 与普通流水线步骤不同：它在回答前会思考一段时间（取决于 prompt、模型、文档），延迟很少是即时的。最常见的实现是一个计算服务（如 Lambda）调用 Agent 并等待响应——但函数在等待时什么都没做，却仍在运行并被按秒计费。

关键洞察在于成本落在调用方而非 Agent 侧：Agent 运行时（AgentCore runtime）按消耗计费，Agent 空闲时（等待 LLM 生成、等待 tool/MCP 调用返回）只收内存费不收 CPU 费；而发出同步调用的 Lambda/容器/EC2 实例则全程阻塞，持有并支付完整计算配额直到 Agent 响应。因此浪费不在 Agent 侧，而在"开着连接空等的调用方"。

一个 Agent 可以通过 return-of-control action 选择如何返回：收到 Step Functions task token 就唤醒该执行；收到 durable-function callback ID 就唤醒 durable function；两者都没有就同步内联返回。这意味着**换编排模式无需改 Agent**。

## 三种异步模式 vs 阻塞反模式

| | 阻塞（反模式） | Pattern 1: Task-token | Pattern 2: 直接集成 | Pattern 3: Durable function |
|---|---|---|---|---|
| 编排器 | Step Functions | Step Functions | Step Functions | Lambda（代码） |
| 路径中 Lambda | 有，全程存活计费 | 有，但提前返回 | 无 | durable function（挂起） |
| 等待期空闲 Lambda 计算 | 付全部等待 | 无 | 无 | 无 |
| 调用点自定义代码 | 有 | 有 | 有限（状态转换） | 有 |
| 调用方与 Agent 解耦 | 否 | 是 | 否 | 是 |
| 相对复杂度 | 最低 | 较高（token 与回调 IAM） | 最低 | 中等（checkpoint/replay） |

### Pattern 1: Task-token 回调（带 dispatcher 函数）
Step Functions 用 `waitForTaskToken` 集成调用 Lambda，传入 task token 后暂停执行。函数用 token 启动 Agent 后几秒内返回；执行保持暂停（不计费），直到 Agent 调 `SendTaskSuccess` 用该 token 唤醒。需设 `TimeoutSeconds` + `HeartbeatSeconds` 作为安全网，静默 Agent 会以 `States.Timeout` 干净失败而非永久暂停。

### Pattern 2: 直接服务集成
不需要调用点自定义代码时，可完全移除 Lambda。Step Functions 通过 AWS SDK 服务集成直接调 AgentCore，Agent 响应直接流入下一状态，Validate 分支变成单个 Task state。无 Lambda 在路径中，也就没有空闲 Lambda 计算可付；Standard workflow 按状态转换计费而非按等待时长。

### Pattern 3: Lambda durable function
想用代码而非状态机表达编排时，durable function 提供相同成本行为：流水线阶段变成 `context.step`，并行变成 `context.parallel`，等待 Agent 变成 `context.waitForCallback`。等待期间函数挂起不计费，Agent 用 `SendDurableExecutionCallbackSuccess` 唤醒。单函数持有整条流水线，但只按挂起之间的短执行突发计费。

## 成本测量：state 活跃 vs 函数计费

文章强调重点不是具体数字，而是两个值的**关系**：task-token 模式下 Validate state 活跃时长 vs dispatcher 函数实际计费时长。单次运行示例：state 活跃 19.6s，但函数只计费 4.8s——中间 ~14.8s 是等待时间，期间没有 Lambda 函数在运行。总流水线时长不是有用的对比指标（被 Agent 自身推理时间主导，每次运行都不同），有意义的差异是"等待期间你为多少计算付费"。

## 最佳实践

- **防范永不回答的 Agent**：给每个 `waitForTaskToken` state 设 `TimeoutSeconds`，避免执行无限挂起；Agent 发心跳时也设 `HeartbeatSeconds` 加速死 Agent 检测，错误路由到失败或人工审查路径。
- **重试用稳定 session ID**：把 `sessionId` 设为从执行上下文派生的值（如 Step Functions 执行名），让重试恢复同一 Agent 会话而非从头开始。
- **开启 X-Ray**：精确显示 Agent 思考用了多久 vs 调用方等待了多久，确认模式确实在间隙释放了计算。
- **dispatcher 函数按速度配，不按 Agent 负载配**：只序列化请求并调用端点，256MB 内存 + 30s 超时通常足够，重活都在 Agent 侧。

## 选择模式

- **阻塞反模式**：适合原型、短 Agent（调用方成本 = 完整 Agent 处理时间）。
- **Pattern 1 task-token**：需要自定义 pre/post 处理逻辑时（调用方成本 = 仅几秒 dispatch）。
- **Pattern 2 直接集成**：纯编排、无自定义代码（调用方成本 = 零，无 Lambda）。
- **Pattern 3 durable function**：希望在一个函数里表达复杂异步工作流时。

核心结论：把 Agent 放进流水线是简单部分，**经济地调用它才是原型与生产设计的区别**。一个阻塞在 Agent 上的 Lambda 实现简单但悄悄昂贵——大部分计费时间都在空等。

## 相关实体

- [AgentCore Managed Harness](../ch04/783-agentcore-harness.html) — AgentCore 平台（Harness Engineering）本身
- [AgentCore Web Search](../ch04/335-amazon-bedrock-agentcore-web-search-ga.html) — AgentCore 的 Web 搜索 grounding 能力
- [Serverless A2A Gateway](../ch03/019-agent.html) — Agent 间通信网关
- [Bedrock Serverless Async Inference](ch11/019-aws-bedrock.html) — 同族的异步推理模式（SQS+Lambda）

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/asynchronous-patterns-for-calling-amazon-bedrock-agentcore.md)

---

