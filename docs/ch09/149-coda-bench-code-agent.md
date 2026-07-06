# CoDA-Bench：Code Agent 数据智能基准

## Ch09.149 CoDA-Bench：Code Agent 数据智能基准

> 📊 Level ⭐⭐ | 2.4KB | `entities/coda-bench-code-agent-data-benchmark-renmin-2026.md`

> 中国人民大学团队提出 CoDA-Bench，首次联合评估 Code Agent 的 Code Intelligence（代码分析能力）与 Data Intelligence（数据发现能力），发现当前 Code Agent 的真实瓶颈不是"不会写代码"，而是"找不对数据"。

## 核心发现

CoDA-Bench 将 Code Agent 置于包含 **1000+ 数据文件**的复杂数据目录中，只给一句自然语言问题，不提供文件名、路径或 schema。Agent 需先自主探索文件系统找到相关数据，再编写代码完成分析。

**关键结果**：
- 当前最佳系统在 CoDA-Bench 上执行准确率仅 **61.1%**
- 在更难的 CoDA-HARD 子集上最高为 **49.6%**
- 主流系统普遍能在代码生成环节表现良好，但在数据发现环节大量失分

## 两种智能维度

CoDA-Bench 将 Code Agent 的能力拆分为两个正交维度：

1. **Code Intelligence（代码智能）** — 给定明确数据文件和查询，编写正确分析代码的能力
2. **Data Intelligence（数据智能）** — 在复杂目录结构中自主探索文件系统、定位相关数据文件、理解数据 schema 的能力

基准设计揭示了现有 code agent 评估体系的重要盲区：大多数基准（如 SWE-Bench）预置了明确的文件路径和上下文，不测试 Agent 自主发现数据的能力。

## 与 wiki 已有知识的关联

- `ProgramBench / SWE-agent Benchmark` — 传统 Agent 基准主要关注代码修改能力，未覆盖数据发现维度
- `QoderWork 诊断` — 生产环境中 Agent 在复杂目录结构下的行为问题
- `QoderWork Skills 实践` — 数据科学场景下 Agent 的工作流封装

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/raw-coda-bench-code-agent-data-benchmark-renmin-2026.md)

---

