# Gemma 4 QAT Models: Quantization-Aware Training for Mobile and Edge

## Ch01.503 Gemma 4 QAT Models: Quantization-Aware Training for Mobile and Edge

> 📊 Level ⭐⭐ | 8.8KB | `entities/gemma-4-qat-models-optimizing-compression.md`

# Gemma 4 QAT Models: Quantization-Aware Training for Mobile and Edge

> 原文存档：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/gemma-4-qat-models-optimizing-compression.md)

## 概述

Google 2026-06-05 发布 Gemma 4 QAT（Quantization-Aware Training）检查点，专门为移动端、笔记本和消费级 GPU 上的本地推理设计。两个核心交付：

- **Q4_0 标准 QAT 格式** — 全模型通用
- **移动端特殊 QAT schema** — 为 E2B / E4B edge 模型重新设计的压缩格式

核心数据：Gemma 4 E2B 文本-only 模型（无 Per-Layer Embeddings）压缩后 **<1GB 内存占用**。

## 关键技术：移动端特殊 QAT Schema

Google 为 E2B / E4B edge 模型重新思考量化方案，针对**移动处理器架构**优化：

- **Static activations（静态激活）**：训练时预计算 scale settings，推理时不需要动态 scale 计算 → 减少 mobile chip 工作负载
- **Channel-wise quantization（通道级量化）**：压缩数据按 mobile accelerator 内存布局排列 → 原生执行无需慢速 workaround
- **Targeted 2-bit quantization（针对性 2-bit 量化）**：token 生成层 2-bit 重度压缩；核心推理层保持高精度 → 节省存储但不影响"智能"
- **Embedding 和 KV cache 优化**：聚焦压缩词汇表 + 短期记忆（KV cache）→ 大幅降低 active memory footprint

**架构性洞察**：不同于统一压缩整个模型，Google 把"token 生成层"和"推理层"分开了——token 生成是机械性工作（predict next token），可以 2-bit 压扁；推理层是思考性工作，必须保持精度。

## Q4_0 标准 vs 移动端 Schema 性能对比

| 维度 | Q4_0 标准 QAT | 移动端特殊 schema |
|------|---------------|-------------------|
| 适用模型 | 全 Gemma 4 系列 | E2B / E4B edge 模型 |
| 精度 | 4-bit 统一 | 2-bit 局部 + 高精度推理层 |
| 内存 | 显著降低 | E2B text-only <1GB |
| 性能保留 | 比 PTQ 更高 quality | 保留 reasoning quality |
| 目标硬件 | 消费级 GPU / 笔记本 | 手机 / 边缘设备 |

## 工具链支持（部署生态）

发布即支持**完整 on-device 部署链路**：

- **权重格式**：GGUF（llama.cpp）+ vLLM compressed tensors + HuggingFace Hub
- **桌面端**：llama.cpp, Ollama, LM Studio
- **设备端**：LiteRT-LM（Google 轻量 runtime）+ Transformers.js（浏览器）
- **服务端**：SGLang, vLLM
- **Apple Silicon**：MLX
- **微调**：Hugging Face Transformers, Unsloth

**关键生态含义**：QAT checkpoints 与 **MTP（Multi-Token Prediction）** checkpoint 组合可以同时获得 MTP 加速 + 量化压缩——这是 Google 在压缩 + 推理加速"双优化路径"上的协同。

## 与 Gemma 4 完整生态的关系

QAT 是 Gemma 4 发布两个月后（2026-04 → 2026-06）的第三个增量：
1. Multi-Token Prediction（MTP）— 加速推理
2. Gemma 4 12B — 填补 E4B 和 26B MOE 之间的 gap
3. **QAT checkpoints（本篇）— 让大模型在端侧跑得动**

## 实践启示

- **2-bit 量化** 在 token 生成层可接受（机械性工作），但推理层必须保持高精度——这是一个"分层量化"的设计范例
- **Static activations** 是 mobile-optimized inference 的关键工程选择，避开了 dynamic scale 计算的功耗成本
- **MTP + QAT 组合** 是当前端侧 LLM 部署的"双优化"标准路径
- **Gemma 4 E2B < 1GB** 证明 edge deployment 已能跑出可用的 LLM，对 on-device agent / voice assistant 场景有直接工程意义

