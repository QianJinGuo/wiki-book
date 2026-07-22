---
source_url: https://mp.weixin.qq.com/s/liJD5FDI1_CbK7ZNVkpuwg
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
title: "ICML 2026｜告别「单线程」思维，智能体进化出了原生的并行推理大脑"
author: 机器之心
publication: 机器之心
date: 2026-05-19
platform: wechat
sha256: a7c3e1f2d5b8a4f6e2d0c8b4a6f2e8d0c4b6a8f2e4d0c8b6a4f2e8d0c4b6a8
---
# ICML 2026｜告别「单线程」思维，智能体进化出了原生的并行推理大脑
## 论文信息
- 标题：Native Parallel Reasoner: Reasoning in Parallelism via Self-Distilled Reinforcement Learning
- 链接：https://arxiv.org/abs/2512.07461
- 代码：https://github.com/bigai-nlco/Native-Parallel-Reasoner
- 项目主页：https://bigai-nlco.github.io/Native-Parallel-Reasoner
- 发表：ICML 2026 主会
- 作者：北京通用人工智能研究院（通研院）语言交互实验室——吴桐、刘洋、白骏、贾子夏（通讯）、郑子隆
## 背景与痛点：为什么需要并行推理？
传统链式思维（CoT）的问题：容易被早期判断带偏、发散不足、自我纠错弱、顺序生成效率受限。
未来更强的智能体需要类似 MapReduce 的"分而治之"思路：把复杂问题并行处理，再聚合结果完成全局最优决策。但实现面临三座大山：
1. **并行思考数据极难获得**：依赖强教师蒸馏，学生模型继承教师局限，难以自举
2. **低效的手工并行机制**：分支之间难共享、重复计算严重，效率无法满足实时部署
3. **基础设施与算法对并行架构支持不足**：推理引擎无法高效调度并行分支；RL 技术截断/削弱触发并行结构的特殊 Token 梯度
## NPR 核心理念
在零外部监督（不依赖强教师并行轨迹）条件下，让模型自我进化出并行推理能力。渐进式三阶段训练范式，让模型从"会用并行格式写出来"过渡到"计算图层面真的并行执行"。
## 三阶段训练范式
### 阶段一：并行格式学习（Format-following RL）
让模型先掌握并行推理的表达结构：如何标记分支、如何组织多条候选路径、如何定义聚合点。
方法：以格式合规与答案正确为奖励信号，对初始指令微调模型进行 DAPO 风格的强化学习，得到能产出并行格式轨迹的生成器（NPR-ZERO）。
### 阶段二：自蒸馏（Rejection Sampling + Parallel Warmup）
目标：把"格式化产物"变为高质量训练数据并让模型在并行语义上稳定。
方法：对 NPR-ZERO 进行拒绝采样，应用两条硬性筛选规则：
- **Outcome Correctness**：解析答案与 Ground Truth 一致
- **Structured Parallelism**：输出严格遵循并行格式 Schema
同时引入并行注意力掩码（Parallel Attention Mask）与并行位置编码（Parallel Positional Encoding），让模型内部支持并行分支独立计算并实现 KV Cache 重用。
### 阶段三：并行感知强化学习（Native-Parallel RL / PAPO）
目标：让模型不仅会"写"并行格式，也会"算"并行结果。
Parallel-Aware Policy Optimization（PAPO）关键设计：
- **并行 Rollout**：使用 NPR-Engine 产生严格遵守并行 Schema 的轨迹，保证样本合法
- **结构化过滤**：格式违规样本在进入优化前被剔除，奖励退化为纯准确性（+1/-1）
- **批次级优势归一化**：更大范围统计标准差来稳定优势估计
- **保留特殊 Token 的梯度**：防止触发并行结构的特殊标签被裁剪掉
- **放弃重要性采样**：采用严格的 On-Policy Objective，避免重采样比带来的不稳定
## NPR-Engine 工程化改进
把并行语义放到生产环境的并行 RL 会暴露大量工程问题，论文做了几项关键修复：
1. **预算感知的 KV 回收**：避免 Radix-Tree KV 路径的 Opportunistic Recycling 导致 Double-Free，引入预算感知的确定性回收机制与 Memory Flush 策略
2. **分支感知的 Token 累积策略**：把全局 Token 预算从"只看最长分支"改为"按活跃分支因子累计"，避免超出 max_new_tokens
3. **格式预检与轻量不变性**：在分支展开前加一层格式合法性检查，快速拒绝潜在非法分支以保证 Determinism
## 主要实验结果
### 训练数据替换效果（替换 Multiverse 训练语料）
| 数据集 | Multiverse | NPR-BETA (ORZ-8k) | 提升 |
|--------|-----------|-------------------|------|
| AIME24 | 46.7 | 50.8 | +4.1 |
| ZebraLogic | 60.2 | 76.1 | +15.9 |
| AMC23 | 75.0 | 85.9 | +10.9 |
| MATH500 | 81.6 | 91.6 | +10.0 |
| **平均** | **50.1** | **59.0** | **+8.9** |
### 并行 SFT 优势（顺序 SFT → 并行 SFT）
| 数据集 | SR-BETA | NPR-BETA | 提升 |
|--------|---------|----------|------|
| AIME25 | 37.1 | 42.9 | +5.8 |
| OlympiadBench | 56.3 | 60.1 | +3.8 |
| HMMT25 | 22.5 | 23.3 | +0.8 |
| ZebraLogic | 72.8 | 76.1 | +3.3 |
| **平均** | **58.2** | **59.0** | **+0.8** |
### 并行 RL 优势（NPR-BETA → NPR）
| 数据集 | NPR-BETA | NPR | 提升 |
|--------|----------|-----|------|
| AIME24 | 57.1 | 63.3 | +6.2 |
| HMMT25 | 26.3 | 30.8 | +4.5 |
| Minerva-Math | 38.2 | 43.0 | +4.8 |
| AIME25 | - | - | +1.2 |
| OlympiadBench | - | - | +1.5 |
| ZebraLogic | - | - | +2.8 |
| AMC23 | - | - | +2.2 |
| MATH500 | - | - | +0.8 |
| **平均** | **62.0** | **65.0** | **+3.0** |
### 并行触发率对比
- **Multiverse-32B**：各数据集并行率差异显著，ZebraLogic 等逻辑密集型任务明显低于数学数据集（对领域特征敏感）
- **NPR**：所有 8 个数据集均达到 **100% 并行触发率**——端到端训练流程能够更可靠地将并行推理作为模型的默认问题解决模式
### 推理效率
NPR 在所有 5 个基准测试中均取得最佳效率：
- 优于 Multiverse（1.3 倍至 2.4 倍）和自回归基线
- 加速比随任务难度增加：AIME25 4.6 倍、HMMT25 4.1 倍（难）vs AMC23 2.9 倍（易）
## 案例解析：并行推理典型模式
```
<guideline>：并行产生若干独立 plan（每个 plan 一句战术）
<step>：每个 plan 独立并行展开具体推理步骤
<takeaway>：整合与交叉验证，得出最终结论并给出简短答案（boxed answer）
```
对于域函数或几何题：某些 plan 会分别做不同的分解（代数、数值检验、几何角度关系），最后 <takeaway> 将各分支结果比对、剔除不一致项并输出最终答案。
## 结语
NPR 证明了在零外部监督条件下，通过自蒸馏 + 并行感知 RL 的三阶段范式，可以让模型从"模仿并行"进化到"原生并行"。关键在于：PAPO 直接在并行计算图内优化分支策略，NPR-Engine 解决了生产级并行 RL 的工程挑战，使并行推理成为模型的默认问题解决模式而非外部策略。