sha256: b0cdab766d924e82307d512dddb3e09f6f9da8e2c9fe6e900b9e2941e1dd1bb4
---
title: "Using Local Coding Agents"
source_url: "https://magazine.sebastianraschka.com/p/using-local-coding-agents"
ingested: "2026-06-29"
type: article
tags: [newsletter]
---

# Using Local Coding Agents


Published Time: 2026-06-27T11:21:58+00:00

Markdown Content:
Many people reached out to me in the past asking about my local agent stack as well as how I set up my local agent stack.

So, I thought it might be useful to put together a little tutorial on how to set up a local (coding) agent using open-source tools and open-weight LLMs.

[![Image 1: Figure 1](https://substackcdn.com/image/fetch/$s_!w1ai!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F98ebec9f-115a-4896-926d-5461220de62a_10126x2817.png)](https://substackcdn.com/image/fetch/$s_!w1ai!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F98ebec9f-115a-4896-926d-5461220de62a_10126x2817.png)

Figure 1: Overview of the local stack, that is, a coding agent harness that uses a local model hosted through an inference engine / runtime server.

This article is a tutorial on setting up a production-ready coding agent with a fully local stack. We will use a locally served LLM together with a local coding harness that can read files, make edits, run commands, and verify changes as shown in the figure above.

Here, we can think of the LLM as the engine that provides the reasoning and code generation. And the surrounding harness provides the operating environment that allows the LLM to do meaningful coding work in our local projects.

Why local? For many coding workflows, a local setup is an interesting alternative to proprietary services such as GPT in Codex or Opus in Claude Code. The local setup is transparent, inspectable, and free to run apart from hardware and electricity costs. It also stays fully under your control, and you can modify the coding harness in any way you like. **Plus, it’s a lot of fun!**

By the way, in case you want a bit more background information on coding agent harnesses, I covered the core components of coding agents (and building a coding agent from scratch for learning purposes) here:

I have to admit that I still primarily alternate between Codex and Claude Code as my daily drivers, for now (and just to keep up with the new tooling and functions that are constantly being added). Also, the plan limits (especially for Codex) are still so generous that I haven’t had to worry about costs so far.

However, I’ve been using local solutions for a while, too, to test things and because it somehow gives me joy to have and use a fully local setup (versus proprietary services).

Either way, local solutions become more and more attractive each day. One aspect is the costs. If you have the hardware, they are practically free to run. And then there’s, of course, the privacy angle. For example, for organizing and processing my receipts, I’d be more comfortable with a local model ingesting them rather than sending the data over to OpenAI or Anthropic.

(Then, if we keep in mind that Anthropic was recently [throttling their flagship model’s performance for LLM research](https://substack.com/@rasbt/note/c-273441982), proprietary services may become more restrictive over time, and it’s maybe a good idea to be comfortable with open-weight alternatives as a backup.)

And there are many, many additional reasons and use cases like that.

Your motivations for using local LLMs and coding harnesses may include:

*   Predictable, fixed costs if you reach your subscription plan limits, and immunity to API price changes.

*   Reproducibility; sometimes it’s nice if a model is upgraded (e.g., GPT 5.4 -> GPT 5.5 -> GPT 5.6) and it solves all your queries more reliably. However, this can also break existing workflows.

*   Offline use in the classic airplane flight scenario with slow or no internet, or when going on a coding/writing retreat in the cabin in the woods w/o a Starlink subscription.

And there are probably several others.

So, in this article, we will set up and use popular harnesses like Codex and Claude Code with open-weight models and investigate whether using a model-specific harness (like Qwen-Code for Qwen3.6) brings any additional benefits. (Of course, there are many more harnesses like OpenCode, Cline, Pi, and Noumena Code, but I thought that most people already have muscle memory with either Codex or Claude Code, which makes switching to open-weight models a bit smoother).

Most coding agent harnesses follow similar principles and have more or less the same features and functionality. However, the implementation details may differ, and certain LLMs have usually been primarily optimized for a specific harness. Of course, many open-weight LLMs like GLM 5.2, for example, would run Claude Code, etc.

However, if an LLM developer also develops a coding harness, it is somewhat safe to assume that their model is optimized for their own harness first (while also supporting others).

Here, I am primarily going to use Qwen3.6 with the Qwen-Coder coding client. However, I will also go over other options for using a local LLM with other agent harnesses, for example, Claude Code, Codex, and the increasingly popular Cline, but more on that later.

The reason why I am primarily using Qwen-Code when working with Qwen models is that:

1.   it is open-source, like Codex ([https://github.com/openai/codex](https://github.com/openai/codex)) but unlike Claude Code;

2.   Qwen models have been specifically optimized for the Qwen-Code harness (more information below);

3.   I can run both Codex (with the latest GPT model) and Qwen-Code with a local Qwen model side by side on the same machine without having to switch manually back and forth between models.

Regarding the second point in the list above, that Qwen models work better in Qwen-Code, Nvidia’s [Polar: Agentic RL on Any Harness at Scale](https://arxiv.org/abs/2605.24220) paper (May 2026) has a benchmark showing that the Qwen3.5-4B base model has the best coding performance in said Qwen-Code harness (both before and after their Polar-RL training), which I included below.

The benchmark in the table above is for an older Qwen3.5 model, and I am assuming that the latest Qwen3.6 models are even further optimized to do well in Qwen-Code specifically.

However, Pi ([https://github.com/earendil-works/pi](https://github.com/earendil-works/pi)) also seems to be a very interesting candidate that I need to play around with in the future.

By the way, Qwen3.6 35B-A3B is about 22 GB to download, requires roughly 30-40 GB of RAM, and runs pretty swiftly on both a Mac Mini with M4 and a DGX Spark.

Based on the recent benchmarks shared by Cohere earlier in June, it is currently the best local model in its size class.

As seen above, Qwen3.6 35B-A3B dominates all but one benchmark in this size class. However, that being said, Qwen Code is a general harness and also supports other types of models. For instance, we could also connect North Mini Code or Gemma 4 in Qwen Code.

[![Image 2: Figure 4](https://substackcdn.com/image/fetch/$s_!ZuIZ!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2c1f1b73-8af7-478f-abfd-ae22886078f3_3128x1369.png)](https://substackcdn.com/image/fetch/$s_!ZuIZ!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2c1f1b73-8af7-478f-abfd-ae22886078f3_3128x1369.png)

Figure 4: Yes, Qwen3.6 35B-A3B is a really good model! (Via x.com/pupposandro/status/2064707907489272147/)

Architecture-wise, the Qwen3.6 35B-A3B model has hybrid attention similar to Qwen3-Coder and Qwen3.5. I wrote more about it in [Beyond Standard LLMs](https://magazine.sebastianraschka.com/p/beyond-standard-llms).

[![Image 3: Figure 5](https://substackcdn.com/image/fetch/$s_!hp0Z!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc38e986b-1116-49c9-936b-ac30c16f2f37_7215x9097.png)](https://substackcdn.com/image/fetch/$s_!hp0Z!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc38e986b-1116-49c9-936b-ac30c16f2f37_7215x9097.png)

Figure 5: Qwen3.6 architecture and fact sheet from my [LLM gallery](https://sebastianraschka.com/llm-architecture-gallery/#card-qwen3-6-35b-a3b).

Alternatively, if you don’t want to use Qwen3.6, Cohere’s North Mini Code is probably the most interesting, capable alternative at this size class right now. I will go over this model in the next local LLM setup section as well.

[![Image 4: Figure 6](https://substackcdn.com/image/fetch/$s_!dcyX!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5319b62b-6922-43aa-af48-5d2e5a8de546_7089x8510.png)](https://substackcdn.com/image/fetch/$s_!dcyX!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5319b62b-6922-43aa-af48-5d2e5a8de546_7089x8510.png)

Figure 6: North Mini Code architecture and fact sheet from my [LLM gallery](https://sebastianraschka.com/llm-architecture-gallery/).

No matter what agent harness we use (Qwen-Code, Codex, or Claude Code), we have to set up a local LLM, such as Qwen3.6 35B-A3B, first.

There are several options like Ollama, LM Studio, vLLM, SGLang, MLX, etc to serve models locally. You know from my Build A Large Language Model (From Scratch) and Build A Reasoning Model (From Scratch) projects that I like to code these myself. Implementing a model from scratch has the benefits that we understand the whole stack, plus we can modify and further train and fine-tune it.

However, here, we just look for a model serving framework that has been super optimized for inference speed and resource needs since we don’t plan to do any training or fine-tuning at this point. (We could, as an extra step, convert and import our own from-scratch fine-tuned model into these efficient serving stacks, but this is out of the scope for this article.)

For this tutorial, we will use [Ollama](https://ollama.com/) as our efficient model serving engine because it’s relatively easy to install and use from the command line across different operating systems (although LM Studio also added a non-GUI `llmster` client, but I am less familiar with it).

By the way, I am not affiliated with any of the tools mentioned in this article, but one nice thing about Ollama is that they also optionally support open-weight models hosted in the cloud, including the currently strongest open-weight model, GLM 5.2, which is too large to run locally on consumer hardware. (The cloud models are not free, of course, but have similar subscription plans as ChatGPT and Claude; it’s still nice though that this option exists to conveniently test the latest state-of-the-art open-weight models “locally.”)

Anyways, setting up Ollama is pretty straightforward, and you can find the official macOS/Linux/Windows download instructions on their [download](https://ollama.com/download/) page.

After installing, I recommend downloading a model for a quick test run. For instance, on macOS, we can use the ollama app to download models directly via the GUI:

[![Image 5: Figure 7](https://substackcdn.com/image/fetch/$s_!qNMc!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7d98c751-9718-49f8-b5fa-78b04921f540_5247x3974.png)](https://substackcdn.com/image/fetch/$s_!qNMc!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7d98c751-9718-49f8-b5fa-78b04921f540_5247x3974.png)

Figure 7: Using the Ollama app to find and download models

Otherwise, this can be done on the command line as well via

By the way, the above-mentioned qwen3.6:35b-mlx is a model using Apple’s Metal performance shaders, i.e., optimized for Macs with Apple silicon chips. I highly recommend using *-mlx versions of models working on Macs (if available).

[![Image 6: Figure 8](https://substackcdn.com/image/fetch/$s_!6ETy!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc8fff02e-ce3e-42d4-96e0-bb0a962aeab7_6546x4306.png)](https://substackcdn.com/image/fetch/$s_!6ETy!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc8fff02e-ce3e-42d4-96e0-bb0a962aeab7_6546x4306.png)

Figure 8: Prefer the MLX version when using a Mac (with an Apple Silicon chip).

On a Linux machine, use the non-MLX version:

Then, to make sure that it works, you can either use the GUI again or launch Ollama from the command line.

[![Image 7: Figure 9](https://substackcdn.com/image/fetch/$s_!dwyF!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc1f314be-0a37-48ee-a194-9b339104b9ae_7518x5064.png)](https://substackcdn.com/image/fetch/$s_!dwyF!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc1f314be-0a37-48ee-a194-9b339104b9ae_7518x5064.png)

Figure 9: Running Ollama in the terminal.

You can exit this session via the `/bye` command.

As mentioned before, the currently best alternative to this Qwen3.6 35B-A3B model is North Mini Code 1.0 of similar size.

[![Image 8: Figure 10](https://substackcdn.com/image/fetch/$s_!oH3j!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F730789df-4bdd-40a5-bc80-7b7e1628eb79_9216x3739.png)](https://substackcdn.com/image/fetch/$s_!oH3j!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F730789df-4bdd-40a5-bc80-7b7e1628eb79_9216x3739.png)

Figure 10: North Mini Code 1.0 as an alternative to Qwen3.6 35B A3B.

Before deciding on whether to use an LLM as a local coding agent, it’s usually not a bad idea to run a quick speed and quality assessment. Here, for the speed assessment, I would look for tokens/sec performance. Additionally, I’d also make sure this stays stable for (very) long contexts, which is what we are usually dealing with during agentic coding workflows (as opposed to simpler chatbots).

Of course, we also don’t want the memory cost to explode either.

You could run my ollama_speed_memory_bench.py script to do a quick check. In a nutshell, it sends different prompts (ranging from 1k to 50k words) to an Ollama model and asks it to generate up to 8k tokens by default. It reports simple statistics like prefill speed from Ollama’s prompt evaluation metrics, generation speed from output-token timing, and memory use from the Ollama process plus NVIDIA GPU memory when available.

For example, to evaluate the `qwen3.6:35b-mlx` on macOS, if you downloaded or cloned the scripts from [https://github.com/rasbt/local-coding-agent-evals](https://github.com/rasbt/local-coding-agent-evals), we can run the following, which takes about 5 minutes:

On Linux, we can run:

Note that this assumes that you already downloaded the respective model as explained in the previous section. Also, depending on your system, if you have less than 30 GB RAM, you may have to use a smaller model like gemma4:e2b, which uses up to about 8 GB RAM on long contexts. Of course, there are also many smaller models, but in my experience, they make pretty bad local coding agents.)

Note that for models, the RSS RAM report is not super accurate on macOS (especially for mlx model variants that utilize the Metal backend), and I suggest keeping an eye on the activity monitor’s RAM usage for Ollama during the run as well. In this case, the RAM usage fluctuated between 20 - 29 GB.

Anyways, the bottom line is that for 50k contexts, the Qwen3.6 and North Mini Code models use up to 30 GB RAM and generate output with about 40 tok/sec on a recent Mac Mini and 30 tok/sec on a DGX.

Below is a visual summary of the different runs.

[![Image 9: Figure 11](https://substackcdn.com/image/fetch/$s_!zYPa!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6e710c83-39f0-4785-80d3-be63fc8af766_6333x5706.png)](https://substackcdn.com/image/fetch/$s_!zYPa!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6e710c83-39f0-4785-80d3-be63fc8af766_6333x5706.png)

Figure 11: Quick speed comparison of the different models on different systems. Note that the macOS RAM consumption is not super accurate there. Also, note that the Qwen 35B-A3B model is faster on Mac than on the DGX Spark (which is the other way around for the Gemma 4 E2B model) thanks to the optimized MLX version. Code to reproduce: [https://github.com/rasbt/local-coding-agent-evals](https://github.com/rasbt/local-coding-agent-evals)

Another interesting question is how Qwen 35B-A3B compares to the similarly-sized Cohere North Mini model? If we take similarly quantized models into account (above, I was using the Qwen3.6 default), they are pretty similar, although North Mini is perhaps slightly ahead overall, as shown below.

Anyway, the bottom line is that, in my opinion, anything faster than 20-30 tok/sec is pretty reasonable for local agent work. **This is about the same speed as GPT 5.5 with “high” reasoning**. In this case, both models clear the bar easily.

By the way, personally, I run my agents almost exclusively on my DGX Spark because I don’t want my Mac Mini to get too hot and I want to have the RAM available for other tasks.

Of course, there are always ways to optimize this more with different frameworks (other than Ollama), quantizations, MTP, and so on. However, Ollama is a good plug & play allrounder with minimal setup time that connects easily to various coding agent frameworks and where it’s super simple to swap and try out different models.

After checking that the model is fast enough for convenient local work, I recommend doing a quick modeling performance assessment. Sure, there are many standardized benchmarks out there we could take a look at and even run ourselves.

Usually, you can find the numbers for relevant benchmarks in the model’s technical report or model hub page. Usually, I also find it useful to look at a relative comparison with other models on [https://artificialanalysis.ai/models/](https://artificialanalysis.ai/models/).

Based on the figure above, we can see that Qwen3 35B-A3B is much more capable than the Gemma 4 E4B and E2B models, for example.

Note that the Artificial Intelligence Index numbers keep changing over time as they swap benchmarks and update the weighting, so there are no “absolute” numbers we could use as a reference point for deciding which model is “good enough”. Rather, I would compare a new, interesting model to a model you used before as an anchor or reference point.

Beyond standard benchmarks, I would also curate a personal set of tasks that are relevant to you to do a quick check whether this model is even suitable for any type of work that you might want it to perform.

Below are the outputs of a reasoning- and code-related set of questions that also test the tool calling capabilities of the models. Here, the model returns the tool call but doesn’t execute the code itself.

```
➜  uv run ollama_hard_reasoning_bench.py --model qwen3.6:35b
PASS debug_empty_tokenizer_regression: ok
PASS review_shell_command_injection: ok
FAIL choose_minimal_edit_for_cross_platform_path: argument instructions missing required content
FAIL triage_import_error_after_refactor: wrong tool: expected read_file, got ask_clarification
PASS debug_mutable_default_cache_leak: ok

Score: 3/5 passed (60.0%)
```

```
➜  uv run ollama_hard_reasoning_bench.py --model  north-mini-code-1.0
FAIL debug_empty_tokenizer_regression: wrong tool: expected final_answer, got edit_file
PASS review_shell_command_injection: ok
FAIL choose_minimal_edit_for_cross_platform_path: invalid JSON: Extra data: line 2 column 1 (char 235)
FAIL triage_import_error_after_refactor: wrong tool: expected read_file, got ask_clarification
FAIL debug_mutable_default_cache_leak: wrong tool: expected final_answer, got edit_file

Score: 1/5 passed (20.0%)
```

```
uv run ollama_hard_reasoning_bench.py --model gemma4:e2b
FAIL debug_empty_tokenizer_regression: wrong tool: expected final_answer, got edit_file
FAIL review_shell_command_injection: wrong tool: expected final_answer, got ask_clarification
FAIL choose_minimal_edit_for_cross_platform_path: wrong argument path: expected 'code/tool-reasoning-benchmark/ollama_tool_reasoning_bench.py', got 'code/tool-reasoning-benchmark/personal_tool_reasoning_tasks.jsonl'
FAIL triage_import_error_after_refactor: wrong tool: expected read_file, got ask_clarification
FAIL debug_mutable_default_cache_leak: wrong tool: expected final_answer, got edit_file

Score: 0/5 passed (0.0%)
```

For instance, we can say that `qwen3.6:35b` gets the conceptual debugging and security-review tasks right, but still struggles with agentic judgment around “what file/action first” tasks. `3/5` is usable but not fully reliable for autonomous tool use. But a harness that constrains actions, adds retries, and maybe gives stronger project context could make it pretty usable.

On the other hand, `gemma4:e2b` failing `0/5` is a strong signal that it is less suitable for this kind of tool-use reasoning, even if it is fast. Note that the failures are not just formatting issues. It looks like it chooses the wrong tool, asks for clarification when enough context is present, etc. I would probably not use it as a coding-agent model beyond very narrow or heavily constrained tasks.

Now, after this lengthy preamble setting up a local LLM, let’s get back to the main topic, the coding agent harness. As mentioned at the beginning of this article, we will use the qwen-code ([https://github.com/QwenLM/qwen-code](https://github.com/QwenLM/qwen-code)) harness, as Qwen models have been optimized for it.

[![Image 10: Figure 13](https://substackcdn.com/image/fetch/$s_!r-wm!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F513be214-fefa-417d-b2a2-f806cfcb97da_10126x3152.png)](https://substackcdn.com/image/fetch/$s_!r-wm!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F513be214-fefa-417d-b2a2-f806cfcb97da_10126x3152.png)

Figure 14: Next, we are trying to connect the locally served model to the coding agent harness.

If you are familiar with Claude Code, it’s basically the same thing but fully open-source. However, I will also go over how to connect the local Qwen3.6 model to Codex and Claude Code in the next sections.

Note that coding harnesses are much more capable than LLMs by themselves. This is where I recommend being more careful about what you are running and where. For instance, when trying new (coding) agents, I like to

*   Do an audit of the (open-source) agent code base first.

*   Run it on separate hardware (e.g., my DGX Spark) or a separate user account and/or virtual environment on my machine at the very least.

Regarding the audit, I recommend looking for data sharing/egress and the default blast radius when it comes to file permissions, as well as some baseline robustness to prompt injection. The figure below attempts to summarize the main points.

[![Image 11: Figure 15](https://substackcdn.com/image/fetch/$s_!TslK!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb155092a-1166-4ee4-b2b8-47bb3d1e3382_7296x5062.png)](https://substackcdn.com/image/fetch/$s_!TslK!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb155092a-1166-4ee4-b2b8-47bb3d1e3382_7296x5062.png)

Figure 15: Practical audit checklist before running an installed coding agent harness.

Similar concerns apply to the local model serving engine (e.g., Ollama) as well. However, coding agents require even more attention as they can directly read data from your machine and manipulate files.

To do a basic audit, I recommend the following:

1.   Clone the repo:

1.   Ask a trusted agent you used before (like GPT 5.5 in Codex or Opus 4.8 in Claude Code) to review it with a focused prompt. Something like the following:

> You are auditing ./qwen-code before I install or run the agent on my machine.
> 
> 
> Focus only on practical local-machine risk from the installed agent and the code paths that create it:
> 
> 
> *   install scripts and package lifecycle hooks
> 
> *   shell command execution by the agent
> 
> *   file read/write boundaries at runtime
> 
> *   secret handling and environment-variable inheritance
> 
> *   how repo files, project instructions, and tool output can influence the agent
> 
> *   MCP, plugin, extension, or tool integrations
> 
> *   network calls and telemetry
> 
> *   update mechanisms after installation
> 
> *   terminal escape/output handling
> 
> *   data egress and data residency
> 
> 
> 
> Ignoring internet downloads that are strictly required for installation, check whether the installed agent can send prompts, files, telemetry, logs, identifiers, or metadata to remote servers when I use a local model through Ollama. Ignore cloud-model configurations.
> 
> 
> Do not infer risk from the project owner alone. Identify concrete endpoints, SDKs, default providers, environment variables, config defaults, and docs that control network behavior, including any endpoints operated in foreign countries or by third-party companies.
> 
> 
> Do not do broad style review. Do not refactor. Produce:
> 
> 
> 1.   high-risk findings with file/line references
> 
> 2.   medium-risk concerns
> 
> 3.   network/data-egress findings, including any foreign, third-party, or China-linked endpoints or defaults
> 
> 4.   commands I should avoid running until reviewed
> 
> 5.   settings or environment variables that reduce local-machine risk
> 
> 6.   a short recommendation: safe to test in sandbox, safe to use, or do not run
> 
> 
> 
> For each item, say whether it is expected behavior for a coding agent or inherently riskier than Codex or Claude Code.

Below is a summary of the main findings (because the full report may be a bit boring and too long for this article):

1.   **Local execution** Qwen Code can run shell commands on our machine through its shell tool but there are strict approval controls unless permissive modes such as `--yolo` are enabled. This is expected for a coding agent, and it’s actually what makes it useful in practice. But of course it becomes risky if run unsandboxed or with a full environment containing secrets.

2.   **Data egress** Even with local Ollama, Qwen Code can send usage telemetry and metadata to Alibaba/Aliyun endpoints unless usage statistics and telemetry are disabled (more on that below). This is riskier than a local-only setup because model prompts may stay local, but session IDs, tool metadata, model info, and local base URL metadata can still leave the machine. But again, this is also common among all kinds of tools (yes, Codex and Claude do that as well).

3.   **File and secret boundaries** Workspace files are readable by default, while writes generally require approval and include some overwrite protections. This is good and standard agent practice.

4.   **Prompt injection surfaces** Repo instructions, tool output, MCP tools, extensions, and project config can influence the agent’s behavior. Prompt injection attacks can be reduced via the approval gates mentioned above. This is normal for coding agents, but untrusted repos should be treated as hostile by default because they can steer the agent toward reading files, running commands, or sending data through approved tools.

Regarding the main privacy concerns in point 2, most of it is fixable via a custom `~/.qwen/settings.json` with the following contents:

The `"general": { "enableAutoUpdate": false }` setting is a tradeoff. Security fixes will not be installed automatically, but I prefer having explicit control over when updates happen instead of letting the tool pull and apply new code in the background.

By the way, cline ([https://github.com/Cline/Cline](https://github.com/Cline/Cline)), Codex ([https://github.com/openai/codex](https://github.com/openai/codex)), and Claude Code have similar telemetry data sharing defaults that would need to be disabled explicitly.

(Note that Claude Code doesn’t have an official open-source version of their codebase, which makes trusting it even trickier, and it does seem to send data to both Anthropic and Datadog.)

Either way, overall, it seems Qwen-Code follows standard practices, and as of this writing, there is no particular concern that is non-standard for coding agents.

If we accept the reported findings and risks (personally, I didn’t see any red flags), we can now proceed with the installation and hook up our local Qwen3.6-35B-A3B model to Qwen Code (and Codex and Claude Code in the next sections).

As mentioned before, I preferably experiment with and run coding agents, which can read and edit local files, on a separate machine (in my case a DGX Spark, but it could also be a separate Mac or Linux workstation). Alternatively, I would run it in a VM or set up a separate macOS or Linux user account as a practical middle ground.

(I heard from some friends that they also rent servers for that, like Linode or Heroku, for tinkering purposes. However, instead of the monthly hosting costs for a somewhat capable machine, I would probably rather get a relatively cheap $200-500 hardware box, or even an old retired laptop, and run a local harness and then use a stronger open-weight model hosted in the cloud via Ollama cloud models, OpenRouter, etc if you are looking for alternatives to GPT or Claude.)

Anyways, let’s install Qwen-Code. The listed options include, e.g.,

`curl -fsSL https://qwen-code-assets.oss-cn-hangzhou.aliyuncs.com/installation/install-qwen-standalone.sh | bash`
and

However, running the commands above assumes that the published artifacts match the code we just reviewed in the GitHub repo. If we are extra careful/paranoid, we can also build it ourselves from the GitHub repo. Be warned, this is more manual/messier though (I recommend executing them one at a time instead of copy & pasting the whole block into the terminal):

After completing the installation, we can now launch the Qwen-Code client via the qwen command from the terminal to complete the setup and connect to the locally served LLM.

For this, after running the qwen command, we select “Custom Provider”, as shown below.

[![Image 12: Figure 16](https://substackcdn.com/image/fetch/$s_!gthq!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff90bd7a1-3a3d-499f-8712-e91ead97d7c5_5303x3747.png)](https://substackcdn.com/image/fetch/$s_!gthq!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff90bd7a1-3a3d-499f-8712-e91ead97d7c5_5303x3747.png)

Figure 16: Choose “Custom Provider,” which lets us connect the Ollama LLM.

Ollama uses the OpenAI API standard. So, next, we follow the on-screen setup guide and choose the “OpenAI-compatible” option.

[![Image 13: Figure 17](https://substackcdn.com/image/fetch/$s_!5LZX!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F85061c05-d5db-4c83-b7bd-6f398f30b7c0_6980x4928.png)](https://substackcdn.com/image/fetch/$s_!5LZX!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F85061c05-d5db-4c83-b7bd-6f398f30b7c0_6980x4928.png)

Figure 17: Since Ollama follows the OpenAI API standard, we choose “OpenAI-compatible” here.

Next, we need to provide the API endpoint of the running Ollama application that serves our local LLM. Usually that’s the local

address by default. We enter `http://127.0.0.1:11434/v1`(including the /v1) since that’s the OpenAI-compatible base URL.

[![Image 14: Figure 18](https://substackcdn.com/image/fetch/$s_!xSSj!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F24752ae3-df6e-49b2-a788-e09c80de4ab9_6048x4272.png)](https://substackcdn.com/image/fetch/$s_!xSSj!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F24752ae3-df6e-49b2-a788-e09c80de4ab9_6048x4272.png)

Figure 18: Configure Qwen Code to use Ollama’s local OpenAI-compatible endpoint, `http://127.0.0.1:11434/v1`.

Next, we enter `ollama` as our custom provider.

[![Image 15: Figure 19](https://substackcdn.com/image/fetch/$s_!ALIe!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F84cec218-a150-429c-8ee8-0e9bb20140cc_7165x5058.png)](https://substackcdn.com/image/fetch/$s_!ALIe!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F84cec218-a150-429c-8ee8-0e9bb20140cc_7165x5058.png)

Figure 19: Enter `ollama` as the API key placeholder for the local custom provider.

Next, we can select the available models. These are the ones that we downloaded via `ollama pull`. You can enter only a single model or multiple ones separated by commas. You can double-check the list of downloaded models via `ollama list`. By the way, you can always add more models easily later (I’ll explain after completing the setup).

[![Image 16: Figure 20](https://substackcdn.com/image/fetch/$s_!Tv_T!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F73a24db2-f86e-4a56-9fdd-48543e379652_7612x5372.png)](https://substackcdn.com/image/fetch/$s_!Tv_T!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F73a24db2-f86e-4a56-9fdd-48543e379652_7612x5372.png)

Figure 20: Select the local Ollama models that Qwen Code should make available through the custom provider.

We are almost done! In step 5/6, we of course select “Enable thinking” mode, which will result in higher token usage but the better resulting problem-solving capabilities are worth it.

[![Image 17: Figure 21](https://substackcdn.com/image/fetch/$s_!-FWK!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffa35d486-1a7a-429c-80c0-5ff4b76e0468_6516x4602.png)](https://substackcdn.com/image/fetch/$s_!-FWK!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffa35d486-1a7a-429c-80c0-5ff4b76e0468_6516x4602.png)

Figure 21: Enable thinking mode for the local model provider.

And that’s basically it. Step 6 is basically a review step that we can confirm by pressing “Enter”.

Congratulations, you should now have a working fully-local LLM workflow set up. The usage is pretty much similar to Claude Code, where you can use / commands for various functionality. E.g., you can switch models via the `/model` command, as shown below.

[![Image 18: Figure 22](https://substackcdn.com/image/fetch/$s_!qDRU!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcaabf02c-9794-49a3-b8b1-f0b45bfa056d_8590x6060.png)](https://substackcdn.com/image/fetch/$s_!qDRU!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcaabf02c-9794-49a3-b8b1-f0b45bfa056d_8590x6060.png)

Figure 22: Use `/model` to switch models.

By the way, as I mentioned before, it’s relatively easy to add new models from ollama. Once you pull a new model via `ollama pull`, you can add it as a new entry in `~/qwen/settings.json`. Here, just copy & paste an existing entry into the file and change the “id” and “name” to that of the Ollama model name.

[![Image 19: Figure 23](https://substackcdn.com/image/fetch/$s_!6F4L!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F563e2c42-f6dc-4c35-a6d7-92247e52470b_7176x4758.png)](https://substackcdn.com/image/fetch/$s_!6F4L!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F563e2c42-f6dc-4c35-a6d7-92247e52470b_7176x4758.png)

Figure 23: We can add new ollama models by editing the `~/qwen/settings.json` config file. Here, `"xxxxx"` is the name of the ollama model name, e.g., `"nemotron-3-nano:30b"`.

By the way, to update the qwen-code tool once in a while, if we used the git clone & local build route, we can pull a recent GitHub snapshot and update it as follows:

Now that we have a fully working, local coding agent, the question is: how well does it perform, and is it actually good enough for my tasks? Of course, there are benchmarks for this, but in my opinion, nothing beats trying it for yourself on some of your workflow. In other words, this basically means using it for a day or two to decide whether it meets your bar.

I also recommend compiling a small set of tasks that reflect your common coding agent usage. And if you come upon a particularly challenging one when working on a given project, it may not be a bad idea to add it to this set to evaluate future models.

As an example of what I mean, I shared a relatively small, simple, and general set of tasks we can use to test the agents here on GitHub: [https://github.com/rasbt/local-coding-agent-evals/tree/main/agent-problem-pack](https://github.com/rasbt/local-coding-agent-evals/tree/main/agent-problem-pack). This is basically an extension of the tasks from the Local LLM Setup section.

The details on how to run these are in the GitHub README: [https://github.com/rasbt/local-coding-agent-evals/tree/main/agent-problem-pack#quick-start-running-benchmarks-manually](https://github.com/rasbt/local-coding-agent-evals/tree/main/agent-problem-pack#quick-start-running-benchmarks-manually).

Below is the outcome for the different LLMs tested in Qwen-Code.

As we can see, both the Qwen3.6 and North Mini Code 35B-A3B models solve 4 out of 5 of these problems. Gemma 4 E2B fails a lot. Out of curiosity, I also added the a bit older Nemotron 3 Nano model. It has a similar size and compute performance as the aforementioned Qwen and North models, and it performs similarly well.

[![Image 20: Figure 25](https://substackcdn.com/image/fetch/$s_!6qVa!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faffbd868-7ef3-46bf-8002-c335ba662f3b_4339x5673.png)](https://substackcdn.com/image/fetch/$s_!6qVa!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faffbd868-7ef3-46bf-8002-c335ba662f3b_4339x5673.png)

Figure 25: Nemotron 3 Nano architecture overview from my [LLM Gallery](https://sebastianraschka.com/llm-architecture-gallery/#card-nemotron-3-nano-30b-a3b)

After setting up the local coding agent (and the article exceeding 5000 words), this would probably be a reasonable place to stop. However, as a bonus, I also thought it might be interesting to add brief Codex and Claude Code notes for completeness.

Unfortunately, as far as I know, the Codex UI does not support non-OpenAI models, but we can use the Codex CLI to run our Ollama models.

If you haven’t installed the OpenAI Codex CLI yet, you can get and install it analogously to qwen-code from their open-source GitHub directory: [https://github.com/openai/codex](https://github.com/openai/codex) (Yes, the Codex CLI is open source!)

I will spare you the lengthy listing of the commands and recommend checking the repo’s README instead for the official instructions. (Cloning the repo and running an audit similar to qwen-code is not a bad idea here, as well.)

Then, once installed, there are multiple ways to enable local model use. In my opinion, the most convenient way is to set up a separate config `~/.codex/ollama.config.toml` (inside the existing `~/.codex` folder) with some default options:

[![Image 21: Figure 26](https://substackcdn.com/image/fetch/$s_!BtrE!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcc617934-d2c5-4aba-948a-fcf69c2740a4_6972x2665.png)](https://substackcdn.com/image/fetch/$s_!BtrE!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcc617934-d2c5-4aba-948a-fcf69c2740a4_6972x2665.png)

Figure 26: Set up a separate Ollama profile for Codex for convenience.

Then, we can still use `codex` to launch the regular “Codex with GPT 5.5” mode and use our Ollama model via `codex --profile ollama`.

[![Image 22: Figure 27](https://substackcdn.com/image/fetch/$s_!-U-C!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F274d25ed-c178-4f1c-be8d-c27e38fef766_6902x4486.png)](https://substackcdn.com/image/fetch/$s_!-U-C!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F274d25ed-c178-4f1c-be8d-c27e38fef766_6902x4486.png)

Figure 27: Launch Codex using a local Ollama model.

When rerunning the test cases from the Agent Capability Assessment section, to my surprise, Qwen3.6 does actually perform better via Codex compared to its “native” Qwen-Code coding harness, as shown below.

[![Image 23: Figure 28](https://substackcdn.com/image/fetch/$s_!unv8!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8deaf1b1-5fe2-451a-987c-b2b69e4415d4_6474x3074.png)](https://substackcdn.com/image/fetch/$s_!unv8!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8deaf1b1-5fe2-451a-987c-b2b69e4415d4_6474x3074.png)

Figure 28: Small local agent capability benchmark in Codex.

Even though this is just a small set of benchmarks, it suggests that using Codex as the universal coding agent harness may not be such a bad idea after all.

Of course, there is also the popular Claude Code agent harness that we could use as a harness around our local LLMs. While very popular and capable, this is probably my least favorite option for local setups because the codebase is proprietary. That also means we cannot readily inspect and/or disable Anthropic’s data logging practices.

To set it up, if you don’t have Claude Code already installed on your machine, I suggest checking the official docs for recommended installation commands: [https://code.claude.com/docs/en/quickstart](https://code.claude.com/docs/en/quickstart).

Claude Code itself does not expose the same local-provider configuration path as Codex. However, Ollama provides an integration via `ollama launch claude`: [https://docs.ollama.com/integrations/claude-code](https://docs.ollama.com/integrations/claude-code)

I.e., we can execute `ollama launch claude` to run the Claude Code harness with an Ollama model.

By the way, this also works for codex via `ollama launch codex`, but I personally prefer the `codex --profile ollama` route we discussed earlier, as it gives me a bit more insight and control about how things works etc.

[![Image 24: Figure 29](https://substackcdn.com/image/fetch/$s_!un9p!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F70cdf586-90c1-41c4-a867-710b3ada7922_4436x2889.png)](https://substackcdn.com/image/fetch/$s_!un9p!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F70cdf586-90c1-41c4-a867-710b3ada7922_4436x2889.png)

Figure 29: Claude Code with a local Qwen3.6 model through Ollama.

However, as a user, it feels like Claude Code takes much longer to come up with a solution. It probably has a much higher token usage. So, below, I additionally looked at the token usage of all three harnesses.

As we can see, Claude Code uses by far the most tokens on average, Codex the least.

When it comes to the little agent capability assessment benchmark, the Qwen and North Mini Code models also get 5/5, and even the small Gemma 4 model does ok!

Interestingly, we can also see that the token usage is largely driven by the harness, not the LLM itself. I.e., among all three LLMs that are capable of solving (almost) all 5 tasks, they all use the same number of tokens (e.g., Qwen3.6 uses roughly the same number of tokens as North Mini Code and Nemotron 3 Nano when used inside Claude Code). Only Gemma 4 uses fewer tokens, but it also fails almost all tasks, likely because of insufficient tool-calling capabilities where the tasks interrupt early.

For reference, below is again the summarized task-success rate.

[![Image 25: Figure 31](https://substackcdn.com/image/fetch/$s_!NtYS!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F72052824-9bc8-4504-961c-7f9d053804d0_1844x498.png)](https://substackcdn.com/image/fetch/$s_!NtYS!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F72052824-9bc8-4504-961c-7f9d053804d0_1844x498.png)

Figure 31: Summarized task success rates.

Anyway, the takeaway here is that if more tokens help the model-harness combination to solve more (and more complex) problems, great! But if we have two harnesses that both have an equal task success rate, a harness that uses 50% fewer tokens (e.g., Codex over Claude Code), then this is a huge win, because it will make tasks run twice as fast.

However, the big caveat here is that task correctness is a necessary criterion, but it doesn’t measure code quality and readability, which are hard to assess automatically.

PS: I tried to analyze why Claude Code uses more tokens, and it seems that the difference mainly comes from input tokens rather than output tokens. In other words, Claude is not writing twice as much. The logs suggest that Claude is repeatedly feeding more context back into the model across turns, including previous messages, tool calls, command outputs, and file contents. For example, one Claude run used about 578k input tokens but only about 4.5k output tokens across 25 turns. So the likely explanation is that Claude’s harness accumulates or accounts for a larger prompt-side history during multi-step agent runs.

So far, all the setups we discussed assumed that we were running the local LLM on the same machine as the coding harness.

However, what if we developed some trust in the coding agent harness and want to use it on our main Mac while the model itself is hosted on a different machine, e.g., a DGX Spark?

In my opinion, the best (or most convenient) setup is an SSH tunnel from the Mac to the DGX.

First, I suggest quitting Ollama on the Mac or changing the `11434` to something else below.

Assuming we quit the Ollama app on the Mac, check that the following returns an empty output to indicate that Ollama is not available:

Then run the following command on that Mac in a terminal window on the Mac side:

That command means that we open an SSH connection to `DGX-Spark` as user `rasbt`, which you need to adjust to whatever your username and machine name are. Then, the command forwards the Mac’s local port `11434` to `127.0.0.1:11434` on the DGX because of `-L 11434:127.0.0.1:11434`. Note that this is the Ollama address.

The terminal running `ssh -N -L ...` will look like it is hanging. That is normal. Keep it open while you use Qwen Code, Codex, or Claude Code. Press `Ctrl-C` to stop the tunnel.

So after it is running, use this on your Mac to see if the Mac can indeed access the ollama models from the DGX:

If that returns the DGX models, your Mac tools can use the DGX Ollama server as if it were local.

Then, just use Qwen Code and Codex just like above.

For Claude via `ollama launch claude`, the key is that the Mac-side `ollama` command must see the tunneled endpoint. If needed:

We focused on Qwen Code, Codex, and Claude Code because they are the most direct fit for coding-agent workflows. OpenClaw and Hermes are also capable, but they are broader agent harnesses. They are better suited when you want one agent to coordinate across tools, apps, browsers, terminals, and longer-running workflows.

For coding work, I recommend starting with Qwen Code, Codex, or Claude Code first (and there are also many other interesting coding harnesses like OpenCode, Cline, Pi, and Noumena Code). And I would treat OpenClaw and Hermes as interesting follow-up options for things beyond coding rather than the first baseline for this local coding-agent setup.

This was a long article with lots of information and configuration. If there are a few main takeaways, I’d say that it’s not the mechanistic setup pipeline but rather the considerations when running coding agents locally. That is, the most important part is not getting one specific tool installed, but understanding the model-serving layer, the agent harness, the permission model, and how to evaluate whether the setup actually solves coding tasks reliably.

Of course, GPT 5.5 and Opus 4.8 are currently better than smaller open-weight models that run on a Mac or DGX Spark. But the newer Mixture-of-Experts models in the 30-35B range (such as Qwen3.6, North Mini Code, and Nemotron 3 Nano) are all very, very capable and really sufficient for a lot of tasks. And yes, they run with the same token speed as GPT 5.5 through a Pro sub