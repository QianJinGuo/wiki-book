---
source: rss
source_url: https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2651053471&idx=1&sn=eb718841cd7d53921a32e5ecd15bbff5
ingested: 2026-08-30
feed_name: WeChat-机器之心
source_published: 2026-08-29
sha256: 4e61e51c2b4bbd80
---

# 突发！OpenAI宣布断供Cursor

原创 关注AI的 2026-08-29 12:26 四川

「马斯克想蒸馏我。」

机器之心编辑部

这似乎有点不太 Open 了。

刚刚，OpenAI 发布一份声明，宣布终止与 Cursor 的合作关系。「根据我们的提议，Cursor 对我们模型的直接访问将于 11 月 12 日结束。」

至于原因，OpenAI 也没有避讳：Cursor 被 SpaceX 收购后，已经不被 OpenAI 信任。毕竟，奥特曼与马斯克的过节可说是众人皆知。

「马斯克想蒸馏我数据」

OpenAI 在博客中表示：「这个决定非常艰难，因为我们非常重视让开发者广泛使用我们的模型。我们做出这一选择，是因为根据我们与埃隆·马斯克旗下公司违反合同的经验，我们无法确信 SpaceX 会在我们的服务条款范围内使用我们的技术。」

OpenAI 进一步解释，通常情况下，对于像 SpaceX 这样的大型合作伙伴，公司会通过定制合同开展合作，以确保对方遵守公司的服务条款，同时保证相关集成能够满足大规模应用下的安全要求。

而在马斯克收购 Twitter（现已并入 SpaceX，更名为 X）后，该公司曾违反与 OpenAI 的合同条款，同时也违反了与其他多方签订的合同。今年早些时候，马斯克在宣誓作证时承认，现同样隶属于 SpaceX 的 xAI 曾违反 OpenAI 的服务条款，而这些条款与 xAI 自己的服务条款也十分相似。

针对这两条指控，OpenAI 还「贴心」附上了外部报道链接。

<https://www.forbes.com/sites/antoniopequenoiv/2026/04/30/elon-musk-admits-xai-distilled-openai-data-to-train-models-heres-what-that-means/>

<https://www.nytimes.com/2023/04/27/technology/elon-musk-ai-openai.html>

因此，在这桩桩件件的「黑历史」面前，OpenAI 难以相信如今换了主人的 Cusor 不会出现这样的违规行为。为了提前止损，OpenAI 决定趁控制权变更条款仍然有效时退出。

不过，截至发稿，马斯克方面尚未就 OpenAI 这一表述作出回应。

而 Cursor 的创始人 Michael Truell 「坐不住」了，立即发推进行了反击，他除了表示遗憾之外也指出，GPT 系列模型在 Cursor 用户中间的占比只有 5%。

这样看起来带不起节奏，底下开发者们还是更希望他们在选择工具时不会受到大模型公司竞争的影响。

当然，另一边 Anthropic 也没忘落井下石。

Claude 肯定还是能用的，毕竟 Anthropic 现在和 SpaceX 有着合作关系，在大量使用马斯克的超算集群。

另一半理由：Astra

如果只把这件事读成马斯克与奥特曼的私人恩怨，会漏掉公告里技术含量最高的一句话。OpenAI 说，随着 AI 能力推进，它对确保「即将推出的模型 Astra」被合规使用负有「新层级的问责责任」。

Astra 是什么，OpenAI 在 8 月 7 日已经交过底。当时它披露，内部评估显示 Astra 在智能体编程与网络安全方面出现显著进步，以至于按其《准备度框架》（Preparedness Framework）的标准，公司「无法排除」该模型达到网络安全能力的 Critical 等级。

按照框架定义，达到这一等级意味着模型能在无人干预的情况下，对现实世界中经过加固的关键系统发现并开发出各种严重级别的可用零日漏洞利用；或者仅凭一个高层级目标，就能端到端地设计并执行针对加固目标的新型网络攻击。

这是 OpenAI 历史上第一个触发这一讨论的模型。此前的 GPT-5.6-Sol 被评为 High，但未达 Critical。作为应对，OpenAI 暂停了不满足更严格安全要求的相关内部研发活动，对模型实施全面监控，并计划在部署前邀请政府机构与独立安全组织参与评估。8 月 18 日，它进一步表示正在重写 2023 年写就的《准备度框架》。

把这条线索接回今天的公告，可以这么理解：一个可能具备关键级网络攻击能力的模型，最自然的分发界面恰恰就是编程 IDE。对 OpenAI 来说，Astra 的部署面越可控越好，而一个由竞争对手全资持有、且有违约前科的分发渠道，是它最不愿意留在名单上的那种。

模型访问权，正在变成一种武器

模型厂商用访问权当武器，已有先例，而且就是来自的 OpenAI 的主要竞争对手 Anthropic。而且还不止一次。

2025 年 6 月，在 OpenAI 传出收购 Windsurf 的消息后，Anthropic 切断了 Windsurf 的 Claude 访问权限，据报道给出的通知期不到五天。

同年 8 月，Anthropic 又撤销了 OpenAI 对 Claude API 的访问，理由是 OpenAI 在 GPT-5 发布前用 Claude 做内部基准测试。当时 Anthropic 首席科学官 Jared Kaplan 表示：把 Claude 卖给 OpenAI 这件事本身就很奇怪。

Anthropic 也拒绝过 Cursor，今年 1 月，据多家媒体报道，Anthropic 发现 xAI 员工正通过 Cursor 调用 Claude 来辅助自家模型与编程产品的开发，随即切断了这条通路。xAI 联合创始人 Tony Wu 在内部消息中通知员工，Anthropic 的模型在 Cursor 上不再响应，并称据 Cursor 方面说明，这是 Anthropic 针对所有主要竞争对手的新政策。Wu 承认这会打击生产力，但也认为这会「真正推动我们做自己的编程产品和模型」。

有意思的是，OpenAI 今天的措辞与 Anthropic 当年高度一致，都是服务条款、都是竞争对手、都是「无法确信」。

对开发者来说，教训就是：把 IDE、模型和云绑在同一家公司上是有风险的，甚至开发者自己都可能成为别人谈判桌上的筹码。

抽象掉工具与模型的耦合、保持配置可迁移、评估集中度风险，这些原本听上去像是企业架构师的教条，今年已经变成了很实际的建议。

如今，距离 11 月 12 日还有两个半月。在此之前，Cursor 会拿出什么替代方案，Anthropic 会不会成为下一个宣布断供的人，以及 Astra 究竟以什么姿态发布……让我们拭目以待吧。

参考内容：

<https://openai.com/index/our-decision-on-cursor-following-its-acquisition-by-spacex/>

© THE END 

转载请联系本公众号获得授权

投稿或寻求报道：liyazhou@jiqizhixin.com

[跳转微信打开](<https://wechat2rss.xlab.app/link-proxy/?k=0f44464c&r=1&u=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzA3MzI4MjgzMw%3D%3D%26mid%3D2651053471%26idx%3D1%26sn%3Deb718841cd7d53921a32e5ecd15bbff5>)
