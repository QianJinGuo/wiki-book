---
title: "PixelRAG：伯克利开源视觉 RAG 方案——用截图替代文本解析"
source_url: "https://mp.weixin.qq.com/s/Igx2Srav3EKVPaQSX3cgFA"
author: "若飞"
source: "架构师（JiaGouX）"
ingested: 2026-07-01
sha256: placeholder
---

PixelRAG！伯克利最新项目要颠覆传统 RAG？

🤖 传统的 RAG 流程可以总结为：「页面内容/文档 - 将HTML 转为纯文本 - 文本切块 - 支持向量检索」，在实际使用中，存在几个关键问题：
- 纯文本解析器会丢失40%以上的关键信息；大量结构化信息丢失，导致问答准确率大幅下滑；
- 解析过程会丢失表格，流程图，页面布局，排版等视觉信息；
- 不稳定，不同解析器的差异会造成检索结果剧烈波动；
⭐️ 伯克利的最新开源项目 PixelRAG 则另辟蹊径，完全抛弃了文本解析链路，采用了基于视觉的方案进行检索；

🤖 PixelRAG 的流程可以解析为：「页面内容/ PDF 文档 - 无头浏览器渲染截图切片 - 视觉大模型编码图像向量 - 建立 FAISS 视觉索引- 图文检索 - VLM 模型识图作答」
⭐️ 它完整保留了页面的所有视觉结构，让 Agent 能够像人一样看图理解文档；经研究实测，它具备以下优势：
- 提升准确率：主流基准测试中，比最强的文本 RAG 还提升了 18.1%
- 降低成本：Agent 场景下， Token 消耗量降为 1/10；
- 结构化文档效果碾压：图表，报表，流程图等问答效果远超文本 RAG；
- 减少幻觉：检索结果是完整截图，VLM 可以直接定位到图像中的位置，容易溯源；

🤖 PixelRAG 还发布了配套论文「Web Screenshots Beat Text for Retrieval-Augmented Generation」，技术上，核心基于两大模块：
- 文档渲染模块：Pixelshot，用于渲染截图切片；
- 视觉嵌入与检索模块：在海量的截图数据中，微调了 Qwen3-VL-Embedding-2B 模型，专门用于截图检索；
⭐️ 总结来说，PixelRAG 颠覆了传统的文本 RAG，采用了纯视觉原生的 RAG 方案，不依靠 HTML 文本解析，直接用截图完成检索；同时，随着视觉语言模型 VLM 的发展，PixelRAG 的能力会不断提升；
