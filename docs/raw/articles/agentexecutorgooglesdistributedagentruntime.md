---
title: Agent Executor, Google’s distributed Agent Runtime
type: article
tags: [agent, apple, google, llm, optimization, vision]
source: rss
source_url: https://cloud.google.com/blog/products/ai-machine-learning/agent-executor-googles-distributed-agent-runtime/
sha256: 3b240d0406bb
ingested: 2026-05-22
---


Published Time: 2026-05-20

Markdown Content:
As models and harnesses improve, agents are taking on increasingly complex tasks that can run for hours or even days. But as we push agents to do more, this has surfaced a new operational problem: long-running agent workflows are fragile and incredibly hard to manage reliably and efficiently in production.

Today, we’re introducing **Agent Executor,** Google’s [open-source](https://github.com/google/ax) runtime standard for agent execution, resumption, and distributed deployment. Based on what we’ve learned from solving these challenges internally, we’ve built Agent Executor to have the following native capabilities:

*   **Durable execution:** Long-running execution requires the ability to resume after outages or agentic interruptions such as human-in-the-loop (HITL) confirmations. Agent Executor provides this backend resilience automatically for any actor (e.g., an agent, agent harness, skill, tool, or sandbox) through its event log and snapshotting.

*   **Secure isolation**: Agent Executor isolates components in secure-by-design sandboxes to prevent harmful side effects and help ensure malicious activity cannot compromise the broader service. Sandboxes are especially useful when agents generate code or handle multiple tenants or user data concurrently.

*   **Session consistency:**In distributed agent workflows, multiple components may attempt to update shared session state at the same time. Agent Executor’s built-in single-writer architecture helps maintain consistency and reduces the risk of corruption in that state.

*   **Connection recovery:** In long-running agentic execution, clients may disconnect for many reasons, including network outages. Agent Executor lets clients reconnect to agents and backfills responses from the last sequence seen by the client for a better user experience.

*   **Trajectory branching:**Checkpoints let you branch an agentic trajectory (its decision or workflow path) at any point, allowing agents to test or evaluate different paths without losing context or other state.

![Image 1: https://storage.googleapis.com/gweb-cloudblog-publish/images/1_agent_executor_EdQVRpG.max-1900x1900.jpg](https://storage.googleapis.com/gweb-cloudblog-publish/images/1_agent_executor_EdQVRpG.max-1900x1900.jpg)

In this blog, we’ll share more about Agent Executor and how you can get started.

### Federate with Google’s agent runtime

Enterprise adoption of agents requires orchestration across deployment models. Some teams need on-prem infrastructure for proprietary workflows, performance, or compliance, while others prefer pre-built or custom managed agents for faster time-to-value. At Google I/O, we introduced a new suite of such solutions – including [Antigravity 2.0](https://antigravity.google/blog/introducing-google-antigravity-2-0) and the [Managed Agents API](https://blog.google/innovation-and-ai/technology/developers-tools/managed-agents-gemini-api) – designed to accelerate how teams build and scale within the agentic enterprise.

Agent Executor bridges these deployment models, letting you mix-and-match between any or all of:

*   Google [Antigravity](https://antigravity.google/blog/google-io-2026), Gemini’s state-of-the-art agent harness

*   Google-built frontier agents, such as the latest [Deep Research](https://blog.google/innovation-and-ai/models-and-research/gemini-models/next-generation-gemini-deep-research/) agent

*   Custom agents built by you and managed by Google (e.g., via the new [Managed Agents in Gemini API](https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/managed-agents))

*   Custom purpose-built agents, built with LangChain/LangGraph, [Agent Development Kit](https://adk.dev/) (ADK), etc and any agents using [Agent2Agent Protocol](https://github.com/a2aproject/A2A) (A2A)

![Image 2: https://storage.googleapis.com/gweb-cloudblog-publish/images/2_sDivt9A.max-1900x1900.jpg](https://storage.googleapis.com/gweb-cloudblog-publish/images/2_sDivt9A.max-1900x1900.jpg)

### Own your agents, models, and compute

With Agent Executor, enterprises have maximum flexibility to maintain sovereignty over workloads and keep proprietary workflows within their self-managed compute and custom sandboxes. Your internal development teams have much more flexibility over how agents are deployed and managed and you benefit from:

*   **Prevent vendor lock-in:** Deploy your agents on your own infrastructure without being tethered to a specific provider’s model or compute environment. This allows for full control over data residency and your cost and budgetary controls.

*   **Bring your own harness and agents:** Agent Executor is designed to be harness-agnostic, allowing you to bring your own or use those made available by other vendors. It also supports agents developed with industry-standard frameworks and protocols providing a broad ecosystem of compatible agents.

*   **Fully control execution:**Agent Executor allows developers to run the entire agentic stack, including MCPs, skills, and other agents, directly on their own data plane. Developers can choose any compute with custom isolation boundaries and workload policy enforcement.

### Scale agents up on Kubernetes with an agent-first compute layer

As agent workloads scale into the hundreds of millions and become increasingly long-running, our customers are hitting the limits of traditional compute abstractions because unlike traditional software, agents are nonlinear programs that wait for external inputs. To solve this problem, we’ve partnered with the Google Kubernetes Engine team on [Agent Substrate](https://cloud.google.com/blog/products/containers-kubernetes/bringing-you-agent-sandbox-on-gke-and-agent-substrate), a new open-source project also announced today.

Agent Substrate introduces a new level of abstraction for Kubernetes that moves agents onto and off of ready compute capacity in real-time, resulting in lower latency with higher scale and efficiency. While standard Kubernetes is optimized to handle thousands of long-running services, Agent Substrate is designed for the chatter of millions of sub-second tool calls that would otherwise overwhelm a standard control plane. Agent Substrate takes core secure runtime and snapshotting capabilities of existing sandbox infrastructure and pairs them with a minimal control plane designed to bypass some of the limitations of Kubernetes, without reinventing the rest of it. Working together, these layers enable you to:

*   **Maximize compute efficiency**: Agent Substrate introduces a new control plane designed to handle hundreds of millions of registered agents. Together with Agent Executor, Agent Substrate can provide a foundation for today’s largest agent deployments.

*   **Stay within the Kubernetes ecosystem:** Agent Substrate is built on top of Kubernetes and allows scheduling and horizontal scaling of compute with declarative configuration.

In the demo below, we showcase using Agent Executor together with Agent Substrate with a sample workload.

![Image 3: https://storage.googleapis.com/gweb-cloudblog-publish/images/maxresdefault_00CLfta.max-1300x1300.jpg](https://storage.googleapis.com/gweb-cloudblog-publish/images/maxresdefault_00CLfta.max-1300x1300.jpg)

[Video 3](https://www.youtube.com/watch?v=L5Iw1IrZ6Nc)

### Get started today

Models, agents, harnesses, and the infrastructure around them are all evolving faster than ever. We’re building Agent Executor in the open so we can validate the design in the hands of real developers and improve based on your feedback.

Agent Executor is available now in preview. We invite you to explore the code, test it with your own workloads, and help shape the future of agent runtimes. Head over to our [GitHub repo](https://github.com/google/ax) to get started today.

Posted in
*   [AI & Machine Learning](https://cloud.google.com/blog/products/ai-machine-learning)
*   [Application Development](https://cloud.google.com/blog/products/application-development)

