---
title: "github agentic token efficiency"
source_url: https://github.blog/ai-and-ml/github-copilot/improving-token-efficiency-in-github-agentic-workflows/
ingested: 2026-05-09
sha256: 9ed5320a7d51
type: raw
created: 2026-05-10
updated: 2026-05-10
tags: [github, copilot, pricing, llm]
---
# Improving Token Efficiency in GitHub Agentic Workflows
Agentic workflows that run on every pull request can quietly accumulate large API bills. Here's how we instrumented our own production workflows, found the inefficiencies, and built agents to fix them.
GitHub Agentic Workflows is like a team of street sweepers that clean up little messes in your repo. These teams significantly improve repo hygiene and quality, but as with all agentic work, cost is a growing concern for developers. And because CI jobs like agentic workflows are automatically scheduled and triggered, costs can accumulate out of view.
Thankfully, making automations more efficient is easier than doing the same for interactive desktop sessions. Work done during a developer session can be hard to predict, but agentic workflows' work is fully specified in YAML and repeats every execution.
Because we maintain and use GitHub Agentic Workflows in our own GitHub repositories, we worry about token efficiency as much as our users. That is why in April 2026, we began to systematically optimize the token usage of many of the workflows that we rely on every day. This post describes what we instrumented, the optimizations we applied, and our preliminary results.
## Logging token usage
We rely on hundreds of agentic workflows in our repos for maintenance and CI. All workflows run as GitHub Actions against real API rate limits. We are building the plane as we fly it and burning jet fuel as we go.
Before we could optimize our token consumption, we needed to know how tokens were consumed. The first challenge we faced was that each agent framework (Claude CLI, Copilot CLI, Codex CLI) emitted logs in a different format, and usage data could be incomplete for historical runs. Thankfully, the agentic-workflows security architecture uses an API proxy to prevent agents from directly accessing authentication credentials. This proxy gave us a way to capture token usage across all runs in a single normalized format, regardless of agent framework.
## Workflows optimizing workflows
With token data in hand, we built two daily optimization workflows.
- **Auditor**: scans daily token usage reports to identify workflows with high or anomalous token consumption.
- **Daily Token Optimizer**: when an Auditor flags a workflow, looks at the workflow's source and recent logs to create a GitHub issue describing concrete inefficiencies and proposing specific optimization.
The Auditor and Optimizer are agentic workflows themselves, and their token usage also appears in daily reports to create a small virtuous cycle.
## Eliminating unused MCP tools
Based on our initial Auditor and Optimizer results, the most common inefficiency is unused MCP tool registrations.
Because LLM APIs are stateless, agent runtimes typically include the MCP tool function names and JSON schemas with each request. In practice, this means the full set of tools can become part of every call's context. For a GitHub MCP server with 40 tools, this can add 10-15 KB of schema per turn. If the agent only uses two tools, the remaining 38 are pure overhead added to every request.
Workflow authors naturally start with a full tool-set since it is the path of least resistance, and the agent can figure out which tools it needs. But as time goes on, most workflows rely on a narrow, stable set of tools. The Optimizer identifies this pattern by cross-referencing tool manifests against actual tool calls and recommends pruning unused tools from the configuration.
In our smoke-test workflows, removing unused tools from the MCP configuration reduced per-call context size by 8-12 KB, saving several thousand tokens per run with no change in behavior.
## Replacing GitHub MCP with GitHub CLI
Removing unused MCP tools is a relatively simple win. A larger structural opportunity was replacing GitHub MCP calls for data-fetching operations like retrieving pull request diffs, file contents, and review comments with calls to the GitHub CLI.
This change did more than reduce the overhead of unused tools because an MCP tool call is a reasoning step in addition to data retrieval. The agent must decide to call the tool, formulate its arguments, and receive its output as part of the context. That's a full round-trip LLM API call, consuming tokens for the tool-use JSON schema, the argument block, and the response. Calling 'gh pr diff', by contrast, is a deterministic HTTP request to GitHub's REST API with no LLM involvement.
Two strategies used for this migration:
1. **CLI substitution in a bash tool**: replacing MCP-based data-fetching with inline bash commands using the GitHub CLI.
2. **Subagent pattern**: spawning a subagent whose only job is to gather context via CLI, returning only structured data to the main agent.
Together, these techniques move the majority of GitHub data-fetching out of the LLM reasoning loop.
## Measuring efficiency gains is not easy
Three confounding factors:
1. **Workload variation**: raw token counts can confuse workload variation with fluctuations in efficiency. The team tracks LLM API call counts alongside token counts; constant LLM turns-per-run and falling tokens-per-call indicate genuine efficiency improvement.
2. **Quality measurement**: a lighter model running a more constrained workflow might produce lower-quality output. Process-level signals (output tokens per LLM call, turn counts per run, tool-call completion rates) can approximate quality but are not outcome signals.
3. **Run frequency**: run frequency matters as much as per-run savings. Auto-Triage Issues fires on every new issue (averaging 6.8 runs/day) while Daily Compiler Quality runs at most once per day.
**ET formula used**: ET = m × (1.0 × I + 0.1 × C + 4.0 × O) where I = input tokens, C = cached input tokens, O = output tokens.
## Initial results
| Workflow | ET savings | Key insight |
|----------|-----------|-------------|
| Auto-Triage Issues | 62% | 6.8 runs/day compounds to ~7.8M ET saved |
| Smoke Copilot | Stable quality | 5 LLM turns/run, optimizations didn't affect quality process signals |
| Contribution Check | +5% (regression) | Workload shift (41% small PRs → 9% small PRs) masked per-turn efficiency gains |
## Key takeaways
Three patterns emerged:
1. **MCP tool pruning** is the lowest-hanging fruit - removes 8-12KB per call with no behavioral change.
2. **CLI substitution** eliminates entire LLM round-trips for deterministic data-fetching operations.
3. **Run frequency** is as important as per-run savings when prioritizing optimization targets.
## What's next?
- **Subagent decomposition**: refactoring monolithic agents into teams of subagents using smaller/cheaper models.
- **Episode-level analysis**: understanding which phases of a workflow run (context gathering, synthesis, retries) are most costly.
- **Portfolio-level optimization**: detecting duplicate work across workflows in the same repository.
The proxy-level observability and optimizer workflows have already changed how the team develops and deploys new agentic automations - they add token monitoring from day one rather than retrofitting it later.