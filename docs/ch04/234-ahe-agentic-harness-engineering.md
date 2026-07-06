# 复旦北大 AHE：Agentic Harness Engineering 瓶颈分析

## Ch04.234 复旦北大 AHE：Agentic Harness Engineering 瓶颈分析

> 📊 Level ⭐⭐ | 10.5KB | `entities/fudan-peking-ahe-agentic-harness-engineering.md`

## 1. 被忽视的「Harness Engineering」瓶颈

Coding Agent 的进展不只取决于 Base Model 的智商，更取决于它外围的工程架构——Harness。Harness 是模型与外部世界之间的「中介层」，包括：System Prompt、Tools、Middleware、Skills/Sub-agents、Long-term Memory。

核心问题：如何让一个「进化 Agent」自动、稳定地联合优化 Harness 的所有可编辑组件？

作者抛出了一个反直觉的判断：进化 Agent 稳定优化 Harness瓶颈，不是因为 Agent 不够聪明，而是因为整个进化循环缺乏可观测性。

## 2. AHE 核心设计：三大可观测性支柱

AHE 的核心洞察是：瓶颈不在 Agent 能力，而在可观测性（Observability）。整个闭环由三大支柱支撑：

### 2.1 组件可观测性：文件级解耦 Harness

AHE 将 Harness 显式解耦为 7 种正交组件类型：System Prompt、Tool Description & Implementation、Middleware、Skill、Sub-agent Configuration、Long-term Memory。每个失败模式都能映射到单一组件类别。

种子 Harness 被刻意设计得极简（只有一个 shell 执行工具，无中间件、无技能），迫使后续每个组件都必须靠实测数据「挣」到自己的位置。

### 2.2 经验可观测性：分层蒸馏轨迹证据

原始轨迹是数百万 token 的「噪音海洋」。AHE 引入 Agent Debugger 框架，输出两层报告：Per-task Analysis（每个任务的根因分析）和 Benchmark-level Overview（聚合所有任务的全局概览）。这种渐进式披露既省 token，又保证决策有据可依。

### 2.3 决策可观测性：可证伪的编辑契约

进化 Agent 每轮读取分层证据后，决定增删改哪些组件。AHE 对编辑施加两道约束：

- **可控性**：进化 Agent 只能在 Harness 工作区内写入，运行目录、验证器、LLM 配置均为只读，种子 System Prompt 不可删除
- **自声明预测**：每个编辑附带 Manifest 记录，包含：失败证据推断的根因、目标修复方案、预测影响

## 3. 实验结果

### 3.1 AHE 能否超越人类与自动化基线？

在 Terminal-Bench 2（89 个任务，k=2 rollout/任务）上运行 10 轮 AHE：

- AHE 从种子 69.7% 提升至 77.0%
- 超越人类设计的 Codex-CLI（71.9%）和自进化基线 ACE（68.9%）、TF-GRPO（72.3%）

为什么 ACE 和 TF-GRPO 追不上？它们只编辑单一表面（Prompt 或工具序列），但 AHE 的增益恰恰来自工具实现、中间件和记忆。

### 3.2 进化结果是否过拟合？

跨基准迁移（SWE-bench-verified）：

- AHE 取得最高整体成功率，比种子少用 12% token
- ACE 和 TF-GRPO 的 Prompt 级注入在跨任务表面时变成「昂贵噪音」

跨模型迁移（5 个不同基座）：

- GPT-5.4 medium: +2.3 pp
- GPT-5.4 high: +7.3 pp
- GPT-5.4 xhigh: +2.3 pp
- Gemini-3.1-flash-lite: +5.1 pp
- DeepSeek-v4-flash: +10.1 pp
- Qwen-3.6-plus: +6.3 pp

规律：离饱和越远的模型，增益越大。

### 3.3 增益从哪来？自归因可靠性

组件消融：

- Long-term Memory: +5.6 pp
- Tools: +3.3 pp
- Middleware: +2.2 pp
- System Prompt: -2.3 pp（回归）

自归因可靠性：

- Fix Precision: 33.7%（随机基线 6.5%）
- Fix Recall: 51.4%（随机基线 10.6%）
- Regression Precision: 11.8%（随机 5.6%）
- Regression Recall: 11.1%（随机 5.4%）

进化 Agent 能可靠地知道自己要修什么，但预见不到自己的改动会搞坏什么。这是 AHE 当前最大的局限。

## 深度分析

### 可观测性驱动的范式转移

传统观点认为 Coding Agent 的进化瓶颈在于模型能力不足，但 AHE 揭示了一个更深层的结构性缺陷：进化循环缺乏足够的信号来指导编辑决策。当进化 Agent 无法准确判断「哪个组件导致了失败」时，它只能进行盲目搜索或依赖人类干预。这与机器学习中「没有观测就没有优化」的核心原则完全对应——在缺乏可观测性的情况下，进化搜索退化为随机扰动。

### 进化 Agent 的能力边界

