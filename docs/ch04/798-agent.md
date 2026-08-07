# 多 Agent 编排系统

## Ch04.798 多 Agent 编排系统

> 📊 Level ⭐⭐⭐ | 7.9KB | `entities/agent-orchestration-multi-agent-systems.md`

# 多 Agent 编排系统

## 摘要

把多个专门 Agent 接入网络并不会自动带来可靠协作：缺少编排层的 Agent 网络会在可预测的方式下失败——步骤之间状态丢失、关键决策无人签核、单个 Agent 宕机引发静默级联故障，根因都是缺少管理执行、状态与审批门（approval gates）的控制面。AWS 的 Agent Orchestration Workshop 展示了用 Step Functions、Bedrock Agents、MWAA 与人工审批工作流构建这一控制面的技术路径。

## 核心要点

- **控制面缺失是故障根源**：无编排层的 Agent 网络失败模式可预测——状态丢失、无人工签核机制、单点故障静默级联。
- **编排层三要素**：执行管理、状态管理、审批门。
- **确定性工作流**：AWS Step Functions 提供状态管理、重试逻辑、分支与跨 Agent 网络的并行执行。
- **推理驱动协调**：Amazon Bedrock Agents 提供内置工具调用、记忆与动态路由。
- **人工介入**：Human-in-the-loop 审批步骤让执行暂停，直到人类对关键决策签核。
- **DAG 编排**：Amazon MWAA（及 Temporal、Airflow、Orkes、Prefect 等 Marketplace 工具）处理复杂多步流水线。
- **四种编排模式**：Orchestrator-Worker 层级编排、Peer-to-Peer 对等协作、Auction-based 市场竞争、投票共识。
- **四大设计问题**：任务分解、角色分配、通信协议、冲突消解构成编排设计的核心维度。

## 深度分析

### 四种编排模式的设计哲学与取舍

层级编排（Orchestrator-Worker）以「分治」为哲学：中央协调者负责任务分解、结果合并与全局状态跟踪，所有 Worker 的信息流都经由协调者路由。优势是控制集中、决策路径可审计、故障定位容易；代价是协调者成为单点瓶颈——既可能成为调用链上的等待热点，也决定了整个系统的决策上限。

对等协作（Peer-to-Peer）以「自主」为哲学：没有中心节点，Agent 通过消息传递自行协商任务归属与数据流。优势是弹性好、无单点依赖、能适应动态变化的协作关系；代价是全局可见性缺失、协调开销随规模上升，且容易引入循环依赖与死锁——两个 Agent 互相认为对方该处理当前请求时可能无限循环，需要递归上限等熔断机制兜底。

市场竞争（Auction-based）以「择优」为哲学：多个 Agent 根据各自能力、报价与上下文适配度竞标任务，由拍卖机制选出中标者。优势是能按能力与成本动态分配异构任务、天然支持负载均衡；代价是竞标协议的设计复杂度与评估偏差——报价高低未必等价于输出质量。

投票共识（voting-consensus）以「民主」为哲学：多个 Agent 独立完成任务后各自给出判断，通过（加权）投票确定最终输出。优势是能稀释单 Agent 的随机偏差、对高风险决策提供冗余保障；代价是推理成本成倍放大，且可能产生「群体平庸」——多数票未必是最优解。

### 任务分解与角色分配

任务分解粒度是多 Agent 系统最核心的权衡。过粗的分解让子任务仍然超过单 Agent 的能力边界，多 Agent 的优势被消解；过细的分解则引入过多的通信与协调开销，编排层本身的成本反超并行收益。经验粒度是：子任务恰好填满单 Agent 上下文窗口的大部分容量、单次执行时长在 1-5 分钟之间，保证 Agent 有足够上下文独立决策且无需二次分解。

角色分配紧随分解而来：谁做哪个子任务，取决于角色定义、能力声明与上下文适配。层级编排下由协调者集中指派，市场竞争下由竞价机制自然选择，对等协作下靠 Agent 自行协商——分配机制与编排模式绑定，而角色边界必须预先划清：职责重叠的灰色地带正是循环依赖与重复劳动的高发区。

### 通信协议的核心设计选择

通信协议有三个正交的选择轴。同步 vs 异步：同步简单直接但引入阻塞依赖，一个慢 Agent 会拖住整条链；异步灵活但把状态管理复杂度推给了调用方。点对点 vs 发布订阅：点对点直接可控、适合已知且稳定的协作关系；发布订阅解耦可扩展、适合动态变化的 Agent 集群。消息格式：结构化格式（JSON Schema）保证互操作性与可校验性，自然语言灵活但引入解析不确定性。实际系统几乎总是采用混合策略——控制流用同步点对点保证确定性，事件流用异步发布订阅换取弹性。

### 冲突消解与故障处理

多 Agent 的冲突不止来自任务竞争，还来自状态分歧：各 Agent 对「当前世界状态」认知不一致时，合并结果互相覆盖。消解手段从轻到重：结构化消息携带版本与来源信息、协调者做结果合并仲裁、投票共识稀释分歧，最终兜底的是人工审批门——把高冲突、高影响的决策显式挂起等待人类签核。

故障处理同样依赖编排层而非 Agent 自律：确定性工作流（Step Functions / MWAA 等）以状态机或 DAG 的形式为每一步提供重试、分支与并行执行语义，状态持久化在编排层而非 Agent 内存中，从而把「单个 Agent 宕机」从级联灾难降级为可重试的普通故障。

## 实践启示

1. **从层级编排开始**：Orchestrator-Worker 是最容易理解和调试的模式，适合约 80% 的多 Agent 场景；仅在中心协调者成为性能瓶颈或协作关系动态不可预测时，再考虑对等协作或市场竞标。

2. **粒度规则：1 Agent = 1 上下文窗口**：子任务的大小以「填满但不溢出单 Agent 上下文窗口」为准，执行时间控制在分钟级——这是任务分解最可操作的检验标准。

3. **通信标准化先行**：在实现任何编排逻辑之前，先定义 Agent 之间的消息格式与协议——结构化消息保证互操作性，控制流用同步点对点、事件流用异步发布订阅。

4. **关键决策挂审批门**：把需要人类签核的步骤显式建模为 approval gate，执行在此暂停直到人工确认，避免「无人负责的自动化」与高风险决策的静默放行。

5. **为故障建重试与 DAG**：用确定性工作流承载跨 Agent 的流水线，让重试、分支与并行执行成为编排层的内建语义，防止单 Agent 故障静默级联成整体失败。

## 相关实体

- [一个 Mission 跑 16 天、烧 7.78 亿 Token：Factory 公开了多 Agent 系统的构建哲学](ch04/219-factory-missions.html)
- [AutoResearch 异步多 Agent AI 寒武纪新阶段](../ch01/1091-agent-ai.html)
- [Anthropic Multi Agent Research System](ch04/654-anthropic-multi-agent-research-system.html)
- [Code as Agent Harness 综述](../ch09/062-code-as-agent-harness.html)
- [Orchestrating Self-Evolving Agents with CrewAI and NVIDIA NemoClaw](ch04/285-self-evolving-agents.html)
- [AWS Bedrock 多智能体协作指南](../ch11/020-aws-bedrock.html)
- [Multi-Agent 的四种协作模式：Supervisor、Swarm、网状、流水线，怎么选？](../ch03/037-agent.html)
- [Agent vs Workflow：控制权连续谱与生产级选型框架](ch04/751-agent-vs-workflow.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agent-orchestration.md)

---

