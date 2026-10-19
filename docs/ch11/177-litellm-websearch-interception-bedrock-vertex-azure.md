# LiteLLM WebSearch Interception 配置指南：让 Bedrock/Vertex/Azure 走代理 + 实时联网

> 📊 Level ⭐⭐⭐⭐⭐ | 12.8KB

> [!abstract] **WebSearch Interception 是 LiteLLM 在 1.84.0+ 引入的"代理自动加 web search"能力**：当上游 provider（Bedrock/Vertex/Azure）本身不暴露原生 web search 工具时，LiteLLM 中间层会拦截 LLM 的 tool call 调用，自动改走本地 SearXNG 实例执行搜索，把结果以 Anthropic `web_search_20250305` 工具的格式回传给模型。整篇文章是 AWS China Blog 2026-06-12 发布的一份"踩坑 + 配置 + 调用 + 引用实现"实操手册，价值在于把 LiteLLM 官方文档没写清楚的版本要求、env 变量命名、agentic loop 限制全部用实跑案例补齐。
> 来源：[原文存档](https://aws.amazon.com/cn/blogs/china/bedrock-claude-litellm-websearch)

## 三个独有贡献（与现有 3 篇 LiteLLM entity 互补）

1. **WebSearch Interception 的内部机制** — 不依赖 provider 原生 web search 能力，LiteLLM 在中间层劫持 tool call 并回填为 `web_search_20250305` 格式，3 家 provider（Bedrock/Vertex/Azure）通用
2. **LiteLLM 1.83.x → 1.84.0 强制升级点** — v1.83.x 对 Bedrock Converse 路径**不支持** agentic loop，必须用 v1.84.0+ 才能完成"搜索 → 结果回传 → LLM 二次调用"的完整闭环
3. **5 大踩坑点**（searxng JSON 格式 / 端口 8888 / agentic loop 在 `/chat/completions` 不工作 / `web_search_20250305` 工具名 / Citation 实现）— 官方文档未提及，全部实跑验证

## WebSearch Interception 工作原理

```
[LLM Client] → /v1/messages (Anthropic 格式)
                ↓
            [LiteLLM Proxy]
                ↓ (拦截 tool call)
            [SearXNG 本地实例 (port 8888)]
                ↓ (返回 JSON 搜索结果)
            [LiteLLM 改写 tool 为 web_search_20250305]
                ↓
            [返回给 LLM，模型用引用 + 总结继续]
```

**关键约束**：
- 必须是 **Anthropic `/v1/messages` 格式**（不是 OpenAI `/chat/completions`），否则 agentic loop 不工作
- **LiteLLM Docker 镜像 ≥ 1.84.0-dev.2**（v1.83.x 对 Bedrock Converse 路径缺失 agentic loop 支持）
- **SearXNG 必须启用 JSON 格式输出**（`search.formats: [html, json]`）
- **SEARXNG_BASE_URL 环境变量**指向实际部署的 SearXNG 实例，命名容易写错为 `SEARXNG_API_BASE`（无效）

## 完整 Docker Compose 部署（4 服务）

```yaml
services:
  searxng:
    image: searxng/searxng
    ports: ["8888:8080"]
    volumes:
      - ./searxng-settings.yml:/etc/searxng/settings.yml:ro
    environment:
      - SEARXNG_BASE_URL=http://localhost:8888

  litellm:
    image: ghcr.io/berriai/litellm:1.84.0-dev.2
    ports: ["4000:4000"]
    volumes:
      - ./litellm-config.yaml:/app/config.yaml
    environment:
      - SEARXNG_API_BASE=http://searxng:8080  # LiteLLM 通过这个找到 SearXNG
      - AWS_ACCESS_KEY_ID=...
      - AWS_SECRET_ACCESS_KEY=...
      - AWS_REGION_NAME=us-east-1
```

**注**：SearXNG 容器内端口是 8080（`SEARXNG_BASE_URL` 写实际访问地址），但 LiteLLM 看到的容器间地址是 `http://searxng:8080`。这个映射关系容易踩坑。

## 踩坑记录（5 条实跑验证）

| 踩坑 | 现象 | 解决 |
|------|------|------|
| v1.83.x Bedrock 路径 | 报"agentic loop not supported on Converse" | 升级到 1.84.0-dev.2 |
| SearXNG 默认 HTML 输出 | LiteLLM 解析失败 | `search.formats: [html, json]` |
| 用 `/chat/completions` 调用 | 工具被识别为 `searxng-search` 而非 `web_search_20250305` | 改用 `/v1/messages` (Anthropic 格式) |
| `SEARXNG_API_BASE` 命名 | LiteLLM 找不到 SearXNG | 必须是 `SEARXNG_API_BASE`（不是 `BASE`） |
| Citation 字段缺失 | LLM 回答不带引用 URL | 启用 SearXNG JSON 的 `results.url` 字段转发 |

## 与现有 LiteLLM 实体的差异化

| 维度 | 现有实体 | 本实体 |
|------|---------|--------|
| **WebSearch 能力** | ❌ 未涉及 | ✅ 唯一覆盖 Interception 机制 |
| **生产级部署** | `litellm-aws-ecs-eks-ai-gateway-architecture` (ECS/EKS 部署) | 仅本地 Docker Compose，未涉及 K8s |
| **成本控制** | `litellm-amazon-bedrock-cost-control-four-layer` | 未涉及 |
| **可视化** | `litellm-amazon-quicksight-visualization-configuration` | 未涉及 |
| **Provider 覆盖** | Bedrock 为主 | Bedrock + Vertex AI + Azure 三家通用 |

**结论**：本文是 AWS China Blog LiteLLM 系列（4 篇中的第 4 篇）的**WebSearch 能力补充**，与前三篇（部署架构/成本控制/可视化）形成完整 LiteLLM 生产化矩阵。

## 深度分析

### 一、为什么拦截点必须落在网关层

逐 provider 各写一套原生工具是直觉方案，但 Bedrock 走 Converse、Azure 走 OpenAI 兼容、Vertex 走自家 tool calling，就有三套 schema 与三套错误语义，同一能力复制三遍且行为各异。放到统一网关换来一块**单一策略面**：谁能搜、搜几次、搜哪家引擎、超时多少，全写在 `websearch_interception_params` 里，一处改动三家生效。其次是**成本归属**：SearXNG 免费、Perplexity/Tavily 按次计费，搜索费用第一次能和模型费用分开计账，这正是 [AI 成本优化框架](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/ai-cost-optimization-framework.md) "把成本拆到可归因维度"的前提。第三是**审计**：query 与返回 URL 全落在代理日志，是唯一能回答"这句话从哪抓来"的位置。

### 二、server-side tool 与 client-side tool 的不对称

Anthropic 原生 `web_search_20250305` 是 **server-side tool**：在模型服务端执行，客户端只见最终文本与 citations 块。三家 provider 都不提供它，LiteLLM 只能把它**降级成 client-side tool**——自己扮演"客户端"跑完 agentic loop 再拼结果。这解释了所有怪现象：`stream: true` 被强制改写成非流式（loop 需完整响应才判断是否要搜）、`max_uses` 压到 3 次、结果以纯文本回传。代理不是在"转发 web search"，而是在**模拟 Anthropic 的一个服务端能力**；模拟得越像，下游 agent 的 [工具使用模式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/tool-use-patterns-ai-agents.md) 才越不用改。

### 三、schema 翻译在哪三处漏水

**citation 块**：SearXNG 给 title/url/snippet，LiteLLM 拼成文本块，`citations` 字段在协议层就丢了；原文靠提示词工程逼模型输出 `[1]` 编号与 References 段，等于让模型自己重建引用，不是协议保证，偶尔会编 URL。**streaming**：流式被整个吃掉，交互退化成"长等待再一次性吐完"。**multi-turn tool result**：结果要作为 tool_result 回灌 Converse，而 Converse 对 tool_result 约束比 Anthropic 更严，超长结果易被截断或分块失败——原文未覆盖，上生产最先撞上的却是它。

### 四、4 服务拓扑是最小可行形状，放大后先坏在搜索侧

原文 compose 只列 searxng + litellm，但 `database_url` 指向 Postgres，实跑是**模型路由 / 搜索执行 / 状态与配额 / 凭证**四件事：没 Postgres 就没有 key 管理与 spend log，没 IAM 只能塞静态 AK/SK。放大到几十租户后先坏的不是模型侧而是**搜索侧**：SearXNG 单实例同步聚合抓取，并发上来 p95 秒级劣化，超时触发重试，重试再放大搜索并发，成典型 retry storm。规模化要动三处：结果缓存或按 query 去重、超时**有限次**退避而非默认重试、搜索次数硬上限与 rate limit 联动。

### 五、没解决的部分

排名仍是黑箱：SearXNG 聚合各引擎原始结果、无相关性重排，模型拿到"前 N 条"而非"最相关 N 条"，这也是不少团队最终换 Tavily/Perplexity 的原因——不是嫌慢，是嫌排序不可控。时效性则完全依赖上游抓取节奏，代理层没有 freshness 保证。合规更硬：抓回内容可能带版权文本、可能来自被封锁站点，而**代理是唯一能拦的位置**，进了上下文只剩事后审计，得靠 [Agent 安全架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-architecture.md) 的内容策略层兜。

## 实践启示

1. **钩子挂 `/v1/messages` 协议入口，不挂 provider adapter**。Bedrock 走 `BedrockConverseLLM`、绕开 `BaseLLMHTTPHandler`，写在 adapter 层等于三家各写一遍且发版不同步。
2. **用三家 provider 跑同一份请求做翻译回归**：单次搜索、`max_uses: 3` 的多轮 loop、`stream: true` 降级、超长结果截断。只测 Bedrock，Azure 的差异会留到上线后。
3. **per-provider 至少四个指标**：搜索调用数、搜索 p95、loop 轮次分布、拦截命中率（带 `web_search` 工具但模型未发起 tool_call 的比例）。末项是发现"模型不肯搜"这类静默失败的唯一手段，也对应 [LLM 可观测性四层模型](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/llm-observability-4-layer-model.md) 的网关层埋点。
4. **搜索失败默认 fail-open 但显式标记**：超时不该让对话直接 500，应回灌 "search unavailable" 的 tool_result 让模型用既有知识作答，同时打 `websearch_degraded=true` 交由调用方决定是否重试。
5. **`SEARXNG_API_BASE` 用环境变量注入，不写进 config.yaml**：config 里 `api_base` 只服务 `/v1/search`，interception handler 只读环境变量，"同一参数两个来源"该单列为配置评审的反模式。

## 引用与延伸

- **同类实体**：`building-web-search-enabled-agents-with-strands-and-exa` — Strands SDK + Exa 实现的 web search agent（不同技术栈对比）
- **AWS China Blog 同期 LiteLLM 矩阵**：
  - [LiteLLM 生产级部署](https://github.com/QianJinGuo/wiki-public/blob/main/entities/litellm-aws-ecs-eks-ai-gateway-architecture.md)
  - [LiteLLM Bedrock 成本管控](https://github.com/QianJinGuo/wiki-public/blob/main/entities/litellm-amazon-bedrock-cost-control-four-layer.md)
  - [LiteLLM QuickSight 可视化](https://github.com/QianJinGuo/wiki-public/blob/main/entities/litellm-amazon-quicksight-visualization-configuration.md)
- 原文存档：[原文存档](https://aws.amazon.com/cn/blogs/china/bedrock-claude-litellm-websearch)

---

