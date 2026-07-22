---
source: newsletter
source_url: https://thehackernews.com/2026/05/the-new-phishing-click-how-oauth.html
tags: [security]
sha256: 0e138c761eb6
fetcher: jina
---

# The New Phishing Click: How OAuth Consent Bypasses MFA


Published Time: Wed, 20 May 2026 13:43:00 GMT

Markdown Content:
[![Image 1](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiLnnvBvl0Gs5pfpUcrlJ_Ni62CyGs5UpoGCmpUAjReyBpExj5FzhuxSwuUcfQiyxDqeeoy6jSAHq4tA2KUnO5CRfbpfd_jN1ndeXgC0MiG0TrAfAyW67eybZeHMY-t6_kICQdPPKqK-1n9Ngkrj7UJrZZa1KQWqN9WjaTaDuHA_t6RW9Stul6tb82OS_4/s1700-e365/reco1.jpg)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiLnnvBvl0Gs5pfpUcrlJ_Ni62CyGs5UpoGCmpUAjReyBpExj5FzhuxSwuUcfQiyxDqeeoy6jSAHq4tA2KUnO5CRfbpfd_jN1ndeXgC0MiG0TrAfAyW67eybZeHMY-t6_kICQdPPKqK-1n9Ngkrj7UJrZZa1KQWqN9WjaTaDuHA_t6RW9Stul6tb82OS_4/s1700-e365/reco1.jpg)

