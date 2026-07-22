---
source: wechat
source_url: https://mp.weixin.qq.com/s/AoDXDY8UoCnBQ4rs-0qRGQ
ingested: 2026-07-10
feed_name: AGI Hunt
wechat_mp_fakeid: MP_WXS_3087832081
source_published: 2026-07-09
sha256: 03adb32c8b4ea87d01f139d50ce19637f4a6c0e90d60055a05879bc45ef25bfd
---

# Meta 重回牌桌！推出匹敌 Opus 4.8 的编程模型：Muse Spark 1.1

刚刚，Meta 正式发布了 Muse Spark 1.1，一个主打 agentic 和 coding 的多模态推理模型。

Muse Spark 1.1

Alexandr Wang 的原话是：

> “ 在众多 agentic 评测中，它可以与 GPT-5.5 和 Opus 4.8 相媲美。现已通过全新的 Meta Model API 和 Meta AI 提供。

Alexandr Wang

而这次发布，还有个小小的名场面：扎克伯格本人时隔近三年，重新回到了 X 上亲自官宣。

扎克伯格官宣

要知道，他手握 30 多亿用户的多个社交平台，却在发布自家模型是跑到老对手马斯克的地盘上来吆喝叫卖……

有网友调侃说：

> “ 我们都很高兴他把密码找回来了。

01

## Agent 领跑

先看成绩单：

Benchmark 对比表

Muse Spark 1.1 在 MCP Atlas 上拿到了 88.1 分，是目前所有模型里最高的工具调用得分，而第二名 Opus 4.8 是 82.2。

JobBench（职业级工具使用）54.7，比 Opus 4.8 的 48.4 要高出 6 分。

HLE（Humanity's Last Exam，带工具）62.1，则拿下了第一！

三项核心评测

也就是说，在 Agent 这条线上，Muse Spark 1.1 基本把 Opus 4.8 和 GPT-5.5 都压过了一头。

在 Coding 方面则仍有些差距：SWE-Bench Pro 61.5，不敌 Opus 4.8 的 69.2；Terminal-Bench 上 GPT-5.5 依然是第一。

官方的措辞也算是很诚实了：benchmark 层面「与最好的模型站在一起，并在若干项上领先」。

我估算下来：编程水平大概是 GLM-5.2 同一档位。

02

## 从 17 分到 54.7 分

Muse Spark 1.0 是今年早些时候发布的，当时基本没什么水花。

而 1.1 这次的提升幅度，从得分上来看可以说是脱胎换骨了：JobBench 从 17 涨到 54.7，OSWorld 从 53.3 涨到 80.8，DeepSWE 长程编码从 10 涨到了 53.3。

对比 1.0 的编程提升

Vibe Code Bench 更是从 19.7 直接干到了 72.2。

Meta 内部还有一个自家的编码基准，Muse Spark 1.1 拿了 68.3，仅次于 Opus 4.8 的 69.0，压过了 GPT-5.5 的 67.1。据说，Meta 的研究员已经在用它自动化模型开发和评估的工作流了。

Meta 内部编码基准

关于这一版模型的训练过程，Meta 研究员 Shuchao Bi 透露：

> “ 我们加入了更多、更高质量的数据，投入了多得多的人力研究算力和 GPU 算力，并用上了一套更稳定的异步 RL 训练栈。

而且据团队成员透露，更大的模型现在正在训练中。

03

## 并行子智能体

其他能力上，Muse Spark 1.1 有几个地方值得关注：

**1M token 上下文，且带主动上下文管理** ：它会记得自己做过什么，能从很早的工作里找回信息，压缩上下文时还会保留后面要用的关键步骤。我们知道，很多长程 Agent 任务不是死在智力上，是死在上下文塞爆后，一压缩就忘了要干啥了……

**多智能体编排** ：它可以把执行任务分派给多个并行运行的子智能体，官方给的 WideSearch 曲线显示，多智能体模式的得分全线领先单智能体。

WideSearch 多智能体对比

**零样本泛化到新工具** ：新的原生工具、MCP server、自定义 skill，不用再专门训练便能直接上手。

04

## 会写脚本，也会点鼠标

Computer use 是这次的另一个重点。

它可以操作桌面、浏览器和手机，且被训练成知道什么时候该写脚本、什么时候该直接点界面：脚本快就写脚本，点击简单就直接点，每一步还会把动作批量打包执行，以节省 token 并加快速度。

