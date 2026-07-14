# Claude Code Skills / MCP / Rules 源码分析

## Ch07.006 Claude Code Skills / MCP / Rules 源码分析

> 📊 Level ⭐⭐ | 23.4KB | `entities/claude-code-skills-mcp-rules-source-analysis.md`

## 核心命题

**Rules、MCP、Skills 的本质差异，不在功能层面，而在信息注入 API 请求的位置。** 同一套 `tool_use` 协议之上，三者分别占据 `messages`（被动注入）、`tools[]` + `system`（标准化工具调用）、`messages`（提示词注入）三个不同插槽。理解这一点，就能拨开文档和博客中的概念迷雾。

## Rules：项目级行为规范的被动注入机制

### 什么是 Rules

Rules 就是 `CLAUDE.md` 文件（及 `.claude/rules/*.md` 条件规则文件），本质上是**用自然语言写的指令文本**，告诉模型"在这个项目中应该遵循什么规范"。

### 文件发现与加载

Claude Code 从多个位置按优先级加载 Rules（对应源码 `getMemoryFiles` 函数）：从项目根到 CWD 逐层处理，每层内部按 `CLAUDE.md` → `.claude/CLAUDE.md` → `.claude/rules/*.md` → `CLAUDE.local.md` 顺序收集，后加载的覆盖先加载的。单个 `CLAUDE.md` 建议不超过 **40,000 字符**，超出会触发警告。

条件规则（`.claude/rules/*.md`）支持 frontmatter 中的 `paths` 字段指定生效范围，例如只在前端组件路径下生效，实现**按路径按需注入**。

### 注入位置：messages，而非 system

Rules 内容通过 `prependUserContext()` 注入到 **messages 最前面**，包裹在 `<system-reminder>` 标签中，以 `role: "user"` + `isMeta: true` 形式存在。`isMeta` 是客户端 UI 标记（消息仍完整发送给 API，但不在终端展示）。注入时还带强制指令头：> "Codebase and user instructions are shown below. Be sure to adhere to these instructions. IMPORTANT: These instructions OVERRIDE any default behavior..."

**核心洞察：Rules 不走 tool_use 协议**——它既不是工具，也不需要模型主动调用。它是被动注入到每次 API 调用的上下文中，模型在推理时自然会"看到"并遵循这些规则。

子目录 Rules 通过 `nested_memory` attachment **按需动态加载**：当模型在对话中访问某个子目录文件时，Claude Code 检查该子目录是否有 CLAUDE.md，有则动态注入，实现 Rules 的惰性加载。

## MCP：标准化工具协议的 RPC 调用

### 什么是 MCP

MCP（Model Context Protocol）是一个标准化协议，让 Claude Code 能通过 **真正的 RPC 调用** 访问外部服务提供的工具。它是 `tool_use` 最直接的应用——模型触发后，客户端向外部 MCP Server 进程发起 JSON-RPC 调用，拿到真实结果。

### MCP 在 API 请求中占据两个位置

MCP 不只是注册在 `tools[]` 里，它在 **`system` 中也有一席之地**。

**位置一：`tools[]` — 工具定义**

每个 MCP 工具通过 `toolToAPISchema()` 转换为 API 格式，命名遵循 `mcp__<serverName>__<toolName>` 模式。这部分和内置工具的注册方式完全一致，模型通过工具描述决定何时调用——**模型本身无法区分内置工具和 MCP 工具**。

**位置二：`system` — Server 级 instructions**

`getMcpInstructions()` 将所有已连接 Server 的 `instructions` 拼接进 system 的**动态区域**（位于缓存边界标记之后）。MCP Server 可通过 `initialize` 响应的 `instructions` 字段向模型传达**整个 Server 级别的使用指南**，如"优先使用 search 而非 list"、"日期参数必须用 ISO 格式"。`tools[].description` 描述的是单工具说明书，system 中的 instructions 描述的是整体使用手册。

### 执行流程：真正的函数调用

