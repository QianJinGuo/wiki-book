# SchemaFlow: Agentic Database Change Impact Analysis, SQL Generation, and Eval Guardrails

## Ch04.432 SchemaFlow: Agentic Database Change Impact Analysis, SQL Generation, and Eval Guardrails

> 📊 Level ⭐⭐ | 5.7KB | `entities/schemaflow-agentic-database-sql-generation-openai-cookbook.md`

# SchemaFlow: Agentic Database Change Impact Analysis, SQL Generation, and Eval Guardrails

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/schemaflow-agentic-database-sql-generation-openai-cookbook.md)

## 摘要

OpenAI 官方 Cookbook 的 SchemaFlow 合作伙伴案例，展示了一个**生产级 agentic workflow 的完整架构**：从 PDF 文档 RAG 检索、5 阶段 staged 任务拆分、SQL 生成、变更影响分析到 Promptfoo 评估护栏。这是 OpenAI 在 agent harness engineering 上的范本演示——不是单次 LLM 调用，而是 5 个独立 stage 串起来的工程化系统，每个 stage 有独立的 Pydantic 强类型输出校验和可观测性。

## 核心要点

1. **Harness = staged pipeline + 强类型 schema + 评估门**：生产级 Agent 不是单 prompt，而是多阶段流水线，每个阶段独立可观测、可重试、可失败隔离
2. **官方 Cookbook 是 harness 范本**：Anthropic 和 OpenAI 都在用 staged agentic workflow 解决复杂任务，单 prompt 是 2024 范式
3. **Eval guardrails 不是可选**：生产 SQL 生成必须配合 Promptfoo 之类的 evaluator，否则 hallucination 直接进生产库

## 深度分析

### 五阶段流水线架构

SchemaFlow 的核心是将数据库变更管理拆解为 5 个独立 stage：

| Stage | 功能 | 输入 | 输出 | 校验方式 |
|-------|------|------|------|----------|
| Parse Change Request | 解析变更请求文档 | PDF/文本变更请求 | 结构化变更描述 | Pydantic model |
| Impact Analysis | 分析变更对现有 schema 的影响 | 变更描述 + schema PDF | 影响范围报告 | Pydantic model |
| SQL Generation | 生成变更 SQL | 影响分析 + schema | SQL 语句 | Pydantic + Promptfoo |
| Validation | SQL 安全/正确性校验 | SQL + schema | 校验结果 | Promptfoo rules |
| Eval | 评估整体质量 | 全流程输出 | 质量分数 | Promptfoo regression |

每个 stage 的关键设计原则：
- **独立可观测**：每个 stage 的输入输出可单独监控、日志和调试
- **强类型约束**：所有输出用 Pydantic model 校验，类型错误立即重试而非传递到下游
- **失败隔离**：单个 stage 失败不影响其他 stage，可独立重试

### PDF RAG Context

SchemaFlow 将数据库 schema 文档（PDF 格式）分块向量化，作为 LLM 上下文的一部分。这解决了 Agent 需要理解完整数据库结构才能生成正确 SQL 的问题。RAG 检索确保 Agent 只加载相关表/字段的 schema 信息，而非整个数据库文档。

### Promptfoo 评估护栏

这是 SchemaFlow 与普通 Agent 最大的区别——**评估不是事后检查，而是流水线中的硬门控**：

**SQL injection detection**：Promptfoo rules 检测危险模式——`DROP TABLE`、`DELETE FROM` 无 WHERE、`TRUNCATE`、`ALTER TABLE ... DROP` 等。检测到即阻断执行。

**Schema drift check**：生成的 SQL 与目标 DB schema 实时比对，确保引用的表和列确实存在，字段类型匹配。

**Cost/latency budgets**：每个 stage 单独监控 token 用量和响应时间，超出预算时触发告警或降级。

**Regression suite**：固定测试集确保迭代不破坏已有功能。每次 pipeline 变更后跑回归，发现退化即阻断部署。

### 与单 Prompt 范式的对比

| 维度 | 单 Prompt（2024） | Staged Pipeline（2025-26） |
|------|-------------------|---------------------------|
| 可观测性 | 黑盒 | 每 stage 独立日志 |
| 错误处理 | 整体失败 | 单 stage 重试 |
| 类型安全 | 自然语言输出 | Pydantic 强类型 |
| 评估 | 事后人工 | Promptfoo 硬门控 |
| 成本控制 | 无法拆分 | 每 stage 独立预算 |
| 可调试性 | 难以定位 | 精确到 stage |

## 实践启示

1. **Staged pipeline 是生产标配**：任何涉及多步骤推理的 Agent 任务都应拆分为独立 stage，而非塞进单个 prompt。每个 stage 有独立的输入输出 schema、错误处理和可观测性
2. **Pydantic 不是装饰**：强类型输出校验是 stage 间信任的基础。类型错误在当前 stage 重试，而非传递到下游产生级联失败
3. **Eval 是硬门控**：对于 SQL 生成等高风险任务，评估必须是流水线中的阻断点，而非事后审查。Promptfoo 的规则引擎可以在 SQL 进入数据库前拦截危险操作
4. **PDF RAG 是必要基础设施**：Agent 需要理解完整的数据库 schema 才能生成正确 SQL，但不能把整个 schema 塞进上下文。RAG 检索是平衡信息完整性和上下文成本的关键
5. **回归测试套件**：每次 pipeline 变更后跑固定测试集，确保迭代不破坏已有功能——这在 Agent 系统中比传统软件更重要，因为 LLM 输出有随机性

## 相关实体

- [MCP 12 设计模式](ch03/044-agent.md)
- [Agent Loop 设计模式](ch01/850-openclaw-boris-cherny-agent-loop-design-patterns.md)
- [Agent Harness](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- [Agentic Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agentic-engineering-paradigm.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/observability-monitoring.md)

---

