# OpenTelemetry eBPF Instrumentation (OBI) — 零代码全栈可观测性的内核级实现

## Ch01.295 OpenTelemetry eBPF Instrumentation (OBI) — 零代码全栈可观测性的内核级实现

> 📊 Level ⭐⭐ | 19.0KB | `entities/open-telemetry-ebpf-instrumentation-obi-zero-code-observability-aliyun-2026.md`

# OpenTelemetry eBPF Instrumentation (OBI) — 零代码全栈可观测性的内核级实现

> **来源说明**：本文基于阿里云云原生 2026-06-16 发布的 OBI 深度技术长文（《装在内核里的透视镜：云监控 2.0 不改一行代码实现全栈可观测》，作者古琦）整理。文章前 80% 内容为 OBI 上游项目（[opentelemetry-ebpf-instrumentation](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation)）的内核机制与工程实现深度解读；末段为阿里云云监控 2.0 的产品方自报接入流程，已标注。

## 一、为什么需要 eBPF 零代码可观测性

云原生与微服务架构下，一套生产系统往往横跨 Go、Java、Python、Node.js 等多种语言运行时，部署形态又散落在容器、Kubernetes、Serverless 之间。传统可观测性做法是为每种语言挂载侵入式 Agent 或 SDK——改代码、装包、对齐版本、重新发布，每接入一个新服务都是一次工程项目。

AI Agent 应用正从单次 LLM 调用演变为多步编排的复杂工作流——一次用户请求可能触发数十次大模型调用、工具执行（Tool Call）和向量检索，调用链跨越 Agent 编排层、LLM Provider、向量数据库和外部工具，传统 APM 难以完整覆盖。

eBPF 提供了一条新路：在 Linux 内核里挂载安全沙箱化的探针，不修改应用、不重启进程，就能观测进出每个进程的网络流量、库函数调用乃至系统调用。OBI 是 OpenTelemetry 社区给出的官方答案。

## 二、OBI 三大支柱

| 支柱 | 核心能力 | 关键覆盖 |
|------|---------|---------|
| **应用可观测性** | 分布式追踪 + RED Metrics + Trace-Log 关联 | Web/数据库/消息队列/GenAI/GPU 等 15+ 协议与场景 |
| **网络可观测性** | L3/L4 流量监控 + GeoIP/rDNS/CIDR 标注 + TCP RTT/失败统计 | 集群内外流量分析、拓扑可视化、安全审计 |
| **日志增强** | 内核拦截 stdout/stderr/pipe 的 JSON 日志，透明注入 trace_id/span_id | 语言无关、零代码、支持 docker logs / kubectl logs |

## 三、协议识别：三级瀑布式匹配

OBI 在不解密、不依赖端口约定的情况下判断 TCP payload 的协议类型，核心是 `ReadTCPRequestIntoSpan`（`pkg/ebpf/common/tcp_detect_transform.go`）。三级瀑布按"确定性从高到低"依次尝试：

1. **内核已标注（最快）** — `dispatchKernelAssignedProtocol`，用户态 switch `event.ProtocolType`。内核常量：MySQL=1, Postgres=2, Kafka=4, MQTT=5, MSSQL=6, NATS=7, AMQP=8。SQL 分支用哨兵错误 `errFallback` / `errIgnore` 做精细控制。
2. **确定性通用匹配** — `detectGenericProtocol`，依次 `matchSQL → matchFastCGI → matchMongo → matchCouchbase → matchMemcached`。SQL 先试请求缓冲、再试响应缓冲（命中响应时调 `reverseTCPEvent` 把方向纠正回来）。
3. **启发式兜底（最易误判）** — `detectHeuristicProtocol`，`matchRedis → matchMemcached → matchHTTP2 → matchNATS → matchAMQP → matchMQTT → matchKafkaFallback`。顺序本身就是 bug 经验的沉淀——例如 HTTP/2 必须排在 MQTT 之前，因为 MQTT 的启发式会误命中 HTTP/2 的连接前导（preface）。

### 防误判细节

- **SQL**：可打印 ASCII 前缀过滤（阈值 = `len("SELECT 1")`）→ 大小写无关搜关键字 → `sqlprune.SQLParseOperationAndTable` 提取操作与表名；`validSQL` 要求"有操作 + （明确 DB 类型 或 有表名）"
- **Postgres**：校验 5 字节消息头、类型字节 ∈ {Q,B,C} 且大端长度在 0..3000；维护 prepared statement 与 portal 的 LRU 缓存还原参数化查询
- **HTTP/2 vs gRPC**：先 `isLikelyHTTP2` 做 RFC 7540 逐帧合理性校验（帧长度宽容上限 1<<22 约 4MB；flags 掩码），再看 `content-type: application/grpc` 或 `grpc-status` 头区分

