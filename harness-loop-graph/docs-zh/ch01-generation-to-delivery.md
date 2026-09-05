---
title: "第 1 章 从生成到交付：Agent 工程的诞生"
---

# 第 1 章 从生成到交付：Agent 工程的诞生

!!! abstract "学习目标"
    - 说清 2022–2026 年智能体工程的四个阶段及其各自的遗产与教训；
    - 掌握全书的中心公式 `Agent = Model + Harness`，以及它为什么成立；
    - 会算串联可靠性这笔账：为什么 95% 的单步成功率撑不起 20 步的任务；
    - 理解 vibe coding 与 agentic engineering 的真实关系——分层，而非替代。

## 1.1 四个阶段：从"会说"到"能交付"

把 2022 年以来的实践史压成一张表：

| 阶段 | 时间 | 核心想法 | 留下的遗产 | 暴露的问题 |
|------|------|---------|-----------|-----------|
| ReAct | 2022 | 推理与行动交替：模型先想一步、再调一次工具 | "模型可以调用工具"成为共识 | 单步推理，没有持续运行的循环 |
| AutoGPT | 2023 | 全自主智能体：给目标，自己拆解执行 | 激发了"AI 员工"的想象 | 无终止条件、易失控——一场著名的失败 |
| Vibe coding | 2025 初 | 沉浸在 vibe 里，忘掉代码，只看结果 | 把"生成"的门槛降到人人可用 | 无验证、无约束，原型爽、生产崩 |
| Harness / Loop / Agentic engineering | 2025–2026 | 给模型修运行系统：环境、验证、循环 | Agent 工程成为独立学科 | 编排税、验证成本、Harness 衰减（见第 13 章） |

这四个阶段不是简单的新旧替换，而是**问题重心的迁移**：从"让模型输出更好的 token"，迁到"让模型在一个系统里把事情交付出去"。

**AutoGPT 的失败值得专门记一笔**，因为它精确地定义了后来整个 Loop 工程要解决的问题：没有终止条件的自主循环就是灾难。AutoGPT 会围绕同一个目标反复重试、自我确认错误，token 烧完为止。三年后的今天，判断一个团队会不会做智能体，最快的办法仍是看它有没有回答"循环什么时候停"。

**Vibe coding 一词来自 Karpathy 2025 年 2 月的推文**（"There's a new kind of coding I call 'vibe coding', where you fully give in to the vibes… and forget that the code even exists"，库内笔记记作"2024 年底"，以推文实际时间为准）：完全沉浸在 vibe 中，忘记代码的存在，只看结果对不对。 Anthropic 研究员 Erik Schluntz 后来补了一个关键定义：只要你还在逐行审查 AI 写的代码，你就没有在 vibe coding，你只是换了个更贵的 IDE。这句话把 vibe coding 的本质点破了——**工程师的主体性从"写代码的人"迁移到"验证结果的人"**。

## 1.2 一个翻车现场：vibe 的边界

vibe coding 的局限不是理论推演，是有完整尸检报告的。2025 年，一位开发者公开复盘了自己 7 个月的失败项目：234 次提交、1690 行的"上帝对象"，其中有一个 500 行的 `Update()` 方法、110 个 switch/case 分支（库内笔记 `entities/vibe-coding-god-object-7months-failure`，Hacker News 500+ 条讨论）。

复盘里最有价值的发现是：**AI 在复现已有模式时效率极高，而这种"魔法时间"恰恰掩盖了它不理解结构背后的设计意图**。当项目从"能跑的小工具"长成"需要长期维护的生产系统"，无意图的快速堆砌必然导致熵增失控。作者重写时的关键改变发生在"第一个提示词输入之前"——先在纸上确定接口、消息类型和所有权规则。

**归因**：AI 是执行加速器，不是思考替代品。架构必须由人来定——这条教训后来被反复验证，成为 agentic engineering 的第一条公理。

腾讯后台团队的总结更直白（库内笔记 `entities/tencent-vibe-coding-to-agentic-engineering-backend`）：vibe coding 本质上是 "prompt-and-pray"——把需求扔给 AI，然后祈祷它别出错。原型验证很爽，一上生产就崩，因为生成的代码质量不可控、没有审查流程、commit message 都是乱的。**这不是 AI 能力不足，而是整个工作流缺乏结构化约束。**

