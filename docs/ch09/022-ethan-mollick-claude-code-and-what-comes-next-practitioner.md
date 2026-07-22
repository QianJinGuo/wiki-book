# Ethan Mollick: Claude Code and What Comes Next (Practitioner View)

## Ch09.022 Ethan Mollick: Claude Code and What Comes Next (Practitioner View)

> 📊 Level ⭐⭐ | 17.1KB | `entities/oneusefulthing-claude-code-what-comes-next.md`

# Ethan Mollick: Claude Code and What Comes Next (Practitioner View)

> **Core insight**: Ethan Mollick（One Useful Thing）2026-01 对 Claude Code 的端到端实测：单条 prompt "Develop a startup that makes $1000/month" 触发 **1 小时 14 分钟自主工作**，创建数百文件 + 部署真实可售卖网站。背后是 **compaction / Skills / subagents / MCP 四个 magic trick** 的组合。

## 现象级实测

Mollick 给 Claude Code 一条 prompt：
> "Develop a web-based or software-based startup idea that will make me $1000 a month where you do all the work..."

**发生了什么**：
1. AI 反向问 3 个 multiple-choice 问题（确认需求）
2. 决定产品：500 套专业 prompts，$39/套
3. **完全自主工作 1 小时 14 分钟**，创建数百个 code files + prompts
4. 交付**单个文件可运行的部署**——一个可售卖 prompts 的网站
5. 销售链接**真的能收钱**（Mollick 因良心未实际销售）

