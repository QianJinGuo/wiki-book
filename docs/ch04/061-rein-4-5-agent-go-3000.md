# Rein：4 模块 + 5 类型边界防止 agent.go 膨胀到 3000 行

## Ch04.061 Rein：4 模块 + 5 类型边界防止 agent.go 膨胀到 3000 行

> 📊 Level ⭐⭐ | 22.7KB | `entities/rein-go-agent-4-modules-5-type-boundaries.md`

# Rein：4 模块 + 5 类型边界防止 agent.go 膨胀到 3000 行
> "根子在哪？不是架构图不够漂亮。是模块之间的数据契约没定义清楚。" —— Rein 项目

**Rein** 是一个 Go agent 框架，用 **4 个模块 + 5 条类型边界 + 7 个不变量** 解决"agent.go 200 行 → 3000 行"的问题。核心思路：**模块之间的数据契约定义清楚 = 防止上帝文件**。每条数据流都对应一个**严格类型 + 单一职责 + 不可见字段**。

## 相关实体
- [Youre Building Agent Security In The Wrong Order](../ch03/045-agent.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/rein-go-agent-4-modules-5-type-boundaries.md)

## 一句话定位

**"agent loop 本身只关心流程——什么时候调 provider、什么时候 dispatch 工具、什么时候 commit session——每个具体决策都委托给注入的接口。"**——编排与实现分离

## 核心问题

2026 年大部分 Go 开发者都能用 200 行写一个"调 LLM → 解析 tool call → 执行工具 → 喂回结果"的 agent。但写到 2000 行时开始失控：
- 加 MCP 工具支持 → agent loop 要改
- 加沙箱隔离 → agent loop 又要改
- 加上下文压缩 → agent loop 还得改
- 到最后 `agent.go` 变成 **3000 行的上帝文件**，模块边界消失

## 4 模块分工

| 模块 | 做什么 | 不做什么 |
|---|---|---|
| **agent** | 编排 loop 流程、调度工具、生成 observation | 不实现工具、不决定权限、不做 UI |
| **provider** | 调用 LLM、处理流式、重试和 fallback | 不执行工具、不做 policy 决策、不持久化 |
| **tools** | 注册工具、暴露 Spec、Dispatch 执行 | 不决定何时调用、不做 schema 校验、不做 policy |
| **context** | 组装 Request、压缩历史、注入 memory/skills | 不改写原始 logical_messages、不执行 policy |

**关键约束**：agent 只依赖接口，不依赖具体实现。**18 个 Option 全部可选**——每个依赖都可被 mock、替换或设为 noop。

## 5 条类型边界（数据契约）

| 流向 | 类型 | 定义方 | 携带什么 |
|---|---|---|---|
| agent → provider | `provider.Request` | provider | 组装好的系统提示、压缩后历史、tool specs |
| provider → agent | `provider.Response` | provider | assistant message（可能含 tool_calls）+ usage |
| agent → tools | `Tool`（通过 Registry） | tools | 完整定义——agent 读 Spec 给 provider，读 Metadata 用于 policy |
| tools → agent | `tools.Result` | tools | 统一的 success/error + 可选 Data/Artifacts |
| agent → context | `ctxbuild.Input` | context | 原始历史 + memory + skills + tool specs |
| context → agent | `provider.Request` | provider | 压缩/组装后的最终请求 |

**贯穿所有边界的红线**：工具执行 metadata（risk、timeout、execution_mode、side_effect）**只在 tools 包中存在**，agent 读取后用于 policy/execpolicy 决策，但**永远不会出现在 provider.Request.Tools 中**。

## 7 个不变量（核心循环的"宪法"）

1. **工具失败不终止 loop**：未知工具、panic、timeout、deny、block 全部转为 observation
2. **最终输入安全**：任何 tool input 经过 parse → schema → policy → execpolicy → sandbox 五道关口
3. **流式和同步路径等价**：provider 保证最终 Message 内容一致
4. **Session 原子写入**：每轮 step 的 messages + events 同一次 Commit
5. **observation 顺序确定**：并行工具追加顺序 = provider 返回的 tool_call 原始顺序
6. **Context 构建不改写历史**：压缩和注入发生在投影上
7. **Panic 隔离**：单个 tool 或 hook panic 不崩溃整个 loop

