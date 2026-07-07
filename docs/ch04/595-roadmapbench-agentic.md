# RoadmapBench — 跨版本升级的长周期 Agentic 软件开发评估基准

## Ch04.595 RoadmapBench — 跨版本升级的长周期 Agentic 软件开发评估基准

> 📊 Level ⭐⭐ | 1.8KB | `entities/roadmapbench-long-horizon-agentic-software-development-benchmark.md`

# RoadmapBench — 跨版本升级的长周期 Agentic 软件开发评估基准

RoadmapBench 是一个评估长周期 Agentic 软件开发的基准测试，由 Allen AI 提出。它包含 115 个基于真实开源项目版本升级的长期编码任务，覆盖 17 个仓库和 5 种编程语言。

与现有主要聚焦单 issue bug fix 的基准不同，RoadmapBench 的每个任务要求 Agent 在源版本代码快照上实现目标版本的全部新功能，中位修改量为 3700 行代码、跨 51 个文件。

在 13 个前沿模型的系统评测中，最强模型 Claude-Opus-4.7 仅解决 39.1% 的任务，最弱模型仅 5.2%。这与现有 bug-fix 基准的饱和表现形成鲜明对比，表明长周期软件开发仍是 Agent 能力的重大挑战。

该基准填补了现有评估体系的空白，与 [Agent Harness 架构](../ch05/038-agent-harness.md) 和 [Codex 六小时目标运行](../ch09/057-codex-goal-six-hour-run.md) 中讨论的长链 Agent 执行问题相互印证。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/roadmapbench-evaluating-long-horizon-agentic-software-development.md)

---

