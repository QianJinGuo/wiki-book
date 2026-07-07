# Unlocking asynchronicity in continuous batching

## Ch03.088 Unlocking asynchronicity in continuous batching

> 📊 Level ⭐⭐ | 8.5KB | `entities/continuousasync.md`

## 核心要点
- HuggingFace 博客文章，关于 continuous batching 技术
- 技术深度：v=8, c=7
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/continuousasync.md)

## 相关实体
> [主题导航](https://github.com/QianJinGuo/wiki/blob/main/queries/ai-model-research-latest-directions.md)

- [Development environments for your cloud agents](ch03/045-agent.html)
- [AI Infra 系统性拆解：传统后台工程师视角](../ch01/898-ai-infra.html)
- [ml-intern — Hugging Face 自主 ML 工程代理](../ch04/477-ml-intern-huggingface-autonomous-ml-agent.html)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/nvidia-gpu-acceleration.md)
## 深度分析
### 1. 同步批处理的根本性低效
Continuous Batching 通过紧密打包的批次调度来提高 GPU 利用率，消除了因 padding 造成的计算浪费。然而，同步批处理本身存在第二个效率瓶颈：默认情况下，CPU 和 GPU 是串行工作的——GPU 计算时 CPU 等待，CPU 准备下一个批次时 GPU 等待。 在每秒运行数百步的连续批处理循环中，这些空闲间隙累积起来可以达到总运行时间的近四分之一。Hugging Face 的实测数据显示，在生成 8K tokens、批大小为 32、使用 8B 模型的场景下，总生成时间为 300.6 秒，其中 GPU 处于空闲等待 CPU 完成的比例为 24.0%。 换言之，如果能消除 CPU 开销，理论上可以免费获得 24% 的加速——不需要任何新的 kernel 或模型修改。

### 2. CUDA Streams：并发执行的基础
CUDA Stream 是实现 CPU-GPU 并行工作的核心技术。一个 Stream 是 GPU 操作（kernel 启动、内存拷贝、同步屏障）的有序队列，同一 Stream 内的操作按提交顺序执行，不同 Stream 之间的操作相互独立可以并发执行。 非默认 Stream 的关键特性是"非阻塞"：在默认 Stream 上调度操作会等待所有其他 Stream 的工作完成，而非默认 Stream 上的操作则立即将控制权返回给 CPU。
在 Continuous Batching 的异步方案中，需要三个独立的 Stream：H2D Stream（主机到设备传输）、Compute Stream（GPU 计算）和 D2H Stream（设备到主机传输）。这三个操作本身是相互独立的，没有理由串行化执行。

### 3. CUDA Events：跨 Stream 同步机制
仅使用 Stream 还不能保证操作的正确顺序——因为不同 Stream 之间是独立运行的。CUDA Event 解决了这一问题：Event 是一个标记，可以被记录到 Stream 中，当 GPU 执行到该位置时标记为完成；任何其他 Stream 可以设置"等待"条件，在 Event 完成之前不开始下一个操作。 这使得 GPU 端可以强制执行 H2D → Compute → D2H 的操作顺序，而 CPU 端完全不阻塞。

### 4. Double Buffering：消除数据竞争
异步批处理的核心是在准备 batch N+1 的输入时，batch N 仍在 GPU 上计算。这引入了两个关键问题需要解决：
**数据竞争（Race Condition）**：如果 batch N 和 batch N+1 共享同一组设备端输入缓冲区，CPU 可能在 GPU 仍在读取 batch N 数据时就开始写入 batch N+1 的数据。解决方案是使用两套张量缓冲区并交替使用——当 GPU 处理 slot A 上的 batch N 时，CPU 更新 slot B 上的请求状态并准备 batch N+1。
**显存代价**：双缓冲区使 RAM 和 VRAM 的使用量翻倍。但这个代价是可以接受的，特别是使用 FlashAttention 时，因为它不需要注意力掩码（这是最大的输入张量）。 CUDA Graphs 的使用进一步复杂化了这个问题——因为 CUDA Graph 是针对特定内存地址录制的，不能跨 slot 重放。解决方案是使用内存池（Memory Pool）：两个 Graph 从同一共享内存池分配，只要两个 Graph 不并发执行（batch N 必须完成后 batch N+1 才能开始），总显存使用量仍接近单个 Graph 的水平。

