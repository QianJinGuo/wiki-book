---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/bedrock-claude-litellm-websearch
ingested: 2026-06-17
feed_name: AWS China Blog
source_published: 2026-06-17
sha256: 0e44b8408f7833ea23d6ff759c9ee471d6f67bbb965a8a0ef3b730263f0d4537
---

# Bedrock Claude + LiteLLM WebSearch Interception 配置指南

摘要：WebSearch Interception 是 LiteLLM 的一个功能，允许不原生支持 web search 的 LLM provider（如 AWS Bedrock、Azure、Vertex AI）通过 LiteLLM 代理自动执行网页搜索并返回带有实时信息的回答。

**目录**

01 一、概述

02 二、环境要求

03 三、配置步骤

04 四、调用方式

05 五、功能支持情况

06 六、踩坑记录

07 七、Citation（引用）实现方案

08 八、Stream 模式说明

09 九、为什么请求中的 tool 是 web_search_20250305 而不是 searxng-search？

10 十、参考链接

11 十一、结语

* * *

## **一、概述**

WebSearch Interception 是 LiteLLM 的一个功能，允许不原生支持 web search 的 LLM provider（如 [AWS Bedrock](<https://aws.amazon.com/cn/bedrock/>)、Azure、Vertex AI）通过 LiteLLM 代理自动执行网页搜索并返回带有实时信息的回答。

### 1.1 工作原理

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/12/bedrock-claude-litellm-websearch-1.png>) [图1：WebSearchInterception]  
---  
  
## **二、环境要求**

组件 | 版本/要求  
---|---  
LiteLLM Docker 镜像 | ghcr.io/berriai/litellm:1.84.0-dev.2（v1.84.0+）  
SearXNG | 自部署实例，需启用 JSON 格式输出  
调用端点 | /v1/messages（Anthropic 格式，不是 /chat/completions）  
  
重要： v1.83.x 版本对 Bedrock Converse 路径不支持 agentic loop，必须使用 v1.84.0+。 

## **三、配置步骤**

### 3.1 部署 SearXNG
    
    
    docker run -d -p 8888:8080 \
      -v $(pwd)/searxng-settings.yml:/etc/searxng/settings.yml:ro \
      -e SEARXNG_BASE_URL=http://localhost:8888 \
      searxng/searxng
    

searxng-settings.yml 中必须启用 JSON 格式：
    
    
    search:
      formats:
        - html
        - json
    

验证 SearXNG 是否正常：
    
    
    curl "http://127.0.0.1:8888/search?q=test&format=json" | head -50
    

### 3.2 配置 LiteLLM（litellm_config.yaml）
    
    
    model_list:
      - model_name: bedrock-claude-opus-4-6-v1
        litellm_params:
          model: bedrock/us.anthropic.claude-opus-4-6-v1
          api_key: os.environ/AWS_BEARER_TOKEN_BEDROCK
    
    litellm_settings:
      callbacks:
        - "websearch_interception"
      websearch_interception_params:
        enabled_providers:
          - bedrock
          - bedrock_converse
          - azure
        search_tool_name: searxng-search
    
    search_tools:
      - search_tool_name: searxng-search
        litellm_params:
          search_provider: searxng
          api_base: http://host.docker.internal:8888
    
    general_settings:
      master_key: sk-1234
      database_url: "postgresql://litellm:xxx@host.docker.internal:5432/litellm"
    

### 3.3 启动 LiteLLM Docker
    
    
    docker run -d \
      -p 4000:4000 \
      -e SEARXNG_API_BASE=http://host.docker.internal:8888 \
      -e DATABASE_URL=postgresql://litellm:xxx@host.docker.internal:5432/litellm \
      -v $(pwd)/litellm_config.yaml:/app/config.yaml \
      ghcr.io/berriai/litellm:1.84.0-dev.2 \
      --config /app/config.yaml --detailed_debug
    

关键： 必须设置环境变量 SEARXNG_API_BASE。config.yaml 中的 api_base 只对 /v1/search 端点生效，WebSearch Interception handler 内部只读环境变量。 

### 3.4 验证搜索端点
    
    
    curl http://0.0.0.0:4000/v1/search/searxng-search \
      -H "Authorization: Bearer sk-1234" \
      -H "Content-Type: application/json" \
      -d '{"query": "NVIDIA stock", "max_results": 3}'
    

## **四、调用方式**

