# Mollick AI 进展的 32 只水獭基准

## Ch01.567 Mollick AI 进展的 32 只水獭基准

> 📊 Level ⭐⭐ | 8.1KB | `entities/mollick-ai-32-otters-benchmark.md`

# Mollick AI 进展的 32 只水獭基准

> **Background**：本文基于 Ethan Mollick 在 One Useful Thing 发表的「The recent history of AI in 32 otters」一文，整理其「水獭坐飞机用 WiFi」4 年视觉对比方法论以及对 AI 进展的三条总体观察。

## 三个核心观察

### 1. 多模态工具类型爆发

AI 不再是单一「聊天机器人」概念，而是分化为四类：图像生成、视频生成、LLM 文本/代码、本地/开源模型。这四类各有不同的能力曲线和局限。

### 2. 改进速度惊人

2021 年的 VQGAN+CLIP 产出「融化毛皮」，2022 年底出现可识别水獭（手指畸变 + 键盘错位），2023 年光影真实化，2024 年镜头/光线更自然，2025 年达到优秀写实主义。

### 3. 本地与开源模型已具备实用能力

2025 年开源/本地模型（如 Llama、SDXL、Flux 衍生）已能在多数任务上与闭源顶级模型竞争，标志本地化 AI 实用化。

## 水獭基准（Otter Benchmark）方法论

- 简单性：「otter on a plane using wifi」一句话即覆盖：物体识别 + 场景组合 + 物理合理 + 文本渲染能力。
- 可重复：Midjourney 公开 top of week，任何人都能验证历史快照。
- 跨模态：同一 prompt 可在图像、视频、LLM 文本上重复使用。
- 长期跟踪：从 2021 到 2025 共 4 年数据点，可视化 AI 整体跃迁。

## 与其他 Mollick 作品的关系

> [!note]
> 以下关联实体（`oneusefulthing-claude-code-what-comes-next`、`gpt5-just-does-stuff-mollick`、`jagged-ai-frontier-mollick`、`mass-intelligence`）经验证尚不存在于本 wiki 中，链接为占位符，待后续创建。

- `[Oneusefulthing Claude Code What Comes Next](../ch03/075-claude-code.html)` — Mollick 早期对 Claude Code 实战评估（实体待建）
- `[Gpt5 Just Does Stuff Mollick](https://github.com/QianJinGuo/wiki/blob/main/entities/gpt5-just-does-stuff-mollick.md)` — Mollick 对 GPT-5 自主性的判断（实体待建）
- `[Jagged Ai Frontier Mollick](../ch05/081-ai.html)` — Mollick 锯齿前沿理论（实体待建）
- `[Mass Intelligence](ch01/542-mass-intelligence-ai.html)` — 群体智能边界（实体待建）

## 相关实体

- [fusedash -  generative analytics platform | ai dashboard sof](ch01/391-fusedash-generative-analytics-platform-ai-dashboard-sof.html)
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/the-recent-history-of-ai-in-32-otters.md)

## 深度分析

### 1. 扩散模型与多模态生成代表两种截然不同的技术范式

扩散模型（如 Midjourney 使用的）从随机噪声出发，通过数十个步骤同时精炼整个图像，类似于从大理石块逐步雕刻雕像。而多模态图像生成（如 OpenAI、Google 的新模型）让 LLM 直接逐块添加色彩，类似于逐词生成文本的方式。这种范式转变意味着多模态模型对图像拥有更深层次的端到端控制，而非依赖外部扩散模型作为黑盒工具。

### 2. 开源模型追赶闭源模型的速度远超预期

Mollick 的个人电脑跑 Flux 生成的图像质量已接近顶级闭源模型，Tencent 的 HunyuanVideo 能在本地运行并生成视频。这表明开源/本地模型已跨越「能用」的门槛，在多数任务上具备与闭源顶级模型竞争的能力。开源模型的迭代周期通常只落后闭源模型几个月，AI 能力民主化正在加速。

### 3. AI 生成内容以假乱真的时间线被严重低估

从 2022 年「融化毛皮」到 2025 年具备音效的真实感视频，同一文本 prompt 产生可信视频的时间不到三年。这个速度远快于大多数分析师的预测，意味着社会需要更快适应一个「无法辨认真假图像与视频」的世界。

### 4. 代码绘制测试揭示空间推理的「火花」

用 TikZ（一种不适于绘图的数学语言）测试 AI 时，GPT-4 绘制的独角兽曾被视为 AGI「火花」的证据。后续模型（如 Gemini 2.5 Pro）在这类无先验知识的任务上表现更佳，表明模型在从头推理空间关系，而非仅从训练数据中重组模式。这对理解当前 AI 的真实能力边界有重要意义。

### 5. 多模态工具类型已高度分化且各有明确用途

AI 已分化为四大类：图像生成（Midjourney/Flux）、视频生成（Runway/Veo 3）、LLM 文本/代码、及本地/开源模型。Mollick 明确指出他会根据目标选择不同工具——追求视觉冲击时用 Midjourney，追求精确控制时用多模态生成器。这种分化意味着不存在「全能最佳」工具，专业使用者需要理解各模态的能力边界。

## 实践启示

### 1. 建立简单、可重复的基准来持续跟踪 AI 能力

「水獭坐飞机用 WiFi」这个看似随意的 prompt，验证了简单性是长期跟踪 AI 进展的关键。一个好基准应该满足：简单描述、可跨模态重复、有历史数据点可对比。建议个人或团队建立类似的生活化基准，定期重新测试以直观感受 AI 能力的跃迁。

### 2. 关注开源模型进展，考虑本地部署的可行性

Flux 在家用 PC 上生成接近顶级闭源模型质量的图像，标志本地 AI 实用化已成熟。对于有数据隐私要求或需要控制成本的使用场景，开源模型的本地部署是可行选择。建议评估工作流中哪些环节可切换到开源本地模型。

### 3. 为「AI 生成内容无法辨识」做好准备

Mollick 预测我们正走向「无法辨认真实与 AI 生成图像和视频」的世界，这对社会信任、媒体、娱乐产业有深远影响。建议现在开始：建立组织内的内容真实性协议、关注图像/视频鉴定技术、重新评估依赖视觉内容的相关业务流程。

### 4. 根据任务目标选择正确的多模态工具

Mollick 明确区分了两类工具的使用场景：Midjourney 等扩散模型适合追求视觉冲击、愿意多轮随机尝试的场景；多模态生成器（如 Gemini、OpenAI 的新模型）适合需要精确控制、确定性输出的场景。理解工具特性才能用对场景。

### 5. 用「无先验知识的任务」测试 AI 真实理解能力

TikZ 绘图测试之所以有意义，是因为该领域训练数据极少，AI 无法依赖记忆必须真正推理。对于需要评估 AI 是否具有真实理解的场景，可以设计类似「低训练数据覆盖」的任务——让 AI 在没有模式可匹配的情况下解决问题，以区分真实推理与训练数据重组。

---

