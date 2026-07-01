# 用 Amazon Bedrock AgentCore Payment 构建自主支付 AI Agent：x402 协议实战

## Ch11.005 用 Amazon Bedrock AgentCore Payment 构建自主支付 AI Agent：x402 协议实战

> 📊 Level ⭐⭐ | 52.5KB | `entities/bedrock-agentcore-payment-x402-agent.md`

# 用 Amazon Bedrock AgentCore Payment 构建自主支付 AI Agent：x402 协议实战

> 实战教程：使用 Bedrock AgentCore Payment 构建支持 x402 协议的自主支付 AI Agent，包含完整代码示例。

## 核心内容

# 用 Amazon Bedrock AgentCore Payment 构建自主支付 AI Agent: x402 协议实战

摘要：本文基于 AWS Agentcore和开源项目 sample-agentcore-cloudfront-x402-payments，完整记录了使用 Amazon Bedrock AgentCore 构建一个能自主发现付费服务、执行链上支付并获取内容的 AI Agent 的实践过程。文章以 AgentCore 的三大核心能力（Runtime、Gateway、Payments）为主线，结合 x402 协议的支付流程，展示 Agent 如何在不接触私钥的前提下完成"请求 → 402 挑战 → 链上支付 → 内容交付"的完整闭环。

**目录**

02 [二、项目介绍与整体架构](#section2)

04 [四、部署概要](#section4)

05 [五、结语](#section5)

* * *

## **一、背景：为什么 Agent 需要支付能力**

AI Agent 正从"对话助手"演进为"自主执行者"——它需要实时购买数据、调用付费API、代用户完成交易。但传统支付体系是为人类设计的：需要身份验证、手动确认、最低手续费让微支付不可行，预置 API Key 的方式更无法应对动态发现数千种服务的场景。

Agent 需要的是一种原生的、可编程的支付能力：在预授权范围内自主交易，有预算治理和可观测性，且不中断推理循环。Visa、Mastercard 等传统巨头已在布局 Agent支付方案。

2026 年 5 月，AWS 发布了 [Amazon Bedrock AgentCore Payments](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/payments.html)（Preview），为 AI Agent 提供了原生的托管支付能力。让 Agent真正具备"能做事、能花钱"的闭环能力。本文通过一个完整的 PoC 项目，展示如何将 AgentCore Payments 与 x402 协议结合使用。

## **二、项目介绍与整体架构**

### 2.1 开源项目简介

本文基于 AWS 官方开源项目 [sample-agentcore-cloudfront-x402-payments](https://github.com/aws-samples/sample-agentcore-cloudfront-x402-payments) 展开。该项目演示了一个 HTTP 402 付费内容门禁系统：

*   Payer（付款方）：运行在 AgentCore Runtime 上的 AI Agent，通过 AgentCore Payments 执行支付
*   Seller（卖家）：CloudFront + Lambda@Edge 构建的 x402 付费内容网关
*   Web UI：React 前端，提供 3 步交互界面（请求内容 → 确认支付 → 查看内容）

### 2.2 整体架构

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/22/amazon-bedrock-agentcore-payment-build-payment-ai-1.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/22/amazon-bedrock-agentcore-payment-build-payment-ai-1.png)

\[图1\]

### 2.3 业务模块组成

项目由三个独立部署的模块组成：

模块

职责

部署方式

seller-infrastructure

付费内容网关：接收请求 → 返回 402 → 验证支付 → 交付内容

CloudFront + Lambda@Edge + S3（us-east-1）

payer-infrastructure

付款方基础设施：IAM 角色、Agent 运行时、支付配置

AgentCore Runtime + Payments + Gateway

web-ui-infrastructure

用户交互界面：浏览器 → API Gateway → Lambda → AgentCore

CloudFront + S3 + API Gateway + Lambda

用户通过 Web UI 发起请求，请求经 API Gateway 转发到 AgentCore Runtime 中的 Agent。Agent 自主完成"发现服务 → 请求内容 → 处理支付 → 获取内容"的完整流程。

## **三、系统架构：支付流程与技术实现**

### 3.1 支付流程总览

下面的序列图展示了一次完整支付交易的全貌（6 个泳道、12 步消息）：

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/22/amazon-bedrock-agentcore-payment-build-payment-ai-2.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/22/amazon-bedrock-agentcore-payment-build-payment-ai-2.png)

\[图2\]

接下来我们按三个阶段逐一展开。

### 3.2 阶段一：发起请求 & 402 挑战

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/22/amazon-bedrock-agentcore-payment-build-payment-ai-3.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/22/amazon-bedrock-agentcore-payment-build-payment-ai-3.png)

\[图3\]

**技术要点**

1\. AgentCore Gateway 的 MCP 工具发现：Agent 不硬编码服务列表，而是通过 Gateway 的 MCP 协议动态发现。Gateway 将 OpenAPI spec 转换为标准 MCP 工具，Agent 可以获取每个服务的价格、网络、资产等元数据。

2\. Lambda@Edge 的 402 响应：当请求不携带 X-PAYMENT-SIGNATURE header 时，Lambda@Edge 根据路径匹配定价配置，返回标准 x402 v2 格式的支付要求（包含 scheme、network、amount、payTo、asset 等字段）。

3\. AgentCore Runtime 的会话管理：每次 InvokeAgentRuntime 调用通过 runtimeSessionId 维持上下文，Agent 在后续步骤中能记住 402 返回的 x402\_payload。

对应代码——request\_content 工具检测 402 并提取支付要求：

```
@tool
def request_content(url: str) -> dict:
    """请求内容。如果返回 402，提取 x402_payload 供 process_payment 使用。"""
    full_url = f"{config.seller_api_url}{url}"

    with httpx.Client(timeout=30.0) as client:
        response = client.get(full_url, headers={"Accept": "application/json"})

        if response.status_code == 402:
            # x402 v2: 从 X-PAYMENT-REQUIRED header 解码
            header_value = response.headers.get("x-payment-required")
            x402_data = json.loads(base64.b64decode(header_value))
            return {
                "http_status": 402,
                "x402_payload": x402_data["accepts"][0],  # 传给 process_payment
                "x402_version": x402_data.get("x402Version", 2),
            }

        if response.status_code == 200:
            return {"http_status": 200, "data": response.json()}
```

### 3.3 阶段二：服务端签名（信任边界）

这是整个流程中最敏感的环节——涉及私钥操作，但 Agent 代码完全不参与：

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/22/amazon-bedrock-agentcore-payment-build-payment-ai-4.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/22/amazon-bedrock-agentcore-payment-build-payment-ai-4.png)

