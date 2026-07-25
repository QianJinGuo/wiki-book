# 前端如何消费 Agent 的 SSE 流 — Agent 前端工程实践

## Ch04.030 前端如何消费 Agent 的 SSE 流 — Agent 前端工程实践

> 📊 Level ⭐ | 1.7KB | `entities/前端消费agent-sse流-工程实践.md`

# 前端如何消费 Agent 的 SSE 流 — Agent 前端工程实践

在 mini-openclaw 框架实践中，前端通过 SSE（Server-Sent Events）消费 Agent 运行过程中的事件流，实现实时 Agent 聊天页面。

## 核心设计

Agent 只负责产出事件，外面的消费者决定怎么展示：

```
for event in run_agent_events(user_message):
    print_event(event)
```

- CLI 可以把事件打印到终端
- Web 页面：后端把事件转成 SSE → 浏览器读取 SSE 流 → 前端将 token / tool_start / tool_result 渲染到页面

## 技术框架

基于 Vue 3 的前端应用，目录结构：

```
frontend/src/
├── api/               # 后端接口封装
├── stores/            # Pinia 状态管理
├── views/             # 页面级组件
├── components/        # 布局和复用组件
├── router/index.ts    # 路由表
├── App.vue            # 应用入口
└── assets/main.css    # 全局样式
```

路由覆盖聊天、Agent 管理、模型管理、工具管理、Skill 管理、MCP 管理、日志和观测页面。

## 关键实现

SSE 事件流的核心是让后端 Agent 运行过程的事件连续推送到前端，覆盖 token 流式输出、工具调用状态、Agent 思考过程等实时信息。前端通过 EventSource 或 fetch ReadableStream 消费这些事件，并逐帧更新 UI。

---

