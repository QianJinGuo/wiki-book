---
source: wechat
source_url: https://mp.weixin.qq.com/s/iqNGjhKZcvw9i_qnY7fPXA
ingested: 2026-07-06
feed_name: 新智元
wechat_mp_fakeid: MP_WXS_3271041950
source_published: 2026-07-06
sha256: 682e9666f07fdd45465b1caa0ecaa89dbc4b6e598ceac20edb95b4fd22f3da11
---


# 刚刚，DeepMind经典巨作再封神！ICML 2026大奖公布

### 

### 

**   ****新智元报道  **

##### **【新智元导读】** ICML 2026杰出论文奖正式公布，两篇扩散模型论文同时登顶，而且作者里不少华人。

  


ICML 2026大奖公布来了！

  


ICML年度杰出论文奖和时间检验奖，正式公布。

  


  


其中杰出论文共有9篇入围，含7篇研究论文及2篇立场论文，最终优胜奖3名和荣誉提名6名；ICML时间检验奖花落强化学习领域，DeepMind经典巨作再封神。

  


获奖完整名单：

  


https://blog.icml.cc/2026/07/05/announcing-the-icml-2026-awards/

  


ICML，全称国际机器学习大会，和NeurIPS、ICLR并列AI领域三大顶会，每年投稿量过万，接收率不到三成。

  


2026年7月6日至11日，ICML 2026在韩国首尔COEX会议展览中心举行。

  


杰出论文奖就是机器学习领域的奥斯卡。

  


而这份名单的含金量，不只是在表彰技术贡献，更像是在给整个领域发出方向性信号。

  


扩散模型成今年最大赢家，两篇相关论文荣获杰出论文：

  


灵活性陷阱：重新思考扩散语言模型中任意顺序的价值。这篇神作深入剖析了扩散大语言模型中的关键机制。

  


针对扩散模型和对数凹分布的高精度采样：在算法精度上实现了重大突破。

  


  


立场论文杰出论文奖，描述了AI安全领域的一种诡异的现象：对齐社区正在无意中构建一套审核工具包。

  


  


五篇研究论文获得杰出论文奖的荣誉提名：

  


混淆图谱：通过欺骗探针映射 RLVR 中诚实性涌现的位置

  


视频生成中的运动归因

  


语言模型最多能记住多少内容？

  


扩散模型一致性：随机矩阵视角

  


理解Grokking：岭回归中的可证明Grokking

  


  


一篇立场论文荣获杰出论文奖的荣誉提名：

  


立场：AI/ML 深度伪造研究与人工智能生成的非自愿亲密图像（AIG-NCII）相悖

  


  


最后，时间检验奖给当年的绝对爆款：

  


深度强化学习的异步方法

  


  


恭喜以上获奖者。

  


  


**扩散模型包揽杰出论文，双黄蛋背后是新共识**

  


杰出论文奖的两篇获奖作品，都围绕扩散模型展开。

  


两篇同一方向同时获奖，这种事在ICML历史上屈指可数。巧合背后更像是一种集体判断：扩散模型已经进入了需要「纠偏」和「补基建」的阶段。

  


第一篇来自清华大学黄高团队以及Zanlin Ni等人，标题就很有杀气：《灵活性陷阱：重新思考扩散语言模型中任意顺序的价值》。光看题目就知道，是来砸场子的。

  


标题：The Flexibility Trap: Rethinking the Value of Arbitrary Order in Diffusion Language Models

  


ICML：https://icml.cc/virtual/2026/oral/71086

  


项目主页：https://nzl-thu.github.io/the-flexibility-trap/

  


先解释一下背景。

  


扩散大语言模型是当下最热的研究方向之一，跟GPT、Claude这类自回归模型不同，扩散语言模型不是从左到右一个Token一个Token往外蹦，而是像画画一样，从一团噪声里逐步「去噪」出完整文本。

  


理论上，这种架构有个巨大的优势：生成顺序可以任意。先写中间再写开头，先定结论再补论据，怎么都行。

  


  


听起来很美。但Ni等人的论文泼了一盆冷水。

  


