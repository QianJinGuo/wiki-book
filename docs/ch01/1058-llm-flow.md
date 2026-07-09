# 【多模态理解与生成统一模型】LLM+flow模型生成范式原理与代码解析

## Ch01.1058 【多模态理解与生成统一模型】LLM+flow模型生成范式原理与代码解析

> 📊 Level ⭐⭐ | 3.5KB | `entities/多模态理解与生成统一模型llmflow模型生成范式原理与代码解析.md`

# 【多模态理解与生成统一模型】LLM+flow模型生成范式原理与代码解析

**来源**: 炼钢AI

**发布日期**: 2024-12-17

**原文链接**: https://mp.weixin.qq.com/s/dYV9VcajT5K6ofSI2Hr1jQ

---

前言

大模型时代，当提到多模态大模型往往指的是多模态理解模型，即给大模型输入图像和文本，模型输出和图像相关的文本内容。能同时做到图像理解和生成多模态模型比较少，如meta的Chameleon、字节的o-show和deepseek的janus等。多模态理解和生成模型大致可分为两种范式：

- LLM+将图像编码为若干个离散的token id范式（后文称为第一类模型）：借助VQ-GAN/VQ-VAE等技术，生成一个离散码表并将图像离散到一组token id后，就可以像LLM一样，自回归的生成图像token id，再解码为图像了。典型的模型有meta的Chameleon、deepseek Janus等。除了以自回归的方式预测图像token id外，也可以像Bert一样，做“完形填空”方式的训练，一次预测出多个image token id，典型的模型有字节的show-o。

- LLM+图像生成模型范式（后文称为第二类模型）：这种范式不需要将图片转换为token id，让LLM和图像生成模型紧密耦合，二者各司其职，典型的模型有Transfusion（图像生成模型为扩散模型）和Janusflow（图像生成模型为rectified flow模型）。

笔者在下边的两篇往期文章分别介绍了多模态理解模型（ deepseek VL ）和第一类多模态理解与生成统一模型（讲了 deepseek的Janus模型 ）：

【VLM】详解视觉语言模型原理及代码，以DeepSeek-VL为例

【多模态理解与生成统一模型】LLM+image token生成范式原理与代码解析

​

本文将详细介绍第二类多模态理解与生成统一模型，以deepseek的Janusflow为例。Janusflow和Janus模型是同时发布的两个模型，不得不说，deepseek开源的是真全活。

Janusflow github：https://github.com/deepseek-ai/JanusJanusflow paper：https://arxiv.org/pdf/2411.07975

Janusflow整体结构

和Janus一样，Janusflow支持的图像理解和图像生成也是两个比较割裂的任务，这两个任务使用的图像编码器都不是共享的，只不过共享LLM的主干部分，因此可以分开来讲。

- 在进行图像理解任务时，图像编码器(und.Encoder)是SigLIP，然后就是走qwen-vl、deepseek vl一样的流程，将图像和文本对齐到同一空间，输出关于图像的文本内容。

- 在进行图像生成任务时，使用 rectified flow模型的范式去生成图像，LLM的文本内容当作条件去控制 rectified flow模型生成和文本相关的内容。 rectified flow模型的编码器和解码器都是由ConvNeXt block堆叠而成。图像生成实际是在 latent space中进行的， latent space中特征图大小为44848，最后用VAE的decoder将图像从 latent空间映射到像素空间（3384384），在latent space进行图像生成更加高效（注意，SDXL-VAE在图中并没有体现），

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/多模态理解与生成统一模型llmflow模型生成范式原理与代码解析.md)

---

