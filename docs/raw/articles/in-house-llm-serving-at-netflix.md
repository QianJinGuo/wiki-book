---
source: rss
source_url: https://netflixtechblog.com/in-house-llm-serving-at-netflix-a5a8e799ea2c?source=rss----2615bd06b42e---4
ingested: 2026-07-18
feed_name: Netflix Tech Blog
source_published: 2026-07-17
sha256: 96edbf54de18f6654a5fbc141266cc428352b442b62859ebbaca0c644412bee2
---

# In-House LLM Serving at Netflix

_By AI Platform’s Model Runtime team and Inference team_

### Introduction

Most organizations consume LLMs through hosted APIs. Netflix went further — we run the full stack ourselves, from model deployment through inference, inside our existing production environment rather than a separate ML silo. Some of those decisions weren’t obvious, and a few revealed their trade-offs only under production load.

This post focuses on the choices where alternatives were seriously considered: engine selection, model packaging, API surface design, deployment strategy, and output constraints enforcement. The goal is to share not just what was built, but why — and what production revealed that the design phase didn’t anticipate.

### Architecture Overview

Member-scale ML at Netflix is fronted by a unified JVM-based serving system that handles the end-to-end flow for downstream consumers: routing and A/B test logic, candidate generation, feature fetching, inference, post-processing, and logging at each stage. Both real-time and cached batch paths are supported. Figure 1 shows the two ways callers reach inference today: the gRPC path through this serving system and a direct HTTP path used by newer LLM-driven applications.

Where inference runs depends on the model. Small CPU models run in-process, avoiding remote-call overhead. Larger models need GPUs — the serving system handles pre- and post-processing locally but delegates inference to a remote service, **Model Scoring Service (MSS)**. MSS is the shared inference backend, supporting XGBoost, TensorFlow, PyTorch, and LLMs behind a unified interface, with NVIDIA Triton Inference Server underneath managing model loading, batching, and GPU scheduling.

On top of Triton sits a Java control plane that handles deployment, versioning, health checking, autoscaling, and multi-region rollout. Model authors package their artifacts and configure the deployment; the control plane provisions GPU instances, configures Triton, and orchestrates zero-downtime upgrades.

Figure 1. Serving Architecture Overview

### Design Decisions and Implementation

Four decisions shape this platform — engine, packaging, API surface, and rollout — presented in dependency order, since each one constrains the next.

#### vLLM as the Paved-Path Engine

The platform was originally built on TensorRT-LLM, a performant inference engine at the time and already integrated with Triton — the compute backend in use within MSS.

By summer 2025, two things had shifted: open-source engines had largely closed the performance gap with specialized stacks, and our workload mix had broadened to include embedding generation, prefill-only inference for ranking and retrieval, autoregressive decoding, and custom models with non-trivial per-step constraint logic. We re-benchmarked against this mix and **selected vLLM as our paved-path engine** on operational fit:

  * **Loads custom model architectures without a multi-step compilation pipeline** — faster iteration on non-standard models.
  * **Extensibility hooks for custom decoding logic** — necessary for the constrained-decoding work described later.
  * **Debuggability** — easier to inspect failures and intermediate state than with a compiled engine in earlier TensorRT-LLM.
  * **Familiarity** — many ML practitioners were already using vLLM in research, which cut the research-to-production handoff cost.



#### Integrating vLLM into Triton

With vLLM picked, the next decision was how to package models for it. Triton supports two ways, and the choice has significant implications for maintainability — specifically, how tightly model artifacts are coupled to frontend upgrades.

  * **Python backend.** The author defines explicit input/output tensor specs at packaging time. These specs are frozen in the artifact and must match what the third-party vendor’s frontend’s request builder expects, so every frontend upgrade that touches I/O specs requires a coordinated change to packaging code; otherwise, requests fail at runtime.
  * **vLLM backend.** The artifact is just a JSON config pointing to the model weights and tokenizer. Triton’s vLLM backend reads this config and generates I/O tensor specs dynamically at deployment time — the author never defines them. Models and frontend evolve independently.



The vLLM backend is the architecturally correct default. Two things bit us in production:

  * **Triton/vLLM version mismatch.** Triton’s vLLM backend is compiled against a specific vLLM API surface. When the two drift — for example, Triton 25.09 importing vllm.engine.metrics, a module removed in vLLM 0.11.2 — the backend fails to load entirely. The platform has to pin compatible versions when baking the service image, and prevent model authors from overriding the vLLM version at packaging time.
  * **Custom model logic.** The vLLM backend expects a standard HuggingFace-compatible model and handles the full inference lifecycle. Models needing custom preprocessing, postprocessing, or non-standard execution — ensemble pipelines, custom tokenization — must use the Python backend, which gives full control over execute(). This escape hatch will likely remain necessary for a subset of models.



