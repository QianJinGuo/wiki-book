# CLI、MCP 和 CLI+Skill，应该如何选？

## Ch07.030 CLI、MCP 和 CLI+Skill，应该如何选？

> 📊 Level ⭐⭐ | 9.8KB | `entities/cli-mcp-skill-architecture-decision-vibecoder.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/cli-mcp-skill-architecture-decision-vibecoder.md)

## CLI、MCP 和 CLI+Skill：企业Agent架构选择指南

## 三个东西不是一层

| 概念 | 关注点 |
|------|--------|
| **MCP** | 能力接入协议——外部系统怎么被 Agent 发现、授权、调用和审计 |
| **CLI** | 执行接口——在某个运行环境里把事情做掉 |
| **Skill** | 工作流封装——Agent 什么时候用工具、按什么顺序、失败怎么处理 |

**组合原则**：Skill 写方法，MCP 管边界，CLI 做执行。

## 决策矩阵

| 场景 | 推荐方案 |
|------|----------|
| 本地开发/个人使用 | CLI+Skill |
| 多个 Agent/客户端复用 | MCP |
| 生产数据/审批/审计 | MCP-like gateway |
| 工具数量很多 | tool search + 分层加载 |
| 大量中间数据 | 模型外处理，只回传摘要 |

## 三层推荐架构

**Skill（方法层）**：放流程和经验——排查告警、发布前检查、事故复盘

**MCP Gateway（治理层）**：工具发现、权限、审计、配额、审批。Agent 只通过少量高层工具表达意图

**底层已有系统**：内部 API、CLI、监控系统——MCP server 只是包装层

**关键原则**：工具粒度要克制，暴露高层意图工具（如 `request_production_change`）而非几百个 REST API tools。

## MCP 的 tools tax 问题

工具数量多时，MCP 必须配 progressive tool discovery——不要把所有工具 schema 一次性注入模型，先给 `search_tools`，模型搜相关工具后再加载具体 schema。

## 上线顺序

1. CLI+Skill 跑通高频工作流（PR review、测试定位、K8s 排查）
2. 评估哪些需要跨团队复用/涉及权限审计
3. 这些才提升为 MCP，加 tool search
4. 保留 CLI——MCP server 内部可以继续调用已有 CLI

**一句话**：小团队 CLI+Skill 跑通，大组织 MCP 建契约，两者一起用效果最好。

## 深度分析

**核心洞察：三层架构的本质是关注点分离**

CLI、MCP 和 Skill 代表了三个不同层次的抽象：
- **CLI** 是执行原语，负责在特定运行环境里完成具体操作
- **MCP** 是治理协议，负责能力发现、授权、调用审计
- **Skill** 是方法论封装，负责编排和决策——什么时候做什么事

这个分离的意义在于：让不同角色在不同层次上工作。Agent 不需要理解 `kubectl` 的所有 flags，只需要知道"查看集群状态"这个高层意图。运维团队在 MCP Gateway 层做权限控制和审计，不需要修改 Skill。

**CLI+Skill 适合Local-first 的根本原因**

CLI 默认不占上下文这个特性被严重低估。Agent 在处理复杂任务时，上下文窗口是最昂贵的资源。当 Agent 调用 CLI 时：
1. 需要什么参数 → 运行时通过 `--help` 获取
2. 输出太长 → 用 `jq`/`rg`/`head`/`tail` 过滤
3. 中间数据太多 → 写到临时文件，只回传摘要

这本质上是"流式上下文管理"——按需拉取、按需过滤、选择性回传。相比之下，把所有 CLI 包装成 MCP tools 并一次性注入 schema，是用空间换时间，反而浪费了宝贵的上下文。

**MCP Gateway 的边界价值**

MCP 的真正价值不在于"让工具更容易被发现"，而在于"让 Agent 的能力边界更清晰"。当 MCP server 挡在 Agent 和内部系统之间时：

- Agent 看不到原始 token，拿不到底层系统的直接访问权
- 所有操作经过 OAuth/RBAC 审计，配额和审批在 server 侧强制执行
- 内部 API 的版本变化对 Agent 透明，只暴露高层意图工具

这是安全架构，不是便利性架构。很多团队把 MCP 当作"更方便的 API 封装"，忽略了它的治理意义。

**工具粒度与模型推理成本的权衡**

暴露高层意图工具（如 `request_production_change`）而非几百个 REST API tools，本质上是在**降低模型的推理复杂度**。模型不需要在几百个工具中选择，只需要表达高层意图，由 MCP server 翻译成具体的系统调用。

当工具数量超过某个阈值（通常在 50-100 个左右）时，模型选择工具的错误率会显著上升。Progressive tool discovery 是工程上的补救，但根本解法是**克制工具粒度，让 MCP server 承担路由责任**。

**上线顺序的实践意义**

推荐的上手路径（CLI+Skill → 评估 → MCP 提升）有深刻的组织心理学基础：

小团队用 CLI+Skill 能快速验证价值，不需要在治理架构上投入太多。当工作流被验证有效后，自然会发现哪些是跨团队复用的公共能力——这些才值得升级为 MCP。这个顺序避免了"过度设计"和"治理先行"常见陷阱。

## 实践启示

### 1. 优先用 CLI+Skill 验证，再考虑 MCP

在决定是否用 MCP 之前，先用 CLI+Skill 把核心工作流跑通。判断标准：这个工作流是否被多个团队反复使用？是否涉及权限审计？如果都不是，先用 CLI+Skill，保持灵活性。

### 2. MCP 的工具 schema 要克制

MCP server 暴露的工具应该是**高层意图工具**，不是 REST API 的 1:1 映射。一个 `search_recent_incidents` 比 20 个 `GET /incidents/{id}`, `POST /incidents`, `PUT /incidents/{id}` 更有价值。工具数量控制在 Agent 能直观理解的范围内（建议不超过 20 个）。

### 3. 用 Progressive Tool Discovery 处理工具爆炸

当工具数量必然很多时（如内部有几十个微服务），不要试图减少工具数量，而是**改变工具的加载方式**：先给 Agent 一个 `search_tools` 轻量工具，让它按需搜索和加载具体 schema。这比一次性注入所有工具 schema 更节省上下文。

### 4. 企业治理优先考虑 MCP Gateway

如果涉及生产数据、审批流程、合规审计，CLI 无法满足要求，因为 Agent 可能直接读取本地凭据或调用数据库。这时候需要 MCP-like gateway，把治理能力前置，Agent 只通过受控的接口操作。

### 5. CLI 可以是 MCP Server 的实现细节

很多 MCP server 的内部实现可以继续调用已有 CLI。这意味着 CLI 不是被替代，而是被更薄地包装。不要因为上了 MCP 就急着把所有 CLI 重写——保持 CLI 的独立性和可测试性，MCP 只是加了一层治理包装。

### 6. 保留 Skill 层的方法论积累

Skill 是组织经验和方法论的载体。不要把 Skill 看作"让 Agent 调用工具的配置文件"，而应该看作**组织最佳实践的编码**。当新成员加入时，应该能通过阅读 Skill 理解："我们团队是怎么做发布前检查的？"、"线上告警应该按什么顺序排查？"

## 关联阅读

## 相关实体
- [Production Ai Agents Mcp Cli Skills Stack Ayi](/ch07-052-如何构建生产准备的ai代理-mcp-cli与技能-适合合适的工作的工具/)
- [From Agent Protocol To Harness Skill](/ch04-351-from-agent-protocol-to-harness-skill/)
- [Claude Code Core Internals](/ch01-162-claude-code-源码核心机制详解/)
- [Staragent Webterminal Cli Ali Infra Cli As Agent Hands](/ch07-009-staragent-drogo-webterminal-cli-阿里基础设施把-webterminal-变成-agent/)
- [Agentscope Java Harness Framework Enterprise Distributed](/ch03-048-agentscope-java-harness-framework-2-0-企业级-agent-分布式场景的-har/)
- MOC

---

