---
title: "吞吐最高提升300港中文开源librarl训练提速25倍"
source_url: "https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247722207&idx=2&sn=d533f6b1d95c3d06e2072db8b3f0ed68"
source_published: 2026-08-14
ingested: 2026-08-15
feed_name: "WeChat-PaperWeekly"
sha256: 1e5f6e609778f79cea8e694c922af5c039f7ddac34f79201c593099f1b060e71
---

# 吞吐最高提升300%！港中文开源Libra，RL训练提速2.5倍

原创 让你更懂AI的 2026-08-14 18:10 北京

Libra 重构 Agentic RL 资源管理

论文题目：

Libra: Efficient Resource Management for Agentic RL Post-Training

论文作者：

Kaiwen Chen、Xin Tan、Jingzong Li、Hong Xu

作者单位：

香港中文大学、香港恒生大学

论文地址：

<https://arxiv.org/abs/2606.03077>

代码地址：

<https://github.com/NetX-lab/Libra>

当 RL 模型开始调用工具，系统假设也随之改变

大模型强化学习后训练的系统设计，长期围绕一个直觉展开：rollout 很慢，所以应该尽可能加速 rollout。

这个判断并非完全错误，但对 Agentic RL 来说还不够。Agent 在生成过程中会调用搜索、代码执行、文件系统等外部工具，并根据环境返回继续推理。

轨迹不再是从 prompt 到 answer 的单段生成，而是一条由“生成 - 工具调用 - 环境反馈 - 再生成”组成的在线交互链。

这带来两个互相耦合的问题。

第一个问题是 rollout 长尾。大部分轨迹可能很快结束，但少量轨迹会因为大型工具返回、执行失败或反复修复而迅速膨胀。团队在 R2E-Gym 上测得，最长的 10% 轨迹占据了超过 50% 的 rollout 时间。

第二个问题是 跨阶段失衡。rollout 是自回归、显存和带宽敏感的执行过程；training 更偏计算密集，并且可以借助 batching 摊薄序列长度差异。二者对序列长度的敏感度完全不同，而轨迹分布还会随着策略更新持续漂移。

Libra 的出发点正是：Agentic RL 的资源管理不能只优化某个 stage，而应当同时回答三个问题：

1\. 固定 GPU 预算应该如何在 training 与 rollout 之间分配？

2\. rollout 集群内部应该使用怎样的异构并行配置？

3\. 当瓶颈发生漂移时，怎样在不暂停核心训练的情况下移动 GPU？

为什么 prompt 无法决定 Agent 轨迹的长度

在普通语言模型推理中，我们可以尝试根据 prompt 特征预测输出长度。但在 Agentic RL 中，决定最终长度的很多信息在请求开始时还不存在。

以 R2E-Gym 为例，一个代码 Agent 可能调用测试命令：

  * 如果工具返回很短且执行成功，模型可能很快结束；

  * 如果返回大量日志，新增内容会直接进入上下文；

  * 如果执行失败，模型可能继续检查文件、修改代码并重复测试；

  * 多次失败还会形成级联效应，使轨迹接近最大长度。




论文给出的样例中，一个只有约 1K tool token 的轨迹最终不到 8K token；另一个包含 12.5K tool token 的轨迹扩展到 21K token；当工具连续失败时，轨迹可增长到 40K token 以上。

〓 图1：R2E-Gym 中工具调用次数、工具返回负载、失败状态与最终序列长度之间的关系。图片来源：论文。

这说明工具返回不是一个弱相关特征，而是改变后续轨迹的直接运行时信号。

也正因为如此，在 T=0 时预测最终长度具有天然局限：预测器既看不到未来工具结果，也会随着训练中的表示漂移逐渐失准。

工作负载的非平稳性让问题进一步复杂化。论文中的实验显示，训练过程中平均序列长度从约 2.5K 增长到约 11.5K token，rollout 逐渐从较快阶段变成系统瓶颈。

这里并不是说所有任务的长度都会增长——有些任务也可能收缩——而是说策略变化必然会改变轨迹分布，静态资源切分很难长期保持最优。

〓 图2：（a）序列从 1K 增长到 32K token 时，rollout 延迟增长 95 倍，训练时间增长 3.9 倍；（b）平均序列长度漂移使 rollout 与 training 的相对瓶颈发生变化。图片来源：论文。

一个重要观察：最合适的 TP 取决于序列长度

Tensor Parallelism（TP）并不是越大越好。

较小的 TP 通信开销低，在短序列上可以部署更多并行实例；较大的 TP 能把模型权重和 KV cache 分摊到更多 GPU 上，在长序列上更不容易受到显存压力限制。

