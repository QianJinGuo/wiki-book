# LangChain创始人解读：AI智能体两种沙盒架构

## Ch04.176 LangChain创始人解读：AI智能体两种沙盒架构

> 📊 Level ⭐⭐ | 11.9KB | `entities/langchain-harrison-chase-sandbox-architecture.md`

## 核心命题

LangChain 创始人 Harrison Chase 系统分析 AI 智能体与沙盒集成的两种架构模式：智能体在沙盒内运行 vs 智能体在外部运行、将沙盒作为工具调用。两种模式各有明确的优势与挑战，适用于不同场景。

## 背景

智能体需要执行代码、安装软件包、访问文件，必须与主机系统隔离以防止访问凭证、文件或网络资源。沙盒提供了这种隔离，但如何集成沙盒与智能体有两条路线。

## 模式一：智能体在沙盒内运行

**架构**：智能体完全运行在沙盒环境中，外部通过网络与之通信。 ^[https://mp.weixin.qq.com/s/1ts5cEe3qHN0w3-evQMzuQ]

**实现**：构建预装智能体框架的 Docker 或 VM 镜像，在沙盒内运行，从外部连接发送消息。智能体暴露 API 端点（HTTP 或 WebSocket），应用程序跨沙盒边界通信。

### 优势
- **镜像本地开发环境**：如果本地运行 deepagents，沙盒中运行相同命令
- **直接文件系统访问**：智能体可以直接修改环境
- **紧密耦合**：适用于需要与特定库交互或维护复杂环境状态的场景

### 挑战
- **跨沙盒通信基础设施**：需要 WebSocket/HTTP 层、会话管理、错误处理（E2B SDK 处理了这个问题） 
- **API 密钥安全风险**：密钥必须存储在沙盒内以允许智能体进行推理调用，沙盒被攻破时产生安全风险（E2B、Runloop 正在开发密钥保险库功能） 
- **迭代速度慢**：更新需要重建容器镜像并重新部署 
- **状态恢复复杂性**：沙盒必须在智能体激活前恢复 
- **知识产权风险**：智能体代码和提示在沙盒内更容易被泄露 

**Nuno Campos（Witan Labs）安全观点**：智能体的任何部分都不能拥有比 bash 工具更多的权限。模式一下所有 LLM 生成的代码都可以进行无限制的网络访问，这是很大的安全风险。

## 模式二：沙盒作为工具

**架构**：智能体运行在本地或服务器上，需要执行代码时通过 API 调用远程沙盒。 ^[https://mp.weixin.qq.com/s/1ts5cEe3qHN0w3-evQMzuQ]

**实现**：智能体生成需要执行的代码时，调用沙盒提供商 API（如 E2B、Modal、Daytona、Runloop）。提供商 SDK 处理所有通信细节，从智能体角度看沙盒就是另一个工具。

### 优势
- **快速迭代**：无需重建容器镜像，可以即时更新智能体代码 
- **API 密钥安全**：密钥保留在沙盒外，只有执行发生在隔离环境 
- **清晰的关注点分离**：智能体状态（对话历史、推理链、内存）与沙盒分离，沙盒故障不丢失智能体状态，可切换沙盒后端不影响核心逻辑 
- **E2B Tomas Beran 补充**：
  - 可以在多个远程沙盒中并行运行任务 
  - 只在执行代码时为沙盒付费（而非整个进程运行时间） 

### 挑战
- **网络延迟**：主要缺点，尤其对小执行密集型工作负载 
- **有状态会话缓解**：提供商通常提供有状态会话（变量、文件、已安装包在同一会话的调用间持续存在），减少往返次数 

**Ben Guo（Zo Computer）**：选择模式二还考虑到未来可能需要在 GPU 机器上运行智能体工具——持久沙盒和推理工具的环境需求会发生分化。

## 选择建议

**选模式一的情况**： ^[https://mp.weixin.qq.com/s/1ts5cEe3qHN0w3-evQMzuQ]
- 智能体与执行环境紧密耦合（需要持续访问特定库或复杂环境状态）
- 希望生产环境密切镜像本地开发
- 提供商 SDK 处理了通信层

**选模式二的情况**： ^[https://mp.weixin.qq.com/s/1ts5cEe3qHN0w3-evQMzuQ]
- 需要在开发期间快速迭代智能体逻辑
- 希望将 API 密钥保留在沙盒外
- 更喜欢智能体状态和执行环境之间更清晰的分离

## 社区讨论要点

1. **模式一的生产可行性**：开发者质疑存在"巨大的安全漏洞和各种极具挑战性的基础设施约束（沙盒可观察性、正常运行时间、扩展等）"  ^[https://mp.weixin.qq.com/s/1ts5cEe3qHN0w3-evQMzuQ]

2. **Nico Ritschel 的反驳**：API 密钥问题可通过代理推理调用和在沙盒外注入密钥解决；知识产权保护可将 IP 保存在智能体可访问的工具中  ^[https://mp.weixin.qq.com/s/1ts5cEe3qHN0w3-evQMzuQ]

3. **Harrison Chase 回应**：密钥代理还不是标准做法，虽然一些提供商正在添加这些功能  ^[https://mp.weixin.qq.com/s/1ts5cEe3qHN0w3-evQMzuQ]

4. **Adish Jain（InvariumAI）**：无论采用哪种模式，真正的问题是如何验证智能体在沙盒内实际执行的操作——强调智能体行为测试的重要性  ^[https://mp.weixin.qq.com/s/1ts5cEe3qHN0w3-evQMzuQ]

5. **Nathan Flurry 的 Sandbox Agent SDK**：专门解决"智能体在沙盒内"模式复杂性，支持 Claude Code、Codex、OpenCode、Cursor、Amp、Pi 等多种智能体，提供统一的 HTTP API 来远程控制沙盒内的智能体  ^[https://mp.weixin.qq.com/s/1ts5cEe3qHN0w3-evQMzuQ]

## 相关主题
- [Harness Generator Evaluator Anthropic](ch01/707-anthropic.md) — Generator-Evaluator 架构
- [Agent Harness Engineering Survey 2026](ch04/503-agent.md) — Agent Harness 工程综述
- [Pi Openclaw Coding Harness](ch11/207-openclaw.md) — OpenClaw Coding Harness

## 深度分析

**1. 安全模型的本质差异决定了架构选择** ^[https://mp.weixin.qq.com/s/1ts5cEe3qHN0w3-evQMzuQ]

模式一与模式二的核心分歧不在于功能，而在于信任边界的设计哲学。Nuno Campos 的观点揭示了一个关键洞察：模式一下智能体（包含 LLM 生成的代码）整体获得了比 bash 工具更宽泛的权限——这意味着沙盒内的任何代码漏洞都可能成为横向攻击的跳板。模式二通过让工具持有独立权限（与 LLM 生成代码解耦）实现了更细粒度的安全控制。这一分析为安全敏感型应用提供了明确的架构指引。

**2. VCS-style 状态管理是模式二的核心竞争力** ^[https://mp.weixin.qq.com/s/1ts5cEe3qHN0w3-evQMzuQ]

模式二的"关注点分离"优势本质上是将沙盒视为无状态执行环境，通过外部存储维护智能体的对话历史、推理链和内存。这种 VCS-style（版本控制系统风格）的状态管理允许：沙盒故障时状态完好、随时切换沙盒后端、并行执行多任务。E2B 的有状态会话设计在减少网络往返的同时，实际上是在模拟 Git 的 commit 语义——每次执行都是对持久状态的增量修改。

**3. 密钥管理正在成为沙盒架构的分水岭** ^[https://mp.weixin.qq.com/s/1ts5cEe3qHN0w3-evQMzuQ]

Harrison Chase 指出密钥代理"还不是标准做法"，但 E2B 和 Runloop 已在开发密钥保险库功能。这反映了一个行业趋势：沙盒提供商正在从纯粹的执行环境向"可信执行+安全管理"平台演进。Nico Ritschel 提出的"沙盒外注入密钥"方案本质上是将密钥管理外置，与模式二的设计逻辑一致——未来谁能提供更安全的密钥生命周期管理，谁就能在模式一赛道占据优势。

**4. 网络延迟与执行密度是模式二的关键约束** ^[https://mp.weixin.qq.com/s/1ts5cEe3qHN0w3-evQMzuQ]

Ben Guo 提到的 GPU 机器需求暗示了一个深层趋势：持久沙盒和推理工具的环境需求正在分化。当智能体需要同时处理长期运行任务（需要持久环境）和短时执行任务（需要弹性资源）时，模式二的按需调用模型更具灵活性。但对于代码执行密集型工作流（如需要数千次小规模 Python 调用的测试场景），网络延迟的累积效应可能使模式二失去优势。

**5. 智能体行为验证是两种模式共同面临的盲区** ^[https://mp.weixin.qq.com/s/1ts5cEe3qHN0w3-evQMzuQ]

Adish Jain 的观点揭示了一个被忽视的问题：无论选择哪种架构，如何验证智能体在沙盒内实际执行的操作都是核心挑战。这与 [Harness Generator Evaluator Anthropic](ch01/707-anthropic.md) 中 Anthropic 强调的"eval 优先"理念形成呼应——沙盒提供了隔离，但隔离不等于可控。两种模式都需要额外的行为验证层（如 trajectory logging、deterministic feedback sensors），这是当前架构讨论中缺失的关键维度。

## 实践启示

**1. 优先采用模式二作为默认架构** ^[https://mp.weixin.qq.com/s/1ts5cEe3qHN0w3-evQMzuQ]

在大多数场景下，模式二（沙盒作为工具）提供了更好的迭代速度、安全边界和状态管理。除非智能体与执行环境存在不可拆解的耦合（如需要持续访问复杂本地库或必须镜像生产环境），否则应将模式二作为起点设计选择。

**2. 为沙盒交互实现幂等性和超时控制** ^[https://mp.weixin.qq.com/s/1ts5cEe3qHN0w3-evQMzuQ]

无论采用哪种模式，都应将沙盒调用设计为幂等操作，并配置明确的超时机制。模式二的网络延迟和模式一的镜像重建都需要容错设计。对于模式二，建议实现重试逻辑和指数退避；对于模式一，建议在镜像构建时固化环境快照以支持快速回滚。

**3. 将 API 密钥置于沙盒外部并实现密钥轮换** ^[https://mp.weixin.qq.com/s/1ts5cEe3qHN0w3-evQMzuQ]

密钥安全是模式一的主要风险点。即使选择模式一，也应优先使用密钥代理或提供商提供的密钥保险库功能。定期轮换密钥、最小权限原则、多密钥分离（区分推理密钥和执行密钥）是基本的安全实践。

**4. 构建智能体状态与沙盒状态的明确边界** ^[https://mp.weixin.qq.com/s/1ts5cEe3qHN0w3-evQMzuQ]

参考 VCS-style 状态管理模式，将智能体的对话历史、推理链和内存保存在沙盒外部。沙盒应被视为纯执行层，其内部不应存储需要持久化的业务状态。这一边界的清晰划分直接影响系统的可恢复性和可扩展性。

**5. 建立沙盒行为验证机制作为必要组件** ^[https://mp.weixin.qq.com/s/1ts5cEe3qHN0w3-evQMzuQ]

Adish Jain 强调的行为测试应该成为沙盒集成的标准环节，而非事后考虑。建议实现：工具调用轨迹记录、沙盒内文件变更审计、执行结果确定性校验。这与 [Agent Harness Engineering Survey 2026](ch04/503-agent.md) 中 Verification 层的最佳实践一致。

## 关联阅读
- [Harness Generator Evaluator Anthropic](ch01/707-anthropic.md) — Anthropic 的 Generator-Evaluator Harness 架构，提供了智能体评测闭环的设计思路，与沙盒行为验证问题直接相关
- [Agent Harness Engineering Survey 2026](ch04/503-agent.md) — Agent Harness 工程的系统性综述，包含沙盒（Execution environment）层的完整分类，对理解两种沙盒架构的行业上下文很有价值

---

