# Decisions and Dollars

## Ch01.648 Decisions and Dollars

> 📊 Level ⭐⭐ | 5.0KB | `entities/decisions-and-dollars-agent-economics-data-fintech.md`

## Decisions and Dollars

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

---

