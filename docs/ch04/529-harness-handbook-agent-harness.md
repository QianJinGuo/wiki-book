# Harness Handbook — 行为级 Agent Harness 手册：可理解、可审计、可编辑

## Ch04.529 Harness Handbook — 行为级 Agent Harness 手册：可理解、可审计、可编辑

> 📊 Level ⭐⭐ | 5.0KB | `entities/harness-handbook-tencent-behavior-level-manual-2026.md`

# Harness Handbook — 行为级 Agent Harness 手册：可理解、可审计、可编辑

> **Background**：本文档基于腾讯 HY LLM Frontier 与 Indiana University 联合发布的 Harness Handbook 研究项目建立。该项目提出用三层行为级手册（L1-L3）组织 agent harness 代码，使复杂 system 行为可浏览、可验证、可修改。参考了项目官网、GitHub 仓库、Handbook Studio Demo 多源信息。

## 核心问题

Agent harness 的 behavior 散布在数千个文件中（Codex 有 2,267 文件、34,000+ 函数、160,000 代码连接），传统文件树展示"代码在哪里"但不展示"这些代码如何协作产生行为"。搜索 `delete`、`permission`、`confirm` 只返回散落的片段，无法重建完整的 behavior chain。

Harness Handbook 的核心洞见：**问题不是缺少代码，而是缺少从 behavior 到 implementation 的路径**。需要一个组织概念——behavior——来连接 execution 和 code。

## 三层结构（L1-L3）

| 层级 | 回答的问题 | 产出 |
|------|-----------|------|
| L1 · System Overview | 这个 harness 整体怎么运行？ | 架构、执行流、主要阶段、状态流 |
| L2 · Behavior-Unit Overview | 有哪些 behavior unit，它们怎么连接？ | 职责、输入/输出、依赖、关键状态 |
| L3 · Behavior-Unit Detail | 这个 behavior unit 如何执行？ | 触发条件、状态变化、异常路径、代码证据 |

每层保留可验证的代码证据链接，读者可以检查每个解释并在源码中验证。

## Behavior-Guided Progressive Disclosure (BGPD)

BGPD 将 behavior question 转化为可追踪的证据路径：

```
行为问题 → L1 系统上下文 → L2 定位相关 behavior unit → L3 打开展示实现细节 → 代码证据
```

每个步骤只揭示当前决策需要的信息。理解、审计、修改共享同一个证据路径。

## Handbook 生成流程

采用 facts-first 方法，而非让模型逐文件总结：

1. **提取事实** → 程序图（静态分析：文件、函数、调用关系、状态读写、配置边界）
2. **按行为组织** → 行为图（proposer-reviewer 循环，直至收敛）
3. **合成手册** → L1-L3 渲染（每段 prose 锚定在提取的程序事实上）

> "prose explains; facts anchor"——每一个 claim 都链接到可验证的代码证据。

## 评估结果

使用相同 coding agent 在 Terminus-2 和 Codex 两个生产 harness 上对比，仅变化是否提供 Handbook。三个独立 judge（GPT-5.5、Opus 4.8、DeepSeek-V4-Pro）：

- **Preference rate**: Handbook 辅助 planner 赢得更多配对比较
- **Token cost**: 更少的 planner token/case
- **Localization quality**: recall、precision、F1 全面上升
- **Wrong cases**: planner 定位到错误 subsystem 的情况急剧下降
- **跨难度**: 优势在 Easy/Medium/Hard 任务中均持续存在

评估分组三种 request type：Q（调整现有行为）、CF（跨文件添加能力）、SH（search-hostile——隐藏在对执行路径中）。Handbook 在三种类型中均有帮助。

## Handbook Studio

Interactive workbench —— 连接仓库 → 生成三层 Handbook → 在同一行为图上阅读/验证/提议修改。用户以行为级意图发起改动（如"让这个命令携带自己的环境变量"），系统定位所有 affected implementation sites（14 个代码点、10 个文件）并生成可审查的 edit plan 和 diff。

## 与其他 Harness 实体的关系

已有大量 [agent harness 架构](../ch05/039-agent-harness.html) 实体覆盖 harness 的设计模式、组件和工程实践。Harness Handbook 提供了不同的角度——**以 behavior 为核心的导航系统**（而非以组件/模块为核心）。它与以下实体互补：

- [Harness Engineering](../ch05/115-harness-engineering.html)、[Harness Engineering Framework](../ch05/115-harness-engineering.html)（工程范式）
- [Agentic Loop Engineering](../ch05/007-loop-engineering.html)（loop 工程）
- [Agent Harness 12 Components](../ch05/039-agent-harness.html)（组件架构）
- [Better Harness Eval](../ch05/018-harness.html)（评估方法）

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/harness-handbook-tencent-ruhan-wang-2026.md)

---

