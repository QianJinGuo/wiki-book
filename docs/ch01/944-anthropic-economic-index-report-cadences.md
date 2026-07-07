# Anthropic Economic Index report: Cadences

## Ch01.944 Anthropic Economic Index report: Cadences

> 📊 Level ⭐⭐ | 3.9KB | `entities/anthropic-economic-index-cadences-june-2026.md`

# Anthropic Economic Index report: Cadences

> **Background**：本文基于 Anthropic 2026 年 6 月发布的 Economic Index 报告。该报告是 Anthropic 持续追踪 AI 经济影响的系列研究，本版聚焦"Cadences"（节奏模式），首次引入小时级采样、会话产出分类器和 Economic Index Survey 三项方法论升级。

## 方法论升级

本版 Economic Index 有三项关键改进：

1. **更高采样率**：数据采样频率提升至小时级，可观察 AI 使用的日内节奏（此前仅月/周级）
2. **产出分类器**：新增 classifier 标注每次会话的具体产出类型（解释、代码、翻译、文档等）
3. **Chat vs API 拆分**：首次将 Claude Chat/Cowork 会话与 1P API 使用分开统计，揭示不同产品形态的使用差异

此外，Anthropic 于 2026 年 4 月启动 Economic Index Survey，通过隐私保护系统 Clio 关联使用数据与用户预期。

## Chapter 1：外部世界节奏对 AI 使用的影响

报告发现 Claude 使用呈现出与外部世界高度同步的节奏模式：

- **工作日/周末周期**：工作相关查询在周末显著下降，但高薪职业的下降幅度更小（周末仍需工作）
- **日内模式**：新闻类查询集中在早晨，睡眠建议高峰在凌晨 5 点
- **截止日期效应**：税务相关请求在报税截止日前激增
- **Cowork 长任务**：Claude Code 和 Cowork 的普及使会话从简单对话转向长时间 agentic 任务，传统对话 transcript 已无法完整捕捉 AI 使用方式

## Chapter 2：会话产出分析

产出分类器揭示了不同产品形态的产出差异：

- **Chat/Cowork**：以解释和说明为主（explanations），产出类型更依赖 Claude 的判断
- **Claude Code**：以代码和构建为主（building a website），Claude 自主性更高
- **翻译类任务**：产出高度确定（由源文本决定），Claude 自主性最低
- **Token 与价值关系**：产出消耗的 token 数量与其估计价值正相关——更复杂的任务产出更有价值的制品

## Chapter 3：用户预期调查（首次发布）

Economic Index Survey 揭示了用户预期与使用方式的系统性关联：

- **自动化程度与预期**：以最自动化方式使用 Claude 的用户，预期 AI 在未来一年承担更多任务
- **乐观态度**：这些高度自动化的用户反而最乐观，预期对薪资和工作产生正面影响
- **隐私保护**：通过 Clio 系统关联使用数据与调查数据，确保用户隐私

## 核心洞察

1. **AI 使用已深度嵌入经济节奏**：不是随机使用，而是与工作周期、截止日期、日内习惯高度同步
2. **产品形态决定使用模式**：Chat vs API vs Cowork 产出类型截然不同，不能一概而论
3. **自动化与乐观正相关**：最深度使用 AI 的用户最乐观，而非最焦虑——这对 AI 经济影响的悲观叙事构成反证

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/anthropic-economic-index-cadences-june-2026.md)

## 相关主题

- [Dario Amodei: AI Exponential Policy](../ch04/070-ai.html)
- [Exponential View: AI Economy $110B](../ch04/070-ai.html)

---

