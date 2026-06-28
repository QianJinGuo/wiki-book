## Ch10.010 Karpathy LLM Wiki V2：记忆生命周期 + 知识图谱 + 混合检索 + 落地路线图

> 📊 Level ⭐⭐ | 10.0KB | `entities/karpathy-llm-wiki-v2-deep-analysis-rohit-ghumare.md`

# Karpathy LLM Wiki V2：从复利启动到复利防烂

Rohit Ghumare 在 Karpathy 的 LLM Wiki gist 上更新的 V2 版本，把原版"让知识开始复利"的思路推到了"复利系统别烂掉"。核心新增：记忆生命周期、类型化知识图谱、混合检索、事件驱动、质量治理。

与 [Karpathy LLM Wiki V2 中文概述](ch01-271-karpathy-llm-wiki-v2-2026.html) 互补——原 entity 是中文入门解读，本文是 V2 深度技术分析 + 落地路线图 + 评测方法论。

→ LLM Wiki 范式 — 原版三层架构（Raw → Wiki → Schema）

## 原版回顾

Karpathy 的原版反对 RAG（每次重算），主张让 LLM 把资料**编译**成 wiki。三层结构：

| 层 | 作用 |
|---|---|
| Raw sources | 原始材料，LLM 只读不改 |
| Wiki | LLM 维护的 Markdown 页面（summary/entity/concept） |
| Schema | CLAUDE.md / AGENTS.md，写作和维护规则 |

类比：Obsidian = IDE，LLM = programmer，wiki = codebase。人负责选题和判断，LLM 负责整理、交叉引用、补 index、查孤儿页。

## V2 六大生产层升级

### 1. 记忆生命周期

wiki 页面不能默认同等可信。V2 加入 memory lifecycle：

- **Working memory** → 当前 session 临时
- **Episodic memory** → 事件记录
- **Semantic memory** → 压缩后的事实
- **Procedural memory** → 操作模式

越往后越压缩，证据越强，生命周期越长。

关键主张：confidence 不应是裸数字（0.85），应做成**证据链**——来自哪个 ADR、哪次 commit、哪篇 source、哪次 session，最近确认时间，是否被新信息替代。

### 2. 类型化知识图谱

原版靠 Markdown wikilink + Obsidian graph，只能看页面连接。V2 需要带含义的边：`uses`、`depends_on`、`contradicts`、`supersedes`。

查询场景：升级 Redis 影响哪些服务？某个鉴权决策牵涉哪些 bug 和负责人？普通 wikilink 无法回答这类影响链问题。

### 3. 混合检索

原版 index.md 在 100-200 页内有效。V2 超过此阈值用三路检索 + RRF 融合：

- **BM25**：精确关键词匹配
- **向量搜索**：语义相似
- **图遍历**：结构上相关的影响链

关键洞察：BM25 + 向量负责"此刻相关"，图遍历负责"结构相关"。两者必须一起用。

### 4. 事件驱动维护

session end → 自动生成候选 summary → proposal-first 写入。直接改主 wiki 危险，应走 review queue。

### 5. 写入门控

| 风险等级 | 操作 | 策略 |
|----------|------|------|
| 低 | append 新 claim | 自动提交 |
| 中 | 已有 claim 增加证据 | 自动追加 |
| 高 | contradiction/supersession/批量删除/权限变更 | 人工审核 |

### 6. 多 Agent 协调

mesh sync、shared/private knowledge、coordination boundary。

## V1 vs V2 对比

| 问题 | 原版处理 | V2 处理 |
|------|----------|---------|
| 知识变旧 | lint 发现 stale claim | lifecycle + supersession + retention |
| 搜索扩展 | index.md + 可选工具 | BM25 + vector + graph |
| 结构关系 | wikilinks | typed entities and relations |
| 自动维护 | 人触发 ingest/lint | hooks + 事件驱动 |
| 多 Agent | 略提团队场景 | mesh sync + shared/private |
| 治理 | Git 历史 | privacy filter + audit + reversible bulk ops |

## 落地路线图

**Phase 1 — MVP**：保留 raw/、wiki/、index.md、log.md、AGENTS.md。每次 ingest 更新相关页面，看 Git diff。验收：一次 source 稳定更新 summary/entity/concept/index/log。

**Phase 2 — 证据链**：加 claim id + source_ref（如 `auth.redis-cache.uses`）。新证据追加到 claim，旧决策被替代时用 supersedes 链接。旧内容不消失——解释今天设计为什么长这样。

**Phase 3 — 混合检索**：SQLite FTS5 / 本地 BM25 → embedding → frontmatter/sidecar JSON 抽图关系。图数据库晚点上，先定实体和边的契约。

**Phase 4 — 事件驱动**：proposal-first，高风险写入进 review queue。

## 评估方法论

评估应围绕**决策**做，不是功能覆盖：

**检索层**：三路 vs 单路 vs index？测 Recall@5、MRR、p50/p95 latency、token cost。查询分类型：精确术语、语义同义、影响分析、历史决策、个人偏好。只有影响分析类需要图遍历时再加重图。

