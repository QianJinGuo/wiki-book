---
source_url: https://mp.weixin.qq.com/s/roAGiPRb9xZl_dcyRGzDSw
ingested: 2026-06-10
sha256: a5aa3f99e653532090bbb58f23c559a6f0616a834dab9193f625adf30030b37f
title: "搞定视觉幻觉难题,这套并行推理框架设计很巧妙"
author: 机器之心编辑部 (转发自浙江大学/小米 MiLMPlus 论文)
publisher: 数据派THU
publish_date: 2026-06-10
arxiv: 2602.13310
arxiv_title: "Visual Para-Thinker: Divide-and-Conquer Reasoning for Visual Comprehension"
github: https://github.com/xuhaoran1/Visual-Para-Thinker
authors: [许浩然, 李佳泽]
affiliations: [浙江大学, 小米 MiLMPlus]
tags: [vlm, visual-reasoning, parallel-thinking, arxiv, attention-mechanism, position-encoding, hallucination, divide-and-conquer, multimodal]
---

# Visual Para-Thinker: 视觉并行思考框架

**作者**: 许浩然 (浙江大学硕士) + 李佳泽 (小米高级算法工程师, 通讯作者) — 小米 MiLMPlus 团队
**arXiv**: [2602.13310](https://arxiv.org/abs/2602.13310)
**代码**: [github.com/xuhaoran1/Visual-Para-Thinker](https://github.com/xuhaoran1/Visual-Para-Thinker)
**发表渠道**: 机器之心 (转发) / 数据派THU (2026-06-10)

## 核心动机

**测试时扩展的范式冲突**:
- 当前主流测试时扩展范式 (test-time scaling) 普遍致力于**增加推理长度** (深度扩展, depth scaling)
- 研究表明: 推理长度持续增长, 垂直扩展的计算范式容易**陷入探索僵化**

**视觉任务的额外挑战 — "注意力漂移"**:
- 在视觉任务中, 深度推理面临严峻挑战: 推理序列拉长, 模型对**视觉特征的注意力被不断稀释**
- 进而引发**严重的视觉幻觉** (visual hallucination)

**另一维度: 宽度扩展 (width scaling)**:
- K2.5、Step3-VL、LongCat-Flash-Thinking 等模型已在推理宽度方面开展了有益探索
- **Visual Para-Thinker = 第一个针对大规模视觉语言模型 (VLM) 的并行思考框架**

## 核心贡献: 3 大机制

1. **以视觉为中心的路径划分** — 块划分 (Block) + 扫描划分 (Scan)
2. **Pa-Attention** (Path-aware Attention, 路径感知注意力) — 隔离性
3. **LPRoPE** (Learnable Parallel Rotary Position Embedding, 分段学习位置编码) — 兼顾无偏性 + 可区分性

## 1. 并行推理路径: 以视觉为中心划分

**基本原则**: 保持推理路径的多样性 (diversity preservation)。

**与传统并行思考的区别**: 针对 VLM 特性, 提出**以视觉为中心的路径划分**, 本质是对**视觉 token 注意力的重新分配**。

### 1.1 块划分 (Block Partition)

- 根据**特定区域子图**划分推理路径
- 每条路径吸引**独特的视觉注意力分布**, 集中在指定子区域 (左上 / 右上 / 左下 / 右下 4 象限)
- **优势**: 生成不同子区域, 路径差异显著
- **劣势**: 不同路径之间可能**计算冗余**

### 1.2 扫描划分 (Scan Partition)

- 通过**不同的视觉扫描轨迹**区分推理路径
- 每条路径对应预定义的扫描顺序 (左→右、上→下、右→左、下→上 4 方向)
- **优势**: 结构简洁
- **劣势**: 容易**削弱路径之间的多样性**

### 1.3 混合训练策略

- 将两种划分方式生成的**数据共同用于模型训练**
- **优势互补**: 块划分提供显式区域差异, 扫描划分提供隐式注意力顺序差异

## 2. 视觉并行思考框架结构

**两阶段架构**:
- **并行思考阶段**: 基于共同上下文, 通过视觉划分, 分配不同推理路径的思考方向
- **总结阶段**: 整合不同并行推理路径的背景信息, 综合得出最终结论

**三性约束** (框架设计核心目标):
- **隔离性** (Isolation): 不同路径不交叉污染
- **无偏性** (Unbiasedness): 不同路径等同看待, 无位置偏差
- **可区分性** (Distinguishability): 不同路径能被模型区分, 不混淆

### 2.1 隔离性: Pa-Attention (路径感知注意力)

- **不同于因果注意力** (causal attention)
- 通过不同 `<think i>` 的**特殊 token** 实现不同路径的上下文隔离范式
- 每条路径只看到自己的上下文 + 共同前缀, 不串味

### 2.2 无偏性: position id 同一区间

**传统做法的问题**:
- 给不同路径分配**不同区间**的 position id
- 由于 LLM 的固有偏差, position id 存在**先后顺序**
- 出现 **"loss in the middle"** 现象
- 不同路径的思考权重存在**天生的位置偏差** — 本质上**仍是串行思考**

**Visual Para-Thinker 的做法**:
- **不同路径的 position id 赋予相同区间** (并行推理阶段)
- 不同路径的起始 token 的 position id 相同
- 总结阶段: 总结 token 起始 = 最长推理路径的结束 token 的 position id + 1
- 使得不同推理路径在模型看来**不存在固有的位置偏差** → 保证**无偏性**

### 2.3 可区分性: LPRoPE (Learnable Parallel Rotary Position Embedding)

**无偏性的副作用**:
- 将不同路径的位置编码映射为同一区间, 仅仅保证了无偏性
- 但**损伤了不同路径的可区分性**
- 如果直接使用这种位置编码, 模型会**混淆不同的推理路径**, 导致结果错误

**LPRoPE 解决方案**:
- 在不同 token 进行**旋转位置编码 (RoPE) 之前**
- 加入**该 token 属于的推理路径的可学习位置编码**
- 将**旋转位置编码** + **可学习的绝对位置编码** 相结合
- 最终实现**路径的可区分性**

## 3. 数据与实验

### 3.1 训练数据集

- **163,000 个问题-答案对**的并行推理数据集
- 数据来源: LVIS / LAION / Microsoft COCO / PixMoCount / RefCOCO / RefCOCO+ / RefCOCOg
- **教师模型**: Qwen3-VL-235B-A22B-Instruct
- **数据生成**:
  - 温度 = 0.1
  - 融合**块划分**和**扫描划分**的混合视觉分区策略
  - 为每个样本生成**4 条以视觉为中心的推理路径**
- **多样性增强**: 利用高温 Qwen3-VL-30B-A3B-Instruct 和 InternVL3 5-241B-A28B 生成更多样化数据 + 检查样本

### 3.2 评测基准

主要在**以视觉为中心的视觉感知类任务**中评测:
- **计数任务**: PixMo、CountBench
- **视觉搜索**: V* (Visual Search)
- **幻觉任务**: MMVP、HallusionBench
- **视觉定位**: RefCOCO 系列

### 3.3 核心实验结果

| 任务 | 3B 提升 | 7B 提升 | 备注 |
|------|---------|---------|------|
| **V* (视觉搜索)** | **+12.6** | **+6.3** | 验证多模态并行推理在视觉感知类任务上的提升 |
| **HallusionBench (幻觉)** | **+6.1** | **+5.0** | 验证解决"注意力漂移 → 视觉幻觉"的核心问题 |
| **Grounding (RefCOCO)** | 一定提升 | 一定提升 | 相对 Qwen2.5-VL 基座 |

### 3.4 任务特性 vs 划分模式偏好

| 任务类型 | 注意力分布 | 推荐划分 | 原因 |
|----------|------------|----------|------|
| **计数任务** | 分散于图像各处 | **扫描划分** | 块划分各路径可能因区域重叠产生累积偏差, 引发幻觉 |
| **需要显式区域注意** | 集中于子区域 | **块划分** | 显式注意力分配, 从全局到局部 |
| **需要全局视角** | 全图分布 | **扫描划分** | 隐式注意力分配, 保留全局视角 |

**本质区别**:
- 块划分 = **显式**注意力分配, 显式图像区域差异
- 扫描划分 = **隐式**注意力分配, 通过改变视觉 token 的注意顺序与方式
- 前者体现**从全局到局部**, 后者**仍保留全局视角**

## 4. 论文自我定位

> "Visual Para-Thinker 是将并行思考框架应用于视觉语言领域的**抛砖引玉之作**"

**未来工作**:
- 并行思考 RL
- 多轮思考
- Agentic RL
- 实现更快更好的扩展

**生态意义**: K2.5 / Step3-VL / LongCat-Flash-Thinking 等基座模型已关注并行思考范式, **这一范式日后会爆发出巨大潜力**。

## 5. 作者信息

- **许浩然** (第一作者): 浙江大学硕士, 研究方向 Multi-Agent / Multi-Modal / RL
- **李佳泽** (通讯作者): 小米高级算法工程师, 研究方向 Multi-Agent / Agentic RL
- 已在 ICML / ACL / CVPR / AAAI / ICLR 等顶会发表多篇论文
- 通讯单位: **小米 MiLMPlus 团队**

## 6. 关键金句

> "**当前测试时扩展范式普遍致力于增加推理长度, 但已有研究表明, 推理长度持续增长, 垂直扩展容易陷入探索僵化**" — 因此**从另一维度拓展推理宽度**显得尤为重要。

> "**深度推理的视觉任务面临严峻挑战: 注意力漂移 → 视觉幻觉**" — Visual Para-Thinker 通过**宽度扩展**解决。

> "**Path-aware Attention 通过不同 `<think i>` 特殊 token 实现不同路径的上下文隔离**" — 隔离性的工程实现。

> "**LPRoPE = 旋转位置编码 + 可学习的绝对位置编码**" — 兼顾无偏性 + 可区分性的关键。

> "**块划分=显式注意力分配, 扫描划分=隐式注意力分配; 前者从全局到局部, 后者保留全局视角**" — 两种路径划分方式的本质区别。

> "**能实验回答架构之争, 是评测平台最大的价值**" — 借杜学友语; 在此适用: 块 vs 扫描 vs 混合训练, **用实验决定选型, 不靠拍脑袋**。

## 7. 与 Native Parallel Reasoner (NPR) 的关联

- **NPR** (ICML 2026, arxiv 2512.07461, bigai-nlco): 文本领域的原生并行推理, 三阶段 RL 自蒸馏
- **Visual Para-Thinker** (arxiv 2602.13310, 浙江大学/小米 MiLMPlus): 视觉领域的并行推理, 注意力 + 位置编码
- **共同范式**: 都推动"**推理宽度扩展**"对抗"**深度扩展的探索僵化**"
- **关键技术差异**:
  - NPR: 并行注意力掩码 + 并行位置编码 + PAPO 算法
  - VPT: Pa-Attention (特殊 token 隔离) + LPRoPE (可学习路径编码)
- **互补关系**: NPR 在文本推理开辟并行范式, VPT 将其适配到 VLM, **解决了"视觉幻觉"这一 VLM 特有问题** (注意力漂移)

> 两者合在一起构成 "**并行推理范式在多模态领域的演进路径**": 文本原生并行 (NPR) → 视觉并行 (VPT) → 未来: 并行 RL / 多轮思考 / Agentic RL。

## 8. 业界相关工作 (作为并行推理范式生态)

- **K2.5**: 推理宽度扩展
- **Step3-VL**: 推理宽度扩展
- **LongCat-Flash-Thinking**: 推理宽度扩展
- **NPR** (bigai-nlco): 文本原生并行推理, 强调"**三阶段 RL 自蒸馏**"
- **Visual Para-Thinker** (本文): 视觉并行推理, 强调"**Pa-Attention + LPRoPE**"

> 共同方向: **不再"加长", 而要"加宽"**。
