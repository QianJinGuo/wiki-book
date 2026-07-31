# 使用 lm evaluation harness 评估 amazon bedrock 模型以 humaneval 为例

## Ch01.563 使用 lm evaluation harness 评估 amazon bedrock 模型以 humaneval 为例

> 📊 Level ⭐⭐ | 8.0KB | `entities/使用-lm-evaluation-harness-评估-amazon-bedrock-模型以-humaneval-为例.md`

# 使用 lm evaluation harness 评估 amazon bedrock 模型以 humaneval 为例

> **v×c = 64**，来自 rss 频道。


## 概念导图

```mermaid
mindmap
  root(("使用 lm evaluation harness 评估 …"))
    深度分析
      HumanEval 的饱和与代码生成评测的演进方向
      Prompt Caching 的经济学
      sweep 模式的方法论意义
      Bedrock 托管环境 vs 直接 API …
    实践启示
    相关实体
```

## 摘要

本文展示了如何在 Amazon Bedrock 上集成 lm-evaluation-harness 框架与 LiteLLM 适配层，对 GPT-5.6 Sol、Claude Opus 4.8、Claude Sonnet 5 运行 HumanEval 编程基准测试。三模型 pass@1 均达到 97-98%，其中 GPT-5.6 Sol 以 98.2% 领先。同时，利用 Bedrock Prompt Caching 可节省 84% 以上的输入 token 成本（从 $203.10 降至 $31.99）。

## 核心要点

```mermaid
graph TB
    subgraph "边缘层"
        CDN[CDN/缓存] --> LB[负载均衡]
        LB --> GW[API Gateway<br/>认证+限流]
    end
    subgraph "服务层"
        SVC_A[业务服务A]
        SVC_B[业务服务B]
        AGENT_SVC[Agent 服务]
    end
    GW --> SVC_A & SVC_B & AGENT_SVC
    subgraph "Agent 运行时"
        SANDBOX[沙箱隔离]
        RUNTIME[执行引擎]
        POOL[连接池]
    end
    AGENT_SVC --> SANDBOX --> RUNTIME
    RUNTIME --> POOL
    subgraph "数据层"
        DB[(关系数据库)]
        CACHE[(Redis缓存)]
        OBJ[(对象存储)]
        VDB[(向量数据库)]
    end
    SVC_A --> DB & CACHE
    AGENT_SVC --> OBJ & VDB
    classDef edge fill:#fef3c7,stroke:#d97706
    classDef svc fill:#dbeafe,stroke:#2563eb
    classDef runtime fill:#ede9fe,stroke:#7c3aed
    classDef data fill:#d1fae5,stroke:#059669
    class CDN,LB,GW edge
    class SVC_A,SVC_B,AGENT_SVC svc
    class SANDBOX,RUNTIME,POOL runtime
    class DB,CACHE,OBJ,VDB data
```


1. **三模型同台竞技**：GPT-5.6 Sol（98.2% pass@1，84.8s）、Claude Opus 4.8（97.0%，135.2s）、Claude Sonnet 5（97.0%，146.7s）。GPT-5.6 Sol 在速度和准确率上均领先。
2. **Prompt Caching 巨大成本节约**：通过注入 ~5500 tokens 的可缓存系统提示，在 164 题评估中将输入成本减少 84% 以上。缓存命中率 93.6%。
3. **Sweep 模式自动参数调优**：12 种配置组合的网格搜索（apply_chat_template × thinking × max_gen_toks），自动推荐最优参数。
4. **Bedrock 特定适配**：处理了 Claude Opus 不支持 assistant prefill 和 temperature 参数的限制，通过 monkey-patch 适配。
5. **三层输出结构**：results.json（结构化数据）、report.html（可视化报告）、sweep_results.json（配置对比）。

## 深度分析

### HumanEval 的饱和与代码生成评测的演进方向

三模型在 HumanEval 上均达到 97-98% 的 pass@1，差距仅 1.2 个百分点。这一结果印证了一个行业趋势：HumanEval 作为代码生成基准已接近饱和，无法有效区分前沿模型的代码能力。模型的差异性正在向更复杂的场景迁移 —— SWE-Bench、Terminal-Bench 等需要多步编辑、环境交互和工具使用的评测正在取代 HumanEval 成为新的区分基准。

