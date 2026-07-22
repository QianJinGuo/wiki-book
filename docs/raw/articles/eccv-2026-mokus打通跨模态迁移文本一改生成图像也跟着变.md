---
sha256: 1d6897a7c71b659d176dc2548c75f0adadb9b6d23b2bac9e01277edcb9ad430f
source: wechat
source_url: https://mp.weixin.qq.com/s/DqIKmrt6ApVWvSW5p1FkOA
ingested: 2026-07-22
feed_name: PaperWeekly
wechat_mp_fakeid: MP_WXS_3201788143
source_published: 2026-07-20
---

# ECCV 2026 | MoKus打通跨模态迁移：文本一改，生成图像也跟着变

---
source: wechat
source_url: https://mp.weixin.qq.com/s/DqIKmrt6ApVWvSW5p1FkOA
ingested: 2026-07-22
source_published: 2026年7月20日 20:41
---

# ECCV 2026 | MoKus打通跨模态迁移：文本一改，生成图像也跟着变

## 

统一多模态模型中，生成与理解是否共享一个知识空间？

  


动机

作为人类，我们可以阅读、倾听、观看，并把来自不同模态的信息整合进同一个大脑。之后，无论是写字、说话还是绘画，我们都能调用这些知识。

  


那么，当一个统一多模态模型既能「理解」图像，又能「生成」图像时，它的理解知识和生成知识，是否也进入了同一个统一知识空间？

  


如果答案是肯定的，一个直接推论是：在文本侧更新一条知识，图像生成侧也应该随之变化。

  


比如，把模型关于「贝多芬最喜欢的乐器」的答案更新为「吉他」，再让它生成「the favorite instrument of Ludwig van Beethoven」，图像中是否会出现吉他？

  


清华大学和香港科技大学的研究者在 ECCV 2026 新作 MoKus 中，围绕这个问题给出了一个可操作的答案。他们观察到一种现象：cross-modal knowledge transfer（跨模态知识迁移）。

  


也就是说，对文本模态知识的修改，可以迁移到图像生成模态，并直接影响最终生成结果。

  


更进一步，研究者把这个观察转化为一个新任务：Knowledge-aware Concept Customization（知识感知概念定制）。

  


简单说，MoKus 想解决的不是「让模型记住一只狗长什么样」，而是让模型知道：这只狗可以被称为「我的生日礼物」，也可以被描述为「那只戴红项圈的小狗」，还可以在新的提示词中和其他场景自由组合。

  


  


论文标题：

MoKus: Leveraging Cross-Modal KnowledgeTransfer for Knowledge-Aware ConceptCustomization

论文链接：

https://arxiv.org/abs/2603.12743

项目主页：

https://chenyangzhu1.github.io/MoKus

代码链接：

https://github.com/HKUST-LongGroup/MoKus

  
  


从 <sks> 到自然语言知识

过去几年，概念定制一直是文生图领域的重要问题。DreamBooth、Textual Inversion 等方法通常会引入一个稀有 token，比如 <sks>。

  


训练之后，用户输入「a <sks> dog on the beach」，模型就应该知道 <sks> 指的是参考图中的那只狗。

  


问题是，<sks> 更像一个临时工牌。它能把概念带进模型，却不会告诉模型这个概念是谁、来自哪里、与用户有什么关系。由于这类 token 在预训练数据中极少出现，它缺少明确语义，也很难与其他自然语言提示稳定组合。

  


而现实中的概念往往自带知识。论文中举了小美人鱼雕塑的例子：传统方法可能能用「<sks> sculpture」复现外观，但当用户输入「Little Mermaid Statue Denmark」这样的知识描述时，模型未必能准确生成同一个目标概念。

  


MoKus 的核心想法是反过来：既然人类天然用知识描述概念，为什么不能让模型也用知识来定制概念？

  


因此，论文提出了知识感知概念定制：给定目标概念的参考图和多条自然语言知识，模型需要把这些知识绑定到目标概念上。

  


之后，只要提示词中出现这些知识，模型就能识别它们，并生成高保真的定制图像。

  
  


关键观察：文本侧一改，图像侧也会动

MoKus 的技术起点，是一个关于统一模型的实验。

  


研究者发现，当前模型在涉及复杂知识的生成时并不稳定。比如输入「the favorite instrument of Ludwig van Beethoven」，模型可能没有生成乐器，而是直接生成贝多芬肖像。

  


随后，他们对模型的 LLM text encoder 进行知识编辑：让模型在文本侧把「What is the favorite instrument of Ludwig van Beethoven?」的答案更新为「guitar」。

  


再使用同样的自然语言描述去生成图像时，结果开始向「吉他」靠拢。

  


这意味着，文本侧的知识更新并没有停留在文本空间里。它穿过了 text encoder 和 DiT 生成骨干之间的连接，影响了最终图像。这就是论文所说的跨模态知识迁移。

  


这个发现的意义在于，它给「统一知识空间」提供了一个可检验入口：理解与生成之间未必天然完全打通，但在合适的知识编辑方式下，文本模态中的知识确实可以迁移到视觉生成中。

  
  


MoKus：两阶段，把知识接到视觉概念上

基于跨模态知识迁移，MoKus 采用两阶段框架。

  


第一阶段是 Visual Concept Learning（视觉概念学习）。这一阶段仍然使用稀有 token，但它不再是用户最终使用的概念名，而是一个 anchor representation（锚点表示）。

  


