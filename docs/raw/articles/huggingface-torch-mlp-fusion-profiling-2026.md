---
title: "Profiling in PyTorch (Part 2): From nn.Linear to a Fused MLP"
source_url: "https://huggingface.co/blog/torch-mlp-fusion"
source: huggingface
author: "Aritra Roy Gosthipatya, Remi Ouazan Reboul, Sergio Paniego, Pedro Cuenca, Sayak Paul"
publish_date: "2026-06-11"
ingested: "2026-06-12"
type: article
tags: [pytorch, profiling, ml-engineering, model-architecture, optimization, kernel-fusion]
source_type: newsletter
sha256: "702c7ed581e5ef051b3211d6e30a9127bad90205a41d518c60a01c4d1d07ac53"
---

# Profiling in PyTorch (Part 2): From nn.Linear to a Fused MLP

URL: https://huggingface.co/blog/torch-mlp-fusion


Published Time: 2026-06-11T00:00:00.707Z

Markdown Content:
[Back to Articles](https://huggingface.co/blog)

[![Image 1: Aritra Roy Gosthipaty's avatar](https://cdn-avatars.huggingface.co/v1/production/uploads/608aabf24955d2bfc3cd99c6/-YxmtpzEmf3NKOTktODRP.jpeg)](https://huggingface.co/ariG23498)

[![Image 2: Rémi Ouazan Reboul's avatar](https://cdn-avatars.huggingface.co/v1/production/uploads/6123945a0ed258ebc83f3d56/8wMHFQHEV24G_ljl4kPxQ.jpeg)](https://huggingface.co/ror)

[![Image 3: Sergio Paniego's avatar](https://cdn-avatars.huggingface.co/v1/production/uploads/61929226ded356549e20c5da/ONUjP2S5fUWd07BiFXm0i.jpeg)](https://huggingface.co/sergiopaniego)

[![Image 4: Pedro Cuenca's avatar](https://cdn-avatars.huggingface.co/v1/production/uploads/1617264212503-603d25b75f9d390ab190b777.jpeg)](https://huggingface.co/pcuenq)

[![Image 5: Sayak Paul's avatar](https://cdn-avatars.huggingface.co/v1/production/uploads/1649681653581-5f7fbd813e94f16a85448745.jpeg)](https://huggingface.co/sayakpaul)

[![Image 6: Thumbnail of the blog post](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/thumbnail.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/thumbnail.png)

In the [first part of this series "Profiling in PyTorch"](https://huggingface.co/blog/torch-profiler), we used `torch.add(torch.matmul(x, w), b)` to learn how to read PyTorch profiler traces. We also discussed several other topics that came our way - the CPU dispatch chain, launch overhead, the difference between an overhead-bound and a compute-bound regime, and some internals of `torch.compile`.

In the second iteration (this blog post), we climb one rung up the ladder. We replace the hand-written matmul-add pair with an `nn.Linear` (with `bias=True`). This is the building block every deep learning model uses. We then stack three of them (specific to our example), with an activation in between, to form a Multilayer Perceptron (MLP) block.

> The scripts for this blog post live here: [`02_linear.py`](https://huggingface.co/datasets/ariG23498/profiling-pytorch/blob/main/02_linear.py), [`03_simple_mlp.py`](https://huggingface.co/datasets/ariG23498/profiling-pytorch/blob/main/03_simple_mlp.py), and [`03_kernels_mlp.py`](https://huggingface.co/datasets/ariG23498/profiling-pytorch/blob/main/03_kernels_mlp.py). Like before, it helps to open them in a separate tab and walk through the code as you read. We use an `NVIDIA A100-SXM4-80GB` GPU to run the scripts. It is really easy to set up a GPU on the Hugging Face infrastructure and experiment with the scripts using [Dev Mode with Spaces](https://huggingface.co/docs/hub/spaces-dev-mode). One could also run the scripts with the [Hugging Face Jobs pipeline](https://huggingface.co/docs/huggingface_hub/en/guides/jobs).

Before we begin, a quick recap of two ideas we will lean on repeatedly:

1.   A GPU **kernel** is a program that runs in parallel on many threads of the GPU.
2.   The CPU **schedules and launches** these kernels. Most of the PyTorch overhead you see in a profiler trace is this scheduling work.

## [](http://huggingface.co/blog/torch-mlp-fusion#from-matmul-add-to-linear) From matmul-add to Linear

`nn.Linear` is a module wrapper around the same matrix multiplication and addition we already profiled in [Part 1](https://huggingface.co/blog/torch-profiler). The only difference is that it owns its weight and bias as parameters and exposes a `forward` method that PyTorch users have grown familiar with.

```
# bias=True would truly emulate the multiplication and addition
# operations we have seen in part 1 of the series
linear_layer = nn.Linear(in_dim, out_dim, bias=True)
y = linear_layer(x)
```

The operation at hand can be written as:

```
y = x @ w.T + b
```

Where `x` is the input, `w` is the weight and `b` is the bias. Let's run [`02_linear.py`](https://huggingface.co/datasets/ariG23498/profiling-pytorch/blob/main/02_linear.py) and check the profile.

```
uv run 02_linear.py --batch 1024 --in_dim 32 --out_dim 64
uvx trace-util traces -b traces
```

> [`trace-util`](https://x.com/ariG23498/status/2054811716727517374) is a utility that will sync your traces to a [Hugging Face bucket](https://huggingface.co/storage) and then provide the [Preffeto URLs](https://perfetto.dev/) on your terminal.

| [![Image 7: PyTorch profiler trace of an `nn.Linear` forward pass: three short Profile Steps and `linear_fwd` annotations on the CPU lane, a tiny kernel on the GPU lane, and a long `cudaDeviceSynchronize` bar at the end](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/linear-profile-trace.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/linear-profile-trace.png) |
| --- |
| Figure 1: Profiler trace of `nn.Linear` |

Figure 1 shows the profiler trace of a forward call of the linear layer. We trace the `forward` call of the linear layer with a similar `schedule` setup as the previous traces, with `wait=1`, `warmup=1` and `active=3`. This is why we see three Profile Steps in the CPU and GPU lanes.

### [](http://huggingface.co/blog/torch-mlp-fusion#what-is-the-transpose-doing) What is the transpose doing?

| [![Image 8: Zoomed in CPU dispatch chain showing the aten::t transpose op nested before aten::addmm inside aten::linear, with no matching activity on the GPU lane](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/transpose-cpu-dispatch.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/transpose-cpu-dispatch.png) |
| --- |
| Figure 2: The transpose CPU row |

If we zoom into the profiler trace, as we do in Figure 2, we notice an `aten::t` (transpose) op before the `aten::addmm` (multiplication and addition) op. We can already figure out that `nn.Linear` transposes the weight parameter and then multiplies it with the input. This is the reason we see an `aten::t` op.

An important thing to notice is that `aten::t` does not really copy or reorganize data: it only rewrites tensor metadata (shape and stride) on the CPU to represent the transposed matrix. It does not launch a kernel on the GPU. One can verify this two ways: by looking at the GPU lane in the trace, or by checking the `aten::t` row in the profiler table and the time it took on CUDA.

### [](http://huggingface.co/blog/torch-mlp-fusion#why-are-there-no-separate-mul-and-add-kernels) Why are there no separate `mul` and `add` kernels?

| [![Image 9: Profiler trace of the linear layer with the dispatch chain highlighted, showing aten::linear, aten::t and aten::addmm but no separate aten::add op](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/no-aten-add.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/no-aten-add.png) |
| --- |
| Figure 3: No `aten::add` in the profile of a linear layer |

There is no `aten::add` (the bias addition) in the dispatch chain of the linear layer, as seen in Figure 3. This is because the bias addition has been _folded_ into the matrix multiplication kernel, using what is called an **epilogue**.

An **epilogue** is a small computation that a GEMM (GEneral Matrix Multiply) kernel does at the very end, just before it writes its result back to HBM (High Bandwidth Memory, the GPU's main memory). Adding a bias, applying an activation, or scaling by a constant are all classic epilogues. The point of an epilogue is to avoid loading or writing to HBM a second time, since memory traffic makes an operation expensive.

`nn.Linear` calls `torch.nn.functional.linear`, which, in turn, calls `aten::linear`. `aten::linear` looks at the inputs, notices that a bias was passed, and dispatches `aten::addmm(bias, x, weight)` instead of doing a matmul and an add separately. `addmm` computes:

```
out = x @ weight.T + bias
```

The cuBLAS GEMM kernel that runs on the GPU has a bias-add variant built in, and that's the kernel `aten::addmm` picks. The add never appears as a separate kernel because it is **part of the matmul kernel's writeback**, which is exactly what an epilogue is.

This is the moment to notice something subtle. The kernel you saw in [Part 1 under `--compile`](https://huggingface.co/blog/torch-profiler#did-we-fuse-the-matmul-and-add-kernels-into-one) (`addmm`) is the kernel that eager `nn.Linear` already uses. There is nothing left for `torch.compile` to fuse here, which is the next thing we will verify.

### [](http://huggingface.co/blog/torch-mlp-fusion#can---compile-help-a-single-linear) Can --compile help a single Linear?

Let's compile the forward call and look at the profiler trace. (The profiler trace is visualized in the [next section](http://huggingface.co/blog/torch-mlp-fusion#where-did-the-transpose-go-kernel-layouts-and-pre-ops))

```
uv run 02_linear.py --batch 1024 --in_dim 32 --out_dim 64 --compile
uvx trace-util traces -b traces
```

If you compare the eager and compiled traces for a single `nn.Linear`'s `forward`, you will find:

*   The same cuBLAS GEMM kernel on the GPU.
*   The same `aten::addmm` op on the CPU.
*   A few extra rows on the CPU lane unique to compile.

This is worth internalizing. A common reflex is to reach for `torch.compile` whenever a model feels slow. For a single GEMM-with-bias, compile has very little to do. This is not a bug, this is just that compile needs more than one operation to possibly do any fusing. Let's prove that by [looking at an MLP](http://huggingface.co/blog/torch-mlp-fusion#stacking-two-linears-the-mlp).

### [](http://huggingface.co/blog/torch-mlp-fusion#where-did-the-transpose-go-kernel-layouts-and-pre-ops) Where did the transpose go? Kernel layouts and pre-ops

A careful reader of the two traces (eager vs compile) will notice that the eager CPU dispatch chain has more in it than the compiled one.

| [![Image 10: Eager CPU dispatch chain with the aten::t transpose and aten::addmm boxed separately under aten::linear](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/eager.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/eager.png) |
| --- |
| Figure 4: Eager dispatch chain where `aten::linear` walks through `aten::t` (transpose) and then `aten::addmm` |

| [![Image 11: Compiled CPU dispatch chain showing a Torch-Compiled Region and a single aten::addmm call, with no transpose op](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/compile.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/compile.png) |
| --- |
| Figure 5: Compiled dispatch chain where `aten::addmm` is called directly, with no transpose |

The eager CPU dispatch chain inside `aten::linear` is `aten::t` followed by `aten::addmm` (Figure 4). To understand what `aten::t` actually does, we need a quick detour into _strides_ and _views_.

A tensor stores its data as one flat, contiguous run of numbers in memory. The `shape` and `stride` are metadata that sit on top of that run and tell PyTorch how to walk it: a stride of `(s0, s1)` means "step `s0` elements to move one row, step `s1` to move one column". Change the metadata and you get a different _view_ of the _same_ raw data, with no copy:

```
>>> M = torch.tensor([[0, 1],
...                   [2, 3],
...                   [4, 5]])
>>> M.shape, M.stride()
(torch.Size([3, 2]), (2, 1))   # two steps per row, one step per column

>>> T = M.t()                  # transpose
>>> T.shape, T.stride()
(torch.Size([2, 3]), (1, 2))   # shape and stride swapped, data untouched
>>> T
tensor([[0, 2, 4],
        [1, 3, 5]])
>>> T.flatten()                # forced to materialize, so the data is reordered
tensor([0, 2, 4, 1, 3, 5])
```

`M.t()` did not move a single number. It returned a new view whose strides are swapped, so reading it row-by-row now walks the original buffer `0, 1, 2, 3, 4, 5` in transposed order. The underlying data is identical; only the metadata differs.

This is exactly what `aten::t` does inside the linear layer: it does not allocate a new tensor or copy any data, it produces a _view_ of the weight with rewritten strides.

As we can see in Figure 5, compile did not remove a GPU kernel: it removed the _CPU overhead_ of dispatching that view. Inductor traced through the view chain at compile time, computed the resulting strides once, and emitted a direct `aten::addmm` call with those strides hard-coded. A few microseconds of CPU work disappear while the GPU does identical math.

As one would expect, when the input data violates the strides precomputed by the compiler, it will throw an error.

If you look at the GPU lane in both traces, there is exactly one kernel per forward, and it is the _same_ kernel both times:

```
cutlass_80_wmma_tensorop_bf16_s161616gemm_bf16_32x32_32x1_tn_align8
```

If no transpose kernel ran, who taught the GEMM to read the weight matrix in transposed order? The answer is in the kernel's name. Look at the suffix:

```
cutlass_80_wmma_tensorop_bf16_s161616gemm_bf16_32x32_32x1_tn_align8
                                                          ^^
```

That `tn` is the layout descriptor. cuBLAS and CUTLASS precompile a _separate kernel binary_ for each combination of input layouts.

`n` (non-transposed) and `t` (transposed) describe how a kernel walks its input during the inner loop. The dispatcher's job is to look at the input strides, decide which suffix combination matches, and pick the right precompiled kernel.

> The kernel name in a profiler trace is a hash dump of the kernel's identity. If two runs show the same kernel name, the GPU is doing the same work. If they differ (e.g., `_tn_` vs `_nn_`, `bf16` vs `fp16`, or `s16816gemm` vs `s161616gemm`) then the GPU is doing different work, and the dispatcher took a different branch. Learning to read this name is one of the most useful habits when comparing traces.

## [](http://huggingface.co/blog/torch-mlp-fusion#stacking-three-linears-the-mlp) Stacking three Linears: the MLP

In this section, we will profile a Multilayer Perceptron (MLP). To make this more interesting, we will profile a feed-forward network with the GeGLU activation variant (which is quite heavily used in practice). This is also our way of paying tribute to one of the greatest lines ever written in the history of deep learning research (Figure 6).

| [![Image 12: Conclusions section of the GLU Variants Improve Transformer paper, with the closing sentence attributing the architectures' success to divine benevolence highlighted](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/geglu-paper.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/geglu-paper.png) |
| --- |
| Figure 6: The conclusion section of the [GLU Variants Improve Transformer](https://arxiv.org/abs/2002.05202) paper. |

```
class SimpleGeGLUMLP(nn.Module):
    def __init__(self, dim, hidden):
        super().__init__()
        self.gate_proj = nn.Linear(dim, hidden, bias=False)
        self.up_proj = nn.Linear(dim, hidden, bias=False)
        self.down_proj = nn.Linear(hidden, dim, bias=False)

    def forward(self, x):
        g = self.gate_proj(x)
        u = self.up_proj(x)
        h = F.gelu(g, approximate="tanh")
        m = h * u
        y = self.down_proj(m)
        return y
```

You will find the entire script here: [`03_simple_mlp.py`](https://huggingface.co/datasets/ariG23498/profiling-pytorch/blob/main/03_simple_mlp.py). Execute it like so:

```
uv run 03_simple_mlp.py --batch 64 --seq 128 --dim 768 --hidden 3072
uvx trace-util traces -b traces
```

Before we open the trace, let's think together about what we should expect to see. The `forward` function does a fair amount of computation, but most of it is already familiar to us.

We should expect three `aten::linear` dispatches, one for each `nn.Linear` layer. We should also expect two pointwise kernel launches, one for the GeLU and one for the multiplication. Forming this expectation before looking is the single most useful habit in the profiling journey: you read the trace to _confirm or break_ a guess, not to form one from scratch.

| [![Image 13: Profiler trace of the GeGLU MLP forward pass, with five boxed groups on the CPU lane labelled linear, linear, gelu, mul, linear](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/simple-mlp-eager.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/simple-mlp-eager.png) |
| --- |
| Figure 7: The profiler trace for a GeGLU MLP |

| [![Image 14: Occupancy Queries highlighted in the linear projection traces](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/occupancy-queries.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/occupancy-queries.png) |
| --- |
| Figure 8: The occupancy queries highlighted in the linear projection CPU lane |

From Figure 7 we can pat ourselves on the back, as our intuition was correct. Per forward pass (one `mlp_fwd`), the GPU runs exactly 5 kernels. Figure 8 highlights the "occupancy query" as seen in the CPU lane for the linear projection layers.

| Op | CPU op | GPU kernel | launches |
| --- | --- | --- | --- |
| `gate_proj` | `aten::linear` | `ampere_bf16_s16816gemm_bf16_128x128_...` | occupancy query + cudaLaunchKernel |
| `up_proj` | `aten::linear` | `ampere_bf16_s16816gemm_bf16_128x128_...` | occupancy query + cudaLaunchKernel |
| `gelu` | `aten::gelu` | `vectorized_elementwise_kernel<4, GeluCUDAKernelImpl...>` | cudaLaunchKernel |
| `h * u` | `aten::mul` | `vectorized_elementwise_kernel<4, ...MulFunctor...>` | cudaLaunchKernel |
| `down_proj` | `aten::linear` | `ampere_bf16_s16816gemm_bf16_128x256_...` | occupancy query + cudaLaunchKernel |

The three GEMMs each do an extra `cudaOccupancyMaxActiveBlocksPerMultiprocessor` call before the launch. We have a separate section on this in Part 1, [you can find it here](https://huggingface.co/blog/torch-profiler#why-does-matmul-have-an-extra-cuda-runtime-call). That is cuBLAS sizing the grid. The pointwise ops (GeLU and mul) launch directly, with no occupancy query. So "a linear" is actually query + launch, while "a pointwise op" is just launch.

| [![Image 15: Profiler table for the GeGLU MLP listing op names and their CUDA times, where metadata ops like aten::transpose and aten::as_strided show 0.000us of CUDA time](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/simple-mlp-table.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/simple-mlp-table.png) |
| --- |
| Figure 9: The table shows that some ops launch zero kernels |

The `aten::t`, `aten::transpose`, `aten::reshape`, `aten::view`, `aten::as_strided`, and `aten::_unsafe_view` ops launch zero kernels. They show `0.000us` of CUDA time in the table (Figure 9) because they only rewrite tensor metadata (shape and stride) on the CPU. A reader scanning the table sees around six op names per linear, but only one of them (`mm`) ever reaches the GPU.

### [](http://huggingface.co/blog/torch-mlp-fusion#why-are-there-two-types-of-gemm-kernels) Why are there two types of GEMM kernels?

The MLP flattens `[batch, seq, dim]` to `[batch * seq, dim]` for the matmul. In our command-line invocation we used 64 for `batch` and 128 for `seq`, so that's where the `8192` (`batch * seq = 64 * 128`) below comes from.

From the trace:

| Linear | `aten::mm` input dims | M·K·N | cuBLAS kernel | avg CUDA |
| --- | --- | --- | --- | --- |
| `gate_proj` | `[8192,768] x [768,3072]` | `8192·768·3072` | `…128x128…stages_32x5_tn` | 0.19ms |
| `up_proj` | `[8192,768] x [768,3072]` | `8192·768·3072` | `…128x128…stages_32x5_tn` | 0.19ms |
| `down_proj` | `[8192,3072] x [3072,768]` | `8192·3072·768` | `…128x256…stages_64x3_tn` | 0.17ms |

All three GEMMs have the same FLOP count, `2·8192·768·3072 ≈ 38.7 GFLOP` each, yet `down_proj` is about `10%` faster. Same work, different shape (`N=768` instead of `3072`), so cuBLAS picks a different tile (`128×256`, with a deeper `stages_64x3` pipeline) that gets better reuse for that shape.

> If you want to learn more about tiling in depth, [here is a great resource](https://alvinwan.com/how-to-tile-matrix-multiplication/) to get started with.

This is exactly why the table had two GEMM rows (Figure 9): the `128x128` row is gate+up and the `128x256` row is down.

### [](http://huggingface.co/blog/torch-mlp-fusion#what-does-torchcompile-do) What does `torch.compile` do?

Before compiling the `forward` method and visualizing it, let's do the mental exercise again of asking ourselves what we expect to see in the trace. This is a fun experiment, and an important one to repeat every time you profile something yourself. Always build on your intuition, and the moment something does not match, stop and figure out why.

```
uv run 03_simple_mlp.py --batch 64 --seq 128 --dim 768 --hidden 3072 --compile
uvx trace-util traces -b traces
```

| [![Image 16: Profiler trace of the compiled GeGLU MLP showing three aten::mm calls and one fused triton kernel on the CPU lane, labelled mm, mm, fused, mm](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/simple-mlp-compile-trace.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/simple-mlp-compile-trace.png) |
| --- |
| Figure 10: The profiler trace for the compiled GeGLU MLP |

In eager mode, each `nn.Linear` was expanded into a chain of dispatcher ops (`aten::linear` → `aten::t` → `aten::transpose` → `aten::matmul` → `aten::reshape` → `aten::mm`). Those are the high-level wrappers that ATen walks through before reaching the real GEMM. `torch.compile` removes that chain.

By the time the compiled graph runs, there is no linear, no matmul, no transpose or reshape and those metadata ops were folded into how `mm` is called. We can see three bare `aten::mm` external calls (Figure 10). The proof that it is the same GEMM is that the kernel names are byte-for-byte identical to eager: `...128x128...stages_32x5_tn` for gate and up, and `...128x256...stages_64x3_tn` for down.

### [](http://huggingface.co/blog/torch-mlp-fusion#the-fused-triton-kernel) The fused Triton kernel

| [![Image 17: Compiled MLP trace with the triton_poi_fused__unsafe_view_gelu_mul_0 kernel boxed on the CPU lane, replacing the separate gelu and mul kernels from the eager run](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/fused.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/fused.png) |
| --- |
| Figure 11: The fused Triton kernel |

This is the headline of the whole compile lesson. The two eager pointwise kernels (GeLU and mul) plus a reshape collapsed into one kernel, `triton_poi_fused__unsafe_view_gelu_mul_0` (Figure 11). Let's decode the name:

*   `triton`: generated by Inductor's Triton backend (not cuBLAS, not ATen).
*   `poi`: pointwise (Inductor tags pointwise kernels `poi`, reductions `red`, and persistent reductions `per`).
*   `fused__unsafe_view_gelu_mul`: the ops it merged: the `_unsafe_view` (reshape), the GeLU, and the mul.
*   `0`: the unique id within the graph.

Why is this a win? In eager mode, the intermediate `h = gelu(g)` is a full `[8192, 3072]` bf16 tensor (around 50 MB) that the GeLU kernel writes to HBM and the mul kernel immediately reads back. Fusion keeps it in registers (memory that resides inside the chip and are closer than the HBM). The Triton kernel reads `g` and `u` once, computes `gelu(g) * u`, and writes the result once. One whole round trip of the intermediate through global memory is gone.

## [](http://huggingface.co/blog/torch-mlp-fusion#lets-use-hand-tuned-kernels) Let's use hand tuned kernels

So far we have let PyTorch (eager) and the compiler (`torch.compile`) pick our kernels. Now we plug in a kernel that a human expert wrote and tuned by hand. We use the `LigerGEGLUMLP` layer, that we can easily fetch from the [Hugging Face Hub](https://huggingface.co/kernels/kernels-community/liger-kernels) with the `kernels` library.

```
from kernels import get_kernel

kernels_layers = get_kernel("kernels-community/liger-kernels", version=1).layers
kernels_geglu_mlp = kernels_layers.LigerGEGLUMLP(Config()).to(device, dtype=torch.bfloat16).eval()
```

The full script is here: [`03_kernels_mlp.py`](https://huggingface.co/datasets/ariG23498/profiling-pytorch/blob/main/03_kernels_mlp.py).

```
uv run 03_kernels_mlp.py --batch 64 --seq 128 --dim 768 --hidden 3072
uvx trace-util traces -b traces
```

| [![Image 18: Profiler trace of the LigerGEGLUMLP forward pass showing three aten::linear groups and a single LigerGELUMulFunction group on the CPU lane](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/kernels-profile.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/kernels-profile.png) |
| --- |
| Figure 12: The profiler trace for the `LigerGEGLUMLP` layer |

Figure 12 shows the profile for the `LigerGEGLUMLP` layer using the Liger kernels from the Hub.

### [](http://huggingface.co/blog/torch-mlp-fusion#why-use-the-kernels-library) Why use the kernels library

Writing kernels in Triton or CUDA is one problem and _shipping_ them is another. The kernel has to be compiled for your exact combination of GPU architecture, CUDA version, and PyTorch version. This is the step that usually breaks ("works on my machine", missing `nvcc`, wrong Triton version).

The [`kernels`](https://github.com/huggingface/kernels) library moves that build step off your machine. `get_kernel("kernels-community/liger-kernels", version=1)` downloads a **pre-built, version-pinned** kernel package from the Hugging Face Hub and caches it locally (here under `~/.cache/...kernels-community--liger-kernels`). The benefits are:

*   The kernels are compiled once, in CI, for many architectures and version combinations. You download the right binary instead of compiling it yourself.
*   `version=1` pins the exact build, so everyone running your script gets the same kernel. There is no "it got slower after I updated a package".
*   The package exposes a `.layers` attribute with drop-in `nn.Module`s (like `LigerGEGLUMLP`). You swap your module for theirs and nothing else in your model changes.

### [](http://huggingface.co/blog/torch-mlp-fusion#why-tuned-kernels-are-better) Why tuned kernels are better

When we say "tuned", we mean two concrete things, and both are visible in the trace.

| [![Image 19: Compiled MLP trace with the TorchDynamo, prologue and guard pre-ops boxed on the CPU lane before the compiled graph runs](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/compile-preops.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/compile-preops.png) |
| --- |
| Figure 13: The compiled run pays for pre-ops (Dynamo, guards, prologue) before any GEMM runs |

| [![Image 20: LigerGEGLUMLP trace with an empty box where the compile pre-ops would be, showing the hand-written kernel has no Dynamo or guard overhead](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/no-preops.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/no-preops.png) |
| --- |
| Figure 14: The Liger kernel has no pre-ops — the box where they would be is empty |

1.   **The fusion is baked in.** The [`LigerGEGLUMLP`](https://huggingface.co/kernels/kernels-community/liger-kernels/blob/v1/build/torch-cuda/layers.py#L307) forward is `down_proj(LigerGELUMulFunction.apply(gate_proj(x), up_proj(x)))`. The [`LigerGELUMulFunction`](https://huggingface.co/kernels/kernels-community/liger-kernels/blob/v1/build/torch-cuda/geglu.py#L130) runs a single Triton kernel, [`_geglu_tanh_forward_kernel`](https://huggingface.co/kernels/kernels-community/liger-kernels/blob/v1/build/torch-cuda/geglu.py#L97), that computes `gelu(gate) * up` in one pass. This is exactly what we saw from `torch.compile`, where the intermediate never makes a round-trip through HBM. We get it here **without the compiler**, as shown in Figures 13 and 14 (no Dynamo guards, no compile latency, no recompilation risk).

2.   **The launch parameters were chosen for the hardware.** The kernel does not guess its block size at random. Liger's [`calculate_settings`](https://huggingface.co/kernels/kernels-community/liger-kernels/blob/v1/build/torch-cuda/geglu.py#L95) picks them from the column count.

It is worth being honest about the trade-off here, because the raw numbers can be misleading. The Liger kernel runs in **92.8 µs**, while Inductor's fused kernel from the compile run was **89.4 µs**. At first glance the hand-written kernel looks slightly slower, but that comparison hides the cost that makes it worthwhile.

`torch.compile` specializes for a **static shape**. Inductor's `89.4 µs` kernel is fast precisely because it was generated for _this exact_`[8192, 3072]` problem. Change the batch size, the sequence length, or the hidden dimension, Dynamo re-traces, and you pay the compile cost all over again to get a new specialized kernel.

So the real choice is not "slow human kernel vs fast compiled kernel". It is **a fast generic kernel vs a kernel specialized for one particular input shape**. The Liger kernel takes one set of launch parameters and runs them for _any_ shape with no recompilation. It gives up the last few microseconds that per-shape specialization would buy, in exchange for being robust to changing shapes.

## [](http://huggingface.co/blog/torch-mlp-fusion#conclusion) Conclusion

The table below collects what each step changed on the GPU and what it left untouched.

| Setup | What changed | What stayed the same |
| --- | --- | --- |
| Eager `nn.Linear` | Baseline: bias add is already folded into the GEMM epilogue (`addmm`), so it is _one_ cuBLAS kernel, not a matmul plus an add | — |
| Compiled `nn.Linear` | A few CPU dispatch ops (the `aten::t` view bookkeeping) disappear | Same single cuBLAS GEMM kernel, byte-for-byte. Compile has nothing to fuse |
| Eager MLP | 5 GPU kernels: 3 GEMMs + a GeLU + a mul. The `[8192, 3072]` intermediate makes a full round-trip through HBM | Each GEMM is still the same bias-free cuBLAS kernel as a standalone linear |
| Compiled MLP | GeLU + mul + reshape collapse into **one** fused Triton kernel; the intermediate stays in registers. Pays compile pre-ops (Dynamo, guards) | The 3 GEMMs are untouched with identical cuBLAS kernel names |
| Liger MLP | Same fusion, but baked into a hand-written Triton kernel with hardware-tuned launch params with **no** Dynamo, guards, or compile latency | The 3 GEMMs are still the same cuBLAS kernels |

If there is one habit to carry forward, it is the one we practiced before every trace: **guess first, then look.** State what you expect the trace to contain, open it, and treat any mismatch as the most interesting thing on the screen.

This was the second stop in the **Profiling in PyTorch** series. In the next post we will keep climbing the ladder, moving from this MLP block towards the attention block and, eventually, a full model.

Thanks to [Noe Flandre](https://huggingface.co/NoeFlandre) and [Pedro Gabriel Gengo Lourenço](https://huggingface.co/pedrogengo) for their reviews on the early draft of the post!

