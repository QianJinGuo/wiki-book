---
title: "从 Coder 到 Designer：电商团队数据研发的 Harness Engineering 实践"
source_url: "https://mp.weixin.qq.com/s/B1xFrqhjsoXbK0aWh79vGg"
source_site: "mp.weixin.qq.com"
source_author: "白林林｜阿里技术"
ingested: "2026-07-14"
sha256: "ff6d8a1b2cb5be02c34fe4a1d296bdaa43a7d20a7e6a06e14e21d9eec87b6844"
type: "raw-article"
tags: [alibaba, harness-engineering, nl2sql, multi-agent, knowledge-engineering, data-rd]
status: "ingested"
---

# 从 Coder 到 Designer：电商团队数据研发的 Harness Engineering 实践

> 阿里技术团队在数据研发领域的 AI 化实践，通过知识工程 + Harness Engineering 实现 NL2SQL 多 Agent 工作流。

## 项目背景

调研发现两个共性问题：
- **横向拓展能力不足**：各业务垂直方案效果出色但缺少标准化接口，其他业务接入只能发挥约 30%
- **数据资产沉淀不足**：NL2SQL 准确度强依赖语义层质量，不同团队语义组织方案各异

核心认知：数据研发的知识是碎片化的，流程是非标准化的。

## 技术架构

### 知识工程（解决「AI 凭什么能做对」）
将数研专家经验、业务规则、数据资产转化为 LLM 可理解的结构化知识体系。

**NL2DSL2SQL 路线**：自然语言 → 标准化的指标-维度语义（DSL）→ SQL。语义层解决自然语言中缺少关键信息的问题。

**三层知识架构**：
1. **方法论层**：Spec 指导需求分析、Plan 规范技术方案、Task 定义执行标准 — "文档即接口"
2. **协作机制**：文档状态机驱动 8 阶段研发流程 + 人工校验飞轮
3. **执行原则**：基于经验初始化，通过需求调试持续优化

### Harness Engineering（解决「AI 如何稳定运行」）
核心手段：分离关注点、施加约束（Gate 机制）、管理上下文、管理熵值。

与传统 CI/CD Pipeline 的核心区别：Harness 需处理 AI 的不确定性——AI 的每个步骤都可能产生意料之外的输出。

## 7 Agent 多 Agent 工作流

采用**顺序协作 + 反馈循环**组合：

1. **顺序协作**：老架（需求分析）→ 小需（SPEC）→ 老架审核 → 小语（资产盘点）→ 老架（技术方案）→ ... 严格流水线
2. **反馈循环**：下游发现问题可回滚到上游（如小检发现 SQL 质量 → 任务返回老架决策是否重新生成）

关键节点设人工 Gate 审批：**AI 做执行，人做决策**。

## 稳定性工程

### 应对策略（幻觉防控）
1. **技能幻觉检测 Hook**：每次技能执行后对比 Agent 声称结果与实际状态（如文件是否真存在、API 返回值是否合理）
2. **执行结果强制校验**：关键操作必须产出可验证产物
3. **日志必看原则**：Agent 的每个操作都需要检查配置或改动是否真正更新

### 空间隔离
- 独立 Workspace：`~/.openclaw/workspace/{project_name}/`
- 命名规范：`{domain}_{date}_{seq}`
- MCP/Skill 加载路径优先级：子 Agent workspace → 全局 fallback

### 配置治理
- 自动化 Git 备份 + agents.md 同步机制 + 模板化重新配置

## 自动化自我迭代：心跳机制

三层级：
1. **执行监控**：定期回顾成功率、失败原因、用户修正记录
2. **模式识别**：识别反复出现的问题模式
3. **自动优化**：优化 Prompt 模板、补充知识条目、调整工作流参数

**核心闭环**：人对 Agent 行为的修正 → 自动写回知识库和配置 → 下次自动包含。

## 演进展望

- 近期：Multi-Agent 工作流验证
- 中期：知识工程成熟化 + 幻觉防控自动化 + 可观测性提升
- 长期：从单团队到跨团队的知识复用 — **「只做选择，不做配置」**