### 5. Carry-over 机制：跨批次依赖的正确处理
当一个请求同时出现在 batch N 和 batch N+1 中时，它在 batch N 中生成的新 token 需要作为 batch N+1 的输入。问题在于：当 CPU 准备 batch N+1 时，batch N 仍在运行，新 token 还不存在。解决方案是使用占位符 token（值为 0）填充，然后在 batch N 计算完成后、D2H 传输完成前，执行"携带"操作（Carry-over）：将 batch N 的输出 token 复制到 batch N+1 输入中对应的位置。 这个机制由一个 carry-over mask 张量控制，mask 中包含目标位置信息和 -1（表示不携带）。因为携带操作（四个 cheap 操作：选择、置零、截断、相加）非常轻量，所以被捕获到 CUDA Graph 中执行，开销可以忽略不计。

### 6. 实测性能提升验证
最终的异步方案在相同条件下（8K tokens，batch size 32，8B 模型）测试结果显示：GPU 利用率从同步批处理的 76.0% 提升到 99.4%，总生成时间从 300.6 秒降至 234.5 秒，加速幅度为 22%。 这一结果非常接近理论预测的 24%（剩余 2% 的差距来自不可避免的同步点）。代码实现已在 transformers 库中提供，入口为 continuous_batching.py 中的 ContinuousBatchingAsyncIOs 类。

## 实践启示
### 1. LLM 推理服务部署：优先考虑异步批处理
对于部署 LLM 推理服务的团队，异步批处理是提升 GPU 利用率的有效手段。在 H200 每小时约 $5 的成本下（按 Inference Endpoints 定价），每降低 22% 的生成时间就意味着等效的成本节省。 对于日均使用量大的推理服务（如日均生成数百万 token 的生产系统），累积效应非常显著。建议所有使用 Hugging Face Transformers 进行推理部署的团队都将 continuous batching async 实现纳入评估流程。

### 2. 推理框架选型：检查 async 支持状态
不是所有的推理框架都支持异步批处理。在选型阶段，需要确认目标框架是否具备：CUDA Streams 和 Events 的原生支持、Double Buffering 机制、Carry-over 逻辑的实现。Hugging Face Transformers（v4.40+）通过 ContinuousBatchingAsyncIOs 类提供了生产级的异步批处理支持。对于使用 vLLM 或其他框架的团队，需要检查其 async batching 的成熟度——有些框架的异步支持可能仍处于实验阶段。

### 3. 长序列场景的最大受益者
异步批处理对于"长生成"场景（16K+ tokens，如强化学习训练）特别有价值。 原因在于：长序列意味着更长的 GPU 计算时间，这为 CPU 的批次准备工作提供了更充裕的缓冲空间，使得 CPU 几乎总能在 GPU 完成当前批次前准备好下一批次。对于短序列（如聊天机器人场景，每次生成 512 tokens 以内），CPU 和 GPU 的时间差距较小，异步带来的加速收益相对有限。

### 4. 显存预算与 CUDA Graph 的权衡
如果显存紧张，需要在"双缓冲区带来的显存翻倍"和"异步加速带来的 GPU 利用率提升"之间做权衡。Hugging Face 的分析表明，使用 Memory Pool 可以使两个 CUDA Graph 的总显存使用量接近单个 Graph 的水平——我们只为两个 Graph 捕获付出初始化时间的代价。 但如果显存预算确实不足以支持双缓冲区，则需要评估同步批处理是否已经满足延迟需求。

### 5. 进一步优化方向
Hugging Face 团队指出，异步批处理只是 SOTA 吞吐量的必要条件之一，实现长序列的完整 SOTA 还需要的其他优化包括：请求卸载（offloading requests）、解码专用 kernel（decode-specific kernels）或细粒度编译（fine-grained compile）。 对于追求极致性能的团队，建议关注 Hugging Face 博客的后续文章，这些优化方向应该会逐一被覆盖。同时，在生产环境中实施异步批处理时，还需要考虑调度层的实现——FastAPI 或类似的异步 API 服务器是合适的编排层选择。

---

