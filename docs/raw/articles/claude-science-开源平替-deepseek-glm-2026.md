---
source: wechat
source_url: https://mp.weixin.qq.com/s/E8f2i7zwKG9q2Egs2kXIqA
ingested: 2026-07-07
feed_name: 量子位
wechat_mp_fakeid: MP_WXS_3236757533
source_published: 2026-07-07
sha256: f86c3fe2626518fb60ae84ffe9eb30b373214d50dbe289be0517577761e89f85
---


# 完全免费！Claude Science开源平替，DeepSeek/GLM想用哪个用哪个

##### 一水 发自 凹非寺  
量子位 | 公众号 QbitAI

学术人狂喜！！

Anthropic的Claude Science上线还不到一周，开源社区就亮出了自己的答卷。

一家由YC孵化的AI科研团队，**交出了「Claude Science开源平替版」OpenScience** 。

同样是覆盖文献检索、假设生成、代码实验到论文撰写的全流程AI科研工作台，但它不绑定任何一家模型厂商。

DeepSeek、GLM、Claude、GPT……甭管国内还是国外，你想用哪个就用哪个。

而且项目采用对开发者最为友好的Apache 2.0协议，仅需一行命令即可安装。

消息一出，项目直接冲上X热搜。人们纷纷直言：

> 这才是scientific AI该有的样子。 _（A社：报我名得了）_

##  Claude Science虽强，但用不了啊…

大约5天前，Anthropic在MIT Technology Review的一场闭门活动上，正式发布了Claude Science。

**这是一个专门面向科学家的AI工作平台，提供研究人员最常用的各种工具和软件包** 。

举个例子，以前一个科研人员要完成一项研究，得在PubMed上查文献，用Jupyter写代码，拿R跑统计，SSH连集群提交任务，再用各种工具画图、写论文。

十几个窗口来回切，光是工具间的「转换」就足够消耗大量精力。

而Claude Science想干的，就是把这些全塞进同一个工作台。

具体来看，它做了几件比较关键的集成：

**数据库和工具链层面** ，内置了60多个科学数据库连接器和预配置技能包，覆盖基因组学、单细胞分析、蛋白质组学、结构生物学、化学信息学等常见科研领域。

你用自然语言提问，专业Agent会自动跨库查询，UniProt、PDB、Ensembl、ChEMBL、GEO这些数据库不用挨个翻。

它还接入了英伟达的BioNeMo Agent Toolkit，可以直连Evo 2、Boltz-2、OpenFold3等生命科学模型。

**执行层面** ，它引入了多智能体架构。

主Agent负责整体规划，子Agent并行处理不同任务，还有一个Reviewer Agent，专门负责做事实核查，比如检查引用、验证计算结果、标注潜在错误。

**生成的结果也不只是文本输出** ，3D蛋白质结构、基因组浏览器轨道、化学结构式这些内容，它都能原生渲染。

而且每张图表都会同时保留生成代码、运行环境、自然语言说明和完整对话历史。

在某些场景里，科学家甚至可以直接用一句话改图，系统自动回写底层代码。

**算力层面** ，Claude Science可以直接对接你实验室已有的基础设施。

笔记本、Linux服务器、HPC集群登录节点都行，通过SSH连接或者Modal账户按需调用云端GPU，从单卡扩展到数百卡。

大规模数据集只需加载一次，敏感数据不用离开你自己的系统，只有每一步分析需要的上下文才会发送给Claude。

早期的内测用户已经跑出了一些实际案例。

艾伦研究所的神经科学家Jérôme Lecoq用它搭了一个多智能体「计算评审模板」，包含约20个自定义技能，让子Agent读数千篇论文、提取核心观点和定量数据，再逐章生成综述。

就这么说吧，以前写一篇综述要两年，现在他手上已经有大约10篇——

许多超过100页，且引用全部经过Reviewer Agent核验。

而UCSF脑肿瘤中心的Stephen Francis用它做胶质瘤的分子流行病学研究，跑germline变异分析。

他说Claude Science把原本需要的时间压缩到了十分之一，而且他的团队独立验证了结果，确认分析既快又靠谱。

结合今年3月哈佛物理学家马修·施瓦茨对AI科研能力的评价，目前Claude的水平大约相当于一位研二学生。

