# The new AI lock-in

> 📊 Level ⭐⭐⭐ | 10.2KB | `entities/the-new-ai-lock-in.md`

# The new AI lock-in

→ [原文存档](https://www.infoworld.com/article/4171983/the-new-ai-lock-in.html)

## 摘要

AI 供应商的锁定策略正在从模型层上移到 workflow 编排层和实施服务层：模型 API 替换成本持续下降，但围绕模型构建的 orchestration 框架、企业工作流表面和咨询实施关系却形成了更深层、更难打破的粘性。企业买家需从"选哪个模型"转向"选哪个 orchestration 框架、workflow surface 和服务伙伴"，因为这些决策才是真正持久的承诺。

## 核心要点

- **锁定在迁移而非消失**：模型层的替换正变得容易（API 标准化、模型能力趋同），但 workflow、治理结构和操作流程的粘性并未减弱——锁定从模型层上移到了 orchestration 和实施层。
- **95% 失败率的结构性根源**：MIT NANDA 报告指出 95% 的企业 GenAI 试点未能交付可衡量业务价值，核心原因不是模型能力不足，而是部署工程的失败——工具无法嵌入审批路径、获取正确权限、携带组织制度记忆。
- **MCP 是解药但不是万能药**：MCP 降低了模型连接工具和数据源的成本，但无法解决 agent 审批、数据权限、行为审计和安全关闭等企业级治理问题——正如 Kubernetes 标准化了容器层但锁定转移到了托管服务和数据重力之上。
- **Orchestration 层的隐性粘性**：LangGraph 等框架积累了业务逻辑、eval 框架、恢复策略和可观测性追踪，一旦投入生产使用（Klarna、Replit、Elastic 等），替换代价等同于部分重写。
- **Vendor-controlled workflow surface 的管理壁垒**：Claude Cowork 的插件市场、per-user provisioning 和预建 agent 表面上是平台功能，真正的粘性来自企业 IT 管理员不想要 400 个随机 agent 接入合同系统和 HR 数据——管理成本本身就是壁垒。
- **Services 层是最深层的锁定**：OpenAI 收购 AI 咨询公司、PwC 与 Anthropic 的合作本质上是在训练一支懂 AI 和懂企业流程的混合部队，这支部队的 know-how 是无法通过切换底层模型复制的。
- **控制平面归属决定客户粘性**：在 agentic AI 时代，谁掌握了 control plane（谁批准 agent、谁能关闭它、谁定义它的权限边界），谁就拥有最强的客户关系锁定力。

## 深度分析

### Workflow Lock-in vs Model Lock-in：锁定的层级迁移

文章的核心诊断揭示了一个反直觉的现象：随着模型 API 标准化和能力趋同，模型层的锁定正在减弱——开发者可以在 Claude Code、Codex、Gemini 和本地模型之间自由切换，API 层的替换也不再是大工程。但这并不意味着企业 AI 的迁移成本在降低，因为锁定并没有消失，它只是上移了一个或多个层级。

Greyhound Research 的 Sanchit Vir Gogia 精确地指出了这一点："锁定不会消失，它正在迁移。在模型层，替换正变得更容易；但在 orchestration 层，替换依然困难。一旦你的 workflows、controls、identity layers 和 governance structures 围绕某个系统构建起来，更换该系统绝非小事。"这意味着企业的 AI 战略决策重心应该从"选哪个模型"转向"选哪个 orchestration 框架、哪个 workflow surface、哪个服务伙伴"。

这一观察与 [企业级 Agent 编排](https://github.com/QianJinGuo/wiki-public/blob/main/entities/enterprise-agent-orchestration.md) 的实践高度吻合：模型的可替换性是表面的，而编排层的粘性才是真实的。企业花在 eval 框架、恢复逻辑、可观测性追踪上的代码和人力投入，构成了比模型 API 更深层的锁定。

### MCP 与 Kubernetes 的历史镜像：标准化一层，锁定上移一层

作者用 Kubernetes 来类比 MCP 是极具洞察力的。Kubernetes 标准化了容器编排层，消除了"在哪运行容器"的锁定——但紧接着，锁定就转移到了上层的托管服务（GKE/EKS/AKS）、身份管理、网络策略、可观测性和数据重力之上。企业发现，虽然容器可以跨云迁移，但围绕容器构建的整个运维生态却牢牢绑定在特定云平台上。

MCP 正在对 AI agent 生态做同样的事：将"模型如何连接工具和数据"这一层标准化和低成本化。如果你维护过半打到 ServiceNow、Salesforce 或 Jira 的定制 connector，MCP 确实是福音。但 MCP 的本质是一个协议而非平台——它能让 agent 与工具对话，却无法告诉你谁批准了这个 agent、它能访问哪些数据、它的行为如何被审计记录、如何在操作员离职后安全关闭它。这些问题属于 [MCP Protocol](https://github.com/QianJinGuo/wiki-public/blob/main/entities/mcp-protocol.md) 本身无法覆盖的企业治理层，它们是 irreducibly local 的——属于那些愿意花时间去了解组织内部运作的人类。

### 三层锁定的结构性差异：Orchestration / Workflow Surface / Services

文章识别出三个不同性质的粘性层，每一层的锁定机制和迁移成本都不同：

**Orchestration 层**（LangGraph 等框架）：框架本身不是陷阱，但编排层会自然积累粘性——无论是否有人刻意设计。Klarna、Replit、Elastic、Ally 等企业如果花了一年时间在 LangGraph 内构建 agent 行为、eval 体系、恢复逻辑和可观测性追踪，它们不会因为竞争对手发布了一个更快/更便宜的模型就把这些全部推倒重来。模型是可替换的；之上的 orchestration 不是。这与 [Agent orchestration](../ch04/188-agent-orchestration.html) 的实际困境一致。

**Vendor-controlled workflow surface**（Claude Cowork 等）：2026 年 2 月的扩展推出了私有插件市场、per-user provisioning 和 HR/finance/investment banking/design 预建 agent。但真正的粘性不在 agent 本身，而在管理面——企业 IT 管理员不想让 400 个随机 agent 接入合同系统、HR 数据和客户记录。Administrative surface 围绕 agent 形成的治理结构，比 agent 本身更难替换。

**Services 层**（PwC/Accenture/Deloitte + OpenAI/Anthropic）：这是最讽刺的一层。OpenAI 收购 AI 咨询公司的逻辑不是因为模型不够好，而是因为企业三年的停滞试点让它终于明白：客户需要的不是更聪明的模型，而是一个能到现场做"无聊、昂贵、难替换"的流程整合工作的真人。PwC 和 Anthropic 声称其合作将网络安全事件响应从数小时缩短到数分钟、承保周期从 10 周缩短到 10 天——但这些提升不是来自模型，而是来自数万名顾问的流程再设计经验。想让这些顾问已实施的工作流改用新模型？先重新培训他们所有人。

### 企业 AI 采购的战略重心转移

基于以上分析，文章给企业 IT 管理者的建议是颇具解放性的：停止纠结于点状解决方案（模型 bake-off），转而关注一两个层级之上的战略决策。三个需要更多审查的决策是：（1）将代码提交给哪个 orchestration 框架；（2）终端用户实际生活在哪个 workflow surface 里；（3）哪个服务伙伴足够深入地嵌入了你的运营，以至于其模型推荐实际上具有约束力。

Anthropic 开源 Agent Skills 并强调"skills you create aren't locked to Claude"是争取客户信任的正确对冲；保留第二个前沿模型的 optionality 也是明智之举。但更深层的策略是：将 workflow 集成视为你真正拥有的资产，将模型和合作伙伴视为围绕它的可替换层。那些已经学会将 AI 集成到可重复工作流中的团队，将把能力商品化保持在自己这一侧。

## 实践启示

1. **在模型 bake-off 上少花时间，在 orchestration 框架选型上多花时间**。模型 API 替换成本已低至 1-2 周代码改动，而 LangGraph 等框架的替换成本是 6-12 个月的部分重写。选错 orchestration 框架的代价远大于选错模型。
2. **以"workflow 可移植性"而非"model 可替换性"作为 AI 架构的核心设计目标**：将核心业务逻辑抽象到与模型无关的中间层，使底层模型更换不触发业务流程重写。
3. **警惕 vendor-controlled workflow surface 的隐性锁定**：Claude Cowork 的预建 agent 表面上是"功能"，实际上是企业特定工作流程的编码——一旦深度使用，迁移成本极高。评估时关注管理面的粘性而非功能的丰富度。
4. **服务商关系是最深层的锁定**：PwC 和 Anthropic 合作带来的效率提升不是因为模型，而是因为数万名顾问的流程再设计经验。选择服务伙伴时，应评估其流程知识而非模型推荐能力。
5. **MCP 作为解药的一面**：MCP 降低了工具连接成本，使企业不至于因为"换一个模型就要重写所有 connector"而被锁定在单一 provider——但它只能解轻度锁定，无法消除重度 workflow 粘性。用它来降低迁移摩擦，但不要指望它消除锁定。
6. **Agent Skills 的开放性是战略杠杆**：企业在选择技能体系时应优先考虑不与特定 provider 强绑定的方案，Anthropic 的 Agent Skills 开放策略是一个正面案例。

## 相关实体

- [MCP Protocol](https://github.com/QianJinGuo/wiki-public/blob/main/entities/mcp-protocol.md) — MCP 协议本身的标准化与局限性，是本文"协议不等于平台"论点的技术基础
- [企业级 Agent 编排](https://github.com/QianJinGuo/wiki-public/blob/main/entities/enterprise-agent-orchestration.md) — 企业场景下 agent 编排的实际挑战，与本文 orchestration 层锁定的分析直接相关
- [Agent orchestration](../ch04/188-agent-orchestration.html) — Agent 编排框架的通用讨论，对应本文 LangGraph 等框架的锁定分析

---

