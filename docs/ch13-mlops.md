# Ch13 MLOps 与评估

> 不能观测就不能改进：评估体系、基准测试、实验追踪

> 本章收录 **13 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐⭐⭐ 专家 | 需ML基础 | 2 |
| ⭐⭐⭐⭐ 科学家 | 需研究背景 | 7 |
| ⭐⭐⭐⭐⭐ 大师 | 前沿/哲学 | 4 |

---

## 导读

你无法改进你无法测量的东西。

本章探讨 AI 系统的评估与运维：Agent-Memory 评测全景、Skill 版本对比五大原则、Claw-SWE-Bench（首个独立测量 Harness 对编程 Agent 影响的基准）、以及 Spotify 的 LLM Eval 实践。

核心观点：评估不是"跑个 benchmark 就完了"——你需要多维度评估（质量、延迟、成本、安全）、持续评估（模型更新后重新跑）、以及对抗性评估（故意找茬式测试）。

MLOps 是 AI 系统从"Demo"到"产品"的分水岭。

---



---

## 本章内容

### ⭐⭐⭐ 专家（2 篇）

- [001. CEOs’ top priorities for IT leaders today](ch13/001-ceos-top-priorities-for-it-leaders-today)
- [002. Discretizing Reward Models](ch13/002-discretizing-reward-models)

### ⭐⭐⭐⭐ 科学家（7 篇）

- [003. Agent 评测方法论——美团图灵两年 BP 实践（人人一致/人机一致 + 桥梁指标 + 长程范式）](ch13/003-agent-bp)
- [004. 美团海报生成 AIGC 技术体系：PosterCraft/PosterOmni/PosterReward（ICLR/CVPR 2026 三连发）](ch13/004-aigc-postercraft-posteromni-posterreward-iclr-cvpr-2026)
- [005. 阿里巴巴&蚂蚁 LoongSuite GenAI 可观测语义规范：从统一数据语言到规模化落地](ch13/005-loongsuite-genai)
- [006. NICE：浙大提出的理论驱动型 LLM 社会智能诊断基准](ch13/006-nice-llm)
- [007. 循环工程 (Loop Engineering) — 清华 2026 框架](ch13/007-loop-engineering-2026)
- [008. 用 Amazon SageMaker AI 与 Qualcomm AI Hub 打通从云端训练到端侧 NPU 的交付闭环](ch13/008-amazon-sagemaker-ai-qualcomm-ai-hub-npu)
- [009. SaaS-Bench：浙大阿里 Steering Computer-Use Agent 真实系统评测（3.8% 通过率暴露范式天花板）](ch13/009-saas-bench-steering-computer-use-agent-3-8)

### ⭐⭐⭐⭐⭐ 大师（4 篇）

- [010. ai-skill-测评指标体系](ch13/010-ai-skill)
- [011. 07—AI Skill 测评体系完整进阶指南：5 大能力缺口与填补路径](ch13/011-07-ai-skill-5)
- [012. Agent Skill 评估与迭代](ch13/012-agent-skill)
- [013. 06—看懂 AI Skill 测评报告：PASS / FAIL / INCONCLUSIVE 背后的发布决策逻辑](ch13/013-06-ai-skill-pass-fail-inconclusive)


---

## 本章收束

不能观测就不能改进。这一章的核心判断是：没有 eval 的 Agent 都是 demo——不是质量不够好，而是你根本无法知道它是变好了还是变坏了。多维度指标、持续回归、对抗性测试，三者齐备才算拥有了"改进的资格"。

---
