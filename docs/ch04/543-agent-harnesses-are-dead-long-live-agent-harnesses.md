# Agent Harnesses Are Dead. Long Live Agent Harnesses.

## Ch04.543 Agent Harnesses Are Dead. Long Live Agent Harnesses.

> 📊 Level ⭐⭐⭐ | 8.0KB | `entities/agent-harnesses-are-dead-long-live-agent-harnesses.md`

# Agent Harnesses Are Dead. Long Live Agent Harnesses.

## 摘要

Agent Harness 正经历从"硬编码框架"到"声明式配置驱动"再到"纠缠式软件（Entangled Software）"的范式转变。CrewAI 创始人 João Moura 在 2026 年 4 月的深度分析中指出：构建层正在快速商品化，Harness 作为独立层正在"死亡"，但 Harness 的核心价值——约束、验证、编排——并未消失，而是被吸收到更高层级的平台能力中。

## 核心论点：Harness 的商品化周期

### 框架→脚手架→Harness 的术语轮回

行业术语以越来越快的速度迭代：Framework → Scaffold → Harness。每一代都比上一代更"有主见"（opinionated），Harness 内置了规划、记忆、文件系统和压缩能力。但底层的经济规律没有变——构建层越来越便宜，任何可被 API 封装的层最终都会被商品化。

### 模型提供商正在吸收整个栈

每个季度，又一个原始能力被移到 API 后面。模型提供商（Anthropic、OpenAI、Google）不断向下吞噬栈空间：从纯模型推理 → 带工具的模型 → 带记忆的模型 → 带规划的模型。Harness 层越来越薄，因为越来越多的"Harness 功能"变成了模型原生能力。

### Garry Tan 的"Harness 即管道"视角

Garry Tan 精准指出：Harness 应该是薄的。Harness 是管道（plumbing）。管道很重要，但没有人能在管道上建立令人兴奋的、有防御力的产品。这暗示了价值正在从基础设施层向上迁移到数据和分发层。

## 深度分析

### 1. 构建成本坍塌对 SaaS 的冲击

当构建变得便宜时，受影响的不只是创业公司——现有 SaaS 巨头同样面临挑战。每个企业用户只使用了所购软件的"一小部分功能"，他们在脑中运行着自己的定制版本。当构建成本趋近于零，企业的第一直觉是"我只构建我真正需要的"，这意味着传统 SaaS 的"功能膨胀"定价模式面临根本性质疑。

这与 [Hermes Agent Operator](ch04/502-agent.md) 中讨论的"Agent 可运营性"形成呼应——当 Agent 构建足够便宜，竞争焦点从"能否构建"转向"能否运营和持续改进"。

### 2. 真正能复利的事物

当构建变便宜，价值迁移到无法被一夜复制的层：

- **分发（Distribution）**：触及用户的渠道和信任关系
- **专有数据（Proprietary Data）**：花费数年积累的数据资产
- **产品智能（Product Intelligence）**：产品随用户使用而积累的模式和反馈
- **生产信任（Production Trust）**：在生产环境中赢得的可靠性声誉

这些要素的组合创造了优秀软件与平庸软件之间的分界线。你不能通过"Vibe Coding"获得第一千个客户积累的模式反馈——那个飞轮是挣来的，不是构建出来的。

### 3. Entangled Software（纠缠式软件）——Agent 的未来形态

Moura 提出的核心概念：从物理学借用的"纠缠"隐喻——当两个粒子纠缠，一个粒子的状态立即反映另一个粒子的状态。在纠缠式软件中，产品和客户相互影响：客户行为塑造软件，软件反过来塑造客户的工作方式，最终两者变得不可分割。

这与过去三十年软件的工作方式完全相反——我们一直构建工具并要求人类适应它们。纠缠式软件翻转了这一假设：软件适应行为，而不是行为适应软件。这在没有 Agent 之前是不可能的。

**对 Agent 系统的含义**：Agent 系统正在演变为"纠缠式 Agent 系统"（Entangled Agentic Systems）。当 Agent 真正部署到客户的流程、数据和工作中，它们变得完全纠缠——客户无法轻易替换，因为 Agent 已经深度嵌入其运营方式。这与 [Harness Engineering 核心模式](ch03/073-claude-code.md) 中讨论的"Agent 与工作流的深度耦合"一致。

### 4. "路，而不是车"——基础设施 vs 应用层的价值分配

框架和 Harness 的争论是关于"如何造车"。但赢得这个时代的公司不会是造出最好车的公司，而是造出"路"的公司——信任、数据和适应的基础设施，每辆车都需要在这条路上行驶。

这一洞察与 [Claude Code 动态工作流](ch04/150-ai.md) 中讨论的"工作流即基础设施"观点一致：真正的护城河不是 Agent 框架本身，而是围绕 Agent 建立的运营数据、用户习惯和组织流程。

### 5. CrewAI 的平台化转型

CrewAI 同时构建了框架（CrewAI Flows）和 Harness（CrewAI Crews and Agents），现在正在构建"两者之后的东西"——一个平台，Agent 不仅执行任务，还从每个客户的工作流中学习，适应每个组织的实际运作方式，通过纠缠而非配置来改进。

这种演进路径：Framework → Harness → Platform（Entangled Agentic System），代表了 Agent 基础设施的成熟度模型。

## 实践启示

1. **Harness 层正在变薄，但不会消失**：Harness 的核心功能（约束、验证、编排）正在被模型提供商吸收到 API 层，但企业级 Harness 的价值转向"安全边界 + 策略执行 + 可观测性"。选择 Harness 时应关注其"非商品化"能力，而非基础编排功能。

2. **构建成本坍塌后的竞争策略**：当任何团队都能在周末 Vibe-Code 一个 Agent 原型，真正的竞争壁垒从"构建能力"转向"数据飞轮 + 分发渠道 + 生产信任"。建议将 70% 的资源投入这些复利层，30% 投入构建层。

3. **纠缠式软件是终极锁定**：如果 Agent 深度嵌入客户的工作流、数据和决策模式，替换成本将远超任何合同条款。设计 Agent 产品时应优先考虑"纠缠深度"——Agent 与客户运营的耦合程度——而非功能数量。

4. **Harness 选型的未来-proof 原则**：优先选择那些"薄而开放"的 Harness（如 [Hermes Agent](ch04/502-agent.md)），它们提供核心约束但不绑定到特定模型或基础设施。避免选择"厚而封闭"的 Harness，后者在模型提供商吸收栈后迅速贬值。

5. **"路 vs 车"的资源配置**：在 Agent 产品组合中，区分"车"（Agent 功能/界面）和"路"（数据管道、反馈循环、信任机制）。前者需要快速迭代但不必完美，后者需要深度投资因为它是长期护城河。建议"路"的投入是"车"的 2-3 倍。

## 相关实体

- [Hermes Agent Operator](ch04/502-agent.md)
- [Harness Engineering 核心模式](ch03/073-claude-code.md)
- [Claude Code 动态工作流](ch04/150-ai.md)
- [Harness Generator-Evaluator](ch01/707-anthropic.md)
- [Agent Reliability Engineering](ch04/245-skill.md)
- [当 AI 构建自身](ch04/150-ai.md)
- [Prime Intellect Auto NanoGPT](https://github.com/QianJinGuo/wiki/blob/main/entities/prime-intellect-auto-nanogpt-opus-2930.md)

---

