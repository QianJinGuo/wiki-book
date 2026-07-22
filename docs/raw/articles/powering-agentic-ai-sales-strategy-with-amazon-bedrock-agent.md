---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/powering-agentic-ai-sales-strategy-with-amazon-bedrock-agentcore/
ingested: 2026-05-28
feed_name: AWS China ML
source_published: 2026-05-27T18:00:07Z
sha256: 0f7ec9dc1ae56412539a2d7e3980b41287a234cd48886b0481b2b8250f490d4e
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

> _“Building the team’s Agent on Bedrock AgentCore and integrating it into Field Advisor meant authentication, memory, conversation persistence, and rich UI components were all service capabilities rather than custom builds. With the agent embedded directly in CRM as a_ _right-side panel, the team skipped infrastructure work entirely and focused on the domain intelligence that helps sellers close deals—ultimately delivering faster, more accurate pricing to customers.”_
> 
> _— AWS AI Builder team_
> 
> _“Field Advisor created CRM tasks from a meeting notes file with one-click approvals, then I asked about open opportunities from my customer without c__hanging systems. This saved me at least 15 minutes for one single customer—time I spent preparing a more comprehensive proposal that addressed their specific technical requirements.”_
> 
> _— AWS Solutions Architect_
> 
> _“Field Advisor improved the account validation process at enterprise scale. The AWS Sales team needed to review nearly 450 accounts. In the past, this validation process involved extensive manual work and required correction of errors after bulk tagging or uploading. Field Advisor handled the validation_ _efficiently, reducing errors and saving time, allowing the team to focus on strategic account planning and customer engagement rather than data cleanup.”_
> 
> _— AWS Customer Solutions Manager_

## **How Amazon Bedrock AgentCore provides the foundation**

Supporting thousands of AWS personnel across global sales teams demands a solution that handles complex multi-agent orchestration, secure access to internal systems, and predictable execution at high volume. Amazon Bedrock AgentCore provides an isolated execution environment for agents, a unified gateway for tool and agent access, persistent memory for session and long-term context, consistent identity propagation, built-in observability across request flows, and integrated evaluation for continuous quality monitoring.

When a sales rep asks a question through the supported channels (CRM system, Slack, or standalone web portal), the request passes through an authentication service that verifies identity and issues an OAuth token. AgentCore Runtime receives the authenticated request, initializes a supervisor agent built with the Strands Agents, and manages the full execution lifecycle.

The supervisor agent analyzes the query and determines how to handle it. It can invoke local tools for CRM lookups and knowledge base retrieval, call remote MCP tools for systems integrated through MCP, or delegate to specialized domain agents running in separate AgentCore Runtimes. AgentCore Identity propagates the authenticated identity to every downstream tool and agent. Results are synthesized into a unified response streamed back through AgentCore Runtime’s native streaming support.

![Architecture](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/14/ML-20754-image2.png)

### **Key architecture components**

The architecture uses several Amazon Bedrock AgentCore offerings that work together to deliver Field Advisor’s capabilities:

*   **AgentCore Runtime** hosts the supervisor agent in a secure, isolated MicroVM environment. Each user session runs in its own execution context. The runtime manages model access, guardrails, and the agent lifecycle, including streaming responses back to users.
*   **Strands Agents** powers the reasoning loop inside the runtime. It handles the orchestration cycle: receiving model responses, dispatching tool calls (in parallel when possible), managing conversation context, and coordinating multi-agent flows. The extensible hook system in Strands Agents allows customization of agent behavior such as error handling, authorization checks, and response processing without modifying the core reasoning loop.
*   **AgentCore Memory** stores both short-term conversation history and long-term user context. The implementation uses a custom session manager that extends the Strands Agents AgentCoreMemorySessionManager to optimize write patterns. It syncs state after each invocation rather than after every message, which reduces API calls without sacrificing durability.
*   **AgentCore Identity** handles identity propagation across the solution. Sales reps authenticate once using OAuth, and the token propagates through the system. For cross-account agent invocations, the system supports OAuth through machine-to-machine token exchange through AgentCore Identity’s resource credential provider.
*   **AgentCore Gateway** provides a centralized access point for remote MCP tools. Rather than managing individual connections to each MCP server, tools are registered with a single Gateway instance that handles authentication and availability. On startup, the supervisor fetches tool definitions from the Gateway and creates corresponding local Strands tools, so new MCP tools can be onboarded without changes to the runtime deployment.
*   **AgentCore Observability** captures traces, logs, and metrics for every execution. Strands integrates natively with OpenTelemetry, which provides distributed tracing across multi-agent and multi-tool flows. This is critical for debugging when a single user question can fan out to several remote agents and MCP tools in parallel.
*   **AgentCore Evaluations** supports continuous quality monitoring of agent behavior in production. AWS uses evaluation data captured through AgentCore Observability traces to measure answer relevance, context precision, action correctness, and faithfulness. This provides a feedback loop that helps identify regressions and improve orchestration quality over time.

### **Core architectural capabilities**

Field Advisor’s architecture is built on the AgentCore components described earlier as a set of interlocking capabilities that work together to deliver reliable, secure and scalable multi-agent orchestration. The following sections walk through how the team implemented each one.

### **Orchestration and model configuration**

The supervisor agent is a Strands Agent initialized with a system prompt, a set of tools, a session manager, a conversation manager, and a model provider. The implementation uses the latest Anthropic Claude model available on Amazon Bedrock as the foundation model (FM), accessed through the Amazon Bedrock cross-Region inference profile for higher throughput.

