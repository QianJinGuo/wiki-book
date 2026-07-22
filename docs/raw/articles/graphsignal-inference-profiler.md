---
title: "Graphsignal: LLM Inference Profiler"
source_url: https://github.com/graphsignal/graphsignal-profiler
author: ""
publish_time: ""
ingested: 2026-06-25
sha256: b620b62b13d299ac
tags: ["mlops", "profiling", "llm", "observability", "inference"]
type: article
---

# Graphsignal: LLM Inference Profiler


Markdown Content:
## Graphsignal: Inference Profiler

[](http://github.com/graphsignal/graphsignal-profiler#graphsignal-inference-profiler)
[![Image 1: License](https://camo.githubusercontent.com/3cdef791cd471b8637979924f49bea05492918ebb7b6d63921f967807b08eb60/687474703a2f2f696d672e736869656c64732e696f2f6769746875622f6c6963656e73652f67726170687369676e616c2f67726170687369676e616c2d70726f66696c6572)](https://github.com/graphsignal/graphsignal-profiler/blob/main/LICENSE)[![Image 2: Version](https://camo.githubusercontent.com/1539c66a8733de271d6ccc261df0704af942db8bbd978b4798d384e31f8e5acf/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f762f7461672f67726170687369676e616c2f67726170687369676e616c2d70726f66696c65723f6c6162656c3d76657273696f6e)](https://github.com/graphsignal/graphsignal-profiler)

Graphsignal is a production-scale inference profiling platform that helps engineers optimize AI performance across models, engines, GPUs, and other accelerators. It provides essential visibility across the inference stack, including:

*   Continuous, high-resolution profiling timelines exposing operation durations and resource utilization across inference workloads.
*   LLM generation tracing with per-step timing, token throughput, and latency breakdowns for major inference frameworks.
*   System-level metrics for inference engines and hardware (CPU, GPU, accelerators).
*   Error monitoring for device-level failures and inference errors.
*   Inference telemetry for AI agents to identify bottlenecks and drive targeted improvements across the inference stack.

[![Image 3: Dashboards](https://camo.githubusercontent.com/557931451d24f3c5419a851b7d3b23110373d1aa84a502c2b41f342c700d2f7d/68747470733a2f2f67726170687369676e616c2e636f6d2f65787465726e616c2f73637265656e73686f742d64617368626f6172642e706e673f763d32)](https://graphsignal.com/)

Learn more at [graphsignal.com](https://graphsignal.com/).

## Install

[](http://github.com/graphsignal/graphsignal-profiler#install)

UV_TOOL_BIN_DIR=/usr/local/bin uv tool install 'graphsignal[cu12]'   # CUDA 12.x
# or
UV_TOOL_BIN_DIR=/usr/local/bin uv tool install 'graphsignal[cu13]'   # CUDA 13.x

### Alternative: install into your workload environment

[](http://github.com/graphsignal/graphsignal-profiler#alternative-install-into-your-workload-environment)
If you prefer a single environment, or you use the `graphsignal.watch()` Python API (which requires `graphsignal` importable by your application), install it directly into y
