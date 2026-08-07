---
title: "SearchMaster: Grounded and Regulated Self-Play for Search Agents（论文原文）"
source_url: "https://arxiv.org/abs/2608.01822"
author: "Wentao Tan, Qiong Cao, Jiaqi Wang, Nan Duan"
publisher: "JD Future Academy, Beijing"
published: 2026-08-03
ingested: 2026-08-07
language: en
type: raw-article
sha256: "ad620363faa7f07cc39fd37f14c9c445e917b9f53935f7ea47ab30b1f114e7a3"
---

# SearchMaster: Grounded and Regulated Self-Play for Search Agents

> 论文原文（arXiv:2608.01822，用户提供 PDF，9 页全文）。JD Future Academy（京东未来研究院）。GitHub: https://github.com/WentaoTan/SearchMaster

## Abstract

Training LLM-based search agents requires high-quality search data: tasks that demand genuine multi-hop retrieval and trajectories that use search tools effectively. Existing pipelines often depend on human-written tasks, expert demonstrations, or stronger teacher models. We present SearchMaster, a self-play framework that trains a single LLM from search tasks it generates, solves, and verifies in a local search environment. The key challenge is that self-generated tasks and rollouts can yield misleading signals: pseudo multi-hop questions, success-rate difficulty estimates that ignore search depth, and rollouts with excessive opening but little targeted evidence acquisition. SearchMaster addresses these failure modes with three controls. An Evidence-Chain Generator (ECG) grounds task generation in explicit cross-document evidence chains to reduce pseudo multi-hop questions. A Search-Depth Reward (SDR) scores task difficulty by the search depth of successful rollouts rather than success rate alone, keeping retained tasks search-intensive. An Over-Opening Penalty (OOP) regulates tool use by discouraging excessive document opening, avoiding long but shallow browsing. Verified Proposer and Solver rollouts are then jointly optimized with GRPO. Across six deep-search benchmarks, SearchMaster improves a Qwen3.5-9B backbone from 38.19% to 51.52% average accuracy, with a 30.1-point gain on BrowseComp-Plus. These results show that grounded and regulated self-play can provide effective search-agent training data without human-labeled QA pairs or expert demonstrations. The code is available at https://github.com/WentaoTan/SearchMaster.

## 核心贡献（库内零覆盖）

搜索 Agent 自博弈训练，把「grounding（任务接地）+ regulating（行为调节）」显式化。自博弈循环的三个误导信号 + 三个控制（Figure 1）：

1. **Pseudo Multi-Hop 问题 → ECG（Evidence-Chain Generator）**：Proposer 在探索中逐步构建显式跨文档证据链（选实体→搜关联文档→识别新实体→延伸链条），再从完整链条出题，题目要求 full-chain necessity 且无单文档可答。抑制「浏览多文档但问题单文档可答」的伪多跳
2. **Success-rate 难度估计失真 → SDR（Search-Depth Reward）**：任务难度不按成功率估计，而按成功 rollout 的搜索深度 hmin（Eq 3，最浅成功解深度）打分——任何成功 rollout 能浅搜解决即视为存在 shortcut，不给高难度分。Hsdr=10 处饱和（Eq 4）
3. **Over-Opening 漂移 → OOP（Over-Opening Penalty）**：惩罚 open/search 比率（Eq 7，αoop=1.5 起罚、βoop=2.5 满罚、λoop=0.5 系数），不是惩罚 open 绝对次数——压制冗余打开（实测 56.3% 的额外 open 是重开已见文档）而不压制合法的多文档探索

## 形式化定义（Eq 1-10）

- **Eq 1**：Proposer 采样 KP 条任务生成 rollout：(τP_j, c_j, q_j, y⋆_j) ∼ πθ(· | Pprop, d)，c_j = e_j,1 → e_j,2 → ··· → e_j,nj 证据链
- **Eq 2**：Solver 采样 KS 条答案 rollout：(τS_i, ŷ_i) ∼ πθ(· | Psolve, q_j)
- **四道质量过滤器**：Tool-use（搜索/打开太少=浅）、Format（c_j 至少 2 条证据）、Validity（Verifier 判断 q_j 有效、y⋆_j 被 τP 支持、链条逻辑自洽）、Parametric-knowledge（Verifier 无工具也能答则移除）
- **Eq 3**：hmin = min_{i:z_i=1} h_i —— 最浅成功搜索深度
- **Eq 4**：rsdr = r0 + (1−r0)·min(hmin/Hsdr, 1)，Hsdr=10 饱和
- **Eq 5（Proposer 基奖励）**：−0.5 工具使用不足 / 0 任务格式不全 / 0.1 无效或免工具可答 / r0=0.2 当 C∈{0,KS}（太难或太易）/ rsdr 其余
- **Eq 6（Solver 基奖励）**：−0.5 无工具调用 / 0 格式无效 / z_i 其余
- **Eq 7**：ρoop = clip((nopen/nsearch − αoop)/(βoop − αoop), 0, 1)
- **Eq 8-9**：最终奖励 r = b − λoop·ρoop（仅当 b 为 rsdr 或 z_i 时扣除）
- **Eq 10**：GRPO 更新——token 级 clipped objective + KL regularizer，工具观测保留在上下文但 mask 出 loss。种子级 gate：K_P 条任务最高奖励 ≤ r0 则整种子丢弃

