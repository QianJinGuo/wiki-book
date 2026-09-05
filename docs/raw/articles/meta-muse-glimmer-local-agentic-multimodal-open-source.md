---
source: rss
source_url: https://huggingface.co/blog/muse-glimmer
ingested: 2026-08-14
feed_name: Hugging Face Blog
source_published: 2026-08-10
content_source: github-raw
sha256: e91862b3557ff145120697c458bf7f2365e0484f56fdcba577b25aa7b923fbd1
---

# infer
curl -s http://127.0.0.1:8000/v1/chat/completions \
    -H 'Content-Type: application/json' \
    -d '{
      "model": "meta-models/Muse-Glimmer-30B",
      "messages": [
        {"role": "user", "content": "Explain tensor parallelism briefly."}
      ],
      "temperature": 0.0,
      "max_tokens": 256
    }'

```

## Fine-tuning with TRL

You can use TRL to fine-tune Muse Glimmer using various methods from SFT to Async GRPO. We have run two experiments on bf16 with Hopper-class GPUs with 80GB VRAM each.

| Workload | Practical minimum |
| --- | ---: |
| Inference / eval, BF16 | 1×80 GB H100 |
| LoRA SFT, BF16 | 1×80 GB H100, microbatch 1 + checkpointing |
| Full SFT, BF16 | 8×80 GB H100 with FSDP/ZeRO-3 |
| LoRA GRPO, Transformers rollouts | 1×80 GB H100, but slow/tight |  
| LoRA GRPO, separate vLLM rollout server | 8×H100: 4 rollout + 4 training |
| Full-finetune GRPO | 8 GPUs is usually insufficient |

As part of this release, we ship an example to fine-tune [Muse Glimmer on small split of MolmoWeb dataset](https://huggingface.co/merve/smol-vision/blob/main/qlora_click_grounding.ipynb). This shows how to make model generate structured outputs and how to fine-tune on images.

We also experimented with running the model on [OpenCode with AsyncGRPO example](https://github.com/huggingface/trl/blob/main/examples/scripts/openenv/opencode.py). Model shows strong coding capabilities, so we encourage you to try training with coding environments in OpenEnv and TRL.

## Demos

Here are some fun ways to try out Muse Glimmer. In our opinion, the coolest thing about this model is that it is a local scale personal assistant that can code. That means you can make it do things like, quantize itself, find quantized weights on the Hub, deploy itself to inference endpoints, and even optimize itself for specific hardware! Let’s go team local 🚀

## Connect OpenClaw to Muse Glimmer

Assume the Inference Endpoint exposes an OpenAI-compatible `/v1` API.

Set `HF_TOKEN` in the OpenClaw gateway environment, then add this to `~/.openclaw/openclaw.json`:

<details>
<summary>OpenClaw configuration</summary>

```json5
{
  models: {
    mode: "merge",
    providers: {
      muse: {
        baseUrl: "https://YOUR-ENDPOINT.endpoints.huggingface.cloud/v1",
        apiKey: {
          source: "env",
          provider: "default",
          id: "HF_TOKEN"
        },
        api: "openai-completions",
        authHeader: true,
        models: [{
          id: "meta-models/Muse-Glimmer-30B",
          name: "Muse Glimmer",
          reasoning: false,
          input: ["text", "image"],
          contextWindow: 32768,
          maxTokens: 8192
        }]
      }
    }
  },
  agents: {
    defaults: {
      model: { primary: "muse/meta-models/Muse-Glimmer-30B" }
    }
  }
}
```

Restart OpenClaw:

```bash
openclaw gateway restart
```

Validate from a fresh session:

```bash
openclaw agent --message "Reply with: muse-ready"
```

</details>

Use the exact model ID returned by the endpoint’s `/v1/models` response if it differs.

### Hey Muse Glimmer, quantize yourself

If we hook up Muse Glimmer to the [Hugging Face MCP](https://huggingface.co/mcp) and update its [`AGENTS.md`](http://AGENTS.md) we give it the capability to find a quantized version of itself on the hub and run locally. This is handy if you want to work on something private, or just cut costs.

If you do this a second time, Muse Glimmer will find the cached weights and switch to them, so feel free to add a convenient command like `/spawn`. 

Muse Glimmer inspects the machine and Hub, selects or creates a Q4_K_M GGUF, launches llama-server, and validates model discovery and chat completion. The result is a smaller local build behind an OpenAI-compatible API. Here’s the prompt we added to `AGENTS.md`.

[https://huggingface.co/buckets/huggingface/muse-glimmer-assets/resolve/Muse%20Glimmer%20Quantisation%20Demo%20-%20explained.mp4?download=true](https://huggingface.co/buckets/huggingface/muse-glimmer-assets/resolve/Muse%20Glimmer%20Quantisation%20Demo%20-%20explained.mp4?download=true)

By adding this to [`AGENTS.md`](http://AGENTS.md) openclaw or hermes will be able to solve the rest.

<details>
<summary>Local quantization prompt</summary>

```text
## Local model deployment

When asked to deploy locally, perform the work; do not give instructions.

