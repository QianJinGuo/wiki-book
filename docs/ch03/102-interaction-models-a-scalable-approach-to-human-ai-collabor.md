# Interaction Models: A Scalable Approach to Human-AI Collaboration

## Ch03.102 Interaction Models: A Scalable Approach to Human-AI Collaboration

> 📊 Level ⭐⭐ | 7.1KB | `entities/interaction-models.md`

# Interaction Models: 从回合制到实时协作的人机交互范式转变

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/interaction-models.md)

## 摘要

Thinking Machines Lab 发布了交互模型（Interaction Models）的研究预览——一种将交互能力内置于模型本身而非外部脚手架的新型 AI 架构。核心创新是"时间对齐的微回合"（time-aligned micro-turns）设计：模型以 200ms 为单位持续交错处理输入和生成输出，实现音频、视频、文本的全双工实时交互。其 TML-Interaction-Small 模型（276B MoE，12B active）在 FD-bench 交互质量基准上大幅领先 GPT Realtime 和 Gemini Live。

## 核心要点

- **交互不应是事后考虑**：AI 实验室过度追求自主能力，忽略了人类在循环中（human-in-the-loop）的协作价值
- **时间对齐微回合**：200ms 块交错处理输入/输出，消除人工回合边界，实现真正的全双工交互
- **无编码器早期融合**：音频直接以 dMel 输入，图像以 40×40 patch 编码，与 Transformer 联合训练，避免独立编码器的延迟开销
- **交互模型 + 后台模型的双层架构**：交互模型负责实时响应，后台模型异步处理深度推理和工具调用，两者共享上下文
- **视觉主动性**：模型可根据视觉变化主动发言（如数数、计时），这是现有商业 API 不具备的能力
- **FD-bench V1.5 平均分 77.8**（GPT Realtime-2.0 为 46.8），轮次延迟 0.40s（GPT Realtime-2.0 为 1.18s）

## 深度分析

### 当前 AI 交互的瓶颈：回合制限制

现有商业 AI 模型（GPT Realtime、Gemini Live 等）采用回合制交互：用户说完之前模型等待，模型生成期间感知冻结。这创造了一个"窄通道"——人类的知识、意图和判断无法充分传递给模型，模型的工作也无法被人类实时理解。正如 Thinking Machines 引用的比喻："想象试图通过电子邮件解决一场关键分歧，而不是面对面交流。"

Anthropic 的模型卡也承认了这一点："当以交互式、同步的'键盘上手'模式使用时，模型的优势不太明显。自主运行的 agent harness 更能发挥模型的编码能力。"但 Thinking Machines 指出，大多数真实工作中，用户无法预先完全指定需求然后走开——好的结果需要协作过程。

### 微回合架构的技术创新

交互模型的核心技术设计包括：

**时间对齐微回合**：输入和输出被分割为 200ms 的块，持续交错处理。与传统回合制模型看到的"交替 token 序列"不同，交互模型看到的是"连续微回合流"——沉默、重叠和中断都是模型上下文的一部分。这消除了对语音活动检测（VAD）等外部组件的需求。

**无编码器早期融合**：许多全模态模型需要独立的编码器（如 Whisper 式 ASR）或解码器（如 TTS 模型）。TML-Interaction-Small 直接接收音频信号作为 dMel，通过轻量级嵌入层变换；图像被分割为 40×40 patch 并通过 hMLP 编码；音频解码使用 flow head。所有组件与 Transformer 从头联合训练。

**流式会话推理优化**：200ms 块需要频繁的小 prefill 和 decode，每次都要满足严格延迟约束。团队实现了"流式会话"——客户端将每个 200ms 块作为独立请求发送，推理服务器将这些块追加到 GPU 内存中的持久序列中，避免频繁的内存重分配和元数据计算。该优化已上游贡献到 SGLang。

**训练器-采样器比特对齐**：团队实现了批不变内核（batch-invariant kernels），确保训练和推理的比特级一致性。All-reduce 和 reduce-scatter 使用 NVLS 实现低延迟通信内核，注意力机制通过一致的累积顺序实现 decode 和 prefill 之间的对齐。

### 双层架构：实时响应 + 深度推理

系统架构分为两层：
1. **交互模型**：持续与用户交换——感知、响应、处理中断、管理对话状态
2. **后台模型**：异步执行深度推理、工具调用、长时间任务

当任务需要超出即时处理能力的深度推理时，交互模型将富上下文包（完整对话历史，而非独立查询）委托给后台模型。结果流式返回后，交互模型在合适的时机将更新交织到对话中，而非突然切换上下文。这种设计让用户同时获得**响应速度**（非思考模型的延迟）和**智能深度**（推理模型的规划和工具使用能力）。

### 新交互维度的基准测试

Thinking Machines 提出了现有基准无法覆盖的新能力维度：

| 能力 | 基准 | TML-Interaction-Small | GPT Realtime-2.0 (minimal) |
|------|------|----------------------|---------------------------|
| 时间感知 | TimeSpeak | 有显著能力 | 无能力 |
| 语音同步 | CueSpeak | 有显著能力 | 无能力 |
| 视觉计数 | RepCount-A | 有显著能力 | 无能力 |
| 视觉主动 | ProactiveVideoQA | 有显著能力 | 无能力 |
| 视觉定位 | Charades mIoU | 有显著能力 | 无能力 |

**没有任何现有商业模型能有意义地执行这些任务。** 它们保持沉默或给出错误答案。

### 与回合制范式的根本差异

| 维度 | 回合制模型 | 交互模型 |
|------|----------|---------|
| 时间感知 | 无 | 直接感知经过时间 |
| 中断处理 | 需外部 VAD 组件 | 模型原生支持 |
| 并发语音 | 不支持 | 支持（如同声传译） |
| 视觉主动 | 不支持 | 可根据视觉变化主动发言 |
| 工具调用 | 与交互串行 | 与交互并行 |

## 实践启示

- **AI 产品设计**：交互模型范式表明，"人机协作"不应是外部脚手架的功能，而应是模型的核心能力；产品设计应围绕实时协作而非回合制对话
- **语音 AI 开发者**：关注 Thinking Machines 的 SGLang 流式会话优化贡献，这对低延迟语音 AI 推理有直接价值
- **安全团队**：实时交互对安全提出了新挑战——模态适当的拒绝和长对话鲁棒性需要专门的训练策略（文本转语音生成拒绝数据、自动红队测试多轮拒绝）
- **研究者**：交互质量评估是一个被严重忽视的领域——FD-bench 是少数现有基准之一，Thinking Machines 正在发起研究资助鼓励更多相关研究
- **企业 AI 架构师**：双层架构（实时交互 + 异步后台）的模式可应用于企业级 AI 助手——前台实时响应用户，后台处理复杂分析和工具调用

## 相关实体

- [Thinking Machines 交互模型](../ch04/248-thinking-machines-interaction-models.html)
- [Interaction Models: A Scalable Approach to Human-AI Collaboration](../ch05/086-ai.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/interaction-models.md)

---

