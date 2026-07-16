# APPO (Agentic Procedural Policy Optimization)：阿里高德 AMAP-ML 把 Agent RL 信用分配细化到每个决策点

## Ch04.666 APPO (Agentic Procedural Policy Optimization)：阿里高德 AMAP-ML 把 Agent RL 信用分配细化到每个决策点

> 📊 Level ⭐⭐⭐ | 16.6KB | `entities/appo-agentic-procedural-policy-optimization-amap-ml-2026.md`

# APPO：阿里高德 AMAP-ML 把 Agent RL 信用分配细化到每个决策点

> Paper: **APPO: Agentic Procedural Policy Optimization**
> Source: [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/appo-agentic-procedural-policy-optimization-amap-ml-2026-06-16.md)
> Paper Link: https://arxiv.org/abs/2606.12384
> GitHub: https://github.com/AMAP-ML/APPO
> Authors: 中科大 + 阿里高德 AMAP-ML 团队
> Interpreter: Hyman 的杂货铺 (微信公众号转载解读)
> Date: 2026-06-16

## 一句话总结

中科大与阿里高德联合提出 **APPO（Agentic Procedural Policy Optimization）**，用 **Branching Score** 把 Agent 强化学习的分支点从工具调用边界下沉到序列中的**细粒度决策点**，在 13 项基准上相对强基线平均提升近 4 分，**工具调用次数基本持平**。

## 痛点：奖励只给终点，中间决策谁负责？

LLM Agent 训练范式：
- **RLVR**（Reinforcement Learning with Verifiable Rewards）：用可验证的最终答案做稀疏奖励
- **GRPO / DAPO**：在此基础上不断迭代

**根本矛盾**：**整条轨迹只有一个 outcome reward，中间哪一步做对了、哪一步走偏了，算法很难说清楚**。

**现有 Agentic RL 的常见做法**（"在轨迹中间切开再采样"）：
- **ARPO**（同 AMAP-ML 团队）：在工具调用边界分支
- **Tree-GRPO**：按固定 workflow 阶段分支

**信用分配单位仍然偏粗**：要么把整段 thinking 压成一个块，要么只在 tool-call 之后的高熵 token 上重采样。

**论文 pilot study 关键发现**：
1. 真正影响最终成败的决策点，**并不集中在工具调用边界**，而是散布在整个 thinking 序列里
2. **token 熵高 ≠ 决策重要**——高熵可能只是罕见词（如月份名 "march"），与任务成败无关

## APPO 核心：把「过程」当作信用分配的基本单位

**APPO 主张**：把 branching 和 credit assignment 从**粗粒度的工具/工作流单元**，下沉到生成序列中的**细粒度决策点（decision points）**。

论文把围绕这些高影响决策点组织的推理模式称为 **procedure**——plan / reflect / verify 等单点技巧在 prompt engineering 里早已常见，但在**在线 Agentic RL 里如何系统性地利用它们**，此前探索不足。

**APPO 三步流程**：
1. **初始化**：给定输入 x 和全局 rollout 预算 N，先生成 n₀ 条完整轨迹作为树根
2. **采样分支**：对每条轨迹上的每个 token 计算 Branching Score，选出 top-κ 个位置重采样 continuation，扩展 rollout 树
3. **策略优化**：用双组 advantage + 未来感知 scaling 做 PPO 式更新

## Branching Score：熵 + 未来价值，过滤「假高熵」

**纯熵选分支是 ARPO 等方法的常见策略**。APPO 认为这不够——高熵 token 可能只是词汇层面的不确定性，而非会改变下游推理路径的关键决策。

**APPO 引入未来价值（Future Value）**，衡量当前 token 对后续 continuation 的策略诱导似然增益：
```
V(t) = E[KL(π_old || π_new) | continuation after t]
```

**Branching Score (BS) 把局部不确定性和未来影响结合起来**：
```
BS(t) = H(t) · V(t)
```

**乘积形式的意义**：**同时不确定、又对下游有影响的 token，才是真正的决策点**。

**词云对比**（论文图）：
- 纯高熵选出的 token 混有大量罕见名词（如月份名）
- BS 更偏向 "verify" / "sum" / "break" 等真正改变推理走向的词

## 过程级 Advantage：双组估计 + 未来感知缩放

**问题**：分支 rollout 和初始 rollout 来自不同策略分布，直接混在一起算 group-relative advantage 会引入偏差。

**APPO 对初始轨迹组 G_init 和分支组 G_branch 分别计算 advantage**：
```
A_init = R_init - mean(R_init)
A_branch = R_branch - mean(R_branch)
```

**APPO 增加未来感知 advantage A_fut**：
```
A = α · A_base + (1-α) · A_future
```

α 控制未来项权重。**优化目标沿用 PPO 的 clipped surrogate + KL 正则**。

**两个理论结果**：
- **Theorem 3.1**：BS 引导下向高方差决策点分配更多样本可降低梯度方差
- **Theorem 3.2**：策略改进下界，BS 引导的分支混合在理论上站得住脚

## 实验：13 项基准，三类任务全覆盖

**数据集分类**：
| 类别 | 基准 |
|---|---|
| **数学推理** | GSM8K / MATH / MATH500 / AIME24 / AIME25 |
| **知识密集型推理** | HotpotQA / 2WikiMultihopQA / Musique / Bamboogle / WebWalkerQA |
| **深度搜索** | GAIA / Humanity's Last Exam (HLE) / Xbench |

**基线覆盖**：
- **经典 RL**：GRPO / Reinforce++ / DAPO / GPPO / CISPO
- **Agentic RL**：GIGPO / ARPO
- **Backbone**：Llama3.1-8B / Qwen2.5-7B / Qwen3-8B/14B
- **搜索 Agent**：Search-o1 / WebThinker / ReAct

