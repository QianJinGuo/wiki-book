---
title: "Backpressure is all you need"
source_url: https://www.lucasfcosta.com/blog/backpressure-is-all-you-need
source: newsletter
created: 2026-06-01
updated: 2026-06-01
type: article
tags: [newsletter, article]
sha256: 68a5f82334ec1dea
---

# Backpressure is all you need


Markdown Content:
There are two _obvious_ ways to use coding agents. Both are bad.

The first is to let the LLM run unattended and hope the repository survives. This is fast, exciting, and stupid. It leads to bugs, confused changes, and a flood of PRs that humans cannot review quickly enough, at least not without eventually lowering their standards and merging things they do not really understand.

The second approach is to treat the agent like glorified autocomplete and force a human to review every tiny step. This is safer, but slow enough to partially defeat the purpose of using an agent in the first place. If you still have to steer every minor decision, you have not delegated much.

In this post, I’ll cover a third, not-so-obvious approach: building ways for the agent to validate more of its own work before a human has to step in. The goal to make longer unattended sessions safe enough to be useful without fully removing the human from the loop. It should also reduce the number of low-quality PRs your teammates have to review for details the agent should have caught itself.

## What backpressure is and how it can help

**In systems engineering, backpressure is the mechanism by which a downstream component signals upstream that it can't accept more work, forcing the producer to slow down, buffer, or shed load.**

Whenever there's no backpressure, the producer is free to generate work at will, and the consumer is forced to absorb the mismatch. Then, the consumer either falls behind, breaks under the load, or speeds up by cutting corners.

In our work, backpressure usually takes the form of a machine refusing work the producer hasn't cleaned up yet. The simplest version of that is an automated test: you don't usually submit a PR with failing tests. Ideally, your colleagues shouldn't even review a PR until all tests are green. In that case, the test suite is the backpressure mechanism for a human to clean up their code before asking for a review.

