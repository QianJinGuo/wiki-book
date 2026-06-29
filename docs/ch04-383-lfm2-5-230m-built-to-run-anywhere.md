# LFM2.5-230M: Built to Run Anywhere

## Ch04.383 LFM2.5-230M: Built to Run Anywhere

> 📊 Level ⭐⭐ | 6.6KB | `entities/liquid-ai-lfm2-5-230m.md`

## LFM2.5-230M: Built to Run Anywhere

> **Background**：Liquid AI 发布其最小模型 LFM2.5-230M，专为边缘设备和 Agent 工作流设计。基于 LFM2 架构，在 Galaxy S25 Ultra 上达到 213 tok/s 解码速度，是当前同参数量级中推理速度最快的模型之一。

## 摘要

LFM2.5-230M 是 Liquid AI 发布的 230M 参数基础模型，定位于边缘设备部署和 Agentic 工作流。该模型在 19T tokens 上预训练，包含 32K 上下文扩展阶段，采用三阶段后训练配方（SFT 蒸馏 → DPO → 多领域 RL）。尽管参数量极小，它在工具调用、数据提取等任务上表现出色，且可在 Raspberry Pi 5 等低成本 CPU 上实时运行。

## 核心指标

- **参数量**：230M
- **推理速度**：Galaxy S25 Ultra 213 tok/s（解码）, Raspberry Pi 5 42 tok/s
- **架构**：基于 LFM2（SSM 混合架构）
- **预训练数据量**：19T tokens
- **上下文窗口**：32K
- **定位**：Agent 工作流 + 数据提取
- **开源许可**：Open-weight，无限制下载、微调和部署
- **可用形态**：Base（LFM2.5-230M-Base）+ Post-trained（LFM2.5-230M）

## 训练与微调

模型采用精心设计的三阶段后训练配方，在保持下游适应性的同时平衡开箱即用能力：

1. **监督微调 + 知识蒸馏**：从 LFM2.5-350M 蒸馏，转移更大模型的能力
2. **直接偏好优化（DPO）**：对齐人类偏好
3. **多领域强化学习**：在多个领域上进行 RL 训练以提升泛化能力

最终 checkpoint 在适应下游专项任务的同时，保持与更大模型的竞争力。

### 机器人端部署验证

Liquid AI 在 Unitree G1 人形机器人上验证了 LFM2.5-230M 的端侧能力：模型运行在机载 NVIDIA Jetson Orin 上，作为**技能选择层**——接收自然语言指令并将其分解为一系列工具调用，调用 NVIDIA SONIC 框架提供的底层预训练技能。经过快速微调，模型能将复杂指令（如"静止 2 秒，然后以 1m/s 向前走 3 米，单膝跪地 5 秒"）转化为结构化的多步计划。

## Benchmark 表现

尽管仅有 230M 参数，LFM2.5-230M 在 10 个 benchmark 上与超过其两倍大小的模型竞争甚至超越：

| 模型 | GPQA Diamond | MMLU-Pro | IFEval | IFBench | Multi-IF |
|------|-------------|----------|--------|---------|----------|
| **LFM2.5-230M** | 25.41 | 20.25 | 71.71 | 38.40 | 37.70 |
| LFM2.5-350M | 30.64 | 20.01 | 76.96 | 40.69 | 44.92 |
| Granite 4.0-H-350M | 22.32 | 13.14 | 61.27 | 17.22 | 28.70 |
| Qwen3.5-0.8B Instruct | 27.41 | 37.42 | 59.94 | 22.87 | 41.68 |
| Gemma 3 1B IT | 23.89 | 14.04 | 63.49 | 20.33 | 44.25 |

在工具调用和数据提取任务上同样表现出色：

| 模型 | CaseReportBench | BFCLv3 | BFCLv4 | τ²-Bench Telecom | τ²-Bench Retail |
|------|----------------|--------|--------|-----------------|----------------|
| **LFM2.5-230M** | 22.51 | 43.26 | 21.03 | 5.26 | 13.68 |
| LFM2.5-350M | 32.45 | 44.11 | 21.86 | 18.86 | 17.84 |
| Granite 4.0-H-350M | 12.44 | 43.07 | 13.28 | 13.74 | 6.14 |
| Qwen3.5-0.8B Instruct | 13.83 | 35.08 | 18.70 | 12.57 | 6.14 |

> **注意**：由于其紧凑尺寸，Liquid AI 不推荐将 LFM2.5-230M 用于推理密集型任务（高级数学、代码生成、创意写作）。

## 推理性能

### CPU 推理

得益于 LFM2 架构的高效性，LFM2.5-230M 在 Raspberry Pi 5 和 Qualcomm Snapdragon Gen4（Galaxy S25 Ultra）上均实现了同类最佳的 prefill 和 decode 吞吐量，同时保持最小内存占用。针对不同设备的 flash-attention 标志也做了专门调优：Raspberry Pi 5 启用（-fa 1），Snapdragon Gen4 禁用（-fa 0）。

### GPU 推理

Liquid AI 开发了内部 GPU 推理栈，实现极低延迟服务。在 SGLang 上对比其他小模型，LFM2.5 系列在所有并发级别上均实现了更低的端到端延迟。

## 生态系统支持

模型发布首日即获得全面推理框架支持：

- **llama.cpp** — GGUF 格式，高效边缘推理
- **MLX** — Apple Silicon 优化推理
- **vLLM** — GPU 加速生产级服务
- **SGLang** — GPU 加速生产级服务
- **ONNX** — 跨平台推理
- **NexaSDK** — 跨 Apple、AMD、Qualcomm、Nvidia 硬件

## 深度分析

### 对边缘 Agent 生态的意义

LFM2.5-230M 代表了小模型 + 高速推理这一 Agent 基础设施的关键拼图：

1. **本地 Agent 闭环**：无需云端 API，本地完成工具调用和决策推理，消除了网络延迟和 API 成本
2. **实时交互**：213 tok/s 的解码速度满足人机实时对话需求
3. **隐私保障**：数据不出设备，适用于医疗、金融等敏感场景
4. **规模化部署**：230M 参数的极小体积使得大规模端侧部署在经济上可行

### 技术路线意义

LFM2.5-230M 的成功验证了几个重要趋势：

- **架构效率比参数量更重要**：LFM2 的 SSM 混合架构在极小参数量下仍保持强竞争力
- **蒸馏 + RL 的后训练配方**：从 350M 模型蒸馏到 230M 模型的有效性表明，小模型可以通过精心设计的训练流程获得远超其体量的能力
- **端到端 Agent 链路**：从自然语言理解到工具调用的完整链路可以在 230M 参数上实现

## 实践启示

1. **数据提取场景优先考虑**：LFM2.5-230M 在 CaseReportBench 上的表现表明它非常适合结构化数据提取管线
2. **边缘部署首选方案**：对于需要在消费级设备上运行的 Agent 工作流，这是当前最优选择之一
3. **快速微调适配**：机器人端部署案例表明，230M 参数模型可以快速微调适配特定领域
4. **搭配更大模型使用**：作为路由/技能选择层，搭配更大的推理模型形成分层 Agent 架构

## 相关实体

- [Nvidia Edge First Llms Av Robotics](/ch01-194-nvidia-edge-first-llms-av-robotics/)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/liquid-ai-lfm2-5-230m.md)

---

