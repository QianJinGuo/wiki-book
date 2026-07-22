---
title: "Karpathy 的 LLM Wiki 搭建实战：三层架构 + 三大操作，Obsidian + AGENTS.md 让知识库自我维护"
source_url: "https://mp.weixin.qq.com/s/UKJ16eyp1STkkkajTSrjnA"
ingested: 2026-07-03
sha256: 8c6ddb32e8a721a72085b04239db9cb4395b86b67ed03ff8d8991472799001c1
author: 术哥无界
publisher: 术哥无界 (运维有术)
---

Karpathy 的 LLM Wiki 方法论：你几乎不用自己写 wiki，只负责找资料和提问；LLM 负责所有记账的脏活累活。

核心洞察：维护知识库累人的地方不是读、不是想，是"记账"——更新交叉引用、保持摘要不过时、标注矛盾、跨页面维持一致性。这正是人类放弃维护 wiki 的原因——维护成本增长比价值增长快。LLM 把这件事接过去了。

三层架构：

第一层：Schema（行为配置）—— AGENTS.md / CLAUDE.md，告诉 LLM「该怎么干活」的配置文件，定义 wiki 如何组织、页面类型、工作流。

第二层：Raw（原始资料只读）—— 存放来源 PDF、文章、笔记，只读不改。

第三层：Wiki（LLM 维护的知识库）—— LLM 全权维护的 wiki 页面，人不需要直接编辑。

三大操作：
1. Ingest：新资料加入时，LLM 读完整篇、提取关键信息、整合进现有 wiki、更新实体页、修订综述摘要、标注矛盾。一次摄取常常同时触碰 10-15 个页面。
2. Consolidate：定期整合，解决矛盾，保持一致性。
3. Query：基于累积的 wiki 回答问题，而非从零检索。

RAG vs LLM Wiki 对比：RAG 每次从零检索、问完即散；LLM Wiki 摄取一次整合 10-15 个页面，知识持续累积变厚。产物是持久的、复利的（persistent, compounding artifact）。
