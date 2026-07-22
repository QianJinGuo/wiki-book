---
title: "用 AI Agent 自动化日常办公工作流 — 在 AWS 上构建 Outlook 邮件助手的端到端实践"
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/ai-agent-automation-workflow-aws-build-outlook-assistant/
ingested: 2026-06-01
feed_name: AWS
source_published: 2026-05-28T05:38:22Z
type: article
sha256: 524cbeb0cc2ab546bb7d80c6ae1e39da4132aebe8d76c82db9f951e9fd50596f
tags: ['office-automation', 'aws', 'fargate', 'claude-agent-sdk', 'outlook']
---
# 用 AI Agent 自动化日常办公工作流 — 在 AWS 上构建 Outlook 邮件助手的端到端实践

摘要：本文介绍一种面向中国区企业的 AI Agent 办公自动化方案。Agent 运行时基于 Claude Agent SDK 部署在 AWS Fargate，业务流程以 Markdown 形式的 Skill 文件描述，外部系统集成由 Model Context Protocol（MCP）工具层统一封装。模型层与上层逻辑解耦，通过硅基流动 SiliconFlow 提供的 Anthropic 兼容 API 接入。本文以 Outlook 邮件助手为完整示例，读者将了解如何配置中国区 Microsoft Graph 端点、部署到 AWS Fargate，以及接入模型层。同一架构通常可平移到日历调度、文档归档、会议纪要、审批流转、IT 工单分诊等场景。

**目录**

01 业务挑战

02 解决方案概述

03 实施步骤

04 工程实践要点

05 总结与下一步

06 参考文档

* * *

## **1\. 业务挑战**

办公自动化不是一个新话题。过去十年里的实现路径——从机器人流程自动化（Robotic Process Automation，RPA）到业务流程管理（Business Process Management，BPM），再到各类流程编排工具——始终面临同一个瓶颈：自动化的边际成本随着流程复杂度上升而较快增长。新增一个分支、一种边界条件或一种语种，开发者通常需要新增一段代码或规则。在中国区企业里，这个问题更突出，因为多数办公流程要同时跨越中文邮件、英文外部沟通、本地化的合规审批，以及与本地化运营的软件即服务（Software as a Service，SaaS）服务集成。

传统办公自动化工具能解决的是”如果 A 则 B”型的确定流程：来自指定发件人的邮件归档到指定文件夹；特定关键词触发审批流；固定字段从一个表格抄到另一个表格。但真正消耗员工时间的是判断密集型任务，例如：

  * 这封邮件需不需要回复、用什么语气；
  * 是否需要抄送上级；
  * 几封相关邮件如何合并为一句话进展；
  * 会议纪要里哪几条是承诺事项；
  * 对方上传的合同改到哪一稿。



这些任务的特征是分支多、边界模糊、需要语义判断。知识工作者每天有相当一部分时间花在邮件分拣、会议待办整理、附件归档这类任务上。基于规则的自动化对其中可模板化的部分有效，但占比不高的判断密集任务才是时间真正流失的地方。大语言模型在这些判断密集型任务上通常表现更好。把模型作为可调用工具的智能助手放进办公流程的核心，再用 Skill 文件约束每个具体场景的执行步骤，自动化的可达边界因此显著推开。

## **2\. 解决方案概述**

下图展示整个方案的四层架构。同一套架构通常可服务多个办公场景——只需新增一份 Skill 文件并按需扩展底层 MCP 工具集。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/ai-agent-automation-workflow-aws-build-outlook-assistant-1-new.png>) [图1：四层架构：Agent 运行时、模型层、Skill 层、MCP 工具层]  
---  
  
### 2.1 Agent 运行时

