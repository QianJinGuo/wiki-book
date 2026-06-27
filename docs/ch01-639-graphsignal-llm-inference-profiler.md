# Graphsignal: LLM Inference Profiler

## Ch01.639 Graphsignal: LLM Inference Profiler

> 📊 Level ⭐⭐ | 5.2KB | `entities/graphsignal-inference-profiler.md`

# Graphsignal: LLM Inference Profiler

## 摘要

Graphsignal 是一个生产级推理性能分析平台，专注于 LLM 推理栈的可观测性。与通用 APM 工具（如 Datadog、New Relic）不同，Graphsignal 针对 AI 推理场景做了深度定制，覆盖从 GPU 利用率到 token 吞吐量的全链路指标。它支持主流推理框架（vLLM、TGI、TensorRT-LLM 等），通过连续高分辨率 profiling 暴露推理工作负载中的性能瓶颈。

## 核心要点

### 功能矩阵

| 能力维度 | 具体功能 | 价值 |
|---------|---------|------|
| **推理 tracing** | LLM 生成的逐步计时、token 吞吐量、延迟分解 | 定位 TTFT vs TPS 瓶颈 |
| **系统级指标** | CPU/GPU/加速器利用率、显存占用 | 发现硬件资源浪费 |
| **错误监控** | 设备级故障、推理引擎异常 | 快速定位 OOM、CUDA 错误 |
| **Agent 遥测** | AI agent 的推理瓶颈识别 | 优化多轮对话延迟 |
| **成本追踪** | 按模型/请求/用户维度追踪 API 成本 | 控制 LLM 运营开支 |

### 安装与集成

Graphsignal 支持两种安装模式：

1. **独立工具安装**：通过 `uv tool install` 安装，支持 CUDA 12.x/13.x 变体
2. **工作环境内安装**：直接 `pip install graphsignal` 到应用环境中，通过 Python API `graphsignal.watch()` 集成

集成方式轻量，对现有推理服务的侵入性低——这是生产环境 profiling 工具的关键要求。

## 深度分析

### 推理可观测性 vs 传统 APM

传统 APM 工具（Datadog APM、New Relic）的 tracing 粒度停留在 HTTP 请求/RPC 调用层面。LLM 推理的独特挑战在于：

- **异构延迟结构**：prefill 阶段（compute-bound）与 decode 阶段（memory-bound）有完全不同的性能特征
- **token 级粒度**：一个请求可能生成数百个 token，每个 token 的生成时间都不同
- **batch 调度影响**：continuous batching 下，单个请求的延迟受其他请求影响
- **硬件异构性**：同一模型在 A100 vs H100 vs L40S 上表现差异巨大

Graphsignal 的价值在于将这些 LLM 特有的性能维度纳入可观测性框架，而非简单套用传统 APM 的 request-response 模型。

### 在 MLOps 工具链中的定位

```
┌─────────────────────────────────────────────┐
│              应用层 (Agent/App)               │
├─────────────────────────────────────────────┤
│  Graphsignal ← 推理 profiling + 可观测性    │
├─────────────────────────────────────────────┤
│  推理引擎 (vLLM / TGI / TensorRT-LLM)       │
├─────────────────────────────────────────────┤
│  基础设施 (GPU / Kubernetes / 云)            │
└─────────────────────────────────────────────┘
```

Graphsignal 填补了推理引擎与基础设施监控之间的空白。与 MLOps 生态中的其他工具互补：
- **Weights & Biases**：训练侧实验追踪
- **LangSmith / LangFuse**：应用侧 LLM tracing（prompt/completion 级别）
- **Graphsignal**：推理引擎侧性能 profiling（GPU/kernel 级别）

### 关键差异化

1. **连续 profiling**：非采样，全量捕获推理操作的时序数据
2. **硬件关联**：将推理延迟与 GPU kernel 执行直接关联
3. **LLM 特有指标**：token/s、TTFT、inter-token latency 等原生支持
4. **Agent 场景扩展**：支持多轮 agent 对话的端到端延迟分析

## 实践启示

### 适用场景

- **推理服务上线前的性能基线建立**：在灰度发布前建立 P50/P95/P99 延迟基线
- **GPU 资源 right-sizing**：通过实际利用率数据决定是否缩容/升级
- **多模型服务的公平调度**：在共享 GPU 集群上监控各模型的资源竞争
- **Agent 应用的延迟优化**：识别 agent 多轮推理中的瓶颈步骤

### 局限性

- 社区版功能有限，生产级功能可能需要商业许可
- 对自定义推理引擎的支持需要额外集成工作
- 与 [Harness Engineering](/ch05-041-harness-engineering-概念框架/) 的集成模式尚未标准化

## 相关实体

- LangFuse — 应用侧 LLM 可观测性
- [Graphsignal](/ch01-639-graphsignal-llm-inference-profiler/) — 本文实体
- MLOps — 机器学习运维方法论
- [Model Serving Routing](/ch01-838-state-of-routing-in-model-serving/) — 推理服务的路由与调度

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/graphsignal-inference-profiler.md)

---

