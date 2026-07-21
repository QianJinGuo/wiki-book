# 【VLM】详解视觉语言模型原理及代码，以DeepSeek-VL为例

## Ch01.1080 【VLM】详解视觉语言模型原理及代码，以DeepSeek-VL为例

> 📊 Level ⭐⭐ | 3.6KB | `entities/vlm详解视觉语言模型原理及代码以deepseek-vl为例.md`

# 【VLM】详解视觉语言模型原理及代码，以DeepSeek-VL为例

**来源**: 炼钢AI

**发布日期**: 2024-08-15

**原文链接**: https://mp.weixin.qq.com/s/jrwLNOnoS_9O3R0ECp7IvA

---

这是我在微信公众号的第一篇文章，其实之前也在zhi hu更新过一些文章（id：战士金），也会慢慢搬运过来。LLM、RAG、VLM啥的后续可能都会更新。目前业余时间预训练了一个1B的LLM，使用T级别的数据，欢迎关注，各种技术细节也都分享过：https://github.com/zhanshijinwat/Steel-LLM

最近开始看看视觉语言模型（VLM）相关的东西了，之前没特别仔细看过代码。翻了几篇比较知名的开源VLM技术报告，感觉DeepSeek-VL算是写的比较好的，因此本文就以DeepSeek-VL为例，结合代码写一写VLM的细节。VLM和LLM比较共性的东西比如Self Attention之类的本文就不过多介绍了，重点讲一讲VLM独有的内容。

DeepSeek-VL github链接：https//github.com/deepseek-ai/DeepSeek-VL/tree/main

1

原理

1.1 模型训练

VLM通常分为3个部分：视觉编码编码器、视觉适配器和LLM。

视觉编码器用于将图像转换为向量表示，在DeepSeek-VL中，图像被视觉编码器转换为576个向量（图像的token embedding）。VLM的视觉编码器 直接使其他模型预训练好的参数 ，普遍使用的视觉编码器结构为ViT（Vision Transformer），但可能是不同方式训练出来的，例如DeepSeek-VL使用的是Siglip和SAM训练出来的ViT，而Qwen-VL使用的是OpenCLIP的ViT。

视觉适配器用于将用于将ViT的输出图像的token embeeding映射到与文本embedding相同的空间，便于让LLM理解图像中的内容。常见的结构有多层MLP、cross attention等。

LLM是VLM的核心，视觉编码器和适配器最终产出的图像的token embedding都是要输入到LLM进行理解的，并由LLM输出关于图像的回答。

DeepSeek-VL训练可分为3个阶段（不同VLM训练的阶段数和每个阶段里训练哪部分参数会有所不同），如下图所示：

阶段1 ：这一阶段的主要目标是将视觉和语言信息在embedding空间建立联系，从而促进LLM能对图像中的实体有所理解。该阶段只对视觉适配器部分的参数继续进行训练，LLM和视觉编码器的参数冻结。该阶段训练了从ShareGPT4V 获得的 125 万个图像-文本对，以及 250 万个从文档OCR出来的图像文本对。

阶段2 ：该阶段主要目标是让LLM理解图像输入，保持图像编码器参数冻结，训练图像适配器以及LLM。如果单纯使用图像-文本对来训练LLM的话，会使LLM的语言能力下降，因此训练数据中也混合了纯文本数据，多模态数据：纯文本数据=7：3。

阶段3 ：该阶段是指令微调阶段，增强模型的指令遵循与对话能力。该阶段对视觉编码器、视觉适配器和LLM进行联合训练。和LLM的SFT过程类似，输入的instruct部分不计算loss。和阶段2类似，除了多模态数据外，该阶段也使用了纯文本数据进行训练。

1.2 模型结构

具体的模型结构方面，DeepSeek-VL的LLM部分使用的是自家的DeepSeek LL

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/vlm详解视觉语言模型原理及代码以deepseek-vl为例.md)

---

