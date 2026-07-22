---
title: "anthropic multi agent research system"
source_url: https://www.anthropic.com/engineering/multi-agent-research-system
tags: [anthropic, claude]
ingested: 2026-05-01
sha256: e3f2fc5fb0c31b286a0a7df7c0d1916372fe8352766ce5d9fe30da5b31329c55
type: raw
created: 2026-05-10
updated: 2026-05-10
---
# Anthropic Multi-Agent Research System
## Evaluation-relevant takeaways
- 多 agent 系统不应只检查“有没有走预定义路径”
- 很多任务存在多条有效路径，因此评估应更关注 outcome 是否正确、过程是否合理
- 早期小样本测试就很有价值，不必等到几百条样本
- 多 agent / orchestration 系统应优先围绕真实使用模式设计 eval suite
## Why it matters for this vault
`wiki-evolver` 虽然不是纯多 agent 系统，但它也是 orchestration system。它的评估要避免把“固定步骤完全一致”当成唯一正确性标准，而应允许不同路径得到同样有效的 durable outcome。