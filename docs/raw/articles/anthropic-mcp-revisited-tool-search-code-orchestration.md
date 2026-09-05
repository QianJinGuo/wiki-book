---
title: Anthropic 最新博客：MCP 没死，它又来了
source_url: https://mp.weixin.qq.com/s/Sz2hzXiNCyf1YNzPbeUo5Q
publish_date: 2026-04-27
tags: [wechat, article, claude, agent]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 6d3764d9bf420c667e5a1ded2f9468c1f4e00906158fca7aefe9e8ab092aa103
---

## 02 Anthropic 的回应：三条路各有地盘
Agent 连接外部系统有三条路：
| 路径 | 适用场景 |
|------|----------|
| 直连 API | 简单、一对一场景，但 M×N 问题严重（10 Agent × 10 服务 = 100 个集成方案） |
| CLI | 本地和沙箱环境，天然自描述（--help）、可组合（jq/pipe），无上下文污染 |
| MCP | 云端生产 Agent（Claude Cowork / Managed Agents / 移动端 / Web 端），无本地文件系统 |
**关键数据**：MCP SDK 月下载量从年初 1 亿 → 3 亿，用脚投票的人越来越多。
---
## 03 Token 解法
### 解法一：Tool Search（按需加载）
**传统方式**：43 个工具，55,000 tokens，全塞进上下文
**Tool Search**：Agent 先描述需求，系统运行时搜索匹配工具，只把相关几个拉进来
- 工具定义 token 消耗减少 **85% 以上**
- 工具选择准确率不下降
- **关键原则**：按意图分组工具，别按 API 分（意图级工具 vs 细粒度工具）
**效果**：GitHub MCP token 消耗：32 倍差距 → 约 7 倍差距（从 44,026 tokens 降到 ~10,000 tokens）
### 解法二：程序化工具调用
**核心思路**：别让模型当搬运工，让它写代码
- 工具返回结果不在直接丢回模型
- 在代码执行沙箱里处理：Agent 可循环/过滤/聚合
- 只把最终结果返回上下文
**效果**：复杂多步工作流减少约 **37% token 消耗**
### 综合效果
MCP vs CLI 成本：从 32 倍差距缩小到约 7 倍。
---
## 04 Cloudflare 的实践：代码编排模式
Cloudflare MCP 服务器覆盖约 **2,500 个 API 端点**。
传统方式：2,500 个端点工具定义全塞上下文 → 不现实
Cloudflare 做法：只暴露 **2 个工具**：
- `search`：找到需要的 API
- `execute`：在服务端沙箱里执行脚本
整个工具定义只占约 **1K tokens**。
**模式本质**：Agent 用 search 找到 API → 写一段简短脚本 → 通过 execute 在服务端沙箱跑
这个模式叫**「代码编排」**。
**与 CLI + Skills 的异同**：
- 相同点：Skill 告诉 Agent「怎么干」，CLI 提供「用什么干」，Agent 写代码调用，中间数据不经过上下文
- MCP 版本：把 CLI 的哲学搬进 MCP 协议，跑在云端，走 MCP 协议而非本地命令行
**Anthropic 的真正意思**：好的 MCP 服务器应该像 CLI 一样设计。
---
## 05 Skills 转正
Anthropic 明确定义了两者关系：
| 角色 | 职责 |
|------|------|
| MCP | 管「能力」——让 Agent 能连上 Snowflake、Databricks、BigQuery |
| Skills | 管「编排」——告诉 Agent 该怎么用这些连接完成具体任务 |
**典型案例**：Claude 数据插件 = 10 个 Skills + 8 个 MCP servers，覆盖 Snowflake、Databricks、BigQuery、Hex 等
**新趋势**：Canva、Notion、Sentry 等第三方服务商已发布 MCP 服务器同时附带 Skills
**MCP 社区动态**：正在开发 Skills 直接从 MCP 服务器分发的扩展，API 升级时 Skills 自动更新版本
**Peter 在播客的观点**（被 Anthropic 间接认可）："MCP 推动了很多公司去做 API，这是好的。我现在可以看一个 MCP 然后把它做成 CLI。"
---
## 06 MCP 的真正地盘
### 三问题的 Anthropic 回答
| 社区批评 | Anthropic 回答 |
|----------|----------------|
| schema 臃肿 | Tool Search 减少 85% |
| 不可组合 | 程序化调用，让 Agent 写代码处理 |
| token 贵 | 代码编排模式（Cloudflare 2 工具覆盖 2500 端点） |
### 发展图景
```
本地开发环境 → CLI + Skills（轻量、快速、上下文干净）
云端生产环境 → MCP + Skills（标准化、跨平台、认证完备）
简单场景     → 直连 API（别瞎折腾）
```
**MCP 没有死**：它并非万能方案，但正在成为**云端 Agent 的标准化接入层**。
---
## 相关链接
- Anthropic 博客原文：https://claude.com/blog/building-agents-that-reach-production-systems-with-mcp