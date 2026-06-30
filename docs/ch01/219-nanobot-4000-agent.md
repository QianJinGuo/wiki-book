# nanobot：4000行极简 Agent 框架架构解析

## Ch01.219 nanobot：4000行极简 Agent 框架架构解析

> 📊 Level ⭐⭐ | 17.3KB | `entities/nanobot-agent-framework-architecture-deep-dive.md`

# nanobot：4000行极简 Agent 框架架构解析

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/nanobot-agent-framework-architecture-deep-dive.md)

## 摘要

香港大学数据科学实验室（HKUDS）的 **nanobot**，2026-02 开源，30 天内即获 **28,500+ GitHub Stars**，但核心代码仅 **3,935 行**——对比 LangChain 核心代码 430,000+ 行。它通过 **ReAct 循环 + Markdown 技能定义 + Grep 记忆 + 子 Agent 委托 + MCP 工具集成** 五大决策，证明 Agent 框架不需要过度工程化。本条目拆解每一个设计取舍及其在工程实践中的可借鉴模式。

## 核心要点

### 整体架构：控制面集中化

```
Chat Platforms (13 channels)
        ↓
  MessageBus (asyncio.Queue)
   inbound / outbound
        ↓
  AgentLoop（核心控制面）
   ├── SessionManager → 历史对话加载
   ├── ContextBuilder → system prompt + messages 组装
   └── while loop: LLM → tool calls → execute → append → LLM...
        ↓
 ┌──────────────────────────────┐
 │ ToolRegistry   SubagentMgr   │
 │ exec/fs/web    asyncio.Task  │
 │ spawn/mcp/cron               │
 └──────────────────────────────┘
```

决定性特征：**控制面完全集中在 AgentLoop**。没有 LangChain 的 Chain/Runnable/LCEL 编排层，没有 LangGraph 的节点/边/DAG，没有 AutoGPT 的显式 PLAN 步骤。所有决策路径都穿过同一个 while 循环。

### ReAct 循环的极简实现

整个 agent 编排逻辑约 20 行：

```python
async def _run_agent_loop(self, initial_messages, on_progress):
    messages = initial_messages
    while iteration < self.max_iterations:  # 默认 40 次
        response = await self.provider.chat(
            messages=messages,
            tools=self.tools.get_definitions(),
            model=self.model,
        )
        if response.has_tool_calls:
            for tool_call in response.tool_calls:
                result = await self.tools.execute(tool_call.name, tool_call.arguments)
                messages = append_tool_result(messages, tool_call.id, result)
        else:
            final_content = response.content
            break
    return final_content
```

三个关键工程细节：
- **错误响应不持久化到 session history** —— 防止"400 中毒循环"
- **工具结果存入 session 时截断为 500 字符** —— 当前 turn 可见完整结果，历史只存摘要，控制上下文增长速率
- **错误处理只有一行**：把错误恢复全权交给 LLM

### Tool 系统：最小公共接口

```python
class Tool(ABC):
    @property @abstractmethod
    def name(self) -> str: ...
    @property @abstractmethod
    def description(self) -> str: ...
    @property @abstractmethod
    def parameters(self) -> dict: ...  # JSON Schema
    @abstractmethod
    async def execute(self, **kwargs) -> str: ...  # 硬约束：必须返回 str
```

`execute` 强制返回 `str`：接口统一、LLM 天然消费字符串；代价是结构化数据需在内部序列化。无装饰器、无注册配置文件、无元类。

### Skill 系统：Markdown-as-Config

最独特的设计——**Skills 不是 Python 代码，而是 Markdown 文档，教 LLM 如何使用已有的 CLI 工具**。

```markdown
---
name: weather
description: Get current weather and forecasts (no API key required).
metadata: {"nanobot":{"emoji":"🌤️","requires":{"bins":["curl"]}}}
---

# Weather

## wttr.in (primary)

`curl -s "wttr.in/London?format=3"`
```

系统通过 `shutil.which` 检查 bin 可达性，标记 skill 的 `available` 状态。

**Progressive Loading：用文件系统做懒加载**

System prompt 里只注入 XML 索引（含 name/description/location/available），LLM 需要时用 `read_file` 读取 SKILL.md。这是用文件系统作为懒加载机制。

相比向量检索的优势：
- 确定性（无相似度阈值不确定性）
- 可审计（直接读 SKILL.md）
- 零额外成本（无 embedding/index）

局限：当 skill 数量极大（数百个），XML 索引本身会占满 context window。

### 记忆系统："grep beats RAG"

| 文件 | 内容 | 加载方式 |
|------|------|----------|
| `MEMORY.md` | 长期事实、用户偏好 | 每次都注入 system prompt |
| `HISTORY.md` | 对话摘要，追加写入 | LLM 用 exec grep 按需搜索 |

