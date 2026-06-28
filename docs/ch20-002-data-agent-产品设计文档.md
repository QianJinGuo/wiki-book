## Ch20.002 Data Agent 产品设计文档

> 📊 Level ⭐⭐ | 29.9KB | `entities/data-agent-product-design.md`

# Data Agent 产品设计文档

本文档基于火山引擎 Data Agent 产品体系，设计一套可对标的**企业级数据智能体**产品。涵盖：智能问数 Agent（NL2SQL）、营销策略 Agent（CDP 集成）两大核心场景的完整功能拆解、技术架构、API 设计、数据模型。

## 相关实体
- [Openai Buys Ai Consultancy Enterprises](ch01-721-openai-buys-ai-consultancy-to-sell-enterprises-on-its-models.html)
- Multilingual Ai
- [Baixing Ontoz Enterprise Ontology Multi Agent](ch04-131-state-of-memory-in-agent-harness-mem0-harness.html)
- [Enterprise Ai Memory Substrate Three Layer Architecture](ch01-857-claude-code-7-layer-memory-architecture.html)
- [Skill Version Management Semantic Versioning Practices Winty](ch07-040-skill-版本管理五大原则-从越改越差到持续演进.html)

→ [产品总览 原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/volcengine-data-agent-product-overview.md)
→ [智能问数Agent 原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/volcengine-data-agent-intelligent-query-agent.md)
→ [营销策略Agent 原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/volcengine-data-agent-marketing-strategy-agent.md)

---

- [Data Agent Platform Architecture](ch04-441-阿里skillclaw-让-agent-技能在真实使用中集体进化.html)
## 1. 产品定位与愿景

**Data Agent** = Data（深度理解和运用企业数据资产）+ Agent（主动思考、分析、行动的智能代理）

核心价值主张：
- 让**不具备数据分析能力**的业务员工，通过自然语言对话直接获取业务数据
- 让**管理者**，无需选择数据集，仅提问就能得出答案
- 让**数据/技术团队**，将业务关注的数据封装为推荐问题，降低全员使用门槛

目标：7×24 小时在线的数据智囊团，实现从数据洞察到业务落地的全周期闭环赋能。

---

## 2. 核心产品模块

### 2.1 智能问数 Agent（Intelligent Query Agent）

#### 2.1.1 核心能力

| 能力 | 说明 |
|------|------|
| **NL2SQL** | 自然语言 → SQL 查询，支持多数据集协同查询 |
| **语义模型解析** | 理解业务术语/指标体系，自动映射到数据模型 |
| **业务知识调用** | 内置业务知识库，减少歧义 |
| **推荐问题** | 团队高频问题预置为快捷入口 |
| **收藏问题** | 用户自收藏常问问题，一键触达 |
| **多轮交互式问数** | 支持追问、澄清、深入归因 |
| **归因分析** | 查询结果 + 异常检测 + 根因追溯 |
| **个性化推送** | 定时任务推送数据到相关人员 |

#### 2.1.2 支持的数据集类型

- 抽取数据集（数据仓库/数据湖）
- 直连 ClickHouse / ByteHouse
- 直连 Doris / SelectDB / StarRocks
- 直连 Postgres / Hologres / OpenGuass
- 直连 MySQL

#### 2.1.3 查询结果可视化

| 图表类型 | 适用场景 | 触发关键词 |
|----------|----------|------------|
| line（折线图） | 时间序列趋势 | 变化趋势、增长、下降、波动 |
| column_parallel（柱状图） | 类别比较 | 比较、排名、数量 |
| pie（饼图） | 占比分布 | 比例、占比、分布 |
| measure_card（指标卡） | 关键指标 | 哪个、数值、汇总 |
| table（表格） | 明细数据 | 明细、详细、多维 |
| scatter（散点图） | 相关性分析 | 影响、相关性、分布 |
| map（中国地图） | 区域分布 | 区域分布、地理差异 |
| double_axis（双轴图） | 双指标对比 | 双轴、不同单位 |
| combination（组合图） | 复杂多维 | 组合、复杂、多维度 |

