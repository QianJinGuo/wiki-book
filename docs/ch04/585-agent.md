# 多 Agent 编排系统

## Ch04.585 多 Agent 编排系统

> 📊 Level ⭐⭐⭐ | 2.5KB | `entities/agent-orchestration-multi-agent-systems.md`

# 多 Agent 编排系统

多 Agent 编排的核心问题：任务分解、角色分配、通信协议、冲突消解。主流模式包括层级编排（Orchestrator-Worker）、对等协作（Peer-to-Peer）、市场竞争（Auction-based）等。

## 深度分析

### 四种编排模式的设计哲学

四种主流多 Agent 编排模式对应不同的设计哲学。层级编排（Orchestrator-Worker）强调"分治"——中央协调者负责任务分解和结果合并。对等协作（Peer-to-Peer）强调"自主"——各 Agent 通过消息传递自行协调，没有中心节点。市场竞争（Auction-based）强调"择优"——多个 Agent 根据能力和报价竞标任务。投票/共识模式强调"民主"——多个 Agent 独立判断，通过加权投票确定最终输出。

### 任务分解粒度的核心权衡

过粗的分解消解了多 Agent 的优势；过细的分解引入了过多的通信和协调开销。最优粒度在每个子任务刚好填满单 Agent 上下文窗口的大部分容量、执行时间在 1-5 分钟之间。这个粒度保证 Agent 有足够信息独立决策，同时不会因任务过大而需要二次分解。

### 通信协议的核心设计选择

同步 vs 异步：同步通信简单但引入阻塞依赖，异步通信灵活但增加状态管理复杂度。点对点 vs 发布订阅：点对点直接可控，适合已知协作关系；发布订阅解耦可扩展，适合动态 Agent 集群。消息格式：结构化格式（JSON Schema）保证互操作性，自然语言格式灵活但引入解析不确定性。实际系统往往采用控制流用同步点对点、事件流用异步发布订阅的混合策略。

## 实践启示

1. **从层级编排开始**：Orchestrator-Worker 是最容易理解和调试的模式，适合 80% 的多 Agent 场景。
2. **粒度规则：1 Agent = 1 上下文窗口**：子任务的大小应以"填满但不溢出单个 Agent 上下文窗口"为准。
3. **通信标准化先行**：在实现任何编排逻辑之前，先定义 Agent 之间的消息格式和通信协议。

## 关联

- [AgentRun 多 Agent 协作](ch03/044-agent.md)
- [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)

> 本页为概念锚点页（stub），用于修复知识图谱断链。后续将在相关实体入库时补充溯源引用与深度内容。

---

