---
title: 不改模型、不降质量，谷歌让Gemma 4快了3倍：本地跑大模型彻底变天
source_url: https://mp.weixin.qq.com/s/HTy6fF138eZn6VKLqnF75Q
publish_date: 2026-05-16
tags: [wechat, article, coding, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 4e84ca5ae92110bf28938ba5abdb80e5da9344dd017c05bda99be3a100405fb3
---
# 不改模型、不降质量，谷歌让Gemma 4快了3倍：本地跑大模型彻底变天
↑阅读之前记得关注+星标⭐️，😄，每天才能第一时间接收到更新
###  Gemma 4推理速度提升3倍，谷歌靠的是这项技术
谷歌刚刚给Gemma 4家族更新了一项关键能力：Multi-Token Prediction（MTP）推测解码架构，推理速度最高提升3倍，输出质量不变。
就在几周前，Gemma 4刚刚发布，首批下载量已超6000万次。这次更新直接瞄准了开发者最关心的痛点——速度。
###  为什么LLM推理慢？
根本原因在于内存带宽瓶颈。
标准大模型每次只能生成一个token，处理器需要把数十亿参数从显存搬到计算单元，才能完成这一个token的预测。不管是预测简单词语还是解复杂逻辑，每一步消耗的算力是一样的，计算资源大量闲置，延迟自然居高不下，在消费级硬件上尤为明显。
###  MTP如何解决这个问题？
核心思路是：用一个轻量级的草稿模型，提前预测多个token，再让大模型并行验证。
具体流程是：轻量草稿模型（drafter）利用闲置算力，在大模型处理一个token的时间里，连续预测出多个候选token；大模型随后对这批候选token做一次并行验证，如果全部认可，就直接接受整个序列，并额外生成一个新token。
结果是：原本生成一个token的时间，现在可以输出整个草稿序列加一个额外token。
这一技术最初来自谷歌研究人员发表的论文 Fast Inference from Transformers via Speculative Decoding。
###  全面利好开发者
对于部署场景，MTP drafters带来的具体改变包括：
近实时响应：实时对话、语音应用、多步骤智能体工作流的延迟大幅降低。
本地开发提速：26B MoE和31B Dense模型可以在个人电脑和消费级GPU上跑出更快速度，离线编码和复杂工作流不再卡顿。
边缘设备增强：E2B和E4B模型在边缘设备上的输出速度提升，同时降低电池消耗。
质量零损失：大模型保留最终验证权，推理精度和输出质量与原版完全一致。
###  技术细节
为了让草稿模型跑得更快、预测更准，谷歌做了几项架构层面的优化。
草稿模型直接复用目标大模型的激活值，并共享其KV缓存，不需要重新计算大模型已经处理过的上下文，避免了重复计算。
针对E2B和E4B边缘模型，由于最终logit计算是主要瓶颈，谷歌在嵌入层引入了高效聚类技术，进一步加速生成。
在硬件适配方面，26B MoE模型在Apple Silicon上以batch size 1运行时，由于混合专家模型的路由特性，加速效果有限；但当batch size提升到4到8时，本地推理速度可提升约2.2倍。NVIDIA A100在增大batch size后也观察到类似增益。
###  如何使用
MTP drafters现已以Apache 2.0开源协议发布，与Gemma 4保持一致。模型权重可在 Hugging Face 和 Kaggle 下载，支持 transformers、MLX、vLLM、SGLang、Ollama 等主流推理框架，也可通过 Google AI Edge Gallery 在 Android 或 iOS 上直接体验。
谷歌可能已经把这个技术扩展到全系列模型了
技术架构详解、KV缓存共享和嵌入加速的完整说明，谷歌已发布专项技术文档，可查阅官方文档了解具体用法。
https://ai.google.dev/gemma/docs/mtp/overview?hl=zh-cn
\--end--
最后记得⭐️我，每天都在更新：
/...@作者：你说的完全正确（YAR师）