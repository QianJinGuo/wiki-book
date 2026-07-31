# LLM-Driven Feature Discovery

## Ch01.1344 LLM-Driven Feature Discovery

> 📊 Level ⭐⭐⭐⭐ | 4.2KB | `entities/llm-driven-feature-discovery.md`

# LLM-Driven Feature Discovery

> **来源**: [LLM-Driven Feature Discovery](https://www.alignmentforum.org/posts/WAZWA6FPQvH8okouJ/llm-driven-feature-discovery)


## 概述

Published Time: 2026-06-22T22:26:51.599Z

Markdown Content:
We would often like to get a qualitative sense of a target model’s behaviors in important distributions (e.g. deployment, RL training, or evals). For example, we might want to [discover novel behaviors](https://alignment.anthropic.com/2026/petri-v2/), figure out what causes some target behavior to occur, or find [surprising correlations](https://arxiv.org/abs/2602.05910v1) between behaviors.

In a recent short exploratory project, we tackled this problem via _LLM-Driven Feature Discovery._ Our method works as follows:

1.   Choose a dataset of model transcripts
2.   Split transcripts into three pieces: user turns, thoughts, and assistant responses.
3.   Ask a black box LLM autorater to generate a set of 10-20 “features” of each transcript piece. By feature we mean notable/interesting/important aspects of the transcript piece; we include the prompt we use below. Note that the autorater only sees one piece at a time.
4.   Get a semantic embedding for each generated feature
5.   Cluster the semantic embeddings separately for user, thoughts, and response features
6.   Ask a language model to name each cluster by giving it 100 random features for each cluster and asking it to “produce a single concise label (around 5 words) that captures the common theme of these features.”.

![Image 1: feature-discovery-diagram.png](https://res.cloudinary.com/lesswrong-2-0/image/upload/v1782167151/lexical_client_uploads/flokviv1fdsm43hznr74.png)

During the project, we sometimes thought of this work as a sort of "black box SAE", since it was solving a similar problem as SAEs of featurizing model text, but without using model internals.

After doing this work, we found that this was a similar idea to [Explaining Datasets in Words: Statistical Models with Natural Language Parameters](https://arxiv.org/abs/2409.08466) (EDW). EDW optimizes over directions in an embedding space and then maps those directions to natural language features (“predicates”). Thus, EDW’s output is similar to ours. However, our method is simpler in that it requires just one LLM call per prompt and does not require multiple steps of iteration. Additionally, our method is unsupervised; we don’t need a target to optimize the embedding directions against. EDW seems preferable if one aims to minimize the error of a specific statistical model with natural language features.

Since this is preliminary work, we do not compare against EDW or other methods in the literature. We are not currently planning on pursuing this idea further, but would be interested if other members in the community expanded on it.

## A short summary of our main results:

```mermaid
graph TB
    subgraph "输入处理"
        TOK[Tokenizer<br/>BPE分词] --> EMB[Embedding<br/>语义嵌入]
        EMB --> POS[位置编码<br/>RoPE/ALiBi]
    end
    subgraph "Transformer Block ×N"
        ATT[Multi-Head Attention<br/>自注意力]
        ADD1[残差连接+LayerNorm]
        FFN[FFN / MoE<br/>前馈/混合专家]
        ADD2[残差连接+LayerNorm]
        POS --> ATT --> ADD1 --> FFN --> ADD2
    end
    subgraph "输出"
        PROJ[输出投影]
        SOFT[Softmax / Sampling]
        NEXT[Next-Token]
    end
    ADD2 --> PROJ --> SOFT --> NEXT
    subgraph "优化技术"
        KV[KV Cache<br/>PagedAttention]
        QUANT[量化 INT4/8]
        SPEC[投机解码]
    end
    ATT --> KV
    FFN --> QUANT
    SOFT --> SPEC
    classDef input fill:#fef3c7,stroke:#d97706
    classDef block fill:#dbeafe,stroke:#2563eb
    classDef output fill:#d1fae5,stroke:#059669
    classDef opt fill:#ede9fe,stroke:#7c3aed
    class TOK,EMB,POS input
    class ATT,ADD1,FFN,ADD2 block
    class PROJ,SOFT,NEXT output
    class KV,QUANT,SPEC opt
```


We focus our analysis on a dataset of 100k chat transcripts, for which we generate 20k user, thought, and response features.

We find that:

1.   Many clusters describe interesting Gemini behaviors
2.   We mostly are not able to predict when a thought or response occurs using logistic regression on use

## 原文存档

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/llm-driven-feature-discovery.md)

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- 相关: [Agent 架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md)

---

