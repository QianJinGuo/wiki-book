# Vercel AI SDK 7 — TypeScript Agent 开发框架全面升级

> 📊 Level ⭐⭐⭐⭐ | 9.4KB

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

## 深度分析

### 生产化主轴：五域划分是对"Demo 到生产"鸿沟的系统性回应

前代 AI SDK 的重心在生成 API 的统一与流式体验，而 7.0 的五大能力域（开发/运行/集成/观测/多模态）几乎全部指向 Agent 进入生产环境后的真实痛点：审批、持久化、超时、沙箱、遥测。这种能力划分方式本身就是信号——TypeScript 生态对 Agent 的期待已从"能调通模型"转向"能扛住生产环境的不确定性"。

### 双上下文分离：安全边界与状态传递是两个正交问题

Tool Context 与 Runtime Context 虽同属"上下文"，但解决的是正交问题：前者是安全边界——通过 `contextSchema` 声明式最小权限，第三方工具拿不到声明之外的字段；后者是执行状态——在 `prepareStep` 中跨步骤读写类型化变量，服务复杂的 Agent 决策逻辑。把两者拆成独立机制而非一个"万能 context"对象，避免了安全敏感数据（如 API Key）与普通运行状态混用带来的泄漏风险。

### 审批即攻击面：HMAC 签名与重放防御

对高风险工作流，AI SDK 7 提供可选择的 HMAC 签名工具审批，并在恢复执行前重新校验工具输入与策略。这暗示设计者已把 Human-in-the-Loop 中"审批消息本身"视为可伪造、可重放的攻击面——审批不只是 UI 交互，而是一个协议级安全问题。它与 WorkflowAgent 的持久化/恢复能力互为表里：一旦执行状态可序列化、可跨进程恢复，审批凭证也必须可验证，否则恢复路径就成了绕过审批的后门。

### 资源引用化：从"内联载荷"到"上传一次、传递引用"

`uploadFile` 与 `uploadSkill` 共享同一个设计模式：大体积输入（文件、技能包）不再随每次推理请求内联传输，而是上传一次后以 provider reference 在后续调用间复用。对无状态、多步骤的 Agent 运行而言，这直接削减了重复传输的带宽与延迟成本；而 reference 可跨提供商迁移的设定，则维持了 SDK 一贯的 provider-agnostic 立场。

### 可观测性重构：一次注册、全链路生效

7.0 将遥测从"每个 `generateText` 调用单独挂回调"改为应用启动时 `registerTelemetry` 一次、全局覆盖全部 SDK 函数，并借助 Node.js tracing channel（`ai:telemetry`）让观测厂商订阅一次即可拿到结构化事件、自动转换为 trace。配合逐步骤的性能统计（首响应时间、token 吞吐、最慢工具），观测从可选的胶水代码升级为 SDK 的一等公民——这与"Agent 运行跨越多个进程与部署周期"的生产现实相匹配。

## 相关主题

- [Agent Harness 12 组件](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-12-components-7-decisions.md)
- [MOC: LLM 核心技术](https://github.com/QianJinGuo/wiki-public/blob/main/moc/llm-core-technology.md)

→ [原文存档](https://vercel.com/blog/ai-sdk-7)

---

