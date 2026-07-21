# Thinking Machines Inkling — 975B MoE 开放权重模型

## Ch01.510 Thinking Machines Inkling — 975B MoE 开放权重模型

> 📊 Level ⭐⭐ | 8.6KB | `entities/thinking-machines-inkling-975b-moe-open-weights-2026.md`

# Thinking Machines Inkling — 975B MoE 开放权重模型

由 OpenAI 前 CTO Mira Murati 创立的 Thinking Machines Lab，于 2026 年 7 月 16 日发布自研 AI 模型 Inkling。该模型采用开放权重策略，外部开发者和企业可直接下载并根据需求修改。

## 技术规格

- **架构**：混合专家（MoE）Transformer
- **总参数量**：9750 亿（975B）
- **激活参数量**：410 亿（41B）
- **上下文窗口**：最高 100 万 token
- **训练数据**：45 万亿 token，涵盖文本、图像、音频和视频
- **能力**：支持文本、图像、音频的跨模态推理

Inkling 是 Thinking Machines Lab 不同规模模型家族中的首款产品。同时发布的 Inkling-Small 预览版激活参数量为 120 亿（12B），采用与 Inkling 相似的训练方法，以更低的成本和延迟实现出色性能。

## 与 Thinking Machines 交互模型的关系

Thinking Machines Lab 此前发布了 [交互模型（Interaction Models）](../ch04/248-thinking-machines-interaction-models.html)，专注于解决假实时问题（200ms 微轮次双向交换）。Inkling 是其基础模型层，与交互模型构成两层能力体系：Inkling 提供跨模态理解与推理，交互模型提供实时双向交互能力。

## 深度分析

### 架构设计：DeepSeek-V3 路线的继承与改进

Inkling 的 MoE 架构整体沿用了 DeepSeek-V3 的设计思路，每层包含 256 个路由专家和 2 个共享专家，每个 token 激活 6 个路由专家。关键改进在于采用基于 sigmoid 的路由机制配合无辅助损失的负载均衡偏置，而非传统 MoE 常用的 auxiliary loss 负载均衡。这种设计消除了辅助损失对主任务梯度的干扰，同时利用偏置项动态调节专家负载。在注意力机制上，Inkling 以 5:1 比例交替滑动窗口注意力层与全局注意力层，使用 8 个 KV 头，并采用相对位置嵌入替代 RoPE，以支持更长的序列外推。

### 训练策略：混合优化与大规模强化学习的结合

Inkling 的训练策略具有三个显著特征。第一，混合优化策略——大规模矩阵权重使用 Muon 优化器，其他参数使用 Adam，权重衰减强度与学习率的平方绑定，以维持权重整体规模的稳定。第二，后训练采用合成数据 SFT 启动（由 Kimi K2.5 等开放权重模型生成），再将绝大部分算力投入大规模异步强化学习，最终扩展到超过 3000 万次 rollout。第三，推理强度的可控设计——通过修改系统消息和调整每个 token 的成本，模型逐步学会在不同任务中选择不同的推理深度，在 Terminal Bench 上只需 Nemotron 3 Ultra 三分之一的 token 即可达到相同性能。

### 多模态的原生整合策略

Inkling 采用无编码器架构处理多模态输入：音频以 dMel 频谱图形式输入，图像划分为 40×40 像素块并通过四层 hMLP 编码。两类输入均经过轻量级嵌入层转换后与文本 token 统一处理。这种设计与 Thinking Machines Lab 的交互模型体系一致，使得 Inkling 能够作为交互模型的后台推理引擎，在语音、视觉、文本间无缝切换。在 VoiceBench、MMAU 和 AudioMC 等音频基准测试中，Inkling 跻身最强开放权重音频模型行列。

### 开放生态与定制化平台

