---
source: wechat
source_url: https://mp.weixin.qq.com/s/skwE6fMqQpHdE1zR4tii6Q
ingested: 2026-07-10
feed_name: PaperWeekly
wechat_mp_fakeid: MP_WXS_3201788143
source_published: 2026-07-09
sha256: 68d41b5e1aa0c99b7ecfbd6f9b0eb59c339558c6796f948f504e298ea8c0ba9d
---

# 标题取得好，Accept跑不了：NeurIPS in ICML都来了

## 

有些论文赢在方法，有些论文连名字都很会：标题先让人停一秒。

  


  


这两天刷到一张 ICML 2026 现场图，忍不住多看了两眼。

  


  


〓 图源：@实对称齐次正定的炼丹变换

  


一篇 ICML 论文，方法名缩写叫 NeurIPS。妙啊～

  


  


  


这种取名天菜，顶会里每年总能碰到几个。此前有 `ACL in CVPR`，最近又有 `ICLR in AAAI`。

  


今天就顺着这张 poster，盘一盘这些名字精准卡点的论文。

  


先看这张 poster 的主角：**`NeurIPS in ICML`** 。

  


  


  


  


这项工作面向基于功能磁共振成像的图像重建，也就是从 **fMRI 信号里还原被试看到的视觉内容** 。脑信号本身噪声大，个体差异也大，换到新被试时，模型往往需要不少适配数据。

  


它把**神经解剖结构先验** 引入跨被试脑解码。SRST 负责在视觉 ROI 内做球面分词，在保留皮层表面几何结构的同时减少无关区域的计算负担。

  


SG-MoE 则根据皮层厚度、曲率、脑沟深度等解剖特征进行专家路由，降低模型对被试 ID 的依赖。

  


  


  


把时间拨回 CVPR 2025，也有一个熟面孔。

  


  


这项工作面向图像复原，覆盖图像去雨、图像去模糊等任务。核心做法是把 **Mamba 里的状态空间模块替换为线性注意力** ，形成 LA-based Mamba 模块，在较低计算开销下捕捉全局特征依赖。

  


局部细节方面，作者加入**多尺度空洞卷积模块** ，用不同感受野提取粗细粒度特征，弥补图像复原中细节容易丢失的问题。

  


  


  


最近 AAAI 2026 这边，也来了一位新选手。

  


  


这一篇看的是低光照图像增强。低光场景里，亮度拉起来不难，难的是颜色别跟着崩。作者关注 **HVI 色彩空间下亮度分支和色度分支之间的交互问题** ，同时也处理两个色度分支之间相关性较弱时带来的梯度冲突。

  


论文提出 DIEM 来增强亮度与色度分支之间的互补信息，并通过 CCL 利用亮度残差统计约束色度误差，提升低光增强中的颜色恢复效果。

  


  


  


再往前，CVPR 2024 还出现过一个 **`WWW`  三连击**。

  


  


它做的是神经网络可解释性，核心是回答三个问题：**模型识别了什么，相关区域在哪里，以及为什么会得到这个预测** 。

  


作者用神经元概念来组织解释过程，先通过概念发现模块为神经元匹配可读概念，再结合神经元激活图和 Shapley 值生成局部概念图与热力图，用来解释单个样本里的关键概念、位置和贡献。

  


  


  


前面这些是跨会名串门，后面两篇直接**原地闭环** 。

  


比如 ICLR 2025 这篇。

  


  


它关注的是上下文学习中的表征重组。简单说，就是看模型在读到一段上下文之后，内部概念表征会不会**从预训练语义，转向上下文里临时指定的新结构** 。

  


论文设计了上下文图追踪任务，先把一组概念词放到预设图结构的节点上，再把随机游走轨迹作为上下文输入模型。

  


随着上下文长度增加，模型内部表征会逐渐呈现出对应的图结构。论文还用图追踪准确率和 Dirichlet 能量来量化这种变化。

  


EMNLP 2025 也有同款操作。

  


  


  


这项工作关注**教师角色模拟 LLM 的道德与规范画像** 。作者构建了 EMNLP 框架，从人格测量、道德发展阶段评估和软提示注入风险三个层面评估教师角色 LLM。

  


具体来说，作者扩展了教师人格量表，构造了 **88 个教师职业相关道德困境** ，并设计软提示注入集合来测试模型在教师角色下的合规性和脆弱性。

  


实验覆盖 **14 个 LLM** 。结果显示，教师角色 LLM 的人格画像更理想化、更两极化。推理能力更强的模型在抽象道德推理上表现更好，但在有害软提示注入下也可能更脆弱。

  


看完这几篇论文，只能说一句：**会起名，确实也是科研软实力。**

  


方法得有，实验得跑，标题还刚好卡到顶会缩写。

**  
**

**这波很难不服。**

  


  


**参考文献**

[1] Yu et al., 2026. _NeurIPS: Neuro-anatomical Inductive Priors for Sphere-based Brain Decoding_. ICML 2026. arXiv:2605.24993.

[2] Gu et al., 2025. _ACL: Activating Capability of Linear Attention for Image Restoration_. CVPR 2025.

[3] Xu et al., 2026. _ICLR: Inter-Chrominance and Luminance Interaction for Natural Color Restoration in Low-Light Image Enhancement_. AAAI 2026. arXiv:2511.13607.

[4] Ahn et al., 2024. _WWW: A Unified Framework for Explaining What, Where and Why of Neural Networks by Interpretation of Neuron Concepts_. CVPR 2024. arXiv:2402.18956.

[5] Park et al., 2025. _ICLR: In-Context Learning of Representations_. ICLR 2025. arXiv:2501.00070.

[6] Jiang et al., 2025. _EMNLP: Educator-role Moral and Normative Large Language Models Profiling_. EMNLP 2025. arXiv:2508.15250.

  


  


**更多阅读**

[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721201&idx=2&sn=f755ccb0fe42f91ef11084696e2e666f&scene=21#wechat_redirect>)[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721152&idx=1&sn=1997b2495d21b1b96568e1102c1ee353&scene=21#wechat_redirect>)[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721067&idx=1&sn=a8a45c05f631722c62ca81ae16c01a97&scene=21#wechat_redirect>)  
  


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
