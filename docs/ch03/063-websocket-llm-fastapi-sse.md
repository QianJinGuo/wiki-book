# 还在用WebSocket做LLM流式传输？FastAPI + SSE让你少踩一半坑

## Ch03.063 还在用WebSocket做LLM流式传输？FastAPI + SSE让你少踩一半坑

> 📊 Level ⭐⭐ | 13.4KB | `entities/fastapi-sse-llm-streaming-vs-websocket-5e4a458abf18.md`

## 核心结论

绝大多数 LLM 流式传输场景**根本不需要 WebSocket**。SSE（Server-Sent Events）基于普通 HTTP，浏览器原生支持，还能自动重连——更简单、更稳定、生产环境少踩一半坑。

SSE 与 WebSocket 的本质区别在于通信模型：SSE 是单向的（服务器 → 客户端），而 WebSocket 是全双工双向通道。对于 LLM 流式输出场景，模型推理结果从服务器推送给浏览器，客户端仅需要接收——这个单向模式天然契合 SSE 的设计。

## SSE vs WebSocket vs 长轮询 对比表

| 特性 | 长轮询 | SSE | WebSocket |
|------|--------|-----|-----------|
| 方向 | 双向（但低效） | 单向（服务器→客户端） | 双向 |
| 协议 | HTTP | HTTP | 独立协议（ws/wss） |
| 浏览器支持 | 全支持 | 全支持（IE除外） | 全支持 |
| 自动重连 | 需手动实现 | 原生支持 | 需手动实现 |
| 穿透性 | 最好 | 好（基于HTTP） | 可能被代理拦截 |
| 适用场景 | 老旧系统 | 服务器推送（通知、流式输出） | 实时互动（聊天、游戏） |

长轮询通过反复发送 HTTP 请求来模拟实时性，效率低下且实现复杂；SSE 利用 HTTP 分块传输（chunked transfer encoding）保持连接，服务器可随时向客户端推送数据。

## 核心实现：FastAPI StreamingResponse + 异步生成器

SSE 在 FastAPI 中的标准实现方式是 `StreamingResponse` 配合异步生成器。关键在于 `format_sse()` 函数将数据格式化为符合 SSE 规范的消息格式：`event:` 行声明事件类型，`data:` 行承载 JSON 数据，两个换行符标志消息结束。

```python
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
import asyncio, json, time
from typing import AsyncGenerator

app = FastAPI()

def format_sse(event: str, data: dict) -> str:
    """将Python对象格式化为SSE消息"""
    return f"event: {event}\n" + f"data: {json.dumps(data, ensure_ascii=False)}\n\n"

async def fake_llm_stream(prompt: str) -> AsyncGenerator[str, None]:
    for token in ["好的", "，", "这是", "你", "的", "回答", "……"]:
        await asyncio.sleep(0.1)
        yield token

@app.get("/stream")
async def stream(prompt: str, request: Request):
    async def event_generator():
        yield format_sse("meta", {"status": "started", "ts": time.time()})
        last_ping = time.time()
        try:
            async for token in fake_llm_stream(prompt):
                if await request.is_disconnected():  # ⚠️ 关键：检测客户端断开
                    break
                yield format_sse("token", {"t": token})
                now = time.time()
                if now - last_ping > 15:
                    yield ": ping\n\n"  # 心跳，防止代理超时
            yield format_sse("done", {"status": "completed", "ts": time.time()})
        except Exception as e:
            yield format_sse("error", {"message": "stream_failed", "detail": str(e)[:200]})
    headers = {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",  # 关键：禁止nginx缓冲
    }
    return StreamingResponse(event_generator(), media_type="text/event-stream", headers=headers)
```

## 生产环境6大避坑指南

### 1. 代理缓冲毁掉流式效果

Nginx 默认会缓冲代理响应，导致客户端无法实时看到 LLM 输出。必须在 FastAPI 侧设置响应头 `X-Accel-Buffering: no`，或在 Nginx 配置中设置 `proxy_buffering off`。

### 2. 超时问题

负载均衡器默认 60 秒空闲超时断开连接。解决方案是定期发送 SSE 注释行（`: ping\n\n`）作为心跳，同时在 Nginx/代理层配置 `proxy_read_timeout 300s` 或更大值。

