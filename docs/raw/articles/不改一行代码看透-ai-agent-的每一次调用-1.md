---
title: "不改一行代码，看透 AI Agent 的每一次调用"
source: wechat
url: http://mp.weixin.qq.com/s?__biz=MzUzNzYxNjAzMg==&mid=2247584772&idx=1&sn=09cac7fbd3622efed3ab7ca67a2e689d&chksm=fae787cbcd900edd84e7b51f8220059508d38456f764cf525ea4560a17fb4c8d175622fae6d1#rd
ingest_date: 2026-07-02
vxc: 81
stars: 5
sha256: a8dddecf185af817935c3dbb4800fd75c811d5f9422e4aa7eaaea162630368dd
---

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

每个 Provider 的 SDK 完全不同。OpenAI SDK、Anthropic SDK、Google GenAI SDK、Boto3（Bedrock）、DashScope SDK——五个 Provider 对应五套 API 封装，开发者要为每一个编写 tracing wrapper，提取各自格式的 model、token、tool_calls 字段，再映射到统一的 GenAI 属性上。

GenAI 语义约定本身还在快速演进。2024 年才从实验状态走向稳定，字段名和枚举值在持续调整。SDK 封装者需要不断追赶规范更新，而旧版本产出的数据可能与新版不兼容。

多语言适配是乘法问题。Python 的  opentelemetry-instrumentation-openai  ` ` 和 Go 的社区封装完全是两个项目、两套维护者、两种成熟度。同一个 Provider 在不同语言生态里的可观测性支持参差不齐。

侵入性改造不可避免。改代码 → 装包 → 对齐版本 → 重新测试 → 重新发布。每接入一个新 AI 服务都是一次工程项目，严重拖慢迭代。

还有一个更根本的问题：很多 AI Agent 应用压根不用官方 SDK。不少框架和自研应用直接用  requests  、  http.Client  、  fetch  等通用 HTTP 客户端拼接 JSON 请求体去调用大模型 API——轻量、灵活、没有 SDK 版本锁定。但这也意味着，所有基于 SDK monkey-patch 或 wrapper 的可观测性方案全部失效——没有 SDK 对象可以 hook，没有回调可以注入，instrumentation 库根本无从下手。而对 OBI 来说，不管你用官方 SDK 还是裸 HTTP 请求，最终都是 TCP 上跑的 HTTP 流量，内核层面看到的东西完全一样。

结果就是：  大量 AI 应用处于“可观测性盲区”。开发者不是不想观测，而是 SDK 方案接入成本太高，裸 HTTP 场景甚至无法接入。

_ ** OpenTelemetry 无侵入监控的解法：  ** _

_ ** 把观测能力下沉到内核  ** _

_ Cloud Native  _

OBI 的思路是把问题换一个层面解决：不在应用层逐个 Provider 封装 SDK，而是在 Linux 内核的网络层统一拦截 HTTP 流量，通过协议级解析自动提取 GenAI 语义约定要求的所有字段。

这意味着：一套探针覆盖所有 Provider；规范更新时只需升级 OBI DaemonSet，应用零改动；天然跨语言——Python、Go、Java、Node.js 都走 TCP 发 HTTP 请求，内核不关心应用用什么语言；更关键的是，无论应用用官方 SDK 还是直接拼 HTTP 请求调用大模型，OBI 都能一视同仁地捕获——因为它看到的不是 SDK 对象，而是网络上实际流过的 HTTP 请求和响应。

下图展示了一个典型 AI Agent 调用链路中，OBI 如何在每一跳自动设置采集点——从 Embedding、向量检索、Rerank 到 LLM 推理和 MCP 工具调用，所有出站 HTTP 请求均被内核层透明捕获：

当 OBI 捕获到一次 AI 相关的 HTTP 请求后，它经历以下处理流程——从网卡收包到最终输出一条符合 GenAI 语义约定的 OTel Span：

_ ** 内核里如何“看见”一次加密的 LLM 调用  ** _

