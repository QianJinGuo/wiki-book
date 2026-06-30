# iii.dev

## Ch01.351 iii.dev

> 📊 Level ⭐⭐ | 10.7KB | `entities/iii-dev.md`

## 概述
AI 基础设施创业公司，构建用 **Worker / Trigger / Function** 三个原语统一 Agent 与传统后端架构的开源框架。核心主张：Harness 不是后端之上的一层，而是后端本身的一部分。当 Agent 也是 Worker 时，harness 与后端的边界消解为同一套 primitives。

## 创始人
**Mike Piccolo** — iii.dev 创始人，同时担任另一家公司联合创始人兼董事会成员。专注于探索 Agent 与传统后端的融合架构。

## 核心原语
| 原语 | 职责 | 示例 |
|------|------|------|
| **Function** | 带稳定标识符的工作单元 | `orders::validate` |
| **Trigger** | 触发 function 运行的条件 | HTTP、cron、队列、状态变化 |
| **Worker** | 连接 engine 并注册 functions/triggers 的进程 | TypeScript API 服务、Python ML pipeline、Rust 微服务、Agent、沙箱 |

## 关键洞察
- **一切都是 Worker**：TypeScript API 服务、Python ML pipeline、Rust 微服务、Agent、Browser、IoT 设备，均为 Worker
- **类别坍缩**：队列（broker 语义）、HTTP（路由语义）、cron（调度语义）、agent（编排语义）在 iii 里都是同一原语的不同组合
- **Primitive Interface 是契约**：Engine 通过 WebSocket + JSON 与 Worker 通信，不关心实现语言
- **实时发现**：Worker 连接时收到完整 function 目录，断开时自动注销
- **运行时扩展**：无需重新部署、重启或配置变更
- **统一可观测性**：OpenTelemetry traces 跨 Worker、跨语言、跨 Agent 与后端边界

## 技术实现
- **Wire Protocol**：WebSocket 上的 JSON
- **SDK**：TypeScript、Python、Rust（均为开放协议的实现，非系统边界）
- **Engine**：唯一事实来源，管理实时发现、trigger 路由和 trace 传播
- **Sandbox Worker**：microVM 级别硬件隔离，通过 `iii worker add ./my-worker` 创建

## 代码示例（TypeScript SDK）
```typescript
const iii = registerWorker('ws://localhost:49134', { workerName: 'agentic-backend' })
iii.registerFunction('agents::researcher', async (data) => {
  const sources = await iii.trigger({ function_id: 'web::search', payload: { query: data.topic, limit: 10 } })
  const pages = await iii.trigger({ function_id: 'web::scrape', payload: { urls: sources.map(s => s.url) } })
  const findings = await iii.trigger({ function_id: 'llm::summarize', payload: { topic: data.topic, documents: pages } })
  await iii.trigger({ function_id: 'state::set', payload: { scope: 'research-tasks', key: data.task_id, value: findings } })
  iii.trigger({ function_id: 'agents::critic', payload: { task_id: data.task_id }, action: TriggerAction.Enqueue({ queue: 'agent-tasks' }) })
  return findings
})
iii.registerTrigger({ type: 'http', function_id: 'agents::researcher', config: { api_path: '/agents/research', http_method: 'POST' } })
iii.registerTrigger({ type: 'state', function_id: 'agents::researcher', config: { scope: 'research-tasks', condition: 'status == "pending"' } })
```

## 与 Harness 框架对比
| 框架 | Harness 厚度 | 特点 |
|------|-------------|------|
| Anthropic | 薄 | 强信任模型，弱编码逻辑 |
| OpenAI | 中 | 指令栈、编排模式、显式交接 |
| CrewAI | 中 | 多路并行，Flows 处理路由 |
| LangGraph | 厚 | 每个决策是节点，每次转移是定义好的边 |
| **iii.dev** | **取决于注册多少 functions** | 薄与厚只是模式不同，不是架构空间本身的问题 |