### 4.1 正确方式：通过 /v1/messages（Anthropic 格式）
    
    
    curl http://0.0.0.0:4000/v1/messages \
      -H "Content-Type: application/json" \
      -H "x-api-key: sk-1234" \
      -H "anthropic-version: 2023-06-01" \
      -d '{
        "model": "bedrock-claude-opus-4-6-v1",
        "max_tokens": 1024,
        "messages": [
          {"role": "user", "content": "What are the latest news about NVIDIA stock today?"}
        ],
        "tools": [
          {
            "type": "web_search_20250305",
            "name": "web_search",
            "max_uses": 3
          }
        ]
      }'
    

### 4.2 用 Claude Code 连接
    
    
    export ANTHROPIC_BASE_URL=http://localhost:4000
    export ANTHROPIC_API_KEY=sk-1234
    claude
    

Claude Code 会自动通过 /v1/messages 调用，web search 自动生效。

### 4.3  不支持的方式

通过 /chat/completions（OpenAI 格式）调用 Bedrock 不会触发 agentic loop：
    
    
    # 这个不会自动搜索，只会返回 tool_call 给客户端
    curl http://0.0.0.0:4000/chat/completions \
      -d '{"model":"bedrock-claude-opus-4-6-v1", "tools":[...], ...}'
    

## **五、功能支持情况**

功能 | 状态 | 说明  
---|---|---  
/v1/messages + Bedrock + web search |  | 完整支持  
/chat/completions + Bedrock |  | Bedrock Converse 路径无 agentic loop  
Stream 模式 |  | 内部强制转为非流式，最终一次性返回完整结果  
Citation（来源引用） |  | 搜索结果作为纯文本传给模型，无结构化引用  
多次搜索（max_uses > 1） |  | 最多 3 次 agentic loop  
SearXNG 免费搜索 |  | 无 API 费用  
Perplexity/Tavily 搜索 |  | 需要 API Key  
  
## **六、踩坑记录**

### 6.1 启动报错：’dict’ object has no attribute ‘startswith’

原因： 文档中的 config 格式（dict 嵌套在 callbacks 里）与源码实际实现不一致。

错误写法（文档中的）：
    
    
    callbacks:
      - websearch_interception:
          enabled_providers: [bedrock]
    

正确写法：
    
    
    callbacks:
      - "websearch_interception"
    websearch_interception_params:
      enabled_providers: [bedrock]
    

### 6.2 回调注册了但不生效

原因： 用了 success_callback 而不是 callbacks。

  * success_callback → 只把字符串加到列表，不实例化 handler
  * callbacks → 触发 initialize_callbacks_on_proxy，正确实例化 WebSearchInterceptionLogger



### 6.3 Agentic loop 不触发（/chat/completions）

原因： Bedrock 走 BedrockConverseLLM（继承 BaseAWSLLM），不经过 BaseLLMHTTPHandler，后者才有 _call_agentic_chat_completion_hooks。

解决： 改用 /v1/messages 端点。

### 6.4 搜索失败：SEARXNG_API_BASE is not set

原因： WebSearch Interception handler 内部调用 litellm.asearch() 时不传递 config 中的 api_base，只读环境变量 SEARXNG_API_BASE。

解决： Docker 启动时加 -e SEARXNG_API_BASE=http://host.docker.internal:8888。

### 6.5 v1.83.x 版本不支持，需要v1.84.x

原因： v1.83.14 的 BedrockConverseLLM 没有 agentic loop 集成。

解决： 升级到 ghcr.io/berriai/litellm:1.84.0-dev.2。

## **七、Citation（引用）实现方案**

虽然 LiteLLM WebSearch Interception 不支持 Anthropic 原生的结构化 citations 字段，但可以通过提示词工程让模型在回答中生成格式化的引用。

### 7.1 带 Citation 的请求示例
    
    
    curl -s --max-time 120 http://0.0.0.0:4000/v1/messages \
      -H "Content-Type: application/json" \
      -H "x-api-key: sk-1234" \
      -H "anthropic-version: 2023-06-01" \
      -d '{
        "model": "bedrock-claude-opus-4-6-v1",
        "max_tokens": 2048,
        "messages": [
          {"role": "user", "content": "What are the latest news about NVIDIA stock today?\n\nIMPORTANT: Format your response with inline citations [1][2][3] for every claim. At the end, include a \"## References\" section listing each source with its number, title, and full URL.\n\nExample format:\nNVIDIA stock rose 5% today [1]. Revenue hit $68B [2].\n\n## References\n[1] \"NVIDIA Stock Surges 5%\" - https://finance.yahoo.com/quote/NVDA\n[2] \"NVIDIA Q4 Earnings\" - https://www.cnbc.com/nvidia-earnings"}
        ],
        "tools": [
          {
            "type": "web_search_20250305",
            "name": "web_search",
            "max_uses": 3
          }
        ]
      }'
    

