# Agent的自演进，被刚刚开源的AReaL 2.0按下了加速键

## Ch04.679 Agent的自演进，被刚刚开源的AReaL 2.0按下了加速键

> 📊 Level ⭐⭐⭐ | 10.2KB | `entities/agent的自演进被刚刚开源的areal-20按下了加速键.md`

# Agent的自演进，被刚刚开源的AReaL 2.0按下了加速键

## 摘要

AReaL 2.0 是由蚂蚁集团联合香港科技大学、清华大学发布的开源 Agentic RL 训练底座，专注于解决 Agent 从「会使用工具并完成任务」向「在使用中学习并改进完成任务的方法」的关键跨越问题。它将在线强化学习基础设施从面向离线后训练的 RL 框架，延伸为连接 Agent 在线服务、轨迹采集、训练更新和运行时管理的可扩展系统。

## 核心要点

- **自演进 Agent 的三根支柱**：Agent Trajectory Data Protocol（ATDP，智能体轨迹协议）、企业级 Agentic Data Proxy（数据代理）、Agent Evolution Control Plane（演进控制平面）。三者共同构建从真实工作流到能力提升的完整闭环。
- **微服务化改造思路**：将原本服务于 Rollout 和训练的计算单元重组为可部署、可接入、可替换的 Agent-compute 微服务组件，在不重写 Agent 的前提下接入在线 RL 闭环。
- **核心架构组件**：Gateway（链路入口）、Router（会话分配与保持）、Data Proxy（轨迹管理）、Agent-Compute Worker（实际计算执行）、Controller（调度与管理）。
- **多场景验证**：在 Hermes Agent 和 Claude Code Agent RL 两个方向上验证了低侵入式接入和端到端训练效果——模型经 800 步训练后稳定涨分。
- **开源生态延伸**：加入 PyTorch Foundation Ecosystem，华为云提供国产昇腾 NPU 适配，MindLab 提供 LoRA 低算力方案。

## 深度分析

### 从执行闭环到学习闭环：Agent 自演进的范式转变

当前业界大部分 Agent 系统停留在「执行闭环」阶段：Agent 接收任务、执行工具调用、返回结果。但产生的交互轨迹——成功路径、失败步骤、用户修正、工具调用结果——大多只被当作日志或监控信息，用于排查问题，很少被系统化地转化为下一轮能力提升。

AReaL 2.0 瞄准的正是这一薄弱环节，推动 Agent 从「执行闭环」走向「学习闭环」。核心变化在于：Agent 不再只是任务的执行者，也是自身经验的学习者和进化者。

这一趋势与 Anthropic 内部实践高度一致——Claude Code 创造者 Boris Cherny 透露，Anthropic 几乎 100% 的工程师都在同时运行 100 多个带有自我改进循环的 Agent，让它们在每次运行中不断变得更好。

### 三根支柱的技术深度拆解

**第一支柱：ATDP（Agent Trajectory Data Protocol）**

普通日志通常记录用户问了什么、模型答了什么、调用了哪个工具、报错信息、延迟和 token 消耗。但对训练一个要从经验中变强的 Agent 来说，这些远远不够。ATDP 要求以步骤为单位记录完整决策过程：

- Agent 观察到了什么
- 内部状态或 harness 是什么
- 选择了什么动作及其结果
- 奖励或反馈在什么时候到达
- 模型版本、工具版本、租户、成本、权限、治理状态等元数据

只有将复杂任务拆分为可追责、可回放、可归因的学习样本，系统才能回答「到底是哪一次检索、哪一个工具调用、哪条 prompt 片段、哪段记忆影响到了任务成败」。

**第二支柱：Agentic Data Proxy**

ATDP 定义了「应该记录什么」，Data Proxy 解决的是「在真实生产系统里如何记录」。Agent 往往同时连接模型、工具、检索系统、记忆系统、人类反馈渠道、文件系统和浏览器动作，且不同团队可能使用不同 Agent 框架，不同租户有不同数据权限和合规边界。

Data Proxy 部署在这些关键边界上，同时负责：拦截、采集、脱敏、权限控制、轨迹持久化、奖励收集和回放管理。关键原则：数据进入训练队列之前，治理就要先完成。

**第三支柱：Agent Evolution Control Plane**

自演进不能简单理解成「一出错就立刻拿失败轨迹训练模型」。一个真实 Agent 由模型、prompt、harness、记忆、工具、路由策略和安全规则共同组成，不同类型的失败对应不同的修复入口：

