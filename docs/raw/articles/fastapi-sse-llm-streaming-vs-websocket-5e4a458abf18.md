---
title: 还在用WebSocket做LLM流式传输？FastAPI + SSE让你少踩一半坑
author: 云朵君（数据STUDIO）
date: 2026-05-15
source: https://mp.weixin.qq.com/s/7FWjN0GDBgVyvEDiaC1AMQ
sha256: 5e4a458abf18
review_value: 9
review_confidence: 9
review_score: 81
review_recommendation: 入库
ingested: 2026-05-16
tags:
  - fastapi
  - sse
  - server-sent-events
  - websocket
  - llm-streaming
  - python
  - async
  - real-time-communication
  - redis-pubsub
  - production-best-practices
---
# 还在用WebSocket做LLM流式传输？FastAPI + SSE让你少踩一半坑
> 原创 云朵君 数据STUDIO，2026-05-15 四川
## 核心结论
绝大多数 LLM 流式传输场景**根本不需要 WebSocket**。SSE（Server-Sent Events）基于普通 HTTP，浏览器原生支持，还能自动重连——更简单、更稳定、生产环境少踩一半坑。
## SSE vs WebSocket 对比表
| 特性 | 长轮询 | SSE | WebSocket |
|------|--------|-----|-----------|
| 方向 | 双向（但低效） | 单向（服务器→客户端） | 双向 |
| 协议 | HTTP | HTTP | 独立协议（ws/wss） |
| 浏览器支持 | 全支持 | 全支持（IE除外） | 全支持 |
| 自动重连 | 需手动实现 | 原生支持 | 需手动实现 |
| 穿透性 | 最好 | 好（基于HTTP） | 可能被代理拦截 |
| 适用场景 | 老旧系统 | 服务器推送（通知、流式输出） | 实时互动（聊天、游戏） |
## 核心实现：FastAPI StreamingResponse + 异步生成器
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
1. **代理缓冲毁掉流式效果**：Nginx 默认缓冲响应，必须加 `X-Accel-Buffering: no` 或 `proxy_buffering off`
2. **超时问题**：负载均衡器默认60秒空闲超时 → 心跳 `:` + 调大 `proxy_read_timeout 300s`
3. **客户端断开检测**：`request.is_disconnected()` 必检，否则浪费 token 和账单
4. **多进程共享状态**：SSE 连接是进程级的，跨进程广播需 Redis Pub/Sub
5. **HTTP/2 连接数限制**：HTTP/1.1 同一域名6个并发上限，HTTP/2 多路复用可解
6. **CORS 与认证**：`withCredentials: true` 发送 cookie，CORSMiddleware 配置 `allow_credentials=True`
## Redis Pub/Sub 广播通知架构
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