这个锚点负责存储目标概念的视觉外观。训练时，模型通过 LoRA 微调 MMDiT 的 self-attention 层，让稀有 token 对应的文本表示抓住目标概念细节。

  


第二阶段是 Textual Knowledge Updating（文本知识更新）。有了视觉锚点之后，MoKus 会把每条自然语言知识转换成 query，再把 query 的答案更新到这个锚点表示上。

  


具体实现中，方法会在 LLM encoder 的可编辑层中提取 hidden states 和更新方向，计算参数偏移量，并加到原始参数上。

  


论文实验中，MoKus 默认使用 UltraEdit 作为知识更新方法，只修改 LLM encoder 中 MLP 层的部分参数：第 18 到 26 层的 Gate Projection 和 Up Projection，共 16 个参数矩阵。

  


这套设计的好处很清晰：稀有 token 负责「看起来像谁」，自然语言知识负责「可以怎样被叫到」。前者像内部索引，后者像用户真正会说出口的名字、属性、关系和记忆。

  
  


KnowCusBench：给新任务补上评价基准

为了系统评价这一新任务，论文构建了 KnowCusBench，包含 35 个概念、每个概念 5 条人工筛选后的知识、199 条生成提示词，并在 5 个随机种子下形成 5,975 张评测图像。

  


实验比较了 MoKus 与两个 baseline：Naive-DB 和 Enc-FT。Naive-DB 将 DreamBooth 扩展到知识感知概念定制，对每条知识重新训练；Enc-FT 则先做视觉概念学习，再直接微调 LLM encoder 更新知识。

  


来看核心结果：

MoKus 在更聚焦目标主体的 CLIP-I-Seg 上取得最佳结果，同时拿下最高 CLIP-T 和 Pick Score。这说明它不仅能保住概念外观，也更能跟随文本提示，并获得更好的人类偏好。

  


效率差距同样明显。MoKus 总训练时间约 6 分钟，而 Naive-DB 约 27 分钟。更有意思的是，当知识数量从 1 条增加到 5 条时，MoKus 的表现几乎保持稳定；每新增一条知识，只多花约 7 秒。

  


  


不只是个性化生成：还能创建、擦除、补知识

MoKus 的外延并不止于概念定制。

  


它可以用于 Virtual Concept Creation（虚拟概念创建）：通过文本描述视觉属性，在模型内部建立一个新的可调用概念。

  


它也可以用于 Concept Erasure（概念擦除）：通过修改模型对视觉属性的回答，降低模型生成特定概念的能力。

  


此外，论文还在 WISE 子集上测试了世界知识生成能力。文本知识更新后，Consistency 从 0.76 提升到 1.26，Realism 从 0.70 提升到 1.42，WiScore 从 0.81 提升到 1.33。

  


回到最初的问题：统一多模态模型是否拥有统一知识空间？

  


MoKus 的答案不是简单的「有」或「没有」。今天的多模态生成模型已经把 LLM text encoder、DiT backbone、VAE、LoRA 等模块组织进同一条链路，但模块相连不等于知识统一。

  


MoKus 的价值在于，它找到了一种让知识跨过去的方法：先用视觉概念学习得到锚点表示，再通过文本知识更新，把自然语言知识映射到这个锚点上。

  


如果说传统概念定制是在教模型记住一个「暗号」，那么 MoKus 做的是让模型学会理解多个「人话」入口。

  


生成与理解之间，确实存在一座可以被利用的桥。

  


  


**更多阅读**

[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721442&idx=1&sn=68a3aae2a1ac88875c63cfebfcf8d3e0&scene=21#wechat_redirect>)[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247720615&idx=1&sn=67c872f69e605c4e46f706bc36ca7050&scene=21#wechat_redirect>)[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247719217&idx=2&sn=1a50b51c3457dbf57bdd4c76ff349d26&scene=21#wechat_redirect>)  
  


**# 投 稿 通 道#**

**  让你的文字被更多人看到 **

  


  


如何才能让更多的优质内容以更短路径到达读者群体，缩短读者寻找优质内容的成本呢？**答案就是：你不认识的人。**

  


总有一些你不认识的人，知道你想知道的东西。PaperWeekly 或许可以成为一座桥梁，促使不同背景、不同方向的学者和学术灵感相互碰撞，迸发出更多的可能性。 

  


PaperWeekly 鼓励高校实验室或个人，在我们的平台上分享各类优质内容，可以是**最新论文解读** ，也可以是**学术热点剖析** 、**科研心得** 或**竞赛经验讲解** 等。我们的目的只有一个，让知识真正流动起来。

  


📝 **稿件基本要求：**

• 文章确系个人**原创作品** ，未曾在公开渠道发表，如为其他平台已发表或待发表的文章，请明确标注 

• 稿件建议以 **markdown**  格式撰写，文中配图以附件形式发送，要求图片清晰，无版权问题

• PaperWeekly 尊重原作者署名权，并将为每篇被采纳的原创首发稿件，提供**业内具有竞争力稿酬** ，具体依据文章阅读量和文章质量阶梯制结算

  


📬 **投稿通道：**

• 投稿邮箱：hr@paperweekly.site 

• 来稿请备注即时联系方式（微信），以便我们在稿件选用的第一时间联系作者

• 您也可以直接添加小编微信（**pwbot02** ）快速投稿，备注：姓名-投稿

  


**△长按添加PaperWeekly小编**

  


  


  


🔍

  


现在，在**「知乎」** 也能找到我们了

进入知乎首页搜索**「PaperWeekly」**

点击**「关注」** 订阅我们的专栏吧

  


  


·
