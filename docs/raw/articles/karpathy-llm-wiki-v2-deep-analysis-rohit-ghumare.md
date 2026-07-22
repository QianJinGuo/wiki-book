---
title: "Karpathy LLM Wiki V2 深度分析：记忆生命周期 + 知识图谱 + 混合检索 + 落地路线图"
source_url: "https://mp.weixin.qq.com/s/Hgrj-5dxofZSD7c-ydjNAQ"
ingested: 2026-06-26
sha256: ""
type: raw
---

# Karpathy LLM Wiki V2 深度分析

Rohit Ghumare 在 Karpathy 的 LLM Wiki gist 上更新了一个 V2 版本。原版更像一份可以丢给 Codex、Claude Code、OpenCode 的 idea file，告诉 Agent 怎么帮你维护一个持续复利的 Markdown 知识库。V2 已经带着生产系统的味道：记忆生命周期、知识图谱、混合检索、事件驱动、质量治理都被拉进来了。

这篇 gist 值得看，但我更建议把它当路线图和问题清单。它讲清了下一代 Agent Memory 应该面对什么问题，也暴露出一堆还没被解决的工程细节。

## 原版到底在说什么

Karpathy 的原版 LLM Wiki 其实很克制。它反对把知识系统只做成 RAG：每次问问题，模型都重新从 raw documents 里捞 chunk，再临时拼答案。这个过程不会累积理解。

LLM Wiki 的做法是让 LLM 先把资料编译成 wiki。你把文章、论文、会议记录、代码讨论放进 raw sources；LLM 读完之后更新 summary、entity page、concept page、overview、index 和 log。以后再问问题，Agent 先读 wiki，再回答。

原版的三层结构很清楚：

| 层 | 作用 |
|---|---|
| Raw sources | 原始材料，不被 LLM 修改 |
| Wiki | LLM 维护的 Markdown 页面 |
| Schema | CLAUDE.md / AGENTS.md，规定写作和维护规则 |

我喜欢原版那个类比：Obsidian 是 IDE，LLM 是 programmer，wiki 是 codebase。人负责选题和判断，LLM 负责整理、交叉引用、补 index、查孤儿页这些维护活。

## V2 补上的生产层

V2 的出发点很现实：一个 wiki 启动起来不难，难的是变大之后还能保持清醒。

### 记忆生命周期

原版的 wiki 页面默认都差不多可信。V2 说这不行。一个昨天刚从三份材料里确认的事实，和半年前随手记下的一句猜测，不能在检索里拿同样权重。于是它加了 memory lifecycle：working memory、episodic memory、semantic memory、procedural memory。越往后越压缩，证据越强，生命周期越长。

它还提出 confidence、supersession、forgetting。这里要小心。confidence 如果只是一个 0.85，很容易给人一种没来由的权威感。我更愿意把它做成证据链：这个 claim 来自哪个 ADR、哪次 commit、哪篇 source、哪次 session，最近什么时候确认过，有没有被新信息替代。

### 类型化知识图谱

V2 另一个大变化是 typed knowledge graph。原版靠 Markdown wikilink 和 Obsidian graph，能看到页面之间连着。但真实查询经常问影响链：升级 Redis 会影响哪些服务？某个鉴权决策牵涉哪些 bug 和负责人？这时普通链接不够，需要 uses、depends_on、contradicts、supersedes 这种带含义的边。

### 混合检索

检索层也被升级了。原版认为 index.md 在中等规模下很好用，几百页时仍然能撑一阵。V2 认为过了 100 到 200 页，index 会变成瓶颈，所以用 BM25、向量搜索、图遍历三路一起找，再用 RRF 融合排序。

Rohit 在评论里补了一句很关键的话：不是把 index 换成 hybrid search 就结束了。BM25 和向量负责找到"此刻相关"的材料，图遍历负责找到结构上相关的影响链。两者要一起用。

## 和原版真正不同的地方

原版关注的是"让知识开始复利"。V2 关注的是"复利系统别烂掉"。

| 问题 | 原版处理 | V2 处理 |
|------|----------|---------|
| 知识变旧 | lint 时发现 stale claim | lifecycle、supersession、retention |
| 搜索扩展 | index.md + 可选搜索工具 | BM25 + vector + graph |
| 结构关系 | wikilinks | typed entities and relations |
| 自动维护 | 人触发 ingest/lint | hooks 和事件驱动 |
| 多 Agent | 略提团队场景 | mesh sync、shared/private、coordination |
| 治理 | Git 历史天然可用 | privacy filter、audit、reversible bulk ops |

这也是我觉得 V2 有价值的地方。它没有推翻原版，只是把原版跑久之后会遇到的问题摆出来。

## 落地方式

真要做，我不会一上来就做完整 V2。那会把系统搞得很重，到头来不知道哪一层真的有用。

比较稳的路径是先做 MVP：

