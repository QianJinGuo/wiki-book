---
title: "Inside Thinking Machines' Interaction Models"
source_url: "https://blog.bytebytego.com/p/inside-thinking-machines-interaction"
author: ByteByteGo
ingested: 2026-07-01
type: raw
sha256: df04abf76049b12b8d188ecfe278be757b166fa324acd1400586000af73ef4fb
---

ByteByteGo Newsletter

Inside Thinking Machines' Interaction Models
BYTEBYTEGO
JUN 30, 2026

What feels like a real-time conversation with AI today is built from many parts working together.

At the center sits a language model that works in turns, the same way ChatGPT does when you type to it. The responsiveness comes from a layer of helper systems wrapped around that model, predicting when the user has paused, transcribing audio, generating speech from text, and weaving the pieces together fast enough that the conversation feels fluid.

However, new research from Thinking Machines argues that this whole approach has a ceiling, and proposes a different way to build AI systems for real-time interaction.

Thinking Machines is a relatively new AI research lab focused on human-AI collaboration, publishing research under the name Connectionism and offering developer-facing products for the broader community. What sets them apart is the problem they have identified as central. Most AI labs treat autonomous capability as the most important capability to push forward, meaning the ability for a model to take a task, do the work on its own, and return a result.

Thinking Machines argues this framing sidelines humans. Real work, in their view, benefits from continuous collaboration where the human clarifies, redirects, and gives feedback as the model goes along. The interface should support that, rather than treating the human as someone who hands off a task and walks away.

In this article, we will look at what the research preview covers and the concept of an interaction model proposed by Thinking Machines.

Disclaimer: This post is based on publicly shared details from the Thinking Machines Engineering Team.

Bottleneck

The problem starts with how today's models actually experience the world. A typical language model works in a single thread. It waits for the user to finish typing or speaking before it can perceive any input. Once the model starts generating a response, its perception freezes, and any new input gets queued for later.

Thinking Machines compares this setup to resolving a crucial disagreement over email rather than in person. The bandwidth is just too narrow. So much of what makes a collaboration work, the way your voice shifts when uncertain, the moment of realizing a direction change is needed mid-sentence, the reaction on your face when the other person says something useful, all of it gets stripped out of the channel between human and model.

This matters because real work that benefits from another mind in the room depends on that bandwidth.

A model that only sees clean, finalized inputs forces a person to think like a model, preparing the full request, handing it over, and then waiting. In contrast, real collaboration is often messy, interruptive, and full of mid-stream corrections. Until the interface allows for that, the human ends up doing extra work to fit how the model wants to operate. Thinking Machines argues this bottleneck explains why much of today's AI work feels like prompting and waiting rather than collaborating the way two people might.

Harness

If today's voice AI feels real-time despite this limitation, how is that even working to a large extent? The answer is a pattern called a harness.

A typical voice AI product is a stack of components glued together:

- Voice activity detection listens for pauses and decides when the user has stopped speaking.
- A speech-to-text model transcribes what was said.
- A language model generates a text response.
- A text-to-speech model converts that response back into audio.
- A dialog manager orchestrates the entire pipeline so the latency feels acceptable.

Imagine a brilliant scholar who communicates only through letters slipped under a door. Making this feel like a conversation requires helpers. One stands outside listening for when the visitor stops talking, another reads the scholar's letters aloud when they come back, and a third rings a bell when something visible happens that the scholar should know about.

The setup mostly works, but the scholar still experiences reality through letters. Voice tones, facial expressions, the moment itself, all of it stays beyond the scholar's reach. This is what every real-time voice AI actually is, with a turn-based language model at the center surrounded by helpers that simulate conversation around it.

Why does this approach have a ceiling?

It is because the helpers are simpler than the model itself. Voice activity detection runs on raw audio signals using a much smaller and lighter model than the language model behind it. This limits whole categories of behavior.

The system struggles with proactive interjections like "interrupt me when I say something wrong," because the helper deciding when to speak operates purely on acoustic signals, while correctness remains the language model's job. Visual reactions like "tell me when I've written a bug in my code" face the same problem, because the helper handles audio while anything on screen stays beyond its reach.

This is where Thinking Machines points to an important lesson. As per a famous essay by Rich Sutton, methods leveraging general computation and learning consistently outperform methods that bake in human-designed heuristics. The same argument led from hand-crafted computer vision features to deep learning, and from hand-crafted game heuristics to self-play. Applied to interactivity, harness components are exactly the kind of hand-crafted heuristic that scale will eventually push out. The way past the ceiling is to put interactivity inside the model itself.

Architecture

What does putting interactivity inside the model actually look like?

Thinking Machines' answer is a system they call an interaction model. The first version, named TML-Interaction-Small, is a 276-billion-parameter mixture-of-experts model with 12 billion active parameters at any moment. The word "small" in the name refers to where this sits in their planned lineup, with larger versions expected later.

Most multimodal systems start with text and add audio and video on top. Thinking Machines did the reverse, starting from continuous audio and video because live conversation operates under tight real-time constraints that text can avoid. Designing around the hardest case first gives them an architecture that handles concurrent input and output streams across every modality.

The model has three key components:

1. A perception funnel that continuously ingests audio and video streams and turns them into a serialized format the rest of the model can process
2. A backbone that processes multimodal data over time, maintaining state across input and output boundaries
3. A generation system that produces speech and text, managing when and how to respond

The perception funnel works in micro-batches of 200ms. Every 200ms, it processes the latest chunk of audio, producing an embedding that compresses what happened in that window. For video, it uses a similar approach with a lightweight encoding of every 40x40-pixel region.

The backbone then takes these compressed representations and processes the history. Because audio is the primary modality for Thinking Machines, the backbone needs to maintain a persistent state across sessions rather than resetting between requests. This is a key difference from traditional models that treat each interaction as an independent turn.

The generation system works concurrently with perception. The model can be generating speech from its current understanding while still processing new audio from the user. This concurrency is what enables the natural-feeling real-time interaction.

A key architectural decision: the model has no explicit turn boundaries. Instead of a "user speaks → model responds → user speaks" pattern, the system continuously processes input and output in parallel. This removes the framing delay that real-time voice products have to mask.

The core insight is that putting interactivity inside the model, rather than wrapping a turn-based model with helper systems, removes the fundamental ceiling that harness-based approaches hit. Once the model itself understands that it is in a real-time conversation, it can reason about timing, interject appropriately, and use visual information the same way it uses text.

→ [[raw/articles/thinking-machines-interaction-models-ai-cold.md]]
