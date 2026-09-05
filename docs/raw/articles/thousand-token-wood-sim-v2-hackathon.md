---
title: "Five labs, five minds: building a multi-model finance drama on small models"
source_url: https://huggingface.co/blog/build-small-hackathon/thousand-token-wood-sim-v2
source: huggingface.co
author: Lester Leong (AdmiralTaco)
publish_date: 2026-06-09
ingested: 2026-06-09
sha256: 81364edf6d56c30096c55e30a144199d0e8744feac85b503b8cb7df911703030
---

# Five labs, five minds: building a multi-model finance drama on small models

_A second Build Small Hackathon field report: what happens when each agent in an emergent economy runs on a different lab's small model, and the player becomes the financier pulling the strings._

The first version of Thousand Token Wood was a weather-god sandbox: five woodland creatures on one fine-tuned 0.5B model traded goods, and you poked the world with shocks and watched bubbles and crashes emerge. It was a nice toy. It was also something you watched rather than played.

v2 rebuilt it into a game you operate. You are the Patron of the Wood, a shadow financier: you lend at interest, whisper tips that may be true or planted, short the market, bribe, and broker alliances, while a magistrate hunts you for trading on what you should not know. The creatures remember how you treated them and scheme back. And the biggest change is under the hood: every creature now thinks with a different lab's small model. This is the engineering report.

## Heterogeneity is the product, not a constraint

The obvious way to run a council of agents is one model, many prompts. v2 runs four: gpt-oss-20b (OpenAI), MiniCPM3-4B (OpenBMB), Nemotron-Mini-4B (NVIDIA), and a fine-tuned Qwen 0.5B of my own. The point is not novelty for its own sake. A market is interesting when the participants genuinely differ, and four labs' models trained on different data with different post-training are about as different as small models get. The owl hoards differently than the fox speculates. The council is a live argument, not a script.

Standing four distinct models up on one platform surfaced the real lesson: the friction is almost entirely at the serving layer, not the modeling layer.

- Current vLLM (0.22.1) JIT-compiles kernels at load and needs the CUDA toolkit (`nvcc`) present. A lean base image does not ship it, so all four models failed identically with "could not find nvcc" until I based them on a CUDA devel image. This was not a gpt-oss quirk; it was universal to the vLLM version. One image fix unblocked everything.
- gpt-oss-20b runs in its native MXFP4 quantization and fits a 24GB L4 with room to spare; no high-end GPU needed. It also speaks a channel format that wraps the answer in an analysis preamble, so the consumer has to extract the final channel.
- MiniCPM3 needed `trust_remote_code`; Nemotron loaded clean. Per-model footguns, each a one-line config.

The thing that made four heterogeneous models tractable was the same primitive that made one model tractable in v1: a tolerant JSON parse-and-repair layer that every model's output flows through. Different tokenizers and formatting habits produce different malformations; the parser drops what it cannot salvage and the simulation never crashes. Build that layer once and adding a model is a config entry, not a refactor.

## Information asymmetry needs a firewall

The dramatic core of v2 is the insider tip. You can whisper a tip to a creature that is _true_ (a real forecast of the next market mania the deck will draw, your genuine edge) or _false_ (bait). Acting on a true tip and profiting raises your heat; cross a threshold and the magistrate opens an investigation that ends in a fine, frozen assets, or exile.

For that to be a real game, the truth of a tip must be hidden from the creatures. They see the rumor text; they must never see the flag. This is a security property, not a UI nicety, and small-model agents make it sharp: everything the model could repeat back is whatever you put in its prompt. So the hidden flag lives off-prompt entirely (on the player's ledger), it is stripped from the public event record at construction, and the only thing the narrator ever summarizes is public events. A single test scans every creature's full prompt, every turn, for the banned tokens. That test is the most important one in the suite. When you give an agent secret information, assume it will leak unless a test proves it cannot.

## Memory is cheap drama if you bound it

Creatures carry persistent relationships: a signed sentiment toward the Patron and toward each other, nudged by events (you shorted my crop, you repaid your loan, you allied me with a rival). A creature that turns hostile refuses your loans and quotes you worse; allied creatures stop undercutting each other and behave like a cartel.

The trap is prompt inflation. Raw history grows without bound and a small model drowns in it. The fix is to never put history in the prompt: the model sees a one-line bucketed summary ("you feel warmly toward Oona, wary of the Patron"), capped to the few strongest feelings, derived from integer sentiment. Notes are kept for traces but bounded and never shown. The behavioral bias is part emergent (the summary nudges the model) and part mechanical (a strongly hostile creature deterministically refuses), so it is observable and testable rather than a hope.

## What actually happened

A representative council run, with the full v2 mechanics live:

| Lever | Result |
| --- | --- |
| Models in the council | 4 labs, all under the 32B cap, served on Modal |
| Fine-tuned 0.5B reliability | 0% self-buys, 100% valid offers (beats its 3B teacher) |
| Truth firewall | 0 leaks of a tip's hidden flag across every prompt scanned |
| Insider tip edge | a true-tip pre-position settles a positive P&L; a false tip does not |
| Heat to investigation | two clean suspicious wins cross the magistrate's line |
| Ruin | a margin call and a loan default banish a creature, who returns a chapter later |

_A single seeded run exercising the Patron, the information war, relationships, and leverage end to end._

## Takeaways for building with small models

A small model is a reliable format generator and an unreliable reasoner; you close the gap with structure, prompting, and a small fine-tune, not with scale. A heterogeneous council is more interesting than a homogeneous one and costs you only config once the serving layer is solid. Secret information given to an agent is a firewall problem, and the firewall belongs in the data flow, proven by a test, not in a prompt instruction. And persistent memory is the cheapest way to make agents feel alive, as long as the prompt only ever sees a bounded summary.

Small models, big adventures. The whole council is open, and so are the traces.
