# AgentCore Harness 行程分配与优化多智能体系统

## Ch04.654 AgentCore Harness 行程分配与优化多智能体系统

> 📊 Level ⭐⭐ | 2.8KB | `entities/agentcore-harness-trip-allocation-multi-agent-system-aws.md`

# AgentCore Harness 行程分配与优化多智能体系统

本文以大型头部旅行社"大规模集体出行任务"为案例，结合 LLM 语义理解能力与运筹学求解器的确定性，基于 AWS Bedrock AgentCore harness 开发了一套高效、稳定、可人工审核、可循环迭代的行程分配与优化 Multi-Agent 系统。

## 核心挑战

大规模集体出行任务（数千人/上万人规模）涉及人员分布在不同城市、拥有不同的职级/身份/舱位资格与出行偏好；可供调度的航班资源、国内联程接驳、口岸资源等都有相应限制；同时出行方案还需要满足企业财务的成本目标、出行便利度目标。长期以来，这类任务完全依赖行业专家手工处理，以"月"为单位完成，耗时费力且难以优化。

## 系统架构

系统基于 Amazon Bedrock 的 AgentCore harness 构建，利用 LLM 的语义理解能力解析复杂约束，同时结合运筹学求解器（OR-Tools）提供确定性优化。系统包含以下关键设计：

- **Multilingual Agent Collaboration**：对每个出行人员使用独立的 Agent 实例，并行处理约束计算
- **Constraint Extraction with AgentCore**：利用 LLM 从非结构化的出行需求中提取约束条件
- **Optimization Engine**：基于约束规划(CP-SAT)求解器进行全局优化，输出满足所有约束的行程分配方案
- **Human-in-the-loop**：支持人工审核和干预，可循环迭代

## 技术实现

系统实现了从需求解析、约束提取、资源匹配、到行程优化的完整 pipeline。通过将 LLM 的语义理解与运筹学求解器的确定性结合，在保证方案可行性的同时优化经济效益。在多个运行分析中取得了较为满意的效果。

## 工程落地

文章详细讨论了从 PoC 到生产环境的关键工程挑战，包括 Agent 协作中的状态管理、异常恢复、可观测性和成本控制。相比模型能力本身，这些工程能力往往是决定 Multi-Agent 系统能否真正落地的关键。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agentcore-harness-trip-allocation-multi-agent-system-aws.md)

---