\[图4\]

**技术要点**

1\. 4 角色 IAM 最小权限模型：Agent 只能 AssumeRole 到 ProcessPaymentRole（只有 bedrock-agentcore:ProcessPayment 权限），不能创建 session、instrument 或直接访问凭证。

2\. AgentCore Payments 的预算控制：ProcessPayment 调用时，服务端首先校验 session 的 maxSpendAmount。如果累计花费超过预算，直接返回 REJECTED，不会到达 CDP。

3\. EIP-3009 签名：这是 USDC 合约原生支持的"无 gas 授权转账"标准。签名后生成的 authorization 包含 from、to、value、validAfter、validBefore、nonce 等字段，后续由 Facilitator 在链上执行。

4\. proof 不进入 LLM 上下文：签名结果缓存在 Agent 的模块级变量中，不会作为对话内容传给 LLM，避免敏感数据泄露。

对应代码——process\_payment 工具：

```
@tool
def process_payment(x402_payload: dict, x402_version: int = 1) -> dict:
    """执行 x402 支付。把 Seller 返回的 x402_payload 原样传给 AgentCore Payments。"""
    dp_client = _get_dp_client()  # 通过 STS AssumeRole 获取临时凭证

    response = dp_client.process_payment(
        userId=config.user_id,
        paymentManagerArn=config.payment_manager_arn,
        paymentSessionId=config.payment_session_id,
        paymentInstrumentId=config.payment_instrument_id,
        paymentType="CRYPTO_X402",
        paymentInput={
            "cryptoX402": {
                "version": str(x402_version),
                "payload": x402_payload,  # 原样传递，不做任何解析
            }
        },
        clientToken=str(uuid.uuid4()),  # 幂等 token
    )

    # 缓存 proof 供下一步使用（不进入 LLM 上下文）
    if response.get("status") == "PROOF_GENERATED":
        _last_payment_context["proof"] = response["paymentOutput"]["cryptoX402"]
        _last_payment_context["x402_payload"] = x402_payload

    return response
```

