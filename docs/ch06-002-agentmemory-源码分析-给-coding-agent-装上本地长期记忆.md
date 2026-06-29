## Ch06.002 AgentMemory 源码分析：给 Coding Agent 装上本地长期记忆

> 📊 Level ⭐⭐ | 21.3KB | `entities/agentmemory-source-analysis-coding-agent-local-memory.md`

# AgentMemory 源码分析：给 Coding Agent 装上本地长期记忆

> 来源：AI贺贺，2026-05-19
> GitHub：rohitg00/agentmemory
> npm：@agentmemory/agentmemory@0.9.20
> 底层引擎：iii-hq/iii

## 分析背景

本文对 rohitg00/agentmemory 的架构设计与实现链路进行源码级解析，聚焦其如何通过 Agent hooks 实现会话捕获、三路混合检索、以及克制的上下文注入机制。

## 核心价值定位

AgentMemory 解决的不是"存储"问题，而是"下次还记得"问题。传统方案要么依赖静态文件（CLAUDE.md、AGENTS.md、Cursor rules），容易变成"塞满但不精准"的大文本；要么依赖向量库，能检索但需要自己管理写入时机、压缩策略、删除机制和上下文注入。AgentMemory 的思路是把"记忆"看成一个完整生命周期来管理。

### 两个默认关闭的设计哲学

**AGENTMEMORY_AUTO_COMPRESS** 和 **AGENTMEMORY_INJECT_CONTEXT** 默认都是关闭的。这意味着 AgentMemory 默认是一个纯后台记录器，不会悄悄改变模型输入或产生额外 token 消耗。这个设计降低了引入门槛——可以先只运行它、观察它做了什么，确认有效后再开启注入。

## 安装包与运行形态

@agentmemory/agentmemory@0.9.20 是一个 Node ESM CLI 包，不是让你在业务代码里 import 一个库。

```bash
npm install -g @agentmemory/agentmemory
agentmemory              # 启动本地记忆服务
agentmemory connect codex  # 连接 Codex
agentmemory doctor        # 诊断
agentmemory status        # 状态
```

产品形态是"一条 CLI 启动一套本地记忆服务"。安装包包括：dist/（编译后运行时）、plugin/（Claude/Codex 插件、hooks、skills、MCP 配置）、iii-config.yaml（本地运行配置）、docker-compose.yml（Docker fallback）。

## 核心架构：Node Worker 跑在 iii-engine 上

AgentMemory 的底层构建在 **iii-engine** 上，这是一个 Rust 写的本地服务引擎，提供 HTTP triggers、WebSocket streams、KV state、worker supervision、cron/queue/pubsub/observability 等基础能力。

```
agentmemory = Node CLI + memory worker + plugin/hooks/skills
iii         = Rust runtime / 本地服务引擎
```

当你运行 `agentmemory` 时，底层发生的是：CLI 启动 iii Rust 二进制 → iii 读取 iii-config.yaml，打开 REST/stream/worker bus → iii-exec 运行 node dist/index.mjs → Node worker 注册 mem::observe、mem::search、mem::context 等记忆业务函数。

### License 的双重性

**License 注意**：engine/ 使用 Elastic License 2.0（可看源码、本地跑、自托管，但包进商业托管服务有限制）；SDK、CLI、Console、docs 是 Apache License 2.0。这个区别对需要将 AgentMemory 打包进商业服务的企业有实质影响。

### 默认端口

- iii-http=3111
- iii-stream=3112
- viewer=3113

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

Codex 的 hook 有 6 个：SessionStart、UserPromptSubmit、PreToolUse、PostToolUse、PreCompact、Stop。以 PostToolUse hook 为例，链路是：

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

`mem::context` 从 pinned memory slots、project profile、lessons、最近 sessions summary、重要 observations 组装上下文，按 token budget 选择能塞进去的块。但这段上下文**默认不会注入到模型输入**。只有显式设置 `AGENTMEMORY_INJECT_CONTEXT=true` 才会真正注入。建议：先不开注入，让它记录几天；确认 recall 质量后，再在特定场景开启。

## 对外接口：MCP、REST 和 Codex 插件

### MCP 两层

`@agentmemory/mcp`：如果能连上 localhost:3111，代理到完整 AgentMemory server；如果连不上，退化成 InMemoryKV fallback（只有 7 个工具）。

**为什么 MCP 里只有几个工具**：可能只启动了 standalone MCP，没有启动完整 server。完整 server 有 53 个 memory_* 工具。

### REST API（默认端口 3111）

