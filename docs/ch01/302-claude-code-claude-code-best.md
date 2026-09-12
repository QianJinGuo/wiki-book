# Claude Code 泄露后的漏网之鱼 claude-code-best 这两个月到底演进了什么

> 📊 Level ⭐⭐⭐ | 8.2KB | `entities/claude-code-best-community-fork-evolution-vibecoder.md`

## 摘要

Claude Code 在 2.1.88 泄露后遭遇 GitHub 全网清理，绝大多数镜像被下架，唯独社区仓库 `claude-code-best/claude-code` 留存并继续迭代。截至 2026-05-22 它已发布到 v2.6.5、累计合并 136 个 PR，从一个"存档镜像"长成了真正做工程迭代的社区 harness 分支。

## 核心要点

- **版本节奏**：Claude Code 自 2.1.88 泄露，GitHub 全网清理后仅 `claude-code-best/claude-code` 存活；截至 2026-05-22 已到 **v2.6.5**，累计合并 **136 个 PR**。
- **多模型支持**：最早一批 PR 接入 OpenAI-compatible / Gemini / Grok，后续补 DeepSeek、MiMo、Grok thinking，并修 usage 字段映射与 `reasoning_content` 多轮回传。
- **Provider Registry**：内置 cerebras、groq、qwen、deepseek，用户可用 `~/.claude/providers.json` 覆盖；OpenAI-compatible 一层即可覆盖 Ollama、vLLM、DeepSeek、Qwen、Groq。
- **SearchExtraTools**：`CORE_TOOLS` 全量进 prompt，其余内建与 MCP 工具全部 defer，先 search 再 execute；TF-IDF 索引 + cosine 检索，中文 query 加 CJK bigram guard。
- **远程控制栈**：Remote Control Server、Bridge、ACP、acp-link、SSH Remote、后台 session，把本地 CLI 变成可被外部系统驱动的 agent 节点。
- **Local Memory / Vault**：多 store 本地记忆（1MB 上限、tmp+rename 原子写、每轮 ≤64 key、`untrusted` 包裹）+ keychain/AES-256-GCM 密钥层。
- **Feature 诚实度**：`scripts/defefines.ts` 显示 `UDS_INBOX`/`LAN_PIPES`/`SKILL_LEARNING`/`TEAMMEM` 已因工程问题关闭——README 热闹不等于可用。
- **生产风险**：ACP、Windows、LAN/Pipe、skill learning 路径须结合 issue、feature flag 与测试覆盖判断。

### 从镜像到"活体分支"

GitHub 清理针对的是泄露源码的分发，标准镜像一旦被识别即被下架，多数 fork 只活了几小时到几天。`claude-code-best/claude-code` 能存活，关键不在藏得好，而在于它很快脱离纯镜像定位——加入大量原版没有的改动，形成独立的维护节奏。

闭源 harness 被泄露后，社区等于拿到一份"可编译的规格说明书"：围绕它的迭代把原本厂商内部的工程路线（多模型适配、工具延迟加载、远程协议）变成公开议题——这是分发式维护实验，而非围观式存档。

### 多模型适配：harness 与模型的解耦

最早一批 PR 就同步接入 OpenAI-compatible、Gemini、Grok，后续补 DeepSeek、MiMo、Grok thinking，并持续修 `usage` 映射与 `reasoning_content` 多轮回传。

Provider Registry（内置四个端点 + `~/.claude/providers.json` 覆盖）说明目标不是"再加一个供应商"，而是把模型端点抽象成可替换的适配器。 难点全在细节：tool schema、streaming、usage、thinking、cache token、`reasoning_content` 各家都有差异，OpenAI-compatible 只是"看起来统一"。这条线最大的价值是让 harness 从"某家模型的附属品"变成"可挂任何模型的运行时"，与 [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-最新访谈从-vibe-coding-到-agentic-engineering.md) 讨论的 harness 独立化趋势一致。

### 工具上下文压缩：SearchExtraTools

`src/constants/tools.ts` 把 `CORE_TOOLS` 全量塞进 prompt，其他内建与 MCP 工具一律 defer，模型先 search 再 execute。 它同时解决两件事：几十上百个工具 schema 会撑爆上下文；原版贴近 Anthropic 的 defer loading 在 OpenAI-compatible/Gemini/Grok 上没有等价机制，必须自造。

