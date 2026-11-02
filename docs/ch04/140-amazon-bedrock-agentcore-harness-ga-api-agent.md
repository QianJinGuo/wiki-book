# Amazon Bedrock AgentCore Harness GA：两 API 调用生产级 Agent 基础设施

> 📊 Level ⭐⭐⭐ | 10.2KB

## Amazon Bedrock AgentCore Harness GA

> **Background**：本文基于 AWS 官方博客 2026-06-18 发布的 AgentCore harness GA 公告，系统分析其 Harness 架构设计、API 表面、工具集成模式、Memory 管理、Skills 体系和生产环境基础设施。

## 核心设计：两个 API 调用覆盖全部 Agent 基础设施

AgentCore harness 的核心主张是：**生产级 Agent 不需要编排代码，只需要配置**。两个 API 调用即可完成：

- `CreateHarness`：定义 Agent（模型、工具、Skills、Memory、指令）
- `InvokeHarness`：运行 Agent（传入消息，流式返回结果）

Agent 运行在独立的 microVM 环境中，自带文件系统和 shell，可读写文件、执行命令。Memory 跨会话持久化，支持用户和对话记忆。每次执行自动追踪到 CloudWatch。

## 模型切换：mid-session provider 无感切换

支持四种模型后端，且可在同一会话中无缝切换而不丢失上下文：

| Provider | 配置字段 | 支持模型 |
|----------|---------|---------|
| Amazon Bedrock | `bedrock` | Claude, Nova, Llama, DeepSeek, Qwen, Kimi, MiniMax, Cohere, Mistral, GPT-5.5/5.4 |
| OpenAI 直连 | `openAi` | api.openai.com 全系列 |
| Google Gemini | `gemini` | Gemini 系列 |
| LiteLLM | `liteLlm` | Anthropic 直连、Cohere、Mistral、Vertex、Azure OpenAI 等 |

典型用例：Claude Opus 规划 → GPT-5.5 写代码 → Gemini 总结，上下文连续不中断。API key 存储在 AgentCore Identity token vault 中，Agent 永远不接触原始凭证。

## 工具集成：声明式 tools 配置

工具通过 `CreateHarness` 的 `tools` 数组声明式配置，harness 处理连接、认证和执行：

- `agentcore_gateway`：通过 ARN 引用 Gateway，暴露 OpenAPI/Smithy/Lambda/MCP 目标，IAM/JWT 认证 + per-tool 授权
- `remote_mcp`：直接连接任意 MCP server URL
- `agentcore_browser`：一行配置获得完整浏览器沙箱（点击、输入、导航、截图）
- `agentcore_code_interpreter`：沙箱化 Python/Node 执行
- `inline_function`：human-in-the-loop 审批或自定义工具

每个会话内置 shell 和 `file_operations`，无需声明。`InvokeHarness` 支持 per-call 工具覆盖（`allowed_tools` 参数）。

## Memory：三模式可选

GA 版本的 Memory 管理提供三种模式：

1. **自动托管**（默认）：省略 memory 配置即自动创建，SEMANTIC + SUMMARIZATION 策略，30 天事件过期，AWS 加密，多租户 namespace 隔离
2. **BYO**：传入已有 AgentCore Memory ARN
3. **禁用**：`memory: { disabled: {} }`

托管 Memory 是真实的 AWS 资源，可查询、审计、附加到其他 Agent、交给分析管道。删除 harness 时默认级联删除（`deleteManagedMemory: false` 可保留）。

## Skills：四种来源的 Agent 专业知识

HarnessSkill 是 union 类型，支持四种 skill 来源：

1. `awsSkills`：AWS 策划的 skill bundle（SDK、IaC、IAM、CloudWatch、Bedrock 等），零配置启用
2. `git`：从 Git 仓库 clone，支持 commit/branch pin
3. `s3`：从 S3 bucket 拉取
4. `path`：引用容器内已有路径

Skills 元数据在会话启动时加载，完整内容仅在任务实际需要时才注入上下文。`InvokeHarness` 支持 per-call 覆盖。

## 环境与文件系统

两种扩展维度：

- **容器镜像**：自定义 ECR 镜像覆盖默认 Python+bash 环境。`InvokeAgentRuntimeCommand` API 可直接在 microVM 中执行 shell 命令（不经过模型、不消耗 token）
- **文件系统**：三种存储类型

| 类型 | 托管 | VPC | 持久性 |
|------|------|-----|--------|
| Managed session storage | Yes | No | 同一 runtimeSessionId 跨 stop/resume |
| EFS | No | Yes | 永久 |
| FSx | No | Yes | 永久 + 高性能 |

