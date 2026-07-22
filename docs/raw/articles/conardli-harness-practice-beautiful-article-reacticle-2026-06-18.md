---
sha256: f8beb74da1ed8bdf36e85dbcb85a391dc7e36c95b62320e15821326b69ebd016
source: "https://mp.weixin.qq.com/s/t0-HbOj-Z2_RcZZJRPpM9A"
title: "Harness 实践：将任何文字编辑成精美的文章"
author: ConardLi
publisher: code秘密花园
date: 2026-06-18
type: article
ingested: 2026-06-18
review_value: 8
review_confidence: 9
review_recommendation: strong
review_stars: 4
series: "ConardLi Harness 实践系列（第 2 篇）"
series_parts:
  prev: "Harness 实践：让 Agent 自动制作知识讲解视频"
  next: null
related: "[raw/articles/harness-engineering-comprehensive-guide-conardli]"
merge_target: "entities/harness-engineering-comprehensive-guide-conardli.md (第 2 来源)"
---

# Harness 实践：将任何文字编辑成精美的文章

> 作者：ConardLi（code秘密花园，花园老师） · 发布：2026-06-18 08:30
> **ConardLi Harness 实践系列第 2 篇**（第 1 篇：Harness 实践：让 Agent 自动制作知识讲解视频）

## 核心命题

> **好的 Harness 是可以迁移的**。

把同一套骨架用到完全不同的任务上（视频 → 文章）。视频 Skill 的 Harness 6 大核心（分阶段编排 + 文件化记忆 + 强制人工检查点 + 独立 Reviewer + 最小切片修复 + Reviewer 质检）几乎原样搬过来，把"文章→视频"换成"素材→精美文章"。

## Beautiful Article Skill 概览

**新开源**：
- **Beautiful Article Skill**：https://github.com/ConardLi/garden-skills
- **Reacticle 组件协议**（React + Article）：https://github.com/ConardLi/reacticle
- **11 套编辑级主题**：Tufte / Sottsass / Bayer / Freddie 等

## 8 个 Phase 流程

```
Phase 0  Intake               判断是否进入本 Skill + 初步文章类型
 ▼
Phase 1  Source → Markdown    URL/PDF/DOCX/MD/文本 → source.md + extraction-notes.md
 ▼
Phase 2  Editorial Planning   一份 plan.md（Brief / Outline / Theme / Assets 四段）
 ▼
Phase 3  Plan Checkpoint      ★Checkpoint 1 必须停
 ▼
Phase 4  First Spread         首屏 + 第一节 + 一个代表性视觉块
    └ ★Checkpoint 2 必须停
 ▼
Phase 5  Full Article Build   生成完整网页文章
 ▼
Phase 6  Final Review         三视角终审
 ▼
Phase 7  Repair               最小切片修复
 ▼
Phase 8  Delivery             ★Checkpoint 3 必须停 → 交付 article.html
```

**vs 视频 Skill 4 阶段对比**：阶段数 +1（Plan 和 First Spread 拆开）+ Checkpoint +1（First Spread 是新加的视觉气质控制点）。

## Reacticle 组件协议（核心创新）

**一句话定位**：
- Markdown 让**人**轻松写文章
- Reacticle 让**AI 可控地生成长文 HTML**

### 三个关键设计

1. **语义组件词汇表**
   - 提供 Article / Hero / Lead / Section / Subsection / Table / Quote / Formula / CodeBlock / Image / TOC / Conclusion 等组件
   - AI 只负责"组合"这些组件，结构和排版由库保证
   - **不需要 AI 决定"div vs section"、"h2 vs h3"、间距多少** → 稳定不崩版

2. **Raw 自由层（受契约约束）**
   - Raw 是"逃生舱"：任意 HTML/SVG/CSS/React 都能塞进 Raw
   - **硬约束**：Raw 里的所有样式必须消费约束好的主题 token → 给自由同时守住主题稳定性

3. **主题双轨制（CSS token + AI 读的 Markdown profile）**
   - 一份 CSS token 包：定义颜色/字体/间距/阴影等视觉变量
   - 一份给 AI 读的 Markdown：告诉 AI 这套主题该用什么配图风格、什么代码高亮、什么 Raw 惯用法、什么是反模式
   - 例：Tufte 主题 profile："这个主题追求数据墨水比，不要用渐变、不要用阴影、图表要极简、正文是主角"
   - 例：Sottsass 主题 profile："这是 Memphis 风格，可以用撞色、可以用黑描边、可以有轻微旋转的元素、但不要太正经"

### Reacticle vs Skill 的关系

| 层 | 职责 | 类比 |
|---|---|---|
| **Reacticle** | 运行时协议 | 乐高积木，管"输出表面稳不稳"。不规定怎么写作/规划/审阅 |
| **Beautiful Article Skill** | 方法论 + Harness | 拼装积木的说明书，管"整个生产过程稳不稳" |

## 文章类型与信息保留比例

| 类型 | 比例 | 适用 |
|---|---|---|
| 完整长文 longform | ~100% | 原文质量高、值得完整归档 |
| 研究报告 full-report | ~80% | 调研/技术评估/正式分析 |
| 教学步骤 tutorial | 80-100% | "跟着做就能跑通" |
| 概念解释 explainer | ~80% | 把机制/系统/算法讲明白 |
| 对话访谈 dialogue | ~80% | 播客/访谈/AMA |
| 工程审阅 review | 60-80% | PR/方案/事故/架构设计 |
| 观点评论 essay | 60-80% | 评论/评测/叙事/专栏 |
| 决策摘要 briefing | 40-60% | 给忙人看的，结论先行 |
| 交互式解释 interactive-explainer | ~25% 原文摘录 | 重构成可操作学习页 |

## 三视角终审

所有 Section 写完后，开**三个独立 SubAgent**：

