# Miro + Amazon Bedrock 路由 Bug 排查

## Ch11.163 Miro + Amazon Bedrock 路由 Bug 排查

> 📊 Level ⭐⭐ | 7.1KB | `entities/miro-amazon-bedrock-bug-routing.md`

[Miro Amazon Bedrock Bug Routing](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/miro-amazon-bedrock-bug-routing.md)

# How Miro uses Amazon Bedrock to boost software bug routing accuracy and improve time-to-resolution from days to hours
_This post is co-authored with Philipp Pavlov, Dmytro Romantsov, Evgeny Mironenko, and Gowri Suryanarayana from_[ _Miro_](<https://miro.com/de/index/>).
[Miro](<https://miro.com/de/index/>) is an AI-powered innovation workspace that serves over 95 million users globally, helping teams transform unstructured ideas into organized workflows. To support this scale and continue enhancing their system, Miro’s developer experience team decided to create an innovation workspace for Miro itself, using modern technologies to boost developer productivity. One of the key challenges faced by the team is efficiently routing software bugs to the responsible teams. Quick and accurate bug routing removes unnecessary context-switching, reduces developer frustration, improves time-to-resolution, and ultimately leads to a better product and happier customers. At Miro, a significant percentage of bugs miss internal resolution SLAs primarily due to misrouting and repeated reassignments between teams. This issue results in an estimated 42 years of cumulative lost productivity annually from delays and redundant investigation efforts. To tackle this problem, Miro partnered with the AWS Prototyping and Cloud Engineering (PACE) team to develop BugManager, an AI-powered solution for automated bug triaging.

## 深度分析
1. **Prompt-based 路由在动态组织中是微调模型的超替** — 文章明确指出，传统 fine-tuned BERT/GPT 模型在团队重组、产品迭代时必须重新训练，而 Miro 经验证明，基于优化提示词 + RAG 的方案可以将「组织结构变更」转化为「更新团队描述文档」这一简单操作，无需任何模型重训练。这对国内大型企业 IT 架构有直接参考价值：业务部门频繁调整时，训练数据的生命周期远短于模型本身。
2. **多模态理解（Amazon Nova Pro）→ RAG 上下文补充 → LLM 分类的三段式 Pipeline 是处理「脏数据」的标准范式** — Bug 报告中的截图、视频若无语境会被 LLM 误读；Miro 的解法是先用 RAG 检索产品上下文（feature 所属团队），再将上下文注入 Nova Pro 的提示词，最后才让 LLM 做分类。这种「先检索后理解」的模式使附件解析特异性大幅提升。
3. **Top-3 95% 准确率 + human-in-the-loop 是生产级分类系统的工程现实** — 100 团队的多分类场景下，Top-1 75% 已显著优于 fine-tuned GPT，但无法满足 SLA 要求；Top-3 95% 意味着只要呈现前三个选项供人确认，整体准确率接近完美。这揭示了一个重要工程原则：**在分类精度不足时，交互设计比模型调优更有效**。
4. **Anthropic 扩展思考（Extended Thinking）带来 7-9% 边际提升** — 文章披露 Claude Sonnet 4 启用扩展思考后额外提升 7-9% 准确率，成本是延迟增加（在 53 秒平均延迟内可接受）。这一数据点与业界普遍感知的「扩展思考换精度」经验吻合，可作为生产部署的性能预算参考。
5. **透明路由理由是用户接受度的关键驱动力** — 对比实验显示，仅返回单一预测结果的 fine-tuned 模型用户信任度远低于提供每条路由 Rationale 的方案。这也与 [Claude Code Governance Soft Rules](ch03/073-claude-code.md) 中强调的「可解释性建立信任」原则一致，也呼应了 [Wangyunhe Harness Optimization Agentsoul](ch04/503-agent.md) 中 human-in-the-loop 反馈的校准价值。
6. **团队描述作为版本化管理对象，赋予了 LLM 系统真正的动态适应性** — BugManager 将团队描述维护在 GitHub-backed Backstage 中，每次团队合并/新建只需更新 Markdown 文档，Prompt 无需改动。这种「知识与推理解耦」的设计是 RAG 架构的核心优势

## 实践启示
1. **当分类标签集频繁变动时，优先选 Prompt-based RAG 而非微调模型** — 如果你的场景涉及 10+ 分类标签且每月都有新增/合并，先做一套版本化的标签描述文档，配合 Bedrock Knowledge Bases 做 RAG 检索，测试 3 个月的准确率和维护成本，再决定是否上微调。BugManager 的 70% 精度提升数据（vs fine-tuned GPT）和零重训练代价是可量化的对比基准。
2. **多模态内容（截图/视频）必须先做 RAG 语境补充再送 LLM 解析** — 不要直接让视觉模型识别产品 bug 截图，正确的 Pipeline 是：文字 bug 描述 → RAG 检索相关产品文档 → 将文档上下文注入视觉模型的 Prompt → 视觉模型输出描述。Miro 经验证明直接解析的特异性极差。
3. **Top-N 候选展示配合人工确认是生产部署的标准交互模式** — 不要追求 Top-1 的极限精度，而是将 Top-3（或 Top-5）候选连同 Rationale 一起展示给用户。参考 Miro 的 Slack 交互：默认选第一，但用户可以修改。这种设计将分类系统从「自动化决策」转变为「智能推荐」，规避了 100% 自动化的责任风险。
4. **路由 Rationale 必须结构化输出（XML/JSON）以便解析** — Miro 的 Prompt 要求 LLM 使用 `<team>`、`<confidence>`、`<rationale>` 等 XML 标签封装输出，这是因为 Slack → Jira 的自动化流程需要程序化提取路由结果。输出格式的稳定性比模型选择更重要，是整个系统的可维护性基石。
5. **用 OpenSearch Serverless 作为知识库向量存储，配合增量同步策略** — Miro 选择 OpenSearch Serverless 而非自建向量数据库，核心考量是「增量 re-sync」能力：只有变更的文档才重新嵌入，避免全量重建的高成本。如果你要构建类似系统，优先考察向量存储的增量更新机制，而非单纯对比向量相似度指标。
6. **在评估扩展思考成本时，以 53 秒作为参考基准** — Miro 的平均端到端分类延迟为 53 秒，这包含了多步 RAG 检索 + Nova Pro 图像理解 + Claude Sonnet 4 扩展思考。如果你的 SLA 要求在 30 秒以内，需要在 Prompt 复杂度、上下文窗口大小、扩展思考 token 预算之间做取舍。

## 关联阅读

---

