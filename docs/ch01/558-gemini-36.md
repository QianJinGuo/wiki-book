# 突发gemini-36-来了智力直接原地踏步速度立刻翻倍

## Ch01.558 突发gemini-36-来了智力直接原地踏步速度立刻翻倍

> 📊 Level ⭐⭐ | 7.8KB | `entities/突发gemini-36-来了智力直接原地踏步速度立刻翻倍-xixiaoyao.md`

# 突发gemini-36-来了智力直接原地踏步速度立刻翻倍

> 来源：夕小瑶科技说 | 发布日期：2026-07-22

## 摘要

2026年7月，Google 正式发布 Gemini 3.6 系列模型，主角是 Gemini 3.6 Flash，同步推出 Gemini 3.5 Flash-Lite 和面向网络安全场景的 Gemini 3.5 Flash Cyber。这次发布的最大特征是"智力原地踏步，速度立刻翻倍"——Gemini 3.6 Flash 的综合智能水平与上一代基本持平（Intelligence Index 均 50 分），但单任务平均用时从 2.7 分钟降至 1.3 分钟，输出速度达到 304 token/秒，token 消耗减少约 17%。这标志着 Google 在大模型竞争中选择了"效率优先"路线，而非继续追逐跑分提升。

## 核心要点

1. **三款模型齐发**：Gemini 3.6 Flash（通用）、Gemini 3.5 Flash-Lite（低成本高吞吐）、Gemini 3.5 Flash Cyber（代码安全专用）
2. **智能未升，效率翻倍**：Gemini 3.6 Flash 在 Intelligence Index 上与 Gemini 3.5 Flash 均获 50 分，但单任务速度从 2.7 分钟降至 1.3 分钟
3. **代码能力有限进步**：前端代码竞技场排名从第 21 名升至第 12 名（1537 分），有一定提升但未达到代际跃迁
4. **Flash-Lite 能力飞跃**：Gemini 3.5 Flash-Lite 相比上一代 Flash-Lite 在智能体评测上进步显著，GDPval-AA v2 提高 498 分，TerminalBench v2.1 提高 22.5 个百分点
5. **Cyber 安全模型验证"轻量模型+Agent"路线**：Gemini 3.5 Flash Cyber 通过 CodeMender 集成，专注代码安全漏洞发现与修复

## 模型详解

### Gemini 3.6 Flash

作为 Gemini 3.5 Flash 的升级版，3.6 Flash 是本次发布的主角。其关键特性：

- **定价**：输入 1.50 美元/百万 token，输出 7.50 美元/百万 token
- **输出速度**：304 token/秒
- **任务时长**：单任务平均 1.3 分钟（上一代 2.7 分钟）
- **Token 效率**：输出消耗减少约 17%，DeepSWE 场景最高降幅 65%
- **代码能力**：前端代码竞技场排名第 12（1537 分），上一代第 21 名

### Gemini 3.5 Flash-Lite

面向高并发、低延迟、大批量任务场景：

- **Intelligence Index**：36 分（上一代 Flash-Lite 25 分，提升 11 分）
- **定价**：输入 0.30 美元/百万 token，输出 2.50 美元/百万 token（较上代均上涨）
- **输出速度**：350 token/秒
- **任务时长**：单任务 0.6 分钟（上一代 1.0 分钟）
- **智能体评测大幅进步**：GDPval-AA v2 提高 498 分，TerminalBench v2.1 提高 22.5 个百分点
- **单次成本上升**：从 0.04 美元增至 0.09 美元，输出量下降但单价上涨导致总成本增加

### Gemini 3.5 Flash Cyber

面向网络安全场景的垂直模型：

- 作为 CodeMender 的核心模型，服务于漏洞查找与修复流程
- 在代码安全任务上达到竞争力前沿水平，运行成本低于更大体量模型
- 暂时不向所有开发者开放，仅面向受信任合作伙伴限量试点

## 深度分析

