# Lambda MicroVMs vs Bedrock AgentCore：AI Agent 开发者该怎么选？

## Ch11.096 Lambda MicroVMs vs Bedrock AgentCore：AI Agent 开发者该怎么选？

> 📊 Level ⭐⭐ | 9.9KB | `entities/lambda-microvms-vs-bedrock-agentcore-ai-agent-comparison.md`

# Lambda MicroVMs vs Bedrock AgentCore：AI Agent 开发者该怎么选？

## 概述

2026 年 6 月，AWS 同时拥有了两个能"安全运行 AI 生成代码"的 Serverless 产品——**Lambda MicroVMs** 和 **Bedrock AgentCore Runtime**。它们底层都基于 Firecracker microVM，却处在完全不同的抽象层。理解两者的定位差异对于 AI Agent 架构设计至关重要。

## 核心差异：计算原语 vs Agent 框架

### 定位差异

| 维度 | Lambda MicroVMs | Bedrock AgentCore Runtime |
|------|-----------------|--------------------------|
| **本质定位** | 通用 Serverless 计算原语 | AI Agent 专属托管运行时 |
| **你提供什么** | Dockerfile + 任意应用代码 | Agent 框架代码（Strands/LangGraph/CrewAI） |
| **你得到什么** | 一台隔离的、有状态的 VM + 唯一 URL | Agent 运行环境 + Memory + Tools + Identity + 可观测性 |
| **编程模型** | 任意 HTTP 服务器（Flask/Express/Go…） | AgentCore SDK + 框架适配器 |
| **隔离机制** | 每 MicroVM 独立 Firecracker VM | 每 Session 独立 Firecracker microVM |
| **最长运行时间** | 8 小时（可挂起恢复） | 同步 15 分钟 / 异步 8 小时 |
| **计费特点** | 按 baseline 配置按秒计费；挂起时免费 | 按实际 CPU 消耗按秒计费；I/O 等待免费 |
| **内置 LLM 编排** | 无 | 内置调度与工具调用 |
| **内置 Memory/Tool** | 无 | AgentCore Memory + Gateway |
| **协议支持** | 任意（你的 HTTP 服务） | HTTP + MCP + A2A + AG-UI + WebSocket |
| **适合场景** | 代码沙箱、CI Runner、多租户开发环境 | 端到端 AI Agent 生产部署 |

### 关键差异深度解析

#### 隔离模型与状态生命周期

两者都使用 Firecracker microVM 实现隔离，但状态管理哲学截然不同：

- **Lambda MicroVMs** 把状态生命周期完全交给开发者。通过 API 显式启动、挂起、恢复和终止 MicroVM。挂起时内存和磁盘状态被快照保存，恢复时从快照快速启动。适合需要精细控制状态的工作负载。
- **Bedrock AgentCore** 由平台自动管理 Session 生命周期。空闲 15 分钟自动终止（可配置 60-28800 秒）。开发者不需要关心 VM 的启停，只需关注 Agent 逻辑本身。

#### 计费模型差异

- **Lambda MicroVMs**：按 baseline 配置按秒计费（类似传统 EC2 的预留容量模式），挂起时存储费用但计算免费。适合长时间运行但间歇性活跃的工作负载。
- **Bedrock AgentCore**：按实际 CPU 消耗计费，I/O 等待时间免费。适合短时高并发 Agent 调用，成本与 Agent 实际计算量正相关。

## 选择决策指南

### 选择 Lambda MicroVMs 的场景

- 需要运行任意代码（不限于 AI Agent 工作负载）
- 需要精细控制 VM 生命周期（挂起/恢复/快照）
- 运行的是自定义推理引擎或非标准 Agent 框架
- 需要与传统微服务架构集成

### 选择 Bedrock AgentCore 的场景

- 构建端到端 AI Agent 应用
- 需要内置 LLM 编排、Memory、Tool Gateway
- 想要最小化基础设施管理负担
- Agent 工作负载为短时（<15 分钟同步）或长时异步

### 组合架构模式

两个产品并非互斥——在实践中，常见模式是组合使用：

```
Bedrock AgentCore (Agent 编排层)
  → Lambda MicroVMs (代码沙箱层)
    → 运行 Agent 生成的代码
```

AgentCore 处理 LLM 调用、工具编排、Memory 等 Agent 逻辑，将代码执行任务委派给 Lambda MicroVMs 中的隔离沙箱。这种组合利用了 AgentCore 的托管 Agent 能力和 MicroVMs 的自定义代码执行灵活性。

## 深度分析

### 砖头 vs 精装房：抽象层次的选择决定了架构自由度

Lambda MicroVMs 与 Bedrock AgentCore 的核心区别在于**抽象层次**——这不仅仅是 API 设计差异，而是对整个 AI Agent 架构范式的根本分歧。

