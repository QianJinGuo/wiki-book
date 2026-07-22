# State Lake：火山引擎面向 Agent 时代的存储基础设施重构

## Ch04.644 State Lake：火山引擎面向 Agent 时代的存储基础设施重构

> 📊 Level ⭐⭐ | 3.2KB | `entities/state-lake-volcano-engine-agent-storage-2026.md`

> 火山引擎存储团队提出"从 Data Lake 到 State Lake"的范式转变，围绕 Sandbox Store、Artifact Store、Agent 观测&评测三大方向重新组织存储能力，支撑 Agent 时代的真实业务。

## 存储范式演进

AI Workload 三阶段驱动存储从 Content Storage → State Storage → State Lake：

| 阶段 | 数据形态 | 核心命题 |
|------|---------|---------|
| Training | 海量 Dataset, TB/s 带宽 | 持久化、冷归档、分发 |
| Inference | KV Cache, Embedding | 短生命周期张量高速流转、秒级恢复 |
| Agent | 沙箱/记忆/Trace/产物 | 环境状态、可观测、闭环进化 |

## Storage Agent Infra 三大方向

### Sandbox Store

面向 Agent 沙箱运行环境，三者覆盖沙箱的**状态、共享、通信**三个面：

- **EBS（云盘）**：沙箱本地状态，快照/延迟加载/批量创盘/pause-resume
- **EFS（共享文件）**：多沙箱并行实验、共享数据集、POSIX 语义、3000万 IOPS
- **MQ LiteTopic（消息队列）**：会话级隔离与强顺序，百万级动态创建与释放

### Artifact Store

Agent 执行过程中的输入输出与任务产物持久化：

- **EFS**：强 POSIX 语义（3000万 IOPS、亚毫秒时延、数据流动降本）
- **TOS 对象存储**：海量弹性、按需付费
- **Agent Bucket**：亿级 Agent 原生存储桶，引入 ObjectSet 层级
- **SenseFlow**：多模态理解引擎，产物从"存下来"走向"被理解"
- **ContextBucket**：Agent 记忆与工作区统一底座
- **ADrive**：Agentic 智能网盘（双空间隔离、持久化、自然语言检索）

### Agent 观测 & 评测

TLS AgentLoop：观测数据接入 → Trace 调用链/Session 分析 → 评测集管理 → 持续优化闭环。

## Storage Agent Family

存储产品自身的 Agent 化：TOS/EBS/TLS/EFS/MQ 各自建设智能助手能力，支持记忆进化（用户确认后沉淀为知识）。

## 关联条目

- [Agent Harness 工程全景](../ch05/116-harness-engineering.html) — Harness 工程中存储层的角色定位
- [Cloud Agent Infrastructure](../ch03/046-agent.html) — Agent 基础设施的另一种视角（状态/代码/凭证隔离）

## 退出

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/byte-dance-volcano-state-lake-agent-storage-infra-2026-07-16.md)

---

