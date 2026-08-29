---
title: "Multi-Agent：A2A 协议万字深度解读——让 AI Agent 真正对话"
source_url: "https://mp.weixin.qq.com/s/bv46Yxi3eZi20O_XEMAA4Q"
author: "StefanYUN"
publisher: "徐同学呀"
published: 2026-08-17
ingested: 2026-08-29
language: zh
type: raw-article
sha256: "6ceebe5b86036dd099a4cd82caffd94598ce321161ed087b4d27dc04e7594e15"
---

# Multi-Agent：A2A协议万字深度解读——让AI Agent真正对话

> 本文基于 A2A 协议官方仓库 https://github.com/a2aproject/A2A 解读整理。

## 1. 为什么需要 A2A 协议

### 1.1 Agent ≠ Tool

Agent 和 Tool 是两种本质不同的交互对象。Tool 有明确的结构化输入输出、无状态、执行单一功能；Agent 是自主系统，能推理、能规划、能用多个工具、维护长时间交互状态、在多轮对话中协商澄清精炼。把 Agent 包装成 Tool 会丢掉自主判断、动态规划、交互式澄清能力。

### 1.2 N² 集成困局

没有标准协议时，每对 Agent 协作都需要点对点自定义开发：3 个 Agent 需 3 对集成，10 个需 45 对，100 个需 4950 对。六个连锁痛点：Agent 降维（Agent Exposure，本质痛点）、点对点自定义开发、创新减速、互操作性缺失（框架/公司 Agent 孤岛）、安全缺口（无统一安全审计路径）、可扩展性陷阱。

### 1.3 五大设计原则

四字哲学：用最小协议复杂度实现最大范围 Agent 安全协作。

1. **简单性**：复用 HTTP、JSON-RPC 2.0、SSE，不发明新传输/序列化/安全模型。
2. **企业就绪**：对齐 OAuth2/OIDC、TLS、OpenTelemetry，复用现有网关/负载均衡/审计基础设施。
3. **异步优先**：任务可能几分钟到几天，原生支持长运行任务、SSE 流式、Push 异步通知。
4. **模态无关**：Part 支持 text/raw(base64)/url/data 四种内容类型，多模态混发。
5. **不透明执行**：只依赖声明的能力（Agent Card）和交换信息，不暴露内部逻辑/记忆/工具。三重价值：保护 IP、安全边界清晰、解耦。

### 1.4 Agent 技术栈四层定位

从上到下：A2A 层（Agent 间横向协作）、MCP 层（Agent 连接工具和数据源）、框架层（ADK/LangGraph/CrewAI）、模型层（LLM 推理引擎）。四层各司其职。

### 1.5 与 MCP 定位区分

MCP 纵向（Agent 连接工具，结构化 I/O，无状态，主从）；A2A 横向（Agent 对等协作，多轮对话，有状态，任务可演变）。判断标准：能包装成函数签名 → MCP；是有自主推理能力的 Agent → A2A。互补非竞争。

### 1.6 A2A 请求生命周期

四步：发现（GET /.well-known/agent-card.json）→ 认证（解析 securitySchemes，OAuth2/OIDC 或 API Key）→ 发送消息（SendMessage POST 创建 Task，凭证放 HTTP Header 非 JSON-RPC payload）→ 流式更新（SendStreamingMessage SSE 长连接：SUBMITTED→WORKING→ArtifactUpdate→COMPLETED）。发现与认证分离：Agent Card 公开可索引，但实际交互需要认证。

## 2. 三角色模型与核心元素

### 2.1 三角色模型

- **User**：人或自动化服务，发起请求、定义目标。
- **A2A Client / Client Agent**：代表用户发起 A2A 通信，负责发现远程 Agent、获取凭证、发送消息、接收响应。
- **A2A Server / Remote Agent**：暴露 HTTP 端点实现 A2A 协议的 AI Agent，对客户端是不透明黑盒。

### 2.2 Agent Card：数字名片

