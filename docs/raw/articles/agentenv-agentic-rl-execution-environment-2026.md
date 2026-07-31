---
title: "AgentENV：当大模型开始学会"做事"，我们开源了支撑它的基础设施"
source_url: "https://mp.weixin.qq.com/s/FuogYS7jLk7xyPOkZacd2Q"
source_account: "AgentENV 团队 / KVCache.AI (清华MADSys实验室+月之暗面)"
ingested: 2026-07-28
sha256: "2f86907ee9892b08939a7b25d32577d866665a02670b6e9af8eee8124b981cff"
type: raw-article
tags:
  - agentenv
  - agentic-rl
  - reinforcement-learning
  - execution-environment
  - firecracker
  - microvm
  - sandbox
  - kimi-k3
  - kvcache-ai
  - infrastructure
  - open-source
score_v: 9
score_c: 9
score_vc: 81
decision: entity
---

# AgentENV：当大模型开始学会"做事"，我们开源了支撑它的基础设施

> 清华大学 MADSys 实验室联合月之暗面等单位正式开源面向大规模 Agentic RL 的智能体执行环境——AgentENV (AENV)。在典型负载下，AgentENV 将 Agent 执行环境的成本降低了 88.6%~96.8%。已被用于 Kimi K3 等多款先进模型的强化学习训练。

## 核心数据

| 指标 | 数值 |
|------|------|
| 单节点并发 | 400 环境 (128核/512GB) |
| 集群已验证规模 | 30,000 环境 |
| 启动/恢复延迟 | 49 ms |
| 快照创建延迟 | 133 ms |
| COW Fork 摊销延迟 | 122 ms |
| 成本降低 | 88.6%–96.8% |
| CPU 分配使用比 | 平均 27.9×（最低 14.5×） |
| 内存分配使用比 | 平均 9.6×（最低 5.7×） |
| 月度成本示例（300 环境 720h） | ~1.53 万元 |

## 技术架构

### 基础：Firecracker 微虚拟机
- 基于 AWS 开源的 Firecracker 构建强隔离微虚拟机执行环境
- 每个 Agent 独立安全边界，避免影响宿主机和其他训练任务
- Agent 可能尝试突破边界、访问隐藏服务、修改评测逻辑——强隔离是可靠 Agentic RL 的基础

### 跨节点扩展异构环境
- 兼容 OCI 镜像生态（Docker 镜像可直接使用）
- **OverlayBD**：镜像从远程对象存储按需加载，本地磁盘仅作热数据缓存
- 集群可使用镜像总量可超过单节点磁盘容量，无需提前预热

### 增量快照与 Fork
- 增量记录内存和文件系统变化，无需每次保存完整虚拟机
- 快照持久化到 S3 兼容对象存储，避免节点故障丢状态
- **写时复制 (COW) Fork**：同一中间状态 Fork 为多个独立执行环境
- 支持多轨迹采样、树搜索和反事实探索

### 弹性生命周期管理
- 数十毫秒启动/恢复，百毫秒暂停
- 环境等待模型推理时释放 CPU 和可回收内存
- 训练系统不必为所有逻辑存在的环境持续保留完整物理资源

### 存储与内存复用
- RootFS/基础镜像/工具盘/快照：OverlayBD 只读层 + 内容寻址缓存去重
- 同模板环境共享只读内存快照，Dirty/COW 页面才成为私有占用
- **DAMON Reclaim** + Firecracker Balloon 持续回收 Guest 文件缓存
- 磁盘 I/O：ublk + io_uring + Direct I/O，减少双重缓存

## 成本分析

以 300 个 Agent 执行环境（4 vCPU / 8 GB 每个），持续运行 720 小时为例：

| 方案 | 估算月成本 | 倍数 |
|------|-----------|:----:|
| AgentENV (最低分配使用比) | ~1.53 万元 | 1× |
| 传统按资源计费方案 | ~13.5–48.5 万元 | 8.8–31.7× |

关键思路：成本不应由"创建了多少环境"决定，而应尽可能接近"实际使用了多少资源"。

## 关联

→ [[entities/agentic-rl-frameworks-practices-long-horizon-wolfe-2026|Agentic RL 训练框架与实践]] — AgentENV 是 Agentic RL 的执行环境基础设施层，与该实体描述的 RL 训练框架互补
→ [[raw/articles/agentic-rollout-training-framework-shumu-2026|Agentic Rollout 训练框架]] — 同一主题的实操视角
