---
title: Kimi K2.6背后的Agent Database：Agent-native 时代的数据Infra竞争，跟过去30年有何不同
source_url: https://mp.weixin.qq.com/s/XLYWhkjFHxrH2-jb5O1qCQ
publish_date: 2026-05-13
tags: [wechat, article, agent, rag, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: a533496f12167286e425f93dbb9fa704c5493fd6cb0d0c3306ef882e80b1548d
---
# Kimi K2.6背后的Agent Database：Agent-native 时代的数据Infra竞争，跟过去30年有何不同
作者：黄东旭（PingCAP/TiDB）| 来源：InfoQ | 2026-05-13
## 背景
黄东旭前几篇文章（如何做 AI Agent 喜欢的基础软件、当我们在谈论 Agent Infra 时我们在谈论什么）提出了一些猜想，本文是这些理论的大规模落地验证——TiDB Cloud 正式成为 Kimi K2.6 的供应商，为 Kimi Agent 建站服务提供动态大规模的 Agent Database 支持。
## Kimi K2.6 Agent 建站场景
最典型的 End-to-End 在线应用构建场景：Agent 帮助人类生成代码，形成真实可用的在线服务，用户无需任何技术背景。
与 Loveable 等其他 AI 建站应用的区别：Kimi K2.6 从前端到后端完全接管/托管。
核心挑战：不在于代码生成，而在于 **hosting 的成本**。
### 为什么 hosting 成本是关键
- 受众变大（无技术门槛）→ 用户量激增
- 大多数 AI 模板服务按月订阅，重度 Token 消耗用户的算力成本往往超过订阅费
- 但网站托管/一次性生成代码并持续在线服务的场景：算力消耗集中在创建那几下，服务运行后按月收费，基础设施成本（Web 服务器、带宽、数据库）利润空间更大
主要挑战：**一周内可能上千万个站点被创建出来**，按传统云服务或数据库定价，为每个网站提供一个真实 Postgres/RDS 实例 → 成本爆炸。
## 为什么选 TiDB 而不是 NeonDB/Supabase
**Supabase 模式问题**：每个 Agent 配一个 Supabase PostgreSQL，上百万个实例 → 成本直接爆炸。
**PostgreSQL 多 Schema 隔离问题**：单个实例在万级规模时扛不住，更不用说流控、故障半径控制和数据隔离。
核心原因：**成本**。Agent-native 场景需要完全不同的架构思路。
## Agent-native 时代的数据 Infra 竞争逻辑
过去 30 年：比单点性能（谁的 TPS 高、谁的延迟低、谁支持更大的单库容量）。
现在比的是当以下四件事**同时发生时**，谁能提供最顺畅的体验：
1. **海量长尾租户**：尽管请求量不大，但全都要求在线
2. **LLM 即席改 Schema**：必须支持分支和多版本
3. **无法预测的突发流量**
4. **AI 在秒级别随时动态创建/销毁**，以及动态生成访问的 SQL
这是完全不一样的赛道。
## 三个核心战略决策
### 1. 最小化 Agent 使用 Infra 工具时的摩擦
每个任务和站点独立隔离，由 Agent 创建和使用，用的时候能秒级创建。
TiDB Cloud 的 **Warm Pool + Scale-To-Zero**，让 Agent 在 **1 秒内**拿到 fully prepared 的数据库实例。
如果数据库 provisioning 占去几分钟，Agent 就得在自己代码里写 retry/poll/wait → 这个负担不该由 Agent 来扛。
### 2. 对 Agent 生成服务所使用的技术栈尽可能统一
人类工程师觉得方便，对 LLM 来说直接关系到生成代码的成功率。
少跨一个系统就少一类 bug，多用 Skill 中写好的技术栈和最佳实践，而不是每次靠思考和抽卡，大大提升了生成代码变成服务的稳定性。
### 3. 极致的低成本
放弃 Supabase 和 Neon 那样的真实数据库实例分配和管理，TiDB 引入了一层**虚拟数据库界面**。
大量请求是长尾的——没有请求时，不需要真实分配数据库实例，只需让 Agent/终端用户"假装"后端是一个独立数据库。最极端情况下，整个平台只需要一个常驻的 DB Session Gateway 服务维持数据库连接，其他所有资源都可以变成弹性的。
物理层面：数据由底层封装了对象存储的分布式 KV 数据库提供存储服务，逻辑层面自动处理数据可见性隔离和冷热分离。
Agent 层面不会有实例被回收、休眠或连接中断等不好的体验。
**效果**：整个数据库平台的弹性能力提升一个台阶，数据使用成本数量级规模下降。
## 传统 Serverless vs TiDB Cloud 架构对比
**传统 Serverless 数据库**（面对 Agent 场景）：
- 每个 Sandbox 分配一个真实数据库实例
- 冷却时被回收，难保证 7×24 永远在线
- 数量大了成本难控制（想象几千万个 Supabase 实例）
**TiDB Cloud 架构**：
- 无真实数据库实例，一切都是虚拟的
- 对 Sandbox 中的 Agent 来说，仍然拥有一个个完整的独立数据库
- 底层大型分布式 KV 数据库逻辑层面自动处理隔离和冷热分离
- Agent 体验：无回收、无休眠、无连接中断
## 行业收敛：one agent, one sandbox, one storage, one database
过去 12 个月陪跑国内外很多 AI Agent 团队基建选型后发现：
- 以前模式：一个产品扛亿级用户，一个 app 扛亿级会话
- 现在模式：一个用户身边可能有 **10 个甚至 100 个 Agent** 在跑，每个都需要自己的状态和数据
包括 Kimi 在内的 AI Agent 商业化团队采用的架构都收敛到同一个范式：
> **one agent, one sandbox，one storage，one database**
## 上半场 vs 下半场
**上半场**：谁的模型更聪明、谁的 Agent 推理更长。
**下半场**：竞争的核心是——Agent 交付出来的结果，在真实用户面前能不能稳定跑起来、持续交付。
Kimi 和 TiDB 的合作是模型厂商通过好的基础设施服务、快速高效提供更多价值的绝佳例子。
---
来源：InfoQ 黄东旭（PingCAP/TiDB）
https://mp.weixin.qq.com/s/XLYWhkjFHxrH2-jb5O1qCQ