JSON 元数据文档，五类关键信息：身份（name/description/version/provider）、端点（supportedInterfaces[]：url/protocolBinding/protocolVersion）、能力（capabilities: streaming/pushNotifications/extendedAgentCard）、认证要求（securitySchemes[]，对齐 OpenAPI）、技能列表（skills[]：id/name/description/tags/examples/inputModes/outputModes）。声明式设计，N 个 Agent 只需 N 个 Card，而非 N² 集成文档。

### 2.3 Task：有状态的工作单元

状态机：SUBMITTED → WORKING → 终态 COMPLETED/FAILED/CANCELED/REJECTED；中断态 INPUT_REQUIRED/AUTH_REQUIRED。终态永久结束不可重启；中断态暂停等待外部输入。可靠引用、清晰工作单元、实现简单。

### 2.4 Message：单轮通信

Message { role: ROLE_USER|ROLE_AGENT, messageId, parts: Part[] }。可含多个 Part 同时发文本+图片+结构化数据。

### 2.5 Part：统一内容容器

v0.3 有三种独立类型（TextPart/FilePart/DataPart），v1.0 统一为 Part { oneof content: text/raw/url/data, mediaType, filename, metadata }。Message 和 Artifact 共用同一 Part 结构；metadata map 提供无协议变更的扩展点。raw vs url 是工程权衡：64KB 以下用 raw 内联（base64 +33% 体积但省一次 HTTP 请求），1MB 以上用 url，中间看场景。

### 2.6 Artifact：任务产出

Task 的具体交付物，可多产出、可分块流式传输（append + lastChunk 标记组装）。Message vs Artifact 边界：过程性状态更新 vs 结果性交付物。

## 3. Agent 发现机制

### 3.1 Well-Known URI（RFC 8615）

https://{domain}/.well-known/agent-card.json，与 OIDC Discovery/WebFinger 同族。静态 JSON 文件，适合开放或域内可控场景。

### 3.2 Curated Registry

中央注册表，Agent 发布 Card，客户端按 skills/tags/provider/capabilities 过滤查询。适合企业内部。**最大互操作缺口：A2A 规范未定义注册表标准 API，各 Registry 查询接口互不兼容，跨 Registry 搜索不可能**。

### 3.3 Direct Config

硬编码/配置文件/环境变量，最封闭，适合已知静态 Agent 关系。

### 3.4 两层 Agent Card

Public Agent Card（GET /.well-known/agent-card.json 无需认证）与 Extended Agent Card（GetExtendedAgentCard RPC 需认证，含敏感技能/详细参数/内部端点）。渐进式信息暴露平衡可发现性和安全性。

### 3.5 安全保护与 HTTP 缓存

三大保护：不嵌入静态密钥（推荐 out-of-band 动态凭证 OAuth token）、mTLS/网络限制/HTTP 认证、Registry 选择性披露。缓存：Cache-Control: max-age=3600 + ETag + If-None-Match 条件请求 304。Extended Card 缓存绑定认证会话。

## 4. Task 生命周期与多轮交互

### 4.1 contextId + taskId 两级设计

contextId（服务端生成）：对话级上下文，逻辑分组多个 Task 和 Message，直接对应 LLM context；taskId：任务级边界，单次工作单元生命周期。首次消息无两者 → 服务端生成；续同一上下文新建 Task 只带 contextId；续特定 Task 带两者。同一 contextId 下可多个并行 Task，用 referenceTaskIds 表达依赖。对比 session ID：contextId 粒度更细、天然支持并行、直接对应 LLM context、任务边界清晰。

### 4.2 三种 Agent 类型

Message-only Agent（总是返回 Message，适合问答/翻译/摘要）、Task-generating Agent（总是返回 Task，适合需要统一审计的企业场景，Task 完成后不能再发消息）、Hybrid Agent（推荐：先用 Message 协商再 Task 执行）。

### 4.3 Task 不可变性与精炼

