## Ch13.003 循环工程 (Loop Engineering) — 清华 2026 框架

> 📊 Level ⭐⭐ | 16.7KB | `entities/loop-engineering-tsinghua-2026.md`

# 循环工程 (Loop Engineering) — 清华 2026 框架

> **核心立论**：让 Agent 持续工作六小时，瓶颈不是它"会不会写"，而是它的**循环设计**是否合理。提示词本身没消失，只是被吸收进了六件套：技能 (Skill)、规格 (Spec)、工具 (Tool)、执行 (Act)、评估 (Eval)、停止 (Stop)。

清华大学清新研究团队 2026 年 6 月发布的 89 页研究报告，提出**循环工程 (Loop Engineering)** 作为 Agent 工程的下一阶段框架。报告把 Agent 工程的关注点从"单次生成"转到"持续运行"，用 Claude Code /goal、Claude Code Routines、Codex Agent Loop 与 Sub-agents 等产品案例，构造了一套完整的循环治理框架。

## 1. 为什么需要循环工程

Agent 时代研究焦点从单次生成转向持续运行，三个关键事实：

1. **生成能力已经不是瓶颈** —— 当模型能写出"看起来对"的代码，瓶颈上移到循环设计
2. **提示词工程 (Prompt Engineering) 不会消失，而是被结构化吸收** —— 进 Skill / Spec / Tool / Eval / Stop
3. **循环决定质量** —— 同样模型 + 不同循环，输出质量天差地别

报告的核心反命题："不是模型不够强，而是循环不够好。"

## 2. Loop Stack：循环的六件套

清华团队提出 Agent 循环的最小完备集合 —— 六件套结构：

| 件 | 作用 | 设计要点 |
|---|---|---|
| **Skill (技能)** | 可重用的能力封装 | 不只是提示词，是带版本、可验证的能力单元 |
| **Spec (规格)** | 任务的形式化描述 | 把"完成"翻译成可检验条件，避免"写的人给自己打分" |
| **Tool (工具)** | 与外部世界的接口 | 工具是循环的"手脚"，决定可达空间 |
| **Act (执行)** | 把规格翻译为动作 | 动作要可观测、可回滚 |
| **Eval (评估)** | 独立判定"是否完成" | 由独立小模型而非主模型自评 |
| **Stop (停止)** | 显式定义循环何时停止 | 没有 Stop 条件 = 循环永远跑不完 |

> 六件套缺一件循环就会"漏"。这是 Loop Engineering 的最小完备集合。

### 2.1 关键反模式：主模型自评

报告反复强调——**"写的人不该给自己打分"**：主模型既是参赛者又是裁判，会导致自我合理化。

正确做法是用**独立小模型**做 Eval 判定。Claude Code /goal 显式分离这两个角色。

## 3. 产品能力底座：Claude Code 两个核心能力

报告用 Claude Code 的两个具体能力作为"产品能力底座"案例：

### 3.1 /goal：完成条件驱动而非时间周期

- 用**可验证条件**定义目标（不是 turn 数、不是时间）
- 每个 turn 后由**独立小模型**判断条件是否满足
- 红色 "NO" 门 / 绿色 "✓" 门 —— 通行判断二值化
- 体现"写的人不该给自己打分"
- **完成条件驱动，而非时间周期**

### 3.2 Routines：云端例行任务

- 在 **Anthropic 管理的云端基础设施**上运行（不是用户本地会话）
- 三种触发方式：**计划 (Schedule)、API、GitHub 事件**
- 任务看板：运行中 / 已完成 / 错误 / 待处理
- **运营化后台任务** = 把个人会话循环推进到可运营的后台
- 关键洞见：循环需要"长在家"才能持续 → 必须脱离本地会话

> Routines 与 Codex Automations 同构：云端常驻循环是 Agent 持续运行的工程前提。

## 4. Codex Agent Loop 与 Sub-agents 职责分离

报告把 Codex 的 agent loop 拆为三段，每段由不同 sub-agent 负责：

| Sub-agent | 职责 | 输入 | 输出 |
|---|---|---|---|
| **Explorer (探索者)** | 调研代码、收集信息、建索引 | 任务规格 | 代码地图 |
| **Implementer (实现者)** | 写代码、跑测试 | Explorer 索引 + 规格 | 变更 diff |
| **Evaluator (评估者)** | 独立审查变更 | Implementer diff | 审查意见 |

子代理之间靠**契约 (Contract)** 而非共享上下文通信 —— 这是 Loop 内部的关键解耦设计。

> **Loop-Agent-Engineer 三角关系**：Loop 是骨架，Agent 是执行者，Engineer 是 Loop 的设计者。三者职责不同，不可混为一谈。

