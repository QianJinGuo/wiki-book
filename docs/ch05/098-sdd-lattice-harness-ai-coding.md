# 从渐进式 SDD 到 Lattice Harness：AI Coding 团队级闭环实践

## Ch05.098 从渐进式 SDD 到 Lattice Harness：AI Coding 团队级闭环实践

> 📊 Level ⭐⭐ | 2.7KB | `entities/sdd-practice-lattice-harness-team-ai-coding.md`

## 核心概述

Individual SDD（Spec-Driven Development）向团队级 Harness 演进的完整实践指南。核心论点：Spec 只能解决 0→80，剩下 20 分需要 Context Engineering、独立 Verification、Drift Check、Evidence 系统和 Loop。提出了 Lattice——一个 repo-local AI Coding control plane，把交付控制点变成仓库内可版本化的 contracts。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/sdd-practice-lattice-harness-team-ai-coding.md)

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

## 相关实体
- [Loop Engineering 半年实战拆解：claude-ship](ch05/007-loop-engineering.html) — 另一 AI Coding 闭环开源实现
- [Agent Harness 架构](ch05/039-agent-harness.html) — Harness Engineering 概念框架

---

