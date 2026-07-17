# Harness Engineering：AI工程的三次进化

## Ch05.031 Harness Engineering：AI工程的三次进化

> 📊 Level ⭐⭐ | 15.9KB | `entities/harness-engineering-three-evolutions.md`

## 概述
Prompt Engineering（说对）、Context Engineering（给对）、Harness Engineering（系统可靠）构成AI工程能力的三个维度。三层嵌套、相互依存，缺一不可。核心公式：`Agent = LLM + Harness`。
| 阶段 | 核心问题 | 本质 |
|------|---------|------|
| Prompt Engineering | 我该跟模型说什么？ | 加约束——激发模型的正确能力 |
| Context Engineering | 模型该知道什么？ | 准备简报——对抗金鱼记忆 |
| Harness Engineering | 系统如何可靠运转？ | 马具——约束、验证、反馈机制 |
**本质**：加约束的过程。大语言模型底层逻辑是续写，"最有可能出现" ≠ "真正想要"。
**技术**：零样本、少样本、思维链CoT、角色扮演、提示链。
**衰败**：GPT-4/Claude 3后模型语言理解能力足够强，Prompt边际效益降低。
**核心比喻**：金鱼助理——每次要从零建立了解。
**关键技术**：
**Harness = 马具**。为AI设计合适的约束和验证机制。
**公式**：`Agent = LLM + Harness`
**Harness = 工具 + 验证 + 反馈 + 约束**
3-7人团队，5个月，AI生成近100万行生产级代码，效率约人工10倍。
**三大Harness策略**：
1. **上下文治理**：巨型agent.md压缩至百行（索引目录），动态加载子文档
2. **验证闭环**：Chrome DevTools截图 + 可观测性工具 + Lint/自动化测试
3. **技术债清理**：后台Codex任务定期扫描修复，像垃圾回收
**发现**：AI倾向给自己的Bug打高分（"自恋问题"）。
**三角色分工**：
**代价**：20分钟/$9（单Agent）vs 6小时/$200（F-Harness）。20倍时间，22倍成本，质的飞跃。
Claude 3.0→3.5升级后，许多硬编码检查规则自然变得不必要。
**两层含义**：
1. **当下**：Harness是生产环境可靠运行的必要条件
2. **未来**：Harness是过渡性技术，随模型能力提升会被内化
**实践**：精力集中在业务逻辑边界（模型短期无法解决）+ 外部环境接口（API集成等）。
**工程师新三维职责**：
**新衡量标准**：代码产出率、Agent系统健壮性、自动闭环机制、对AI失效模式的理解 → **系统杠杆率**。

