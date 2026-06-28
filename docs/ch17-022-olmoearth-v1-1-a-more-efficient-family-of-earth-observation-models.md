## Ch17.022 OlmoEarth v1.1: A more efficient family of Earth observation models

> 📊 Level ⭐⭐⭐ | 8.1KB | `entities/olmoearth-v1-1-a-more-efficient-family-of-earth-observation-models.md`

## 概述

OlmoEarth v1.1 是 AllenAI 于 2026 年 5 月 19 日发布的地球观测模型家族，是 2025 年 11 月发布的 OlmoEarth v1 的升级版本。该版本在保持 v1 性能水平的前提下，将计算成本降低至多 **3 倍**，显著提升了模型的经济性和可部署性。

OlmoEarth 已被广泛应用于追踪红树林变化（mangrove change tracking）、分类森林损失驱动因素（classifying drivers of forest loss）、制作国家级作物类型地图（country-scale crop-type maps）等任务，部署范围覆盖国家、洲际乃至全球尺度。

## 技术架构

OlmoEarth 模型基于 Transformer 架构，处理遥感数据时需先将数据转换为模型可摄入的 token 序列。在 Transformer 模型中，**模型大小**和 **token 序列长度** 是控制效率的两个关键杠杆：模型大小决定每次计算的资源消耗，而 token 序列长度则决定计算的复杂度——由于 self-attention 的二次复杂度，序列长度的微小减少都能显著降低推理成本。

### Sentinel-2 数据处理

Sentinel-2 是 OlmoEarth 处理的常见遥感数据模态。Sentinel-2 输入张量包含空间维度（H × W，表示纬度和经度像素）、时间维度 T 以及 12 个 Sentinel-2 波段通道 [H, W, T, D=12]。Sentinel-2 数据具有 10m、20m、60m 三种分辨率，这使得数据表示比单一分辨率的遥感数据更为复杂。

传统方案按空间 patch 尺寸 p 将 Sentinel-2 图像分割为 p × p 的块，对每个 patch 在每个时间步和每个分辨率下创建一个 token。由于 Sentinel-2 包含 3 种分辨率，一个包含 2 个时间步的 Sentinel-2 输入每个 patch 产生 6 个 token（2 时间步 × 3 分辨率）。数学上，形状为 [H, W, T, D=12] 的 Sentinel-2 输入将产生 **H/p × W/p × T × 3** 个 token。

## Token 设计与效率优化

v1.1 的核心优化策略是将不同分辨率的 token 合并为单一 token，从而将 token 数量减少至原来的 **1/3**。这一策略在 Galileo 和 SatMAE 等模型中已被验证有效——SatMAE 表明为每个分辨率使用独立 token 能带来显著更好的结果。然而，CROMA 等模型采用单一 token 处理所有波段，与前述方法不同。

朴素地合并 token 会导致显著的性能下降，在 m-eurosat kNN（遥感模型常用基准任务）上下降高达 10 个百分点。研究团队假设，将 Sentinel-2 波段分离到不同 token 使 OlmoEarth 能够更轻松地建模重要的跨波段关系（cross-band relationships）。

为在不影响性能的前提下合并 token，团队修改了预训练策略（pretraining regimen），具体方案详见技术报告。

## 模型家族与性能

v1.1 模型家族实现了「事半功倍」（doing more with less）的效果。在每个模型规格下，OlmoEarth v1.1 的运行成本比 v1 降低至多 **3 倍**，使得频繁的行星尺度地图更新对所有团队都更加经济实惠。

模型家族包括 Base、Tiny 和 Nano 三个规模，分别适用于不同的计算预算和任务需求。所有模型权重均在 Hugging Face 上开放下载。

## 研究价值

对于研究者而言，OlmoEarth v1.1 具有重要的学术价值：预训练遥感模型存在多个自由度（架构、数据集、预训练算法），导致性能变化难以归因。v1.1 在与 v1 相同的数据集上训练，使得两个版本之间的差异能够精确隔离出方法论变化的影响，有助于推进遥感模型预训练的科学研究。

## 资源链接

- 模型权重：https://huggingface.co/collections/allenai/olmoearth
- 技术报告：https://allenai.org/papers/olmoearth_v1_1
- 训练代码：https://github.com/allenai/olmoearth_pretrain

## 深度分析

1. **Token 序列长度是遥感 Transformer 模型的关键效率杠杆**——由于 self-attention 的二次复杂度，即使小幅减少 token 数量也能显著降低推理成本。

2. **朴素地合并多分辨率 token 会导致性能大幅下降**（m-eurosat kNN 上下降 10 个百分点），研究团队假设分离 Sentinel-2 波段到不同 token 使模型能够更轻松地建模跨波段关系。

3. **v1.1 在相同数据集上训练**，使两个版本之间的差异能够精确隔离出方法论变化的影响，解决了预训练遥感模型因多自由度（架构、数据集、预训练算法）而难以归因的科学研究难题。

4. **模型家族（Base/Tiny/Nano）的分层设计**让用户能根据计算预算选择合适的规模，实现成本与性能的平衡，3x 计算成本降低使行星尺度频繁地图更新对所有团队都更加经济。

5. **计算成本贯穿整个 OlmoEarth 生命周期**（数据导出、预处理、推理、后处理），效率优化在整个 pipeline 中都具有实际价值，而非仅限于模型本身。

## 实践启示

1. **部署行星尺度遥感应用时，优先考虑 token 序列长度优化**——可能比缩小模型规格带来更显著的收益

2. **切换到 v1.1 后如遇特定任务回归**，需查阅技术报告中列出的已知退化场景，必要时回退至 v1

3. **多分辨率数据处理时，简单 token 合并不可行**——需配合修改后的预训练策略才能不影响性能

4. **研究遥感模型预训练时，v1.1 与 v1 的对比是理想的控制变量实验**——相同数据集隔离出方法论变化的影响

5. **资源受限团队建议从 Nano/Tiny 开始验证可行性**后再扩展至 Base，以获得最佳的投入产出比

## 相关实体
- [Olmoearth V1 1 Efficiency](ch01-869-olmoearth-v1-1-a-more-efficient-family-of-earth-observation.html)
- [Kamacoder Agent Context Drift Tool Hallucination](ch04-081-ai-ceo-ai.html)
- [Olmo Hybrid Gdn Wave 2026](ch01-858-olmo-hybrid-and-the-hybrid-architecture-wave-2026.html)
- [How Llms Actually Work 0Xkato](ch01-877-factory-mission-multi-agent-architecture.html)
- [Agent Reliability Context Drift Tool Hallucination](ch04-158-agent-harness-governance-identity.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/olmoearth-v1-1-a-more-efficient-family-of-earth-observation-models.md)

---
