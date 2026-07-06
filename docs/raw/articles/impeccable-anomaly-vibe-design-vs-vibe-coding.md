---
title: "AI 写前端 ≠ 设计 —— Anomaly 创始人对 Vibe Coding 哲学批判"
source_url: "https://mp.weixin.qq.com/s/4_9q9TrkVyE5a4jCfTrNgg"
publish_date: 2026-06-04
tags: [wechat, article, agent-skill, frontend, design, philosophy, antipattern, vibe-coding, ai-frontend]
review_value: 8
review_confidence: 7
review_recommendation: moderate
sha256: pending
---

# AI 写前端 ≠ 设计 —— Anomaly 创始人对 Vibe Coding 哲学批判
> 整理：Hermes Agent
> 原文：https://mp.weixin.qq.com/s/4_9q9TrkVyE5a4jCfTrNgg

## 一句话定位
**Anomaly Innovations 创始人（37 年设计 × AI 经验）公开撰文反驳 "vibe coding" 在前端的适用性**：代码能编译 ≠ 设计完成；vibe coding 适合软件工程，**不适合 design**——因为设计是定性的、主观的、上下文依赖的，AI 缺乏"判断"。

## 核心论点

### 1. "Vibe coding" 的边界
- **vibe coding**（Karpathy 概念）= 用自然语言描述意图，让 AI 生成可运行的代码 → **对软件工程有效**，因为代码是"对错分明"的
- **vibe design** ≠ design —— 同样方法套到设计上失败，因为设计是"无对错、但有好坏"的
- AI 在设计上**缺少的不是工具，而是判断力**：color theory、accessibility、typography、hierarchy、motion、consistency 6 大领域都需要"经验直觉"

### 2. 6 个 AI 前端常见失败类别
1. **色彩理论违反** —— 紫蓝渐变、对比度不足、品牌色胡乱搭配
2. **可访问性问题** —— 颜色对比、键盘导航、ARIA 标签、screen reader 体验
3. **排版细节** —— 字距、行高、字号节奏、字重对比
4. **视觉层次混乱** —— 没有明确的 F-pattern / Z-pattern、CTA 不突出、信息密度不均
5. **动效过度** —— 渐变慢、缓动曲线怪、注意力被吃掉
6. **一致性缺失** —— 同页面内组件风格跳跃、间距不统一、icon set 混用

### 3. 解决方案：Rule + Skill（不是 Rule-only）
- 单纯写"rules"到 CLAUDE.md 不够 —— rules 是声明式约束，AI 容易**选择性遵守**或在长上下文里"漂移"
- **Skill（带命令 + 上下文 + 检测器）才是结构化修复** —— 主动触发 + 检查 + 反馈闭环
- 推荐组合：2-3 个设计 skill + 一组硬规则（颜色、字号、间距） = 可持续的设计工作流

### 4. 关于 Anomaly 的产品
- **Anomaly AI Hero** —— 内部使用产品，定位"AI 设计助手"，但**不直接给成品**，而是"给设计师检查 + 改稿用"
- 哲学："AI 不替代设计师，而是给设计师一个**永远不会累、不会忘规则的 junior**"
- 创始人在文章末尾明确推荐读者去看 [pbakaus/impeccable](https://github.com/pbakaus/impeccable) 仓库 —— 即本文 wiki 中已记录的 33.4k⭐ 项目

## 哲学意义
- **第一次有"资深设计师"明确反驳 vibe coding** —— Karpathy 概念在软件工程被广泛接受，但在设计领域开始受到挑战
- **"Code is correct or not, design is good or not"** —— 这条边界划清后，未来 AI 工具在前端的定位会更加细分
- 预言：未来前端 AI 工具会分化成两类 —— ① 纯 vibe coding 工具（给开发者原型用）② 设计 skill 工具（给设计师做品控用）

## 与已有 wiki 实体的关系
- → [[entities/impeccable|Impeccable]] —— 文章末尾直接推荐此项目，本文是"为什么需要 Impeccable"的哲学背书
- → [[entities/karpathy-vibe-coding-to-agentic-engineering|Karpathy Vibe Coding → Agentic Engineering]] —— Karpathy 原始概念出处
- → [[entities/vibe-coding-agentic-engineering-convergence-simon-willison|Vibe Coding → Agentic Engineering Convergence]] —— Willison 的同主题回应
