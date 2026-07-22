---
title: "IG-Bench：AI 生成论文 idea 的「想法基因组」谱系评测"
source_url: "https://mp.weixin.qq.com/s/_jskmg_sY5txJs0iVFbFiw"
source_site: "mp.weixin.qq.com"
source_author: "ChallengeHub"
ingested: "2026-07-14"
sha256: "1929dab88baa47dfb2bf93a2760c2cfe751f135daab61f501b949917c8f6bab9"
type: "raw-article"
tags: [ai-scientist, evaluation, scientific-lineage, ig-bench, idea-genome]
status: "ingested"
---

# IG-Bench：AI 生成论文 idea 的「想法基因组」谱系评测

> 上海交通大学 VisionXLab 联合 CMU、上海AI Lab、国科大、中科大、华东师大、微软等机构提出 IdeaGene 框架与 IG-Bench，把论文拆成可审计的「想法基因」，用 GenomeDiff 追踪继承、突变与丢失。arXiv: 2607.08758

## 核心问题

AI Scientist 等自动科研系统已能生成像模像样的论文，但现有评测只测检索准不准、事实错没错、文笔顺不顺。更关键的问题无人测过：**当一个 idea 声称「在延续某个研究方向」时，它有没有继承对的机制、修对的缺陷？**

## IdeaGene 框架

### 六种想法基因角色
1. **生态位（niche）**：问题环境
2. **机制（mechanism）**：可被继承的方法或设计
3. **观察（observation）**：驱动动机的经验现象
4. **局限（limitation）**：缺陷与瓶颈
5. **delta**：相对前作的修补与改动
6. **主张（claim）**：宣称的结果

基因提取四约束：有类型、有证据、最小自足、谱系相关。

### GenomeDiff
对齐前作/后作的基因，标为继承（INHERITED）、突变（MUTATED）、丢失（LOST）、新增（NOVEL）或外部引入（EXTERNAL）。最关键的判据：**驱动机制有没有被继承**。

### 六种演化动力学
1. **突变** ✅ 谱系 — 驱动机制继承/局部改动，生态位不变（YOLO→YOLOv2）
2. **适应辐射** ✅ 谱系 — 机制保留，搬进新领域（Transformer→ViT）
3. **杂交** ✅ 谱系 — 后代从多谱系引入驱动基因（CLIP+LLM→LLaVA）
4. **物种形成** ✅ 谱系 — 生态位相同，但机制被全新机制取代（Faster R-CNN→DETR）
5. **生态位竞争** ❌ — 同生态位无驱动继承
6. **隔离** ❌ — 无生态位共享也无驱动继承

## IG-Bench

- 1,961 条黄金谱系轨迹
- 1,085 个 Idea Genome 对象
- 920 条成对 GenomeDiff 记录
- 横跨 10 个科学领域
- 50 位硕博标注员，动力学标签一致率 84.7%

**IG-Exam**（闭合式）：42 种任务、1,029 道题，严格全对评分。四条能力轴：T1 基因抽象 → T2 继承追踪 → T3 演化推理 → T4 谱系验证。

**IG-Arena**（开放式）：三种设定（Question/Library/Lineage）× 种群演化分（PES）= 遗传 + 变异 + 选择。

## 实测结果

14 个 AI 科学家参测，**全场最高 27.3%**（GPT-5.5 + Claude Code）。

关键发现：
- 按能力轴：T1 最高 34.4% → T2 37.9% → T3 25.3% → T4 **17.4%**
- CLI 脚手架增益集中在 T2（检索依赖部分），T4 几乎无效甚至倒退
- 谱系上下文区分出「真能用上结构的系统」和「只是多读了几段文本的系统」
- PES 差距全由**遗传**维度解释（变异和选择几乎不动）
- **结论**：今天系统生产「像样」的速度 >> 生产「连贯」的速度

## 论文

- Ideas Have Genomes: Benchmarking Scientific Lineage Reasoning and Lineage-Grounded Idea Generation
- arXiv: 2607.08758
- 项目主页：https://visionxlab.github.io/IdeasHaveGenomes/
