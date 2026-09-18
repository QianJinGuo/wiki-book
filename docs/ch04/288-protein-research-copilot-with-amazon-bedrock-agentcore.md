# Protein Research Copilot with Amazon Bedrock AgentCore

> 📊 Level ⭐⭐⭐⭐ | 12.3KB

> **Background**：基于 AWS 官方技术博客（2026-06-23），介绍如何用 Strands Agents SDK + Amazon Bedrock AgentCore 构建一个蛋白质研究助手。核心创新在于将蛋白质语言模型（ESM-C 300M）嵌入到 Agent 工作流中，实现自然语言驱动的肽序列相似性搜索。

## 核心架构

系统由三个专用工具编排在一个 Strands Agent 中：

1. **自然语言查询解析** — 从用户输入（如"Find 10 similar peptides to dengue virus peptide LPAIVREAI"）提取结构化搜索参数
2. **向量相似性搜索** — 使用 ESM-C 300M（Meta 蛋白质语言模型）生成肽序列嵌入，存储在 Amazon Aurora PostgreSQL + pgvector 中
3. **AI 摘要生成** — 对搜索结果进行科学摘要

```
用户自然语言查询
    │
    ▼
Strands Agent (Bedrock AgentCore Runtime)
    ├─ Tool 1: NL → 结构化参数
    ├─ Tool 2: pgvector 相似性搜索
    └─ Tool 3: LLM 摘要生成
```

## 技术栈

| 组件 | 技术选型 | 说明 |
|------|---------|------|
| Agent 框架 | Strands Agents SDK | AWS 开源 Agent SDK，支持 tool-use 模式 |
| 部署平台 | Amazon Bedrock AgentCore | 生产级 Agent 运行时 |
| 蛋白质模型 | ESM-C 300M | Meta 蛋白质语言模型，SageMaker Serverless 部署 |
| 向量存储 | Aurora PostgreSQL + pgvector | 元数据过滤 + 向量搜索一体化 |
| 基础模型 | Claude Sonnet 4.6 | 查询解析 + 摘要生成 |
| 容器化 | ECS Fargate | 无服务器容器部署 |

## 关键设计决策

**ESM-C 300M Serverless 部署**：使用 SageMaker Serverless Endpoint + bundled weights，实现快速冷启动。这对蛋白质模型尤为重要——ESM-C 有 3 亿参数，传统部署冷启动慢。

**单 Agent 多工具模式**：不同于多 Agent 协作，这里用单个 Strands Agent 编排三个专用工具。工具间通过 Agent 的上下文管理串联，避免了 Agent 间通信开销。

**pgvector 元数据过滤**：向量搜索不是纯 ANN，而是结合 SQL WHERE 子句做元数据过滤（如物种、肽长度），在单一查询中完成。

## 三个独有贡献（不应合并到现有 entity）

1. **ESM-C 蛋白质嵌入 + Agent 工作流** — 首次将蛋白质语言模型嵌入到 Agent 工具链中，实现自然语言驱动的蛋白质搜索
2. **SageMaker Serverless + bundled weights 模式** — 大模型（300M 参数）的 Serverless 部署方案，解决冷启动问题
3. **pgvector + 元数据过滤一体化** — 向量搜索与 SQL 过滤在同一查询中完成，避免了先 ANN 后 filter 的两阶段问题

## 部署要求

- AWS 账户 + Bedrock 基础模型权限（Claude Sonnet 4.6）
- Python 3.12+
- AWS CLI + IAM 权限（Bedrock, SageMaker, Aurora, ECS, CodeBuild）
- `pip install bedrock-agentcore-starter-toolkit`
- IEDB 病毒表位数据集
- 预计部署时间：30–45 分钟

## 深度分析

### 架构分层与职责边界：Strands 管编排，AgentCore 管运行

