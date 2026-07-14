# 阿里数据研发 Harness Engineering：NL2SQL × Multi-Agent × 知识工程

## Ch05.124 阿里数据研发 Harness Engineering：NL2SQL × Multi-Agent × 知识工程

> 📊 Level ⭐⭐⭐ | 2.3KB | `entities/alibaba-data-rd-harness-engineering-nl2sql.md`

# 阿里数据研发 Harness Engineering 实践

> 阿里技术团队在数据研发领域通过知识工程 + Harness Engineering 实现 NL2SQL 多 Agent 工作流，涵盖 7 Agent 协同、幻觉防控、心跳自迭代等完整工程化方案。

## 核心问题

数据研发知识碎片化、流程非标准化。横向拓展能力不足（各业务接入仅发挥约 30% 能力），数据资产沉淀不足。

## NL2DSL2SQL 路线

自然语言 → 标准化的指标-维度语义（DSL）→ SQL。语义层解决自然语言中缺少关键信息的问题。

## 7 Agent 多 Agent 工作流

顺序协作 + 反馈循环组合。Agent 设计：**老架**（需求分析）→ **小需**（SPEC）→ 老架审核 → **小语**（资产盘点）→ 老架（技术方案）→ ... 关键节点设人工 Gate 审批。

## 稳定性工程

### 幻觉防控三策略
1. **技能幻觉检测 Hook**：执行后对比声称结果与实际状态
2. **执行结果强制校验**：可验证产物（文件/数据/状态变更）
3. **日志必看原则**：每个操作检查是否真正更新

### 工作空间隔离
独立 Workspace、命名规范 `{domain}_{date}_{seq}`、MCP/Skill 加载路径优先级控制。

## 心跳机制（三层自迭代）

1. **执行监控** → 2. **模式识别**（反复问题）→ 3. **自动优化**（Prompt/知识库/参数调整）

**核心**：人为修正自动写回知识库和配置，实现"以 Agent 养 Agent"。

## 知识工程

三层体系：方法论层（Spec/Plan/Task）→ 协作机制（文档状态机）→ 执行原则。**"文档即接口"**，研发即沉淀。

## 愿景

从"只做选择，不做配置"—— 数研同学从写代码的人转变为做设计的人。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/alibaba-harness-engineering-nl2sql-data-rd.md)

---