### 3. 客户端断开检测

调用 `await request.is_disconnected()` 检测客户端是否已断开连接。这可以避免在客户端离开后继续消耗 LLM API token，从而节省费用。

### 4. 多进程共享状态

SSE 连接与特定进程绑定，跨进程广播需要借助 Redis Pub/Sub 或类似的消息队列中间件。

### 5. HTTP/2 连接数限制

HTTP/1.1 同一域名下浏览器限制 6 个并发连接。对于需要大量并发 SSE 流的场景，应启用 HTTP/2 以利用多路复用特性。

### 6. CORS 与认证

使用 `withCredentials: true` 发送 cookie 时，FastAPI 的 CORSMiddleware 必须配置 `allow_credentials=True`，且 `allow_origins` 不能为 `["*"]`，必须明确指定来源。

## Redis Pub/Sub 广播通知架构

当需要向多个客户端同时推送 LLM 流式输出时，单进程的 SSE 无法覆盖所有连接。此时应使用 Redis Pub/Sub 作为消息总线：上游 LLM 服务将 token 发布到某个频道，各 SSE 消费者订阅该频道并转发给各自客户端。

```python
async def event_stream(user_id: str):
    pubsub = redis.pubsub()
    await pubsub.subscribe("global_notifications")
    try:
        async for message in pubsub.listen():
            if message['type'] == 'message':
                yield format_sse("notification", json.loads(message['data']))
    finally:
        await pubsub.unsubscribe("global_notifications")
```

## 核心回顾

- **原理**：SSE 基于普通 HTTP，通过 `text/event-stream` 和分块传输实现服务器推送，EventSource 自动处理重连
- **实践**：FastAPI `StreamingResponse` + 异步生成器，核心要点：格式组装/心跳/断开检测/代理缓冲控制
- **避坑**：代理缓冲/超时/客户端断开检测/多进程状态共享

## 深度分析

### 1. SSE 的本质是 HTTP 分块传输的协议化

SSE（Server-Sent Events）并非全新的协议，而是对 HTTP 分块传输编码（chunked transfer encoding）的规范化包装。`text/event-stream` MIME 类型告诉浏览器这是一个 SSE 流，`event:` 和 `data:` 字段提供了结构化的消息格式。这种设计使得 SSE 可以复用 HTTP/1.1 的全栈基础设施——代理、Nginx、负载均衡器都原生支持 HTTP 分块响应，无需像 WebSocket 那样需要升级到独立协议（ws/wss）。这解释了为什么 SSE 在企业内网环境中的穿透性远优于 WebSocket。

### 2. LLM 流式输出的核心矛盾：生成速度 vs 传输效率

LLM 流式输出的独特之处在于 token 生成速度远慢于网络传输速度。一个 token 可能需要 20-50ms 才能生成（取决于模型大小和硬件），但网络传输只需 1-2ms。这意味着客户端的体验瓶颈在服务器端生成，而非网络。SSE 的分块传输特性使得每个 token 可以在生成后立即推送，而不必等待完整响应。对于需要「逐字展示」的 LLM 对话界面，SSE 的粒度恰到好处——既能保证实时性，又不会因为过度频繁的网络请求而浪费资源。

### 3. 心跳机制是生产环境的生死线

文章强调的 `:` ping 作为心跳不是锦上添花，而是生产环境 SSE 的必备机制。HTTP/1.1 的默认空闲超时通常是 60 秒，Nginx 的 `proxy_read_timeout` 默认也是 60 秒，而 LLM 生成一个完整回复可能需要数十秒到数分钟不等。如果没有心跳，代理层会在 LLM 还在生成内容时强制断开连接，导致用户看到截断的响应。SSE 心跳（通常每 15 秒发送一次）可以有效维持连接的活跃状态，避免代理超时。

### 4. Redis Pub/Sub 的局限性与替代方案

Redis Pub/Sub 是 SSE 多进程广播的经典方案，但其致命弱点是**不持久化消息**。如果订阅者因网络抖动短暂断开，会丢失断开期间的所有消息。对于 LLM 流式输出这种场景，消息丢失意味着回答不完整。对于需要更强可靠性的场景，应考虑 Redis Streams（支持消息持久化和消费者组确认）或专业消息队列（如 Kafka、RabbitMQ）。此外，Redis Pub/Sub 只能在单个 Redis 实例内广播，跨数据中心部署需要 Redis Cluster 或外部消息总线。

