# Agent 时间性策略（Temporal Policies）：基于轨迹的有状态授权架构

## Ch04.509 Agent 时间性策略（Temporal Policies）：基于轨迹的有状态授权架构

> 📊 Level ⭐⭐ | 7.3KB | `entities/securing-ai-agents-temporal-policies-agentcore.md`

# Agent 时间性策略（Temporal Policies）：基于轨迹的有状态授权架构

> **核心论点**：传统 stateless 授权（每个请求独立判定）对 AI Agent 根本不够——Agent 在运行时决定调用哪些工具、以什么参数、什么顺序，单看一个工具调用是安全的，放在轨迹上下文里可能是灾难。Temporal Policy 在网关外围（gateway perimeter）基于 agent 轨迹（trajectory）做有状态授权，agent 自身代码无法拦截或篡改策略。

## Stateless 授权的三个失效场景

- **链式工具间的输出伪造**：agent 调用 `lookup_customer` 拿到账户号后，凭空捏造另一个账户号传给 `transfer_funds`，把资金转给错误客户。单个调用各自都合法，只有轨迹级检查能发现。
- **失控循环的累计暴露**：失控 agent 在循环中执行几十笔交易，因为没有机制追踪"累计暴露已超过风险上限"。
- **矛盾动作**：agent 在几秒内既批准又拒绝同一份保险索赔。

## Temporal Policy 的机制

Temporal Policy 是对"给定网关观察到的最近轨迹，这个请求是否被授权"这一问题的回答。它基于当前请求 + 会话内近期事件（trajectory）做评估，不转换请求、不调用工具、不直接编排 agent。

**评估流程**（网关收到工具调用时）：

1. 查询轨迹状态中与策略相关的 actions/inputs/outputs
2. 在当前请求的 historical scope（客户定义的轨迹内的先前事件）上下文中评估每条 temporal policy
3. 返回确定性的 ALLOW/DENY 并记录完整决策上下文

**关键设计点**：

- 每个请求必须携带 `x-amzn-bedrock-agentcore-policy-session-id` header；session 边界由你定义（单次对话/多步任务/长流程），**同一 session ID 下并发授权请求只能有一个**，因此 session 范围越窄越好
- **session ≠ ID 本身**：AgentCore 将 session ID 与终端用户身份组合产生唯一 session——两个不同身份可以用同一 session ID 但轨迹完全隔离
- 轨迹 look-back 窗口上限 24 小时，超时事件自动删除
- 策略变更会**使现有 session 全部失效**，确保每个 session 都用当前策略集评估
- deny-by-default，forbid 优先于 permit

## 常见 Temporal Policy 用例分类学

- **链式工具输出完整性（output integrity）**：要求当前工具调用的参数必须与先前工具调用的输出完全一致，防止 agent 在步骤间幻觉或替换值——可抵御 prompt injection 诱导 agent 用伪造 ID 交易（策略验证值与 CRM 系统实际返回值一致）
- **工具调用顺序（workflow sequencing / SOP）**：要求某工具必须在另一工具之前调用，验证标准操作流程（如先 `get_client_profile` 再 `load_portfolio` 才能 `rebalance_portfolio`）
- **特权动作前人工审批（one-time consumption）**：阻止破坏性/敏感工具调用直到轨迹中记录显式人工审批事件；**每个审批只消费一次**——单个审批不能当作多个大额交易的 blanket permission
- **数据新鲜度（data freshness）**：要求数据查询在给定时间窗口内完成才授权依赖动作（如市场价格必须在交易前 30 秒内获取，防陈旧报价）
- **累计预算上限（cumulative budget cap）**：单 session 交易总额不超过 $60,000，遏制失控 agent 或成功攻击的爆炸半径——几十笔单独看起来没问题的小交易累计后达到上限即全部 DENY
- **互斥规则（mutual exclusion）**：同一轨迹内禁止"买入后亏损卖出同一证券"等自相矛盾动作

## Dogwood：为 agent 与工具设计的新开源治理语言

Temporal policies 使用 **Dogwood**——一种为 agent 及其工具设计的新开源治理语言，兼容现有 Cedar 策略（无需迁移），并支持 temporal 条件。这是状态化 agent 授权的语言层基础：策略语法中的 `when temporal { formerly within 5m (...) }` 模式表达"先前事件时间窗"约束。

## 与其他实体关系

- [Agent 安全三步法](../ch05/077-harness.html)：三步法把 Governance 放在 Identity 之前；temporal policy 正是 Governance 层的有状态实现形态，补充了"如何具体实施 governance"的机制细节
- [Policy + Lambda interceptors](ch04/209-ai-agent.html)：stateless Cedar policy 的先行方案；temporal policy 是其有状态扩展（同一 Policy engine 之上）
- [AI 工具投毒](ch04/456-ai-tool-poisoning-exposes-a-major-flaw-in-enterprise-agent-s.html)：工具调用层面的攻击面；temporal policy 的 output-integrity 规则正是防御此类攻击的授权层手段
- [AgentCore Harness](ch04/766-agentcore-harness.html)：temporal policies 运行于 AgentCore Gateway 外围，是 harness 安全边界的组成部分

## 局限性

实现细节绑定 AgentCore Gateway（session-id header、`AgentCore::Action` 命名空间、Gateway ARN），但用例分类学、session 边界设计、deny-by-default 原则、审批一次性消费等模式可直接迁移到任何 agent 网关/代理层。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/securing-ai-agents-with-temporal-policies-in-amazon-bedrock-agentcore.md)

---

