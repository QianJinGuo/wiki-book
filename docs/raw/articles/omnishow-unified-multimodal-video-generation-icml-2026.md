---
source: rss
source_url: https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247722323&idx=2&sn=d7a47de148030db17ed1c64728ef8dc4
ingested: 2026-08-21
feed_name: WeChat-PaperWeekly
source_published: 2026-08-20
sha256: acbbd35757c0c231fd1f4bfcd3fcd89fe6c56b4248d64f7c68371c4d41236a75
---

# ICML 2026 | 从专才到通才，OmniShow极简干预统一多模态视频生成

原创 让你更懂AI的 2026-08-20 19:34 北京

不堆模块，12.3B做成多模态通才

给一个强大的视频生成 base model 加新能力，业内的惯性做法是"缺什么补什么"——要支持 reference 就挂一套保形象的网络，要支持 audio 就再接一套驱动模块，要支持 pose 就再加一路控制分支。

模块越堆越厚，base model 历经大规模预训练攒下的生成先验，反而在一次次改造里被稀释、被打乱。

OmniShow 给出的回答是反向的：不另起炉灶，而是先把 base model 的原生输入结构与学习动态吃透，再用尽可能小的改动，让多模态条件"顺着模型已经熟悉的路径"进来。

这项由香港中文大学、字节跳动、莫纳什大学与香港大学联合完成的工作，已被 ICML 2026 接收。它面向一个需要在同一段视频里同时调度 text、reference images、audio、pose 的多模态可控视频生成新任务。

论文标题：

OmniShow: Unifying Multimodal Conditions for Human-Object Interaction Video Generation

论文地址：

<https://arxiv.org/pdf/2604.11804>

代码地址：

<https://github.com/Correr-Zhou/OmniShow>

项目主页：

<https://correr-zhou.github.io/OmniShow/>

本文不按部就班地复述每个模块，而是以论文 Discussion 中提炼的两条设计洞见为主线——Philosophy of Minimalist Intervention（极简干预）与 Evolution from Specialists to a Generalist（从专才到通才）——把方法、训练、评测、实验与应用串成一条完整的脉络。

想看更细的方法说明与演示，可查阅项目主页。

〓一张总览图看清 OmniShow 能接住哪些条件、又能玩出哪些花样

任务的真正难点：不是支持，而是协同

把这个任务说清楚很重要：text prompt 负责全局语义与场景，reference images 锚定人物身份与物体外观，audio 驱动嘴型、表情与身体节奏，pose 给出逐帧的精确动作。

单独支持其中任意一项都不算稀奇，难点在于让它们在时序、空间、语义三个层面彼此不打架——人物不能换脸，商品不能变形，嘴型要咬住声音，肢体要服从 pose，而画面整体还得忠于文本。

现有路线大多偏科：

R2V 擅长保留 reference appearance 却缺音频响应；A2V 能被声音驱动却常只支持首帧、难以同时指定人物与物体；

pose-guided 方法能控动作却在身份保持与音画同步上不完整；

部分面向交互的方案还要额外索取 mask、trajectory、depth、bounding box，门槛更高。

把这些子系统硬级联，既笨重又容易在交界处崩坏。OmniShow 的取舍由此而来：与其拼接多个系统，不如让一个模型在 end-to-end 框架里、以最小代价学会协同。

哲学之一·极简干预：让视觉条件"顺势"进来

第一条哲学的核心判断是——只要真正理解了 DiT 的原生输入结构与学习动态，就不需要大改架构，极小的改动也能撬动强多模态控制。

OmniShow 在视觉条件上把这条哲学贯彻得最彻底。

reference images 与 pose 同属视觉信号，OmniShow 没有为它们另设分支，而是直接复用 base model（Waver 1.0，一个 12B MMDiT 视频生成模型）原生的 channel-concat 机制：

pose 先渲染成 RGB 视频再过 VAE 编码，reference images 同样经 VAE 编码，随后在 temporal 维度上增设 pseudo-frame tokens 专门承载 reference，pose 则与 noisy video tokens 对齐。

模型看到的输入形式，依旧近似它早已熟悉的原生 I2V，因而 task adaptation gap 被压得极小。

〓不新增复杂模块，视觉条件沿原生通道并入，base model 的生成先验得以保全

为了让 reference 从"被动条件"变成"主动目标"，OmniShow 再补一道极轻的 Reference Reconstruction Loss：pseudo-frame tokens 不用全零初始化，而是填入同一 timestep 加噪后的 reference image tokens，并要求模型重建其语义细节。

改动很小，却把"保真"写成了模型显式追求的优化目标。整套视觉注入的取向，与后续音频、训练两条主线一脉相承，共同构成 OmniShow 的完整 pipeline。

〓三条主线同框，处处可见"能复用就不重造"的克制取向

哲学之一·延伸：被"分析"出来的音频架构

声音是连续、含节奏与局部时间关系的模态，硬塞进 channel 并不合适。

OmniShow 为它设计 Gated Local-Context Attention：先用 Wav2Vec 2.0 融合多层特征，经 sliding window（window=5、stride=4）对齐到视频 fps，再用 masked attention 约束每个 latent frame 只 attend 对应的局部 audio tokens，从而稳稳建立 frame-wise 的音画对应。

最能体现"极简干预"巧思的是 Adaptive Gating。

新插入的 audio attention 若一上来强度过大，会扰乱 pretrained feature distribution；OmniShow 把 learnable gating vector 初始化为 near-zero，让音频影响从极弱处缓慢生长。

