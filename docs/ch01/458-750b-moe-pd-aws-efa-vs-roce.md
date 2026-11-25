# 750B MoE PD 分离推理：AWS EFA vs 自建 RoCE 通信架构实战对比

> 📊 Level ⭐⭐⭐⭐⭐ | 25.5KB

## 概述

AWS China Blog 2026-06-12 发布的工程实战案例：将 750B GLM-5.1-FP8（256 Expert, top-k=8）MoE 模型的 PD 分离推理（2 Prefill + 2 Decode 节点，每节点 8×H200 GPU）从客户自建 ConnectX+RoCE 集群迁移到 AWS P5en+EFA，**在相同模型/架构/负载下系统对比两种高性能网络的设计哲学与端到端性能差异**。

> **Background**：本文档基于 AWS China Blog 2026-06-12 实战案例建立。综合了 AWS HPC 团队对 EFA/SRD 协议的设计哲学论述、客户实际生产数据、SGLang/DeepEP/UCCL-EP/Mooncake 等开源通信库的协同工作机制，提炼出"PD 分离推理中 EFA 与 RoCE 各擅胜场"的工程结论。

**核心结论**：EFA 在 Decode 阶段高频跨节点小消息上 TPOT 高 ~31%（来自 CPU Proxy 中转的 per-message 开销），但在极端尾延迟上改善 73%（SRD 多路径 spray 设计）。

## 测试配置（2P2D 分离推理）

| 维度 | 配置 |
|------|------|
| 模型 | GLM-5.1-FP8（78 层、256 Expert、top-k=8、750B 参数） |
| 输入长度 | 120,000 tokens（长文本，KV Cache 传输压力最大） |
| 输出长度 | 1,000 tokens |
| 硬件 | 4× P5en.48xlarge（8×H200/节点 + 16×EFA/节点，双向 900 GB/s NVLink + 3,200 Gbps EFA） |
| 框架 | SGLang（UC Berkeley/LMSYS，原生支持 PD 分离） |
| KV Cache 传输 | Mooncake Transfer Engine（底层 libfabric → EFA RDMA） |
| MoE 通信 | DeepEP + UCCL-EP（EFA 传输后端） |
| 网络拓扑 | Cluster Placement Group + Capacity Block for ML（同 Layer ii 网络节点） |

## Prefill 与 Decode 的通信模式差异

理解 PD 分离推理的关键是认识到：**Prefill 与 Decode 在通信特征上截然相反**。

### Prefill：所有高频通信走 NVLink

- **Attention 层**：CP=8 切序列（按 token 切分），卡间 all-gather/reduce-scatter 沿序列维交换 K/V（NVLink，节点内 900 GB/s）
- **MoE 层**：EP=8 集中在节点内（每卡 32 Expert），All-to-All 完全不出节点
- **跨节点通信仅 1 次/PP chunk**：Stage 0 → Stage 1 传递中间激活值（约 200 MB BF16/chunk），频率低、延迟不敏感
- **结论**：EFA 在 Prefill 中只承担低频 PP send/recv，TTFT 仅差 9%

### Decode：唯一高频通信是跨节点 MoE All-to-All

- **Attention 层**：DP=16 + dp-attention，每卡持有完整权重，**完全无通信**
- **MoE 层**：EP=16 跨 2 节点（每卡 16 Expert），每 token 触发 75 层 × 2 次 = **150 次跨节点小消息通信**
- **每次消息数据量很小**（约 16 token hidden state），但延迟极度敏感
- **关键挑战**：单次 per-message 延迟会被 150 次累积放大

## 端到端性能对比（AWS EFA vs 客户自建 RoCE）

