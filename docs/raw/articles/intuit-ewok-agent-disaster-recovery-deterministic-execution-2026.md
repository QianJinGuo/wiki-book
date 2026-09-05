---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/how-intuit-built-an-agentic-disaster-recovery-assistant-with-amazon-bedrock
ingested: 2026-09-05
feed_name: AWS China ML
source_published: 2026-09-04
sha256: 79e246adabf519cea2acfc4cf5f7e7869f32d4a9e12cc1a4a2cebec688c0658b
---

# How Intuit built an agentic disaster recovery assistant with Amazon Bedrock

Disaster recovery (DR) at scale is hard. When thousands of microservices span multiple AWS Regions, coordinating a reliable failover becomes a major operational challenge. At Intuit, we operate at this scale. We support products that millions of people rely on to run their businesses and manage their finances including TurboTax, QuickBooks, Mailchimp, and Credit Karma. To close that gap, we built an agentic disaster recovery assistant with Amazon Bedrock. It builds on our existing centralized internal disaster recovery system called Ecosystem Wide Orchestrator Kit (EWOK). EWOK standardizes failover execution across compute, databases, networking, caches, and asynchronous workloads. Service owners declare recovery intent in YAML, and the EWOK system orchestrates the underlying infrastructure actions, reducing recovery times from several hours to about 20 minutes for supported workloads.

EWOK solved execution but not decision-making. Choosing which recovery workflow applies, and confirming an asset is ready, still relied on the tribal knowledge of on-call engineers. To close this gap, we built EWOK Agent, an AI-powered agent built with Amazon Bedrock. Teams across Intuit have used it to run failovers for the last several months.

In this post, we explain the architecture and design decisions behind the EWOK Agent. We cover the design principles for encoding failover knowledge, a typed-skill architecture, and the decision about which model to use. Throughout, we hold one idea firmly. The model decides what to do, and the EWOK Agent deterministically executes how. Each design choice described here follows from that separation.

## Before you begin

This post describes an architecture and a reusable pattern rather than a step-by-step deployment. The code samples are illustrative excerpts, not a complete implementation. Familiarity with Amazon Bedrock (model access, the Bedrock Converse API and its tool use capability), Amazon Bedrock Guardrails, the IAM actions a Bedrock workload typically calls, and Python with the AWS SDK for Python (Boto3) and langchain-aws is expected.

The recovery execution layer (EWOK) is an internal Intuit system. The pattern itself (typed skills, a thin Amazon Bedrock layer, and a bounded agentic loop over a deterministic executor) is not specific to EWOK and can be applied to other systems that expose authenticated, auditable APIs.

## Ecosystem Wide Orchestrator Kit (EWOK) in brief

The opening introduced EWOK as the service underneath the EWOK Agent. A few of its terms recur throughout this post:

- **Asset:** A registered, recoverable unit, a service or serverless app, that EWOK manages traffic for. A recoverable unit typically includes the compute layer (Kubernetes namespace or EC2 target group), the traffic endpoints (API Gateway routes or service mesh hostnames), associated databases (Aurora global database), associated caches (ElastiCache), and asynchronous or stateful dependencies (message queues or pipelines).
- **Recovery workflow:** The ordered sequence of automated steps EWOK executes to move an asset from a degraded primary region to a healthy secondary region (i.e. the failover). Users declare recovery intent in a YAML configuration file defining workflow stages, each mapping to a specific action.
- **Readiness check:** A pre-flight validation run against an asset before a failover workflow is allowed to execute.
- **Policy gates:** Guardrails that EWOK evaluates before or during workflow execution to determine whether a workflow is permitted to proceed.
- **Execution ID:** A unique value assigned to a single run of an EWOK workflow, identifying that execution instance end to end.
- **Change record:** A formal entry in the change-management system that authorizes and documents a production change; every failover is authorized and auditable, and no production workflow runs without one.

## How teams run failover

An on-call engineer tells the agent "Failover payments-gateway in production". EWOK Agent then: resolves the asset and discovers its available recovery workflows; selects the appropriate failover workflow (or asks the engineer to choose); validates readiness and checks policy gates (e.g. an active change-freeze window); triggers execution through the EWOK system and returns the execution ID and change record; monitors and reports stage-by-stage status until the failover completes.

Those tasks used to be a sequence of runbook lookups and console visits. Earlier an engineer coordinated the API calls; now they supervise conversations. The engineer stays in the loop for judgment calls and approvals but no longer needs to be the orchestrator.

## Solution overview

The EWOK Agent consists of four layers, from an engineer's request to a deterministic recovery action:

1. **Consumer layer (top):** holds Intuit's Engineering Portal and IDE integration, connected through Model Context Protocol (MCP), the two entry points where an engineer submits a plain-language request.
2. **Agent layer:** runs on Amazon Bedrock and pairs foundation model selection and a bounded reasoning loop with Amazon Bedrock Guardrails applied on every invocation. It handles model selection, guardrails, and skill dispatch.
3. **Skill layer (right):** holds typed, versioned skills, each defined as a YAML schema plus a prompt body, which compiles to tool specifications that the model selects from.
4. **Execution layer (bottom):** the EWOK API layer, which deterministically performs asset resolution, recovery workflow lookup, readiness checks, policy gates, execution-ID-based tracking, change records, and the failover itself, through workload-specific agents for compute, database, cache, and traffic.

Status flows back up the same path, from the execution layer through the agent layer to the consumer.

## Design principles

The article details several design principles that follow from "the model decides what to do, the EWOK Agent deterministically executes how":

- **Decision/execution separation:** The model is responsible for selecting among typed recovery skills; the deterministic EWOK executor carries out the chosen workflow. This bounds the blast radius of model error.
- **Typed, versioned skills:** Each skill is a YAML schema plus prompt body that compiles to a tool specification. This turns tribal failover knowledge (runbook lookups, which workflow applies, whether an asset is ready) into version-controlled, reviewable, testable artifacts.
- **Bounded reasoning loop:** The agent runs in a bounded loop over the deterministic executor, applying guardrails on every invocation, rather than unbounded autonomous exploration.
- **Model selection per task:** The article discusses pairing foundation model selection with the skill dispatch decision.

The pattern (typed skills, a thin Amazon Bedrock layer, and a bounded agentic loop over a deterministic executor) is reusable and can be applied to any system that exposes authenticated, auditable APIs.

## Conclusion

EWOK Agent at Intuit packages tribal disaster-recovery knowledge into typed skills and a bounded agentic loop over a deterministic executor, preserving the safety and auditability of the existing EWOK system while adding model-based decision-making. The architecture separates model decision-making from deterministic execution, keeping every failover authorized and auditable through the established change-management process.