### 7.2 返回结果示例

模型会返回带有完整引用的回答：
    
    
    NVIDIA shares are trading around **$196.85–$197.78**, with a slight decline of
    approximately **0.39%** during today's session [1][2].
    
    CEO Jensen Huang stated that Nvidia now has "zero percent" market share in China,
    adding that U.S. export policy "has already largely backfired" [3].
    
    NVIDIA reported record revenue of **$68.1 billion** for Q4 fiscal 2026, up 73%
    year-over-year [8].
    
    ## References
    [1] "NVIDIA (NVDA) Stock price today" - https://www.kraken.com/stocks/nvda
    [2] "NVIDIA: NVDA Stock Price Quote" - https://robinhood.com/us/en/stocks/NVDA/
    [3] "NVIDIA Corp (NVDA) Stock Price & News" - https://www.google.com/finance/...
    ...
    [9] "NVIDIA Stock Chart" - https://www.tradingview.com/symbols/NASDAQ-NVDA/
    

### 7.3 原理说明

SearXNG 返回的搜索结果包含 Title 和 URL，LiteLLM 将其格式化为：
    
    
    Title: NVIDIA Stock Surges
    URL: https://finance.yahoo.com/quote/NVDA
    Snippet: NVIDIA stock rose 5% today...
    

模型基于这些信息，按照提示词中的格式要求，自动将 URL 映射为引用编号。

## **八、Stream 模式说明**

### 8.1 测试 Stream 请求
    
    
    curl -s --max-time 120 http://0.0.0.0:4000/v1/messages \
      -H "Content-Type: application/json" \
      -H "x-api-key: sk-1234" \
      -H "anthropic-version: 2023-06-01" \
      -d '{
        "model": "bedrock-claude-opus-4-6-v1",
        "max_tokens": 1024,
        "stream": true,
        "messages": [
          {"role": "user", "content": "What are the latest news about NVIDIA stock today?"}
        ],
        "tools": [
          {
            "type": "web_search_20250305",
            "name": "web_search",
            "max_uses": 3
          }
        ]
      }'
    

### 8.2 实际行为

即使传入 “stream”: true，WebSearch Interception 内部会强制转为非流式，最终一次性返回完整 JSON 结果（不是 SSE 事件流）。

原因： Agentic loop 需要拿到模型的完整响应才能判断是否有 tool_call 需要拦截执行搜索。源码中的处理逻辑：
    
    
    # handler.py pre-call hook
    if kwargs.get("stream"):
        kwargs["stream"] = False
        kwargs["_websearch_interception_converted_stream"] = True
    

### 8.3 影响

  * 响应时间较长（需要等待：LLM 调用 → 搜索执行 → 再次 LLM 调用 全部完成）
  * 客户端不会收到中间的 SSE 事件
  * 最终返回的是完整的 JSON response，格式与非 stream 请求一致



### 8.4 如果需要 Stream

当前版本不支持 WebSearch Interception + Stream 同时工作。如果必须要流式输出，可以： 1. 不使用 WebSearch Interception，在客户端自己实现 tool loop 2. 等待 LiteLLM 后续版本支持（可能会在搜索完成后对 follow-up 请求启用 stream）

## **九、为什么请求中的 tool 是 web_search_20250305 而不是 searxng-search？**

这是一个常见疑问。请求中的 tools 和 config 中的 search_tools 是两个不同层面的概念：

### 9.1 两层架构
    
    
    ┌─────────────────────────────────────────────────────────┐
    │  客户端层（curl / Claude Code）                          │
    │  tools: [{type: "web_search_20250305"}]                 │
    │  → 告诉模型"你有搜索能力"                                │
    └────────────────────────┬────────────────────────────────┘
                             │ Anthropic 协议
                             ▼
    ┌─────────────────────────────────────────────────────────┐
    │  LiteLLM 代理层                                         │
    │  1. 拦截 web_search_20250305 → 转为 litellm_web_search  │
    │  2. 模型返回 tool_call 后                                │
    │  3. 根据 config 中 search_tool_name: "searxng-search"   │
    │     找到 search_provider: searxng + api_base            │
    └────────────────────────┬────────────────────────────────┘
                             │ HTTP 请求
                             ▼
    ┌─────────────────────────────────────────────────────────┐
    │  搜索引擎层（SearXNG :8888）                             │
    │  实际执行搜索，返回结果                                   │
    └─────────────────────────────────────────────────────────┘
    

### 9.2 对照表

