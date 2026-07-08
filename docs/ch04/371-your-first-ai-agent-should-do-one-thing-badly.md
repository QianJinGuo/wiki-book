# Your First AI Agent Should Do One Thing Badly

## Ch04.371 Your First AI Agent Should Do One Thing Badly

> 📊 Level ⭐⭐ | 7.6KB | `entities/your-first-ai-agent-should-do-one-thing-badly.md`

# Your First AI Agent Should Do One Thing Badly

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/your-first-ai-agent-should-do-one-thing-badly.md)

## 摘要

CrewAI 团队的核心论断：最有效的 agentic 系统都起步于"丢人的简单"——更少的 agent、更窄的任务、做得更糟。Agentic 系统的开发周期与软件工程传统开发周期存在根本差异，必须**迭代式构建**（crawl, walk, run）。本文用 healthcare staffing POC 案例与五条具体原则，论证"POC 墓地"陷阱与"先做一个糟糕的 agent"作为起点的反直觉优势。

## 核心要点

- **POC 墓地陷阱**：技能娴熟的工程师设计"理想系统"——研究员 agent 给规划 agent 喂数据，规划 agent 协调执行 agent，质量 agent 验证结果。三个月后，仍停留在开发阶段，零生产流量。问题不是野心，是**在还没理解系统时就优化**。
- **医疗人员资质验证案例**：一家医疗人员配置公司没有从自动化整个入职流水线开始，而是只做了一件事——背景调查工作流。第一个版本简单直接：收集人员数据、查询相关源、JSON 结构化输出、基于数据决策、推送结果到 Snowflake。几周交付，后续通过真实运行逐步加上护栏、人工审计、并行工作流。
- **Human-in-the-loop 是特性不是限制**：从 100% 人工审核开始，逐步降到 80% → 50% → 完全自主。审核者会告诉你**实际**哪里出错，而不是你**想象**会出错的地方。
- **失败要令人满意地明显**：开发阶段不要做花哨的错误恢复，要做"响亮的失败"——能看到失败、理解失败、修复根本原因。这与传统软件"优雅降级"原则相反。
- **凭证据而非直觉添加 agent**："我觉得我们需要一个验证器"是猜测；能说出"47% 错误是格式问题，验证器能抓"才是有依据的决策。多 agent 架构会**倍增调试面**。

## 深度分析

### 1. 为什么 Agentic 系统不能"先设计再实现"

传统软件：行为可从代码推导、可静态分析、可单元测试。Agentic 系统的行为**从 prompt、工具、数据、MCP、模型的交互中涌现**——你无法在写代码前完全规定其行为。唯一理解交互的方式是**让它跑起来看实际结果**。这不是技术限制，是工作方式的本质。这意味着"先做后完美"不仅是速度选择，是认识论上的必要。

### 2. POC 墓地的具体形态

文中描述的典型陷阱是"system architect 病"：
- 设计完整的多 agent 拓扑
- 详细交接协议
- 复杂错误处理
- 但**没有生产流量** → 0 ROI
- 错误处理针对**不会发生的错误**，错过**会发生**的错误
- 在知道什么值得规模化之前就为规模设计

这是对软件工程师本能的**逆向挑战**——传统训练让你"预见边界情况、为规模化设计"，但 agentic 系统下，这些直觉是负债。

### 3. 医疗人员验证案例的"单点切入"模式

医疗人员入职有多步：核实执照、查询医疗委员会、检查制裁名单、验证身份。每一步的延迟都影响收入。该团队选**背景调查**为切入点：数据源相对结构化、流程可单点优化、错误代价可量化（多查一次 vs 漏查一次）。从这一单点出发，逐步把流程从几天压缩到几小时。这个模式与 [Mollick 的"输出定义-让 AI 找路径"](ch04/330-the-bitter-lesson-versus-the-garbage-can.html) 相符——先把可衡量的结果锚定，再让系统找到实现路径。

### 4. "Crawl, Walk, Run" 与 Karpathy 的 Vibe Coding 转向

CrewAI 强调的"crawl, walk, run"迭代哲学与 Karpathy 提出的 vibe coding → agentic engineering 转向同源：人类角色从"完美代码作者"转为"agent 行为管理者"。迭代速度（weekly）取代路线图（quarterly）——每周看上周实际失败了什么，磨 prompt、补护栏、调控制杠杆。

### 5. 多 Agent 架构的"复杂度税"

多 agent 架构是**强力的同时是高代价的**——调试面倍增，每个 agent 都有自己的失败模式与互相干扰。文中建议把"添加 agent"视为"挣来的复杂度"：你必须有证据证明需要，而不是直觉。这与 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 的"最小可行 harness"原则同源——先用最简单 harness 跑起来，再按需添加 subagent、MCP 等组件。

### 与相邻观点的张力

- 与 [苦味教训](ch04/330-the-bitter-lesson-versus-the-garbage-can.html)的张力：Sutton 派认为不要为人类理解编码；本文认为不要为未知架构编码——但前者鼓励**算力与训练**取代精心设计，后者鼓励**迭代与证据**取代预先架构。
- 与 [管理即超能力](../ch01/518-management-as-ai-superpower.html)互补：Mollick 强调"管理能力"是新关键技能；本文强调"管理复杂度"是关键约束——少 agent、少功能、少优化。
- 与 [Your First Ai Agent Should Do One Thing Badly](ch04/371-your-first-ai-agent-should-do-one-thing-badly.html) 的"crawl, walk, run"与 [Claude Code 现状评估](../ch01/452-claude-code-and-what-comes-next.html) 的"一小时跑完"形成节奏对比——前者周迭代，后者小时级自治。

## 实践启示

1. **从单点切入而非全流程**：找到流程中**单点最痛、数据相对结构化、结果可量化**的一步，先做 agent 化。医疗资质验证、月度财务报告、客户邮件分类——都比"全流程自动化"更易成功。
2. **保留 100% 人工审核为基线**：用 100% → 80% → 50% → 自主的渐进路径，每一步基于**真实失败数据**而非直觉信任。
3. **失败要响亮不要优雅**：开发阶段让错误明显到无法忽略，比花哨的"自动重试 + 静默降级"更能加速迭代。
4. **以证据决定多 agent 架构**：用"47% 错误是 X 模式"这类具体数据决定是否拆出独立 agent，而非"听起来合理"。
5. **以周为节奏而非季度**：每周看实际失败了什么，针对性调 prompt、补护栏。把季度路线图换成 weekly iteration loop。

## 相关实体

- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](ch04/236-agentic.html)
- [Karpathy Vibe Coding Agentic Engineering](ch04/126-karpathy-vibe-coding-agentic-engineering.html)
- [The Bitter Lesson Versus The Garbage Can](ch04/330-the-bitter-lesson-versus-the-garbage-can.html)
- [Claude Code And What Comes Next](../ch01/452-claude-code-and-what-comes-next.html)
- [Management As Ai Superpower](../ch01/518-management-as-ai-superpower.html)
- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](ch04/292-agentops-operationalize-agentic-ai-at-scale-with-amazon-bed.html)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](../ch03/045-agent.html)
- [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- [Agentic Engineering Paradigm](https://github.com/QianJinGuo/wiki/blob/main/concepts/agentic-engineering-paradigm.md)
- [Harness Loop Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-loop-architecture.md)

---

