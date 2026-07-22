---
title: MCP · Skill · Agent · LLM · Harness — 一张图讲清：Agentic AI 系统如何真正落地
source_url: https://mp.weixin.qq.com/s/aoNMS78xIsmqW5IXN_OXOA
publish_date: 2026-04-29
tags: [wechat, article, agent, harness, rag, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: dba89e5ca3e18163a7dd66e24e4b3b4d7b691d244add3fc375cdf1da1ee3749e
---
# MCP · Skill · Agent · LLM · Harness — 一张图讲清：Agentic AI 系统如何真正落地
> 作者：霍旭东（ThinkingInDev），2026-04-29
## 核心架构（三层结构）
### 1. 能力执行主链
Agent → LLM → Skill → MCP → External World
逐层下沉：Agent（任务编排）→ LLM（认知推理）→ Skill（能力封装）→ MCP（连接协议）→ External（真实世界）
### 2. 认知-行动-记忆闭环
External → MCP → Skill → Agent → Memory → LLM
不是一次调用，而是持续迭代的闭环系统。对应ReAct / Plan-Execute / Reflexion范式。
### 3. 横切全局的Runtime（Harness）
Harness = AI系统的操作系统，覆盖所有层，不在链路上。
## 逐层拆解
### L4：Agent（应用与编排层）
核心结构：State → Planner → Executor → Verifier → Reflector
职责：任务拆解、工具选择、多轮执行、结果校验、反思优化
本质：LLM的"具身执行体"
### L3：LLM（认知引擎）
能力：理解(NLU)、推理(Reasoning)、规划(Planning)、生成(Generation)
注意：LLM不负责执行、不直接操作世界；它只负责"决定怎么做"
### L2：Skill（能力SDK）
Skill = 可复用的业务能力封装 = Tool + 语义 + 流程 + 组合能力
包括：数据分析、报表生成、订单处理、文档处理等
### L1：MCP（连接与协议层）
本质：AI世界的"统一接口标准"
解决问题：工具调用不统一、权限混乱、数据格式不一致
核心能力：Tool Schema、能力发现、权限控制、数据规范、连接管理
### L0：External World（外部世界）
数据库、ERP/CRM、SaaS、API、文件系统、人工流程
关键认知：AI不创造价值，它只是调度价值
## Memory 分层
| 类型 | 用途 | 归属 |
|------|------|------|
| 短期记忆（Session Memory） | 当前任务上下文、对话历史 | Agent（控制流程） |
| 长期记忆（RAG） | 向量数据库、知识库 | LLM（增强认知） |
## Harness 的六大职责
1. 调度（Scheduler）：多任务执行、Agent编排、并发控制
2. 执行控制（Execution Control）：超时控制、重试机制、熔断策略
3. 可观测性（Observability）：Tracing、Logging、Metrics
4. 评测（Eval）：离线评估、在线反馈、A/B Test
5. 安全治理（Governance）：权限控制、数据安全、内容安全、合规
6. 资源管理（Resource）：Token控制、成本管理、限流
## 典型执行流程（闭环）
1. 用户输入需求 → Agent 理解并拆解任务 → LLM 推理与规划
2. Agent 选择 Skill/Tool → 通过 MCP 调用外部能力
3. 执行并获取结果 → Verifier 校验 → Reflector 反思优化
4. 写入 Memory → 输出最终结果
## 关键认知
- "从Demo到生产"的分水岭不在模型，而在架构设计
- LLM负责思考，Agent负责执行，Skill提供能力，MCP连接世界，Harness让一切变得可控
- 不是一次调用，而是循环收敛