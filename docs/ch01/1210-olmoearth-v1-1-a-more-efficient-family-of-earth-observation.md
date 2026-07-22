# OlmoEarth v1.1: A more efficient family of Earth observation models

## Ch01.1210 OlmoEarth v1.1: A more efficient family of Earth observation models

> 📊 Level ⭐⭐⭐ | 12.0KB | `entities/olmoearth-v1-1-efficiency.md`

## 概述

OlmoEarth v1.1 是 AllenAI 于 2026 年 5 月 19 日发布的地球观测模型家族，是 2025 年 11 月发布的 OlmoEarth v1 的升级版本。该版本在保持 v1 性能水平的前提下，将计算成本降低至多 **3 倍**，显著提升了模型的经济性和可部署性。

OlmoEarth 已被广泛应用于追踪红树林变化、分类森林损失驱动因素、制作国家级作物类型地图等任务，部署范围覆盖国家、洲际乃至全球尺度。

![OlmoEarth v1.1 模型架构概览](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/4Nsn7CxsnxPkVfK5BsCHN.png) ^[olmoearth-v1-1-efficiency]

## 核心创新：Token 序列长度优化

OlmoEarth 模型基于 Transformer 架构，处理遥感数据时需先将数据转换为模型可摄入的 token 序列。在 Transformer 模型中，**模型大小**和 **token 序列长度** 是控制效率的两个关键杠杆：

- **模型大小**：OlmoEarth v1.1 以模型家族形式发布（Base、Tiny、Nano 三种规格），用户可根据自身计算预算选择合适的模型规模
- **Token 序列长度**：计算成本随 token 序列长度呈二次方增长，因此即使微小的缩减也能显著降低推理成本

## Sentinel-2 数据的 Token 设计

Sentinel-2 是 OlmoEarth 处理的常见遥感数据模态。Sentinel-2 输入张量包含空间维度（H × W，表示纬度和经度像素）、时间维度 T 以及 12 个 Sentinel-2 波段通道 [H, W, T, D=12]。

### 传统方案：分辨率分块（Resolution-based Patches）

传统方案按空间 patch 尺寸 p 将 Sentinel-2 图像分割为 p × p 的块，对每个 patch 在每个时间步和每个分辨率下创建一个 token。Sentinel-2 数据具有 10m、20m、60m 三种分辨率，因此一个包含 2 个时间步的 Sentinel-2 输入每个 patch 产生 6 个 token（2 时间步 × 3 分辨率）。

![分辨率分块方案示意](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/-OzFWBJPTKBDXOJR2Iguw.png) ^[olmoearth-v1-1-efficiency]

数学上，形状为 [H, W, T, D=12] 的 Sentinel-2 输入将产生 **H/p × W/p × T × 3** 个 token。

### 新方案：合并分辨率 Token

v1.1 的核心优化是将不同分辨率的 token 合并为单一 token，从而将 token 数量减少至原来的 **1/3**。这一策略在 SatMAE 和 Galileo 等模型中已被验证有效——SatMAE 表明为每个分辨率使用独立 token 能带来显著更好的结果。然而，CROMA 等模型采用单一 token 处理所有波段，与前述方法不同。

![Token 合并后的设计示意](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/mPjOTX0JVZij1-6q2DFLY.png) ^[olmoearth-v1-1-efficiency]

### 性能挑战与解决方案

朴素地合并 token 会导致显著的性能下降，在 m-eurosat kNN（遥感模型常用基准任务）上下降高达 10 个百分点。研究团队假设，将 Sentinel-2 波段分离到不同 token 使 OlmoEarth 能够更轻松地建模重要的跨波段关系。

为在不影响性能的前提下合并 token，团队修改了预训练策略，具体方案详见技术报告。 ^[olmoearth-v1-1-efficiency]

## 效率提升效果

![MACs 效率对比](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/E_EJ2q5ZLbGn2dZ4j92r_.png) ^[olmoearth-v1-1-efficiency]

