## Ch17.003 Xiaomi Dasheng — 通用声音基座模型 5 阶段工程实践

> 📊 Level ⭐⭐ | 17.2KB | `entities/xiaomi-dasheng-audio-foundation-model-2026.md`

## 概述

**Xiaomi Dasheng** 是小米发布的**通用声音基座模型**——让一个模型同时听懂**语音、环境声和音乐**。从一台 **8 卡机器**起步，经过 **MAE 预训练 → 大规模数据工程 → 6 维标注语义拓展 → DashengTokenizer 理解+生成统一** 五个阶段，把音频领域从"语音 / 声音 / 音乐三套独立模型"推进到"通用声音基座 + 通用描述 + 统一架构"。

**核心数字**：300T 原始数据 / 146 包 / 1 年搬运 / 1 机 8 卡训练 / Base 86M (78.88) → 1.2B (**81.25**) / 音频标记**首次突破 AudioSet 50+ mAP** / MiDashengLM **22 SOTA** / TTFT **1/4** / 吞吐 **20x**。 ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]

## 核心洞察：3 个反直觉判断

### 1. 增量优化 vs 底层重建 = 方向差异，非程度差异

> **增量优化和底层重建不是程度的差异，是方向的差异。**
> ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]
> 预研的价值之一，是帮团队识别**什么时候该换方向**。

**实证**：已有的语音识别路径在特定任务上做增量优化，可以做到极致，但**做不到通用声音理解**——必须从底层重建。 ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]

### 2. 更高的训练损失 = 更丰富的学习信号

| 训练任务 | 损失 | 学习信号 |
|---------|------|----------|
| **ASR 训练** | 低 | "从左到右"简单映射，**学到的东西可能比较有限** |
| **通用音频描述** | **高** | 融合语音摘要 / 环境声描述 / 音乐描述，**需要理解更复杂的语义** |

> **在通用音频理解中，更高的训练损失可能意味着更丰富的学习信号。**
> ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]
> 损失值本身不说明全部问题，**损失在度量什么可能更值得关注**。

### 3. 挑战行业假设是为了搞清楚它的边界

> **挑战行业假设不是为了推翻它，而是为了搞清楚它的边界在哪里。**
> ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]
> DashengTokenizer 的价值不是否定了 VAE，**而是证明了 VAE 不是唯一解**。

## 5 阶段技术栈

### 阶段 1：MAE（掩码自编码）预训练

**关键决策**：选择 Meta 的 MAE 框架（视觉领域 → 音频迁移），而非在已有语音识别路径做增量改进。 ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]

| 维度 | MAE 思路 |
|------|----------|
| **原理** | 把音频频谱部分遮掉，让模型**补全被遮挡区域** |
| **优势** | 模型被迫学习**声音的本质结构**，而非特定任务的表面特征 |
| **结果** | 通用声音表征，**不针对任何单任务优化** |

**判别式 vs 生成式编码器**（GLAP 实验）： ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]

| 编码器类型 | 语音 | 声音 | 音乐 |
|-----------|------|------|------|
| **判别式**（CED / Beats） | 偏科 | ✅ | ✅ |
| **生成式**（Xiaomi Dasheng） | ✅ | ✅ | ✅ |

> **判别式编码器针对特定任务优化，遇到语音就"偏科"**；**生成式编码器通过"补全被遮挡的频谱"学到更本质的音频结构，三大领域都能兼顾**。

### 阶段 2：大规模数据工程

#### 工程挑战

| 维度 | 数据 |
|------|------|
| **原始数据量** | **~300T**（几百万小时） |
| **存储** | 严重不足 |
| **分包** | **146 个包**（语音/音乐/环境声/机械噪声） |
| **搬运方式** | 多机错峰下载上传 |
| **搬运周期** | **~1 年** |
| **训练资源** | **1 机 8 卡**完成 Base → 1.2B 全部训练 |