第一层是 Agent 运行时，基于 Claude Agent SDK 部署在 [AWS Fargate](<https://aws.amazon.com/cn/fargate/>) 上。SDK 内部启动完整的 Agent 子进程，内置推理-规划-执行循环。该子进程原生支持 MCP 工具发现与调用，并保持多轮会话上下文。运行时本身不包含模型，模型作为下一层独立存在。

### 2.2 模型层

第二层是模型层。截至撰稿时，[Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/>) 在 AWS 中国（北京）区域和 AWS 中国（宁夏）区域尚未提供服务。因此中国区方案通过 AWS Marketplace 订阅第三方模型 API。本文 PoC 使用了硅基流动 SiliconFlow 提供的 DeepSeek-V3 与 Qwen2.5-72B，通过其 Anthropic 兼容的 Messages API 端点调用。硅基流动同时提供 OpenAI 兼容和 Anthropic 兼容两种接口格式，订阅与计费合并到 AWS 账单。

需要说明的是，模型本身由第三方供应商运营，调用为公网 HTTPS 接入，因此推理过程发生在该供应商的服务环境中。客户在选型时需要按合规要求评估第三方供应商的资质和数据处理承诺。如果偏好其他供应商或自建私有化模型，更换 baseURL 与 API Key 即可，方案不绑定特定供应商。

### 2.3 Skill 层

第三层是 Skill 层。每个办公场景对应一份独立的 Markdown 文件（SKILL.md），随容器镜像打包或通过挂载卷加载到 Agent 运行时中。Skill 文件描述触发条件、执行步骤、工具调用顺序、输出格式和异常处理。这一层是非技术人员可以直接修改的——业务同事调整 Skill 后更新镜像或挂载卷即可生效，无需修改代码。

### 2.4 MCP 工具层

第四层是 MCP 工具层。每一个 MCP Server 封装一类外部系统的 API，通过 MCP 协议（JSON-RPC over stdio）与 Agent 运行时通信。本文重点介绍的 outlook-mcp（包名 m365-mcp）基于开源 MCP Server 开发，主要工作是将 Microsoft Graph API 的端点、OAuth authority 和 Token Scope 全部适配为世纪互联（21Vianet）运营的中国区配置。同一架构下的 files-mcp、flow-mcp、ticket-mcp 也会简要说明，便于读者理解扩展路径。

## **3\. 实施步骤**

本节以邮件场景为例展开端到端实现，作为后续场景扩展的基础模板。顺序依次为：先决条件、Microsoft Graph 应用注册、凭证保管、端点配置、认证与客户端实现、MCP 服务封装、Fargate 部署、模型层接入、Skill 编写、PoC 验证、审计与监控，最后是清理资源。

### 3.1 先决条件

开始之前，请确认以下条件已满足：

1\. 拥有一个本地化运营的 Microsoft 365 租户，并且全局管理员可以在对应的本地化管理门户中注册应用程序。

2\. 拥有 AWS 账户，并已在 AWS Marketplace 中国区订阅一个第三方大模型 API 服务，获取 API Key 和端点 URI。

3\. 本地或部署环境装有 AWS Command Line Interface（AWS CLI）v2、Docker 与 Node.js 18 或更高版本。

4\. 法务团队已对数据流路径完成评估，包括第三方模型供应商的数据处理范围。

### 3.2 注册 Microsoft Graph 应用

在本地化运营版本的管理门户中注册一个应用，名称建议设为 outlook-mcp-aws，账户类型选择”仅此组织目录中的帐户”。重定向 URI 先填写指向 local host 的回调地址 http://localhost:3000/auth/callback；等 Application Load Balancer 部署完成后再追加正式回调地址。注册完成后记录”应用程序（客户端）ID”和”目录（租户）ID”。

为应用添加 Microsoft Graph 的委托权限（Delegated permissions）：Mail.Read、Mail.ReadWrite、Mail.Send、Calendars.Read、Calendars.ReadWrite、Files.Read、Files.ReadWrite、User.Read。添加完成后由管理员授予管理员同意（Grant admin consent）。注意 Scope 需要带中国区前缀，例如 https://microsoftgraph.chinacloudapi.cn/Mail.Read。委托权限配合 OAuth 2.0 授权码流使用，首次运行时需要用户在浏览器中完成交互授权，之后 Token 持久化到本地文件并通过 Refresh Token 自动续期。

创建客户端密钥，描述写 aws-fargate-mcp，有效期建议设为 12 个月便于轮换。密钥值只会显示一次，离开页面后无法再次查看，请立即复制并保存到 [AWS Secrets Manager](<https://aws.amazon.com/cn/secrets-manager/>)。

### 3.3 把凭证保存到 AWS Secrets Manager

需要保管两组密钥：Microsoft Graph 凭证和模型服务的 API Key。以下 AWS CLI 命令分别将这两组凭证保存到 AWS Secrets Manager：
    
    
    # Microsoft Graph 凭证
    aws secretsmanager create-secret \
      --name outlook-mcp/graph-credentials \
      --secret-string '{
        "clientId": "<your-client-id>",
        "tenantId": "<your-tenant-id>",
        "clientSecret": "<your-client-secret>"
      }' \
      --region cn-north-1
    
    # 第三方模型服务的 API Key
    aws secretsmanager create-secret \
      --name agent-runtime/model-api-key \
      --secret-string '{
        "apiKey": "<your-model-api-key>",
        "baseUrl": "<your-model-endpoint>"
      }' \
      --region cn-north-1
    

