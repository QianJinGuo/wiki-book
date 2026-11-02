# never waste a token

> 📊 Level ⭐⭐⭐⭐ | 9.2KB

> **背景**：从 newsletter candidates 提取，2026-06-18  stars=4 通过评分门槛。
> URL: https://sunilpai.dev/posts/never-waste-a-token/

## 核心要点

_(this post itself is LLM slop, but it tastes alright)_

tl;dr - put a durable buffer between your agent and the LLM provider. the provider connection now outlives your process, so a deploy in the middle of a stream doesn’t cost you the tokens you already paid for. and the same buffer that lets a disconnected browser catch back up is the thing that recovers a crashed turn. one log, two readers.

* * *

I’ve spent the last few weeks stuck on one question: what happens to an agent when the process running it dies in the middle of a turn?

it goes deep fast. tool calls that may or may not have fired. sub-agents. half-written streams waiting on a human. I’m writing all of that up separately (durable agent loops, coming soon). but one piece of it is small and self-contained enough to pull out on its own:

**when your process dies mid-inference, you don’t just lose your place. you lose money.**

## the problem that’s easy to miss

your agent opens a streaming request to a model, and the model starts generating. you’re billed for those output tokens the moment they’re generated. then your process gets replaced. maybe a deploy, maybe an eviction, maybe an OOM.

the usual reassurance is “don’t worry, the state is durable.” and sure, your conversation history survived. but the _in-flight HTTP request to the provider_ did not. it lived in the memory of the process that just died. so when you recover, your only option is to **make the call again**. you pay for those output tokens a second time.

now make it an agent. a real one does multiple tool calls in a single turn:

```
user message
  → stream some text
  → tool call → tool result
  → stream more text
  → tool call → tool result
  → stream the answer
```

every interruption throws away _all_ the output tokens generated so far in that turn. and it scales with the model you actually want to use: output runs $30 per million tokens on `gpt-5.5` versus $2 on `gpt-5.5-mini`, so a flagship retry burns ~15x what a mini one does. the better the model, the more it hurts. deploys happen constantly, evictions happen constantly, and each one that lands on a live stream is money straight out the window.

the happy path hides it. you only see it when you start counting tokens after an incident and the numbers don’t add up.

## the move: stop tying the request to the process

the reason a crash wastes tokens is that the provider connection lives _inside the thing that crashed_. so move it out.

put a buffer between the agent and the provider, and make it a **separate deployment**: its own Worker, its own Durable Object.

