---
source_url: "https://developer.nvidia.com/blog/building-ai-agents-for-ar-glasses-and-xr-devices-with-nvidia-xr-ai/"
ingested: 2026-06-26
sha256: d45f5bb11d14d58c
---

# Building AI Agents for AR Glasses and XR Devices with NVIDIA XR AI


Published Time: 2026-06-16T22:30:00+00:00

Markdown Content:
Developers building for AR glasses and wearable devices face an infrastructure gap. The hardware is ready, but creating AI experiences requires integrating live camera and microphone streams, multimodal AI models, enterprise data, tool use, deployment infrastructure, and device-specific runtimes.

[NVIDIA XR AI](https://developer.nvidia.com/xr/xr-ai)is designed to address this challenge by providing a reusable foundation for connecting extended reality (XR) devices to GPU-accelerated AI services running in the cloud, data center, workstation, or edge.

Now publicly available in beta, developers have access to an [open source](https://github.com/NVIDIA/xr-ai) library for building intelligent agents for AI glasses, AR glasses, and XR headsets. These intelligent XR agents can see what users see, understand spoken or typed intent, call enterprise tools, and respond within the same XR session. They can help frontline team members find the right information, guide workers through procedures, verify outcomes, and capture the evidence.

XR AI brings intelligence to people where they work, whether in field service, remote assistance, industrial operations, healthcare, training, or other hands-busy environments.

NVIDIA partners in healthcare and manufacturing provide useful examples of how this pattern can be applied.Researchers in the Cong Lab at the Stanford School of Medicine and the Wang Lab at Princeton University have explored XR and AI workflows for stem cell therapy research, helping researchers access contextual information and interact with laboratory systems while remaining focused on complex procedures.

In manufacturing, Siemens is exploring in a research context how NVIDIA XR AI and NVIDIA DGX Spark can help factory engineers find maintenance information, troubleshoot issues, verify work, and capture what happened on the shop floor.

This post walks through the process of building an intelligent XR Agent for your use case. It also explores how XR AI combines visual grounding using NVIDIA Cosmos, voice-first interaction with NVIDIA Nemotron models, enterprise connectivity using Model Context Protocol (MCP), and flexible agent orchestration with frameworks such as NVIDIA NeMo Agent Toolkit.

## Components and architecture of an intelligent XR Agent[](http://developer.nvidia.com/blog/building-ai-agents-for-ar-glasses-and-xr-devices-with-nvidia-xr-ai/#components_and_architecture_of_an_intelligent_xr_agent)

An intelligent XR Agent starts with live context from the user’s XR device. Camera frames, microphone audio, and data messages flow into the XR Media Hub, where they can be routed to models, tools, and agents that understand the user’s environment and intent. NVIDIA Cosmos models provide visual grounding; NVIDIA Nemotron models provide language understanding, reasoning, and tool calling; and MCP servers expose enterprise tools and data sources.Agent frameworks such as [NVIDIA NeMo Agent Toolkit](https://github.com/NVIDIA/NeMo-Agent-Toolkit) can orchestrate workflows across models and tools, while NVIDIA CloudXR can add rendered spatial content when an application needs rich 3D interaction.

XR AI keeps this architecture modular by separating media transport, model services, tool access, agent orchestration, and client delivery. Video pixels can remain in shared memory while lightweight metadata moves through the system, so agents retrieve image data only when a task requires it. This reduces unnecessary model inference and data movement while letting developers swap clients, models, MCP servers, orchestration frameworks, and deployment environments without rebuilding the entire agent.

The same design also supports multi-user and multi-agent scenarios. Participant identity acts as the routing boundary: multiple clients can connect to the same hub, multiple agents can observe the same streams, and each response is routed back to the correct participant. This pattern enables one foundation to support visual understanding, voice interaction, enterprise tool use, real-time reasoning, context-aware XR responses, and flexible deployment across AI glasses, AR glasses, XR headsets, mobile devices, web clients, and CloudXR-powered experiences.

## Get started[](http://developer.nvidia.com/blog/building-ai-agents-for-ar-glasses-and-xr-devices-with-nvidia-xr-ai/#get_started%C2%A0)

XR AI is now available in public beta. The following sections walk through how you can use XR AI to quickly get to a working intelligent XR Agent, including:

*   Live camera, microphone, and device data streams
*   Real-time multimodal interaction
*   Visual grounding through Cosmos-powered VLMs
*   Voice interaction through speech recognition and Nemotron models
*   Enterprise connectivity through MCP
*   Searchable visual knowledge capture and retrieval workflows
*   Optional agent orchestration through [NeMo Agent Toolkit](https://docs.nvidia.com/nemo/agent-toolkit/latest/) or other frameworks
*   Optional [CloudXR](https://docs.nvidia.com/cloudxr-sdk/latest/index.html)-rendered spatial content

While implementation details vary across industries, the underlying architecture remains largely the same.

### Build your first intelligent XR agent with the public beta[](http://developer.nvidia.com/blog/building-ai-agents-for-ar-glasses-and-xr-devices-with-nvidia-xr-ai/#build_your_first_intelligent_xr_agent_with_the_public_beta)

Step 1. Clone the XR AI repository

The [GitHub repository](https://github.com/NVIDIA/xr-ai) includes sample agents, model-server launchers, MCP servers, web clients, XR workflows, and the core media infrastructure. The quickest way to understand the system is to start with a simple multimodal agent and then add capabilities one layer at a time.

`bash``git clone https:``//github``.com``/NVIDIA/xr-ai``.git``cd``xr-ai`

Step 2. Start the AI services

The larger examples use shared AI services that can be started independently:

`bash``cd``agent-samples``/model-servers``uv``sync``uv run model_servers`

This starts the model processes used by the heavier demos and leaves the weights loaded in the background.

In the current repository, the model server stack includes:

*   nvidia/parakeet-tdt-0.6b-v3 for speech-to-text
*   nvidia/Cosmos-Reason1-7B for vision-language reasoning
*   nvidia/Llama-3.1-Nemotron-Nano-8B-v1 for fast, latency-sensitive language responses
*   NVIDIA-Nemotron-3-Nano-30B-A3B for deeper tool-calling workflows

The `agent-sdk/xr-ai-models` package keeps the model layer flexible. Workers reference logical services such as `llm`, `agent_llm`, `vlm`, `stt`, and `tts` through configuration, letting developers swap endpoints, use cloud-hosted models, or bring OpenAI-compatible APIs without changing agent logic.

The core AI services to power visual understanding, speech recognition, language reasoning, and voice responses are in place.

Step 3. Run a sensor-first XR agent

Start the simplest working agent:

`bash``cd``agent-samples``/simple-vlm-example``uv``sync``uv run simple_vlm_example`

When the service starts, it prints a web client URL and authentication token.

Open the web client, connect, and send a prompt such as ping or ask a question through the microphone.

The workflow is straightforward:

1.   The client streams camera, microphone, and data messages.
2.   XR AI routes media through the XR Media Hub.
3.   Speech is converted to text.
4.   The latest camera frame is analyzed using the Cosmos-powered VLM path.
5.   The agent generates a response.
6.   The response returns as both text and synthesized audio.

This is now a working intelligent XR agent. It can listen, understand what the user sees, reason over visual context, and respond through the same session using both text and speech.

Before adding enterprise systems, RAG pipelines, or spatial rendering, this validates the most important capability: real-time multimodal interaction grounded in the user’s environment.

Step 4. Connect enterprise data through MCP

Most enterprise agents need more than live perception. A researcher may need protocol steps, experiment metadata, or dataset access. A field technician may need maintenance records. A manufacturing engineer may need work instructions, controller state, or digital-twin information. XR AI uses Model Context Protocol (MCP) as the integration layer for these workflows.

The repository includes MCP servers for XR-specific capabilities:

*   vlm-mcp for visual question answering
*   video-mcp for video analysis and queries
*   render-mcp for scene manipulation
*   oxr-mcp for OpenXR spatial information
*   vec-mcp for vector and spatial utilities
*   transcript-mcp for transcript ingestion and retrieval

Developers can also build custom MCP servers for enterprise systems, retrieval-augmented generation (RAG), databases, digital twins, asset-management systems, and domain-specific workflows.

Many organizations are also interested in capturing and understanding visual information from the physical world. An XR agent can observe procedures, inspections, maintenance activities, or research workflows, then use technologies such as NVIDIA Video Search and Summarization (VSS) to index, summarize, and retrieve that information later. Over time, this creates a searchable visual knowledge base that can support reporting, training, compliance, operational reviews, and retrieval-augmented generation workflows.

This is where the agent begins to move beyond perception and into enterprise action and organizational memory.

Step 5. Add agent orchestration

The following example is adapted from the NeMo Agent Toolkit MCP client workflow pattern. In practice, this configuration would live inside a NeMo Agent Toolkit workflow definition and enable the agent to discover tools exposed by XR AI MCP servers.

`function_groups:`

```xr_tools:`

```_type: mcp_client`

```server:`

```transport: streamable-http`

`workflow:`

```_type: react_agent`

```tool_names:`

```- xr_tools`

The important point isn’t the framework, but that XR AI provides a consistent foundation for real-time media, multimodal perception, and enterprise connectivity while enabling developers to choose the orchestration approach that best fits their environment.

Developers interested in more advanced orchestration workflows should review the [NeMo Agent Toolkit documentation,](https://docs.nvidia.com/nemo/agent-toolkit/latest/) which includes detailed examples for MCP integration, tool calling, multi-agent systems, and RAG-based workflows.

Step 6. Add CloudXR-rendered spatial experiences

Not every XR workflow requires rendered 3D content. Some agents only need a camera, microphone, language, and enterprise tools. When a workflow benefits from spatial visualization, XR AI can pair the agent layer with NVIDIA CloudXR.

`bash``cd``agent-samples``/xr-render-demo``uv``sync``uv run xr_render_demo`

This workflow launches the XR Media Hub, CloudXR runtime, model services, MCP servers, and an agent worker.

The agent can call rendering tools through MCP to create, update, and manipulate objects in a user’s spatial environment. CloudXR streams the resulting experience from GPU infrastructure to the client device.

The demo also shows a useful production pattern. A smaller model handles rapid acknowledgments and status updates while a larger model performs deeper reasoning and tool use. Users receive immediate feedback while more complex operations continue in the background. At this stage, the XR agent can interact with both the physical environment and rendered spatial content.

You now have a working intelligent XR agent, ready to customize to your use case. You can also learn more or reach out to us for a [deeper partnership](https://developer.nvidia.com/xr/xr-ai).

*   Get the [code](https://github.com/NVIDIA/xr-ai).
*   Read the NVIDIA XR AI [documentation](http://nvidia.github.io/xr-ai).
*   Learn more about building agents with [Nemo Agent Toolkit.](https://docs.nvidia.com/nemo/agent-toolkit/latest/index.html)
*   Learn more about spatial streaming using [CloudXR](https://www.nvidia.com/en-us/design-visualization/solutions/cloud-xr/).

