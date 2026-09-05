---
source_url: "https://flat-splat.github.io"
ingested: 2026-06-26
sha256: 3b215892b292cf998fad3f58afe5078d7a34bb4f6d56fcef2719a00fa7f9b5f8
---

# FLAT: Feedforward Latent Triangle Splatting

Feedforward Latent Triangle Splatting for geometrically accurate scene generation.

Decode explicit surface-aligned triangle splats from video diffusion latents in a single forward pass.

Orest Kupyn, Goutam Bhat, Philipp Henzler, Fabian Manhardt, Christian Rupprecht (Google Research + Oxford VGG + TU Munich)

FLAT shows that compressed video diffusion latents can be mapped directly to explicit non-volumetric scene parameters. Instead of decoding 3D Gaussians, it predicts triangle splats in one pass, improving geometric accuracy while preserving competitive visual quality and enabling rasterization with simple triangle renderers.

Key contributions:
- Single forward pass from video diffusion latents to triangle splats
- Surface-aligned representation improves geometric accuracy over volumetric Gaussians
- Compatible with standard triangle rasterization pipelines
- Competitive visual quality with significantly better geometry