```
模型输出 tool_use: { name: "mcp__github__create_issue", input: {...} }
→ Claude Code 识别 mcp__ 前缀，路由到对应 MCP Client
→ MCP Client 发送 JSON-RPC 请求到 MCP Server 进程
→ MCP Server 执行实际操作（如调用 GitHub API）
→ 返回真实结果 → tool_result.content = MCP Server 的真实输出
→ 模型读取结果，继续推理
```

**MCP 是名副其实的"远程过程调用"**，`tool_result` 里装的是外部世界的真实数据。

### MCP 真正的不可替代场景

理解了源码后，一个反直觉的结论浮出水面：**很多场景下一条 Bash 就够了**。调 `mcp__github__list_issues` 和执行 `gh issue list` 拿到的结果没有本质区别。MCP 真正不可替代的场景是：

1. **持久化连接和状态管理**：Bash 每次是新进程没有状态。数据库连接池、WebSocket 长连接、跨调用共享认证 session，MCP Server 作为常驻进程可以做到
2. **复杂操作的原子封装**：把 5 步 Bash 命令封装成一次 MCP 调用，减少模型拼长命令出错的概率
3. **权限隔离和安全约束**：Bash "什么都能干"，MCP Server 可以限制模型只执行预定义操作

**MCP 的价值不在于"能调用外部系统"（Bash 也能），而在于"以更安全、更可靠的方式调用外部系统"。**

## Skills：可复用提示词的注入机制

### 什么是 Skills

Skills 是可复用的 Markdown 提示词文件（`SKILL.md`），定义结构化的工作指令。它同样通过 `tool_use` 触发，但执行逻辑与 MCP 截然不同。

### 列表注入与 token 预算

模型通过 `skill_listing` attachment 知道有哪些 Skill 可用。Skill 列表有**严格的 token 预算**：仅占上下文窗口的 **1%**（默认 8000 字符），每个 Skill 描述最多 250 字符。Skill 工具的 `description` 中包含一条**强制触发指令**：> "When a skill matches the user's request, this is a BLOCKING REQUIREMENT: invoke the relevant Skill tool BEFORE generating any other response about the task"

### 执行流程：提示词注入，不是函数调用

当模型调用 Skill 工具时，默认走 **Inline 模式**：

```
模型输出 tool_use: { name: "Skill", input: { skill: "commit", args: "" } }
→ Claude Code 读取本地 SKILL.md 提示词文本
→ 将提示词内容包装为 isMeta: true 的 user 消息，注入到对话历史中
→ tool_result 仅返回一个标签："Launching skill: commit"
→ 下一轮 API 调用时，对话历史中已包含完整的 Skill 指令
→ 模型读到指令后，按步骤调用工具（Read、Edit、Bash 等）执行任务
```

**核心洞察：Skills 是"提示词注入"机制，不是函数调用。** `tool_use` 只是触发器，真正的"能力"来自被注入的 Markdown 指令文本。模型读到指令后自行理解、自行执行。

### Inline 模式 vs Fork 模式

Skills 有两种执行模式，**Inline 是默认模式**，Fork 需要 Skill 配置中显式设置 `context: 'fork'`。Fork 的隔离性意味着 Skill 内部的文件缓存、权限拒绝记录、abort 控制都是独立的，不会污染主对话上下文。

## 三者核心对比

| 维度 | Rules | MCP | Skills |
|------|-------|-----|--------|
| **本质** | 被动注入的指令文本 | 标准化 RPC 协议 | 可复用提示词注入 |
| **触发方式** | 每次 API 自动注入 | 模型主动调用 tool_use | 模型主动调用 tool_use |
| **API 位置** | `messages` | `tools[]` + `system` | `messages`（via tool_use） |
| **执行主体** | 模型自行遵循 | MCP Server 真实执行 | 模型自行执行已有工具 |
| **执行隔离** | 无 | 无 | Fork 模式下有独立上下文 |
| **适用场景** | 项目级编码规范 | 外部系统 RPC 调用 | 结构化多步骤工作流 |

## 回答三个常见困惑

**Q1：Rules 和 Skills 都支持按需引入，区别在哪？**

从源码看，Skills 执行后注入的就是一段 Markdown 提示词，和手动把 Rules 文本贴进对话框对模型来说没有本质区别——都是 messages 里的一段 `role: "user"` 文本。

