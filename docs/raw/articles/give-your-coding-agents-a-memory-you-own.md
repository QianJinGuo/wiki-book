---
title: "Give Your Coding Agents a Memory You Own（funes）"
source_url: "https://huggingface.co/blog/funes"
ingested: "2026-09-05"
source_published: "2026-09-03"
feed_name: Hugging Face Blog
sha256: 762190f2db670b0b6a0703c0c52874d362be4a9af0fa8e384ff239c64dae2231
type: raw
---

# Give Your Coding Agents a Memory You Own

Hugging Face 发布 **funes**——一个给 coding agents（Claude Code、Codex、pi、Hermes）的持久化记忆层。它从你机器上已有的 session 构建，本地运行，一条命令接入 agent 日常工作流；需要时可同步到你拥有、默认私有的 Hugging Face dataset。funes 是一个单一二进制，默认推理后端无 ML runtime 依赖，embedding 与 rerank 都在本地机器上完成。

## 核心思路：trace 只是潜在记忆，不是真正的记忆

日志是 agent 留下的密集记录——不仅是"改了什么"，还有"为什么改"。但 session log 仍是档案：无法在千万轮 turn 里 grep 出"为什么我们放弃了 streaming parser"。要让 agent 工作时可用的记忆，需要索引、检索、排序与精确溯源。这正是 funes 提供的。[^raw/articles/give-your-coding-agents-a-memory-you-own.md]

## 单命令接入

`curl -fsSL https://huggingface.co/buckets/huggingface/funes/resolve/install.sh | sh` 安装，然后 `funes add claude`（或 codex/pi/hermes）。这条命令构建首个索引，给 agent 提供 `recall` 与 `get` 工具，并安装自动化在每个完成的 turn 后增量索引。索引是增量的：新 run 只加新 turn，而非重新 embedding 全部历史；旧内容可分步回填。[^raw/articles/give-your-coding-agents-a-memory-you-own.md]

`recall` 返回原文而非摘要，并展示其来源（哪个 agent、时间戳、session、turn）。每个结果带一个 `get` 命令，打开完整 turn 及其上下文。[^raw/articles/give-your-coding-agents-a-memory-you-own.md]

## 底层架构

一条确定性 pipeline 将所有受支持 trace 解析成统一的 turn-and-block 形状，切块、用 pinned 本地模型 embedding，写入本地 **Lance** dataset。查询组合向量 + BM25 搜索、融合排序、用 cross-encoder 重排候选、按 recency 重新加权、并附加相邻 chunk。[^raw/articles/give-your-coding-agents-a-memory-you-own.md]

三个特性：
- **跨 agent 一份记忆**：Claude Code/Codex/pi/Hermes 都写同一形状，`recall` 横跨各自历史，每个命中标注是哪个 agent 产生。
- **原始证据完整保留**：写入时不蒸馏成事实，结果总能回溯到产生它的 turn。
- **`recall` 默认本地**：无需账号或 Hub repo，托管模型不处理你的 session 做索引，embedding/rerank 在本地，你的 coding agent 负责推理。[^raw/articles/give-your-coding-agents-a-memory-you-own.md]

## 记忆是 dataset，不是 service

`funes add codex acme/funes-memory` 绑定记忆。本地记忆是 Lance dataset，共享记忆是你拥有的 Hugging Face dataset（默认私有）。索引时凭据已 redact，发布前再次扫描每块，仍像 secret 的内容被扣留（见 SECURITY.md）。agent 读远程记忆时本地缓存 dataset 文件，warm 查询回到本地速度。Hub 提供 ownership/access control/versioning/distribution——你的记忆不变成独立记忆服务里的账号，也不通过 API 租回来。[^raw/articles/give-your-coding-agents-a-memory-you-own.md]

## `ask`：先问，后接

`recall` 面向 agent；`ask` 供你直接提问。`funes ask claude "what did we decide about the streaming parser"` 读本地记忆；`--memory huggingface/funes-memory` 指向共享记忆。这是 `add` 的只读、一问一答兄弟：检索到 passage 交给 coding agent，返回 grounded answer 并命名来源。检索 miss 不遮掩：passage 不足以支撑答案时 agent 会直说。[^raw/articles/give-your-coding-agents-a-memory-you-own.md]

## 跨 agent 无缝切换

共享记忆不绑定创建它的 agent/model：Claude Code 开始任务、下周 Codex 继续，第二个 agent 能 recall 第一个的推理。适用场景：跨机器、跨团队（新成员第一天就能检索数月决策，包括从未进 PR 的死路与 rationale）、以及开源项目（维护者发布 release 背后的 session，作为可搜索的 `CLAUDE.md`，保留项目为何如此的完整历史）。发布记忆带 dataset card 与 funes tag，在 Hub 可发现。[^raw/articles/give-your-coding-agents-a-memory-you-own.md]

## 基准：handoff-vs-recall

长调查撑爆 session。常规答案是 compaction 或写 handoff 重新来。Recall 是第三种，在 handoff-vs-recall benchmark 上对比（两个任务，答案无法脱离 session 前置知识重构）。Compaction 是 agent 默认做法，也是三种中唯一结果分化的：一个任务到达、另一个永不。失败处，概要把重要发现压平了。Recall 返回 passage 本身，发现不必幸存于摘要化。Recall 在两个任务上都是三法最省：一个比书面 handoff 便宜 8x，另一个 4x。[^raw/articles/give-your-coding-agents-a-memory-you-own.md]

## Built on open source

funes 依赖开源 embedding 模型（可本地跑）、Lance 的 append-only dataset（廉价增量写）、Hub 的 dataset caching/content-dedup。工作在于把三样装进 agent 真能用的记忆。funes 本身开源。[^raw/articles/give-your-coding-agents-a-memory-you-own.md]

→ [[raw/articles/give-your-coding-agents-a-memory-you-own.md|原文存档]]