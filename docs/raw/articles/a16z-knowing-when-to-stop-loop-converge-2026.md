---
source: newsletter
source_url: https://a16z.com/knowing-when-to-stop-the-art-of-making-a-loop-converge/
ingested: 2026-08-08
sha256: 8ec8f82b88905180a77be398963962f08a7dfd703ae1130293520c5ae0d44696
review_recommendation: reject-as-supplementary
raw_status: rejected-but-archived-for-supplementary-update
supplementary_target: entities/anthropic发布循环设计指南权威拆解当下最火的ai新范式loop
---

# Knowing When to Stop: The Art of Making a Loop Converge

Infra — Yoko Li (a16z partner, developer tools/infrastructure/AI/creative tools) — Posted August 6, 2026

How can an AI model know when its work is done? Well, how does a human know when our work is done. A programmer waits for the tests to turn green or waits for PR review. A designer adjusts a composition, steps away, returns, and decides the remaining imperfections no longer matter. "Done" is rarely a property of the work itself. It is a judgment produced by the system around the work. Humans do not possess a universal detector for "done". We rely on a patchwork of signals like tests, specifications, precedent, approval, deadlines, risk, and finding that point of diminishing returns. Completion comes from outside the work itself.

## The Model that Could Continue Forever

An AI model can almost always produce another answer. It can revise the paragraph again, try another implementation, generate another image with more detail. It does not become tired of the work. It does not notice, unless we give it some way to notice, that the last three revisions made the result different but not necessarily better.

This is part of what makes loop engineering so compelling. Instead of a human prompting a model, inspecting the result, describing what went wrong, and prompting it again, we can ask the system to perform the whole cycle itself. The agent discovers the work, gives it to the model, checks the result, and decides what should happen next. (Quote: Peter Steinberger — "You shouldn't be prompting coding agents anymore. You should be designing loops that prompt your agents.")

However, the nuance when writing a loop is that **the loop is only as good as the verifier at each step**. Even before loop engineering, everything already ran as a loop, just with a very expensive tool call — human hand prompting and serving as the verifier. When taking humans out of the loop, designing what should be verified in each step becomes the key in advancing the loop state.

Take the standard coding-agent loop: keep working until the tests pass. It sounds almost perfectly verifiable. But the tests are only a proxy for the task. In SpecBench, frontier agents routinely passed the visible tests while failing held-out tests that exercised the same features together. One agent produced a 2,900-line "compiler" that simply memorized the test inputs. The loop converged, but just on the verifier, not the user's intent.

**The verifier is not just the stop condition. It also defines what the loop treats as progress.** If the signal is incomplete, the loop can get better at passing the check without getting better at the task. Loop engineering is not the practice of making an agent retry. It is the practice of making each cycle reduce the distance between the current state and a desired state.

## The Loops that Converged

The first loops that worked well were coding loops. Code is both editable and executable. An agent can change one function, run the program, read the test failure, and try again. The environment returns a relatively clear signal about what broke. The loop has both a precise way to act and a verifier that can measure progress.

Similar pattern in visual code generation: an SVG contains paths, shapes, text, gradients, layout; a Blender scene contains geometry, materials, cameras, joints, constraints. These representations give an agent something it can inspect and edit locally. If one curve is wrong, change the path. The artifact can improve across iterations instead of being regenerated from scratch.

But editability is only half of the problem. In open-ended image generation, another iteration often means generating another sample and choosing the best one. The feedback is global, and it is hard to map "this looks worse" to one precise edit. SVG and Blender loops can converge when the target can be expressed as a reference, geometry, constraints, or functional behavior. Visual loops are not impossible. They are often extremely hard to verify.

## The Conditions of Completion

Based on many conversations with engineers and researchers across several domains, four things are needed for a loop to converge:

1. **A target state** — a representation of what "done" means. For code: test suite, spec, performance constraints. For SVG: reference image, dimensions, colors, layout rules. "Make it better" is not a target state. It is another prompt.
2. **An observable current state** — files, diffs, test results, traces, DOM tree, SVG structure, Blender scene graph. A rendered output alone is often not enough; the system needs to see the underlying structure to identify where the error came from.
3. **A precise way to make changes** — change the part responsible for the error without regenerating everything else. The more local the edit, the more likely the loop preserves what already works. In practice this is the part people struggle with: the loop started working when they found the right set of tool calls and intermediate prompts. Right now no one knows in advance; it is mostly trial and error.
4. **A stopping rule** — a condition from outside the generator: tests passing, constraints satisfied, a score crossing a threshold, or a reviewer approving. The stop condition also needs to account for cost — a loop that reaches the right answer after 500 attempts may converge technically but not economically.

