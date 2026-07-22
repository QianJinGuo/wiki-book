---
title: "The annotated PyTorch training loop"
source_url: "https://idlemachines.co.uk/essays/pytorch-training-loop"
ingested: 2026-06-26
type: article
created: 2026-06-26
sha256: 6e253e87da461598292d044ba42e5d7356b8d2ab02933e1a62baf7aabcb2e170
---

# The annotated PyTorch training loop


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

**`persistent_workers=True`** keeps worker processes alive between epochs. Without it, workers are respawned at the start of each epoch, adding fork overhead that becomes measurable at large worker counts.

**`drop_last=True`** discards the final batch if it is smaller than `batch_size`. BatchNorm statistics computed from a batch of two or three samples are noisy so dropping the remainder avoids this. Small cost in terms of dropping the data, but it is often worth it for stability.

Smaller batches produce noisier gradient estimates, which acts as implicit regularisation. Larger batches use more GPU memory but allow more parallelism. One of the most important efficiencies is knowing that powers of two align with tensor core tile sizes (typically 16×16 or 8×16 depending on dtype), so making sure batch sizes and layer dimensions are set to multiples of 8 or 16 is a good idea.

**`.to(device)`** moves a tensor to the target device. For tensors, it is not in-place: it returns a new tensor and leaves the original unchanged. For example, `X_batch.to('cuda')` returns a new tensor on GPU; `X_batch` itself remains on CPU.

## Reproducibility

Setting seeds before constructing the model and loader gives the same results on every run. This is essential in order to reproduce experiments, and make sure model behavior is deterministic. The main areas this impacts the model is in the data loader, and in the initialisation of the model weights.

```
1import random
2import numpy as np
3
4def set_seed(seed: int = 42):
5    torch.manual_seed(seed)
6    torch.cuda.manual_seed_all(seed)
7    np.random.seed(seed)
8    random.seed(seed)
9    torch.backends.cudnn.deterministic = True
10    torch.backends.cudnn.benchmark     = False
11
12set_seed(42)
```

`torch.manual_seed` seeds the CPU generator. `torch.cuda.manual_seed_all` seeds every GPU. NumPy and Python's `random` are independent RNGs that PyTorch does not touch, be careful of this, you might need another random seed for them.

`cudnn.deterministic = True` forces cuDNN to use deterministic convolution algorithms. Some cuDNN kernels are non-deterministic by default for throughput. The deterministic alternatives are slightly slower, but practically it shouldn't matter much during development.

`cudnn.benchmark = False` must be paired with `deterministic = True`. When `benchmark = True`, cuDNN profiles several algorithms per input shape and picks the fastest, a process that itself varies between runs. Fixing it to `False` makes sure you always get the same results.

When `num_workers > 0`, each DataLoader worker has its own RNG state, seeded by the OS when it forks the processes. To make worker randomness reproducible you should pass a `generator` and a `worker_init_fn`:

```
1g = torch.Generator()
2g.manual_seed(42)
3
4loader = DataLoader(
5    dataset,
6    batch_size=64,
7    shuffle=True,
8    num_workers=2,
9    generator=g,
10    worker_init_fn=lambda worker_id: np.random.seed(42 + worker_id),
11)
```

## The model

`nn.Module` provides parameter tracking, device movement, train/eval mode switching, and serialisation. Each instance needs an `__init__` (to register all the submodules) and `forward` (to define the computation).

practice

