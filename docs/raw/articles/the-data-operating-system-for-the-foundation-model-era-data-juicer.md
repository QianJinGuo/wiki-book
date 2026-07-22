---
source_url: "https://datajuicer.github.io/data-juicer/en/main/""
ingested: 2026-06-26
sha256: 707695496fd9b44d
---

# The Data Operating System for the Foundation Model Era — Data Juicer


Published Time: Mon, 22 Jun 2026 10:20:26 GMT

Markdown Content:
[![Image 1: PyPI](https://img.shields.io/pypi/v/py-data-juicer?logo=pypi&color=026cad)](https://pypi.org/project/py-data-juicer)[![Image 2: Downloads](https://static.pepy.tech/personalized-badge/py-data-juicer?period=total&units=INTERNATIONAL_SYSTEM&left_color=grey&right_color=green&left_text=downloads)](https://pepy.tech/projects/py-data-juicer)[![Image 3: Docker](https://img.shields.io/docker/v/datajuicer/data-juicer?logo=docker&label=Docker&color=498bdf)](https://hub.docker.com/r/datajuicer/data-juicer)

[![Image 4: Docs](https://img.shields.io/badge/%F0%9F%93%96_Docs-Website-026cad)](https://datajuicer.github.io/data-juicer/)[![Image 5: Operators](https://img.shields.io/badge/%F0%9F%A7%A9_Operators-200+-blue)](https://datajuicer.github.io/data-juicer/en/main/docs/Operators.html)[![Image 6: Recipes](https://img.shields.io/badge/%F0%9F%8D%B3_Recipes-50+-brightgreen)](https://github.com/datajuicer/data-juicer-hub)

[![Image 7: Chinese](https://img.shields.io/badge/%F0%9F%87%A8%F0%9F%87%B3_%E6%96%87%E6%A1%A3-%E4%B8%BB%E9%A1%B5-red)](https://datajuicer.github.io/data-juicer/zh_CN/main/index_ZH.html)[![Image 8: Paper](https://img.shields.io/badge/NeurIPS'25_Spotlight-2.0-B31B1B?logo=arxiv)](https://arxiv.org/abs/2501.14755)[![Image 9: Coverage](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fgist.githubusercontent.com%2FHYLcool%2Ff856b14416f08f73d05d32fd992a9c29%2Fraw%2Ftotal_cov.json&label=coverage&logo=codecov&color=4c1)](https://github.com/datajuicer/data-juicer)

**Multimodal | Cloud-Native | AI-Ready | Large-Scale**

Data-Juicer (DJ) transforms raw data chaos into AI-ready intelligence. It treats data processing as _composable infrastructure_—providing modular building blocks to clean, synthesize, and analyze data across the entire AI lifecycle, unlocking latent value in every byte.

Whether you’re deduplicating web-scale pre-training corpora, curating agent interaction traces, or preparing domain-specific RAG indices, DJ scales seamlessly from your laptop to thousand-node clusters—no glue code required.

* * *

## 🚀 Quick Start[#](http://datajuicer.github.io/data-juicer/en/main/#quick-start "Link to this heading")

**Zero-install exploration**:

*   [JupyterLab Playground with Tutorials](http://8.138.149.181/)

*   [Ask DJ Copilot](https://datajuicer.github.io/data-juicer/en/main/docs_index.html)

**Install & run**:

uv pip install py-data-juicer
dj-process --config demos/process_simple/process.yaml

**Or compose in Python**:

from data_juicer.core.data import NestedDataset
from data_juicer.ops.filter import TextLengthFilter
from data_juicer.ops.mapper import WhitespaceNormalizationMapper

ds = NestedDataset.from_dict({
    "text": ["Short", "This passes the filter.", "Text with spaces"]
})
res_ds = ds.process([
    TextLengthFilter(min_len=10),
    WhitespaceNormalizationMapper()
])

for s in res_ds:
    print(s)

* * *

## ✨ Why Data-Juicer?[#](http://datajuicer.github.io/data-juicer/en/main/#why-data-juicer "Link to this heading")

### 1. Modular & Extensible Architecture[#](http://datajuicer.github.io/data-juicer/en/main/#modular-extensible-architecture "Link to this heading")

*   **200+ operators** spanning text, image, audio, video, and multimodal data

*   **Recipe-first**: Reproducible YAML pipelines you can version, share, and fork like code

*   **Composable**: Drop in a single operator, chain complex workflows, or orchestrate full pipelines

*   **Hot-reload**: Iterate on operators without pipeline restarts

### 2. Full-Spectrum Data Intelligence[#](http://datajuicer.github.io/data-juicer/en/main/#full-spectrum-data-intelligence "Link to this heading")

*   **Foundation Models**: Pre-training, fine-tuning, RL, and evaluation-grade curation

*   **Agent Systems**: Clean tool traces, structure context, de-identification, and quality gating

*   **RAG & Analytics**: Extraction, normalization, semantic chunking, deduplication, and data profiling

### 3. Production-Ready Performance[#](http://datajuicer.github.io/data-juicer/en/main/#production-ready-performance "Link to this heading")

*   **Scale**: Process 70B samples in 2h on 50 Ray nodes (6400 cores)

*   **Efficiency**: Deduplicate 5TB in 2.8h using 1280 cores

*   **Optimization**: Automatic OP fusion (2-10x speedup), adaptive parallelism, CUDA acceleration, robustness

*   **Observability**: Built-in tracing for debugging, auditing, and iterative improvement

> _⭐ If Data-Juicer saved you time or improved your data work, please consider starring the repo._ It helps more people discover the project and keeps you notified of new releases and features.

* * *

## 📰 News[#](http://datajuicer.github.io/data-juicer/en/main/#news "Link to this heading")

[2026-05-29] Release v1.5.2: **Semantic LLM OPs, Cross-doc Line Dedup & Leaner Dependencies**
*   🧹 _New Deduplicator_ — Added `DocumentLineDeduplicator` for cross-document line-level dedup, removing boilerplate lines (templates, copyright notices, navigation bars) by global document frequency.

*   🤖 _Agent Data Quality Toolkit_ — Shipped interaction-quality OPs & recipe, a bad-case HTML report, and more robust JSONL / HuggingFace meta loading.

*   📦 _Leaner & Faster Install_ — Slimmed the default dependency set (Ray, audio, spaCy, av, etc. moved to on-demand extras) to speed up installation.

*   🐳 _Stability & Robustness Fixes_ — Library-safe error handling (raise over `exit(1)`), Ray init/temp-dir fixes, valid API params (drop invalid `max_new_tokens`), PyArrow 20+ batch JSON reading, local-path aesthetics model support, and more performance/bug fixes.

*   🧠 _Semantic LLM Operators_ — Introduced `llm_extract_mapper`, `llm_condition_filter`, and `llm_structured_ops` with unified `llm_*` naming and configurable inference strategies (join/agg/top-k planned).

[2026-03-17] Release v1.5.1: **LaTeX OPs; Compressed Format Support; Operator Robustness Fixes**
*   📄 Two new LaTeX-focused mapper OPs shipped, extending data-juicer’s document processing capabilities to handle `.tex` archives and figure contexts.

*   🗜️ Compressed dataset format support: `json[l].gz` files can now be loaded directly, and Ray datasets gain proper support for reading compressed JSON files.

*   📚 New documentation added covering cache, export, and tracing workflows to help users better understand and debug data processing pipelines.

*   🤖 Major refactor and upgrade of data-juicer-agents completed: The project architecture and CLI/session capabilities were comprehensively redesigned for better maintainability and extensibility. See [date-juicer-agents](https://github.com/datajuicer/data-juicer-agents) for more details.

[2026-02-12] Release v1.5.0: **Partitioned Ray Executor, OP-level Env Management, and More Embodied-AI OPs**
*   🚀 _Enhanced Distributed Execution Framework_ – Introduced partitioned Ray executor and OP-level isolated environments to improve fault tolerance, scalability, and dependency conflict resolution.

*   🤖 _Expanded Embodied AI Video Processing_ – Added specialized operators for camera calibration, video undistortion, hand reconstruction, and pose estimation to strengthen multi-view video handling.

*   💪🏻 _System Performance & Developer Experience Optimizations_ – Enabled batch inference, memory/log reduction, core logic refactoring, and updated documentation/templates.

*   🐳 _Critical Bug Fixes & Stability Improvements_ – Resolved duplicate tracking, parameter conflicts, homepage rendering issues, and outdated docs for higher reliability.

[2026-02-02] Release v1.4.6: **Copilot, Video Bytes I/O & Ray Tracing**
*   🤖 _Q&A Copilot_ — Now live on our [Doc Site](https://datajuicer.github.io/data-juicer/en/main/index.html) | [DingTalk](https://qr.dingtalk.com/action/joingroup?code=v1,k1,N78tgW54U447gJP5aMC95B6qgQhlkVQS4+dp7qQq6MpuRVJIwrSsXmL8oFqU5ajJ&_dt_no_comment=1&origin=11?) | [Discord](https://discord.gg/ngQbB9hEVK). Feel free to ask anything related to Data-Juicer ecosystem!

    *   Check 🤖 [Data-Juicer Agents](https://github.com/datajuicer/data-juicer-agents/blob/main) | 📃 [Deploy-ready codes](https://github.com/datajuicer/data-juicer-agents/blob/main/qa-copilot) | 🎬[More demos](https://github.com/datajuicer/data-juicer-agents/blob/main/qa-copilot/DEMO.md) for more details.

*   🎬 _Video Bytes I/O_ — Direct bytes processing for video pipelines

*   🫆 _Ray Mode Tracer_ — Track changed samples in distributed processing

*   🐳 _Enhancements & fixes_ — refreshed Docker image, small perf boosts, GitHub Insights traffic workflow, Ray compatibility updates, and bug/doc fixes.

[2026-01-15] Release v1.4.5: **20+ New OPs, Ray vLLM Pipelines & Sphinx Docs Upgrade**
*   _Embodied-AI OPs_: added/enhanced mappers for video captioning (VLM), video object segmentation (YOLOE+SAM2), video depth estimation (viz + point cloud), human pose (MMPose), image tagging (VLM), single-image 3D body mesh recovery (SAM 3D Body), plus _S3 upload/download_.

*   _New Pipeline OP_: compose multiple OPs into one pipeline; introduced _Ray + vLLM_ pipelines for LLM/VLM inference.

*   _Docs upgrade_: moved to a unified _Sphinx-based_ documentation build/deploy workflow with isolated theme/architecture repo.

*   _Enhancements & fixes_: dependency updates, improved Ray deduplication and S3 loading, OpenAI Responses API support, tracer consistency, Docker base updated to CUDA 12.6.3 + Ubuntu 24.04 + Py3.11, and multiple bug fixes.

[2025-12-01] Release v1.4.4: **NeurIPS’25 Spotlight, 6 New Video/MM OPs & S3 I/O**
*   NeurIPS’25 **Spotlight** for Data-Juicer 2.0

*   _Repo split_: sandbox/recipes/agents moved to standalone repos

*   _S3 I/O_ added to loader/exporter

*   _6 new video & multimodal OPs_ (character detection, VGGT, whole-body pose, hand reconstruction) + docs/Ray/video I/O improvements and bug fixes

View [All Release](https://github.com/datajuicer/data-juicer/releases) and [News Archive](http://datajuicer.github.io/data-juicer/en/main/docs/news.html)

* * *

## 🔌 Users & Ecosystems[#](http://datajuicer.github.io/data-juicer/en/main/#users-ecosystems "Link to this heading")

> The below list focuses on _developer-facing integration and usages_ in _alphabetical order_.
> 
>  Missing your project / name? Feel free to [open a PR](https://github.com/datajuicer/data-juicer/pulls) or [reach out](http://datajuicer.github.io/data-juicer/en/main/#contributing-community).

Data-Juicer plugs into your existing stack and evolves with community contributions:

### Extensions[#](http://datajuicer.github.io/data-juicer/en/main/#extensions "Link to this heading")

*   **[data-juicer-agents](https://github.com/datajuicer/data-juicer-agents)** — DJ Copilot and agentic workflows

*   **[data-juicer-hub](https://github.com/datajuicer/data-juicer-hub)** — Community recipes and best practices

*   **[data-juicer-sandbox](https://github.com/datajuicer/data-juicer-sandbox)** — Data-model co-development with feedback loops

### Frameworks & Platforms[#](http://datajuicer.github.io/data-juicer/en/main/#frameworks-platforms "Link to this heading")

[AgentScope](https://github.com/agentscope-ai/agentscope) · [Apache Arrow](https://github.com/apache/arrow) · [Apache HDFS](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsUserGuide.html) · [Apache Hudi](https://hudi.apache.org/) · [Apache Iceberg](https://iceberg.apache.org/) · [Apache Paimon](https://paimon.apache.org/) · [Alibaba PAI](https://www.alibabacloud.com/en/product/machine-learning?_p_lc=1) · [Delta Lake](https://delta.io/) · [DiffSynth-Studio](https://github.com/modelscope/DiffSynth-Studio) · [EasyAnimate](https://github.com/aigc-apps/EasyAnimate) · [Eval-Scope](https://github.com/modelscope/evalscope) · [Huawei Ascend](https://www.huawei.com/en/products/cloud-computing-dc/atlas/ascend) · [Hugging Face](https://huggingface.co/) · [LanceDB](https://lancedb.github.io/lance/) · [LLaMA-Factory](https://github.com/hiyouga/LLaMA-Factory) · [ModelSco