#### 2.1.4 分析增强能力

- **数据解读**：基于查询结果，AI 自动生成数据解读文案
- **异常检测**：自动检测查询结果中的异常值/拐点
- **分析过程透明**：可查看 AI 思考链（SQL 推断过程、分析参数）

---

### 2.2 营销策略 Agent（Marketing Strategy Agent）

#### 2.2.1 核心流程：目标 → 策略 → 配置 → 优化

```
触达活动描述（背景/主题/人群/目标）
    ↓
智能圈选目标人群（AI 推理 + CDP 标签）
    ↓
生成营销方案（多方案对比）
    ↓
触达策略生成（时机/通道/内容）
    ↓
触达任务配置（受众/触发条件/触达配置）
    ↓
个性化触达执行（匹配最优时机/物料/权益）
    ↓
数据分析与动态优化
```

#### 2.2.2 功能拆解

**输入层**
- 触达活动描述：背景、主题、内容、面向人群、活动目标
- 触达时机：指定时段 or 默认最近 7 天
- 触达内容：通道（短信/Webhook）+ 物料 + 权益

**人群圈选层**
- AI 深度思考：推理业务意图 → 拆解目标 → 获取行业实践 → 画像标签识别 → 客群创建
- 智能圈选：自动构建客群（ID、名称、数量、描述）
- 分群详情：可二次编辑圈选规则
- 分群洞察：标签属性数据特征深度分析

**策略生成层**
- 方案推荐：生成分群多种拆分方案
- 策略生成：触达时机设计 + 通道及内容设计
- 触达任务配置：受众用户 + 触发条件 + 触达配置

**执行层**
- 个性化触达：匹配最优触达时机、物料、权益、模板
- 任务管理：查看/编辑/复制/删除历史任务
- 数据分析：任务效果追踪

---

## 3. 技术架构设计

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────┐
│                    User Interface                    │
│   (Web Chat / API / Dashboard / 定时推送)            │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              Data Agent Orchestrator                 │
│  (意图分类 → 路由 → 多Agent协同 → 结果聚合)           │
└──────┬─────────────────┬─────────────────┬──────────┘
       │                 │                 │
┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
│  智能问数Agent │  │ 营销策略Agent │  │  深度研究Agent│
│  (NL2SQL引擎) │  │ (CDP集成)    │  │ (多轮分析)    │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
│  SQL Parser  │  │  客群构建引擎 │  │  Python执行器 │
│  语义模型    │  │  策略生成引擎 │  │  报告生成器  │
│  归因分析    │  │  触达优化    │  │            │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                 │
┌──────▼───────────────▼─────────────────▼──────┐
│              Data Source Layer                │
│  ClickHouse / Doris / MySQL / Hologres / CDW │
└──────────────────────────────────────────────┘
```

### 3.2 智能问数 Agent 核心 Pipeline

```
用户问题（自然语言）
    ↓
意图理解 + 实体识别 + 上下文补全（多轮对话上下文）
    ↓
语义模型解析（业务术语 → 物理表字段映射）
    ↓
SQL 生成（LLM + Few-shot + Schema Constraint）
    ↓
SQL 校验 + 执行
    ↓
结果处理（聚合/筛选/排序）
    ↓
可视化选择（根据数据特征 + 用户问题关键词推荐图表）
    ↓
归因分析（如用户触发）
    ↓
数据解读（AI 生成自然语言解读）
    ↓
返回结果
```

**关键模块**

| 模块 | 职责 | 技术选型 |
|------|------|----------|
| 意图理解 | 判断是查询/归因/解释/推荐问题 | LLM + Few-shot Classification |
| 语义模型 | 业务术语 → 数据字段映射 | RAG（业务知识库）+ Embedding |
| SQL 生成 | 自然语言 → SQL | LLM（GPT-4 / Claude）+ Schema约束 |
| SQL 校验 | 语法检查 + 权限检查 + 性能预估 | 规则引擎 + 执行计划分析 |
| 归因分析 | 异常根因追溯 | 分解法 + 相关性分析 + LLM 推理 |
| 数据解读 | 生成自然语言结论 | LLM（结果 + 上下文注入） |
| 图表推荐 | 根据数据特征推荐最优图表 | 规则引擎 + 数据特征提取 |

### 3.3 营销策略 Agent 核心 Pipeline

```
触达活动描述（输入）
    ↓