## 关键设计决策

- **共享策略双角色**：同一 πθ 同时充当 Proposer 与 Solver；Verifier 是初始模型的冻结副本。一条种子 → 最多 K_P×K_S 条 Solver rollout，为避免 Solver 样本主导更新，只保留最高奖励通过任务的 K_S 条 Solver rollout（每保留种子贡献 K_P + K_S 训练样本）
- **SDR 用最浅成功深度而非均值/最大**：hmin 反映最容易的成功解，避免任务因单条深搜成功被误判为高难度
- **OOP 用比率而非绝对次数**：抑制冗余打开但保留合法多文档探索
- **种子级门控**：任务集整体质量 gate，高难度+可解决双重标准
- **训练配置**：Qwen3.5-9B + GRPO（lr 1e-6，clip (0.2, 0.28)，βKL=0.001），OpenResearcher 离线语料（约 15M 文档/11B token）+ Qwen3-Embedding-8B FAISS 检索器，每迭代 64 种子 × (K_P=8 + K_S=8) = 1024 样本，20 迭代共 1280 种子，256K 上下文，温度 1.0，上限 200 工具调用/rollout

## 实验数据（Table 1-3）

**Table 1 主结果**（六基准 accuracy%）：

| 方法 | BrowseComp-Plus | BrowseComp | GAIA | SEAL-0 | WebWalkerQA | XBench | Avg. |
|------|----------------|-----------|------|--------|------------|--------|------|
| OpenAI o3 | 63.49 | 49.70 | 70.50 | 15.30 | 71.70 | 67.00 | – |
| GPT-5-high | 70.12 | 54.90 | 76.40 | 43.20 | – | 77.80 | – |
| gpt-oss-120B-high | 42.89 | – | – | – | – | – | – |
| OpenResearcher-30B | 54.80 | 26.30 | 64.10 | – | – | 65.00 | – |
| Qwen3.5-9B backbone | 30.12 | 20.93 | 50.49 | 26.13 | 41.47 | 60.00 | 38.19 |
| **SearchMaster** | **60.24** | **28.75** | **57.28** | **35.14** | **59.71** | **68.00** | **51.52** |

- BrowseComp-Plus：9B 模型超 gpt-oss-120B-high (42.89)、GPT-4.1 (35.42)、Claude Opus 4 (36.14)，逼近 o3 (63.49)
- 在线转移：纯离线训练却全部 5 个在线基准提升（+6.8 GAIA 到 +18.2 WebWalkerQA）——离线到在线搜索行为泛化

**Table 2 消融**（BrowseComp-Plus）：naive self-play 45.18 → +ECG 53.25 → +SDR 52.89 → +ECG+SDR 57.71 → 全量 60.24（单调提升，三机制互补：链条任务构建/搜索深度选择/工具使用正则）

**Table 3 任务质量**（GLM-5 判定 1000 种子 × 10 任务）：naive 的 True Multi-Hop 24.2%/Pseudo 47.1%/Invalid 28.7% → +ECG 45.6%/38.6%/15.8% → 训练后 78.6%/15.0%/6.4%

**行为验证**：
- Figure 3：SDR 保持任务 hmin 在 8-10 区间（naive 成功率信号下随 Solver 变强衰减到 2-3）
- Figure 4：OOP 保持 open/search 比率低位；无 OOP 时双角色持续漂移。56.3% 的额外 open 是重开已见文档

## 局限声明

- 训练仍需可搜索环境、每任务多条 Solver rollout、Verifier 调用（grounding/parametric filtering/correctness）——减少标注依赖但未消除全部成本
- 当前在本地搜索环境运行，可复现性好但可能限制开放网络全多样性/波动性覆盖
- 未来：扩展到更动态多样化 web 环境，降低自博弈 rollout 与验证成本

## Related Work 对照

- **Search Self-Play (Lu et al. 2025a)**：从预定义答案集采样目标答案，Proposer 搜索证据出题——任务生成被预定义答案约束
- **Dr. Zero (Yue et al. 2026)**：Proposer 通过外部搜索直接出题，用 Solver 成功率奖励任务难度——成功率是粗信号，不反映是否需非平凡搜索
- **Search-R1 / R1-Searcher / R-Search / StepSearch / AutoRefine / AutoSearch**：RL 优化搜索行为/过程级奖励，但依赖既有 QA 任务
- **OpenResearcher / WebSailor**：教师模型/结构化采样造数据——依赖人工标注或专家模型
- SearchMaster 与 Skill-SP（arXiv:2607.22529）/SESA（arXiv:2607.29468）同属 self-play 家族但机制不同：Skill-SP/SESA 用 skill 库记忆进化（Skill Card/Bank），SearchMaster 用 ECG/SDR/OOP 三控制做任务接地与行为调节
