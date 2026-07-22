---
title: "wow-harness v3 —— AI 开发的治理协议：跨 session 一致性 + Agent 组织化"
source_url: "https://mp.weixin.qq.com/s/kXNivwgCweGoV-xW_WoCtg"
publish_date: 2026-06-04
tags: [wechat, article, agent, harness, governance, event-sourcing, cross-session, multi-agent, organization, protocol, state-machine]
review_value: 9
review_confidence: 8
review_recommendation: strong
sha256: pending
---

# wow-harness v3 —— AI 开发的治理协议
> 整理：Hermes Agent
> 原文：https://mp.weixin.qq.com/s/kXNivwgCweGoV-xW_WoCtg
> 作者：张晨曦（Nature）· 通向惊喜科技创始人 · 大四在读
> 设计文档：约 50,000 行 · 21 个模块 · 经历 6 轮版本迭代

## 一句话定位
**wow-harness v3 = AI 开发的"治理协议"**——一个面向**跨 session 一致性**的协议设计。它**不替代 Claude Code**，跑在 Claude Code 之上，把"一次 session 怎么高效执行"扩展为"**多个 session 之间怎么保持组织级一致**"。

> 核心断言：**"AI 写得越多，我维护它越累"** —— 不是 AI 不够聪明，是它每次都重新发明你之前已经建立过的约定。

## 设计哲学

### 套具比模型重要（基础论据）
引用 Anthropic 自己的 Claude Code 大型代码库部署博客 + arxiv 2604.14228 学术逆向分析：
- 整个 Claude Code 代码库中 **98.4% 是运行基础设施，1.6% 是 AI 决策逻辑**
- Anthropic 原话："真正决定效果的，是围绕模型搭起来的那套'套具'（harness），对最终效果的影响远超模型本身"^[raw/articles/wow-harness-v3-governance-protocol.md]
- **现有套具都管"一次做好"，v3 管"一百次之间不漂移"**

### 协议比能力重要
- 协议 = 系统级约束（schema、物理拦截、状态机），不靠 AI 自觉
- 能力 = 单次模型的聪明程度
- 长期连贯性 > 单次质量 —— 同一类问题在第 1 次和第 100 次应该得到**一致的工程处理**

## 5 大核心问题 + v3 的解法

### 问题 1：AI 做过的事，怎么不丢？
**场景**：三个月前 AI 做了一个架构决策，对话窗口里，session 关了就没了。三个月后另一个 agent 碰到同样问题，又做了不同决策。

**v3 解法**：
- 所有 agent 产出（代码改动 / 判断 / 概念调整）作为**事件**写入一条**只追加、不可篡改**的时间线
- 这条时间线 = 整个系统的**唯一真相来源**
- 三个月后的 agent 不需要"记得"——它**查时间线**就能看到完整决策历史（谁做的、什么时候、为什么）
- 两个配套机制：
  - **增量推导"当前状态"**（不每次从头扫）
  - **定期归并压缩成关键快照**（保留可追溯性 + 减少存储负担）^[raw/articles/wow-harness-v3-governance-protocol.md]

### 问题 2：工程概念跨 session 怎么不漂移？
**场景**：第一周约定 API `getUserProfile` 返回 5 字段。第三周改名为 `fetchUserData` 返回 8 字段。第五周又有人按老名字写调用。

**v3 解法**：
- 每个工程概念（API / 数据结构 / 命名约定 / 架构决策）是**独立节点**，有生命周期：**创建 → 修改 → 被替换 → 退役**
- 概念被替换时，系统**自动扫描"谁还在用旧版本"**并通知——不靠 AI 记得，靠结构自动传播
- 关键约束：**替换必须说明引入什么新信息**——如果只是"新名字更好"系统不允许替换
- 解决长期项目的"振荡问题"：同一设计在两个版本之间来回改，每次改回去的 agent 都不知道之前为什么改走^[raw/articles/wow-harness-v3-governance-protocol.md]

### 问题 3：怎么确保 AI 的产出真的做完了？
**场景**：AI 说"修完了"，但改了主文件没改测试，改了 API 没改文档，或者 bug 换了个位置又出现。

**v3 解法（双层验证）**：
- **第一层（提交前自检）**：agent 提交前必须跑一组自检项，每一项要有**具体验证证据**（命令输出 / 测试报告 / grep 结果），不是"我觉得做完了"
- 通过一个**统一的提交检查点**——物理层面拦截不合格的产出（不是 prompt 层面"建议你做自检"）
- **第二层（独立 agent 交叉验证）**：另一个 agent 用不同视角、不同方法验证同一份产出
- 验证 agent 的工具列表**没有写权限**（schema 级限制，不是提示词约束）——做判断的人不能同时是做事的人