_ Cloud Native  _

把观测下沉到内核听起来美好，但马上撞到一堵墙：今天所有 LLM 调用都跑在 HTTPS 上。直接在网卡或 socket 层抓包，看到的只是一堆加密字节，谈不上解析 model、tool_calls，更别说还原 SSE 事件流。OBI 要在内核层取证，就必须先解决“如何在不解密私钥的前提下拿到 HTTPS 明文”这个根本问题。

第一步：把探针下到 TLS 加密前的那一行代码。  OBI 不去碰 TCP 层的密文，而是在用户态密码库的“加密前 / 解密后”那一瞬间挂钩子（uprobe）。具体落到四种运行时各有一套适配：

* OpenSSL / BoringSSL 动态库：对 libssl.so 里的 SSL_write 和 SSL_read 挂 uprobe + uretprobe。SSL_write 入口拿到的就是应用刚交给 TLS 的明文 buffer，SSL_read 返回时拿到的是刚解密完成的明文 buffer。Node.js、CPython、curl、nginx 都走这条路径。

* Go 静态链接二进制：Go 自带 crypto/tls，不依赖系统 libssl，符号还会被 inline 和重命名。OBI 通过 ELF 符号表 + DWARF 信息定位 crypto/tls.(*Conn).Write 和 Read 的函数偏移，对静态链接的二进制直接按偏移挂 uprobe。

* Python _ssl 扩展：CPython 的 ssl 模块底层调用 _ssl.so，最终还是落到 OpenSSL，复用第一条路径。

* Stripped 二进制兜底：当符号被 strip 时，OBI 使用 BTF（BPF Type Format）+ .eh_frame 退栈信息定位关键函数入口，确保对生产环境编译时去除调试符号的镜像也能工作。

这一步的关键洞察是：加密发生在用户态密码库内部，应用层和密码库之间的接口永远是明文 buffer。只要探针挂在这个接口上，根本不需要中间人证书、不需要私钥，就能拿到完整的请求体和响应体。

第二步：零拷贝把数据从内核搬到用户态。  uprobe 触发后，eBPF 程序需要把抓到的 HTTP 明文交给用户态的 OBI Agent 做协议解析。传统 perf event 机制每条事件要走多次缓冲拷贝，对 LLM 这种动辄几十 KB 的 prompt 来说成本不可接受。OBI 使用 BPF ringbuf（Linux 5.8+ 引入的环形缓冲区）：内核 eBPF 程序通过 bpf_ringbuf_reserve 直接在共享内存里申请空间，应用数据 bpf_probe_read_user 一次性写入；用户态 reader 通过 mmap 直接映射同一段内存，零拷贝读取；背压由 ringbuf 自身的高低水位线控制，high water mark 触发时内核侧 drop 事件并打点，避免影响业务进程；多 CPU 场景下每个 CPU 一个 ringbuf 分片，避免锁竞争。

第三步：从 HTTP 明文流到 OTel Span。  明文进入用户态后还要经过一条完整的解析管线：HTTP/1.1 与 HTTP/2 帧重组，按 Content-Type 选择 JSON / SSE / 二进制解码器，流式响应按事件累积，字段提取按 GenAI 语义约定映射，再富化 K8s 元数据（pod、namespace、service、workload），最后输出 OTLP Span。整条管线运行在 OBI Agent 的 swarm DAG 调度器上，每个阶段都是可水平扩展的 actor，单机典型负载下 CPU 占用稳定在 1% 以内。

下面这张图把上述三步连成一条完整数据通路——从应用发出请求、到 uprobe 抓取明文、到 ringbuf 零拷贝、再到协议解析输出 OTel Span：

_ ** 跨语言协程追踪：为什么 PID 不够  ** _

_ Cloud Native  _

