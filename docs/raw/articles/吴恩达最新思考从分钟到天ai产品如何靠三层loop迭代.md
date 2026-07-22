---
title: "吴恩达最新思考：从分钟到天，AI产品如何靠三层Loop迭代"
source: wechat
url: https://mp.weixin.qq.com/s/1M8zYkSIOdUaPkQl9d1Ywg
ingest_date: 2026-07-02
vxc: 64
stars: 4
sha256: 74876143cbdf0eb438e13b02ce8ac1fc9af5383b222251fdc1f7e772fc58c1e3
---

# 吴恩达最新思考：从分钟到天，AI产品如何靠三层Loop迭代

#  吴恩达最新思考：从分钟到天，AI产品如何靠三层Loop迭代

[ 高可用架构 ](<javascript:void\(0\);>)

__ _ _ _ _

在小说阅读器读本章

去阅读

在小说阅读器中沉浸阅读

导读：吴恩达（Andrew Ng）在 the batch 上最新发表文章中详细阐述了“循环工程”（Loop engineering）这一 AI agent 开发热门概念，介绍了构建 0-to-1 产品的三个关键循环：Agentic 编码循环（分钟级）、开发者反馈循环（小时级）和外部反馈循环（天级），并配以循环示意图。

亲爱的读者朋友们：

Boris Cherny（Claude Code 的创造者）和 Peter Steinberger（OpenClaw 的创造者）提到 “loop engineering” 后，这个词在社交媒体上火了。循环现在已经成为我们让 AI Agent 长时间迭代、构建软件的关键方式。在这封信里，我想分享自己用于从 0 到 1 构建产品的 3 个关键循环，如下图所示。这些循环不只指导我如何构建软件，也指导我决定要构建什么软件。

** Agentic coding loop：  ** 给定一份产品规格，可选地再给一组 eval，也就是用于衡量性能的数据集，我们可以让 AI Agent 编写代码、测试自己的工作，并持续迭代，直到代码没有 bug 且符合规格。这个闭环思路在去年年底前后开始流行，它彻底改变了 coding agent 的工作方式，让它们可以在没有人工介入的情况下更长时间地持续产出。比如上个周末，我在给女儿做一个打字练习应用，我的 coding agent 可以轻松工作大约一个小时，期间多次使用 web 浏览器检查自己构建的结果，然后再回来找我，全程不需要我介入。

工程循环执行得很快。每隔几分钟，coding agent 可能就会构建并测试一个新版软件。我经常听到开发者分享他们发现的新方法，用来设计更有效的工程循环。这是一个非常活跃的创新领域。

** Developer feedback loop：  ** 在这个循环里，开发者检查当前产品，并引导 coding agent 继续改进。去年，很多开发者，包括我自己，都在为自己的 coding agent 扮演 QA（质量保证）角色，手动找 bug，再让 Agent 修复。但随着 coding agent 更有能力测试自己的代码，我们需要花在这项职能上的时间已经显著减少。这样我们就能做更高层次的产品决策，例如应该提供哪些关键功能，UI 哪里需要改进，等等。

开发者反馈循环的时间尺度通常是几十分钟到几小时，这大致就是开发者审查产品并给出反馈的频率。以那个打字应用为例，我几次改变主意，调整视觉设计、孩子在学习过程中可以解锁哪些猫咪服装（她喜欢猫），以及成年人登录并引导孩子学习体验的用户流程。

3 Key Product Development Loops: Agentic Coding Loop (minutes), Developer Feedback Loop (hours), External Feedback Loop (days)

3 个关键产品开发循环：Agentic Coding Loop（分钟级）、Developer Feedback Loop（小时级）、External Feedback Loop（天级）

开发者对要构建什么有清晰的愿景，但把这个愿景转化成 coding agent 能执行的规格，工作量仍然不小。此外，在开发者看到一个实现之后，他们可能会更新，或者进一步澄清规格，把它引向自己真正想要的方向。如果你发现系统反复遇到某些问题，为 Agent 构建一组 eval 就会很有用。

