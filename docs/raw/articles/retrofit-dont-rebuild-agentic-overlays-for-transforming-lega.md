---
source_url: "https://aws.amazon.com/blogs/machine-learning/retrofit-dont-rebuild-agentic-overlays-for-transforming-legacy-enterprise-services/"
ingested: 2026-06-26
sha256: d9c9194849d4a29c
---

# Retrofit, don’t rebuild: Agentic overlays for transforming legacy enterprise services

The opinions expressed in this post are the authors’ views and not those of Cisco.

Enterprise architectures have long been centered on [REST APIs](<https://aws.amazon.com/what-is/restful-api/>) and microservices. These systems are stable, well-tested, and deeply embedded in production environments. They weren’t designed for [Agent-to-Agent](<https://github.com/a2aproject/A2A>) (A2A) communication, the emerging standard for autonomous agents that collaborate, reason, and coordinate through structured messaging. That worked in the absence of a common agent protocol, but it means many existing agents now sit outside the emerging A2A framework. The challenge today is no longer only adding A2A to traditional services. You also need to bring these REST-based agents into a standardized agent-to-agent world.

In this technical collaboration between AWS and the authors, we present a pragmatic solution: _agentic overlays_. Agentic overlays are thin wrapper layers that transform traditional REST-based services into agents capable of participating in A2A interactions. They also expose REST APIs as tools compatible with the [Model Context Protocol](<https://modelcontextprotocol.io/docs/getting-started/intro>) (MCP). Together, they let enterprises add A2A capabilities to existing REST services without rewriting business logic, without duplicating code, and without running parallel infrastructures. This reduces agent sprawl in the infrastructure by reusing existing services as agents. We provide reference architectures and sample code that show how to build agentic overlays.

## Background: REST vs. A2A

REST APIs are designed for deterministic, client-server integration. A client calls a well-defined endpoint, passes parameters, and receives a predictable response, typically in a stateless request-response flow governed by HTTP semantics. This makes REST excellent for exposing business capabilities (such as create, read, update, and delete) with clear contracts, strong compatibility, and operational simplicity.

A2A is designed for interoperability between autonomous agents. Agents discover one another through metadata (such as an agent card), negotiate capabilities, and exchange structured messages (often through [JSON-RPC](<https://www.jsonrpc.org/>)) to coordinate multi-step tasks. Where REST optimizes for stable service interfaces and direct execution, A2A optimizes for reasoning-driven coordination, task-oriented messaging, and agent collaboration. The result is systems that can plan, delegate, and compose actions across multiple services rather than invoking isolated endpoints.

## Challenges with moving towards agentic systems

REST APIs and agentic systems are based on orthogonal paradigms, which makes it hard for enterprises to move existing services into standardized agentic communication. Yet enterprises need to use both without a major overhaul. Although newer agent communication through A2A introduces coordination models for enterprise systems, adoption has been slowed by the need to deploy and operate agentic infrastructures alongside existing enterprise systems. This parallel operation increases operational complexity and cost, creating barriers to adopting AI effectively.

Before A2A was standardized, enterprises commonly deployed agents as REST-based or proprietary services. They treated them as conventional APIs with agent-specific logic embedded in request-response endpoints. As a result, many existing agents today aren’t A2A-native, which creates a new migration challenge: making these agents interoperate using standardized A2A protocols without rewriting their core logic.

_Fig 1: REST-based application_

The preceding figure shows a REST-based application. The REST API stack might be a monolith or a set of distributed endpoints. The REST API controller doesn’t need to be an explicit broker that delegates requests outside the application. It can be part of the framework itself. For example, in a Flask application, the framework provides the controller abstraction out of the box, as you typically see when using [@app.route() or Flask’s RESTful extensions](<https://flask.palletsprojects.com/en/stable/quickstart/>). The idea here is to capture the REST stack with a set of endpoints.

## Solution approaches

In this section, we discuss the different approaches you could take to add an agentic capability to a legacy enterprise system. We compare them to the approach of using agentic overlays.

**Maintain separate REST and A2A stacks** : One approach is to develop and maintain two parallel ways to expose the same capabilities. This could mean:

  * Two sets of endpoints: `/api/v2/...` and `/a2a/...`.
  * Two implementations of auth, validation, and error mapping (unless carefully reused).
  * Two deployment pipelines (build, test, release, rollback).
  * Double observability work: logs, metrics, and tracing for both paths.
  * Higher risk of inconsistency. A2A may return a different output for the same operation carried out by REST.
  * Higher cost and operational complexity over time.



_Fig 2: Separate REST and A2A stacks_

**Separated stacks, but shared business logic** : Refactoring existing endpoints means you change your current REST API code structure (and sometimes behavior) so it can be reused by a new interface such as A2A. Instead of leaving REST endpoints as-is, you reorganize them, usually by extracting business logic into shared services and updating controllers and handlers to call those services. Even if the external REST paths remain the same, refactoring can introduce regressions, behavior drift, and a large test burden.

_Fig 3: Separated stacks, shared business logic_

## The core idea: Agentic overlays

An _agentic overlay_ is a thin wrapper layer that lets REST-based services participate in A2A communication. The overlay:

  * Transforms an agentic message into a REST payload, and the reverse.
  * Exposes REST endpoints as agent tasks or tools.



Most importantly, A2A isn’t a new API. It’s a new interface to an existing API. The underlying REST service remains unchanged.

### Adding an agentic overlay within the application

In this approach, you have two sets of endpoints, `/api/v2/...` and `/a2a/...` (REST vs. A2A), as shown in the following diagram, but a single deployment pipeline for build, test, release, and rollback. With this pattern, traditional REST API endpoints can be transformed into agentic endpoints without rewriting the core business logic. The deployment process doesn’t change for the service. For the same host and same port, you add new routes, although the systems might need to be scaled to handle increased traffic.

You can apply the agent skills themselves for routing. An MCP server can be used to invoke external services, but agent skills can route requests within the agent scope directly without importing APIs into an MCP server as skills. Whatever endpoints you have can be exposed as agent skills without needing a separate MCP server.

_Fig 4: Agentic overlay within an application_

This approach reduces agent sprawl in the infrastructure by reusing existing services as agents. This design pattern works well for supervisor agents that need both REST-based and agentic capabilities with limited functional scope, such as intent classification and routing.

## Agentic overlay example implementation

As a proof of concept, this section shows how to port an example legacy REST-based calculator service that uses Flask into an agentic system using an overlay. For the overlay, we add the standard A2A components (or routes), such as a well-known agent card, agent message endpoint, capabilities, skills, and health. We also introduce a message transformation design pattern that converts agentic messages to REST API messages, then issues REST invocation calls from the agent. The A2A message translation workflow is as follows:

  1. Receives JSON-RPC 2.0 requests.
  2. Maps A2A tasks to REST endpoints.
  3. Forwards authentication headers.
  4. Calls REST endpoints internally.
  5. Translates REST responses to JSON-RPC format.



### Step 0: Request-response format

This section compares the request-response format for the REST and A2A protocols, using the calculator example demonstrated in the following sections.

REST vs. A2A input request:

**REST** | **A2A**  
---|---  
{ “operation”: “add”, “operands”: [5, 3] } | { “jsonrpc”: “2.0”, “method”: “SendMessage”, “params”: { “message”: { “role”: “user”, “parts”: [ { “kind”: “data”, “data”: { “operation”: “add”, “operands”: [5, 3] } } ] } }, “id”: 1 }  
  
REST vs. A2A output response:

**REST** | **A2A**  
---|---  
{“result”: 8} | { “jsonrpc”: “2.0”, “result”: { “messageId”: “uuid”, “contextId”: “uuid”, “role”: “agent”, “parts”: [{“kind”: “data”, “data”: {“result”: 8}}], “kind”: “message”, “metadata”: {} }, “id”: 1 }  
  
### Step 1: Set up the agent

In this step, you create the calculator agent example with a well-known agent card and agent skills loaded. The `build_agent_card` function builds the agent card dynamically.
    
    
    """
    A2A Request Translator - Calculator Example.
    
    This module implements the Request Translator Pattern to provide A2A
    (JSON-RPC 2.0) compatibility over the existing Calculator REST API.
    
    A2A Spec 0.3 Compliance:
    - Agent Card: GET /.well-known/agent-card.json
    - JSON-RPC endpoint: POST /a2a
    - Methods: SendMessage, SendStreamingMessage
    - Message format: { "message": { "parts": [{ "kind": "data", "data": {...} }] } }
    """
    
    # Default A2A API URL (override via build_agent_card(url) if needed)
    A2A_API_URL = "http://localhost:5000/a2a"
    
    EXECUTE_TIMEOUT_SECONDS = 30
    
    # Load skills from JSON file
    _SKILLS_FILE = Path(__file__).parent / "skills.json"
    _SKILLS_CACHE: Optional[List[Dict[str, Any]]] = None
    
    def _load_skills() -> List[Dict[str, Any]]:
        """
        Load skills from the skills.json file.
        Skills are cached after first load to avoid repeated file reads.
        """
        global _SKILLS_CACHE
        if _SKILLS_CACHE is not None:
            return _SKILLS_CACHE
        try:
            with open(_SKILLS_FILE) as f:
                _SKILLS_CACHE = json.load(f)
                return _SKILLS_CACHE
        except FileNotFoundError:
            logger.error(f"Skills file not found: {_SKILLS_FILE}")
            return []
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in skills file: {e}")
            return []
    
    def build_agent_card(api_url: Optional[str] = None) -> Dict[str, Any]:
        """Build the A2A Agent Card (v0.3.0 format) with configurable API URL."""
        if api_url is None:
            api_url = A2A_API_URL
        return {
            "name": "Calculator Agent",
            "description": "Simple calculator supporting basic arithmetic operations",
            "supportedInterfaces": [
                {"url": api_url, "protocolBinding": "JSONRPC", "protocolVersion": "0.3"},
            ],
            "provider": {
                "organization": "Example Organization",
                "url": "",
            },
            "version": "1.0.0",
            "capabilities": {
                "streaming": False,
                "pushNotifications": False,
                "extendedAgentCard": False,
            },
            "defaultInputModes": ["text/plain", "application/json"],
            "defaultOutputModes": ["text/plain", "application/json"],
            "skills": _load_skills(),
        }
    
    # Agent Card built dynamically
    AGENT_CARD = build_agent_card()

### Step 2: Implement the internal REST caller
    
    
    def invoke_rest_endpoint(
        endpoint: str,
        json_data: Optional[Dict] = None,
        http_method: str = "POST"
    ) -> Tuple[Optional[Dict], int]:
        """
        Call internal REST endpoint via real HTTP request.
    
        Uses requests.post/get to call the running server. This ensures
        any middleware, decorators, and headers are properly exercised.
    
        Args:
            endpoint: REST endpoint path (e.g. "/api/v1/calculate")
            json_data: Request body for POST/PUT
            http_method: HTTP method (GET, POST, etc.)
    
        Returns:
            Tuple of (response_data, status_code)
        """
        try:
            base_url = request.host_url.rstrip("/")
            url = f"{base_url}{endpoint}"
    
            headers = {"Content-Type": "application/json"}
            auth_header = request.headers.get("Authorization")
            if auth_header:
                headers["Authorization"] = auth_header
    
            logger.info(f"Adapter: Delegating to REST {http_method} {url}")
    
            if http_method.upper() == "POST":
                response = http_requests.post(
                    url, json=json_data, headers=headers,
                    timeout=EXECUTE_TIMEOUT_SECONDS
                )
            elif http_method.upper() == "GET":
                response = http_requests.get(
                    url, headers=headers,
                    timeout=EXECUTE_TIMEOUT_SECONDS
                )
            else:
                response = http_requests.request(
                    http_method, url, json=json_data, headers=headers,
                    timeout=EXECUTE_TIMEOUT_SECONDS
                )
    
            logger.info(f"Adapter: REST returned {response.status_code}")
            return response.json(), response.status_code
    
        except http_requests.RequestException as e:
            logger.error(f"Adapter: Error calling REST endpoint: {e}", exc_info=True)
            return {"error": "Internal server error"}, 500

### Step 3: Implement message payload extraction (A2A Spec 0.3)
    
    
    def extract_message_payload(message: Dict) -> Optional[Dict]:
        """
        Extract payload from A2A message parts (Spec 0.3 format).
    
        Expected format:
        {
            "message": {
                "parts": [{"kind": "data", "data": {"operation": "add", "operands": [5, 3]}}]
            }
        }
    
        Returns:
            Extracted data payload as dict, or None if not found
        """
        try:
            parts = message.get("parts", [])
            for part in parts:
                if isinstance(part, dict) and part.get("kind") == "data":
                    return part.get("data")
            return None
        except Exception as e:
            logger.error(f"Error extracting message payload: {e}")
            return None
    
    def build_a2a_message(message_id: str, context_id: str, content: Any) -> Dict:
        """
        Build an A2A-compliant message object (A2A Spec 0.3).
    
        Response format:
        {
            "messageId": "uuid",
            "contextId": "uuid",
            "role": "agent",
            "parts": [{"kind": "data", "data": {...}}],
            "kind": "message",
            "metadata": {}
        }
        """
        if isinstance(content, dict):
            parts = [{"kind": "data", "data": content}]
        else:
            parts = [{"kind": "text", "text": str(content)}]
    
        return {
            "messageId": message_id,
            "contextId": context_id,
            "role": "agent",
            "parts": parts,
            "kind": "message",
            "metadata": {}
        }

**Note on Server-Sent Events (SSE) for streaming:**

The preceding `extract_message_payload()` function works the same way for both `SendMessage` and `SendStreamingMessage`.

For operations that are instant (like our calculator), both methods return a single result. For long-running operations (for example, report generation or data analysis), SSE streaming allows the server to push incremental updates.

### Step 4: Implement JSON-RPC response builders
    
    
    # The error codes defined as per JSON-RPC 2.0 specification
    class JsonRpcError:
        PARSE_ERROR = -32700
        INVALID_REQUEST = -32600
        METHOD_NOT_FOUND = -32601
        INVALID_PARAMS = -32602
        INTERNAL_ERROR = -32603
    
    def jsonrpc_error(code: int, message: str, data: Any = None, request_id: Any = None) -> Dict:
        """Build a JSON-RPC 2.0 error response."""
        response = {
            "jsonrpc": "2.0",
            "error": {"code": code, "message": message},
            "id": request_id
        }
        if data is not None:
            response["error"]["data"] = data
        return response
    
    def jsonrpc_success(result: Any, request_id: Any = None) -> Dict:
        """Build a JSON-RPC 2.0 success response."""
        return {
            "jsonrpc": "2.0",
            "result": result,
            "id": request_id
        }

### Step 5: SendMessage — A2A-to-REST delegation
    
    
    def handle_send_message(data: Dict) -> Tuple[Any, int]:
        """
        Handle SendMessage -- dumb pass-through to /api/v1/calculate.
        The adapter does NOT inspect or route based on payload contents.
        """
        request_id = data.get("id")
        params = data.get("params", {})
        message = params.get("message", {})
        context_id = message.get("contextId") or generate_id()
        message_id = generate_id()
    
        payload = extract_message_payload(message)
        if not payload:
            return jsonify(jsonrpc_error(
                JsonRpcError.INVALID_PARAMS,
                "Invalid params: No data found in message.parts.",
                request_id=request_id
            )), 400
    
        # Pass through payload as-is to the single REST endpoint
        rest_response, status = invoke_rest_endpoint(
            endpoint="/api/v1/calculate",
            json_data=payload,
            http_method="POST"
        )
    
        if 200 <= status < 300:
            a2a_message = build_a2a_message(message_id, context_id, rest_response)
            return jsonify(jsonrpc_success(a2a_message, request_id)), 200
        else:
            error_message = "Operation failed"
            if isinstance(rest_response, dict):
                error_message = (rest_response.get("error")
                                 or rest_response.get("details")
                                 or "Operation failed")
            error_code = (JsonRpcError.INVALID_PARAMS if 400 <= status < 500
                          else JsonRpcError.INTERNAL_ERROR)
            return jsonify(jsonrpc_error(
                error_code, error_message,
                data=rest_response, request_id=request_id
            )), status
    
    # we need to explicitly add the routes as the a2a
    
    def generate_id() -> str:
        """Generate a UUID for message/context IDs."""
        return str(uuid.uuid4())

### Step 6: Set up A2A routes (Spec 0.3)

The official A2A SDK provides A2A libraries for FastAPI and Starlette applications that abstract away the complexity of adding A2A-specific routes. Although A2A libraries are also available for Flask apps, we don’t use them in our sample code. We want to make it straightforward for you to understand what it takes to host an A2A overlay over a Flask app. The following code snippet adds the routes needed for A2A.
    
    
    def setup_a2a_routes(app: Flask) -> None:
        """Register A2A protocol v0.3 routes on the Flask application."""
        app.add_url_rule("/.well-known/agent-card.json", "get_agent_card",
                         get_agent_card, methods=["GET"])
        app.add_url_rule("/a2a/capabilities", "get_capabilities",
                         get_capabilities, methods=["GET"])
        app.add_url_rule("/a2a/health", "a2a_health",
                         a2a_health, methods=["GET"])
        app.add_url_rule("/a2a", "a2a_jsonrpc",
                         _handle_jsonrpc, methods=["POST"])
        logger.info("A2A Protocol v0.3 routes registered")

### Step 7: Finally, initialize in your application
    
    
    # app/main.py
    from flask import Flask
    from app.rest_api import rest_api
    from app.a2a_adapter import setup_a2a_routes
    
    def create_app():
        app = Flask(__name__)
    
        # Register existing REST API
        app.register_blueprint(rest_api)
    
        # Add A2A Protocol support (Request Translator Pattern)
        setup_a2a_routes(app)
        app.logger.info("A2A Protocol enabled via Request Translator Pattern")
    
        return app

### Step 8: Run your application

From the project base directory, run the following commands.
    
    
    python -m venv venv
    source venv/bin/activate   # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
    python -m app.main

## Adding an agentic overlay using Amazon Bedrock AgentCore Gateway

Amazon Bedrock AgentCore is a service for building, connecting, and optimizing agents at scale without managing infrastructure. As shown in the following diagram, AgentCore Gateway can decouple the agentic overlay from the application by serving as a single access point for endpoints and services. This separation lets one agentic overlay serve multiple services or applications, not only one. AgentCore Gateway supports up to 10 targets per gateway, with native integration into existing AWS services and support for OpenAPI endpoints.

_Fig 5: Decoupling the agentic overlay using Amazon Bedrock AgentCore Gateway_

Enterprise-scale applications often orchestrate multiple services to handle complex tasks. For example, a calculator application processing “Calculate 2 * (3 + 4).” As shown in the following diagram, the system first queries an order-of-operations endpoint (such as `/api/order-of-ops/...`) to determine the order of evaluation. It then makes sequential calls to an endpoint (such as `/api/arithmetic/...`) to calculate “3 + 4” followed by “2 * 7.” Adding an agentic overlay to each service would introduce its own overhead. Instead, you can tie both services together into a single agentic overlay that orchestrates the calls as needed.

You can separate the agentic overlay from your application to organize your agentic overlays based on functionality rather than only by application. The agentic overlays act as an agentic way to interact with your applications and your systems, an agentic way to interact with functionality.

Beyond AgentCore Gateway, additional AgentCore capabilities simplify monitoring, iteration, and deployment of your agentic overlay. [AgentCore Identity](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity-overview.html>) handles authentication for both agent and gateway components, supporting OAuth 2.0 providers with managed integrations for Okta, GitHub, and Slack. [AgentCore Observability](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability-configure.html>) monitors agent performance through metrics, logs, and span visualizations. You can view high-level data such as tool calls and latency, or inspect granular execution paths across components, with native Amazon CloudWatch integration. [AgentCore Runtime](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agents-tools-runtime.html>) deploys models through a container image, whether open-source, custom, or [Amazon Bedrock LLMs](<https://aws.amazon.com/bedrock/?sec=aiapps&pos=2>) such as Nova and Anthropic Claude, without requiring you to manage large language model (LLM) infrastructure.

_Fig 6: Decoupling the agentic overlay using Amazon Bedrock AgentCore capabilities — runtime, gateway, identity, and observability_

By using the different capabilities of AgentCore, you can simplify the deployment of your agent and your agentic overlay, with straightforward integration into your existing AWS stack. Because it’s a managed service, it also reduces the work needed to implement your agentic overlay.

## Partnering to accelerate enterprise AI adoption

This agentic overlay pattern represents a broader collaboration between the authors and AWS to help enterprises bridge the gap between existing infrastructure and emerging AI capabilities. Successful AI adoption requires pragmatic solutions that respect existing investments and support incremental transformation. Together, AWS and the authors are developing reference architectures, implementation patterns, and tooling that let enterprises adopt A2A communication without wholesale infrastructure replacement. The agentic overlay pattern exemplifies this philosophy: preserve what works, extend where needed, and provide clear migration paths that minimize risk while maximizing value.

## Conclusion

Agentic overlays give enterprises a pragmatic path to adopt Agent-to-Agent communication without abandoning their REST API investments. By adding a thin translation layer that converts A2A messages to REST payloads, organizations can participate in the emerging agentic landscape while preserving stable, production-tested business logic. The two implementation patterns offer flexibility to match organizational needs: within-application overlays for focused use cases, and AgentCore Gateway for enterprise-scale deployments. Whether you’re enabling a single supervisor agent or orchestrating complex multi-service workflows, agentic overlays reduce the operational overhead of parallel infrastructures and the regression risk of wholesale refactoring.

As enterprises navigate the transition from deterministic REST APIs to reasoning-driven agentic systems, the key insight remains: _A2A isn’t a new API. It’s a new interface to your existing API_. This perspective shifts the adoption challenge from rebuilding everything to retrofitting incrementally, so organizations can realize AI value faster while managing risk effectively. For organizations ready to explore agentic overlays, the calculator example provides a concrete starting point, and AgentCore offers infrastructure for production deployments.

## Next steps

  1. **Evaluate your architecture** – Audit REST services for A2A enablement candidates. Within-application overlays fit single-service agents. AgentCore Gateway fits multi-service workflows.
  2. **Review the reference implementation** – The Flask calculator example demonstrates the translation pattern with agent card setup, message extraction, REST invocation, and response building.
  3. **Explore Amazon Bedrock AgentCore** – AgentCore Gateway, Identity, and Observability provide infrastructure for production agentic overlays.
  4. **Join the A2A community** – The A2A Protocol specification and SDK documentation are available at [a2a-protocol.org](<https://a2a-protocol.org/>), with libraries for Flask, FastAPI, and Starlette applications.



The future of enterprise AI lies not in replacing existing systems, but in extending them with agentic capabilities. Agentic overlays make that future accessible today.

* * *

## About the authors

### Renuka Kumar

Renuka, Ph.D., is a Principal Software Engineer at Cisco, where she has architected and led the development of Cisco’s Cloud Security BU’s AI/ML capabilities in the last 3 years, including launching first-to-market innovations in this space. She has over 20 years of experience in several cutting-edge domains, with over a decade in security and privacy. She holds a PhD from the University of Michigan in Computer Science and Engineering.

### Jessica Wu

Jessica is an Associate Solutions Architect at AWS. She works with AWS Strategic Customers to build highly performant, resilient, fault-tolerant, cost-optimized, and sustainable architectures. Jessica is also focused on helping customers overcome the challenge of adopting, integrating, and expanding on AI and AI-supported workloads.

### Shweta Keshavanarayana

Shweta is a Senior Customer Solutions Manager at AWS. She works with AWS Strategic Customers and helps them in their cloud migration and modernization journey. Shweta is passionate about solving complex customer challenges using creative solutions. She holds an undergraduate degree in Computer Science & Engineering. Beyond her professional life, she volunteers as a team manager for her sons’ U9 cricket team, while also mentoring women in tech and serving the local community.

### Abhishek Ghiya

Abhishek is a Lead Software Engineer at Cisco, where he operates at the intersection of cybersecurity and AI/ML. He specializes in building LLM-powered agents and designing scalable AI solutions on AWS using Docker and Kubernetes. With a deep background in identity and access management, API gateways, and policy engines, Abhishek is passionate about solving complex architectural challenges. His technical expertise spans full-stack development and the construction of event-driven systems in cloud-native environments.