抓到明文只是数据层的胜利，更难的是关联层——一个真实的 AI Agent 几乎不可能是“一个请求一个线程”的同步模型。Python asyncio 在单个线程里并发跑几十个协程，Go 用 goroutine 把上下文切来切去，Node.js 把 callback 链拆得到处都是。如果还按传统 PID/TID 把所有调用归到同一个父 span，整条 trace 就会全部串线。

OBI 在内核层为三种主流并发模型分别做了上下文重建，下面以 Python 和 Go 为例。

Python asyncio：  4 个 uprobe 重建协程父子关系。CPython 的 asyncio 事件循环是单线程多任务的典型代表：所有协程跑在同一个 OS 线程上，靠 Task.step() 切换。OBI 在 CPython 解释器上挂了 4 个 uprobe，分别盯住协程生命周期的四个关键点：

uprobe 挂点  |  时机  |  提取的信息
---|---|---
task_step  |  协程被调度执行  |  当前 Task 对象指针，作为协程身份 ID
Task.  ** init  ** |  新协程创建  |  父子血缘——记录创建该 Task 时正在运行的 Task
PyContext_CopyCurrent  |  上下文复制  |  contextvars 的快照，作为协程间数据传递通道
context_run  |  在指定 context 中执行回调  |  当前激活的 context，关联到正确的协程

四个点配合起来，OBI 在内核侧维护一张“协程 ID → 父协程 ID → 当前 trace context”的映射表。哪怕一个线程里同时有 10 个协程并发调用 LLM，OBI 也能准确判断每个 HTTP 请求出自哪个协程、归属哪条 trace。

Go goroutine：  从 runtime 内部抠出血缘。Go 的 goroutine 比 asyncio 更难追：调度由 runtime 接管，不暴露任何稳定的用户态 API，连 goroutine ID 都被官方刻意隐藏。OBI 直接对 Go runtime 内部函数下手：runtime.newproc1 是父 goroutine fork 子 goroutine 的入口，OBI 在这里记录父 G 指针 → 子 G 指针，建立父子血缘表；runtime.casgstatus 是 goroutine 状态机切换，OBI 用它来感知 G 何时被绑到 M（OS 线程）上、何时被抢占；find_parent_goroutine 在一个 HTTP 出站请求触发时，沿父子血缘表向上溯源最多 6 层，找到最近一个带 trace context 的祖先 goroutine——这是 Go 协程链路重建的关键。

为什么是 6 层？OBI 团队在真实 Go 应用上做了统计：6 层覆盖了 99% 的 goroutine 创建深度，再深就属于框架内部的 worker pool，业务语义反而模糊。

跨进程：  内核 tpinjector 注入 traceparent。应用内的协程关联完成后，还要解决跨服务串联。OBI 在内核里直接对出站 HTTP 请求的 header 区域调用 bpf_probe_write_user，把 traceparent 头注入到 SSL_write 即将加密的明文 buffer 里——下游服务收到时会经历对称的解密流程，OBI 同样能在 SSL_read 出口捕获到这个头，从而把整条 trace 跨进程、跨服务、跨语言地串起来。整个过程对应用完全透明，连 HTTP 客户端代码都不知道自己发出去的请求被加了一个头。

性能开销：  1% CPU 是怎么做到的。上面这套机制听起来很重，但 OBI 在生产集群上的典型开销稳定在 1% CPU 以内，关键有三点：uprobe 触发频次受限于真实 HTTP 调用速率，不像 kprobe 那样被高频系统调用打爆；BPF ringbuf 批处理，用户态 reader 一次唤醒消费多条事件，避免逐事件上下文切换；协议解析在用户态而非内核态——内核 eBPF 只做最薄的“抓 buffer + 入 ringbuf”，复杂的字段提取交给用户态 actor 处理，避免 BPF verifier 复杂度爆炸。

下图把 Python asyncio 单线程跑 4 个并发 LLM 调用的场景画出来——传统按 PID/TID 关联会把它们全部归到一个父 span（错的），OBI 通过 4 个 uprobe 重建协程上下文后，能正确还原出 4 条独立 trace 的真实父子关系：

