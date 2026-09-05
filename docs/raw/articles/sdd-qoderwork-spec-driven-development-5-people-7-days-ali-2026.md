---
source: rss
source_url: https://mp.weixin.qq.com/s?__biz=Mzg4NTczNzg2OA==&mid=2247511376&idx=1&sn=24f1d3ed57ccb6b4faad4a1aaac091bd
ingested: 2026-09-05
feed_name: WeChat-阿里技术
source_published: 2026-09-04
authors: [王砚舒（彦纾）]
sha256: e129223d9949d182d691b7c62b03ee61dedc4c6c6dfc41bf331be820e98e532f
---

# 5 人 7 天干完 20 人数周的活：Spec-Driven Development 如何重新定义 AI 编程

王砚舒（彦纾） 2026-09-04 18:08 浙江

关于 SDD，本文或许能提供一些经验和思考。这是2026年的第 58 篇文章。

## 前言：「5 人 7 天」实验

本文分享一个案例。5人、7天，用 Qoder 开发 QoderWork，完成了传统情况下需要 20 人数周的工作量。它的时间线值得逐日复盘：

- **DAY 0：不写一行代码，只写 Spec。** 团队花了一整天做四件事：定义 MVP 边界、拆解模块、为每个模块撰写 Spec、将所有 Spec 汇入 Repo Wiki。这一天的产出是零行代码，但它决定了后面六天的一切。
- **DAY 1-2：用 Qoder 完成架构开发。** 框架与容器同步开发。每个人都是 "Spec 工程师"，即定义代码应该长什么样的人；通过 Skill 驱动并行推进，Quest 模式同时执行多个开发任务。两天时间，系统骨架成型。
- **DAY 3-4：Spec 迭代增量需求。** 发现新需求或 BUG？不用排期，立即写一个增量 Spec，委派 Quest 执行。AI 自动写代码并提交 PR，人负责 Review 与合并。
- **DAY 5-6：打磨、Dogfooding。** 用 QoderWork 的早期版本测试 QoderWork 自身。发现问题就写 Spec，Quest 修复。这是一个自举式的正反馈循环。
- **DAY 7：正式发布上线。** 七天，从零到一个可用的产品。

为什么 5 个人能驾驭 AI 同时推进这么多并行任务而不失控？答案藏在 DAY 0。那一天写下的 Spec 是整个项目的锚点。这套方法论有一个正式的名字：Spec-Driven Development（SDD）。

## 01 SDD 是什么：代码只是 Spec 的副产品

### 1.1 一句话定义

Spec-Driven Development：将规格说明（Specification）作为唯一真实来源（Single Source of Truth），代码作为其派生产物。先定义 WHAT，再让 AI 做 HOW。

SDD 的核心差异在于，它是为 AI 编程时代量身设计的工程方法。在传统开发中，Spec 写得好不好主要影响沟通效率；在 AI 编程时代，Spec 写得好不好直接决定代码质量。因为 AI 不会追问"这个边界情况怎么处理"，它只会按照用户给的上下文尽力推断。推断对了是运气，推断错了是 Bug。

### 1.2 不是一个人的发明，而是一个时代的汇聚

SDD 没有单一发明者。2025 年，多个方向同时收敛到了这个理念：

- **Karpathy 的 Vibe Coding（2025.2.2）** 作为反面参照，暴露了"不管代码、只管 vibes"的致命问题，倒逼社区思考"AI 编程到底需要什么样的约束"。
- **GitHub 推出 Spec Kit**，提供了 agent-agnostic 的 SDD 工具链。
- **AWS 发布 Kiro**，成为第一个内置 SDD 工作流的 IDE。
- **Fission-AI 的 OpenSpec**，走轻量迭代路线。
- **阿里的 QoderWork**，通过 Qoder Quest 模式实践了 SDD 的规模化执行。

这种多方同时推动的局面，说明 SDD 是 AI 编程发展到当前阶段的结构性需求。

