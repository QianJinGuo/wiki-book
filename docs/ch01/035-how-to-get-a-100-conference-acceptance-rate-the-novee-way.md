# How to Get a 100% Conference Acceptance Rate, The Novee Way: A High-Severity CVE in Leading Call-for-Papers Software

> 📊 Level ⭐⭐ | 10.7KB

## 深度分析

### 合成漏洞：扫描器看不见的攻击链

文章的核心判断：漏洞不在任何一个组件里，而在组件的组合里。innerHTML 注入点、CSP 缺 frame-src 指令、不限制类型的附件上传，各自都是工具能报的低危发现。单看都不值得紧急修复，串起来却是完整的 JavaScript 执行加账户接管。作者的结论是：2026 年经 XSS 实现的账户接管，其危害等于 XSS 所在工作流允许攻击者做的一切。stored XSS 出现二十年后仍能酿成高严重度事件，原因即在于此：工具按单点建模，攻击者按链路行动，模型差距就是缺口。

### 纵深防御为何同时失效

pretalx 并非疏于防护：script-src 'self' 的严格 CSP 加上 HTML5 规范对 innerHTML 插入 script 的抑制，两道独立防线本应让注入最多是外观问题。绕过没有击穿任何一道，而是走规范间的缝隙：iframe srcdoc 创建全新解析上下文，其中 script 正常执行，而 CSP 无 frame-src 指令，同源 iframe 默认放行；它经 script src 从同一源加载，CSP 照样通过。同源 JS 来自平台自身：附件上传不限制文件类型，一个 .js 以讲义名义上传后由平台域名直接提供。

### 无需 JavaScript 的破坏原语：状态变更 GET

链中最冷门的一环不依赖脚本执行：img onerror 等内联事件处理器确实被 CSP 拦截，但 img 的 src 本身就会发出一次带认证的 GET 请求。投稿标题里的一个 img 标签在搜索结果渲染瞬间即请求超级用户降级端点，组织者权限被永久撤销，不经数据库无法恢复。零点击、零脚本、零视觉痕迹。这暴露了被忽视的 CSRF 问题：任何接受状态变更 GET 的特权端点，等于把写权限交给所有能往页面塞进一个标签的人。

### 一份代码库 × N 个部署 × 自主代理的攻击经济学

作者起点不是安全研究而是普通投稿：不同会议的表单换个 logo 又出现——大量技术会议的 CFP 跑在同一个 pretalx 代码库上。共享工作流意味着一个缺陷不是单个 bug 而是系统性暴露面，而 LLM 恰好把跨实例操作成本压到接近零：抓取公开部署的 CFP、按各会议主题生成变体摘要、把 payload 埋进标题并填充组织者必搜的通用词。防守思路是多代理确定性验证：一个代理利用、第二个盲测复现、第三个独立验证，按链路而非单点证明可利用性。这与 [Agent Security Attack Defense](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-attack-defense.md) 的攻防同构判断一致：攻击者用代理工厂化生产利用时，防御也须以组合验证替代逐点扫描。

## What you need to know

*   The Novee Security research team disclosed a high-severity stored XSS – leading to **account takeover** – in **pretalx,** the open-source conference management platform used by a long list of technical events to run their CFPs and schedules.
*   Any registered user could plant HTML or JavaScript in the organizer-side search result dropdown, and have it execute in an organizer’s browser when the organizer’s typeahead query matched the record.
*   The moment a program chair typed a query that matched a malicious record, the payload executed in the organizer’s browser with the ability to call authenticated endpoints on the organizer’s behalf – including **the endpoint that accepts a submission and account takeover.**
*   The flaw was assigned **CVSS 8.7 (High)**: network attack vector, low complexity, low privileges required, user interaction required, scope changed, high impact to confidentiality and integrity. The flaw received CVE-2026-41241.
*   Fixed in pretalx v2026.1.0.

## The Setup

As a founding engineer and security researcher at Novee, my job is to think like an attacker – and to train Novee’s AI agents to do the same.

