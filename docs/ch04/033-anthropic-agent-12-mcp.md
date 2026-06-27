# Anthropic 官方生产级 Agent 最佳实践：12 个可复用的 MCP 设计模式

## Ch04.033 Anthropic 官方生产级 Agent 最佳实践：12 个可复用的 MCP 设计模式

> 📊 Level ⭐⭐ | 28.8KB | `entities/anthropic-12-mcp-production-patterns.md`

# Anthropic 官方生产级 Agent 最佳实践：12 个可复用的 MCP 设计模式

- URL: https://mp.weixin.qq.com/s/dd_yVuyLiO5avvivvFl5Zw
- Author: 技术博客（整理自 Anthropic 官方文档 + Claude Code 源码）
- Date: 2026-05
- Length: 10380 chars
- SHA256: 6e90d73100b599239bdade1b39208c1d6a2dc972cfea5fe1560a5593b15af58d
- Score: Value=8 × Confidence=8 = 64
- Original: [Claude Code源码泄露分析](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-source-leak-lifecycle-analysis.md) 同系列

## 微信正文
在 Claude Code 源代码泄露事件之后，我们从源码里整理出了 12 种 Agentic Harness 模式。后来又结合 Anthropic 官方的 Agent Skills 构建指南，继续拆解出 14 种 Skill 编写模式。这次再往前走一步，问题就变得更现实了：当 Agent 真正进入生产系统，它到底应该怎么连接那些真实的业务工具、权限系统和数据源？
Anthropic 官方最近那篇关于 MCP 的文章《 Building agents that reach production systems with MCP 》，讨论的正是这个问题。文章比较了直接 API 调用、CLI 和 MCP 的差异，并解释为什么生产级 Agent 越来越倾向于使用 MCP。
**生产级 Agent 的难点，不是「能不能调用工具」，而是「能不能安全、稳定、低成本地连接真实系统」。**

## 背景：MCP 的定位
MCP = Model Context Protocol，不只是协议，而是**面向 Agent 的产品交互面**。
> "好的 MCP Server，不是 API 的翻译层，而是 Agent 面向任务的产品接口。"

## 五组12模式
---

### 第一组：工具交互面（Tool Surface）
**1. 远程优先服务器模式（Remote-First Server Pattern）**
问题：MCP Server 应该运行在哪里？
| 形态 | 适用场景 |
|------|----------|
| 本地 MCP Server（stdio） | 桌面应用、IDE Agent、Claude Code、命令行场景 |
| 远程 MCP Server | 生产环境（浏览器/移动端/云端/托管平台） |
远程优先好处：

- 一个 Server 服务多个客户端
- 认证流程跨环境复用
- Web/移动端/云端 Agent 都能访问
- Server 可独立部署、扩展、监控和审计
判断原则：**本地 MCP Server 适合开发者环境，远程 MCP Server 才是生产分发形态。**
**2. 按意图组织工具模式（Intent-Grouped Tools Pattern）**
问题：工具应该按什么粒度暴露？
错误做法：把每个 API endpoint 1:1 包装成 tool。
```python

# 错误：暴露底层 API
get_thread, parse_messages, create_issue, link_attachment

# Agent 需要自己拼接4个底层动作
# 正确：按用户意图封装
create_issue_from_thread  # 内部处理编排、ID归一化、附件关联、错误重试
```
适合场景：API面不算太大、用户任务相对明确的系统（Linear、Slack、Notion、Sentry）
代价：不能只导出 schema，必须设计工具——名称、参数结构、返回结果、错误处理都要围绕 Agent 任务体验重新组织。
**3. 薄交互面模式（Thin Surface Pattern）**
问题：底层 API 面太大（几百~几千个操作），按意图封装也失控，怎么办？
思路：不要暴露很多工具，只暴露**少量高能力工具**。
典型组合：

- `search`：让 Agent 搜索可用 API 或能力
- `execute`：让 Agent 写短脚本，由服务端在沙箱里执行
典型案例：**Cloudflare MCP Server，2个工具覆盖约 2500 个 endpoint，工具定义只需约 1000 tokens。**
背后逻辑：把巨大 API 面藏在 Server 后面，Agent 通过搜索找到需要的能力，再用短代码完成调用和组合。
代价：必须有可靠的沙箱、资源限制、超时策略、权限边界和审计机制。
适用场景：API规模巨大、任务形态不固定。**不适合本来就能被清晰意图封装的小系统。**
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

## 深度分析
### 一、模式结构的全局视角
这12个模式并非孤立存在，它们构成了一条完整的 Agent-to-System 连接链。**第一组（工具交互面）**解决的是「连接形态」问题——Server 跑在哪、工具怎么封装、API 面多大；**第二组（交互语义）**解决的是「用户体验」问题——结果怎么呈现、输入怎么获取、敏感流程怎么交接；**第三组（认证与凭证）**解决的是「安全边界」问题；**第四组（上下文经济）**解决的是「成本效率」问题；**第五组（打包分发）**解决的是「交付形态」问题。这五组形成一个从底层基础设施到顶层产品交付的完整分层架构。
理解这个分层架构的价值在于：团队在设计 MCP 集成时，不会把所有模式一股脑套用上去。例如一个内部 B2B SaaS 工具（API 面不大但任务固定），重点应该在第一组和第三组；第二组的高成本 UX 设计反而是累赘。反之，对外 SaaS 产品（用户类型多样、任务不固定），第二组和第五组就成了核心投入。

