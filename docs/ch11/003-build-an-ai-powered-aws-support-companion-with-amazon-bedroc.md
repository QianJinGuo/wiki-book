# Build an AI-powered AWS support companion with Amazon Bedrock AgentCore

> 📊 Level ⭐⭐ | 10.1KB

→ [原文存档](https://aws.amazon.com/blogs/machine-learning/build-an-ai-powered-aws-support-companion-with-amazon-bedrock-agentcore)

## Build an AI-powered AWS support companion with Amazon Bedrock AgentCore

Managing AWS infrastructure often means switching between consoles, searching documentation, and manually creating support cases. For each incident, an engineer opens the AWS Management Console, checks Amazon CloudWatch, searches AWS documentation, reviews community posts, and files a support case. This context-switching adds up to 30–45 minutes per investigation before resolution work begins.

In this post, you build an AWS Support Companion using Amazon Bedrock AgentCore. The agent uses Strands Agents as the orchestration framework and connects to AWS services through the Model Context Protocol (MCP). By the end, you have a working agent that can analyze CloudWatch logs, search AWS documentation, query community knowledge from AWS re:Post, and create support cases, all from a single conversational interface. The solution deploys with a single script using AWS CloudFormation and includes a web frontend built on AWS Amplify for interacting with the agent.

## The incident investigation bottleneck

AWS support and operations teams follow a repetitive pattern for every incident:

  1. Open the AWS Management Console and navigate to the affected service.
  2. Check CloudWatch logs and metrics for error patterns.
  3. Search AWS documentation for relevant troubleshooting guidance.
  4. Review community posts on AWS re:Post for similar issues.
  5. Compile findings and create a support case with the appropriate severity.
  6. Attach evidence and context to the case.

Each step requires a different tool and interface. Manual investigation limits the speed at which teams can respond, and the context gathered in one tool does not carry over to the next.

## Solution overview

The solution consolidates these steps into a single conversational agent deployed on Amazon Bedrock AgentCore. AgentCore handles the operational complexity of running a production AI agent (session isolation, auto scaling, security, and observability), so you focus on what the agent does rather than how it runs.

The agent connects to the following components:

**Agent runtime –** A Python application using Strands Agents, packaged as a Docker container and deployed to AgentCore Runtime. The agent orchestrates calls to a foundation model (FM) (Amazon Nova Pro through Amazon Bedrock) and tools based on your input. You can swap to supported models without changing the agent code.

**MCP servers –**  Three MCP servers give the agent access to AWS documentation (`aws-documentation-mcp-server`), AWS Support APIs (`aws-support-mcp-server`), and AWS service APIs (`aws

---
## 深度分析

### 排障瓶颈的本质：上下文切换税而非推理能力缺口

文章把痛点量化为每次调查前损失 30–45 分钟，但六步循环的真正成本不在任何单一步骤，而在"一个工具里收集的上下文无法带入下一个工具"。工程师的推理能力不是瓶颈，瓶颈是四类信息平面——日志指标、官方文档、社区经验、工单系统——各自为政。因此 AWS Support Companion 的价值主张不是"更聪明的模型"，而是把四个平面聚合进单一会话接口；这与 harness 工程的核心命题一致：agent 产出质量取决于工具与上下文的组织方式，而非模型本身。AgentCore 把会话隔离、自动扩缩、安全与可观测性从应用代码中剥离，构建者只描述 agent 做什么——这正是 AgentCore 托管 Harness 与自建 harness 的分界线。

### MCP 工具平面：三服务器分工与并行初始化

三个 MCP 服务器按信息源分工：文档服务器、Support API 服务器、服务 API 服务器。分工的意义在权限与生命周期可独立管理——文档查询只读公开资料，Support API 则绑定付费支持计划，Business/Enterprise On-Ramp/Enterprise 级别才可用。工程上最值得抄的是并行初始化：串行加载三个 MCP 服务器会明显拖慢冷启动，该 agent 用 asyncio.gather 同时初始化三个客户端并注册工具，配合 return_exceptions 让部分失败不阻塞启动。对生产 agent 而言，工具平面的启动延迟是用户可感知的第一体验，此模式可平移到任何多 MCP 服务器架构（协议细节见 [MCP](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-context-protocol-mcp.md)，工具组织见 [工具使用模式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/tool-use-patterns-ai-agents.md)）。

### 生产化的三个"隐形工程点"

文章最有复用价值的部分是三个不起眼却决定成败的细节。其一，记忆的优雅降级：每请求只取最近三轮对话、2 秒超时、超时则不带上下文继续执行、响应后异步写回，并按会话 ID 隔离——宁可丢失上下文也不阻塞响应，是"可用性优先于记忆完备性"的取舍（对照 [Agent 记忆架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-architecture.md) 与 [AgentCore Memory 生命周期策略](https://github.com/QianJinGuo/wiki-public/blob/main/entities/designing-lifecycle-policies-for-agentcore-memory.md)）。其二，网关令牌自刷新：Cognito JWT 存于 Secrets Manager，每次网关调用前校验过期时间，距过期不足 5 分钟即自动刷新，否则一小时令牌周期内调用会间歇性失败。其三，部署脚本内嵌预检：CloudTrail 激活检查、模板校验、临时角色凭证检查，把安全验证左移到部署期。三者均不涉及模型能力，却共同构成 demo 与生产的分水岭。

### 安全纵深：从密码策略到凭证脱敏的五层结构

默认安全配置呈纵深层次：Cognito 密码策略对齐 NIST SP 800-63B，WAF 限速加托管规则保护 API Gateway（参见 [WAF 加固 AgentCore Runtime](https://github.com/QianJinGuo/wiki-public/blob/main/entities/securing-amazon-bedrock-agentcore-runtime-with-aws-waf.md)），每个组件独立最小权限 IAM 角色，invoker Lambda 在返回用户前对响应做凭证模式脱敏。Guardrails 层再叠加：有害内容过滤、提示注入防护设为 HIGH、PII 脱敏覆盖 AWS 密钥/信用卡/SSN、话题限定为 AWS 支持领域，API 访问日志保留 90 天并由 CloudTrail 记录。值得注意的是凭证脱敏放在 invoker Lambda 而非只依赖 Guardrails——同一目标设两条独立防线，是纵深防御在 agent 架构里的具体化（背景见 [AI 安全](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/ai-safety.md)）。

**落地启示**

1. 排障类 agent 的第一价值是聚合信息平面、消除上下文切换，模型选型反而是其次。
2. Support MCP 绑定付费支持计划，落地前先确认账号的支持计划等级。
3. 多 MCP 服务器一律并行初始化，冷启动延迟是工具平面最先暴露的体验问题。
4. 会话记忆设计成"限时取、超时跳、异步写"，可用性优先于记忆完备性。
5. 网关令牌生命周期要主动管理，预刷新窗口应成为网关集成的标准配置。
6. 自建 agent 与 AWS DevOps Agent 的取舍是控制权换托管度：需要自定义工具、模型、护栏与工作流时自建，否则用托管服务。
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关: Agent 架构

---

