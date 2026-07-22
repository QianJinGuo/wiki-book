---
source: rss
source_url: "https://aws.amazon.com/cn/blogs/china/tool-mcp-server-amazon-bedrock-agentcore-quick/"
tags: [aws-china-blog, agentic-ai, context-engineering]
fetcher: jina
ingested: 2026-05-11
review_value: 8
review_confidence: 7
review_recommendation: strong
review_stars: 4
sha256: 948832477ed7761bff33c09ef708bbdadaeb0ecd2b0ed3c415911048968ba821
---
---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/tool-mcp-server-amazon-bedrock-agentcore-quick/
ingested: 2026-05-11
feed_name: AWS China Blog
source_published: 2026-05-11T08:48:15Z
---
# 自己的工具自己控：MCP Server、Amazon Bedrock AgentCore、Quick Suite集成指南
摘要：本文以将飞书（Lark）能力封装为 MCP Server 为例，演示如何通过 Amazon Bedrock AgentCore Gateway 实现统一鉴权与路由，将自建 MCP Server 部署到 AgentCore Runtime，并最终接入 Amazon Quick Suite 的 Chat Agent。六步走通 Cognito 认证、Gateway创建、容器化部署、Target 注册、端到端验证到 Quick Suite集成的完整链路，让你的自定义工具稳定运行在自己的云账户中，用自然语言即可调用，数据全程不经过任何第三方。这套模式可复制到Jira、Jenkins、数据库等任意内部系统，真正实现”自己的工具自己控”。
**目录**
01 一、引言
02 二、总体架构
03 三、前置条件
04 四、第一步：创建 Cognito 认证基础设施
05 五、第二步：创建 Amazon Bedrock AgentCore Gateway
06 六、第三步：部署 MCP Server 到 Amazon Bedrock AgentCore Runtime
07 七、第四步：将 MCP Server 注册为 Gateway Target
08 八、第五步：端到端验证
09 九、第六步：在 Quick Suite 中配置 MCP Integration
10 十、总结与展望
* * *
## **一、引言**
在日常开发和团队协作中，我们越来越多地依赖 MCP Server、AI Agent 和各类工具来提升效率。但如果只是依赖第三方托管的服务，往往会面临稳定性不可控、数据安全存疑、功能定制受限等问题。
自己部署 MCP Server 和 Agent，意味着更高的稳定性和可控性。你可以完全掌握服务的运行状态、版本迭代节奏和数据流向，不再受制于外部平台的变更或故障。当 MCP Server 运行在自己的云账户中，服务可用性由你自己保障，出了问题可以第一时间排查和修复，而不是被动等待第三方恢复。对于企业级场景来说，这种自主可控尤为重要——你的工具链不会因为第三方服务的一次宕机而中断整个工作流。
本指南以将飞书（Lark）的消息、文档、日历等能力封装为 MCP Server 为例，带你走通从 MCP Server 部署、AgentCore Gateway 配置到 Quick Suite 集成的完整链路，让你的自定义工具稳定运行在云端，并通过 AI Agent 为团队赋能。
## **二、总体架构**
### 2.1 核心组件介绍
在进入架构细节之前，先了解整个链路中用到的四个核心产品及其各自承担的角色：
产品 | 角色 | 为什么需要它  
---|---|---  
Amazon Quick Suite | MCP Client / Chat Agent | 面向终端用户的 AI 助手平台，内置 Chat Agent 能力。用户在 Quick Suite 中提问，Agent 会自动判断是否需要调用外部工具来完成任务。  
Amazon Cognito | OAuth2 认证服务 | 负责 Quick Suite 与 Gateway 之间的身份认证。通过 client_credentials 模式颁发 JWT Token，确保只有经过授权的客户端才能调用 Gateway。  
Amazon Bedrock AgentCore Gateway | MCP 协议网关 | 整个链路的核心枢纽。入站方向验证 JWT Token 合法性，出站方向用 IAM SigV4 签名将请求安全转发给后端 MCP Server。  
Amazon Bedrock AgentCore Runtime | 容器化运行环境 | 托管 MCP Server 容器。提供自动扩缩容、健康检查、日志收集等运维能力，让你专注于工具逻辑开发。  
### 2.2 架构总览
四个组件之间的协作关系如下。Quick Suite 作为 MCP Client，通过 Cognito 获取 JWT Token，经 AgentCore Gateway 路由到后端 MCP Server：
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/09/tool-mcp-server-amazon-bedrock-agentcore-quick-1new.png>) [图1]  
---  
### 2.3 请求链路说明
1\. Quick Suite Chat Agent 需要调用工具时，先用 client_credentials 向 Cognito 获取 JWT Token
2\. 携带 JWT Token 向 Gateway 发送 MCP 请求（tools/list 或 tools/call）
3\. Gateway 验证 JWT 后，用 IAM SigV4 签名将请求转发给 AgentCore Runtime 上的 MCP Server
4\. MCP Server 执行工具逻辑，返回结果，Gateway 透传回 Quick Suite
整个链路的请求均有严格的安全管控，保证了信息传递的安全性。
## **三、前置条件**
  * 亚马逊云科技 账户，具有 IAM、Cognito、Bedrock AgentCore 权限
  * Amazon Quick Suite 访问权限（需 Author Pro 订阅）
  * Python 3.10+（用于 boto3 操作 亚马逊云科技 API）
  * boto3 最新版（pip install –upgrade boto3）
  * 亚马逊云科技 CLI 已配置
  * 一个可部署到 AgentCore Runtime 的 MCP Server（Docker 容器）
