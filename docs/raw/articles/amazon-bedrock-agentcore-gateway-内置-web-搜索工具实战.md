---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/amazon-bedrock-agentcore-gateway-web-search-tool
ingested: 2026-07-22
feed_name: AWS China Blog
source_published: 2026-07-22
sha256: 848613a994a9ad98e793870fc012363353ed1593fb3a06cf3d1e0553eb84ac2f
---

# Amazon Bedrock AgentCore Gateway 内置 Web 搜索工具实战

摘要：通过 MCP 将 Web Search Tool 集成到 AgentCore Gateway，为 AI Agents 提供实时网络搜索能力。

**目录**

01 一．背景：为什么 Agent 需要实时 Web 搜索

02 二．Web Search Tool 的关键能力与工作原理

03 三．专用 Web 索引与「隐私优先」设计

04 四．实操：把 Web Search Tool 接入 Gateway

05 五．两种主流框架接入 Web Search Tool 实战

06 六．使用场景建议

07 七．总结

08 八．参考链接

* * *

## **一．背景：为什么 Agent 需要实时 Web 搜索**

AI Agent 正在改变组织与信息交互的方式，但它们有一个根本性的局限：知识在训练时就被「冻结」了。当用户询问今天的股价、一小时前才发布的软件版本时，仅靠训练数据的 Agent 无法给出准确答案。

要自己解决这个问题，成本并不低：要采购第三方搜索 API、管理密钥与配额与限流、解析不同供应商各异的结果格式、构建摘要抽取逻辑（让模型拿到相关段落而非原始 HTML）、还要考虑用户查询会流向哪里、数据如何留存，并长期维护索引的新鲜度与覆盖面。每一项几乎都是一个独立的工程项目。

2026 年 6 月，亚马逊云科技在 [Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/>) 上正式发布（GA）了 Web Search Tool（Web 搜索工具）—— 一个完全托管、兼容 MCP（Model Context Protocol）的 Web 搜索能力。它以内置连接器（built-in connector）的形式接入你的 AgentCore Gateway，Agent 通过标准的 `tools/list` 即可发现它，并像调用任何 MCP 工具一样调用它。无需自备搜索 API、无需管理出站凭证、也无需维护结果解析的Glue Code。本文先讲清它的能力与架构，再用一套最小化步骤演示如何把它接到 Gateway 并由 Agent 调用。具体可以参考 [官方文档 Web Search Tool](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway-target-connector-web-search-tool.html>)。

## **二．Web Search Tool 的关键能力与工作原理**

### 2.1 关键能力

Web Search Tool 的核心能力可以概括为以下几点：

  * 获取最新信息：返回带有标题、URL、摘要和发布日期的实时 Web 结果，把 Agent 的回答锚定在最新信息上；
  * 零基础设施管理：没有第三方搜索 API 要预置、没有扩缩容要配置，Gateway 自动把 Web 搜索暴露为标准 MCP 工具；
  * 框架无关：通过标准 MCP 协议，可与 Strands Agents、LangChain、LangGraph、CrewAI 或任意 MCP 兼容客户端协作；
  * 专用 Web 索引：背后是由 Amazon 自建并运营、覆盖数百亿文档的 Web 索引；
  * 高置信事实的知识图谱：为实体及其关系提供事实性答案，而不是让模型从抽取的页面文本里去「推断」；
  * 语义化摘要抽取：从每个页面抽取与查询语义相关的段落，并针对模型上下文窗口做优化，而非返回原始 HTML 或整页内容。



### 2.2 工作原理：从 Gateway 到一次搜索调用

Web Search Tool 是一个内置连接器（connector），Gateway 负责 schema 管理、参数治理、端点解析和服务鉴权。一次完整的搜索经历五步：

  * Gateway 配置：创建一个 Gateway，并用 `connectorId: "web-search"` 添加一个 Web Search Tool target，Gateway 会快照工具 schema 并完成集成预置；
  * 工具发现：Agent 对 Gateway 端点调用 `tools/list`，发现 `WebSearch` 工具及其输入 schema；
  * 发起搜索：Agent 用 `tools/call` 传入一条自然语言查询（最长 200 字符），Gateway 鉴权后在亚马逊云科技内部转发该请求；
  * 结构化结果：工具以文本和结构化 JSON 两种形式返回带有语义摘要、URL、标题和发布日期的结果；
  * 生成有据可依的回答：Agent 用这些结果组织出带引用来源的回答。