### 1.3 Microsoft 的那句点评

> "SDD is version control for your thinking."

传统的版本控制管理的是代码的演变历史，SDD 管理的是思考的演变历史：为什么做这个功能、边界在哪里、成功标准是什么。当代码可以被 AI 秒级重写时，真正有价值的是代码背后的决策。

## 02 SDD 完整流程拆解

### 2.1 四阶段模型

SDD 的标准流程分为四个阶段：Specify（规格定义）→ Plan（方案规划）→ Implement（代码实现）→ Validate（验证确认）。

| 阶段 | 主导者 | 核心产出 | 关键动作 |
|---|---|---|---|
| Specify | 人 | spec.md | 定义问题、边界、成功标准 |
| Plan | 人 + AI | plan.md | 架构选型、模块划分、接口定义 |
| Implement | AI | 代码 + 测试 | 按 plan 逐任务实现 |
| Validate | 人 + AI | 测试报告 | 自动化测试 + 人工 Review |

人机分工的核心原则：人定义 WHAT，AI 实现 HOW。实践中 Specify 和 Plan 之间有多轮迭代，Implement 和 Validate 之间也是持续循环的。

### 2.2 三文件体系：Spec Kit 的核心设计

GitHub 的 Spec Kit 提出一个简洁的三文件体系：

**spec.md —— 需求规格**（唯一真实来源）：回答"做什么"和"为什么做"，不涉及"怎么做"。特征：成功标准可测试（如"P95 < 50ms"而非"系统应该很快"）、Non-Goals 明确划边界（告诉 AI 这些不要做）、Constraints 约束技术选型（防止 AI 自作主张引入新组件）。

**plan.md —— 架构方案**：基于 spec.md 生成的技术方案，通常由 AI 起草、人审核修改。包含 Architecture Decision（如采用 Casbin 权限引擎）、Module Breakdown、Interface Contracts（RESTful API 定义）、Risk Assessment。

**tasks.md —— 任务清单**：将 plan 拆解为可执行的原子任务，每个任务对应一个可独立验证的交付物。

### 2.3 constitution.md：不可变的项目原则

除了三文件体系，Spec Kit 还引入一个重要概念 **constitution.md**——项目级别的"宪法"，定义不可违背的约束条件，所有 Spec 都必须遵守。涵盖 API Design（RESTful 规范、RFC 7807、OpenAPI 3.0）、Security（输入校验清洗、敏感数据不入日志、参数化查询）、Code Quality（覆盖率、文档注释、依赖审计）、Infrastructure（优雅关闭、环境变量注入、结构化日志）。

constitution.md 的价值在于把团队的技术决策固化为 AI 的「潜意识」。没有它，每个 Spec 都需要重复声明基本约束。

## 03 Spec 怎么写：好 Spec 与坏 Spec 的生死线

Spec 写作是 SDD 中最关键、也最容易被低估的环节。DAY 0 花整整一天写 Spec，正是因为 Spec 的质量直接决定了 DAY 1-6 的效率。

### 3.1 好 Spec 的六要素

| 要素 | 作用 | 示例 |
|---|---|---|
| Problem Statement | 定义"为什么做" | "当前系统不支持细粒度权限控制" |
| Success Metrics | 定义"做到什么程度算完" | "P95 < 50ms，覆盖 20+ 权限类型" |
| User Stories | 定义"谁在什么场景下用" | "作为管理员，我可以创建自定义角色" |
| Acceptance Criteria | 定义"怎么验证" | "单用户多角色，权限取并集" |
| Non-Goals | 定义"不要做什么" | "本期不实现跨组织权限委托" |
| Constraints | 定义"必须怎么做" | "复用现有 PostgreSQL，不引入新存储" |

本文后续还覆盖了坏 Spec 的典型特征、Spec Review 方法、工具生态（Qoder Quest / Spec Kit / OpenSpec）、以及官方与非官方工具链的对比与硬数据验证等完整 SDD 方法论内容。