---
title: "淘宝百亿补贴数据分析助手 Agent 实战：NL2MDL2SQL + 多Agent协同 + 六层知识体系"
source_url: "https://mp.weixin.qq.com/s/BpsscOnYq-DWsb_DrID8hA"
author: "伯略"
publisher: "大淘宝技术"
published: 2026-09-04
ingested: 2026-09-04
language: zh
type: raw-article
sha256: e08311d12ab75754d5ee5114f83ea68b317f22b53e143709e541d558c4be3942
---

# 淘宝百亿补贴数据分析助手 Agent 实战

## 项目概述

bybt-data-analysis-assistant 是一个数据分析智能体——用自然语言提问，它自主完成从找表、写 SQL、执行查询到深度分析的全流程（NL2SQL取数、波动归因、血缘溯源、Python分析）。核心是多 Agent 协同架构，通过意图识别、调度路由和 ReAct 推理循环实现智能决策，摒弃简单 Text-to-SQL，创新采用 **NL2MDL2SQL 路径**确保 SQL 生成准确性和口径统一。系统构建**六层知识体系**，从表结构到会话记忆分层管理，结合 WrenAI 语义层和 Hologres 加速查询，实现找表、写SQL、执行到深度分析的全流程自动化。

## 技术架构全景

### 架构全景图
- **意图识别层**：Intent Agent，LLM 单次调用 → JSON 意图参数包（意图分类+时间解析+指标识别+维度推断）
- **调度路由层**：Supervisor，日期注入+语义计划+记忆召回 → 分发到专家 Agent（Query取数/Analysis分析/Ops运维/Other兜底）
- **保障层**：SQL Validator Gate 后置校验 + 答案净化 + SQL 自动暂存 + SSE 流式输出
- **知识底座**：MDL 语义层(WrenAI) + SQL片段库/规则库/会话记忆(TisPlus3) + 血缘图谱(LightRAG)

技术栈设计要点：不同环节用不同规格的模型——重活用 qwen-plus，轻活用 qwen-turbo，控制成本和延迟。

### 设计决策
- 为什么不用单 Agent：单 Agent 需要巨大 system prompt + 几十个工具，导致工具选择困难、prompt 膨胀、调用预算浪费。多 Agent 让每个专家只看自己相关的工具和指令。
- 为什么用 ReAct 而非固定流程：ReAct 让 Agent 自主决定调什么工具、传什么参数、什么时候收敛。

## Agent 架构设计

### 意图识别（入口层）
先用一次 LLM 调用解析标准化参数包：`{"intent_type":"attribution","confidence":0.95,"metric_field":"gmv_amt","time_label":"昨天 vs 前天","curr":"2026-06-14","prev":"2026-06-13","scope":"all"}`。降级策略：LLM 调用失败自动回退关键词匹配+规则解析。多意图检测：主意图放 intent_type，次要意图放 secondary_intents 数组。

### 多 Agent 协同（调度层）
Supervisor 根据意图识别结果分发到对应专家 Agent。

### ReAct 推理循环（执行层）
以「昨天 GMV 和前天比怎么样」为例：Thought1 找 GMV 表 → search_metrics → ads_flow_sum_di,gmv_amt；Thought2 查 SQL 规则确认口径 → rule_search → 须加 WHERE activity_type=''；Thought3 build_sql；Thought4 odps_query → 环比-20%；Thought5 python_analyze → 家电行业影响；Final Answer。

### 安全守卫（保障层）
Agent 有「刹车系统」（Harness）防失控。所有 Agent 生成的 SQL 经 SQL Validator Gate 后置校验（语法正确、表名存在、字段合法）。

## NL2MDL2SQL：从自然语言到正确 SQL

### 为什么不直接 Text-to-SQL
直接让 LLM 写 SQL 三个致命问题：幻觉字段（编造不存在的列名）、口径错误（不知道某表 WHERE 条件该加什么）、不可复用（每次从零生成无沉淀）。LLM 不知道 ads_bybt_flow_sum_di 表必须有 activity_type='百亿补贴' 这个 WHERE。

### WrenAI MDL 语义层
MDL（Model Definition Language）类似 dbt 语义建模层：mdl.json（模型定义文件：表名/字段/关系/描述）、dry_plan（NL→SQL 预演）、recall（查询历史召回）、fetch_context（上下文召回给 LLM 补表结构）。生成 SQL 经语义层校验：字段存在、口径正确、可复用。

### MDL 模型结构
mdl.json 定义每个表结构化语义：`{"models":[{"name":"ads_flow_sum_di","columns":[{"name":"gmv_amt","type":"decimal","expression":"pay_amt"}]}]}`。Agent 生成 SQL 前先从 MDL 获取表结构确保只用真实字段。

### Hologres 外部表加速
数据分析场景多次递归下钻，每次 ODPS 执行 30-120 秒，5-10 次 SQL 可超 10 分钟。引入 Hologres 外部表直读 ODPS，单次查询加速到 **3-10 秒**。选外部表而非全量同步：不需 DBA 介入、onboard 自动挂载、首次自动创建外联表、后续 LRU 缓存命中。场景闸门仅对 stream_analysis 生效。执行链路：变量替换→黑名单检测→sqlglot 抽表名→按需创建外部表（IMPORTFOREIGNSCHEMA LIMITTO）→sqlglot 方言转换→aistudio 网关执行→失败 fallback ODPS。切库自愈：检测 relation does not exist 错误→清 IMPort 缓存→重新 ensure→重试一次。

## 知识库体系

