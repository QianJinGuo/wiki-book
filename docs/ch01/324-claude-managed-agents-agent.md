# Claude Managed Agents 新更新\"专属云\"模式：把Agent的手放回企业内部

## Ch01.324 Claude Managed Agents 新更新\"专属云\"模式：把Agent的手放回企业内部

> 📊 Level ⭐⭐ | 15.3KB | `entities/claude-managed-agents-self-hosted-sandbox-mcp-tunnels-enterprise.md`

## 架构边界：brain 与 hands 的分离

2026 年 4 月 8 日 Anthropic 工程博客文章 *Scaling Managed Agents: Decoupling the brain from the hands* 已经阐明了这个方向——将 Claude Managed Agents 拆解为 session、harness、sandbox 三个抽象层次。5 月 18 日的更新把这个架构真正产品化：

| 层级 | 托管方 | 职责 |
|------|--------|------|
| Brain（决策） | Anthropic | agent loop、session 管理、模型调用、事件流、控制台 |
| Hands（执行） | 企业侧 | 代码执行、文件访问、内部服务调用、私有 MCP 工具 |

这个分离的本质是 **执行边界客户侧化，控制平面 Anthropic 化**。Agent 的决策过程、session 状态、事件流仍在托管控制平面，但执行可以落在企业自有基础设施。

## Self-Hosted Sandboxes 的机制与价值

Self-hosted sandbox 的运作模式：

1. 企业在自有基础设施部署 worker 进程
2. Worker 从 Anthropic 平台拉取工作项（work items）
3. 在客户控制的环境中执行工具、访问文件、运行命令
4. 执行结果返回给 Claude Managed Agents session

**解决的问题**：企业 Agent 任务常涉及私有仓库、内部依赖、构建工具、日志文件、测试环境、受限文档。Anthropic 托管 sandbox 会触发安全评审（代码去向、文件传输、内部依赖安装、执行权限控制）。执行侧化到企业后，评审阻力显著降低。

**适用条件**：只读分析类任务（worker 返回结构化摘要和证据片段）更适合优先落地；如果任务必须把完整代码大量返回 session 才能完成，当前架构不适合作为第一批场景。

## MCP Tunnels：私有工具的网络可达性

MCP (Model Context Protocol) tunnels 让企业内部私有 MCP server（工单系统、内部文档库、数据库查询代理、监控平台、审批流、GitHub Enterprise）可以被 Claude 调用，同时避免公网暴露。

**当前局限**：

- Tunnel 只解决网络可达性，不处理工具治理
- 权限过宽、参数无校验、返回结果未去敏、危险动作无人工确认的 MCP server，如果通过 tunnel 接入，会加速风险进入生产流程

**演进方向**：企业大概率需要自建 MCP Gateway，统一处理 OAuth、tool allowlist、参数校验、审计日志、限流、PII redaction（个人身份信息去标识化）和危险动作审批。

## 与 5 月 6 日更新的互补关系

5 月 6 日 Claude Managed Agents 更新补强的是 **运营能力**：

| 功能 | 解决的问题 |
|------|-----------|
| **Dreaming** | 长期记忆腐化——Agent 运行多次后 memory store 出现重复经验、过期 workaround、冲突偏好；Dreaming 生成整理版 memory |
| **Outcomes** | 交付验收——开发者编写 rubric，平台用独立 grader 检查产物，比 prompt 指令更接近测试/lint/review gate |
| **Multi-Agent Orchestration** | 任务拆分——lead agent 分发子任务给 specialist agents，各 agent 独立 session thread，共享文件系统 |

5 月 18 日更新补强的是 **企业边界**：代码在哪跑、私有工具怎么接。两篇结合看，Anthropic 的路线是：先把 Agent 做成可运营系统，再把这个系统接入企业自有运行环境。

## 社区质疑的回应进度

| 质疑点 | 回应状态 | 对应功能 |
|--------|----------|----------|
| 数据边界/私有工具连接 | ✅ 已回应 | Self-hosted sandbox + MCP tunnels |
| 正确性/记忆/任务拆分 | ✅ 已回应 | Outcomes + Dreaming + Multi-agent |
| 模型锁定（只能用 Claude） | ❌ 未回应 | — |
| 成本/token 透明度 | ❌ 未回应 | — |
| 跨模型 harness | ❌ 未回应 | — |
| 失败恢复机制 | ❌ 未回应 | — |

