# AI Agent Gateway 架构设计 — OpenClaw/Claude Code/Hermes 三框架对比

## Ch01.357 AI Agent Gateway 架构设计 — OpenClaw/Claude Code/Hermes 三框架对比

> 📊 Level ⭐⭐ | 10.6KB | `entities/gateway-architecture-openclaw-claude-hermes-comparison.md`

## 评分
- **价值**：8/10 — 三框架 Gateway 设计哲学横向对比，视角独特，技术细节准确（端口号/bindings 配置/适配器数量）
- **置信度**：8/10 — 公众号原创，源码级细节，与公开文档一致
- **乘积**：64 — strong ★★★★
- **策略对齐**：与 [DeerFlow vs Hermes vs OpenClaw](ch03/012-openclaw.md) 互补（整体选型 vs Gateway 专深）

## 与现有 wiki 的关系
- **互补**：现有  侧重整体选型（三步选型法+效率五维表格），本文聚焦 **Gateway 单一架构层次的三框架深对比**
- **填补空白**：wiki 目前有 OpenClaw 源码拆解、Claude Code Prompt/Context/Harness 拆解、Hermes 深度解析，但缺少以 **Gateway 为分析轴的三框架横向对比**
- **交叉引用**：与 [OpenClaw Prompt/Context/Harness](ch03/012-openclaw.md)、[Claude Code Prompt/Context/Harness](ch03/073-claude-code.md)、[Hermes Agent 深度解析](ch04/503-agent.md) 互为补充

## 文章导航
- 本系列共（一）~（九）篇，本文为第（八）篇 Gateway 专题
- 同一系列的后续篇：AI Agent 架构设计（九）：Agent 的自我欺骗
- 前一篇：AI Agent 架构设计（七）：Skills 系统设计

## 框架哲学对比
| 维度 | OpenClaw | Claude Code | Hermes |
|------|----------|-------------|--------|
| Gateway= | 操作系统/神经中枢 | 无传统 Gateway → 事后补充 | 轻量桥接层 |
| 运行模式 | VPS 永远在线 | 本地 CLI 生命周期 | VPS 永远在线 |
| 架构 | 重控制面 | 无原生 | 薄适配层 |
| 多 Agent | bindings 路由 | 无 | 多实例 |
| 主动性 | Heartbeat+Cron | 无 | 无 |
| 平台 | 50+ 渠道 | MCP Channels | 18 适配器 |
| 独特 | 多 Agent 调度/定时任务 | Remote/Dispatch/Channels | ACP 编辑器延伸 |
| 默认安全 | 开放→13.5 万暴露 | 本地位安全 | fail-closed |

## 关键技术细节
**OpenClaw Gateway 流水线：**
外部消息 → Channel Bridge → Session Resolution（dmScope）→ Command Queue（串行化）→ Agent Runtime → 回传
**session key 模型：** `agent:main:channel:peer` — 天然上下文隔离
**Claude Code 三远程机制：**
1. Remote Control：加密桥接远端终端
2. Dispatch：异步任务队列（从同步→异步，架构关键转变）
3. Channels：MCP 协议接入消息平台
**Hermes 双方向延伸：**

- 横向：18 平台消息渠道
- 纵向：ACP → VS Code 编辑上下文聚合

## 三个核心架构取舍
1. **Gateway 是核心还是入口** → 重集中 vs 轻分散
2. **永远在线 vs 按需启动** → 运营成本 vs 失去主动性
3. **默认开放 vs 默认拒绝** → 社区增长 vs 安全基线
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/gateway-architecture-openclaw-claude-hermes-comparison.md)

