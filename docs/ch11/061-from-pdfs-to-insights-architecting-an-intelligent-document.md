# From PDFs to insights: Architecting an intelligent document processing pipeline with AWS generative AI services

> 📊 Level ⭐⭐⭐ | 10.7KB

AWS 在 2026-06 发布的一篇 IDP（智能文档处理）架构深度文章，展示了用 **Amazon Bedrock Data Automation (BDA) + Strands Agents on AgentCore + Bedrock Knowledge Base** 三件套构建 4 层 IDP 流水线的完整方案。这是从 PDF 原始文件 → 上下文抽取 → 知识整合 → agent 协调的端到端架构。

## 背景：为什么传统 OCR 不够

- 传统 OCR 只做文本抽取，**不能理解 context、关系、含义**
- 复杂文档（保险单 / 发票 / 法律合同 / 病历）需要语义理解
- 手动干预 = 高耗时 + 高成本 + 潜在错误

**BDA 的核心能力**：
- 统一 API 抽取 multimodal 内容（文档 / 图像 / 视频 / 音频）
- 理解文档 context + 校验抽取数据 + 提供 confidence scores
- 自动按 logical boundary 切分 + 分类 + 路由到正确 blueprint
- 支持大文件：单次 API 调用最多 3000 页 / 500MB

## 4 层 IDP 架构

1. **Input processing layer** — 文档上传触发 orchestration + state machine 协调
2. **Extraction and storage layer** — 原始文本 + 表格抽取，图像 / 视觉元素分析，可扩展数据集成
3. **Intelligence layer** — Knowledge base ingestion + semantic search，multimodal FM 分析，LLM-powered 解读
4. **Agentic coordination layer** — Coordinator agent + specialized task agents

## 三件套技术栈

- **BDA** —— managed service，自动从文档抽取 insights
- **Strands Agents on AgentCore Runtime** —— 协调 specialized 处理任务
- **Bedrock Knowledge Base** —— 跨多文档的 context 理解

## 关键设计决策

- **Managed BDA 优先**：避免自建 OCR + classification pipeline
- **Strands Agents 负责 orchestration**：轻量级 agent harness，适合协调多步任务
- **Knowledge Base 提供跨文档 context**：semantic search + RAG
- **Layered architecture**：每层职责清晰，可独立扩展

## 适用场景

- 保险单处理（多文档 + 跨字段关联）
- 发票 + 采购订单（结构化抽取）
- 法律合同（条款 + 关系抽取）
- 病历（多模态 + 隐私合规）

## 与现有 wiki 实体的关联

