# Task Queue Priority and Fairness: Your Task Queue, your way

## Ch11.185 Task Queue Priority and Fairness: Your Task Queue, your way

> 📊 Level ⭐⭐ | 7.5KB | `entities/task-queue-priority-and-fairness-your-task-queue.md`

# Task Queue Priority and Fairness: Your Task Queue, Your Way

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/task-queue-priority-and-fairness-your-task-queue.md)

## 摘要

Temporal 于 2026 年 5 月宣布 Task Queue Priority 与 Fairness 两个特性全面可用（Generally Available），直接回应了用户规模增长后"单一 Task Queue 没有执行控制"的普遍痛点：此前团队不得不自建多套额外基础设施组件与自定义调度逻辑，才能获得基本的执行控制能力。Priority 控制哪些 Task 先被执行，Fairness 保证任何单个 Workflow、用户或租户都无法垄断 Worker 资源。两者组合让平台无需自定义基础设施，即可构建精细且公平的任务执行策略。

## 核心要点

- **Priority 的调度语义**：为 Workflow、Activity 或 Child Workflow 指定 1（最高）到 5（最低）的整数优先级，派发时严格按优先级排序——例如所有 priority-key=1 的 Task 都会先于任何 priority-key=4 的 Task 被处理；同优先级任务默认按 FIFO 顺序执行，除非同时启用 Fairness。
- **Fairness 的调度语义**：用 Fairness Key 将任务分入逻辑桶，通过加权轮询（weighted round-robin）算法跨桶派发，每个 Key 无论其队列堆积多深，都能获得与权重成比例的执行份额——例如 Tenant A 积压 1000 个 Workflow、Tenant B 只有 10 个时，Worker 仍会交替处理两边的任务。
- **二者组合的定位**：Priority 决定执行顺序（排序维度），Fairness 决定执行如何在租户或逻辑分组之间分配（分配维度），组合使用可同时实现差异化服务等级与公平性底线。
- **零侵入接入**：与现有 Task Queue 完全兼容，无需改动任何 Worker 代码——Worker 在轮询时自动遵循优先级排序与公平分配规则。
- **典型用例覆盖**：时间敏感操作（支付 vs 库存同步）、SLA 分级服务、紧急覆盖（可对运行中的 Workflow 动态修改优先级）、AI agent 工作负载（用户阻塞的关键路径任务 vs 后台 enrichment/logging）。
- **部署与计费差异**：Temporal Cloud 中 Fairness 需在 Namespace 层面开启开关，启用期间每小时每个 Action 额外计费 0.1 Actions；自托管 Server 则需开启 `matching.useNewMatcher`、`matching.enableFairness`、`matching.enableMigration` 等动态配置项。

## 深度分析

### 从"自建调度"到"平台原生原语"

文章开篇描述的痛点非常典型：随着 Temporal 用户规模扩大，单一 Task Queue 缺乏执行控制的问题会集中爆发——有人开始自建优先级逻辑，有人用多队列绕行，有人发现某个高流量租户正在悄悄拖慢所有人。团队为此拼装出复杂的自建方案（多套额外基础设施组件 + 自定义调度逻辑），只是为了获得应用所需的"基本执行控制"。Priority 与 Fairness 的价值主张正在于此：把调度控制下沉为平台原生的 SDK 能力，让团队从维护自建调度系统的负担中解放出来。

### Priority 与 Fairness：两种互补的调度维度

这两个特性并非同一问题的两种解法，而是两个正交的维度。Priority 是"排序"维度：在共享同一个 Task Queue 的关键任务与后台任务之间划定先后次序；Fairness 是"分配"维度：在同一优先级内部，防止任何单一租户或团队独占 Worker。单独使用任何一方都有明显缺陷——只有 Priority 没有 Fairness，高优先级租户可以凭借任务量淹没其他租户；只有 Fairness 没有 Priority，则无法区分任务的紧急程度。文章给出的组合示例（priority_key=1 + fairness_key="tenant-acme" + fairness_weight=5.0）展示了二者协同的效果：紧急工作始终优先移动，同一优先级内各租户按比例获得 Worker 份额，任何租户都无法饿死他人——这正对应 SaaS 平台"差异化服务等级 + 全租户性能底线"的双重诉求。

### 加权轮询与权重语义：Fairness 的工程实现

Fairness 的实现机制值得注意：任务先按 Fairness Key 分入逻辑桶，再由加权轮询算法跨桶选择，权重表达的是相对派发频率而非绝对配额——`fairness_weight=2.0` 表示该 Key 的任务被派发的频率是默认值的两倍。这种"相对权重"设计比硬性资源上限（hard resource cap）更灵活：在 Worker 空闲时，任何团队都可以自由使用全部可用容量；只有在资源竞争激烈时，权重才决定各方的比例份额。这解释了为什么文章强调它"更适合弹性 workload"——权重机制在低负载时不会浪费空闲算力，在高负载时又能提供可预期的比例保证。

### 从多租户 SaaS 到 AI Agent 工作负载

文章列出的用例从传统多租户 SaaS 延伸到 AI agent 场景，后者尤其值得关注：在 agentic AI 系统中，部分 Task 处于用户响应链的关键路径（用户阻塞的推理调用、工具执行），其余则是后台 enrichment 或 logging。若没有优先级控制，后台任务会与交互请求争抢 Worker 容量，导致用户端延迟不可预测。把交互式请求与定时批量任务分离、为关键路径任务赋予更高优先级，是保持端到端延迟可预测性的直接手段。官方将这两个特性定位为"迈向更丰富多租户控制的第一步"，Fairness 按 Action 计费的定价模型也暗示着多租户治理能力将成为平台后续演进的重点方向。

## 实践启示

1. **优先级分级从简起步**：先用 3-5 个优先级级别，待摸清真实负载模式后再增加粒度；一开始就设计复杂分级方案反而难以验证效果。
2. **以监控验证配置**：Temporal 提供按 Priority 拆分的 Task Queue 指标，应据此验证配置是否达到预期，并及早发现优先级反转（priority inversion）或异常积压增长。
3. **文档化优先级与 Fairness Key 的语义**：明确每个优先级级别代表什么业务含义、每个 Fairness Key 对应什么逻辑分组，避免团队扩张后策略沦为无法追溯的技术债。
4. **务必在高负载下测试**：Priority 与 Fairness 的效果只在存在任务积压时才显现，必须用贴近真实的流量模式压测，否则无法判断配置是否真正生效。
5. **提前评估 Fairness 成本**：Temporal Cloud 中启用 Fairness 会按小时计费（每小时每个 Action 加收 0.1 Actions），需要在多租户公平性收益与持续成本之间做出权衡。

## 相关实体

- [Task Queue Priority and Fairness](ch11/185-task-queue-priority-and-fairness-your-task-queue-your-way.html)
- [Task Queue Priority and Fairness Your Task Queue Your Way](ch11/185-task-queue-priority-and-fairness-your-task-queue-your-way.html)
- [PromptQueue + OpenGorilla 集成](https://github.com/QianJinGuo/wiki/blob/main/entities/promptqueue-async-task-queue-opengorilla-integration.md)
- [Building Multi-Tenant Agents with Amazon Bedrock AgentCore](../ch04/639-amazon-bedrock-agentcore.html)

---