| 指标 | 客户 RoCE（ConnectX） | AWS P5en EFA | 差异 | 根因 |
|------|---------------------|---------------|------|------|
| **Mean TTFT** | 11,904 ms | 12,977 ms | EFA +9% | Prefill 计算密集、网络非瓶颈 |
| **Mean TPOT** | 13.80 ms | 18.05 ms | EFA +31% | 150 次 MoE 通信累积 ~28us/次 |
| **Mean ITL** | 42.75 ms | 54.92 ms | EFA +28% | 与 TPOT 一致 |
| **P99 ITL** | 56.20 ms | 66.98 ms | EFA +19% | 尾部差距收窄 |
| **Max ITL** | 434.30 ms | 116.99 ms | **EFA -73%** | SRD 多路径 spray 结构性优势 |
| **Mean E2E** | 25,686 ms | 31,006 ms | EFA +21% | TPOT 差距 × token 数累积 |

**解读**：对用户感知最关键的"最慢那个 token"改善 3.7 倍——在线服务 SLA 保障中，尾延迟稳定性往往比中位延迟更关键。

## 为什么 EFA 在 Mean 上慢 31%：UCCL-EP 的 CPU Proxy 架构

### DeepEP 在 IB 上的 IBGDA（InfiniBand GPUDirect Async）

```
GPU kernel warp → 写 NIC doorbell 寄存器 → NIC 立即 DMA → 网络传输
                  （零 CPU 参与，硬件闭环）
```

ConnectX 系列网卡向 GPU 暴露 doorbell 寄存器，GPU kernel 可直接触发 RDMA——全程不经过 CPU。

### UCCL-EP 在 EFA 上的 CPU Proxy 中转