**Uncomfortable implication: a loop is tuned to its stack.** The tool calls that made a loop converge on one codebase encode assumptions about that codebase. Bespoke loops do not generalize for free. Some people found magical loops that worked for them; others find publicly published loops do not work at all.

Useful framing: two axes — how editable the artifact is, and how verifiable the result is. Code sits upper-right (easy to edit, strong verifiers). Open-ended image generation sits bottom-left. **The position of a task can move by reframing the problem**: an open-ended image represented as SVG paths or a Blender scene becomes editable — the task moves up. Give it a reference image or constraints, and progress becomes verifiable — the task moves right. This is another way to describe loop engineering: not making the agent retry more, but **re-representing the task until it sits in the quadrant where loops converge**.

## Loops are Discovered Before They are Engineered

Interviews with programmers across domains (software engineering, visual/creative tasks, video editing) — how did you know the loop would converge? Today's process of discovering a working loop takes a lot of trial and error: providing the right tool calls, leaving the loop running for hours to see if it improved, replicating specific workflows. Discovering loops that work everywhere is hard — almost like encoding human knowledge into the loop itself. Finding a loop is only the upfront cost. Running the loop is the major cost that comes with every development cycle.

## The Economics of Loops

The simplest loop is /goal [condition] — keep going until the condition is met. "Eventually" is the problem: would you run 20 iterations or 500? The loop does not know, and neither does the human at kickoff.

The shape of the curve: across almost every study of test-time compute, **returns are logarithmic** — each additional increment of quality costs exponentially more attempts. One web-agent benchmark: going from 1 sample to 10 lifted success from 38.8% to 43.2%; doubling again to 20 bought 0.2 more points for twice the tokens. Past the plateau, the marginal iteration can turn negative: reasoning models given larger budgets start abandoning answers that were already correct.

Yoko Li's own test of Anthropic's loop-engineering post: on a deliberately broken page (Lighthouse 35), Claude Code cleared 98 on the very first try for $0.35. So she made the goal unreachable: same page behind 2.2 seconds of artificial latency capping the score around 89, asked for 100. The first $1.40 of spend took the score from 26 to 89. The remaining $2.84 — 67% of the total bill — bought exactly zero points: turn after turn of re-minifying HTML and re-running Lighthouse against a bottleneck the agent couldn't change. The loop's escape hatch is unreliable: Claude correctly diagnosed the latency ceiling and declared the goal impossible around try 5, but the evaluator model bounced it back 14 times anyway. (All code and traces: github.com/ykhli/goal-loop-traces)

**The lesson isn't that loops don't work; it's that they have no idea how to stop.** All the value landed in the first third of the spend, but the loop continued, burning tokens for an impossible task with marginal return. Stopping well isn't something one can prompt into existence. It takes infrastructure: something to meter the spend, something to measure progress against it, and something with enough information to cut the loop off.

## The Stack for Loop Engineering

Once the loop becomes the unit of engineering, models and developers need infrastructure at every layer: an environment for the agent to act, a place to keep long-running state alive, a way to verify the work or close the loop, and a surface where humans steer. A stack has already formed around each category.

## Inference Time vs Training Time Loops

At inference time, the loop changes the work, not the model. The agent writes code, runs verifiers, reads the result, and tries again. Its weights stay fixed — searching for a better answer within one task leveraging test-time compute.

At training time, the process is RL: run many trajectories, score the outcomes, update the model so rewarded behavior becomes more likely. **The same rule applies in both cases: the loop is only as good as its verifier.** In an agent loop, that verifier might be a test suite. In RL, it is the reward signal. Sometimes the two are the same.

The two loops can feed into each other: inference-time runs produce traces of what worked, what failed, which corrections led to success. Those traces can become training data, preference pairs, or rewards. But not every failure should be solved through training — often the higher-leverage fix is outside the weights: a better tool, clearer state, a more precise action space, or a stronger verifier.

## Future Implications

Today, most agent infrastructure and harnesses can help us run loops. The harder problem is finding a loop worth running, and finding the point before diminishing returns.

Two things seem clear: (1) **the economics will have to become explicit** — cost per iteration, progress per dollar, a curve someone can see while the loop is still running; (2) **for the loops that already converge, the interesting infra work has moved out of the loop** — the loop itself is a while-statement and everything that makes it converge lives around it: the environment, the state that survives a long run, the verifier that decides what counts, the surface where a human steps in. Every working loop took a stack like this to build, and the stack is where differentiation actually sits.

So how does an AI model know its work is done? For now, it doesn't. It stops when the budget runs out or when a check we designed says enough, and both of those need to be built. The systems that matter will not be the ones that can keep going. They all can. They will be the ones whose builders decided, precisely and in advance, what done costs and what done means.