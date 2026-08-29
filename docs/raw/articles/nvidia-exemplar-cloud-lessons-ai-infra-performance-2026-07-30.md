---
source: newsletter
source_url: https://developer.nvidia.com/blog/nvidia-exemplar-cloud-lessons-for-unlocking-full-performance-on-ai-infrastructure/
ingested: 2026-07-31
source_published: 2026-07-30
sha256: 1bedead7c7102f60c78bb34c26616bbdd19ace3fd862e62c1351c74402cac2ab
---

# NVIDIA Exemplar Cloud: Lessons for Unlocking Full Performance on AI Infrastructure

> 来源：developer.nvidia.com/blog（Emily Potyraj, Pavan Sridhar, Sriharsha Niverty, Suryakant Patidar, Charlie Huang, 2026-07-30）

## 摘要

两台由相同 NVIDIA H100 / GB200 NVL72 / GB300 NVL72 系统构建的 AI 计算集群，训练吞吐可以差异很大。NVIDIA 例行观察到合作伙伴部署与 NVIDIA 参考架构（RA）在相同 workload、相同模型、相同 global batch size 下存在 **8%-12%** 的性能差距。^[raw/articles/nvidia-exemplar-cloud-lessons-ai-infra-performance-2026-07-30.md]

根因往往是 kernel / hypervisor / BIOS / NCCL 设置中一堆各自只占几个百分点的配置选择，累积成足以错过 Exemplar Cloud 验证 95% 阈值的差距。文章通过 4 个真实集群调试案例，每个诊断隔离堆栈中的不同层：Grace CPU 上的 SMMU 与页表行为、x86 CPU 上的电源管理与 NUMA 放置、1.6 Tbps 网络上的 NCCL queue-pair 并发、以及静默硬件安装缺陷。^[raw/articles/nvidia-exemplar-cloud-lessons-ai-infra-performance-2026-07-30.md]

## 正文

### 训练性能差距的常见模式

性能差距很少来自单一明显故障，更多来自只在 workload 压力下才显现的配置细节：^[raw/articles/nvidia-exemplar-cloud-lessons-ai-infra-performance-2026-07-30.md]

- **Grace 与虚拟化就绪度**：平台能力缺失、SMMU 开销、IOMMU 行为、页大小设置与预期配置不匹配
- **CPU 电源与进程放置**：core 低于期望 turbo 频率、rank/helper threads 放在错误 core、NUMA/PCT 绑定与平台拓扑不匹配
- **运行时拓扑**：host 拓扑文件或 NCCL 设置在节点上正确，但没进 workload container 或 launcher 环境
- **Fabric 与集合通信行为**：NCCL 设置与目标 fabric、消息大小、训练规模不匹配
- **应用-平台绑定**：训练进程按 core ID 或 rank 顺序绑定，而非 topology-aware affinity

### Case 1：GB200 NVL72 FP8 预训练，VM 比 bare metal 慢 12%

DeepSeek-V3 MoE FP8 预训练在 VM 内 iteration time 比 bare-metal RA 长 12%-14%（dense 模型如 Llama 3 70B 只有 3% 差距，MoE 因每 iteration 发出大量小 kernel 而成为 outlier）。^[raw/articles/nvidia-exemplar-cloud-lessons-ai-infra-performance-2026-07-30.md]

Nsight Systems trace 显示小 kernel 区域 CPU 开销显著升高；`perf record -a -g` 30 秒捕获显示 top frame：**24% 的 CPU 周期花在 `arm_smmu_cmdq_issue_cmdlist`**（向 Arm SMMU command queue 提交 invalidation 命令的函数）。虚拟化下每次 map/unmap 导致 guest invalidation trap 到 host，串行通过单一 command queue，产生 profile 中可见的 spinlock contention。^[raw/articles/nvidia-exemplar-cloud-lessons-ai-infra-performance-2026-07-30.md]

**修复**：在 host kernel 启用 CMDQV/VCMDQ（Command Queue Virtualization extension，允许 guest 直接向硬件发 SMMU invalidation 命令、无需 VM exits），需要带 tegra241-cmdqv driver 的 kernel 及对应 hypervisor 支持（近期 QEMU/libvirt 增加 cmdqv IOMMU attribute）。修复后 `arm_smmu_cmdq_issue_cmdlist` 跌出 top frames，dTLB miss 回到 bare-metal parity，MoE iteration 差距从 12% 收窄到 RA 容差内。^[raw/articles/nvidia-exemplar-cloud-lessons-ai-infra-performance-2026-07-30.md]

### Case 2：H100 集群因 CPU contention 与 NUMA misbinding 损失 12%

H100 SXM5 集群跑 Llama 3 70B 预训练比参考慢 12%（用户空间 + BIOS 层，非 kernel 层）。两个信号：^[raw/articles/nvidia-exemplar-cloud-lessons-ai-infra-performance-2026-07-30.md]

- **CPU 频率**：`turbostat -i 1` 显示 busy cores 固定在 3.0 GHz（SKU 标称 3.8 GHz turbo），idle cores 也在 3.0 GHz，C-states 停在 C1 而非降到 C6
- **NUMA-remote 流量**：`numastat -p <python_pid>` 显示约 18% 内存访问走 remote NUMA node

