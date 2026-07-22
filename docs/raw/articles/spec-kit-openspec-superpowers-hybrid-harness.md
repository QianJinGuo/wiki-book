---
title: "Spec Kit vs OpenSpec vs Superpowers：我为什么最后自己搭了一套"
source_url: "https://mp.weixin.qq.com/s/ZlTW-D0PIS0dQKhnb1_ldA"
source_site: "深入浅出AI"
author: "CCC"
ingested: "2026-07-08"
sha256: "dc15ef82e41308965202b920af622f51546cef88785f80180b8601fa64614705"
type: raw
tags:
  - spec-kit
  - openspec
  - superpowers
  - harness-engineering
  - brownfield
  - delta-spec
  - iron-law
  - ai-coding-workflow
---

> 最后我一个都没选。我拿 OpenSpec 做了底座，补上 Superpowers 式的纪律思维，再套一层自己的 Harness 工程，搭了一套更适合中大型团队棕地项目的方案。

## 三个框架各留了什么

### Spec Kit — 留「宪法思维」，丢「阶段门控」
- 拿：可验证的约束协议（Constitution），每一条都能量化验证
- 丢：9 步阶段门控，改动小时流程开销倒挂；对棕地项目结构性不匹配

### Superpowers — 留「铁律纪律」，丢「14 个 Skill 全链」
- 拿：铁律工程化（MUST/ABSOLUTELY 是针对注意力权重的精确调参），硬门控 + 反合理化
- 丢：全链 Token 消耗大；brainstorming 方向校准对棕地项目不够精确
- 对比：brainstorming（从零探索）vs grill-me（约束中生长）
- 核心洞察：LLM 的乐观偏见是 RLHF 训练副产物，约束力来自「违反就有后果」

### OpenSpec — 留「Delta Spec + 单目录收拢」，丢「无纪律 apply」
- 拿：Delta Spec（只写变化，四类操作 ADDED/MODIFIED/REMOVED/RENAMED），天然解棕地问题
- 丢：apply 阶段无纪律约束，实现质量靠 AI 自觉

## 自建三层架构

三层叠加：Harness 层（CLAUDE.md 约束）→ Skill 层（8 个 Skill，铁律执行）→ Spec 层（Delta Spec）

### 组件分层对照表

| 层 | 说明 | 例子 | AI 规则 |
|----|------|------|---------|
| L0 原始层 | 组件库原生，禁直接用 | antd Button | 禁止导入，review 即打回 |
| L1 封装层 | 二次封装，统一样式 | CustomButton | 优先使用 |
| L2 业务层 | 跨页面复用 | UserSelector | 搜到即用 |
| L3 页面层 | 页面级不复用 | DashboardHeader | 仅对应页面内 |

表自动维护：review 发现违规 → 判断规范缺失 → 补回 CLAUDE.md。四个月从 10+ 行长到 40+ 行，误用降 80%+。

### 流程裁剪

三种模式：full（完整链）、light（小改动）、bugfix（独立链路）

### 真实案例

用户管理列表加角色筛选，全程约 50 分钟。review 抓到 2 个问题（1 规范缺失 + 1 实现缺失），代码合入前拦截。