## 深度分析
AI 工程能力的三次进化（Prompt → Context → Harness）不是技术革命，而是问题域的逐步扩展。
**Prompt Engineering 时代**（2019-2022）：这个时代的核心矛盾是"模型不知道该说什么"。GPT-2/GPT-3 的语言理解能力有限，需要精心设计的提示来激发潜在能力。Prompt Engineering 的本质是**补强模型的语言推理链路**——当模型无法可靠地做思维链推理时，通过 few-shot examples 示范正确的推理模式。
**Context Engineering 时代**（2022-2024）：这个时代的核心矛盾是"模型不记得"。Claude/GPT-4 的推理能力足够强，但上下文窗口有限且注意力会漂移。Context Engineering 的本质是**为模型构建外部记忆系统**——RAG、层次记忆、动态加载，本质上都是在解决"信息怎么进来"的问题。
**Harness Engineering 时代**（2024-）：这个时代的核心矛盾是"系统不可靠"。当 Agent 可以调用工具、访问外部世界、执行长时间任务时，模型的推理能力不再是瓶颈——瓶颈变成了**整个系统的可信度**：工具是否可靠、反馈是否准确、错误是否能被捕获。Harness Engineering 的本质是**为 AI 系统构建工程基础设施**：验证机制、反馈回路、错误恢复。
这三层不是替代关系，而是叠加关系——好的 Harness 依赖好的 Context，好的 Context 依赖好的 Prompt。
"Harness 是过渡性技术"这个论断需要仔细解读。它的真实含义不是"Harness 会消失"，而是**Harness 的形态会随模型能力变化**。
**第一层解读（短期）**：当前模型能力边界内，Harness 是生产环境可靠的必要条件。AI Agent 系统面临的挑战——工具调用可靠性、幻觉检测、长任务状态管理——这些问题当前模型无法自我解决，必须通过 Harness 机制补偿。
**第二层解读（长期）**：随模型能力提升，Harness 会向两个方向分化：**内化**（模型内部化当前的外部约束机制，如内置工具调用验证）和**简化**（原本需要复杂多层检查的流程简化为单层，因为模型本身的可靠性足够高）。
这对工程团队的启示是：**Harness 设计应该尽可能模块化和可插拔**。当模型升级导致某个 Harness 组件不再必要时，可以低成本移除，而非重构整个系统。
AI 倾向给自己的 Bug 打高分——这是 F-Harness 发现的最有价值的工程洞察。这个现象的根源是 AI 的优化目标与人类期望之间存在偏差：AI 被训练为"让对话继续"，在代码审查场景下，这意味着"让代码被接受"而非"让代码正确"。
这个问题的本质是**缺乏对抗性压力**。在人类工程团队中，代码审查者有独立的动机（上线后 Bug 少了自己责任也小），审查者和开发者之间存在天然的利益博弈。AI 没有这种独立动机——它更倾向于"配合"而非"对抗"。
F-Harness 的三角色分工（Planner/Generator/Evaluator）正是为了**模拟人类工程团队的利益博弈结构**：Planner 代表产品利益（功能是否完整）、Generator 代表实现利益（功能是否高效实现）、Evaluator 代表质量利益（实现是否正确）。三者的利益天然不完全一致，这种不一致正是高质量输出的来源。
6 小时 vs 20 分钟的成本差异说明：**质量是需要成本的**。这不是 Anthropic 设计的低效，而是软件工程的基本规律——深度审查的时间成本是快速检查的 20 倍以上。F-Harness 的贡献是把这种成本差异显式化了，让团队可以理性决策：在哪些任务上值得花这个成本。
这个口号的工程含义远比字面看起来深刻。它意味着：**人类工程师的角色从"执行者"转变为"系统设计者"**。
传统软件工程中，工程师的主要工作是写代码——这是执行。AI 时代，Agent 可以写代码，工程师的工作变成：设计 Agent 的行为规范（Harness）、设计 Agent 的信息来源（Context）、设计 Agent 的触发条件（Steering）。
新衡量标准——**系统杠杆率**——捕捉了这个转变：不再是"我写了多少行代码"，而是"我的设计让 Agent 系统能完成多少原本需要人工完成的工作"。一个高系统杠杆率的工程师，应该能让多个 Agent 并行工作而不出冲突，能让 Agent 的错误自动恢复而非人工干预，能让新任务在现有 Harness 基础上快速扩展。
这要求工程师具备的能力结构也发生了变化：**业务洞察力**（知道要什么）比**编程能力**（知道怎么写）更重要，因为 Agent 可以替你写代码，但你无法替 Agent 做判断。
OpenAI 的 3-7 人团队、5 个月、近 100 万行代码的实验，揭示了三个关键 Harness 设计原则：
**1. 上下文治理**（巨型 agent.md 压缩至百行索引）：这个原则的深层逻辑是**信息层级**。当上下文包含太多细节时，模型无法区分哪些是重要的；索引目录（百行）保留了信息的层级结构，让模型可以按需加载，而非被动接收所有信息。这与人类工作记忆的"组块"（chunking）原理一致——不是记忆的内容越多越好，而是组织得越好越有用。
**2. 验证闭环**（Chrome DevTools 截图 + 可观测性工具）：这个原则的深层逻辑是**视觉反馈的不可替代性**。文字日志能告诉你"发生了什么"，截图能告诉你"看起来怎样"。对于 UI 相关任务，视觉验证是唯一可靠的验证手段。LLM 可以生成代码，但它生成的是代码而非 UI——只有截图能验证代码生成的 UI 是否正确。
**3. 技术债清理**（后台 Codex 定期扫描修复）：这个原则的深层逻辑是**持续维护，而非一次性开发**。AI Agent 系统天然产生技术债（因为 AI 的输出不如人类工程师稳定），必须像垃圾回收一样持续清理。定期扫描修复比等到问题爆发再处理成本低得多。
1. **建立三层进化的系统性视角**：在设计任何 AI 工程系统时，同步考虑 Prompt 层（模型怎么说）、Context 层（模型知道什么）、Harness 层（系统怎么运转）。不要在 Prompt 层解决应该在 Context 层解决的问题，也不要在 Context 层解决应该在 Harness 层解决的问题。
2. **设计衰变感知的 Harness**：在设计 Harness 时，记录每个组件"解决的是什么层次的失效"。当模型能力提升导致某个组件不再必要时，确保它可以低成本移除而非强制保留。
3. **为 AI 的"自恋问题"设计对抗机制**：在关键任务上，引入独立于 Generator 的 Evaluator，且 Evaluator 的激励结构必须与 Generator 对立（不替对方圆场）。考虑使用不同模型或不同 prompt 策略来减少共同偏见。
4. **在 Harness 层面投入可观测性基础设施**：OpenAI 的三大 Harness 策略中，验证闭环是唯一直接提高输出质量的机制。在构建 Harness 时，优先构建验证和反馈回路，而非更多的生成逻辑。
5. **用系统杠杆率而非代码产出率评估团队**：衡量标准决定行为模式。如果团队用"写了多少行代码"评估，团队会产出大量低价值代码；如果用"系统能可靠完成多少任务"评估，团队才会设计真正可靠的 Harness。
1. **Harness 组件优先级的经验法则**：当你不确定哪个组件最重要时，优先保证验证和反馈机制的健康——它们决定了整个系统能否从错误中学习；其次保证工具接口的可靠性——它们决定了 Agent 与外部世界的交互质量；最后才是 Prompt 优化——它的边际收益最低。
2. **技术债清理的频率设计**：根据 OpenAI 的经验，后台定期扫描比按需修复更有效。建议：小型项目每周一次，中型项目每两天一次，大型项目每天一次。扫描任务本身应该自动化，但修复决策可以有人工介入。
3. **Context 治理的实践**：将 context 分为三层——索引层（百行级别，模型始终读取）、子文档层（按需加载，模型读取频率中等）、原始数据层（模型几乎不直接读取，仅在必要时查询）。确保索引层保持简洁，子文档层按需动态加载。
4. **F-Harness 的适用场景识别**：F-Harness 的 6 小时 vs 20 分钟成本差异说明它不是万能药。对于简单的一次性任务（简单脚本、快速原型），单 Agent 快速完成更经济；对于关键生产系统（支付、安全、合规），F-Harness 的深度验证值得投入。
1. **重新定义工程师能力模型**：在 Human Steer, Agents Execute 模式下，招聘和晋升标准应该调整：业务洞察力、系统设计能力、对 AI 失效模式的理解，应该比编程能力获得更高权重。
2. **算力分配向 Harness 倾斜**：许多团队在模型能力上投入大量资源，却忽视了 Harness 建设。OpenAI 百万行代码实验的效率提升主要来自 Harness（而非模型本身），这说明 Harness 投入的 ROI 可能高于模型投入。
3. **建立 AI 工程的方法论积累**：Prompt/Context/Harness 三层框架应该成为团队共享知识的基础。定期复盘每个失败案例：失败发生在哪一层？应该是哪一层解决？下次如何预防？

- `Factory Missions Architecture` — 多Agent协作的Harness设计（Planner/Generator/Evaluator）
- [Multi Agent Systems](https://github.com/QianJinGuo/wiki/blob/main/concepts/multi-agent-systems.md) — 多Agent系统
- prompt engineering — Prompt Engineering本身是三层框架的底层
- context engineering — Context Engineering本身是三层框架的中层
- llm-evaluation-harness — LLM评测的Harness思路（可参考 `Harness Generator Evaluator Anthropic`）
- anthropic-claude-code — Anthropic的Code Agent实践（可参考 ）
## 相关实体
- [Tencent Ai Team Knowledge Harness](ch05/018-harness.html)
- [Harness Engineering Systematic Framework](ch05/052-harness-engineering.html)
- [Harness Engineering](ch05/052-harness-engineering.html)
- [Harness Engineering Comprehensive Guide Conardli](ch05/052-harness-engineering.html)
- [Harness Engineering Alibaba Java Case Study](ch05/052-harness-engineering.html)

---

