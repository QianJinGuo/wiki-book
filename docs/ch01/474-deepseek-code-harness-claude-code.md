# DeepSeek Code Harness：对标 Claude Code 的中国方案

## Ch01.474 DeepSeek Code Harness：对标 Claude Code 的中国方案

> 📊 Level ⭐⭐ | 8.5KB | `entities/deepseek-code-harness-competitor-tina.md`

# DeepSeek Code Harness：对标 Claude Code 的中国方案

## 摘要

Claude Code 定义了当前 AI 编程工具的上限，但它不对中国开发者开放。这个缺口就是 DeepSeek 的机会。2026 年 5 月，DeepSeek 公开组建 Harness 团队，从零开始构建对标 Claude Code 的代码智能体产品。本文（作者 Tina）深度分析了这一战略选择的技术背景、行业逻辑和竞争格局，核心命题是：**Model + Harness = Agent**——只做模型远远不够，必须掌握 Harness 工程能力。

## 核心要点

### DeepSeek 公开招兵买马

2026 年 5 月中下旬，DeepSeek 在官网、小红书、X 三个平台同步放出招聘信息，目标是组建全新的 Harness 团队。官网发布的「Agent Harness 产品经理」和「Agent Harness 研发工程师」职位，开头写着醒目的公式：**Model + Harness = Agent**。团队定义很清楚：把 DeepSeek 的前沿模型能力转化为领先的 Agent 产品，除模型本身以外的所有工作都属于 Harness 范畴。

关键招聘细节：
- 小红书上「陈小礼」直言：「简单来说就是对标 Claude Code，做 DeepSeek Code Harness」
- 高级研究员陈德里（Deli Chen）在 X 上发布招聘推文，获得超 30 万次浏览、1600+ 点赞
- 职位要求候选人深度使用过 Claude Code、Cowork、Codex、Cursor、OpenCode、GitHub Copilot、Manus、OpenClaw、Hermes 等产品
- 加分项写着「其它超乎常人的与工作相关的才能」——极客气质
- 已招揽曾在 Jane Street 工作多年的工程师 Cui Tianyi 加入团队

### Anthropic 的垄断与封锁

Anthropic 在企业 AI 采用率上已超越 OpenAI：过去一年客户增长接近四倍，首次采购 AI 服务的企业中约 70% 选择 Anthropic。Claude Code 推出预览版不到一年就跑出数十亿美元年化收入，占 GitHub 公开提交量的 4%，日活用户一个月内翻倍。

然而 Anthropic 官方明确禁止中国大陆访问，2025 年 9 月更出台政策：任何由中国资本控制超 50% 的公司，不管注册地在哪都不准用。CEO 达里奥·阿莫迪公开主张对中国实施技术制裁。结果是：全球最好的 AI 编程产品之一正在重新定义软件开发，而中国开发者连正式使用的资格都没有。尽管封禁存在，灰色渠道仍在扩大——Claude Code 越强，缺口越大。

### Harness 为什么成了必争之地

同一个模型换一套 Harness，结果可能完全不同。Claude Opus 4.5 在 Claude Code 的 Harness 下，CORE-Bench Hard 达到 95%；换成朴素的 Hugging Face Smolagents 配置只剩 42%——同样的权重，Harness 拉开 53 个百分点。Terminal Bench 上头部清一色用 Claude Opus 4.6，拼的已经不是模型，而是谁的 Harness 更好。

AI 行业的关注点一直在往模型外层移动：
- 2022 年：权重、微调、RLHF
- 2023 年：上下文、RAG、长上下文
- 2024 年：工具调用、MCP
- 2026 年：**Harness**

现代 coding agent 面对的任务已完全不同：看完整个代码库、找到 bug、写补丁、跑测试、验证结果——一次任务消耗上千万 token、持续几十分钟、数百次工具调用。Harness 负责组织代码库、项目规则、上下文摘要；控制迭代次数、重试策略和任务边界；把模型决策转成 shell 命令、文件编辑和测试执行，再把反馈重新喂回模型。

### 模型与 Harness 共同演化

Claude Code 的演进史说明模型和 Harness 从来不是两条分开的线：

