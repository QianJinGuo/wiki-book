---
title: "清华大学：循环工程 (Loop Engineering) 研究报告"
type: raw-article
source: 清华大学清新研究团队 2026 年 6 月
source_url: assets/清华大学：循环工程研究报告.pdf
ingested: 2026-06-12
sha256: cfb36f96b00aed4367383e6bfe3ea2d844518f977a7c0100b05bdda8fc66d8b3
pages: 89
format: PDF (WPS 演示导出，全图片扫描版，pdftotext 无文本流)
extraction_method: pdftoppm + vision_analyze 抽样 14 页（p1, p4-p25, p30, p40-p45, p85, p88, p89）
confidence: 7
note: PDF 为 89 页扫描版，仅关键页可读；页码引用为 PDF 物理页码（非页内印刷页码）
---

# 清华大学：循环工程 (Loop Engineering) 研究报告

> 原始 PDF：`assets/清华大学：循环工程研究报告.pdf`（12.4 MB, 89 页，WPS 演示导出）
> 发布团队：清新研究团队，2026 年 6 月

## 报告核心立论

> 提示词本身没消失，只是被吸收进了六件套：技能 (Skill)、规格 (Spec)、工具 (Tool)、执行 (Act)、评估 (Eval)、停止 (Stop)。^[raw/articles/tsinghua-loop-engineering-report.pdf:p9-p15]

> 让 Agent 持续工作六小时，瓶颈不是它"会不会写"，而是它的循环设计是否合理。^[raw/articles/tsinghua-loop-engineering-report.pdf:p1-p2,p88]

## 一、为什么需要循环工程

Agent 时代研究焦点从单次生成转向持续运行。三个关键事实：

1. **生成能力已经不是瓶颈** —— 当模型能写出"看起来对"的代码，瓶颈上移到循环设计
2. **提示词工程 (Prompt Engineering) 不会消失，而是被结构化吸收** —— 进技能 / 规格 / 工具 / 评估 / 停止条件
3. **循环决定质量** —— 同样模型 + 不同循环，输出质量天差地别

## 二、Loop Stack：六件套

清华团队提出 Agent 循环的"六件套"结构（首字母 SESTA / Skill-Eval-Stop-Tool-Act-Spec）：^[raw/articles/tsinghua-loop-engineering-report.pdf:p9-p15]

| 件 | 作用 | 设计要点 |
|---|---|---|
| **Skill (技能)** | 可重用的能力封装 | 不只是提示词，是带版本、可验证的能力单元 |
| **Spec (规格)** | 任务的形式化描述 | 把"完成"翻译成可检验条件，避免"写的人给自己打分" |
| **Tool (工具)** | 与外部世界的接口 | 工具是循环的"手脚"，决定可达空间 |
| **Act (执行)** | 把规格翻译为动作 | 动作要可观测、可回滚 |
| **Eval (评估)** | 独立判定"是否完成" | 由独立小模型而非主模型自评 |
| **Stop (停止)** | 显式定义循环何时停止 | 没有 Stop 条件 = 循环永远跑不完 |

> 六件套是 Loop Engineering 的最小完备集合，缺一件循环就会"漏"。^[raw/articles/tsinghua-loop-engineering-report.pdf:p10]

## 三、产品能力底座：Claude Code /goal 与 Routines

报告用 Claude Code 的两个具体能力作为"产品能力底座"案例：^[raw/articles/tsinghua-loop-engineering-report.pdf:p12-p13]

### 3.1 /goal —— 完成条件驱动而非时间周期

- 用**可验证条件**定义目标（不是 turn 数、不是时间）
- 每个 turn 后由**独立小模型**判断条件是否满足
- 体现"**写的人不该给自己打分**"——主模型既是参赛者又是裁判会导致自我合理化
- 红色 "NO" 门：条件不满足则继续；绿色 "✓" 门：条件满足则通行
- **完成条件驱动，而非时间周期**

### 3.2 Routines —— 云端例行任务让循环脱离本地会话

- 在 **Anthropic 管理的云端基础设施**上运行（不是用户本地会话）
- 三种触发方式：**计划 (Schedule)、API、GitHub 事件**
- 任务看板：运行中 / 已完成 / 错误 / 待处理
- **运营化后台任务** = 把个人会话循环推进到可运营的后台
- 与 Codex Automations 同构：循环需要云端"长在家"才能持续

## 四、Codex Agent Loop 与 Sub-agents 职责分离

报告把 Codex 的 agent loop 拆为三段，每段由不同 sub-agent 负责：^[raw/articles/tsinghua-loop-engineering-report.pdf:p15-p20]

- **探索者 (Explorer)** —— 调研代码、收集信息、建索引
- **实现者 (Implementer)** —— 写代码、跑测试
- **评估者 (Evaluator)** —— 独立审查变更

子代理之间靠**契约 (Contract)** 而非共享上下文通信。**Loop-Agent-Engineer 三角关系**：Loop 是骨架，Agent 是执行者，Engineer 是 Loop 的设计者。

