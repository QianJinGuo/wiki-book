---
source: newsletter
source_url: https://vercel.com/blog/ai-gateway-production-index
tags: [vercel]
title: AI Gateway production index
sha256: 96e94b9c934f36617c5d0a3154960c870abb7af1c02b63678c7854deb17d5028
review_value: 7
review_confidence: 8
review_recommendation: worth-reading
review_stars: 3
ingested: 2026-05-15
---
Markdown Content:
# AI Gateway production index - Vercel
[Skip to content](https://vercel.com/blog/ai-gateway-production-index#geist-skip-nav)
[](https://vercel.com/home)
*   Products
    *   ##### [AI Cloud](https://vercel.com/ai)
        *   [AI Gateway One endpoint, all your models](https://vercel.com/ai-gateway)
        *   [Sandbox Isolated, safe code execution](https://vercel.com/sandbox)
        *   [Vercel Agent An agent that knows your stack](https://vercel.com/agent)
        *   [AI SDK The AI Toolkit for TypeScript](https://vercel.com/ai-sdk)
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
[Blog](https://vercel.com/blog)
# AI Gateway production index
[![Image 1](https://assets.vercel.com/image/upload/f_auto,c_fill,w_40,h_40,q_75/contentful/image/e5382hct74si/1JzsxXBNqzXj0eLjksy98G/99999064191aba4640215da7eb44c88a/harpreet-arora-128.jpg) Harpreet Arora Product, AI infrastructure](https://twitter.com/hp_arora)[![Image 2](https://assets.vercel.com/image/upload/f_auto,c_fill,w_40,h_40,q_75/contentful/image/e5382hct74si/15brZztaxLxe77KugBgFCH/a7f2b1eb067cefc92d8f661942a4fc96/T0CAQ00TU-U09LJEZB6NT-750f39e3ea6f-128.png) Yvonne Zhou Strategy](https://twitter.com/yvonne-zhou)
8 min read
Copy URL
May 12, 2026
Ask which AI model is best, and the answer changes before the ink dries. That's what happens in an industry where new models are released weekly.
Every benchmark measures a different race, and every race crowns its own winner, but Vercel has a unique view of the industry through production workloads. [AI Gateway](https://vercel.com/ai-gateway) serves tens of trillions of tokens across hundreds of models through real applications and agents.
**What we're seeing**:
*   Anthropic leads in spend despite a higher unit price, Google leads in volume
*   OSS models are gaining traction, but there is no loyalty to specific labs
*   OpenAI spend share is growing quickly after recent model updates
*   High-volume workloads route across 30+ distinct models on average
*   Agentic workloads carry 59% of all token volume (up 2x over 6 months)
This report is built on data from seven months of production traffic from AI Gateway, with usage from over 200K+ unique teams.
## [Link to heading](https://vercel.com/blog/ai-gateway-production-index#anthropic-leads-in-spend;-google-leads-in-volume)Anthropic leads in spend; Google leads in volume
Cost and volume rankings disagree because they measure two different workloads, even for the same customer.
By spend in April 2026, Anthropic took 61%, Google 21%, and OpenAI 12%.
![Image 3: Stacked bar chart of monthly spend share by lab at Oct 2025, Jan 2026, and Apr 2026. Anthropic's pink dominates throughout, OpenAI's teal jumps in April. By Apr 2026, Anthropic 61%, Google 21%, OpenAI 12%, with smaller labs splitting the rest.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F2hWI28hGEU6ZzA2oasNbzU%2F05fd5325dad600f7822957e6cc2ad67e%2Fimage.png&w=1920&q=75)![Image 4: Stacked bar chart of monthly spend share by lab at Oct 2025, Jan 2026, and Apr 2026. Anthropic's pink dominates throughout, OpenAI's teal jumps in April. By Apr 2026, Anthropic 61%, Google 21%, OpenAI 12%, with smaller labs splitting the rest.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F2zrOMuF3qWuQiDKO6abOlE%2F000e598785785628c171a4166b0c6d67%2Fimage.png&w=1920&q=75)![Image 5: Stacked bar chart of monthly spend share by lab at Oct 2025, Jan 2026, and Apr 2026. Anthropic's pink dominates throughout, OpenAI's teal jumps in April. By Apr 2026, Anthropic 61%, Google 21%, OpenAI 12%, with smaller labs splitting the rest.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F11HT7iSAlVdqvRitd9sG2V%2F5d806b165cdc4c4d52908632ed41797b%2Fimage.png&w=1920&q=75)![Image 6: Stacked bar chart of monthly spend share by lab at Oct 2025, Jan 2026, and Apr 2026. Anthropic's pink dominates throughout, OpenAI's teal jumps in April. By Apr 2026, Anthropic 61%, Google 21%, OpenAI 12%, with smaller labs splitting the rest.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F6BUWRL17KmluxHdjJZRpzu%2Ff6459d6c705dc5dfbde2a97b34b872cf%2Fimage.png&w=1920&q=75)
Anthropic leads on spend across the window, with OpenAI's share tripling in April.
By token volume, the picture flipped. 38% of April traffic through AI Gateway routed to Google, 26% to Anthropic, 13% to OpenAI, and 10% to xAI. Smaller labs split the rest.
![Image 7: Stacked bar chart of token volume share by lab at Oct 2025, Jan 2026, Apr 2026. Anthropic's pink share falls, Google's blue grows. By Apr 2026, Google 38%, Anthropic 26%, OpenAI 13%, xAI 10%, with MiniMax, Moonshot AI, Other splitting the rest.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F6sPEW9QHSqZ19E4hbzrxWN%2Fdd249f2af7a550f9f609257a2320220c%2Fimage.png&w=1920&q=75)![Image 8: Stacked bar chart of token volume share by lab at Oct 2025, Jan 2026, Apr 2026. Anthropic's pink share falls, Google's blue grows. By Apr 2026, Google 38%, Anthropic 26%, OpenAI 13%, xAI 10%, with MiniMax, Moonshot AI, Other splitting the rest.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F6Va2OrdGpHwZjlwL7MaeJS%2F3ba9718cfee86f91f6e2940e0fe2617c%2Fimage.png&w=1920&q=75)![Image 9: Stacked bar chart of token volume share by lab at Oct 2025, Jan 2026, Apr 2026. Anthropic's pink share falls, Google's blue grows. By Apr 2026, Google 38%, Anthropic 26%, OpenAI 13%, xAI 10%, with MiniMax, Moonshot AI, Other splitting the rest.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2FUKFz3vySXTCYn3R32eIU4%2Faa1211b204437215249c05ba5d3b0737%2Fimage.png&w=1920&q=75)![Image 10: Stacked bar chart of token volume share by lab at Oct 2025, Jan 2026, Apr 2026. Anthropic's pink share falls, Google's blue grows. By Apr 2026, Google 38%, Anthropic 26%, OpenAI 13%, xAI 10%, with MiniMax, Moonshot AI, Other splitting the rest.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F3FpzhBRoX5Wi17ro6qIbmK%2Fdf2cdb0789b3856a4cd128ec81afdb30%2Fimage.png&w=1920&q=75)
Google held a clear lead in token volume in April.
Some models are positioned to win by being cheap enough per token to carry huge volume, while others are priced high enough to make sense only for quality-critical work. The different models are not competing for the same call. In aggregate the same customer base sits on both leaderboards, with premium reasoning calls landing on [Claude Opus](https://vercel.com/ai-gateway/models/claude-opus-4.7) and cheap fast calls landing on [Gemini Flash](https://vercel.com/ai-gateway/models/gemini-3-flash). Spend follows the high-stakes calls, and volume follows the low-stakes ones, with the labs each holding a different layer of the same applications.
Volume-vs-spend also changes quickly at the lab level. A few specific signals:
*   Gemini Flash helped Google take the lead on volume at a smaller share of spend
*   Claude Opus helps Anthropic lead on spend with less volume than Google
*   OpenAI's spend share tripled from March to April after the [GPT-5.4/5.5](https://vercel.com/ai-gateway/models/gpt-5.5) releases
*   Google's spend share climbed from 8% in March to 21% in April as Gemini Flash usage scaled
## [Link to heading](https://vercel.com/blog/ai-gateway-production-index#spend-follows-the-cost-of-being-wrong)Spend follows the cost of being wrong
The same cost/volume divide exists at a finer grain inside specific kinds workloads:
*   Personal assistants account for 20% of cost on 40% of token volume
*   Coding agents sit roughly balanced at 22% of cost on 20% of tokens
*   Back office agents run at 6% of cost on 15% of tokens
*   App generation runs at 7% of cost on 11% of tokens
![Image 11: Paired bars (April 2026) of % tokens / % market cost per use case. Personal Assistants 40.0/19.6. Coding Agents 20.4/21.8. App Generation 11.2/7.0. Education 5.5/6.8. Back Office 15.0/5.8. Sales 3.4/2.7. Recruiting 2.4/0.8. Other 22.4/15.0.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F63jrR8QOGgua7oBD6etifx%2F7641e88b60ae4a382b0053e80e0bab26%2Fimage.png&w=1920&q=75)![Image 12: Paired bars (April 2026) of % tokens / % market cost per use case. Personal Assistants 40.0/19.6. Coding Agents 20.4/21.8. App Generation 11.2/7.0. Education 5.5/6.8. Back Office 15.0/5.8. Sales 3.4/2.7. Recruiting 2.4/0.8. Other 22.4/15.0.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F5SyqYSfnidepJz7uWmIpCQ%2F3ce562a2d9954b5d7637a2eae33db202%2Fimage.png&w=1920&q=75)![Image 13: Paired bars (April 2026) of % tokens / % market cost per use case. Personal Assistants 40.0/19.6. Coding Agents 20.4/21.8. App Generation 11.2/7.0. Education 5.5/6.8. Back Office 15.0/5.8. Sales 3.4/2.7. Recruiting 2.4/0.8. Other 22.4/15.0.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F5qdifhS1J3HLN6Eg10u5Zp%2F86af8dd32dbd6c25a1ad9bb674711752%2Fimage.png&w=1920&q=75)![Image 14: Paired bars (April 2026) of % tokens / % market cost per use case. Personal Assistants 40.0/19.6. Coding Agents 20.4/21.8. App Generation 11.2/7.0. Education 5.5/6.8. Back Office 15.0/5.8. Sales 3.4/2.7. Recruiting 2.4/0.8. Other 22.4/15.0.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F6WafrFrfOGVLC4BxnMTUTv%2F53f88c5f382ed287c7260c2d0d1b9b48%2Fimage.png&w=1920&q=75)
Volume-heavy workloads run cheap per token, while cost-heavy workloads run expensive.
What a workload spends per token is a function of how expensive a wrong answer is to the use case. Personal assistants can run on cheap, fast models because mistakes only impact individual users and are quickly corrected. Back-office workflows pay for stronger reasoning because errors can trigger legal, financial, or operational risks that outweigh the per-call savings. The per-token economics are a stake map: applications spend more per token when mistakes cost more.
The same pattern holds in a broader B2C/B2B split. B2C applications generate many low-cost calls, while B2B applications run fewer, more expensive ones. On a per-token basis, B2B costs roughly two times as much as B2C.
![Image 15: Paired horizontal bars for April 2026 of % tokens (pink) and % market cost (blue) by B2B classification. B2B 29.7% tokens, 40.7% cost. B2C 62.6% tokens, 43.2% cost. Unknown 7.7% tokens, 16.1% cost.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F6ENPtvllwGbfyGFYkspb2l%2Fbefca094faafb56ae34f6825222c8903%2Fimage.png&w=1920&q=75)![Image 16: Paired horizontal bars for April 2026 of % tokens (pink) and % market cost (blue) by B2B classification. B2B 29.7% tokens, 40.7% cost. B2C 62.6% tokens, 43.2% cost. Unknown 7.7% tokens, 16.1% cost.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F77NCrXol5EfodCkedqr0kA%2F8abc881bcf7361ed7d28805e4ec1781d%2Fimage.png&w=1920&q=75)![Image 17: Paired horizontal bars for April 2026 of % tokens (pink) and % market cost (blue) by B2B classification. B2B 29.7% tokens, 40.7% cost. B2C 62.6% tokens, 43.2% cost. Unknown 7.7% tokens, 16.1% cost.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F7uR4YVaekJbEK4YZGqECaV%2F385658dc2b9fda8604ebaf048de9ce6c%2Fimage.png&w=1920&q=75)![Image 18: Paired horizontal bars for April 2026 of % tokens (pink) and % market cost (blue) by B2B classification. B2B 29.7% tokens, 40.7% cost. B2C 62.6% tokens, 43.2% cost. Unknown 7.7% tokens, 16.1% cost.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F5mpraUzJ0RLQt5uZirAdWd%2Fb330e37e4ae23494a0f0384f6a15a684%2Fimage.png&w=1920&q=75)
B2C drives volume while B2B drives spend.
## [Link to heading](https://vercel.com/blog/ai-gateway-production-index#no-single-provider-wins-across-use-cases)No single provider wins across use cases
Cutting the data by use case shows a fragmented provider landscape:
*   Anthropic notably leads in software building
*   Google over-indexes in consumer
*   OpenAI is the most evenly distributed
*   xAI and others are split across coding, consumer, and long-tail use cases
![Image 19: Stacked bars of market cost share by lab within each use case (April 2026). Back Office 87% Anthropic. Building 55% Anthropic, 6% OpenAI, 31% other. Outreach 36% Anthropic, 28% OpenAI. Consumer 26% Anthropic, 18% OpenAI, 15% Google, 35% other.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F34TwBXkvBV2EIFDFfoLHT1%2F56551da0ff29f7e15188f27a4ec4fe83%2Fimage.png&w=1920&q=75)![Image 20: Stacked bars of market cost share by lab within each use case (April 2026). Back Office 87% Anthropic. Building 55% Anthropic, 6% OpenAI, 31% other. Outreach 36% Anthropic, 28% OpenAI. Consumer 26% Anthropic, 18% OpenAI, 15% Google, 35% other.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F5vHBQsngPjvesHsrdsQUBu%2F5519f8d19eb21b02739fb79a535733b5%2Fimage.png&w=1920&q=75)![Image 21: Stacked bars of market cost share by lab within each use case (April 2026). Back Office 87% Anthropic. Building 55% Anthropic, 6% OpenAI, 31% other. Outreach 36% Anthropic, 28% OpenAI. Consumer 26% Anthropic, 18% OpenAI, 15% Google, 35% other.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F3DWnG2vWPtBvphRJrRLWoV%2F2a00488306b5f4ad41510c50cd1e4fcb%2Fimage.png&w=1920&q=75)![Image 22: Stacked bars of market cost share by lab within each use case (April 2026). Back Office 87% Anthropic. Building 55% Anthropic, 6% OpenAI, 31% other. Outreach 36% Anthropic, 28% OpenAI. Consumer 26% Anthropic, 18% OpenAI, 15% Google, 35% other.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F3TAbCzLn9IENxW51ZO8FEU%2F6410b4fab243a7eb486ab31b423b3390%2Fimage.png&w=1920&q=75)
Anthropic carries cost share through three of the four categories.
Anthropic's pattern is concentration at the high-stakes layer. As the workload moves from back office to consumer, Anthropic's token share drops from 71% down to 7%. Its cost share follows a much shallower curve and keeps the lead through three of the four categories. The revenue concentrates wherever the answer has to be right, regardless of how much volume passes through.
Google is the inverse shape. Its footprint concentrates in consumer, where Gemini Flash carries 28% of tokens at 15% of cost, and barely appears on the cost chart outside it. The position is a single-SKU bet that rises and falls with Flash adoption.
xAI is a price wedge. [Grok](https://vercel.com/ai-gateway/models/grok-4.3) carries 20% of building tokens and 18% of outreach tokens at materially smaller cost shares in each. xAI wins on price-to-quality fit, and whoever matches the price closes the wedge.
OpenAI is the most balanced of the four at 6% of building cost, 18% of consumer cost, and 28% of outreach cost. No single layer is load-bearing for OpenAI's overall share, which makes the company the least exposed of the four to disruption in any one layer.
Open-weights families like [Kimi](https://vercel.com/ai-gateway/models/kimi-k2.6), [MiniMax](https://vercel.com/ai-gateway/models/minimax-m2.7), and [GLM](https://vercel.com/ai-gateway/models/glm-5.1) rotate through the consumer and building tiers where the cost ceiling is lowest. Their cost share stays small, and their token share inside consumer and building is large enough that any cost-only view of the market understates them.
![Image 23: Stacked bars of token share by lab within each use case (April 2026). Back Office 71% Anthropic, 11% Google. Building 33% Anthropic, 20% xAI, 10% MiniMax. Outreach 22% OpenAI, 18% xAI, 17% Anthropic. Consumer 28% Google, 15% OpenAI, 7% Anthropic.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F7n8OfZAVObgyPk7Q3x49Ns%2Fd090ae1ed769760220ca60fb87e96379%2Fimage.png&w=1920&q=75)![Image 24: Stacked bars of token share by lab within each use case (April 2026). Back Office 71% Anthropic, 11% Google. Building 33% Anthropic, 20% xAI, 10% MiniMax. Outreach 22% OpenAI, 18% xAI, 17% Anthropic. Consumer 28% Google, 15% OpenAI, 7% Anthropic.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F5INxzO3FQlTEu1RGBhhdhp%2F052555cbb6b7259a2d7f560a25e8af0d%2Fimage.png&w=1920&q=75)![Image 25: Stacked bars of token share by lab within each use case (April 2026). Back Office 71% Anthropic, 11% Google. Building 33% Anthropic, 20% xAI, 10% MiniMax. Outreach 22% OpenAI, 18% xAI, 17% Anthropic. Consumer 28% Google, 15% OpenAI, 7% Anthropic.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F44Te4sQu9wteTNl46aKwTY%2F533f9c30c51bcd8179e7130bb8b9ff14%2Fimage.png&w=1920&q=75)![Image 26: Stacked bars of token share by lab within each use case (April 2026). Back Office 71% Anthropic, 11% Google. Building 33% Anthropic, 20% xAI, 10% MiniMax. Outreach 22% OpenAI, 18% xAI, 17% Anthropic. Consumer 28% Google, 15% OpenAI, 7% Anthropic.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2FgTitIs6BZfeO7EMcKgRDo%2F6aa0a595cd3cd207a80cad515f3cfdf0%2Fimage.png&w=1920&q=75)
Token share spreads more evenly across labs than cost share does.
There is no single dominant provider across the whole market because there is no single dominant use case. The right question is not "Who is winning AI?", it is "Which models are winning the use case I care about?" The labs that look closest to even on a blended chart are competing for different layers of the same stack.
## [Link to heading](https://vercel.com/blog/ai-gateway-production-index#apps-are-becoming-more-agentic)Apps are becoming more agentic
The shape of production AI requests has changed underneath all of this. In April 2026, 22.2% of AI Gateway requests ended with a tool call, up from 11.4% in October 2025. Measured by tokens, the shift is bigger. 58.9% of all tokens are now in tool-call requests, up from 31.6% six months ago.
![Image 27: Line chart Oct 2025 to Apr 2026, two lines. Pink (tool-call % of tokens) rises from 31.6% to 58.9% with a sharp jump after Jan. Blue (tool-call % of requests) rises from 11.4% to 22.2% more gradually. Gap between the two widens.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F4XfIeXqnSzoedkxG9DyKfn%2F8e51a548d40db406c39111b4f37ae233%2Fimage.png&w=1920&q=75)![Image 28: Line chart Oct 2025 to Apr 2026, two lines. Pink (tool-call % of tokens) rises from 31.6% to 58.9% with a sharp jump after Jan. Blue (tool-call % of requests) rises from 11.4% to 22.2% more gradually. Gap between the two widens.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2FPuN0LVpQp6Z1IghuLDv1U%2Fdcc15123a35c36c1e6e84b1a0c33f046%2Fimage.png&w=1920&q=75)![Image 29: Line chart Oct 2025 to Apr 2026, two lines. Pink (tool-call % of tokens) rises from 31.6% to 58.9% with a sharp jump after Jan. Blue (tool-call % of requests) rises from 11.4% to 22.2% more gradually. Gap between the two widens.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F3ZK1tNHrsrdwgxoPLBPlgs%2F41a092222c3bd12d79e6e847e0d9b495%2Fimage.png&w=1920&q=75)![Image 30: Line chart Oct 2025 to Apr 2026, two lines. Pink (tool-call % of tokens) rises from 31.6% to 58.9% with a sharp jump after Jan. Blue (tool-call % of requests) rises from 11.4% to 22.2% more gradually. Gap between the two widens.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F1XDOB0NdY4HTHhzRWwonwC%2F45e37969f8a54621fdd1a3da38084697%2Fimage.png&w=1920&q=75)
Tool-using requests carry far more tokens than their share of requests would suggest.
By both measures the agentic share roughly doubled in half a year, but the more telling number is the gap between the two shares. 22.2% of requests carry 58.9% of tokens, which means tool-using requests are about 2.6× more token-heavy than the rest. The cost surface of AI has shifted from chat-shaped to agent-shaped, while headline request counts barely budged.
Every kind of round trip bills against the same meter, whether it's a function execution, an API call, a database query, or a code run, so an agent shipping ten tool calls bills roughly ten times the tokens a chat would. Where a chat bills one round trip per prompt, an agent bills a chain.
## [Link to heading](https://vercel.com/blog/ai-gateway-production-index#leaderboards-rank-one-model,-but-production-teams-use-35+-at-scale)Leaderboards rank one model, but production teams use 35+ at scale
At scale, multi-model stops being a choice and becomes standard agent architecture.
![Image 31: Vertical bars of avg distinct models per team (April 2026) by monthly request bucket. <100=0, 100-1K=1, 1K-10K=3, 10K-100K=5, 100K-1M=8, 1M-10M=18, 10M+=35. "Regular use" means a model received 100+ requests from the team in April.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F6C6arJIb65cLhnmyq78kdv%2F4d569fd4fe86106339880ab4f897a55c%2Fimage.png&w=1920&q=75)![Image 32: Vertical bars of avg distinct models per team (April 2026) by monthly request bucket. <100=0, 100-1K=1, 1K-10K=3, 10K-100K=5, 100K-1M=8, 1M-10M=18, 10M+=35. "Regular use" means a model received 100+ requests from the team in April.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F54cB0Lb7xnvdjgLOsuafJ4%2F88af9df5ad5e6d4e472952827b32e054%2Fimage.png&w=1920&q=75)![Image 33: Vertical bars of avg distinct models per team (April 2026) by monthly request bucket. <100=0, 100-1K=1, 1K-10K=3, 10K-100K=5, 100K-1M=8, 1M-10M=18, 10M+=35. "Regular use" means a model received 100+ requests from the team in April.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F5B6CXDUfwImQ4MShO75Z06%2F1971276e986ea70efb88b5e2fac556f5%2Fimage.png&w=1920&q=75)![Image 34: Vertical bars of avg distinct models per team (April 2026) by monthly request bucket. <100=0, 100-1K=1, 1K-10K=3, 10K-100K=5, 100K-1M=8, 1M-10M=18, 10M+=35. "Regular use" means a model received 100+ requests from the team in April.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F5KiOmi5itJp0Cgj164DGsk%2F87872ba608d07a3d44b4557ba09f2639%2Fimage.png&w=1920&q=75)
Teams at 10M+ requests average 35 models, up from 18 in the next bucket down.
Teams running 1K to 10K requests averaged 3 distinct models. By the 10M+ requests bucket, the average is 35 models in regular use. The jump from 18 models in the 1M to 10M bucket to 35 in the 10M+ bucket is the inflection point.
A 35-model fleet runs as a routing graph, with a cheap classifier for intent detection, a frontier model for the reasoning step, an embedding model for retrieval, a fast model for summarization, and a vision model for screenshots. Every one of those models is swappable. If a provider raises prices, degrades quality, or has an outage, traffic redistributes across the rest in hours. At the scale that produces most of the spend on the leaderboards, switching between labs is closer to a config change than to a vendor migration, and the standard story about lab lock-in inverts the higher you go on the request-volume curve.
## [Link to heading](https://vercel.com/blog/ai-gateway-production-index#new-models-are-adopted-rapidly)New models are adopted rapidly
The same fleet design explains how fast new releases get absorbed. When a new version ships inside a model family, traffic moves to it within weeks.
![Image 35: Stacked bars of Claude Sonnet family token share at Oct 2025, Jan 2026, Apr 2026. Versions 3.7 (pink), 4 (dark blue), 4.5 (teal), 4.6 (light blue). Oct splits across 3.7, 4, 4.5. Jan mostly 4.5. By Apr, 4.6 dominates with predecessors at small slivers.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F7r8tvw5zgAyoWjurGT1fkO%2F4919b77a7a7ee1ceee0851fe9f7f5139%2Fimage.png&w=1920&q=75)![Image 36: Stacked bars of Claude Sonnet family token share at Oct 2025, Jan 2026, Apr 2026. Versions 3.7 (pink), 4 (dark blue), 4.5 (teal), 4.6 (light blue). Oct splits across 3.7, 4, 4.5. Jan mostly 4.5. By Apr, 4.6 dominates with predecessors at small slivers.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F2doGLPUWG3OSlmRI6guGGx%2F64575f71d5fb67ea1046e8c267a2a9e5%2Fimage.png&w=1920&q=75)![Image 37: Stacked bars of Claude Sonnet family token share at Oct 2025, Jan 2026, Apr 2026. Versions 3.7 (pink), 4 (dark blue), 4.5 (teal), 4.6 (light blue). Oct splits across 3.7, 4, 4.5. Jan mostly 4.5. By Apr, 4.6 dominates with predecessors at small slivers.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F793uTYf33SeGYmC8SHoQP6%2Fec89c5b7051c659efcd7cba67f228603%2Fimage.png&w=1920&q=75)![Image 38: Stacked bars of Claude Sonnet family token share at Oct 2025, Jan 2026, Apr 2026. Versions 3.7 (pink), 4 (dark blue), 4.5 (teal), 4.6 (light blue). Oct splits across 3.7, 4, 4.5. Jan mostly 4.5. By Apr, 4.6 dominates with predecessors at small slivers.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F6mq3SjpCZe9QTBu0Xe1631%2F96dcfcb9f5222aacdf37c7e8f5e5af32%2Fimage.png&w=1920&q=75)
Sonnet 4.6 absorbed most of the Sonnet family's traffic within its first full month.
[Claude Sonnet 4.6](https://vercel.com/ai-gateway/models/claude-sonnet-4.6) absorbed most of the Sonnet family's share by its first full month after launch.
![Image 39: Stacked bars of Claude Opus family token share at Oct 2025, Jan 2026, Apr 2026. Versions 4 (pink), 4.1 (dark blue), 4.5 (teal), 4.6 (light blue), 4.7 (purple). Oct mostly 4.1. Jan mostly 4.5. By Apr, 4.6 dominates with 4.7 near a quarter.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F4LCOeT3PJzp0aGxSl3WYda%2F387068f152eda76ad8c73ace82d369ea%2Fimage.png&w=1920&q=75)![Image 40: Stacked bars of Claude Opus family token share at Oct 2025, Jan 2026, Apr 2026. Versions 4 (pink), 4.1 (dark blue), 4.5 (teal), 4.6 (light blue), 4.7 (purple). Oct mostly 4.1. Jan mostly 4.5. By Apr, 4.6 dominates with 4.7 near a quarter.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F5DwAXxSCrowuPLQsccMTil%2F259682e621e1366a5ad793bbb7fef089%2Fimage.png&w=1920&q=75)![Image 41: Stacked bars of Claude Opus family token share at Oct 2025, Jan 2026, Apr 2026. Versions 4 (pink), 4.1 (dark blue), 4.5 (teal), 4.6 (light blue), 4.7 (purple). Oct mostly 4.1. Jan mostly 4.5. By Apr, 4.6 dominates with 4.7 near a quarter.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F1xee7ENEmpjzgxOV557YYG%2Fd18d7959a56f00764d1171014f968c60%2Fimage.png&w=1920&q=75)![Image 42: Stacked bars of Claude Opus family token share at Oct 2025, Jan 2026, Apr 2026. Versions 4 (pink), 4.1 (dark blue), 4.5 (teal), 4.6 (light blue), 4.7 (purple). Oct mostly 4.1. Jan mostly 4.5. By Apr, 4.6 dominates with 4.7 near a quarter.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F42aTd7aqDr4F2CIbRvS6Ad%2F26699af217260881346b38b463f6aacd%2Fimage.png&w=1920&q=75)
Opus 4.7 is taking share from Opus 4.6 on the same curve.
The Opus family is moving through the same shape now, with [Claude Opus 4.7](https://vercel.com/ai-gateway/models/claude-opus-4.7) taking share from Opus 4.6 on a near-identical curve.
Predecessor models stayed live and routable on AI Gateway throughout both windows, but teams moved anyway. The migration is a config change, and the labs no longer set the upgrade timeline of their own product lines.
## [Link to heading](https://vercel.com/blog/ai-gateway-production-index#provider-outages-have-a-hidden-cost)Provider outages have a hidden cost
Roughly 3.5% of requests on AI Gateway complete after a fallback. That means the initial route hit an error, a rate limit, or a timeout, and the gateway reissued the request to a healthy alternative fast enough that the user still got a successful response.
![Image 43: Horizontal bars of AI Gateway fallback rescue share through April 2026, by metric. Of all requests, 3.5% rescued by fallback. Of all tokens, 5.1% rescued. Of all market cost, 4.9% rescued. Remainder succeeded on first try.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F5yjQvS6FPJgAnzGrSvFKGH%2F6be19438d460cf8edf420754af9a2bec%2Fimage.png&w=1920&q=75)![Image 44: Horizontal bars of AI Gateway fallback rescue share through April 2026, by metric. Of all requests, 3.5% rescued by fallback. Of all tokens, 5.1% rescued. Of all market cost, 4.9% rescued. Remainder succeeded on first try.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F1pe3PMhStqkvknj8ZTxk45%2F13c94ff8d0d9e1268b038ec12ae0b0ab%2Fimage.png&w=1920&q=75)![Image 45: Horizontal bars of AI Gateway fallback rescue share through April 2026, by metric. Of all requests, 3.5% rescued by fallback. Of all tokens, 5.1% rescued. Of all market cost, 4.9% rescued. Remainder succeeded on first try.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F4uBQrrZSk4wiBQi5tA7QK4%2Fce74945d8d46b208b2a60474bdea4e82%2Fimage.png&w=1920&q=75)![Image 46: Horizontal bars of AI Gateway fallback rescue share through April 2026, by metric. Of all requests, 3.5% rescued by fallback. Of all tokens, 5.1% rescued. Of all market cost, 4.9% rescued. Remainder succeeded on first try.](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F7KvANbwiavquRDPdkEeZmX%2F0031a2ecb4b7c750040213fa7aa86963%2Fimage.png&w=1920&q=75)
The cost-weighted rescue rate runs higher than the request-weighted rate.
Measured in tokens the rescue rate runs at 5.1%, and in dollars at 4.9%. The token-weighted and cost-weighted rates run higher than the request-weighted rate because the requests that get rescued are, on average, bigger and more expensive than the ones that don't. Long context windows hit rate limits more often than short ones, multi-step agent runs accumulate failure across steps, and heavy reasoning calls time out under sustained load. Each of those failure modes targets the expensive end of the workload, which is why the dollar rate sits higher than the request rate.
A provider's SLA measures request-level uptime, but a production application experiences cost-weighted uptime, and the two come apart on exactly the calls that paid for the model.
## [Link to heading](https://vercel.com/blog/ai-gateway-production-index#conclusion:-build-for-workload,-not-the-lab)Conclusion: Build for workload, not the lab
Production workloads are designed for efficiency, reliability, and flexibility, not to match the latest model leaderboards.
Across six cuts of the same data, the shape underneath stays the same. Different labs win different layers of the same applications, and the architecture that handles those layers is the one production teams at scale have already built for.
This echoes the early cloud era. Teams expanded compute first (more instances, regions, redundancy) and squeezed per-unit cost later. The 35-model fleets visible at the top of the spend curve are the same patter at a faster cadence; the optimization that follows happens at the routing layer.
For anyone shipping AI today:
*   Plan for multiple models across providers
*   Assume the need for fallbacks to optimize for uptime and cost
*   Design routing as a core unit of architecture from the beginning
We expect to revisit this data on a recurring cadence as the patterns shift. Live model rankings are available on the [AI Gateway Leaderboards](https://vercel.com/ai-gateway/leaderboards).
### [Link to heading](https://vercel.com/blog/ai-gateway-production-index#about-this-data)About this data
This analysis is based on anonymized, aggregate routing data from the Vercel AI Gateway through April 2026.
A few notes on measurement:
*   _Spend_ uses market-rate pricing (published list price) to provide a normalized view across teams that bring their own API keys.
*   _Volume_ counts tokens routed through AI Gateway.
*   _B2C_, _B2B_, and _use-case_ classifications are aggregate. No individual team or workload is identified.
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
[AI SDK The AI Toolkit for TypeScript](https://vercel.com/ai-sdk)
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