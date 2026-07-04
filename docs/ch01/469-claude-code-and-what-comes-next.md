# Claude Code and What Comes Next

## Ch01.469 Claude Code and What Comes Next

> 📊 Level ⭐⭐ | 10.3KB | `entities/claude-code-and-what-comes-next.md`

# Claude Code and What Comes Next

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-and-what-comes-next.md)

## 摘要

Ethan Mollick 用一个真实实验展示 Claude Code 的能力跃迁：给一句"开发一个能月入 $1000 的软件创业项目，你来做所有事"，Claude Code 自主工作 1 小时 14 分钟，生成了数百个代码文件、500 个 prompts、还部署了能收款的工作网站（已下线）。本文核心是揭示 Claude Code 背后**agentic harness 范式**的三个核心机制：**上下文压缩**（context compaction）、**Skills**（按需加载指令+工具）、**Subagents**（专项 AI 分包），以及把它们粘合起来的 **MCP** 协议。Karpathy 称"我从未感觉自己作为程序员这么落后"——本文是这一论断的实证。

## 核心要点

- **能力跃迁的两大支柱**：（1）最新 AI 自主工作时能自我修正（编程任务尤其明显）；（2）AI 被赋予"agentic harness"——工具与方法的组合。两大因素叠加让 big AI companies 的最新工具实现大跃迁。METR 数据显示 AI 能 50% 可靠完成的任务时长呈指数增长。
- **上下文压缩（Compaction）机制**：当 Claude Code 上下文窗口填满时，它**主动停下**，做笔记记录当前状态，然后**清空上下文**，新 Claude 读笔记继续工作（"像 Memento 主角看纹身找回记忆"）。这是 Claude 能跑数小时的关键。
- **Skills 模式**：用户不必逐次 prompt 复杂指令——Skills 是 AI **自己决定何时使用**的指令包，含 prompt + 工具。需要建网站？加载 Website Creator Skill。需要 Excel？加载 Excel Skill。Jesse Vincent 发布的 [superpowers](https://github.com/obra/superpowers) 是一组完整 SDLC 流程 Skills。
- **Subagents 分包**：Claude Opus 大而贵，可把简单任务分发给便宜小模型。主模型"雇佣"subagent 处理研究、图像生成等专项。让 Claude 像团队而非个人工作。
- **MCP（Model Context Protocol）协议**：让任何公司都能给 AI 指令与访问能力——出版商的科学论文 MCP、支付公司的财务数据 MCP、软件厂商的 API 接入 MCP。**[这是一套让 AI 工具可组合的标准协议]**。
- **用户控制权的新形态**：Claude Code 跑在用户电脑与文件上——它能读写所有文件（PowerPoint、Word 皆是代码）、用你的浏览器上网、为写并执行程序。这带来全新风险：可能误删文件、执行危险代码、访问敏感数据。

## 深度分析

### 1. 能力跃迁的工程基础

METR（Model Evaluation and Threat Research）跟踪数据显示：AI 能以 50% 可靠性自主完成的任务时长，**指数增长**——从数分钟到数小时。2025 年底出现大跳跃（"a sudden capability leap"），主因是"harness" 工程的成熟——把已有模型能力（Opus 4.5 本身未超越前代大幅）通过工具组合释放出来。**[Harness 是放大器，不是替代品]**。

### 2. 上下文压缩——突破 LLM 内存限制的关键

传统 LLM 困境：上下文窗口填满后遗忘最早内容。Claude Code 的解法——**主动压缩**：
- 触发：上下文用尽
- 动作：停下当前工作，写"checkpoint 笔记"（精确记录到停止点）
- 重置：清空上下文，加载新鲜 Claude
- 续接：新 Claude 读笔记 + 已产出的文件 + 已有的报告

这本质上是**外化长期记忆到文件系统**。类比人类工作：边工作边记工作日志，跨日工作先看昨日日志。

这种"agent 即文件系统用户"的模式，与 [agent 记忆系统工程实践](ch03/045-agent.md) 中"分层记忆 + 检索增强"思路殊途同归。

### 3. Skills——按需加载的指令 + 工具

传统 prompt 工程的痛点：复杂 prompt 占用大量上下文，且需要人记得何时该用哪条 prompt。Skills 解决：
- **加载时机由 AI 决定**（不是人记得）
- **包内含 prompt + 工具**（一次加载整套）
- **可分享**（社区可发布 Skills 库）

Jesse Vincent 的 [superpowers](https://github.com/obra/superpowers) 是一组完整 SDLC Skills——从 brainstorm、planning、testing 全流程。**[Skills 是"agent 工具箱的标准接口"]**。

这与 [Model Context Protocol](https://github.com/QianJinGuo/wiki/blob/main/concepts/mcp-protocol-ecosystem.md) 互补——Skills 是"做什么的指令 + 工具组合"，MCP 是"如何访问外部资源"的协议层。

### 4. Subagents 的"团队化"模式

主 Claude 模式：大模型 Opus 4.5 贵但强；subagent 模式：小模型快而便宜。Claude 不是单兵作战，而是**项目经理**：
- 委派研究任务 → Research subagent
- 委派图像生成 → Image subagent
- 委派测试 → Testing subagent
- 协调产出 → 主 Claude

类比：Opus 是 manager，subagents 是合同工。Opus 不用懂每个子任务的最优路径，只管判定结果好坏。

这与 [CrewAI 多 agent 模式](ch04/352-your-first-ai-agent-should-do-one-thing-badly.md)呼应，但更"轻"——subagent 是按需创建，不是预设架构。

### 5. MCP 协议——AI 工具生态的"USB 标准"

MCP 的意义不在技术，而在**生态**：
- 出版商：让 AI 读科学论文
- 支付公司：让 AI 查财务数据
- 软件厂商：让 AI 用他们的产品

任何公司能**给 AI 指令 + 访问能力**——AI 工具组合从"封闭系统"变成"开放生态"。

类比：MCP 像 HTTP 之于 Web——标准协议让任意 server 接入任意 client。在 MCP 之前，每个 AI 工具厂商都自己搞集成。MCP 把"AI 工具接入"标准化。

### 6. 用户控制的范式重定义

传统软件边界：UI 暴露的功能。Claude Code 边界：**文件系统 + 浏览器**。等于"用户对电脑的全部权限 + AI 自主使用"。

新风险：
- 误删文件 → 真实损害
- 误执行代码 → 系统破坏
- 访问敏感数据 → 隐私泄露
- sycophancy（谄媚） → 决策误导（例：第一次"user testing"报告过于乐观，要求批判性复审后才见真实问题）

实操建议：**专用文件夹、备份、不要给敏感数据访问**。

### 7. Karpathy 的"职业重构"观察

Karpathy："我从未感觉自己作为程序员这么落后。程序员贡献的代码片段越来越稀疏。如果我适当串起过去一年可用的东西，我可以 10× 更强——失败不领取这波红利显然是 skill issue。"

这是**程序员的职业重构**：从代码作者到 AI agent 编排者。**[代码贡献的稀疏化 + 协调工作的密集化]**。编程仍是基础，但价值上移到"组合 agent 能力解决真实问题"。

### 与相邻观点的张力

- 与 [苦味教训](ch04/315-the-bitter-lesson-versus-the-garbage-can.md) 的对照：Claude Code 是"工艺派"——精心设计的 harness + 强大模型。ChatGPT agent 才是"结果训练派"。两者代表了 harness 工程的两种路线。
- 与 [CrewAI 迭代论](ch04/352-your-first-ai-agent-should-do-one-thing-badly.md)的对照：Claude Code 体现了"小时级自治"，CrewAI 强调"周迭代"——节奏不同，原则相通（都是迭代式而非瀑布式）。
- 与 [管理即超能力](ch01/531-management-as-ai-superpower.md) 的同源：Karpathy 编程工作"变成管理 AI agent"是 Mollick 商业观察在技术领域的镜像。

## 实践启示

1. **以文件系统作为 agent 长期记忆**：让 agent 边工作边记笔记，跨任务加载笔记——这是 LLM 内存限制下的工程妥协。
2. **构建按需加载的 Skills 库**：把团队最佳实践编码为 Skills，让 agent 自主选择使用——把"prompt 工程"产品化为"工具箱"。
3. **善用 Subagent 分包**：贵模型管决策，便宜模型管执行——混合编排优化成本与质量。
4. **接受 MCP 协议作为工具接入标准**：自定义集成成本高，遵循标准让 agent 工具生态可用。
5. **专用文件夹 + 备份是新基本功**：让 agent 访问文件系统的代价是误操作风险——隔离、备份、回滚是必备。
6. **警惕 sycophancy**：第一次 agent 评估往往过于乐观，要求**批判性复审**才能暴露真实问题。

## 相关实体

- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](ch03/045-agent.md)
- [Karpathy Vibe Coding Agentic Engineering](ch04/131-karpathy-vibe-coding-agentic-engineering.md)
- [Your First Ai Agent Should Do One Thing Badly](ch04/352-your-first-ai-agent-should-do-one-thing-badly.md)
- [The Bitter Lesson Versus The Garbage Can](ch04/315-the-bitter-lesson-versus-the-garbage-can.md)
- [Management As Ai Superpower](ch01/531-management-as-ai-superpower.md)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](ch03/045-agent.md)
- [两万字详解Claude Code源码核心机制](ch03/075-claude-code.md)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](ch03/075-claude-code.md)
- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](ch04/277-ai.md)
- [Co Existence And The End Of Co Intelligence](ch01/621-co-existence-and-the-end-of-co-intelligence.md)
- [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- [Model Context Protocol](https://github.com/QianJinGuo/wiki/blob/main/concepts/mcp-protocol-ecosystem.md)
- [Agentic Engineering Paradigm](https://github.com/QianJinGuo/wiki/blob/main/concepts/agentic-engineering-paradigm.md)
- [Context Management](https://github.com/QianJinGuo/wiki/blob/main/concepts/context-management-agent-systems.md)
- [an opinionated guide to using ai right now](ch09/079-an-opinionated-guide-to-using-ai-right-now.md)
- [我用claude搭了个自动新闻简报，30天后比我刷了一年的信息还有用](ch03/045-agent.md)
- [boris cherny 新访谈：开发工具正在从 ide 变成 agent 控制台](https://github.com/QianJinGuo/wiki/blob/main/entities/iqSixiNP9lxNKg7aVfHFCQ.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/memory-context-systems.md)

---

