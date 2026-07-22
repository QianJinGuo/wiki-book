---
source: wechat
source_url: https://mp.weixin.qq.com/s/6xtWMKsp0uvrsPUrhVXmTw
ingested: 2026-07-07
feed_name: 量子位
wechat_mp_fakeid: MP_WXS_3236757533
source_published: 2026-07-07
sha256: 7b883b6528bc062de020e602213c05dd114fa8f6db99d8e1dc0d52bd1bc85ee0
---


# 让GUI Agent不再「边做边忘」：快手、浙大提出MemGUI-Agent，攻克长程GUI任务

##### MemGUI-Agent团队 投稿   
量子位 | 公众号 QbitAI

手机GUI Agent正在从「看懂屏幕、点击按钮」走向更复杂的跨App自动化任务：

> 查商品参数、记笔记、更新通讯录、阅读新闻、整理社交媒体信息……

这些任务听起来并不复杂，但对现有手机GUI Agent来说，一个核心难题始终存在：**任务一长，就容易忘。**

在短程任务中，多模态大模型驱动的GUI Agent已经能较好理解截图、推理用户目标，并执行点击、输入、滑动等操作。

但一旦任务跨越几十步、多个App、多次页面跳转，Agent就会遇到明显的上下文退化：前面看到的价格、联系人、规格、日期、验证码、待写入文本等关键信息，可能在后续步骤中被稀释、转述错误、截断，甚至完全遗忘。

针对这一问题，来自**浙江大学APRIL实验室和快手主站技术部** 的研究者提出了**MemGUI-Agent** ：一个面向长程手机GUI任务的端到端Agent。

  * 它的核心思想不是简单把prompt变得更长，而是让Agent在执行UI操作的同时，主动决定「该压缩什么历史」「该记住什么UI事实」「该如何描述当前步骤」。
  * 论文同步开源了截至目前平均步数最长的手机GUI Agent开源数据集**MemGUI-3K** 。
  * 使用MemGUI-3K训练得到的MemGUI-8B-SFT刷新了手机GUI Agent的两个最具挑战的长程任务评测基准**MemGUI-Bench和MobileWorld的open-data模型的最好成绩** 。

###### **△** 上下文成本与主要benchmark结果

论文的第一作者为浙江大学APRIL实验室的博士生刘广义，通讯作者为浙江大学刘勇教授。MemGUI-Agent**全链路开源** ，代码、数据、模型、训练/评测pipeline都已开放。

已关注

__

关注

__ 重播 __ 分享 __ 赞

关闭 __

**观看更多**

更多 __

__

__

__

_退出全屏_

[ __](<javascript:;>)

_切换到竖屏全屏_ _退出全屏_

量子位已关注

[ __](<javascript:;>)

分享视频

 __，时长 01:41

0/0

00:00/01:41

切换到横屏模式 

继续播放

进度条，百分之0

 __

[播放](<javascript:;>)

00:00

/

01:41

01:41

[倍速](<javascript:;>)

 _全屏_

 __倍速播放中

[ 0.5倍 ](<javascript:;>)[ 0.75倍 ](<javascript:;>)[ 1.0倍 ](<javascript:;>)[ 1.5倍 ](<javascript:;>)[ 2.0倍 ](<javascript:;>)

[ 超清 ](<javascript:;>)[ 流畅 ](<javascript:;>)

您的浏览器不支持 video 标签 

__

继续观看

让GUI Agent不再「边做边忘」：快手、浙大提出MemGUI-Agent，攻克长程GUI任务 

观看更多 __

转载

,

让GUI Agent不再「边做边忘」：快手、浙大提出MemGUI-Agent，攻克长程GUI任务

 __

量子位 已关注

分享点赞在看

 ____已同步到看一看[写下你的评论](<javascript:;>)

 __

[ 视频详情 ](<javascript:;>)

###### **△** 效果速览：MemGUI-Agent端到端自主完成长程GUI Agent任务

## 长程手机任务的瓶颈，不只是「看不清」，更是「记不住」

传统ReAct风格GUI Agent通常会把每一步的思考、动作和结果追加到上下文中。短任务里这很自然：模型一步一步看历史，就能推断下一步。但在长程任务中，这种「被动追加」会带来两个问题。

第一是**prompt explosion** ：随着任务步数增加，历史记录线性膨胀，输入越来越长，计算成本也越来越高。

第二是**information loss** ：大量历史记录混在一起后，关键事实反而会被噪声淹没。比如Agent在Amazon中查到iPhone17 Pro的屏幕尺寸、电池容量和存储选项，几十步后再去Joplin写笔记时，可能已经只记得「查过参数」，但忘了具体数值。

论文指出，手机GUI长程任务尤其需要保存跨屏幕、跨步骤、跨App的UI衍生事实，例如价格、电话号码、商品规格、社交媒体帖子内容、待复制文本等。仅靠被动追加历史，既不紧凑，也不可靠。

