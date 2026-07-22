---
sha256: 0996b889f992da7e00370133f94ac5787aa5568da578f764387955b3383d3890
source: newsletter
source_url: https://vercel.com/blog/introducing-deepsec-find-and-fix-vulnerabilities-in-your-code-base
tags: [vercel]
title: "Introducing deepsec: The security harness for finding vulnerabilities in your codebase"
published: 2026-05-12
ingested: 2026-05-12
---
# Introducing deepsec: The security harness for finding vulnerabilities in your codebase - Vercel
[Skip to content](http://vercel.com/blog/introducing-deepsec-find-and-fix-vulnerabilities-in-your-code-base#geist-skip-nav)
[](http://vercel.com/home)
*   Products
    *   ##### [AI Cloud](http://vercel.com/ai)
        *   [AI Gateway One endpoint, all your models](http://vercel.com/ai-gateway)
        *   [Sandbox Isolated, safe code execution](http://vercel.com/sandbox)
        *   [Vercel Agent An agent that knows your stack](http://vercel.com/agent)
        *   [AI SDK The AI Toolkit for TypeScript](https://sdk.vercel.ai/)
        *   [v0 Build applications with AI](https://v0.app/)
    *   ##### Core Platform
        *   [CI/CD Helping teams ship 6× faster](http://vercel.com/products/previews)
        *   [Content Delivery Fast, scalable, and reliable](http://vercel.com/cdn)
        *   [Fluid Compute Servers, in serverless form](http://vercel.com/fluid)
        *   [Workflow Long-running workflows at scale](http://vercel.com/workflows)
        *   [Observability Trace every step](http://vercel.com/products/observability)
    *   ##### [Security](http://vercel.com/security)
        *   [Bot Management Scalable bot protection](http://vercel.com/security/bot-management)
        *   [BotID Invisible CAPTCHA](http://vercel.com/botid)
        *   [Platform Security DDoS Protection, Firewall](http://vercel.com/security)
        *   [Web Application Firewall Granular, custom protection](http://vercel.com/security/web-application-firewall)
*   Resources
    *   ##### Company
        *   [Customers Trusted by the best teams](http://vercel.com/customers)
        *   [Blog The latest posts and changes](http://vercel.com/blog)
        *   [Changelog See what shipped](http://vercel.com/changelog)
        *   [Press Read the latest news](http://vercel.com/press)
        *   [Events Join us at an event](http://vercel.com/events)
    *   ##### Learn
        *   [Docs Vercel documentation](http://vercel.com/docs)
        *   [Academy Linear courses to level up](http://vercel.com/academy)
        *   [Knowledge Base Find help quickly](http://vercel.com/kb)
        *   [Community Join the conversation](https://community.vercel.com/)
    *   ##### Open Source
        *   [Next.js The native Next.js platform](http://vercel.com/frameworks/nextjs)
        *   [Nuxt The progressive web framework](https://nuxt.com/)
        *   [Svelte The web’s efficient UI framework](https://svelte.dev/)
        *   [Turborepo Speed with Enterprise scale](http://vercel.com/solutions/turborepo)
*   Solutions
    *   ##### Use Cases
        *   [AI Apps Deploy at the speed of AI](http://vercel.com/ai)
        *   [Composable Commerce Power storefronts that convert](http://vercel.com/solutions/composable-commerce)
        *   [Marketing Sites Launch campaigns fast](http://vercel.com/solutions/marketing-sites)
        *   [Multi-tenant Platforms Scale apps with one codebase](http://vercel.com/solutions/multi-tenant-saas)
        *   [Web Apps Ship features, not infrastructure](http://vercel.com/solutions/web-apps)
    *   ##### Tools
        *   [Marketplace Extend and automate workflows](http://vercel.com/marketplace)
        *   [Templates Jumpstart app development](http://vercel.com/templates)
        *   [Partner Finder Get help from solution partners](http://vercel.com/partners/solution-partners)
    *   ##### Users
        *   [Platform Engineers Automate away repetition](http://vercel.com/solutions/platform-engineering)
        *   [Design Engineers Deploy for every idea](http://vercel.com/solutions/design-engineering)
*   [Enterprise](http://vercel.com/enterprise)
*   [Pricing](http://vercel.com/pricing)
[Log In](http://vercel.com/login)[Contact](http://vercel.com/contact/sales)
[Sign Up](http://vercel.com/signup)[Sign Up](http://vercel.com/signup)
[Blog](http://vercel.com/blog)
# Introducing deepsec: The security harness for finding vulnerabilities in your codebase
[![Image 1](https://assets.vercel.com/image/upload/f_auto,c_fill,w_40,h_40,q_75/contentful/image/e5382hct74si/4iicDbTA4KX4io2f2PPx7q/b11dbc333322bc5a0087056d162cb5cf/malte.ubl.jpg) Malte Ubl CTO, Vercel](https://twitter.com/cramforce)
3 min read
Copy URL
Copied to clipboard!
May 4, 2026
Today we’re open sourcing [`deepsec`](https://github.com/vercel-labs/deepsec/): a security harness powered by coding agents. It runs on your own infrastructure and surfaces hard-to-find issues in large codebases.
You can run `deepsec` on your laptop without setting up a cloud service for privileged source code access. For inference, you can use your existing Claude or Codex subscription without any additional setup.
Scanning large repos can take multiple days on a single machine. To run research jobs in parallel, `deepsec` supports optional fanout to Vercel Sandboxes for remote execution. Scans on Vercel’s codebases routinely scale up to 1,000+ concurrent sandboxes.
## [Link to heading](http://vercel.com/blog/introducing-deepsec-find-and-fix-vulnerabilities-in-your-code-base#architecture)Architecture
At its core, `deepsec` uses `claude` and `codex` to perform tailored investigation of a codebase using Opus 4.7 at max effort and GPT 5.5 at xhigh reasoning.
Scans start with static analysis to identify security-sensitive files, then coding agents investigate each candidate, tracing data flows, checking for mitigations, and producing actionable findings with severity ratings. Here is the workflow:
*   **Scan**: It starts by performing a regex-only scan of all files for security-sensitive areas that subsequent steps will focus on.
*   **Investigate**: Agents investigate each file identified in the scan.
*   **Revalidate**: A second agent run validates investigation findings to remove false positives and reclassify severity.
*   **Enrich**: Once investigation is complete, an agent uses git metadata and other optional services to identify the contributors responsible for fixing each issue.
*   **Export**: The `export` command formats the findings as instructions so that they can be turned into tickets for humans and coding agents.
![Image 2](http://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F16zhakmcmgpsn3ikDILmx8%2Fd2a6ed16f0d114f2304e36083925e4f3%2FDesktop_-_Light.png&w=1920&q=75)![Image 3](http://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F6xs2Sm1QG5Tl3qedOopPrR%2F398afeab2fb08e4ecf455be91a543636%2FDesktop_-_Dark__1_.png&w=1920&q=75)![Image 4](http://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F6R1f490NKgJrvNWCO6ABoY%2F30dc547cd0aac875362d9d7c9003439b%2FMobile_-_Light__1_.png&w=1920&q=75)![Image 5](http://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F6Pkd85ftTovuB8Jipj6ZA4%2F0e580f774ed8a744645f9a91df21ca6d%2FMobile_-_Dark__1_.png&w=1920&q=75)
## [Link to heading](http://vercel.com/blog/introducing-deepsec-find-and-fix-vulnerabilities-in-your-code-base#running-deepsec-on-production-code)Running `deepsec` on production code
`deepsec` has been highly useful on our own monorepos and for our customers' codebases. During development, we ran `deepsec` on several open source repositories of Vercel customers and partners.
> “We’ve been on a lookout for a tool to do security scans on our open source repositories. deepsec’s scan have been the most thorough, with most findings, and good true-positive rate.We’ve been on a lookout for a tool to do security scans on our open source repositories. deepsec’s scan have been the most thorough, with most findings, and good true-positive rate.”
> 
> 
> 
> ![Image 6](https://assets.vercel.com/image/upload/f_auto,c_fill,w_48,h_48,q_75/contentful/image/e5382hct74si/ZzOwpKoXxG6tJ5W5skFqX/44a84e78066d130391ff7fe65f5324d8/james-perkins-unkey.jpeg)
> 
> **James Perkins,** Co-founder and CEO @ Unkey
For example, `deepsec` scanned the [open source version](https://github.com/dubinc/dub) of [dub.co](http://dub.co/). Dub is a marketing attribution platform for affiliate programs and short links that is also available as SaaS. It features authenticated access, interacts with a database, and runs several backend services, creating a large security surface. When we shared our `deepsec` findings with founder Steven Tey, he replied:
> “We get a lot of automated security reports, but most of them aren't actionable. deepsec is the first tool that's surfaced the kind of issues we'd actually want a security engineer to flag, and it runs on infrastructure we control. We get a lot of automated security reports, but most of them aren't actionable. deepsec is the first tool that's surfaced the kind of issues we'd actually want a security engineer to flag, and it runs on infrastructure we control. ”
> 
> 
> 
> ![Image 7](https://assets.vercel.com/image/upload/f_auto,c_fill,w_48,h_48,q_75/contentful/image/e5382hct74si/6vu9TJmh0riAAFpgEQLJvO/f64b1deccd5a156f481c1e0156eb1d05/steven-tey-dub.jpeg)
> 
> **Steven Tey,** Founder and CEO @ dub.co
Running against Vercel’s own monorepos, `deepsec` identified subtle edge cases in auth conditions, leading us to develop a [custom scanner plugin](https://github.com/vercel-labs/deepsec/blob/main/docs/writing-matchers.md) that covers every authentication path in our code.
### [Link to heading](http://vercel.com/blog/introducing-deepsec-find-and-fix-vulnerabilities-in-your-code-base#false-positives-and-best-uses)False positives and best uses
Some of `deepsec`'s findings will be false positives. In our experience the false positive rate is roughly 10-20%. Given the impact of true positive findings in our own research, we’ve been happy with this outcome, and we built the `revalidate` step to have the agent further verify its findings to reduce false positives.
`deepsec` works best for applications and services. It may be usable for libraries and frameworks, but those would likely require custom prompts and scanners.
## [Link to heading](http://vercel.com/blog/introducing-deepsec-find-and-fix-vulnerabilities-in-your-code-base#customization-and-plugins)Customization and plugins
`deepsec` ships with a plugin system for adapting it to your codebase. The most common plugins are custom scanners: regex matchers tuned to your auth model, data layer, or team conventions. We recommend using `deepsec` with your coding agent and asking it to write those matchers based on findings from an initial scan:
`Inspect previous runs against ./my-app.Are there custom deepsec matchers we should add to find more candidates for vulnerabilities?`
## [Link to heading](http://vercel.com/blog/introducing-deepsec-find-and-fix-vulnerabilities-in-your-code-base#do-i-need-access-to-a-special-%E2%80%9Ccyber-model%E2%80%9D)Do I need access to a special “cyber model”?
Both Anthropic and OpenAI offer “cyber” versions of their most capable models, fine-tuned to accept security tasks the base models won’t. `deepsec` works with these, but is also fully functional with off-the-shelf models.
`deepsec` ships with a classifier that checks whether the task was refused after each research step. In our experience, for the prompt that `deepsec` is using, refusals are a non-issue for both Opus 4.7 and GPT 5.5.
## [Link to heading](http://vercel.com/blog/introducing-deepsec-find-and-fix-vulnerabilities-in-your-code-base#getting-started)Getting started
To get started, run `npx deepsec init` at the root of your repository. This will create a directory called `./.deepsec`, which is used to configure the system and store a catalog of your `deepsec` investigations. From there, follow the output of the command. Read the full [documentation on Github](https://github.com/vercel-labs/deepsec/#docs).
## [Link to heading](http://vercel.com/blog/introducing-deepsec-find-and-fix-vulnerabilities-in-your-code-base#feedback-welcome)Feedback welcome
While we’ve used `deepsec` extensively, it is still early in its development. Feedback and contributions [on GitHub](https://github.com/vercel-labs/deepsec/) are welcome.
**Ready to deploy?**Start building with a free account. Speak to an expert for your _Pro_ or Enterprise needs.
[Start Deploying](http://vercel.com/new)[Talk to an Expert](http://vercel.com/contact/sales)
**Explore Vercel Enterprise** with an interactive product tour, trial, or a personalized demo.
[Explore Enterprise](http://vercel.com/try-enterprise)
## Get Started
*   [Templates](http://vercel.com/templates)
*   [Supported frameworks](http://vercel.com/docs/frameworks)
*   [Marketplace](http://vercel.com/marketplace)
*   [Domains](http://vercel.com/domains)
## Build
*   [Next.js on Vercel](http://vercel.com/frameworks/nextjs)
*   [Turborepo](http://vercel.com/solutions/turborepo)
*   [v0](https://v0.app/)
## Scale
*   [Content delivery network](http://vercel.com/cdn)
*   [Fluid compute](http://vercel.com/fluid)
*   [CI/CD](http://vercel.com/products/previews)
*   [Observability](http://vercel.com/products/observability)
*   [AI Gateway New](http://vercel.com/ai-gateway)
*   [Vercel Agent New](http://vercel.com/agent)
## Secure
*   [Platform security](http://vercel.com/security)
*   [Web Application Firewall](http://vercel.com/security/web-application-firewall)
*   [Bot management](http://vercel.com/security/bot-management)
*   [BotID](http://vercel.com/botid)
*   [Sandbox New](http://vercel.com/sandbox)
## Resources
*   [Pricing](http://vercel.com/pricing)
*   [Customers](http://vercel.com/customers)
*   [Enterprise](http://vercel.com/enterprise)
*   [Articles](http://vercel.com/i)
*   [Startups](http://vercel.com/startups)
*   [Solution partners](http://vercel.com/partners/solution-partners)
## Learn
*   [Docs](http://vercel.com/docs)
*   [Blog](http://vercel.com/blog)
*   [Changelog](http://vercel.com/changelog)
*   [Knowledge Base](http://vercel.com/kb)
*   [Academy](http://vercel.com/academy)
*   [Community](https://community.vercel.com/)
## Frameworks
*   [Next.js](http://vercel.com/frameworks/nextjs)
*   [Nuxt](http://vercel.com/docs/frameworks/full-stack/nuxt)
*   [Svelte](http://vercel.com/docs/frameworks/full-stack/sveltekit)
*   [Nitro](http://vercel.com/docs/frameworks/backend/nitro)
*   [Turbo](http://vercel.com/solutions/turborepo)
## SDKs
*   [AI SDK](https://ai-sdk.dev/)
*   [Workflow SDK New](https://workflow-sdk.dev/)
*   [Flags SDK](https://flags-sdk.dev/)
*   [Chat SDK](https://chat-sdk.dev/)
*   [Streamdown AI New](https://streamdown.ai/)
## Use Cases
*   [Composable commerce](http://vercel.com/solutions/composable-commerce)
*   [Multi-tenant platforms](http://vercel.com/solutions/multi-tenant-saas)
*   [Web apps](http://vercel.com/solutions/web-apps)
*   [Marketing sites](http://vercel.com/solutions/marketing-sites)
*   [Platform engineers](http://vercel.com/solutions/platform-engineering)
*   [Design engineers](http://vercel.com/solutions/design-engineering)
## Company
*   [About](http://vercel.com/about)
*   [Careers](http://vercel.com/careers)
*   [Help](http://vercel.com/help)
*   [Press](http://vercel.com/press)
*   [Legal](http://vercel.com/legal)
*   [Privacy Policy](http://vercel.com/legal/privacy-policy)
## Community
*   [Open source program](http://vercel.com/open-source-program)
*   [Events](http://vercel.com/events)
*   [Shipped on Vercel](http://vercel.com/shipped)
*   [GitHub](https://github.com/vercel)
*   [LinkedIn](https://linkedin.com/company/vercel)
*   [X](https://x.com/vercel)
*   [YouTube](https://youtube.com/@VercelHQ)
[](http://vercel.com/home)
[Loading status…](https://vercel-status.com/)Select a display theme:system light dark 
Products
[AI Gateway One endpoint, all your models](http://vercel.com/ai-gateway)
[Sandbox Isolated, safe code execution](http://vercel.com/sandbox)
[Vercel Agent An agent that knows your stack](http://vercel.com/agent)
[AI SDK The AI Toolkit for TypeScript](https://sdk.vercel.ai/)
[v0 Build applications with AI](https://v0.app/)
[CI/CD Helping teams ship 6× faster](http://vercel.com/products/previews)
[Content Delivery Fast, scalable, and reliable](http://vercel.com/cdn)
[Fluid Compute Servers, in serverless form](http://vercel.com/fluid)
[Workflow Long-running workflows at scale](http://vercel.com/workflows)
[Observability Trace every step](http://vercel.com/products/observability)
[Bot Management Scalable bot protection](http://vercel.com/security/bot-management)
[BotID Invisible CAPTCHA](http://vercel.com/botid)
[Platform Security DDoS Protection, Firewall](http://vercel.com/security)
[Web Application Firewall Granular, custom protection](http://vercel.com/security/web-application-firewall)
Resources
[Customers Trusted by the best teams](http://vercel.com/customers)
[Blog The latest posts and changes](http://vercel.com/blog)
[Changelog See what shipped](http://vercel.com/changelog)
[Press Read the latest news](http://vercel.com/press)
[Events Join us at an event](http://vercel.com/events)
[Docs Vercel documentation](http://vercel.com/docs)
[Academy Linear courses to level up](http://vercel.com/academy)
[Knowledge Base Find help quickly](http://vercel.com/kb)
[Community Join the conversation](https://community.vercel.com/)
[Next.js The native Next.js platform](http://vercel.com/frameworks/nextjs)
[Nuxt The progressive web framework](https://nuxt.com/)
[Svelte The web’s efficient UI framework](https://svelte.dev/)
[Turborepo Speed with Enterprise scale](http://vercel.com/solutions/turborepo)
Solutions
[AI Apps Deploy at the speed of AI](http://vercel.com/ai)
[Composable Commerce Power storefronts that convert](http://vercel.com/solutions/composable-commerce)
[Marketing Sites Launch campaigns fast](http://vercel.com/solutions/marketing-sites)
[Multi-tenant Platforms Scale apps with one codebase](http://vercel.com/solutions/multi-tenant-saas)
[Web Apps Ship features, not infrastructure](http://vercel.com/solutions/web-apps)
[Marketplace Extend and automate workflows](http://vercel.com/marketplace)
[Templates Jumpstart app development](http://vercel.com/templates)
[Partner Finder Get help from solution partners](http://vercel.com/partners/solution-partners)
[Platform Engineers Automate away repetition](http://vercel.com/solutions/platform-engineering)
[Design Engineers Deploy for every idea](http://vercel.com/solutions/design-engineering)