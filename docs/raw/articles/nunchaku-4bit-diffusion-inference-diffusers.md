---
source: rss
source_url: https://huggingface.co/blog/nunchaku-diffusers
ingested: 2026-08-14
feed_name: Hugging Face Blog
source_published: 2026-07-23
content_source: github-raw
sha256: 4792a382590673b67febeef01fb1ed257950a31c101a364c9a09e787497bc6e8
---

# or compile_repeated_blocks() for faster compilation

pipe.transformer.compile_repeated_blocks(fullgraph=True)
```

**Quantized text encoders.** The transformer is not the only component with a large memory footprint. Text encoders such as T5 or Qwen3 can occupy several gigabytes on their own. Further quantizing the text encoder with bitsandbytes NF4 reduces peak VRAM by about 22% in our benchmark.

**Offloading.** Diffusers offloading helpers such as `enable_model_cpu_offload()` and `enable_sequential_cpu_offload()` work as usual if you need to fit the pipeline onto a smaller GPU.

## Benchmarks

All numbers below were measured on an NVIDIA RTX PRO 6000 (Blackwell) at 1024x1024 using [rootonchair/ERNIE-Image-Turbo-nunchaku-lite-int4-bnb4-text-encoder](https://huggingface.co/rootonchair/ERNIE-Image-Turbo-nunchaku-lite-int4-bnb4-text-encoder).

### End-to-end latency and memory

| Configuration | Full pipeline | Denoise loop | Peak VRAM | Speedup |
|---|---|---|---|---|
| BF16 baseline | 3.00 s | 2.86 s | 31.1 GB | 1.0x |
| Nunchaku Lite NVFP4 | 2.27 s | 2.13 s | 20.6 GB | 1.35x |
| Nunchaku Lite NVFP4 + `torch.compile` | 1.68 s | 1.53 s | 20.6 GB | 1.8x |
| Nunchaku Lite NVFP4 + NF4 text encoder | 2.29 s | 2.13 s | 16.0 GB | 1.35x |

As shown above, Nunchaku reduces peak VRAM by up to 50% while still improving latency by roughly 30%. The remaining overhead comes largely from extra kernel launches, which `torch.compile` can mitigate, bringing the full pipeline down to 1.68 s, or 1.8x faster than the BF16 baseline.

### Image quality

<figure class="image text-center">
  <img src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/nunchaku-diffusers/quality_grid.png" alt="Quality comparison grid">
  <figcaption>BF16 vs 4-bit outputs with identical seeds and settings.</figcaption>
</figure>

## Quantizing your own model

Nunchaku Lite support in Diffusers is architecture-agnostic, and the [diffuse-compressor](https://github.com/rootonchair/diffuse-compressor) toolkit provides an end-to-end SVDQuant workflow for Diffusers models: calibrate, quantize, package, and publish.

Below, we walk through quantizing FLUX.2 Klein 4B as an example. It covers the main steps: inspect the model, calibrate and quantize the transformer, package the result as a Diffusers pipeline, then verify and push it to the Hub. The [full tutorial](https://github.com/rootonchair/diffuse-compressor/blob/main/docs/quantize_new_hf_model.md) covers every flag in detail.

### 1. Inspect what will be quantized

The generic scanner walks the model and decides what to target: compatible linears inside the repeated transformer-block stack become SVDQ W4A4 targets, recognized modulation linears become AWQ W4A16 targets, and everything else stays dense.

```bash
python examples/text_to_image/quantize_hf.py black-forest-labs/FLUX.2-klein-4B \
  --precision int4 --rank 32 --inspect-config
```

Always read this report before quantizing. For FLUX.2 Klein 4B, the expected result is 100 SVDQ targets, 3 AWQ targets, and 6 dense outer linears, with no missing patterns or duplicate names.

### 2. Run quantization

The following command runs SVDQuant on the transformer and writes the quantized checkpoint to `outputs/checkpoints/svdq-int4_r32-flux-2-klein-4b.safetensors`:

```bash
python examples/text_to_image/quantize_hf.py black-forest-labs/FLUX.2-klein-4B \
  --precision int4 \
  --output outputs/checkpoints/svdq-int4_r32-flux-2-klein-4b.safetensors