他们用大量实验证明，所谓「任意顺序生成」在实际训练中不仅没带来预期的收益，反而成了陷阱。

  


  


灵活性本身就是代价。模型为了支持所有可能的生成顺序，反而在每一种具体顺序上都做得更差了。

  


这个结论的杀伤力在于：它动摇了扩散语言模型最核心的卖点。

  


过去两年，大量论文把「任意顺序」当作扩散LLM优于自回归LLM的关键论据，不少团队围绕这个假设投了大量算力做实验。现在ICML官方盖章：这个论据站不住脚。

  


第二篇获奖论文来自Fan Chen等人，聚焦扩散模型的采样精度。

  


标题：High-accuracy sampling for diffusion models and log-concave distributions

  


ICML：https://icml.cc/virtual/2026/oral/71132

  


预印本：https://arxiv.org/abs/2602.01338

  


他们针对扩散模型和对数凹分布提出了更高精度的采样方法。

  


它解决的是扩散模型在实际部署中「生成质量存在理论上限」的底层瓶颈。 

  


  


两篇论文，一篇拆掉了核心假设，一篇推高了技术天花板。

  


ICML同时奖励破和立，信号很清楚：扩散模型正从「概念验证」走向「深水区」，需要的不再是更多花样，而是更冷静的审视和更扎实的基建。

  


  


**最炸的奖颁给了最尖锐的批评**

  


说回那篇让全场安静的论文。

  


Sarah Ball和Phil Hackemann的《立场：对齐社区正在无意中构建一个审查工具箱》拿下了杰出立场论文奖。

  


标题：Position: The Alignment Community is Unintentionally Building a Censor’s Toolkit

  


ICML：https://icml.cc/virtual/2026/oral/71119

  


论文：https://openreview.net/pdf?id=dy2HwmOvFX

  


ICML的立场论文奖专门颁给那些不做实验、不跑数据，但对领域方向提出根本性质疑的文章。

  


这篇论文的核心论点直白到刺耳：当前AI安全和对齐领域的研究者们，出发点是让AI更安全、更可控，但他们开发出来的那些技术工具，RLHF、宪法AI、价值对齐框架，正在被系统性地挪用为内容审查的基础设施。

  


  


搞对齐的人以为自己在造安全锁。但这把锁的设计图纸，正好也能用来造牢房。

  


  


这个判断并非空穴来风。过去一年，围绕AI内容审查的争议持续升温。从Claude的拒绝回答策略到ChatGPT的内容过滤机制，「过度对齐」已经成了用户吐槽的高频词。

  


每隔几周就能看到有人在社交媒体上贴截图：明明是正常的学术讨论或创作需求，AI却以「安全」为由拒绝回答。

  


Ball和Hackemann把这个用户层面的怨气拉到了学术层面：这是研究范式本身内含的结构性风险。

  


ICML把最佳立场论文颁给这篇，本身就是一个态度。顶会在告诉整个对齐社区：你们需要停下来想一想，手里的工具到底在被谁、以什么方式使用。

  


顺带一提，杰出立场论文的荣誉提名同样尖锐。

  


Li Qiwei等人的论文指出，AI/ML领域的Deepfake研究跟AI生成非自愿亲密图像存在严重脱节。

  


  


研究者忙着检测政治人物的换脸视频，却忽略了对普通人伤害最大的滥用场景。

  


  


**荣誉提名速览**

  


杰出论文的5篇荣誉提名覆盖了几乎所有热门方向，每一篇都在各自领域撕开一道口子。

  


Mohammad Taufeeque等人用「欺骗探针」映射RLVR训练中诚实性的涌现位置。

  


标题：The Obfuscation Atlas: Mapping Where Honesty Emerges in RLVR with Deception Probes

  


ICML:https://icml.cc/virtual/2026/oral/71065

  


预印本：https://arxiv.org/abs/2602.15515

  


  


简单说就是：模型在哪一层学会了说谎？

  


  


这个问题比答案本身更值钱。如果能精确定位诚实性在模型中的涌现层，未来的对齐工作就不用再大海捞针式地调整。

  


Xindi Wu等人在视频生成中做运动归因。

  


标题：Motion Attribution for Video Generation

  