```bash

## 健康检查
curl http://localhost:3111/agentmemory/health

## 写入观察
curl -X POST http://localhost:3111/agentmemory/observe \
  -H 'Content-Type: application/json' \
  -d '{"hookType":"post_tool_use","sessionId":"...","project":"...","data":{"tool_name":"Read","tool_input":{},"tool_output":"..."}}'

## 搜索
curl -X POST http://localhost:3111/agentmemory/smart-search \
  -H 'Content-Type: application/json' \
  -d '{"query":"auth middleware jwt","limit":10}'

## 显式保存记忆
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

`http://localhost:3113`，可以看 Live observation stream、Session explorer、Memory browser、Knowledge graph、Replay timeline、Health dashboard。

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

**适合**：每天在同几个代码仓库里反复工作、经常需要解释项目结构、测试命令、部署流程、历史决策；想让 Codex、Claude Code、Cursor、Gemini CLI 共享同一套本地记忆；需要能审计、删除、导出、回放过去会话；愿意让一个本地后台服务长期运行。

**不适合**：只偶尔用一次 Agent，不需要跨会话记忆；工作内容高度敏感，没有时间做本地隔离和 secret 配置；希望"装上就自动把所有上下文注入模型"，但又不想承担 token 成本；不想引入 iii-engine 这个额外运行时；只想要一个简单 markdown memory 文件。

## 最容易踩的坑

1. **只启动 MCP，没有启动 server**：MCP 里只有少数工具，需要 `agentmemory` 先启动，再 `curl http://localhost:3111/agentmemory/livez` 确认
2. **以为默认会自动注入上下文**：默认只是后台捕获和索引，需要 `AGENTMEMORY_INJECT_CONTEXT=true`
3. **以为没有 API key 就完全不能用**：没有 LLM key 时，provider 是 noop，但 observation 捕获、synthetic compression、BM25 搜索仍能工作
4. **打开自动压缩后 token 消耗突然上升**：AGENTMEMORY_AUTO_COMPRESS=true 会让每条 observation 走 LLM 压缩，活跃编码会话里 tool call 很多，成本会快速累积
5. **README 里工具数量和源码不完全一致**：当前 0.9.20 源码里 tools-registry.ts 定义了 53 个 memory_* 工具，以源码为准

## 核心判断

AgentMemory 的价值不在"它能存向量"，而在它把 Agent 长期记忆里最容易漏掉的工程问题都纳入了范围：什么时候捕获、捕获失败会不会影响主流程、怎么避免重复写、怎么过滤秘密、没有 LLM key 时能不能降级、怎么把 recall 暴露给不同 Agent、怎么看见系统到底记了什么、怎么删除和审计。这让它更像一个 Agent 运行时组件，而不是一个工具函数库。代价是你需要接受一个本地 daemon、一个 iii-engine 运行时、一组 hook 脚本和一套较复杂的配置面。

## 深度分析

### 为什么 AgentMemory 选择"后台记录器"作为默认产品形态

大多数 Agent memory 方案倾向于两种极端：要么做成"你问我答"的工具函数（Mem0、Letta），要么做成"全量注入"的上下文管理器。AgentMemory 的默认关闭设计实际上是在问一个更根本的问题：**Agent 的记忆应该由 Agent 自己管理，还是由外部系统管理？**

默认关闭 `AUTO_COMPRESS` 和 `INJECT_CONTEXT` 的含义是：外部系统只负责记录和检索，决策权留给 Agent 或用户。这避免了"系统觉得自己比 Agent 更懂什么重要"的问题。

### iii-engine 的角色：为什么是 Rust 写的本地服务引擎

iii-engine 提供的不只是 HTTP server——它提供的是**进程 supervision、worker 总线、cron、queue、pubsub、observability**。这些能力组合在一起，使得 AgentMemory 可以：

- **进程保活**：Node worker 崩溃后 iii 自动重启，而不是让记忆服务直接中断
- **Cron 驱动的压缩/聚合**：不需要外部调度器，用 `mem::consolidate` 跑定期的图提取和记忆合并
- **Worker 总线**：多个 Agent 实例可以写入同一个 KV namespace，不需要额外消息队列
- **Observability**：iii 自带 metrics endpoint，AgentMemory 的记忆质量、检索延迟、压缩成本都能被外部监控

这比"一个 Python FastAPI 包装向量库"要完整得多。代价是引入了 Rust runtime 的部署复杂度。

### 三路检索的设计权衡

纯向量检索在代码记忆场景的弱点已经被多次验证：文件路径、函数名、错误码、commit SHA、精确的命令行参数——这些都不适合用 cosine similarity 来衡量相关性。BM25 的精确匹配能力正好补上这个缺口。

但 Graph 检索的价值更微妙：它的目的不是直接召回，而是**扩展 recall 的边界**。当用户搜索"JWT 中间件"时，Graph 可能发现"jose 库"和"auth handler"都与这个概念相关，从而召回纯 BM25/Vector 会遗漏的观察记录。RRF 融合在这里的作用是：不让任何一路检索结果主导，保持三路信号的均衡话语权。

