---
source_url: https://mp.weixin.qq.com/s/peGJOsWBYlKodODjbz2ztw
ingested: 2026-08-21
sha256: 3338c8b34f8bb380ba0d09a3c4aaede5741aa6c60bd87ebe40df3e989a7c786b
title: "腾讯又甩2篇Skill，Agent Harness直接封神（Skill-Use-Bench 评测 + Capability Pages 检索）"
author: PaperToday（学姐阿玲）
source: 微信公众号
type: raw
tags: [agent-skills, skill-use, skill-retrieval, harness, benchmark, tencent, capability-pages, evaluation]
---

# 腾讯两篇 Skill 论文：Skill-Use-Bench（评测）与 Capability Pages（检索）

> 原始来源：https://mp.weixin.qq.com/s/peGJOsWBYlKodODjbz2ztw
> 作者：PaperToday（学姐阿玲，微信公众号论文解读号，2026-08-21）
> 覆盖两篇论文：① Skill-Use: Can LLMs Actually Use Skills in Agentic Harnesses?（腾讯混元，arXiv 2608.04828，Skill-Use-Bench）② Skills Know Their Neighbors: Cluster-Contrastive Capability Pages for Skill Retrieval（腾讯优图 + IMA，arXiv 2608.04482）

## 引言

给 Agent 装了一整库 skill，指望它遇事掏出对应的那一页——现实是它可能连看都没看一眼。腾讯系团队连出两篇 skill 论文：腾讯混元参与的 **Skill-Use 基准**先把全行业顶级模型拉去体检，腾讯优图和 IMA 的 **Capability Pages** 紧接着交出药方。核心判断：skill 用得好不好，主要不取决于模型，取决于 **harness 和文档**。

## 第一篇：Skill-Use（评测基准）

### 方法与数据

Skill-Use 模拟真实场景里的**渐进式披露**：Agent 一开始只看到 skill 的名字和一行描述，想用就得自己去把完整文档翻出来。基准收了 **79 个来自 GitHub 的真实 skill**，配上 **177 个可执行任务、九个领域**，每个任务在**隔离 Docker 沙箱**里真跑，按执行轨迹打分。

评分拆成三刀，最后合成一个 **SU 分数**：
- **Trigger**：该调的时候调了吗
- **Compliance**：规定流程走完了吗
- **Boundary**：禁止操作碰了吗

不触发，后面做得再好也是零分。

### 主结果

八个前沿模型、两个当家 harness（Claude Code 和 Codex）的成绩：最强的 GPT-5.5 跑在 Claude Code 里，SU 也只有 **0.613**，刚过及格线。

结构性发现：
- **Boundary 全线高于 Compliance**——模型不去做禁止的事挺可靠，把规定流程完整走下来反而难。
- **触发和遵循是两个独立瓶颈**：DeepSeek-V4-Pro 的触发率只有 0.324，但只要触发了，条件合规 0.588 并不输给 SU 高它一倍的模型。卡住它的不是不会做，是没想到要去做。

### 换个壳，成绩单重写（harness 依赖）

- 同一个 GPT-5.5，在 Claude Code 里是全场第一（SU 0.613），搬进 Codex 直接掉到 0.503。
- Claude Opus 4.8 反过来，在 Codex 里登顶（0.559）。
- 中档开源模型跨 harness 的任务级相关性只有 0.28-0.29，换壳之后有些模型反而涨分。
- 作者表述：**skill 使用是以 harness 为条件的属性，不是模型的固定属性**。

### 一线团队实用数字

- **库规模**：从 1 个 skill 加到 10 个，成绩断崖式下跌；之后加到 30 个反而没什么变化——大部分失败不是选错，是压根没调用。
- **生死线**：把 779 次带 skill 的运行和关掉 skill 库的基线一一配对，SU 低于 0.5 时，用 skill 比不用还糟——模型承诺了规定的工具链和格式却走不完，半途而废比从头自由发挥伤害更大。
- 范围内最会跟流程的模型，范围外滥触发也最狠，Claude Opus 和 GPT-5.5 包揽了大多数不当调用。

## 第二篇：Capability Pages（检索）

第二篇接着第一篇的瓶颈往下挖：既然触发/检索是主要瓶颈，为什么检索老是失败？答案反直觉——**问题一大半出在被检索的文本本身**。

### 可执行区域与有损观测

论文把一个 skill 真正能解决的查询集合定义成它的**可执行区域**，而 skill 文档只是这个区域的**有损观测**。两个 skill 文档写得几乎一样、实际能力不同时，论文给了一个**数学下界**：任何只读文档的检索器都无法区分它们，编码器再强、重排序再精也救不回来。

真实案例（MedCalc-Bench）：一个明确要求 Bazett 公式校正 QT 间期的查询，Rautaharju 校正器以 77.79% 排第一，正确的 Bazett 计算器 77.66% 屈居第二——差 0.13 分，两份文档都写着用心率校正 QT，区别只是公式名字。

这个误差是**结构性的**：六个数据集上，正确 skill 挤进 top-10 的频率远高于登顶的频率，对最强的 Qwen3-Embedding-8B 这个缺口还有 29.6 分。

### 解药：让 skill 说清自己不是什么

既然文本里缺失的信息没法靠模型脑补，那就改文本。**Capability Pages** 给每个 skill 编一页三段式档案：
- **T⁺ 正向触发器**：什么请求该选我
- **T⁻ 负向边界**：什么请求长得像我但该找别人
- **B 判别性主体**：我的核心公式和决策规则

编译完全离线：先把 **26,262 个 skill** 聚成邻域簇，再让 DeepSeek-V4-Pro 读完整个簇、对比着邻居给每个成员写档案——**T⁻ 没法从单个文档推导，必须簇级对比才写得出来**，这是整套方法的关键。

部署讲究：索引侧只用 T⁺ + B + 原文，**T⁻ 只喂给路由器**。消融实验证明把 T⁻ 混进索引，三个密集检索器 Recall 反而全掉——把邻居的描述写进自我介绍，嵌入会往该拒绝的方向漂。

### 效果

- **检索侧**：五个检索器 Recall@10 平均 **+2.94 分**，越弱的检索器受益越大——BM25 直接 **+7.63**。
- **端到端侧**：四个执行器 × 六个数据集共 24 个组合，任务成功率平均 **+3.62 分**，BigCodeBench 上最高 **+7.53**。
- **中文迁移**：SSL-SkillDiscovery，同一个编码器不动，MRR@50 做到 **73.07%**。
- 前提：在线的模型和检索器一个都没换，涨的全是**文档工程**的分。

## 论文信息

1. **Skill-Use: Can LLMs Actually Use Skills in Agentic Harnesses?** — arXiv 2608.04828，GitHub: JinyiHan99/Skill-Use-Bench（腾讯混元）
2. **Skills Know Their Neighbors: Cluster-Contrastive Capability Pages for Skill Retrieval** — arXiv 2608.04482（腾讯优图 + IMA）

（End）