#### 视频-音频同步筛选

**用视觉信号校验音频语义有效性**（画面中出现狗的同时有狗叫声 = 语义有效）。原始数据**无监督、无标注**，通过同步信号**伪标注**。 ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]

#### 规模扩展的实证收益

**HEAR 基准**： ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]

| 模型规模 | 参数量 | 性能 |
|---------|--------|------|
| Base | 86M | 78.88 |
| 1.2B | 1.2B | **81.25** |

**训练数据扩量（AudioSet 5K → 27 万小时）**： ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]

| 模型规模 | 额外提升 |
|---------|---------|
| 小 | +6.37 pp |
| 中 | +8.69 pp |
| 大 | +8.45 pp |

#### 失败教训：盲目扩量

> 团队曾把训练数据集扩容至原有 **10 倍**体量，**结果出乎意料：AudioSet 公开测试集指标不升反降，切回业务场景实测效果同样变差**。

**关键认知**： ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]
- 开源基准指标和实际业务指标**高度正相关**
- **盲目扩量是无效的，音频数据的质量优先级远大于单纯的数据体量**

#### 业务落地

- **音频标记算法首次突破 AudioSet 50+ mAP**
- Mini 版 **49.0 mAP**，参数量仅同类 **1/10**
- **CED（Consistent Ensemble Distillation）**：从大型教师模型集成蒸馏出小模型
- **部署到小米终端设备**

### 阶段 3：6 维标注 + 通用音频描述

#### 行业常规做法的局限

用 ASR 转录做音频-文本对齐，**只能理解"人说了什么"**，丢弃环境声 / 音乐 / 情感 / 空间混响等信息。 ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]

**ACAV100M 数据集上损失高达 90% 潜在有用数据**——等同花了大量精力去"听懂"万物，最后在对齐环节又把大部分信息扔掉。 ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]

#### 关键突破：通用音频描述对齐

**用多专家分析管道做细粒度标注**（2 秒粒度），再通过大模型合成统一描述。 ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]

#### 6 维度 Caption（ACAVCaps）

| # | 维度 | 标注内容 |
|---|------|----------|
| 1 | **语音内容** | 人说了什么 |
| 2 | **说话人情绪** | 情感状态 |
| 3 | **背景声音** | 环境声 |
| 4 | **音乐** | 音乐元素 |
| 5 | **场景环境** | 空间信息 |
| 6 | **音频类型** | 类别 |

配套 **MECAT Benchmark**，**全部开源**。 ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]

#### 反直觉的成功

> 拆分 6 个维度做细粒度标注，**一开始大家都不看好**，认为多维度信息冗余。
> ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]
> 但后续做音频生成实验时发现，**六维精细化标注恰恰是模型生成真实声场音频的关键**。

#### 业务结果

- **MiDashengLM 在 22 个公开评测集上取得 SOTA**
- **TTFT 仅为业界先进模型的 1/4**
- 同等显存下**吞吐效率是其 20 倍以上**
- **0.6B 轻量版本**：支持 **CPU 部署 + 浏览器 WebAssembly 运行**
- 从云端到边缘设备全覆盖
- **数据 + 模型 + 代码 全部开源**

### 阶段 4：DashengTokenizer — 理解 + 生成统一

#### 行业困境

- 行业通行做法：**声学编码器做理解 + 声学解码器做生成，两者独立**
- **两倍计算资源 + 两倍部署成本**
- 难以在同一个模型中同时做理解和生成

#### 行业假设

> 传统生成模型理论有一个常见假设：**高维度特征不太适合直接用于生成**。**这个假设在相当长的时间里被广泛接受**。

#### 突破

> 我们通过**冻结 Dasheng 的语义特征，仅注入声学信息，用一层结构就实现了理解和生成的统一**。

#### 业务结果

