# Karpathy × Boris 访谈：Software 3.0 时代编程完整地图

## Ch01.785 Karpathy × Boris 访谈：Software 3.0 时代编程完整地图

> 📊 Level ⭐⭐ | 5.4KB | `entities/karpathy-boris-software3-llm-era-programming-2026.md`

# Karpathy × Boris 访谈：Software 3.0 时代编程完整地图

- URL: https://mp.weixin.qq.com/s/e1vrUYcGE6RToVkl_HcXZQ
- Author: 微信编译版，原型为 Boris (Claude Code创始人) + Karpathy (前Tesla AI) YouTube访谈
- Length: 3674 chars (微信版)
- SHA256: b7f08a9221689ae53f18651567d97f1e5110931bc8978d41d50159b7513e3810

## 相关实体
- [Claude Code Harness Deep Understanding](ch01/484-claude-code-harness-deep-understanding.md)
- [Claude Code Search Architecture Tencent 2026](ch03/075-claude-code.md)
- [Ralph Loop 不够用长时间 Agent 还缺这 3 件事](ch03/045-agent.md)
- [Claude Code Harness Deep Dive Founder Park](ch03/075-claude-code.md)
- wetesteddeepseekv4proandflashagainstclau.md-against-claude

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/karpathy-boris-software3-llm-era-programming-2026.md)

## 深度分析

**Software 3.0 范式重新定义了编程的本质活动。** Karpathy 提出传统代码=Software 1.0，神经网络权重=Software 2.0，Prompting=Software 3.0——编程从"写代码"变为"向上下文窗口填充什么"。 这个框架的意义在于：它把 AI 编程工具的竞争从"代码生成速度"拉回到"上下文工程能力"的竞争。

**"模型是幽灵而非动物"——理解 AI 的非自主性是高效使用的前提。** Karpathy 的这个比喻精确捕捉了当前 LLM 的本质：模型没有内在动机，不因惩罚而更努力，因鼓励而更有斗志——它只是数据和奖励函数塑形的统计模拟电路。 这个认知直接指导使用策略：与其情感沟通，不如优化输入的上下文质量。

**锯齿状智能是当前 AI 最重要的产品特性，需要系统性应对。** 模型在高度可验证领域（代码、数学）几乎超越所有人类，但在其他领域可能表现愚蠢——这不是能力上限，而是能力分布的结构性特征。 这个特征意味着，任何 AI 产品的工程化都需要明确划定"AI 自主区"和"人类监督区"，而非盲目扩展 AI 权限。

**"外包思考，但不能外包理解"——人类在 AI 时代的不可替代角色是因果推理和约束判断。** Karpathy 举的具体例子（邮箱不是用户 ID 的设计决策） 揭示了一个关键原则：人类负责定义问题边界和约束条件，AI 负责在给定框架内的执行优化。这一原则适用于从产品设计到工程架构的一切决策层级。

**AI 编程工具的护城河正在从"模型能力"转向"工程系统成熟度"。** Boris 提到 Claude Code 是在为还不存在的模型提前建好 harness ，而 Karpathy 建议创业者去造 RL 环境而非追模型逃逸速度 。这表明，基础设施和工程闭环的竞争价值正在超过模型能力本身的竞争价值。

## 实践启示

**在产品开发流程中引入 AI 时，优先建立"AI 自主执行区"和"人类决策检查点"的分级授权机制。** Karpathy 的例子（邮箱≠用户ID的判断agent做不了） 表明：具体执行细节（PyTorch参数、Stripe代码）可以交出，但约束条件和业务规则必须由人定义。将这个原则系统化，形成可操作的 AI 权限矩阵。

**重新设计技术面试，用"红队攻击"代替算法题。** Karpathy 提出的新面试范式——让候选人构建完整系统，然后用10个AI实例攻击它  ——直接测试候选人在 AI 时代的工程能力：不仅能构建系统，还能理解系统弱点并防御 AI 攻击。对于招聘团队，这是一个从现在就可以开始实践的方向。

**对于 AI 产品团队：将 spec 设计能力作为核心竞争力来培养，而非写代码能力。** Boris 的角色变成调度，Karpathy 强调人负责 spec 和 plan 。未来的工程牛人不只是能写代码，而是能把模糊问题分解为精确的 AI 可执行规范。在团队中明确这个分工，并投资于 spec 能力的训练。

**关注 AI 编程工具链中的"RL 环境"创业机会。** Karpathy 明确建议"别追大模型的逃逸速度，去造你自己的RL环境" 。可验证性是决定哪些领域被 AI 率先攻破的关键变量，而垂直领域的 RL 环境 + 数据集构建是尚未被充分开发的杠杆点。

**对于软件架构决策：拥抱 vibe coding 进行原型探索，但对生产系统坚持人类所有权的原则。** Menu Gen 案例说明：AI 可以快速将创意转化为可运行原型 ，但生产系统的长期可维护性、错误恢复和业务逻辑清晰度仍需人类工程师负责。建立原型→生产的审查机制，明确哪些系统可以"裸奔"哪些必须有人类深度参与。

---

