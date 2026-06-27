# FastAPI SSE — LLM流式传输的WebSocket替代方案

## Ch03.088 FastAPI SSE — LLM流式传输的WebSocket替代方案

> 📊 Level ⭐⭐ | 8.1KB | `entities/fastapi-sse-llm-streaming.md`

## 核心结论
**SSE（Server-Sent Events）是LLM流式传输的更优选择**，而非 WebSocket。SSE 基于普通 HTTP，浏览器原生支持 EventSource，连接断开时自动重连，服务器可指定事件 ID 实现断点续传。   ^[https://mp.weixin.qq.com/s/7FWjN0GDBgVyvEDiaC1AMQ]

## SSE vs WebSocket vs 长轮询
| 特性 | 长轮询 | SSE | WebSocket |  
|------|--------|-----|-----------|  
| 方向 | 双向（低效） | **单向（服务器→客户端）** | 双向（全双工） |  
| 协议 | HTTP | HTTP | ws/wss 独立协议 |  
| 浏览器支持 | 全支持 | 全支持（IE除外） | 全支持 |  
| 自动重连 | 需手动 | ✅ 原生支持 | 需手动 |  
| 穿透性 | 最好 | 好 | 可能被代理拦截 |  
| 适用场景 | 老旧系统 | **LLM流式输出、实时通知** | 聊天、游戏等双向互动 |  
**为什么 SSE 更适合 LLM 流式传输**：LLM token 生成本质是服务器→客户端的单向推送，客户端无需回复，完美匹配 SSE 的单向模型。   ^[https://mp.weixin.qq.com/s/7FWjN0GDBgVyvEDiaC1AMQ]

## FastAPI StreamingResponse 实现要点
```python  
from fastapi.responses import StreamingResponse  

# 关键响应头
headers = {  
    "X-Accel-Buffering": "no",  # 禁止nginx等代理缓冲  
    "Cache-Control": "no-cache",  
}  
```  

### 异步生成器模式
```python  
async def event_generator():  
    yield format_sse("meta", {"status": "started"})  
    async for token in llm_stream():  
        if await request.is_disconnected():  # ⚠️ 必检：浪费token = 浪费账单  
            break  
        yield format_sse("token", {"t": token})  
    yield format_sse("done", {"status": "completed"})  
```  

## 生产环境6大避坑
| 坑 | 解法 |  
|----|------|  
| **代理缓冲**毁掉流式效果 | FastAPI: `X-Accel-Buffering: no`；nginx: `proxy_buffering off; proxy_cache off` |  
| **60秒空闲超时**切断连接 | 心跳注释行 `yield ": ping\n\n"` 每15-30秒一次；`proxy_read_timeout 300s` |  
| **客户端断开**不自知 | `request.is_disconnected()` 每个 token 生成前必检 |  
| **多进程无法共享状态** | Redis Pub/Sub 广播，每个 FastAPI worker 订阅同一频道 |  
| **HTTP/1.1 并发连接上限** | HTTP/2 多路复用；或分散到不同子域名 |  
| **跨域 + 认证** | `CORSMiddleware` + EventSource `withCredentials: true` |  

## Redis Pub/Sub 广播通知架构
```  
[后台任务] → Redis publish → [所有FastAPI进程] → [各自SSE推送给客户端]
```  
大规模场景（>10K并发连接）建议用 **Kafka 或 NATS** 替代 Redis Pub/Sub。   ^[https://mp.weixin.qq.com/s/7FWjN0GDBgVyvEDiaC1AMQ]

## 性能调优
- ASGI 多 worker：`uvicorn --workers N`，注意 `ulimit -n` 文件描述符上限
- gzip 压缩：`GZipMiddleware` + 显式将 `text/event-stream` 加入压缩类型
- 批量发送：高频事件可打包为 JSON 数组减少 HTTP 帧开销
- 资源释放：`try...finally` 确保 Redis 订阅等资源正确释放

## 适用场景判断
✅ **用 SSE**：LLM token 流式输出、实时通知、仪表盘数据更新、股票行情推送     ^[https://mp.weixin.qq.com/s/7FWjN0GDBgVyvEDiaC1AMQ]
❌ **用 WebSocket**：双向实时互动（在线聊天、多人游戏协作、协同编辑）     ^[https://mp.weixin.qq.com/s/7FWjN0GDBgVyvEDiaC1AMQ]
❌ **用长轮询**：仅作为无 SSE/WebSocket 支持的老旧系统兼容方案   ^[https://mp.weixin.qq.com/s/7FWjN0GDBgVyvEDiaC1AMQ]

## 相关实体
> 主题导航

- [Build real-time voice streaming applications with Amazon Nova Sonic and WebRTC](/ch01-450-build-real-time-voice-streaming-applications-with-amazon-nov//)
- [Thinking Machines 交互模型（Interaction Models）](/ch04-278-thinking-machines-交互模型-interaction-models//)
- SGLang

- [Fastapi Sse Llm Streaming Vs Websocket 5E4A458Abf18](/ch03-061-还在用websocket做llm流式传输-fastapi-sse让你少踩一半坑//)
## 深度分析
### SSE 的技术本质与 HTTP 分块传输
SSE 的核心原理是 HTTP 分块传输编码（Chunked Transfer Encoding）。服务器返回 `media_type="text/event-stream"`，每个事件以 `data: ...\n\n` 双换行符分隔，浏览器端 EventSource 自动解析。这意味着 SSE 天然复用 HTTP/1.1 的 keep-alive 连接，无需切换协议，灵活性远高于 WebSocket。   ^[https://mp.weixin.qq.com/s/7FWjN0GDBgVyvEDiaC1AMQ]

### 断点续传的实现机制
SSE 支持 `Last-Event-ID` 头，客户端重连时自动带上上次收到的最后一个事件 ID，服务器据此可以跳过已推送内容实现断点续传。这对于 LLM 流式输出场景意义重大——token 生成是严格有序的，客户端断开后重新连接无需重传整个上下文。这比 WebSocket 手动实现重连逻辑要简单得多。   ^[https://mp.weixin.qq.com/s/7FWjN0GDBgVyvEDiaC1AMQ]

### 客户端断开检测的异步实现
`request.is_disconnected()` 是 FastAPI（Starlette）提供的异步断开检测方法。在每个 token yield 之前调用是必须的——LLM token 生成有计费成本，客户端已断开仍继续生成是纯粹的浪费。同步方案（如检查 `socket.recv`）在异步上下文中不可靠，必须用 `await request.is_disconnected()`。   ^[https://mp.weixin.qq.com/s/7FWjN0GDBgVyvEDiaC1AMQ]

### Redis Pub/Sub 的局限性
Redis Pub/Sub 是 fire-and-forget 模型，订阅者断线重连后会丢失连接期间的消息。这在通知广播场景可接受，但对于需要保证送达的场景（如任务进度推送），应该用 Redis Streams 或 Kafka 替代 Pub/Sub。SSE 连接本身是临时会话，大多数场景下消息丢失可接受，这是 SGLang 等 LLM 推理框架的流式输出选用 SSE 的原因。   ^[https://mp.weixin.qq.com/s/7FWjN0GDBgVyvEDiaC1AMQ]

### 代理层的缓冲问题
Nginx 的 `proxy_buffering` 默认开启，会缓存后端响应直到缓冲区满或请求结束才向客户端发送，彻底破坏 SSE 流式效果。`X-Accel-Buffering: no` 是 FastAPI 告诉 Nginx 不要缓冲的官方方式。但要注意：GZip 压缩也会导致缓冲，需显式将 `text/event-stream` 排除在压缩之外或关闭该路径的压缩。   ^[https://mp.weixin.qq.com/s/7FWjN0GDBgVyvEDiaC1AMQ]

## 实践启示
1. **选 SSE 而非 WebSocket 的判断标准**：是否需要服务器向客户端推送数据（单向即可）、是否需要浏览器原生自动重连、断点续传需求是否强烈、是否在可能有代理限制的网络环境下部署——满足任意一条就优先选 SSE。   ^[https://mp.weixin.qq.com/s/7FWjN0GDBgVyvEDiaC1AMQ]
2. **心跳间隔设计**：代理空闲超时通常 60 秒，心跳间隔应在 15-30 秒之间。太短浪费带宽，太长可能触发超时。心跳消息用 `: ping\n\n` 格式（注释行），客户端 EventSource 不会当作事件处理。   ^[https://mp.weixin.qq.com/s/7FWjN0GDBgVyvEDiaC1AMQ]
3. **错误处理和资源释放**：Redis 订阅必须在 `try...finally` 块中确保 `unsubscribe`，否则订阅会话泄漏。异步生成器中任何异常都应通过 SSE 错误事件通知客户端，而不是直接抛出 500。   ^[https://mp.weixin.qq.com/s/7FWjN0GDBgVyvEDiaC1AMQ]
4. **CORS + 认证同时生效的配置**：`withCredentials: true` 时，FastAPI 的 `CORSMiddleware` 必须设置 `allow_origins=["*"]`（或精确域名）且 `allow_credentials=True`；同时响应头需包含 `Access-Control-Allow-Credentials: true`。   ^[https://mp.weixin.qq.com/s/7FWjN0GDBgVyvEDiaC1AMQ]
5. **大规模部署时的协议升级**：单个 nginx 子域名 HTTP/1.1 连接数上限是 6 个（HTTP/2 可解除），多 worker 部署时总连接数受限于每个 worker 的文件描述符上限（`ulimit -n`），超过 10K 并发建议评估 SGLang 等专用推理框架的 SSE 实现而非自建。   ^[https://mp.weixin.qq.com/s/7FWjN0GDBgVyvEDiaC1AMQ]

---

