# AWS IDP Accelerator

## Ch11.297 AWS IDP Accelerator

> 📊 Level ⭐⭐ | 0.4KB | `entities/aws-idp-accelerator.md`

# AWS IDP Accelerator

> 🚧 占位页面 — 内容待补充

工具/产品/团队实体页面，待从相关 raw 文章中提取详细信息。

---
## 关联

```mermaid
graph TB
    subgraph "可观测性层"
        LOG[日志采集] --> TRACE[链路追踪]
        TRACE --> METRIC[指标聚合]
        METRIC --> DASH[仪表盘/告警]
    end
    subgraph "护栏层"
        IN_CHK[输入校验<br/>提示注入检测]
        RATE[速率限制<br/>成本控制]
        OUT_CHK[输出过滤<br/>PII脱敏]
    end
    subgraph "编排层"
        ORC[工作流引擎]
        STATE[状态管理]
        RETRY[错误恢复]
    end
    REQ[请求] --> IN_CHK --> ORC
    ORC --> AGENT[Agent 执行]
    AGENT --> OUT_CHK --> RES[响应]
    DASH -->|"异常信号"| RATE
    ORC --> STATE --> RETRY
    classDef obs fill:#dbeafe,stroke:#2563eb
    classDef guard fill:#fee2e2,stroke:#dc2626
    classDef orch fill:#d1fae5,stroke:#059669
    class LOG,TRACE,METRIC,DASH obs
    class IN_CHK,RATE,OUT_CHK guard
    class ORC,STATE,RETRY orch
```

- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)

---

