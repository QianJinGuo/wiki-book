---
title: "给 Agent 加上知识图谱，开源版 Palantir：Semantica 语义/上下文层"
source_url: "https://mp.weixin.qq.com/s/bHRmjivvmNSWAN5bu3ZnEQ"
ingested: "2026-09-04"
sha256: e085b9993880204fb41b925dc2449e80fc31ee104fea6d8526c32e0b3baa5a8b
type: raw
---

# 给 Agent 加上知识图谱，开源版 Palantir：Semantica 语义/上下文层

> 来源：GitHubStore（小G）。Semantica 是 LLM、向量库与 Agent 框架之下的语义/上下文层——一套确定性基础设施（构图、推理、溯源均不必依赖 LLM），把碎片化企业数据变成结构化、可查询的上下文图与知识图谱，由本体与受控词表（OWL、SHACL、SKOS）治理。面向受监管企业，主打决策溯源与审计轨迹。GitHub: github.com/semantica-agi/semantica。

## 项目简介

多数 AI Agent 跑在嵌入向量上而不是意义上：只有相似度分数，没有结构、没有关系、无法解释结果从何而来。Semantica 是 LLM/向量库/Agent 框架之下的语义/上下文层：确定性基础设施（构图、推理、溯源均不必依赖 LLM），把碎片化企业数据变成结构化、可查询的上下文图与知识图谱，由本体与受控词表（OWL、SHACL、SKOS）治理，让数据含义被显式表达而不只是嵌入。决策溯源与审计轨迹是这种结构带来的属性而非单独卖点；在监管可能追问的领域，同一套结构直接回答「为什么」。

面向：AI/ML 平台团队（上线做重要决策的 Agent）、Databricks/Snowflake 数据平台团队（把表变成受治理带血缘的 KG）、合规/风控/审计团队（需要被监管接受的「AI 为什么这么做」直白答案）、受监管企业（金融/医疗/法律/政府/国防，不能交黑盒也不能送 SaaS）、平台/基础设施工程师（可自托管可替换不被锁死）、数据与知识工程师（多源脏数据建 KG，冲突标记而非静默覆盖）。

## Semantica 能做

- **上下文图**：对 Agent 所知、所决、所推理的一切形成结构化可查询的图。
- **决策智能**：每个决策是一等对象，可追溯、可按先例检索、有因果关联。
- **AI 治理与本体**：SHACL 约束、冲突检测、合规规则、OWL 生成、SKOS 词表管理、可视化编辑器。
- **完整可审计性**：每条事实带 W3C PROV-O 溯源，审计轨迹导出 JSON/CSV/RDF。
- **确定性推理**：前向链、Rete 网络、Datalog 与 SPARQL，路径完全可解释非黑盒。
- **知识流水线**：多源接入、实体感知分块、NER/关系/事件抽取、KG 构建，语义去重+保留溯源合并。
- **企业数据平台**：Databricks（Unity Catalog+Delta Lake，PAT/OAuth M2M，目录/模式/表/血缘探查）与 Snowflake（仓库/库/模式，密钥对+OAuth）原生连接器，湖仓/数仓表直接成带溯源图节点。
- **图分析**：中心性、社区发现、链路预测、最短路径。
- **多语言图存储**：原生 RDF（嵌入式 Oxigraph、Blazegraph、Apache Jena、Eclipse RDF4J，SPARQL）与属性图 LPG（Neo4j、FalkorDB、Apache AGE、AWS Neptune，Cypher）+向量库，切换存储不改业务代码。
- **可视化**：交互式浏览器工作台探索图/本体/时间线。
- **即插即用集成**：原生 Agno、CrewAI、LangChain，完整 MCP 服务器，CLI、REST API、主流编辑器插件。

## 对比表格

