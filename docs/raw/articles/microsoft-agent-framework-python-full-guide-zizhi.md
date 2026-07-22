---
title: "微软 Agent Framework 全栈指南：从 Hello Agent 到生产托管（Python）"
created: 2026-05-18
updated: 2026-05-18
type: article
platform: 智子AI社
author: 智子AI社
source_url: https://mp.weixin.qq.com/s/xocGtHMHtlzLkdIuGtvGfw
source: 智子AI社
sha256: c9d3a5e7f2b8a1c4e6d9f0b3a7c8e5f1d2b4a6c8e0f1d3b5a7c9e1f4b6d8a0c2
tags: [microsoft, agent-framework, semantic-kernel, multi-agent, workflow, hosting, python, azure-functions, mcp]
---
# 微软 Agent Framework 全栈指南：从 Hello Agent 到生产托管（Python）
作者：智子AI社
## 框架定位
Agent Framework 是微软面向 .NET / Python 的统一 Agent 开发框架，承接 Semantic Kernel 与 AutoGen 的核心能力，并新增：
| 模块 | 职责 |
|------|------|
| Agents | LLM 推理 + 工具/MCP 调用 + 响应生成 |
| Workflows | 图式多步编排，类型安全路由、检查点、人机协同 |
| Hosting | 将 Agent 暴露为 HTTP / A2A / OpenAI 兼容 / Serverless 等形态 |
底层公共能力：Model Client（多厂商模型接入）、AgentSession（会话状态）、ContextProvider（记忆与上下文注入）、Middleware（拦截与治理）、MCP Client（工具生态对接）。
**选型原则：**
- 开放对话、自主调工具 → Agent
- 步骤固定、要强控执行顺序 → Workflow
- 纯确定性逻辑 → 普通函数，不必上 Agent
## Step 1 | 第一个 Agent：模型客户端 + Agent 实例
**安装：** `pip install agent-framework`
**核心对象关系：**
```
FoundryChatClient → 封装项目端点、模型名、凭证
    ↓
Agent(client, name, instructions) → 可 run / 可 stream
```
**最小示例：**
```python
from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential
client = FoundryChatClient(
    project_endpoint="https://your-project.services.ai.azure.com",
    model="gpt-4o",
    credential=AzureCliCredential(),
)
agent = Agent(
    client=client,
    name="HelloAgent",
    instructions="You are a friendly assistant. Keep your answers brief.",
)
# 非流式：一次性返回完整结果
result = await agent.run("What is the capital of France?")
print(f"Agent: {result}")
```
**流式输出：**
```python
print("Agent (streaming): ", end="", flush=True)
async for chunk in agent.run("Tell me a one-sentence fun fact.", stream=True):
    if chunk.text:
        print(chunk.text, end="", flush=True)
print()
```
**配置注意：** 框架不会自动加载 `.env`。需在入口显式调用 `load_dotenv()`。配置体系已从 Pydantic Settings 迁移为 TypedDict + `load_settings`。
## Step 2 | 接入工具：让 Agent 能「动手」
工具（Tool）把自定义函数暴露给模型，用于查天气、调 API、查库等。模型根据用户意图自动决定是否调用工具。
**定义工具：** `@tool` 装饰器
```python
from random import randint
from typing import Annotated
from pydantic import Field
from agent_framework import tool
@tool(approval_mode="never_require")
def get_weather(
    location: Annotated[str, Field(description="The location to get the weather for.")],
) -> str:
    """Get the weather for a given location."""
    conditions = ["sunny", "cloudy", "rainy", "stormy"]
    return (
        f"The weather in {location} is {conditions[randint(0, 3)]} "
        f"with a high of {randint(10, 30)}°C."
    )
```
**approval_mode：**
- `never_require`：直接执行（适合本地 Demo）
- `always_require`：每次执行前确认（生产推荐）
**挂载到 Agent：**
```python
agent = Agent(
    client=client,
    name="WeatherAgent",
    instructions="You are a helpful weather agent. Use the get_weather tool.",
    tools=[get_weather],
)
```
工具描述（docstring + `Field(description=...)`）会进入模型的 function schema，描述质量直接影响调用准确率。
## Step 3 | 多轮对话：AgentSession 维持上下文
单次 `run()` 不带 session 时，每次调用相互独立。使用 `AgentSession` 维持会话上下文：
```python
session = agent.create_session()
# 第一轮
result = await agent.run("My name is Alice and I love hiking.", session=session)
# 第二轮：应能回忆姓名与爱好
result = await agent.run("What do you remember about me?", session=session)
```
**工程要点：** Session 是会话级状态容器；同一 session 对象贯穿多轮 `run()`，历史由框架在会话内维护。分布式部署时需把 Session 与存储后端（Redis、数据库等）对接，而非仅依赖进程内对象。
## Step 4 | 记忆与持久化：ContextProvider / HistoryProvider
Session 解决「本轮对话连贯」；ContextProvider 与 HistoryProvider 解决「跨轮注入个性化上下文」与「消息持久化/审计」。
**自定义 ContextProvider 示例：**
```python
class UserMemoryProvider(ContextProvider):
    DEFAULT_SOURCE_ID = "user_memory"
    async def before_run(self, *, agent, session, context, state) -> None:
        user_name = state.get("user_name")
        if user_name:
            context.extend_instructions(self.source_id, f"The user's name is {user_name}. Always address them by name.")
        else:
            context.extend_instructions(self.source_id, "You don't know the user's name yet. Ask for it politely.")
    async def after_run(self, *, agent, session, context, state) -> None:
        for msg in context.input_messages:
            text = msg.text if hasattr(msg, "text") else ""
            if isinstance(text, str) and "my name is" in text.lower():
                state["user_name"] = text.lower().split("my name is")[-1].strip().split()[0].capitalize()
```
**多层 Provider 组合（持久化 + 外部记忆 + 审计）：**
```python
memory_store = InMemoryHistoryProvider(load_messages=True)
agent_memory = Mem0ContextProvider("user-memory", api_key="...", agent_id="my-agent")
audit_store = InMemoryHistoryProvider("audit", load_messages=False, store_context_messages=True)
agent = client.as_agent(
    name="MemoryAgent",
    instructions="You are a friendly assistant.",
    context_providers=[memory_store, agent_memory, audit_store],
)
```
**实现细节：**
- 仅一个 HistoryProvider 应设置 `load_messages=True`，避免多存储重复回放
- 审计类 Provider 可置列表末尾，`store_context_messages=True` 以记录其他 Provider 注入的上下文
- RawAgent 在特定条件下可能自动挂载 InMemoryHistoryProvider，但不能依赖隐式行为
## Step 5 | Workflows：从「对话 Agent」到「确定性流水线」
当任务由固定步骤组成（ETL、审批、字符串处理管道等），用 Workflow 把 Executor 连成有向图，每步输出作为下一步输入。
```
输入 → [Executor A] → edge → [Executor B] → ... → 输出
```
**与 Agent 的分工：**
| Agent | Workflow |
|-------|----------|
| 开放域推理、工具自主选择 | 步骤与数据流由开发者显式定义 |
| 适合客服、助手 | 适合可测试的批处理、编排管道 |
Workflow 还可与多 Agent 组合：图中节点可以是 Agent，边定义协作顺序；需要对外暴露为单一 Agent 时，可将 Workflow 包装为 AIAgent 以接入 A2A / OpenAI 兼容端点。
## Step 6 | 托管与对外暴露：从脚本到服务
**托管形态对照：**
| 方式 | 适用场景 |
|------|---------|
| A2A Protocol | 多 Agent 系统、Agent 间互调 |
| OpenAI 兼容端点 | 已有 Chat Completions / Responses 客户端直接接入 |
| Azure Functions（Durable） | Serverless、长时任务、按量计费 |
| AG-UI Protocol | Web 前端驱动的 Agent 应用 |
**Python Azure Functions 托管示例：**
```python
pip install agent-framework-azurefunctions --pre
from agent_framework import Agent
from agent_framework.azure import AgentFunctionApp
from agent_framework.foundry import FoundryChatClient
from azure.identity.aio import AzureCliCredential
def _create_agent():
    return Agent(
        client=FoundryChatClient(
            project_endpoint=os.environ["FOUNDRY_ENDPOINT"],
            model=os.environ["FOUNDRY_MODEL"],
            credential=AzureCliCredential(),
        ),
        name="Joker",
        instructions="Tell short jokes about cloud computing.",
    )
app = AgentFunctionApp()
app.register_agent("Joker", _create_agent)
```
HTTP 调用：`curl -X POST http://localhost:7071/api/agents/Joker/run -H "Content-Type: text/plain" -d "Tell me a short joke."`
**.NET 侧：** Microsoft.Agents.AI.Hosting — 在 ASP.NET Core 中通过 DI 注册 IChatClient、AddAIAgent()、AddWorkflow()，再映射 A2A 等协议，Agent 实现与传输协议解耦。
## 生产 checklist
- **凭证：** 开发可用 AzureCliCredential；生产建议 ManagedIdentityCredential，避免 DefaultAzureCredential 的探测延迟与安全面
- **工具安全：** Demo 用 `approval_mode="never_require"`；上线改为 `always_require` 或自定义审批流
- **记忆与合规：** 第三方 MCP、非 Azure 模型需自行评估数据出境、留存与费用；框架不替代内容过滤与 Responsible AI 措施
- **可观测性：** 结合 Middleware 做日志、限流、鉴权；Workflow 利用 checkpoint 支持长流程恢复与人机协同
## 六步能力矩阵（速查）
| 步骤 | 核心 API / 概念 | 解决什么问题 |
|------|---------------|------------|
| 1 首 Agent | FoundryChatClient + Agent.run/stream | 接通模型，拿到首条回复 |
| 2 工具 | @tool、tools=[...] | 函数调用、外部系统集成 |
| 3 多轮 | agent.create_session() | 同一会话内上下文连续 |
| 4 记忆 | ContextProvider、HistoryProvider | 个性化、跨会话持久化、审计 |
| 5 工作流 | Workflow + Executor + Edge | 确定性多步编排 |
| 6 托管 | AgentFunctionApp、A2A、OpenAI 端点 | 对外服务化 |
## 结语
微软 Agent Framework 把「单 Agent 能力栈」和「多步编排 + 托管」放在同一技术栈里：Python 侧从 `pip install agent-framework` 到 Azure Functions 暴露 HTTP，路径清晰；与 Semantic Kernel / AutoGen 的迁移可渐进进行，新服务优先用新框架试点即可。
完整示例代码位于开源仓库 `microsoft/agent-framework` 的 `python/samples/01-get-started/` 与 `python/samples/04-hosting/` 目录。