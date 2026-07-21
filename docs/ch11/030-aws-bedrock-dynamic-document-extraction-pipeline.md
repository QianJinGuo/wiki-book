# AWS Bedrock Dynamic Document Extraction Pipeline

## Ch11.030 AWS Bedrock Dynamic Document Extraction Pipeline

> 📊 Level ⭐⭐ | 15.7KB | `entities/extract-data-with-on-demand-and-batch-pipelines-dynamically.md`

# AWS Bedrock Dynamic Document Extraction Pipeline

> **架构概述**：AWS 中国博客 2026-06-11 发布的智能文档处理（IDP）参考架构，演示了 Amazon Bedrock 文档处理 pipeline 如何**同时支持 on-demand 与 batch 两种推理模式**，并通过 **Bedrock Prompt Management 实现每文档动态 prompt 选取**。真实场景：客户拥有数亿份扫描 PDF 地契文档，格式各异（列表/表格/图示），需要 LLM 抽取标准化数据。架构以 FIFO SQS 队列触发 Lambda 函数，按文档级别路由到不同 prompt 版本与模型，结构化结果存入 DynamoDB。

## 三条独有贡献

1. **同一 pipeline 内部按延迟需求动态路由 on-demand vs batch** —— 不是两个独立 pipeline，而是同一个入口根据时间敏感性选择 on-demand（秒级响应）还是 Bedrock batch inference（异步、cost-optimized）。这与"批处理 vs 实时"二元切分不同，是真正的混合架构。
2. **Bedrock Prompt Management 作为 prompt 版本化的运行时 registry** —— SQS 消息本身携带 `prompt_id + version`，Lambda 在执行时按 ID+version 从 Prompt Management 拉取 prompt body。50 prompts × 10 versions per region 的服务上限是真实约束，等同于 prompt CI/CD 基础设施。
3. **按文档格式动态选 prompt（不仅是按任务）** —— 地契文档有 3 种格式变体（编号列表 / 表格 / 图示），文章不假设一个 prompt 适用所有，而是为每种格式维护独立 prompt 版本。SQS 消息的 `prompt_id` 字段按文档格式选择，可同时支持同一 pipeline 处理多类文档。

## 核心架构图

```
                            ┌─ SQS FIFO 队列（on-demand 入口）
                            │   消息含 doc_id, model_id, prompt_id/version
                            │        │
                            │        ▼
                            │   Lambda 函数：
                            │     1. S3 拉取 PDF
                            │     2. PDF→PNG（>20 页分块）
                            │     3. 从 Bedrock Prompt Management 拉取 prompt
                            │     4. 调 LLM（多模态）
                            │     5. 结果写入 DynamoDB
                            │
  Producer  ────────────►  ─┤
  (文档上传 + 格式分类)     │
                            │  ── 或 ──
                            │
                            │   Bedrock Batch Inference Job
                            │   异步处理多文档，
                            │   同样使用 Prompt Management 拉取 prompt
                            ▼
                        DynamoDB（结果 + 性能指标）
```

## 实现细节

### 1. On-demand 路径：SQS FIFO + Lambda

**为什么 FIFO 而非 standard queue：**
- Reliable Message Delivery（恰好一次投递）
- 严格 FIFO 顺序（同 MessageGroupID 内）
- Message Grouping（按 producer 分组，每组内保序）

每条 SQS 消息结构：
```json
{
  "doc_id": "...",
  "model_id": "anthropic.claude-4-sonnet",
  "prompt_id": "pm-xxxx",
  "prompt_version": 3,
  "s3_location": "s3://bucket/land-lease-001.pdf"
}
```

Lambda 处理流程：
1. 拉 PDF → 转 PNG（多模态输入）
2. **>20 页分块**（Claude 4 Sonnet 限制 20 images/请求）
3. 调 Prompt Management 取 prompt body
4. LLM 调用
5. 抽取结果 + 性能指标（latency / token count）写入 DynamoDB

### 2. Batch 路径：Bedrock Batch Inference

异步处理大量文档，cost 优化（batch 模式单价低于 on-demand 50%+）。**关键设计：batch 也使用同一个 Prompt Management**，所以 on-demand vs batch 切换不需要重写 prompt 逻辑。

### 3. Prompt Management 模式

**Prompt 作为版本化运行时资源**：
- 50 prompts per region（service limit）
- 10 versions per prompt
- 每次 LLM 调用 = `(prompt_id, version) → prompt_body`
- 文档格式 × 任务 = 独立 prompt（3 格式 × 2-3 任务 = 6-9 prompts）

