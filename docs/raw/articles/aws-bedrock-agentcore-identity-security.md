---
title: "aws bedrock agentcore identity security"
source: rss
source_url: [ORIGINAL_URL]
ingested: 2026-05-08
created: 2026-05-08
updated: 2026-05-08
type: raw
tags: [rss, aws, post-training]
summary: 3-legged OAuth + session binding / ECS AI Agent安全架构 / AgentCore Identity
sha256: d3fb03fe6f76
---
# Secure AI agents with Amazon Bedrock AgentCore Identity on Amazon ECS
AI agents in production require secure access to external services. Amazon Bedrock AgentCore Identity, available as a standalone service, secures how your AI agents access external services whether they run on compute platforms like [Amazon ECS,](<https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html>) [Amazon EKS](<https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html>), [AWS Lambda](<https://docs.aws.amazon.com/lambda/latest/dg/welcome.html>), or on-premises.
An earlier [post](<https://aws.amazon.com/blogs/security/securing-ai-agents-with-amazon-bedrock-agentcore-identity/>) covered AgentCore Identity credential management for AI agents. Running agents on compute environments like ECS raises two questions: How to build an application-owned Session Binding endpoint, and how to manage workload access token lifecycle?
This post implements Authorization Code Grant (3-legged OAuth) on Amazon ECS with secure session binding and scoped tokens. This post provides a working implementation with:
  * Secure session binding that prevents CSRF and browser-swapping attacks
  * Auth tokens scoped to each user session, following least-privilege principles
  * Separation of concerns between the agent workload and session binding service
## Authentication and authorization with OAuth 2.0 and OIDC
This solution uses OAuth 2.0 ([RFC 6749)](<https://datatracker.ietf.org/doc/html/rfc6749>) and OpenID Connect (OIDC). OIDC authenticates users (who they are), and OAuth 2.0 authorizes their actions (what they can do).
We focus on the Authorization Code Grant for user-delegated access. The user authenticates with an identity provider and grants consent. The application then exchanges an authorization code for an access token, which creates an audit trail.In this flow, the user authenticates with an identity provider and grants consent for the agent to access specific resources on their behalf. The application exchanges the resulting authorization code for a scoped access token which Amazon Bedrock AgentCore Identity secures in its token vault. Because each token is bound to a specific user identity with explicit consent, the solution maintains an auditable chain from user authentication through to agent action.
The Authorization Code Grant is suited for agentic workloads that act on behalf of users because it provides user consent before the agent can act, [session binding](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/oauth2-authorization-url-session-binding.html>) that verifies the user who initiated the authorization request is the same user who granted consent, and scoped delegation that limits the agent to only the permissions the user approved.
## Callback URL vs. session binding URL
In this context, the Authorization Code Grant flow uses two URLs that are often confused:
  * **Callback URL:** Automatically generated when [creating an OAuth client in AgentCore Identity.](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity-oauth-client.html>) It points to AgentCore Identity and must be registered with the Authorization Server as the redirect target where the authorization code is sent after user authentication.
  * **Session Binding URL:** The URL pointing back to a **customer-managed service** that completes the [session binding](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/oauth2-authorization-url-session-binding.html>) between the authenticated user and the OAuth flow. This endpoint is implemented and hosted by the customer.
## Solution overview
This architecture diagram shows how AgentCore Identity secures a self-hosted AI agent on Amazon ECS. This walkthrough uses Microsoft Entra ID as the identity provider, but other OIDC-compliant providers are supported. The complete source code and prerequisites for this walkthrough are available in the accompanying [GitHub repository.](<https://github.com/awslabs/agentcore-samples/tree/main/01-tutorials/03-AgentCore-identity/07-Outbound_Auth_3LO_ECS_Fargate>)
The solution deploys two services on Amazon ECS behind an Application Load Balancer. The Agentic Workload runs the AI agent and handles user requests. The Session Binding Service processes OAuth callbacks to link user sessions with third-party access tokens. Both services use Amazon Bedrock AgentCore Identity to authenticate users inbound via OIDC and authorize outbound actions on their behalf. The numbered annotations in the diagram correspond to the following descriptions.
  1. **Inbound authentication and traffic routing:** Requests arrive at an Amazon Application Load Balancer (ALB), which authenticates the user through the ALB’s built-in OIDC authentication flow. Traffic is encrypted with HTTPS using a certificate from AWS Certificate Manager, and an alias A record in an Amazon Route 53 public hosted zone routes traffic to the load balancer. After authenticating the user through OIDC, the ALB forwards the request to the Amazon ECS cluster. The ALB injects an `x-amzn-oidc-data` header containing the user’s claims in JWT format, with the `sub` field uniquely identifying the user.
  2. **Agentic workload:** The Agentic Workload exposes a FastAPI server with an `/invocations` endpoint that accepts a sessionId and message. The FastAPI server passes these to an agent built with [Strands Agents](<https://strandsagents.com/>). You can also use LangChain or other agent SDKs since the server handles requests independently of the agent framework. The agent calls a large language model (LLM) on Amazon Bedrock, but other model providers work, too. The agent stores session state in an Amazon S3 bucket and it uses the user’s sub claim as a key prefix to isolate sessions between users. The agent also has tools to perform actions on the user’s behalf in GitHub, which requires the user’s OAuth access token.
  3. **Outbound authentication with AgentCore Identity:** When the agent needs to act on the user’s behalf in a third-party service like GitHub, it requests an OAuth access token through AgentCore Identity. If no valid token exists, AgentCore Identity initiates an Authorization Code Grant flow, prompting the user to authorize access.
  4. **OAuth callback processing:** After the user authorizes access, the Session Binding Service completes the OAuth flow by binding the authorization to the correct user session via AgentCore Identity.
  5. **User interface:** The FastAPI server that hosts the agentic workload exposes a `/docs` endpoint, which renders the OpenAPI specification as an interactive HTML page. The end user interacts with the agent through this page, which provides a minimal UI for demonstration
Amazon CloudWatch captures logs, and a dedicated S3 bucket stores access logs for both the load balancer and the data bucket. ECS pulls container images from Amazon ECR. A set of basic AWS WAF rules is attached to the load balancer to provide baseline protection against common web exploits. An Amazon KMS customer managed key (CMK) encrypts data, except for the access logs bucket, which requires Amazon S3 managed encryption (SSE-S3).
## Amazon Bedrock AgentCore Identity: Authorization Code Grant
This walkthrough adapts the [general AgentCore Identity session binding flow](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/oauth2-authorization-url-session-binding.html>) for a self-hosted architecture using ALB for authentication, a dedicated Session Binding Service, and direct API calls instead of the AgentCore SDK and Runtime.
The sequence diagram shows how [AgentCore Identity’s workload identity](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/understanding-agent-identities.html>), [workload access tokens](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/get-workload-access-token.html>), and [OAuth 2.0 credential provider](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/resource-providers.html>) work together to securely provide OAuth tokens to the agent on behalf of a user. This flow assumes the authenticated user has not yet authorized the agent to access their resources, meaning no valid token exists in the [AgentCore Identity Token Vault](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/key-features-and-benefits.html#secure-credential-storage>).
## 
  1. An authenticated user sends a request to the agentic workload. The agentic workload extracts the user ID from the sub claim in the ALB-signed JWT (`x-amzn-oidc-data` header) to identify the user.
  2. The agentic workload calls the [GetWorkloadAccessTokenForUserId](<https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_GetWorkloadAccessTokenForUserId.html>) API, passing the `userId` and `workloadName`, to obtain a workload access token that represents the agent’s identity scoped to this user.
  3. AgentCore Identity returns the workload access token to the agentic workload.
  4. The agentic workload calls the [GetResourceOauth2Token](<https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_GetResourceOauth2Token.html>) API, passing the workload access token, the provider name of the configured OAuth 2.0 credential provider, a session binding URL (see [callbackUrl parameter](<https://aws.github.io/bedrock-agentcore-starter-toolkit/api-reference/identity.html>)), and the required scopes, for instance the `read:user` scope of GitHub. This requests an OAuth token for the third-party service (in this case, GitHub).
  5. Because no valid token exists for this user, AgentCore Identity [creates a sessionURI](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/oauth2-authorization-url-session-binding.html#:~:text=Invoke%20agent%20%E2%80%93%20Your%20agent%20code,user%20of%20the%20authorization%20request.>) that tracks the authorization flow state across the subsequent requests and responses during the OAuth 2.0 authentication process.
  6. AgentCore Identity returns an authorization URL and session URI to the workload
  7. The agentic workload returns the authorization URL to the user, prompting them to authorize access.
  8. The user clicks the authorization URL and grants the agent permission in the third-party provider’s consent screen.
  9. The Authorization Server sends the authorization code to AgentCore Identity.
  10. AgentCore Identity redirects the user to the Session Binding URL with the session URI appended, routing them to the Session Binding Service.
  11. The user’s browser follows the redirect to the Session Binding Service via the Session Binding URL. The ALB injects the JWT in the `x-amzn-oidc-data` header.
  12. The Session Binding Service calls the [CompleteResourceTokenAuth](<https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_CompleteResourceTokenAuth.html>) API with the session URI and user ID (extracted from the JWT), binding the completed authorization to the correct user session. On success, it returns a static application owned HTML page confirming the authorization was successful.
  13. AgentCore Identity exchanges the authorization code with the Authorization Server for an OAuth2 access token.
  14. The Authorization Server returns the OAuth2 access token.
  15. AgentCore Identity stores the token in the Token Vault.
  16. AgentCore Identity returns success to the Session Binding Service.
  17. The Session Binding Service displays “Authorization complete” to the user.
On subsequent requests, whether the user needs to re-authorize depends on the credentials the authorization server issued. AgentCore Identity stores both access tokens and refresh tokens (when available) in the Token Vault. When a refresh token is present — as with GitHub when User-to-server token expiration is enabled — AgentCore Identity automatically uses it to obtain a new access token once the original expires, without prompting the user again. If no refresh token was issued and the access token expires, the user will be prompted to re-authorize. Note that tokens can also be revoked on the provider side; in such cases, setting forceAuthentication: true forces a fresh authentication flow.
**Session binding:**
Session binding protects against two security threats:
**Cross-Site Request Forgery (CSRF):** An attacker attempts to bind their own OAuth token to the victim’s identity, causing the victim’s agent to unknowingly access the attacker’s resources, enabling data exfiltration and injection.
**Browser Swapping Attack:** An attacker tricks the victim into consenting on their behalf, binding the victim’s OAuth token to the attacker’s identity, granting the attacker direct access to the victim’s resources.
Session binding prevents both attacks by ensuring that the user ID at the agent workload matches the user ID at the Session Binding Service, with both identities cryptographically verified through the authentication chain.
AgentCore Identity also supports an optional customState parameter in the [GetResourceOauth2Token](<https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_GetResourceOauth2Token.html>) API that can be used to pass a cryptographically random nonce to protect your callback endpoint against CSRF attacks, as recommended by the OAuth 2.0 specification.
### Why we use GetWorkloadAccessTokenForUserId with AWS ALB and Microsoft Entra ID
The recommended API for obtaining a workload access token is [GetWorkloadAccessTokenForJWT](<https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_GetWorkloadAccessTokenForJWT.html>). This solution uses [GetWorkloadAccessTokenForUserId](<https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_GetWorkloadAccessTokenForUserId.html>) instead.
[GetWorkloadAccessTokenForJWT](<https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_GetWorkloadAccessTokenForJWT.html>) requires a dynamically validatable JWT whose signature can be verified at runtime against the issuer’s published signing keys, and whose aud claim matches your application. To obtain such a token from Microsoft Entra ID, you must include your Application ID in the scope of the OIDC authorization request, see the [AgentCore Microsoft Inbound documentation](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity-idp-microsoft.html#identity-idp-microsoft-inbound>) for details.
**_However, this is incompatible with the AWS ALB OIDC flow._**
As part of its OIDC handshake (see [ALB OIDC documentation](<https://docs.aws.amazon.com/elasticloadbalancing/latest/application/listener-authenticate-users.html#authentication-flow>)), the ALB sends the access token to Entra’s UserInfo endpoint to retrieve the authenticated user’s claims which is a mandatory step in the ALB’s authentication flow. This UserInfo endpoint is hosted on Microsoft Graph (<https://graph.microsoft.com/oidc/userinfo>), and it only accepts tokens scoped to Microsoft Graph. When you include your Application ID in the scope, the resulting access token has your application as the audience, the UserInfo endpoint rejects it with a 401 and the ALB returns a 561.
If you remove your Application ID from the scope, Entra defaults the access token audience to Microsoft Graph (`00000003-0000-0000-c000-000000000000`). The ALB handshake succeeds but the resulting JWT cannot be dynamically validated by AgentCore. It is unusable with [GetWorkloadAccessTokenForJWT](<https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_GetWorkloadAccessTokenForJWT.html>).
This solution: The ALB completes its handshake using the Graph-scoped token. The ALB forwards an ALB-signed JWT in the `x-amzn-oidc-data` header containing the user’s claims from the UserInfo endpoint, including a sub claim that uniquely identifies the authenticated user. We validate this ALB-signed JWT using AWS’s published signing keys, extract the `sub`, and pass it to [GetWorkloadAccessTokenForUserId](<https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_GetWorkloadAccessTokenForUserId.html>).
## Implementation
View the complete code [GitHub repository](<https://github.com/awslabs/amazon-bedrock-agentcore-samples/tree/main/01-tutorials/03-AgentCore-identity/07-Outbound_Auth_3LO_ECS_Fargate>).
### Obtaining the Workload Access Token
The server extracts the user ID from the JWT’s sub claim and requests a workload access token from AgentCore Identity. The server then uses this token, the session ID, and the message to invoke the agent on behalf of the user. Note that session ID here refers to the agent’s conversation session, not the OAuth session URI from the authorization flow.
    @router.post("/invocations")
    async def invoke_agent(
        request: InvocationRequest,
        user_id: str = Depends(get_current_user),
        settings: Settings = Depends(get_settings),
        agent_service: AgentService = Depends(get_agent_service),
    ) -> StreamingResponse:
        """Invoke agent with streaming response."""
        try:
            agentcore = boto3.client("bedrock-agentcore", region_name=settings.identity_aws_region)
            response = agentcore.get_workload_access_token_for_user_id(
                workloadName=settings.workload_identity_name, userId=user_id
            )
            workload_access_token = response["workloadAccessToken"]        
    return StreamingResponse(
                content=agent_service.stream_response(
                    user_message=request.user_message,
                    session_id=request.session_id,
                    user_id=user_id,
                    workload_access_token=workload_access_token,
                ),
                media_type="text/event-stream",
            )
### Requesting the access token
The server uses the `require_access_token` decorator from [AgentCore SDK](<https://github.com/aws/bedrock-agentcore-sdk-python/blob/main/src/bedrock_agentcore/identity/auth.py#L22-L34>) to retrieve OAuth 2.0 access token, see [Obtain OAuth 2.0 access token](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity-authentication.html>). We modify the decorator to accept the workload access token as an explicit parameter rather than resolving it internally, giving direct control over token lifecycle management while preserving the SDK’s token retrieval and error-handling logic
    def requires_access_token(
        *,
        provider_name: str,
        scopes: list[str],
        auth_flow: Literal["M2M", "USER_FEDERATION"],
        workload_access_token: str | None = None,
        session_binding_url: str | None = None,
        on_auth_url: Callable[[str], Any] | None = None,
        force_authentication: bool = False,
        token_poller: TokenPoller | None = None,
        custom_state: str | None = None,
        custom_parameters: dict[str, str] | None = None,
        into: str = "access_token",
        region: str | None = None,
    ) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
        """Fetch OAuth2 access token with explicit workload token.
        Args:
            provider_name: The credential provider name
            scopes: OAuth2 scopes to request
            auth_flow: Authentication flow type ("M2M" or "USER_FEDERATION")
            workload_access_token: The workload access token (explicit, not from context)
            session_binding_url: Session Binding URL pointing to the customer-managed service that completes the session binding
            on_auth_url: Handler invoked with the authorization URL when user authorization is required
            force_authentication: Force re-authentication
            token_poller: Custom token poller implementation
            custom_state: State for callback verification
            custom_parameters: Additional OAuth parameters
            into: Parameter name to inject the token into
            region: AWS region
        Returns:
            Decorator function
        """
    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        client = IdentityClient(region)
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            try:
                if not workload_access_token:
                    raise ValueError("workload_access_token is required")
                token = await client.get_token(
                    provider_name=provider_name,
                    agent_identity_token=workload_access_token,
                    scopes=scopes,
                    auth_flow=auth_flow,
                    callback_url=session_binding_url,
                    on_auth_url=on_auth_url,
                    force_authentication=force_authentication,
                    token_poller=token_poller,
                    custom_state=custom_state,
                    custom_parameters=custom_parameters,
                )
                kwargs[into] = token
                return await func(*args, **kwargs)
            except Exception:
                logger.exception("Error in requires_access_token decorator")
                raise
        return wrapper
    return decorator
Our tool class uses this decorator to supply the access token when calling the GitHub API.
    class GitHubTools:
        """Tools for interacting with GitHub using OAuth authentication."""
    def _on_auth_url(self, url: str) -> None:
        """Handle authorization URL by raising AuthorizationRequiredError.
        This URL must be presented to the user to grant access.
        """
        raise AuthorizationRequiredError(provider="GitHub", auth_url=url)
    async def _call_github_api(
        self, endpoint: str, scopes: list[str], params: dict | None = None
    ) -> Any:
        """Make authenticated GitHub API call.
        Raises:
            ApiError: When API call fails
        """
        @requires_access_token(
            provider_name=self.config.provider_name,
            scopes=scopes,
            auth_flow="USER_FEDERATION",
            workload_access_token=self.config.workload_access_token,
            session_binding_url=self.config.session_binding_url,
            on_auth_url=self._on_auth_url,
            region=self.config.aws_region,
        )
        async def make_request(*, access_token: str) -> Any:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.config.github_api_base}{endpoint}",
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Accept": "application/vnd.github+json",
                        "X-GitHub-Api-Version": "2022-11-28",
                    },
                    params=params or {},
                    timeout=10.0,
                )
                response.raise_for_status()
                return response.json()
        try:
            return await make_request()
Each tool in the class uses this method, as shown below:
    from strands import tool
    class GitHubTools:
        @tool
        async def get_github_user(self) -> GitHubUser:
            """Get the authenticated GitHub user's profile information.
            Use this tool when the user wants to:
            - See their GitHub profile
            - Check who they are authenticated as
            - View their GitHub account details
            Returns:
                GitHub user profile
            Raises:
                ApiError: When API call fails
            """
            result: dict[str, Any] = await self._call_github_api(
                "/user", scopes=["read:user"]
            )
            return GitHubUser.model_validate(result)
Three key design choices:
  * **[Pydantic BaseModel](<https://pydantic.dev/docs/validation/latest/api/pydantic/base_model/>) as return types:** GitHubUser and GitHubProject are `BaseModel` sub-classes. Strands automatically derives tool descriptions from their schema and docstrings, giving the LLM structured context about each tool’s return type.
  * **Type-consistent error handling:** When no token exists and AgentCore Identity returns an authorization URL, the `on_auth_url` callback raises an ` AuthorizationRequiredError` rather than returning a string — a tool declaring GitHubUser as its return type cannot return a URL. The agent’s streaming layer catches the exception and surfaces the URL to the user.
  * **Scopes per tool:** Each tool declares only the OAuth scopes it needs, keeping consent aligned with the principle of least privilege.
### Completing the OAuth session binding flow
Next, we look at the session binding service. When a user authorizes access in GitHub, GitHub redirects them to `{session_binding_url}?session_id={session_id}`, where `session_id` corresponds to the session URI that AgentCore Identity included in the original authorization URL. This ties the session binding request to the specific OAuth flow the agent initiated.
    @router.get("/session-binding", response_class=HTMLResponse)
    async def oauth_session_binding(
        session_id: str = Query(..., description="Session URI from AgentCore Identity"),
        user_id: str = Depends(get_current_user),
        settings: Settings = Depends(get_settings),
    ) -> HTMLResponse:
        """Handle OAuth2 session binding from external providers.""" 
        client = boto3.client("bedrock-agentcore", region_name=settings.identity_region)
        try:
            client.complete_resource_token_auth(
                sessionUri=session_id,
                userIdentifier={"userId": user_id},
            )
The service extracts the user ID from the sub claim in the `x-amzn-oidc-data` header, ensuring consistent identity across the flow. It then calls [complete_resource_token_auth](<https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_CompleteResourceTokenAuth.html>) with the session URI and user ID, which binds the resulting access token to the correct user session.
## Cleanup
To avoid incurring future charges, delete the resources created by this solution when they are no longer needed. Follow the instruction for [cleaning up the resources](<https://github.com/awslabs/agentcore-samples/tree/main/01-tutorials/03-AgentCore-identity/07-Outbound_Auth_3LO_ECS_Fargate#cleanup>).
## Conclusion
In this post, you learned how to secure AI agents on Amazon ECS using Amazon Bedrock AgentCore Identity. You saw how inbound authentication verifies user identity via OIDC, how outbound authentication implements OAuth 2.0 with session binding, and how separating session binding from your agent workload enables independent scaling while protecting against attacks. This pattern works across different compute platforms, whether you run agents on ECS, EKS, Lambda, or outside AWS entirely. It also extends beyond GitHub to other OAuth 2.0-enabled services like Jira, Salesforce, or Google Calendar. Next steps:
  1. Review the complete [code in GitHub](<https://github.com/awslabs/amazon-bedrock-agentcore-samples/tree/main/01-tutorials/03-AgentCore-identity/07-Outbound_Auth_3LO_ECS_Fargate>) to see the implementation
  2. Adapt the pattern to your OAuth provider, replace GitHub with your service
  3. Explore additional patterns in the [AgentCore Identity Samples repository](<https://github.com/awslabs/amazon-bedrock-agentcore-samples/tree/main>)
  4. Read the [post on AgentCore Runtime](<https://aws.amazon.com/blogs/security/securing-ai-agents-with-amazon-bedrock-agentcore-identity/>) for managed agent hosting
  5. Dive into the [AgentCore Identity documentation](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity-overview.html>)
* * *
## About the authors
**Julian Grüber** is a Data Science Consultant at Amazon Web Services. He partners with strategic customers to scale GenAI solutions that unlock business value, working at both the use case and enterprise architecture level. Drawing on his background in applied mathematics, machine learning, business, and cloud infrastructure, Julian bridges technical depth with business outcomes to address complex AI/ML challenges
**Tobias** works as Security Consultant at Amazon Web Services as a Security Engineer. Tobias combines hands-on solution building with strategic advisory to help enterprise customersaccelerate their cloud transformation and achieve their business objectives. He specializes in partnering with strategic customers to design and scale GenAI solutions, operating at both the use-case and enterprise-architecture level.
**Satveer Khurpa**  is a Sr. WW Specialist Solutions Architect, Amazon Bedrock AgentCore at Amazon Web Services, specializing in agentic AI security with a focus on AgentCore Identity and Security. In this role, he uses his expertise in cloud-based architectures to help clients design and deploy secure agentic AI systems across diverse industries. Satveer applies his deep understanding of agentic AI patterns, identity and access management, and defense-in-depth security principles to architect scalable, secure, and responsible agent-based applications, enabling organizations to unlock new business opportunities while maintaining robust security postures for autonomous AI workloads.