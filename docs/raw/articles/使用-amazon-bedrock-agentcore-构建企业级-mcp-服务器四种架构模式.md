---
title: "使用 Amazon Bedrock AgentCore 构建企业级 MCP 服务器：四种架构模式的实践指南"
created: 2026-07-29
updated: 2026-07-29
type: raw-article
tags: [aws, bedrock, agentcore, mcp, architecture, enterprise]
source_url: https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-build-enterprise-mcp
source: rss
feed_name: AWS China Blog
source_published: 2026-07-29
sha256: 54f705adbdf7c6ea491a6bb09853a55c33c5158e3684c82182647701839e6671
---

# 使用 Amazon Bedrock AgentCore 构建企业级 MCP 服务器：四种架构模式的实践指南

摘要：随着人工智能越来越深入地集成到企业工作流程中，企业对标准化、安全且可扩展的 AI 工具平台的需求日益增长。由 Anthropic 开发的模型上下文协议 (MCP) 为连接 AI 助手与外部工具和数据源提供了通用标准。当与 Amazon Bedrock 的 AgentCore 功能相结合时，组织可以构建兼具高性能与生产可用性的 AI 生态系统。

**目录**

01 一、引言

02 二、什么是模型上下文协议 (MCP)？

03 三、企业 AI 集成的挑战

04 四、参考实现架构

05 五、架构的创新点与实用价值

06 六、四种架构模式详解

07 七、核心技术组件

08 八、部署和配置

09 九、性能优化

10 十、监控和运维

11 十一、安全最佳实践

12 十二、扩展性设计

13 十三、架构选择指南

14 十四、总结

15 十五、相关资源

* * *

## **一、引言**

随着人工智能越来越深入地集成到企业工作流程中，企业对标准化、安全且可扩展的 AI 工具平台的需求日益增长。由 Anthropic 开发的模型上下文协议 (MCP) 为连接 AI 助手与外部工具和数据源提供了通用标准。当与 [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/>) 的 AgentCore 功能相结合时，组织可以构建兼具高性能与生产可用性的 AI 生态系统。

在这篇文章中，我们将探讨如何使用 [Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/>) 和 MCP 实现生产级 AI 工具平台。我们在参与多个使用 Agent 的项目中，总结出 MCP 接入的不同方式，并开发了一个参考实现项目来展示这些方案。这个项目的核心价值在于：企业可以从最简单的接入方式开始快速验证，然后根据实际需求逐步升级到更安全的方式，而无需重新开发 MCP 工具本身。我们将涵盖架构模式、安全考虑和最佳实践，您可以将这些应用到自己的 AI 项目中。

## **二、什么是模型上下文协议 (MCP)？**

模型上下文协议是一个开放标准，使 AI 助手能够安全地连接外部工具、数据库和服务。可以将其视为一个通用适配器，允许 AI 模型与您现有的系统交互，而无需为每个工具定制集成。

MCP 的主要优势包括：

  * 标准化：一个协议适用于多个 AI 助手
  * 安全性：内置身份验证和授权机制
  * 可扩展性：工具可以动态发现和调用
  * 灵活性：支持各种数据类型和交互模式



## **三、企业 AI 集成的挑战**

在企业 AI 应用开发中，我们经常面临以下挑战：

  * 标准化缺失：不同 AI 助手需要不同的工具接口，增加了开发和维护成本
  * 安全性要求：企业环境需要多层认证和权限控制
  * 扩展性需求：随着业务发展，需要支持更多工具和更高并发
  * 运维复杂性：传统部署方式需要管理服务器、负载均衡等基础设施
  * 集成复杂性：每个新的 AI 助手都需要重新实现工具连接



## **四、参考实现架构**

我们基于 AWS 云原生服务构建了一个 MCP 服务器参考实现项目，提供四种不同的访问模式。这个项目不仅展示了架构概念，更重要的是提供了可直接部署和使用的完整解决方案，企业可以根据当前阶段选择合适的接入方式，并在需要时平滑升级。

