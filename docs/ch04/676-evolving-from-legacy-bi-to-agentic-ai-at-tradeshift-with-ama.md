# Evolving from legacy BI to agentic AI at Tradeshift with Amazon Quick

## Ch04.676 Evolving from legacy BI to agentic AI at Tradeshift with Amazon Quick

> 📊 Level ⭐⭐ | 3.1KB | `entities/evolving-from-legacy-bi-to-agentic-ai-at-tradeshift.md`

# Evolving from legacy BI to agentic AI at Tradeshift with Amazon Quick

> **Background**：本文由 Tradeshift 与 AWS 联合撰写，介绍了 Tradeshift 如何从自研 BI 工具迁移到 Amazon Quick（原 Amazon QuickSight）的 agentic AI 平台。记录了完整的迁移路线、架构设计、量化指标和经验教训。

## 迁移背景

Tradeshift 面临自研 BI 工具的严重限制：

| 限制 | 具体问题 |
|------|----------|
| 数据规模 | 每次查询最多 10,000 行，预定报告 25 MB 上限，仅保留 6 个月 |
| 维护成本 | 占用 50% 全职员工产能 |
| 人工操作 | CSV 导出 + Excel 宏 + 人工报告组装 |
| 外部客户 | 无自服务路径，依赖 BI 团队生成定制报告 |

## 解决方案架构

采用 Amazon Quick 三层分析架构：

1. **嵌入式 BI 仪表盘层**：16 个嵌入式 Quick Sight 仪表盘（iFrame），覆盖 9 个领域
2. **对话式 AI 层**：自然语言查询，无需 SQL 知识
3. **分层数据自主权**：Standard 层（预建仪表盘）和 Premium 层（Designer Mode、What-If 建模、AI 能力）

### 安全四层

Okta SSO → Amazon Quick custom namespaces（租户隔离）→ Signed URL（限时会话绑定嵌入）→ Row-Level Security（约 14,000 条 RLS 规则）

## 量化成果

| 指标 | 数值 |
|------|------|
| 查询速度 | 从 45-90 秒降至 **<3 秒**（30× 提升） |
| TCO 降低 | **40%** |
| 基础设施成本降低 | **35%**（查询从生产库迁移至 SPICE 内存引擎） |
| 许可成本整合 | **30%** |
| 手动数据处理减少 | **80%** |
| 内部维护工时 | 从 50% FTE 降至 **0.5 FTE** |
| ARR 增长 | **2%** 增量（来自 Premium 层） |
| 报告上市时间 | 从 4-6 周降至 **~1 周**（75% 改进） |
| 内部采用率 | **98%** |
| 客户活跃采用率 | 50%（首年目标企业客户） |
| 分析使用率提升 | **2×**（非技术员工） |
| 支持工单减少 | **80%** |

## 关键创新

- **AP Auditor 聊天 Agent**：基于 Amazon Quick custom chat agent 构建，连接 11 份知识库文档、9 个仪表盘、14 个查询主题、68 个 MCP 工具
- **自动化季度市场分析**：原需数周 → Quick Research（多源综合分析）→ 数天/小时
- **270+ SPICE 数据集**：每日自动刷新，报告自动按日/周/月分发
- **MCP 服务器集成**：Tradeshift 率先在 AP 自动化领域将 MCP 服务器与 Amazon Quick 集成，Agent 可自主读取数据目录元数据并生成洞察

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/evolving-from-legacy-bi-to-agentic-ai-at-tradeshift-with-amazon-quick.md)

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)

---

