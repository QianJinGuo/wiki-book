---
source_url: "https://mp.weixin.qq.com/s/lu1iJdvy_cDhVaX8PqbucQ"
source_author: "月之暗面Kimi"
source_title: "Kimi K3：智能的新前沿"
source_date: "2026-07-17"
source_publication: "Kimi智能助手"
ingested: "2026-07-17"
sha256: "b17760db9df7004b6a5e76e9c7c2d71d44566ea12146be8e9480b171ffa8630b"
---

月之暗面（Moonshot AI）正式推出 Kimi K3，迄今能力最强的模型，也是全球首个开源的 3 万亿级别模型。

## 模型概况

- 参数规模：2.8 万亿参数
- 架构：KDA 混合线性注意力机制 (Kimi Delta Attention) + 注意力残差 (Attention Residuals)
- 原生支持视觉理解
- 上下文窗口：100 万 token
- 面向长程编程、知识工作和推理等前沿智能场景设计

## 架构创新

### Kimi Delta Attention (KDA)
为注意力扩展提供高效基础，给传统 prefix caching 带来新挑战，已向 vLLM 社区贡献实现。

### Attention Residuals (AttnRes)
不是简单地在各层均匀累积表示，而是有选择地跨深度检索表示。二者共同构成架构骨架，使模型能够扩展到万亿参数以上规模。

### Stable LatentMoE
在 896 个专家中实际激活 16 个。关键创新：
- Quantile Balancing：直接根据路由分数的分位数分配专家，避免启发式更新和敏感的平衡超参数
- Per-Head Muon：将 Muon 扩展到按注意力头独立优化
- Sigmoid Tanh Unit (SiTU)：增强激活控制
- Gated MLA：增强注意力选择性

### 训练优化
从 SFT 阶段开始采用量化感知训练（MXFP4 权重 + MXFP8 激活）。引入完全均衡的专家并行训练方法。相比 K2 整体扩展效率提升约 2.5 倍。

## 编程能力

### GPU 内核优化竞技场
在 NVIDIA H200 GPU 上测试 Attention Residuals、KDA 线性注意力、MLA 内核以及某国产 GPU KDA 任务。Kimi K3（max）表现接近 Fable-5，明显领先 Opus 4.8、GPT-5.6 Sol 和 GPT 5.5。

### MiniTriton GPU 编译器
从零构建的紧凑型类 Triton 编译器，基于 MLIR 构建 tile 级中间表示层，实现完整的优化 Pass 与 PTX 代码生成流水线。性能达到或超过 Triton 与 torch.compile，能稳定支撑端到端 nanoGPT 训练。

### 数字作品创作
融合 3D 推理、编程与视觉能力，实现 vision in the loop。演示包括 3D 长征十号火箭发射回收模拟、3D 开放世界游戏、3D GBA 模拟器、黑洞卡冈图雅复刻等。

### 芯片设计
连续 48 小时自主 Agent 运行，基于开源 EDA 工具和 Nangate 45nm 工艺库，独立完成芯片构建、优化与验证。芯片面积 4 mm²，集成 146 万标准单元、0.277 MB SRAM，在 100 MHz 完成时序收敛，仿真解码吞吐超过每秒 8,700 个 token。

### 科研编程
复现计算天体物理 I-Love-Q 普适关系：阅读并交叉验证 20+ 篇论文，评估 300+ 种状态方程，发现已发表公式中的不一致之处，生成 3,000+ 行 Python 代码。约 2 小时完成通常需要资深研究人员一到两周的工作。

## 知识工作

在推理芯片行业研究、可控核聚变产业研究、GWTC-5 引力波分析等场景展示能力。Kimi Work 新增小组件 (Widgets) 和看板 (Dashboard) 功能。

## 发布信息

- 即日起可通过 kimi.com、Kimi app、Kimi Work 桌面客户端、Kimi Code 和 Kimi API 使用
- 完整模型权重将于 2026 年 7 月 27 日前发布
- API 价格：输入 2 元（缓存命中）/ 20 元（未命中），输出 100 元（每百万 token）
- 编程场景缓存率超过 90%

## 局限性

1. 对历史思考内容敏感：要求 agent 框架回传全部历史思考内容
2. 过于主动：在任务执行中可能替用户做出非预期决定
3. 整体仍落后于 Claude Fable 5 和 GPT-5.6 Sol
