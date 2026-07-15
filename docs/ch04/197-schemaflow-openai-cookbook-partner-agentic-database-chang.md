# SchemaFlow: OpenAI Cookbook Partner — Agentic Database Change Impact Analysis, SQL Generation, and Eval Guardrails

## Ch04.197 SchemaFlow: OpenAI Cookbook Partner — Agentic Database Change Impact Analysis, SQL Generation, and Eval Guardrails

> 📊 Level ⭐⭐ | 11.5KB | `entities/schemaflow-openai-cookbook-staged-agentic-workflow.md`

# SchemaFlow: OpenAI Cookbook Partner — Agentic Database Change Impact Analysis, SQL Generation, and Eval Guardrails

> **背景**：本文基于 OpenAI 官方 Cookbook 合作伙伴 SchemaFlow 的实战案例整理，提取其 staged agentic workflow 设计模式、SQL 生成的工程化护栏与评估范式。

## SchemaFlow 是什么

OpenAI Cookbook 在 2026 年推出的合作伙伴示例工程，演示**如何用 staged agentic workflow 完成企业数据库变更管理**——从 PDF schema 文档 RAG 检索、变更请求解析、影响分析、SQL 生成到 Promptfoo 评估护栏的完整 5 阶段流水线。是 OpenAI 在"agent harness engineering"上给出的**官方范本**。

## 五大核心设计模式

### 1. Staged agentic workflow

**核心思想**：把复杂任务拆成 5 个独立 stage，每个 stage 有明确的输入/输出/Pydantic schema：

1. **Parse Change Request** — LLM 解析用户的 DDL/DML 变更请求
2. **Impact Analysis** — 分析影响范围（涉及哪些表、哪些 service）
3. **SQL Generation** — 生成实际 SQL
4. **Validation** — Pydantic schema 校验 + SQL 语法检查
5. **Eval Guardrails** — Promptfoo 规则引擎拦截危险操作

**为什么是 5 stage 而非 1 个 prompt**：单 prompt 处理复杂 SQL 任务时 hallucination 率高（schema 错、SQL 注入风险），分 stage 后每阶段独立 LLM 调用 + 强类型 schema 校验，可观测性大幅提升。

### 2. Pydantic schema 强类型约束

每个 stage 的输出都用 Pydantic model 定义，LLM 失败重试最多 3 次。示例：

```python
class SQLGenerationOutput(BaseModel):
    sql: str = Field(..., description="Generated SQL statement")
    affected_tables: list[str] = Field(default_factory=list)
    confidence: float = Field(ge=0, le=1)
    requires_review: bool = Field(default=False)
```

**关键工程意义**：LLM 输出从"模糊文本"变成"类型化数据结构"，下游代码可以直接 `output.affected_tables` 取值，无需再正则解析。

### 3. PDF RAG context

数据库 schema 文档（PDF）通过 RAG 检索作为 LLM 上下文：
- 文档分块（每块 ~500 tokens）
- 向量化（OpenAI text-embedding-3）
- Top-K=5 检索
- 拼接到 system prompt

**SchemaFlow 的设计取舍**：用 RAG 而非全量 schema 喂给 LLM，因为大型企业 DB schema 可能有几千张表，全量 prompt 不可行。RAG 让 LLM 只看相关表，准确率更高。

### 4. Promptfoo eval guardrails

**这是 SchemaFlow 最核心的工程贡献**——用 Promptfoo 在 stage 5 拦截危险 SQL：

```yaml
# promptfooconfig.yaml
rules:
  - name: no-drop-table
    pattern: "DROP TABLE"
    severity: block
  - name: no-where-less-delete
    pattern: "DELETE FROM \\w+"
    severity: warn
  - name: no-truncate
    pattern: "TRUNCATE"
    severity: block
```

**实战价值**：LLM 生成的 SQL 不能直接进生产库，必须有 eval gate。Promptfoo 规则引擎 + LLM-as-judge 双层评估是 2026 的标准范式。

### 5. Cost/latency budget 监控

每个 stage 单独监控：
- Token 用量（单 stage 上限 2000 tokens）
- 响应时间（P95 < 5s）
- 重试次数（> 2 次则告警）

**为什么 stage-level 监控重要**：5 stage pipeline 中任意一 stage 超时都导致整体失败，需要精确定位瓶颈。

## 与现有 wiki 实体的差异化

| 维度 | SchemaFlow | claude-code-large-codebase-harness-configuration |
|------|------------|--------------------------------------------------|
| **场景** | 数据库变更 + SQL 生成 | 大型代码库 Claude Code 配置 |
| **Stage 数** | 5 stage 流水线 | 主要是 prompt + 工具 |
| **Schema 约束** | Pydantic 强类型 | JSON Schema 较弱 |
| **Eval 护栏** | Promptfoo 规则 + LLM-as-judge | 无统一评估层 |
| **官方背书** | OpenAI Cookbook 范本 | Anthropic 官方文档 |

