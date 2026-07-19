# Amazon Quick Research: Agentic Multi-Source Research Workflow with Citation Provenance and Versioned Revisions

## Ch04.194 Amazon Quick Research: Agentic Multi-Source Research Workflow with Citation Provenance and Versioned Revisions

> 📊 Level ⭐⭐ | 11.7KB | `entities/amazon-quick-research-agentic-multi-source-citation.md`

# Amazon Quick Research: Agentic Multi-Source Research Workflow with Citation Provenance and Versioned Revisions

> 本文综合提炼自 AWS 的 **Amazon Quick Research** 在 rare cancer research（罕见癌症研究）的应用案例。核心是 agentic research workflow：**自然语言目标 → 拆解子主题 → 多源数据采集（web/PubMed/ClinicalTrials.gov/file uploads/Spaces）→ LLM 合成 → 带 inline 引用 + 可追溯 evidence chain 的报告 → 版本化修订**。

## 核心问题：科研数据整合瓶颈

罕见癌症研究需要整合**异构数据**：

- 基因组测序管线数据
- 临床试验注册库（ClinicalTrials.gov）
- 生物标志物库
- 同行评审文献（PubMed）

传统做法：

- 自定义 ETL 管道
- 手动 schema 对齐
- 在断连系统间迭代查询
- **通常需要数周才能开始任何分析**

## Amazon Quick Research 核心能力

**6 大能力**：

1. **Research objective parsing** — Agent 解析自然语言研究问题 → 拆解为结构化子主题 → 并行调查
2. **Multi-source data ingestion**：
   - Web search（PubMed / ClinicalTrials.gov / 开放期刊）
   - 文件上传（PDF、Word、Excel、PowerPoint）
   - Amazon Quick assets（Spaces、dashboards、knowledge bases、datasets）
   - 项目创建时源被处理并索引
3. **AI-generated research plan** — 跑前先生成结构化计划：调查主题 + 每主题源 + 分析方法。可审阅修订后再正式跑
4. **Cited report generation** — 输出结构化报告带 **inline 引用追溯源**。每条陈述有 provenance 链接，"Understand the statement" 功能暴露单条结论的 evidence chain
5. **Versioned revision workflow** — 注解具体陈述（≤400 char 修订评论）→ 提交后启动**新 run scope 到被注解 section** → 版本号递增 → 旧版本保留可对比
6. **Export formats** — PDF / Word；Summary variants（Executive / General / Custom）调整输出长度 + 引用密度

**核心创新点**：把"修订"建模为**局部再研究**（scope 到被注解 section），而非整篇重跑。**版本化** 让研究者可对比迭代。

## Spaces：数据组织层

