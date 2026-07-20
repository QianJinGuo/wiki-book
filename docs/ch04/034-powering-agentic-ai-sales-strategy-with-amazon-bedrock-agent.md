# Powering agentic AI sales strategy with Amazon Bedrock AgentCore

## Ch04.034 Powering agentic AI sales strategy with Amazon Bedrock AgentCore

> 📊 Level ⭐⭐ | 35.7KB | `entities/powering-agentic-ai-sales-strategy-with-amazon-bedrock-agent.md`

# Powering agentic AI sales strategy with Amazon Bedrock AgentCore
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/powering-agentic-ai-sales-strategy-with-amazon-bedrock-agentcore/
ingested: 2026-05-28
feed_name: AWS China ML
source_published: 2026-05-27T18:00:07Z
---

# Powering agentic AI sales strategy with Amazon Bedrock AgentCore

 

As agent adoption scaled, we saw a common pattern emerge across enterprises, including our own sales organization: specialized agents deliver value, but without orchestration, users carry the cognitive load of choosing between them. At AWS Sales, this meant more than 20 domain-specific agents deployed across the global organization, with representatives context-switching between systems instead of focusing on customer conversations. In this post, we show you how we built Field Advisor on [Amazon Bedrock AgentCore](https://aws.amazon.com/bedrock/agentcore) to solve this, the architecture decisions we made, and the measurable results that we’ve seen.

## **The challenge: Agent proliferation without orchestration**

AWS sales representatives faced a significant challenge as AWS scaled AI adoption. With more than 20 domain-specific agents handling customer relationship management (CRM) operations, meeting scheduling, customer insights, product recommendations, and compliance checks, representatives needed to know which agent to invoke for each task. They also had to manage context across fragmented conversations and manually combine outputs from different systems. This overhead consumed time that could be spent understanding customer needs and delivering solutions.

## **Why Bedrock AgentCore: Built for enterprise-scale orchestration**

The AWS Sales team chose Amazon Bedrock AgentCore because it provides the capabilities required for production agentic AI at scale:

*   Isolated execution environments for secure multi-tenant operations
*   Unified gateway for tool and agent access across AWS accounts
*   Persistent memory for session and long-term context
*   Consistent identity propagation with OAuth integration
*   Built-in observability across complex request flows
*   Integrated evaluation for continuous quality monitoring.

These capabilities removed the need for custom infrastructure, so that the engineering team could focus on domain intelligence that improves customer outcomes rather than building foundational services. Field Advisor addresses the orchestration challenge by serving as a central layer that routes requests to specialized agents while maintaining a single conversational interface. Sales reps ask questions in natural language, and Field Advisor routes requests to the right agent or tool, maintains conversation context across multiple interactions, coordinates approvals for sensitive operations, and delivers unified responses. This ultimately enables faster, more informed responses to global sales needs.

## **What Field Advisor enables for sales teams**

Field Advisor serves as an internal conversational assistant that addresses six key workflows for AWS sales teams, each designed to maximize time spent on customer-facing activities:

1.  **Multi-agent orchestration** removes the cognitive overhead of knowing which specialized agent handles compliance checks, product recommendations, or technical analysis. Sales reps interact with a single conversational interface while Field Advisor routes requests behind the scenes, so that they can focus on customer conversations rather than system navigation.
2.  **Embedded access** brings AI capabilities directly into the tools sales teams use daily. Field Advisor works inside CRM systems, Slack, and first-party applications, which removes workflow disruption and keeps reps focused on customer interactions.
3.  **Human-in-the-loop workflows** maintain control over critical business actions while accelerating routine tasks. When Field Advisor needs to update CRM data, it presents proposed changes and waits for explicit approval before making modifications. This helps maintain data accuracy, prevents unintended or harmful changes, and maintains accountability by keeping Sales reps in control of critical updates.
4.  **Context and memory** eliminate repetitive information gathering. Field Advisor remembers preferences and prior conversations using AgentCore Memory, which combines short-term session history with long-term semantic memory. Sales reps can pick up where they left off, spending less time on context-switching and more time on customer engagement.
5.  **Knowledge base retrieval** provides instant access to internal AWS knowledge bases for product documentation, competitive intelligence, pricing guidelines, and organizational insights without leaving the workflow or switching between multiple systems. This means customer questions get answered faster with more accurate information.
6.  **Proactive recommendations** complement conversational capabilities with push-based alerts through Slack. Sales reps receive AI-driven insights about customer service usage, business data trends, and CRM hygiene alerts. These insights enable proactive customer outreach rather than reactive responses.

![Field Advsor](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/14/ML-20754-image1.png)

Since launch, sales reps have submitted more than 120K prompts across all modalities, interactions that relieve the AWS Sales team to spend more time understanding customer needs rather than navigating internal systems. The human-in-the-loop component, which handles record creation and updates, saves large-scale sales representatives up to 2 hours per week, time redirected to customer conversations and strategic planning. The migration to Amazon Bedrock AgentCore delivered measurable improvements: 41 percent reduction in latency compared to the previous infrastructure, consolidation from seven separate AWS accounts to a single AgentCore Runtime, and the removal of custom-built systems for memory, observability, and authentication. The engineering team now focuses on product features that directly improve customer outcomes rather than infrastructure maintenance. Here’s what users say:

> _"Building the team's Agent on Bedrock AgentCore and integrating it into Field Advisor meant authentication, memory, conversation persistence, and rich UI components were all service capabilities rather than custom builds. With the agent embedded directly in CRM as a_ _right-side panel, the team skipped infrastructure work entirely and focused on the domain intelligence that helps sellers close deals—ultimately delivering faster, more accurate pricing to customers."_
> 
> _— AWS AI Builder team_
> 
> _"Field Advisor created CRM tasks from a meeting notes file with one-click approvals, then I asked about open opportunities from my customer without c__hanging systems. This saved me at least 15 minutes for one single customer—time I spent preparing a more comprehensive proposal that addressed their specific technical requirements."_
> 
> _— AWS Solutions Architect_
> 
> _"Field Advisor improved the account validation process at enterprise scale. The AWS Sales team needed to review nearly 450 accounts. In the past, this validation process involved extensive manual work and required correction of errors after bulk tagging or uploading. Field Advisor handled the validation_ _efficiently, reducing errors and saving time, allowing the team to focus on strategic account planning and customer engagement rather than data cleanup."_
> 
> _— AWS Customer Solutions Manager_

## **How Amazon Bedrock AgentCore provides the foundation**

Supporting thousands of AWS personnel across global sales teams demands a solution that handles complex multi-agent orchestration, secure access to internal systems, and predictable execution at high volume. Amazon Bedrock AgentCore provides an isolated execution environment for agents, a unified gateway for tool and agent access, persistent memory for session and long-term context, consistent identity propagation, built-in observability across request flows, and integrated evaluation for continuous quality monitoring.

When a sales rep asks a question through the supported channels (CRM system, Slack, or standalone web portal), the request passes through an authentication service that verifies identity and issues an OAuth token. AgentCore Runtime receives the authenticated request, initializes a supervisor agent built with the Strands Agents, and manages the full execution lifecycle.

The supervisor agent analyzes the query and determines how to handle it. It can invoke local tools for CRM lookups and knowledge base retrieval, call remote MCP tools for systems integrated through MCP, or delegate to specialized domain agents running in separate AgentCore Runtimes. AgentCore Identity propagates the authenticated identity to every downstream tool and agent. Results are synthesized into a unified response streamed back through AgentCore Runtime's native streaming support.

![Architecture](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/14/ML-20754-image2.png)

### **Key architecture components**

The architecture uses several Amazon Bedrock AgentCore offerings that work together to deliver Field Advisor's capabilities:

*   **AgentCore Runtime** hosts the supervisor agent in a secure, isolated MicroVM environment. Each user session runs in its own execution context. The runtime manages model access, guardrails, and the agent lifecycle, including streaming responses back to users.
*   **Strands Agents** powers the reasoning loop inside the runtime. It handles the orchestration cycle: receiving model responses, dispatching tool calls (in parallel when possible), managing conversation context, and coordinating multi-agent flows. The extensible hook system in Strands Agents allows customization of agent behavior such as error handling, authorization checks, and response processing without modifying the core reasoning loop.
*   **AgentCore Memory** stores both short-term conversation history and long-term user context. The implementation uses a custom session manager that extends the Strands Agents AgentCoreMemorySessionManager to optimize write patterns. It syncs state after each invocation rather than after every message, which reduces API calls without sacrificing durability.
*   **AgentCore Identity** handles identity propagation across the solution. Sales reps authenticate once using OAuth, and the token propagates through the system. For cross-account agent invocations, the system supports OAuth through machine-to-machine token exchange through AgentCore Identity's resource credential provider.
*   **AgentCore Gateway** provides a centralized access point for remote MCP tools. Rather than managing individual connections to each MCP server, tools are registered with a single Gateway instance that handles authentication and availability. On startup, the supervisor fetches tool definitions from the Gateway and creates corresponding local Strands tools, so new MCP tools can be onboarded without changes to the runtime deployment.
*   **AgentCore Observability** captures traces, logs, and metrics for every execution. Strands integrates natively with OpenTelemetry, which provides distributed tracing across multi-agent and multi-tool flows. This is critical for debugging when a single user question can fan out to several remote agents and MCP tools in parallel.
*   **AgentCore Evaluations** supports continuous quality monitoring of agent behavior in production. AWS uses evaluation data captured through AgentCore Observability traces to measure answer relevance, context precision, action correctness, and faithfulness. This provides a feedback loop that helps identify regressions and improve orchestration quality over time.

### **Core architectural capabilities**

Field Advisor's architecture is built on the AgentCore components described earlier as a set of interlocking capabilities that work together to deliver reliable, secure and scalable multi-agent orchestration. The following sections walk through how the team implemented each one.

### **Orchestration and model configuration**

The supervisor agent is a Strands Agent initialized with a system prompt, a set of tools, a session manager, a conversation manager, and a model provider. The implementation uses the latest Anthropic Claude model available on Amazon Bedrock as the foundation model (FM), accessed through the Amazon Bedrock cross-Region inference profile for higher throughput.

To reduce latency on multi-turn conversations, the team built a custom PromptCachingBedrockModel that extends Strands' BedrockModel to add incremental [prompt caching](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html). Before each model call, the implementation removes any previous cache points from the conversation history and adds a fresh one to the latest message. This way, everything up to the most recent turn is cached, and the model only processes new content on each turn.

```
CACHE_POINT = {"cachePoint": {"type": "default", "ttl": "1h"}}

class PromptCachingBedrockModel(BedrockModel):
    """Add a rolling cache point to the latest message so the model reuses
    cached prefixes instead of re-processing the full history."""

    def _format_request(self, messages, **kwargs):
        # Remove stale cache points from older messages
        for msg in messages:
            msg["content"] = [
                b for b in msg["content"] if "cachePoint" not in b
            ]
        # Add a cache point to the latest message
        messages[-1]["content"].append(CACHE_POINT)
        return super()._format_request(messages=messages, **kwargs)
```

Because Amazon Bedrock limits the number of cache points per request and requires non-decreasing TTL values across the request (tools, system prompt, then messages), the implementation manages cache point placement carefully. The result is that each new user turn extends the cached prefix incrementally rather than reprocessing the full conversation.

The Strands Agents [hook](https://strandsagents.com/docs/user-guide/concepts/agents/hooks/) system is central to how agent behavior is customized without modifying the core reasoning loop. Hooks are registered for error circuit breaking, which automatically skips tools that fail repeatedly within a single invocation. Contingent authorization intercepts tool calls that access sensitive CRM data, pauses execution using Strands Interrupts to request user consent, and only proceeds after approval. Write confirmation for tools that mutate data presents the proposed changes and requires explicit approval before execution. Citation extraction processes knowledge base retrieval results to extract source references and attach them to the final response. Tool call streaming streams tool invocation status to the front end so users see real-time progress as the agent works.

This hook-based approach means cross-cutting concerns like authorization and error handling are decoupled from tool implementations. Teams that own remote agents don't need to implement circuit breaking or streaming. The supervisor handles it uniformly. For builders designing similar systems, hooks are a natural extension point that avoids the complexity of middleware chains or decorator stacks.

### **Multi-agent coordination**

Field Advisor follows a supervisor-subagent pattern. The supervisor agent acts as the primary orchestrator, and specialized domain agents for compliance, product recommendations, meeting scheduling, and more are integrated as tools. Each remote agent is defined with a name, description, and a single query parameter. When the supervisor determines a question should be handled by a domain agent, it invokes the corresponding tool. The wrapper handles the full invocation lifecycle: constructing the payload, authenticating through OAuth, sending the request to the remote AgentCore Runtime, and streaming back the response.

```
def create_remote_agent_tool(config: RemoteAgentConfig) -> AgentTool:
    """Create a Strands tool that wraps a remote agent."""

    async def remote_agent_tool(query: str, tool_context: ToolContext):
        invoker = RemoteAgentInvoker(config)
        params = InvocationParams(
            query=query, session_id=session_id, alias=alias, ...
        )
        async for event in invoker.stream(params):
            if is_final_response(event):
                payload = parse_response_payload(event)
                # Surface any interrupts from the remote agent
                if payload.interrupts:
                    tool_context.interrupt(payload.interrupts)
                yield payload.response
            else:
                yield event  # stream tool-call progress to the UI

    return tool(context=True)(remote_agent_tool)
```

The supervisor sees a flat tool catalog and the Strands reasoning loop handles the rest. This means adding a new agent requires only a configuration entry—no changes to the orchestration logic.Field Advisor also supports a pass-through mode, where sales reps explicitly select a specific agent to handle their request. In this mode, the request bypasses the supervisor entirely. The runtime forwards the query directly to the target remote agent and streams its response back, preserving the sub-agent's formatting and citations. Users can switch between the supervisor and pass-through mode within the same conversation.

### **Human-in-the-loop workflows**

The implementation uses the native [Interrupt](https://strandsagents.com/docs/user-guide/concepts/interrupts/) feature in Strands Agents to support workflows that require explicit user confirmation. When a tool or remote agent needs user input (for example, acknowledging a data access agreement before querying CRM records), execution pauses and the interrupt is returned to the client. The user responds through Slack or the CRM interface, and the agent resumes with their input.

This pattern was extended to work across agent boundaries. When a remote agent returns an interrupt in its response payload, the local tool wrapper detects it and raises a Strands Interrupt on behalf of the remote agent. This means each agent in the solution can request user input, regardless of where it runs, and users interact through a single consistent interface. This design was a deliberate choice over building a separate human-in-the-loop service with message queues and polling. Because Strands Interrupts persist state in the session manager, the pattern is purely code-based—no additional infrastructure components are needed. The key insight is that the local tool wrapper acts as a bridge: it translates the remote agent's interrupt response into a native Strands Interrupt, so the framework handles all the pause/resume mechanics.

### **Memory and context management**

AgentCore Memory provides both short-term and long-term persistence. Short-term memory maintains the full conversation history within a session. Long-term memory uses a semantic strategy to store summaries and important facts across sessions, so the agent remembers user preferences and prior interactions even in new conversations.

For context management, the implementation uses the Strands Agents [SummarizingConversationManager](https://strandsagents.com/docs/user-guide/concepts/agents/conversation-management/#summarizingconversationmanager) to handle conversations that approach the model's token context window. Older messages are summarized to open up context space while preserving key information. Token limits are also enforced on user input and large tool responses are truncated before passing them back to the model, preventing context overflow from a single source.

### **File upload**

Sales reps can upload documents and images directly within conversations. Strands accepts file bytes as ContentBlock inputs, supporting text formats and images. When a file is uploaded, its content becomes part of the conversation history and is available to the agent for analysis, summarization, or answering follow-up questions. For unsupported file types such as JSON, the system extracts the text content and prepends it to the user message. This improves upon the previous solution, which was limited to five files per chat with a combined 10 MB size limit.

### **Unified tool integration through MCP**

Field Advisor supports three categories of tools through a unified interface. Local tools run directly inside the AgentCore Runtime for CRM queries, knowledge base retrieval, and data lookups. Remote MCP tools connect to external systems via the Model Context Protocol. On startup, the runtime establishes connections to registered MCP servers through AgentCore Gateway, fetches their tool definitions, and creates corresponding local Strands tools. More than 20 MCP tools have been onboarded this way, each integrated in minutes rather than days. The onboarding process is straightforward: register the MCP configuration in the Registry service, and the supervisor automatically discovers it on the next startup; no code changes, no redeployment of the runtime. Remote agents in other AgentCore Runtimes are wrapped as tools with the same interface, making the distinction between a tool and an agent transparent to the model.This unified approach means adding a new capability (whether it's a local function, an MCP server, or a full agent) requires no changes to the orchestration logic. The supervisor sees a flat tool catalog and the Strands reasoning loop handles the rest.

### **Observability and evaluation**

Strands integrates natively with OpenTelemetry. AgentCore Observability captures the resulting traces, logs, and metrics. Every agent invocation, tool call, and model interaction is traced end-to-end, including calls that fan out to remote agents in other accounts. This data is used for both operational monitoring and continuous evaluation through AgentCore Evaluations.The team runs both online evaluation against live production traffic and offline evaluation against curated test sets. The built-in evaluators in Amazon Bedrock AgentCore continuously measure agent quality and catch regressions before they impact users. For builders starting with agent evaluation, AWS recommends beginning with online evaluation against production traffic rather than building curated test sets first. Real user queries surface edge cases that synthetic tests miss, and the built-in evaluators in AgentCore Evaluations provide a useful baseline without custom metric development.

### **Security and compliance**

Security is layered across the solution. AgentCore Runtime's MicroVM isolation provides each user session with its own secure execution context. Amazon Bedrock Guardrails filter both user inputs and model responses to block harmful or out-of-scope content. AgentCore Identity propagates authenticated user identity to every downstream system. Tools and remote agents enforce access controls consistently, including contingent authorization checks that require explicit user consent before accessing sensitive CRM data.

## **Conclusion**

This post showed how AWS Sales evolved Field Advisor from a standalone conversational assistant into a comprehensive AI agentic orchestration solution powered by Amazon Bedrock AgentCore. By using the composable services in Amazon Bedrock AgentCore (Runtime, Gateway, Memory, Identity, and Observability) paired with the Strands Agents, we achieved measurable improvements that directly impact the global sales organization, and ultimately, the customers they serve. Sales reps spend less time navigating systems and more time understanding customer needs, delivering faster and more informed responses. To learn how AI can transform your sales function, contact your AWS account team. They can discuss how services such as Amazon Bedrock AgentCore can help you build similar solutions for your organization.

To learn more about Amazon Bedrock AgentCore, visit the Amazon [Bedrock documentation](https://docs.aws.amazon.com/bedrock-agentcore/). For teams looking to build similar multi-agent orchestration solutions, AWS recommends starting with a single supervisor agent on AgentCore Runtime, adding tools incrementally through AgentCore Gateway, and using Strands hooks to layer in cross-cutting concerns like authorization and error handling. This incremental approach lets you validate each component in production before adding complexity

**Related posts:**

*   [Amazon Bedrock AgentCore developer guide](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html)
*   [Introducing Strands Agents, an open source AI agents SDK](https://aws.amazon.com/blogs/opensource/introducing-strands-agents-an-open-source-ai-agents-sdk/)
*   [Make agents a reality with Amazon Bedrock AgentCore: Now generally available](https://aws.amazon.com/blogs/machine-learning/amazon-bedrock-agentcore-is-now-generally-available/)
*   [Multi-agent collaboration patterns with Strands Agents and Amazon Nova](https://aws.amazon.com/blogs/machine-learning/multi-agent-collaboration-patterns-with-strands-agents-and-amazon-nova/)
*   [Customize agent workflows with advanced orchestration techniques using Strands Agents](https://aws.amazon.com/blogs/machine-learning/customize-agent-workflows-with-advanced-orchestration-techniques-using-strands-agents/)
*   [Unlocking the power of Model Context Protocol (MCP) on AWS](https://aws.amazon.com/blogs/machine-learning/unlocking-the-power-of-model-context-protocol-mcp-on-aws/)

### Acknowledgements

Special thanks to everyone who contributed to this launch:

*   **Development Team**: Ajeeth Kannan, Anughna Kommalapati, Sailaja Narra, Mitali Ochani, William Parr, Larry Peng, Sreekanth Radhakrishnan, Sumel Rattan, Nihar Samal, Arianne Silvestre, Shubhpreet Singh, Eric Stanulis, Tommy Stevenson, Tony Zhao, and Xiaodan Zhao
*   **Program Management**: Christal Zhu and Jennifer Tsui
*   **UX**: Rachael Dickens, Sarah Lips, and Kish Parikh
*   **BIE**: Fabien Lescot
*   **AWS leadership**: Jonathan Garcia, Krishna Velaga, and Mike Shim

* * *

## About the authors

## 深度分析

### 1. 从定制基础设施到平台服务的范式转移

Field Advisor 的演进揭示了企业 AI 落地中一个核心矛盾：早期 Agent 部署依赖大量定制系统（内存管理、认证、观测），这些系统虽然解决了具体问题，但彼此孤立、难以维护，最终成为新功能开发的阻力而非助力。Amazon Bedrock AgentCore 将这些横切关注点抽象为平台服务，使得工程团队得以从基础设施维护转向领域知识构建——这是一个关于"AI 原生架构"的务实答案：不是用 AI 改造业务流程，而是用平台能力消除 AI 落地的基础设施税。

### 2. Supervisor 模式对认知负载管理的启示

超过 20 个领域专用 Agent 带来的核心问题是用户需要做"系统导航"决策。Field Advisor 的 Supervisor 模式将这个决策负担回收到 AI 层——用户只需表达意图，Supervisor 分析并路由。这一设计选择体现了 [Agent Orchestration Patterns](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-orchestration-patterns.md) 中的核心原则：编排层不应暴露给用户，多 Agent 协作应对用户透明。Pass-through 模式作为补充，允许高级用户在明确场景下绕过 Supervisor 直接调用特定 Agent，这两种模式的共存反映了企业 AI 系统设计中"默认智能路由、保留专家控制"的有效实践。

### 3. 中断机制作为跨边界协同的统一协议

Strands Interrupt 的设计值得特别关注：它不仅处理工具调用中的用户确认，更被扩展为跨 Agent 边界的状态同步机制。当远程 Agent 产生中断时，本地工具包装器将其翻译为原生 Strands Interrupt，使跨 MicroVM 的暂停/恢复成为框架原生能力而非自定义基础设施。这一设计避免了在 [Long-Running Agent Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/long-running-agent-architecture.md) 中常见的"构建独立 HITL 服务 + 消息队列 + 轮询"的过度工程化路径，体现了用框架原生能力解决问题的工程哲学。

### 4. Prompt Caching 作为多轮对话延迟优化的工程现实

自定义 PromptCachingBedrockModel 的实现揭示了生产环境中一个常被忽视的问题：模型供应商的缓存机制有严格的 TTL 和数量限制，而多轮对话的自然结构（system prompt → tools → history → new message）与这些限制并不对齐。Field Advisor 团队通过"滚动缓存点"策略——每轮移除旧缓存点、在最新消息设置新缓存点——实现增量计算，这一工程技巧在 [Inference Optimization](https://github.com/QianJinGuo/wiki/blob/main/concepts/inference-optimization.md) 语境下具有普遍参考价值。41% 延迟降低的数字也证明了这类底层优化对用户体验的直接贡献。

### 5. MCP 作为 Agent 工具生态的标准化路径

Field Advisor 在数分钟内接入超过 20 个 MCP 工具的能力，验证了 [Model Context Protocol](https://github.com/QianJinGuo/wiki/blob/main/concepts/model-context-protocol-mcp.md) 作为工具集成协议的企业价值。AgentCore Gateway 作为 MCP 工具的单一注册中心，使新工具接入无需修改运行时部署——这与传统的点对点工具集成方式形成鲜明对比。值得注意的是，Remote Agent 与 MCP Tool 使用完全相同的接口包装，这意味着"MCP 生态"和"Remote Agent 生态"在 Supervisor 看来没有本质区别，统一了 [Multi-Agent Collaboration Patterns](https://github.com/QianJinGuo/wiki/blob/main/concepts/multi-agent-collaboration-patterns.md) 中的工具/代理边界。

## 实践启示

### 1. 优先评估平台成熟度，而非功能集合

在企业 AI 落地中，团队常陷入"自建还是购买"的二元思维。Field Advisor 的案例表明，真正值得评估的不是某平台有多少功能，而是横切关注点（安全、观测、身份、内存）是否已被平台解决到生产级别。七个独立 AWS 账户 consolidation 到单一 AgentCore Runtime 的收益——包括 41% 延迟降低——正是平台整合后基础设施协同效应的直接体现。[Enterprise AI Adoption](https://github.com/QianJinGuo/wiki/blob/main/concepts/enterprise-ai-adoption.md) 决策者应将"基础设施税削减"作为平台选型的核心评估维度。

### 2. 从单一 Supervisor 开始，工具增量接入

AWS 推荐的方法论值得借鉴：不要试图一开始就设计完整的 Agent 拓扑。从单一 Supervisor Agent 开始，通过 AgentCore Gateway 逐步添加工具，每个组件在生产环境验证后再扩展。这种增量方式的价值在于：每个新工具的引入都能在真实流量下验证其与现有工具的交互质量，而非在测试环境中假设协同效果。

### 3. 用 Hook 机制处理横切关注点，而非装饰器或中间件

Strands Hook 系统提供了一个重要设计原则：横切行为（错误熔断、写确认、引用提取）应通过扩展点注入，而非修改核心推理循环。这与 [Agent Memory Lifecycle](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-lifecycle-philosophies.md) 中"模块化而非单体"的设计哲学一致。对于构建类似系统的团队，Hooks 天然是可组合的扩展点，避免了中间件链或装饰器栈的复杂度累积。

### 4. 生产流量在线评估优于离线测试集

AWS 明确建议从生产流量在线评估开始，而非先构建离线测试集。这一原则反直觉但重要：真实用户查询会暴露合成测试遗漏的边界情况，且 AgentCore Evaluations 的内置评估器提供了无需自定义指标开发的基线。对于在 [Production Agent Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/production-agent-engineering.md) 早期阶段的团队，这意味着评估基础设施应与 Agent 同步建设，而非作为后期补充。

### 5. Human-in-the-Loop 应基于框架原生能力，而非独立服务

构建跨 Agent 边界的 HITL 工作流时，Field Advisor 选择了纯粹基于 Strands Interrupt 的代码方案，而非独立服务+消息队列+轮询。这一决策的依据是：框架原生能力已足够，且状态持久化由 Session Manager 管理。对于企业 AI 系统，这意味着 HITL 的核心是"状态暂停/恢复"的语义，而非基础设施组件。团队应优先探索框架边界能力，而非默认构建独立服务。

## 相关实体
- [飞来汇借助 Aws Security Agent 构建跨境支付应用的智能安全防线](ch04/289-aws-security-agent.html)
- [How Aws Smgs Uses An Ai Powered Conversational Assistant To ](../ch05/088-ai.html)
- [滴滴国际化客服质检智能化之路基于 Amazon Bedrock 的多语种多业务线质检实践](../ch11/157-amazon-bedrock.html)
- [Data For Ai明其所耗知其所因让每一分 Token 消耗都可量化的全栈实践](../ch12/003-token.html)
- [Automate Aml Alert Triage With Amazon Quick And Snowflake Co](../ch11/214-amazon-quick.html)

---

