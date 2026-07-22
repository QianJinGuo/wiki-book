---
title: 明星开源项目，为什么开始离开 GitHub？
source: wechat
source_url: https://mp.weixin.qq.com/s/SXo130s5EozluTMMhgZLkg
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
sha256: c5f9d6d2808c
review_value: 7
review_confidence: 8
review_recommendation: strong
review_stars: 4
created: 2026-05-21
updated: 2026-05-21
---



# 明星开源项目，为什么开始离开 GitHub？

近日 Mitchell Hashimoto（@mitchellh）宣布其终端模拟器 Ghostty 项目将离开 GitHub，他是 GitHub 用户 1299，自 2008 年起每天访问近 18 年，曾将 Vagrant、Terraform 等项目托管于此。

离开主因是GitHub持续频繁宕机与基础设施故障，几乎每天阻断PR审查、Actions等核心工作，他直言“不再适合严肃开发”，决策早在数周前就已确定。

GitHub COO Kyle Daigle 则立刻对 Mitchell Hashimoto 宣布 Ghostty 项目离开 GitHub 进行回复，Daigle在帖中表达歉意，承诺团队将用实际改进而非空话挽回用户，同时个人表示将继续支持 Ghostty 项目。

此事件凸显 2026 年 GitHub 可靠性问题对长期用户的冲击，Hashimoto 计划逐步移除依赖并保留 GitHub 只读镜像，未来转向其他平台。

网上统计也可以看到， 2018 年收购 GitHub 后平台宕机增多。

以下是 Mitchell 发布的正文。

###  Ghostty 将离开 GitHub

写下这些让我非理性地难过，但 Ghostty 将离开 GitHub  1  。

我是 GitHub 用户 1299，2008 年 2 月加入。

从那以后，我每天都会打开 GitHub。每天，一天很多次，持续了 18 年多。超过我人生的一半。中间当然有少数例外，我很想看看数据，但我想每年不会超过一周。

GitHub 是最让我快乐的地方。我总会为它留出时间。经历艰难的分手时，我把自己埋进开源里，在 GitHub 上。大学里凌晨 4 点，所有人都睡倒了？让我再提交一次。蜜月时，我妻子还在睡觉？是的，GitHub。它一直是我历史上最快乐、最想待着的地方。

甚至那些烦人的东西也是如此。有些人会在社交媒体上 doom scroll。而我从这个词出现之前，就已经在 doom scroll GitHub issues 了。度假时，我会收藏一些 GitHub 上想研究的不同项目。不只是源代码，还有 OSS 流程，其他维护者如何应对困难局面，等等。信不信由你，我喜欢这些。

有些人可能会说这有病，但我的爱好、工作和热情是统一的，而且在我人生的大部分时间里，它们还都能生活在互联网上的同一个地方：GitHub。

你知道吗，我开始做 Vagrant，也就是我第一个成功的开源项目，很大程度上是因为我希望它能帮我得到一份 GitHub 的工作？这不是秘密，我反复说过。在我第一次公开演讲 Vagrant 时，我才 20 岁，我开玩笑说：“如果它够好，也许 GitHub 会雇我！”

GitHub 曾是我梦想中的工作。我最终没能在那里工作，这不是他们的错。但那是我想去的完美之地。工程师令人惊叹，产品令人惊叹，而且它是我每天都在生活和呼吸的东西。直到现在也是，并且这 18 年一直如此。足够一个完整的人长大成人的时间，全都在 GitHub 上。

最近，我非常公开地批评 GitHub。我说得很刻薄。我对此很愤怒。我伤害了别人的感受。我一直在发泄。因为 GitHub 每一天都在辜负我，而这件事是私人的。它非理性地私人。我对 GitHub 的爱超过了一个人对一件东西应有的爱，所以我对它生气。对于伤害到为它工作的人，我很抱歉。

我有这种感觉已经很久了，但过去一个月里，我一直在记日记。每当某一天 GitHub 的故障负面影响了我的工作能力，我就会在那天旁边打一个 “X”  2  。几乎每天都有一个 X。在我写这篇文章的那天，因为 GitHub Actions 故障，我大约 2 小时无法做任何 PR review  3  。如果一个地方每天都会把你挡在门外好几个小时，它就不再是一个适合严肃工作的地方。

它对我来说已经不再是一个好玩的地方。我想待在那里，但它不想让我待在那里。我想完成工作，但它不想让我完成工作。我想发布软件，但它不想让我发布软件。

我希望它变得更好，但我也想写代码。而我已经无法再用 GitHub 写代码了。抱歉。18 年之后，我必须离开。我很希望有一天能回来，但这必须建立在真实结果和改进之上，而不是话语和承诺之上。

接下来几个月，我会分享更多关于 Ghostty 项目将迁往何处的细节。我们有计划，但我也仍在和多家提供方讨论，包括商业提供方和 FOSS 提供方。

移除我们对 GitHub 的所有依赖需要时间，我们已经制定了计划，会尽可能渐进地完成。我们计划在 GitHub 上保留一个只读镜像，地址仍是当前 URL。

我的个人项目和其他工作目前仍会留在 GitHub。Ghostty 是我、我们的维护者以及我们的开源社区受影响最大的地方，所以这是这次变更的重点。之后会走向哪里，我们再看。

2026 年 4 月 28 日

###  参考阅读

* [ 300万人在存的Claude提示词 ](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565104&idx=1&sn=7699e8f06a56d11d91eb161c4ac93aaf&scene=21#wechat_redirect>)
* [ 别再把上下文当聊天记录 ](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565098&idx=1&sn=81a14c9465234c254aab9631032ff4ee&scene=21#wechat_redirect>)
* [ Claude 发布官方报告，承认存在 3 处质量退化问题 ](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565076&idx=1&sn=f81a143e0d172a92d62cdb060ee1dc3c&scene=21#wechat_redirect>)
* [ 刚刚Opus 4.7发布，相比4.6核心变化，与Claude Code搭配最佳实践 ](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565067&idx=1&sn=23b3a7acecee15abedea9d4f065c4f40&scene=21#wechat_redirect>)

####  Footnotes

1. 这个时间点与 2026 年 4 月 27 日的大规模故障重合，只是巧合。几个月来，我们一直在讨论并制定离开 GitHub 的计划，而这篇博客文章是一周多以前写好的。我们只是在本周做出了最终决定。

2. 对那些说 “Git 是分布式的！” 的人：问题不在 Git，而在我们围绕它所依赖的基础设施：issues、PR、Actions 等等。

3. 这不是他们在 2026 年 4 月 27 日发生的大规模 Elasticsearch 故障。这篇博客文章是在那之前一周写的，所以这是另一次不同的故障。

如果你也在关注 AI 应用如何真正落地到生产环境，2026.6.26 - 6.27 GIAC 深圳站值得关注。这次大会会集中讨论智能应用开发、架构演进，以及来自一线实践的经验与案例。

识别二维码可申请大会体验门票，点击
