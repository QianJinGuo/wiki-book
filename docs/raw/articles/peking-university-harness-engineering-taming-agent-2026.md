---
title: "北京大学 Harness Engineering — 驯服Agent：从Prompt到Loop的AI Agent工程体系"
source_url: "PDF附件（非微信文章）"
source_author: "AI肖睿团队（李晴）/ 北大青鸟人工智能研究院 / 北大计算机学院 / 北大教育学院学习科学实验室"
source_site: "北京大学"
ingested: "2026-07-23"
sha256: "3597263d8f3cd0d76f85ae47a9e1bf7b0bdd49460eebead381739ff6ddb06a7b"
type: "raw-article"
status: "raw"
tags: [harness-engineering, prompt-engineering, context-engineering, loop-engineering, agent-architecture, peking-university]
---

## 概述

北京大学 AI 肖睿团队（李晴）出品的 Harness Engineering 培训课件（82页），从 Prompt → Context → Harness → Loop 四阶段系统梳理 AI Agent 工程实践演进路径。

## 四大阶段

### Prompt Engineering（提示工程）
核心关注：如何说对话（优化指令）。角色、任务描述、输出格式、Few-shot、Chain-of-Thought。适用单轮/短任务，局限是模型容易"忘"、幻觉严重。

### Context Engineering（上下文工程）
核心关注：模型看到什么（优化输入环境）。RAG、记忆系统、会话历史管理、知识库、上下文压缩。解决多轮对话和知识密集型任务。

### Harness Engineering（驾驭工程）
核心关注：整个系统如何可靠运行。
核心公式：Agent = Model + Harness
Harness 解决的 7 大问题：
1. Agent "会做，但做不完"——缺少任务执行结构
2. AI 自己判断自己正确——执行者与裁判角色重叠
3. 复杂任务失控——边界模糊、子任务遗漏
4. 行为不可预测——同一输入输出不一致
5. 长期任务失忆——上下文丢失、状态难以保持
6. 多 Agent 协作混乱——职责、权限、调度不清晰
7. AI 软件开发无法规模化——缺乏审计、复现、追踪、回滚

### Loop Engineering（循环工程）
核心关注：如何实现长期自主运行与自我驱动。
在 Harness 基础上引入时间/调度维度和递归目标达成机制。从"人类在循环中"转向"人类设计循环"。

嵌套关系：Prompt ⊂ Context ⊂ Harness ⊂ Loop，层层递进非替代。

## Harness 核心架构

### 一层框架（3 Constraints）
- **Constraints**：让 AI 不乱做
- **Execution Loop**：让 AI 持续推进
- **Quality Gate**：让 AI 真正完成

### 二层框架（5 工程模块）
Context（该看到什么信息）、Memory（该记住什么）、Orchestration（下一步做什么）、State（进展到哪了）、Feedback（结果如何反馈）

### 三层框架（ETCLOVG 完整工程体系）
Execution Environment（执行沙箱）、Tool Interface（工具协议）、Context & Memory（上下文内存）、Lifecycle & Orchestration（生命周期编排）、Observability（可观测性）、Verification（验证评估）、Governance（治理安全）

## 核心概念起源
- Mitchell Hashimoto (2026.02)：在《My AI Adoption Journey》中首次提出 Harness Engineering
- OpenAI (2026.02)：发布《Harness Engineering: Leveraging Codex in an Agent-First World》— 三人团队5个月100万行生产代码
- Anthropic：聚焦长运行 Agent 的 Harness 设计（有效约束、上下文重置、规划/生成/评估分离）

## 设计原则
- 成本-质量-速度三元悖论
- 能力与管控此消彼长
- 层间耦合：局部优化≠全局最优

## 未来展望
- Loop Engineering：长期自主运行与自我驱动
- Agent OS：组件下沉与标准化基础设施
