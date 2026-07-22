---
title: "AI 编码总失控？MattPocock Skills 用 21 个 skill 给 Agent 上工程纪律"
source_url: "https://mp.weixin.qq.com/s/4hHFC5SxQwVGMn-zfbSJUg"
source_author: "术哥无界（运维有术）"
source_site: "术哥无界 (微信公众号)"
ingested: 2026-07-13
sha256: "ecb6fdfd5ef1a628174374ef4c963c2a6d4a60bb32f401f1e043fff89ce2d960"
score_value: 8
score_confidence: 8
score_stars: 4
score_vxc: 64
---

# AI 编码总失控？MattPocock Skills 用 21 个 skill 给 Agent 上工程纪律

> 术哥无界 | 运维有术
> 2026年7月13日 08:30 山东
> 系列：AI编程最佳实战「2026」第51篇
> 项目：mattpocock/skills v1.1.0 (GitHub)

## 项目定位

mattpocock/skills 是 Total TypeScript 创始人 Matt Pocock 开源的一套 AI Agent 技能库，面向真实工程，不是 vibe coding。包含 21 个正式 skill，把需求澄清、TDD、调试、架构治理翻译成 Agent 可执行的纪律。

理论基础引用四本经典：《The Pragmatic Programmer》《Domain-Driven Design》《A Philosophy of Software Design》《Working Effectively with Legacy Code》。

## 核心架构：两层调用分层

每条 SKILL.md 的 `disable-model-invocation` 字段决定调用方：

| 类型 | 触发方 | 上下文成本 |
|------|--------|-----------|
| User-invoked (true) | 用户手动输入 /skill-name | 零 context load |
| Model-invoked (省略) | 用户或模型自动触发 | description 占每轮上下文 |

**铁律**：user-invoked skill 永远不能调用另一个 user-invoked skill。

`ask-matt` 作为路由器存在，是 user-invoked skills 之间的索引层。

## 主线流程：idea → ship

### 需求澄清
- `grill-with-docs`（有 codebase）/ `grill-me`（无 codebase）→ 底层调 `grilling`
- v1.1.0 关键演进：**facts 和 decisions 分离**
  - Facts：Agent 自己查代码，不问用户
  - Decisions：必须问用户，等答案
- 新增 **confirmation gate**：没有用户确认，不许 enact the plan

### 规划与拆票
- `to-spec`（整理规范）→ `to-tickets`（拆票）
- 借用经典概念：**Tracer bullet**（垂直切片）、**Blocking edges**（阻塞依赖）、**Frontier**（可领取票据）

### 实现与评审
- `implement` → `tdd` → `code-review`
- `tdd` 重构为纯 reference 文档，refactor 阶段划给 `code-review`
- 三大测试反模式：Implementation-coupled、Tautological、Horizontal slicing

## wayfinder（v1.1.0 新增）

适用绿地项目或巨型功能。借鉴战争迷雾概念：
- **Destination**（终点）、**Map**（issue 标签）、**Fog of war**（模糊区域）、**Frontier**（开放子 issue）
- 四种 ticket：Research (AFK)、Prototype (HITL)、Grilling (HITL)、Task (HITL/AFK)
- 铁律：never resolve more than one ticket per session
- 定位：plan, don't do（产出决策，不产出交付物）

## code-review：两轴并行

作为两个 parallel sub-agents 运行：
- **Standards 轴**：repo 编码标准 + Martin Fowler 12 个 code smell
- **Spec 轴**：忠实实现 originating issue/PRD/spec

## CONTEXT.md

严格只放 glossary，不放实现细节、临时笔记、架构决策。仓库自己的 CONTEXT.md 只定义三个术语：Issue tracker、Issue、Triage role，显式标注 `backlog` 因歧义被淘汰。

架构决策走 ADR，三条触发条件同时满足才写：Hard to reverse、Surprising without context、Result of a real trade-off。

## diagnosing-bugs：调试纪律

- **Phase 1 核心**：构造 tight + red-capable 的反馈循环
- 完成判据：Red-capable、Deterministic、Fast（秒级）、Agent-runnable
- 核心纪律：先造能复现的命令，让命令告诉你答案，而非先读代码猜原因
- Phase 3：列 3-5 个 ranked hypotheses 对抗锚定效应
- Phase 6：架构问题交接给 improve-codebase-architecture

## writing-great-skills：元设计

- **Leading word**：用模型预训练中已有的紧凑概念锚定一整套行为（如 tight、red、fog of war、tracer bullet）
- v1.1.0 新增失败模式：**Negation**（不要做 X 反而激活 X）、**Negative Space**（未写的部分也在影响行为）

## 版本管理与定位

- 使用 changesets 做 versioning
- 对标 GSD、BMAD、Spec-Kit：不接管流程、小可改可组合、跨 Agent（Claude Code、Codex 等）
- 安装：`npx skills@latest add mattpocock/skills`
