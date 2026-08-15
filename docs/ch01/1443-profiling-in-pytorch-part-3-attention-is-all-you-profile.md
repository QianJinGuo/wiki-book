# Profiling in PyTorch (Part 3) — Attention is all you profile

## Ch01.1443 Profiling in PyTorch (Part 3) — Attention is all you profile

> 📊 Level ⭐⭐ | 1.2KB | `entities/profiling-pytorch-part3-attention-is-all-you-profile.md`

# Profiling in PyTorch (Part 3) — Attention is all you profile

Hugging Face PyTorch Profiling 系列第三篇，聚焦**注意力机制的 profiling**——用 PyTorch Profiler 定位注意力计算的热点与瓶颈。

## 核心内容

- 注意力层 profiling 方法论（kernel 热点、显存带宽、flops 利用率）
- PyTorch Profiler 在 Transformer 上的实践技巧
- 注意力优化的测量基准

## 关联

与 [HF Torch MLP fusion profiling](ch01/1129-20.html) 同属 HF 性能工程系列；方法论适用于 [推理优化](https://github.com/QianJinGuo/wiki/blob/main/concepts/inference-optimization.md) 与训练侧 [PyTorch 版本迭代](ch01/103-pytorch-2-12-release-blog-pytorch.html) 的验证。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/profiling-pytorch-part3-attention-is-all-you-profile.md)

---

