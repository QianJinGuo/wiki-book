# 不改一行代码，看透 AI Agent 的每一次调用

## Ch01.261 不改一行代码，看透 AI Agent 的每一次调用

> 📊 Level ⭐ | 2.2KB | `entities/不改一行代码看透-ai-agent-的每一次调用-3.md`

# 不改一行代码，看透 AI Agent 的每一次调用

#  不改一行代码，看透 AI Agent 的每一次调用

原创  古琦  古琦  [ 阿里云云原生 ](<javascript:void\(0\);>)

__ _ _ _ _

在小说阅读器读本章

去阅读

在小说阅读器中沉浸阅读

一个 AI Agent 收到用户提问后，先调 Embedding 把问题向量化，接着向 Pinecone 发起 Top-K 检索，再经 Rerank 重排序，然后携带上下文调用 GPT-4o，期间 GPT-4o 还通过 MCP 协议调了外部工具——整条链路横跨 5 种协议、3 家云服务商。当用户反馈“回答不对”时，开发者面对的是一个没有监控录像的案发现场。

传统 APM 能告诉你“有一个 HTTP 请求耗时 3 秒”，却无法回答“模型用了哪个、消耗了多少 token、Tool Call 调了什么函数、向量检索返回了几条结果”。

OBI（OpenTelemetry eBPF Instrumentation）的做法是：在 Linux 内核里装一台全天候取证摄像头——  不改一行业务代码，自动识别并解析所有 AI 相关网络调用，把关键证据完整记录进 OpenTelemetry 标准的 trace 和 metrics。

_ ** 为什么按 GenAI 语义约定埋点这么难  ** _

_ Cloud Native  _

OpenTelemetry 社区定义了一套 GenAI 语义约定（Semantic Conventions for GenAI），规定了  gen_ai.request.model  ` 、  ` gen_ai.usage.input_tokens  、  gen_ai.usage.output_tokens  等标准属性。理想情况下，所有 AI 应用都应按这套规范上报数据，这样不同 Provider 的调用才能用同一套仪表盘监控、用同一套告警规则覆盖。

但现实中，想在业务代码里按规范埋点是一件极其痛苦的事：

每个 Provider 的 SDK 完全不同。OpenAI SDK、Anthropic SDK、Google GenAI SDK、Boto3（Bedrock）、DashScope SDK——五个 Provider 对应五套 API 封装，开发者要为

---

