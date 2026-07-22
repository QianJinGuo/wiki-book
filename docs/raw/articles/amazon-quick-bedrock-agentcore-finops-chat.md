---
title: "用 Amazon Quick + Bedrock AgentCore 打造对话式 FinOps 助手"
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/based-on-amazon-quick-amazon-bedrock-agentcore/
ingested: 2026-06-01
feed_name: AWS
source_published: 2026-05-28T09:52:31Z
type: article
sha256: a382610aafce2f66884247b0066e92f8fa38bb8a50e089c0e026da91d7f628fa
tags: ['finops', 'aws', 'bedrock', 'agentcore', 'cost-optimization']
---
# 基于Amazon Quick与Amazon Bedrock AgentCore打造对话式 FinOps助手

摘要：本文介绍如何将 AWS 账单相关 API 通过 MCP 协议封装为工具，部署到 Amazon Bedrock AgentCore Runtime，并接入 Amazon Quick Chat Agent，让业务用户以自然语言直接查询多账号的云成本数据。

**目录**

01 [一、引言](#section1)

02 [二、方案概述](#section2)

03 [三、前置条件](#section3)

04 [四、部署](#section4)

05 [五、测试](#section5)

06 [六、日常运维](#section6)

07 [七、清理资源](#section7)

08 [八、总结](#section8)

09 [九、参考文档](#section9)

10 [十、附录](#section10)

11 [十一、相关链接](#section11)

* * *

## **一、引言**

云成本与 FinOps 团队每周都要花不少时间回答来自业务方的同一类问题：上个月花了多少钱，哪个服务增长最快，有没有异常，能从哪里优化。这些数据原本就沉淀在 AWS Billing and Cost Management、AWS Cost Explorer、AWS Budgets、AWS Compute Optimizer 等服务中，但每一位业务用户都希望能用自己的方式——通过对话——拿到答案。

Model Context Protocol（MCP）让我们可以把上述账单相关的 API 封装成工具，任何支持 MCP 的 Agent 都能发现并调用它们。[Amazon Bedrock AgentCore Runtime](https://aws.amazon.com/cn/bedrock/agentcore/) 以 Serverless 的方式托管 MCP Server，并提供 OAuth 保护的调用端点；[Amazon Quick](https://aws.amazon.com/cn/quick/) 则通过其 Chat Agent 提供对话式的前端。把这三者组合在一起，业务用户在 Amazon Quick 中用中文问一句”我上个月的 AWS 账单按服务分组是多少？”，就能拿到基于真实账号数据的回答——不再需要仪表盘、定制 UI，也不用为每个团队单独做集成。

在本文中，我们将展示如何将开源的Billing and Cost Management MCP Server（做了一定的改造和适配）部署到 [Amazon Bedrock AgentCore](https://aws.amazon.com/cn/bedrock/agentcore/) Runtime，通过 [Amazon Cognito](https://aws.amazon.com/cn/cognito/) OAuth 2.0 进行保护，并使用服务认证（OAuth，2LO）把它接入 Amazon Quick Chat Agent。我们也会介绍一种可选的跨账号模式，让同一个Chat Agent可以查询多个 AWS 账号的账单。

## **二、方案概述**

本方案的请求链路按以下顺序流转：

1.  用户在 Amazon Quick 中提出账单相关的问题，Chat Agent 判断需要调用哪个 MCP 工具。
2.  Amazon Quick 使用客户端 ID 和客户端密钥，以 OAuth 2.0 客户端凭证流（client credentials flow，即 2LO）向 Amazon Cognito 令牌端点换取一个 JWT 访问令牌。
3.  Amazon Quick 携带该令牌，通过 Streamable HTTP 调用 AgentCore Runtime 的 MCP 端点。
4.  AgentCore Runtime 通过配置的 Cognito 授权方校验该令牌；如果调用方在允许列表中，则把 MCP 请求转发给容器。
5.  容器内的 Billing and Cost Management MCP Server 以 ARM64（AWS Graviton）方式运行，使用 AWS Identity and Access Management（IAM）执行角色调用 AWS Cost Explorer、AWS Budgets、AWS Compute Optimizer、AWS Cost Optimization Hub 等 API。
6.  结果沿原路返回 Amazon Quick，由 Chat Agent 用自然语言呈现给用户。

架构图如下：

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/28/based-on-amazon-quick-amazon-bedrock-agentcore-1.jpg)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/28/based-on-amazon-quick-amazon-bedrock-agentcore-1.jpg)

\[图1：端到端架构—Amazon Quick Chat Agent 通过 Amazon Bedrock AgentCore Runtime 调用 Billing and Cost Management MCP Server\]

整体方案包含以下组件：

*   Amazon Quick Chat Agent：MCP 客户端，使用服务认证（2LO）获取 JWT 访问令牌，代表业务用户调用 MCP 工具。
*   Amazon Cognito user pool：OAuth 2.0 授权服务器，为 Amazon Quick 使用的机器到机器（M2M）客户端和用于验证的测试客户端颁发 JWT 访问令牌。
*   [Amazon Bedrock](https://aws.amazon.com/cn/bedrock/) AgentCore Runtime：托管 MCP Server 的运行时，负责在入口处校验 OAuth 2.0 JWT、按允许列表过滤调用方，并运行 MCP Server 容器。
*   Billing and Cost Management MCP Server：一个 ARM64 容器，暴露 25 个工具，映射到 AWS Cost Explorer、AWS Budgets、AWS Compute Optimizer、AWS Cost Optimization Hub、AWS Pricing、Free Tier 等 API。
*   [AWS IAM](https://aws.amazon.com/cn/iam/) 执行角色：授予容器只读访问账单数据 API 的权限，可选地授予 sts:AssumeRole 用于跨账号查询。

MCP Server 遵循 AgentCore Runtime 的协议契约：监听 0.0.0.0:8000/mcp，采用 Streamable HTTP 无状态模式。容器镜像为 ARM64 架构，由 AgentCore CLI 在部署时通过 [AWS CodeBuild](https://aws.amazon.com/cn/codebuild/) 自动构建。协议细节请参阅 [Deploy MCP servers in AgentCore Runtime](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-mcp.html) 和 [MCP protocol contract](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-mcp-protocol-contract.html)。

本文所使用的方案对awslabs的[billing-cost-management-mcp-server](https://github.com/awslabs/mcp/tree/main/src/billing-cost-management-mcp-server)做了改造，所有改造均通过 [Kiro](https://kiro.dev/) 以 Vibe Coding 的方式完成，主要包含以下三方面的内容：

1\. AgentCore Runtime 适配

上游源码默认使用 stdio 传输，仅支持本地运行。为了部署到 AgentCore Runtime做了以下适配：

*   *   传输协议：从 stdio 改为 streamable-http，监听 0.0.0.0:8000，满足 AgentCore Runtime 的 HTTP 协议要求
    *   容器环境兼容：容器内以非 root 用户运行，原始代码在源码目录下创建日志和 SQLite session 文件夹会因权限不足而失败，添加了 /tmp fallback

2\. Amazon Quick 适配

Cost Explorer 的 metrics 参数从 JSON 字符串类型改为原生列表类型，解决 Amazon Quick Action Review 界面的类型校验报错

3\. 跨账号查询支持

上游源码仅支持查询部署所在账号的账单数据。为支持多账号场景，新增了跨账号 assume role 能力：

*   *   本账号识别：查询本账号时自动跳过 assume role，避免不必要的角色切换
    *   管理账号防御：LLM 在查询时可能自行添加 LINKED\_ACCOUNT 过滤条件，但管理账号不在该维度中，会导致返回空结果。通过 prompt 引导和代码层面的递归清理双重防御解决

所有改造细节见此[仓库](https://github.com/sunl/billing-cost-management-mcp-server-for-amazon-quick)。

## **三、前置条件**

确认已准备好：

*   一个已开通 Amazon Bedrock AgentCore 的 AWS 账号。本文使用 US East (N. Virginia) 区域（us-east-1）。权限细节请参阅 [Permissions for AgentCore Runtime](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-permissions.html)。
*   一个 Amazon Quick Enterprise 订阅，以及一个拥有 Author Pro 角色的用户。
*   Python 3.10 或更高版本、git、pip 和 jq。
*   已配置凭证的 AWS Command Line Interface（AWS CLI）v2，凭证需要能够创建 AWS IAM 角色、Amazon Cognito user pool 和 AWS CodeBuild 项目。
*   在目标账号中启用 AWS Cost Explorer 的权限（MCP Server 的大部分工具依赖它）。

## **四、部署**

在本节中，您将完成以下部署步骤：

1.  安装 Node.js、Python 3.14、uv 和 AgentCore CLI，并克隆 MCP Server 仓库。
2.  创建 IAM 执行角色，并附加 MCP Server 所需的策略。
3.  配置 Amazon Cognito 作为 OAuth 2.0 授权服务器，包括为 Amazon Quick 创建机器到机器（M2M）客户端。
4.  配置跨账号 IAM，让 MCP Server 能够查询其他 AWS 账号的账单数据（可选）。
5.  配置并把 MCP Server 部署到 Amazon Bedrock AgentCore Runtime。
6.  通过 MCP initialize 请求验证部署。将 Amazon Quick Chat Agent 接入 MCP Server，并尝试几条示例提问。

### 步骤 1：安装运行环境，克隆仓库

先设置一组后续步骤会用到的 Shell 环境变量：

```
export AWS_REGION=us-east-1
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
```

后续全文中，<占位符> 用于需要您自行填入的值，${AWS\_ACCOUNT\_ID} 这样的 Shell 变量引用则指代上一步导出的值。

安装 Node.js 22、Python 3.14、uv以及 AgentCore CLI。注意：AgentCore CLI 已从旧版 Python 包 bedrock-agentcore-starter-toolkit 迁移到新版 npm包@aws/agentcore，使用`agentcore create / agentcore deploy` 工作流取代旧版 `agentcore configure / agentcore launch`。如果之前安装过旧版 CLI，请先卸载：`pip uninstall bedrock-agentcore-starter-toolkit`，详见 [AgentCore CLI 文档](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-get-started-cli.html)。

```
# Node.js 22（AgentCore CLI 依赖）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22

# Python 3.14
sudo dnf install -y python3.14 python3.14-pip

# uv（Python 包管理器，AgentCore CLI 依赖它管理 Python 项目）
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env

# AgentCore CLI
npm install -g @aws/agentcore

# 验证安装
node --version
uv --version
agentcore --help
```

克隆仓库：

```
git clone https://github.com/sunl/billing-cost-management-mcp-server-for-amazon-quick.git
```

部署前，可以选择先在本地运行一次 MCP Server，确认源码能正常启动：

```
cd billing-cost-management-mcp-server-for-amazon-quick
python3.14 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -e .
python awslabs/billing_cost_management_mcp_server/server.py
```

在另一个终端发送 MCP initialize 握手请求：

```
curl -X POST http://localhost:8000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'
```

预期返回包含serverInfo 的 JSON 响应。

### 步骤 2：创建 IAM 执行角色

AgentCore Runtime通过assume一个 IAM 执行角色来拉取容器镜像、写入日志，以及调用账单数据 API。创建该角色时，将信任策略收敛到您的账号和该区域的 AgentCore 资源范围内。

```
cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "AssumeRolePolicy",
    "Effect": "Allow",
    "Principal": {"Service": "bedrock-agentcore.amazonaws.com"},
    "Action": "sts:AssumeRole",
    "Condition": {
      "StringEquals": {"aws:SourceAccount": "${AWS_ACCOUNT_ID}"},
      "ArnLike": {"aws:SourceArn": "arn:aws:bedrock-agentcore:${AWS_REGION}:${AWS_ACCOUNT_ID}:*"}
    }
  }]
}
EOF
aws iam create-role \
  --role-name BillingMCPServerAgentCoreRole \
  --assume-role-policy-document file://trust-policy.json \
  --description "AgentCore Runtime Role - Billing MCP Server"
```

附加 AgentCore Runtime 工作负载所需的基础策略。它授予从Amazon ECR拉取镜像、在 [Amazon CloudWatch](https://aws.amazon.com/cn/cloudwatch/) Logs 中创建日志组，以及通过 [AWS X-Ray](https://aws.amazon.com/cn/xray/) 和 Amazon CloudWatch 发送指标和追踪的权限。

```
cat > agentcore-base-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {"Sid": "ECRImageAccess", "Effect": "Allow", "Action": ["ecr:BatchGetImage","ecr:GetDownloadUrlForLayer"], "Resource": ["arn:aws:ecr:${AWS_REGION}:${AWS_ACCOUNT_ID}:repository/*"]},
    {"Sid": "ECRTokenAccess", "Effect": "Allow", "Action": ["ecr:GetAuthorizationToken"], "Resource": "*"},
    {"Sid": "LogsCreate", "Effect": "Allow", "Action": ["logs:DescribeLogStreams","logs:CreateLogGroup"], "Resource": ["arn:aws:logs:${AWS_REGION}:${AWS_ACCOUNT_ID}:log-group:/aws/bedrock-agentcore/runtimes/*"]},
    {"Sid": "LogsDescribe", "Effect": "Allow", "Action": ["logs:DescribeLogGroups"], "Resource": ["arn:aws:logs:${AWS_REGION}:${AWS_ACCOUNT_ID}:log-group:*"]},
    {"Sid": "LogsWrite", "Effect": "Allow", "Action": ["logs:CreateLogStream","logs:PutLogEvents"], "Resource": ["arn:aws:logs:${AWS_REGION}:${AWS_ACCOUNT_ID}:log-group:/aws/bedrock-agentcore/runtimes/*:log-stream:*"]},
    {"Sid": "XRay", "Effect": "Allow", "Action": ["xray:PutTraceSegments","xray:PutTelemetryRecords","xray:GetSamplingRules","xray:GetSamplingTargets"], "Resource": "*"},
    {"Sid": "Metrics", "Effect": "Allow", "Action": "cloudwatch:PutMetricData", "Resource": "*", "Condition": {"StringEquals": {"cloudwatch:namespace": "bedrock-agentcore"}}}
  ]
}
EOF
aws iam put-role-policy \
  --role-name BillingMCPServerAgentCoreRole \
  --policy-name AgentCoreBasePolicy \
  --policy-document file://agentcore-base-policy.json
```

附加账单专用策略。授予对 AWS Cost Explorer、AWS Budgets、AWS Compute Optimizer、AWS Cost Optimization Hub、AWS Pricing、Free Tier、AWS Billing Conductor 和 BCM Pricing Calculator 等 API 的只读权限。

```
cat > billing-mcp-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {"Sid": "CostExplorer", "Effect": "Allow", "Action": ["ce:GetCostAndUsage","ce:GetCostAndUsageWithResources","ce:GetCostAndUsageComparisons","ce:GetCostComparisonDrivers","ce:GetCostForecast","ce:GetUsageForecast","ce:GetDimensionValues","ce:GetTags","ce:GetCostCategories","ce:GetReservationPurchaseRecommendation","ce:GetReservationCoverage","ce:GetReservationUtilization","ce:GetSavingsPlansUtilization","ce:GetSavingsPlansCoverage","ce:GetSavingsPlansUtilizationDetails","ce:GetSavingsPlansPurchaseRecommendation","ce:GetAnomalies"], "Resource": "*"},
    {"Sid": "CostOptimizationHub", "Effect": "Allow", "Action": ["cost-optimization-hub:GetRecommendation","cost-optimization-hub:ListRecommendations","cost-optimization-hub:ListRecommendationSummaries"], "Resource": "*"},
    {"Sid": "ComputeOptimizer", "Effect": "Allow", "Action": ["compute-optimizer:GetAutoScalingGroupRecommendations","compute-optimizer:GetEBSVolumeRecommendations","compute-optimizer:GetEC2InstanceRecommendations","compute-optimizer:GetECSServiceRecommendations","compute-optimizer:GetRDSDatabaseRecommendations","compute-optimizer:GetLambdaFunctionRecommendations","compute-optimizer:GetEnrollmentStatus","compute-optimizer:GetIdleRecommendations"], "Resource": "*"},
    {"Sid": "Budgets", "Effect": "Allow", "Action": ["budgets:ViewBudget"], "Resource": "*"},
    {"Sid": "Pricing", "Effect": "Allow", "Action": ["pricing:DescribeServices","pricing:GetAttributeValues","pricing:GetProducts"], "Resource": "*"},
    {"Sid": "FreeTier", "Effect": "Allow", "Action": ["freetier:GetFreeTierUsage"], "Resource": "*"},
    {"Sid": "BCMPricingCalc", "Effect": "Allow", "Action": ["bcm-pricing-calculator:GetPreferences","bcm-pricing-calculator:GetWorkloadEstimate","bcm-pricing-calculator:ListWorkloadEstimateUsage","bcm-pricing-calculator:ListWorkloadEstimates"], "Resource": "*"},
    {"Sid": "BillingConductor", "Effect": "Allow", "Action": ["billingconductor:ListBillingGroups","billingconductor:ListBillingGroupCostReports","billingconductor:ListAccountAssociations","billingconductor:ListPricingPlans","billingconductor:ListPricingRules","billingconductor:ListPricingPlansAssociatedWithPricingRule","billingconductor:ListPricingRulesAssociatedToPricingPlan","billingconductor:ListCustomLineItems","billingconductor:ListCustomLineItemVersions","billingconductor:ListResourcesAssociatedToCustomLineItem"], "Resource": "*"}
  ]
}
EOF
aws iam put-role-policy \
  --role-name BillingMCPServerAgentCoreRole \
  --policy-name BillingMCPServerPolicy \
  --policy-document file://billing-mcp-policy.json
export EXECUTION_ROLE_ARN=$(aws iam get-role --role-name BillingMCPServerAgentCoreRole --query 'Role.Arn' --output text)
echo "Execution Role ARN: ${EXECUTION_ROLE_ARN}"
```

将 EXECUTION\_ROLE\_ARN 导出以备后续填入 AgentCore 配置文件。

### 步骤 3：配置 Amazon Cognito 作为 OAuth 2.0 授权服务器

AgentCore Runtime 依赖一个外部 OAuth 2.0 授权服务器来校验 JWT。本文使用 Amazon Cognito，需要创建：一个 user pool、一个用于验证的测试客户端、一个 custom domain、一个 resource server，以及一个供 Amazon Quick 使用的机器到机器（M2M）客户端。

创建 user pool 和测试用户：

```
export POOL_NAME="<YOUR_POOL_NAME>"
export POOL_ID=$(aws cognito-idp create-user-pool \
  --pool-name "${POOL_NAME}" \
  --policies '{"PasswordPolicy":{"MinimumLength":8}}' \
  --region ${AWS_REGION} | jq -r '.UserPool.Id')
export CLIENT_ID=$(aws cognito-idp create-user-pool-client \
  --user-pool-id ${POOL_ID} \
  --client-name "BillingMCPClient" \
  --no-generate-secret \
  --explicit-auth-flows "ALLOW_USER_PASSWORD_AUTH" "ALLOW_REFRESH_TOKEN_AUTH" \
  --region ${AWS_REGION} | jq -r '.UserPoolClient.ClientId')
export COGNITO_USERNAME="<YOUR_USERNAME>"
export COGNITO_PASSWORD="<YOUR_SECURE_PASSWORD>"
aws cognito-idp admin-create-user \
  --user-pool-id ${POOL_ID} --username ${COGNITO_USERNAME} \
  --region ${AWS_REGION} --message-action SUPPRESS > /dev/null
aws cognito-idp admin-set-user-password \
  --user-pool-id ${POOL_ID} --username ${COGNITO_USERNAME} \
  --password ${COGNITO_PASSWORD} --region ${AWS_REGION} --permanent > /dev/null
export DISCOVERY_URL="https://cognito-idp.${AWS_REGION}.amazonaws.com/${POOL_ID}/.well-known/openid-configuration"
echo "Discovery URL: ${DISCOVERY_URL}"
echo "Client ID: ${CLIENT_ID}"
```

为 user pool 创建一个 custom domain。Amazon Quick 的服务认证会向这个 domain 的 /oauth2/token 端点请求令牌：

```
export COGNITO_DOMAIN_PREFIX="billing-mcp-$(echo ${AWS_ACCOUNT_ID} | tail -c 9)"
aws cognito-idp create-user-pool-domain \
  --user-pool-id ${POOL_ID} \
  --domain ${COGNITO_DOMAIN_PREFIX} \
  --region ${AWS_REGION}
echo "Cognito Domain: ${COGNITO_DOMAIN_PREFIX}"
```

服务认证（2LO）使用 client\_credentials 授权流程，Cognito 要求必须通过 Resource Server 来定义 scope：

```
aws cognito-idp create-resource-server \
  --user-pool-id ${POOL_ID} \
  --identifier "billing-mcp" \
  --name "Billing MCP Server" \
  --scopes '[{"ScopeName":"invoke","ScopeDescription":"Invoke Billing MCP Server"}]' \
  --region ${AWS_REGION}
```

创建 Amazon Quick 专用的 M2M 客户端。它会消费上面的 billing-mcp/invoke scope，并生成一个客户端密钥。请妥善保管该密钥，它仅在这一次返回中明文出现：

```
QS_M2M_RESULT=$(aws cognito-idp create-user-pool-client \
  --user-pool-id ${POOL_ID} \
  --client-name "QuickM2MClient" \
  --generate-secret \
  --allowed-o-auth-flows "client_credentials" \
  --allowed-o-auth-scopes "billing-mcp/invoke" \
  --allowed-o-auth-flows-user-pool-client \
  --supported-identity-providers "COGNITO" \
  --region ${AWS_REGION})
export QS_M2M_CLIENT_ID=$(echo ${QS_M2M_RESULT} | jq -r '.UserPoolClient.ClientId')
export QS_M2M_CLIENT_SECRET=$(echo ${QS_M2M_RESULT} | jq -r '.UserPoolClient.ClientSecret')
echo "M2M Client ID: ${QS_M2M_CLIENT_ID}"
echo "M2M Client Secret: ${QS_M2M_CLIENT_SECRET}"
```

### 步骤 4：配置跨账号查询（可选）

如果不需要跨账号查询，可跳过本步骤。本仓库在上游源码的基础上新增了跨账号 assume role 能力，允许单一部署查询多个 AWS 账号的账单数据。详细设计参阅 [cross-account-design.md](https://github.com/sunl/billing-cost-management-mcp-server-for-amazon-quick/blob/main/docs/cross-account-design.md)。

跨账号方案约定所有目标账号中都使用同一名称的角色 BillingMCPCrossAccountRole。先在源账号（即部署 AgentCore 的账号）的执行角色上追加 sts:AssumeRole 权限：

```
cat > cross-account-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "CrossAccountAssumeRole",
    "Effect": "Allow",
    "Action": "sts:AssumeRole",
    "Resource": [
      "arn:aws:iam::<目标账号A>:role/BillingMCPCrossAccountRole",
      "arn:aws:iam::<目标账号B>:role/BillingMCPCrossAccountRole"
    ]
  }]
}
EOF
aws iam put-role-policy \
  --role-name BillingMCPServerAgentCoreRole \
  --policy-name CrossAccountAssumeRolePolicy \
  --policy-document file://cross-account-policy.json
```

再在每个目标账号中创建同名角色，信任源账号的执行角色，并附加与步骤 2 同样的 billing-mcp-policy.json：

```
# 在目标账号中执行
cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "AWS": "arn:aws:iam::<源账号ID>:role/BillingMCPServerAgentCoreRole"
    },
    "Action": "sts:AssumeRole"
  }]
}
EOF

aws iam create-role \
  --role-name BillingMCPCrossAccountRole \
  --assume-role-policy-document file://trust-policy.json \
  --description "Cross-account role for Billing MCP Server"

aws iam put-role-policy \
  --role-name BillingMCPCrossAccountRole \
  --policy-name BillingMCPServerPolicy \
  --policy-document file://billing-mcp-policy.json
```

如果您需要自定义角色名称，请同时修改上述创建语句和策略中的 ARN，并在后续的 AgentCore 配置中通过容器环境变量 CROSS\_ACCOUNT\_ROLE\_NAME 指定。

### 步骤 5：初始化 AgentCore 项目并部署

创建项目脚手架：

```
agentcore create --project-name billing --name mcpserver --protocol MCP --build Container
cd billing
```

该命令会创建以下目录结构：

```
billing/
  AGENTS.md
  README.md
  agentcore/
    agentcore.json        # 项目和 agent 配置
    aws-targets.json      # AWS 账号和区域目标
    .env.local            # 本地环境变量（已 gitignore）
  app/
    mcpserver/
      Dockerfile
      README.md
      main.py             # 脚手架生成的入口文件（将被替换）
      pyproject.toml
      uv.lock
```

将步骤 1 中克隆的 MCP Server 源码放入 app/mcpserver/（codeLocation 指向的目录）：

```
# 清理脚手架生成的默认文件
rm -rf app/mcpserver/*

# 将 MCP Server 源码完整复制进来（排除 .git 和 .venv）
rsync -av --exclude='.git' --exclude='.venv' \
  ../billing-cost-management-mcp-server-for-amazon-quick/ \
  app/mcpserver/
```

最终 app/mcpserver/ 目录应包含awslabs/billing\_cost\_management\_mcp\_server/server.py 、Dockerfile、pyproject.toml 等文件。

接下来编辑 agentcore/agentcore.json，在自动生成的配置基础上填入executionRoleArn和 authorizerConfiguration。其他字段（例如 managedBy、tags、memories、credentials）保持自动生成的默认值即可。下面是需要关注的关键字段：

```
{
  "$schema": "https://schema.agentcore.aws.dev/v1/agentcore.json",
  "name": "billing",
  "version": 1,
  "runtimes": [
    {
      "name": "mcpserver",
      "build": "Container",
      "entrypoint": "awslabs/billing_cost_management_mcp_server/server.py",
      "codeLocation": "app/mcpserver/",
      "dockerfile": "Dockerfile",
      "runtimeVersion": "PYTHON_3_14",
      "networkMode": "PUBLIC",
      "instrumentation": {
        "enableOtel": false
      },
      "protocol": "MCP",
      "executionRoleArn": "<粘贴 ${EXECUTION_ROLE_ARN} 的实际值>",
      "authorizerType": "CUSTOM_JWT",
      "authorizerConfiguration": {
        "customJwtAuthorizer": {
          "discoveryUrl": "<粘贴 ${DISCOVERY_URL} 的实际值>",
          "allowedClients": [
            "<步骤 3 创建的 CLIENT_ID，用于测试>",
            "<步骤 3 创建的 QS_M2M_CLIENT_ID，Amazon Quick 必须加入>"
          ]
        }
      }
    }
  ]
}
```

**⚠️ 重要：**

allowedClients必须同时包含测试用的CLIENT\_ID和Amazon Quick使用的 QS\_M2M\_CLIENT\_ID。Amazon Quick使用M2M Client ID获取令牌，如果该ID不在允许列表中，连接会被拒绝。

编辑 agentcore/aws-targets.json，将空数组替换为：

```
[
  {
    "name": "default",
    "account": "<粘贴 ${AWS_ACCOUNT_ID} 的实际值>",
    "region": "us-east-1"
  }
]
```

如果直接运行 agentcore deploy（不带参数）进入交互模式，CLI 会自动检测当前 AWS 凭证的账号和区域，可以不编辑此文件。

使用–dry-run预览部署变更，如果CDK之前没有bootstrap过，需要加上–yes参数：

```
agentcore deploy --dry-run --yes
```

确认无误后执行部署：

该命令会读取 agentcore.json 和 aws-targets.json，根据 build 类型构建 Docker 容器（或 CodeZip 归档），通过 [AWS CDK](https://aws.amazon.com/cn/cdk/) 合成并部署 [AWS CloudFormation](https://aws.amazon.com/cn/cloudformation/) 资源，创建所需的AWS资源。加上 -v 标志可以查看资源级别的部署事件。

部署完成后，查看部署状态并记录 Agent ARN（在 agentcore status 输出中查找形如 arn:aws:bedrock-agentcore:…:runtime/… 的字段）：

```
agentcore status

export AGENT_ARN="<上述输出中的 Agent ARN>"
```

### 步骤 6：验证部署

用测试 Cognito 客户端获取一个 Bearer Token，然后向 AgentCore Runtime 的调用端点发送 MCP initialize 请求。

```
export BEARER_TOKEN=$(aws cognito-idp initiate-auth \
  --client-id "${CLIENT_ID}" \
  --auth-flow USER_PASSWORD_AUTH \
  --auth-parameters USERNAME=${COGNITO_USERNAME},PASSWORD=${COGNITO_PASSWORD} \
  --region ${AWS_REGION} | jq -r '.AuthenticationResult.AccessToken')
ENCODED_ARN=$(echo -n ${AGENT_ARN} | jq -sRr '@uri')
MCP_ENDPOINT="https://bedrock-agentcore.${AWS_REGION}.amazonaws.com/runtimes/${ENCODED_ARN}/invocations?qualifier=DEFAULT"
curl -X POST "${MCP_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer ${BEARER_TOKEN}" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'
```

预期返回如下JSON响应：

```
data: {"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2024-11-05","capabilities":{"experimental":{},"prompts":{"listChanged":true},"resources":{"subscribe":false,"listChanged":true},"tools":{"listChanged":true}},"serverInfo":{"name":"billing-cost-management-mcp","version":"2.14.1"},"instructions":"AWS Billing and Cost Management MCP Server - Provides AWS cost optimization tools and prompts through MCP.\n\nWhen using these tools, always:\n1. Use UnblendedCost metric by default\n2. Exclude Credits and Refunds by default\n3. Be concise and focus on essential information first\n4. For optimization queries, focus on top 2-3 highest impact recommendations\n\nAvailable components:\n\nTOOLS:\n- cost-explorer: Historical cost and usage data with flexible filtering\n- compute-optimizer: Performance optimization recommendations to identify under provisioned AWS compute resources like EC2, Lambda, ASG, RDS, ECS\n- cost-optimization: Cost optimization recommendations across AWS services\n- storage-lens: Query S3 Storage Lens metrics data using Athena SQL\n- athena-cur: Query Cost and Usage Report data through Athena\n- pricing: Access AWS service pricing information\n- bcm-pricing-calc: Work with workload estimates from AWS Billing and Cost Management Pricing Calculator\n- budget: Retrieve AWS budget information\n- cost-anomaly: Identify cost anomalies in AWS accounts\n- cost-comparison: Compare costs between time periods\n- free-tier-usage: Monitor AWS Free Tier usage\n- rec-details: Get enhanced cost optimization recommendations\n- ri-performance: Analyze Reserved Instance coverage and utilization\n- sp-performance: Analyze Savings Plans coverage and utilization\n- session-sql: Execute SQL queries on the session database\n- billing-conductor: AWS Billing Conductor tools for AWS Proforma billing (billing groups and associated accounts and cost reports, pricing rules/plans, custom line items)\n\nPROMPTS:\n- savings_plans: Analyzes AWS usage and identifies opportunities for Savings Plans purchases\n- graviton_migration: Analyzes EC2 instances and identifies opportunities to migrate to AWS Graviton processors\n\nFor financial analysis:\n1. Start with a high-level view of costs using cost-explorer with SERVICE dimension\n2. Look for cost optimization opportunities with compute-optimizer or cost-optimization\n3. For S3-specific optimizations, use storage-lens\n4. For budget monitoring, use the budget tool\n5. For anomaly detection, use the cost-anomaly tool\n\nFor optimization recommendations:\n1. Use cost-optimization to get recommendations for cost optimization across services. This includes including Idle resources, Rightsizing for savings, RI/SP.\n2. Use rec-details for enhanced recommendation analysis for specific cost optimization recommendations.\n3. Use compute-optimizer to get performance optimization recommendations for compute resources such as EC2, ECS, EBS, Lambda, RDS, ASG.\n4. Use ri-performance and sp-performance to analyze purchase programs\n\nFor multi-account environments:\n- Include the LINKED_ACCOUNT dimension in cost_explorer queries\n- Specify accountIds parameter for compute-optimizer and cost-optimization tools\n"}}
```

Bearer Token 默认有效期 1 小时，过期后重新获取即可。

### 步骤 7： MCP 集成

先导出 Amazon Quick 控制台需要的信息：

```
ENCODED_ARN=$(echo -n ${AGENT_ARN} | jq -sRr '@uri')
MCP_SERVER_ENDPOINT="https://bedrock-agentcore.${AWS_REGION}.amazonaws.com/runtimes/${ENCODED_ARN}/invocations"
TOKEN_URL="https://${COGNITO_DOMAIN_PREFIX}.auth.${AWS_REGION}.amazoncognito.com/oauth2/token"
echo "MCP Server 端点: ${MCP_SERVER_ENDPOINT}"
echo "Client ID:       ${QS_M2M_CLIENT_ID}"
echo "Client Secret:   ${QS_M2M_CLIENT_SECRET}"
echo "Token URL:       ${TOKEN_URL}"
```

在 Amazon Quick 控制台完成 MCP Actions 集成：

1\. 登录 Amazon Quick 控制台（需要 Author Pro 角色）。

2\. 在左侧导航栏选择 Connectors。

3\. 切换到 Create for your team 标签页。

4\. 找到并选择 Model Context Protocol (MCP)。

5\. 在 Create Integration 页面填写：

*   *   Name：自定义集成名称。
    *   Description（可选）：集成用途描述。
    *   MCP server endpoint：上一步输出的 MCP\_SERVER\_ENDPOINT。

6\. 点击 Next。

7\. 认证方式选择 Service authentication，填写：

*   *   Client ID：${QS\_M2M\_CLIENT\_ID}
    *   Client Secret：${QS\_M2M\_CLIENT\_SECRET}
    *   Token URL：${TOKEN\_URL}

8\. 点击 Create and continue。

9\. Review actions for Model Context Protocol一开始只有listTools的Action，点击”Next”。

10\. 先不共享给其他用户，点击 “Publish”。

成功之后再查看该MCP，可以看到25个Actions都已经被发现：

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/28/based-on-amazon-quick-amazon-bedrock-agentcore-2.jpg)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/28/based-on-amazon-quick-amazon-bedrock-agentcore-2.jpg)

\[图2：MCP工具列表\]

## **五、测试**

在 Amazon Quick 控制台打开 Chat Agents，创建 Custom Chat Agent 并绑定 Billing MCP：

1.登录 Amazon Quick 控制台

2\. 左侧导航栏 → Chat agents → Create chat agent

3\. 在 Agent Creator 中可以选 Skip 直接进入 builder 模式

4\. 填写 Agent 名称（如 “AWS Cost Analysis Expert”）和描述（如”An AWS cost analysis expert that helps you understand and optimize your AWS spending using AWS Billing and Cost Management tools. Provides detailed cost breakdowns, trends, and recommendations.”）

5\. 在 AGENT PERSONA 中配置角色和提示词，跨账户查询需要指定查询规则。将下面的提示词贴入 Agent Persona 输入框，输入后可以通过右下角的 Refine 图标 → Polish instructions for clarity 进行润色。更完整的提示词可以参考附录：

```
You are an AWS Cost Analysis Expert with deep expertise in AWS Billing and Cost Management. Your purpose is to help users understand their AWS spending patterns, identify cost optimization opportunities, and provide actionable recommendations. When presenting cost data, always organize information clearly with breakdowns by service, time period, and usage patterns. Highlight unusual spending spikes or trends that warrant attention. When providing optimization recommendations, explain the potential savings, implementation complexity, and any trade-offs. Use clear visualizations and summaries to make complex billing data accessible and actionable.
Cross-Account Query Considerations:
When target_account_id is specified:
- Do NOT use LINKED_ACCOUNT dimension to filter the same account ID
- The target_account_id parameter already scopes the query to that specific account
- Adding a LINKED_ACCOUNT filter for the same account will return empty results if that account is the management/payer account (management accounts do not appear in the LINKED_ACCOUNT dimension)
```

6\. 在 Actions 部分选择 Link，选中步骤7创建的Billing MCP Connector，勾选需要暴露给 Agent 的 actions（25 个 billing tools）

7\. 点击 Update preview 然后Launch chat agent 发布

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/28/based-on-amazon-quick-amazon-bedrock-agentcore-3.jpg)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/28/based-on-amazon-quick-amazon-bedrock-agentcore-3.jpg)

\[图3：创建自定义Chat Agent\]

使用自然语言提问，Chat Agent 会依据您的提问自动选择合适的 MCP 工具，调用 AWS Cost Explorer 等 API，并以自然语言回答您。如果跳出Requesting Action review，点击Allow同意进行操作，以下问题供参考：

*   帮我查看本账户和账户123456789012上个月的 AWS 总费用，按服务分组显示
*   我的 AWS 账户有哪些成本异常？
*   预测下个月的 AWS 费用
*   有哪些 EC2 实例可以进行成本优化？
*   分析我的 Reserved Instance 覆盖率

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/28/based-on-amazon-quick-amazon-bedrock-agentcore-4.jpg)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/28/based-on-amazon-quick-amazon-bedrock-agentcore-4.jpg)

\[图4：自然语言查询示例\]

使用过程中有几点需要注意：

*   单次 MCP 操作有 60 秒超时限制。
*   工具列表在首次注册后是静态的；更新 MCP Server 的工具集合后，需要在控制台删除集成并重新创建，Amazon Quick 才能感知到新工具。

## **六、日常运维**

部署完成后，常用的运维操作包括：

```
# 查看部署状态
agentcore status

# 流式查看 agent 运行日志
agentcore logs

# 也可以直接使用 AWS CLI 查看 CloudWatch 日志
aws logs tail /aws/bedrock-agentcore/runtimes/<your-agent-id>-DEFAULT \
  --log-stream-name-prefix "$(date +%Y/%m/%d)/[runtime-logs]" \
  --since 1h --region ${AWS_REGION}

# 查看最近的 traces
agentcore traces list

# 修改源码后重新部署（AgentCore 会重新构建容器镜像）
agentcore deploy -y
```

迭代源码时，只需重新执行 agentcore deploy -y，CLI 会自动重新构建镜像并更新 AgentCore Runtime。

## **七、清理资源**

如果要清理资源，请按创建的反向顺序删除以下资源。

1\. 删除 AgentCore Runtime 及相关资源：

```
agentcore remove all
agentcore deploy -y
```

agentcore remove all 仅从本地配置中移除 agent；后续的 agentcore deploy 会据此对比并销毁云端对应的 AWS 资源。两条命令必须按顺序执行，缺一不可。

2\. 在 Amazon Quick 控制台删除 MCP Actions 集成（Connectors > 选中对应集成 > Delete）。

3\. 删除 Amazon Cognito custom domain 和 user pool：

```
aws cognito-idp delete-user-pool-domain \
  --user-pool-id ${POOL_ID} --domain ${COGNITO_DOMAIN_PREFIX} --region ${AWS_REGION}
aws cognito-idp delete-user-pool --user-pool-id ${POOL_ID} --region ${AWS_REGION}
```

4\. 删除 IAM 执行角色及其 inline 策略：

```
for P in AgentCoreBasePolicy BillingMCPServerPolicy CrossAccountAssumeRolePolicy; do
  aws iam delete-role-policy --role-name BillingMCPServerAgentCoreRole --policy-name $P 2>/dev/null || true
done
aws iam delete-role --role-name BillingMCPServerAgentCoreRole
```

5\. 在每个目标账号中以同样方式删除 BillingMCPCrossAccountRole 及其 inline 策略。

6\. （可选）删除 Amazon CloudWatch 日志组 /aws/bedrock-agentcore/runtimes/<your-agent-id>-DEFAULT 以清理历史日志。

## **八、总结**

在本文中，我们展示了如何把 Billing and Cost Management MCP Server 部署到 Amazon Bedrock AgentCore Runtime，使用 Amazon Cognito OAuth 2.0 进行保护，并通过服务认证（2LO）将其接入 Amazon Quick Chat Agent。还展示了一种轻量的跨账号模式，让单一部署能够回答多个 AWS 账号的账单问题。这一思路并不局限于账单数据。任何使用 Streamable HTTP 传输的 MCP Server 都可以按相同的授权形式部署到 Amazon Bedrock AgentCore Runtime，并在 Amazon Quick 中以对话方式呈现。

## **九、参考文档**

*   [billing-cost-management-mcp-server 上游源码](https://github.com/awslabs/mcp/tree/main/src/billing-cost-management-mcp-server)
*   [AgentCore CLI GitHub](https://github.com/aws/agentcore-cli)
*   [Get started with the AgentCore CLI](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-get-started-cli.html)
*   [Deploy MCP servers in AgentCore Runtime](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-mcp.html)
*   [MCP protocol contract](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-mcp-protocol-contract.html)
*   [IAM Permissions for AgentCore Runtime](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-permissions.html)
*   [Authenticate and authorize with Inbound Auth and Outbound Auth](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-oauth.html)
*   [Amazon Cognito as identity provider](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity-idp-cognito.html)
*   [Amazon Quick MCP integration](https://docs.aws.amazon.com/quick/latest/userguide/mcp-integration.html)
*   [Connect Amazon Quick to enterprise apps and agents with MCP](https://aws.amazon.com/blogs/machine-learning/connect-amazon-quick-suite-to-enterprise-apps-and-agents-with-mcp/)

## **十、附录**

Chat Agent 提示词：

```
AWS Cost Analysis Specialist Agent
Core Identity
You are an AWS Cost Analysis Specialist with deep expertise in AWS Billing and Cost Management. Your purpose is to help users understand their AWS spending patterns, identify cost drivers, and provide actionable optimization recommendations.
Cost Data Presentation Standards
When presenting cost data, you MUST:
1.Organize information clearly with specific dollar amounts, time periods, and service breakdowns
2.Preserve original precision - Display cost data exactly as returned by the API without rounding
3.Proactively highlight unusual spending patterns, cost spikes, or optimization opportunities
4.Use visualizations and comparisons to make cost data easy to understand
Cost Data Query Principles
1. Complete Data First (Default Behavior)
ALWAYS retrieve complete data for all services by default when users request cost or billing information.
Do NOT proactively add filters for SERVICE, LINKED_ACCOUNT, or other dimensions to narrow the query scope unless explicitly requested.
Add filters ONLY when the user explicitly specifies:
• Service names (e.g., "show me EC2 costs")
• Account scope (e.g., "costs for account {US_BANK_ACCOUNT_NUMBER}")
• Region constraints (e.g., "us-east-1 spending")
• Tag filters (e.g., "costs tagged as Production")
• Any other specific filtering criteria
Query Behavior Examples:
User RequestCorrect BehaviorIncorrect Behavior"Show me last month's costs"No filters; group by SERVICE and return all service costs❌ Adding SERVICE filter to limit scope"Analyze my costs"Return complete data across all services❌ Guessing which services matter"Show me EC2 and S3 costs"Add SERVICE filter limited to EC2 and S3❌ Returning all services"What did I spend on Lambda?"Add SERVICE filter for AWS Lambda only❌ Including other services
2. Preserve Numerical Precision
ALWAYS display cost amounts with the original precision returned by the API. Do NOT round, truncate, or modify monetary values. Accuracy in financial data is critical.
3. Cross-Account Query Considerations
When target_account_id is specified:
• Do NOT use LINKED_ACCOUNT dimension to filter the same account ID
• The target_account_id parameter already scopes the query to that specific account
• Adding a LINKED_ACCOUNT filter for the same account will return empty results if that account is the management/payer account (management accounts do not appear in the LINKED_ACCOUNT dimension)
4. Retrieve Aggregate Billing Data from API
For annual or monthly billing totals, ALWAYS retrieve data directly from the API. Do NOT calculate totals by summing individual service costs.
Recommendation Guidelines
When providing cost optimization recommendations, you MUST:
1.Explain the potential savings impact - Quantify expected cost reductions when possible
2.Assess implementation complexity - Indicate whether the change is simple, moderate, or complex
3.Provide actionable next steps - Give users clear guidance on how to implement recommendations
4.Prioritize high-impact, low-effort optimizations - Help users achieve quick wins
Communication Standards
• Tone: Professional, analytical, and helpful. Use clear explanations when discussing financial data.
• Response Length: Provide comprehensive analysis with sufficient detail to be actionable, but remain concise and focused on key insights. Avoid unnecessary verbosity.
• Clarity: Break down complex cost structures into understandable components. Use examples and comparisons to illustrate points.
• Output Style: Always provide a summary overview first, followed by detailed data. Use charts or structured formats to present cost breakdowns. Highlight key insights and anomalies.
• Language Flexibility: Respond in the user's preferred language. If the user communicates in Chinese, provide responses in Chinese while maintaining the same analytical rigor and structure.
```

## **十一、相关链接**

**➡️ 下一步行动：**

**相关产品：**

*   [Amazon Cognito](https://aws.amazon.com/cn/cognito/?p=bl_pr_cognito_l=1) — 安全注册和登录
*   [Amazon Bedrock](https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=2) — 用于构建生成式人工智能应用程序和代理的端到端平台
*   [Amazon Bedrock AgentCore](https://aws.amazon.com/cn/bedrock/agentcore/?p=bl_pr_bedrock-agentcore_l=3) — 加快代理投入生产的速度
*   [Amazon IAM](https://aws.amazon.com/cn/iam/?p=bl_pr_iam_l=4) — 身份管理和访问权限
*   [Amazon EC2](https://aws.amazon.com/cn/ec2/?p=bl_pr_ec2_l=5) — 安全且可调整大小的计算容量

**相关文章：**

*   [基于 Amazon Bedrock AgentCore Runtime 部署 Apache Doris MCP Server为 Quick Suite 等 AI 客户端提供原生数据分析能力](https://aws.amazon.com/cn/blogs/china/runtime-deploy-apache-doris-mcp-server-quick-suite-ai-analytics/?p=bl_ar_l=1)
*   [自己的工具自己控：MCP Server、Amazon Bedrock AgentCore、Quick Suite集成指南](https://aws.amazon.com/cn/blogs/china/tool-mcp-server-amazon-bedrock-agentcore-quick/?p=bl_ar_l=2)
*   [Amazon Bedrock模型推理的Serverless 异步架构 – 处理在线多模态高负载案例](https://aws.amazon.com/cn/blogs/china/amazon-bedrock-model-inference-serverless-architecture-case-study/?p=bl_ar_l=3)
*   [使用Amazon Bedrock + 自建ECS Docker Sandbox实现Agent 程序化工具调用Programmatic Tool Calling](https://aws.amazon.com/cn/blogs/china/programmatic-tool-calling-agent-using-bedrock-and-ecs-docker-sandbox/?p=bl_ar_l=4)
*   [从数据库连接到自然语言查询：Amazon QuickSuite 数据分析全流程实践](https://aws.amazon.com/cn/blogs/china/amazon-quicksuite-data-analysis-end-to-end-practice/?p=bl_ar_l=5)

\*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

* * *

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/summit-tag3.png)

## 亚马逊云科技中国峰会

开发者挑战赛现场开启，基于真实业务场景亲手构建 Agent。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/25/yuyuecanhui.png)](https://aws.amazon.com/cn/events/summits/shanghai/?ectrk=jyLXNovBYB51qgzUEipIpZcxlfE5%2Bs7NfDTnZwR7hFYtQmPUSToTuN%2FZO5doh20ZJ%2FloW6Rom0l3P4LLcoyUPA%3D%3D&sc_icampaign=glb-summit-blog-p2&sc_ichannel=ha&sc_iplace=blog&trk=ab30be54-aedd-480a-9364-ab0bf98e982d)

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/14/2026_Summits_Commercial_Banner_1440x657.png)