## 5. Loop Ledger（循环账本）

清华团队的可观测性创新：

- 把每次循环的关键决策、输入、输出、时长、token 消耗记成**可审计账本**
- 账本**只追加 (append-only)**，事后可回放任意一次循环的完整轨迹
- 类比传统财务 Ledger：循环也需"做账"
- **审计 = 循环可信的前提**

## 6. Worktree Fleet（工作树舰队）

处理并行循环的"合并地狱"问题：

- 每个子代理跑在**独立 worktree** 上
- 关键控制点 = **合并前统一审查 / 测试 / 清理**
- 避免多个 worktree 互相覆盖、污染主分支
- 解决并行 Agent 同时改同一文件的冲突

> Worktree Fleet 的设计核心：**隔离 + 合并前审查**。

## 7. Entropy Janitor（熵清扫夫）

清华团队最具创新性的概念 —— **降熵 Loop**：

- Agent 写完代码后，代码库"熵"（无序度）持续上升
- Janitor Loop 的职责：把代码从"垃圾堆"扫回"简洁模块"
- **清理三类垃圾**：
  1. **重复 (Duplication)**：同一逻辑多处实现
  2. **过度抽象 (Over-abstraction)**：为单点用法建整套接口
  3. **无效依赖 (Dead dependencies)**：调用方已不存在的 import / API
- 价值：让"持续运行的 Agent"不留下"持续腐烂的代码库"

> Entropy Janitor 是 Loop Engineering 与传统 DevOps 的最大差异点：传统 CI 只验证"新代码对不对"，Janitor 还要**主动清理历史遗留**。

## 8. Triage 的三种输出

输入信号 (Triage) 经分类后流向三种输出：

| 输出 | 适用场景 | 后续动作 |
|---|---|---|
| **Archive (归档)** | 无价值发现 | 自动归档，不进入主分支 |
| **PR (修复)** | 低风险修复 | 开 PR 等待 review |
| **Human (交接)** | 高风险问题 | 交给责任人处理 |

> Triage 是 Loop 的"路由器"：决定每条信号去往哪。三种输出对应三种风险等级。

## 9. 启动 Loop 前的 10 个问题

报告末尾的"启动前检查清单"：

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

## 10. 核心结论与本 wiki 视角

> **不是模型不够强，而是循环不够好。**

报告把 Agent 工程化的核心矛盾概括为：

- 能力 (Capability) 已经够强
- 治理 (Governance) 是真正的瓶颈
- Loop 是治理的载体：把不可信的"单次生成"转化为可信的"持续运行"

### 与本 wiki 已有实体的关系

| 本报告概念 | 本 wiki 已有实体 | 视角关系 |
|---|---|---|
| Loop Engineering | [Tsinghua Harness Engineering Report](ch05-060-engineering-roles-shift-from-developing-code-to-managing-ai.html) (清华前一份) | **演进**：Harness → Loop，前者讲"系统层"，后者讲"循环层" |
| Loop Stack 六件套 | [Agent Harness 12 Components 7 Decisions](ch04-061-fable-5-agent-runtime-runtime-contract.html) | **视角互补**：六件套偏"循环骨架"，12 件套偏"工程组件" |
| Loop Ledger | [Agent Harness Observability Production](ch04-468-agent-harness-可观测性-生产级-ai-项目必须补上的一课.html) | **深化**：从可观测性到可审计账本 |
| Worktree Fleet | [Agent Engineering Principles Architecture Practice](ch04-435-openclaw-3-2w.html) | **深化**：从"隔离原则"到"舰队编排" |
| Entropy Janitor | [Hermes Agent Closed Learning Loop](ch01-326-hermes-agent-closed-learning-loop.html) | **扩展**：闭环学习的"清理步骤"形式化 |
| Triage 三种输出 | Agent Harness Context Management Working Set | **深化**：从"上下文管理"到"信号路由" |
| Claude Code /goal | (官方文档：code.claude.com/docs/en/goal) | **产品映射** |
| Claude Code Routines | (官方文档：code.claude.com/docs/en/routines) | **产品映射** |

### 本 wiki 之前没覆盖的独特概念

1. **Entropy Janitor (降熵循环)** —— 本 wiki 之前没有"主动清理历史代码"循环的专门概念
2. **Triage 三种输出 (Archive / PR / Human)** —— 本 wiki 之前没有"信号按风险分级路由"的框架
3. **启动 Loop 前的 10 问** —— 完整的循环启动检查清单
4. **Loop Ledger (append-only 审计账本)** —— 比通用可观测性更强的审计原语

