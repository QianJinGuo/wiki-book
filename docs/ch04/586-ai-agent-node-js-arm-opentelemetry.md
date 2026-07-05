# AI Agent Node.js ARM 探针 — 通过 OpenTelemetry 实现模型/工具/服务链路统一追踪

## Ch04.586 AI Agent Node.js ARM 探针 — 通过 OpenTelemetry 实现模型/工具/服务链路统一追踪

> 📊 Level ⭐⭐ | 1.2KB | `entities/ai-agent-nodejs-otel-arms-observability.md`

# AI Agent Node.js ARM 探针 — 通过 OpenTelemetry 实现模型/工具/服务链路统一追踪

阿里云 ARMS 团队推出的 Node.js 探针方案，基于 OpenTelemetry 扩展 AI Agent 语义，自动埋点 LLM 调用、工具执行和 Agent 决策链路。解决 AI Agent 性能监控的三大难题：模型调用黑盒、工具调用碎片化、端到端追踪缺失。

## 核心能力

- **LLM 调用追踪**：每次 invoke/stream 生成完整 span（token 消耗、延迟分解、模型识别）
- **Tool 调用追踪**：工具执行耗时、入参出参、错误率可视化
- **Agent 决策链路**：ReAct/LangGraph step-by-step 追踪，思考链记录
- **效能监控**：Token 消耗、Latency 分解、Error 检测
- **生产级**：通过 npm 包接入，自动检测 LangChain/LangGraph/OpenAI SDK 框架版本

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ai-agent-nodejs-otel-arms-observability.md)

---

