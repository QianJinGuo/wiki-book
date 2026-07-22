# Autoresearch: The feedback loop behind self-improving agents

## Ch04.004 Autoresearch: The feedback loop behind self-improving agents

> 📊 Level ⭐ | 9.4KB | `entities/autoresearch-feedback-loop-self-improving-agents-introspection.md`

# Autoresearch: The feedback loop behind self-improving agents

## 摘要

Autoresearch is the paradigm where AI agents build feedback loops to improve their own systems, going beyond simple agentic loops. Roland Gavrilescu, co-founder and CEO of Introspection (ex-xAI), describes how the key challenge is designing reward functions for agent self-improvement rather than just building agent loops. The feedback loop design — what signals agents use to assess their own performance and how they act on that assessment — determines whether the system improves or degrades over time. Autoresearch shifts the focus from 'agent doing a task' to 'agent improving how it does tasks', enabling self-maintaining systems that can debug, optimize, and extend their own capabilities without human intervention.

## 核心要点

1. Autoresearch extends the concept of agent loops from "agent doing work" to "agent improving how it does work"
2. The key architectural insight is the split between an **inner loop** (primary system serving users) and an **outer loop** (meta-system that studies and improves the primary system)
3. **Agent recipes** are proposed as a portable format for capturing the full evolution of an agent system — including evals, judges, signal processing, and human expertise
4. The open-source Pi framework serves as the extensible foundation, analogous to Linux, with Introspection providing managed infrastructure analogous to Red Hat
5. Human-in-the-loop is not transitional but integral — humans act as signal sources that agents learn from over time

## 深度分析

### Inner Loop vs Outer Loop: The Core Architectural Insight

The most important conceptual contribution of autoresearch is the explicit separation between the **inner loop** and the **outer loop**. The inner loop is the production system that interacts with users and performs tasks — what most people think of when they talk about "agent loops." The outer loop is a meta-system that studies, evaluates, and improves the inner loop.

This separation mirrors the distinction in reinforcement learning between the policy (what actions to take) and the learning algorithm (how to update the policy based on experience). In practice, most agent products today only build the inner loop — they optimize for task completion but lack mechanisms for systematic self-improvement. Autoresearch argues that the outer loop — the design of feedback signals, reward functions, and improvement mechanisms — is where the durable competitive advantage lies. A product that can measure its own performance and systematically improve will outpace one that relies on manual tuning, regardless of underlying model capability.

### Agent Recipes as Knowledge Capture Artifacts

Gavrilescu's proposal of **agent recipes** addresses a fundamental problem in agent engineering: the tacit knowledge gap. Understanding why a successful agent system works requires knowing not just the final code but the full decision history — what failures occurred, what signals were added, what human expertise was encoded, and what experiments were tried.

The recipe concept draws inspiration from data recipes used in model post-training. Just as a data recipe describes how much data from different domains should be baked into a model, an agent recipe captures the full evolution of signals, evals, judges, and human expertise that shaped the system. This is particularly important for agent systems because their behavior emerges from the interaction of many components (prompts, tools, context management, feedback signals) — no single component alone determines system quality. A recipe captures the system's evolution in a portable, provider-agnostic format, enabling transfer across different underlying models and infrastructure.

### The Human-as-Signal-Source Design Pattern

A nuanced insight in autoresearch is that human involvement is not a transitional phase to be eliminated but a permanent architectural element. The design pattern is "human as signal source" — agents learn by asking humans questions through an "ask a human" tool, accumulating preference data over time, and becoming increasingly autonomous in familiar contexts while remaining capable of requesting human input when encountering novel situations.

This mirrors how a new employee joins a company: initially asking many questions, learning organizational norms, and gradually making more independent decisions. The key engineering challenge is designing the question-asking mechanism to be efficient — not every decision requires human input, but the agent must know when uncertainty warrants it. This is essentially an active learning problem in deployment, and the quality of this uncertainty estimation mechanism determines both the autonomy level and the safety of the system.

### From Agent Harnesses to Agent Loops: The Evolution of Abstraction

Gavrilescu's framing of the evolution from "models → harnesses → loops" captures a broader industry trend. In 2023-2024, the focus was on model capability. In 2024-2025, the focus shifted to harnesses (Claude Code, Codex, Pi) — the scaffolding that connects models to tools and context. In 2025-2026, the focus is shifting again to loops — the feedback mechanisms that enable continuous improvement.

This evolution implies a changing competitive landscape. Model capability commoditizes over time (open-source models catch up). Harness capability also commoditizes (Pi is open-source, patterns like MCP are standardizing). Loop design — the specific feedback signals, eval infrastructure, and improvement mechanisms — becomes the durable differentiator. Companies like Cursor and Cognition have demonstrated this: their competitive advantage comes not from unique model access but from the quality of their feedback loops (user behavior data → improved model responses → better user experience → more user data).

### Vertical Agent Deployment as the Proving Ground

Introspection's focus on vertical agents (non-coding, domain-specific) is strategically significant. Coding agents have already been proven successful (Cursor, Claude Code, Codex), but the hardest problems — and the largest market opportunities — lie in vertical SaaS, healthcare, legal, finance, and other regulated industries where security, data ownership, and provider independence are non-negotiable.

The autoresearch paradigm is particularly well-suited to these verticals because it allows the system to learn domain-specific expertise over time without requiring upfront domain engineering. The "human as signal source" pattern enables a gradual transfer of tacit domain knowledge from human experts to the agent system, working within the compliance and security constraints that characterize enterprise environments. This makes autoresearch not just a technical architecture but an enterprise deployment strategy.

## 实践启示

1. **Design your outer loop before your inner loop.** The autoresearch paradigm suggests that teams building agent products should first design the feedback mechanisms (What signals indicate success? How will the system measure its own performance? What improvement actions can it take?) before designing the task-completion pipeline. Without an outer loop, the inner loop cannot systematically improve.

2. **Invest in signal quality over model quality.** Gavrilescu's first recommendation is to "invest in your signals" — the quality of the feedback signals determines whether the system improves or degrades over time. Product feedback, error patterns, user satisfaction metrics — these signals need filtering mechanisms because not all feedback carries equal value.

3. **Adopt the "recipe" mindset for agent documentation.** Instead of documenting agent systems with static architecture diagrams, capture the evolution of evals, judges, and signal processing decisions. The recipe format makes this knowledge portable across model providers and infrastructure changes. Start by documenting three things: what signals you collect, what judges you use, and what failures led to new evals.

4. **Budget for cost control in autonomous loops.** Without guardrails, an agent running an inefficient outer loop can generate unexpected costs. Implement cost monitoring, loop iteration limits, and approval gates for expensive actions before deploying autonomous improvement loops in production.

5. **Start with a factory blueprint but build toward it gradually.** Don't assume you can create a fully autonomous system on day one. Follow "design the human as a core component" — start with heavy human oversight and systematically transfer routine decisions to the agent as confidence grows, using the "ask a human" tool pattern for novelty detection.

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/autoresearch-feedback-loop-self-improving-agents-introspection.md)

---

