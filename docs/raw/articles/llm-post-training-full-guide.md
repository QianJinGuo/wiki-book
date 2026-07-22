---
title: LLM Post-Training全景指南：从RLHF到GRPO再到AgenticRL
source_url: https://mp.weixin.qq.com/s/jabnGpTJ8sCc7kBj11pm8A
publish_date: 2026-04-25
tags: [wechat, article, gpt, deepseek, agent, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: f69b12794a657238cba59db7a33cb3edeab4aec27849a9ba6a4ac446562132f0
---
# LLM Post-Training全景指南：从RLHF到GRPO再到AgenticRL
**来源**：数据派THU（背靠清华大学大数据研究中心）
**作者**：基于机器学习算法与自然语言处理（知乎）
**发布日期**：2026年4月12日
## 核心一句话
SFT教模型"说什么"，偏好优化教模型"怎么选"，RL教模型"怎么想"——三者层层递进，构成完整Post-training体系。
## 1. Post-training定义
**预训练（Pre-training）**：海量无标注文本让模型学会语言基本规律和世界知识，产出"什么都知道一点、但什么都不太好用"的基座模型。
**Post-training**：将"毛坯房"精装修成真正好用的产品——让模型学会遵循指令、与人类偏好对齐、具备推理能力、能使用工具完成复杂任务。
## 2. 餐厅厨师类比
- **SFT**：资深厨师手把手教招牌菜——"这道菜应该这样做"
- **RLHF**：食客品尝多道菜并排序——根据反馈反复调整口味，Reward Model是"食客评分系统"
- **DPO**：直接从"A菜比B菜好"对比数据中学习，省去单独训练评分系统
- **RLVR**：有标准答案场景（数学/代码），答案对就是对，不需要人打分
- **Agentic RL**：不仅会做菜，还要会查菜谱、采购、协调后厨——完整"主厨智能体"
## 3. 技术方法详解
### 3.1 SFT（监督微调）
- **核心**：收集高质量(prompt, response)数据对，用交叉熵损失函数微调
- **数据来源**：指令跟随数据（Alpaca/ShareGPT）、特定领域专业数据、多轮对话数据
- **合成数据**：用强模型生成训练数据教小模型（知识蒸馏）
- **实现**：全参数微调 vs PEFT（LoRA/QLoRA只需训练0.1%~1%参数）
- **关键认知**：SFT无法让模型学会超越训练数据的能力，需要RL
### 3.2 RLHF（三步流程）
1. **SFT**：人类撰写高质量回答进行监督微调
2. **训练Reward Model**：SFT模型生成多个回答，人类标注者排序，训练Reward Model给出标量分数
3. **PPO优化**：用Reward Model作为奖励信号，通过PPO算法优化
**RLAIF**：用AI模型而非人类提供偏好反馈降低成本。Constitutional AI是典型代表。
### 3.3 PPO（四模型架构）
| 模型 | 角色 | 是否更新 |
|------|------|----------|
| Policy Model | 被训练的LLM，最终要得到的模型 | 是 |
| Reference Model | 不做梯度更新的参考模型，用于KL散度约束 | 否 |
| Reward Model | 评估回答质量的标量分数 | 否 |
| Critic Model | 估算预期回报，用于计算Advantage | 是 |
**PPO核心目标**：让策略朝获得更高奖励的方向改进，通过clipping机制约束变化幅度，保证训练稳定性。
### 3.4 GRPO（去掉Critic）
**GRPO**（DeepSeek，2025）：采样G个回答，通过Reward Model评估，用相对排序计算Advantage，取代PPO中的Critic模型。
- **优势**：减少30%~50%计算开销和显存占用
- **RLVR**（可验证奖励的RL）：DeepSeek-R1使用GRPO + RLVR训练
**DeepSeek-R1**：首次证明纯RL训练（不需要SFT）就能涌现强大推理能力。
- **R1-Zero（纯RL路线）**：模型自发涌现自我反思、问题分解、多路径探索（"Aha moment"），回答长度随训练自然增长
- **R1（完整路线）**：R1-Zero基础上加入SFT冷启动，格式规范性和可读性更优
### 3.5 DPO及变体（Offline偏好优化）
**DPO**：直接最大化preferred相对于rejected的对数概率优势，通过reference model正则化。
- **局限**：offline方法，无法从自身探索中学习，提升推理能力不如online RL
| 方法 | 核心改进 | 适用场景 | 数据需求 |
|------|---------|---------|---------|
| DPO | 用分类损失替代RL | 通用对齐 | Pairwise偏好对 |
| SimPO | 移除reference log-ratio，梯度更稳定 | 噪声数据、众包标注 | Pairwise偏好对 |
| ORPO | odds-space优化，处理类别不平衡 | 多语言、长尾数据 | Pairwise偏好对 |
| KTO | 前景理论不对称损失 | 高风险领域（法律、医疗） | Pointwise好/坏标签 |
### 3.6 GRPO改进：DAPO / Dr.GRPO
**Entropy Collapse（熵坍塌）**：最严重问题——随训练推进策略熵快速下降，G个回答变得几乎完全相同，失去探索能力。
**DAPO四大关键改进**：
1. **Clip-Higher**：对正advantage回答放宽clipping上界，鼓励探索
2. **Dynamic Sampling**：过滤全对或全错的prompt，只保留有区分度的prompt
3. **Overlong Filtering**：超长回答设reward为0而非负奖励，避免学会"生成短回答"
4. **Token-level Loss**：按token而非sequence计算损失，避免长序列过度加权
**Dr.GRPO**：修复length normalization引入的length bias问题。
## 4. 完整训练流水线
```
阶段一：SFT冷启动
    ↓
阶段二：RL推理训练（GRPO/DAPO + RLVR） ← 推理能力提升核心
    ↓
阶段三：偏好对齐（DPO/RLHF）
    ↓
阶段四（可选）：拒绝采样 + 蒸馏到小模型
```
DeepSeek-R1通过此方式将推理能力蒸馏到1.5B~70B小模型。
## 5. 前沿方向
### 5.1 Agentic RL
- **Search-R1**：训练模型学会"什么时候该搜索、搜索什么、如何利用搜索结果"
- **ReTool**：训练模型在推理过程中调用计算器、代码解释器等工具
- **核心挑战**：多轮交互credit assignment、稀疏奖励、推理与工具使用的资源竞争
### 5.2 Reward Model演进
- **PRM（Process Reward Model）**：对推理每一步评分，而非只看最终答案
- **Generative Reward Model**：用LLM本身作为judge评估回答质量
- **Multi-objective Reward**：同时优化准确性、安全性、简洁性等多个维度
### 5.3 Synthetic Data
最佳实践："生成-验证-训练"循环——用强模型生成候选回答，通过verifier筛选正确，用这些数据进行SFT或RL的warm-up。
## 6. 关键认知总结
1. **SFT是基础但不够**：无法让模型学会超越训练数据的推理能力
2. **RL是提升推理能力的关键**：GRPO去掉Critic，DAPO解决熵坍塌，DeepSeek-R1证明纯RL可涌现推理能力
3. **奖励信号设计至关重要**：从RLHF→RLAIF→RLVR，RLVR在可验证领域表现出色，扩展到开放域仍是开放问题
4. **Online RL vs Offline Preference Optimization各有所长**：实践中通常两者结合
5. **Agentic RL是下一个前沿**：从单轮问答到多轮工具使用
## 7. 参考文献
[1-15] 覆盖ArXiv论文：PPO(1707.06347)、DPO(2305.18290)、GRPO、DeepSeek-R1、SimPO、ORPO、KTO、DAPO等