## **三．专用 Web 索引与「隐私优先」设计**

### 3.1 专用 Web 索引：不是第三方搜索的「包装层」

很多给 Agent 加 Web 搜索的方案，本质是对某个第三方搜索引擎的封装。Web Search Tool 不同——它背后是 Amazon 自建并直接运营的 Web 索引：

  * 覆盖面广：索引覆盖数百亿文档；这种规模对覆盖长尾问题（小众库、冷门产品规格）很关键；
  * 持续更新：Amazon 持续刷新索引，新内容在数分钟内即可反映。对回答价格波动、刚发布的公告这类问题，这个「时效窗口」就是「有据可依」与「自信地答错」之间的差别；
  * 知识图谱：内置知识图谱锚定实体及其关系，对「谁担任某职位」「某事物何时成立」这类事实问题给出高置信答案，减少 Agent 从零散摘要拼接答案时产生的细微事实漂移；
  * 面向模型上下文的语义摘要：抽取真正与查询相关的段落、以适配上下文窗口的形式返回，每个 token 携带更高密度的相关信息，从而提升引用答案的精确度。



### 3.2 隐私优先：查询不离开亚马逊云科技

对很多企业来说，卡住 Web 搜索落地的往往不是「能不能用」，而是「用户的查询会去哪、之后会怎样」。Web Search Tool 在设计上让这个问题的答案很直接：查询完全在亚马逊云科技基础设施内部完成——客户查询不会被发送到第三方搜索引擎，也不会被路由到亚马逊云科技之外。Gateway 向亚马逊云科技自有连接器鉴权并在内部转发请求，整条数据路径端到端都留在亚马逊云科技内。对有数据外流顾虑的团队来说，这直接消除了一整类合规评审。

## **四．实操：把 Web Search Tool 接入 Gateway**

### 4.1 整体架构：一次 Web 搜索是怎么走通的

在动手之前，先看清这套方案的整体架构。它由四个角色串成一条链路：

  * Agent / MCP 客户端：你的应用或 Agent 框架，通过标准 MCP（streamable HTTP）连到 Gateway 端点；
  * AgentCore Gateway：MCP 服务端入口，负责对入站请求做身份校验、把 Web 搜索这个内置连接器以标准 MCP 工具的形式暴露出去，并在 AWS 内部完成出站鉴权与转发；
  * Gateway 服务角色（IAM Role）：Gateway 代表你调用后端连接器时所扮演的身份，决定了它「有没有权限去调用 Web 搜索」；
  * Web Search 托管连接器：亚马逊云科技自有、运营整套搜索栈的后端，查询全程在亚马逊云科技内部完成。



下图是一次搜索的完整数据流：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/amazon-bedrock-agentcore-gateway-web-search-tool-1.png>) 图 1：Web Search Tool 整体架构与一次搜索的数据流  
---  
  
### 4.2 创建步骤总览

把上面的架构落到操作上，最小化的接入只需以下几步。假设你已经创建好一个 AgentCore Gateway，并拿到了它的 `GATEWAY_ID`：

  1. 创建 Web Search Tool target：在 Gateway 上添加一个连接器 target，`connectorId = "web-search"`，工具名为 `WebSearch`；
  2. 配置 Gateway 服务角色：为角色授予调用 Gateway 与 Web 搜索的 IAM 权限（见 4.4）；
  3. （可选）配置域名过滤：用 denylist 限制不希望被检索的域名（见 4.5）；
  4. 从 Agent 端发现并调用工具：用 MCP 客户端 `tools/list` 发现 `WebSearch`、再用 `tools/call` 发起搜索（见第五章）。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/amazon-bedrock-agentcore-gateway-web-search-tool-2.png>) [图 2：AgentCore 控制台创建 Web Search target-1]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/amazon-bedrock-agentcore-gateway-web-search-tool-3.png>) [图 2：AgentCore 控制台创建 Web Search target-2]  
