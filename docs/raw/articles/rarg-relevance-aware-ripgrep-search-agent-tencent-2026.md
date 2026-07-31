---
title: "腾讯新研究：让Agent在语料中搜得更快、更准"
source_url: "https://www.xiaohongshu.com/discovery/item/6a6b20ab000000002402cf58"
source_site: "xiaohongshu.com"
source_account: "Oscholar"
author: "Oscholar"
ingested: 2026-07-31
sha256: "535dbda0e9ec5ff5897c6ddbc87c1708c699997050fdbf334af6606aafd864e7"
type: raw-article
tags: [rag, agentic-search, retrieval-agent, ripgrep, tencent, browsecomp]
---

# 腾讯新研究：让Agent在语料中搜得更快、更准

很多检索 Agent 的瓶颈，在于找到相关文档之后，能否尽快定位并组合真正有用的证据。传统 retrieval agent 依赖 top-k 文档召回，效率高，但复杂问题里的关键证据常常藏得更深；直接用 grep 式工具搜索原始语料虽然更细，但如果缺少相关性引导，线索往往来得太晚，搜索也更容易发散。

腾讯联合中科院信工所提出了 **RARG（Relevance-Aware RipGrep Search Agent）**。核心想法是：相关性不该只用于召回文档，还应该继续指导 Agent 在语料里的实际搜索过程。

## 三层设计

- **文档级相关性引导**：先用检索器给文档排序，再让 ripgrep 按这个顺序依次扫描，让更可能有线索的文档更早被看到。
- **入口初始化**：从高相关文档里抽取 query 相关段落，给 Agent 一个更好的起始搜索入口。
- **匹配片段重排**：对 grep 命中的片段再做相关性重排，把更有信息量的局部证据优先暴露给模型。

## 实验效果

作者在 BrowseComp-Plus 和 BRIGHT 这两类高难检索任务上做了测试：

- 在 100K 文档的 BrowseComp-Plus 上，GPT-5.4-mini + RARG++ 达到 84% 准确率，高于 RISE 和 DCI 的 78%，平均工具调用从 28.7 / 99.1 降到 23.9。
- 在 GPT-5.4 设置下，RARG++ 做到 91%，比 RISE 高 9 个点。
- 语料扩到 100 万文档后，RARG++ 仍保持 79%，而 RISE 为 69%。
- 在 BRIGHT 上，RARG+ 的平均 nDCG@10 达到 53.36，超过 DCI、RISE 和检索型 NeMo agent。

## 价值

这篇工作的价值，在于让检索分数继续参与 Agent 的执行过程，决定先搜哪里、先看哪些匹配。对做 Agentic Search、长文档检索、代码库搜索、论文库搜索和企业知识库问答的同学，这篇很值得看。代码已开源。
