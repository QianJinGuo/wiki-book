---
source: wechat
source_url: https://mp.weixin.qq.com/s/tdjlCrO7cQd-_PX_fcOz3g
ingested: 2026-08-29
feed_name: AGI Hunt
wechat_mp_fakeid: MP_WXS_3087832081
source_published: 2026-07-24
sha256: 614c11b7f045928b
---

刚刚，Claude Opus 5 终于发布了！

Opus 5 发布

我 Claude 里的默认模型也已经悄悄换成了 Opus 5：

default opus 5

官方给它的定位是：

> “  Opus 5 是一个周到且主动的模型，以一半的价格，提供接近 Fable 5 的前沿智能。

措辞上说的是「接近」，但从跑分表看就会发现其实在大多数项目上，Opus 5 已经把 Fable 5 反超了。

01

##  半价前沿

API 定价是每百万 token 输入 5 美元、输出 25 美元，和上一代 Opus 4.8 完全一致，但只有 Fable 5（10 / 50 美元）的一半。

我们知道，Fable 5 是 A 社 6 月 9 日发布的最强公开模型，也是史上最贵的通用模型；同一底座的 Mythos 5 则只向 Project Glasswing 的少数合作伙伴开放。

所以这次的 Opus 5 就是：一个半价的新模型，多数跑分反而压过了自家最贵的旗舰……

可用性上，所有付费套餐和 Claude API 今天直接可用，模型 ID 是  ` claude-opus-5  ` 。Claude Max 的默认模型已经切了过去，Pro 用户能用到的最强模型也是它。

上下文窗口是 1M token，另外还提供一个 Fast 模式，速度约为默认的 2.5 倍（价格也翻倍……）。

02

##  反超 Fable 5

先看官方给的这张总表，十几个项目里，Opus 5 拿下了绝大多数：

Opus 5 基准总表

Agentic 终端编码（Frontier-Bench v0.1）拿到  ** 43.3%  ** ，Fable 5 是 33.7%，Opus 4.8 只有 21.1%，一代直接翻了一倍还多。

知识工作（GDPval-AA v2）  ** 1861  ** ，同样压过 Fable 5 的 1747。

Agentic 搜索（BrowseComp）90.8%，电脑操作（OSWorld 2.0）70.6%，业务流程（AutomationBench）26.0%，全都是第一。

SWE-bench Verified 也刷到了  ** 96.0%  ** 。

不过在 DeepSWE 上 GPT-5.6 Sol 仍以 72.7% 领先，法律和健康两项还是 Fable 5 和 Mythos 5 更强，无工具版的 Humanity's Last Exam 上，Fable 5 也还以 56.5% 对 56.3% 守住了一丝的领先。

而且这表里还有个小乌龙是，FrontierCode 一项Opus 5 的 53.4% 被涂成了领先的高亮色，可旁边 Fable 5 明明是 53.5%……

（这图不会是让 Opus 5 自己做的吧）

03

##  30.2% 的 ARC-AGI-3

ARC-AGI-3 的成绩方面：

ARC-AGI-3 成本对比

要知道该基准测的是模型解决从没见过的新题的能力，靠背题是刷不上去的。Opus 5 拿到了  ** 30.2%  ** ，而第二名 GPT-5.6 Sol 只有 7.8%，Opus 4.8 更是只有 1.5%。

04

##  更省 token

Anthropic 这次反复强调的另一个点是效率：在相近甚至更低的单任务成本下，跑赢其他模型。

Frontier-Bench 成本曲线

几组官方数据如下：

•  Frontier-Bench 上，成绩是 Opus 4.8 的两倍多，单任务成本反而更低

•  CursorBench 3.2 上，开最高 Effort 档时，距离 Fable 5 的峰值成绩不到 0.5%，单任务成本只有一半

•  OSWorld 2.0 上，只用 Fable 5 三分之一出头的成本，就超过了后者的最佳成绩

•  AutomationBench 上，相同成本下任务通过率约是第二名的 1.5 倍；哪怕开最低 Effort 档，完成的任务也比其他所有模型都多

（注：Effort 是可调节的思考强度档位，档位越高，模型想得越多，也越贵）

OSWorld 成本曲线