**根因**：BIOS 把 C-states 限制在 C1（常见的"低延迟"默认值，对 AI 训练反而是错的）。idle cores 停在 C1 持续消耗 package power，busy cores 无法争取足够 power budget 上 turbo；允许 idle cores 降到 C6 释放 power headroom，busy cores 升到 3.8 GHz，恢复约 4%。另外 hypervisor housekeeping threads 与训练进程的 data loader workers 被 pin 到相同物理 core（VM 内表现为 python threads 50-100ms 偶发 stall）。修复用 cpuset 分离：hypervisor/host services 放 cores 0-7 和 56-63，训练进程放其余。^[raw/articles/nvidia-exemplar-cloud-lessons-ai-infra-performance-2026-07-30.md]

**结果**：12% 差距缩到 3%，残差来自下一个 case 的 NCCL 调优问题。单一修复无法恢复全部差距——C-state 改动贡献最大约 4%，其余来自 NUMA binding 的进程隔离。^[raw/articles/nvidia-exemplar-cloud-lessons-ai-infra-performance-2026-07-30.md]

### Case 3：GB300 NVL72 + ConnectX-8 SuperNIC 未充分利用 1.6 Tbps fabric

GB300 NVL72 + ConnectX-8 SuperNICs（每节点 1.6 Tbps）在 Nemotron-4 15B 预训练上有 **31%** 性能差距。单节点吞吐健康，差距在 512 GPU 时出现，profiler 显示 exposed AllGather 和 ReduceScatter 时间——指向 ConnectX-8 fabric 的 collective 路径而非 compute。^[raw/articles/nvidia-exemplar-cloud-lessons-ai-infra-performance-2026-07-30.md]

用 nccl-tests 测试多项变量（iteration count、UCX/UCC 行为、NUMA mapping、NVLS、NCCL 版本）。关键调优改动：**`NCCL_IB_QPS_PER_CONNECTION` 从默认 1 提升到 4**。参考集群默认配置约 1.09s/iteration，QPS=4 后同 workload 提升到约 0.83s；profile 中 AllGather 从约 375ms 降到 262ms，ReduceScatter 从约 389ms 降到 273ms。^[raw/articles/nvidia-exemplar-cloud-lessons-ai-infra-performance-2026-07-30.md]

**教训**：不要到处提升 QPS。QPS 是 fabric 和 workload 依赖的——该设置在其他 fabric 或消息大小 profile 上可能增加 CPU 开销而无训练吞吐收益。正确做法是在 workload 真实消息大小下测 collective、在目标 fabric 上 sweep 设置、并在训练 workload 中验证。^[raw/articles/nvidia-exemplar-cloud-lessons-ai-infra-performance-2026-07-30.md]

### Case 4：从未进入容器的环境变量

虚拟化 B200 部署训练吞吐比参考低 13%-53%，即使 host 上 nccl-tests 显示预期性能。enroot workload container 内 AllGather 和 ReduceScatter 慢 2-4 倍。^[raw/articles/nvidia-exemplar-cloud-lessons-ai-infra-performance-2026-07-30.md]

**根因**：host (VM) 设了 `NCCL_TOPO_FILE=/etc/nccl/topo.xml` 且文件存在，但变量和文件都没传进 enroot container——NCCL 静默 fallback 到 auto-detection，导致 13%-53% 低于参考。**修复**：`--mount type=bind,source=/etc/nccl/topo.xml,target=/etc/nccl/topo.xml`。^[raw/articles/nvidia-exemplar-cloud-lessons-ai-infra-performance-2026-07-30.md]

**教训**：从即将跑 benchmark 的同一个 container/launcher/Slurm allocation 内部运行检查，而不是从 host。在 job container 内跑 `echo $NCCL_TOPO_FILE && cat $NCCL_TOPO_FILE` 是最快的 sanity check——路径不解析时 NCCL 静默失败、无错误，是最难诊断的差距之一。^[raw/articles/nvidia-exemplar-cloud-lessons-ai-infra-performance-2026-07-30.md]

### 大规模训练调试前的 Preflight 检查表

| 领域 | 检查什么 | 工具 |
|------|---------|------|
| GPU 与硬件健康 | 持续负载下 clock/power/thermal/NVLink 带宽一致性 | nvidia-smi, DCGM, dcgm-exporter |
| Grace 与 VM 就绪 | CMDQV 支持、guest page size、IOMMU passthrough、large page | perf, dmesg, kernel config |
| CPU 电源与放置 | busy-core turbo、cpuset 隔离、NUMA/PCT 绑定 | turbostat, lscpu, numactl, nvidia-smi topo -m |
| 运行时拓扑 | 容器内 topology 文件、NCCL 环境变量、HCA 可见性 | env, cat $NCCL_TOPO_FILE, NCCL_DEBUG=INFO |
| Fabric collectives | workload 消息大小下 AllGather/ReduceScatter | nccl-tests, workload traces |
| Workload 调优 | 仅在平台问题排除后的 pipeline parallelism/microbatch/通信重叠 | Nsight Systems |

^[raw/articles/nvidia-exemplar-cloud-lessons-ai-infra-performance-2026-07-30.md]

### 总结

性能差距是累积的：CPU 电源设置几个百分点 + NUMA/PCT binding 几个百分点 + 缺失 kernel 能力 + container-visible topology + fabric 配置。Preflight 诊断不保证 Exemplar Cloud 通过——某些问题只在验证 workload 本身、在确切模型/精度/拓扑/container/launcher/网络条件下出现。实际目标是尽早移除已知平台风险，再用训练 workload traces 调试只在规模下出现的差距。^[raw/articles/nvidia-exemplar-cloud-lessons-ai-infra-performance-2026-07-30.md]
