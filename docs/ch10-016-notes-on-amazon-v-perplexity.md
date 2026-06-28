## Ch10.016 Notes on Amazon v. Perplexity

> 📊 Level ⭐⭐ | 7.1KB | `entities/amazon-perplexity-legal-analysis.md`

# Notes on Amazon v. Perplexity

> **来源**: [https://educatedguesswork.org/posts/notes-amazon-perplexity/](https://educatedguesswork.org/posts/notes-amazon-perplexity/)

## 摘要

Amazon 起诉 Perplexity 的 Comet AI 浏览器案是 agentic browsing 领域最具标志性的法律冲突之一。本案涉及三大核心问题：Comet 的安全隐患（特别是 prompt injection 攻击向量）、AI 代理对电商用户体验的颠覆、以及 User-Agent 欺骗的合法性。更深层次上，本案折射出 Web 站点控制权与用户代理权之间的根本张力——这一张力自 Web 诞生以来就存在，而 AI 代理将其推向了临界点。

## 核心要点

### Agentic Browser 架构

Agentic browser 在传统浏览器基础上增加了 agent harness 层（参见 [Harness Engineering](ch05-041-harness-engineering.html)），通过 tool calling 接口与浏览器引擎连接。用户通过 chat 界面发出指令，harness 将指令发送到远程模型进行推理，模型返回 tool call 指令由浏览器执行。关键的安全边界在于 agent 是否与用户共享 browsing context（密码、cookies、IndexedDB 数据）——如果共享，agent 就等同于用户本人，具备完整的代操作能力。

### Amazon 的三大指控

1. **安全隐患**：Comet 存在网络犯罪分子可利用的漏洞，可能危及 Amazon 客户的个人数据（段落 6）
2. **体验降级**：Comet 破坏了 Amazon 花费数十年打造的个性化购物体验（段落 7）
3. **伪装身份**：Comet 将自己的 User-Agent 伪装为 Google Chrome，而非诚实标识自身（段落 5）

### Prompt Injection 攻击向量

Prompt injection 是本案最核心的技术风险。在 agentic browsing 场景中，攻击面显著扩大：

- **恶意网站攻击**：酒店预订网站可在页面中注入指令，诱导 agent 选择更贵的房间。通过视觉 prompt injection（如在图片中嵌入不可见指令），攻击可以更加隐蔽
- **第三方内容攻击**：在 Expedia、Airbnb 等平台上，恶意房东可在房源图片中注入 prompt，操纵 agent 优先推荐其房源
- **跨站攻击**：Brave 已演示了从 Reddit 页面的 prompt injection 出发，最终接管用户 Perplexity 账户并从 Gmail 窃取邮件的攻击链。最坏情况等同于 universal XSS

当前对 prompt injection 的防御研究（如 Google 的 CaMeL 方案）尚不成熟，缺乏可靠的通用解决方案。

### User-Agent 欺骗的上下文

Comet 使用 Chrome 的 UA 字符串并非孤例——Vivaldi、Brave 等 Chromium 系浏览器都有类似做法。根本原因是 Web 站点普遍使用 UA sniffing 来歧视非主流浏览器，而 MDN 明确反对这种做法。UA 字符串本身就是一段"考古记录"：Chrome 的 UA 同时声称自己是 Mozilla、Safari 和 Chrome。Amazon 将此定性为"伪装人类用户"，但从技术历史看这更多是 Web 兼容性博弈的延续。

## 深度分析

### 谁在"访问" Amazon？——CFAA 责任归属

Amazon 指控 Perplexity 违反了《计算机欺诈与滥用法》(CFAA) 第 1030(a)(2) 和 1030(a)(4) 条。第九巡回法院的口头辩论中，核心争议在于：是 Perplexity 还是用户在"访问" Amazon 的计算机？

Amazon 的论证逻辑：如果切断 Perplexity 服务器连接，agent 立即停止工作——因此不是用户独自主导的访问。但从技术角度，这只是实现层面的选择：Perplexity 本可以在本地运行（较弱的）模型，此时 agent 仍可在无远程连接下工作。推理发生在何处（本地 vs 远程）在法律上可能是重要区分，但在技术上并不决定"谁负责"。

### 用户代理权 vs 站点控制权

本案更深层的张力在于 Web 的基本哲学分歧：

- **站点立场**：浏览器应忠实渲染站点提供的内容，包括广告、推荐算法等
- **用户立场**：浏览器是用户的"代理"（user agent），应服务于用户利益——拦截广告、翻译内容、自定义体验

W3C 的 "Priority of Constituencies" 原则明确将用户需求置于首位，IAB 的 RFC 8890 也声明"互联网为最终用户服务"。Mozilla Web Vision 更进一步：Web 的独特价值在于用户可以解读和重新组合语义化信息，而不仅仅是消费不透明的音视频流。

Agentic browsing 正是这种用户代理权的最新表达——它让用户无需站点配合（发布 API）即可获得定制化体验。Amazon 的 API 明确禁止"模拟 Amazon 购物应用功能"的第三方应用，这与开放 Web 的精神形成了直接冲突。

### 判决的溢出效应

本案判决的影响远超 agentic browsing。如果法院支持 Amazon 的逻辑，站点可以通过 Terms of Service 限制任何客户端软件的行为——包括广告拦截器（如 Brave 内置的 ad blocker）、屏幕阅读器、甚至自定义 CSS。Axel Springer 已在德国以版权为由起诉 Eyeo（AdBlock Plus 开发者）。这实质上是在争夺"谁有权控制用户端的渲染"这一根本问题。

## 实践启示

- **对 AI 浏览器开发者**：必须在 agent 隔离（不共享 browsing context）和功能完整性（需要用户身份执行交易）之间做出明确的架构权衡；prompt injection 防御应作为核心安全需求而非事后补丁
- **对 Web 站点运营者**：过度依赖 UA sniffing 和 ToS 限制可能适得其反，应考虑通过 API 提供受控的第三方接入路径
- **对法律从业者**：CFAA 的"授权访问"概念在 AI 代理场景下需要重新审视——传统"谁发起连接"的框架已不足以判断责任归属
- **对开源社区**：参见 [ATH Agent Trust Handshake Protocol](ch04-500-lighthouse-agentic-browsing-scoring-chrome-devtools-ai-a.html) 中关于 agent 身份验证的探索，这可能是解决信任问题的技术路径

## 相关实体

- [ATH Agent Trust Handshake Protocol](ch04-500-lighthouse-agentic-browsing-scoring-chrome-devtools-ai-a.html) — Agent 身份与信任握手协议
- [Prompt Injection — Prompt injection 攻击原理与防御](ch01-511-这样的程序员-应该招吗.html)
- [Harness Engineering](ch05-041-harness-engineering.html) — Agent harness 工程框架
- [Agentic Overlays: REST to A2A](ch04-503-agentic-overlays-retrofit-legacy-rest-services-into-a2a-a.html) — 企业 agentic 架构转型

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/amazon-perplexity-legal-analysis.md)

---
