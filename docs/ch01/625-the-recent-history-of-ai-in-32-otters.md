# The recent history of AI in 32 otters

## Ch01.625 The recent history of AI in 32 otters

> 📊 Level ⭐⭐ | 7.2KB | `entities/the-recent-history-of-ai-in-32-otters.md`

# The Recent History of AI in 32 Otters

## 摘要

Ethan Mollick（沃顿商学院教授）用一个简单而巧妙的基准测试——"otter on a plane using wifi"——追踪了 AI 图像生成从 2021 年到 2025 年的演进历程。这个偶然的测试揭示了 AI 发展的三个关键趋势：多种类型 AI 工具的涌现、能力的快速提升、以及开源/本地模型的追赶速度。从 VQGAN+CLIP 的抽象色块到 Midjourney 的照片级写实，从扩散模型到多模态直接生成，从闭源垄断到本地 GPU 可运行的开源模型，三年间的变化堪称翻天覆地。

## 核心要点

### 三种图像生成技术路线

| 技术路线 | 代表产品 | 工作原理 | 优势 | 局限 |
|----------|----------|----------|------|------|
| **扩散模型** | Midjourney, Flux, Imagen | 从随机噪声逐步去噪，同时变换整张图像 | 风格多样，照片级写实 | 结果随机，需多次尝试 |
| **多模态直接生成** | GPT-4o 图像生成, Gemini | LLM 逐像素/逐 patch 生成，如同逐词生成文本 | 精确控制，可迭代修改 | 目前无开源版本 |
| **代码生成图像** | LLM + TikZ | AI 用数学代码描述图像，无视觉反馈 | 测试空间推理能力 | 生成质量较低 |

### 扩散模型的演进时间线（Midjourney "otter on a plane using wifi"）

- **2022 年初**：融化般的色块，无法辨认
- **2022 年末**：可辨认的水獭，但手指过多、键盘怪异
- **2023 年**：照片级写实的水獭，但键盘和机窗仍有问题
- **2024 年**：光照和构图显著改善
- **2025 年**：优秀的照片级写实效果

### 多模态生成的范式转变

2025 年 OpenAI 和 Google 推出的多模态图像生成是根本性的技术转变：LLM 不再调用外部扩散模型，而是直接以「逐 patch 添加颜色」的方式生成图像——就像逐词生成文本一样。这给了 AI 对图像的深度控制能力。

关键能力差异：
- 扩散模型：「otter on a plane」→ 随机生成，可能是河獭或海獭
- 多模态生成：「make it a sea otter, give it a mohawk, use a Razer gaming laptop」→ 精确执行修改

### TikZ 代码绘图：测试空间推理

TikZ 是学术论文中用于绘制科学图表的数学语言（德语缩写，意为「TikZ 不是绘图程序」）。用 TikZ 画图几乎没有训练数据可供参考，AI 必须从零推理空间关系。

- **GPT-4（2023）**：画出了一只粉色独角兽，被「Sparks of AGI」论文视为 AGI 萌芽的证据
- **Gemini 2.5 Pro（2025）**：画出了相当不错的水獭（虽然把「on a plane」理解成了坐在机翼上）
- **DeepSeek r1（2025）**：开源模型，质量接近但略逊于闭源模型

这些绘图本身不重要，重要的是模型在没有视觉反馈的情况下推理空间关系——这是从「模式匹配」走向「真正理解」的证据。

### 视频生成的加速

- **2024 年 7 月**（Runway Gen-3 alpha）：粗糙、不连贯
- **2025 年**（Google Veo 3）：逼真视频 + AI 生成音效，不到一年的飞跃
- **本地开源**（腾讯 HunyuanVideo）：质量落后但可在家庭 GPU 上运行

## 深度分析

### 「水獭基准」的方法论价值

Mollick 的「水獭测试」之所以有效，在于它满足了好基准的三个条件：

1. **固定输入、可比输出**：同一提示词跨时间对比，消除了提示工程的干扰
2. **足够的复杂度**：「飞机上用 wifi 的水獭」涉及动物解剖、室内场景、电子设备、透视关系等多个维度
3. **人类可直观评判**：不需要量化指标，肉眼就能看出进步

这比大多数学术基准（FID、CLIP Score 等）更直观，也更能反映普通用户的真实体验。

### 开源模型的追赶速度

文章揭示的一个关键趋势：开源/本地模型通常只落后闭源前沿 **数月而非数年**。

| 领域 | 闭源前沿 | 开源追赶者 | 差距 |
|------|----------|-----------|------|
| 图像生成 | Midjourney v6 | Flux (本地 GPU) | 数月 |
| 视频生成 | Veo 3 | HunyuanVideo | ~1 年 |
| 代码绘图 | Gemini 2.5 Pro | DeepSeek r1 | 数月 |
| 多模态生成 | GPT-4o | 暂无 | 待追赶 |

这意味着任何基于闭源模型构建的竞争优势都是短暂的。监管框架也面临挑战——当能力在数月内扩散到开源社区时，基于模型访问的管控手段将迅速失效。

### 「无法分辨真假」的临界点

Mollick 的核心判断：我们正在逼近一个临界点——AI 生成的图像和视频将「好到足以欺骗大多数人」，且这些能力将通过开源模型广泛传播、难以监管。从 2022 年的抽象色块到 2025 年的逼真视频，仅用了不到三年。这一趋势对新闻真实性、法庭证据、娱乐产业的信任基础都将产生深远影响。

### 与「Sparks of AGI」论文的对话

2023 年微软研究院的「Sparks of AGI」论文以 GPT-4 画独角兽为证据之一，论证 LLM 可能具有某种「火花」。Mollick 用 2025 年的模型重做了这个测试——从勉强可辨的独角兽到相当不错的水獭——暗示如果 2023 年的独角兽算「火花」，那 2025 年的进步可能已经是「火焰」了。

## 实践启示

1. **不要押注单一技术路线**：扩散模型、多模态生成、代码绘图各有优势。在实际应用中应根据需求选择——需要风格多样性用扩散模型，需要精确控制用多模态生成，需要可复现的结构化输出用代码生成。
2. **开源模型是真实的替代选项**：对于图像生成等任务，本地运行的 Flux 已接近 Midjourney 水平。在成本敏感或隐私要求高的场景，开源模型值得认真评估。
3. **「水獭基准」思维**：在评估 AI 工具时，建立自己的固定测试集比依赖排行榜更有价值。选择 3-5 个有代表性的任务，定期用同一提示测试，追踪真实进步。
4. **为「无法分辨真假」的世界做准备**：内容认证（C2PA 等）、来源验证、媒体素养教育将成为基础设施级需求。
5. **视频生成是下一个爆发点**：从 2024 到 2025 的进步幅度远超预期。如果这一速度持续，2026 年的 AI 视频可能达到电影级质量。

## 相关实体

- [Karpathy: Vibe Coding to Agentic Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/karpathy-vibe-coding-agentic-engineering.md)
- [Ethan He Cosmos Grok Imagine Latent Space Video Agent 20260606](https://github.com/QianJinGuo/wiki/blob/main/entities/ethan-he-cosmos-grok-imagine-latent-space-video-agent-20260606.md)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/karpathy-最新访谈从-vibe-coding-到-agentic-engineering.md)
- [OLMo Hybrid LLM Architectures](https://github.com/QianJinGuo/wiki/blob/main/entities/olmo-hybrid-and-future-llm-architectures.md)
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/the-recent-history-of-ai-in-32-otters.md)

---