官方放了个「晚餐聚会」的 demo：让它订餐时，朋友们中途改了时间，它自己注意到了变化，把订单也跟着改了，全程不用人管。

另一个 demo 是：拍一段自行车的视频，口述要求，它就能理解商品信息、自己操作浏览器，直接把这辆车挂上 Facebook Marketplace 开卖。

多模态方面，除了编码和智能代理功能之外，Muse Spark 1.1 还在感知、多模态推理以及工具使用方面表现出卓越的能力。它能够与现实环境进行交互，并生成有意义的输出结果。在将视觉信息转化为代码、生成高度描述性的图像和视频描述，以及执行多模态工作流程任务方面，Muse Spark 1.1 都表现出了强大的能力。

Muse Spark 1.1 的多模式功能在需要感知与行动同时发生的情况下尤为有价值。该模型可以处理视觉和听觉信息，能够在长时间的工作流程中保留细节，并在代表用户操作计算机时利用这些细节。

05

## 白菜价

然后是这次发布最狠的部分：**价格** 。

Meta Model API 定价

•  输入：$1.25 / 1M tokens 

•  缓存输入：$0.15 / 1M tokens 

•  输出：$4.25 / 1M tokens 

作为对比，Opus 4.8 的价格是 $5 输入 / $25 输出。也就是说，Muse Spark 1.1 的输入和输出价格，都不到 Opus 的五分之一，比[马斯克前一天发布的 Grok 4.5](<https://mp.weixin.qq.com/s?__biz=MzA4NzgzMjA4MQ==&mid=2453486517&idx=1&sn=33ea096036e6f5f543ac1095bbc1adf2&scene=21#wechat_redirect>) 还要便宜一丢丢。

有工程师网友在实测后表示：

> “ 这模型便宜得我几乎不敢信。实际用下来，它的成本约是 Fable 和 GPT 5.5 的十分之一。如果你以为开源模型会卷掉大家的利润，先看看这个吧：用 Muse Spark 1.1，竟然比自己托管开源模型还便宜。

关键是，它还非常快。

同一位工程师测得它的延迟约是 Opus 4.8 的四分之一、GPT-5.5 的二分之一。

ValsAI 榜单

ValsAI 榜单展示：前十名里，Muse Spark 1.1 的成本（$0.50）和耗时（388 秒）都是最低的。

Alexandr Wang 对此的总结是：

> “ 市面上最便宜的前沿 Agent 模型 :)

06

## 法律税务医疗登顶

模型甚至还在垂直领域拿下了不错的成绩。评测机构 ValsAI 表示：

> “ Muse Spark 1.1 在 MedScribe 和 TaxEval 上从 Fable 5 手里抢下了第一，同时成本只有其十分之一、速度快一倍。它还登顶了 Harvey 的法律 Agent 榜，距离 Grok 4.5 登顶还不到 24 小时。

Wang 的说法甚至带着点儿小得意：

> “ 很酷的是，我们的模型在一些领域甚至超过了 Fable :)

07

## Meta 首个 API

这次同步上线的还有 Meta Model API，公开预览版。

这同时也是，Meta 历史上第一次通过 API 开放自家最强模型。

以前开源的 Llama，它是给你权重自己部署，闭源模型则只在自家产品里用，这次也终于算是两条路线之外的第三条路了。API 兼容 OpenAI 格式，你只需要改个 endpoint 就能接上使用。

早期使用的合作伙伴有：Replit、Box、Cline。

Meta AI 已切换新模型

普通用户则可以直接在 Meta AI 的 App 和 meta.ai 网站里用，选 Thinking 模式，目前免费可用。  


08

## Llama 时代结束

不过，需要注意的是：**Muse Spark 1.1 不开源（没有开放权重）。**

这个靠 Llama 撑起大半个开源生态的 Meta，就这么转身了。也可以说：Llama 时代，从此正式结束。

不过，有个需要注意的细节是：HLE 这个基准，本来就是 Alexandr Wang 在 Scale AI 时期参与搞出来的，但愿……

不过不论如何，从 Llama 4 翻车后沉寂一年，到如今憋出一个能和御两家掰手腕、价格还只有几分之一的模型，

Meta 这次，是真的回到牌桌上了！（？）

◇ ◆ ◇

官方博客：https://ai.meta.com/blog/introducing-muse-spark-meta-model-api/

扎克伯格推文：https://x.com/finkd/status/2075218444056707458

Alexandr Wang 推文：https://x.com/alexandr_wang/status/2075218936266998230

Meta AI：https://www.meta.ai
