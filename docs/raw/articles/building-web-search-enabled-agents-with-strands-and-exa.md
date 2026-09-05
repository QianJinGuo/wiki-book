---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/building-web-search-enabled-agents-with-strands-and-exa/
tags: [aws-china-blog, agentic-ai, context-engineering]
review_value: 7
review_confidence: 8
review_recommendation: worth-reading
review_stars: 3
ingested: 2026-05-12
sha256: 1056c84bb88c4e6bcba306487e10a3b06a951e7403ba1776319c50f9f268c5a9
---
# Building web search-enabled agents with Strands and Exa
_This post is co written by Ishan Goswami and Nitya Sridhar from Exa._
If you are building web search-enabled AI agents for research, fact-checking, or competitive intelligence, access to current and reliable information is critical. Most general-purpose search APIs are not designed for agent workflows. They return HTML-heavy pages and short snippets optimized for human browsing, not structured data that an agent can directly consume. As a result, developers often need to build additional layers, custom crawlers, parsers, and ranking logic, to transform this content into something usable within an agent workflow.
The Exa integration for the [Strands Agents SDK](<https://strandsagents.com/>) addresses this gap with an AI-native search and retrieval layer built directly into the tool interface. Exa delivers clean, structured content formatted for direct use in LLM context windows, without requiring post-processing to strip markup or reformat output. Combined with the Strands Agents SDK’s model-driven architecture, where the model decides when to invoke tools and how to use their outputs, agents can draw real-time web knowledge into their reasoning loop.
In practice, your agent accesses this integration through two tools: `exa_search`, which performs semantic search with support for categories like news, research papers, and repositories, and `exa_get_contents`, which retrieves full content from selected URLs. In this post, you will learn how to set up the Exa integration in Strands Agents, understand the two core tools it exposes, and walk through real-world use cases that show how agents use web search to complete multi-step tasks.
## Strands Agents
The Strands Agents SDK is an open source framework from AWS for building AI agents using a model-driven approach. Rather than writing hard-coded workflows that dictate every step, developers provide a model, a system prompt, and a list of tools. The model itself decides what to do next: which tools to call, in what order, and when the task is done. At the core of Strands Agents is the agent loop. On each iteration, the model receives the full conversation history, including every prior tool call and its result. If the model needs more information, it requests a tool; Strands Agents executes it and feeds the result back. The loop continues until the model produces a final answer. This accumulation of context across iterations is what makes agents capable of tackling multi-step tasks that go beyond what a single LLM call can handle. The Strands Agents SDK ships with over 40 pre-built tools covering file I/O, shell execution, web search, AWS APIs, memory, code execution, and more. It also supports Model Context Protocol (MCP), so tools exposed by MCP servers are available to an agent without additional integration work. Adding new tools, including the Exa web search tools, follows the same pattern: drop them into the `tools=[]` list and the model learns how to use them from their signatures.
## Exa
Exa is a web-scale search engine built specifically for LLMs and AI agents. Exa is a search engine that understands the meaning of a query, not just its keywords. A query like “startups building climate solutions” returns actual climate startups, even if those pages never use that exact phrase. The model matches on semantic similarity, not string overlap. Results come back as clean, structured content with no ads or SEO noise, ready for an LLM to consume directly.
## Strands Agents and Exa: Integration overview
The Exa integration is available through the `strands-agents-tools` package. It gives your agent two capabilities: searching the web for relevant content and extracting full-page text from specific URLs. The diagram below visualizes the deep research assistant example which will talk in depth in the later part of this blog.
Both are optimized for AI consumption, returning structured content that your agent can reason over directly.
  * `exa_search`: Search the web using multiple modes including auto, fast, and deep. Your agent can refine results with filters for category, domain, date, and text content.
  * `exa_get_contents`: Retrieve full-page content from URLs your agent has discovered whether from a previous search or from its own reasoning. The tool checks for cached results first to speed up repeated requests. If fresh content is needed, it can automatically fall back to live crawling to retrieve the most up-to-date version of the page.
### Searching the web with `exa_search`
The `exa_search` tool gives your agent control over web search that goes beyond a basic query string. The tool supports four search modes. The default mode, `auto`, is the recommended starting point for most use cases.
  * **Instant (~200ms)** – Designed for real-time applications such as autocomplete, live suggestions, and voice agents.
  * **Fast (~450ms)** – Optimized for speed while still accessing Exa’s quality index. Suitable for agentic workflows where your agent makes dozens of search calls.
  * **Auto (~1s) [Recommended]** – Balanced latency with high-quality results. Recommended for most use cases.
  * **Deep (~3-6s)** – Runs parallel searches across query variations for maximum coverage. Best for research tasks where completeness matters.
Beyond search modes, `exa_search` gives your agent fine-grained control over how results are filtered and scoped. You can narrow a search to specific content categories such as news articles, company websites, GitHub repositories, PDFs, people profiles, or financial reports. Category filtering is most effective when your agent already knows what kind of source it needs. For example, filtering to research papers when the query is technical, or to news sources when recency is the priority. You can also request content and summaries in line with search results, all in a single call:
    agent.tool.exa_search( query="recent advances in AI safety research", num_results=10, summary={"query": "key research areas and findings"}) .
The response includes titles, URLs, and a synthesized summary of each result focused on the query you specified. Your agent can build foundational understanding of a topic without reading every page in full.
### Extracting content with `exa_get_contents`
Once your agent has found relevant URLs, whether from a previous search or from its own reasoning, the `exa_get_contents` tool retrieves the full-page content. You pass it a list of URLs, and it returns the extracted text, ready for the agent to process.Exa maintains a content cache that serves results instantly for pages it has already crawled. For pages that are not in the cache, or when your agent needs the most current version of a page, the tool supports live crawling. You control this behavior with livecrawl modes. A configurable timeout controls how long to wait for live crawls to complete.You can also control how much text is returned. For example, to retrieve up to 5,000 characters of plain text from a page:
    agent.tool.exa_get_contents(urls=["https://example.com/blog-post"], highlight={"maxCharacters": 5000})
### Prerequisites
To follow along with the examples in this post, you need:
  * Python 3.10 or later
  * An AWS account with Amazon Bedrock access
  * An [Exa API key](<https://dashboard.exa.ai/api-keys>)
  * The `strands-agents` and `strands-agents-tools` packages installed: 
    * `pip install strands-agents strands-agents-tools`
## Setup
The Exa tools follow the same pattern as every other tool in the Strands Agents framework, so if you have used other Strands tools, the experience is the same.The Strands Agents SDK includes a library of pre-built tools covering file operations, web search, code execution, AWS services, memory management, and more. The Exa tools are part of this library. Import them and pass them to the Agent constructor through the `tools` parameter. The agent’s underlying LLM then decides when to call each tool as part of its reasoning loop. Because the integration talks to the Exa REST API directly, you don’t need to install or manage a separate SDK. The only new dependency is the `strands-agents-tools` package.To use Exa with Strands Agents, follow these steps:
#### 1\. Set your Exa API key
Exa requires an API key for authenticated access. Set the `EXA_API_KEY` environment variable with your key before running your agent. You can obtain a key from the [Exa dashboard](<https://dashboard.exa.ai/api-keys>):
`export EXA_API_KEY="your_exa_api_key_here"`
#### 2\. Import and register the tools
In your agent code, import `exa_search` and `exa_get_contents` from `strands_tools.exa` and include them in the agent’s tool list:
    from strands import Agent
    from strands_tools.exa import exa_search, exa_get_contents
    agent = Agent(tools=[exa_search, exa_get_contents])
#### 3\. Invoke your agent
Once the tools are registered, your agent can interleave search and content extraction naturally as part of its reasoning flow:
    response = agent( "Search for the most recent trends in AI agents and provide a concise summary of key developments")
With the agent set up, you can start using the Exa tools for different search scenarios.
## Example: Building a Deep Research Agent with Exa
To see how both tools work together, the following example builds a [deep research assistant](<https://github.com/strands-agents/samples/tree/main/python/03-integrate/tools/exa>) that demonstrates both Exa tools in a multi-step workflow. Given a research question, the agent runs four targeted searches across different source types, extracts full content from the most promising results, and synthesizes everything into a structured research brief. The entire workflow executes within a single agent invocation, with multiple tool calls occurring as part of the reasoning loop.The key design insight is that different source types require different search parameters, but not different tools. The two Exa tools are reused throughout the workflow with different parameter configurations at each step: category to target news, PDFs, or repositories; date filters for recency; JSON schemas for structured extraction; and live crawling for freshness.
## Get started
  1. Sign up for an Exa API key at the [Exa dashboard](<https://dashboard.exa.ai/api-keys>)
  2. Clone the [sample repository](<https://github.com/strands-agents/samples/tree/main/python/03-integrate/tools/exa>) and run the deep research assistant
  3. Modify the system prompt to target your domain: swap category filters, date ranges, and JSON schemas to match your use case
### Setting up the agent
The setup takes a model, a system prompt, and the two Exa tools:
    from strands import Agent
    from strands.models.bedrock import BedrockModel
    from strands_tools.exa import exa_search, exa_get_contents
    def create_research_agent() -> Agent:
        model = BedrockModel(
            model_id="us.anthropic.claude-sonnet-4-6",
            region_name="us-west-2",
            max_tokens=20000,
        )
        return Agent(
            model=model,
            system_prompt=load_system_prompt(),
            tools=[exa_search, exa_get_contents],
        )
A system prompt defines the research workflow, guiding the agent through six steps: four targeted searches across different source types, a deep-dive content extraction, and a final synthesis pass. The agent decides when and how to call each tool, how to interpret the results, and when to move to the next step as part of its reasoning loop. The 6-step research workflowEach step instructs the agent to call the Exa tools with different parameters tuned for that kind of content.
_**Step 1: Overview search**_ – A broad sweep using `auto` mode builds foundational understanding. The system prompt instructs the agent to call `exa_search` with these parameters.
    - type: "auto"
    - num_results: 5
    - text: {"maxCharacters": 2000}
    - highlights: {"maxCharacters": 4000}
    - summary: {"query": "What are the key concepts, main points, and important details?"}
    - subpages: 2
    - subpage_target: ["overview", "about", "introduction"]
    - max_age_hours: 168
**_Step 2: News search_** – The focus narrows to news sources within a 30-day date window. The date boundary is computed in Python and injected into the prompt. The `max_age_hours` sets the maximum acceptable age (in hours) for cached content.
    - category: "news"
    - num_results: 5
    - start_published_date: <runtime-injected: today minus 30 days>
    - text: {"maxCharacters": 1500}
    - summary: {"query": "What are the key announcements, developments, and news?"}
    - max_age_hours: 24
_**Step 3: Research papers**_ – For academic depth, the search targets the `research paper` category with a guided `query` to extract key findings, methodology, and conclusions as concise excerpts.
    - category: "research paper"
    - num_results: 5
    - text: {"maxCharacters": 2000}
    - summary: {
        "query": "Extract the research findings, methodology, and conclusions",
        "schema": {
          "type": "object",
          "properties": {
            "title": {"type": "string", "description": "Paper title"},
            "main_findings": {"type": "string", "description": "Key findings and results"},
            "methodology": {"type": "string", "description": "Research methodology used"},
            "conclusions": {"type": "string", "description": "Main conclusions"}
          },
          "required": ["main_findings", "conclusions"]
        }
      }
_**Step 4: GitHub projects** _– Open source implementations surface through the `github` category.
    - category: "github"
    - num_results: 5
    - highlights: {"maxCharacters": 4000}
**_Step 5:_** _**Deep dive**_ – The agent switches from discovery to extraction. The two or three most promising URLs from previous steps get their full content pulled with `exa_get_contents`. This step uses forced live crawling (`"always"` instead of `"fallback"`) for fresh content, a higher character limit (4000) for comprehensive extraction, and subpage crawling to follow links to references, citations, and methodology pages.
    - urls: <2-3 most valuable URLs from previous searches>
    - text: {"maxCharacters": 4000}
    - highlights: {"maxCharacters": 4000}
    - summary: {"query": "Extract all important details, insights, and actionable information"}
    - subpages: 3
    - subpage_target: ["references", "citations", "bibliography", "methodology"]
    - max_age_hours: 0
_**Step 6: Synthesis**_ – No tools are called in this final step. Everything gathered from the previous steps feeds into a structured research brief with sections for an executive summary, topic overview, recent developments, key research and papers, tools and implementations, deep dive insights, and a complete list of sources with URLs.
The multi-step workflow offers several advantages over a single search call or a basic search API wrapper:
  * **Grounded answers** – Every claim in the final brief traces back to a source URL, reducing hallucination.
  * **Efficient token usage** – Summaries at search and extraction time keep the content concise, so the LLM works with distilled knowledge rather than raw page dumps.
  * **Autonomous depth** – The agent iterates across source types (news, papers, code repositories, full pages) without human steering, covering ground that a single search could not.
## Tracing with Amazon Bedrock AgentCore Observability
A 6-step pipeline with multiple tool calls is hard to debug without structured tracing. [Amazon Bedrock AgentCore Observability](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability.html>), built on OpenTelemetry, instruments the full agent run with minimal code changes. Each tool call and LLM invocation becomes a span with parent-child relationships.In the CloudWatch GenAI Observability Dashboard, each research run appears as a full trace. You can see the average span latency across different spans in the agent.
You can drill into individual spans to inspect:
  * **Tool call parameters** per `exa_search` or `exa_get_contents` invocation, verifying the agent used the correct category, date range, and content limits at each step
  * **Latency per step,** identifying whether the news search or the deep dive extraction is the bottleneck
  * **Token consumption** by LLM invocation, showing token distribution across search steps versus synthesis
Agentic workflows are non-deterministic. The same query can produce different search results, different URL selections for the deep dive, and different synthesis outputs. Trace data turns debugging from guesswork into inspection. An example of the final response and the research brief is shown in the final step as in the screenshot below –
## Best practices for using Exa tools
As you integrate Exa tools into your agents, a few patterns can help you optimize for quality, latency, and cost. The following recommendations will help you get the most out of the Exa tools in your agent workflows. For more on search types, content modes, and advanced filtering, see the [Exa best practices documentation](<https://exa.ai/docs/reference/search-best-practices>).
  * **Start with`auto` and adjust from there**: The `auto` search type handles most queries well. Switch to `deep` for research tasks where missing a relevant source is costly, and to `fast` or `instant` when the agent makes many sequential searches and cumulative latency matters more than per-query completeness.
  * **Control content size to manage token budgets** : Set `maxCharacters` on “highlights” field (where default maxCharacters is 4,000).
## Clean up resources
This walkthrough does not create any persistent AWS resources. If you no longer need your Exa API key, revoke it from the [Exa dashboard](<https://dashboard.exa.ai/api-keys>)
## Conclusion
The [Strands Agents SDK](<https://strandsagents.com>) and [Exa](<https://exa.ai/docs>) provide a path to building AI agents that are grounded in current, accurate web information. Exa’s search delivers semantic understanding, category filtering narrows results to the right content type, AI summaries with JSON schemas return exactly the structure your agent needs, and live crawling provides freshness. The Strands Agents integration exposes these capabilities through [two tools and a few lines of setup code](<https://github.com/strands-agents/tools/blob/main/src/strands_tools/exa.py>).
As the deep research assistant demonstrates, you can build a multi-step research agent that searches across news, academic papers, and code repositories, extracts full page content from the best results, and synthesizes everything into a grounded brief, all driven by a single system prompt. The agent targets source types with [category filters](<https://exa.ai/docs/reference/search-best-practices>), controls recency with date ranges, shapes output with JSON schemas and manages freshness with live crawling. You can test search, contents, and answer endpoints directly from the [Exa dashboard](<https://dashboard.exa.ai>) before wiring them into your agent. The entire workflow is traceable through [Amazon Bedrock AgentCore Observability](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html>), turning non-deterministic agent behavior into inspectable, debuggable spans. The pattern applies beyond research to competitive intelligence, technical support, market analysis, and other domains where agents need real-time web information.Try the [deep research assistant sample](<https://github.com/strands-agents/samples/tree/main/python/03-integrate/tools/exa>) with your own research questions. [Get your Exa API key](<https://dashboard.exa.ai/api-keys>) to start building, explore the [Amazon Bedrock documentation](<https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html>) to learn more about the underlying platform, and share your feedback on the [Strands Agents GitHub repository](<https://github.com/strands-agents/sdk-python>).
* * *
## About the authors
Madhu Samhitha Vangara is a Worldwide GenAI Specialist Solution Architect at AWS, focusing on Agentic AI GTM for Amazon Bedrock AgentCore and Strands Agents. She brings a deep understanding of enterprise business value, with previous industry experience in Juniper Networks, VMware, Barclays, and IGCAR. She translates emerging AI capabilities and research into measurable outcomes for customers. She is a speaker at AI conferences like AWS re:Invent, NVIDIA GTC, AI Summit and others where she specializes in multi-agent systems, agent observability, LLMs, partner ecosystems, and production-grade Agentic AI. She holds a master’s in Computer Science from UMass Amherst. Outside work, she’s a trained Indian classical dancer and an art enthusiast.
Manoj Selvakumar is a GenAI Specialist Solutions Architect at AWS focusing on agentic AI systems. He helps startups and enterprises architect production AI agents using the Strands Agents SDK and Amazon Bedrock AgentCore, with expertise in multi-agent orchestration, context engineering, and inference optimization. His work with customers spans long-running task patterns, memory management, and production scaling across distributed deployments. He drives technical adoption and ecosystem growth for Strands Agents, through open-source samples, partner integrations, and community enablement.
Asheesh Goja is CTO for superintelligence customers at Lambda. Previously, he was a Principal Gen AI Solutions Architect at AWS. Earlier, he worked at Cisco and UPS, leading initiatives to accelerate adoption of emerging technologies. His expertise spans ideation, co-design, incubation, and venture product development. He holds a broad portfolio of hardware and software patents, including a real-time C++ DSL, IoT devices, and Computer Vision and Edge AI prototypes. An active contributor to Generative AI and Edge AI, he shares insights through tech blogs and as a speaker at industry conferences and forums.
Mani Khanuja is a Technical AI Leader and Principal Generative AI Solutions Architect at AWS with 20+ years of experience building AI platforms from scratch and driving enterprise AI strategy. She works directly with customers to build their Generative AI strategy, from architecture to production deployment at scale. Her current focus is scaling autonomous AI agents safely and efficiently: developing stateful, memory-driven agents with personalization, advancing AI governance frameworks, and translating cutting-edge research into real-world enterprise systems. She is the author of Applied Machine Learning and High-Performance Computing on AWS. She is also a recognized technical speaker at Re:Invent, Grace Hopper Celebration, AI Engineer Summit, and AWS Summits worldwide. She resides in Seal Beach, California, where she stays active with long runs along the coast.
Ishan Goswami is the Founding DevRel Engineer at Exa, where he leads developer relations. He builds and ships integrations, open-source demo apps, MCP servers, and plugins that make Exa easy to use inside any AI app or workflow. Before Exa, Ishan co-founded a text-to-video startup. He has built apps that have been used by millions of people and open source projects with thousands of GitHub stars.
Nitya Sridhar is the Head of Marketing at Exa, where she leads product launches, technical blogs, growth campaigns, and much more. She works closely with engineering and GTM to bring Exa to developers and enterprises around the world, with a focus on clear technical storytelling and turning new product features into stories the community can use.