# Decisions and Dollars

> 📊 Level ⭐⭐⭐ | 10.1KB

> **Background**：Nikunj Kothari 基于 Cloudflare agent traffic 超越 human traffic 的事实、Cursor $60B 收购案、以及 Harvey/Legora/Rogo 等垂直 AI 公司的实践，系统分析了 AI 应用公司在 agent 经济时代的商业模式转型逻辑。

## 核心论点

Agent 正在成为软件的主要用户。Cloudflare 数据显示 agent traffic 已超过 human traffic。当一千名员工运行十万 agent 时，per-seat 定价彻底失效。Agent 留下两样值得计量的东西：**决策**（数据）和**资金流动**（金融科技）。

## Context -> Harness -> Judgment 三层演化

知识从人转移到模型经历了三个阶段：

1. **Context（上下文）**：检索增强，将正确信息放在模型面前 — 已成 table stakes
2. **Harness（工程框架）**：模型运行的脚手架和循环结构
3. **Judgment（判断力）**：每次调用和纠正留下的决策记录 — 唯一能持续累积价值的层

Context 已被所有竞争对手以相同方式组装。Judgment 才是真正的护城河。

## Cursor $60B 收购案的数据护城河逻辑

xAI 以 $60B 收购 Cursor 的核心原因不是软件本身，而是**百万开发者使用模型的决策记录**（accept/reject/rewrite 的 diff 数据）。Cursor 的产品赢在品味（taste），但数据成为其主要护城河。Cursor 现在基于这些 diff 训练自己的模型。

## 纠正即数据（Corrections as Scorecard）

用户对模型输出的每次修正都记录了"在你的业务中什么是对的"。这个记分卡做两件事：
- **训练信号**：将租用的模型调优到你的业务
- **测试集**：衡量 agent 是否真正进步的唯一方式（没有公开 benchmark 衡量你的工作流）

Fine-tuning 和 RL 成本已低到 B 轮公司就能运行这个循环。

## 垂直 AI 公司的实践

- **Harvey**（$11B）和 **Legora**（>$5B）：法律领域，律师对草稿的编辑是独有的 judgment 数据
- **Rogo**：金融领域，捕获分析师构建模型和修改备忘录的过程
- **Toast**：餐厅本质是带厨房的支付处理器，payments 收入远超软件
- **Ramp**：免费企业卡 + 每美元抽成一两美分 -> $32B 公司

这些公司都没训练 foundation model，而是围绕租用的模型构建 harness，保留了流经其中的 judgment。

## 实验室购买 Judgment 的趋势

- **Mercor**（$10B）：付专家 $85/hr 做 human-labeled data
- **Meta**（$14B for Scale）：拥有标注流水线
- 多家 RL 环境公司已达到数亿 ARR，出售长时间跨度任务的 judgment

实验室在全互联网训练数据耗尽后，开始直接购买决策数据。

## 与现有实体的差异化

| 维度 | 本文（Nikunj Kothari） | Stripe Agent 经济基础设施 | Token 经济学与 AI 效率 |
|------|----------------------|------------------------|---------------------|
| 主轴 | 应用公司必须成为数据+金融科技公司 | Stripe 5 套支付产品图谱 | Token 效率和推理优化 |
| 核心框架 | Context->Harness->Judgment 三层演化 | MPP + Link + Projects + Metronome + Radar | 模型路由和成本优化 |
| 案例 | Cursor $60B, Harvey, Ramp, Toast | Stripe 内部产品线 | 推理效率比 |
| 独特洞察 | 纠正即数据、数据护城河 vs token markup 无护城河 | 机器支付协议细节 | Token 计量经济学 |

## 三个独有贡献（不应合并到现有 entity）

1. **Context -> Harness -> Judgment 三层演化框架** — 描述了知识从人转移到模型的三个阶段，Judgment 是唯一累积层
2. **Cursor $60B 收购的数据护城河分析** — 不是为软件付费，是为百万开发者的决策 diff 数据付费
3. **纠正即数据（Corrections as Scorecard）** — 用户修正既是训练信号也是测试集，这个双功能洞察在现有实体中未出现

## 深度分析

### Agent 经济学论题：决策与资金流的双重计量

原文的核心论题建立在一个可观测事实之上：Cloudflare 报告 agent traffic 已超过 human traffic，且这一趋势不可逆。当一千名员工运行十万 agent 时，per-seat 定价在算术上就崩溃了——10 万个"座位"不可能由 1 千人付费。应用公司因此必须回答"还能对什么收费"，而 agent 留下的只有两样可计量的东西：它做的**决策**（数据生意）和它移动的**资金**（金融科技生意）。这不是产品建议，而是商业模式层面的二选一（理想情况下两者都做）。原文还给出了一个反面教材：23andMe 手握 1500 万人的 DNA 数据仍然破产——**如果资金不流经你的数据，你只是在养一个科学项目**。数据必须与资金流绑定才构成生意。

