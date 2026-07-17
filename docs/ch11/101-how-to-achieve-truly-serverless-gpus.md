# How to achieve truly serverless GPUs

## Ch11.101 How to achieve truly serverless GPUs

> 📊 Level ⭐⭐ | 9.7KB | `entities/modal-truly-serverless-gpus.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/modal-truly-serverless-gpus.md)

## 深度分析
**GPU Allocation Utilization 是推理工作负载中最容易被忽视的效率维度，但它往往比 MFU 更直接地决定实际成本。** 文章提出了一个三级利用率的框架：Model FLOP/s Utilization（最严格，衡量算法算力利用效率）→ nvidia-smi "GPU utilization"（kernel 在 GPU 上运行的时间比例）→ GPU Allocation Utilization（付费 GPU 秒数中实际运行应用程序代码的比例）。第三个指标是大多数公司在推理场景下实际亏损最大的盲区：在非峰值时段，多数组织的 GPU Allocation Utilization 仅 10-20%，意味着 80-90% 的 GPU 费用在为空闲容量付费。 这个指标与 MFU 并不矛盾——MFU 衡量给定 GPU 的计算效率，Allocation Utilization 衡量 GPU 是否被有效分配给工作负载；即使 MFU 高达 90%，如果 GPU 在 70% 的时间内等待请求，Allocation Utilization 仍然只有 30%。
**Serverless GPU 的核心挑战不是"如何运行 GPU"，而是"如何在秒级响应时间内完成 GPU 初始化"。** 传统云厂商分配新 GPU instance 的流程包含四个阶段：instance 启动 + 健康检查（分钟级）→ 加载应用程序和文件系统状态（分钟级）→ 主机侧应用准备（十秒级）→ 设备侧（GPU）初始化（分钟级到十秒级）。这个链条加起来通常需要"数十 kiloseconds"（即数千秒），根本不可能在秒级响应的 serverless 场景下使用。 Modal 通过四层优化（cloud buffers、custom filesystem、CPU checkpoint/restore、GPU CUDA checkpoint/restore）将这 2000s+ 的冷启动压缩到约 50s，实现 40× 加速。
**Cloud buffers（GPU 预热缓冲池）将 instance 分配从 hot path 移至异步背景任务，本质上是用冗余容量换响应时间。** Modal 在用户请求到达之前就在一个独立管理的 buffer 中维护少量健康、闲置的 GPU 实例，新请求优先调度到 buffer 中的实例而非触发新的 instance 分配。这个决策背后的权衡是：buffer 限制了 Allocation Utilization 的上限（永远到不了 100%），但 Modal 认为这是一个合理代价——100% utilization 本身是一个危险的幻觉，拥有缓冲容量才能应对意外的流量尖峰和硬件故障。 从宏观经济学角度看，这类似于零售业的库存缓冲：用持有成本换缺货风险。
**Lazy-loading + content-addressed cache 的组合设计是 container 启动优化的关键突破。** 传统 docker 镜像加载需要按顺序应用每一层，且必须完整传输整个 root filesystem（可能数 GB），即使大多数文件永远不会被应用程序读取。Modal 的 ImageFS 做了两件事：其一，metadata（索引文件）只有几 MB，可以先于内容加载并在 100ms 以内完成，使 container 可以在内容完全加载前就开始执行；其二，通过 content-addressed cache（而非 Docker 的 path-based 或 layer-based cache）实现跨容器去重——Python、PyTorch、CUDA stack 等公共依赖在不同容器间可以共享同一份物理数据。 Tiered cache（page cache → local SSD → AZ cache server → regional CDN → blob storage）则确保热数据从最快层读取，冷数据按需从上层向下渗透。
**gVisor (runsc) 的 checkpoint/restore 实现比 CRIU 更适合 serverless 场景，因为它是天然的状态机。** CRIU 是 Linux 内核级别的 checkpoint/restore 工具，设计用于透明迁移运行中的进程；而 gVisor runsc 在用户空间模拟 Linux kernel，其并发模型基于协程（Go 风格的 async/await），每次 await 都会触发 preempt 和 resume。这意味着 gVisor 容器天然地将执行状态序列化为 checkpoint 非常自然，无需依赖内核级 criu 功能。 同时，gVisor 的受限攻击面（emulated kernel 而非真实内核）提供了额外的安全隔离——Modal 明确提到这使他们的系统天然免疫某些内核漏洞（如 CVE-2026-31431 "CopyFail"）。
**GPU memory snapshotting 是将 LLM inference 冷启动从数分钟压缩到数十秒的决定性技术，但它有重要的工程前提条件。** NVIDIA 驱动支持将 GPU device memory 中的 CUDA context 状态序列化到 host memory，然后通过 host-side checkpoint 文件系统（ImageFS）传输，在目标机器恢复时由驱动将 device state 写回 GPU。 关键前提：vLLM/SGLang 的 GPU snapshotting 最佳实践是 checkpoint 前先将权重卸载（offload）到 host，KV cache 重新创建而非恢复（重建比恢复更快）；多 GPU 程序因为 NCCL 的集合通信设计而 snapshotting 复杂（一个 GPU 静默会导致整个 group deadlock）。在满足这些前提后，vLLM 的平均冷启动从 95,679ms 降至 13,797ms（7×），SGLang 从 83,713ms 降至 17,486ms（4.8×）。
**Serverless GPU 的真正价值在于改变了推理经济的规模边界：使 kilo-GPU 级别的弹性扩缩成为可能。** Reducto 的案例极具说明性：处理大型企业 Notion 文档库这类 deadline-driven job 需要在数十分钟内横向扩展到数百甚至上千 GPU，在传统模式下这要求提前预留 kilo-GPU 容量（大多数时间闲置）或接受超时失败；Modal 的 serverless GPU 将冷启动降至 ~12s，使这种级别的弹性扩缩在经济上变得可行。 这个能力本质上改变了推理工作负载的 cost curve：peak demand 的成本不再需要由 average demand 时的预留容量来分摊。

## 实践启示
**1. 在评估 serverless GPU 平台时，将 cold-start latency 作为核心指标而非次要指标。** 许多平台宣传"有 GPU 可用"但忽略了从请求到就绪的实际时间。如果你的工作负载有秒级响应要求（对话式 AI、实时推理），2 分钟的冷启动会使 serverless 架构完全不可用。Modal 实测的 ~50s 冷启动（vLLM）和 12s（Reducto's GPU snapshot case）是当前行业的前沿水平。
**2. 如果你运营一个高可变性的推理服务（spiky traffic、daily seasonality），应该同时追踪 Allocation Utilization 和 MFU，前者反映资源浪费程度，后者反映 GPU 计算效率。** Allocation Utilization 低（<30%）意味着你为大量未使用的 GPU 容量付费；MFU 低意味着即使 GPU 在跑任务，计算资源也没有被有效利用。改善路径：先通过 serverless 化或 auto-scaling 改善 Allocation Utilization，再通过 kernel 优化、tensor parallelism 改善 MFU。
**3. 对于多租户或多样本推理场景，评估平台是否支持 container 层的 content-addressed cache。** 跨容器共享 Python/PyTorch/CUDA 依赖可以从根本上减少 container 启动时的 I/O 开销。如果没有这一层，container 启动时间的改善会被 I/O 瓶颈重新抵消。
**4. 如果你的推理服务使用 vLLM 或 SGLang，实施 GPU memory snapshotting 并配置权重 offload + KV cache 重建。** 这是 Modal 实测 4-7× 冷启动加速的关键工程手段。权重 offload 使 checkpoint 文件更小（GPU HBM → host DRAM），KV cache 重建比恢复更快（empty KV cache 初始化 vs. 从 snapshot 读取巨型 cache 数据）。
**5. 在容量规划中，不要将 100% GPU Allocation Utilization 作为目标——这往往是故障的前兆。** Modal 指出 100% utilization 的系统没有任何容错边际：任何 GPU 故障、任何流量尖峰都会直接转化为 service degradation。建议在 buffer 中维护约 10-20% 的空闲容量作为"运营缓冲"，这在工程上是与维护额外牙刷或手机充电器相同的风险管理逻辑。
**6. 对于 agentic 或 development 工作负载（而非纯 production serving），serverless GPU 的价值在于消除"开发/生产环境差距"。** Modal 的 buffer_container 功能允许用户维护预热的开发环境，开发者可以获得 prod-equivalent 的 GPU 环境而无需自己管理基础设施。这对于需要频繁创建/销毁 GPU 容器的 AI 开发者工作流有显著的开发效率提升。
**7. 在跨云或跨可用区部署时，权重加载带宽是关键瓶颈（而不是 GPU 计算速度）。** Modal 指出在跨 AZ 或跨区域场景下，RDMA weight server 可以提供 >3× 带宽提升（相比对象存储），但代价是工程复杂度和成本显著增加。对于中小规模模型，优先确保 weights 加载在同 AZ 内完成，避免跨区域 weight transfer。
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/modal-truly-serverless-gpus.md)

## 相关实体
> [主题导航](https://github.com/QianJinGuo/wiki/blob/main/moc/cloud-infrastructure.md)

- [TiDB Cloud — Agent-native 数据库与 Kimi K2.6 合作](../ch03/046-agent.html)
- [Kimi K2.6 Agent Database：Agent-native 数据 Infra](../ch03/046-agent.html)
- [阿里云 EventHouse 企业级 Agent 上下文供给体系](../ch03/046-agent.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/mcp-server-patterns.md)

---

