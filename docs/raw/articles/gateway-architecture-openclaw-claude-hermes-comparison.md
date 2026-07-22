---
title: AI Agent 架构设计（八）：Gateway 架构设计（OpenClaw、Claude Code、Hermes Agent 对比）
source_url: https://mp.weixin.qq.com/s/7EKnLSF7oM7u5sqc_0FKTg
publish_date: 2026-05-07
tags: [wechat, article, claude, agent, llm, openclaw]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: 0c8a855d4ca375646f4b269ef3d864d09c7fcbbe5a0ea50db5b9573d526f836a
---
# AI Agent 架构设计（八）：Gateway 架构设计（OpenClaw、Claude Code、Hermes Agent 对比）
> 作者：AllenTang（公众号「架构师带你玩转AI」），2026-04-20。
> AI Agent 架构设计系列第（八）篇。Gateway 设计哲学决定了 Agent 是工具还是员工。
## 核心论点
**Gateway 的设计哲学决定了 Agent 的本质：**
- 被动响应工具 vs 主动运行的数字员工
- 三框架给出了完全不同的答案
## Three-Way 对比
| 维度 | OpenClaw | Claude Code | Hermes Agent |
|------|----------|-------------|--------------|
| Gateway 定位 | 核心产品/操作系统 | 没有传统 Gateway → 事后补充远程层 | 轻量桥接层，核心是 AIAgent 执行循环 |
| 运行模式 | 永远在线（VPS 部署） | 本地 CLI 生命周期绑定终端 | VPS 部署永远在线 |
| 架构复杂度 | 重，神经中枢 | 无原生 → 三机制补充 | 薄，适配器层 |
| 多 Agent | 单进程多 Agent（bindings 路由） | 单 Agent | 单 Gateway = 单 Agent |
| 会话管理 | session key 层级结构 | 无原生 | 统一 session key |
| 平台适配 | Channel Bridge 50+ 渠道 | 无 → Channels（MCP 协议） | 18 平台适配器 |
| 主动触发 | Heartbeat + Cron | 无 | 无 |
| 控制面 | Gateway 配置决定路由 | CLI | AIAgent |
| 默认安全 | 默认开放（历史教训：13.5 万暴露实例） | 本地绑定 | fail-closed |
| 独特能力 | 心跳/定时任务/多 Agent 调度 | Remote Control / Dispatch / Channels | ACP 编辑器延伸（VS Code 上下文聚合） |
| 代价 | 配置复杂/安全暴露面大 | 本地依赖，关机即停 | 单 Agent 边界，多 Agent 需多实例 |
## OpenClaw Gateway 架构
Gateway = 长期运行 Node.js 进程，监听 18789 端口（WebSocket + HTTP）。
消息处理流水线：
```
外部消息 → Channel Bridge（50+ 渠道适配器）
    → Session Resolution（dmScope 规则确定 session key）
    → Command Queue（串行化，防止工具竞争）
    → Agent Runtime（LLM 推理 + 工具执行）
    → 结果流回原渠道
```
路由由 Gateway 配置决定（非 LLM 决定）→ 确定性、可预测、人完全控制。
**bindings 多 Agent 调度：**
```yaml
bindings:
  - { match: { channel: "slack", teamId: "T123" }, agentId: "work" }
  - { match: { channel: "telegram", peer: { kind: "group" } }, agentId: "community" }
  - { match: { channel: "whatsapp" }, agentId: "personal" }
```
**session key 数据模型：** `agent:main:channel:peer` 层级结构，天然实现上下文隔离。
**心跳（Heartbeat）**：默认 30 分钟触发，Agent 读取 HEARTBEAT.md 自主决定行动
**Cron**：精确定时任务，每次在新 session 执行
## Claude Code Gateway 演进
**本质：** CLI 工具，不是守护进程。Agent 生命周期 = 终端 session 生命周期。
**2026 Q1 补充三种远程控制机制：**
1. **Remote Control**：加密桥接到远程设备，但本地机器+终端必须保持开启
2. **Dispatch**：从同步对话→异步任务工作者，通过 API/手机 App 发任务，不等人盯
3. **Channels**：MCP 协议接入 Telegram/Discord 等消息平台
**共同局限：** 都依赖本地机器在线。关机即停。
## Hermes Gateway 架构
**设计优先级颠倒：** AIAgent 执行循环是核心，Gateway 是可选的接入方式。无 Gateway 仍然完整。
消息路径：
```
平台消息 → Platform Adapter（归一化格式）
    → 授权检查 → 解析 session key → 创建 AIAgent 实例
    → AIAgent.run_conversation()
    → 结果推回原平台
```
三层职责不重叠：适配器（格式转换）→ 核心层（鉴权+路由）→ AIAgent（执行）。
**18 个平台适配器：** Telegram/Discord/Slack/WhatsApp/Signal/Email/WeChat/DingTalk 等，加平台只需加适配器。
**ACP 编辑器延伸：** VS Code 通过 ACP 注册 MCP 服务器，将打开文件/光标位置/选中代码实时传给 Agent。Gateway 从"消息桥接层"变成"上下文聚合层"。
**代价：** 单 Gateway 实例只服务一个 Agent。多 Agent = 多实例。
## 三种核心取舍
1. **Gateway 是核心还是入口**：重→集中/配置复杂/能力强；轻→分散/独立/易测试
2. **永远在线 vs 按需启动**：在线→运营成本+安全暴露面；按需→失去主动性
3. **默认开放 vs 默认拒绝**：OpenClaw 默认开放（13.5 万暴露实例教训）vs Hermes fail-closed