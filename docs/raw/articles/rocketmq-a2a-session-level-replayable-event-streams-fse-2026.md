---
title: "RocketMQ-A2A 创新论文入选 ACM FSE，定义 AI Agent 可靠协作新范式"
source_url: "https://mp.weixin.qq.com/s/AsQqMF0fnZIhnKxsop1TZg"
ingested: 2026-07-30
authors:
  - 周礼
  - 张硕
  - 季俊涛
  - 张世杰
  - 赵科
  - 傅玉宝
  - 林清山
source: "阿里云云原生"
sha256: b4c35c7f9a422f7b392c442bc045eeb35cb63e10e1474ba144439e0245b1dc4b
---

近日，由阿里云消息团队发表的 Apache RocketMQ 创新论文《面向大规模多智能体协作的会话级可重放事件流》（英文原名：RocketMQ-A2A: Reliable Session-Level Replayable Event Streams for Large-Scale Multi-Agent Collaboration）入选 FSE 2026 Industry Papers Track。ACM FSE 是 CCF-A 类软件工程顶级会议。

论文聚焦多智能体系统从 Demo 走向生产时的可靠协作难题，提出以"会话级可重放事件流"为核心的 RocketMQ-A2A 交互范式。

## 生产 MAS 真正瓶颈

阿里云消息队列 RocketMQ 在服务多个生产级多智能体系统过程中发现四类工程瓶颈：
1. 突发流量治理：突发流量在 Worker 进程内排队，放大内存增长和系统抖动
2. 会话隔离：海量短会话下，"一会话一 Topic"模型让控制面成本爆炸
3. 故障恢复：非持久化调用导致长链路任务崩溃后无法续跑
4. 可审计性：非结构化日志无法提供可回放交互证据

## 核心创新

### LiteTopic：面向海量会话的轻量队列模型
- 动态创建与销毁，TTL 到期自动回收
- 低成本隔离：创建和维护成本远低于普通 Topic
- 精准订阅：每个 Consumer 可自由订阅不同 LiteTopic 集合
- 顺序消息：同一 LiteTopic 内消息有序投递

### A2A 异步交互范式
把 A2A 风格异步交互转化为持久化、可重放的会话级事件流：
- 普通 Topic：负责 Supervisor 到 Worker 的高吞吐任务分发
- LiteTopic：作为回传通道，Worker 将执行结果与状态事件回传
- 会话级重放恢复：Supervisor 崩溃后可从上次中断位置重放 LiteTopic

## 实验结果
- 25× 过载场景：RocketMQ-A2A 老年代峰值仅 +8.2%，HTTP 异步 RPC +456.6%，纯 A2A +1366.1%
- 12 种故障注入下 100% 端到端任务完成率
- 10 Broker 集群稳定支撑 1500 万并发 LiteTopic + 50k TPS
- LiteTopic 在 20 万通道下保持约 15ms 延迟与稳定 CPU

## 生产落地
- 百炼：用 LiteTopic 实现精细化模型服务流控，限流成本降低 10 倍
- Qoder Cloud Agents：支撑万级推理并发，"手脑分离"分布式 Agent 架构

## 论文信息
- 论文：RocketMQ-A2A: Reliable Session-Level Replayable Event Streams for Large-Scale Multi-Agent Collaboration
- 作者：周礼、张硕、季俊涛、张世杰、赵科、傅玉宝、林清山（均来自阿里云）
- FSE 2026 Industry Papers Track
- 开源仓库：https://github.com/apache/rocketmq-a2a
- ACM Digital Library：https://dl.acm.org/doi/10.1145/3803437.3805231
