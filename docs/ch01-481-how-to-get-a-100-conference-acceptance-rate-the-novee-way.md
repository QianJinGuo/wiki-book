# How to Get a 100% Conference Acceptance Rate, The Novee Way: A High-Severity CVE in Leading Call-for-Papers Software

## Ch01.481 How to Get a 100% Conference Acceptance Rate, The Novee Way: A High-Severity CVE in Leading Call-for-Papers Software

> 📊 Level ⭐⭐ | 7.3KB | `entities/novee-security-how-to-get-a-100-conference-acceptance-rate-the-no.md`

# How to Get a 100% Conference Acceptance Rate, The Novee Way: A High-Severity CVE in Leading Call-for-Papers Software

## 深度分析

URL Source: https://novee.security/blog/pretalx-stored-xss-vulnerability-account-takeover/

Published Time: 2026-05-27T12:06:20+00:00

Markdown Content:
_A walkthrough of how Novee finds the type of chained exploit that SAST and DAST miss, and how to speed-run your next CFP cycle (kidding). A massive thank-you to the pretalx team and creator Tobias Kunze for their extraordinarily rapid and cooperative disclosure._

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
- [Tomtunguz Com Software After Ai](../ch01-579-software-after-ai)
- [How Aws Smgs Uses An Ai Powered Conversational Assistant To ](../ch01-521-business-intelligence-at-scale-key-obstacles)
- [滴滴国际化客服质检智能化之路基于 Amazon Bedrock 的多语种多业务线质检实践](../ch01-236-亚马逊aws官方博客-https-aws-amazon-com-cn-blogs-china)
- [Automate Aml Alert Triage With Amazon Quick And Snowflake Co](../ch01-532-solution-overview)
- [对抗 Agent 遗忘Kollab 基于Amazon Bedrock Agentcore 的团队Ai工作空间实践](../ch01-295-一-关于-kollab)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/novee-security-how-to-get-a-100-conference-acceptance-rate-the-no.md)

## 相关主题

---