AI 深度思考模块
  - 业务意图推理
  - 目标拆解为可执行指标
  - 行业实践知识检索
  - 画像标签识别策略
    ↓
客群构建（CDP 集成）
  - 标签组合查询
  - 客群规模预估
  - 分群规则生成
    ↓
方案生成
  - 拆分维度（人群/渠道/内容）
  - 多方案对比排序
    ↓
策略生成
  - 触达时机优化
  - 通道优先级排序
  - 内容个性化匹配
    ↓
触达任务执行
  - 受众过滤
  - 触发条件监听
  - 触达通道调用（短信/Webhook）
    ↓
效果追踪与动态优化
  - 转化数据回传
  - 策略调整建议
```

### 3.4 数据模型设计

**Dataset（数据集）**
```python
{
    "id": "ds_xxxx",
    "name": "销售数据集",
    "type": "clickhouse" | "mysql" | "doris" | "postgres" | ...",
    "connection": {
        "host": "...",
        "port": ...,
        "database": "...",
        "tables": ["sales", "orders", "products"]
    },
    "semantic_model": {
        "metrics": [
            {"name": "销售额", "expr": "sum(amount)", "description": "..."},
            {"name": "订单数", "expr": "count(order_id)", "description": "..."}
        ],
        "dimensions": [
            {"name": "地区", "field": "region", "values": ["华北", "华东", ...]},
            {"name": "产品类别", "field": "category", "values": [...]}
        ],
        "business_terms": {
            "本月销售额": "sum(amount) WHERE date >= TRUNC_MONTH(NOW())"
        }
    }
}
```

**Question（推荐/收藏问题）**
```python
{
    "id": "q_xxxx",
    "text": "本月各地区销售额是多少",
    "intent": "query",
    "dataset_ids": ["ds_xxxx"],
    "sql_template": "SELECT region, SUM(amount) FROM sales WHERE ...",
    "created_by": "admin",
    "is_recommended": True,
    "is_public": True
}
```

**Audience（营销人群）**
```python
{
    "id": "aud_xxxx",
    "name": "高价值年轻用户",
    "rules": [
        {"tag": "年龄", "op": "between", "value": [18, 35]},
        {"tag": "消费金额", "op": ">=", "value": 1000},
        {"tag": "活跃度", "op": "==", "value": "高"}
    ],
    "estimated_count": 15832,
    "created_at": "2026-05-25T10:00:00Z",
    "source": "cdp"
}
```

**MarketingCampaign（营销活动）**
```python
{
    "id": "camp_xxxx",
    "name": "618 大促通知",
    "objective": "提升复购率",
    "audience_id": "aud_xxxx",
    "触达时机": {
        "type": "fixed_range" | "optimal_window",
        "start": "2026-06-01",
        "end": "2026-06-18"
    },
    "通道": ["sms", "webhook"],
    "内容物料": [
        {"type": "sms_template", "template_id": "tmpl_xxx", "content": "..."}
    ],
    "状态": "draft" | "pending_approval" | "approved" | "running" | "completed"
}
```

---

## 4. API 设计

### 4.1 智能问数 Agent API

#### 查询接口
```
POST /api/v1/query
{
    "question": "本月华北地区销售额相比上月变化如何",
    "dataset_ids": ["ds_xxxx"],          // 可选，默认全量
    "conversation_id": "conv_xxxx",       // 多轮对话 ID
    "user_id": "user_xxxx",
    "options": {
        "show_thinking": true,            // 返回分析过程
        "visualization": true,           // 返回可视化建议
        "attribution": false             // 是否做归因分析
    }
}

