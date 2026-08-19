---
source: rss
source_url: https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247722281&idx=2&sn=1b6f46ee1b57e8d52078e7572618c14b
ingested: 2026-08-20
feed_name: WeChat-PaperWeekly
source_published: 2026-08-19
sha256: 9b7535df0ecd2727f826a422c9c7578ed3f34d1eb4a5f432e2bd534ed377eb30
---

# ECCV 2026 | 长视频Token剪枝新范式：从关键帧到证据链

让你更懂AI的 2026-08-19 21:02 北京

无需训练就能剪长视频 token

长视频理解正在成为多模态大模型的重要能力。用户不再只问“视频里有什么”，而是希望模型能进一步回答：这个事件从什么时候开始？到什么时候结束？这类任务被称为视频时序定位（Video Temporal Grounding，VTG）。

但视频越长，visual tokens 越多，推理成本也越高。一个直接思路是：剪掉一部分视觉 token。

SemVID 正是围绕这个问题展开。它的核心观点是：相比传统针对 VideoQA 的剪枝，VTG 剪枝不是简单删掉“不重要画面”，而是要保住一条支撑时间定位的 evidence chain。

论文标题：

Keeping the Evidence Chain: Semantic Evidence Allocation for Training-Free Token Pruning in Video Temporal Grounding

论文作者：

Jiaqi Li, Shuntian Zheng, Yixian Shen, Jia-Hong Huang, Xiaoman Lu, Minzhe Ni, Yu Guan

作者单位：

University of Warwick；University of Amsterdam；Amazon AGI

录用会议：

ECCV 2026

论文地址：

<https://arxiv.org/abs/2603.05663>

代码地址：

<https://github.com/JiaqiLi404/SemVID>

VideoQA 剪枝和 VTG 剪枝，根本目标不同

以往很多 token pruning 方法主要服务于 VideoQA。VideoQA 的目标通常是回答“视频里有什么”“人物在做什么”“物体是什么颜色”。

这类问题往往只需要少数关键帧展示相关画面就可能答对。

但 VTG 的目标完全不同。 VTG 要定位“什么时候开始、什么时候结束”。模型不仅要看到 query 相关对象，还要看到动作前后的状态变化。

比如查询是“一个人从柜子里拿出包”，模型不仅要看到“人”“柜子”“包”，还要看到动作发生前后的状态变化：手什么时候伸向柜子，包什么时候被拿出。

如果剪枝方法只保留几个最显著或最相关的画面，模型可能知道事件确实出现过，却无法判断准确边界。

换句话说，VideoQA 剪枝回答的是：哪些画面够回答问题？ VTG 剪枝真正要回答的是：哪些证据能支撑时间定位？

这就是 SemVID 与既有方法的根本差异。

SemVID 的核心动机：保住 Evidence Chain

下图展示了 SemVID 的核心 motivation，即VTG 需要的不只是局部证据，而是一条跨帧连接的证据链。

在 VTG 中，事件往往不是由最显著的某几帧决定的，而是由一系列状态变化共同定义的。

事件边界附近的 token 负责告诉模型“变化从这里开始和结束”，而中间的 relay token 负责连接前后状态。

一旦这些中间节点被剪掉，证据链就会断裂。模型可能仍然看到若干高相关画面，却无法显式地将这些画面关联起来，组成连续推理路径。

结果就是：语义理解还在，时间定位变差。

因此，SemVID 提出两个面向 VTG 的剪枝目标，意于组成支撑定位的证据链：

  * Evidence Retention：保留与 query 语义高度相关的 token，尤其是事件边界附近的关键证据。

  * Connectivity Strength：保留跨帧连接，让证据能沿时间传播，而不是变成孤立碎片。




方法：从语义角度分离每个 token 在视频中的角色

围绕证据链，SemVID 设计了一个 training-free token pruning 框架。它不需要重新训练 backbone，只在推理阶段决定保留哪些视觉 token。

整个方法分两步。

第一步先决定每一帧保留多少 token。

如果平均分配预算，无关片段会浪费 token；如果只根据 query 相关度，预算又可能集中到少数高相关帧，导致中间帧被剪空，时间链路断裂。

SemVID 因此同时考虑 query 相关度和帧间变化两个信号。

相关帧包含目标事件，而变化帧往往靠近动作转折或事件边界，从而保证预算分配涵盖完整时间轴和证据链。

第二步是在每帧内部选择具体 token。如下图所示，SemVID 显式保留三类语义角色不同的 token：Object、Motion 和 Context。

Object token 保留与 query 相关的对象证据，负责回答“发生了什么”。

为了防止反复选中同一物体附近的 patch，导致预算被相似的局部区域占满，SemVID 使用 MMR，让选出的 object token 既相关又互补，从而覆盖更完整的对象证据。

Motion token 保留动作转折，负责回答“什么时候发生变化”。

SemVID 根据相邻帧之间的局部特征变化选择 motion token，并结合相关度过滤与 query 无关的背景运动。

