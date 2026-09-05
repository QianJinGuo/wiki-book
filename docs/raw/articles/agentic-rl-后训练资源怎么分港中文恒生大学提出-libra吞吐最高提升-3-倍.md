---
source: rss
source_url: https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2651049903&idx=3&sn=385804c391d89b89271e15906eee7e9d
ingested: 2026-08-13
feed_name: WeChat-机器之心
source_published: 2026-08-12
sha256: e92602cee84fd7766b76ffdb3345c9f5c99e3c3121f01b84fa8fa81a05bb25d6
---

# Agentic RL 后训练资源怎么分？港中文、恒生大学提出 Libra，吞吐最高提升 3 倍

机器之心 2026-08-12 12:14 北京

一个面向 Agentic RL Post-Training 的资源管理系统。

大语言模型正在从 “回答问题” 走向 “完成任务”。在 Agentic RL 后训练中，模型不仅生成文本，还会调用搜索、代码执行等外部工具，根据环境返回继续推理。这样的交互让模型拥有更强的行动能力，也让训练系统面对一种比普通 RLHF 更不稳定的工作负载：同一批请求可能产生长度相差数十倍的轨迹，少量超长轨迹拖慢整个 rollout；与此同时，训练和 rollout 对 GPU 的需求还会随着策略演化不断变化。

针对上述问题，来自香港中文大学和香港恒生大学的研究团队提出了Libra，一个面向 Agentic RL Post-Training 的资源管理系统。Libra 不再把 rollout 视作固定瓶颈，而是将训练与 rollout 作为一个耦合系统统一优化，并通过异构推理集群、因果感知调度和弹性资源切换，让有限 GPU 资源随着实时工作负载动态流动。

在 48 张 NVIDIA A800 GPU 上，Libra 在 Search-R1、DAPO-Math-17K 和 R2E-Gym 三类任务中均取得最高吞吐，最高达到基线的 3.0 倍；在相近最终奖励下，达到目标奖励所需时间最多缩短至基线的 1/2.5。目前论文与代码均已公开。

  * 论文标题：Libra: Efficient Resource Management for Agentic RL Post-Training

  * 论文链接：<https://arxiv.org/abs/2606.03077>



  * 开源代码: <https://github.com/NetX-lab/Libra>




图 1：Libra 系统总览。系统由全局资源规划器、异构 rollout 集群、C-MLFQ 调度器和弹性执行机制组成。图片来源：论文。

Agentic RL 带来的不只是 “更长的输出”

一个标准 RL 后训练迭代通常包含轨迹生成、轨迹评估和策略更新。由于评估阶段相对轻量，系统效率主要取决于两个环节：rollout 能多快地产生轨迹，以及 training 能多快地吸收这些轨迹并更新策略。

在传统推理中，请求长度通常与输入提示具有较强相关性；但在 Agentic RL 中，轨迹长度会被运行时事件改变。例如，搜索工具可能返回大段内容，代码执行可能失败并触发多轮修复，模型也可能根据环境反馈扩展后续推理。因此，轨迹最终长度在生成前很难可靠预测。

研究团队在 R2E-Gym 上观察到，最长的 10% 轨迹占据了超过 50% 的 rollout 时间。更重要的是，这种分布并不稳定：随着策略在训练中逐渐改变，模型的工具使用方式和推理长度也会发生漂移。

这种漂移会放大 rollout 与 training 的结构性差异。实验显示，当序列长度从 1K 增长到 32K token 时，rollout 延迟增长了 95 倍，而训练时间仅增长 3.9 倍。原因在于 rollout 需要自回归解码，对序列长度和 KV cache 更敏感；训练则可以通过 batching 摊薄长度变化带来的影响。

图 2：（a）随着序列变长，rollout 延迟增长远快于训练；（b）训练过程中，平均序列长度和 rollout 时间持续漂移。图片来源：论文。

这意味着，一个在训练初期合理的静态 GPU 切分，可能在数百步之后变得严重失衡。如果 rollout 变慢，训练 GPU 会等待新数据；如果训练变慢，rollout 产生的轨迹又会在队列中积压。端到端迭代时间实际上由二者中更慢的一方决定：

