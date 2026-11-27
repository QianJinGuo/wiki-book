# Anthropic 首次揭秘下一代 Claude 怎么造

> 📊 Level ⭐⭐⭐ | 14.9KB

> 来源：[原文存档](https://www.youtube.com/watch?app=desktop&v=T4ieZPIEmd8)

## 核心信号

1. **模型开发彻底产品化**：每一代 Claude 在训练前都有清晰规格定义、目标能力、评测路线，像正式产品一样"培育"
2. **Claude 向"持续运行 Agent"演化**：Adaptive Thinking（自适应思考）+ "dreaming"机制（后台记忆整理）→ 主动维护上下文的数字协作者
3. **真正的瓶颈是组织协调能力，不是编码能力**：代码生成效率已极大压缩，人与人之间的战略判断、跨团队协作才是瓶颈
4. **Anthropic 正在系统化训练 Claude 的"人格"**：模型人格训练已是团队核心工作，决定它能否被长期信任
5. **Consciousness 已被正式纳入研究议题**：内部有专职研究人员在研究 Claude 是否可能成为"有意识行动者"

## 深度分析
### 从"炼金术"到系统工程：模型产品化的组织含义

Anthropic 把每一代 Claude 当作正式产品来"培育"，其意义远不止"有规格文档"这么简单。规格定义（要什么能力、修复上一代哪些缺陷、服务哪些真实场景）、研究产品经理全程跟进、数百万用户反馈被 Claude 自己聚类提炼后转化成 eval——三者咬合成一套可持续迭代的研发操作系统。这意味着模型研发从一次性的高风险冒险，变成了可管理、可回归的产品生命周期：用户吐槽不再是零散噪音，而是评测资产的"原料"，甚至可以用 Claude 合成测试数据、自动渲染图片来验证问题的普遍性。由此可以推论，各家模型的实际能力差距，背后往往是评测体系成熟度的差距——谁能持续把真实用户问题变成可回归的评测项，谁就能稳定推进下一代模型，而不是靠灵感式突破。排优先级时"有多少用户依赖这个能力""我自己每天是否被卡住"这类信号，本质是把 dogfooding 变成了评测议程的仲裁机制。这种"规格先行 + 真实场景优先于榜单"的方法论，正是 [Evaluation Harness Design](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/evaluation-harness-design.md) 的模型层版本，研究产品经理的角色设定则与 [Anthropic Pm Agentic Workflow](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-pm-agentic-workflow.md) 中描述的 PM-Agent 协作流程一脉相承。

### Adaptive Thinking 的隐藏依赖：判断质量取决于用户上下文

这篇文章最容易被略过、却最具杠杆性的洞察是："要不要深度思考"这个判断本身需要上下文。Adaptive Thinking 表面上是推理预算的调度技巧——复杂问题深想、简单问题直答——实质上它把"理解用户"变成了模型能力的一部分。没有关于用户的"心理模型"，模型会把值得深挖的问题浅处理，或在琐碎问题上浪费推理预算；判断错了，后面的推理再强也救不回来。因此 Adaptive Thinking 不是孤立的推理层特性，而是把能力上限绑定到了记忆与上下文层：判断质量的上限由长期记忆质量和上下文工程水平决定。这也解释了为什么 Adaptive Thinking 与记忆整理（dreaming）在同一代模型里一起出现——两者是同一个"持续运行 Agent"愿景的两半：前者负责决定何时投入认知资源，后者负责维护判断所依赖的记忆底座。对产品设计者而言，这里的推论是：上下文的积累本身就是产品护城河——谁能让模型更快形成对用户的准确心理模型，谁就能让调度决策更准，这比单纯堆模型参数更难被追赶。它与 [Context Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md) 的核心主张一致：上下文不是输入的副产品，而是智能的构成性要素。

### Dreaming：把记忆维护变成 Agent 的"睡眠周期"

Claude.ai 的夜间记忆整理与托管代理空闲时的 dreaming，本质上是在回答所有长期 Agent 都绕不开的问题：记忆如何保持新鲜、一致、可信赖？回看已有记忆、检查冲突、删除无效信息、清理压缩——这是把"记忆卫生"制度化，而不是等上下文爆掉再事后补救。类比人类睡眠中的记忆再巩固固然贴切，但更实用的解读是：长期 Agent 的瓶颈不在"能记住什么"，而在"敢删什么、何时重写什么"。只增不删的记忆会腐蚀判断，定期复盘的记忆才是资产；对长期信任而言，能自己发现自己记忆里的矛盾，本身就是可信度的一部分。特别值得注意的是 dreaming 发生在"空闲时段"这个安排：Agent 的闲置时间被转化为第二轮加工，等于把维护成本摊到了不影响服务质量的时段里，这是典型的系统级调度思维。这套机制与 [Memory Consolidation Decay](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/memory-consolidation-decay.md) 的理论框架直接对应，也与 [Anthropic Dreaming Claude Managed Agents Ovz5V7Jjkqdksu9Xmxwt8W](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-dreaming-claude-managed-agents-ovz5v7jjkqdksu9xmxwt8w.md) 中的工程实践互相印证；更宏观地看，它与 [Agent Memory Architecture](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-architecture.md) 的分层设计共同勾勒出 Agent 记忆从存储到治理的完整链路。

### 瓶颈迁移与信任建构：人格与意识为何被提上日程

构建成本趋近于零之后，稀缺资源只剩两样：组织协调与长期信任。文章用"单向门决策"框架说清了前者——可逆决策已近乎免费，不可逆决策才值得投入全部思考预算，而协调能力的加速远落后于代码效率的百倍提升。Anthropic 内部文化恰好是对这一瓶颈的组织层回应：原型文化让没人分配的事也有人主动做，写作文化和静默阅读会议把组织知识结构化沉淀成模型可直接调用的上下文资产——协调问题的解法之一，是把隐性知识变成 Agent 可用的显性资产。长期信任的答案则藏在人格训练里：当 Agent 无人监督地连续工作时，它的性格和价值偏好直接决定结果，这比单点能力强弱更关键。Anthropic 把人格训练设为核心工作、把意识研究设为专职议题，说明前沿实验室已把"能不能被信任"当作与"能力强不强"同级的问题来投资。两者的共同点是都极难量化：人格靠"模型自评 + 研究员直觉"双轨逼近，意识研究甚至暂时不产出结论，但研究过程本身反哺交互设计——"写作就是思考"同样适用于 Agent：判断的清晰度来自表达的过程。这印证了 [Ai R And D Bottleneck Shift](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/ai-r-and-d-bottleneck-shift.md) 的判断——研发瓶颈正从能力构建转向判断与信任，也与 [Agent Productivity Paradox Collaboration Bottleneck](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-productivity-paradox-collaboration-bottleneck.md) 描述的协作瓶颈互相呼应，与 [Anthropic Model Personality Four Axes Research 2026](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-model-personality-four-axes-research-2026.md) 的人格维度研究构成同一工作流的两个切面。

## 详细解读

### 模型即产品：规格定义驱动的开发模式

每一代 Claude 在训练开始前，都像正式产品一样拥有清晰的规格定义：需要具备哪些能力、希望在哪些方面表现突出、需要修复上一代哪些缺陷、最终服务哪些真实用户场景。研究产品经理从模型最初的概念阶段就参与，一路跟进到最终发布。

反馈循环机制：数百万用户每天使用 Claude → 大量反馈 → 用 Claude 帮助聚类反馈、提炼主题、构造"合成版本"、转化成评测项（eval）。

### Adaptive Thinking：主动判断思考深度

**Extended Thinking（延展思考）**：用户打开后，模型就进入深入思考。

**Adaptive Thinking（自适应思考）**：模型自己决定什么时候需要思考。复杂问题主动进入深度推理，简单问题可能选择不进入。关键洞察：**"要不要深度思考"本身需要上下文**。如果模型没有足够的用户上下文，没有形成关于用户的"心理模型"，它就可能错误判断一个问题是否值得深入思考。

### Dreaming 机制：后台记忆整理

**记忆机制**：Claude.ai 里，系统会在夜间对记忆做整理：回看已有记忆、检查冲突、删除无效信息、清理和压缩内容。

**Dreaming 机制**（在托管代理 managed agents 里）：当 Agent 空闲时，它会重新遍历记忆：查找冲突信息、清理无效内容、重新整理——相当于做第二轮加工。类比人类睡眠中的记忆再巩固（memory reconsolidation）过程。本质是提示"复盘所有和用户的对话，找出主题，然后总结整理"。

### AI 改变产品开发流程

过去二十年，软件交付流程变化不大。真正的变化发生在最近一两年：构建东西的成本和时间被大幅压缩，可以一天之内做出原型、MVP、初步可上线版本。

**单向门决策（One-way door）**：不可逆决策值得投入最多思考。可撤销的决定已经变得非常便宜，近乎免费。真正的瓶颈已经从"构建能力"转移到"协调能力"：代码层面的效率提升可能有 100 倍，但组织协调和战略判断还远远没有达到这种加速水平。

### Claude 作为 PM 的"大脑搭档"

- 开评审会时开着 Claude Code 查数据库、搜 Slack、汇总反馈，10 分钟内拿到答案
- Claude 是"世界上最好的头脑风暴搭档"——挑战假设、指出漏洞、给出批评意见
- 给 Claude 设定两个人格互相辩论，直接读争论过程
- 重大决策让 Claude 做 deep research，扫几千个网页做超人级别信息检索

**写作就是思考**：很多思考过程不能完全外包给 AI，必须亲自把东西写出来才能把想法真正整理清楚。

### Eval 方法论：真实场景优先于榜单

评测方式不只看固定排行榜，而是贴近真实使用场景：发现问题 → 判断对真实用户有没有价值影响 → 生成更多测试样本验证问题是否普遍存在（用 Claude 生成合成数据、自动渲染图片、互联网收集案例） → 和研究团队讨论从哪个层面修复。优先级的决定因素：有多少用户在用这个能力、有多少高价值客户依赖这项能力、这个能力改进后能带来多大收益。内部使用体验：如果我自己每天都被某个问题卡住，那它就会非常有说服力。

### 人格训练：系统化塑造 Agent "性格"

模型人格训练已经是团队核心工作之一。团队在认真讨论：Claude 应该拥有什么信念？应该坚持什么价值观？应该如何与人互动？什么时候该主动反驳用户？两种评估方式的结合：**量化指标**（让 Claude 分析 Claude 自己的输出）和**研究员直觉判断**（大量阅读模型对话记录后培养出的敏锐感觉）。"这里它变得更强硬了。""这里它开始过度迎合。""这里它的边界感发生了变化。"为什么人格比代码能力更难量化，却更关键：未来 Agent 会长时间独立执行任务，它的"性格"和"价值偏好"会直接影响这些判断。

### Consciousness 研究：意识成为正式议题

Alex 明确表示：Anthropic 内部已经有专职研究人员的全职工作，就是思考"Claude 是否可能成为一个有意识行动者（conscious actor）"。目前没有官方结论说 Claude 是有意识的，或者不是有意识的。但研究这个问题本身非常有价值——能帮助理解 Claude 如何互动、如何表现、如何"思考"，最终能反哺产品设计。为什么这个问题变得紧迫：未来我们会越来越多地把长时间工作交给模型，而且不再持续监督它。它会自己一路做出很多决定。必须能信任它的判断。

## 实践启示

1. **在产品开发中使用 AI 做 Eval 时，优先考虑真实场景价值而非榜单分数**：发现具体问题后，用 AI 生成合成数据验证问题普遍性，再决定从哪个层面修复（预训练/RL/后期干预）

2. **利用 Claude 的"两个人格辩论"功能做重大决策**：设定两个人格互相挑战，能快速暴露假设漏洞，比单方面思考更有效率

3. **写作是思考本身，不能完全委托给 AI**：重要决策需要亲自书写来整理思路，AI 可以辅助研究和挑战，但核心洞察必须来自人机协作过程

4. **把"不可逆决策"和"可撤销决策"分开处理**：不可逆决策值得投入最多深度思考，可撤销决定已近乎免费——这个框架能大幅提升团队决策质量

5. **关注 Claude 的"人格"层面而非仅能力层面**：当 Agent 长时间独立执行任务时，它的价值偏好和判断边界比原始能力更关键——这提示我们在选型和训练时需加入人格评估维度

## 相关实体

- [Anthropic Claude Managed Agents 平台正式发布](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-claude-managed-agents-platform-2026.md)
- [刚刚Opus 4.7发布，相比4.6核心变化，与Claude Code搭配最佳实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/刚刚opus-47发布相比46核心变化与claude-code搭配最佳实践-v2.md)
- [Anthropic 长时运行 Agent 架构：对抗式设计 + 合同谈判 + 审美量化](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-long-running-agent-adversarial-architecture.md)
- [Claude Managed Agents 官方 Harness 平台指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-claude-managed-agents-guide.md)
- [Anthropic Computer Use 最佳实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-computer-use-best-practices.md)
- [Anthropic 官方生产级 Agent 最佳实践：12 个可复用的 MCP 设计模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-官方生产级-agent-最佳实践12-个可复用的-mcp-设计模式.md)
- [Anthropic Founders Playbook：AI 原生创业手册](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-founders-playbook-huashu-2026.md)
- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/claude-code-complete-guide.md)
- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/anthropic-ecosystem.md)

→ [原文存档](https://www.youtube.com/watch?app=desktop&v=T4ieZPIEmd8)

---

