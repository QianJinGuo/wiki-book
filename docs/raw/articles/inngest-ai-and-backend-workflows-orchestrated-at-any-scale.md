---
title: Inngest - AI and backend workflows, orchestrated at any scale
type: raw
tags: [inngest]
source: newsletter
source_url: https://www.inngest.com/
fetched: 2026-05-19
sha256: cc169a48dd6c3d321dd0a18c7da933502befa27bf9fd72f07ccab39e9b4cb724
review_value: 7
review_confidence: 8
review_recommendation: strong
---
# Inngest - AI and backend workflows, orchestrated at any scale
Markdown Content:
# AI and backend workflows, orchestrated at any scale
[What are the most confident teams using to build AI? →**2026 Benchmark Report**](https://www.inngest.com/content/ai-in-production-report-2026?ref=site-banner)
[Inngest](https://www.inngest.com/)
PLATFORM[CUSTOMERS](https://www.inngest.com/customers?ref=nav)RESOURCES[DOCS](https://www.inngest.com/docs?ref=nav)[PRICING](https://www.inngest.com/pricing?ref=nav)
Open Source 6.6 K
*   [inngest/inngest](https://github.com/inngest/inngest)
*   [inngest/inngest-js](https://github.com/inngest/inngest-js)
*   [inngest/inngest-py](https://github.com/inngest/inngest-py)
*   [inngest/inngestgo](https://github.com/inngest/inngestgo)
*   [inngest/inngest-kt](https://github.com/inngest/inngest-kt)
*   [inngest/agent-kit](https://github.com/inngest/agent-kit)
[Sign In](https://app.inngest.com/?ref=nav)[Sign up →](https://app.inngest.com/sign-up?ref=nav)
Open main menu
![Image 4: Draggable element](https://www.inngest.com/_next/image?url=%2Fassets%2Fdraggable%2Fdraggable.png&w=256&q=75)
 To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel. 
![Image 5: Draggable element](https://www.inngest.com/_next/image?url=%2Fassets%2Fdraggable%2Fdraggable2.png&w=256&q=75)
 To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel. 
![Image 6: Draggable element](https://www.inngest.com/_next/image?url=%2Fassets%2Fdraggable%2Fdraggable3.png&w=256&q=75)
 To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel. 
![Image 7: Draggable element](https://www.inngest.com/_next/image?url=%2Fassets%2Fdraggable%2Fdraggable4.png&w=256&q=75)
 To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel. 
![Image 8: Draggable element](https://www.inngest.com/_next/image?url=%2Fassets%2Fdraggable%2Fdraggable5.png&w=256&q=75)
 To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel. 
![Image 9: Draggable element](https://www.inngest.com/_next/image?url=%2Fassets%2Fdraggable%2Fdraggable6.png&w=256&q=75)
 To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel. 
![Image 10: Draggable element](https://www.inngest.com/_next/image?url=%2Fassets%2Fdraggable%2Fdraggable7.png&w=256&q=75)
 To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel. 
![Image 11: Draggable element](https://www.inngest.com/_next/image?url=%2Fassets%2Fdraggable%2Fdraggable8.png&w=256&q=75)
 To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel. 
# Make **any** code durable 
 by default
Workflows, agents, endpoints, background jobs—however it's written, wherever it runs—Inngest makes it unbreakable.
[Start building for free](https://app.inngest.com/sign-up?ref=homepage-hero)[Get a demo→](https://www.inngest.com/contact?ref=homepage-hero)
## Trusted in production at
![Image 12: Replit](https://www.inngest.com/assets/customers/replit-logo.svg)![Image 13: SoundCloud](https://www.inngest.com/assets/customers/soundcloud-logo-white-horizontal.svg)![Image 14: Cohere](https://www.inngest.com/assets/customers/cohere-logo-white.svg)![Image 15: TripAdvisor](https://www.inngest.com/assets/customers/tripadvisor.svg)![Image 16: Resend](https://www.inngest.com/assets/customers/resend.svg)![Image 17: Outtake](https://www.inngest.com/assets/customers/outtake/outtake-logo.svg)![Image 18: ElevenLabs](https://www.inngest.com/assets/customers/elevenlabs-logo-white.svg)![Image 19: Avoca](https://www.inngest.com/assets/customers/avoca-logo-white.svg)
# Ship products. 
 Not infrastructure.
You're here because whatever you're building needs to be reliable. We're here because we think you shouldn't have to wrangle workers, refactor code, or build instrumentation to make that true.
### Infraless
Your orchestration engine shouldn't dictate how you write production code. Wrap functions in Steps to automate retries, recovery, and flow without added infrastructure.`step.run` and done.
### Agnostic
Inngest was built for change. Run anywhere (edge, serverless, traditional), from any trigger (API calls, webhooks, schedules), on any code (agents, endpoints, cron).
### Observable
Focus on logic, not instrumentation. Data about your runs lives where runs happen. So you can query, cancel, or replay without grepping logs across systems.
# Start locally,
with your stack.
step.run step.ai step.sleep
`1234567891011121314`
```
// step.run is a code-level transaction:  it retries automatically
  // on failure and only runs once on success.
  const transcript = await step.run('transcribe-video',
    async () => deepgram.transcribe(event.data.videoUrl)
  )
  // function state is automatically managed for fault tolerance
  // across steps.
  const summary = await step.run('summarize-transcript',
    async () => llm.createCompletion({
      model: "gpt-4o",
      prompt: createSummaryPrompt(transcript),
    })
  )
```
Skip boilerplate code, and build with steps
Our SDKs provide simple building blocks and integrations with your favorite tools to let you focus on what matters the most: your product.
[Get Started](https://www.inngest.com/docs?ref=homepage-sdk)
## ONE-COMMAND INSTALL
Copy command
```
$ curl -sSfL https://cli.inngest.com/install.sh | sh
$ inngest dev
Inngest dev server running...
```
Debug fast with instant Traces
Structured logs and real-time traces – including every prompt / response pair – with one CLI command.
[Start using Traces](https://www.inngest.com/docs/platform/monitor/traces)
## INSTANT DEVELOPMENT ENVIRONMENT
# Ship anywhere
Run anywhere, on any code, from any trigger. Deploy to your favorite cloud provider in one click.
Deploy anywhere
Deploy Inngest workflows to your favorite cloud provider in one click
[Start Deploying](https://www.inngest.com/docs/platform/deployment?ref=homepage-deploy)
Automate retries, recovery, and flow
Inngest automatically retries on error, while ensuring efficient runs via throttling, batching, and prioritization. If something breaks, Inngest picks up where it left off.
[Learn about Error Handling](https://www.inngest.com/docs/guides/error-handling?ref=homepage-fault-tolerance)
Get deep observability without building it yourself
Get full visibility over our AI workflows, and Agents with live traces and metrics
[Learn about Observability](https://www.inngest.com/docs/platform/monitor/observability-metrics?ref=homepage-observability)
> "The DX and visibility with Inngest is really incredible. We are able to develop functions locally easier and faster that with our previous queue. Also, Inngest's tools give us the visibility to debug issues much quicker than before."
![Image 20](https://www.inngest.com/_next/image?url=%2Fassets%2Fhomepage-2025%2Fimage2.png&w=1920&q=75)![Image 21](https://www.inngest.com/_next/image?url=%2Fassets%2Fhomepage-2025%2Fimage.png&w=640&q=75)
![Image 22: Resend](https://www.inngest.com/assets/customers/resend.svg)
Bu Kinoshita
Co-founder
# Scale like the billions of workflows 
processed this month
Configure, manage, and monitor your workflows while our platform scales for your needs.
with Inngest without Inngest
# Flow control
Ensure that you all users get a great experience by dynamically allocating resources to your AI workflows with concurrency with keys, throttling and more
### Fairness
Ensure fair resource distribution and eliminate noisy-neighbor issues to scale efficiently as your user base grows
### Concurrency
### Priority
[Learn more](https://www.inngest.com/docs/guides/flow-control?ref=homepage)
# Recovery Tools
Quickly identify any issue with the Inngest Cloud alerting and metrics and rapidly act on thousands of runs with Replay, Bulk Cancellation.
### Replay
Recover from bugs or system issues by re-running failed workflows in bulk. Forget dead-letter queues.
### Bulk Cancellation
### Metrics
[Learn more](https://www.inngest.com/docs/platform/replay?ref=homepage)
## Built for trust.
Inngest provides enterprise-grade reliability and scalability for your most complex workflows, so your team can focus on building products, not managing infrastructure.
[Contact us](https://www.inngest.com/contact?ref=homepage-trust)
### SOC 2 COMPLIANT
Regular security audits and compliance with SOC 2 standards.[Read more here](https://www.inngest.com/docs/learn/security?ref=homepage-trust).
### E2E ENCRYPTION
Encrypt all data that passes through Inngest with end-to-end encryption middleware.
### SSO & SAML
Single sign-on and SAML support for enterprise customers.
### 100K+ EXECUTIONS PER SECOND
Designed for your heavy workloads with capacity for bursting.
### LOW LATENCY
Inngest is designed to be low latency for all functions.
### HIPAA BAA AVAILABLE
Ready to handle sensitive data.
## Trusted by software companies
at scale, worldwide.
![Image 23: Aomni](https://www.inngest.com/assets/customers/aomni-logo.svg)
David Zhang
Founder, Aomni
For anyone who is building multi-step AI agents, I highly recommend building it on top of Inngest, the traceability it provides is super useful, plus you get timeouts & retries for free.
[Read customer story](https://www.inngest.com/customers/aomni?ref=homepage-testimonials)
![Image 24: SoundCloud](https://www.inngest.com/assets/customers/soundcloud-logo-white-horizontal.svg)
Matthew Drooker
CTO, SoundCloud
Our context switching dropped significantly, because the code is just business logic. If you read the code, you know that the steps that will execute without having to manage any infrastructure.
[Read customer story](https://www.inngest.com/customers/soundcloud?ref=homepage-testimonials)
![Image 25: Otto](https://www.inngest.com/assets/customers/otto-logo.svg)
Sully Omar
Co-founder, CEO, Otto
Inngest completely transformed how we handle AI orchestration for us. Its intuitive DX, built-in multi-tenant concurrency, and flow control allowed us to scale without the complexity of other tools.
[Read customer story](https://www.inngest.com/customers/otto?ref=homepage-testimonials)
![Image 26: Gitbook](https://www.inngest.com/assets/customers/gitbook-logo-white.svg)
Johan Preynat
Engineering Lead, GitBook
When we read our code base, we can immediately understand what it is and what it does. We are going to be gradually migrating most features to Inngest.
[Read customer story](https://www.inngest.com/customers/gitbook?ref=homepage-testimonials)
## In the middle of chaos
Develop reliable AI products, every time
[Let's Talk](https://www.inngest.com/contact?ref=homepage-footer-cta)
[I'd rather look at the docs first](https://www.inngest.com/docs?ref=homepage-footer-cta)
### Platform
*   [AI & Agents](https://www.inngest.com/ai?ref=footer-links)
*   [Durable Workflows](https://www.inngest.com/uses/durable-workflows?ref=footer-links)
*   [Durable Endpoints](https://www.inngest.com/durable-endpoints?ref=footer-links)
*   [Platform](https://www.inngest.com/platform?ref=footer-links)
*   [Queueing](https://www.inngest.com/compare-to-legacy-queues?ref=footer-links)
*   [Workflow Engines](https://www.inngest.com/uses/workflow-engine?ref=footer-links)
*   [Background Jobs](https://www.inngest.com/uses/serverless-node-background-jobs?ref=footer-links)
*   [Scheduled and cron jobs](https://www.inngest.com/uses/serverless-cron-jobs?ref=homepage-footer-links)
### Explore
*   [Docs](https://www.inngest.com/docs?ref=footer-links)
*   [Inngest vs. Traditional Queues](https://www.inngest.com/compare-to-legacy-queues?ref=footer-links)
*   [Inngest vs. Kafka](https://www.inngest.com/blog/simplifying-queues-modern-kafka-alternative?ref=footer-links)
*   [Inngest vs. Temporal](https://www.inngest.com/compare-to-temporal?ref=footer-links)
*   [Solving for Next.js Timeouts](https://www.inngest.com/blog/how-to-solve-nextjs-timeouts?ref=footer-links)
### Company
*   [Blog](https://www.inngest.com/blog?ref=footer-links)
*   [Changelog](https://www.inngest.com/changelog?ref=footer-links)
*   [Roadmap](https://roadmap.inngest.com/roadmap?ref=footer-links)
*   [About](https://www.inngest.com/about?ref=footer-links)
*   [Careers](https://www.inngest.com/careers?ref=footer-links)
### Community
*   [Discord](https://www.inngest.com/discord?ref=footer-links)
*   [GitHub](https://github.com/inngest/inngest)
*   [X.com](https://x.com/inngest)
*   [Bluesky](https://bsky.app/profile/inngest.com)
[All systems operational](https://status.inngest.com/ "Status updated at Mon May 18 2026 21:23:32 GMT+0000 (Coordinated Universal Time)")
© 2026 Inngest Inc. All rights reserved.
[Privacy Policy](https://www.inngest.com/privacy?ref=footer-links)
|
[Terms](https://www.inngest.com/terms?ref=footer-links)
|
[Security](https://www.inngest.com/security?ref=footer-links)
![Image 27](https://t.co/1/i/adsct?bci=4&dv=UTC%26en-US%26Google%20Inc.%26Linux%20x86_64%26255%26800%26600%268%2624%26800%26600%260%26na&eci=3&event=%7B%7D&event_id=416c2e17-98b6-4c8a-9498-c65476c59ad6&integration=gtm&p_id=Twitter&p_user_id=0&pl_id=513bac7e-808c-4b1d-8e08-2c368844bb72&pt=AI%20and%20backend%20workflows%2C%20orchestrated%20at%20any%20scale&tw_document_href=https%3A%2F%2Fwww.inngest.com%2F&tw_iframe_status=0&tw_pid_src=1&twpid=tw.1779139412502.89209985157601710&txn_id=oox9g&type=javascript&version=2.3.53)![Image 28](https://analytics.twitter.com/1/i/adsct?bci=4&dv=UTC%26en-US%26Google%20Inc.%26Linux%20x86_64%26255%26800%26600%268%2624%26800%26600%260%26na&eci=3&event=%7B%7D&event_id=416c2e17-98b6-4c8a-9498-c65476c59ad6&integration=gtm&p_id=Twitter&p_user_id=0&pl_id=513bac7e-808c-4b1d-8e08-2c368844bb72&pt=AI%20and%20backend%20workflows%2C%20orchestrated%20at%20any%20scale&tw_document_href=https%3A%2F%2Fwww.inngest.com%2F&tw_iframe_status=0&tw_pid_src=1&twpid=tw.1779139412502.89209985157601710&txn_id=oox9g&type=javascript&version=2.3.53)