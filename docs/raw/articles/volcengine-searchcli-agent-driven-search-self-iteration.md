---
title: "火山引擎开源 Agent 驱动的搜索自迭代技术"
source_url: "https://mp.weixin.qq.com/s/sJH9QeD71BWGIGDaOhaUvg"
author: Viking AI 搜索 / 火山引擎
platform: WeChat
ingested: 2026-07-29
slug: volcengine-searchcli-agent-driven-search-self-iteration
sha256: 33b3ca14b741cae2199d8173cc528bb495a63715f2b35ca88e6cb68bf92195b2
---

火山引擎（ByteDance）开源 SearchCLI —— Agent 驱动的搜索自迭代技术。核心：Agent + Skills + CLI 三层架构 + SPA 策略优化框架。

## 问题背景

搜索调优困境：参数彼此影响（召回/排序/零结果率/延迟），调优依赖搜索专家反复试验，很难低成本可复现地持续做。

## 搜索自迭代闭环

Agent 驱动：将"发现问题→提出假设→分配评测预算→筛选候选→验证收益→输出候选配置"变成可重复运行、结果可审阅的闭环。生产变更保留明确人为边界（dry-run 后手动确认）。

## 三层架构

- Agent：上下文判断，决定做什么
- Skills：沉淀搜索专家知识
- CLI：承担确定性长任务（搜索/标注/计算），保证可复现地做完

CLI 提供 vs search tune 子命令链：query-generate → validate → plan → run → report → compare → apply。每一步有结构化输入输出和检查点。

## SPA（Strategy Population Annealing）

将搜索策略编码为带领域语义的 Genome，以专家先验构造初始种群，通过多保真评测、多视角 Elite、语义化进化和退火机制分配预算，再用鲁棒统计选出稳定候选。

### Genome
搜索参数编码（召回模式/关键词语义权重/匹配门槛/候选数），含枚举值和连续值，交叉变异需理解语义后执行裁剪归一化和合法性校验。

### 初始种群
由当前策略、默认 Baseline、边界策略（KeywordOnly/SemanticOnly）、粗粒度 Matrix 和行业 Prior 组成。算法从有意义行为区域出发，非随机点。

### 多保真评测
分三层：先淘汰连源 Item 都召不回来的策略；再在有限 Query 样本上做 LLM Judge；最后全量评测。Fast Pass 高分还需证明收益不集中在少数 Query 类型。

### 多视角 Elite
同时保留 Global Best、Query-Type Best、Stable Best、Low-Latency Best、Low-Zero-Result Best、Baseline-Improver 和 Diverse Candidate。防止种群过早塌缩。

### 语义化进化与退火
交叉组合两个 Elite 的有效结构；局部变异在优秀策略附近调整；方向移动向全局或局部最优靠近。退火温度控制探索幅度。

### 鲁棒目标
RobustScore = NDCG@20 + α×MRR@10 - β×zero_result_rate - γ×latency_penalty - δ×query_type_variance - ε×confidence_interval_width

通过 Bootstrap 重采样检测置信区间，找的不是单次高分而是在 Query 分布和 Judge 噪声下仍稳定的策略。

## 实操流程

1. 准备 Query Set（真实日志/客服/人工；可选合成，需人工审阅）
2. validate 检查格式和覆盖率；plan 提前计算成本（策略数×Query数×TopK）
3. run 执行批量搜索和 LLM Judge 标注
4. report 推荐策略 + 每条 Query 明细
5. apply 先 dry-run，确认后创建候选 Scene

## 工程特性

- Plan：不调用搜索/LLM，提前给出实验成本
- 受控并发：strategy × Query 拆小任务，有序批次调度
- 标签缓存：Key 含数据集/Query/Item内容/Judge配置，复用且不误用
- Checkpoint/Resume：中断后保留运行状态，可继续

## 实验结果

| 指标 | 提升范围 |
|------|---------|
| NDCG@20 | +11.66%~13.50% |
| NDCG@10 | +9.56%~15.08% |
| MRR@10 | +7.74%~14.95% |
| Precision@10 | +7.36%~21.17% |

## 开源

Apache-2.0，Node.js 20+，GitHub: https://github.com/volcengine/SearchCLI
