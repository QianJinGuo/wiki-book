---

title: "Scalable voice agent design with Amazon Nova Sonic: multi-agent, tools, and session segmentation"
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/scalable-voice-agent-design-with-amazon-nova-sonic-multi-agent-tools-and-session-segmentation/
tags: [aws-china-blog, agentic-ai, context-engineering]
fetcher: rss-inbox
sha256: 77ef1180020c65a0f2bd8cbbcf0989851feba2463a5ff1655caeca6e5236d4a1
ingested: 2026-05-20

---
---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/scalable-voice-agent-design-with-amazon-nova-sonic-multi-agent-tools-and-session-segmentation/
ingested: 2026-05-20
feed_name: AWS China ML
source_published: 2026-05-19T15:26:37Z
---
# Scalable voice agent design with Amazon Nova Sonic: multi-agent, tools, and session segmentation
Design patterns for scalable voice agents matter for organizations that need to deliver fast, natural, and reliable voice experiences. Many teams face challenges like high latency, managing real-time audio, and coordinating multiple agents in complex workflows.
In this post, you’ll learn how to use [Amazon Nova Sonic](<https://docs.aws.amazon.com/ai/responsible-ai/nova-2-sonic/overview.html>), [Amazon Bedrock AgentCore](<https://aws.amazon.com/blogs/machine-learning/securely-launch-and-scale-your-agents-and-tools-on-amazon-bedrock-agentcore-runtime/>), and [Strands BidiAgent](<https://strandsagents.com/docs/user-guide/concepts/bidirectional-streaming/agent/>) to build scalable, maintainable voice agents that handle these challenges efficiently, resulting in more responsive and intelligent customer interactions.
We’ll explore three popular architectural patterns for voice agents, highlighting their trade-offs and best practices for minimizing latency.
## The building blocks
Before diving deeper into the architecture patterns, here’s a quick overview of the three key components used as the sample solution in this post.
Amazon Nova Sonic is a foundation model that creates natural, human-like speech-to-speech conversations for generative AI applications. Users can interact with AI through voice in real time, with capabilities for understanding tone, natural conversational flow, and performing actions.
Amazon Bedrock AgentCore Runtime is a serverless hosting environment for AI agents. You package your agent as a container, deploy to AgentCore Runtime, and it handles scaling, session isolation, and billing. For voice agents, it provides [bidirectional WebSocket streaming](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-bidirectional-streaming.html>) with SigV4 auth, microVM-level session isolation to avoid noisy-neighbor latency spikes, [AgentCore Gateway](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-get-started-websocket.html>) for shared tool hosting using the Model Context Protocol (MCP) open source protocol, persistent memory across sessions, and telemetry for voice-specific metrics like time-to-first-audio.
[Strands Agents](<https://strandsagents.com/>) is an open source framework for building AI agents. Its [BidiAgent](<https://strandsagents.com/docs/user-guide/concepts/bidirectional-streaming/quickstart/>) class is one integration option between Nova Sonic and your application. It manages the bidirectional stream lifecycle, routes tool calls, and handles session management, simplifying the voice agent application through the model SDK interface.
## Three integration patterns: tool, agent-as-tool (sub-agent), and session segmentation
Instead of building one all-powerful agent, modern voice systems are increasingly composed of **tool-driven agents** , **sub-agents acting as tools** and **session segmentation strategies** that isolate prompts, memory, and permissions. These patterns allow teams to decompose large assistants into smaller, specialized, and reusable components while maintaining clear security boundaries.
Before running the samples in the following sections, install Python and the required dependencies, including strands-agents and boto3, and make sure your IAM setup has the necessary permissions for the required services. For the full example, refer to the [GitHub repository](<https://github.com/awslabs/agentcore-samples/tree/main/01-tutorials/01-AgentCore-runtime/06-bi-directional-streaming/02-strands-ws>).
### Pattern 1: AgentCore Gateway – tool selection for low latency
A tool call is when a voice agent sends input to an external function or service, which processes it and returns output. It lets the agent perform tasks like querying a database or triggering a service quickly and securely, without extra reasoning steps.
With [AgentCore Gateway](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-get-started-websocket.html>), you expose your existing business logic as **tools** , discrete functions that Nova Sonic can call directly during a conversation. The voice model selects which tool to invoke, passes parameters, gets a result, and speaks it back. There’s no intermediate reasoning layer between the model and the tool.
AgentCore Gateway hosts MCP servers as managed endpoints. MCP is the protocol, AgentCore Gateway is the AWS feature that runs them. The voice agent connects via Gateway ARNs.
    # Nova Sonic calls tools directly via AgentCore Gateway
    model = BidiNovaSonicModel(
        model_id="amazon.nova-2-sonic-v1:0",
        mcp_gateway_arn=[
            "arn:aws:bedrock-agentcore:us-east-1:123456789012:gateway/auth-tools",
            "arn:aws:bedrock-agentcore:us-east-1:123456789012:gateway/banking-tools",
            "arn:aws:bedrock-agentcore:us-east-1:123456789012:gateway/mortgage-tools",
        ],
    )
When a user says “What’s my account balance?”, Nova Sonic:
  1. Understands the intent from speech.
  2. Selects `get_account_balance` from the available MCP tools.
  3. Calls the tool with the right parameters.
  4. Speaks the result back.
**Trade-off:** Nova Sonic makes all the decisions. If a tool call requires multi-step validation, conditional logic, or chaining multiple operations together, that reasoning burden falls entirely on the voice model’s system prompt. For simple tools this is fine. For complex workflows, it gets brittle.
### Pattern 2: Sub-agent – additional reasoning with decoupled agents
With the sub-agent or agent-as-tool pattern, your existing business logic runs in autonomous agents, each with its own model, system prompt, tools, and reasoning capabilities. The voice orchestrator delegates whole tasks to these sub-agents instead of calling individual tools.
There are many ways to connect to a sub-agent from your voice agent. Agent-to-Agent (A2A) and Strands Agent-as-Tool are two common approaches:
  * **Local agent-as-tool:** The sub-agent runs in-process, wrapped as a `@tool` function using the [Agents as Tools pattern](<https://aws.amazon.com/blogs/machine-learning/multi-agent-collaboration-patterns-with-strands-agents-and-amazon-nova/>) in Strands. This is the most straightforward approach with no network hop and no separate deployment. The trade-off is that the sub-agent shares the same process and scales with the orchestrator.
  * **Remote agent via A2A protocol:** The sub-agent is deployed as an independent [A2A server on AgentCore Runtime](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-a2a.html>) (or a remote server) and invoked over the network. A2A is an open protocol for agent-to-agent communication. As MCP connects agents to tools, A2A connects agents to other agents. As the AWS blog on [A2A protocol support in AgentCore Runtime](<https://aws.amazon.com/blogs/machine-learning/introducing-agent-to-agent-protocol-support-in-amazon-bedrock-agentcore-runtime/>) explains, agents built with different frameworks (Strands, OpenAI, LangGraph, Google ADK) can share context and reasoning in a common format. This provides full deployment independence and cross-framework interoperability.
Strands Agents has built-in support for both protocols, MCP for tool access and A2A for agent-to-agent communication. For a hands-on walkthrough, see the community guide on [Agent Collaboration: Strands Agents, MCP, and the Agent2Agent Protocol](<https://community.aws/content/2xu47bH8LZYPr11tDN2eTDiEL95/agent-collaboration-strands-agents-mcp-and-the-agent2agent-protocol>).
Here’s the local agent-as-tool approach, each sub-agent is a `@tool` wrapping a full Strands `Agent`:
    # sub_agents.py — Define sub-agents as Strands tools using the Agents-as-Tools pattern
    from strands import Agent, tool
    from strands.models import BedrockModel
    # Each sub-agent is a full Strands Agent wrapped as a @tool
    # The BidiAgent orchestrator calls these via Nova Sonic's tool use
    @tool
    def authenticate_customer(account_id: str, date_of_birth: str) -> str:
        """Authenticate a customer using their account ID and date of birth.
        Handles the full verification flow including identity checks and retry logic.
        Returns authentication status and token."""
        auth_agent = Agent(
            model=BedrockModel(model_id="amazon.nova-lite-v1:0"),
            system_prompt="""You are an authentication agent. Verify the customer's identity
            using the provided account ID and date of birth. Call verify_identity to check
            credentials. Return a clear auth status in 1-2 sentences.""",
            tools=[verify_identity, check_account_exists],  # Sub-agent's own tools
        )
        result = auth_agent(f"Authenticate account {account_id}, DOB: {date_of_birth}")
        return str(result)
    @tool
    def handle_banking_inquiry(query: str, auth_token: str) -> str:
        """Handle banking questions — balances, transactions, transfers.
        Validates permissions and returns a conversational summary."""
        banking_agent = Agent(
            model=BedrockModel(model_id="amazon.nova-lite-v1:0"),
            system_prompt="""You are a banking agent. Use the provided tools to answer
            the customer's query. Summarize results in 2-3 natural sentences.
            Do not return raw JSON.""",
            tools=[get_account_balance, get_recent_transactions, transfer_funds],
        )
        result = banking_agent(query)
        return str(result)
    @tool
    def handle_mortgage_inquiry(query: str) -> str:
        """Handle mortgage questions — rates, calculations, eligibility, application status.
        Performs its own calculations and reasoning."""
        mortgage_agent = Agent(
            model=BedrockModel(model_id="amazon.nova-lite-v1:0"),
            system_prompt="""You are a mortgage specialist. Help with rate inquiries,
            payment calculations, and eligibility assessments. Keep responses concise
            and conversational — this will be spoken aloud.""",
            tools=[get_mortgage_rates, calculate_payment, check_eligibility],
        )
        result = mortgage_agent(query)
        return str(result)
The voice orchestrator then uses BidiAgent with these sub-agent tools:
    # voice_orchestrator.py — BidiAgent with sub-agents as tools
    from strands.experimental.bidi.agent import BidiAgent
    from strands.experimental.bidi.models.nova_sonic import BidiNovaSonicModel
    from sub_agents import authenticate_customer, handle_banking_inquiry, handle_mortgage_inquiry
    model = BidiNovaSonicModel(
        region="us-east-1",
        model_id="amazon.nova-2-sonic-v1:0",
        provider_config={"audio": {"voice": "tiffany", "input_sample_rate": 16000, "output_sample_rate": 16000}},
    )
    agent = BidiAgent(
        model=model,
        tools=[authenticate_customer, handle_banking_inquiry, handle_mortgage_inquiry],
        system_prompt="""You are a banking voice assistant. Route customer requests to the
        appropriate specialist. Always authenticate before accessing account data.
        Keep your own responses brief — the sub-agents handle the details.""",
    )
    await agent.run(inputs=[ws_input], outputs=[ws_output])
The sub-agent does its own thinking. Nova Sonic doesn’t need to orchestrate the individual steps. It delegates and speaks the result.
**Trade-off:** Each sub-agent call adds latency: the sub-agent’s own model inference plus its tool calls. In a voice conversation, this means longer silence while the sub-agent reasons. The AWS blog on [multi-agent voice assistants](<https://aws.amazon.com/blogs/machine-learning/building-a-multi-agent-voice-assistant-with-amazon-nova-sonic-and-amazon-bedrock-agentcore/>) recommends starting with smaller, efficient models like Amazon Nova 2 Lite for sub-agents to reduce latency while still handling specialized tasks effectively.
Amazon Nova 2 Sonic supports [asynchronous tool calling](<https://docs.aws.amazon.com/nova/latest/nova2-userguide/sonic-async-tools.html>), so the conversation continues naturally while tools run in the background. It keeps accepting input, can run multiple tools in parallel, and gracefully adapts if the user changes their request mid-process, delivering all results while focusing on what’s still relevant.
## Pattern 3: Session segmentation for ultra-low latency
There’s a third approach worth considering. It doesn’t map neatly to the MCP or sub-agent patterns, but is purpose-built for voice scenarios where latency is the overriding concern.
Instead of delegating external tools or sub-agents, you **segment the conversation into logical phases** , each with its own Nova Sonic session, system prompt, and tool set. When the conversation transitions from one phase to the next (for example, from authentication to account inquiry), you close the current session and open a new one with a different prompt and tools, within the same WebSocket connection. Each sub-voice-agent can use its own MCP gateways, tools, or even sub-agents — the differences that it operates with a focused prompt and minimal tool surface, reducing reasoning overhead and latency.
Think of a banking voice assistant with three conversation phases: authentication, account management, and mortgage inquiry. Rather than loading one massive system prompt with every tool, you run each phase as a focused Nova Sonic session:
    # Phase 1: Authentication
    auth_session = BidiNovaSonicModel(
        model_id="amazon.nova-2-sonic-v1:0",
        mcp_gateway_arn=["arn:...gateway/auth-tools"],  # Only auth tools
    )
    auth_agent = BidiAgent(
        model=auth_session,
        tools=[],
        system_prompt="""You are an authentication assistant. 
        Collect the user's account ID and date of birth. 
        Call verify_identity to authenticate. 
        Once verified, say 'You're all set' and stop.""",
    )
    # Run until authentication completes
    await auth_agent.run(inputs=[ws_input], outputs=[ws_output])
    # Phase 2: Account management (new session, new prompt, new tools)
    banking_session = BidiNovaSonicModel(
        model_id="amazon.nova-2-sonic-v1:0",
        mcp_gateway_arn=["arn:...gateway/banking-tools"],  # Only banking tools
    )
    banking_agent = BidiAgent(
        model=banking_session,
        tools=[],
        system_prompt="""You are a banking assistant. The user is already authenticated.
        Help with balance inquiries, transactions, and transfers.
        Keep responses to one or two sentences.""",
    )
    await banking_agent.run(inputs=[ws_input], outputs=[ws_output])
Each phase gets a clean Nova Sonic session with:
  * A focused system prompt: Shorter, more specific, less room for the model to get confused.
  * Only the relevant tools: via MCP gateways, local tools, or both. The model doesn’t waste reasoning cycles choosing between 15 tools when it only needs 3.
  * Optionally its own sub-agents: a phase that requires deeper reasoning can use Pattern 2 internally, while simpler phases stay tool-only.
  * The previous session context can be passed into the new session as chat history, so the overall conversation retains continuity.
### Compared to tool, sub-agent, and session segmentation patterns
**Factor** | **Tool** | **Sub-Agent (Agent-as-Tool)** | **Session Segmentation**  
---|---|---|---  
Latency | Low | Higher (sub-agent reasoning) | Lowest (with latency during session transitions)  
Tool set per turn | Tools loaded | Sub-agent’s tools | Only phase-relevant tools  
System prompt | One large prompt | Orchestrator + sub-agent prompts | Small, phase-specific prompts  
Reasoning depth | Voice model only | Voice model + sub-agent | Voice model only (per phase)  
Reuse of existing agents | High (same MCP tools) | Highest (same sub-agents) | Medium (composes tools/sub-agents per phase)  
Conversation continuity | Seamless | Seamless | Requires handoff logic between phases  
## Latency best practices for voice agents
Latency is a key consideration when building voice versus text agents. Here are practical techniques to keep response times fast and responsive:
**Start with small models for sub-agents.** Your voice orchestrator uses Nova Sonic for the conversation, but sub-agents don’t need a large model. Start with Amazon Nova 2 Lite or Nova 2 Micro. They’re fast, cost optimized, and handle most specialized tasks well. You can always upgrade a specific sub-agent to a larger model if quality requires it, but default to small.
**Design stateful sub-agents with caching.** A stateless sub-agent that hits a database or API on every call adds latency every time. Instead, design sub-agents to cache results from data sources (APIs, AWS Lambda functions, databases) within a session. If the banking sub-agent fetches account details once, it should hold that data in memory and serve subsequent questions (balance, transactions, summary) from cache rather than making repeated backend calls.
**Prefetch data after authentication.** This is especially valuable for contact center scenarios. After a customer authenticates, you already know who they are. Don’t wait for them to ask before pulling their data. Immediately fetch account balances, recent transactions, pending alerts, and mortgage status in the background. When the customer asks “What’s my balance?”, the answer is already in memory.
**Parallelize independent tool calls.** If the user asks “Give me an overview of my accounts”, don’t call `get_checking_balance`, then `get_savings_balance`, then `get_credit_card_balance` sequentially. Use concurrent execution so three calls happen at once. Strands supports this natively. The agent’s tool executor runs independent calls in parallel by default.
**Use filler phrases to mask tool latency.** When a tool call or sub-agent delegation is unavoidable, instruct the voice model to speak a brief filler while waiting: “Let me check that for you…” or “One moment while I look that up…” This keeps the conversation feeling alive instead of dropping into silence.
**Minimize tool count per session.** Tool selection gets slower as the number of available tools grows. If your agent has 15 tools but a typical conversation only uses 3 to 4, consider the session segmentation pattern to load only the relevant tools per phase.
## Clean up
After you finish testing the sample, remember to clean up the resources you created to avoid unnecessary costs. Follow the repository instructions to stop services and delete any deployed infrastructure.
## Conclusion
Migrating a text chatbot to a voice assistant isn’t a straightforward wrapper job. The interaction model is fundamentally different, from response design to latency budgets to turn-taking behavior. But with a well-structured multi-agent architecture and Amazon Bedrock AgentCore, the business logic layer stays intact.
The sub-agents you’ve already built are your biggest asset. Reuse them.
For a working example of a Strands BidiAgent voice assistant deployed on AgentCore Runtime with WebSocket streaming, see the [AgentCore bidirectional streaming sample](<https://github.com/awslabs/amazon-bedrock-agentcore-samples/tree/main/01-tutorials/01-AgentCore-runtime/06-bi-directional-streaming/02-strands-ws>).
## Next steps
Next, you can extend the sample to fit your own use case, integrate your business tools, refine prompts for voice interactions, and test the agent in real-world scenarios to prepare for production deployment. To learn more about voice agents on AWS, visit:
  * [Amazon Nova 2 Sonic Service Card](<https://docs.aws.amazon.com/ai/responsible-ai/nova-2-sonic/overview.html>)
  * [Amazon Bedrock AgentCore Runtime Bidirectional Streaming](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-bidirectional-streaming.html>)
  * [Strands BidiAgent](<https://strandsagents.com/docs/user-guide/concepts/bidirectional-streaming/agent/>)
  * [Amazon Bedrock AgentCore Bidirectional Streaming Sample Code](<https://github.com/awslabs/agentcore-samples/tree/main/01-tutorials/01-AgentCore-runtime/06-bi-directional-streaming>)
* * *
## About the authors
### Lana Zhang
Lana Zhang is a Senior Specialist Solutions Architect for Generative AI at AWS within the Worldwide Specialist Organization. She specializes in AI/ML, with a focus on use cases such as AI voice assistants and multimodal understanding. She works closely with customers across diverse industries, including media and entertainment, gaming, sports, advertising, financial services, and healthcare, to help them transform their business solutions through AI.
### Osman Ipek
Osman Ipek is a Solutions Architect on Amazon’s AGI team focusing on Nova foundation models. He guides teams to accelerate development through practical AI implementation strategies, with expertise spanning voice AI, NLP, and MLOps.