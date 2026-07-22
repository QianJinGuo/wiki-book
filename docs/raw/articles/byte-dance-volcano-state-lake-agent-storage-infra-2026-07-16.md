---
source_url: https://mp.weixin.qq.com/s/qakhw_mXrCO7Fcb3tikv4A
ingested: 2026-07-16
sha256: af84fd5016184461d92c3e1e9abdc87d195d4419cb037698e63dd71741303b3e
source_published: 2026-07-16
title: "从 Data Lake 到 State Lake：面向 Agent 时代的存储基础设施重构"
author: 火山引擎存储
feed_name: 字节跳动技术团队
---

> 核心观点：Agent 把 AI 从"回答问题"推向"完成任务"，存储从"提供容量、承载文件"的资源层升级为贯穿 Agent 运行、协作与持续优化的关键底座。

## AI Workload 三阶段与存储范式演进

| 阶段 | 数据特点 | 存储范式 |
|------|---------|---------|
| Training | 海量 Dataset（百 PiB~EiB）、TB/s 级带宽 | Content Storage — 海量、持久化、冷归档与分发 |
| Inference | 低时延、KV Cache 命中、毫秒级 IO | State Storage — 短生命周期张量与上下文高速流转 |
| Agent | 场景碎片化、沙箱频繁创建销毁、跨沙箱产物共享、全链路 Trace | State Lake — 环境/记忆/Trace/产物的统一底座 |

## Storage Agent Infra 三大方向

### 1. Sandbox Store

沙箱是 Agent 执行的核心环境，需要快速启动、状态保存、隔离恢复。

- **EBS（云盘）**：沙箱本地状态，快照/延迟加载/批量创盘/pause-resume
- **EFS（共享文件）**：多沙箱并行实验、共享数据集、POSIX 语义
- **MQ LiteTopic（消息队列）**：会话级隔离与强顺序，百万级动态创建与释放

三者覆盖沙箱的**状态、共享、通信**三个面。

### 2. Artifact Store

Agent 执行中的输入输出与任务产物的持久化流转。

**EFS 路径**（强 POSIX）：3000万 IOPS、亚毫秒时延、数据流动（冷→TOS）。
**TOS 对象存储路径**（灵活分发）：海量弹性、按需付费、生命周期管理。

关键产品：
- **Agent Bucket** — 亿级 Agent 原生存储桶，引入 ObjectSet 层级
- **SenseFlow** — 多模态理解引擎，产物从"存下来"走向"被理解"
- **ContextBucket** — Agent 记忆与工作区统一底座
- **ADrive** — Agentic 智能网盘，Agent 与人的协作空间（双空间隔离、持久化、自然语言检索）

### 3. Agent 观测 & 评测

TLS AgentLoop：观测数据接入 → Trace 调用链 / Session 分析 → 评测集 / 评估器管理 → 持续优化闭环。

## Storage Agent Family

存储团队自身也成为这套基础设施的使用者。围绕 TOS、EBS、TLS、EFS、MQ 等产品建设智能助手能力，支持记忆进化（用户确认后沉淀为知识）。

## 三个真实场景

1. **研发测试 Agent**：EBS 高频快照支撑版本回溯
2. **多模态创作 Agent**：TOS Agent Bucket Input/Output 资产库与分发
3. **智能办公 Agent**：ADrive 双空间（User/Claw/AI Search）

## 结语

存储的终局不是更大的湖，而是更懂业务的底座。衡量标准从"提供了多少容量"转向"托住了多少状态、参与了多少闭环"。
