---

title: "SkillX: Automatically Constructing Skill Knowledge Bases for Agents"
source_url: https://mp.weixin.qq.com/s/BNI58tDNczkLyhe9jBw-nQ
publish_date: 2026-04-27
tags: [wechat, article, agent]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: a19a9cb569e14d884da4b312bb94539b7f24699ec703c78deef9be75928b6f88

---
# SkillX: Automatically Constructing Skill Knowledge Bases for Agents
浙大提出 SkillX：层次化技能库驱动的可复用 Agent 学习
## 一句话总结
本工作提出 SkillX，一个自动构建分层技能知识库的框架，通过将轨迹抽象为多级技能，实现跨模型、跨任务的高效经验复用与泛化能力提升。
## 背景问题
当前基于经验学习的智能体方法存在三大核心瓶颈：
1. 经验学习孤立化，不同任务间重复探索，效率低下
2. 经验表示形式（如 trajectory、workflow）泛化能力弱，难以迁移
3. 经验获取受限于当前模型能力，难以突破能力边界
## 方法简介
SkillX 自动化技能库构建框架，核心包括三大模块：
**1. Multi-Level Skills Design（三层技能设计）**
将经验拆解为三层结构：
- Planning Skills（任务规划）
- Functional Skills（子任务工具调用）
- Atomic Skills（底层工具使用模式）
**2. Iterative Skills Refinement（迭代技能精炼）**
在多轮 rollout 中对技能进行 merge、filter 和更新，实现持续优化。
**3. Exploratory Skills Expansion（探索式技能扩展）**
通过经验引导探索生成新任务与技能，扩大技能覆盖范围，实现超出训练分布的泛化能力。
## 实验结果
在 BFCL-v3、AppWorld 和 τ²-Bench 等长程交互任务上：
- 相比无记忆或传统经验方法（A-Mem、AWM、ExpeL），SkillX 在多个模型（Qwen3-32B、Kimi-K2、GLM-4.6）上均显著提升性能
- 在 Qwen3-32B 上平均提升约 10 个百分点，显著增强弱模型能力边界
- 同时减少执行步骤，提高推理效率
- 在跨模型迁移中表现出更强的稳定性与泛化能力
## 论文信息
- 论文：https://arxiv.org/abs/2604.04804
- GitHub：https://github.com/zjunlp/SkillX
- 作者：Chenxi Wang, Zhuoyun Yu, Xin Xie, Wuguannan Yao, Runnan Fang, Shuofei Qiao, Kexin Cao, Guozhou Zheng, Xiang Qi, Peng Zhang, Shumin Deng（浙大）
- 提交：2026-04-06，修订 2026-04-19 (v2)
- 评审状态：Work in progress
## 一句话点评
SkillX 用"分层技能 + 可复用经验库"重构 agent 学习范式，证明结构化经验比原始轨迹更关键，Skill Library 可能是下一代 Agent 的核心基础设施。