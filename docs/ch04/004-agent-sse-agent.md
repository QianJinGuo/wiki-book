# 前端如何消费 Agent 的 SSE 流 — Agent 前端工程实践

## Ch04.004 前端如何消费 Agent 的 SSE 流 — Agent 前端工程实践

> 📊 Level ⭐ | 9.7KB | `entities/前端消费agent-sse流-工程实践.md`

# 前端如何消费 Agent 的 SSE 流 — Agent 前端工程实践

## 摘要

在 mini-openclaw 框架实践中，前端通过 SSE（Server-Sent Events）消费 Agent 运行过程中的事件流，实现实时 Agent 聊天页面。Agent 只负责产出事件，外部消费者决定如何展示——CLI 打印到终端，Web 页面将事件转 SSE 后由前端逐帧渲染。前端通过 `fetch + ReadableStream` 代替原生 EventSource，自行实现流式解析、缓冲拼接和多类型事件分发。

## 核心要点

- **事件驱动架构**：Agent 运行过程中不断 yield 事件（文本 token、推理片段、工具调用、工具结果），前端通过 SSE 流实时消费，而非等待完整响应
- **fetch + ReadableStream 替代 EventSource**：因为聊天接口需要使用 POST 方法携带用户输入和 Agent ID，原生 EventSource 仅支持 GET，故采用 `fetch + response.body.getReader()` 自行实现流式解析
- **流式解码与缓冲拼接**：使用 `TextDecoder` 的 `{ stream: true }` 模式处理多字节字符跨 chunk 截断问题，维护 buffer 变量实现跨 chunk 事件完整性
- **自定义事件协议**：SSE 的 `data:` 字段使用前缀编码事件类型（`__tool_start__`, `__tool_result__`, `__reasoning__`, `__error__`, `__done__` 等），后端只需 yield 字符串，前端按前缀分发
- **事件时间线建模**：前端 Store 将历史事件（historicalEvents）和实时事件（liveEvents）合并为一条事件时间线，用户消息、模型输出、工具调用、工具结果统一建模为 RenderableConversationEvent

## 关键技术实现

### SSE 流解析

后端路由返回 `StreamingResponse`，其中 `stream_chat()` 是一个 generator，不断 yield SSE 格式文本：

```
data: 我先看一下文件。

data: __tool_start__:{"tool_call_id":"call_1","name":"read_file","args":{"path":"a.txt"}}

data: __tool_result__:{"tool_call_id":"call_1","name":"read_file","output":"...","is_error":false}

data: __done__
```

每个事件由 `data:` 行组成，事件之间用空行 (`\n\n`) 分隔——这是前端解析时最重要的边界。

### 跨 chunk 拼接

由于网络数据以不定长 chunk 传输，事件边界与 chunk 边界可能不对齐，前端维护一个 buffer：

```javascript
buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n')
const blocks = buffer.split('\n\n')
buffer = blocks.pop() || ''
```

这段逻辑确保：新读到的文本追加到 buffer、用空行切分完整 block、不完整的最后一个 block 留在 buffer 中等待下一个 chunk。

### 多行 data 拼接

SSE 允许多个 `data:` 行组成一个事件。后端发普通文本时按行拆分为多条 `data:`，因此前端必须将多条 `data:` 行 join 回来：

```javascript
const dataLines = block
  .split('\n')
  .filter((line) => line.startsWith('data:'))
  .map((line) => (line.startsWith('data: ') ? line.slice(6) : line.slice(5)))
const data = dataLines.join('\n')
```

拿到 data 后，按前缀分发到不同回调函数。

### Store 中的事件时间线

`stores/chat.ts` 管理几类核心状态：sessions（会话列表）、currentSessionId（当前会话）、sending（发送状态）、historicalEvents（已落盘的历史事件）、liveEvents（本次请求的临时事件）。页面渲染的数据源是 `currentTimelineEvents` computed 属性：

```javascript
const currentTimelineEvents = computed(() => {
  const fallbackEvents = createFallbackEvents(currentSession.value?.messages ?? [])
  const baseEvents = historicalEvents.value.length > 0 ? historicalEvents.value : fallbackEvents
  return [...baseEvents, ...liveEvents.value]
})
```

这样页面可以同时显示已落盘的旧会话和本次请求中正在发生的 token、工具调用和工具结果。

### 事件协议表