## 与其他 Agent 工具的定位差异

Claude Managed Agents 不是 Claude Code 的替代品：

- **Claude Code**：本地 CLI 协作，人和 Agent 共同读代码、改文件、跑测试
- **Cursor / Windsurf**：IDE 内上下文交互
- **Codex 类编码代理**：自动化代码补全
- **OpenCode / OpenClaw / 自研 loop**：可控、可改、多模型、自托管

Managed Agents 的定位层级不同：长任务控制平面、异步执行、session log、sandbox、 MCP、outcomes、多 Agent 编排、事件追踪。

**合理分工**：开发者继续用 CLI/IDE Agent 做交互式开发；后台日志分析、文档 QA、报告生成、批量检查、内部流程自动化交给 Claude Managed Agents。

## 验证框架：不要先看功能够不够多

判断 Claude Managed Agents 是否适合团队，应围绕四个决策点做小实验：

1. **Self-hosted sandbox 能否通过安全评审**：选只读内部仓库分析任务，worker 只返回结构化摘要和少量证据片段
2. **MCP tunnel 能否承载真实私有工具**：先开放 read-only tool，限制参数枚举，返回去敏结果，记录所有调用
3. **Outcomes 能否发现真实错误**：rubric 写必须覆盖哪些文件、必须引用哪些证据、哪些错误不能出现、失败时返回格式
4. **成本和延迟能否解释**：至少能把任务拆解为 session 时长、tool call 次数、worker 执行时间、grader 轮数、人工返工次数

## 深度分析

### 1. Brain/Hands 分离架构正在成为企业 Agent 部署的标准模式

Anthropic 将 Agent 明确拆分为 Brain（Anthropic 托管）和 Hands（企业自有基础设施）的架构决策，反映了企业 Agent 部署的核心矛盾：企业既想利用前沿 AI 能力，又不能将代码、数据、工具暴露给第三方。这个分离让企业保留对执行环境和私有工具的控制，同时获得托管控制平面的模型能力和运维简化。这种模式可能会影响企业对自建 Agent 平台 vs 采购托管服务的决策边界。

### 2. Self-hosted Sandbox 的限制比表面看起来更严格

文章指出「只读分析类任务更适合优先落地」，「如果任务必须把完整代码大量返回 session 才能完成任务，当前架构不适合作为第一批场景」。这意味着 self-hosted sandbox 的适用场景比功能描述所暗示的更窄：它解决的是代码在客户侧跑的安全顾虑，但 Agent 完成任务所需的数据流如果必须穿越 Anthropic session 边界，安全评审的顾虑只是部分消除。企业在评估时应关注数据流的完整路径，而非仅看代码执行位置。

### 3. MCP Tunnel 将工具治理问题从隐式变为显式，催生 MCP Gateway 需求

在不使用 MCP Tunnel 时，企业内部 MCP server 通常通过自建 API 网关接入，风险控制在企业边界内。MCP Tunnel 让这些私有 server 可以被外部 Agent 调用，同时「只解决网络可达性，不解决工具治理」。这意味着：权限过宽、参数无校验、返回未去敏、危险动作无确认的 MCP server 通过 Tunnel 接入会加速风险。企业的 MCP Gateway 不会是可选项，而是必须品——用于统一处理 OAuth、allowlist、参数校验、审计、限流、PII redaction 和危险动作审批。

### 4. Anthropic 的两次更新揭示了企业 Agent 平台的能力矩阵

5 月 6 日更新（Dreaming、Outcomes、Multi-agent）补强运营能力；5 月 18 日更新（self-hosted sandbox、MCP tunnels）补强企业边界。这两次更新定义了 Claude Managed Agents 的完整能力维度：运营能力（记忆管理、交付验收、任务拆分）和企业集成能力（执行边界、私有工具）。这意味着 Claude Managed Agents 的定位不是通用 Agent 开发框架，而是面向企业长任务场景的可运营平台。

### 5. 未回应的质疑（模型锁定、成本透明度）将持续构成竞争差异化机会

