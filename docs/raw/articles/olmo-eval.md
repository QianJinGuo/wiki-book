---
title: "olmo-eval: An evaluation workbench for the model development"
source_url: "https://huggingface.co/blog/allenai/olmo-eval"
source: newsletter
ingested: '2026-06-15'
sha256: "33ade0ae5aacf9749b54501926fee91c06fa3d7c58e1274914204c20d3bb99cf"
tags: [newsletter, ai, llm]
ingest_v: 7
ingest_c: 8
ingest_stars: 4
ingest_vxc: 56
---

# olmo-eval: An evaluation workbench for the model development

> Source: [https://huggingface.co/blog/allenai/olmo-eval](https://huggingface.co/blog/allenai/olmo-eval)


Published Time: 2026-06-12T15:56:10.755Z

Markdown Content:
[Back to Articles](https://huggingface.co/blog)

[![Image 1: Tyler Murray's avatar](https://cdn-avatars.huggingface.co/v1/production/uploads/65e5fefbe8cbae176d9ca005/5SLREDsVzycEwVsPNv765.jpeg)](https://huggingface.co/undfined)

[![Image 2: Kyle Wiggers's avatar](https://huggingface.co/avatars/fee5cceec7536851d7c6712760716a71.svg)](https://huggingface.co/Ai2Comms)

💻 Code: [https://github.com/allenai/olmo-eval](https://github.com/allenai/olmo-eval)

[![Image 3: Ai2 Olmo-Eval Graphic Development v3](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/LrVpULz4nL1G-aQ4lGdSd.png)](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/LrVpULz4nL1G-aQ4lGdSd.png)

While you're building an LLM, you evaluate it over and over across many interventions. Every adjustment to its data, architecture, or hyperparameters — and every step up in scale — sends you back through the same loop: adding or reconfiguring benchmarks, re-running them on each new model checkpoint, noting the results, and checking whether something that helped in a small experiment still holds up on the full training run.

Most evaluation tools aren't designed for this—they’re either built to run established benchmarks across finished models or run a model through multi-step, tool-using problems in a sandbox. They don’t keep up with a model that's constantly changing, nor do they reflect how a model might behave under specific real-world conditions.

Our last project to address this evaluation challenge was [OLMES](https://github.com/allenai/olmes), the Open Language Model Evaluation Standard. Introduced in 2024, it was meant to make LLM benchmark scores easier to compare across releases. The same models were being scored on the same benchmarks in different ways — aspects like prompt formatting and task formulation often varied from paper to paper — so claims about which models performed best often weren't reproducible. OLMES pinned benchmarking choices down in an open, documented standard, and it became the basis for evaluating our open models from Olmo to Tulu.

But a model's final score is only part of the evaluation process—which is why we're releasing **[olmo-eval](https://github.com/allenai/olmo-eval)**, a new workbench that builds on OLMES and extends it across the rest of LLM development. Compared to OLMES, olmo-eval cuts down the work of implementing new evaluations, offers more flexibility in defining where and how they run, and makes it easier to compose individual components into larger workflows. Agentic and multi-turn evaluation is supported as a first-class use case, and stronger analysis tools help you judge whether an intervention actually improved on the baseline or the difference amounts to noise.

## [](http://huggingface.co/blog/allenai/olmo-eval#how-olmo-eval-differs-from-existing-tools) How olmo-eval differs from existing tools

[![Image 4: olmo-eval blog Kyles draft - Google Docs-image-1 (1)](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/Um1iTvUD-lxxWYBvsNiOx.png)](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/Um1iTvUD-lxxWYBvsNiOx.png)

_Is a 2.4pp change in performance enough to make a call?_

olmo-eval overlaps in some ways with Harbor, an open framework for evaluating AI agents inside containerized, sandboxed environments. But the two tools differ in their scope. Harbor is aimed mainly at running and publishing agent benchmarks; olmo-eval was built for the everyday work of developing a model—adding and configuring benchmarks, running them across checkpoints, and analyzing the results prompt by prompt instead of as a single overall score.

Harbor runs everything the same way—inside sealed, reproducible containers. Because containers can be resource-intensive, olmo-eval lets you choose how each benchmark runs instead. A benchmark that just needs a model to answer questions can run directly, which is faster and cheaper; a benchmark that needs a locked-down environment — say, one that runs code the model wrote — gets an isolated container setup. The lightweight path is the default, and olmo-eval only opts for the heavy setup when a benchmark actually requires it.

Harbor's process for adding a benchmark is built for evals you plan to publish and share publicly, with the extra verification steps that entails. olmo-eval is built for moving quickly while you develop, and how you add a benchmark depends on what the benchmark needs: a short definition for a basic eval, with options to let a model use tools as it works through a benchmark, or — for a benchmark that already has its own code and procedure — a thin wrapper so olmo-eval can run it as is and report the results alongside other benchmark scores in the same format.

Both Harbor and olmo-eval keep benchmarks separate from the runtime policy (how the model is run to produce its answers) so you can change one without rewriting the other, but olmo-eval is designed for greater modularity. In olmo-eval, the model being evaluated, the tools it can use, the containerized environment, and any helper models – like an LLM-as-a-judge – are all swappable components. You can reuse a tool across many harnesses, or plug a grading model into one benchmark without perturbing the others, and adjust small settings (e.g., the exact wording of the prompt) without extensive effort.

Harbor reports an overall score for each model. olmo-eval reports those scores too, each with a standard error and a minimum detectable effect (the smallest difference that can be reliably distinguished from noise). But the more useful view lines the same questions up across two model checkpoints and compares them one by one, with all else held fixed. This helps you to see whether a tiny change in an overall average might indicate a real improvement or simply noise.

| If you're looking for... | olmo-eval offers |
| --- | --- |
| Authoring a multi-example benchmark | Task subclass with a `DataSource`, metrics, and scoring surface |
| Wrapping an existing agent-style benchmark with its own runner | `ExternalEval` or `SandboxedExternalEval`; the benchmark keeps its loop and scoring, and results land in olmo-eval's schema |
| Swapping the runtime under a fixed benchmark | `--harness` and harness presets; the harness carries provider, tools, scaffold, sandboxes, and auxiliary providers |
| Parallel container execution | Sandbox instances for parallel executors with capability-based routing, Docker or Modal modes |
| Tool definitions reusable across tasks and harnesses | `@tool` decorator with optional global registry |
| Multi-turn execution loops | Scaffolds, e.g., `openai_agents`, selected per harness, not baked into the task definition |

## [](http://huggingface.co/blog/allenai/olmo-eval#an-integrated-evaluation-stack) An integrated evaluation stack

olmo-eval is composed of four components that are useful on their own but designed to work together to tighten the experimental LLM development loop:

1.   **A task/suite/harness abstraction that decouples benchmark logic from runtime policy.** A task is how you define a benchmark in olmo-eval—what's being evaluated. A suite groups tasks into a set you run together, and a harness controls how each task is run. This separation lets the same task run as a standard baseline or with tools and scaffolding, without changing what it measures.

2.   **A sandbox and capability-routing layer, including an asynchronous sandbox planner.** This supports evaluations where a model's response depends on the actions it takes using tools, like writing and running code or browsing the web. The point is to evaluate the model's real tool use: when a benchmark calls for tools, olmo-eval runs those tools and feeds the results back to the model.

3.   **A normalized experiment schema that records every run, its configuration, and the results in the same structured format.** This makes it possible to group related experiments, compare checkpoints over time, and avoid the inconsistencies that often accumulate in long-running model development workflows.

4.   **A results viewer for pairwise model comparison:** lining two models or checkpoints up question by question surfaces small but real performance changes that an overall average can hide.

In most model evaluation setups, adding a benchmark is a sizeable integration project. In olmo-eval, all that’s needed is a task—tasks define the benchmark dataset, how evaluation requests are built, and how model answers are scored (all code in Python):

```
from olmo_eval.common.formatters import ChatFormatter
from olmo_eval.common.metrics import AccuracyMetric
from olmo_eval.common.scorers import ExactMatchScorer
from olmo_eval.common.types import Instance, SamplingParams
from olmo_eval.data import DataLoader, DataSource
from olmo_eval.evals.tasks.common import Task, register, register_variant

@register("internal_freshqa")
class InternalFreshQA(Task):
    data_source = DataSource(path="s3://evals/internal/freshqa.jsonl", split="test")
    formatter = ChatFormatter()
    sampling_params = SamplingParams(temperature=0.0)
    metrics = (AccuracyMetric(scorer=ExactMatchScorer),)

    @property
    def instances(self):
        loader = DataLoader()
        for idx, doc in enumerate(loader.load(self.config.get_data_source())):
            yield Instance(
                question=doc["question"],
                gold_answer=doc["answer"],
                metadata={"id": doc.get("id", f"freshqa_{idx}")},
            )
```

Variants express changes in evaluation policy without duplicating the benchmark:

```
register_variant("internal_freshqa", "3shot", num_fewshot=3, fewshot_seed=1234)
register_variant("internal_freshqa", "zero", num_fewshot=0)
```

Suites group benchmarks into standard sets you run together:

```
from olmo_eval.evals.suites import Suite, register

register(Suite(
    name="base_qa_few_shot",
    tasks=(
"sciq:mc:3shot",
"arc_challenge:mc:3shot",
"internal_freshqa:mc:3shot",
    ),
))
```

And because runtime policy lives in the harness rather than the task definition, the same benchmark can be easily rerun under different execution rather than relying on whether a generated point track merely looks plausible.

```
# Baseline
olmo-eval run -m my-instruct-checkpoint -t internal_freshqa:zero

# Same task, same scoring, search/tool runtime enabled
olmo-eval run -m my-instruct-checkpoint -t internal_freshqa:zero --harness search_agent
```

## [](http://huggingface.co/blog/allenai/olmo-eval#reproducible-evaluation-made-open) Reproducible evaluation made open

Use [olmo-eval](https://github.com/allenai/olmo-eval) when evaluation is part of ongoing model development rather than a one-off run—when you need to run the same benchmarks repeatedly across checkpoints under reproducible conditions and compare interventions at both the aggregate and per-question level.

If your recurring question is “How does this checkpoint differ from the last one, and where exactly did it improve or regress?”, that’s the workflow olmo-eval is built for.

Reproducible evaluation should keep pace with how models are built—not only how they're scored once they're finished. olmo-eval carries the OLMES standard into active model development, and we're releasing it openly so the community can build on it.

