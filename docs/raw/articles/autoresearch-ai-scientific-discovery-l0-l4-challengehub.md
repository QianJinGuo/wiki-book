---
title: "这篇52页综述把AI做科研这件事，明明白白划成了L0到L4五个等级"
source: wechat
source_url: https://mp.weixin.qq.com/s/vqB4CtJPq0j61eSIADvUoQ
author: ChallengeHub
feed_name: ChallengeHub
review_value: 8
review_confidence: 8
review_recommendation: strong
review_stars: 4
date: 2026-05-27
created: 2026-05-28
updated: 2026-05-28
tags: [autoresearch, ai-for-science, research-agent, autonomy-level, l0-l4, the-ai-scientist, alphafold, multi-agent, benchmark]
type: article
provenance_state: synthesized
sha256: 5730b097d4fb6f5cdd1364ace813cc7786c6012b5d5950dbe2826c85c0f534ba
---

# 这篇52页综述把AI做科研这件事，明明白白划成了L0到L4五个等级

> **来源**：ChallengeHub，2026年5月27日
> **背景**：arXiv 2605.23204v1，52页综述《AutoResearch AI: Towards AI-Powered Research Automation for Scientific Discovery》，华科/Lehigh/清华/斯坦福/UCSD/微软/Salesforce 等机构作者。

## 核心框架：L0到L4五级自主度

这篇综述的核心贡献是给「AI自主科研」划了五级自主度框架——按 workflow控制权、任务执行权、验证权、科学问责权 四个维度看人和AI怎么分工：

| 等级 | 描述 | 代表系统 |
|------|------|----------|
| **L0** | Human Only，纯人工 | 历史基线 |
| **L1** | Human-Led, AI-Assisted，人主导AI辅助 | ChatGPT/Claude/Gemini 搜文献、改语法、brainstorm |
| **L2-S** | 单步自动化执行 | Coscientist (Nature 2023)、A-Lab |
| **L2-I** | 交互式工作流自动化 | AI co-scientist (Nature 2026)、SciAgents |
| **L2-P** | 流水线自动化（人验证下） | The AI Scientist、AI Scientist-v2、Agent Laboratory |
| **L3** | AI-Led, Human-Assisted，AI主导人辅助 | **目前无系统达到**，benchmark 测「离L3多远」 |
| **L4** | AI-Autonomous，AI完全自主 | **理想化远期目标**，无任何系统达到 |

**关键判断**：L1-L2是Vibe Research（人在驾驶座），L3-L4才是真正的AutoResearch（AI在驾驶座）。「pipeline能跑通 ≠ 到了L3」。

## 从AlphaFold到The AI Scientist：科研范式转变

**专用模型时代**：AlphaFold 把「蛋白质结构预测」这个高度专门化任务干到极致，但本质是在窄问题设定里工作。

**转折点**：大语言模型起来后，AI能参与科研流程的广度突然被打开——文献调研、想法生成、计划制定、代码执行、结果分析、论文撰写，第一次有可能被同一个系统串起来。

**核心警示**：「流程被打通了」不等于「科研自主了」。现在的系统在搜索、起草、写代码、bounded execution 上越来越强，但在 validation、rejection（拒绝弱方向）、reproducibility、exception handling、accountable closure 这些环节还差得远。

## L2-P代表性系统

**The AI Scientist（Sakana AI, 2024）**：把 ideation→code→experiment→figure→paper draft→simulated review 整合成端到端框架。

**2026年趋势**：从「研究agent demo」转向「可复用基础设施」—— NanoResearch、ResearchClaw、ScienceClaw、AutoResearchClaw、ARIS、EvoScientist、NeuroClaw 把可复用workspace、tool orchestration、persistent project state 做成 infrastructure。

## 五个评估维度

作者提出的评估体系核心是把「评估」从「任务完成度」切换到「科学可信度」：

- **Novelty**（新颖性）
- **Validity**（有效性）
- **Impact**（影响力）
- **Reliability**（可靠性）
- **Provenance**（可溯源性）

## 领域间不均衡是真实的

- **计算/形式科学**走得最快：artifact 本身就是 digital、executable、replayable
- **化学/材料**慢一些，但有 robotic lab
- **生物/医学/社科**更慢：embodiment、ethical constraint、causal reasoning 的难度不是「加大模型」能解决的

**重要判断**：不要拿 coding agent 的进展去推断「AI能做全科学的端到端研究」。

## 当代Landscape：分工而非统一架构

当前 AutoResearch 领域不是被某个 canonical 架构统治，而是功能分工：

1. **知识支持层**：文献 grounding、QA、planning、report construction（STORM、OpenScholar）
2. **执行底座层**：code agent、tool use、laboratory interface（OpenHands、Aider、SWE-agent）
3. **Pipeline协同层**：把上面两层连起来（The AI Scientist、AI Scientist-v2、Agent Laboratory）
4. **开源基础设施层**：persistent workspace、可复用研究环境（NanoResearch、ResearchClaw、AutoResearchClaw）

---

*arXiv编号：2605.23204v1，52页正文+几百篇reference*
