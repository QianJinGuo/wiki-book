---
title: "5亿视频炼出全球最大GUI开源数据集、推理Token省71%小模型反超大模型——小米AI团队多篇论文入选ICML 2026"
author: 小米技术
date: 2026-05-14
source: https://mp.weixin.qq.com/s/arVgzp3hGKgZaE3RCTXGGg
sha256: da769794d77c
review_value: 8
review_confidence: 9
review_score: 72
review_recommendation: 入库
tags:
  - icml-2026
  - xiaomi
  - gui-agent
  - video2gui
  - wildgui
  - guievalkit
  - come
  - led
  - veritime
  - visual-para-thinker
  - video-opd
  - mec
  - gad
  - r3
  - spark
  - mixture-of-experts
  - latent-exploration-decoding
  - neural-architecture-search
  - multimodal
  - audio-understanding
---

## 02 推理增强
### LED：恢复 RL 训练后推理模型的探索多样性
**论文**：https://arxiv.org/abs/2602.01698
**代码**：https://github.com/AlbertTan404/LED
**合作单位**：中国人民大学、Unimore
**问题**：RL 训练后推理模型出现 **entropy collapse**——提高温度只制造噪声，无法产生多样路径。
**解法**：LED（Latent-Exploration-Decoding）不改模型、不加参数、不需训练，仅利用模型内部多层隐状态的聚合概率分布进行采样。
**通俗理解**：RL训练后的推理模型像一个"只会用标准解法的学生"，LED让它重新学会"试试别的思路"。
### VeriTime：时序推理 Token 省71%
**论文**：https://arxiv.org/pdf/2602.07830
**代码**：https://anonymous.4open.science/r/VeriTime-E017
**合作单位**：中山大学、新加坡国立大学
**问题**：缺乏时序 CoT 训练数据；没有专门针对时序数据的强化学习算法。
**解法**：TSRgen 自动合成流水线 + TSRBench（首个过程可验证标注的时序-文本多模态推理数据集）+ 两阶段强化微调（细粒度过程级奖励）
**效果**：推理 Token 消耗平均**降低71%**，3B-4B 模型达到/超越更大规模专有 LLM。
---
## 03 多模态理解
### Visual Para-Thinker：并行推理框架
**论文**：https://arxiv.org/pdf/2602.13310v1
**合作单位**：浙江大学、湖南大学
**问题**：垂直扩展（思维链/强化学习）在视觉领域容易陷入固定思维模式。
**解法**：首个 LMM 并行推理框架，路径感知注意力机制 + 可学习并行旋转位置编码。
**通俗理解**：以前 AI 看图是"盯着一个点使劲想"，Visual Para-Thinker 让它学会"分区并行看、最后汇总"。
### Video-OPD：时序视频定位 GRPO 改进
**论文**：https://arxiv.org/pdf/2602.02994
**合作单位**：浙江大学、中国人民大学
**问题**：GRPO 方法面临稀疏序列级奖励（信用分配困难）+ 多轮策略采样（计算开销巨大）。
**解法**：细粒度逐词元监督信号 + 教师验证差异聚焦训练课程策略。
**效果**：超越现有 GRPO 方法平均17%+，计算开销大幅降低。
### GAD：蒸馏后恢复噪声敏感性
**论文**：无公开链接（合作单位：武汉大学、巴黎综合理工学院）
**问题**：蒸馏后模型对初始噪声失去敏感性，不同随机种子生成结果趋同。
**解法**：GAD（Geometry-Aware Distillation）通过 Jacobian 响应对齐恢复局部敏感性，作为正则项无缝集成于多种蒸馏范式。
**效果**：布局/低级控制任务中显著恢复教师性能；缓解多样性与保真度权衡。
### MECAT：细粒度音频理解基准
**论文**：https://arxiv.org/abs/2507.23511
**代码**：https://github.com/xiaomi-research/mecat
**合作单位**：香港中文大学
**问题**：当前最强模型（Gemini系列）在细粒度音频描述任务上仅53.1%。
**解法**：多领域专家模型+LLM Chain-of-Thought推理+多级质量控制的自动化标注流水线（20000条，8个音频域）；DATE 指标（Discriminative-Enhanced Audio Text Evaluation）。
---
## 04 训练底座
### R3：MoE RL 训练稳定性
**论文**：https://arxiv.org/abs/2510.11370
**合作单位**：北京大学
**问题**：MoE 模型 RL 训练时极其不稳定，路由器在训练和推理阶段可能做出不同专家选择。
**解法**：R3（Rollout Routing Replay）在推理阶段记录路由分布，训练阶段重放——"谁干活，谁收反馈"。
**效果**：多个 MoE 模型族显著提高训练稳定性，避免崩溃；仅3.45%训练速度下降。
### SPARK：LLM 驱动的神经架构搜索
**论文**：https://arxiv.org/abs/2605.04057
**代码**：https://github.com/AIM-ResearchLab/SPARK
**合作单位**：西安交通大学、北方工业大学、中关村学院
**问题**：LLM 作为 NAS 搜索引擎时，候选架构频繁报错（"功能纠缠"：算子和调用方式被同时改动）。
**解法**：SPARK 提出"先定位、再修改"的结构化编辑范式——代码切成 Operator 和 Action 两块互斥区域，每轮只动其中一块。
**通俗理解**：从"想到哪改到哪"→"先想清楚改哪块，再只动那一块"。