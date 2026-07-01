# What You Need to Know About Lambda MicroVMs

## Ch11.151 What You Need to Know About Lambda MicroVMs

> 📊 Level ⭐⭐ | 7.5KB | `entities/theburningmonk-com-2026-06-what-you-need-to-know-about-lambda-microvms.md`

# What You Need to Know About Lambda MicroVMs

## 摘要

AWS 于 2026 年 6 月推出 Lambda MicroVMs，解决了"如何安全运行 AI 生成或用户提供的代码"这一紧迫问题。它结合了 VM 级隔离（Firecracker）、快速启动（SnapStart 快照）和有状态会话（最长 8 小时），为 coding assistants、AI notebooks、agent sandboxes 等场景提供了理想的计算原语。与 AgentCore Runtime 的区别在于抽象层级：AgentCore 是托管 agent 平台，Lambda MicroVMs 是底层 VM 原语。

## 核心要点

### 解决的核心问题

构建需要执行任意代码的产品时（coding assistant、AI notebook、自定义脚本平台），现有方案都不理想：

| 方案 | 隔离性 | 启动速度 | 有状态 | 时长限制 |
|------|--------|----------|--------|----------|
| VM (EC2) | ✅ 强 | ❌ 分钟级 | ✅ | ✅ 无限 |
| Container (ECS) | ⚠️ 共享内核 | ✅ 秒级 | ✅ | ✅ 无限 |
| Lambda 函数 | ✅ 强 (Firecracker) | ✅ 秒级 | ❌ 无状态 | ❌ 15 分钟 |
| **Lambda MicroVMs** | **✅ 强 (Firecracker)** | **✅ 秒级** | **✅ 最长 8h** | **✅ 8 小时** |

Lambda MicroVMs 填补了这个空白：VM 级隔离 + 秒级启动 + 有状态 + 长时运行。

### 与传统 Lambda 的根本区别

Lambda MicroVMs **不是** request/response 模型：

- **会话模型**：每个用户/会话一个持久 VM，有独立 HTTPS endpoint
- **连接协议**：HTTP/2、gRPC、WebSocket
- **认证**：bearer token（通过 CreateMicrovmAuthToken API 生成）
- **自动挂起/恢复**：空闲时自动挂起（不计费），流量到达时自动恢复
- **垂直扩展**：自动 burst 到配置基线的 4× CPU 和内存
- **水平扩展**：**不自动扩展**，需手动调用 `run-microvm` 创建新环境

### Shell 访问与 Docker 支持

Aidan Steele 在发布日的探索揭示了重要细节：

- **Shell 访问是一等公民**：支持 `/dev/ptmx`（pseudo-terminal），有专门的 `CreateMicrovmShellAuthToken` API
- **Docker 在 MicroVM 内可用**：完整的 OS 能力，包括在 MicroVM 内运行容器
- **已知坑**：所有出站 UDP 默认被封，会破坏容器内的 DNS（需手动修复）

Shell 访问意味着 Claude Code 和 OpenCode 等工具使用的真实终端体验，可以在 Lambda MicroVMs 上为用户构建。

### 与 AgentCore Runtime 的对比

| 维度 | Lambda MicroVMs | AgentCore Runtime |
|------|-----------------|-------------------|
| 抽象层级 | 底层 VM 原语 | 托管 agent 平台 |
| 隔离技术 | Firecracker | Firecracker |
| 最长运行时间 | 8 小时 | 8 小时 |
| Shell 访问 | ✅ 一等公民 | ✅ (InvokeAgentRuntimeCommandShell) |
| Fleet 管理 | ❌ 需自行管理 | ✅ AWS 管理 |
| Auth | ❌ 需自行实现 | ✅ 内置 inbound/outbound auth |
| Protocol 支持 | ❌ | ✅ MCP + A2A |
| VM 控制权 | 完全控制 | 受限（类似 Fargate vs EC2） |

Yan Cui 的类比精辟：**AgentCore Runtime 之于 Lambda MicroVMs，如同 Fargate 之于 EC2**。

