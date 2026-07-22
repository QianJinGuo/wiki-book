# Lambda MicroVMs vs Lambda Functions：全方位深度对比

## Ch11.127 Lambda MicroVMs vs Lambda Functions：全方位深度对比

> 📊 Level ⭐⭐ | 8.4KB | `entities/lambda-microvms-vs-lambda-functions全方位深度对比.md`

# Lambda MicroVMs vs Lambda Functions：全方位深度对比

2026年6月22日 AWS 正式发布了 Lambda MicroVMs——一个基于 Firecracker 虚拟化技术的全新 Serverless 计算原语，与 Lambda Functions 同属 AWS Lambda 产品家族，但解决完全不同类别的问题。两者不是替代关系，而是互补关系，面向不同类别的计算需求。

## 摘要

Lambda MicroVMs 的推出标志着 Serverless 计算从「函数即服务」（FaaS）向「隔离沙箱即服务」（Isolated Sandbox as a Service）的重要演进。与 Lambda Functions 的事件驱动无状态短任务模型不同，MicroVMs 为每个会话分配完全独立的 Firecracker VM——独立内核、独立内存空间、独立磁盘状态——专为需要 VM 级隔离、有状态长会话和完整生命周期控制的场景设计，特别是 AI 编程助手、多租户 SaaS 平台和安全代码执行环境。

## 核心要点

- **Firecracker VM 级隔离**：每个会话分配独立内核、独立内存和磁盘，实现真正 VM 级安全隔离
- **有状态长会话**：最长运行 8 小时，支持挂起/恢复机制（类似笔记本电脑的合盖/开盖）
- **Image-then-Launch 启动模型**：预初始化快照恢复启动，约 2 秒进入 RUNNING 状态
- **挂起/恢复降成本**：用户不活跃时 VM 自动挂起，停止计算费用，保留内存和磁盘快照
- **高规格上限**：最高 16 vCPU、32 GB 内存、32 GB 磁盘，支持垂直弹性伸缩
- **原生协议支持**：HTTP/2、gRPC、WebSocket、SSE，每个 VM 独立 URL
- **仅 ARM64（Graviton）**：目前仅在 5 个 Region 可用

## 深度分析

### 隔离级别的范式转变：从共享内核到独立 VM

Lambda Functions 虽然底层也使用 Firecracker，但多个函数执行环境共享同一个 MicroVM 的内核资源。这种设计在处理受信任代码时效率极高——但是，如果你的应用需要运行用户提交的代码或 AI 生成的代码，共享内核架构意味着攻击者可能通过内核漏洞实现逃逸。

MicroVMs 为每个会话分配一个完全独立的 Firecracker VM——独立内核、独立内存空间、独立磁盘状态。值得注意的是，MicroVMs 甚至支持在 VM 内运行 Docker 容器——你可以启用完整的 Linux capabilities，在沙箱中运行容器化工作负载，实现「VM 中的容器」这种嵌套隔离模式。

对于需要运行来源不可控的代码（用户上传的脚本、AI 生成的代码、第三方插件），MicroVMs 提供的 VM 级隔离不是「nice to have」，而是安全底线。对于漏洞扫描、AI 代理沙箱、CI/CD 流水线中执行第三方代码等场景，这种级别的隔离是刚需。

### 挂起/恢复机制的经济学意义

MicroVMs 最被低估的特性是「挂起-恢复」机制——当用户不活跃时，VM 自动挂起，计算费用停止，完整的内存和磁盘快照被保留。当下一个请求到达时，VM 从快照恢复，所有已安装的包、加载的模型、工作文件集立即可用。

这种体验非常接近笔记本电脑的「合盖-开盖」——用户感知不到中断，但你只为实际使用时间付费。对于交互式开发环境、数据科学 Notebook、AI 编程会话等场景，这个特性的价值不可估量：

