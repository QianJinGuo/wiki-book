---
source: wechat
source_url: https://mp.weixin.qq.com/s/hhtjInhN8kmH5EBLRrd4Gw
ingested: 2026-07-08
feed_name: PaperWeekly
wechat_mp_fakeid: MP_WXS_3201788143
source_published: 2026-07-06
sha256: e2eb7b894da97c49002302fb5cdb64dc6603f0755765d1838b4bc651397802b3
---


# WWW 2026 | RAG黑箱被打开！OpenDecoder把文档质量写进解码

大语言模型越来越多地被用于生成跨领域问题的答案。

  


然而，当这些模型单独使用时，常常会出现错误或不准确的答案。检索增强生成（RAG）可以部分解决这个问题。

  


目前的方法将语言模型视为一个黑箱（black-box）：检索到的文档作为提示（prompt）的一部分提供给模型，模型需要根据其内部参数（特别是通过关注文档中的 token）来使用这些文档。

  


这种方法难以区分文档的相关性并评估其有效性。

  


加拿大蒙特利尔大学联合多个研究机构发表论文提出的 OpenDecoder 利用检索到的文档质量信号来影响语言模型的注意力分配，寄希望于模型在生成过程中能够更加关注相关且有用的信息，而忽略不相关的信息。

  


论文标题：

OpenDecoder: Open Large Language Model Decoding to Incorporate Document Quality in RAG

论文地址：

https://dl.acm.org/doi/pdf/10.1145/3774904.3792524

代码地址：

https://github.com/fengranMark/OpenDecoder

  
  


传统 RAG 的硬伤：大模型成了“睁眼瞎”？

现在的 RAG 系统普遍有一个强假设：检索器找回来的文档都是有用的。 然而，大模型把这些文档塞进 Prompt（提示词）之后，它的 Attention（注意力机制）完全是盲目的，根本不知道哪篇含金量高、哪篇是噪音。结果就是：

 

1. 垃圾塞入，垃圾产出：即使喂了一堆无关文档，LLM 也会硬着头皮看完并受到干扰，导致回答质量暴跌。 

  


2. 多步过滤太慢：用 “LLM-as-a-judge” 先过滤再生成，虽然能去噪，但多轮调用大模型导致延迟（Latency）直接爆炸，根本无法落地工业级应用。

  
  


破局者 OpenDecoder：在解码层给大模型装上“透视眼”

既然 Prompt 救不了 RAG，那就直接在 Decoding（解码）阶段动手！ 

  


OpenDecoder 的核心逻辑非常优雅：直接利用检索到的文档外部质量指标（如检索相关性得分、重排得分、QPP 查询性能预测得分），去主动干预和重塑大模型内部的 Attention 概率分布。 

  


  * 它的工作原理：当 OpenDecoder 发现某个文档的外部得分极低（说明是个垃圾噪音），它就会在 token 级别直接调低大模型对这段文字的注意力。

  


  * 极端情况的底气：如果检索回来的全是毫无关联的垃圾信息，OpenDecoder 会引导大模型直接忽略外部上下文，转而百分之百信任自己参数里原本就有的知识（Parametric Knowledge），从而给出最稳妥的回答。

  


  


实验结果佐证猜想

OpenDecoder 在 NQ、TriviaQA、PopQA（通用问答）以及 HotpotQA、2WikiMultiHopQA（复杂多跳推理问答）五大权威基准数据集上进行了测试，效果显著：

  


  * 常规环境：显著超越 Vanilla RAG 及各种强 baseline。

  


  * 高噪音环境：即使故意在检索结果中掺入大量局部相关或完全无关的文档，OpenDecoder 依旧稳如泰山，展现出恐怖的噪声容忍度（Noise Tolerance）。

  


  * 极端失效场景：在检索彻底失败（全是垃圾文档）的极端情况下，OpenDecoder 依然能保持高准确率，避免大模型“精神失常”。


  
  


总结

相比于单纯依赖提示工程（Prompt Engineering），直接介入并“打开” LLM 的内部机制对于提升系统的鲁棒性至关重要。

  


这是因为我们不能期望 LLM 的隐式识别（Implicit Identification）在任何情况下都保持准确。

  


将外部指标（如 Relevance Score、Confidence Feature、Faithfulness Factor 等）与 LLM 的内部信息处理机制（如 Attention）有机结合并用于结果解码是十分有效的。

  


其核心挑战在于：如何通过精细的训练算法（在后训练 Post-Training 阶段）获取这些指标，并将其有效地整合进模型的 Inference 过程中。

  


3\. OpenDecoder 灵活性拉满，可以完美融入大模型的 Post-training（后训练/微调）阶段，不仅能接纳相关性得分，未来还能接入可信度、权威度、安全性等任何外部指标。

  


同时，它不需要繁琐的多步 Prompt 过滤，在离线训练和在线推理时，其计算复杂度与传统 SFT 完全一致。

  


  


**更多阅读**

[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721152&idx=2&sn=361bf19f3794127c2b191eb11e952287&scene=21#wechat_redirect>)[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721067&idx=2&sn=82b23158c4f51801488304b5d6a10f5c&scene=21#wechat_redirect>)[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247720700&idx=2&sn=9cc180293fbeb17dc0a0e0ab0a2b2974&scene=21#wechat_redirect>)  
  


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
