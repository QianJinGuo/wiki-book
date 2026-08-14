---
source: rss
source_url: https://huggingface.co/blog/native-speed-vllm-transformers-backend
ingested: 2026-08-14
feed_name: Hugging Face Blog
source_published: 2026-07-08
content_source: github-raw
sha256: e9446b97b916dd5903adaaab2ce791aba995b08332c6553b494807b1b3af9154
---

# add --max-model-len 8192 if your node is memory constrained
```

_\*Models that use linear attention are not currently supported, but they will be soon! Custom models where the code lives in a Hub repo are unlikely to work as they will not have been written compliantly._

### How we measured

Each model is compared under three conditions that are identical in every way except the code path:

1. **native** — `--model-impl vllm`, vLLM's hand-written model (the bar to match)
2. **after** — `--model-impl transformers` _with_ the PR
3. **before** — `--model-impl transformers` _without_ the PR

The full, reproducible runner is available as a gist: [`benchmark.sh`](https://huggingface.co/datasets/ariG23498/useful-scripts/blob/main/transformers-backend-vllm-benchmark.sh)

## So, what's new?

The transformers modeling backend for vLLM used to focus on _attention_ as the bottleneck for inference. By plugging vLLM’s attention implementation at runtime, we could make a transformers model run efficiently inside the vLLM engine. But there are many dimensions to deployments that only a custom port can target to extract maximum inference performance. Parallelization across GPUs, compilation, fused kernels, and many more, all contribute to leveraging your hardware to achieve ultra-fast inference.

| ![New model integration to transformers and vLLM](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/vllm-backend/previous-pipeline.png) |
| :--: |
| A new model used to be integrated once for transformers, and once for vLLM with custom optimizations |

When model authors wanted the absolute best performance, they were still writing custom vLLM implementations.

| ![New model integrates to transformers, and is immediately available to vLLM](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/vllm-backend/current-pipeline.png) |
| :--: |
| A new model once integrated to transformers, can now be immediately used in vLLM with native vLLM implementation speed |

The latest iteration of the transformers modeling backend for vLLM dynamically applies inference specific layer fusions at runtime to match the speed of custom code implementations, for compatible architectures.

## How does it work?

The transformers modeling backend for vLLM now uses `torch.fx` to perform static analysis on the model’s graph. This process searches for known patterns that can be optimised. After any patterns have been identified, it uses ast (abstract syntax tree) to manipulate the source code and rewrite some of the operations in place.

**What can we achieve with this?**

* Fused operations that are many-to-one mapped to (ultra) optimized vLLM kernels, such as the ones used for Expert Parallelization (EP) in Mixture-of-Experts (MoE) models.
* The main other fused operations are vLLM's `MergedColumnParallelLinear` and `QKVParallelLinear`. These blocks allow us to infer parallel plans for TP (tensor-parallel). PP (pipeline-parallel) plans can also be inferred if the decoder block list is easily identifiable.
* The manipulated models are still fully (torch) compilable, being passed through `torch.compile` and CUDA Graphs, just the same as a dedicated vLLM model implementation.
* Unlike vLLM model implementations, Transformers model implementations can be used in **training**. So you can use the same model code for training/evals/RL rollouts.

As shown above, this results in native vLLM inference speed for compatible models, without having to write a single line of code to optimize the model for inference.

> [!NOTE]
> We are in the process of writing a detailed blog post to dive deep inside these optimized inference methods and explain in detail how we manipulate the model to adapt to them.

## Resources

* [Transformers model definition](https://huggingface.co/blog/transformers-model-definition#a-model-definition-library)
* [Transformers modeling backend in vLLM](https://vllm.ai/blog/2025-04-11-transformers-backend)
* [Large scale serving](https://vllm.ai/blog/2025-12-17-large-scale-serving)
* [Torch FX](https://docs.pytorch.org/docs/2.12/fx.html)
* [Abstract syntax tree](https://docs.python.org/3/library/ast.html)

