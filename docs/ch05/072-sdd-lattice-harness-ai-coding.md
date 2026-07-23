# 从渐进式 SDD 到 Lattice Harness：AI Coding 团队级闭环实践

## Ch05.072 从渐进式 SDD 到 Lattice Harness：AI Coding 团队级闭环实践

> 📊 Level ⭐⭐ | 6.9KB | `entities/sdd-practice-lattice-harness-team-ai-coding.md`

## 核心概述

Individual SDD（Spec-Driven Development）向团队级 Harness 演进的完整实践指南。核心论点：Spec 只能解决 0→80，剩下 20 分需要 Context Engineering、独立 Verification、Drift Check、Evidence 系统和 Loop。提出了 Lattice——一个 repo-local AI Coding control plane，把交付控制点变成仓库内可版本化的 contracts。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/sdd-practice-lattice-harness-team-ai-coding.md)

## 五大工程缺口

1. **Context 缺口** — 关键业务规则没进 Spec → 可审计的项目上下文
2. **裁判缺口** — 谁判断做对了 → 独立 Verification（执行者不能做最终裁判）
3. **追踪缺口** — 验收标准、测试、代码、证据没有链路 → AC 覆盖（AC-1/AC-2 编号追踪）
4. **漂移缺口** — API/schema/error code 会和 Spec 腐化 → drift check
5. **学习缺口** — 失败经验不回流 → loop state + learn draft

## Lattice 架构

6 层 control plane：Spec → Context → Orchestrator → Verification → Evidence → Learning。全部 repo-local，不依赖外部平台。

### Context 工程
- 只放 AI 推不出的约束（业务不变量、历史事故、架构决策）
- 三层结构：Context Map（地图）→ Project Knowledge（知识）→ Context Basis（本次采用依据）
- 知识自下而上蒸馏：交付现场 → learn draft → project knowledge → 中心知识

### Verification
确定性 gate 优先（build → lint → unit-test → ac-coverage → drift-check → compliance）。Agent 可参与修复，但通过与否由外部信号决定。

### Drift 检测
新增 error code/API route/DB schema 时检查是否在 Spec 中预期或注册。

### Loop
有边界、有裁判、有升级机制的状态机（执行→验证→判定→修复→验证）。Judging 环节必须独立。Learn Draft：失败记录 → promote → knowledge 沉淀。

## 深度分析

### 1. Spec Coding 的天花板：0→80 之后还有 20 分

本文的核心论点是：Spec-Driven Development 能解决 80% 的路径收敛问题——有了明确的 Spec，AI 不会从"一句话需求"直接跳到"随机代码"。但剩下的 20 分需要一套完整的工程体系来支撑：Context Engineering 确保关键业务规则进入决策过程，独立 Verification 解决"谁来判断做对了"的问题，Drift Check 防止 Spec 和代码逐渐腐化，Evidence 系统提供可审计的交付记录，Loop 机制让失败经验回流成组织知识。这 20 分才是从个人效能到团队级交付的核心跃迁。

### 2. "执行者不能做最终裁判"——独立 Verification 的工程哲学

Lattice 架构中最核心的原则是"执行者不能做最终裁判"。同一个 Agent 可以写代码、修失败、补测试，但不能只凭自己的解释宣布"已经通过"。这一原则在 Verification 层的实现是"确定性 gate 优先"：build → lint → unit-test → ac-coverage → drift-check → compliance，每个 gate 由外部信号（而非 Agent 自我评价）决定通过与否。这与 [Agent Harness 架构](ch05/039-agent-harness.html) 中"Harness 作为可信中介"的设计理念一脉相承。

### 3. Context 工程的三层结构：地图→知识→依据

Lattice 的 Context 工程提出了一个可操作的三层结构：Context Map（地图）提供项目范围的认知索引，Project Knowledge（知识）沉淀已验证的业务不变量和历史事故，Context Basis（本次采用依据）则记录本次交付中实际使用的上下文依据。更重要的是知识的蒸馏路径——从交付现场的失败记录（learn draft）开始，经人工或 Reviewer 确认后 promote 到 Project Knowledge，再进一步蒸馏到中心知识库。这是一个自下而上的知识沉淀体系，而非从上而下的目录编制。

### 4. Loop 不是无限自修复，而是有边界的失败分类机制

本文对 Loop（执行→验证→判定→修复→验证）的定义值得注意：Loop 不是无限自动修复，而是有边界、有裁判、有升级机制的状态机。关键状态 Judging 必须独立存在——可以是确定性 gate、只读 Reviewer 或人工确认。当修复尝试达到上限或发现不可自动修复的问题时，应有明确的升级路径（escalation）。这种设计避免了 AI Coding 中最常见的陷阱：Agent 陷入"修了又坏、坏了又修"的无限循环。

## 实践启示

1. **从个人 SDD 到团队 Harness 的演进路径**：建议团队先落地 Spec Coding 的基础实践（spec.md → plan.md → review.md → verify.md），然后在交付质量控制点逐步引入 Context 工程、独立 Verification、Drift Check 和 Loop 机制。不必一步到位——可以先从"确定性 gate"开始，再逐步增加 Evidence 和 Learning 层。

2. **验收覆盖的编号追踪是质量链的可审计基础**：Lattice 提出的 AC-1/AC-2 编号追踪机制（每条验收标准都有对应的测试编号）是解决"谁证明做对了"问题的关键。这种编号体系使得从 Spec 到测试到代码到证据形成可追溯的链路，是审计和合规场景下的必要条件。

3. **Context 应只放 AI 推不出的约束**：Context 工程中最容易犯的错误是把所有项目文档都塞进 Context。Lattice 的原则是"只放 AI 推不出的约束——业务不变量、历史事故、架构决策"。这要求团队具备判断"什么是 LLM 已知的、什么是需要特别说明的"的能力，本质上是对团队领域知识的提炼。

4. **Drift Check 应从 spec-lint 阶段开始抓**：Lattice 的 drift 检测覆盖新增 error code、新增 API route、修改 DB schema 三类常见漂移场景，且从 spec-lint 阶段开始检测，不在 CI 中漏掉。建议团队在 CI pipeline 中增加类似的自动化漂移检测门禁。

## 相关实体
- [Loop Engineering 半年实战拆解：claude-ship](ch05/005-loop-engineering.html) — 另一 AI Coding 闭环开源实现
- [Agent Harness 架构](ch05/039-agent-harness.html) — Harness Engineering 概念框架

---

