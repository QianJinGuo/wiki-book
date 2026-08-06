# AI Teammates: How monday.com Runs Production AI Agents on Amazon Bedrock

## Ch04.653 AI Teammates: How monday.com Runs Production AI Agents on Amazon Bedrock

> 📊 Level ⭐⭐ | 4.6KB | `entities/ai-teammates-mondaycom-production-ai-agents-bedrock.md`

# AI Teammates: How monday.com Runs Production AI Agents on Amazon Bedrock

## Overview

AWS blog post (2026-07-22) by Claudio Mazzoni, Ofek Dayan, Netanel Abergel, Moran Zilberstein, and Erez Drutin sharing monday.com's production architecture for running AI agents on Amazon Bedrock at scale. Nine in ten Builders use AI coding tools monthly; per-engineer PR throughput is up by more than half.

## Three Levels of AI Engineering

- **L1 (Assistant)** — Engineers use AI as pair programmers: Cursor for fast reflexive work, Claude Code for heavy lifts; adoption nearly doubled YoY
- **L2 (Skills & Sub-agents)** — Teams build reusable agents for repeated work; engineers remain in the driver's seat; per-developer PR throughput stepped up by more than half
- **L3 (Multi-agent)** — Fully agentic; agents own delivery end-to-end while engineers orchestrate; agents take tasks from boards, communicate in Slack and monday, ship code alongside humans

## Architecture: Sphera Agent System

The system uses seven AWS services: SNS, SQS, EKS, RDS, ElastiCache, EFS, and S3. AWS Secrets Manager handles per-session secrets; Amazon Bedrock handles model calls; the `monday-agent-sdk` runs inside each agent runner pod.

**Event path:** External triggers → SNS → per-team SQS queues → monday Builders CoWORK (SQS consumers on EKS) → resolves agent ownership → routes to agent runner pod. Pub/sub gives retries/DLQs, back-pressure, durable replay, and concurrent fan-out.

**monday-agent-sdk:** A thin wrapper around Claude Agent SDK providing provider neutrality (routes to Bedrock), cold-start cost optimization (warm node_modules), and a custom harness for evaluation, plugin composition, Slack/monday/GitHub integration, and output review standards.

## State, Memory & Sessions

Three kinds of state with distinct stores:

- **Live state** (ElastiCache): current task, run cursor, distributed lock, heartbeat, agent/human message log — sub-millisecond reads, self-expiring keys
- **Sessions and memory** (EFS): each session is a directory (`/sessions/<id>/` with `repos/`, `secrets.json`, `messages/`; `/agents/<id>/` with `MEMORY.md` and `diary/YYYY-MM-DD.md`)
- **Durable records** (S3): final transcripts, snapshots, artifacts, evals keyed by session ID

## Five Production Retrofits

1. **Evals before model upgrades** — deterministic metrics (PRs merged, revert rate) + LLM-scored evals across 5 dimensions
2. **Memory is a file, not a vector store** — per-agent `MEMORY.md` + `diary/YYYY-MM-DD.md`; plain markdown, no embeddings
3. **Remote sandbox before human review** — PR auto-deploys to sandbox; tests and replayed production traffic run before review
4. **PR Guardrails** — every monday engineering standard automated as a reviewer; tens of thousands of PRs evaluated per month; ~1 in 5 PRs fails a standard
5. **Builders CoWORK** — monday boards as the shared state layer; agent tasks, status, blockers live on same monday board as the team's

## Morphex: Fully Autonomous Engineering Agent

Morphex is monday's first fully autonomous engineering agent. 19 of every 20 Morphex PRs merge automatically using a confidence score combining: deterministic Guardrails outcome, per-agent eval trajectory, per-(agent × repo × change-class) historical revert rate, and sandbox outcome. Approximately 3 in 10 PRs merged, ~3/4 with zero human edits, revert rate in low single digits. Guardrails stopped ~1/4 of agent PRs before reaching a human.

## Source

> [AWS Machine Learning Blog](https://aws.amazon.com/blogs/machine-learning/ai-teammates-how-monday-com-runs-production-ai-agents-on-amazon-bedrock)

---
## 关联
→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/ai-teammates-how-mondaycom-runs-production-ai-agents-on-amaz.md)
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)

---

