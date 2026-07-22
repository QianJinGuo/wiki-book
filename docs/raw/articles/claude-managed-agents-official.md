---
title: "claude managed agents official"
source: newsletter
source_url: https://claude.com/blog/new-in-claude-managed-agents
source_feed: TLDR AI (newsletter)
ingested: 2026-05-08
review_value: 7
review_confidence: 7
review_verdict: strong
stars: 4
sha256: 2e9b7021dacb284f
type: raw
created: 2026-05-10
updated: 2026-05-10
tags: [claude]
---
[](https://claude.com)
  * Meet Claude
Products
    * [Claude](/product/overview)
    * [Claude Code](/product/claude-code)
    * [Claude Cowork](/product/cowork)
    * [Claude Security](/product/claude-security)
Features
    * [Claude for Chrome](/claude-for-chrome)
    * [Claude for Slack](/claude-for-slack)
    * [Claude for Microsoft 365](/claude-for-microsoft-365)
    * [Skills](/skills)
Models
    * [Opus](https://www.anthropic.com/claude/opus)
    * [Sonnet](https://www.anthropic.com/claude/sonnet)
    * [Haiku](https://www.anthropic.com/claude/haiku)
  * Platform
    * [Overview](/platform/api)
    * [Developer docs](https://platform.claude.com/docs)
    * [Pricing](http://claude.com/pricing#api)
    * [Console login](https://platform.claude.com/)
  * Solutions
Use cases
    * [AI agents](/solutions/agents)
    * [Coding](/solutions/coding)
Departments
    * [Security](/solutions/security)
Industries
    * [Customer support](/solutions/customer-support)
    * [Education](/solutions/education)
    * [Financial services](/solutions/financial-services)
    * [Government](/solutions/government)
    * [Healthcare](/solutions/healthcare)
    * [Life sciences](/solutions/life-sciences)
    * [Nonprofits](/solutions/nonprofits)
  * Pricing
    * [Overview](/pricing)
    * [API](/pricing#api)
Plans
    * [Pro](/pricing/pro)
    * [Max](/pricing/max)
    * [Team](/pricing/team)
    * [Enterprise](/pricing/enterprise)
  * Resources
Insights
    * [Blog](/blog)
    * [Customer stories](/customers)
    * [Anthropic news](https://www.anthropic.com/news)
Learn
    * [Anthropic Academy](https://www.anthropic.com/learn)
    * [Courses](/resources/courses)
    * [Tutorials](/resources/tutorials)
    * [Use cases](/resources/use-cases)
Tools
    * [Connectors](/connectors)
    * [Plugins](/plugins)
Connect
    * [Events](https://www.anthropic.com/events)
    * [Community](/community)
  * [Login](https://claude.ai/login)
  * Contact sales
[Contact sales](/contact-sales)Contact sales
  * Try Claude
[Try Claude](https://claude.ai/)Try Claude
  * Contact sales
[Contact sales](/contact-sales)Contact sales
  * Try Claude
[Try Claude](https://claude.ai/)Try Claude
  * Contact sales
[Contact sales](/contact-sales)Contact sales
  * Try Claude
[Try Claude](https://claude.ai/)Try Claude
  * Contact sales
[Contact sales](/contact-sales)Contact sales
  * Try Claude
[Try Claude](https://claude.ai/)Try Claude
  * Meet Claude
Products
    * [Claude](/product/overview)
    * [Claude Code](/product/claude-code)
    * [Claude Cowork](/product/cowork)
    * [Claude Security](/product/claude-security)
Features
    * [Claude for Chrome](/claude-for-chrome)
    * [Claude for Slack](/claude-for-slack)
    * [Claude for Microsoft 365](/claude-for-microsoft-365)
    * [Skills](/skills)
Models
    * [Opus](https://www.anthropic.com/claude/opus)
    * [Sonnet](https://www.anthropic.com/claude/sonnet)
    * [Haiku](https://www.anthropic.com/claude/haiku)
  * Platform
    * [Overview](/platform/api)
    * [Developer docs](https://platform.claude.com/docs)
    * [Pricing](http://claude.com/pricing#api)
    * [Console login](https://platform.claude.com/)
  * Solutions
Use cases
    * [AI agents](/solutions/agents)
    * [Coding](/solutions/coding)
Departments
    * [Security](/solutions/security)
Industries
    * [Customer support](/solutions/customer-support)
    * [Education](/solutions/education)
    * [Financial services](/solutions/financial-services)
    * [Government](/solutions/government)
    * [Healthcare](/solutions/healthcare)
    * [Life sciences](/solutions/life-sciences)
    * [Nonprofits](/solutions/nonprofits)
  * Pricing
    * [Overview](/pricing)
    * [API](/pricing#api)
Plans
    * [Pro](/pricing/pro)
    * [Max](/pricing/max)
    * [Team](/pricing/team)
    * [Enterprise](/pricing/enterprise)
  * Resources
Insights
    * [Blog](/blog)
    * [Customer stories](/customers)
    * [Anthropic news](https://www.anthropic.com/news)
Learn
    * [Anthropic Academy](https://www.anthropic.com/learn)
    * [Courses](/resources/courses)
    * [Tutorials](/resources/tutorials)
    * [Use cases](/resources/use-cases)
Tools
    * [Connectors](/connectors)
    * [Plugins](/plugins)
Connect
    * [Events](https://www.anthropic.com/events)
    * [Community](/community)
  * [Login](https://claude.ai/login)
  * Contact sales
[Contact sales](/contact-sales)Contact sales
  * Try Claude
[Try Claude](https://claude.ai/)Try Claude
  * Contact sales
[Contact sales](/contact-sales)Contact sales
  * Try Claude
[Try Claude](https://claude.ai/)Try Claude
  1. Blog
[Blog](/blog)
/
  2. New in Claude Managed Agents: dreaming, outcomes, and multiagent orchestration
Explore here
  * Ask questions about this page
  * Copy as markdown
# New in Claude Managed Agents: dreaming, outcomes, and multiagent orchestration
  * Category
[Product announcements](https://claude.com/blog/category/announcements)
  * Product
Claude Platform
  * Date
May 6, 2026
  * Reading time
5
min
  * Share
Copy link
https://claude.com/blog/new-in-claude-managed-agents
Today we're launching dreaming in Claude Managed Agents as a research preview. Dreaming extends [memory](https://claude.com/blog/claude-managed-agents-memory) by reviewing past sessions to find patterns and help agents self-improve. We're also making outcomes, multiagent orchestration, and webhooks available to developers building with Managed Agents. Together, these updates make agents more capable at handling complex tasks with minimal steering.
## **Build self-improving agents with dreaming**
[Dreaming](https://platform.claude.com/docs/en/managed-agents/dreams) is a scheduled process that reviews your agent sessions and memory stores, extracts patterns, and curates memories so your agents improve over time. You decide how much control you want: dreaming can update memory automatically, or you can review changes before they land.
Dreaming surfaces patterns that a single agent can’t see on its own, including recurring mistakes, workflows that agents converge on, and preferences shared across a team. It also restructures memory so it stays high-signal as it evolves. This is especially useful for long-running work and multiagent orchestration.
Together, memory and dreaming form a robust memory system for self-improving agents. Memory lets each agent capture what it learns _as it works_. Dreaming refines that memory _between sessions_ , pulling shared learnings across agents and keeping it up-to-date.
Dreaming is available in Managed Agents on the Claude Platform; developers can [request access here](https://claude.com/form/claude-managed-agents).
## **Deliver better outcomes**
With [outcomes](https://platform.claude.com/docs/en/managed-agents/define-outcomes), you write a rubric describing what success looks like and the agent works toward it. A separate grader evaluates the output against your criteria in its own context window, so it isn't influenced by the agent's reasoning. When something isn't right, the grader pinpoints what needs to change and the agent takes another pass.
Agents do their best work when they know what "good" looks like. For example, a structural framework, a presentation standard, or a set of requirements that need to be met. With outcomes, agents can check their work against that bar and self-correct until the output is good enough, without a human needing to review each attempt.
Outcomes is particularly useful for tasks that require attention to detail and exhaustive coverage. It also works for subjective quality, like whether copy matches a brand voice or a design follows visual guidelines. In testing, outcomes improved task success by up to 10 points over a standard prompting loop, with the largest gains on the hardest problems. Outcomes also improved file generation quality, with +8.4% task success on docx and +10.1% on pptx in our internal benchmarks.
You can also now define an outcome, let the agent run, and get notified by a [webhook](http://platform.claude.com/docs/en/managed-agents/webhooks) when it's done.
## **Handle complex tasks with multiple agents**
When there is too much work for a single agent to do well, [multiagent orchestration](https://platform.claude.com/docs/en/managed-agents/multi-agent) lets a lead agent break the job into pieces and delegate each one to a specialist with its own model, prompt, and tools. For example, a lead agent can run an investigation while subagents fan out through deploy history, error logs, metrics, and support tickets.
These specialists work in parallel on a shared filesystem and contribute to the lead agent's overall context. The lead agent can check back in with other agents mid-workflow because events are persistent and every agent remembers what it's done. You can also trace every step in the [Claude Console](https://platform.claude.com/): which agent did what, in what order, and why, giving you full visibility into how your task was delegated and executed.
## **What teams are building**
Teams are using dreaming, outcomes, and multiagent orchestration to ship agents that verify their own work, learn across sessions, and parallelize complex jobs:
  * [Harvey](https://www.harvey.ai/) uses Managed Agents to coordinate complex legal work like long-form drafting and document creation. With dreaming, their agents remember what they learned between sessions, including filetype workarounds and tool-specific patterns. Completion rates went up ~6x in their tests.
  * Netflix's platform team built an analysis agent that processes logs from hundreds of builds across different sources. With changes that affect thousands of applications, what matters is finding the issues that recur across many of them. Multiagent orchestration lets the agent analyze batches in parallel and surface only the patterns worth acting on.
  * [Spiral](http://writewithspiral.com/) by Every is using multiagent orchestration and outcomes to power the writing agent behind their new API and CLI. The lead agent runs on [Haiku](https://www.anthropic.com/claude/haiku): it fields incoming requests, poses quick follow-up questions when needed, then delegates the drafting to subagents running on [Opus](https://www.anthropic.com/claude/opus). When a user asks for multiple drafts, the subagents run in parallel. Writing quality is Spiral's core value, so they use outcomes to enforce it. Each draft is scored against a rubric of Every's editorial principles and the user's voice, both pulled from memory. Only drafts that clear the bar are returned.
  * [Wisedocs](https://www.wisedocs.ai/blogs/building-managed-agents-for-document-verification) built a document quality check agent on Managed Agents, using outcomes to grade each review against their internal guidelines. Reviews now run 50% faster, while staying aligned with their team's standards.
No items found.
PrevPrev
0/5
NextNext
eBook
## 
## **Getting started**
Dreaming is available in research preview, outcomes, multiagent orchestration, and memory are available in public beta as part of Managed Agents. To get started with dreaming, request access [here](https://claude.com/form/claude-managed-agents). Explore our [documentation](https://platform.claude.com/docs/en/managed-agents/overview) to learn more or visit the [Claude Console](https://platform.claude.com/) to deploy your first agent.
FAQ
No items found.
## Related posts
Explore more product news and best practices for teams building with Claude.
May 7, 2026
### Collaborate with Claude across Excel, PowerPoint, Word and Outlook 
Product announcements
Collaborate with Claude across Excel, PowerPoint, Word and Outlook Collaborate with Claude across Excel, PowerPoint, Word and Outlook 
[Collaborate with Claude across Excel, PowerPoint, Word and Outlook ](/blog/collaborate-with-claude-across-excel-powerpoint-word-and-outlook)Collaborate with Claude across Excel, PowerPoint, Word and Outlook 
Apr 30, 2026
### Claude Security is now in public beta
Product announcements
Claude Security is now in public betaClaude Security is now in public beta
[Claude Security is now in public beta](/blog/claude-security-public-beta)Claude Security is now in public beta
Apr 23, 2026
### New connectors in Claude for everyday life
Product announcements
New connectors in Claude for everyday lifeNew connectors in Claude for everyday life
[New connectors in Claude for everyday life](/blog/connectors-for-everyday-life)New connectors in Claude for everyday life
Sep 11, 2025
### Bringing memory to Claude
Product announcements
Bringing memory to ClaudeBringing memory to Claude
[Bringing memory to Claude](/blog/memory)Bringing memory to Claude
## Transform how your organization operates with Claude
See pricing
[See pricing](https://claude.com/pricing#api)See pricing
Contact sales
[Contact sales](https://claude.com/contact-sales)Contact sales
Get the developer newsletter
Product updates, how-tos, community spotlights, and more. Delivered monthly to your inbox.
SubscribeSubscribe
Please provide your email address if you'd like to receive our monthly developer newsletter. You can unsubscribe at any time.
Thank you! You’re subscribed.
Sorry, there was a problem with your submission, please try again later.
[Homepage](https://claude.com)Homepage
NextNext
Thank you! Your submission has been received!
Oops! Something went wrong while submitting the form.
Write
Button TextButton Text
Learn
Button TextButton Text
Code
Button TextButton Text
Write
  * Help me develop a unique voice for an audience
Hi Claude! Could you help me develop a unique voice for an audience? If you need more information from me, ask me 1-2 key questions right away. If you think I should upload any documents that would help you do a better job, let me know. You can use the tools you have access to— like Google Drive, web search, etc.—if they’ll help you better accomplish this task. Do not use analysis tool. Please keep your responses friendly, brief and conversational.   
Please execute the task as soon as you can—an artifact would be great if it makes sense. If using an artifact, consider what kind of artifact (interactive, visual, checklist, etc.) might be most helpful for this specific task. Thanks for your help!
  * Improve my writing style
Hi Claude! Could you improve my writing style? If you need more information from me, ask me 1-2 key questions right away. If you think I should upload any documents that would help you do a better job, let me know. You can use the tools you have access to— like Google Drive, web search, etc.—if they’ll help you better accomplish this task. Do not use analysis tool. Please keep your responses friendly, brief and conversational.   
Please execute the task as soon as you can—an artifact would be great if it makes sense. If using an artifact, consider what kind of artifact (interactive, visual, checklist, etc.) might be most helpful for this specific task. Thanks for your help!
  * Brainstorm creative ideas
Hi Claude! Could you brainstorm creative ideas? If you need more information from me, ask me 1-2 key questions right away. If you think I should upload any documents that would help you do a better job, let me know. You can use the tools you have access to— like Google Drive, web search, etc.—if they’ll help you better accomplish this task. Do not use analysis tool. Please keep your responses friendly, brief and conversational.   
Please execute the task as soon as you can—an artifact would be great if it makes sense. If using an artifact, consider what kind of artifact (interactive, visual, checklist, etc.) might be most helpful for this specific task. Thanks for your help!
Learn
  * Explain a complex topic simply
Hi Claude! Could you explain a complex topic simply? If you need more information from me, ask me 1-2 key questions right away. If you think I should upload any documents that would help you do a better job, let me know. You can use the tools you have access to— like Google Drive, web search, etc.—if they’ll help you better accomplish this task. Do not use analysis tool. Please keep your responses friendly, brief and conversational.   
Please execute the task as soon as you can—an artifact would be great if it makes sense. If using an artifact, consider what kind of artifact (interactive, visual, checklist, etc.) might be most helpful for this specific task. Thanks for your help!
  * Help me make sense of these ideas
Hi Claude! Could you help me make sense of these ideas? If you need more information from me, ask me 1-2 key questions right away. If you think I should upload any documents that would help you do a better job, let me know. You can use the tools you have access to— like Google Drive, web search, etc.—if they’ll help you better accomplish this task. Do not use analysis tool. Please keep your responses friendly, brief and conversational.   
Please execute the task as soon as you can—an artifact would be great if it makes sense. If using an artifact, consider what kind of artifact (interactive, visual, checklist, etc.) might be most helpful for this specific task. Thanks for your help!
  * Prepare for an exam or interview
Hi Claude! Could you prepare for an exam or interview? If you need more information from me, ask me 1-2 key questions right away. If you think I should upload any documents that would help you do a better job, let me know. You can use the tools you have access to— like Google Drive, web search, etc.—if they’ll help you better accomplish this task. Do not use analysis tool. Please keep your responses friendly, brief and conversational.   
Please execute the task as soon as you can—an artifact would be great if it makes sense. If using an artifact, consider what kind of artifact (interactive, visual, checklist, etc.) might be most helpful for this specific task. Thanks for your help!
Code
  * Explain a programming concept
Hi Claude! Could you explain a programming concept? If you need more information from me, ask me 1-2 key questions right away. If you think I should upload any documents that would help you do a better job, let me know. You can use the tools you have access to— like Google Drive, web search, etc.—if they’ll help you better accomplish this task. Do not use analysis tool. Please keep your responses friendly, brief and conversational.   
Please execute the task as soon as you can—an artifact would be great if it makes sense. If using an artifact, consider what kind of artifact (interactive, visual, checklist, etc.) might be most helpful for this specific task. Thanks for your help!
  * Look over my code and give me tips
Hi Claude! Could you look over my code and give me tips? If you need more information from me, ask me 1-2 key questions right away. If you think I should upload any documents that would help you do a better job, let me know. You can use the tools you have access to— like Google Drive, web search, etc.—if they’ll help you better accomplish this task. Do not use analysis tool. Please keep your responses friendly, brief and conversational.   
Please execute the task as soon as you can—an artifact would be great if it makes sense. If using an artifact, consider what kind of artifact (interactive, visual, checklist, etc.) might be most helpful for this specific task. Thanks for your help!
  * Vibe code with me
Hi Claude! Could you vibe code with me? If you need more information from me, ask me 1-2 key questions right away. If you think I should upload any documents that would help you do a better job, let me know. You can use the tools you have access to— like Google Drive, web search, etc.—if they’ll help you better accomplish this task. Do not use analysis tool. Please keep your responses friendly, brief and conversational.   
Please execute the task as soon as you can—an artifact would be great if it makes sense. If using an artifact, consider what kind of artifact (interactive, visual, checklist, etc.) might be most helpful for this specific task. Thanks for your help!
More
  * Write case studies
This is another test
  * Write grant proposals
Hi Claude! Could you write grant proposals? If you need more information from me, ask me 1-2 key questions right away. If you think I should upload any documents that would help you do a better job, let me know. You can use the tools you have access to — like Google Drive, web search, etc. — if they’ll help you better accomplish this task. Do not use analysis tool. Please keep your responses friendly, brief and conversational.   
Please execute the task as soon as you can - an artifact would be great if it makes sense. If using an artifact, consider what kind of artifact (interactive, visual, checklist, etc.) might be most helpful for this specific task. Thanks for your help!
  * Write video scripts
this is a test
[Anthropic](https://www.anthropic.com/)Anthropic
© [year] Anthropic PBC
Products
  * Claude
[Claude](/product/overview)Claude
  * Claude Code
[Claude Code](/product/claude-code)Claude Code
  * Claude Code for Enterprise
[Claude Code for Enterprise](/product/claude-code/enterprise)Claude Code for Enterprise
  * Claude Cowork
[Claude Cowork](/product/cowork)Claude Cowork
  * Claude Security
[Claude Security](/product/claude-security)Claude Security
  * Pro plan
[Pro plan](/pricing/pro)Pro plan
  * Max plan
[Max plan](/pricing/max)Max plan
  * Team plan
[Team plan](/pricing/team)Team plan
  * Enterprise plan
[Enterprise plan](/pricing/enterprise)Enterprise plan
  * Download app
[Download app](/download)Download app
  * Pricing
[Pricing](/pricing)Pricing
  * Log in
[Log in](https://claude.ai/login)Log in
Features
  * Claude for Chrome
[Claude for Chrome](/claude-for-chrome)Claude for Chrome
  * Claude for Slack
[Claude for Slack](/claude-for-slack)Claude for Slack
  * Claude for Microsoft 365
[Claude for Microsoft 365](/claude-for-microsoft-365)Claude for Microsoft 365
  * Skills
[Skills](/skills)Skills
Models
  * Mythos preview
[Mythos preview](https://www.anthropic.com/glasswing)Mythos preview
  * Opus
[Opus](https://www.anthropic.com/claude/opus)Opus
  * Sonnet
[Sonnet](https://www.anthropic.com/claude/sonnet)Sonnet
  * Haiku
[Haiku](https://www.anthropic.com/claude/haiku)Haiku
Solutions
  * AI agents
[AI agents](/solutions/agents)AI agents
  * Code modernization
[Code modernization](/solutions/code-modernization)Code modernization
  * Coding
[Coding](/solutions/coding)Coding
  * Customer support
[Customer support](/solutions/customer-support)Customer support
  * Education
[Education](/solutions/education)Education
  * Financial services
[Financial services](/solutions/financial-services)Financial services
  * Government
[Government](/solutions/government)Government
  * Healthcare
[Healthcare](/solutions/healthcare)Healthcare
  * Life sciences
[Life sciences](/solutions/life-sciences)Life sciences
  * Nonprofits
[Nonprofits](/solutions/nonprofits)Nonprofits
  * Security
[Security](/solutions/security)Security
Claude Platform
  * Overview
[Overview](/platform/api)Overview
  * Developer docs
[Developer docs](https://platform.claude.com/docs)Developer docs
  * Pricing
[Pricing](https://claude.com/pricing#api)Pricing
  * Marketplace
[Marketplace](/platform/marketplace)Marketplace
  * Amazon Bedrock
[Amazon Bedrock](/partners/amazon-bedrock)Amazon Bedrock
  * Google Cloud’s Vertex AI
[Google Cloud’s Vertex AI](/partners/google-cloud-vertex-ai)Google Cloud’s Vertex AI
  * Microsoft Foundry
[Microsoft Foundry](/partners/microsoft-foundry)Microsoft Foundry
  * Regional compliance
[Regional compliance](/regional-compliance)Regional compliance
  * Console login
[Console login](https://platform.claude.com/)Console login
Resources
  * Blog
[Blog](/blog)Blog
  * Claude partner network
[Claude partner network](/partners)Claude partner network
  * Community
[Community](/community)Community
  * Connectors
[Connectors](/connectors)Connectors
  * Courses
[Courses](https://www.anthropic.com/learn)Courses
  * Customer stories
[Customer stories](/customers)Customer stories
  * Engineering at Anthropic
[Engineering at Anthropic](https://www.anthropic.com/engineering)Engineering at Anthropic
  * Events
[Events](https://www.anthropic.com/events)Events
  * Plugins
[Plugins](/plugins)Plugins
  * Powered by Claude
[Powered by Claude](/partners/powered-by-claude)Powered by Claude
  * Service partners
[Service partners](/partners/services)Service partners
  * Startups program
[Startups program](/programs/startups)Startups program
  * Tutorials
[Tutorials](/resources/tutorials)Tutorials
  * Use cases
[Use cases](/resources/use-cases)Use cases
Company
  * Anthropic
[Anthropic](https://www.anthropic.com/)Anthropic
  * Careers
[Careers](https://www.anthropic.com/careers)Careers
  * Economic Futures
[Economic Futures](https://www.anthropic.com/economic-futures)Economic Futures
  * Research
[Research](https://www.anthropic.com/research)Research
  * News
[News](https://www.anthropic.com/news)News
  * Responsible Scaling Policy
[Responsible Scaling Policy](https://www.anthropic.com/news/announcing-our-updated-responsible-scaling-policy)Responsible Scaling Policy
  * Security and compliance
[Security and compliance](https://trust.anthropic.com/)Security and compliance
  * Transparency
[Transparency](https://anthropic.com/transparency)Transparency
Help and security
  * Availability
[Availability](https://www.anthropic.com/supported-countries)Availability
  * Status
[Status](https://status.anthropic.com/)Status
  * Support center
[Support center](https://support.claude.com/en/)Support center
Terms and policies
  * Privacy choices
### Cookie settings
We use cookies to deliver and improve our services, analyze site usage, and if you agree, to customize or personalize your experience and market our services to you. You can read our Cookie Policy [here](https://www.anthropic.com/legal/cookies). 
Customize cookie settings Reject all cookies Accept all cookies
###### Necessary
Enables security and basic functionality.
Required
###### Analytics
Enables tracking of site performance.
Off
###### Marketing
Enables ads personalization and tracking.
Off
Save preferences 
  * Privacy policy
[Privacy policy](https://www.anthropic.com/legal/privacy)Privacy policy
  * Responsible disclosure policy
[Responsible disclosure policy](https://www.anthropic.com/responsible-disclosure-policy)Responsible disclosure policy
  * Terms of service: Commercial
[Terms of service: Commercial](https://www.anthropic.com/legal/commercial-terms)Terms of service: Commercial
  * Terms of service: Consumer
[Terms of service: Consumer](https://www.anthropic.com/legal/consumer-terms)Terms of service: Consumer
  * Usage policy
[Usage policy](https://www.anthropic.com/legal/aup)Usage policy
[x.com](https://x.com/claudeai)x.com
[LinkedIn](https://www.linkedin.com/showcase/claude/)LinkedIn
[YouTube](https://www.youtube.com/@anthropic-ai)YouTube
[Instagram](https://www.instagram.com/claudeai)Instagram
English (US)
[English (US)](/blog/new-in-claude-managed-agents)
[日本語 (Japan)](/ja)
[Deutsch (Germany)](/de)
[Français (France)](/fr)
[한국어 (South Korea)](/ko)
[](/blog-product/claude-platform)
Claude Platform
[](/blog-usecases/agents)
Agents