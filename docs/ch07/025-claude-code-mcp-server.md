# Claude Code MCP Server

## Ch07.025 Claude Code MCP Server

> 📊 Level ⭐⭐ | 10.4KB | `entities/claude-code-mcp-server.md`

## 核心洞察
**MCP（Model Context Protocol）是 Anthropic 提出的开放协议，让 Claude Code 能调用外部服务提供的工具。它是 `tool_use` 最直接的应用——模型触发后，客户端向外部 MCP Server 进程发起 RPC 调用，拿到真实结果。**
MCP 在 Claude Code 中占据两个 API 位置：`tools[]` 注册工具 + `system` 动态区域注入 Server 级 instructions。这是 Claude Code 四个被分析框架（Codex、OpenCode、Gemini-CLI）中**唯一对 MCP 有完整原生实现**的。

## MCP 实现机制
### 配置与连接
MCP 服务器定义在 `~/.claude.json`（user scope）或项目根目录的 `.mcp.json`（project scope）中。连接建立后，Claude Code 通过 MCP SDK 与 Server 完成 `initialize` 握手，获取工具列表和 Server 返回的 **instructions 字段**。

### API 两个位置
**位置一：`tools[]` — 工具定义**
每个 MCP 工具通过 `toolToAPISchema()` 转换为 `tools[]` 格式，命名遵循 `mcp__<serverName>__<toolName>` 模式：
```javascript
async function toolToAPISchema(tool, options) {
    return {
        name: tool.name,        // 如 "mcp__github__create_issue"
        description: await tool.prompt(),  // 工具描述 → tools[].description
        input_schema: tool.inputJSONSchema
    };
}
```
**位置二：`system` — Server 级 instructions**
在系统提示词构建过程中，`getMcpInstructions()` 将所有已连接 Server 的 instructions 拼接进 system 的**动态区域**：
```javascript
function getMcpInstructions(mcpClients) {
    const clientsWithInstructions = mcpClients
        .filter(c => c.type === "connected")
        .filter(c => c.instructions);
    if (clientsWithInstructions.length === 0) return null;
    return `# MCP Server Instructions\n\n${clientsWithInstructions.map(c => `## ${c.name}\n${c.instructions}`).join("\n\n")}`;
}
```
`tools[].description` 描述单工具行为，system 中的 instructions 描述整个 Server 的使用指南。

### 执行流程：真正的 RPC 调用
```
模型输出 tool_use: { name: "mcp__github__create_issue", input: {...} }
↓ Claude Code 识别 mcp__ 前缀，路由到对应 MCP Client
↓ MCP Client 发送 JSON-RPC 请求到 MCP Server 进程
↓ MCP Server 执行实际操作（如调用 GitHub API）
↓ 返回真实结果
↓ tool_result.content = MCP Server 的真实输出
↓ 模型读取结果，继续推理
```
**MCP 是名副其实的"远程过程调用"**。`tool_result` 里装的是**外部世界的真实数据**。

## 深度分析
### MCP 祛魅：很多场景下一条 Bash 就够了
理解源码实现后，一个自然的问题浮现：模型已经有 Bash 工具了，为什么还需要 MCP？
对模型来说，调 `mcp__github__list_issues` 和执行 `gh issue list` 拿到的结果没有本质区别——都是 `tool_result` 里的一段文本。但 MCP 多了一个 Server 进程、一层 JSON-RPC 通信、一套配置和维护成本。
实际使用中，查 GitHub 用 `gh`，读数据库用 `psql`，调 API 用 `curl`，大量 MCP Server 做的事一条命令就能替代。

### MCP 真正不可替代的场景
1. **持久化连接和状态管理**：Bash 每次是新进程没有状态。数据库连接池、WebSocket 长连接、跨调用共享认证 session，MCP Server 作为常驻进程可以做到。
2. **复杂操作的原子封装**：把 5 步 Bash 命令封装成一次 MCP 调用，减少模型拼长命令出错的概率。
3. **权限隔离和安全约束**：Bash "什么都能干"，MCP Server 可以限制模型只执行预定义操作。
**MCP 的价值不在于"能调用外部系统"（Bash 也能），而在于"以更安全、更可靠的方式调用外部系统"。**

### MCP Server 的 instructions 字段
MCP Server 可以通过 `initialize` 响应的 `instructions` 字段，向模型传达**整个 Server 级别的使用指南**，比如"优先使用 search 工具而非 list 工具"、"所有日期参数必须用 ISO 格式"等。这些指导信息是全局性的，不是针对单个工具的。
当 feature gate `isMcpInstructionsDeltaEnabled()` 开启时，MCP instructions 会改走 attachment 注入而非 system，以避免 Server 连接/断开破坏 prompt 缓存。

## 实践启示
1. **先问：Bash 能不能搞定？**
   如果只是简单的 CLI 操作（`gh`、`curl`、`psql`），直接让模型用 Bash，别折腾 MCP。MCP 引入的是额外的维护负担。
2. **持久化状态场景优先考虑 MCP**
   需要数据库连接池、认证 session 复用、WebSocket 长连接时，MCP Server 作为常驻进程的优势就显现了。
3. **用 instructions 字段提供 Server 级使用指南**
   大多数 MCP Server 作者没写这个可选字段。作为 Server 开发者，写好 instructions 能让模型更准确地使用你的工具集。
4. **权限隔离是企业级 MCP 的核心价值**
   在团队场景中，MCP Server 可以限制模型只执行预定义操作，比给模型一个万能 Bash 安全得多。
5. **MCP 工具和内置工具对模型没有区别**
   `tools[]` 里格式完全一致，模型无法区分。区别只在 Agent 侧的执行路由：内置工具本地执行，MCP 工具转发到外部 Server。
> 参考源码：claude-code-source-code v2.1.88（泄漏源码） https://github.com/anthropics/claude-code
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-skills-mcp-rules-source-analysis.md)

## 相关实体
- [Claude Code 源码解析：Skills/MCP/Rules 底层机制对比](ch07/006-claude-code-skills-mcp-rules.md)
- [两万字详解Claude Code源码核心机制](../ch03/075-claude-code.md)
- [Claude Code 源码深度解析（13 核心机制）](../ch03/075-claude-code.md)
- [Anthropic 官方生产级 Agent 最佳实践：12 个可复用的 MCP 设计模式](../ch01/833-anthropic.md)
- [AgentCore Runtime 部署 Apache Doris MCP Server](../ch11/160-apache-doris-mcp-server-quick-suite-ai.md)
- [从Vibe Coding到Agentic Engineering：重构后台开发全流程 — 腾讯技术工程](../ch04/201-tencent-vibe-coding-to-agentic-engineering-backend.md)
- [Boris Cherny — 从 IDE 到 Agent 控制台](../ch03/045-agent.md)
- [读完 Claude Code 源码才发现 Skills/MCP/Rules 的区别远没有你想的那么大](ch07/006-claude-code-skills-mcp-rules.md)
- [AI Agent 探索之路：从 Task-Driven 到 Goal-Driven](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-agent-exploration-path.md)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](../ch01/456-claude-code-harness-deep-understanding.md)
- [Anthropic 官方生产级 Agent 最佳实践：12 个可复用的 MCP 设计模式](../ch01/833-anthropic.md)
- [IMClaw：通过微信/飞书操控ClaudeCode/Codex/GeminiCLI/Pi Agent蜂群](../ch03/075-claude-code.md)
- [Anthropic 官方技能最佳实践：14 个可复用的 Agent Skills 设计模式](../ch04/375-agent-skills.md)
- [Claude Code 源码核心机制详解](../ch03/075-claude-code.md)
- [Claude Code 源码拆解：从启动到多 Agent 扩展层](../ch03/075-claude-code.md)
- [Agent 上下文窗口管理对比](https://github.com/QianJinGuo/wiki/blob/main/entities/context-window-management.md)
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](../ch03/045-agent.md)
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](../ch03/045-agent.md)
- [Claude 发布官方报告，承认存在 3 处质量退化问题](../ch01/1022-claude.md)

- [Claude Code 开发负责人：为何放弃 RAG 而选择 Agentic Search](../ch03/075-claude-code.md)
- [Harness如何支撑Agent在生产环境稳定运行？](../ch05/009-harness.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xero-announces-integration-with-anthropics-claude.md)

- [AI Agent 工程师能力地图](../ch04/030-ai-agent.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/claude-code-complete-guide.md)

---