- **成本优势 vs EC2**：100 个用户每天使用 AI 编程助手 4 小时（2 小时活跃 + 2 小时空闲），MicroVMs 只在活跃时收取计算费用，而 EC2 需要 100 个实例持续运行。即使加上 Savings Plan，4 小时/天的利用率意味着 EC2 有大量浪费。

- **运维优势 vs 自建**：无需自行构建隔离、生命周期管理和快照恢复机制，这些由 Lambda 平台原生提供。

### Image-then-Launch 对比传统冷启动

Lambda Functions 的 SnapStart 可以缓解 Java 等语言的初始化延迟，但仅限于特定运行时。MicroVMs 采用全新的 Image-then-Launch 模型：你提供 Dockerfile 和代码，Lambda 构建镜像时会实际运行你的应用并对运行状态拍摄 Firecracker 快照。之后每次启动新 MicroVM 都是从这个预初始化快照恢复。

这意味着你可以在镜像构建阶段预装所有依赖（pip install、npm install、模型下载），这些全部被快照保存。后续启动不再重复安装，直接从「万事俱备」的状态开始服务。这让 MicroVM 的启动延迟接近容器，但隔离级别是 VM——这在 Serverless 领域是前所未有的组合。

### 架构模式：Functions 做控制面，MicroVMs 做数据面

最强大的架构往往是将两者结合：

1. **AI 编程助手架构**：前端通过 WebSocket 连接到用户专属的 Lambda MicroVM → MicroVM 中运行代码执行服务，预装开发工具 → AI 生成的代码在 MicroVM 内部执行 → 用户离开时 MicroVM 自动挂起。Lambda Functions 处理用户认证、会话管理和 MicroVM 生命周期编排。

2. **多租户数据分析平台**：每个租户分配一个 MicroVM，预装数据分析工具 → 查询通过独立 URL + 认证令牌路由 → 数据中间结果在会话间保持 → Functions 处理数据摄入管道。

3. **安全扫描平台**：每个扫描任务启动一个临时 MicroVM → 可运行 Docker 容器（完整 Linux capabilities）→ 扫描完成后直接终止，无状态残留。Functions 处理任务调度和结果收集。

这种组合模式与 [AgentCore 架构](../ch04/657-agentcore-harness.html) 中的「编排层 + 执行层」分离的思路一致。

## 实践启示

1. **隔离级别的选择决定了安全模型**：如果你需要运行不可信代码（AI 生成代码、用户提交脚本、第三方插件），容器级隔离（共享内核）是不够的。MicroVMs 的 VM 级隔离是安全基线。这是 Serverless 首次提供与 EC2 同等隔离级别的原生计算原语。

2. **挂起/恢复是 Serverless 经济的下一步进化**：传统的 Serverless 按调用计费模型在交互式长会话场景下效率不足（挂起时仍需付费或重新冷启动）。MicroVMs 的挂起/恢复机制让 Serverless 首次在交互式场景中具备成本优势。

3. **ARM64-only 的影响**：目前 MicroVMs 仅支持 ARM64（Graviton），如果你的代码依赖 x86 二进制文件（许多传统企业应用），目前还无法迁移。这可能会加速 x86→ARM 的迁移，但也意味着短期内 MicroVMs 更适合新项目而非迁移项目。

4. **「控制面 + 数据面」的最佳实践**：不要试图用 MicroVMs 替代 Functions，而是将两者组合——Functions 处理事件驱动的控制面（路由、认证、调度、编排），MicroVMs 处理需要隔离执行的数据面。这种组合让你既保持了 Serverless 的运维简便性，又获得了 VM 级别的安全隔离。

## 相关实体

- [AgentCore 多Agent系统AWS实现](../ch04/657-agentcore-harness.html)
- [Backend for Agent 架构](../ch03/046-agent.html)
- [腾讯 Harness Engineering 探索之旅](../ch05/116-harness-engineering.html)
- [企业级 Agent 编排](../ch04/496-agent-orchestration.html)
- [AI 原生企业转型](../ch05/019-ai-native.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/lambda-microvms-vs-lambda-functions全方位深度对比.md)

---

