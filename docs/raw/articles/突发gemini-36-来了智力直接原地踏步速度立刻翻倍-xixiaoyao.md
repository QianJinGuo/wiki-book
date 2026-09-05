---
source: wechat
source_url: https://mp.weixin.qq.com/s/UiR0DZtree46F2M5t0qmxg
ingested: 2026-07-22
feed_name: 夕小瑶科技说
wechat_mp_fakeid: MP_WXS_3207765945
source_published: 2026-07-21
sha256: 9b9f12ba1f77d4766139ae15f28fb874a22db9232d1379afbb17e9b819b70a4d
---
# 突发！Gemini 3.6 来了：智力直接原地踏步，速度立刻翻倍

---
source: wechat
source_url: https://mp.weixin.qq.com/s/UiR0DZtree46F2M5t0qmxg
ingested: 2026-07-22
source_published: 2026年7月22日 01:25
---

# 突发！Gemini 3.6 来了：智力直接原地踏步，速度立刻翻倍

家人们，就在刚刚，Google正式发布了Gemini 3.6 系列模型！

这次登场的一共三个模型：

  1. 面向普通用户和开发者推出的通用模型 Gemini 3.6 Flash：


  * 输出 token 消耗减少了约 17%，在 DeepSWE 上最高减少 65%
  * 输入：1.50 美元/百万 token
  * 输出：7.50 美元/百万 token


  2. 主打低成本和高吞吐的 Gemini 3.5 Flash-Lite：


  * 输入 $0.30/百万 token
  * 输出 $2.50/百万 token


  3. 面向网络安全场景的 Gemini 3.5 Flash Cyber：  
定价还没曝光，目前只给政府和还有Google定的受信任的合作伙伴限量开放

在正式开始详细介绍前，先给大家打一针预防针：

如果只看跑分，这次更新可能没有想象中那么炸裂—Gemini 3.6 Flash 的综合智能水平与上一代基本持平，代码能力也没有横扫同级模型，但是效率绝了！

## Gemini 3.6 Flash

Gemini 3.6 Flash 是 Gemini 3.5 Flash 的升级版，也是这次发布的主角。

根据 Artificial Analysis 的发布前测试，Gemini 3.6 Flash 在 Intelligence Index 上拿到了50 分，与 Gemini 3.5 Flash 持平（Ps：从综合智能表现来看，可以说完全没有实现代际跃升）：

在Gemini最擅长的知识类工作的基准GDPval-AA v2 上取得 1421 Elo，比上一代高 72 分：

它真正值得一说的提升，在速度和效率上。

Gemini 3.6 Flash 完成单项任务的平均时间从 2.7 分钟降至 1.3 分钟，缩短了一半以上；输出速度达到 每秒 304 个 token。与此同时，它的输出 token 消耗减少约 17%，在 DeepSWE 等特定任务上，降幅最高可达 65%。

虽然没有更聪明，但是确实做到了能用更少的 token、更短的时间完成同样水平的工作。

## Gemini 3.5 Flash-Lite

Gemini 3.5 Flash-Lite 面向的是另一类需求：高并发、低延迟和大批量任务。

它在 Intelligence Index 上取得 36 分，相比 Gemini 3.1 Flash-Lite 的 25 分提升了 11 分。

进步最明显的是智能体相关评测：GDPval-AA v2 提高 498 分，TerminalBench v2.1 提高 22.5 个百分点，Tau3-Banking 提高 7.8 个百分点。

速度同样是它的核心卖点，平均每任务用时从 1 分钟降至 0.6 分钟，输出速度达到 每秒 350 个 token。

不过，Gemini 3.5 Flash-Lite 的单次任务成本不降反升，从 0.04 美元增至 0.09 美元。

主要原因是输入和输出价格分别从每百万 token 0.25 美元和 1.50 美元，上调至 0.30 美元和 2.50 美元。尽管平均每任务的输出量已从 2 万 token 降至 1.3 万 token，但仍不足以抵消价格上涨带来的成本增加。

## Gemini 3.5 Flash Cyber

除了两款通用模型，Google 这次还公布了一个更垂直的成员：Gemini 3.5 Flash Cyber。

CodeMender 是 Google 的代码安全代理，主要任务就是是在代码中发现安全漏洞，并进一步生成和验证修复方案。 这次出的Gemini 3.5 Flash Cyber 将作为CodeMender的核心模型，服务于漏洞查找与修复流程。

按照 Google 的说法，它在代码安全任务上的表现达到了非常具有竞争力的前沿水平，并且运行成本也低于体量更大的模型。

Gemini 3.5 Flash Cyber 更像是 Google 对“专业模型+智能体”路线的一次验证： 以更轻量的 Flash 为底座，通过安全领域优化和专用代理，把模型能力集中到一个明确的高价值任务上。

安全代理往往需要持续扫描大型代码库、分析大量上下文，并反复验证修复结果。相比一味调用最强、最大的通用模型，针对网络安全任务优化的轻量模型，更有可能在能力、响应速度和运行成本之间取得平衡。 不过，Gemini 3.5 Flash Cyber 暂时不会向所有开发者开放。它将通过 CodeMender 独家提供，仅面向受信任的合作伙伴开展有限访问试点。

## 单看代码表现

在 Arena 公布的前端代码竞技场排名中，Gemini 3.6 Flash 以 1537 分位列第 12 名，相比 Gemini 3.5 Flash 的第 21 名有明显进步。

## 结语

目前，Gemini 3.6 Flash 和 Gemini 3.5 Flash-Lite 正在 Gemini App 中陆续上线，开发者也可以通过 Google AI Studio 和 Android Studio 的 API 使用新模型。

至于正在内测的 Gemini 3.5 Pro，以及已经开始训练的 Gemini 4，或许才是 Google 留给下一次能力跃升的真正看点。

最后，关于 Google 这次发布，我还有几句话想说

过去的大模型发布，最容易传播的是跑分又涨了多少，但是这几次跟Google家感觉已经不恋战了。。。它已经不太愿意继续纠缠于单纯的跑分竞争了。

Gemini 3.6 Flash 交出的依然还是近两年非常具有Google味儿的答卷：

综合智能分数可以不变，只要任务速度翻倍、token 用量减少、输出价格下降，模型依然能够获得非常实际的竞争力。

可能有人会问：是不是 Google 已经卷不动了？

但在我看来，这更像是大模型竞争进入下半场的一个信号。

当头部模型之间的能力差距逐渐缩小时，开发者真正关心的问题会越来越具体：同一个任务需要等多久？一次调用要花多少钱？长上下文是否稳定？能不能支撑大规模并发？

从这个角度看，Gemini 3.6 Flash 是 Google 又一次明确面向落地效率的升级。
