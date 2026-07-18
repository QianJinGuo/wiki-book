# Multi-Agent 的四种协作模式：Supervisor、Swarm、网状、流水线，怎么选？

## Ch04.335 Multi-Agent 的四种协作模式：Supervisor、Swarm、网状、流水线，怎么选？

> 📊 Level ⭐⭐ | 8.3KB | `entities/james-multi-agent-collaboration-modes.md`

# Multi-Agent 的四种协作模式：Supervisor、Swarm、网状、流水线，怎么选？
上一篇我们把 RAG、Memory、MCP 拼进了同一个 LangGraph，搭出了一个生产级 AI 助手的完整骨架。很多人看完留言说「能跑起来，但一旦任务复杂起来，这一个 Agent 就有点撑不住了」——没错，这正是今天要解决的问题。
你搭了一个 Agent，起初跑得挺好。后来需求升级了，调研+写作+事实核查全压在一个 Agent 上。结果上线后发现：系统提示词膨胀到 800 字，工具列表里有 15 个工具，Agent 开始选错工具、忘记自己设定的规则，偶尔一步出错后面全错。你在想，是不是我的 Prompt 写得不够好？
不是 Prompt 的问题。是单个 Agent 扛不住「又要调研、又要写作、又要核查」这种多角色任务的根本性矛盾。
解法是：多个 Agent 协作，每个只干一件事。