Response:
{
    "conversation_id": "conv_xxxx",
    "answer": {
        "text": "本月华北地区销售额为 1,235 万元，环比上月下降 12%...",
        "sql": "SELECT region, SUM(amount) WHERE ...",
        "data": {
            "columns": ["region", "amount", "mom_change"],
            "rows": [["华北", 12350000, -0.12], ...],
            "chart_type": "line",
            "chart_config": {...}
        },
        "thinking": {
            "intent": "compare_query",
            "semantic_mapping": {...},
            "sql_generation": "..."
        },
        "attribution": null,
        "recommendations": [
            {"type": "follow_up", "question": "华北下降的原因是什么？"}
        ]
    }
}
```

#### 收藏/推荐问题
```
GET  /api/v1/questions/recommended?dataset_ids=ds_xxxx,ds_yyyy
POST /api/v1/questions              # 创建推荐问题
POST /api/v1/questions/{id}/favorite # 用户收藏
```

#### 归因分析
```
POST /api/v1/query/attribution
{
    "query_result_id": "qr_xxxx",
    "dimensions": ["region", "product_category", "channel"],
    "target_metric": "销售额"
}
```

### 4.2 营销策略 Agent API

#### 创建营销活动
```
POST /api/v1/marketing/campaigns
{
    "name": "618 大促通知",
    "objective": "提升复购率",
    "audience_description": "高价值用户，近 30 天有购买记录",
    "触达时机": {
        "type": "optimal_window",
        "max_times": 3
    },
    "通道": ["sms"],
    "内容策略": "个性化",
    "options": {
        "generate_audience": true,
        "generate_content": true
    }
}

Response:
{
    "campaign_id": "camp_xxxx",
    "generated_audience": {
        "id": "aud_xxxx",
        "name": "AI 智能圈选-高价值用户",
        "estimated_count": 15832,
        "rules": [...],
        "insights": "该人群以 25-35 岁女性为主，周末活跃度更高..."
    },
    "proposed_plans": [
        {
            "id": "plan_xxxx",
            "拆分维度": "人群分层",
            "方案描述": "按消费频次分为高/中/低三层...",
            "预估效果": {...}
        },
        ...
    ]
}
```

#### 方案 → 策略生成
```
POST /api/v1/marketing/plans/{plan_id}/apply
{
    "通道": ["sms", "webhook"],
    "内容物料": {
        "sms_template": "tmpl_xxx",
        "webhook_payload": {...}
    }
}

Response:
{
    "strategy_id": "str_xxxx",
    "触达时机设计": [
        {"segment": "高消费层", "最佳时机": "周末 10:00-12:00"},
        {"segment": "中消费层", "最佳时机": "工作日 19:00-21:00"}
    ],
    "通道优先级": {"sms": 0.7, "webhook": 0.3},
    "内容变体": [
        {"segment": "高消费层", "content": "尊敬 VIP..."}
    ]
}
```

#### 触达任务管理
```
POST /api/v1/marketing/tasks
{
    "campaign_id": "camp_xxxx",
    "strategy_id": "str_xxxx",
    "audience_id": "aud_xxxx",
    "触发条件": {
        "type": "time_window",
        "start": "2026-06-01T00:00:00Z",
        "end": "2026-06-18T23:59:59Z"
    },
    "触达配置": {
        "通道": "sms",
        "template_id": "tmpl_xxx",
        "frequency_limit": 1
    }
}

