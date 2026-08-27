# vLLM

## Ch01.886 vLLM

> 📊 Level ⭐⭐ | 7.2KB | `entities/vllm.md`

# vLLM

## 摘要

vLLM 是由 UC Berkeley 团队开发并开源的高性能 LLM 推理与服务引擎，通过 PagedAttention（类操作系统虚拟内存的 KV Cache 管理）与连续批处理（Continuous Batching）两项核心创新，将推理吞吐量提升到静态批处理方案的 2-24 倍。它提供 OpenAI 兼容 API，原生支持 LLaMA、Mistral、Qwen、DeepSeek 等主流开源模型，已成为生产环境 LLM 推理的事实标准之一。vLLM 的设计取舍深刻反映了推理引擎从"学术评估"到"生产部署"的范式转变：可预测的延迟与高吞吐优先于极致的生成质量。

## 核心要点

- **PagedAttention**：将 KV Cache 划分为固定大小的 block（类似内存页），通过 block table 完成逻辑地址到物理地址的映射，把显存实际利用率从传统方案的 20-40% 提升到 95% 以上
- **连续批处理**：调度粒度从请求级下沉到迭代级，允许新请求中途插入运行中的 batch、已完成请求提前退出（preemption），让 GPU 持续繁忙
- **张量并行（Tensor Parallelism）**：7B 级模型单卡可跑；13B-70B 用 2-4 卡 TP；70B 以上需 TP + pipeline parallelism 组合
- **前缀缓存（Prefix Caching）**：共享 prompt 前缀（多轮对话 system prompt、批量同 instruction 推理）时复用 KV block；命中率低的场景反而引入额外开销
- **正确性/性能权衡**：为吞吐放弃 beam search，greedy 与 sampling 满足绝大多数在线场景（chat、代码生成）需求
- **量化支持**：AWQ/GPTQ 4-bit 量化可将显存占用降低约 60%，是成本敏感部署的首选路径
- **v0 → v1**：v1 对调度器架构做了重大重构，新部署应直接使用 v1

## 深度分析

### PagedAttention：虚拟内存思想在推理侧的工程落地

PagedAttention 的核心洞察在于：传统引擎为每个请求预分配一段连续的 KV cache 空间，而 KV cache 的实际使用量随生成过程动态增长且不可预知，预分配导致严重的内部与外部碎片——实际利用率通常只有 20-40%。vLLM 将 KV cache 按固定大小（默认 16 个 token 一个 block）切分，用 block table 实现逻辑页到物理页的映射，使利用率跃升至 95% 以上。但工程实现远比概念复杂：block 的按需分配与释放不能引入不可预测的延迟（不允许 GC 式停顿）；多序列共享前缀时（如对同一 prompt 做并行采样），vLLM 用引用计数 + 写时复制（Copy-on-Write）实现 block 级共享，写操作触发复制以隔离各序列；block 大小本身是 tradeoff——block 越小内部碎片越少，但 block table 条目数与调度粒度开销越大。这套机制与操作系统分页在思想上同构，而"延迟可预测性"是推理场景对它的额外硬约束。

### 连续批处理：迭代级调度如何挤出 2-24 倍吞吐

静态批处理必须等 batch 内最慢的请求完成才能整体释放，batch 尾部算力空转严重。vLLM 的连续批处理把调度粒度下沉到迭代级（iteration-level scheduling）：每个 decode 步结束后，scheduler 依据显存与 token 预算决定下一轮运行哪些序列，新请求在任意时刻插入，完成的序列立即让出资源。显存不足时触发 preemption，按策略将部分序列 swap 到 CPU 或整块重算（recompute）。两个关键旋钮——max_num_seqs（并发序列上限）与 max_num_batched_tokens（单次迭代 token 预算）——共同决定吞吐与延迟的平衡点。这也解释了相对 HF Transformers 2-24 倍加速比的来源：差距主要来自调度效率与内存利用率，而非算子上限；后续引擎的追赶也基本围绕"把调度做细"展开。

### 前缀缓存与并行策略的适用边界

前缀缓存以 hash 匹配复用已计算的 KV block，在多轮对话（共享 system prompt）与批量推理（相同 instruction）场景效果显著。但收益有明确边界：当 prompt 前缀差异大、命中率低时，hash 计算与 block table 管理成为纯开销，缓存块还挤占可用显存——是否启用、用何种淘汰策略，必须按应用场景单独评估。并行策略的选择同样依赖规模：张量并行把单层参数切到多卡、每层都需 all-reduce 通信，强烈依赖 NVLink/高速互联，跨节点部署性能衰减明显；pipeline 并行按层切分、通信量小但存在流水线气泡（bubble）。7B 单卡、13B-70B 上 2-4 卡 TP、70B+ 上 TP+PP 组合，是当前成本与性能的默认解。

### 从 v0 到 v1：调度器重构与生产监控的成熟化

v1 是 vLLM 的一次架构级重构：token 级调度器（token-based scheduler）取代旧序列级调度，统一 GPU/CPU 内存管理器，调度开销趋近于零，并顺带修复了 v0 时代积累的正确性问题——这部分历史教训详见 [vLLM v0 to v1 Correctness](ch01/886-vllm.html)。与此同时，生产监控的度量体系也在成熟：相比裸吞吐量，P50/P99 的 TTFT（time-to-first-token，首 token 延迟）直接决定用户体验，ITL（inter-token latency，token 间延迟）决定流式输出是否平滑；吞吐量只在容量规划时才有意义。vLLM 放弃 beam search 同样是这一"生产优先"取向的注脚：学术评估看重生成质量上限，而在线服务更在意延迟分布的可预测性与单位 GPU 吞吐。

## 实践启示

1. **按模型规模选并行策略**：7B 以下单卡部署；13B-70B 用 2-4 卡 tensor parallelism；70B 以上用 TP + pipeline parallelism 组合，且 TP 尽量限制在单节点内以利用 NVLink 带宽
2. **成本敏感场景上 4-bit 量化**：AWQ/GPTQ 可将显存需求降低约 60%，允许更小的实例规格或更大的 batch；量化精度损失在多数线上任务中可接受
3. **前缀缓存按场景评估**：多轮对话、固定 system prompt 场景务必启用并配置合理的淘汰策略；prompt 高度随机的场景建议关闭，避免无效 hash 开销与缓存污染
4. **监控 TTFT 与 ITL 而非裸吞吐**：TTFT 的 P50/P99 反映首屏体验，ITL 反映流式流畅度；吞吐量仅作为容量规划的参考指标
5. **新部署直接用 vLLM v1**：v0 的正确性隐患与调度器架构差异使 v1 成为唯一合理选择；存量 v0 升级需做回归验证
6. **引擎选型保留对比空间**：SGLang 等竞品在特定场景（如 RadixAttention 前缀复用）表现接近，llama.cpp 适合边缘与低资源环境；选型应以自身负载画像做基准测试，而非唯名气论

## 相关实体

- [vLLM 高效推理](ch01/1590-ai-infra.html)
- [ServiceNow vLLM Correctness](ch01/886-vllm.html)
- [vLLM v0 to v1 Correctness](ch01/886-vllm.html)
- [量化技术](https://github.com/QianJinGuo/wiki/blob/main/entities/quantization-techniques.md)
- [投机解码](ch01/1218-spec.html)
- [SGLang 推理部署](https://github.com/QianJinGuo/wiki/blob/main/entities/sglang-inference-deployment-practice-benchmark-tuning.md)
- [llama.cpp 部署](../ch11/168-llama-cpp-deployment.html)

---

