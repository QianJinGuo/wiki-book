# CLI系列④·选型CLI、MCP还是API？

## Ch07.062 CLI系列④·选型CLI、MCP还是API？

> 📊 Level ⭐⭐ | 5.0KB | `entities/cli-mcp-sdk-agent-tool-selection.md`

# CLI系列④·选型CLI、MCP还是API？
CLI、MCP Server、SDK、Skills、Code Execution——这五个词看起来都在说"让 Agent 用工具"，但它们根本不在同一个抽象层级。
**核心问题：** 它应不应该有 CLI？还是 MCP Server 就够？或者它根本不该让 Agent 直接接触？

## 二、对人友好和对 Agent 友好？
Scalekit 2026 年基准测试（75 次，同一 Agent 执行同一组 GitHub 任务）：

## 相关实体
- [Cli Mcp Skill Architecture Decision Vibecoder](../ch04/262-skill.html)
- [Aliyun Agentrun 2Line Integration](../ch04/397-agentrun.html)
- [Production Ai Agents Mcp Cli Skills Stack Ayi](../ch04/147-ai-agent.html)
- [Pi Mono Github](../ch01/762-pi-mono-github.html)
- [Integrating Aws Api Mcp Server With Amazon Quick Suite Using Amazon Bedrock Agen](../ch11/152-amazon-bedrock.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/cli-mcp-sdk-agent-tool-selection.md)

- [crawler vs opencli doubao](../ch03/029-crawler-vs-opencli-doubao.html)

## 深度分析

**MCP Server 的性能问题根源是 schema bloat 而非 MCP 协议本身。** Scalekit 基准测试显示 MCP Server Token 消耗是裸 CLI 的 32 倍，但根因并非 MCP 协议有缺陷，而是所有 43 个工具的定义被全量注入 context。Code Execution 通过只暴露 `search()` + `execute()` 两个工具实现了 98.7% 的 token 降幅（150K → 2K），证明**按需暴露工具定义是解决 schema bloat 的关键** 。

**CLI 和 MCP 不是二选一——它们覆盖不同对象（人类 vs Agent）。** GitHub 的双覆盖策略（工具层 + 遥测检测 CLAUDECODE）和飞书的"原生 Agent Native"设计哲学表明，CLI 为人类提供可枚举的子命令交互，MCP Server 为 Agent 提供协议化的工具调用接口。两者可以共存，且往往需要共存 。

**Code Execution 本质上是通过 token 压缩实现大规模 API 集成的方案。** Cloudflare 的案例将 2,500+ API 端点压缩为 2 个工具定义（`search()` + `execute()`），将工具定义从 1,000+ tokens 压缩到固定开销。这揭示了一个重要规律：**Agent 工具设计的瓶颈不是能力上限，而是 context 容量**，按需暴露是所有高效方案的核心策略 。

**五问决策树提供了一个结构化的工具选型框架。** 从"Host 能调本地工具吗"到"这是高频杂活吗"，五问覆盖了工具选型的关键维度：执行环境可用性、服务提供形态、Token 成本敏感性、批量/多步需求、使用频率。这比凭感觉选择更能保证决策质量 。

**七项自查标准反映了优秀 Agent Native CLI 的设计要求。** 子命令可枚举（≤3层）、`--json` 全量子命令支持、OAuth/token 内置不暴露到 LLM 上下文、内建 Skills 文档、客户端遥测检测、按需 schema 暴露、官方 benchmark 数据 —— 这七项构成了评估 CLI 是否适合 Agent 使用的检查清单 。

## 实践启示

**当你的 API 端点超过 100 个时，优先考虑 Code Execution 模式而非 MCP Server。** 按需暴露（search + execute）的 token 效率远优于全量 schema 注入，是大规模工具集的必选方案 。

**在决定工具形态之前，先用五问决策树评估**：Host 环境能力 → 服务 CLI 可用性 → Token 成本敏感度 → 批量多步需求 → 使用频率。这能避免过早选择不合适的工具形态 。

**设计 CLI 时将 `--json` 全量子命令支持作为硬性要求。** 这是 Agent 能可靠解析 CLI 输出的前提。gh 和 lark-cli 在这方面的设计值得参考，而 Salesforce sf 的 schema 不一致问题是反面教材 。

**将 Skills 文档作为工具的必备配套而非可选附件。** Anthropic 的 Skills 概念解决了"什么时候该用哪个工具"的问题，这是让 Agent 正确选择工具而非仅能调用工具的关键差距 。

**如果你的场景 Token 成本敏感且需要批量/多步操作，选择 CLI + Skills 或 Code Execution，而非 MCP Server。** MCP Server 适合低敏感度的探索性任务，不适合重度生产使用 。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/cli-mcp-sdk-agent-tool-selection.md)

---

