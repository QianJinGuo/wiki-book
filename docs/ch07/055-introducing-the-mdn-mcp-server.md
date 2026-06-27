# Introducing the MDN MCP server

## Ch07.055 Introducing the MDN MCP server

> 📊 Level ⭐⭐ | 4.6KB | `entities/introducing-mdn-mcp-server-2026.md`

# Introducing the MDN MCP server

> Source: [MDN Blog 原文](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/introducing-mdn-mcp-server-2026.md)

## 三个独有贡献（不应合并到现有 entity）

1. **首批主流 Web 标准权威机构采纳 MCP** — Mozilla 旗下 MDN（Web 文档领域的 canonical reference）推出官方 MCP server，标志着 MCP 从 Anthropic 协议升级为主流 Web 标准协议。之前 MCP 主要在 AWS / Anthropic / Claude Code / Kiro 等厂商生态内使用，MDN 接入是首次主流开放标准机构的背书。
2. **完整文档集成的实际工程方案** — MDN 通过 MCP 提供 HTML / CSS / JavaScript / Web API 全量文档，包含 13000+ 页面。agent 可以 fetch_webpages 抓取任意 MDN 页面，readMDN 读取完整内容。这是 MCP Resources + Tools 标准接口的具体落地示例。
3. **AI agent 实际使用场景的展示** — 客户端在 Cursor 中真实接入后，演示了 5 大场景：检查 API 兼容性、获取 MDN 文章内容、查询 HTML 元素属性、访问 CSS reference、查询 Web API。配 Cursor MCP setup 的完整配置截图（JSON），可直接复用。

## MDN MCP server 的核心能力

**1. Resources（资源暴露）**
- `https://mdn-mcp.example.com/{path}` 格式：暴露任意 MDN 文档 URL 为 MCP resource
- agent 可以 resources/read 获取完整文档内容

**2. Tools（工具接口）**
- `searchMDN` — 关键词搜索 MDN 全量文档
- `readMDN` — 按 URL 读取完整 MDN 文章
- `fetch_webpages` — 抓取任意 MDN URL

**3. 客户端接入方式**
- Cursor：MCP configuration JSON（`mcpServers` 配置块）
- 通用 MCP client：JSON-RPC over stdio / HTTP

## 与现有 MCP 实体的差异化

| 维度 | MDN MCP server | AWS Bedrock AgentCore MCP | Claude Code MCP server |
|------|----------------|---------------------------|------------------------|
| 提供方 | Mozilla（Web 标准权威） | AWS（云厂商） | Anthropic（模型厂商） |
| 数据源 | MDN 全量 Web 文档 | AWS 服务文档 + 自定义 | Anthropic 工具 + 自定义 |
| 主要场景 | Web 开发文档查询 | 云资源管理 | Claude Code agent 工具 |
| 接入门槛 | 低（免费 + 公开） | 中（AWS 账户） | 中（Claude Code 集成） |
| 协议成熟度 | 标准 MCP（2025-03 spec） | AWS 扩展 MCP | 标准 MCP |

**MDN 的独特定位**：Web 标准 + 开放文档 + 零成本接入。其他 MCP server 都是商业或厂商生态的扩展。

## 实践启示

- **AI agent 文档集成的标准模式**：未来所有大型开放文档集（Wikipedia / arXiv / Stack Overflow / GitHub Docs）都应通过 MCP 暴露。MDN 的 5 大场景演示了文档 → MCP resource → agent tool → 用户查询的标准集成模式。
- **Web 开发 agent 的基础设施升级**：之前需要手动 fetch + parse + index 的 Web 文档查询，现在可以通过 MCP 一行代码完成。Cursor + MDN MCP = 实时准确的 Web API 兼容性检查。
- **MCP 生态的健康信号**：MDN 接入表明 MCP 已经成为 AI agent 工具调用事实标准（类似 LSP 在 IDE 中的地位），不再是 Anthropic 一家之言。

## 相关主题

- [Anthropic MCP 协议回顾](../ch07-044-anthropic-mcp-重新定义-tool-search-代码编排/) — MCP 协议本身的设计
- [AWS Bedrock AgentCore MCP](../ch04-202-doris-mcp-on-agentcore-runtime-vpc原生mcp部署模式/) — 商业 MCP server
- [Claude Code MCP server](../ch07-024-claude-code-mcp-server/) — Claude Code 工具系统
- [Hermes Agent 工具系统架构](../ch03-086-hermes-agent-工具系统架构分析/) — agent 工具调用一般化框架

## References

See [MDN Blog 原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/introducing-mdn-mcp-server-2026.md)

---

