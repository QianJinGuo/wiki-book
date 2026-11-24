# Build a serverless image editing agent with Amazon Bedrock AgentCore harness

> 📊 Level ⭐⭐ | 9.2KB

→ [原文存档](https://aws.amazon.com/blogs/machine-learning/build-a-serverless-image-editing-agent-with-amazon-bedrock-agentcore-harness)

## Build a serverless image editing agent with Amazon Bedrock AgentCore harness

Building an AI agent that edits images based on natural language requires an orchestration loop, tool routing, memory management, and a compute environment to run it all. Amazon Bedrock AgentCore harness handles that entire stack with configuration. You declare what the agent does, and the harness runs it in a stateful, isolated microVM with built-in memory, tool routing, and observability.

This post walks through building a serverless image editor where users upload a photo, describe an edit in plain English, and receive the result in seconds. The agent runs on AgentCore harness without custom orchestration code. We deploy the full solution, including authentication, encrypted storage, three image editing tools, and a React frontend, with a single deployment command. The infrastructure is defined using AWS Cloud Development Kit (AWS CDK).

## Image editing application

The application accepts prompts like “change the car color to blue” or “extend the image 200 pixels to the right.” An agent powered by Claude Sonnet 4.6 breaks the requirement into a series of steps and orchestrates the tool calling, each associated with a different Stability AI model. Then it executes the edit, applies a watermark using a shell command on the microVM (no token cost), and returns the result.

This application demonstrates the following AgentCore harness capabilities:

  * **Configuration-driven agent creation.** The agent is defined entirely through API parameters. No Python orchestration code, no framework, no container.
  * **Per-invocation model switching.** The frontend routes basic chat to Claude Haiku 4.5 and edits to Claude Sonnet 4.6. The agent preserves conversation context across model switches.
  * **Per-invocation persona override.** Users select industry personas (Real Estate, Retail, Automotive) that inject domain-specific system prompts without redeploying.
  * AgentCore memory stores conversation history in the AgentCore service for 30 days. The agent retains full context across turns within a session, so it can reference prior edits without the frontend re-sending history. This sample persists the session ID in `localStorage`, so conversations survive browser refresh. Clearing browser data starts a new session on the frontend, but the conversation history remains available in AgentCore through the `ListEvents` API.
  * **AgentCore Gateway with MCP.** Three AWS Lambda-backed tools are exposed t

---
## 深度分析

### 配置即智能体：编排层下沉为 API 参数

这篇文章最值得记下的不是图像编辑本身，而是 harness 把智能体收窄为一个配置对象的具体形态。create_harness 的全部参数就是智能体的全部行为：模型 ID、系统提示词、Gateway 挂载、maxIterations=10、timeoutSeconds=300，外加一个 memory ARN。 文章明确说这就是"整个智能体"——没有编排循环、没有工具执行逻辑、没有流式解析、没有重试代码。 这与 [托管智能体架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/managed-agents-architecture.md) 的判断一致：当工具调用模式足够"直"（收到提示、选工具、调用、返回），编排层可以整体产品化，行为变更从代码部署降级为一次 API 调用。

### 工具路由与安全边界的两层设计

工具路由完全交给模型推理：工具 schema 声明在 AgentCore Gateway 上，描述文本（如 search_and_replace 明确写着"无需 mask，用于替换特定物体"）就是路由依据，模型读描述自己选，不需要任何路由代码。 但路由自由不等于权限自由：allowedTools 把智能体显式钉在三个工具上，而不是通配符放行全部。 外层再由一个 80 行的 Lambda 代理做浏览器凭证与 harness API 之间的安全边界，并控制哪些系统提示词允许进入。 "模型自由选 + 配置硬限权 + 代理控入口"三层叠加，是把 [MCP](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-context-protocol-mcp.md) 工具面收敛到最小权限面的一个可直接套用的模式。放到四层架构里看（React 前端、Lambda 代理、harness 智能体加记忆、三个调用 Stability AI 的工具 Lambda），唯一的新抽象只有 harness 智能体这一层，其余全是常规 AWS 组件。

### 记忆与逐次调用切换：上下文与模型解耦

模型和人格都是逐次调用参数：前端按是否含编辑关键词把闲聊路由到 Haiku、把编辑路由到 Sonnet，还能按行业注入 persona 提示词，都不需要重新部署。 关键在记忆层承担了模型切换的兼容性：AgentCore Memory 持有 30 天完整对话史，并把全部历史喂给当前生效的模型，所以 Haiku 接到"那换成蓝色呢"也能知道 blue 指的是车。 这印证了 [智能体记忆系统设计](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-system-design.md) 里的一个取向——当记忆独立于模型存在时，换模型、换人格都变成无状态切换。

### 微VM 旁路：确定性逻辑零 token 成本

harness 是纯配置的，没有可以塞自定义逻辑的"智能体脚本"；InvokeAgentRuntimeCommand 就是官方留的旁路——直接在智能体所在的 microVM 上跑 shell 和 Python，绕过模型，不耗 token，智能体甚至不知道它发生过。 用途全是确定性工作：喂模型前先缩图省输入 token、校验输出、抽结构化数据、贴水印。 这实际上是给 [智能体沙箱](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-sandbox.md) 加了一个第二执行面：模型面负责不确定决策，旁路面负责确定操作。

**实践启示**

1. 先判断工具调用模式是否"直"，再选 harness：需要 LangGraph 状态机或回合间自定义处理时直接用 AgentCore Runtime，两者同底层基础设施、可平滑迁移。
2. 工具描述即路由器：把"何时用/不用这个工具"写进 description，比写路由代码更可维护。
3. 工具权限用显式白名单而非通配符，配合代理层控制系统提示词入口，构成最小权限双闸。
4. 确定性后处理（水印、缩图、校验）放 microVM 旁路执行，不要烧模型 token。
5. 把记忆做成独立服务，模型切换才有零代码迁移上下文的可能。
6. 预览期产品没有原生 CDK construct 时，用一段 provisioning 脚本桥接，不要因此倒退回手写编排层。

## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

