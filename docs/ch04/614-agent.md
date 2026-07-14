# 万级实时推理的商品领域Agent实践思考和总结

## Ch04.614 万级实时推理的商品领域Agent实践思考和总结

> 📊 Level ⭐⭐ | 3.4KB | `entities/taobao-product-domain-agent-architecture.md`

# 万级实时推理的商品领域Agent实践思考和总结

## 深度分析

本文来自淘天集团商品中心技术团队，详述商品域如何构建"事件驱动的Function-Centric Agent架构"，实现万级实时推理，覆盖亿级商品。

**核心技术架构**：
- 两层结构：上层workflow编排层 + 下层统一能力供给层，通过AIFunction接口交互
- 轻量aiagentsdk：@AIWorkflow、@AIAction、@AIFunction、@AIParameter、@AIResult、@AIResultField注解体系
- 链式调用规范：`registry.item().query().invoke(params)`

**商品领域知识库三层**：
1. 显性事实知识（客观描述）→ 运营决策、prompt增强
2. 关联情景知识（主配件场景）→ 10个类目10000条案例，53条规则
3. 隐性经验知识（用户/专家经验）→ 商品卖点、参数说明

**在离线统一方案**：
- Function/Action/Workflow三组件标准化
- 离线批量推理（调度触发）+ 在线增量推理（实时事件驱动）
- 统一存储：MySQL（在线）+ ODPS（离线）

**实时推理关键**：精卫链路基于商品ID+事务ID聚合变更，将处理量级降低一个数量级。

**应用效果**：覆盖亿级商品，搜索转化率提升，新需求1周/人交付。

## 实践启示

1. **Java生态Agent选型**：spring-ai-alibaba是集团内落地的最优选择，与现有系统集成成本最低
2. **Function-Centric设计**：通过AIFunction标准化封装工具和领域知识，上层workflow可灵活编排
3. **事务型事件驱动**：商品领域事件的聚合转发是实现实时推理的关键基础设施
4. **三层知识库**：显性→情景→隐性的递进设计，覆盖了商品智能化的完整知识需求
5. **在离线统一**：同一套Workflow逻辑，通过触发源差异区分在线/离线，代码复用率最大化

## 相关实体
- [Tmic Ai Xiaoxin Deepagent Architecture Evolution](../ch03/046-agent.html)
- [Verizon Connect Agentic Ai 100K Users](ch04/110-verizon-connect-agentic-ai-10.html)
- [Skillos Learning Skill Curation For Self Evolving Agents](ch04/144-skillos-learning-skill-curation-for-self-evolving-agents.html)
- [Co Existence Paradigm Shift Agentic Ai Mollick 2026](../ch01/589-ai-mollick.html)
- [Huggingface Ai Agent Glossary Model Scaffolding Harness Tool Skill Subagent](ch04/291-ai-agent.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/taobao-product-domain-agent-architecture.md)

---