协议解析状态机：从字节流到 GenAI Span

明文进入用户态后，OBI 面对的是一串没有标签的 HTTP 字节流——它需要在毫秒级判断这是 OpenAI 还是 Anthropic、是 Chat 还是 Embedding、是 RAG 检索还是 MCP 工具调用，然后按各自的规范提取 GenAI 字段。这套判定逻辑不是简单的 if-else，而是一台三级状态机：任何一级单独使用都会误判，三级联动才能做到既不放过真凶、也不冤枉好人。

第一级：响应头特征码（最高优先级）。  每个 LLM Provider 都会在响应头里留下独有指纹：

Provider  |  响应头字段
---|---
OpenAI  |  Openai-Version、Openai-Organization
Anthropic  |  Anthropic-Organization-Id、Anthropic-Ratelimit-*
Gemini  |  X-Gemini-Service-Tier
通义千问  |  X-DashScope-Request-Id
Bedrock  |  X-Amzn-Bedrock-Input-Token-Count（token 直接在响应头里）

为什么响应头最可信？因为头是 Provider 自己加的，应用层无法伪造。但响应头有一个失效场景：4xx/5xx 错误响应，很多 Provider 会切到通用错误处理路径，不带这些定制头。

第二级：URL Host + Path 二段验证（fallback）。  响应头缺失时，OBI 退而求其次看请求 URL：dashscope.aliyuncs.com + /chat/completions 是 Qwen，bedrock-runtime.amazonaws.com 是 Bedrock，generativelanguage.googleapis.com + /models/ 是 Gemini。这一级覆盖了错误响应、流式响应中途断开等响应头不完整的场景。但只看 URL 也会被骗：很多公司在内部架一层 LLM 网关（统一鉴权、计费、限流），所有应用都调 internal-llm.example.com/v1/chat/completions，URL 看上去是 OpenAI 兼容格式，但实际后端可能转发到任何一个 Provider。

第三级：请求/响应体顶层键 verify（最终裁决）。  OBI 对识别出的请求会做最后一道 body 校验：LLM 调用必须有 model 顶层键 + messages 或 prompt 字段；Embedding 必须有 model + input 字段；Rerank 必须有 model + query + documents 字段（三选二命中即可，兼容 Cohere/Jina/Voyage/Qwen 的细微差异）；向量检索在 Pinecone/Qdrant/Milvus/Zilliz/Chroma/Weaviate 六大向量库的特征键集合中至少命中两个（如 vector + topK、namespace + includeMetadata），避免把普通 KV 查询误判成向量检索；MCP 工具调用需 JSON-RPC 2.0 结构（jsonrpc:"2.0" + method + id）+ MCP 方法白名单（tools/call、resources/read、prompts/get 等）+ Mcp-Session-Id 头，三层缺一不可。

三级状态机配合起来，OBI 既能识别响应正常的标准调用、也能识别错误响应、还能在企业内部 LLM 网关场景下正确归类。

SSE 流式响应：在内核里“看完”一段对话。流式响应是 LLM 场景最棘手的：一次完整对话被拆成几十甚至几百个 SSE 事件，每个事件只带一个 token 片段。OBI 在用户态维护一个按 trace ID 索引的累积缓冲区，按事件类型逐步重建：以 Anthropic 流式为例，message_start 创建会话上下文，content_block_start 开启一个内容块，content_block_delta 追加 token，message_delta 携带最终 usage，最后输出一条与非流式 API 完全等价的 OTel Span。这也是为什么 OBI 能在流式场景下精确算出 input/output token——它不是在请求结束才“猜”，而是事件级实时累积。

MCP 协议追踪：MCP 是 AI Agent 调用外部工具的新标准，流量是普通 HTTP + JSON-RPC 2.0。OBI 通过 Mcp-Session-Id 头 + 方法白名单 + protocolVersion 消歧三层验证准确识别 MCP 调用。确认后按方法类型提取语义信息：tools/call 提取工具名、参数和返回值；resources/read 提取资源 URI；prompts/get 提取模板名称。所有信息通过 Session-Id 串联到同一条 trace。

