# MCP tool design: Practical approaches and tradeoffs

## Ch07.020 MCP tool design: Practical approaches and tradeoffs

> 📊 Level ⭐⭐ | 11.5KB | `entities/mcp-tool-design-tradeoffs-anthropic-2026.md`

# MCP tool design: Practical approaches and tradeoffs

> MCP tool design requires balancing expressiveness, safety, and discoverability. This article from AWS's blog covers practical patterns and tradeoffs in designing tools for Claude/MCP agents, addressing the core challenges of **bloat** (tool definitions consuming too much context) and **confusion** (poor tool choices leading to retries).

## 摘要

当 MCP（Model Context Protocol）工具表现不佳时，问题通常不在协议本身，而在工具设计。许多团队直接将现有 API 暴露给 Agent，期望 LLM 自行理解——这在简单场景下可行，但在复杂系统中经常导致调用失败、参数错误和重试消耗上下文。本文系统性地探讨了 6 种 MCP 工具设计策略，从简单的描述增强到完整的 Agent-as-Tool 架构，并通过一个 K-12 教育资源搜索的后端示例进行了对比验证。

## 核心挑战：Bloat 与 Confusion

MCP 工具设计面临两个核心问题：

1. **Bloat（膨胀）**：工具定义每次调用都加载到 LLM 的上下文中，无论工具是否被使用。多个连接的 MCP 服务器可能会在用户提出一个问题之前就消耗大量上下文。随着上下文填满，LLM 的推理能力会下降。
2. **Confusion（混淆）**：当推理能力下降，LLM 做出更差的选择——调用错误的工具、选择不正确的参数。后续重试进一步加剧膨胀。工具之间的语义相似性、太多选项和模糊的命名也会加剧混淆。

**关键洞察**：解决 bloat 和 confusion 是**上下文工程（context engineering）**问题——塑造 LLM 看到的内容以及何时看到，从而产生更好的结果。改善两者中的任何一个都是一项复杂的平衡行为。

## Key Design Dimensions

The article identifies several key dimensions in MCP tool design:

| Dimension | Spectrum | Tradeoff |
|-----------|----------|----------|
| **Tool granularity** | Fine-grained ↔ Coarse-grained | Fine-grained gives more control but increases planning overhead |
| **Parameter design** | Required ↔ Optional | Strict typing reduces errors but increases definition size |
| **Naming conventions** | Technical ↔ Natural language | Descriptive names help LLM understanding but add bloat |
| **Error handling** | Minimal ↔ Informative | Helpful errors guide retries but increase response size |

## 六种 MCP 工具设计策略详解

### V1: Raw Passthrough（原始透传）—— 反模式基线

将后端 API 直接暴露为 MCP 工具。工具定义包含 14 个参数，使用内部的字段名（如 `discipline`、`media_type`、`content_bucket`），一行文档字符串。LLM 完全不知道什么值有效——尝试输入 "quiz" 可能对应的是有效值 "Assessment"，"math" 可能字段期望的是 "Math"。每次错误选择都会触发重试，消耗更多上下文。

**成本真相**：V1 的基线 token 成本看起来最低，但 confusion 带来的重试 churn 使实际成本远高于表面。

### V2: Rich Descriptions（丰富描述）—— 最快见效

保持相同结构，零后端重构。文档字符串中列出每个字段的有效值和同义词映射。例如 `discipline` 显示 `Valid: Math, Science, Literacy/ELA…`，`media_type` 映射 `'quiz'/'test' → Assessment`。删除 3 个罕用参数，错误信息返回应添加哪些过滤器的指导。

**Tradeoff**：准确率立刻提升，但工具定义显著变大——每次调用都要支付这个成本，无论工具是否被使用。

### V3: Schema + Defaults（模式约束 + 默认值）—— 结构为王

重命名参数以匹配 LLM 的思维模式（`discipline` → `subject`，`content_bucket` → `resource_class`），通过 `Literal` 类型在 Schema 中直接约束有效值。设置合理的默认值（`language='en'`、`resource_class='Student Resource'`），将详细查询拆分到独立的 `get_resource_detail` 工具。

**优势**：Enum 在协议层面阻止了错误值，默认值意味着 LLM 只需要指定变化的部分。工具定义比 V2 更小——名称和 enum 完成了之前冗长描述的职责。

### V4: Lazy Loading with Restructuring（延迟加载）—— 精益基线

将 enum 和详细描述移到独立的工具中。搜索工具只保留简短的提示描述（如 `Subject area, e.g. 'Math', 'Science'`），新增 `get_taxonomy` 工具按需返回字段有效值和自然语言映射。

**亮点**：对于模糊查询，LLM 先调用 `get_taxonomy` 再搜索；对于明确查询，可以跳过 taxonomy 直接搜索。所有前置交互都不携带 taxonomy 的上下文成本。在多工具、复杂 schema 的环境中，这种节省会显著累积。Anthropic 报告这种方案可节省高达 85% 的 token。

### V5: LLM Introspection（LLM 内省）—— 服务器端智能

增加一个由 Amazon Nova 2 Lite（或任选模型）驱动的 `introspect_query` 工具。它接收用户的自然语言问题，返回推荐的过滤值及其选择理由。例如 "TEKS-aligned content for kids working on dividing in middle school" → 推荐 `subject: Math`、`grades 6-8`、`state_standard: TX-TEKS`。