#### Ecosystem-Compatible HTTP Frontend

With engine and packaging settled, the next question is how callers reach the system. A key design goal of our system was that LLM models should **NOT** be special snowflakes. Every model — XGBoost ensemble or large-scale LLMs — is scored via the same gRPC call, so we reuse the same client libraries, health checking, and deployment pipelines. Given that the OpenAI-compatible API interface has become the de facto interface for the LLM ecosystem — inference engines, orchestration frameworks, evaluation tools, and client libraries all speak it — so we **expose the OpenAI-compatible API as an additional frontend alongside gRPC**.

The payoff shows up in the experimentation-to-production path: graduating from a hosted model to a fine-tuned self-hosted one — for quality, latency, cost, or data privacy — is nearly seamless. Same API, minimal code changes.

Behind the API, the implementation reuses [NVIDIA’s Triton OpenAI-compatible frontend](<https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/client_guide/openai_readme.html>). It starts an embedded Triton server, wraps it in a TritonLLMEngine that converts request schemas into Triton inference requests, and serves responses through FastAPI. KServe HTTP/gRPC frontends are enabled alongside, so the same Triton instance remains accessible to the Java control plane over gRPC. Adopting Triton’s frontend directly exposed one gap: response_format — accepted by the schema — was silently dropped before reaching vLLM, so that a caller requesting JSON output proceeded without guided decoding constraints and could receive malformed JSON with no error surfaced by the platform. We git-subtreed and patched the frontend to translate response_format into vLLM’s guided decoding parameters at request time.

#### Deployment Strategies

With API surface and engine in place, the question that remains is how new versions roll out without dropping requests. GPU deployments take longer to bring up than CPU services, and the I/O schema may change between model versions — adding a coordination problem on top. The platform offers two strategies:

  * **Red-Black** deploys a new version alongside the current one. Once the new instance passes health checks, traffic shifts in phases — the new version scales up while the old scales down at the same rate. If any step fails, the system triggers an atomic rollback. Red-Black is the right choice when the model interface is stable. Production revealed a **coordination gap** when a new version requires an I/O schema change (e.g., new tensor dimensions): the upstream consumer can’t update its config until the new model is fully live, so it inevitably sends “old” requests to a “new” deployment during the migration window, and those fail.
  * **Versioned** solves that gap by maintaining an independent deployment for every (modelId, modelVersion) pair. Multiple versions serve simultaneously, decoupling model deployment from consumer updates: the consumer waits for the new version to be fully ready before switching its config, while the old version keeps serving legacy traffic. The platform cleans up older deployments after inactivity but always preserves the latest. The trade-off is a **temporary increase in GPU cost** during the transition overlap.



**We recommend embedding variable configurations** (e.g., tensor shapes) **directly into the inference model** to make it version-agnostic, so it can use the cheaper **Red-Black** path. **Versioned** is reserved for the rare cases where a breaking interface change is unavoidable.

### Operational Notes

Beyond those four decisions, two operational details are worth flagging — both hit production gaps the design phase didn’t anticipate.

#### Boot sequence

Bringing a vLLM-on-Triton instance up involves several coordinated steps before the gRPC port opens. Two are non-routine.

  * **Model caching.** Downloading large LLMs directly from S3 or Hugging Face at startup is slow enough to inflate cold-start latency past what schedulers tolerate. We materialize models on Amazon FSx at the time of model announcement, so warm starts hit a high-performance file system instead of object storage.
  * **Embedded vs standalone Triton.** When consumers need the OpenAI-compatible API, Triton runs as an embedded server inside the OpenAI-compatible frontend process; otherwise, it runs standalone. This is configured per-deployment at packaging time.



The rest of the boot sequence is mechanical: extracting the model package, installing custom vLLM plugins via Python entry_points, cleaning the Prometheus multiprocess directory, and gating the gRPC port until the engine is ready.

#### Unified metrics endpoint

The Prometheus cleanup above hints at a wider observability gap. vLLM writes metrics to PROMETHEUS_MULTIPROC_DIR as .db files; Triton reports server-level metrics through its own Prometheus endpoint. Neither is aware of the other, and Triton’s built-in bridge surfaces only 9 of 40+ vLLM metrics — missing critical ones like token throughput, KV cache utilization, and prefix cache hit rates.

We added a lightweight HTTP proxy that merges both into a single /metrics endpoint: it fetches Triton metrics via HTTP, reads vLLM metrics from disk using Prometheus’s MultiProcessCollector, and returns the combined output. Existing dashboards and alerts work without modification.

### Deep-Dive: Constrained Decoding at Scale

