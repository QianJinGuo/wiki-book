## Ch16.017 Profiling in PyTorch (Part 2): From nn.Linear to a Fused MLP

> 📊 Level ⭐⭐⭐ | 8.2KB | `entities/huggingface-torch-mlp-fusion-profiling-2026.md`

# Profiling in PyTorch (Part 2): From nn.Linear to a Fused MLP

> **Background**: Hugging Face team profiling series part 2 (2026-06-11). Climbs from single nn.Linear to 3-layer MLP with ReLU activation, profiles GPU kernel launch overhead, and shows torch.compile Inductor fusion reducing 9+ launches to 3 fused triton kernels.

## Core problem

- nn.Linear is the building block of nearly all deep learning models
- Single nn.Linear call produces multiple kernel launches (matmul + bias add)
- ReLU activation adds additional launches
- At small batch size (1024x1024), each layer can produce 5+ launches
- Kernel launch overhead (10-20us each) dominates total latency in overhead-bound regime

## Key findings

1. **3-layer MLP produces 9+ kernel launches** (3 Linear x 3 ops/Linear + 2 ReLU), single launch 10-20us, launch overhead 30%+ of total
2. **torch.compile auto-fusion**: Inductor backend fuses matmul + bias_add + relu into a single triton kernel, reducing 3 launches per layer to 1, total 9 to 3
3. **Compute-bound vs overhead-bound crossover**: at batch=1024 launch overhead dominates; at batch>=4096 compute dominates and fusion gains diminish
4. **CPU dispatch chain is hidden overhead**: each op traverses torch.add -> aten::add -> aten::add.out -> aten::copy_ dispatch layers, visible in profiler but not in user code
5. **torch.compile guard / recompile**: dynamic shapes trigger multiple recompiles, so first call can be slower than eager mode

## Practical takeaways

- Latency-sensitive small batch inference (batch<=2048): prefer torch.compile fusion
- Large batch training (batch>=4096): eager and compile modes have similar performance
- When profiling, focus on cudaLaunchKernel duration field, not just Self CUDA Time
- Use torch.profiler.profile(activities=[ProfilerActivity.CPU, ProfilerActivity.CUDA]) with record_function decorator to localize bottlenecks

## Wiki cross-links

- Same series (profiling part 1) - not yet ingested; check entities/torch-compile-* for related Inductor backend content
- Candidate associations: kernel fusion, launch overhead, Inductor backend (no existing entity)

## 深度分析

### 核心观点

1. **单算子层面的"融合"已接近极限，融合优化的主战场正在向算子间边界迁移**
   - `nn.Linear` 的 bias 加法已经通过 cuBLAS GEMM 的 **epilogue** 机制在单 kernel 内部融合（`addmm`），`torch.compile` 在单 Linear 层上没有更多融合空间
   - 真正的融合收益出现在 **算子间**：GeLU + element-wise mul + reshape 这三个独立 kernel 在 compile 后融合为一个 Triton kernel，消除了中间结果在 HBM 的往返
   - 这意味着未来优化应关注"哪些算子之间有中间结果往返"，而非在单算子内部寻找融合机会

2. **CPU 端的 dispatch 开销是被忽视的瓶颈，尤其在 overhead-bound 场景**
   - 每个 PyTorch 算子经过 `aten::linear → aten::t → aten::addmm` 的 dispatch 链，每次 dispatch 触发 Python/C++ binding 开销
   - `torch.compile` 通过 Inductor 在编译时展开这个链，直接发射 `aten::addmm`，消除了中间 view 操作带来的 CPU 开销
   - 对 batch<=2048 的小 batch 推理，这个 CPU 开销占总延迟的 30%+，是 fused kernel 带来的主要收益来源

3. **静态 shape 特化 vs 通用性是一个根本性权衡**
   - Inductor 的 fused kernel 为 `[8192, 3072]` 形状专门生成，执行时间 89.4µs；Liger 手写 kernel 泛化任意形状执行时间 92.8µs
   - 差距仅 3.4µs，但背后是 compile-time shape specialization 的代价——动态 shape 触发 recompile，重编译成本可能远超单次执行节省
   - 实际工程选择应基于输入 shape 是否稳定，而非绝对性能数字

4. **GEMM 形状影响 kernel 选型，从而影响性能——同样的 FLOPs 不等于同样的速度**
   - gate_proj 和 up_proj：M·K·N = 8192·768·3072，执行时间 0.19ms
   - down_proj：M·K·N = 8192·3072·768，执行时间 0.17ms（快约 10%）
   - 原因：N=768 vs N=3072 导致 cuBLAS 选择了不同的 tile 配置（128×256 with stages_64x3 vs 128×128 with stages_32x5），更深 pipeline 的 tile 在该形状下复用更好

### 技术要点

- **GEMM epilogue**：矩阵乘 kernel 在写回 HBM 前执行 bias add / activation，避免单独发起一次 HBM 读写
- **Triton pointwise fusion**：Inductor 的 Triton 后端将 pointwise 算子（GeLU、mul、reshape）融合为单一 kernel，intermediate 留在寄存器而非 HBM
- **cuBLAS occupancy query**：每次 GEMM 发射前调用 `cudaOccupancyMaxActiveBlocksPerMultiprocessor` 确认最优 grid 配置，pointwise kernel 则直接发射无查询
- **View 不产生 kernel**：`aten::t`、`aten::transpose`、`aten::as_strided` 只改 tensor metadata（shape + stride），不搬动数据，不发射 GPU kernel

### 实践价值

- 对**ML 工程师**：小 batch 推理（batch≤2048）优先用 `torch.compile`，收益最大；大 batch 训练（batch≥4096）可保留 eager mode 省去编译开销
- 对**性能工程师**：profiler 表中看到 `0.000us` CUDA 时间的 op 名称（如 `aten::t`）应忽略，它们是纯 CPU 元数据操作，不是真正的 GPU 负载
- 对**框架开发者**：设计新算子时考虑是否有 epilogue融合机会——在 GEMM 尾部做激活函数比单独发射 kernel 更高效

### 相关实体

- [Deepseek V4 Triton Fp4 Optimization](ch01-377-deepseek-v4-triton-fp4-优化实战.html) — 同样涉及 Triton kernel 优化，与本文的 pointwise fusion 优化角度互补
- Inference Optimization — 推理优化通识，包含本文未覆盖的量化 / 蒸馏 / serving 层面的优化策略

## 实践启示

1. **建立"先猜测再验证"的 profiler 习惯**：每次看 trace 前先在脑中构建预期，trace 打开后第一时间关注"预期与现实的差异"——差异就是最有价值的发现
2. **小 batch 推理优先 torch.compile**：batch≤2048 时融合收益最高（kernel launch overhead 占 30%+）；batch≥4096 后 compute-bound 主导，compile 收益递减
3. **关注 cudaLaunchKernel duration 而非只看 Self CUDA Time**：Self CUDA Time 漏掉了 kernel launch 调度开销，duration 字段包含 launch 和实际执行两部分
4. **动态 shape 场景慎用 torch.compile**：若输入 shape 在每次推理时都可能变化（如 streaming 输入），compile 的 recompile 成本会抵消甚至超过融合收益，此时用 Liger 类手写 fused kernel 更稳定
5. **用 kernels 库分发预编译 kernel**：避免本地编译的痛苦（版本不匹配、GPU 架构差异），通过 `get_kernel("kernels-community/liger-kernels", version=N)` 下载 CI 预编译的版本化二进制

## Source

Original URL: https://huggingface.co/blog/torch-mlp-fusion

Source: [raw archive](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/huggingface-torch-mlp-fusion-profiling-2026.md)

---