- 缺少事实 → 写入记忆
- 工具路由问题 → 调整 tool schema 或 harness
- 跨租户、跨任务持续出现的失败 → 通过 RL、偏好优化、过程奖励学习或蒸馏更新策略模型

控制平面的价值在于把「是否更新、更新哪里」变成可治理的系统性决策，根据轨迹统计、用户修正率、工具失败簇、评估器得分、成本信号、安全约束和分布漂移，判断演进应落在哪个层面。

### 微服务架构：Online RL 的工程化落地

AReaL 2.0 的核心工程创新在于将传统 RL 基础设施改造为可承接 Agent 服务流量的在线系统，通过「解耦再组合」的方式打通 Agent 应用与后训练系统之间的连接：

- **Gateway**：链路入口，支持 HTTP/WebSocket，通过 OpenResponses bridge 提供兼容 /v1/responses 风格的接口
- **Router**：维护 session 与 Data Proxy 之间的绑定关系，确保同一个任务的多个会话落在对应的数据代理上，支持横向扩展
- **Data Proxy**：会话状态和轨迹管理，将普通 Agent 调用整理成可被训练系统消费的经验轨迹
- **Agent-Compute Worker**：实际的执行单元，在不同服务组件中承担不同角色——推理时实例化 SGLang/vLLM，训练时通过 Megatron/FSDP 进行训练计算
- **Controller**：调度、扩容、缩容、流量排空和健康检查

这种架构使得开发者只需将标准推理后端替换为 AReaL 2.0 管理的 Agent-Compute Worker，即可将真实交互纳入强化学习闭环，无需重写规划逻辑、工具调用、沙箱环境或记忆模块。

### 从 Hermes 到 Claude Code：可复用的 Online RL 路径

AReaL 2.0 在 Hermes Agent 上展示了低侵入式接入方式——把演示中的 Agent 换成自己的任务环境和智能体，复用 AReaL 2.0 的解耦接入、会话化交互与异步训练架构，可以搭建起面向自身业务的 Agent Online RL 流程。

在 Claude Code Agent RL 方向，AReaL 2.0 提供了更接近端到端实践的参考：数据侧筛选训练样本、改写 issue 描述；Agent Infra 侧基于大规模并发 sandbox 支撑几万个环境实例并发运行；算法侧引入 KPop 等稳定化策略应对 logp diff 问题——最终 800 步训练后实现稳定涨分。

## 实践启示

1. **轨迹数据是最被低估的资产**：每个 Agent 运行都会产生大量交互轨迹，它们不是日志垃圾，而是下一个版本模型的最佳训练数据。建立从轨迹采集到训练回放的系统化管线，是 Agent 持续进化的第一步。

2. **Online RL 的关键不在算法而在工程架构**：AReaL 2.0 的贡献更多在工程层面——微服务化、解耦、可替换——而非某一特定 RL 算法。对于想建立 Agent 自演进能力的团队，基础设施架构比算法选择更重要。

3. **演进控制平面是安全底线**：自演进不能是「改了就推」的黑盒。每次更新必须经过回放评估、离线回归测试、租户级安全检查、灰度发布和版本化追踪。一个无法解释「改了什么、为什么改、出问题后如何退回」的自演进系统是不可用的。

4. **低侵入式接入决定了落地速度**：要求重写 Agent 或推倒业务系统的方案注定走不远。AReaL 2.0 的设计原则——替换推理后端而非重写 Agent——是 Online RL 走向生产环境的正确方向。

5. **开源生态是唯一可持续路径**：AReaL 从蚂蚁 inclusionAI 孵化成为独立社区并加入 PyTorch Foundation Ecosystem，华为云提供昇腾 NPU 适配，MindLab 提供 LoRA 低算力方案——证明了开源社区协作对 Agent 基础设施标准化的重要性。

## 相关实体

- [Agent自我改进循环](../ch05/018-harness.html) — Agent 通过运行轨迹持续优化的核心理念
- [Hermes Agent](../ch03/092-hermes-agent.html) — AReaL 2.0 的 Hermes 接入范例
- [Claude Code 架构分析](../ch03/076-claude-code.html) — Claude Code 的 Agent RL 训练范例
- [Agent落地真相](../ch03/046-agent.html) — Agent 从演示到投产的挑战
- [Harness Engineering](../ch05/115-harness-engineering.html) — Agent 控制平面的系统方法论

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent的自演进被刚刚开源的areal-20按下了加速键.md)

---