- optimize-blueprint-extraction-accuracy-in-amazon-bedrock-dat — 同 BDA 平台，本文是 IDP 4 层架构全景，optimize-blueprint 是单点 blueprint 优化深度
- [building-supercharger-how-rocket-close-optimized-title-opera](https://github.com/QianJinGuo/wiki-public/blob/main/entities/building-supercharger-how-rocket-close-optimized-title-opera.md) — 金融场景生产 case study (Rocket Close)，Strands Agents + Bedrock + MCP
- [amazon-bedrock-agentcore-runtime-deep-dive-and-scenario-analysis](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-bedrock-agentcore-runtime-deep-dive-and-scenario-analysis.md) — AgentCore Runtime 深度（与本文 Strands on AgentCore 对应）
- [process-financial-documents-using-amazon-bedrock-data-automa](https://github.com/QianJinGuo/wiki-public/blob/main/entities/process-financial-documents-using-amazon-bedrock-data-automa.md) — 金融文档 BDA 案例
- [automate-schema-generation-for-intelligent-document-processing](https://github.com/QianJinGuo/wiki-public/blob/main/entities/automate-schema-generation-for-intelligent-document-processing.md) — schema 自动生成（与 BDA blueprint 互补）

## 深度分析

### 模板 / 正则 OCR 在真实文档上为何崩掉

模板匹配与正则隐含一个假设：版面稳定——字段位置固定、字体统一、单栏单语言。真实文档打破它的方式很多：扫描倾斜噪点、同一张表单的多个版本、页眉页脚漂移、跨页续表、印章遮挡、手写批注。更麻烦的是三个结构性问题：多栏排版下阅读顺序不再是简单的「从上到下」，表格的语义单位是单元格关系而非字符流，表单的语义单位是 key-value 对而非相邻文本。

分水岭在于 text extraction 与 semantic extraction：前者产出字符序列，后者要产出字段、类型、关系与含义。传统 OCR 停在第一层，「抽到了字」与「抽对了业务含义」之间的缺口全由人工补齐——这正是文档处理沦为成本重灾区的根因。BDA 的顺序值得注意：先按 logical boundary 切分（每段最多 20 页），再分类每段的文档类型，再匹配 blueprint，最后才抽取。这套「先路由、后抽取」把版面判断内建进服务，应用层不必为每种格式写预处理器。

### Blueprint 是声明式契约，不是抽取配置

官方规则很干脆：一个文档类型对应一个 blueprint。同类型文档需要的信息集合一致，共用一个；不同类型（护照 vs 银行对账单）信息集合不同，才拆分。一个 project 最多容纳 40 个 blueprint，BDA 自动路由。

这个抽象改变的是失败模式。字段级 OCR 后处理的失败模式是「字段缺失」——正则没命中就什么都没有，应用层靠判空兜底。声明式 schema 的失败模式是「字段错填」——schema 保证字段一定返回，但值可能类型对、语义错（把到期日填成开票日）。前者显眼好修，后者安静难查，因此 schema-first 必须配套 field-level 校验而非 existence 校验。另一条降本路径是 standard output 与 custom output 的分工：摘要、reading order 正文、表格与图注走 standard，blueprint 只声明业务字段，维护面因此能长期保持很小。

### 4 层架构的信任边界：校验应该站在哪里

Input → Extraction → Intelligence → Agentic 的信息流单向，信任应逐层递减。最容易被忽略的是校验位置：抽取结果若不经验证就直接喂给 Knowledge Base 做 embedding，错误会被向量化固化，之后所有 RAG 检索都继承它，而结果看起来始终自洽——这是最难定位的一类故障。正确做法是把校验与 confidence 过滤放在 extraction 与 intelligence 之间，给进入知识库的内容设明确准入标准。

分层的另一半价值是可独立测试与可替换：BDA 换版本、KB 换 embedding、agent 换 harness 互不影响。Step Functions 负责编排并用 task token 等待异步 BDA 作业，DynamoDB 记录元数据——元数据即每层的可观测锚点，也是重放与分级回归的入口（编排取舍见 [Agent Orchestration Patterns](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-orchestration-patterns.md)）。

### 规模与成本包络

单次调用支持最多 3000 页 / 500MB，服务内部按每段不超过 20 页切分。生成式抽取单价高于模板 OCR，但省掉的是自建分类器、版面模型与人工兜底的总账，只有文档类型多样、版面漂移严重时才划算。三条降本路径：intelligent routing（简单纯文本走基础抽取）、batch（限额内把多文档合并进单次请求）、S3 生命周期迁移。page count 检查不是用来决定「要不要处理」，而是为异步作业设 timeout 与超大文档告警。规模上更有信息量的是 50,000 份 PDF 并发实测无性能退化——瓶颈不在抽取模型而在编排层，「异步作业 + task token + 幂等」的组合决定系统上限。

### Confidence 门控与 field-level 评测

confidence score 与 visual grounding 的正确用法是当门控而非当报表：低置信字段进人工队列，高置信直通下游；bounding box 让复核从「重读全文」变成「看一个框」，这是 HITL 成本能否收敛的关键。评测单位必须是字段而不是文档——per-document accuracy 把「10 个字段错 1 个」算成 90 分甚至记成成功，恰好掩盖了真正的问题域。

回归集要从真实文档构建并持续吸收线上失败样本。真正的隐性风险是 drift：上游改一次文档模板，抽取质量可能无声下滑，只用历史模板构成的回归集完全测不出来。这也是 Optimize Blueprint Extraction Accuracy In Amazon Bedrock Dat 与 [Automate Schema Generation For Intelligent Document Processing](https://github.com/QianJinGuo/wiki-public/blob/main/entities/automate-schema-generation-for-intelligent-document-processing.md) 的交汇点。

## 实践启示

1. **先定 schema，再搭 pipeline**：把「抽哪些字段、什么类型、什么取值域」写成 blueprint 契约，再回推编排与存储；反过来做，后处理代码会退化成不可维护的正则垃圾场。
2. **一个文档类型一个 blueprint，并控制总数**：同类型共用一个靠自动路由分发；project 上限 40 个是硬约束，超出说明该拆 project 而不是继续堆字段。
3. **把校验层夹在 extraction 与 intelligence 之间**：进入 Knowledge Base 前完成类型、取值域与 confidence 校验，避免错误被 embedding 固化并污染全部下游检索。
4. **confidence 用来分流，不是用来展示**：低置信进人工队列、高置信直通，配合 bounding box 把复核成本压到「看一眼框」。
5. **回归集按字段度量，并覆盖模板 drift**：用真实文档（含历史失败样本）建 per-field 评测集，模板变更时强制重跑，否则质量下滑在指标上完全不可见。
6. **先判断值不值得上生成式栈**：默认异步 + 幂等 + 元数据可观测是基本功；固定模板的高频表单、强 on-prem / 数据出境受限、要求严格确定性输出的三类场景应留在模板 OCR 路径上，跨文档语义关联强时再切过来——可参考 [Aws Idp Accelerator](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-idp-accelerator.md) 这类落地样板。

## 原文链接

→ [原文存档](https://aws.amazon.com/blogs/machine-learning/from-pdfs-to-insights-architecting-an-intelligent-document-processing-pipeline-with-aws-generative-ai-services)

---