| 维度 | 向量库+RAG | 普通 LLM 记忆 | Semantica |
|------|-----------|--------------|-----------|
| 召回方式 | 嵌入相似度 | Token 窗口 | 图遍历 + 语义检索 |
| 决策历史 | 不存储 | 不存储 | 一等、可查询对象 |
| 溯源 | 无 | 无 | W3C PROV-O，关联来源 |
| 推理 | 无 | 黑盒 | 前向链、Rete、Datalog、SPARQL |
| 冲突检测 | 静默覆盖 | 静默覆盖 | 检测、标记、解决 |
| 时间旅行 | 无 | 无 | 任意时点图快照 |
| 合规导出 | 无 | 无 | PROV-O、SHACL、OWL、RDF |
| 策略执行 | 无 | 无 | 内置规则引擎 + SHACL |
| 实体解析 | 无 | 无 | Blocking + 语义去重 |
| 多智能体上下文 | 各 Agent 隔离 | 各 Agent 隔离 | 单一共享智能层 |

## 快速开始

```
pip install semantica
from semantica.context import ContextGraph
graph = ContextGraph(advanced_analytics=True)
decision_id = graph.record_decision(
    category="vendor_selection", scenario="Choose cloud provider for HIPAA workload",
    reasoning="AWS offers BAA, mature HIPAA tooling, and existing team expertise",
    outcome="selected_aws", confidence=0.93)
chain     = graph.trace_decision_chain(decision_id)      # 完整因果祖先
similar   = graph.find_similar_decisions("cloud vendor", max_results=5)
impact    = graph.analyze_decision_impact(decision_id)   # 下游影响
compliant = graph.check_decision_rules({"category":"vendor_selection"})  # 策略 gate
# 5 秒验证: semantica doctor
```

Semantica 补全现有栈而非替换：LLM、向量库、Agent 框架原样保留，在其上增加决策记录、因果推理、溯源、本体治理、冲突检测与审计轨迹。推理引擎、KG 构建与溯源层完全确定性，不必调用 LLM。

## 架构

端到端流水线（各阶段是已发布、可独立导入的模块）：来源 → 接入 → 解析 → 规范化 → 分块 → 抽取 → 冲突检测 → 去重 → 知识图谱 → [本体·推理·溯源·决策] → 富化 KG → 向量库+多语言图存储（RDF 与 LPG）→ 导出/可视化/REST·MCP·CLI。接入：文件/网页/数据库/企业平台（Databricks、Snowflake）/云（Google Drive、Elasticsearch）/流（Kafka、Kinesis）/Git/邮件/MCP。存储原生多语言（RDF 三元组库 + 属性图 + 向量库，切换不改代码）。输出：RDF/OWL/Parquet/Cypher/JSON-LD + 交互可视化 + REST API/MCP 服务器/CLI。

## 决策智能

把每次 AI 选择从短暂推理变成永久、可审计、可查询的记录，回答「你的 AI 决定了什么、为什么、随后发生了什么」。决策不是一行日志而是一等图节点，在受监管领域每个决策能追溯到来源、能向审计师辩护（导出 W3C PROV-O）。API：record_decision（创建永久结构化图节点）、add_causal_relationship（关联上游原因/下游效应，类型须为 CAUSED/INFLUENCED/PRECEDENT_FOR）、find_similar_decisions（语义先例检索）、trace_decision_chain（追溯到根因的因果链）、analyze_decision_impact（下游影响图）、check_decision_rules（对照可配置规则集的策略合规门控）、export/audit trail（W3C PROV-O/CSV/JSON 供监管提交）。

## CLI 与集成

pip install semantica 后可用：semantica（启动仪表盘）、semantica doctor（健康检查）、semantica-explorer（仪表盘于 http://127.0.0.1:8000）。命令组：ingest/parse/extract/kg/reason/decision/temporal/provenance/ontology/embed/deduplicate/validate/export/visualize/pipeline/server/explorer/mcp/doctor/shell/init/watch。集成为 Claude Code、Cursor、Codex、Windsurf、Cline、Continue、VS Code、OpenClaw 原生插件包；MCP 客户端完整服务器；REST API；Agno/CrewAI/LangChain 一等支持；经 REST/MCP 兼容 LangGraph、LlamaIndex、AutoGen、OpenAI Agents、Google ADK。

项目地址：https://github.com/semantica-agi/semantica