```

Replace `--precision int4` with `nvfp4` to build Blackwell-native weights.

### 3. Package a Diffusers pipeline

The converter combines the quantized transformer with the base pipeline's other components, writes the compact `nunchaku_lite` configuration into `transformer/config.json`, and can optionally convert text encoders to NF4:

```bash
python examples/convert_nunchaku_lite_diffusers.py \
  --checkpoint outputs/checkpoints/svdq-int4_r32-flux-2-klein-4b.safetensors \
  --model-id black-forest-labs/FLUX.2-klein-4B \
  --bnb4-text-encoder text_encoder \
  --compute-dtype bfloat16 \
  --output-dir outputs/diffusers/FLUX.2-klein-4B-nunchaku-lite-int4-bnb4-text-encoder
```

### 4. Load, verify, and push to the Hub

```python
import torch
from diffusers import DiffusionPipeline

pipe = DiffusionPipeline.from_pretrained(
    "outputs/diffusers/FLUX.2-klein-4B-nunchaku-lite-int4-bnb4-text-encoder",
    device_map="cuda",
)
image = pipe(
    "A glass robot in a greenhouse, cinematic lighting",
    num_inference_steps=4, guidance_scale=1.0,
    generator=torch.Generator("cuda").manual_seed(12345),
).images[0]
```

Once the outputs look good, run `pipe.push_to_hub("your-name/your-model-nunchaku-lite-int4")`. Other users can then load it with the same `from_pretrained()` pattern shown above.

### Quantizing models with structural rewrites

Note that the generic path assumes the architecture can be quantized without structural rewrites. For additional speedup, the original Nunchaku engine rewrites groups of Diffusers layers as fused modules. The generic path cannot infer these changes on its own, such as combining separate Q, K, and V projections into one module or splitting a fused projection across several modules.

FLUX.1-dev's QKV projection is a concrete example. [Diffusers defines three separate modules](https://github.com/huggingface/diffusers/blob/main/src/diffusers/models/transformers/transformer_flux.py#L313-L329):

```python
self.to_q = torch.nn.Linear(query_dim, self.inner_dim, bias=bias)
self.to_k = torch.nn.Linear(query_dim, self.inner_dim, bias=bias)
self.to_v = torch.nn.Linear(query_dim, self.inner_dim, bias=bias)
```

The [Nunchaku FLUX module combines those layers](https://github.com/nunchaku-ai/nunchaku/blob/main/nunchaku/models/transformers/transformer_flux_v2.py#L63-L79) into one quantized `to_qkv` module:

```python
to_qkv = fuse_linears([other.to_q, other.to_k, other.to_v])
self.to_qkv = SVDQW4A4Linear.from_linear(to_qkv, **kwargs)
```

This grouped module is required because Nunchaku's fused operator consumes the QKV projection, Q/K normalization, and rotary embeddings together. By comparison, the [default Diffusers path](https://github.com/huggingface/diffusers/blob/main/src/diffusers/models/transformers/transformer_flux.py#L45-L116) executes them separately:

```python
query = attn.to_q(hidden_states)
key = attn.to_k(hidden_states)
value = attn.to_v(hidden_states)

query = query.unflatten(-1, (attn.heads, -1))
key = key.unflatten(-1, (attn.heads, -1))
value = value.unflatten(-1, (attn.heads, -1))

query = attn.norm_q(query)
key = attn.norm_k(key)

if image_rotary_emb is not None:
    query = apply_rotary_emb(query, image_rotary_emb, sequence_dim=1)
    key = apply_rotary_emb(key, image_rotary_emb, sequence_dim=1)
