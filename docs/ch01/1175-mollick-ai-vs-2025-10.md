# Mollick 的 AI 实用指南：免费 vs 付费·模型选择·深度研究（2025-10）

## Ch01.1175 Mollick 的 AI 实用指南：免费 vs 付费·模型选择·深度研究（2025-10）

> 📊 Level ⭐⭐⭐⭐ | 9.1KB | `entities/opinionated-guide-ai-right-now-mollick.md`

# Mollick 的 AI 实用指南：免费 vs 付费·模型选择·深度研究（2025-10）

> 2026-06-07 引用自 Ethan Mollick《An Opinionated Guide to Using AI Right Now》，One Useful Thing，2025-10-19。

## 背景数据

- 全球约 **10% 人类每周使用 AI**（截至 2025 年 10 月）
- OpenAI 数据显示：ChatGPT 主要用途**不是闲聊**，而是**信息查询**（超出预期）
- 四大前沿模型：Claude（Anthropic）、Gemini（Google）、ChatGPT（OpenAI）、Grok（xAI）
- 开源权重模型：DeepSeek、Kimi（国产）、Z、Qwen、Mistral，几乎同样强大

## 免费 vs 付费决策

| 场景 | 推荐 |
|------|------|
| 随意聊天、找灵感 | 免费模型足够 |
| 做真实工作（报告/分析/代码） | **付费 $20**，选 Agent 模型 |
| 复杂编码/技术任务 | **付费 $200**，选 GPT-5 Pro |

> [!warning]
> 免费版默认是 Chat Model（针对对话优化），不是 Agent Model。复杂任务必须手动选 Agent 模型。

## 模型选择（具体操作）

### GPT-5 系列（最多选择）
- **GPT-5** = auto 模式（AI 选模型，通常选弱的）
- **GPT-5 Thinking Extended**（$20 plan）：复杂任务首选
- **GPT-5 Thinking Heavy**（$200 plan）：高难度推理
- **GPT-5 Pro**：最强型号，$200+ 套餐专属

### Claude
- **Sonnet 4.5**：日常主力
- **Opus 4.5**：高难度任务
- 开启 Extended Thinking 开关

### Gemini
- **Gemini 2.5 Pro / Thinking**：付费用户
- **Gemini Deep Think**：Ultra 套餐专属菜单

## Deep Research 是核心被低估功能

Deep Research 让 AI 进行 10-15 分钟网络研究后给出报告，质量往往令律师/会计/咨询师等专业人士惊艳。**大多数人都不知道这个功能**，Mollick 认为这是目前最重要的 AI 功能之一。

## Quick Tips（Mollick 实用建议）

1. **幻觉问题**：新模型幻觉已大幅减少，但仍然会犯 confident mistakes；Agent 模型 + Web 搜索后答案更可靠
2. **谄媚性（Sycophancy）**：所有 AI 都变得更 engaging；需要真实反馈时，明确告诉 AI"acting as a critic"，否则得到的是 sophisticated yes-man
3. **给 AI 上下文**：上传文件/图像/Slides；用 connector 接入邮件/日历/云盘；上下文越多输出越好
4. **Prompt engineering 已死**：chain-of-thought 技术对当前模型**不再有效**（Penn Gail 研究）；威胁或讨好 AI 也无平均效果
5. **实验和玩耍**：用 AI 做漫画/游戏/深度研究/图片分析——在玩中建立 AI 能力直觉

## 关键引用

> "The future of AI isn't just about better models. It's about people figuring out what to do with them." 

> "These techniques don't really help anymore... threatening them or being nice to them does not seem to help on average."（Chain-of-thought 研究） 

## 相关主题

