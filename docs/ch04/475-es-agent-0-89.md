# ES 做 Agent 记忆层，召回率0.89

## Ch04.475 ES 做 Agent 记忆层，召回率0.89

> 📊 Level ⭐⭐ | 5.6KB | `entities/es-agent-memory-layer-atlas-elasticsearch-2026.md`

# ES 做 Agent 记忆层，召回率0.89

## 摘要

基于 Elasticsearch 构建 Agent 记忆系统的完整工程实践，来自 Atlas 项目（noamschwartz/atlas-memory-demo）。核心方案：三索引分型（episodic/semantic/procedural/catalog）+ BM25+dense 双通路混合召回 + cross-encoder 重排序 + consolidation 写后提炼 + soft-supersession 矛盾处理。提供了完整的 ES mapping 模板、recall.py 脚本和 168 QA 评测集。

## 核心要点

1. **三索引分型不是设计选择，是不能省的分型逻辑**：episodic（原始消息，高频写不更新）、semantic（提炼稳定事实，低频写高频更新）、procedural（多步操作 playbook，免衰减）、catalog（公共共享知识，无 user_id 隔离）— 四个索引字段语义不同、衰减策略不同、更新模式不同，合并成一个索引会产生字段语义污染、生命周期冲突、mapping 无法承载三组问题
2. **混合检索 BM25+dense 双通路**：BM25 抓精确 token（版本号/错误码/人名），dense 抓语义意图 — 两条腿不可省略。BM25 单腿 R@10=0.708，dense 单腿 0.845，混合后 0.889。query expansion 反效果已通过 ablation 验证
3. **关键变量 RECALL_OVER_FETCH_K=80**：候选池太窄（如 K=10）时近重复 doc 可能把 gold doc 挤出 reranker 视线。80 候选在 ~250 docs/用户语料上 32% 覆盖率
4. **Per-index 时间衰减**：episodic 按 timestamp gauss(scale=1825d)，semantic 按 last_used_at gauss(scale=1825d) + use_count boost，procedural 恒为 1.0 豁免衰减。衰减源的选择比衰减值本身更重要
5. **Verbatim Pre-Recall**：在 LLM 调用前先用用户原话（不经 LLM 改写）跑 BM25 检索 — 绕过 LLM 的泛化倾向（如 "postgres v15.3 + pgvector 0.5.1" → "PostgreSQL数据库"），保证精确 token 不被丢失
6. **Soft-Supersession（非破坏矛盾处理）**：用户说"搬到深圳了"，不 update 旧 doc，而是创建新 doc 标记 supersedes 旧 ID + 旧 doc 标记 superseded_by。召回默认过滤旧版，但可通过 include_superseded=True 查看全版本链
7. **Consolidation（写后提炼）**：每回合从最近 30 条 episodic 事件中提取稳定事实和操作流程，写入 semantic 和 procedural 索引。20 人场景可砍掉（手工标记更划算），产品场景不可省略
8. **RRF 融合 + Cross-encoder 重排序**：BM25 和 dense 两路各有 rank_constant=30（比默认 60 小，让前排信号更强），RRF 融合后 Jina v2 cross-encoder 逐对评分 top80 → top-K。reranker 单点贡献 0.238

## 深度分析

本文的核心贡献不在于"用 ES 做记忆"这个选择，而在于**分型 + 混合 + 生命周期**三位一体的架构设计。它将 Agent 记忆系统从"KV 存储 + 最近 N 条"的朴素模型提升到了信息检索系统的高度。

与同类方案的对比：
- **Atlas（本文）**：ES 三索引 + BM25+dense 混合 + reranker + consolidation — 工程成熟度高，多租户场景最自然
- **GBrain**：Markdown + Git 做存储，P@5=49.1%, R@5=97.9% — 可读性优先，适合个人助理，不适合高频写入
- **Mem0 / Letta**：向量数据库 + 基础管理 — 有向量检索但无分型生命周期
- **LangGraph**：状态机快照 — 适合工作流重放而非跨会话知识查询

三索引分型的思路与 [Harness Engineering](../ch05/050-harness-engineering.html) 中的分层思想一致，都是将不同生命周期的信息用不同的策略管理。

文章末尾提出的三个通用设计原则值得反复读：衰减曲线是领域决策不是技术参数、混合检索 BM25+vector 互补不二选一、后台提炼和矛盾处理是必须的非可选。

## 实践启示

- 想做一个 min viable 记忆系统？不需要 Atlas 的全部复杂度：episodic + BM25 + 简单的 timestamp 衰减就够 starter 版
- 多租户产品选 ES DLS（一行配置解决隔离），个人助理选 GBrain（文件可读可编辑）
- REFRESH=True（同轮可见）在生产场景换 async indexing + just-written register
- 衰减源的优先级高于衰减值：sematic 用 last_used_at 而非 timestamp
- Ablation 是评估每条腿贡献的唯一可靠方式 — 不要相信架构师的直觉，要相信 CI gate

## 相关实体

- [Agent Evolution Four Stages Six Dimensions Aliyun](../ch03/045-agent.html)
- [Vivo Agent Brain Body Icu Harness Evolutionary Framework 2026](../ch05/018-harness.html)
- [Harness Engineering](../ch05/050-harness-engineering.html)
- [Hermes Agent 记忆系统 vs OpenClaw 记忆观](../ch03/090-hermes-agent.html)
- [State Of Memory In Agent Harness Mem0 2026](../ch05/039-agent-harness.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/es-agent-memory-layer-atlas-elasticsearch-2026.md)

---