检索层用 `toolIndex.ts` 基于 tool name、searchHint、prompt description 建 TF-IDF 索引做 cosine 匹配，并给中文 query 加 CJK bigram guard。 这与官方 Claude Code 的技能描述预算（占上下文 ≤1%、单条 ≤250 字符）同源，都是"上下文窗口是稀缺资源"下的空间换时间。边界 bug #1230 很典型：async subagent 能搜到 deferred tool，却因 allowlist 漏配而无法调用 `ExecuteExtraTool`——延迟加载把"发现"与"授权"拆成了两份必须同步维护的清单。

### 安全、远程与诚实的边界

Local Memory 以 `~/.claude/local-memory/<store>/<key>.md` 做多 store 记忆，带路径校验、1MB 上限、tmp+rename 原子写、每轮最多 64 key，并把内容包进 `<user_local_memory untrusted="true">` 提醒模型当数据而非指令。 Local Vault 优先 OS keychain、fallback 到 AES-256-GCM，`VaultHttpFetchTool` 只允许 HTTPS 且权限绑定 `vault_auth_key@host`——分支在安全语义上比原版更保守。

远程线暴露了通用性的代价：issue #1244 记录 `--acp` 下 extended thinking 与 tool_use 同回合时约 60% 概率触发 Anthropic 400，根因是内部消息序列重复 push——在三套消息规范间转换时极易破坏 role alternation 与 tool_use/tool_result 配对。 同时 `scripts/defefines.ts` 已关闭 `UDS_INBOX`、`LAN_PIPES`、`SKILL_LEARNING`（#379）、`TEAMMEM` 等 feature，"快速加、快速回滚"的开关纪律正是工程成熟的信号。

## 实践启示

1. **先隔离适配器层再谈多模型**：把 tool schema / streaming / usage / thinking / cache token / reasoning_content 的差异收敛进独立 provider 适配器，别在主循环里 if-else。
2. **工具默认延迟加载**：核心工具进 prompt，其余 search-then-execute；检索用轻量索引（TF-IDF + cosine）并给中文加 CJK bigram guard，同时让"可搜索集合"与"可调用 allowlist"同源。
3. **上下文压缩须带硬上限**：记忆读取、工具 schema、技能描述都要设显式上限并做有界读取，防止被低频资产悄悄填满。
4. **不可信数据显式标注**：本地记忆与外部抓取包进 `untrusted="true"` 边界标记；密钥走 keychain → AES-256-GCM 回退链；远程抓取强制 HTTPS 并做权限绑定。
5. **用 feature flag 判断真实能力**：先看默认构建注释了什么、哪些开关已关、相关 issue 是否仍未解决。
6. **泄露源码上做工程先算法务账**：DMCA 下架风险、无上游安全补丁、无授权再分发的合规暴露，注定这类分支只能作为研究对象。

## 相关实体

- [Claude Code Source Leak Lifecycle Analysis](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-source-leak-lifecycle-analysis.md) — 泄露源码的完整请求生命周期拆解
- [两万字详解Claude Code源码核心机制](https://github.com/QianJinGuo/wiki-public/blob/main/entities/两万字详解claude-code源码核心机制.md) — Claude Code 源码核心机制长文
- [Claude Code Tool System Architecture Deep Dive](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-tool-system-architecture-deep-dive.md) — 工具系统架构深潜
- [Claude Code Search Architecture Tencent 2026](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-search-architecture-tencent-2026.md) — 搜索/检索架构分析
- [Claude Code Agentic Harness Design Patterns](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-agentic-harness-design-patterns.md) — Agentic Harness 设计模式
- [你不知道的 Agent原理架构与工程实践 V2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/你不知道的-agent原理架构与工程实践-v2.md) — Agent 原理与工程实践
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-最新访谈从-vibe-coding-到-agentic-engineering.md) — 从 vibe coding 到 agentic engineering
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md) — Harness Engineering 框架
- [MOC：编码 Agent 实践](https://github.com/QianJinGuo/wiki-public/blob/main/moc/coding-agent-practice.md)
- [MOC：可观测性](https://github.com/QianJinGuo/wiki-public/blob/main/moc/observability-monitoring.md)

→ [原文存档](https://mp.weixin.qq.com/s/fyugPyHo1gY8A_5XXCi8sQ)

---