T_iter = max (T_rollout, T_train)

因此，问题不能只靠 “继续优化 rollout” 解决，而需要从全局视角动态寻找训练与 rollout 的平衡点。

全局资源规划：同时决定训练和 rollout 怎么用 GPU

Libra 的第一项核心设计是 Global Resource Planner（全局资源规划器）。在固定 GPU 预算下，它联合搜索：

  * 多少 GPU 分配给训练，多少分配给 rollout；

  * 训练侧采用怎样的 TP、PP、DP，以及 MoE 模型的 EP 组合；

  * rollout 侧应当部署多少个 TP-1、TP-2、TP-4 或 TP-8 推理实例；

  * 当前配置的训练时间、rollout 时间和最终迭代 makespan。




训练侧使用拓扑感知的决策树枚举可行并行策略，并根据显存、通信开销和 pipeline bubble 等约束提前剪枝。rollout 侧则把请求按历史长度排序，用动态规划寻找异构 TP 实例和请求区间之间的最优分配。底层 Cost Evaluator 同时建模两侧的执行时间，让规划器能够比较不同全局配置。

规划并不是只在启动时运行一次。Libra 会周期性读取最新轨迹统计，重新求解资源配置；只有当预计收益超过重配置成本时，才真正触发资源移动。这样既能追踪 workload drift，也能避免频繁切换带来的抖动。

Elastic Hybrid Pool：不重建核心通信组，也能移动算力

“算出新配置” 并不等于 “能够低成本执行新配置”。传统分布式训练中，加入或移除训练 worker 往往意味着重建通信组并重新分发状态，频繁操作代价过高。

Libra 将资源划分为三个池：

  * Core Training Pool：保持固定的训练拓扑；

  * Core Rollout Pool：承担稳定的异构轨迹生成；

  * Elastic Hybrid Pool：根据瓶颈在 rollout 与 training 模式间切换。




其关键原则是保持核心训练拓扑不变。Hybrid worker 以完整的数据并行副本形式加入，不改变核心 TP/PP 结构。系统进一步把副本内部的 NCCL 通信与副本之间的梯度交换解耦，成员变化只发生在独立的跨副本通信域。

当 rollout worker 重新加入训练时，它会异步获取最新模型和优化器快照。恢复期间，核心训练仍然继续推进；加入中的 worker 通过侧通道发送零梯度占位，使核心 All-Reduce 与 “该 worker 尚未加入” 时在数学上保持等价。状态对齐后，它再从下一步开始贡献真实梯度。

不预测最终长度，而在工具返回时做因果路由

Libra 的第二项核心设计是 C-MLFQ（Causality-Driven Multi-Level Feedback Queue）。

传统长度预测方法试图在请求开始时猜测最终长度，但 Agentic RL 的关键变化往往发生在中途。Libra 的观察是：工具返回大小、成功或失败状态并非普通相关特征，而是后续轨迹扩展的直接因果信号。例如，大 payload 会立刻增加上下文，工具失败则可能触发重试、诊断和代码修改。

C-MLFQ 用历史轨迹建立一棵因果感知前缀树。树节点由 prompt ID 和此前所有工具返回状态的有序序列确定，并保存从当前节点到轨迹结束的剩余长度分布。运行时流程分为三步：

  1. 请求开始时先进入适合短序列的小 TP bucket；

  2. 每次工具返回后，根据工具类型、payload 大小和执行状态查询前缀树；

  3. 只有当剩余长度的均值与 P90 指向同一 bucket 时才迁移，否则继续留在当前 bucket；轨迹结束后再离线更新树。




图 3：C-MLFQ 在工具返回点读取因果状态并决定是否迁移请求，完成后再更新前缀树。图片来源：论文。

这种设计避免了额外模型推理，也不需要随着策略变化反复训练长度预测器。相比传统 MLFQ 等到长度越界后逐级迁移，C-MLFQ 可以在工具返回后更早做出一次性决策。

