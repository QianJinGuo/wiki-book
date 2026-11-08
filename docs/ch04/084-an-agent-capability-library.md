# An agent capability library

> 📊 Level ⭐⭐⭐ | 13.4KB

> **来源**: [An agent capability library](https://samihonkonen.com/posts/an-agent-capability-library/)

## 概述

In the [last post](https://samihonkonen.com/posts/purpose-built-local-ai-agents/) I described how I set up a local LLM and how I create purpose-built agents:

> Whenever I want AI help with something specific, I make a new directory under `~/projects/` on my Air and just start working with pi. Once I’ve done what I want to do, I tell pi to record the process in an `AGENTS.md`. From that point on, every time I open pi in that directory it reads the file and is immediately ready to continue.

Continuing on that, I’ve started building a general library of capabilities for the agents. Pi reads a global `AGENTS.md` from `~/.pi/agent/AGENTS.md` on startup. Mine is a symlink to a `CAPABILITIES.md` in a repo called `agent-docs`. It’s a capability index: a list of things the agent can do, each with a short description of when to reach for it and a pointer to a doc that explains how. Here’s an excerpt:

```
- **Studio machine** — a powerful always-on Mac you can SSH into.
  Reach for it when you need more horsepower or a stable host for a
  background service. Read @~/projects/agent-docs/STUDIO.md.

- **exe.dev VMs** — on-demand Linux VMs with a public HTTPS proxy.
  Reach for it when you need a real Linux box or a public URL.
  Read @~/projects/agent-docs/EXE-DEV.md.

- **Browser automation** — drive a real Chrome from the shell.
  Reach for it when you need to scrape, fill a form, or visually
  check a deployed page. Read @~/projects/agent-docs/AGENT-BROWSER.md.
```

The agent doesn’t load all specific instructions upfront. It reads the index, decides whether the task matches a capability, and only then reads the relevant doc. The docs themselves are ordinary markdown: what the thing is, when to use it, how to use it. I write and update them almost exclusively with AI. `agent-docs` is itself a purpose-built agent for maintaining the library.

I also include a reference to `CAPABILITIES.md` in the `AGENTS.md` of individual coding projects, so project agents can reach for the same tools.

The current list has seven entries: the Studio, the local LLM, private git hosting on the Studio, [exe.dev VMs](https://samihonkonen.com/posts/a-love-letter-to-exe-dev/), browser automation, a personal MCP server, and this blog. Adding a new one is three steps: write the doc, add a line to the index, commit.

The idea is that this compounds. Every time I set something up, I write a doc for it. The agents inherit the capability. Over time the agent should become genuinely useful across a wide range of tasks, because the infrastructure behind it keeps growing.

## 深度分析

### The capability index as progressive disclosure

The mechanism looks unremarkable — a markdown file with a few bullets — but it is a concrete implementation of progressive disclosure for agent instructions. `CAPABILITIES.md` is the only artifact that is always resident: a handful of lines, each naming a capability, stating the situation that should trigger it, and pointing at a doc to read once triggered. Everything else (`STUDIO.md`, `EXE-DEV.md`, `AGENT-BROWSER.md`, …) stays on disk as an ordinary file that enters context only when the task matches. The agent does not load the specific instructions upfront: it reads the index, decides whether the task matches a capability, and only then reads the relevant doc.

Collapsing every procedure into one always-loaded prompt fails for three compounding reasons. **Context budget**: instructions paid for on every turn consume budget that cannot be spent on the task, and that cost recurs rather than amortizing. **Instruction dilution**: when SSH recipes, VM provisioning steps, browser flags, and git-hosting notes sit in one undifferentiated block, each procedure becomes noisier relative to the whole and adherence degrades. **Selection accuracy**: with everything loaded, the model re-derives which section applies on every pass instead of being handed an explicit decision point in the form of a written trigger.

The index deliberately does not compress the *how* — only the *what* and the *when*; the *how* is deferred. That split keeps the resident surface from growing with the library's depth: its size scales with the number of capabilities (roughly one line each), not with the volume of procedural knowledge behind them, so a library of dozens of entries can coexist with a nearly constant context footprint. This is a [context engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md) decision rather than a documentation one — the index is a routing table, and routing tables are cheap precisely because they are not the payload.

### Inheriting capability across projects and machines

The plumbing is a single symlink: `~/.pi/agent/AGENTS.md` points at `CAPABILITIES.md` inside a repo called `agent-docs`. Because the harness already reads a global `AGENTS.md` on startup, that symlink alone folds the whole library into the agent's default state — no per-session setup, no copy step, no duplicated instructions per project — and extending or rerouting the library is one edit in one repository, inherited by every agent that starts through that entry point.

The second move carries capability from the machine to the project: individual coding projects' own `AGENTS.md` include a reference to `CAPABILITIES.md`, so a project-scoped agent — which would otherwise know only about that repository — can still reach the Studio, the VMs, the browser, or the personal MCP server. The effect is capability inheritance: a new project starts life already equipped with everything previously set up, while its own `AGENTS.md` stays focused on project conventions. And because the docs live in a git repo rather than in one laptop's dotfiles, the library travels with the developer: the capabilities may be machine-specific, but the knowledge of how to reach them is versioned and reviewable, and the repo — not the machine — becomes the unit of inheritance.

### Compounding infrastructure versus one-off prompt engineering

The post's central claim is that the setup compounds: every time something gets set up, a doc gets written for it, and the agents inherit the capability. Adding one costs a fixed, small amount — write the doc, add a line to the index, commit — while the benefit is inherited permanently by every future session and project. Growth is monotonic in the sense that matters: nothing already in the library has to be re-established or re-pasted for the capability to remain available.

Contrast one-off prompt engineering, still the dominant way of working with agents. A prompt that solves a problem well today leaves behind nothing addressable tomorrow: the knowledge lives in a chat scrollback, bound to a conversation rather than an artifact, and reproducing it means reconstructing context by hand. Prompt engineering optimizes the current turn; a capability library optimizes the reachable set of turns — a stateless expenditure versus an accumulating asset, which is why a prompt collection rots into a folder nobody reads while the library appreciates the longer it is maintained. The index also doubles as an inventory: gaps in the library are visible gaps in what the agent can do, along with stale entries that no longer deserve a line.

### Self-maintenance, trigger metadata, and the harness boundary

The most striking detail is who writes the documentation: the docs are written and updated almost exclusively with AI, and `agent-docs` is itself a purpose-built agent whose job is maintaining the library. This closes a loop — the agent's capabilities are documented by the agent — so marginal documentation cost approaches zero and the library grows at the speed of the setup work rather than the developer's writing appetite. That is what makes the compounding claim credible rather than aspirational.

The failure mode of self-maintenance is drift: a doc explaining how to reach the Studio, written before the Studio was reconfigured, is worse than no doc, because the agent will trust it. The countermeasures implied by the design are structural — keep each doc next to the artifact it describes, keep the index short enough for a human to audit in one pass, and treat a broken instruction as a defect that gets fixed and committed like any other. Capability libraries degrade by lying, not by being short.

Trigger metadata is what makes the index resolvable at all. Each entry states not just a name and a pointer but *when* to reach for the capability — more horsepower, a real Linux box, a public URL, a page needing a visual check. Without that clause the index degenerates into a table of contents the agent has no reason to consult, because nothing in a task description ("I need a stable host for a background service") maps onto a capability name; the trigger is the matching key. This is the same design pressure that shapes tool descriptions in [MCP](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-context-protocol-mcp.md) servers and the description fields of [agent skills](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/skill-engineering-principles.md) — the description is not documentation for humans, it is the selection surface the model reads.

Finally, the library exposes the boundary between *capability* and *harness*. The capabilities are external — a machine, a VM, a browser, a server — but the index, the symlink convention, the project-level reference, and the lazy-loading rule are harness-level artifacts: they shape what the agent knows it can do and how it decides. A capability library is therefore a harness component with an unusually clean interface — a routing table plus a convention — belonging to the same family as [harness engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md): deliberate construction of the environment around the model rather than further tuning of the model, and a small case study in [self-improvement](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-self-improvement-loops.md) bounded by verification rather than autonomy.

## 实践启示

1. **Start with an index, not a manual.** Create `CAPABILITIES.md` where each entry is one line: capability name, trigger, pointer. Resist inlining the procedure — if an entry needs more than two or three sentences, the detail belongs in the linked doc.

2. **Write the trigger before the how.** State the situation that should make the agent reach for the capability ("you need a real Linux box or a public URL") in the index, and put the mechanics (`ssh`, provisioning, flags) only in the doc. A capability with no trigger clause is invisible at decision time, however well documented it is.

3. **Load lazily and pay for context once.** Keep the always-resident surface to the index alone and let each per-capability doc enter context only after the match. Audit the index periodically for entries whose size has crept up — every extra always-loaded line is a recurring tax on every unrelated task.

4. **Wire the index into the harness entry point.** Point the global agent config at the library (in the post, a symlink from `~/.pi/agent/AGENTS.md` to `CAPABILITIES.md`) so inheritance is automatic, then reference the same index from each project's `AGENTS.md` so project agents inherit the tool set instead of re-deriving it.

5. **Version the library in git and keep the setup cost fixed.** Adding a capability should always be the same three steps — write the doc, add a line, commit — so the marginal cost never grows as the library does; a git-hosted repo also makes the library portable across machines instead of trapped in one machine's dotfiles.

6. **Let the agent maintain the docs, but verify them.** Delegating documentation to a purpose-built agent is what makes the library sustainable; pair it with a verification habit — a human pass over the (short) index, and a re-test of any doc whose underlying capability you have touched — because a stale capability doc is trusted by the agent and therefore fails silently.

## 原文存档

→ [原文存档](https://samihonkonen.com/posts/an-agent-capability-library/)

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关: Agent 架构

---

