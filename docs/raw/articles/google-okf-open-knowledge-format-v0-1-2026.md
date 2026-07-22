---
title: "Google Open Knowledge Format (OKF) v0.1：让 AI 知识库有了通用格式"
source: "AI寒武纪"
source_url: "https://mp.weixin.qq.com/s/nhF1cy_lIQukq_niVFvRCA"
ingested: 2026-06-16
sha256: "44b8630e21f4f4805a53d7c816da09485c1c815bcb92c47481bd389a9a8f7d5b"
type: raw
tags: [okf, open-knowledge-format, google-cloud, knowledge-catalog, knowledge-format, knowledge-base, knowledge-management, markdown, frontmatter, agent-knowledge, llm-wiki, karpathy-wiki, agents-md, claude-md, format-standard, 2026, ai-cambrian]
review_value: 8
review_confidence: 8
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
OKF 对每个文件只强制要求一件事：**必须有 type 字段**。其他字段、文件体的内容和结构，全由使用者决定。规范管的是**互通的边界**，不是内容本身。

### 2. 生产者和消费者彼此独立
- 人手写的知识文件，可以被 AI agent 读取
- 元数据导出流水线生成的 bundle，可以在可视化工具里浏览
- 一个 LLM 生成的 bundle，可以被另一个 LLM 查询
- **格式是契约，两端的工具可以独立替换**

### 3. 格式本身，不是平台
- OKF 不绑定任何云服务、数据库、模型厂商或 agent 框架
- 读写它不需要任何专有账号或 SDK
- 谷歌选择把它作为开放标准发布，因为**知识格式的价值来自有多少人在用它，不是来自谁拥有它**

## 三个参考实现（同步发布）

光有规范不够，谷歌同时发布了配套工具，降低试用门槛。

### 1. 数据丰富 agent
自动扫描 BigQuery 数据集，为每张表和每个视图起草一份 OKF 概念文档，**然后再跑一遍 LLM，爬取权威文档，补充 schema、引用和关联路径**。

### 2. 静态 HTML 可视化工具
把任意 OKF bundle 转成一个可以交互的图视图，**单个自包含文件，不需要后端，不需要安装，数据不离开本地**。

### 3. 三个样例 bundle
- GA4 电商数据集
- Stack Overflow
- 比特币公开数据集

都是用上面那个参考 agent 生成的，提交在 repo 里作为格式合规的活示例。

**谷歌特别说明**：这三个工具是概念验证，不是唯一实现方式。格式对工具没有要求，生产者和消费者的生态系统可以自由生长。

## 现在能做什么

- 谷歌已更新 **Google Cloud Knowledge Catalog**，支持摄入 OKF 格式并把它提供给 agent 使用
- 规范、参考实现和样例 bundle 都在 GitHub 上开放
- 目前是 **v0.1**，显式为向后兼容扩展而设计
- **行动建议**：
  1. 读规范（很短）
  2. 给你的数据源写一个生产者
  3. 给你的使用场景写一个消费者
  4. 对着自己的数据跑一下参考实现
  5. 有问题就提 issue 或 PR

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

## 关联引用

→ [[entities/llm-wiki-obsidian-wiki-gbrain-self-organization-self-evolution|LLM Wiki / Obsidian Wiki / GBrain 自组织自进化]] — 同领域不同项目对比
→ [[entities/karpathy-llm-wiki-second-brain-awkthole|Karpathy LLM Wiki 第二大脑 (awkthole)]] — Karpathy Wiki 详细解析
→ [[entities/karpathy-llm-wiki-v2-2026|Karpathy LLM Wiki v2 (2026)]] — Karpathy Wiki 2026 更新
→ [[entities/llm-wiki-architecture|LLM Wiki Architecture]] — LLM Wiki 架构
→ [[entities/obsidian-llm-wiki-local-kytmanov|Obsidian + LLM Wiki 本地化 (kytmanov)]] — Obsidian 集成 LLM Wiki
→ [[entities/knowledge-mgmt-is-moat|知识沉淀是护城河]] — 知识管理护城河论述
→ [[entities/tencent-knowledge-harness-practice|腾讯知识 Harness 实践]] — 腾讯系知识管理
→ [[entities/create-custom-mcp-catalogs-and-profiles|Create Custom MCP Catalogs and Profiles]] — MCP 目录 vs OKF bundle 关系
→ [[raw/articles/google-okf-open-knowledge-format-v0-1-2026|原文存档（本篇）]]
