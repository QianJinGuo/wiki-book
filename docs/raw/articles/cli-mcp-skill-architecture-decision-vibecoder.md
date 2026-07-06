---
title: "CLI、MCP 和 CLI+Skill，应该如何选？"
source: wechat
source_url: https://mp.weixin.qq.com/s/cijQOCOZQMcbldyAmQ8CZA
author: VibeCoder
feed_name: Vibe编码
review_value: 8
review_confidence: 8
review_recommendation: strong
review_stars: 4
date: 2026-05-27
created: 2026-05-28
updated: 2026-05-28
tags: [mcp, cli, skill, agent, tool, enterprise, architecture, governance, context-management]
type: article
provenance_state: synthesized
sha256: 2d94a9620caea6d9e62d0f6941eebbfa2301fcd1bc65987cddc8b31d63bc3c88
---

# CLI、MCP 和 CLI+Skill，应该如何选？

> **来源**：Vibe编码（VibeCoder），2026年5月27日
> **背景**：企业内部平台和 Agent 对接时，如何在 CLI、MCP 和 CLI+Skill 之间做架构选择。

## 三个东西不是一层

| 概念 | 关注点 | 作用 |
|------|--------|------|
| **MCP** | 能力接入协议 | 外部系统怎么被 Agent 发现、授权、调用和审计 |
| **CLI** | 执行接口 | 在某个运行环境里把事情做掉（gh、kubectl、aws） |
| **Skill** | 工作流封装 | Agent 应该什么时候用工具、按什么顺序用、失败时怎么处理、做到什么算完成 |

**更准确的组合**：Skill 写方法，MCP 管边界，CLI 做执行。

## CLI+Skill 的优势在上下文

CLI 最大的优点：**默认不占上下文**。

Agent 不需要一开始就知道所有参数。需要的时候跑一下 `--help`，输出太长用 `jq`、`rg`、`head`、`tail` 过滤。中间数据太多就写到文件里，只回传摘要。

非常适合本地开发：读文件、搜代码、跑测试、看 diff、提交 patch，这些动作都有成熟 CLI。包装成 MCP tool 收益不一定高，还多一层维护成本。

## MCP 的问题是 tools tax

MCP 的朴素接法很容易把工具说明塞爆上下文。

企业里一旦接几十个 server、几百个工具，模型上下文很快被工具目录吃掉，工具越多选错工具的概率也上升。

**解决方案**：progressive tool discovery。Host 先连接 server，但不要把所有工具 schema 一次性注入模型，只给模型一个轻量的 `search_tools`。模型先搜相关工具，命中后再加载具体 schema。

## CLI 能做企业治理，但成本会长出来

CLI 可以加 OAuth、审批、日志、限流、sandbox、allowlist——但这会把它自己变成一个 execution platform。

问题是边界：如果 Agent 有自由 shell，它可能直接读本地凭据、curl 内网、调用数据库命令。需要靠沙箱和网络策略限制它。

MCP 的边界更靠前：Agent 看到的是少量可调用工具，server 侧处理 OAuth、RBAC、审计、配额和审批。Agent 拿不到原始 token，也不需要知道底层系统的所有 API 细节。

## 决策矩阵

| 问题 | 选择 |
|------|------|
| 只在本地开发环境使用？ | CLI+Skill 先跑起来 |
| 要给多个 Agent/客户端/模型复用？ | MCP 更合适 |
| 涉及生产数据、审批、审计、配额？ | 至少需要 MCP-like gateway |
| 工具数量很多？ | 需要 tool search 和分层加载 |
| 产生大量中间数据？ | 脚本/server 在模型外处理，只回传摘要 |

## 企业内部推荐架构（三层）

**最外层是 Skill**：放流程和经验——如何排查线上告警，如何做发布前检查，如何写事故复盘，如何判断操作需要审批。

**中间层是 MCP Gateway**：放工具发现、权限、审计、配额、审批和版本治理。Agent 不直接碰所有内部系统，只通过少量高层工具表达意图。

**底层是已有系统**：内部 API、数据库、消息队列、CLI、工单系统、监控系统。MCP server 只是把它们包装成适合 Agent 使用的能力。

**工具粒度要克制**：不要把内部 REST API 原样变成几百个 MCP tools。更好的做法是暴露高层意图工具：`search_recent_incidents`、`request_production_change`、`summarize_customer_impact`、`propose_safe_rollout_plan`。

## 上线顺序

1. **先用 CLI+Skill 跑通**：三到五个高频工作流（PR review、失败测试定位、K8s 只读排查、日志摘要、发布前 checklist）
2. **跑通后再评估**：哪些被多个团队反复使用，哪些涉及权限和审计，哪些需要跨客户端
3. **只有这些能力值得提升成 MCP**，同时加 tool search 或 namespace 分组
4. **保留 CLI**：很多 MCP server 的内部实现可以继续调用已有 CLI

## 一句话总结

小团队先用 CLI+Skill 跑通，大组织用 MCP 建契约。两者一起用，效果最好。

---

*本文为 Vibe编码 原创文章*