**这本质上是 "Prompt CI/CD"** —— 同一思路已在 `entities/aws-bedrock-intelligence-message-defense.md` 描述（80/20 流量分配做 A/B test，7 天稳定后全量切），但本文提供具体 service-limit 数字（50/10）与使用代码样例。

## 与现有实体的关系

### [Aws Bedrock Intelligence Message Defense](ch11/009-aws-bedrock.html) — 共享 prompt versioning 思想
该 entity 提到 "Prompt CI/CD" 概念但**没有给出具体服务限制数字**（50/10 prompts/region）也没有 batch 集成方案。本 entity 是其**具体实现 + 服务约束**的工程补全。

### [Process Financial Documents Using Amazon Bedrock Data Automa](ch11/158-amazon-bedrock.html) — 同主题但不同角度
该 entity 描述 **Bedrock Data Automation** 自动化产品（无代码 IDP 服务），本文描述的是**自建 Bedrock pipeline**（有代码、Lambda + SQS + 动态 prompt 选取）。两文互补 —— Data Automation 适合标准化场景，自建 pipeline 适合需要 prompt 高度定制或与现有 SQS 工作流集成的场景。

### 差异化
- **不**是 Bedrock Data Automation 介绍（那是 1-click 自动化产品）
- **不**是单纯 SQS+Lambda 教程（重点在 prompt 动态选取 + 混合推理模式）
- **不**是简单 RAG 架构（不是检索增强，是 prompt 路由）

## 实践启示

1. **多格式文档处理应按格式分 prompt 而非一套 prompt 通吃** —— 准确率显著提升（文章未给具体数字但强调"enhances extraction accuracy"）
2. **Batch + on-demand 混合是真实生产模式** —— 不要选边站。SQS 入口路由 + 同一 Prompt Management registry 是关键设计
3. **Prompt Management 服务限制（50/10）应作为架构设计输入** —— 超过 50 个独立 prompt 时需要分层（per-tenant 命名空间、prompt 工厂、prompt 缓存等）
4. **多模态 LLM 的 page-per-request 限制是隐藏瓶颈** —— Claude 4 Sonnet = 20 images max。大型文档必须分块 + doc_id/chunk_id/chunk_count 三元组追踪
5. **DynamoDB 存储 performance metrics** 是 A/B test 与生产可观测性的基础（与 prompt versioning 配合做端到端 trace）

## 与 agent / harness 主题的关联

虽然本文是文档处理 IDP 场景，但 prompt registry + 动态路由 + FIFO 任务队列模式可推广到 agent / harness 场景：

- **Agent harness 中 prompt 的多版本管理** —— harness 不会只有一套 prompt，需要按子任务 / 工具 / 数据状态切换
- **SQS + 动态模型路由** —— on-demand vs batch 模式可推广到 "low-latency agent vs cost-optimized batch agent"
- **DynamoDB 存 (doc_id, chunk_id, model_id, prompt_version, result, metrics)** —— 这是 agent step-level trace 的极简版本，可作为 harness observability 的基础

## 引用

## 相关实体

- [from pdfs to insights: architecting an intelligent document](ch11/236-from-pdfs-to-insights-architecting-an-intelligent-document.html)
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/extract-data-with-on-demand-and-batch-pipelines-dynamically.md)

## 深度分析

1. **混合 on-demand + batch 推理是生产级 IDP 的必然架构选择**
   - 核心观点：文章的核心贡献不是"SQS+Lambda 怎么做文档提取"，而是"同一 pipeline 如何按延迟需求动态路由 on-demand vs batch"。这打破了"批处理 vs 实时是二元选择"的误解，是真正的混合架构。
   - 技术要点：SQS FIFO 队列接收统一消息格式（`doc_id + model_id + prompt_id/version`），然后根据时间敏感性路由到 on-demand（Lambda 实时调用 Bedrock）或 batch（Bedrock Batch Inference Job）。两者共享同一个 Prompt Management registry。
   - 实践价值：企业级 IDP 场景中，部分文档需要秒级响应（如人工复审触发），部分文档可以异步批量处理（历史文档归档）。混合架构避免了两套独立 pipeline 的维护成本。

