---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/nateras-intelligent-appointment-scheduling-with-amazon-bedrock-agentcore
ingested: 2026-08-27
feed_name: AWS China ML
source_published: 2026-08-26
sha256: 95e3e8984d2d43e6f63417c1284f68ad63c821af32f963ba041d61a2e4558b84
---

# Natera’s intelligent appointment scheduling with Amazon Bedrock AgentCore

Booking a phlebotomy appointment shouldn’t be a hassle for oncology patients already managing treatment. Natera’s service, powered by [Amazon Bedrock AgentCore](<https://aws.amazon.com/bedrock/agentcore/>), allows a phlebotomist to come to the patient, helping Natera deliver a more convenient experience.

[Natera](<https://www.natera.com/>), a global diagnostics company specializing in cell-free DNA testing, wanted to transform their patient experience by replacing manual scheduling calls with something better. Using Amazon Bedrock AgentCore, they built an automated voice agent that allows patients to book appointments through conversation while maintaining the accuracy and compliance standards required in healthcare.

In this post, we share the architecture pattern and design decisions behind the Natera voice scheduling agent built on Bedrock AgentCore. You learn how Natera and AWS designed a real-time voice agent that bridges telephony, foundation models, and backend services using three core architectural principles: a dual-WebSocket bridge pattern, an event-driven latency-masking technique, and a progressive trust model for mid-conversation authentication. The post explains the rationale for each design choice. It also shows how the architecture delivers 100% tool-calling accuracy during validation across 500 end-to-end call simulations, with sub-7-second perceived latency at less than USD 0.01 per completed call. This post presents a system design showing how each AWS service connects and why Natera made specific integration choices for their implementation.

We walk you through how Natera migrated from [Amazon Elastic Container Service (Amazon ECS)](<https://aws.amazon.com/ecs/>) to [Amazon Bedrock AgentCore runtime](<https://aws.amazon.com/bedrock/agentcore/>), including how the team addressed WebSocket lifecycle and session state challenges along the way.

## The challenge: Scheduling complexity at scale

Natera’s current mobile phlebotomy service helps patients schedule blood draw appointments at their homes rather than visiting a clinic. The scheduling system supports this workflow.

Patients call, authenticate, and provide three preferred appointment dates along with their service location. A human scheduling team then coordinates with phlebotomists and vendors to confirm one of the proposed slots.

This workflow requires patient authentication using personal identifiers and Short Message Service (SMS) verification codes, integration with multiple third-party vendor systems for appointment availability windows, and graceful fallback options for complex scenarios. The existing system used a third-party artificial intelligence (AI) provider for voice interactions and orchestration, connected through Twilio for phone connectivity and running on Amazon ECS containers. While functional, the team identified opportunities to improve accuracy, scalability, and conversational engagement.

For organizations using Epic or Cerner with standard appointment booking workflows, [Amazon Connect Health](<https://aws.amazon.com/health/connect-health/>) offers pre-built patient engagement agents that handle verification and scheduling out of the box. Natera’s use case required custom vendor coordination and telephony flexibility beyond what pre-built solutions support today, making AgentCore the right architectural foundation.

## Why Amazon Bedrock AgentCore

Natera chose to rebuild their scheduling agent on Amazon Bedrock AgentCore, a service to build, connect, and optimize agents at scale with any framework or model. They chose it after evaluating how the service could address their core operational challenges. The team needed to fulfill customer requests with autonomous AI agents at scale, without the burden of managing container infrastructure or scaling configuration. The fully managed architecture of AgentCore alleviated that operational overhead.

Equally important was maintaining high customer engagement during processing delays, which they could achieve by generating context-aware intermediate responses using fast foundation models through Amazon Bedrock to keep conversations natural. The built-in memory management system stores previous patient activities so the agent can deliver personalized, proactive support.

Natera also adopted AgentCore for its built-in observability. Every time the agent processes a request, AgentCore captures a detailed trace of what happened at each step. Teams can see which tools were called, how long each step took, and what the model decided. They can track individual sessions end-to-end and pinpoint exactly where latency occurs, whether in model inference, tool execution, or memory retrieval. For a healthcare environment where accuracy and performance are non-negotiable, this level of visibility makes it possible to identify and fix issues quickly without guessing.

## Solution overview

This section describes the end-to-end architecture of Natera’s voice scheduling agent. The design follows three core principles that make it adaptable to other real-time voice AI use cases:

  1. The dual-WebSocket bridge pattern separates telephony streaming from model inference by placing an orchestration layer between them. This means the system maintains one WebSocket connection to the telephony provider and another to the foundation model, with the orchestrator managing the flow between them. This separation gives teams the flexibility to swap either side independently, for example, replacing Twilio with Amazon Connect Health or OpenAI with Amazon Nova without redesigning the full system.
  2. Event-driven latency masking treats perceived latency as a first-class design concern rather than trying to optimize each individual component for raw speed. When the agent needs to call a tool such as checking appointment availability, the architecture generates contextual filler responses in parallel, so the patient hears a natural acknowledgment instead of silence. This approach keeps the conversation feeling fluid even when backend operations take several seconds to complete.
  3. A progressive trust model escalates authentication and memory access incrementally as the conversation unfolds. Rather than requiring patients to verify their identity upfront before anything can happen, the system begins with a low-trust interaction and gradually grants access to more sensitive information as the patient is authenticated. This creates a natural conversation flow instead of a gate-then-proceed experience that feels transactional.



The decision point of this architecture is increased orchestration complexity. Managing two concurrent WebSocket connections, parallel filler generation, and progressive memory sessions requires careful state management. For simpler use cases (such as single-turn Q&A or text-only agents), direct integration without the bridge pattern would reduce overhead.

The following diagram illustrates the overall system architecture. It also shows how Natera transitioned the compute layer from self-managed containers to a fully managed serverless environment, preserving the preceding design principles while alleviating infrastructure operations.

  
Figure 1: Architecture of Natera’s voice scheduling agent on Amazon Bedrock AgentCore

### Migration approach from Amazon ECS to AgentCore runtime

Natera migrated their workloads from Amazon ECS to Bedrock AgentCore runtime. This is a fully managed serverless environment that hosts AI agents in isolated microVMs with dedicated CPU, memory, and filesystem resources.

To begin the migration, the team decoupled the voice orchestration logic from container-specific infrastructure code like health check endpoints, scaling policies, and deployment manifests. With that separation in place, they refactored the agent’s entry point to conform to the invocation interface of AgentCore runtime, replacing HTTP server initialization with the AgentCore handler pattern. The last piece was migrating session state from container-local storage to Bedrock AgentCore memory, which provided durable cross-session persistence without managing a separate state store.

The team encountered two primary challenges during this migration. One was adapting long-lived WebSocket connections to the execution model of AgentCore runtime. Unlike Amazon ECS tasks that run indefinitely, AgentCore microVMs are scoped to the invocation. The team addressed this by implementing connection pooling within the agent’s runtime context, allowing WebSocket sessions to persist across the duration of a single call while AgentCore managed the underlying compute lifecycle. Session state continuity posed a separate challenge. On Amazon ECS, the conversation state lived in container-local memory and was lost on restarts. Moving to AgentCore memory required redesigning the state model to be externalized and keyed by actor ID, which ultimately improved reliability but required refactoring all state read/write paths.

This removed the operational overhead of managing container scaling, health checks, and deployment pipelines.

### Request flow walkthrough

The following sections describe the request flow, from the moment a patient dials in to when they receive a confirmed appointment.

#### Call initiation and voice streaming

When a patient calls the scheduling line, Twilio establishes a bi-directional WebSocket connection to the agent running AgentCore runtime. Simultaneously, the agent opens a second WebSocket connection to a real-time voice processing API. This creates a real-time audio bridge.

On the inbound path, Twilio streams raw call media (patient speech) to a voice processing service for intent recognition. On the outbound path, the voice processing service generates audio responses and streams them back through the agent to Twilio, delivering synthesized speech to the patient’s phone.

The agent on AgentCore runtime acts as the orchestration layer between these two WebSocket channels. It intercepts tool-call requests from the voice processing service, executes business logic, and injects results back into the conversation context.

#### Context-aware filler generation (latency masking)

While the agent processes tool calls (Steps 3-5), a parallel filler loop activates to maintain conversational flow. The technique works as follows:

The agent monitors tool-call events from the voice processing service’s WebSocket stream. When a tool call begins, the filler loop starts with a timer calibrated to the expected duration of that specific tool (for example, authentication APIs average 2.5 seconds and scheduling APIs average 4 seconds).

These calibration values come from a structured measurement process the team ran during the observability phase. First, they used the built-in trace export of AgentCore runtime and routed per-tool latency events to [Amazon CloudWatch](<https://aws.amazon.com/cloudwatch/>) Logs over a two-week window of representative call traffic. Second, they queried the logs to build a latency distribution for each tool call, extracting the P50 (median) response time as the baseline. Third, they subtracted one second from each tool’s P50 to set the filler trigger point, giving the Claude Haiku filler request time to complete and be injected before most callers would notice silence.

The result is a per-tool lookup table (for example, an authentication trigger at 1.5 s and scheduling trigger at 3.0 s) that the filler loop consults when a new tool call begins. Teams adopting this pattern can re-derive their own table by repeating the same three steps against their own tool latency distributions using a percentile-capable log analytics tool.

At the calibrated interval, typically 1.5 seconds into a tool call, the agent sends a request through Amazon Bedrock to produce contextual responses. The prompt follows this template structure:

> _You are a scheduling assistant. The system is currently executing [TOOL_NAME]. The patient last said: “[LAST_UTTERANCE]” Current workflow step: [STEP_NAME] Generate exactly one short sentence (under 15 words) that: – Acknowledges the brief wait naturally – Does NOT promise a specific outcome – Matches the context of the current step_

The system generates a single filler sentence (for example, “Let me pull up your available time slots” or “I’m checking availability with your local provider”). The generated filler is injected as an intermediate audio response into the conversation context. If the tool call completes before the filler interval, the filler is suppressed. This event-driven approach avoids unnecessary fillers for fast operations while masking delays for slower ones.

#### Patient authentication and memory transfer

The agent authenticates the patient through a tiered verification process that uses the session management capabilities of AgentCore memory.

The process starts with phone number identification. The agent hashes the caller’s phone number using SHA-256 and uses the hash as the actor ID when creating a new session through the [session management API](<https://docs.aws.amazon.com/bedrock/latest/userguide/agents-memory.html>) of AgentCore memory. This creates an unauthenticated session where the agent stores early conversation context, such as the greeting and initial intent, without exposing sensitive patient data.

Once the conversation progresses, the agent performs full identity verification by collecting personal identifiers from the patient. Upon successful verification against Natera’s identity service, the agent creates a new authenticated session using the verified patient ID as the actor ID, establishing access to the patient’s full history.

With both sessions established, the agent migrates the conversation history. It retrieves the conversation turns from the unauthenticated session and injects them into the authenticated session through the session history APIs of AgentCore memory (see [AgentCore memory documentation](<https://docs.aws.amazon.com/bedrock/latest/userguide/agents-memory.html>)). This provides continuity without requiring the patient to repeat information. The unauthenticated session is then marked as merged and excluded from future retrievals.

This transition pattern supports progressive trust. Basic interactions such as answering general questions proceed with phone-number-level identification. But sensitive operations such as confirming appointments or accessing health records require full verification.

#### Personalized context retrieval

With complete authentication, the agent retrieves the patient’s historical context from two sources. From Bedrock AgentCore memory, the agent retrieves previous conversation history, appointment preferences, and activity data from prior interactions. AgentCore memory provides both short-term storage (current session conversation) and long-term storage (cross-session patient patterns). The underlying data persists in [Amazon DynamoDB](<https://aws.amazon.com/dynamodb/>) for durable, low latency read/write access at scale.

From the [Amazon Managed Streaming for Apache Kafka (Amazon MSK)](<https://aws.amazon.com/msk/>) and [AWS Lambda](<https://aws.amazon.com/lambda/>) event pipeline, the agent receives patient activity events from other channels (activity on web portals, previous SMS, email, and call traffic). A Lambda function consumes events from Amazon MSK and writes relevant activity summaries to AgentCore memory. This gives the voice agent comprehensive context even for patients using AI for the first time.

#### Knowledge retrieval-augmented generation (RAG)

Patients frequently ask questions during the scheduling call about the blood draw process, what to expect, how to prepare, or insurance coverage. These questions often go beyond the agent’s predefined prompts.

The system uses [Amazon Bedrock Knowledge Bases](<https://aws.amazon.com/bedrock/knowledge-bases/>), the fully managed retrieval capability, to extend the agent’s knowledge in real time. Natera stores FAQ documents, procedure guides, and policy information in [Amazon Simple Storage Service (Amazon S3)](<https://aws.amazon.com/s3/>), removing the need to maintain dedicated vector database infrastructure. [Amazon Titan Text Embeddings V2](<https://aws.amazon.com/bedrock/titan/>) converts documents and queries into vector representations for semantic search. A custom hierarchical chunking strategy segments documents at multiple levels of detail (section, paragraph, sentence). This supports precise retrieval that matches the specificity of patient questions.

Based on internal testing with a dataset of 200 representative patient inquiries during the development phase, this configuration achieves over 90% response accuracy for general patient inquiries. This keeps the conversation flowing without requiring an agent to transfer to a human operator.

#### Appointment scheduling and confirmation

With the patient authenticated and their preferences loaded, the agent executes the core scheduling workflow. The agent first retrieves product type and order information to announce important product-specific reminders before proceeding. It then evaluates the available appointment time window based on the patient’s order information and collects three preferred appointment dates along with the patient’s service location. The agent interacts with other Natera services to submit the mobile phlebotomy appointment request and informs the patient of the appointment details. Finally, it stores the confirmed appointment in the patient’s memory profile for future reference.

For model availability by Region, refer to [Supported models by AWS Region in Amazon Bedrock](<https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html>).

## Compliance and security

The system implements [Amazon Bedrock Guardrails](<https://aws.amazon.com/bedrock/guardrails/>) to maintain conversational safety and output quality, and it runs as a HIPAA-eligible AWS service under a Business Associate Agreement (BAA). These configurations fall into three areas: data privacy, conversational safety, and output integrity.

Data privacy and access control are foundational to the system’s design. The system processes and stores protected health information (PHI) within HIPAA-eligible AWS services under a BAA. Guardrails provides output-level controls that block the agent from reading back sensitive identifiers such as SSNs, credit cards, or insurance IDs during voice interactions, helping prevent verbal disclosure even though the underlying infrastructure handles this data securely. Access to tools that process personal information is gated behind identity verification. Until a patient is authenticated, those tools are not exposed to the agent. Even after verification, tool access is scoped exclusively to the verified patient’s session. The agent has no technical means to look up another patient’s data or fetch personal information for an unverified caller.

The voice processing architecture operates under data processing agreements with encryption requirements. Natera is exploring fully managed AWS services to keep all audio processing within the BAA boundary. Organizations with stricter data residency requirements can adopt this path today.

Conversational safety guardrails define the boundaries of what the agent can and cannot do during patient interaction. The agent does not provide medical advice, diagnosis, or result interpretation beyond what verified tool calls return. When the system detects profanity, distress signals, emergency language, or certain flagged keywords, it escalates the conversation to a human agent. The system also prevents SMS communication until it has verified the patient’s communication preferences and received verbal consent.

Output quality and RAG integrity guardrails make sure the agent’s responses are accurate and grounded. Deterministic verdicts prevent repetition, detect out-of-context responses, and flag suspicious content before it reaches the patient. When the agent interacts with the knowledge base, hallucination detection and mitigation run before a RAG response is generated. Similarity scoring and relevancy evaluation further validate RAG responses before they are surfaced to the patient.

## Results

After four months of iterative development and testing across 500 end-to-end call simulations, the solution demonstrated strong performance across accuracy and latency.

The orchestrator achieved 100% tool-calling accuracy during validation across all 500 test scenarios, correctly routing every request to the appropriate specialized agent. Parameter extraction was equally precise: every tool invocation received correctly structured parameters during simulation testing. These accuracy metrics were validated through the built-in trace analysis of AgentCore, which logs every agent loop iteration and compares invoked tools and parameters against expected outputs.

Perceived latency landed at a 6.8-second median, measured end-to-end from patient input to first meaningful response including voice processing. The Bedrock-only portion measured 6.2 seconds. These figures were calculated from session timestamps captured through the latency breakdown instrumentation of AgentCore across a representative sample of real patient interactions.

Per-call cost remained below USD 0.01 per completed call (measured as total cost for a full end-to-end patient interaction including model inference, tool execution, and memory operations, not per individual conversational turn).

The voice agent handles complete appointment booking flows from patient verification through confirmation, including identity verification, scheduling preferences, and confirmation details. Response accuracy exceeded 90%, assessed by comparing agent responses against a human-reviewed ground truth dataset of scheduling outcomes and scored on correctness of appointment details, eligibility verification, and patient-specific context retrieval.

## What the team learned

Bringing this system to production surfaced the following challenges:

Latency perception matters more than raw speed. Early demos revealed 3-5 seconds of silence between user input and agent response, creating awkward pauses that risked patients abandoning AI for a human agent. The team discovered that the bottleneck wasn’t large language model (LLM) inference, but external service calls like APIs and authentication checks. The breakthrough came from observing that human agents take longer than AI to complete the same tasks but manage wait time naturally, saying things like “Let me check that for you.” Patients don’t perceive this as a delay. By generating contextual filler responses in parallel with tool execution, the team applied the same principle to the voice agent and alleviated dead air without needing to make backend calls faster.

Diverse input testing revealed blind spots early. Voice recognition handled common names well but misrecognized uncommon ethnic names, creating a challenge for patient authentication. The team built a name spelling helper tool that activates when confidence is low and asks patients to spell names letter by letter. This kind of edge case only surfaced through testing with representative patient populations, reinforcing the importance of building diverse test suites before production deployment.

Per-step observability exposed the real bottlenecks. The built-in trace analysis of Bedrock AgentCore captures every agent loop iteration, including tool-call latency, LLM inference time, and memory retrieval duration. This instrumentation revealed that 70% of perceived latency came from a single vendor API rather than the LLM. Without per-step tracing, the team would have optimized the wrong component. End-to-end metrics are insufficient for agentic systems. Each tool call needs independent instrumentation to surface the actual constraint.

Progressive authentication requires upfront design. The memory handoff pattern from hashed phone number to authenticated patient ID worked well but required careful planning from the start. Retrofitting progressive trust into an agent that assumes a single identity model is significantly harder. We recommend planning your actor ID strategy and memory handoff flow before writing agent logic. AgentCore memory supports this pattern natively, but you must design it explicitly rather than adding it after the fact.

## Conclusion

Natera’s voice agent has completed validation testing and is now in production for inbound mobile phlebotomy scheduling, with expansion to omnichannel support for both inbound and outbound call handling underway. The mobile phlebotomy scheduling use case proved that AI-powered voice agents can deliver healthcare-grade accuracy while reducing operational cost and patient friction.

Early production data reinforces these results. Over a four-week reporting window, the system built on AgentCore handled 4,744 calls, a 5.5% increase over the prior system. It also reduced premature call endings: the short-call rate (calls under 30 seconds) dropped from 22% to 12%, indicating patients stay engaged longer rather than abandoning to reach a human agent. Survey captures also expanded significantly, with Net Promoter Score (NPS) response rates climbing 47% (from 1.09% to 1.60%), giving the team a much broader window into patient sentiment. Satisfaction scores remained broadly stable, with promoter and detractor shares essentially unchanged despite the larger sample. Verification completion improved slightly (66% compared to 64%), and average call duration for resolved interactions increased from 79 seconds to 101 seconds. This is consistent with the design goal of keeping patients in-flow longer rather than escalating early.

Looking ahead, Natera plans to extend this foundation across operations, customer success, and lab teams using Amazon Bedrock AgentCore as the backbone for multi-agent coordination. The goal is to give non-technical teams the ability to build and deploy AI agents through natural language, turning what once required engineering resources into something a team can create in minutes. As Natera scales these capabilities, services like AgentCore runtime, AgentCore memory, and the foundation model framework of Amazon Bedrock will continue to underpin their approach to making healthcare interactions simpler for patients and more efficient for the teams that serve them.

## Next steps

If you’re building voice agents or conversational AI for healthcare, life sciences, or other regulated industries, here are ways to get started with the services covered in this post:

  * **Deploy your first agent on AgentCore runtime.** If you’re currently running agent workloads on containers and want to alleviate infrastructure management, follow the [AgentCore runtime getting started guide](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agents-tools-runtime.html>) to deploy a serverless agent in under 30 minutes.
  * **Add session memory to an existing agent.** If your agent loses context between interactions or requires users to repeat information, integrate the [AgentCore memory session management APIs](<https://docs.aws.amazon.com/bedrock/latest/userguide/agents-memory.html>) to persist conversation state across sessions without managing your own state store.
  * **Reduce perceived latency with event-driven filler generation.** If your voice agent has noticeable pauses during tool calls, implement the filler generation pattern described in this post using the [AgentCore streaming invocation mode](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agents-tools-runtime.html>) to generate contextual responses in parallel with backend operations.
  * **Build a progressive authentication flow.** If your application handles sensitive data and you want to avoid upfront authentication gates, use the [AgentCore memory actor-based session model](<https://docs.aws.amazon.com/bedrock/latest/userguide/agents-memory.html>) to escalate trust incrementally as users verify their identity mid-conversation.



* * *

## About the authors

### Cem Onan

Cem is a Software Architect at Natera, bringing four years of expertise in the development of omni-channel communication systems. Over the past year, he has been designing an AI-driven call center, where intelligent agents manage patient inquiries regarding test statuses, billing inquiries, and mobile phlebotomy. He is a specialist in serverless architecture and maintains a passion for traveling.

### Tamara Gagliardi

Tamara is a Senior Solutions Architect at AWS with over 15 years of experience in the technology field, spanning across industries including financial services, retail and manufacturing. For the past several years, she has focused her expertise on the healthcare and life sciences sector, partnering closely with medical devices and bio-diagnostic customers to accelerate their cloud journeys. As a trusted technical advisor, Tamara helps organizations translate complex business challenges into scalable, secure technical solutions with a particular emphasis on generative AI, where she guides customers in identifying high-impact use cases and architecting intelligent workflows.

### Veronica Rule

Veronica is a Senior Customer Solutions Manager at AWS with over 10 years of experience supporting healthcare and life science customers on their cloud journey. She specializes in guiding organizations through AI/ML adoption, agentic AI strategies, and cloud transformation initiatives. Veronica has been instrumental in helping Natera become a leading Bedrock and AgentCore customer, facilitating strategic partnerships between customer engineering teams and product leadership to accelerate innovation in patient care. She is passionate about bridging the gap between advanced AI capabilities and real-world health care and life sciences outcomes.
