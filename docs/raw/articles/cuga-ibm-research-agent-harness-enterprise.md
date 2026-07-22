---
title: "Build real agentic apps using CUGA: two dozen working examples on a lightweight harness"
source_url: "https://huggingface.co/blog/ibm-research/cuga-apps"
author: "IBM Research (Anupama Murthi, Hamid Adebayo, Sami Marreed, Praveen Venkateswaran, Asaf Adi)"
publish_time: "2026-06-23"
ingested: "2026-06-25"
sha256: "placeholder"
type: article
tags: [agent, harness, ibm, enterprise, cuga]
---

# Build real agentic apps using CUGA: two dozen working examples on a lightweight harness

Enterprise
Article
Published June 23, 2026

Anupama Murthi, Hamid Adebayo, Sami Marreed, Praveen Venkateswaran, Asaf Adi (IBM Research)

TL;DR - Building an agent is mostly plumbing: tools, state, guardrails, scaling from one agent to many. CUGA (pip install cuga), short for Configurable Generalist Agent, the Agent Harness for the Enterprise from IBM handles that, so you write just a tool list and a prompt.

We built two dozen working examples showing how to use CUGA to build real agentic apps. From a simple calculator agent to a multi-agent system for medical research, these examples demonstrate the full range of what CUGA can do.

## What is CUGA?

CUGA is a lightweight, open-source agent harness from IBM Research. It provides:

- **Tool registration**: Register any Python function as a tool the agent can use
- **State management**: Built-in conversation and session state handling
- **Guardrails**: Input/output validation, safety checks, compliance controls
- **Multi-agent orchestration**: Scale from single agents to coordinated multi-agent systems
- **Production-ready**: Logging, monitoring, error handling out of the box

Installation is one line: `pip install cuga`

## The Examples

### 1. Calculator Agent
The simplest example - a single agent that can do math. Shows the basic CUGA pattern:
- Define tools (add, subtract, multiply, divide)
- Create agent with tools + system prompt
- Run conversation loop

### 2. Weather Agent
Calls external APIs (weather service) to answer questions. Demonstrates:
- API integration as a tool
- Error handling for external service failures
- Structured output parsing

### 3. Research Agent
Multi-step research workflow:
- Search the web
- Read and summarize documents
- Synthesize findings into a report

### 4. Code Review Agent
Reviews pull requests by:
- Reading the diff
- Checking against coding standards
- Suggesting improvements
- Generating review comments

### 5. Data Pipeline Agent
Orchestrates data processing:
- Extract from multiple sources
- Transform and clean data
- Load into target systems
- Validate results

### 6-10. Document Processing Suite
- PDF extraction and summarization
- Contract analysis
- Invoice processing
- Meeting notes generation
- Knowledge base building

### 11-15. Customer Service Suite
- Ticket routing
- FAQ answering
- Escalation handling
- Sentiment analysis
- Response generation

### 16-20. DevOps Automation
- Deployment orchestration
- Incident response
- Log analysis
- Performance monitoring
- Capacity planning

### 21-24. Multi-Agent Systems
- Collaborative research (multiple agents divide and conquer)
- Medical diagnosis (specialist agents consult)
- Financial analysis (data agent + analysis agent + report agent)
- Supply chain optimization (planner + executor + monitor)

## Architecture Deep Dive

### Tool Registration
```python
from cuga import tool

@tool
def search_database(query: str, limit: int = 10) -> list:
    """Search the product database."""
    return db.search(query, limit=limit)
```

### Agent Creation
```python
from cuga import Agent

agent = Agent(
    name="research-assistant",
    tools=[search_database, read_document, summarize],
    system_prompt="You are a research assistant...",
    guardrails={
        "max_tool_calls": 20,
        "allowed_domains": ["internal.corp.com"],
        "output_filter": compliance_check,
    }
)
```

### Multi-Agent Orchestration
```python
from cuga import Orchestrator

orchestrator = Orchestrator(
    agents=[researcher, writer, reviewer],
    coordination="sequential",  # or "parallel", "hierarchical"
    shared_state=True,
)
```

## Key Design Decisions

1. **Plumbing over AI magic**: CUGA focuses on the infrastructure around the LLM, not the LLM itself
2. **Convention over configuration**: Sensible defaults, but everything is customizable
3. **Enterprise-first**: Compliance, audit trails, and security are first-class concerns
4. **Python-native**: No YAML configs, no DSL - just Python functions and decorators

## Getting Started

```bash
pip install cuga
cuga init my-project
cd my-project
cuga run examples/calculator
```

GitHub: https://github.com/IBM/cuga
Documentation: https://ibm.github.io/cuga/