[ReLU Activation + Backward](https://idlemachines.co.uk/questions/relu)

Easy Q114

Implement a ReLU activation and its backward pass, in numpy, to see what `nn.ReLU` is actually doing.

practice

[Custom Linear Module](https://idlemachines.co.uk/questions/custom-linear-module)

Easy Q328

Implement a custom `nn.Linear` as an `nn.Module`, registering weights and bias as parameters.

```
1class MLP(nn.Module):
2    def __init__(self, in_features, hidden, out_features):
3        super().__init__()
4        self.net = nn.Sequential(
5            nn.Linear(in_features, hidden),
6            nn.ReLU(),
7            nn.Linear(hidden, hidden),
8            nn.ReLU(),
9            nn.Linear(hidden, out_features),
10        )
11
12    def forward(self, x):
13        return self.net(x)
14
15device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
16model  = MLP(in_features=2, hidden=128, out_features=3).to(device)
```

`super().__init__()` is required: it initialises the module registry. Assigning submodules or parameter tensors as attributes in `__init__` registers them automatically. Unregistered plain attributes are excluded from parameter iteration, serialisation, and device movement.

**`.to(device)`** moves all registered parameters and buffers to the target device in-place. Call it before constructing the optimiser. For a device-only move, `nn.Module.to()` modifies each parameter's `.data` attribute in-place and the optimiser's references remain correct. When a dtype conversion is combined (e.g. `.half().to(device)`), `nn.Module.to()` allocates new `nn.Parameter` objects and replaces them in the module's internal registry; the optimiser, constructed before this, retains references to the originals and applies updates to them instead of the converted parameters.

◎ think Why must the model be moved to the device before constructing the optimiser?

**`register_buffer`** is for tensors that should follow the module (move with `.to(device)`, appear in `state_dict`) but are not trained parameters. BatchNorm's `running_mean` and `running_var` are buffers, as is the attention mask in a transformer.

**`model.parameters()`** returns all leaf tensors with `requires_grad=True`. **`model.named_parameters()`** returns the same with names, useful for excluding biases from weight decay or assigning different learning rates to different parts of the model.

Calling `model(x)` invokes `__call__`, not `forward` directly. This is a classic misconception for new users. That wrapper runs forward hooks, then the computation, then backward hooks. The distinction matters when using hooks for instrumentation or gradient modification.

**`torch.compile(model)`** (Only available in PyTorch 2.0+) traces the forward pass and emits optimised Triton/CUDA kernels via the backend. It fuses adjacent element-wise operations, reducing memory traffic. The first forward pass is slow (needs to run compilation) but subsequent ones are 10–30% faster on GPU, sometimes higher on inference-heavy workloads.

note

The PyTorch Parameter There are two things we care about in the `nn.Parameter` class: the values stored in `.data` and the `.grad` attribute. The backward pass accumulates gradients additively into `.grad`; the optimiser reads `.grad` to compute the update and writes the result back to `.data`.

You can also use the parameters without gradients by setting `requires_grad=False`. This is useful for freezing layers, or for inference-only models, or non-trainable parameters.

## Training mode

1

Sets every submodule to training mode. Two common layers change behaviour: `Dropout` applies random masking and rescales, and `BatchNorm` computes statistics from the current batch rather than its stored running estimates.

```
1model.train()                          # [1]
2for X_batch, y_batch in loader:
3    ...
```

`model.train()` sets a flag on the module and all sub-modules. Two common layers read it during their forward pass.

**`Dropout`** samples a Bernoulli mask with probability `p` of zeroing each element, then scales surviving activations by $1 / \left(\right. 1 - p \left.\right)$ to preserve expected magnitude. In eval mode it acts as an identity function. The reason to invert dropout at train time is that it means you don't need to rescale at inference.

**`BatchNorm`** during training computes the mean and variance of the current batch, normalises against them, and updates its stored `running_mean` and `running_var` via exponential moving average. In eval mode it uses those stored estimates instead of the batch statistics.

`LayerNorm`, `GELU`, `ReLU`, and most other layers are unaffected by the training flag and behave identically in both modes. The flag usually only matters if your architecture contains `Dropout` or any `BatchNorm` variant.

Omitting `model.train()` after validation does not raise an exception. The model trains with dropout disabled and BatchNorm using frozen statistics, both of which alter the effective learning dynamics.

note

In eval mode the larger memory reduction comes from `torch.no_grad()`, which disables graph construction entirely: no `grad_fn` is attached to output tensors and no intermediate activations are stored for backward. Used together during validation, they roughly halve memory usage compared to a training-mode forward pass.

## Clearing the gradient buffer

2

Resets every parameter's `.grad` before the next forward pass. PyTorch accumulates gradients additively. Without this call, gradients from the previous batch add to the current one.

```
1for X_batch, y_batch in loader:
2    optimiser.zero_grad()              # [2]
3    ...
```

`optimiser.zero_grad()` resets every parameter's `.grad` attribute before the next forward pass. PyTorch accumulates gradients additively: each `.backward()` call adds to `.grad`, it does not replace it. This behaviour enables gradient accumulation: summing gradients over multiple micro-batches before stepping is equivalent to training with a proportionally larger batch.

```
1# gradient accumulation — effective batch size = batch_size × ACCUM_STEPS
2ACCUM_STEPS = 4
3for i, (X_batch, y_batch) in enumerate(loader):
4    logits = model(X_batch)
5    loss   = criterion(logits, y_batch) / ACCUM_STEPS   # scale to match mean reduction
6    loss.backward()                                       # adds to .grad each time
7    if (i + 1) % ACCUM_STEPS == 0:
8        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
9        optimiser.step()
10        optimiser.zero_grad()
```

Accumulating gradients across multiple small batches and stepping once is mathematically equivalent to training with a batch four times larger, assuming the loss is mean-reduced. At scale, where a full batch does not fit in GPU memory, accumulation is the standard approach.

◎ think Why does PyTorch accumulate gradients rather than replace them on each backward call?

**`zero_grad(set_to_none=True)`** sets `.grad` to `None` rather than filling it with zeros. It is slightly faster (skips the zero-fill pass) and uses less memory (None tensors are deallocated). This is the default in PyTorch 2.0 onwards. Be careful with custom backwards passes where you are reading `.grad` directly.

## The forward pass

3

Runs `forward()` and builds the autograd computation graph. Every operation on a tensor with `requires_grad=True` is recorded: what the inputs were, what the output was, and how to compute the local vector-Jacobian product for backward.

`1logits = model(X_batch)                # [3]`

During the forward pass, PyTorch builds a computation graph that records every operation on tensors with `requires_grad=True`. Each node in the graph represents an operation, storing the input tensors, the output tensor, and the function needed to compute gradients during the backward pass. This allows PyTorch to automatically compute gradients for all parameters with respect to a scalar loss.

Crucially this is a dynamic graph, it's constructed on-the-fly during the forward pass. This means that the graph can change from one forward pass to the next, allowing for more flexible model architectures, such as those with conditional branches or loops, and variable input sizes.

This graph is a directed acyclic graph (DAG) from the loss back to the leaf parameters. During the forward pass, activations from every layer are kept alive in memory for use in the backward pass. For a batch of size $N$ and a network with $L$ layers, the memory cost scales with $O \left(\right. N L \left.\right)$ in the naive case.

**Gradient checkpointing** (`torch.utils.checkpoint.checkpoint`) reduces this. Instead of storing all intermediate activations, it re-runs the forward pass of checkpointed segments during backward to recompute them on demand. Peak activation memory scales with the number of uncheckpointed segments rather than total depth, at the cost of roughly one additional forward pass per checkpointed segment.

```
1from torch.utils.checkpoint import checkpoint
2
3def forward(self, x):
4    x = checkpoint(self.block1, x, use_reentrant=False)
5    x = checkpoint(self.block2, x, use_reentrant=False)
6    return self.head(x)
```

Inside `torch.no_grad()`, no graph is constructed and no activations are stored. Memory usage drops roughly by half compared to a training-mode forward pass.

## The loss

4

Computes the scalar loss. For `CrossEntropyLoss`, this is log-softmax followed by negative log-likelihood, averaged over the batch. The result is a scalar tensor with a `grad_fn`, still connected to the graph.

`1loss = criterion(logits, y_batch)      # [4]`

practice

[Softmax](https://idlemachines.co.uk/questions/softmax)

Easy Q6

Implement softmax: what `CrossEntropyLoss` applies internally.

practice

[Cross-Entropy Loss](https://idlemachines.co.uk/questions/cross-entropy-loss)

Medium Q18

Implement cross-entropy loss from scratch, in numpy, to see the log-sum-exp trick.

The Cross-Entropy loss is a standard choice for multi-class classification problems. It measures the difference between the predicted probability distribution (from the model's logits) and the true distribution (the one-hot encoded labels).

`nn.CrossEntropyLoss` is a composition of two operations: `LogSoftmax` followed by `NLLLoss`. The combined form is more numerically stable than computing them separately, because it avoids materialising the softmax probabilities and then taking their log.

The underlying computation uses the log-sum-exp trick to prevent overflow:

$$
log ⁡ \underset{j}{\sum} e^{z_{j}} = z_{max} + log ⁡ \underset{j}{\sum} e^{z_{j} - z_{max}}
$$

Subtracting $z_{max}$ before exponentiation keeps the values in a safe range. The loss for a single example is then:

$$
\mathcal{L}_{i} = - z_{y_{i}} + log ⁡ \underset{j}{\sum} e^{z_{j}}
$$

and the batch loss is the mean over $N$ examples.

◎ think Why does cross-entropy need the log-sum-exp trick rather than computing softmax directly?

**Common arguments:**

`weight` accepts a 1D tensor of per-class weights, applied to each sample's loss contribution. Use this for class imbalance i.e. upweight rare classes.

`label_smoothing=0.1` distributes a fraction of the probability mass uniformly across all classes rather than concentrating it on the target. The effective target distribution becomes $\left(\right. 1 - \epsilon \left.\right) \cdot \text{one}-\text{hot} + \epsilon / C$. It prevents overconfident pseudo-probabilities and is standard in modern image and language model training.

`ignore_index=-100` masks positions with that label from the loss. Used in sequence modeling to exclude padding and masked tokens.

`reduction='mean'` divides by batch size. `'sum'` does not. Switching between them shifts the effective loss scale and therefore the effective learning rate.

Logging loss with `loss.item()` extracts a Python float and detaches it from the graph. Logging the tensor directly pins the graph in memory for the duration of the logging call. If you're not careful, this can lead to runaway memory growth during training.

## The backward pass

5

Traverses the computation graph from the scalar loss back to every leaf parameter. Populates `.grad` on each parameter via the chain rule. Does not modify weights.

`1loss.backward()                        # [5]`

`backward()` implements reverse-mode automatic differentiation (backpropagation). For a scalar output, a single backward pass computes gradients with respect to all $N$ parameters. Forward-mode differentiation requires $N$ separate passes, one per parameter. At the parameter counts typical of modern networks, reverse mode is the only practical option.

The backward pass walks the computation graph from the loss in reverse topological order. At each node, it applies the backward function (the vector-Jacobian product for that operation) and propagates the result to the node's inputs. At leaf parameters, the result accumulates into `.grad`.

As we said before, the `.grad` attribute accumulates additively. If `.backward()` is called without zeroing gradients first, the new gradients add to whatever was already in `.grad`. Gradient accumulation relies on this behaviour, and we use `zero_grad()` to reset it.

◎ think What does loss.backward() compute, and what does it not do?

**`retain_graph=True`** prevents the graph from being deallocated after backward. Normally the graph is freed immediately because it is assumed to be used once. You need `retain_graph=True` when calling backward multiple times through the same graph (for example, in a GAN where you backpropagate through a shared encoder for both the discriminator and generator losses).

**`create_graph=True`** allows differentiation through the backward pass itself. The backward computation becomes differentiable, enabling higher-order derivatives: Hessian-vector products, MAML-style meta-gradients, or second-order optimisers.

## Gradient clipping

6

Computes the global L2 norm of all parameter gradients. If it exceeds `max_norm`, rescales all gradients proportionally. Called after `backward()`, before `step()`.

```
1torch.nn.utils.clip_grad_norm_(        # [6]
2    model.parameters(), max_norm=1.0
3)
```

`clip_grad_norm_` computes the global norm across all parameters:

$$
\parallel g \parallel_{2} = \sqrt{\underset{i}{\sum} \parallel g_{i} \parallel^{2}}
$$

If $\parallel g \parallel_{2} > \text{max}_\text{norm}$, every gradient tensor is multiplied by $\text{max}_\text{norm} / \parallel g \parallel_{2}$. Relative direction is preserved; only the magnitude is bounded.

◎ think Why does global norm clipping preserve gradient direction, while per-element clipping does not?

Gradient spikes are common in transformer training. Attention softmax can saturate, producing near-one-hot distributions, which propagates large gradient norms to earlier parameters via the chain rule.

Global norm clipping is standard practice: max_norm=1.0 is used in the original GPT-2 paper, most subsequent language model work, and many vision transformer papers. It is less commonly necessary for small MLPs on well-conditioned data.

practice

[Gradient Clipping](https://idlemachines.co.uk/questions/gradient-clipping)

Medium Q338

Implement gradient clipping by global norm: compute the norm, scale if it exceeds the threshold.

`clip_grad_value_` clips individual gradient components to $\left[\right. - \text{clip}_\text{value} , \text{clip}_\text{value} \left]\right.$ rather than the global norm. It does not preserve gradient direction and is less commonly used.

Placing clipping before `backward()` has no effect (`.grad` is empty). Placing it after `step()` clips gradients that have already been applied to weights.

## The weight update

7

Reads `.grad` on every parameter and applies the update rule. Moment estimates are updated. Weights change here and only here.

`1optimiser.step()                       # [7]`

Parameter values change in `step()` and nowhere else. For plain SGD with momentum:

$$
v_{t} = \mu v_{t - 1} + g_{t}
$$

$$
\theta_{t} = \theta_{t - 1} - \eta v_{t}
$$

Adam maintains per-parameter estimates of the first moment (gradient mean) and second moment (gradient variance):

$$
m_{t} = \beta_{1} m_{t - 1} + \left(\right. 1 - \beta_{1} \left.\right) g_{t}
$$

$$
v_{t} = \beta_{2} v_{t - 1} + \left(\right. 1 - \beta_{2} \left.\right) g_{t}^{2}
$$

Both estimates are biased toward zero at initialisation (they start at zero, and early values of $m_{t}$ and $v_{t}$ underestimate the true moments). Bias correction accounts for this:

$$
\left(\hat{m}\right)_{t} = \frac{m_{t}}{\left(\right. 1 - \beta_{1}^{t} \left.\right)}
$$

$$
\left(\hat{v}\right)_{t} = \frac{v_{t}}{\left(\right. 1 - \beta_{2}^{t} \left.\right)}
$$

The weight update is then:

$$
\theta_{t} = \theta_{t - 1} - \frac{\eta \textrm{ } \left(\hat{m}\right)_{t}}{\sqrt{\left(\hat{v}\right)_{t}} + \epsilon}
$$

practice

[Adam Optimizer Step](https://idlemachines.co.uk/questions/adam-step)

Medium Q118

Implement an Adam optimiser step in numpy: bias correction and per-parameter adaptive rates.

practice

[Adam Step (PyTorch)](https://idlemachines.co.uk/questions/adam-step-pyt)

Medium Q335

Implement an Adam step using PyTorch: `torch.optim.Adam` under the hood.

practice

[AdamW Step](https://idlemachines.co.uk/questions/adamw-step)

Medium Q36

Implement an AdamW step: decoupled weight decay applied directly to the weights, not through the gradient.

Default hyperparameters: $\beta_{1} = 0.9$, $\beta_{2} = 0.999$, $\epsilon = 10^{- 8}$. The per-parameter adaptive learning rate makes Adam robust to varying gradient scales across parameters, which matters in deep networks where early and late layers often have gradients of very different magnitudes.

**AdamW** decouples weight decay from the gradient update. Standard Adam with L2 regularisation adds a gradient term $\lambda \theta$ before the update, which then gets scaled by the adaptive step size. AdamW applies weight decay directly to the weights: $\theta_{t} = \left(\right. 1 - \eta \lambda \left.\right) \theta_{t - 1} - \text{Adam}\textrm{ }\text{update}$. The two are not equivalent; AdamW gives more predictable effective regularisation and is now standard for transformer training.

◎ think What is the practical difference between Adam with L2 regularisation and AdamW?

**`fused=True`** (CUDA only): fuses the entire parameter update into a single CUDA kernel per parameter group, avoiding the Python loop and multiple kernel launches. It runs approximately 30–50% faster than the default at large parameter counts.

**`foreach=True`**: uses batched `torch._foreach_*` operations that process all parameters together in vectorised Python loops. It is intermediate between the default and fused in speed, and available on CPU.

The optimiser stores moment state for every parameter. For Adam on a 7B-parameter model, that is 7B float32 tensors for $m$ and 7B for $v$, roughly 56GB of optimiser state at full precision. At that scale, training typically uses 8-bit optimisers (bitsandbytes) or shards state across devices (ZeRO).

## Learning rate schedules

8

Updates the learning rate according to a schedule. Called once per epoch, after `optimiser.step()`, outside the batch loop.

`1    scheduler.step()                   # [8]`

The scheduler modifies the `lr` field of each parameter group in the optimiser. The most common mistake is calling it inside the batch loop:

```
1# wrong — lr decays len(loader) times per epoch instead of once
2for X_batch, y_batch in loader:
3    optimiser.step()
4    scheduler.step()
5
6# correct
7for X_batch, y_batch in loader:
8    optimiser.step()
9scheduler.step()
```

**Cosine annealing** decays the learning rate from `eta_max` to `eta_min` over `T_max` epochs:

$$
\eta_{t} = \eta_{min} + \frac{1}{2} \left(\right. \eta_{max} - \eta_{min} \left.\right) \left(\right. 1 + cos ⁡ \frac{t \pi}{T_{max}} \left.\right)
$$

practice

[LR Schedule](https://idlemachines.co.uk/questions/lr-schedule)

Easy Q339

Wire up a learning rate schedule: cosine annealing with a linear warmup.

In modern large model training, the standard schedule combines a linear warmup with cosine decay. A warmup phase (typically 1–5% of total steps) limits the update magnitude while parameters are far from their trained values. Cosine decay reduces the rate for the remaining steps.

```
1# linear warmup + cosine decay
2# (using HuggingFace's implementation as reference)
3from transformers import get_cosine_schedule_with_warmup
4
5scheduler = get_cosine_schedule_with_warmup(
6    optimiser,
7    num_warmup_steps=100,
8    num_training_steps=10_000,
9)
10scheduler.step()   # called per step, not per epoch, with this scheduler
```

`ReduceLROnPlateau` is the exception to the no-argument rule. It takes a metric value and reduces the learning rate only when the metric has stopped improving for `patience` epochs. It must be called with the validation loss: `scheduler.step(val_loss)`.

## Validation

9

`model.eval()` changes layer behaviour. `torch.no_grad()` stops graph construction. They are independent operations; you need both for validation.

```
1model.eval()                           # [9]
2with torch.no_grad():                  # [10]
3    val_logits = model(X_val)
4    val_loss   = criterion(val_logits, y_val)
```

`model.eval()` and `torch.no_grad()` are independent operations.

`model.eval()` sets `self.training = False` on every module. **BatchNorm** switches from computing batch statistics to using its stored `running_mean` and `running_var`. **Dropout** switches from sampling Bernoulli masks to the identity function. No other standard layers are affected.

`torch.no_grad()` disables the construction of the autograd graph entirely. No `grad_fn` is attached to tensors produced inside the context; no intermediate activations are saved. This roughly halves memory usage compared to a training-mode forward pass and makes computation slightly faster (fewer bookkeeping operations per op).

The two are independent choices:

*   Eval mode, graph enabled: valid for computing input gradients (saliency maps, adversarial examples).
*   Train mode, no_grad: for forward-pass checks that don't require gradients.
*   Both together: the standard validation pass.

◎ think Is model.eval() the same as torch.no_grad()?

**`torch.inference_mode()`** is a stricter form of `no_grad()`. Tensors created inside the context have `is_inference() == True`, which prevents them from participating in a backward pass even if they escape the context manager. It removes a few additional checks in the autograd engine and runs about 10% faster than `no_grad()`.

## Logging

Track training and validation metrics using `loss.item()`, not `loss`. Calling `.item()` extracts a Python float and detaches from the graph; holding a reference to the tensor keeps the full backward graph alive until the next call.

```
1for epoch in range(NUM_EPOCHS):
2    model.train()
3    running_loss = 0.0
4    for X_batch, y_batch in loader:
5        optimiser.zero_grad()
6        loss = criterion(model(X_batch), y_batch)
7        loss.backward()
8        optimiser.step()
9        running_loss += loss.item()
10    train_loss = running_loss / len(loader)
11
12    model.eval()
13    with torch.no_grad():
14        val_logits = model(X_val)
15        val_loss   = criterion(val_logits, y_val).item()
16        val_acc    = (val_logits.argmax(1) == y_val).float().mean().item()
17
18    print(f'epoch {epoch:3d}  train {train_loss:.4f}  val {val_loss:.4f}  acc {val_acc:.3f}')
```

## Checkpointing

`torch.save` writes a checkpoint file; `torch.load` reads it back. Checkpoints allow a training run to survive crashes and preemption.

```
1# save
2torch.save({
3    'epoch':                epoch,
4    'model_state_dict':     model.state_dict(),
5    'optimiser_state_dict': optimiser.state_dict(),
6    'scheduler_state_dict': scheduler.state_dict(),
7    'val_loss':             val_loss,
8}, 'checkpoint.pt')
9
10# resume
11checkpoint = torch.load('checkpoint.pt', map_location=device)
12model.load_state_dict(checkpoint['model_state_dict'])
13optimiser.load_state_dict(checkpoint['optimiser_state_dict'])
14scheduler.load_state_dict(checkpoint['scheduler_state_dict'])
15start_epoch = checkpoint['epoch'] + 1
```

`state_dict()` returns an ordered dictionary of parameter and buffer tensors. It does not include the class definition, so the model class must be defined in scope before calling `load_state_dict`.

The optimiser state must be saved alongside the model to resume training correctly. For Adam, the state includes per-parameter moment estimates $m_{t}$ and $v_{t}$, which take several hundred steps to warm up from zero. Resuming without them is equivalent to restarting the optimiser cold, which typically produces a loss spike at the resume point.

`map_location=device` handles the common case where the checkpoint was saved on a different GPU than the one loading it.

The standard pattern saves only when validation loss improves, so the saved weights correspond to the best-generalising epoch rather than the final one:

```
1best_val_loss = float('inf')
2
3for epoch in range(NUM_EPOCHS):
4    # ... training loop ...
5
6    model.eval()
7    with torch.no_grad():
8        val_loss = criterion(model(X_val), y_val).item()
9
10    if val_loss < best_val_loss:
11        best_val_loss = val_loss
12        torch.save(model.state_dict(), 'best_model.pt')
```

To restore the best model after training: `model.load_state_dict(torch.load('best_model.pt', map_location=device))`.

## GPU efficiency

While we're working through the nitty-gritty of the training loop, it's worth spending a few minutes thinking about some of the basic GPU optimisation techniques. None of these exactly count as "melting the hardware" but they're almost all entirely free speed.

### Device placement

Put the model and data on the _same_ GPU, minimises the data transfer overhead.

```
1device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
2
3model = MLP(in_features=2, hidden=128, out_features=3).to(device)
4# construct optimiser AFTER moving model — it captures parameter references
5optimiser = torch.optim.Adam(model.parameters(), lr=1e-3)
6
7# per-batch: move data to device
8for X_batch, y_batch in loader:
9    X_batch = X_batch.to(device, non_blocking=True)
10    y_batch = y_batch.to(device, non_blocking=True)
```

`non_blocking=True` initiates the host-to-device transfer asynchronously and returns immediately. The GPU can begin work from a previous batch while the new batch is still transferring. The overlap only helps when `pin_memory=True` in the DataLoader; unpinned memory cannot be transferred asynchronously.

### Mixed precision

Modern GPUs have dedicated tensor cores that execute float16 (and bfloat16) matrix multiplications 4–8× faster than float32 on the same hardware. Mixed precision training keeps weights in float32 but runs the forward and backward passes in float16.

This makes the computation more efficient, but float16 has a much smaller dynamic range than float32, so small gradient values underflow to zero, producing incorrect updates. The compromise is to maintain the weights in float32, where accumulated rounding errors remain within the float32 dynamic range.

```
1scaler = torch.amp.GradScaler('cuda')
2
3for X_batch, y_batch in loader:
4    optimiser.zero_grad()
5
6    with torch.amp.autocast('cuda', dtype=torch.float16):
7        logits = model(X_batch)
8        loss   = criterion(logits, y_batch)
9
10    scaler.scale(loss).backward()           # backward in float16
11    scaler.unscale_(optimiser)              # unscale before clipping
12    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
13    scaler.step(optimiser)                  # step only if no inf/nan
14    scaler.update()                         # adjust scale factor
```

`torch.amp.autocast` and `torch.amp.GradScaler` are the current API (PyTorch 2.0+). The older `from torch.cuda.amp import autocast, GradScaler` still works but is deprecated.

**Why GradScaler:** float16 has a much smaller dynamic range than float32. Small gradient values underflow to zero, producing incorrect updates. GradScaler multiplies the loss by a large scale factor (typically $2^{16}$) before backward, keeping gradient magnitudes in the float16 range. Before the optimiser step, gradients are divided back to their true scale. If an overflow is detected (inf or nan in any gradient), the step is skipped and the scale factor is reduced.

**bfloat16** (`dtype=torch.bfloat16`) has the same exponent range as float32 but fewer mantissa bits, so it does not underflow and does not need GradScaler. It is the preferred dtype on recent hardware (A100, H100, TPUs).

◎ think Why does bfloat16 not need GradScaler, but float16 does?

```
1with torch.amp.autocast('cuda', dtype=torch.bfloat16):
2    logits = model(X_batch)
3    loss   = criterion(logits, y_batch)
4
5loss.backward()                # no scaler needed
6optimiser.step()
```

### DataLoader pipeline

For GPU training, the bottleneck is often not the GPU but the data pipeline feeding it. The DataLoader with `num_workers=4, pin_memory=True, persistent_workers=True, prefetch_factor=2` keeps the GPU fed without stalling. `prefetch_factor=2` (the default) means each worker pre-fetches two batches beyond what has been consumed.

`torch.backends.cudnn.benchmark = True` runs a short profiling pass on the first batch to determine the fastest convolution algorithm for your specific input shape. Subsequent batches use that cached choice. Do not use this if input shapes vary between batches; the profiling overhead is incurred again for each new shape.

### Compilation

`1model = torch.compile(model)`

Available in PyTorch 2.0 and above, `compile` traces the forward pass and emits optimised Triton kernels via the Inductor backend. The main benefit is operation fusion: adjacent element-wise operations (activation + dropout + residual add, for example) are merged into a single kernel, reducing memory reads and writes. Typical speedups are 10–30% on GPU training, higher for inference workloads and architectures with many small ops.

`mode='max-autotune'` runs additional profiling to choose the best kernel for each operation. Compilation takes longer, but the resulting model is faster, and the cost amortises over long training runs.

The first forward pass triggers compilation and is slow. `torch._dynamo.reset()` clears the cache if you need to recompile (e.g., after changing the model structure).

### The efficient loop

```
1device = torch.device('cuda')
2model  = torch.compile(MLP(...).to(device))
3
4torch.backends.cudnn.benchmark = True
5
6for epoch in range(NUM_EPOCHS):
7    model.train()
8    for X_batch, y_batch in loader:
9        X_batch = X_batch.to(device, non_blocking=True)
10        y_batch = y_batch.to(device, non_blocking=True)
11
12        optimiser.zero_grad(set_to_none=True)
13
14        with torch.amp.autocast('cuda', dtype=torch.bfloat16):
15            logits = model(X_batch)
16            loss   = criterion(logits, y_batch)
17
18        loss.backward()                                        # no scaler: bf16 doesn't underflow
19        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
20        optimiser.step()
21
22    scheduler.step()
23
24    model.eval()
25    with torch.inference_mode():
26        val_logits = model(X_val.to(device))
27        val_loss   = criterion(val_logits, y_val.to(device))
```

practice

[Train a Classifier](https://idlemachines.co.uk/questions/train-classifier)

Hard Q343

Put it all together: train a classifier on a synthetic dataset and hit a target accuracy.

## The complete annotated script

The same loop, with every line referenced.

1

Raw input tensor, shape `(N, features)`. For the spiral dataset, N=2000, features=2.

2

Integer class indices, shape `(N,)`. Not one-hot: `CrossEntropyLoss` expects indices directly.

3

`TensorDataset` pairs inputs and labels by index. `__getitem__` returns `(X[i], y[i])`.

4

`DataLoader` handles batching, shuffling each epoch, and optional parallel prefetching via `num_workers`.

5

`nn.Module` subclass. Register submodules in `__init__`; define the computation in `forward`.

6

`.to(device)` moves all parameters and buffers. Do this before constructing the optimiser.

7

`CrossEntropyLoss` = LogSoftmax + NLLLoss. Pass raw logits, not softmax outputs.

8

Adam maintains per-parameter moment estimates. `model.parameters()` supplies the tensors to optimise.

9

Cosine annealing scheduler. `scheduler.step()` adjusts `lr` in the optimiser's param groups.

10

`model.train()`: dropout masks active, batchnorm uses batch statistics.

11

`zero_grad()`: clears `.grad`. PyTorch accumulates by default; without this, gradients compound across batches.

12

Forward pass: builds the autograd graph. Every op records inputs and its backward function.

13

Loss: scalar tensor, still in the graph. `grad_fn` is the entry point for backward.

14

`backward()`: reverse-mode AD. Populates `.grad` on every leaf parameter. Weights unchanged.

15

Gradient clipping: global norm rescale. Prevents spikes from destabilising training.

16

`optimiser.step()`: reads `.grad`, applies Adam update, updates moment estimates. Weights change.

17

`scheduler.step()`: adjusts lr. Once per epoch, after `optimiser.step()`, outside the batch loop.

18

`model.eval()`: dropout pass-through, batchnorm uses running statistics.

19

`torch.no_grad()` (or `inference_mode()`): no graph construction. Faster, lower memory.

```
1import torch
2import torch.nn as nn
3from torch.utils.data import DataLoader, TensorDataset
4
5# ── data ──────────────────────────────────────────────────────────────────────
6X_train = torch.randn(2000, 2)                                     # [1]
7y_train = make_labels(X_train)                                     # [2]
8
9dataset = TensorDataset(X_train, y_train)                          # [3]
10loader  = DataLoader(dataset, batch_size=64, shuffle=True,         # [4]
11                     num_workers=2, pin_memory=True)
12
13# ── model ──────────────────────────────────────────────────────────────────────
14class MLP(nn.Module):                                              # [5]
15    def __init__(self, in_features, hidden, out_features):
16        super().__init__()
17        self.net = nn.Sequential(
18            nn.Linear(in_features, hidden), nn.ReLU(),
19            nn.Linear(hidden, hidden),      nn.ReLU(),
20            nn.Linear(hidden, out_features),
21        )
22    def forward(self, x):
23        return self.net(x)
24
25model = MLP(in_features=2, hidden=128, out_features=3).to(device)  # [6]
26
27# ── loss, optimiser, scheduler ────────────────────────────────────────────────
28criterion = nn.CrossEntropyLoss()                                  # [7]
29optimiser = torch.optim.Adam(model.parameters(), lr=1e-3)          # [8]
30scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(            # [9]
31    optimiser, T_max=100
32)
33
34# ── training loop ─────────────────────────────────────────────────────────────
35for epoch in range(100):
36
37    model.train()                                                   # [10]
38
39    for X_batch, y_batch in loader:
40
41        optimiser.zero_grad()                                       # [11]
42
43        logits = model(X_batch)                                     # [12]
44
45        loss = criterion(logits, y_batch)                           # [13]
46
47        loss.backward()                                             # [14]
48
49        torch.nn.utils.clip_grad_norm_(                             # [15]
50            model.parameters(), max_norm=1.0
51        )
52
53        optimiser.step()                                            # [16]
54
55    scheduler.step()                                                # [17]
56
57    # ── validation ────────────────────────────────────────────────────────────
58    model.eval()                                                    # [18]
59    with torch.no_grad():                                           # [19]
60        val_logits = model(X_val)
61        val_loss   = criterion(val_logits, y_val)
62        val_acc    = (val_logits.argmax(1) == y_val).float().mean()
```

