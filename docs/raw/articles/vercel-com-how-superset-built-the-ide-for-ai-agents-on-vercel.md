---
title: "How Superset built the IDE for AI agents on Vercel"
source: newsletter
source_url: https://vercel.com/blog/how-superset-built-the-ide-for-ai-agents-on-vercel
tags: [vercel]
ingested: 2026-05-14
sha256: edaaf434c260
review_value: 7
review_confidence: 8
review_recommendation: worth-reading
---
Markdown Content:
# How Superset built the IDE for AI agents on Vercel - Vercel
[Skip to content](https://vercel.com/blog/how-superset-built-the-ide-for-ai-agents-on-vercel#geist-skip-nav)
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
[Blog](https://vercel.com/blog)/[Customers](https://vercel.com/blog/category/customers)
# How Superset built the IDE for AI agents on Vercel
[![Image 1](https://assets.vercel.com/image/upload/f_auto,c_fill,w_40,h_40,q_75/contentful/image/e5382hct74si/2FniXVhQswy0dqmLZvCwg/27546e44232219d69aed1e06ea6a8d01/rini-vasan-avatar.png) Rini Vasan Product Marketing Manager](https://twitter.com/rini-vasan)
4 min read
Copy URL
May 10, 2026
**Superset on Vercel**
*   1,000–1,400 deployments per week
*   ~600 preview deployments per day
*   ~30 second average build time
*   57–64% week-over-week DAU growth
Software development with AI started as a single engineer chatting with a single agent about a local repo. Today, developers direct fleets of agents in the cloud, but traditional tools were built for the old shape of the job: IDEs, terminals, and review systems designed for one developer moving one ticket at a time.
Co-founders Kiet Ho, Satya Patel, and Avi Peltz, all former CTOs at YC-backed companies, built [Superset](https://superset.sh/) as the IDE for multi-agent development. It runs up to 10 coding agents in parallel, each in its own isolated workspace. Developers use it to direct teams of agents generating code across multiple branches simultaneously.
![Image 2](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2FjUWi32gVHl1y5pXgiJtMd%2Fd94ae46e50e6696ef00a4c0d912f98c2%2Fv2-public-beta__1___1_.png&w=1920&q=75)
Running a team of agents in parallel changes what the platform underneath has to do. The product Superset offers its users only feels parallel because nothing on the platform forces the work to wait. If any layer slows down, even briefly, the parallelism on top collapses with it.
> “Vercel uptime isn't something we plan around. It's a given.Vercel uptime isn't something we plan around. It's a given.”
> 
> 
> 
> ![Image 3](https://assets.vercel.com/image/upload/f_auto,c_fill,w_48,h_48,q_75/contentful/image/e5382hct74si/3oO5pt5HfhFhXlzlMvctpb/4f9c96004e1ca4affaa1b8e96c963ede/kiet.webp)
> 
> **Kiet Ho,** Co-Founder and CEO
## [Link to heading](https://vercel.com/blog/how-superset-built-the-ide-for-ai-agents-on-vercel#parallel-agents-need-parallel-infrastructure)Parallel agents need parallel infrastructure
This workflow has a dependency that's invisible from the product surface. Every agent thread needs its own isolated environment, every branch needs a live URL, and every change needs a safe place to run.
Without instant provisioning, parallel agents stop being parallel. CI pipelines have to be configured per branch, preview environments have to be managed by hand, and deploys back up behind one another. For a team running a dozen agents at once, that serialization is what breaks the product. Twelve workflows collapse into one queue, and a task that should take minutes takes hours. The developer is back to waiting, which is the exact problem Superset exists to solve.
## [Link to heading](https://vercel.com/blog/how-superset-built-the-ide-for-ai-agents-on-vercel#six-next.js-projects,-no-platform-team)Six Next.js projects, no platform team
Vercel was the default choice from the start, as all three founders had built on it at previous companies. From day one, Superset ran six [Next.js](https://nextjs.org/) projects on Vercel: the web app, marketing site, docs, and three supporting services. The team skipped platform engineering entirely and stayed focused on the product.
Every branch a Superset developer or agent creates becomes a [preview deployment](https://vercel.com/docs/deployments/environments#preview-environment-pre-production) automatically, often spinning up multiple services. At its peak, Superset generates roughly 600 preview deployments a day internally. Every branch gets a live URL, and the team never waits on a deploy queue.
## [Link to heading](https://vercel.com/blog/how-superset-built-the-ide-for-ai-agents-on-vercel#one-ai-stack-for-every-workload)One AI stack for every workload
Superset's AI stack grew with the product, and each piece of the Vercel platform was pulled in to solve a specific problem as functionality was added.
**Orchestration and model routing**
*   [AI SDK](https://vercel.com/) and [AI Elements](https://vercel.com/) run the agent orchestration itself, giving Superset a single interface for multi-model, multi-agent workflows.
*   [AI Gateway](https://vercel.com/) handles model routing without custom routing logic.
**Storage and compute**
*   [Vercel Blob](https://vercel.com/storage/blob) stores artifacts from agents and users, no object storage to manage.
*   [Fluid compute](https://vercel.com/) absorbs parallel tasks as agents fan out, scaling underneath without forcing the team to rearchitect. [Active CPU pricing](https://vercel.com/docs/functions/usage-and-pricing#active-cpu) means cost is only incurred on actual compute, not round-trip time waiting on model responses.
**Operational controls**
*   [Cron Jobs](https://vercel.com/docs/cron-jobs) prevent parallel environments from piling up.
*   [BotID](https://vercel.com/botid) filters bots during high traffic periods, no custom middleware needed.
As Superset has expanded into new product areas, the entire stack has stayed on Vercel. There's no second cloud to glue in, no orchestration layer to maintain, and no platform engineering team to keep it glued together. New surface areas gets built on the same primitives that handled the old surface area, which is what frees the team to keep moving on product instead of plumbing.
## [Link to heading](https://vercel.com/blog/how-superset-built-the-ide-for-ai-agents-on-vercel#superset-is-its-own-super-user)Superset is its own super user
The most credible proof how the Superset team uses Superset themselves. GitHub issues flow into Superset and get split across parallel workspaces, and Satya has tuned the team's setup to run up to a dozen instances at once. Multiple efforts move forward without anyone waiting on serial decisions. Compared to their previous dev workflows, Superset's commit graph looks exponential.
## [Link to heading](https://vercel.com/blog/how-superset-built-the-ide-for-ai-agents-on-vercel#scaling-through-a-hacker-news-spike)Scaling through a Hacker News spike
During a [Hacker News "Show HN" launch](https://news.ycombinator.com/item?id=46368739), user counts tripled overnight. Superset absorbed the spike without anyone provisioning infrastructure mid-flight.
That extends to incidents. If a customer reports an issue to Superset, their agents can spin up, write the fix, generate a preview, and merge the code in under thirty minutes. If the fix makes things worse, [rollbacks are instant](https://vercel.com/docs/instant-rollback), so the cost of a bad deploy drops to near zero.
## [Link to heading](https://vercel.com/blog/how-superset-built-the-ide-for-ai-agents-on-vercel#%22almost-no-time-to-deploy%22-as-the-bar)"Almost no time to deploy" as the bar
For Superset, immediate deployment matters because it keeps the loop between writing code, previewing it, and shipping it short enough that velocity never stalls, even across dozens of parallel workstreams. Build time averages around 30 seconds, and deployment volume runs between 1,000 and 1,400 a week.
> “When you're using Vercel, it's almost no time to deploy.When you're using Vercel, it's almost no time to deploy.”
> 
> 
> 
> ![Image 4](https://assets.vercel.com/image/upload/f_auto,c_fill,w_48,h_48,q_75/contentful/image/e5382hct74si/6KyFTRAeynkhcb5UxVrVqn/d9566122bd69eb7803e9949732678335/satya.webp)
> 
> **Satya Patel,** Co-Founder and CTO
## [Link to heading](https://vercel.com/blog/how-superset-built-the-ide-for-ai-agents-on-vercel#what's-next)What's next
The pattern for success is already clear: a product built for parallelism, by a team that works in parallel, on [agentic infrastructure](https://vercel.com/blog/agentic-infrastructure) that doesn't force them back into a queue. Every new agent capability they ship to customers gets stress-tested first by their own engineers running a dozen at once. The dozen will become two dozen, and the infrastructure underneath was built to expect it.
**About Superset**: [Superset](https://superset.sh/) is built by a team of three ex-YC CTOs and its the IDE for the AI agents era, letting developers run multiple coding agents in parallel.
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