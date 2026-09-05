---
title: "MCP v2 来了，Agent Client 到底要改什么"
type: raw
source_url: "https://mp.weixin.qq.com/s/RBAwG0Ik9MsX8Hm30ntgvw"
source_author: "VibeCoder"
source_date: 2026-07-31
ingested: 2026-08-02
sha256: 68fe0af55166e710e8725115b75ac6e02e7a2f1b7ff6fded62da1d8009a0cb5c
rating: 35
tags: [mcp, model-context-protocol, mcp-v2, agent-client, version-negotiation, dual-era, mrtr, host-adapter, protocol-migration, typescript-sdk, http-stdio, engineering-analysis]
---

# MCP v2 来了，Agent Client 到底要改什么

> 来源：VibeCoder（独立技术博客）
> 主题：MCP 2026-07-28 新协议 revision 的 Agent Client 迁移指南（Client 端视角）

## 准确口径：协议升级 ≠ SDK 大版本升级

- MCP 新的协议 revision 是 **2026-07-28**；TypeScript SDK 新 major 是 **2.0.0**
- 升 SDK v2 只完成包结构和 API 迁移；官方 TypeScript Client 默认仍按旧协议运行
- 只有显式配置 `versionNegotiation`，Client 才会尝试 modern discovery，失败时回落到 legacy
- 迁移策略：不需要 Agent Loop 一夜换轨——先升级 SDK、保持旧 wire，再逐步打开新协议

## 业界为什么欢迎：可扩容、可路由、可审计

旧协议通过 initialize 建立生命周期，把不少上下文绑定到连接和 Mcp-Session-Id——对远程服务来说，一次工具调用变成需要维护协议会话的分布式系统问题。新 revision：
- 去掉初始化握手，服务端用 **server/discover** 描述能力
- 调用需要的客户端信息进入每次请求的 **_meta**
- 协议回到 **request-bound**：普通 HTTP 负载均衡、无状态实例、网关治理更自然

生产实现证据：GitHub 在远程 MCP Server 中移除初始化阶段 Redis 写入和后续 Redis 读取，用 Mcp-Method、Mcp-Name 等标准头替代 JSON body 深度解析；Cloudflare Agents SDK 0.20.x 接入双时代协商、MRTR、OAuth issuer-bound credentials，保留原 addMcpServer 调用方式。生态整体仍在迁移窗口：主力 SDK 已支持最终规范，部分框架正在跟进，不能推导所有 Server 都完成升级。

## 协议变化：状态没有消失，只是换了所有者

新协议删除的是**协议层的隐式 session，不是应用状态**。数据库查询、浏览器会话、长任务仍可跨多次调用存在——区别在于服务端返回**显式 handle**，Agent/编排器把 handle 放入下一次工具参数。状态归属变得可见，缓存隔离、审计、失败恢复更容易推理。

另三个变化：服务端能力从初始化结果迁到 server/discover；需要用户输入时返回 input_required（Client 收集答案后重发原调用）；list 结果可携带 ttlMs 和 cacheScope，变化通知通过 subscriptions/listen 建立。

## 架构适配：把时代差异关进 Host Adapter

稳定 Agent Client 五层：Agent Loop（何时调模型/工具）→ Tool Policy（权限/预算/副作用）→ **MCP Host Adapter**（统一 list/call/result 契约）→ Transport（HTTP/stdio）→ Model Adapter（隔离模型提供商）。协议协商、MRTR、缓存、OAuth、扩展注册都放在 Host Adapter 周围——Agent Loop 不读 protocol era，不维护 modern/legacy 两套分支，否则每次协议演进都穿透模型循环、工具选择与错误处理。

```js
const mcp = await DualEraMcpClient.connect({
  transport,
  versionNegotiation: { mode: "auto", prior },
  cachePartition: principalKey,
});
const tools = await mcp.listTools();
const answer = await agent.run({ prompt, tools, callTool: mcp.callTool });
```

ClientFactory 只创建官方 SDK v2 Client；ProtocolProfile 记录协商出的 era/revision/capabilities/extensions 供遥测与治理；业务代码不需要长期并存两套 SDK。

## MRTR：输入回路由 SDK 驱动，副作用由业务兜底

旧协议允许服务端在同一连接反向发起 elicitation/create；modern 改成 MRTR：工具调用返回 input_required（含待处理输入请求 + 不透明 requestState）→ Client 调用已有 elicitation handler 生成 inputResponses → 用新 JSON-RPC id 重发原调用。

适配层三条规则：
1. requestState 原样回传，上层不要解析
2. 输入轮数设上限（常见 4~6）
3. 协议重试、网络重试、业务重试分开计数

**最危险场景是写操作**：服务端可能已创建资源，只是响应在返回前断开。新 request id 仅表示新报文，不代表业务动作没执行。发消息、扣款、创建工单等工具应携带业务幂等键、操作回执或结果查询能力。

## HTTP 与 stdio 不同策略

- **HTTP**：用 auto，通常只多一次 server/discover 往返，适合小流量灰度
- **stdio**：官方 transport 自动探测时可能先拉起短命 sibling process 再启动正式 Server——每次调用都 spawn 的工具会加冷启动成本，还可能触发不希望出现的初始化副作用。实践：未知 stdio Server 留 legacy；已验证的 pin 2026-07-28；确实要自动探测时缓存 principal-bound prior，并在二进制路径/参数/版本/哈希变化时失效

## 开源脚手架（按层级选，不追求单一框架包办）

- 官方 TypeScript SDK v2：双时代 Client、MRTR、缓存 hint、协议时代查询
- 官方 codemod：`npx @modelcontextprotocol/codemod@latest v1-to-v2 .`
- MCP Conformance：进 CI 验证 legacy Server × dual Client、modern Server × dual Client、OAuth、private cache、断流
- Cloudflare Agents SDK：Workers / Durable Objects，现成封装 discovery、fallback、凭据持久化
- mcp-use：Agent/Client + create-mcp-use-app，快速搭建 MCP Apps
- FastMCP：v4 面向后台任务、无状态交互、企业鉴权一等支持（采用前核对 release）

## 灰度顺序

固定 legacy 基线（记录工具成功率/延迟/错误类型）→ 升级 SDK v2 保持旧 wire 确认无行为变化 → 引入 Host Adapter + protocol-era telemetry，HTTP 端点小流量 auto → MRTR/subscription/private cache/OAuth issuer 分别场景测试 → stdio 按端点选 legacy/pin/cached-auto → Tasks/Apps 扩展按 capability + 本地 policy 开启 → legacy 使用率降到阈值再删兼容路径。测试矩阵优先覆盖身份隔离、断流、非幂等写入、已启用扩展。

## 总结

MCP 2026-07-28 给 Agent 端的主要变化：协议状态从连接边界迁到请求边界。一句话迁移法：SDK v2 先保持 legacy 基线，Host Adapter 吸收双时代差异，再依据真实流量逐步打开 modern。收益：Agent Loop 保持稳定、网关获得标准治理字段、用户审批进入可暂停的输入回路、工具目录可安全缓存、长尾 Server 有迁移时间。
