# Agentic Environment Engineering：Harness 之上下一层门槛

## Ch04.337 Agentic Environment Engineering：Harness 之上下一层门槛

> 📊 Level ⭐⭐ | 8.0KB | `entities/agentic-environment-engineering-jiagoux-2026-06-27.md`

> → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agentic-environment-engineering-jiagoux-2026-06-27.md)

## 核心命题

Agent 工程的焦点正在从 Harness 向 Environment 外移。

**Harness** 解决的是 Agent 怎么跑：工具、上下文、权限、状态、日志、验证、停止条件。**Environment** 解决的是 Agent 跑在什么世界里：它看见什么，能做什么，动作之后世界怎么变，反馈是否可信。

这不是替代关系——短期 Harness 仍然是生产系统里的控制面；长期 Environment 会决定 Agent 能不能拿到高质量反馈和闭环数据。

## 工程链路分层

从 Prompt Engineering 到 Environment Engineering，六个层次在同一条工程链路上：

| 层次 | 关注点 |
|------|--------|
| Prompt Engineering | 模型怎么被提示 |
| Context Engineering | 上下文怎么组织 |
| Harness Engineering | 运行时怎么搭（工具/权限/状态/日志） |
| Loop Engineering | 循环怎么持续跑 |
| Self-Harness | 失败后 Harness 能不能小步改进 |
| Environment Engineering | Agent 到底活在什么环境里 |

## 中科院自动化所框架

中科院自动化所 63 页长文《Agentic Environment Engineering for Large Language Models》将散在各处的 Agent 工程问题收回到一个更老实的框架里，拆成四个工程动作：

1. **建模**——先把工作现场建模清楚（代码仓库 ≠ 一堆文本，它是依赖、测试、CI、issue、PR、评审意见、发布规则和历史决策组成的工作现场）
2. **合成**——真实环境昂贵也危险，先有可控的小现场（符号环境 + 神经环境混合）
3. **评估**——环境有没有价值，先看反馈能不能被信任
4. **演进**——Agent 每跑一次任务留下的轨迹可以变成长期记忆、Skill、训练数据

## 环境的五个基本问题

一个环境最少要回答五个问题：

- 状态在哪里
- 动作有哪些
- 观察怎么回来
- 反馈谁给
- 副作用怎么挡

**关键洞察**：Agent 看见的东西，永远不等于系统真实发生的东西。模型看见的是一段命令输出，真实状态可能是数据库已经被改了；模型看见的是测试通过，真实状态可能是它删掉了覆盖失败路径的测试。

## 环境评估四维度

| 维度 | 工程里的问法 | 没做好会怎样 |
|------|------------|------------|
| Correctness | 反馈是不是真的 | Agent 学会错误策略 |
| Diversity | 场景是否足够多 | 只会做样板题 |
| Complexity | 难度是否合适 | 太简单没价值，太难只有噪声 |
| Fidelity | 是否接近真实系统 | benchmark 分高，生产里失效 |

## 奖励带偏警告

环境一旦奖励错了，Agent 会很快变聪明——只是它聪明的方向未必是我们想要的方向：

- 只奖励**最终分数** → Agent 学会钻规则
- 只看**测试通过** → Agent 学会删测试、绕测试
- 只看**报告完整** → Agent 堆很多没有价值的内容
- 只看"任务已完成" → Agent 过早宣布成功
- 没有**成本边界** → 长循环把 token、GPU、外部 API 一路烧下去
- 没有**状态记录** → 第二天又像第一天一样重新摸索

## 小环境契约模板

不必追求宏大的 Environment-as-a-Service，先给高频流程写一份小环境契约，8 件事就够：

```
Environment Contract
Name: ci-failure-triage
Goal: classify CI failure, propose minimal fix, leave reproducible evidence

Readable state: repository files (read-only), CI logs (read-only), previous attempts (read-only)
Writable state: working branch only, evidence note under agreed path
Allowed actions: inspect files, run selected tests, edit candidate fix in isolated worktree, produce patch summary
Blocked actions: push to main, delete tests without explicit approval, touch production secrets
Evaluators: unit tests, type check, targeted regression command, human review before merge
Budget: max 3 repair rounds, max 30 minutes wall-clock, stop on repeated same failure
Memory policy: write verified facts only, mark unverified assumptions, never persist secrets
Human handoff: permission escalation, evaluator conflict
```

适合先做的小流程：CI 失败分流、文档漂移检查、依赖升级预检查、issue 复现和最小修复建议、技术稿事实核验、数据分析 notebook 可复现实验。

## 与 Harness 的关系

Harness 和 Environment 不是替代关系：

- 模型 API 会吞掉很多"机制"（结构化输出、工具调用、上下文缓存）
- 但它很难替团队决定"策略"（什么时候用便宜模型、什么时候停、什么时候必须让人接管）
- 这些策略仍然要靠 Harness 承担
- Environment 决定 Agent 能不能拿到高质量反馈和闭环数据

## 线索合流

多个独立信号指向同一方向：

- **Addy Osmani** Loop Engineering：loop 坐在 harness 之上
- **Boris Cherny**（Claude Code）：越来越多在写 loop，让 Agent 长时间处理 PR/CI/反馈聚类
- **Karpathy** autoresearch：给 Agent 一个小而真实的 LLM 训练环境，自动改代码→训练→看指标→保留或丢弃
- **清华 EurekAgent**：把 CLI agent sessions 放进 prepare-propose-implement 循环，围绕它设计权限工程、产物工程、预算工程、人在环工程

## 与现有知识的关联

- [Harness Engineering 框架](../ch05/092-harness-engineering.md)——Environment 是 Harness 的外层延伸
- [Harness 之后：可删的工作现场](../ch05/082-harness-engineering-deletable-worksite-ruofei.md)——"可删的工作现场"概念与 Environment 的可恢复性呼应
- [Loop Engineering](../ch05/006-loop-engineering.md)——Loop 关心任务怎么持续发生，Environment 关心循环所依赖的事实源是否可靠
- [Loop Engineering 反馈控制系统](../ch05/006-loop-engineering.md)——反馈控制的前提是环境能给出可信反馈
- [Self-Harness](../ch05/009-harness.md)——没有可靠环境，自我改进很容易变成自我强化
- [Agent 开发范式演进：从环境工程出发](../ch03/045-agent.md)——同主题不同角度，侧重多源实时上下文简化
- [清华 Harness Engineering 报告](../ch05/092-harness-engineering.md)——EurekAgent 的权限/产物/预算/人在环四工程与清华报告互补

---