### 整体架构图
    
    
    ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
    │   MCP Client    │       │   MCP Client    │       │   MCP Client    │
    │   (Claude/IDE)  │       │   (Kiro/App)    │       │   (Custom/API)  │
    └────────┬────────┘       └────────┬────────┘       └────────┬────────┘
             │                         │                         │
             ▼                         ▼                         ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │                       接入层 (Access Layer)                          │
    ├──────────────┬──────────────┬───────────────┬───────────────────────┤
    │  M1: Lambda  │  M2: Auth    │  M3: OAuth2   │  M4: API Key          │
    │      Direct  │ + AgentCore  │    + AgentCore│    + Gateway          │
    └──────┬───────┴──────┬───────┴───────┬───────┴──────────────┬────────┘
           │              │               │                      │
           │              │               │              ┌───────▼───────┐
           │              │               │              │  Lambda Proxy │
           │              │               │              └───────┬───────┘
           │              ▼               ▼                      ▼
           │      ┌──────────────────────────────────────────────┐
           │      │             AgentCore Gateway                │
           │      │       (MCP Protocol Adapter / Router)        │
           │      └──────────────────────┬───────────────────────┘
           │                             │
           ▼                             ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │                     处理层 (Processing Layer)                        │
    │                                                                     │
    │  ┌───────────────────────────────────────────────────────────────┐  │
    │  │                     Lambda Tool Handler                       │  │
    │  │             (Business Logic / Tool Execution)                 │  │
    │  └───────────────────────────────────────────────────────────────┘  │
    └─────────────────────────────────────────────────────────────────────┘
    

