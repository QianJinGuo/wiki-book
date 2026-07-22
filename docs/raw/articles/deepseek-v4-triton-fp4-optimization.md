---
title: 【DeepSeek V4】Triton FP4 优化实战：近距离感受老黄的刀法
source_url: https://mp.weixin.qq.com/s/4CKfdAPfmsA6fyUVlKs9_g
publish_date: 2026-05-07
tags: [wechat, article, deepseek]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: 52e87761dc4dc5b904f9dc5cd7e36b05a3096f085c638a39c4a723295b65c8cc
---
# 【DeepSeek V4】Triton FP4 优化实战：近距离感受老黄的刀法
> 作者：靳岩岩，2026-05-07
> 系列：DeepSeek V4 CUDA 优化实战（178→179 期）
## 前情提要
178 期讲了 DGX Spark（sm_121）上跑 DeepSeek V4 Flash 280B 的 FP4 优化问题：
- Marlin FP4 kernel 在 SM121 上静默算错（中文对、英文错）
- Consumer-DeepGEMM（CUTLASS sm_120）替换后输出正确，但速度只有 0.8 tok/s
- 社区 jasl 用 Triton 重写了 attention/MLA/einsum，达到 14 tok/s（但 FP4 GEMM 仍走 Marlin）
本期的目标：在 jasl fork 基础上，把 Consumer-DeepGEMM 的 FP4 MoE GEMM 从 0.79 tok/s 优化到更高水平。
## 核心问题解析
### FP4 MoE GEMM 是什么？
DeepSeek V4 Flash 是 MoE（混合专家）架构：
- 每层 256 个"专家"（小型前馈网络）
- 每个 token 只激活其中 6 个
- 每个专家核心计算是矩阵乘法（GEMM），权重用 FP4 格式存储省显存
- 60 层 × 2 FC（每个专家 2 个全连接层）= **120 次 FP4 GEMM/token**
### 为什么中文对、英文错？
不是"偶尔算错"，是"每次都算错"。Marlin FP4 kernel 在 SM120/SM121 上每次调用结果都不精确：
- 256 个专家里，部分专家权重数值特征让误差被放大（输出明显偏离正确值）
- 部分专家误差恰好被后续层计算"吸收"（最终 token 选择没受影响）
- 中文 prompt 激活的 6 个专家组合恰好属于"误差没被放大"的那类
- **不是中文能力强，是中文运气好**
### 为什么只能反量化到 BF16？
SM121 上的矩阵乘法硬件支持情况：
| 格式 | SM121 支持 |
|------|-----------|
| FP4 tensor core | 不存在 |
| FP8 tensor core | 残缺（老黄的刀） |
| BF16 tensor core | 完整可用 |
反量化路径：FP4 → FP8 → BF16。FP8 量化到 BF16 是 SM121 上最稳、最快、兼容性最好的路径。
## 优化过程
### 第零步：先测，不要猜（profiling first）
在每个函数入口/出口加 cuda.synchronize() + 计时。
关键发现（稳态数据，~11000 次调用后收敛）：
```
m_grouped_fp8_fp4_gemm_nt_contiguous avg = 14.00 ms/call
get_paged_mqa_logits_metadata         avg = 0.17 ms/call
每生成 1 token：120 次 FP4 GEMM + 1 次 metadata
总 GEMM 时间占比：>99.98%
```
Consumer-DeepGEMM 实现了 DeepGEMM 全部 28 个 API 函数，但实际运行时只有 2 个被调用——其余全被 jasl 的 Triton 接管了。
### 第一步：Triton 反量化 + cuBLAS 混搭（0.79 → 1.67 tok/s）
核心思路：Triton 做反量化（SM120 上最快的 FP4 解包），cuBLAS 做矩阵乘法（GPU 上最快的 BF16 matmul）。
分两步：
1. Triton dequant kernel：FP4 packed → BF16
2. cuBLAS matmul：BF16 × BF16
结果：单次 GEMM 52ms → 14ms，提速 2.1x。
### 第二步：Fused Dequant+Matmul Kernel（1.67 → 1.87 tok/s）
分两步的瓶颈：56MB 的 BF16 中间矩阵先写显存、再读回来，1.3GB 的无用带宽（6 专家 × 2 FC）。
Fused kernel 思路：边反量化边做矩阵乘法，56MB 中间矩阵根本不落地到显存。
实现技巧：分两次 tl.dot 处理 packed FP4 的交错数据布局（偶数列×低半字节 + 奇数列×高半字节）。
精度基准 vs Python 参考路径：
| 配置 | 相对误差 |
|------|---------|
| M=1, N=32, K=4096 | 0.000000（完美） |
| M=1, N=4096, K=7168 | ~0.5% |
| M=64, N=4096, K=7168 | ~2% |
2% 相对误差完全可接受——FP4 本身就是把 16-bit 压缩到 4-bit（16 个值），量化误差远大于 2%。
Benchmark 结果：
| 版本 | 单次 GEMM | 端到端速度 | 相对首版 |
|------|---------|-----------|---------|
| 基线：Python fallback | 52 ms | 0.79 tok/s | 1.0x |
| 第一步：Triton dequant + cuBLAS mm | 14 ms | 1.67 tok/s | 2.1x |
| 第二步：Fused Triton dequant+matmul | 6.4 ms | 1.87 tok/s | 2.4x |
## 为什么 Triton 是 SM120 上唯一的出路
GPU 编程抽象层（SM120/SM121）：
| 层次 | SM120 状况 | 代表方案 |
|------|-----------|---------|
| 手写 CUDA | FP4/FP8 指令不存在或行为异常 | Marlin（静默算错） |
| CUTLASS | SM120 模板正确，但 launch overhead 改不掉 | Consumer-DeepGEMM（速度被库架构限制） |
| Triton 标准库 | FP4 kernel 包含 SM100 专属指令 | 不兼容 SM120 |
| 自写 Triton kernel | 避开 SM100 专属指令，可用 | 唯一可行方案 |
Triton 编译器把代码翻译成 SM121 兼容的机器码。我们只用了最基础的 tl.load、tl.store、tl.dot、位操作，不使用 TMA、.tile::scatter4、tcgen05 等 SM100 专属特性。
## 关键教训
1. **profiling first**：不测就猜瓶颈在哪，十次有九次猜错
2. **优化看端到端，不能只看单步**：matmul 提速 1.56x，加上 stack 开销整体反而退步 20%
3. **消灭数据搬运比加速计算更有效**：两步优化的共同主题不是让计算变快，而是让数据搬运变少
4. **不是中文能力强，是中文运气好**：路由激活的专家组合决定了误差是否被放大
## 系列文章
- 176 期：DeepGEMM 为什么不支持你的显卡？
- 178 期：DGX Spark 推理 Debug
- **179 期（本文）**：Triton FP4 优化实战