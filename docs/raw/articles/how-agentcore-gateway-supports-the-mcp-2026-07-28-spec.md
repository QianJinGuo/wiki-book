---
title: How AgentCore Gateway supports the MCP 2026-07-28 spec
source_url: https://aws.amazon.com/blogs/machine-learning/how-agentcore-gateway-supports-the-mcp-2026-07-28-spec
source: rss
ingested: 2026-07-29
feed_name: AWS China ML
source_published: 2026-07-28
sha256: ed2512fee63ce7cd62c068b2d7f844040cedcc6b491b366ad703cd36b6c22ae0
---
# How AgentCore Gateway supports the MCP 2026-07-28 spec

Today, the Model Context Protocol (MCP) published its 2026-07-28 specification, the largest and most significant revision of the protocol since its launch. With this release MCP becomes a stateless protocol that scales on ordinary HTTP infrastructure. Alongside the transport changes, this new version introduces a governed extensions system, strengthens authorization by aligning more closely with enterprise practices for OAuth 2.0 and OpenID Connect, and establishes lifecycle guarantees that limit future breakage.  
  
You can start using the latest protocol on your [AgentCore Gateway](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway.html>), a capability of Amazon Bedrock AgentCore, today by calling `UpdateGateway` with the list of versions you want your gateway to support. Existing clients keep working exactly as before, and there is no per-target step. In this post, we walk through what changed in the protocol and why, what it means for your agents and tools, and how to enable the new version on your gateways.

Already familiar with the spec changes? Jump straight to Updating your AgentCore Gateway.

## What changes with the new spec and why it matters

This release contains **backward-incompatible changes** to the MCP protocol. The transition to statelessness is a foundational change that protocol maintainers believe is necessary to address scaling challenges with enterprise deployments. The introduction of breaking changes with new versions, however, is not expected to be the norm. To help facilitate backward-compatible updates in future revisions, maintainers have introduced new governance enhancements to the protocol specification (a feature lifecycle policy, an extensions framework, and a conformance-suite requirement). These enhancements are designed to support protocol evolution without breaking core capabilities.

Upgrading is also **opt-in** , and nothing changes until both you and your clients act. AgentCore Gateway advertises the protocol versions it speaks through a single configuration field. Clients select a version on every request. Adding 2026-07-28 to a gateway that also advertises 2025-11-25 does not change anything for clients that request the older version. Only a client that requests 2026-07-28 gets the new behavior. Nothing breaks on July 28.

## 1\. MCP is now stateless

In prior versions of the protocol, every Streamable HTTP interaction with an MCP server began with an `initialize`/`initialized` handshake, in which the client and server exchanged protocol versions and capabilities. The server then issued an `Mcp-Session-Id` header that every subsequent request was required to carry:
    
    
    POST /mcp HTTP/1.1
    Mcp-Session-Id: 1868a90c-3a3f-4f5b
    Content-Type: application/json
    Accept: application/json
    
    {"jsonrpc":"2.0","id":2,"method":"tools/call",
    "params":{"name":"search","arguments":{"q":"otters"}}}

That session pinned the client to the server that issued it. Therefore, to scale an MCP server horizontally, operators needed sticky sessions at the load balancer, a shared session store behind the fleet, or both.