_ ** 通过云监控 2.0 接入监控  ** _

_ Cloud Native  _

▍  AI Agent 应用接入

通过云监控 2.0 接入中心  ** [  ** ** 1]  ** 一键接入 AI Agent 应用，接入后即可在 AI Agent 可观测中找到应用，并查看到 AI 相关监控数据：

_ ** 场景实践：OBI 在真实排障中的三个故事  ** _

_ Cloud Native  _

数据采得全只是第一步，能否在用户投诉之前把问题定位到位才是关键。下面三个场景来自实际接入过程中收集到的典型案例，对应 OBI 最常被用来“破案”的三类问题——召回质量、Token 成本、私有自研应用盲区。

▍  场景一：回答“答非所问”，到底是召回不准还是模型不行

一个文档问答 Agent 上线一周后被用户反馈“经常胡编”。研发翻 APM 日志，只能看到一次 /chat/completions 调用耗时 2.8 秒、状态码 200——除此之外没有任何线索，模型黑盒、向量库黑盒、Rerank 也是黑盒。

OBI 的 RAG 分析视图把同一个 trace 完整展开：Embedding span 显示 query 用的是 text-embedding-3-small；紧跟着的 Pinecone span 写明 Top-K=5、namespace=docs-v2、命中条数=1、最高 score=0.31；Rerank span 显示重排后顺序未变。三条数据连起来一眼定位——不是模型幻觉，是向量库 namespace 写错了、新版文档没切到这个索引。整个排查过程不到 1 分钟，过去靠加日志+二分定位至少要半天。

▍  场景二：月初 Token 账单暴涨 3 倍，谁是消耗大户

某业务月初收到 Bedrock 账单：input token 同比涨了 320%。研发面前是几十个微服务、若干个 Agent，谁也说不清是哪段代码在烧钱——传统 APM 完全不暴露 token 字段，SDK 层即便埋了也散落在各应用日志里无法聚合。

OBI 把所有 LLM 调用按 gen_ai.request.model + service.name + gen_ai.usage.input_tokens 聚合到大盘上，30 秒锁定异常：一个内部知识库 Agent 单次 input 平均 8 万 token，是同集群其他应用的 40 倍。下钻到模型调用详情看具体 prompt——开发同学为了“提高准确率”把整篇 PDF 直接塞进 system message，每次对话都重复发送。OBI 在内核层抓到这个细节，根本不需要业务配合改代码、加埋点。

▍  场景三：自研 Agent 直接拼 HTTP 调大模型，SDK 探针完全失效

一个团队基于 Python requests 自研了 Agent 直接调用通义千问 /chat/completions，没有用任何官方 SDK——理由是想自己控制重试和超时逻辑。这条路径下，所有基于 SDK monkey-patch 的 OpenTelemetry instrumentation 库全部不工作，团队一度认为“自研 Agent 没法接观测”。

接入 OBI 后，无需改一行代码、无需装任何 Python 包，调用链立刻出现在 AI Agent 可观测大盘里：Provider 自动识别为 qwen，model、input/output tokens、tool_calls 一应俱全，与官方 SDK 接入的应用呈现完全一致。原因前面讲过——OBI 看的是 TCP 上流过的 HTTP 报文，根本不关心应用用没用 SDK。这是 OBI 相比任何 SDK 方案最硬核的差异化：覆盖范围不是“接入了我们 SDK 的应用”，而是“所有通过 HTTP 调用大模型的应用”。

下面两张截图来自同一个 OBI「AI Agent 可观测」大盘——上面是本文场景三里那个完全用 stdlib http.client 拼请求的 raw-http-agent，下面是用官方 OpenAI SDK 接入的 openai-mcp-demo。两者在「模型分析」视图下的字段——调用量、平均耗时、Token 总量、模型维度（qwen-plus / text-embedding-v3）、各模型耗时与调用量分布——结构完全一致。