**Tradeoff**：为每次查询支付推理成本，但结果一致性显著提升——无论客户端使用什么模型，服务器端的 LLM 内省都使用经过测试的提示工程。

### V6: Agent-as-Tool（Agent 即工具）—— 最高控制

整个 MCP 服务器后端由一个 Strands Agents 代理驱动，对外暴露一个简单接口：`agentic_search_content(question: str)`。客户端 LLM 只需描述需求，服务器端的 Agent 处理 taxonomy 查询、搜索、详情检索和响应格式化，使用自己的内部工具（客户端 LLM 不可见）。

**终极 Tradeoff**：最高基础设施成本 + 最高延迟，换取完全可控的行为一致性。对话历史跨调用持久化，支持自然的追问。切换客户端模型不影响结果质量。

## 策略对比总览

| 版本 | 方法 | 核心 Tradeoff |
|------|------|---------------|
| V2 | 丰富描述 | 准确率上升，定义变大 |
| V3 | Schema + 默认值 | 准确率上升，定义更小 |
| V4 | 重构 + 懒加载 | 基线最精简，增加额外轮次 |
| V5 | 服务器端内省 | 处理歧义，需支付推理成本 |
| V6 | Agent 即工具 | 直接控制，最高基础设施成本 |

## 深度分析

### 上下文工程：Agent 系统设计的核心约束

MCP 工具设计的根本矛盾在于：**LLM 的上下文窗口是有限且昂贵的资源，但工具系统需要在其中承载尽可能多的语义信息**。AWS 这篇博客的核心贡献不是提出了某个具体的优化技巧，而是将"上下文工程"提升为 Agent 系统设计的显式维度。这与此前 [Hermes Agent](../ch03/090-hermes-agent.html) 和 [Agent Harness Context Management](../ch05/039-agent-harness.html) 中强调的"上下文管理是 Agent 生产力的关键瓶颈"一脉相承。

### 从"API 透传"到"Agent 封装"的演进路径

六种策略实际上构成了一条清晰的演进路径：V1→V2→V3 是工具表面（tool surface）优化，V4 引入系统架构变化，V5→V6 是推理转移。这条路径反映出 Agent 工具设计正在经历与微服务架构类似的演进——从"直接暴露 API"到"通过网关层封装复杂性"。Agent-as-Tool（V6）本质上就是 Agent 系统的 BFF（Backend for Frontend）模式。

### Skills 与 MCP 工具设计的交汇点

Anthropic 的 Skills 系统和 AWS 的 AgentCore Gateway 都体现了同样的懒加载理念——只有在相关时才将工具定义加载到上下文。这与 garden-skills（[Conardli Skills 7K Star Open Source Agent 2026](ch07/036-skills-7k-star.html)）项目中"按需加载 Skill"的设计哲学一致。Skills 生态系统不仅是提示词的集合，更是 MCP 工具设计的客户端实现形式。

### 安全性：被忽视的设计维度

文章未重点讨论安全性，但 V5（LLM 内省）和 V6（Agent-as-Tool）天然提供了额外的安全层——服务器端可以验证和过滤客户端的工具调用意图，防止恶意或异常请求直接访问后端 API。这在企业级部署中尤为关键。

## 实践启示

1. **从 V2 开始，不要从 V1 开始**：即使是最简单的最优化——改进文档字符串、提供有效值列表、添加指导性错误信息——也能显著提升准确率。这是零后端重构的"最低果实"。

2. **用 Enum 替代 Description**：对于有限值字段，使用 Schema 层面的 `Literal`/`Enum` 约束比在描述中列出有效值更可靠、更精简。Enum 在协议层面阻止错误，无需 LLM 自行"猜测"映射关系。

3. **将罕用信息移出基线上下文**：高复杂度、低使用频率的字段定义应该通过独立的发现工具延迟加载，而不是塞在每次调用都加载的工具定义中。这是减少 bloat 最有效的手段。

4. **工具参数控制在 8 个以内**：AWS Prescriptive Guidance 推荐的参数上限，超过此数量应拆分工具或使用结构化输入。

5. **为多客户端场景选择 V5/V6**：如果您的 MCP 服务器会被不同配置的客户端（不同模型、不同上下文窗口）调用，服务器端推理层能保证一致的行为体验，值得为之支付推理成本。

6. **错误信息是工具设计的一部分**：返回"no results"让 LLM 只能继续猜测；返回"search requires 2 or more terms in query"则精确指导下一次尝试。好的错误信息减少重试轮次，间接降低 bloat。

## 相关实体

- [ConardLi Skills 开源项目](ch07/036-skills-7k-star.html)
- [Hermes Agent 上手](../ch03/090-hermes-agent.html)
- [Agent Harness Context Management](../ch05/039-agent-harness.html)
- [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- [Claude Code /checkup 功能](../ch03/075-claude-code.html)
- [MCP 协议生态系统](https://github.com/QianJinGuo/wiki/blob/main/concepts/mcp-protocol-ecosystem.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/mcp-tool-design-practical-approaches-and-tradeoffs.md)

---