ICML：https://icml.cc/virtual/2026/oral/71049

  


预印本：https://arxiv.org/abs/2601.08828

  


  


视频里一个物体动了，到底是模型「理解」了运动规律，还是纯粹在做像素级的花纹复制？这个问题对Sora这类视频生成模型的可解释性至关重要。

  


John Xavier Morris等人追问「大语言模型到底能记住多少内容」，直指隐私和版权争议的技术根源。

  


标题：How much can language models memorize?

  


ICML：https://icml.cc/virtual/2026/oral/71168

  


预印本：https://arxiv.org/abs/2505.24832

  


模型记住了你的数据，到底算学习还是算抄袭？这个问题的答案，可能比任何一场版权官司都重要。

  


还有Binxu Wang等人从随机矩阵理论的角度重新审视扩散模型的一致性。

  


标题：A Random Matrix Perspective on the Consistency of Diffusion Models

  


ICML：https://icml.cc/virtual/2026/oral/71191

  


预印本：https://arxiv.org/abs/2602.02908

  


扩散模型在不同、互不重叠的数据子集上训练后，若给定相同的噪声种子，往往会产生惊人相似的输出。这种一致性并非源于模型记住了相同的数据，而是有更深层的原因。

  


这种一致性可追溯到一种简单的线性效应：不同数据分割之间共享的高斯统计量（Gaussian statistics）本身就已经能够预测生成图像的大部分内容。

  


  


最让人眼前一亮的是Mingyue Xu等人的工作。

  


标题：To Grok Grokking: Provable Grokking in Ridge Regression

  


ICML：https://icml.cc/virtual/2026/oral/71134

  


预印本：https://arxiv.org/abs/2601.19791

  


他们在岭回归这个经典得不能再经典的模型上，给出了「顿悟」现象的严格数学证明。

  


  


所谓顿悟，就是模型在训练损失早已收敛之后，突然在某个时刻获得泛化能力。像一个学生背了半年公式，某天早上醒来突然真的理解了。

  


这件事在深度学习里被观察到过很多次，但在简单模型上做出严格证明，第一次。

  


  


**DeepMind十年前那篇论文，终于等到了时间检验奖**

  


时间检验奖颁给了Volodymyr Mnih、David Silver等DeepMind团队成员的《深度强化学习的异步方法》。

  


标题：Asynchronous Methods for Deep Reinforcement Learning

  


出版物：https://proceedings.mlr.press/v48/mniha16.html

  


这篇论文提出的A3C算法（Asynchronous Advantage Actor-Critic），2016年发表时就是强化学习领域的标杆。

  


  


核心思想说起来不复杂：与其用一个超大进程慢慢训练，不如开一堆小进程同时探索不同策略，异步汇总梯度。

  


简单，优雅，管用。这种「大道至简」的设计哲学，在十年后看来反而比当年更清晰。

  


十年过去，这个思想渗透到了几乎所有现代RL系统的骨架里。

  


从AlphaGo到RLHF，从游戏AI到机器人控制，A3C的DNA无处不在。

  


当年的绝对爆款，如今实至名归的经典巨作！

  


  


**ICML 2026释放了什么信号**

  


把今年的获奖名单摊开看，三条线索浮出水面。

  


第一，扩散模型是当下机器学习研究密度最高的地带。双黄蛋杰出论文加上多篇荣誉提名，出镜率碾压其他方向。下一代语言模型的架构之争，扩散模型已经正式入局。

  


第二，AI安全研究正在经历一场来自内部的审视。最佳立场论文直指对齐社区的工具被挪用，荣誉提名追问Deepfake研究的盲区。学术界开始认真面对一个问题：安全工具和审查工具之间那条线，到底画在哪？

  


这些信号叠在一起，指向一个判断：AI研究正在从「快速膨胀」切换到「深度清理」。 

  


ICML 2026的获奖名单，就是这场清理的第一份审计报告 

  


参考资料：

https://blog.icml.cc/2026/07/05/announcing-the-icml-2026-awards/

编辑：大卫

  
**秒追ASI****⭐****点赞、转发、在看一键三连****⭐****点亮星标，锁定新智元极速推送！****  
**