保留 raw/、wiki/、index.md、log.md、AGENTS.md。每次 ingest 都让 Agent 更新相关页面，然后看 Git diff。MVP 的验收标准很朴素：一次 source 能稳定更新 summary、entity、concept、index、log，人能看懂每个改动。

下一步加 claim id 和 source_ref。比如某条事实叫 auth.redis-cache.uses，它来自某个 ADR、某个 commit、某次 session summary。新证据追加到 claim，旧决策被替代时用 supersedes 链接过去。旧内容不要消失，它经常解释了今天的设计为什么长这样。

再往后才是混合检索。先用 SQLite FTS5 或本地 BM25 做精确词，再加 embedding，再从 Markdown frontmatter 或 sidecar JSON 里抽图关系。图数据库可以晚点上，先把实体和边的契约定清楚。

事件驱动要更谨慎。session end 自动生成候选 summary 可以，直接改主 wiki 就危险了。我更倾向 proposal-first：Agent 自动抽取、找冲突、生成 diff，高风险写入进入 review queue。

这个写入闭环里，最重要的不是自动化本身，是写入门控。低风险 append 可以自动提交；已有 claim 增加新证据也可以自动追加；涉及 contradiction、supersession、批量删除、权限变更，就该让人看一眼。

## 评估方法论

这类系统最容易掉进"看起来很完整"的陷阱。BM25、向量、图谱、confidence、decay、hooks、lint 全都做一遍，demo 很热闹，真实任务里不一定更好。

评估应该围绕决策来做：

**检索层**：三路检索是否真的比 index 或单路检索找得更准？测 Recall@5、MRR、p50/p95 latency、token cost。查询分类型：精确术语、语义同义、影响分析、历史决策、个人偏好。只有影响分析类明显需要图遍历时，再把图做重。

**写入层**：自动 proposal 是否降低维护成本，还是在制造污染？测 unsupported claim rate、duplicate claim rate、wrong supersession rate、citation validity、human edit distance。先重放历史 session，让系统只产出 proposal，不写主库。通过后再开放低风险自动写。

**生命周期**：系统是否减少了过期答案？故意放入被替代的 claim，看回答时会不会提示冲突和新旧关系。先测 supersession，不急着测遗忘曲线。旧 bug 和旧 ADR 未必该忘，它们经常是未来避免重复踩坑的线索。

## 评论区工程评审

Rohit 的 gist 评论区很有意思。有人把它当高价值蓝图，也有人直接把工程坑列了出来。

- luancaarvalho 问扩展问题，Rohit 回答说 index 到 200 到 500 文档附近会撑不住，agentmemory 用 BM25、vector、knowledge graph 三路加 RRF。还提到 LongMemEval-S 的 95.2% R@5。
- webmaven 问书籍级文档 ingestion，Rohit 承认还没压测，当前设计更偏 agent observations、coding sessions、tool outputs。对书或 manuscript，瓶颈在 chunking、observation 生成和图谱抽取成本。
- gnusupport 的评论最狠：confidence 没定义，auto-crystallization 没算法，hybrid search 没 latency 和 metric，multi-agent 缺 ACL、versioning、provenance、consistency、backup、evaluation。结论：方向可以借，计划不能照抄。
- ghost 的评论更偏生产经验：schema 做得好，很多问题应该在 ingest 时过滤；numeric confidence 有伪精确风险；event-driven auto-ingest 默认 LLM 可靠，在生产里很危险。主张 supersession 代替 decay、git 做 audit、manual before automated。

生态线索：Memex 把 daily captures 自动编译进 P.A.R.A. library；ctx 把 skills 和 agents 做成知识图谱，给 Claude Code 推荐该加载的能力；ChristopherA 提出 named edges，用 derived_from::[[Source]] 这种显式边来替代完全推断的图。

## 演进方向

1. **evidence contract**：每个 claim 有稳定 id，每条边有来源，每次替代有链接，每次回答能显示证据链
2. **segmentation**：个人偏好、项目事实、团队决策、临时任务、研究材料分 schema，生命周期、共享范围、写入权限完全不同
3. **Agent context operating system**：不只回答问题，还决定 session start 该加载什么、tool use 后该记录什么、任务结束后该沉淀什么、多个 Agent 如何共享项目事实

## 总结

Karpathy 的原版已经把最关键的事说清了：RAG 每次重算，Wiki 会累积。Rohit 的 V2 把这个模式推到了更现实的位置：知识会过期，链接需要类型，搜索需要融合，自动化需要治理，多 Agent 需要边界。

真正落地时，我会从原版开始，再按评估加 V2 的模块。先证据链，再 supersession，再检索融合，再 proposal-first automation。每一步都要能回答一个具体问题：少解释了吗，找得更准了吗，过期答案少了吗，人审更轻了吗。

如果回答不上来，就先别加。知识库最怕的不是功能少，是没人敢信。
