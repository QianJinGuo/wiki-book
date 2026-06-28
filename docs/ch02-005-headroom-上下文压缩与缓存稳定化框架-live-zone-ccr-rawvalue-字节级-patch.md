## Ch02.005 Headroom：上下文压缩与缓存稳定化框架（live zone + CCR + RawValue 字节级 patch）

> 📊 Level ⭐⭐ | 16.0KB | `entities/headroom-context-compression-cache-stabilization.md`

# Headroom：上下文压缩与缓存稳定化框架

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/headroom-context-compression-agent-vibecoder.md)

Headroom 切的是 Agent 工具链里**最痛的点**：tool output 把上下文打爆。测试日志、grep 结果、API 返回、DB rows、长 diff——这些是真正让 context window 告急的内容。**Headroom 在工具输出进入 LLM 之前，先做压缩和缓存稳定化**。

## 形态：库 / Proxy / Wrapper / MCP Server

- 覆盖 Claude Code、Codex、Cursor、Aider、Copilot、OpenAI/Anthropic/Bedrock 等多 provider
- **Rust 主路径**最值得研究（其他 wrapper 是补全）
- 主要模块：
  - **`crates/headroom-proxy`**：请求入口，按 provider endpoint 分派给上游
  - **`crates/headroom-core`**：live-zone 压缩、内容类型检测、CCR store、tokenizer gate

**设计原则**：**先保证哪些字节不能碰，再谈哪些内容可以压**——目标**不是写一个通用 summarizer**。

## 核心技术 1：Live Zone

**传统直觉** = 哪里 token 多压哪里。
**Headroom 思路** = **哪里改了不会破坏 provider prompt cache？**

对 **Anthropic `/v1/messages`** 来说，根据 `cache_control` 计算 **frozen floor**：

| 区域 | 能否压缩 |
|------|---------|
| floor 之前的消息（缓存前缀） | ❌ 不能动 |
| 最新 assistant continuation | ❌ 不能动（下一次响应继续基础） |
| 最新 user message 里的 tool result / 长文本 | ✅ 真正能动的 |

**这解释了它为什么不像很多上下文压缩方案那样直接删历史消息**——历史消息一旦在上游出现过，后续再改就可能导致 prefix cache miss。**你以为省了 token，可能实际把缓存收益打没了**。

## 核心技术 2：RawValue 字节级 patch

**不是**把请求 JSON parse 成 `Value` 后整体重序列化。

`live_zone.rs` 用 `serde_json::value::RawValue` 找到 block 内容在原始请求里的 **byte range**，然后**只替换这一段**。

未修改的 bytes 原样复制：
- 空格
- key 顺序
- 数字格式
- Unicode escape

**关键洞察**：**JSON 语义等价不代表 provider cache key 等价**——这个坑很多系统会踩。

## 4 类内容压缩器

| 压缩器 | 目标 | 关键策略 |
|--------|------|---------|
| **SmartCrusher** | JSON array（API response / DB rows / 搜索索引） | 表格化、采样、去重；保留异常、首尾、重要项 |
| **LogCompressor** | 日志 | 保留 error/fail/warning/stack trace/summary；裁掉重复 INFO |
| **SearchCompressor** | 搜索结果（`file:line:content`） | 按文件聚合；每文件限制命中数；保留首尾 + 高分 match |
| **DiffCompressor** | diff | 限制文件数 / hunk 数 / context 行数；lockfile + 纯空白 hunk 视为低价值噪声 |
| **CodeCompressor** | 源码 | **no-op**（默认）——压函数体容易误伤 |

**CodeCompressor 默认 no-op 的设计哲学**：用户让 Agent 读代码，通常就是要模型看代码本身。

## 核心技术 3：CCR（Compress-Cache-Retrieve）

让压缩**可恢复**的机制：

1. 压缩器把短视图放进 prompt
2. 原文存到本地 store
3. 压缩文本后追加 `<<ccr:HASH>>` marker
4. 模型需要完整数据时，**通过 retrieval 工具按 hash 取回**

**不是魔法意义上的无损压缩**——LLM 当下看到的是压缩视图，系统端保留原文，模型有机会取回。

**风险**：
- 模型没有意识到需要取回
- CCR store 丢失
- 细节就不会出现在模型当前视野

**默认配置**：
- **CCR TTL = 5 分钟**
- 后端：in-memory / SQLite / Redis
- 单进程实验用 in-memory，生产多 worker 用共享后端

## 核心技术 4：缓存稳定化

**不一定减少当前请求 token，但能减少后续重复计算**。

### Tools 数组排序
很多 SDK 工具收集顺序受 map/set 迭代影响，**同一组工具每次顺序不同** → provider cache miss。Headroom **按工具名稳定排序**。

### JSON Schema key 递归排序
Schema 语义没变，但 **bytes 稳定了**。

### Provider-specific marker 注入