EFA NIC（AWS 自研 Nitro 卡）**尚未向 GPU 暴露 doorbell**，IBGDA 无法直接使用。UC Berkeley/UC Davis 团队开发的 [UCCL-EP](https://github.com/uccl-project/uccl)（OSDI 2026, arXiv:2512.19849）通过 CPU Proxy 架构跨平台适配：

```
GPU kernel warp → 写指令到 FIFO（GPU 显存）
                          ↓
CPU Proxy 线程 busy-poll FIFO（通过 PCIe BAR 映射读取 GPU 显存）
                          ↓
解析指令 → 调用 libibverbs (ibv_post_send)
                          ↓
EFA NIC 通过 GPUDirect RDMA 直接从 GPU 显存 DMA → 网络传输
```

**数据路径不经过 CPU 内存**（NIC 直接 DMA GPU 显存），CPU 只负责转发控制指令。

### 延迟量化

| 步骤 | IBGDA (ConnectX) | UCCL-EP (EFA) | 差异 |
|------|------------------|---------------|------|
| GPU 发起 | 写 NIC doorbell (~ns) | 写 FIFO (~ns) | ≈0 |
| 指令到达 NIC | 立即（同一 PCIe 总线） | CPU poll FIFO → 解析 → 提交 | +3-10 us |
| 网络传输 | 交换机确定性转发 | SRD 多路径 spray | ≈相同 |
| 接收端处理 | NIC 硬件检查 → 写 CQE | CPU poll CQ → 重排序 → 通知 GPU | +3-10 us |
| **每次通信总计** | ~5-15 us | ~20-40 us | **~15-25 us** |

**反推验证**：TPOT 差距 4.25ms / 150 次 = **每次 ~28us**——与路径分析完全吻合。这是 CPU Proxy 中转的固定开销被高频小消息累积放大，**不是带宽瓶颈**。

## 为什么 EFA 的 Max ITL 低 73%：SRD 多路径 spray

EFA 的 SRD（Scalable Reliable Datagram）协议在协议层与 RoCE v2 有根本性差异：

| 特性 | RoCE v2 (ConnectX) | EFA/SRD |
|------|---------------------|----------|
| 消息顺序 | 有序（per-QP，需应用管理） | 无序（应用层实现有序） |
| 路由 | ECMP（依赖交换机支持，路径受限） | ECMP spray（一次选 64 条路径） |
| 拥塞控制 | ECN + DCQCN（依赖 PFC + ECN 交换机） | 动态速率估计 + 拥塞感知（无 PFC 依赖） |
| 是否需专用交换机 | 是（PFC + ECN 复杂配置） | 否（运行于 UDP/IP，普通以太网） |
| 部署复杂度 | 中高（MTU、流控、PFC 错误配置风险） | 低（无损、零配置依赖） |
| 核心权衡 | 单次极限低延迟，扩展性受限 | per-message 略慢，但大规模稳定性高 |

**SRD 的核心创新**：放弃 per-QP 有序交付，将每个数据包的包同时 spray 到多条路径（一次从数百上千条可用路径中选 64 条）。单条路径拥塞不阻塞其余包——AWS 实测 P99 尾延迟下降约 10 倍。

**对生产环境的意义**：RoCE 单路径遇到拥塞时无法绕行，产生 434ms 极端毛刺；EFA SRD 包分散到多条路径，天然负载均衡——这正是用户感知"最慢那个 token"改善 3.7 倍的根本原因。

## AWS 网络拓扑保障机制

要获得 PD 分离推理的优化拓扑，必须主动使用以下 AWS 原语：

| 原语 | 拓扑保证 | 适用场景 |
|------|----------|----------|
| **Cluster Placement Group (CPG)** | 同组实例共享 high-bisection bandwidth segment（同 Layer ii 网络节点） | 长期稳定需求 + 需要灵活扩缩容 |
| **Capacity Block for ML** | 自动放入 UltraCluster（low-latency, petabit-scale, non-blocking networking） | 短期 ML 任务，按天/周预约（最远 8 周后） |
| **On-Demand Capacity Reservation (ODCR)** | 用户主动指定 CPG + 高二分带宽网段 | 立即生效，持续占用直到取消 |

**验证**：本次 4× P5en.48xlarge（eu-south-2a）通过 Capacity Block 自动分配到同一 Layer ii 网络节点，跨节点通信仅 3 跳（实例→Layer iii→Layer ii→Layer iii→实例）。

**诊断 API**：`DescribeInstanceTopology` 返回每台实例的 NetworkNodes 列表——从底层（数组最后一个）开始向上比较，共享的最底层网络节点越深，物理距离越近。

## EKS 软件栈分层实践（内核态在 AMI，用户态在容器）

要在 EKS 上跑 MoE PD 分离推理，节点软件栈必须解决"让节点用上 GPU + EFA + 安全分配给容器"两件事：

| 层 | 核心职责 | 关键组件 |
|----|----------|----------|
| 容器层 | 封装应用软件栈，可独立于节点升级 | SGLang + NCCL/aws-ofi-nccl + UCCL-EP + nixl/Mooncake TE |
| 设备资源层 | 向 K8s 调度器注册非标准设备 | NVIDIA Device Plugin（gpu: 8）+ EFA Device Plugin（efa: 16） |
| AMI 层 | 让操作系统识别硬件 | NVIDIA Driver 580.x + nvidia-container-toolkit + EFA Driver (efa.ko) + libfabric + NVMe LVM |

**关键原则**：内核驱动（efa.ko、NVIDIA Driver）随宿主机（AMI 提供），用户态库（libfabric、aws-ofi-nccl、UCCL、CUDA runtime）随容器镜像走——**保证通信库与应用版本精确对齐、镜像可移植**。

## 通信软件栈协同（NCCL/Mooncake/UCCL-EP）

EFA 在用户态暴露两套接口，这些通信库分别走不同路径：

| 库 | 开发者 | 走 libfabric? | 走 libibverbs? | 定位 |
|----|--------|---------------|----------------|------|
| NCCL + aws-ofi-nccl | NVIDIA + AWS | 是 | — | GPU 集合通信标准 |
| DeepEP | DeepSeek | — | — | MoE Expert Parallelism 专用 |
| UCCL-EP | UC Berkeley / UC Davis | — | 是（直接 Verbs） | DeepEP 跨平台适配层 |
| Mooncake TE | 月之暗面（Kimi） | 是 | — | PD 分离的 KV Cache 跨节点传输 |
| NIXL | NVIDIA（Dynamo） | 是 | — | 单边 RDMA KV Cache 抽象 |
| libfabric | OFIWG | — | — | 跨厂商网络传输抽象 |

**为什么 UCCL-EP 直接走 Verbs？** 对延迟极度敏感、需要精细控制发送队列的场景（如 MoE 150 次小消息/token），绕开 libfabric 抽象层直接调 Verbs，可省去 ~3-5 us 开销。

## 三个独家贡献（不应合并到现有 entity）

1. **CPU Proxy 架构量化对比** — 首次以"~28us/次通信"为粒度量化 UCCL-EP vs IBGDA 的延迟差异，结合 TPOT 反推验证路径分析的准确性
2. **Max ITL 改善 73% 的根因** — SRD 多路径 spray vs RoCE 单路径 ECMP 的结构差异，附 AWS 原始 IEEE Micro 2020 论文引用
3. **2P2D 分离推理完整通信栈分层** — Attention/MoE/PP/KV Cache 五种通信模式的物理路径与库映射，从节点内 NVLink 到节点间 EFA 完整拆解

## 深度分析

### 一、切分决策是"因"：并行策略先于网络选型决定流量拓扑

本次验证最容易被误读之处，是把 31% 的 TPOT 差距直接归因于"EFA 比 RoCE 慢"。实际上流量拓扑首先由切分设计决定：750B MoE 混合部署代价远大于收益，且最关键的并非调度问题而是物理冲突——Prefill 要 Expert 集中在节点内（EP=8，走 NVLink），Decode 要 Expert 分散到跨节点 16 卡（EP=16），同一组 GPU 无法兼顾。 这个冲突决定了 Decode 每生成一个 token 要触发 75 层 × 2 次 = 150 次跨节点小消息，统计上约一半 Expert 在对端节点，单次 per-message 延迟因此被 150 次累积放大。

Prefill 侧的两个选择同样自洽：长上下文 Attention 走 CP=8 切序列而非切 head 的 TP——120K 输入下瓶颈在序列维，且 MLA 把 KV 压成共享 latent 后"按 head 切"省不了 KV； Decode 的 dp-attention 则用"每卡复制完整权重"换取层内零通信，代价是显存。 换言之，EFA 只在 Decode MoE All-to-All 这一条路径上承压，其余高频通信全部被切分设计锁定在 NVLink 内——网络对比的结论边界是由架构划定的。

### 二、~28us/次：CPU Proxy 是"控制面税"，不是带宽瓶颈

ConnectX 上 DeepEP 的 IBGDA 由 GPU kernel 直接写 NIC doorbell 寄存器，零 CPU 参与硬件闭环；EFA NIC 尚未向 GPU 暴露 doorbell，UCCL-EP 只能用 CPU Proxy 中转：GPU 写显存 FIFO → CPU busy-poll 解析 → 调 libibverbs 提交发送 → NIC 经 GPUDirect RDMA 直接 DMA GPU 显存。 注意数据面不过 CPU 内存，被拉长的是控制面：指令到达 NIC 与接收端处理各加 3-10us，单次合计 ~20-40us，对比 IBGDA 的 ~5-15us。 用实测反推：TPOT 差 4.25ms ÷ 150 次 ≈ 28us/次，与路径分析完全吻合——这是固定开销 × 高频的乘法效应，3,200 Gbps 带宽绰绰有余。 UCCL-EP 之所以绕开 libfabric 直接走底层 Verbs，正是为了在这条延迟命门上省去抽象层开销。

### 三、SRD 的收益长在尾部分布，不在平均值

三个延迟指标的方向性分裂是本次数据最有信息量的部分：Mean ITL EFA 高 28%、P99 高 19%、Max ITL 反而低 73%（434.30ms → 116.99ms）。 根因在协议层：RoCE per-QP 有序交付意味着一条链路拥塞就队头阻塞整个 QP，产生极端毛刺；SRD 放弃有序，把一块数据的包同时 spray 到 64 条路径，单路径拥塞不拖累其余包，AWS 实测 P99 尾延迟下降约 10 倍。 该设计出自 AWS 的 SRD 论文（IEEE Micro 2020）。 对在线服务而言，用户感知的是"最慢的那个 token"，尾延迟稳定性比中位延迟更关键。

### 四、两种网络哲学：为共享弹性云而生 vs 为专用集群而生

EFA 不追单包极限延迟，追大规模稳定性。AWS 自研的三条理由：云上"不能搞特殊连接的孤岛"，SRD 与普通 VPC 流量共享统一以太网 Fabric；用放弃有序换尾延迟；PFC 无损机制大规模下易拥塞扩散、InfiniBand 依赖统一 Subnet Manager，对"始终在线"的多租户云都是负担。 落到部署上是复杂度反转：RoCE 需要 PFC+ECN 专用交换机且错配风险高，SRD 跑标准 UDP/IP 以太网、零配置依赖。 结论不是谁更好，而是约束不同：专用固定拓扑集群选 IB/RoCE，共享弹性云选 SRD。

## 实践启示

1. **迁移评估按通信模式分桶，别看端到端单一指标。** TTFT 差 9%（Prefill 网络非瓶颈）、TPOT 差 31%（CPU Proxy per-message 开销）、Max ITL 好 73%（SRD 多路径）三向分裂，任何单一数字都会导向错误结论。
2. **切分设计先于硬件选型。** Expert 集中/分散的物理冲突决定跨节点流量总量；Decode 若能容忍节点内 EP，per-message 差距的大头自然消失。
3. **把 CPU Proxy 开销当临时成本建模，而非永久上限。** 这是折中方案而非 EFA 带宽/协议短板，随 EFA 软硬件与 GPU 间通信路径演进有望逐步收窄。
4. **拓扑要验证不要假设。** 用 DescribeInstanceTopology 从底层向上比较 NetworkNodes，共享 Layer ii 即 3 跳最短路径；申请量大、难以同时满足数量与 CPG 约束时，先拿容量再按拓扑数据分配对延迟敏感的工作负载。
5. **在线 SLA 把 P99/Max ITL 当一等指标。** SRD 多路径 spray 在共享拥塞环境天然免疫单点阻塞，"最慢 token"改善 3.7 倍直接转化为用户体验下限。
6. **软件栈分层可复用："内核态在 AMI、用户态在容器"。** efa.ko/NVIDIA 驱动随宿主机 AMI，libfabric/aws-ofi-nccl/UCCL 等用户态库随容器镜像走，保证通信库与应用版本精确对齐、镜像可移植。

**延伸阅读**：[DeepSeek MoE 并行策略](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepseek-moe-parallel-strategy.md) · SGLang · [MoE 混合专家](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/moe-mixture-of-experts-2025.md) · [vLLM Push-based KV Transfer](https://github.com/QianJinGuo/wiki-public/blob/main/entities/vllm-push-based-kv-transfer-disaggregated-inference-2026.md)
## 相关主题

- [AWS FSx Lustre GPUDirect 加载](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-fsx-lustre-gpudirect-sharded-llm-loading.md) — AWS 训练/推理数据加载栈
- AWS GRPO RLVR SageMaker — AWS 后训练栈
- [Foundation Model Building Blocks on AWS](https://github.com/QianJinGuo/wiki-public/blob/main/entities/building-blocks-for-foundation-model-training-and-inference-on-aws.md) — AWS 训练与推理基础组件
- Foundation Model Building Blocks — 通用基础组件
- [GLM-5 Scaling Pain](https://github.com/QianJinGuo/wiki-public/blob/main/entities/glm5-scaling-pain.md) — GLM 系列规模化的工程挑战

> [原文存档](https://aws.amazon.com/cn/blogs/china/750-b-moe-model-roce-cluster-migration-aws-efa/)

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/mlops-training-inference.md)

---