### 5. HTTP/2 多路复用重新定义连接数上限

HTTP/1.1 的 6 个并发连接限制是 SSE 在高并发场景的主要瓶颈。启用 HTTP/2 后，同一 TCP 连接可以承载多个并发的请求/响应流（即多路复用），彻底打破 6 连接的上限。HTTP/2 还内置了服务器推送机制，理论上可以进一步优化 SSE 的实现。但需要注意：HTTP/2 的多路复用共享同一个 TCP 连接上的带宽，如果单个 SSE 流占用带宽过大，会影响同连接上的其他请求。实际部署时需要根据并发量和内容类型评估是否需要独占连接。

## 实践启示

### 针对 FastAPI 开发者

1. **始终在 StreamingResponse 中添加 `X-Accel-Buffering: no` 响应头**：Nginx 默认会缓冲代理响应以优化性能，但这会毁掉 SSE 的实时性。在 FastAPI 侧设置此响应头比修改 Nginx 配置更可控，也便于跨环境迁移（开发/测试/生产）。

2. **使用 `asyncio.sleep()` 模拟 LLM 延迟时，设置 0.05~0.1 秒的随机抖动**：真实 LLM 的响应时间有波动（受 GPU 负载、批处理策略影响），固定延迟无法反映真实场景。添加随机抖动可以更准确地测试客户端的重连逻辑和超时处理。

3. **在生产环境集成 `request.is_disconnected()` 之前，先在测试环境模拟慢速网络**：用 `tc qdisc add dev eth0 root netem delay 100ms` 模拟 100ms 延迟，观察客户端断开后服务器是否正确停止生成。可以节省大量 LLM API 调用费用。

### 针对架构师

4. **SSE + Redis Pub/Sub 方案适合中小规模（< 1000 并发连接）**：如果预期并发量超过此阈值，应考虑 Kafka/RabbitMQ 等支持消息持久化和背压的消息队列，或者评估 WebSocket 的双向通信是否真的必要。

5. **Nginx 代理 SSE 时，同步配置 `proxy_buffering off` 和 `proxy_read_timeout 300s`**，而不是依赖 SSE 心跳：心跳是防御性手段，但代理配置才是根本。`proxy_read_timeout` 应该设为预期最大响应时间的 2-3 倍，留足余量。

6. **设计多进程 SSE 广播时，优先考虑 Redis Streams 而非 Pub/Sub**：Streams 支持消息 ID 确认和消费者组，可以实现「至少一次」 delivery，保证 LLM 输出不丢失。Pub/Sub 适合「最多一次」语义的无状态通知场景。

### 针对运维/DevOps

7. **在 Kubernetes 环境中部署 SSE 服务时，注意 `readinessProbe` 和 `livenessProbe` 的配置**：SSE 是长连接，如果使用 HTTP GET 做健康检查，会占用连接池。推荐使用独立的 `/health` 端点返回 `200 OK` + 空响应，或者使用 TCP Socket 检查。

8. **使用 Prometheus 监控 SSE 连接数和断开率**：关键指标包括 `sse_connections_active`（当前连接数）、`sse_disconnections_total`（总断开数）、`sse_tokens_sent_total`（已发送 token 数）。断开率突然升高通常是客户端网络问题或 LLM 服务不稳定的信号。

## 关联阅读

- [FastAPI SSE LLM 流式传输实战](https://github.com/QianJinGuo/wiki/blob/main/entities/fastapi-sse-llm-streaming.md) — 同一主题的补充实践案例
- [FastAPI 认证限流零停机部署](https://github.com/QianJinGuo/wiki/blob/main/entities/fastapi-auth-rate-limit-zero-downtime.md) — FastAPI 生产部署的最佳实践
- [Python 日志方案对比](https://github.com/QianJinGuo/wiki/blob/main/entities/日志别再print了深入对比python三大日志方案.md) — 异步应用的可观测性建设

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/fastapi-sse-llm-streaming-vs-websocket-5e4a458abf18.md)

---