## **四、第一步：创建 Cognito 认证基础设施**
Cognito 负责 Quick Suite 与 Gateway 之间的 OAuth2 认证。需要依次创建：User Pool → Domain → Resource Server → App Client。
### 4.1 创建 User Pool
    import boto3, json
    region = 'us-east-1'
    cognito = boto3.client('cognito-idp', region_name=region)
    # 创建 User Pool
    pool_resp = cognito.create_user_pool(
        PoolName='my-mcp-pool',
        Policies={
            'PasswordPolicy': {
                'MinimumLength': 8,
                'RequireUppercase': False,
                'RequireLowercase': False,
                'RequireNumbers': False,
                'RequireSymbols': False,
            }
        },
        AdminCreateUserConfig={'AllowAdminCreateUserOnly': True},
    )
    pool_id = pool_resp['UserPool']['Id']
    print(f"User Pool ID: {pool_id}")
### 4.2 创建 Cognito Domain
Domain 用于生成 Token URL。名称需全局唯一。
    domain_suffix = pool_id.split('_')[1].lower()
    domain_name = f"my-mcp-{domain_suffix}"
    cognito.create_user_pool_domain(
        UserPoolId=pool_id,
        Domain=domain_name,
    )
    # Token URL 格式:
    # https://{domain_name}.auth.{region}.amazoncognito.com/oauth2/token
Token URL 在哪里找？   
亚马逊云科技控制台 → Cognito → 选择 User Pool → App integration → Domain 部分可以看到。   
格式：https://{domain}.auth.{region}.amazoncognito.com/oauth2/token 
### 4.3 创建 Resource Server
Resource Server 定义了 OAuth scope，Gateway 会验证 Token 中是否包含此 scope。
    cognito.create_resource_server(
        UserPoolId=pool_id,
        Identifier='MyGateway',          # Resource Server 标识符
        Name='My Gateway',
        Scopes=[
            {'ScopeName': 'invoke', 'ScopeDescription': 'Invoke gateway tools'}
        ],
    )
### 4.4 创建 App Client
App Client 用于 Quick Suite 获取 Token。必须启用 client_credentials 流程。
    client_resp = cognito.create_user_pool_client(
        UserPoolId=pool_id,
        ClientName='my-mcp-client',
        GenerateSecret=True,                    # 必须生成 Secret
        AllowedOAuthFlows=['client_credentials'],  # S2S 认证模式
        AllowedOAuthScopes=['MyGateway/invoke'],  # {ResourceServer}/{Scope}
        AllowedOAuthFlowsUserPoolClient=True,
        SupportedIdentityProviders=['COGNITO'],
    )
    client_id = client_resp['UserPoolClient']['ClientId']
    client_secret = client_resp['UserPoolClient']['ClientSecret']
    # 保存配置
    config = {
        'pool_id': pool_id,
        'domain': domain_name,
        'client_id': client_id,
        'client_secret': client_secret,
        'token_url': f"https://{domain_name}.auth.{region}.amazoncognito.com/oauth2/token",
    }
    with open('cognito_config.json', 'w') as f:
        json.dump(config, f, indent=2)
### 4.5 验证 Token 获取
    curl -s -X POST \
      https://{domain_name}.auth.us-east-1.amazoncognito.com/oauth2/token \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -u "{client_id}:{client_secret}" \
      -d "grant_type=client_credentials&scope=MyGateway/invoke"
    # 应返回: {"access_token":"eyJ...","expires_in":3600,"token_type":"Bearer"}
