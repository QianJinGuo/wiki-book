# Build Specialized Agent Workflows for Your Business with Amazon Bedrock

## Ch04.677 Build Specialized Agent Workflows for Your Business with Amazon Bedrock

> 📊 Level ⭐⭐ | 3.2KB | `entities/build-specialized-agent-workflows-for-your-business-with-ama.md`

# Build Specialized Agent Workflows for Your Business with Amazon Bedrock

> Fast-growing companies and enterprise supply-chain teams often have enough data to see that something is wrong, but not enough time to manually investigate every disruption. A supplier delay can require a planner to check purchase orders, inventory, customer commitments, contract rules, logistics op


## 概念导图

```mermaid
mindmap
  root(("Build Specialized Agent Work…"))
    Solution overview
```

## 摘要

# Build specialized agent workflows for your business with Amazon Quick and NVIDIA NeMo Relay

Fast-growing companies and enterprise supply-chain teams often have enough data to see that something is wrong, but not enough time to manually investigate every disruption. A supplier delay can require a planner to check purchase orders, inventory, customer commitments, contract rules, logistics options, and approval policies before deciding what to do next.

Dashboards help teams see what’s happening. The harder part is turning that signal into a reliable decision workflow that recommends what to do next and shows the evidence behind the recommendation.

In this post, we show how [Amazon Quick](<https://aws.amazon.com/quick>) can serve as the business-user front door for specialized agent workflows. We use the [NVIDIA NeMo Relay](<https://docs.nvidia.com/nemo/agent-toolkit/latest/index.html>) to build a supply-chain risk example that helps a planner move from an Amazon Quick dashboard and knowledge context to a guided mitigation recommendation.

## Solution overview

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


To address this challenge, we combine Amazon Quick and NVIDIA NeMo Relay. Amazon Quick gives business users a single conversational workspace for [structured data](<https://docs.aws.amazon.com/quick/latest/userguide/supported-data-sources.html>) and [unstructured enterprise knowledge](<https://docs.aws.amazon.com/quick/latest/userguide/knowledge-base-integrations.html>). Knowledge sources can include Amazon Simple Storage Service (Amazon S3), Google Drive, Microsoft SharePoint, Atlassian Confluence, and internal web content. In that workspace, users can connect to [over 100 pre-built action connectors](<https://docs.aws.amazon.com/quick/latest/userguide/supported-integrations.html>) to perform actions in [third-party systems](<https://docs.aws.amazon.com/quick/latest/userguide/action-connector-apis-supported-types.html>) such as Microsoft Outlook, Slack, Jira, and Asana. They can also invoke agentic workflow

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/build-specialized-agent-workflows-for-your-business-with-ama.md)

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- 相关: [Agent 架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md)

---

