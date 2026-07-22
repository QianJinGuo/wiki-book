---
source: wechat
source_url: https://mp.weixin.qq.com/s/tfadQx1i4tp6kOHDVJNgtw
ingested: 2026-07-05
feed_name: 阿里云云原生
wechat_mp_fakeid: MP_WXS_3537616032
source_published: 2026-07-05
sha256: b190fcc1025890a66e44547796e46c2a38638c02ec401542e7c9c72e96493889
---

# AI Agent 慢在哪？Node.js 探针把模型、工具和服务链路一次串起来

AI Agent 在开发时跑得好好的，上线后却"慢得莫名其妙"？阿里云 ARMS 团队推出的 Node.js 探针方案，通过 OpenTelemetry 将模型调用、工具调用和服务链路统一串联，让 AI Agent 的性能问题不再玄学。

## Agent 的"三层黑盒"

传统的 APM（应用性能监控）主要关注 HTTP 请求、数据库查询和微服务调用，但 AI Agent 应用引入了三个新的"黑盒"：

1. **模型调用黑盒**：LLM 调用本质上是 HTTP 请求，但传统 APM 无法解析 token 消耗和模型延迟。开发只知道"请求发了、响应回了"，中间发生了什么完全不可见。
2. **工具调用碎片化**：Agent 的工具/函数调用是在进程内异步完成的，每个工具的耗时、入参、出参大小和错误率分散在不同的日志中，难以串联。
3. **端到端追踪缺失**：一个 Agent 会话可能涉及多个 LLM 调用、多次工具执行和多次 RAG 检索，但传统 APM 的 trace 设计无法承载 LLM 上下文的跨度。

## Node.js 探针 + OpenTelemetry

ARMS Node.js 探针在 OpenTelemetry 基础上扩展了 AI Agent 语义，自动埋点三类关键数据：

### LLM 调用追踪

每次 invoke/stream 调用自动生成完整 span：
- Token 消耗统计（输入/输出）
- 延迟分解（首包延迟、推理延迟、传输延迟）
- 模型版本和参数识别（自动从请求体解析）
- 重试和退避策略可视化

### Tool/Function 调用追踪

工具执行不再是一个黑盒 span：
- 入参/出参大小记录
- 执行耗时和内存消耗
- 错误率与异常类型分类
- 工具调用链可视化（A 工具的输出 → B 工具的输入）

### Agent 决策链路追踪

ReAct/LangGraph 的 step-by-step 追踪：
- 思考链（thought chain）完整记录
- 决策节点和分支可视化
- 上下文窗口使用率监控
- Agent 陷入循环时的自动告警

## 性能基线数据

通过接入 Node.js 探针，Agent 应用可以实时监控：
- Token 消耗：按 Agent、模型、会话维度统计
- Latency 分解：LLM 调用 vs 工具执行 vs 上下文处理
- Error 检测：模型 4xx/5xx、工具异常、上下文溢出
- CPU/Memory Profile：Agent 进程热点采样

## 快速接入

通过 npm 包一键接入，自动检测 LangChain、LangGraph、OpenAI SDK 等框架版本，零配置启动。默认仅采集关键指标，生产环境可调整采样率。

来源：阿里云云原生公众号，2026年7月5日
