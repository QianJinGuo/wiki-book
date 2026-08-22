# 小米零售 AI 问数实践：从 Text-to-SQL 到 Text-to-Metrics

## Ch01.1444 小米零售 AI 问数实践：从 Text-to-SQL 到 Text-to-Metrics

> 📊 Level ⭐⭐ | 2.2KB | `entities/xiaomi-retail-ai-qshu-问数实践-2026.md`

# 小米零售 AI 问数实践：从 Text-to-SQL 到 Text-to-Metrics

## 核心洞察

一线店长每天要面对"店里库存压了多少""新品销售怎么样"等问题，看似只是"问个数"，但要让 AI 真正服务业务，还需解决**指标口径、查询规则、数据权限**等问题。小米中国区零售团队从 **Text-to-SQL 转向 Text-to-Metrics**，并围绕**指标治理、语义路由、查询执行、评测体系**进行工程化建设。

## 关键设计

- **Text-to-Metrics 转向**：相比直接生成 SQL，先落到统一指标层，规避口径混乱与重复造轮子
- **指标治理**：统一指标定义、口径、语义，作为问答的稳定中间表示
- **语义路由**：把自然语言问题路由到对应的指标/指标族，而非逐问答建查询
- **查询执行**：指标语义到实际数据源查询的映射与执行链路
- **评测体系**：对问答准确率/口径一致性做系统化评估，形成闭环

## 与现有体系的关系

本文属 [Agent 驱动数据访问](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-driven-data-access.md) 与 [Agentic RAG](https://github.com/QianJinGuo/wiki/blob/main/concepts/agentic-rag-patterns.md) 的具体工程案例，补充了 Text-to-Metrics 这一指标层范式。与 [零售多 Agent 架构实践](../ch03/019-agent.html)、[小米 AI 工程化三层实践](../ch05/109-ai.html) 同属小米/零售 AI 落地系列。

## 价值

- 提供了从 generator 直接写 SQL 到"先落指标层再查询"的**可迁移工程范式**，对数据问答类 Agent（BI、经营分析、智能客服）有直接参考价值
- 指标治理 + 语义路由 + 评测闭环的完整链路值得复用

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/xiaomi-retail-ai-qshu-问数实践-2026.md)

---