AI 原生团队越来越多地用 AI 帮助塑造产品方向，例如自动收集和分析使用数据，总结书面和口头客户反馈，或者做竞品分析。不过，对于我参与的几乎所有产品，我都认为人类相对于当前 AI 系统拥有显著的上下文优势。我们比 AI 系统更了解用户，也更了解产品所处的使用场景，因此人类仍然扮演关键角色。很多人把这种人类贡献称为“品味”，但我更愿意把它理解为人类拥有上下文优势，因为这种说法给了我们一条更清晰的路径，去帮助 AI 系统变得更好。这也解释了为什么这一步无法自动化：只要人类知道 AI 不知道的东西，就需要 human-in-the-loop，把这些知识注入系统。

** External feedback loop：  ** 这包括一系列广泛的  策略  [1]  ，比如请几位朋友反馈、发布给 alpha 测试者，或者把代码上线到生产环境配合 A/B 测试。这些策略通常很慢，很少能在几个小时内完成，有时需要几天甚至几周。这些数据会影响  开发者愿景  [2]  ，开发者愿景继续驱动详细产品规格，产品规格再驱动 coding agent。

随着 coding agent 加速软件开发，更多工程师开始承担部分产品管理角色。对很多正在成长到这个角色中的工程师来说，最难的部分是塑造产品愿景，并在构建和获取用户反馈之间取得平衡。这里的构建，指的是弥合愿景与规格之间的距离；用户反馈，则用于不断演化愿景。两件事都很重要。

我以后会写更多关于如何做到这一点的内容。不过现在，让我感到鼓舞的是，工程师正在承担更广泛的角色，正如产品经理和设计师现在也在做更多工程工作一样。

继续构建！

吴恩达

##  参考阅读

* [ GIAC 2026 圆满落幕：AI Native 进入深水区，技术组织如何重构？ ](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565321&idx=1&sn=8278a346828aacc3ba93cea9da9aed0a&scene=21#wechat_redirect>)
* [ 别只盯着模型：Agent 真正的护城河，是这四层循环 ](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565309&idx=1&sn=f0c4d1d8026241f46a538b72028c1529&scene=21#wechat_redirect>)
* [ 4000行代码撑起一个Agent框架？nanobot架构深度解析 ](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565296&idx=1&sn=355409661a0df7e410af81e54a8337cc&scene=21#wechat_redirect>)
* [ 从 Spec 到损失函数：真正会用 AI Agent 的人，已经在设计循环 ](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565290&idx=1&sn=55c5f83723819b579a226427b7e848b4&scene=21#wechat_redirect>)

####  References

1. 策略:  https://www.deeplearning.ai/the-batch/how-to-get-user-feedback-to-your-ai-products-fast?utm_campaign=The%20Batch&utm_source=hs_email&utm_medium=email&_hsenc=p2ANqtz-9IU5WWvlZnFv4GFOY2DPAg8PWrnhPB_aFANXt2LIg2tC97Y7bMJ07wp5JEddrBEnV27XVg
2. 开发者愿景:  https://www.deeplearning.ai/the-batch/how-to-get-through-the-product-management-bottleneck?utm_campaign=The%20Batch&utm_source=hs_email&utm_medium=email&_hsenc=p2ANqtz-9IU5WWvlZnFv4GFOY2DPAg8PWrnhPB_aFANXt2LIg2tC97Y7bMJ07wp5JEddrBEnV27XVg
3. 原文  https://www.deeplearning.ai/the-batch/issue-359

预览时标签不可点

微信扫一扫
关注该公众号

[ 知道了 ](<javascript:;>)

微信扫一扫
使用小程序

****

[ 取消 ](<javascript:void\(0\);>) [ 允许 ](<javascript:void\(0\);>)

****

[ 取消 ](<javascript:void\(0\);>) [ 允许 ](<javascript:void\(0\);>)

****

[ 取消 ](<javascript:void\(0\);>) [ 允许 ](<javascript:void\(0\);>)

×  分析

__

微信扫一扫可打开此内容，
使用完整服务

：  ，  ，  ，  ，  ，  ，  ，  ，  ，  ，  ，  ，  。  视频  小程序  赞  ，轻点两下取消赞  在看  ，轻点两下取消在看  分享  留言  收藏  听过
