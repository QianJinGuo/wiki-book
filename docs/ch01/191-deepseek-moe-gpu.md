# DeepSeek MoE 并行策略与GPU通信优化

> 📊 Level ⭐⭐⭐ | 10.7KB

## 核心观点
从Dense切到MoE后MFU暴跌的原因不在于Expert切分维度小（实际≥1024），而在于**通信bound**。解决方法是设计合理的GPU并行策略，做好计算和通信的overlap。

## DeepSeek V3 并行策略
- **硬件**: 2048 H800，8卡节点NVLink(900GB/s)，跨节点IB(50GB/s)
- **策略**: `16-way PP × 64-way EP × ZeRO-1 DP`

## 并行策略对比
| 策略 | 切分内容 | 通信特点 |
|------|----------|----------|
| ZeRO-1 | 优化器状态 | 通信量同DP，省12倍显存 |
| TP | Tensor计算 | 通信量大，适合nvlink |
| PP | Layers | 通信量小，适合跨节点 |
| EP | Expert | 通信量极高，IB带宽瓶颈 |
| CP | seq激活 | Long context场景 |
**关键**: ZeRO-1是"近乎免费"的，把宝贵IB带宽留给EP。

## EP与DP的特殊关系
EP是唯一一个"在forward pass内部把token重新换主"的并行维度——all-to-all让token临时换GPU处理后再回来。

## PP气泡挤压演进
1. **GPipe**: 朴素方案，气泡大
2. **1F1B**: 增大M挤压气泡
3. **ZB1P**: 先算dx再算dw
4. **DualPipe**: 双向micro-batch，EP通信→计算遮掩
**实现**: H800 132SM中20SM跑PTX通信kernel（非NCCL）

## V4 Waved-EP
**问题**: DualPipe依赖大Batch，RL/推理场景无效
**方案**: 把Expert分wave组，wave间并行dispatch/计算/Combine
**TileLang**: 写得出Triton写不出的mega-kernel（dispatch+GEMM+combine融合）

## 深度分析

### 通信量算术：EP 与 TP/PP 不是同一种瓶颈

三种并行维度的通信量由不同量纲支配：TP 与 PP 由参数量和层数决定、与 batch 无关；梯度同步（DP / ZeRO-2/3）由参数字节数决定，每个 optimizer step 只发生一次，可被 micro-batch 摊薄；EP 的 all-to-all 则按 token 计费，每一个 MoE 层都要重做一遍——dispatch 按路由结果送出 token、combine 收回专家输出，字节数正比于 `token 数 × top-k × 隐层维度 × 精度字节`。EP 通信量随 batch×seq 线性上涨且无法摊薄，梯度通信则是固定开销；Dense 训练里通信几乎全属后者，切成 MoE 后前者才成为主项。这才是 MFU 暴跌的算术根源，而不是「专家切分维度太小」。

ZeRO-1 的「免费」也来自同一量纲差异：它在非 optimizer step 不产生通信，只切优化器状态就省下 12 倍显存。跨节点 IB 带宽因此可以整体让给按 token 计费的 EP——选它不是因为显存不够，而是因为它不跟 EP 抢带宽。

### EP 是从 DP 维度里切出来的：64 × 2 = 128 这条等式

配置里的数字值得拆开：2048 张卡除以 PP=16 得 128，这 128 又拆成 `EP=64 × DP_replica=2`。EP 不是一个可以独立增大的维度——它直接从 DP 维度里划走名额，EP 越大剩下的 replica 越少，由此产生两个非直觉的后果。

其一是专家梯度的同步半径被反向缩小：专家权重在 EP 组内切分，专家参数只需跨那 2 个 replica 同步；需要 128-way 参与的是被完整复制的稠密参数。EP 扩大反而让专家侧梯度通信更便宜，这正是 [DeepSeek V3 MoE 架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepseek-v3-moe-architecture.md) 中 `PP × EP × ZeRO-1 DP` 看上去「处处都不贵」的原因。

其二是数据并行的样本吞吐被压缩：replica 只有 2 个，维持同样的全局 batch 就得拉长每个 replica 内的 micro-batch 序列，而 micro-batch 数 M 正是 PP 气泡挤压赖以成立的稳态长度。EP、DP、PP 三个旋钮并不正交——动 EP 会顺着 DP 一路压到 PP 的气泡上，真正的主控旋钮是 EP 与 DP 的比例。

### 拓扑边界：跨出 NVLink 域就是 18 倍带宽悬崖

节点内 900GB/s 对跨节点 50GB/s，18:1 的比值决定了 EP 组宽的物理上限。EP=64 意味着 EP 组横跨 8 个节点，组内只有 1/8 的通信对落在 NVLink 域内，其余 token 路由全部压到 IB 上。更糟的是 all-to-all 接近 barrier：一次 dispatch 的完成时间由最慢链路决定，任一 rank 的拥塞或热点专家都会拖住整组。EP 跨出 NVLink 域的代价因此是台阶式跳变。

