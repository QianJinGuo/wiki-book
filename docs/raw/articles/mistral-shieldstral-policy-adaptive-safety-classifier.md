---
title: "Introducing Shieldstral — Policy-Adaptive Multimodal Safety Classifier"
source_url: "https://mistral.ai/news/shieldstral/"
type: raw-article
created: 2026-08-05
updated: 2026-08-05
sha256: 0cea064731089a788b7ca841a0274174db1a8f2559f705f51279dd4ce9f20c0e
---

# Introducing Shieldstral — Policy-Adaptive Multimodal Safety Classifier

Shieldstral introduces a 3B open-weights multimodal safety classifier that outperforms models up to 7x its size by framing content moderation as a policy-adaptive question-answering task. Unlike traditional guardrail models, it accepts plain-language policies at inference time, unifying text and image safety evaluation without retraining. Released under Apache 2.0, it delivers calibrated safety scores across diverse benchmarks while running efficiently on a single 16GB NVIDIA GPU.
A 3B open-weights, policy-adaptive multimodal safety classifier that matches models up to 7x its size on text safety and sets a new state of the art on multimodal moderation.
“Does this content promote violence against a protected group? Is this image safe to show to a minor? Did the assistant refuse the request?”
Every product that ships a model needs to answer questions like these — but the right answer depends on the product, the audience, and the moment. The same content can be fine for a cybersecurity research tool and harmful on a mental-health platform. Most guardrail models bake a fixed taxonomy of harm categories into their weights, so re-targeting them to a new deployment context means retraining. And because safety definitions differ across applications and domains, there is no single "correct" set of categories to model in the first place.
Shieldstral takes a different approach: you write the policy as a plain-language question at inference time, and the model returns a calibrated safety score. No retraining, one interface for text and images, and a verdict from a single token. Please refer to our
