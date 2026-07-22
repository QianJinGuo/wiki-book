sha256: edcd7b3b3d42674a385a9f913f9f6af441001c7c2bf7b26032e25e39f869d946
---
title: "The Rules of the Game: A Survey of Rubrics for Large Language Models"
source_url: "https://mp.weixin.qq.com/s/fLqQmZRM_xt9Am7_favtUA"
author: "机器之心 / 人大高瓴人工智能学院"
published: 2026-06-29
ingested: 2026-06-29
type: raw-article
language: zh
tags: [rubrics, evaluation, reward-model, training, llm, survey, alignment]
---

# The Rules of the Game: A Survey of Rubrics for Large Language Models

**论文链接**: [PDF](https://8421bcd.github.io/_pages/Rubrics_Survey.pdf) | [备用](http://playbigdata.ruc.edu.cn/dou/publication/Rubrics_Survey.pdf)
**GitHub**: https://github.com/RUC-NLPIR/Rubrics_Survey
**来源**: 中国人民大学高瓴人工智能学院，40页综述

## 为什么需要 Rubrics

早期任务有明确评估信号（准确率、执行成功率）。但 Deep Research、医疗咨询、多模态生成、长程 Agent 等复杂场景中，输出质量由多维度共同决定，不再由单一答案决定。

Rubrics 将"好答案"拆解为明确评价项（事实正确性、覆盖度、证据支撑、推理严谨性、安全性、格式合规性、可用性），逐项打分聚合。

**概念区分**：
- LLM-as-a-Judge 解决"谁来评"；Rubrics 解决"按什么标准评"
- Reward model 直接输出标量；Rubrics 显式列出评价标准
- RLVR 依赖可验证答案；Rubrics 适合多维度开放任务

## Rubrics 形式化

Rubric set = 若干 rubric item，每个 item 含自然语言描述 + 重要性权重。Judge model 逐项打分，平均/加权/隐式聚合得整体评价。

## 构造方法（四类）

1. **直接生成**：LLM 一次性生成评价标准
2. **对比生成**：输入偏好对（高质量 vs 低质量），提取有判别力的标准
3. **迭代优化**：验证、分解、过滤，得到更原子的 rubric set
4. **在线共同演化**：Rubrics 随 policy rollouts 更新，与模型训练共同演化

## 训练应用

### Policy Model Training
- Judge 按 Rubrics 逐项打分 → 聚合为奖励 → PPO/GRPO
- 轨迹级 Rubrics 对 Agent/多步任务尤其重要
- **高级机制**：可学习权重、veto/saturation 机制、环境反馈、curriculum 训练、优势估计
- Rubrics 从"事后打分"推进为"生成过程中指导"：模型先生成/读取 Rubrics → 规划回答

### Reward Model Training（三类作用）
1. **可解释性**：RM 先逐项分析再给偏好判断
2. **细粒度信号**：rubric-level 参考信号约束中间分析过程
3. **高质量数据构造**：识别核心维度，避免浅层线索（长度/格式）

## 评测应用

**通用任务**：推理（检查中间步骤）、深度研究（信息覆盖、证据支撑）、Agent（工具选择、参数调用、多轮可靠性）、对齐评测

**专业领域**：医疗（医学正确性、安全风险、沟通质量）、法律（事实适用、过程可审计）、金融（风险披露、实务可操作性）

## 开放挑战

1. **Reward hacking**：模型 hack rubrics 表面特征而非提升质量
2. **泛化**：RM 可能过拟合特定领域 rubrics
3. **评测偏差**：rubric 写法和 judge 选取引入 bias
4. **个性化 Rubrics**：可能迎合浅层偏好，与安全标准冲突
5. **Rubric 安全**：恶意标准改写可悄悄改变 judge 偏好方向

## 核心观点

Rubrics 是大模型训练与评测的**显式质量接口**——定义标准、组织反馈、连接人类偏好、任务约束与模型优化。