GET  /api/v1/marketing/tasks/{task_id}
PUT  /api/v1/marketing/tasks/{task_id}   # 编辑
DELETE /api/v1/marketing/tasks/{task_id}  # 删除
GET  /api/v1/marketing/tasks/{task_id}/analytics  # 效果数据
```

### 4.3 数据集管理 API
```
GET    /api/v1/datasets
POST   /api/v1/datasets              # 注册数据集
GET    /api/v1/datasets/{id}
GET    /api/v1/datasets/{id}/schema  # 获取语义模型
POST   /api/v1/datasets/{id}/sync    # 触发数据同步
```

---

## 5. 实现优先级建议

### Phase 1：智能问数 Agent 核心（MVP）

1. **NL2SQL 引擎**（最核心）
   - 单数据集支持（MySQL / ClickHouse 先各一个）
   - 基础语义模型（metrics + dimensions）
   - 简单问数（单表聚合查询）

2. **对话界面**
   - Web 聊天界面
   - 多轮对话支持
   - 结果图表展示（5-6 种基础图表）

3. **推荐问题**
   - 管理员配置推荐问题
   - 用户收藏

**预计工作量**：4-6 周（2 人团队）

### Phase 2：智能问数 Agent 增强

1. 多数据集协同查询
2. 归因分析
3. 数据解读
4. 异常检测
5. 个性化推送（定时任务）

**预计工作量**：3-4 周

### Phase 3：营销策略 Agent

1. CDP 集成（人群圈选）
2. 策略生成引擎
3. 触达任务配置
4. 效果追踪

**预计工作量**：6-8 周

---

## 6. 技术选型建议

| 模块 | 选型 | 理由 |
|------|------|------|
| **LLM** | Claude 3.5 Sonnet / GPT-4o | 强 NL2SQL 能力，低幻觉 |
| **SQL Parser** | 自研 + 规则校验 | 开源方案（SQLGlot）可参考 |
| **向量数据库** | Qdrant / Milvus | 语义模型存储 + 召回 |
| **数据库连接** | SQLAlchemy + 原生驱动 | 统一抽象层 |
| **任务队列** | Celery + Redis | 定时推送、异步任务 |
| **CDP 集成** | REST API | 解耦，适配多 CDP厂商 |
| **前端** | React + Ant Design | 企业级 UI 快速搭建 |

---

## 7. 与火山引擎 Data Agent 的核心差异点

| 维度 | 火山引擎 | 本文设计 |
|------|----------|----------|
| 部署方式 | 云服务（绑定火山云） | 支持私有化部署 |
| 数据源 | 绑定 DataWind / VeCDP | 开放数据源接入 |
| Agent 类型 | 全家桶（6 种 Agent） | 按需实现，渐进式 |
| 深度研究 Agent | 需要智能问数 Agent | 可独立使用 |
| 定价模式 | 按量/包年 | 开源 + 企业支持 |

---

## 深度分析

1. **Data Agent 的本质是 NL2SQL + 多轮对话 + 领域知识融合的复合智能体**

   火山引擎将 Data Agent 定义为"深度理解和运用企业数据资产"+"主动思考、分析和行动的智能代理"。这一定义揭示了该产品的双重本质：既是数据查询工具（NL2SQL），也是具备领域知识调用能力的认知智能体。智能问数 Agent 不仅仅是翻译自然语言为 SQL，还需要在语义模型层完成业务术语到物理表字段的映射，并在归因分析层完成深度推理。这决定了系统的技术选型和架构分层必须围绕这一复合能力展开。

2. **多场景覆盖是 Data Agent 区别于单点 NL2SQL 工具的核心竞争力**

   火山引擎 Data Agent 产品体系覆盖智能分析、智能会话、智能营销三大场景，而非仅仅提供单一的问数功能。这一定位意味着产品设计不能仅聚焦于 NL2SQL 引擎本身，还需要考虑与营销 CDP、客服系统的深度集成。在设计自有产品时，应提前规划 Agent 之间的协同机制（如 Orchestrator 路由层），为未来扩展到营销策略 Agent、深度研究 Agent 等留出架构空间。

3. **语义模型层是 NL2SQL 系统的核心壁垒，而非 LLM 本身**

   火山引擎产品文档将"推荐问题"和"收藏问题"列为独立功能模块，并强调数据/技术团队负责将业务关注的数据封装为推荐问题。这意味着 NL2SQL 系统的核心差异化和护城河在于语义模型层的完备性——包括业务术语定义、指标体系映射、数据集关联关系等，而非依赖更强的 LLM 模型。企业在引入 NL2SQL 时，应优先投入资源构建高质量的语义模型，而非盲目追求 LLM 参数规模。

4. **营销策略 Agent 的核心价值在于"目标 → 策略 → 配置 → 优化"闭环的自动化程度**

   火山引擎营销策略助手的产品定位强调"智能闭环"能力：从触达活动描述输入，到 AI 深度思考模块进行意图推理，再到智能圈选人群、生成营销方案、配置触达任务，最终实现数据分析与动态优化。这一闭环的价值不仅在于提升效率，更在于将数据驱动的营销专业知识标准化并嵌入工作流。设计自有产品时，应重点关注 CDP 集成的开放性，以及策略生成层的可解释性，而非仅聚焦于人群圈选的准确性。

5. **产品易用性与透明性设计是 Enterprise AI 产品的关键信任构建要素**

   火山引擎在智能问数 Agent 中设计了"数据解读"、"异常检测"、"查看分析过程"三个功能，分别解决"如何理解数据结论"、"数据是否有问题"、"AI 是如何推理的"三个用户认知层面的需求。这反映出企业级 AI 产品设计的核心挑战不仅是模型能力的上限，更在于如何将复杂推理过程以用户可理解的方式呈现，从而建立信任。产品设计应将"分析过程透明"作为核心功能点而非辅助选项，通过思考链展示机制主动消除用户对 AI 幻觉的担忧。

---

## 实践启示

1. **语义模型层的建设应先于 NL2SQL 引擎的选型**

   在产品研发优先级排序时，应首先投入 2-3 周完成业务语义模型的定义（metrics、dimensions、business_terms），再进入 NL2SQL 引擎开发阶段。这一顺序确保后续 LLM 调用的 schema constraint 有据可依，显著降低幻觉率。实践中建议使用 RAG 架构存储语义模型，并通过 Embedding 召回提升语义匹配准确率。

2. **采用渐进式 NL2SQL 能力扩展路径，而非一步到位**

   Phase 1 聚焦于单表简单聚合查询（COUNT、SUM、AVG），而非一开始就支持多表 JOIN、复杂子查询等高难度场景。火山引擎的产品矩阵也印证了这一点——深度研究 Agent 依赖于智能问数 Agent 的成熟度。设计时应设置 SQL 复杂度分级机制，在执行前预估查询代价，对超过阈值的复杂 SQL 触发人工审批或降级处理。

3. **营销策略 Agent 应从最小闭环（目标 → 策略 → 配置）快速迭代**

   不必在第一阶段就追求完整的"动态优化"能力，应优先实现"触达活动描述 → AI 圈选人群 → 生成营销方案 → 配置触达任务"这一最小闭环。实践中应将 CDP 集成模块设计为可插拔架构，通过 REST API 解耦，以确保在不同 CDP厂商间的兼容性。方案对比排序算法初期可采用规则引擎，待数据积累后逐步引入机器学习优化。

4. **SQL 执行层的防护机制必须作为独立模块而非附属功能**

   禁止在 NL2SQL Pipeline 中跳过 SQL 校验直接执行。系统应包含三级防护：语法检查（规则引擎）、权限检查（数据源 ACL）、性能预估（执行计划分析）。对于生产环境，建议额外配置查询超时强制中断和结果集行数限制，以防止失控查询拖垮数据源。火山引擎的"分析过程透明"设计也暗示了这一点——系统应能展示 SQL 生成的完整推理链，而非仅返回结果。

5. **面向业务用户的 AI 产品必须配置"思考链可视化"功能**

   在对话式查询场景中，用户对 AI 的信任度高度依赖对推理过程的可见性。建议在产品设计初期即将"分析过程透明"纳入 Phase 1 MVP 范畴，而非推迟到 Phase 2。具体实现包括：意图分类结果的展示、语义映射过程的还原、SQL 生成依据的说明三个层面。数据显示展示层的"数据解读"和"异常检测"按钮应作为常驻功能而非折叠项，以降低业务用户的认知负担。

---

*文档版本：v1.0*
*创建时间：2026-05-25*
*最后更新：2026-05-28*
*数据来源：火山引擎 Data Agent 产品文档*

---