## 深度分析

**一、提示词工程没有消失，而是被结构化吸收进了 Loop Stack**。Skill/Spec/Tool/Act/Eval/Stop 这六件套，本质上是把原来散落在 prompt 里的指令分门别类地固化下来。Skill 封装能力、Spec 定义完成条件、Tool 暴露接口、Act 执行动作、Eval 独立判定、Stop 控制退出——prompt engineering 的专业知识不是没了，而是有了更结构化的归属。这是 Agent 工程走向标准化的必经之路。

**二、"不是模型不够强，而是循环不够好"是 Agent 工程的下一次转向**。当模型生成能力已经不再是瓶颈，治理（governance）就成了真正的制约因素。循环决定质量——同样模型 + 不同循环，输出质量天差地别。这意味着 Agent 工程的下一步重点，是从"怎么让模型生成更好的东西"转移到"怎么设计更好的循环来组织模型的生成过程"。

**三、Loop Ledger 揭示了可观测性在 Agent 时代的新内涵**。传统软件的可观测性主要服务于事后调试，Loop Ledger 则在此基础上增加了"审计"这一层——append-only 的循环账本，让每一次决策轨迹都可回放。这意味着 Agent 的运行记录不仅是调试工具，更是合规和信任的基础设施。循环的可审计性，是 Agent 从"个人工具"走向"生产系统"的必要条件。

**四、Entropy Janitor 体现了 DevOps 思维向 Agent 系统的延伸**。传统 CI 只验证"新代码对不对"，Janitor 还要主动清理历史遗留的熵增——重复实现、过度抽象、无效依赖。这不是运维问题，而是质量维护问题：长期运行的 Agent 如果没有自清洁机制，代码库会持续腐烂，最终连 human developers 都不愿意接手。Janitor 把这个问题从"人的责任"变成了"系统的责任"。

**五、Eval 与主模型分离是 Agent 循环中最反直觉也最重要的设计原则**。"写的人不该给自己打分"——这个原则在软件工程里看似常识，在 Agent 系统里却容易被忽视。主模型自评会导致自我合理化，用独立小模型做 Eval 判定才能真正保证反馈的客观性。Claude Code /goal 的二值化门控（红色 NO / 绿色 ✓）是这个原则最直接的产品化体现。

## 实践启示

1. **用 Loop Stack 六件套（Skill-Spec-Tool-Act-Eval-Stop）审视每一个 Agent 循环**：先问六个问题——Skill 够吗？Spec 清楚吗？Tool 全吗？Act 可观测吗？Eval 独立吗？Stop 条件明确吗？六件套不完整，循环就会"漏"。

2. **永远不要让主模型自评输出**：无论多小的任务，只要涉及"判定是否完成"，都要引入独立小模型或独立 Agent 做 Eval。主模型自评是 Agent 系统里最常见的可靠性陷阱。

3. **每个循环必须有显式、可验证的 Stop 条件**：没有 Stop 条件 = 循环永远跑不完。在设计 Loop 的第一天就要定义 Stop，而不是等到系统上线后再加。

4. **把 Loop Ledger 作为 Agent 系统的必备组件**：每一次循环的决策、输入、输出、时长、token 消耗都要记成 append-only 审计日志。这不仅是事后调试的基础，也是 Agent 系统通过合规审查的前提条件。

5. **为长期运行的 Agent 配套 Entropy Janitor 机制**：代码腐化是长期 Agent 运行的必然结果，不能靠 human review 解决。需要在系统设计时就把 Janitor Loop（清理重复/过度抽象/无效依赖）作为标准件纳入循环体系。

6. **Loop 部署选云端不选本地**：如果 Loop 需要在用户离开后继续运行，就必须部署在云端（参考 Claude Code Routines / Codex Automations）。本地会话的循环无法"长在家"，这是 Agent 从个人工具走向 production 系统的工程前提。

## 11. 待补充与限制

- **PDF 限制**：原报告 89 页扫描版，仅 14 页可读。Loop Stack 详细设计参数、具体 Codex sub-agent 的 prompt 模板、Worktree Fleet 的合并算法细节、Entropy Janitor 的触发频率策略等章节未深入到具体工程实现级
- **可执行性**：六件套是**概念框架**，未给出可下载的模板或代码库
- **度量**：报告未提供"Loop 好 vs 坏"的量化指标 —— 是体验式而非实证式

## 相关实体
- [清华 ai 自进化组织研究报告：ai 业务资产化与公司形态重构](ch01-246-codex-6-sites-annotations.html)
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/tsinghua-loop-engineering-report.md)

---