1. Inspect hardware and the Hugging Face cache.
2. Search the Hub for compatible GGUF weights using `apps=llama.cpp`; confirm exact filenames through the model-tree API.
3. Prefer an existing suitable GGUF, normally `Q4_K_M`. Treat `mmproj-*.gguf` as projector weights.
4. If no GGUF exists, download the source weights, convert with `convert_hf_to_gguf.py`, then quantize with `llama-quantize`.
5. Preserve source weights and record the repository, revision, filenames, and quantization.
6. Start `llama-server` with an `onyx` alias and an OpenAI-compatible endpoint.
7. Validate `/v1/models` and `/v1/chat/completions`, requiring non-empty, correct content.
8. Report concise progress and logs. Claim completion only after validation passes.
```

</details>

### Hey Muse Glimmer, deploy yourself

Muse Glimmer can also take care of the opposite. Let’s get Glimmer to deploy itself on Hugging Face Inference Endpoints. Which is useful if you want to speed up on some cutting edge hardware.

N.B. You can also just deploy [Muse Glimmer to Inference Endpoints](https://endpoints.huggingface.co/huggingface/new/meta-models/Muse-Glimmer-30B) directly and connect your agent.

Muse Glimmer pins the model revision, deploys it to a protected Hugging Face Inference Endpoint, and verifies health, model discovery, and chat completion. It then connects the Claw agent with secrets and rollback preserved. Here’s the prompt we added to [`AGENTS.md`](http://AGENTS.md). Muse glimmer will also need the [Hugging Face MCP](https://huggingface.co/mcp) and/or the [Hugging Face CLI and Skills](https://huggingface.co/docs/hub/en/agents-skills).

<details>
<summary>Inference Endpoint deployment prompt</summary>

```text
## Hugging Face Inference Endpoint deployment

When asked to deploy on Hugging Face Inference Endpoints, perform the work; do
not give instructions.

1. Inspect Hugging Face authentication, the current model repository, and any
   existing endpoints.
2. Confirm the exact model repository and immutable revision through the Hub
   API; inspect its architecture, configuration, and chat template.
3. Confirm that the model is supported by vLLM, then deploy or update a
   protected Inference Endpoint using the managed native vLLM engine.
4. Choose an available region and the smallest suitable accelerator. Use one
   replica and enable scale-to-zero when supported.
5. Preserve the previous endpoint configuration for rollback. Do not expose
   tokens, publish private weights, or replace an unrelated endpoint.
6. Wait for the endpoint to become ready. If startup fails, inspect the logs
   and report the actual blocker rather than repeatedly changing settings.
7. Validate `/health`, `/v1/models`, and `/v1/chat/completions`, requiring the
   expected model and non-empty, correct content. When agent use is required,
   also validate a real structured tool call.
8. Configure the Claw agent to use the endpoint's OpenAI-compatible `/v1` URL,
   storing credentials as secrets and retaining the previous provider as
   rollback. Test the connection in a fresh session.
9. Report concise progress and finish with the repository, revision, engine,
   hardware, endpoint URL, scaling state, and validation results. Claim
   completion only after every required check passes.
```

</details>

### Hey Muse Glimmer, optimize yourself

Finally, let’s get Muse Glimmer to do some light RSI. We can instruct our agent to optimize its own inference engine for specific hardware, in this case a Nvidia H100. To do this, the agent will need to use another inference engine, like Inference Endpoints above.

Muse Glimmer benchmarks its own single-H100 serving stack, testing one reversible change at a time while holding the workload fixed. It keeps only correctness-passing gains and finishes with the fastest reproducible configuration. Here’s the prompt we added to [`AGENTS.md`](http://AGENTS.md). Muse glimmer need the [Hugging Face MCP](https://huggingface.co/mcp) and the [Hugging Face CLI and Skills](https://huggingface.co/docs/hub/en/agents-skills).

<details>
<summary>Self-optimization prompt</summary>

```text
You are Muse Glimmer acting as an autonomous inference-optimization engineer for your own serving stack.

Goal: maximize valid single-H100 aggregate completion throughput in tokens/second.

Protocol:
1. Establish a correctness-passing baseline.
2. Test one reversible optimization at a time.
3. Keep the prompt, concurrency, sampling, request count, warm-up, and decode length fixed.
4. Reject results that fail correctness or prefix checks.
5. Record every experiment chronologically with its configuration, raw throughput, correctness, and delta.
6. Keep improvements and revert regressions.
7. Stop after six consecutive regressions or when the experiment budget is exhausted.
8. Report the best valid configuration and exact reproduction command.

Create a minimal scientific animation of the results:
- white background;
- raw tokens/second—never normalize;
- one point revealed per experiment;
- connect every point chronologically;
- begin with the lowest valid result;
- stop at the best result;
- export as a GIF.

Never fabricate, interpolate, or count correctness-failing measurements.
```

</details>

[https://huggingface.co/buckets/huggingface/muse-glimmer-assets/resolve/onyx-optimization-progress.gif?download=true](https://huggingface.co/buckets/huggingface/muse-glimmer-assets/resolve/onyx-optimization-progress.gif?download=true)


### Hey Muse Glimmer, research the Hub

Try Muse Glimmer as a Hugging Face research agent. The Gradio Space sends each model request to a private Hugging Face Inference Endpoint through its OpenAI-compatible API. It also connects to the official Hugging Face MCP server, giving the agent read-only tools to search and inspect Hub repositories, models, datasets, Spaces, documentation, and papers.

<iframe
  src="https://burtenshaw-muse-glimmer-chat.hf.space"
  frameborder="0"
  width="100%"
  height="700"
  allow="clipboard-read; clipboard-write"
></iframe>

## Wrapping Up

We are happy to welcome Muse Glimmer to the Hugging Face Hub. Try [Muse Glimmer](https://huggingface.co/meta-models/Muse-Glimmer-30B) with your local coding setups today!