- **在 22 个任务上，DashengTokenizer 显著超越了此前使用的音频编码器和音频编解码器**
- **文本到音频 / 文本到音乐 / 语音增强任务**全面超越标准 VAE 方法
- **VAE 架构不再是音频合成的必要条件**

### 阶段 5：DashengAudioGen（进行中）

让生成的声音**更贴近真实场景**——**带环境音、背景噪声、回声和远近感的完整声学场景**。 ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]

- 详情：https://nieeim.github.io/Dasheng-AudioGen-Web/
- 代码：https://github.com/xiaomi-research/dasheng-audiogen

## 关键数字汇总

| 指标 | 数值 | 备注 |
|------|------|------|
| 原始音频数据 | **~300T** | 几百万小时 |
| 数据包数 | **146 个** | |
| 数据搬运周期 | **~1 年** | 多机错峰 |
| 训练硬件 | **1 机 8 卡** | Base → 1.2B 全部 |
| HEAR Base 性能 | 78.88 | 86M |
| HEAR 1.2B 性能 | **81.25** | |
| 数据扩量提升 | **+6-8 pp** | AudioSet 5K → 27 万小时 |
| AudioSet 首次突破 | **50+ mAP** | 音频标记 |
| Mini 模型 mAP | 49.0 | 同类 1/10 参数 |
| ACAV100M 损失 | **90%** | ASR 对齐 |
| MiDashengLM SOTA | **22** 个评测集 | |
| MiDashengLM TTFT | 业界 **1/4** | |
| MiDashengLM 吞吐 | 同等显存下 **20x** | |
| 轻量版本 | **0.6B** | CPU + WebAssembly |

## 深度分析

### 1. "方向差异" vs "程度差异" 是预研决策的关键

大多数团队倾向于在已有路径上做增量优化（"再加点数据" / "再调调超参"），因为**风险更小、可解释性更高**。 ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]

但 Xiaom Dasheng 团队的判断是：**当优化走到极致，不应该继续加码，而是得换一条路重新出发**。这种"换方向"决策需要： ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]

- **对行业假设的清晰理解**（"已有路径的优化边界在哪"）
- **对替代方案的深度预研**（"MAE 在视觉的成熟经验能否迁移到音频"）
- **对失败成本的容忍**（"8 卡 1 年投入 = 可接受的失败成本"）

### 2. "数据质量 > 数据体量" 的音频领域实证

与 NLP / CV 领域的 scaling law 不同，**音频领域的盲目扩量可能反降**： ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]

- 公开视频 80-90% 含人声，**纯粹的环境声 / 音乐稀缺**
- 10 倍数据扩充**反而让模型变差**
- **视频-音频同步伪标注**是质量筛选的关键

这与 LFD（Loss Function Development）的 "eval 大小优先于答案可见性" 是不同维度的质量哲学——但**都强调质量 > 体量**。 ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]

### 3. "通用描述 > ASR 对齐" 是音频对齐范式转变

传统音频-文本对齐 = **ASR 转录**（只能对齐"说了什么"，丢弃 90% 潜在有用信息）。 ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]

Xiaomi Dasheng 的 6 维 caption = **多专家分析管道** + **大模型合成统一描述**（对齐"声学场景全貌"）。 ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]

**这种范式转变的代价**：训练损失更高（因为任务更复杂）。但**更高的损失 = 更丰富的学习信号**。 ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]

### 4. "高维特征不适合直接生成" 的假设被证伪

行业通行假设：生成模型需要**压缩到低维隐空间**（VAE 哲学），高维特征信息"散"、解码器难以利用。 ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]

DashengTokenizer 通过**冻结语义特征 + 仅注入声学信息**，证明**高维特征可以直接用于生成**。这一突破**解放了音频合成对 VAE 架构的依赖**。 ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]

### 5. 6 维 caption 的"意外"价值印证预研容忍度

> **预研中被质疑最多的方向，有时恰恰是最有价值的。**
> ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]
> 6 维标注从"没人看好"到"成为关键"，说明预研团队需要**容忍一定程度的"低效探索"**。