## 1.3 中心公式：Agent = Model + Harness

Harness 原义是马具——缰绳、马鞍、嚼子，一整套控制马匹的装备。这个隐喻是刻意的：马对应模型，强大快速但不知道该往哪儿跑；骑手对应人类工程师，提供方向与判断；马具对应 Harness，把模型的原始能力导向有用的工作（`topics/agent-harness-deep-dive-qa`）。

> **Agent = Model + Harness。Model 决定 AI 有多聪明，Harness 决定 AI 有多可靠。**
> Harness = 环绕 AI 模型的完整控制基础设施：记忆系统、工具接口、编排逻辑、安全护栏、可观测性管道、评估回路。（`entities/harness-engineering`）

这个公式为什么成立？因为模型有三个与生俱来的工程缺陷，任何一个都不可能靠"更聪明的模型"自动消失：

| 缺陷 | 表现 | 工程后果 |
|------|------|---------|
| 概率性输出 | 同一输入，输出不确定 | 难以通过测试、无法保证 SLA |
| 短时记忆 | 上下文窗口之外的内容全部遗忘 | 跨任务状态丢失 |
| 幻觉倾向 | 可能伪造数据、捏造引用 | 不可直接接入生产系统 |

Martin Fowler 对同一件事的表述是：非确定性进了研发链路，harness 才真正开始承重（`entities/martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重`）。两种表述，一个判断：**工程的重心从模型内部移到了模型周围。**

## 1.4 串联可靠性：一道算术题

为什么单步 95% 的成功率撑不起真实任务？因为任务是一串步骤，成功率是连乘的：

$$0.95^{20} \approx 0.36$$

20 步的任务，每步 95% 可靠，端到端只剩约 36%。这就是 `topics/agent-harness-deep-dive-qa` 里总结的"串联可靠性数学"，也是长任务暴露裸模型系统性缺陷的数学本质：**即使单步表现优秀，长链路的端到端成功率也会坍缩**。反过来看，如果把每步提到 99%：

$$0.99^{20} \approx 0.82$$

每步只提高 4 个百分点，端到端成功率从 36% 提到 82%。**工程手段（验证、重试、门禁）提升的正是这个每步可靠性，而且是复利。** 这笔账解释了后面所有章节的存在意义：Harness 的每一层，都是在把单步成功率往 100% 推。

## 1.5 为什么是现在：四个结构性原因

Harness/Loop 范式在 2025 年底集中爆发，不是炒作周期，有四个结构性原因（`topics/agent-harness-deep-dive-qa`）：

1. **模型能力抬高后，系统设计成为主要差异来源。** 模型够强了，但光强没用，得给它好的工作环境才能发挥。Ben Thompson 在 Stratechery 的判断是：模型能力趋同，Harness 才是差异化。
2. **长任务暴露裸模型的系统性缺陷。** 即使最强的模型，跨多个上下文窗口运行时仍造不出生产质量应用——这些问题换更强模型不会自动消失（长任务的应对见第 9 章）。
3. **串联可靠性数学。** 见上节。这必须靠系统层验证解决，而非更聪明的模型。
4. **模型商品化。** 前沿模型核心能力差距缩小，围绕模型的系统设计成为新护城河。

时间线上有几个标志性节点：2025 年 11 月 Anthropic 发布《Effective Harnesses for Long-Running Agents》；2026 年 2 月 Mitchell Hashimoto 发博客提出"每当 Agent 犯错，就工程化一个方案让它永不再犯"，同月 OpenAI 官方博客发文《Harness Engineering》；2026 年 3 月底 Claude Code 约 50 万行 TypeScript 源码意外泄露，全行业第一次看清一个头部智能体产品的内部构成——**最值钱的部分不是模型调用，是围绕模型的那套系统**；2026 年 6 月 Boris Cherny 与 Peter Steinberger 力挺 Loop Engineering 范式。

## 1.6 行业回声：从话术到路线图

这个范式迁移已经写进了各家的产品路线图（`drafts/karpathy-2026-vibe-to-agentic-engineering`，该稿横切了库内 184 篇引用 Karpathy 的笔记）：

