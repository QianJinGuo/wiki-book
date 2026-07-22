---
title: "从个人生产力到组织能力：LoongSuite-Pilot×SLS 的 AI Coding 度量实践"
created: 2026-06-09
updated: 2026-06-09
type: article
source_url: "https://mp.weixin.qq.com/s/SEOGc3KIGm7eFpyUK6nR4g"
ingested: 2026-06-09
sha256: "$(echo 'loongsuite_metrics_content' | shasum -a 256 | cut -d' ' -f1 | head -c 16)"
review_value: 9
review_confidence: 9
---

> 来源：阿里云云原生
> 作者：徐可甲
> 原文：https://mp.weixin.qq.com/s/SEOGc3KIGm7eFpyUK6nR4g

## 引子：Coding 变快了，组织为什么没跟上？

2026 年 5 月，Google Cloud DORA 团队发布了《ROI of AI-Assisted Software Development》。报告引入了 **J-Curve（先降后升曲线）** 概念：团队在采纳 AI 工具的初期会经历一段生产力下降期（工作流适配、习惯切换、prompt 调优），只有度过这段谷底，ROI 才会在曲线后段兑现。

"正是当前多数研发组织的困境：手里只有两类数据 —— 主观满意度问卷和 CI/CD 聚合 KPI，缺的是事件级的、可下钻到 Agent/模型/Skill/部门的 AI Coding 使用行为度量。"

## 数据接入层：从采集到 SLS 落地

### 事件事实表：AI Coding Agent 行为日志

核心字段包括：
- 用户标识：`user.id`
- 会话：`gen_ai.session.id`
- Agent/供应商/模型：`gen_ai.agent.type`、`gen_ai.provider.name`、`gen_ai.request.model`
- Token 消耗：`gen_ai.usage.input_tokens`、`gen_ai.usage.output_tokens`、`gen_ai.usage.total_tokens`
- 工具调用：`gen_ai.tool.name`、`gen_ai.tool.call.arguments.file_path`
- 代码仓库：`git.repo`、`git.domain`

**事件级粒度带来三个工程价值：**
1. 异构 Agent 可比性：Claude Code 与 Copilot 统计口径一致
2. 会话级溯源能力：精确到"这个会话里第 3 次工具调用传了什么参数"
3. Skill 与 Tool 可观测性："团队沉淀的 Skill 有没有真的被用起来"变成可量化问题

### 人员维表：组织关系映射

通过 `work_no`（工号）与事件表关联，核心字段：`work_no`、`show_name`、`dept_name`（完整部门路径如"技术研发部-工程平台部-数据服务组"）

**为什么必须把组织关系作为独立维表接入？**
1. 解耦：人员维表随组织调整更新，事件上报后不回溯修改
2. LEFT JOIN 暴露空白：列出"在册但未上报"的人
3. 层级拆分一次完成：部门路径拆成一/二/三级部门

## 度量层：公共 CTE 到可决策的 AI Coding Agent 度量看板

### 为什么选择 SLS 大盘做分析层？

**核心原因是灵活性：**
1. 查询即定义：需求变了改 SQL 即刻生效
2. 口径完全自控："什么算活跃用户"、"部门怎么拆"因组织而异
3. 采集与分析同平台：没有额外 ETL 链路、没有 T+1 延迟

### 公共 CTE：报表的工程骨架

**CTE 1: dept_user（人员维表标准化）**
```sql
WITH dept_user AS (
  SELECT
    work_no, show_name,
    COALESCE(SPLIT_PART(dept_name, '-', 1), '') AS dept_name_1,
    COALESCE(SPLIT_PART(dept_name, '-', 2), '') AS dept_name_2,
    COALESCE(SPLIT_PART(dept_name, '-', 3), '') AS dept_name_3
  FROM <dept-logstore>
  GROUP BY work_no, show_name, dept_name
)
```

**CTE 2: active_user（事件预聚合）**
```sql
active_user AS (
  SELECT
    date_trunc('day', __time__) AS t,
    "user.id" AS user_id,
    coalesce(nullif("gen_ai.agent.type", 'null'), 'unknown') AS agent_type,
    coalesce(nullif("gen_ai.provider.name", 'null'), 'unknown') AS provider,
    coalesce(nullif("gen_ai.request.model", 'null'), nullif("gen_ai.response.model", 'null'), 'unknown') AS model,
    sum(coalesce("gen_ai.usage.input_tokens", 0)) AS input_tokens,
    sum(coalesce("gen_ai.usage.output_tokens", 0)) AS output_tokens,
    sum(coalesce("gen_ai.usage.total_tokens", 0)) AS total_tokens,
    count(1) AS events
  FROM <events-logstore>
  GROUP BY t, user_id, agent_type, provider, model
)
```

