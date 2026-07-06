# DeepSeek Code Harness

## Ch09.076 DeepSeek Code Harness

> 📊 Level ⭐⭐ | 8.4KB | `entities/deepseek-code-harness.md`

## Overview
DeepSeek 正在组建团队，从零开始构建对标 Claude Code 的代码智能体产品。核心公式：**Model + Harness = Agent**。除模型本身以外的所有工作，都属于 Harness 的范畴。官网职位描述明确："他们正在把 DeepSeek 的前沿模型能力转化为领先的 Agent 产品。"

## 背景：Claude Code 定义上限，但中国开发者被排除在外
Anthropic 官方明确禁止中国大陆访问 Claude。2025年9月更出台政策：任何由中国资本控制超过50%的公司，不管注册地在哪，都不准用。CEO 达里奥·阿莫迪本人也公开主张对中国实施技术制裁。
Claude Code 的市场表现：

- GitHub 公开提交量的 4%
- 首次采购 AI 服务的企业中，Anthropic 面对 OpenAI 正面竞争赢下约 70% 订单
- 不到一年跑出数十亿美元的年化收入
- 约 27% 的任务是开发者没有这个工具时原本不会尝试的（任务边界扩大） See also [Harness Engineering](../ch05/092-harness-engineering.md)

## DeepSeek 招聘详情
**核心团队成员：**

- **陈德里（Deli Chen）** — 北大毕业，2023年加入 DeepSeek，高级研究员，NVIDIA GTC 2024 / 乌镇峰会 2025 演讲者
- **Cui Tianyi** — 浙大毕业，Jane Street 近九年（股票/固定收益软件开发），后联合创办香港量化基金 TSY Capital
**职位要求：**
深度使用过 Claude Code、Cowork、Codex、Cursor、OpenCode、GitHub Copilot、Manus、OpenClaw、Hermes 等产品。加分项："其它超乎常人的与工作相关的才能"（DeepSeek 极客气质）

## 核心公式：Model + Harness = Agent
DeepSeek 对 Harness 的定位：除模型本身以外的所有工作，都属于 Harness 的范畴。
> "真正的护城河在外围：权限控制、上下文压缩、MCP 工具、插件、Skills、Hooks、Subagent 调度、会话存储和安全策略。它把一个简单循环包成了可控、可扩展、可长时间运行的工程系统。"

## 关键数据：Harness 的决定性作用
**CORE-Bench Hard：**

- Claude Opus 4.5 + Claude Code Harness: **95%**
- 同样模型 + Hugging Face Smolagents 朴素配置: **42%**
- 同一模型，单是 Harness 差距：**53 个百分点**
**Terminal Bench：** 头部清一色用 Claude Opus 4.6，大家拼的已经不是模型，而是谁的 Harness 更好。

## Anthropic 模型+Harness 共同演化编年史
| 时间 | 模型 | Harness 更新 |
|------|------|------|
| ~2024 | Sonnet 3.5 | 第一次展现编码+自验证+迭代潜力（Claude Code 前奏） |
| 2025-02 | Sonnet 3.7 + Claude Code 研究预览版 | Claude Code 目标：收集开发者真实使用数据反哺模型训练 |
| 2025-05 | Opus 4 + Sonnet 4 + Claude Code 正式 GA + SDK 开放 | SDK 开放，Harness 被公开 |
| ~2025 | Sonnet 4.5 | 加入 Checkpoints（回退机制），运行时长推到约 30 小时 |
| 2025 | Opus 4.5 + Sonnet 4.5 | Opus 做规划、Sonnet 做执行分工；Skills 渐进式披露补上下文窗口 |
| 2026 | Opus 4.6 + Sonnet 4.6 | Sonnet 4.6 成主力编码模型；Opus 4.6 "非常 agentic"，极简 Harness 下稳定运行时长从约 4 小时跳到 12 小时；推出 agent teams、server-side compaction、100万上下文窗口 |
**Anthropic 总结规律：** "找到模型里的缺口，用 Harness 补上，再用 Harness 的数据去训练模型——到某个时间点，那部分 Harness 可能就不再需要了，然后循环继续。"

## 长时运行能力：区分"会写代码"和"能完成任务"
**关键差距：** 短任务一次生成即可；真实工程任务是持续的"修改→测试→出错→再修改"循环，可能持续几十分钟甚至数小时。

- 只能稳定跑几分钟的 Agent：本质仍是代码助手
- 能跑几小时甚至几天的 Agent：开始像真正的工程代理
**长时运行难点：**

- 上下文窗口有限且越跑越乱
- 模型规划能力弱容易半途而废
- 模型总高估自己的完成度（半成品却说"好了"）
**解决路径：**
1. 模型能力直接烘焙进权重（Opus 3.7→4.6，稳定完成50%任务的运行时长从约1小时→12小时）
2. Harness 外层优化（模型外面的脚手架）

## DeepSeek 的机会与挑战
**机会：**

- 模型价格优势 + 自建 Harness → 挑战 Claude Code 完整体验
- AI 编程下一阶段：不是单点模型竞争，也不是单点工具竞争，而是模型能力、Harness 设计、运行成本和开发者入口的组合竞争
**挑战：**

- 真正难的是建立长时运行闭环：让模型在真实代码库里工作 → 记录失败路径 → 用户修正 → 变成下一轮产品/工具/模型训练的输入
- 如果 DeepSeek 只做模型，永远被包在别人的工具里
- 只有跑通模型+Harness 共同演化循环，才有机会长出自己的 Claude Code

## Harness 正在成为新市场
各家对 Harness 层的商业化态度：

- **Anthropic**：托管运行时单独计费，按会话小时收费
- **Google/Microsoft**：把会话、内存、代码执行、工具调用拆成平台消费项
- **OpenAI**：Agents SDK 开源，不额外收第一方运行时费用，只对模型和工具调用收费
> "Model + Harness = Agent，正在成为行业共识。控制层不再只是模型的附属品，而是一个独立的产品维度。"

## 深度分析
### 1. 为什么 2026 年 Harness 站到台前
AI 行业关注点的迁移路径：

- 2022：权重、微调、RLHF
- 2023：上下文、RAG、长上下文
- 2024：工具调用、MCP
- 2026：**Harness**（最外层）
任务复杂度升级：从"给段评论判断情绪（几十个token）"到"看完整个代码库找bug写补丁跑测试验证（可能消耗上千万token、持续数十分钟、数百次工具调用）"。

### 2. 中国市场的特殊机会窗口
Claude Code 越强，缺口越大。灰色渠道扩大的背后是刚性需求。DeepSeek 的出现恰好填补这个空白——不是"做一个更好的工具"，而是"没有别的选择"。

### 3. 飞轮效应
Claude Code 每一次真实使用都在收集问题/失败轨迹/用户修正，反哺模型训练。模型越强 → Harness 越顺手 → 使用越多 → 模型进步越快。DeepSeek 如果能建立同等飞轮，就不只是对标，而是真正竞争。

## 实践启示
1. **Harness 是独立的产品维度** — Model + Harness = Agent，控制层不是模型的附属品
2. **选型要看真实代码库表现** — CORE-Bench / Terminal Bench 数据，同模型不同 Harness 差距可达 53pp
3. **长时运行能力是分水岭** — 能跑几小时的 Agent 才是真正的工程代理，否则仍是代码助手
4. **中国市场特殊窗口** — Anthropic 禁令创造的需求缺口，有技术能力的团队可以填补

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/coding-agent-practice.md)

---

