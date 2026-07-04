# AI Agent 时代选型指南：模型·应用· Harness（Mollick）

## Ch04.279 AI Agent 时代选型指南：模型·应用· Harness（Mollick）

> 📊 Level ⭐⭐ | 9.1KB | `entities/guide-ai-agents-models-apps-harnesses-mollick.md`

# AI Agent 时代选型指南：模型·应用· Harness（Mollick）

> 2026-06-07 引用自 Ethan Mollick《A Guide to Which AI to Use in the Agentic Era》，One Useful Thing，2026-02-18。

## 核心框架：Models · Apps · Harnesses

Mollick 提出 AI 选型三维框架，将 AI 生态分为三层：

| 层级 | 定义 | 代表产品 |
|------|------|---------|
| **Models**（模型） | 底层 AI 大脑，决定推理/写作/编程/多模态能力 | GPT-5.2/5.3、Claude Opus 4.6、Gemini 3 Pro |
| **Apps**（应用） | 用户实际交互的界面和产品 | ChatGPT.com、Claude.ai、Gemini.google.com |
| **Harnesses**（工具系统） | 让模型调用工具、完成多步任务的中间层 | Claude Code（编程）、Claude Cowork（桌面）、Deep Research |

**关键洞察**：同一模型在不同 harness 中表现差异巨大。Claude Opus 4.6 在聊天窗口是聪明助手；在 Claude Code 里可以自主编写测试部署全流程网站。

## 模型选型（2026 年初现状）

三大前沿模型总体能力接近，但细节差异明显：

- **GPT-5.2 Thinking Extended**（$20 订阅）：Mollick 最推荐复杂任务首选，手动选择而非 auto 模式
- **Claude Opus 4.6**（$20 订阅）：开启 extended thinking，适合高难度分析任务
- **Gemini 3 Pro/Thinking**：功能最弱但仍有竞争力，Deep Think 模式强大

> [!warning]
> 免费版默认模型（GPT-5 mini / Gemini 3 Flash）针对对话优化而非准确性，复杂任务务必选高级模型。

## Harness 深度对比

### Claude Code / OpenAI Codex / Google Antigravity
面向程序员的编程 agent：提供代码库访问、终端、浏览器工具，可以自主完成"描述需求→编写→测试→部署"全流程。

**典型案例**：Mollick 用一句 prompt 让 Claude Code 将 GPT-1 全部权重（117M 参数）排版成 80 卷实体书（含网站/Stripe/Lulu 打印按需出版），全程无人工介入。

### Claude Cowork
Anthropic 2025 年 1 月发布的桌面 agent，面向非技术用户：在虚拟机隔离环境中运行，可读写本地文件、操控浏览器。Mollick 评价为"真正的新物种"，同类竞品中安全隔离做得最好。

### NotebookLM
Google 的知识管理工具：上传论文/视频/网站，构建可查询知识库，可生成播客（双 AI 主播讨论你的材料）。

## AI 使用建议（Mollick）

1. **入门**：选一个系统（ChatGPT/Claude/Gemini），付费 $20，选高级模型，用真实任务测试
2. **进阶**：尝试 NotebookLM（免费易用）→ Claude Code/Cowork → 复杂 agentic 任务
3. **核心转变**：从 chatbot（prompt ↔ response loop）到 agent（委托任务→等待结果→评估 output）

## 关键引用

> "The shift from chatbot to agent is the most important change in how people use AI since ChatGPT launched. An AI that does things is fundamentally more useful than an AI that says things."

> "The exact same model, Claude Opus 4.6, asked the exact same question in three different harnesses. With no harness the information is out of date; on Claude.ai I get updated information and verifiable sources; using Claude Cowork, I get a sophisticated analysis and well-formatted head-to-head comparisons."

## 深度分析

### 1. Models-Apps-Harnesses 三层解耦的架构意义
Mollick 的框架虽然面向普通用户，但精准映射了 AI 系统的架构分层：Models 对应推理层（参数权重+推理引擎），Apps 对应交互层（UI/UX + 会话管理），Harnesses 对应工具层（工具调用+多步编排+环境隔离）。这一分层与 `Co Existence Paradigm Shift Agentic Ai Mollick 2026` 中 Mollick 后续提出的"AI 从说事到做事"范式转换一致：价值的重心正在从 Models 层向 Harnesses 层迁移——当三大模型能力趋近时，harness 的差异化成为选型决定因素。

