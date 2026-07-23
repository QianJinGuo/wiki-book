# Agent vs Workflow：控制权连续谱与生产级选型框架

## Ch04.645 Agent vs Workflow：控制权连续谱与生产级选型框架

> 📊 Level ⭐⭐ | 3.2KB | `entities/agent-vs-workflow-control-continuum-framework.md`

# Agent vs Workflow：控制权连续谱与生产级选型框架

> Agent 和 Workflow 的核心分水岭不是"用没用 LLM"，而是**谁掌握流程控制权**。Workflow 追求可预测性，Agent 解决不可预测性。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agent-vs-workflow-control-continuum.md)

## 自主性连续谱（Level 0-5）

| 等级 | 名称 | 控制模式 |
|------|------|---------|
| L0 | 普通 LLM 调用 | 开发者完全控制 |
| L1 | LLM Workflow | 流程代码控制，节点内用 LLM |
| L2 | 动态 Router Workflow | 模型输出决定分支，路径预设 |
| L3 | Tool Calling Agent | 模型在工具集中选择 |
| L4 | Planning Agent | 模型拆解任务、制定计划、重规划 |
| L5 | Long-running Agent | 跨时间运行，长期状态，任务队列 |

每往上一层，模型控制权更多，系统需要的工程约束也更多。这就是 Agent 原型快但生产化难的原因。

## 核心对比

- **Workflow**：路径可枚举，质量可验收，成本稳定，异常可追踪
- **Agent**：目标清楚，路径不确定，需根据环境反馈持续调整
- **工程化后的 Agent** → 加入循环上限、白名单、权限、Retry、Checkpoint、Human Approval、State Machine、Budget Limit — 最终成为 **Agentic Workflow**

## 选型九问

1. 步骤可提前穷举？
2. 中间状态可提前预测？
3. 需和未知环境交互？
4. 需根据结果重规划？
5. 错误成本多高？
6. 要求严格 SLA？
7. 允许人工介入？
8. 单次任务预算？
9. 需审计完整轨迹？

## 三种混合架构

1. **Workflow 包含 Agent**：整体流程明确，复杂节点交给 Agent
2. **Agent 调用 Workflow**：Agent 规划后调用确定性 Workflow Tool
3. **Agent 规划，Workflow 执行**：Planner → Workflow Engine，分离"想办法"和"安全执行"

## 场景推荐

| 场景 | 推荐模式 |
|------|---------|
| 审批/支付/生产发布 | Workflow 为主 |
| Coding/Data Analysis/Research | Agent + 约束 |
| 知识库问答+工单 | Workflow + Agent 混合 |
| 市场调研/竞品分析 | Agent（探索性） |
| 海量客服/批量审核 | 谨慎 Agent 化 |

## 关联

- [Loop Engineering](../ch05/005-loop-engineering.html) — Agent 的循环决策架构
- [Claude Code 工具系统](../ch03/076-claude-code.html) — 生产级 Agent 工具系统设计
- [AI Agent 工具数量陷阱](ch04/030-ai-agent.html) — Agent 工具工程
- [阿里 Harness 工程实战：Agent 自主迭代 17 小时](../ch05/018-harness.html) — 父子 Agent 模式体现了控制权连续谱的层级 delegation

---