在 8 张 A800、Qwen3-14B、batch size 512 的实验中：

  * 对 0K-2K token 的短序列，8 个 TP-1 实例达到 1852 token/s，而单个 TP-8 实例只有 591 token/s；

  * 对 16K-32K token 的长序列，TP-1 吞吐下降到 430 token/s，TP-8 仍能达到 1220 token/s，是 TP-1 的约 2.8 倍。




〓 图3：不同序列长度区间中，TP-1、TP-2、TP-4 和 TP-8 的吞吐与延迟表现。图片来源：论文。

因此，Libra 不使用统一 TP 配置，而是把 rollout 集群拆成多个 bucket：TP-1 处理短序列，TP-2/4/8 逐步承接更长、更重的请求。

问题随之变成：在不知道最终长度的情况下，怎样把请求放入正确的 bucket？

Libra 的整体设计：规划、调度与执行三层闭环

Libra 面向 disaggregated、asynchronous 的 Agentic RL pipeline。它把系统分成三个相互配合的层次：

  * Global Resource Planner 决定 training/rollout 的 GPU 数量和并行策略；

  * C-MLFQ Scheduler 根据工具返回信号，把请求路由到异构 rollout bucket；

  * Elastic Execution 把规划器的决定真正转化为 worker 的动态切换。




〓 图4：Libra 系统总览。左侧规划跨阶段资源和阶段内部配置，右侧通过 C-MLFQ 与 Elastic Hybrid Pool 执行决策。图片来源：论文。

三层设计围绕同一个目标展开。在异步 RL pipeline 中，端到端迭代时间近似为：

T_iter = max(T_rollout, T_train)

给 training 增加 GPU 会降低 T_train，却会挤压 rollout 资源；给 rollout 增加 GPU 也可能让 training 成为新瓶颈。

局部优化很容易把瓶颈从一侧推向另一侧，因此 Libra 直接最小化二者的最大值。

Global Resource Planner：把耦合搜索拆成两个可解子问题

全局搜索需要同时考虑 GPU 数量、训练并行策略和 rollout bucket 组成。直接枚举组合会迅速爆炸，Libra 采用分层规划。

5.1 训练侧：拓扑感知决策树

对 dense 模型，训练策略由 TP、PP、DP 组成；对 MoE 模型还需考虑 EP。Libra 从分配给训练的 GPU 数量出发，逐层扩展候选并行策略，并在搜索过程中剪掉不可行分支：

  * TP 主要限制在单节点 NVLink 域中的 1、2、4、8；

  * 显存占用或通信/计算比超出阈值时停止扩展；

  * MoE 的 EP 需要整除专家数量，并尽量把 All-to-All 留在节点内；

  * PP 的 pipeline bubble 超过阈值时剪枝；

  * 最终检查 DP 是否为合法整数。




这种方法把指数级候选空间缩小到几十种可评估配置。

5.2 Rollout 侧：动态规划构造异构 bucket

给定 n_rollout 张 GPU 和一组历史轨迹长度，Libra 需要决定部署多少个 TP-1/2/4/8 实例，以及每个实例负责哪段请求。

系统先按序列长度对请求排序，再定义状态  dp[g][i] ：使用 g 张 GPU 处理前 i 个请求时能够达到的最小 makespan。

每次加入一个 TP 实例和一段连续请求区间，用 Cost Evaluator 给出这段请求的预计执行时间，再选择最大完成时间最小的组合。

这个形式自然产生“短请求进入小 TP、长请求进入大 TP” 的异构划分。对相同 rollout GPU 预算，结果还会被 memoize，供全局外层搜索复用。

5.3 Cost Evaluator：为规划器提供统一代价接口

传统推理模拟器通常面向常规在线服务，训练模拟器则常假设 micro-batch 长度近似稳定。Agentic RL 的极端长度差异会破坏这些假设。

Libra 的 rollout 代价模型按算子物理特征拟合：线性算子采用 O(L) 形式，Attention 采用 O(L²) 形式；训练侧则显式模拟不同长度 micro-batch 在 pipeline 中的开始和结束时间，捕捉动态 micro-bubble。

验证结果显示，rollout 预测 MAPE 为 3.1%-5.9%，训练迭代时间预测 MAPE 为 2.4%-5.5%；在 100 个端到端配置估计中，平均 MAPE 为 6.35%，最大误差为 9.30%。

Elastic Hybrid Pool：让计划生效，但不打断核心训练

周期性重新规划只有在切换足够便宜时才有意义。为此，Libra 将 GPU 分为：

  * Core Training Pool；

  * Core Rollout Pool；

  * Elastic Hybrid Pool。




两个 Core Pool 提供稳定容量，Hybrid Pool 则根据瓶颈在 training 和 rollout 间切换。Libra 也可以临时从 Core Rollout Pool 借用 worker，把它变成 Hybrid worker，应对短期训练资源不足。

关键设计是：核心训练拓扑始终不变。Hybrid worker 只以完整、未切分的数据并行副本加入，因此不会重塑核心 TP/PP 组。