这是 Xiaomi Dasheng 团队最值得借鉴的方法论：**当某个方向不被人看好时，先小规模验证再判断**——而不是直接放弃或被共识压倒。 ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]

## 实践启示

### 何时考虑自建通用基座

- 领域缺乏通用预训练方法（**音频、视频、3D、触觉等**）
- 现有单任务模型之间**互不通用**（语音 ASR 做不到声音分类）
- 有**可承担失败的算力预算**（Dasheng 起步 1 机 8 卡 = 中等门槛）
- 团队能容忍**"低效探索"**（不追求每步都成功）

### 自建基座的工程清单

1. **预研阶段**：先识别现有路径的优化边界，再决定是否换方向 ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]
2. **数据工程**：先质量后体量；用**多模态同步信号**做伪标注 ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]
3. **模型选择**：参考**其他领域的成熟方法**（MAE 从视觉迁移到音频） ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]
4. **规模扩展**：在**小规模验证有效**后再扩量（避免盲目 scaling） ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]
5. **语义对齐**：用**多专家 + 大模型合成**做细粒度 caption，而非单一 ASR ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]
6. **架构统一**：探索**理解+生成统一模型**，挑战 VAE 类架构假设 ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]
7. **开源验证**：开源基准上验证是预研最诚实的信号 ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]

### DashengAudioGen 的下一步

> 让生成的声音**更贴近真实场景**——**带环境音、背景噪声、回声和远近感的完整声学场景**。

这与 Snowflake 的"Artifacts = 持续更新的受治理视图"是不同维度的"真实感"——DashengAudioGen 关注**听觉真实感**，Snowflake 关注**数据真实感**。 ^["[Xiaomi Dasheng：8卡起步的 AI 工程实践](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)"]

## 相关实体

- [面向电商直播场景的全模态大模型推理加速方案](ch01-845-vera-arrives-nvidia-s-first-cpu-built-for-agents-lands-at-t.html)（多模态推理加速对照）
- [Cvpr 2026 Highlight 让Ai像电影人一样 看 视频 8B小模型反超Gpt 5与Gemini 3 1 Pro](ch01-438-cvpr-2026-highlight-让ai像电影人一样-看-视频-8b小模型反超gpt-5与gemini-3-1-p.html)（视频 8B 反超同主题 — 多模态 8B 起步）
- [A2Rd Agentic Autoregressive Diffusion Long Video](ch04-410-ai-agent.html)（多模态生成对照）
- [Openai Realtime Api Architecture](ch01-084-openai-realtime-api-架构首次公开.html)（OpenAI Realtime API — 实时语音对照）
- [刚刚Openai 放出三个语音模型顺便杀死了同传](ch01-346-yc-ai-agent-1-1.html)（OpenAI 语音模型同主题）
- [Gpt 5级推理能力塞进语音模型Openai把同传翻译成本砍穿地板价](ch01-514-llm-thonking.html)（OpenAI GPT-5 语音同主题）
- [Amazon Bedrock Model Inference Serverless Architecture Case Study](ch11-067-amazon-bedrock-model-inference-serverless-architecture-case.html)（Bedrock 多模态推理对照）
- [Nvidia Nemotron 3 Agents Rag Voice Safety](ch04-043-nvidia-nemotron-3-agents-rag-voice-safety.html)（Nemotron 语音 + 智能体对照）
- [Snowflake Agentic Enterprise Summit 2026](ch04-057-ai-native-git.html)（Snowflake 真实感场景对照）
- [Loss Function Development Elvis Sun Goal Loop 2026](ch05-073-loss-function-development-lfd-损失函数开发与-goal-循环-elvis-sun.html)（LFD 质量 > 体量同源思想）

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/xiaomi-dasheng-audio-foundation-model-8gpu.md)

---
