## Ch16.009 Unlocking asynchronicity in continuous batching

> 📊 Level ⭐⭐ | 4.9KB | `entities/continuous-async.md`

> 来源：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/continuous-async.md)

## 核心要点
- HuggingFace 深度技术文章，解析连续批处理的异步优化
- 核心问题：同步批处理中 CPU 和 GPU 交替等待，造成近 24% 的 GPU 空闲时间
- 解决方案：使用 CUDA streams 和 events 实现 CPU/GPU 并行执行
- 实验结果：GPU 利用率从 76% 提升至 99.4%，生成速度提升 22%

## 深度分析
### 同步批处理的本质缺陷
连续批处理（Continuous Batching）通过动态打包请求显著提升了 GPU 利用率，但它默认是同步的——CPU 准备新批次时 GPU 空闲，GPU 计算时 CPU 等待。在高频推理场景下（每秒数百步），这些空闲间隙累积成显著的效率损失。
HuggingFace 的实验数据揭示了这一问题的严重性：生成 8K tokens、batch size 32、8B 模型，总时间 300.6 秒，其中 24% 时间为空闲 GPU。这意味着如果能消除 CPU 开销，理论上可获得 24% 的免费加速——无需任何新 kernel 或模型修改。

### CUDA Streams 的并发机制
CUDA streams 是理解异步批处理的关键。每个 stream 是 GPU 操作的顺序队列，同一 stream 内操作串行，不同 stream 可并发。通过将 H2D 传输（Host-to-Device）、计算、D2H 传输（Device-to-Host）分配到独立 stream，可实现数据传输与计算的重叠。
但这里存在一个问题：非默认 stream 不会自动等待其他 stream 的操作完成——需要显式同步。

### CUDA Events 的同步语义
CUDA event 是一个标记，可记录到 stream 中，当 GPU 执行到该点时标记为完成。通过 `stream.wait(event)` 可让一个 stream 阻塞直到某个 event 被设置，而 CPU 端调用立即返回。这种纯 GPU 侧的同步机制，使得 CPU 可以真正"放手"，让硬件自行管理依赖关系。

### 双 buffer 槽位设计
异步批处理需要在 GPU 处理 batch N 时准备 batch N+1 的输入。这引发两个技术挑战：
1. **数据竞争**：batch N 和 batch N+1 不能共享同一内存区域，否则 GPU 可能读到部分覆写的数据。解决方案是使用两个独立的内存槽位（slot A 和 slot B），交替使用。
2. **CUDA Graphs 兼容性**：生产环境常使用 CUDA Graphs 加速，但每个 graph 绑定特定内存地址。双 memory pool 方案允许多个 graph 共享池化内存，总 VRAM 接近单个 graph 的使用量。

### Carry-over 机制
请求通常跨越多个 batch。当 batch N 产生新 token 时，该 token 需要作为 batch N+1 的输入。但由于 batch N 仍在计算，这个 token 还不存在。解决方案是使用占位符（placeholder）构建 batch N+1 输入，在 batch N 完成后通过 "carry-over" 将实际 token 填充进去。这四个操作（选择、置零、截断、相加）足够轻量，可被 CUDA Graph 捕获。

## 实践启示
1. **推理优化应关注 CPU/GPU 协同**：对于 LLM 推理工作负载，CPU 端调度开销常被忽视。即使 GPU 计算能力充足，CPU 侧的批次准备可能成为瓶颈。HuggingFace 的方法展示了如何通过异步化将 CPU 和 GPU 利用率同时最大化。
2. **使用非默认 CUDA Stream 避免隐式同步**：在 PyTorch 中显式使用非默认 stream 处理异步操作，可避免默认 stream 的全局同步阻塞效应。但要注意：任何传输操作都必须是非阻塞的（`torch.cuda.Stream` + 适当的流管理）。
3. **双 buffer 槽位是异步推理的标准模式**：任何需要"一边执行一边准备"的场景，都应考虑双缓冲。空间换时间的 tradeoff 在 GPU 内存充足时通常是值得的。
4. **CUDA Graphs 仍是延迟优化的关键**：异步批处理提升了吞吐量，但 CUDA Graphs 对单批次延迟的优化不应被放弃。通过 memory pool 可在保持 Graphs 优化效果的同时支持多 batch 并行。
5. **实践建议**：如果你的 LLM 推理服务吞吐量不达预期，在优化模型或硬件之前，先用 profiling 工具（如 HuggingFace 提供的脚本）确认是否存在 CPU-GPU 交替空闲问题。22% 的加速可能是免费午餐。
## 相关实体
- [Continuousasync](ch03-083-unlocking-asynchronicity-in-continuous-batching.html)
- [Gemma 4 Multi Token Prediction Drafters](ch01-214-mnn-sana-edit-v2.html)
- [How To Calculate The Inference Efficiency Ratio](ch01-492-evals-到底在评什么-一文拆解-ai-评估的三种方法.html)
- [Introducing The Ettin Reranker Family](ch01-361-introducing-the-ettin-reranker-family.html)
- [Lightseek Tokenspeed](ch01-817-lightseek-tokenspeed.html)
- MOC

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/continuous-async.md)

---
