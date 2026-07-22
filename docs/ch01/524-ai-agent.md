# 不改一行代码，看透 AI Agent 的每一次调用

## Ch01.524 不改一行代码，看透 AI Agent 的每一次调用

> 📊 Level ⭐⭐ | 8.3KB | `entities/不改一行代码看透-ai-agent-的每一次调用.md`

# 不改一行代码，看透 AI Agent 的每一次调用

一个 AI Agent 收到用户提问后，先调 Embedding 把问题向量化，接着向 Pinecone 发起 Top-K 检索，再经 Rerank 重排序，然后携带上下文调用 GPT-4o，期间 GPT-4o 还通过 MCP 协议调了外部工具——整条链路横跨 5 种协议、3 家云服务商。当用户反馈"回答不对"时，开发者面对的是一个没有监控录像的案发现场。传统 APM 能告诉你"有一个 HTTP 请求耗时 3 秒"，却无法回答"模型用了哪个、消耗了多少 token、Tool Call 调了什么函数、向量检索返回了几条结果"。

OBI（OpenTelemetry eBPF Instrumentation）的做法是：**在 Linux 内核里装一台全天候取证摄像头**——不改一行业务代码，自动识别并解析所有 AI 相关网络调用，把关键证据完整记录进 OpenTelemetry 标准的 trace 和 metrics。

## 深度分析

### 为什么 GenAI 语义约定埋点如此困难

OpenTelemetry 社区定义了 GenAI 语义约定（Semantic Conventions for GenAI），规定了 `gen_ai.request.model`、`gen_ai.usage.input_tokens`、`gen_ai.usage.output_tokens` 等标准属性。理想情况下，所有 AI 应用都应按这套规范上报数据，实现跨 Provider 的统一监控。

但现实中的埋点面临四重障碍：
1. **SDK 碎片化**——OpenAI、Anthropic、Google GenAI、Boto3（Bedrock）、DashScope 各有独立的 SDK，开发者需为每一个编写 tracing wrapper
2. **规范在演进**——GenAI 语义约定 2024 年才从实验状态走向稳定，字段名和枚举值持续调整
3. **多语言适配是乘法问题**——Python 的 `opentelemetry-instrumentation-openai` 和 Go 的社区封装是两套独立的项目，成熟度参差不齐
4. **裸 HTTP 调用完全不可观测**——很多自研 Agent 直接用 `requests`、`http.Client` 或 `fetch` 拼接 JSON 请求体调用大模型 API，所有基于 SDK monkey-patch 的方案全部失效

### eBPF 无侵入观测的技术架构

OBI 的核心思路是"把观测能力下沉到内核"——将问题换一个层面解决，不在应用层逐个 Provider 封装 SDK，而是在 Linux 内核的网络层统一拦截 HTTP 流量。

**第一步：TLS 加密前的明文捕获**——OBI 不去碰 TCP 层的密文，而是在用户态密码库的"加密前/解密后"那一瞬间挂钩子（uprobe）。支持四种运行时的适配：
- **OpenSSL/BoringSSL 动态库**：对 `libssl.so` 的 `SSL_write` 和 `SSL_read` 挂 uprobe
- **Go 静态链接二进制**：通过 ELF 符号表 + DWARF 信息定位 `crypto/tls.(*Conn).Write` 和 `Read`
- **Python _ssl 扩展**：复用 OpenSSL 路径
- **Stripped 二进制兜底**：使用 BTF + `.eh_frame` 退栈信息定位关键函数入口

**第二步：零拷贝数据传输**——使用 BPF ringbuf（Linux 5.8+）实现内核到用户态的高效数据传递。`bpf_ringbuf_reserve` 在共享内存里申请空间，应用数据一次性写入；用户态通过 mmap 零拷贝读取，避免传统 perf event 机制的多缓冲拷贝开销。

**第三步：三级协议识别状态机**——明文进入用户态后，OBI 需在毫秒级判断 Provider 和请求类型：

| 级别 | 方法 | 适用场景 |
|------|------|----------|
| 第一级 | 响应头特征码（`Openai-Version`、`Anthropic-Organization-Id` 等） | Provider 自身可验证的标识 |
| 第二级 | URL Host + Path 二段验证 | 错误响应、流式响应断开时兜底 |
| 第三级 | 请求/响应体顶层键 verify | LLM 网关场景下最终裁决 |

