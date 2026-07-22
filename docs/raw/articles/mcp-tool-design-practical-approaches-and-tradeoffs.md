---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/mcp-tool-design-practical-approaches-and-tradeoffs
ingested: 2026-07-10
feed_name: AWS China ML
source_published: 2026-07-09
sha256: 1d816c87629cdca32c3f9d6fa76a08ca25b0057f57322a511baa01444d7ce4a4
---

# MCP tool design: Practical approaches and tradeoffs

When [Model Context Protocol (MCP)](<https://modelcontextprotocol.io/>) tools underperform, the cause is rarely the protocol itself but the tool design. Many teams start by exposing an existing API as-is and trusting the agent to figure out the rest. It is a natural way to extend APIs to agentic systems and generative AI coding tools. For straightforward use cases, it can work. But often it does not.

You must design your tools for how large language models (LLMs) and agentic systems work. Without this, you risk failed tool calls, wrong parameter values, and retries that waste context and degrade performance. In this post, we show where MCP tool design goes wrong and how to fix it with practical [context engineering](<https://docs.aws.amazon.com/prescriptive-guidance/latest/gen-ai-lifecycle-operational-excellence/dev-experimenting-context.html>) approaches.

Two problems are behind most of these failures. The first is _bloat_. Tool definitions load into the LLM’s context on every call, whether the tool is used or not. Multiple connected MCP servers can consume significant context before the user has asked a single question. As context fills, an LLM’s [ability to reason can degrade](<https://research.trychroma.com/context-rot>) and cause the session to become less productive.

The second is _confusion_. As reasoning degrades, the LLM makes poorer choices, calls the wrong tool and chooses incorrect parameters. Subsequent retries compound the issue by further contributing to bloat. Semantic similarity between tools, too many options, and ambiguous naming [also contribute to confusion](<https://arxiv.org/abs/2601.20412>). A common solution is to enrich the tool descriptions with clearer definitions, natural language mappings, and usage examples. This does help with confusion. But everything added risks worsening bloat and compounding the very issue you are working to solve.

This pattern is common. Your agent makes unexpected choices, the context fills sooner than expected, and your session quickly becomes less useful. Addressing bloat and confusion is a context engineering problem. Context engineering shapes what the LLM sees and when it sees it, so the model produces better results. Improving one, or both, of these is a complex balancing act.

The following sections explore approaches and tradeoffs to address these issues. To make them concrete, we built several examples that expose a simulated K-12 content search API using the MCP protocol. You will run them locally and interact with them using [Kiro CLI](<https://kiro.dev/cli/>) to compare the differences yourself.

## Approaches and tradeoffs

The approaches we share address these issues at the tool level. Some shape what the LLM sees or when it sees it. Others change how tools are structured. As you apply them, you need to understand how they impact bloat and confusion to find the right balance between the two.

### Descriptions and responses

The natural first step to fixing MCP tool behavior is to improve the descriptions. A reliable way to reduce confusion is to clarify what values mean, how natural language maps to them, and what the tool is for. But take it too far, and you quickly add to bloat. Context and cost can grow quickly when many MCP servers are loaded into a client.

What the tool returns shapes behavior too. A tool that returns 50 fields per result fills context quickly. If 5 are sufficient for a decision, default the response to those fields and provide a separate option to request a detailed view. Shifting to an on-demand approach for detailed output cuts response tokens by roughly two-thirds, [according to Anthropic’s research](<https://www.anthropic.com/engineering/writing-tools-for-agents>).

Proper error messages are another way to improve efficiency. When a tool call fails, helpful errors can steer the next attempt. A response that says “search requires 2 or more terms in query” tells the LLM exactly what to change. A response that returns only “no results” gives it nothing, causing the model to either give up or keep guessing.

### Schema constraints

Where descriptions and proper errors guide the LLM toward correct values, schema constraints like enums and default values can remove the guesswork entirely. Consider the following to address common schema issues:

  * Rename parameters to match how the LLM might understand the domain, not how your database labels its columns. 
    * A parameter called `resource_class` with values like ‘Student Resource’ or ‘Teacher Support’ is clearer for the LLM. A `content_bucket` column requires the LLM to know an internal convention.
  * Set defaults to the most common values so the LLM only needs to specify what varies.
  * Constrain finite-value fields with enums so the schema itself tells the LLM what is valid.
  * Drop fields that are rarely used or that the LLM cannot use well. 
    * [AWS Prescriptive Guidance for MCP Strategies](<https://docs.aws.amazon.com/prescriptive-guidance/latest/mcp-strategies/>) recommends keeping tool parameter counts around eight or fewer.



### Restructuring tools and on-demand context

Splitting a multi-purpose tool into several specific tools provides clarity to the model and gives more granular results. A lazy loading discovery tool is one example. You can remove complex tool descriptions from the always-loaded context and provide a separate tool for on-demand retrieval. The LLM only retrieves this context when the task requires it. This keeps context lean and focused. Anthropic’s Tool Search Tool and [Amazon Bedrock AgentCore Gateway](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway.html>) show these concepts applied at scale. Anthropic reports [up to 85% token reduction](<https://www.anthropic.com/engineering/advanced-tool-use>) by loading tool definitions only when relevant.

[Skills](<https://docs.aws.amazon.com/agent-toolkit/latest/userguide/skills.html>) are another example of lazy loading, but implemented client side. These local files contain useful context for the tool but are only read into context when relevant. This reduces the effort to implement and distribute them. But there is no guarantee that the skill loads when needed or remains unchanged once installed.

### Server-side inference

Context engineering is challenging when you do not control which model will interpret your instructions. And once deployed, you may not control which LLM calls your MCP tools. A description tuned against one model might confuse another. Fully testing all the potential models a client might use is unrealistic.

One way to address this is to add an introspection tool that directly calls an external LLM. The client uses natural language to query your introspection tool and gets targeted instructions for using the other tools. Because you choose the model, you can properly prompt engineer this tool and test with golden queries. The client LLM still makes the final tool call, but your LLM interprets the need and provides correct values. Because the use case is focused, a smaller, faster model handles this task well and keeps costs reasonable at scale.

### Agentic tools

When you need accuracy and full control, the next logical progression is to back your entire MCP server with an agent of your own. The introspection example handles a single interpretation step, but an agentic tool handles the entire interaction. The tools become natural language endpoints to the client. It states what it needs, and your agent does the rest. The other techniques covered still apply. The tradeoffs are yours to own completely, but as with introspection, you can fully engineer the behavior with the model of your choice.

The next section walks through working code that applies these approaches against the same backend and test queries, so you can compare their behavior directly.

## Walkthrough

Each of the 6 versions wraps the same simulated K-12 content search backend with a different MCP tool design. The backend has 14 filterable fields (subject, grade, format, standards alignment, language, resource class, and others) with controlled vocabularies. The challenge for the LLM is bridging the gap between how a teacher phrases a request and the exact values those fields accept. V1 starts with the raw passthrough that leaves this gap open. Each later version closes it differently.

### Prerequisites

You need the following to run the sample code:

  * Python 3.10+.
  * SQLite (included with Python).
  * [Kiro](<https://kiro.dev/>) (free tier available) or another MCP client.
  * AWS account with Amazon Bedrock model access (V5 and V6 only): [Amazon Nova 2 Lite](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-amazon-nova-2-lite.html>) and [Anthropic’s Claude Sonnet 4.6](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-sonnet-4-6.html>).



Clone the [sample code repository](<https://github.com/aws-samples/sample-mcp-tool-design-patterns>) and follow the repository README for detailed prerequisites, installation, and server startup instructions. The walkthrough that follows assumes all six versions are running.

No infrastructure is deployed to AWS. You run all code locally. Inference calls to Amazon Bedrock are the only cost aside from your coding client. See [Amazon Bedrock pricing](<https://aws.amazon.com/bedrock/pricing/>) for current rates.

This walkthrough assumes you are using Kiro and have run `python scripts/setup_agents.py` from the repository.

### Test queries

These queries return real results from the sample database. Try them against each version:

  1. “Find me a quiz on fractions for my 7th graders.”
  2. “Do you have any lessons for teaching Spanish in middle school?”
  3. “I need TEKS-aligned content for kids working on dividing in middle school.”
  4. “What types of content can I search for?”
  5. “Can I get details on n-sc-1096?”



As you run through each version:

  * Observe whether the LLM picked the right filter values on the first call.
  * Note how many tool calls it took.
  * Check whether the response included information the LLM didn’t need.
  * Observe how quickly the context window fills. Check the percentage displayed in Kiro, or use `/context show` for a detailed breakdown.



To switch between versions, use `/agent swap` (for example, `/agent swap v1-passthrough`). Clear context with `/clear` between versions so prior results don’t influence the next one.

### V1: Raw passthrough

`v1_passthrough.py`

The first version is the baseline anti-pattern. It exposes the backend API directly. The tool definition has 14 parameters with internal names like `discipline`, `media_type`, `content_bucket`, and a one-line docstring that says “Performs a global search for educational resources.” No valid values listed, no natural language mappings, no guidance.

The tool definition is small, but the LLM has no guidance on what values are valid. Try the first query. It might pass “quiz” for `media_type` when the valid value is “Assessment”, or “math” when the field expects “Math”. Each wrong choice triggers a retry that consumes more context. The only clue that something went wrong is an empty result. The LLM is left guessing what to change on the next attempt. Low baseline cost is misleading when confusion drives up the actual cost through churn.

### V2: Rich descriptions

`v2_better_descriptions.py`

Same structure as V1, zero backend refactoring. The docstring now lists valid values and synonym mappings for each field. For example, `discipline` shows “Valid: Math, Science, Literacy/ELA…” and `media_type` maps “‘quiz’/‘test’ → Assessment, ‘worksheet’ → Activity.” It also distinguishes fuzzy search (`keyword`) from strict filters (everything else). Three rarely-used parameters are dropped and error messages now return guidance on which filters to add, rather than an empty result.

Try the same queries. Accuracy improves immediately because the LLM sees valid values and synonym mappings. The tool definition is noticeably larger. That’s the bloat tradeoff. Every call pays it whether the tool is used or not. After five queries, compare total context consumed to V1. The per-call overhead is higher, but fewer retries often make the total lower.

### V3: Schema and defaults

`v3_rethought_schema.py`

This version renames parameters to match how the LLM thinks and constrains values through the schema itself. Parameters are renamed: `discipline` becomes `subject`, `content_bucket` becomes `resource_class`. Each finite-value field uses a `Literal` type that lists valid options directly in the schema. Sensible defaults handle the common case: `structure='Asset'`, `resource_class='Student Resource'`, `language='en'`. A separate `get_resource_detail` tool handles drill-down. This applies the restructuring approach, giving each tool a clear job and keeping search responses concise.

Enums help prevent wrong values at the protocol level. Defaults mean the LLM only specifies what varies. The response includes a `defaults_applied` field so the LLM knows what was filtered implicitly. The definition is smaller than V2 because names and enums do the work that verbose descriptions did before. Run the queries and compare accuracy to V2. Accuracy improves while context drops.

### V4: Lazy loading (restructuring)

`v4_lazy_loading.py`

Instead of embedding enums and detailed descriptions in the search tool, this approach moves them behind a separate tool. The search tool keeps only short hint descriptions like “Subject area, e.g. ‘Math’, ‘Science’, ‘Literacy’”. A `get_taxonomy` tool takes a list of field names and returns valid values and natural language mappings only for the fields relevant to the current query.

The search tool definition is the leanest so far. Notice the tool calls. For ambiguous queries, the LLM calls `get_taxonomy` before searching to confirm valid values. For straightforward queries where the hints are sufficient, it might skip the taxonomy call entirely and search directly. Common values in the hints handle frequent queries without a round-trip, whereas the full taxonomy is available for edge cases. Because the taxonomy loads only when needed, every prior interaction in the session runs without that context cost. The savings in this example is modest, but in environments with many connected tools and complex tool schemas it compounds quickly.

### V5: LLM introspection

`v5_llm_introspect.py`

This version adds an introspect tool backed by Amazon Nova 2 Lite on Amazon Bedrock. The `introspect_query` tool takes the teacher’s natural-language question and returns recommended filter values with rationale explaining each choice. It interprets “TEKS-aligned content for kids working on dividing in middle school” and returns recommended filters: `subject` “Math”, grades 6-8, `state_standard` “TX-TEKS”, `topic` “dividing,division”.

Kiro still makes the final search call. Because introspect runs on a model of your choice, [prompt engineering](<https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-engineering-guidelines.html>) and testing are reliable. The interpretation happens server-side, so your context stays lean. The tradeoff is cost. You pay for the server call but results stay consistent regardless of which model Kiro uses. Switch models with `/model` and compare V4 versus V5. Without introspection, weaker models produce inconsistent results. With introspection, results stay stable.

### V6: Agent-as-tool

`v6/app/v6/main.py`

The final version exposes a single MCP tool backed by a [Strands Agents](<https://strandsagents.com/>) agent with its own system prompt and internal tools. The external interface is one tool with one parameter: `agentic_search_content(question: str)`. Your agent handles taxonomy lookup, search, detail retrieval, and response formatting internally using its own tools that the client LLM does not see.

Try all 5 queries and compare client context usage to the other versions. The client LLM does minimal work. Behavior is consistent regardless of which client connects because your agent owns the reasoning. Conversation history persists across calls, so follow-up questions work naturally. The tradeoff is cost and latency in exchange for direct control over behavior and consistency. Switch between models with `/model` in Kiro and notice results remain stable across models.

### Tradeoffs at a glance

Each version trades one cost for another. This table lays them side by side.

**Version** | **Approach** | **Tradeoff**  
---|---|---  
V2 | Rich descriptions | Accuracy up, definition larger  
V3 | Schema + defaults | Accuracy up, definition smaller  
V4 | Restructuring + lazy loading | Leanest baseline, extra round-trip  
V5 | Server-side introspection | Handles ambiguity, you pay for inference  
V6 | Agent-as-tool | Direct control, highest infrastructure cost  
  
After running the test queries across all 6 versions, notice the patterns. V2 is the fastest path to better results with no refactoring. V4 has the leanest baseline context. V5 handles ambiguous queries that other versions miss. V6 gives you the most control at the highest infrastructure cost. No version wins across all dimensions. The right choice depends on your field count, vocabulary stability, latency budget, and how much you need consistent behavior across different clients.

## Cleaning up

All servers run locally. To stop them, run `scripts/stop_all.sh` from the repository root. See the [accompanying repository README](<https://github.com/aws-samples/sample-mcp-tool-design-patterns>) for details.

## Conclusion

MCP itself is not the problem. It is a key protocol for agentic solutions. The problem is tool design. The approaches in this post address bloat and confusion through context engineering at the tool level. The code walkthrough demonstrates each approach against the same scenario so you can observe the tradeoffs directly and decide what fits your situation.

The protocol continues to evolve. The [MCP 2026 Roadmap](<https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/>) addresses transport scaling, agent communication, and features for enterprise deployment.

To go deeper, explore the following resources:

  * [MCP Strategies on AWS](<https://docs.aws.amazon.com/prescriptive-guidance/latest/mcp-strategies/>) – Covers the broader architecture: which MCP patterns to use, when to connect multiple servers, and how to structure your MCP system beyond a single tool.
  * [AWS MCP Server](<https://aws.amazon.com/about-aws/whats-new/2026/05/aws-mcp-server/>) – A managed MCP server that gives AI coding agents access to AWS APIs, documentation search, and curated agent skills through a single connection. Study how it uses on-demand skill loading to keep context lean.
  * [Strands Agents SDK](<https://strandsagents.com/>) – Go deeper on the agentic approach from V6. Build multi-turn agents with tool orchestration, memory, and testable behavior.
  * [Amazon Bedrock AgentCore](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/>) – Deploy your MCP server without managing infrastructure. Includes runtime hosting, gateway for multi-server tool discovery, and persistent memory across sessions.



For more MCP code examples and patterns:

  * [Open Source MCP Servers for AWS](<https://awslabs.github.io/mcp/>) – 56 open source MCP servers covering documentation, infrastructure, AI/ML, data, developer tools, and more. Pick one and evaluate its tool descriptions against the bloat and confusion framework from this post.
  * [Amazon Bedrock AgentCore Samples](<https://github.com/awslabs/agentcore-samples>) – Getting-started guides, feature demos, use-case examples, blueprints, and workshops for AgentCore.
  * [Sample Serverless MCP Servers](<https://github.com/aws-samples/sample-serverless-mcp-servers>) – Reference implementations for hosting MCP servers on AWS Lambda and Amazon Elastic Container Service (Amazon ECS), including stateless and stateful patterns, plus Strands agents on Lambda.
  * [Guidance for Vibe Coding with AWS MCP Servers](<https://aws.amazon.com/solutions/guidance/vibe-coding-with-aws-mcp-servers/>) – A sample hotel booking application demonstrating how AI coding assistants use AWS MCP servers to accelerate development with AgentCore.



* * *

## About the authors

### Daniel Wells

Daniel has over 20 years of IT experience across architecture and leadership roles, supporting a wide variety of technologies. He currently works as an AWS Senior Solutions Architect specializing in AI/ML and agentic AI, supporting Education Technology companies striving to make a difference for learners and educators worldwide. Daniel’s interests outside of work include music, family, health, education, and anything that allows him to express himself creatively.

### Raian Osman

Raian is a Technical Account Manager at AWS and works closely with Education technology customers based out of North America. He has been with AWS for over 4 years and began his journey working as a Solutions Architect. Raian works closely with organizations to optimize and secure workloads on AWS, while exploring innovative use cases for generative AI.
