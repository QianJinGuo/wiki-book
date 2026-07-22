---
title: "langsmith trajectory evals"
source_url: https://docs.smith.langchain.com/evaluation/how_to_guides/trajectory
ingested: 2026-05-01
sha256: c3bff4f0d77f0f6a8172f387c87f5d8c4b7806903292a2461d8158f0b20f7444
type: raw
created: 2026-05-10
updated: 2026-05-10
tags: []
---
# LangSmith Trajectory Evaluations
## Core takeaways
- agent 的很多行为只会在真实 LLM 运行里暴露
- trajectory eval 可以评估消息、工具调用和决策路径
- trajectory match 适合步骤明确的工作流
- LLM-as-judge trajectory eval 适合更灵活、更关注“过程是否合理”的场景
- reference trajectory 可以有，也可以没有
## Modes
- strict
- unordered
- subset
- superset
## Why it matters for this vault
`wiki-evolver` 既有一些强约束步骤，比如 orient / choose leverage track / govern / close out，也有一些开放式判断。因此它最适合：
- outcome rubric
- 配合轻量 trajectory checklist
而不是只看最终文字质量。