| SSE data 内容 | 前端回调 | 页面含义 |
|---|---|---|
| 普通文本 | `onToken(token)` | assistant 正文继续追加 |
| `__reasoning__:{...}` | `onReasoning(info)` | reasoning 片段继续追加 |
| `__tool_start__:{...}` | `onToolStart(info)` | 出现 pending 的工具调用 |
| `__tool_result__:{...}` | `onToolResult(info)` | 工具调用结束，显示输出和错误状态 |
| `__anomaly__:{...}` | `onAnomaly(info)` | 异常检测事件 |
| `__error__:...` | `onError(message)` | 本次请求失败 |
| `__done__` | `onDone()` | 本次流结束 |

## 深度分析

### 事件驱动架构在 Agent UI 中的必然性

Agent 执行过程天然是事件驱动的——模型调用、工具执行、结果处理交替进行，不存在单一的"完成时刻"。传统 REST API 的请求-响应模式无法表达这种动态过程，而 SSE 流提供了一种**单向实时通道**，让后端在事件发生时立即推送给前端。这种架构选择不是技术偏好，而是 Agent 交互范式的必然要求。

将事件编码在 `data:` 内容前缀而非标准 `event:` 字段，是一个务实的工程决策。后端不需要处理 SSE 的事件类型映射，只需 yield 带前缀的字符串；前端也只需简单的字符串匹配即可分发。这种"约定优于配置"的方式降低了实现复杂度，同时保持了扩展性——新增事件类型只需增加一个前缀分支判断。

### 流式缓冲作为 Agent UI 的基础设施

前端工程最容易被低估的复杂度在于**字节流与事件流之间的映射层**。网络运输层没有事件边界概念，HTML5 Streams API 返回的是随机的字节片段，可能截断 UTF-8 字符的中间字节。TextDecoder 的流式模式、buffer 拼接、空行分割——这几行代码实际上构成了 Agent 实时 UI 的基础设施层。任何不处理跨 chunk 边界的实现，在多字节字符或高并发场景下都会出现 UI 渲染错乱，而这种错误往往难以复现和定位。

### 事件统一建模的设计价值

前端将 token、reasoning、tool call、tool result 都统一建模为 `RenderableConversationEvent`，这一抽象将 Agent 聊天页面的本质从"文本流展示"重新定义为**事件时间线渲染**。页面维护的不是一个大字符串，而是一条由用户消息、模型输出、工具调用、工具结果组成的时序事件列表。这种建模方式使得：

- 历史会话重放变得自然——直接回放事件列表
- UI 组件可以针对不同事件类型做差异化渲染（如 tool call 用卡片、文本用气泡）
- 工具链可以无缝集成——后续的 evaluation、trace 标记等新事件类型只需新增一个回调

### 与 AI Agent 生态的对接模式

mini-openclaw 的 SSE 流设计遵循了 Agent Loop 的核心思想：Agent 只产生事件，不关心消费方式。这种"关注点分离"（Separation of Concerns）使得同一个 Agent 后端可以同时服务于 CLI、Web、移动端等多种前端，只需覆盖不同的事件渲染逻辑。这与 MCP 协议中"工具提供能力，客户端决定编排"的设计哲学一脉相承。

## 实践启示

1. **始终使用 `fetch + ReadableStream` 而非 `EventSource`**：Agent 聊天接口需要 POST 方法传输用户输入和 Agent 配置，原生 EventSource 仅支持 GET。自行实现流式解析虽然多几行代码，但提供了完全的控制力。

2. **流式解码的三个关键细节**：(1) `TextDecoder` 的 `{ stream: true }` 处理多字节字符跨 chunk；(2) `\r\n` 统一替换为 `\n` 保持换行稳定；(3) buffer 拼接后取最后一个 block 留作不完整段，而非丢弃。

3. **用前缀编码代替 SSE event 字段**：将事件类型编码在 `data:` 内容前缀里（如 `__tool_start__:`），比使用标准 event 字段更简单。新增事件类型只需在分发函数中增加一个 `if (data.startsWith(...))` 分支。

4. **确保未知前缀不被当成正文显示**：在调用 `onToken(data)` 之前先匹配所有前缀分支，否则未知前缀的前缀文本会被错误地追加到 assistant 正文中。

5. **Store 层维护事件时间线而非纯文本**：Agent 聊天页面展示的不是单纯的文本流，而是一次任务执行过程。前端应当维护事件列表而非拼接字符串，这样 history 回放、live streaming、异常处理等场景都能统一处理。

## 相关实体

- [CLI Agent 模式与 MCP Shell Agent](../ch03/037-agent.html)
- [多 Agent 编排系统](ch04/605-agent-orchestration.html)
- [Spec-Driven Development](../ch05/017-harness.html)
- [Skill 编排与依赖管理](ch04/344-skill.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/前端如何消费agent-sse流.md)

---