| 请求中的 tools | Config 中的 search_tools  
---|---|---  
作用 | 定义模型可用的工具接口 | 定义实际搜索引擎实现  
谁看 | LLM 模型 | LiteLLM handler  
格式 | Anthropic 原生协议 | LiteLLM 内部配置  
值 | web_search_20250305 | searxng-search  
可替换 | 固定（协议标准） | 可换为 perplexity/tavily 等  
  
### 9.3 为什么这样设计

1\. 客户端无需修改 — Claude Code 等工具以为在用 Anthropic 原生 web search，实际上 LiteLLM 在背后用 SearXNG 替代

2\. 搜索引擎可插拔 — 只需改 config 中的 search_provider，不影响客户端代码

3\. 协议兼容 — 保持与 Anthropic API 的完全兼容

简单说：web_search_20250305 是接口协议（给模型看的），searxng-search 是实现引擎（给 LiteLLM 用的）。

## **十、参考链接**

  * [LiteLLM WebSearch Interception 文档](<https://docs.litellm.ai/docs/integrations/websearch_interception>)
  * [Claude Code WebSearch 文档](<https://docs.litellm.ai/docs/tutorials/claude_code_websearch>)
  * [SearXNG 官方文档](<https://docs.searxng.org/>)
  * [SearXNG 快速部署](<https://github.com/BerriAI/serxng-deployment>)
  * [LiteLLM GitHub](<https://github.com/BerriAI/litellm>)



## **十一、结语**

**下一步行动：**

**相关产品：**

  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=1>) — 用于构建生成式人工智能应用程序和代理的端到端平台



**相关文章：**

  * [使用Logstash在线迁移 Amazon OpenSearch Service](<https://aws.amazon.com/cn/blogs/china/using-logstash-for-online-migration-of-amazon-opensearch-service/?p=bl_ar_l=1>)
  * [基于Amazon Bedrock 上实现 Dynamic Filtering Web Search 与 Web Fetch](<https://aws.amazon.com/cn/blogs/china/based-on-amazon-bedrock-implement-dynamic-filtering-web-search-web-fetch/?p=bl_ar_l=2>)
  * [AWS Security Agent 渗透测试实操](<https://aws.amazon.com/cn/blogs/china/aws-security-agent-testing/?p=bl_ar_l=3>)
  * [CloudHSM的Java SDK使用及IoT场景加密体系设计最佳实践（上）](<https://aws.amazon.com/cn/blogs/china/aws-cloudhsm-getting-started-and-iot-scenario-encryption-algorithm-design-best-practices-1/?p=bl_ar_l=4>)
  * [用 Strands Agents SDK 构建确定性数据分析：语义层 + VQR 在 Amazon Bedrock 上的实践](<https://aws.amazon.com/cn/blogs/china/strands-agents-sdk-build-analytics-layer-vqr-amazon-bedrock-practice/?p=bl_ar_l=5>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 张振华

亚马逊云科技解决方案架构师，负责基于亚马逊云科技的云计算方案的架构和设计，在 Edge、Serverless 、容器化，微服务架构，云原生 DevOps 等方向具有丰富的实践经验。自加入亚马逊云科技后，专注于游戏行业，以及 GenAI 在游戏行业的应用。

### 刘振华

亚马逊云科技高级解决方案架构师。在加入 AWS 之前，曾在埃森哲、众安保险、华为等企业担任核心技术岗位，主导过多个大型软件系统的架构设计、研发交付与项目管理，积累了丰富的企业级实战经验。深耕 SaaS 与企业数智化转型领域，为金融、医疗健康与生命科学（HCLS）等行业客户提供云架构规划、迁移上云及现代化改造等技术咨询与赋能服务。当前聚焦于生成式 AI 技术在中国企业的落地实践，围绕 AI 编程助手、智能数据分析、AI for Science 等方向，帮助客户探索创新路径，加速业务智能化升级。

### 杨姝颖

亚马逊云科技解决方案架构师，在互联网行业工作多年，对推荐系统、广告投放引擎有丰富的开发经验。同时专注于生成式 AI 在中国区不同行业的落地和推广。

* * *

## 2026 亚马逊云科技中国峰会

智能投标、AI 质检、财务自动化、智能客服——生产级 Agent 全天开放体验。 [](<https://aws.amazon.com/cn/events/summits/shanghai/?ectrk=jyLXNovBYB51qgzUEipIpZcxlfE5%2Bs7NfDTnZwR7hFYtQmPUSToTuN%2FZO5doh20ZJ%2FloW6Rom0l3P4LLcoyUPA%3D%3D&sc_icampaign=glb-summit-blog-p1&sc_ichannel=ha&sc_iplace=blog&trk=ab30be54-aedd-480a-9364-ab0bf98e982d>) |   
---|---