**写入层**：自动 proposal 是否降低维护成本？测 unsupported claim rate、duplicate claim rate、wrong supersession rate、citation validity、human edit distance。先重放历史 session，只产出 proposal 不写主库。

**生命周期**：先测 supersession，不急着测遗忘曲线。旧 bug 和旧 ADR 未必该忘——它们是避免重复踩坑的线索。

## 社区工程评审

- **luancaarvalho**：扩展问题 → index 200-500 文档撑不住，agentmemory 用三路 + RRF，LongMemEval-S 95.2% R@5
- **webmaven**：书籍级 ingestion 瓶颈在 chunking + observation 生成 + 图谱抽取成本
- **gnusupport**：confidence 没定义、auto-crystallization 没算法、hybrid search 没 latency metric、multi-agent 缺 ACL/versioning/provenance → 方向可以借，计划不能照抄
- **ghost**：schema 做好 → ingest 时过滤；numeric confidence 有伪精确风险；主张 supersession 代替 decay、git 做 audit、manual before automated

生态线索：Memex（daily captures → P.A.R.A.）、ctx（skills/agents 知识图谱 → Claude Code 推荐）、ChristopherA（named edges: `derived_from::[Source]`）

## 演进方向

1. **evidence contract**：claim 稳定 id + 来源边 + 替代链接 + 证据链展示
2. **segmentation**：个人偏好/项目事实/团队决策/临时任务/研究材料分 schema，生命周期和权限不同
3. **Agent context operating system**：session start 加载 → tool use 记录 → 任务结束沉淀 → 多 Agent 共享

## 深度分析

### 从"编译一次"到"持续维护"的知识系统演进

Karpathy 原版 LLM Wiki 的核心洞察是"RAG 每次重算，Wiki 会累积"——让 LLM 把原始材料编译成结构化 wiki，后续查询直接读 wiki 而非重走 RAG 管线。V2 的贡献在于识别出这个模式的长期衰减问题：知识会过期、链接会断裂、搜索会变慢、自动化会引入噪声。这不是推翻原版，而是为原版的"复利"承诺加上"防烂"机制。

### 证据链 vs 裸置信度数字的设计权衡

V2 提出 confidence 字段，但社区评审（gnusupport、ghost）指出裸数字（如 0.85）有"伪精确风险"。更好的设计是证据链：每条 claim 关联到具体来源（ADR、commit、session、文章），附带最近确认时间和替代链接。这与 Hermes wiki 已有的 `provenance_state` 和 `` 引用模式不谋而合。

### 混合检索的"此刻相关"与"结构相关"二分法

BM25 + 向量搜索负责"此刻相关"（当前查询的语义匹配），图遍历负责"结构相关"（影响链、依赖关系）。这个二分法是 V2 检索设计的核心洞察。实践中，大部分查询只需要"此刻相关"，只有影响分析类查询需要图遍历。这意味着图检索层可以按需加载，不必每次都跑。

### 写入门控是知识系统可靠性的关键

V2 的写入门控设计（低风险自动提交、高风险人工审核）解决了知识系统的核心矛盾：自动化带来效率，但也带来污染风险。ghost 的评论指出"event-driven auto-ingest 默认 LLM 可靠，在生产里很危险"。Proposal-first 模式（Agent 生成 diff，人工审核后写入）是平衡效率与安全的工程选择。

### 评估应围绕决策而非功能覆盖

V2 的评估方法论强调"围绕决策做"而非"功能全覆盖"。BM25、向量、图谱、confidence、decay、hooks、lint 全做一遍，demo 很热闹但真实任务不一定更好。正确的评估方式：先重放历史 session，只产出 proposal 不写主库，通过后再开放低风险自动写。这与软件工程中的"先测试再上线"原则一致。

## 实践启示

1. **知识系统应从原版开始，按需加 V2 模块**：先证据链 → 再 supersession → 再检索融合 → 再 proposal-first automation。每一步都要能回答"少解释了吗、找得更准了吗、过期答案少了吗"
2. **confidence 应做成证据链而非裸数字**：每条 claim 关联到具体来源，附带最近确认时间和替代链接。避免"伪精确"带来的虚假权威感
3. **图检索按需加载**：大部分查询只需要 BM25 + 向量搜索，只有影响分析类查询需要图遍历。不要为了完整性而每次都跑全量图检索
4. **写入门控比自动化更重要**：低风险 append 可以自动提交，但 contradiction、supersession、批量删除必须人工审核。Proposal-first 是安全与效率的平衡点
5. **评估基准应围绕决策质量**：测 Recall@5、MRR、unsupported claim rate、human edit distance，而非功能覆盖率

## 相关链接

- → [Karpathy LLM Wiki V2 中文概述](ch01-271-karpathy-llm-wiki-v2-2026.html) — 原版入门
- → LLM Wiki 范式 — 概念定义
- → 知识图谱 RAG — 图检索方法论
- → LLM Wiki 架构哲学
- → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/karpathy-llm-wiki-v2-deep-analysis-rohit-ghumare.md)

---
