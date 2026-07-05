# How OpenAI Delivers Low-Latency Voice AI for 900M Users

## Ch01.1139 How OpenAI Delivers Low-Latency Voice AI for 900M Users

> 📊 Level ⭐⭐⭐ | 7.5KB | `entities/openai-low-latency-voice-ai-900m-users-bytebytego.md`

# How OpenAI Delivers Low-Latency Voice AI for 900M Users

## 摘要

ByteByteGo 对 OpenAI 实时语音 AI 基础设施的深度技术分析揭示了其为 900M 周活用户提供低延迟语音体验的架构设计。核心架构将 WebRTC 协议处理拆分为**无状态中继层**（Stateless Relay）和**有状态收发层**（Stateful Transceiver）两部分，利用 ICE ufrag 字段作为路由密钥，在 Kubernetes 的弹性基础设施上实现了传统上需要固定 IP/端口的 WebRTC 部署。架构覆盖了从全球边缘中继（Global Relay）、用户态 Go 实现、SO_REUSEPORT 优化，到 Redis 缓存恢复的全链路设计。

## 核心要点

- **架构拆分原则**：将 WebRTC 会话拆为无状态中继（边缘就近转发）和有状态收发器（持有 ICE/DTLS/SRTP 状态），解决 Kubernetes 环境下 WebRTC 的端口耗尽与状态粘性问题
- **ICE ufrag 路由技巧**：在信令阶段生成服务器端 ufrag 并嵌入路由元数据，中继层解析首包的 ufrag 即可决定转发目标，无需查数据库或随机路由
- **拒绝 SFU 的选择**：OpenAI 评估了标准 SFU（Selective Forwarding Unit）架构后选择自研中继模式，因为其流量模式以 1:1 对话为主，SFU 的多方会议设计反而带来不必要的开销
- **全球中继部署**：通过 Cloudflare 进行信令层面的地理就近路由，媒体路径经 Global Relay 在用户附近入网，端到端保持低延迟
- **用户态 Go 实现**：使用 SO_REUSEPORT、runtime.LockOSThread、预分配缓冲区等常规优化手段即支撑了全球流量，无需内核旁路（kernel bypass）

## 深度分析

### WebRTC 与 Kubernetes 的固有矛盾

WebRTC 协议诞生于服务器拥有固定 IP 和端口的时代——标准的部署方式为每个会话分配一个 UDP 端口。然而 Kubernetes 将计算视为廉价可迁移的资源，Pod 的 IP 和端口是动态的。这产生了两个直接冲突：

1. **端口耗尽**：OpenAI 规模下需要数万个公共 UDP 端口。云负载均衡器设计为处理少量知名端口，每增加一个端口范围都带来运维复杂性。Kubernetes 自动扩缩容与预留大段稳定端口的需求直接冲突。
2. **状态粘性**：ICE 连接检查和 DTLS 握手是有状态的——启动会话的进程必须持续接收该会话的报文。若一个已有会话的报文落到不同的进程上，连接建立会失败或媒体流中断。

OpenAI 的解决方案——将报文路由与协议终止分离——既保留了 WebRTC 的能力，又适应了 Kubernetes 的弹性模型。这是"基础设施反推架构创新"的典型案例。

### ICE ufrag 路由的巧妙之处

中继层的核心难题是**第一个报文的路径决策**——后续报文可以通过已建立的源地址→目标地址映射来路由，但第一个报文没有映射记录。

两种朴素方案都有缺陷：数据库查询在热路径上增加延迟和依赖；随机路由到某个收发器然后内部转发则加倍跳数。

OpenAI 选择了第三种方案：利用 WebRTC 协议中已经存在的字段——ICE ufrag（ICE username fragment）。信令过程中生成的 ufrag 可以由服务器自主决定内容，因此可以在其中嵌入路由元数据。中继层解析首个 STUN Binding Request 报文中的 ufrag，解码路由提示，直接转发到正确的收发器。后续报文走已建立的会话映射，无需再次解析 ufrag。

这个方案的原则具有通用价值：**当需要在热路径上获取数据时，首先检查协议已经在交换的内容**。报文上的一个字段几乎免费解析，而新增查询则带来延迟、依赖和额外的故障点。

### 用户态 Go 的性能之道

OpenAI 评估了内核旁路（DPDK 等）但最终选择留在用户态，理由充分——工作量在谨慎的 Go 实现能力范围内。三个关键技术选择承载了大部分性能：

- **SO_REUSEPORT**：允许同一主机上的多个 Worker 绑定同一 UDP 端口，内核将入站报文分布到各 Worker，消除单点瓶颈
- **runtime.LockOSThread**：将每个 UDP 读取的 Goroutine 锁定到特定 OS 线程，配合 SO_REUSEPORT 倾向于将同一流量的报文保持在同一个 CPU 核心上，提升缓存局部性、降低上下文切换
- **预分配缓冲区**：减少报文解析过程中的内存分配，降低 Go GC 压力

核心启示：**在架构正确的前提下，常规工程优化手段足以支撑全球规模的实时流量**。不是所有问题都需要内核旁路或自定义硬件——架构拆分所带来的收益往往远大于微观优化的收益。

### 架构的局限性

这并不是一个通用的 WebRTC 方案。设计基于两个关键假设：

1. **1:1 会话为主**：如果 OpenAI 未来需要多方功能（群组语音通话、多参与者 AI 会话、人工接管），大部分架构可能需要重构。中继模式和跳过 SFU 的决策都基于"大多数会话恰好有两个端点"的假设。
2. **信令端可控**：ufrag 技巧依赖于在信令阶段控制服务器端 ufrag 的生成。使用现成信令栈的团队可能难以直接套用。

此外，所谓的"无状态"中继实际上持有软状态——内存中的流表和 Redis 缓存——只是设计上允许通过协议重建状态。

## 实践启示

1. **拆分状态 vs 无状态是架构的核心杠杆**：OpenAI 将 WebRTC 拆为无状态中继+有状态收发器，解决了 Kubernetes 部署的根本矛盾。这个模式可推广到任何需要将传统有状态协议适配到云原生环境的场景。
2. **利用协议自身的字段解决路由问题**：当热路径上需要数据时，首先检查协议已在对等体间交换的内容。ICE ufrag 的方案比额外查询数据库优雅得多——这是"在既有协议上构建"原则的完美体现。
3. **用户态实现足够好就不要上内核旁路**：OpenAI 的用户态 Go 实现（SO_REUSEPORT + LockOSThread + 预分配缓冲区）证明，只要架构设计合理，常规优化手段可以支撑全球规模——避免不必要的复杂度。
4. **全球边缘入局降低首包延迟**：通过 Global Relay 在用户地理附近入网，直接缩短信令往返和首次 ICE 连接检查的时间。这是降低交互式语音应用感知延迟的关键手段。
5. **架构决策要匹配流量模式**：OpenAI 没有盲目采用业界标准的 SFU 架构，而是根据自身 1:1 对话为主的流量特征选择了更轻量的方案。架构选择必须基于实际的 workload 特征，而非行业流行度。

## 相关实体

- [多区域 GPU 推理调度](ch03/045-agent.md)
- [TokenSpeed 推理引擎](ch04/587-tokenspeed-agentic-inference-engine.md)
- [跨区域推理](ch11/253-bedrock.md)
- [CloudFront 全球部署](ch04/277-ai.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/openai-low-latency-voice-ai-900m-users-bytebytego.md)

---