raw-http-agent  |  openai-mcp-demo
---|---
|
|

###

_ ** 后续计划  ** _

_ Cloud Native  _

当前版本的 OBI 已经实现了 GenAI 调用链路的完整追踪，但这只是起点。接下来我们将重点推进以下方向：

TTFT（Time To First Token）度量：  对于流式响应场景，从请求发出到第一个 SSE 事件到达的延迟是用户体感最直接的指标。OBI 将在内核层精确记录这一时间差，帮助开发者定位“模型响应慢”到底慢在网络、排队还是推理本身。

** GenAI 专属指标统计：  ** 在 Trace 之外，OBI 将产出一组面向 AI 场景的 Metrics——包括 token 消耗速率、调用成功率/错误率按 Provider 和 Model 维度聚合、平均响应延迟分位数、Tool Call 调用频次 Top-N 等。这些指标可直接对接 Prometheus/Grafana 或阿里云 ARMS，实现开箱即用的 AI 应用监控大盘。同时持续跟进新兴 AI 服务商（DeepSeek、Mistral 等）的 API 特征，确保 Provider 识别始终走在用户前面。

** Agent 全链路可观测：  ** 随着 AI 应用从单次问答演进到多步骤 Agent 架构，OBI 将提供 Agent 执行链路的端到端追踪能力。具体包括：在内核层自动识别 Agent 的 Planning → Tool Call → Observation → Response 循环，将每一轮决策和工具调用串联为完整的 Agent Trace；支持 MCP（Model Context Protocol）协议语义识别，自动标注 Tool Name、调用参数摘要、返回状态；针对 ReAct、Function Calling 等主流 Agent 模式，提供专属的调用拓扑视图和耗时瀑布图，帮助开发者定位 Agent “卡在哪一步”、“哪个 Tool 拖慢了整体响应”。

** 多轮对话上下文关联：  ** 将同一个 session 内的多次 LLM 调用串联为完整的对话链路，支持按 conversation 维度分析 token 消耗趋势和响应质量退化。

_ ** 总结  ** _

_ Cloud Native  _

回到开头的那个“没有监控录像的案发现场”——当用户再反馈“回答不对”时，开发者不必再靠猜、靠摹，也不需要为每个 Provider 写一套埋点 wrapper。只要跑在 Linux 上，OBI 就能在内核层面自动捕获每一次 LLM 调用、每一次 Tool Call、每一次向量检索，输出符合 GenAI 语义约定的标准遥测数据。不是在应用里埋探针，而是把操作系统变成了 AI Agent 的全息记录仪。官方 SDK 也好、裸 HTTP 拼请求也罢，Python、Go、Java、Node.js 同交一份数据、同走一套仪表盘，语义约定迭代只需升级 DaemonSet，应用零改动。对于正走向多步 Agent、多模型协同、多 Provider 混部的团队来说，这意味着可观测性不再是上线之后才补的补丁，而是从第一个包起就默认存在的基础设施。

相关链接：

[1] 云监控 2.0 接入中心

https://help.aliyun.com/zh/cms/cloudmonitor-2-0/access-center

预览时标签不可点

[

微信扫一扫
关注该公众号

[ 知道了 ](<javascript:;>)

微信扫一扫
使用小程序

****

[ 取消 ](<javascript:void\(0\);>) [ 允许 ](<javascript:void\(0\);>)

****

[ 取消 ](<javascript:void\(0\);>) [ 允许 ](<javascript:void\(0\);>)

****

[ 取消 ](<javascript:void\(0\);>) [ 允许 ](<javascript:void\(0\);>)

×  分析

__

微信扫一扫可打开此内容，
使用完整服务

：  ，  ，  ，  ，  ，  ，  ，  ，  ，  ，  ，  ，  。  视频  小程序  赞  ，轻点两下取消赞  在看  ，轻点两下取消在看  分享  留言  收藏  听过
