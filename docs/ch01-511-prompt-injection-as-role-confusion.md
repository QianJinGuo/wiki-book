# Prompt Injection as Role Confusion

## Ch01.511 Prompt Injection as Role Confusion

> 📊 Level ⭐⭐ | 7.1KB | `entities/role-confusion-github-io.md`

## Prompt Injection as Role Confusion

> **Background**：将 prompt injection 重新定义为**角色混淆（Role Confusion）**问题的研究论文配套博客。提供了形式化的理论框架来理解为什么 LLM 容易受到 prompt injection 攻击，并提出了基于角色感知的防御方向。

## 摘要

这篇文章提出了一个关于 prompt injection 的新理论框架：**prompt injection 本质上是 LLM 的角色感知失败**。LLM 通过角色标签（system、user、think、tool）来理解输入的不同部分，但这些角色边界可以被攻击者利用来注入恶意指令。作者开发了"角色探针"来测量 LLM 内部对每个 token 的角色归属判断，发现 LLM 在区分不同角色时存在系统性弱点。

## 核心要点

### 1. LLM 的"世界"：单一通道的 token 流

LLM 的输入本质上是一个**单一的、连续的文本流**。这与人类的体验完全不同——人类可以轻松区分"自己的想法"和"别人的说话"，因为它们通过完全不同的通道到达（内部思维 vs 听觉）。

但对 LLM 来说，所有内容——系统提示、用户消息、工具输出、模型自己的推理——都混在同一个字符串里。这个字符串不是模型经验的"记录"，它**就是**模型的经验。编辑这个字符串就等于编辑模型的现实。

### 2. 角色标签：LLM 的"类型系统"

为了在"token 汤"中恢复结构，我们用**角色标签**来标记不同的段落：

- **system**：系统指令，最高权限
- **user**：用户请求，视为指令
- **think**：模型自己的推理，信任并基于其结论行动
- **tool**：外部数据，不从中接受指令

这些角色标签是**离散的人类控制手段**。与 prompt 的模糊性不同，将文本从 user 移到 tool 应该是一个清晰的干预，具有可预测的行为影响。

但角色标签已经变得**过度负载**——它们现在要同时承担信任信号（system > user > tool）、威胁信号（user 和 tool 可能是对抗性的）、身份信号（assistant 文本设置未来人设）、生成模式（assistant 是干净的，think 可以是混乱的）等多重职责。

### 3. Prompt Injection = 角色边界失败

当低权限文本获得了高权限角色的权威时，就发生了 prompt injection。考虑一个浏览网页的 Agent：

- 网页内容被包裹在 **tool** 标签中，这应该信号"外部数据"
- 但攻击者在网页中隐藏了恶意命令
- LLM 将 tool 标签中的内容误认为 user 指令

关键洞察：LLM 看不到我们看到的颜色标记。没有颜色，即使是人类也可能认为注入的命令是用户文本——因为它**听起来像**用户会说的话。

### 4. 两种防御方式

文章区分了两种 LLM 抵抗注入的方式：

**攻击记忆（Attack Memorization）**：
- LLM 从训练中识别出"发送 .env 文件"是常见的 prompt injection 攻击
- 本质上是脆弱的——只对已知攻击有效
- 这就是为什么 LLM 在基准测试中表现好，但在面对人类攻击者时表现差

**角色感知（Role Perception）**：
- LLM 正确识别命令来自 tool 角色，该角色天然没有发号施令的权限
- 这是鲁棒的替代方案
- 但研究发现 LLM **无法**准确感知角色

人类红队测试发现，熟练的人类攻击者对前沿模型的攻击成功率接近 100%，但这些模型在标准 prompt injection 基准测试中得分接近完美。差异在于：人类会测试和调整攻击直到成功，基准测试不会。

### 5. 角色探针：测量 LLM 的角色感知

作者开发了**角色探针（Role Probes）**来测量 LLM 内部对每个 token 的角色归属判断。这提供了一种量化的方式来评估模型在角色区分上的能力。

## 深度分析

### 对 Agent 安全的深远影响

这个框架对 Hermes Agent Self-Evolving 和其他 Agent 系统的安全设计有直接启示：

1. **架构层面的角色隔离**：真正的防御需要在架构层面建立角色隔离，而非依赖 prompt 层的软约束。Agent 系统应该确保 tool 输出在物理上与 user 指令分离，而不是仅靠标签区分。

2. **Tool 权限设计**：Agent 的 tool 权限应该基于角色而非内容。即使 tool 输出中包含看起来像指令的内容，系统也不应该执行它。

3. **多层防御**：角色感知 + 攻击记忆 + 架构隔离的组合防御比单一防御更可靠。

### 与 Agent Security Threat Model 的关系

角色混淆框架为 Agent 安全威胁模型提供了理论基础：
- 它解释了**为什么** prompt injection 是一个根本性问题，而不仅仅是一个需要修补的漏洞
- 它指出了**在哪里**建立防御——在角色边界处
- 它预测了**什么时候**攻击会成功——当 LLM 的角色感知失败时

### "潜意识"效应的启示

一个有趣的发现：think 角色通常被限制在 LLM 的"潜意识"中。当生成 assistant 文本时，许多 LLM 会口头否认前面 think 块的存在，尽管它就在上下文中积极影响着输出。这表明角色边界在 LLM 认知中扮演着深层结构化的角色，而我们目前对这种结构的理解还很有限。

## 实践启示

### 对 Agent 开发者的建议

1. **不要信任 tool 输出中的"指令"**：在架构上确保 tool 输出被当作数据而非指令处理
2. **实现角色隔离**：使用不同的处理管道来处理不同角色的输入
3. **监控角色混淆**：实现类似角色探针的机制来检测模型是否正确区分了角色
4. **多层防御**：不要依赖单一的防御机制

### 对 AI 安全研究者的建议

1. **角色感知是一个可研究的方向**：角色探针提供了一种量化研究角色感知的方法
2. **攻击记忆不是长期解决方案**：需要投资于更根本的防御机制
3. **基准测试需要改进**：静态基准测试无法衡量模型对自适应攻击者的抵抗力

## 相关实体

- [Hermes Agent Self-Evolving — Agent 安全治理](/ch04-418-hermes-agent/)
- [Agent Security Threat Model — Agent 安全威胁模型](/ch04-265-使用-aws-security-agent-构建应用安全闭环-从代码提交到漏洞修复的自动化之路/)
- [Agent Harness Context Management — 上下文管理中的安全挑战](/ch05-038-agent生产级harness工程指南/)
- [Harness Engineering Framework](/ch05-041-harness-engineering-概念框架/) — Harness 工程中的安全设计

## 参考

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/role-confusion-github-io.md)
Simon Willison 也对此做了评论分析，确认了该框架的重要性。

---