路径说明

  * M1 (极简): Client → Lambda Tool (绕过 MCP 统一网关，用于测试)
  * M2 (内部): Client → AgentCore (由 AgentCore 负责用户 Session 校验)
  * M3 (标准): Client → AgentCore (执行 OAuth2 握手后进行 MCP 通信)
  * M4 (外部): Client → [Amazon API Gateway](<https://aws.amazon.com/cn/api-gateway/>) → Lambda Proxy → AgentCore



## **五、架构的创新点与实用价值**

这个参考实现项目相比现有的 MCP 实现方案，具有以下核心创新和实用价值：

### 5.1 从单点连接到网关模式的演进

目前大多数关于 MCP 的教程和实现还停留在”如何用 Claude Desktop 连一个本地 Python 脚本”的阶段。本项目通过引入 AgentCore Gateway，实现了从单点连接到中心化网关的架构演进，这实际上是在探索 MCP-as-a-Service 的概念。

这种中心化管理协议转换的思想，正是目前大型企业（如企业内部 Agent 平台）刚开始研究的方向。通过网关层，我们可以：

  * 统一管理多个 MCP 服务端
  * 实现协议版本的透明升级
  * 提供统一的监控和日志
  * 支持动态的工具发现和路由



### 5.2 多身份验证路径的完整实现

项目区分了 API Key、OAuth2 和直接调用 三种认证方式，这是目前 MCP 生态中最稀缺的内容。现有的 MCP Server 实现大多缺乏完善的鉴权机制，而本项目提出的 Access Layer 解决了”如何在公网安全地暴露 MCP 服务”这一关键痛点。

具体来说：

  * API Key 方式：适合简单场景，易于集成
  * OAuth2 方式：符合企业级安全标准，支持细粒度权限控制
  * 直接调用：用于内部系统，最小化延迟



这种分层的认证设计让不同安全等级的应用都能找到合适的接入方式。

### 5.3 云原生无状态化的实践

项目利用 [AWS Lambda](<https://aws.amazon.com/cn/lambda/>) 处理 Tool 逻辑，而不是运行传统的长连接 Docker 容器。这比传统方式更具扩展性和成本效益。

MCP 协议本身是基于长连接的有状态协议，但通过精心的架构设计，我们展示了如何将这种”有状态”的感觉适配到无状态的 Serverless 环境中：

  * 无状态处理：每个 Lambda 调用都是独立的，无需维护连接状态
  * 自动扩缩容：根据负载自动调整计算资源
  * 按需付费：只为实际使用的计算时间付费
  * 零运维成本：无需管理服务器或容器编排



这种设计模式对于构建大规模、高可用的 AI 工具平台至关重要。

### 5.4 渐进式迁移的实用价值

这个项目的真正实用价值在于支持企业的渐进式迁移路径：

第一阶段：快速验证 – 使用 Method 1 （直接 Lambda 调用）快速验证 MCP 工具的可行性，最小化创新成本。

第二阶段：内部部署 – 当应用扩展到企业内部多个团队使用时，升级到 Method 2 （用户认证 + AgentCore），实现用户级別的认证。

第三阶段：企业级安全 – 当应用涉及敏感数据或严格的安全要求时，升级到 Method 3 （OAuth2 + AgentCore），实现企业级安全标准。

第四阶段：公网暴露 – 当需要向外部客户提供服务时，升级到 Method 4 （Amazon API Gateway + API Key），提供简单且安全的公网接入。

关键优势：整个迁移过程中，MCP 工具本身不需要修改，只需更改客户端配置。这样可以最大化地降低维护成本。

## **六、四种架构模式详解**

### 6.1 Method 1：直接 Lambda 调用（演示和测试专用）

定位：这种模式仅用于快速演示和初步测试，帮助开发者最快地体验 MCP 工具的功能。它绕过所有中间层，客户端直接通过 AWS SDK 调用 Lambda 函数。客户端需要具备 AWS 凭证，通过 IAM 角色获得调用权限。Lambda 函数接收标准的 AgentCore 格式参数，执行工具逻辑后直接返回结果。

数据流：MCP Client → AWS SDK → Lambda Function → Tool Logic → Response

**6.1.1 适用场景**

  * 开发者快速验证 MCP 工具的可行性
  * 本地开发和调试
  * 概念验证（PoC）阶段
  * 不适合任何生产环境使用



**6.1.2 技术实现**
    
    
    import boto3
    import json
    
    lambda_client = boto3.client('lambda')
    response = lambda_client.invoke(
        FunctionName='McpToolHandler',
        Payload=json.dumps({
            'actionGroup': 'mcp-tools',
            'function': 'search_content',
            'parameters': [
                {'name': 'query', 'value': 'AI技术'},
                {'name': 'limit', 'value': '5'}
            ]
        })
    )

**6.1.3 优势**

  * 最快的上手体验（无需额外配置）
  * 最低延迟（无网关开销）
  * 最小的代码复杂度
  * 成本最低（无额外服务费用）



**6.1.4 限制**

  * 需要自定义客户端实现
  * 强依赖 AWS SDK（不支持标准 MCP 客户端）
  * 无法扩展到多用户场景
  * 无认证机制（仅依赖 IAM）
  * 不支持公网暴露



升级路径：验证完成后，应立即升级到 Method 2、3 或 4，以支持实际的业务需求。

### 6.2 Method 2：用户认证 + AgentCore Gateway

实现逻辑：这种模式利用 Amazon Bedrock AgentCore 的原生 MCP 协议支持。客户端首先通过 [Amazon Cognito](<https://aws.amazon.com/cn/cognito/>) 用户池进行用户名密码认证，获取 JWT 访问令牌。然后使用该令牌直接调用 AgentCore Gateway 的 MCP 接口。AgentCore 会验证令牌并根据 MCP 协议解析请求，调用相应的 Lambda 工具函数。这种方式提供了标准的 MCP 体验，同时支持用户级别的认证。

数据流：MCP Client → Amazon Cognito Auth → AgentCore Gateway → Lambda Tools → Response

适用场景：需要用户身份验证的企业应用

**6.2.1 技术实现**
    
    
    class McpAgentCoreClient:
        def __init__(self):
            self.cognito_client = boto3.client('cognito-idp')
            self.bedrock_runtime = boto3.client('bedrock-agent-runtime')
        
        def authenticate(self, username, password):
            response = self.cognito_client.admin_initiate_auth(...)
            self.access_token = response['AuthenticationResult']['AccessToken']
        
        def call_tool(self, name, arguments):
            return self.bedrock_runtime.invoke_agent(...)

**6.2.2 优势**

  * 完全兼容 MCP 协议
  * 支持用户认证
  * 无代理层开销



**6.2.3 劣势**

  * 需要管理用户状态
  * 客户端实现复杂度中等



### 6.3 Method 3：OAuth2 + AgentCore Gateway

实现逻辑：这种模式代表了最高级别的企业安全实现。客户端需要首先通过 Amazon Cognito OAuth2 客户端凭证流获取访问令牌。这个过程涉及 client_id 和 client_secret 的验证，符合企业级安全标准。获取令牌后，客户端直接使用 Bearer Token 调用 AgentCore Gateway 的 MCP 接口。AgentCore 验证令牌的有效性和权限范围，然后执行相应的工具调用。这种方式提供了最高的安全性和最完整的 MCP 协议兼容性。

数据流：MCP Client → OAuth2 Token → AgentCore Gateway → Lambda Tools → Response

适用场景：企业级安全要求、大规模部署

**6.3.1 技术实现**
    
    
    # 获取 OAuth2 Token
    curl -X POST https://cognito-domain/oauth2/token \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -d "grant_type=client_credentials&client_id=xxx&client_secret=xxx"
    
    # 使用 Token 调用 MCP
    curl -X POST https://gateway-url/mcp \
      -H "Authorization: Bearer $TOKEN" \
      -d '{"jsonrpc":"2.0","method":"tools/list"}'

**6.3.2 优势**

  * 最高安全性（OAuth2 企业级认证）
  * 100% MCP 协议兼容
  * 支持复杂认证场景



**6.3.3 劣势**

  * OAuth2 配置复杂
  * 需要处理 Token 刷新



### 6.4 Method 4：Amazon API Gateway + API Key

实现逻辑：这种模式通过 Amazon API Gateway 提供标准的 HTTP 接口，使用 API Key 进行简单认证。当客户端发送请求时，API Gateway 首先验证 API Key。验证通过后，请求被转发到 Lambda 代理函数。代理函数自动获取 Amazon Cognito OAuth2 令牌，然后将 MCP 请求代理到 AgentCore Gateway。在我们的实践过程中，看到客户依照使用习惯最常见的选择就是这种方式，它同时兼顾了安全性和 MCP 协议兼容性，对客户端隐藏了复杂的 OAuth2 认证流程，同时提供了标准的 HTTP 接口。

数据流：MCP Client → Amazon API Gateway → Lambda Proxy → OAuth2 Token → AgentCore Gateway → Lambda Tools → Response

适用场景：生产环境、多客户端支持

**6.4.1 技术实现**
    
    
    def lambda_handler(event, context):
        # 1. 验证 API Key
        api_key = extract_api_key(event)
        if not verify_api_key(api_key):
            return create_error_response(401, "Invalid API Key")
        
        # 2. 获取 OAuth2 Token
        access_token = get_cognito_token(client_id, client_secret, token_url)
        
        # 3. 代理到 AgentCore Gateway
        response = proxy_request(gateway_url, access_token, method, body)
        return response

**6.4.2 客户端配置示例**
    
    
    {
      "mcpServers": {
        "agentcore-mcp-server": {
          "command": "npx",
          "args": [
            "mcp-remote",
            "https://api-gateway-url/prod/mcp",
            "--header",
            "x-api-key: YOUR_API_KEY"
          ]
        }
      }
    }

**6.4.3 优势**

  * 简单性和功能性的最佳平衡
  * 支持标准 HTTP 客户端
  * 自动处理 OAuth2 认证
  * 完整的监控和日志



**6.4.4 Amazon API Gateway 封装的价值**

  * 认证透明化：客户端只需提供 API Key，无需关心 OAuth2 的复杂握手过程
  * 协议适配：将 MCP 的长连接协议适配为标准 HTTP REST 接口，降低客户端实现难度
  * 安全隔离：Lambda Proxy 代理层处理敏感的 client_secret，客户端无需接触
  * 流量管理：Amazon API Gateway 提供限流、监控、日志等企业级功能
  * 多客户端支持：标准 HTTP 接口支持任何编程语言和平台的客户端



**6.4.5 劣势**

  * Amazon API Gateway 调用费用
  * 多层代理延迟



## **七、核心技术组件**

### 7.1 Amazon Bedrock AgentCore

作为解决方案的核心，AgentCore 提供：

  * 原生 MCP 协议支持
  * 声明式工具 Schema 配置
  * 与 Amazon Cognito 的无缝集成
  * 流式传输支持



### 7.2 Amazon Cognito

提供企业级身份认证：

  * 用户池管理
  * OAuth2 客户端凭证流
  * JWT Token 验证
  * 多种认证方式支持



### 7.3 AWS Lambda

实现工具逻辑：

  * 无服务器架构
  * 自动扩缩容
  * 多种事件格式支持
  * 与其他 AWS 服务集成



### 7.4 Amazon API Gateway

提供 HTTP 接口：

  * RESTful API 暴露
  * API Key 管理
  * 请求限流和监控
  * CORS 配置



## **八、部署和配置**

### 8.1 一键部署
    
    
    git clone <repository-url>
    cd mcp-agentcore-server
    ./deploy_all.sh

### 8.2 分步部署
    
    
    # 步骤1：部署基础设施
    ./step1_deploy.sh
    
    # 步骤2：获取配置参数
    ./step2_get_config.sh
    
    # 步骤3：创建测试用户
    ./step3_create_user.sh
    
    # 步骤4：测试所有方式
    ./step4_test_all.sh

### 8.3 客户端配置

部署完成后会自动生成四种配置文件，对应四种不同的架构模式：

配置文件 | 架构模式 | 客户端类型 | 特点  
---|---|---|---  
mcp_config_method1_direct_lambda.json | 直接Lambda调用 | 自定义Python客户端 | 演示和测试专用  
mcp_config_method2_agentcore_gateway_env.json | 用户认证+AgentCore | 自定义Python客户端 | 用户身份验证  
mcp_config_method3_agentcore_oauth2.json | OAuth2+AgentCore | 标准MCP客户端 | 企业级安全  
mcp_config_method4_api_gateway_key.json | Amazon API Gateway+API Key | 标准MCP客户端 | 生产环境推荐  
  
**8.3.1 标准MCP客户端支持**

  * Kiro：推荐使用 Method 4 配置
  * Claude Desktop：可使用 Method 3 或 Method 4 配置
  * Cline (VS Code)：可使用 Method 3 或 Method 4 配置
  * 自定义客户端：可根据需求选择任意模式



## **九、性能优化**

### 9.1 当前实现的优化

  * Lambda 配置： 
    * 内存配置：256MB（lib/mcp-tool-handler.ts）
    * 超时设置：60秒（lib/mcp-tool-handler.ts）
    * Python 3.11 运行时（lib/mcp-tool-handler.ts）
  * 认证优化： 
    * OAuth2 Token 缓存机制（lambda/proxy_handler.py中的_token_cache）
    * 令牌过期前60秒自动刷新（lambda/proxy_handler.py）
  * 网络优化： 
    * 使用 urllib3 PoolManager 进行 HTTP 连接管理（lambda/proxy_handler.py）
    * 设置合理的超时时间（890秒，lambda/proxy_handler.py）



### 9.2 可考虑的进一步优化

  * Lambda 架构优化： 
    * 考虑使用 AWS Graviton2 处理器（需要修改 CDK 配置）
    * 启用预置并发（适用于高并发场景）
  * 缓存策略： 
    * Amazon API Gateway 缓存配置
    * 工具响应结果缓存
  * 监控和调优： 
    * 根据 [Amazon CloudWatch](<https://aws.amazon.com/cn/cloudwatch/>) 指标调整内存配置
    * 减少 Lambda 冷启动影响： 
      * 减少依赖包大小
      * 优化初始化代码
      * 考虑使用预置并发保持函数热启动



## **十、监控和运维**

### 10.1 当前实现的监控功能

  * 日志管理： 
    * Amazon CloudWatch 日志组配置（lib/mcp-tool-handler.ts和lib/api-gateway-proxy.ts）
    * 日志保留期：7天（logs.RetentionDays.ONE_WEEK）
    * 结构化日志输出（lambda/mcp_tool_handler.py中的logging）
    * 错误堆栈跟踪（exc_info=True）
  * Amazon API Gateway 监控： 
    * 请求限流配置（速率限制: 100/秒，突发: 200/秒）
    * 使用计划和 API Key 管理
    * CORS 配置和安全头部
  * Lambda 环境变量： 
    * LOG_LEVEL可配置日志级别
    * 详细的请求和响应日志



### 10.2 可考虑的进一步监控优化

  * Amazon CloudWatch 告警： 
    * Lambda 错误率告警
    * Amazon API Gateway 延迟告警
    * 认证失败率监控
  * 自定义指标： 
    * 工具调用成功率
    * 平均响应时间
    * 业务级别指标
  * 日志聚合和分析： 
    * 集中化日志管理
    * 日志查询和分析工具
    * 安全审计日志



## **十一、安全最佳实践**

### 11.1 多层安全防护

  1. 传输层安全：HTTPS/TLS 加密
  2. 认证层安全：多种认证方式支持
  3. 授权层安全：IAM 细粒度权限控制
  4. 应用层安全：输入验证和输出过滤



### 11.2 合规性考虑

  * 数据加密存储和传输
  * 访问日志记录
  * 定期安全审计
  * 符合企业安全策略



## **十二、扩展性设计**

### 12.1 添加新工具

  * 定义工具 Schema：


    
    
    {
      name: 'new_tool',
      description: '新工具描述',
      inputSchema: {
        type: 'object',
        properties: {
          param1: { type: 'string' },
          param2: { type: 'integer' }
        },
        required: ['param1']
      }
    }

  * 实现工具逻辑：


    
    
    def handle_new_tool(params):
        param1 = params.get('param1')
        param2 = params.get('param2', 0)
        
        # 工具逻辑实现
        result = process_tool_logic(param1, param2)
        
        return {
            'result': result,
            'status': 'success'
        }

## **十三、架构选择指南**

根据不同的使用目的和技术要求，选择适合的架构模式。

**开发和测试**

  * Method 1：快速体验和验证（仅限演示和测试）
  * Method 2：测试用户认证流程



**生产环境部署**

  * Method 3：需要最高安全性和完整 MCP 协议支持
  * Method 4：需要支持多种 MCP 客户端，配置简单



## **十四、总结**

基于 Amazon Bedrock AgentCore 的 MCP 服务器参考实现项目展示了如何构建一个标准化、安全、可扩展的 AI 工具集成平台。通过四种不同的架构模式，可以满足从开发测试到企业生产的各种需求。

该项目的核心价值包括：

  * 标准化：完全兼容 MCP 协议
  * 安全性：多层认证和权限控制
  * 可扩展性：云原生架构支持弹性扩展
  * 渐进性：支持从简单方式平滑升级到企业级安全，工具本身无需修改
  * 易维护：基础设施即代码，一键部署



更重要的是，这个项目提供了一个实用的参考框架，企业可以：

  1. 快速验证 MCP 工具的可行性（Method 1）
  2. 根据业务发展逐步升级接入方式（Method 2 → 3 → 4）
  3. 在整个过程中复用同一套 MCP 工具实现
  4. 最小化维护成本和技术债



随着 AI 技术的不断发展，MCP 协议将成为企业 AI 应用的重要基础设施。我们建议企业利用这个参考实现项目快速启动自己的 AI 工具生态系统，并根据实际需求选择合适的架构模式进行部署。

**下一步行动：**

**相关产品：**

  * [Amazon API Gateway](<https://aws.amazon.com/cn/api-gateway/?p=bl_pr_api-gateway_l=1>) — 完全托管的 RESTful API 服务
  * [AWS Lambda](<https://aws.amazon.com/cn/lambda/?p=bl_pr_lambda_l=2>) — 无需服务器即可运行代码
  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=3>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon Cognito](<https://aws.amazon.com/cn/cognito/?p=bl_pr_cognito_l=4>) — 安全注册和登录
  * [Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/?p=bl_pr_bedrock-agentcore_l=5>) — 加快代理投入生产的速度



**相关文章：**

  * [试用 Amazon Bedrock 中的新控制台体验，该体验针对兼容 Anthropic 和 OpenAI 的 API 进行了优化](<https://aws.amazon.com/cn/blogs/china/try-the-new-console-experience-in-amazon-bedrock-optimized-for-anthropic-and-openai-compatible-apis/?p=bl_ar_l=1>)
  * [用 AI Agent 自动化日常办公工作流 — 在 AWS 上构建 Outlook 邮件助手的端到端实践](<https://aws.amazon.com/cn/blogs/china/ai-agent-automation-workflow-aws-build-outlook-assistant/?p=bl_ar_l=2>)
  * [Amazon Bedrock 中推出 Anthropic Claude Opus 4.7 模型](<https://aws.amazon.com/cn/blogs/china/introducing-anthropics-claude-opus-4-7-model-in-amazon-bedrock/?p=bl_ar_l=3>)
  * [基于 Amazon Bedrock AgentCore Runtime 部署 Apache Doris MCP Server为 Quick Suite 等 AI 客户端提供原生数据分析能力](<https://aws.amazon.com/cn/blogs/china/runtime-deploy-apache-doris-mcp-server-quick-suite-ai-analytics/?p=bl_ar_l=4>)
  * [Anthropic Claude Fable 5 on AWS：内置保护措施的 Mythos 级功能现已推出](<https://aws.amazon.com/cn/blogs/china/anthropic-claude-fable-5-on-aws-mythos-class-capabilities-with-built-in-safeguards-now-available/?p=bl_ar_l=5>)



## **十五、相关资源**

  * [项目源码](<https://github.com/valyli/mcp-agentcore-server>)
  * [Amazon Bedrock AgentCore 文档](<https://aws.amazon.com/bedrock/agentcore/>)
  * [AWS CDK 开发指南](<https://docs.aws.amazon.com/cdk/>)



本文介绍的参考实现项目展示了 MCP 和 AgentCore 集成的多种方式，可作为实际项目开发的参考。如需技术支持或定制化服务，请联系 AWS 解决方案架构师团队。

[立即咨询 →](<https://aws.amazon.com/cn/contact-us/idp-ai/>)[ 从 AI 规划到落地实施，我们的专家团队为你全程护航。](<https://aws.amazon.com/cn/contact-us/idp-ai/>)

*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 李佳

亚马逊云科技行业解决方案架构师，致力于游戏产业的技术创新与业务成长。拥有 20 年全栈游戏研发经验，就职与联众、人人网、Hungry Studio 等公司，担任技术总监、游戏制作人、研发中心总监。对产业逻辑与技术深度结合有丰富的成功经验。

### 祝小伟

亚马逊云科技解决方案架构师，在移动应用开发领域已有近 10 年的经验，尤其对 Android 及跨平台应用开发有着独到的见解和研究，同时在 GenAI 移动应用方面，持续探索更高效、更可靠的解决方案。

### 陈海云

Amazon Web Services 解决方案架构师，十年前端开发经验，热衷于前端技术在云上的研究学习和推广工作。

### 唐杰

亚马逊云科技应用科学家，长期专注于人工智能与机器学习领域，曾就职于阿里巴巴，360等公司，负责搜索与智能对话系统。

### 于泽沛

亚马逊云科技解决方案架构师，负责游戏行业客户的云计算解决方案咨询与设计，在 AI/ML、DevOps、游戏行业等领域拥有丰富经验。

### 万曦

亚马逊云科技解决方案架构师，负责基于亚马逊云科技的云计算方案的咨询和架构设计。坚实的AWS Builder文化拥抱者。拥有超过12年的游戏研发经验，参与过数个游戏项目的管理和开发，对于游戏行业有深度理解和见解。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