### 3.4 阶段三：结算 & 内容交付

Agent 带着 payment proof 重试请求，Seller 验证签名并在链上结算：

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/22/amazon-bedrock-agentcore-payment-build-payment-ai-5.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/22/amazon-bedrock-agentcore-payment-build-payment-ai-5.png)

\[图5\]

**3.4.1 技术要点**

1\. x402 Facilitator 的角色：Facilitator（x402.org）是一个公共服务，负责验证 EIP-3009 签名的有效性并在链上执行 transferWithAuthorization 调用。Seller 不需要自己跟区块链交互。

2\. Lambda@Edge 的本地校验：在调用 Facilitator 之前，Lambda@Edge 先做本地校验（payload 结构、时间窗口、金额匹配、收款地址匹配），快速拒绝明显无效的请求。

3\. 指数退避重试：链上交易需要约 2 秒出块。Agent 的 request\_content\_with\_payment 工具内置了指数退避重试逻辑——如果 Seller 仍返回 402（说明链上还没确认），等待后重试。

4\. 结算证明：成功后 Seller 在 X-PAYMENT-RESPONSE header 中返回 Base64 编码的结算信息（包含 txHash），Agent 可以提供给用户在区块浏览器上验证。

对应代码——request\_content\_with\_payment 工具（带指数退避）：

```
@tool
def request_content_with_payment(url: str) -> dict:
    """带 payment proof 重试请求。自动构造 x402 header 并指数退避重试。"""
    ctx = get_last_payment_context()
    proof = ctx["proof"]

    # 构造 x402 v2 payment header
    header_obj = {
        "x402Version": 2,
        "resource": ctx["x402_payload"].get("resource", ""),
        "accepted": ctx["x402_payload"],
        "payload": proof.get("payload", proof),
    }
    encoded_header = base64.b64encode(json.dumps(header_obj).encode()).decode()

    # 指数退避重试（等待链上结算）
    max_attempts = 6
    with httpx.Client(timeout=30.0) as client:
        for attempt in range(1, max_attempts + 1):
            response = client.get(
                f"{config.seller_api_url}{url}",
                headers={"PAYMENT-SIGNATURE": encoded_header},
            )
            if response.status_code != 402:
                break
            time.sleep(2 * attempt)  # 2s, 4s, 6s...

    if response.status_code == 200:
        settlement = parse_settlement_header(response)
        return {"http_status": 200, "data": response.json(), "settlement": settlement}
```

### 3.5 图表与 Web UI 操作的对应关系

阶段

序列图

对应 Web UI 操作

前置依赖

阶段一

3.2 发起请求 & 402 挑战

Request Content 按钮

无

阶段二

3.3 服务端签名

Confirm Payment 按钮（前半）

依赖阶段一的 x402\_payload

阶段三

3.4 结算 & 内容交付

Confirm Payment 按钮（后半）

依赖阶段二的 proof

—

无新后端交互

View Purchase Record 按钮

展示已获取的内容 + txHash

### 3.6 AgentCore 三大组件总结

在上述三个阶段中，AgentCore 的三个组件各司其职：

组件

在流程中的角色

核心能力

Runtime

阶段一~三全程：托管 Agent 容器，维持会话上下文，管理生命周期

容器化部署、会话管理、自动扩缩、networkMode: PUBLIC 外网访问

Gateway

阶段一（可选）：将 OpenAPI spec 转换为 MCP 工具供 Agent 发现

MCP 协议、OpenAPI 转换、工具路由、认证注入

Payments

阶段二核心：预算校验 + 服务端签名，Agent 永不接触私钥

ProcessPayment API、session 预算控制、CDP 凭证托管、审计追踪

### 3.7 x402 协议实现要点

**3.7.1 v1 vs v2 的兼容处理**

本项目同时支持 x402 v1 和 v2 协议：

方面

v1

v2

支付要求位置

响应 body

PAYMENT-REQUIRED header（Base64 JSON）

支付 proof header

X-PAYMENT

PAYMENT-SIGNATURE

proof 对象字段

x402Version, scheme, network, payload

x402Version, resource, accepted, payload, extension

merchant payload 处理

完整透传

剥除 description, mimeType, resource, outputSchema

