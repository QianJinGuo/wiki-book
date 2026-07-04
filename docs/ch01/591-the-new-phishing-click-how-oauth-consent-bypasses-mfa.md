# The New Phishing Click: How OAuth Consent Bypasses MFA

## Ch01.591 The New Phishing Click: How OAuth Consent Bypasses MFA

> 📊 Level ⭐⭐ | 7.6KB | `entities/thehackernews-com-the-new-phishing-click-how-oauth.md`

# The New Phishing Click: How OAuth Consent Bypasses MFA
Published Time: Wed, 20 May 2026 13:43:00 GMT
[![Image 1](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiLnnvBvl0Gs5pfpUcrlJ_Ni62CyGs5UpoGCmpUAjReyBpExj5FzhuxSwuUcfQiyxDqeeoy6jSAHq4tA2KUnO5CRfbpfd_jN1ndeXgC0MiG0TrAfAyW67eybZeHMY-t6_kICQdPPKqK-1n9Ngkrj7UJrZZa1KQWqN9WjaTaDuHA_t6RW9Stul6tb82OS_4/s1700-e365/reco1.jpg)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiLnnvBvl0Gs5pfpUcrlJ_Ni62CyGs5UpoGCmpUAjReyBpExj5FzhuxSwuUcfQiyxDqeeoy6jSAHq4tA2KUnO5CRfbpfd_jN1ndeXgC0MiG0TrAfAyW67eybZeHMY-t6_kICQdPPKqK-1n9Ngkrj7UJrZZa1KQWqN9WjaTaDuHA_t6RW9Stul6tb82OS_4/s1700-e365/reco1.jpg)
In February 2026, a phishing-as-a-service (PhaaS) platform called [EvilTokens](https://labs.cloudsecurityalliance.org/research/csa-research-note-oauth-device-code-phishing-m365-20260325-c/) went live. Within five weeks, it had compromised more than 340 Microsoft 365 organizations across five countries.

The targets of the platform received a message asking them to enter a short code at microsoft.com/devicelogin and complete their normal MFA challenge, then walked away believing they had verified a routine sign-in. They had actually handed the operator a valid refresh token scoped to their mailbox, drive, calendar, and contacts, with the lifespan of a tenant policy rather than a session.

The operator never needed a password, never tripped an MFA prompt, and never produced a sign-in event that looked like an intrusion. The attack succeeded because the OAuth consent screen has become an instinctive click, and the controls built to stop credential phishing do not look at the consent layer.

Security researchers call the resulting condition consent phishing or OAuth grant abuse. The phishing click that mattered last decade handed over a password. The phishing click that matters now hands over a refresh token, and it sits structurally below the identity controls most organizations still treat as the perimeter.

## 深度分析

EvilTokens 展示了一种根本性的安全范式转移。传统的凭证钓鱼依赖窃取密码并在下游重放，这留下了可被 SIEM 关联的登录事件痕迹，而现代多因素认证正是针对这种攻击模式构建的防御层。然而 OAuth 同意授权完全在合法身份提供者上完成，攻击者获取的是由微软官方签发的刷新令牌， MFA 挑战已在合法域上成功完成。这意味着传统的"边界"思维——将认证视为防线——已无法覆盖新型攻击面，因为令牌本身是系统正常运作的产物而非异常行为。

刷新令牌的生命周期设计是另一层被低估的风险。 EvilTokens 发放的令牌在密码重置后依然存活，存续期取决于租户策略配置，可长达数周甚至数月。这意味着典型的"泄露后改密码"应急响应流程对 OAuth 授权完全失效。攻击者获得的不是一次性会话，而是一个可以在后台持续刷新、跨越多次安全事件存活的长期 foothold 。只有显式撤销或要求重新同意的条件访问策略才能终止这段访问窗口。

同意授权的大规模日常化是攻击成立的幕后推手。用户每月看到的同意屏幕数量已远超早期 OAuth 威胁模型制定时的想象。 AI agent 安装、会议摘要工具、浏览器扩展——每个都附带一个同意授权界面，频率之高已使"点击同意"成为下意识的肌肉反射。雪上加霜的是，同意语言与实际权限之间存在巨大的语义鸿沟： "读取邮件"听起来有限，但实则覆盖用户可访问的每条消息、附件和共享线程；"在您不在时访问文件"意味着用户在屏幕前无法监督令牌的生命周期。这种语言模糊性恰好为攻击者提供了操作空间。

"有毒组合"（toxic combination）概念的提出揭示了跨应用风险的涌现模式。 Finance 用户给 AI 会议摘要工具授予日历和邮箱访问权，同一用户后来又给生产力助手授予了公司共享驱动器的访问权，第三个授权来自 CRM  enrichment 工具连接客户数据库。这三个授权各自独立审批、单独看都合理，但风险在于它们通过同一个人的身份交汇——当会议摘要工具被攻陷，攻击者可以沿着这条组合路径触达合同草案和客户记录。这种组合风险无法在任何单一应用的审计日志中被发现，因为跨越应用的白袍存在于所有这些应用的管辖范围之外。

MCP（ Model Context Protocol）服务正在成为下一个 OAuth 式的攻击面。其信任一次（ trust-once ）的授权机制与同意屏幕完全相同，区别只在于它授权的是 AI agent 的工具调用能力而非传统的 API scope 。 2025 年 Salesloft-Drift 事件已展示了这类级联风险的破坏规模：一个被攻陷的下游连接器通过 OAuth 令牌在 700 多个 Salesforce 租户间扩散，每个客户都合法授权了该集成，但没有一个授权了后续的级联扩散。

## 实践启示

1. **OAuth 应用清单连续可见性**：将第三方应用的刷新令牌清单作为常设运营队列，而非定期审计时的一次性工作。每个持有活动刷新令牌的第三方应用都应被持续追踪，而非在审计时才想起它。 

2. **授权年龄与重新同意策略**：建立超过 30 天未重新同意的令牌告警队列。授权期限应作为独立的安全策略维度，区别于传统的会话超时配置。 

3. **跨应用身份图谱持续监控**：识别在三个或以上 SaaS 应用中同时持有授权的身份，并将其列入优先审查队列。 toxic combination 的本质正是跨越多个应用授权的单一身份成为攻击桥接点。 

4. **条件访问策略须覆盖同意事件**：现有条件访问策略大多在登录事件上触发，但 OAuth 同意是独立于登录的事件流。须建立能在同意事件发生时重新触发 MFA 或重新评估信任级别的策略，而不仅在登录时评估。 

5. **令牌级撤销而非用户级暂停**：应急响应手册须训练团队执行单个令牌的撤销，而非整个用户账户的暂停。这要求对 OAuth 撤销端点（ revoke endpoint ）的操作熟练度，以及对哪些令牌需要撤销的精确判断能力。 

## 相关实体
- [Ai Phishing Attacks Are On The Rise Are You Prepared Bitward](https://github.com/QianJinGuo/wiki/blob/main/entities/AI-phishing-attacks-are-on-the-rise-Are-you-prepared-Bitward.md)
- [A 0 Click Exploit Chain For The Pixel 10 When A Door Closes A Window Opens 1](https://github.com/QianJinGuo/wiki/blob/main/entities/a-0-click-exploit-chain-for-the-pixel-10-when-a-door-closes-a-window-opens-1.md)
- [Pixel 10 Zero Click Exploit Chain](https://github.com/QianJinGuo/wiki/blob/main/entities/pixel-10-zero-click-exploit-chain.md)
- [New Lock](https://github.com/QianJinGuo/wiki/blob/main/entities/new-lock.md)
- [How To Calculate The Inference Efficiency Ratio](https://github.com/QianJinGuo/wiki/blob/main/entities/how-to-calculate-the-inference-efficiency-ratio.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/thehackernews-com-the-new-phishing-click-how-oauth.md)

---

