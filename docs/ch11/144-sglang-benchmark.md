# 基于SGLang的大模型推理部署实践——Benchmark方法论、方案选型与调优

## Ch11.144 基于SGLang的大模型推理部署实践——Benchmark方法论、方案选型与调优

> 📊 Level ⭐⭐ | 7.8KB | `entities/sglang-inference-deployment-practice-benchmark-tuning.md`

# 基于SGLang的大模型推理部署实践——Benchmark方法论、方案选型与调优

> **Background**：本文基于 AWS China Blog 发布的 LLM 推理部署实战文章，系统梳理了基于 SGLang 的大模型推理 Benchmark 方法论、三种部署方案（单机/多机 Non-PD/多机 PD 分离）的选型对比，以及性能调优与常见问题排查指南。原文由 AWS 资深工程师撰写，包含基于 DeepSeek-V3/V4-Pro 及 Kimi2.5 在 Amazon EFA 环境下的实测数据。

## 核心贡献

本文的核心价值在于提供了一套**可复现的大模型推理部署方法论**，而非单一的技术点：

1. **Benchmark 方法论**：明确了测试规划、指标定义、变量控制（Warmup 策略、input/output 长度固定）、及结果可信度验证 —— 尤其揭示了 SGLang bench_serving 在 PD 分离场景下对截断请求的误判问题

2. **部署方案三维对比**：单机（EP1 vs EP8）、多机 Non-PD 分离、多节点 PD 分离（2P2D），各方案在 TTFT/TPOT/Throughput 三个维度的实测数据覆盖了 DeepSeek-V3/V4-Pro 和 Kimi2.5 两种典型模型

3. **选型决策树**：给出了从"模型能否放入单机"开始的系统化决策框架，核心原则是"先单机基线，再多机扩展"、"PD 分离 vs Non-PD 无绝对优劣"

4. **Debug 体系**：从 TTFT/TPOT/Throughput 三个角度的系统化排查流程，覆盖了 KV Cache、EP 并行、PD 分离、CUDA graph、投机解码等多个维度

## Benchmark 方法论

### 测试规划四问

在部署推理前，必须明确的四个问题：

- **测试内容**：模型版本、input/output token 长度（固定 vs 动态）、请求数
- **测试目标**：与已有方案对比、给出最佳部署方案、预研新模型表现
- **测试范围**：GPU 机型、推理框架、部署方案（单机/多机、PD/Non-PD）、并行策略组合
- **测试指标**：TTFT（首 token 延迟）、TPOT（后续 token 生成时间）、Output Throughput（token/s）、Request Throughput（请求/s）、KV Transfer 延迟

### 关键坑点

**Warmup 策略**：Benchmark 前必须发送充分 warmup 请求来触发 Triton kernel JIT 编译（SGLang server 启动时的默认 warmup 不够充分）。warmup 请求的分布应与后续 benchmark 请求一致。

**结果可信度陷阱**：SGLang bench_serving 将 HTTP 200 等同于"请求成功"，但在 PD 分离场景下，Prefill 成功且产出第一个 token（output_len≥1）即返回 200，即使后续 decode 中途崩溃导致 output_len 远小于请求值，也会被误判为成功。必须人工检查日志验证实际 output_length。

**TTFT 与 Throughput 的矛盾**：高并发能提升吞吐但恶化了 TTFT。如果 TTFT 不满足约束，再高的吞吐也无效。PD 分离的核心收益体现在 TPOT 上（隔离后 decode 不会被 prefill 抢占），P99 TPOT 比 mean 更能反映用户体验。

## 部署方案对比

### 单机部署

核心问题：模型能否放入单机？以 DeepSeek-V3 671B FP8 为例：

| 场景 | 结论 |
|------|------|
| H200 实例 | 可容纳（mem-fraction-static 0.78 精细调控） |
| B200/B300 | 显存富余较大，可运行更长 context 或更大 batch |
| G7e.48xlarge | 无法单机，需要 2+ 节点 |

**EP 选择的关键性**：EP1 vs EP8 的选择对性能有显著影响。在 DeepSeek-V3 H200 上，EP1 方案因 CUDA graph capture 阶段显存不足需要禁用 CUDA graph，导致性能远不如 EP8（且启用 CUDA graph）。但在 Kimi2.5 INT4 上情况相反——EP1 TP8（启用 CUDA graph）反而优于 EP8 TP8。EP 选择必须 **case by case**。

### 多机 Non-PD 分离

并行策略的核心公式：`moe_tp_size = tp_size // ep_size // moe_dp_size`。当 `moe_dp_size > 1` 时，`attn_cp_size` 必须等于 `moe_dp_size`，因为 Attention CP 和 MoE DP 的 token 分片逻辑必须对齐。

### 多节点 PD 分离（2P2D）

PD 分离并不一定比 Non-PD 更好。以 DeepSeek-V4-Pro 在 120K input、1K output 场景下：

- 2P2D + NIXL: 31 tok/s, mean TTFT 259s
- 2P2D + Mooncake TE: 31 tok/s, mean TTFT 262s
- Non-PD 4 nodes: 97 tok/s, mean TTFT 73s

且 2P2D 在 max concurrency=128 时有大量错误，128 请求中不到 25 成功（Mooncake TE 下），而 NIXL 在相同条件下全部成功。Non-PD 4 节点在同样条件下无错误、全部成功。

## 选型决策树

核心原则六条：

1. **先单机基线，再多机扩展**——多机不一定比单机好
2. **PD 分离 vs Non-PD 无绝对优劣**——必须 case by case
3. **判断瓶颈在 Prefill 还是 Decode**，针对性扩容
4. **KV Transfer Engine 选型**：Amazon EFA 环境优先推荐 NIXL libfabric backend
5. **EP 跨节点不一定好**——Prefill 节点独立部署可避免跨节点通信
6. **并行策略组合需实测，无万能公式**

## Debug 与调优

> 完整排查流程见原文第 9 章及第 8 章决策树。

### TTFT 高

常见原因链：queue_reqs 堆积（结果而非原因）→ 逐一排查：Parallelism 策略（PP/CP/DP Attention）、KV cache 空间、request rate 过高、EP 与 KV transfer engine 的 CPU/EFA 争用、KV cache hit rate 低（routing affinity、HiCache 配置）、kv_transfer_latency 高（EFA/RDMA 配置）、SGLang 参数（chunked prefill size、max prefilled token）。

### TPOT 高

排查：KV cache 空间不足导致 preemption（`retracted_reqs > 0`）、并行策略不合适、PD 分离方案选择、投机解码 accept avg length 过低、batch size 超出 CUDA graph capture max batch size。

### 吞吐低于预期

先验证预期本身是否合理。排查方向：SGLang size 参数、KV cache 可用容量、HiCache 配置、投机解码、部署方案（长输入/短输出 ↔ 增加 prefill/decode 节点）、GPU 机型（B 系列 > H 系列但需性价比测试）、推理框架选择。

## 与现有实体的关系

- → [SGLang](../ch04/596-agent-assisted-sglang-ai-llm.html)（主实体，本文提供了实践层面的深度补充）
- → [推理优化](https://github.com/QianJinGuo/wiki/blob/main/concepts/inference-optimization.md)
- → [LLM Benchmark 全景](https://github.com/QianJinGuo/wiki/blob/main/concepts/llm-benchmark-landscape.md)
- → [模型推理对比](https://github.com/QianJinGuo/wiki/blob/main/concepts/model-inference-comparison.md)
- → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aws-sglang-inference-practice-benchmark-deployment-tuning.md)

---