When I discovered this particular exploit, however, I was doing something ordinary: preparing conference submissions. Different events, different review committees, different deadlines, but I noticed the same submission form kept appearing under different logos.

Much of the technical conference world runs its CFPs on **pretalx**, an open-source platform behind everything from hacker camps to academic symposiums. From the outside, each event looks independent. Underneath, it is one codebase serving them all.

That is the kind of pattern an attacker notices. If the workflow is shared, a flaw in it is not one bug – it is a systemic exposure. And if the flaw is the right shape, an autonomous agent can operationalize it across every instance, without direct participation from the attacker.

Submitting to forty CFPs by hand is a project. Submitting to forty CFPs with an agent is a script. And if the underlying software has the right kind of flaw, you do not need to convince forty program committees of anything – you just need to convince one piece of JavaScript.

## Inside the Vulnerability

**Pretalx** is not a carelessly built application. It ships a strict Content Security Policy: script-src ‘self’, no inline scripts allowed. The HTML5 spec adds another layer, <script> tags inserted via innerHTML do not execute. Even if you find an injection point, two independent defenses stand between you and JavaScript execution.

The organizer search bar is that injection point. It renders results via innerHTML, and submission titles flow into the dropdown unsanitized. When an organizer types a query that matches a malicious record, the HTML renders.

On paper, it should not matter. CSP and innerHTML’s script suppression should make this a cosmetic issue at worst. In practice, both layers of defense were bypassed without breaking either one:

**The first defense is innerHTML’s script suppression.** The HTML5 spec says <script> tags inserted via innerHTML do not execute. But <iframe srcdoc> creates a fresh document parsing context, i.e. a new page inside the page. In that context, <script> executes normally. And because pretalx’s CSP has no frame-src directive, same-origin iframes are allowed by default.

**The second defense is CSP**. script-src ‘self’ means only scripts served from the application’s own origin can run. An inline script would be blocked. But the script is not inline — it loads from the same origin via <script src=…>. CSP passes.

The question is, where does a same-origin JavaScript file come from when the attacker has no server access? The answer is the CFP itself. **pretalx** lets speakers attach resources to their submissions, like slides, papers, supplementary materials. There is no file-type restriction. The attacker uploads a .js file as lecture materials, and the platform serves it from its own domain.

The full payload fits in a submission title:

“`

<iframe srcdoc=”<script src=/media/…/payload.js></script>” style=display:none>

“`

An organizer searches. The dropdown renders the title. The iframe loads silently. The script executes with full access to the parent page – the organizer’s authenticated session. From there: session hijack, data exfiltration, self-propagation. Zero clicks after the search query. Zero visual indication.

![Image 1](https://d2ooqtrark7773.cloudfront.net/wp-content/uploads/2026/05/image-1-1024x640.png)

_De

## 相关实体
- [Tomtunguz Com Software After Ai](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tomtunguz-com-software-after-ai.md)
- [How Aws Smgs Uses An Ai Powered Conversational Assistant To ](https://github.com/QianJinGuo/wiki-public/blob/main/entities/how-aws-smgs-uses-an-ai-powered-conversational-assistant-to-.md)
- [滴滴国际化客服质检智能化之路基于 Amazon Bedrock 的多语种多业务线质检实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/滴滴国际化客服质检智能化之路基于-amazon-bedrock-的多语种多业务线质检实践.md)
- [Automate Aml Alert Triage With Amazon Quick And Snowflake Co](https://github.com/QianJinGuo/wiki-public/blob/main/entities/automate-aml-alert-triage-with-amazon-quick-and-snowflake-co.md)
- [对抗 Agent 遗忘Kollab 基于Amazon Bedrock Agentcore 的团队Ai工作空间实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/对抗-agent-遗忘kollab-基于amazon-bedrock-agentcore-的团队ai工作空间实践.md)

→ [原文存档](https://novee.security/blog/pretalx-stored-xss-vulnerability-account-takeover/)

---