---  
  
### 4.3 创建 Web Search Tool target

用 AWS CLI创建连接器 target：
    
    
    aws bedrock-agentcore-control create-gateway-target \
      --gateway-identifier "<GATEWAY_ID>" \
      --name "web-search-tool" \
      --target-configuration '{
        "mcp": {
          "connector": {
            "source": { "connectorId": "web-search" },
            "configurations": [ { "name": "WebSearch", "parameterValues": {} } ]
          }
        }
      }' \
      --credential-provider-configurations '[{"credentialProviderType": "GATEWAY_IAM_ROLE"}]' \
      --region "<REGION>"
    

### 4.4 配置鉴权

Web Search Tool 的鉴权分为两段：

  * 入站鉴权（Agent → Gateway）：Agent 调用 Gateway 的 MCP 端点时的身份校验，由创建 Gateway 时配置的「入站鉴权器（inbound authorizer）」决定，支持两种方式——IAM与 OAuth 2.0 / JWT Bearer 令牌（如 [Amazon Cognito](<https://aws.amazon.com/cn/cognito/>) 或任意 OIDC 提供方）；
  * 出站鉴权（Gateway → 后端连接器）：Gateway 调用 Web 搜索连接器时所用的身份。对内置 Web 搜索连接器而言，仅支持 `GATEWAY_IAM_ROLE` 一种凭证类型——即由 Gateway 的服务角色（IAM Role）代表你发起调用；



出站这一段是 Web 搜索特有、且必须配置的，本节以 IAM 服务角色 为例。该角色需要两项权限：

  * `bedrock-agentcore:InvokeGateway`：用于调用 Gateway；
  * `bedrock-agentcore:InvokeWebSearch`：用于授权 Web 搜索调用，按请求校验服务自有 ARN `arn:aws:bedrock-agentcore:<region>:aws:tool/web-search.v1`。



把下面的策略附加到 Gateway 所用的服务角色上：
    
    
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Sid": "InvokeGateway",
          "Effect": "Allow",
          "Action": "bedrock-agentcore:InvokeGateway",
          "Resource": "arn:aws:bedrock-agentcore:<REGION>:<ACCOUNT_ID>:gateway/*"
        },
        {
          "Sid": "InvokeWebSearch",
          "Effect": "Allow",
          "Action": "bedrock-agentcore:InvokeWebSearch",
          "Resource": "arn:aws:bedrock-agentcore:<REGION>:aws:tool/web-search.v1"
        }
      ]
    }
    

注意 `InvokeWebSearch` 的 `Resource` 指向的是 服务自有 ARN（partition 段为 `aws` 而非你的账号 ID），这是该工具特有的写法，别误写成自己的账号 ID。

此外，调用 Gateway 的 Agent / 应用一侧 需要持有 `bedrock-agentcore:InvokeGateway` 权限——它属于调用方，而非 Gateway 服务角色，别把两者混在同一个角色里。

至于入站这一段（Agent → Gateway），本文统一采用 IAM方式：Gateway 创建时入站鉴权器选择 `AWS_IAM`。

### 4.5 （可选）配置域名过滤 denylist

你可以通过域名拒绝列表（denylist）限制 Web Search Tool 允许查询的域名，这对希望阻止 Agent 返回特定网站结果的管理员很有用。过滤在工具级别通过 `parameterValues.domainFilter.exclude` 字段配置；它在服务端强制执行、对 LLM 不可见——Agent 并不知道有这条限制，只是单纯收不到被排除域名的结果。下面的例子排除了 `blocked-website-1.com` 与 `blocked-website-2.com`：
    
    
    gateway_client.create_gateway_target(
        name="web-search-tool",
        gatewayIdentifier="<GATEWAY_ID>",
        targetConfiguration={
            "mcp": {
                "connector": {
                    "source": {"connectorId": "web-search"},
                    "configurations": [
                        {
                            "name": "WebSearch",
                            "parameterValues": {
                                "domainFilter": {
                                    "exclude": ["blocked-website-1.com", "blocked-website-2.com"]
                                }
                            },
                        }
                    ],
                }
            }
        },
        credentialProviderConfigurations=[
            {"credentialProviderType": "GATEWAY_IAM_ROLE"}
        ],
    )
    