### 六层存储体系
- Layer 1: 表能力清单 + MDL 语义模型
- Layer 2: SQL 片段库 (Snippet Store)
- Layer 3: SQL 规则库 (Rule Store)
- Layer 4: 血缘知识图谱 (LightRAG KG) + AST 实时解析
- Layer 5: 指标注册表 (Metric Registry)
- Layer 6: 会话记忆 (Session Memory)

### AST 血缘解析引擎
基于 sqlglot 的 SQL 静态分析管线，从 ETL 源代码自动提取字段级血缘。六阶段：Phase0 Schema Registry→Phase1 预处理（全角标准化/DDL剥离/变量替换）→Phase2 AST标准化（展开 SELECT*）→Phase3 节点提取（DFS，CTE/子查询/UNION分支）→Phase4 作用域解析（符号表+alias消歧）→Phase5 血缘映射（direct/computed/aggregated 三类边）→Phase6 输出构建JSON。实时解析降级链：lightrag_column_logic → dw_get_table_source（取ETL源码）→ parse_sql_lineage（AST实时解析）。回归测试覆盖**45 张真实表、296 个节点**。

### 指标注册体系
指标注册表是波动归因诊断核心知识源，定义每个业务指标如何拆解（声明式配置，Web 向导接入）。三种公式类型。MetricDef 结构以 GMV 为例：formula_type=multiplicative，factors=[IPVUV/CVR(ratio:ord_cnt/ipv_uv)/AOV(ratio:pay_amt/ord_cnt)]。**乘法型恒等式铁律**：因子相乘后约分必须恰好等于 total_col（GMV=ipv_uv×(ord_cnt/ipv_uv)×(pay_amt/ord_cnt)=pay_amt）。维度按两个正交轴分类（perspective/axis）。AI 辅助接入：选 MDL 表→AI 生成 MetricDef→预览校验恒等式→确认入库→自动同步。容错：perspective/axis 混淆自动修正、Pydantic 校验、ROLLUP/CUBE 结构辅助。

### 知识在 ReAct 中的使用
Agent 思考「用户问 GMV 找表」→ search_metrics(Layer5指标定义) → cap_search(Layer1能力清单) → snippet_search(Layer2模板) → rule_search(Layer3规则) → lightrag_table_lineage(Layer4 KG血缘) → parse_sql_lineage(Layer4 AST实时)。

### 采集与治理闭环
采集入口（AST血缘解析/对话产出SQL/指标接入向导）→ 沉淀（LightRAG KG/Staging队列/metrics.yaml）→ 人工审核（Web平台）→ 入库复用（下次优先命中）。表结构变更自动 regenerate。

## 分析能力深度解析

### 波动归因诊断（Analysis Agent）
「昨天 GMV 为什么跌了20%」→ 构建诊断树：GMV=访客数×转化率×客单价 → 转化率-22%主因 → 按行业拆家电-45% → 家电下单量-40%主因。技术实现五步法。

### 血缘溯源
路径1: 查 LightRAG 知识图谱。路径2: KG 未命中时 AST 实时解析 ETL 源代码。

### Python 数据分析沙箱
查询结果二次加工（帕累托/排名/透视/环比）调 python_analyze，沙箱内执行，带安全模型。

## 系统构建与部署

### 新表接入流程（Onboard）五步
1. 表结构同步（ODPS schema→mdl.json+TisPlus3）2. 表类型探查（A预聚合/B普通+主键+维度）3. 规则抽取（下游血缘代码→LLM 提取 WHERE）4. SQL 模板生成（B类表自动标准模板）5. 入库（规则/片段/能力清单写入 TisPlus3）。

### 项目结构
agent.py(CLI入口) / agents/(supervisor/intent_agent/base_expert/query_agent/analysis_agent/ops_agent/other_agent/harness/sql_validator_gate) / tools/(odps/capabilities/snippets/rules/lineage/analysis/attribution/dataworks/memory/intent) / web/(FastAPI+React) / wren_project/(mdl.json)。

## 评测体系

### 6D 评分维度
6 个维度每次回答打分，每维度 0-100：D1 factor / D2 tree / D3 tool / D4 conclusion(LLM-as-Judge Rubric) / D5 sql / D6 faithfulness。

### 意图感知权重
不同意图关注点不同（归因不关心 SQL 正确性 D5=0，取数不关心因子命中 D1=0）。为每个意图配置差异化权重，权重为0显示"--"不参与打分，Web 界面自定义。

### Golden Dataset 样例构造
当前覆盖 6 类意图、15 用例。expected 多层校验：不只看最终回答还看中间过程（工具调用序列/SQL内容/诊断树结构）；main_factor_fuzzy 模糊匹配脱底；每类意图≥2用例覆盖错误输入；Web 评测中心在线增删。

### 评测执行流程
harness.run_case → 收集 SSE 事件流 → EvalTrace(events/tool_calls/diagnosis_tree/final_answer/nodes) → 6D打分 → 加权总分=Σ(Di×Wi) → 报告输出（终端/JSON/Bad Case 归档总分<60 或任一维度=0/版本对比--compare）。

### 节点级归因诊断
不只给分数，还自动定位失败根因：从事件流提取 7 关键节点状态。总分低于预期时指出哪个节点出问题：`gate - validation_exhausted(重试3次未通过)` / `tool_call - 工具返回错误 odps_query` / `quality - 各节点成功但回答质量未达预期`。

## 团队
本文作者伯略，来自淘天集团-天猫技术团队。百亿补贴与聚划算是淘天面向价格敏感用户与品牌商家的核心营销阵地，是直面市场竞争最前沿的"主战场"，是淘天近三年增长最快的业务。用 AI 重构从招商审核到补贴发放的运营全流程，推动"人工配置"向"AI 自治"演进。