### 二、Tool Surface 设计的三层决策
第一组揭示了一个关键洞察：工具设计本质上是**三层决策**。
第一层：**架构层**——Server 跑本地还是远程（模式1）。这不是技术偏好问题，而是分发策略问题。所有本地 stdio Server 都是给开发者个人使用的；一旦进入多用户、多租户、多环境的生产场景，远程 Server 是唯一合理选择。
第二层：**粒度层**——工具按什么粒度暴露（模式2 vs 模式3）。这是一个**API 面复杂度 vs 意图封装成本**的博弈。模式2（按意图封装）适合 API 面在几十到百这个量级的系统，每增加一个工具都有边际收益；模式3（薄交互面）适合 API 面在千百量级的系统，此时已经没有人力对每个 endpoint 做意图封装，只能用搜索+执行来代替。Cloudflare 的案例极具代表性：2500 个 endpoint 只有 2 个工具。这意味着整个工具设计的思路发生了根本转变——从「设计工具」变成「设计搜索空间」。
第三层：**描述层**——工具描述怎么写。Tool Search 模式9的代价中特别提到「高度依赖工具描述质量」，这不是附注，而是核心约束。在薄交互面模式下，工具描述就是产品界面。描述写得不清楚，Agent 就搜不到；描述写得太模糊，Agent 会搜错。这个认识直接影响了模式3的工具定义成本——不是说薄交互面省钱，而是把设计成本从「写代码」转移到了「写文案」。

### 三、交互语义模式的深层逻辑
第二组的三个模式（4/5/6）揭示了一个有意思的规律：MCP Server 正在从「能力提供者」向「产品界面」迁移。
模式4（内联 UI）直接说 MCP Apps 允许工具返回可交互界面，Server 团队要开始考虑前端组件工作。这在传统 API 设计里是不可想象的——后端 API 返回 UI 的片段？但在 Agent 交互里，Agent 的输出是文本，用户的阅读习惯是看界面而不是读描述，所以有些结果直接渲染出来效果更好。
模式5（引导式输入）和模式6（外部跳转）则是对「Agent 认知不完整」这个根本问题的工程回应。传统的工具调用模型假设 Agent 要么知道所有参数，要么自己推理出来。但生产场景里 Agent 常常不知道自己不知道什么——不知道 region、不知道项目 ID、不知道要看哪个环境。传统解决方案是让 Agent 猜（有风险）或停下来问（打断流程），而 MCP 的 Form/URL Mode 给出了第三种路径：在调用过程中暂停，让用户补充结构化信息，然后继续。
这里有个微妙的设计权衡：**Form Mode 适合 Server 明确知道缺什么信息的场景，URL Mode 适合 Server 根本不应该接触这些信息的场景**。前者是「我知道你不知道，你可以告诉我」；后者是「这些信息本来就不该经过我，你直接去那边处理」。把这个区分清楚，才能设计好交互语义。

### 四、上下文经济的核心矛盾
模式9和10组成了一个完整的上下文优化框架：**减少工具定义进入上下文**（模式9）+**减少工具结果进入上下文**（模式10）。两者叠加，理论上可以把一个复杂多步 Agent 任务的上下文消耗降到单工具调用的量级。
但这两个模式的代价容易被低估。模式9的代价是「多一次搜索步骤，高度依赖工具描述质量」——这意味着工具描述不能随便写，要写成可检索的关键词密集型文案，和产品说明书的写法完全不同。模式10的代价是「客户端需要代码沙箱」，这是架构层面的基础设施投入，不是每个团队都有条件做。
这里有个值得关注的趋势：模式10（程序化工具调用）和模式3（薄交互面）本质上共享同一个思路——**把复杂的 API 组合能力交给 Agent 写的代码，而不是预先封装好的工具**。只不过薄交互面是把整个 API 面暴露给搜索+代码，而程序化工具调用是把部分工具调用的结果处理交给代码。两者都是把「封装责任」从 Server 端转移到 Client 端/Agent 端。这是一个架构层面的范式转移。

### 五、第五组模式的产品化意义
模式11和12的组合揭示了一个深层洞察：**MCP Server 的竞争维度在升级**。
在第一代 MCP 集成里，壁垒是「有没有 Server」。一个工具对接一个系统，有就是有，没有就是没有。现在 Claude Code 的 Plugins 模式说明壁垒已经变成了「有没有完整的 Skill 包」。Sentry 暴露 4 个工具（issue/trace/release/alert），但真正让 Sentry 在生产环境中发挥价值的，是那套排查线上错误的 playbook——什么时候看 trace，怎么判断影响范围，如何生成修复建议，这些都不是工具能表达的，是 Skill 的职责。
这意味着未来 MCP Server 的竞争焦点从「连接能力」转向「使用指南」。Server 开发者不只需要实现 API 封装，还需要编写与自身能力配套的 Skill/Playbook，并通过 Server-Distributed Skills 模式分发出去。这是一个从基础设施层面向应用层面延伸的价值链扩展。

