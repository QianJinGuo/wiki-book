---
title: "SAG 知识引擎：用 SQL 做 RAG — VibeCoder 源码级解读 (MCP 集成 + 检索算法 + 消融实验)"
source_url: https://mp.weixin.qq.com/s/gB9MpJaHA1nK7pNUBJ0luw
publish_date: 2026-06-17
publisher: Vibe编码
author: VibeCoder
ingested: 2026-06-17
sha256: 391eaf84ed2301db4fd98ad795196b85a767fd76c77f483ddb5b7541067b7d2f
tags: [wechat, article, sag, sql-rag, sql-retrieval-augmented-generation, vibecoder, vibe-编码, mcp, mcp-server, agent-knowledge, source-code-review, two-path-recall, fast-mode, standard-mode, ablation-study, multi-hop-qa, project-scope-isolation, trace-debug, hyperedge, hypergraph]
type: raw
---

# SAG 知识引擎：用 SQL 做 RAG

## 开篇

Agent 系统的瓶颈正在从模型能力转向数据底座。模型会调用工具，会规划步骤，可它需要知识时，常常只能从向量库里捞几个相似 chunk。问题一旦跨文档、跨实体，错误会继续放大。

SAG 的思路直接：把文档整理成事项 + 实体索引，查询时用 SQL 把相关事项连接起来。它不维护长期全局图，保存的是 event、entity，以及 event_entities 这张多对多关系表。

## 它想解决什么

普通 RAG 是文档切块、生成 embedding、查询时找相似 chunk。问题在于，语义相似不等于结构相关。一个问题问"收购了 B 公司的企业，其 CTO 后来加入了哪个项目"，答案可能要从收购事件跳到 CTO，再跳到项目。只靠相似度，中间桥很容易漏。

GraphRAG 会补结构，维护也更重。SAG 选择轻一点的做法：每个 chunk 抽一个完整 event，再抽一组 entities。event 保留语义，entity 负责连接。

## 知识管理

SAG 先创建项目，再上传 Markdown 或 TXT。项目对应 `sources` 表，上传入口在 `src/services/webui-service.ts:131`，只收 `.md/.txt`，限制 5MB。

入库流程在 `src/services/ingestion-service.ts:55`。它生成 traceId、taskId、documentId，然后进入切片、向量化、抽取、写库。

切片由 `chunkMarkdown` 完成，位置在 `src/ingestion/chunking/markdown.ts:34`。默认按 Markdown 标题切，也可以按 token window 切。

下一步是抽取。`src/ingestion/extract/extractor.ts:4` 包了一层清洗逻辑，最终会 `.slice(0, 1)`，只保留一个融合事项。LLM prompt 也要求把输入里的有效信息合成一个 top-level event。

写库阶段在一个事务里完成。`source_chunks` 保存原文和 embedding，`events` 保存事项与 title/content embedding，`entities` 保存归一化名称和 embedding，`event_entities` 保存事项和实体关系。

## Agent 怎么消费知识

SAG 给 Agent 的入口主要是 MCP。`src/mcp/server.ts:17` 开始定义四个工具：

- `sag_ingest_document` — 写入知识
- `sag_search` — 执行检索并返回 trace
- `sag_explain_search` — 调试链路
- `sag_get_event` — 回查事项详情

项目边界处理得很务实。MCP server 启动时通过 `SAG_MCP_SOURCE_ID` 绑定当前项目，`src/mcp/server.ts:110` 会校验 UUID。到了 WebUI 内置 Agent 那边，`src/services/mcp-agent-service.ts:434` 还会删除工具参数里的 sourceId、sourceIds、projectId、projectIds。

这意味着 Agent 只表达我要查什么，项目范围由服务端控制。我喜欢这个收口。

WebUI 的 MCP Agent 会把会话、消息、工具调用记录落到 `mcp_sessions`、`mcp_messages`、`mcp_tool_calls`。`McpAgentService.runUserMessage` 启动 stdio MCP client，再让 LLM 做工具规划。规划 prompt 要求改写 query，遇到比较、因果、架构、流程、证据类问题，优先调用 `sag_search`。

## 检索细节

`src/services/search-service.ts:92` 是 SAG 多路检索的主流程。它先把 query 变成向量，然后根据模式选择实体召回方式。

`fast` 模式不调用 LLM 抽 query entities。它直接在实体库里做全文检索、trigram 相似度、实体名包含关系和精确匹配，SQL 在 `src/db/repositories.ts:465`。`standard` 模式会让 LLM 先抽查询实体，再做实体名称和向量召回。

实体命中后，系统通过 `getEventIdsByEntityIds` 找到相关 event。同时，query embedding 会直接对 event title embedding 做召回。两路合并成 seed events。

扩展阶段是 SAG 和普通向量检索的分界线。系统从 seed events 收集新的 entityIds，再通过这些 entityIds 继续找新 events。候选用 event content embedding 粗排，再交给 reranker 或 LLM 选最终 events。最终回取 event 对应的 `source_chunks`，回答仍然能引用原始文本。

SAG 的 trace 很适合调试，会记录 `queryEntities`、`recalledEntities`、`expandedEventIds`、`rerankedEventIds` 和 `timings`。检索失败时，可以定位到实体抽取、SQL 连接或 rerank 阶段。

## 取舍

论文里最有用的结论来自消融。关闭查询时扩展，MuSiQue Recall@5 从 80.0% 掉到 69.4%。把 event hyperedge 拆成三元组，Recall@5 从 80.0% 掉到 77.1%。候选 event 从 100 扩到 200、500 后，收益很快变小。

这些结果对落地很有帮助。共享实体扩展确实补到了多跳证据，完整事项也比碎三元组更稳。更多候选会直接变成 LLM token 成本和延迟。

SAG 也有短板。实体合并很轻，主要靠字符串归一和 SQL 唯一键。别名、缩写、同义词可能分裂成多个索引点。低频桥接实体也可能在扩展早期被剪枝。

## 总结

SAG 给我的感觉是，它没有把知识库做成黑盒检索器。它把事项和实体关系拆开存，再让 SQL 在查询时恢复局部关系。

这对 Agent 很有价值。Agent 不只需要相似文本，还需要可追踪的证据链、可限定的项目边界、可调试的失败路径。资料持续增长、问题经常跨文档、回答需要引用证据时，SAG 这种轻图谱路线值得试。

## 相关链接

- SAG 论文 / Benchmark / Demo — 见 [[raw/articles/sag-sql-retrieval-augmented-generation-zleap-ai-2026-06-16|第2原文存档]] 中的官方来源
- MCP 协议 — 见 [[entities/mcp-model-context-protocol-anthropic]] / `mcp-*` 系列实体