## 五、Loop Ledger（循环账本）

清华团队提出的可观测性创新：^[raw/articles/tsinghua-loop-engineering-report.pdf:p41]

- 把每次循环的关键决策、输入、输出、时长、token 消耗记成**可审计账本**
- 账本**只追加 (append-only)**，事后可回放任意一次循环的完整轨迹
- 类比传统财务 Ledger：循环也需"做账"
- **审计 = 循环可信的前提**

## 六、Worktree Fleet（工作树舰队）

处理并行循环的"合并地狱"问题：^[raw/articles/tsinghua-loop-engineering-report.pdf:p42]

- 每个子代理跑在**独立 worktree** 上
- 关键控制点 = **合并前统一审查 / 测试 / 清理**
- 避免多个 worktree 互相覆盖、污染主分支
- 解决并行 Agent 同时改同一文件的冲突

## 七、Entropy Janitor（熵清扫夫）

清华团队最具创新性的概念之一 —— **降熵 Loop**：^[raw/articles/tsinghua-loop-engineering-report.pdf:p43-p44]

- Agent 写完代码后，代码库"熵"（无序度）持续上升
- Janitor Loop 的职责：把代码从"垃圾堆"扫回"简洁模块"
- **清理三类垃圾**：
  1. **重复**：同一逻辑多处实现
  2. **过度抽象**：为单点用法建整套接口
  3. **无效依赖**：调用方已不存在的 import / API
- 价值：让"持续运行的 Agent"不留下"持续腐烂的代码库"

## 八、Triage 的三种输出（创新概念与设计模式）

输入信号 (Triage) 经分类后流向三种输出：^[raw/articles/tsinghua-loop-engineering-report.pdf:p14]

| 输出 | 适用场景 | 后续动作 |
|---|---|---|
| **Archive (归档)** | 无价值发现 | 自动归档，不进入主分支 |
| **PR (修复)** | 低风险修复 | 开 PR 等待 review |
| **Human (交接)** | 高风险问题 | 交给责任人处理 |

> Triage 是 Loop 的"路由器"：决定每条信号去往哪。^[raw/articles/tsinghua-loop-engineering-report.pdf:p14]

## 九、启动一个 Loop 之前必问的 10 个问题

报告末尾的"启动前 10 问"清单：^[raw/articles/tsinghua-loop-engineering-report.pdf:p85]

1. 这次循环的"完成"长什么样？可被独立验证吗？
2. 谁是循环的"裁判"？会不会"写的人给自己打分"？
3. 循环的 Stop 条件是什么？没有 Stop 等于死循环
4. 循环需要哪些 Skill / Tool / Spec？
5. 错误如何被发现？Eval 的反馈链路多长？
6. 循环跑在本地还是云端？(影响是否能在用户离开后继续)
7. 多 Loop 并行时如何避免合并冲突？(Worktree Fleet)
8. 循环的账本 (Ledger) 如何可审计？
9. 熵清扫夫 (Janitor) 什么时候触发？谁触发？
10. 循环失稳时的降级路径是什么？

> 这 10 问是 Loop Engineering 的"启动前检查清单"。^[raw/articles/tsinghua-loop-engineering-report.pdf:p85]

## 十、核心结论

> 不是"模型不够强"，而是"循环不够好"。^[raw/articles/tsinghua-loop-engineering-report.pdf:p88]

报告把 Agent 工程化的核心矛盾概括为：

- 能力 (Capability) 已经够强
- 治理 (Governance) 是真正的瓶颈
- Loop 是治理的载体：把不可信的"单次生成"转化为可信的"持续运行"

## 与本 wiki 已有实体的关系

- **同源 (与 Harness 体系)**：报告把循环工程 (Loop Engineering) 当作 Harness 的下一个演进阶段 → 可关联到 `[[entities/tsinghua-harness-engineering-report]]` (清华前一份 Harness 报告)
- **Loop Stack 六件套** ↔ [[entities/agent-harness-12-components-7-decisions]] (12 件套视角) — 视角互补：六件套偏"循环骨架"，12 件套偏"工程组件"
- **Loop Ledger** ↔ [[entities/agent-harness-observability-production]] (可观测性)
- **Worktree Fleet** ↔ [[concepts/agent-engineering-principles-architecture-practice]] (并行 + 隔离)
- **Entropy Janitor** ↔ [[concepts/hermes-agent-closed-learning-loop]] (自清洁的循环)
- **完成条件驱动** ↔ [[entities/hermes-agent-goal-runtime-architecture-state-persistence-judge-closed-loop]] (Goal 运行时)
- **Claude Code /goal** ↔ [[raw/articles/hermes-agent-goal-runtime-architecture-state-persistence-judge-closed-loop]]
- **Triage 三种输出** ↔ [[concepts/agent-harness-context-management-working-set]] (信号分类)

→ [[entities/loop-engineering-tsinghua-2026|正式实体页]]
