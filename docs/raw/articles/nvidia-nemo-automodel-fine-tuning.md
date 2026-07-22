---
source_url: "https://huggingface.co/blog/nvidia/accelerating-fine-tuning-nvidia-nemo-automodel""
ingested: 2026-06-26
sha256: abd6b4ff2e538903
---

# Accelerating Transformers Fine-Tuning with NVIDIA NeMo AutoModel


Published Time: 2026-06-24T16:00:13.165Z

Markdown Content:
[Back to Articles](https://huggingface.co/blog)

[![Image 1: Adil Asif's avatar](https://huggingface.co/avatars/9d7d9149f7584aade190d10a8b248ad7.svg)](https://huggingface.co/adil-asif)

[![Image 2: Alexandros Koumparoulis's avatar](https://huggingface.co/avatars/9052cd1306ac2f648b0031ccd11eba8a.svg)](https://huggingface.co/akoumpa)

[![Image 3: Wenwen Gao's avatar](https://huggingface.co/avatars/f8320b1054b46029f0b0299468a4b6f5.svg)](https://huggingface.co/wgao2021)

[![Image 4: Sylendran Arunagiri's avatar](https://cdn-avatars.huggingface.co/v1/production/uploads/68e99b690b6572f3d4bd6f92/YJeJyv5JdDxs6vKD8aT3i.jpeg)](https://huggingface.co/Sylendran95)

[![Image 5: David Messina's avatar](https://huggingface.co/avatars/0eff81787fd51fe9cb8f4ec537347f80.svg)](https://huggingface.co/davidsalmessina70)

[![Image 6: Bernard Nguyen's avatar](https://cdn-avatars.huggingface.co/v1/production/uploads/67046ab44d2db34694a9a84e/T6d-2ejwtSUWcotyaHk2T.png)](https://huggingface.co/bernardwin)

HuggingFace Transformers has become the foundation of the open-source AI ecosystem, and the recent [Transformers v5](https://github.com/huggingface/transformers/releases/tag/v5.0.0) release strengthened it with first-class support for Mixture-of-Experts (MoE) models, now the dominant architecture for [frontier models](https://www.nvidia.com/en-us/glossary/frontier-models/). v5 ships the MoE foundations: expert backends, dynamic weight loading, and distributed execution that make MoE extensible and easy to build on.

[NVIDIA NeMo AutoModel](https://github.com/NVIDIA-NeMo/Automodel) is an open library part of the [NVIDIA NeMo framework](https://github.com/NVIDIA-NeMo) for building custom generative AI models at scale. NeMo AutoModel builds cleanly on top of v5, adding Expert Parallelism, DeepEP fused all-to-all dispatch, and TransformerEngine kernels, and it leans on v5's dynamic weight loading to bring those optimizations to a broad and growing set of model families. The payoff is **3.4-3.7x higher training throughput** and **29-32% less GPU memory** on fine-tuning MoE models than native Transformers v5, using the same from_pretrained() API: a single import line, with no other code changes.

This blog details how this combination works and how users can fine-tune MoE models faster without changing their APIs.

## [](http://huggingface.co/blog/nvidia/accelerating-fine-tuning-nvidia-nemo-automodel#background) Background

The rise of MoE models has introduced new challenges to efficient training: Routing tokens across hundreds of experts, fusing expert matmuls into a single kernel, sharding weights across GPUs, and overlapping communication with computation all require infrastructure beyond what a general-purpose library provides out of the box.

[Transformers v5](https://github.com/huggingface/transformers/releases/tag/v5.0.0) (“v5”) introduced first-class MoE support such as [expert backends](https://huggingface.co/docs/transformers/en/experts_interface), [dynamic weight loading](https://huggingface.co/docs/transformers/en/weightconverter), and tensor parallel plans for distributed execution. In addition, v5 made distributed training first-class by integrating PyTorch's DeviceMesh directly into from_pretrained().

[NeMo AutoModel](https://github.com/NVIDIA-NeMo/Automodel) builds on top of v5 by subclassing AutoModelForCausalLM, and adding Expert Parallelism (EP), DeepEP fused all-to-all dispatch, and TransformerEngine kernels. DeepEP is the piece v5 doesn't have yet: it overlaps communication with expert compute. And because NeMo AutoModel rides v5's reversible weight conversion to load each model, it can focus its engineering on these reusable core ops instead of per-model checkpoint plumbing, while save_pretrained() still emits standard HF checkpoints that tools like vLLM and SGLang can load.

The next section walks through how the two work together and the performance gains we measured, from full fine-tuning [NVIDIA Nemotron 3 Ultra 550B A55B](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16) across 16 nodes down to single-node models such as Qwen3-30B-A3B and [Nemotron 3 Nano 30B A3B](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16).

## [](http://huggingface.co/blog/nvidia/accelerating-fine-tuning-nvidia-nemo-automodel#nemo-automodel-same-api-more-performance) NeMo AutoModel: Same API, More Performance

One of NeMo AutoModel's goals is API compatibility with HuggingFace Transformers to enable open-source community. NeMoAutoModelForCausalLM subclasses AutoModelForCausalLM, so any code that works with HF models works with AutoModel too.

Here's what loading a model looks like in both. Only the import changes:

[![Image 7: nemo_and_hf](https://cdn-uploads.huggingface.co/production/uploads/690d0a6c2c5acfe0e1f4777d/VTPq2Wp-RrEcP1eGUJxao.png)](https://cdn-uploads.huggingface.co/production/uploads/690d0a6c2c5acfe0e1f4777d/VTPq2Wp-RrEcP1eGUJxao.png)

That single import does a lot of work. For popular MoE architectures like Qwen3, [NVIDIA Nemotron](https://developer.nvidia.com/nemotron), GPT-OSS, and DeepSeek V3, NeMo AutoModel ships [hand-tuned implementations](https://github.com/NVIDIA-NeMo/Automodel/blob/main/nemo_automodel/_transformers/registry.py) with TransformerEngine attention, fused linear layers, and custom expert kernels. For everything else, it falls back to vanilla HF while still applying optimizations like [Liger kernel](https://github.com/linkedin/Liger-Kernel) patching, among others. And whichever path it takes, the resulting model is ready to scale: pass a device_mesh and you have multi-GPU training without further rewrites.

Where NeMo AutoModel really shines is scaling MoE models to multi-GPU training. To train [Nemotron 3 Nano 30B A3B](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16) with Expert Parallelism across 8 GPUs, one adds the distributed mesh configuration:

```
import os
import torch
import torch.distributed as dist
from nemo_automodel import NeMoAutoModelForCausalLM
from nemo_automodel.recipes._dist_utils import create_distributed_setup_from_config

dist.init_process_group(backend="nccl")
torch.manual_seed(0)
torch.cuda.set_device(int(os.environ.get("LOCAL_RANK", 0)))

dist_setup = create_distributed_setup_from_config(
    {
        "strategy": "fsdp2",
        "ep_size": 8,
    },
)

model = NeMoAutoModelForCausalLM.from_pretrained(
    "nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16",
    dtype=torch.bfloat16,
    distributed_setup=dist_setup,
)

dist.destroy_process_group()
```

This gives speed, scalability and memory-optimizations with FSDP2, Expert Parallelism, TransformerEngine kernels and DeepEP dispatch, all from a from_pretrained() call.

## [](http://huggingface.co/blog/nvidia/accelerating-fine-tuning-nvidia-nemo-automodel#performance-comparison) Performance Comparison

We evaluated NeMo AutoModel in two regimes: full fine-tuning a frontier-scale 550B model across 16 nodes, and training two 30B MoE models on a single node. The 550B result shows why Expert Parallelism is essential at scale; the 30B results quantify the per-GPU speedup over Transformers v5.

### [](http://huggingface.co/blog/nvidia/accelerating-fine-tuning-nvidia-nemo-automodel#nemotron-3-ultra-550b-a55b-full-fine-tune-multi-node) Nemotron 3 Ultra 550B A55B (full fine-tune, multi-node)

[Nemotron 3 Ultra 550B A55B](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16) is a 550B-parameter hybrid model shipping with Mamba2, LatentMoE, and Multi-Token Prediction (MTP). We benchmark a **full fine-tune**: every parameter is updated and the Adam optimizer state is materialized, which at this scale spans **16 H100 nodes (128 GPUs)**.

**Methodology:**

| Parameter | Value |
| --- | --- |
| Hardware | 16x H100 80GB (128 GPUs) |
| Expert Parallelism | EP=64 |
| Local batch size | 2 |
| Sequence length | 4,096 |
| Features | MTP, activation checkpointing, fused linear cross-entropy |
| Kernels | DeepEP dispatch + torch_mm experts + TransformerEngine |

| Metric | NeMo AutoModel (EP=64) |
| --- | --- |
| TPS/GPU (avg) | 815 |
| TFLOP/s/GPU | ~293 |
| Peak Memory | 58.2 GiB |

**Why there is no Transformers v5 column.** Transformers v5 runs out of memory at this scale, so there is no v5 number to report here. AutoModel's Expert Parallelism shards the experts across GPUs to bring the footprint within budget, which is what lets the full fine-tune run. The 30B comparisons below show the same advantage where v5 fits.

### [](http://huggingface.co/blog/nvidia/accelerating-fine-tuning-nvidia-nemo-automodel#single-node-30b-moe-benchmarks) Single-node 30B MoE benchmarks

We benchmarked three approaches on a single node with 8x H100 80GB GPUs: HF Transformers v4 (hub code), HF Transformers v5 (with best available optimizations), and NeMo AutoModel (EP=8 + custom kernels).

**Methodology:**

| Parameter | Value |
| --- | --- |
| Hardware | 8x H100 80GB (single node) |
| Sequence length | 4,096 |
| Local batch size | 1 |

**A note on the routing gate.** The NeMo AutoModel numbers below use a balanced routing gate, which forces tokens to be distributed uniformly across experts. This emulates the _ideal_ operating point an MoE is trained toward: a well-trained model's load-balancing loss drives expert utilization to near-uniform, so balanced routing reflects the steady-state a real workload converges to (and removes the straggler noise that random dummy tokens otherwise inject into expert parallelism). v4/v5 run their native router on the same dummy tokens. The balanced gate therefore measures NeMo AutoModel at its target MoE operating point, and the v4/v5 columns reflect their out-of-the-box behavior.

[![Image 8: nemo_automodel_blog_chart_mockup_v5](https://cdn-uploads.huggingface.co/production/uploads/690d0a6c2c5acfe0e1f4777d/rbCVgV6a18c4UcDsiWfZN.png)](https://cdn-uploads.huggingface.co/production/uploads/690d0a6c2c5acfe0e1f4777d/rbCVgV6a18c4UcDsiWfZN.png)

### [](http://huggingface.co/blog/nvidia/accelerating-fine-tuning-nvidia-nemo-automodel#qwen3-30b-a3b) Qwen3-30B-A3B

| Metric | v4 | v5 (FA2 + grouped_mm) | NeMo AutoModel (EP=8) | v5 → NeMo AutoModel |
| --- | --- | --- | --- | --- |
| TPS/GPU (avg) | deadlock | 3,075 | 11,340 | **3.69x** |
| Peak Memory | — | 68.2 GiB | 48.1 GiB | **-29%** |
| Avg Forward+Loss | — | 582 ms | 194 ms | 3.00x |
| Avg Backward | — | 758 ms | 178 ms | 4.26x |

**Why v4 deadlocks:** Transformers v4 stores Qwen3 MoE experts as a ModuleList of 128 individual MLP modules, each separately FSDP-wrapped. The forward pass uses a data-dependent loop that only iterates experts that received tokens. With different data per rank, different ranks skip different experts, causing mismatched FSDP AllGather/ReduceScatter collectives and an indefinite hang. Transformers v5 fixes this by storing experts as fused 3D parameter tensors (no per-expert modules, no per-expert FSDP collectives).

### [](http://huggingface.co/blog/nvidia/accelerating-fine-tuning-nvidia-nemo-automodel#nemotron-3-nano-30b-a3b) Nemotron 3 Nano 30B A3B

| Metric | v4 (hub code) | v5 (FA2 + grouped_mm + Mamba CUDA) | NeMo AutoModel (EP=8) | v5 → NeMo AutoModel |
| --- | --- | --- | --- | --- |
| TPS/GPU (avg) | 1,807 | 4,583 | 15,421 | **3.36x** |
| Peak Memory | 61.9 GiB | 62.1 GiB | 42.5 GiB | **-32%** |
| Avg Forward+Loss | 1,024 ms | 283 ms | 109 ms | 2.60x |
| Avg Backward | 1,246 ms | 611 ms | 157 ms | 3.89x |

**v4 config:** trust_remote_code=True (NVIDIA's hub modeling code). The hub code's expert loop is FSDP-safe (iterates all experts regardless of token assignment), so it doesn't deadlock like Qwen3 v4.

### [](http://huggingface.co/blog/nvidia/accelerating-fine-tuning-nvidia-nemo-automodel#where-the-speedup-comes-from) Where the speedup comes from

The 3.4-3.7x speedup from NeMo AutoModel over Transformers v5 comes from three sources:

1.   **Expert Parallelism reduces memory pressure.** EP=8 distributes expert weights across GPUs, cutting the per-GPU MoE footprint by 8x. For Qwen3, this drops peak memory from 68.2 GiB to 48.1 GiB (-29%). For Nemotron Nano, it drops from 62.1 GiB to 42.5 GiB (-32%), freeing headroom for larger batch sizes or longer sequences.

2.   **DeepEP fuses communication with computation.** Instead of separate AllGather/ReduceScatter collectives for expert routing, DeepEP fuses token dispatch and combines into optimized GPU kernels, overlapping communication with expert computation.

3.   **TransformerEngine kernels accelerate core operations.** TE's fused attention, linear layers, and RMSNorm implementations provide consistent speedups over their PyTorch/Flash Attention equivalents across all layer types, not just MoE layers.

## [](http://huggingface.co/blog/nvidia/accelerating-fine-tuning-nvidia-nemo-automodel#transformers-v5-features-leveraged-by-huggingface-automodel) Transformers v5 Features Leveraged by HuggingFace AutoModel

### [](http://huggingface.co/blog/nvidia/accelerating-fine-tuning-nvidia-nemo-automodel#expert-backends) Expert Backends

One of the most impactful features in Transformers v5 is the [experts_implementation](https://huggingface.co/docs/transformers/en/experts_interface) parameter, which includes three expert backends:

| Backend | Description | Best for |
| --- | --- | --- |
| eager | For-loop over selected experts | Debugging, compatibility, and correctness. Also available for v4. |
| batched_mm | Duplicates expert params, single batched GEMM via torch.bmm | Small inputs, fast with torch.compile. Added for v5 |
| grouped_mm | Orders tokens by expert, single grouped GEMM via torch.nn.functional.grouped_mm | Training (memory efficient, no param duplication). Added for v5. |

The grouped_mm backend is the key training optimization: instead of looping over experts one by one, it sorts tokens by their assigned expert and executes a single fused grouped matrix multiplication.

NeMo AutoModel takes this further. For models with custom implementations, it uses DeepEP fused all-to-all dispatch combined with grouped GEMM kernels and TransformerEngine linear layers. The progression looks like:

```
v4 (eager for-loop) → v5 (grouped_mm) → NeMo AutoModel (DeepEP + GMM + TE)
```

In NeMo AutoModel, the expert backend is configured through BackendConfig:

```
from nemo_automodel.components.models.common.utils import BackendConfig

backend = BackendConfig(
    attn="te",           # TransformerEngine attention
    linear="te",         # TransformerEngine linear layers
    experts="torch_mm",  # Grouped expert matmul
    dispatcher="deepep", # DeepEP fused all-to-all
)
```

## [](http://huggingface.co/blog/nvidia/accelerating-fine-tuning-nvidia-nemo-automodel#expert-parallelism-and-deepep) Expert Parallelism and DeepEP

Transformers v5 also ships an [Expert Parallelism path](https://huggingface.co/docs/transformers/en/expert_parallelism). It shards expert weights across GPUs. The [GroupedGemmParallel](https://github.com/huggingface/transformers/blob/v5.10.2/src/transformers/integrations/tensor_parallel.py#L1078) style loads only each device's local experts, and [RouterParallel](https://github.com/huggingface/transformers/blob/v5.10.2/src/transformers/integrations/tensor_parallel.py#L1123) routes tokens and combines results with an all_reduce. It's neatly built on v5's existing tensor-parallel machinery. Enabling it makes the model's tp_plan return its [expert plan](https://github.com/huggingface/transformers/blob/v5.10.2/src/transformers/modeling_utils.py#L1448), so expert parallelism shares the device budget with data parallelism (ep × dp = world_size). For the single-node 30B benchmarks here, we found plain data-parallel v5 (dp=8, ep=1) to be the fastest v5 configuration, so that's the v5 setup we report.

NeMo AutoModel takes a complementary approach tuned for multi-GPU MoE training. It makes EP its own parallelism dimension, a dedicated moe_mesh alongside (rather than carved from) the data-parallel mesh, using PyTorch's DTensor with Shard(0). Because the expert mesh is orthogonal to data parallelism, the two compose on the same devices. On 8 GPUs NeMo AutoModel runs ep=8 and dp=8 together, so every GPU trains on its own data shard while holding only 1/8 of the experts. Expert weights are physically sharded across GPUs along the expert dimension.

```
# From nemo_automodel/components/moe/parallelizer.py
from torch.distributed.tensor import Shard, distribute_tensor

# Each GPU holds only 1/ep_size of the expert weights
distribute_tensor(param, device_mesh, [Shard(0)])
```

With ep_size=8 on 8 GPUs, each GPU holds only 1/8 of the expert parameters. For a model like Nemotron-3-Nano-30B-A3B with ~55 GiB of expert weights, EP reduces the per-GPU expert footprint from ~55 GiB to ~6.8 GiB, making training possible where FSDP-only approaches run out of memory.

On top of EP, NeMo AutoModel integrates [DeepEP](https://github.com/deepseek-ai/DeepEP) that fuses the token routing into optimized GPU kernels, and delivers significant speedups when combined with grouped GEMM for grouped expert computation. In our [large-scale MoE benchmarks](https://github.com/NVIDIA-NeMo/Automodel/discussions/916), DeepEP + grouped GEMM reduced cost per iteration by 47% on the full DeepSeek V3 671B model compared to all-gather + looped expert baselines.

### [](http://huggingface.co/blog/nvidia/accelerating-fine-tuning-nvidia-nemo-automodel#dynamic-weight-loading) Dynamic Weight Loading

Transformers v5 also introduced a [dynamic weight loading](https://huggingface.co/docs/transformers/en/weightconverter) system through WeightConverter and WeightRenaming. This enables MoE checkpoint to be stored in fused 3D tensors for more efficient execution. The WeightConverter applies composable operations to transform checkpoint tensors on-the-fly during from_pretrained().

NeMo AutoModel is a direct consumer of this v5 API. Over [20 model types](https://github.com/NVIDIA-NeMo/Automodel/blob/main/nemo_automodel/components/checkpoint/conversion_mapping.py) use this mechanism through MODELS_REQUIRING_TENSOR_MERGING, including Mixtral, Qwen2 MoE, Qwen3 MoE, DeepSeek V2/V3, OLMoE, and more. The conversions are fully reversible: save_pretrained() produces standard HF-format checkpoints that any downstream tool can load.

## [](http://huggingface.co/blog/nvidia/accelerating-fine-tuning-nvidia-nemo-automodel#getting-started) Getting Started

To try NeMo AutoModel, please visit our official documentation page to [get started](https://docs.nvidia.com/nemo/automodel/latest/get-started/installation).

For more details, see:

*   [NeMo AutoModel HuggingFace API Compatibility Guide](https://docs.nvidia.com/nemo/automodel/latest/get-started/hf-compatibility)
*   [NeMo AutoModel Model Coverage](https://docs.nvidia.com/nemo/automodel/latest/model-coverage/overview)
*   [NeMo AutoModel Performance Summary](https://docs.nvidia.com/nemo/automodel/latest/performance/performance-summary)
*   [NeMo AutoModel on HuggingFace](https://huggingface.co/docs/transformers/en/community_integrations/nemo_automodel_finetuning)

## [](http://huggingface.co/blog/nvidia/accelerating-fine-tuning-nvidia-nemo-automodel#conclusion) Conclusion

NVIDIA NeMo AutoModel is the natural next step for HuggingFace users scaling up model training. By building directly on Transformers v5, AutoModel provides a zero-friction upgrade path: change one import line and get a model instance that is more than three times as fast.

On Qwen3-30B-A3B and Nemotron 3 Nano 30B-A3B, this delivers 3.4-3.7x higher training throughput with 29-32% less GPU memory compared to the best Transformers v5 configuration. And because true Expert Parallelism shards experts across GPUs, the same path scales up to full fine-tuning a 550B model like Nemotron 3 Ultra across 16 nodes, the regime where Expert Parallelism becomes essential to fit the model in memory. Because NeMo AutoModel checkpoints are standard HF-format safetensors, you can deploy them on inference frameworks like vLLM and SGLang.

The code, configs, and benchmark scripts are all available in the [NeMo AutoModel repository](https://github.com/NVIDIA-NeMo/Automodel/tree/blog/transformers-v5-automodel/blog_experiments).

## [](http://huggingface.co/blog/nvidia/accelerating-fine-tuning-nvidia-nemo-automodel#acknowledgements) Acknowledgements

Core contributors to this work, listed alphabetically by last name: Adil Asif, Hemil Desai, Alexandros Koumparoulis, and Huiying Li.