> MACs（乘加运算次数）估算模型单次前向传播所需的计算量，MACs 越低通常意味着推理成本越低、速度越快。图中 y 轴倒置是因为排名越低越好。

v1.1 模型家族实现了「事半功倍」的效果。在每个模型规格下，OlmoEarth v1.1 的运行成本比 v1 降低至多 **3 倍**，使得频繁的行星尺度地图更新对所有团队都更加经济实惠。

> [!note]
> 虽然 v1.1 在大多数任务上性能与 v1 持平，但团队在技术报告中指出部分任务存在 regression，用户应根据自身场景评估。

## 模型规格

| 规格 | 适用场景 | 计算需求 |
|------|----------|----------|
| **Nano** | 边缘设备、轻量级应用 | 最低 |
| **Tiny** | 中等规模部署 | 中等 |
| **Base** | 大规模生产环境 | 较高 |

## 学术价值

对于研究者而言，OlmoEarth v1.1 具有重要的学术价值：预训练遥感模型存在多个自由度（架构、数据集、预训练算法），导致性能变化难以归因。v1.1 在与 v1 相同的数据集上训练，使得两个版本之间的差异能够精确隔离出方法论变化的影响，有助于推进遥感模型预训练的科学研究。

## 技术背景

### 核心问题

Transformer 架构中影响效率的两个关键因素： ^[olmoearth-v1-1-efficiency]
1. **模型参数量**：决定内存占用和计算复杂度 ^[olmoearth-v1-1-efficiency]
2. **Token 序列长度**：计算成本随长度呈**二次方**增长 ^[olmoearth-v1-1-efficiency]

## 资源链接

- 模型权重：https://huggingface.co/collections/allenai/olmoearth
- 技术报告：https://allenai.org/papers/olmoearth_v1_1
- 训练代码：https://github.com/allenai/olmoearth_pretrain

## 深度分析

### 1. 三倍效率提升的核心：Token 合并的工程代价

OlmoEarth v1.1 的效率突破不是来自模型架构重构，而是来自数据编码策略的精细调整——将 Sentinel-2 的 3 种分辨率 token 合并为 1 个，直接将 token 数量削减 2/3。但这个操作有工程代价：朴素合并会导致 10 个百分点的性能回退，说明波段间的空间关系建模对遥感任务至关重要。团队通过修改预训练策略来补偿这个损失，最终实现了"效率 3x + 性能持平"的双重目标。这个案例说明，在大型 Transformer 模型上，细粒度的数据编码设计往往是比架构创新更高杠杆的优化手段。

### 2. 计算成本二次方增长的现实约束

Transformer 的计算复杂度随 token 序列长度呈 O(n²) 增长，这是遥感领域应用 LLM 的核心瓶颈之一。当处理 10 万平方公里的卫星影像时，即使每个 patch 只产生几十个 token，累积的序列长度也会让推理成本高到不可接受。v1.1 将 token 数量减少到 1/3，意味着 O(n²) 变成 O((n/3)²)——计算量降至原来的约 1/9。这不是在边际上优化，而是在改变"什么规模的地理范围是经济上可行的"这个根本判断。

### 3. 遥感模型与通用 LLM 的效率优化路线分化

通用 LLM 的效率优化主要靠模型规模（更大参数、更少 token）和量化策略。但遥感模型面对的是结构化的高维张量 [H, W, T, D=12]，其效率瓶颈有独特的结构——不在于 token 的语义压缩，而在于空间和时间维度上的 token 冗余。SatMAE 证明了"分辨率分离 token"有效，CROMA 证明了"单一 token 全波段"也有效，两者都能work，说明遥感数据的 token 设计还没有定论。v1.1 在两者之间找到了一个新的平衡点——合并分辨率 token 但修改预训练策略。

### 4. 行星尺度 AI 的经济临界点正在到来