### 跨语言协程追踪

OBI 在内核层为三种主流并发模型分别做上下文重建：

**Python asyncio**：通过 4 个 uprobe 重建协程父子关系——`task_step`（当前 Task）、`Task.__init__`（父子血缘）、`PyContext_CopyCurrent`（contextvars）、`context_run`（回调关联）。即使单线程里同时有 10 个协程并发调用 LLM，也能准确判断每个 HTTP 请求出自哪个协程。

**Go goroutine**：直接对 Go runtime 内部函数下手——`runtime.newproc1` 记录父 G→子 G 指针建立父子血缘表，`runtime.casgstatus` 感知 G 何时绑到 M（OS 线程）。通过血缘表向上溯源最多 6 层（覆盖 99% 的 goroutine 创建深度），找到带 trace context 的祖先 goroutine。

**跨进程串联**：通过内核 `bpf_probe_write_user` 直接向出站 HTTP 请求的 header 区域注入 `traceparent`，实现跨服务 trace 串联，对应用完全透明。

### SSE 流式响应与 MCP 协议追踪

流式响应是大模型场景最棘手的观测点。OBI 在用户态维护按 trace ID 索引的累积缓冲区，以 Anthropic 流式为例：`message_start` 创建上下文 → `content_block_start` 开启内容块 → `content_block_delta` 追加 token → `message_delta` 附带最终 usage，最终输出与非流式 API 完全等价的 OTel Span。

对于 MCP 协议，OBI 通过 `Mcp-Session-Id` 头 + JSON-RPC 2.0 结构 + 方法白名单（tools/call、resources/read、prompts/get）三层验证准确识别 MCP 调用，按方法类型提取工具名、参数、资源 URI 等语义信息。

### 真实排障场景案例

OBI 在实际接入中解决了三个典型问题：

1. **文档问答 Agent 答非所问**——OBI 展开 RAG 分析视图发现 Pinecone Top-K=5 但仅命中 1 条、score=0.31，定位为向量库 namespace 配错。排查不到 1 分钟。
2. **Token 账单暴涨 3 倍**——OBI 聚合发现一个内部知识库 Agent 单次 input 平均 8 万 token（同集群其他应用 40 倍），原因是开发把整篇 PDF 塞进 system message。
3. **自研裸 HTTP 调用完全不可观测**——基于 Python `requests` 直接调通义千问的 Agent，SDK 方案完全不工作；OBI 接入后 Provider、model、tokens、tool_calls 一应俱全。

## 实践启示

1. **AI Agent 的可观测性不能靠 SDK 埋点解决**——SDK 方案在 Provider 多样化、裸 HTTP 调用的现实面前存在根本性的覆盖盲区。内核级观测是唯一能覆盖所有场景的通用方案。

2. **eBPF + uprobe 是零侵扰观测的关键技术栈**——通过在内核和用户态密码库的"加密前/解密后"接口挂探针，OBI 解决了 HTTPS 加密流量的明文捕获难题，不需要中间人证书或私钥。

3. **协程追踪是多语言生产环境的刚需**——Python asyncio、Go goroutine、Node.js callback 各有不同的上下文模型。内核级协程重建是实现跨语言统一 trace 的基础设施前提。

4. **AI 应用的可观测性指标需要超越传统 APM**——Token 消耗、Top-K 命中数、Tool Call 频次等 AI 特有指标比传统 HTTP 耗时更能帮助开发者定位问题。标准化的 GenAI 语义约定是统一仪表盘的前提。

5. **MCP 协议的标准化正在改变 AI Agent 的追踪方式**——随着更多 Agent 采用 MCP 协议调用外部工具，基于协议语义的可观测性（而非基于端点名称的猜测）将成为标配能力。

## 相关实体

- [OBI 零代码 AI 可观测性](ch01/886-20.html)
- [Agent 可观测性五层架构](../ch03/046-agent.html)
- [LangFuse Agent 评估追踪](../ch03/046-agent.html)
- [Cilium Tetragon eBPF 安全](ch01/1004-rag.html)
- [上下文工程三记忆范式](https://github.com/QianJinGuo/wiki/blob/main/entities/context-engineering-three-memory-paradigms.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/不改一行代码看透-ai-agent-的每一次调用.md)

---

