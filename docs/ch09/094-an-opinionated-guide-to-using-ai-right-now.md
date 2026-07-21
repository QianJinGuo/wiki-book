# An Opinionated Guide to Using AI Right Now

## Ch09.094 An Opinionated Guide to Using AI Right Now

> 📊 Level ⭐⭐ | 8.0KB | `entities/an-opinionated-guide-to-using-ai-right-now.md`

# An Opinionated Guide to Using AI Right Now

## 摘要

Ethan Mollick 基于 OpenAI 发布的实际使用数据，撰写了一份面向普通用户的 AI 使用指南。文章覆盖了模型选择、付费策略、模型类型区分、Deep Research、多模态输入、内容生成等关键维度，核心观点是：**约 10% 的人类每周使用 AI，但大多数人仍未找到正确的使用方式**。指南的核心建议是：选择一个你喜欢的系统，从真正重要的事情开始，然后通过实验建立直觉。

## 核心要点

### 模型格局：九大 AI 系统

当前前沿 AI 系统可分为两个梯队：

**四大闭源前沿系统**：
- **Claude**（Anthropic）— 编程和分析能力强
- **Gemini**（Google）— 网络搜索和图像生成突出
- **ChatGPT**（OpenAI）— 功能最全面
- **Grok**（xAI）— 模型强大，功能快速迭代

**开源权重家族**（几乎同样强大）：
- **DeepSeek、Kimi、Z、Qwen**（中国）
- **Mistral**（法国）

这九个系统的变体占据了几乎所有 AI 排行榜的前 35 名。其他服务（如 Microsoft Copilot、Perplexity）都以这些模型为基础。

### 付费策略：$20 vs $200

| 层级 | 价格 | 适用人群 | 主要差异 |
|------|------|---------|---------|
| 免费 | $0 | 大多数日常使用 | 功能受限，模型较弱 |
| 标准 | ~$20/月 | 大多数人 | 高级模型、代理模式、深度研究 |
| 专业 | ~$200/月 | 复杂技术/编码需求 | 最强模型（如 GPT-5 Pro）、重度思考模式 |

$20 层级推荐从 Anthropic、Google 或 OpenAI 中选一个。如果只想用免费模型，开源权重模型和 Microsoft Copilot 等聚合服务有更高的使用限额。

### 三种模型类型

理解模型类型是有效使用 AI 的关键：

- **Chat 模型**：通常是免费提供的默认模型，回答速度快、性格最讨喜，适合对话
- **Agent 模型**：回答时间更长，但能自主执行多个步骤（搜索网络、使用代码、制作文档），适合复杂工作
- **Wizard 模型**：耗时最长，处理极复杂的学术任务

**Mollick 的建议**：对于重要的实际工作，使用 Agent 模型——它们更强大、更一致、更不容易犯错。

### ChatGPT 的模型选择陷阱

GPT-5 不是一个模型，而是多个模型的集合：从很弱的 GPT-5 mini 到很好的 GPT-5 Thinking，再到极强的 GPT-5 Pro。选择「GPT-5」实际上获得的是「auto」模式——AI 自行决定用哪个模型，通常是较弱的那个。付费用户应手动选择：
- **$20 计划**：GPT-5 Thinking Extended
- **$200 计划**：GPT-5 Thinking Heavy
- **极端难题**：GPT-5 Pro（仅最贵层级可用）

Gemini 相对简单：只有 Flash 和 Pro 两个选项，付费 Ultra 可用 Deep Think。Claude 最容易选择：Sonnet 4.5 配合扩展思考即可。

### Deep Research：大多数人的关键功能

Deep Research 模式让 AI 在回答前进行 10-15 分钟的广泛网络研究。它能产出令律师、会计师、顾问、市场研究人员印象深刻的高质量报告。虽然不是零错误，但比直接问 AI 准确得多，引用也往往是正确的。

连接个人数据（Gmail、SharePoint 等）同样强大——Claude 在整合跨邮件、日历、多个云端硬盘的搜索方面表现尤佳。问它「给我一份详细的今日简报」会得到令人印象深刻的结果。