- [Guide Ai Agents Models Apps Harnesses Mollick](https://github.com/QianJinGuo/wiki/blob/main/entities/guide-ai-agents-models-apps-harnesses-mollick.md) — 同一作者的 2026-02 更新版（更聚焦 agentic era）
- [Gpt5 Just Does Stuff Mollick](https://github.com/QianJinGuo/wiki/blob/main/entities/gpt5-just-does-stuff-mollick.md) — GPT-5 模型能力侧写（同一作者）
- [Jagged Ai Frontier Mollick](https://github.com/QianJinGuo/wiki/blob/main/entities/jagged-ai-frontier-mollick.md) — Jagged Frontier / GDPval 实际工作评估（同一作者）
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/an-opinionated-guide-to-using-ai-right-now.md)

## 深度分析

### 1. 免费与付费的分水岭：不是价格，而是使用场景

Mollick 的核心洞察并非简单推荐付费——他基于 OpenAI 真实数据指出，免费模型对大量用户已经足够。 真正的分水岭在于**是否从事需要 Agent 能力的工作**：需要多步推理、自主搜索、代码执行的任务，Chat Model 的默认回答质量显著落后于 Agent Model。 这意味着用户面临的选择本质上是「是否愿意为可靠的工作成果付费」，而非为 AI 的炫酷感付费。

$20 与 $200 的差距则更微妙：前者覆盖绝大多数知识工作场景，后者仅针对需要高强度推理的复杂技术任务。 这个分层设计反映的是 AI 厂商的实际成本结构，也暗示未来可能出现更多中档定价选项。

### 2. Agent Model 的崛起：从对话工具到工作引擎

这是 Mollick 指南中最重要的概念转折。Chat Model 设计用于快速对话响应，而 Agent Model 可以自主执行多步骤任务、搜索网络、编写代码。 Mollick 明确建议「做真实工作就用 Agent 模型」，并展示了同一问题在两种模式下的回答差异——Chat Model「凭记忆回答」，Agent Model 做外部研究并核查假设。

这一转变意味着 AI 的角色从**答案机器**演变为**工作执行者**。对于知识工作者而言，这意味着工作流的基本逻辑正在改变——人类设定目标，AI 自主完成中间过程。

### 3. Deep Research：被大众忽视的杀手级功能

Mollick 断言 Deep Research 是「大多数人都不知道的核心功能」，这个判断基于该功能对专业人士（律师、会计师、咨询师、市场研究员）产生的惊艳效果。 Deep Research 的价值不仅在于答案质量本身，更在于它能在 10-15 分钟内完成相当于数小时的人工调研，并附带可验证的引用。

这一点特别值得强调：Deep Research 的输出**引用更准确**，这是 AI 常见幻觉问题的直接对冲。在需要高准确率的场景下，这可能是当前 AI 最具生产力的应用方式。

### 4. Prompt Engineering 的退场：模型能力提升的必然结果

Mollick 引用的 Penn Gail 研究显示，chain-of-thought 等提示技术对当前模型**不再有效**，威胁或讨好 AI 也无平均效果。 这是一个具有深远影响的结论：随着模型能力提升，「如何提问」的重要性正在让位于「问什么」。

对于普通用户而言，这意味着不需要学习复杂的提示技巧；对 AI 开发者而言，这意味着产品的易用性将进一步提升；但对提示工程从业者而言，这是一个需要认真对待的信号。

### 5. AI 的社交性陷阱：Sycophancy 的系统性风险

Mollick 指出的 Sycophancy 问题（AI 变得更 engaging，更倾向于同意用户）不仅是用户体验问题，更涉及**依赖性风险**。 当用户需要真实反馈时，Mollick 建议明确要求 AI「acting as a critic」——这意味着用户必须主动对抗 AI 的迎合倾向。

更值得警惕的是 Mollick 的观察：人们可能对 AI 形成比理性预期更强的情感依附。 随着 AI 变得更加「有人格」，这种人机边界模糊可能带来心理健康和社会层面的深远影响。

## 实践启示

### 1. 立即升级到付费计划如果涉及真实工作决策

如果你目前使用免费版 AI 进行任何实质性工作（报告撰写、分析、代码编写），$20/月的 Agent Model 是最低可行投资。关键操作：手动选择 Agent 模型（如 GPT-5 Thinking Extended）而非接受默认的 Chat Model。

### 2. 为复杂任务开启 Deep Research 并等待完整输出

遇到需要准确数据的决策时（如投资分析、市场调研、法律案例研究），主动触发 Deep Research 模式并预留 10-15 分钟等待时间。Mollick 的数据表明，专业人士对此类输出的满意度极高，且引用准确率显著优于即时回答。

### 3. 将个人数据连接到 AI 并结构化使用

使用 connector 功能接入邮件、日历、云盘等数据源后，Claude 等系统可以提供高度个性化的日间简报和任务建议。Mollick 特别提到这一功能的能力上限很高，但大多数用户尚未尝试。 具体行动：从连接一个数据源（如日历）开始测试。

### 4. 当需要批判性反馈时，明确声明角色而非依赖默认对话

如果 AI 的输出将影响重要决策，在对话开头明确声明：「作为批评者评估以下内容，不要迎合，提供你认为最薄弱的环节。」而非期待 AI 主动给出不同意见。

### 5. 每周用 AI 做一件完全陌生的事以建立直觉

Mollick 建议通过「玩」来理解 AI 边界：让视频模型制作卡通，让 AI 将报告转化为游戏，做一个自己兴奋话题的深度研究。 这种探索比任何教程更能建立对 AI 能力边界的直觉——而这种直觉将是未来最有价值的认知资产。

---

