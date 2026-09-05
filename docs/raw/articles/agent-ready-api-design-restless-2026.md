---
source: newsletter
source_url: "https://www.restless.ai/blog/agent-ready-apis"
ingested: 2026-09-05
sha256: 422d16c939148ffd2a4935099fbec307d61260fa31c0409433557d65f3adb46a
---

# Agent-Ready APIs · Restless

Agent-Ready APIs · Restless
BLOG
Agent-Ready APIs
An agent that gets a 400 back doesn&#x27;t read your docs, it retries. The response is the only channel you have, so here&#x27;s how to make your API ready for the agents already calling it.
Gregory Koberger, founder · August 30, 2026
Your API used to be a feature. Now it&#x27;s the product. The next company that
integrates with you won&#x27;t send a developer to read your docs; it will send
an agent, and that agent will both build the integration and run it in
production.
That changes what your API has to do. An agent doesn&#x27;t research, it calls
and reacts, so everything it needs has to arrive in the response.
Getting an API ready for that takes work on a few fronts:
1. Error bodies should carry the fix
Errors for APIs tend to just describe what went wrong. Errors written for
agents should describe how to fix it. An error like
invalid_parameter: date_range
barely gives humans enough information to start investigating,
and definitely isn&#x27;t enough for AI.
Agents will rarely search for documentation when they hit a wall. They
will guess, try similar conventions, and rely on their parametric
knowledge. But it will rarely go out and search for documentation. If you
want to unblock agents building on your API, you need to bring the
up-to-date documentation to them.
Restless calls this
Agent Recovery
. Every
request is fingerprinted
based on the error, endpoint and parameters, and next steps are served
automatically inside the error JSON.
POST
/v1/charges
401
{
"error"
:
"unauthorized"
,
"message"
:
"API token has expired"
,
"debug"
:
{
"recovery"
:
"Mint a new token with POST /v1/tokens, then retry with the Authorization: Bearer header. Docs: https://docs.acme.com/p/jk23kza/create-token.md"
,
"log"
:
"https://acme.com/logs/9f18a0e2-4c7b-4e1a-b93f-2c5d8e0a4f61"
,
"cli"
:
"npx api debug 9f18a0e2-4c7b-4e1a-b93f-2c5d8e0a4f61"
}
Inserted by Restless
}
Just like agents won&#x27;t search for documentation, they also don&#x27;t like to
follow links surfaced in error responses:
Especially if they have tracking links or query params.
That&#x27;s why we include it as a continuation.
We&#x27;ve found agents are much more likely to follow a link mentioned in
prose, with a clear reason why they should.
2. Solicit agent feedback
Your API likely has some gaps: missing functionality, inefficient data
structures, or lacking docs.
An easy way to find these issues is to give agents a way to
send feedback
via your MCP server.
If you expose an
agent_send_feedback
tool, some agents will let you know
where they get stuck. You can ask them to categorize the issue (feature
request, missing docs, confusing errors, etc), and triage them yourself.
3. Expose request logs
Most API problems don&#x27;t appear until the code is in production and using
real data. One of the best ways to understand what&#x27;s going wrong is to give
agents access to realtime
request logs
from production.
Your developers can give their agents access to this by properly setting up
Sentry
so their agents can track down issues and
debug what&#x27;s actually happening.
Restless exposes this information to agents via an MCP server. It lets them
filter for errors (and successes!), and fetch information about how to fix
them.
4. Limit MCP tool count
You&#x27;ll want to surface your endpoints via the
MCP server
so agents can call them. Agents don&#x27;t
tend to like (or need) a generic fetch tool, since the functionality isn&#x27;t
discoverable.
However, MCP tool selection degrades after around 30 to 50 tools. So most
APIs are far too large for this.
The best way to deal with this is to automatically curate a shortlist of
endpoints that you surface as tools, based on usage and other signals (such
as the
agent_send_feedback
tool, most searched for tools and more). To
surface the rest, you can provide a
Tool Search
.
You can also curate a few endpoints into a single tool. In Restless we call
these Usecases, because they&#x27;re surfaced as both tools in the MCP server and
available functionality in the docs.
5. Programmatic signup
It&#x27;s great if AI surfaces your tool, but getting to a working integration
tends to break at account creation. Most apps require a human to go to a
website, sign up, and then set up tooling so the agent can proceed. This is
the most annoying part of starting with a new product, yet it still falls on
the human.
There&#x27;s a new standard,
auth.md
, aiming to fix
this. Verification happens by sending a token to the user&#x27;s email. This
gives the agent scoped credentials and lets it keep going with your product
on its own. Eventually, the goal is for agent providers (such as Claude or
OpenAI) to be able to vouch for the user&#x27;s identity so that step can be
skipped.
6. CLI for more complex setup
Setup isn&#x27;t just about getting a username and password, and CLIs are a great
way to onboard if you have a tool that&#x27;s built to be integrated.
Most good CLI onboardings are interactive, but agents can&#x27;t work with TTY
interactions. So you should build two flows for your CLI: one for humans and
one for agents.
All the agent providers surface an environment variable to CLI tools when
they run them:
Agent
Environment variable
Claude Code
CLAUDECODE=1
Codex
CODEX_SANDBOX
Additionally, most languages surface a catch-all you can check for. For
example, it&#x27;s
process.stdout.isTTY
in Node or
sys.stdout.isatty()
in
Python.
You can do more than just remove TTY interactions: you can be more verbose,
so agents have all the information they need.
7. Agent-only endpoints
We traditionally see APIs as a contract with developers, since historically
APIs are used for integrations with code. However, APIs are now how agents
do things with your product.
It&#x27;s okay to have agent-only endpoints, which change as frequently as your
product. You can iterate on the ergonomics of your endpoints, remove unused
ones, and keep up with your evolving product.
The most important thing is making sure agents can do everything in your
product.
GET STARTED
Build with Restless
The modern API toolkit: docs, an API reference, and AI chat, generated from your OpenAPI spec and updated as it ships.
CLI
CLI
$
npx
restless init
$ npx restless init