### 2. "同模型不同 harness"现象的工程根因
Claude Opus 4.6 在裸对话、Claude.ai、Claude Cowork 三种环境下回答同一问题的表现截然不同。工程根因是：harness 决定了模型的工具集（搜索/代码执行/文件系统）、系统提示（任务分解策略/输出格式约束）和环境（隔离沙箱/持久化状态）。这验证了 `Agent Harness Architecture Deep Dive Aksahy` 的核心论点——harness 不是可选附件，而是 AI 系统的实际能力边界。

### 3. 付费模型的隐性分层与 auto 模式的欺骗性
Mollick 特别强调的"auto 模式陷阱"是一个被广泛低估的问题：ChatGPT 的默认"GPT-5.2"实际上是 auto 模式，会根据查询复杂度自动选择模型版本，但倾向于选择更快、更弱的模型。这意味着即使付费用户，如果不手动选择高级模型，也常常在使用与免费版相当的推理能力。这一设计是商业驱动的（节省推理成本），但对用户不透明。

### 4. Claude Cowork 的产品定位突破
Mollick 将 Claude Cowork 评价为"真正的新物种"——第一个面向非技术用户的 agentic 工作站。其关键创新不是技术层面的（虚拟机隔离、浏览器操控已有先例），而是产品定位层面的：将 agent 的概念从"开发者工具"扩展到"知识工作者助手"。这与 `Management As Ai Superpower Mollick` 中"管理 AI 的能力比编程 AI 的能力更重要"的论点呼应——非技术用户需要的不是更简单的编程工具，而是完全不同的交互范式。

### 5. 从 chatbot 到 agent 的范式转换还在加速
Mollick 认为这是"ChatGPT 发布以来人们使用 AI 方式的最重要变化"。但这一转换远未完成：当前大多数用户仍在 chatbot 模式下使用 AI，部分原因是 agent 的可靠性尚不足以支持"委托后无需监督"的信任级别。随着 harness 成熟度提升和模型可靠性改善，agent 模式的采纳曲线可能呈 S 形而非线性。

## 实践启示

### 1. AI 选型：优先选 harness 而非模型
当三大模型能力趋近时，harness 的差异化远大于模型差异。优先考虑你需要的能力（代码执行/桌面操作/深度研究），然后选择提供该 harness 的平台。Claude 适合编程+桌面 agent，ChatGPT 适合通用生产力和研究，Gemini 适合多模态创作。

### 2. $20 付费版用户：永远手动选高级模型
在任何 AI 应用中，第一步是检查当前使用的是否是高级模型。关闭 auto 模式，手动选择 GPT-5.2 Thinking Extended / Claude Opus 4.6 + extended thinking / Gemini 3 Pro。这是性价比最高的 AI 使用优化。

### 3. 非技术用户：从 NotebookLM → Claude Cowork 渐进
先用 NotebookLM（免费）体验"AI 处理你的材料"的价值，再用 Claude Cowork（$20）进入"AI 替你执行任务"的 agent 模式。这一路径比直接跳入编程 agent 的认知负担小得多。

### 4. 组织 AI 策略：投资 harness 能力而非模型订阅
企业 AI 策略的重心应从"选哪个模型"转向"构建什么 harness"。自定义 harness（工具集成、工作流编排、安全策略）的差异化价值远超模型选择。参考 `Claude Code Open Source Model Enterprise Practice` 中的企业级 harness 构建经验。

### 5. 评估 AI 时：同一问题在三种 harness 下对比测试
不要仅用对话模式评估模型。将同一问题分别在裸对话、Deep Research、和 agentic harness（Claude Code/Cowork）中测试，理解 harness 对输出质量的放大效应。这是最诚实的 AI 能力评估方法。

## 相关主题

- [Co Existence Paradigm Shift Agentic Ai Mollick 2026](https://github.com/QianJinGuo/wiki/blob/main/entities/co-existence-paradigm-shift-agentic-ai-mollick-2026.md) — Mollick 2026-06 范式转换叙事（同一作者更新的 agentic 时代框架）
- [Management As Ai Superpower Mollick](https://github.com/QianJinGuo/wiki/blob/main/entities/management-as-ai-superpower-mollick.md) — 管理作为 AI 超级能力（同一作者，同期但不同议题）
- [Gpt5 Just Does Stuff Mollick](https://github.com/QianJinGuo/wiki/blob/main/entities/gpt5-just-does-stuff-mollick.md) — GPT-5 "It Just Does Stuff"（同一作者，模型能力侧写）
- [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/a-guide-to-which-ai-to-use-in-the-agentic-era.md)
## 相关实体

- [claude dispatch + 接口力量：ai 从 chatbot 到 agent interface 的转变](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-dispatch-interfaces-mollick.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/agent-engineering-guide.md)

---

