---
source_type: blog
source: https://quant67.com/post/llm-infra/23-observability/23-observability.html
title: "可观测性 — 把 LLM 系统从「看到指标」升级到「3 小时修复」"
author: 三十七计 (quant67)
ingested: 2026-06-10
sha256: 73e8cfd7c42c3be66cb0e83bdb80414ae63c24c3de1fd7bad4a555d6b5a579f9
tags: [llm, observability, otel, langfuse, langsmith, dcgm, eval]
stars: 5
confidence: 0.92
value: 9
description: LLM 可观测性 4 层模型（基础设施/调用/质量/业务），主流通用栈横评 + OTel GenAI 语义约定 2025 稳定版 + 实战排障故事
---

# 可观测性 — 把 LLM 系统从「看到指标」升级到「3 小时修复」

> 来源：[quant67.com](https://quant67.com/post/llm-infra/23-observability/23-observability.html)（三十七计，2026-06）
> 系列位置：lmsys LLM Infra 系列第 23 篇（前置 21-推理服务化 / 22-LLM 网关）

## 文章定位

可观测性在传统微服务已经是老生常谈：Metrics + Logs + Traces 三件套 + 一点 Profiling 就能覆盖 90% 排障。但直接搬到 LLM 系统上远远不够：

- 成本不是"CPU 秒"而是"token × 单价"，input/output/cached 三档价格不同
- 延迟不是单一 latency，要拆 TTFT（Time To First Token）/ TPOT（Time Per Output Token）/ E2E
- 一个 Agent 请求可能产生 20 次子 LLM 调用、5 次工具调用、3 次 retriever
- 请求返回 HTTP 200、延迟正常、成本正常，**但答案是幻觉** — 传统监控一个告警都不会响

文章目标：把 LLM 可观测性拆成 4 层，串联主流通用栈，目标是"出问题时 5 分钟定位、3 小时修复，下次不再出现"。

## 1. 为什么 LLM 需要新的可观测性

### 1.1 与传统微服务差异

| 维度 | 传统微服务 | LLM 服务 |
|---|---|---|
| 计费单位 | 请求数 / CPU 秒 | input/output/cached token，按模型不同价 |
| 延迟语义 | 单一 latency（p50/p99） | TTFT（流式首包）+ TPOT（每 token）+ E2E |
| 正确性 | 状态码 200 即可 | 200 不代表正确，可能幻觉/跑题/拒答 |
| 调用拓扑 | 固定 RPC 调用链 | 动态 Agent 循环，轮次/分支/工具不确定 |
| 数据敏感 | 用户 ID / 订单号 | 完整 Prompt / Completion 可能含 PII / 业务秘密 |
| 重放 | SQL 重跑 | 需要完整 Prompt + 模型版本 + 温度 + 种子 |
| 资源瓶颈 | CPU / DB 连接 | GPU SM 利用、HBM、KV cache、网络带宽 |
| 回归 | 单测 + 集成测试 | 数据集 + LLM-as-Judge + 人工标注 |

**结论**：LLM 系统需要新信号、新存储、新评估闭环。

### 1.2 四层观测模型

```
[业务层]   Cost / A/B / Compliance
[质量层]   Eval / 幻觉 / 用户反馈 👍/👎
[调用层]   Trace: LLM/Tool/Retriever / Prompt 版本 / TTFT/TPOT/E2E
[基础设施] GPU DCGM / vLLM SGLang metrics / KV cache / Prefix hit
```

文章按自下而上顺序展开。

## 2. 核心指标体系

### 2.1 延迟：TTFT / TPOT / E2E

- **TTFT**（Time To First Token）：请求到首 token 返回时间，由 Prefill + 排队决定
- **TPOT**（Time Per Output Token）/ ITL：每 token 平均时间，由 Decode + 显存带宽决定
- **E2E** = TTFT + TPOT × output_tokens
- **Queue Time**：高并发时吞没一切优化

线上告警门槛（13B/32B 模型）：

- TTFT p95 < 500 ms（对话式）/ < 2 s（长文档/Agent）
- TPOT p95 < 50 ms（≥ 20 tokens/s）
- Queue p99 < 1 s

### 2.2 吞吐：tokens / req / GPU

- `output_tokens_per_second` — 单卡总输出 token 数，最贴近"成本效率"
- `requests_per_second` — 对比同一模型不同后端
- **`goodput`** — 同时满足 SLO（TTFT、TPOT 都达标）的 throughput，业界新共识指标

### 2.3 GPU 与引擎内部信号

- **SM 利用率** — 不是 `nvidia-smi` 那个 100%（只是"有 kernel 在跑"），要看 DCGM 的 `DCGM_FI_PROF_SM_ACTIVE`、`DCGM_FI_PROF_PIPE_TENSOR_ACTIVE`
- **HBM 占用** — `DCGM_FI_DEV_FB_USED`，超 90% 通常意味着 KV cache 即将 swap
- **KV Cache 使用率** — vLLM `vllm:gpu_cache_usage_perc`
- **Prefix Cache 命中率** — SGLang `sglang:cache_hit_rate` / vLLM automatic prefix caching；**对多轮对话、RAG 复用 prompt 极其重要，命中 60% 以上 TTFT 能砍一半**
- **Running / Waiting 请求数** — 队列深度，扩容信号

### 2.4 Token 成本：input / output / cached

现代 API 三档计价：

| 类型 | 相对价格 | 典型应用 |
|---|---|---|
| Input (uncached) | 1× | 新 prompt |
| Cached input | 0.1× ~ 0.5× | 系统提示、长文档重用（OpenAI / DeepSeek / Anthropic 均支持） |
| Output | 3× ~ 5× | 生成 token |

观测侧分别记录：

```json
usage = {
  "prompt_tokens": 1234,
  "prompt_tokens_details": {"cached_tokens": 1000},
  "completion_tokens": 456,
  "completion_tokens_details": {"reasoning_tokens": 200}  // o1/R1 系列
}
```

**缓存命中率 = cached_tokens / prompt_tokens**。成熟 RAG 系统应稳定 50%+。

### 2.5 质量：不再是 200 就算对

- **满意度** — 用户显式 👍/👎（LangSmith、Langfuse SDK 回写）；隐式信号包括"是否复制"、"是否追问"、"是否停止生成"
- **引用覆盖率**（RAG）— answer 中多少 claim 能对齐检索片段
- **Refusal Rate** — 模型说"我不能回答"的比例；太低可能越权，太高体验差
- **Answer Length 分布** — 突变往往预示 prompt 被污染
- **Groundedness / Faithfulness** — RAGAS 打分 0–1

## 3. Trace 模型与标准

### 3.1 Agent 请求的真实调用链

```
User → Agent → Embed → Retriever → LLM(Planner) → Tool(SQL) → LLM(Summarizer) → User
```

任何一环变慢或出错都需要 trace 定位。

### 3.2 OpenTelemetry GenAI Semantic Conventions

OTel 在 2024 底到 2025 陆续把 `gen_ai.*` 语义约定从 experimental 推向 **stable**。关键字段：

```
span.kind                    = CLIENT
span.name                    = "chat gpt-4o-mini"
gen_ai.system                = "openai" | "anthropic" | "deepseek" | ...
gen_ai.operation.name        = "chat" | "text_completion" | "embeddings"
gen_ai.request.model         = "gpt-4o-mini"
gen_ai.response.model        = "gpt-4o-mini-2024-07-18"
gen_ai.request.temperature   = 0.2
gen_ai.request.max_tokens    = 2048
gen_ai.usage.input_tokens    = 1234
gen_ai.usage.output_tokens   = 456
gen_ai.response.finish_reasons = ["stop"]
gen_ai.conversation.id       = "conv_..."
```

工具调用 / Agent 扩展字段：`gen_ai.tool.name` / `gen_ai.tool.call.id` / `gen_ai.agent.id` / `gen_ai.server.request.duration` (histogram) / `gen_ai.client.token.usage` (histogram)。

**原则**：默认不把 prompt / completion 塞进 attribute（PII），而用 Events（log-record like）承载；由 `OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT` 环境变量控制。

### 3.3 OpenInference（Arize）与 OpenLLMetry（Traceloop）

两套早于 OTel 稳定版的"事实标准"：

- **OpenInference** — Arize Phoenix 推动，`openinference.span.kind = LLM/CHAIN/RETRIEVER/RERANKER/EMBEDDING/TOOL/AGENT`，已有向 OTel GenAI 对齐的适配
- **OpenLLMetry** — Traceloop 推动，`traceloop-sdk` 对 20+ 框架（LangChain、LlamaIndex、Haystack、Mistral、Bedrock…）做 monkey-patch instrumentation，一行 `Traceloop.init()` 即可接管

**2025 年的实际姿势**：后端接收 OTel，SDK 任选。Langfuse、Phoenix、SigNoz、Jaeger、Tempo、Dynatrace 都开始原生理解 `gen_ai.*`。

### 3.4 Span 层次模板

```
Trace: "user chat #U123"
└─ Span: agent.run                           (AGENT)
  ├─ Span: retriever.search                 (RETRIEVER)
  │  └─ Span: embedding.encode              (EMBEDDING)
  ├─ Span: reranker.rerank                  (RERANKER)
  ├─ Span: llm.plan (gpt-4o-mini)           (LLM)
  ├─ Span: tool.sql_query                   (TOOL)
  ├─ Span: tool.http_fetch                  (TOOL)
  └─ Span: llm.summarize (claude-3-5)       (LLM)
```

每个 LLM span 都带：model / params / usage / cost / TTFT / TPOT / finish_reason / messages（可脱敏）。

## 4. 主流通用栈横评

| 工具 | 模式 | 特色 | 缺点 |
|---|---|---|---|
| **LangSmith** | 商业（免费额度） | Playground（直接改 prompt 重跑）、Dataset & Eval、Annotation Queue；深度绑定 LangChain/LangGraph | SaaS 为主，数据出境；self-host 价格高 |
| **Langfuse** | 开源 self-host | Apache-2.0，ClickHouse + Postgres 后端，支持 OTel ingest，Prompt 版本化一流，国内可 self-host（数据不出境），Eval 内置 LLM-as-Judge + RAGAS/DeepEval 桥接 | 需要自运维 |
| **Helicone** | 开源 + SaaS | 代理式接入（`base_url` 改 `oai.helicone.ai` 零代码开始采集） | 代理模式引入一跳延迟；高级 Eval 弱 |
| **Arize Phoenix** | 开源 | OpenInference 参考实现；强在离线调试（`px.launch_app()` 边跑边看 trace）；内置 RAG 三角形可视化 | 偏 offline |
| **W&B Weave** | SaaS + 自托管 | 与 W&B 训练/评估平台打通；适合"wandb 实验跟踪"习惯 | 与训练强绑定 |
| **OpenLLMetry / Traceloop** | 开源 SDK | 自动 instrument LangChain / LlamaIndex / OpenAI / Anthropic / Bedrock / Vertex / Qdrant / Pinecone / Weaviate / Chroma…；纯标准 OTel，后端随便选 | 仅是 SDK，无后端 |
| **AgentOps** | SaaS | 专攻 Agent：轮次、工具调用成功率、Session Replay；与 CrewAI / AutoGen / LangGraph / LlamaIndex Agents 集成 | 偏 Agent 场景 |
| **Pezzo** | 开源 | Prompt 作为一等公民（版本/环境/A/B） | 功能较窄 |
| **Lunary** | 开源 + SaaS | 原 LLMonitor，偏产品化，带用户管理、分析面板、Eval | 已停止部分维护 |

### 4.9 选型决策树

```
我要观测什么?
├─ 数据能出境?
│  ├─ 能 → LangSmith / Helicone / Lunary
│  └─ 不能 → Langfuse / Phoenix self-host
├─ 已有 OTel/APM?
│  ├─ 是 → OpenLLMetry 发到现有后端
│  └─ 否 → Langfuse / Phoenix self-host
├─ 重点是 Agent?
│  └─ 是 → AgentOps + Langfuse
└─ 重 Prompt 版本?
   └─ 是 → Pezzo / Langfuse / LangSmith
```

## 5. Prompt / Output 存储与脱敏

### 5.1 敏感数据问题

Prompt 里可能含：身份证/手机号/银行卡（客服）、内部代码/合同（Copilot / 法律）、病历/姓名（医疗）、未公开财报（金融）。**直接 full-trace 到 SaaS 就是合规事故**。

### 5.2 脱敏策略

1. **客户端脱敏** — SDK 在发送前用正则 / NER 替换 PII 为 `<PHONE>` / `<ID_CARD>`；原文仅本地保留
2. **网关脱敏** — 在 LLM 网关统一处理，观测后端只看到脱敏后的流
3. **字段级加密** — prompt / completion 用 KMS 加密存储，查询时按角色解密
4. **采样** — 只存 1% 原文 + 100% 结构化（usage、latency、tags）
5. **TTL** — 按法规设置

Langfuse mask 钩子示例：

```python
from langfuse import Langfuse
def mask(data):
    import re
    if isinstance(data, str):
        data = re.sub(r"1[3-9]\d{9}", "<PHONE>", data)
        data = re.sub(r"\d{17}[\dXx]", "<ID>", data)
    return data
langfuse = Langfuse(mask=mask)
```

## 6. 评估闭环

### 6.1 在线 vs 离线

```
Prod → 采样 1% → OnlineEval (LLM-as-Judge) → 仪表盘 / 告警
Prod → badcase → 标注队列 → Dataset → 离线 Eval / CI → Prompt/模型发布闸门
```

### 6.2 在线评估：LLM-as-Judge

常见维度：Relevance / Groundedness / Faithfulness / Helpfulness / Toxicity / Conciseness。

Langfuse 自带 Evaluator，也可以自己写：

```python
judge_prompt = """
你是严格的评审。请根据 [Context] 判断 [Answer] 是否完全由 [Context] 支持。
只输出 0.0-1.0 分数和一行理由。
[Context]
{context}
[Answer]
{answer}
"""
```

**注意**：裁判模型必须比生产模型更强或至少同级，否则存在 judge 偏见；定期和人工标注对齐。

常见坑：

- 只用一个 judge → bias 放大，建议 "pairwise 对比 + 多 judge 投票"
- judge 本身也会幻觉 → 要求"只对能在 context 中找到依据的 claim 给高分"
- 裁判 prompt 过短 → 加 few-shot + 严格 JSON schema
- 成本失控 → 只在"模型回答置信度低"或"用户点踩"时触发

### 6.3 离线评估框架

- **RAGAS** — RAG 专用，faithfulness / answer_relevancy / context_precision/recall
- **DeepEval** — pytest-like，`assert_test(GEval(...))`，CI 友好
- **Giskard** — 自动扫描（bias、prompt injection、robustness）
- **promptfoo** — YAML 驱动矩阵评估，适合 prompt 工程师 CLI 流
- **Arize Phoenix Evals** — 和 trace 打通，直接点 trace 加评估

```yaml
providers:
  - openai:gpt-4o-mini
  - deepseek:deepseek-chat
  - anthropic:claude-3-5-sonnet
prompts:
  - file://prompts/summarize_v1.txt
  - file://prompts/summarize_v2.txt
tests:
  - vars: {doc: file://data/d1.md}
    assert:
      - type: llm-rubric
        value: 必须包含结论与证据链
      - type: cost
        threshold: 0.01
      - type: latency
        threshold: 3000
```

### 6.4 数据集治理

- **冻结集（Golden Set）** — 人工标注、代表性强，不再扩充，用于跨版本对比
- **滚动集** — 从线上 badcase 不断采样，用于回归
- **对抗集** — 安全 / 越狱 / prompt 注入样本
- **每次 Prompt 或模型变更，两类数据集分数都不能回退才允许发布**

## 7. 幻觉与事实核查

### 7.1 Groundedness 分数

```
groundedness = (answer 中被 context 支持的 claims) / (answer 中总 claims)
```

实现：让 judge LLM 把 answer 拆成原子 claims，再逐条判 entail / contradict / neutral。

### 7.2 引用对齐

- 模型生成时标注 `[1] [2]`
- 后处理校验：每个引用编号是否命中检索到的 chunk
- 页面上 hover 引用显示原文片段 — **用户可感知的幻觉兜底**

### 7.3 多样性与拒答

- **Refusal rate** — 过高检查 system prompt 过严 / 安全层误伤
- **Response entropy** — 同 prompt 多次采样，输出相似度太低代表不稳定
- **Out-of-scope 检测** — retriever score 太低时主动拒答

### 7.4 幻觉的三种典型形态

工程上建议把"幻觉"细分，不同形态处置不同：

- **事实型幻觉** — 捏造人物、日期、数字。→ Groundedness + 外部知识核查
- **引用型幻觉** — 引了存在的文档但原文不支持结论。→ claim 级 entailment 检查
- **指令幻觉** — 不按用户要求的格式/约束输出。→ 结构化输出（JSON Schema / function call）+ 校验重试

## 8. A/B 实验

### 8.1 分流维度

模型 / Prompt 版本 / 检索参数 / Rerank 开关 / Temperature、top_p。通常在 LLM 网关或观测 SDK 里按 `user_id` hash 稳定分桶。

### 8.2 在线指标

- **直接**：👍/👎、复制率、续问率、会话时长
- **成本**：per-request cost
- **质量**：在线 judge 分数
- **业务**：下单转化、工单解决率、NPS

### 8.3 显著性

LLM A/B 样本量往往不如传统互联网大，要警惕：方差大（同模型不同种子答案差异明显）、异质性（不同场景用户偏好不同）。**推荐 Sequential Testing / Bayesian A/B，别纯 frequentist p-value**。

## 9. 成本观测

### 9.1 多维度计费

每条 trace 至少打上：`user_id, tenant_id, feature, model, region, experiment_variant`。在 Langfuse 里直接 group by；或把 usage 导出到 ClickHouse / BigQuery 自己切。

### 9.2 缓存命中分析

仪表盘必看：

- **Prefix cache hit rate**（引擎侧，vLLM/SGLang）
- **Prompt cache hit rate**（API 侧，OpenAI / Anthropic / DeepSeek）
- **Semantic cache hit rate**（网关侧，GPTCache 等）

三者独立，都能省钱；目标：总 input cost 下降 30–60%。

### 9.3 异常花费告警

```yaml
alert: CostSpike
expr:  sum(rate(llm_cost_usd[5m])) by (feature) > 3 * avg_over_time(sum(rate(llm_cost_usd[5m])) by (feature)[1h:5m])
for: 10m
```

并加速率限（见 22-llm-gateway）— 观测发现、网关止损是标配组合。

## 10. GPU 与推理引擎观测

### 10.1 DCGM Exporter

NVIDIA 官方 Prometheus exporter，DaemonSet 部署采全节点 GPU 指标：

```yaml
spec:
  containers:
  - name: dcgm-exporter
    image: nvcr.io/nvidia/k8s/dcgm-exporter:3.3.5-3.4.1-ubuntu22.04
    ports: [{containerPort: 9400, name: metrics}]
    securityContext: {capabilities: {add: ["SYS_ADMIN"]}}
```

关键指标：

- `DCGM_FI_PROF_SM_ACTIVE` — SM 实际活跃比例（真利用率）
- `DCGM_FI_PROF_PIPE_TENSOR_ACTIVE` — Tensor Core 利用
- `DCGM_FI_DEV_FB_USED / FB_FREE` — HBM
- `DCGM_FI_DEV_POWER_USAGE` — 功耗
- `DCGM_FI_PROF_NVLINK_TX/RX_BYTES` — NVLink 流量
- `DCGM_FI_DEV_ECC_DBE_VOL_TOTAL` — 双比特 ECC（故障预警）

### 10.2 vLLM / SGLang 指标

vLLM `/metrics` 暴露 Prometheus：

- `vllm:num_requests_running`
- `vllm:num_requests_waiting`
- `vllm:gpu_cache_usage_perc`
- `vllm:time_to_first_token_seconds` (histogram)
- `vllm:time_per_output_token_seconds` (histogram)
- `vllm:e2e_request_latency_seconds`
- `vllm:prompt_tokens_total`
- `vllm:generation_tokens_total`
- `vllm:prefix_cache_hit_rate`

SGLang 类似，另提供 RadixAttention 命中：`sglang:cache_hit_rate` / `sglang:running_requests` / `sglang:token_usage` / `sglang:schedule_overhead`。

### 10.3 Grafana 面板模板

推理集群"四行一屏"：

- **流量行**：RPS / tokens-in / tokens-out / 队列深度
- **延迟行**：TTFT p50/p95/p99、TPOT p50/p95、E2E
- **资源行**：SM active、HBM used、KV cache %、prefix hit %
- **成本行**：$/1k tokens、按 model/tenant 分桶

社区模板：DCGM 官方 dashboard + vLLM 官方 dashboard（vllm-project/vllm 的 `examples/production_monitoring`）。

### 10.4 深度性能剖析：Nsight

- **Nsight Systems (nsys)** — 时间线，kernel 调度、NCCL 通信气泡、CPU-GPU overlap
- **Nsight Compute (ncu)** — 单 kernel 占用、cache miss、stall reason
- **PyTorch Profiler + Chrome trace** — Python 级热点
- **TensorBoard / W&B** — 训练侧更常用

组合拳：Prometheus 告警 → nsys 抓一段 → ncu 钻到 kernel。

## 11. Agent 观测

### 11.1 特有信号

- **轮次（steps）** — 每次 user turn 内部的 thought-action-observation 次数
- **工具成功率** — 每个 tool 的 success / total，分 HTTP 错 / 参数错 / 语义错
- **卡死 / 环** — 连续 N 步调用同一工具同一参数
- **计划偏移** — Planner 输出的 plan 和实际执行的 action 序列相似度
- **成本/轮次** — 一个 Agent session 总 token / 总工具费

### 11.2 死循环检测

```python
def loop_detector(history, window=4):
    sig = [(a.tool, hash(str(a.args))) for a in history[-window*2:]]
    half = len(sig) // 2
    return sig[:half] == sig[half:]  # 后半和前半完全相同 -> 疑似环
```

检测到立刻打断并记 `agent.loop_detected=true`。

### 11.3 Replay

Trace 必须包含：每一步的 input / output / tool args / tool result / model / params / seed。AgentOps、LangSmith、Langfuse 都有 replay：点一个失败 session，加载到 playground 里按原样重跑或改一步重跑，定位问题比 printf 高效十倍。

### 11.4 多 Agent 拓扑

CrewAI / AutoGen / LangGraph 多 Agent 框架下，观测要能展示：

- Agent 间"消息图"（谁发给谁、哪一步触发）
- 每个 Agent 的子 LLM 成本与延迟归属
- 角色划分是否按预期生效（例如 "critic" 是否真的在打分）

LangGraph 的 state machine 天然适合 trace 成一棵树，Langfuse 的 session 视图能覆盖；复杂场景下 AgentOps + 自定义 dashboard 更清晰。

## 12. 日志合规

### 12.1 法规一览

- **EU GDPR** — 个人数据"收集最小化"、"目的限定"、"可被遗忘"；数据泄露 72 小时上报
- **中国《个人信息保护法》** — 敏感个人信息需单独同意；跨境传输需安全评估 / 标准合同
- **中国《生成式人工智能服务管理暂行办法》**（国家网信办 2023.8 施行）— 保存用户输入、模型输出日志 **至少 6 个月**；内容安全审核义务；训练数据合法性义务；面向公众提供需备案
- **美国行业法** — HIPAA（医疗）、FINRA（金融）、FERPA（教育）有特殊留存与脱敏要求

### 12.2 工程落地要点

- **日志分级**：结构化指标永久留；完整 prompt / completion 按法规 TTL（中国公众服务建议 ≥ 6 个月）
- **数据分区** — 按区域部署观测后端（中国数据留中国）
- **审计日志** — 谁在什么时候访问了哪个 trace，自身要审计
- **"可遗忘"** — 提供按 `user_id` 级联删除能力（Langfuse、LangSmith 都有相应 API）
- **安全审核记录** — 拒答、命中黑名单的请求单独入审计库

## 13. 代码实战

### 13.1 Langfuse self-host + OpenAI SDK

```bash
git clone https://github.com/langfuse/langfuse && cd langfuse
docker compose up -d
export LANGFUSE_PUBLIC_KEY=pk-...
export LANGFUSE_SECRET_KEY=sk-...
export LANGFUSE_HOST=http://localhost:3000
```

最小侵入集成（drop-in）：

```python
from langfuse.openai import openai  # 只改这一行
from langfuse.decorators import observe

@observe()
def answer(q: str, user_id: str):
    docs = retrieve(q)
    resp = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "你是客服，请基于 context 回答。"},
            {"role": "user", "content": f"context:\n{docs}\n\n问:{q}"},
        ],
        metadata={"user_id": user_id, "feature": "cs_chat", "variant": "v2"},
    )
    return resp.choices[0].message.content

@observe()
def retrieve(q):
    return vectorstore.search(q, k=5)  # 自动成为 answer 的子 span
```

用户反馈回写：

```python
from langfuse import Langfuse
lf = Langfuse()
lf.score(trace_id=trace_id, name="thumb", value=1, comment="有帮助")
```

### 13.2 OpenTelemetry instrument vLLM

vLLM 0.6+ 自带 OTel 支持（`--otlp-traces-endpoint`），或用 OpenLLMetry 在客户端侧一把梭。

```bash
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen3-32B-Instruct \
  --enable-prefix-caching \
  --otlp-traces-endpoint http://otel-collector:4317 \
  --collect-detailed-traces model,worker
```

```python
from traceloop.sdk import Traceloop
Traceloop.init(
    app_name="my-llm-app",
    api_endpoint="http://otel-collector:4318",  # OTLP HTTP
    disable_batch=False,
)
```

OTel Collector 把 `gen_ai.*` trace 同时吐到：

- Tempo / Jaeger（可视化）
- Langfuse OTel ingest（业务面板）
- ClickHouse / BigQuery（自定义分析）

### 13.3 Prometheus 抓 vLLM + DCGM

```yaml
scrape_configs:
  - job_name: vllm
    static_configs: [{targets: ["vllm-0:8000", "vllm-1:8000"]}]
    metrics_path: /metrics
  - job_name: dcgm
    kubernetes_sd_configs: [{role: pod}]
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        regex: dcgm-exporter
        action: keep
```

告警示例：

```yaml
- alert: HighTTFT
  expr: histogram_quantile(0.95, sum by (le,model) (rate(vllm:time_to_first_token_seconds_bucket[5m]))) > 2
  for: 10m
  annotations: {summary: "TTFT p95 > 2s on {{$labels.model}}"}
- alert: KVCacheNearFull
  expr: vllm:gpu_cache_usage_perc > 0.9
  for: 5m
- alert: GPUECCErrors
  expr: increase(DCGM_FI_DEV_ECC_DBE_VOL_TOTAL[1h]) > 0
  annotations: {summary: "GPU {{$labels.gpu}} 出现双比特 ECC，立即隔离"}
```

### 13.4 LLM-as-Judge 在线采样

```python
import random
from langfuse import Langfuse
lf = Langfuse()
def online_judge(trace_id, question, context, answer, judge_model="gpt-4o"):
    if random.random() > 0.01:  # 1% 采样
        return
    score = call_judge(judge_model, question, context, answer)
    lf.score(trace_id=trace_id, name="groundedness", value=score)
    if score < 0.4:
        lf.event(trace_id=trace_id, name="low_groundedness", level="WARNING")
```

## 14. 典型排障故事

真实场景 — "周一早上客服机器人变慢"：

1. **Grafana 红灯**：TTFT p95 从 0.6 s 冲到 3.5 s，error_rate 平稳 — 不是"模型返回错"而是"慢"
2. **拆分维度**：按 model 看只有 `qwen3-32b` 变差；按 tenant 看 `tenant-A` 占突增 80%；按 region 集中在单机房
3. **引擎指标**：`vllm:num_requests_waiting` 堆积、`gpu_cache_usage_perc` 96%、`prefix_cache_hit_rate` 从 55% 掉到 8%、`DCGM_FI_PROF_SM_ACTIVE` 仍然很高 — **不是 GPU 闲着，而是在"徒劳"地重复 prefill**
4. **结论雏形**：tenant-A 换了新 system prompt，prefix 变了导致缓存全失效，带来 prefill 风暴，KV cache 被挤爆，后续请求排队
5. **Langfuse 验证**：按 `tenant=A` 过滤 trace，diff 两个版本 system prompt，果然周末上线了新版；通过 LLM 网关的 prompt 模板统一化，并把变动的部分挪到尾部，恢复 prefix 复用
6. **复盘**：给 Prompt 变更加上"prefix cache hit 回归门槛"——离线 eval 跑 1000 条典型对话，命中率低于基线 10% 不允许发布；同时告警里加上 `prefix_cache_hit_rate` 指标

**每一步都依赖不同层的可观测性**：业务层告警 → 基础设施层指标 → 调用层 trace → Prompt 版本系统。**没有任一层都排不出来** — 这就是"四层观测模型"的价值。

## 15. 国内外厂商生态速览

### 15.1 国际

- **OpenAI** — Platform Dashboard（usage / cost / rate limit）；Responses API / Assistants 自带 `trace_id`；企业版有 "Admin API" 读组织级用量、审计事件订阅
- **Anthropic** — Console 有 prompt caching 命中统计；`cache_control` 决定缓存块；`usage.cache_read_input_tokens` 透出
- **Google Vertex AI** — Cloud Monitoring 自动采 model latency / token count / error rate；与 Cloud Trace 打通；`gen_ai.*` OTel 语义已在 Vertex SDK 开启
- **AWS Bedrock** — CloudWatch Metrics：InvocationLatency / InputTokenCount / OutputTokenCount；Model Invocation Logging 可把 prompt/completion 投递到 S3 / CloudWatch Logs
- **Azure OpenAI** — Application Insights + OTel 原生支持 Semantic Kernel / AutoGen；Content Safety 审核日志独立

### 15.2 中国

- **阿里云 PAI / 百炼（DashScope）** — "模型观测"模块 + SLS 打通；DashScope SDK 默认把 `request_id` 打回客户端
- **火山引擎方舟** — 控制台自带调用明细 + 字节内部 AppMetrics / TCE 体系；企业版支持 OTel 导出
- **百度千帆** — "AI 原生应用开发平台" trace 视图；ModelBuilder 对接自家 Prometheus
- **腾讯混元 / TI-ONE** — 云监控 + CLS（token 维度计费看板）
- **DeepSeek / Kimi / 智谱 GLM / 百川** — 多数仅 Dashboard 展示 usage 与 rate，生产观测仍需自套 Langfuse / LangSmith / 自研

**结论**：厂商 Dashboard 看"账单和健康"够用，真要排障还是得在应用侧独立上一套 trace。

## 16. 与训练侧观测的对比

| 关注点 | 训练侧 | 在线推理 / 应用侧 |
|---|---|---|
| 迭代周期 | 一个 job 几天~几周 | 每秒数百请求 |
| 关键指标 | loss / gradient norm / MFU / TFLOPS / GPU 健康 | TTFT / TPOT / QPS / cost / quality |
| 工具 | W&B / TensorBoard / MLflow / SwanLab | Langfuse / LangSmith / Phoenix / APM |
| 失败模式 | 发散 / NaN / 节点坏 / 通信卡顿 | 幻觉 / 越权 / 成本爆炸 / 延迟尖刺 |
| 数据产物 | Checkpoint / log | Trace / Prompt 版本 / Eval score |

两侧共用基础设施是 GPU 遥测（DCGM）、分布式 tracing（OTel）、告警总线（Alertmanager）。成熟团队搭统一"AI Observability Platform"，训练 + 推理共用后端。

## 17. 前沿方向

### 17.1 自动根因分析（AIOps for AI）

用 LLM 看 trace，直接给工程师"这次失败可能是 retriever 返回无关文档 + 模型直接胡编"这类人话结论。Arize、Dynatrace、Datadog 都在试；开源侧 Langfuse 的 "trace summary" beta 已上线。

进一步把"常见故障模式"沉淀成知识库：token 暴涨 / TTFT 尖刺 / Tool 反复失败 / Agent 打转……由 LLM 基于 trace 主动匹配。

### 17.2 Trace + Weights 联合剖析

训练框架（Megatron、Mcore）把 step 级 loss / grad norm 与 trace 对齐，定位"是训练分布问题还是推理工程问题"。
