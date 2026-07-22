---
title: "Agent评测太贵？CMU发布PACE：不到1%成本摸清模型的Agent能力"
source_url: "https://mp.weixin.qq.com/s/mg-ZLhNlwJ7kg8poBFvodw"
author: "微信公众号"
feed_name: "微信公众号"
publish_date: 2026-07-07
created: 2026-07-07
ingested: 2026-07-07
tags: [agent, benchmark, evaluation, cmu, pace, proxy-evaluation, llm-evaluation]
type: article
review_value: 7
review_confidence: 8
review_recommendation: strong
review_stars: 4
sha256: 141e8434270208bb1d0ee01dce13232613cd5cde2fb147d02f8a976a960ec5ca
---

# Agent评测太贵？CMU发布PACE：不到1%成本摸清模型的Agent能力

CMU 团队的 PACE 从 19 个便宜原子评测里自动挑出 100 道题，花不到完整 Agent 评测 1% 的成本，就能预测 GAIA、SWE-Bench 等四项基准的模型得分——留一交叉验证平均误差 3.80%，两两排序准确率约 84%。

- 论文：PACE: A Proxy for Agentic Capability Evaluation — arXiv:2607.02032
- GitHub：https://github.com/neulab/pace
- 数据集：https://huggingface.co/datasets/neulab/pace-bench

## 背景：Agent 评测为何贵

Agent 评测（SWE-Bench、GAIA 等）需搭沙箱、拉仓库、跑多轮工具调用，单模型单次评测数千美元 + 数天。而原子评测（MMLU、HumanEval、IFEval）一次 API 调用几分钱。

Agent 任务再复杂，底层也依赖指令遵循、规划、写代码、工具调用——能否用一小撮原子题在花大钱跑 Agent 之前摸清方向和排序？

## PACE 方法

从 19 个非 Agent 基准（覆盖 11 类能力）自动选出 100 道题，用得分预测目标 Agent 基准表现：

- **目标 A（绝对分数）**：预测模型在 Agent 基准上的平均分
- **目标 B（两两排序）**：用得分差做逻辑回归预测谁更强

选题机制：两条互补过滤线各选一半：
- **Local**：按每道题得分与 Agent 总分的 Spearman 相关排序，选最"像"目标基准的题
- **Global**：在源题矩阵上做 SVD，用杠杆分数选全局信息量高且与目标相关的题
- **Bootstrap**：对目标实例重采样再拟合回归，平均 MAE 降 0.77 个百分点

## 结果

14 个模型、严格留一交叉验证（每次留一个"未来模型"）：
- 平均 MAE 3.80%，Spearman 0.81
- 两两排序准确率 84.37%（随机基线 50%）
- 达到相同预测质量，约需 1/100 的成本

C=100 是性价比甜点——再往上边际收益很小。

## Agent 基准的"能力指纹"

PACE 选出的 100 道题揭示各 Agent 基准的能力需求：
- **GAIA**：指令遵循 + 验证测试（IFEval、PlanBench 为主）
- **SWE-Bench Verified**：规划、代码生成、验证、错误恢复
- **SWE-Bench Multimodal**：长上下文聚合最重
- **SWT-Bench**：验证测试 + 规划几乎拉满

## 限制

1. 标定模型需代表未来模型——新架构超出分布时误差会上升
2. 预测的是特定 harness 下的分数，工具定义或重试策略变化可能导致排序漂移

PACE 的定位：完整 Agent 评测仍不可省略，但在花几千刀之前，先用不到 1% 成本把方向和排序摸清楚——筛 checkpoint、比版本、决定值不值得上完整 SWE-Bench。