OlmoEarth v1.1 明确提出的应用场景是：追踪红树林变化、制作国家级作物类型地图、监测森林损失驱动因素——这些都是行星尺度（planetary scale）的任务。当效率提升 3 倍，同样的计算预算可以覆盖 3 倍的地理范围，或者将同样区域的更新频率提升 3 倍。这对环境保护、农业监测、气候变化研究的影响是，非线性放大的。成本曲线每下降一个台阶，应用的边界就会向外扩张一圈。

### 5. 受控实验在遥感预训练研究中的稀缺价值

OlmoEarth v1.1 与 v1 在完全相同的数据集上训练，只改变预训练方法论。这个设计在遥感预训练研究中极为罕见——大多数论文同时改变架构、数据集和算法，让结果无法归因。v1.1 的做法让两个版本之间的性能差异精确指向 token 合并策略的效果。这个思路值得遥感领域的其他研究借鉴：当模型的评价指标受多个变量影响时，固定数据集、先孤立方法论变量，才能建立可靠的科学认知。

## 实践启示

### 遥感 AI 开发者：优先测试 v1.1 的 Nano 规格

对于需要快速原型验证的场景，从 Nano 规格开始可以在极低计算成本下测试 pipeline 可行性。OlmoEarth v1.1 的三个规格不是简单的大小差异——它们对应的是不同的部署环境（边缘设备 vs. 云端服务器 vs. 集群）。先验证 task fit，再按需升级规格，而不是默认从 Base 开始，是控制 GPU 成本的正确顺序。

### 环保与农业监测团队：重新评估"经济上不可行"的监测方案

如果之前的分析显示某项行星尺度监测任务因为计算成本过高而无法实施，v1.1 的 3x 效率提升可能已经让这个判断失效。建议重新运行成本核算：红树林变化追踪、非法采矿监测、农作物灾害评估等任务，在新效率下可能已经从"不可能"变为"可负担"。特别是需要高频更新（如每月 vs. 每季度）的场景，效率提升的影响是非线性叠加的。

### AI 研究者：关注预训练策略对 token 设计缺陷的补偿机制

v1.1 论文中提到的"修改预训练策略以补偿 token 合并带来的性能回退"，是当前遥感领域一个重要但未被充分研究的方向。token 设计是前向计算效率的决定因素，但真正决定性能上限的是预训练策略如何教会模型在新的 token 表示下保持跨波段关系建模能力。这个方向值得深入探索——它连接了数据编码和表示学习两个层次。

### 地理信息系统架构师：OlmoEarth 可作为行星尺度数据管道的语义层

在构建行星尺度的地理信息 pipeline 时，OlmoEarth v1.1 的角色不只是"推理模型"，更是一个能将原始遥感数据转化为语义知识的索引层。配合矢量数据库和地理空间索引，可以构建"发现→推理→行动"的完整链路。当模型足够高效，实时行星监测就从概念验证进入生产部署阶段。

### 气候变化研究者：效率提升对气候模型的间接加速

气候变化模型依赖大量历史遥感数据的训练和验证。OlmoEarth v1.1 的效率提升，使得同一计算预算下能处理更多时间序列的历史影像——这对建立更精确的土地利用变化模型、碳汇估算模型和极端天气归因模型都有直接帮助。效率优化不只是工程改进，它直接影响我们理解气候系统的科学能力。

## 相关实体
- [Olmoearth V1 1 A More Efficient Family Of Earth Observation Models](ch01/1210-olmoearth-v1-1-a-more-efficient-family-of-earth-observation.html)
- [Kamacoder Agent Context Drift Tool Hallucination](../ch03/046-agent.html)
- [Olmo Hybrid Gdn Wave 2026](ch01/885-20.html)
- [How Llms Actually Work 0Xkato](ch01/1240-how-llms-actually-work-0xkato-transformer-walkthrough.html)
- [Agent Reliability Context Drift Tool Hallucination](../ch03/046-agent.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/olmoearth-v1-1-efficiency.md) ^[olmoearth-v1-1-efficiency]

---

