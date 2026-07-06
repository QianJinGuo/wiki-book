# The annotated PyTorch training loop

## Ch01.063 The annotated PyTorch training loop

> 📊 Level ⭐ | 7.1KB | `entities/essays-pytorch-training-loop.md`

# The annotated PyTorch training loop

> **来源**: [The annotated PyTorch training loop](https://idlemachines.co.uk/essays/pytorch-training-loop)

Published Time: 2026-06-20T10:00:00.000Z

Markdown Content:
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

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/essays-pytorch-training-loop.md)

---