〓 图5：Hybrid worker 从 rollout 切回 training 时，以外部 DP replica 加入；核心训练进程组不被重建。图片来源：论文。

Libra 进一步把通信分成两个域：

  * replica 内部仍使用稳定的 NCCL collective；

  * replica 之间的梯度交换使用独立侧通道，成员变化只影响这一通信域。




当 Hybrid worker 从 rollout 恢复为 training 时，它异步拉取最新模型与优化器快照。

在状态恢复窗口，核心 worker 继续训练。加入中的 worker 先发送零梯度占位；由于核心 rank 将外部梯度累加到本地梯度，零占位不会改变本地值，核心 All-Reduce 与“新副本尚未加入”的情况保持数学等价。

状态对齐后，worker 从下一步开始发送真实梯度。

这种 non-blocking join 避免了为了新增一个训练副本而暂停整个集群。

C-MLFQ：用工具返回的因果状态做 late binding

C-MLFQ 的全称是 Causality-Driven Multi-Level Feedback Queue。它不在请求开始时猜测最终长度，而是在每个工具返回点重新获得信息后做 late binding。

系统从历史轨迹构建前缀树。每个节点的 key 包含：

prompt ID + 截至当前的工具返回状态序列

工具返回状态包括工具类型、payload 大小类别和成功/失败。每个节点保存从当前位置到轨迹结束的剩余长度分布，例如 mean 和 P90。

〓 图6：请求先进入最小 bucket；每次工具返回后查询前缀树，并在统计充分一致时迁移；轨迹完成后更新树。图片来源：论文。

C-MLFQ 的运行过程如下：

1\. Initial placement：所有请求先进入适合短上下文的小 TP bucket，避免一开始就浪费大 TP 实例；

2\. Per-tool-return routing：工具执行期间将 KV cache offload 到 CPU；工具返回后查询前缀树；

3\. Conservative migration：只有 mean 和 P90 落入相同 bucket 时才迁移；如果节点未见过，就回退到父节点统计；

4\. Offline update：轨迹完成后，沿工具状态序列回溯并更新节点的剩余长度统计。

与预测模型相比，前缀树查询几乎没有在线计算成本；与传统 MLFQ 相比，它不必等到当前长度越界后逐级晋升，而可以在工具返回时直接迁移到更合适的最终 bucket。

KV cache 迁移是否会抵消收益？

Libra 将迁移拆成三步：工具执行期间把 KV cache 放入 CPU pinned memory，在 CPU 上按 attention head 重新分片，工具返回后由目标 GPU 加载对应 shard。同节点迁移在 40K token 时仍低于 330 ms，跨节点迁移最高为 733 ms。

跨节点场景下，系统还会比较迁移和重新 prefill 的实际代价，选择较便宜的一种，而不是无条件搬运 KV cache。

实验：吞吐提高之后，奖励是否也能更快到达？

实验部署在 6 个节点、48 张 NVIDIA A800-SXM4-80GB GPU 上。节点内使用 NVLink/NVSwitch，节点间使用 200 Gb/s RoCE，并开启 GPUDirect RDMA。

训练采用 GRPO、最大 40960 token、每个 prompt 采样 16 条轨迹。

模型包括 Qwen3-14B 和 Qwen3-30B-A3B，工作负载包括：

  * Search-R1：多轮搜索与外部知识获取；

  * DAPO-Math-17K：竞赛级数学推理；

  * R2E-Gym：真实代码仓库中的软件工程 Agent。




基线覆盖 colocated、静态均分、人工 greedy heuristic，以及使用初始 workload 找到最佳静态切分的 AReaL-Static-Optimal。

〓 图7：三个工作负载上的吞吐和 reward-wall-clock 曲线。红线为 Libra，红点表示 Libra 完成训练的位置。图片来源：论文。

主要结果如下：

与 verl-Colocated 相比，Libra 在三项任务上的吞吐分别提高约 300%、196% 和 209%。

由于各方法运行相同训练步数并达到相近最终 reward，wall-clock 曲线表明，吞吐提升确实转化为更短的 time-to-reward，最高达到 2.5 倍加速。

C-MLFQ 路由质量

在相同异构 bucket 配置下，C-MLFQ 与四种策略的对比如下：

这里 MLFQ 的迁移比例超过 100%，是因为同一批 token 可能随着请求逐级晋升而被重复迁移。C-MLFQ 更接近 Oracle，同时避免了频繁搬运。

消融：四个模块分别贡献了什么

R2E-Gym 上的消融实验从 Static-Uniform 的 423 token/s 开始：

  * 同构 Planner 将吞吐提高到 510 token/s，约增加 20%；

  * 异构 TP 再增加 41 token/s；

  * C-MLFQ 增加 115 token/s，是最大的单项增益；

  * Static-to-Elastic 再增加 97 token/s；

  * 完整 Libra 达到 763 token/s，比基线提高约 80.4%。