## 深度分析
### 类别坍缩：Primitives 的设计哲学
iii.dev 最深刻的思想不是"Worker/Trigger/Function"这三个原语本身，而是它们背后的**类别坍缩**逻辑。在传统架构里，队列（broker 语义）、HTTP（路由语义）、cron（调度语义）、agent（编排语义）各自活在不同的本体中，每种能力都需要独立的集成、生命周期管理和可观测性方案。iii 把它们全部压缩成同一个原语组合——注册 functions 和 triggers 的进程。
这与 Unix 的"一切皆文件"、React 的"一切皆组件"属于同一类范式转移。关键不在于添加功能，而在于**用更少的类别表达更多的现象**。当答案永远是"添加一个 worker"时，架构复杂度不再随功能增长而增长。

### Harness 的定位重估
行业普遍将 harness 视为"后端之上的一层"，但 iii.dev 认为这是临时状态。harness 之所以显得厚重，是因为它试图用传统后端的 primitives 去连接随机性的 LLM 和确定性的执行环境。当 Worker/Trigger/Function 成为后端的基本构建块后，harness 与后端的边界消解了：agent 是 worker，队列是 worker，浏览器也是 worker。
薄 harness vs 厚 harness 的争论，被重新定义为"注册多少 functions"和"如何组合它们"的设计空间内部问题，而非架构层面的分歧。

### 可观测性的根本改变
iii 的可观测性不是"集成一个 OTel SDK"，而是**engine 本身产生 traces 和 metrics**。每一次 `trigger()` 调用都携带 trace ID，跨 workers、跨语言、跨 agent 与后端边界传播。这意味着传统架构中需要手动关联的日志——通过时间戳、trace ID 拼接起来的跨系统调试——在 iii 中变成了一条完整的 span 链路。

### Sandbox Worker 的递归性
Sandbox worker（microVM 级别硬件隔离）本身就是一个 worker，这意味着**agent 可以动态创建 worker**。当 agent 在运行时启动一个 sandbox，这个 sandbox 注册自己的 functions，其他 agents 可以立即调用它们。这是一个 worker 创建另一个 worker 的递归结构，基础设施从产品类别变成了设计模式。

## 实践启示
1. **从小处设计 primitives**：iii 的成功源于三个 primitives 足够小、足够通用，能够表达后端、工作流、agent 乃至硬件隔离等多种现象。设计系统时，先问"最小原语集是什么"，而不是"需要哪些功能模块"。
2. **实时发现改变扩展方式**：传统的服务扩展需要配置变更、重新部署或重启。iii 的实时发现机制让新 worker 连接时立即被整个系统感知，这意味着**架构可以在运行时扩展**，不需要中断生产。
3. **可观测性应该是原生能力**：iii 将 OTel traces 和结构化日志作为 engine 的内置功能，而非事后集成的组件。当可观测性是系统本身的属性而非附加层时，调试跨边界问题才能真正做到端到端。
4. **Agent 不需要特殊的工具层**：在 iii 架构中，agent 的"工具"就是 functions，"记忆"就是 state，"编排"就是 triggers。不需要为 agent 构建单独的基础设施，因为它和队列服务、HTTP API 使用完全相同的 primitives。
5. **边界消解简化运维**：当 harness 与后端之间、基础设施与应用之间、人写服务和 agent 创建的 workers 之间的边界都消解为同一套 primitives 时，运维的复杂度天花板大幅下降。问题不再是"如何连接两个异构系统"，而是"如何注册一个 function"。

## 相关链接
- 官网: https://iii.dev/
- Quickstart: https://iii.dev/docs/quickstart
- Manus 谈 Claude Code 架构重建: https://vrungta.substack.com/p/claude-code-architecture-reverse

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/05-11-the-great-memory-panic-of-2026.md)

## 相关页面
[Agentcore Harness](ch04/503-agent.md) — AWS 托管 Harness 平台，同样探索 Agent 基础设施抽象
[Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — Harness Engineering 六层框架
[Thin Harness Fat Skills](ch04/245-skill.md) — YC/Garry Tan 的 Fat Skills + Thin Harness 思路
[Openclaw Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/openclaw-architecture.md) — OpenClaw 同样探索 Agent 基础设施薄抽象

---