### Cursor $60B 的数据护城河逻辑

xAI 收购 Cursor 的定价逻辑值得逐层拆解：

- **表面**：Cursor 约 $4B 年化收入，软件本身不支撑 $60B 估值
- **真实动机**：百万开发者 accept/reject/rewrite 的 diff 数据——Anthropic 和 OpenAI 已经通过 Claude Code 和 Codex 实时观察开发者，Cursor 是 xAI 进入 token 流的最快通道
- **价格本质**：$60B 是跳过"花数年慢速收集数据"的过路费，Musk 明言这些决策记录将直接进入 Grok 的训练
- **产品 vs 数据**：Cursor 早期被数周内复制出来的克隆品围攻，但克隆品复制了界面却继承不了品味（taste）——那千次关于"何时浮现、何时消失"的小决定。产品赢在 taste，**数据成为主要护城河**

### 纠正即记分卡：双功能数据飞轮

每次用户修正模型输出，都记录了"在你的业务中什么是对的"。这个记分卡有两个其他任何东西都无法替代的功能：

1. **训练信号**：把租来的模型调优到你的业务——Cursor 的自研模型 reportedly 建在开源底座之上，diff 才是差异化所在
2. **测试集**：没有公开 benchmark 衡量你的工作流，修正记录是判断 agent 是否真正进步的唯一方式

Sarah Guo 把这类领域称为 **the untrainable**（无法从外部评分正确性的工作）——而修正记录正是你占有它的方式。飞轮的关键在于成本端：fine-tuning 和 RL 已经便宜到 B 轮公司就能跑通这个循环，两年前这需要一个实验室。

### 垂直 AI 的积累 vs 实验室购买判断力

两类玩家在同一个战场上做相反方向的运动。垂直 AI 公司（Harvey $11B、Legora >$5B、Rogo）**围绕租来的模型构建 harness，保留流经其中的 judgment**——律师对草稿的编辑、分析师改模型和备忘录的过程，这些修正没有别人能看到。在位产品同样如此：Figma 拥有设计从 v1 到 v47 的完整历史（品味的评分记录），Linear 拥有每个已关闭 ticket 背后的论证，Notion 拥有团队思维在千次编辑中的形状——竞争者无法导出它们。与此同时，实验室在全互联网训练数据耗尽后开始**直接购买决策**：Mercor（$10B）付专家 $85/hr 做标注，Meta 花 $14B 买 Scale 拿下标注流水线，多家 RL 环境公司以数亿 ARR 出售长时程任务的 judgment。一条铁律贯穿其中：**token markup 不是护城河**——某 vibe-coding 应用在推理成本上加价 50% 毛利，那只是转售，不是积累。

## 实践启示

1. **两条腿走路：决策计量 + 资金计量。** 纯数据没有资金流是科学项目（23andMe），纯资金流没有数据是通道生意。Toast（payments 收入远超软件）和 Ramp（免费卡 + 每美元抽一两美分 -> $32B）证明了金融科技这半边，Cursor 证明了数据那半边——理想的公司是两者叠加。
2. **把"修正"当一等公民持久化。** 不要只存模型输出，要存 accept/reject/rewrite 的完整 diff。这是你的训练信号兼测试集，是竞品拿不到的唯一数据。设计产品时让修正动作尽可能低成本、可结构化。
3. **别把 context 图谱当护城河。** 每个竞争对手都在以相同方式组装 context——它已是 table stakes。评估自己公司时，问"哪一层是唯一在累积的"：答案必须是 judgment，否则融资故事站不住。
4. **租模型、建 harness、留 judgment。** 不要训练 foundation model——Harvey、Legora、Rogo 都没有。fine-tuning + RL 在 frontier 模型之上已便宜到 B 轮可承受，把资本花在数据捕获面上而不是预训练上。
5. **平台/基础设施方：per-seat 定价尽快迁移。** Agent 成为软件主要用户后按人头计费即失效；按决策次数、token 流量或资金流过桥计费（Stripe 的 agent 支付产品线即此逻辑）才能对齐价值。
6. **警惕 token markup 型收入。** 若毛利主要来自推理转售加价，一旦基础模型降价或被开源替代，收入瞬间蒸发。检验标准：模型换掉后，你的数据积累是否仍然属于你。

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

