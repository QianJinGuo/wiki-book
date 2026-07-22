---
title: "Popping the GPU Bubble — Moondream Photon Inference Engine"
source_url: "https://moondream.ai/blog/popping-the-gpu-bubble"
author: Moondream Engineering
ingested: 2026-07-01
type: raw
sha256: b08185dbbee42a141433f46ee5b61cca218885b6c541031de207f270f23a9a88
---

Moondream Engineering — Popping the GPU Bubble

Photon, Moondream's inference engine, achieves near-realtime VLM inference (~33ms on NVIDIA B200). This is a peek into how it delivers up to 35% higher decode throughput by optimizing how the GPU works.

June 4, 2026

How do you make an AI model run as fast as possible? This is a question we obsess over at Moondream HQ. The GPU handles all the math involved in model inference, so at first glance it doesn't seem like there's much to it: just tell it what to do and wait for the answer. But if you start looking at how it actually works under the hood, you find that the GPU often sits idle, not for lack of work, but because the CPU hasn't told it what to do next yet. This phenomenon is called a GPU bubble.

When a typical AI model generates text, it produces one token at a time (a token is a chunk of text, roughly a few characters). Each token depends on the tokens before it, a property called autoregressive, so generation is sequential. You can't compute the third token before you have the second. This decode loop involves a round trip between the CPU and GPU. The GPU does most of the heavy lifting to run the actual model, performing billions of arithmetic operations to produce the next token. But there's also a surprising amount of work done by the CPU. It selects which requests to run next, sets up the metadata the GPU needs for them, picks the actual token out of the model's output and records it, and more.

The challenge is that one token's worth of GPU work is small, while the CPU housekeeping is a fixed cost paid on every trip. If the GPU has to wait for that housekeeping before it can start the next token, it sits idle for part of every loop. This is why we get GPU bubbles.

In this post we're going to dive into how Photon hides these bubbles using a technique called pipelined decoding. The idea is to overlap the two kinds of work: we start GPU work on the next token while the CPU is still finishing the last one.

The bubble

Here's the shape of the problem. In the blocking version, every step is a baton pass. The CPU plans and launches a forward, the GPU runs it, then the CPU synchronizes, waits for the results to land, commits them, and only then starts planning the next step. This is because the plan depends on the token we select. For example, if the model indicates it has finished answering, then we need to schedule a new pending request from our queue. The GPU sits idle waiting for the CPU to finish its commit-plan-launch work.

The fix is to pipeline the loop. Launch the next forward while the current step's token is still coming back and being committed. That's the pipelined version: the forwards run back-to-back, and the CPU work is overlapped underneath them.

The reason we can is that the token we just sampled doesn't have to leave the GPU. The next forward reads it straight from GPU memory as its input. We still want a copy on the CPU eventually, to detokenize it, stream it, and decide whether the request is done, but that is bookkeeping we can do a moment later, in the background, while the next forward already runs. Not waiting on that copy is the move that removes the bubble.

Making it safe requires three things: keeping step buffers from colliding (ping-pong slots), getting the sampling order right for constrained decoding (forward now, sample later), and cleaning up after a request finishes (zombies).

Mechanism 1: Ping-pong slots

To run a decode step, the GPU needs a working set of buffers: a place to stage the input, a place for the model to write its output, a place to land the sampled token, and some bookkeeping the attention kernel needs. These buffers are allocated once and reused on every step. Fixed buffer addresses are also needed for capturing the decode step once as a CUDA graph and replaying it, reducing kernel launch overhead.

To overlap two steps, the second step needs its own working set, otherwise it can overwrite the results of the first step before the CPU has read them. So Photon keeps two slots and alternates between them, ping-pong style.

Work on the same stream runs sequentially, while work on separate streams can overlap. Both slots put their forwards onto the same compute stream. The slots are not for GPU parallelism — they exist so the CPU can process one slot's results while the GPU runs the other slot's forward.

Each step's device-to-host copy, the one that brings the sampled token back for bookkeeping, goes on a separate copy stream, so it can run while the GPU is busy with the next forward. That is what lets Photon not wait for it.

Mechanism 2: Forward now, sample later

The next forward can run ahead because it doesn't depend on anything the CPU does with the last token. But two things about the next step do depend on the last step's committed result: which sequences are still in the batch, and what tokens the next step is even allowed to sample.

Moondream's spatial skills return structured output instead of free text: point returns a coordinate, detect returns boxes, segment returns an outline. These constrained decoding requirements mean that the mask for step t+1 depends on the token sampled at t.

The dependency is in sampling, not in the forward. Each scheduler tick goes through three phases:
- Launch the forward for t+1. It doesn't depend on the mask, so it goes immediately.
- Commit step t: wait on the in-flight copy and advance the request's decode state.
- Finalize sampling for t+1: with the state current, build the mask and sample.

This "commit-before-finalize" ordering means the GPU runs the t+1 forward while the commit is happening, so the commit disappears from the critical path.

Mechanism 3: Zombies

When a sequence hits its stop token at step t, but is already baked into step t+1's forward, you can't un-launch GPU work. The sequence is finished, yet still physically present in a batch that's executing.

Photon calls these zombies and handles them with two per-sequence fields: finalized (True after EOS or length cap) and inflight_refs (number of in-flight steps still referencing this sequence). When a sequence is finalized, it isn't torn down until inflight_refs hits 0 — it harmlessly rides along, occupying its slot and writing KV that nobody will read.

Prefill rides the same pipeline

Photon doesn't separate prefill and decode into different pipelines. A prefill is just another kind="prefill" launch in the same two-slot pipeline. The expensive prefill forward runs on the GPU while the CPU commits decode results; the next decode forward runs while the CPU finishes admitting the just-prefilled request.

This matters most when outputs are short. A request that emits three tokens spends almost all of its life in prefill and admission, not decode. Sharing one pipeline lets that stream overlap its own CPU bookkeeping.

Results

Pipelined decoding delivers up to 35% higher decode throughput in Photon. The technique applies broadly: any autoregressive model with per-step CPU bookkeeping (constrained decoding, scheduling, streaming) will see similar benefits from overlapping CPU and GPU work.

→ [[entities/moondream-photon-pipelined-decoding-gpu-bubble]]
