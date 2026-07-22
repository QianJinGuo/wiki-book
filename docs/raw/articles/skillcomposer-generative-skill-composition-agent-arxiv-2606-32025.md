---
title: "SkillComposer: 生成式技能组合，为 Agent 自动编排技能序列"
source_url: "https://mp.weixin.qq.com/s/h4TDzw-6YSc93DSi4hxzDg"
author: "AGI Hunt"
created: 2026-07-02
updated: 2026-07-02
type: raw
tags: [skill-composition, agent-skills, skill-selection, generative-retrieval, arxiv]
ingested: 2026-07-02
sha256: 7ba5535a7d582327483b338f86417a9ad888eafce174e10437148ab708a42e60
---

# SkillComposer: 生成式技能组合，为 Agent 自动编排技能序列

本田研究院 USA、北卡罗来纳大学教堂山分校等团队提出 SkillComposer——把 Agent 技能选择建模为「闭集技能序列生成」，用仅 3.9M 可训练参数的小解码器，一次性联合预测该用哪些技能、用几个、按什么顺序执行。

论文：Generative Skill Composition for LLM Agents
论文：https://arxiv.org/abs/2606.32025
项目：https://skill-composer.github.io/

## 核心问题：技能库越大，Agent 反而越不会「组技能」

LLM Agent 标配从「会调 API」进化到「会挂技能包」。库一大，瓶颈就换了：难点从「有没有技能」变成「怎么组合技能」。

现有做法局限：
- **全库灌 prompt**：上下文爆炸，组合逻辑隐没在冗长轨迹里
- **检索 top-k**：默认只给无序子集，不知道数量，更不知道顺序

论文形式化为结构化技能组合（structured skill composition）：给定任务和固定技能库，预测一条可执行的技能计划——同时确定子集、数量和顺序。

## Skill 与 Tool 的区分

| 维度 | Skill | Tool |
|------|-------|------|
| 内容 | 元数据 + 适用条件 + 程序性策略 + 终止条件 | 接口 schema + 参数 |
| 可复用性 | 跨任务可复用知识模块 | 原子 API 调用 |
| 加载方式 | 推理时注入上下文，不改权重 | 运行时注册 |

## SkillComposer 架构

### 1. 冻结任务编码器
Qwen3-Embedding-0.6B（参数冻结）把 prompt 映射为任务向量。

### 2. 约束自回归解码器
3 层、256 维、4 头注意力的小 Transformer 解码器，生成技能索引序列。每步条件于已选前缀，使后一个 skill 可以依赖前一个的输出语义。

### 3. 两个辅助头
- **基数头（Cardinality Head）**：直接从任务向量预测需要几个 skill
- **集合头（Set Head）**：对每个 skill 独立打分，判断是否该出现

### 4. 检索增强解码
解码每步融合三路信号：AR 头 logit + TF-IDF 余弦相似度 + 集合头成员先验。
反直觉发现：闭集 196 个短 skill 名称，TF-IDF 比 dense embedding 高 2.5 个点 Set F1。

## 训练数据

| 数据类型 | 规模 | 来源 |
|----------|------|------|
| 真人锚点 | 65 条 | SkillBench 软件工程任务 |
| 单技能合成 | 2,880 | Gemini 2.5 Flash |
| 多技能合成 | 6,927 | Gemini 2.5 Pro（含依赖边+工作流边） |

合计 9,872 条任务-技能序列。可训练参数约 3.9M（对比 SFT 的 600M 少 154 倍）。

## 核心结果

### 技能预测（分布内）
| 方法 | Set F1 | R@5 | MRR |
|------|--------|-----|-----|
| TF-IDF 检索 | 52.5 | 82.2 | 58.9 |
| Gemini-2.5-flash LLM-judge | 61.0 | 69.0 | 69.3 |
| SFT Qwen3-0.6B (600M) | 71.1 | 79.2 | 74.1 |
| **SkillComposer (3.9M)** | **73.9** | **86.5** | **75.0** |

### 真实任务 holdout
| 方法 | Set F1 | 合成→真实跌幅 |
|------|--------|---------------|
| SFT Qwen3-0.6B | 43.6 | −27.5 pp |
| **SkillComposer** | **62.9** | **−11.0 pp** |

### 下游 Agent (SkillsBench 75 编码任务)
| 条件 | Codex 通过率 | Gemini 通过率 |
|------|-------------|---------------|
| 无技能 | 22.2% | 25.8% |
| 全库 196 skill | 29.3% | 38.7% |
| 检索 top-3 | 44.0% | 41.8% |
| **SkillComposer** | **45.3%** | **44.0%** |
| 金标技能（上界） | 51.1% | 48.4% |

Codex +23.1 pp / Gemini +18.2 pp 相对无技能基线，prompt token 最少。

## 工程启示

1. 别再整库灌 skill 进 system prompt——196 个已 1.27M token
2. top-k 检索只是下限，多步流程必须建模顺序和数量
3. 小专用模型（3.9M）> 大模型硬 SFT（600M）——闭集组合不需要堆通用语言能力
4. Sparse + Dense 混搭：任务编码用 embedding，解码先验用 TF-IDF
