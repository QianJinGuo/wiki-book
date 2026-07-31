# Apple Foundation Models

## Ch01.154 Apple Foundation Models

> 📊 Level ⭐ | 3.7KB | `entities/anthropic-apple-foundation-models-claude.md`

# Apple Foundation Models

> Source: [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/anthropic-apple-foundation-models-claude.md)


## 概念导图

```mermaid
mindmap
  root(("Apple Foundation Models"))
    内容提炼
    关键洞察
    实践启示
    相关实体
```

## 核心要点

- **来源**: https://platform.claude.com/docs/en/cli-sdks-libraries/libraries/apple-foundation-models
- **评分**: v=7, c=7, v×c=49, stars=4
- **评估理由**: Solid technical documentation for integrating Claude with Apple's Foundation Models framework via a Swift package. Well-structured with clear sections on installation, quick start, model selection, effort levels, and authentication (dev vs production). Authoritative source from Anthropic. Notable do

## 内容提炼

```mermaid
graph TB
    subgraph "边缘层"
        CDN[CDN/缓存] --> LB[负载均衡]
        LB --> GW[API Gateway<br/>认证+限流]
    end
    subgraph "服务层"
        SVC_A[业务服务A]
        SVC_B[业务服务B]
        AGENT_SVC[Agent 服务]
    end
    GW --> SVC_A & SVC_B & AGENT_SVC
    subgraph "Agent 运行时"
        SANDBOX[沙箱隔离]
        RUNTIME[执行引擎]
        POOL[连接池]
    end
    AGENT_SVC --> SANDBOX --> RUNTIME
    RUNTIME --> POOL
    subgraph "数据层"
        DB[(关系数据库)]
        CACHE[(Redis缓存)]
        OBJ[(对象存储)]
        VDB[(向量数据库)]
    end
    SVC_A --> DB & CACHE
    AGENT_SVC --> OBJ & VDB
    classDef edge fill:#fef3c7,stroke:#d97706
    classDef svc fill:#dbeafe,stroke:#2563eb
    classDef runtime fill:#ede9fe,stroke:#7c3aed
    classDef data fill:#d1fae5,stroke:#059669
    class CDN,LB,GW edge
    class SVC_A,SVC_B,AGENT_SVC svc
    class SANDBOX,RUNTIME,POOL runtime
    class DB,CACHE,OBJ,VDB data
```


Markdown Content:
CLI, SDKs, and libraries Libraries and integrations

Use Claude on Apple platforms through the Foundation Models framework with the Claude for Foundation Models Swift package.

[Claude for Foundation Models](https://github.com/anthropics/ClaudeForFoundationModels) is a Swift package that makes Claude available as a server-side language model in Apple's [Foundation Models](https://developer.apple.com/documentation/foundationmodels) framework. The package conforms Claude to the framework's `LanguageModel` protocol, so you drive it with the same `LanguageModelSession` API you use for Apple's on-device model: `respond(to:)`, streaming, guided generation, and tool calling all work the same way.

Requests go directly from your app to the Claude API; Apple is not in the request path and does not see prompts or responses. Usage is billed to your Anthropic account at [standard API pricing](https://platform.claude.com/docs/en/about-claude/pricing). Your app decides when to use Claude and when to use Apple's on-device model: pass whichever model you want to each session.

**Beta.** This package targets the Foundation Models server-side language model API introduced in the OS

## 关键洞察

- Beta.** This package targets the Foundation Models server-side language model API introduced in the OS 27 betas. APIs may change before general availability.
- iOS 27, macOS 27, visionOS 27, or watchOS 27 (all in beta): the OS releases whose Foundation Models framework supports server-side language models
- ### When to use Claude versus the on-device model
- Prompt caching controls (the package applies prompt caching automatically; cache TTL and breakpoint placement are not configurable)

## 实践启示

- 文章的核心论点可在生产环境验证
- 与现有实体的差异化角度：本文来自 platform.claude.com 视角
- 引用源：[Anthropic Apple Foundation Models Claude](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/anthropic-apple-foundation-models-claude.md)
## 相关实体
- [from doer to director: the ai mindset shift](ch01/031-from-doer-to-director-the-ai-mindset-shift.html)
- [why internally-built ai fails fund accounting audits](ch01/130-why-internally-built-ai-fails-fund-accounting-audits.html)
- [back up and restore your amazon eks cluster resources using](../ch11/013-back-up-and-restore-your-amazon-eks-cluster-resources-using.html)

---