### 多模态与实用技巧

- **语音模式**：Gemini 和 ChatGPT 的实现最好，Claude 较弱。语音模型针对对话优化，无法使用更强的模型
- **屏幕/摄像头共享**：手机对准破损电器、数学问题、外文标牌，AI 实时看到你所看到的并回应
- **文件处理**：可上传 PDF、图片、视频（ChatGPT 和 Gemini）。Claude 在 PowerPoint 和 Excel 生成方面领先

### 关于幻觉、谄媚和提示词

**幻觉**：新模型已大幅改善，但仍会犯错且自信地给出错误答案。高级模型和做过网络搜索的答案更可靠。AI 不知道「为什么」它做了某事，询问逻辑不会有帮助，但思考轨迹可能有参考价值。

**谄媚**：所有 AI 聊天机器人都变得更讨人喜欢了，但这也创造了风险——人们可能与 AI 形成过强的依附。需要真正反馈时，明确告诉 AI 扮演批评者角色。

**提示词技巧**：最新研究表明，思维链等传统提示词技巧已不再有显著帮助（沃顿商学院研究），威胁或讨好 AI 也平均没有效果。模型越来越善于理解你的意图。

## 深度分析

### 使用模式的结构性洞察

OpenAI 的使用数据揭示了一个重要事实：AI 的最大用途是**实用指导和信息获取**，而非人们直觉认为的「闲聊」。这意味着大多数用户应优化的是「信息检索和分析」场景，而非创意写作或娱乐。

### Agent 模型的范式转变

Mollick 对 Chat/Agent/Wizard 三种模型的区分反映了 AI 产品设计的核心张力：**速度 vs 深度**。Agent 模型本质上是把 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 的理念内置到了模型推理过程中——它不只是回答问题，而是自主执行多步骤工作流。这与 [Claude Code](../ch03/076-claude-code.html) 的自主循环异曲同工，但以更轻量的方式呈现在普通用户面前。

### 模型选择的战略意义

文章揭示了一个被大多数用户忽视的关键问题：**默认选择不等于最优选择**。ChatGPT 的 auto 模式倾向于分配较弱的模型给用户，这意味着大多数免费用户和不手动选择模型的付费用户，实际获得的 AI 能力远低于可用水平。

### 免费模型的合理使用

Mollick 明确指出：如果你的使用场景在图表中显示免费模型就够了，那就用免费模型，不用担心指南的其他内容。这种务实态度反映了一个被忽视的事实：**大多数人不需要最强的 AI，他们需要足够好的 AI 用在正确的地方**。

## 实践启示

1. **手动选择模型**：不要依赖默认的 auto 模式，特别是 ChatGPT 用户——手动选择 Thinking Extended 或 Thinking Heavy
2. **尝试 Deep Research**：这是当前 AI 最被低估的功能之一，适合需要高质量信息的任何场景
3. **用 Agent 模型做正事**：对于重要的实际工作，跳过 Chat 模型直接使用 Agent 模式
4. **提供上下文**：上传文件、连接数据源、用一段话介绍自己——AI 不知道你的背景
5. **通过实验建立直觉**：不要试图成为 AI 专家，而是通过玩耍和实验理解系统的边界
6. **不信任但验证**：所有 AI 输出都需要验证，尤其是视频和图片——「你真的不能相信在网上看到的任何东西了」

## 相关实体

- [两万字详解Claude Code源码核心机制](../ch03/076-claude-code.html)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](../ch04/235-agentic.html)
- [构建基于多智能体架构的深度思考交易系统 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/构建基于多智能体架构的深度思考交易系统-v2.md)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](../ch11/226-openclaw.html)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](../ch05/039-agent-harness.html)
- [Ethan He Cosmos Grok Imagine Latent Space Video Agent 20260606](../ch03/046-agent.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/an-opinionated-guide-to-using-ai-right-now.md)

---

