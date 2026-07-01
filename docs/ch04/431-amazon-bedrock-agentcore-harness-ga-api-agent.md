# Amazon Bedrock AgentCore Harness GA：两 API 调用生产级 Agent 基础设施

## Ch04.431 Amazon Bedrock AgentCore Harness GA：两 API 调用生产级 Agent 基础设施

> 📊 Level ⭐⭐ | 5.6KB | `entities/amazon-bedrock-agentcore-harness-ga.md`

# Amazon Bedrock AgentCore Harness GA

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

## 相关主题

- [Doris MCP on AgentCore](ch03/044-agent.md)
- [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)

---

