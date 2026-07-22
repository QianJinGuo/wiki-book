---
sha256: 6b8c6c52117fc78fe85ffdc369da99c9bd85bce433bf6a1ef6281bb74843d56a
source: "https://mp.weixin.qq.com/s/gNW3rrCUl9wRxs1BJ_vpnA"
title: "Headroom 是怎么省上下文的"
author: VibeCoder
publisher: Vibe编码
date: 2026-06-07
type: article
ingested: 2026-06-07
review_value: 8
review_confidence: 8
review_recommendation: strong
review_stars: 4
---

# Headroom 是怎么省上下文的

> 作者：VibeCoder（Vibe编码） · 发布：2026-06-07

AI Agent 越来越像一个会不停调用工具的系统。真正把上下文打爆的，经常是后面一串 tool output：测试日志、grep 结果、API 返回、数据库 rows、长 diff。**Headroom** 这个仓库切的就是这块：在工具输出进入 LLM 之前，先做**压缩和缓存稳定化**。

## 它是什么

Headroom 可以作为**库、proxy、wrapper、MCP server**使用。README 写得很大，覆盖 Claude Code、Codex、Cursor、Aider、Copilot、OpenAI/Anthropic/Bedrock 等等。但从当前源码看，最值得研究的是 **Rust 这条路径**。

主要模块有两个：

- **`crates/headroom-proxy`**：负责站在请求入口，判断是否需要压缩，按 provider endpoint 分派，然后把请求发给上游
- **`crates/headroom-core`**：负责真正的 live-zone 压缩、内容类型检测、JSON/log/search/diff 压缩器、CCR store 和 tokenizer gate

**设计方向**：先保证哪些字节不能碰，再谈哪些内容可以压。**目标不是写一个通用 summarizer**。

## 技术原理

### Live Zone：先问"哪里改了不会破坏 provider prompt cache"

**传统直觉**会说，哪里 token 多就压哪里。Headroom 当前 Rust 设计先问另一个问题：**哪里改了不会破坏 provider prompt cache？**

对 **Anthropic `/v1/messages`** 来说，它会根据 `cache_control` 计算 **frozen floor**：

- **floor 之前的消息**：属于缓存前缀，**不能动**
- **最新 assistant continuation**：不动，因为是下一次响应继续的基础
- **真正能动的**：通常是**最新 user message 里的 tool result 或长文本**

**这解释了它为什么不像很多上下文压缩方案那样直接删历史消息**。历史消息一旦在上游出现过，后续再改就可能导致 prefix cache miss。**你以为省了 token，可能实际把缓存收益打没了**。

### 字节级 patch（不是 JSON 重序列化）

更工程化的细节：它**不是把请求 JSON parse 成 `Value` 后整体重序列化**。

`live_zone.rs` 用 `serde_json::value::RawValue` 找到 block 内容在原始请求里的 **byte range**，然后**只替换这一段**。

未修改的 bytes 原样复制，包括空格、key 顺序、数字格式、Unicode escape。**JSON 语义等价不代表 provider cache key 等价**——这个坑很多系统会踩。

## 4 类内容压缩器

当前 Rust live-zone 里，真正会压的主要是四类：

### 1. JSON array → SmartCrusher

适合 API response、DB rows、搜索索引这类**重复 schema 的结构化输出**。

- 表格化
- 采样
- 去重
- 保留异常、首尾和重要项

### 2. 日志 → LogCompressor

- 保留 error、fail、warning、stack trace、summary 和少量上下文
- 裁掉重复 INFO

### 3. 搜索结果 → SearchCompressor

- 典型输入是 `file:line:content`
- 按文件聚合
- 每个文件限制命中数
- 保留首尾和高分 match

### 4. diff → DiffCompressor

- 限制文件数、hunk 数、context 行数
- **offload** 还会把 lockfile 和纯空白 hunk 当成低价值噪声处理

### CodeCompressor 是 no-op（默认）

容易误解的是代码压缩。README 里会提 **CodeCompressor**，但当前 Rust live-zone 里 `ContentType::SourceCode` **是 no-op**，普通文本和 HTML 也是 no-op。**这个默认其实合理**：用户让 Agent 读代码，通常就是要模型看代码本身，压函数体很容易误伤。

## CCR：让压缩可恢复

Headroom 还有一个核心机制叫 **CCR（Compress-Cache-Retrieve）**：

- 压缩器把短视图放进 prompt
- 同时把原文存到本地 store
- 压缩文本后追加一个 `<<ccr:HASH>>` marker
- 模型需要完整数据时，可以通过 retrieval 工具按 hash 取回

