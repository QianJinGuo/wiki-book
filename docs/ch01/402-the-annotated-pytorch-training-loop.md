# The annotated PyTorch training loop

> 📊 Level ⭐⭐⭐⭐ | 12.4KB

> **来源**: [The annotated PyTorch training loop](https://idlemachines.co.uk/essays/pytorch-training-loop)

![Image 1: A three-class spiral dataset. Shaded regions show the model's softmax confidence. The boundary sharpens as training progresses.](https://idlemachines.co.uk/essays/figs/training_loop_animation.webp)

A three-class spiral dataset. Shaded regions show the model's softmax confidence. The boundary sharpens as training progresses.

Building a PyTorch training loop is fairly straightforward, but getting everything in the right place and in the right order can feel surprisingly fragile. There are loads of moving parts and after the most basic errors are fixed, most of the other mistakes can be pretty hard to spot. Training runs will fail to converge, produce incorrect results, or consume excessive memory if lines are misplaced.

The sections below will go through each operation in sequence, explaining exactly how to write each section, and all the common mistakes to watch out for. Distributed training, FSDP, and multi-GPU setups are out of scope here, but we'll come back to that in a future essay. _(The animation above was produced by running the loop on synthetic data and capturing the decision boundary at each epoch.)_

## The complete loop

Let's look, first of all, at the complete training loop. You don't need to understand or memorise it yet, just get a feel for the structure.

```
1import torch
2import torch.nn as nn
3from torch.utils.data import DataLoader, TensorDataset
4
5# --- data ---
6dataset = TensorDataset(X_train, y_train)
7loader  = DataLoader(dataset, batch_size=64, shuffle=True)
8
9# --- model, loss, optimiser ---
10model     = MLP(in_features=2, hidden=128, out_features=3)
11criterion = nn.CrossEntropyLoss()
12optimiser = torch.optim.Adam(model.parameters(), lr=1e-3)
13scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimiser, T_max=100)
14
15# --- loop ---
16for epoch in range(100):
17    model.train()
18    for X_batch, y_batch in loader:
19        optimiser.zero_grad()
20        logits = model(X_batch)
21        loss   = criterion(logits, y_batch)
22        loss.backward()
23        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
24        optimiser.step()
25    scheduler.step()
26
27    model.eval()
28    with torch.no_grad():
29        val_logits = model(X_val)
30        val_loss   = criterion(val_logits, y_val)
```

Now let's go through each line and understand what it does, and how not to break it. We'll start with some of the common mistakes.

## TL;DR Where the order really matters

Here are some of the most common failures, and how you can break the training loop by getting the placement a little bit wrong. The reason to memorise these is that none of them will raise an exception, over time you'll get a sense for what kind of errors to look for in your training runs, but for the first few times this crib sheet will help you out.

| Line | Wrong position | What breaks |
| --- | --- | --- |
| `model.to(device)` | After `optimiser = ...` | When a dtype conversion is combined (e.g. `model.half()`), `nn.Module.to()` allocates new `nn.Parameter` objects; the optimiser holds references to the discarded originals and applies updates to them instead. |
| `optimiser.zero_grad()` | After `loss.backward()` | Gradients from multiple batches accumulate. Update uses their sum, not the current batch alone. |
| `clip_grad_norm_()` | Before `loss.backward()` | `.grad` is empty. The call is a no-op. |
| `clip_grad_norm_()` | After `optimiser.step()` | Clips gradients already applied. No effect. |
| `scheduler.step()` | Inside batch loop | LR decays `len(loader)` times per epoch instead of once. |
| Omit `model.train()` after `model.eval()` | — | Dropout disabled, BatchNorm frozen. The model trains in eval mode without error. |
| Omit `torch.no_grad()` during validation | — | Autograd graph builds on every validation batch. Memory grows until OOM. |
| Log `loss` instead of `loss.item()` | — | Pins the computation graph in memory for the duration of the logging call. |

Now let's go through each of these in detail.

## The data

There are two parts to the data pipeline in PyTorch: the `Dataset` and the `DataLoader`. The `Dataset` is just a Python object that implements `__len__` (how many elements are in the dataset) and `__getitem__` (which, unsurprisingly, gets an item). It can be a simple wrapper around tensors, or it can load data from disk on demand.

The `DataLoader` wraps a dataset and produces batches.

Each pass through the full dataset is one epoch. With `shuffle=True`, examples are presented in a different order each epoch.

```
1dataset = TensorDataset(X_train, y_train)
2loader  = DataLoader(
3    dataset,
4    batch_size=64,
5    shuffle=True,
6    num_workers=2,
7    pin_memory=True,
8    persistent_workers=True,
9)
```

practice

[PyTorch DataLoader](https://idlemachines.co.uk/questions/dataloader-pyt)

Easy Q342

Wire up a PyTorch DataLoader: batching, shuffling, and iterating.

`TensorDataset` pairs input and label tensors by index. Indexing with `dataset[i]` returns `(X[i], y[i])`. `DataLoader` calls `__getitem__` repeatedly, collates the results into batches, and optionally hands work to background worker processes.

**`num_workers`** spawns separate processes that prefetch batches in parallel with GPU compute. The main process blocks on `.next()` only if a batch is not yet ready. Zero workers means the main process does all loading, which often bottlenecks GPU utilisation on data-heavy tasks. Two to four workers is practical, but the right number depends on CPU count and I/O speed.

**`pin_memory=True`** allocates batch tensors in pinned host memory. The GPU DMA engine can transfer directly from pinned memory without first copying through the kernel buffer, reducing host-to-device transfer time. It only helps when `num_workers > 0` and you're transferring to CUDA.

**`persistent_workers=True`** keeps worker processes alive between epochs. Without it, workers are respawned a

→ [原文存档](https://idlemachines.co.uk/essays/pytorch-training-loop)

---
## 深度分析

### 为什么操作顺序比从业者以为的更重要

训练循环大约只有十行有效代码，但它是 PyTorch 中「顺序敏感度」最高的地方。原文的核心论点是：**几乎所有顺序错误都不会抛异常**——训练照常跑、loss 照常降（或慢降）、显存照常占用，只是模型最终不收敛、结果系统性偏差、或内存缓慢增长直到 OOM。这类错误的危险在于它们是**静默失败（silent failure）**：`clip_grad_norm_` 放在 `loss.backward()` 之前只是对空的 `.grad` 做了一次合法的 no-op；`scheduler.step()` 放进 batch 循环只是让 LR 每 epoch 衰减 `len(loader)` 倍，数值上完全合法。真正的原因是 PyTorch 的状态模型：`.grad` 是**加性累积**的、moment 估计存在于 optimiser 内部、`training` 标志是全局的——每一步操作的语义都依赖于之前操作留下的状态，所以「顺序」不是风格问题，而是**状态机转移的正确性**问题。

### 哪些步骤语义耦合、哪些可以独立重排

把循环拆开看，各步骤的耦合强度差异很大：

- **强耦合链**：`backward() → clip_grad_norm_ → optimiser.step()` 是不可交换的核心管线——clip 必须在梯度填充后、应用前，这是它唯一有意义的窗口。`model.to(device)` 必须在 `optimiser = ...` 之前，因为 optimiser 持有参数的**引用**而非查找逻辑；一旦涉及 dtype 转换（如 `.half()`），`nn.Module.to()` 会分配新的 `nn.Parameter` 对象，旧引用指向被丢弃的原件，更新会写到 ghost 参数上。
- **位置灵活但有语义含义**：`zero_grad()` 放在 batch 开头（step 后）或 step 前皆可——它只是切断上一个 batch 的梯度历史。而「不 reset」本身就是 feature：**gradient accumulation** 正是利用加性累积，把多个 micro-batch 的梯度求和后再 step（配合 `loss / ACCUM_STEPS` 保持 mean reduction），数学上等价于成倍放大的 effective batch size。同一个「错误」，换个意图就是标准技术。
- **正交对**：`model.eval()` 与 `torch.no_grad()` 是**两个独立开关**——eval 模式改变 Dropout/BatchNorm 的前向行为，no_grad 停掉 autograd graph 构建。eval+有梯度可用于 saliency map，train+no_grad 可用于前向检查，标准验证才是两者叠加。
- **作用域错误**：`scheduler.step()` 的正确位置（epoch 级、batch 循环外）不是任意的——它是调度语义的一部分，warmup+cosine 等现代调度器甚至改为 per-step 调用，`ReduceLROnPlateau` 还要传入 `val_loss`。

### 顺序错误的典型静默 bug 清单

原文的 crib sheet 值得内化，因为每一个都在生产训练中真实出现过：

1. **`optimiser.step()` 在 `zero_grad()` 之前（或忘记 zero_grad）**：梯度跨 batch 累积，更新用的是「历史梯度和」而非当前 batch——方向系统性污染，最典型的症状是 loss 下降异常缓慢或震荡。
2. **忘记 `model.train()`**：验证后忘切回训练模式，Dropout 关闭、BatchNorm 冻结 running statistics，模型在「残废的 eval 动力学」下继续训练，无任何报错。
3. **验证时缺 `torch.no_grad()`**：每个 validation batch 都构建 autograd graph 并保留激活，显存随验证集大小增长直到 OOM——常被误诊为「模型太大」。
4. **log 时直接记录 `loss` tensor 而非 `loss.item()`**：持有 tensor 引用就把整张计算图钉在内存里，造成「缓慢泄漏」式的内存增长。
5. **混合精度下的顺序陷阱**：`scaler.unscale_(optimiser)` 必须在 clip 之前、`scaler.step()` 之前——unscale 的位置错了，clip 就在放大 2^16 倍的梯度上做归一化，阈值完全失真。

这类 bug 的共同点是：**异常机制帮不了你，只有对状态流的显式理解才能**。

### 注解式教学对 framework design 的启示

原文的教学法本身值得抽象：它不教你「调 `Trainer.fit()`」，而是把每一行拆开、标注序号、逐行解释它改变了什么状态、放错位置会发生什么。这与 [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md) 的「显式优于魔法」是同一哲学：**魔法封装（如 Keras `.fit()`）以隐藏状态转移为代价换取上手速度，而静默 bug 恰恰藏在被隐藏的转移里**。PyTorch 选择「裸循环」设计，把 zero_grad/step/scheduler 的责任交还给用户，代价就是本文罗列的全部陷阱；收益是 gradient accumulation、per-parameter LR、自定义 backward（`create_graph=True`）这类非标准流程可以自然地改写循环实现，而不是等框架提供钩子。对比 [LLM from scratch 教程](https://github.com/QianJinGuo/wiki-public/blob/main/entities/llm-from-scratch-7-stage-pytorch-tutorial.md) 与 pretraining parallelisms 笔记 可以看到同一取向：理解 invariant（`.grad` 加性、moment 状态、training 标志）比记住 API 顺序更可迁移。实践建议：写训练循环时把「状态被谁持有、被哪一步修改」作为审查清单，而不是凭肌肉记忆排列行序。

## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

