# 复旦 AHE：让 Harness 自进化的 Agentic Harness Engineering

## Ch04.269 复旦 AHE：让 Harness 自进化的 Agentic Harness Engineering

> 📊 Level ⭐⭐ | 9.5KB | `entities/fudan-agentic-harness-engineering-ahe-gpt54-7points.md`

# 复旦 AHE：让 Harness 自进化的 Agentic Harness Engineering

**URL:** https://mp.weixin.qq.com/s/ObREWAzbx9znsfuz1r4ZuQ
**标签:** #HarnessEngineering #AHE #自动化优化 #复旦 #北京大学

Harness Engineering 迭代依赖人工经验，但模型以月为单位进化、任务场景往长尾分布发展——如何让 Harness 自动从经验中学习并改进？

## 摘要

复旦大学、北京大学与上海奇绩智峰联合提出的 Agentic Harness Engineering（AHE），把 Harness 的迭代从"工程师调 prompt/工具"升级为"Agent 自身在结构化环境里演化"。AHE 由三个角色组成（Coding Agent / Agent Debugger / Evolve Agent），建立三层可观测性（NexAU 组件级、轨迹级、决策级），并通过"证据驱动修改 + 变更清单"约束演化过程。在 Terminal-Bench 2 上把 GPT-5.4 从 69.7% 提到 77.0%（+7.3 点，相对 +10.5%），全球排名第三。

## 核心要点

- **核心问题**：Harness Engineering 的人工迭代速度跟不上模型月度级别的进化速度
- **方案定位**：让 Harness 在结构化可观测环境里自己演化，而不是工程师手调
- **三角色协同**：Coding Agent（跑测试）→ Agent Debugger（整理轨迹）→ Evolve Agent（修改 Harness 实现进化）
- **三层可观测性**：NexAU 组件级（7 种正交文件级组件 + Git 版本）→ Agent Debugger 轨迹级（10M token raw trace → 10K token 概览）→ Evolve Agent 决策级（证据 + 推断根因 + 修改方案 + 自我预测）
- **关键实验结果**：GPT-5.4 Terminal-Bench 2 从 69.7 → 77.0（+7.3 点），跨模型泛化（Qwen-3.6-Plus / Gemini-3.1-Flash / DeepSeek-V4 +5.1~+10.1 点），跨任务泛化（SWE-Bench Verified 高于 ACE 和 TF-GRPO）
- **关键洞察 1——"事实比策略更可迁移"**：Memory 单独恢复 95% 增幅；System Prompt 单独迁移反而性能下降
- **关键洞察 2——"人工先验的陷阱"**：人工行为指导让曲线过早触顶；删除所有行为指导、只保留证据驱动过程和回滚规则，效果最好
- **修改分布**：middleware 37% + tool 48% + prompt 10%——演化主要在中间件和工具层

## 深度分析

### 核心问题：Harness 迭代速度跟不上模型进化

Harness Engineering 的实践已经证明"Harness matters more than the model"（参见 [Harness Engineering Core Patterns Claude Code](../ch05/062-harness-engineering.html)），但 Harness 本身的迭代仍是人工经验驱动的。模型以月为单位迭代到 GPT-5.4、Claude 4.5、Gemini 3.1 这种代际，任务场景又往长尾分布发展——工程师手动调 prompt 写 tool description 配 middleware 的速度，已经追不上"模型升级 + 任务扩展"的复合速度。

AHE 的回答是：把 Harness 的迭代本身也变成一个 Agent 任务。让 Evolve Agent 在结构化环境里，基于真实执行证据自动修改 Harness。

### 三角色流水线

AHE 不只是"一个 Agent 调 prompt"，而是把演化拆成三个有明确职责边界的角色：

- **Coding Agent**：执行用户任务，跑测试，暴露失败模式
- **Agent Debugger**：把 Coding Agent 留下的 10M token raw trace，通过分层提炼流水线压成 10K token 的概览报告
- **Evolve Agent**：在概览报告上做"证据驱动修改"，每次修改附带"变更清单"（失败证据 + 推断根因 + 修改方案 + 自我预测）

这种拆分的妙处是：演化过程本身可被审查。Evolve Agent 的修改是"声明式"的——它必须告诉你"我看到了什么证据 → 推断什么根因 → 计划改什么 → 预测会带来什么效果"。人不需要直接审 Evolve Agent 的 token 流，只需要审计它的"变更清单"。

### 三层可观测性

AHE 的工程价值在可观测性的分层上：

