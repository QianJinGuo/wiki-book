---
source_type: zhihu
source: https://zhuanlan.zhihu.com/p/2001069051741496397
title: "Thinking in Context: Codex 中的上下文工程"
author: LastWhisper（北京大学 计算机应用技术硕士，Thinking in Context 系列作者）
ingested: 2026-06-10
sha256: 46ee4baf5bd03c680c4fa9f0e830607227b0841927653779faf2d66b4bc98613
tags: [codex, openai, context-engineering, prompt-caching, append-only, latent-space, moat, agent, event-sourcing]
stars: 4
confidence: 0.85
value: 8
description: LastWhisper 解读 OpenAI《Unrolling the Codex agent loop》：缓存友好 Prompt Layout + Append-only 状态管理（State is a projection of events）+ 两种 encrypted_content（reasoning vs compaction）+ 应用层 vs 基础设施层压缩能力不对称（Semantic vs Latent Compression）+ 教学开源工具 context-kit（Compress/Select/Memory）
---

# Thinking in Context: Codex 中的上下文工程

> 来源：[zhuanlan.zhihu.com/p/2001069051741496397](https://zhuanlan.zhihu.com/p/2001069051741496397)
> 作者：LastWhisper（北大计算机应用技术硕士，Thinking in Context 系列作者）
> 系列：Thinking in Context（与《Context Engineering，一篇就够了》《Just-in-Time Context，一篇就够了》同源）
> 基于：OpenAI 工程博客《Unrolling the Codex agent loop》

## 文章定位

LastWhisper "Thinking in Context" 系列开篇，基于 OpenAI 发布的 Codex agent loop 工程博客做深度上下文工程分析。**核心问题**：一个世界级 Coding Agent 中有哪些前沿的上下文工程实践？

两个核心观察：

1. **The Architecture of State** — Prompt Cache 友好的上下文设计 + Append-only 状态管理
2. **The Latent Space Moat** — 应用层 vs 基础设施层在压缩能力上的不对称格局

## 1. The Architecture of State: 缓存友好的上下文设计

### 1.1 Prompt Layout: 面向 Prompt Caching 优化的结构

Codex 在向 Responses API 发送请求时，JSON payload 中 `input` 字段按以下顺序组装：

1. 变化频率**最低**置顶 — System Message / Tools / Instructions
2. 变化频率**最高**置底 — 对话历史 / Tool Traces

**为什么这样设计**：

Prompt Caching 核心工作机制 = **严格前缀匹配**。只有新请求的 Token 序列与缓存序列从第一个 Token 开始**完全一致**时才命中。一旦前缀中任何位置变动（哪怕调整两个 Tool Definition 的顺序），后续所有 Token 缓存失效，触发完整重计算。

> Codex 的策略使得采样成本从理论上的二次增长降低为**近似线性**。

**Codex 的工程教训**：

> Codex 团队在博客中提到，早期引入 MCP 工具支持时，由于未能保证工具枚举顺序的一致性，导致了 cache miss。MCP Server 还可以通过 `notifications/tools/list_changed` 通知动态更新工具列表，如果在长对话中途响应了这个通知，同样会破坏前缀，导致 Prompt Caching 失活。

**结论**：**确定性是性能的前提**。任何引入非确定性的操作都可能带来显著性能 regression。Prompt 稳定性需要视为**工程约束**而非可随意调整的实现细节。

### 1.2 Immutable Context: Append-only 的状态管理

当 Agent 状态发生变化（切换审批模式 / 切换工作目录），如何让 agent 知道？

**朴素做法**（❌ 破坏缓存）：

直接修改 Input 中对应的 `<environment_context>` / `<permissions instructions>` 消息内容。看起来"干净"，上下文始终反映最新状态。但**原地修改操作（Context Editing）会破坏前缀缓存**——被修改的消息通常位于 Input 中间位置，前缀从该位置起就与缓存不再一致，后续所有 Token 缓存全部失效。

**Codex 做法**（✅ Append-only）：

保持所有已有消息不变，在历史记录尾部追加新消息：

- 工作目录变了 → 追加一条 `role=user` 消息，内容为新的 `<environment_context>`
- sandbox 配置变了 → 追加一条 `role=developer` 消息，内容为新的 `<permissions instructions>`

**类比 DB migration**：

> 这种方式和我常用的 supabase 中的 db migration 很相似。我们不会直接在生产环境修改 Schema（相当于原地修改状态），而是编写并执行 Migration 文件（相当于追加一条状态变更记录）。最终的数据库 Schema 是所有 Migration 文件顺序执行后的结果。

> "State is a projection of events."，当前状态是历史事件序列的投影。这个概念和 **Event Sourcing** 有关（见 MS - Event Sourcing pattern）。

**Append-only 的两大收益**：

1. **推理速度和成本控制** — 前缀始终不变，只有尾部在增长，最大化 Prompt Cache 命中
2. **因果链保留** — 如果直接把 cwd 从 /project "瞬移"到 /project/tests，模型只知道"现在在 tests 目录"，但不知道"为什么来到这里"。Append-only 事件日志保留了完整操作序列，模型可通过因果链推断意图（可能因为要运行测试而切换了目录）

**内在 tradeoff**：

事件日志持续增长 → 上下文膨胀 → 冲突/噪声影响性能。**保留因果链的完整性 vs 控制上下文信噪比**之间需要取舍。两个方向：

1. OpenAI 对 Append-only 的 Context Engineering 进行了**专门模型训练**，让它更适应这种形式。对上下文过长则通过优化的 Context Compress 解决
2. Append-only 是更传统且更工程友好的模式，相较 Claude Code 更激进的 Context Editing，OpenAI 更保守

## 2. The Latent Space Moat: 上下文压缩能力的不对称

### 2.1 区分两种 `encrypted_content`

Codex 博客中，`encrypted_content` 字段出现在**两个不同的数据结构**中。

**第一种：`type: "reasoning"` 中的 `encrypted_content`**

```json
{
  "type": "reasoning",
  "summary": [{"type": "summary_text", "text": "Adding an architecture diagram..."}],
  "encrypted_content": "gAAAAABpaDWNMxMeLw..."
}
```

这是模型推理过程（Thinking / Chain-of-Thought）的加密载体。**目的 = 隐私保护**：
- 模型内部推理链属于 OpenAI 私有信息
- 客户端看到只有 `summary`（推理摘要）
- `encrypted_content` 作为不透明加密数据原样传回服务端，用于在后续 Turn 中恢复模型的推理状态
- **这并非压缩机制**

**第二种：`type: "compaction"` 中的 `encrypted_content`**

当上下文膨胀到一定阈值时，Codex 调用 `/responses/compact` 端点，返回精简后的 Input 列表，其中包含一个特殊的 Item：

> "This list includes a special type=compaction item with an opaque encrypted_content item that preserves the model's latent understanding of the original conversation."

**这才是真正的压缩机制**。原文使用 "latent understanding" 措辞，暗示 Codex 保留的可能不仅仅是文本层面的摘要。

### 2.2 Semantic Compression vs. Latent Compression

理解两种 `encrypted_content` 的区分后，可深入应用层与基础设施层在压缩能力上的差异。

**应用层 — Semantic Compression**

应用开发者能实现的压缩 = **语义重构**：

- 将完整对话历史传给 LLM，要求生成摘要
- 无论摘要多精准，都是原始信息的**有损投影**
- 推理过程中的微观逻辑、被排除的假设、模型注意力分布模式 —— 这些在文本摘要中不可避免被丢弃
- 应用开发者对真实用户场景采样有偏差，远不如 OpenAI 这种模型提供商
- 被用于压缩的模型多为通用模型，预训练目标并非上下文压缩

部分团队尝试优化：Cognition AI（Devin）会 Fine-tune 专用的压缩模型。但无论多精巧，操作的始终是文本表征（Token 序列）。

**基础设施层 — Latent Compression？**

OpenAI 未公开 `/responses/compact` 端点内部实现。看到 "preserves the model's latent understanding"，一个自然推测：**模型厂商是否在操作比文本更底层的表征——直接在模型隐空间（Latent Space）中对高维向量进行压缩？**

理论吸引力：
- 文本（Token 序列）是模型内部状态的**低维投影**
- 隐空间向量表征包含更丰富信息结构
- 在高维空间做有损压缩，可操作空间更大，保留信息结构上限更高
- 就像在高分辨率原图上做裁剪 vs 在缩略图上做裁剪

**但有重要工程问题**：向量表征与模型架构深度耦合。隐空间维度、结构、语义取决于具体模型版本。一旦模型升级（架构调整、重新训练），之前保存的向量表征就可能失效，压缩/恢复机制需要随模型版本共同演进。每次升级都要重新适配，这不符合好的工程实践。

**更可能的实现：有信息优势的 Semantic Compression**

所以更保守也更合理的推测：`/responses/compact` 本质上仍是 Semantic Compression，用模型自身生成压缩后的文本表征，但厂商拥有应用开发者不具备的信息优势：

1. 压缩过程中可访问**模型内部状态**（注意力分布、哪些 token 被重点关注）来指导压缩决策（而不是直接保存这些状态）
2. **海量真实用户对话数据**用于优化压缩策略，是任何单个应用开发者无法匹敌的数据规模
3. 可能像 Cognition AI（Devin）一样 Fine-tune 专用压缩模型，但训练数据规模和多样性远超应用层

### 2.3 回到应用层：我们还能做什么？

理解能力不对称后，应用层应聚焦**自己能控制的部分**：

- 缓存友好的 Prompt Layout
- 显式的 Compress / Select / Write / Isolate 策略
- 不依赖厂商未公开的"压缩黑科技"

## 3. 教学开源工具 context-kit

LastWhisper 开源了 **context-kit**（教学原型，非生产级），帮助开发者建立 Context Engineering 直觉：

| 模块 | 实现 |
|---|---|
| **Compress** | `compress_by_rule`（对齐 Claude Context Editing API 的结构化剪枝）+ `compress_by_model`（基于 LLM 的语义压缩） |
| **Select** | JIT Context 的渐进式检索（`list_dir` → `grep` → `read_file`） |
| **Memory** | 上下文卸载到文件系统，实现 Write 策略的持久化 |

哲学：**Do the simplest thing that works!**

## 关键 takeaway

1. **确定性是性能的前提** — 缓存友好 = 前缀稳定 = 工程约束
2. **Append-only vs Context Editing** — 两种流派长期共存观察（Codex 偏前者，Claude Code 偏后者）
3. **能力不对称是结构性的** — 应用层做 Semantic Compression，基础设施层可能做 Latent Compression 或有信息优势的 Semantic Compression
4. **Codex 实测效果** — 采样成本从二次增长降低为近似线性
5. **State is a projection of events** — Event Sourcing pattern 在 Agent 状态管理中的应用

## 引用

- OpenAI: [Unrolling the Codex agent loop](https://openai.com)
- Anthropic: [Effective context engineering for AI agents](https://anthropic.com)
- LastWhisper 博客: [Context Engineering，一篇就够了](https://zhuanlan.zhihu.com)
- LastWhisper 博客: [Just-in-Time Context，一篇就够了](https://zhuanlan.zhihu.com)
- context-kit: GitHub Repository
- MS — Event Sourcing pattern
