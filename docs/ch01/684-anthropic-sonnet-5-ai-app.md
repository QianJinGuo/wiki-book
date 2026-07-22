# Anthropic深夜连放两弹：Sonnet 5、全新AI科研App重磅上线

## Ch01.684 Anthropic深夜连放两弹：Sonnet 5、全新AI科研App重磅上线

> 📊 Level ⭐⭐ | 6.7KB | `entities/anthropic深夜连放两弹sonnet-5全新ai科研app重磅上线.md`

# Anthropic深夜连放两弹：Sonnet 5、全新AI科研App重磅上线

> 来源：[原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/anthropic深夜连放两弹sonnet-5全新ai科研app重磅上线.md)

## 核心要点

Anthropic深夜连放两弹：Sonnet 5、全新AI科研App重磅上线

## 技术分析

---
source: wechat
source_url: https://mp.weixin.qq.com/s/VbUpLI1cOHFooxYg0RuH7g
ingested: 2026-07-01
feed_name: AI寒武纪
wechat_mp_fakeid: MP_WXS_3871912638
source_published: 2026-06-30
---

# Anthropic深夜连放两弹：Sonnet 5、全新AI科研App重磅上线

↑阅读之前记得关注+星标⭐️，😄，每天才能第一时间接收到更新

刚刚Anthropic一次性放出两个重磅更新：Claude Sonnet 5，以及面向科研人员的AI工作台Claude Science。

Sonnet 5性能接近Opus 4.8，主要提升的是Agent能力，发布内容有很多部分在说安全，这个我就不细聊了。

Claude Science这个工具还是暴露了一点Anthtropic的野心，毕竟现在A厂内部模型在飞速自我迭代，如果模型真的接近AGI了搞科研那就是自然而然的事情。

另外，Claude桌面版现在支持Linux了（Ubuntu 和 Debian）

###  一、Claude Sonnet 5

Sonnet 5直接从4.6跳过4.7和4.8，制定计划，调用浏览器、终端等工具，并且能在更长时间里独立运行，这种能力在几个月前还只有体量更大、价格更贵的模型才具备。

过去，Agent能力的明显提升大多出现在Opus系列身上，Sonnet系列则相对落后。这次Sonnet 5把差距明显缩小了，整体表现已经接近Opus 4.8，价格却低不少。相比上一代Sonnet 4.6，Sonnet 5在推理、工具调用、编程和知识工作等关键能力上都有实质提升。

Sonnet 5从即日起在所有套餐中开放：免费版和Pro版默认使用它，Max、Team、Enterprise用户也都可以使用。开发者也能通过Claude API调用，模型代号是claude-sonnet-5。上线初期，输入token价格为每百万2美元，输出为每百万10美元，这个优惠价格会持续到8月31日，之后恢复到每百万输入3美元、输出15美元的标准价格。

需要注意的是，Sonnet 5用了新的分词器，处理文本的方式有所变化，同样的输入内容可能会被切分成更多token，大致是原来的1到1.35倍，具体取决于内容类型。Anthropic表示，优惠价格的设定已经把这个因素考虑进去，整体迁移成本基本持平。

####  Sonnet 5真实生产能力到底怎么样？

Anthropic用两个测试做了对比：考察Agent搜索能力的BrowseComp，以及考察电脑操作能力的OSWorld-Verified。在不同的算力投入水平下，Sonnet 5相比Sonnet 4.6都有稳定提升。Opus 4.8依然是这两项测试里精度最高的选择，但Sonnet 5用更低的价格提供了相当不错的水准，用户可以根据需要在两者之间，以及不同的算力投入档位之间做权衡。

多家早期测试合作伙伴反馈，Sonnet 5明显更能把复杂任务做到底，遇到之前的Sonnet模型会半途而废的场景，新模型能完整跑完整个流程，而且经常会在没有特别要求的情况下自己检查输出结果。

###  二、Claude Science：给科学家的AI工作台

Anthropic还发布了Claude Science，一款面向科研人员的AI工作台应用。目前还是beta版本，看看A厂是怎么规划这个科研向的AI工具的，这里会介绍的详细一点。

科研工作本身往往很繁琐：研究人员需要在几十个数据库之间切换，每个数据库的结构和查询方式都不一样；还要应付各种需要专门工具才能打开和处理的文件格式；日常工作流也常常要在PubMed、Jupyter、R、集群终端等一堆工具之间来回跳转。

Claude Science把这些分散的工具整合进了同一个研究环境，覆盖科研工作的各个阶段：分析文献、执行多步骤研究、生成详细的产出物，并支持反复打磨图表和论文手稿直到达到可发表的水准。每一项产出都带有完整的制作过程记录，方便研究者验证和复现结果。和Jupyter笔记本类似，用户可以在自己已有的工作环境里使用它，包括本地macOS或Linux系统，也可以通过SSH连接远程机器，或者直接登录HPC集群节点使用。

用户面对的是一个统筹型主Agent，背后接入了60多个针对基因组学、单细胞分析、蛋白质组学、结构生物学、化学信息学等领域预先配置好的技能和连接器。这个主Agent还能调用其他Agent，也能和用户自己创建的专用Agent协同工作。同时有一个审核Agent专门检查引用和计算过程，发现错误会标注出来并进行修正。

Cl...

---

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/anthropic深夜连放两弹sonnet-5全新ai科研app重磅上线.md)

## 定价、Token 变更与安全评估

Claude Sonnet 5 标准定价为输入 $3/M token、输出 $15/M token，首发优惠至 2026 年 8 月 31 日为输入 $2/M、输出 $10/M。Opus 4.8 定价为输入 $5/M、输出 $25/M。

**Tokenizer 变更**：Sonnet 5 采用全新 tokenizer（同 Opus 4.7），相同输入内容映射为 1.0～1.35 倍 token，视内容类型而定。Anthropic 设置了首发优惠价以过渡期抵消 token 膨胀影响。

**安全评估**：Sonnet 5 在自主智能体安全性方面相比 Sonnet 4.6 整体改善。提示注入攻击成功率仅 0.93%，而 Opus 4.8 为 31.5%、Sonnet 4.6 为 50.7%。幻觉率和谄媚行为率均低于前代。但失当行为率略高于 Opus 4.8 和 Mythos Preview。

**网络安全**：Anthropic 未刻意针对网络安全训练 Sonnet 5。Firefox 漏洞利用测试中，Sonnet 5 始终未能成功（0.0%），安全性护栏默认启用。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/claude-sonnet-5-release-machine-heart-2026.md)

---