[![Image 1: Sequence timeline where a developer writes code, automated tests run locally and give fast feedback in a loop, and only then does a reviewer do a manual review.](https://www.lucasfcosta.com/_next/image?url=%2Fassets%2Fbackpressure-is-all-you-need%2Ftests-backpressure.png&w=3840&q=75)](https://www.lucasfcosta.com/assets/backpressure-is-all-you-need/tests-backpressure.png "Click to enlarge")

Automated tests are backpressure: the developer iterates against fast local test feedback, so the reviewer only ever sees code that's already green.

In addition to automated testing, types can also be a powerful form of backpressure.

Remember writing plain JavaScript, for example. Back in those days, it was easy to wire a component with the wrong prop shape and only find out much later, when someone clicked a button and got hit in the face with `props.onSubmit is not a function`.

Before TypeScript, the only way to catch the bug before production was for a reviewer to follow the prop, follow the callback, check the caller, check the caller's caller, and hope the mismatch was visible in the diff.

Some of us learned a lesson from these difficult times and started using types to [make impossible states impossible](https://www.youtube.com/watch?v=IcgmSRJHu_8). Others looked at the same lesson, nodded solemnly, and kept passing dictionaries around, but I guess that's a story for another day.

Anyway, the point here is that TypeScript added backpressure and made the producer confront the consumer's expectations before moving the code forward. Now, if a component needs a function, you can't casually hand it a string, an object, or nothing at all and hope the reviewer catches the bug. Instead, the machine will refuse the work at the boundary where you introduced the type mismatch, with no need for an expensive human review.

[![Image 2: The same timeline with a TypeScript lane added before the tests: the type checker pushes back on the developer first, then automated tests, then a shorter manual review.](https://www.lucasfcosta.com/_next/image?url=%2Fassets%2Fbackpressure-is-all-you-need%2Ftypes-backpressure.png&w=3840&q=75)](https://www.lucasfcosta.com/assets/backpressure-is-all-you-need/types-backpressure.png "Click to enlarge")

Types add another layer of backpressure ahead of the tests, refusing mismatches at the boundary and making the eventual human review shorter and safer.

As time passed, we kept adding more automated guardrails to the process, like linters, end-to-end tests, canary releases, and so on. We then bundled a bunch of those guardrails into CI pipelines. That way, we could stop reviewing code that wasn't even close to being ready, and we could focus our human attention on the things that machines can't check, like readability, complexity, and overall design.

Today, this lesson is easy to recognize when we're talking about compilers, automated tests, CI, and, for the true believers among us, types. However, it seems much harder to recognize when the producer is an LLM writing code faster than anyone can read it.

That's why, most of the time, **the LLM's backpressure is still us**. We look at the code in the editor, ask the model to fix the parts that smell wrong (multiple times), open the PR, fix any failing checks, and then someone looks at the same code again with a more serious face.

[![Image 3: Sequence timeline of a human and an agent: the human prompts the agent, the agent works and returns results, the human reviews and sends feedback, repeating each cycle.](https://www.lucasfcosta.com/_next/image?url=%2Fassets%2Fbackpressure-is-all-you-need%2Fhuman-backpressure.png&w=3840&q=75)](https://www.lucasfcosta.com/assets/backpressure-is-all-you-need/human-backpressure.png "Click to enlarge")

With no automated backpressure, the human is the backpressure—manually reviewing the agent's output and feeding corrections back every cycle.

Often, for extra safety, we install a review bot to check the first AI's code. Then, we copy the bot's feedback back into the coding agent. That way, we have ironically promoted ourselves to an expensive clipboard doing the mechanical work between two machines.

**The next step for AI-aided software development is to stop making humans the default backpressure in the AI loop**. We need tests that fail early, types that push back, benchmarks that catch regressions, and review agents that send bad patches back before they become a human's problem. That machinery is what makes delegation possible, and frees up our time to focus on higher-level feedback and design decisions instead of low-level correctness and quality issues.

[![Image 4: Sequence timeline with three lanes—Human Reviewer, Agentic Backpressure, and Agent. The agent writes code that the backpressure layer pushes automated feedback back on, looping several times, and only at the end does the human reviewer do a manual review.](https://www.lucasfcosta.com/_next/image?url=%2Fassets%2Fbackpressure-is-all-you-need%2Fagentic-backpressure.png&w=3840&q=75)](https://www.lucasfcosta.com/assets/backpressure-is-all-you-need/agentic-backpressure.png "Click to enlarge")

With automated backpressure in place, the agent iterates against fast automated feedback and the human only steps in for a final manual review.

Next, I'll explain how I've been building that machinery in my work, how you can do the same, and interesting approaches I've yet to explore.

You can install this post's backpressure skills by running `npx @lucasfcosta/backpressured` in your terminal. Then, run `/backpressured <goal description>` in Claude — or explicitly ask Claude to use the backpressured skill — to kick off the loop.

That skill will automatically iterate towards the goal while running the backpressure checks described in this post. You can also customize the checks and the iteration process by adding a `BACKPRESSURE.md` file to your project with more specific instructions (in plain English).

## Creating backpressure in practice

The first time I applied backpressure to an LLM, I was using [Claude's `/goal` command](https://code.claude.com/docs/en/goal). That command lets you give Claude a goal and have it keep working until it considers the goal complete.

Initially, my `/goal` prompts looked something like this:

```
/goal implement support for <brief feature description>. You should only consider the task done when all of the following criteria are met:

1. <first criterion: i.e. the button X must be disabled while the form is submitting>
2. <second criterion: i.e. the front-end must show an error message if the API returns a 400>
3. <third criterion: i.e. redirect the user to the dashboard after a successful submission>
```

The problem with this type of prompt is that it focused too much on the feature and not enough on the necessary tests, possible edge cases, and overall quality of the implementation. Essentially, there were no guardrails to prevent the model from declaring victory too early, so it often did. Then, it was up to me to review the code and handhold the model through the process of handling each edge case, adding tests, and refactoring the code until it was good enough to ship. That defeated the purpose of `/goal`, which was supposed to let me delegate the work and only get involved at the end to review the final product.

That's when I noticed I was wasting my time as a slow backpressure mechanism instead of building automated backpressure into the loop. I was bottlenecking `/goal`!

After noticing that, I started adding the following backpressure mechanisms into the `/goal` loop:

1.   Linting, testing, and simple verification scripts
2.   Manual testing with `cURL` and an actual browser
3.   Benchmarking
4.   Review agents (functional, tests, types, brevity)
5.   Planning phase review
6.   Visual design reviews
7.   Pull-request monitoring

I'll cover each of these mechanisms in more detail below, but the general idea is that I kept adding more and more automated checks 
