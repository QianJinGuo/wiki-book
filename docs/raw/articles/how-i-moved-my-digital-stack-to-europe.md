---
title: "How I Moved My Digital Stack to Europe"
sha256: 50dcc4442940621ceadf5147eece2ecbee048a3fc7d92cbf4bcb5535a1c21333
source: newsletter
source_url: "https://monokai.com/articles/how-i-moved-my-digital-stack-to-europe/"
url: "https://monokai.com/articles/how-i-moved-my-digital-stack-to-europe/"
fetcher: jina
review_value: 7
review_confidence: 9
review_recommendation: worth-reading
review_stars: 3
ingested: 2026-05-14
created: 2026-05-14
updated: 2026-05-14
---
Published Time: Wed, 29 Apr 2026 12:28:35 GMT
Markdown Content:
# How I Moved My Digital Stack to Europe — Monokai
*   [home](https://monokai.com/)
*   [artworks](https://monokai.com/artworks/)
*   [photos](https://monokai.com/photos/)
*   [about](https://monokai.com/about/)
# How I Moved My Digital Stack to Europe
## On digital sovereignty, and why European cloud is better than you think
April 29, 2026 10 min.Digital Sovereignty Digital Infrastructure Digital Autonomy European Cloud Europe
![Image 1: 100% accurate European digital infrastructure, AI generated](https://monokai.com/_app/immutable/assets/ybUIHW7N050SVyt9.avif)
100% accurate European digital infrastructure, AI generated
There’s a version of this post that starts with a spreadsheet and ends with a quiet sense of satisfaction. That’s mostly how it went. But underneath the practical exercise of swapping one SaaS tool for another was something that felt more urgent, a growing discomfort with how much of my digital infrastructure sat on servers I didn’t control, in a jurisdiction increasingly prone to unpredictability, operated by companies whose incentives don’t always align with mine.
**Digital sovereignty** sounds like a buzzword until you think carefully about what it means. It means knowing where your data lives. It means not being one policy change, one acquisition, or one executive’s bad mood away from losing access to tools your business depends on. It means choosing infrastructure based on values, not just convenience.
So I started migrating.
* * *
## Analytics
[![Image 2: Google Analytics](https://monokai.com/_app/immutable/assets/google-analytics-logo-FKDexzBR9rsV.svg) Google Analytics](https://analytics.google.com/)
[![Image 3: Matomo](https://monokai.com/_app/immutable/assets/matomo-icon-tKdy8WtrR9Tr.svg) Matomo](https://matomo.org/)
Google Analytics was the obvious first target. It’s the canonical example of a service that’s free because _you_ are the product, your visitors’ behavior funneled back into Google’s advertising machinery.
Self-hosting [Matomo](https://matomo.org/) solved this cleanly. The data stays on my own server I had to instantiate a new small server for this, which is cheap, but not free., and I’m fully GDPR-compliant without the cookie consent theater that Google Analytics typically requires. The reporting is comprehensive, the interface is familiar enough, and I own everything.
The main downside is maintenance overhead. You’re now responsible for updates, backups, and keeping the server healthy. For most setups this is low-friction, but it’s not zero friction.
* * *
## Email
[![Image 4: Google Workspace](https://monokai.com/_app/immutable/assets/google-workspace-logo-xR96p7NE5_er.svg) Google Workspace](https://workspace.google.com/)
[![Image 5: Proton Mail](https://monokai.com/_app/immutable/assets/protonmail-icon-FYbyxt_Vjgj8.svg) Proton Mail](https://proton.me/mail)
[Proton Mail](https://proton.me/) is based in Switzerland, not EU territory, but Swiss privacy law is closely aligned with GDPR and arguably stronger in some respects. Proton builds its business model around privacy rather than advertising, and end-to-end encryption is baked in at the protocol level rather than bolted on. The email client is solid, the calendar works well, and for anyone moving away from US-based services, it sits comfortably in the same spirit as the rest of this stack.
One adjustment is getting used to Proton’s filter system, which is a bit more limited than Gmail’s. Gmail lets you write filters against virtually anything, including the full body of the message. Proton doesn’t support filtering on email content at all. So if you’ve built a workflow around catching specific phrases or keywords in message bodies, you’ll have to rethink it. For most people this won’t be a dealbreaker, but it’s worth knowing before you migrate.
There’s also a practical limitation worth flagging: Proton caps custom domains at three, even on the Duo plan. If you run several domains, like separate addresses for different projects or businesses, you’ll hit that ceiling quickly and need to rethink how you route and send mail. I ended up consolidating, which was probably overdue anyway, but it wasn’t a choice I made entirely freely.
Proton isn’t free and charges a substantial fee compared to other options. You’ll get access to a whole suite of Proton apps though.
* * *
## Password Management
[![Image 6: 1Password](https://monokai.com/_app/immutable/assets/1password-logo-KJpJWA4XBE9P.svg) 1Password](https://1password.com/)
[![Image 7: Proton Pass](https://monokai.com/_app/immutable/assets/protonpass-icon-3bwxor8QCrBR.svg) Proton Pass](https://proton.me/pass)
Once I was in the Proton ecosystem, moving password management there as well made sense. [Proton Pass](https://proton.me/pass) is end-to-end encrypted, open source, and benefits from the same Swiss jurisdiction as the rest of Proton’s stack.
1Password is a genuinely great product and this was a lateral move more than an upgrade. The interface is simple, the browser extension works reliably, and having passwords, email, and calendar under one encrypted roof has a certain satisfying coherence to it.
* * *
## Compute
[![Image 8: DigitalOcean](https://monokai.com/_app/immutable/assets/digitalocean-logo-o4FFTSLwDEY6.svg) DigitalOcean](https://www.digitalocean.com/)
[![Image 9: Scaleway](https://monokai.com/_app/immutable/assets/scaleway-icon-aHWTFq8mCBhE.svg) Scaleway](https://www.scaleway.com/)
DigitalOcean has earned its reputation by doing one thing exceptionally well: getting out of your way. The UI is clean, the mental model is simple, and spinning up infrastructure never feels like a chore. It’s the platform that proved developer experience could be a competitive moat.
[Scaleway](https://www.scaleway.com/) was a pleasant surprise. I expected a capable-but-rough European alternative, but what I found was a platform that’s genuinely well thought out. Servers spun up quickly inside a private network of my own configuration, the control panel is clean, and the options available matched everything I actually needed. Scaleway displays projected CO₂ emissions This actually made me host most of my infrastructure in Paris, where Compute consumes the least energy. alongside server location choices, a nice touch.
* * *
## Object Storage
[![Image 10: Amazon Web Services](https://monokai.com/_app/immutable/assets/aws-logo-1esm-UzSZzIa.svg) Amazon Web Services](https://aws.amazon.com/s3)
[![Image 11: Scaleway](https://monokai.com/_app/immutable/assets/scaleway-icon-aHWTFq8mCBhE.svg) Scaleway](https://www.scaleway.com/en/object-storage)
Scaleway’s object storage is S3-compatible, which makes migration mechanical rather than painful, update your endpoint and credentials and existing code works unchanged.
I used a tool called [rclone](https://rclone.org/) to sync my old AWS S3 storage buckets to the new Scaleway S3 buckets. This took a little more than a week of constant syncing, as these buckets were quite large.
* * *
## Offsite Backups
[![Image 12: Backblaze](https://monokai.com/_app/immutable/assets/backblaze-logo-vONbDJU3DYJ1.svg) Backblaze](https://www.backblaze.com/cloud-storage)
[![Image 13: OVHcloud](https://monokai.com/_app/immutable/assets/ovhcloud-icon-RoaTtaVoGl29.svg) OVHcloud](https://www.ovhcloud.com/en/public-cloud/object-storage)
[OVH](https://www.ovhcloud.com/) is the largest European cloud provider and brings the reliability and pricing you’d expect at that scale. Their object storage works well as a backup destination and ends up cheaper than Backblaze B2 once you configure lifecycle rules to move older backups to the cold storage class.
Getting there, however, requires some patience. The OVHcloud control panel is a labyrinth: the lifecycle rule configuration is buried somewhere in the documentation, and it involves some work in the terminal. Once it’s set up, it works reliably and the cost difference is meaningful.
* * *
## Transactional Emails
[![Image 14: Twilio SendGrid](https://monokai.com/_app/immutable/assets/twilio-icon-ExwdWDZDCRBk.svg) Twilio SendGrid](https://sendgrid.com/)
[![Image 15: Lettermint](https://monokai.com/_app/immutable/assets/lettermint-icon-OdwysHQgN8M0.svg) Lettermint](https://lettermint.co/)
[Lettermint](https://lettermint.co/) is a European transactional email service that does the job without the bloat. Deliverability is solid, the API is clean, and it has straightforward pricing I cut some costs with this move, as I had two separate SendGrid accounts which I could now merge into one..
Compared to SendGrid, the analytics are leaner and the ecosystem integrations are fewer. SendGrid has years of tooling, documentation, and community answers behind it. Lettermint is newer and smaller. For most transactional sending use cases (password resets, notifications, receipts) that doesn’t matter much. But if you’re doing complex multi-stream email infrastructure, you’ll want to audit the feature set carefully first.
* * *
## Error Tracking
[![Image 16: Sentry](https://monokai.com/_app/immutable/assets/sentry-logo--WYSkTsTCrcb.svg) Sentry](https://sentry.io/)
[![Image 17: Bugsink](https://monokai.com/_app/immutable/assets/ladybug-lUNzz697DfAG.svg) Bugsink](https://www.bugsink.com/)
[Bugsink](https://www.bugsink.com/) is a self-hosted error tracking tool that accepts Sentry’s SDK, which means the migration path is almost frictionless, change one line of configuration and you’re done.
To be honest: Bugsink is bare-bones. There’s no performance monitoring, no session replays, no advanced alerting. It’s not a Sentry replacement for teams that use Sentry properly. For me, it’s a simple remote error log, when something breaks in production I get a stack trace and that’s enough. Sentry’s cloud product is genuinely excellent if you need the full feature set, and for larger engineering teams the breadth almost certainly justifies the cost. But if your use case is “tell me when something broke and show me the stack trace”, self-hosted Bugsink does exactly that with no data leaving your infrastructure.
* * *
## AI API integration
[![Image 18: OpenAI](https://monokai.com/_app/immutable/assets/openai-icon-gvv5PLbQChN4.svg) OpenAI](https://openai.com/)
[![Image 19: Mistral](https://monokai.com/_app/immutable/assets/mistral-icon-cuD5xPMfDvHh.svg) Mistral](https://mistral.ai/)
For my AI API integrations, I switched from OpenAI to Mistral. It worked out perfectly as I was mostly using simpler models anyway.
[Mistral](https://mistral.ai/) is headquartered in Paris and has published compelling open-weight models alongside its API offering. The API is clean, the models are fast and capable, and there’s something coherent about a European AI provider that leans into openness rather than away from it. For my inference workloads, the switch was lateral in quality and meaningfully better in terms of where the money goes.
* * *
## CDN
### Exception № 1
[![Image 20: Cloudflare](https://monokai.com/_app/immutable/assets/cloudflare-icon-CN5aymLRD1em.svg) Cloudflare](https://www.cloudflare.com/)
Not everything moved. [Cloudflare](https://www.cloudflare.com/) is a US company, I still use it, and I’m at peace with that.
Here’s the reasoning: Cloudflare sits in front of my public-facing websites. Its job is to cache, protect against DDoS attacks, and make content load fast for visitors around the world. The data flowing through it is already public by definition. I’m not routing private communications or sensitive application data through Cloudflare; I’m using it to serve pages that anyone on the internet can read. The sovereignty calculus is different when the thing you’re protecting is already public.
I did try [Bunny CDN](https://bunny.net/), which is European-based and has a great reputation. For straightforward CDN use it’s excellent. But Cloudflare’s feature set (security rules, Workers platform, breadth of configuration options) wasn’t matched closely enough to justify the switch for my specific needs. Sometimes the pragmatic answer wins.
* * *
## Payments
### Exception № 2
[![Image 21: Stripe](https://monokai.com/_app/immutable/assets/stripe-icon-tDjfcVZYCZyW.svg) Stripe](https://stripe.com/)
[![Image 22: Mollie](https://monokai.com/_app/immutable/assets/mollie-logo-_BNyxfn3DgYz.svg) Mollie](https://www.mollie.com/)
Stripe is one of the few services I haven’t moved yet, even though payment infrastructure is exactly the kind of thing I care about having in a jurisdiction I trust. [Mollie](https://www.mollie.com/) is a Dutch payment processor with full EU incorporation, strong GDPR compliance by design, and a product that has matured considerably in recent years. The API has converged toward parity for most common payment flows, and for a European business the regional payment method coverage (iDEAL, Bancontact, SEPA) is arguably better.
The migration is on the list. It’s just not a trivial one. Payment integrations touch billing logic, webhooks, tax invoicing and customer-facing flows in ways that require careful testing and a good moment to cut over. It’s also more expensive than Stripe for my usecase.
* * *
## AI Code assistance
### Exception № 3
[![Image 23: OpenAI](https://monokai.com/_app/immutable/assets/openai-icon-gvv5PLbQChN4.svg) OpenAI](https://openai.com/)
[![Image 24: Claude Code](https://monokai.com/_app/immutable/assets/claude-icon-ktYIGx7BQHVp.svg) Claude Code](https://claude.ai/code)
[![Image 25: Qwen](https://monokai.com/_app/immutable/assets/qwen-icon-d_V2jGbQC3Xj.svg) Qwen](https://qwen.ai/)
This one felt overdue. OpenAI works fine, but the company’s trajectory doesn’t align with my own views anymore. After a period of deliberate drift, I felt the need to switch. Ideally I wanted to use [Mistral Vibe](https://mistral.ai/products/vibe) here, but it just didn’t make the cut as it couldn’t compete with Claude.
[Claude Code](https://claude.ai/code) is now my day-to-day AI assistant for coding. The reasoning quality is strong, the context handling is genuinely impressive, and Anthropic’s approach to safety and transparency feels more structurally grounded.
Anthropic is a US company, so this doesn’t satisfy the jurisdictional criterion I applied elsewhere. But it satisfies something else, the sense that the organization building the thing has given serious thought to what it’s building and why.
It’s also worth noting that local models are becoming increasingly viable. [Qwen](https://qwen.ai/), Alibaba’s open-weight model family, is a strong example: capable enough for many real workloads, running entirely on your own hardware, with no data leaving your machine. The gap between frontier API models and what you can run locally is narrowing faster than most people realize.
Not everything is ideal. Most data centers still sit outside Europe, and “open” means different things to different organizations. But the direction is right. A world where capable AI runs on your own hardware, with published weights and transparent training, is a much better world for digital autonomy than one where all inference routes through a handful of closed API providers. We’re not there yet, but the trajectory is encouraging.
* * *
## Git Version Control
### Exception № 4
[![Image 26: GitHub](https://monokai.com/_app/immutable/assets/github-icon-c0iufmiue4Yw.svg) GitHub](https://github.com/)
[![Image 27: GitLab](https://monokai.com/_app/immutable/assets/gitlab-icon-nWL8SB1aDNFo.svg) GitLab](https://gitlab.com/)
[GitLab](https://gitlab.com/) also remains for now. GitLab is headquartered in the US but offers self-hosted options, and the company has long had a strong commitment to transparency and open source. A self-hosted instance is on the roadmap, but moving source control is a more significant undertaking than most of these migrations.
[GitHub](https://github.com/) stays in the picture for one specific purpose: public-facing [NPM packages](https://github.com/Monokai) and issue tracking for open source software. When you publish a package or maintain public tooling, GitHub is where developers expect to find it. The network effects are real, it’s where the forks, stars, and issue reports come from. For the public-facing surface of open source work, there’s no meaningful sovereignty concern and a lot of practical upside.
* * *
## Was it worth it?
The practical friction was real but manageable. Most migrations were an afternoon of work: update a credential here, point a DNS record there, export and import some data. A few took longer. None were catastrophic. All in all it took longer than expected, but most time was spent in researching and planning when to do what. Two months in, everything is running without incident. No fires, no regrets.
Digital sovereignty isn’t about paranoia. It’s about being conscious about your infrastructure, where you decide who holds your data, who can reach it, and what happens when politics shift. The tools are there. The ecosystem is mostly mature. The only thing that was stopping me was inertia. It’s entirely possible to run a reliable, capable, professional digital stack mostly from European infrastructure. This migration was proof of that.
## [Monoco — squircle shapes for HTML elements NPM package available for vanilla JavaScript, React and Svelte.](https://monokai.com/articles/monoco-squircle-shapes-for-html-elements/?back)
## [Monokai Pro: beautiful functionality for professional developers Creating the ideal coding environment in Sublime Text](https://monokai.com/articles/monokai-pro-beautiful-functionality-for-professional-developers/)
#### contact
For all enquiries:
[hello@monokai.com](mailto:hello@monokai.com?subject=Hi%20there)
#### content
*   [RSS feed](https://monokai.com/rss.xml)
*   [Articles](https://monokai.com/articles)
#### networks
*   [Monokai on Bluesky](https://bsky.app/profile/monokai.com)
*   [Monokai on Farcaster](https://farcaster.xyz/monokai)
*   [Monokai on X](https://x.com/monokai)
*   [Monokai on Instagram](https://www.instagram.com/monokai)
*   [Monokai on Flickr](https://www.flickr.com/photos/monokai/albums)
*   [Wimer Hazenberg on LinkedIn](https://www.linkedin.com/in/wimer)
#### copyright
© 2009 – 2026 Monokai
#### cursor
version 1.0.18, April 2026