- AgentCore Runtime → 运行我的 agent，让用户与之对话
- Lambda MicroVMs → 给每个用户一个隔离 VM，让他们在其中运行任意代码

### 当前限制

- **架构**：仅 ARM64
- **区域**：仅 5 个（N. Virginia、Ohio、Oregon、Ireland、Tokyo）
- **定价**：vCPU-秒 + 内存 GB-秒 + 快照读写费（更接近 Fargate 而非 Lambda）
- **计费粒度**：按秒计费（非 Lambda 的毫秒级）
- **无自动水平扩展**：需自行管理 VM fleet

## 深度分析

### Agent Sandbox 的基础设施级解决方案

Lambda MicroVMs 的出现标志着 agent sandbox 从"应用层方案"进化到"基础设施级方案"：

**应用层方案**（E2B、自建沙箱）：
- 需要自行管理基础设施
- 安全隔离需要持续审计
- 扩展需要自行实现

**基础设施级方案**（Lambda MicroVMs）：
- AWS 管理底层基础设施
- Firecracker 的安全隔离经过大规模验证
- 垂直扩展自动完成

这对 Agent Security 有深远影响：当沙箱成为基础设施原语时，安全审计的范围大幅缩小。

### 对 Agent Runtime 生态的影响

Lambda MicroVMs 和 AgentCore Runtime 共同构成了 AWS 的 agent runtime 双轨策略：

1. **AgentCore Runtime**：面向 agent 开发者，提供托管的 agent 运行环境
2. **Lambda MicroVMs**：面向平台构建者，提供底层的隔离计算原语

这个策略覆盖了 agent 生态的两个关键需求：

- **运行 agent**（AgentCore）：开发者专注于 agent 逻辑，AWS 管理基础设施
- **构建 agent 平台**（Lambda MicroVMs）：平台方需要底层控制权来构建自定义的 agent 运行时

### Firecracker 的战略价值

Firecracker 从 Lambda 的底层技术，扩展为 AWS 的通用隔离原语：

- **Lambda 函数**：Firecracker MicroVM 作为函数执行环境
- **Lambda MicroVMs**：Firecracker MicroVM 作为持久 VM 原语
- **AgentCore Runtime**：Firecracker MicroVM 作为 agent 运行环境
- **Fargate**：Firecracker MicroVM 作为容器运行环境

Firecracker 正在成为 AWS 计算服务的**统一隔离层**。

### 定价模型的隐含信号

Lambda MicroVMs 的定价更接近 Fargate 而非 Lambda，这传递了一个重要信号：

- **不是**按请求计费（Lambda 模型）
- **是**按资源占用计费（Fargate 模型）

这暗示 AWS 将 Lambda MicroVMs 定位为**长时运行的计算服务**，而非事件驱动的函数服务。

## 实践启示

- **Agent sandbox**：Lambda MicroVMs 是构建 agent sandbox 的理想基础设施，Firecracker 隔离经过大规模验证
- **Coding assistant**：Shell 访问 + Docker 支持 + 隔离环境，完美匹配 coding assistant 的需求
- **选型决策**：需要完全控制选 Lambda MicroVMs，需要托管服务选 AgentCore Runtime
- **区域规划**：目前仅 5 个区域，需确认目标用户所在区域
- **ARM64 兼容**：确保应用支持 ARM64 架构
- **Fleet 管理**：准备好自行管理 VM 生命周期（创建、追踪、清理）

## 相关实体

- Agent Security — Lambda MicroVMs 解决的核心安全问题
- Firecracker — Lambda MicroVMs 的底层虚拟化技术
- Serverless — Lambda MicroVMs 扩展了 serverless 的边界
- E2B — 应用层 sandbox 方案，Lambda MicroVMs 的替代选择
- Agent Runtime — agent 运行环境的整体概念

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/theburningmonk-com-2026-06-what-you-need-to-know-about-lambda-microvms.md)

---

