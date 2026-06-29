## Ch13.009 Hermes 可观测性方案

> 📊 Level ⭐⭐ | 8.2KB | `entities/hermes-observability.md`

## Overview
阿里云为 Hermes（Nous Research 开源 Agent 框架）开发的一套基于 OpenTelemetry 的可观测性插件方案。解决 Agent 运行时四类核心问题：**过程不可见、成本不可归因、性能不可拆解、结果不可复盘**。通过在 Python runtime 层埋设 instrumentation，将 Hermes 的 ReAct 执行链路还原为结构化 Trace，同时提供 Metrics 信号和高危行为审计能力。
**核心价值：** 将 Hermes 从"黑盒回复器"变成"能被展开、追踪、分析的运行系统"，填补 Agent 运行时可观测空白。

## 核心问题与解决
| 问题 | 表现 | 解决方案 |
|------|------|---------|
| 过程不可见 | 只能看到输入/输出/usage 汇总，ReAct 多轮推理链路空白 | ReAct 结构化 Trace，每轮推理可见 |
| 成本不可归因 | Token 账单只知道总账，不知道花在哪一步 | 按 chat span 拆分 input/output/total tokens |
| 性能不可拆解 | 用户说"变慢了"但无法定位是模型慢还是工具慢 | TTFT + 工具执行耗时分离 |
| 结果不可复盘 | "看起来成功了但结果不对"无法溯源 | 完整调用链还原，定位偏移节点 |

## 技术架构
### 核心技术：OpenTelemetry Runtime Instrumentation
在 Hermes 所在的 Python 环境中安装 runtime instrumentation，围绕 Hermes 的关键执行边界建立 span，再通过 OTLP 标准协议上报。
**五大优势：**
1. **遵循 GenAI 标准** — 对齐 OpenTelemetry GenAI 语义约定 + LoongSuite 扩展
2. **Trace + Metrics 双信号** — 不仅有调用链，还有趋势指标
3. **Streaming TTFT** — 单独记录首字延迟，区分首字慢 vs 生成慢
4. **不绑定云服务** — OTLP 标准协议，可迁移
5. **安全审计** — 异常检测识别越权访问/数据泄露/提示词注入

### Trace 数据结构
| Span 类型 | 记录内容 |
|----------|---------|
| `invoke_agent Hermes`（根节点） | 累计 Token、最终输出消息、总耗时 |
| `chat`（模型调用） | `gen_ai.request.model`, `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`, `gen_ai.response.time_to_first_token` |
| `execute_tool`（工具调用） | `gen_ai.tool.name`, `gen_ai.tool.call.arguments`, `gen_ai.tool.call.result` |

### 与其他框架对比
| 框架 | 可观测方案 | 特点 |
|------|-----------|------|
| Hermes（阿里云版） | OTel runtime instrumentation + ARMS | ReAct 链路还原、TTFT、Security Audit |
| OpenClaw | 无官方可观测方案 | 依赖外部日志 |
| Claude Code | Anthropic 官方 metrics | usage 汇总，无细粒度 Trace |
| Letta | 内置 memory search | 偏向记忆检索，非运行时 Trace |

## 接入部署
**前提：** 运行中的 Hermes 实例 + 阿里云 ARMS 或其他 OTLP 兼容后端
**核心命令：**
```bash

# 获取安装命令
## 登录 CMS 2.0 -> AI 应用可观测 -> Hermes -> 获取命令
## 安装插件
curl -fsSL https://arms-apm-cn-hangzhou-pre.oss-cn-hangzhou.aliyuncs.com/hermes-agent-cms-plugin/hermes-cms.sh | bash -s -- install \
  --x-arms-license-key "auto" \
  --x-arms-project "你的Project" \
  --x-cms-workspace "你的Workspace" \
  --serviceName "hermes" \
  --endpoint "https://你的ARMS-OTLP地址/apm/trace/opentelemetry"

## 开启可观测
hermes-cms enable

## 启动 Hermes
hermes  # 前台
hermes gateway start  # 后台
```
**验证：** 终端出现 `loongsuite-site-bootstrap: started successfully (OpenTelemetry auto-instrumentation initialized).`