Agent（content.py）和 Lambda@Edge（payment-verifier.js）都实现了双向兼容：接收时两种 header 都尝试解析，发送时按 x402Version 字段决定格式。

**3.7.2 防重放 & 防篡改机制**

*   nonce：32 字节随机数（0x + 64 hex），每次支付唯一，防止重放攻击
*   时间窗口：validAfter / validBefore 必须包含当前时间 + 6 秒（留出出块时间）
*   地址校验：payTo 小写比较，防止大小写欺骗
*   金额校验：value >= amount 用 BigInt 比较，避免浮点误差
*   签名长度：至少 130 hex（EOA 签名），智能钱包签名可更长

**3.7.3 为什么 POST 收到 402 后要用 GET 重新获取支付要求**

```
if method == "POST" and x402_payload:
    # 用 GET 重新获取规范化的 payment requirement
    get_resp = client.get(full_url, ...)
```

原因：x402 Facilitator 在 verify 时会用 GET 重新拉取 payment requirement 作为签名校验的基准。如果 Agent 从 POST 的 402 响应里取 payload 签名，Facilitator 得到的 canonical payload 会不一致，导致校验失败。

## **四、部署概要**

### 4.1 前置条件

工具

版本

用途

AWS CLI

≥ 2.15

AWS 资源操作

boto3

≥ 1.43.0

AgentCore API

Docker

≥ 20

构建 Agent 镜像

Node.js

≥ 18

Lambda@Edge

Python

3.12

Agent 代码

### 4.2 准备 Coinbase CDP 凭证 + 钱包

整个 demo 涉及 2 个钱包：付款钱包（Agent 用，部署时由 AgentCore Payments 自动创建）和收款钱包（需要手动创建）。两者都通过 Coinbase Developer Platform (CDP) 管理。

demo 跑起来需要的 CDP 资产： – 1 套 API Key（API Key ID + API Key Secret） – 1 个 Wallet Secret – 1 个 EVM EOA 收款钱包地址

**4.2.1 注册 CDP 账号**