###### **△** ReAct被动追加历史vs.MemGUI-Agent主动上下文管理

## ConAct：把上下文管理变成Agent的「动作」

MemGUI-Agent的关键设计是**Con** text-as-**Act** ion（**ConAct** ）。它将上下文管理提升为和UI点击、输入、滑动同级的「第一类动作」。换句话说，Agent每一步不只输出下一次点击哪里，还要同时输出如何整理自己的工作记忆。

ConAct将Agent的上下文拆成三个结构化字段：

  * **Folded Action History（折叠动作历史）：** 用于保存被压缩后的历史轨迹。它不再机械记录每一步，而是由模型主动把完成的子任务折叠为可复用摘要。
  * **Folded UI State（折叠UI状态）：** 用于保存关键UI事实。比如完整电话号码、商品价格、规格参数、联系人信息等。论文特别强调，这里存的不是「我看到了一个价格」这样的模糊摘要，而是完整内容。
  * **Recent Step Record（最近步骤记录）：** 记录最近一步的屏幕观察、动作意图、执行动作和结果，为后续折叠历史或写入记忆提供可靠原料。

在每一步中，MemGUI-Agent会输出五段结构化内容：thinking、folding、tool_call、ui_observation和action_intent。其中，tool_call既可以是常规UI动作，也可以是memory_add、memory_update、memory_delete这样的记忆操作。

这意味着，上下文管理不再是外部总结器、检索器或规则模块的工作，而是由同一个多模态策略模型在单次前向推理中完成。Agent看到当前截图、任务目标和已有上下文后，会同时决定下一步操作和记忆整理方式。

###### **△** ConAct pipline

## 为什么不是「加个提示词」就够了？

一个很容易想到的问题是：既然ConAct只是多了一套结构化输出协议，那是否直接把它套到现有模型上就能提升效果？

论文给出的答案是否定的。作者在Qwen3-VL不同规模模型上做了零样本实验，发现只有最强的Qwen3-VL-235B-Thinking能明显受益于ConAct；而较小规模模型或235B-Instruct在零样本下使用ConAct，性能往往下降。

这说明主动上下文管理并不是一个简单prompt trick。模型必须学会何时压缩历史、何时写入UI记忆、如何生成可复用的步骤描述。为此，研究者进一步构建了**MemGUI-3K** 数据集，用于监督训练较小规模模型。

###### **△** 不同Qwen3-VL规模模型零样本使用ConAct的结果

## MemGUI-3K：教会8B模型做长程上下文管理

MemGUI-3K由MemGUI-Bench的128个种子任务扩展而来。研究者使用实体替换、记忆操作增强、任务简化三种方式，将任务池扩展到7303个任务，其中5293个进入teacher rollout。

在数据收集阶段，作者使用Qwen3-VL-235B-Thinking作为teacher，按照完整ConAct协议在Android环境中执行任务。随后通过MemGUI-Eval进行轨迹级过滤，并进一步做step-level reasonableness filtering：即使一条轨迹最终成功，其中一些冗余、错误或绕路步骤也不会被用于监督训练。

###### **△** MemGUI-3K数据收集与过滤流程

最终，MemGUI-3K包含**2956条成功轨迹** ，覆盖**26个Android App、7类功能场景** ，并提取出**64430个SFT样本** 。训练集包含57951个合理步骤，测试集包含6479个合理步骤。

从数据统计看，MemGUI-3K的平均轨迹长度为**28.8步** ，中位数为25步；65.1%的轨迹使用了至少一次memory action；23.8%的folding是span-level fold，即把多个步骤压缩成一个完成子任务的摘要；88.7%的轨迹至少包含一次span-level fold。这些统计说明，该数据集不只是教模型点击屏幕，更是在教模型如何在长程任务中管理自己的工作记忆。

###### **△** MemGUI-3K数据统计

## 主结果：235B零样本刷新MemGUI-Bench，8B SFT泛化到MobileWorld

实验中，作者报告了两类Agent设定。

第一类是**MemGUI-Agent-235B** ：它保持Qwen3-VL-235B-Thinking权重不变，只在零样本设置下使用ConAct协议。

第二类是**MemGUI-8B-SFT** ：它从Qwen3-VL-8B-Instruct出发，在MemGUI-3K上进行LoRA SFT，得到一个8B规模的端到端长程手机GUI Agent。

在MemGUI-Bench上，MemGUI-Agent-235B达到**37.5% Pass@1/62.5% Pass@3/46.8% IRR** 。相比同一235B backbone的ReAct风格基线，Pass@1提升13.3个百分点，Pass@3提升15.6个百分点，IRR提升16.8个百分点。与Gemini-2.5-Pro驱动的agentic workflow相比，它也取得了更强的整体表现。

更值得注意的是8B模型。MemGUI-8B-SFT在MemGUI-Bench上达到**23.4% Pass@1/35.9% Pass@3/30.2% IRR** ，相比Qwen3-VL-8B-Instruct基线分别提升14.0、15.6和15.1个百分点，达到了open-data的8B模型在MemGUI-Bench上的最佳表现。

