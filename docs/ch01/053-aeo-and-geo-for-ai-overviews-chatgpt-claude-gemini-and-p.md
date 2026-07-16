# AEO and GEO for AI Overviews, ChatGPT, Claude, Gemini, and Perplexity

## Ch01.053 AEO and GEO for AI Overviews, ChatGPT, Claude, Gemini, and Perplexity

> 📊 Level ⭐ | 7.7KB | `entities/aeo-and-geo-for-ai-overviews-chatgpt-claude-gemini-and-perplexity.md`

## 核心要点
- AEO（Answer Engine Optimization）和 GEO（Generative Engine Optimization）本质上是 SEO 的延伸，而非独立学科 
- 内容能否被引用取决于模型是否能从训练数据中合成——独特的第一手数据、具体的案例、真实的测试结果是关键 
- 技术层面的可访问性（渲染、爬取、snippet 配置）是一切优化工作的前提 
- AI surfaces 的爬取生态与传统的 SEO bot 完全不同，需要分别管理索引爬虫和训练爬虫 
## 相关实体
- [Gemini 35 Flash More Expensive But Google Plan To Use It For Everything](https://github.com/QianJinGuo/wiki/blob/main/entities/gemini-35-flash-more-expensive-but-google-plan-to-use-it-for-everything.md)
- [Tether Launches Developer Grants Program For Local First Ai ](../ch11/201-tether-launches-developer-grants-program-for-local-first-ai.html)
- [Anthropic_Cache_Tokenomics](ch01/1292-anthropic.html)
- [Introducing Claude For Small Business](ch01/028-introducing-claude-for-small-business.html)
- [Wetesteddeepseekv4Proandflashagainstclau](ch01/1021-deepseek.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aeo-and-geo-for-ai-overviews-chatgpt-claude-gemini-and-perplexity.md)

## 深度分析
### AEO vs GEO：概念溯源与实际差异
AEO（Answer Engine Optimization）和 GEO（Generative Engine Optimization）两个术语在 2024-2025 年间伴随 AI Overview 和 ChatGPT Search 等产品兴起而被广泛讨论。两者描述的对象略有不同：AEO 更侧重于"答案引擎"（如 Perplexity、Google AI Overview）直接返回答案的场景；GEO 更侧重于生成式模型从多个来源综合回答的场景。但在实际操作中，两者指向同一套优化逻辑：如何让网页成为模型在生成回答时引用的来源 。
Google 官方的 AI optimization guide 对此的定性值得注意：Google 明确将 generative AI search 优化视为 regular SEO 的变体，认为改善 AI Overview 表现和改善传统搜索排名用的是同一套质量信号 。这与市面上部分"AI SEO 独立论"形成鲜明对比。

### 多表面爬取生态：被忽视的基础设施
文章构建了一张清晰的爬取生态图，对每个 AI surface 背后的索引来源做了明确区分 。这揭示了一个重要事实：大多数 AI surface 的索引都下游自 Google 和 Bing 的 crawl，真正的差异化在于哪个 bot 能抓到你的内容。GPTBot（OpenAI 训练爬虫）和 Googlebot（Google 索引爬虫）是两个完全不同的 bot，阻止前者不会影响后者，这是一个常见误解。
值得特别关注的是 `Google-Extended` 这个 token：它控制的内容比大多数运营者以为的更广——它同时影响 Gemini Apps 和 Vertex AI Grounding，但不影像 Google Search 排名或 AI Overview 资格 。如果你的业务依赖 Gemini 桌面端或 Vertex AI 对你内容的调用，需要允许 `Google-Extended`，而非仅仅允许 `Googlebot`。

### 内容被引用的核心逻辑：不可合成性
这是文章最核心的观点，也是大多数 AEO/GEO 操作最容易忽视的部分 。模型能够从训练数据中合成的信息，不需要引用任何来源。因此，能被引用的页面必须提供模型无法自主生成的内容。
文章用了一个极具说明性的对比示例 ：

- Commodity version：描述 Next.js 16 async params 的通用信息
- Distinctive version：包含具体数字（47 pages broken）、具体 bug（function signature 需要标记 async）、具体时间（3 hours）的第一手经验
第一个版本，模型可以从训练数据中合成；第二个版本，模型必须引用。这个逻辑对内容策略有深远影响：表面的"结构优化"（问句式标题、分段 chunk）远不如内容本身的具体性重要 。

### Agentic 体验：被低估的下一个表面
文章用了相当篇幅讨论 autonomous agents（Claude computer use、ChatGPT Operator、Perplexity Assistant）对网页的影响 。核心论点是：未来的 AI 助手会在用户授权下直接操作网页，因此"agent-friendly"的结构将变得重要。
这一趋势目前仍处于早期，但对于涉及复杂交互（预约、填写表单、多步骤操作）的网站，提前考虑 aria-label、语义化按钮结构、表单语义等，可以建立竞争优势 。

### 衡量框架：可操作的部分
文章提供了一个务实的测量框架 ：

- Search Console 仍然是 Google-side 数据的唯一权威来源，AI Overview 流量已整合进标准 Web performance 报告
- 对含 conversational starters（how/what/why/is/can）的查询进行 impressions vs clicks 的分析，是一种推断性信号，不是结论
- 直接测试：在各个 surface 上提问，看你的域名是否出现在引用来源中
文章明确指出：市面上尚无可靠的"AI Overview rank tracker"，因为没有公开的方法论 。

## 实践启示
### 立即可执行
1. **检查 robots.txt 和 Rendered HTML**：用 Google Search Console URL Inspection 检查页面在渲染后的 HTML 中是否仍有内容。JavaScript-heavy SPA 可能需要 server-side rendering 才能被索引 。
2. **验证 snippet 可用性**：确保没有 `nosnippet` 或 `max-snippet:0` 的 meta robots 配置，这些会直接导致页面无法出现在 AI Overview 中 。
3. **分离索引爬虫和训练爬虫的权限**：在 robots.txt 中允许 Googlebot/Bingbot/OAI-SearchBot/Claude-SearchBot/PerplexityBot 等索引爬虫，同时阻止 GPTBot/ClaudeBot 等训练爬虫 。
4. **核心 Web Vitals 达标**：LCP ≤ 2.5s、INP ≤ 200ms、CLS ≤ 0.1 是基本门槛，且要关注 CrUX 真实用户数据而非 Lighthouse 本地测试 。

### 内容策略层面
5. **注入不可合成的具体性**：在每篇内容中加入只有你能提供的数据点——具体数字、真实案例、实测结果、具体错误信息。 Commodity content 永远竞争不过训练数据 。
6. **结构化数据按需添加**：仅在能触发具体 rich result 时添加 schema（Recipe/Product/FAQ/Article），而非为了 SEO 堆砌。Google 的 AI Overview 不依赖 schema，但 schema 可能通过影响理解层间接帮助 。
7. **图片 alt 文本需要描述性**：AI Overview 会直接 pull 图片，alt 文本描述图片所传达的具体信息（"Next.js 16 vs 15 build time: 4.2s vs 6.8s"）远优于空洞的"chart"或留空 。

### 长期布局
8. **业务信息优先进入官方管道**：Google Business Profile 和 Merchant Center feed 是本地商家和电商在 AI Overview 中的主要信息来源，优先于任何 schema 优化 。
9. **考虑 agentic accessibility**：如果你的网站涉及复杂交互，提前采用语义化 HTML、aria-label、真实 button 而非 div 模拟，可为未来 autonomous agent 场景建立护城河 。
10. **跨表面直接测试**：每月在 ChatGPT (Search mode)、Claude (web search)、Perplexity、Gemini/Google AI Overview 上对核心主题提问，记录你的域名被引用的情况，作为 cite-event 追踪的基础 。

---

