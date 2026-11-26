# ES 做 Agent 记忆层，召回率0.89

> 📊 Level ⭐⭐⭐ | 9.5KB

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

### 分型是把生命周期编码进存储层

四种索引的本质差异不在字段多少，而在三组互斥的生命周期参数：episodic 只写不改、以 timestamp 为衰减源；semantic 低频写高频更、以 last_used_at 为衰减源并维护 use_count 与 supersession 链；procedural 带 success/failure 计数器且衰减恒为 1.0 豁免；catalog 干脆去掉 user_id 走公共货架。原文对"为什么不能合并成一个索引"的论证比结论更有价值：合并后 Painless decay_script 必须为不同衰减源写 if-else 分支，三套互斥的 update pattern 硬叠在一起，而 ES 的 schema-on-write mapping 也装不下"有的索引有 superseded_by、有的没有"这种差异——要么全量字段带大量 null，要么 nested 结构让查询复杂度暴涨。更深一层的启示是衰减源的选择编码了一种信息观：semantic 用 last_used_at 而非 timestamp，等于承认"信息的衰减驱动力是它有多频繁被需要，不是它有多旧"。[Memory Consolidation Decay](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/memory-consolidation-decay.md) 与 [Episodic Vs Semantic Memory Agent](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/episodic-vs-semantic-memory-agent.md) 分别从巩固机制与记忆类型学的角度印证了这套分型。

### 混合召回的价值结构：两条腿各补对方的盲区

单腿数字 dense 0.845、BM25 0.708、混合 0.889、reranker 单点贡献 0.238 的正确读法，不是"dense 为主、BM25 辅助"，而是两条腿为不同查询形态而设：BM25 抓版本号/错误码/人名这类精确 token，dense 抓"上次说的那个数据库偏好"这种零词法重叠的语义意图。Verbatim Pre-Recall 正是从这个结构推导出的设计——在 LLM 调用前用用户原话跑 BM25，因为 LLM 会把 "postgres v15.3 + pgvector 0.5.1" 泛化成 "PostgreSQL数据库"，恰好毁掉只有 BM25 能匹配的那部分 token；ablation 进一步证明 query expansion 反而降分，因为 paraphrase 提供的信息两条腿已经各自覆盖。RECALL_OVER_FETCH_K=80 则划定了 reranker 的能力边界：重排器只能重排进池的候选，K=10 时 consolidation 产生的近重复事实可能把 gold doc 挤出视野——召回上限在候选生成阶段就已注定。

### 把召回率当成可回归的 CI 指标

168 QA、3 个 persona、各约 250 条文档的评测集，配合 R@10≥0.85 / R@5≥0.75 / leaks=0 的 CI gate（Atlas 实测 0.89），让"记忆好不好"从体感变成回归测试；评测期间关闭 use_count 更新以保证可复现，这个细节说明作者把评测确定性放在了在线指标的真实性之上。同样工程化的是降级路径：cross-encoder 失败时不静默，记 error 日志并回退到 RRF 顺序——检索链路的每个环节都假设自己会挂。文章反复强调 Atlas 的数字只是参考值，正确用法是在自己集群上跑 BM25-only / dense-only / hybrid / no-reranker 四组 ablation，看每条腿在自己数据上的贡献分布；这种"别信我的数字，信你的实验"的姿态，与 [Agent Memory Evaluation Landscape Taobao Survey](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-memory-evaluation-landscape-taobao-survey.md) 对记忆评测方法学的梳理相呼应。

### 生命周期闭环：提炼与矛盾处理是检索质量的隐性前提

Consolidation 把原始事件转化为稳定事实——没有这一步，语料就是越长越大的日志文件，events-to-facts 比例失衡后，BM25 和 reranker 面对海量噪声文档的召回质量会急剧下降。Soft-supersession 补上非破坏性更新：旧事实永不删除（审计需要）但召回默认过滤（业务需要），链式标记支持任意长度追溯，harsh 矛盾（用户明确否认）对新事实扣 0.1 置信度直到后续交互再确认。两者的成本模型同样现实：每回合跑 consolidation 使 LLM 调用翻倍，产品场景应转夜间日批、接受约 24h 新鲜度损失；20 人内部工具场景直接砍掉 consolidation 改手工标记——自动提炼是为"用户不可见记忆管理"设计的，用户愿意配合标记时它并非必选项。这正是 [When Not To Memory Architecture](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/when-not-to-memory-architecture.md) 的核心论点：记忆组件的取舍取决于场景而非技术先进性。对照 GBrain 的 Markdown+Git 路线（P@5 49.1%、R@5 97.9%，人可读但 Git 不耐高频写入），分界线更清晰：个人助理信任优先选可读存储，多租户产品隔离优先选 ES 原生 DLS。这与 Harness Engineering 的分层思想一致：生命周期不同的信息，不该共享同一套管理策略。

## 实践启示

- 想做一个 min viable 记忆系统？不需要 Atlas 的全部复杂度：episodic + BM25 + 简单的 timestamp 衰减就够 starter 版
- 多租户产品选 ES DLS（一行配置解决隔离），个人助理选 GBrain（文件可读可编辑）
- REFRESH=True（同轮可见）在生产场景换 async indexing + just-written register
- 衰减源的优先级高于衰减值：sematic 用 last_used_at 而非 timestamp
- Ablation 是评估每条腿贡献的唯一可靠方式 — 不要相信架构师的直觉，要相信 CI gate
- RECALL_OVER_FETCH_K 决定召回上限：reranker 救不回没进候选池的 gold doc，consolidation 近重复多的语料要加宽候选池
- 预召回喂用户原话不喂 LLM 改写：版本号/错误码被泛化掉的那一刻 BM25 腿就废了，query expansion 已被 ablation 证伪
- consolidation 按场景取舍：每回合跑翻倍 LLM 成本，产品转夜间日批，20 人以下小团队手工标记更划算

## 相关实体

- [Agent Evolution Four Stages Six Dimensions Aliyun](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-evolution-four-stages-six-dimensions-aliyun.md)
- [Vivo Agent Brain Body Icu Harness Evolutionary Framework 2026](https://github.com/QianJinGuo/wiki-public/blob/main/entities/vivo-agent-brain-body-icu-harness-evolutionary-framework-2026.md)
- Harness Engineering
- [Hermes Agent 记忆系统 vs OpenClaw 记忆观](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-memory-system-vs-openclaw.md)
- [State Of Memory In Agent Harness Mem0 2026](https://github.com/QianJinGuo/wiki-public/blob/main/entities/state-of-memory-in-agent-harness-mem0-2026.md)

→ [原文存档](https://mp.weixin.qq.com/s/fypjVWJBQg_MZV9OMfPpIA)

---