To reduce latency on multi-turn conversations, the team built a custom PromptCachingBedrockModel that extends Strands’ BedrockModel to add incremental [prompt caching](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html). Before each model call, the implementation removes any previous cache points from the conversation history and adds a fresh one to the latest message. This way, everything up to the most recent turn is cached, and the model only processes new content on each turn.

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

This hook-based approach means cross-cutting concerns like authorization and error handling are decoupled from tool implementations. Teams that own remote agents don’t need to implement circuit breaking or streaming. The supervisor handles it uniformly. For builders designing similar systems, hooks are a natural extension point that avoids the complexity of middleware chains or decorator stacks.

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

The supervisor sees a flat tool catalog and the Strands reasoning loop handles the rest. This means adding a new agent requires only a configuration entry—no changes to the orchestration logic.Field Advisor also supports a pass-through mode, where sales reps explicitly select a specific agent to handle their request. In this mode, the request bypasses the supervisor entirely. The runtime forwards the query directly to the target remote agent and streams its response back, preserving the sub-agent’s formatting and citations. Users can switch between the supervisor and pass-through mode within the same conversation.

### **Human-in-the-loop workflows**

The implementation uses the native [Interrupt](https://strandsagents.com/docs/user-guide/concepts/interrupts/) feature in Strands Agents to support workflows that require explicit user confirmation. When a tool or remote agent needs user input (for example, acknowledging a data access agreement before querying CRM records), execution pauses and the interrupt is returned to the client. The user responds through Slack or the CRM interface, and the agent resumes with their input.

This pattern was extended to work across agent boundaries. When a remote agent returns an interrupt in its response payload, the local tool wrapper detects it and raises a Strands Interrupt on behalf of the remote agent. This means each agent in the solution can request user input, regardless of where it runs, and users interact through a single consistent interface. This design was a deliberate choice over building a separate human-in-the-loop service with message queues and polling. Because Strands Interrupts persist state in the session manager, the pattern is purely code-based—no additional infrastructure components are needed. The key insight is that the local tool wrapper acts as a bridge: it translates the remote agent’s interrupt response into a native Strands Interrupt, so the framework handles all the pause/resume mechanics.

### **Memory and context management**

AgentCore Memory provides both short-term and long-term persistence. Short-term memory maintains the full conversation history within a session. Long-term memory uses a semantic strategy to store summaries and important facts across sessions, so the agent remembers user preferences and prior interactions even in new conversations.

For context management, the implementation uses the Strands Agents [SummarizingConversationManager](https://strandsagents.com/docs/user-guide/concepts/agents/conversation-management/#summarizingconversationmanager) to handle conversations that approach the model’s token context window. Older messages are summarized to open up context space while preserving key information. Token limits are also enforced on user input and large tool responses are truncated before passing them back to the model, preventing context overflow from a single source.

### **File upload**

Sales reps can upload documents and images directly within conversations. Strands accepts file bytes as ContentBlock inputs, supporting text formats and images. When a file is uploaded, its content becomes part of the conversation history and is available to the agent for analysis, summarization, or answering follow-up questions. For unsupported file types such as JSON, the system extracts the text content and prepends it to the user message. This improves upon the previous solution, which was limited to five files per chat with a combined 10 MB size limit.

### **Unified tool integration through MCP**

Field Advisor supports three categories of tools through a unified interface. Local tools run directly inside the AgentCore Runtime for CRM queries, knowledge base retrieval, and data lookups. Remote MCP tools connect to external systems via the Model Context Protocol. On startup, the runtime establishes connections to registered MCP servers through AgentCore Gateway, fetches their tool definitions, and creates corresponding local Strands tools. More than 20 MCP tools have been onboarded this way, each integrated in minutes rather than days. The onboarding process is straightforward: register the MCP configuration in the Registry service, and the supervisor automatically discovers it on the next startup; no code changes, no redeployment of the runtime. Remote agents in other AgentCore Runtimes are wrapped as tools with the same interface, making the distinction between a tool and an agent transparent to the model.This unified approach means adding a new capability (whether it’s a local function, an MCP server, or a full agent) requires no changes to the orchestration logic. The supervisor sees a flat tool catalog and the Strands reasoning loop handles the rest.

### **Observability and evaluation**

Strands integrates natively with OpenTelemetry. AgentCore Observability captures the resulting traces, logs, and metrics. Every agent invocation, tool call, and model interaction is traced end-to-end, including calls that fan out to remote agents in other accounts. This data is used for both operational monitoring and continuous evaluation through AgentCore Evaluations.The team runs both online evaluation against live production traffic and offline evaluation against curated test sets. The built-in evaluators in Amazon Bedrock AgentCore continuously measure agent quality and catch regressions before they impact users. For builders starting with agent evaluation, AWS recommends beginning with online evaluation against production traffic rather than building curated test sets first. Real user queries surface edge cases that synthetic tests miss, and the built-in evaluators in AgentCore Evaluations provide a useful baseline without custom metric development.

### **Security and compliance**

Security is layered across the solution. AgentCore Runtime’s MicroVM isolation provides each user session with its own secure execution context. Amazon Bedrock Guardrails filter both user inputs and model responses to block harmful or out-of-scope content. AgentCore Identity propagates authenticated user identity to every downstream system. Tools and remote agents enforce access controls consistently, including contingent authorization checks that require explicit user consent before accessing sensitive CRM data.

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