## 四、语言深度集成：不止于网络层

OBI 的探测分两层。第一层是语言无关的网络级追踪（任何语言都能通过 TCP 拦截获得基本 trace）；第二层是运行时特定的深度集成（通过 uprobe 挂钩库函数，实现精确的上下文传播与 trace 关联）。

### Go：内核里重建 goroutine 父子血缘

Go 的 goroutine 会在 OS 线程间漂移，传统 APM 的线程本地存储完全失效。OBI 在内核里重建血缘（`bpf/gotracer/go_runtime.c` + `go_common.h`）：

- 挂钩 `runtime.newproc1` 记录创建关系并写入 LRU `ongoing_goroutines`
- 出站调用找所属入站请求时，`find_parent_goroutine` 沿父链向上回溯最多 **6 层**（深嵌套兼容 franz-go 这类 Kafka 客户端）
- 挂 `runtime.casgstatus` 跟踪状态切换，把 OBI 上下文绑定到 goroutine

### Python asyncio：4 组 uprobe + 3 张 BPF Map

asyncio 事件循环在同一个 OS 线程上交替执行成百上千个协程，`to_thread()` 更把工作投递到线程池——worker 线程上根本没有 asyncio.Task 身份。OBI 在内核里追踪 CPython 的 Task 和 Context 对象：

| uprobe | 职责 |
|--------|------|
| `task_step` | 追踪事件循环切换到哪个 Task |
| `_asyncio_Task___init__` | Task 创建时记录父子关系，继承请求连接 |
| `PyContext_CopyCurrent` | Context 被复制（`create_task` / `to_thread` 触发）时绑定到对应 Task |
| `context_run` | worker 线程激活 Context 时恢复 Task 身份 |

三张 BPF Map 协同（`python_thread_state` / `python_task_state` / `python_context_task`），覆盖 await/create_task/gather/to_thread 四种并发模式。父链回溯最多 4 层。Task 地址复用靠版本计数器解决。整套方案锚定 CPython `_asyncio` 和 libpython 符号，**对 asyncio 和 uvloop 均有效，无需适配**。

### 跨进程传播：内核态统一完成

**进程内**传播各语言专属（Go goroutine 回溯、Node async_hooks、Python asyncio、Ruby Puma 队列、Java/.NET 通过 OpenSSL/JVM uprobe），但**跨进程**的 traceparent 传播对所有非 Go 语言是统一在内核态由 tpinjector 完成（`pkg/internal/ebpf/tpinjector` + `bpf/tpinjector/*.c`），三种手法：

- **HTTP/1 头注入** — `sk_msg` 程序通过尾调用链改写 payload，插入 `Traceparent:` 头；SSL socket 直接跳过（密文改不了）
- **HTTP/2 HPACK 注入** — 按流注入 HPACK 编码的 traceparent，用 huffman 指纹 `0x3fa9851d6b21834d` 识别已有头
- **TCP Option 传播** — 自定义 TCP 选项 kind=25；`WRITE_HDR_OPT` 写入 / `PARSE_ALL_HDR_OPT` 读取 / `sock_iter.c` 启动时把已建立长连接灌进 sockhash

**部署注意**：TCP Option kind=25 属于 IANA 未分配编号，部分防火墙、LB、云平台中间盒可能剥离未知 TCP 选项，导致传播静默失效。建议优先用 HTTP 头注入（`OTEL_EBPF_BPF_CONTEXT_PROPAGATION=headers`）。

## 五、数据管线：DAG + 死锁探测 + 对象池

### 顶层骨架：三条独立 Agent + errgroup

入口 `RunWithContextInfo`（`pkg/instrumenter/instrumenter.go`）按 Feature Flag 把三大支柱拆成三个互相独立的 goroutine，用 `errgroup` 绑定——任意一条挂掉，其余两条随 context 取消一起优雅退出。应用可观测这条线又分三步：`FindAndInstrument` → `ReadAndForward` → `WaitUntilFinished`。

### swarm：两阶段启动

OBI 自研的节点编排框架 `pkg/pipe/swarm`，核心是"先全部实例化、再统一运行"：

