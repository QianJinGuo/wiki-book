# Microsoft Agent Framework Tools 总览：4 类工具 + Provider 矩阵 + Tool Approval

## Ch07.062 Microsoft Agent Framework Tools 总览：4 类工具 + Provider 矩阵 + Tool Approval

> 📊 Level ⭐⭐⭐ | 26.6KB | `entities/microsoft-agent-framework-tools-overview-provider-matrix.md`

# Microsoft Agent Framework Tools 总览

## 核心定位

> "**工具不是'插件列表'，而是 Agent 对外的能力契约**"

**在 Agent Framework 里，Tool 是模型与外部世界之间的稳定接口**：
- 一次 `tool_call` 对应一次**结构化入参**
- 一次**可观测的副作用**（或只读查询）
- **可被中间件拦截的执行路径**

## 相关实体
- [Microsoft Agent Framework Structured Output](https://github.com/QianJinGuo/wiki/blob/main/entities/microsoft-agent-framework-structured-output.md)
- [Microsoft Agent Framework Python Zizhi](https://github.com/QianJinGuo/wiki/blob/main/entities/microsoft-agent-framework-python-zizhi.md)
- [800行代码实现 Open Claw 的 Tool消息总线子Agent管理架构](https://github.com/QianJinGuo/wiki/blob/main/entities/800行代码实现-open-claw-的-tool消息总线子agent管理架构.md)
- [Open Claw Tool Bus Subagent Architecture](https://github.com/QianJinGuo/wiki/blob/main/entities/open-claw-tool-bus-subagent-architecture.md)
- [Ai Tool Poisoning Exposes A Major Flaw In Enterprise Agent Security](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-tool-poisoning-exposes-a-major-flaw-in-enterprise-agent-security.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/microsoft-agent-framework-tools-overview-provider-matrix.md)

## 4 类工具（按"谁执行、谁托管"划分）

### 1. Function Tools（应用代码）

**开发者用 `@tool` / `FunctionTool` 暴露的本地函数**，由框架的 function-invoking chat client 在**应用进程内调度**。

**特点**：
- **可移植性最好**
- **最适合接业务逻辑与细粒度权限**
- **入参由模型根据 JSON Schema 生成** — **必须按不可信输入校验**（见 Agent 篇 Safety）
- **支持 `approval_mode="always_require"` 等人机协同**（见下文 Tool Approval）

### 2. Hosted Tools（Provider 托管）

**由 OpenAI / Azure OpenAI Responses 或 Foundry 等运行时托管执行**：

| 工具 | 作用 |
|---|---|
| **Code Interpreter** | 沙箱内执行代码 |
| **File Search** | 对已上传向量库/文件检索 |
| **Web Search** | 联网检索（视 Provider 而定） |
| **Image Generation** | 托管文生图（Foundry / Responses） |
| **Shell** (`get_shell_tool`) | OpenAI Responses 托管 Shell（**与 Copilot CLI 内置 Shell 不是同一套**） |

**关键特点**：
- **不经过你的 Python 函数体**
- **计费、配额、数据驻留都跟随 Provider**
- **Chat Completion 客户端往往不支持完整 Hosted 能力集**

### 3. MCP Tools（Model Context Protocol）

| 形态 | 说明 |
|---|---|
| **Hosted MCP** | 由 Provider 运行时拉起/调用 MCP Server |
| **Local MCP** | 应用侧连接 stdio / 自定义 Host 上的 MCP Server |

**价值主张**：
- **MCP 适合把已有工具生态（数据库、SaaS、内部平台）以标准协议接到 Agent**
- **不必每个集成写一个薄封装函数**
- **只要底层 client 支持 function calling，Local MCP 通常可与其他 Function Tools 混用**

### 4. Foundry 扩展工具（项目级连接）

**通过 `FoundryChatClient` 挂载、在 Foundry 项目里配置连接的工具**：

| 工具 | 状态 |
|---|---|
| **Foundry Toolboxes** | 命名、版本化的托管工具包 |
| **Bing Grounding / Bing Custom Search** | 联网/域内检索 |
| **Azure AI Search** | 经 Foundry Connection 查询索引 |
| **SharePoint / Microsoft Fabric** | 企业内容/数据智能体 |
| **Memory Search** | Foundry 托管记忆库检索 |
| **Computer Use / Browser Automation** | 桌面/浏览器自动化（Playwright） |
| **Agent-to-Agent (A2A)** | 将远程 A2A Agent 暴露为工具 |

**注意**：部分为 **preview / experimental**，首次使用会抛 `ExperimentalWarning`。

**重要边界**：
- **FoundryAgent**（远端已定义的智能体）vs **FoundryChatClient**（本地 client 组工具）能力边界**不同**
- **许多工具只能在后者路径下由框架动态挂载**
- **前者需在 Foundry 门户/agent 定义里预配置**

## Provider 能力矩阵（Python，精简版）

> "**同一工具类型在不同 Client 上可用性不同**"

✅ 支持 / ❌ 不支持 / ⚠️ 视模型是否支持 function calling

| Tool Type | Responses | Chat Completion | Foundry | Anthropic | Ollama | Foundry Local | GitHub Copilot |
|---|---|---|---|---|---|---|---|
| **Function Tools** | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ |
| **Code Interpreter** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **File Search** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Web Search** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Image Generation** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Hosted Shell** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Hosted MCP** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Local MCP** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Foundry Toolboxes** | ❌ | ❌ | ✅* | ❌ | ❌ | ❌ | ❌ |
| **Bing / AI Search / SharePoint** | ❌ | ❌ | ✅* | ❌ | ❌ | ❌ | ❌ |

*Foundry 列中标注 experimental/preview 的条目**仅 Foundry 路径可用**。OpenAI 与 Azure OpenAI 在 Responses / Chat Completion 上工具能力镜像对齐。Copilot 另有 CLI 内置 shell / 文件 / URL fetch（**权限由 Copilot permission handler 控制**），与 OpenAI `get_shell_tool` **不同表面**。

## 工程含义

> "**先定 Client 类型（Responses vs Chat Completion vs Foundry），再选工具清单。**"

**3 条关键选型原则**：

1. **需要 Code Interpreter + File Search 时，优先 Responses 或 Foundry**，不要假设 Chat Completion 全能
2. **本地 Ollama / Foundry Local 能否用 Function Tools，取决于当前模型是否支持 tool calling**
3. **"代码能 import，运行时 client 不支持"的落差** — 选型时按形态 + Provider 运行时能力两层拆开看

## Tool Approval：框架级统一闸门

**Tool Approval 不是某个云厂商的独占能力**，而是 **function-invoking chat client 上的横切能力**：
- Function Tools
- 部分 Hosted 调用
- MCP tool call

**均可走同一套"先暂停、等人确认、再继续"流水线**。

**Python 单函数声明示例**：

```python
from typing import Annotated
from agent_framework import tool, Agent, Message
from agent_framework.openai import OpenAIChatClient

@tool
def get_weather(location: Annotated[str, "City, e.g. San Francisco, CA"]) -> str:
    return f"Weather in {location}: cloudy, 15C."

@tool(approval_mode="always_require")
def transfer_funds(account: str, amount: float) -> str:
    return f"Transferred {amount} to {account}"

async with Agent(
    client=OpenAIChatClient(),
    instructions="You are a banking assistant.",
    tools=[get_weather, transfer_funds],
) as agent:
    result = await agent.run("Transfer 1000 to ACCT-42 and summarize weather in AMS.")

    while result.user_input_requests:
        for req in result.user_input_requests:
            # 展示 req.function_call.name / arguments 给终端用户
            approved = True  # 实际 UI 采集
            result = await agent.run([
                "Transfer 1000 to ACCT-42 and summarize weather in AMS.",
                Message("assistant", [req]),
                Message("user", [req.create_response(approved)]),
            ])
    print(result.text)
```

**要点**：
- **需要用户输入时，`run()` 不会直接给出最终答案**，而是返回 `user_input_requests`（含函数名与参数 JSON）
- **与 Session 联用时，可在多轮中保留审批上下文**
- **流式场景需在 chunk 上同样检查 `user_input_requests`**
- **生产环境对副作用类工具应默认 `always_require`，而非 sample 里的 `never_require`**

## Agent 作为 Tool：组合式多智能体

**Overview 提供 Agent → Function Tool 的桥接**：
- **内层 Agent** 自带工具与指令
- **外层 Agent** 把它当作一个**可调用工具**
- **分层委派**（与 Workflow 的确定性图编排不同，更偏模型自主路由）

```python
weather_agent = OpenAIChatCompletionClient(
    model=os.environ["AZURE_OPENAI_CHAT_COMPLETION_MODEL"],
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
    credential=AzureCliCredential(),
).as_agent(
    name="WeatherAgent",
    description="Answers weather questions for a location.",
    instructions="You answer weather questions only.",
    tools=get_weather,
)

weather_tool = weather_agent.as_tool(
    name="WeatherLookup",
    description="Look up weather for any location",
    arg_name="query",
    arg_description="Location or weather question",
)

main_agent = OpenAIChatCompletionClient(
    model=os.environ["AZURE_OPENAI_CHAT_COMPLETION_MODEL"],
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
    credential=AzureCliCredential(),
).as_agent(
    instructions="You are a helpful assistant. Delegate weather to WeatherLookup.",
    tools=[weather_tool],
)

result = await main_agent.run("What is the weather in Amsterdam?")
print(result.text)
```

**适用边界**：
- ✅ **适合**：子域清晰、接口稳定的专家 Agent（天气、检索、代码审查）
- ❌ **不适合**：强顺序、强事务、必须 checkpoint 的流程 → **应改用 Workflow**
- ⚠️ **外层每次 `as_tool()` 调用都会产生完整子 Agent run**，注意**延迟与 Token 成本**

## 与系列其他文章衔接

| Agent 篇主题 | 与 Tools 的关系 |
|---|---|
| **Skills（十一）** | 领域包 + `load_skill` / `run_skill_script`，与 Function/Hosted 工具**正交** |
| **CodeAct（十二）** | 用 `execute_code` 在沙箱内编排 `call_tool`，**工具契约更重要** |
| **Safety / FIDES（十三、十四）** | **工具参数与 sink 策略是安全边界的核心** |

## 选型检查清单（架构/落地用）

1. **Client**：Responses / Chat Completion / Foundry / Anthropic / Copilot？
2. **工具类**：只需 Function？要不要 Code Interpreter、File Search、MCP？
3. **数据驻留**：Hosted 工具是否允许把企业文档送到 Provider？
4. **审批**：哪些 tool 必须 `approval_mode="always_require"`？
5. **组合**：是否需要 `as_tool()` 嵌套？是否应升级为 Workflow？
6. **预览项**：Foundry experimental 工具是否接受首次 `ExperimentalWarning` 与 API 变更？

## 与已有实体的关系

- `Mac Multi Agent Coding Skills Hooks Harness` — Skills + Hooks 两层 harness
- **本实体** — Microsoft Agent Framework 4 类工具（Function/Hosted/MCP/Foundry）
- **关系**：本实体更偏**框架级工具分类与 Provider 能力矩阵**

- `Rein Go Agent 4 Modules 5 Type Boundaries` — Rein = Go code agent framework
- **Microsoft Agent Framework** = **Python 企业级 agent framework**（覆盖 Function + MCP + Foundry + Hosted 全部 4 类）
- **Rein 偏 Code Agent 内部模块**；**MAF 偏多类工具的客户端运行时**

- `Is Grep All You Need` — 检索 × Harness × 交付耦合
- **Tool Approval** = 框架级"交付方式"统一闸门（与检索器选型同等量级）

## 核心金句

- "**工具不是'插件列表'，而是 Agent 对外的能力契约**"
- "**一次 tool_call 对应一次结构化入参、一次可观测的副作用、可被中间件拦截的执行路径**"
- "**Function Tools 可移植性最好、最适合接业务逻辑与细粒度权限**"
- "**入参由模型根据 JSON Schema 生成，必须按不可信输入校验**"
- "**Hosted Tools 计费、配额、数据驻留都跟随 Provider**"
- "**Chat Completion 客户端往往不支持完整 Hosted 能力集**"
- "**MCP 适合把已有工具生态以标准协议接到 Agent，不必每个集成写一个薄封装函数**"
- "**FoundryAgent（远端已定义的智能体）与 FoundryChatClient（本地 client 组工具）能力边界不同**"
- "**许多工具只能在 FoundryChatClient 路径下由框架动态挂载**"
- "**先定 Client 类型，再选工具清单**"
- "**Tool Approval 不是某个云厂商的独占能力，而是 function-invoking chat client 上的横切能力**"
- "**生产环境对副作用类工具应默认 always_require，而非 sample 里的 never_require**"
- "**Agent → Function Tool 桥接 = 分层委派（与 Workflow 的确定性图编排不同，更偏模型自主路由）**"
- "**外层每次 as_tool() 调用都会产生完整子 Agent run，注意延迟与 Token 成本**"
- "**强顺序、强事务、必须 checkpoint 的流程应改用 Workflow**"

## 深度分析

### 1. Provider 矩阵的实质：运行时能力 vs 代码可 import 性的落差

Provider 能力矩阵揭示了一个核心矛盾：**框架 API 层面可 import 的模块与运行时实际支持的工具类型之间存在系统性落差** 。例如，`Code Interpreter` 和 `File Search` 在 Python import 路径上对所有 Client 类型开放，但在实际运行时只有 `Responses` 和 `Foundry` 支持。这不是文档缺陷，而是 Client 架构分层导致的：**Chat Completion 客户端复刻的是 OpenAI Chat Completion API 的工具子集，而非 Responses API 的完整工具面**。

这一落差对架构选型的实际影响是：开发团队在原型阶段用 `OpenAIChatCompletionClient` 通过 `FunctionTool` 可以模拟任何工具行为，但到生产部署切换到 `Responses` 或 `Foundry` 时，会发现有些能力（如 `Hosted Shell`）只在特定 Client 上原生暴露。因此**选型时必须同时按"Client 类型 × 工具类型"二维矩阵核对**，而不能只按"工具名称"匹配 。

### 2. Tool Approval 作为横切关注点：统一审批与多端一致性的平衡

`ToolApproval` 被设计为 **function-invoking chat client 上的横切能力**，而非 Provider 独占功能 。这个设计选择有重要含义：同一套审批逻辑可以跨 `Function Tools`、`Hosted 调用` 和 `MCP tool call` 工作，对外层 Agent 屏蔽了底层工具类型的差异。然而这也意味着**审批策略的可配置粒度必须足够细**：一个 `transfer_funds` 需要 `always_require`，但 `get_weather` 只需要 `never_require` —— 两者都在同一个 `@tool` 装饰器参数层面声明，却通过同一个 client 运行时统一调度。

这个设计实际上把"**安全策略声明**"从运行时决策提前到了**工具定义阶段**，符合 Zero Trust 原则（永不隐式信任任何工具调用）。但它也带来一个实操难题：当 `as_tool()` 把内层 Agent 包装成外层工具时，审批边界在哪里？内层 Agent 的工具审批是否自动继承？文档没有明确说明，这需要在实际集成中格外小心。

### 3. MCP 协议的位置：标准化集成层 vs 应用感知层

MCP Tools 在矩阵中的独特之处在于它同时出现在 **Hosted MCP**（Provider 运行时管理）和 **Local MCP**（应用侧直连）两种形态，且两者在不同 Client 上可用性完全一致（都支持）。这说明 **MCP 协议本身是 Client-agnostic 的**，框架在协议解析层面统一处理 MCP 调用，而不关心 MCP Server 实际托管在哪里。

这个设计对于企业集成团队意味着：可以把内部工具（SaaS、数据库、内部平台）封装为标准 MCP Server，然后在**任何支持 Local MCP 的 Client 上**使用这些工具，而不需要为每个 Client 类型写专门的适配层 。这是该框架相较于其他 Agent 框架（如 LangChain、LangGraph）在工具集成层面的核心差异化优势 —— **协议层面的抽象比代码层面的抽象更难被绕过，也更容易生态化**。

### 4. Agent-as-Tool 的适用边界：何时分层委派 vs 何时代替 Workflow

`as_tool()` 模式将一个完整 Agent 包装成可被外层 Agent 调用的小工具，本质上是**分层委派（hierarchical delegation）**，与 Workflow 的确定性图编排（directed graph）是正交的选择 。关键区分在于：

**适用 as_tool()**：子域边界清晰、接口稳定、允许模型自主决定何时调用、调用结果为最终答案或结构化数据（如天气查询、代码审查、检索）。

**不适用 as_tool() → 应改用 Workflow**：强执行顺序（第二步依赖第一步输出）、事务性要求（必须 checkpoint 回滚）、多 Agent 必须同步协作（如同一个共享状态的并发操作）。

这个边界的实操意义在于：架构师在设计多 Agent 系统时，**第一反应不应该是把所有子任务都变成嵌套 Agent**，而应该先问"这些子任务之间是否有强数据流依赖或事务要求"—— 如果有，Workflow 更合适；如果子任务足够独立且接口稳定，as_tool() 可以显著简化架构。

### 5. Foundry 工具的 preview 陷阱：experimental API 的生产风险

Foundry 工具矩阵中大量标注了 **experimental / preview** 状态 ，这些工具在首次使用时会产生 `ExperimentalWarning`，且 API 可能在后续版本中变更。这意味着：

- **生产系统不能依赖 experimental 工具作为核心路径**：一旦底层 Foundry API breaking change，运行时会直接报错而非优雅降级
- **评估阶段应该明确区分"已生产可用"和"experimental"工具**：选型检查清单中应单独列出一项"哪些 Foundry experimental 工具是业务必需的，如果不可用是否有 fallback"

Foundry 工具矩阵的设计哲学似乎是将**创新前沿（experimental）工具与稳定工具混合在同一套挂载机制下**，降低试错门槛 —— 但这对生产系统的稳定性工程提出了更高要求：需要主动维护一个"Foundry experimental 工具清单 + fallback 方案"的内部文档 。

## 实践启示

### 1. 选型时先用 Provider × Tool 二维矩阵过滤，再谈功能需求

在实际项目选型中，第一步不是问"我需要什么工具"，而是问"我的 Client 类型是什么" 。具体流程：

1. **确认 Client 类型**：如果需要 Code Interpreter + File Search，只能选 `Responses` 或 `Foundry`，排除 `Chat Completion`、`Anthropic`、`Ollama`
2. **在选定 Client 上拉矩阵**：确认所需工具类型在该 Client 上是 ✅ 支持还是 ❌ 不支持
3. **处理 ⚠️ 项**：如果模型不支持 function calling（Ollama/Foundry Local），Function Tools 实际降级为 ⚠️，需要评估模型升级或切换
4. **最后才是业务功能映射**：把业务需求映射到工具类型上，而不是直接匹配工具名称

这个顺序颠倒的选型流程可以避免常见的"原型 works，生产 fails"问题 —— 在原型阶段用 `OpenAIChatCompletionClient` 模拟所有工具看似全能，上生产时才发现工具集不匹配。

### 2. 统一 Tool Approval 策略：默认 always_require，按工具风险分级配置

生产系统中，Tool Approval 配置应该**按工具风险等级建立清单**，而非逐个工具临时决定 ：

- **高风险工具**（`always_require`）：写数据库、写文件到共享路径、执行 Shell 命令、转账/支付、发送外部 API 请求
- **中风险工具**（`user_input_required`）：文件删除、外部链接访问、长时运行任务
- **低风险工具**（`never_require`）：只读查询、公开信息检索、格式化输出

这个分级应该在**工具定义阶段就完成**，而非在 `agent.run()` 调用侧临时处理。对于多团队协作的场景，建议在团队内部维护一份 `tool_approval_matrix.md`，与本框架矩阵配合使用。

### 3. MCP 优先策略：已有工具生态优先 MCP 封装，而非 Function Tool 薄封装

如果团队已有大量内部工具（SaaS API、数据库、监控系统），在接入 Agent Framework 时**不应为每个工具写一个 Function Tool 薄封装**，而是应该优先评估该工具是否已有 MCP Server 实现，或评估自建 MCP Server 的成本 。

原因：MCP Server 一旦实现，可以在**任何支持 Local MCP 的 Client 上复用**，而 Function Tool 薄封装与特定 Client 的 function invoking 机制绑定。如果未来需要切换 Client 类型（如从 OpenAI Chat Completion 迁移到 Foundry），Function Tool 薄封装可能需要重写，而 MCP Server 不需要修改。

具体操作：先用 `Local MCP` 形态接入（应用侧 stdio 连接），验证工具行为满足需求后再评估是否需要升级到 `Hosted MCP`（Provider 托管），以获得更好的隔离和计费管理。

### 4. as_tool() 使用前做"独立性测试"：子 Agent 是否足够独立

在决定是否使用 `as_tool()` 构建嵌套 Agent 前，建议做一个**独立性测试** ：

- 子 Agent 是否有清晰的单一职责（不依赖其他子 Agent 协同完成）？
- 子 Agent 的输入输出是否可以被**自然语言或简单结构化数据**表达（而非复杂的中间状态对象）？
- 子 Agent 是否允许**模型自主决定是否调用**（而非每次 run 必须调用）？

如果以上三个都是 ✅，则 as_tool() 是合适选择。如果任何一个是 ❌，应该考虑 Workflow 或其他编排模式。这个测试可以在设计阶段就排除大部分滥用 as_tool() 的架构陷阱。

### 5. Foundry experimental 工具维护独立清单 + 降级方案

鉴于 Foundry 工具矩阵中有大量 experimental / preview 工具，生产系统应该维护一份内部文档，格式如下 ：

```
## Foundry Experimental 工具清单
| 工具 | 状态 | 业务用途 | Fallback 方案 | 最后验证日期 |
|---|---|---|---|---|
| Computer Use | experimental | 浏览器自动化 | 手动测试 / Playwright 直接调用 | TBD |
| Memory Search | preview | 记忆库检索 | 外部向量数据库（如 Qdrant） | TBD |
```

每次 Foundry SDK 升级后，第一时间验证这些 experimental 工具是否仍然可用，并更新 Fallback 方案。这个维护成本应该计入 Agent Framework 迁移项目的工期估算中。

### 6. 跨 Wiki 实体的交叉引用验证

本实体中提到的以下交叉引用需要定期验证目标实体是否存在 ：

- ``Mac Multi Agent Coding Skills Hooks Harness`` — Skills + Hooks 两层 harness
- ``Rein Go Agent 4 Modules 5 Type Boundaries`` — Rein = Go code agent framework
- ``Is Grep All You Need`` — 检索 × Harness × 交付耦合

如果目标实体不存在，相关链接会变成断链（broken wikilink）。建议在每次实体更新时用 lint 检查断链，或者将这些依赖关系明确记录在架构文档中。

---