**session diversification** 的设计很有意思：每个 session 最多返回 3 条。这直接对应了一个实际观察——同一个 session 内的观察记录往往是高度冗余的（同一个文件被读了很多次），如果不限流，检索结果会集中在少数几个高活跃 session 上，导致 recall 偏差。

### Hook 失败不阻塞 Agent 的工程含义

hook 实现里用了短 timeout + silent catch，这看起来是一个权宜之计，但实际上是一个深思熟虑的工程决策。在一个长期运行的 Agent 会话里，记忆服务的不可用（网络抖动、iii 重启）不应该导致 Agent 主流程中断。

但这同时意味着：**你不能依赖 hook 来做 critical 的状态同步**。如果需要在记忆写入成功后才能继续主流程，需要自己实现同步等待逻辑，而不是依赖 hook 的 fire-and-forget 语义。

### License 的双重性对企业选型的影响

Engine/ 使用 Elastic License 2.0 而非 Apache 2.0，意味着如果你把 iii-engine 打包进商业托管服务（有客户付费使用的场景），可能需要获得额外授权。但 SDK、CLI、Console 是 Apache 2.0，可以使用。

这对"在 SaaS 产品里嵌入 AgentMemory"的企业有实质影响——需要提前确认自己的商业模式是否触犯 EL2.0 的限制条款。

## 实践启示

### 渐进式接入策略

1. **第一周：纯观察模式**
   - 只运行 `agentmemory` + `agentmemory connect codex`
   - 不开启任何注入或压缩
   - 每天用 viewer（localhost:3113）检查 session 数量、observation 分布是否合理
   - 这个阶段的目的是验证 hook 是否正常捕获、记忆服务的稳定性

2. **第二周：开启检索质量验证**
   - 用 `curl http://localhost:3111/agentmemory/smart-search` 测试 recall 质量
   - 搜索项目里已知的历史决策、文件名、错误信息，看是否能召回
   - 如果 recall 质量不达预期，检查 BM25 index 是否正常、embedding 是否配置

3. **第三周：按场景开启注入**
   - 只在"需要解释项目结构"的特定场景开启 `AGENTMEMORY_INJECT_CONTEXT=true`
   - 用 `AGENTMEMORY_INJECT_PROMPT_PREFIX` 控制注入前缀，让模型知道这些是记忆上下文
   - 监控 token 消耗增长，确认注入上下文确实被使用

4. **第四周及以后：按需开启 LLM 压缩**
   - 如果观察记录的可读性不够（synthetic compression 太粗糙），开启 `AGENTMEMORY_AUTO_COMPRESS`
   - 优先在高频项目里开启，低频项目保持 synthetic compression
   - 设置 `COMPRESSION_BUDGET` 控制每日压缩次数上限

### 多 Agent 共享记忆的部署架构

如果需要让 Codex、Claude Code、Cursor 共享同一套记忆，推荐架构：

```
[Codex] ──┐
[Claude Code] ──┼──▶ localhost:3111 (iii-http) ──▶ AgentMemory Node Worker
[Cursor]  ──┘         │
                       └──▶ iii-KV (mem:sessions, mem:obs:*, mem:memories)
```

关键配置：
- `AGENTMEMORY_SECRET` 要一致（用于多实例写入认证）
- `AGENTMEMORY_URL` 都指向 localhost:3111
- 如果在不同机器上运行，用 `AGENTMEMORY_URL=http://<host>:3111` 替换

### 记忆质量监控的 SQL 查询

iii 的 KV 没有原生 SQL，但可以用 `mem::audit` 系列工具做质量监控：

```bash
## 检查异常高活跃 session（可能有无限循环）
curl "http://localhost:3111/agentmemory/list-sessions?limit=100&status=active"

## 检查被压缩失败的 observation（没有 LLM key 时是正常的）
curl "http://localhost:3111/agentmemory/list-observations?limit=20&compressed=false"

## 检查高频文件访问（可能需要 pin 到 memory slot）
curl "http://localhost:3111/agentmemory/get-memory?type=fact&limit=50"
```

### 在 MCP 工具链里集成记忆检索

MCP 的退化机制（连不上 localhost:3111 时退回 InMemoryKV）是双刃剑：
- 好：不会因为记忆服务挂了导致 MCP 工具完全不可用
- 坏：开发者可能误以为 MCP tools = 完整功能，实际上只有 fallback 的 7 个工具

建议在 MCP 连接代码里加入健康检查：

```javascript
const health = await fetch('http://localhost:3111/agentmemory/health');
if (!health.ok) {
  console.warn('[AgentMemory] MCP fallback active — full tools unavailable');
}
```

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agentmemory-source-analysis-coding-agent-local-memory.md)

## Related

- [AgentMemory 实体页面](ch09-034-agentmemory.html)
- [Claude Code 源码核心机制详解](ch01-162-claude-code-源码核心机制详解.html)

## 相关实体

- MOC

---
