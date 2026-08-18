# How we built an MCP bridge: AgentCore-hosted AI agent 访问本地 MCP 工具

## Ch04.781 How we built an MCP bridge: AgentCore-hosted AI agent 访问本地 MCP 工具

> 📊 Level ⭐⭐ | 2.8KB | `entities/how-we-built-an-mcp-bridge-to-give-our-agentcore-hosted-ai-agent-access-to-local-mcp-tools.md`

# How we built an MCP bridge: 云上 Agent 访问本地 MCP 工具的桥接架构

## 问题：远程 MCP Client ↔ 本地 MCP Server 的协议缺口

MCP（Model Context Protocol）支持两种传输机制：**stdio**（同机本地进程间通信）和 **streamable HTTP**（远程 server/client 通信）。但存在一个缺失场景：**MCP server 在本地、MCP client 在远端**——云上部署的 AI Agent 需要访问用户笔记本电脑上的本地文件/工具（Excel 表格等）。这正是 Claude Cowork（云 Agent 调用本地工具）的产品模式，但本文给出的是完全自托管在 AWS 上的实现，用自己的模型 + 自定义工具 server。

## 桥接方案：WebSocket 隧道 + Native Messaging

实现方式是把 MCP 消息通过 **WebSocket 隧道 + 浏览器 native messaging** 桥接：Agent 部署在 Amazon Bedrock AgentCore 上，MCP server 跑在用户本地机器，二者之间用隧道转发 MCP 消息。云上 Agent 可以直接读取用户机器上的文件（演示场景：汇总本地 Excel 工作簿）。作者团队内部已构建了生产级金融 AI 助手，一年内处理 41,000+ 对话。完整源码开源在 GitHub（aws-samples/sample-mcp-bridge-agentcore）。

## 生产硬化

文章在 What's Next 部分讨论额外的生产加固措施（认证、隧道安全、断线恢复等）。这是"MCP 传输层缺口"的工程解法——MCP 标准本身没有定义 remote-client → local-server 方向的传输，需要应用层自行桥接。

## 与 Wiki 现有知识的关联

- 与 [Smartsheet 远程 MCP Server](../ch07/001-mcp.html) 互补：Smartsheet 是 local-agent → remote-server，本文是 remote-agent → local-server，构成 MCP 双向桥接全景
- Claude Cowork 生态：[Claude Managed Agents MCP Tunnels](ch04/813-claude-managed-agents.html) 是企业版托管隧道，本文是自托管实现
- MCP 协议背景见 [MCP 协议生态](https://github.com/QianJinGuo/wiki/blob/main/concepts/mcp-protocol-ecosystem.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/how-we-built-an-mcp-bridge-to-give-our-agentcore-hosted-ai-agent-access-to-local-mcp-tools.md)

---

