# AgentMemory：Coding Agent 本地记忆系统

> 📊 Level ⭐⭐⭐⭐⭐ | 16.9KB | `entities/agentmemory-coding-agent-local-memory.md`

## 概述
AgentMemory（rohitg00/agentmemory，npm: @agentmemory/agentmemory@0.9.20）不是又一个向量数据库包装器，而是一个**本地 Agent 记忆运行时**：把 hook 捕获、隐私过滤、观察记录、压缩、索引、检索、上下文注入、MCP 工具、REST API、viewer、审计和多 Agent 协作都放进了一个可启动的本地服务里。

## 核心架构
```
agentmemory = Node CLI + memory worker + plugin/hooks/skills
iii         = Rust runtime / 本地服务引擎（iii-hq/iii）
```
iii-engine 提供：HTTP triggers、WebSocket streams、KV state、worker supervision、cron/queue/pubsub/observability。
License：engine/ 使用 Elastic License 2.0（可本地跑、自托管，包进商业托管服务有限制）；SDK/CLI/Console/docs 是 Apache License 2.0。
默认端口：iii-http=3111，iii-stream=3112，viewer=3113。

## 数据模型
| 类型 | 说明 |
|------|------|
| Session | 一次 Agent 会话（id/project/cwd/status/observationCount/summary） |
| RawObservation | hook 捕获的原始事件（hookType/toolName/toolInput/toolOutput/userPrompt） |
| CompressedObservation | 可检索的结构化记录（type/title/facts/narrative/concepts/files/importance） |
| Memory | 显式保存的长期记忆（type: pattern/preference/architecture/bug/workflow/fact） |

## 检索机制
**三路信号 BM25 + Vector + Graph，RRF 融合**：
```
combinedScore = bm25Weight*(1/(RRF_K+bm25Rank)) + vectorWeight*(1/(RRF_K+vectorRank)) + graphWeight*(1/(RRF_K+graphRank))
```
BM25 特点：支持 stem/synonyms/prefix match/CJK 分词（@node-rs/jieba），适合文件路径、函数名、错误码、commit SHA 等精确关键词。
**两个默认关闭（重要）**：

- `AGENTMEMORY_AUTO_COMPRESS`：默认关闭，避免每个工具调用都烧 LLM token
- `AGENTMEMORY_INJECT_CONTEXT`：默认关闭，避免每次工具调用都把记忆塞进模型上下文
默认是**后台记录器**，不会悄悄改变模型输入。

## 对外接口
- **MCP**：standalone shim（7 个 fallback 工具）→ 完整 server（53 个 memory_* 工具）
- **REST API**：默认端口 3111，`/agentmemory/observe`、`/smart-search`、`/remember`、`/context` 等
- **Codex plugin**：SessionStart/UserPromptSubmit/PreToolUse/PostToolUse/PreCompact/Stop hooks；Skills：/recall、/remember、/session-history、/forget、/recap、/handoff、/commit-context、/commit-history

## 竞品对比
| 项目 | 更像什么 | AgentMemory 相对优势 |
|------|---------|---------------------|
| claude-memory-compiler | Markdown 知识库编译器 | 更实时，有 MCP/REST/viewer |
| ClawMem | 本地 SQLite/RAG 记忆层 | REST/MCP/viewer/audit/协作工具面更大 |
| Engram | Go+SQLite/FTS5+MCP/TUI | Hybrid search、graph、consolidation、插件面更完整 |
| Mem0/Letta | 通用 agent memory 平台 | 更贴近 coding agent hooks 和跨工具开发工作流 |

## 适用场景
**适合**：多 coding agent 共享本地记忆、需要审计删除导出回放、愿意运行本地 daemon 的场景。
**不适合**：轻量偶发使用、高度敏感且无法本地隔离、不想引入 iii-engine 运行时、只想要简单 markdown memory。

## 深度分析
**架构本质： hook 捕获链 + 三路检索融合 + 克制的上下文注入**
AgentMemory 的核心设计选择体现了对 coding agent 实际工作流的深刻理解。它不是一个"存向量再搜"的简单封装，而是把记忆当成一个完整生命周期来管理——从 hook 捕获、隐私过滤、观察记录、结构化压缩、索引、检索、上下文组装到多 Agent 协作接口。
**两个"默认关闭"的设计哲学值得特别注意**：AGENTMEMORY_AUTO_COMPRESS 和 AGENTMEMORY_INJECT_CONTEXT 默认都是关闭的。这意味着 AgentMemory 默认是一个纯后台记录器，不会悄悄改变模型输入或产生额外 token 消耗。这个设计降低了引入门槛——可以先只运行它、观察它做了什么，确认有效后再开启注入。
**BM25 + Vector + Graph 三路 RRF 融合的动机**：纯向量检索在代码记忆场景有天然缺陷——文件路径、函数名、错误码、commit SHA 都是精确关键词，容易被向量稀释。BM25 正好补上这块。Graph 关系则提供了跨观察的实体连接能力，例如"这个 bug 之前出现在哪个 session 里"。
**RRF（Reciprocal Rank Fusion）融合公式**：
```
combinedScore = bm25Weight*(1/(RRF_K+bm25Rank)) + vectorWeight*(1/(RRF_K+vectorRank)) + graphWeight*(1/(RRF_K+graphRank))
```
每个信号独立排名，取倒数再加权融合，避免了单一信号支配结果。
**License 的双重性**：engine/ 使用 Elastic License 2.0（可本地跑、自托管，但商业托管服务有附加限制）；SDK/CLI/Console/docs 是 Apache License 2.0。这个区别对需要将 AgentMemory 打包进商业服务的企业有实质影响。
**iii-engine 作为底层运行时**：选择 Rust 写的 iii-engine 而非纯 Node.js，带来了更好的并发性能和更低的内存 footprint，但同时也引入了额外的运行时依赖——需要在使用前接受并管理这个本地 daemon。