> 这七条一旦违反任何一条，agent loop 的可靠性就不再成立。其他模块（policy、sandbox、gateway）可以换实现，**这七条不能动**。

## 三大核心设计模式

### 1. ToolSpec vs Tool（安全边界，不是封装好习惯）

**模型只看到 ToolSpec（三字段）**：
```go
type ToolSpec struct {
    Name        string
    Description string
    InputSchema json.RawMessage
}
```

**完整 Tool 有三部分**——Spec（模型可见）+ Metadata + Handler（模型不可见）：
```
┌─────────────────────────────────────┐
│  模型可见（ToolSpec）                 │
│  name: "shell_exec"                 │
│  description: "执行 shell 命令"       │
│  input_schema: {command: string}    │
├─────────────────────────────────────┤
│  模型不可见（Metadata + Handler）     │
│  risk: "exec"                       │
│  execution_mode: "sequential"       │
│  timeout: 60s                       │
│  side_effect: true                  │
│  handler: func(input) Result { ... }│
└─────────────────────────────────────┘
```

**为什么重要**：
- ❌ **直接传 Tool 给模型**：模型收到完整 Tool 定义 → 知道 shell_exec 的 risk=exec → 可通过 prompt injection 推断"这个工具很危险，可能被拦截" → 调整调用策略绕过安全检测
- ✅ **传 ToolSpec**：模型只知道"有一个 shell_exec 工具，接受 command 参数" → 不知道会被 sandbox 隔离 → 不知道用户需要 approve → **安全信息完全在模型视野之外**

`tools.Registry.Specs()` 是 agent 获取工具列表的**唯一入口**，返回类型是 `[]provider.ToolSpec`，不是 `[]tools.Tool`。**无论新增多少工具、无论工具的 risk 怎么配置，模型看到的始终只是 name + description + input_schema**。

### 2. Provider 流式 = 同步（等价性约束）

**Stream() 最终组装的 Message 必须和 Complete() 的返回值完全一致**——这是 provider 层写在 invariants 里的第 7 条规则。

**为什么重要**：agent 的后处理逻辑（tool dispatch、session commit、event 记录）全部基于最终的完整 Message。**如果流式和非流式路径产出不同的 message，agent 就要维护两套处理逻辑**。

**Rein's 哲学**：**等价性由 provider 层保证，上层不需要做任何判断**。
- 对比：Claude Code 的 SSE 推送由调用方自行维护增量状态来组装最终结果（更复杂）
- 对比：OpenAI Agents 的 SDK events 类似（调用方处理）
- Rein 的做法更简洁：channel 一定 close、tool_call_delta 按 index 归组、agent 只把 content_delta 转发给 UI sink

### 3. 投影式压缩（Context 不改写历史）

**问题**：直接删改 logical_messages → session 回放时只有残缺历史 → eval 无法基于完整对话复现 bug → debug 时看不到被压缩掉的那段对话

**Rein 解法**：
```
✅ 投影：
projection = compress(logical_messages)  // logical_messages 原样保留
→ session 记录完整历史
→ 回放/eval/debug 基于完整对话
→ 只有发送给 LLM 的那份是压缩的
```

**三级压缩管道**：
- **第一级（滑动窗口）**：保留最近 N 条消息（默认 50），丢弃最老的。硬约束：永远不丢弃 system prompt、永远不丢弃当前 step。丢弃顺序：先丢 tool result，再丢 user/assistant pair
- **第二级（Token 截断）**：维护 token 预算（默认 8000），预留 30% 给响应。从最旧的 tool result 开始丢弃。token 估算用字符启发式：英文 4 字符 ≈ 1 token，中文 1.5 字符 ≈ 1 token
- **第三级（摘要）**：前两级不够时，用轻量模型把被丢弃的消息压缩为 system note。**摘要失败 → 退回到纯截断。宁可少信息，不阻塞 agent**。