## **五、第二步：创建 Amazon Bedrock AgentCore Gateway**
Gateway 是整个链路的核心枢纽，负责入站 JWT 认证和出站请求路由。
### 5.1 确保 IAM Role 存在
Gateway 需要一个 IAM Role，用于：(1) 被 Gateway 服务 assume；(2) 向 AgentCore Runtime 发起 SigV4 签名请求。
    import boto3, json
    iam = boto3.client('iam')
    # Trust Policy - 允许 bedrock-agentcore 服务 assume 此 role
    trust_policy = {
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Principal": {"Service": "bedrock-agentcore.amazonaws.com"},
            "Action": "sts:AssumeRole"
        }]
    }
    # 创建 Role（如果不存在）
    try:
        iam.create_role(
            RoleName='my-gateway-role',
            AssumeRolePolicyDocument=json.dumps(trust_policy),
            Description='Role for MCP Gateway',
        )
    except iam.exceptions.EntityAlreadyExistsException:
        pass
    # 添加 InvokeAgentRuntime 权限
    invoke_policy = {
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Action": [
                "bedrock-agentcore:InvokeAgentRuntime",
                "bedrock-agentcore:InvokeRuntime"
            ],
            "Resource": "arn:aws:bedrock-agentcore:us-east-1:{ACCOUNT_ID}:runtime/*"
        }]
    }
    iam.put_role_policy(
        RoleName='my-gateway-role',
        PolicyName='InvokeAgentRuntime',
        PolicyDocument=json.dumps(invoke_policy),
    )
### 5.2 创建 Gateway
    agentcore = boto3.client('bedrock-agentcore-control', region_name='us-east-1')
    discovery_url = f"https://cognito-idp.us-east-1.amazonaws.com/{pool_id}/.well-known/openid-configuration"
    gw_resp = agentcore.create_gateway(
        name='myGateway',
        description='Gateway with Cognito auth for Quick Suite',
        roleArn=f'arn:aws:iam::{ACCOUNT_ID}:role/my-gateway-role',
        protocolType='MCP',
        authorizerType='CUSTOM_JWT',
        authorizerConfiguration={
            'customJWTAuthorizer': {
                'discoveryUrl': discovery_url,
                'allowedClients': [client_id],
                'allowedScopes': ['MyGateway/invoke']
            }
        },
    )
    gateway_id = gw_resp['gatewayId']
    print(f"Gateway ID: {gateway_id}")
关键：不要设置 allowedAudience   
Cognito client_credentials 模式生成的 JWT Token 没有 aud claim（只有 client_id）。如果设置了 allowedAudience，Gateway 会因为找不到 aud 而返回 insufficient_scope 错误。 
### 5.3 等待 Gateway 就绪
    import time
    for i in range(20):
        time.sleep(5)
        gw = agentcore.get_gateway(gatewayIdentifier=gateway_id)
        status = gw['status']
        print(f"[{i*5}s] Status: {status}")
        if status == 'READY':
            gateway_url = gw['gatewayUrl']
            print(f"Gateway URL: {gateway_url}")
            break
