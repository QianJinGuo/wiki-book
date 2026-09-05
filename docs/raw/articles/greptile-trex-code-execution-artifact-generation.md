---
source: newsletter
source_url: https://www.greptile.com/blog/trex-code-execution
ingested: 2026-06-18
sha256: 6500ceee60897e8be1ed4439190bcc4b49c8c10903d5f2226bbdfb8bbae0ebda
---


# Building TREX: Code execution and artifact generation for AI code review

Title: Building TREX: Code execution and artifact generation for AI code review

URL Source: http://www.greptile.com/blog/trex-code-execution

Published Time: 2026-06-17

Markdown Content:
I'm Shlok, a software engineer at Greptile. We recently built a code reviewer that, in addition to reviewing pull requests, actually runs the code and shows you what went wrong.

In 1976, Michael Fagan published [a paper](https://ieeexplore.ieee.org/document/5388086) introducing formal code inspection at IBM. Developers would print out listings, sit in a room together, and read through the code line by line.

Today we still read a diff on a screen. AI tools have made that faster, though most of them are still just reading the code. This approach works for a lot of bugs, the ones that announce themselves plainly in code.

The problem is there's a whole category of bugs that don't show up in code at all; they exist when the program is running. Think of the logic error that needs a specific sequence of state, the UI regression that appears after the page loads, or the race condition that needs a real request. You can read the diff perfectly and still miss these types of bugs completely.

Static code review has a ceiling. It can reason about what the code says. It can't tell you what it does. [TREX](https://www.greptile.com/trex) (which stands for "Test, Run, Execute") is Greptile's response to that ceiling: an execution layer built directly into code review.

## Orchestrating agents without wasting context

TREX started as a completely separate product from Greptile, as a standalone agent that generated and ran tests. We hoped that bugs would surface as a result. They didn't. Generating tests wasn't the same activity as finding bugs. When the separate TREX agent tried to write tests, the tests weren't relevant to what the user was trying to do. This created unnecessary noise, and it also missed edge cases. This sounds obvious in hindsight, but it took us more time than expected to learn this lesson.

We'd built these agents to be separate with the assumption it would give each agent its own context window. It also meant both agents ran separately without sharing knowledge. They often overlapped, exploring the same parts of the codebase twice without either agent knowing what the other had already found, ultimately leading to wasted compute.

The obvious fix seemed like combining them into one agent. We tried that, and ran into a different problem: a single agent handling the full review got overloaded. Between spinning up services, taking screenshots, running tests, there was too much context for one agent to manage cleanly.

The solution was to make TREX share the same context as the main [Greptile reviewer](https://www.greptile.com/agent) rather than having it exist entirely as a separate product. It was the first time we were managing agents from within an agent. Unlike two independent agents, this means TREX doesn't start from scratch. It inherits what the Greptile reviewer agent already found, has its own context window, and is scoped to the specific problem it's been asked to investigate.

The Greptile reviewer agent acts as an orchestrator. It reads the diff, identifies issues worth investigating, and spins up a dedicated TREX agent per issue, all running in parallel. The TREX agents have the liberty, the compute, and the knowledge of the orchestrator agent.

A good example of this is a UI feature hidden behind an auth gate. Testing it locally means setting up the environment, handling authentication, getting the feature flag in the right state. A subagent figures all of that out on its own and comes back with a screenshot of the rendered feature.

![Image 1: Architecture diagram showing before and after: standalone agent reviewing a PR versus orchestrator agent spawning parallel TREX subagents with sandboxed execution and artifact output](https://www.greptile.com/blog/trex-code-execution/orchestrator-architecture.png)

The first version of TREX output findings as bullet points listing out what was tested and what happened. This was a reasonable starting point, but it didn't provide sufficient information.

An agent or a human reviewer reading a bullet point like, "Tested the checkout flow, found failure" wouldn't find it very useful. They wouldn't be able to tell where in the process something went wrong. If the test failed, was it the setup? The assertion? An environment issue? We found an early version of the agent would sometimes hallucinate about how thoroughly it had tested something, claiming to have tried something it hadn't. Bullet points gave us no way to verify.

The fix was to back the bullet point list with a multi-modal artifact set for each TREX finding: screenshots, logs, API traces, execution scripts. Each modality covers a different part of the story. Having a comprehensive picture of everything that was tested for a specific issue is what actually matters.

The first artifact that made us say "Wow" was video. If you push an animation change, TREX captures a video of it playing. You can see exactly what the animation looks like without opening a local environment.

Artifacts also need to be trustworthy. Every artifact has to give the reviewer enough to verify the run themselves. The screenshots, logs, traces, and scripts are all there so a person or downstream agent can look at exactly what happened and confirm it. Bad evidence is worse than no evidence.

The reason artifacts matter, especially for agents downstream, is the same reason teachers require students to show their work. It's analogous to grade school math; you don't know where your answer was wrong until you show the steps. Agents are the same way. If an artifact shows proof of everything the test did to reach a conclusion, the agent can identify exactly which step went wrong. Without that trace, all it has is the answer, and the answer tells you nothing about where to fix it.

If TREX finds a bug, it becomes a comment on the PR. If it runs a feature and everything works, that goes in the summary as proof the change was actually tested. Not every run needs to find something wrong to be useful.

![Image 2: Diagram showing a single TREX finding mapped to its artifact set: issues are sent to TREX subagent sandboxes, which output findings paired with evidence including logs, screenshots, and video](https://www.greptile.com/blog/trex-code-execution/artifact-pipeline.png)

The frontier race between model providers moves fast. A model that leads on code tasks one month can be behind the next. Building tightly around any single provider's API means rebuilding when rankings shift. That's not a viable long-term strategy.

From the start, we designed TREX around a model-agnostic harness that allows hot-swapping between frontier models without rebuilding. The flexibility goes deeper than most people expect: the main agent and the subagents can use different providers. We can have multiple models running within the same review. This makes it easy for us to pick the best model at any given point, based on internal evals.

Our current evaluation involves measuring recall (e.g., how many real bugs are caught, measured against open-source PRs or customer data where comments were addressed) and precision (e.g., consistency across runs: if you review the same PR twice, are you finding roughly the same set of issues?).

We intentionally deprioritize latency in our evaluation. A developer waiting on a review would rather wait a little longer and get something accurate than get a fast answer they can't trust.

The open source evaluation harness we use performs on par with native provider harnesses. There's no meaningful quality penalty for being model-agnostic which, if you'd asked me to guess before we tested it, I wouldn't have been confident about.

TREX's differentiation is not which model it's running. It's the infrastructure around the model: the codebase indexing, the orchestration, the artifact