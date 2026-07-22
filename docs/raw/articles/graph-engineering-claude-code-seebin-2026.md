---
source_url: "https://mp.weixin.qq.com/s/x2oxCumvbeEaOXqHqmIK5w"
title: "Graph Engineering 来了：Claude Code 让 Agent 从一条直线变成一张图"
source: "Seebin"
author: "seebin"
ingested: 2026-07-22
sha256: 1d90ae63c98f13d7757f06b0d620b575fe4b3664a70263a930bb8ffb20537e3d
type: raw-article
tags: [graph-engineering, claude-code, dynamic-workflows, agent-orchestration, parallel]
---

# Graph Engineering 来了：Claude Code 让 Agent 从一条直线变成一张图

> 基于 @0xCodez 的 "Graph Engineering with Claude" 长文，整理 14 种可复用 Agent 图架构模式。

## 核心概念

- **节点**：一个工作单元（Agent / 明确任务），输入→输出
- **边**：依赖关系（这个节点的输出喂给那个节点的输入）

关键问题：每一条「然后」都要问——下一步读不读上一步的输出？不读就没有边，直接并行。

## 14 种模式

### 1. 契约驱动节点
输入有界、输出有界、只做一件事。Claude Code workflow 中通过 JSON schema 执行，subagent 被强制返回结构化数据。

### 2. 边即数据契约
用数据形状而非执行顺序命名边：产出形状 A，下游消费形状 A。边操作（flatten/dedup/filter）是纯 JS，免费。

### 3. 菱形拓扑（diamond）
fan-out → reduce → synthesize。标准形态：扇出收集广度，纯代码压缩信息密度，最后一个 Agent 写出答案。

### 4. 对抗性验证
验证节点坐在边上：试着推翻发现，活下来才通过。三种模式：
- 对抗性验证：N 个独立怀疑者反驳，多数存活才保留
- 多视角验证：正确性/安全性/可复现性不同镜头
- 裁判团：N 方案并行打分，从赢家嫁接亚军的精华

### 5. 运行时路由
路由节点检查结果决定下游路径，if/switch 控制。决策由 Claude 驱动，路由本身是确定性代码。

### 6. 故障隔离
`parallel()` 抛异常的 thunk resolve 成 null，`.filter(Boolean)` 就是隔离墙。更隐蔽故障：多个 Agent 并行写文件冲突 → 各自 git worktree 隔离。

### 7. 收敛循环（loop-until-dry）
持续 spawn 查找器直到连续 K 轮无新发现。关键细节：对**所有已见结果**去重，而非仅确认结果。

### 8. 模型分层
提取字段/分类工单用便宜模型，写报告/裁决发现用最强模型。`agent()` 的 `model` 选项路由到不同模型。

### 9. Pipeline vs Barrier
`parallel()` 是 barrier（最慢决定总耗时）。`pipeline()` 是流式（快的先完成）。默认 pipeline，只有真正需要全结果同时在场才用 barrier。

### 10. 让 Claude 自己画图
Dynamic Workflows 让 Claude 写编排脚本：三种入口（prompt 说 workflow / 跑 /workflows / ultracode）。

### 11-14. 6 个示例图
安全扫描、研究报告、逐文件移植、对抗性 diff 审查、定时生态扫描、未知规模发现。

## 三次范式演进

Prompt Engineering（句子）→ Loop Engineering（循环）→ **Graph Engineering（图）**

## 链接

- 原帖: @0xCodez "Graph Engineering with Claude"
- 已有实体: [[entities/claude-code-dynamic-workflows-multi-agent-orchestration]]（Claude Code Dynamic Workflows）
