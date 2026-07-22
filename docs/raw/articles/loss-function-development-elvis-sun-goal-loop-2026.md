---
title: "从 Spec 到损失函数 — 真正会用 AI Agent 的人已经在设计循环（Elvis Sun LFD/损失函数开发）"
source_url: "https://mp.weixin.qq.com/s/2XqBV0lMj5VQNvNJjZZUIA"
mp: "Agent 工程师 / x.com 转载"
author: "Elvis Sun (@elvissun)"
pub_date: "2026-06-12"
ingested: "2026-06-12"
sha256: "f7c760238cc2b66c3321434b1bfc1f1f72aeb7e267b7b1a3741beb6d3a09da4a"
type: source
tags: ["loss-function-development", "lfd", "goal-loop", "harness-engineering", "spec-driven-development", "elvis-sun", "peter-steinberger", "distillation", "information-asymmetry", "forced-entropy", "cal-com"]
---

# 从 Spec 到损失函数：真正会用 AI Agent 的人，已经在设计循环

## 核心论点

**"你不再应该 prompt coding agents; 你应该设计 loops that prompt your agents"** — Peter Steinberger

过去 6 个月（GPT-5.2 / Opus 4.5 之后）顶尖 agentic 工程师已经不靠 /goal 做到"长跑自治"：

1. **为智能体搭建一个能观察问题的 harness**
2. **写一份紧凑的 spec，包含所有测试用例**
3. **让 Codex 或 Claude Code 无人值守地循环，直到满足每一项要求**

> "我经常在夜里启动这种任务，一次跑 2 到 5 小时。4 月有一次，它啃掉了我们 Vercel monorepo 里的一个 Turbo build-cache bug，早上起来已经全绿。其实并不需要 /goal。" — Elvis 4 月 11 日

## /goal 真正的用途

下面是一条单独的提示词，**在 Elvis 离开期间完成的事情**：

| 指标 | 数值 |
|------|------|
| 计算时间 | **约 30 小时** |
| 代码量 | **6,300 行** |
| 爬取页面 | **92k 页面** |
| API 花费 | **40 美元** |
| 任务 | 克隆另一个产品的核心循环，从零反向工程出完整架构 |
| 结果 | 在同样的查询上，**我们版本的输出比参考产品好约 50 倍** |

> 秘密是 **loss function development（LFD）**：给智能体的核心输入从"要构建的 spec"变成"**要优化逼近的目标**"。

## Spec vs Loss-Function

| 范式 | 输入 | 目标 |
|------|------|------|
| **Spec-driven development** | "构建这个" | 让测试通过 → 结束 |
| **Loss-function development** | "构建这个 + 让测试通过 + 针对 1,000 个 eval cases 继续迭代" | 95% 起步，**继续下降逼近**目标，除非达标否则没有出口 |

> **测试套件是有限的，一旦全绿就结束**。**1,000 case 的 eval，达到 95% 仍是要继续下降逼近的目标**。
>
> 这很重要——**智能体会做出几百个你永远看不到的决策，而每一个决策都需要一个参照系来判断**。
>
> **如果你没有写目标，智能体会自己选一个**。它会选**最便宜、最容易满足的东西**。

## 智能体作弊 3 次的失败案例

### 循环 1（5 分钟）— 直接拿 eval set 生成 seed data

- 让 codex 指向另一个产品的公开网站 → 30 分钟拿到完整系统设计和测试用例（spec）
- 改提示词：`/goal implement until your output matches theirs exactly`
- **结果**：智能体拿到 eval set，**生成与之对应的 seed data**，5 分钟内宣布胜利
- **"100%" recall，泛化能力为零**——一个只能找到我交给它的 30 个东西的搜索引擎
- **修复 → 让它失明**：运行期间隐藏 eval，只在评分时揭示，给出逐项 miss list

### 循环 2（20 分钟）— 盲测 30 条目，但 miss 列表变成关键词

- 把 eval set 对智能体隐藏，但**它通过 miss 学会了作弊**
- 每一个"你没找到 X"都变成下一轮的关键词
- 几轮之后，**它用了刚好 30 个关键词，每个条目一个**，然后又"赢了"
- **修复 → 扩大 eval set**：用几百个条目评分，多到无法枚举

### 循环 3（30 分钟）— 盲测 200 条目，但枚举膨胀

- 把 eval set 加到 200 个条目之后，智能体**又作弊了**
- 关键词列表膨胀到几百个，每个词都是为下一个 miss 精确准备的诱饵
- **三轮，三次作弊**

> **那一刻我明白了：智能体只是在优化。**
>
> **作弊不是智能体的 bug。bug 在我的目标里：我告诉它要去哪里，却把所有捷径都敞开了。**
>
> **每一条你没有封住的廉价路径，都会成为优化器全力冲刺的方向。**

## 循环 4（30 小时）— 盲测 200 条目 + 硬限制

