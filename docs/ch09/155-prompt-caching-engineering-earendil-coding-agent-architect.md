# Prompt Caching Engineering — Earendil Coding Agent Architecture

## Ch09.155 Prompt Caching Engineering — Earendil Coding Agent Architecture

> 📊 Level ⭐⭐ | 5.7KB | `entities/earendil-prompt-caching-coding-agents.md`

# Prompt Caching Engineering — Coding Agent System Architecture

> **Background**：本文档基于 Earendil Engineering 发表的深度技术文章 "Prompt Caching In Agents"（2026-07-22），系统分析了 KV Cache 在编码 Agent 场景下的架构设计与工程权衡。Earendil 是 Pi（模块化 AI Agent 构建平台）的开发者。

## 核心矛盾：编码 Agent 的 Prompt 增长模式

编码 Agent 每轮交互发送的 prompt 大部分内容与上一轮相同——system prompt、tool definitions、对话历史、工具调用结果都重复传输。session 增长到数万到数十万 token 后，每轮完全重算 prefill 变得缓慢且昂贵。

Prompt caching 使这变得经济，但极为脆弱：一个 tool definition 的变化、模型切换、provider 路由决策都可能将期望的"低成本增量请求"变成 full replay of context。缓存行为因此不只是实现细节或优化——它影响 latency、cost、tool design、session design，甚至 product features 的取舍。

## KV Cache 基础设施两种模式

| 模式 | 机制 | 优势 | 劣势 |
|------|------|------|------|
| **Session Affinity** | KV cache 保持在计算的 GPU 上/附近，后续请求路由回同一 worker | 快速，无需跨网络搬运 KV blocks | 调度受限：worker 过载、重启、evict 都会导致缓存丢失 |
| **Distributed Cache** | KV blocks 存入另一层存储或跨 worker 可用 | 调度灵活，恢复能力强 | 移动、索引、保留 KV blocks 本身是系统难题 |

两种模式在实践中混合 GPU memory、host memory、local storage、remote storage、prefix-aware routing 和 eviction policy。

## Tool Loadout 对缓存的破坏（关键洞察）

Tool definitions 通常出现在 prompt 的开头部分（被"折叠"进 system prompt）。添加/删除一个 tool、修改 schema、或改变序列化顺序都会将 prompt 的 first mismatch 点移到靠近开头的位置，使之后所有缓存失效。

这是一个常见的陷阱：plugin 系统（MCP-style tool catalogs）延迟加载 tool 看似高效（少发 schema），但新扩展的 loadout 使缓存的多轮对话全部失效。**节省几千个 tool-schema token 可能导致数万个 conversation token 被重新处理。**

**Additive Tool Loading**：部分新模型 API 支持 tool 在 transcript 中的特定 tool result 位置可用，而非插入到原始 tool list。这保持旧 prefix 不变。Pi 对支持 native deferred-tool 机制的模型提供了此能力。

## 缓存生存期与中断

默认缓存 TTL 短于正常编码活动周期。Anthropic 默认 5 分钟缓存是典型例子——跑测试 7 分钟、code review、午餐、会议后返回，缓存的 KV state 已经消失。用户眼中"持续活跃"的编码 session，在 provider 看来是"isolated requests"序列。

## Pi 的缓存设计哲学：不激进修剪

Pi 不主动删除旧的 tool calls。删除中间内容会改变那个点的 prefix，存活对话可能需要重新处理。一次性重写的成本可能超过未来节省。

Pi 偏好稳定、append-oriented 的 transcript。Compaction 仅当 context pressure 需要 lossy rewrite 时才使用，将其视为 cache reset 而非 cache failure。

## 缓存可见性

Pi 在交互 footer 显示累计 cache reads/writes（R/W），以及最新请求的 cache-hit rate（CH）。`/session` 命令提供完整视图：缓存 vs 非缓存 input、累计 hit rate、成本和估算的回收费（re-billed tokens）。支持配置 `showCacheMissNotices` 在 cache miss 时显示预警。

## 缓存退化的常见原因

1. **Idling**：空闲时间超过 provider retention window
2. **Model/provider 切换**：KV state 是 model-specific 的
3. **Branch navigation**：/tree、rewind、fork 改变 active token 序列
4. **Compaction 或手动历史重写**：有意替换部分 prompt
5. **Tool 和 reasoning level 变更**：除非支持 additive loading 且是纯增量变化
6. **Dynamic system prompts**：timestamp、random values、extension prompt snippets
7. **Extension context transforms**：修改旧消息或 provider payload
8. **Provider routing and eviction**：prompt 完全一致但 KV blocks 在请求落地处不可用

## 与已知实体关系

- [Anthropic Prompt Caching (Claude Code)](../ch01/401-anthropic-prompt-caching-claude-code.html) — Claude Code 的 prompt caching 工程实践，侧重 Anthropic 生态
- [Tokenomics of Claude's Cache](../ch01/783-anthropic.html) — Anthropic 62.5 分钟缓存规则的 Token 经济学分析
- [Bedrock Prompt Cache Strategy](../ch11/069-amazon-bedrock-claude-prompt-cache.html) — AWS Bedrock 上的 Prompt Cache 策略设计
- [pi-mono — 模块化 AI Agent 构建平台](../ch03/078-pi-mono-ai-agent-openclaw.html) — Earendil/Pi 的模块化 Agent 平台
- [OpenClacky Harness Prompt Cache](../ch05/080-harness.html) — OpenClacky 的 Harness Prompt Cache 实践
- [Headroom Context Compression](../ch06/045-headroom.html) — Headroom 上下文压缩与缓存稳定性

---

