# A Guide to Which AI to Use in the Agentic Era

## Ch01.485 A Guide to Which AI to Use in the Agentic Era

> 📊 Level ⭐⭐ | 7.4KB | `entities/a-guide-to-which-ai-to-use-in-the-agentic-era.md`

## A Guide to Which AI to Use in the Agentic Era

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/a-guide-to-which-ai-to-use-in-the-agentic-era.md)

## 摘要

Ethan Mollick（沃顿商学院教授、AI 应用领域的权威声音）发布了他自 ChatGPT 以来的第八版 AI 使用指南，但这次代表了一个重大转折点：**"使用 AI"的含义已经从"与聊天机器人对话"转变为"让 AI 作为 Agent 完成任务"**。文章系统梳理了当前 AI 生态的三个关键维度——Models（模型）、Apps（应用）和 Harnesses（驾驭系统），并给出了面向不同用户层次的实操建议。

## 核心要点

1. **Models / Apps / Harnesses 三分法** — 这是理解当前 AI 生态的核心框架。Models 是底层 AI 大脑（GPT-5.2、Claude Opus 4.6、Gemini 3 Pro），Apps 是用户界面（网站、桌面应用），Harnesses 是让模型能"做事"的系统（工具访问、多步任务执行）。同一模型在不同 Harness 下的表现可能天差地别。

2. **三大前沿模型趋同** — Claude Opus 4.6、GPT-5.2 Thinking、Gemini 3 Pro 在整体能力上已相当接近。对大多数人而言，**App 和 Harness 的差异比模型差异更重要**。免费模型经过聊天优化，速度快但准确度显著低于付费模型。

3. **手动选择模型至关重要** — 各厂商默认使用"auto"模式（通常分配较弱模型）。ChatGPT 需手动选 GPT-5.2 Thinking Extended/Heavy，Claude 需选 Opus 4.6 并开启 extended thinking，Gemini 需选 3 Pro 或 Thinking。这是提升 AI 工作质量的最简单操作。

4. **Harness 是真正的差异化因素** — Claude Code 给模型提供了虚拟电脑、浏览器、终端，可以自主完成从研究到编码到测试的全流程。Mollick 分享了 Claude Code 在一小时内自主完成 80 卷 GPT-1 权重书籍的排版、封面设计、网站搭建和支付集成的案例。

5. **Claude Cowork 开创桌面 Agent 范式** — Anthropic 发布的 Claude Cowork 是"非技术版 Claude Code"，在桌面运行并直接操作本地文件和浏览器。它在 VM 中运行，具有默认拒绝网络和硬隔离安全机制，代表了 AI Agent 从编码场景向通用知识工作的扩展。

6. **Chatbot 界面的分化** — Gemini 集成了 nano banana（图像生成）、Veo 3.1（视频生成）、Guided Learning；ChatGPT 集成了图像生成、Deep Research、Shopping Research；Claude 仅集成了 Deep Research，但 Claude Desktop 提供了 Code + Cowork 的强大组合。

## 深度分析

### Models / Apps / Harnesses 框架的深层含义

Mollick 的三分法是理解当前 AI 生态最实用的分析框架。它的核心洞察是：**模型能力正在快速商品化，差异化竞争正在从模型层向 Harness 层迁移**。

这一趋势与 Agent Harness 概念高度吻合。Harness 的本质是将原始模型能力转化为可执行的工作流——就像马具将马的力量转化为耕地或拉车的能力。Claude Code 的"虚拟电脑 + 终端 + 浏览器"、Claude Cowork 的"桌面操作 + 文件系统访问"、NotebookLM 的"知识库 + 播客生成"都是不同形态的 Harness。

### 各厂商的 Harness 策略对比

| 维度 | Anthropic | OpenAI | Google |
|------|-----------|--------|--------|
| 编码 Harness | Claude Code | Codex | Antigravity |
| 桌面 Agent | Claude Cowork | — | — |
| 办公集成 | Excel/PPT 插件 | — | Sheets 集成 |
| 知识工具 | Deep Research | Deep Research + Shopping | NotebookLM + Deep Research |
| 安全模型 | VM 隔离 + 默认拒绝网络 | — | — |

Anthropic 在 Harness 层的布局最为完整——从编码（Code）到通用桌面（Cowork）到办公（Excel/PPT），形成了覆盖开发者和非技术用户的全栈 Agent 产品线。这与 [Claude Code 的架构分析](/ch01-734-两万字详解claude-code源码核心机制/) 中揭示的设计理念一脉相承。

### "AI 做事" vs "AI 说话" 的范式转移

Mollick 指出的核心转变是：**"an AI that does things is fundamentally more useful than an AI that says things"**。这不仅是用户体验的变化，更是 AI 应用架构的根本性重构：

- **从 prompt engineering 到 harness engineering**：用户的工作从"如何描述问题"变为"如何配置和管理 Agent 的工作环境"
- **从单轮对话到多步执行**：Agent 可以自主规划、执行、检查、重试，用户从"操作者"变为"管理者"
- **从文本输出到结构化产出**：Agent 可以直接生成文件、表格、网站、代码，而非仅返回文本建议

### NotebookLM 的独特价值

在众多工具中，NotebookLM 值得特别关注。它解决了一个其他工具都没有很好解决的问题：**如何让 AI 帮助理解大量信息**。通过构建交互式知识库并支持多种输出形式（slides、mind maps、podcasts），它在研究和学习场景中具有独特的价值。

### OpenClaw 的警示意义

OpenClaw 代表了 AI Agent 的一个极端方向——24/7 个人助手，具有对电脑和账户的广泛访问权限。Mollick 明确警告"you almost definitely shouldn't use"它，因为它带来了严重的安全风险。这与 Claude Cowork 的"VM 隔离 + 默认拒绝网络"形成鲜明对比，揭示了 Agent 安全设计的重要性。

## 实践启示

- **入门策略**：选择 ChatGPT/Claude/Gemini 之一，付费 $20/月，**手动选择最强模型**（不要用默认的 auto 模式）。这一简单操作就能显著提升 AI 工作质量
- **进阶路径**：从聊天机器人进阶到 Agent 工具。NotebookLM 免费且易用，适合作为起点；Claude Desktop（Code + Cowork）是最强大的进阶选择
- **管理思维**：从"prompting"转向"managing"——描述目标、审查产出、在出错时纠偏，而非逐句指导 AI 操作
- **Harness 选型**：根据工作类型选择合适的 Harness。编码选 Claude Code / Codex，知识工作选 Claude Cowork，研究选 NotebookLM，不要期望一个工具满足所有需求
- **安全意识**：使用 Agent 工具时关注其安全模型。优先选择有明确隔离机制的产品，谨慎授予 AI 对本地文件和账户的访问权限

## 相关实体

- [Claude Code](/ch04-296-claude-code-subagent/)
- [Claude Opus 4.8 System Card](/ch01-244-claude-opus-4-8-the-system-card/)
- [NotebookLM](/ch01-017-notebooklm/)
- [Agent Harness](/ch04-487-hidden-technical-debt-of-ai-systems-agent-harness/)
- [Karpathy: Agentic Engineering](/ch04-070-从氛围编程到智能体工程/)
- MOC: Prompt Engineering

---