[Spaces](https://docs.aws.amazon.com/quick/latest/userguide/working-with-spaces.html) 是 Amazon Quick 的**数据容器**：

- 最多 10,000 文件 + Quick dashboards + topics + knowledge bases
- 文件上传即索引 → 立即可作 research run 的 retrieval corpus
- 支持格式：Word、Excel、PowerPoint、PDF、CSV、TXT、RTF、JSON、YAML、XML、HTML

## 端到端 walkthrough（罕见癌症研究案例）

**研究目标示例**：

> "What are the promising targeted therapy approaches for pediatric sarcomas with specific genomic alterations, and how can we identify patients who may benefit from these treatments?"

**5 步流程**：

1. **Create a space** — 添加 cancer genomics datasets + PubMed abstracts 作内部知识 corpus
2. **Create a research project** — Quick Research → New Research
3. **Define the objective** — 输入目标，AI agent 帮优化问题、建议探索角度
4. **Data source selection**：
   - 启用 web search
   - 添加特定 URL：[rarecancer.org/publications](https://rarecancer.org/publications)、[ncbi.nlm.nih.gov](https://www.ncbi.nlm.nih.gov/)、[aacrjournals.org](https://aacrjournals.org/)、[PMC10815984](https://pmc.ncbi.nlm.nih.gov/articles/PMC10815984/)、[cancer.gov/types](https://www.cancer.gov/types)
5. **Review plan → Run → Iterate** — 审阅 AI plan → 运行 → 用 revision 局部修订

## 关键设计模式（可复用）

### 1. **Plan Before Run**

跑前先生成结构化计划（调查主题 + 源 + 方法），**人工审阅**后修改再正式跑。**避免大规模跑错方向**。

### 2. **Inline Citation + Evidence Chain**

每条报告陈述都有**追溯链接**。"Understand the statement" 功能**暴露完整 evidence chain** —— 用户可看到该结论基于哪些源。**解决 LLM 幻觉的核心机制**。

### 3. **Statement-level Revision**

用户可注解**单条陈述**（不是整篇重写）→ 启动**局部再研究**（scope 到 annotated sections）→ 新版本号。**结合"全文 revision" vs "局部 revision"**：

- 局部 revision：cost 低、保留其他正确结论
- 版本号递增：保留完整迭代历史

### 4. **Spaces as Indexed Corpus**

把 Space 作为**预索引的 retrieval corpus** —— 上传即索引，立即可被 research run 检索。比"传完文件再手动 ingest"快。

## 实践启示

**何时采用 Amazon Quick Research pattern**：

- ✅ 跨多个异构数据源的研究任务（biomedical / 政策分析 / 市场研究）
- ✅ 报告需要**强 provenance**（合规、研究、监管场景）
- ✅ 研究是**迭代**的（初版 → 用户修订 → 再版）
- ✅ 用户希望**审阅计划**后才投入计算资源
- ❌ 单一数据源查询 → 不需要 agentic 编排
- ❌ 输出不需要引用追溯 → 可用普通 RAG

**部署建议**：

1. 先建好 Space 预索引内部 corpus
2. **从具体研究目标开始** —— 模糊问题会得到模糊计划
3. 跑前**总是审阅 AI plan**，必要时修订
4. 用 statement-level revision 局部迭代 —— 不要全文重写
5. 注意：Amazon Quick 是付费服务，跑完需清理资源

## 深度分析

### 1. Agentic Workflow 将"研究"从批次处理升级为可演进的知识系统

Amazon Quick Research 的核心设计不是一次性检索，而是将**研究目标建模为可迭代的 agentic 任务**。自然语言目标 → 拆解子主题 → 并行多源采集 → LLM 合成 → 带引用的报告，这一流程本身并不新颖，但其将**版本化修订**作为一等公民的设计值得深思：每次修订不是覆盖，而是保留历史、递增版本。这意味着整个系统是面向**知识积累**而非一次性输出。

### 2. Citation Provenance 是对抗 LLM 幻觉的结构性防线

"Understand the statement" 功能将单条陈述的 evidence chain 暴露给用户，这是从"信任系统输出"转向"验证系统输出"的关键交互设计。传统 RAG 的 citation 通常只指向文档级别，而 Amazon Quick 的 inline citation 做到了**陈述级别** provenance，并辅以证据链解释。这种设计将幻觉检测的负担从模型层下移到用户交互层，大幅提升了输出的可信度。

### 3. "Plan Before Run" 是降低 agentic 系统风险的元认知机制

在正式执行前引入 AI-generated research plan 并允许人工审阅修订，这是**对 agentic 系统不确定性的主动缓解**。传统 agent 系统一旦启动便难以干预，而 Quick Research 在 plan 阶段提供了干预窗口——用户可增删主题、调整范围、确认源，再正式跑。这个设计将"人机回环"前置到风险最低的阶段，而非在 expensive run 之后才介入。

### 4. Statement-level Revision 将迭代成本从 O(N) 降为 O(1)

传统报告修订需要整篇重跑，成本与报告长度成正比。Amazon Quick 的设计将修订 scope 限定在 annotated sections：新版本只 re-research 被注解的部分，保留其他正确结论。这是一种**局部优先的迭代策略**：将全局搜索压缩为局部检索，既降低计算成本，也减少因整篇重写引入的新幻觉风险。

### 5. Spaces 作为 Indexed Corpus 重新定义了"数据准备"的时空效率

文件上传即索引、立即可被 research run 检索——这消除了传统 ETL 管道中"数据接入 → 清洗 → 存储 → 索引"的延迟。在罕见癌症研究场景中，这种即时可用性意义重大：研究者不需要等待数周的数据准备，只需上传文件即可开始研究。但这也意味着 Spaces 本质上是一个**轻量级、欠清洗的向量存储**，对数据质量要求高的场景需要在上传前做预处理。

## 相关链接

- [Amazon Quick Research 官方文档](https://docs.aws.amazon.com/quick/latest/userguide/using-amazon-quick-research.html)
- [Spaces 官方文档](https://docs.aws.amazon.com/quick/latest/userguide/working-with-spaces.html)
- 支持的生物医学源：PubMed、ClinicalTrials.gov、AACR Journals、PMC

## 相关实体
- [Scalable Voice Agent Design With Amazon Nova Sonic Multi Agent Tools And Session](../ch11/283-amazon-nova.html)
- [Aws Bedrock Halliburton Seismic Workflow Genai](../ch11/009-aws-bedrock.html)
- [Building Multi Tenant Agents With Amazon Bedrock Agentcore](ch04/532-amazon-bedrock-agentcore.html)
- [Build An Enterprise Observability Solution For Amazon Quick](../ch11/021-build-an-enterprise-observability-solution-for-amazon-quick.html)
- [Aderant Transforms Cloud Operations With Amazon Quick](../ch11/193-aderant-transforms-cloud-operations-with-amazon-quick.html)

---