| 层级 | 组件 | 解决的问题 |
|------|------|----------|
| 组件可观测性 | NexAU | Harness 被拆成 7 种正交文件级组件（System Prompt / Tool Description / Tool Implementation / Middleware / Skill / Sub-agent Config / Long-term Memory），每个组件 Git 版本管理 |
| 经验可观测性 | Agent Debugger | 把 10M token 原始轨迹压成 10K token 概览，分层提炼，丢掉噪音保留证据 |
| 决策可观测性 | Evolve Agent | 每次修改带变更清单（证据 + 根因 + 方案 + 预测），让演化过程可被审查和回滚 |

这其实是把传统软件工程里的"代码 + 日志 + 审计日志"三层概念，移植到了 Harness 这个新对象上。Harness 不再是黑盒 prompt，而是一个有版本、有日志、有审计的"代码库"。

### 关键洞察 1：事实比策略更可迁移

AHE 最反直觉的发现是：System Prompt 单独迁移到新模型上反而导致性能下降。原因是 Prompt 的语义是"策略性的"（"你应该这样做"），而 Memory 和 Tool 的语义是"事实性的"（"这里有一段可复用代码"）。事实比策略迁移性好。

消融实验数据：
- **Memory 单独就能恢复全局增幅的 95% 以上**——意味着 Harness 的核心价值在事实沉淀，不在策略声明
- **Tool 在中等难度题目上提升显著**——Tool 是事实性接口，可被新模型直接复用
- **System Prompt 单独迁移反而性能下降**——Prompt 高度耦合到具体模型的"听话程度"

这个发现直接挑战了"Prompt Engineering 是 Harness 核心"的主流叙事。真正能跨模型、跨任务迁移的，是 Memory 和 Tool 这些"事实性资产"，而不是 Prompt 这种"策略性指令"。

### 关键洞察 2：人工先验的陷阱

AHE 的演化曲线揭示了一个反直觉的现象：

- **仅在 30 道 hard 题目上演化 → 反复震荡（16-20 分）**：Evolve Agent 学会"针对性 hack"，但这种 hack 不会泛化
- **加入 Safety/Creativity/Generality 原则指导 → 曲线在 75.3% 早早触顶**：人工行为先验成了进化的僵化之源，Evolve Agent 被"好品味"束缚住，不敢做激进修改
- **最终方案：删除所有行为指导，只保留证据驱动过程要求和回滚规则**：让 Evolve Agent 自由探索，演化曲线反而更平滑

这与"对齐税"的直觉吻合：人工先验越具体，Agent 的探索空间越窄。当 Harness 自己能积累证据时，给它"该怎么做"的指导反而是负担。给它清晰的 workspace、明确的修改接口和高质量的反馈信号，Evolve Agent 的行为会"自动向真实工程师收敛"。

### 修改分布的启示

最终修改分布：middleware 37% + tool 48% + prompt 10%。这意味着演化主要发生在中间件和工具层——这两层是"事实性"最强的层，符合"事实比策略更可迁移"的判断。Prompt 反而是演化最少的部分，因为 Prompt 是策略性、最容易过拟合的部分。

## 实践启示

- **结构化环境 > 直接调 Harness**：当模型足够强时，搭建一个结构化的、可观测的演化环境，比直接开发 Harness 更重要
- **Memory 优先投资**：Harness 的核心价值在事实沉淀，Long-term Memory 应该是 Harness 设计的第一优先级
- **审计演化而非审计 Agent**：Evolve Agent 的修改用"变更清单"（证据 + 根因 + 方案 + 预测）声明，审计成本远低于审计 token 流
- **让 Agent 自由演化**：删掉"你应该这样做"的人工指导，保留证据驱动过程和回滚规则，让 Evolve Agent 自己探索
- **Harness 当作代码库管理**：用 Git 管理 Harness 的每个组件（Prompt、Tool、Middleware、Memory 等），把 Harness Engineering 升级为 Harness Software Engineering
- **跨模型泛化靠事实资产**：投资 Tool 和 Memory 而非 Prompt，能让 Harness 跟上模型代际更新

## 相关实体

- [Harness Engineering Core Patterns Claude Code](../ch05/062-harness-engineering.html)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](../ch03/045-agent.html)
- [Claude Code Harness Deep Understanding](../ch01/460-claude-code-harness-deep-understanding.html)
- [Ai Job Interview Model Evaluation Mollick](ch04/070-ai.html)
- [Ai Agent Engineer Learning Roadmap Backend 2026](ch04/147-ai-agent.html)
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- [Agent Observability](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-observability.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/fudan-agentic-harness-engineering-ahe-gpt54-7points.md)

---

