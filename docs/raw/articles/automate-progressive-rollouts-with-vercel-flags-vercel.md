---
source: newsletter
source_url: https://vercel.com/changelog/progressive-rollouts-in-vercel-flags
tags: [vercel]
date: 2026-05-14
review_value: 7
review_confidence: 8
review_recommendation: neutral
ingested: 2026-05-16
review_stars: 3
fetcher: jina
sha256: cf40e2c0fa100c284e4f638a3e58114cbde637c72afd0f2a6a5007fadda14dcb
---
# Automate progressive rollouts with Vercel Flags - Vercel
Markdown Content:
[Skip to content](https://vercel.com/changelog/progressive-rollouts-in-vercel-flags#geist-skip-nav)
[](https://vercel.com/home)
*   Products
    *   ##### [AI Cloud](https://vercel.com/ai)
        *   [AI Gateway One endpoint, all your models](https://vercel.com/ai-gateway)
        *   [Sandbox Isolated, safe code execution](https://vercel.com/sandbox)
        *   [Vercel Agent An agent that knows your stack](https://vercel.com/agent)
        *   [AI SDK The AI Toolkit for TypeScript](https://sdk.vercel.ai/)
        *   [v0 Build applications with AI](https://v0.app/)
    *   ##### Core Platform
        *   [CI/CD Helping teams ship 6× faster](https://vercel.com/products/previews)
        *   [Content Delivery Fast, scalable, and reliable](https://vercel.com/cdn)
        *   [Fluid Compute Servers, in serverless form](https://vercel.com/fluid)
        *   [Workflow Long-running workflows at scale](https://vercel.com/workflows)
        *   [Observability Trace every step](https://vercel.com/products/observability)
    *   ##### [Security](https://vercel.com/security)
        *   [Bot Management Scalable bot protection](https://vercel.com/security/bot-management)
        *   [BotID Invisible CAPTCHA](https://vercel.com/botid)
        *   [Platform Security DDoS Protection, Firewall](https://vercel.com/security)
        *   [Web Application Firewall Granular, custom protection](https://vercel.com/security/web-application-firewall)
*   Resources
    *   ##### Company
        *   [Customers Trusted by the best teams](https://vercel.com/customers)
        *   [Blog The latest posts and changes](https://vercel.com/blog)
        *   [Changelog See what shipped](https://vercel.com/changelog)
        *   [Press Read the latest news](https://vercel.com/press)
        *   [Events Join us at an event](https://vercel.com/events)
    *   ##### Learn
        *   [Docs Vercel documentation](https://vercel.com/docs)
        *   [Academy Linear courses to level up](https://vercel.com/academy)
        *   [Knowledge Base Find help quickly](https://vercel.com/kb)
        *   [Community Join the conversation](https://community.vercel.com/)
    *   ##### Open Source
        *   [Next.js The native Next.js platform](https://vercel.com/frameworks/nextjs)
        *   [Nuxt The progressive web framework](https://nuxt.com/)
        *   [Svelte The web’s efficient UI framework](https://svelte.dev/)
        *   [Turborepo Speed with Enterprise scale](https://vercel.com/solutions/turborepo)
*   Solutions
    *   ##### Use Cases
        *   [AI Apps Deploy at the speed of AI](https://vercel.com/ai)
        *   [Composable Commerce Power storefronts that convert](https://vercel.com/solutions/composable-commerce)
        *   [Marketing Sites Launch campaigns fast](https://vercel.com/solutions/marketing-sites)
        *   [Multi-tenant Platforms Scale apps with one codebase](https://vercel.com/solutions/multi-tenant-saas)
        *   [Web Apps Ship features, not infrastructure](https://vercel.com/solutions/web-apps)
    *   ##### Tools
        *   [Marketplace Extend and automate workflows](https://vercel.com/marketplace)
        *   [Templates Jumpstart app development](https://vercel.com/templates)
        *   [Partner Finder Get help from solution partners](https://vercel.com/partners/solution-partners)
    *   ##### Users
        *   [Platform Engineers Automate away repetition](https://vercel.com/solutions/platform-engineering)
        *   [Design Engineers Deploy for every idea](https://vercel.com/solutions/design-engineering)
*   [Enterprise](https://vercel.com/enterprise)
*   [Pricing](https://vercel.com/pricing)
[Log In](https://vercel.com/login)[Contact](https://vercel.com/contact/sales)
[Sign Up](https://vercel.com/signup)[Sign Up](https://vercel.com/signup)
[Blog](https://vercel.com/blog)/[Changelog](https://vercel.com/changelog)
# Automate progressive rollouts with Vercel Flags
[![Image 1](https://assets.vercel.com/image/upload/f_auto,c_fill,w_40,h_40,q_75/contentful/image/e5382hct74si/5XopxEO2hHp8qxdAKvrgiY/e2f12ac1cd84e561332d4b30939d850e/dominik-ferber-128.jpg) Dominik Ferber Software Engineer](https://twitter.com/dferber90)[![Image 2](https://assets.vercel.com/image/upload/f_auto,c_fill,w_40,h_40,q_75/contentful/image/e5382hct74si/6BE0E0zOIw0wRMTu3df870/e8d792aa06bd10c9ddc07b98fa89d50d/chris-widmaier-128.jpg) Chris Widmaier Engineering Manager](https://twitter.com/chriswdmr)
1 min read
Copy URL
May 11, 2026
You can now use [Vercel Flags](https://vercel.com/docs/flags) to roll out a feature to a growing percentage of users on a schedule, with progressive rollouts.
Unlike weighted splits, which hold a fixed distribution (for example, 50/50) for experiments, a progressive rollout follows a predefined schedule that gradually shifts the traffic percentage to the new variant. Each stage has a target percentage and a duration.
Exposing a change in stages lets you catch a regression on a small slice of users before it hits everyone.
Progressive rollouts are [now available in the dashboard](https://vercel.com/d?to=%2F%5Bteam%5D%2F%5Bproject%5D%2Fflags&title=Vercel+Flags) and through the new `vercel flags rollout` CLI command.
Learn more in the [Vercel Flags documentation](https://vercel.com/docs/flags).
**Ready to deploy?**Start building with a free account. Speak to an expert for your _Pro_ or Enterprise needs.
[Start Deploying](https://vercel.com/new)[Talk to an Expert](https://vercel.com/contact/sales)
**Explore Vercel Enterprise** with an interactive product tour, trial, or a personalized demo.
[Explore Enterprise](https://vercel.com/try-enterprise)
## Get Started
*   [Templates](https://vercel.com/templates)
*   [Supported frameworks](https://vercel.com/docs/frameworks)
*   [Marketplace](https://vercel.com/marketplace)
*   [Domains](https://vercel.com/domains)
## Build
*   [Next.js on Vercel](https://vercel.com/frameworks/nextjs)
*   [Turborepo](https://vercel.com/solutions/turborepo)
*   [v0](https://v0.app/)
## Scale
*   [Content delivery network](https://vercel.com/cdn)
*   [Fluid compute](https://vercel.com/fluid)
*   [CI/CD](https://vercel.com/products/previews)
*   [Observability](https://vercel.com/products/observability)
*   [AI Gateway New](https://vercel.com/ai-gateway)
*   [Vercel Agent New](https://vercel.com/agent)
## Secure
*   [Platform security](https://vercel.com/security)
*   [Web Application Firewall](https://vercel.com/security/web-application-firewall)
*   [Bot management](https://vercel.com/security/bot-management)
*   [BotID](https://vercel.com/botid)
*   [Sandbox New](https://vercel.com/sandbox)
## Resources
*   [Pricing](https://vercel.com/pricing)
*   [Customers](https://vercel.com/customers)
*   [Enterprise](https://vercel.com/enterprise)
*   [Articles](https://vercel.com/i)
*   [Startups](https://vercel.com/startups)
*   [Solution partners](https://vercel.com/partners/solution-partners)
## Learn
*   [Docs](https://vercel.com/docs)
*   [Blog](https://vercel.com/blog)
*   [Changelog](https://vercel.com/changelog)
*   [Knowledge Base](https://vercel.com/kb)
*   [Academy](https://vercel.com/academy)
*   [Community](https://community.vercel.com/)
## Frameworks
*   [Next.js](https://vercel.com/frameworks/nextjs)
*   [Nuxt](https://vercel.com/docs/frameworks/full-stack/nuxt)
*   [Svelte](https://vercel.com/docs/frameworks/full-stack/sveltekit)
*   [Nitro](https://vercel.com/docs/frameworks/backend/nitro)
*   [Turbo](https://vercel.com/solutions/turborepo)
## SDKs
*   [AI SDK](https://ai-sdk.dev/)
*   [Workflow SDK New](https://workflow-sdk.dev/)
*   [Flags SDK](https://flags-sdk.dev/)
*   [Chat SDK](https://chat-sdk.dev/)
*   [Streamdown AI New](https://streamdown.ai/)
## Use Cases
*   [Composable commerce](https://vercel.com/solutions/composable-commerce)
*   [Multi-tenant platforms](https://vercel.com/solutions/multi-tenant-saas)
*   [Web apps](https://vercel.com/solutions/web-apps)
*   [Marketing sites](https://vercel.com/solutions/marketing-sites)
*   [Platform engineers](https://vercel.com/solutions/platform-engineering)
*   [Design engineers](https://vercel.com/solutions/design-engineering)
## Company
*   [About](https://vercel.com/about)
*   [Careers](https://vercel.com/careers)
*   [Help](https://vercel.com/help)
*   [Press](https://vercel.com/press)
*   [Legal](https://vercel.com/legal)
*   [Privacy Policy](https://vercel.com/legal/privacy-policy)
## Community
*   [Open source program](https://vercel.com/open-source-program)
*   [Events](https://vercel.com/events)
*   [Shipped on Vercel](https://vercel.com/shipped)
*   [GitHub](https://github.com/vercel)
*   [LinkedIn](https://linkedin.com/company/vercel)
*   [X](https://x.com/vercel)
*   [YouTube](https://youtube.com/@VercelHQ)
[](https://vercel.com/home)
[Loading status…](https://vercel-status.com/)Select a display theme:system light dark 
Products
[AI Gateway One endpoint, all your models](https://vercel.com/ai-gateway)
[Sandbox Isolated, safe code execution](https://vercel.com/sandbox)
[Vercel Agent An agent that knows your stack](https://vercel.com/agent)
[AI SDK The AI Toolkit for TypeScript](https://sdk.vercel.ai/)
[v0 Build applications with AI](https://v0.app/)
[CI/CD Helping teams ship 6× faster](https://vercel.com/products/previews)
[Content Delivery Fast, scalable, and reliable](https://vercel.com/cdn)
[Fluid Compute Servers, in serverless form](https://vercel.com/fluid)
[Workflow Long-running workflows at scale](https://vercel.com/workflows)
[Observability Trace every step](https://vercel.com/products/observability)
[Bot Management Scalable bot protection](https://vercel.com/security/bot-management)
[BotID Invisible CAPTCHA](https://vercel.com/botid)
[Platform Security DDoS Protection, Firewall](https://vercel.com/security)
[Web Application Firewall Granular, custom protection](https://vercel.com/security/web-application-firewall)
Resources
[Customers Trusted by the best teams](https://vercel.com/customers)
[Blog The latest posts and changes](https://vercel.com/blog)
[Changelog See what shipped](https://vercel.com/changelog)
[Press Read the latest news](https://vercel.com/press)
[Events Join us at an event](https://vercel.com/events)
[Docs Vercel documentation](https://vercel.com/docs)
[Academy Linear courses to level up](https://vercel.com/academy)
[Knowledge Base Find help quickly](https://vercel.com/kb)
[Community Join the conversation](https://community.vercel.com/)
[Next.js The native Next.js platform](https://vercel.com/frameworks/nextjs)
[Nuxt The progressive web framework](https://nuxt.com/)
[Svelte The web’s efficient UI framework](https://svelte.dev/)
[Turborepo Speed with Enterprise scale](https://vercel.com/solutions/turborepo)
Solutions
[AI Apps Deploy at the speed of AI](https://vercel.com/ai)
[Composable Commerce Power storefronts that convert](https://vercel.com/solutions/composable-commerce)
[Marketing Sites Launch campaigns fast](https://vercel.com/solutions/marketing-sites)
[Multi-tenant Platforms Scale apps with one codebase](https://vercel.com/solutions/multi-tenant-saas)
[Web Apps Ship features, not infrastructure](https://vercel.com/solutions/web-apps)
[Marketplace Extend and automate workflows](https://vercel.com/marketplace)
[Templates Jumpstart app development](https://vercel.com/templates)
[Partner Finder Get help from solution partners](https://vercel.com/partners/solution-partners)
[Platform Engineers Automate away repetition](https://vercel.com/solutions/platform-engineering)
[Design Engineers Deploy for every idea](https://vercel.com/solutions/design-engineering)