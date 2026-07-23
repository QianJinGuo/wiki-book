---
title: "MARLIN: Multi-Agent Reinforcement Learning for Incremental DAG Discovery — 因果图学习从离线重训走向在线增量更新"
source_url: "https://mp.weixin.qq.com/s/QdmT-WiWfvuVzmdVYU6smA"
source_author: "爱折腾研究组"
source_site: "微信公众平台"
ingested: "2026-07-23"
sha256: "d7bd455674d842aef9eb74745f10d716c3d7e52be6093564bf643ad204369936"
type: "raw-article"
status: "raw"
tags: [causal-discovery, dag-learning, reinforcement-learning, online-learning, root-cause-analysis, marlin]
---

> 一句话概述：MARLIN 把 DAG learning 从离线重训推向在线增量更新——用两个 RL agent 分别捕获 state-specific 与 state-invariant 因果关系，配合连续动作到 DAG 的单步映射和 decoupling reward，在 OnlineBoutique/SWaT/WADI 真实 RCA 数据集上验证。

**论文标题：** MARLIN: Multi-Agent Reinforcement Learning for Incremental DAG Discovery
**作者：** Dong Li, Zhengzhang Chen, Xujiang Zhao, Linlin Yu, Zhong Chen, Yi He, Haifeng Chen, Chen Zhao
**机构：** Baylor University, NEC Labs America, Augusta University, Southern Illinois University, The College of William and Mary
**发表：** AAAI 2026 / arXiv:2603.20295
**论文链接：** https://arxiv.org/abs/2603.20295

## 研究背景与动机

因果发现的目标是从观测数据中恢复变量之间的 DAG（有向无环图），描述"谁可能直接影响谁"。在故障定位、工业控制、经济系统、复杂服务监控中，DAG 是后续决策、干预和根因分析的基础。

难点在于 DAG 搜索空间增长极快，且必须满足 acyclicity 约束。传统方法分几类：constraint-based（条件独立性检验）、score-based（图空间搜索）、NOTEARS 类 continuous optimization、sampling-based。它们在大规模、非线性、实时场景中往往遇到效率或局部最优问题。

RL-based causal discovery 的吸引力在于把 DAG 搜索看成一个策略学习问题：agent 生成候选图，环境用 BIC 等 score function 给 reward，策略再朝高 reward 靠近。但已有 RL 方法多偏离线——面对新 batch 时需重新学习，或采用顺序决策难以并行。

真正的在线系统的关键特征：数据分布不是静止的。微服务系统故障、工业水处理系统遭遇攻击、传感器状态变化时，部分因果机制改变，但底层机制保持稳定。

## 核心方法

MARLIN 把在线 DAG learning 拆成两个层面：intra-batch（单个 batch 内快速生成合法 DAG）和 inter-batch/inter-state（多个 batch 和系统状态之间增量继承与更新）。

### 连续动作到 DAG 映射

DAG 邻接矩阵写成两个部分的 Hadamard product：全连接 DAG 方向结构 H × 二值 mask S。H 由实值向量 h 诱导（如果 hi > hj，则从 vi 指向 vj），天然形成一个拓扑顺序，避免显式处理环约束。动作向量 a 的前 d 维生成 H，剩余 d² 维通过阈值化生成 S。

RL policy 不需要一步步添加边，一次连续动作直接采样一个 DAG。奖励函数使用 BIC score：R(a, X) = -S(g(a), X)。

### 双 Agent 解耦

**State-specific RL agent**：负责当前系统状态中新出现的、状态相关的因果关系。把当前 batch 和上一 hidden state 输入 LSTM，得到当前 batch embedding；再结合上一 batch 的 DAG 构造成 attributed graph，用 GCN 编码。

**State-invariant RL agent**：负责跨系统状态保持稳定的因果关系。利用上一系统状态的数据表示和当前 batch 的表示，把历史稳定机制和当前观测一起编码。不会在新系统状态开始时重置，而是持续更新。