- **第一阶段**：`Instancer.Instance(ctx)` 依次调用每个节点的 `InstanceFunc`——任一失败立即取消并整体返回 error，**一个 `RunFunc` 都不会启动**，避免"半启动"残缺状态
- **第二阶段**：`Runner.Start(ctx)` 为每个节点拉 goroutine，可配 `WithCancelTimeout`——context 取消后超时未退出的节点，`Done()` 会返回 `CancelTimeoutError` **并点名僵尸节点**

### msg.Queue：带死锁探测的扇出队列

| 特性 | 行为 |
|------|------|
| 扇出（fan-out） | 一个队列可被多个下游 Subscribe；无订阅者直接丢弃、不阻塞发送方 |
| Bypass（短路） | 禁用分支 `input.Bypass(output)` 上游订阅者直接接管给下游，节点从图里物理消失 |
| 死锁自检 | `SendCtx` 内置 `sendTimeout`（默认 1 分钟）；`PanicOnSendTimeout` 模式下 panic 并打印 `A->B->C` 路径 |
| 多生产者关闭 | `ClosingAttempts(n)` + `MarkCloseable()` 引用计数 |

### 应用可观测完整 DAG

`pkg/internal/appolly/instrumenter.go` 的 `Build()` 显式拼出整条图：

```
[per-process eBPF tracers]
   |  (各进程共享 Ring Buffer)
   v
ringBufForwarder  (reader goroutine + parser goroutine, 对象池 2x BatchLength)
   |  tracesInput  (批量=100 / 1s / 3s idle-flush)
   v
ReadFromChannel -> Routes -> KubeDecorator -> DockerDecorator -> NameResolution -> AttributesFilter
   |
   v  exportableSpans  ===== 扇出 fan-out =====
   |-- OTEL Traces Exporter
   |-- Printer (debug)
   |-- SpanNameLimiter -> [OTEL Metrics | SvcGraph Metrics | Prometheus]
   `-- BPF Metrics
