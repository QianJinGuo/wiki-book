---
title: "Spec-Driven Development (SDD) 全面总结: 从 \"5人7天\" 案例到方法论全集"
type: source
source: wechat
source_url: "https://mp.weixin.qq.com/s/hVizUucsy8rwFOUR-VZ6wA"
sha256: 7f06952c9a79ead9c7718a48e38c3bf3d13c3c5ecf7738e79d8258644c2d82c1
ingested: 2026-07-02
authors: [王砚舒, 阿里云开发者]
---

# Spec-Driven Development (SDD) 全面总结: 从 \"5人7天\" 案例到方法论全集

来源: 阿里云开发者 | 王砚舒

## 1. 核心案例: 5人7天干完20人数周的活

团队使用 Qoder 与 SDD 方法，在 7 天内交付了 QoderWork 产品，完成了传统需要 20 人数周的工作量。

核心洞察: 答案藏在 DAY 0。Spec 是整个项目的锚点。效率高的原因不是 AI 写代码快，而是 Spec 约束下的人机协作没有失控。

## 2. 什么是 Spec-Driven Development (SDD)?

Spec-Driven Development：将规格说明（Specification）作为唯一真实来源（Single Source of Truth），代码作为其派生产物。先定义 WHAT，再让 AI 做 HOW。

SDD 是为 AI 编程时代量身定制的工程方法。在传统开发中，Spec 影响沟通效率；在 AI 时代，Spec 的质量直接决定代码质量。

行业共识（2025年多方向同时收敛）：
- Karpathy Vibe Coding (反面参照，暴露了无约束致命问题)
- GitHub Spec Kit (Agent-agnostic 工具链)
- AWS Kiro (内置 SDD 工作流的 IDE)
- Fission-AI OpenSpec (轻量迭代路线)
- 阿里 QoderWork (Quest 模式规模化执行)

## 3. SDD 四阶段模型与三文件体系

### 四阶段模型
Specify（规格定义）-> Plan（方案规划）-> Implement（代码实现）-> Validate（验证确认）

核心原则：人定义 WHAT，AI 实现 HOW。

### 三文件体系 (GitHub Spec Kit)
- spec.md: 需求规格 / 唯一真实来源。回答"做什么"和"为什么做"，不涉及"怎么做"。
- plan.md: 架构方案。基于 spec.md 生成，AI 起草，人审核修改。
- tasks.md: 任务清单。拆解为可执行的原子任务。
- constitution.md: 不可变项目原则。项目级别的"宪法"，所有 Spec 都必须遵守。

### 好 Spec 六要素
Problem Statement / Success Metrics / User Stories / Acceptance Criteria / Non-Goals / Constraints

### 粒度检验标准
"用不同技术栈实现这个 Spec，Spec 是否仍然有效？" 如果无效，说明你把 HOW 混进了 WHAT。

## 4. SDD vs Vibe Coding
Vibe Coding 的"三个月墙"：无约束 AI 编程在项目初期效率极高，但 3 个月后代码重复率、安全漏洞、技术债指数级增长。

## 5. 工具生态
- GitHub Spec Kit: Agent-agnostic 框架，三文件 + constitution
- OpenSpec (Fission-AI): 轻量迭代工具，对话式迭代
- Kiro (AWS): SDD-native IDE
- QoderWork (阿里): Quest 执行引擎

## 6. 数据
- API 变更周期缩短 75%
- 代码错误率减少 50%
- Stripe 交付 1,300 个 AI PR 未引发系统性问题
- 无 Spec AI 编程 45% 代码含安全漏洞
