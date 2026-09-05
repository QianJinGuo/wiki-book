---
source: wechat
source_url: https://mp.weixin.qq.com/s/hWyXe4l24n_nHB-oZbWTrg
ingested: 2026-07-07
feed_name: 新智元
wechat_mp_fakeid: MP_WXS_3271041950
source_published: 2026-07-07
sha256: ce76da3c306635ddfa1e3e2cab9d00bb1a0e74e14294b72f895a2bf1fde58bae
---


# Claude Code惊人身世曝光！竟脱胎于安全对齐，Boris：才完成1%

### 

### 

**   ****新智元报道  **

##### **【新智元导读】** 从2021年Ben Mann带领团队构建早期VS Code扩展，到2024年Boris Cherny疯狂迭代，再到2025年Claude Code横空出世并彻底改变硅谷运转方式——整个故事像一部史诗。Claude Code之父却说说：「我们才完成了1%。」

Claude Code才完成1%！

Anthropic核心开发者Boris Cherny却抛出了Claude Code极度反常识的起源：**Claude Code，脱胎于Anthropic内部的安全对齐（Alignment）项目。**

  


而正是最激动人心的部分，在于后半段：

  


还有很多事情要做。我们才完成了1%。

  


因为1%的空间，意味着99%的未来还完全空白。

  


同一时间，**Claude官方首次爆料Claude Code起源史：**

  


  


**Anthropic官方页面《The Making of Claude Code》同步上线。**

  


传送门：https://www.anthropic.com/features/making-of-claude-code

  


  


**Claude Code差点被彻底遗忘**

  


故事要从2021年讲起。

  


Anthropic联合创始人兼Labs团队负责人Ben Mann回忆：

  


当我们创立Anthropic，并最终决定打造一款产品时——这本身在当时就是个颇具争议的决定——我们做的第一件事就是构建了一个编程助手。

  


  


研究工程师Dawn Drain刚加入Anthropic，她的主项目是：**让模型的编码能力至少达到我自己的水平** 。

  


同一时期，Shauna Kravec的强化学习团队已经在思考更激进的事——**自主软件工程** 。他们不是想做一个聊天机器人，而是想让模型真正「干活」。

  


为什么是coding？Shauna的回答至今仍然惊艳：

  


我们认为通往变革性AI的路径，必须经过自动化大规模软件工程工作。

  


  


2022年初，他们已经开始用RL训练模型写简单函数、然后测试正确性。

  


结果，最初模型表现非常糟糕。

  


  


与此同时，Ben Mann带领的团队做了一个VS Code扩展——一个早期的coding assistant。它能给出四个不同建议。2022年春天，这个工具在外部已经有大约100个用户了。

  


  


可紧接着，现实给了他们一记重锤。

  


**基础设施的噩梦** 出现了。

  


要做真正的agentic coding，你需要让模型在安全的环境里执行代码、读写文件、处理超时、处理失败……

  


这些问题，和如今所有人还在头疼的agent问题，几乎一模一样。

  


Dawn和同事花了很长时间才让模型在一个容器里拥有持久shell，能流式输入输出，还能优雅地处理超时。

  


然后，Ben Mann休完陪产假回来，发现大家「基本上把coding assistant忘了」。

  


  


研究侧却从未停止。

  


他们继续打磨agentic coding的核心零件：function calling、search、bash tool……这些今天看来理所当然的能力，在当时是硬仗。

  


  


**Anthropic「超前得让人尴尬」**

  


2022年底到2023年，Shauna的团队取得了关键突破：他们让模型拥有了bash tool，能在代码库里自由搜索。

  


Dawn Drain花了「尴尬长的时间」教Claude写diffs。

最终他们做了一个内部命令行工具，叫**clide** 。

  


它能让你和Claude聊天来编辑代码、完成开发任务。

  


Ben Mann说：「我爱它。它真的很棒，但它可以好得多。」

  