更关键的是，gate norm 反过来成了"诊断工具"——它揭示音频在各模块的影响强弱，据此判断只在 dual-stream blocks 插入即可。

最终音频模块仅让模型增约 **2.5%** 、规模达 **12.3B** 。换句话说，这套架构是被分析出来的，而不是被堆出来的。

〓gate norm 既稳住训练，又回答了音频"该插哪层、插多重"这一问题

哲学之二·从专才到通才：把异构数据用到极致

第二条哲学落在数据与训练上。完整的多模态样本极其稀缺——一条样本要同时满足 text、reference images、audio、pose 与目标视频的质量，几乎可遇不可求。

OmniShow 没有被这道门槛困住，而是构建多层异构数据流程，把 R2V、A2V、RA2V、RAP2V 各类数据都纳入麾下：从大规模 human-centric 视频池出发，先做 shot segmentation 切分，再按分辨率、美学、运动强度、OCR 等维度逐层过滤。

〓异构数据被分层提纯，为后续分阶段训练备好可用素材

训练采用 Decoupled-Then-Joint Training：先分别训练 R2V 与 A2V 两个 specialists，让它们各自掌握 reference preservation 与 audio synchronization。

再用 weight interpolation 合并——audio modules 继承自 A2V，其余参数按 A2V/R2V = 0.6/0.4 融合，这一偏向 A2V 的比例，体现出"音画同步对权重扰动更敏感、需更稳保留"的判断。

随后在完整 RA2V 数据上继续训练、用高质量子集提纯，并把 pose 放到最后才引入，避免模型过早依赖强监督信号而牺牲身份与同步。

真正动人的发现出现在合并的那一刻：还没显式训练 RA2V，合并后的模型就已经涌现出 joint reference-audio 生成能力。

论文据此把"可控性可经由 weight merging 涌现"列为一条值得深挖的启发——这正是"从专才到通才"最直接的证据。

〓merging 瞬间冒出的 zero-shot RA2V 能力，印证了通才可以"长"出来

把克制的设计放到尺子上量

两条哲学叠加，理应得到一个既统一又不偏科的模型。

为系统验证这一点，OmniShow 构建了 HOIVG-Bench：135 个精选样本，每个都配齐 detailed caption、人物与物体 reference、语义对齐 audio 与 coherent pose。

并从 Text Alignment、Reference Consistency、Pose Accuracy、Audio-Visual Synchronization、Video Quality 五个维度评测，专门拆穿"pose 准但身份漂、嘴型对但商品变形"式的偏科。

〓统一可比的评测口径，让"多条件协同到底好不好"有据可依

定性来看，OmniShow 在多种条件组合下都能稳住形象、维持自然动作、咬合音画。

〓极简干预没有换来质量妥协，多条件协同反而更稳

定量结果分三种设置看。

R2V 设置下，NexusScore 0.389 居首，FaceSim 0.874 紧追体量更大的 Phantom-14B（0.876），并在 AES 0.468、VQ 11.12、MQ 5.885 三项拿下第一。

RA2V 设置下，Sync-C 8.612、Sync-D 7.608 双双领先 HuMo-17B 的 8.013/8.316，FaceSim 0.810、NexusScore 0.369、AES 0.465、VQ 10.86、MQ 5.554 全面占优——音频加入后，音画同步、人物商品一致性与画质同时提升，而非此消彼长。

RP2V 设置下，AKD 降到 0.174、PCK 升到 0.460，动作控制精度明显优于 VACE（0.206/0.336），NexusScore 0.418、VQ 10.28 同样保持领先。

而这一切建立在仅 12.3B、音频模块只增约 2.5% 的轻改动之上——对照 HuMo 为音频付出 +21.4%、体量达 17B，极简干预的性价比不言自明。

〓用更小的体量，在多种条件设置下拿下领先或高度竞争的成绩

单项能力同样经得起检验。

在专评音频驱动的 EMTD benchmark 上，OmniShow-A2V 取得 Sync-C 6.49 与 AES 1.51（全场最高），IQA 2.26 也位居前列——"先做强专才、再纳入统一框架"并没有削弱音频驱动本身。

〓统一能力不是以牺牲单项为代价换来的

总结：真正被验证的，不是技巧，而是哲学

OmniShow 最值得带走的，未必只是某个具体模块，而是一种已经被实验系统验证过的设计哲学：面对能力越来越强的 base model，真正稀缺的往往不是“再加一个新结构”的勇气，而是克制地判断什么该改、什么不该改。

它给出的答案并不激进，却很有力量：先读懂模型原本的输入结构与学习动态，沿着它熟悉的路径去接入新条件，而不是把每种新需求都变成一次推倒重来的结构改造。

再通过异构数据与分阶段训练，把零散的专才能力慢慢熔成一个稳定协同的通才系统。

这也是为什么 OmniShow 的“极简干预”不是一种保守妥协，反而更像一种更成熟的扩展观。

它承认大模型时代最宝贵的资产并不是某个新模块本身，而是 base model 已经学到的生成先验、时序规律与多模态表征能力。

与其不断叠加复杂结构去和这些能力博弈，不如用最小但精准的介入，让新条件顺势长进已有系统里。

少即是多，在这里不是一句审美口号，而是一种能够同时兑现参数效率、训练稳定性、任务统一性与应用可组合性的工程方法论。

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

[跳转微信打开](<https://wechat2rss.xlab.app/link-proxy/?k=0903c991&r=1&u=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzIwMTc4ODE0Mw%3D%3D%26mid%3D2247722323%26idx%3D2%26sn%3Dd7a47de148030db17ed1c64728ef8dc4>)