AHE 的实验数据精确划定了进化 Agent 的能力边界：Fix Precision 达到 33.7%（随机基线的 5 倍），说明进化 Agent 在正向修复任务上具备可靠的自归因能力。但 Regression 相关指标（Precision 11.8%, Recall 11.1%）几乎等于随机基线，意味着进化 Agent 完全无法可靠预测自身改动带来的负面副作用。这解释了为什么 AHE 需要在 Harness 层面施加「种子 System Prompt 不可删除」这样的保守约束。

### 组件非加性交互

组件消融数据揭示了一个违反直觉的现象：System Prompt 的单独优化反而导致 -2.3 pp 的性能回归。这说明 Harness 组件之间存在强烈的非加性交互——单独优化某个组件可能破坏其他组件已经建立的协作模式。Long-term Memory（+5.6 pp）贡献最大，说明对于 Coding Agent 而言，历史任务经验的结构化积累是比精心设计的 System Prompt 更有价值的进化方向。

### 任务饱和效应与跨模型迁移

跨模型实验的核心发现是「离饱和越远，增益越大」——DeepSeek-v4-flash（+10.1 pp）和 GPT-5.4 high（+7.3 pp）远超 GPT-5.4 xhigh（+2.3 pp）。这一定量规律揭示了一个重要洞察：模型本身的能力越接近某个任务的上界，Harness 优化的边际收益越小。更重要的是，AHE 的跨模型迁移不依赖任何模型特定适配，说明通过可观测性驱动的 Harness 优化具有某种「领域无关」的通用性。

### 编码通用协调模式 vs 模型特定提示词

AHE 的架构选择（Tool Description、Middleware、Skill 作为独立可编辑组件）与传统 Prompt Engineering 的本质区别在于：前者编码的是「通用协调模式」，后者调优的是「模型特定提示词」。通用协调模式可以在不同模型家族之间零样本迁移，而模型特定提示词在跨模型时变成「昂贵噪音」。这解释了为什么 AHE 的进化结果在 SWE-bench 上比种子基线少用 12% token——因为它学会的是「如何协调工具」而不是「如何给特定模型写 prompt」。

## 实践启示

### 可观测性基础设施建设优先

在构建任何生产级 Coding Agent 时，应将可观测性基础设施（轨迹记录、根因分析、组件级归因）作为与模型能力同等优先的工程投资。缺乏可观测性的 Agent 系统，其优化空间将很快遭遇瓶颈。AHE 框架的 Agent Debugger 输出设计（Per-task Analysis + Benchmark-level Overview）是一个值得参考的分层设计模式。

### 极简种子设计原则

设计进化 Harness 的起点时，遵循「极简种子」原则：只包含最少数量的必要组件（如 AHE 只用一个 shell 执行工具），让每个后续添加的组件都必须通过实测数据证明自己的存在价值。这避免了「过早复杂化」陷阱——在还没有足够观测数据时添加中间件或技能，只会让问题空间膨胀而无法定位真正有效的组件。

### 硬约束与自声明预测

在构建进化 Agent 时，为编辑操作添加「可控性」约束（如只读运行目录和验证器）和「自声明预测」机制（每个编辑附带 Manifest 记录预测影响）。AHE 的实验表明，Fix Precision 高达 33.7% 是因为进化 Agent 有了自声明预测的压力后，决策质量显著提升。在没有约束的情况下，进化 Agent 倾向于过度乐观地评估自己的改动。

### 预测-验证闭环

利用 AHE 的「自声明预测 + 实际结果对比」机制建立预测-验证闭环。每个编辑决策之前，记录预测影响；执行后，对比实际结果与预测的偏差。这个闭环不仅能积累可归因的进化知识，还能逐步校准进化 Agent 对自身能力边界的认知——减少「预见不到搞坏什么」的问题。

### 正交组件设计与分层评估

将 Harness 解耦为正交组件类型（System Prompt、Tool、Middleware、Skill、Memory 等），确保每个组件的职责边界清晰。这种设计使得组件级消融实验成为可能——只有能够独立评估，才能独立优化。AHE 的 7 类组件划分提供了一个可参考的粒度标准。

### 任务饱和感知调度

在分配进化计算资源时，优先选择「离饱和越远」的模型和任务组合——同样的进化投入，在低饱和场景下可以获得 3-5 倍的相对收益。对于已接近任务上界的模型，应该将优化方向从「提升绝对性能」转向「降低 token 消耗」或「提升跨任务鲁棒性」。

## 相关实体
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-engineering-framework.md)
- [Harness Engineering 第三代工程范式](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-engineering-第三代工程范式.md)
- [Huggingface Ai Agent Glossary Model Scaffolding Harness Tool Skill Subagent](https://github.com/QianJinGuo/wiki/blob/main/entities/huggingface-ai-agent-glossary-model-scaffolding-harness-tool-skill-subagent.md)
- [Tencent Vibe Coding To Agentic Engineering Backend](https://github.com/QianJinGuo/wiki/blob/main/entities/tencent-vibe-coding-to-agentic-engineering-backend.md)
- [Agentic Ai System Architecture Harness Skill Mcp](https://github.com/QianJinGuo/wiki/blob/main/entities/agentic-ai-system-architecture-harness-skill-mcp.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/fudan-peking-ahe-agentic-harness-engineering.md)

---

