---
title: "New Relic CTO 深度访谈：Observability 三大时代演进与 AI 可观测性的双面挑战"
source_url: "https://mp.weixin.qq.com/s/38e7bKjMH6uE2gi7z22S7A"
author: "InfoQ（编译：宇琪，策划：Tina）"
published: 2026-06-30
ingested: 2026-06-30
language: zh
type: raw
sha256: "b9503dba5d7a7ff6bf57f326a0659b9b084276e819e7b9e1c9fea39acbec8a77"
---

# New Relic CTO 深度访谈：Observability 三大时代演进与 AI 可观测性的双面挑战

> 来源：InfoQ 编译，基于 Software Engineering Daily 播客 Nic Benders × Lee Atchison 对话

## 核心观点

- Observability 系统，其实更应该叫 "understandability" 系统——没人真的想"观察"，大家要的是"理解"。
- 增加 alert 并不会提升响应能力。它会训练人产生一种反应："先等一下，看看它会不会自己恢复。"噪音越多，响应越慢，但团队却误以为 alert 越多越安全。
- 当 AI 让每个人有能力去完成更多事情，结果不是"少工作"，而是"多产出"。历史上从来没有哪次技术进步让人类真的减少工作量。
- 真正的 "source of truth" 始终是业务本身。

## Observability 三大时代演进

### 1. Instrumentation 时代（早期）
给更多关键系统做插桩：Ruby、Java、.NET、Python、浏览器、移动端。但很快插桩的东西太多，数据量大到根本处理不过来。

### 2. Data Platform 时代（2013-2014）
New Relic 推出 NRDB。核心价值：你可以问那些你原本不知道该问的问题。数据先全部收进来，之后再探索。这种"交互式提问"的能力支撑了 dashboards、data explorer、alerts 等一整套能力。

### 3. Intelligence 时代（当前）
数据太多，多到你甚至不知道该问什么。重点不再是"你能问什么"，而是系统告诉你"你应该问什么"、"你该看什么"。AI 是其中一部分，但不只是 AI——还包括产品设计、交互方式、内置判断逻辑。

### 4. Action 时代（未来展望）
让系统不仅能看，还能直接动手解决问题。

## Dashboards 和 Alerts 的尽头

现在的 dashboards 更漂亮、更好用、数据更多，但本质上和 90 年代做的没什么区别——区别只是从 3 个图变成了 300 个图。没有任何一个 dashboard 小到可以让你"看见一切"。以 dashboards 和 alerts 为核心的 observability，已经走到尽头了。

## 统计方法、ML 与 Neural Networks 三层

1. **数学和统计**：signal analysis、baseline deviation，本质就是公式计算。
2. **Machine Learning**：不再手动设参数，而是定义 hyperparameters，让算法自动调整告警基准。
3. **Neural Networks（现在的 AI）**：60 年代就有，但直到 transformer 架构出现才真正"好用"。

一个好的产品应该三者都有。目前的趋势是 neural networks 成为"决策层"，但它背后调用的工具应该包括各种 machine learning 和统计能力。

## LLM 在大规模系统理解中的角色

不能直接把 petabyte 级数据喂给 LLM——成本高到离谱。但可以先统计方法找 anomaly，再把这些"可疑片段"交给 LLM，让它判断哪些有意义。

需要三样东西：海量数据输入、结构化数据（明白什么指标对应什么系统）、空间和时间上的关联。

LLM 是总结天才。但上下文窗口在海量数据面前还是太小。数据规模是 10 亿级的，必须通过工具先把数据量从 10 亿级降到万级，AI 才能真正起作用。

## 告警疲劳的解决方案

**第一层**：用 intelligence 过滤 alert——在通知人之前先判断它是否严重。
**第二层**：反过来优化 alert 本身——哪些 alert 总是一起触发？哪些从来不可操作？哪些只是闪一下就消失？
**根本解决**：当系统检测到 anomaly 时，先自己判断：这个问题是否"有趣"？是否可以自动处理？是否需要人类介入？

未来大部分系统都应该 self-healing。很多今天需要 runbook 的事情最终都会变成"顺带发生"的事情。节点挂了、pod 被重调度——没人会被 page，可能只是 log 里一行记录。

## AI 对软件工程的影响

AI 工具改变了"思考层级"。过去几十年一直在向更高抽象层演进：更高级语言、虚拟机、云计算。现在几乎不需要关心底层基础设施。

当 AI 让每个人有能力去完成更多事情，结果不是"少工作"，而是"多产出"。历史上从来没有哪次技术进步让人类真的减少工作量。AI 确实会改变工作形态——不一定"消灭工作"，但会"转移工作"。

## Observability for AI

AI 系统是非确定性的（non-deterministic），通常通过 API 调用一整套新工具链。AI 系统的 golden signals 与传统 web 系统不同。

需要关注的新信号：token 使用量、成本、response 质量、用户情绪（sentiment）、评估"答案是否正确"。

比喻：创建了一个由一群不太靠谱的员工组成的"虚拟呼叫中心"。需要一个"主管"在走廊里来回巡视，确保这些 AI Agents 没在胡说八道。评估答案的质量，就是 AI 时代不同于数据库或云基础设施的新信号。

工具厂商必须提供"默认判断"（opinionated guidance）——不能只是说"你想监控什么都可以"，这对第一次上线 AI 的团队来说毫无帮助。

OpenTelemetry 的价值在于让所有新框架从一开始就是"可观测的"。

## 对新人开发者的建议

1. 一定要花时间去用这些新工具（如 Claude Code），用它们来真正构建软件。
2. 不要把它们当成"自动生成代码的黑盒"，应该把它们当成一个"可以解释的老师"——让它告诉你：它为什么这么做、它是怎么实现的。
3. 写作时，不要让 AI 帮你写内容。但可以让 AI 帮你"读"你的文章，问它："作为读者，你觉得哪里没讲清楚？"用它来打磨自己，而不是替代自己。
4. 你们这一代开发者会从更高的起点出发，去到我们甚至想象不到的地方。

## 访谈原链接

https://softwareengineeringdaily.com/2026/04/14/new-relic-and-agentic-devops-with-nic-benders/
