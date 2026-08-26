# Agent 可观测体系五层架构

## Ch04.590 Agent 可观测体系五层架构

> 📊 Level ⭐⭐ | 6.3KB | `entities/agent-observability-5-layer-architecture.md`

# Agent 可观测体系五层架构

## 摘要

Agent 生产环境可观测性五层体系：遥测采集 → 数据处理 → 评测引擎 → 数据存储 → 可视化消费。核心挑战是评测基准漂移——LLM-as-a-Judge 随模型变化而不一致，单一指标优化可能伤害另一维度。

## Agent 生产翻车的三类典型问题

1. **工具调用失控** — 突然乱调用不该调的工具
2. **回答错位** — 用户问 A 回答 B，难以区分是 RAG 召回失败还是模型幻觉
3. **成本黑洞** — 成本暴涨，不知道哪个子 Agent 在烧钱

根本原因：缺乏观测 + 评测 + 治理的闭环体系。

## 五层架构

### 1️⃣ 运行层 + 遥测采集层

Agent 不是普通服务，每一次推理、工具调用、检索、子 Agent 协作都需被**无侵入地采集**。核心要求：Agent 框架本身应内置遥测埋点，而非事后打补丁。

### 2️⃣ 数据处理管道

原始 trace 中包含三类污染源，必须过滤：

- 用户隐私（手机号、地址）→ 脱敏
- 模型返回的杂乱内容 → 清洗
- 工具返回的冗余 JSON → 聚合

处理后的数据才能流入评测和存储层。

### 3️⃣ 评测层 + 评测引擎

引入**生产环境自动评测 + LLM-as-a-Judge**。五维评分体系：

| 维度 | 检测目标 | 说明 |
|------|---------|------|
| 正确性 | 答案对错 | 事实性判断 |
| 相关性 | 是否胡扯 | 回答与问题的匹配度 |
| 幻觉检测 | 事实冲突 | 模型编造的信息 |
| 工具选择 | 工具使用是否合理 | 该用计算器却问了 LLM |
| 计划质量 | 多步任务是否走偏 | 任务分解与执行路径 |

### 4️⃣ 数据存储与处理层

| 数据类型 | 存储方案 | 选型原因 |
|---------|---------|---------|
| Trace | **ClickHouse** | 写入快、按 trace_id 点查快 |
| 日志 | **Loki** | 便宜，与 Prometheus 生态一体 |
| 向量 | **Vector DB** | 用于追溯检索片段 |
| 评测结果 | **PostgreSQL** | 支持 score + model_name + version 复合索引 |

> 选错存储方案的代价：查一次 Trace 要 3 分钟。

### 5️⃣ 可视化与消费层

不同角色看不同的"真相"：
- **开发** — Trace 详情、单步耗时、工具调用参数
- **运维** — 告警（幻觉率 >5% / 单次 cost >$0.5）、仪表盘
- **产品/管理** — 成本趋势、质量分数、用户满意度
- **安全/合规** — 审计日志、隐私泄漏检测结果

## 核心挑战：评测基准不漂移

这是整个体系中最难的问题：

1. **Judge 模型漂移** — LLM-as-a-Judge 认为好的答案，换了 Judge 模型后不再认可
2. **指标互损** — 优化了 Correlation（相关性），却伤害了 Plan Quality（计划质量）

**对策**：
- 固定若干**黄金评测集**（内容永不变化）
- 每次评测同时跑黄金集 + 生产采样，通过比较看**相对退化**而非绝对分数

## 来源

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agent-observability-5-layer-architecture.md)

---
## 火山引擎大规模 Agent 可观测实践（SUPP 2026-08-20）

火山引擎应用观测负责人（钱世俊，QCon 2026）提供不可替代的工程落地维度：统一观测底座 + 观测→评测闭环 + OpenClaw 实测。

**四层堆栈与三断层**：业务应用层 / Agent 框架层 / 大模型推理服务层 / 云基础设施层，各自观测关注点不同，导致链路断（跨层上下文透传丢失）、语义断（供应商链路标准语义不对齐）、因果断（底层硬件指标与上层推理逻辑脱节）。

**五大支柱统一观测基座**：统一门户（多观测产品汇聚 + AI 观测）；统一集成中心 OneAgent（拥抱 OpenTelemetry 标准 + 零代码埋点 + 统一采集器；200K QPS 下吞吐比 OTel Collector 高一倍、线上重载节点负载降 50% 以上——靠发送并发度自适应调整、sortable slice 预排序、内存预分配/栈内存/对象池优化）；统一数据加工（脱敏、黑白名单过滤、富化、日志转 Metrics、冷热存储）；统一看板（跨类型联动、Grafana 兼容、预置看板）；统一告警（智能降噪收敛、统一配置、TTFT/TPOT/Token 成本开箱即用规则）。

**观测→评测闭环**：定位高价值 Trace（失败异常 + 高频典型链路）→ 回流成评测集 → 离线（版本回归对比）+ 在线（持续监控误答率/Token 波动）评测 → 沉淀优化动作（提示词/检索/路由）。数据回流分离线（周期清洗转评测集）与在线（点赞点踩、分钟级告警）；评测系统含 LLM-as-evaluator + 白盒化人工复核对齐、多实验对比分析。

**OpenClaw 六层 SLI 实测**：Channel（连接/端到端成功率+耗时，北极星）→ Message/Session（初始化/卡顿恢复）→ 调度（出入队列延迟）→ 执行层 → 大模型工具层 → 缓存命中层；自研 Hook 插件在会话/推理/工具调用/任务分配关键点采集，MTTR 整体降 80% 以上。

## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- 相关: [Agent 架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md)
- 相关: [阿里 LoongSuite 可观测审计](../ch09/055-coding-agent.html)
- 相关: [LLM 可观测四层模型](https://github.com/QianJinGuo/wiki/blob/main/concepts/llm-observability-4-layer-model.md)

---

