---
source_url: https://mp.weixin.qq.com/s/ZjB-AVxe0hPjTz-SCf_sBw
ingested: 2026-08-06
sha256: 88edb37d922c5d799cc752fca715c163099d5966116e1c76795b15f08d4d62ce
title: "MCP 重回 HTTP 范式，再次证明架构设计和工程实践才是稀缺资源"
author: 阿里云云原生
source: 阿里云云原生
type: raw
tags: [mcp, stateless, higress, gateway, http, protocol, serverless]
---

# MCP 重回 HTTP 范式，再次证明架构设计和工程实践才是稀缺资源

> 原始来源：https://mp.weixin.qq.com/s/ZjB-AVxe0hPjTz-SCf_sBw
> 作者：阿里云云原生（2026-08），Higress 网关团队视角

## 背景：Higress 的 MCP 历程

Higress 在国内率先支持 MCP Server 管理，一直在关注 MCP 发展。时间线：MCP 2024-11 开源（预感比 Function Calling 更易被广泛使用）→ 2025-03 Higress 开源 Remote MCP Server 托管方案并上线 MCP 市场 → 2025-04 支持存量 OpenAPI 批量转化为 MCP Server → 2025-04 MCP 引入 Streamable HTTP 传输层（对比分析 Streamable HTTP vs HTTP+SSE）。

MCP 爆火后遇到挑战：主流 Agent 客户端开始将 CLI 作为连接外部系统的技术方案，"MCP 被沦为弃子"说法甚嚣尘上。社区对 MCP 的吐槽集中在**上下文拥挤和费钱**。

## 01 这次升级解决了什么问题：重回 HTTP 范式

最新版核心改动：**把 MCP 从有状态、依赖长连接的协议，改回无状态的请求/响应模型**。HTTP 协议的无状态是 Web 架构里最基础、最成熟的做法。

### 过去的有状态模式及其成本

过去 MCP 依赖 initialize/initialized 握手和 Mcp-Session-Id 会话标识维持上下文——同一会话的多次请求必须落到同一个服务端实例，否则上下文丢失。以高德地图 MCP Server 为例：用户问"从公司到最近的充电桩怎么走"，Agent 一次会话连着调用多个 tool（地理编码→POI 搜索→路径规划），三个 tool 共享同一会话上下文，有状态模式下必须由同一实例承载。调用量上涨、后端多实例部署后，负载均衡不能简单打散请求，而要保证同一会话回到最初实例（**会话亲和性**）——要么负载均衡记住会话与实例绑定关系，要么实例间共享会话状态，都是横向扩容的额外架构成本。

### 新版本改动

- **退役握手和会话标识（SEP-2575、SEP-2567）**：每个请求自描述，协议版本、客户端身份和能力随请求携带——任何请求可落到普通轮询负载均衡后的任意实例，无需共享存储
- **长连接交互替换为 MRTR**：原先依赖服务端主动发起的交互（elicitation、sampling、roots）被替换为多轮请求——服务端返回 input_required，客户端带上答案重试
- **强制 Mcp-Method 和 Mcp-Name header（SEP-2243）**：网关、限流器可直接按 header 路由和计量，无需解析请求体

## 02 社区并非一面倒支持：最痛的槽点没解决

无状态化解决的是**部署和扩展**问题，降低运维复杂度；但社区对 MCP 最集中的抱怨是**上下文拥挤和费钱**（开发者体验问题），新版本几乎没有正面回应。

- **上下文拥挤根源**：工具定义前置加载——Agent 干活前要把所有可用工具说明读进上下文，工具一多光定义就占掉相当部分窗口
- **最接近的改动**：tools/list、prompts/list、resources/list 返回结果携带 ttlMs 和 cacheScope（SEP-2549），客户端可缓存工具目录、重连后保持上游 prompt 缓存稳定；新增可选 server/discover 让能力发现更前置。**但缓存优化的是不要反复重新拉取工具清单，并没有降低单轮对话里工具定义占用的 token**——该占的上下文仍然要占，只是重复获取次数减少。对上下文拥挤这个核心槽点，缓存是外围改善，不是本质解法
- **费钱是上下文拥挤的直接结果**：token 占用没下降，调用成本降不下来。新版本没有任何一条改动优化压缩工具。开发者真正想要的是：**工具按需加载，只在需要时把相关工具定义喂进上下文**
- **新成本：迁移**。无状态化是破坏性变更，依赖会话标识的实现需要改造代码。弃用清单：Dynamic Client Registration 正式弃用（转向 CIMD）；Roots、Sampling、Logging 弃用；Legacy HTTP+SSE 传输进入退场倒计时

## 03 结论：架构设计和工程实践才是稀缺资源

这次升级没有引入新颖机制——无状态、请求自描述、按 header 路由都是 Web 架构用了很多年的老办法。MCP 绕一圈回到这些做法，是因为爆火后真正的考验不再是"是否定义了 Agent 连接外部系统的新标准"，而是"能不能在规模化的流量下，保障调用方和维护方的体验"。前者靠一个 idea 就能解决，后者是对可扩展性、部署形态和治理成本的通盘考量——需要扎实的架构设计和丰富的工程实践，这是 AI 时代最容易被低估、也最稀缺的东西。

Higress 正在开发对 MCP 最新版的支持（本周发布：https://github.com/higress-group/higress/pull/4059）。

（End）