###### **△** MemGUI-Bench（平均步数36步）leaderboard

在分布外benchmark MobileWorld GUI-Only上，MemGUI-Agent-235B获得**29.1% success rate** ，比Qwen3-VL-235B-Thinking基线高14.6个百分点。MemGUI-8B-SFT获得**17.9% success rate** ，比Qwen3-VL-8B-Instruct高8.5个百分点，也超过了OpenMobile-8B的17.7%。

###### **△** MobileWorld GUI-Only（平均步数27.8步）leaderboard

## 不是单一模块奏效，而是三件事必须配合

为了拆解ConAct的作用，论文在MemGUI-Bench-40上做了组件消融实验。

ReAct baseline的Pass@1只有**5.0%** 。单独加入UI memory actions后，Pass@1提升到**17.5%** ；单独加入history folding后，Pass@1提升到**22.5%** ；单独加入self-describing step后，Pass@1提升到**25.0%** 。

但真正显著提升来自完整ConAct：Pass@1达到**40.0%** ，Pass@3达到**62.5%** ，IRR达到**51.0%** 。

这说明三个组件解决的是不同问题：history folding控制上下文增长，UI memory保存精确事实，self-describing step为后续记忆和折叠提供可靠的屏幕观察与动作意图。少了任意一项，长程任务中的信息流都会不稳定。

###### **△** ConAct组件消融实验

## 案例：从「看过」到「记住并正确使用」

###### **△** case study

图像展示了MemGUI-Agent-235B的两条zero-shot成功轨迹：上半部分是在MemGUI-Bench中完成商品规格对比并写入Joplin，下半部分是在MobileWorld中跨Mastodon、Contacts和Messages更新联系人并发送短信。图中紫色为folded action history，橙色为memory writes，右侧虚线框展示最终保留下来的compact state。

这两个案例展示了长程手机GUI任务中的典型难点：关键信息往往只在中间某个页面短暂出现，但Agent需要在几十步之后、甚至切换到另一个App后继续准确使用。

在第一个案例中，Agent需要先在Amazon中分别搜索iPhone15 Pro、Samsung Galaxy S24 Ultra和Google Pixel8 Pro，记住每款手机的屏幕尺寸、电池容量和存储选项，最后再到Joplin中创建笔记并写入完整规格。第二个案例则要求Agent从Mastodon最新帖子中提取Olivia的新手机号和邮箱，更新Contacts，并在Messages中发送指定短信。

这类任务很容易让ReAct风格Agent出现「看过但忘了」的问题。MemGUI-Agent的做法是：在看到关键事实时主动写入UI memory，在完成阶段性子任务后把历史折叠成compact history。这样，模型后续不必从冗长操作记录中重新回忆，而是可以直接读取结构化状态，把前面看到的信息带到后面的App中继续使用。

## 失败分析：ConAct主要减少上下文诱发的幻觉

论文还对失败案例进行了分类，包括process hallucination、output hallucination、knowledge deficiency、intent misunderstanding和other。

在MemGUI-Bench-40的零样本消融设置中，Full ConAct将总失败数从**99降到58** ，下降约**41%** 。其中，process hallucination从52降到30，output hallucination从30降到13，改善最明显。

这表明ConAct主要解决的是「上下文导致的幻觉」：比如Agent忘记自己是否完成了某个中间步骤，或者已经看到过关键信息却在最终输出时写错。相比之下，knowledge deficiency和intent misunderstanding改善较小，说明模型的App知识、任务意图理解和环境鲁棒性仍然是后续瓶颈。

###### **△** 失败类型热力图

## 展望

MemGUI-Agent的意义在于，它把GUI Agent的「记忆」问题从外部工程模块推进到了策略模型内部：Agent不只是执行动作，还要学会管理执行过程本身。对于长程移动自动化任务来说，这可能是从「能点」走向「能办事」的重要一步。

 _论文：https://arxiv.org/abs/2606.19926  
项目主页：https://memgui-agent.github.io/  
Github：https://github.com/kwai/MemGUI-Agent  
Huggingface Daily Paper：https://huggingface.co/papers/2606.19926  
MemGUI-3K数据集：https://huggingface.co/datasets/lgy0404/MemGUI-3K  
MemGUI-8B-SFT模型：https://huggingface.co/lgy0404/MemGUI-8B-SFT_  


**一键三连****「点赞」「转发」「小心心」**

**欢迎在评论区留下你的想法！**

— **完**  —

  


【学术投稿】请在工作日发送邮件至：**ai@qbitai.com** ，标题注明【投稿】，并告诉我们：**你是谁** ，**从哪来** ，**投稿内容** 附上**项目/主页链接** ，以及**联系方式** 。

🎓 我们会 (尽量) 及时回复你 :)

****  
****

****🌟 点亮星标 🌟****

**科技前沿进展每日见**
