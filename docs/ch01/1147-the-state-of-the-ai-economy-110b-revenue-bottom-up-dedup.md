# The State of the AI Economy — $110B Revenue, Bottom-Up Deduplicated Model

## Ch01.1147 The State of the AI Economy — $110B Revenue, Bottom-Up Deduplicated Model

> 📊 Level ⭐⭐ | 3.5KB | `entities/exponentialview-ai-economy-110b-2026.md`

# The State of the AI Economy — $110B Revenue, Bottom-Up Deduplicated Model

> **Background**: Based on Exponential View's 2026-06-25 inaugural AI Economy report, using bottom-up, deduplicated financial modeling covering consumer and enterprise AI spending across the full stack.


## 概念导图

```mermaid
mindmap
  root(("The State of the AI Economy …"))
    Core Numbers
    Methodology Innovation
    Supply Side vs Demand S…
    Exclusions
    Differentiation from Ex…
```

## Core Numbers

- **Past 12 months AI revenue**: $110B (deduplicated)
- **Annualized run rate**: $175B
- **Methodology**: Bottom-up per-company P&L modeling, cross-validated, no double-counting
- **Coverage**: Consumer + enterprise AI spending full stack (excluding internal AI uplift, professional services)

## Methodology Innovation

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


Traditional AI market sizing has a severe **double-counting** problem: user pays Anthropic $1, Anthropic pays AWS $0.5, traditional methods report $1.5. Exponential View reports only **end-user actual spend** of $1.

Approach:
1. Build item-by-item financial models (P&L, balance sheet, cash flow) for largest contributing companies and business units
2. Cross-validate using high-confidence public statements, supplier data, customer feedback
3. Assign confidence weights to leaked information and self-reported data
4. All numbers are auditable — traceable to specific data points with confidence weights

## Supply Side vs Demand Side

**Supply side** (well-understood):
- Chips, memory, power transformers, cooling, data center components
- Mostly public companies, trackable via disclosures, sales, forward order books

**Demand side** (much harder):
- OpenAI, Anthropic, Cursor, ElevenLabs etc. are private — no disclosure obligations
- Hyperscalers (AWS/GCP/Azure) inconsistently disclose AI segment revenue
- Requires piecing together public statements, leaks, self-reports

## Exclusions

- Internal AI uplift (e.g., recommendation system improvements increasing ad revenue)
- Efficiency savings from big tech internal tools
- Professional services and systems integration

## Differentiation from Existing Wiki Entities

| Dimension | This entity (Exponential View) | Nadella Token Capital | Dario Amodei Policy |
|-----------|-------------------------------|----------------------|---------------------|
| Angle | Data-driven market sizing | CEO enterprise strategy | AI policy/safety |
| Core contribution | $110B deduplicated revenue model | Token capital dual framework | Exponential growth policy response |
| Methodology | Bottom-up P&L modeling | Strategic vision | Policy analysis |
| Actionability | Investment/market judgment | Enterprise architecture decisions | Regulatory/compliance |

→ [source archive](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/the-state-of-the-ai-economy.md)
→ [Nadella Token Capital](../ch12/003-token.html)
→ [Dario Amodei Policy](../ch05/094-ai.html)

---

