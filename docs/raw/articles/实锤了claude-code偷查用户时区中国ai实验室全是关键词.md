---
title: "实锤了：Claude Code偷查用户，时区、中国AI实验室全是关键词"
source_url: "https://mp.weixin.qq.com/s/Rpo7Ig3NJmTc7rR6j9q82Q"
ingested: 2026-07-01
sha256: 2bdffa9e42ba9184173b11219da1ea034871057d66fdb09bc2b9c94377441bf6
---
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

当系统时区被识别为中国时区时，日期分隔符由短横线变为斜杠，例如 2026-06-30 显示为 2026/06/30。「Today's date」中的撇号同时在 '、'、ʼ、ʹ等几种形近的 Unicode 字符间切换，用以标记本次请求命中域名清单、AI 实验室关键词，或两者兼有。这几种符号在常规界面中肉眼难以区分。

对普通用户来说，'、'、ʼ、ʹ这几个符号几乎无法用肉眼分辨，这也是这套机制得以长期隐藏的原因。如果分析属实，每一次符合条件的请求，都会携带这样一枚不易察觉的标记发往上游。

争议焦点

telemetry 数据采集在软件行业普遍存在。AI 公司出于防范滥用、遏制转售、规避制裁风险以及防止模型被蒸馏等考量，往往有充分动机去做用户行为识别。从这个角度看，Anthropic 希望遏制 Claude 访问权限在中国市场被违规转售，动机并不难理解。

争议点是实现方式而非目的本身。

对于公开披露的 telemetry 机制，开发者拥有充分的知情权和选择权，可以查阅文档、屏蔽特定端点，或者自行决定是否接受某项数据采集。但把标记信息藏进提示词里几乎无法被察觉的字符差异中，改变了用户与工具之间的信任前提。对一款 coding assistant 而言，这样的界限一旦被突破，代价不小。

权限背景

Claude Code 内置了一套权限系统，覆盖文件读取、Bash 命令执行与文件编辑等操作，其中只读类操作无需用户批准，涉及命令执行和文件修改的操作则需要经过权限确认。

Anthropic 此前也曾公开谈及 Claude Code 可能存在的「approval fatigue」（审批疲劳）问题，承认多数用户会习惯性批准权限请求，而完全关闭权限审批机制在绝大多数场景下并不安全。

该公司自己发布的工程博客里，也记录过 agentic misbehavior（智能体行为失控）的真实案例，包括误删远程 git 分支、意外上传 GitHub token，甚至尝试对生产数据库执行迁移操作。

Coding agent 工作在代码仓库内部，能够接触到源代码、文件结构、项目细节，乃至用户不慎暴露的密钥信息，并被赋予执行命令、修改文件的权限。对这样一款工具，信任本身就是其存在的根基。

如果 client 端会把 routing metadata 偷偷编码进提示词，用户自然有理由追问：还有哪些信息正在以类似方式被记录？client 端是否还存在其他未被公开的检测逻辑？这些行为究竟有没有在任何文档中说明过？

事件曝光后，Anthropic 技术团队成员 @trq212 对代码实现原因作出回应，并表示这段代码将在次日发布的新版本中被移除。

参考链接：

https://news.ycombinator.com/item?id=48734373

https://thereallo.dev/blog/claude-code-prompt-steganography

https://x.com/IntCyberDigest/status/2071971609183678544?s=20

https://www.internationalcyberdigest.com/claude-code-accused-of-hiding-china-proxy-fingerprints-inside-system-prompts/

© THE END

转载请联系本公众号获得授权

投稿或寻求报道：liyazhou@jiqizhixin.com

