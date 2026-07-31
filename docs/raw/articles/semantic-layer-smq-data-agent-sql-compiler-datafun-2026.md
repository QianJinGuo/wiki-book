---
title: "Semantic Layer 还不够，Data Agent 到 SQL 之间为什么还缺一层？"
source_url: "https://mp.weixin.qq.com/s/nxR-JdAdNneBnm_MA0m5mA"
source_site: "mp.weixin.qq.com"
source_account: "DataFun"
author: "DataFun"
ingested: 2026-07-31
sha256: "d55f0dc6533a2f898156a8d0ffcd1257c4c0d8905f55c916452b18d71dfa9165"
type: raw-article
tags: [nl2sql, semantic-layer, data-agent, smq, compiler, spider2]
---

# Semantic Layer 还不够，Data Agent 到 SQL 之间为什么还缺一层？

> 导读：让大模型把自然语言直接转换成 SQL，是许多 Data Agent 最直观的设计。但企业 NL2SQL 真正困难的地方，不是让模型"会写 SQL"，而是让业务语言可靠地落到物理数据结构上。

## 核心论点

2026 年 6 月 30 日提交的 arXiv 预印本提出另一条路线：在大模型与数据库之间加入经过维护的 Semantic Layer，并设计 **Semantic Model Query（SMQ）** 作为业务意图与物理 SQL 之间的中间表示。系统使用 Gemini 3 Pro Preview，在 547 项 Spider2-snow 任务中正确完成 515 项，执行准确率 94.15%；截至 2026 年 7 月 31 日，榜单条目"QUVI-3 + Gemini-3-pro-preview"位列官方排行榜第三。

"不该直接写 SQL"不是让 Agent 完全退出 SQL 生成，而是不应再让它面对原始 Schema，一步猜出最终查询。真正值得讨论的是查询职责被重新拆分：**模型理解业务意图并完成长尾组合，Semantic Layer 提供受治理的业务映射，确定性编译器生成可验证的 SQL 构件。**

## 01 企业 NL2SQL 的难点：业务语义与物理 Schema 的落差

传统 NL2SQL 把数据库 Schema、字段描述和用户问题一起放进上下文，让模型直接生成最终 SQL。这要求模型同时完成三类不同性质的工作：理解用户真正想问什么，把业务概念绑定到物理表/字段/Join 路径，再完成 SQL 结构与数据库方言的编写。任何一个环节出错，错误都会沿同一条生成链放大。

Spider 2.0 正是为了模拟这种差距而设计：632 项来自企业数据场景的工作流任务，数据库经常超过 1000 列，部分环境超过 3000 列，任务可能需要多条查询以及超过 100 行的 SQL。面对这样的 Schema，模型缺少的不是正确的 SELECT 模板，而是一张稳定的业务地图。

企业 NL2SQL 的核心矛盾不是 SQL 语法能力不足，而是概率模型被迫直接承担了本应由数据建模和治理系统提供的 **Schema Grounding（模式对齐）**。只要业务含义、物理字段和连接规则仍散落在字段名、文档和人的经验中，换用更强模型只是在提高猜对的概率，并没有改变错误产生的结构。

## 02 新方法不是取消 SQL，而是用 SMQ 约束 Agent 探索

系统首先为每个数据库维护一组 Semantic Model。每张物理表被包装成具有业务名称的语义模型，并暴露 Dimension（维度）、Measure（度量）和 Metric（指标）等元素。每个元素同时包含供大模型理解的业务描述，以及供编译器使用的精确物理表达式。抽象业务名称与物理实现被明确分开。

跨模型的 Join 关系预先写入 **Join Graph**（连接关系图）。连接方向、连接键和连接谓词被结构化地管理，连接条件中还可以包含 TRIM 等清洗或转换表达式。编译器在遇到已声明关系时自动构造 Join。

Semantic Layer 在这里不只是供模型阅读的业务词典，也承担字段映射表、Join 规则库和查询编译上下文的职责。Agent 与这层语义资产交互时，不先对原始 Schema 写 SQL，而是生成一条紧凑的 SMQ。SMQ 主要由 metrics、filters 和 group_by 三类元素组成，表达"计算什么、筛选什么、按什么维度分组"。

示例：
```json
{
  "metrics": ["RetailAnalyticsSalesModel__orderedRevenue"],
  "filters": ["RetailAnalyticsSalesModel__period = 'DAILY'"],
  "group_by": ["RetailAnalyticsSalesModel__asin"]
}
```

确定性的 SMQ-to-SQL 引擎会解析元素背后的字段表达式，从 Join Graph 中注入连接条件，并生成目标方言的 SQL 和少量结果预览。相同的 SMQ 与相同的 Semantic Layer 定义应产生相同的编译结果。

论文采用 single-tool-per-step think-act loop：系统提供三个工具（读取语义模型数据元素、把 SMQ 编译成 SQL、执行最终 SQL），Agent 每轮只能调用其中一个，最终 SQL 执行是唯一的终止动作。系统禁止 Agent 查询 INFORMATION_SCHEMA，执行 SQL 中的物理标识符必须先出现在编译器返回的 SQL 中。所有 Schema Grounding 都被迫经过语义层，模型不能绕过它重新猜测。