失败模式很具体：路由负载不均时，持有热点专家的卡既是计算瓶颈又是通信瓶颈，all-to-all 尾延迟直接叠加到下一层 GEMM 的启动时刻；IB 上只要一条链路降速或重传，整组 64 张卡的 dispatch 都在等它。退路只有两条——把 EP 组宽压在 NVLink 域内并接受切分度不足，或让调度层把这段跨节点等待藏起来。DualPipe 与 Waved-EP 是第二条路线的产物；推理侧的 [750B MoE PD 分离（EFA vs RoCE）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/750b-moe-pd-disaggregation-aws-efa-vs-roce.md) 撞上的是同一个悬崖。

### 从「遮掩通信」到「重构依赖」：气泡压缩史与 Waved-EP

PP 气泡演进的每一步都在回答同一个问题——谁负责把通信藏起来。GPipe 是朴素流水线，气泡大；1F1B 让激活更早释放以降低显存，于是可以用更大的 M 把气泡挤薄；ZB1P 拆开反向计算（先算 dx 再算 dw）用显存换计算，为计算与通信的重新排序腾出空间；DualPipe 才是结构性改动——双向 micro-batch，让同一时刻既有 forward 又有 backward 在飞，一个方向的通信掩盖另一个方向的计算。到此计算与通信已被焊进同一个调度，稳态长度 M 成为整个方案的前提。

从 132 个 SM 里划出 20 个专跑 PTX 级通信 kernel（绕开 NCCL）是这种耦合的极端体现：通信不再是一个被调用的库，而是被调度器直接编排、与计算共享同一份 SM 预算的资源——代价是约 15% 算力常驻通信路径，且排布对 M 极度敏感。

Waved-EP 换掉的是前提，而不是实现。RL 与推理没有 backward 可以遮掩、batch 又小，DualPipe 的稳态条件根本不成立；Waved-EP 把专家拆成 wave 组，让 wave 之间的 dispatch、计算、Combine 互相重叠——重叠关系从「跨 micro-batch」搬到「跨 wave」，对小 batch 同样成立。这就是它拿到 RL 1.96×、通用 1.50~1.73× 加速的机制：加速不来自更快的通信，而来自在新前提下重建出一条可重叠的关键路径。

### 内核能修效率，调度才能修关键路径

TileLang 的位置需要精确界定。Triton 的模型是带静态块结构的 tile program，而 dispatch+GEMM+combine 的 mega-kernel 需要数据相关的动态索引（token-expert 置换、变长分段边界、跨卡同步），这类控制流超出 Triton 的表达能力。它换来的是消除中间张量的显存往返与 kernel 启动开销，把带宽利用率推向接近峰值；[DeepSeek V4 Triton FP4 优化](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepseek-v4-triton-fp4-optimization.md) 的收益上限同样是「把既有链路用满」。

但内核有明确上界：它能提高链路利用率，却改变不了链路本身只有 50GB/s；它能消除启动与访存开销，却无法让一次必须发生的跨节点等待消失。等待暴露在关键路径上时，有效工具只有调度层重排（DualPipe 的错峰、Waved-EP 的 wave 重叠）；链路本身传得太慢时，内核融合与 PTX 级定制才真正兑现价值。混淆两者的典型症状是 kernel 越写越复杂而 wall-clock 几乎不动。

## 实践启示

**1. 先做通信量算术，再动 optimizer 和 batch** — 用 `token 数 × top-k × 隐层维度 × 精度字节 × MoE 层数` 估算每步 EP all-to-all 的字节数，再与参数字节数的梯度通信对比。若 all-to-all 是主导项，调学习率、调 M 只是在边角上修补。

**2. 把 EP/DP_replica 的比例当作主控旋钮** — `2048 / PP = EP × DP_replica` 是硬约束：EP 增大必然压缩 replica 数、抬高维持全局 batch 所需的 micro-batch 数，并回头影响 PP 气泡。只盯显存会得出错误结论。

**3. 让 ZeRO-1 专职「清空 IB 预算」** — 不用 ZeRO-2/3，梯度侧的跨节点通信就停在最低水平，IB 带宽可以整体让给 EP——整套配置里性价比最高的一项。

**4. 跨节点 EP 之前，先算有多少通信能留在 NVLink 域内** — 8 卡节点上 EP=64 意味着 7/8 的通信对要走 IB；能用「节点内 EP + 跨节点 DP/PP」达到的切分度就不必用跨节点 EP 去换，必须跨节点时先确认调度层藏得住这段等待。

**5. 按 batch regime 选重叠方案** — 预训练（大 M、有反向）用 DualPipe；RL 与推理（小 batch、无反向）用 Waved-EP，不要把依赖稳态流水的前提硬套到小 batch 场景。

**6. 训练端的选择会一路传导到推理服务** — 训练期的 EP 布局在推理期以专家并行形态复现，但 decode 阶段每个 rank 只有极少量 token，all-to-all 从带宽问题变成延迟问题，这正是 MoE 服务走向 PD 分离的动因（参见 [PD 分离推理](https://github.com/QianJinGuo/wiki-public/blob/main/entities/disaggregated-prefill-decode-llm-inference-sagemaker.md)）。wave 化、通信 kernel 化与 PD 分离在解同一个约束。

## 与现有知识的链接
- → [原文存档](https://mp.weixin.qq.com/s/zg0wHd170GPtpfiBjBZgTg)
- → [DeepSeek V4论文解读](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepseek-v4-training-58-page-paper-deep-dive.md) — 训练流程
- → [DeepSeek V4 Pro评测](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepseek-v4-pro-vs-claude.md) — 模型能力

---