**对比 Claude Code compaction**：
- Claude Code：compaction 生成摘要后**替换旧消息**——压缩后原始对话不再完整保留
- Rein：**存储完整，发送压缩**——多占一点磁盘，换来完全确定的回放

## 18 个 Option 的安全默认

```go
WithSystem(prompt)             // 必填
WithMessages(messages...)      // 对话历史
WithTools(toolList...)         // 构造 Registry
WithModel(name)                // 模型名
WithMaxSteps(8)                // 最大步数，默认 8
WithToolTimeout(30s)           // 工具超时，默认 30s
WithMaxParallelTools(4)        // 并行上限，默认 4
WithPolicy(decider)            // 未注入 → AllowReadOnly
WithApproval(func)             // 人工审批
WithExecPolicy(engine)         // 未注入 → dev-only local
WithSandbox(s)                 // 未注入 → warning event
WithHooks(bus)                 // 未注入 → noop
WithGuardrails(g)              // 未注入 → noop
WithSession(store)             // 未注入 → 不持久化
WithContextBuilder(builder)    // 未注入 → 简单拼接
WithStreaming(true/false)      // 是否流式
WithStreamSink(sink)           // UI delta 回调
WithInterruptMode(mode)        // 中断模式
WithInterrupts(ch)             // 中断通道
WithWorkingDir(cwd)            // 工作目录
```

**除 WithSystem 必填外，其余 17 个全部有默认值**。只写 `WithSystem + WithTools` 就能跑一个完整的 agent loop——其余全部走**最安全的默认路径**：read 放行、write 需确认、exec 拒绝。

## Observation Envelope：一切失败回传模型

```go
// 工具成功
{"type": "tool_result", "message": "wrote 127 bytes to main.go", "retryable": false}

// 工具不存在
{"type": "error", "code": "unknown_tool", "message": "...", "retryable": true}

// policy 拒绝
{"type": "denied", "message": "shell_exec requires approval", "retryable": true}

// hook 阻止
{"type": "blocked", "message": "path outside workspace", "retryable": true}

// 超时（side_effect_unknown 已在事件中标记）
{"type": "timeout", "code": "tool_timeout", "message": "...", "retryable": true}
```

**retryable 字段的精华**：它告诉模型——这个错误有可能换个方式成功（denied → 换一个只读工具？timeout → 拆分任务？），还是绝对不可修复（guardrail_output_blocked → 别试了）。

**Rein 的 agent loop 只有 3 种情况会 return error**：
1. provider terminal error（重试耗尽了）
2. session 持久化失败（Commit 返回 error）
3. 非法配置（system 为空、重复 tool name 等）

**其余一切**——工具 panic、policy deny、hook block、guardrail fail、timeout——**全部转为 observation envelope，由模型决定下一步**。

> **Rein's 哲学 vs Claude Code / OpenAI Agents**：
> - **Claude Code**：工具错误**中断当前 task** 并抛给外层 handler，由 handler 决定是否重试整个 task
> - **OpenAI Agents**：通过 SDK event 通知调用方工具失败了，由调用方写重试逻辑
> - **Rein**：让模型自己看到错误、自己决定怎么办。"shell_exec 被 deny 了？那我用 read_file + search_code 组合试试"——**模型有时候能想到你没想到的替代方案**

## M1 最小工具集

| 工具 | Risk | ExecutionMode | 说明 |
|---|---|---|---|
| read_file | read | parallel | 受 cwd + path policy 约束 |
| search_code | read | parallel | 基于 ripgrep，输出截断 |
| write_file | write | sequential | 默认需 ask approval |
| shell_exec | exec | sequential | 受 hard-deny 列表保护 |

**4 个工具，3 个 risk 等级，2 种执行模式**——刚好覆盖一个最小 agent 需要的全部动作。

**并行调度规则**：
- `parallel` 工具可和其他 parallel 工具并发执行（受 `max_parallel_tools` 限制，默认 4）
- `sequential` 工具是**调度 barrier**——它前面的 parallel batch 必须先完成，它执行期间后续工具不能穿越
- **observation 追加顺序始终按 provider 返回的 tool_call 原始顺序**，而不是并行完成顺序——保证 session 回放的确定性