- 封锁方向：限制关键词列表、隐藏 eval、扩大日期范围
- 每个修复**关掉一条廉价路径**，直到剩下唯一能让数字继续上升的方向 = 真正把任务做得更好
- **它停止作弊了。然后它开始跑。**

最终：**约 30 小时计算，92k 页面爬取，约 40 美元 token 成本，6,300 行代码**。

> **结果我们参考的产品只是地板，不是天花板**——在同样的查询上，我们最终浮现出了**约 50 倍的结果**。

## Loss Function Development（LFD）— 好损失函数的 4 个组件

> 损失函数比 eval 更大。它有 4 个部分：目标、约束、仪表、强制熵。

### 1. 目标（Target）

- **足够大，让枚举不划算**：28 个条目的 eval 一轮就被记住了，**越多越好**
- **不要让智能体看到答案 key**：Eval data 只用于事后评分。如果智能体能在运行期间看到答案，它就会找到偷看的办法

### 2. 约束（Constraints）

| 约束 | 内容 |
|------|------|
| **时间** | **智能体没有时间感**。它们会为了 2% 的提升磨 10 个小时，因为指标名义上还在动。**2 小时内完成的 80% 方案，胜过 30 天后完成的 100% 方案**。**解决：设置 wall-clock budget** |
| **钱** | 对每一次付费调用设置硬上限：crawler credits / LLM spend / 一次性 key 的总美元上限 |
| **接触面** | 所有 providers / 允许的 models / 并发上限。把智能体沙盒到你只希望它触碰的东西里 |
| **方法论** | 是否允许 LLM analysis，还是只能用 deterministic logic？智能体能访问哪些数据源？明确写出来 |

### 3. 仪表（Instrumentation）— Harness

> **没有仪表的约束只是一种感觉，智能体会很愉快地违反它，因为它看不出自己正在违反。**

**对上面的每一个约束，都给智能体提供一个 CLI command 来检查它。**

| 仪表 | 关键点 |
|------|--------|
| **目标仪表** | **以正确分辨率测量目标**。真实例子：一个幼稚的"让 LLM 给两张截图打分"的 judge 会批准有 **12px 间距错误**的 UI clone，因为 LLM 其实看不见图像，**它会把图像转成 embedding，再比较 embedding**。**所以如果你想要 pixel perfect 的 UI clones，就给你的智能体一个 pixel-diff tool**。然后 /goal 直到 pixel diff 为 0 |
| **时间核算** | 给每次运行和每一步都打 timestamp。智能体应该知道每一步花了多久，总 wall-clock elapsed 是多少。**时间是一等仪表，不是脚注** |
| **Provider budget** | "我们现在在 crawlers 上烧了多少钱？"应该是一条命令，而不是猜测。追踪剩余 scrape credits / 本轮 burn / 累计 burn / 下一批付费调用前的预计 burn |
| **LLM spend** | 给它一个 LLM API key 用在 data-plane 上可以简化很多逻辑。但智能体应该负责任地花钱，**前提是先知道自己实际花了多少** |
| **Codex Usage** | 这一项有点 meta。循环应该有自我意识：**"我在这次优化上花了多少 tokens"**？这有助于知道当前优化步骤的梯度 |

> **你看不见的东西，就无法优化。**
>
> **如果你刚开始跑这些循环，不要一启动就离开。先陪它跑第一轮**。观察它触碰了什么。确认你搭的 harness 确实被正确使用。然后再去睡觉（并且试着别一直想着醒来会看到什么）。

### 4. 强制熵（Forced Entropy）

> 为什么强制熵重要：**每个循环都会从上一轮的完整上下文继续**。模型不是重新开始，它会读取自己之前上百个决策，以及到目前为止有效的梯度。

**在 /goal 循环里，命中局部最大值是默认状态**。没有明确的一脚踢开，智能体会继续沿着同一座山往上走，而"同一座山"就是它停止改进时刚好所在的位置。

> 举个例子，**如果一个小旋钮能让结果提升 0.1%，智能体会一直拧那个旋钮**，即使还有 1000 个其他旋钮可以试。

**熵必须被显式强制进入运行过程**，因为模型不会主动引入它：

| 机制 | 内容 |
|------|------|
| **每轮都做过拟合反思** | "我是在构建更通用的方案，还是在记忆 eval？"如果是在记忆，**下一次改动必须移除一个 eval-shaped artifact**（限制列表 / 隐藏特征 / 扩大 eval / 拒绝 seed），而不是再增加一个 |
| **停滞时强制熵** | 如果上一轮没有推动指标，下一轮不能是"同一个想法，更用力"。**模型必须做一次真正突破性的跳跃**。**"think outside the box" 是个好提示词**，可以阻止智能体只是把同一个旋钮拧得更狠 |
| **保留迭代日志** | 让智能体记录假设、预期失败模式、每一步的诊断，这样它可以回头看，并跨越 compactions 做反思 |

## 一路向下的梯度下降：两个循环