| Reviewer | 维度 |
|---|---|
| **Editorial Reviewer** | 文章性、信息取舍、结构 |
| **Visual Reviewer** | 主题、Raw、配图、移动端 |
| **Technical Reviewer** | 构建、控制台、代码/公式、可访问性 |

**硬规则**：拿到质检结论后，**先修复，再汇报**。不能把"发现了什么问题"当成完成，真正完成的是"问题已经被修掉"。

## Harness 6 大核心（与视频 Skill 对照）

| 核心 | 视频 Skill | 文章 Skill |
|---|---|---|
| **上下文管理** | 启动时加载所有规范 | **渐进加载**：Phase 1 只看素材抽取；Phase 2 看 plan template；Phase 4/5 才读组件协议 + Raw 规范 + 主题 |
| **工具系统** | Agent 自带能力 | **统一工作区**：URL/PDF/DOCX/MD/文本 → source.md 一份；source/plan/review/article/sections/article/raw-blocks/ 固定结构 |
| **执行编排** | 4 阶段 + 2 Checkpoint | 8 阶段 + 3 Checkpoint；**铁律**：检查点禁止替用户做主 |
| **状态与记忆** | 文件化 | source.md + source.zh.md + extraction-notes.md + plan.md 是 Agent 工作记忆；写到后面直接回读 |
| **评估与观测** | 独立 Reviewer | Plan 阶段主 Agent 自查 + First Spread/Final Review 独立 SubAgent |
| **约束与恢复** | 视频协议 | **Reacticle 组件协议**（AI 写文章时用 Article/Section/Table/Quote/CodeBlock 承载；复杂视觉放进 Raw 但消费主题 token） |

### 上下文管理的具体实现（长会话细节）

**每写一节前，Agent 都要回看**：
- 当前 Section 的任务
- 组件协议
- Raw 规范
- 主题约束

**靠文件把自己拉回正轨**，减少写到后面风格和规则偏移的问题。

### 执行编排的铁律

> 检查点禁止替用户做主。

每个决策项必须独立列出、独立等用户答复。可以推荐（"我推荐 Tufte 主题，因为这篇数据多"），但不能说"已经替你选了 Tufte，不对告诉我"——**后者等于偷渡默认值**。

### 工具系统的并行安全

完整文章可能有很多节，**多 Agent 并行写**：
- 每个 Agent 只负责一个 section 文件
- 大型 Raw 放到独立的 raw-blocks/
- Article.tsx 只交给主 Agent 组装和排序

这样多 Agent 可以同时工作，又不会一起改同一个文件。

## 自进化机制

**所有关键质检审查和修复记录会落到本地文件**：
- `review/first-spread-review.md`
- `review/final-review.md`
- `review/repair-log.md`

**这些文件不只给人看，也给 Agent 看**。

同类任务跑多了以后，Agent 可以回看这些记录，分析之前哪些环节最容易出问题：
- 目录命名是不是容易写错
- Raw 是否经常过度设计
- 某类文章类型的信息保留比例是否需要调整

这些问题沉淀下来以后，就可以**反过来促使 Agent 优化 Skill 的规则、检查清单和默认策略**。**所以 Skill 会随着真实任务继续进化**。

## 一句话升华

> Harness 的价值：让 Agent 从"能做出一次效果"，变成"能稳定生产一类结果"。

> 做 Harness 也不一定要从零搭一个 Agent。把一个垂直任务用 Skill 做稳、做好，本身就是在做 Harness。

**可迁移的场景**（同一套骨架）：
- 周报：每周素材 → 结构化周报 HTML
- 播客 Shownotes：音频转录 → 精美笔记
- 课程讲义：教案 → 可交互讲义
- 技术文档：API Spec → 漂亮的开发者文档
- 产品发布页：PRD → 单页展示稿

**判断标准**：只要任务足够复杂，需要状态、流程、检查点和交付标准，这套骨架就有迁移价值。

## 与 wiki 既有内容的关系

**与 [[raw/articles/harness-engineering-comprehensive-guide-conardli|ConardLi Harness Engineering 综合性指南]]（2026-04-03 上一期）**：
- 上一期：综合性理论 + 6 大核心定义
- **本期：Beautiful Article Skill 实证 + 6 大核心的"迁移性"验证 + Reacticle 协议 + 自进化**
- **互补不重复**：理论 → 实践；通用 → 特化（视频 → 文章）

**与 [[entities/harness-engineering|Harness Engineering]]（290 行 5 source merged）**：
- Harness 理论 + 5 制品 + 3 阵营 + 5 原则
- **ConardLi 实践** = Harness 理论的**工程实现**（Phase 流程 + Checkpoint + 文件化记忆）

**与 [[entities/gufabiancheng-spec-for-complex-tasks-cc-codex|古法程序员 spec 写作]]（2026-05-25）**：
- 古法程序员 = spec 写作的通用框架（rule/docs/skill 三类目录 + skill 三层 + gate 四态 + edge 三种）
- **ConardLi Beautiful Article** = skill 三层架构的**特化应用**（编排层 + 阶段层 Phase 0-8 + 原子层 component-policy/raw-policy）
- **Beautiful Article 的 gate = ConardLi 9 套 Checkpoint + 三视角终审**

## ConardLi 系列潜力

- 第 1 篇：Harness 实践：让 Agent 自动制作知识讲解视频（已在 wiki 实体的 source 中）
- **第 2 篇：Beautiful Article Skill**（本篇）
- 预计第 3 篇：Reacticle 组件协议深度 / 主题系统 / 自进化机制深入

建议 cron pipeline 抓同作者系列时**优先 merge 到 `entities/harness-engineering-comprehensive-guide-conardli.md`**，第 4 篇以后可考虑拆分独立 entity。