终态不可重启，后续交互创建新 Task 并带 referenceTaskIds 引用原 Task。referenceTaskIds 是提示非强制：Agent 推断 Artifact 引用优先级为 referenceTaskIds → contextId → 仍歧义则 INPUT_REQUIRED 澄清。客户端可在 Part metadata 精确填 artifactId/taskId。哲学：Agent 的核心价值是推理判断，不确定时问而非猜。

### 4.5 JSON-RPC 示例

帆船图片生成→精炼完整示例：SendMessage 无 contextId/taskId 首请求 → 返回 COMPLETED Task（contextId + taskId + Artifact raw base64）→ 精炼请求带 contextId + referenceTaskIds → 新 taskId 新 artifactId 同 artifact-name（版本追踪约定）。

## 5. 消息与产物的区分

- Message：过程性通信（发起请求、澄清、报告状态），**不保证持久化**——SSE 断连期间推送的 Message 可能丢失；Task 状态持久可重新订阅（SubscribeToTask/GetTask）。
- Artifact：结果性交付，可被引用、精炼、版本追踪。**版本追踪由客户端负责**（服务端无状态设计偏好）：客户端用一致 artifact-name 标记同一产物新版本，接受/拒绝版本链是客户端编排逻辑。

## 6. 流式更新与异步通知

三种机制覆盖秒级到天级：Request/Response（秒级，长任务用 GetTask 轮询）、SSE Streaming（分钟级，SendStreamingMessage + 长连接）、Push Notification（小时/天级，webhook URL 主动 POST）。

### 6.2 SSE 详解

capabilities.streaming: true 前提。SendStreamingMessage 一次调用完成发消息+订阅。三类事件：Task（当前工作状态）、TaskStatusUpdateEvent（生命周期变化）、TaskArtifactUpdateEvent（新增/更新 Artifact，append/lastChunk 分块组装）。终态/中断态触发流关闭。断连后 SubscribeToTask 重新订阅——「SSE 连接是脆弱的，但 Task 是持久的」。

### 6.3 Push Notification

capabilities.pushNotifications: true 前提。两步：客户端 SendMessage 带 PushNotificationConfig（webhook URL + token + authentication: Bearer/apikey/hmac/mtls）→ 服务端完成后 HTTP POST StreamResponse payload（不传完整 Artifact，只传状态变化）。可为已存在 Task 单独配置（CreateTaskPushNotificationConfig），支持一 Task 多 webhook。

### 6.5 Push 客户端架构

接收端不一定是客户端应用本身（可能离线/Serverless 销毁/NAT 后），需常驻 Push Notification Service 接收 webhook：验证真实性（JWT/HMAC/防重放）、验证相关性、转发给真正客户端。payload 是 StreamResponse 格式（task/message/statusUpdate/artifactUpdate 四事件），与 SSE 统一。

### 6.6 Push 安全

SSRF 防护（域名白名单/所有权验证/egress firewall）、身份认证（Bearer/API Key/HMAC/mTLS）、JWT+JWKS 完整流程（iss/aud/iat/exp/jti/taskId claims，密钥轮换新旧公钥并存）、防重放（iat 时间窗口 + jti 已见列表）。

## 7. 多租户与多 Agent 路由

三种机制可组合：URL-Based Routing（子路径，最简单，URL 空间膨胀）、Auth Header-Based Routing（JWT aud/scope claims 或 API Key 映射表路由，无协议侵入、动态）、Body-Based Routing（v1.0 新增 tenant 字段，opaque string 由 Server 运营商定义，Agent Card 声明后客户端 MUST 回显）。最常用 URL+Auth 组合，tenant 补充细粒度。Agent Card 是路由信息单一来源。

## 8. 企业级安全与可观测性

