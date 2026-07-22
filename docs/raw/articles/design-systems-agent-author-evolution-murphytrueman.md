---
source: newsletter
source_url: https://blog.murphytrueman.com/your-design-systems-newest-author-is-an-agent/
ingested: 2026-07-02
type: raw
tags: [design-systems, agent, mcp, figma, storybook, design-md, skill-md, ai-agent, tooling]
sha256: 33e02fb7c70913c791c1f65282f9e95ce75dbfd48994ec5b49d394825c356b3d
---

Title: Your design system has a new author

URL Source: https://blog.murphytrueman.com/your-design-systems-newest-author-is-an-agent/

Published Time: 2026-06-24T22:14:30.000Z

Markdown Content:
Twelve months ago I argued in [Your next design system user is an agent](https://blog.murphytrueman.com/p/your-next-design-system-user) that the next user of your design system would be an agent. The agent I described then was a reader. It would parse your components, inspect your tokens, follow your naming conventions, and produce code that reflected the structure you'd given it. The whole piece was about preparing systems for consumption by machines that would only ever look, never touch.

Now, the agents are writing.

Figma [opened its canvas to agents](https://www.figma.com/blog/the-figma-canvas-is-now-open-to-agents/?ref=blog.murphytrueman.com) on in late March 2026 with the `use_figma` tool in its MCP server, letting supported MCP clients including Claude Code, Cursor, and Copilot create and modify Figma files directly. Around the same time, [Storybook 10.3 shipped MCP for React](https://storybook.js.org/blog/storybook-mcp-for-react/?ref=blog.murphytrueman.com) in preview, giving agents direct access to components, stories, docs, and tests, along with the ability to write new stories and run accessibility tests on what they generated. Google released `DESIGN.md`[as an open specification](https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/?ref=blog.murphytrueman.com) in April, giving teams a portable, machine-readable design specification that agents can both read from and write to. Anthropic [opened its Agent Skills specification](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills?ref=blog.murphytrueman.com) in December last year, with `SKILL.md` emerging as the portable file format most tools now recognise, and skills-based authoring workflows have started appearing across design tooling since.

Figma has since gone further. It [shipped its own agent](https://www.figma.com/blog/the-figma-agent-is-here/?ref=blog.murphytrueman.com) in beta in May, native to the canvas and sitting in the left rail, and [opened it to everyone at Config 2026](https://www.figma.com/blog/config-2026-recap/?ref=blog.murphytrueman.com). The agent also gained skills — reusable instruction packages that carry a team's workflows and conventions — written in-house or shared from a community library. Where `use_figma` lets an external client reach into your files, this one is built into the tool, fine-tuned for design, and positioned as fluent in your components and tokens in ways a third-party agent can't match.

The read-only assumption I started from is no longer the operating model. The direction held up, but what I got wrong was the pace. The systems I described as needing to be 'agent-ready' are now being authored alongside agents.

## What writing actually means

'Agents writing to your design system' covers four cases:

The most visible case is canvas modification: An agent receives a prompt like 'create a settings page using our existing components' and, through `use_figma` or an equivalent tool, places real components on the canvas with the variables applied. The output is a Figma file your team can open, edit, and ship from, rather than a flat image or a static mock-up. The agent is operating inside your system, not generating something that needs to be retrofitted into it.

Token authorship is the second pattern: Through Storybook's MCP server, the official Figma MCP, and community-built tools, agents can now read a tokens file, propose value changes, write the changes back to the variables, and update the documentation in the same session. [Southleft's Figma Console MCP](https://github.com/southleft/figma-console-mcp?ref=blog.murphytrueman.com) was doing this before `use_figma` existed, using a bridge plugin to drive the Figma Plugin API directly. The token system that used to be edited by one designer through a Figma plugin is now edited by an agent following a prompt. The values are the same, the authorship is different.

Then there's documentation: Component descriptions, usage notes, accessibility annotations, deprecation warnings. Agents are writing these now, often in response to code changes that they have also made. Documentation is starting to evolve alongside the system rather than after it, generated in parallel by the same process.

The last case is the agent-facing files: They're starting to be written by agents themselves. [Claude Code's auto-memory](https://code.claude.com/docs/en/memory?ref=blog.murphytrueman.com) writes notes to disk as it works, capturing conventions and patterns across sessions. Skill-creation tools generate `SKILL.md` files from observed workflows. `DESIGN.md` exports can be regenerated from a Figma file via the CLI. The files that tell agents how to behave on your project, the layer I wrote about in [Your design system is fragmenting into agent files](https://blog.murphytrueman.com/your-design-system-is-fragmenting-into-agent-files/), are becoming authoring surfaces for the agents they instruct. The system describes the agent and the agent edits the system in the same loop, which means the line between governance and execution is no longer where it used to be.

What the four cases share is a compression. Design systems have always sat between intent and implementation, with a human doing the translation work in the middle. Agents are removing the translator. The same system that describes a component can now produce it, test it, and document it, which means the contracts your system makes start carrying weight they didn't have to before. The system becomes both more useful and more fragile in the same gesture.

## 💌

Subscribe to receive articles directly in your inbox

## What this breaks

Most design system governance models assume human authorship — the designer drafts the component, the design system team reviews it, a code owner approves the implementation. The documentation gets updated by whoever notices the divergece. Each step has a known author and a known reviewer.

Agent authorship doesn't necessarily break this model, but it does stretch it in ways the model wasn't built to absorb. When an agent writes a component variant into a Figma file, the review step that used to sit between a change and what ships isn't obviously anyone's job any more. The same is true of a token value it moves across three platforms, or the accessibility annotations it applies to a whole library in one pass. Ask who signed off and the answer at most teams I talk to is 'whoever happens to look at the next PR'. That's hope dressed up as a review process.

A native canvas agent widens this. When the agent sits in the left rail, the author isn't always someone on the design system team. A product manager exploring a layout or a founder sketching a flow is editing the same file your system lives in, and a capable agent will make the change look right even when it isn't.

The review problem is load-bearing. The other problems are real, but mostly downstream of it. If you can't review agent output at the pace it's being produced, the rest of the governance model loses its grip. The system starts to slip faster than the team can catch. You find out months later, when someone asks why the spacing scale has three values nobody remembers adding.

Traceability is often the next thing to break — most systems track what changed better than why it changed, and that gap starts to bite once the author is probabilistic. A token value moves from `16px` to `20px` , a component variant is added with slightly different padding, an accessibility annotation is applied to forty components. Each change is recorded somewhere, but the reasoning behind each one lives only in the prompt and the model's response, neither of which is durable. A Git commit history reads like a human account of why, written by someone who anticipates needing to answer for it later. An agent's prompt history is closer to a black box — transient by the end of the session, attached to a justification the model produced to sound plausible. Provenance becomes harder when the contributor is generating its own justifications on the fly.

I argued a year ago that documentation should be machine-readable so agents could parse it. And that's still true. But what I didn't see was that documentation would also become a write target — your component descriptions are now read by agents and written by agents, often in the same session, and often without a human in the loop (for good or bad). The version of your design system that exists in your documentation tool has become a living artefact, edited by multiple authors, some of whom are not people. For my part, this is the loop I'd be slowest to take humans out of — products, interfaces, and experiences get their individuality from human judgment, and that judgment is not something an agent can supply by keeping the prose up to date.

## What teams who are ready look like

A few patterns show up in the teams that adapted earliest. None of them are surprising in retrospect, but their absence tends to predict trouble.

Their tokens are versioned. A JSON file on its own doesn't always cut it — the ones that are most likely to stand the test of time have deprecation policies, migration paths, and a clear answer to what happens when an agent proposes a value change. The token system is treated as an API rather than a configuration file, with all the discipline that implies. In practice an agent's proposed value change lands as a pull request against a versioned token file. It picks up a reviewer and a changelog on the way in, instead of changing a variable in place where nobody is watching. I wrote about this layer in [Your tokens have become infrastructure](https://blog.murphytrueman.com/your-tokens-have-become-infrastructure/) and the argument has only sharpened since.

Once an agent is writing, the component description is the spec it builds from. That's the same agent-readability point from before, except there's more riding on it now. A description that only captures how a component looks gives the agent nothing solid to author against, so it works from the rendering and gets it wrong. Teams that wrote their descriptions around purpose back in 2025 are the ones whose agents now produce something usable instead of something plausible.

Documentation is now both a read target and a write target, so it has to be as legible to a parser as to a person. That means machine-readable structure alongside the prose, whether that's YAML frontmatter, JSON token blocks, or whatever the format-of-the-week happens to be. Treating it as either-or no longer works.

Someone owns the review of agent-written work before it ships — it's not always a human checking everything, though it can be. Sometimes the test suite catches the structural regressions and a person takes the rest. Sometimes a senior designer batches every token change into a weekly pass. The shape varies. What matters is that the review has an owner at all.

If you want a sense of where your own organisation sits against these, I've put together a checklist at [designsystemsforai.com](https://designsystemsforai.com/?ref=blog.murphytrueman.com). It's the work I keep returning to when teams ask me what 'AI readiness' actually means for a design system, and it's been updated this year to account for the write-to-canvas reality rather than the read-only one.

## The thing I underestimated

I'm not going to pretend I predicted all of this. The reading claim held up, roughly on the 12 to 24 month timeline I gave it. But authorship arrived before reading had even fully landed, and the gap closed faster than I expected. What I'd write differently today is how much agent-readiness keeps moving — each phase asks something different of the system, and the systems that handle it are the ones that kept adapting.

I argued for agent-readable systems. I underrated how much harder it is to build one that survives being written to.

* * *

Thanks for reading! If you enjoyed this article, subscribing is the best way to keep up with new posts. And if it was useful, passing it on to someone who'd find it relevant is always appreciated.

You can find me on [LinkedIn](https://linkedin.com/in/murphytrueman?ref=blog.murphytrueman.com), [X](https://x.com/murphytrueman?ref=blog.murphytrueman.com), and [Bluesky](https://bsky.app/profile/murphytrueman.com?ref=blog.murphytrueman.com).

