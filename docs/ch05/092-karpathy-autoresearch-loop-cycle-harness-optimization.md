# Karpathy AutoResearch Loop Cycle & Harness Optimization

## Ch05.092 Karpathy AutoResearch Loop Cycle & Harness Optimization

> 📊 Level ⭐⭐ | 4.4KB | `entities/karpathy-autoresearch-loop-cycle-harness-optimization.md`

# Karpathy AutoResearch Loop Cycle & Harness Optimization

> 文章 "76%的性能提升与模型无关？Karpathy 700次 Loop 实验揭开 Agent 最大误区" (四月, 2026-07-07) 的实体整理。综合了 Hugging Face Joel Niklaus 的 Harness 优化实验、Karpathy AutoResearch 项目 (Loop Cycle)、以及 Codila 的 Loop Engineering 方法论。

## 核心发现：Benchmark 测的是"模型 + Harness"组合能力

Hugging Face 工程师 Joel Niklaus 的实验《Don't Train the Model, Evolve the Harness》证明：使用同一个 DeepSeek-V4-Pro，**不改模型权重，只优化外层执行机制 (Harness)**，就能让 Agent 在专业任务中的表现大幅提升：

| 外层机制 | Pooled Score |
|---|---|
| mini-swe-agent | 3.5% |
| Goose | 23.2% |
| Pi | 45.4% |
| LAB harness (原始) | 63.4% |
| **优化后 LAB harness (22轮自动迭代)** | **80.1%** |

关键数据：优化后的 Harness 追平 Claude Sonnet 4.6，运行成本仅 1/7，且迁移到同族小模型 DeepSeek-V4-Flash 仍带来 14.4 分提升。

## 什么是 Harness？

Harness = Agent 的外层执行机制，类比"操作系统"管理 LLM（CPU）的内存、I/O、驱动程序。包含 12 个核心组件：流程编排、工具调用、分层存储、上下文管理、错误处理等。

"上下文腐烂"问题：模型将关键信息置于上下文窗口中间时，性能下降 30%+。成熟的 Harness 通过压缩历史记录、屏蔽旧输出、动态获取和代理摘要来解决。

## Karpathy AutoResearch (Loop Cycle)

Karpathy 斩获 9万 Star 的 AutoResearch 项目 — 630 行开源代码，核心是"提出修改 → 运行实验 → 自动评估 → 保留进步"的循环。

Codila 将其提炼为 **Loop Engineering** 五步法：
1. 基于精细调整的模型，编写方向文档 + 约束条件
2. 仅允许 Agent 修改训练脚本（评估/评分脚本锁定，防止自降标准）
3. Agent 进入循环：提出变更 → 训练 → 评估 → 保留好的、舍弃坏的
4. 持续迭代直到满足停止条件

### 实验结果
- Karpathy 手动调整的模型跑 2 天 → **700 次实验** → 找出 **20 项代码改进**（含注意力机制中遗漏的标量乘数）
- Shopify CEO Tobi Lutke 内部测试 → **质量提升 19%**，模型大小减半

### Loop 三要素
1. **验证器** — 自动判断结果好坏
2. **状态文件** — 记录每次尝试结果，崩溃不丢失
3. **停止条件** — 达到目标或最大轮次即停止

### Loop 适用标准（四项全能）
- 任务高频（至少每周重复）
- 验证可自动化
- Token 预算能消化冗余
- Agent 能访问真实运行环境

## Bilevel Autoresearch（双层自动研究）

在内层 Loop（优化模型）外再套一层外层 Loop（优化内层循环的搜索逻辑）。结果：同一模型性能比 Karpathy 基准 **提升 5 倍**，全部来自架构改进。

外层循环的作用：打破 LLM 的"思维定势" — 内层循环易陷入模型先验认知的搜索模式，即使策略失效也会反复尝试；外层循环强制模型探索本能回避的方向。

## 隐性代价

1. **理解债**：循环生成的代码非人工写出，仓库代码与开发者的理解差距越来越大，系统崩溃时 Debug 成本极高
2. **认知让渡**：循环跑通后，人极易停止思考 — 有人用来加速已理解的工作，有人用来逃避理解工作

## 与已有实体的关系

- [Harness Engineering Framework](ch05/116-harness-engineering.html) — 同为 Agent 系统工程方法论，但本实体聚焦于 Karpathy 的 Loop 自动迭代实验 + Harness 优化的具体实验数据
- [Agent Harness Engineering Survey](ch05/116-harness-engineering.html) — 补充 Harness 优化的具体实验证据（Niklaus 实验的量化数据）

## 参考

→ [raw/articles/karpathy-autoresearch-loop-harness-76pct-agent-misconception|原文存档]

---

