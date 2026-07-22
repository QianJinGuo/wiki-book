---
title: "Kimi K2.5 架构创新 — 1T MoE 一层路由 + 三能力跃迁"
source: wechat-mp
source_url: https://mp.weixin.qq.com/s/-LlryKjaW1jS_UouZwAU7Q
author: 朱洁 (架构师带你玩AI)
published: 2026-06-12
ingested: 2026-06-12
type: article-summary
tags: [kimi, k2.5, moe, moonshot, architecture, one-layer-routing, open-source]
sha256: 5b575ee54f4b9a3bd79eb80642a60e0857892959401b27d6d40cb4a4719ea139
---

# Kimi K2.5 架构创新 (朱洁 / 架构师带你玩AI)

## 一、K2 → K2.5 的演进背景

K2 阶段完成 1T MoE 基础架构搭建。K2.5 在 K2 之上叠加三层能力：
- **深度研究 (deep research)**
- **视觉-代码-操作 联合**
- **多模态表格理解**

K2.5 模型权重 + 训练数据 + 配套 harness（OpenShell、AWorld）**全部开源**。

## 二、核心架构创新

### 2.1 1T MoE 的"一层路由"机制

这是与 DeepSeek-V3 256 expert 完全不同的设计。

**传统 MoE（DeepSeek-V3 风格）**：
- 路由在**每一层**都做
- 每个 token 独立选 expert
- 选中的 expert 子集被激活

**K2.5 一层路由**：
- 路由**只发生在 attention 之后残差流出口的那一层**
- 所有 1T 参数在 attention 阶段**完整在线**
- 残差流通过路由决定流向哪个 expert sub-network
- 效果：**1T 参数物理在线 + 路由只激活部分路径**

| 维度 | DeepSeek-V3 | K2.5 |
|------|------------|------|
| 路由层数 | 每层 | 残差出口单层 |
| Expert 数量 | 256 (64维) | 384 |
| Expert 构造 | 共享专家 + 路由专家 | **k 均值聚类得到的簇** |
| 激活参数 | 子集激活 | **全 1T 在线，路由分流** |

### 2.2 384 个 k 均值聚类 expert

- 不再是手工定义 expert specialization
- 用 k-means 把 token 表达聚成 384 簇
- 每簇对应一个 expert sub-network
- 路由本质上是 token → 簇的最近邻查询

### 2.3 训练数据 pipeline

- **OCR 公式/表格合成**：构造结构化训练样本
- **agent harness synthesis**：合成 agent 执行轨迹作为训练数据
- **5 个 step cot 数据**：分阶段思维链
- **math/STEM/Code 提升**

### 2.4 MLA-MQA 共享 KV

- Multi-Latent Attention 复用 KV 头
- Multi-Query Attention 共享 KV
- 推理显存压力大幅降低

### 2.5 多模态 token merging

- 多模态 token 合并：相邻 token 语义相似可合并
- 视觉块 / 文本块分别合并
- 减少跨模态交互的 token 数

## 三、K2.5 三能力跃迁

### 3.1 深度研究 (deep research)

- 基于开源 **OpenShell** / **AWorld** harness
- 多步检索 + 信息整合 + 报告生成

### 3.2 视觉-代码-操作 联合

- 看图写代码并直接执行
- screenshot / UI 截图 → 可运行代码

### 3.3 多模态表格理解

- 表格结构识别 + 跨页表格合并
- 视觉表格问答

## 四、开源生态

- K2.5 权重开源
- 训练数据 pipeline 开源
- OpenShell / AWorld harness 开源
- 与 DeepSeek V3 / Qwen3 / GLM 4.5 同台开源

## 五、引用源

- 原文：https://mp.weixin.qq.com/s/-LlryKjaW1jS_UouZwAU7Q
- 关联：[[raw/articles/kimi-k2-6-tidb-agent-database|Kimi K2.6 Agent Database]]
- 关联：[[raw/articles/kimi-attention-residuals-preNorm-dilution-block-attnres|Kimi AttnRes]]
- 关联：[[raw/articles/deepseek-moe-parallel-strategy|DeepSeek MoE]]
- 关联：[[raw/articles/openjiuwen-swarm-coordination-engineering|openJiuwen Swarm]]