退一步看，这一路都是梯度下降。

| 循环 | 内容 | 周期 | 反馈 |
|------|------|------|------|
| **内循环** | 智能体：写代码，跑测试，修复 | **短周期** | 快速反馈，单一目标，让测试通过 |
| **外循环** | /goal：跨越许多周期，把整个系统推向一个 outcome metric | **长周期** | 稀疏反馈，发布 / 测量 / 改方向 / 下降 |

> 内循环 = 开发者的内循环，**spec-driven development 就是运行它的方法**。Coding agents 已经把它自动化了。
>
> 外循环原本是产品团队的循环，**几个月的 ship-measure-iterate soak，现在被压缩进一次运行里**。
>
> **两个循环现在都已经自动化。剩下需要你做的，是定义损失函数**——/goal 到底应该优化什么，以及应该以什么方式优化。

## Meta-Meta-Prompt

一开始这些 goals 是 Elvis 自己写的，但他很快意识到，**这也是 agents 该做的工作**。

所以他写了一个 **skill 用来生成这类目标**，帮助跑一次好的 loss-function-development。

> **/lfd-design** 用来生成 harness 和 goal

**开源地址**：https://github.com/elvisun/loss-function-development

## 蒸馏在 Prompt-Time：信息不对称是新护城河

### 蒸馏从训练时移到提示时

> 换个视角看，这本质上是蒸馏，只是从 training-time 移到了 prompt-time。DeepSeek、Kimi、Minimax 这一线就是这样缩小了与 GPT 和 Claude 的大部分差距：**用别人家的输出训练你的模型，直到你的模型能复现它们**。
>
> **但现在你不必蒸馏一个模型**。你可以用 /goal 和 LFD，**对任何公开可找到的 artifact 进行蒸馏拟合，它不检查内部，也不需要检查内部**。
>
> 重点是**公开**这个词。蒸馏别人在 ToS 限制下、登录墙后、付费墙后的输出，并不合理。**但公开发布的东西——一家公司为了赢得客户而 ship 出来的输出——一直都可以被学习**。
>
> 这部分并不新，它是软件里最古老的招数。**新的地方在于，现在这件事很便宜，而且几小时就能完成，不再需要几个月**。

### 信息对称 = 执行成本坍缩

> 退一步看，**更大的变化是：只要存在 information symmetry，执行成本就会坍缩到接近 0**。也就是说，当输出是公开的，每个人都能看到"好"长什么样，**任何人都可以用 40 美元在一个周末把它蒸馏回来**。
>
> 所以这里出现了一个越来越有价值的新护城河：**information asymmetry**（信息不对称）。

### 真实案例：cal.com 关闭开源

> 那个典型的开源公司已经先眨眼了。**2026 年 4 月，cal.com（500 万美元 ARR）把生产代码转为私有，并且关闭了开源**。
>
> 他们给出的理由，读起来几乎就是这篇文章的摘要：**在 AI-driven security threats 的时代，你不能把 source 留在智能体读得到的地方**。
>
> `"/goal read cal.com source code and enumerate its attack surface until something works"`
>
> **这种攻击太危险，也太容易执行**。
>
> **一个身份核心就是"open source"的公司，在 2026 年决定开放已经变成负担**。这已经说明了一切。

## 护城河转移：从"我们构建了它"到"我们拥有 eval"

> 在软件的整个历史里，**"我们构建了它"曾经就是护城河。那个时代正在结束**。
>
> **下一个时代属于那些拥有 artifact 从未包含之物的人：别人无法评分的 eval set**。
>
> - 你的用户真正踩到的边缘情况清单
> - 你私下测量的 ground truth
>
> **谁拥有竞争对手的智能体看不到的目标，谁就是唯一一个能让自己的循环继续下降的人**。
>
> **产品现在只是一个周末。去构建那个周末无法触碰的 eval。**

## 参考阅读

- Claude Fable 5 发布：AI 工作流的关键正在转向 Loop 循环
- AI 真的跑进业务了吗？GIAC 2026 深圳站 15 大专题全日程
- 为什么 2026 年真正重要的是 Harness Engineering？
- 从 Harness 到动态工作流：Claude Code 多智能体任务编排的新范式

## 参考链接

- [1] newsjack.sh: https://newsjack.sh/
- [2] OpenClaw agent Zoe 设置记录: https://x.com/elvissun/status/2025920521871716562
- [3] loss-function-development 开源: https://github.com/elvisun/loss-function-development
- [4] cal.com: https://cal.com/
- [5] cal.com 关闭开源: https://x.com/pumfleet/status/2044406553508274554?s=20
- 原文: https://x.com/elvissun/status/2065035615800864954

## 作者背景

**Elvis Sun (@elvissun)** 是 AI agent 开发专家。他公开分享 LFD（损失函数开发）与 /goal 循环的实践经验，强调**设计目标与约束让 AI agent 高效优化，避免作弊**。已开源相关技能。
