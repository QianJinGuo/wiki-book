---
title: "How to Automate AI Model Documentation with the NVIDIA MCG Toolkit"
source_url: https://developer.nvidia.com/blog/how-to-automate-ai-model-documentation-with-the-nvidia-mcg-toolkit/
ingested: 2026-06-02
tags: [nvidia, documentation, tool]
sha256: 9503a509555fa5e3f31fed9d8e54b9261e67266a5544c9e8f9d04d7efdce3589
---

# How to Automate AI Model Documentation with the NVIDIA MCG Toolkit


Published Time: 2026-05-29T16:00:00+00:00

Markdown Content:
As AI models grow in complexity and regulatory scrutiny intensifies under frameworks including California’s AB-2013 and the EU AI Act, software teams face a challenge beyond delivering great code: They need to produce comprehensive, auditable model documentation before the models are released.

Model cards describe how a model works, its intended use and license, training data, performance, and limitations. They [promote transparency and accountability](https://developer.nvidia.com/blog/enhancing-ai-transparency-and-ethical-considerations-with-model-card/) so downstream users—customers, regulators, and affected communities—can make informed decisions when selecting and deploying AI. That audience extends beyond developers: Policymakers, procurement teams, and risk assessors rely on model cards to evaluate fitness for use and compare models across vendors.

In practice, creating model cards manually is tedious and slow. Documentation lags behind development, and metadata is often outdated by ship date. As models grow more complex, inconsistent formatting and missing required fields create unnecessary audit risk and slow adoption. The NVIDIA model card generator (MCG) toolkit automates and standardizes model documentation in Model Card++ format in under a minute, by reading directly from source data.

## Introducing the NVIDIA MCG toolkit[](https://developer.nvidia.com/blog/how-to-automate-ai-model-documentation-with-the-nvidia-mcg-toolkit/#introducing_the_nvidia_mcg_toolkit)

The MCG toolkit is a containerized pipeline that automates the generation of model cards by reading in the model source code. It follows a modular Ingestion → Extraction → Rendering pipeline. A central orchestrator receives your request—either a URL or an uploaded file—coordinates the workflow, and returns a complete model card. Each stage runs as a separate service, so you can update or swap individual components without affecting the rest of the pipeline.

## How the MCG toolkit works[](https://developer.nvidia.com/blog/how-to-automate-ai-model-documentation-with-the-nvidia-mcg-toolkit/#how_the_mcg_toolkit_works)

The toolkit exposes an interactive UI that accepts a URL (GitHub, GitLab, HuggingFace, or any public web page) or an uploaded file (ZIP, PDF, DOCX, or Markdown). A REST API is also available for programmatic integration.

From there, data flows through three stages:

1.   **Input → Ingestion.**The system fetches the content and processes it into document chunks, categorized by type: documentation, config files, and code.
2.   **Documents → Extraction.**The extraction stage runs ingested documents through a retrieval-augmented generation (RAG) pipeline powered by NVIDIA Inference Microservices (NIM). [NVIDIA Nemotron RAG](https://huggingface.co/collections/nvidia/nemotron-rag) handles high-precision embedding (llama-nemotron-embed-1b-v2) and reranking (llama-nemotron-rerank-500m-v2), with separate retrievers for code, config files, and documentation to prioritize higher-signal sources. The core extraction is performed by GPT-OSS-120B, which reads the retrieved passages and applies expert-curated formatting and content guides—the NVIDIA MC++ template and field-level style guides—to generate compliant information in the expected format. A validation step checks responses before they are accepted. Output is structured JSON. After the overview is complete, the same content flows to a subcards stage, which produces the four Model Card++ subcards: Bias, Explainability, Privacy, and Safety & Security.
3.   **JSON → Rendering.**The structured JSON renders into human-readable Markdown using a configurable template. You can edit the content in the interface and re-render before downloading or integrating with other systems. The final artifact is a complete model card – overview plus four subcards – ready for review or publication.

![Image 1: A flowchart diagram showing the Model Card Generation toolkit architecture. Source code inputs such as GitHub repository, GitLab repository, HuggingFace repository, website URL, or local files flow through document-specific parsing, then through llama-nemotron-embed-1b-v2 for embedding into a vector database. A Retriever component (containing Code Retriever, Config Retriever, and Document Retriever) queries the vector database and passes results to llama-nemotron-rerank-500m-v2 for reranking. The reranked results feed into Llama-3.3-Nemotron-Super-49B-v1, which validates responses in a feedback loop, then passes output to an Orchestration step. The Template Renderer produces the final Model Card](https://developer-blogs.nvidia.com/wp-content/uploads/2026/05/image2-7.webp)

_Figure 1. MCG toolkit architecture: Generate a comprehensive model card by directly reading in the source code_

## Designed for flexibility[](https://developer.nvidia.com/blog/how-to-automate-ai-model-documentation-with-the-nvidia-mcg-toolkit/#designed_for_flexibility)

You’re not locked into one model, template, or standard. The toolkit is customizable across three dimensions:

**1) Models:**The system uses configurable endpoints for the language model, embeddings, and reranking. Point to different NIMs or compatible APIs to match your performance, cost, or data residency requirements, whether you’re prototyping on a smaller model or scaling up for production.

**2) Templates:**The output format is driven by a Markdown template. Organizations can customize it for Model Card++, internal standards, or emerging regulatory formats without modifying the extraction logic. Outputs are also [CycloneDX-compliant](https://cyclonedx.org/). When a new disclosure requirement appears, you update the template rather than the pipeline.

**3) Guides:**Field-level guidance—what to capture, how to phrase it—comes from configurable knowledge bases. As regulations or domain needs evolve, update the guides without touching the core code. The same pipeline can serve different industries and compliance regimes.

## Run it where you need it[](https://developer.nvidia.com/blog/how-to-automate-ai-model-documentation-with-the-nvidia-mcg-toolkit/#run_it_where_you_need_it)

The toolkit ships as containerized services with a one-command setup. The orchestrator, ingestion, extraction, and subcards stages each run as separate containers, with infrastructure (database and task queue) included. There’s no proprietary cloud lock-in: MCG runs on-premises or in your own cloud, with Kubernetes support to help you spin up on your own infrastructure.

## Performance results[](https://developer.nvidia.com/blog/how-to-automate-ai-model-documentation-with-the-nvidia-mcg-toolkit/#performance_results)

We ran the toolkit through standardized testing on public model repositories to measure completion rate, generation time, and accuracy. Each field was scored against the source documentation. Accuracy is calculated as correct fields over non-placeholder fields. Table 1, below, shows the results.

| **Model** | **Time to Generate** | **Completion Rate** | **Accuracy** |
| --- | --- | --- | --- |
| NVIDIA Nemotron Nano 8B | 56s | 97% | 92% |
| NVIDIA Cosmos Reason 2 | 86s | 94% | 82% |
| NVIDIA Parakeet | 65s | 92% | 87% |
| NVIDIA Proteina | 52s | 94% | 82% |
| Third-party models _(DeepSeek-V3, Evo2, Gemma, Llama)_ | ~80s avg | ~89% | ~80% |

_Table 1. Performance on MC++ Overview across standardized test models. Completion rate = fields with meaningful content / total fields. Accuracy = correct / total non-placeholder responses._

The toolkit generates a full model card (overview plus four subcards) in under a minute for most repositories. Overall completion reaches 91% (third-party baseline), with accuracy at 76% across the standardized test set. Completion and accuracy vary by model and repository; repositories with richer READMEs and config files yield higher results.

The toolkit performs best when supporting documentation exists and the codebase is