In February 2026, a phishing-as-a-service (PhaaS) platform called [EvilTokens](https://labs.cloudsecurityalliance.org/research/csa-research-note-oauth-device-code-phishing-m365-20260325-c/) went live. Within five weeks, it had compromised more than 340 Microsoft 365 organizations across five countries.

The targets of the platform received a message asking them to enter a short code at microsoft.com/devicelogin and complete their normal MFA challenge, then walked away believing they had verified a routine sign-in. They had actually handed the operator a valid refresh token scoped to their mailbox, drive, calendar, and contacts, with the lifespan of a tenant policy rather than a session.

The operator never needed a password, never tripped an MFA prompt, and never produced a sign-in event that looked like an intrusion. The attack succeeded because the OAuth consent screen has become an instinctive click, and the controls built to stop credential phishing do not look at the consent layer.

Security researchers call the resulting condition consent phishing or OAuth grant abuse. The phishing click that mattered last decade handed over a password. The phishing click that matters now hands over a refresh token, and it sits structurally below the identity controls most organizations still treat as the perimeter.

## **Why MFA Cannot See an OAuth Grant**[](https://thehackernews.com/2026/05/the-new-phishing-click-how-oauth.html#why-mfa-cannot-see-an-oauth-grant)

A credential phish hands over a username and password that has to be replayed somewhere, and most identity stacks now demand a second factor at the replay. Even adversary-in-the-middle (AiTM) kits produce a session cookie tied to a sign-in event that the SIEM correlates against geography, device, and travel patterns.

[![Image 2](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh5JIwDvfaKyGcj0TqarIPHXTums0vw-XcwuChUdiQcUW97w0O89OsC_vqeE-8_rUvzVaTw6zv2e1PKsCnHvn7AgmrvnxCh40mfyS_1rI7OcMRfJNQEAGdlVK41X9XxErLxOvsChlctDX2yxSE4ZfSCmQE-mAZk_a9p1vdiCgMgWNqMaDHNP9jCtaR2ToE/s1700-e365/1.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh5JIwDvfaKyGcj0TqarIPHXTums0vw-XcwuChUdiQcUW97w0O89OsC_vqeE-8_rUvzVaTw6zv2e1PKsCnHvn7AgmrvnxCh40mfyS_1rI7OcMRfJNQEAGdlVK41X9XxErLxOvsChlctDX2yxSE4ZfSCmQE-mAZk_a9p1vdiCgMgWNqMaDHNP9jCtaR2ToE/s1700-e365/1.png)
Figure 1: Credential phishing leaves a sign-in trail the SIEM can correlate.

An OAuth grant produces no replayed credentials. The user authenticates on the legitimate identity provider, finishes the MFA challenge on the legitimate domain, and clicks Accept. The token the attacker walks away with is the system working as designed. It is signed by the identity provider, scoped to whatever the user agreed to, and refreshable. MFA cannot block it because MFA has already happened.

[![Image 3](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhVF6GgTbkaDquC76Rf4ki6La-i0vin7TFrtzKOsbFDRuIv4RdyeJosUaSkX-6JPJal90jzb7sIQtxlflX1a540Es_jZEoe4IK87wYwmcBomfUCDwXyPSuNR1RCcdmm5ti8GxURJM5aCPLlALJ5LlN6LnL6nm8OJQXXlSabpAcLd0Bd0ZUq3h-YaOEh4gs/s1700-e365/2.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhVF6GgTbkaDquC76Rf4ki6La-i0vin7TFrtzKOsbFDRuIv4RdyeJosUaSkX-6JPJal90jzb7sIQtxlflX1a540Es_jZEoe4IK87wYwmcBomfUCDwXyPSuNR1RCcdmm5ti8GxURJM5aCPLlALJ5LlN6LnL6nm8OJQXXlSabpAcLd0Bd0ZUq3h-YaOEh4gs/s1700-e365/2.png)
Figure 2: An OAuth grant leaves no replay, just a refreshable token.

The other problem is that refresh tokens then extend the window. The tokens EvilTokens issued survived password resets and remained valid for weeks or months, depending on the tenant configuration. Rotating the password did not invalidate the grant. Only explicit revocation, or a conditional access policy that demanded re-consent, closed it.

## **How Consent Got Normalized**[](https://thehackernews.com/2026/05/the-new-phishing-click-how-oauth.html#how-consent-got-normalized)

This attack vector has existed since OAuth became standard. What changed is the environment it operates in. Users have been trained to click through consent screens at the rate they once clicked through cookie banners. Every AI agent installs Surface One. Every productivity integration surfaces one. Every browser extension that touches a SaaS account surfaces one. The volume of legitimate consent that a knowledge worker sees in a month exceeds anything that existed when the original OAuth threat models were written.

The scopes themselves use language that does not map cleanly to risk. A scope called "Read your mail" sounds limited, but in practice it covers every message, attachment, and shared thread the user can access. A scope called "Access files when you're not present" means a long-lived token issued without the user being in front of a screen to revoke it. The gap between consent language and operational reach is exactly where attackers operate.

## **Toxic Combinations Form Below the Application Owner**[](https://thehackernews.com/2026/05/the-new-phishing-click-how-oauth.html#toxic-combinations-form-below-the-application-owner)

A single OAuth consent gives an attacker a scoped foothold inside one application. The deeper risk forms when those footholds bridge.

A finance user grants an AI meeting summarizer access to their calendar and mailbox. The same user later grants a productivity assistant access to the company's shared drive. A third grant connects a CRM enrichment tool to the customer database. Each was approved one at a time. No application owner sanctioned the combination. The risk surface is now three scopes intersecting through one human identity, where the meeting summarizer's compromise can reach contract drafts and customer records through the same person.

This is called a [toxic combination](https://thehackernews.com/2026/04/toxic-combinations-when-cross-app.html). It consists of a permission breakdown across applications, bridged by an OAuth grant, an integration, or an AI agent, that no single application owner ever authorized as its own risk surface. It cannot be seen by any one application's audit log because the bridge exists outside of all of them.

[![Image 4](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiwqOKiXRSvHrfI9sbERjIxze4jIqEPzkJEGTQea3FOjd_bzUY9o0mGa_FlDlx2F2HSSo_R6lgRBOhtUxWsqPX0auK329d0tHD80Rr-DN5UJZQtuR20XxNzUf_Kv6ZO74Smfs3iNNbo-Ma8nWDWE7or28txkUGmwEbfKLfc4fLpGZVasyLUvw31SZ2ZqzY/s1700-e365/3.jpg)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiwqOKiXRSvHrfI9sbERjIxze4jIqEPzkJEGTQea3FOjd_bzUY9o0mGa_FlDlx2F2HSSo_R6lgRBOhtUxWsqPX0auK329d0tHD80Rr-DN5UJZQtuR20XxNzUf_Kv6ZO74Smfs3iNNbo-Ma8nWDWE7or28txkUGmwEbfKLfc4fLpGZVasyLUvw31SZ2ZqzY/s1700-e365/3.jpg)
Figure 3: A toxic combination between two SaaS apps no owner sanctioned together.

The MCP install, the OAuth consent click, and the browser-extension grant: each is a bridge issued at the speed of a single click. Model Context Protocol (MCP) servers are emerging as the next OAuth-style attack surface, letting agents acquire scoped reach through the same trust-once mechanism consent screens already use.

The 2025 Salesloft-Drift [incident](https://www.reco.ai/blog/what-the-salesloft-drift-and-shinyhunters-breaches-reveal-about-saas-risk) showed what this looks like at scale. A compromised downstream connector spread across more than 700 Salesforce tenants through OAuth tokens that the customers had legitimately approved. Each customer authorized the integration. None authorized the cascade.

## **What to Check**[](https://thehackernews.com/2026/05/the-new-phishing-click-how-oauth.html#what-to-check)

Closing this gap calls for treating OAuth consent the same way the security program already treats authentication. A small set of questions exposes where the real gap lives.

Area to review What it looks like in practice
OAuth application inventory Every third-party app holding refresh tokens in the tenant, refreshed continuously rather than at audit time.
Grant age and re-consent Tokens issued more than 30 days ago without re-consent, surfaced as a queue.
Cross-application identities Identities holding grants across three or more SaaS applications, flagged for review.
Agent and integration bridges AI agents and integrations bridging two systems no application owner sanctioned together.
Conditional access on consent Policies that re-trigger on consent events, not only on sign-in events.
Token-level revocation A playbook that revokes a single OAuth token rather than suspending the user.

Procedural discipline only scales so far. The bridges live in a graph no individual application owns, and they are created at the speed of an MCP install or an OAuth consent click. Seeing that graph continuously requires a platform built to watch the runtime layer where the bridges actually form.

## **Where AI Security Platforms Fit In**[](https://thehackernews.com/2026/05/the-new-phishing-click-how-oauth.html#where-ai-security-platforms-fit-in)

A new class of platforms handles a lot of this automatically. They map every OAuth grant, AI agent, and third-party integration into the identity graph the moment it is issued, rather than waiting for the next audit, then surface the bridges, unused tokens, and policy deviations as a continuous operational queue.

One leading example is Reco. It brings AI agent security, identity governance, and threat detection into one control plane. Its Identity Knowledge Graph connects human and non-human identities to the applications, OAuth grants, and integrations they can access across the SaaS estate.

[![Image 5](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiJEKvyvgiC5n6dk1RgtRp-7yVrq581qhbQxfy8jodiY3yWD5AKRiq-GpN84GBG_8atu9KuOiY-xTK8KKrUh3DTSphoio2vcVEnDdk3p-dTdGRANxereZ5niOz8jnNL9FiW3qH-Wh4K1KX-GrWohb1EESZWcU5vJ5b-_F4VyvwZShAjmAT8qHL_NUACNpk/s1700-e365/4.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiJEKvyvgiC5n6dk1RgtRp-7yVrq581qhbQxfy8jodiY3yWD5AKRiq-GpN84GBG_8atu9KuOiY-xTK8KKrUh3DTSphoio2vcVEnDdk3p-dTdGRANxereZ5niOz8jnNL9FiW3qH-Wh4K1KX-GrWohb1EESZWcU5vJ5b-_F4VyvwZShAjmAT8qHL_NUACNpk/s1700-e365/4.png)
Figure 4: Reco's view of an AI agent's OAuth grants and connected accounts.

The platform continuously discovers AI agents and OAuth grants as they appear, maps each scope back to the identity that approved it, monitors behaviour for policy deviations, and revokes access at the token level rather than at the user account. That gives security teams visibility into the runtime layer where these trust relationships actually form.

Consent phishing will probably not stay at the margins for much longer. Phishing-resistant authentication has received years of investment and scrutiny, while the consent layer still operates largely on trust. Closing that gap means treating OAuth grants and AI-agent connections with the same visibility, monitoring, and revocation discipline already applied to authentication itself.

> [Learn more about Reco's AI security platform](https://www.reco.ai/).

Found this article interesting? This article is a contributed piece from one of our valued partners. Follow us on [Google News](https://news.google.com/publications/CAAqLQgKIidDQklTRndnTWFoTUtFWFJvWldoaFkydGxjbTVsZDNNdVkyOXRLQUFQAQ), [Twitter](https://twitter.com/thehackersnews) and [LinkedIn](https://www.linkedin.com/company/thehackernews/) to read more exclusive content we post.

