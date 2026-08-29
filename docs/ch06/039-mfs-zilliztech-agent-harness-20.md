# MFS：zilliztech 的 Agent 统一上下文 harness，一套动词打通 20+ 数据源

> 📊 Level ⭐⭐ | 4.5KB | `entities/zilliztech-mfs-open-tag-claude-tag-shuge-2026.md`

## 核心概述

zilliztech 的 MFS（Multi-source File-like Search）是一个开源 Agent 上下文管理基础设施，将 20+ 数据源统一成一棵可检索的文件树，用同一套 shell 动词（ls/tree/cat/grep/search）+ URI 寻址（`<scheme>://`）触达所有数据。在 MFS 之上，Open Tag 复刻了 Claude Tag 的 Brain/Memory/Tools 三要素工作流。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/zilliztech-mfs-open-tag-claude-tag-shuge-2026.md)

## 三层关系

| 名字 | 性质 | 角色 |
|------|------|------|
| **Claude Tag** | Anthropic 官方产品 | 被复刻的范式 |
| **MFS** | 开源基础设施（Apache-2.0） | 底层地基 |
| **Open Tag** | 开源示例应用 | 对 Claude Tag 工作流的参考实现 |

MFS 是 Open Tag 的 Memory 引擎，Open Tag 是 MFS 之上对 Claude Tag 工作流的开源复刻。

## MFS 架构

**瘦客户端 + 有状态服务器**，对外只暴露一个 HTTP `/v1` 接口。

- **客户端无状态**：`mfs` CLI（Rust）、Python/TS SDK、两个 Agent Skill（`mfs-ingest` 注册索引 + `mfs-find` 跨源查找）
- **服务端集中状态**：配置、凭据、任务队列+workers、engine/connectors/processors、数据后端

### 同一套动词到处适用

无论数据源是什么，统一用 `<scheme>://` URI 寻址 + 同一套动词：`ls / tree / cat / head / tail / grep / search`。Agent 本来就会说 shell，学一次到处用。

### Search + Browse 双路径

- **Search**（需索引）：混合检索（dense 向量 + BM25 关键词）或精确匹配
- **Browse**（不需索引）：渐进式定位到字节/记录级别
- 每条结果带 locator（行号区间或主键字典），Agent 知道精确去哪读

### 后端按配置切换

本地零 key 零 GPU 起步（Milvus Lite + SQLite + 本地 ONNX BGE-M3），改配置即切到生产（Zilliz Cloud + Postgres + S3）。索引是派生的、crash-safe 的——上游数据源永远是真相源头。

## Open Tag：Claude Tag 三要素映射

| 要素 | Claude Tag | Open Tag |
|------|-----------|----------|
| Brain | Anthropic 托管模型 | CLI backend（claude / codex） |
| Memory | Anthropic 端托管 | MFS 索引的授权上下文 |
| Tools | Anthropic 平台工具 | MFS Connector 暴露的检索+工作区工具 |

**Slack bridge 极薄**——只做 5 件事（接收 mention → 读线程 → 发临时回复 → 调 agent → 替换回复），所有智能在 backend agent 里。每次 mention = 全新 agent 进程，无跨对话状态。

### 记忆边界

通过 `MFS_ALLOWED_SCOPES` 环境变量 + helper 脚本的 `is_scope_allowed()` 检查强制执行。不靠 Agent 自觉，靠系统拦。

### 诚实边界

Open Tag 是 demo/reference implementation，不是生产安全边界——没有加固沙箱、多用户策略、审计系统。**真正优势在 Memory 广度**：20+ connector 覆盖 Postgres/MongoDB/BigQuery/S3/GitHub/Jira/Slack/Discord/Gmail/飞书/Notion，全部自托管。

## 凭据管理

配置只放引用不放明文（`token = "env:SLACK_BOT_TOKEN"`），CLI 和 Agent 永远碰不到原始凭据。

## 关联

- [Introducing Claude Tag](../ch01/1489-introducing-claude-tag.html) — Open Tag 复刻的 Anthropic 范式
- [Anthropic Knowledge Work Plugins 分析](../ch01/783-anthropic.html) — Skills 的渐进式披露，MFS 用不同方式解决相同问题
- [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — MFS 作为 Agent 上下文 harness 的基础设施层

---