| 时间 | 模型 | Harness 变化 | 稳定运行时长 |
|------|------|-------------|-------------|
| Sonnet 3.5 | 首次展现编码潜力 | Artifacts 中自验证构建 | 秒级 |
| Sonnet 3.7 | 发布 | Claude Code 研究预览版发布 | 分钟级 |
| Opus 4 / Sonnet 4 | 上下文管理提升 | Claude Code GA + SDK 开放 | 数十分钟 |
| Sonnet 4.5 | 上下文感知但不稳定 | Checkpoints（回退机制）| ~30 小时 |
| Haiku 4.5 + Opus 4.5 | 模型分化 | Opus 规划 + Sonnet 执行分工；Skills 渐进式披露 | — |
| Opus 4.6 + Sonnet 4.6 | Opus 级智能 + 更低价 | Agent teams、server-side compaction、100万上下文 | ~12 小时 |

Anthropic 的总结：「找到模型里的缺口，用 Harness 补上，再用 Harness 的数据去训练模型——到某个时间点，那部分 Harness 可能就不再需要了，然后循环继续。」

### Harness 的商业化格局

各家都承认这层很重要，分歧在于它应该是什么：
- **Anthropic**：托管运行时单独计费，按会话小时收费
- **Google/Microsoft**：会话、内存、代码执行、工具调用拆成平台消费项
- **OpenAI**：Agents SDK 开源，不额外收运行时费用，只对模型和工具调用收费

## 深度分析

### DeepSeek 的战略逻辑

DeepSeek 做 Harness 的逻辑不是「我们要做一个更好的工具」，而是「我们没有别的选择」。Anthropic 的封锁创造了一个明确的市场真空。但 DeepSeek 面临的真正挑战不是做出一个 Claude Code 的外壳，而是建立自己的**长时运行闭环**：让模型在真实代码库里工作，让 Harness 记录失败、分析原因，把失败变成下一轮产品设计和模型训练的输入。

### 从 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 视角看

DeepSeek 的公式 Model + Harness = Agent 是对 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 理念的商业化表达。核心挑战在于：
1. **上下文压缩**：长时运行必须解决上下文窗口有限且越跑越乱的问题
2. **任务边界控制**：模型总高估自己的完成度——明明半成品却说「好了」
3. **失败路径学习**：Harness 的真正价值不在于让模型成功，而在于系统化地学习失败

### 与 [Claude Code 内部机制](ch03/074-claude-code.md) 的对比

Claude Code 的核心是一个 loop：调用模型 → 运行工具 → 拿到反馈 → 继续调用。真正的护城河在外围：权限控制、上下文压缩、MCP 工具、插件、Skills、Hooks、Subagent 调度、会话存储和安全策略。DeepSeek 需要在每个环节建立自己的工程积累，这不可能通过简单复制完成。

### 飞轮效应的竞争壁垒

Anthropic 已经建立了一个正向飞轮：模型越强 → Harness 越顺手 → 使用越多 → 失败数据越丰富 → 模型进步越快。DeepSeek 要打破这个飞轮，需要在以下维度建立差异化：
- 价格优势（DeepSeek 模型已具成本优势）
- 本地化适配（中文代码注释、国内开发工具链）
- 开源社区生态（DeepSeek 已有开源基因）

## 实践启示

1. **关注 DeepSeek Harness 的进展**：作为中国开发者唯一可合法使用的前沿 coding agent 替代方案，其产品成熟度将直接影响国内 AI 编程生态
2. **理解 Harness 的价值**：不论使用哪家产品，Harness 设计质量是 AI 编程效果的最大变量——比模型选择更重要
3. **模型 + Harness 共同演化的思维**：不要期待一个模型版本解决所有问题，关注模型与脚手架的协同迭代
4. **长时运行是关键能力区分**：会写代码 vs 能完成任务的分界线在于运行时长，评估 AI 编程工具时关注其长时间运行的稳定性

## 相关实体

- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](ch11/209-openclaw.md)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](ch11/209-openclaw.md)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](ch03/044-agent.md)
- [两万字详解Claude Code源码核心机制](ch03/074-claude-code.md)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](ch03/074-claude-code.md)
- [构建基于多智能体架构的深度思考交易系统 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/构建基于多智能体架构的深度思考交易系统-v2.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/deepseek-code-harness-competitor-tina.md)

---

