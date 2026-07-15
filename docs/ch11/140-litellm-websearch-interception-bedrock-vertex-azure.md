# LiteLLM WebSearch Interception 配置指南：让 Bedrock/Vertex/Azure 走代理 + 实时联网

## Ch11.140 LiteLLM WebSearch Interception 配置指南：让 Bedrock/Vertex/Azure 走代理 + 实时联网

> 📊 Level ⭐⭐ | 7.8KB | `entities/litellm-websearch-interception-bedrock-vertex-azure.md`

> [!abstract] **WebSearch Interception 是 LiteLLM 在 1.84.0+ 引入的"代理自动加 web search"能力**：当上游 provider（Bedrock/Vertex/Azure）本身不暴露原生 web search 工具时，LiteLLM 中间层会拦截 LLM 的 tool call 调用，自动改走本地 SearXNG 实例执行搜索，把结果以 Anthropic `web_search_20250305` 工具的格式回传给模型。整篇文章是 AWS China Blog 2026-06-12 发布的一份"踩坑 + 配置 + 调用 + 引用实现"实操手册，价值在于把 LiteLLM 官方文档没写清楚的版本要求、env 变量命名、agentic loop 限制全部用实跑案例补齐。
> 来源：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/bedrock-claude-litellm-websearch-interception-配置指南.md)

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

## 引用与延伸

- **同类实体**：`building-web-search-enabled-agents-with-strands-and-exa` — Strands SDK + Exa 实现的 web search agent（不同技术栈对比）
- **AWS China Blog 同期 LiteLLM 矩阵**：
  - [LiteLLM 生产级部署](../ch01/953-llm.html)
  - [LiteLLM Bedrock 成本管控](ch11/042-litellm-amazon-bedrock.html)
  - [LiteLLM QuickSight 可视化](ch11/213-amazon-quick.html)
- 原文存档：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/bedrock-claude-litellm-websearch-interception-配置指南.md)

---

