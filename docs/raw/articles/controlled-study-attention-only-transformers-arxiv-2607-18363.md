---
source: newsletter
source_url: https://arxiv.org/abs/2607.18363
ingested: 2026-08-11
sha256: bc18a0536514fc647ec405e09875486a0119226870bd2a04ce4ae6530c946618
title: "A Controlled Study of Attention-Only Transformers"
vxc_score: 64 (LLM deepseek-v4-flash)
---

# [2607.18363] A Controlled Study of Attention-Only Transformers

**Authors**: Henry Ndubuaku, Karen Mosoyan, Jakub Mroz, Noah Cylich, Satyajit Kumar, Parkirat Sandhu, Roman Shemet, Justin H Lee

**Submitted**: 20 Jul 2026 · **Subjects**: cs.LG, cs.AI, cs.CL

**Abstract:** Feed-forward networks hold two thirds of a transformer's non-embedding parameters, yet the architecture has not received a necessity test that controls parameters, compute, and depth at once. We pretrain attention-only decoder transformers (Simple Attention Networks, SANs) against standard transformers matched separately for parameter count, training FLOPs, and depth (2 to 48 layers), for up to 105B tokens at 6M to 87M parameters. Deleting feed-forward layers in place is costly: the standard transformer leads by 0.47 nats at matched depth and 0.26 nats at matched FLOPs. Reallocating the freed budget into attention depth closes the gap: at matched parameters the difference is 0.006 nats (0.27 percent of loss), reproducible to one part in ten thousand across seed pairs, shrinking across 5B, 30B, and 105B budgets, and holding near 0.02 nats across a 29x size range. Three measurements localize the remaining gap to parametric recall: attention-only models are better on context-grounded answers and worse where knowledge must come from weights. Weight spectra show why: routing matrices (Q/K) crystallize early, content matrices accumulate rank slowly, and removing feed-forward layers relocates this accumulation to the attention output projection. QK-normalization, not feed-forward layers or residual gating, keeps 48-layer attention-only stacks trainable. The deficit concentrates on low-context query prediction and localizes there entirely by the largest budget. A pre-registered test confirms the account: it predicts a 0.02 to 0.05 nat gap on knowledge-dense web text; a matched pair trained on fineweb-edu measures 0.040. Within the tested regime, attention does the rest.

**Key findings:**

- 前馈层占 transformer 非 embedding 参数的 2/3，但从未有过同时控制参数/算力/深度的必要性检验
- 原位删除 FF 层代价高：matched-depth 差 0.47 nats，matched-FLOPs 差 0.26 nats
- 将释放的预算重分配给注意力深度可闭合差距：matched-params 差仅 0.006 nats（损失的 0.27%），跨 seed 对可复现到万分之一
- 剩余差距定位到**参数化回忆（parametric recall）**：attention-only 在上下文接地回答上更好，在需要权重内知识的场景更差
- QK-normalization（而非 FF 层或残差门控）是 48 层 attention-only 栈可训练的关键
- 预注册测试预测 0.02-0.05 nat 差距，fineweb-edu 实测 0.040
