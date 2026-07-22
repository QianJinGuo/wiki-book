---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/based-on-strands-agents-build-cost-analytics-optimize-ai-assistant/
ingested: 2026-06-01
sha256: 70061409c093a01f
---



# 基于 Strands Agents 构建亚马逊云科技云成本分析与优化 AI 助手

## [亚马逊AWS官方博客](https://aws.amazon.com/cn/blogs/china/)

摘要：本文介绍如何基于 Strands Agents SDK 和 AWS 官方 MCP 工具，构建一个支持自然语言交互的云成本分析 AI 助手，实现费用查询、图表可视化和优化建议的端到端体验，并适配亚马逊云科技中国区部署。

**目录**

01 [一、背景与适用场景](#section1)

02 [二、方案架构](#section2)

03 [三、技术实现详解](#section3)

04 [四、中国区适配](#section4)

05 [五、部署方案](#section5)

06 [六、效果演示](#section6)

07 [七、总结与展望](#section7)

08 [八、资源链接](#section8)

* * *

## **一、背景与适用场景**

### 1.1 云成本管理面临的挑战

随着企业在云上业务规模不断扩大，云成本管理面临越来越多的挑战：

*   工具学习门槛高：Cost Explorer、Budgets、Pricing等工具分散在不同控制台，需要专业知识才能有效使用，对非技术人员不友好
*   分析效率低：从提出问题到获得答案，需要在多个界面间切换、手动筛选维度、导出数据再加工
*   缺乏自然语言交互：现有工具主要依赖图形界面操作，无法通过对话快速获取洞察
*   缺少数据分析洞察：传统工具侧重数据展示，缺乏基于数据的智能分析和优化推荐能力

### 1.2 方案能力概述

本方案构建了一个基于大语言模型的 FinOps 智能助手，通过自然语言对话即可完成云成本相关的查询和分析。以下是常见的使用场景：

*   查询任意时间段的费用趋势和服务费用分布
*   对比不同月份/服务/区域的成本变化，识别异常波动
*   查询特定实例类型、存储类型的实时定价
*   获取 RI/SP 覆盖率、利用率和购买建议
*   监控预算执行情况和免费套餐使用量
*   以图表形式直观展示分析结果，并附带 Cost Explorer 控制台链接供深入验证

此外，通过集成更多 AWS MCP Server（如 CloudWatch、CloudTrail 等），可以进一步扩展助手的能力边界。

### 1.3 适用场景

*   项目组/业务人员：不需要对亚马逊云科技账单体系有深入了解，通过自然语言即可查询项目相关费用
*   FinOps 团队：快速获取多维度费用分析和优化建议，提升日常工作效率
*   管理层：通过对话获取费用概览和趋势，无需学习控制台操作
*   多账号支持：支持 AWS 凭证透传和 SSO 集成，满足不同账号的查询需求

## **二、方案架构**

### 2.1 系统架构

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/26/based-on-strands-agents-build-cost-analytics-optimize-ai-assistant-1.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/26/based-on-strands-agents-build-cost-analytics-optimize-ai-assistant-1.png)

\[图1\]

系统采用前后端分离架构，部署在 ECS Fargate 上，通过 ALB 路径路由统一入口。后端基于 Strands Agents SDK 构建 Agent，通过 MCP 协议连接亚马逊云科技官方的账单和定价工具服务器，前端使用 React 实现流式渲染和图表可视化。

### 2.2 请求流程

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/26/based-on-strands-agents-build-cost-analytics-optimize-ai-assistant-2.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/26/based-on-strands-agents-build-cost-analytics-optimize-ai-assistant-2.png)

\[图2\]

一次完整的用户交互流程：用户输入自然语言问题 → 后端 Agent 选择合适的 MCP 工具 → 调用 AWS API 获取数据 → 整理为文本 + 图表流式返回 → 前端实时渲染。

### 2.3 核心优势

*   自然语言交互：无需学习复杂的控制台操作，用自然语言提问即可获取费用分析与优化建议
*   多种图形化展示：折线图/柱状图/饼图自动渲染，费用趋势一目了然
*   CE 链接带筛选条件：回复中附带精确的 Cost Explorer 控制台链接，一键跳转验证数据
*   中国区适配：提示词优化 + MCP 工具 Region Patch + 中国区 Partition 与端点适配
*   多会话 + 灵活认证：API Key 认证、S3 会话持久化、可选 AWS 凭证透传，支持多用户多账号
*   LLM 可配置：支持亚马逊云科技中国区 Marketplace 上的 MaaS 平台模型或自建的 OpenAI 兼容推理端点，前端可自定义切换

### 2.4 技术栈

*   AI 框架：Strands Agents SDK — AWS 开源 Agent 框架，原生支持 MCP 工具和流式响应
*   MCP 工具：AWS Billing and Cost Management MCP Server + AWS Pricing MCP Server
*   后端：FastAPI + Uvicorn，异步流式响应
*   前端：React 19 + Vite 4 + recharts，流式渲染 + 图表可视化
*   部署：ECS Fargate + ALB + CloudFormation，一键部署
*   LLM：兼容 OpenAI API 格式的大语言模型，支持亚马逊云科技中国区 Marketplace MaaS 平台或自建推理端点

### 2.5 MCP 工具能力

本方案集成了两个 AWS 官方 MCP Server：

**AWS Billing and Cost Management MCP Server**

提供对 AWS 账单和成本管理 API 的访问能力，主要功能包括：

*   成本与用量分析：通过 Cost Explorer 分析历史和预测费用，支持灵活的分组和筛选
*   成本异常检测：识别异常消费模式及其根因
*   预算监控：检查现有预算及其与实际支出的对比状态
*   RI/SP 分析：分析预留实例覆盖率，获取 Savings Plans 购买建议
*   成本对比：按月对比成本变化，识别关键成本驱动因素
*   免费套餐监控：监控 Free Tier 使用情况，避免意外费用
*   成本优化建议：通过 Compute Optimizer 获取 EC2、Lambda、EBS 等资源的右型化建议
*   成本分配标签：查看成本分配标签的激活状态和回填历史
*   成本类别：管理和查询成本类别定义及规则

**AWS Pricing MCP Server**

提供实时 AWS 定价信息访问和成本分析能力，主要功能包括：

*   服务定价发现：探索所有 AWS 服务的可用定价信息和可筛选维度
*   实时定价查询：支持高级筛选、多选项对比和模式匹配
*   多区域定价对比：在单次查询中对比不同 AWS 区域的定价
*   成本报告生成：创建包含单价、计算过程和使用场景的详细成本分析报告
*   基础设施项目分析：扫描 CDK 和 Terraform 项目，自动识别 AWS 服务及其配置并估算成本
*   批量定价数据：下载完整定价数据集用于历史分析和离线处理

## **三、技术实现详解**

### 3.1 Agent 初始化与 MCP 工具集成

后端核心是基于 Strands Agents SDK 创建的 Agent 实例。每个用户请求动态创建 Agent，注入对应的 MCP 工具客户端，支持不同用户使用不同 AWS 凭证查询不同账号的费用数据：

```
from strands import Agent
from strands.models.openai import OpenAIModel
from strands.tools.mcp import MCPClient
from strands.session.s3_session_manager import S3SessionManager
def create_agent(session_id, aws_credentials=None, llm_config=None):
    # MCP 工具客户端 - 按请求动态创建，支持不同 AWS 凭证
    mcp_clients = _make_mcp_clients(aws_credentials)
    # S3 会话管理 - 多实例共享，对话记忆持久化
    session_manager = S3SessionManager(
        session_id=session_id, bucket=SESSION_BUCKET, region_name=AWS_REGION)
    return Agent(
        model=model, tools=mcp_clients,
        session_manager=session_manager, system_prompt=_get_system_prompt())
```

MCP 工具通过 stdio\_client 以子进程方式启动，环境变量动态注入 AWS 凭证。当用户在前端输入自定义 AK/SK/ SESSION\_TOKEN 时，凭证会注入到 MCP 子进程环境变量中，覆盖默认的 ECS Task Role 凭证，以支持跨账号查询场景：

```
def _get_mcp_env(aws_credentials=None):
    env = {**os.environ, "AWS_REGION": AWS_REGION}
    if aws_credentials:
        env["AWS_ACCESS_KEY_ID"] = aws_credentials["access_key_id"]
        env["AWS_SECRET_ACCESS_KEY"] = aws_credentials["secret_access_key"]
        if aws_credentials.get("session_token"):
            env["AWS_SESSION_TOKEN"] = aws_credentials["session_token"]
        env.pop("AWS_CONTAINER_CREDENTIALS_RELATIVE_URI", None)
    return env
```

### 3.2 流式响应与停止推理

FastAPI 端点使用 StreamingResponse 配合 Strands Agent 的 stream\_async 方法实现流式输出。通过 \_active\_agents 字典追踪活跃 Agent 实例，支持用户随时停止推理：

```
@app.post("/stream")
async def stream_response(request: PromptRequest):
    async def generate():
        agent = create_agent(request.session, aws_credentials=creds)
        _active_agents[request.session] = agent
        async for event in agent.stream_async(request.prompt):
            if "data" in event:
                yield event["data"]
        _active_agents.pop(request.session, None)
    return StreamingResponse(generate(), media_type="text/plain")
@app.post("/stop")
async def stop_stream(request: StopRequest):
    agent = _active_agents.get(request.session)
    if agent:
        agent.cancel()  # Strands Agent 原生支持优雅取消
```

前端通过 AbortController 断开 fetch 连接，同时调用 /stop API 通知后端取消 Agent 推理，实现双向停止。

### 3.3 前端图表可视化

前端的核心创新是提示词驱动的可视化——通过在系统提示词中定义 chart JSON 格式规范，让模型在输出费用趋势等数据时自动生成结构化的图表描述，前端识别后渲染为 recharts 图表。

**渲染机制**

```
模型输出 ```chart JSON → parseChartBlocks() 解析 → 流式中隐藏不完整数据 → 完成后渲染 recharts
```

*   流式安全：流式过程中检测不完整的 chart JSON 块，暂时隐藏，仅在完成后才渲染图表组件
*   千分位修复：模型有时输出 2,273,877 格式的数字，前端自动正则替换为 2273877
*   时间维度优先：自动检测数据中的时间字段，优先作为横坐标展示

图表格式示例（系统提示词中定义）：

````
```chart
{"type":"line","title":"月度费用趋势","data":[{"name":"1月","费用":1847},...]}
```
````

支持三种图表类型：折线图（费用趋势/预测）、柱状图（服务费用对比）、饼图（费用占比）。

### 3.4 系统提示词设计

系统提示词是 Agent 行为的核心控制点，包含以下关键设计：

*   工具使用规则：明确定价查询必须使用 Pricing MCP 而非 Billing MCP，定义工具调用链（服务代码→属性→值→定价）
*   输出格式规范：定义 chart JSON 格式，规定趋势数据只用图表不用文字重复
*   CE 链接模板：根据查询条件动态生成带筛选参数的 Cost Explorer 控制台链接
*   准确性约束：所有数据必须来自工具返回的实际结果，不允许编造或估算
*   动态日期注入：{current\_date} 在运行时替换为当前时间

## **四、中国区适配**

### 4.1 MCP Region Patch

AWS 官方的 Billing and Cost Management MCP Server 内部硬编码了 us-east-1（全球区 CE API 端点）。在中国区，CE API 端点在 cn-northwest-1，需要在 Dockerfile 构建时修复：

```
# 修复 billing MCP server 硬编码 us-east-1 的问题
RUN sed -i "s/region_name='us-east-1'/region_name='cn-northwest-1'/g" \
    /usr/local/lib/python3.12/site-packages/awslabs/billing_cost_management_mcp_server/tools/*.py
```

同时设置 AWS\_DOCUMENTATION\_PARTITION=aws-cn 确保文档分区正确。

### 4.2 提示词中国区定制

*   定价 API 区域名称：通过 MCP 查询北京区和宁夏区的定价时，使用对应的区域显示名称
*   服务差异适配：针对中国区的服务 feature 差异优化提示词，避免调用不可用的功能
*   CE 链接适配：生成中国区 AWS Console 的 Cost Explorer 链接
*   语言提示：可根据需求自定义输出语言，默认中文回复

### 4.3 MCP 安装策略

MCP Server 通过 pip install 直接安装到镜像中，而非运行时使用 uvx 下载。这避免了容器启动时的网络依赖和超时问题，在中国区网络环境下尤为重要。同时在构建和部署过程中使用国内 PyPI 和 npmmirror 镜像站。

## **五、部署方案**

### 5.1 容器化部署架构

整个系统通过 CloudFormation 一键部署，包含：

*   ECS Fargate：前后端分离部署，无需管理服务器
*   ALB 路径路由：/api/\* → 后端 TG (8000)，/\* → 前端 TG (80)
*   私有子网 + NAT Gateway：ECS 任务部署在私有子网，通过 NAT 出网
*   安全组：ALB 入站 CIDR 白名单，ECS 仅允许 ALB 安全组入站
*   Secrets Manager：API Key 存储，后端启动时读取
*   S3：会话持久化，支持多实例共享

### 5.2 部署命令

```
# 构建推送镜像
aws ecr get-login-password --region cn-northwest-1 | docker login --username AWS --password-stdin ${ECR_URI}
cd backend && docker build -t ${ECR_URI}/finops-backend:latest .
docker push ${ECR_URI}/finops-backend:latest
cd ../frontend && docker build -t ${ECR_URI}/finops-frontend:latest .
docker push ${ECR_URI}/finops-frontend:latest
# 一键部署
aws cloudformation deploy \
  --template-file infra/cloudformation.yaml \
  --stack-name finops-agent \
  --parameter-overrides VpcId=vpc-xxx PublicSubnetIds=subnet-aaa,subnet-bbb \
    PrivateSubnetIds=subnet-ccc,subnet-ddd LlmApiKey=sk-xxx ApiKey=your-api-key \
  --capabilities CAPABILITY_NAMED_IAM
```

### 5.3 IAM 权限设计

ECS Task Role 遵循最小权限原则：

*   ce:\* — Cost Explorer 查询
*   pricing:\* — 定价查询
*   budgets:\* — 预算管理
*   freetier:\* — 免费套餐监控
*   s3:GetObject/PutObject/DeleteObject/ListBucket — 会话持久化
*   secretsmanager:GetSecretValue — API Key 读取

## **六、效果演示**

以下展示 FinOps 助手的典型使用场景，包括费用趋势分析（折线图）、服务费用对比（柱状图/饼图）、表格化数据展示等，以及回复末尾附带的带筛选条件的 Cost Explorer 控制台链接。

## **七、总结与展望**

本文展示了一个基于 Strands Agents SDK 的完整 FinOps 智能助手方案。通过 MCP 工具安全访问 Cost Explorer 和 Pricing API，结合提示词驱动的图表可视化和中国区适配，实现了从自然语言提问到可视化分析结果的端到端体验。CloudFormation 一键部署降低了方案的落地门槛，多 Session 支持和可选的 AWS 凭证透传机制共同支撑了多用户多账号场景。

**未来扩展方向**

*   认证增强：集成企业 SSO（SAML/OIDC），前端页面以及MCP工具统一集成身份认证
*   定时报告：结合 EventBridge 定时触发，自动生成周/月度 FinOps 报告并推送
*   会话历史管理：列表、恢复、删除、搜索历史对话
*   更多成本工具集成：Trusted Advisor 成本优化建议、Savings Plans 购买自动化等

**➡️ 下一步行动：**

**相关产品：**

*   [Amazon ECS](https://aws.amazon.com/cn/ecs/?p=bl_pr_ecs_l=1) — 完全托管的容器编排服务
*   [Amazon S3](https://aws.amazon.com/cn/s3/?p=bl_pr_s3_l=2) — 适用于 AI、分析和存档的几乎无限的安全对象存储
*   [Amazon Fargate](https://aws.amazon.com/cn/fargate/?p=bl_pr_fargate_l=3) — 适用于容器的无服务器计算
*   [Amazon CloudFormation](https://aws.amazon.com/cn/cloudformation/?p=bl_pr_cloudformation_l=4) — 基础设施即代码服务
*   [Amazon IAM](https://aws.amazon.com/cn/iam/?p=bl_pr_iam_l=5) — 身份管理和访问权限

**相关文章：**

*   [基于Bedrock Agentcore 实现智能成本分析与告警系统](https://aws.amazon.com/cn/blogs/china/intelligent-cost-analysis-and-alerting-system-powered-by-bedrock-agentcore/?p=bl_ar_l=1)
*   [（上篇）基于 AWS Bedrock AgentCore 构建企业级航空客服智能体 —— 基于AIDLC方法从需求分析到生产部署的完整实践](https://aws.amazon.com/cn/blogs/china/based-on-aws-bedrock-agentcore-build-enterprise-intelligent-based-on-aidlc-analytics-deploy-practice/?p=bl_ar_l=2)
*   [基于 Amazon Bedrock AgentCore Runtime 部署 Apache Doris MCP Server为 Quick Suite 等 AI 客户端提供原生数据分析能力](https://aws.amazon.com/cn/blogs/china/runtime-deploy-apache-doris-mcp-server-quick-suite-ai-analytics/?p=bl_ar_l=3)
*   [OpenClaw 在电商平台的应用场景探索](https://aws.amazon.com/cn/blogs/china/exploring-openclaw-use-cases-in-ecommerce-platforms/?p=bl_ar_l=4)
*   [基于 AWS DevOps Agent 构建 AI 驱动的运维分析系统](https://aws.amazon.com/cn/blogs/china/based-on-aws-devops-agent-build-ai-operations-analytics-system/?p=bl_ar_l=5)

## **八、资源链接**

*   [AWSCN-FinOps-Assistant](https://github.com/peiliyu/AWSCN-FinOps-Assistant)
*   [Strands Agents SDK](https://github.com/strands-agents/sdk-python)
*   [AWS MCP Servers](https://awslabs.github.io/mcp/)
*   [AWS Billing and Cost Management MCP Server](https://awslabs.github.io/mcp/servers/billing-cost-management-mcp-server)
*   [AWS Pricing MCP Server](https://awslabs.github.io/mcp/servers/aws-pricing-mcp-server)

\*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

* * *

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/summit-tag3.png)

## 亚马逊云科技中国峰会

开发者挑战赛现场开启，基于真实业务场景亲手构建 Agent。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/25/yuyuecanhui.png)](https://aws.amazon.com/cn/events/summits/shanghai/?ectrk=jyLXNovBYB51qgzUEipIpZcxlfE5%2Bs7NfDTnZwR7hFYtQmPUSToTuN%2FZO5doh20ZJ%2FloW6Rom0l3P4LLcoyUPA%3D%3D&sc_icampaign=glb-summit-blog-p2&sc_ichannel=ha&sc_iplace=blog&trk=ab30be54-aedd-480a-9364-ab0bf98e982d)

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/14/2026_Summits_Commercial_Banner_1440x657.png)
