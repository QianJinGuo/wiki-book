---
source_url: "https://mistral.ai/news/ocr-4/"
ingested: 2026-06-26
sha256: 93b108ba25145f42
---

# Mistral OCR 4 : SOTA OCR for Document Intelligence


Markdown Content:
Today, we're releasing Mistral OCR 4, featuring bounding boxes, block classification, and inline confidence scores alongside extracted text. The model supports 170 languages across 10 language groups, runs in a single container for fully self-hosted deployments, and serves as an ingestion component for [enterprise search, RAG, and domain-specific retrieval pipelines](https://mistral.ai/news/search-toolkit/). OCR 4 is a small, focused model, and this post covers what's new, how it performs on public and internal benchmarks, the known limitations of those benchmarks, and guidance on when to use the model API versus Document AI.

[Video 3](https://www.youtube.com/watch?v=bEt4wczgGR8)

## **Highlights**

*   **Breakthrough performance.** Independent annotators prefer OCR 4 over every leading OCR and document-AI system tested, with win rates averaging 72%, alongside the top overall score on OlmOCRBench (85.20). See Benchmarks below for methodology and known scoring limitations.

*   **Segmentation, not just text.** Alongside the extracted text, OCR 4 returns bounding boxes, typed-block classification (titles, tables, equations, signatures, and more), and inline confidence scores. Bounding boxes, our most-requested capability, localize text for in-context highlighting and reliable data pipelines. At the same time, block types and confidence scores drive source-grounded citations, redactions, and human-in-the-loop verification.

*   **Integrated with Mistral Search Toolkit (public preview).** OCR 4 is an ingestion component of [Search Toolkit](https://mistral.ai/news/search-toolkit/), Mistral's open-source, composable search framework, announced at the AI Now Summit. Its structured output supplies citation-ready inputs to the toolkit's ingestion, retrieval, and evaluation workflow for RAG and enterprise search.

*   **Multilingual coverage.** Support for 170 languages across 10 language groups, with measurable gains on specialized and low-resource languages where several competing systems degrade.

*   **Run on your own infrastructure.** OCR 4 is compact enough to deploy on a single container, keeping document data in your environment for residency, sovereignty, and compliance, while supporting cost-efficient, high-throughput batch processing. Self-managed deployment is available to enterprise customers.

## **Overview**

Mistral OCR 4 extracts and structures content from a wide range of documents. Where previous generations focused on converting a page into clean text and tables, OCR 4 returns a structured representation of the document. Each block is localized with a bounding box, classified by type, and inline confidence scores are generated per-page and per-word. Downstream systems, therefore, have access not only to _what_ the document says but also to _where_ each element sits, _what role_ it plays, and _how confident_ the model is in each region.

This structure supports several downstream workloads:

*   **Semantic chunking for RAG**: clean, classified blocks become better retrieval units.

*   **Structural primitives for agents**: agents move from reading documents to acting on them (form filling, invoice processing, compliance checks).

*   **Structured content for connectors**: consistent, typed output for ingestion and indexing pipelines.

OCR 4 accepts common enterprise formats, including PDF, DOC, PPT, and OpenDocument, and supports 170 languages across 10 language groups, including specialized and low-resource languages that many systems handle poorly. As a compact model deployable in a single container, it is suited to both cost-sensitive and high-volume deployments. It can run fully self-hosted, allowing organizations with data-sovereignty requirements to keep document data within their own infrastructure.

Developers integrate the model via API, and teams can use [Document AI](https://mistral.ai/solutions/document-ai/) in Mistral Studio for an application-level, no-code path to the same engine. Mistral OCR 4 through the API is priced at $4 per 1,000 pages, with a 50% Batch-API discount, reducing the cost to $2 per 1,000 pages. Document AI is priced at $5 per 1,000 pages.

## **Benchmarks**

> “We benchmarked Mistral OCR 4 against the leading agentic document parsers across a chart and figure dense financial QA dataset and reached equivalent accuracy at roughly 8x lower cost and 17x lower latency. For production use cases at scale, that delta compounds fast." 
> 
> _- Aidan Donohue, AI Engineer, Rogo_

To evaluate OCR 4, we compared it against leading AI-native OCR models, frontier general-purpose models, enterprise document services, and our own Mistral OCR 3.

### **Human Preference Evaluations**

Automated benchmarks carry the scoring artifacts described above, so we complemented them with a head-to-head human evaluation on documents chosen to reflect real usage. We assembled 600+ documents across 12+ languages, sourced from third-party vendors to represent real industry use cases, and asked independent annotators to blindly rank each competitor's output against OCR 4's, document by document.

Annotators preferred OCR 4 in the majority of documents across all systems tested. Because these are human judgments on realistic documents rather than string comparisons against fixed references, they sidestep much of the annotation and formatting noise that affects automated scores.

![Image 1](http://mistral.ai/_astro/model-comparison%20(1)_15hPxB.webp?dpl=6a3c194ba5ef330008aaa4d8)
### **Overall Performance**

> “Mistral OCR is roughly 4x faster per page than our incumbent provider, an impressive result for the high-volume docketing workflows where speed is critical to managing our customers' IP timelines.”
> 
> _- Ivan Mihailov, AI engineer, Anaqua_

In addition to placing first in our human preferences, OCR 4 achieves the top overall score amongst the models we tested on the public **OlmOCRBench (85.20)** and leads our internal **Crawl Multilingual evaluation (.98)**, ahead of both AI-native and enterprise solutions.

![Image 2](http://mistral.ai/_astro/ocr-model-performance-comparison%20(1)_ZDpUIm.webp?dpl=6a3c194ba5ef330008aaa4d8)
On **OmniDocBench**, OCR 4 achieves a score of **93.07**. We report this figure with a caveat: both **OlmOCRBench** and **OmniDocBench** have known limitations in how they score certain outputs, and a single aggregate number can both understate and overstate real-world performance.

When we audited the mismatches behind our scores, most were not model errors but artifacts of how the benchmarks compare output. The recurring categories:

*   **Ground-truth errors.** Some reference annotations are themselves incorrect: missing or extra text, transcriptions of redacted regions, or typos (for example, a cited author's name misspelled in the reference but read correctly by the model from the page). The output matches the source document, yet it is still marked wrong.

*   **Equivalent math notation.** Different LaTeX that renders identically is counted as a mismatch, The rendered equation is correct; the string comparison is not.

*   **Equation segmentation.** Whether an expression is emitted as a single equation or split into several inline fragments affects the match, even when the rendered content is identical, because the matcher cannot align the pieces.

*   **Multi-column reading order.** Words split across a column boundary (for example, "certifi-cates") and column-ordering assumptions cause correct extractions to be scored as reading-order failures.

*   **Block-type attribution.** The benchmark does not expect headers/footers in the output. To resolve this we strip headers footers from our output before scoring. But the test then checks for a string that also happens to be the title of the page which should actually be present and flags it incorrectly.

These artifacts concentrate in mathematical, scientific, and multi-column documents, and they more often penalize correct output than rewar
