# Anthropic 实战分享：如何让 AI Agent 持续工作几天？

## Ch01.488 Anthropic 实战分享：如何让 AI Agent 持续工作几天？

> 📊 Level ⭐⭐ | 7.4KB | `entities/anthropic-long-running-agent-architecture-6h-retroforge.md`

# Anthropic 实战分享：如何让 AI Agent 持续工作几天？

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/anthropic-long-running-agent-architecture-6h-retroforge.md)

## 摘要

Anthropic 工程师 Ash Prabaker 与 Andrew Wilson 在 RetroForge 大会上分享了长时运行 Agent 的架构设计。核心挑战在于：一年前 Claude 每次任务只能运行约 20 分钟，而现在 Claude Code 能有效运行数天。在极简架构下，Agent 自主完成任务的连续运行时间从 1 小时（Opus 3.7）提升到 12 小时（Opus 4.6），提升 **10 倍以上**。演讲归纳了三大失败根因（上下文焦虑、规划缺陷、自我评判），提出了 Agent SDK 结构化管理方案和 GAN 风格的对抗式架构，并通过 RetroForge 6 小时案例验证了方案有效性。

## 核心要点

### 三大失败根因

Andrew 将 Agent 长时运行失败归纳为三个工程问题：

1. **上下文焦虑（Context Anxiety）**：大语言模型拥有有限的注意力。随着会话推进，依赖关系层层叠加，逻辑连贯性逐渐下降。当 Token 消耗接近上限时，模型会表现出「上下文焦虑」——为了强行结束对话，开始草率收尾并故意忽略技术细节。

2. **规划缺陷（Planning Failure）**：基础模型面对长周期任务时，很难自发进行多步规划。它们要么尝试一次性写完所有代码，要么在执行中途突然停滞，留下无法运行的半成品。

3. **自我评判失灵（Self-judgment Failure）**：模型不擅长评判自己的工作。在软件开发中，它往往觉得自己写出的东西看起来挺美，就直接汇报「任务已完成」，哪怕背后的逻辑根本没通。

### Agent SDK：结构化管理

Anthropic 开发的 Agent SDK 核心思想是：**不要让模型在单一对话中裸奔，而是给它搭建一套结构化的管理系统**。

关键组件包括：

- **渐进式披露（Progressive Disclosure）**：系统最初只加载技能定义，只有在真正需要时才加载完整说明，有效减缓上下文窗口的拥挤速度，节省 Token
- **程序化工具调用**：Agent 即时编写脚本来批量处理数据，不需要把海量原始信息全部塞进对话背景
- **文件系统 > 模型记忆**：对于长程智能体，本地磁盘上的 JSON 或 Markdown 文件记录进度比依赖上下文更可靠

这套设计与 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 的理念一致——通过外部结构化约束弥补模型内在局限。

### 对抗式架构（Adversarial Architecture）

参考 GAN 的思路，在 Agent 内部建立对抗压力，将任务分配给三个相互独立的人格：

- **宏观规划者（Macro Planner）**：负责任务分解和阶段性冲刺规划
- **代码生成器（Code Generator）**：执行自动化代码构建
- **视觉评论家（Visual Critic）**：使用 Playwright 等工具实际启动应用，像真人一样点击按钮、查看截图，对照参考网站进行对比

**核心设计突破**：

- **突破谄媚效应**：调教一个严厉的批评者要比调教一个完美的创作者容易得多
- **合同谈判机制（Contract Negotiation）**：生成器和评估器在磁盘上反复协商，确定什么才叫"功能完成"。评估器认为有漏洞就直接拒绝签署合同。只有双方达成书面一致后，构建才会真正开始

这种模式与 [Anthropic 多智能体研究系统](ch04/462-anthropic-multi-agent-research-system.md) 中的验证者-执行者分离思路一脉相承。

### 审美量化

只要强迫自己把准则写下来，AI 就能执行。评估器拿着涵盖设计、原创性、工艺和功能性的严格评分表，不仅看代码，还会调用 Playwright 实际启动应用进行 UI 验证。如果生成器写出的界面不好看，评估器会强制它推倒重来。

## 深度分析

### RetroForge 案例对比

相同提示词（构建复古游戏制作工具）的两次运行对比：

| 维度 | 普通循环 | 对抗架构（6 小时） |
|------|---------|-------------------|
| 界面 | 拥挤，颜色选择器全是黑色块 | 完整应用，54 色复古调色板 |
| 功能 | 方向键无反应 | 完整物理引擎 + 嵌套 AI 关卡助手 |
| 质量 | 代码看起来写完了但完全无法运行 | 评估器捕捉到路由顺序错误和逻辑漏洞 |

这个案例验证了对抗式架构在长时运行场景下的显著优势。评估器发现了标准流水线无法发现的错误，证明了**外部验证闭环**对 Agent 可靠性的关键作用。

### 架构设计启示

Anthropic 的方案本质上是在 Agent 系统中引入了三个工程原则：

1. **关注点分离**：规划、生成、评估由不同角色承担，避免单一 Agent 的认知过载
2. **外部状态持久化**：用文件系统替代上下文窗口存储中间状态，突破 Token 限制
3. **对抗性验证**：通过制度化的批评机制防止自我欺骗，类似于传统软件工程中的代码审查

这与 [Claude Code 大型代码库团队部署](ch03/073-claude-code.md) 中讨论的 Harness 工程实践高度互补。

## 实践启示

1. **自我评估是一个陷阱**：永远不要让同一个 Agent 会话审查自己的代码。必须实现隔离的、拥有对抗压力的评估循环
2. **压缩不代表连贯**：完全依赖文本摘要来压缩上下文，会随时间推移引入逻辑漂移。对于核心状态，应当使用文件系统进行持久化存储
3. **使用结构化的交接**：利用本地磁盘存储配置细节和任务合同，让智能体在开启新会话时迅速找回状态
4. **固化主观标准**：对产品有特定的审美要求时，必须强迫自己写下细致的评分准则。清晰的评估指标能将主观品味转化为具体的可执行操作
5. **审计原始的执行记录**：构建高性能架构没有捷径。必须像调试传统程序一样，手动研究智能体的执行日志，发现智能体的技术判断在什么时候开始背离人类的真实意图

## 相关实体

- [Anthropic Multi Agent Research System](ch04/462-anthropic-multi-agent-research-system.md)
- [Claude Code Large Codebase Team Deployment Agent Harness](ch03/073-claude-code.md)
- [Hidden Technical Debt Agent Harness](ch04/503-agent.md)
- [Long Running Agent Ralph Loop Harness Takeover](ch04/503-agent.md)
- [Harness Engineering 核心模式](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/mlops-training-inference.md)

---

