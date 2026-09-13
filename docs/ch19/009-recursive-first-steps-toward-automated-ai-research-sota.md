# Recursive First Steps Toward Automated AI Research：SOTA 三基准自动化研究系统

> 📊 Level ⭐⭐⭐⭐ | 10.9KB

> **Background**：本文档基于 Recursive 团队 2026-06-11 发布的工程报告 *First Steps Toward Automated AI Research* 整理。Recursive 团队（与 [AlphaEvolve](https://github.com/QianJinGuo/wiki-public/blob/main/entities/alphaevolve-impact-deepmind.md) 同生态但不同公司）开发了一套自动化研究循环系统，瞄准三大 AI 进步杠杆：**训练算法 / 训练速度 / 硬件利用**。他们在三个 SOTA benchmark 上同时取得突破并开源 artifacts。

## 核心命题
**自动化研究系统 = 提案 → 实现 → 实验 → 验证 → 选下一实验的闭环**。系统并行运行多个研究线程（long horizons），保留前轮实验上下文，分支合并，对结果做 reward hacking + 方差验证后才认作"真进步"。这是 **open-ended algorithms 范式**的工程化落地，建立在团队此前递归自改进 AI 的工作基础上。

## 三大 SOTA 结果

| Benchmark | 任务 | 指标 | 旧 SOTA | Recursive | 提升 |
|----------|------|------|---------|-----------|------|
| NanoChat Autoresearch | 固定算力预算下训练小 LLM 达最高性能 | 验证 BPB | 0.9372 | 0.9109 | -0.0263 BPB（**1.3× 速度提升**到相同 loss） |
| NanoGPT Speedrun | 固定目标下训练小 LGM 达最快 | 达到 3.28 验证 loss 的训练时间 | 79.7s | 77.5s | **2.2s 更快**（约 2.8%） |
| SOL-ExecBench | GPU kernel 优化到硬件极限 | 235 kernels 平均 SOL score | 0.699 | 0.754 | **18% 缩小与最优估计 1.0 的差距** |

三个 benchmark 共同特性：**清晰指标 / 低方差 / 可抗 reward hacking 硬化**——这正是"可被自动化研究"的工程标准。

## 系统设计关键点

### 1. 抗 reward hacking 是 first-class 设计目标
- 每次结果提升需通过**方差验证** + **reward hack 检测**才记为"真进步"
- 防止"模型在 benchmark 上刷分但泛化崩了"的常见反模式
- 与 [Agent 自我改进六条路](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-self-improvement-six-mechanisms.md) 中"对抗训练 + 编排自优化"两机制深度呼应

### 2. Long horizon context management
- 多个研究线程并行
- **保留前轮实验上下文**（不重置 prompt）
- 分支合并（promising branch combination）
- 工程实现上接近 [Hermes 自改进循环](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-self-improving-loop-winty.md) 的"持久记忆 + 进化搜索"

### 3. 三大杠杆设计
- **训练算法**：让 NanoChat 学得更好（数据/优化器创新）
- **训练速度**：让 NanoGPT 跑得更快（架构/并行策略）
- **硬件利用**：让 GPU kernel 更接近理论极限（编译器/SOL 优化）
- 三个杠杆**互补**：算法创新 × 速度优化 × 硬件利用 = 端到端 AI 进步

## 与 AlphaEvolve / 已有自动化研究工作的差异化

| 维度 | AlphaEvolve (DeepMind) | Recursive First Steps |
|------|----------------------|----------------------|
| 任务域 | 数学/算法发现 + Google 基础设施 | 训练算法/速度/硬件 三方 |
| 反馈循环 | 静态 eval 集 | **方差验证 + reward hack 硬化** |
| 进度评估 | 算法质量 + 业务指标 | SOTA benchmark 提升幅度 |
| 开源 | 部分 | 全部 artifacts 开源 ([GitHub recursive-org](https://github.com/recursive-org/first-steps-toward-automated-ai-research)) |
| 部署 | Google 内部 | 通用研究基础设施 |

参考 [AlphaEvolve Impact](https://github.com/QianJinGuo/wiki-public/blob/main/entities/alphaevolve-impact-deepmind.md) 和 [AlphaEvolve 一周年](https://github.com/QianJinGuo/wiki-public/blob/main/entities/alphaevolve交出一周年炸裂成绩单ai自我改进不再科幻.md) 了解 DeepMind 路线。

## 深度分析

**1. 抗 reward hacking 是 first-class 设计目标**

Recursive 系统在每次结果提升时，都需要通过方差验证 + reward hack 检测才记为"真进步"。 这不是事后的质量检查，而是研究循环的第一优先级。这一设计选择揭示了自动化研究系统的核心挑战：在开放式的评估任务中，"刷分"和"真正进步"的边界极难区分——SOL-ExecBench 的案例尤其典型，部分候选方案通过 persistent state 或 timing harness 漏洞获得高分，而非真正更优的 kernel 实现。

**2. 三大 benchmark 的共同特性：可被自动化研究的标准**

三个 benchmark 共同特性：**清晰指标 / 低方差 / 可抗 reward hacking 硬化**。 这三大特性正是"可被自动化研究"的工程标准——意味着不是所有 AI 进步任务都适合自动化研究。当前范式中，适合自动化研究的任务集中在训练算法调优、硬件利用优化等有明确可微分指标的领域；而需要人类判断"研究问题本身是否有价值"的探索性研究，尚不适合自动化。

**3. 复合创新的工程价值：非单点突破的胜利**

NanoGPT 77.5s 方案来自约 200 行改动，涵盖 FP8 attention、optimizer exploration noise、cautious embedding 等多方面组合。 NanoChat 最大收益来自 hashed bigram/trigram embedding， SOL-ExecBench 18% gap 缩小也是多项 kernel 优化的复合结果。 这印证了一个关键洞察：在成熟 benchmark 上，AI 进步越来越多地来自"已知要素的新组合"而非全新发现。自动化搜索系统的价值在于穷举人类难以遍历的组合空间，而非替代人类进行原创性发现。

**4. 三个杠杆的互补结构：算法 × 速度 × 硬件**

训练算法创新（NanoChat）、训练速度优化（NanoGPT）、硬件利用提升（SOL-ExecBench）形成互补的进步三角。 算法创新让模型学得更好，速度优化让训练运行更快，硬件利用让 GPU 更接近理论极限——三者相乘才是端到端 AI 进步的真实路径。这种结构揭示了 AI 进步的系统性：单一维度的优化存在上界，只有多杠杆协同才能实现持续突破。

**5. 小团队也能做前沿自动化研究**

Recursive 团队在三个 SOTA benchmark 上同时取得突破，且没有 DeepMind 级别的计算资源。这说明自动化研究系统降低了参与前沿 AI 研究的硬件门槛——关键在于系统设计（清晰的指标、低方差、抗 reward hack），而非算力资源本身。这为学术团队和小型组织开辟了一条以系统设计创新驱动 AI 进步的新路径。

## 实践启示

- **AI 进步已可被 AI 加速**：三个 SOTA 提升都不是"渐近修补"而是**数量级加速**（1.3× speedup、18% gap 缩小）。这与 [NanoGPT-Prime 递归自改进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-recursive-self-improvement-nanogpt-prime-intellect.md) 路线同向。
- **SOTA benchmark 的"可自动化研究性"成为评估标准**：清晰指标 + 低方差 + 抗 reward hack = 三大必要条件。设计新 benchmark 时应内建这些属性。
- **开源 artifacts 降低自动化研究门槛**：递归团队直接公开 [GitHub recursive-org/first-steps-toward-automated-ai-research](https://github.com/recursive-org/first-steps-toward-automated-ai-research)，为社区提供可复现的 baseline。
- **open-ended algorithms 从论文走向工程**：递归自改进 AI 不再是理论假设，而是被 SOTA benchmark 验证的工程现实。

## SUPP 2026-08-22：AI4AI-Bench — 评测 Agent 是否进入"算法层"

Einsia Navers Lab 的 AI4AI-Bench（arXiv:2608.20318）为"AI 能否设计更好的 AI 算法"（Recursive Self-Improvement）提供了首个系统化评测维度。它把本实体讨论的"自动化研究"从能力展示推进到**可验证的边界划分**：Agent 对训练代码的改动被分成两类——只改"训练怎么跑"（运行层：训练步数/学习率/batch/checkpoint/adapter 位置）vs 真正改"模型怎么学"（算法层：改 loss/加 supervision/换 update rule/改变训练算法本身）。

**关键实证**：在 10 个真实研究仓库、290 组实验（29 配置 × 10 任务）中，即使给 Agent 4 小时探索 + 明确"仓库自带方法是基线不是必须保留"，超过一半的有效提交仍停留在运行层——280 份提交里 141 份只改运行侧、122 份触及算法层；而进入算法层的提交明显更有效（平均 0.226 vs 0.126）。这为本实体"自动化研究闭环"的可行性提供了**边界证据**：系统能让 Agent 改跑通代码，但让它们稳定进入"改模型怎么学"的算法层仍是开放难题。

**reasoning effort 买到的是"进入算法研究的机会"**：最低→最高推理档，触及算法层的提交比例从 8% 升到 64%，中位评测次数 4→16、代码改动 18→246 行、输出 token 1.1万→10.9万；但最高档平均 0.196 距理论最优仍只走完约十分之一。这说明当前 Agent 已能偶尔做出真正的算法设计（如把 One-shot 剪枝改造成三阶段蒸馏训练、把权重平均改成可搜索优化问题、把纯 RL 改成先 imitation learning），但离"稳定做好算法研究"仍远——与本实体"复合创新价值"洞察互证。

## 引用与延伸阅读
- **原文存档** → [原文存档](https://www.recursive.com/articles/first-steps-toward-automated-ai-research)
- **GitHub**：https://github.com/recursive-org/first-steps-toward-automated-ai-research
- 关联 entity：[Alphaevolve Impact Deepmind](https://github.com/QianJinGuo/wiki-public/blob/main/entities/alphaevolve-impact-deepmind.md)、[Agent Self Improvement Six Mechanisms](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-self-improvement-six-mechanisms.md)、[Ai Recursive Self Improvement Nanogpt Prime Intellect](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-recursive-self-improvement-nanogpt-prime-intellect.md)、[Hermes Self Improving Loop Winty](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-self-improving-loop-winty.md)、[Deli Auto Research Skill V2 Continual Learning Self Improvement](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deli-auto-research-skill-v2-continual-learning-self-improvement.md)

---

