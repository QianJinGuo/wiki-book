# Vercel AI SDK 7 — TypeScript Agent 开发框架全面升级

## Ch04.492 Vercel AI SDK 7 — TypeScript Agent 开发框架全面升级

> 📊 Level ⭐⭐ | 5.2KB | `entities/vercel-ai-sdk-7-typescript-agent-framework.md`

# Vercel AI SDK 7 — TypeScript Agent 开发框架全面升级

> **Background**：Vercel AI SDK 是 TypeScript 生态中最流行的 AI 应用开发 SDK（周下载量 1600 万+），AI SDK 7 是其重大版本更新，聚焦 Agent 开发的生产化能力。

## 核心定位

AI SDK 7 将自身定位为 **Agent 开发的统一抽象层**——在任意模型提供商之上提供标准化的 Agent 开发、运行、集成、观测和多模态能力。Vercel 的开源 Agent 框架 Eve 即构建于 AI SDK 之上。

## 五大能力域

### 1. Develop Agents — 开发控制

**Reasoning Control（推理控制）**：标准化 `reasoning` 选项，统一不同模型提供商的推理能力配置。一行代码即可控制推理强度：

```typescript
const result = await generateText({ model, prompt, reasoning: 'high' });
```

**Tool Context（工具上下文）**：为工具注入类型安全的运行时上下文（如 API Key），通过 `contextSchema` 限制工具只能访问自己需要的上下文，防止第三方工具越权访问。

**Runtime Context（运行时上下文）**：在 `prepareStep` 中访问和修改类型化变量，支持跨步骤状态传递，可实现更复杂的 Agent 决策逻辑。

**Provider File Uploads（提供商文件上传）**：标准化文件上传接口，支持各提供商的原生文件处理能力。

**MCP Apps**：将 MCP（Model Context Protocol）服务器打包为可复用的 Agent 应用组件。

**Terminal UI**：内置终端界面支持，可快速构建 CLI Agent 交互体验。

### 2. Run Agents — 运行保障

**Tool Approvals（工具审批）**：在工具执行前插入人工审批环节，实现 Human-in-the-Loop 控制。

**WorkflowAgent（持久化）**：引入工作流 Agent 概念，支持 Agent 执行的持久化和恢复，解决长时间运行任务的可靠性问题。

**Timeouts**：精细化的超时控制，防止单步执行无限挂起。

**Sandbox Support**：沙箱环境支持，隔离 Agent 代码执行环境。

### 3. Integrate Any Agent Harness — 框架集成

AI SDK 7 支持集成外部 Agent 框架（Codex、Claude Code、Deep Agents、OpenCode、Pi），体现其作为 **Agent 基础设施层** 的定位——不替代上层框架，而是提供统一的底层抽象。

### 4. Observe Agents — 可观测性

**Telemetry + Node.js Tracing Channel**：标准化的遥测数据输出，与 Node.js 追踪通道集成。

**Lifecycle Events**：Agent 生命周期事件的完整追踪。

**Performance Statistics**：内置性能统计，支持 Agent 行为分析和优化。

### 5. Beyond Text Agents — 多模态

**Real-time Voice Support**：提供商无关的实时语音支持，统一不同语音模型的 API 差异。

**Video Generation**：视频生成能力集成，扩展 Agent 的输出模态。

## 技术架构洞察

### Tool Context 隔离模型

AI SDK 7 的工具上下文设计遵循 **最小权限原则**：每个工具只能通过 `contextSchema` 声明自己需要的上下文字段，运行时只注入声明的字段。这解决了第三方工具集成的安全问题——一个工具无法访问另一个工具的 API Key。

```typescript
const agent = new ToolLoopAgent({
  tools: {
    weather: tool({
      contextSchema: z.object({ apiKey: z.string() }),
      execute: async (input, { context: { apiKey } }) => { /* ... */ },
    }),
  },
  toolsContext: { weather: { apiKey: process.env.WEATHER_API_KEY! } },
});
```

### WorkflowAgent 持久化模型

`WorkflowAgent` 将 Agent 执行从"无状态函数调用"升级为"有状态工作流"。这意味着：
- Agent 的执行状态可序列化和恢复
- 长时间运行的任务不会因进程重启而丢失
- 支持断点续执行

### MCP Apps 集成模式

MCP Apps 将 MCP 服务器（工具提供者）打包为可复用组件，Agent 可以像调用本地工具一样调用远程 MCP 服务。这降低了多工具 Agent 的集成复杂度。

## 生态位分析

AI SDK 7 在 Agent 开发生态中的位置：

| 层次 | 代表 | AI SDK 7 的关系 |
|------|------|----------------|
| Agent 框架 | Codex、Claude Code、Deep Agents | AI SDK 可集成这些框架 |
| Agent SDK | **AI SDK 7** | 统一的 Agent 开发抽象层 |
| 模型提供商 | OpenAI、Anthropic、Google | AI SDK 统一调用接口 |
| 运行时 | Node.js、Bun、Deno | AI SDK 运行于其上 |

**差异化**：与 LangChain.js 等竞品相比，AI SDK 7 的核心优势是 **Vercel 生态整合**（Next.js、Edge Runtime）和 **TypeScript 原生类型安全**（tool context、runtime context 全链路类型推导）。

## 相关主题

- [Agent Harness 12 组件](../ch05/039-agent-harness.html)
- [MOC: LLM 核心技术](https://github.com/QianJinGuo/wiki/blob/main/moc/llm-core-technology.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/vercel-ai-sdk-7-typescript-ai-apps.md)

---