Some Netflix production workloads rely heavily on fine-grained control over token generation. Rather than applying business logic after inference — paying for invalid generations, then retrying or repairing — we push constraints inside the decode loop, so the model generates outputs that are compliant by construction. We implement this via vLLM’s custom logits processor interface, modeling each constraint as a state machine that evolves with the generated token history and emits token-eligibility masks at each step. Each request gets its own configured processor, since different requests apply different rules.

Getting this to scale ran across two engine versions: we initially deployed on vLLM V0 (V1 had feature gaps), then migrated to V1 in Q4 2025 once it matured. The two subsections that follow are the before-and-after.

#### Why the first implementation didn’t scale

Our initial pure-Python implementation worked functionally but hit a scaling bottleneck. In vLLM V0, custom logits processors run per-request: the GPU produces logits for the whole batch, the CPU copies them across and waits for the transfer, and then constraint logic runs sequentially for each request — sequentially because the GIL prevents Python from parallelizing the per-request work. CPU time in logit processing therefore grows linearly with batch size, hitting tail latencies. End-to-end latency becomes CPU-bound even though the model’s forward pass is batched efficiently on GPU. It’s a bottleneck invisible in single-request benchmarks that only surfaces under realistic concurrency. Figure 2 makes the serial pattern visible.

Figure 2: Logits processor serial execution on CPU with vLLM V0

#### vLLM V1 enabled a batch-level design

The structural fix arrived in vLLM V1, which moved logits processing to batch level. We rewrote our custom processor to operate on batch-level data structures, computing masks across many requests together, and reimplemented the hot path in C++ with multi-threading to step around the GIL. The V1 API requires explicit tracking of batch membership changes via update_state(batch_update) — more complex than V0’s per-request interface, but necessary to maintain correct state in a dynamically evolving batch. Figure 3 shows logits processing time staying flat as batch size grows.

Figure 3: Batched logits processor execution on CPU with vLLM V1

#### Operational hardening

Now, performance was no longer the bottleneck. But stateful constraint logic in the decode loop introduced two issues the design phase didn’t anticipate:

  * **Partial prefills.** V1 performs chunked prefilling, so a request can be prefilled over multiple engine steps. BatchUpdate lacks the granularity to tell whether a request was fully or only partially prefilled, so we added internal tracking.
  * **Preemption.** Under memory pressure, vLLM may evict a partially completed request’s KV cache and reschedule it later with a different prompt and output token list. This breaks the state machine’s assumption that the output token list grows monotonically. We detect when the token history shrinks between decode steps, reset the state machine, and reinitialize from the new prompt.



### Wrap up

We set out to build an LLM serving platform for broad production ML requirements — low latency, deep customization, and integration with existing infrastructure. The result is a system on vLLM and Triton, unified behind a consistent API, designed to give ML practitioners a fast path from experimentation to production.

The lessons were often in the details — version pinning, silent API gaps, packaging trade-offs — but addressing them has made the platform meaningfully more robust and the developer experience smoother. Next investments reflect where we expect friction:

  * **System prompt compression** to reduce prompt length without sacrificing quality.
  * **Asynchronous scheduling** of vLLM V1.
  * **Vectorized logits processors** that run as fused GPU kernels instead of CPU code.
  * **Lower-precision model variants** to decrease memory footprint and increase throughput.



We’ll continue working closely with the open-source community as this space evolves.

### Contributions

This system is the result of close collaboration and contributions from many teams within the AI Platform org at Netflix. In particular, Liping Peng designed and developed the model packaging workflow and drove the integration of Triton and vLLM with MSS to enable a unified pathway for serving LLMs. Hakan Baba, Nicolas Hortiguera, and ZQ Zhang led GPU capacity planning, system performance tuning, application integration and observability, as well as A/B test readiness and operational excellence efforts for all production models. Santino Ramos enabled vLLM for production models and optimized constrained decoding performance. Binh Tang developed the initial version of custom model serving and benchmarked different LLM serving frameworks. Lanxi Huang and Daneo Zhang built the serving development tools to enable user self-service. Lingyi Liu drove the overall system architecture and core technical decisions. Abhishek Agrawal and Shaojing Li provide management leadership to ensure alignment, prioritization and execution.

### Acknowledgements

This work heavily leverages open-source ML libraries, such as Triton, vLLM and PyTorch, etc. We’re especially grateful to the teams and contributors from the community. We also thank our partner teams in Netflix AI for Member Systems for their close collaborations and innovation on the modeling side.

* * *

[In-House LLM Serving at Netflix](<https://netflixtechblog.com/in-house-llm-serving-at-netflix-a5a8e799ea2c>) was originally published in [Netflix TechBlog](<https://netflixtechblog.com>) on Medium, where people are continuing the conversation by highlighting and responding to this story.