在 Search-R1 上，C-MLFQ 的单次路由准确率达到 91.1%，明显高于基于 embedding 的长度预测方法（65.2%）和传统 MLFQ（44.8%）；与此同时，其迁移 token 比例只有 8.2%，系统吞吐达到 2700 token/s。

48 张 A800 上的端到端结果

团队在 6 个节点、共 48 张 NVIDIA A800-SXM4-80GB GPU 上进行实验。节点内使用 NVLink/NVSwitch，节点间使用支持 GPUDirect RDMA 的 200 Gb/s RoCE 网络。实验采用 GRPO，最大模型长度为 40960 token，每个 prompt 采样 16 条轨迹。

工作负载覆盖三个差异明显的 Agentic RL 场景：

  * Search-R1：模型需要多轮生成搜索查询并利用外部知识；

  * R2E-Gym：软件工程 Agent 操作真实代码仓库并调用 Bash、Python 等工具；

  * DAPO-Math-17K：包含 17K 道竞赛级数学问题。




对比方法包括 verl-Colocated、verl-Static-Uniform、verl-Greedy-Heuristic，以及基于初始 workload 选出最优静态配置的 AReaL-Static-Optimal。

图 4：Libra 在 Search-R1、DAPO-Math-17K 和 R2E-Gym 上的吞吐及奖励收敛结果。红线为 Libra。图片来源：论文。

在 Search-R1 上，Libra 的平均吞吐约为 2700 token/s，相比 AReaL-Static-Optimal 提升约 63%，相比 verl-Greedy-Heuristic 提升 80%，相比 verl-Colocated 提升 300%。在 DAPO-Math-17K 和 R2E-Gym 上，Libra 同样保持最高吞吐。

由于各方法训练同一模型并执行相同步数，它们最终达到的奖励相近，区别主要是 wall-clock time。Libra 在 Search-R1、DAPO-Math-17K 和 R2E-Gym 上分别用 17.9、26.7 和 63.2 小时完成训练，达到目标奖励的速度最高提升 2.5 倍。

消融实验进一步说明了各模块的作用。在 R2E-Gym 上，Static-Uniform 基线吞吐为 423 token/s；加入同构资源规划后提高到 510 token/s，异构 TP 再带来 41 token/s，C-MLFQ 增加 115 token/s，最终弹性执行继续增加 97 token/s，使完整 Libra 达到 763 token/s，总体提升约 80.4%。

图 5：从静态均分逐步加入全局规划、异构 TP、C-MLFQ 和弹性执行后的吞吐变化。图片来源：论文。

系统实现与开源

Libra 包含约 1.3 万行 Python 和 C++/CUDA 代码，核心 RL 训练循环基于 verl，生成侧使用 vLLM，训练侧使用 Megatron-LM。开源仓库提供了 Slurm 与非 Slurm Quick Start、数据准备、配置参考、可观测性说明及实验脚本。

Libra 的核心观点是：在 Agentic RL 中，rollout 并不是永恒不变的系统瓶颈。随着策略和轨迹分布演化，真正的瓶颈会在训练与 rollout 之间移动。只有同时解决跨阶段资源分配、阶段内部异构执行以及低成本资源切换，系统才能在长期训练过程中持续接近最优状态。

作者简介

作者团队由陈凯文、谭昕、李敬宗和徐宏组成，来自香港中文大学与香港恒生大学，长期从事 AI 基础设施、机器学习系统、资源调度、大模型推理、分布式训练及计算机网络研究。第一作者陈凯文为香港中文大学博士生，团队成员成果发表于 SIGCOMM、ASPLOS、NSDI、ICML 等国际会议。

© THE END 

转载请联系本公众号获得授权

投稿或寻求报道：liyazhou@jiqizhixin.com

[跳转微信打开](<https://wechat2rss.xlab.app/link-proxy/?k=9ce10b88&r=1&u=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzA3MzI4MjgzMw%3D%3D%26mid%3D2651049903%26idx%3D3%26sn%3D385804c391d89b89271e15906eee7e9d>)