Inkling 的开放权重策略不仅体现在模型权重下载（Hugging Face 提供原始检查点和 NVFP4 检查点），更体现在完整的定制化基础设施上。Tinker 平台提供了 Inkling Playground、微调 Cookbook 和 tml-renderer 工具链。与 Together AI、Fireworks、Modal、Databricks、Baseten 等 API 服务商合作，并适配了 SGLang、vLLM、llama.cpp 等主流推理框架。值得注意的是，Thinking Machines Lab 用 Inkling 自身参与微调流程——Inkling 通过 Tinker 编写微调任务、运行训练流程、评估最终结果，实现了自我迭代的闭环。

### 市场定位：非最强但最具定制潜力的开放权重模型

官方明确表示 Inkling 不是当前综合能力最强的模型。其核心价值在于多项特性的组合——多模态能力、高效推理（可控推理强度）、开放权重、Tinker 微调平台——使其成为最适合定制的开放权重基础模型。这种"均衡全面"的定位与 DeepSeek-V3 的"高性价比"路线不同，更强调模型的"可塑性"而非原始能力上限。Inkling-Small（276B 总参、12B 激活）进一步扩展了这一策略的覆盖范围，瞄准成本和延迟敏感的场景。

## 实践启示

1. **开放权重的差异化竞争路径**：Inkling 证明在闭源旗舰模型（GPT-5、Claude 4）和完全开源模型（Llama 4）之间，存在一个"开放权重 + 可定制"的中间地带。这一模式比完全开源更容易实现商业闭环（通过 Tinker 平台收费），同时避免闭源模型的信任壁垒。

2. **后训练 RL 的重要性远超预训练**：Inkling 的描述中，后训练阶段的大规模强化学习（3000 万次 rollout）是推理能力提升的核心驱动力。预训练只是提供了基础能力，真正的"智能涌现"发生在 RL 阶段。这与 Cognition SWE-1.7 训练中观察到的思维链压缩现象一致——单纯追求效率就推动了推理过程的优化。

3. **可控推理强度是实用化的关键能力**：Inkling 通过系统消息和 token 成本调节实现推理强度的动态控制，这一设计直接回应了"模型越强越贵"的工程困局。对于需要大规模部署（数百万次调用）或嵌入长流程工作流的场景，可控推理强度比原始能力上限更具实际价值。

4. **多模态不应是后加功能而应是原生架构决定**：Inkling 从预训练阶段就使用多模态数据（45T token 涵盖文本、图像、音频、视频），其无编码器架构确保了多模态交互的流畅性。这与"先做文本模型再加视觉模块"的路线有本质区别——原生多模态训练让模型能在不同模态间做联合推理，而不仅仅是分别处理。

5. **工具调用能力的泛化来自训练时的多样性**：Inkling 在训练时随机调整使用的工具集和工具定义，以降低对特定框架的依赖。这意味着 Agent 能力不能仅靠 benchmark 驱动（容易过拟合），而需要在训练阶段注入多样化的工具交互环境。

6. **开源权重模型的企业落地，平台生态比模型性能更重要**：Inkling 虽然性能不是最强，但通过 Tinker 平台、多框架适配、生态合作，大幅降低了企业定制和部署的门槛。对于技术选型者而言，评估开放权重模型的成熟度不应只看 benchmark，更要看其工具链完备性。

7. **自我迭代闭环是模型能力的放大器**：Inkling 通过 Tinker 编写微调任务、运行训练、评估结果——模型参与自身优化过程。这种"用 AI 改进 AI"的闭环一旦跑通，将形成持续的能力飞轮，而非一次性发布后的静止状态。

8. **小模型值得用大模型的训练策略**：Inkling-Small 与 Inkling 使用相同的可扩展后训练技术栈，结果小模型在推理和 Agent 任务上接近大模型。这意味着针对小模型优化预训练数据和训练方案，配合与大模型相同的 RL 策略，可以大幅缩小大小模型的能力差距。

## 行业背景

Thinking Machines Lab（估值约 500 亿美元）由前 OpenAI CTO Mira Murati、OpenAI 强化学习核心人物 John Schulman 以及 PyTorch 创始人 Soumith Chintala 联合创立。参见 [Neolab 浪潮分析](../ch05/088-ai.html)。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/thinking-machines-inkling-975b-moe-open-weights-2026.md)

---

