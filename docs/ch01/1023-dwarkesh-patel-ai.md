# Dwarkesh Patel：下一代AI，可能是干活干出来的

## Ch01.1023 Dwarkesh Patel：下一代AI，可能是干活干出来的

> 📊 Level ⭐⭐ | 3.5KB | `entities/dwarkesh-patel下一代ai可能是干活干出来的.md`

# Dwarkesh Patel：下一代AI，可能是干活干出来的

**来源**: 机器之心

**发布日期**: 2026-06-28

**原文链接**: http://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2651041546&idx=2&sn=fedc77937dafe2bff30de5b1d8d47e40&chksm=84e66b74b391e2622fe2705d6d20db3f35685261a164ac701af536a6a098971b92c858cfd776#rd

---

机器之心编辑部

硅谷著名科技播客主持人 Dwarkesh Patel 最近抛出了一个问题： AI 的下一代训练范式会是什么？

Dwarkesh Patel 是硅谷近几年快速走红的科技播客主持人和写作者，年仅 25 岁，却已经凭借 Dwarkesh Podcast 进入 AI 讨论的核心圈层。他的采访对象包括 Ilya Sutskever、Andrej Karpathy、Dario Amodei、Demis Hassabis、Mark Zuckerberg 等一众 AI 与科技大牛。TIME 曾将他列入 2024 年 TIME100 AI，称他的播客已经成为许多 AI 从业者的重要收听内容。

在最新一期的播客中，他把当下前沿 AI 实验室正在押注的路线总结为一个关键词： RLVR ，也就是 Reinforcement Learning with Verifiable Rewards，可验证奖励强化学习。

简单说，就是让模型在大量可以自动判断对错的任务中反复试错，训练出规划、纠错、迭代和长期执行能力。今天代码、数学等领域的快速进展，很大程度上就来自这种思路。

但 Dwarkesh 真正想追问的是： 如果下一代 AI 只靠这种「可验证任务训练」，够不够？

他的答案是：可能不够。

因为一个任务光「可验证」还不够，它还必须「可刷」。

这里的关键概念是 grindability，可磨性。 放在 AI 训练语境里，是「可反复刷题性」或者「可大规模 rollout 的能力」。

代码任务就是典型的可刷任务。你可以准备一个软件仓库、一个待修复 bug、一个测试用例，然后把同一个环境复制成几千份，让几千个 agent 同时尝试。谁通过测试，谁就得分。这个过程可以并行、可复现、可重置，特别适合 RLVR。

数学题也是类似的。答案对不对可以验证，训练环境也容易复制。

但 Dwarkesh 问了一个很有意思的问题：为什么 AI 在「使用电脑」这件事上，进展反而比代码和数学慢？

表面上看，电脑使用也是可验证的。比如东西有没有下单成功、活动场地有没有订好、税表有没有提交，这些结果都可以判断。但问题在于，它很难被大规模复制和回放。你不能让一千个 agent 同时去 Amazon 上反复跑同一个结账流程，因为真实网站会识别 bot、封禁账户、改变状态。你当然可以克隆 Slack、Gmail、Amazon 这样的应用来做模拟器，但这在当前阶段仍然是高成本、低扩展性的工程。

Dwarkesh 指出： AI 在某个领域进步快，不只是因为这个领域答案可验证，而是因为这个领域能被包装成可复制、可回放、可并行试错的训练环境。

这也解释了为什么代码、数学、游戏类任务会成为 RLVR 的天然温床，而很多真实世界任务却很难直接纳入这套训练范式。

接着，他把问题推向更复杂的现实世界。

- 如果我们想训练一个 AI 从零开始创

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/dwarkesh-patel下一代ai可能是干活干出来的.md)

---

