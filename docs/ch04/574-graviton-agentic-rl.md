# Graviton 优化 Agentic RL 沙箱层：架构与成本优势分析

## Ch04.574 Graviton 优化 Agentic RL 沙箱层：架构与成本优势分析

> 📊 Level ⭐⭐ | 2.0KB | `entities/graviton-optimize-agentic-rl-sandbox-architecture-cost.md`

# Graviton 优化 Agentic RL 沙箱层：架构与成本优势分析

本文系统分析了 Agentic RL 训练中常被忽视的沙箱层（sandbox layer）——策略网络产出的每条 rollout 必须在真实环境中执行（Python 沙盒、Mock 工具 API、Headless 浏览器、SQL 仓库等），这一层是 CPU bound、fan-out 重的 fleet，GPU 经常等待其完成。通过将沙盒层迁移到 Graviton5（m9g）实例，可降低成本多达 43%。

## 核心发现

使用可复现的 benchmark suite（`agentic-rl-bench`），覆盖 6 个 Agentic RL 训练的真实 workload archetype 加一个端到端混合 rollout：

- m7i -> m8g（Graviton4）：$/1M rollouts 成本降低 ~30%
- m7i -> m9g（Graviton5）：$/1M rollouts 成本降低 ~41%

## 架构分析

沙盒层天然适合 Graviton 的原因：CPU-bound 工作负载、高并发 fan-out 模式、对单核性能不敏感但对性价比敏感。文章提供了 7 个 workload 原型的详细 benchmark 数据，包括吞吐、p99 延迟和单位操作成本。

## 延伸意义

虽然文章聚焦于 Agentic RL 训练中的沙箱层成本优化，但沙箱本身就是 Agent 运行时的执行底座——不论训练还是推理阶段，Agent 都需要在类似环境中调用工具、执行代码、与外部系统交互。因此分析、选型和成本优化思路同样适用于 Agent 推理服务的基础设施规划。

-> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/graviton-optimize-agentic-rl-sandbox-architecture-cost.md)

---

