## Ch02.028 AI 导购在 vivo 官网的落地实践

> 📊 Level ⭐⭐ | 5.1KB | `entities/vivo-ai-sales-guide-ecommerce-agent.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/vivo-ai-sales-guide-ecommerce-agent.md)

# vivo AI 导购落地实践

## 一句话

vivo 团队在官网 APP 落地 AI 导购 agent：FastText 小模型做意图分类（10ms）+ RAG 知识库 + 双智能体（参数解读/商品推荐）+ 结构化输出，首字符 2.5s 内。

## 架构亮点

- **FastText 意图分类**：CPU 推理 10ms，解决率高
- **推荐思路**：将手机列表随 Prompt 给大模型，而非人工打标签规则——兼容开放性用户问题
- **结构化输出关键设计**：推荐场景要求模型第一句直接给出手机名 → 才能立刻请求商品接口
- **安全兜底**：内容审核接入蓝心运营平台

## 效果

- 首字符响应速度 2.5s 内
- AB 实验对 GMV 和解决率正向贡献

## 一句话

FastText + RAG + 结构化输出 = 垂直电商 AI 导购 agent 的生产级工程实现。

## 深度分析

vivo AI 导购项目的核心工程价值在于**小模型 + 大模型协同**的分层架构设计。FastText 作为轻量级意图分类器（10ms CPU 推理）解决了电商场景中用户Query的快速分发问题，相比直接让大模型判断意图，大幅降低了推理延迟和成本。

**意图分类器的选型思考**：FastText 的优势在于速度快、资源占用低，适合对延迟敏感的电商场景。但其局限在于仅能做两分类（参数解读/商品推荐），无法处理更复杂的意图。这暗示在实际系统中，意图分类只需做到"足够好"即可驱动下游路由，真正的理解仍交给大模型。

**商品推荐策略的创新点**：传统电商推荐依赖人工规则或标签体系，而 vivo 选择将手机列表直接作为 Prompt 上下文输入给大模型。这一设计利用了大模型的理解和推理能力，使其能够根据用户问题动态匹配商品，而非依赖预设的标签关联。这种"模型自己找答案"的思路在开放性用户问题上有明显优势。

**结构化输出的工程链路**：推荐场景要求模型第一句话直接输出手机名称，这是关键的前置约束——只有拿到商品名才能调用商品接口获取价格、图片等信息。这体现了 AI 应用开发中的"接口驱动设计"思维：先确定需要调用的外部接口，再以此约束模型的输出格式。

**安全架构的三层防护**：模型控制层 + 边界关键字转人工 + 蓝心运营平台内容审核，形成纵深防御。1.6W 条安全测试语料说明安全投入的规模，这对生产系统非常重要。

## 实践启示

1. **分层架构优先**：用小模型处理简单任务（意图分类、路由），大模型专注生成。可显著降低延迟和成本。
2. **接口驱动Prompt设计**：先明确需要调用的外部接口，再反向设计Prompt约束，确保模型输出能被系统解析和使用。
3. **结构化输出的价值**：流式输出 + 商品卡片 + 相关帖子组合，既满足即时性需求，又提供完整信息。
4. **安全投入不可忽视**：1.6W 条测试语料 + 三层防护是生产级别的安全基线。
5. **AB 实验验证价值**：GMV 和解决率的双重正向贡献是 AI 导购项目成功的核心指标。

## 关联阅读

## 相关实体
- [Harness Engineering耗时一周我是如何将应用的Ai Coding率提升至90的](ch03-049-harness-engineering-详解-如何将-ai-coding-率提升至-90.html)
- [Wangyunhe Harness Optimization Agentsoul](ch05-037-harness-agi.html)
- [Claude Code开发负责人 为何放弃Rag而选择Agentic Search](ch04-386-claude-code-开发负责人-为何放弃-rag-而选择-agentic-search.html)
- [Integrate Atlassian Confluence Cloud With Amazon Quick](ch11-039-integrate-atlassian-confluence-cloud-with-amazon-quick.html)
- [Rag Vs Llm Wiki Enterprise Knowledge Base](ch01-039-rag-vs-llm-wiki.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/vivo-ai-sales-guide-ecommerce-agent.md)
- [电商 ai 操作系统崛起：从「工具人」到「all in one」+ 行业 knowhow skill 化 + 5 巨头](ch07-028-电商-ai-操作系统崛起-从-工具人-到-all-in-one-行业-knowhow-skill-化-5-巨头.html)

---