**实现**：基于 VeRL 框架，batch size 128，PPO mini-batch 16，搜索任务用 Bing 检索 top-10。

## 主结果：全面领先，深度搜索尤其亮眼

### 数学 + 知识推理（10 项基准）

| Backbone | 最强 Agentic 基线 | APPO | 相对提升 |
|---|---|---|---|
| Llama3.1-8B | ARPO 55.3 | 57.4 | **+7.9%** |
| Qwen2.5-7B | ARPO 58.3 | 62.2 | **+8.9%** |

**具体数据点**：
- **Llama3.1-8B**：AIME24 23.3→**30.0**；MATH500 64.6→**69.4**
- **Qwen2.5-7B**：AIME24 30.0→**36.7**；2Wiki 76.1→**81.5**

### 深度搜索（GAIA / WebWalkerQA / HLE / Xbench）

| 模型 | ARPO | APPO | GAIA | WebWalker |
|---|---|---|---|---|
| Qwen3-8B | 38.8 | **42.7** | 42.7 | 33.8 |
| Qwen3-14B | 43.7 | **46.6** | 46.6 | 43.4 |

**关键观察**：
- 闭源大模型 DeepSeek-R1-671B / o1-preview 在长链路任务上表现仍不理想
- **APPO 在 8B/14B 规模就刷新了同类方法的最佳成绩**

### Pass@K 分析

**APPO 不只提升最优单条轨迹——随 K 增大，优势持续扩大**：
- GAIA Qwen3-14B：Pass@1 43.7→46.1；Pass@5 61.2→**64.0**
- WebWalkerQA：Pass@5 62.0→**66.8**

**含义**：**APPO 探索到的是结构不同的推理策略，而不只是局部 token 变体**。

## 消融与训练动态

### 组件消融（Qwen2.5-7B，知识推理 5 项平均）

| 变体 | 平均分 | 差异 |
|---|---|---|
| **APPO 完整版** | **58.1** | - |
| BS → 纯熵 | 56.3 | -1.8 |
| 去掉 A_fut | 54.7 | **-3.4** |
| 去掉双组 advantage | 56.0 | -2.1 |

**三个组件互补**：
- **BS 决定"在哪探索"**
- **双组估计保证"公平比较"**
- **A_fut 做细粒度信用分配**（去掉掉分最多）

### 分支预算

总预算 N 时，**N_init = 8 时最优（58.1）**——先多样化根轨迹，再在高影响决策点展开。

### 训练曲线

**APPO 比 ARPO 更快达到更高 reward，且走势更平稳**。

**DBSCAN 聚类可视化**：APPO 的分支更紧凑、簇间分离更清晰——**多样性体现在推理策略层面，而非无序发散**。

## 与 ARPO 的本质差异

| 维度 | ARPO | APPO |
|---|---|---|
| **分支粒度** | tool-call 边界 + 后续高熵 token | **全序列细粒度决策点** |
| **选点准则** | token 熵 | **Branching Score (熵 × 未来价值)** |
| **信用分配** | action-level | **procedure-level + 未来感知 scaling** |
| **理论支撑** | 经验驱动 | **方差缩减 + 策略改进下界** |

**关键工程意义**：**APPO 不需要额外的工具调用开销**——实验显示 tool-call 次数与基线基本持平，但性能显著提升。

## 战略含义

> **APPO 的价值在于把 Agent RL 里一个长期被简化的假设拆开了：「过程」本身就是可学习的结构。**

过去大家把注意力放在 outcome reward 和 tool-call 边界上，相当于**只看了棋局的起手和终局，中间的布局、弃子、转换都被压成一个黑箱**。

**BS 提供了一个可操作的启发式**——不确定且对下游有影响的 token，往往对应 plan / verify / reflect 这类 procedure 的触发点。

### 三个值得关注的未来方向

1. **与 test-time scaling 的结合**：Pass@K 的持续增益暗示 APPO 训练出的策略在推理时做多样本投票可能更有优势
2. **更长 horizon 的 Agent 任务**：随着 Agent 任务步数继续增长，**细粒度 credit 的价值可能更大**
3. **BS 的可解释性**：**未来或许能把 procedure 类型显式标注，做更结构化的课程学习**

> **Agent RL 的竞争正在从「能不能调工具」转向「能不能学会在正确的地方试错」。APPO 给出的答案很具体：别只在工具边界分叉，去序列里找真正改变命运的决策点。**

## 相关实体
- [Agentic RL: Token-In Token-Out Done Right](ch04/619-agentic-rl-token-in-token-out-done-right.html)（相关：Token-In/Token-Out RL 训练框架，但 APPO 进一步细化到决策点）
- [港中文 SLIM：动态技能生命周期管理](ch04/540-agentic-rl.html)（相关：另一条 Agentic RL 主线——技能生命周期管理）
- [高德 Harness/SDD 体系](../ch05/101-ai-coding.html)（同公司高德不同主题：SDD 体系 vs Agentic RL）
- [Harness Engineering 综述](../ch05/052-harness-engineering.html)（相关：APPO 是 Agentic RL 的"过程工程化"）
- [Agent 编排范式](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-orchestration-patterns.md)（相关：过程级 credit 与编排的"阶段化"同源）

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/appo-agentic-procedural-policy-optimization-amap-ml-2026-06-16.md)
- [高德路线规划双路线：mobilitybench（agent 基准）+ transitlm（端到端 rllm）](../ch01/963-20.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/reinforcement-learning-rlhf.md)

---