```

工程设计要点：
1. **指标子管线按需启动** —— 只有配了指标出口才 `setupMetricsSubPipeline`
2. **K8s 装饰器特殊超时** —— `routerToKubeDecorator` 队列取 `max(InformersSyncTimeout, ChannelSendTimeout)`，因为启动时要先拉全量 informer 快照

### ringBufForwarder：双 goroutine + 对象池

性能最敏感的进水口（`pkg/ebpf/common/ringbuf.go`，泛型 `ringBufForwarder[T]`，App 侧 T=Span、Stats 侧 T=Record 复用）：

- **读/解析分离**：`readerLoop` 只 `ReadInto` 原始 record，`parserLoop` 负责解析，二者通过 `freeIdx` / `workIdx` channel 传递槽位
- **对象池避免 GC 抖动**：预分配 `poolSize = 2 * BatchLength` 个 record 复用
- **批量提交 + 超时兜底**：攒够 `BatchLength`（默认 100）flush / `BatchTimeout`（默认 1s）ticker 兜底 / `flushOnAvailableBytes` 每 3s 检查残留字节防低流量卡顿
- **共享 ringbuf**：成百上千进程共用一个 `SharedRingBuffer`

**一句话总结**：OBI = 一个 swarm 编排的 DAG + 一组带死锁探测的扇出队列 + 一个双 goroutine 对象池 ringbuf 转发器；启动要么全成功要么全回滚，关闭可定位僵尸节点，禁用的功能从图里物理消失。

## 六、CUDA/GPU 追踪

通过 uprobe 挂钩 `libcuda.so`，追踪 NVIDIA CUDA 的核心操作——kernel launch、graph launch、内存分配、内存拷贝。`OTEL_EBPF_CUDA_MODE=auto` 自动检测并开启。

工程亮点：CUDA 事件走 **同一套泛型转发器 `ringBufForwarder[T]`**，天然共享批量提交、背压控制与优雅关闭机制，无需为 GPU 单独维护搬运逻辑——`auto` 模式零额外配置接入的本质，就是往既有 DAG 多挂一个数据源。

## 七、日志增强的工程取舍

通过 kprobe 挂钩 `tty_write`（终端输出）和 `pipe_write`（管道输出，覆盖 docker logs / kubectl logs），BPF 程序从用户态缓冲区读取原始日志内容（最大 8KB），同时获取当前线程/协程的 trace context，然后用 `bpf_probe_write_user` 将原始日志擦除（用零字节填充），并将事件经 ringbuf 送往用户态。

**已知限制**：
1. 从内核擦零到用户态写回之间存在时间窗口，若进程崩溃或日志采集器读取了输出，可能出现日志丢失或空白行
2. 部分安全加固内核（Lockdown 模式）会禁用 `bpf_probe_write_user`，部署前需确认内核配置

工程亮点：
- 内核侧通过 `ksys_write` / `do_writev` kprobe 预记录当前 fd，`pipe_write` 触发时即可关联到正确管道
- 异步写入器（ShardedQueue）按文件路径分片，同一文件的写入严格串行保证日志行序
- 若应用已自带 OTel SDK 导出 Traces（`ExportsOTelTraces`），则只注 trace_id 不注 span_id，避免与应用自身的 span 冲突

## 八、产品方自报：阿里云云监控 2.0 中的 OBI 落地

> [!note] 产品方自报
> 以下为阿里云方自报自家产品在 OBI 上的落地入口与后续路线图引导，不属于 OBI 上游项目的客观说明。技术 ingest 价值已在前文覆盖。

阿里云云监控 2.0（CMS 2.0）是面向云原生时代重构的统一可观测平台，原生基于 OpenTelemetry 协议构建，将 Metrics/Traces/Logs/Profiles/Events 五类信号收敛到同一套数据模型与查询入口下，并与 ARMS、Prometheus、SLS、Grafana 打通，支持云上云下、自建与托管混合接入。

通过云监控 2.0 接入中心 → 选择 OpenTelemetry 无侵入监控 → 选择集群一键接入。后续将逐步补充 AI Agent 可观测能力（[OBI Issue #1854](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues/1854)）、更多网络监控能力到 OBI 中。

## 九、关键技术参数清单

| 参数 | 默认值 | 含义 |
|------|--------|------|
| `OTEL_EBPF_BPF_CONTEXT_PROPAGATION` | `headers` | 跨进程传播方式：`headers` / `tcp` / `all` / `disabled` |
| `OTEL_EBPF_BPF_BATCH_LENGTH` | 100 | ringbuf 批量 flush 阈值 |
| `OTEL_EBPF_BPF_BATCH_TIMEOUT` | 1s | 批量 flush 超时兜底 |
| `OTEL_EBPF_OTLP_TRACES_BATCH_MAX_SIZE` | — | OTLP 导出批量上限 |
| `OTEL_EBPF_OTLP_TRACES_QUEUE_SIZE` | — | OTLP 导出队列大小 |
| `OTEL_EBPF_CHANNEL_BUFFER_LEN` | — | 内部 channel buffer |
| `OTEL_EBPF_CHANNEL_SEND_TIMEOUT` | 1m | SendCtx 死锁探测阈值 |
| `OTEL_EBPF_CUDA_MODE` | `auto` | CUDA 追踪模式（auto 自动检测） |
| 内核要求 | 5.8+（RHEL 4.18+） | Linux amd64/arm64 |

## 十、与其他 eBPF / 可观测性方案的关系

- **vs [Cilium Tetragon](ch01/1049-rag.html)**：Tetragon 聚焦 **运行时安全/拦截**（TracingPolicy + inline kill，syscall 级防护）；OBI 聚焦 **可观测性/追踪**（trace/metrics 生成、协议语义解析）。两者都基于 eBPF 但目标层不同
- **vs 传统 APM Agent（SkyWalking/Instana/Datadog）**：Agent 需要挂载 SDK + 改代码 + 重新发布，OBI 零侵入；代价是无法做应用层自定义埋点
- **vs [OpenClaw 可观测 (OTel+SLS)](ch01/1095-openclaw-agent.html)**：OpenClaw 走的是 LLM 应用层 Session 日志方案；OBI 是内核层全栈（含 LLM Provider 协议级追踪）

## 相关实体

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/open-telemetry-ebpf-instrumentation-obi-zero-code-observability-aliyun-2026.md)
→ [Cilium Tetragon Kubernetes Runtime Security Ebpf](ch01/1049-rag.html) — 同为 eBPF 内核级方案，但聚焦运行时安全拦截
→ [Openclaw Agent Observability Session Logs Otel Sls](ch01/1095-openclaw-agent.html) — LLM 应用层 Session 日志可观测（OTel + SLS）
→ [Alibabacloud Cms Manage Skill Natural Language Observability](../ch04/267-skill.html) — 阿里云 CMS 2.0 可观测接入的 AI Agent Skill 化（OBI 是其底层引擎之一）
→ [Agent Harness Observability Production](../ch05/039-agent-harness.html) — Agent Harness 生产可观测性

---