Anthropic 官方人员 Alex Albert 表示，团队在跨领域的 token 效率上投入了大量工作，而他自己在很多编码任务上，已经更愿意用 Opus 5 而不是 Fable 5 了。

AutomationBench 成本曲线

研究员 Nathan Lambert 的解读则是，这是更快的迭代速度加上规模化 RL 的产物，Fable 5 那个体量，目前反而还没办法好好做 RL。

HLE 成本曲线  05

##  Medium 档的怪曲线

这里还有个好玩的细节是，Opus 5 在 FrontierCode 上的最好成绩出现在 medium 档，53.4%；继续往上加思考强度，分数反而掉到了 48.0% 和 43.6%……

FrontierCode 各档位曲线

想得多反而错得多，可以理解为用力过猛的意思。

06

##  三个案例

官方博客里还给了几个例子。

第一个：给 Opus 5 一张机械零件图纸，要求它写代码在 FreeCAD 里重建三维模型，但故意不让它直接「看」图。它自己写了一套计算机视觉流程，从原始像素里提取几何形状，再把整个零件还原了出来，而且能反复成功。

同样配置下，其他模型试了五次都没能搞定。

不让看图就自己修条路

第二个是一个开源包管理器的真实 Bug：社区补丁漏了一个边界情况，Opus 5 找到了根因并把缺口补上；对照模型则只修了表面症状，然后便宣布 Bug 已解决……（这个场景，你可能并不陌生）

贴胶布还是拧阀门

第三个来自一家交易公司的工程师：用 Opus 5 在一个会话里完成了新交易所的行情数据接入。因为找不到实时数据做验证，它便自己搭了一套测试框架，来检查解析结果对不对。

没有陪练就自己造一个

除了案例，官方还放出了两个 Opus 5 直接做出来的交互 demo。

一个是风洞模拟，可以实时调整风速、旋转车身，观察气流怎么绕过一辆（或一个完全不符合空气动力学的）物体：

风洞模拟 demo

另一个是可交互的细胞图解，每个细胞器都按实测尺寸绘制，还能一层层切开来看：

细胞图解 demo

这两个 demo 都在线可玩，链接见文末。你可以自己上手感受一下。

07

##  最对齐的一版

安全方面，Opus 5 是 Anthropic 迄今对齐程度最高的模型。

自动化行为审计里，它的综合失准得分是  ** 2.30  ** ，低于 Opus 4.8 的 2.85 和 Mythos 5 的 2.81（Sonnet 5 是 3.35），欺骗行为的比例也是全家最低。

行为审计得分

对用户更实际的一点是：安全分类器的拦截会大幅减少。官方基于测试给出的预期是，比 Fable 5  ** 少拦大约 85%  ** 。

也就是说，你不会莫名其妙地降级到 Opus 4.8 了。

Anthropic 这次也刻意没用网络攻防任务去训练 Opus 5，但随着通用能力上来，它找漏洞的水平已经逼近 Mythos 5（79.4% 对 80.0%）；只在把漏洞变成可用攻击代码这一步，两者还差得很远。

漏洞识别与利用对比

所以护栏方面，也终于允许在源代码里找漏洞、修漏洞，拦截二进制层面的扫描、渗透和 Exploit 生成了。

而生物领域则反过来有所放宽，原本在 Fable 5 上会被拦的生物类请求，现在会转给 Opus 5 处理。

Opus 5 是目前面向科研场景最强的公开模型，有机化学任务比 Opus 4.8 高出 10.2 个百分点，蛋白质相关任务则高出 7.7 个百分点，不过在长时间自主研究任务上仍有明显限制。

08

##  感谢 K3

最后，我们应该感谢 Kimi K3，Fable 终于，不再是奢侈品了。

◇ ◆ ◇

官方发布页：https://www.anthropic.com/news/claude-opus-5

官方推文：https://x.com/claudeai/status/2080699495453528290

风洞 demo：https://assets.claude.ai/brand/artifacts/blog/opus/5-aeolus-demo.html

细胞 demo：https://assets.claude.ai/brand/artifacts/blog/opus/5-sectio-demo.html

AGI Hunt 链接：  https://agihunt.info/e/19f95175f79a3cc644ee936404e