> **与 Superpowers 强制 TDD 的本质区别**：Superpowers 在提示词层面要求 Claude 遵守纪律——Claude 理论上可以"合理化"自己不遵守。v3 的检查点是**物理拦截**：自检不过就提交不了，不存在"我觉得差不多就行了"。^[raw/articles/wow-harness-v3-governance-protocol.md]

### 问题 4：怎么让 AI 不是"一个工具"而是"一个自己运转的组织"？
**v3 与所有现有工具差异最根本的地方**：
- **Superpowers** 假设：agent 是需要被管教的执行者——人告诉它"先写测试再写代码"，它照做；每次都是人给指令、agent 执行、session 结束
- **v3 假设**：agent 是**组织成员**。多个 agent 组成**自己运转的开发组织**——采访员 / 架构师 / 执行者 / 审查员 / 修复师——协作**不靠人调度，靠协议自动驱动**

**具体怎么做到**：
- 核心结构是**一张自动扩张的图**
- 每个节点 = 一个 agent skill（采访/设计/规划/执行/审查/修复）
- 边 = 事件触发关系
- 当一个节点完成工作产出事件，系统**自动检查"这个事件应该触发哪个下游节点"**——然后自动 spawn 新 agent session
- 例子链路：执行 agent 写完代码 → "任务完成"事件 → 自动 spawn 审查 agent → 审查发现"发现缺陷"事件 → 自动 spawn 修复 agent → "修复完成"事件 → 自动 spawn 审查 agent 做闭合验证。**整条链路没人参与调度——图自己扩张、收缩、运转**
- 每个新 spawn 的 agent session 都是"**无状态**"——它不继承上一个 session 的偏见和惯性。它拿到的是系统**专门为它组装的上下文胶囊**（它需要知道的概念 / 约束 / 引用关系），从 artifact 出发做独立判断
- 类比："像新员工入职——他不需要记得前任怎么想，他看交接文档就能开始工作"^[raw/articles/wow-harness-v3-governance-protocol.md]

> **v3 = 图 vs Superpowers = 直线**：
> - Superpowers 的"brainstorm → plan → TDD → review → finish"是**线性流程**——人启动、agent 走完、人验收
> - v3 是**图**——图自己根据事件流决定下一步该做什么、该 spawn 谁、该通知谁
> - **直线做不了并行**（5 agent 同时 5 任务）、**做不了回路**（审查→修复→闭合验证）、**做不了跨任务概念冲突检测**。图可以

### 问题 5：项目负责人怎么不退化判断权？
**场景**：AI 越来越自动化，项目负责人要么被拉进大量工程细节（"这个分支要不要合并？"），要么完全退出判断循环（AI 自己做所有决定，事后发现方向偏了）。

**v3 解法（严格区分两类决策）**：
- **工程实施类决策**（怎么写、怎么测、怎么部署）——AI 自己做，不问人
- **语义判断类决策**（产品方向、不可逆操作、价值取向）——必须走"升级"路径送到系统所有者面前
  - 关键：不用工程黑话，**用产品语言描述情况、列出选项和各自代价**，让系统所有者直接判断"要 A 还是 B"
- 系统所有者的每次判断本身也是一个事件，写入时间线、永久留痕——"**人做了什么决定、什么时候、为什么**"跟"AI 做了什么"一样可追溯^[raw/articles/wow-harness-v3-governance-protocol.md]

## 学术验证：ESAA 论文

**2026 年 2 月 arxiv 出现 ESAA 论文**（Event Sourcing for Autonomous Agents），核心命题与 v3 高度重合：
- 把 agent 的"想做什么"跟"系统实际发生了什么"**分离**
- agent 只发出**结构化意图声明**，由独立验证器检查后才写入不可篡改的事件日志
- 与 v3 "**事件意图 → 提交检查点验证 → 事件记录**"是同一架构
- 论文也指出 AI 开发正从"对话式"转向需要"长期一致性"的工作流
- 论文描述"**状态漂移**"失败模式（agent 相信修复了，但系统实际没变）——v3 的双层验证 + 物理拦截要消除这个失败^[raw/articles/wow-harness-v3-governance-protocol.md]

**v3 超出 ESAA 论文范围的工程设计**：
- 概念节点的生命周期状态机
- 约束规则（义务）的独立生命周期管理
- 为每个 agent session **精确组装上下文**的机制
- 基于证伪主义的**三正交审查**方法论
- **闭合合约**驱动的缺陷修复协议

ESAA 出现是"好消息"——意味着这个方向不是孤立判断，是领域必然趋势。

## v3 vs 现有工具的根本区别

### vs Claude Code（地基，非竞争）
- **v3 跑在 Claude Code 上面**——用它的终端环境、子 agent 机制、工具系统
- Claude Code 管"**单次 session 怎么高效执行**"，v3 加"**跨 session 的组织级治理**"
- 两者**不是同一层的问题**，不存在替代关系