## 深度分析
1. **Gateway 哲学决定 Agent 本质，而非功能多寡** — 文章提出的核心命题是：Gateway 设计哲学决定了 Agent 是被动响应工具还是主动运行的数字员工。三框架给了完全不同的答案：OpenClaw 把 Gateway 做成了神经中枢（永远在线+心跳+Cron），Claude Code 压根没有原生 Gateway（CLI 生命周期），Hermes 把 Gateway 做成可选的薄适配层。这个视角比常见的"功能罗列对比"更接近架构本质
2. **三个核心架构取舍是最浓缩的分析框架** — 文章将无数细节收敛为三个正交维度：①Gateway 是核心还是入口（重集中 vs 轻分散）；②永远在线 vs 按需启动（运营成本+安全暴露面 vs 失去主动性）；③默认开放 vs 默认拒绝（社区增长 vs 安全基线）。三维度正交意味着任何两框架的差异都能在这三个维度上找到映射，是一个高度正交的决策空间
3. **session key 层级模型是轻量级上下文隔离的范式** — `agent:main:channel:peer` 四段式层级设计，在不引入向量数据库的前提下实现了天然的上下文隔离。相比之下，Claude Code 完全依赖本地终端生命周期来管理上下文，Hermes 统一 session key 也走类似路径但未展示层级。这个设计的精髓在于：用结构化键而非语义 embedding 来划分隔离域，计算成本极低且行为完全可预测
4. **Claude Code Dispatch 代表行业从同步对话向异步任务队列的关键转变** — Remote Control 补充远端终端（但仍依赖本地在线），Dispatch 将任务卸到异步队列（API/手机 App 触发，不等人），Channels 接入 MCP 消息平台。这三步的演进方向是：从"Agent 需要人类盯着"到"Agent 可以独立完成被指派的任务"，是生产级 Agent 系统的必经之路
5. **13.5 万暴露实例是 Gateway 安全默认开放的具代价，而 ACP 编辑器延伸是 Gateway 角色质变的预兆** — OpenClaw 默认开放导致大量暴露实例，说明 Gateway 作为控制面一旦默认开放就会被大规模扫描利用；Hermes 的 fail-closed 形成鲜明对比。更值得注意的是 ACP 将 Gateway 从"消息桥接层"升级为"上下文聚合层"（VS Code 文件状态+光标+选区实时传入），这预示了未来 Gateway 的核心竞争力不在消息路由而在上下文整合能力

## 实践启示
1. **部署 OpenClaw 时必须将 Gateway 配置为 fail-closed 并绑定防火墙** — 13.5 万暴露实例的教训表明：OpenClaw 的默认开放策略在公网 VPS 场景下是灾难性的。实际操作中应在 iptables/firewalld 层将 18789 端口限制在必要 IP 范围，启用 Gateway 认证插件，并定期扫描暴露面
2. **用 session key 层级模型替代向量数据库做上下文隔离** — 当需要多租户/多渠道隔离时，先尝试 `agent:main:channel:peer` 结构化键方案，只有在需要语义相似性检索时才引入向量数据库。前者查询成本 O(1)，后者需要 embedding 计算+向量索引维护，在高频场景差距显著
3. **新 Agent 系统设计优先考虑 Hermes 式的 AIAgent/ Gateway 分离架构** — AIAgent 执行循环与 Gateway 接入层职责不重叠，使得 AIAgent 可以在无 Gateway 的情况下独立测试和运行。实践中：先实现纯内存的 AIAgent.run_conversation() 测试用例，再通过 Gateway 接入平台，可测试性大幅提升
4. **向生产级 Agent 演进时，优先实现 Dispatch 模式的异步任务触发机制** — Claude Code 的 Remote Control 本质上仍是"人盯着终端"的延伸，只有 Dispatch 才实现真正的后台任务执行。具体路径：在现有同步 Agent 基础上增加任务队列（如 BullMQ）+ Webhook/API 接收入口+任务状态查询接口，改造幅度最小但架构升级效果最显著
5. **Gateway 的下一阶段演进方向是 ACP 式的上下文聚合，而非更多消息渠道接入** — 文章揭示了一个被低估的趋势：Hermes 的 ACP 将 Gateway 从"消息桥接层"升级为"上下文聚合层"，VS Code 的编辑器状态成为 Agent 实时感知的上下文。对已有 18 渠道适配器的团队，下一步投入应优先做 IDE/编辑器 MCP 集成（文件树、语法树、linter 输出），而不是继续增加消息平台适配器数量

## 架构图
→ [C4 架构图](assets/c4/gateway-architecture-openclaw-claude-hermes-comparison-c4.html)

## 相关实体
- [Claude Code vs OpenClaw Agent 记忆系统对比](ch03/073-claude-code.md)

- [深度拆解 Hermes Agent 记忆系统](ch04/503-agent.md)
- [Hermes Agent vs OpenClaw 对比分析](ch04/503-agent.md)
- [Claude Code vs OpenClaw 记忆系统 — 向量数据库必要性反思](ch03/073-claude-code.md)
- [Claude Code 设计原则与对照分析](ch03/073-claude-code.md)
- [Claude Code Integration Other Tools](ch03/073-claude-code.md)
- [Local Vs Cloud Agent Deployment Strategy](https://github.com/QianJinGuo/wiki/blob/main/concepts/local-vs-cloud-agent-deployment-strategy.md)
- [Openclaw Architecture](https://github.com/QianJinGuo/wiki/blob/main/moc/openclaw-architecture.md)
- [claude dispatch + 接口力量：ai 从 chatbot 到 agent interface 的转变](ch01/380-claude.md)

---

