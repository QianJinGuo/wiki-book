# Netflix In-House LLM Serving Platform

## Ch01.1260 Netflix In-House LLM Serving Platform

> 📊 Level ⭐⭐⭐ | 6.4KB | `entities/in-house-llm-serving-at-netflix.md`

> → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/in-house-llm-serving-at-netflix.md)

# Netflix In-House LLM Serving Platform

## 一句话

Netflix AI Platform 团队自建了完整的 LLM Serving 平台——从模型部署到推理全栈自营，核心栈是 **vLLM (paved-path engine) + Triton Inference Server (compute backend) + OpenAI-compatible API (frontend)**，在生产中暴露了引擎选型、模型打包、部署策略和约束解码等环节的设计权衡。

## 架构概览

Netflix 的 ML Serving 由统一的 JVM-based serving system 处理端到端流程：路由、A/B test、候选生成、特征提取、推理、后处理和日志。小模型 CPU 进程内推理；大模型走 GPU，由 **Model Scoring Service (MSS)** 统一后端处理，底层基于 NVIDIA Triton Inference Server。

## 四个核心设计决策

### 1. 引擎选型：vLLM 作为 Paved-Path

平台最初基于 **TensorRT-LLM**（与 Triton 集成好）。到 2025 年中，两个变化促使重新选型：开源引擎基本追平了与专用栈的性能差距；工作负载扩展到 embedding 生成、prefill-only 推理、自回归解码和自定义模型等混合场景。最终选择了 **vLLM**，原因不是原始性能，而是**运营适配性**：加载自定义架构无需编译管线、自定义解码的扩展钩子、更好的可调试性、以及 ML 研究人员已熟悉的接口。

### 2. Triton 集成：vLLM Backend vs Python Backend

Triton 支持两种模型打包方式，选择对维护性影响显著：

| 方式 | 打包方式 | I/O 容器耦合 | 适用场景 |
|------|---------|:----------:|---------|
| **Python backend** | 在打包时显式定义 I/O tensor specs | 紧耦合：frontend 升级需协调打包变更 | 需要自定义 pre/post processing 的复杂管线 |
| **vLLM backend** | 仅 JSON config 指向权重和 tokenizer | 松耦合：I/O specs 在部署时动态生成 | 架构上正确的默认选项 |

**两个生产坑**：① Triton/vLLM 版本漂移（Triton 20.09 编译的 vLLM API 在 v0.11.2 中移除）→ 必须锁定兼容版本；② vLLM backend 需要标准 HF-compatible 模型 → 非标准模型只能用 Python backend 逃生口。

### 3. API 前端：OpenAI-Compatible + gRPC 双通道

设计原则：**LLM 模型不应是特殊节点**——所有模型（XGBoost 或 LLM）通过同一 gRPC 调用评分，复用同一套 client library、健康检查和部署管线。在此基础上额外暴露 **OpenAI-compatible API** 作为第二前端，使实验→上线路径几乎无缝。

**隐含坑**：Triton 自带的 OpenAI frontend 会静默丢弃 `response_format` 参数，导致请求 `JSON output` 的调用方收到未约束的生成结果。Netflix 用 git-subtree 打了 patch，将 `response_format` 翻译为 vLLM 的 guided decoding 参数。

### 4. 部署策略：Red-Black vs Versioned

| 策略 | 机制 | 适用场景 | 坑 |
|------|------|---------|:---:|
| **Red-Black** | 新老版本并行 → 流量逐步迁移 | 接口稳定时 | I/O schema 变更时的协调缺口（消费者尚未更新配置） |
| **Versioned** | 每 (modelId, modelVersion) 独立部署 | 接口必须变更时 | 过渡期的 GPU 成本临时上升 |

推荐做法：将可变配置（如 tensor shape）**嵌入推理模型本身**使其版本无关，这样就能用更便宜的 Red-Black 路径。

## 运营细节

### Boot 序列

启动 vLLM-on-Triton 实例涉及多个协调步骤。两个非例行操作：
- **模型缓存**：在模型公告时就 materialize 到 Amazon FSx，避免冷启动时的 S3/HuggingFace 下载瓶颈
- **嵌入式 vs 独立 Triton**：需要 OpenAI API 时 Triton 作为嵌入式 server 运行在前端进程中；否则独立运行

### 统一 Metrics 端点

vLLM 和 Triton 各自写 metrics 到不同的位置，Triton 内置的 bridge 只暴露 40+ vLLM metrics 中的 9 个。Netflix 加了一个轻量 HTTP proxy，合并两者的 /metrics 输出，使已有 dashboard 和告警无需修改。

## 约束解码（Constrained Decoding）规模化

部分 Netflix 生产工作负载严重依赖对 token 生成的精细控制。实现方式：通过 vLLM 的 **custom logits processor 接口**，将每个约束建模为一个**状态机**，随生成历史演变，在每一步输出 token 准入掩码。

| 阶段 | 问题 | 解决方案 |
|------|------|---------|
| vLLM V0 | 纯 Python → GIL → logits 处理 CPU 时间随 batch 线性增长 | 单请求瓶颈，高并发时端到端延迟 CPU-bound |
| vLLM V1 | batch-level logits processor → C++ 热路径 + 多线程 | 处理时间保持 flat |
| 生产加固 | Partial prefills（块状 prefilling 导致状态机误判）+ Preemption（KV cache 驱逐后 token 历史缩短打破状态机假设） | 增加内部 tracking；detect 历史缩短时重置状态机 |

## 下一步投资方向

- System prompt compression
- vLLM V1 异步调度
- 向量化 logits processor（GPU kernel 融合）
- 低精度模型变体

## 相关实体

- [AI Infra：大模型高效推理](ch01/756-ai-infra.html) — vLLM 技术原理层面
- [LLM 推理流水线完整解析](ch01/880-llm.html) — Prefill/Decode 理论
- [SGLang](../ch04/596-agent-assisted-sglang-ai-llm.html) — 另一推理框架
- [Disaggregated Prefill/Decode](ch01/880-llm.html) — 分离式推理架构
- [OpenAI-Compatible API on SageMaker](ch01/703-announcing-openai-compatible-api-support-for-amazon-sagemake.html) — 类似 API 设计决策
- [FSx for Lustre GPU Direct](ch01/880-llm.html) — 模型加载/缓存方案
- [推理优化](https://github.com/QianJinGuo/wiki/blob/main/concepts/inference-optimization.md)

---

