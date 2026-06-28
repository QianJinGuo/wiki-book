## Ch06.013 Google Open Knowledge Format (OKF) v0.1：AI 知识库通用格式标准 — 让 Markdown 知识库互通

> 📊 Level ⭐⭐ | 11.6KB | `entities/google-okf-open-knowledge-format-v0-1-2026.md`

# Google Open Knowledge Format (OKF) v0.1：AI 知识库通用格式标准

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/google-okf-open-knowledge-format-v0-1-2026.md)

## 一句话定位

Google Cloud Platform 2026-06-16 发布的**开放知识格式规范 v0.1**——一个 OKF bundle = 一个 Markdown 文件目录 + YAML frontmatter（`type` 必填）+ 自由 Markdown 正文 + Markdown 链接做关系图。**格式是契约，工具可独立替换**。

> **核心定位**：OKF 不是要替代 Karpathy Wiki / Obsidian Wiki / GBrain，而是给"长得像但互不通用"的 LLM Wiki 范式提供**互通性标准**。

## 核心信息

| 维度 | 详情 |
|------|------|
| 名称 | **Open Knowledge Format (OKF) v0.1** |
| 发布方 | Google Cloud Platform |
| GitHub | https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf |
| 性质 | 开放规范（不是服务、不需要 SDK、不绑定云平台） |
| 核心 | 一个 OKF bundle = 一个 Markdown 文件目录 |
| 配套 | 3 个参考实现 + 3 样例 bundle（GA4/StackOverflow/比特币） |
| 集成 | Google Cloud Knowledge Catalog 已支持摄入 OKF |

## 为什么需要 OKF（痛点）

### AI 知识碎片化

公司里 AI agent 需要用到的知识大多是**内部知识**：数据表字段含义 / 指标业务定义 / 系统接入路径 / API 废弃通知。

这些东西住在**元数据目录、内部 Wiki、共享文档、代码注释、资深工程师的脑子里**——互不兼容，互不流通。

### 开发者已摸索出解法，但各做各的

过去一年，一个模式在开发者中悄悄流行起来：**用 Markdown 文件给 AI agent 建一个知识库**。

被 **Andrej Karpathy** 表达得最清楚：LLM 不会感到无聊，不会忘记更新交叉引用，一次可以同时改 15 个文件。人类维护个人 Wiki 最终放弃，往往就是败在这些琐碎的更新工作上，而这恰恰是 LLM 最擅长的。

### 现有范式名字

- 接入编程 agent 的 **Obsidian 知识库**
- **AGENTS.md** 和 **CLAUDE.md** 这类约定文件
- 数据团队用来当代码管理的**元数据仓库**

### 关键痛点

**每家做法都是定制的**。Karpathy 的 Wiki 和你团队的 Wiki 和某家厂商导出的目录，长得像（都是 Markdown、都有 frontmatter、都有交叉链接），但它们并没有被设计成可以互通的。**没有人约定每个文档应该有哪些字段，也没有人约定文件名代表什么含义**。

知识还是被锁在各自的团队里，每次搭新 agent 都得重新造轮子。

## OKF 的核心设计

### 目录结构

一个 OKF bundle 就是一个 Markdown 文件目录，每个文件代表一个概念（数据表 / 数据集 / 指标 / 操作手册 / API 等），文件路径就是这个概念的**唯一标识**。

```
sales/
├── index.md
├── datasets/
│   └── orders_db.md
├── tables/
│   ├── orders.md
│   └── customers.md
└── metrics/
    └── weekly_active_users.md
```

### 文件结构

每个文件有两个部分：
- **顶部 YAML frontmatter**：存储可以被查询的结构化字段
- **Markdown 正文**：写什么内容完全自由

### 完整示例

```markdown
---
type: BigQuery Table
title: Orders
description: One row per completed customer order.
resource: https://console.cloud.google.com/bigquery?p=acme&d=sales&t=orders
tags: [sales, revenue]
timestamp: 2026-05-28T14:30:00Z
---

# Schema

| Column        | Type      | Description                              |
|---------------|-----------|------------------------------------------|
| `order_id`    | STRING    | Globally unique order identifier.       |
| `customer_id` | STRING    | FK to [customers](/tables/customers.md). |

# Joins

Joined with [customers](/tables/customers.md) on `customer_id`.
```

**概念之间用普通的 Markdown 链接互相引用**，整个目录就变成了一张关系图，比文件系统的父子层级丰富得多。

整个 v0.1 规范，**一页纸能写完**。

## 三个设计原则（缺一不可）

### 1. 最小约束
- OKF 对每个文件只强制要求一件事：**必须有 `type` 字段**
- 其他字段、文件体的内容和结构，全由使用者决定
- 规范管的是**互通的边界**，不是内容本身

### 2. 生产者和消费者彼此独立
- 人手写的知识文件，可以被 AI agent 读取
- 元数据导出流水线生成的 bundle，可以在可视化工具里浏览
- 一个 LLM 生成的 bundle，可以被另一个 LLM 查询
- **格式是契约，两端的工具可以独立替换**