```

The [Nunchaku path](https://github.com/nunchaku-ai/nunchaku/blob/main/nunchaku/models/attention_processors/flux.py#L69-L93) supplies the grouped projection, normalization modules, and rotary embeddings to one fused operator:

```python
qkv = fused_qkv_norm_rottary(
    hidden_states, attn.to_qkv, attn.norm_q, attn.norm_k, image_rotary_emb
)
```

This is the structural rewrite that the generic path cannot infer. Diffusers has three destination modules with `to_q`, `to_k`, and `to_v` parameter prefixes, while Nunchaku has one grouped module under `to_qkv`. A model-specific target config or adapter must state that the Q, K, and V parameters should be concatenated along the output dimension, in that order, and loaded into `to_qkv`.

Structural rewrites like these are described by a model-specific target config during quantization and handled by a small runtime adapter when the checkpoint is loaded.
The [FLUX.2 Klein 4B quantization script](https://github.com/rootonchair/diffuse-compressor/blob/main/examples/text_to_image/quantize_flux2_klein_4b.py) provides a concrete target-config example for producing a structurally rewritten checkpoint, while [rootonchair/nunchaku-lite](https://github.com/rootonchair/nunchaku-lite) provides the runtime adapters needed to load grouped QKV tensors, split fused projections, and other fused operations.
For the complete workflow, you can check the [Adding A New Model](https://github.com/rootonchair/diffuse-compressor/blob/main/docs/adding_new_model.md) guide.

## Ready-to-use checkpoints

To get started right away, check out the following repositories:

- [rootonchair/ERNIE-Image-Turbo-nunchaku-lite-int4-bnb4-text-encoder](https://huggingface.co/rootonchair/ERNIE-Image-Turbo-nunchaku-lite-int4-bnb4-text-encoder): INT4 ERNIE-Image-Turbo with a bitsandbytes NF4 text encoder
- [rootonchair/ERNIE-Image-Turbo-nunchaku-lite-nvfp4-bnb4-text-encoder](https://huggingface.co/rootonchair/ERNIE-Image-Turbo-nunchaku-lite-nvfp4-bnb4-text-encoder): NVFP4 ERNIE-Image-Turbo with a bitsandbytes NF4 text encoder
- [OzzyGT/Krea_2_Turbo_nunchaku_lite_nvfp4](https://huggingface.co/OzzyGT/Krea_2_Turbo_nunchaku_lite_nvfp4): NVFP4 Krea 2 Turbo checkpoint
- [lite-infer](https://huggingface.co/lite-infer): more Nunchaku Lite checkpoints and collections

## Conclusion

Nunchaku's SVDQuant kernels are one of the most effective ways to run diffusion transformers efficiently on consumer hardware, and they are now natively supported in Diffusers. Pre-quantized checkpoints load with `from_pretrained()`, and the diffuse-compressor toolkit makes it possible to quantize new architectures without waiting for engine support. By quantizing both weights and activations, the W4A4 path lowers memory use while improving denoising latency, keeping image quality close to the BF16 original.

If you quantize and publish a new model, we would love to hear about it. Share it on the Hub and let us know! If you have any questions about this feature, feel free to join our [Discord](https://discord.gg/G7tWnz98XR).

To learn more, check out the following resources:

- [Diffusers Nunchaku documentation](https://huggingface.co/docs/diffusers/quantization/nunchaku)
- [The integration PR (huggingface/diffusers#14100)](https://github.com/huggingface/diffusers/pull/14100)
- [SVDQuant paper](https://arxiv.org/abs/2411.05007) and the [Nunchaku engine](https://github.com/nunchaku-tech/nunchaku)
- [diffuse-compressor](https://github.com/rootonchair/diffuse-compressor)
- Previous posts: [Exploring Quantization Backends in Diffusers](https://huggingface.co/blog/diffusers-quantization) and [Memory-efficient Diffusion Transformers with Quanto and Diffusers](https://huggingface.co/blog/quanto-diffusers)

## Acknowledgements

Thanks to the Diffusers maintainers for reviews and guidance throughout the integration, and to the MIT HAN Lab / Nunchaku team for the original SVDQuant work. Thanks to Marc Sun for providing feedback on the blog post. Thanks to Álvaro Somoza for trying out `nunchaku-lite` and for providing feedback.

`rootonchair` is also grateful to SilverAI for supporting this work and providing the environment in which much of this development took place.

