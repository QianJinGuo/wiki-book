---
title: "Claude最大规模MCP升级，月下载狂飙破4亿！"
source_url: "https://mp.weixin.qq.com/s/gdRpVIfOPGUaSOJ3IlskxA"
author: "ASI启示录 / 新智元"
platform: WeChat
ingested: 2026-07-29
slug: mcp-2026-07-28-stateless-extensions-ema
sha256: b1db582fff16a6c17a2c9df55432bdfafe34f08081fd8ce1858fb9686f3e1d35
---

MCP 2026-07-28 是 MCP 协议自发布以来最大规模更新，由 Anthropic 官方发布。

## 关键数据

- MCP 月度 SDK 下载量突破 4 亿（今年 4 倍增长）
- TypeScript 和 Python SDK 累计下载量均跨越 10 亿
- Claude 应用商店 MCP 服务器超过 950 个

## 核心架构变更：无状态 (Stateless)

MCP 从双向有状态协议切换到纯粹的请求/响应模式。核心变化：
- 抛弃了 Mcp-Session-Id 头部和初始化握手
- 每个请求自描述（客户端身份和能力包含在 _meta 中）
- 可直接挂载在普通轮询负载均衡器后面，水平扩展能力拉满
- 支持 Serverless 和边缘计算部署（AWS Lambda、Vercel、Cloudflare Workers）

如需跨调用保留状态：通过工具生成显式 Handle，让 Claude 模型作为参数传回。

## Extensions 成为一等公民

Anthropic 正式将 Extensions 标准化为官方框架：

### MCP Apps
服务器可在 Claude 聊天界面的安全沙盒 iframe 中渲染服务器端交互式 UI（如动态报表、控制面板），实现所见即所得。

### Tasks
正式可用（io.modelcontextprotocol/tasks），提供基于轮询的 tasks/get 和 tasks/update 机制。变更通知统一为 subscriptions/listen 数据流。

### Enterprise Managed Auth (EMA)
企业可直接通过微软 Entra、Okta 等身份提供商集中控制 MCP 服务器访问权限。管理员一次授权，用户通过 IdP 群组继承访问权限，首次登录自动连接，零接触安全登录。

## 底层协议优化

### MRTR (Multi Round-Trip Requests)
取代长连接。工具执行到一半需用户输入时，服务器返回 resultType: "input_required" 附带问题。客户端回答后带 inputResponses 重新发起调用。

### Header-based Routing
可流式 HTTP 请求必须包含 Mcp-Method 和 Mcp-Name 头部。API 网关/限流器/WAF 可根据 Header 直接路由和计费，无需解析 JSON 主体。

### 列表结果缓存
tools/list、prompts/list 等接口响应自带 ttlMs 和 cacheScope 提示，保证确定性排序。

### 安全认证终极硬化
- 全面对齐生产级 OAuth 2.0 和 OIDC 部署
- 强制 RFC 9207 发行者验证
- 弃用 DCR，全面转向 CIMD（客户端元数据文档）
- 修复 OAuth redirect_uri 错误问题（localhost 重定向）

## 开发体验

- 开发者看板：监控 MCP 服务器采用率、诊断报错与延迟
- MCP Tunnels（研究预览）：不暴露公网 IP/不入站防火墙规则的情况下将 Claude 直连企业内部网络的 MCP 服务器

## 生态兼容

Figma、Intuit、Netlify、Zoom 等巨头背书。四大 Tier 1 SDK（TypeScript、Python、Go、C#）全面同步更新支持，Rust SDK Beta 支持。旧版 Roots/Sampling/HTTP+SSE 传输机制有 12 个月官方弃用政策。
