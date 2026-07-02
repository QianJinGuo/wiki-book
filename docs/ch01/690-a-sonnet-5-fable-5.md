# A社你解释下，啥叫Sonnet 5比Fable 5还贵？

## Ch01.690 A社你解释下，啥叫Sonnet 5比Fable 5还贵？

> 📊 Level ⭐⭐ | 6.3KB | `entities/a社你解释下啥叫sonnet-5比fable-5还贵.md`

# A社你解释下，啥叫Sonnet 5比Fable 5还贵？

---
source: wechat
source_url: https://mp.weixin.qq.com/s/3zQr82n9hSWcCrXmf4nc7g
ingested: 2026-07-01
feed_name: 量子位
wechat_mp_fakeid: MP_WXS_3236757533
source_published: 2026-07-01
---

# A社你解释下，啥叫Sonnet 5比Fable 5还贵？

#####  克雷西 发自 凹非寺
量子位 | 公众号 QbitAI

刚刚，Claude又又又更新了。

但这次不是旗舰，Anthropic推出了新版性价比模型  Sonnet 5  。

A社把它定位成迄今为止“最能干活”的Sonnet，能自己规划任务、调用浏览器和终端。

其  跑分逼近自家最贵的Opus 4.8，价格却只要后者的六成左右  ，着实一款“Opus平替”。

具体数字摆在那儿，其agentic coding跑分SWE-bench Pro 63.2%，比上一代Sonnet 4.6高出5个百分点。

标价则是跟4.6比一字不差，从发布会的口

## 核心要点

> 本文为微信公众号文章，由 WeChat backfill 收录。

## 详细信息

---
source: wechat
source_url: https://mp.weixin.qq.com/s/3zQr82n9hSWcCrXmf4nc7g
ingested: 2026-07-01
feed_name: 量子位
wechat_mp_fakeid: MP_WXS_3236757533
source_published: 2026-07-01
---

# A社你解释下，啥叫Sonnet 5比Fable 5还贵？

#####  克雷西 发自 凹非寺
量子位 | 公众号 QbitAI

刚刚，Claude又又又更新了。

但这次不是旗舰，Anthropic推出了新版性价比模型  Sonnet 5  。

A社把它定位成迄今为止“最能干活”的Sonnet，能自己规划任务、调用浏览器和终端。

其  跑分逼近自家最贵的Opus 4.8，价格却只要后者的六成左右  ，着实一款“Opus平替”。

具体数字摆在那儿，其agentic coding跑分SWE-bench Pro 63.2%，比上一代Sonnet 4.6高出5个百分点。

标价则是跟4.6比一字不差，从发布会的口径上看，能力涨了，价格没涨。

真的没涨……吗？

开发者Simon Willison了件简单的事，把同一段文字分别喂给新旧两个模型计数。

结果发现，Sonnet 5虽然表面上价格一样，但  账单上的Token消耗数字偷偷涨了三成  。

好你个A÷，搁这玩起偷梁换柱那一套了。

##  “Opus平替”

Sonnet 5这次升级的重点，是  Agentic能力的提升  。

模型可以自己拆解任务、调用浏览器和终端这类工具，把一件多步骤的活一口气干完，中间不掉链子，干完之后还会主动检查一遍自己的输出，不用人提醒。

跑分上能看到具体的台阶。

agentic coding测试SWE-bench Pro，Sonnet 5拿到63.2分，Sonnet 4.6是58.1分，Opus 4.8是69.2分，Sonnet 5站在两代之间，离Opus只差6分。

computer use测试OSWorld-Verified，Sonnet 5是81.2%，Opus 4.8是83.4%，差距缩到2.2个百分点。

而在知识工作类测试GDPval-AA v2上，Sonnet 5拿到1618分，反而比Opus 4.8的1615分还高出3分。

早期用上这款模型的两家公司给出的反馈印证了这一点。

AI编程平台Factory的工程师Zimu Li说，Sonnet 5 给他们的智能体提供了一层扎实的执行能力，能在杂乱的技术环境里持续编码、调用工具、排查问题，尤其适合那种需要长时间跟进、对技术细节要求高的工作流。

自动化平台Zapier的工程师Daniel Shepard给了一个更具体的例子，他们交给Sonnet 5一项两段式任务，先更新Salesforce里的客户账户等级，再给企业客户发一封产品上线公告邮件。

这种任务过去常常卡在中间，比如账户等级改完了，公告却没发出去，或者反过来。这次Sonnet 5把两段任务从头跑到尾，没有中途停下来等人接手。

Shepard的原话是，对日常自动化来说，这种模型不用多想就该用。

Anthropic同时公布的安全评估结果，跟这条主线是配套的。

Sonnet 5的幻觉率和谄媚倾向都比Sonnet 4.6低，在自主调用工具的场景下，Sonnet 5也更能抵抗提示词注入这类劫持攻击。

而且这组性能数字放在价格旁边看，意味才显出来。

Opus 4.8的标价是每百万输入/出Token要5/25美元，Sonnet 5则是3/15美元，只要Opus的六成左右，叠加8月底前的限时优惠则只要四成。

从账面上看（记住这五个字，要考），性能够到对方九成以上，价格却只要四到六成，Sonnet 5实际上就是一款Opus平替。

##  Sonnet 5，真的更便宜吗？

性能这条线讲完了，价格这条线开始露出另一面。

Sonnet 5用了一套新的分词器，也就是模型把文字切成Token的方式。

新的分词器当中，同一段文字现在被切成了更多份Token，算下来的总费用自然就比以前高。

发现这一点的，是开发者Simon Willison。

他没有停在官方那句“价格不变”上，转头拿自己写的Token计数工具实测了几份不同语言的真实文档。

其中英文版，Sonnet 4.6算出2356个token，Sonnet 5算出3341个，  涨了42%，西班牙语版涨了33%  。

一份4279行的Python代码，Token数则是从44014涨到56118，涨了27%。

唯独简体中文版几乎没动，从3334涨到3360，只多了1%。

同一次分词器换代，

## 原文

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/a社你解释下啥叫sonnet-5比fable-5还贵.md)

---