**这要清楚：不是魔法意义上的无损压缩**。LLM 当下看到的是压缩视图，系统端保留了原文，模型有机会取回。

**风险**：
- 如果模型没有意识到需要取回
- 或 CCR store 丢了
- 细节就不会出现在模型当前视野里

**默认配置**：
- **CCR TTL = 5 分钟**
- 后端：in-memory / SQLite / Redis
- 单进程实验用 in-memory，生产多 worker 最好用共享后端

## 缓存稳定化：也在省钱

**Cache stabilization** 不一定减少当前请求 token，但能**减少后续重复计算**。

### Tools 数组排序

很多 SDK 的工具收集顺序可能受 map/set 迭代影响，**同一组工具每次顺序不同**，provider cache 就可能 miss。Headroom 会**按工具名稳定排序**。

### JSON Schema key 递归排序

Schema 语义没变，但 **bytes 稳定了**。

### Provider-specific marker 注入

- **Anthropic PAYG 请求**：自动加 `cache_control`
- **OpenAI PAYG 请求**：注入 `prompt_cache_key`
- OpenAI 这边 key 的来源是 `model + system + tools`，**刻意排除 user/assistant message**（把用户轮次也算进去会让 key 每轮都变）

**这部分改的是请求字节**，所以源码做了 **auth mode gate**：
- OAuth 和 subscription 模式不会乱加这些字段
- 已有客户自己设置的 marker/key 也优先保留

## 副作用

Headroom 的副作用不是没有，只是大部分都被显式工程化了。

### 1. 压缩视图可能漏细节

JSON rows、diff hunk、grep matches、log lines 都可能被裁掉。CCR 能取回，但模型不一定会取。**做审计、安全取证、逐行核对时，这个风险不能忽略**。

### 2. CCR 有成本

- marker 本身占 token
- retrieval 是额外 tool call
- 也有延迟
- 小输入如果也硬压，可能不划算

所以 `pipeline.toml` 里的**默认阈值很保守**：
- log/diff < 50 行不 offload
- search < 10 个 match 不 offload

### 3. proxy 需要缓冲请求体

- 命中 compression gate 时，纯流式转发会变成先 buffer
- 超出 `compression_max_body_bytes` 会 413
- 这是代理架构绕不开的成本

### 4. 代码场景收益有限

当前 Rust live-zone 对源码基本不压，所以**如果 Agent 工作流主要是读文件、解释文件、改源码**，收益主要来自**搜索结果、测试日志和 diff**，不是源码内容本身。

### 5. 缓存稳定化会主动改请求体

排序 tools、排序 schema、加 cache marker/cache key，本质都是 **byte mutation**。虽然源码加了 PAYG 和 customer-value-wins gate，部署时还是要确认**能接受中间层做这些修改**。

## 怎么用这类工具更稳

### 适合先接的场景

测试日志很多、grep 很多、大 JSON 很多、长 diff 很多的 Agent 工作流。比如让 Agent 修 bug、跑测试、搜代码、分析 API 返回——这些都容易让 tool output 把上下文塞满。

### 不适合一上来全局开启的场景

- 短问答
- 轻量聊天
- 主要读源码的任务
- 强审计任务
- 没有可靠 CCR store 的多 worker 部署

### 更稳的方式

**先小范围开启 live-zone**，监控几个指标：
- tokens freed
- RejectedNotSmaller
- CCR retrieve miss
- cache hit
- p95 latency

压缩系统最怕**表面省 token，实际把 cache 和语义搞坏了**。Headroom 源码里最值得学的地方，恰好就是它**没有只看 token savings**。

## 总结

Headroom 的价值不止 README 里的 **60-95% fewer tokens**，更在源码里那套**边界感**。

**它把上下文节省拆成两件事**：
1. **tool output 变瘦**：减少当前请求输入
2. **缓存前缀变稳**：减少后续重复付费

它也**承认压缩有代价**，所以用 **live zone、RawValue、token gate、CCR、auth mode policy** 把风险框起来。

**作者判断**：它很适合成为 **Agent 工具链里的上下文代理层**，但不应该被理解成**通用压缩按钮**。**真正应该压的是日志、搜索结果、大 JSON、长 diff**。**源码和普通文本，很多时候保持原样更正确**。

## 参考资料

- Headroom 仓库（Rust crates：`headroom-proxy` + `headroom-core`）
- Anthropic `cache_control` / OpenAI `prompt_cache_key` 文档
