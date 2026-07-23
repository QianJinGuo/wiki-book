# Twilight of the Chatbots：从聊天机器人到自主 Agent 的转型

## Ch04.688 Twilight of the Chatbots：从聊天机器人到自主 Agent 的转型

> 📊 Level ⭐⭐⭐ | 7.9KB | `entities/the-twilight-of-the-chatbots-mollick-2026.md`

# Twilight of the Chatbots：从聊天机器人到自主 Agent 的转型

> **Background**: Ethan Mollick 在 One Useful Thing 发表的深度分析，论述 AI 能力加速发展正推动行业从简单聊天机器人向自主 Agent 的范式转变。文章梳理了 AI 能力的三个关键转型信号和能力阶梯。

## 摘要

AI 行业正处于从"聊天机器人时代"向"自主 Agent 时代"转型的临界点。Mollick 认为，聊天机器人的交互模式（用户发一条指令 → AI 回复一条）正在被 Agent 模式（AI 自主规划和执行多步任务）所取代。这一转型不仅在技术层面发生，也在商业模式和用户预期层面同步推进。核心驱动力是 AI 能力的指数级增长——前沿模型在自主任务时长上从数小时扩展到 16 小时以上，使得"委托任务"而非"一步步指导"成为更高效的工作方式。

## 核心论点

Mollick 认为 AI 正在经历一场从"协作智能"（Co-intelligence）到"委托管理"（Management by Delegation）的深刻转变。变革的驱动力来自三个层面：模型能力的持续加速突破传统基准、Agent 框架和工具的快速成熟（从概念验证到生产部署）、以及用户行为从"提问"到"委托任务"的转变。这些信号共同指向了一个未来：AI 不再是回答工具，而是执行工具。

## 深度分析

### 指数增长的感知困境

Mollick 尖锐地指出："我们非常不善于从内部感受指数增长。"（We are very bad at feeling exponentials from the inside, and we are currently inside one.） 这一点对理解 AI 发展的节奏至关重要。

指数增长的特点是：**每次固定时间窗口内的变化都比上一次更大**。如果一家组织在 2025 年冬季之前制定的 AI 计划，描述的是"一个可以完成数小时工作但错误率相当高的系统"，那么几个月后，同一个组织就能从单个 Prompt 获得 16 小时以上的自主工作产出。这种节奏使得 AI 始终给人"突飞猛进"的感觉——虽然从宏观曲线上看是平滑的指数增长，但从微观体验上看却是一系列"冲击"。

这解释了围绕 AI 的种种"动荡"：AI 在成为真正的网络安全威胁之前，看起来似乎不足为惧——直到突然之间它确实构成了威胁，导致最高层政策突变。市场的反应模式类似：AI 可能威胁商业模式的信号被持续低估，直到突然引发大规模股价波动。**这些"震荡"不是行业不成熟的信号，而是人类速度的组织试图追赶非人类速度的技术曲线的必然结果。**

### Agent 能力评估的三个关键基准

Mollick 引用了三个关键评估框架来量化 AI 的 Agent 能力增长：

1. **METR 时间跨度评估**：衡量 AI 单次 Prompt 可以完成多少人类程序员的工时
2. **AISI 自主能力评估**：英国政府 AI 安全研究所对 AI 自主网络能力的官方测评
3. **AA-Briefcase 测试**：模拟复杂的多周咨询任务，评估 AI 在多种分析任务中的综合表现

值得注意的是，Mollick 将中国开源权重模型也纳入分析，发现它们在 AA-Briefcase 上呈现自己的指数曲线，落后美国闭源模型约 6-12 个月。这一框架与 [Mollick 的 Co-Existence 框架](../ch01/567-ai-mollick.html) 中的"能力阶梯"概念一脉相承。

### 从"外行聊天"到"专家委托"的范式转换

Mollick 提出了一个关键洞察：**AI 使用方式正从"非专家用聊天机器人填补知识空白"转向"专家用 Agent 完成工作任务"**。

研究数据表明：Claude Code 用户的成功率与他们的职业身份无关，而与他们在特定领域的专业知识深度相关。拥有更多领域经验的用户，不仅在使用 Agent 时成功率更高，而且每个 Prompt 获得的产出质量也更高。

这一发现对 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 具有重要启示：Agent 系统设计的核心目标不应是"降低使用门槛让所有人都能用"，而应是"为专家提供更强的问题解决杠杆"。这与传统软件工具的设计哲学一致——最好的工具往往不是最简单的，而是最强大的。

### Agent 化的工作模式变革

OpenAI 与学术经济学家联合进行的研究显示，Agent 使用正在以惊人的速度渗透企业内部。在 OpenAI 内部，四分之一的员工每周同时运行至少四个 Agent。关键是，不仅仅是程序员在使用 Agent——法务、HR 和其他非技术职能的员工以几乎相同的速度采纳了这一工具。

OpenAI 可能正在成为"煤矿里的金丝雀"——预示其他行业将要经历的变化。当编程工作由 AI 在专门的 Harness 和应用中完成后，其他角色也开始以某种方式"编程"——他们不是在写代码，而是在设计和管理 AI 工作流。这意味着 [Harness Engineering](../ch05/117-harness-engineering.html) 的能力将成为跨职能的核心竞争力，而非仅限于技术团队。

### Agent 的"额外机械"优势

Mollick 指出，Agent 的优势不仅来自底层模型的进步，还来自"额外机械"（extra machinery）——提供工具访问权限和行动环境的 Harness，以及为 Agent 构建的专门应用（如 Claude Code 或 OpenAI Codex）。这些工具可以进一步提升 AI 模型的能力。

这一观点与 [Hermes Agent 的 Skill 设计](../ch01/338-hermes-agent-skill.html) 理念一致：好的 Harness 不是简单的 API 封装，而是能放大模型能力的系统性框架。模型的能力曲线和 Harness 的工程优化存在乘数效应。

## 实践启示

1. **指数思维取代线性思维**：在规划 AI 采用策略时，假设能力将线性增长是一个系统性错误。应基于指数增长假设制定策略，并定期（每季度）重新评估 AI 的能力基线
2. **专家才是 AI 的最大受益者**：不要试图用 AI 替代专家，而应让 AI 成为专家的"超级放大器"。领域知识越深，从 Agent 化中获得的价值越大
3. **从 Co-intelligence 到 Delegation**：工作方式正在从"与 AI 协作"转向"向 AI 委托任务"。这意味着人类角色从"执行者"转变为"管理者"——评估 AI 产出、设定目标、管理多个并行 Agent
4. **建立组织级的 Agent 评估框架**：跟踪 METR、AISI、AA-Briefcase 等基准的变化，建立与自身业务相关的 Agent 能力基线。当 Agent 能力跨越关键阈值（如"能自主完成 8 小时工作"）时，及时调整组织的工作流程
5. **Harness 质量决定 Agent 上限**：Agent 的实际产出不仅取决于底层模型，还取决于 Harness 的设计质量。投资于 Harness 工程（工具集成、上下文管理、评估体系）与投资于模型能力同等重要

## 相关实体

- [Co-Existence：AI Agent 化范式的演变](../ch01/567-ai-mollick.html)
- [使用 Mythos 的真实体验](ch04/311-what-it-feels-like-to-work-with-mythos.html)
- [Harness Engineering 探索之旅](../ch05/117-harness-engineering.html)
- [Hermes Agent Skill 设计分析](../ch01/338-hermes-agent-skill.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/the-twilight-of-the-chatbots.md)

---

