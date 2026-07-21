# Spec Kit / OpenSpec / Superpowers 融合：棕地项目的三层Harness架构

## Ch05.002 Spec Kit / OpenSpec / Superpowers 融合：棕地项目的三层Harness架构

> 📊 Level ⭐ | 2.9KB | `entities/spec-kit-openspec-superpowers-hybrid-harness.md`

# Spec Kit / OpenSpec / Superpowers 融合：棕地项目的三层 Harness 架构

> 作者 CCC 在对比 Spec Kit、OpenSpec、Superpowers 三个框架后，选择各自取其精华，自建了一套更适合中大型团队棕地项目的三层 Harness 方案。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/spec-kit-openspec-superpowers-hybrid-harness.md)

## 三个框架的取舍

| 框架 | 拿走 | 丢掉 | 原因 |
|------|------|------|------|
| Spec Kit | 宪法思维（可验证约束） | 阶段门控、功能分片规范 | 太重，棕地不友好 |
| Superpowers | 铁律纪律（硬门控+反合理化） | 14 Skill 全链、brainstorming | 成本高，方向偏，无规范累积 |
| OpenSpec | Delta Spec + 单目录收拢 | apply 无纪律约束 | 靠 AI 自觉不够 |

## 三层架构

- **Harness 层**（CLAUDE.md）：可验证约束 + 决策点 + 组件分层对照表
- **Skill 层**（8 个 Skill）：带硬门控的执行步骤，借鉴铁律纪律
- **Spec 层**（Delta Spec）：只写变化的规范

### 组件分层对照表

四层结构：L0 原始层（禁止直接用）→ L1 封装层（优先使用）→ L2 业务层（搜到即用）→ L3 页面层（仅页面内）。自动维护机制：review 发现违规 → 判断规范缺失 → 自动补入 CLAUDE.md。四个月从 10+ 行增长到 40+ 行，误用降 80%+。

### 流程裁剪

三种模式：full（完整链）、light（小改动）、bugfix（独立链路）

### 关键工程洞察

- **LLM 乐观偏见**：跳过验证、绕过流程不是 bug，是 RLHF 训练副产物。约束力来自"违反就有后果"的闭环设计
- **brainstorming vs grill-me**：Superpowers 的 brainstorming 适合从零探索，Matt Pocock 的 grilling 适合在约束中生长
- **规范累积机制**：review 发现的规范漏洞自动回流到 CLAUDE.md，形成闭环

## 关联

- [Matt Pocock Skills vs Superpowers](../ch03/070-skills.html) — 同一路线对比的另一视角
- [Superpowers 三器合一](ch05/101-ai-coding.html) — Superpowers 在 Comet+OpenSpec 流水线中的角色
- [Agent vs Workflow 控制权连续谱](../ch04/641-agent-vs-workflow.html) — 架构选择的底层框架

---