两个 agent 的动作融合：a_hat = β·a_specific + (1-β)·a_invariant（默认 β=0.5）。

### Decoupling Reward

鼓励 state-specific DAG 与过去的 state-invariant DAG 保持差异；同时鼓励 state-invariant DAG 与上一系统状态保持相似，但与上一 batch 的 state-specific 部分区分开。如果二者没有约束，模型可能把所有边都塞给一个 agent，增量学习退化成普通单 agent 学习。

### 提前停止与 factored action space

同一系统状态下相邻 batch 学到的 DAG 足够相似时停止当前状态学习，等待下一系统状态。相似度通过 Jensen-Shannon divergence 转换。

MARLIN-M 将动作空间拆成多个子空间并行探索（d 维拓扑方向 + d² 维边 mask），带来轻微精度损失但显著降低运行时间。

## 实验设置

**合成数据：** 从完整 Erdős-Rényi DAG 出发，随机删除边并注入 e% noisy edges，覆盖 Linear-Gaussian、linear exponential noise、quadratic regression、Gaussian process 等设置，DAG 规模 d={20,50,100}，transition noise rate e={0,1,5}。

**真实数据：**
- OnlineBoutique：10 个微服务的电商系统，18 个系统故障
- SWaT：工业水处理 testbed，51 个 sensors/actuators，含正常运行与攻击阶段
- WADI：水分配 testbed，123 个 sensors/actuators，16 天数据 + 15 个 fault cases

**对比方法：** PC、NOTEARS、GOLEM、DAG-GNN、RL-BIC、CORL、RCL-OG

**评价指标：** DAG learning → TPR、F1-score、AUROC、FDR、SHD、SID、ATB（平均每 batch 运行时间）；RCA → PR@K、AP@K、MRR、ATC（平均每故障 case 运行时间）

## 实验结果

### Linear-Gaussian 合成数据

MARLIN 在多数指标上持续优于 baseline，尤其在 FDR、SHD、SID 等反映错误边和结构距离的指标上更稳。CORL 在 d=100 时 TPR 可能更高但产生过密图（高召回低精度），对下游决策风险大。

### 非高斯与非线性数据

QR 设置下 MARLIN 达到 TPR 0.94、FDR 0.08、SHD 7.0、AUROC 0.96、SID 49.6、ATB 81；MARLIN-M 的 ATB 进一步降到 32（TPR 0.90、SHD 14.2）。

GP 设置下 MARLIN 达到 TPR 0.92、FDR 0.15、SHD 13.2、AUROC 0.95、SID 78.9、ATB 85；MARLIN-M 的 ATB 为 33。

### 真实 RCA 结果

OnlineBoutique：MARLIN 的 PR@1=61.1%、PR@3=94.4%、PR@5=100%、MRR=76.4%，ATC=63。RCL-OG 虽 PR@5 也能 100% 但 PR@1 仅 22.2%。MARLIN-M 的 ATC 降到 25，同时保持 PR@3=88.9%、PR@5=100%、MRR=67.6%。

SWaT 和 WADI 上 MARLIN 的 PR@K、MRR 整体最高，非 RL 方法难以处理噪声和非线性，传统 RL 方法效果更好但运行时间过长。

### 消融：多 Agent 解耦

MARLIN-S（单 agent）vs MARLIN：d=20 时 TPR 0.99 vs 0.96、SHD 5.24 vs 14.5；d=50 时 SHD 38.9 vs 82.1；d=100 时 SHD 105.5 vs 180.6。规模越大，多 agent 解耦优势越明显。

## 局限与未来方向

- 系统状态转移检测不是本文重点，change point detection 出错会影响后续 DAG 增量更新
- 真实数据缺少 ground-truth DAG（通过 RCA 间接验证）
- β 默认 0.5 固定，动态权重机制可探索
- MARLIN-M 并行化有精度代价，需根据实时性和结构质量取舍
- 未来方向：联合优化 change point detection 与 DAG learning、学习动态融合权重 β、引入不确定性估计、扩展到多模态运维数据