### 3.4 本地化运营 M365 的 Graph 端点配置

Microsoft 365 的本地化运营版本与全球版本在三处端点上不同——授权主机、Graph API 基地址、Token Scope。MCP 服务必须使用本地化版本的端点配置，否则会返回 401 InvalidAudience。

配置项 | 本地化运营版本取值  
---|---  
授权主机 | login.partner.microsoftonline.cn  
Microsoft Graph 基地址 | microsoftgraph.chinacloudapi.cn  
Token Scope（受众） | https://microsoftgraph.chinacloudapi.cn/.default  
OAuth Token Endpoint 模板 | https://login.partner.microsoftonline.cn/{tenant}/oauth2/v2.0/token  
  
Token Scope 最容易出错。如果 Scope 写错，授权服务器会颁发面向其他受众的访问令牌，调用 API 时受众校验失败。建议在第一次跑通之前打印这个值确认。

### 3.5 实现 Graph 认证与客户端

以下 JavaScript 代码是 MCP 服务中负责获取和刷新访问令牌的核心逻辑。认证采用 OAuth 2.0 授权码流（Authorization Code Flow）：首次通过独立的 auth server （监听 localhost:3333）引导用户在浏览器中完成授权，获取 authorization code 后换取 token；后续通过 refresh_token 静默续期，token 持久化到本地 JSON 文件：
    
    
    // src/graph-auth.js
    const https = require("https");
    const fs = require("fs");
    const querystring = require("querystring");
    
    const tenantId = process.env.MS_TENANT_ID;
    const clientId = process.env.MS_CLIENT_ID;
    const clientSecret = process.env.MS_CLIENT_SECRET;
    
    const CN_AUTHORITY = "https://login.partner.microsoftonline.cn";
    const CN_GRAPH_SCOPE = "https://microsoftgraph.chinacloudapi.cn/.default";
    
    const msalClient = new ConfidentialClientApplication({
      auth: {
        clientId,
        clientSecret,
        authority: `${CN_AUTHORITY}/${tenantId}`,
        knownAuthorities: ["login.partner.microsoftonline.cn"],
      },
    });
    
    async function refreshAccessToken(tokens) {
      const postData = querystring.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: tokens.refresh_token,
        scope: "offline_access https://microsoftgraph.chinacloudapi.cn/Mail.Read",
      });
      // POST to https://login.partner.microsoftonline.cn/{tenant}/oauth2/v2.0/token
      // 返回新的 access_token，持久化到本地文件
    }
    
    async function getValidAccessToken() {
      const tokens = loadTokensFromFile();
      if (!tokens) throw new Error("未认证，请先运行 auth server 完成授权");
      if (Date.now() < tokens.expires_at) return tokens.access_token;
      return await refreshAccessToken(tokens);
    }
    