By removing sessions, remote MCP servers effectively become standard HTTPS endpoints, which scale cleanly with enterprise workloads. As the protocol becomes stateless, the handshake and the protocol-level session are both no longer needed ([SEP-2575](<https://modelcontextprotocol.io/seps/2575-stateless-mcp>) and [SEP-2567](<https://modelcontextprotocol.io/seps/2567-sessionless-mcp>) remove these requirements from the new protocol version). With 2026-07-28, every request now carries protocol version, client info, and client capabilities inside its `_meta` parameter, eliminating the need for a one-time initialization handshake. Clients that need to learn what a server supports can call the new `server/discover` method at any point. The net effect is that a single tool call is fully self-contained. It requires no prior session context and can be routed to any server instance. Removing the protocol session does not preclude support for stateful applications. When servers need continuity across calls, you can follow established patterns for HTTP requests by passing an explicit ID as a tool parameter, which should come from one of your own tools.
    
    
    POST /mcp HTTP/1.1
    MCP-Protocol-Version: 2026-07-28
    Mcp-Method: tools/call
    Mcp-Name: create_basket
    Content-Type: application/json
    Accept: application/json,text/event-stream
    
    {"jsonrpc":"2.0","id":1,"method":"tools/call",
    "params":{"name":"create_basket","arguments":{},
    "_meta":{"io.modelcontextprotocol/clientInfo":{"name":"my-app","version":"1.0"}}}}

Response:
    
    
    {"jsonrpc":"2.0","id":1,
    "result":{"resultType":"complete","content":[{"type":"text","text":"Created basket bsk_a1b2c3"}],"structuredContent":{"basket_id":"bsk_a1b2c3"},"isError": false}}

You can then use the agent’s own capabilities to thread this state handle through subsequent requests:
    
    
    POST /mcp HTTP/1.1
    MCP-Protocol-Version: 2026-07-28
    Mcp-Method: tools/call
    Mcp-Name: add_item
    Content-Type: application/json
    Accept: application/json,text/event-stream
    
    {"jsonrpc":"2.0","id":1,"method":"tools/call",
    "params":{"name":"add_item","arguments":{"basket_id": "bsk_a1b2c3", "sku": "shoes"},
    "_meta":{"io.modelcontextprotocol/clientInfo":{"name":"my-app","version":"1.0"}}}}

AgentCore Gateway has always shielded agents from much of MCP’s session mechanics. It aggregates your AWS Lambda functions, APIs, and MCP servers behind a single MCP endpoint and manages the protocol conversation with each target on your behalf. With 2026-07-28, that gets simpler on both sides: an agent’s first tool call is one self-contained request rather than a handshake followed by a call. Each request carries an `Mcp-Protocol-Version` header. The gateway serves the request in that version when the version appears in `supportedVersions`, or rejects it with `HTTP 400` (code `-32022`) and a list of supported versions when it does not. Requests that omit the header default to 2025-03-26.

## 2\. Routing, caching, and tracing without parsing the body

In prior versions of the protocol, the operation a request performed was opaque to anything sitting between client and server. Load balancers, API gateways, and rate limiters all had to parse the JSON-RPC body to determine what method was being called. Detecting changes to a server’s tool catalog meant holding a long-lived SSE stream open and waiting for a push notification. MCP traffic, in short, did not play well with standard HTTP infrastructure.

2026-07-28 closes that gap in three ways. First, every Streamable HTTP request now surfaces its intent in standard headers: `Mcp-Method` and `Mcp-Name` ([SEP-2243](<https://modelcontextprotocol.io/seps/2243-http-standardization>)) travel outside the body, giving intermediaries enough information to route, throttle, and meter at the HTTP layer alone. A server that receives a request where the declared headers contradict the body rejects it outright. Second, responses to list and resource-read operations now include explicit freshness metadata, `ttlMs` and `cacheScope`, borrowed from the semantics of HTTP `Cache-Control` ([SEP-2549](<https://modelcontextprotocol.io/seps/2549-TTL-for-list-results>)). Clients can cache a `tools/list` response for a known duration and scope without maintaining a persistent connection only to watch for invalidations. Third, the spec now reserves the W3C Trace Context keys (`traceparent`, `tracestate`, `baggage`) inside `_meta` ([SEP-414](<https://modelcontextprotocol.io/seps/414-request-meta>)), formalizing what several SDKs had already adopted in practice. A distributed trace originating in your application can now propagate through the full call chain, from agent to MCP client to gateway to downstream service, and render as a unified span tree in any OpenTelemetry-compatible collector.

On the 2026-07-28 path, AgentCore Gateway surfaces these primitives directly. Every tool result from your gateway carries the new structured result envelope, and cacheable results include TTL and scope hints for conformant client SDKs. The gateway also enforces the custom-header binding: when a tool’s input schema marks a field as header-bound, the gateway rejects any request whose header is absent or contradicts the body (`HTTP 400`, code `-32020`).

## 3\. Server-to-client interactions without persistent connections

A stateless protocol still needs a way for a server to talk back to the client mid-call. MCP has three such interactions: elicitation, where the server asks the end user for input (“this tool is about to delete three files. Confirm?”), roots, where the server asks for available directories and files in the filesystem, and sampling, where the server asks the client’s model to generate a response. In previous versions, delivering these requests meant the server held an SSE stream open back to the client.

With the latest protocol version, server-initiated requests are now only permitted while the server is actively processing a client request ([SEP-2260](<https://modelcontextprotocol.io/seps/2260-Require-Server-requests-to-be-associated-with-Client-requests>)). Every prompt a user sees traces back to something they or their agent started. Multi Round-Trip Requests ([SEP-2322](<https://modelcontextprotocol.io/seps/2322-MRTR>)) replace the previous long-lived stream. Here, the server embeds questions in an `InputRequiredResult` and externalizes state through an opaque `requestState` token rather than pushing a question over SSE. Only tools that declare elicitation or sampling inputs trigger the multi-round-trip exchange, and only when the client advertises support for it.
    
    
    {
      "resultType": "input_required",
      "inputRequests": {
        "confirm": {
          "method": "elicitation/create",
          "params": {
            "mode": "form",
            "message": "Delete 3 files?",
            "requestedSchema": {
              "type": "object",
              "properties": {
                "confirm": {
                  "type": "boolean"
                },
                "required": ["confirm"]
              }
            }
          }
        },
        "requestState": "eyJzdGVwIjoxLCJmaWxlcyI6WyJhIiwiYiIsImMiXX0="
      }
    }

Clients collect the user’s answers and re-issue the original call with the responses and the `requestState`. Everything the server needs is in the payload, so any server instance can pick up the retry.

Separately, progress notifications and log delivery are now request-scoped. The gateway relays progress updates only when the client supplies a progress token on the originating request, and delivers log messages only when the client sets `io.modelcontextprotocol/logLevel` in per-request metadata.

## 4\. Decoupling extensions from the core spec

Until now, MCP extensions were an informal concept with no governance behind them. [SEP-2133](<https://modelcontextprotocol.io/seps/2133-extensions>) introduces one. Each extension carries a reverse-DNS ID, is negotiated through an `extensions` map in client and server capabilities, lives in a dedicated repository under delegated maintainers, and follows its own release cadence independent of the core spec. A new Extensions Track within the SEP process defines how an extension graduates from experimental to official status, which changes how the protocol grows. Rather than every new idea competing for space in the core specification and forcing a breaking version bump, capabilities can now mature as opt-in extensions on their own timelines. Clients and servers that do not negotiate a given extension are unaffected.

## 5\. Authorization hardening

Six SEPs bring MCP’s authorization specification into closer alignment with production OAuth 2.0 and OpenID Connect deployments. Your gateway’s inbound authorization, whether IAM (SigV4) or OAuth/JWT, is unchanged by the protocol version. So are your outbound credential providers. Upgrading the protocol version does not require changing credentials or authorizer configuration.

## 6\. Error handling and deprecations

On earlier protocol versions, nearly everything came back as HTTP 200 with an error tucked inside the JSON-RPC body, including transport-level failures. On 2026-07-28, the transport and application layers are cleanly separated. Transport failures return real HTTP status codes. Application-level outcomes stay in the body:

**Situation** | **2025-* versions** | **2026-07-28**  
---|---|---  
Unknown method | In-body JSON-RPC error, `HTTP 200` | `HTTP 404`  
Unsupported protocol version | Varies | `HTTP 400`, code `-32022`. Body lists supported versions  
Header-bound field absent or mismatched | Varies | `HTTP 400`, code `-32020`  
Missing required client capability | Not applicable | Code `-32021`  
  
These changes only matter for code that inspects error responses. They let your HTTP-level monitoring, alarming, and retry logic distinguish routing problems from application-level issues without parsing the body. The spec also reassigns the “ _resource not found_ ” error code from the MCP-specific `-32002` to JSON-RPC’s standard `-32602` Invalid Params ([SEP-2164](<https://modelcontextprotocol.io/seps/2164-resource-not-found-error>)). If your client matches on `-32002` anywhere, audit those code paths. Additionally, on the 2026-07-28 path: `logging/setLevel` is retired, and a client that calls it is rejected. To opt into log delivery, you can set the per-request metadata field `io.modelcontextprotocol/logLevel` instead.

Three core features are deprecated under the protocol’s new feature lifecycle policy ([SEP-2577](<https://modelcontextprotocol.io/seps/2577-deprecate-roots-sampling-and-logging>)): Roots (replaced by tool parameters, resource URIs, or server configuration), Sampling (replaced by direct integration with LLM provider APIs), and Logging (replaced by `stderr` for stdio transports and OpenTelemetry for structured observability). These deprecations are advisory. The methods, types, and capability flags remain functional in this release and in any specification version published within twelve months of it. However, we highly recommend that new implementations not take a dependency on them.

## 7\. Schema support

Tool `inputSchema` and `outputSchema` now support the full [JSON Schema 2020-12](<https://json-schema.org/draft/2020-12>) vocabulary ([SEP-2106](<https://modelcontextprotocol.io/seps/2106-json-schema-2020-12>)). Input schemas retain the `type: "object"` root requirement but gain composition keywords (`oneOf`, `anyOf`, `allOf`), conditionals, and internal references (`$ref`, `$defs`). Output schemas have no root-type restriction, and `structuredContent` may be any valid JSON value. Implementations must not follow external `$ref` URIs automatically and should enforce depth and time limits during validation.

## Deciding if you’re ready to update

Work through three questions before you enable the new version:

  1. **Are your clients ready?** Your agents reach Gateway through MCP client SDKs. Check that the SDKs your agent frameworks and host applications use have shipped 2026-07-28 support. Tier 1 SDKs were expected to ship support during the ten-week release candidate window, so most mainstream stacks are ready today. See the [MCP SDK documentation](<https://modelcontextprotocol.io/docs/sdk>) for the current tier list. Test clients that support 2026-07-28 before you advertise it on a production gateway.
  2. **Does anything you run depend on removed or changed behavior?** Audit for: protocol sessions used to carry application state, `logging/setLevel`, client code matching the literal `-32002` error code, and any dependence on Roots, Sampling, or Logging. If your tools use elicitation or sampling, note that the gateway carries these through a new per-request mechanism on 2026-07-28 rather than a persistent session. Confirm your clients declare the matching capability. A client that omits it is rejected with code `-32021`.
  3. **Do you control both sides?** You don’t need to. Version selection happens per request, so a dual-version gateway serves old and new clients simultaneously. You can upgrade clients and the gateway on independent schedules, in either order.



For the full details, see the MCP 2026-07-28 specification the [changelog against 2025-11-25](<https://modelcontextprotocol.io/specification/2026-07-28/changelog>), and the [MCP blog’s release candidate announcement](<https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/>)

## Updating your AgentCore Gateway

For AgentCore Gateway customers, adopting 2026-07-28 is a configuration change. Your AgentCore Gateway can support multiple protocol versions simultaneously. You can add 2026-07-28 to your gateway’s list of `supportedVersions` with a single `UpdateGateway` call. There’s no need to re-create the gateway or make changes to individual gateway target configurations. The MCP version is a property of the gateway, not of its targets, and updates to that property are performed in place. Tool definitions, target configuration, and inbound authentication (IAM and OAuth) are all unchanged by the version change.

`UpdateGateway` **replaces** `supportedVersions` with the set you send. It does not append. Read the current configuration first, then send the complete list you want the gateway to advertise:
    
    
    # 1. Read the current configuration.
    aws bedrock-agentcore-control get-gateway \
        --gateway-identifier <gateway-id>
    
    # 2. Advertise 2026-07-28 alongside the existing version.
    aws bedrock-agentcore-control update-gateway \
        --name <gateway-name> \
        --role-arn <gateway-role-arn> \
        --protocol-type MCP \
        --authorizer-type <gateway-authorizer-type> \
        --gateway-identifier <gateway-id> \
        --protocol-configuration '{
      "mcp": {
        "supportedVersions": ["2025-11-25", "2026-07-28"]
      }
    }'

AgentCore Gateway works with any of the following protocol versions: 2025-03-26, 2025-06-18, 2025-11-25, and 2026-07-28.

Confirm the new version is live by calling your gateway with the new headers:
    
    
    curl -s https://<your-gateway-endpoint>/mcp \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -H "Accept: application/json,text/event-stream" \
        -H "MCP-Protocol-Version: 2026-07-28" \
        -H "Mcp-Method: tools/list" \
        -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

A successful response confirms the gateway served the request at 2026-07-28. A rejection with code `-32022` means the version isn’t in the gateway’s `supportedVersions` yet, and the response body lists what the gateway currently advertises.

`supportedVersions` is the complete set the gateway advertises, so rolling back is the same operation in reverse. That is, send the list without 2026-07-28. Requests specifying the removed version are rejected with a response body listing the versions the gateway still supports. Make sure clients you’ve already migrated can fall back before you remove the version they’re requesting.

## How version selection works

Clients select a version on each request, not through a one-time handshake. Each MCP request declares its version in the `MCP-Protocol-Version` header, and the gateway honors it when it’s in `supportedVersions`:

  * A request naming a version the gateway advertises is served in that version. On a dual-version gateway (for example, 2026-07-28 and 2025-11-25), a 2026-07-28 request gets the new behavior and a 2025-11-25 request gets the earlier behavior.
  * A request naming a version the gateway does _not_ advertise is rejected with `HTTP 400` and code `-32022`. The response body lists the versions the gateway supports.
  * A request that omits the header gets the default version, 2025-03-26. If that default isn’t in the gateway’s `supportedVersions`, the request is rejected.



Your existing clients continue to work as long as they request protocol versions listed in the gateway’s `supportedVersions`. That gives you a clean, three-stage rollout: add 2026-07-28 alongside your existing versions, migrate clients at your own pace, and only after all clients request the new version, trim the list down.

If your gateway fronts an MCP server target that upgrades to 2026-07-28 before your clients do, it translates between versions, so a `2025-*` client can call ordinary tools on a 2026-07-28 target and receive results in the format it expects, without upgrading. However, this translation does not currently support elicitations and sampling calls from servers to clients. If a `2025-*` client calls a tool on the `2026-*` server that requires elicitation or sampling, it receives an error.

## Conclusion

MCP `2026-07-28` is the protocol’s biggest revision ever, and it’s designed to be the last revision that breaks compatibility. Statelessness gives MCP a foundation that scales on commodity HTTP infrastructure while MCP Extensions give new capabilities room to evolve on their own schedules.

With Amazon Bedrock AgentCore Gateway, adding support for the latest protocol version is only one `UpdateGateway` call. To get started, see the [AgentCore Gateway documentation](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway.html>), review the [MCP 2026-07-28 specification](<https://modelcontextprotocol.io/specification/draft>) and its [changelog](<https://modelcontextprotocol.io/specification/draft/changelog>), and try enabling the new version on a gateway today. If you have feedback on the specification itself, the maintainers welcome issues in the [MCP specification repository](<https://github.com/modelcontextprotocol/modelcontextprotocol/issues>). For questions about AgentCore Gateway, reach out through [AWS re:Post](<https://repost.aws/>) or your usual AWS Support channels.

* * *

## About the authors

### Sean Eichenberger

Sean is a Principal Product Manager at AWS Agentic AI. He leads initiatives across agent governance, safety, and connectivity for Amazon Bedrock AgentCore.

### Luca Chang

Luca is a Software Development Engineer at AWS working on Amazon Bedrock AgentCore, and is an MCP specification maintainer. Luca is an author of the MCP Tasks feature proposal and is an active bridge between AWS customer needs and protocol development efforts. His background spans distributed systems and complex AI applications.
