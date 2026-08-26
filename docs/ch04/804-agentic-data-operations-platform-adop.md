# Agentic Data Operations Platform (ADOP): 数据工程压缩到小时级

## Ch04.804 Agentic Data Operations Platform (ADOP): 数据工程压缩到小时级

> 📊 Level ⭐⭐ | 2.7KB | `entities/agentic-data-operations-platform-adop-architecture.md`

# Agentic Data Operations Platform (ADOP): 数据工程压缩到小时级

## 核心洞察：agents-in-dev / artifacts-in-prod

ADOP（Agentic Data Operations Platform）是 AWS 上的一套参考架构，核心设计选择是 **build-time accelerator 而非 runtime dependency**：AI Agent 只在开发环境运行，负责推理、提议、生成 ETL 代码、质量检查、语义层定义和合规控制；工程师审查输出后，CI/CD 把生成的**确定性产物**（PySpark、SQL、Airflow DAG、IAM 与 Cedar 策略）提升到 staging 和生产。生产环境默认运行确定性产物、**不调用模型**；需要 model-in-the-loop 的组织可通过 Bedrock 端点扩展，但生成的 pipeline 代码本身保持静态、可审计。

## 三类角色的变化

- **数据工程负责人**：工程师从管道接线（pipeline plumbing）转向交付数据产品；合规从下游门禁变成 onboarding 时点的内联控制。
- **架构治理**：由你的架构（而非模型）主导每一个 AI 编码工具（Claude Code、Kiro、Cursor、Codex）如何与数据系统交互。
- **数据平台总监 / CDO**：通过生成式开发把传统需要数周的单数据源上线（写 ETL、手写质量检查、更新语义模型、验证合规）压缩到小时级。

## Bronze → Silver → Gold 生命周期自动化

ADOP 用专用 AI Agent 自动化完整的 Bronze→Silver→Gold 数据分层生命周期，并带可配置控制以支持数据治理与合规。核心价值主张是"**你的架构，而非模型，治理 AI 编码工具与数据系统的交互**"——把 AI 的产物当成可审查、可版本化的工程产物，而非不可信的运行时黑盒。

## 与既有模式的关系

该模式与 [Agent-Driven Data Access](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-driven-data-access.md) 一脉相承，但把 Agent 定位为**开发期生成器**而非运行时消费者。它回答了"AI 生成的数据管道代码如何进入生产"这一治理问题——通过确定性产物 + 静态审计，而不是让模型在生产链路中持续介入。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agentic-data-operations-platform-adop-data-engineering-into-.md)

---