## Metadata 的三个默认值（纵深防御）

| 字段 | 空时默认 | 设计意图 |
|---|---|---|
| **Risk** | `read` | 即使开发者忘记标注，工具也不会以 exec 权限运行 |
| **ExecutionMode** | `parallel` | 大多数读取类工具可以安全并行 |
| **Timeout** | agent 全局 `WithToolTimeout`（默认 30s） | 不让单工具无界运行 |

> 这不是"防御性编程"，是**纵深防御**。每一个没被显式设置的字段，都落在**最安全的一端**。

## 复检链：Hook 改输入后必须重跑

**关键细节**：当 pre-tool hook 把输入改了（updated_input），**agent 不是直接信任——它重跑 schema → guardrail → policy**。因为 hook 可能把"读 /safe/path"改成"读 /.env"，不重跑 policy 就永远不会知道。

这条复检链是 **agent loop 7 步骤里的细节**：
- 7b. JSON parse + schema 校验
- 7c. policy.Decide() → deny / ask / allow
- 7d. pre-tool hooks → block / **updated_input**（后重新跑 7b + 7c，避免 hook 绕过 policy）
- 7e. execpolicy.Plan()
- 7f. Dispatch()

## 与现有 wiki 实体的关系

### vs Claude Code 源码分析（[Claude Code 20000 Char Source Analysis](../ch03/075-claude-code.html)）
- Claude Code 98.4% 基础设施 + 1.6% AI 决策
- Rein 用 4 模块 + 5 类型边界把 3000 行结构化

### vs Agent Harness 上下文管理（[Agent Harness Context Management Working Set](../ch05/039-agent-harness.html)）
- 工作集视角：logical_messages 原样保留 + 投影 = Rein 的"存储完整，发送压缩"

### vs wow-harness v3 事件溯源（[Wow Harness V3 Governance Protocol](../ch05/018-harness.html)）
- v3 = 跨 session 事件时间线 + 概念图
- Rein = session 原子写入 + 完整 logical_messages
- **共同点**：完整历史 + 不可篡改 + 确定性回放

### vs PilotDeck 白盒记忆（[Pilotdeck Agent Os Openbmb Tsinghua](../ch03/045-agent.html)）
- PilotDeck 记忆可读可改 + Dream 回滚
- Rein observation envelope retryable 字段
- **共同点**：把"AI 思考过程"暴露给用户/调用方

## 核心断言

> **"模块之间的数据契约定义清楚"是防止 agent.go 膨胀到 3000 行的根本解**。
> **"安全信息（risk / timeout / execution_mode）永远不出现在 provider.Request.Tools 中"是模型安全边界的物理保证**。
> **"让模型看到错误、自己决定怎么办"比"框架重试整个 task"更灵活**。

## 启示

1. **数据契约 > 架构图** —— 4 模块图很常见，但 5 条类型边界是真正起作用的（agent 只依赖接口 + 18 Option 可注入）
2. **ToolSpec vs Tool 是物理安全边界** —— 不是"封装好习惯"，是"模型看不看得见安全信息"的根本区别
3. **存储完整 + 发送压缩** —— 多占一点磁盘换完全确定的回放（vs Claude Code 的"压缩替换"）
4. **Provider 流式=同步** —— 等价性约束写在 provider 层 invariants 第 7 条，上层零复杂度
5. **Hook 改输入后必须重跑 policy** —— 复检链是"hook 不被绕过"的根本保证
6. **Observation envelope + retryable** —— 让模型参与错误恢复决策（vs 框架重试整个 task）
7. **18 Option 安全默认** —— "未注入 → 最安全路径"是降低集成成本的关键

## 下篇预告

> "当 agent 决定调用 shell_exec 后，policy 如何判断该不该执行？execpolicy 如何规划 sandbox 和资源限制？sandbox 如何实施隔离？guardrails 如何校验最终输出？——**安全三明治的四层防线**。"

## 深度分析