已有的 target 也可以通过 `UpdateGatewayTarget` 来新增或修改域名过滤，无需重建。

## **五．两种主流框架接入 Web Search Tool 实战**

第四章已经把 Web Search Tool 挂到 AgentCore Gateway 上，并以标准 MCP 工具的形式暴露出来。既然它是 MCP 原生、框架无关的，那么任何兼容 MCP 的 Agent 框架都能接入同一个 Gateway 端点。本章会使是用同一个端点、同一条查询，分别用 Strands Agents 与 LangChain 两个主流框架把它接进来，并展示各自的调用结果。

### 5.1 公共前提：同一个端点、同一条查询

两个框架连接的是同一个 Gateway 的 MCP 端点（streamable HTTP）。本文入站鉴权采用 AWS_IAM（见 4.4），因此每个请求都要用 SigV4 签名。签名细节交给亚马逊云科技官方的 mcp-proxy-for-aws 处理：它既提供可直接嵌入代码的 aws_iam_streamablehttp_client（返回一条「已签名的 MCP 传输流」），也提供一个本地 stdio 代理进程，供不便自定义 HTTP 客户端的框架使用。工具经 Gateway 暴露后会带上 target 前缀，工具名为 web-search-tool___WebSearch。

两个框架共用下面这份配置与查询。这里特意选一个「训练截止之后才发生、且日新月异」的问题，最能体现实时 Web 搜索的价值：
    
    
    # 公共配置：Gateway 端点 + 查询（三个框架共用）
    GW_URL    = "https://<gateway-id>.gateway.bedrock-agentcore.us-east-1.amazonaws.com/mcp"
    GW_REGION = "us-east-1"          # Gateway 所在区（Web Search 目前仅 us-east-1）
    QUERY     = "newest large language model released in June 2026"
    SYSTEM_PROMPT = (
        "你是一个会上网检索的中文助手。当问题涉及最新信息时，"
        "必须先调用 Web 搜索工具检索，再依据真实结果作答，"
        "并在末尾用「参考来源」列出引用链接（含发布日期）。"
    )
    

因为两者调用的是同一个 Web Search Tool，工具返回的原始检索内容也是一致的——都直接命中具体的模型发布事件、带精确到分钟的 publishedDate（以下为 2026-06-22 一次真实运行的截取）：
    
    
    ① Web Search 工具返回的原始内容（10 条，节选，每条带 publishedDate）：
    - Z.ai's 1M-Context AI Model (GLM-5.2)                 [2026-06-13 03:30 PDT]
    - Anthropic Released Claude Mythos 5 and Claude Fable 5 [2026-06-12 08:00 PDT]
    - GLM-5.2 Lands on Z.ai's Coding Plan                   [2026-06-12 16:00 PDT]
    - Alignment Fix and 1.5M Token Context Inside (GPT-5.6) [2026-06-21 11:28 PDT]
    - What is GLM-5.2? Z.ai's open model explained (2026)   [2026-06-21 09:35 PDT]
    ...  # 均指向具体发布事件、时间戳精确，且含当天（6/21）内容
    

下面依次看两个框架各自的接入代码，以及 Agent 依据上述检索结果生成的最终回答。

### 5.2 Strands Agents