〓 图8：逐步加入全局规划、异构 TP、C-MLFQ 和弹性执行后的吞吐变化。图片来源：论文。

开销实验也说明了为什么周期性重配置可行。Training 到 rollout 的主要成本是 10.8 秒 vLLM 激活；rollout 到 training 包括 3.6 秒后台快照和 4.4 秒 RDMA 状态恢复，梯度通道注册与状态对齐约为数十毫秒。

相对于 R2E-Gym 平均 454.16 秒的 step time，总转换开销低于 3.5%，而且只在规划器触发配置变化时发生。

在 128 张 GPU 上，使用 rollout memoization 后，Planner 搜索时间从 12.3 秒降到 1.9 秒。

〓 图9：（a）不同长度下的 KV cache 迁移与 recompute 延迟；（b）memoization 对 Planner 搜索时间的影响。图片来源：论文。

总结：Agentic RL 需要怎样的系统抽象

Libra 给出的答案可以概括为三点。

第一，rollout 不是固定瓶颈。端到端速度由 training 与 rollout 中更慢的一侧决定，资源管理必须跨阶段联合优化。

第二，Agent 轨迹中的工具返回是可利用的因果信号。与其在请求开始时预测全部未来，不如在信息真正出现时做 late binding，并把请求导向合适的异构执行环境。

第三，弹性不应等价于重建整个训练世界。只要核心拓扑保持稳定，并把动态成员限制在独立通信域中，资源切换就可以成为训练期间可频繁使用的机制。

Libra 约包含 1.3 万行 Python 和 C++/CUDA 代码，基于 verl、vLLM 和 Megatron-LM 实现。目前仓库提供 Slurm 与非 Slurm Quick Start、数据准备、配置参考、可观测性说明和实验脚本。

**作者简介**

Kaiwen Chen、Xin Tan 和 Hong Xu 来自香港中文大学，Jingzong Li 来自香港恒生大学。团队研究方向包括大模型系统、分布式训练与 Agentic RL 后训练。

**更多阅读**

[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721998&idx=1&sn=6289f73df09d8f0a83d4d10a63b161d0&scene=21#wechat_redirect>)

[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721796&idx=2&sn=4d87583404736dac37fbffb6158c09aa&chksm=96e5bcc4a19235d28ece7fbc98da4db2cb7f7a1302b2e2acd99b4e69ed1c15dfcf5d662fc801&cur_album_id=1557000490696146944&scene=21#wechat_redirect>)

[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247720341&idx=1&sn=e01b6d88ac1c9f688f188d5f21218e97&chksm=96e54215a192cb03d38aabf1a218abcbd528e7b0adf839f4957ed79a1086e06d4c8adabbaa44&cur_album_id=1557000490696146944&scene=21#wechat_redirect>)

**# 投 稿 通 道#**

**让你的文字被更多人看到**

如何才能让更多的优质内容以更短路径到达读者群体，缩短读者寻找优质内容的成本呢？**答案就是：你不认识的人。**

总有一些你不认识的人，知道你想知道的东西。PaperWeekly 或许可以成为一座桥梁，促使不同背景、不同方向的学者和学术灵感相互碰撞，迸发出更多的可能性。 

PaperWeekly 鼓励高校实验室或个人，在我们的平台上分享各类优质内容，可以是**最新论文解读** ，也可以是**学术热点剖析** 、**科研心得** 或**竞赛经验讲解** 等。我们的目的只有一个，让知识真正流动起来。

📝 **稿件基本要求：**

• 文章确系个人**原创作品** ，未曾在公开渠道发表，如为其他平台已发表或待发表的文章，请明确标注 

• 稿件建议以 **markdown** 格式撰写，文中配图以附件形式发送，要求图片清晰，无版权问题

• PaperWeekly 尊重原作者署名权，并将为每篇被采纳的原创首发稿件，提供**业内具有竞争力稿酬** ，具体依据文章阅读量和文章质量阶梯制结算

📬 **投稿通道：**

• 投稿邮箱：hr@paperweekly.site 

• 来稿请备注即时联系方式（微信），以便我们在稿件选用的第一时间联系作者

• 您也可以直接添加小编微信（**pwbot02** ）快速投稿，备注：姓名-投稿

**△长按添加PaperWeekly小编**

🔍

现在，在**「知乎」** 也能找到我们了

进入知乎首页搜索**「PaperWeekly」**

点击**「关注」** 订阅我们的专栏吧

·

[跳转微信打开](<https://wechat2rss.xlab.app/link-proxy/?k=e8e0cdf2&r=1&u=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzIwMTc4ODE0Mw%3D%3D%26mid%3D2247722207%26idx%3D2%26sn%3Dd533f6b1d95c3d06e2072db8b3f0ed68>)
