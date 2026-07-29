---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/market-surveillance-agent-with-langgraph-and-strands-on-agentcore
ingested: 2026-07-29
feed_name: AWS China ML
source_published: 2026-07-28
sha256: e67b0efd5ce804864c8392f07715fa30da090b30e0e135c8beb0a5a2415101f2
---

# Market surveillance agent with LangGraph and Strands on AgentCore

As artificial intelligence applications evolve from simple chatbots to sophisticated autonomous systems, organizations face new challenges in orchestrating complex multi-agent workflows that can handle real-world production scenarios. Traditional single-agent approaches often fall short when dealing with intricate business processes that require specialized expertise, dynamic decision-making, and robust error recovery mechanisms. The financial services industry exemplifies this challenge. Market surveillance systems must coordinate multiple specialized agents to analyze trading patterns, investigate suspicious activities, and generate comprehensive reports while maintaining strict compliance and reliability standards.  
  
The solution combines two frameworks: [LangGraph](<https://www.langchain.com/langgraph>) for macro-level workflow orchestration and [Strands](<https://strandsagents.com/>) for intelligent agent reasoning. LangGraph excels at managing state and directed graphs for multi-agent coordination. It gives you fine-grained control over both workflow execution and state that can be shared between agents. Its central persistence layer supports features critical for production, including human-in-the-loop interactions and robust checkpoint-based recovery from failures. Meanwhile, Strands Agent serves as the reasoning engine within individual workflow nodes. It offers model-agnostic capabilities that integrate with various large language model (LLM) providers while maintaining flexible tool integration and comprehensive observability.

With the release of [Amazon Bedrock AgentCore](<https://aws.amazon.com/bedrock/agentcore/>) last year, productionizing an agentic solution might be simplified for many use cases. The combination provides a strong foundation for production-ready agentic AI systems that can handle complex use cases while helping to deliver the infrastructure reliability and observability that enterprise applications demand.

In this post, we demonstrate how to architect and deploy a multi-agent AI system using LangGraph and Strands on AWS infrastructure. You learn how to implement state-driven workflow orchestration with LangGraph’s checkpoint system, integrate Strands agents for specialized reasoning tasks, and use AgentCore for scalable production deployment. The complete solution is available on [GitHub](<https://github.com/aws-samples/sample-langgraph-strands-market-analysis>).

## Strands: Intelligent agent reasoning

Strands Agent operates on a model-agnostic architecture that adapts to your existing infrastructure without imposing architectural constraints. The agent implements an agentic reasoning loop that continuously evaluates tool outputs and makes decisions based on intermediate results, so you can build sophisticated multi-step analysis workflows. The framework includes comprehensive session and state management and multiple conversation managers to keep your context window from overflowing.

With Strands, you can configure external tool interactions by defining tool schemas and access patterns. For our surveillance agent, we separate the discovery of data from the retrieval to avoid hallucinations and strengthen the solution against injection attacks. We use tools like `get_report_list` and `get_report_schema` to find reports and `run_report` to build the SQL query with validated parameters and run it.

We create a `security_monitor` agent with the following tools and a system prompt:
    
    
    from strands import Agent, tool
    from strands.models.bedrock import BedrockModel
    
    model = BedrockModel(
        model_id="us.anthropic.claude-sonnet-4-6",
        region_name="us-east-1",
        max_tokens=16000,
        additional_request_fields={
            "thinking": {"type": "adaptive", "budget_tokens": 8000},
        },
        cache_prompt="default",
    )
    
    @tool
    def get_report_list(agent_name: str) -> str:
        """Load the list of available reports for a specific agent.
    
        Args:
            agent_name: Name of the agent (e.g. 'security_monitor').
    
        Returns:
            str: JSON array of report objects with name and description.
        """
        reports_data = load_agent_reports(agent_name)
        return json.dumps(reports_data["reports"], indent=2)
    
    @tool
    def get_report_schema(report_name: str, query_intent: str) -> str:
        """Load column definitions for a report so you can build queries.
    
        Args:
            report_name: Name of the report (e.g. 'TradeActivity').
            query_intent: Description of what data to extract.
    
        Returns:
            str: JSON object with parameters and column definitions.
        """
        return json.dumps(load_json_report_definition(report_name), indent=2)
    
    @tool
    def run_report(
        report_name: str,
        filters: Dict[str, Any],
        limit: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Run a predefined report. The tool validates every filter against the
        report's schema and builds a parameterised SQL query. The LLM never writes
        raw SQL, so filter values cannot be injected into the query.
    
        Args:
            report_name: A report from `get_report_list` (e.g. 'TradeActivity').
            filters: Equality filters keyed by column name, e.g.
                {"symbol": "AAPL", "date": "2024-03-15"}.
            limit: Optional row cap (1..10000).
    
        Returns:
            dict: {'success': bool, 'data': str (CSV), 'error': str or None}
        """
        schema = load_json_report_definition(report_name)
        allowed_columns = {c["name"] for c in schema["columns"]}
    
        # Reject any filter field that is not in the report's allowed list of columns.
        unknown = set(filters) - allowed_columns
        if unknown:
            raise ValueError(
                f"Unknown filter field(s) {sorted(unknown)} for {report_name}. "
                f"Allowed: {sorted(allowed_columns)}"
            )
    
        # Build SQL with named bind parameters.
        where = " AND ".join(f"{field} = :{field}" for field in filters)
        sql = f"SELECT * FROM {schema['reportName']}"
        if where:
            sql += f" WHERE {where}"
        if limit is not None:
            if not isinstance(limit, int) or not 1 <= limit <= 10_000:
                raise ValueError("limit must be an integer in [1, 10000]")
            sql += f" LIMIT {limit}"
    
        return query_market_data(report_name=report_name, sql=sql, bind=filters)
    
    security_monitor = Agent(
        model=model,
        system_prompt=SECURITY_MONITOR_PROMPT,
        tools=[get_report_list, get_report_schema, run_report],
        name="security_monitor",
    )

## LangGraph: Macro workflow orchestration

LangGraph provides production-grade orchestration for multi-agent systems through three core capabilities that make it well-suited for complex AI workflows.

**Graph-based state machines** : LangGraph models agent workflows as directed graphs where nodes represent functions containing agent logic, and edges determine execution flow. This declarative approach transforms complex multi-step reasoning into readable, maintainable code. Graphs support conditional branching, parallel execution, and dynamic routing. These capabilities are important for real-world scenarios where workflows adapt based on intermediate results.

**Persistent state management** : The framework’s checkpoint system automatically snapshots complete workflow state after every node execution. With these checkpoints, you can recover smoothly from failures and support human-in-the-loop interactions. When analysts need to review intermediate results or errors occur, the system restores from the exact checkpoint. It then resumes without losing previous work. This stateful architecture supports commonly used patterns like multi-turn conversations, iterative refinement, and long-running investigations that span hours or days.

**Production reliability:** LangGraph includes built-in retry strategies with exponential backoff for handling throttling or other failures that might occur in your system. It also provides comprehensive observability through OpenTelemetry for straightforward integration with most observability applications.

Let’s build an orchestration layer that routes queries between our specialist Strands agents. The following code defines our workflow graph: a shared state, an orchestrator that selects which specialist agents to invoke, conditional routing between them, and checkpoint-backed persistence for recovery and human-in-the-loop review.
    
    
    from typing import TypedDict, Optional, List, Dict, Any
    from langgraph.graph import END, StateGraph
    from langgraph_checkpoint_aws import AgentCoreMemorySaver
    
    class AgentState(TypedDict):
        query_text: str
        session_id: Optional[str]
        agent_task_map: Optional[Dict[str, str]]
        required_agents: Optional[List[str]]
        current_agent_index: Optional[int]
        # Each specialist writes its insights here
        security_monitor_insights: Optional[Dict[str, Any]]
        broker_monitor_insights: Optional[Dict[str, Any]]
        risk_monitor_insights: Optional[Dict[str, Any]]
        intel_analyst_insights: Optional[Dict[str, Any]]
        synthesizer_insights: Optional[str]
    
    SPECIALIST_NODES = {
        "security_monitor": security_monitor_node,
        "broker_monitor": broker_monitor_node,
        "risk_monitor": risk_monitor_node,
        "intel_analyst": intel_analyst_node,
    }
    
    def route_analysts(state: AgentState) -> str:
        """Dynamic routing --- walk the required_agents list by index."""
        required = state.get("required_agents", [])
        index = state.get("current_agent_index", 0)
        if not required:
            return END
        if index < len(required):
            return required[index]
        return "synthesizer"
    
    # Build the graph
    workflow = StateGraph(AgentState)
    workflow.add_node("orchestrator", orchestrator_node)
    for name, node_fn in SPECIALIST_NODES.items():
        workflow.add_node(name, node_fn)
    workflow.add_node("synthesizer", synthesizer_node)
    workflow.set_entry_point("orchestrator")
    
    # Conditional edges --- the orchestrator and every specialist route through route_analysts, which can hand off to any specialist or the synthesizer.
    ALL_TARGETS = {name: name for name in SPECIALIST_NODES} | {
        "synthesizer": "synthesizer",
        END: END,
    }
    workflow.add_conditional_edges("orchestrator", route_analysts, ALL_TARGETS)
    for name in SPECIALIST_NODES:
        workflow.add_conditional_edges(name, route_analysts, ALL_TARGETS)
    workflow.add_edge("synthesizer", END)
    
    # AgentCoreMemorySaver checkpoints the state after every node
    checkpointer = AgentCoreMemorySaver(MEMORY_ID, region_name=REGION)
    graph = workflow.compile(checkpointer=checkpointer)

LangGraph workflow orchestration for the market analysis agent

## Why LangGraph and Strands together

Many enterprise use cases must be grounded in strict, predefined workflows. Relying purely on the non-deterministic nature of an LLM to execute the right steps is a risk. However, specific steps within those workflows do require the agile reasoning with the intelligence of the LLM.

The combination of LangGraph and Strands bridges this gap. You can use it to build systems where deterministic orchestration houses localized, dynamic intelligence.

Here is how this architectural pairing solves complex workflow challenges:

**“Node” level intelligence** : LangGraph defines the higher-level orchestration for the workflow. Strands agents are placed at specific nodes, where a complex workflow might require LLM analysis or navigating ambiguity. They apply autonomous reasoning and tool use only where that flexibility is strictly required.

**Context isolation with nodal agents** : Monolithic agents easily lose track of their instructions. By placing individual Strands agents inside separate LangGraph nodes, you compartmentalize memory. Each agent manages its own hyper-focused context and tool history, while LangGraph maintains a structured, overarching session state that these different agents can update and reference independently.

**Supercharging orchestration** : At its core, LangGraph is a low-level routing and orchestration tool. By embedding Strands, you instantly plug a comprehensive enterprise agent framework into your graph. You get the robust routing of LangGraph alongside Strands’ native Model Context Protocol (MCP) integrations, steering controls, safety guardrails, and evaluation.

Concretely, each specialist is a LangGraph node. The node spins up a fresh Strands agent with its own system prompt, tools, and isolated context. It runs the task the orchestrator assigned and returns a state update. LangGraph merges that partial update into the shared state the other nodes read from. Here is the security monitor node:
    
    
    async def security_monitor_node(state: AgentState) -> AgentState:
        """
        Single-day activity analyst agent that assesses price, volume and tick-level trades
        """
        agent = Agent(
            name="security_monitor",
            model=analyst_model,
            system_prompt=SECURITY_MONITOR_PROMPT,
            tools=[get_report_list, get_report_schema, run_report],
            callback_handler=None,
        )
    
        # Pull this node's task from the shared state the orchestrator populated.
        task = state.get("agent_task_map", {}).get("security_monitor", state["query_text"])
    
        # Strands runs its own reasoning + tool loop; collect the agent's final text.
        chunks = []
        async for event in agent.stream_async(task):
            if "data" in event:
                chunks.append(event["data"])
        result = "".join(chunks)
    
        # Return shared state updates
        return {
            "security_monitor_insights": {"task": task, "business_insights": result},
            "current_agent_index": state.get("current_agent_index", 0) + 1,
        }

## AWS infrastructure and deployment with AgentCore

Amazon Bedrock AgentCore provides a fully managed service for deploying and operating agents at scale, alleviating infrastructure management while delivering production-grade capabilities.

Runtime deployment: AgentCore runtime, a capability of Amazon Bedrock AgentCore, transforms local agent code into cloud-native deployments with minimal configuration. The service is framework agnostic and works with LangGraph and Strands out of the box. It provides purpose-built infrastructure for dynamic agent workloads, including extended runtimes for long-running investigations, low-latency execution for interactive workflows, and automatic scaling based on demand.

Deploy your LangGraph orchestrator and Strands agents using the AgentCore Python SDK, a capability of Amazon Bedrock AgentCore, and the starter toolkit. The runtime handles containerization, networking, and compute provisioning automatically. AgentCore handles the undifferentiated heavy lifting of container orchestration, scaling, and session management.
    
    
    # api.py --- AgentCore runtime entry point
    from bedrock_agentcore.runtime import BedrockAgentCoreApp
    from src.agents import Workflow
    
    app = BedrockAgentCoreApp()
    workflow = Workflow()
    
    @app.entrypoint
    async def market_surveillance_workflow(payload):
        """Invoked by AgentCore for each request. Yields streaming chunks."""
        prompt = payload.get("prompt")
        session_id = payload.get("session_id", "default-session")
        actor_id = payload.get("actor_id", "default-actor")
        async for chunk in workflow.stream_query(
            session_id=session_id, prompt=prompt, actor_id=actor_id
        ):
            yield chunk
    
    if __name__ == "__main__":
        app.run()
    
    # Deploy with the AgentCore starter toolkit
    from bedrock_agentcore_starter_toolkit import Runtime
    
    runtime = Runtime()
    runtime.configure(
        entrypoint="api.py",
        auto_create_execution_role=True,
        auto_create_ecr=True,
        requirements_file="requirements.txt",
        region="us-east-1",
        agent_name="market_surveillance_workflow",
    )
    result = runtime.launch()
    print(f"Agent ARN: {result.agent_arn}")
    
    # Invoke the deployed agent
    import boto3, json
    
    client = boto3.client("bedrock-agentcore", region_name="us-east-1")
    response = client.invoke_agent_runtime(
        agentRuntimeArn=result.agent_arn,
        qualifier="DEFAULT",
        payload=json.dumps({
            "prompt": "What caused the AAPL price spike at 11:00 AM on March 15, 2024?",
            "session_id": "session-001",
            "actor_id": "analyst-jane",
        }),
    )
    
    # AgentCore returns a server-sent-events stream. Parse it:
    for raw in response["response"].iter_lines():
        if not raw:
            continue
        line = raw.decode("utf-8") if isinstance(raw, bytes) else raw
        if not line.startswith("data: "):
            continue
        try:
            chunk = json.loads(line[6:])
            if isinstance(chunk, str) and chunk.startswith("data: "):
                chunk = json.loads(chunk[6:])
        except json.JSONDecodeError:
            continue  # malformed chunk --- skip, don't crash
        if isinstance(chunk, dict) and chunk.get("type") == "text":
            print(chunk["content"], end="")

Memory integration: LangGraph integrates with AgentCore memory, a capability of Amazon Bedrock AgentCore, through the `langgraph-checkpoint-aws` package with a few lines of code, providing both short-term checkpoint persistence and intelligent long-term memory retrieval.

The `AgentCoreMemorySaver` class, used in this example, handles checkpoint objects containing user messages, AI responses, graph execution state, and metadata. After each node completion, LangGraph automatically saves checkpoints to AgentCore memory. You get stateful conversations and workflow recovery without managing Amazon DynamoDB tables or implementing custom serialization logic.

The `AgentCoreMemoryStore` class provides intelligent memory capabilities where AgentCore automatically extracts insights, summaries, and user preferences from conversations. Agents can search through these memories in future interactions, so you can deliver personalized experiences that improve over time. This addresses the fundamental challenge of agent statelessness: each interaction builds upon previous knowledge rather than starting fresh.
    
    
    import boto3, time
    
    REGION = "us-east-1"
    control_client = boto3.client("bedrock-agentcore-control", region_name=REGION)
    
    response = control_client.create_memory(
        name="MarketSurveillanceMemory",
        description="Memory for market surveillance multi-agent workflow.",
        eventExpiryDuration=90,  # days
    )
    MEMORY_ID = response["memory"]["id"]
    print(f"Memory ID: {MEMORY_ID}")
    
    # Wait for ACTIVE, with a 10-minute deadline. Creation normally takes 1-3 min.
    deadline = time.time() + 600
    while True:
        status = control_client.get_memory(memoryId=MEMORY_ID)["memory"]["status"]
        if status == "ACTIVE":
            break
        if status == "FAILED" or time.time() >= deadline:
            raise RuntimeError(f"Memory {MEMORY_ID} is {status!r} (expected ACTIVE)")
        time.sleep(10)

On graph build:
    
    
    checkpointer = AgentCoreMemorySaver(MEMORY_ID, region_name=REGION)
    graph = workflow.compile(checkpointer=checkpointer)

On invocation, pass `thread_id` and `actor_id` to the agent. These are unique identifiers for the user and session:
    
    
    config = {
        "configurable": {
            "thread_id": "surveillance-session-001",
            "actor_id": "analyst-jane",
        }
    }
    
    response = await graph.ainvoke(
        {"query_text": "Which brokers were most active?"},
        config=config,
    )

Observability and operations: AgentCore includes built-in observability through integration with Amazon CloudWatch and AWS X-Ray, capturing agent execution traces, tool invocations, and performance metrics. The service provides dashboards for monitoring agent behavior, identifying bottlenecks, and optimizing costs. Combined with LangGraph’s OpenTelemetry events, you gain comprehensive visibility from high-level workflow orchestration down to individual LLM calls and reasoning steps.

## Conclusion

In this post, we showed how to build production-ready multi-agent AI systems by combining LangGraph’s robust workflow orchestration with Strands’ intelligent agent reasoning capabilities, deployed on AWS infrastructure.

The hybrid architecture we explored demonstrates how LangGraph excels at macro-level orchestration (managing agent coordination, state persistence, and workflow recovery) while Strands provides the detailed reasoning engine within individual nodes. With this separation of concerns, you can build sophisticated systems that handle complex business processes while maintaining production reliability through checkpoint-based recovery and comprehensive observability.

Consider extending this architecture for other complex orchestration scenarios such as document processing pipelines, customer service automation, or compliance monitoring systems. The model-agnostic nature of Strands combined with LangGraph’s state management makes this pattern particularly valuable for enterprise applications requiring both flexibility and reliability.

To dive deeper into the technical implementation details and build a market analysis agent yourself, see the [GitHub repository](<https://github.com/aws-samples/sample-langgraph-strands-market-analysis>).

* * *

## About the authors

### Gleb Geinke

Gleb is a Deep Learning Architect at the AWS Generative AI Innovation Center. Gleb collaborates directly with enterprise customers to design and scale transformational generative AI solutions for complex business challenges.

### Siddhesh Tiwari

Siddhesh is a Data Scientist at AWS Professional Services. He works with enterprise customers to design and deliver generative AI, agentic AI, and machine learning solutions on AWS.

### Wang Teng Lee

Wang Teng is a Delivery Consultant with AWS Professional Services, specializing in AI and agentic solutions. He works hands-on with customers across the full delivery lifecycle – architecture, development, and deployment – and stays on the leading edge of AI, exploring how emerging technologies can simplify the way we live and work.

### Efren Faderanga

Efren Faderanga is a Delivery Consultant at AWS Professional Services, building the infrastructure that makes agentic AI systems production-ready. He specialises in multi-agent orchestration, CI/CD pipelines, and the serverless, event-driven foundations that autonomous systems run on. His work focuses on bridging the gap between AI engineering and production infrastructure.