### vs Superpowers
- **设计假设分歧**：Superpowers 假设 agent 是需要管教的执行者；v3 假设 agent 是组织成员
- **14 个 skill 文件本质 = 行为约束清单**（"你必须先写测试"、"你不能跳过 review"）—— 预设 agent 会偷懒、会走捷径、需要被提示词强制约束
- **每次 session 重新加载一遍**——agent 没有跨 session 状态
- **v3 不需要这些约束**——v3 的 agent 拿到的不是"你应该怎么做"的行为清单，而是**完整的系统理解**（它在组织里的角色、上下游、当前概念状态、引用关系、生效约束）
- **v3 核心设计原则**："**解释为什么**"比"**堆 MUST 规则**"有效得多

### vs Hermes Agent（你的 agent）
- Hermes 是**个人助手**——架构围绕"一个用户 + 一个 agent"——记住你的偏好、学习你的工作模式、在你的消息平台等你
- **没有"多个 agent 之间怎么协作"这个概念**——因为设计假设里只有一个 agent
- **v3 从第一天就假设多个 agent 并行**——不是一个 agent 变聪明，是**一群 agent 变成一个组织**

### vs OpenHands
- OpenHands 有 EventStream 架构，但**是 session 内部的消息总线**——用来在 agent / 模型 / 运行时之间传递消息
- **Session 结束，事件流消失**
- **v3 的事件时间线是永久的**——不是消息传递工具，是**系统的历史记录和真相来源**
- 两者名字像，工程含义完全不同^[raw/articles/wow-harness-v3-governance-protocol.md]

## v3 协议的 6 大设计原则

1. **事件溯源** = 单一真相来源 —— 所有 agent 产出作为不可篡改事件写入时间线
2. **概念图 + 生命周期状态机** = 工程概念是独立节点，替换需说明新信息
3. **物理拦截的双层验证** = 提交检查点 + 独立 cross-validator (无写权限)
4. **自动扩张的任务图** = 节点完成事件自动触发下游节点，agent 无状态
5. **严格区分工程/语义决策** = 前者 AI 做、后者升级人
6. **解释为什么 > 堆 MUST 规则** = 系统理解 > 行为清单

## 21 个模块（简略）
> 设计文档约 50,000 行，经历 6 轮版本迭代
- 事件溯源 / 概念图 / 任务图引擎 / 双层验证 / 上下文胶囊组装器 / 闭合合约 / 三正交审查 / 约束规则生命周期 / 升级协议 / 等等

## 核心断言

> **"协议比能力重要，治理比智能重要，长期连贯性比单次质量重要。"**

## 启示

1. **跨 session 一致性 = AI 开发新前沿** —— 现有 harness 都管"一次 session"，v3 管"组织级一致"
2. **物理拦截 > 提示词约束** —— Superpowers 的 14 个 skill 文件 = 行为清单；v3 的提交检查点 = 物理门禁
3. **Agent 组织化 ≠ Agent 变聪明** —— 多个 agent 组成自己运转的组织 = 不同工程挑战
4. **事件溯源 + 概念生命周期 = 长期连贯性的工程基础** —— 比"model memory"更结构化
5. **解释为什么 > 堆规则** —— 系统理解比行为清单更稳健
6. **现有工具关系图**：Claude Code（地基）↑ v3（治理层）→ 不替代 Superpowers/Hermes/OpenHands（在同层不同假设下竞争）

## 相关实体
- [[entities/agent-harness-architecture|Agent Harness 架构]] —— 7 层 harness 模型
- [[entities/claude-code-20000-char-source-analysis|Claude Code 20000 字符源码分析]] —— 98.4% 基础设施论据
- [[entities/agent-harness-context-management-working-set|Agent Harness 上下文管理]] —— 工作集视角 + subagent 隔离
- [[entities/harness-engineering|Harness Engineering]] —— 系统性 harness 实践
- [[entities/agent-self-improvement-six-mechanisms|Agent Self-Improvement Six Mechanisms]] —— 长期连贯性相关
- [[entities/from-agent-protocol-to-harness-skill|From Agent Protocol to Harness Skill]] —— 协议 → skill 演化

## 作者背景
- 张晨曦（Nature）· 通向惊喜科技创始人 · 大四在读
- 之前设计的**通爻协议（ToWow Protocol）**（面向跨组织 Agent 协作的 A2A 协议）的早期核心想法
- 后被多个独立研究团队走了同方向并独立验证，现在已经商业化
- **wow-harness** 是通爻协议体系中面向**单组织内部 AI 协作治理**的一层，属于端点 Runtime 位置
- 正在招人 + 商业合作（natureblueee 微信）