## Related entities
- [Anthropic 官方生产级 Agent 最佳实践：12 个可复用的 MCP 设计模式](/ch04-058-anthropic-官方生产级-agent-最佳实践-12-个可复用的-mcp-设计模式//)
- [Anthropic 官方生产级 Agent 最佳实践：12 个可复用的 MCP 设计模式](/ch07-060-anthropic-官方生产级-agent-最佳实践-12-个可复用的-mcp-设计模式//)

## 实践启示
### 1. 从模式1开始，先想清楚分发形态
在任何 MCP 集成项目启动前，先回答一个问题：**这个 Server 最终是给谁用的**。如果是团队内部、个人开发者桌面场景，stdio 本地 Server 开发速度快，维护成本低。但一旦面向多用户生产环境，从第一天就要按远程 Server 的架构来设计——认证、部署、监控、审计一个都不能少。本地转远程的迁移成本非常高，在 API 设计阶段就要规划好。

### 2. 工具粒度决策先用「意图探测」方法
在决定用模式2（按意图封装）还是模式3（薄交互面）之前，可以用一个小测试：**让一个不了解系统的 Agent 看你设计的工具列表，看它能不能在5分钟内说清楚能用这些工具完成什么任务**。如果 Agent 看了觉得是罗列 API endpoint，说明粒度太细；如果 Agent 看了觉得工具太少、不知道从哪下手，说明粒度太粗。这个测试不需要写代码，只需要拿现有的工具列表做一次人工模拟。

### 3. Form Mode 设计优先考虑「不打断」体验
做引导式输入（模式5）时，一个关键原则是：**尽量不让用户感觉被打断**。具体做法是：表单要有上下文暗示（预填充已知信息、给候选值而不是让用户自己填）、要有进度感知（告诉用户这是第几个问题、共多少个）、要有跳过或修改的选项。如果 Form Mode 让用户感觉在「被审问」，体验质量就不合格。更好的做法是预判 Agent 可能缺什么信息，在工具描述里提前要求必填，而不是让 Agent 调用到一半才发现缺了参数。

### 4. 凭证托管是生产级集成的门槛
如果你的 MCP 集成面向生产环境，凭证管理方案必须在第一版就设计好，不能后期再加。模式8（Vault-Held Credentials）描述的「平台层托管」是理想状态，但如果团队没有条件建立 Vault，至少要做到：**不在工具参数里传递 token、不把 token 写死在环境变量里、有 token 刷新和撤销机制**。凭证安全是生产级 Agent 集成的底线，很多团队在 POC 阶段忽略了这一点，到生产环境才暴露问题，修复成本极高。

### 5. 工具描述要同时满足人和机器
由于模式9（Tool Search）的核心依赖是工具描述的可检索性，工具描述的写法要从「给人读」切换到「同时给人和模型读」。一个合格的工具描述应该包含：**功能名称（动词短语）、输入参数说明（类型+约束+示例）、输出结果说明（成功返回什么、失败返回什么）、适用场景举例、不适用场景说明**。特别是「不适用场景」——这个信息在传统 API 文档里很少出现，但对 Agent 正确选择工具非常关键。

### 6. 插件打包要从「能力包」视角设计
如果你的团队在规划 Claude Code Plugins 或类似的打包分发方案，不要把插件简单理解成「多个 MCP Server 的集合」。插件应该从用户的「任务目标」出发设计，而不是从系统的「能力列表」出发。例如一个「数据库查询插件」，不应该包含 Postgres MCP + MySQL MCP + Redis MCP，而应该包含「数据分析技能包」或「故障排查技能包」——每个包对应一个具体用户目标，内部可能涉及多个数据源的 MCP Server 和对应的 Skills。插件是对用户承诺的「一次安装，解决一类问题」，而不是技术层面的「打包压缩」。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ai-poc-why-fail-to-production.md)

### 7. Server-Distributed Skills 是下一阶段投入重点
如果你的团队已经有稳定的 MCP Server 在运行，下一步提升竞争力的方向是**为 Server 编写配套 Skill/Playbook**。具体做法是：盘点 Agent 在使用这个 Server 时最常遇到的错误场景、最复杂的任务流程、最需要人工判断的节点，然后编写成结构化的操作指南。这些指南不应该只是文档，而应该封装成可执行的 Skill——有触发条件、有操作步骤、有验证方式。这是 MCP Server 下一阶段从「工具」到「产品」升级的核心路径。
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/anthropic-12-mcp-production-patterns.md)

## 相关实体

- MOC

---

