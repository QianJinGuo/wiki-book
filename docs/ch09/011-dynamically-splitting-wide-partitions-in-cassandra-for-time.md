# Dynamically Splitting Wide Partitions in Cassandra for Time Series Workloads

> 📊 Level ⭐ | 2.3KB | `entities/dynamically-splitting-wide-partitions-in-cassandra-for-time-.md`

# Dynamically Splitting Wide Partitions in Cassandra for Time Series Workloads

→ [原文存档](https://netflixtechblog.com/dynamically-splitting-wide-partitions-in-cassandra-for-time-series-workloads-0eded064f456?source=rss----2615bd06b42e---4)

## 深度分析

Dynamically Splitting Wide Partitions in Cassandra for Time Series Workloads
### 核心观点
1. We use Apache Cassandra 4.
2. x as the underlying storage for these main reasons:
* **Throughput, latency, and cost** : Cassandra can handle millions of low‑latency reads and writes in a cost-effective manner.
3. * **Operational maturity** : Our data platform team has deep operational expertise running large Cassandra clusters in production.
4. However, using Cassandra at this scale introduces trade‑offs for TimeSeries workloads.
5. A key challenge is wide partitions, as TimeSeries dataset partitions can grow quite large with events accumulating over time.

### 关联实体

- [Scale Robot Reinforcement Learning With Nvidia Isaac Lab On ](https://github.com/QianJinGuo/wiki-public/blob/main/entities/scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on-.md)
- [Nvidia Isaac Lab Sagemaker Robot Rl Humanoid](https://github.com/QianJinGuo/wiki-public/blob/main/entities/nvidia-isaac-lab-sagemaker-robot-rl-humanoid.md)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/存之有序治之有矩agent-记忆系统的工程实践与演进.md)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-完全指南这可能是全网最新最全的系统化教程了32w字建议收藏.md)
- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentops-operationalize-agentic-ai-at-scale-with-amazon-bedr.md)
- [两万字详解Claude Code源码核心机制](https://github.com/QianJinGuo/wiki-public/blob/main/entities/两万字详解claude-code源码核心机制.md)

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/observability-monitoring.md)

---