> [You can actually see the site it launched here](https://prompt-vault-phi-rust.vercel.app/)

**重要**："very sketchy fake marketing claims" 表明 AI 没有自动阻止虚假营销 — **agent 时代的人类监督仍是必要**。

## 能力突变的两个关键

Mollick 把这种"突然的能力跃升"归因于**两个独立进展的乘数效应**：

1. **最新 AIs 在自主工作中能 self-correct 更多错误**（编程任务尤其）
2. **AIs 被赋予 "agentic harness"** —— 一套工具和方法，能用新方式解决问题

METR 数据：AI 能 50% 可靠性自主完成的任务长度（按人类专家耗时）**指数级增长**，过去几个月有大跳跃。

## Claude Code 的四个 Magic Tricks

### 1. Compaction（Memento 比喻）

**问题**：Context window 即使有 150K+ words 也快速耗尽——对话历史、读过的文档、图像、system prompt 都会塞满。

**解法**：当 context 用完时，Claude Code **停止并 "compact"** 对话：
- 写下"停在哪里、做了什么"的笔记
- **清空 context window**
- 新版本读取笔记继续（像 _Memento_ 主角看纹身）

**为什么关键**：让 Claude **连续工作数小时**，不丢失进度。

### 2. Skills（Matrix 比喻）

**问题**：用户必须不断喂 prompts，长 prompts 占用大量 context，且需要"在正确时机给正确 prompt"。

**解法**：**Skills 是 AI 自主决定何时使用的指令集合**，**不仅包含 prompts，还包含完成任务所需的工具**。
- 网站构建 Skill：解释如何建站 + 提供工具
- Excel 表格 Skill：自己的指令和工具
- Neo 在 _Matrix_ 加载功夫技能："I know kung fu."

**Skills 让 AI 覆盖整个流程**，按需切换知识。

**生态示例**：Jesse Vincent 的 [superpowers](https://github.com/obra/superpowers?tab=readme-ov-file) —— 让 Claude Code 处理完整软件开发流程（从头脑风暴 → 测试），按需加载 skills。**Skill 创建极其容易**：用 plain language，AI 可以帮助你创建它们。

### 3. Subagents

**问题**：Opus 4.5 是大而昂贵的模型。

**解法**：把**容易的任务**交给**便宜快速的子模型**：
- 专业化（自己的 context window）
- 并行（同时运行多个 subagent）
- 团队化（vs 单兵作战）

**Mollick 自建**：
- research subagent
- image creation subagent
- 主模型按需"招聘"

### 4. Model Context Protocol (MCP)

**问题**：每个 AI 工具都需要"对接"才能用。

**解法**：[Model Context Protocol](https://modelcontextprotocol.io/introduction) —— **任何 AI 可以获取的指令 + 访问标准**。

MCP 生态：
- 出版商 MCPs（AI 访问科学论文）
- 支付公司 MCPs（AI 分析金融数据）
- 软件提供商 MCPs（AI 使用特定软件产品）

结果：**通用 AI（Opus 4.5）能按需应用 specialized skills、使用所需工具、跟踪进度**。

## 对非程序员的实战指南

**好消息**（截至 2026-01）：**Claude Desktop 出现**（不只 Command Line Interface）—— $20/月订阅。

**操作步骤**：
1. 给 AI 访问一个文件夹（注意：Claude 会对该文件夹文件做任何事，敏感数据先备份）
2. 让 AI 研究写报告、给信用卡账单让它建电子表格、让它做数据可视化

**最强大的功能通过 slash commands 访问**：
- `/agents` —— 设置 subagents
- `/skills` —— 创建/下载 skills

**Mollick 的核心建议**：

> "If you're a programmer, you should already be exploring these tools. If you're programming-adjacent (an academic who works with data, a designer who wants to experiment with code, anyone who wants to try building a thing they are imagining) **this is your moment to experiment**."

**为什么"非程序员也该用"**：用对 harness，今天的 AIs 能做**真实、持续、有意义的工作**，这反过来正在改变我们处理任务的方式。

## Mollick 自己的例子：历史世界模拟器

写作本文时 Mollick 同时让 AI 构建一个**世界模拟器游戏**：
- 文明兴衰
- 自有语言、文化、经济
- 板块构造 + 天气
- 王室族谱追踪
- AI 戏剧性事件总结

每几分钟给一个"看似不可能"的新需求，**AI 从不卡壳或原地打转**。可下载 [emollick.itch.io/world-simulator](https://emollick.itch.io/world-simulator)（"AI handled that part, too"）。

## 风险与警告

> "Of course, AIs are not flawless and giving an AI access to your browser and computer creates all sorts of new risks and dangers. The AI might delete files it shouldn't, execute code with unintended consequences, or access sensitive data in your browser."

**Mollick 的安全建议**：
- 备份
- 用专用文件夹
- 不要给它访问你不能承受丢失的东西

## 与 [Opus 4 7 Launch Claude Code Best Practices Wechat](../ch03/076-claude-code.html) 的关系

| 维度 | 现有 entity | 本文 |
|------|------------|------|
| 视角 | Anthropic 官方 + WeChat 实战深度技术 | **非程序员 / 业务人员** 视角 |
| 内容 | hooks / subagents / skills 深度 | 端到端单条 prompt → 部署 |
| 受众 | 程序员 | **所有人都该尝试**（"this is your moment"） |
| 深度 | 工程实施 | 现象级演示 + 入门指南 |

→ **互补**：opus-4-7-launch 给出生产级技术细节，本文给出"为什么所有人都该用"的现象级证据。

## 三个独到洞察

1. **"1小时14分钟单 prompt → 真实部署网站"** 是 agent 时代**首个"非技术人也能验证"** 的端到端证据。区别于 "AI 写 Hello World" — 这是**真实经济价值**的工作流。

2. **"Compaction = Memento, Skills = Matrix"** 这两个电影比喻**精确捕捉**了关键魔法的本质——是给非技术读者讲清楚复杂系统的有效框架。

3. **"Claude Desktop 出现"** 是 2026-01 的关键里程碑——意味着**harness 不再是程序员的专利**。这是 agent 时代**真正开始普及**的标志（与 web/desktop 普及类似）。

## 实践要点

**对个人 / 知识工作者**：
- 开始用 Claude Code（$20/月 Claude Desktop 订阅）
- 用专用文件夹 + 备份起步
- **尝试用 Claude Code 编程**，即便你不是程序员（Mollick 强烈建议）
- 关注 [simonwillison.net](https://simonwillison.net/2025/Oct/16/claude-skills/#claude-as-a-general-agent) / [every.to](https://every.to/source-code/how-to-use-claude-code-for-everyday-tasks-no-programming-required) 等实战指南

**对企业**：
- **Skills 是企业知识资产化的新载体**——流程、模板、最佳实践都可以 Skills 形式沉淀
- **Subagents 是组织结构的映射**——研究 agent、写作 agent、QA agent = 部门化思维
- **MCP 是企业系统接入 AI 的标准**——避免每个 AI 工具单独对接的 N×M 成本

**对教育者**：
- 学生应直接用 Claude Code（不是禁用）—— Mollick 的"历史世界模拟器"是教育应用的样本
- **"AI 不会做的工作"是新的学习目标**——批判性思考、原创判断、人际沟通

## 上线状态

- **作者**：Ethan Mollick（One Useful Thing，Wharton 教授）
- **发布日期**：2026-01-07
- **原文链接**：[oneusefulthing.org/p/claude-code-and-what-comes-next](https://www.oneusefulthing.org/p/claude-code-and-what-comes-next)
- **配套阅读**：[Real AI Agents and Real Work](https://www.oneusefulthing.org/p/real-ai-agents-and-real-work) — Mollick 同期姊妹篇，专注真实工作
- **演示网站**：[prompt-vault-phi-rust.vercel.app](https://prompt-vault-phi-rust.vercel.app/)

## 关键引用

> "What makes these new tools suddenly powerful is not one breakthrough, but a combination of two advances. First, the latest AIs are capable of doing far more work autonomously while self-correcting many of their errors... Second, the AIs are being given an 'agentic harness' of tools and approaches that they can use to solve problems in new ways."

> "Claude Code handles this issue [context exhaustion] in a different way. When it runs out of context, it stops and 'compacts' the conversation so far, taking notes about exactly where it was when it stopped."

> "Skills solve this problem. They are instructions that the AI decides when to use, and they contain not just prompts, but also the sets of tools the AI needs to accomplish a task."

> "If you're programming-adjacent (an academic who works with data, a designer who wants to experiment with code, anyone who wants to try building a thing they are imagining) this is your moment to experiment. But there's a deeper point here: with the right harness, today's AIs are capable of real, sustained work that actually matters."

## 深度分析

1. **Agent 能力跃升的本质是"两个独立进展的乘数效应"**：Mollick 指出能力突变的本质不是单一突破，而是"最新 AIs 自主纠错能力提升 × agentic harness 工具赋予"两个独立进展的乘法叠加。METR 数据证实 AI 能以 50% 可靠性自主完成的任务长度（按人类专家耗时）呈指数增长，且近月有大跳跃。这意味着评估 AI 能力不能看单一维度，而要看"模型能力 × 工具系统"的乘积。

2. **Compaction 的本质是"有意识的上下文分段管理"**：不同于 ChatGPT 的滚动上下文窗口自然遗忘，Claude Code 的 compaction 是主动的、有目的的上下文管理——当 context 耗尽时，AI 精确记录"停在哪里、做了什么"，然后清空 window，新版本读取笔记继续（像 _Memento_ 主角看纹身）。这解决了长程任务中"旧代码被新代码挤出"的致命问题，让 Claude 能连续工作数小时。

3. **Skills 代表了提示工程的范式转移——从"用户喂prompt"到"AI自主选技能"**：Skills 不仅是长 prompts 的压缩，更是"AI 自主决定何时使用"的触发机制，且内含完成任务所需的完整工具集。用户从"不断喂 prompt"转变为"描述任务目标，AI 自己判断需要什么技能"。Jesse Vincent 的 superpowers 项目证明 Skill 创建已极其容易——用自然语言，AI 就能帮你创建。

4. **Subagents 将"团队"概念从隐喻变为工程实现**：主模型按需"招聘"专业 subagent，每个拥有独立 context window，可并行运行。这不仅是任务分配，更是将复杂问题分解为专业化子问题的系统性方法论。Mollick 自建 research subagent + image creation subagent 的实践表明，非技术人员也能构建多智能体协作系统。

5. **MCP 正在构建 AI 领域的"USB即插即用"生态**：Model Context Protocol 的本质是为所有 AI 提供标准化的工具接入方式——出版商 MCPs 让 AI 访问科学论文，支付公司 MCPs 让 AI 分析金融数据，软件提供商 MCPs 让 AI 使用特定产品。这将终结每个 AI 工具单独对接的 N×M 成本，形成类似 USB 的通用生态。

## 实践启示

1. **非程序员的行动窗口已打开**：Claude Desktop（$20/月）的出现标志着 harness 不再是程序员专利。"If you're programming-adjacent, this is your moment to experiment" 不是建议而是宣告。建议从专用文件夹 + 备份起步，逐步扩展到真实工作流。

2. **掌握 slash commands 作为核心入口**：`/agents` 和 `/skills` 是访问最强大功能的途径。Mollick 自建 subagent 的实践证明，用简单命令配置多智能体协作是可行的。Desktop 版本目前 slash commands 有限，但完整功能即将到来。

3. **企业知识资产应转化为 Skills**：流程、最佳实践、领域专业知识都可以 Skills 形式沉淀并被 AI 调用。这比文档或 SOP 更有效——Skills 是 AI 可执行的知识载体，是组织能力复制的新形式。

4. **主动管理 context window 而非被动等待**：理解 compaction 机制后，用户应主动监控上下文消耗，定期让 AI 报告进度并保存中间产物，防止长程任务中的信息丢失。compaction 是 AI 自我保护机制，但主动管理能进一步提高效率。

5. **建立人类监督框架是 Agent 时代的必要设置**：Mollick 实验中 AI 生成了"非常可疑的虚假营销声明"却未自动阻止，说明"AI 不完美，给 AI 访问浏览器和电脑会带来各种新风险"——AI 可能删除不该删的文件、执行有意外后果的代码、或访问浏览器中的敏感数据。人类监督不是可选项而是必选项。

6. **关注 Karpathy 的警示——"职业正在被 dramatically refactored"**：这位 AI 领域知名工程师表示"作为程序员从未感到如此落后"，他感觉自己如果正确整合近一年可用的工具可以 10X 更强大。Mollick 以此结尾不是危言耸听，而是行动号召——主动学习和适应这些工具，否则面临"skill issue"风险。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/claude-code-and-what-comes-next.md)

---