### Prompt Caching 的经济学

Bedrock 的 Prompt Caching 机制使得批量评估的成本结构发生了质变。传统模式下，164 次 API 调用的成本是线性增长的：每次请求都传输完整的 ~5500 tokens 系统提示。开启缓存后，第一次请求写入缓存（$3.75/M tokens），后续 163 次请求几乎只读（$0.30/M tokens）。这使得 164 题的 HumanEval 评估成本从 $203.10 降至 $31.99。

更值得关注的是缓存命中率达 93.6% —— 这说明在标准的批量评估场景中，系统提示占用的 token 比例极高，而缓存机制近乎消除了这些重复开销。对于任何包含共享前缀的批量推理场景（RAG、batch evaluation、multi-turn 对话中的 system message），Prompt Caching 的成本效益都值得认真评估。

### sweep 模式的方法论意义

本方案引入的 sweep 模式（自动化网格搜索最优参数组合）反映了 LLM 评估中的一个普遍问题：评估结果高度依赖推理参数（temperature、max_gen_toks、chat_template）。在无差异的参数配置下评估模型，可能会得到误导性的结果。Sweep 模式通过系统性地探索参数空间消除了这一盲点。

这一方法论可以扩展到更广泛的应用 —— 在部署模型到生产环境时，先运行 sweep 模式找到最优的推理参数组合，再使用该配置进行完整的质量验证。将模型选型从"一次性的 benchmark 看板"变为"可复现的配置 + 评估 pipeline"。

### Bedrock 托管环境 vs 直接 API 的评估一致性

该方案的一个重要结论是：在 Bedrock 托管环境中评估的模型表现与官方报告的一致，甚至 Claude 系列在 Bedrock 上的 HumanEval 结果（97.0%）超过了 Anthropic 官方基线（93.7%）。这验证了 Bedrock 托管环境的推理质量与直接 API 调用相当，不会引入额外的性能损失。

## 实践启示

1. **优先使用开源评估框架 + API 平台组合**：lm-evaluation-harness 提供了 300+ benchmark 的标准化评估接口，通过 LiteLLM 适配 Amazon Bedrock 即可对一个模型跑完整评估。避免自建评估框架，直接复用社区置信的流水线。

2. **批量评估必须开启 Prompt Caching**：任何包含共享前缀（系统提示、few-shot 示例、RAG 上下文）的批量推理场景，都应启用 Prompt Caching。关键在于确保缓存前缀达到 4096 tokens 以上的阈值，否则不会触发缓存。

3. **评估前先 sweep**：在运行完整评估前，使用 sweep 模式在 10-20 样本子集上找到最优参数组合。这可以避免因次优参数导致评估结果系统性偏低，同时节省批量评估的 API 成本。

4. **关注评估工具链对 API 差异的处理**：不同模型在 Bedrock 上的 API 限制各不相同（Claude Opus 不支持 prefill/temperature）。需要使用适配层（如本方案的 monkey-patch）统一处理这些差异，确保评估结果的公平对比。

5. **将评估 pipeline CI/CD 化**：将 sweep + full_eval + cost_analysis 整合为一个脚本。在新模型发布、API 升级或部署环境变更时自动运行，确保模型在 Bedrock 上的表现始终有量化数据支持。

## 相关实体

- HumanEval 基准 — 编程代码生成的标准评测基准
- lm-evaluation-harness — EleutherAI 的开源标准评估框架
- Amazon Bedrock — 托管推理服务和模型访问层
- LiteLLM — 统一 API 适配层
- GPT-5.6 Sol — HumanEval 表现最优模型（98.2% pass@1）
- Claude Opus 4.8 — HumanEval 表现 97.0%，Bedrock 适配需 monkey-patch
- Claude Sonnet 5 — HumanEval 表现 97.0%，成本效益较高
- Prompt Caching — Bedrock 原生缓存机制，实现 84%+ 成本节省
- LLM 评估框架 — 标准化评估流水线的设计方法论

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/使用-lm-evaluation-harness-评估-amazon-bedrock-模型以-humaneval-为例.md)

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- 相关: [Agent 架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md)

---