- **类型边界即安全契约**：Rein 的 5 条类型边界不只是模块划分，而是物理隔离保证。工具执行 metadata（risk、timeout、execution_mode）永远不出现在 `provider.Request.Tools` 中——这意味着模型无论通过何种 prompt injection 手段都无法推断工具的真实风险级别。相比之下，直接传递完整 Tool 定义的框架把安全决策权拱手让给模型本身 

- **投影压缩 vs 替换压缩的长期代价**：Claude Code 的 compaction 生成摘要后替换旧消息，节省 token 但丢失完整历史——eval 无法基于残缺对话复现 bug，debug 时看不到被压缩的对话。Rein 的"存储完整，发送压缩"策略多占用磁盘，但换来完全确定的 session 回放。长期看，调试效率的提升远大于存储成本 

- **7 个不变量是核心循环的"宪法"**：工具失败不终止 loop、Session 原子写入、observation 顺序确定——这七条一旦违反任何一条，agent loop 的可靠性就不再成立。其他模块（policy、sandbox、gateway）可以换实现，但这七条不能动。这是 Rein 设计中"约束即价值"的集中体现 

- **Observation envelope 的 retryable 字段把错误恢复决策还给模型**：传统框架遇到工具失败就中断或重试整个 task，Rein 则通过 observation envelope 让模型自己判断——denied 可以换只读工具，timeout 可以拆分任务。这个设计假设模型有时比框架更懂得如何绕过错误 

- **Hook 复检链防止安全边界被绕道**：pre-tool hook 改写输入后重跑 schema → guardrail → policy，而不是直接信任修改结果。这条复检链（7b → 7c → 7d → 重新跑 7b + 7c）是"hook 不被绕过"的技术保证，也是 agent loop 7 步骤中最容易被忽视的细节 

## 实践启示

- **立即审计你的 tool registry**：检查所有工具定义中有多少 metadata 字段（risk、execution_mode、timeout、side_effect）会出现在发送给模型的请求中。如果有任何安全相关字段泄漏到 `provider.Request.Tools`，需要立即重构为 ToolSpec 只暴露 name/description/input_schema 

- **采用三级压缩管道而非单一截断**：滑动窗口（保留最近 N 条）+ token 预算 + 摘要退化的组合，远优于单一策略。实现时注意"永远不丢弃 system prompt"和"永远不丢弃当前 step"的硬约束，这是 Rein 投影压缩区别于朴素截断的关键 

- **所有 hook 实现必须包含复检逻辑**：如果你的 hook 会修改 tool input，必须在修改后触发完整的 policy 重新评估。不要假设 hook 的输入修改是"可信的"——hook 可能被恶意注入，或无意中引入安全风险。这是 7 个不变量之外最重要的工程实践 

- **新 agent 项目从 18 Option 模式起步**：只有 WithSystem 是必填，其余 17 个 Option 全部有安全默认值。最小可用 agent 只需要 `WithSystem + WithTools`——这个配置覆盖率高达 95% 的生产场景，且默认路径是最安全的（read 放行、write 需确认、exec 拒绝）

- **评估框架时关注流式等价性保证**：如果一个 provider 声称支持流式但无法保证 Stream() 和 Complete() 产出完全一致的 Message，这个 provider 就不满足 Rein 的 invariants。流式和非流式路径必须等价——这是 session 回放确定性的基础，也是你选型时最重要的技术指标之一 

## 相关对照
- [Claude Code 20000 字符源码分析](../ch03/075-claude-code.html)
- [Agent Harness 上下文管理](../ch05/039-agent-harness.html) —— 工作集视角
- [wow-harness v3](../ch05/018-harness.html) —— 事件溯源 + 概念图
- [PilotDeck](../ch03/045-agent.html) —— 白盒记忆
- [Agent Harness 架构](../ch05/039-agent-harness.html) —— 7 层 harness 模型
- [17 种 agent 架构演进](ch04/620-17-agent.html) —— 类型边界视角
- [Agent 工程原则](../ch03/045-agent.html) —— 模块化设计实践
- [短期记忆压缩](ch04/099-agent-memory.html) —— 投影压缩对比

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/rein-go-agent-4-modules-5-type-boundaries.md)

---