![Image 1: Diagram](https://sunilpai.dev/diagrams/8a5b1edea8f60b9b.svg)![Image 2: Diagram](https://sunilpai.dev/diagrams/8a5b1edea8f60b9b.dark.svg)
when a request comes in, the buffer does three things in order. it resets its state for a fresh stream. it kicks off a background task that drains the provider connection into SQLite. and it immed

## 评估理由

- **value=8**: Excellent practical engineering insight on agent architecture: token cost loss when LLM provider connection dies mid-stream, durable buffer pattern, and token economics across model tiers (gpt-5.5 vs 
- **confidence=7**: 详细程度与来源可信度
- **stars=4**: 独特技术洞察评分

## 相关

- [原文存档](https://sunilpai.dev/posts/never-waste-a-token/)

---
## 深度分析

### 浪费的根源：provider 连接被绑进了会死的进程

文章最有价值的诊断是区分两种"状态"：对话历史是持久的，但 **in-flight HTTP request** 只存在于发起它的进程内存里。一旦进程因 deploy、eviction 或 OOM 被替换，唯一选择就是重新调用 provider——已经生成、已经计费的 output tokens 全部作废。问题不是"状态不持久"，而是"连接不持久"，这个区分决定了修复方向：不是给状态加存储，而是把连接挪出进程。真正的 agent 一个 turn 里穿插多轮 tool call 与流式输出，任何一次中断都丢弃整个 turn 已产生的全部 tokens。

### 一份日志、两个读者：recovery 是 streaming 的免费副产品

作者发现 crash recovery 和 resumable streaming 是同一个问题：把每个 chunk 按索引持久化到 durable log，live proxy 用 `tailFrom(0)`，恢复方用 `tailFrom(N)`，唯一差别是游标起点。两种情形由状态机显式区分——重启后若发现状态仍是 `streaming`，说明上一任生产者死在半路，翻转成 `interrupted` 并告知调用者拿到的是部分数据。为浏览器断线重连买的持久化，顺手覆盖了进程崩溃恢复的大部分需求。这种"一个机制解决两个看似独立的场景"的收敛，是设计良好的 durable log 的典型回报。

### 存 raw bytes、复用 provider 自己的 parser

一个容易踩的坑：拿到恢复的流之后自己解析 SSE。作者明确称之为 trap——你要永久维护 OpenAI、Anthropic、Google 各自格式的 bespoke parser，并追着每一次 wire-format 变更打补丁。正确做法是存储原始字节，回放时交给每个 provider 自己的 plugin 解析（如 workers-ai-provider 的设计），并以 `{ runId, eventOffset }` 重新 attach 到同一个 run。格式转换的成本永久转嫁给 provider 生态，这是把"兼容性负担"从应用层下沉到基础设施层的典型权衡。

### 生态扫描：只有 OpenAI 做对了，空白恰在"自己的进程死了"

作者的横向对比揭示了一个清晰的市场格局：OpenAI Responses API 的 background mode 已原生支持 server 端继续生成 + 按 `sequence_number` 游标免重计费 resume，但锁定在自家 API；Anthropic 与 Gemini 的官方恢复方案是"重发请求让模型续写"——重复计费且续写内容不保证一致；Vercel 的 `resumable-stream` 是最近的表亲，但它是 app 层方案，producer 活在你自己的进程里，**你的 deploy 本身就是它扛不住的场景**。这印证了一个分层判断：这个能力必须住在不随应用代码 redeploy 的基础设施里，而不是应用框架里。

### 单线程运行时顺手消灭了轮询竞争

一个不起眼但值得记住的细节：tail reader 从不 poll SQLite。drain loop 每次 INSERT 后 `notify()` resolve 一个共享 promise，tailer 直接 await。这在 Durable Object 上之所以可靠，是因为 DO 单线程运行——insert 与 notify 在同一个同步块里完成，唤醒的 tailer 必然看到已提交的新行，无需调 poll interval、无 race。这是"运行时替你做了最难的部分"的又一例证，也解释了为什么作者认为 DO 是构建 agent 基础设施的正确基底（参见 [Long-running Agent Architecture](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/long-running-agent-architecture.md)）。

## 实践启示

- **把"deploy 后 token 账单对不上"当作审计项**：happy path 会完全掩盖这类浪费，只有事后对账才能发现。为 agent 服务建立 per-run token 记录，事后核对生成量与计费量是否一致。
- **不要让 provider 连接与进程同生命周期**：把 LLM 请求路由到独立部署、永不随代码 redeploy 的 buffer 层（Durable Object / AI Gateway），并用 keepAliveWhile 之类的心跳机制防止长生成的静默间隙被 eviction 杀掉。这正是 [Production Agent Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/production-agent-engineering.md) 中"把易变部分与持久部分分开部署"的具体化。
- **按 chunk index 持久化、按游标恢复**：为每个流式 run 保存原始字节与 `runId + eventOffset`，恢复时 `tailFrom(N)` 或按 run id 重新 attach，绝不重新调用模型。
- **选 provider 前先问两个问题**：连接断了之后 provider 是否继续生成？能否按游标 resume 且不重计费？目前只有 OpenAI background mode 两项全满足；用 Anthropic/Gemini 时这个缺口要在自己的架构里补上。
- **模型越强，durable buffer 越是必需品而非优化**：flagship 模型输出约 $30/M tokens，mini 档约 $2/M，一次中断重试的代价相差 ~15x。打算在 agent 循环里用旗舰模型的团队，应把 durable resume 视为前置条件。相关 token 经济学可参见 [Anthropic Cache Tokenomics](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic_cache_tokenomics.md)。
- **注意游标语义的细节**：实测中 `from` 是 event index 而非 byte offset，byte offsets 无法解析。实现 resume 时务必与基础设施确认游标单位，避免想当然。

## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关: Agent 架构

---