## 相关实体
- [构建基于多智能体架构的深度思考交易系统](https://github.com/QianJinGuo/wiki/blob/main/entities/构建基于多智能体架构的深度思考交易系统.md)
- [Factory Mission Multi Agent Architecture](../ch01/1205-factory-mission-multi-agent-architecture.html)
- [Anthropic Multi Agent Research System](ch04/540-anthropic-multi-agent-research-system.html)
- [Multi Agent Mission Factory Luke Aiengineer](../ch03/046-agent.html)
- [构建基于多智能体架构的深度思考交易系统](https://github.com/QianJinGuo/wiki/blob/main/entities/构建基于多智能体架构的深度思考交易系统.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/james-multi-agent-collaboration-modes.md)

## 深度分析

**单 Agent 的结构性瓶颈是系统性问题，而非 Prompt 技巧问题。** James 在文章开头用三个「死法」精准地描述了单 Agent 在复杂任务下的崩溃路径：上下文窗口污染导致关键信息被稀释、角色指令相互抢占优先级导致行为混乱、故障无隔离导致错误传播污染全链路。这三种死法并非可以通过优化 Prompt 措辞来解决的表层问题，而是单个 Agent 架构在处理多角色、多步骤任务时必然遭遇的结构性矛盾 。这意味着在设计阶段就应当选择 Multi-Agent 架构，而非在上线后遇到瓶颈再寻求 Prompt 层面的补救。

**Supervisor 模式的核心价值在于路由逻辑的可审计性与故障定位的便捷性。** 这种模式将所有调度决策集中于中央 Supervisor Agent，所有 Worker 之间的信息流都经由 Supervisor 路由，这种中心化设计在生产环境中意味着：任何一次任务失败都可以通过查看 Supervisor 的决策日志来定位问题，无需在多个 Agent 的交叉调用中追踪执行路径 。Supervisor 模式最适合的场景是任务边界清晰、子任务可独立描述的工作流——例如客服工单分类、内容生成流水线、代码审查等。这些场景的共同特征是任务分解规则可以预先定义，不需要在执行过程中动态判断「下一步该由谁处理」。

**Swarm 的 Handoff 机制揭示了 Multi-Agent 协作中最容易被低估的风险：循环依赖。** Swarm 模式的核心创新在于 Agent 之间直接传递控制权而非通过中央节点路由，这一设计使得系统能够适应不可预测的对话流向，但也引入了Supervisor 模式中不存在的风险——两个 Agent 互相认为对方应当处理当前请求，形成无限循环 。递归上限（`recursionLimit`）虽然提供了安全熔断机制，但文章没有讨论的是：这种死循环在实际生产中有时并非 Agent 的「判断错误」，而是任务本身的设计问题（如两个 Agent 的职责边界存在重叠）。因此，在选择 Swarm 之前，必须先确保 Agent 之间的职责划分足够清晰，边界不存在灰色地带。

**Pipeline 模式的「最小化复杂度」原则在工程实践中具有重要的成本控制意义。** James 将 Pipeline 定位为四种模式中最简单也最容易预测的架构，这一判断在实践中经得起检验 。Pipeline 的线性结构意味着每个节点的输入输出都可以被精确描述和验证，这在构建可审计的 AI 系统时具有不可替代的价值。更重要的是，Pipeline 模式对 LLM 调用次数的控制最为精确——对于成本敏感的生产场景，Pipeline 往往是用最低成本达到目标的首选方案。但文章指出的「部分成功假象」是真实生产中极高频的事故原因：上游返回的 5 个字段缺了 1 个，下游 Agent 基于不完整数据生成的输出看起来合理但实际错误，这个模式在 ETL 场景中几乎是标准化的踩坑路径。

**Mesh 模式的动态路由能力与调试成本之间的权衡是当前 Multi-Agent 领域最核心的工程矛盾。** 网状模式能处理「写到一半发现需要补充调研、调研完发现需要核查」这种动态演化的工作流，这在创意生成和研究任务中具有真实价值 。然而 12 次 LLM 调用中定位一次错误的代价，在没有完善 Tracing 基础设施的情况下几乎不可接受。文章将 LangSmith Tracing 定位为「基础设施，不是可选项」，这个表述值得所有 Multi-Agent 生产部署参考。成本倍增问题在 Mesh 模式下最为突出——动态路由意味着调用次数不可预测，成本上限难以控制，这在预算敏感的企业场景中是需要慎重评估的因素。

## 实践启示

1. **架构选型应先于 Prompt 优化。** 当发现单个 Agent 的 Prompt 已经超过 300 字、工具列表超过 10 个时，第一反应不应该是继续调整 Prompt 策略，而应当立即评估是否应当引入 Multi-Agent 架构。James 的经验阈值是：Supervisor Prompt 超过 300 字说明业务逻辑放错位置了，这是一个简单但有效的预警信号。

2. **Supervisor 模式是大多数场景的默认起点。** 根据任务边界清晰度、控制权集中度、调试成本三个维度综合评估，Supervisor 因为其路由逻辑集中、可审计性强、Worker 可独立测试的特性，是多数生产场景的合理起点。只有在确认 Supervisor 的中心化调度成为性能瓶颈（如 Supervisor 本身成为调用链上的等待瓶颈）时，才考虑向 Swarm 或 Mesh 演进。

3. **所有 Multi-Agent 生产部署必须配置递归上限和成本追踪。** Swarm 的 `recursionLimit: 25` 和 Mesh 的 `recursionLimit: 50` 是防止无限循环的强制性保险丝。同时，按 Agent 维度追踪 token 消耗是控制成本的基础操作——Supervisor 用强模型、Worker 用便宜模型是一个基本的成本优化策略，但在 Worker 选型时必须评估任务复杂度与模型能力的匹配度，避免因模型能力不足导致的重复调用，反而增加总成本。

4. **Pipeline 节点间的完整性校验是防止错误传播的关键工程实践。** 每个节点在处理上游输出前，必须校验关键字段的存在性和数据完整性，而非仅仅校验格式正确性。这个实践的成本在短期内看是「降低效率的冗余检查」，但从全链路可靠性来看是防止「部分成功假象」引发生产事故的唯一有效手段。

5. **Mesh 模式的生产部署前提是 Tracing 基础设施就绪。** 在没有 LangSmith 或等效 Tracing 方案的情况下，Mesh 模式的调试成本可能超过其带来的灵活度价值。团队在评估 Mesh 时，应当将 Tracing 基础设施的建设成本和时间纳入实现周期的评估，而非将其视为可后期追加的可选项。

---