当 `unconsolidated_messages >= 100` 时，异步触发记忆整合：LLM 自行决定写什么进 MEMORY.md 和 HISTORY.md。整合以独立 `asyncio.Task` 运行，不阻塞主流程。

作者论据（Discussion #566）：
> "grep beats RAG for agent memory — deterministic, auditable, zero-cost, composable"

该论断在个人规模（数百条历史）成立；企业规模（数万条历史、多用户共享、跨语言搜索）时局限会暴露。

### Subagent：消息总线重注入

```python
async def spawn(self, task, label, origin_channel, origin_chat_id):
    task_id = str(uuid.uuid4())[:8]
    asyncio.create_task(self._run_subagent(task_id, task, label, origin))
    return f"Subagent [{label}] started (id: {task_id}). I'll notify you when done."
```

Subagent 的能力约束：
- 没有 message 工具（不能直接给用户发消息）
- 没有 spawn 工具（防止递归生成）
- 最多 15 次迭代（主 agent 40 次）
- 无 memory/history（独立 system prompt）

**结果通知的巧妙设计**：Subagent 完成后通过消息总线重新注入 `InboundMessage`，主 agent 像处理普通用户消息一样总结结果给用户。无需特殊的结果传递协议，无需主 agent 轮询。

代价：`asyncio.Task` 在同一进程内运行，无法跨进程/机器分布。

### MCP 集成：标准协议桥接

MCP 工具被自动包装为原生 Tool 对象：

```python
class MCPToolWrapper(Tool):
    def __init__(self, session, server_name, tool_def):
        self._name = f"mcp_{server_name}_{tool_def.name}"  # 命名空间隔离
        ...
```

支持 stdio（子进程）和 streamable-http 两种 MCP 服务器，对 LLM 完全透明，仅带 `mcp_{server}_` 前缀做命名空间隔离。

## 深度分析

### 1. "控制面集中化"是工程取舍而非教条

nanobot 把所有决策路径强塞进一个 while 循环，与 LangGraph 的 DAG 编排恰好相反。这不是"哪个更先进"的问题，而是不同范式：
- **集中化（nanobot）**：可理解性最大化，调试简单，每个状态一目了然。代价是弹性空间小——复杂工作流必须靠 LLM 在 prompt 层面规划，框架不提供结构化支持
- **DAG（LangGraph）**：可表达复杂流程拓扑（多 agent 协同、条件分支、循环），但调试困难、抽象成本高

判断标准：**当业务工作流可由 LLM 在 prompt 层自然表达时，集中化更优；当工作流本身就是结构化的产品逻辑（如客服分类→路由→回复）时，DAG 更优**。

### 2. Markdown-as-Config 是 prompt 工程的"代码-数据分离"

把 prompt 工程从代码层分离到文件系统，类比于 Web 开发中 "HTML/CSS 与 JS 分离"。带来的收益：
- 非工程师（产品/运营）可以扩展 Agent 能力，只需写 Markdown
- 能力的添加不需要改代码、不需要重启服务
- 能力的版本控制天然受 git 支持
- 失败的 skill 可以一键回滚（删除文件）

这与 [天猫团队的 AGENT.md 持续约定](ch04/310-ai.md)、Anthropic Skills、Claude Code 的 `.claude/` 目录是同一种范式。**Markdown-as-Config 正在成为 LLM 时代的事实标准**。

### 3. Progressive Loading 是 context 管理的关键模式

不在 system prompt 里预载所有知识，只放索引——这是对抗 context 爆炸的根本机制。这种模式可推广到任何 LLM 应用：
- 数据库 schema：只放表名+一句描述，LLM 需要时调用 `describe_table`
- 大型代码库：只放目录树，LLM 需要时调用 `read_file`
- 长对话历史：只放主题摘要，LLM 需要时 grep HISTORY.md

参见 [working set 管理](ch04/503-agent.md)。这种模式的代价是**额外的 tool call 延迟**——但对长寿命 Agent 而言，延迟的代价远小于 context 污染的代价。

### 4. "错误恢复委托给 LLM"是健壮性的范式转移

传统软件工程把错误恢复视为框架职责（重试、回退、断路器）。nanobot 把这块完全交给 LLM——只追加一句引导提示 `[Analyze the error above and try a different approach.]`。

这背后的假设：**LLM 已经足够强，能根据自然语言错误信息自主选择下一步**。这在 GPT-4/Claude 3.5+ 级别成立；在较弱模型上会触发无效循环。

这种范式带来两个深远影响：
1. 框架代码量大幅缩减——没有重试装饰器、断路器、降级策略
2. 系统健壮性依赖**转移到模型能力**——模型升级 = 系统更健壮

### 5. "grep beats RAG"的范围决策

作者在 Discussion #566 中坚持极简路线，拒绝 Qdrant/LanceDB 集成。这不是技术问题而是**定位问题**：nanobot 是个人助手，不是企业知识管理平台。

