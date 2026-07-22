---
title: "zilliztech MFS 拆解：一套动词打通 20+ 数据源，Open Tag 复刻 Claude Tag"
source: wechat
source_url: https://mp.weixin.qq.com/s/LbShWt6lk_ttJPb191CpPg
author: 术哥
feed_name: 术哥无界
review_value: 8
review_confidence: 8
review_recommendation: worth-reading
review_stars: 4
date: 2026-06-27
created: 2026-06-29
updated: 2026-06-29
tags: [agent-harness, context-management, milvus, mfs, open-tag, claude-tag, vector-search, data-integration, zilliztech]
type: article
provenance_state: extracted
sha256: 5ca5d359ee99d78226ff75c22936d1411ce5b5befa1a8903239ad589ef3a5cf8
---

# zilliztech MFS 拆解：一套动词打通 20+ 数据源

## 三层关系

Claude Tag、MFS、Open Tag 不是平级竞品，而是三个层次：

| 名字 | 性质 | 归属 | 角色 |
|------|------|------|------|
| Claude Tag | 官方产品形态 | Anthropic 生态 | 被复刻的范式 |
| MFS | 开源基础设施 | zilliztech/mfs | 底层地基 |
| Open Tag | 开源示例应用 | examples/open-tag-skill/ | 示范上层应用 |

**一句话**：MFS 是 Open Tag 的 Memory 引擎，Open Tag 是 MFS 之上对 Claude Tag 工作流的开源复刻。

## MFS：统一上下文 harness

官方定位：*A context harness for AI agents — one unified workspace over your code, memory, skills, docs, messages, and every data source.*

### 架构：瘦客户端 + 有状态服务器

- 对外只暴露一个 HTTP `/v1` 接口
- 客户端无状态：`mfs` CLI（Rust）、Python/TS SDK、两个 Agent Skill（`mfs-ingest` + `mfs-find`）
- 服务端集中所有状态：配置、凭据、任务队列+workers、engine/connectors/processors

### 同一套动词，到处适用

无论面对本地目录、Postgres、GitHub、Slack 还是 S3，统一用 `<scheme>://` URI 寻址，同一套动词操作：

```
ls / tree / cat / head / tail / grep / search
```

Agent 本来就会说 shell，学一次就能到处用：`ls github://org/repo`、`search slack://workspace`。

### Search + Browse 双路径

- **Search**（需先索引）：`mfs search` 走混合检索（dense 向量 + BM25 关键词）；`mfs grep` 不需索引，精确/全文匹配
- **Browse**（不需索引）：ls/tree/cat/head/tail，渐进式定位到字节或记录级别
- 每条命中结果带 locator（行号区间或主键字典），Agent 知道去哪儿读

### 后端按配置切换，非按代码

| 组件 | 本地默认 | 生产替换 |
|------|----------|----------|
| 向量库 | Milvus Lite（本地文件） | 自托管 Milvus / Zilliz Cloud |
| 元数据库 | SQLite | Postgres |
| 缓存 | 本地文件系统 | S3 |
| Embedding | 本地 ONNX BGE-M3（无 key） | OpenAI / Gemini / Voyage |

本地完全离线跑（~600MB embedding 模型），不需要 API key / GPU / 云账号。**MFS was built for production from day one — not a weekend demo.**

索引是派生的、crash-safe 的：上游数据源永远是真相源头，索引坏了随时能从原始源重建。

## Open Tag：Claude Tag 三要素映射

| 要素 | Claude Tag（官方） | Open Tag（开源复刻） |
|------|-------------------|---------------------|
| Brain | Anthropic 托管模型 | CLI agent backend：claude 或 codex |
| Memory | Anthropic 端托管 | MFS 索引的、运营者授权的上下文 |
| Tools | Anthropic 平台工具 | MFS Connector 暴露的检索+工作区工具 |

### Slack bridge 极薄

只做 5 件事：接收 app_mention → 读线程 → 发临时回复 → 调 opentag_agent.py → 替换回复。**所有智能都在 backend agent 里，bridge 就是传话的。**

### 每次 mention = 全新 agent 进程

无跨对话状态残留。好处：状态干净、好调试、避免长会话上下文污染。

### 记忆边界：MFS_ALLOWED_SCOPES

helper 脚本在调用 MFS HTTP `/v1/search` 前做 `is_scope_allowed()` 检查，超范围直接拒绝。**不靠 Agent 自觉，靠脚本拦一刀。**

## 诚实边界

> This is a demo/reference implementation, not a production security boundary. It has no hardened sandbox, multi-user policy engine, audit system, or approval flow.

Open Tag 故意跳过了企业治理（审批/审计/消费限额）、环境主动模式、组织级身份模型。**真正的优势在 Memory 的广度**——20+ connector 覆盖 Postgres/MongoDB/BigQuery/S3/GitHub/Jira/Slack/Discord/Gmail/飞书/Notion 等，全部自托管，数据和凭据不离开你的机器。

## 凭据管理

配置只放引用不放明文：`token = "env:SLACK_BOT_TOKEN"`、`password = "file:/run/secrets/db_password"`。CLI 和 Agent 永远碰不到原始凭据，配置文件能直接提交到代码仓库。