接下来封装 Graph 客户端。baseURL 必须使用本地化版本的 Graph 根地址。以下 JavaScript 代码定义客户端及核心请求函数，并对非 2xx 响应给出明确错误信息：
    
    
    // src/graph-client.js
    import axios from "axios";
    import { getAccessToken } from "./graph-auth.js";
    
    const GRAPH_BASE = "https://microsoftgraph.chinacloudapi.cn/v1.0";
    
    async function authedRequest(method, path, body) {
      let token;
      try {
        token = await getAccessToken();
      } catch (err) {
        throw new Error(`Auth error before Graph call: ${err.message}`);
      }
    
      try {
        const response = await axios({
          method,
          url: `${GRAPH_BASE}${path}`,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: body,
          validateStatus: () => true,
        });
        if (response.status < 200 || response.status >= 300) {
          const detail = response.data && response.data.error
            ? response.data.error.message
            : JSON.stringify(response.data);
          throw new Error(
            `Graph ${method} ${path} failed: HTTP ${response.status} - ${detail}`
          );
        }
        return response.data;
      } catch (err) {
        console.error("[graph-client] request failed:", err.message);
        throw err;
      }
    }
    
    export async function listUnreadEmails(user, top = 50) {
      const filter = "isRead eq false";
      const select = "id,subject,from,receivedDateTime,bodyPreview,hasAttachments";
      const path = `/users/${user}/messages` +
        `?$filter=${encodeURIComponent(filter)}` +
        `&$select=${select}&$top=${top}&$orderby=receivedDateTime desc`;
      return authedRequest("GET", path);
    }
    
    export async function readEmail(user, messageId) {
      return authedRequest("GET", `/users/${user}/messages/${messageId}`);
    }
    
    export async function createDraftReply(user, messageId, replyBody) {
      const draft = await authedRequest("POST",
        `/users/${user}/messages/${messageId}/createReply`);
      return authedRequest("PATCH",
        `/users/${user}/messages/${draft.id}`,
        { body: { contentType: "HTML", content: replyBody } });
    }
    

注意 createDraftReply 没有调用 send 端点。整个 MCP 服务对外暴露的工具中，没有任何工具能直接发送邮件——这是设计上的硬约束。起草的回复落入用户的”草稿”文件夹，由用户在原生客户端中审阅、修改、发送。

### 3.6 使用 MCP

outlook-mcp 作为标准 MCP Server 通过 stdio 与 Agent 运行时通信。Agent SDK 启动时自动以子进程方式拉起 MCP Server，通过 stdin/stdout 完成工具发现和调用。以下 JavaScript 代码展示 MCP Server 的入口和工具注册逻辑（基于 @modelcontextprotocol/sdk）：
    
    
    // src/server.js
    const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
    const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
    const { emailTools } = require("./email");
    const { calendarTools } = require("./calendar");
    const { onedriveTools } = require("./onedrive");
    
    const TOOLS = [...emailTools, ...calendarTools, ...onedriveTools];
    
    const server = new Server(
      { name: "m365-assistant", version: "2.0.0" },
      { capabilities: { tools: {} } }
    );
    
    // 处理 tools/list 和 tools/call
    server.fallbackRequestHandler = async (request) => {
      const { method, params } = request;
      if (method === "tools/list") return { tools: TOOLS.map(t => ({ name: t.name, description: t.description, inputSchema: t.inputSchema })) };
      if (method === "tools/call") {
        const tool = TOOLS.find(t => t.name === params.name);
        return tool ? await tool.handler(params.arguments) : { error: { code: -32601, message: "Tool not found" } };
      }
    };
    
    const transport = new StdioServerTransport();
    await server.connect(transport);
    

### 3.7 部署到 AWS Fargate

以下 Dockerfile 用于构建容器镜像：
    
    
    FROM public.ecr.aws/docker/library/node:18-alpine
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci --omit=dev
    COPY src ./src
    EXPOSE 3000
    CMD ["node", "src/server.js"]
    

构建并推送到 Amazon Elastic Container Registry（Amazon ECR）。以下 AWS CLI 与 Docker 命令完成创建仓库、登录、构建、打标和推送：
    
    
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    REGION=cn-north-1
    REPO=outlook-mcp
    
    aws ecr create-repository --repository-name $REPO --region $REGION
    aws ecr get-login-password --region $REGION | \
      docker login --username AWS --password-stdin \
      $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com.cn
    docker build -t $REPO .
    docker tag $REPO:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com.cn/$REPO:latest
    docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com.cn/$REPO:latest
    

注意中国区 Amazon ECR 域名以 .amazonaws.com.cn 结尾。

