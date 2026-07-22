---
title: Anthropic 官方生产级 Agent 最佳实践：12 个可复用的 MCP 设计模式
source_url: https://mp.weixin.qq.com/s/dd_yVuyLiO5avvivvFl5Zw]
publish_date: 2026-05-07
tags: [wechat, article, claude, agent, harness]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: c6fcd2357486785fbd08365000e8cfe040e1faefd409c29a732140ad3a51141c
---

### 第二组：交互语义（Interaction Semantics）
**4. 内联 UI 模式（Inline UI Pattern）**
问题：有些结果不应该被模型描述，而应该直接被用户看到。
典型场景：
- 监控 Dashboard、趋势图、搜索结果
- 审批表单、文件预览、状态面板
MCP Apps 允许工具返回一个**可交互界面**，客户端在聊天界面中直接渲染。
> "MCP Server 不只是后端能力提供者，也开始承担一部分产品界面职责。"
代价：Server 团队不能只按后端接口思维工作。要考虑组件版本、可访问性、视觉一致性和客户端兼容。
**5. 引导式输入模式（Elicited Input Pattern）**
问题：Agent 缺少结构化信息时（region、环境、项目ID等），如何处理？
三个选项：
1. 猜 → 有风险
2. 回到对话追问 → 打断流程
3. 让工具调用暂停，向用户请求结构化输入 → MCP Form Mode Elicitation
MCP Form Mode：Server 在工具调用中途返回表单 schema，Client 负责渲染，用户填写后再把控制权交回 Server。
适用场景：
- 缺少结构化参数
- 多个候选项需要用户选择
- 删除/支付/部署等高风险操作需要确认
- Server 明确知道还缺什么信息
代价：每一次 elicitation 都是一次 UX 设计。表单设计不好，用户会觉得 Agent 在审问自己。**不适合无人值守场景（headless Agent/batch workflow）。**
**6. 外部跳转交接模式（External Handoff Pattern）**
问题：有些信息根本不应该经过 MCP Client（OAuth、支付、银行卡、敏感凭证），怎么办？
MCP URL Mode Elicitation：Server 返回一个 URL，Client 打开浏览器或外部页面，用户在那里完成 OAuth、支付或敏感信息输入，流程结束后再回到 Server 继续执行。
区分：
- **Form Mode**：Server 可以合法接收和处理的结构化输入
- **URL Mode**：应该由第三方或外部系统处理的敏感流程
代价：用户会离开 Agent 界面。工程上必须设计好 **resume-after-redirect**，让用户回来后流程还能接上。
---
### 第三组：认证与凭证流（Auth and Credential Flow）
**7. 可发现认证模式（Discoverable Auth Pattern）**
问题：每个 MCP Server 都自己发明认证方式 → 接入成本高，客户端难以统一支持。
CIMD（Client ID Metadata Documents）：客户端可以通过标准元数据**发现认证方式**。客户端不需要猜这个 Server 怎么登录，而是读取 metadata，按标准流程启动 OAuth。
价值：把认证流程从「每家自定义」变成「客户端可发现」。
代价：Server 必须认真遵守标准 OAuth 行为：维护 metadata endpoint、redirect URI 校验、scope 设计、token 校验和跨客户端兼容。
**8. 凭证托管到 Vault 模式（Vault-Held Credentials Pattern）**
问题：token 放在工具参数、环境变量、临时配置里 → 生产系统危险。
方案：把凭证生命周期上移到**平台层**。
在 Claude Managed Agents 里，MCP OAuth credential 可以注册到 Vault。创建 session 时引用 vault ID，平台负责把合适的凭证注入到 MCP 连接中，并处理刷新、撤销和生命周期管理。
关键洞察：**MCP Server 不需要在每次工具调用里接收 token，也不需要自己实现完整的刷新、撤销和轮换逻辑。** 凭证管理从工具调用路径里抽离出来，变成平台能力。
代价：信任这个平台 Vault。它的安全性、可用性、审计能力和导出策略，都会成为生产架构的一部分。
---
### 第四组：上下文经济（Context Economy）
**9. 按需加载工具模式（On-Demand Tool Loading Pattern）**
问题：连接多个 MCP Server → 可能拥有几百个工具。全量加载 tool definitions = 在任务还没开始前就消耗大量上下文预算。
**Tool Search** 的做法：**延迟加载**。
- Agent 先通过搜索工具查找可能相关的工具
- 只把命中的工具定义加载进上下文
- 其余工具保持不可见
Anthropic 官方测试：**Tool Search 可以让 tool-definition tokens 减少 85% 以上**，同时保持较高的工具选择准确率。
代价：多一次搜索步骤，高度依赖工具描述质量。
> "Tool Search 不是替代工具设计，而是倒逼工具描述更像产品文案：准确、可检索、可区分。"
**10. 程序化工具调用模式（Programmatic Tool Calling Pattern）**
问题：工具返回的结果（大段JSON/几千行日志/trace树/多页搜索结果）不适合直接给模型看。
方案：在代码执行沙箱里处理工具结果。
- 循环调用工具
- 过滤数据、聚合字段、做中间计算
- 只把必要结果放进模型上下文
Anthropic 官方测试：这种方式在复杂多步流程里可以**减少约 37% 的 token 使用**。
与 On-Demand Tool Loading 形成完整组合：
- On-Demand Tool Loading → 减少「工具定义」进入上下文
- Programmatic Tool Calling → 减少「工具结果」进入上下文
代价：客户端需要代码沙箱，也需要能调试 Agent 写出来的中间代码。**对简单一次性工具调用可能过重，但对日志分析/数据处理/跨系统查询非常有价值。**
---
### 第五组：打包与分发（Packaging and Distribution）
**11. 插件打包模式（Plugin Bundle Pattern）**
问题：一个有用的 Agent 集成通常不只是一个 MCP Server，还包括 Skills、hooks、subagents、LSP server、项目约定和工作流说明。这些组件分散安装、分散升级 → 配置漂移和版本错配。
Claude Code Plugins：把 Skills、MCP servers、hooks、LSP servers、specialized subagents **统一放进一个插件分发**。
典型案例：**Cowork data plugin，包含 10 个 Skills 和 8 个 MCP servers**，连接 Snowflake、Databricks、BigQuery、Hex 等数据工具。
价值：减少安装摩擦，减少组件之间的版本错配。用户「一次安装，就得到完整能力包」。
代价：发布节奏被绑定。一个 Skill/Server/hook 更新都牵动整个插件版本。
**12. 服务器分发 Skills 模式（Server-Distributed Skills Pattern）**
问题：Agent 有了工具访问权，是否就真的会用？答案通常是否定的。
MCP Server 可以告诉 Agent 有哪些工具，但不告诉 Agent 在复杂业务里应该怎样安全、有效地组合这些工具。比如 Sentry MCP 可以暴露 issue/trace/release/alert，但排查线上错误、判断影响范围、生成修复建议 = 领域知识和操作手册。
**Server-Distributed Skills 方向：由 MCP Server 直接分发与自身能力匹配的 Skills。** 客户端连接 Server 时，不只获得工具，也获得使用这些工具的 playbook。
Anthropic 原文提到：Canva、Notion、Sentry 等已经在 Claude 中把 Skill 和 connector 配对展示。
趋势：**未来的 MCP Server 不只分发能力，还会分发使用能力的方法。** Agent 集成的竞争点会从「谁有工具」变成「谁能把工具、流程、经验和安全边界一起交付」。
---
## 结语
这些模式真正有价值的地方，不是告诉我们「MCP 很重要」，而是把生产级 Agent 集成中的工程问题拆开了：
- 连接在哪里运行
- 工具按什么粒度暴露
- 用户如何参与流程
- 凭证如何托管
- 上下文如何控制
- 能力如何打包分发
**生产级 Agent 不是多接几个工具，而是重新设计 Agent 与真实系统之间的连接层。**
> "随着更多客户端、Server、Skills 和协议扩展进入生态，这个交互面的价值会继续叠加。"
## 参考资源
- [1] Building agents that reach production systems with MCP: https://claude.com/blog/building-agents-that-reach-production-systems-with-mcp
- [2] Cloudflare MCP Server: https://github.com/cloudflare/mcp
- [3] MCP Apps: https://modelcontextprotocol.io/extensions/apps/overview
- [4] Form Mode elicitation: https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation
- [5] Client ID Metadata Documents: https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization
- [6] MCP OAuth credential: https://platform.claude.com/docs/en/managed-agents/vaults
- [7] Tool search tool: https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool
- [8] Programmatic tool calling: https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling
- [9] 12 MCP Patterns Behind Production Agents: https://generativeprogrammer.com/p/12-mcp-patterns-behind-production
- [10] Writing tools for agents: https://www.anthropic.com/engineering/writing-tools-for-agents