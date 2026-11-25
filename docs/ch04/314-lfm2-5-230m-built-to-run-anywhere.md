# LFM2.5-230M: Built to Run Anywhere

> 📊 Level ⭐⭐⭐⭐ | 10.2KB

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

### 230M 的定位逻辑：Agent 流水线中的专用环节模型

Liquid AI 把 230M 这个量级当作严肃产品而非技术演示，背后是对 Agent 工作流 token 分布的判断：一次 agent 运行中，大部分推理开销消耗在结构化、延迟敏感的环节——路由决策、字段抽取、工具调用格式化——而不是深度推理。把这些环节交给专用小模型，让更大的模型专注真正需要推理的步骤，是分层 Agent 架构的成本/延迟经济学基础。Raw 中两处细节说明这一定位是有意为之：官方明确不建议将模型用于 advanced math、code generation、creative writing 等推理密集型任务，划出了清晰的能力边界；Unitree G1 上的 skill-selection layer 则是这种分工的具象化——模型只负责把自然语言指令分解为工具调用序列，底层技能执行交给 NVIDIA SONIC 框架的预训练技能。 换言之，230M 不是"缩小版通用模型"，而是 Agent 栈中成本/延迟敏感环节的专用组件。

### 边缘推理经济学：213 tok/s 的工程含义

213 tok/s（Galaxy S25 Ultra 解码）与 42 tok/s（Raspberry Pi 5）这组数字值得拆开看：旗舰手机上，一段 200 token 的工具调用计划约 1 秒解码完成，足以支撑闭环的本地 Agent 交互；而在无 GPU 的低成本单板计算机上，42 tok/s 仍高于人类阅读速度，意味着数据抽取管线可以实时运行。更关键的是对比基线——在两类设备上，LFM2.5-230M 都取得同级最高的 prefill 与 decode 吞吐，同时保持最小内存占用，对比对象包括同尺寸的 SSM hybrid 与 Gated Delta Networks。 另一个容易被忽略的信号是 flash-attention 标志的按设备调优：Raspberry Pi 5 启用（-fa 1）、Snapdragon Gen4 禁用（-fa 0）。在 230M 量级，推理性能已经不是单纯的模型属性，而是模型与具体平台的协同工程——这类 per-platform tuning 通常是边缘部署团队自行承担的成本，Liquid AI 把它前置到了发布环节。

### 三阶段后训练在超小模型上为什么有效

SFT 蒸馏（教师为 LFM2.5-350M，约 1.5 倍参数）→ DPO → 多领域 RL 的三阶段配方，针对的正是超小模型的两个典型短板：能力缺口与泛化脆弱。从"近亲"教师蒸馏比从大得多的模型蒸馏更可控，知识落差小、风格一致；多领域 RL 则专攻工具调用这类格式敏感任务。同样值得注意的是配方的"轻量"定位——官方明确其设计目标是 preserve flexibility for developers，即最终 checkpoint 刻意保留对下游专项微调的适应性，而非把开箱即用能力推到极致，因为开发者的领域微调才是这一产品的主要使用方式。 世代对比提供了配方有效性的最硬证据：上一代 LFM2-350M 在 CaseReportBench 仅得 11.67、BFCLv3 仅 22.95，而新一代的 230M 分别达到 22.51 与 43.26——参数量缩小约三分之一，应用类任务分数接近翻倍，说明增益主要来自 LFM2.5 训练配方而非规模。

### 19T tokens + 32K 上下文：预训练侧的 scaling 取舍

19T tokens 对 230M 参数约为 8.3 万:1 的 tokens-per-parameter 比例——把算力投向数据量而非宽度，是小模型对抗容量劣势的经典对冲；在 32K 上下文扩展阶段单独投入算力，在这个尺寸级并不多见，但恰好对准 Agent 工作负载的真实形态（长工具调用历史、多轮结构化交互）。这种取舍在 benchmark 上的投影相当清晰：instruction following（IFEval 71.71、IFBench 38.40）大幅领先参数量 3 倍以上的 Qwen3.5-0.8B（59.94 / 22.87），因为指令遵循更依赖训练数据覆盖而非性能容量；知识类任务（MMLU-Pro 20.25 vs Qwen 的 37.42）则是诚实的缺口。τ²-Bench Telecom 仅 5.26 同样说明多轮 Agent 编排在 230M 上仍然吃力——它是 Agent 栈的入口与抽取层，不是编排核心。 家族内不同规模的分工参见 [Liquid Ai Lfm2 5 2 6B Agentic On Device](https://github.com/QianJinGuo/wiki-public/blob/main/entities/liquid-ai-lfm2-5-2-6b-agentic-on-device.md) 与 [Liquid Lfm2 5 24B A2B Agentic Moe 2026](https://github.com/QianJinGuo/wiki-public/blob/main/entities/liquid-lfm2-5-24b-a2b-agentic-moe-2026.md)。

## 实践启示

1. **数据提取场景优先考虑**：LFM2.5-230M 在 CaseReportBench 上的表现表明它非常适合结构化数据提取管线
2. **边缘部署首选方案**：对于需要在消费级设备上运行的 Agent 工作流，这是当前最优选择之一
3. **快速微调适配**：机器人端部署案例表明，230M 参数模型可以快速微调适配特定领域
4. **搭配更大模型使用**：作为路由/技能选择层，搭配更大的推理模型形成分层 Agent 架构

## 相关实体

- Nvidia Edge First Llms Av Robotics

→ [原文存档](https://www.liquid.ai/blog/lfm2-5-230m)

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关: Agent 架构

---

