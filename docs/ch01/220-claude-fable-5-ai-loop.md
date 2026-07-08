# Claude Fable 5 发布：AI 工作流的关键正在转向 Loop 循环

## Ch01.220 Claude Fable 5 发布：AI 工作流的关键正在转向 Loop 循环

> 📊 Level ⭐ | 2.5KB | `entities/claude-fable-5-发布ai-工作流的关键正在转向-loop-循环.md`

# Claude Fable 5 发布：AI 工作流的关键正在转向 Loop 循环

今天，Anthropic 发布了 Fable 5，它在几乎所有测试过的基准上都达到顶尖水平，在软件工程、知识工作、科学研究和视觉任务上表现尤其出色。

image.png

任务越长、越复杂，Fable 5 相比其他模型的领先幅度就越大。

发布如此强大的模型也伴随着风险。如果没有防护措施，Fable 5 在网络安全等领域的能力可能遭到滥用，造成严重损害。

针对少数几类主题的查询，系统会改用 Claude 次强的模型 Opus 4.8 来响应。

Fable 5 的防护机制会检测与网络安全、生物与化学、蒸馏相关的请求。每当发生回退时，用户都会收到提示，平均发生在不到 5% 的会话中。

Claude 会继续完善这些防护措施，减少误判。

同时也面向一小部分网络防御人员和关键基础设施提供方推出 Claude Mythos 5。Mythos 5 与 Fable 5 共享同一个底层模型，但在部分领域放宽了防护限制。

很快，计划通过更广泛的可信访问计划扩大 Mythos 5 的访问范围，用于防御性网络安全工作和生物医学研究。

Claude Fable 5 今天已在所有平台可用。Claude Mythos 5 目前仅限 Glasswing 合作伙伴使用，直到 Anthropic 扩大可信访问计划。

接下来是官方工程师 @RLanceMartin 介绍如何设计循环的教程

##  使用 Fable 5 设计循环

像 Claude Fable 5 这样的 Mythos-class 模型，已经改变了 Anthropic 许多人的工作方式。我想分享两个技巧，帮助你更好地使用这类模型。

** 自我纠正循环  **

最近大家对循环很感兴趣。  @bcherny  [1]  提到过  [2]  ，“我的工作就是写循环”。让模型围绕评测进行迭代优化，是提升任务表现的常见做法：Claude Code 里的  /goal  [3]  和  Claude Managed Agents 里的 Outcomes  [4]  ，都是能让你把这套通用方法应用到具体任务上的原语。

正如我们在  提示词指南  [5]  中提到的，Fable 5 擅长在循环中自我纠正。设计良好的目标或评分标准，会给 Claud

---

