# Superpowers 深度解读（2）：Rule/Gate/Hook 与 Iron Law 方法论

## Ch09.109 Superpowers 深度解读（2）：Rule/Gate/Hook 与 Iron Law 方法论

> 📊 Level ⭐⭐ | 6.7KB | `entities/superpowers-deep-dive-kaiyuandakashuo.md`

> 原文归档：[原文归档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/superpowers-deep-dive-kaiyuandakashuo.md)

Superpowers 第二篇深度解读：聚焦 Rule/Gate/Hook 核心哲学、Iron Law、TDD 应用到 prompt engineering、SDLC 范式映射。开元大咖说/原作者。

## 一句话

**Rule 可绕开（rationalize 借口）/ Gate 不可绕开（先满足条件才允许下一步）/ Hook 是确定性触发——Superpowers 把每个关键转换都做成互锁 gate，构成 LLM 时代的工业级 SDLC。**

## 互补角度（vs 百度Geek说版）

本文聚焦以下独特贡献：
- Rule vs Gate vs Hook 哲学区分
- 1% rule 详解
- Iron Law + Anti-rationalization 表
- systematic-debugging Phase 4.5（3 次失败→STOP）
- writing-skills 的 prompt engineering TDD 化
- Cialdini 说服原则的 PUA Skill
- SDLC 范式映射表
- 社区批评（无 benchmark / slop PR / 弱模型失效）

## Rule vs Gate vs Hook

| 类型 | 例 | 特征 |
|------|---|------|
| Rule | "过马路前不要不看路" | 可合理化绕开 |
| Gate | "HARD GATE: 左看→右看→再左看→verify zero vehicles" | 无绕行路径，阻塞下一步 |
| Hook | 经典确定性软件 | 特定动作触发 |

"A rule has an opt-out path. A gate doesn't — the next action is blocked until the gate condition is met."

## 1% Rule

"Invoke relevant or requested skills BEFORE any response or action. Even a 1% chance a skill might apply means that you should invoke the skill to check. IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE."

## Iron Law（TDD）

"If production code was written before its test exists and was observed failing, the code must be deleted. There are no exceptions for 'reference' or 'adaptation'. Delete means delete. Implement fresh from the tests only."

**Anti-rationalization 表**（4 条典型借口）：
- "Skip TDD just this once" → 那是借口，不是例外
- "Tests written after work the same" → 事后写测试回答"做什么"，先写回答"应该做什么"
- "Time already spent, sunk cost" → 留下没真测过的代码就是技术债
- "Manual testing is enough" → 手动执行是临时拼凑

## systematic-debugging Phase 4.5

3 次 fix 都失败 → STOP，回到 Phase 1（"这不是假设失败，是架构错误"）

**redirect signals**：用户说 "Is that not happening?"/"Stop guessing"/"Ultrathink this" → agent 必须立即回 Phase 1

## writing-skills：把 TDD 应用到 prompt engineering

- **RED**：写压力测试场景，记录 agent 怎么 rationalize 出捷径
- **GREEN**：根据观察到的 rationalization 写 skill 反驳
- **REFACTOR**：装上 skill 再跑，看还能找新借口

"If you didn't watch an agent fail without the skill, you don't know if the skill teaches the right thing."

## Cialdini 说服原则（PUA Skill）

Jesse 自觉用 Cialdini《影响力》六原则（authority/commitment/liking/reciprocity/scarcity/social proof/unity）固化 agent 行为。

真实例子：生产宕机每分钟 $5k → A)立即调试 5 分钟 B)检查 skill 2+5=7 分钟 → agent 选 A 说明 skill 不够硬

## SDLC 范式映射

| 传统 SDLC | Superpowers 重新解释 |
|----------|------------------|
| 需求评审 | brainstorming + spec self-review + user 签字 |
| 架构设计 | brainstorming File Structure + 单元分解 |
| 任务拆分 | writing-plans bite-sized tasks（精确路径+代码块） |
| 编码规范 | TDD Iron Law、YAGNI、DRY 写在 plan 模板 |
| Code review | 分 spec review + code quality review 双阶段 |
| 集成测试 | verification-before-completion evidence gate |
| 分支管理 | using-git-worktrees + finishing-a-development-branch |
| 并行开发 | dispatching-parallel-agents（限制 3+ 独立失败） |

## 与 Anthropic 官方 Skills 差异

| 维度 | Anthropic 官方 | Superpowers |
|------|---------------|------------|
| 目标 | 能力扩展（PDF/PPT/Excel） | 流程纪律 |
| 触发 | 用户显式调用 | 1% rule 自动判断强制 |
| 依赖 | MCP/各种 runtime | bash + Node.js（无 MCP） |
| 安装量 | — | 300k（社区胜） |

## 社区批评（4 项）

1. 无正经 benchmark（数字来自实践记录非对照实验）
2. 认知负担（管理多 subagent 工作流本身有心智成本）
3. "模型吃过 100 本 TDD 的书，再喂 SKILL.md 真能加什么？"（价值在 enforcement 不在 knowledge transfer，是假设非测量）
4. Slop PR 问题 + 弱模型失效（GLM 4.6/Kimi K2 会跳步骤）

## 适合 vs 不适合

**适合**：复杂功能 / 生产代码 / 大型 refactor / 长 session
**不适合**：一次性脚本 / 极小 bug fix / 架构已了然只需"打字员" / 模型能力不够

Jesse 探索第二种 mode："iterative greenfield"——不走 spec-first，从行为示例反向生成 spec 再 clean reimplement

## 相关实体

- [Superpowers 深度解析（1）：概率操控与负向收益](../ch05/085-superpowers-claude-code.html) — 第 1 来源
- [Harness Engineering](../ch05/112-harness-engineering.html)
- [12 Agent 设计模式](../ch03/046-agent.html) — 同样强调"确定性从 LLM 剥离"
- [AI Coding Agent Token 成本控制](ch09/047-coding-agent.html) — Superpowers 多阶段会大幅增加 token 成本

---

