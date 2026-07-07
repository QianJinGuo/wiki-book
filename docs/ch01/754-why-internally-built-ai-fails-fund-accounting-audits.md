# Why Internally-Built AI Fails Fund Accounting Audits

## Ch01.754 Why Internally-Built AI Fails Fund Accounting Audits

> 📊 Level ⭐⭐ | 5.7KB | `entities/ai-fails-fund-accounting-audits.md`

# Why Internally-Built AI Fails Fund Accounting Audits

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ai-fails-fund-accounting-audits.md)

## 摘要

COSO 2026 年 2 月发布的《Achieving Effective Internal Control Over Generative AI》与 PCAOB AS 2201 审计标准共同抬高了基金会计领域 AI 系统的审计门槛。自建 AI 方案无法回答审计师必问的两个问题：「能否证明 AI 看到了什么」以及「能否证明它与上季度运行的是同一套系统」。文章提出的核心论点是：审计就绪的 AI 不是一个功能特性，而是一个架构决策——AI 在构建时生成经验证的逻辑，运行时执行确定性代码，配合防篡改审计追踪和平台级 maker/checker 机制。

## 核心要点

1. **两个审计必问题**：COSO 2026 和 PCAOB AS 2201 要求 AI 系统回答——(1) 能否证明 AI 看到了什么（不可变的输入/逻辑/模型版本/审查者记录）；(2) 能否证明本季度与上季度运行的是同一系统（可复现性和变更治理）

2. **六大失败模式**：自建 AI 在基金会计场景中反复出现的六类问题——无可篡改审计追踪、模型静默漂移、输出非确定性、无变更治理、IT 接手不转移合规责任、每次变更重新引发所有审计质疑

3. **构建时 vs 运行时分离**：AI 在构建时生成经验证的规则引擎（如瀑布分配逻辑、GP/LP 分成），运行时引擎是确定性代码——相同输入永远产生相同输出，不存在实时 LLM 调用

4. **确定性架构取代幻觉管理**：基金会计的计算（追补条款、优先回报、管理费瀑布、GP/LP 分配）本质上是规则绑定的确定性计算，不是概率猜测。可审计架构强制执行确定性，而非让团队在每次结账时管理幻觉风险

5. **平台级 maker/checker**：职责分离在系统层面强制执行，而非通过邮件或 Slack。每个输出在发布前流经结构化审查工作流和角色权限控制——这是审计师测试的 SOX 等效控制

## 深度分析

### 审计标准的技术影响

COSO 2026 指南和 PCAOB AS 2201 的组合效应是将 AI 纳入与传统系统相同的变更管理和可复现性测试框架。这并非新概念——所有控制宇宙中的系统都必须通过这些测试。新的是，大多数自建 AI 的架构本身无法通过这些测试。

会话历史可编辑、模型静默漂移、输出非确定性、无版本控制变更治理——这些问题不是 bug，而是自建方案的结构性特征。

### 架构五层控制模型

文章提出的可审计 AI 架构包含五个控制层：

| 控制层 | 功能 | 审计标准映射 |
|--------|------|-------------|
| 防篡改审计追踪 | 每笔交易产生只读记录（输入、逻辑版本、审查者） | PCAOB AS 2201 |
| 确定性执行 | 相同输入→相同输出，无实时 LLM 调用 | COSO 2026 |
| 版本控制与回滚 | 逻辑变更版本化、沙箱测试、回滚能力 | 变更管理 |
| 平台级 maker/checker | 角色权限、结构化审查工作流 | SOX 等效 |
| Agent 治理平台 | Agent 处理交易，平台记录、治理、证明 | Agentic 时代 |

### IT 接手 ≠ 合规转移

一个常见误区是「让 IT 来建就行了」。但合规断言（compliance assertion）的所有权在财务团队，不在 IT。IT 维护的是一个它不执行的工作流的 AI 逻辑——这种权责错位在审计中是致命的。

### Build vs Buy 的真正问题

真正值得问的 build vs buy 问题不是「能不能用通用模型包一层」，而是「IT 团队能否在一个季度内构建上述五层控制架构」。文章的答案是：这是多年基金会计工程经验的产物，针对不断演进的审计标准执行。

## 实践启示

1. **架构先行**：审计就绪是架构决策，不是功能特性。在 AI 进入基金会计流程之前，必须先确定构建时/运行时分离、确定性执行和审计追踪架构
2. **确定性优先**：对于规则绑定的金融计算（瀑布、分配、费用），应使用 AI 在构建时生成逻辑、运行时执行确定性代码，而非在运行时调用 LLM
3. **治理 ≠ 合规**：自建方案即使功能正确，也可能因缺少防篡改审计追踪、版本控制和 maker/checker 而在审计中失败
4. **Agent 治理平台**：随着 Agent 执行更多基金管理工作流，平台本身就是控制——Agent 处理交易，平台记录、治理并证明
5. **权责对齐**：合规断言的所有权必须明确——IT 可以构建和维护系统，但财务团队拥有合规责任，不能通过「交给 IT」来转移

## 相关实体

- [MCP 生产级设计模式](ch01/846-anthropic.html)
- [Agent Harness](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- [Agentic Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agentic-engineering-paradigm.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/observability-monitoring.md)

---