**结论**：SchemaFlow 是 **eval-first staged agentic workflow** 的范本，与 Claude Code 的 **monolithic prompt + tools** 范式形成对比。两者都值得参考，**SchemaFlow 适合风险敏感任务（SQL、金融），Claude Code 适合灵活任务（代码生成）**。

## 实践启示（Actionable）

1. **拆 5 stage 而非 1 prompt**：复杂 LLM 任务必须 staged，每 stage 独立可观测
2. **Pydantic 强类型**：LLM 输出从文本转数据结构，下游代码无需模糊解析
3. **RAG 而非全量 prompt**：大型上下文（DB schema、API docs）必须分块向量化
4. **Eval guardrails 不是可选**：LLM 输出不能直接进生产，必须有 Promptfoo 之类的 gate
5. **Stage-level 监控**：5 stage pipeline 需要每 stage 独立 metrics，便于定位瓶颈

## 深度分析

### 1. Staged workflow 的可观测性价值

5 stage 流水线的核心价值不在于"拆分任务"，而在于**错误局部化 + 失败可溯源**。单 prompt 架构中，SQL 生成失败时无法判断是 schema 理解错误、语法生成错误还是上下文不足导致的——错误会级联传播，最终输出"坏 SQL"但不知问题在哪。

分 stage 后，每阶段有明确的 Pydantic output schema，失败时立即知道是"Parse 阶段语义解析失败"还是"SQL Generation 阶段语法错误"，调试效率本质提升。

### 2. Generator-Evaluator 分离是 Eval-first 架构的核心

Promptfoo eval guardrails 体现的设计原则：**生成器（LLM）和评估器（Promptfoo rules + LLM-as-judge）必须分离**。这与 Harness Engineering 框架中"Generator-Evaluator 分离是最被低估的设计模式"完全一致。

SchemaFlow 的三层护栏（SQL injection detection、schema drift check、LLM-as-judge）本质上是把"LLM 自我纠错"拆成了独立的外部评估层——因为 LLM 自我评估存在系统性乐观偏误，不能依赖模型自己判断输出是否安全。

### 3. RAG 是上下文窗口的成本优化策略

PDF RAG schema context 的设计逻辑：大型企业 DB 可能有几千张表，全量 schema 喂给 LLM 会超出 context window 且 hallucination 率升高。RAG 让 LLM 只看 Top-K=5 相关表——这是**以检索精度换上下文长度**的经典工程权衡。

向量化（text-embedding-3）+ 分块（~500 tokens）+ Top-K 检索的组合，使 LLM 在有限 context 内始终看到高相关度 schema，生成准确率系统性提升。

### 4. Pydantic schema 将 LLM 输出从"模糊文本"变成"可编程数据结构"

这是 SchemaFlow 最重要的工程贡献。传统 LLM 输出是"文本"，需要正则解析才能取字段。Pydantic model 定义后，LLM 输出直接是类型化对象，下游代码 `output.affected_tables` 取值——**彻底消除文本解析层，降低约 30% 的下游脆弱性**。

配合 3 次重试机制（失败重试最多 3 次），强类型约束使 pipeline 的可预期性大幅提升。

### 5. 5 stage pipeline 的监控设计启示

Stage-level 监控（token 上限 2000、P95 < 5s、重试 > 2 次告警）揭示了一个关键工程原则：**pipeline 中任意一 stage 超时都导致整体失败，需要精确定位瓶颈**。

如果只监控"整体成功率"，在 5 stage 中定位具体瓶颈需要大量人工排查。Stage-level metrics 让平均修复时间（MTTR）从小时级降到分钟级。

## 三个独有贡献（不应合并到现有 entity）

1. **OpenAI 官方 Cookbook staged workflow 范本** — 5 stage 流水线 + Pydantic schema 的官方 reference
2. **Promptfoo eval guardrails 完整配置** — SQL injection detection + schema drift check + LLM-as-judge 三层护栏
3. **PDF RAG + schema context 实战** — 大型 schema 文档分块向量化的生产级实现

## 上线状态 / 链接

- 官方 Cookbook: https://developers.openai.com/cookbook/examples/partners/schemaflow_design_guide/schemaflow_cookbook
- SchemaFlow partner 工程: https://github.com/openai/openai-cookbook/tree/main/examples/partners/schemaflow_design_guide
- Promptfoo 项目: https://promptfoo.dev

## 原文存档

## 相关实体
- [Amazon Bedrock Agentic Payments Guardrails](../ch11/157-amazon-bedrock.html)
- [Ai Native Startup Cyberfund Guide](../ch05/019-ai-native.html)
- [From Prompt To Harness Claude Official](../ch05/099-harness.html)
- [Cursor Harness Model Production Floor](../ch01/320-cursor-harness-model-production-floor.html)
- [Agent Harness Architecture Deep Dive Aksahy](../ch05/039-agent-harness.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/schemaflow-agentic-database-sql-generation-openai-cookbook.md)

---

