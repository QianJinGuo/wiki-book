# Google adds llms.txt check to Chrome Lighthouse

## Ch01.786 Google adds llms.txt check to Chrome Lighthouse

> 📊 Level ⭐⭐ | 5.3KB | `entities/searchengineland-com-google-adds-llms-txt-check-to-chrome-lighthouse.md`

## 核心要点

- searchengineland.com 技术文章
- 来源：https://searchengineland.com/google-llms-txt-chrome-lighthouse-478246

## 相关实体
- [Thehackernews Com Github Breached Employee Device Hack Led To Exfilt](ch01/751-github.md)
- [Blog Himanshuanand Com Score By Collisions Patch By Panic](../ch04/505-score-by-collisions-patch-by-panic.md)
- [Www Networkworld Com Versa Takes Aim At Fragmented Enterprise Security](ch01/1033-rag.md)
- [Npm Supply Chain Compromise Postmortem](../ch04/070-ai.md)
- [Cloudflare Glasswing Mythos Security](https://github.com/QianJinGuo/wiki/blob/main/entities/cloudflare-glasswing-mythos-security.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/searchengineland-com-google-adds-llms-txt-check-to-chrome-lighthouse.md)

- [从 pi-main 源码拆解：顶尖 ai agent 的工程设计（17 维度全解）](../ch03/045-agent.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/security-landscape.md)
## 深度分析

Chrome Lighthouse 新增的「Agentic Browsing」审核类别，标志着 Google 对 AI 代理可见性基础设施的认知发生了根本性转变。与传统的 SEO 排名信号不同，llms.txt 被明确定位为「AI 代理的可发现性与效率信号」，而非爬取指令。这一区分至关重要：Google 搜索不需要 llms.txt，但 Chrome 的代理浏览能力检查正在强制执行这一标准。

Lighthouse 的 Agentic Browsing 审核暴露了一个长期被 SEO 行业忽视的现实：AI 代理并不遵循传统爬虫的抓取逻辑。当 Google 文档明确指出「没有 llms.txt，代理可能花费更多时间爬取网站以理解其高层结构和主要内容的」，这揭示了当前 Web 内容结构与机器阅读需求之间的根本错配。这种错配在 Addy Osmani 提出的「Agentic Engine Optimization」概念中得到了系统阐述：AI 代理的上下文窗口有限，可能截断长页面或遗漏深层内容。

John Mueller 的澄清进一步揭示了 Google 内部对 llms.txt 用途的微妙立场差异。他在 Bluesky 上的回复表明，Google 对 llms.txt 的使用本质上是为了提升 AI 编码助手的参考文档可读性，而非服务于搜索排名——这与 Google Search 官方「不需要 llms.txt」的立场在逻辑上一致，但与 Chrome Lighthouse 的代理就绪检查形成了表层张力。

Lighthouse 审核同时强调了可访问性树作为 AI 代理「主要数据模型」的角色，这是一个技术层面值得关注的重要信号。传统的 DOM 结构对代理的意义远小于对搜索引擎爬虫的意义——代理依赖的是可访问性 API 提供的语义化界面结构，而非渲染后的视觉布局。这意味着 Web 开发者在为 AI 代理优化时，应优先关注 ARIA 标签、语义化 HTML 和键盘导航结构，而非传统的视觉 SEO 要素。

从更宏观的视角看，Google 同时发布「Search 不需要 llms.txt」和「Chrome 检查 llms.txt」的政策组合，反映了平台对 AI 代理经济到来的不同层面的准备节奏。搜索生态系统仍以传统爬虫为基础，但 Chrome/开发者工具生态已在为 AI 原生交互进行架构调整。这种双轨策略意味着网站所有者需要同时维护两套兼容性：一套面向人类搜索用户，另一套面向 AI 代理就绪检查。

## 实践启示

- **立即行动：为重要域名根目录添加 llms.txt 文件**。Lighthouse 的 Agentic Browsing 审核检查文件是否存在于域名根路径，内容应包含站点高层结构、主要页面和 API 端点的机器可读摘要。这是最低成本的代理就绪信号。 

- **可访问性优先于视觉 SEO**：确保所有交互元素具有程序化标签（programmatic labels）、有效的可访问性树结构，并将动态内容对辅助技术保持可见。CLS（布局稳定性）同时影响传统 Lighthouse 分数和代理浏览审核，是必须持续监控的指标。 

- **避免过度依赖 llms.txt 作为 SEO 信号**。如 John Mueller 所言，llms.txt 对于非开发者文档类站点的实际转化价值有限，且当前代理流量在大多数网站日志中占比极低。在投入资源前，评估自身站点的代理流量实际规模。 

- **关注 AGENTS.md 和 capability signaling 文件**。Lighthouse 审核还检查 AGENTS.md 等能力声明文件的存在，这类文件可向 AI 代理声明站点的功能边界、认证要求和可用工具集。建议在站点根目录放置此类文件作为 llms.txt 的补充。 

- **采用 Osmani 的 Token 效率原则进行内容重构**。对于高频被 AI 代理访问的页面，使用 Markdown 交付、清洁语义结构、Token 高效内容排列，并确保关键信息不深埋在嵌套层级中。

---