## 实践启示
**上手路径建议"先记录再检索最后注入"**：
1. 先让 agentmemory 跑起来，连上 Codex，观察 session 和 observation 是否正常写入
2. 用 viewer（localhost:3113）确认数据进来了
3. 尝试 smart-search，确认 recall 质量符合预期
4. 最后才考虑开启 AGENTMEMORY_INJECT_CONTEXT 和 AGENTMEMORY_AUTO_COMPRESS
**踩坑排查的 viewer 链路**：
```
[记忆没生效] → {viewer 有 session 吗}
  没有 → hook/plugin 没生效
  有 → {observationCount 增长吗}
    没有 → observe API 或 hook payload 问题
    有 → {smart-search 能搜到吗}
      不能 → index/embedding/query 问题
      能 → {上下文注入了吗}
        没有 → AGENTMEMORY_INJECT_CONTEXT 默认关闭
        有 → 检查 token budget 和排序
```
**多 Agent 共享记忆的坑**：要让 Codex、Claude Code、Cursor、Gemini CLI 共享同一套记忆，需要各自配置连接同一个 agentmemory server（通过 MCP 或 REST），但要注意 CONFORM_TO environment 变量和 session id 的跨 agent 一致性问题。
**没有 LLM key 时的降级能力**：关闭 AUTO_COMPRESS 后，系统会用 synthetic compression（基于规则的压缩）替代 LLM 压缩，BM25 和向量搜索仍然可用。这对不想产生额外 API 成本的用户是实质性的保底能力。
**企业评估清单**：是否接受本地 daemon 运行、是否能接受 Elastic License 2.0 的附加限制、是否有足够预算应对 AUTO_COMPRESS 开启后的 token 消耗、是否需要 viewer 提供的可见性。

## 第 2 来源 — MemoraX Code（长期记忆系统，2026-08-18）
- v×c=48（v=6 c=8 s=3，DeepSeek 评分），6 互补角度 ≥3，MERGE 作 2nd source
- MemoraX Code 是另一个 Coding Agent 长期记忆产品（code.memorax.net / github.com/memorax-ai/memorax-code），与 AgentMemory 同属「Coding Agent 长期记忆」簇但设计取向不同：AgentMemory = 本地 Agent 记忆运行时（hook 捕获 + 三路检索 + MCP 工具），MemoraX = 本地代码仓记忆 + 云端长期记忆的双层架构 + 数据驱动的 Memory Model。 → [原文存档](https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2651050939&idx=1&sn=048d1d6f8e05e0ae4bd944928e5d2171)

互补角度（相对 AgentMemory 的新增量）：
1. **本地代码仓记忆 + 云端长期记忆双层**：本地层让 Agent 快速理解代码仓结构/关键入口/历史演进；云端层承载跨任务、跨对话、跨 Agent 的项目经验与开发者习惯。AgentMemory 只覆盖本地运行时。
2. **跨 Agent 记忆共享**：Codex 中形成的 Memory，切换到 Claude Code 后仍可继续使用——「Agent 换了，项目记忆还在」，不绑定单一 Agent。
3. **Compaction-aware recall**：agentmemory/AutoMem 的压缩只解决「如何不丢上下文」，不保证「哪些经验该被保留」。MemoraX 识别压缩历史里被磨掉的关键经验（如「改这块必须兼容旧版数据库」这类只出现一次却起决定作用的约束），在后续任务重新召回。
4. **Procedure Memory 自动化构建**：从历史 Coding 轨迹自动提炼可复用的解决过程为结构化工程经验，最终以 Skill 形式沉淀——从「记住发生过什么」走向「学会下一次怎么做」；123 个任务片段 → 15 条工程经验 → 4 类 Procedure Memory。
5. **Memory Model 数据驱动训练**：构造记忆训练任务 + 长程开发轨迹 + 评估与奖励机制，让 Memory 从规则驱动走向数据/奖励驱动——判断「这条信息有没有真的在后续任务中帮助 Agent 做出更好决策」。对比 AgentMemory 的 synthetic compression（规则降级）是实质的能力升级方向。
6. **AML Coding Track 62 分第一 + 3 小时实测提升**：AML Coding Track 第一（62 分，比 Claude Mem 解题率高 10%）；使用 Procedure Memory 后 3 小时复杂任务综合得分 11.71 → 70.30、关键检查项 2/13 → 10/13、API 成本 31.48→24.37 美元（−22.6%）；85.5% 记忆触发与用户判断一致、81.2% 内容获正向反馈。
- **边界声明**：MemoraX 为产品方自报数据，无独立第三方 benchmark 复现；量化数字（62 分 / 70.30 / −22.6%）为 vendor 实验，非中立评测。

## 来源
- GitHub：rohitg00/agentmemory
- npm：@agentmemory/agentmemory@0.9.20
- 底层引擎：iii-hq/iii
- 分析文章：AI贺贺（2026-05-19）

## Related
- [从Vibe Coding到Agentic Engineering：重构后台开发全流程 — 腾讯技术工程](../ch04/334-tencent-vibe-coding-to-agentic-engineering-backend.html)

- [Claude Code 源码核心机制详解](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-core-internals.md)

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/tool-use-mcp-patterns.md)

---