## 8 个分析维度（Section 1-8）

| Section | 维度 | 核心指标 | 决策价值 |
|---------|------|----------|----------|
| 1 | 核心概览 | 使用员工数、总 Token、会话数、人均 Token、未上报员工数 | 组织层面的"水位计" |
| 2 | 结构分布 | Agent_type、Model、Provider 切 Token 占比 | 资源配置决策（工具收敛、供应商集采） |
| 3 | 趋势 | 覆盖规模趋势、Token 消耗趋势、时段分布 | 判断 J-Curve 走到哪里 |
| 4 | 部门统计 | 部门 Token 明细、覆盖率%、人均 Token | 推广、团队标配、使用方式优化 |
| 5 | 组织与人员 | 员工 Token 明细、Agent/模型明细 | 一对一辅导、工具推荐 |
| 6 | Skill & 工具 | Skill 调用次数、使用人数、Tool 调用次数 | 方法论沉淀为组织资产的量化 |
| 7 | 代码仓库 | Repo Token Top10、Git Domain 占比 | AI 投入与组织战略对齐 |
| 8 | Token 集中度 | Top10%/20% Token 占比、人群分层 | 验证"人均是否被头部撑起来" |

### 核心 SQL 亮点

**Skill 名称提取（从多种路径格式中还原）**
```sql
SELECT skill_name AS "Skill", count(1) AS "调用次数"
FROM (
  SELECT
    CASE
      WHEN regexp_like(regexp_extract(path, '/([^/]+)/[^/]+$', 1), '^v?[0-9]+\.[0-9]+')
      THEN regexp_extract(path, '/([^/]+)/v?[0-9][^/]*/[^/]+$', 1)
      WHEN lower(regexp_extract(path, '/([^/]+)/[^/]+$', 1))
           IN ('skills','skill','.claude','agents','resources','.qoderwork','docs')
      THEN regexp_replace(regexp_extract(path, '/([^/]+)$', 1), '(?i)(\.skill)?\.md$', '')
      ELSE regexp_extract(path, '/([^/]+)/[^/]+$', 1)
    END AS skill_name
  FROM <事件表> t
  JOIN dept_user d ON t."user.id" = d.work_no
  WHERE regexp_like(t."gen_ai.tool.call.arguments.file_path", '(?i)(/SKILL\.md|/[^/]+\.skill\.md)$')
)
GROUP BY skill_name ORDER BY "调用次数" DESC LIMIT 10
```

**Token 集中度计算（Window Function 排名切桶）**
```sql
user_token AS (
  SELECT a.user_id, sum(a.total_tokens) AS total_tokens
  FROM dept_user d JOIN active_user a ON d.work_no = a.user_id
  GROUP BY a.user_id HAVING total_tokens > 0
),
ranked AS (
  SELECT user_id, total_tokens,
    row_number() OVER (ORDER BY total_tokens DESC) AS rn,
    count(*) OVER () AS user_count,
    sum(total_tokens) OVER () AS all_tokens
  FROM user_token
)
SELECT round(100.0 * sum(CASE WHEN rn <= cast(ceil(user_count * 0.1) AS bigint)
                          THEN total_tokens ELSE 0 END) / max(all_tokens), 2) AS "Top10% Token占比"
FROM ranked
```

## 三层递进路径

1. **统一语义采集**：LoongSuite GenAI 语义规范 + LoongSuite-Pilot 解决"什么口径记录"和"从异构 Agent 中采出来"
2. **灵活分析**：SLS 大盘以 SQL 为唯一定义语言，公共 CTE 保证 30+ 图表口径一致
3. **组织可行动**：人员维表暴露"在册但未上报"空白，集中度看板校验"人均指标是否被头部撑起来"

## 相关链接

- DORA: ROI of AI-Assisted Software Development: https://cloud.google.com/resources/content/dora-roi-of-ai-assisted-software-development
- LoongSuite GenAI 语义规范: https://github.com/alibaba/loongsuite-semantic-conventions-genai/
- OpenTelemetry GenAI semantic conventions: https://opentelemetry.io/docs/specs/semconv/gen-ai/
