---
title: "MCP 协议史诗级更新"
source_url: "https://mp.weixin.qq.com/s/Dm8oWJam7QpKqAurrKvAew"
author: VibeCoder
platform: WeChat
ingested: 2026-07-29
slug: mcp-2026-07-28-vibecoder-engineering-analysis
sha256: 5230a3cf8805320d531afbeb01f0fc0216e950d60440a654c688395196032634
---

VibeCoder 对 MCP 2026-07-28 第五版规范的工程视角分析。与新闻媒体报道不同，本文侧重架构影响和迁移策略。

## 核心变更：无状态化

删除 initialize 握手和 Mcp-Session-Id。每个请求通过 _meta 声明协议版本、客户端能力与身份。HTTP 增加 MCP-Protocol-Version、Mcp-Method、Mcp-Name 标准头。

网关可直接按方法和工具名做路由、限流、计量。服务端需校验 header 与 body 一致性。

## 三种状态的交接路径

### 1. 业务 Handle
购物篮/浏览器实例/工作区等跨工具调用状态。服务端创建对象后返回 ID（如 basket_id），模型在下次调用中作为普通参数传回。Handle 需绑定 principal 和 tenant，每次调用重新鉴权，具备 TTL、撤销、幂等和并发控制。

### 2. MRTR requestState
工具执行到一半需要用户确认时，服务端返回 input_required + inputRequests + requestState。客户端收集答案后重发原方法和原参数 + inputResponses + requestState。重试可落到另一台实例。
requestState 经过不可信客户端，需 HMAC/AEAD 保护完整性。

### 3. Tasks taskId
长耗工作（CI/批处理/人审）返回持久 taskId。客户端用 tasks/get 查进度，tasks/update 补输入，tasks/cancel 协作式取消。

## 扩展体系（Apps/Tasks）

MCP Apps：工具声明 ui:// 资源，Host 在沙箱 iframe 渲染 HTML（图表/表单/PDF/3D）。UI 发起的工具调用仍经 Host 权限和审计路径。

扩展有独立 ID、版本、仓库和维护者。需 client 和 server 双方支持。

## 生产控制面

- ttlMs + cacheScope：工具列表可明确缓存策略。多租户系统不能将用户相关的工具标成 public
- W3C Trace Context：traceparent/tracestate/baggage 贯穿 Host→Client SDK→MCP Server→下游 API
- OAuth/OIDC 收敛：校验 iss、凭据绑定 issuer、DCR 设置正确 application_type、step-up 累积 scope

## 迁移路径

TypeScript SDK v2：官方文档明确——只升级 package 默认仍走 legacy wire。factory 模式可同时支持 2026 modern 和 2025 stateless legacy。

上线建议监控：modern 协商成功率、legacy fallback 比例、extension 集合、MRTR 轮次错误、auth issuer mismatch、header/body mismatch。连续两次调用打到不同实例后状态仍持续，才算真正拿到无状态收益。