真正的区别只有两点：
1. **触发方式**：Rules 每次 API 调用自动注入，Skills 需要模型判断后主动调用 `tool_use`（或用户手动 `/skill-name` 触发）
2. **执行隔离**：Skills 可配置 Fork 上下文运行，拥有独立的缓存、权限跟踪和 abort 控制

但现实中第一点反而成了 Skills 的痛点——Skill 描述只有最多 250 字符，经常不够模型做出正确判断，导致最终还是要靠手动触发。

**Q2：MCP 和 LLM 内置 Tools 的区别在哪？**

**对模型来说没有区别。** `tools[]` 里格式一样，调用方式一样。区别纯粹在 Agent 侧的执行路由：内置 Tools 本地执行，MCP Tools 转发到外部 Server。

**Q3：Skills 的标准化流程是"代码层面的流程化"吗？**

**不是。** 源码里没有任何代码逻辑来控制 Skill 的执行步骤。所谓"标准化工作流"，就是一段写得比较结构化的 Markdown。Skill 的质量 = 提示词的质量，Skill 的"流程保障" = 模型的指令遵循率。写一个好的 Skill 和写一段好的 Rules，需要的能力是一样的——**都是提示词工程**。

## 实际使用建议

**什么时候用 Rules：**

- 项目级的编码规范、技术栈约定、代码风格要求
- 文本短（几百字以内），每次注入不心疼 token
- 需要"始终生效"的指令，不依赖模型判断是否需要

**什么时候用 Skills：**

- 指令文本较长（几百行级别），不适合每次注入
- 有明确的触发时机（用户主动 `/commit`、`/review-pr`）
- 需要执行隔离（Fork 模式让任务在独立上下文中运行，不污染主对话）

**什么时候用 MCP：**

- 需要持久化连接/状态管理的场景（数据库连接池、认证 session）
- 复杂多步操作需要原子封装，减少模型拼命令出错的概率
- 需要权限隔离，不想给模型一个万能的 Bash

**现实提醒：不要迷信 Skills 的自动触发。** Skill 列表的 token 预算只有上下文的 1%，描述不够精准或用户意图不够明确时，模型大概率不会自动触发。把核心 Skill 的快捷命令告诉团队成员让他们手动调用，比指望模型自动识别靠谱得多。

## 相关实体

- [Claude Code 架构解析：从 Skill 调用到 Prompt Cache](../ch03/076-claude-code.html)
- [Anthropic MCP 最新博客：Token 成本解法 + Tool Search](ch07/016-anthropic-mcp.html)
- [Harness Engineering：AI 从"聪明"到"可靠"的第三代工程范式](../ch05/069-harness-engineering.html)
- [Claude Code 12 个可复用的 Agentic Harness 设计模式](../ch03/068-claude-code-agent.html)
- [Claude Code Governance：软规则与项目级行为规范](../ch03/076-claude-code.html)
- [Agent Harness Context Management：Working Set 策略](../ch05/039-agent-harness.html)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/claude-code-complete-guide.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/anthropic-ecosystem.md)
## 深度分析

**1. "注入位置"是理解 Rules/MCP/Skills 本质差异的第一性原理**

源码分析揭示的底层逻辑远比表面功能描述更清晰：Rules、MCP、Skills 的核心区别不在于"能做什么"（功能层面），而在于"信息在 API 请求中占据什么位置"（架构层面）。Rules 通过 `prependUserContext()` 注入 messages（被动，每次 API 调用自动携带）；MCP 同时占据 `tools[]` 和 `system` 两个位置（主动调用，Server 级指南在 system 动态区）；Skills 通过 `tool_use` 触发后在 Inline 模式下注入 messages（主动调用但执行是提示词注入）。这三个位置（messages、tools[]、system）的组合差异，导致了完全不同的工程特性：Rules 的信息稳定但无执行隔离，Skills 的信息可复用但依赖模型判断，MCP 的信息执行真实但需要常驻进程维护。这一框架比任何功能描述都更能指导技术选型决策。

