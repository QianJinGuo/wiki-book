# Ch13 MLOps 与评估

> 不能观测就不能改进：评估体系、基准测试、实验追踪

> 本章收录 **16 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 1 |
| ⭐⭐ 工程师 | 需编程基础 | 14 |
| ⭐⭐⭐ 专家 | 需ML基础 | 1 |

---

## 导读

你无法改进你无法测量的东西。

本章探讨 AI 系统的评估与运维：Agent-Memory 评测全景、Skill 版本对比五大原则、Claw-SWE-Bench（首个独立测量 Harness 对编程 Agent 影响的基准）、以及 Spotify 的 LLM Eval 实践。

核心观点：评估不是"跑个 benchmark 就完了"——你需要多维度评估（质量、延迟、成本、安全）、持续评估（模型更新后重新跑）、以及对抗性评估（故意找茬式测试）。

MLOps 是 AI 系统从"Demo"到"产品"的分水岭。

---

## Ch13.001 06—看懂 AI Skill 测评报告：PASS / FAIL / INCONCLUSIVE 背后的发布决策逻辑

→ [独立页面](ch13-001-06-看懂-ai-skill-测评报告-pass-fail-inconclusive-背后的发布决策逻辑.html)

## Ch13.002 阿里巴巴&蚂蚁 LoongSuite GenAI 可观测语义规范：从统一数据语言到规模化落地

→ [独立页面](ch13-002-阿里巴巴-蚂蚁-loongsuite-genai-可观测语义规范-从统一数据语言到规模化落地.html)

## Ch13.003 循环工程 (Loop Engineering) — 清华 2026 框架

→ [独立页面](ch13-003-循环工程-loop-engineering-清华-2026-框架.html)

## Ch13.004 NICE：浙大提出的理论驱动型 LLM 社会智能诊断基准

→ [独立页面](ch13-004-nice-浙大提出的理论驱动型-llm-社会智能诊断基准.html)

## Ch13.005 07—AI Skill 测评体系完整进阶指南：5 大能力缺口与填补路径

→ [独立页面](ch13-005-07-ai-skill-测评体系完整进阶指南-5-大能力缺口与填补路径.html)

## Ch13.006 ai-skill-测评指标体系

→ [独立页面](ch13-006-ai-skill-测评指标体系.html)

## Ch13.007 用 Amazon SageMaker AI 与 Qualcomm AI Hub 打通从云端训练到端侧 NPU 的交付闭环

→ [独立页面](ch13-007-用-amazon-sagemaker-ai-与-qualcomm-ai-hub-打通从云端训练到端侧-npu-的交付闭环.html)

## Ch13.008 SaaS-Bench：浙大阿里 Steering Computer-Use Agent 真实系统评测（3.8% 通过率暴露范式天花板）

→ [独立页面](ch13-008-saas-bench-浙大阿里-steering-computer-use-agent-真实系统评测-3-8-通过率暴露范式天花板.html)

## Ch13.009 Hermes 可观测性方案

→ [独立页面](ch13-009-hermes-可观测性方案.html)

## Ch13.010 Noam Brown：推理预算应成为AI评估的基础变量

→ [独立页面](ch13-010-noam-brown-推理预算应成为ai评估的基础变量.html)

## Ch13.011 AI Skill Evolution Framework

→ [独立页面](ch13-011-ai-skill-evolution-framework.html)

## Ch13.012 Agent Skill 评估与迭代

→ [独立页面](ch13-012-agent-skill-评估与迭代.html)

## Ch13.013 NVIDIA MCG Toolkit 模型文档自动化

→ [独立页面](ch13-013-nvidia-mcg-toolkit-模型文档自动化.html)

## Ch13.014 CEOs’ top priorities for IT leaders today

→ [独立页面](ch13-014-ceos-top-priorities-for-it-leaders-today.html)

## Ch13.015 EVA-Bench Data 2.0

→ [独立页面](ch13-015-eva-bench-data-2-0.html)

## Ch13.016 美团海报生成 AIGC 技术体系：PosterCraft/PosterOmni/PosterReward（ICLR/CVPR 2026 三连发）

→ [独立页面](ch13-016-美团海报生成-aigc-技术体系-postercraft-posteromni-posterreward-iclr-cvpr-2026-三连发.html)