### Google 的"效率优先"策略意味着什么

Gemini 3.6 的发布策略透露了 Google 对大模型竞争的一个清晰判断：**当头部模型的能力差距逐渐缩小时，开发者真正关心的问题会越来越具体**——同一个任务需要等多久？一次调用要花多少钱？长上下文是否稳定？能不能支撑大规模并发？

这与 K3、Fable 5、GPT-5.6 Sol 等追求能力极致的策略形成了鲜明对比。Google 似乎在说：如果跑分已经追不动了（或者说追分的边际收益在递减），那么把效率做到极致同样可以赢得市场。

这一策略的合理性在于：
- **Agent 时代，效率就是竞争力**：Agent 系统是多步骤、长链条的，每一步的延迟和成本都会乘数级放大。一个速度翻倍、token 减半的模型，在 Agent 场景中的实际体验提升可能远大于纯跑分提升 5% 的模型
- **开发者生态的"默认选项"效应**：当模型能力足够时，价格和速度成为决策的首要因素。Google 在 Gemini App、AI Studio、Android Studio 中预置新模型，本质上是将"便宜且快"变成开发者的默认选项
- **垂直场景的差异化**：Gemini 3.5 Flash Cyber 展示了"轻量底座 + 领域优化 + Agent 封装"的模式——不是用最大最强的模型去覆盖所有场景，而是为高价值场景定制专用方案

### 从"性能竞赛"到"效率竞赛"的范式转换

Gemini 3.6 的发布可能标志着大模型竞争进入一个新的阶段。前两年，行业的主要叙事是"谁更强"——跑分、benchmark、能力对比。但从 2026 年中期开始，效率指标（速度、成本、token 消耗）正在成为同等重要的竞争维度。

对于 Google 而言，这一策略尤其契合其资源优势：TPU 芯片自研、全球数据中心网络、Android/Chrome 生态——这些基础设施优势在"效率优先"的框架下比在"能力优先"的框架下更容易转化为竞争优势。

值得注意的是，Gemini 3.5 Pro 仍然在内测中，而 Gemini 4 已经开始预训练。这表明 Google 并非放弃了能力提升，而是在不同层级的模型上采取了不同的竞争策略——Flash 系列拼效率，Pro 系列仍在拼能力。

## 实践启示

1. **效率指标正成为模型选型的核心维度**：在 Agent 开发中，选择模型时不仅要看跑分，更要看"单位成本下的有效输出量"和"端到端任务完成时间"。Gemini 3.6 Flash 的案例表明，速度翻倍、token 减半带来的实际体验改善可能比 5% 的跑分提升更有价值。
2. **"轻量模型 + 领域 Agent"是垂直场景的有效路线**：Gemini 3.5 Flash Cyber 通过 CodeMender 在代码安全场景取得竞争力表现，验证了用较小模型配合专用 Agent 框架来替代"大而全"通用模型的可能性。
3. **模型定价策略正在从"输入导向"转向"输出导向"**：Agent 场景中输出 token 的消耗量远大于输入。模型厂商的定价策略调整（如 K3 大幅压低输出价、Gemini 3.6 降低输出消耗）正在反映这一趋势。
4. **Google 生态的"预置分发"是重要竞争壁垒**：将新模型内置到 Gemini App、Google AI Studio、Android Studio 中，大幅降低了开发者的迁移成本。在模型能力趋同的背景下，分发渠道和生态集成可能成为决定性因素。

## 相关实体

- [Gemini 3.5 Pro 跳票分析](https://github.com/QianJinGuo/wiki/blob/main/entities/gemini-35-pro继续跳票谷歌端上三款flash模型强行交作业.md)
- [Gemini AI 综合概述](ch01/045-gemini-ai-google.html)
- [Google I/O 2026 Agentic Gemini 战略](../ch04/234-agentic.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/突发gemini-36-来了智力直接原地踏步速度立刻翻倍-xixiaoyao.md)

---