它们不是普通运动区域，而是连接事件前后状态的 relay node。

Context token 保留场景锚点，负责回答“证据发生在什么环境中”。

极端剪枝下，如果只留下对象局部，视频会变成一组碎片化证据。少量 context anchor 可以维持场景连续性，帮助模型把对象和动作放回正确语境中。

实验：SemVID 是否真的保住了证据链？

论文在 Charades-STA 和 ActivityNet-Grounding 上使用 Qwen3-VL 和 Qwen2.5-VL 进行评测。

实验验证了 SemVID 是否在强压缩下仍能保持 VTG 所需的边界定位能力。

上图表明在相同 token 预算下，SemVID 在 mIoU、ER 和 CS 上整体优于现有剪枝方法。

尤其在低保留率下，其他方法往往出现明显性能下降；而 SemVID 仍能稳定保持较高 mIoU。

这说明 SemVID 的优势不只是“压缩 token”，而是把有限 token 留在了真正影响时间定位的位置。

其中，mIoU 衡量最终定位精度，ER 衡量关键证据是否被保留，CS 衡量证据是否能跨帧连起来。

可以看到，SemVID 的 mIoU 提升通常伴随 ER 和 CS 的提升，这与我们的核心动机一致：VTG 剪枝不能只保留高相关画面，还必须保留一条可追踪的 evidence chain。

消融实验进一步解释了 SemVID 为什么有效。

去掉 Object Token 后，mIoU 和 ER 下降，说明 query 相关的对象证据是定位基础。

去掉 Motion Token 后，mIoU 和 CS 下降最明显，说明动作变化 token 是连接事件前后状态的关键 relay。

去掉 Context Token 后，CS 也会下降，说明少量场景锚点能帮助维持时间连续性，避免证据碎片化。

可视化：SemVID 能稳定保留动作相关证据

下图展示了不同剪枝方法的 attention 热力图。

相比 VisionZip 和 FastVID，SemVID 即使在 12.5% 的极低预算下，仍能稳定聚焦在动作发生前后的语义相关区域，例如人物手部、物体和动作交互位置。

总结

SemVID 最重要的启发是，VTG 剪枝不能只保留“看起来相关”的画面，而要保留能支撑边界定位的证据链。

通过 object / motion / context 三种语义角色，SemVID 能在 training-free 条件下，把有限 token 更准确地分配给对象证据、动作转折和场景锚点，从而实现更稳定的长视频时序定位。

当然，SemVID 也还有进一步改进空间。当前 motion token 主要依赖帧间特征变化来刻画运动，在镜头移动、背景剧烈变化或遮挡较多的场景中，仍可能受到干扰。

**更多阅读**

[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721623&idx=2&sn=c00ae9524aec612a5a5c836e9a458944&scene=21#wechat_redirect>)

[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721599&idx=1&sn=63e0de309d9d6fb5aecf15a302ff15df&scene=21#wechat_redirect>)

[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721185&idx=2&sn=57b99a15c6cdb362676d026a36e87304&scene=21#wechat_redirect>)

**# 投 稿 通 道#**

**让你的文字被更多人看到**

如何才能让更多的优质内容以更短路径到达读者群体，缩短读者寻找优质内容的成本呢？**答案就是：你不认识的人。**

总有一些你不认识的人，知道你想知道的东西。PaperWeekly 或许可以成为一座桥梁，促使不同背景、不同方向的学者和学术灵感相互碰撞，迸发出更多的可能性。 

PaperWeekly 鼓励高校实验室或个人，在我们的平台上分享各类优质内容，可以是**最新论文解读** ，也可以是**学术热点剖析** 、**科研心得** 或**竞赛经验讲解** 等。我们的目的只有一个，让知识真正流动起来。

📝 **稿件基本要求：**

• 文章确系个人**原创作品** ，未曾在公开渠道发表，如为其他平台已发表或待发表的文章，请明确标注 

• 稿件建议以 **markdown** 格式撰写，文中配图以附件形式发送，要求图片清晰，无版权问题

• PaperWeekly 尊重原作者署名权，并将为每篇被采纳的原创首发稿件，提供**业内具有竞争力稿酬** ，具体依据文章阅读量和文章质量阶梯制结算

📬 **投稿通道：**

• 投稿邮箱：hr@paperweekly.site 

• 来稿请备注即时联系方式（微信），以便我们在稿件选用的第一时间联系作者

• 您也可以直接添加小编微信（**pwbot02** ）快速投稿，备注：姓名-投稿

**△长按添加PaperWeekly小编**

🔍

现在，在**「知乎」** 也能找到我们了

进入知乎首页搜索**「PaperWeekly」**

点击**「关注」** 订阅我们的专栏吧

·

[跳转微信打开](<https://wechat2rss.xlab.app/link-proxy/?k=87828ffe&r=1&u=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzIwMTc4ODE0Mw%3D%3D%26mid%3D2247722281%26idx%3D2%26sn%3D1b6f46ee1b57e8d52078e7572618c14b>)
