---
title: "Cline releases open-source agent runtime SDK"
sha256: 5ca5b45bf848f6000cb74bfaa7653e55174914f7b3c0c2e2097d241e0964f7e6
source: newsletter
source_url: https://www.testingcatalog.com/cline-releases-open-source-agent-runtime-sdk-for-coding-agents/
tags: [coding-agents, open-source, sdk, cline]
fetcher: jina
review_value: 8
review_confidence: 8
review_recommendation: strong
ingested: 2026-05-15
---
Published Time: 2026-05-13T15:24:38.000Z
Markdown Content:
# Cline releases open-source agent runtime SDK
[![Image 2: TestingCatalog AI News](https://storage.ghost.io/c/2a/1b/2a1b1782-8506-4d7d-bf53-ad3fb52e2a0f/content/images/size/w600/2026/05/output-onlinepngtools--1-.png)](https://www.testingcatalog.com/)
*   [ChatGPT](https://www.testingcatalog.com/tag/chatgpt/)
*   [Gemini](https://www.testingcatalog.com/tag/gemini/)
*   [Perplexity](https://www.testingcatalog.com/tag/perplexity/)
*   [Claude](https://www.testingcatalog.com/tag/claude/)
*   [Grok](https://www.testingcatalog.com/tag/grok/)
*   [Copilot](https://www.testingcatalog.com/tag/microsoft-copilot/)
*   [Mistral](https://www.testingcatalog.com/tag/mistral/)
*   [More](https://www.testingcatalog.com/cline-releases-open-source-agent-runtime-sdk-for-coding-agents/#)[Weekly Newsletter](https://www.testingcatalog.com/weekly-newsletter/)[For Advertisers](https://stan.store/testingcatalog) 
* * *
[](https://www.facebook.com/testingcatalog "Facebook testingcatalog")[](https://x.com/testingcatalog "Twitter @testingcatalog")[](https://www.threads.com/@testingcatalog "Threads")[](https://t.me/testingcatalog "Telegram")[](https://www.linkedin.com/company/testingcatalog "LinkedIn")[](https://www.instagram.com/testingcatalog "Instagram")   
[](https://www.testingcatalog.com/cline-releases-open-source-agent-runtime-sdk-for-coding-agents/)[](https://www.testingcatalog.com/cline-releases-open-source-agent-runtime-sdk-for-coding-agents/#/search)[Log in](https://www.testingcatalog.com/cline-releases-open-source-agent-runtime-sdk-for-coding-agents/#/portal/signin)[Subscribe](https://www.testingcatalog.com/cline-releases-open-source-agent-runtime-sdk-for-coding-agents/#/portal/signup)[](javascript:;)
[Log in](https://www.testingcatalog.com/cline-releases-open-source-agent-runtime-sdk-for-coding-agents/#)[Subscribe](https://www.testingcatalog.com/cline-releases-open-source-agent-runtime-sdk-for-coding-agents/#)
*   [ChatGPT](https://www.testingcatalog.com/tag/chatgpt/)
*   [Gemini](https://www.testingcatalog.com/tag/gemini/)
*   [Perplexity](https://www.testingcatalog.com/tag/perplexity/)
*   [Claude](https://www.testingcatalog.com/tag/claude/)
*   [Grok](https://www.testingcatalog.com/tag/grok/)
*   [Copilot](https://www.testingcatalog.com/tag/microsoft-copilot/)
*   [Mistral](https://www.testingcatalog.com/tag/mistral/)
[](https://www.facebook.com/testingcatalog "Facebook testingcatalog")[](https://x.com/testingcatalog "Twitter @testingcatalog")[](https://www.threads.com/@testingcatalog "Threads")[](https://t.me/testingcatalog "Telegram")[](https://www.linkedin.com/company/testingcatalog "LinkedIn")[](https://www.instagram.com/testingcatalog "Instagram")
[Sponsored](https://www.testingcatalog.com/tag/sponsored/)
# Cline releases open-source agent runtime SDK for coding agents
Cline ships @cline/sdk, an open-source agent runtime powering its CLI, VS Code, and JetBrains, open for any team to build on.
*   [![Image 3: Go to the profile of Nero Soares](https://storage.ghost.io/c/2a/1b/2a1b1782-8506-4d7d-bf53-ad3fb52e2a0f/content/images/size/w100/2026/03/Img_2025_10_21_09_23_39-1-1.jpeg)](https://www.testingcatalog.com/author/nero-2/ "Go to the profile of Nero Soares")
[Nero Soares](https://www.testingcatalog.com/author/nero-2/)
13 May 2026·3 min read
Share:[](https://twitter.com/share?text=Cline%20releases%20open-source%20agent%20runtime%20SDK%20for%20coding%20agents&url=https://www.testingcatalog.com/cline-releases-open-source-agent-runtime-sdk-for-coding-agents/ "Share on Twitter")[](https://www.facebook.com/sharer/sharer.php?u=https://www.testingcatalog.com/cline-releases-open-source-agent-runtime-sdk-for-coding-agents/ "Share on Facebook")[](https://www.linkedin.com/shareArticle?mini=true&url=https://www.testingcatalog.com/cline-releases-open-source-agent-runtime-sdk-for-coding-agents/&title=Cline%20releases%20open-source%20agent%20runtime%20SDK%20for%20coding%20agents "Share on Linkedin")[](whatsapp://send?text=https://www.testingcatalog.com/cline-releases-open-source-agent-runtime-sdk-for-coding-agents/)
![Image 4: Cline](https://storage.ghost.io/c/2a/1b/2a1b1782-8506-4d7d-bf53-ad3fb52e2a0f/content/images/size/w2000/2026/05/cline_og_img.png)
Cline has shipped `@cline/sdk`, an open-source agent runtime that now powers every Cline surface and is available for any team to build on. Rather than layering new capabilities onto an architecture that had grown inseparable from its IDE host, the team rebuilt the core agent loop as a standalone, portable SDK and migrated their own CLI and Kanban on top of it. The VS Code and JetBrains extensions are in the process of following.
The SDK is a layered TypeScript stack in which each layer has a single responsibility. `@cline/shared` carries foundational types and utilities. `@cline/llms` owns the provider layer, covering Anthropic, OpenAI, Google, AWS Bedrock, Mistral, LiteLLM, and any OpenAI-compatible endpoint, with provider logic kept entirely out of the agent loop so switching providers is a config change, not a code change. `@cline/agents` runs the stateless agentic loop, handling iteration, tool orchestration, and event emission. `@cline/core` sits above that, managing stateful orchestration: session lifecycle, persistence, and config discovery. App surfaces, the CLI, VS Code, and JetBrains connect to the runtime at the top without owning it. Teams can install the full stack via `npm install @cline/sdk` or pull individual packages for a smaller surface.
![Image 5: Cline SDK](https://storage.ghost.io/c/2a/1b/2a1b1782-8506-4d7d-bf53-ad3fb52e2a0f/content/images/2026/05/Copy-of-Introducing-Cline-SDK_-the-upgraded-agent-runtime-and-we-rebuilt-Cline-upon-it-docx-Google-Docs-05-13-2026_01_42_AM.jpg)
The rebuild changes what is possible for long-running work. Sessions no longer die with a UI restart. A session can move across surfaces. The agent loop stays stateless and reusable, while the runtime around it becomes durable and portable. The improved harness also rewrote prompts, tightened context management, and rethought how tools are surfaced to the model. Terminal benchmark results reflect those gains: Cline CLI running claude-opus-4.7 scores 74.2% on Terminal Bench 2.0, compared to 69.4% for Claude Code on the same model. On open-weight models, Cline CLI reaches 55.1% with kimi-k2.6, ahead of OpenCode at 37.1% on the same run.
The SDK ships with agent teams and subagents natively. A session can delegate to specialist agents, track progress, and exchange handoff notes, all inside the same core runtime, without a separate orchestration layer. Plugins let teams add domain-specific behavior without forking: a plugin can register tools, observe lifecycle events, add rules, and shape what the agent sees. Scheduled CRON jobs, checkpointing, web search, and MCP connectors are native. With the new CLI, experimental connector channels let agents surface directly to Telegram, WhatsApp, Slack, and other platforms through a setup wizard accessible via `cline connect`.
****SPONSORED****
Test the Cline SDK out for yourself!
[Take me there!](https://docs.cline.bot/sdk?ref=testingcatalog.com)
Cline is the open-source project behind the SDK, crediting itself as the first real agentic coding experience, originally built on agentic tool calling with Claude Sonnet 3.5 before Claude Code, Codex, and the broader wave of coding agents arrived. The platform now serves over 7 million developers. Cline CLI 2.0 launched earlier in 2026 with terminal-first execution and headless CI support, and Cline Kanban followed as a visual orchestration layer for running multiple agents in parallel across a git repo. The SDK release is the infrastructure move underlying all of it: every prior Cline surface becomes a product built on a shared, open foundation rather than a standalone artifact. The project is available at `npm install @cline/sdk`, with documentation at docs.cline.bot/sdk.
Discover more
Open Source
Computer Science
Software
[Sponsored](https://www.testingcatalog.com/tag/sponsored/ "Sponsored")
Share:[](https://twitter.com/share?text=Cline%20releases%20open-source%20agent%20runtime%20SDK%20for%20coding%20agents&url=https://www.testingcatalog.com/cline-releases-open-source-agent-runtime-sdk-for-coding-agents/ "Share on Twitter")[](https://www.facebook.com/sharer/sharer.php?u=https://www.testingcatalog.com/cline-releases-open-source-agent-runtime-sdk-for-coding-agents/ "Share on Facebook")[](https://www.linkedin.com/shareArticle?mini=true&url=https://www.testingcatalog.com/cline-releases-open-source-agent-runtime-sdk-for-coding-agents/&title=Cline%20releases%20open-source%20agent%20runtime%20SDK%20for%20coding%20agents "Share on Linkedin")[](whatsapp://send?text=https://www.testingcatalog.com/cline-releases-open-source-agent-runtime-sdk-for-coding-agents/)
## Sign up for more like this
[Enter your email Subscribe](https://www.testingcatalog.com/cline-releases-open-source-agent-runtime-sdk-for-coding-agents/#/portal)
No spam. No jibber jabber. Unsubscribe any time.
* * *
[![Image 6: thehype radio](https://storage.ghost.io/c/2a/1b/2a1b1782-8506-4d7d-bf53-ad3fb52e2a0f/content/images/size/w300/2026/05/thehype-radio-05-13-2026_02_37_PM.jpg)](https://www.testingcatalog.com/thehype-launches-24-7-ai-powered-radio-for-founders/)[Previous article ## thehype launches 24/7 AI-powered radio for founders theHype Radio is a 24/7 AI-run news station covering breaking news, funding, trends, and community takes for founders and builders.](https://www.testingcatalog.com/thehype-launches-24-7-ai-powered-radio-for-founders/)
[![Image 7: holaOS](https://storage.ghost.io/c/2a/1b/2a1b1782-8506-4d7d-bf53-ad3fb52e2a0f/content/images/size/w300/2026/05/banner-1.webp)](https://www.testingcatalog.com/holaos-0-1-released-as-ai-workstream-management-layer/)[Next article ## holaOS 0.1 released as AI Workstream Management Layer holaOS beta0.1 ships Dashboard, Sub Agents, and Multi Workspaces to manage parallel AI workstreams on desktop.](https://www.testingcatalog.com/holaos-0-1-released-as-ai-workstream-management-layer/)
### Related Articles
[![Image 8: TinyFish makes Search and Fetch APIs free for all developers](blob:http://localhost/aef335eb562a1da6957ce25a574b4aa1) ## OpenSquilla launches open-source AI agent to cut token costs 14 May 2026·3 min read](https://www.testingcatalog.com/opensquilla-launches-open-source-ai-agent-to-cut-token-costs/)
[![Image 9: TinyFish makes Search and Fetch APIs free for all developers](blob:http://localhost/aef335eb562a1da6957ce25a574b4aa1) ## holaOS 0.1 released as AI Workstream Management Layer 13 May 2026·2 min read](https://www.testingcatalog.com/holaos-0-1-released-as-ai-workstream-management-layer/)
[![Image 10: TinyFish makes Search and Fetch APIs free for all developers](blob:http://localhost/aef335eb562a1da6957ce25a574b4aa1) ## thehype launches 24/7 AI-powered radio for founders 13 May 2026·2 min read](https://www.testingcatalog.com/thehype-launches-24-7-ai-powered-radio-for-founders/)
[![Image 11: TinyFish makes Search and Fetch APIs free for all developers](blob:http://localhost/aef335eb562a1da6957ce25a574b4aa1) ## Maket opens Draw from Scratch tool to all users for free 6 May 2026·2 min read](https://www.testingcatalog.com/maket-opens-draw-from-scratch-tool-to-all-users-for-free/)
[![Image 12: TinyFish makes Search and Fetch APIs free for all developers](blob:http://localhost/aef335eb562a1da6957ce25a574b4aa1) ## Inworld AI launches Realtime TTS-2 model for live conversations 5 May 2026·2 min read](https://www.testingcatalog.com/inworld-ai-launches-realtime-tts-2-model-for-live-conversations/)
[![Image 13: TinyFish makes Search and Fetch APIs free for all developers](blob:http://localhost/aef335eb562a1da6957ce25a574b4aa1) ## TinyFish makes Search and Fetch APIs free for all developers 4 May 2026·2 min read](https://www.testingcatalog.com/tinyfish-makes-search-and-fetch-apis-free-for-all-developers/)
### About Us
TestingCatalog - Latest AI News on AI Agents, Model Releases, Tools, Leaks, and Rumors
[](https://www.facebook.com/testingcatalog "Facebook testingcatalog")[](https://x.com/testingcatalog "Twitter @testingcatalog")[](https://www.threads.com/@testingcatalog "Threads")[](https://t.me/testingcatalog "Telegram")[](https://www.linkedin.com/company/testingcatalog "LinkedIn")[](https://www.instagram.com/testingcatalog "Instagram")
### Tags
[Latest AI News](https://www.testingcatalog.com/tag/ai/ "Latest AI News")
[AI Announcements](https://www.testingcatalog.com/tag/release/ "AI Announcements")
[AI Rumours](https://www.testingcatalog.com/tag/leak/ "AI Rumours")
[ChatGPT News](https://www.testingcatalog.com/tag/chatgpt/ "ChatGPT News")
[Gemini News](https://www.testingcatalog.com/tag/gemini/ "Gemini News")
### Subscribe
Get the best viral stories straight into your inbox!
Continue
**Great!** Check your inbox and click the link to confirm your subscription 
 Please enter a valid email address! 
*   [About](https://www.testingcatalog.com/about/)
*   [Contact Us](https://www.testingcatalog.com/contact-us/)
*   [Terms](https://www.testingcatalog.com/terms/)
*   [Policy](https://www.testingcatalog.com/policy/)
*   [Imprint](https://www.testingcatalog.com/imprint/)
 © 2026 TestingCatalog AI News. All rights reserved. 
![Image 14](https://t.co/1/i/adsct?bci=4&dv=UTC%26en-US%26Google%20Inc.%26Linux%20x86_64%26255%26800%26600%268%2624%26800%26600%260%26na&eci=3&event=%7B%7D&event_id=59192bb6-381c-4f82-b573-d20ec779939c&integration=advertiser&p_id=Twitter&p_user_id=0&pl_id=2e55ad5d-d466-417b-be5e-361fa8b8cf74&pt=Cline%20releases%20open-source%20agent%20runtime%20SDK&tw_document_href=https%3A%2F%2Fwww.testingcatalog.com%2Fcline-releases-open-source-agent-runtime-sdk-for-coding-agents%2F&tw_iframe_status=0&tw_pid_src=1&twpid=tw.1778810587098.372392118456758283&txn_id=qhj5k&type=javascript&version=2.3.53)![Image 15](https://analytics.twitter.com/1/i/adsct?bci=4&dv=UTC%26en-US%26Google%20Inc.%26Linux%20x86_64%26255%26800%26600%268%2624%26800%26600%260%26na&eci=3&event=%7B%7D&event_id=59192bb6-381c-4f82-b573-d20ec779939c&integration=advertiser&p_id=Twitter&p_user_id=0&pl_id=2e55ad5d-d466-417b-be5e-361fa8b8cf74&pt=Cline%20releases%20open-source%20agent%20runtime%20SDK&tw_document_href=https%3A%2F%2Fwww.testingcatalog.com%2Fcline-releases-open-source-agent-runtime-sdk-for-coding-agents%2F&tw_iframe_status=0&tw_pid_src=1&twpid=tw.1778810587098.372392118456758283&txn_id=qhj5k&type=javascript&version=2.3.53)
Do Not Sell or Share My Personal Information
![Image 16: Opt out of the sale or sharing of personal information](https://lh3.googleusercontent.com/fXLLDS89Flm_3o5WhznfPRNfCCfpjfovDftG1ZbxLneM0ejEVaBzVr7JI07WLaCi1rypWDLY2KYfsyTOIykNFk_f0q8h_-8PKjTYu-xy8Zflk_I-yYU=h60)
# Opt out of the sale or sharing of personal information
We won't sell or share your personal information to inform the ads you see. You may still see interest-based ads if your information is sold or shared by other companies or was sold or shared previously.
Dismiss
Opt out