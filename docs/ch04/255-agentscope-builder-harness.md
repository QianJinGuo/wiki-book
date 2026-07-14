# AgentScope Builder 快速体验：用 Harness 框架快速构建企业自进化智能体

## Ch04.255 AgentScope Builder 快速体验：用 Harness 框架快速构建企业自进化智能体

> 📊 Level ⭐⭐ | 10.0KB | `entities/agentscope-builder-enterprise-self-evolving-agent-harness.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agentscope-builder-enterprise-self-evolving-agent-harness.md)

# AgentScope Builder 快速体验：用 Harness 框架快速构建企业自进化智能体

## 背景：Claw 的边界

AgentScope Claw（MinQwenPaw）是 Harness 框架在「单人本机」场景的完整落地。但把它放到团队场景时，会遇到五个核心问题：

1. **多用户视图**：多人共用一个进程，按 token 鉴权、按用户分会话
2. **工作区隔离**：每个用户的工作区必须互不污染，Alice 调教的 agent 不能让 Bob 看到
3. **多副本一致性**：同一个用户的请求落到不同副本上，必须看到一致的 workspace
4. **OS 级隔离**：服务端跑用户输入的代码必须有沙箱
5. **Agent 分享**：做出来的好 Agent 要能被分享但不能被改坏，需要细粒度授权

这五个问题归结到一件事：「一个用户、一台机器、一个工作区」要被换成「多个用户、多台机器、多组被命名空间隔离的工作区」。

## AgentScope Builder 是什么

Builder 是 OpenClaw 的分布式版本 —— 同样的自我进化、同样的工作区驱动、同样的 Harness 运行时；只是从「一个人」变成「一个组织」，从「一台笔记本」变成「一组横向扩容的服务」。

**核心能力**：
1. QwenPaw 的多租户、可分布式版本，支持多人共用一个平台，每个人的 Agent 互不干扰，支持多副本部署
2. 零代码智能体开发平台，用户不需要写一行代码，就能在 Web UI 上创建、调教、分享自己的 Agent

## 核心设计：workspace 是 Agent 的资产

Builder 的产品设计围绕一个核心原则：**workspace 是 Agent 的资产**。

**隔离**：每一对 (用户, Agent) 都有自己独立的 workspace 命名空间。

**共享/授权策略**：
- **可运行（run）**：别人能调它，但看不到工作区内部，也不能改技能或 prompt
- **可编辑（edit）**：别人可以改它的配置和工作区文件，等于多人共用一个 Agent
- **可 fork**：别人复制出一份属于自己的 workspace，之后两份独立演化

## 零代码 + 自我进化

大多数零代码平台产出的是**静态的 Agent**。Builder 不一样——每个 Agent 背后都有一个**持续生长的 workspace**：

- **自动沉淀记忆**：每次对话结束后，Agent 会自己提炼新事实写入记忆
- **自动习得技能**：Agent 在完成任务的过程中，可以把可复用流程结构化成新 skill 写入 skills/ 目录
- **自动孵化子 Agent**：当某类子任务反复出现，Agent 可以把它拆出来定义为一个专属的子 Agent

## 核心机制：CompositeFilesystem

Builder 把每一个 Agent 都跑在 **HarnessAgent + CompositeFilesystem** 之上：

- **HarnessAgent**：负责 Agent 的运行时编排
- **CompositeFilesystem**：把工作区做成一个可命名空间隔离、可分布式落点、可投射到沙箱的资产

**CompositeFilesystem 两层架构**：
1. **Layer 1：命名空间分发** —— 把所有路径透明重写到 users/{userId}/agents/{agentId}/...
2. **Layer 2：存储后端** —— 本机磁盘 / Docker 容器 / 远端 KV 三选一

关键点：**Agent 代码完全不知道这两层的存在**。隔离是在 CompositeFilesystem 这一层实现的，不是靠业务代码「小心避开别人的目录」实现的。

## 深度分析

### 1. 从「单人本机」到「多租户分布式」的架构跨越

AgentScope Claw 验证了 Harness 框架在单人场景的产品力，但企业场景的核心矛盾不是功能多少，而是**隔离单位从小到大**：单人模式下一个 workspace 能满足需求，多人模式下每个 (用户, Agent) 组合都需要独立 workspace，且不能相互渗透。

Builder 的解法是把 CompositeFilesystem 作为第一层的「透明隔离层」——所有路径在落入存储后端之前就已经被重写，Agent 自身的代码完全感知不到多租户的存在。这是一种「让基础设施为业务代码填坑」的设计思路，而非在业务逻辑层散弹式地加 if (userId == X) 检查。

### 2. 「静态 Agent」vs「自进化 Agent」的本质差异

传统零代码平台产出的 Agent 本质上是**配置驱动**的工具：用户配置规则 → 平台路由 → 执行固定动作。这类 Agent 的能力天花板是「配置者的认知上限」，无法超出预定义范围。

Builder 的自进化路径是**workspace 驱动**：每一次对话的结果（事实、流程、结构化技能）都以文件形式写入 workspace，而 workspace 本身是 Agent 运行时可直接读取的上下文。这意味着 Agent 的能力增长是**内生的、持续的**，不需要回到管理后台重新配置。

这个设计的关键价值在于：平台从「提供 Agent」变成「提供 Agent 的土壤」——平台搭好基础设施，Agent 自己生长。

### 3. 细粒度授权体系决定了 Agent 分享的天花板

大多数平台在 Agent 分享上只能做到「要么公开、要么私有」二元选择。Builder 提出了三种权限粒度——run/edit/fork——并且授权对象可以精确到个人、用户组或全组织。

fork 机制尤其关键：它解决了一个根本矛盾——「我想用你的 Agent，但又不想改坏你的 Agent」。通过复制一份独立的 workspace，双方各自演进，平台层面天然解耦。

### 4. 多副本一致性问题：分布式workspace 的隐含挑战

当同一用户的请求被路由到不同服务副本时，如何保证每个副本看到的是同一个 workspace？Builder 通过 Channel 路由组件和 HarnessAgent 实例的对应关系来解决这个问题——每个 (userId, agentId) 组合路由到同一个实例，避免了跨副本的数据不一致。

这实际上是「一致性换可用性」的经典分布式取舍：Builder 选择让同类请求落到同类实例，而非追求无状态水平扩展。

## 实践启示

1. **从单人本机到企业分布式的关键抽象是 CompositeFilesystem**——它把「一个用户、一台机器」的工作区模型，扩展为可命名空间隔离、可分布式落地的多租户形态
2. **「同一份 Agent 逻辑，不同形态」是 Harness 的核心承诺**——在 Claw 本机模式下 Shell 工具自动出现；在 Builder 远端模式下，同一段 Agent 代码里的 Shell 工具自动消失
3. **零代码 + 自我进化是关键差异**——大多数零代码平台产出的是静态 Agent，Builder 的 Agent 会自己在工作区里写文件、沉淀记忆、孵化子 Agent
4. **隔离设计要放在基础设施层而非业务逻辑层**——CompositeFilesystem 的路径重写对 Agent 代码完全透明，业务逻辑无需感知多租户存在，这才是可扩展的隔离架构
5. **Agent 分享的细粒度授权是产品化的关键**——run/edit/fork 三档权限 + 精确到人/组/组织的授权对象，决定了平台能否支撑真正的团队协作
6. **多副本部署下的 workspace 一致性需要显式路由**——Channel 路由组件通过 (userId, agentId) 做亲和性调度，而非追求无状态扩展，这是务实的多租户分布式取舍

## 相关主题

- [AgentScope Java Harness Framework 企业分布式版](../ch05/018-harness.html) — 同一作者，更早的框架介绍
## 相关实体

- [enterprise readiness maturity model](../ch11/218-enterprise-readiness-maturity-model.html)

---