在 Amazon Elastic Container Service（[Amazon ECS](<https://aws.amazon.com/cn/ecs/>)）中创建 AWS Fargate 启动类型的服务。任务定义 0.5 vCPU、1 GB 内存。任务执行角色除附加 AmazonECSTaskExecutionRolePolicy 外，还需追加从 Secrets Manager 读取的策略。以下 JSON 是该策略的最小示例：
    
    
    {
      "Version": "2012-10-17",
      "Statement": [{
        "Effect": "Allow",
        "Action": ["secretsmanager:GetSecretValue"],
        "Resource": [
          "arn:aws-cn:secretsmanager:cn-north-1:111122223333:secret:outlook-mcp/graph-credentials-*",
          "arn:aws-cn:secretsmanager:cn-north-1:111122223333:secret:agent-runtime/model-api-key-*"
        ]
      }]
    }
    

中国区 ARN 前缀是 arn:aws-cn:。示例中的 111122223333 为占位账户 ID，部署时替换为实际账户 ID。

服务前端是Application Load Balancer（ALB），目标组健康检查指向 /healthz，监听 HTTPS 443 并配置证书。AWS Fargate 任务放在私有子网中，通过网络地址转换（Network Address Translation，NAT）网关出公网访问。请确认 NAT gateway的弹性 IP 不在客户侧条件访问策略的拒绝列表中——这是连通性问题中较常见的误判来源。

### 3.8 接入模型层

Agent 运行时基于 Claude Agent SDK 构建，部署在 AWS Fargate 上。SDK 通过子进程方式启动 Agent，内置完整的推理-规划-执行循环，原生支持 MCP 工具发现与调用，开发者无需手写 Agent Loop。模型层通过硅基流动的 Anthropic 兼容 Messages API 接入。以下 JavaScript 代码展示 Agent 运行时的核心启动逻辑：
    
    
    // src/agent.js
    const { Claude } = require("@anthropic-ai/claude-agent-sdk");
    
    const agent = new Claude({
      model: "deepseek-ai/DeepSeek-V3",
      apiKey: process.env.MODEL_API_KEY,
      baseURL: process.env.MODEL_BASE_URL, // 硅基流动 Messages API
      skillPath: "/skills/email-daily-brief.md",
    
    // MCP Server 配置：Agent SDK 自动以子进程启动并通过 stdio 通信
      mcpServers: {
        "outlook-mcp": { command: "node", args: ["./outlook-mcp/index.js"] },
      },
    });
    
    // Agent SDK 内部自动完成：
    // 1. 通过 stdio 连接 outlook-mcp，发现所有可用工具
    // 2. 加载 Skill 文件作为 system prompt
    // 3. 进入推理循环：模型推理 → 工具调用 → 结果回传 → 继续推理
    // 4. 直到模型判断任务完成
    
    async function runAgent(userInput) {
      const response = await agent.send(userInput);
      return response.content;
    }
    

API Key 通过 AWS Secrets Manager 管理。模型调用通过公网 HTTPS 出口到硅基流动端点。Claude Agent SDK 内部处理了完整的推理-工具调用循环，开发者无需手写 Agent Loop。建议在 AWS Fargate 任务的安全组中限制出口仅指向供应商发布的端点域名，并在 [Amazon CloudWatch](<https://aws.amazon.com/cn/cloudwatch/>) Logs 中记录每次调用的请求体大小、响应延迟和错误码用于审计。

### 3.9 编写 email-daily-brief Skill

这个 Skill 并非手动编写 prompt 的产物，而是通过一种”教一次，复用无数次”的方式创建的。具体做法是：用户与 Agent 对话，带着 Agent 实际做一次”整理今天的未读邮件”——过程中不断调整，比如”这封应该标为需要回复””回复语言要跟原邮件一致””附件邮件单独标注”。当 Agent 把任务做对之后，用户说”帮我把刚才的过程总结成一个 Skill”，Agent 调用内置的 skill-creator 能力，自动提炼触发条件、执行步骤、工具调用顺序、输出格式和异常规则，生成一份完整的 SKILL.md。这与传统的 prompt engineering 思路不同——用户不需要自己设计 prompt 或定义流程，只需要”做对一次”，Skill 就自动诞生了。以下是最终生成的 email-daily-brief Skill：
    
    
    ---
    name: email-daily-brief
    trigger: [处理邮件, 处理未读邮件, check my inbox]
    ---
    
    # 每日未读邮件简报
    
    ## 步骤 1：检查认证
    调用 list_unread_emails 验证连接。返回 401 时告知用户密钥过期。
    
    ## 步骤 2：拉取未读邮件
    调用 list_unread_emails，参数 top=50，按 receivedDateTime 倒序。
    
    ## 步骤 3：逐封分析
    对每封邮件调用 read_email，提取发件人、主题、正文前 500 字、附件标记。
    判断类别：信息周知 / 需要回复 / 需要行动 / 可忽略。
    判断回复语言：与原邮件主语言一致，不要混杂。
    
    ## 步骤 4：起草回复
    仅对“需要回复”类调用 draft_reply。
    回复格式：礼貌问候 + 对原邮件主旨的简短确认 + 明确的下一步 + 署名占位符。
    不要发送邮件。起草的回复落入“草稿”文件夹，由用户审阅。
    
    ## 步骤 5：生成简报
    输出 Markdown 简报：概览表格、详情列表、待办事项。
    

### 3.10 PoC 阶段的验证结论

在概念验证（Proof of Concept，PoC）环境中跑通了完整链路：Agent 能从本地化运营的 Microsoft 365 租户拉取未读邮件、按发件人语言起草回复、把草稿写回原邮箱的”草稿”文件夹。PoC 同时验证了 Skill 文件的可移植性——切换底层模型（在不同第三方模型 API 之间切换）时，其余三层无需改动。后续将进入客户实际环境的试运行阶段，建议届时设计明确的指标采集（处理时长、草稿采纳率、误发零容忍）以量化收益。

### 3.11 配置审计日志与监控

启用以下日志收集：AWS Fargate 任务的 Amazon CloudWatch Logs 日志组（包含 Agent 运行时的模型请求与响应）；Application Load Balancer 访问日志（写入开启对象锁定的 [Amazon S3](<https://aws.amazon.com/cn/s3/>) 桶）；第三方模型服务控制台的 API 调用日志（按需导出）。

为 Amazon CloudWatch Logs 日志组配置指标筛选器，匹配 InvalidAudience、Unauthorized、RateLimit 等关键字，触发 Amazon Simple Notification Service（[Amazon SNS](<https://aws.amazon.com/cn/sns/>)）告警。

### 3.12 清理资源

完成测试或停止服务时，按以下顺序清理资源避免持续计费：

5\. 把 Amazon ECS 服务期望任务数设为 0 并删除服务。

6\. 删除 Application Load Balancer 与目标组。

7\. 删除 Amazon ECR 仓库镜像。

8\. 在 AWS Marketplace 取消第三方模型订阅。

9\. 关闭日志收集，删除 Amazon CloudWatch Logs 日志组。

10\. 在 AWS Secrets Manager 中标记凭证计划删除。

11\. 在本地化管理门户中删除应用注册的客户端密钥。

## **4\. 工程实践要点**

### 4.1 架构层面的取舍

四层解耦背后有四条工程上的取舍。

第一，Skill 与代码解耦。 业务流程会频繁变化，但底层 API 调用相对稳定。Skill 用 Markdown 描述流程的好处主要有三点。其一，业务侧的同事通常可以自己改流程而无需联系工程团队。其二，流程变更不需要重新部署服务。其三，同一份 Skill 在不同模型上通常行为基本一致。

第二，MCP 作为标准化接口。 不同办公系统（Microsoft 365、ServiceNow、Jira、内部企业资源规划（Enterprise Resource Planning，ERP）系统）有不同的 API 形态，但 Agent 调用层只关心”工具有哪些参数、返回什么”。MCP 协议把异构 API 收敛到一个接入面，Agent SDK 原生支持 MCP 工具发现与调用。新增一个外部系统集成，只需要开发一个 MCP Server（如本文的 outlook-mcp），原有 Skill 不受影响。

第三，模型层可替换是中国区落地的关键设计。 AWS 中国区当前没有 Bedrock。传统做法要么把模型层放到海外区域（带来跨境合规风险），要么自建图形处理器（Graphics Processing Unit，GPU）集群部署开源模型（运维代价高）。方案采用 AWS Marketplace 中国区订阅第三方模型服务（本文使用硅基流动的 Anthropic 兼容 Messages API），计费走 AWS 账单、模型供应商可按业务和合规要求选择，供应商更替的成本只是更换 baseURL 与 API Key。

第四，全栈可审计。 AWS Fargate 上 Agent 运行时日志、Application Load Balancer 访问日志、[AWS CloudTrail](<https://aws.amazon.com/cn/cloudtrail/>) 控制平面日志和第三方模型服务的 API 调用日志组合起来，覆盖了从用户输入到模型推理再到外部系统调用的完整链路。这一组合通常能满足企业合规评审的常见要求。

### 4.2 跨场景的安全与合规设计

不论场景如何扩展，建议把以下五条作为方案的安全与合规基线：

其一，外发动作需经人工审批。发邮件、发会议邀请、推动审批通过、关闭工单等动作建议落入草稿/待审状态，或通过 Amazon SNS 推送审批请求由用户确认后再执行。

其二，最小权限原则。每个 MCP 服务只授予该场景最小所需的 API 权限，避免一份凭证全场景通用。

其三，密钥统一保管。客户端密钥与 API Key 应存放在 AWS Secrets Manager，应用通过任务角色按需读取，不写入容器镜像或环境变量文件。

其四，全链路可审计。日志组合通常包括 AWS Fargate 上 Agent 运行时的日志（含模型请求与响应）、Application Load Balancer 访问日志、AWS CloudTrail 控制平面日志、第三方模型服务的 API 调用日志。日志统一归档到一个开启对象锁定的 Amazon S3 桶，保留期至少 90 天。

其五，模型调用的合规边界。采用第三方模型服务时，需要在合同层面落实数据处理范围、留存期限、跨境约束等条款。建议在 Skill 中对敏感字段做脱敏（例如对身份证号、银行账户号在传给模型前替换为占位符），并把”哪些字段允许进入模型”作为 Skill 的显式声明。

### 4.3 扩展到更多办公场景

邮件场景跑通后，新增其他场景的核心成本主要落在”写一份新的 Skill”和”按需扩展 MCP 工具”。同一架构可以平移到多个办公场景，下表列出已识别出的扩展方向。每个场景的 Skill 设计原则相同——描述触发条件、按步骤调用 MCP 工具、对外发动作设置人工审批门——具体 Skill 的内容会在后续博客中按场景展开。

场景方向 | 业务问题 | 复用的 MCP 工具 | 新增的 MCP 工具  
---|---|---|---  
日历智能调度 | 跨时区会议安排耗时；多份日历手动找空档；与外部约会议邮件来回多轮 | outlook-mcp（日历相关接口） | 无（复用现有日历工具）  
附件自动归档 | 合同/发票/报价分散在邮件附件，归档分类不一致 | outlook-mcp（读取附件） | files-mcp（OneDrive、SharePoint）  
会议纪要承诺事项提取 | 会议结束后承诺没有进入任务系统，跟踪靠人记忆 | 无（输入为粘贴的纪要文本） | ticket-mcp（Jira / ServiceNow / 任务管理工具）  
审批流转辅助 | 审批表字段杂、跨部门反复打回；审批人在多个工具间切换 | 无 | flow-mcp（企业流程引擎接口）  
IT 工单分诊 | 大量重复诉求（密码重置、VPN开通、权限申请）占用人工 | 无 | ticket-mcp（IT 服务管理（IT Service Management，ITSM）系统的表征状态转移（Representational State Transfer，REST）API）  
跨场景的个人日报 | 管理者希望每天结束时收到个人简报 | 上述全部 | 无（通过 Skill 间组合实现）  
  
需要特别注意的是：本地化运营版本的 SaaS 服务（如 SharePoint Online）站点 URL 模板与全球版不同；Graph 调用使用本地化端点 microsoftgraph.chinacloudapi.cn，对应的 driveId 与 siteId 需从本地化租户查询。

## **5\. 总结与下一步**

这套方案的核心价值不在大模型本身，而是 Agent 运行时、模型层、Skill、MCP 四者解耦带来的扩展性与可移植性。一旦邮件场景跑通，添加日历调度、文件归档、会议纪要、审批辅助、IT 工单等新场景的边际成本主要落在”写一份新 Skill”。模型层的可替换让方案在 AWS 中国区当前没有 Bedrock 的现实下仍能落地——通过 AWS Marketplace 订阅第三方模型服务，加上 Skill 的模型无关设计，”用什么模型”成为一行配置而不是一项架构决策。Skill 文件由业务同事直接维护这一点，让自动化系统的演进速度更容易匹配业务变化的速度。

下一步的工作建议：

  * 在客户实际环境中开展试运行，按既定指标（处理时长、草稿采纳率、误发零容忍）量化收益。
  * 将 outlook-mcp 之外的 files-mcp、flow-mcp、ticket-mcp 落地到生产，扩展到日历、归档、纪要、审批、工单等场景。
  * 完善对敏感字段的脱敏与”哪些字段允许进入模型”的 Skill 显式声明。
  * 对接客户侧的统一审批通道（如企业 IM 工具的审批卡片），把人工审批步骤产品化。



**下一步行动：**

**相关产品：**

  * [Amazon Fargate](<https://aws.amazon.com/cn/fargate/?p=bl_pr_fargate_l=1>) — 适用于容器的无服务器计算
  * [Amazon Secrets Manager](<https://aws.amazon.com/cn/secrets-manager/?p=bl_pr_secrets-manager_l=2>) — 密钥管理
  * [Amazon CloudWatch](<https://aws.amazon.com/cn/cloudwatch/?p=bl_pr_cloudwatch_l=3>) — 可观测性工具
  * [Amazon ECS](<https://aws.amazon.com/cn/ecs/?p=bl_pr_ecs_l=4>) — 完全托管的容器编排服务
  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=5>) — 用于构建生成式人工智能应用程序和代理的端到端平台



**相关文章：**

  * [（上篇）基于 AWS Bedrock AgentCore 构建企业级航空客服智能体 —— 基于AIDLC方法从需求分析到生产部署的完整实践](<https://aws.amazon.com/cn/blogs/china/based-on-aws-bedrock-agentcore-build-enterprise-intelligent-based-on-aidlc-analytics-deploy-practice/?p=bl_ar_l=1>)
  * [从应用到 Agent：开发范式正在发生什么变化？](<https://aws.amazon.com/cn/blogs/china/application-agent-development/?p=bl_ar_l=2>)
  * [用 Kiro构建 AI：基于 AWS 基础设施快速构建企业级 Agentic AI 平台](<https://aws.amazon.com/cn/blogs/china/building-enterprise-agentic-ai-with-kiro-on-aws/?p=bl_ar_l=3>)
  * [基于 AWS DevOps Agent 构建 AI 驱动的运维分析系统](<https://aws.amazon.com/cn/blogs/china/based-on-aws-devops-agent-build-ai-operations-analytics-system/?p=bl_ar_l=4>)
  * [基于 Amazon EKS 和 Graviton 构建多租户 AI Agent 平台：OpenClaw on Kubernetes 实践](<https://aws.amazon.com/cn/blogs/china/build-multi-tenant-ai-agent-on-eks-graviton-openclaw-k8s-practice/?p=bl_ar_l=5>)



## **6\. 参考文档**

  * Model Context Protocol 开放规范：<https://modelcontextprotocol.io> 本文示例代码仓库：<https://github.com/example/outlook-mcp-aws>（部署后替换为实际地址）
  * Microsoft Graph 的部署：<https://learn.microsoft.com/graph/deployments>



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 孙旭

Scania China 集成平台专家, 主要负责系统之间通过API 网关、Kafka 和 IoT 等技术栈实现高效、稳定的数据流转。目前也在公司内推动GenAI平台和技术方案的选型与落地，促进智能化能力在各业务线中的应用。

### 王维超

亚马逊云科技解决方案架构师，负责基于亚马逊云科技的云计算方案的架构设计，同时致力于亚马逊云科技云服务在汽车行业的应用和推广。

### 郭林坡

亚马逊云科技生成式 AI 创新中心深度学习架构师，7 年+互联网搜索算法经验，专精于数据驱动的算法实现，架构设计，致力于帮助企业客户在生成式 AI 场景中完成方案设计与概念验证，覆盖电商、游戏、医疗、金融等行业。

* * *

## 亚马逊云科技中国峰会

开发者挑战赛现场开启，基于真实业务场景亲手构建 Agent。 [](<https://aws.amazon.com/cn/events/summits/shanghai/?ectrk=jyLXNovBYB51qgzUEipIpZcxlfE5%2Bs7NfDTnZwR7hFYtQmPUSToTuN%2FZO5doh20ZJ%2FloW6Rom0l3P4LLcoyUPA%3D%3D&sc_icampaign=glb-summit-blog-p2&sc_ichannel=ha&sc_iplace=blog&trk=ab30be54-aedd-480a-9364-ab0bf98e982d>) |   
---|---