值得复用的核心是把「Agent 逻辑」与「Agent 运行」劈成两层。上层 [Strands Agents SDK](https://github.com/QianJinGuo/wiki-public/blob/main/entities/strands-agents.md) 只管控制逻辑：用 `@tool` 声明能力、从 docstring 与类型注解自动生成工具描述、由 orchestrator 按 query 决定调用顺序；下层 [Amazon Bedrock AgentCore](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-bedrock-agentcore.md) 提供托管 runtime，负责进程托管、会话标识（entrypoint 收到的 `context.session_id`）与镜像构建部署。

切分标准是：凡是「所有 Agent 都要做、做错很难查」的事——进程存活、扩缩容、会话隔离——交给托管层；凡是「领域特有、频繁改动」的事——工具粒度、prompt、检索参数——留在自己代码里。代价是抽象泄漏：entrypoint 只能返回一个 payload，作者必须用共享字典 `_tool_outputs` 把工具中间产物捞出来，前端才能拿到结构化的 parsed_query / search_results / summary，而非只有 Agent 的最终文本。

### 检索增强链路设计：嵌入 → 向量库 → 相似检索 → LLM 摘要

每一环都有明确的输入输出契约。第一环嵌入：输入氨基酸序列字符串，输出 960 维向量——ESM-C 300M 跑在 SageMaker AI serverless endpoint 上，`predict_fn` 对 `embeddings[:, 1:-1, :]` 做 mean-pooling（刻意去掉首尾特殊 token 位），把逐残基表示压成序列级向量。

第二环检索：Aurora PostgreSQL Serverless v2 + pgvector，`embedding vector(960)` 配 `ivfflat` 索引与 `vector_cosine_ops` 距离算子（`lists = 100`），相似度用 `<=>`；物种等元数据放进 `properties JSONB`，于是「找与 LPAIVREAI 相似的登革热病毒肽」被翻译成同一条 SQL 里的一半 ANN、一半 `WHERE properties->>'species' = ...`。第三环摘要：结果 JSON 交给另一个专用 Strands agent 生成科学解读。 三环的失败模式也各不相同：冷启动 2–3 分钟与 max concurrency = 5 会拖垮嵌入环，IVFFlat 随数据量增长召回下降、RDS Data API 1 MB 响应上限会截断检索环，而摘要环的典型病症是 LLM 对结构化结果做出超出证据的推断。

### 领域数据的特殊性如何反推工程决策

蛋白序列不是自然语言，这一点改写了几乎全部默认参数。文本 RAG 的常识是「先切 chunk、再嵌入」，但一条肽只有 8–20 个残基，本身就是不可再分的语义单元——chunk 策略在这里消失，取而代之的是「一条序列一个向量，元数据承载上下文」；氨基酸字符表只有 20 个字母，逐字符 tokenize 信息密度远高于自然语言，因此嵌入模型必须专门预训练，通用文本嵌入模型没有意义。

相似度语义也不同：文本检索的「相似」多指话题重叠，这里的「相似」指结构与功能相近——功能相近的肽在向量空间彼此靠近，无需序列比对即可检索，这正是替换传统比对工具链的关键收益。维度因此不是拍脑袋：300M 给 960 维是在 CPU 推理质量与延迟间的平衡；要更高精度需换 ESM-C 600M 或 ESM2，代价是显存与延迟同步上升。索引参数同理：`lists` 必须随数据量按比例上调，否则 ANN 先漏候选、LLM 再自信地总结一个不完整的候选集——这类默认值应由数据的物理形态推导，而不是从别的 RAG 项目复制粘贴。

### 关键设计决策的取舍：托管优先、结构化优先、工具原语化

已有三条关键决策共享同一偏好：能用托管服务消灭的复杂度就不自建。选 Aurora + pgvector 而非专门的自建向量库（选型取舍可对比 [Chroma vs Qdrant](https://github.com/QianJinGuo/wiki-public/blob/main/entities/vector-db-chroma-vs-qdrant.md)），换来元数据过滤与向量检索在同一条查询内完成，代价是索引调优成了自己的责任；选 RDS Data API 而非直连数据库，换来 Agent 运行时只需 HTTPS、不必打通 VPC 到数据库的路径，代价是 1 MB 响应上限与多一跳延迟。

第二个偏好是结构化优先于自然语言：entrypoint 刻意返回三段字段而非一段文本，前端才能渲染可排序表格、可展开参数与可下载 CSV。第三个偏好是把检索包成独立原语：`search_similar_peptides(sequence, species, limit)` 的签名本身就是契约（输入可判定、输出 JSON、失败可重试），而 parser 与 summarizer 内部各是一个独立 agent（"agents-as-tools" 模式），orchestrator 无需知道里面用了 LLM。 把 LLM 藏在函数签名后面，编排逻辑就能保持可读可测，每个工具也能独立替换。一次 query 固定三次 Bedrock 调用加一次 SageMaker 调用，热路径 1 分钟内、冷启动 2–3 分钟。通用做法可参见 [Tool Use 模式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/tool-use-patterns-ai-agents.md)。

### 从蛋白域到通用科研域：可移植的是链路形状

原文自己给出了迁移判断：基因组学、药物设计、材料科学都能复用同一形状——领域专用嵌入模型 + 结构化元数据过滤 + LLM 编排与总结，替换的恰好是三个插槽：嵌入模型、数据源与元数据 schema、评估方式（相似度定义从序列相似换为该域的结构或活性相似度）。

生产化缺口在原文 Considerations 里已点名一半：冷启动、嵌入模型选型、索引扩展、成本。没补上的是三块：一是评估集，原文只有「testing 中表现良好」的人工观察，换模型或换 `lists` 后无法判断召回变好还是变坏（可参考 [Agent 生产评估蓝图](https://github.com/QianJinGuo/wiki-public/blob/main/entities/evaluating-ai-agents-production-blueprint-strands-agentcore.md)）；二是回归测试与限流，`max concurrency = 5` 是硬上限，几个并发研究者就能把链路打满；三是调用链可观测性，三次 LLM 调用加一次向量检索横跨四五个服务，缺 trace 时排查「为什么摘要不对」只能靠猜。部署边界同样须提前确认：IAM 要覆盖 Bedrock / SageMaker / Aurora / ECS / CodeBuild，VPC 需私有子网 + NAT 网关 + 对应 VPC endpoint 才能让 runtime 不经公网触达依赖——AgentCore 简化了进程托管，但没有替你简化 IAM。

## 实践启示

1. **把领域嵌入模型当作一等公民评估，而非可替换的依赖。** 检索上限由它决定，300M / 600M / ESM2 是精度—延迟—内存的三方权衡，换模型必须重新评估，不能假定上层 LLM 会把它救回来。
2. **先固定评估集，再调向量检索参数。** IVFFlat 的 `lists`、距离算子与 top-k 都应在标注样本的召回率指标下调整；没有评估集时任何改动都只是「感觉变好了」。
3. **把每个工具做成幂等、有超时、可重试的原语。** 检索类工具应只读且可重复调用；`max concurrency = 5` 这类外部硬上限必须有队列与降级路径，否则并发用户会直接拖垮链路。
4. **开工前定好托管 runtime 的权限与网络边界。** AgentCore 简化的是进程托管而非 IAM：服务权限、私有子网与 VPC endpoint 的可达性、是否走 RDS Data API，都应在写第一行业务代码前定稿。
5. **跨域迁移优先复用「链路形状」而非具体组件。** 换到基因组或材料科学时，保留 orchestrator + 三工具 + 单 runtime 的骨架，只替换嵌入模型、数据源与评估口径，迁移成本就集中在三个明确插槽上。

## 相关主题

- [Bedrock AgentCore 多租户模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/shared-infrastructure-isolated-tenants-pool-model-multi-tenancy-with-amazon-bedrock-agentcore.md) — 同系列文章，聚焦 AgentCore 的多租户架构
- Amazon Bedrock AgentCore — AWS Agent 部署平台
- Strands Agents SDK — AWS 开源 Agent 框架
- pgvector — PostgreSQL 向量扩展

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关: Agent 架构

---