## 下一步演进方向
| 方向 | 具体内容 |
|------|---------|
| 数据面 | 日志审计 + 运行诊断（超出当前 Trace/Metrics 范围） |
| 链路面 | memory lifecycle、delegation orchestration、runtime recovery 等 Hermes 特有阶段 |
| 治理面 | 内容采集控制、细粒度数据治理、脱敏策略 |

## 深度分析
### 为什么 Agent 运行时可观测性长期缺失
传统微服务的可观测性（Trace/Metrics/Logs）已有成熟体系，但 Agent Runtime 是全新的执行范式——它不是单次 HTTP 请求，而是一个自主循环的推理过程。Hermes 的 ReAct 执行包含：模型调用 → 推理 → 工具决策 → 执行 → 结果回注 → 下一轮推理。这种多轮循环使得传统以"请求"为粒度的观测模型无法直接套用。
阿里云方案的核心创新在于：在 Python Runtime 层埋设 instrumentation，围绕 `invoke_agent`、`chat`、`execute_tool` 三个核心边界建立 span，用 OTLP 标准协议上报。这意味着不需要修改 Hermes 源码，只要在同一个 Python 进程中加载 instrumentation，就能自动捕获完整的执行链路。

### OpenTelemetry GenAI 语义约定的落地实践
方案遵循 OpenTelemetry GenAI 语义约定（`gen_ai.request.model`、`gen_ai.usage.input_tokens` 等），这意味着数据格式是行业标准的。配合 LoongSuite 扩展覆盖 `execute_tool` 等 Agent 特有关键节点。这种"标准 + 扩展"的策略，使得方案既具备互操作性，又不失灵活性。

### 安全审计的必要性
方案专门强调"高危行为审计"——识别越权访问、异常数据导出、恶意提示词注入。这反映了一个重要趋势：当 Agent 获得工具调用能力后，它的行为边界就不再是"只读"的了。一次提示词注入可能导致 Agent 调用了不该调用的工具、访问了不该访问的数据。可观测性在这里不只是性能优化工具，更是安全防线。

## 实践启示
1. **接入成本极低，优先考虑观测后再调优** — 一行安装命令 + `hermes-cms enable` 即可开启完整观测，生产部署前应优先接入，获取真实执行链路数据后再针对性优化，而不是猜测性能瓶颈。
2. **Token 归因是成本控制的第一步** — 方案按 `chat` span 拆分 input/output/total tokens，这意味着可以精确定位"哪一轮 ReAct 推理"吃掉了最多的 Token，为上下文压缩和工具优化提供数据依据。
3. **TTFT 是区分模型慢还是生成慢的关键指标** — 很多场景下"变慢"实际上只是首字延迟高（模型调度慢），而非生成速度慢。分开记录后才能针对性选择模型或优化调度。
4. **ReAct Trace 是复盘"看似成功实则错误"的唯一手段** — 传统方案只能看到最终输出，有 Trace 后可以展开任意一轮的 `tool.call.arguments` 和 `result`，定位是哪一步推理偏移导致最终答案错误。
5. **安全审计应作为可观测性的标配而非附加** — 当 Agent 开始调用外部工具（尤其是有写入能力的工具），异常行为检测和全量日志审计是防止生产事故的最后防线。

## Related
- [Hermes Agent](ch04-418-hermes-agent.html) — Nous Research 开源 Agent 框架，可观测性是其生产落地关键能力
- Hermes Agent 深度解析 — Self-Evolving/动态 Skill 沉淀/RL 训练闭环等深度解析
- OpenClaw 架构解析 — 无内置可观测方案，对比参考
- [原始文章存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hermes-observability-aliyun.md)

---