**2. Skill 列表 1% token 预算的设计缺陷是自动触发机制失效的根源**

Skill 列表仅占上下文窗口 1%（默认 8000 字符），每个 Skill 描述上限 250 字符——这一设计约束在实践中造成了严重的信息瓶颈。当企业拥有 20+ 个 Skill 时，仅 Skill 列表描述的 token 消耗就可能超过 5000 字符，占用了本应用于实际对话的上下文空间。雪上加霜的是，250 字符的描述上限根本无法充分表达一个 Skill 的触发条件和使用场景——模型仅凭 250 字符很难做出正确的"是否需要调用"判断。作者指出的"不要迷信自动触发，把快捷命令告诉团队成员"是非常务实的建议。这揭示了一个重要的设计教训：为了让 AI Agent 自动协调多个 Skill 而设计的" Skill 列表 + 强制触发指令"机制，本质上是在用极其有限的信息带宽传递复杂的决策信号，成功率必然有限。

**3. MCP 的真正护城河是"持久化状态 + 权限隔离"，而非"Bash 也能做的事"**

源码分析后的反直觉结论"Bash 也能做到"（调 `gh issue list` 和 `mcp__github__list_issues` 没有本质区别）揭示了 MCP 营销叙事与实际价值的错位。真正只有 MCP 能做到 Bash 做不了的事：①持久化连接和状态管理（数据库连接池、WebSocket 长连接、跨调用共享 session）；②复杂多步原子封装（5+ 步骤的操作如果全用 Bash 实现，模型需要自己拼装命令字符串，出错概率随步骤数指数增长）；③权限约束（给 AI Agent 一个万能 Bash 等于给了一把万能钥匙，而 MCP Server 可以限制 AI 只能执行预定义操作集合）。企业引入 MCP 的决策应该聚焦在这三个真正有差异化的场景上，而非为了"MCP 而 MCP"。如果一个外部系统已经有成熟的 CLI 工具（`gh`、`kubectl`、`psql`），让模型直接用 Bash 调用往往更简单直接。

**4. Skills 的本质是"更结构化的 Rules + Fork 隔离机制"，而非"代码化的工作流"**

作者通过源码分析澄清了一个常见误解：Skills 的"标准化流程"或"工作流自动化"本质上是文字游戏。Skill 的执行逻辑中，没有任何代码层面的 if-else、循环控制或步骤状态机——只有一段被注入到对话历史的 Markdown 文本，模型读到后按自己的理解执行。Skill 的质量完全等同于提示词工程的质量；Skill 的"流程保障"等同于模型的指令遵循率（这意味着换用更弱的模型，流程执行结果可能完全崩溃）。然而，Fork 模式提供了 Rules 所没有的工程价值：独立的文件缓存（不会污染主对话的上下文）、独立的权限跟踪和 abort 控制（长流程任务崩溃后不会影响主对话状态）。对于需要长时间运行的多步骤任务，Fork 模式的隔离性是有实际工程价值的设计。

**5. Skills 的可发现性和可分发机制是其相对于 Rules 的核心战略优势**

虽然作者指出"手动触发 Skills"和"手动引用 Rules"效果几乎相同，但 Skills 有一个 Rules 不具备的本质优势：**Skills 是被组织管理的可发现、可分发知识单元**。Rules 文件路径是私人知识（只有知道文件路径才能引用），而 Skills 注册在系统里，可以通过 `/skills` 命令浏览，可以打包成插件发布给团队成员。这意味着当一个团队需要标准化某项复杂工作流程（如代码审查、CHANGELOG 生成、依赖升级）时，Skill 是更合适的载体：用户只需记住 `/review-pr` 这个快捷命令，不需要知道背后引用了哪些规则文件，也不需要知道这些文件的准确路径。这对 Skills 在团队协作场景中的推广至关重要——让不懂 AI Agent 内部实现的同事也能通过简单命令使用标准化工作流程，是 Skills 的核心产品价值。

## 实践启示

**1. 优先使用 Rules 管理项目不变性约束，250 字符以内的精准描述才考虑 Skills 自动触发**