Lambda MicroVMs 提供的是"计算原语"——最小的隔离执行单元。它不对使用场景做任何假设，给你最大的自由度，但也要求你自行实现所有上层逻辑（LLM 调用、工具编排、状态管理）。这就像给了你一块空地（砖头），你想盖什么都可以，但需要自己从头建。

Bedrock AgentCore 提供的是"Agent 运行时"——一个假设你要跑 AI Agent 的完整平台。它内置了 Agent 所需的全部基础设施（LLM 编排、工具网关、Memory、OAuth、可观测性），但你的架构选择被限制在它预设的框架内。这就像拿了精装房——入住快，但想改户型很难。

这种选择对应到经典的系统设计权衡：**自由度 vs 开箱即用**。AI Agent 生态尚在早期，框架选择应以团队能力和迭代速度为导向。

### Firecracker 的统一底层的战略意义

两个服务底层都是 Firecracker microVM，这一点值得深入思考。 AWS 通过统一的虚拟化底座实现了安全隔离的不同抽象层次：

- **MicroVM 级隔离**比进程级隔离（如 gVisor、runC）更强，可以运行不可信代码
- **Firecracker 的启动速度**（<125ms）使得按需创建 VM 成为可行选项
- **统一底座**意味着 AgentCore 的 Session 和 MicroVM 的 VM 在安全模型上等价

这种"统一底座 + 分层抽象"的策略——底层用同一套安全原语，上层暴露不同抽象级别的 API——是 AI 基础设施设计中的优秀实践，值得 [Harness 工程](../ch05/052-harness-engineering.html) 平台设计参考。

### 代码沙箱：AI Agent 安全架构的关键组件

无论选择哪种方案，隔离运行 Agent 生成的代码都是安全核心需求。 Lambda MicroVMs 和 Bedrock AgentCore 都提供了 Firecracker 级的隔离，但适用场景不同：

- **MicroVM 级**：适合执行不可信代码，完全隔离，可防御侧信道攻击
- **进程级**：性能更好但隔离性弱，适合可信代码执行
- **浏览器沙箱**：适合 Web 自动化场景，AgentCore 内置支持

安全架构策略：**最小权限 + 深度防御**。即使有 MicroVM 隔离，也不应给 Agent 超出需要的权限。多层安全（网络策略、文件系统限制、API 频率控制）比单层强隔离更可靠。

### Agent 的"运行时环境"正在成为新的云原语

Lambda MicroVMs 和 Bedrock AgentCore 的出现标志着 AI Agent 运行时正在成为云计算的新原语，就像当年的 Lambda 函数定义了 Serverless 计算范式一样。 未来，Agent 运行时可能会像数据库、消息队列一样成为云平台的标准服务，每个应用架构师都需要理解不同 Agent 运行时的特性和取舍。

## 实践启示

1. **先确定需要的抽象层次**：选型第一问不是"哪个功能更强"，而是"我需要多少自由度"。如果 Agent 逻辑简单且希望快速上线，Bedrock AgentCore 的精装房模式更合适；如果有自定义 Agent 框架或特殊执行需求，Lambda MicroVMs 的砖头模式提供所需灵活性。

2. **组合使用优于二选一**：在实际 Agent 架构中，两个产品可以互补——AgentCore 处理编排层，MicroVMs 提供隔离执行层。这种组合利用了各自优势，避免了"用 AgentCore 执行自定义代码"或"用 MicroVM 搭建 LLM 编排"的别扭。

3. **关注安全隔离而非功能列表**：AI Agent 选择运行时，第一优先级应该是代码执行的安全性。Firecracker 级别的 MicroVM 隔离是目前最强的 Serverless 隔离方案，应作为安全敏感场景的首选。

4. **计费模型决定架构设计**：MicroVMs 的按 baseline 计费适合稳定持续的工作负载；AgentCore 的按 CPU 消耗计费适合间歇性调用的场景。在选择前用量化方式估算不同模式的成本，避免架构设计完成后发现成本不可控。

5. **关注生态演进而非当前功能**：Agent 运行时是快速演进的领域。选择时不仅看当前功能，还要看平台的 API 稳定性、向后兼容性、以及 AWS 的投入力度。当前两个服务都在快速迭代，每季度回顾选型决策是必要的。

## 相关实体

- [Amazon Bedrock Agent](../ch04/531-amazon-bedrock-agentcore.html)
- [Agent 代码沙箱安全](../ch04/386-sandboxing-an-ai-agent.html)
- [AWS Lambda Serverless](ch11/156-what-you-need-to-know-about-lambda-microvms.html)
- [Harness Engineering](../ch05/052-harness-engineering.html)
- [Agent 上下文管理](../ch05/039-agent-harness.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/lambda-microvms-vs-bedrock-agentcore-ai-agent-comparison.md)

---