模型锁定、成本透明度、跨模型 harness、失败恢复机制仍未被正面回应。这些未回应的点正是开源 Agent 框架（LangGraph、Temporal 组合）和自研 Agent 平台攻击 Managed Agents 的主要角度。企业在选型时需要明确：模型锁定的代价是否可接受、成本透明度需求有多强、是否需要跨模型能力。这些决策点的权重会直接影响对 Managed Agents 的接受程度。

## 实践启示

### 1. 优先在只读分析场景落地 Self-hosted Sandbox，而非代码生成场景

Self-hosted sandbox 的设计更适合 worker 只返回结构化摘要和证据片段的场景。代码生成场景如果需要将完整代码返回 session 才能完成，self-hosted 的安全价值大幅降低。建议企业从内部代码库分析（生成摘要、查找模式、统计指标）、文档 QA、内部日志分析等只读任务开始验证架构可行性，而非从代码生成或修改任务开始。

### 2. 搭建 MCP Gateway 作为 MCP Tunnel 接入的前置条件

在允许任何 MCP server 通过 Tunnel 接入之前，企业应先建立 MCP Gateway 并配置：OAuth 认证（确认调用者身份）、tool allowlist（明确哪些工具可被外部调用）、参数校验（拒绝不合规范的 tool call 参数）、审计日志（记录所有 MCP 调用）、限流（防止滥用）、PII redaction（去除返回结果中的个人身份信息）、危险动作审批（对删除、修改类工具强制人工确认）。这个 Gateway 不是可选项，而是生产部署的必要条件。

### 3. Outcomes 验证要从「质量描述」转向「结构化规范」

使用 Outcomes 功能时，rubric 不应写「请认真检查质量」或「确保内容完整」这类模糊描述，而应编写可以产生明确判定的结构化规范：必须覆盖哪些文件、必须引用哪些证据、哪些错误类型绝对不能出现、失败时返回什么格式。这样的 rubric 才能真正替代人工 review，而非仅仅多了一层形式化的 prompt 指令。

### 4. 将成本归因到具体的执行单元，而非仅看 session 级别账单

在评估 Managed Agents 成本时，需要将任务成本分解为 session 时长（Anthropic 托管成本）、tool call 次数（网络和计算成本）、worker 执行时间（企业基础设施成本）、grader 轮数（额外的模型调用成本）、人工返工次数（质量成本）。这种分解能揭示哪些环节成本异常高、哪些优化杠杆最有效。如果无法分解到这些单元，说明成本透明度仍不足，可能影响企业在生产环境中对该平台的信任度。

### 5. 将 Brain/Hands 分离作为企业 Agent 架构评审的评估维度

在评估任何 Agent 平台时（包括 Managed Agents），应明确评审：Brain 在哪里托管、数据如何穿过 Brain-Hand 边界、Hand 侧执行环境是否满足企业安全合规要求、MCP 工具连接是否在企业治理框架内。对于有强合规要求的行业（金融、医疗、政府），Brain/ Hands 分离架构是否能通过内部评审，比功能完整性更重要。

## 总结

这次更新的意义不在"支持自托管沙箱"和"支持 MCP tunnels "两个功能名词，而在 Anthropic 对企业 Agent Architecture 的选择：**控制平面继续托管化，执行环境开始客户侧化，私有工具连接开始标准化，质量/记忆/编排继续平台对象化**。

这条路线会吸引不想自建 Agent 平台的企业，同时继续被开源和自研路线挑战（LangGraph/Temporal 组合方案）。判断适用性的四个关键：**数据流能否审计、工具权限能否收紧、outcome rubric 能否发现真实错误、成本能否按任务解释**。

## 相关实体
- [Claude Managed Agents Self Hosted Sandbox Enterprise](../ch04/616-claude-managed-agents.html)
- [Anthropic Claude Managed Agents Platform 2026](ch01/272-anthropic-claude-managed-agents.html)
- [Claude Managed Agents Official](../ch04/527-claude-managed-agents-official.html)
- [Claude Managed Agents](../ch04/616-claude-managed-agents.html)
- [Anthropic Pm Jess Yan Managed Agents](ch01/847-anthropic.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-managed-agents-self-hosted-sandbox-mcp-tunnels-enterprise.md)
- [openai 的最强对手，离「ai windows」又近了一步](../ch04/432-anthropic-ai.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/claude-code-complete-guide.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/anthropic-ecosystem.md)

---

