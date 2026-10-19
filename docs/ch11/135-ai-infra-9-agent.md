# AI Infra 全景图：9 层 Agent 生产架构

> 📊 Level ⭐⭐⭐⭐ | 11.3KB

> 从 L0 到 L8 逐层拆解 AI Agent 生产级基础设施，9 层纵向架构 + 4 个横切能力，工具选型与最佳实践。

> 核心洞察：生产级 Agent 失败的原因不在模型或算法，而在 Infra。Demo 只需要 L1（模型）+ L4（编排），生产需要全部 9 层 + 4 横切。

→ [原文存档](https://mp.weixin.qq.com/s/dmlwqGylzG0eQVUlcZocUQ)

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

## 深度分析

### 为什么是 9 层，而不是更简单的技术栈？

文章的分层逻辑本质上是把「Demo → 生产」的失败模式逐一映射到独立的基础设施层。Demo 只需要 L1（模型 API）+ L4（编排框架）就能跑通，但一旦进入生产，每一层缺失都会以特定方式爆雷：没有 L2（数据与知识层）就无法安全使用企业私有知识；没有 L3（Prompt 与上下文层）就无法保证输入的可靠性；没有 L5（工具执行层）就没有安全的执行边界；没有 L6（状态与记忆层）就无法支撑多轮与跨会话场景；没有 L7（评测与质量层）任何改动都是盲改；没有 L8（可观测与运营层）出了问题无法定位、成本无法归因；没有 L0（基础资源层）则弹性与成本完全失控。9 层不是随意堆砌，而是把「生产级稳定性取决于哪些因素」这个问题的完整答案摊开——参见 [Production Agent Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/production-agent-engineering.md) 的工程化视角。

值得注意的反面推论：文章指出「简单任务用硬编码工作流 > Agent 自主编排」，说明层级的丰富度应该与任务复杂度匹配，而不是无条件堆满。9 层是生产级目标态，不是起步态——这与 [Agent Orchestration Patterns](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-orchestration-patterns.md) 中「控制方式应随任务复杂度滑动」的思想一致。

### 4 个横切能力为什么必须贯穿每一层？

纵向 9 层解决「功能从哪来」，横向 4 个能力解决「系统能否持续安全、可交付地运行」：

1. **安全治理**：文章给出了逐层映射（L0 网络隔离 → L3 Prompt Injection 防护 → L5 沙箱与工具鉴权 → L6 记忆隐私 → L8 审计日志），说明安全不是某一层的责任，而是每层都有独立的攻击面，参见 [Agent Security Architecture](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-architecture.md)。
2. **CI/CD 与发布治理**：Prompt 版本控制、评测门禁、回滚机制——Agent 系统的「代码」不只是程序，还包括 Prompt、模型版本和 Agent 配置，三者都需要发布流程。
3. **FinOps 成本治理**：Token 追踪、GPU 利用率、模型路由（便宜模型优先）——Agent 的成本结构与传统软件完全不同，不治理则成本随使用量线性爆炸。
4. **开发者体验（DevEx）**：本地环境、一键部署、调试工具——9 层架构越复杂，DevEx 越是团队速度的决定因素。

把横切能力当作「事后补」是常见失败路径：安全、成本、评测若不在架构初期进入设计，后期改造成本极高。

### 分阶段路线图的内在逻辑

三阶段路线（验证期 → 原型期 → 生产期）遵循「按风险和复用价值排序」的原则，而非按层级编号顺序建设：

- **验证期（0-1 月）**只建「跑通所需的最小集」：L1 API 直调 + L2 Qdrant + L4 LangGraph + L6 内置 Memory + L8 LangFuse。值得注意的是验证期就引入了 L8（可观测），而不是留到最后——没有观测数据，验证期本身积累的对话轨迹就浪费了。
- **原型期（1-2 月）**补齐「可靠性骨架」：LiteLLM 统一网关（Fallback）、L3 Prompt 管理、L5 E2B 沙箱、L7 RAGAS + Golden Set。这一阶段的关键动作是让评测成为默认习惯。
- **生产期（持续迭代）**才投入「重资产」：L0 K8s + GPU 弹性、自建 vLLM 网关、Hybrid Search + Reranker、Guardrails、多 Agent 分层、MCP 标准化、长期记忆、在线评测门禁、OpenTelemetry。这些组件投入大、粘性强，放在验证过产品价值之后。

这个顺序的深层逻辑是：先用托管服务降低试错成本，等假设被验证后再自建——与 [Local Vs Cloud Agent Deployment Strategy](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/local-vs-cloud-agent-deployment-strategy.md) 类似的「先借力后自建」模式。

### 全景图对团队组织设计的含义

9 层 + 4 横切对团队结构的启示：

- **没有单一团队能覆盖全部 11 个组件**。L0-L1 需要传统 Infra/GPU 平台能力，L2-L3 需要数据与 NLP 背景，L4-L6 是应用工程，L7-L8 需要质量与 SRE 文化，横切能力则分别对应安全、发布、FinOps、平台工具团队。
- **最容易被遗漏的角色是 L7（评测）和 L8（可观测）的 owner**。大多数团队把评测当兼职、可观测当插件，结果是质量回归和成本失控无人负责。文章的暗示是：这两个层应该是专职职能，类似传统软件的 QA 和 SRE。
- **平台团队 vs 业务团队的分工**：一个合理的组织形态是建一个「AI 平台组」统一持有 L0/L1/L8 和 CI/CD、FinOps、DevEx 横切能力，业务团队只碰 L3/L4 和业务工具（L5 的一部分），评测体系（L7）双方共建 Golden Set。
- **DevEx 是平台团队的 KPI 而非附加项**：如果业务团队接入 9 层架构的摩擦大，他们就会绕过平台自建影子栈，横切治理随之失效。

## 实践启示

1. **先做 L8，再做其他**：验证期就接入 LangFuse 等观测工具，从第一天积累轨迹数据。没有可观测，后续每一层的优化都是盲调。
2. **在 L4 上克制**：框架选型是团队最兴奋、但杠杆最低的决策。简单任务硬编码，中等复杂度用有状态图，只有高度复杂才上多 Agent 分层——先把决策规则写进团队规范。
3. **让评测门禁先于模型迭代**：在换模型、改 Prompt、调工具之前先建 Golden Set（100-500 条典型用例）和「评分下降 > 5% 阻止发布」的门禁。没有门禁，任何一次「优化」都可能引入不可见的回归。
4. **成本治理要从 Token 追踪开始**：FinOps 不是上量后才做的事。每条 Agent 链路都应记录 Token 消耗与归因（哪个模型调用最贵），并默认配置「便宜模型优先」的路由策略。
5. **工具执行的安全边界写死在 L5**：Agent 只能调用已注册工具、工具执行不返回系统权限、高危操作加人工确认、所有调用留日志——这四条应作为不可协商的架构约束，而非最佳实践建议。
6. **用「9 层清单」做架构评审**：把文章的 9 层 + 4 横切当作 checklist，逐项问「这一层我们用什么、谁负责、缺了会怎样」。缺失层的风险通常不在缺失本身，而在于没人意识到它缺失。

- Harness Engineering：AI 从"聪明"到"可靠"的第三代工程范式 — 互补概念：Harness 关注如何构建可靠 AI 系统，AI Infra 关注需要哪些基础设施组件
- [Loop Engineering：反馈控制系统](https://github.com/QianJinGuo/wiki-public/blob/main/entities/loop-engineering-feedback-control-system.md) — Agent 运行时的闭环控制
- [腾讯研究院 AI 速递](https://github.com/QianJinGuo/wiki-public/blob/main/entities/腾讯研究院ai速递-20260429.md) — 行业动态
- [Agentic AI System Architecture](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentic-ai-system-architecture-harness-skill-mcp.md) — 分层 Agent 系统架构（5 层：Orchestrator → Harness → Skill → MCP → Model）

→ [原文存档](https://mp.weixin.qq.com/s/dmlwqGylzG0eQVUlcZocUQ)

---

