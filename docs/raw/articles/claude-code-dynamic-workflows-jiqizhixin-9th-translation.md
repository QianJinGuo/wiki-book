---
sha256: 39d08c271e6246b84c17221f740acbfeeda1f644218c23a1e4aa6b7fb9476969
source: "https://mp.weixin.qq.com/s/YJFC1uk_dxsNQd3Jr7kOeA"
title: "Claude Code 团队成员亲述：动态工作流该怎么用（机器之心译本）"
author: Thariq Shihipar (Anthropic Claude Code 团队)
publisher: 机器之心
translator: 机器之心编辑部
date: 2026-06-05
type: article
ingested: 2026-06-05
review_value: 8
review_confidence: 8
review_recommendation: worth-reading
---

# Claude Code 团队成员亲述：动态工作流该怎么用（机器之心译本）

> 原文作者：Thariq Shihipar（@trq212, Anthropic Claude Code 团队）
> 原文地址：https://x.com/trq212/status/2061907337154367865
> 机器之心译本地址：https://mp.weixin.qq.com/s/YJFC1uk_dxsNQd3Jr7kOeA
> 发布时间：2026-06-05

> 机器之心导读：上周 Claude Code 发布了一个新能力"动态工作流"。该功能允许 Claude 根据具体任务即时编写定制化执行框架，协调多个子 Agent 并行工作，解决大规模、高并行、对抗性任务中的系统性失效问题。近日 Anthropic 工程师 Thariq 发了篇长文分享经验心得。

[本文为机器之心编辑部对 Thariq 同一篇官方博客的译本，与 [[entities/claude-code-dynamic-workflows-multi-agent-orchestration]] 已有 8 个 sources 实质内容相同（同一原文）。作为 9th source merge 到主 entity，此处仅保留译本特色与少量不同表述。]

## 译本特色

**署名结构**：「Anthropic 工程师 Thariq 发了篇长文，分享了他最初的工作流经验和心得。我们对此进行了全文整理译述。」—— 明确表明译本身份。

**版本号具体化**：「使用 Claude Opus 4.8 的动态工作流，Claude 现在能够生成针对你的特定用例定制的智能框架」—— 给出具体模型版本号（Opus 4.8）。

**场景引入示例更完整**（开篇 8 个示例 prompt 完整列出）：测试失败调试 / 会话错误挖掘 / Slack 工单根因 / 商业计划多视角拆解 / 简历排名 / CLI 工具命名 / User→Account 重命名 / 博客技术声明审查。

## 核心机制（一句话）

**动态工作流**执行一个包含特殊函数的 JavaScript 文件，这些函数帮助生成和协调子 Agent。动态工作流还可以决定一个 Agent 使用的模型类型，以及子 Agent 是否在独立的工作树中运行，从而让 Claude 选择所需的智能水平和隔离方式。如果工作流中断（例如被用户操作或终端退出），恢复会话时工作流可以从中断点继续执行。

## 三大失败模式

默认 Claude Code 框架在长时、大规模并行、高度结构化的对抗任务中容易出现：

1. **智能体懒惰（Agentic laziness）** — Claude 在处理复杂多步骤任务时可能提前停止（如只处理 50 条安全审查中的 20 条）
2. **自我偏好偏差（Self-preferential bias）** — Claude 倾向于偏向自己的结果或发现，尤其在需要验证或评估时
3. **目标漂移（Goal drift）** — 多轮操作中任务目标逐渐偏离（尤其压缩总结后，边缘案例/禁止做 X 的约束丢失）

**创建工作流可通过为不同目标分配独立上下文窗口的 Claude 实例来避免这些问题**。

## 六大常用模式

- **分类并执行（Classify-and-act）**：分类器 Agent 决定任务类型 + 路由到不同 Agent
- **分发并汇总（Fan-out-and-synthesize）**：任务拆分为多个小步骤 + 每步独立 Agent + 汇总步骤等待所有 Agent 完成
- **对抗性验证（Adversarial verification）**：子 Agent 输出由另一个 Agent 对照评判标准对抗性验证
- **生成并筛选（Generate-and-filter）**：生成多个想法 + 按评判标准筛选去重
- **竞赛（Tournament）**：多 Agent 以不同方式执行相同任务 + 评判 Agent 两两比较选最优
- **循环直到完成（Loop until done）**：循环生成 Agent 直到满足停止条件（无新发现/无更多错误）

## 十大使用场景（机器之心版完整保留 Thariq 原文）

迁移与重构 / 深度研究 / 深度验证 / 排序 / 记忆与规则遵守 / 根因调查 / 大规模分诊 / 探索与品味判断 / 评估 / 模型与智能路由。

## Token 使用预算

机器之心版特别强调：「**你可以为动态工作流设定明确的 Token 使用预算，以此限制单项任务所消耗的 Token 数量。你可以在提示词中直接指定预算额度，例如输入：'use 10k tokens'（使用 10k Token），系统便会自动设定相应的上限。**」

## 保存与分享

- 菜单按 "s" 键保存当前工作流
- 归档至 `~/.claude/workflows` 目录
- 打包为"技能"（Skill）分发：JavaScript 工作流文件放入技能文件夹，在 `SKILL.MD` 中引用
- 灵活性建议：提示 Claude 把技能中的工作流视为"模板"，而非必须逐字逐句执行的脚本

## 何时不宜使用

「**工作流**」是一项相对较新的功能。在许多应用场景下能带来事半功倍的效果，但并非每一项任务都必须依赖工作流；**若滥用反而可能导致消耗远超预期的 Token 资源**。大多数传统编程任务并不需要 5 个审查者组成的评审团。

---

**参考主实体（已含 8 个 sources）**：
- [[entities/claude-code-dynamic-workflows-multi-agent-orchestration]] — 完整多源整合的 dynamic workflows 主实体
