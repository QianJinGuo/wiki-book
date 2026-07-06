# AHE：Agentic Harness Engineering

## Ch04.231 AHE：Agentic Harness Engineering

> 📊 Level ⭐⭐ | 10.5KB | `entities/agentic-harness-engineering-ahe.md`

## 核心问题
Harness Engineering 迭代依赖人工经验，模型以月为单位进化、任务场景往长尾分布发展——如何让 Harness 自动从经验中学习并改进？

## 论文信息
- **标题：** Agentic Harness Engineering: Observability-Driven Automatic Evolution of Coding-Agent Harnesses
- **arXiv:** arxiv.org/abs/2604.25850
- **代码:** github.com/china-qijizhifeng/agentic-Harness-engineering
- **团队:** 复旦大学、北京大学、上海奇绩智峰

## 方法：三角色 × 三层可观测
### 三角色
| 角色 | 职责 |
|------|------|
| Coding Agent | 运行测试 |
| Agent Debugger | 整理轨迹 |
| Evolve Agent | 修改 Harness 实现进化 |

### 三层可观测性
**1. 组件可观测性（NexAU）**
Harness 拆成七种正交文件级组件，每个独立文件，通过 Git 版本管理：

- System Prompt
- Tool Description
- Tool Implementation
- Middleware
- Skill
- Sub-agent Config
- Long-term Memory
目标 Coding Agent 从"零先验"极简形态起步（只有一个 run_shell_command 工具），确保每次新增组件都能被干净归因。
**2. 经验可观测性（Agent Debugger）**
分层提炼流水线：

- 底层：完整记录所有原始轨迹
- 中层：Cleaner 去除重复工具输出
- 上层：QA Sub-agent 针对每题多次 rollout 自动切换提问策略
**10M token raw trace → 10K token 概览报告。** Evolve Agent 默认只需阅读概览，随时可回溯原始轨迹。
**3. 决策可观测性（Evolve Agent）**
证据驱动修改，每次变更必须附带"变更清单"：

- 失败的证据（具体哪些任务失败了）
- 推断的根因
- 针对性的修改方案
- 自我声明的预测（预计修复哪些任务、可能破坏哪些任务）
**约束：** 只能修改 workspace 内的 Harness 组件文件；评测框架、LLM 配置、原始 System Prompt 均为只读。预测正确的修改保留，预测错误的自主回滚。
> 每一次 Harness 变动不再是无工程师的直觉、抽象经验，而是一条可被下一轮实验所证伪的假说。**Harness 进化由此从艺术走向工程，从经验走向科学。**

## 实验结果
| 配置 | 结果 |
|------|------|
| GPT-5.4 + AHE Terminal-Bench 2 | 69.7 → **77.0**（+7.3点，相对+10.5%）|
| vs OpenAI Codex-CLI | 71.9%（AHE 更高）|
| 全球排名 | **第三** |
| 跨模型泛化（GPT-5.4 演化 Harness 直接迁移）| Qwen-3.6-Plus: +5.1点；Gemini-3.1-Flash: +7.3点；DeepSeek-V4: +10.1点 |
| 跨任务泛化 | SWE-Bench Verified 上比 ACE 和 TF-GRPO 更高成功率 |

### 修改分布
middleware 37% + tool 48% + prompt 10%——没有任何层级单独占比超过一半，不同阶段灵活调整。

## 关键洞察
### "事实比策略更可迁移"
消融实验（Memory/Tool/Middleware/System Prompt 逐一单独放回）：
| 组件 | 效果 |
|------|------|
| **Memory** | **单独恢复全局增幅的 95% 以上** |
| Tool | 中等难度题目提升显著 |
| System Prompt | 单独迁移反而导致性能下降 |
**原因：** Prompt 的语义是"策略性的"（你应该这样做），而 Memory 和 Tool 的语义是"事实性的"（这里有一段可复用代码）。事实比策略迁移性好。

### 人工先验的陷阱
| 策略 | 结果 |
|------|------|
| 仅在 30 道 hard 题目上演化 | 16-20 间反复震荡，Evolve Agent 写针对性 hack |
| 加入"Safety/Creativity/Generality"原则指导 | 75.3% 早早触顶，人工行为先验成了进化的僵化之源 |
| 删除所有行为指导，只保留证据驱动 | 77.0% 稳步提升，修改分布健康 |

### 核心启示
> 当模型足够强，搭建一个结构化的、可观测的演化环境，比直接开发 Harness 更重要。
无需替 Agent 思考方法论——给它清晰的 workspace、明确的修改接口、高质量的反馈信号，Evolve Agent 的行为便自动向真实工程师收敛。

## 深度分析
### AHE 的工程哲学：从直觉迭代到假说-验证闭环
传统 Harness Engineering 依赖人类工程师的隐性知识——对模型行为的直觉、对失败模式的经验感知。这种方式的问题在于知识无法形式化、无法累积、无法自动化。每次模型升级（如 GPT-4 → GPT-4.5），大量人工经验直接失效，工程师必须重新"培养手感"。
AHE 的核心贡献是将这套隐式知识显式化为**可证伪的假说体系**：每次修改必须有失败证据、根因推断、修改方案和自我预测。这个框架的精妙之处在于——它让进化本身变得可观测、可回滚、可累积。Evolve Agent 不再是"碰运气"，而是像一个真正的工程师那样工作：提出假说、设计实验、观察结果、修正方向。

