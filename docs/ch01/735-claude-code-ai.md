# 实锤了：Claude Code偷查用户，时区、中国AI实验室全是关键词

## Ch01.735 实锤了：Claude Code偷查用户，时区、中国AI实验室全是关键词

> 📊 Level ⭐⭐ | 5.1KB | `entities/实锤了claude-code偷查用户时区中国ai实验室全是关键词.md`

# 实锤了：Claude Code偷查用户，时区、中国AI实验室全是关键词

---
source: wechat
source_url: https://mp.weixin.qq.com/s/Rpo7Ig3NJmTc7rR6j9q82Q
ingested: 2026-07-01
feed_name: 机器之心
wechat_mp_fakeid: MP_WXS_3073282833
source_published: 2026-07-01
---

# 实锤了：Claude Code偷查用户，时区、中国AI实验室全是关键词

机器之心编辑部

今天，Anthropic 可谓「双喜临门」。

一方面发布了「迄今为止最具 Agent 属性的 Sonnet 模型」  [ Claude Sonnet 5  ](<https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2651042075&idx=1&sn=f0c4e013ca343f2fb8db68a4f4f2e6f2&scene=21#wechat_redirect>) ，性能接近 Opus 4.8。

另一方面对外宣称，美国商务部已解除对其 Claude Fabl

## 核心要点

> 本文为微信公众号文章，由 WeChat backfill 收录。

## 详细信息

---
source: wechat
source_url: https://mp.weixin.qq.com/s/Rpo7Ig3NJmTc7rR6j9q82Q
ingested: 2026-07-01
feed_name: 机器之心
wechat_mp_fakeid: MP_WXS_3073282833
source_published: 2026-07-01
---

# 实锤了：Claude Code偷查用户，时区、中国AI实验室全是关键词

机器之心编辑部

今天，Anthropic 可谓「双喜临门」。

一方面发布了「迄今为止最具 Agent 属性的 Sonnet 模型」  [ Claude Sonnet 5  ](<https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2651042075&idx=1&sn=f0c4e013ca343f2fb8db68a4f4f2e6f2&scene=21#wechat_redirect>) ，性能接近 Opus 4.8。

另一方面对外宣称，美国商务部已解除对其 Claude Fable 5 和 Mythos 5 的出口管制。Anthropic 将从明天开始恢复访问，并会很快分享最新进展。

根据美国商务部长霍华德・卢特尼克（Howard Lutnick）签署的一份协议内容，自 6 月 12 日和 6 月 26 日发出相关信函以来，Anthropic 已与美国政府密切配合，采取措施处理 Claude Mythos 5 和 Claude Fable 5 相关风险。

其中 Anthropic 承诺将主动发现并处理这些模型可能带来的安全风险；就 Mythos、Fable 以及未来模型的协议、标准和发布安排，与美国政府保持密切合作；并在发现恶意活动时向美国政府通报。

基于 Anthropic 已采取的行动和作出的承诺，以及美国商务部工业与安全局对 Claude Mythos 5 和 Claude Fable 5 当前转移风险的评估，  美国商务部决定撤回 6 月 12 日信函中的管制措施。

这意味着，Claude Mythos 5 和 Claude Fable 5 的出口、再出口、境内转移，包括视同出口和视同再出口，今后不再需要许可证。

不过，美国商务部保留重新评估这一决定的权利。如果情况发生变化，或者 Anthropic 未能履行承诺，美国商务部仍可能重新施加许可证要求。

不过，对于中国用户而言，我们一时还高兴不起来。

就在同一天，开发者社区上激烈讨论的是另一个话题：有人发现 Claude Code 会在用户不知情的情况下收集本地的代理和时区信息，并通过「隐写术」（Steganography）的方式，把这些信息隐藏在发往云端的提示词中。

Claude Code 被曝用隐形代码标记中国用户

最近，有人曝光 Anthropic 在 Claude Code 中偷偷植入了一段代码。

这段代码会自动检测用户是否使用中国时区、当前网络代理情况，以及是否连接到某些中国 AI 实验室相关的环境。

随后，它会将这些信息通过隐写方式嵌入到发给 AI 的系统提示中。

中国用户完全无法察觉，但 Anthropic 却能通过这些隐形指纹进行识别。

一名开发者在 Reddit 上首先提出质疑，随后在 GitHub 发布验证报告，称已对 Claude Code 的 2.1.193、2.1.195、2.1.196 三个版本进行代码核查，确认存在一套隐藏机制。该机制被定性为系统提示词中的隐蔽信息通道。

检测逻辑

据报告描述，Claude Code 会检测环境变量 ANTHROPIC_BASE_URL，这个变量通常在用户将 Claude Code 指向自定义 API 代理、而非官方端点 api.anthropic.com 时被启用。当检测到非官方路由时，程序提取代理域名，并读取用户系统时区，重点核查是否为 Asia/Shanghai 或 Asia/Urumqi。

使用 GLM5.2 进行分析

报告称，该域名会与一份解码后含 147 个条目的清单比对。清单包含百度、阿里巴巴、蚂蚁集团、字节跳动、Moonshot AI、MiniMax、Stepfun 等中国科技企业与 AI 实验室的域名，以及大量 Claude 转售或 API 镜像服务地址。

信息传递方式

争议核心在于信息的传递路径。

报告指出，Claude Code 未设置独立的 telemetry 字段上报数据。异常信息的载体就是系统提示词里那句最不起眼的「Today's date is...」。

当系统时区被识别为中国时区时，日期分隔符由短横线变为斜杠，例如 2026-06-

## 原文

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/实锤了claude-code偷查用户时区中国ai实验室全是关键词.md)

---