| Provider | 注入字段 | key 来源 |
|----------|---------|---------|
| **Anthropic PAYG** | `cache_control` | 自动加 |
| **OpenAI PAYG** | `prompt_cache_key` | `model + system + tools`（**刻意排除 user/assistant message**——把用户轮次算进去会让 key 每轮都变） |

**Auth mode gate**（重要安全设计）：
- OAuth / subscription 模式**不会乱加**这些字段
- 已有客户自己设置的 marker / key **优先保留**

## 副作用与风险（被显式工程化）

| 风险 | 缓解机制 |
|------|---------|
| 压缩视图漏细节（rows / hunk / matches / log lines 被裁掉） | CCR 可取回 + 模型可主动调 retrieval |
| CCR marker 占 token + retrieval 额外 tool call + 延迟 | 保守默认阈值（log/diff < 50 行不 offload；search < 10 match 不 offload） |
| Proxy 缓冲请求体（流式 → buffer），超出 `compression_max_body_bytes` 会 413 | 这是代理架构绕不开的成本 |
| 读源码场景收益有限 | CodeCompressor 默认 no-op，明确**承认此场景的压缩边界** |
| 缓存稳定化主动改请求体（byte mutation） | PAYG gate + customer-value-wins gate |

**做审计、安全取证、逐行核对时，第一个风险不能忽略**。

## 部署指南

### 适合先接的场景
- 测试日志多
- grep 多
- 大 JSON 多
- 长 diff 多
- 修 bug、跑测试、搜代码、分析 API 返回

### 不适合全局开启的场景
- 短问答
- 轻量聊天
- 主要读源码
- 强审计任务
- 没有可靠 CCR store 的多 worker 部署

### 监控指标
- tokens freed
- RejectedNotSmaller
- CCR retrieve miss
- cache hit
- p95 latency

**压缩系统最怕：表面省 token，实际把 cache 和语义搞坏了**。Headroom 源码里最值得学的地方，恰好就是**没有只看 token savings**。

## 价值定位

> "Headroom 的价值不止 README 里的 60-95% fewer tokens，更在源码里那套边界感。"

**把上下文节省拆成两件事**：
1. **tool output 变瘦** → 减少当前请求输入
2. **缓存前缀变稳** → 减少后续重复付费

**真正应该压的是**：日志、搜索结果、大 JSON、长 diff。
**源码和普通文本，很多时候保持原样更正确**。

## 与现有实体差异化

- Agent Harness Context Management Working Set — Agent 上下文管理的 working set 模式（**主线程 vs 后台 subagent**）。Headroom 是 **proxy/中间层方案**，在工具输出层做字节级压缩。两者**问题域重叠但切入点完全不同**。
- [Agent Context Management Architecture Patterns](ch04-460-the-ui-is-dead-long-live-the-agent-servicenow-goes-headles.html) — 上下文管理的架构模式总览（截断 / 总结 / 滑动窗口 / RAG）。Headroom 走**更激进的字节级 patch + cache-aware 路径**，是这些模式之外的"代理层"独立分支。
- [Openclacky Harness Prompt Cache](ch05-039-openclacky-prompt-cache-命中率-90-的-harness-工程实践.html) — OpenClacky 提示词缓存策略。Headroom 与之同源思想（**关注 prompt cache key 稳定性**）但实现不同：OpenClacky 是 SDK 层策略，Headroom 是 proxy 层工具。
- Ai Context Layer Kgc 2026 — AI 上下文层（知识图谱增强）。Headroom 走**字节级压缩**而非**结构化知识层**，定位互补。
- Claude Code Prompt Context Harness / Claude Code Session Management 1M Context — Claude Code 的上下文管理实现。Headroom 是**通用 provider 方案**（覆盖 Claude Code / Codex / Cursor / Aider / Copilot），Claude Code 上下文管理是**单 provider 内部**方案。
- [Claude Code Vs Codex Context Architecture 02](ch01-286-claude-code-vs-codex-上下文架构-五层压缩管道-vs-容器文件系统.html) — Claude Code vs Codex 上下文架构对比。Headroom **同时支持两者**（作为 proxy 层），可以视为这两者的**第三方统一优化层**。
- [Agent Reliability Context Drift Tool Hallucination](ch04-158-agent-harness-governance-identity.html) — 上下文漂移导致工具幻觉。Headroom 的 cache stabilization 间接缓解上下文漂移（cache 命中率高 → 历史更稳定）。
- [Agentic Ai Infrastructure Practice Series Nine Context Engineering](ch04-403-agentic-ai-infrastructure-practice-series-9-context-enginee.html) — Agent 上下文工程实践系列。Headroom 是**具体实现**之一，可作为该系列的"proxy 层"案例补充。
- [Cl Bench Life Tencent Context Learning](ch01-902-liteframe-efficient-vision-encoders-unlock-frame-scaling-in.html) — 腾讯 CL-Bench 长上下文学习基准。Headroom 是**生产工具**（不是基准），与之形成"评估 vs 优化"对照。
- [Alibaba Eventhouse Enterprise Agent Context](ch11-040-eventhouse-agent.html) — 阿里云 EventHouse 企业级 Agent 上下文。Headroom 走**proxy 通用方案**，EventHouse 走**企业级云服务方案**。

