---
title: "CodeWiki: 为 LLM 自动生成代码知识库的工程实践"
source_url: "https://mp.weixin.qq.com/s/t6jDH4JoLCj6ZcAOIByHdw"
source_account: "高德技术"
author: "信息业务中心"
ingested: 2026-07-22
type: raw-article
tags: [codewiki, knowledge-base, llm, code-understanding, merkle-tree, call-graph, evidence-based, gaode]
review_value: 7
review_confidence: 8
review_vxc: 56
review_decision: raw-only
---

# CodeWiki: 为 LLM 自动生成代码知识库的工程实践

> **来源**：高德技术，2026-07-22
> **评分**：v=7, c=8, v×c=56 → **Raw only**

CodeWiki 是自动为代码仓库生成供 LLM 消费的结构化知识库的工程系统。与 Cognition AI DeepWiki（供人阅读）不同，CodeWiki 面向 LLM 下游任务，每条业务断言附带代码证据和置信度。

## 九阶段生成流水线

自底向上（bottom-up）：代码单元级描述 → 文件摘要 → 包摘要 → 仓库总览 → 业务流

### 核心技术点

**增量检测**：三层 Merkle Tree（root→file→code_unit）进行方法级变更检测，哈希相同子树跳过，日常变更仅个位数 LLM 调用。

**调用图构建**：从 AST 提取双向调用图（BFS 遍历），精确收集关联函数源码注入 prompt，避免全文件上下文引入无关干扰。

**LLM 描述生成**：每条 business_rule 必须附带 evidence（field/type/quote/reason），无证据断言标记为 candidate。confidence 用于排序和复核提示，不替代研发判断。

**模式路由**：DTO/VO/Config/Mapper 等结构代码由规则引擎处理，业务核心代码走 LLM（约 500/1200 单元由规则处理）。

## 结果

"投放时段智能调控"案例中，proposal 对 9 项关键约束的覆盖得分由 0.5 提升至 7.5。
