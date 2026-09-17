# Ch10 RAG 与知识检索

> 让 Agent 拥有外部知识：从向量检索到知识图谱

> 本章收录 **23 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 1 |
| ⭐⭐ 工程师 | 需编程基础 | 2 |
| ⭐⭐⭐ 专家 | 需ML基础 | 7 |
| ⭐⭐⭐⭐ 科学家 | 需研究背景 | 11 |
| ⭐⭐⭐⭐⭐ 大师 | 前沿/哲学 | 2 |

---

## 导读

模型的知识有截止日期，但 RAG 让它能访问实时信息。

本章从最基础的向量检索开始，经过分块策略、重排序（Reranker）、到知识图谱和本体论。一篇 49.6KB 的深度长文给出了核心判断：

"向量库是 RAG 的前菜，知识图谱是答案，本体论是灵魂。"

你还会看到 Google 的 Agentic RAG 框架如何用 5 阶段管线提升检索质量，以及从 Naive RAG 到 Agentic RAG 的完整演进路径。

RAG 不只是"检索 + 拼接"——它是知识管理的入口。

---



---

## 本章内容

### ⭐ 入门（1 篇）

- [001. DREAM：用冻结 LLM 的自回归预测训练稠密检索器，无需标注正负样本](ch10/001-dream-llm)

### ⭐⭐ 工程师（2 篇）

- [002. 【实践教程】真实AI客服落地全流程：意图识别、混合检索到数据飞轮](ch10/002-ai)
- [003. Google出手统一全模态检索：Gemini Embedding 2把文本、图片、音频和视频压进同一向量空间](ch10/003-google-gemini-embedding-2)

### ⭐⭐⭐ 专家（7 篇）

- [004. Nvidia Multimodal RAG Knowledge Systems](ch10/004-nvidia-multimodal-rag-knowledge-systems)
- [005. Manufacturing Intelligence with Amazon Nova Multimodal Embeddings](ch10/005-manufacturing-intelligence-with-amazon-nova-multimodal-embed)
- [006. 向量数据库已死，Claude Code、Cursor 为什么集体抛弃 RAG？](ch10/006-claude-code-cursor-rag)
- [007. SkillCorpus: 大规模社区 Skill 生态的筛选、评测与边界分析](ch10/007-skillcorpus-skill)
- [008. 视频 RAG 分块策略：停顿 / 滑动窗口 / LLM 主题分块](ch10/008-rag-llm)
- [009. 怎么短平快地把RAG做好：厦门国际银行数创金融杯RAG初赛方案](ch10/009-rag-rag)
- [010. 知识库构建方法论](ch10/010-page-010)

### ⭐⭐⭐⭐ 科学家（11 篇）

- [011. 向量库是RAG的前菜，知识图谱是答案，本体论是灵魂](ch10/011-rag)
- [012. RAG技术框架的演进方向](ch10/012-rag)
- [013. RAG 分块优化 2025：策略选择与工程实践](ch10/013-rag-2025)
- [014. RAG Chunk Embedding Rerank Pipeline](ch10/014-rag-chunk-embedding-rerank-pipeline)
- [015. RAG 全链路技术详解：从文档加载到 Ragas 评估](ch10/015-rag-ragas)
- [016. Karpathy LLM Wiki V2：记忆生命周期 + 知识图谱 + 混合检索 + 落地路线图](ch10/016-karpathy-llm-wiki-v2)
- [017. MRAgent：记忆是重建的，不是检索的](ch10/017-mragent)
- [018. PixelRAG：用截图替代文本解析的视觉 RAG 范式](ch10/018-pixelrag-rag)
- [019. RAG vs LLM Wiki 深度对比：企业知识库架构选型指南](ch10/019-rag-vs-llm-wiki)
- [020. Instacart 广告检索架构演进：从 BERT 打分到生成式 token-by-token 检索](ch10/020-instacart-bert-token-by-token)
- [021. Fragnesia: Linux Kernel Local Privilege Escalation via ESP-in-TCP](ch10/021-fragnesia-linux-kernel-local-privilege-escalation-via-esp-i)

### ⭐⭐⭐⭐⭐ 大师（2 篇）

- [022. RAG → 知识图谱 → 本体论：三层知识架构](ch10/022-rag)
- [023. Ettin Reranker Family](ch10/023-ettin-reranker-family)


---

## 本章收束

"向量库是 RAG 的前菜，知识图谱是答案，本体论是灵魂。"这一章最重要的提醒是：RAG 不是检索拼接，而是知识管理——权限、新鲜度、引用、拒答，每一项都比相似度搜索更难。当你的 RAG 系统能说"我不知道"并且说对的时候，它才从 demo 变成了系统。

---
