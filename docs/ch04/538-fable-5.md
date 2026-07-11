# Fable 5 使用硬核指南：搞定未知盲区

## Ch04.538 Fable 5 使用硬核指南：搞定未知盲区

> 📊 Level ⭐⭐ | 4.3KB | `entities/fable-5-field-guide-unknowns.md`

> Anthropic Claude Code 团队成员 Thariq 撰写的 Fable 5 使用指南，核心观点是「地图不等于疆域」，提出四类未知数框架和一套在实施前、中、后不断发现未知数的迭代工作流。

## 地图 vs 疆域框架

**地图（Map）**：你交给 Claude 的东西——prompt、技能设定和上下文，代表你对要做的事情的描述。

**疆域（Territory）**：工作真正发生的地方——代码库、现实世界及其各种限制。

地图和疆域之间的落差，就是 **未知数（Unknowns）**。当 Claude 在工作中碰到未知数，它就得根据对你意图的猜测做出决定。要做的工作越多，Claude 可能碰到的未知数也就越多。

Thariq 认为，Fable 是第一个让他明显感觉到工作质量的瓶颈在于自己能不能把未知数讲清楚的模型。提前把计划做足并不总是够用——有些未知数只有深入到实现阶段才会暴露出来。

## 四类未知数

面对一个问题，Thariq 习惯把自己的认知拆成四类：

| 类别 | 含义 | 应对方式 |
|------|------|----------|
| **已知的已知（Known Knowns）** | 写进 prompt 的内容，明确告诉 Agent 想要什么 | 直接描述 |
| **已知的未知（Known Unknowns）** | 自己没想清楚，但清楚地知道自己没想清楚的部分 | 提问式访谈、头脑风暴 |
| **未知的已知（Unknown Knowns）** | 见到才会认出来、但从来不会主动写下来的标准和要求 | 原型验证、参考物 |
| **未知的未知（Unknown Unknowns）** | 完全没有考虑过的东西，包括不知道自己不知道的知识 | 盲区扫描（Blind Spot Scan） |

最擅长 agentic coding 的人未知数往往最少——他们对自己想要什么了如指掌，和代码库、模型行为都高度同步。但他们同样也在假设未知数的存在。减少并规划自己的未知数，正是 agentic coding 的核心技能。

## 与 Fable 5 协作的迭代工作流

Thariq 把和 Fable 一起工作的过程，描述成一个在实施之前、之中、之后不断发现自己未知数的迭代过程：

### 实施之前

1. **盲区扫描（Blind Spot Scan）** — 直接让 Claude 帮你找出未知的未知，告诉它你是谁、了解多少。适合在陌生领域开始新任务时使用。
2. **头脑风暴与原型（Brainstorming & Prototyping）** — 在未知的已知（看到才知道好不好）特别多的领域，让 Claude 一起做原型，尽早暴露决策点。
3. **提问式访谈（Q&A Interview）** — 让 Claude 反过来采访你，针对模糊或不确定的地方提问，优先问那些会改变整体架构的问题。
4. **参考物（References）** — 给 Claude 一个参考物（最好是源代码，不限语言），让 Fable 直接从实物中理解意图。
5. **写实施计划（Implementation Plan）** — 让 Claude 先做计划，把最可能变化的部分（数据模型、类型接口、用户体验流程）放在最前面供审阅。

### 实施过程中

6. **实施笔记（Implementation Notes）** — 让 Claude 维护一份 implementation-notes.md，记录偏离原计划的决定（Deviations），采取保守方案继续推进。

### 实施完成之后

7. **说明文档与汇报材料（Docs & Briefs）** — 将原型、规格实施笔记打包，方便评审者快速理解，展示未知数已被考虑。
8. **测验（Quiz）** — 让 Claude 出一份关于改动的测验，只有完全答对才合并代码，确保自己真正理解发生了什么。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/fable-5-field-guide-unknowns-ai-coding.md)

---

