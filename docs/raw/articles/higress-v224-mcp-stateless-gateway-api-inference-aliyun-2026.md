---
title: "从新版 MCP 到 Gateway API 推理扩展：读懂 Higress v2.2.4 的关键变化"
source_url: "https://mp.weixin.qq.com/s/KJ_f87Jo6bA2FVqYKeK-wA"
source_author: "阿里云云原生（如漫、澄潭）"
source_site: "微信公众平台"
source_published: 2026-08-20
ingested: 2026-08-20
type: raw-article
tags: [higress, mcp, gateway-api, inference-extension, ai-gateway, kubernetes, stateless-http]
sha256: "f5638298998f4472437eccc41ef26ad0c51274aab2ffe9db8973eff63dd8a82f"
---

# 从新版 MCP 到 Gateway API 推理扩展：读懂 Higress v2.2.4 的关键变化

2026 年 7 月 28 日，MCP 发布新的正式协议修订，把远程工具调用从「先握手、再维持会话」调整为「每个请求都带齐上下文」；Kubernetes 的 Gateway API 演进到 1.6 系列；在它之上，面向 GPU 推理流量的 Gateway API Inference Extension（推理扩展）也在继续推进。这些变化最后都会落到网关上。v2.2.4 给这些链路补上了实现，也给出了可验证范围。

## 核心交付（验证结果）

- **Agent 工具调用能否横向扩容**：MCP 2026-07-28 无状态 HTTP Tools 基线，新旧协议显式桥接；Higress 可运行 Demo：server/discover、tools/list、tools/call
- **Kubernetes 入口标准能否稳妥升级**：生产模块与转换语义对齐 Gateway API v1.6.0；运行官方 HTTP 一致性测试套件 37/37 通过，0 失败、0 跳过
- **推理请求能否落到正确模型端点**：补齐推理扩展 v1.4 多端口、数据并行与 served-endpoint 支持；运行推理扩展 v1.4 官方网关一致性测试套件 12/12 通过

## 01 MCP 支持 2026-07-28 最新协议版本

Higress 是首个支持 MCP 2026-07-28 无状态 HTTP Tools 基线的开源网关，覆盖服务发现、工具列表与工具调用，明确新旧协议边界。

早期远程 MCP 调用通常要先 initialize，再通过 Session ID 维持后续交互。单实例不复杂，但 MCP Server 一旦横向扩容就会出现问题：后续请求黏在原实例还是共享存储？实例重启后会话怎么恢复？MCP 2026-07-28 直接调整：远程工具调用不再依赖 initialize/initialized 握手和协议级 Session，每个请求携带自己的协议版本、客户端身份和能力；客户端可调用新的 server/discover 提前了解服务端能力。工具方法和工具名进入 HTTP Header，网关不必解析 JSON Body 即可路由、鉴权、限流和计量。

Higress v2.2.4 实现无状态 HTTP Tools 基线：实现 server/discover、确定性排序的 tools/list 和 tools/call；调用工具前执行输入 Schema 校验，错误停在边界；支持 modern → modern、modern → legacy、legacy → legacy 三条显式路径；对 Origin、媒体类型、请求大小、单条 JSON-RPC 消息、Header/Body 一致性做边界校验；默认隔离 Cookie、Session、Last-Event-ID、内部路由 Header 和无关凭据。

边界说明：v2.2.4 聚焦最常用的 Tools 基线，不等于实现 MCP 2026-07-28 全部能力。MRTR、Tasks、Subscriptions、Resources、Prompts、MCP Apps 和完整 OAuth 不在本期范围；已有代理默认仍走 legacy，不会因升级被静默切换。

## 02 Kubernetes 网关标准协议升级

Higress 是为数不多同时支持 Gateway API v1.6 与 Gateway API Inference Extension v1.4 的开源网关之一。两套标准同步升级，既覆盖 Kubernetes 网关入口，也把 EPP 选出的精确模型端点落到数据面转发。Higress 已进入 Gateway API 官网 Conformant Gateway Controller 列表；推理扩展收录申请已提交，正在社区评审。

**Gateway API v1.6**：将生产模块、API 类型和控制面转换语义升级到 v1.6.0，隔离 v1.4 与 v1.6 的依赖、CRD 和测试模块；新增可选 per-Gateway Deployment/Service 模式（每个受管 Gateway 拥有标签隔离的工作负载与 Listener 对应的 Service 端口），默认关闭，不悄悄改变部署拓扑。运行 v1.6 官方 HTTP 一致性测试套件 37 项通过、0 失败、0 跳过（覆盖 Gateway、HTTPRoute 与 ReferenceGrant）。

**推理扩展 v1.4**：普通负载均衡只回答「哪个 Pod 还活着」，大模型推理还要回答：哪个实例已有前缀缓存？谁的队列更短？LoRA Adapter 在哪里？数据并行场景请求应落到哪个端口/rank？推理扩展通过 InferencePool + Endpoint Picker 把协作变成标准接口。v2.2.4 补齐关键运行链路：一个 InferencePool 的多个 targetPorts 可成为可选端点；数据并行场景端点可聚合；Endpoint Picker 选中的精确 PodIP:port 能被数据面执行；实际服务请求的端点可回传。重试时真实落点可能不是首个候选，响应阶段通过 x-gateway-destination-endpoint-served 回报 EPP 核对订正。该能力默认关闭，需先装匹配 CRD 和 Endpoint Picker，再显式开启 global.enableInferenceExtension。

## 03 持续投入社区维护，冲刺 CNCF 孵化

Higress 正在冲刺 CNCF Incubation，TOC 已介入前置技术、安全评审。近期进展：LFX 月度社区会议 + GitHub 议题提交流程；公开维护者名册（7 位维护者来自 4 家机构）；CodeQL 覆盖 PR/main/周期扫描，Go vet 零 warning 门禁，OpenSSF Best Practices 达 Passing；AI/Agent 辅助贡献需 Maintainer 批准 Proposal 与 Design 后按授权 TASK 实施并记录验证命令/结果/证据/哈希。

## 04 其他改动

- AI 负载均衡新增 AdaptiveScore（综合首 Token 延迟、总响应延迟、当前并发、累计失败率选后端；跨网关可接 Redis，异常自动回退本地计算）
- 观测与限流：ai-statistics 增加 llm_failure_count，SSE 按完整事件分帧，ai-token-ratelimit 与 cluster-key-rate-limit 支持多规则共同生效
- 插件发布统一版本机制，43 个官方 Go/Rust 插件记录版本、OCI digest、源码 commit 和 input hash
- 稳定性：累计 65 项优化（运行时资源效率、配置热更新、异常处理、协议兼容），Proxy-Wasm worker 线程调度优化，Redis 热重载期间保持在途请求连续，大请求提前返回 413
- Console：AI 路由插件展示、上游搜索、Qwen Provider、MCP Server 配置、正则路径重写；新增可自行构建验证的 Qwen3Guard 插件实现