## 相关主题

- 上下文工程 — [Agentic Ai Infrastructure Practice Series Nine Context Engineering](ch04-403-agentic-ai-infrastructure-practice-series-9-context-enginee.html)
- 提示词缓存策略 — [Openclacky Harness Prompt Cache](ch05-039-openclacky-prompt-cache-命中率-90-的-harness-工程实践.html)
- Agent 工具链 — [Agent Harness Architecture Design Production Guide](ch04-021-ai-agent.html)
- VibeCoder / Vibe编码 公众号其他文章 — [Cli Mcp Skill Architecture Decision Vibecoder](ch07-030-cli-mcp-和-cli-skill-应该如何选.html) / [Impeccable Vibe Design Philosophy Anomaly](/ch20-ai-philosophy/) / [Impeccable Vibe Design Philosophy Anomaly](/ch20-ai-philosophy/)
- MCP server 模式 — [Cli Mcp Skill Architecture Decision Vibecoder](ch07-030-cli-mcp-和-cli-skill-应该如何选.html)

## 深度分析

- **"live zone" 概念重新定义了"哪里压"**：传统上下文压缩以"token 数量"为目标函数，**但 Anthropic / OpenAI 都有 prompt cache**，改 cache 范围内的内容会让 cache miss，**实际开销可能更大**。Headroom 提出的"先问哪里改了不破坏 cache"是**对 prompt cache 经济的工程化承认**——把 token optimization 升级为**token + cache cost 的联合优化**。这对所有走 provider prompt cache 的 Agent 都有普适价值。

- **RawValue 字节级 patch 是"JSON 语义 vs 字节"分离的工程胜利**：很多 LLM gateway 工具会 `parse → modify → serialize`，看起来无害，但**数字格式、Unicode escape、key 顺序**这些字节差异都会让 provider hash 出新 cache key。**Headroom 用 `serde_json::value::RawValue` 直接定位 byte range 做替换**，是一个看似简单但需要深谙 serde 设计才能想到的实现。这个模式可推广到所有"中间层修改请求"场景（logging / monitoring / proxy / guardrail）。

- **CCR 是"压缩可恢复"的优雅折中**：完全无损压缩不可能（信息论下界），完全有损压缩会丢信息。**CCR 把"压缩视图 + 原文本地 + 按需取回"组合在一起**，是一种**概率无损**——LLM 不需要原文时是省 token 的，需要时通过 retrieval 工具主动拉回。**关键风险是"模型不主动取"**——这需要配合 prompt 设计告诉模型"如果你发现需要细节，调 `retrieve(<<ccr:HASH>>)`"。这是压缩代理 + LLM 协作的关键设计点。

- **CodeCompressor 默认 no-op 揭示"不是所有内容都该压"**：很多上下文压缩工具一刀切对所有内容压缩，结果压函数体、压注释、压空行，导致代码语义损坏。**Headroom 明确"代码就保持原样"**——这是**对"压缩工具应主动放弃某些场景"的工程化承认**。这种"克制"反而让工具在正确场景下更值得信任。

- **Auth mode gate + customer-value-wins 体现"中间层修改请求"的伦理边界**：Headroom 会**主动改请求体**（加 cache marker、排序 tools、排序 schema）。如果用户已经在 OAuth / subscription 模式，Headroom **不会自动注入**这些字段；如果用户已经设了 cache marker，Headroom **优先保留**用户的设置。这是对"中间层有责任不破坏用户已有配置"的**伦理化设计**——比"我能改我改"的工具更可信赖。

## 实践启示

- **评估上下文压缩工具时，看 cache cost 而非 token savings**：Headroom 监控指标里 `cache hit` 跟 `tokens freed` 并列——这是核心提示。**省 token 但破 cache 的工具可能反而更贵**。评估压缩工具时务必看 provider cache 命中率变化。

- **设计中间层时优先用 RawValue 字节级 patch 而非 JSON 重序列化**：所有 LLM gateway / 监控 / 代理工具，**直接定位 byte range 修改**比 `parse → modify → serialize` 更安全（保留 cache key 稳定性）。这是 Headroom 给整个 LLM 工具链的工程范式贡献。

- **给 LLM 配 retrieval 工具来支持"概率无损"压缩**：如果自己做上下文压缩，配合 `<<ref:HASH>>` marker + retrieval 工具，让模型在需要细节时主动取回。**关键是 prompt 设计要让模型知道"可以取"**——这比"压缩后什么都不做"更安全，比"完全不压缩"更省 token。

- **Agent 工具链加入"压缩代理层"作为可插拔中间件**：Headroom 的 proxy / wrapper / MCP server 模式让它**对应用层透明**——现有 Agent 不用改代码就能获得压缩 + 缓存稳定化收益。如果你在构建 Agent 平台或 IDE 集成层，**优先考虑 Headroom-style 透明代理**而非侵入 SDK 修改。

---