Strands 的 MCPClient 直接接受一个「返回已签名传输流」的工厂函数，把 aws_iam_streamablehttp_client 传进去即可完成 SigV4 接入。list_tools_sync() 会发现带 target 前缀的工具，直接交给 Agent 即可：
    
    
    from strands import Agent
    from strands.models import BedrockModel
    from strands.tools.mcp import MCPClient
    from mcp_proxy_for_aws.client import aws_iam_streamablehttp_client
    model = BedrockModel(model_id="global.anthropic.claude-opus-4-8",
                         region_name="ap-northeast-1")     # 东京：LLM 推理
    gateway_mcp = MCPClient(lambda: aws_iam_streamablehttp_client(
        endpoint=GW_URL, aws_service="bedrock-agentcore", aws_region=GW_REGION))
    with gateway_mcp:
        tools = gateway_mcp.list_tools_sync()   # -> ['web-search-tool___WebSearch']
        agent = Agent(model=model, system_prompt=SYSTEM_PROMPT, tools=tools)
        print(agent(QUERY))
    ② Agent 最终回答（端到端 ~32 s，截取）：
    ### 1. Claude Fable 5 / Mythos 5（Anthropic，6 月 9 日）
       闭源旗舰，Artificial Analysis 智能指数 60，曾居榜首。
    ### 2. Z.ai GLM-5.2（6 月 13 日宣布 / 6 月 16 日开放）
       744B MoE、约 40B 活跃参数、100 万 token 上下文，MIT 许可。
    ### 即将发布：GPT-5.6（Polymarket 预测 6/22-28）
    ### 参考来源
    - Anthropic Released Claude Mythos 5 / Fable 5 — DeepLearning.AI（2026-06-12）
    - China's Z.AI Releases GLM-5.2 — Decrypt（2026-06-18）
    

### 5.3 LangChain（+ LangGraph）

LangChain 生态用 langchain-mcp-adapters 的 load_mcp_tools 把一个已初始化的 MCP 会话里的工具加载为 LangChain 工具，再用 LangGraph 的 create_react_agent 组装成 Agent。SigV4 同样交给 aws_iam_streamablehttp_client 处理，模型用 langchain_aws 的 ChatBedrockConverse：
    
    
    import asyncio
    from mcp import ClientSession
    from mcp_proxy_for_aws.client import aws_iam_streamablehttp_client
    from langchain_mcp_adapters.tools import load_mcp_tools
    from langgraph.prebuilt import create_react_agent
    from langchain_aws import ChatBedrockConverse
    model = ChatBedrockConverse(model="global.anthropic.claude-opus-4-8",
                                region_name="ap-northeast-1")
    async def main():
        async with aws_iam_streamablehttp_client(
            endpoint=GW_URL, aws_service="bedrock-agentcore", aws_region=GW_REGION,
        ) as (read, write, *_):
            async with ClientSession(read, write) as session:
                await session.initialize()
                tools = await load_mcp_tools(session)   # 发现 web-search-tool___WebSearch
                agent = create_react_agent(model, tools)
                result = await agent.ainvoke({"messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user",   "content": QUERY},
                ]})
                print(result["messages"][-1].content)
    asyncio.run(main())
    ② Agent 最终回答（result["messages"][-1].content，截取）：
    根据实时检索，2026 年 6 月发布的最新大模型包括：
    - Claude Fable 5 / Mythos 5（Anthropic，6 月 9 日）——闭源旗舰；
    - Z.ai GLM-5.2（6 月 13 日宣布 / 16 日开放）——744B MoE、100 万 token 上下文、MIT；
    - 即将发布：GPT-5.6。
    参考来源：
    - DeepLearning.AI The Batch（2026-06-12）
    - Decrypt（2026-06-18）
    

### 5.4 小结：换框架，业务代码几乎不动

两个框架、同一个 Gateway 端点、同一条查询，拿到的原始检索内容完全一致，最终都能给出「有据可依」的回答——差别只在各框架自己的胶水代码:Strands 与 LangChain 都直接接受已签名的 MCP 传输流(aws_iam_streamablehttp_client)。这正好印证了 Web Search Tool 「MCP 原生、框架无关」的价值:换框架时业务代码几乎不动,工具侧零改动。两者的接入要点汇总如下:

框架 | MCP 接入 API | SigV4 接入方式 | 模型（本文示例）  
---|---|---|---  
Strands Agents | MCPClient + list_tools_sync() | aws_iam_streamablehttp_client（内嵌直签） | BedrockModel（Opus 4.8）  
LangChain + LangGraph | load_mcp_tools + create_react_agent | aws_iam_streamablehttp_client（内嵌直签） | ChatBedrockConverse（Opus 4.8）  
  
## **六．使用场景建议**

