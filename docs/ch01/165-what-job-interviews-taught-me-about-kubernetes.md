# What Job Interviews Taught Me About Kubernetes

## Ch01.165 What Job Interviews Taught Me About Kubernetes

> 📊 Level ⭐ | 3.4KB | `entities/notnotp-k8s-interviews-non-technical.md`

# What Job Interviews Taught Me About Kubernetes

> Source: [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/notnotp-k8s-interviews-non-technical.md)


## 概念导图

```mermaid
mindmap
  root(("What Job Interviews Taught M…"))
    内容提炼
    Why?
      Uniformity
    关键洞察
    实践启示
    相关实体
```

## 核心要点

- **来源**: https://notnotp.com/notes/what-job-interviews-taught-me-about-kubernetes/
- **评分**: v=7, c=8, v×c=56, stars=4
- **评估理由**: Well-structured opinion piece drawing on real interview experience to discuss the non-technical (organizational) reasons companies adopt Kubernetes. Offers practical advice on when K8s makes sense (the 'second engineer' threshold is a useful heuristic) and when it doesn't. Honest about limitations a

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


Published Time: 2026-06-15

Markdown Content:
Published on 15 June 2026
So I've been job hunting lately. Reading job postings, doing interviews, talking to engineering teams at like a dozen companies. And I noticed something compared to five years ago when I was last doing this: literally everyone is on Kubernetes now. Every single company I talked to.

Last time I was job hunting that wasn't the case at all. There were basically three camps: the rare Kubernetes adopters, the `systemd`-on-VM/VPS/EC2 crowd, and the serverless people (Lambda, Cloud Run, etc.).

That surprised me, because where I work we have actual Big Tech-scale problems, so K8s makes obvious sense for us. But a 10-person startup with two services? None of these places were doing microservices or anything close to high scale. So I asked why.

**Spoiler: they don't care much about the technical side of K8s.**

## Why?

A technical interview is actually a great place to ask why, especially when you're talking directly to the CTO. So I did. The answers were basically the same everywhere.

### Uniformity

First one was **uniformity**. Every service deploys the same way. No one secretly knowing that the payments service

## 关键洞察

- Spoiler: they don't care much about the technical side of K8s.**
- ## Why the shift happened recently

## 实践启示

- 文章的核心论点可在生产环境验证
- 与现有实体的差异化角度：本文来自 notnotp.com 视角
- 引用源：[Notnotp K8S Interviews Non Technical](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/notnotp-k8s-interviews-non-technical.md)
## 相关实体
- [from doer to director: the ai mindset shift](ch01/031-from-doer-to-director-the-ai-mindset-shift.html)
- [why internally-built ai fails fund accounting audits](ch01/130-why-internally-built-ai-fails-fund-accounting-audits.html)
- [back up and restore your amazon eks cluster resources using](../ch11/013-back-up-and-restore-your-amazon-eks-cluster-resources-using.html)

---

