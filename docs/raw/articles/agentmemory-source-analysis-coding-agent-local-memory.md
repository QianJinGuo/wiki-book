---
title: "AgentMemory 解析：给 Coding Agent 装上本地长期记忆"
source_url: https://mp.weixin.qq.com/s/L_wzXQCe3byU93fDAf_Eug
source_platform: wechat
author: "AI贺贺"
publish_date: 2026-05-19
created: 2026-05-19
type: raw
tags: [agentmemory, coding-agent, long-term-memory, bm25, vector-search, graph-search, mcp, rest-api, iii-engine, hook, codex, claude-code]
review_value: ★★★★☆
review_confidence: ★★★★☆
sha256: 1e91920ed06eecd8b4b956f3eb2068c8e9778a65d7f812a7cce03be82b7263cc
---
---
# AgentMemory 解析：给 Coding Agent 装上本地长期记忆
> 来源：AI贺贺，2026-05-19  
> GitHub：rohitg00/agentmemory  
> npm：@agentmemory/agentmemory@0.9.20  
> 底层引擎：iii-hq/iii
## 一句话
AgentMemory 通过 Agent hooks 自动捕获会话和工具调用，把它们写成观察记录，再用 BM25、向量和图关系检索，在下一次会话里按预算找回最相关的上下文。它不是只提供 save 和 search，而是把 hook 捕获、隐私过滤、观察记录、压缩、索引、检索、上下文注入、MCP 工具、REST API、viewer、审计和多 Agent 协作都放进了一个可启动的本地服务里。
## 它解决的不是"存储"，而是"下次还记得"
写代码 Agent 的长期记忆通常有三种做法：
1. **静态文件**（CLAUDE.md、AGENTS.md、Cursor rules）：透明，但容易变成"塞满但不精准"的大文本
2. **向量库**：能检索，但需要自己决定什么时候写入、写什么、怎么压缩、怎么删除、怎么注入回上下文
3. **AgentMemory 运行时方案**：把"记忆"看成一个完整生命周期，而不是一个数据库表
**两个默认关闭很重要**：
- `AGENTMEMORY_AUTO_COMPRESS` 默认关闭：避免每个工具调用都烧 LLM token
- `AGENTMEMORY_INJECT_CONTEXT` 默认关闭：避免每次工具调用都把记忆塞进模型上下文
默认是一个后台记录器，而不是一个会悄悄改变模型输入的东西。
## 安装包与运行形态
@agentmemory/agentmemory@0.9.20 是一个 Node ESM CLI 包，不是让你在业务代码里 import 一个库。
```
npm install -g @agentmemory/agentmemory
agentmemory              # 启动本地记忆服务
agentmemory connect codex  # 连接 Codex
agentmemory doctor        # 诊断
agentmemory status        # 状态
```
产品形态是"一条 CLI 启动一套本地记忆服务"。安装包包括：dist/（编译后运行时）、plugin/（Claude/Codex 插件、hooks、skills、MCP 配置）、iii-config.yaml（本地运行配置）、docker-compose.yml（Docker fallback）。
## 核心架构：Node Worker 跑在 iii-engine 上
AgentMemory 的底层构建在 **iii-engine** 上，提供：
- HTTP triggers
- WebSocket streams
- KV state
- worker supervision
- cron / queue / pubsub / observability
```
agentmemory = Node CLI + memory worker + plugin/hooks/skills
iii         = Rust runtime / 本地服务引擎
```
当你运行 `agentmemory` 时：
1. CLI 启动 iii Rust 二进制
2. iii 读取 iii-config.yaml，打开 REST/stream/worker bus
3. iii-exec 运行 node dist/index.mjs
4. Node worker 注册 mem::observe、mem::search、mem::context 等记忆业务函数
**License 注意**：engine/ 使用 Elastic License 2.0（可看源码、本地跑、自托管，但包进商业托管服务有限制）；SDK、CLI、Console、docs 是 Apache License 2.0。
**默认端口**：iii-http=3111，iii-stream=3112。
## 核心数据模型
```typescript
Session {
  id, project, cwd, startedAt, endedAt,
  status: "active" | "completed" | "abandoned",
  observationCount, firstPrompt, summary?
}
RawObservation {
  id, sessionId, timestamp, hookType,
  toolName?, toolInput?, toolOutput?,
  userPrompt?, raw: unknown
}
CompressedObservation {
  id, sessionId, timestamp,
  type: ObservationType,
  title, facts: string[],
  narrative, concepts: string[],
  files: string[], importance: number
}
Memory {
  id,
  type: "pattern" | "preference" | "architecture" | "bug" | "workflow" | "fact",
  title, content, concepts: string[],
  files: string[], strength: number,
  version: number, isLatest: boolean,
  supersedes?: string[]
}
```
**KV scope**：`mem:sessions`、`mem:obs:${sessionId}`、`mem:memories`、`mem:summaries`、`mem:relations`、`mem:audit`、`mem:actions`、`mem:slots`、`mem:commits`。
## 核心实现链路
### Hook 如何变成可检索记忆（以 Codex plugin 为例）
Codex 的 hook 有 6 个：SessionStart、UserPromptSubmit、PreToolUse、PostToolUse、PreCompact、Stop。
以 PostToolUse hook 为例：
1. 从 stdin 读取宿主传来的 JSON
2. 提取 session_id、tool_name、tool_input、tool_output
3. 截断过长输出，处理 base64 图片
4. POST 到 `http://localhost:3111/agentmemory/observe`
**隐私过滤**：写入前调用 `stripPrivateData`，放在入库前。
**默认不调用 LLM**：AGENTMEMORY_AUTO_COMPRESS 没开时，走 `buildSyntheticCompression`，直接生成可检索的结构化观察，加入 BM25/vector index。
**Hook 失败不阻塞 Agent**：用了短 timeout 和 silent catch。
### 压缩链路：LLM 是增强项，不是启动前提
如果打开 `AGENTMEMORY_AUTO_COMPRESS=true`，每条 observation 触发 mem::compress：
1. 如果有图片，用 vision provider 生成描述
2. 调用 LLM（支持 OpenAI-compatible、MiniMax、Anthropic、Gemini、OpenRouter、agent-sdk fallback）
3. 期望返回 XML，解析 type/title/facts/concepts/files/importance
4. Zod schema 校验，计算 quality score
5. 写回 KV，加入 BM25 和 vector index
**默认是 noop**：没有 provider key 时，LLM 压缩和总结关闭，只保留 synthetic compression 与搜索。
### 检索链路：BM25 + Vector + Graph，再用 RRF 融合
三路信号：
- **BM25**：关键词、路径、概念、文件名、错误信息；支持 stem、synonyms、prefix match、CJK 分词（@node-rs/jieba）
- **Vector**：内存里维护 Map<obsId, Float32Array>，逐个算 cosine similarity，支持序列化到 base64
- **Graph**：实体和关系扩展
**RRF 融合**：
```
combinedScore =
  bm25Weight * (1 / (RRR_K + bm25Rank)) +
  vectorWeight * (1 / (RRF_K + vectorRank)) +
  graphWeight * (1 / (RRF_K + graphRank))
```
再做 session diversification（默认每个 session 最多拿 3 条），可选 rerank（对前 20 条重排）。
**为什么不是纯向量**：代码记忆里很多查询是精确关键词：文件路径、函数名、错误码、命令、commit SHA。纯向量容易把这些细节稀释掉，BM25 正好补上。
### 上下文注入：默认很克制
`mem::context` 从 pinned memory slots、project profile、lessons、最近 sessions summary、重要 observations 组装上下文，按 token budget 选择能塞进去的块。
但这段上下文**默认不会注入到模型输入**。只有显式设置 `AGENTMEMORY_INJECT_CONTEXT=true` 才会真正注入。
建议：先不开注入，让它记录几天；确认 recall 质量后，再在特定场景开启。
## 对外接口：MCP、REST 和 Codex 插件
### MCP 两层
`@agentmemory/mcp`：
- 如果能连上 localhost:3111，代理到完整 AgentMemory server
- 如果连不上，退化成 InMemoryKV fallback（只有 7 个工具）
**为什么 MCP 里只有几个工具**：可能只启动了 standalone MCP，没有启动完整 server。完整 server 有 53 个 memory_* 工具。
### REST API（默认端口 3111）
```bash
# 健康检查
curl http://localhost:3111/agentmemory/health
# 写入观察
curl -X POST http://localhost:3111/agentmemory/observe \
  -H 'Content-Type: application/json' \
  -d '{"hookType":"post_tool_use","sessionId":"...","project":"...","data":{"tool_name":"Read","tool_input":{},"tool_output":"..."}}'
# 搜索
curl -X POST http://localhost:3111/agentmemory/smart-search \
  -H 'Content-Type: application/json' \
  -d '{"query":"auth middleware jwt","limit":10}'
# 显式保存记忆
curl -X POST http://localhost:3111/agentmemory/remember \
  -H 'Content-Type: application/json' \
  -d '{"content":"...","type":"architecture","concepts":["jwt","jose"],"files":["src/middleware/auth.ts"]}'
```
### Codex 里怎么用
**MCP-only（更轻）**：
```bash
codex mcp add agentmemory -- npx -y @agentmemory/mcp
```
**Full plugin（完整功能）**：
```bash
codex plugin marketplace add rohitg00/agentmemory
codex plugin install agentmemory
```
Full plugin 注册的 Skills：/recall、/remember、/session-history、/forget、/recap、/handoff、/commit-context、/commit-history。
## 推荐配置：先保守，再增强
**最小配置**：
```bash
npm install -g @agentmemory/agentmemory
agentmemory init
agentmemory
agentmemory connect codex
agentmemory doctor
```
~/.agentmemory/.env：
```
AGENTMEMORY_SECRET=change-me-if-exposing-beyond-localhost
AGENTMEMORY_URL=http://localhost:3111
AGENTMEMORY_TOOLS=core
```
**逐步增强**：
- 提高检索质量：`EMBEDDING_PROVIDER=local`
- 暴露完整工具：`AGENTMEMORY_TOOLS=all`
- 会话开始注入上下文：`AGENTMEMORY_INJECT_CONTEXT=true`（会增加模型输入 token）
- LLM 生成高质量摘要：`AGENTMEMORY_AUTO_COMPRESS=true` + `ANTHROPIC_API_KEY=...`（会累积 LLM 成本）
**谨慎开启**：`CONSOLIDATION_ENABLED=true`、`GRAPH_EXTRACTION_ENABLED=true`、`AGENTMEMORY_REFLECT=true`、`OBSIDIAN_AUTO_EXPORT=true`。
## Viewer
`http://localhost:3113`，可以看：
- Live observation stream
- Session explorer
- Memory browser
- Knowledge graph
- Replay timeline
- Health dashboard
**排查"记忆没生效"问题**：
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
## 同类竞品对比
| 项目 | 更像什么 | AgentMemory 的相对优势 |
|------|---------|----------------------|
| claude-memory-compiler | Markdown 知识库编译器 | 更实时，有 MCP/REST/viewer，不依赖事后编译成文章 |
| ClawMem | 本地 SQLite/RAG 记忆层 | REST、MCP、viewer、audit、协作工具面更大 |
| Engram | Go binary + SQLite/FTS5 + MCP/TUI | Hybrid search、graph、consolidation、插件面更完整 |
| Mem0 / Letta | 通用 agent memory 平台 | 更贴近 coding agent hooks、本地 CLI 和跨工具开发工作流 |
## 什么时候适合用 AgentMemory
**适合**：
- 每天在同几个代码仓库里反复工作
- 经常需要解释项目结构、测试命令、部署流程、历史决策
- 想让 Codex、Claude Code、Cursor、Gemini CLI 共享同一套本地记忆
- 需要能审计、删除、导出、回放过去会话
- 愿意让一个本地后台服务长期运行
**不适合**：
- 只偶尔用一次 Agent，不需要跨会话记忆
- 工作内容高度敏感，没有时间做本地隔离和 secret 配置
- 希望"装上就自动把所有上下文注入模型"，但又不想承担 token 成本
- 不想引入 iii-engine 这个额外运行时
- 只想要一个简单 markdown memory 文件
## 最容易踩的坑
1. **只启动 MCP，没有启动 server**：MCP 里只有少数工具，需要 `agentmemory` 先启动，再 `curl http://localhost:3111/agentmemory/livez` 确认
2. **以为默认会自动注入上下文**：默认只是后台捕获和索引，需要 `AGENTMEMORY_INJECT_CONTEXT=true`
3. **以为没有 API key 就完全不能用**：没有 LLM key 时，provider 是 noop，但 observation 捕获、synthetic compression、BM25 搜索仍能工作
4. **打开自动压缩后 token 消耗突然上升**：AGENTMEMORY_AUTO_COMPRESS=true 会让每条 observation 走 LLM 压缩，活跃编码会话里 tool call 很多，成本会快速累积
5. **README 里工具数量和源码不完全一致**：当前 0.9.20 源码里 tools-registry.ts 定义了 53 个 memory_* 工具，以源码为准
## 核心判断
AgentMemory 的价值不在"它能存向量"，而在它把 Agent 长期记忆里最容易漏掉的工程问题都纳入了范围：什么时候捕获、捕获失败会不会影响主流程、怎么避免重复写、怎么过滤秘密、没有 LLM key 时能不能降级、怎么把 recall 暴露给不同 Agent、怎么看见系统到底记了什么、怎么删除和审计。
这让它更像一个 Agent 运行时组件，而不是一个工具函数库。代价是你需要接受一个本地 daemon、一个 iii-engine 运行时、一组 hook 脚本和一套较复杂的配置面。