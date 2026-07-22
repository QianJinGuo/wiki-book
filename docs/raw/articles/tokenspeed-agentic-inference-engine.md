---
title: "tokenspeed agentic inference engine"
source_url: https://lightseek.org/blog/lightseek-tokenspeed.html
ingested: 2026-05-08
sha256: pending-rehash-2026-06-01
review_value: 9
review_confidence: 8
review_recommendation: strong
review_stars: 5
source_feed: TLDR AI (newsletter)
source_published: 2026-05-06
type: raw
created: 2026-05-10
updated: 2026-05-10
tags: []
tags: [raw-status:stub]

---
# TokenSpeed: A Speed-of-Light LLM Inference Engine for Agentic Workloads
Lightseek 团队开发的专为 agentic workloads 设计的 LLM 推理引擎。核心特性：compiler-backed SPMD parallelism modeling、C++ FSM 控制平面 + Python 执行平面、pluggable layered kernel system、fast MLA 内核（已被 vLLM 采用）。在 NVIDIA B200 上比 TensorRT-LLM 快 ~9%（最低延迟），~11% 更高吞吐。