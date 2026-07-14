# Graviton 优化 Agentic RL 沙箱层：架构与成本优势分析

## Ch04.284 Graviton 优化 Agentic RL 沙箱层：架构与成本优势分析

> 📊 Level ⭐⭐ | 9.3KB | `entities/graviton-optimize-agentic-rl-sandbox-architecture-cost.md`

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

## 深度分析

### 1. 沙箱层：Agentic RL 训练中被忽视的成本中心

Agentic RL 训练的成本讨论几乎总是聚焦在 GPU 一侧——策略网络、reward model、推理引擎。然而 AWS 团队通过系统性 benchmark 揭示了真正被忽视的成本中心：沙箱层（sandbox layer）。策略网络产出的每条 rollout 都必须在真实环境中执行——Python 沙盒、Mock 工具 API、Headless 浏览器、SQL 仓库——这一层是 CPU bound、fan-out 重的 fleet。

典型设置（`bsz=64, G=8, T=20`）下单 step 需要约 10,000 次工具调用/代码执行。整个 fine-tune 跑数万 step，沙盒层的工作量是数十亿次。沙盒侧 vCPU 总消耗与 trainer 侧 GPU 时长处于同一数量级。这意味着任何在沙盒侧实现的单位成本下降都会直接转化为训练总成本的显著降低，且不需要触碰 GPU 选型这种敏感决策。

### 2. 沙盒负载的四个关键特征

AWS 团队的系统性分析揭示了沙盒层负载的四个本质特征，这些特征决定了为何 Graviton 在此场景具有天然优势：

- **CPU 密集，零 GPU 需求**：沙盒层运行的是解释器、HTTP server、浏览器渲染、SQL 引擎，没有任何 BLAS/CUDA 路径。这使得架构迁移的工作量最小化——负载是标准的容器化 Python/FastAPI/Chromium/DuckDB，全部在 aarch64 上有一等公民支持。

- **Fan-out 线性扩展**：Trainer 一次需要 N 条候选轨迹，沙盒层就要并发开 N 个隔离环境。vCPU 消耗与 batch size 成线性关系，不像 GPU 侧可以通过 batching 摊销成本。

- **对 p99 长尾极度敏感**：RL 同步训练的本质是"等最慢的那条 rollout"。1024 条并发中只要有一条卡住，整个 batch 的 wall-clock 就是该条的时间。因此沙盒层不仅要看平均吞吐，更要看 p99 延迟。

- **独立选型灵活性**：沙盒层完全运行在 CPU 实例上，可以独立选型、独立扩缩容、独立换架构——这是它与 trainer/inference 层最大的不同。Graviton 的迁移不影响 GPU 训练流程的任何环节。

### 3. Graviton vs Intel 的实测对比：物理核对 SMT 的决定性优势

benchmark 数据展示了 Graviton 在几乎所有 workload 上的系统性优势。七个 workload archetype（B1-B9）覆盖了代码执行、工具调用轨迹、浏览器操作、分析型 SQL、文本游戏模拟、容器冷启动和端到端混合 rollout：

| Archetype | m9g vs m7i 吞吐比 (c≥32) | 核心原因 |
|-----------|------------------------|---------|
| B1 代码执行 | 1.42–1.54× | fork-per-second 瓶颈，Graviton 物理核无 SMT 抢占 |
| B3 工具调用 | 2.1–2.67× | 纯 fan-out HTTP，物理核并行度翻倍 |
| B4 浏览器 | 1.19–1.43× | Chromium 受限于 layout/paint/JS 执行 |
| B5 分析型 SQL | 1.38–1.56× | DuckDB NEON/SVE vs AVX2 |
| B7 文本游戏 | 1.74–2.03× | 纯 Python 状态机，物理核多就赢 |
| B9 混合 rollout | 1.62–1.72× | 综合所有 archetype 的真实 fan-out |

p99 延迟方面，Graviton5 的优势更加显著：B3 的 p99 为 m7i 的 40%，B7 低 47%，B9 的 p99 低 32%——这意味着在相同 batch size 下，Graviton 的 wall-clock 更短，GPU 等待时间也更短。

### 4. 成本模型的复利效应：单价优势 × 性能优势

Graviton 的成本优势来自两层叠加。首先是实例单价本身更低：m8g 比 m7i 便宜 11%，m9g 也比 m7i 便宜 3.0%。其次是性能优势带来的吞吐提升。两层叠加后，B9 端到端混合 rollout 的 $/1M rollouts 节省达到约 30%（m7i→m8g）和约 41%（m7i→m9g）。

值得注意的是，Intel 换代（m7i→m8i）反而贵 5%，需要靠吞吐提升来弥补。而同代换 Graviton（m7i→m8g）直接获得 11% 的单价下降——在 benchmark 之前就已经确定性的节省了部分成本。

### 5. 方法论价值：系统性基准测试的设计原则

这篇分析的另一个重要贡献是其 benchmark 方法论。AWS 团队在设计 benchmark 时解决了多个关键挑战：使用 multi-arch manifest 确保同一份镜像在两架构上原生运行；多进程 load generator 避免 client 先于 server 饱和；Server 侧按 vCPU 数启动 worker 进程；并发扫描覆盖 2–128 并发档位；每个档位的 warmup/measure/cooldown 阶段确保稳态测量。

这套方法论本身就是一个有价值的参考——任何进行跨架构性能对比的团队都可以复用这些设计原则，避免常见的 benchmark 陷阱（如 client 瓶颈、warmup 不足、单并发点测量等）。

## 实践启示

1. **优先评估沙盒层成本优化**：在 Agentic RL 训练成本优化中，沙盒层是最容易被忽视但优化 ROI 最高的切入点。改造代价低（纯 CPU 工作负载，无需动 GPU 流程）、收益直接（$41% 成本下降）、风险面小（不影响训练算法）。

2. **Graviton 迁移作为 Agent 推理基础设施的优化方向**：虽然文章聚焦于 RL 训练，但其分析同样适用于 Agent 推理阶段——推理时 Agent 同样需要沙盒环境执行工具调用。在推理基础设施规划中考虑 Graviton 实例，可以在不影响延迟 SLA 的前提下降低推理成本。

3. **物理核 vs SMT 的选型考量**：对于 fan-out 重的 CPU 工作负载（工具调用、代码执行、游戏模拟），选择提供物理核的实例（如 Graviton）比同价位 Intel SMT 实例有 1.5–2.5× 的吞吐优势。benchmark 数据表明，在 ≥32 并发的高负载场景下，这种差距最为显著。

4. **建立系统性的 benchmark 流程**：在进行跨架构对比前，确保 benchmark 设计避免了常见陷阱——多进程 client 避免 client 瓶颈、充足 warmup 确保稳态测量、多并发档位覆盖真实负载区间、p99 和吞吐同时监控。单点测量的 benchmark 结果可能误导选型决策。

5. **关注 p99 延迟对训练 wall-clock 的影响**：沙盒层的 p99 延迟直接决定 GPU 的等待时间。Graviton 在 p99 上的优势（比 m7i 低 15–60%）意味着在相同 batch size 下，训练迭代更快，GPU 利用率更高。这构成了一个正反馈循环——更快的沙盒 → 更短的训练时间 → 更低的总体成本。

-> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/graviton-optimize-agentic-rl-sandbox-architecture-cost.md)

---