打开 [https://portal.cdp.coinbase.com](https://portal.cdp.coinbase.com/) ，邮箱注册，测试网阶段不需要 KYC。

**4.2.2 创建 API Key**

1\. 左侧 Dashboard → 蓝色按钮 Create API Key

2\. 填名字（例如 x402-demo-agentcore），权限选 Full access

3\. 创建后下载 JSON 文件（含 id 和 privateKey）

⚠️ Secret 只显示一次，下载的 JSON 文件先保存到本地安全位置。

**4.2.3 生成 Wallet Secret**

1.  左侧 Wallets → Server Wallet
2.  顶部 Accounts tab 下有 Wallet Secret 区块
3.  点 Generate new secret，弹窗显示 secret，立刻保存

**4.2.4 创建收款钱包（EVM EOA）**

CDP Portal 没有 GUI 创建账户功能，需要用 CLI：

```
npm install -g @coinbase/cdp-cli
cdp env live --key-file ~/Downloads/cdp_api_key.json
cdp env live --wallet-secret-file ~/cdp-wallet-secret.txt

# 创建收款钱包（参数格式是 name=xxx，不是 --name xxx）
cdp evm accounts create name=x402-demo-seller
# 输出中的 address 字段就是收款钱包地址
```

⚠️ 不要选 Smart Account —— x402 协议的 EIP-3009 要求收款方是 EOA。

**4.2.5 启用 Delegated Signing**

在 CDP Portal 中：左侧 Embedded Wallets → Policies 标签 → 打开 Delegated Signing 开关。

**4.2.6 付款钱包的创建与授权**

付款钱包在部署步骤 2 中由 CreatePaymentInstrument API 自动创建，返回： – walletAddress：付款钱包地址 – redirectUrl：WalletHub 授权链接

用户需要访问 redirectUrl，用注册邮箱登录后： 1. 在 Permissions 区域点击 Grant permission，授权 Agent 代签 2. 在 Balances 区域充值 USDC，或通过 https://faucet.circle.com/ 领取测试网 USDC（选 Base Sepolia 网络）

**4.2.7 两个钱包的区别**

付款钱包（Payer）

收款钱包（Seller）

创建方式

AgentCore Payments 自动创建

开发者用 CDP CLI 手动创建

类型

Embedded Wallet

Server Wallet (EOA)

谁控制

AgentCore 代签（需用户授权）

开发者完全控制

用途

Agent 付款

接收付款

配置位置

AgentCore Payments 环境变量

seller-infrastructure/.env 的 PAYMENT\_RECIPIENT\_ADDRESS

### 4.3 部署步骤

**步骤 1：部署卖家侧（us-east-1）**

这一步创建： – S3 内容桶（存放付费内容） – Lambda@Edge 函数（x402 支付验证器，Node.js 20） – IAM 执行角色（Lambda + edgelambda 双信任） – CloudFront OAI + 桶策略 – CloudFront 缓存策略（禁缓存 + 转发 x402 header） – CloudFront 分发（关联 Lambda@Edge 为 origin-request 触发器）

关键命令：

```
# 上传内容（key 不带 .json 后缀，Lambda@Edge 按路径匹配）
aws s3 cp content/research-report.json s3://x402-content-seller/research-report

# 打包 Lambda@Edge（不要打包 node_modules，运行时自带 SDK v3）
zip -r payment-verifier.zip payment-verifier.js content-config.js types.js deploy-config.json

# deploy-config.json 中注入收款钱包地址
echo '{ "payTo": "0x你的收款钱包地址" }' > deploy-config.json
```

⚠️ Lambda@Edge 只能部署在 us-east-1，但会被 CloudFront 复制到所有边缘节点。

验证：curl -i https://dXXX.cloudfront.net/api/premium-article 应返回 HTTP 402 + x-payment-required header。

**步骤 2：配置 AgentCore Payments**

这一步创建 5 个资源，形成完整的支付链路：

*   Credential Provider（安全存储 CDP 凭证到 AgentCore Identity）
*   Payment Manager（顶层协调资源，指定授权方式）
*   Payment Connector（关联 CDP 凭证提供者）
*   Payment Instrument（创建付款钱包，返回 walletAddress + redirectUrl）
*   Payment Session（设置预算上限和有效期）

关键代码：

```python
import boto3
ctrl = boto3.client("bedrock-agentcore-control", region_name="us-west-2")
dp = boto3.client("bedrock-agentcore", region_name="us-west-2")

# 1. Credential Provider
provider = ctrl.create_payment_credential_provider(
    name="MyProvider", credentialProviderVendor="CoinbaseCDP",
    providerConfigurationInput={"coinbaseCdpConfiguration": {
        "apiKeyId": "...", "apiKeySecret": "...", "walletSecret": "..."
    }})

# 2. Payment Manager（名称只能用字母数字，不能有连字符）
manager = ctrl.create_payment_manager(
    name="MyManager", authorizerType="AWS_IAM", roleArn="<RetrievalRoleArn>")

# 3. Payment Connector
connector = ctrl.create_payment_connector(
    paymentManagerId=manager["paymentManagerId"], name="CdpConnector",
    type="CoinbaseCDP",
    credentialProviderConfigurations=[{"coinbaseCDP": {"credentialProviderArn": "..."}}])

# 4. Payment Instrument → 用户需访问 redirectUrl 完成授权 + 充值
instrument = dp.create_payment_instrument(
    paymentManagerArn=..., paymentConnectorId=..., userId="test-user",
    paymentInstrumentType="EMBEDDED_CRYPTO_WALLET",
    paymentInstrumentDetails={"embeddedCryptoWallet": {
        "network": "ETHEREUM",
        "linkedAccounts": [{"email": {"emailAddress": "user@example.com"}}]
    }})
# 返回: walletAddress, redirectUrl

# 5. Payment Session（expiryTimeInMinutes 最大 480，currency 只支持 USD）
session = dp.create_payment_session(
    userId="test-user", paymentManagerArn=...,
    limits={"maxSpendAmount": {"value": "100", "currency": "USD"}},
    expiryTimeInMinutes=480)
```

步骤 4 创建完成后，用户必须访问 redirectUrl 在 WalletHub 中完成 Grant permission + 充值 USDC，否则后续 ProcessPayment 会报 "delegation grant not active"。

**步骤 3：创建 IAM 角色**

这一步创建 4 个角色，实现最小权限分离：

角色

权限

信任实体

ProcessPaymentRole

只能 bedrock-agentcore:ProcessPayment

Account root + RuntimeRole

ManagementRole

管理 instrument/session，显式 Deny ProcessPayment

Account root

ResourceRetrievalRole

secretsmanager:GetSecretValue + bedrock-agentcore:\*

bedrock-agentcore.amazonaws.com

AgentRuntimeRole

Bedrock 调用 + ECR 拉取 + AssumeRole 到 ProcessPaymentRole + CloudWatch Logs

bedrock-agentcore.amazonaws.com

ProcessPaymentRole 的信任策略需要同时包含 account root 和 AgentRuntimeRole，后者用于 Agent 在运行时 AssumeRole。

**步骤 4：部署 Agent 到 AgentCore Runtime**

这一步完成： – 创建 ECR 仓库 – 构建 Docker 镜像（Python 3.11 + Strands Agents + FastAPI + Uvicorn） – 推送镜像到 ECR – 创建 AgentCore Runtime（容器模式 + PUBLIC 网络） – 创建 Runtime Endpoint

关键命令：

```bash
aws ecr create-repository --repository-name x402-agent --region us-west-2
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-west-2.amazonaws.com
docker build -t <account>.dkr.ecr.us-west-2.amazonaws.com/x402-agent:latest .
docker push <account>.dkr.ecr.us-west-2.amazonaws.com/x402-agent:latest
ctrl.create_agent_runtime(
    agentRuntimeName="x402PayerAgent",
    roleArn="<AgentRuntimeRoleArn>",
    agentRuntimeArtifact={"containerConfiguration": {"containerUri": "<ECR_URI>"}},
    networkConfiguration={"networkMode": "PUBLIC"},
    environmentVariables={
        "BEDROCK_MODEL_ID": "us.anthropic.claude-sonnet-4-6",
        "MANAGER_ARN": "...", "PAYMENT_SESSION_ID": "...",
        "PAYMENT_INSTRUMENT_ID": "...", "PROCESS_PAYMENT_ROLE_ARN": "...",
        "SELLER_API_URL": "https://dXXX.cloudfront.net",
    },
)
ctrl.create_agent_runtime_endpoint(agentRuntimeId="...", name="default")
```

更新镜像后需要用 update\_agent\_runtime 触发重新拉取，并用 update\_agent\_runtime\_endpoint 指向新版本。

**步骤 5：部署 AgentCore Gateway**

这一步创建： – Gateway（MCP 协议类型） – API Key Credential Provider（Gateway 强制要求，CloudFront 本身不需要认证） – Gateway Target（OpenAPI schema 类型，将 OpenAPI spec 转换为 MCP 工具）

关键代码：

```python
# 1. 创建 Gateway
gw = ctrl.create_gateway(
    name="x402PayerGateway", roleArn="<AgentRuntimeRoleArn>",
    protocolType="MCP",
    protocolConfiguration={"mcp": {"supportedVersions": ["2025-03-26"]}},
    authorizerType="NONE")

# 2. 创建 dummy API Key Provider
cp = ctrl.create_api_key_credential_provider(name="SellerNoAuth", apiKey="dummy")

# 3. 创建 Target（将 OpenAPI spec 中的 server URL 替换为实际 CloudFront URL）
ctrl.create_gateway_target(
    gatewayIdentifier=gw["gatewayId"], name="x402ContentAPI",
    targetConfiguration={"mcp": {"openApiSchema": {"inlinePayload": openapi_spec}}},
    credentialProviderConfigurations=[{
        "credentialProviderType": "API_KEY",
        "credentialProvider": {"apiKeyCredentialProvider": {
            "providerArn": cp["credentialProviderArn"],
            "credentialParameterName": "x-api-key",
            "credentialPrefix": "Bearer", "credentialLocation": "HEADER",
        }}
    }])
```

验证：

```bash
curl -s -X POST "${GATEWAY_URL}" -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
# 预期返回 4 个工具
```

⚠️allowedRequestHeaders 中不要配置 OpenAPI spec 里已定义的 header，否则报冲突错误。

**步骤 6：部署 Web UI**

这一步创建： – API Lambda（Python 3.12，代理浏览器请求到 AgentCore Runtime） – API Gateway REST API（4 条路由：health / info / invoke / wallet） – S3 静态网站桶 + OAI – CloudFront 分发（SPA 路由 + 404/403 → index.html） – 构建并上传 React 前端产物

关键注意事项：

```bash
# 构建前端（.env 中配置 API 端点和 Seller URL）
cd web-ui && npm install && npm run build
aws s3 sync dist/ s3://x402-web-ui-bucket/ --delete
```

API Lambda 必须打包 boto3 ≥ 1.43.0（运行时自带版本不支持 bedrock-agentcore），调用 invoke\_agent\_runtime 时必须传 contentType="application/json" 参数。

## **五、结语**

[Amazon Bedrock AgentCore](https://aws.amazon.com/cn/bedrock/agentcore/) 通过 Runtime + Gateway + Payments 三个组件，为 AI Agent 提供了从部署、工具发现到自主支付的完整基础设施：

*   Runtime 解决了"Agent 在哪里运行"——托管容器、自动扩缩、会话管理
*   Gateway 解决了"Agent 如何发现工具"——MCP 协议、OpenAPI 转换、集中治理
*   Payments 解决了"Agent 如何付费"——服务端签名、预算控制、审计追踪

结合 x402 协议，AI Agent 可以像人类浏览付费网站一样，自主发现、评估、购买和消费付费内容——而开发者只需要关注业务逻辑，不需要自建支付基础设施。

## 深度分析

### 1. 三层架构的解耦价值：为什么支付不能嵌入 Agent 逻辑

从架构层面看，AgentCore Payments 的设计精髓在于将「支付意图」与「支付执行」完全解耦。Agent 代码只负责调用 `process_payment` 并传入 x402 payload，而实际的签名、预算校验、CDP 调用全部由 AWS 托管侧完成。这意味着即使 Agent LLM 被污染或被劫持，攻击者也无法直接操控私钥或绕过预算上限——因为整个支付执行路径不在 Agent 控制范围内。

这是一种「信任边界下沉」的设计哲学：信任根从 LLM 层降到了基础设施层（IAM + AgentCore Payments）。传统应用如果要在 Agent 中实现支付，通常面临「把 API Key 或私钥交给 Agent」的困境，而 AgentCore 通过 STS AssumeRole + 服务端签名彻底绕过了这个困境。

### 2. EIP-3009 在 Web2 场景中的桥接价值

EIP-3009 是以太坊上的一种授权转账标准，允许用户预先签名一个 authorization 对象（包含金额、时间窗口、接收方等），然后由第三方（Facilitator）在链上执行。这个设计在 x402 协议中被巧妙地用来桥接 Web2 请求与 Web3 结算：

*   Agent 在 Web2 侧完成所有逻辑（HTTP 请求、402 处理、重试）
*   支付 proof（EIP-3009 authorization）通过 HTTP header 传递给 Seller
*   Seller 调用 Facilitator 在链上验证并执行 USDC 转账

整个过程中，Agent 完全不需要感知区块链的存在——它只是在处理标准的 HTTP 响应和请求。这种设计让 Web3 支付能力对 Agent 开发者完全透明，极大降低了门槛。

### 3. x402 v1/v2 双版本兼容的工程复杂性

x402 协议经历了从 v1 到 v2 的重大变化，核心差异在于支付要求的传递方式：v1 通过响应 body，v2 通过 Base64 编码的 HTTP header。这个变化带来了双向兼容的工程成本：

*   接收端（Lambda@Edge）需要同时解析 `x-payment-required` header 和 body 中的 payload
*   发送端（Agent）需要根据响应中的 `x402Version` 字段决定构造哪种格式的 proof header
*   Facilitator 在验证时会用 GET 重新拉取 canonical payload，所以 POST 收到的 402 必须用 GET 重新获取

这种复杂性说明支付协议在演进时需要非常谨慎地考虑向后兼容。一旦协议层面有了 Breaking Change，所有接收端都需要同时支持两个版本，增加了维护负担。

### 4. 最小权限 IAM 模型在支付场景中的特殊重要性

在 AgentCore 的 4 角色 IAM 设计中，ProcessPaymentRole 是整个链路中最敏感的权限节点——它只有 `bedrock-agentcore:ProcessPayment` 这一个权限，却能触发实际的资金流动。这意味着即使攻击者通过某种方式让 Agent 执行了额外的 `AssumeRole` 操作，能够拿到的也只是一个「只能调用 ProcessPayment 的临时凭证」，无法进一步横向移动。

此外，ManagementRole 显式 `Deny ProcessPayment` 的设计确保了即使有管理员权限的人也无法通过管理通道执行支付，所有支付必须经过 Payments 服务端的审计追踪。这是一个将安全边界嵌入 IAM 层的纵深防御实践。

### 5. 指数退避重试背后的链上结算不确定性

链上结算的不确定性是这个架构中最脆弱的环节。代码中设置了最大 6 次重试，每次间隔 2*attempt 秒（2s, 4s, 6s...），总共最多等待 42 秒。  但这个数字是经验值而非确定性保证：

*   Base Sepolia 的出块时间理论上约 2 秒，但实际可能因网络状况而波动
*   Facilitator 的验证时间取决于链上拥堵程度，没有硬性 SLA
*   6 次重试后如果仍未确认，Agent 会直接失败，用户需要手动重试

这说明当前的 PoC 实现尚未处理「支付长期处于 Pending 状态」的场景，例如链上拥堵超过几分钟的情况。生产级实现需要引入状态机来跟踪支付生命周期，并在超时时通知用户。

## 实践启示

### 1. 优先使用 Gateway 的 MCP 工具发现而非硬编码服务

在构建付费 Agent 时，不要硬编码服务地址和价格表——这无法应对服务动态上架、下架或价格调整的场景。正确做法是通过 AgentCore Gateway 将 Seller 的 OpenAPI spec 导入，转换为 MCP 工具让 Agent 动态发现。这样 Agent 不仅能知道有哪些服务可用，还能实时获取每个服务的最新定价和网络信息。

### 2. Payment Session 预算上限是 Agent 财务安全的第一道防线

在创建 Payment Session 时，`maxSpendAmount` 设置为 100 USD 是一个合理的上限。但更重要的是，这个上限是在服务端强制校验的——即使 LLM 被恶意 Prompt 注入了「连续发起多次支付」的指令，累计超过 100 USD 后 ProcessPayment 调用会直接返回 REJECTED，不会真正执行扣款。开发者应该在生产环境中根据 Agent 的实际业务场景设置更精确的预算上限，并配合 CloudWatch 告警监控 session 消费曲线。

### 3. Lambda@Edge 的本地校验不能省

虽然 Facilitator 会在链上完整验证 EIP-3009 签名的有效性，但 Lambda@Edge 在调用 Facilitator 之前会先做一轮本地校验（payload 结构、时间窗口、金额匹配、收款地址匹配）。这轮本地校验的价值在于：快速拒绝明显无效的请求，避免产生不必要的链上交易费用（Facilitator 调用的 gas 费用由 Seller 承担）。开发者需要确保本地校验逻辑与链上 Facilitator 的校验逻辑一致，否则可能出现本地通过但链上失败的边界情况。

### 4. 收款钱包必须是 EOA，不能是智能钱包

在创建收款钱包时，必须使用 EVM EOA（Externally Owned Account），不能选择 Smart Account（智能钱包）。原因是 x402 协议的 EIP-3009 授权转账标准要求接收方是 EOA——智能钱包的 fallback 逻辑可能导致授权调用失败。对于使用 Coinbase CDP CLI 创建的 Server Wallet，默认就是 EOA，符合要求。

### 5. Agent 更新镜像后必须触发 Runtime 重新拉取

在部署步骤 4 中，Agent 的 Docker 镜像更新后需要调用 `update_agent_runtime` 触发重新拉取，然后用 `update_agent_runtime_endpoint` 指向新版本。这是一个容易遗漏的运维细节——如果只推送了新镜像但没有调用 update 接口，AgentCore Runtime 仍会运行旧版本，导致新功能或 Bug 修复无法生效。配合 CI/CD 流水线时，应该将镜像推送和 Runtime 更新打包成原子操作。

## 相关实体
- [Firecracker Bedrock Agentcore Multi Tenant](ch04/502-agent.md)
- [Agentcore Payments X402 Agentic Commerce](ch04/502-agent.md)
- [Openclaw Amazon Bedrock Eks Printer Qc](ch11/209-openclaw.md)
- [Aws 一周综述Amazon Bedrock Agentcore 付款适用于 Aws 的 Agent 工具套件等2026 年 5 月 11 日](ch04/502-agent.md)
- [Agentic Payment X402 Bedrock Agentcore](ch04/502-agent.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/bedrock-agentcore-payment-x402-agent.md)
- [Ai Research Assistant From Idea To App](ch04/150-ai.md)

---

