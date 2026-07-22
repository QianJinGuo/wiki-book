---
title: How to Avoid AI Code Slop
source: newsletter
source_url: https://newsletter.eng-leadership.com/p/how-to-avoid-ai-code-slop
fetcher: jina
tags: [eng-leadership]
created: 2026-05-19
updated: 2026-05-19
sha256: 0689f0c9d85ac0f7
---
# How to Avoid AI Code Slop
Published Time: 2026-05-17T16:50:06+00:00
Markdown Content:
[![Image 1](https://substackcdn.com/image/fetch/$s_!-moc!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcf9c3791-15cb-4c85-9b50-c90eefeb0cfd_1600x578.jpeg)](https://substackcdn.com/image/fetch/$s_!-moc!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcf9c3791-15cb-4c85-9b50-c90eefeb0cfd_1600x578.jpeg)
This week’s newsletter is sponsored by **[Larridin](https://larridin.com/developer-productivity?1)**, an AI-native developer intelligence platform.
**Measure AI’s impact on engineering.**
Claude writes code 10x faster than a human. So why is engineering productivity up 20%, not 200%?
[![Image 2](https://substackcdn.com/image/fetch/$s_!W-u3!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6e9c2031-8b7c-48c8-ac3e-ae857c6beecb_2048x737.png)](https://larridin.com/developer-productivity?2)
Engineers spend only 30-40% of their time actually coding. The rest goes to deployments, sprint planning, admin overhead, support questions, design reviews, incident response, and everything in between.
Until now, we’ve had no way to map and measure where that invisible work actually goes. Larridin changes that. Mapping how engineering work flows across your org, surfacing the blockers and friction that drag on productivity, and showing you exactly what to fix.
[Larridin](https://larridin.com/developer-productivity?3) delivers complete 360° developer intelligence for AI-native engineering teams. From traditional developer productivity metrics to AI-era measures like Agent Effectiveness scores.
[Unlock AI-native engineering potential](https://larridin.com/developer-productivity)
Thanks to Larridin for sponsoring this newsletter, let’s get back to this week’s thought!
In a previous article, I mentioned that [code review is the new bottleneck for engineering teams](https://newsletter.eng-leadership.com/p/code-review-is-the-new-bottleneck). The reason is that these days, we are able to generate code faster than ever with AI.
But the problem is that we can’t review the code fast enough, so the review process is the new bottleneck. And for that reason, a lot of teams are trying to find the right balance between these 2 options:
1.   Block the progress by doing great human code reviews and ensuring that the quality remains high
2.   Rely just on AI code reviews and/or doing shallow human code reviews
> The issue here is that there’s no industry-wide agreement on how to scale the code reviews in a way that would support the speed of generation of the newly created code, without generating bad code, e.g. “AI code slop”.
Lucky for us, Ankit Jain, CEO, Aviator, is our guest author for today’s article. He will be sharing his recommended solution.
Let’s introduce our guest author and get started.
[Ankit](https://www.linkedin.com/in/ankitjaindce/) is a cofounder and CEO of [Aviator](https://www.aviator.co/). Previously, he led engineering teams at Sunshine, Homejoy, and Shippo, and was also an engineer at Google and Adobe.
[![Image 3](https://substackcdn.com/image/fetch/$s_!ereg!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb40c2c56-3d02-4826-848a-4a5e3110d079_1678x940.jpeg)](https://www.linkedin.com/in/ankitjaindce/https://www.linkedin.com/in/ankitjaindce/)
He also leads [The Hangar](https://dx.community/), a community of senior DevOps and senior software engineers focused on developer experience. Today, he is sharing with us his take on how to avoid bad AI-generated code output, e.g., “AI code slop”.
Over to you, Ankit!
This article is a follow-up to [How to Kill the Code Review](https://www.latent.space/p/reviews-dead), which argued that traditional code review is no longer a viable quality gate in an AI-accelerated software development life cycle.
_The natural next question is, if not code review, then what? What should be the alternative?_
This article is the practical answer.
Velocity charts look great. PRs are merging faster. If you only look at the code written, the numbers tell a story of AI accelerating output. But behind those metrics, engineering teams are accumulating a new kind of technical debt.
> Those PRs are either sitting unreviewed for days or are being _rubber-stamped_ because no engineer has time to carefully review 500-line diffs.
[![Image 4](https://substackcdn.com/image/fetch/$s_!IAdp!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc0ea6097-41b9-4063-927b-13e6718dfa95_1600x656.jpeg)](https://substackcdn.com/image/fetch/$s_!IAdp!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc0ea6097-41b9-4063-927b-13e6718dfa95_1600x656.jpeg)
I am not saying engineering teams should go from reviewing every line of code to nothing. I’m advocating for moving the approval gates upstream to prevent what I call the “AI slop” code. Code that compiles, passes basic checks, and looks plausible but is subtly wrong.
Now, let me share in more detail where AI-generated code goes wrong, even without “looking wrong”.
1.   **Plausible but incorrect logic**
The most dangerous variety. The code reads right and has correct syntax, but the logic is wrong. These bugs are difficult to catch in review because they require understanding what the code was supposed to do, not just what it does.
1.   **Over-engineering**
AI models are trained on vast bodies of code that include enterprise patterns, framework abstractions, and production-hardened architectures.
[![Image 5](https://substackcdn.com/image/fetch/$s_!ebph!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe8dddbca-487f-4ccb-a399-e1ac50e8792e_1000x410.jpeg)](https://substackcdn.com/image/fetch/$s_!ebph!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe8dddbca-487f-4ccb-a399-e1ac50e8792e_1000x410.jpeg)
Asked to solve a problem that genuinely needs 15 lines, a model may produce a 200-line abstraction layer that anticipates a generality nobody asked for.
1.   **Convention blindness**
Models generate good generic code, not code that fits your system. Your repo has conventions around naming, error handling, logging patterns, and module boundaries.
AI frequently ignores them, not because it can’t learn them, but because it hasn’t been told about them in the prompt.
1.   **Hallucinated APIs and deprecated usage**
Models confidently invoke methods that don’t exist, reference config options that were removed two versions ago, or call internal APIs that aren’t accessible in the current service context.
These errors are sometimes caught immediately, and sometimes only in production.
1.   **Defensive overreach**
Excessive try-catch blocks, silent error absorption, redundant logging. The code handles failure gracefully in the sense that it swallows it silently, making debugging substantially harder.
1.   **Cargo-cult patterns**
Copies patterns without understanding why, like retry logic in a context where retries make no sense. Circuit breakers for calls that are always synchronous. Error handling that looks thorough but doesn’t map to actual failure modes. The pattern is there; the reasoning behind it is not.
> The common thread is that slop passes the eye test. It looks like real code. That’s precisely what makes it dangerous at scale.
Code review was designed for a different world.
AI-generated PRs are different in kind, not just in scale. When a human writes code, intent travels with the author through the review process.
They can explain the tradeoffs they considered, the alternatives they rejected, and the constraints they worked within. Even unwritten, that context is accessible.
When AI writes code, intent may exist in a prompt that was never saved, a ticket that doesn’t capture the decision-making, or only in the engineer’s head. The implementation is preserved; the reasoning behind it is not.
Tests catch less than we assume.Automated testing is necessary but not sufficient. Tests verify behavior within the scope of what the test author thought to test.
AI-generated code introduces failure modes that are, by definition, unanticipated because if the engineer had anticipated them, they would have specified them in the prompt.
> You cannot write tests against requirements you didn’t know to articulate.
[![Image 6](https://substackcdn.com/image/fetch/$s_!qVa7!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc4d77f89-0777-4ebb-97c2-a88fa9b868a6_1600x663.jpeg)](https://substackcdn.com/image/fetch/$s_!qVa7!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc4d77f89-0777-4ebb-97c2-a88fa9b868a6_1600x663.jpeg)
The concept of formalizing intent before implementation isn’t new. Behavior-Driven Development, Test-Driven Development, and Design by Contract all attempt to define behavior in a structured, human-readable form before any code is written.
These approaches were often perceived as overhead. Under delivery pressure, they got skipped. AI makes them practical in a way they were never before.
AI can help generate structured acceptance criteria, specs, and contract-like descriptions from a brief. It can also verify output against them. The overhead objection disappears when the spec itself is AI-assisted.
At Aviator, we recently ran an experiment to test [the intent-driven verification approach](https://www.aviator.co/blog/what-if-code-review-happened-before-the-code-was-written/). With the main question we wanted to answer:
> What if the review happens before the code is written?
The team implemented a medium-scoped, full-stack feature. A hierarchical, per-repository configuration system, with zero manually written application code.
Everything was guided by a spec reviewed and agreed upon by the team before a single line was generated.
It spanned the full stack, including a database model and migration for config history, a schema/validation layer, a resolution engine that merges repo and global configs, a GraphQL API (types + mutation) for reading and updating configs, integration of the resolved config into all runtime subsystems (sandbox provisioning, CI handling, code generation, chat processing, persona selection), and a frontend settings page with a config editor, change history view, and source indicators showing where each setting originates.
The kind of feature that, done conventionally, would generate dozens of review comments across multiple PRs.
The spec was generated collaboratively: a scaffolding PRD was fed to Claude Code, which was instructed to ask clarifying questions that were answered synchronously by the team.
The resulting spec was reviewed at two levels.
1.   **The first was implementation details**
Specific UI component choices, input validation requirements, performance strategies like Redis caching for config lookups.
These are the kinds of concerns that normally surface during code review, not spec review.
1.   **The second was scope and completeness**
The team caught a missing UX requirement, questioned whether a persona’s feature was well-defined enough to include, and flagged places where the spec text was out of sync with the actual design (e.g., referencing a table that didn’t exist).
These are decisions that, if deferred to post-implementation review, would require rework. The spec review took about 10 hours of engineering work across multiple engineers.
It produced 14 acceptance criteria with 65 checkable items. It also produced a document that could serve as a document against which the code could be verified.
We used Claude Code to implement the spec. The agent decided to split the implementation into four phases:
1.   Foundation,
2.   Backend core,
3.   Integration, and
4.   Frontend.
The whole implementation consisted of around 6k lines of code, with 40% app code, 40% tests, and 20% GraphQL auto-generated files.
It’s worth noting that no explicit instruction to write tests was given in the specification, which suggests the agent’s strategy for meeting the acceptance criteria was to write tests.
A second agent then verified the 65 acceptance criteria against the resulting PRs.
This took six minutes and produced a structured report with file references and explanations for each item:
*   60 passed,
*   4 failed, and
*   1 partial.
A human doing the same verification thoroughly would have needed hours.
Human reviewers left an average of 10 comments per PR. Few bugs were found, with the major one being a stale editor state. Code review caught convention-level issues such as import placement, enum duplication, and naming patterns.
This was an expected outcome. Spec review catches design-level issues like missing requirements, underspecified features, and scope questions.
Code review catches convention-level issues, the things that require familiarity with your specific codebase. Both layers are necessary because they catch different things.
We’re still learning how to write specs that are precise enough for agents to implement reliably but flexible enough that the team doesn’t spend more time specifying than they would have spent coding.
> Engineers tend to stress too much about what a spec should be and the overhead of writing it.
If we think about writing a spec simply as writing a JIRA ticket, that stress can go away. For a simple issue, a single-line intent or what you’d write in a ticket could be a sufficient spec detail, and acceptance criteria can be generated by AI.
Our experiment worked well enough to change how we think about verifying AI code and preventing code slop.
The following practices are not a complete methodology. They’re a set of concrete interventions that teams can adopt incrementally, starting where they have the most pain.
1.   **Scope AI tasks tightly**
Large, open-ended prompts produce the most slop. ‘Build this feature’ hands the AI too much latitude.
Well-scoped tasks with clear boundaries: a specific function, a defined API surface, or a constrained refactor, produce way better output and are significantly easier to verify.
This is counterintuitive for teams that see AI’s value in handling large tasks. The value is there, but it works better when large tasks are decomposed into smaller, well-specified subtasks with explicit checkpoints between them.
It’s no different from how we humans work better.
1.   **Make intent a first-class artifact**
Before any code is generated, the intent should be written down in a form that can be reviewed and approved. This doesn’t require a formal methodology. It requires the habit of documenting the what before generating the how.
Acceptance criteria can also be written by AI. Intent is really hidden in the prompt conversation that the user is having with AI (the decision tree) or the details a user may be adding in the ticket.
At the more rigorous end, it means BDD-style specs or contract-like descriptions that can be used to verify output.
The exact format matters less than the discipline of capturing intent explicitly. Again, I’m not trying to add overhead and invent new documents to write. We already do a pretty good job of expressing intent when prompting LLMs.
In practice, that would most probably look like a lightweight spec template for AI-assisted work.
Two to three sentences on scope, a list of acceptance criteria, and a note on what’s explicitly out of scope. Make it a PR requirement. That, again, can be generated by AI.
1.   **Review intent before implementation**
For any AI-assisted task above a certain complexity threshold, require spec approval before code generation begins.
> The most expensive review is the one that happens after the code exists.
When a design decision is caught in a spec review, fixing it is a sentence change. When it’s caught in code review, it may require significant rework.
Teams that shift review earlier, approving specs before generating code, front-load the high-value decisions and leave code review to do what it’s actually good at: catching implementation-level issues.
1.   **Automate what you can**
Tests, linting, and type checks catch surface-level slop, and you should absolutely not skip those. As I said in my piece, trust is layered when it comes to AI code. We stack imperfect filters until nothing comes through.
1.   **Build and maintain a team slop register**
Every codebase has patterns that AI consistently gets wrong. Maybe it’s a specific error-handling convention, a naming pattern, a module boundary that gets violated, or a library the AI prefers that you’ve deprecated. These are knowable and preventable.
A slop register serves two purposes: feeding these patterns back into prompts (to prevent them from occurring) and informing CI checks (to catch them when they do).
The most common pushback against spec-first workflows is that they’re slower.
Writing specs takes time. Getting them reviewed and approved takes time. And engineers who are already productive with AI tooling don’t want to slow down.
It may seem that this intent-driven verification adds process, but we are just changing the ways of working that we’re used to. The tools aren’t ready. The organizational structures aren’t ready. We are in transition.
If your team is early in this process, the most valuable first step is usually the simplest one: require capturing the intent from prompts for any AI-assisted task above a defined complexity threshold.
The format doesn’t have to be perfect and rigidly defined at first. A few sentences on scope, a short list of acceptance criteria, and a note on what’s out of scope.
From there, introduce a spec review as a step before code generation. Add the slop register. Build toward automated verification against acceptance criteria.
The full workflow takes time to establish. But each step in that direction improves the signal-to-noise ratio of what ends up in the codebase, and makes the AI investment return what it’s supposed to return.
Special thanks to Ankit for sharing his insights on this important topic with us! Make sure to check out [Aviator](https://www.aviator.co/), they are building a lot of cool stuff there, highly relevant for building engineering teams in the AI era.
Liked this article? Make sure to 💙 click the like button.
Feedback or addition? Make sure to 💬 comment.
Know someone that would find this helpful? Make sure to 🔁 share this post.
*   Join the Cohort course Senior Engineer to Lead: Grow and thrive in the role [here](https://maven.com/gregor-ojstersek/senior-engineer-to-lead?promoCode=ENGLEADERSHIP).
*   Interested in sponsoring this newsletter? Check the sponsorship options [here](https://calico-cabinet-fbf.notion.site/Sponsor-Engineering-Leadership-fa0579535d6f4422a6da350580a54546).
*   Take a look at the cool swag in the Engineering Leadership Store [here](https://store.eng-leadership.com/).
*   Want to work with me? You can see all the options [here](https://calico-cabinet-fbf.notion.site/Work-with-Gregor-Ojstersek-1147b66fdc24809b86b1fb0467b60318).
You can find me on [LinkedIn](https://www.linkedin.com/in/gregorojstersek/), [X](https://twitter.com/gregorojstersek), [YouTube](https://yt.openinapp.co/exgpd), [Bluesky](https://bsky.app/profile/gregorojstersek.bsky.social), [Instagram](https://www.instagram.com/gregor_ojstersek/) or [Threads](https://www.threads.net/@gregor_ojstersek).
If you wish to make a request on particular topic you would like to read, you can send me an email to info@gregorojstersek.com.
This newsletter is funded by paid subscriptions from readers like yourself.
If you aren’t already, consider becoming a paid subscriber to receive the full experience!
[Check the benefits of the paid plan](https://newsletter.eng-leadership.com/about#%C2%A7paid-subscribers-get)
You are more than welcome to find whatever interests you here and try it out in your particular case. Let me know how it went! Topics are normally about all things engineering related, leadership, management, developing scalable products, building teams etc.