## 与现有 wiki 实体的差异化

与 `aws-bedrock-agentcore-doris-mcp-server` 的对比：

| 维度 | Doris MCP on AgentCore | AgentCore Harness GA |
|------|----------------------|---------------------|
| 焦点 | 单一 use case（Doris SQL 分析） | 完整 harness 基础设施 |
| 深度 | VPC + Cognito OAuth + 按需付费 | 六大原语 + 四种模型后端 + 四种工具类型 |
| 覆盖范围 | Runtime 部署模式 | 全生命周期（创建→运行→Memory→Skills→环境） |
| 时间 | 2026-05（preview） | 2026-06-18（GA） |

AgentCore Harness GA 是平台级公告，Doris MCP 是具体应用案例。两者互补而非重叠。

## 深度分析

### 抽象层定位：harness 的赌注是"接线"而非"智能"

GA 公告最有信息量的判断藏在开篇：Agent loop 从来不是难点（一年前 Simon Willison 的定义至今够用），难点是 loop 周围的一切——沙箱、存储、secrets、网络、Memory 归属、可观测性。harness 的产品赌注因此不是"更聪明的编排"，而是把 AgentCore 六大原语的接线工作从每次新用例的重复劳动降级为配置项。这与 [harness 作为产品表面](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-as-product-surface.md) 的判断一致：当基础设施可配置化，团队的迭代瓶颈就从工程迁移到决策。

### 模型可移植性是架构约束，不是功能列表

mid-session 无感切换四种 provider，表面是便利功能，实质上约束了整个 harness 的内部架构：会话上下文必须与 provider 的对话格式解耦并独立序列化，否则切换即断代。值得注意的配套设计是凭证隔离——provider API key 全部收进 AgentCore Identity 的 token vault，Agent 进程永远见不到原始凭证（参见 [Aws Bedrock Agentcore Identity Security](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-bedrock-agentcore-identity-security.md)）。这意味着"用哪个模型"从架构决策降格为运营决策：做价格对比测试、逃离回归版本、规划-执行分模型，都不再触发重写。

### GA 相对 preview 的实质变化：从"能用"到"有运营闭环"

preview 时期的 harness 只解决"定义和运行"；GA 补齐的是运营闭环。最典型的证据是 Memory：preview 需要单独预配 Memory 资源再传 ARN（"多一次 API 调用、容易在上生产路上忘掉"），GA 改为缺省自动托管且可一键切换 BYO——细节是托管 Memory 并非黑盒状态，而是账户里可查询、可审计、可挂到其他 Agent 的真实 AWS 资源。再加上统一可观测性面板（一条 invocation 跨 runtime/memory/gateway/工具，过去要开五个 tab 拼图）、Evaluations 打分、optimization 基于分数生成 prompt/工具描述建议并用 Gateway 做 A/B 流量验证（呼应 [Eval Optimizer Firewall](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/eval-optimizer-firewall.md)）、immutable version + 端点回滚——公告把问题从"does it work"正式推进到"is it improving"。

### Export to code：对锁定效应的结构性回答

配置化平台最常见的质疑是锁定。GA 的答案是 `agentcore export harness`：一条命令把 harness 导出为 Strands 代码，模型、prompt、工具、Memory 接线、skills、容器环境全部保留，计算路径与可观测性不变。公告自己强调的措辞很准确——"这是 config-to-code 翻译，不是架构切换"。Claude Agent SDK 作为第二个导出目标在路上。结合 `InvokeAgentRuntimeCommand`（不经模型、不耗 token 的确定性 shell 通道），harness 实际上给了两条逃生通道：确定性操作下沉到 shell API，复杂编排整体迁出为代码。托管 Memory 默认级联删除、`deleteManagedMemory: false` 可保留的设计，则体现了类似的"资源归用户"取向。

### 定价模型透露的产品哲学

无 harness 附加费，全部按底层能力实际消费计费：Runtime 按 vCPU/GB 小时的 active-consumption（模型和工具 I/O 等待期不计费）、Gateway 按千次调用、Memory 按千次事件/检索。这个模型与 [Agent Memory 架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-architecture.md) 中"Memory 是可计价的独立资源层"的判断互相印证——harness 不打包溢价，意味着它卖的是集成而不是资源本身。对使用者的推论是：成本优化点回到了单原语层面（比如用 `InvokeAgentRuntimeCommand` 替代让模型"想"一遍 git 操作），而非寻找 harness 之外的替代品。

## 相关主题

- [Doris MCP on AgentCore](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-bedrock-agentcore-doris-mcp-server.md)
- [Harness Engineering 框架](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