他在Anthropic官方博客发表了一篇客座文章「Vibe Physics: The AI Grad Student」，里面记录了他用Claude Opus 4.5完成一篇理论物理论文的全过程。

当时他给出的结论是：

**当前AI的科研能力大约相当于一名研二学生，能干活、不喊累，但每一步都需要导师盯着** 。

这个判断后来也被Anthropic写进了Claude Science的技术文档，作为产品定位的一个校准点。

不过，Claude Science目前有几个硬限制：

  * 只支持macOS和Linux
  * 仅面向Pro/Max/Team/Enterprise付费用户
  * 在平台上只能用Claude自家模型

这几道门槛叠在一起，尤其对国内科研团队来说，Claude Science就成了「可望不可即」的东西。

## 好消息：开源平替来了

瞄准以上限制，开源项目OpenScience应运而生。

其背后团队名为Synthetic Sciences，2025年在旧金山成立，今年刚从YC 2026冬季批次毕业。

创始团队的野心不小，要造一个平台，让科学家把复杂的研究任务直接委托给「AI联合科学家」(AI co-scientists)，从文献综述到假设生成到实验执行到论文撰写，整条链路都让AI自主跑通。

他们内部有一个核心判断：

科学基础模型需要具备真正的「研究品味」(research taste)，而这种品味靠单纯堆参数堆不出来，必须产品和模型两条腿走路，用产品收集高质量的科研过程数据，再用这些数据训练出有品味的模型。

OpenScience，就是这条路线落地的第一个产品。

虽然OpenScience的使命和Claude Science一样，但它们有一个根本性区别：

**模型不可知（model-agnostic）** 。

用Synthetic Sciences自己的话说：

> 科学AI应该是开放的，不该由一家公司垄断人类用来探索发现的工具，更不该由它来决定谁有资格使用。

所以在这个平台，Anthropic、OpenAI、Google、DeepSeek、GLM……只要你手里有API Key，都能直接接。

甚至可以跑本地模型，用Ollama部署，数据一个字节都不用出你的机器。

你的Key留在本地，请求直连模型提供商，不经过任何中间服务器。

而且，**OpenScience支持按请求切模型** 。

同一个工作台里，你可以这一步用Claude，下一步换DeepSeek，不需要改任何配置。

功能层面，OpenScience甚至比Claude Science更激进——

内置250多个研究技能包，是Claude Science的4倍多，覆盖ML、计算生物学、化学信息学等方向，而且全部可读、可编辑、可扩展。

安装也很简单，终端一行命令：

即开即用，浏览器自动弹出工作台。首次运行选个模型来源，填上API Key，就能开始干活。

想全局安装也行：

嫌配Key麻烦的话，团队还提供了一个托管平台Atlas——

充值钱包直接调用多家前沿模型，不用挨个配Key，还有持久化的研究图谱和云端算力。

但这个Atlas不是必须的，你用自己的Key跑OpenScience，一样可以完全免费用起来，没有门槛。

## One More Thing

有意思的是，翻到OpenScience的GitHub页面最底部，你会看到一段特意加上的声明：

> OpenScience is an independent project. It is not affiliated with, endorsed by, or sponsored by Anthropic. “Claude” is a trademark of Anthropic, PBC, used here only to describe compatibility.

翻译翻译，我们是独立项目，跟Anthropic没有任何关系。提到「Claude」纯粹是说兼容性，别多想。

看来当初的「龙虾」给整个开源社区留下的印象，还是太深刻了。

OpenClaw几度更名在前，OpenScience这次直接把撇清关系的声明焊死在README第一版里。

无他，先活下来，再谈平替（doge）。

开源地址：  
https://x.com/i/trending/2073904804829741364?s=20

参考链接：  
[1]https://x.com/SynScience/status/2073829478393086311?s=20  
[2]https://x.com/i/trending/2073904804829741364?s=20  
[3]https://www.openscience.sh/  
[4]https://www.anthropic.com/news/claude-science-ai-workbench

**一键三连****「点赞」「转发」「小心心」**

**欢迎在评论区留下你的想法！**

— **完**  —

**🌟 点亮星标 🌟**

**科技前沿进展每日见**
