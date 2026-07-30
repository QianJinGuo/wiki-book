---
title: "Deep Agents v0.7"
source_url: "https://www.langchain.com/blog/deep-agents-v0-7"
ingested: 2026-07-31
sha256: 72a77b11dd1b3e4094b060119bec6b4e9fbf2490ed263654f68a73f5f6117a52
---

Title: Deep Agents v0.7

URL Source: https://www.langchain.com/blog/deep-agents-v0-7

Markdown Content:
![Image 1](https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/6a6a1d540c9fefb41765fa98_104.png)

Today we're shipping deep agents v0.7. This release simplifies the base harness, resulting in 65% fewer base input tokens at comparable performance.

Building effective agents comes down to context engineering: a model is only as powerful as the context you give it, and that context comes down to what's in the prompt. Assembling that prompt well is the harness's job. But the guidance on how to do it changes constantly: [OpenAI](https://developers.openai.com/api/docs/guides/prompt-engineering), [Anthropic](https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models), and [Google](https://cloud.google.com/discover/what-is-prompt-engineering) all publish their own prompting guides, and all three have rewritten them as models got more capable. Harnesses need to keep pace, or they end up carrying prompting the model has outgrown.

Anthropic just published an updated [guide](https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models) on context engineering for modern models, alongside a report that they cut over 80% of Claude Code's system prompt for models like Opus 5 and Fable 5, with no measurable drop in coding evals. A couple of their findings mirror what we saw building v0.7:

*   **Interfaces beat examples:** good tool schemas teach usage better than the once popular few shot examples, which can narrow how the model explores.
*   **Avoid repetition:** repeating an instruction in both the system prompt and a tool's description doesn't offer meaningful reinforcement.

Deep Agents v0.7 offers a leaner, more configurable base harness that's more token and cost-efficient.

## Leaner base harness

Our hypothesis: trimming unnecessary tokens from the base input prompt would boost token and cost efficiency while holding performance steady. We made three changes to test this:

*   **Removed base system prompt:** We cut the system prompt that Deep Agents used under the hood, which included general guidelines and tool-usage prose ([#4859](https://github.com/langchain-ai/deepagents/pull/4859)).
*   **Trimmed tool descriptions:** We trimmed builtin tool descriptions by 43% ([#5009](https://github.com/langchain-ai/deepagents/pull/5009)).
*   **Opt-in todos:**`create_deep_agent` no longer includes `TodoListMiddleware` by default. Our evals showed the planning prompt and `write_todos` tool did not significantly improve performance ([#4929](https://github.com/langchain-ai/deepagents/pull/4929)).

Together, these changes drop _base input tokens_* on a default-agent turn by 65% (~6k → ~2k).

*_base input tokens_: _tokens associated with the builtin prompt, tools, and middleware_

### How we validated these changes

We validated that performance didn't drop using a [new eval suite](https://www.langchain.com/blog/how-we-benchmark-deep-agents) built around three categories of benchmarks. Each targets a different kind of agent work:

*   **Autonomous:** end-to-end tasks like coding and data analysis
*   **Conversational:** multi-turn conversation with a simulated user
*   **Long-context:** tasks that require retrieval and reasoning over long-context

We ran the new v0.7 harness against the old baseline (v0.6.12) through a matrix of all three eval categories across four models: `gpt-5.6-luna`, `gemini-3.6-flash`, `claude-sonnet-4-6`, and `claude-opus-4-8`.

Reward held steady overall, and tokens/cost generally dropped*. Most notably `gpt-5.6-luna` was down 34% on tokens and 15% on cost with reward up 4%. `claude-sonnet-4-6` was the exception; analyzing the LangSmith traces showed that a significant cost increase was largely from two challenging autonomous tasks.

*Reward confidence intervals span zero for every model. Luna and Opus show statistically clear token reductions, and Luna also shows a statistically clear cost reduction. Our full report can be found [here](https://github.com/langchain-ai/deepagents/pull/5009).

For more information, see our recent blog on [how we run evals](https://www.langchain.com/blog/how-we-benchmark-deep-agents) for Deep Agents.

### A note on todo lists

`TodoListMiddleware` is now opt-in. Our evals across three categories and three models showed slightly better rewards and lower cost with todos disabled, so we removed the `write_todos` tool from the base harness. The changes and full experiment results can be found [here](https://github.com/langchain-ai/deepagents/pull/4929).

That said, it still earns its keep in a few cases:

1.   **Long, multi-step tasks**, where an agent benefits from an explicit plan to stay on track across many turns.
2.   **Less capable models**, which need more scaffolding to avoid dropping steps or losing the thread.
3.   **UI-facing use cases**, where a visible plan and progress matter as much as the underlying execution.

If your use case is one of the three above, [turning it back on](https://docs.langchain.com/oss/python/deepagents/overview#task-planning) is one line: `middleware=[TodoListMiddleware()]`.

## More configurability

Configurability was [the top ask](https://github.com/langchain-ai/deepagents/issues/3783) from Deep Agents users over the last six months, including requests to override `FilesystemMiddleware`, customize `SummarizationMiddleware` thresholds, and override the base prompt globally. They all hit the same wall: there was no supported way to change what the default harness stack does. v0.7 fixes that in two ways.

**Full control over your prompts.** Removing hidden prompting has a side effect: your own custom prompting gets more effective, since there’s not prompting under the hood that might cause bloating at best and conflicts at worst.

**Full control over the middleware stack.** v0.7 makes [overriding built-in middleware](https://app.notion.com/p/TodoListMiddleware-Analysis-39f808527b1781ce96e8e1755f0889ba?pvs=21) first-class: pass a `middleware=` instance whose `.name` matches a default, and it replaces that default in place instead of erroring on a duplicate. ([#4251](https://github.com/langchain-ai/deepagents/pull/4251))

As one power user shared:

"We [used to do] some hacky stuff to remove some of the default middleware. Overriding middleware is a very welcome addition."

`SummarizationMiddleware` is a good example. By default it kicks in once a conversation crosses 85% of the context window, using a generic summarization prompt. Different applications call for different prompting, and developers want to trigger summarization at different thresholds too, to stay ahead of context rot and the ["dumb zone"](https://random.qmx.me/posts/2026/01/14/escaping-the-dumb-zone-with-rlms/). You can now drop in a summarization middleware with your own settings:

```
from deepagents import create_deep_agent
from deepagents.middleware import SummarizationMiddleware
 
agent = create_deep_agent(
    model="anthropic:claude-sonnet-5",
    middleware=[
        SummarizationMiddleware(
            model="fireworks:accounts/fireworks/models/kimi-k3",
            # summarize at 50% of the context window instead of the default
            trigger=("fraction", 0.5),
            summary_prompt="Summarize the conversation so far, keeping any file paths and decisions verbatim...",
        ),
    ],
)
```

‍`‍`The same pattern works for any other builtin default you want to retune, like prompt-caching TTLs.

## Filesystem performance

The filesystem is Deep Agents' core context management layer: the environment agents read, write, and navigate state through. This release makes some optimizations driven by the same eval suite plus trajectory optimizations identified from real `dcode` usage, with open and closed models.

`write_file` now overwrites an existing file instead of erroring ([#4109](https://github.com/langchain-ai/deepagents/pull/4109)), paginated `read_file` reports total and remaining lines plus the next `offset` ([#4540](https://github.com/langchain-ai/deepagents/pull/4540)), and `grep`/`glob` return partial results with a `truncated` flag instead of hanging on large trees, with `grep` also gaining a 1,000-match cap, streamed output, and optional context lines ([#4063](https://github.com/langchain-ai/deepagents/pull/4063), [#4570](https://github.com/langchain-ai/deepagents/pull/4570), [#4706](https://github.com/langchain-ai/deepagents/pull/4706)).

## Breaking changes

This release removes some compatibility shims and changes a few default behaviors:

1.   `TodoListMiddleware` is no longer on by default ([#4929](https://github.com/langchain-ai/deepagents/pull/4929)), though it's opt-in with `TodoListMiddleware()`.
2.   Support for backend factories, deprecated in v0.5, is removed in favor of concrete `BackendProtocol` instances ([#4541](https://github.com/langchain-ai/deepagents/pull/4541)). Other file format / backend protocol deprecations from v0.5 are also removed.
3.   The `delete` tool was added to the default filesystem tool list. `FilesystemMiddleware` accepts a [tool allowlist](https://docs.langchain.com/oss/python/deepagents/overview#virtual-filesystem-access) so you can opt out of this if desired ([#4325](https://github.com/langchain-ai/deepagents/pull/4325), [#4698](https://github.com/langchain-ai/deepagents/pull/4698)).

Full details, including migration notes and an “upgrade” prompt for coding agents, are in the [changelog](https://docs.langchain.com/oss/python/releases/changelog#jul-24-2026).

## Try it

`deepagents` v0.7 is out now on PyPI:`‍`

`uv pip install -U deepagents`

and on `npm`:

`npm install deepagents@latest`

Give the latest `deepagents` a try, and let us know what you think via GitHub [issues](https://github.com/langchain-ai/deepagents/issues), the [forum](https://forum.langchain.com/), or on X / LinkedIn.

## References

*   [Release notes: `deepagents` v0.7.0](https://docs.langchain.com/oss/python/releases/changelog#jul-24-2026)
*   [Docs: customizing and overriding built-in middleware](https://docs.langchain.com/oss/python/deepagents/customization)
*   [Docs: filesystem tools and virtual filesystem access](https://docs.langchain.com/oss/python/deepagents/overview#virtual-filesystem-access)
*   [Docs: opt in todos](https://docs.langchain.com/oss/python/deepagents/overview#task-planning)
*   [Eval suite blog: how we benchmark Deep Agents](https://www.langchain.com/blog/how-we-benchmark-deep-agents)

‍

### Related content

![Image 2](https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/6a683de0377180aefcf29d7e_thumbnail1.png)

Agent Architecture

#### How we built LangChain’s agent-first data stack

![Image 3](https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/6a683e449d14cd95a2ccba9f_emily.png)

Emily Hawkins

July 27, 2026

![Image 4](https://cdn.prod.website-files.com/65b8cd72835ceeacd4449a53/69cd1fd0002272ce39bf1241_Icon-6.svg)

14

min

![Image 5](https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/6a610d8b437d073d4565cc8e_how-we-benchmark-deepagents.png)

Open Source

Observability & Evals

#### How We Benchmark Deep Agents

![Image 6](https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/6a0f023b0b549b4726b62469_T04F8K3FZB5-U0AQPTH37EV-d045574c58b6-512.png)

![Image 7](https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/6a056ea05f3880a1361b47cf_Harrison.avif)

N. Hollon,

H. Chase

July 23, 2026

![Image 8](https://cdn.prod.website-files.com/65b8cd72835ceeacd4449a53/69cd1fd0002272ce39bf1241_Icon-6.svg)

4

min

![Image 9](https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/6a60b77e476b5a0300795e7c_100%20(1).png)

Open Source

LangGraph

Agent Architecture

#### 3 Years of Graph Engineering with LangGraph

![Image 10](https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/69dcee60745f0e15b18ad4d5_sydney-runkle.png)

![Image 11](https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/6a056ea05f3880a1361b47cf_Harrison.avif)

S. Runkle,

H. Chase

July 22, 2026

![Image 12](https://cdn.prod.website-files.com/65b8cd72835ceeacd4449a53/69cd1fd0002272ce39bf1241_Icon-6.svg)

7

min

![Image 13](https://cdn.prod.website-files.com/65b8cd72835ceeacd4449a53/69ce01ea562f8cc223cabf25_Frame%202147254328.svg)

### S

e

e

w

h

a

t

y

o

u

r

a

g

e

n

t

i

s

r

e

a

l

l

y

d

o

i

n

g

LangSmith, our agent engineering platform, helps developers debug every agent decision, eval changes, and deploy in one click.
