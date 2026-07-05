# Devin Fusion: 多模型路由 Harness 实现 35% 成本降低

## Ch05.053 Devin Fusion: 多模型路由 Harness 实现 35% 成本降低

> 📊 Level ⭐⭐ | 8.6KB | `entities/devin-fusion-multi-model-harness-cognition.md`

# Devin Fusion: 多模型路由 Harness 实现 35% 成本降低

> Cognition 推出的 Devin Fusion 是一种新型多模型路由 harness，在 FrontierCode 基准上以 35% 更低成本维持 Fable 5 级性能，核心思路是在不牺牲智能的前提下跨前沿模型智能路由。

## 摘要

工程团队在模型成本上"烧钱"已成常态——对所有任务使用最贵模型不可持续，但现有模型混合工具在基准上表现好看，实际编码中却无法产出可合并的代码。Cognition 的 Devin Fusion 通过智能路由解决了这一矛盾：在 FrontierCode Extended 基准上，Fusion + Fable 5 得分 57.6（Fable 5 单独 57.0），但成本从 $5.12 降至 $3.00（降低 35%）。

## 核心方法

### Sidekick 架构：双 Agent 并行

Devin Fusion 的核心创新是 Sidekick 架构——同时运行两个并行 Agent：

- **主 Agent（Main Agent）**：使用前沿模型（如 Fable 5、Opus 4.8），负责重大决策：规划、歧义解释、最终审查
- **副手 Agent（Sidekick）**：使用更具成本效益的模型，拥有自己的工具集和缓存上下文，执行主 Agent 委派的任务

主 Agent 采取"最小行动"原则——默认情况下应委派和监控，只做必须亲自做的重大决策。

### Sidekick 解决三大问题

1. **保留真正的前沿智能而非"基准分数智能"**：路由系统常过度拟合特定基准。通过在前沿模型中保留一个主 Agent，Sidekick 方法持续受益于前沿模型的创造力和通用智能。

2. **超越单次提示任务和问答**：模型路由器通常为整个任务路由到单一模型。提示通常不包含足够信息来判断任务难度，且用户可能在简单初始提示后有困难的后续问题。Sidekick 的动态切换使系统更加鲁棒。

3. **避免模型间路由的缓存未命中成本**：之前探索的"Smart Friend"和 Anthropic 的"Advisor"工具，每次调用其他模型时上下文不共享缓存，代价高昂。Sidekick 设置中，主模型和副手模型各自维护持久缓存的上下文。

### 动态会话中路由（Dynamic Mid-Session Routing）

除了 Sidekick 架构，Devin Fusion 还在任务执行过程中使用轻量级分类器来判断何时需要切换模型：

- **上下文压缩时切换**：在触发上下文压缩时评估情况并切换模型，相当于"免费"获得模型切换
- **可升级副手模型**：甚至可以在不回到主模型的情况下"升级"副手模型，无额外缓存惩罚
- **任务类型感知**：根据任务类型和复杂度为不同 Agent 选择不同模型

## 深度分析

### 1. 模型路由的"智能保留"悖论

模型路由面临的核心悖论是：如果你足够聪明地知道何时使用便宜模型，那么你已经用了足够聪明的模型来做这个判断。Devin Fusion 的 Sidekick 架构巧妙地绕过了这个悖论——不是通过"判断任务难度"来路由，而是通过"并行运行两个模型并让智能模型决定委派什么"。这相当于用前沿模型的智能来做路由决策，同时让副手模型承担大部分执行工作。