问题是：它**太超前了** 。Sid Bidasaria后来回忆：「大家都谈论clide，但它又笨重又慢。」

  


  


Claude Code第一位工程师Adam Wolff给它加了原始的agentic能力——能从部分改动推断用户意图。

  


  


第一次成功时，他「在厨房里跳舞」。

  


可clide始终是研究侧的玩具。

  


它太脆弱、太慢、太不稳定。

  


直到2024年9月，一个新的人走进了Labs团队。

  


  


**Claude Code一飞冲天**

  


2024年9月，Boris Cherny加入Anthropic Labs。

  


Ben Mann给他的任务是「agentic coding」，嘱托「不要为今天的模型构建，要为六个月后的模型构建」。

  


他没有被直接指派做coding产品，而是先熟悉Anthropic API，快速用两天时间做一个极简终端（CLI）原型。

  


demo里，它能截图Apple Music，告诉你正在听什么歌。

  


他发到Slack，只收获了**两三个点赞** 。

  


  


没人懂。连他自己也不完全懂。

  


但Boris停不下来了。朋友们喊他出去玩，他拒绝了。他周末把自己关在家里，持续钻研这个东西。

  


有一天，他写了一个pull request，Adam拒绝了，让他用clide试试。

Boris把issue复制粘贴进clide，**它直接写出了完整的五到十行PR** 。

  


Boris后来回忆：

我从没见过这种事。它太震撼了。感觉像未来。

  


Ben Mann说Boris当时的表情是「Holy shit」。

  


  


他们已经有了所有零件，只差把它们拼在一起。

  


12月，Labs团队终于给这个项目开了绿灯。

  


原本只有Boris、Sid Bidasaria加上Ben的极小团队，瞬间涌进来六七个人。

他们开始了**最后两周的冲刺** 。

  


那两周里，核心功能几乎全部完成：bug reporting、登录流程、auto-updates、优秀的使用指标……

  


没有PR限制，没有review流程，修复能五分钟内上线。

  


  


**10%到100%，以及只完成的「1%」**

  


2025年2月，Claude CLI对外发布，正式更名为Claude Code。

  


  


全大写ASCII字符Claude Code的Logo成了AI编程的标志性设计。

  


  


早期反馈并不热烈。很多人觉得「想法很酷，但bug太多」。

  


可模型在进步。当Claude 4系列模型发布时，一切变了。

  


Boris Cherny坐在Code with Claude大会的后排，Sonnet 4发布时，他低头coding，突然意识到：

「哇，这真的变强了。」

  


这彻底改变了硅谷的运转方式：Ramp的技术负责人在五分钟内被彻底征服，Bun的创始人利用它瞬间啃下了复杂的网络协议代码。

  


到了2025年的冬天，一个不可逆转的新世界到来了。

  


  


曾经彻夜爆肝的Claude Code负责人Boris Cherny发现，自己已经一行代码都不用手写了——100%的工作都由Claude Code在后台的终端里静默完成。

  


  


他甚至一整天用Claude Code写代码，提交了88次，全程妻子和狗狗就在沙发上陪着，轻松惬意。

  


  


Cat Wu说，最让她感慨的是权限请求的变化：

刚上线时，大家会认真阅读每一个权限请求。现在，很大一部分用户直接auto-accept了。

  


信任，正在被建立。

  


而Boris依然在说那句话——**我们只完成了1%** 。

  


因为真正的长时自主、持久记忆、复杂上下文管理、开放世界规划……这些能力，还远未到来。

  


  


人类工程师的角色，正在从「代码建筑师」向「AI管理员」跃迁。

  


编程不再是晦涩难懂的极客特权，而这，仅仅是AI智能体走向真实世界、解决人类终极难题的开端。

  


参考资料：

https://www.anthropic.com/features/making-of-claude-code

编辑：大卫

  
**秒追ASI****⭐****点赞、转发、在看一键三连****⭐****点亮星标，锁定新智元极速推送！****  
**
