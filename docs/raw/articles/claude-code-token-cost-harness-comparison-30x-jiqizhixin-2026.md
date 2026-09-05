---
title: "Claude Code到底有多费token？对比实验来了：三大框架最多差30倍"
type: raw
source_url: "https://mp.weixin.qq.com/s/G29lkLZbQo59_s6wHGhAfQ"
source_author: "机器之心"
source_date: 2026-07-31
ingested: 2026-07-31
sha256: 1da2da683886d126f8c1545e983739bbfba4183658c27130bff1af6e71b7b70e
rating: 36
tags: [harness, token-efficiency, claude-code, hermes, kimi-code, composio, benchmark, agent-cost, harness-tax]
---

# Claude Code到底有多费token？对比实验来了：三大框架最多差30倍

## 摘要

机器之心转述 Composio 团队对比实验：用同一个模型（Kimi K3）放入三个不同的 agent 框架（harness）——Claude Code、Hermes、Kimi Code——跑 28 个任务。核心发现：**成功率差不多，token 消耗最多差 30 倍**。结论：想降低 agent 成本，先看 harness 而不是急着换模型——harness 本身能把成本拉开 9 倍，而模型能力表现差不多。

## Composio 三框架对比实验（Kimi K3，28 任务）

| 指标 | Kimi Code | Hermes | Claude Code |
|------|-----------|--------|-------------|
| 成功率 | 22/28 | 21/28 | 20/28 |
| token 中位数 | ~6.1 万 | ~6.7 万 | **34 万（≈6×）** |
| 平均成本/任务（K3 $3/M in） | 0.22 美元 | 0.28 美元 | ~1.36 美元 |
| 中位耗时 | 297 秒 | **179 秒（最快）** | 348 秒 |

- token 用量最多差 **30 倍**（最省 vs 最费）
- agent 工作流中**输入 token 通常占 95% 左右**
- 最快（Hermes）与最省 token（Kimi Code）并不重合

## Sebastian Raschka 佐证

- 他用 Qwen3.6 做过类似观察：Claude Code 在成功率相近时，token 用量往往是其他 harness 的 **2-3 倍**
- 可能原因猜测：未优化？有 bug？还是故意设计（在更难任务上可能有帮助）——需进一步查证
- 他分析本地 coding agent 时发现差异主要出在**输入 token 而非输出 token**——Claude 并没有多写一倍的内容

## Writer 论文：控制变量实验证明换 harness 比换模型更能砍成本

Writer（企业级 AI Agent 平台）用控制变量实验：**22 个企业任务 × 6 个基础模型**（Claude Sonnet 4.6、Gemini 3.1、Gemini Flash 3.5、Qwen 3.6、GLM 5.1、Palmyra X6）固定 harness 层对比：

| 指标 | 优化前 | 优化后 | 变化 |
|------|--------|--------|------|
| 平均成本/任务 | 0.21 美元 | 0.12 美元 | **-41%** |
| 中位延迟 | 48 秒 | 27 秒 | **-44%** |
| Token 消耗 | 14.2k | 8.8k | **-38%** |
| 任务完成质量 | 0.78 | 0.81 | 基本持平 |

结论：所有模型都受益于 harness 层优化——"以前有人说模型即产品，现在是 **harness 即产品**"。

## 要点提炼

- **harness 税（harness tax）**：社区提议在现有 benchmark 中加入 harness 税指标——一旦工具调用和重试进入 loop，这笔税**不是线性增长**
- 未来 agent 竞赛：上半场比"能不能做"，下半场比"做同样的事谁更省"——省钱的秘密不在模型，在 harness
- 量化锚点：成功率相近时，不同 harness 的 token 差距可达 30 倍、成本 6-9 倍；输入 token 占 95%