## **六、第三步：部署 MCP Server 到 Amazon Bedrock AgentCore Runtime**
MCP Server 需要部署为 Docker 容器，运行在 AgentCore Runtime 上。
### 6.1 MCP Server 要求
要求 | 说明  
---|---  
传输协议 | Streamable HTTP（stateless_http=True）  
监听地址 | 0.0.0.0:8000  
MCP 端点 | /mcp  
健康检查 | GET /health 返回 200  
Docker 架构 | 必须是 arm64（AgentCore Runtime 只支持 arm64）  
完整的飞书集成代码请参阅 <https://github.com/nwcd-samples/lark-to-mcp>。
### 6.2 构建并推送 Docker 镜像
    # 编译（如果是 TypeScript）
    npm run build
    # 登录 ECR
    aws ecr get-login-password --region us-east-1 | \
      docker login --username AWS --password-stdin \
      {ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com
    docker build --platform linux/arm64 -t my-mcp-server:latest .
    docker tag my-mcp-server:latest \
      {ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/my-mcp-server:latest
    docker push \
      {ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/my-mcp-server:latest
### 6.3 部署到 AgentCore Runtime
通过 boto3 API：
    client = boto3.client('bedrock-agentcore-control', region_name='us-east-1')
    resp = client.create_agent_runtime(
        agentRuntimeName='myMcpServer',
        description='My MCP Server',
        roleArn='arn:aws:iam::{ACCOUNT_ID}:role/my-runtime-role',
        networkConfiguration={'networkMode': 'PUBLIC'},
        protocolConfiguration={'serverProtocol': 'MCP'},
        agentRuntimeArtifact={
            'containerConfiguration': {
                'containerUri': '{ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/my-mcp-server:latest'
            }
        },
        environmentVariables={
            'MCP_TRANSPORT': 'http',
            'PORT': '8000',
        },
    )
    runtime_id = resp['agentRuntimeId']
## **七、第四步：将 MCP Server 注册为 Gateway Target**
Gateway Target 定义了 Gateway 如何连接到后端 MCP Server。对于 AgentCore Runtime 上的 MCP Server，使用 mcpServer 类型 + IAM SigV4 出站认证。
### 7.1 构造 Runtime Endpoint URL
AgentCore Runtime 的 MCP Server endpoint URL 格式：
    https://bedrock-agentcore.{region}.amazonaws.com/runtimes/{URL_ENCODED_RUNTIME_ARN}/invocations
其中 Runtime ARN 需要 URL 编码（: → %3A，/ → %2F）：
    runtime_arn = f'arn:aws:bedrock-agentcore:us-east-1:{ACCOUNT_ID}:runtime/{runtime_id}'
    encoded_arn = runtime_arn.replace(':', '%3A').replace('/', '%2F')
    endpoint = f'https://bedrock-agentcore.us-east-1.amazonaws.com/runtimes/{encoded_arn}/invocations'
### 7.2 创建 Gateway Target
    target_resp = agentcore.create_gateway_target(
        gatewayIdentifier=gateway_id,
        name='myMcpServerTarget',
        description='My MCP Server - tool descriptions here',
        targetConfiguration={
            'mcp': {
                'mcpServer': {
                    'endpoint': endpoint,
                }
            }
        },
        # 出站认证：IAM SigV4，service 为 bedrock-agentcore
        credentialProviderConfigurations=[{
            'credentialProviderType': 'GATEWAY_IAM_ROLE',
            'credentialProvider': {
                'iamCredentialProvider': {
                    'service': 'bedrock-agentcore',
                    'region': 'us-east-1',
                }
            }
        }],
    )
    target_id = target_resp['targetId']
    print(f"Target ID: {target_id}, Status: {target_resp['status']}")
### 7.3 等待 Target 就绪
    for i in range(20):
        time.sleep(5)
        t = agentcore.get_gateway_target(gatewayIdentifier=gateway_id, targetId=target_id)
        status = t['status']
        print(f"[{i*5}s] Status: {status}")
        if status == 'READY':
            print("Target 就绪！Gateway 已自动发现 MCP Server 的所有工具。")
            break
        if 'FAILED' in status:
            print(f"失败: {t.get('statusReasons', [])}")
            break
Target 创建成功后，Gateway 会自动调用 MCP Server 的 tools/list 发现所有工具。工具名称会自动加上 Target 名称前缀，格式为 targetName___toolName。 
## **八、第五步：端到端验证**
在配置 Quick Suite 之前，先用 curl 或 Python 验证整个链路是否通畅。
### 8.1 获取 Token 并调用 tools/list
    # ① 获取 Token
    TOKEN=$(curl -s -X POST \
      https://{domain}.auth.us-east-1.amazoncognito.com/oauth2/token \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -u "{client_id}:{client_secret}" \
      -d "grant_type=client_credentials&scope=MyGateway/invoke" \
      | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
    # ② 调用 Gateway tools/list
    curl -X POST \
      https://{gateway_id}.gateway.bedrock-agentcore.us-east-1.amazonaws.com/mcp \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -H "Accept: application/json, text/event-stream" \
      -d '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}'
### 8.2 Python 验证脚本
    import json, base64, urllib.request, urllib.parse
    # 读取配置
    with open('cognito_config.json') as f:
        cfg = json.load(f)
    # 获取 Token
    auth = base64.b64encode(
        f"{cfg['client_id']}:{cfg['client_secret']}".encode()
    ).decode()
    data = urllib.parse.urlencode({
        'grant_type': 'client_credentials',
        'scope': 'MyGateway/invoke'
    }).encode()
    req = urllib.request.Request(cfg['token_url'], data=data, headers={
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': f'Basic {auth}',
    })
    token = json.loads(urllib.request.urlopen(req).read())['access_token']
    # 调用 Gateway
    mcp_req = urllib.request.Request(cfg['gateway_url'],
        data=json.dumps({
            "jsonrpc": "2.0",
            "method": "tools/list",
            "params": {},
            "id": 1
        }).encode(),
        headers={
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/event-stream',
            'Authorization': f'Bearer {token}',
        }
    )
    result = json.loads(urllib.request.urlopen(mcp_req).read())
    tools = result['result']['tools']
    print(f"发现 {len(tools)} 个工具:")
    for t in tools:
        print(f"  - {t['name']}")
如果能看到工具列表，说明 Cognito → Gateway → Runtime → MCP Server 整个链路已通。可以进入 Quick Suite 配置了。 
## **九、第六步：在 Quick Suite 中配置 MCP Integration**
### 9.1 创建 MCP Integration
5\. 登录 Amazon Quick Suite 控制台
6\. 导航到 Integrations → Actions → Model Context Protocol
7\. 点击 “+” 创建新的 Integration
8\. 填写以下信息：
字段 | 值 | 说明  
---|---|---  
Name | 自定义名称 | 如 MyMcpIntegration  
Description | 工具用途描述 | Chat Agent 根据此描述决定何时调用  
MCP Server Endpoint | Gateway URL | 格式 https://{id}.gateway.bedrock-agentcore.{region}.amazonaws.com/mcp  
Authentication Type | Service authentication | 选择 S2S 认证  
Client ID | Cognito App Client ID | 从 cognito获取  
Client Secret | Cognito App Client Secret | 从 cognito获取  
Token URL | Cognito Token Endpoint | 格式 https://{domain}.auth.{region}.amazoncognito.com/oauth2/token  
Scope | MyGateway/invoke | {ResourceServer}/{ScopeName}  
### 9.2 保存并验证
9\. 点击 Save 保存
10\. 等待 1-2 分钟，状态变为 Available
11\. 在 Available Actions 中确认看到你的工具
12\. 将工具添加到 Chat Agent 的可用工具列表中
13\. 测试对话（下面是与quick suite集成后的简单demo）
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/11/tool-mcp-server-amazon-bedrock-agentcore-quick-2.jpg>) [图2]  
---  
刚才发生的事情值得回味：你用自然语言说了一句话，Agent 自动完成了认证、路由、工具调用，把飞书里的真实数据拉回到对话中。整条链路运行在你自己的云账户里，数据不经过任何第三方。这就是”自己的工具自己控”的意思——工具逻辑你写，数据流向你控，出了问题你修。
## **十、总结与展望**
技术上并不复杂，真正有价值的是这套模式：它提供了一个可复制的方式，把任何内部工具变成 AI Agent 可调用的能力，全程不离开你的安全边界。
以飞书为起点，接下来可以做的事情很具体：
  * 用同样的模式接入更多内部系统——Jira、Jenkins、数据库查询，每个都是一个新的 MCP Server
  * 通过不同的 Cognito App Client 和 OAuth scope 为不同团队划分权限边界
  * 用 CloudWatch 监控 Gateway 这个统一入口，一个点覆盖所有工具的健康状态
如果你在集成过程中遇到问题，欢迎在评论区交流。
**下一步行动：**
**相关产品：**
  * [Amazon Cognito](<https://aws.amazon.com/cn/cognito/?p=bl_pr_cognito_l=1>) — 安全注册和登录
  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=2>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/?p=bl_pr_bedrock-agentcore_l=3>) — 加快代理投入生产的速度
  * [Amazon IAM](<https://aws.amazon.com/cn/iam/?p=bl_pr_iam_l=4>) — 身份管理和访问权限
  * [Amazon CloudWatch](<https://aws.amazon.com/cn/cloudwatch/?p=bl_pr_cloudwatch_l=5>) — 可观测性工具
**相关文章：**
  * [基于 Amazon Bedrock AgentCore Runtime 部署 Apache Doris MCP Server为 Quick Suite 等 AI 客户端提供原生数据分析能力](<https://aws.amazon.com/cn/blogs/china/runtime-deploy-apache-doris-mcp-server-quick-suite-ai-analytics/?p=bl_ar_l=1>)
  * [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第四篇](<https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-4/?p=bl_ar_l=2>)
  * [快时尚电商行业智能体设计思路与应用实践（七）Amazon Bedrock AgentCore Runtime 深度解析和场景分析](<https://aws.amazon.com/cn/blogs/china/amazon-bedrock-agentcore-runtime-deep-dive-and-scenario-analysis/?p=bl_ar_l=3>)
  * [让 AI 工作空间更智能：Amazon Quick Suite 集成博查搜索实践](<https://aws.amazon.com/cn/blogs/china/let-ai-workspaces-smarter-amazon-quick-suite-integrates-boocha-search-practices/?p=bl_ar_l=4>)
  * [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第六篇](<https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-6/?p=bl_ar_l=5>)
*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。
## 本篇作者
### 蔡如海
西云数据解决方案架构师，10+年开发和架构经验，曾就职于知名外企，在媒体、金融等业务领域有丰富的工作经验，擅长云计算、机器学习等技术，并且有丰富的项目管理经验。
* * *
## AWS 架构师中心：云端创新的引领者
探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---