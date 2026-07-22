# AI Infra 全景图：9 层 Agent 生产架构

## Ch11.224 AI Infra 全景图：9 层 Agent 生产架构

> 📊 Level ⭐⭐ | 5.1KB | `entities/ai-infra-panorama-9-layer-agent-production.md`

# AI Infra 全景图：9 层 Agent 生产架构

> 从 L0 到 L8 逐层拆解 AI Agent 生产级基础设施，9 层纵向架构 + 4 个横切能力，工具选型与最佳实践。

> 核心洞察：生产级 Agent 失败的原因不在模型或算法，而在 Infra。Demo 只需要 L1（模型）+ L4（编排），生产需要全部 9 层 + 4 横切。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ai-infra-panorama-9-layer-agent-framework-production.md)

## 9 层架构全景

| 层级 | 名称 | 核心问题 | 关键组件 |
|------|------|----------|----------|
| **L0** | 基础资源层 | 模型和应用运行在哪里？ | GPU/TPU、K8s、Ray、S3/MinIO |
| **L1** | 模型与推理层 | 用哪个模型？怎么降本？ | vLLM、LiteLLM、Model Gateway、Fallback |
| **L2** | 数据与知识层 | 如何用企业私有知识？ | RAG Pipeline、Vector DB、Reranker、KG |
| **L3** | Prompt 与上下文层 | 如何组织可靠输入？ | Prompt Mgmt、Guardrails、Token Budget |
| **L4** | 编排与 Agent 层 | 任务如何拆解执行？ | LangGraph、CrewAI、AutoGen、OpenAI SDK |
| **L5** | 工具执行层 | Agent 能做多少事？ | MCP、Function Calling、E2B 沙箱 |
| **L6** | 状态与记忆层 | 系统如何记住一切？ | Mem0、MemGPT、Short/Long-term Memory |
| **L7** | 评测与质量层 | 改动后质量变化？ | RAGAS、Golden Set、LLM-as-Judge |
| **L8** | 可观测与运营层 | 问题定位与成本归因？ | OpenTelemetry、LangFuse、Grafana |

## 4 个横切能力

贯穿所有 9 层的横向能力：

1. **安全治理** — 从 L0 网络隔离到 L8 审计日志，每层都有安全考量
2. **CI/CD 与发布治理** — Prompt 版本控制、评测门禁、回滚机制
3. **FinOps 成本治理** — Token 追踪、GPU 利用率、模型路由策略
4. **开发者体验（DevEx）** — 本地开发环境、一键部署、调试工具

## 分阶段落地路线图

**验证期（0-1 月）**：L1（API 直调）+ L2（Qdrant）+ L4（LangGraph）+ L6（内置 Memory）+ L8（LangFuse）

**原型期（1-2 月）**：增加 L1（LiteLLM 统一网关）+ L3（Prompt 管理）+ L5（E2B 沙箱）+ L7（RAGAS + Golden Set）

**生产期（持续迭代）**：L0（K8s + GPU 弹性）+ L1（自建 vLLM 网关）+ L2（Hybrid Search + Reranker）+ L3（Guardrails）+ L4（多 Agent 分层）+ L5（MCP 标准化）+ L6（长期记忆）+ L7（在线评测）+ L8（OpenTelemetry）+ 全部横切能力

## 核心洞察

- **大多数团队只关注 L4（Agent Framework）+ L2（向量库）**，忽略了其他 7 层和 4 个横切能力
- **Agent 不是银弹，框架不是万能的**：简单任务用硬编码工作流 > Agent 自主编排；中等复杂用 LangGraph 有状态图；高度复杂用多 Agent 分层 + Human-in-the-loop
- **安全边界三原则**：Agent 只能调用已注册工具；工具执行不返回系统权限；高危操作加人工确认
- **没有评测就没有质量控制**：Golden Set（100-500 条典型用例）+ 门禁（评分下降 > 5% 阻止发布）
- **完整的 AI Infra** ≠ 模型 + LangChain + 向量库，而是 11 个组件的有机整合

## 相关实体

- [Harness Engineering：AI 从"聪明"到"可靠"的第三代工程范式](../ch05/116-harness-engineering.html) — 互补概念：Harness 关注如何构建可靠 AI 系统，AI Infra 关注需要哪些基础设施组件
- [Loop Engineering：反馈控制系统](../ch05/007-loop-engineering.html) — Agent 运行时的闭环控制
- [腾讯研究院 AI 速递](../ch05/089-ai.html) — 行业动态
- [Agentic AI System Architecture](../ch05/086-harness-skill.html) — 分层 Agent 系统架构（5 层：Orchestrator → Harness → Skill → MCP → Model）

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ai-infra-panorama-9-layer-agent-framework-production.md)

---

