# Memory Prices - Stanford DAM Interactive Dataset

## Ch01.812 Memory Prices - Stanford DAM Interactive Dataset

> 📊 Level ⭐⭐ | 5.1KB | `entities/memory-prices-stanford.md`

# Memory Prices - Stanford DAM Interactive Dataset

## 摘要

Stanford Digital Art Museum (DAM) 维护的交互式数据集，追踪 1957 年至今的内存与存储价格历史。基于 John C. McCallum 经典内存价格数据集，由 David Shim 编译维护。提供交互式可视化（hover 查看详情、点击图例切换系列、拖拽或滑块缩放、导出图像）和可下载 CSV 原始数据。

## 核心要点

### 数据覆盖范围

| 维度 | 详情 |
|------|------|
| 时间跨度 | 1957–2026，近 70 年 |
| 存储类型 | DRAM、NAND Flash、SRAM、HBM |
| 价格指标 | 最低 $/GB（对数刻度），每种存储类型一条曲线 |
| 更新频率 | DRAM 和 NAND 月更（来源：Keepa）；HBM 季更（Epoch AI） |
| 数据下载 | CSV 格式，每个数据点标注来源 |

### 四大可视化图表

1. **每 GB 价格随时间变化**：对数刻度下的历史最低 $/GB，DRAM、NAND Flash、HBM 三条主线
2. **按代际分类的 DRAM 价格**：从 Pre-DDR（SDRAM/core）到 DDR、DDR2、DDR3、DDR4、DDR5 的全历史分解
3. **加速器成本分解**：Epoch AI 建模估计，Nvidia/AMD/Google(TPU)/Amazon(Trainium) 四大厂商的季度加速器成本，按 HBM、逻辑芯片、封装/CoWoS、辅助部件分层堆叠
4. **按代际分类的 HBM 价格**：HBM2e → HBM3 → HBM3e → HBM4，包含 $/TBps（每带宽单位成本）

## 深度分析

### 方法论与数据可靠性

数据来源分为四个层级，可靠性递减：

| 类别 | 追踪内容 | 来源与方法 | 可靠性 |
|------|----------|------------|--------|
| DRAM $/GB | 最便宜零售 $/GB，按代际分类 | 深度历史（1957–2024）：McCallum 数据集（经 Internet Archive）；2024 年中起：Keepa 月度最便宜新消费 DIMM | 参考级 + 实时 |
| NAND $/GB | 最便宜零售 SSD $/GB | 2016 起：Keepa 消费级 NVMe SSD 月度最低价；2010–2016：四个近似锚点 | 实时 + 近似 |
| HBM 支出与成本分解 | 季度 HBM 支出（$B）及组件份额 | Epoch AI（CC-BY）：建模估计，跨四大加速器设计商的产量加权平均 | 外部估计 |
| HBM $/GB 按代际 | 每 GB 和每 TB/s 带宽价格 | TrendForce / SemiAnalysis 行业分析师估计（HBM 无公开现货市场） | 稀疏估计 |

### 关键 Caveats

- **$/GB 是名义美元最低零售价**：非合同价、均价或通胀调整价，零售价滞后于合同价
- **最便宜列表往往追踪的是停产清仓的上一代产品**，而非最新一代——按代际图表清楚展示了这一点
- **HBM 数据是建模估计**（成本份额和支出），非实际交易价格；HBM4 为预测值（2026 Q3 发布）
- **DRAM 曲线在 2024 年中拼接了两个数据源**（McCallum → Keepa），可能存在小幅跳变
- SSD 数据已过滤明显发布错误：任何月份某驱动器标价**低于其典型价格 60% 以上**的记录被剔除

### 价格趋势的核心发现

1. **摩尔定律验证**：内存价格遵循指数下降，DRAM 和 NAND $/GB 在对数刻度上近似线性
2. **HBM 溢价**：HBM 价格显著高于标准 DRAM，但同样在持续下降
3. **供应冲击**：价格曲线清晰显示 2017–2018 DRAM 供应短缺导致的价格飙升
4. **代际技术迁移**：从 SRAM 到 DRAM 到 NAND 到 HBM 的技术世代转换在价格曲线上清晰可见

## 实践启示

### 对 AI 基础设施经济学的影响

内存价格直接决定 AI 基础设施的经济可行性：

- **推理成本**：GPU HBM 价格决定 LLM 推理的边际成本（H100/H200 的 HBM 约占 BOM 成本 40%）——与推理优化直接相关
- **训练基础设施**：大规模训练集群的硬件采购成本与 DRAM/NAND 价格强相关
- **边缘部署**：移动/边缘设备内存成本影响端侧模型（Gemma、Phi）的可行性
- **长上下文窗口**：KV-cache 内存占用直接关联 DRAM 价格——更便宜的内存使长上下文窗口经济可行
- **推理芯片竞争**：Groq LPU、Cerebras WSE 等的成本优势部分来自 SRAM 价格趋势

### 数据维护节奏

DRAM 和 NAND $/GB 从 Keepa **月度刷新**；HBM 季度更新（Epoch AI）。McCallum 主干数据和 HBM 估计为固定值。可下载 [CSV](https://dam.stanford.edu/assets/memory-prices/memory-prices.csv) 列出每个数据点及其来源。

### 与类似数据资源的比较

该数据集延续了 John C. McCallum 的经典工作（jcmit.net，经 Internet Archive 存档），是目前公开可获取的最长时间跨度内存价格追踪项目。与 Epoch AI 的加速器成本数据互补——前者关注存储组件价格趋势，后者关注整体芯片成本结构。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/memory-prices-stanford.md)

---