- 传输安全：HTTPS + TLS 1.2+（1.2+ 允许 1.3 不强制，渐进兼容旧基础设施）。
- 认证与协议载荷分离：JSON-RPC payload 不含身份信息，身份在 HTTP Header——安全方案可替换、API 网关可直接处理认证、业务日志不暴露凭证。401 = 凭证缺失/无效（含 WWW-Authenticate），403 = 认证通过但授权失败。
- In-Task 二次认证：AUTH_REQUIRED 中断态暂停 Task，按需获取额外凭证（减少凭证暴露面、最小权限）。
- 四层授权模型：Agent Card skills[] 映射 OAuth scope（skill:flight 等），客户端只带自己有权限的 scope，Agent 验证 scope 覆盖请求 skill，数据层再验证操作合法性。
- 数据隐私：敏感性感知、合规、数据最小化（能用 url 引用就不内联 raw）、安全处理。
- OpenTelemetry：W3C Trace Context headers 贯穿调用链，taskId/contextId 结构化日志查询，Task 不可变性让审计可靠。

## 9. 协议绑定与版本协商

- 三层架构：Layer 1 Data Model（Task/Message/AgentCard/Part/Artifact/Extension）、Layer 2 Abstract Operations（9 个绑定无关抽象操作：Send/Streaming/Get/List/Cancel/Subscribe/Push Config 等）、Layer 3 Protocol Bindings（JSON-RPC、gRPC、HTTP+REST 及自定义）。
- **a2a.proto 是唯一权威源**，a2a.json（JSON Schema 2020-12）是从 proto 自动生成的构建产物，SDK/schema 必须从 proto 生成，手工编辑禁止。确保三种绑定数据模型一致。
- 三种绑定功能等价：JSON-RPC（HTTP POST + JSON + SSE，主要交互方式）、gRPC（HTTP/2 + Protobuf + server streaming，高性能）、HTTP+REST（v1.0 移除 /v1 前缀简化 URL）。
- 版本协商：A2A-Version HTTP header，只考虑 Major.Minor，空值默认 0.3（向后兼容），不支持返回 VersionNotSupportedError。

## 10. 扩展机制与治理

- 机制：URI 识别扩展，Agent Card 的 AgentCapabilities 声明，A2A-Extensions header 激活，默认不激活显式 opt-in。四种扩展类型：数据型、Profile 型、方法型、状态机型。核心约束：不能修改核心数据结构定义或枚举值，自定义数据放 metadata（扩展是附加非修改）。
- 两级治理：实验级（experimental-ext- 前缀，Sponsor 赞助，TSC 保留归档权利）vs 官方级（ext- 前缀 + RFC 2119 语言 + Apache 2.0 + 至少一个参考实现）。URI 是标识符非可访问 URL（避免单点故障）。
- 毕业路径：生产级实现 + 完整文档 + 采用证据 + 维护承诺 + TSC 投票（50% 法定人数简单多数）。已有扩展示例：Secure Passport、Timestamp、Traceability、AGP（Agent Gateway Protocol）。

## 11. A2A 与 MCP 的关系

- **不透明性是分界线**：MCP 工具 schema 对调用方完全公开（需要 schema 才能正确调用）；A2A Agent 内部完全不可见（保护 IP、安全边界、独立演进）。
- 同一 Agent 可同时是 A2A Server/Client + MCP Client。汽车修理店场景：Customer 助手 Agent（A2A Client）→ Shop Manager（A2A Server+Client）→ Mechanic（A2A Server+Client+MCP Client）→ Parts Supplier（A2A Server），Mechanic 用 MCP 调诊断工具。
- 判断标准：能包装成函数签名 → MCP；需要协商/状态/Artifact → A2A。A2A = partnering on tasks，MCP = using capabilities。

## 12. 生态现状

- 6 语言官方 SDK：Python/Go/JavaScript/Java/.NET/Rust。
- A2A 由 Google 贡献给 Linux Foundation 托管。TSC 含 AWS、Cisco、Google、IBM Research、Microsoft、Salesforce、SAP、ServiceNow 8 家公司，150+ 合作伙伴，Apache 2.0 许可证。
- 价值在多 Agent 跨组织协作时真正体现；单 Agent/小团队可直接函数调用或 MCP。