项目级编码规范、技术栈约定、安全规则这些"始终生效的约束"应该用 Rules（CLAUDE.md）管理，因为它们不需要模型主动判断是否需要——每次 API 调用自动注入，100% 生效。250 字符的 Skill 描述只够表达非常明确、可模式匹配的触发条件（如用户说"帮我提交代码"→ 触发 `/commit`）。对于触发条件模糊或需要多步推理才能判断是否应该触发的场景，手动 `/skill-name` 调用是更可靠的选择。不要为了"看起来更自动化"而强推 Skills 自动触发——实际上手动调用往往更快、更可靠。

**2. 为复杂多步骤任务配置 Fork 模式，利用独立上下文隔离防止主对话污染**

当 Skill 涉及复杂的多步骤操作（如完整的 PR 审查、依赖升级流程、多文件重构），应该显式配置 `context: 'fork'` 启用 Fork 模式。Fork 模式的独立上下文意味着：执行过程中所有文件修改、工具调用记录都在独立副本中运行，不会污染主对话的文件缓存和上下文窗口；独立的 abort 控制让任务失败时不会连带终止主对话；独立的权限跟踪让敏感操作的影响范围可控。对于需要长时间运行的复杂任务（预计 10+ 步骤），Fork 模式的隔离价值远超 Inline 模式的简单性。建议将 Fork 模式作为复杂 Skill 的默认选项，而非需要时才考虑的配置。

**3. 引入 MCP 前先问三个问题：是否需要持久化状态、是否需要原子封装、是否需要权限约束**

如果三个问题的答案都是"否"（只是简单的 read 查询或单步操作），应该优先让模型直接用 Bash 调用现有 CLI 工具（`gh`、`curl`、`psql` 等）。MCP 的引入应该遵循最小化原则：每增加一个 MCP Server，就增加一个需要维护的常驻进程、一层 JSON-RPC 通信和一个潜在的单点故障。只有在"持久化状态管理"（数据库连接池、WebSocket）、"复杂原子操作"（跨多个 API 的多步骤流程）或"权限隔离"（不想给 Agent 万能 Bash）这三个场景下，MCP 的额外工程复杂度才是合理的投资。建议企业建立 MCP 引入的评审流程，需要明确说明为什么 Bash 或现有 CLI 工具无法满足需求。

**4. 构建企业 Skill 体系时，将"可发现性"设计置于"自动触发"设计之上**

企业推广 Skills 时，最大的误解是"AI 会自动调用正确的 Skill"——实际上 Skill 的可发现性（用户主动找到 `/skills` 命令浏览、了解可用能力）比自动触发可靠得多。正确的建设思路是：① 为每个 Skill 设计清晰的 250 字符描述，准确描述触发场景和预期行为，但不能依赖描述承载完整的工作流程说明；② 在团队内部推广 `/skills` 命令的使用习惯，让成员知道有哪些 Skill 可用；③ 将 Skill 的快捷命令作为团队知识沉淀的标准化入口（类似于内部 CLI 工具的 `help` 命令）。不要假设用户会"被 AI 自动服务"——主动发现和手动调用才是当前阶段更可靠的使用模式。

**5. Skill 的质量完全等同于提示词质量，投入在提升 Skill 编写能力上的回报远高于投入在自动化框架上**

作者的核心结论"Skill 的质量 = 提示词的质量"应该成为企业 Skill 建设的核心指导思想。这意味着与其研究如何让 Skill 自动触发、如何实现 Skill 嵌套调用等工程机制，不如专注于提升 Skill 提示词本身的编写能力。一个高质量的 Skill 提示词需要：精准的任务分解（每个 Step 边界清晰，避免模型在步骤之间迷路）、明确的输出期望（告诉模型每个步骤完成后应该输出什么）、有效的错误处理（告诉模型遇到常见错误时应该如何修正）。这些本质上都是"提示词工程"能力，而非"编程"能力。企业在培养 AI Agent 开发团队时，应该将提示词工程作为与代码能力同等重要的核心技能，而非将其视为"调参"之类的次要工作。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-skills-mcp-rules-source-analysis.md)

---