SMQ 只覆盖选择、过滤、分组和已声明 Join 等常见分析核心，无法完整表达任意子查询、高级窗口函数、CROSS JOIN 或递归 CTE。面对长尾复杂任务，Agent 仍会读取编译器给出的可靠 SQL 构件，在其上增加 CTE、窗口函数和嵌套逻辑，组合最终查询。系统没有消灭模型生成，而是把最容易反复出错的字段映射、基础 Join 和方言适配迁移到确定性系统中。

## 03 94.15% 背后，真正值钱的是被维护的语义资产

**评测口径校准**：Spider2-snow 的 547 项任务全部托管并执行在 Snowflake 上；SQLite-origin、GA4-origin、BigQuery-origin 和 Native Snowflake 只是任务的原始数据库来源类别，并不意味着系统分别在三个执行环境都取得 94.15%。评测框架支持多后端路由，但核心成绩来自全量 Snowflake 执行的 Spider2-snow。Native Snowflake 仅 18 个样本，只完成 10/18，结果方差较高。

这个数字不能被简化为"加一层 Semantic Layer，准确率就能达到 94%"。实验使用 Gemini 3 Pro Preview，温度 0.1，开启高等级 Extended Thinking，输出预算 16384 Token，允许每项任务最多 20 轮 SMQ 迭代。每个数据库还配有人工维护的 Semantic Model、字段表达式和 Join Graph。结果反映的是"强推理模型 + 受约束 Agent 循环 + 手工语义层 + 确定性编译器"的整体能力。论文没有提供同模型、同推理预算下移除 Semantic Layer 的控制实验，无法准确拆出各组件分别贡献的增益。

剩余错误说明语义层不是万能答案：Semantic Model 没有暴露必要字段，Join Graph 缺少所需关系导致编译失败，Agent 在自行组合复杂 SQL 时处理错嵌套时间窗口、排名或舍入语义。SMQ 本身只覆盖常见分析核心，长尾结构仍需 Agent 完成。

94.15% 回答了"能不能做到"，却还没有回答"以什么成本做到"。论文没有披露单任务平均 Token 消耗、平均工具调用轮数、端到端延迟，以及 Semantic Model 和 Join Graph 的建设人力。

不过这套架构至少改变了问题的维护方式：过去查询失败后团队往往修改 Prompt、增加示例或重试；现在相当一部分错误被转化为字段没有建模、指标表达式不清、Join 边缺失或编译器能力不足。这些问题仍然需要投入，却可以像代码一样接受 Review、版本管理和回归测试。

论文还主动讨论了 Goodhart 式风险：如果维护者不断针对 Benchmark 补充越来越详细的描述、Join 路径和计算规则，Semantic Layer 可能逐渐从通用业务知识变成"把答案提前写进上下文"的提示仓库。**Semantic Layer 不是免费的准确率，它只是把不可审查的模型错误，转换成可审查但必须长期维护的语义工程。**

## 04 Semantic Layer 正在成为 Data Agent 的编译基础设施

传统 Semantic Layer 主要服务于 BI，解决不同报表对同一指标口径不一致的问题。Agent 到来之后，这层资产需要回答更多问题：不仅要告诉系统"收入是什么意思"，还要说明收入对应哪些物理表达式、允许连接哪些表，以及一项业务意图能够被转换成哪些可执行查询构件。

Semantic Layer 承担两类基础职责：一是作为**业务词典**，保存指标、维度和实体的含义；二是作为 **Schema 映射层**，把业务概念绑定到表、字段和 Join 关系。它再与 SMQ 这一中间表示、SMQ-to-SQL 确定性编译器组合，形成面向 Data Agent 的查询编译基础设施——本文称作"业务编译器"，强调它开始承担类似编译器前端、符号表和中间表示层的职责。

核心启示：**重新划分概率模型与确定性系统的边界**——模糊意图、任务规划和长尾组合交给模型；字段映射、Join 规则、指标表达式和方言转换尽可能交给可验证的程序。能被稳定建模的知识，不必让模型每次重新推理；能由编译器生成的 SQL 构件，不必依赖 Agent 临场猜测；能被版本管理的业务口径，也不应该只存在于 Prompt 中。

Data Agent 的准确率问题，可能不应该继续靠扩大模型自由度解决，而应该靠**缩小模型自由度**解决。

未来企业 Data Agent 更可能形成分层架构：LLM 负责自然语言理解、澄清和规划，Semantic Layer 管理指标、实体、维度、关系和权限，编译层把结构化意图转换成 SQL 或其他执行计划，数据库和 Lakehouse 负责执行，验证层再检查结果、成本、数据质量与业务约束。

Data Agent 不会简单取代 BI 和 Semantic Layer。恰恰相反，Agent 可以访问的数据越多、生成的查询越复杂，企业就越需要一层稳定、受治理、可编译的业务语义系统。过去，Semantic Layer 负责告诉人和 BI 工具数据是什么意思；现在，它开始与中间表示和确定性编译器一起，告诉 Agent 一项业务意图应该如何被编译和执行。
