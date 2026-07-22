---
source: wechat
source_url: https://mp.weixin.qq.com/s/KJRmzM13pA-EQUVa9BXHAA
ingested: 2026-07-09
feed_name: AGI Hunt
wechat_mp_fakeid: MP_WXS_3087832081
source_published: 2026-07-08
sha256: cd431c17eb0b087d58e77cff2c07022a4142ad8616f5448a75418ad27471c434
---


# Grok 4.5 上线：Opus 4.8 级能力，四分之一价格

终于，Grok 4.5 正式开始推送了。

Grok 4.501

## 模型信息

Grok Build、API 和 xAI Console 三个入口同时开放，核心的参数如下：

•  上下文窗口：500K tokens 

•  模态：文本 + 图像输入，文本输出 

•  定价：输入 $2 / 百万 tokens，输出 $6 / 百万 tokens 

而马斯克给它的定位是：**Opus 级的能力，但更快、更省、更便宜。**

对比一下 Opus 4.8 的 $5/$25，Grok 4.5 的价格真的是非常便宜……输入不到一半，输出更是不到四分之一。

  


02

## 马斯克官宣

马斯克在昨天便已亲自下场官宣：

马斯克官宣推文

> “ 基于 Beta 测试客户的强烈正面反馈，Grok 4.5 明天向公众开放。它是一个 Opus 级的模型，但更快、更省 token、成本更低。

现在，API 和 Console 已经开始推送了。

xAI Console 里的 grok-4.5

Console 的模型列表里，grok-4.5 已经就位：图像输入、结构化输出、推理、函数调用，全都可用。

官方公告里表示：Grok 4.5 的定位是 **SpaceXAI 迄今最强的模型** ，主打编码、agentic 任务和知识型工作，并且是和 Cursor 联合训练的。

还有个小细节是，这里说的已经是 SpaceXAI 而不是 xAI 了。

03

## V9 基座

官方公告目前尚未透露模型参数和技术架构，但据流出的信息：Grok 4.5 跑在 xAI 全新的 V9 基座上，此前给 Grok 撑流量的还是 V8-small。

•  参数规模约 1.5 万亿，是 V8-small（约 0.5 万亿）的三倍 

•  xAI 迄今发布的最大模型 

训练方面，官方确认用了**数万块 NVIDIA GB300** ，预训练阶段在数据过滤、去重、质量打分和领域化整理上下了重注。

后训练则是一场覆盖**数十万个任务** 的大规模强化学习，重点全押在多步软件工程和技术型工作上，判分靠自动化判题加模型判题；为了支撑超长的 agentic rollout，还专门搞了一套异步训练架构。

官方的总结是：**规模化强化学习，聚焦 per-token intelligence（每个 token 的智能密度）。**

这里有个重要的背景：SpaceX 在今年早些时候收购了 Cursor，团队也已并入 xAI。

所以 Grok 4.5 的补充训练里，加入了 Cursor 的真实开发数据：真实的 bug、真实的调试过程、真实的架构决策，而不只是「高质量代码」的语料。

且据称，模型的强化学习目前还在持续进行，用的是 Grok Build 的自动化软件工程环境来提供客观的通过/失败信号。也就是说，现在放出来的这个版本，后面还会继续变强。

而发布之前，Grok 4.5 已经在 Tesla 和 SpaceX 内部私测了几周。马斯克说的「Beta 测试客户的强烈正面反馈」，指的应该就是自家人。

再往后看，下一代 Grok 5 的目标参数规模是 6 万亿以上，非常之大（毕竟有卡）。

04

## 再说价格

鉴于 Grok 一如既往的高性价比，所以还是再来展开说说价格。

xAI 官方文档里，grok-4.5 的介绍词写的是：**我们造过的最智能、也最快的模型** ，推荐用于代码、聊天和通用任务。

放进 Grok 全家桶里对比，是这样的：

模型| 上下文| 输入 $/1M| 输出 $/1M  
---|---|---|---  
**grok-4.5**| **500K**| **$2.00**| **$6.00**  
grok-4.3| 1M| $1.25| $2.50  
grok-4.20 系列| 1M| $1.25| $2.50  
grok-build-0.1（Code API）| 256K| $1.00| $2.00  
  
可以看到，grok-4.5 在自家阵营里已经是最贵的了，输出价格是 grok-4.3 的 2.4 倍。

且有一点需要注意的是：它的上下文窗口是 500K，反而比 grok-4.3 的 1M 缩水了一半……应该是 1.5T 大参数在推理成本上的直接代价。

多模态方面，图像输入单张最大 20MiB，支持 jpg/png，张数不限。实时信息则要靠 Web Search / X Search 的搜索工具来补。

（对了，官方文档里 Grok 3 和 4 系列的知识截止时间都还停在 2024 年 11 月，4.5 的暂未标注。）

05

## 如何使用

普通用户这边，网页 Chat 的早期访问头几天只给 SuperGrok Heavy（$250/月）订阅用户，普通 SuperGrok（$25/月）用户还要再等等。

Grok 的每周使用限额，也在发布前被集体重置了一轮。

同时开发者这边，官方公告给出的入口有：

• **Grok Build 限时免费** ，且 Grok 4.5 已经是它的默认模型（CLI 安装地址：x.ai/cli） 

• **Cursor 全部套餐可用** ，不分档位 

•  API 走 SpaceXAI Console 开 key，模型名 `grok-4.5`

•  Word / PowerPoint / Excel 的 Office 插件，Microsoft Marketplace 可装 

官方还专门秀了一把 Office 场景：Excel 里做带联网调研和跨表公式的复杂模型，PowerPoint 里用原生形状画复杂图示，Word 里写正式文档。

欧盟用户再次遭受了唯一的坏消息，EU 暂不可用，预计 7 月中旬开放。

06

## 官方成绩单

benchmark 成绩如图：

官方 benchmark 对比

那么马斯克说的「Opus 级」，到底站不站得住呢？

对上 Opus 4.8，是互有胜负的局面：

Terminal-Bench 2.1 上 83.3 对 78.9，DeepSWE 上 62.0 对 55.8，这两项 Grok 4.5 胜出；而 SWE-Bench Multilingual 和 SWE-Bench Pro 则反了过来，84.4 对 78.0、69.2 对 64.7，Opus 4.8 拿回两城。

（当然：Fable 5 每一项都还是第一……

公告里还补了两项成绩：更难的 DeepSWE 1.1 上，Grok 4.5 是 53 分，离 Fable 5（max）的 70 分还有明显距离；而在 Harvey 的法律 Agent 基准上，它则直接排到了第一。

不过图里还是有些小细节值得注意：Grok 4.5 跑的是 high 档推理强度，对位的 Opus 4.8 和 GPT-5.5 用的分别是 max 和 xhigh 档，理论上它还有些余量没掏出来。

而关于马斯克的「更省 token」，公告里给出的数据是：SWE-Bench Pro 的任务上，Grok 4.5 平均每个任务输出 15,954 个 tokens，Opus 4.8（max）则是 67,020 个，只有对方的四分之一左右。

至于「更强」这条，则还得等第三方（和你）来复测。

不过就算最后，测出来只是「接近 Opus」，1.5T 的参数、500K 的上下文，配上 $2/$6 的价格，这个性价比也已经非常之能打了。

只是，我的确是没开 SuperGrok Heavy 账号……

好在 Grok Build 现在限时免费，可以先去白嫖一把再说！

◇ ◆ ◇

官方公告：https://x.ai/news/grok-4-5

马斯克官宣：https://x.com/elonmusk/status/2074740539874775163

xAI 模型文档：https://docs.x.ai/developers/models