- **云厂商**：AWS 发布 AgentCore Managed Harness，把 microVM 隔离、MCP 工具网关、Skill 按需加载、Session 断点续跑打包成托管层；阿里云把 Harness 下沉到操作系统层级。云厂商集体承认"Agent 的护城河不在模型，在 Harness"。
- **应用团队**：腾讯后台把 Claude Code + Skill/Command/MCP 串成流水线，工程师从"亲自执行"转为"审核确认"；复旦/北大学界把这套实践打包成 Agentic Harness Engineering（AHE）正式研究方向。
- **个体工程师**：Karpathy 的"bits 与程序员价值"系列指出，亲手代码量与价值贡献不再正相关，价值向问题定义、系统判断、Agent 编排、评估验证迁移。

Karpathy 本人在 2026 年把两个词的关系说清楚了：vibe coding 是"生成范式的民主化"，解决"更快做出来"；agentic engineering 是"交付范式的工程化"，解决"做出来之后能不能可靠交付"。**两者不是替代，是分层：vibe coding 拉低了创造的下限，agentic engineering 抬高了交付的上限。** 他一边宣布 vibe coding"已死"（作为最终范式），一边在个人项目里继续示范最纯粹的 vibe coding——因为他从没说它没用，他说的是它**不够用**。

!!! note "事实 / 归因 / 实践"
    本章中，四阶段时间线、翻车案例的数据（234 次提交等）、泄露事件为**事实**（有公开记录可查）；"AI 不理解设计意图"的失败解释为**归因**（是对一份复盘的解读）；"架构必须由人来定"为**实践共识**。

## 1.7 反模式

- **把范式当站队。** "vibe coding 已死"的真义是它不够用，不是它没用。原型用 vibe，生产用工程，同一个团队两种模式并存是常态。
- **把 AutoGPT 的失败归咎于"模型太笨"。** 恰恰相反，它失败是因为没有终止条件、没有验证器——这两样今天依然是 Loop 工程的核心（第 3、4 章）。
- **认为更强的模型会取消这一切。** 模型进步确实会侵蚀部分 Harness 工件（第 13 章正面处理这个争议），但"串联可靠性数学"和"主权问题"（谁有权让 Agent 做什么）不随模型进步消失。

## 1.8 本章小结

- 智能体工程的问题重心完成了从"生成"到"交付"的迁移；四个阶段（ReAct → AutoGPT → vibe coding → agentic engineering）各留下一课。
- 中心公式 `Agent = Model + Harness`：模型的三个先天缺陷（概率性、短记忆、幻觉）决定了可靠性来自系统而非模型本身。
- 串联可靠性数学（0.95²⁰≈36%）说明为什么必须工程化地抬高每步可靠性。
- vibe coding 与 agentic engineering 是分层关系：前者管创造的下限，后者管交付的上限。

## 1.9 练习

**动手**

1. 用你手头的编码智能体做一个对照实验：同一个有 10 个以上步骤的小任务，一次直接提需求，一次先写下接口与验收标准再提。记录两者的返工次数。这道题是全书实验方法的预演。
2. 算一笔账：你的核心业务流程有多少步？按当前 Agent 单步 95%/99% 两档估算端到端成功率，判断哪一步最值得加验证。

**思辨**

1. "只要模型足够强，Harness 就是临时脚手架"——列出你能想到的这条论断最强与最弱的场景（第 2 章与第 13 章会给出一套裁决框架）。
2. AutoGPT 失败的三个直接原因（无终止条件、无验证、无预算）中，哪一个在今天的产品里依然最常见？举一个你见过的例子。

## 1.10 本章参考

- 库内：`entities/harness-engineering`（核心公式、三缺陷、爆发时间线）；`topics/agent-harness-deep-dive-qa`（马具隐喻、四结构性原因、串联可靠性数学）；`drafts/karpathy-2026-vibe-to-agentic-engineering`（范式演化主线、行业回声）；`comparisons/vibe-coding-vs-agentic-engineering`；`entities/vibe-coding-god-object-7months-failure`；`entities/tencent-vibe-coding-to-agentic-engineering-backend`。
- 公开：Anthropic《Effective Harnesses for Long-Running Agents》(2025-11)；OpenAI《Harness engineering》(2026-02)；Mitchell Hashimoto《My AI Adoption Journey》(2026-02)；Ben Thompson, Stratechery (2026-03)；Yao et al., *ReAct: Synergizing Reasoning and Acting in Language Models* (arXiv:2210.03629, 2022)；Karpathy 关于 vibe coding 的原始推文（2025-02）。
