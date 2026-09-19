# The Data Operating System for the Foundation Model Era — Data Juicer

> 📊 Level ⭐⭐⭐ | 8.5KB

→ [原文存档](https://datajuicer.github.io/data-juicer/en/main/)

## 摘要

Data-Juicer (DJ) is an open-source, large-scale multimodal data processing system for foundation-model workflows: it treats data processing as *composable infrastructure* — modular blocks that clean, synthesize and analyze data across the AI lifecycle — rather than throwaway scripts. Its surface is 200+ operators over text, image, audio, video and multimodal data, packaged as versioned YAML recipes; its engine is Ray-based and scales from laptop to thousand-node cluster. Its named use cases — web-scale pre-training dedup, agent trace curation, domain RAG prep — are where data pain now dominates.

Its academic anchor is a NeurIPS'25 Spotlight for Data-Juicer 2.0 (arXiv 2501.14755), whose claims are architectural — one operator contract, recipes as versioned pipelines, a distributed executor — not a tool count.

## 核心要点

- 200+ operators across text, image, audio, video and multimodal data; used singly, chained, or as full pipelines.
- Recipe-first: reproducible YAML pipelines to version, share and fork like code; 50+ community recipes in `data-juicer-hub`.
- Composable and hot-reloadable — operators can be edited and retried without restarting the pipeline.
- Ray-based execution with automatic OP fusion (2–10x claimed), adaptive parallelism, CUDA acceleration and tracing.
- Published scale points: 70B samples in 2h on 50 Ray nodes (6400 cores); 5TB dedup in 2.8h on 1280 cores.
- Coverage: pre-training/fine-tuning/RL curation, agent systems (tool traces, de-identification, quality gating), RAG/analytics (extraction, chunking, dedup).
- Ecosystem: `data-juicer-agents` (Copilot), `-hub` (recipes), `-sandbox` (co-development), plus Arrow/Iceberg/Hudi/Delta Lake/Hugging Face integrations.
- Roughly monthly releases through 2026; v1.4.4 earned the Spotlight and split sandbox/recipes/agents into standalone repos.

## 深度分析

### 为什么数据层才是基座模型时代的瓶颈

Model-side technique is commoditised — architectures and kernels are public, and most teams iterate on a handful of open weights — so the real asset is the corpus: which samples survive and whether that is reproducible. This wiki records the same argument in [Pretraining Progress Is Mostly Data](https://github.com/QianJinGuo/wiki-public/blob/main/entities/pretraining-progress-is-mostly-data.md). The difficulty is not one transformation but their accumulation — filters, dedup passes, quality scorers, augmentation, de-identification — each historically ad hoc, leaving pipelines nobody can reproduce months later. DJ instead makes the data layer an engineered system: one operator interface, versioned manifests, tracing and bad-case reports, so a data decision is auditable like a code change. [数据质量框架](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/data-quality-framework.md) supplies the metrics; DJ bets the scarce resource is the machinery applying them at scale.

### 算子即基础设施：可组合管线的抽象

The operator is the unit of composition, with a narrow contract: consume a `NestedDataset`, emit a transformed one. Filters keep or drop samples, mappers rewrite fields, deduplicators collapse near-duplicates; one interface means text and vision operators chain in the same pipeline, keeping the Python API minimal (build a dataset, hand operators to `process()`). A *recipe* lifts that into a versioned artefact — a YAML manifest fixing which operators run, with which parameters, in which order — so a pipeline can be reviewed, forked and re-run on a new corpus: data work becomes repo state instead of tribal knowledge.

### 从笔记本到千节点集群的规模路径（Ray + 分布式算子）

Ray is the execution substrate: a recipe that runs on a laptop is meant to run unchanged on a cluster, and the throughput points matter most for deduplication, the pass that historically blows up cost. Efficiency is mostly automatic (OP fusion, adaptive parallelism, CUDA acceleration). Engineering concentrates here: v1.5.0 added a partitioned Ray executor and OP-level isolated environments, so operators can carry conflicting dependencies and one failing operator no longer kills a run; v1.4.6 added sample-change tracing; v1.4.5 brought Ray + vLLM pipelines, making inference just another operator. The path stays opt-in — v1.5.2 moved Ray, audio, spaCy and `av` into on-demand extras to keep local installs light — while Arrow/Iceberg/Hudi/Delta Lake/S3 integrations wire the executor to where corpora live, the shape of workloads described in [腾讯 K8s + Ray 调度实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tencent-k8s-ray-ai-workload-scheduling.md).

### 200+ 算子与 50+ 配方生态的实际收益与维护成本

Breadth is both the moat and the maintenance bill: LaTeX mappers, embodied-AI video operators and 20+ video/multimodal operators in v1.4.5 cover what generic ETL cannot, at the price of 200+ behaviours to validate, a growing dependency surface, and a monthly cadence that makes version pinning production hygiene.

The more consequential shift is from deterministic cleaning to model-mediated curation: v1.5.2's semantic LLM operators (`llm_extract_mapper`, `llm_condition_filter`, `llm_structured_ops`) buy quality filtering and structured extraction but make cost, latency and reproducibility depend on a model endpoint. It also matures the deterministic side (`DocumentLineDeduplicator` strips boilerplate lines by global document frequency) and treats agent data as a first-class modality via an interaction-quality toolkit and bad-case report: the trace-as-corpus shift also visible in [LangSmith Engine](https://github.com/QianJinGuo/wiki-public/blob/main/entities/langsmith-engine-self-improving-agent-trace-based.md) and converging with warehouse-native curation such as [OmniTable](https://github.com/QianJinGuo/wiki-public/blob/main/entities/omnitable-unified-wide-table-petabyte-llm-data-curation-vldb-2026.md).

## 实践启示

1. 先定义数据质量度量再选集算子 — fix the corpus metrics (dedup rate, length distribution, language mix, boilerplate share) before choosing filters; operator breadth makes over-filtering easy.
2. 用 recipe 固化可复现的数据管线 — express every run as a versioned YAML recipe with pinned operator versions and parameters; unreproducible pipelines invalidate downstream model comparisons.
3. 去重 / 过滤 / 合成 的顺序取舍 — run cheap deterministic passes (line-frequency dedup, length/language filters) first, then semantic or LLM curation on survivors; inverting the order pays model cost for samples a count removes free.
4. 把 agent trace 当作一等数据类型 — apply interaction-quality operators, context structuring, de-identification and quality gating to tool traces; they fail differently (malformed calls, leaked secrets, loops) and need their own recipe.
5. 让规模成为可选项而非门槛 — start on the lightweight local install and opt into Ray/dependency extras only when a corpus justifies it, keeping the recipe identical so a laptop dry run predicts the cluster run.
6. 把算子成本算进去 — for any `llm_*` operator, measure cost and non-determinism on a sample and pin the model; treat OP fusion, tracing and parallelism as levers for debuggable runs.

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关: Agent 架构

---

