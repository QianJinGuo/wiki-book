# SWE-bench Agent 评估方法论

## Ch04.660 SWE-bench Agent 评估方法论

> 📊 Level ⭐⭐ | 2.7KB | `entities/swe-bench-agent-evaluation.md`

# SWE-bench Agent 评估方法论

SWE-bench 作为 Agent 编码能力评估的事实标准：任务设计原理、Harness 影响、防止过拟合、成本-性能 Pareto 分析。Claw-SWE-Bench 进一步隔离了 Harness 变量。

## 深度分析

### SWE-bench 作为事实标准的意义与局限

SWE-bench 的最大贡献在于提供了可复现的、任务级（而非单元级）的评估框架。传统基准测试（HumanEval、MBPP）评估"函数级"代码生成，SWE-bench 评估"仓库级"的 bug 修复能力——给定真实代码仓库和 issue 描述，Agent 需要理解上下文、定位问题、生成修复。局限在于偏向 bug 修复而非新功能开发，不测试架构设计能力。

### Harness 作为独立变量的重要性

Claw-SWE-Bench 的核心创新在于将 Harness 作为可独立测量的变量。传统评测中不同框架的结果包含"Agent 能力"和"Harness 能力"的混合信号。通过分离这两个变量，可以更精确地理解：Harness 工程对编码能力的提升究竟有多大贡献？哪些 Harness 特性对哪些类型的任务最有效？

### 成本-性能 Pareto 分析的实践意义

高分和低成本并非互斥。某些 Agent 通过优化上下文管理在保持同等性能的情况下显著降低 Token 消耗——"更高效的 Agent"不是靠压榨模型能力，而是靠更聪明的信息管理策略。评测中强制汇报 API 总成本推动了行业从"唯分数论"转向"性价比"视角。

## 实践启示

1. **在评测时分离 Harness 变量**：评估 Agent 编码能力时，确保 Harness 配置一致——否则你比较的是 Harness 而非 Agent。
2. **建立性价比度量**：不要只看 Pass@1 分数，同时记录 Token 总消耗、运行时间、API 成本，构建成本-性能 Pareto 前沿。
3. **SWE-bench 分数有上限效应**：当分数超过一定阈值后，提升更多来自 Harness 优化而非模型能力提升。

## 相关实体

- [快手 RCA Agent：复杂业务场景下排障 Agent 的探索实践](../ch03/046-agent.html)
- [Programbench Swe Agent Benchmark](ch04/533-programbench-swe-agent-benchmark.html)
- [SciAgentGym：多步科学工具使用的 LLM Agent 评测基准](../ch03/046-agent.html)
- [Reward hacking is swamping model intelligence gains](https://github.com/QianJinGuo/wiki/blob/main/entities/cursor-reward-hacking-coding-benchmarks.md)
- [AgentEval：YAML驱动的Agent评测框架](../ch03/046-agent.html)

---

