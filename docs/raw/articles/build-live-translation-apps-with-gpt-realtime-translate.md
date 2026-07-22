---
source: newsletter
source_url: https://developers.openai.com/cookbook/examples/voice_solutions/realtime_translation_guide
tags: [openai]
ingested: 2026-05-12
sha256: 3215182f1550eac1bbda87d7a8c20cabae6fc5f5b1937f40ec9c2b5fcb747003
---
Title: Build Live Translation Apps with gpt-realtime-translate
URL Source: https://developers.openai.com/cookbook/examples/voice_solutions/realtime_translation_guide
Published Time: Mon, 11 May 2026 15:38:42 GMT
Markdown Content:
# Build Live Translation Apps with gpt-realtime-translate
[![Image 1: OpenAI Developers](https://developers.openai.com/OpenAI_Developers.svg)](https://developers.openai.com/)
[Home](https://developers.openai.com/)
[API](https://developers.openai.com/api)
[Docs Guides and concepts for the OpenAI API](https://developers.openai.com/api/docs)[API reference Endpoints, parameters, and responses](https://developers.openai.com/api/reference/overview)
[Codex](https://developers.openai.com/codex)
[Docs Guides, concepts, and product docs for Codex](https://developers.openai.com/codex)[Use cases Example workflows and tasks teams hand to Codex](https://developers.openai.com/codex/use-cases)
[ChatGPT](https://developers.openai.com/chatgpt)
[Apps SDK Build apps to extend ChatGPT](https://developers.openai.com/apps-sdk)[Commerce Build commerce flows in ChatGPT](https://developers.openai.com/commerce)[Ads Publish and measure ads in ChatGPT](https://developers.openai.com/ads)
[Resources](https://developers.openai.com/learn)
[Showcase Demo apps to get inspired](https://developers.openai.com/showcase)[Blog Learnings and experiences from developers](https://developers.openai.com/blog)[Cookbook Notebook examples for building with OpenAI models](https://developers.openai.com/cookbook)[Learn Docs, videos, and demo apps for building with OpenAI](https://developers.openai.com/learn)[Community Programs, meetups, and support for builders](https://developers.openai.com/community)
Start searching
[API Dashboard](https://platform.openai.com/login)
## Search the cookbook
Search docs 
### Suggested
responses create reasoning_effort realtime prompt caching
Primary navigation
 API  API Reference  Codex  ChatGPT  Resources 
Search docs 
### Suggested
responses create reasoning_effort realtime prompt caching
### Get started
*   [Overview](https://developers.openai.com/api/docs)
*   [Quickstart](https://developers.openai.com/api/docs/quickstart)
*   [Models](https://developers.openai.com/api/docs/models)
*   [Pricing](https://developers.openai.com/api/docs/pricing)
*   
[SDKs and CLI](https://developers.openai.com/api/docs/libraries)
    *   [OpenAI SDK](https://developers.openai.com/api/docs/libraries)
    *   [Agents SDK](https://developers.openai.com/api/docs/guides/agents)
    *   [OpenAI CLI](https://developers.openai.com/api/docs/libraries/openai-cli)
*   [Latest: GPT-5.5](https://developers.openai.com/api/docs/guides/latest-model)
*   [Prompt guidance](https://developers.openai.com/api/docs/guides/prompt-guidance)
### Core concepts
*   [Text generation](https://developers.openai.com/api/docs/guides/text)
*   [Code generation](https://developers.openai.com/api/docs/guides/code-generation)
*   [Images and vision](https://developers.openai.com/api/docs/guides/images-vision)
*   [Audio and speech](https://developers.openai.com/api/docs/guides/audio)
*   [Structured output](https://developers.openai.com/api/docs/guides/structured-outputs)
*   [Function calling](https://developers.openai.com/api/docs/guides/function-calling)
*   [Responses API](https://developers.openai.com/api/docs/guides/migrate-to-responses)
*   [Using tools](https://developers.openai.com/api/docs/guides/tools)
### Agents SDK
*   [Overview](https://developers.openai.com/api/docs/guides/agents)
*   [Quickstart](https://developers.openai.com/api/docs/guides/agents/quickstart)
*   [Agent definitions](https://developers.openai.com/api/docs/guides/agents/define-agents)
*   [Models and providers](https://developers.openai.com/api/docs/guides/agents/models)
*   [Running agents](https://developers.openai.com/api/docs/guides/agents/running-agents)
*   [Sandbox agents](https://developers.openai.com/api/docs/guides/agents/sandboxes)
*   [Orchestration](https://developers.openai.com/api/docs/guides/agents/orchestration)
*   [Guardrails](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals)
*   [Results and state](https://developers.openai.com/api/docs/guides/agents/results)
*   [Integrations and observability](https://developers.openai.com/api/docs/guides/agents/integrations-observability)
*   [Evaluate agent workflows](https://developers.openai.com/api/docs/guides/agent-evals)
*   [Voice agents](https://developers.openai.com/api/docs/guides/voice-agents)
*   
Agent Builder
    *   [Overview](https://developers.openai.com/api/docs/guides/agent-builder)
    *   [Node reference](https://developers.openai.com/api/docs/guides/node-reference)
    *   [Safety in building agents](https://developers.openai.com/api/docs/guides/agent-builder-safety)
    *   
ChatKit
        *   [Overview](https://developers.openai.com/api/docs/guides/chatkit)
        *   [Customize](https://developers.openai.com/api/docs/guides/chatkit-themes)
        *   [Widgets](https://developers.openai.com/api/docs/guides/chatkit-widgets)
        *   [Actions](https://developers.openai.com/api/docs/guides/chatkit-actions)
        *   [Advanced integrations](https://developers.openai.com/api/docs/guides/custom-chatkit)
### Tools
*   [Web search](https://developers.openai.com/api/docs/guides/tools-web-search)
*   [MCP and Connectors](https://developers.openai.com/api/docs/guides/tools-connectors-mcp)
*   [Skills](https://developers.openai.com/api/docs/guides/tools-skills)
*   [Shell](https://developers.openai.com/api/docs/guides/tools-shell)
*   [Computer use](https://developers.openai.com/api/docs/guides/tools-computer-use)
*   
File search and retrieval
    *   [File search](https://developers.openai.com/api/docs/guides/tools-file-search)
    *   [Retrieval](https://developers.openai.com/api/docs/guides/retrieval)
*   [Tool search](https://developers.openai.com/api/docs/guides/tools-tool-search)
*   
More tools
    *   [Apply Patch](https://developers.openai.com/api/docs/guides/tools-apply-patch)
    *   [Local shell](https://developers.openai.com/api/docs/guides/tools-local-shell)
    *   [Image generation](https://developers.openai.com/api/docs/guides/tools-image-generation)
    *   [Code interpreter](https://developers.openai.com/api/docs/guides/tools-code-interpreter)
### Run and scale
*   [Conversation state](https://developers.openai.com/api/docs/guides/conversation-state)
*   [Background mode](https://developers.openai.com/api/docs/guides/background)
*   [Streaming](https://developers.openai.com/api/docs/guides/streaming-responses)
*   [WebSocket mode](https://developers.openai.com/api/docs/guides/websocket-mode)
*   [Webhooks](https://developers.openai.com/api/docs/guides/webhooks)
*   [File inputs](https://developers.openai.com/api/docs/guides/file-inputs)
*   
Context management
    *   [Compaction](https://developers.openai.com/api/docs/guides/compaction)
    *   [Counting tokens](https://developers.openai.com/api/docs/guides/token-counting)
    *   [Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching)
*   
Prompting
    *   [Overview](https://developers.openai.com/api/docs/guides/prompting)
    *   [Prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering)
    *   [Citation formatting](https://developers.openai.com/api/docs/guides/citation-formatting)
*   
Reasoning
    *   [Reasoning models](https://developers.openai.com/api/docs/guides/reasoning)
    *   [Reasoning best practices](https://developers.openai.com/api/docs/guides/reasoning-best-practices)
### Evaluation
*   [Getting started](https://developers.openai.com/api/docs/guides/evaluation-getting-started)
*   [Working with evals](https://developers.openai.com/api/docs/guides/evals)
*   [Prompt optimizer](https://developers.openai.com/api/docs/guides/prompt-optimizer)
*   [External models](https://developers.openai.com/api/docs/guides/external-models)
*   [Best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices)
### Realtime and audio
*   [Overview](https://developers.openai.com/api/docs/guides/realtime)
*   [Voice agents](https://developers.openai.com/api/docs/guides/voice-agents)
*   [Live translation](https://developers.openai.com/api/docs/guides/realtime-translation)
*   
Transcription
    *   [Realtime transcription](https://developers.openai.com/api/docs/guides/realtime-transcription)
    *   [Speech to text](https://developers.openai.com/api/docs/guides/speech-to-text)
*   [Speech generation](https://developers.openai.com/api/docs/guides/text-to-speech)
*   [Realtime prompting guide](https://developers.openai.com/api/docs/guides/realtime-models-prompting)
*   
Connection methods
    *   [WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc)
    *   [WebSocket](https://developers.openai.com/api/docs/guides/realtime-websocket)
    *   [SIP](https://developers.openai.com/api/docs/guides/realtime-sip)
*   
Realtime sessions
    *   [Managing conversations](https://developers.openai.com/api/docs/guides/realtime-conversations)
    *   [Voice activity detection](https://developers.openai.com/api/docs/guides/realtime-vad)
    *   [Realtime with tools](https://developers.openai.com/api/docs/guides/realtime-mcp)
    *   [Webhooks and server-side controls](https://developers.openai.com/api/docs/guides/realtime-server-controls)
    *   [Managing costs](https://developers.openai.com/api/docs/guides/realtime-costs)
### Model optimization
*   [Optimization cycle](https://developers.openai.com/api/docs/guides/model-optimization)
*   
Fine-tuning
    *   [Supervised fine-tuning](https://developers.openai.com/api/docs/guides/supervised-fine-tuning)
    *   [Vision fine-tuning](https://developers.openai.com/api/docs/guides/vision-fine-tuning)
    *   [Direct preference optimization](https://developers.openai.com/api/docs/guides/direct-preference-optimization)
    *   [Reinforcement fine-tuning](https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning)
    *   [RFT use cases](https://developers.openai.com/api/docs/guides/rft-use-cases)
    *   [Best practices](https://developers.openai.com/api/docs/guides/fine-tuning-best-practices)
*   [Graders](https://developers.openai.com/api/docs/guides/graders)
### Specialized models
*   [Image generation](https://developers.openai.com/api/docs/guides/image-generation)
*   [Video generation](https://developers.openai.com/api/docs/guides/video-generation)
*   [Deep research](https://developers.openai.com/api/docs/guides/deep-research)
*   [Embeddings](https://developers.openai.com/api/docs/guides/embeddings)
*   [Moderation](https://developers.openai.com/api/docs/guides/moderation)
### Going live
*   [Production best practices](https://developers.openai.com/api/docs/guides/production-best-practices)
*   [Deployment checklist](https://developers.openai.com/api/docs/guides/deployment-checklist)
*   
Latency optimization
    *   [Overview](https://developers.openai.com/api/docs/guides/latency-optimization)
    *   [Predicted Outputs](https://developers.openai.com/api/docs/guides/predicted-outputs)
    *   [Priority processing](https://developers.openai.com/api/docs/guides/priority-processing)
*   
Cost optimization
    *   [Overview](https://developers.openai.com/api/docs/guides/cost-optimization)
    *   [Batch](https://developers.openai.com/api/docs/guides/batch)
    *   [Flex processing](https://developers.openai.com/api/docs/guides/flex-processing)
*   [Accuracy optimization](https://developers.openai.com/api/docs/guides/optimizing-llm-accuracy)
*   
Safety
    *   [Safety best practices](https://developers.openai.com/api/docs/guides/safety-best-practices)
    *   [Safety checks](https://developers.openai.com/api/docs/guides/safety-checks)
    *   [Cybersecurity checks](https://developers.openai.com/api/docs/guides/safety-checks/cybersecurity)
    *   [Under 18 API Guidance](https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance)
### Legacy APIs
*   
Assistants API
    *   [Migration guide](https://developers.openai.com/api/docs/assistants/migration)
    *   [Deep dive](https://developers.openai.com/api/docs/assistants/deep-dive)
    *   [Tools](https://developers.openai.com/api/docs/assistants/tools)
### Resources
*   [Terms and policies](https://openai.com/policies)
*   [Changelog](https://developers.openai.com/api/docs/changelog)
*   [Your data](https://developers.openai.com/api/docs/guides/your-data)
*   [Permissions](https://developers.openai.com/api/docs/guides/rbac)
*   [Rate limits](https://developers.openai.com/api/docs/guides/rate-limits)
*   [Admin APIs](https://developers.openai.com/api/docs/guides/admin-apis)
*   [Deprecations](https://developers.openai.com/api/docs/deprecations)
*   [MCP for deep research](https://developers.openai.com/api/docs/mcp)
*   [Developer mode](https://developers.openai.com/api/docs/guides/developer-mode)
*   
ChatGPT Actions
    *   [Introduction](https://developers.openai.com/api/docs/actions/introduction)
    *   [Getting started](https://developers.openai.com/api/docs/actions/getting-started)
    *   [Actions library](https://developers.openai.com/api/docs/actions/actions-library)
    *   [Authentication](https://developers.openai.com/api/docs/actions/authentication)
    *   [Production](https://developers.openai.com/api/docs/actions/production)
    *   [Data retrieval](https://developers.openai.com/api/docs/actions/data-retrieval)
    *   [Sending files](https://developers.openai.com/api/docs/actions/sending-files)
 Docs  Use cases 
### Getting Started
*   [Overview](https://developers.openai.com/codex)
*   [Quickstart](https://developers.openai.com/codex/quickstart)
*   [Explore use cases](https://developers.openai.com/codex/use-cases)
*   [Migrate](https://developers.openai.com/codex/migrate)
*   [Pricing](https://developers.openai.com/codex/pricing)
*   
Concepts
    *   [Prompting](https://developers.openai.com/codex/prompting)
    *   [Customization](https://developers.openai.com/codex/concepts/customization)
    *   
[Memories](https://developers.openai.com/codex/memories)
        *   [Chronicle](https://developers.openai.com/codex/memories/chronicle)
    *   [Sandboxing](https://developers.openai.com/codex/concepts/sandboxing)
    *   [Subagents](https://developers.openai.com/codex/concepts/subagents)
    *   [Workflows](https://developers.openai.com/codex/workflows)
    *   [Models](https://developers.openai.com/codex/models)
    *   [Cyber Safety](https://developers.openai.com/codex/concepts/cyber-safety)
### Using Codex
*   
App
    *   [Overview](https://developers.openai.com/codex/app)
    *   [Features](https://developers.openai.com/codex/app/features)
    *   [Settings](https://developers.openai.com/codex/app/settings)
    *   [Review](https://developers.openai.com/codex/app/review)
    *   [Automations](https://developers.openai.com/codex/app/automations)
    *   [Worktrees](https://developers.openai.com/codex/app/worktrees)
    *   [Local Environments](https://developers.openai.com/codex/app/local-environments)
    *   [In-app browser](https://developers.openai.com/codex/app/browser)
    *   [Chrome extension](https://developers.openai.com/codex/app/chrome-extension)
    *   [Computer Use](https://developers.openai.com/codex/app/computer-use)
    *   [Commands](https://developers.openai.com/codex/app/commands)
    *   [Windows](https://developers.openai.com/codex/app/windows)
    *   [Troubleshooting](https://developers.openai.com/codex/app/troubleshooting)
*   
IDE Extension
    *   [Overview](https://developers.openai.com/codex/ide)
    *   [Features](https://developers.openai.com/codex/ide/features)
    *   [Settings](https://developers.openai.com/codex/ide/settings)
    *   [IDE Commands](https://developers.openai.com/codex/ide/commands)
    *   [Slash commands](https://developers.openai.com/codex/ide/slash-commands)
*   
CLI
    *   [Overview](https://developers.openai.com/codex/cli)
    *   [Features](https://developers.openai.com/codex/cli/features)
    *   [Command Line Options](https://developers.openai.com/codex/cli/reference)
    *   [Slash commands](https://developers.openai.com/codex/cli/slash-commands)
*   
Web
    *   [Overview](https://developers.openai.com/codex/cloud)
    *   [Environments](https://developers.openai.com/codex/cloud/environments)
    *   [Internet Access](https://developers.openai.com/codex/cloud/internet-access)
*   
Integrations
    *   [GitHub](https://developers.openai.com/codex/integrations/github)
    *   [Slack](https://developers.openai.com/codex/integrations/slack)
    *   [Linear](https://developers.openai.com/codex/integrations/linear)
*   
Codex Security
    *   [Overview](https://developers.openai.com/codex/security)
    *   [Setup](https://developers.openai.com/codex/security/setup)
    *   [Improving the threat model](https://developers.openai.com/codex/security/threat-model)
    *   [FAQ](https://developers.openai.com/codex/security/faq)
### Configuration
*   
Config File
    *   [Config Basics](https://developers.openai.com/codex/config-basic)
    *   [Advanced Config](https://developers.openai.com/codex/config-advanced)
    *   [Config Reference](https://developers.openai.com/codex/config-reference)
    *   [Sample Config](https://developers.openai.com/codex/config-sample)
*   [Speed](https://developers.openai.com/codex/speed)
*   [Rules](https://developers.openai.com/codex/rules)
*   [Hooks](https://developers.openai.com/codex/hooks)
*   [AGENTS.md](https://developers.openai.com/codex/guides/agents-md)
*   [MCP](https://developers.openai.com/codex/mcp)
*   
Plugins
    *   [Overview](https://developers.openai.com/codex/plugins)
    *   [Build plugins](https://developers.openai.com/codex/plugins/build)
*   [Skills](https://developers.openai.com/codex/skills)
*   [Subagents](https://developers.openai.com/codex/subagents)
### Administration
*   [Authentication](https://developers.openai.com/codex/auth)
*   [Agent approvals & security](https://developers.openai.com/codex/agent-approvals-security)
*   [Remote connections](https://developers.openai.com/codex/remote-connections)
*   
Enterprise
    *   [Admin Setup](https://developers.openai.com/codex/enterprise/admin-setup)
    *   [Governance](https://developers.openai.com/codex/enterprise/governance)
    *   [Managed configuration](https://developers.openai.com/codex/enterprise/managed-configuration)
*   [Windows](https://developers.openai.com/codex/windows)
### Automation
*   [Non-interactive Mode](https://developers.openai.com/codex/noninteractive)
*   [Codex SDK](https://developers.openai.com/codex/sdk)
*   [App Server](https://developers.openai.com/codex/app-server)
*   [MCP Server](https://developers.openai.com/codex/guides/agents-sdk)
*   [GitHub Action](https://developers.openai.com/codex/github-action)
### Learn
*   [Best practices](https://developers.openai.com/codex/learn/best-practices)
*   [Videos](https://developers.openai.com/codex/videos)
*   [Community](https://developers.openai.com/community)
*   
Blog
    *   [Using skills to accelerate OSS maintenance](https://developers.openai.com/blog/skills-agents-sdk)
    *   [Building frontend UIs with Codex and Figma](https://developers.openai.com/blog/building-frontend-uis-with-codex-and-figma)
    *   [View all](https://developers.openai.com/blog/topic/codex)
*   
Cookbooks
    *   [Codex Prompting Guide](https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide)
    *   [Modernizing your Codebase with Codex](https://developers.openai.com/cookbook/examples/codex/code_modernization)
    *   [View all](https://developers.openai.com/cookbook/topic/codex)
*   [Building AI Teams](https://developers.openai.com/codex/guides/build-ai-native-engineering-team)
### Releases
*   [Changelog](https://developers.openai.com/codex/changelog)
*   [Feature Maturity](https://developers.openai.com/codex/feature-maturity)
*   [Open Source](https://developers.openai.com/codex/open-source)
*   [Home](https://developers.openai.com/codex/use-cases)
*   [Collections](https://developers.openai.com/codex/use-cases/collections)
 Apps SDK  Commerce  Ads 
*   [Home](https://developers.openai.com/apps-sdk)
*   [Quickstart](https://developers.openai.com/apps-sdk/quickstart)
### Core Concepts
*   [MCP Apps in ChatGPT](https://developers.openai.com/apps-sdk/mcp-apps-in-chatgpt)
*   [MCP Server](https://developers.openai.com/apps-sdk/concepts/mcp-server)
*   [UX principles](https://developers.openai.com/apps-sdk/concepts/ux-principles)
*   [UI guidelines](https://developers.openai.com/apps-sdk/concepts/ui-guidelines)
### Plan
*   [Research use cases](https://developers.openai.com/apps-sdk/plan/use-case)
*   [Define tools](https://developers.openai.com/apps-sdk/plan/tools)
*   [Design components](https://developers.openai.com/apps-sdk/plan/components)
### Build
*   [Set up your server](https://developers.openai.com/apps-sdk/build/mcp-server)
*   [Build your ChatGPT UI](https://developers.openai.com/apps-sdk/build/chatgpt-ui)
*   [Authenticate users](https://developers.openai.com/apps-sdk/build/auth)
*   [Manage state](https://developers.openai.com/apps-sdk/build/state-management)
*   [Monetize your app](https://developers.openai.com/apps-sdk/build/monetization)
*   [Examples](https://developers.openai.com/apps-sdk/build/examples)
### Deploy
*   [Deploy your app](https://developers.openai.com/apps-sdk/deploy)
*   [Connect from ChatGPT](https://developers.openai.com/apps-sdk/deploy/connect-chatgpt)
*   [Test your integration](https://developers.openai.com/apps-sdk/deploy/testing)
*   [Submit your app](https://developers.openai.com/apps-sdk/deploy/submission)
### Conversion apps
*   [Restaurant reservation spec](https://developers.openai.com/apps-sdk/guides/restaurant-reservation-conversion-spec)
*   [Product checkout spec](https://developers.openai.com/apps-sdk/guides/product-checkout-conversion-spec)
### Guides
*   [Optimize Metadata](https://developers.openai.com/apps-sdk/guides/optimize-metadata)
*   [Security & Privacy](https://developers.openai.com/apps-sdk/guides/security-privacy)
*   [Troubleshooting](https://developers.openai.com/apps-sdk/deploy/troubleshooting)
### Resources
*   [Changelog](https://developers.openai.com/apps-sdk/changelog)
*   [App submission guidelines](https://developers.openai.com/apps-sdk/app-submission-guidelines)
*   [Reference](https://developers.openai.com/apps-sdk/reference)
*   [Home](https://developers.openai.com/commerce)
### Guides
*   [Get started](https://developers.openai.com/commerce/guides/get-started)
*   [Best practices](https://developers.openai.com/commerce/guides/best-practices)
### File Upload
*   [Overview](https://developers.openai.com/commerce/specs/file-upload/overview)
*   [Products](https://developers.openai.com/commerce/specs/file-upload/products)
### API
*   [Overview](https://developers.openai.com/commerce/specs/api/overview)
*   [Feeds](https://developers.openai.com/commerce/specs/api/feeds)
*   [Products](https://developers.openai.com/commerce/specs/api/products)
*   [Promotions](https://developers.openai.com/commerce/specs/api/promotions)
*   [Ads Overview](https://developers.openai.com/ads)
### Measurement
*   [JavaScript Pixel](https://developers.openai.com/ads/measurement-pixel)
*   [Conversions API](https://developers.openai.com/ads/conversions-api)
*   [Supported events](https://developers.openai.com/ads/supported-events)
### Advertiser API
*   [Overview](https://developers.openai.com/ads/api-overview)
*   [Quickstart](https://developers.openai.com/ads/api-quickstart)
### API Reference
*   [Authentication](https://developers.openai.com/ads/api-reference/authentication)
*   [Campaigns](https://developers.openai.com/ads/api-reference/campaigns)
*   [Ad Groups](https://developers.openai.com/ads/api-reference/ad-groups)
*   [Ads](https://developers.openai.com/ads/api-reference/ads)
*   [Ad Account](https://developers.openai.com/ads/api-reference/ad-account)
*   [Insights](https://developers.openai.com/ads/api-reference/insights)
*   [Files](https://developers.openai.com/ads/api-reference/files)
 Showcase  Blog  Cookbook  Learn  Community 
*   [Home](https://developers.openai.com/showcase)
*   [API examples](https://developers.openai.com/showcase/api-examples)
*   [All posts](https://developers.openai.com/blog)
### Recent
*   [How Perplexity Brought Voice Search to Millions Using the Realtime API](https://developers.openai.com/blog/realtime-perplexity-computer)
*   [Designing delightful frontends with GPT-5.4](https://developers.openai.com/blog/designing-delightful-frontends-with-gpt-5-4)
*   [From prompts to products: One year of Responses](https://developers.openai.com/blog/one-year-of-responses)
*   [Using skills to accelerate OSS maintenance](https://developers.openai.com/blog/skills-agents-sdk)
*   [Building frontend UIs with Codex and Figma](https://developers.openai.com/blog/building-frontend-uis-with-codex-and-figma)
### Topics
*   [General](https://developers.openai.com/blog/topic/general)
*   [API](https://developers.openai.com/blog/topic/api)
*   [Apps SDK](https://developers.openai.com/blog/topic/apps-sdk)
*   [Audio](https://developers.openai.com/blog/topic/audio)
*   [Codex](https://developers.openai.com/blog/topic/codex)
*   [Home](https://developers.openai.com/cookbook)
### Topics
*   [Agents](https://developers.openai.com/cookbook/topic/agents)
*   [Evals](https://developers.openai.com/cookbook/topic/evals)
*   [Multimodal](https://developers.openai.com/cookbook/topic/multimodal)
*   [Text](https://developers.openai.com/cookbook/topic/text)
*   [Guardrails](https://developers.openai.com/cookbook/topic/guardrails)
*   [Optimization](https://developers.openai.com/cookbook/topic/optimization)
*   [ChatGPT](https://developers.openai.com/cookbook/topic/chatgpt)
*   [Codex](https://developers.openai.com/cookbook/topic/codex)
*   [gpt-oss](https://developers.openai.com/cookbook/topic/gpt-oss)
### Contribute
*   [Cookbook on GitHub](https://github.com/openai/openai-cookbook)
*   [Home](https://developers.openai.com/learn)
*   [OpenAI Developers plugin](https://developers.openai.com/learn/developers-codex-plugin)
*   [Docs MCP](https://developers.openai.com/learn/docs-mcp)
### Categories
*   [Demo apps](https://developers.openai.com/learn/code)
*   [Videos](https://developers.openai.com/learn/videos)
### Topics
*   [Agents](https://developers.openai.com/learn/agents)
*   [Audio & Voice](https://developers.openai.com/learn/audio)
*   [Computer Use](https://developers.openai.com/learn/cua)
*   [Codex](https://developers.openai.com/learn/codex)
*   [Evals](https://developers.openai.com/learn/evals)
*   [gpt-oss](https://developers.openai.com/learn/gpt-oss)
*   [Fine-tuning](https://developers.openai.com/learn/fine-tuning)
*   [Image generation](https://developers.openai.com/learn/imagegen)
*   [Scaling](https://developers.openai.com/learn/scaling)
*   [Tools](https://developers.openai.com/learn/tools)
*   [Video generation](https://developers.openai.com/learn/videogen)
*   [Community](https://developers.openai.com/community)
### Programs
*   [Codex Ambassadors](https://developers.openai.com/community/codex-ambassadors)
*   [Codex for Students](https://developers.openai.com/community/students)
*   [Codex for Open Source](https://developers.openai.com/community/codex-for-oss)
### Events
*   [Meetups](https://developers.openai.com/community/meetups)
*   [Hackathon Support](https://developers.openai.com/community/hackathons)
*   [Forum](https://community.openai.com/)
*   [Discord](https://discord.com/invite/openai)
[API Dashboard](https://platform.openai.com/login)
*   [Home](https://developers.openai.com/cookbook)
### Topics
*   [Agents](https://developers.openai.com/cookbook/topic/agents)
*   [Evals](https://developers.openai.com/cookbook/topic/evals)
*   [Multimodal](https://developers.openai.com/cookbook/topic/multimodal)
*   [Text](https://developers.openai.com/cookbook/topic/text)
*   [Guardrails](https://developers.openai.com/cookbook/topic/guardrails)
*   [Optimization](https://developers.openai.com/cookbook/topic/optimization)
*   [ChatGPT](https://developers.openai.com/cookbook/topic/chatgpt)
*   [Codex](https://developers.openai.com/cookbook/topic/codex)
*   [gpt-oss](https://developers.openai.com/cookbook/topic/gpt-oss)
### Contribute
*   [Cookbook on GitHub](https://github.com/openai/openai-cookbook)
Copy Page
Copy Page
May 7, 2026
[![Image 2: Erika Kettleson](https://avatars.githubusercontent.com/u/186107044?v=4) EK](https://www.linkedin.com/in/erika-kettleson-85763196/)
[Erika Kettleson (OpenAI)](https://www.linkedin.com/in/erika-kettleson-85763196/)
[View on GitHub](https://github.com/openai/openai-cookbook/blob/main/examples/voice_solutions/realtime_translation_guide.mdx)[Download raw](https://raw.githubusercontent.com/openai/openai-cookbook/main/examples/voice_solutions/realtime_translation_guide.mdx)
`gpt-realtime-translate` is a live speech-to-speech translation model for building multilingual audio experiences across broadcasts, streams, calls, and video conversations. It accepts spoken input, automatically detects the source language, and returns translated speech plus text transcripts. Developers only need to specify the target output language.
This model has two new features that make it uniquely capable:
1.   Unlike general-purpose voice models, `gpt-realtime-translate` is **optimized for interpretation**. It was trained on thousands of hours of professional interpreter audio, which helps it remain translation-only and wait for enough context before producing speech. This is especially important across languages with different sentence structures.
2.   It can **process input audio while simultaneously streaming translated audio back**. This allows for truly low latency over continuous speech.
We built `gpt-realtime-translate` because live interpretation has different requirements than existing AI voice interactions. General-purpose models can be prompted to translate, but they may still answer questions or follow instructions rather than translate them. They also rely on turn-based interaction, requiring speakers to pause while the model generates the translated audio, which does not work well for fluent interpretation.
These have been the main blockers to the high accuracy and low latency required for natural live interpretation, and what we’re solving for with `gpt-realtime-translate`.
## How to build with Realtime Translation
This model is unique in that it is primarily about **empowering humans to be multilingual as opposed to building AI voice agents**. If you’re building voice agents, use the new `gpt-realtime-2` model.
We see two main patterns for `gpt-realtime-translate`. The first is **broadcast-style translation**: livestreams, webinars, lectures, earnings calls, conference keynotes, and other cases where many listeners need translated audio from one primary source to another. The second is **conversational translation**, where two or more participants speak with each other across languages: call centers, video chat, or other phone-based workflows.
This cookbook focuses on these patterns: We’ll start by covering the basics, then build a web app for **one-way live translation** from any browser tab audio, use Twilio to build translation into **phone calls**, and create a **multilingual group video chat** room with LiveKit. Lastly, we’ll cover production best practices, model limitations, and evals.
## What you will build
You will build three ways to add live translation to existing audio paths:
1.   **Browser tab translation:** Capture tab audio with `getDisplayMedia()`, send it to Realtime Translation over WebRTC, and play translated speech plus captions in the browser.
2.   **Phone-call translation:** Use Twilio Media Streams to receive phone audio over WebSockets, bridge it into Realtime Translation, and send translated audio back to the other caller.
3.   **Video-call translation:** Subscribe to remote LiveKit microphone tracks, translate each remote speaker for the listener, and render translated audio and captions locally.
The complete demo apps live in the accompanying folders:
*   [Browser tab translation](https://github.com/openai/openai-cookbook/tree/main/examples/voice_solutions/realtime_translation_guide/browser-translation-demo)
*   [Twilio phone translation](https://github.com/openai/openai-cookbook/tree/main/examples/voice_solutions/realtime_translation_guide/twilio-translation-demo)
*   [LiveKit video translation](https://github.com/openai/openai-cookbook/tree/main/examples/voice_solutions/realtime_translation_guide/livekit-translation-demo)
## Prerequisites
You need:
*   An OpenAI API key.
*   Node.js for the browser and Twilio demos.
*   A Twilio phone number if you want to run the phone-call demo.
*   A LiveKit project or self-hosted LiveKit server if you want to run the video-room demo.
Keep your OpenAI API key on a server. Browser examples should use short-lived client secrets rather than exposing the API key to client code.
## API & Session Basics
See our [Live Translation docs](https://developers.openai.com/api/docs/guides/realtime-translation) for full details on setting up WebRTC and WebSocket sessions, client and server events, and configuration options.
### Key differences
Realtime Translation sessions are configured around the target output language. Set the target language with `session.audio.output.language`. The model currently supports over 70 input languages and 13 output languages. This model does not currently support custom prompting or voice selection parameters.
If you want source-language transcripts alongside translated audio, configure input transcription with `gpt-realtime-whisper`.
Realtime Translation uses **dynamic voice adaptation**. Instead of selecting a fixed output voice, translated speech follows the source speaker’s general tone, pitch, and speaking style. In a multi-speaker session, the translated voice will change as new speaker audio comes in.
### Session lifecycle
The session lifecycle is also different from a standard Realtime voice session:
*   **Dedicated endpoint:** Connect to `/v1/realtime/translations`.
*   **Continuous audio in**: Stream 24 kHz PCM16 audio with `session.input_audio_buffer.append`, including silence between phrases.
*   **Continuous translation out**: The model emits translated audio in 200 ms PCM16 chunks, plus target-language transcript deltas.
*   **No turn lifecycle**: Translation starts from the incoming audio stream itself. There is no `response.create`, assistant turn, tool call, or conversation state to manage.
### Protocols
For browser-based apps, use WebRTC. The browser sends microphone, tab, or remote participant audio as a media track and receives translated speech as a remote audio track. Use the `oai-events` data channel for session updates, transcript deltas, and errors. See the Browser Tab Translation or LiveKit sections for implementation examples.
For backend media pipelines, use WebSockets. This is the right fit when your server already receives raw audio, such as Twilio Media Streams, SIP, broadcast ingest, or a media worker. Send base64 24 kHz PCM16 audio with `session.input_audio_buffer.append`, including silence between spoken phrases. See the Phone Calls with Twilio section for an example.
## Browser tab translation
Let’s start with a small browser app for one-way live translation. The app captures audio from a browser tab, starts a Realtime Translation session over WebRTC, and plays translated speech with subtitles as the model emits them.
This pattern is useful when the original experience is already happening in the browser: a public meeting, livestream, conference talk, online class, or video without built-in live dubbing. Instead of rebuilding the player or publishing separate language feeds, the app sits alongside the page and gives listeners translated audio and subtitles in real time.
![Image 3: Browser tab translation architecture](https://github.com/openai/openai-cookbook/blob/main/images/realtime_translation_guide/browser-tab-translation.png?raw=true)
### How it works
1.   Your server creates a short-lived translation client secret.
2.   The browser captures tab audio with `getDisplayMedia()`.
3.   The browser creates an `RTCPeerConnection`, adds the captured audio track, and opens an `oai-events` data channel.
4.   The browser posts its SDP offer to the Realtime Translation call endpoint with the client secret.
5.   The model returns translated audio on the remote WebRTC audio track and sends transcript deltas on the data channel.
### Create the translation client secret
Create the client secret on your server so your standard OpenAI API key never reaches the browser. The model and output language live in the client-secret request.
```
const TRANSLATION_CLIENT_SECRET_URL =
  "https://api.openai.com/v1/realtime/translations/client_secrets";
app.post("/session", async (req, res) => {
  const language = req.body.targetLanguage ?? "es";
  const response = await fetch(TRANSLATION_CLIENT_SECRET_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session: {
        model: "gpt-realtime-translate",
        audio: {
          input: {
            transcription: { model: "gpt-realtime-whisper" },
            noise_reduction: { type: "near_field" },
          },
          output: { language },
        },
      },
    }),
  });
  res.status(response.status).json(await response.json());
});
```
The complete browser demo validates target language codes before making the OpenAI request and returns only the short-lived client secret to the browser.
### Capture tab audio
Use `getDisplayMedia()` so the user explicitly picks the source tab. When supported, request `suppressLocalAudioPlayback` so the listener does not hear the original and translated audio at the same time.
```
async function captureTabAudio() {
  const audio = {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  };
  if (navigator.mediaDevices.getSupportedConstraints?.().suppressLocalAudioPlayback) {
    audio.suppressLocalAudioPlayback = true;
  }
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio,
  });
  if (!stream.getAudioTracks().length) {
    stream.getTracks().forEach((track) => track.stop());
    throw new Error("Choose a browser tab and enable tab audio.");
  }
  return stream;
}
```
### Open the WebRTC translation session
Use the short-lived client secret to post the browser’s SDP offer to the Realtime Translation call endpoint. Audio output arrives as a remote track. Translation and input transcript deltas arrive on the data channel.
```
const sessionResponse = await fetch("/session", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ targetLanguage }),
});
const session = await sessionResponse.json();
const pc = new RTCPeerConnection();
const events = pc.createDataChannel("oai-events");
for (const track of sourceStream.getAudioTracks()) {
  pc.addTrack(track, sourceStream);
}
pc.ontrack = ({ streams }) => {
  translatedAudio.srcObject = streams[0];
};
events.onmessage = ({ data }) => {
  const event = JSON.parse(data);
  if (event.type === "session.output_transcript.delta") {
    translatedSubtitles.textContent += event.delta;
  }
  if (event.type === "session.input_transcript.delta") {
    sourceTranscript.textContent += event.delta;
  }
};
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
const sdpResponse = await fetch(
  "https://api.openai.com/v1/realtime/translations/calls",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.client_secret}`,
      "Content-Type": "application/sdp",
    },
    body: offer.sdp,
  }
);
await pc.setRemoteDescription({
  type: "answer",
  sdp: await sdpResponse.text(),
});
```
Run the complete demo:
```
cd examples/voice_solutions/realtime_translation_guide/browser-translation-demo
npm install
npm run dev
```
Then open the local URL, choose a tab with audio, pick the target language, and start translation.
## Phone calls with Twilio
Next, let’s put `gpt-realtime-translate` into a Twilio call path. Conversational translation works best when each participant has a distinct audio stream. Twilio Media Streams gives your backend a server-side WebSocket for phone audio, and your server handles the format boundary: receiving caller audio, converting it for Realtime Translation, then converting translated audio back into Twilio media messages.
![Image 4: Twilio phone translation architecture](https://github.com/openai/openai-cookbook/blob/main/images/realtime_translation_guide/twilio-phone-translation.png?raw=true)
### How it works
1.   A caller joins and says their preferred output language.
2.   Twilio streams that caller’s audio to your backend.
3.   Your backend converts Twilio audio into the audio format expected by Realtime Translation.
4.   For each translation direction, your backend opens a Realtime Translation session with the listener’s target language.
5.   As translated audio comes back from OpenAI, your backend converts it back into Twilio media messages.
6.   Twilio plays the translated audio to the other participant.
For a two-person call, this usually means two translation sessions: A-to-B and B-to-A. For larger calls, create translation sessions based on who needs to hear which source speaker in which language rather than mixing all participants into one shared stream.
> **Production note:**`gpt-realtime-translate` may not translate audio that is already in the listener’s selected output language. Because this demo does not pass original Twilio audio through to the other participant, same-language speech may lead to silence. Production phone bridges should add original-audio passthrough or mixing. This demo pairs callers one-to-one; additional callers wait for another caller and form a separate pair.
### Configure the Twilio webhook
Create a public endpoint for your server, then set the Twilio phone number’s [Voice webhook](https://www.twilio.com/docs/usage/webhooks/voice-webhooks) to route inbound calls to your application. For local development, expose the server with a tunnel or deploy it somewhere Twilio can reach over port 443. The same host must serve the HTTP webhook routes and the WebSocket Media Stream route.
### Ask the caller for a target language
When a caller dials in, return [TwiML](https://www.twilio.com/docs/voice/twiml) that asks which language they want for the translation.
```
<Response>
  <Gather input="speech" timeout="10" speechTimeout="auto" action="/choose-language" method="POST">
    <Say>What language do you want to hear?</Say>
  </Gather>
  <Redirect method="POST">/choose-language</Redirect>
</Response>
```
### Start the Twilio Media Stream
After the caller chooses a supported language, return a bidirectional Media Stream. Pass the selected language as a custom parameter so the WebSocket handler can register the caller with their preferred output language.
```
<Response>
  <Say>You chose Spanish. Wait for the other caller, then begin speaking.</Say>
  <Connect>
    <Stream url="wss://YOUR_PUBLIC_HOST/media-stream">
      <Parameter name="callSid" value="CALL_SID" />
      <Parameter name="language" value="es" />
      <Parameter name="languageLabel" value="Spanish" />
    </Stream>
  </Connect>
</Response>
```
### Open a server-side translation session
Because this integration runs on your backend, you do not need browser client secrets. Open the Translation WebSocket directly from the server with your OpenAI API key and select the model in the URL.
```
import WebSocket from "ws";
function openTranslationSession({ targetLanguage }) {
  const ws = new WebSocket(
    "wss://api.openai.com/v1/realtime/translations?model=gpt-realtime-translate",
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );
  ws.on("open", () => {
    ws.send(JSON.stringify({
      type: "session.update",
      session: {
        audio: {
          input: {
            transcription: { model: "gpt-realtime-whisper" },
            noise_reduction: { type: "near_field" },
          },
          output: { language: targetLanguage },
        },
      },
    }));
  });
  return ws;
}
```
### Bridge Twilio audio into Realtime Translation
Twilio sends base64 `audio/x-mulaw` at 8 kHz. Realtime Translation expects base64 little-endian PCM16 at 24 kHz, so the bridge decodes u-law, resamples to 24 kHz, and appends the audio buffer. Keep sending audio continuously, including silence, since translation sessions are not turn-based and do not wait for `response.create`.
```
function sendTwilioAudioToTranslation(realtimeWs, twilioMessage) {
  if (twilioMessage.event !== "media") return;
  const realtimeAudio = twilioMediaToRealtimeAudio(
    twilioMessage.media.payload
  );
  realtimeWs.send(JSON.stringify({
    type: "session.input_audio_buffer.append",
    audio: realtimeAudio,
  }));
}
```
### Bridge translated audio back to Twilio
Realtime Translation emits translated audio as base64 24 kHz PCM16 in `session.output_audio.delta`. Before sending it to Twilio, convert it back to 8 kHz u-law and wrap it in a Twilio media message.
```
function sendTranslationToTwilio(twilioWs, streamSid, realtimeEvent) {
  if (realtimeEvent.type !== "session.output_audio.delta") return;
  const twilioPayload = realtimeAudioToTwilioMedia(realtimeEvent.delta);
  twilioWs.send(JSON.stringify({
    event: "media",
    streamSid,
    media: {
      payload: twilioPayload,
    },
  }));
}
```
### Pair callers and create one session per direction
Once two callers are waiting, pair them and open two Realtime Translation sessions. Each session’s output language is the language selected by the listener, not the speaker.
```
function pairCallers(a, b) {
  const aToB = openTranslationSession({ targetLanguage: b.language });
  const bToA = openTranslationSession({ targetLanguage: a.language });
  a.onAudio = (message) => sendTwilioAudioToTranslation(aToB, message);
  b.onAudio = (message) => sendTwilioAudioToTranslation(bToA, message);
  aToB.on("message", (data) => {
    sendTranslationToTwilio(b.ws, b.streamSid, JSON.parse(data));
  });
  bToA.on("message", (data) => {
    sendTranslationToTwilio(a.ws, a.streamSid, JSON.parse(data));
  });
}
```
Run the complete demo:
```
cd examples/voice_solutions/realtime_translation_guide/twilio-translation-demo
npm install
npm run dev
```
Configure your Twilio phone number’s Voice webhook to call `POST https://YOUR_PUBLIC_HOST/incoming-call`.
## Video chat with LiveKit
Finally, let’s integrate `gpt-realtime-translate` into a group video conference. Use this pattern when you already have a video room and want to add live interpretation to the conversation. [LiveKit](https://docs.livekit.io/) handles rooms, participants, microphone tracks, camera tracks, device selection, and reconnect behavior. Realtime Translation acts as an interpreter layer attached to the audio tracks that each listener receives.
![Image 5: LiveKit video translation architecture](https://github.com/openai/openai-cookbook/blob/main/images/realtime_translation_guide/livekit-video-translation.png?raw=true)
### How it works
1.   A participant publishes microphone and camera tracks into the LiveKit room.
2.   A listener subscribes to the remote participant’s microphone track through LiveKit.
3.   The listener’s browser passes that remote `MediaStreamTrack` into a Realtime Translation sidecar.
4.   The sidecar opens a WebRTC Realtime Translation session for the listener’s selected output language.
5.   Realtime Translation returns translated audio as a remote audio track and transcript deltas over the `oai-events` data channel.
6.   The listener’s browser plays the translated audio, renders captions, and ducks or mixes the original LiveKit audio locally.
In this demo, translated audio stays local to the listener’s browser; it is not published back into the LiveKit room.
### Attach translation to a remote participant track
Once the listener joins a LiveKit room, find each remote participant’s microphone track and pass the underlying `MediaStreamTrack` into a translation helper.
```
function getParticipantAudioMediaStreamTrack(participant: Participant) {
  const publication = participant.getTrackPublication(Track.Source.Microphone);
  return publication?.audioTrack?.mediaStreamTrack ?? null;
}
```
### Create one translation sidecar per remote speaker
A translated participant tile can keep the original LiveKit media path intact while adding translation output beside it. The tile still renders the participant’s video and original audio, but it also starts a Realtime Translation sidecar for the participant’s microphone track when translation is enabled.
```
function TranslatedParticipantTile({
  participant,
  language,
  translationEnabled,
}: {
  participant: Participant;
  language: string;
  translationEnabled: boolean;
}) {
  const sourceTrack = getParticipantAudioMediaStreamTrack(participant);
  const translation = useRemoteTranslation({
    enabled: translationEnabled && Boolean(sourceTrack),
    sourceTrack,
    language,
  });
  return (
    <MeetingTile
      participant={participant}
      sourceVolume={translation.hasOutputAudio ? 0.15 : 1}
      translatedSubtitle={translation.translatedSubtitle}
      sourceSubtitle={translation.sourceSubtitle}
    />
  );
}
```
### Open the translation sidecar
The helper creates a short-lived Realtime Translation client secret on your server, opens a WebRTC sidecar from the browser, attaches the remote LiveKit microphone `MediaStreamTrack` to an `RTCPeerConnection`, and plays translated audio from the returned remote track.
```
async function startTranslationSidecar({ sourceTrack, clientSecret }) {
  const pc = new RTCPeerConnection();
  pc.addTrack(sourceTrack, new MediaStream([sourceTrack]));
  const translatedAudio = new Audio();
  translatedAudio.autoplay = true;
  pc.ontrack = ({ streams }) => {
    translatedAudio.srcObject = streams[0];
  };
  const events = pc.createDataChannel("oai-events");
  events.onmessage = ({ data }) => {
    const event = JSON.parse(data);
    if (event.type === "session.output_transcript.delta") {
      subtitles.textContent += event.delta;
    }
  };
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  const response = await fetch(
    "https://api.openai.com/v1/realtime/translations/calls",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clientSecret}`,
        "Content-Type": "application/sdp",
      },
      body: offer.sdp,
    }
  );
  await pc.setRemoteDescription({
    type: "answer",
    sdp: await response.text(),
  });
  return pc;
}
```
### Plan session fanout by listener language
For a two-person room, each participant translates the other participant’s microphone track into their own preferred language. For a group room, the number of active translation sessions depends on the number of active remote speakers and the number of distinct target languages listeners need.
Browser-side translation is the simplest architecture: each listener creates translation sidecars for the remote speakers they want translated. For larger rooms in production, move the work into a LiveKit worker or server-side participant that subscribes to room audio, translates each source speaker once per target language, and republishes translated tracks back into the room.
Run the complete demo:
```
cd examples/voice_solutions/realtime_translation_guide/livekit-translation-demo
pnpm install
pnpm dev
```
Use the same meeting code in two browser windows to join the same LiveKit room. Enable translation in one window, choose the language that listener wants to hear, and speak from the other window.
## Production readiness
Before launching Realtime Translation, test the full experience with the same audio, languages, network conditions, and user flows you expect in production. Translation quality is only one part of the experience: latency, speaker routing, captions, reconnect behavior, and audio controls all impact production readiness.
### Choose the architecture based on the media path
Use browser WebRTC for client-side media like microphones, tab audio, or LiveKit participant tracks. Use server-side WebSockets for telephony, broadcast ingest, or backend media pipelines.
For multi-party calls, route translation by source speaker and target language. Keep speaker tracks separate when possible, then fan out the translated output to listeners who share the same target language. Mixing all speakers into one stream makes captions, speaker identity, and overlapping speech harder to handle.
### Test terminology and names directly
The model does not currently support custom prompts, glossaries, or pronunciation guides. If your use case depends on specific vocabulary, names, legal or medical terms, or other domain language, test those terms directly. The model can sometimes substitute incorrect names or entities while translating, so include these cases in your launch evaluation set.
### Account for mixed-language speech
Realtime Translation tries not to translate speech that is already in the selected output language. For example, if the output language is Spanish and the speaker switches into Spanish, the model may not produce translated audio for that segment.
This matters for mixed-language speech. Spanglish to German should work as expected because both the English and Spanish parts need to be translated into German. Spanglish to English can feel choppier because the model may translate the Spanish parts but stay quiet during the English parts.
This behavior is usually helpful, but it can be confusing if your app fully mutes the original audio. If you expect speakers to mix languages, keep the original audio available. A good pattern is to duck the original audio while translated audio is playing rather than fully muting it. You can also offer source-language captions or an original/translated audio mix control.
### Supported languages
Realtime Translation currently supports 13 target output languages: Spanish, Portuguese, French, Japanese, Russian, Chinese, German, Korean, Hindi, Indonesian, Vietnamese, Italian, and English.
The model currently supports over 70 input languages. It can dynamically detect and translate from Arabic, Afrikaans, Azerbaijani, Belarusian, Bengali, Bosnian, Bulgarian, Catalan, Chinese, Croatian, Czech, Danish, Dutch, Dzongkha, English, Esperanto, Estonian, Basque, Persian / Farsi, Finnish, Filipino, French, Galician, German, Greek, Gujarati, Haitian Creole, Hawaiian, Hebrew, Hindi, Hungarian, Armenian, Indonesian, Italian, Japanese, Javanese, Georgian, Kazakh, Korean, Kurdish, Latin, Latvian, Lithuanian, Macedonian, Malay, Malayalam, Maori, Mongolian, Burmese / Myanmar, Nepali, Norwegian, Nynorsk, Polish, Portuguese, Punjabi, Romanian, Russian, Serbian, Shona, Slovak, Slovenian, Albanian, Spanish, Swahili, Swedish, Tagalog, Telugu, Thai, Turkish, Ukrainian, Uzbek, Vietnamese, Welsh, and Yoruba.
### Evaluate meaning and latency separately
For evaluations, keep the source audio, generated translated audio, generated transcript, and reference text together for each run. You want to be able to answer three questions later:
*   What did the model hear?
*   What did it say?
*   What should it have said?
Use the best human reference you can get, such as human-edited subtitles, a professional interpreter transcript, a call transcript reviewed by a bilingual speaker, or a human dub of the source material. Automatic captions and transcripts are useful for quick smoke tests, but they are weaker as the source of truth.
If your reference has timestamps, use them. Time-aligned subtitles or transcripts let you evaluate not just translation quality, but also when the translated audio and captions arrived.
Score translations by meaning, not exact wording. A good translation may use different words, so evaluate whether the important facts, nuance, entities, numbers, and tone are preserved. Track the full distribution of misses, not just the average score, because a few bad errors can matter a lot in live translation.
Traditional text metrics like BLEU can help with quick comparisons, but they are a weak proxy for speech-to-speech quality because they miss semantic similarity.
Measure latency separately from quality. Track source speech to translated audio and source speech to displayed captions. Only use segments where the translation is meaningfully aligned when calculating delay; otherwise, bad matches can make timing data misleading.
Finally, review low-scoring examples manually. Listen to the original source, the generated translation, and the reference segment side by side. This is where you catch the issues aggregate scores miss, especially names, numbers, partial translations, tone, and cases where the model skipped or delayed content.
For a deeper treatment of Realtime evaluation, see the [Realtime eval guide](https://developers.openai.com/cookbook/examples/realtime_eval_guide).
## Conclusion
Realtime Translation changes what it means to build applications for multilingual users. It turns live interpretation into a native part of the product experience, so multilingual conversations can feel less like using a translation tool and more like simply understanding each other in real time. With a dedicated translation session, audio can move through browsers, phone calls, and video rooms as part of the experience itself.
By making language a smaller barrier, these applications can help more people participate, collaborate, and connect.