以下几类场景特别适合直接采用 Web Search Tool，而不必自建搜索集成：

  * 最新资讯研究：检索当前事件、股价、近期发布等，结合来源引用合成回答；
  * 事实核查：通过搜索一手来源、借助知识图谱的事实性答案，确认或纠正文档中的数字；
  * 竞争情报：从公开 Web 来源监控竞品公告、产品发布或价格变化；
  * 消除知识陈旧：让 Agent 访问训练截止之后发布的信息，如新软件版本、政策变更或突发进展。



## **七．总结**

Web Search Tool 把过去需要自建的「采购搜索 API + 管密钥配额 + 解析结果 + 抽摘要 + 担心数据外流」一整套工程，收敛成了 AgentCore Gateway 上的一个内置连接器：一条 `create_gateway_target` 调用接入，两条 IAM 权限授权，Agent 即可通过标准 MCP 用上覆盖数百亿文档、分钟级更新、且查询不离开亚马逊云科技的 Web 搜索能力。

**下一步行动：**

**相关产品：**

  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=1>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon IAM](<https://aws.amazon.com/cn/iam/?p=bl_pr_iam_l=2>) — 身份管理和访问权限
  * [Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/?p=bl_pr_bedrock-agentcore_l=3>) — 加快代理投入生产的速度
  * [Amazon Cognito](<https://aws.amazon.com/cn/cognito/?p=bl_pr_cognito_l=4>) — 安全注册和登录
  * [Amazon Glue](<https://aws.amazon.com/cn/glue/?p=bl_pr_glue_l=5>) — 简单、可扩展的无服务器数据集成



**相关文章：**

  * [自己的工具自己控：MCP Server、Amazon Bedrock AgentCore、Quick Suite集成指南](<https://aws.amazon.com/cn/blogs/china/tool-mcp-server-amazon-bedrock-agentcore-quick/?p=bl_ar_l=1>)
  * [利用 Amazon Bedrock AgentCore 快速为您的 Agent 接入联网搜索和网页浏览](<https://aws.amazon.com/cn/blogs/china/leveraging-amazon-bedrock-agentcore-quick/?p=bl_ar_l=2>)
  * [Add web search and browsing to your agents with Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/blogs/china/leveraging-amazon-bedrock-agentcore-quick-en/?p=bl_ar_l=3>)
  * [使用Amazon Bedrock + 自建ECS Docker Sandbox实现Agent 程序化工具调用Programmatic Tool Calling](<https://aws.amazon.com/cn/blogs/china/programmatic-tool-calling-agent-using-bedrock-and-ecs-docker-sandbox/?p=bl_ar_l=4>)
  * [把 OpenClaw 从个人助手变成客服：一次信任模型的翻转](<https://aws.amazon.com/cn/blogs/china/openclaw-from-personal-assistant-to-customer-service-a-trust-model-flip/?p=bl_ar_l=5>)



## **八．参考链接**

  * [AWS News Blog（2026-06-17，GA 公告）：Announcing Web Search on Amazon Bedrock AgentCore](<https://aws.amazon.com/blogs/aws/announcing-web-search-on-amazon-bedrock-agentcore-ground-your-ai-agents-in-current-accurate-web-knowledge/>)
  * [Amazon Bedrock AgentCore 开发者指南：Web Search Tool](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway-target-connector-web-search-tool.html>)
  * [Define the gateway target configuration（含 Web Search 的 SDK/CLI 示例与 IAM 策略）](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway-add-target-api-target-config.html>)
  * [Strands Agents 文档：MCP Tools](<https://strandsagents.com/latest/documentation/docs/user-guide/concepts/tools/mcp-tools/>)
  * [langchain-mcp-adapters（LangChain，GitHub）](<https://github.com/langchain-ai/langchain-mcp-adapters>)
  * [Model Context Protocol（MCP）](<https://modelcontextprotocol.io/>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 杨探

亚马逊云科技解决方案架构师，负责互联网行业云端架构咨询和设计。

### 王文巍

亚马逊云科技资深解决方案架构师，10 多年互联网企业研发、团队管理经验，主要专注于电商、新零售、社交媒体等领域。

### 裴秋利

亚马逊云科技解决方案架构师，多年互联网行业沉淀，精通 OPS/SRE/大数据平台设计与团队管理。现专注零售电商领域架构设计，提供高效云原生解决方案，助力客户业务数字化转型与创新增长。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