## 与现有 Gemma 实体差异化

现有 `entities/gemma-4-open-model-adoption-framework-interconnects.md`（来自 Interconnects）覆盖 Gemma 4 整体发布生态和开放模型战略，**QAT 是其中一个具体技术子主题**——本 entity 专注量化压缩技术细节。

`raw/articles/nvidia-gemma-4-edge-ai.md` 关注 NVIDIA edge deployment 视角，**本 entity 关注 Google 自己的 QAT 技术细节**，两者互补。

## 上线状态

- HuggingFace Q4_0 集合：https://huggingface.co/collections/google/gemma-4-qat-q4-0
- HuggingFace Mobile 集合：https://huggingface.co/collections/google/gemma-4-qat-mobile
- Google AI 文档：https://ai.google.dev/gemma/docs/core#qat
- 发布日期：2026-06-05

## 深度分析

### 1. QAT（量化感知训练）的精度保护机制
QAT 在训练过程中模拟量化噪声，使模型学会在低精度下保持性能——与训练后量化（PTQ）相比，QAT 通常在相同压缩率下保持更高的精度。对边缘部署（手机、嵌入式设备），QAT 是必选而非可选。

### 2. 量化对推理成本的非线性影响
从 FP16 到 INT8 的量化通常是"免费的"（精度损失 <1%），从 INT8 到 INT4 的量化则开始出现明显精度下降。Gemma 4 QAT 的价值在于找到精度-压缩的最佳平衡点。

### 3. Google 在开源模型压缩方面的战略意图
Gemma 4 QAT 模型是 Google 在"开源模型可用性"层面的战略投入——不只是发布权重，还提供优化后的部署版本。这降低了开源模型的实际部署门槛，与 `Gemma 4 Open Model Adoption Framework Interconnects` 中讨论的采纳障碍直接相关。

### 4. 压缩-精度权衡的领域特异性
量化对不同任务的影响不同——代码生成对精度更敏感（token 边界关键），文本分类对精度更宽容。选型时应按你的任务类型评估量化影响。

### 5. QAT 模型作为"开箱即用"的部署选项
QAT 模型消除了用户自行量化的技术门槛——直接下载即部署，无需量化调参和精度验证。

## 实践启示

### 1. 边缘部署：优先选择 QAT 模型而非自行量化
如果 Google 已提供 QAT 版本，直接使用——自行量化需要大量调参和验证工作，ROI 通常不高。

### 2. 评估量化影响：在你的任务上跑基准测试
不要只看 Google 报告的通用基准——在你自己的任务上对比 FP16 和 QAT 版本的性能差异。

### 3. INT8 量化通常是安全的起点
如果 QAT 模型不可用，从 INT8 量化开始——这个级别的精度损失通常可接受，但 INT4 需要更谨慎的验证。

### 4. 关注推理加速而非仅模型体积
量化的收益不仅是模型体积减小，还有推理加速（低精度矩阵乘法更快）。评估时应同时衡量延迟改善。

### 5. 为量化模型设计回退机制
在关键场景中部署量化模型时，保留 FP16 版本作为回退——当量化模型的输出质量不可接受时，自动切换到高精度版本。

## 相关实体
- [Alphaevolve Deepmind Discovery Agent](ch03/044-agent.md)
- [Gemma 4 Multi Token Prediction Drafters](ch01/265-gemma-4-multi-token-prediction-drafters.md)
- [Google Ai Vulnerability Exploitation Threat Intel](ch04/150-ai.md)
- [Bonsai Image 4B 1 Bit Ternary](ch04/150-ai.md)
- [Stochastic Parrot Language Models And Meaning](ch01/383-language-models-and-meaning.md)

- [新程alpha认知模型：4b参数端侧部署，群体智能以小搏大比肩gpt-5.4](https://github.com/QianJinGuo/wiki/blob/main/entities/nextie-alpha-cognitive-model-4b-on-device.md)
- [notes on pretraining parallelisms and failed training runs.](ch04/150-ai.md)

## 原文链接

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/gemma-4-qat-models-optimizing-compression.md)

---