这种"明确说不"的工程文化在开源世界稀缺。大多数项目在社区压力下不断添加功能，最终膨胀成第二个 LangChain。nanobot 用"不做什么"定义了产品边界。

### 6. Subagent 的"消息总线重注入"是异步编程的优雅范式

传统的异步任务结果通知通常用回调或轮询。nanobot 用"重注入到输入流"消除了"结果传递协议"——主处理逻辑统一处理所有输入来源（用户消息、subagent 结果、cron 触发）。

这种模式可推广到任何事件驱动系统：**用统一的消息接口替代多种结果通知机制**。代价是子任务与消息总线格式耦合，但收益远大于代价。

### 7. nanobot 与 LangChain 的对比启示

| 维度 | nanobot | LangChain |
|------|---------|-----------|
| 代码量 | 3,935 行 | 430,000+ 行 |
| 学习曲线 | 1 小时 | 1 周+ |
| 概念数 | <10 | 50+ |
| 可定制点 | 少（控制面集中） | 多（DAG/Chain/Runnable） |
| 适合场景 | 个人助手、原型、学习 | 企业级复杂工作流 |
| 升级模型成本 | 几乎为零 | 重新适配抽象层 |

**真正的启示不是"小框架打败大框架"，而是"为不同场景做不同取舍"**。LangChain 不是错的，nanobot 也不是错的，错的是用 LangChain 的方式去做个人助手、用 nanobot 的方式做企业工作流。

## 实践启示

1. **架构选型先于框架选型**：在选 LangChain/LangGraph/nanobot 之前，先回答"工作流的结构性来自 LLM 还是产品逻辑"。前者用集中化框架，后者用 DAG 框架。

2. **Markdown-as-Config 作为默认模式**：新建 Agent 项目时，把 prompts/skills/policies 默认放在 Markdown 文件而非 Python 字符串。提升可读性、可审计性、非工程师参与度。

3. **Progressive Loading 替代向量检索**：在 100 个 skill/文档量级，文件系统懒加载 + LLM 自主调度比向量检索更有效（确定性、可审计、零成本）。突破这个量级再考虑 RAG。

4. **错误恢复的层级设计**：基础设施级错误（网络、超时）由框架处理；语义级错误（工具调用结果异常、API 返回错误码）交给 LLM。明确这条边界可以同时获得健壮性与简洁性。

5. **Subagent 用消息总线而非回调**：长任务委托时，用统一的输入流接口接收子任务结果，避免设计专用的结果传递协议。这种模式可推广到 cron、webhook、定时任务等所有异步源。

6. **Tool 接口的最小公共类型**：所有工具返回字符串，统一接口。在 LLM 消费所有输出的场景下，这个取舍合理且能消除大量类型适配代码。

7. **会话历史的截断策略**：工具结果在当前 turn 完整可见、存入历史时截断到 500 字符。这是控制 context 增长的关键机制，不影响当前推理质量但显著降低长会话成本。

8. **MCP 作为工具生态的标准接口**：新建 Agent 项目时，优先考虑 MCP 兼容性而非自建工具协议。能零成本接入 MCP 生态的所有工具。

## 适用与不适用场景

**适合**：
- 个人自托管 AI 助手，接入多个聊天平台（13 channels 已实现）
- 快速原型，不想被框架概念淹没
- 学习 Agent 框架的最小实现

**不适合**：
- 多 agent 精确协调（spawn 基于 asyncio.Task，无分布式支持）
- 大规模历史记忆（grep 文件有规模上限）
- 细粒度 agent 行为控制（控制面集中化意味定制点有限）
- 生产环境安全隔离（exec 工具的黑名单机制不够）

## 关联实体

- [Agent Harness Context Management Working Set](ch04/503-agent.md) — Progressive Loading 与 working set 管理理论
- [Loop Engineering Addy Osmani Challengehub](ch05/004-loop-engineering.md) — ReAct 循环工程化的另一视角
- [Codex Major Update Appshots Goal Xinzhiyuan](https://github.com/QianJinGuo/wiki/blob/main/entities/codex-major-update-appshots-goal-xinzhiyuan.md) — Codex 同样采用单循环 + 长寿命任务设计
- [天猫新品营销技术团队Ai编码实战指南上](ch04/310-ai.md) — AGENT.md 持续约定模式的实战
- [腾讯研究院Ai速递 20260506](ch04/310-ai.md) — CL-Bench Life 揭示的"上下文误用"问题，呼应 nanobot 的 progressive loading 设计
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — Agent harness 的工程框架

## 相关链接

- https://github.com/HKUDS/nanobot
- https://github.com/HKUDS/nanobot/discussions/431
- https://github.com/HKUDS/nanobot/discussions/566

---

