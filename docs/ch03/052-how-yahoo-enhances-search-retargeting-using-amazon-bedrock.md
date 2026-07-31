# How Yahoo enhances search retargeting using Amazon Bedrock

## Ch03.052 How Yahoo enhances search retargeting using Amazon Bedrock

> 📊 Level ⭐ | 2.0KB | `entities/how-yahoo-enhances-search-retargeting-using-amazon-bedrock.md`

# How Yahoo enhances search retargeting using Amazon Bedrock

> **Background**: Based on the AWS ML Blog article describing Yahoo's implementation of Amazon Bedrock to enhance Search Retargeting (SRT) capabilities in their omnichannel Demand-Side Platform (DSP).


## 概念导图

```mermaid
mindmap
  root(("How Yahoo enhances search"))
    Business Context
    Technical Implementation
```

## Business Context

Yahoo's omnichannel DSP enables advertisers to purchase ad inventory across multiple exchanges and channels through a single interface. Search Retargeting (SRT) is a core audience targeting solution that helps advertisers reach users based on their historical search behavior, bridging search intent with display, video, and native advertising.

Traditional keyword expansion approaches struggle with outdated vocabulary, limited semantic understanding, and inability to capture nuanced meaning behind search queries.

## Technical Implementation

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


Yahoo implemented Amazon Bedrock to enhance their SRT capabilities using:

- **ML-based audience segmentation**: Using advertiser-defined rules, ML, and generative AI to define audience segments
- **Search intent bridging**: Connecting search activity on Yahoo Search and integrated partner systems with ad targeting
- **Semantic understanding**: Using LLMs to go beyond simple keyword matching to understand the nuanced meaning behind search queries

The system targets users based on demonstrated interests and behaviors, particularly their search activity, which is one of the strongest signals of user intent.

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/how-yahoo-enhances-search-retargeting-using-amazon-bedrock.md)

---

