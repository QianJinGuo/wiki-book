# How Semgrep Cut Taint Analysis Time by 75%

## Ch12.112 How Semgrep Cut Taint Analysis Time by 75%

> 📊 Level ⭐⭐ | 4.1KB | `entities/how-semgrep-cut-taint-analysis-time-by-75.md`

# How Semgrep Cut Taint Analysis Time by 75%

Markdown Content:
_Semgrep Pro Engine 1.158.0 and onwards is now shipping a redesigned taint analysis engine resulting in up to 75% speedups on full scans. This is the second in a three part series on improving the performance of Semgrep._

In the [previous blog post](https://semgrep.dev/blog/2026/announcing-pyro-caml-continuous-profiler-ocaml/) we discussed a new continuous profiler we released for OCaml, called Pyro Caml. The motivation behind building it was so we could improve the performance of Semgrep, whose core analysis engine is written in OCaml. In this blog post we’ll explore how we used it to validate where we thought our biggest bottleneck was, and how doing something once instead of twice is a great way to improve the performance of your programs. Specifically, the 95th percentile of Semgrep scan times went from 10 minutes, to 7 minutes 30 seconds, and our P99 went from a very noisy ~45 minutes on average, to a much more consistent 35 minutes. Additionally, the number of scans reaching the max allowable scan time dropped significantly.


## 概念导图

```mermaid
mindmap
  root(("How Semgrep Cut Taint Analys…"))
    Motivation: Why Taint A…
      How Taint Analysis Work…
```

## Motivation: Why Taint Analysis Was Costing a Third of Our CPU Time[![Image 1: Link icon](https://semgrep.dev/build/assets/link-2-CZjK2H9r.svg)](http://semgrep.dev/blog/2026/how-we-cut-semgreps-taint-analysis-time-by-75-percent/#motivation:-why-taint-analysis-was-costing-a-third-of-our-cpu-time "Motivation: Why Taint Analysis Was Costing a Third of Our CPU Time")

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


### How Taint Analysis Works: Sources, Sinks, and Data Flow[![Image 2: Link icon](https://semgrep.dev/build/assets/link-2-CZjK2H9r.svg)](http://semgrep.dev/blog/2026/how-we-cut-semgreps-taint-analysis-time-by-75-percent/#how-taint-analysis-works:-sources,-sinks,-and-data-flow "How Taint Analysis Works: Sources, Sinks, and Data Flow")

The Semgrep engine has something called a matching engine that runs a set of rules _._ There’s a bunch of great explanations of matching out there, but in short, Semgrep will take patterns like `do_thing( … )` and flag code such as `do_thing(arg1, arg2)` or `do_thing(x, y)`. This is useful for finding all sorts of vulnerabilities, but it was supercharged when we [released support for taint analysis,](https://semgrep.dev/blog/2021/taint-mode-is-now-in-beta/https://semgrep.dev/blog/2021/taint-mode-is-now-in-beta/) all the way back in 2021. This would let you find code patterns such as:

Specifically, you could write patterns that track the flow of data through a program, and flag places they might “taint” in that flow, such as tracking user input flowing into an arbitrary eval function, like in the above example.

This first pass of taint analysis was only **intra-procedural**, meaning that within a file we could usually detect how the data flows. If the user input flowed into some function that was defined in another file though, and that other function had an eval, we wouldn’t detect it. This is called **interfile** analysis, for obvious reasons.

Many users had been asking for exactly this, and so two year

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/how-semgrep-cut-taint-analysis-time-by-75.md)

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)

---