### 三层可观测性的递进价值
组件可观测性解决的是**归因问题**：当性能提升或下降时，到底是哪个组件的贡献？传统 Harness 的所有组件混在一个文件里，修改即污染，归因几乎不可能。NexAU 的七种正交组件 + Git 版本控制，从工程基础设施层面保证了这一点。
经验可观测性解决的是**信息压缩问题**：10M token 原始轨迹 → 10K token 概览报告，压缩比 1000:1，但关键信息得以保留。Agent Debugger 的分层提炼（原始 → Cleaner → QA Sub-agent）本质上是做了一个蒸馏（distillation）操作——把模型行为的事实蒸馏成工程师可读的语义报告。
决策可观测性解决的是**自我修正问题**：约束条件（只能改 workspace 内的 Harness 组件；评测框架、LLM 配置、原始 System Prompt 只读） + 预测错误的自主回滚机制，让 Evolve Agent 的错误成本可控。这两条约束是整个体系的"护栏"，没有它们，自动化进化会迅速失控。

### "事实比策略更可迁移"的深层含义
这个发现对整个 AI Engineering 领域有普遍意义。System Prompt 的语义是策略性的——"你应该这样做"——这意味着它绑定到特定任务的特定解决路径。一旦任务分布或模型能力发生变化，这条策略就可能完全失效，甚至产生反效果（单独迁移 System Prompt 导致性能下降）。
Memory 和 Tool 的语义是事实性的——"这里有一段可复用代码"、"这个工具有这个功能"。事实性知识不依赖任务上下文，不依赖"应该怎么做"的推理链，它就是客观存在。跨模型迁移时，事实性知识天然抗分布漂移。
这给 AI 工程实践的启示是：**我们应该把越多的决策逻辑编码为事实（Memory/Tool），而非策略（Prompt）**。例如，不在 System Prompt 里写"遇到排序问题先用快速排序"，而是构建一个包含排序算法实现的 Memory 库，让模型自己决定何时调用。

### 人工先验的双刃剑效应
实验揭示了一个深刻矛盾：人类工程师倾向于为 Evolve Agent 提供"行为指导原则"（Safety/Creativity/Generality），但这些原则在实践中反而成了进化路径的"局部最优陷阱"——提前触顶，无法继续探索。
这与强化学习中的"奖赏函数工程"问题高度相似：过于具体或狭窄的奖赏函数会导致策略收敛到意外角落。75.3% 早早触顶的原因很可能是 Generality 原则过于抽象，模型在追求通用性的过程中牺牲了针对性和深度；而删除所有行为指导后，反而释放了进化的探索空间。
**启示**：在设计自动化进化系统时，要极度谨慎地引入人类先验。如果必须引入，应该让先验足够抽象和宽松，不要用先验替代演化过程中的探索。

## 相关链接
- [Agent Harness Engineering Survey 2026](../ch05/092-harness-engineering.md)
- [Hermes Agent Closed Learning Loop](../ch03/090-hermes-agent.md)

## 实践启示
### 对 Harness 工程团队
1. **建立组件化 Harness 基础设施**：将 System Prompt、Tool Description、Middleware、Skill 等拆分为独立文件，配合 Git 管理。这是最重要的技术债务，也是后续所有自动化的前提。
2. **构建轨迹蒸馏流水线**：用 Agent Debugger 自动化原始轨迹的提炼——Cleaner 去噪 + QA Sub-agent 策略分析。这是 Evolve Agent 高效工作的信息基础。
3. **强制证据驱动的修改规范**：要求每次 Harness 变更必须附带失败证据、根因分析和预测，消除"凭感觉改"的习惯。预测正确的修改保留，错误的自主回滚。
4. **优先迁移事实性组件**：跨模型或跨任务迁移时，优先迁移 Memory 和 Tool 实现，谨慎迁移 System Prompt。必要时可以完全丢弃原 System Prompt，只在新模型上重新设计。
5. **警惕人工先验的过早收敛**：如果引入行为原则指导，确保原则足够抽象；在自动化进化早期阶段，让系统充分探索，再考虑引入约束。

### 对 AI  工程平台设计者
1. **算力分配应向可观测性基础设施倾斜**：在 AHE 的三角色中，Coding Agent 和 Evolve Agent 本质上都在消耗算力，但 Agent Debugger 的可观测性基础设施决定了进化的效率上限。
2. **评测框架必须只读**：这是 AHE 能实现自动回滚的技术前提。如果评测框架可被修改，Evolve Agent 可能通过修改评测来"作弊"，而不是真正改进 Harness。
3. **设计多模型 adversarial 验证**：AHE 中 Evolve Agent 的约束机制本质上是一种 adversarial 设置——让修改者无法替自己圆场。在设计自动化优化系统时，应内置这种"对立方"角色。
4. **跨任务泛化比单任务优化更有长期价值**：SWE-Bench Verified 上的泛化结果比单任务分数更有说服力——这说明 AHE 学到的是可迁移的结构，而非针对特定评测的 hack。

## 相关概念
- HarnessEngineering — Harness Engineering 基本框架（实体不存在，待创建）
- MemoryInAgent — Memory 是事实性载体，比策略性 Prompt 更可迁移（实体不存在，待创建）

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/fudan-agentic-harness-engineering-ahe-gpt54-7points.md)

- ToolUseInAgent — Tool 在中等难度题目上效果显著（实体不存在，待创建）

---