这与 [Netflix Switchboard](https://github.com/QianJinGuo/wiki/blob/main/entities/netflix-switchboard-lightbulb-model-routing.md) 的模型路由思路不同：Switchboard 是在请求层面做模型选择，而 Fusion 是在 Agent 任务执行过程中动态路由。

### 2. Sidekick 随模型变强而更优的反直觉特性

一个反直觉的发现：Sidekick 模式在更智能的模型（Fable 5）上表现更好。Fusion + Fable 5 实现了 41% 的成本降低（对比纯 Fable 5），而 Opus 和 GPT-5.5 级别模型只有 35%。原因在于 Fable 5 更智能地委派工作、更高效地请求上下文、更精确地规划——所有这些都带来更大的成本改进，且对智能的影响最小。

这意味着 Sidekick 模式是一个**随基础模型进步而价值递增的架构模式**——它不是权宜之计，而是未来-proof 的设计。

### 3. 多模型 Harness 的兴起：单一模型时代的终结

Cognition 团队明确断言："对所有工作使用单一模型的时代正在结束。"原因有三：

- **前沿智能成本飙升**：最贵模型的 token 成本已达到令工程组织望而却步的水平
- **模型选项激增**：不同价格和智能水平的模型选择越来越多，许多次前沿模型在正确提示下完全能胜任大部分工程工作
- **模型间相对优势**：不同模型在 UI 测试、Bug 发现、特定语言等不同领域有各自优势

多模型 Harness 能够捕获各种前沿模型的相对优势——这是单一模型 Harness 无法做到的。

### 4. 缓存工程是模型路由的隐藏关键

Devin Fusion 的工程细节揭示了一个常被忽视的挑战：**缓存上下文管理**。大多数缓存输入只有 5 分钟过期时间。Sidekick 架构通过让主模型和副手模型各自维护持久缓存的上下文来解决这个问题——这意味着模型切换时不会触发昂贵的全上下文重新加载。

动态会话中路由的巧妙之处在于：将模型切换时机与上下文压缩时机对齐——上下文压缩无论如何都会触发缓存未命中，此时切换模型是"免费"的。

### 5. 从 Smart Friend 到 Sidekick 的架构演进

Cognition 的模型路由架构经历了三代演进：

1. **Smart Friend（工具调用模式）**：一个模型通过工具调用另一个模型获取建议——每次调用都触发缓存未命中
2. **Anthropic Advisor（类似模式）**：同样的工具调用模式，同样的缓存问题
3. **Sidekick（并行 Agent 模式）**：两个模型各自维护持久缓存上下文，主 Agent 决定委派而非"咨询"

这一演进展示了从"串行工具调用"到"并行 Agent 协作"的架构进步——不仅仅是缓存效率的提升，更是 Agent 协作模式的根本改变。

## 基准表现

| 配置 | 得分 | 平均成本/任务 |
|------|------|--------------|
| Fusion + Fable 5 | 57.6 | $3.00 |
| Fable 5 (medium) | 57.0 | $5.12 |
| Opus 4.8 (high) | 48.8 | $2.38 |

88% 的内部合并 PR 完全由自动化 Fusion 路由器驱动。

## 实践启示

1. **Sidekick 模式应成为编码 Agent 的默认架构**：与其试图构建一个"万能路由判断器"，不如让前沿模型做路由决策、让经济模型做执行工作。这种"智能委派"模式比"智能判断"模式更鲁棒、更可扩展。

2. **缓存感知的 Agent 架构设计**：在构建多模型 Agent 系统时，缓存上下文管理应作为一等设计约束，而非事后优化。将模型切换与上下文压缩对齐是一个可复用的工程模式。

3. **模型路由的成本优化杠杆**：与 [Token 成本优化五层模型](ch09/047-coding-agent.md) 中的"模型路由"层直接对应。Devin Fusion 证明，在不牺牲智能的前提下实现 35-41% 的成本降低是可行的——这比提示工程或缓存优化的效果更显著。

4. **多模型 Harness 是未来-proof 的投资**：随着模型种类增加和智能差距缩小，多模型路由的价值只会增长。建议编码 Agent 平台从第一天就设计多模型路由能力，而非事后添加。

5. **内部验证优于基准**：Cognition 的 88% 内部 PR 由 Fusion 驱动这一数据，比任何基准分数都更有说服力。模型路由策略需要在实际编码场景中验证，而非仅依赖标准基准。

## 相关实体

- [AI Coding Agent Token 成本控制五层模型](ch09/047-coding-agent.md)
- [Netflix Switchboard 模型路由](https://github.com/QianJinGuo/wiki/blob/main/entities/netflix-switchboard-lightbulb-model-routing.md)
- [Cursor Reward Hacking 编码基准](https://github.com/QianJinGuo/wiki/blob/main/entities/cursor-reward-hacking-coding-benchmarks.md)
- [Cursor Harness 模型生产](ch01/350-cursor-harness-model-production-floor.md)
- [Agent Harnesses 的演进](ch04/594-agent-harnesses-are-dead-long-live-agent-harnesses.md)
- [Harness Engineering 核心模式](ch03/075-claude-code.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/devin-fusion.md)

---

