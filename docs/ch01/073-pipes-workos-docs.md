# Pipes – WorkOS Docs

> 📊 Level ⭐ | 7.3KB | `entities/pipes-workos-docs.md`

# Pipes – WorkOS Docs

## 摘要
WorkOS Pipes is an OAuth integration-as-a-service product that lets an application's users securely connect their third-party accounts (GitHub, Slack, Google, Salesforce, and more) without the owning team having to build or operate OAuth flows, token refresh, or credential storage. The product splits setup into WorkOS-managed shared credentials for sandbox prototyping and custom credentials for production, and ships a pre-built Pipes Widget UI plus a backend token-fetching API. Its core value is collapsing the multi-week engineering cost of owning provider integrations into a days-long configuration task.

## 核心要点
- Pipes handles the entire OAuth lifecycle — authorization redirects, callbacks, token refresh, and credential storage — so the consuming application never manages token state itself.
- Providers are enabled per-application in the WorkOS Dashboard; connecting a provider is a configuration action, not a code change.
- **Shared Credentials** mode uses WorkOS-managed sandbox credentials for fastest setup, letting users connect immediately without the integrator creating OAuth apps per provider.
- **Custom Credentials** mode is for production: the integrator creates its own OAuth application in each provider, supplying redirect URI, client ID/secret, and scopes.
- The Pipes Widget is a pre-built UI for connecting and managing accounts; it surfaces which providers are available, initiates authorization, and prompts users to reauthorize when a token breaks.
- A backend endpoint fetches fresh access tokens on the user's behalf — Pipes refreshes tokens automatically and returns structured error info when a token is invalid, so the app can route the user to re-authorization.

## 深度分析

### What Pipes actually abstracts away
The surface area of the docs is small, but the engineering burden it removes is large. Building a single third-party OAuth integration "from scratch" means implementing an authorization-code state machine (per RFC 6749), storing refresh tokens securely, scheduling silent refresh before expiry, handling revocations and scope changes, and maintaining per-provider quirks around scopes and callback routing. Pipes collapses all of this into three configuration primitives — which provider, which scopes, whose credentials — plus two runtime surfaces: a fetch-token endpoint and a connection widget. For a team shipping many integrations, the cost is not linear in the number of providers because the recurring per-provider implementation work is replaced by one shared platform.

### Shared vs. Custom credentials as a deliberate staging model
The two credential modes map cleanly onto the classic test-vs-production split seen across developer platforms (analogous to Stripe's test/live mode). Shared Credentials unblock early prototyping and betas because a developer can wire a provider end-to-end without leaving the WorkOS Dashboard or creating applications in each upstream service. Custom Credentials are the production-grade path: the integrator owns the OAuth application, which is what providers' app-review and rate-limit regimes expect, and gains independent control over scopes and configuration per provider. The migration between the two is a config change rather than an architectural one, which lowers the cost of starting fast and hardening later.

### The token-fetch endpoint as the real integration contract
The most consequential design decision is that the application calls one backend endpoint to get a fresh access token and then invokes the third-party API itself. Pipes promises the token is always fresh because it owns refresh; when a token is genuinely broken, the endpoint returns structured information instead of a generic failure. This turns "handle token expiry, refresh, and revocation" into a single business event: *the user needs to reauthorize*. The app's only obligation is to route the user back to the widget or a re-auth URL. This is a meaningful simplification because it removes a whole class of background maintenance (cron-style refresh jobs, expiry race conditions) from the consuming codebase.

### Security and platform trust as the hidden trade
The docs present the security story as a benefit, and in one sense it is: Pipes takes credential storage and OAuth state off the integrator's plate. But it concentrates trust — every user's access and refresh tokens flow through and are stored by WorkOS infrastructure, making WorkOS a de facto credential custodian. For regulated verticals (finance, healthcare), this means the platform itself must pass a vendor security assessment, and the integrator must reason about the blast radius of a compromise at the aggregator rather than at its own perimeter. The widget also becomes a privacy surface: the description shown to users inside the widget is exactly the disclosure of how their data will be used, which is where consent friction and legal exposure live.

## 实践启示
1. **Use Shared Credentials to de-risk the first integration**: wire a provider end-to-end against WorkOS-managed sandbox credentials before writing any provider-specific code; you validate product fit and UX for near-zero setup cost.
2. **Plan the custom-credentials migration as an event, not a surprise**: switch to Custom Credentials when (a) a provider begins requiring OAuth app review or production quotas, or (b) you need independent control of scopes/configuration — treat it as a scheduled hardening step in the launch checklist.
3. **Design the re-authorization flow as a first-class state**: because the endpoint returns structured token errors, map "token invalid" to a user action — deep-link to the Pipes Widget or a re-auth page — rather than surfacing a raw API error.
4. **Treat the widget description as consent copy**: the description you set per provider is what users read before authorizing; write it as a clear data-usage disclosure, since it is both a UX and a compliance artifact.
5. **Scope minimal, verify against provider docs**: the inline scope suggestions are a starting point, not authoritative; confirm the full scope list in each provider's own documentation to avoid over- or under-scoping.
6. **Do a vendor security assessment before regulated use**: since tokens are stored by WorkOS, include the platform in your security review and understand the aggregation blast radius before building on it in finance/health contexts.

## 相关实体
- [WorkOS Pipes: Third-party integrations without the headache](048-workos-pipes-third-party-integrations-without-the-headache.html)
- [Cloudflare OAuth for All](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cloudflare-oauth-for-all.md)
- [OAuth phishing and click-jacking vectors](https://github.com/QianJinGuo/wiki-public/blob/main/entities/thehackernews-com-the-new-phishing-click-how-oauth.md)
- [Low-code API integration](../ch03/054-how-to-build-low-code-api-integrations-for-enterprise-apps-u.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/pipes-workos-docs.md)

---

