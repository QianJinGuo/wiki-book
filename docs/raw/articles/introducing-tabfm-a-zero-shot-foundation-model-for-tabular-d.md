---
title: "Introducing TabFM: A zero-shot foundation model for tabular data"
source_url: "https://research.google/blog/introducing-tabfm-a-zero-shot-foundation-model-for-tabular-data/"
ingested: 2026-07-02T11:40:01Z
sha256: placeholder
type: raw
tags: [newsletter, raw]
---

# Introducing TabFM: A zero-shot foundation model for tabular data

Title: Introducing TabFM: A zero-shot foundation model for tabular data

URL Source: https://research.google/blog/introducing-tabfm-a-zero-shot-foundation-model-for-tabular-data/

Markdown Content:
We’ve seen a massive shift in how people handle time-series forecasting since we launched TimesFM. Now, we’re bringing that same "zero-shot" logic to tabular data.

We introduce TabFM, a new foundation model for tabular data to simplify classification and regression workflows.

Tabular data constitutes the backbone of enterprise data infrastructure and powers a significant fraction of critical predictive machine learning [applications](https://arxiv.org/pdf/2110.01889). From predicting customer churn to identifying financial fraud, tabular regression and classification tasks are ubiquitous. For years, supervised tree-based algorithms like [AdaBoost](https://en.wikipedia.org/wiki/AdaBoost), [XGBoost](https://en.wikipedia.org/wiki/XGBoost) and [random forests](https://en.wikipedia.org/wiki/Random_forest), to name a few, have historically dominated this space, offering robust performance on structured data.

However, the lifecycle of deploying these traditional models presents a significant bottleneck. Fitting an XGBoost model to a new dataset is not merely a matter of a single .fit() step; it invariably requires tedious manual effort. Data scientists must invest countless hours into extensive hyperparameter optimization and domain-specific feature engineering just to extract a reliable signal from the raw data.

On the other hand, recent advances in the broader machine learning landscape — particularly the evolution of large language models (LLMs) — have changed how we interact with novel tasks. LLMs have demonstrated the remarkable power of zero-shot prediction through [in-context learning](https://arxiv.org/abs/2005.14165) (ICL). This technique lets a pretrained model learn a new task by providing examples and instructions in the input context, without updating any underlying model weights.

Today, we introduce TabFM, a foundation model designed specifically for tabular data classification and regression. By framing tabular prediction as an ICL problem, TabFM eliminates the need for manual model training, [hyperparameter tuning](https://en.wikipedia.org/wiki/Hyperparameter_optimization), and complex feature engineering. We are excited to share how this approach allows users to generate high-quality predictions on previously unseen tables in a single forward pass. TabFM is now available on our [Hugging Face](https://huggingface.co/google/tabfm-1.0.0-pytorch) and [GitHub](https://github.com/google-research/tabfm) repos.

## How it works

The traditional ML paradigm relies on updating model parameters specific to a given dataset's distribution. In contrast, the ICL paradigm bypasses this completely. Instead of undergoing a traditional training phase for each new task, TabFM takes the entire dataset — comprising both the historical training examples and the target testing rows — as a single unified prompt. The model learns to interpret the relationships between columns and rows directly from this context at inference time.

However, applying ICL to tabular data is not as straightforward as tokenizing natural language. Standard language models process one-dimensional, ordered sequences, but tables are fundamentally two-dimensional and inherently orderless: swapping two rows or two columns does not change the underlying meaning of the data. To effectively process these diverse tabular structures while enabling scalable zero-shot prediction, TabFM synthesizes the strengths of architectures like [TabPFN](https://arxiv.org/abs/2207.01848) and [TabICL](https://arxiv.org/abs/2502.05564) into a novel hybrid design. This architecture, visualized below, relies on three key mechanisms:

*   _Alternating row and column attention_: First, the raw table is processed through a multilayer attention module. Similar to TabPFN, this step applies alternati