2. **Prompt Management 是企业级 Prompt CI/CD 的最小必要基础设施**
   - 核心观点：文章揭示了 Bedrock Prompt Management 的真实服务限制：50 prompts/region + 10 versions/prompt。这组数字是企业评估"是否适合自建 pipeline"的关键输入，超过限制需要分层设计。
   - 技术要点：每文档级别的 `prompt_id + version` 存储在 SQS 消息中，Lambda 执行时动态拉取 prompt body。这实现了"同一入口，不同 prompt 版本"的路由能力，本质是 prompt 的版本化运行时注册表。
   - 实践价值：50/10 的限制意味着大型企业（多 tenant，多文档类型）需要考虑 prompt 工厂模式、per-tenant 命名空间、或 prompt 缓存层。这是架构设计早期就需要确定的约束。

3. **多模态 LLM 的 page-per-request 限制是大型文档处理的隐藏瓶颈**
   - 核心观点：Claude 4 Sonnet 的 20 images/request 限制在文章中被明确处理（>20 页必须分块），但这实际上是所有多模态 LLM 文档处理的普遍约束，不因模型而异。
   - 技术要点：分块策略需要 `doc_id + chunk_id + chunk_count` 三元组追踪，确保结果能正确重组存入 DynamoDB。这个三元组设计对任何大型文档分块处理都有参考价值。
   - 实践价值：在真实生产环境中，数百页的合同/地契文档很常见，分块策略的正确性直接影响提取完整性和顺序准确性。

4. **DynamoDB 存储 performance metrics 是端到端可观测性的基础**
   - 核心观点：文章在结果存储之外额外记录 latency/token count 等性能指标，这不是论文式的"额外贡献"，而是生产可观测性的必要设计——与 [Aws Bedrock Intelligence Message Defense](ch11/009-aws-bedrock.html) 的 prompt A/B test 思路一致。
   - 技术要点：`(doc_id, chunk_id, model_id, prompt_version, result, metrics)` 的存储结构支持细粒度的 on-demand vs batch 性能对比、prompt 版本效果分析、以及 production trace。
   - 实践价值：这是 agent/harness 可观测性设计的极简参考实现，可推广到任何需要 trace LLM 调用质量的场景。

5. **按文档格式动态选 prompt 是提升提取精度的关键工程细节**
   - 核心观点：文章强调"地契文档有 3 种格式变体（编号列表/表格/图示），不假设一个 prompt 适用所有"。这与 [Optimize Blueprint Extraction Accuracy In Amazon Bedrock Dat](../ch12/041-optimize-blueprint-extraction-accuracy-in-amazon-bedrock-dat.html) 的"跨版面泛化"问题呼应，但本文给出了具体的工程解法。
   - 技术要点：每种文档格式对应独立的 prompt（3 格式 × 2-3 任务 = 6-9 prompts），SQS 消息的 `prompt_id` 字段按文档格式路由选择。这是"格式感知 prompt 路由"的工程实现。
   - 实践价值：在实际 IDP 项目中，按格式分 prompt 的准确率提升往往比优化单一 prompt 更显著，因为不同格式的版面特征差异远大于同一格式内的措辞差异。

## 实践启示

1. **设计 IDP pipeline 时，优先确定 on-demand vs batch 的路由策略** — 不是两套独立 pipeline，而是同一 SQS 入口 + 统一消息格式 + 按延迟需求动态路由。这降低了维护复杂度，也保证了 prompt 逻辑的一致性。

2. **在 Prompt Management 服务限制（50/10）内设计 prompt 架构** — 超过 50 个独立 prompt 时需要分层设计：per-tenant 命名空间、prompt 工厂、或 prompt 缓存层。早期架构决策影响后续扩展成本。

3. **多模态 LLM 的大型文档必须做分块 + 三元组追踪** — `doc_id + chunk_id + chunk_count` 是保证提取结果正确重组的基础设计，也是当前所有多模态 LLM 的共同约束（Claude 4 Sonnet = 20 images/request）。

4. **DynamoDB 存储结构应包含性能指标字段** — `(doc_id, model_id, prompt_version, latency, token_count, result)` 是 A/B test 与生产可观测性的最小必要字段集，可推广到其他 LLM 调用场景。

5. **与 [Aws Bedrock Intelligence Message Defense](ch11/009-aws-bedrock.html) 联合参考** — 后者侧重 prompt versioning + A/B test 的 80/20 流量分配策略，前者侧重动态 prompt 路由 + 混合推理模式。两者构成完整的 Bedrock Prompt Management 最佳实践。

6. **按文档格式分 prompt 而非一套 prompt 通吃** — 地契文档的 3 种格式变体说明，格式差异（列表/表格/图示）比任务差异更需要独立的 prompt。这是提升提取精度的低成本高回报工程优化。

---