### 3. 格式本身，不是平台
- 不绑定任何云服务、数据库、模型厂商或 agent 框架
- 读写不需要任何专有账号或 SDK
- 谷歌作为开放标准发布，因为**知识格式的价值来自有多少人在用它，不是来自谁拥有它**

## 三个参考实现（同步发布）

### 1. 数据丰富 agent
自动扫描 BigQuery 数据集，为每张表和每个视图起草一份 OKF 概念文档，**然后再跑一遍 LLM，爬取权威文档，补充 schema、引用和关联路径**。

### 2. 静态 HTML 可视化工具
把任意 OKF bundle 转成一个可以交互的图视图——**单个自包含文件，不需要后端，不需要安装，数据不离开本地**。

### 3. 三个样例 bundle
- **GA4 电商数据集**
- **Stack Overflow**
- **比特币公开数据集**

都是用上面那个参考 agent 生成的，提交在 repo 里作为格式合规的活示例。

> 谷歌特别说明：这三个工具是概念验证，不是唯一实现方式。格式对工具没有要求，生产者和消费者的生态系统可以自由生长。

## OKF 与现有 LLM Wiki 范式的关系

OKF 不是要替代 Karpathy Wiki / Obsidian Wiki / GBrain，而是**给它们之间的互通性提供一个格式契约**。

| 范式 | 关系 | OKF 互补点 |
|------|------|-----------|
| Karpathy LLM Wiki | 个人第二大脑（自组织） | OKF 提供标准 frontmatter 字段和目录约定 |
| Obsidian Wiki | 接入编程 agent | OKF 的 `type` + Markdown 链接兼容 Obsidian 双链 |
| AGENTS.md / CLAUDE.md | 单文件约定 | OKF bundle 是这些文件的"扩展到目录"版本 |
| GBrain | Postgres 持久化 + 知识图谱 | GBrain 可消费 OKF bundle 作为输入源 |
| Hermes Wiki | 9 步自动生长 | OKF 可作为其输出格式 |

**核心洞察**：OKF 抓住了"长得像但互不通用"的痛点——之前的范式都是**单团队、单平台、单格式**的实践，OKF 把"互通边界"从"私有约定"提到"开放规范"。

## OKF 的工程价值

### 1. 给数据团队
- 现有元数据目录（BigQuery / Snowflake / DataHub / Amundsen）可以**导出为 OKF bundle**
- 不需要重写现有系统，只需要写一个 producer
- AI agent 可以跨数据源统一查询

### 2. 给 AI agent 团队
- 可以**消费**任何 OKF bundle 作为知识源
- 可以**生成** OKF bundle 作为知识沉淀
- LLM 生成的 bundle 可以被另一个 LLM 查询

### 3. 给 Wiki 工具
- Obsidian / Notion / 飞书文档可以**导出为 OKF bundle**
- 一次写多平台消费
- 知识跨平台迁移成本降低

## 局限与未解问题

- **v0.1 范围有限**：只定义了"bundle 是什么"，没定义"bundle 之间的引用规则"
- **type 字段无标准枚举**：`type: BigQuery Table` 是自由字符串，跨 bundle 类型对齐需要额外约定
- **timestamp 语义模糊**：是创建时间？更新时间？最后访问时间？
- **没有"权威来源"机制**：如果两个 bundle 描述同一个表，如何知道哪个更新？
- **静态 HTML 可视化是单文件**但不能跨 bundle 浏览

## 行动建议（谷歌给开发者的）

1. 读规范（很短，一页纸）
2. 给你的数据源写一个 producer
3. 给你的使用场景写一个 consumer
4. 对着自己的数据跑一下参考实现
5. 有问题就提 issue 或 PR

## 关联引用

→ [LLM Wiki / Obsidian Wiki / GBrain 自组织自进化](ch01-499-llm-wiki-obsidian-wiki-gbrain-self-organization-self-evoluti.html) — 同领域不同项目对比
→ [Karpathy LLM Wiki 第二大脑 (awkthole)](ch01-321-ralph-loop-agent-3.html) — Karpathy Wiki 详细解析
→ [Karpathy LLM Wiki v2 (2026)](ch01-271-karpathy-llm-wiki-v2-2026.html) — Karpathy Wiki 2026 更新
→ LLM Wiki Architecture — LLM Wiki 架构
→ [Obsidian + LLM Wiki 本地化 (kytmanov)](ch03-090-obsidian-llm-wiki-local-obsidian本地ai知识图谱自动构建.html) — Obsidian 集成 LLM Wiki
→ [知识沉淀是护城河](ch05-082-知识沉淀是护城河.html) — 知识管理护城河论述
→ [腾讯知识 Harness 实践](ch05-078-harness不是目的-知识才是护城河-一个ai工程交付团队的知识沉淀实践.html) — 腾讯系知识管理
→ [Create Custom MCP Catalogs and Profiles](ch07-057-create-custom-mcp-catalogs-and-profiles.html) — MCP 目录 vs OKF bundle 关系
→ [GBrain](ch01-220-gbrain-yc-ceo-garry-tan-的-postgres-native-ai-第二大脑-5-大设计决策.html) — Postgres 持久化 + 知识图谱（可消费 OKF bundle）

---
