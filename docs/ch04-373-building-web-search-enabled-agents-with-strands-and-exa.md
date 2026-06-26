# Building web search-enabled agents with Strands and Exa

## Ch04.373 Building web search-enabled agents with Strands and Exa

> 📊 Level ⭐⭐ | 6.6KB | `entities/building-web-search-enabled-agents-with-strands-and-exa.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/building-web-search-enabled-agents-with-strands-and-exa.md)

## Summary
See [source article](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/building-web-search-enabled-agents-with-strands-and-exa.md) for full content.

## 相关实体
- [用 Strands Agents SDK 构建确定性数据分析：语义层 + VQR 在 Amazon Bedrock 上的实践 | 亚马逊AWS官方博客](../ch11-188-用-strands-agents-sdk-构建确定性数据分析-语义层-vqr-在-amazon-bedrock-上的)
- [基于Bedrock AgentCore+Strands构建企业级智能搜索平台实践 | 亚马逊AWS官方博客](../ch11-139-基于bedrock-agentcore-strands构建企业级智能搜索平台实践-亚马逊aws官方博客)

## 深度分析
1. **工具调用模式从硬编码流程转向模型驱动决策** — Strands Agents 的核心理念是让 LLM 决定何时调用哪些工具，而非预设执行顺序。agent loop 通过积累对话历史（每一步 tool call 及其结果）形成上下文，使得多步骤研究任务可以在单一调用内完成多轮 search→extract→synthesize。这种模式与传统 if-this-then-that 的工作流引擎有本质区别，模型成为 runtime 的调度者而非脚本的奴隶。
2. **Exa 的语义搜索解决了 agent 工作流中的信息消费结构化问题** — 传统搜索 API 返回 HTML 碎片和短摘要，需要额外爬取、解析、去噪才能喂给 LLM。Exa 直接返回 clean structured content，且支持 category 过滤器（news、research paper、github 等），这使得 agent 可以在系统提示层面为不同阶段分配合适的搜索参数，而不是依赖后处理管道。这是 AI-native search engine 与传统搜索引擎在 agent 场景下的核心差异。
3. **6 步研究工作流展示了"同工具异参数"的优雅复用** — 深度研究助手的示例揭示了一个关键设计洞察：不同 source type 需要不同的搜索参数，但不需要不同的工具。exa_search 和 exa_get_contents 在 Overview/News/Research/GitHub/Deep dive/Synthesis 六个阶段被重复调用，每次配置不同的 category、date range、maxCharacters、JSON schema。这种"工具复用 + 参数调优"模式比为每个阶段单独封装 API 要简洁得多，也更符合 agent 自主决策的精神。
4. **AgentCore Observability 将非确定性行为变为可检查.span** — 6 步 pipeline 涉及多次 tool call 和 LLM invocation，非确定性意味着相同 query 可能产生不同的搜索结果和不同的合成输出。Amazon Bedrock AgentCore Observability 基于 OpenTelemetry 将每一步记录为 span，开发者可以 drill-down 查看每步的参数、延迟和 token 消耗，把调试从"盲猜"变成"可检视"。这对生产部署的可靠性至关重要。
5. **Exa+Strands 的集成门槛极低但扩展性极高** — 注册 API key → import exa_search/exa_get_contents → 加到 tools 列表 → 直接调用，3 行代码完成集成。但系统提示可以驱动 agent 在单一 invocation 内完成跨 source type（新闻/论文/代码仓库/全文）的研究，覆盖单次搜索无法覆盖的信息空间。这种从"hello world"到"生产级深度研究"的跨度值得重视。

## 实践启示
1. **先用 `auto` 模式跑通流程，再按需切 `deep`** — 文章建议从 `auto` 开始，大多数 query 效果已经足够好。只有当研究任务中"漏掉相关来源代价很高"时才切换到 `deep`（3-6s，并行查询多个变体）。对于需要几十次连续搜索的 agentic workflow，用 `fast` 或 `instant` 减少累计延迟。
2. **用 category filter 在系统提示层明确指定 source type** — 当 agent 需要新闻时就明确 filter to news category，需要学术内容就 filter to research paper，需要代码实现就 filter to github。这比让 agent 自己判断"我需要什么类型的来源"更可靠，也减少 token 浪费在无关结果上。
3. **summary 参数配合 JSON schema 实现结构化提取** — exa_search 的 summary.query 支持传入 schema，强制结果以特定字段结构化返回（如研究论文的 main_findings、methodology、conclusions）。对于需要将多篇文档的核心信息汇总是比逐篇读取全文然后再让 LLM 总结要高效得多。
4. **deep dive 阶段强制 live crawling 并开启 subpage 爬取** — 与其在 cached 结果上省事，不如在最后 2-3 个关键 URL 上用 `livecrawl="always"` 拉最新内容，同时设置 subpages=3 并用 subpage_target 指向 references/citations/bibliography 等子页面。这一步的代价最高，但产出的信息密度也最高。
5. **将 tracing 纳入开发流程而非生产调试专属** — AgentCore Observability 的 span 数据不只用于 production debugging，dev 阶段就应该打开查看 agent 是否按预期调用工具（是否用了正确的 category/date range/maxCharacters）。早期发现参数配置错误比等到生产事故才定位问题要高效得多。

## 关联实体
-
-

- [Agentic Scheduler with Strands AgentCore for Multi-Region GPU Inference](../ch04-167-基于strands和agentcore-实现agentic-scheduler-在多region自动编排推理gpu算力)
- [Product Ad Review Agent with Strands SDK and Bedrock](../ch11-078-基于-strands-agents-sdk-和-amazon-bedrock-agentcore-的商品广告图审查-ag)
- [基于 Strands SDK 的企业级智能数据查询解决方案实践](../ch11-158-基于strands-sdk-构建的企业智能问数解决方案实践-亚马逊aws官方博客)
- [AI Agent Memory Systems](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-agent-memory-systems.md)

---

