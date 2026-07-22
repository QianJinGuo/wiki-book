---
title: "AIDE²: The First Evidence of Recursive Self-Improvement — Weco AI"
source_url: "https://mp.weixin.qq.com/s/jWzDBAUzGeNNQUDH1gw1vg"
source_site: "PaperWeekly"
slug: "aide-squared-recursive-self-improvement-weco-2026-07-16"
ingested: 2026-07-16
provenance_state: extracted
sha256: "d8a1b2c3d4e5f67890ab1c2d3e4f567890abcdef1234567890abcdef12345678"
tags: [recursive-self-improvement, harness-engineering, agent, autoresearch, rsi]
---

# AIDE²: The First Evidence of Recursive Self-Improvement — Weco AI

> 模型权重不变，研究 agent 在 100 轮筛选中重写自己的搜索、上下文与评测机制。PaperWeekly 报道。

## 核心内容

Weco AI 让一个研究 agent（外层 AIDE_human）连续运行 8 天，反复重写另一个研究 agent（内层 AIDE）的 **harness**——承载搜索、上下文管理、错误处理和验证流程的 agent 运行框架。每个候选版本在固定成本下完成整套评测，根据内层 agent 无法看到的隐藏分数决定是否保留。^[raw/articles/aide-squared-recursive-self-improvement-weco-2026-07-16.md]

### 关键指标

| 指标 | 数值 |
|------|------|
| 外层步骤数 | 100 轮 |
| 刷新历史最佳 | 7 轮（第 2/6/28/39/47/63/85 轮） |
| 综合分数提升 | 0.703 → 0.778 |
| 上下文长度压缩 | 约 1/16 |
| 奖励作弊比例 | 63% → 34% |
| 研发速度 | 约人工流程 100×（估算，未统一折算） |

### 实验配置

- **外层（优化者）**: Claude Opus 4.7 — AIDE_human
- **内层（执行者）**: Gemini 3 Flash — 各版 AIDE
- 非对称配置：外层的 token 开销只占总成本一小部分，用更强的模型；内层在固定预算下能匹配或略胜更大模型

## 搜索策略演变

- **AIDE₀**: 生成 5 个初始方案，随机调试 bug 叶节点或选择整棵树最高分节点继续改进 → 全局贪心
- **AIDE₈₅**: 多臂老虎机在分支间分配预算，选中分支后沿最佳节点继续优化；分支长期停滞时复制全局最佳代码另开分支
- 被拒方案：岛屿遗传算法、锦标赛选择、MCTS 式价值回传等未通过门槛

## 上下文管理

- **AIDE₀**: 所有历史尝试的完整代码和执行输出一并放入提示词
- **AIDE₈₅**: 保存完整方案树，但按操作类型构建最小上下文——方案生成只看基线与简短轨迹，调试聚焦出错节点和日志尾部，改进读取当前最佳版本与停滞信号
- 完整提示词平均长度压缩到朴素历史拼接的约 **1/16**

## 评测可靠性

- KernelBench 检验奖励作弊（Reward Hacking）：单元测试的加速放到端到端训练负载中重验证，若保留加速不足一半或变慢/失败，记为作弊
- AIDE₈₅ 作弊率：**63% → 34%**（减半），低于 AIDE₄₇ 和人工版的 42%
- 自动形成三类防护机制：反过拟合指令、硬编码 Guard（可疑输出触发重新生成）、统计校正削弱异常高分（最终版本中统计层被改坏失效）
- 外层还写入了一个大型补丁，起初怀疑是漏洞利用，检查后发现修复的是单个 traceback 导致整套隐藏评测崩溃的问题

## RSI 四级分级

| 级别 | 描述 | AIDE² 状态 |
|------|------|-----------|
| Level 0 | 系统能独立跑完整个研发循环，但效率低于人工 | 已超越 |
| **Level 1** | **改进同一系统的效率超过人工** | **✅ 达到** |
| Level 2 | 点火（Ignition）：改进后的内层 agent 能反过来成为更好的外层优化 agent | ❌ 未达（AIDE₄₇ 更省样本但渐近性能无统计显著优势） |
| Level 3 | 固定预算下进展速度开始加快（智能爆炸必要条件） | ❌ 未达 |

### 点火测试（AIDE₄₇ 作为外层）
- AIDE₄₇ 约 20 轮进入平台期，AIDE_human 约 40 轮
- 两者最终收敛到相近上限，效率差异未达统计显著水平
- 这说明最多更省样本，不足以证明成为更强的外层优化 agent
- Weco 称为**第三阶泛化**（点火），当前实验尚未提供足够证据

## 外部迁移（二阶泛化）

- MLE-Bench Lite: AIDE₄₇ 最高 0.739，AIDE₈₅ 回落至 0.721，均超过 AIDE₀ (0.673) 和人工版 (0.708)
- ALE-Bench Lite: AIDE₈₅ 达 1790
- WeatherBench 2: AIDE₈₅ 达 0.803
- 内部综合分数上升不意味着所有外部能力同步增强

## 局限与未解决的问题

1. **代码复杂度增加**：AIDE₈₅ 代码逻辑更复杂，残留无效代码，后续理解、维护和生产部署更困难
2. **高淘汰率**：约九成候选版本未通过评测
3. **持续加速未出现**：Level 3（智能爆炸必要条件）尚未达到
4. **完整技术报告与 AIDE₈₅ 代码尚未发布**
5. **实验协议和成本口径仍需进一步披露**

## 关联 Wiki 内容

- [[entities/harness-engineering-self-improvement-survey-lilian-weng|Harness Engineering 自我改进综述 (Lilian Weng)]]
- [[entities/agent-self-improvement-six-mechanisms|Agent Self-Improvement 六种机制]]
- [[entities/autoresearch-multi-agent-software|AutoResearch 多智能体软件工程]]
- [[entities/autoresearch-taxonomy-chengzihong-chengzihong|AutoResearch 分类法 (程子洪)]]
- [[entities/lossy-self-improvement|Lossy Self-Improvement]]
- [[concepts/ai-self-improvement-bootstrapping|AI Self-Improvement / Bootstrapping]]
