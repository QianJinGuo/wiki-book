---
source_url: "https://hustvl.github.io/Moebius/""
ingested: 2026-06-26
sha256: 975e840e3e3d16be
---

# Moebius Project Page


Published Time: Thu, 18 Jun 2026 20:32:02 GMT

Markdown Content:
![Image 1](http://hustvl.github.io/Moebius/image_assets/logo_dynamic_woWaterMark.gif)

## Moebius: 0.2B Lightweight Image Inpainting Framework with 10B-Level Performance

(*) Equal Contribution, (†) Project Leader, (📧) Corresponding Author.

1 Huazhong University of Science and Technology 2 VIVO AI Lab

## Abstract

While 10B-level industrial foundation models have pushed the boundaries of image inpainting, their prohibitive computational costs severely hinder practical deployment. Constructing a highly optimized task-specific specialist offers a promising solution; however, extreme structural compression inevitably triggers a severe representation bottleneck. To conquer this, we propose Moebius, a highly efficient lightweight inpainting framework. We systematically reconstruct the diffusion backbone by introducing the Local-λ Mix Interaction (LλMI) block. Comprising Local-λ and Interactive-λ modules, it elegantly summarizes spatial contexts and global semantic priors into fixed-size linear matrices, preserving complex latent interactions while drastically shedding parameters. Furthermore, to unlock the full representational capacity of this highly compact architecture, we synergistically pair it with an adaptive multi-granularity distillation strategy. Operating strictly within the latent space to avoid expensive pixel-space decoding, this strategy dynamically balances multiple gradient-based losses to achieve high-fidelity alignment. Extensive experiments across natural and portrait benchmarks demonstrate that this optimal synergy enables Moebius to rival or even surpass the generation quality of the 10B-level industrial generalist FLUX.1-Fill-Dev. Remarkably, Moebius achieves this using less than 2\% of the parameters (0.22B vs. 11.9B) while delivering a >15× acceleration in total inference time, setting a new efficiency standard for high-fidelity inpainting.

## Method

![Image 2](http://hustvl.github.io/Moebius/image_assets/method/pipeline.png)

**Overall pipeline of Moebius.** We adopt the Latent Diffusion Model (LDM) framework equipped with Latent Categories Guidance (LCG). To achieve extreme architectural efficiency, the denoising U-Net is systematically restructured using our proposed LλM I blocks (detailed in Sec. 3.2). Furthermore, an adaptive multi-granularity distillation strategy (Sec. 3.3) is applied during training to align our lightweight specialist with the high-capacity teacher, successfully mitigating the capacity drop caused by extreme structural compression.

## Highlights

*   **📉 Extreme Parametric Efficiency (< 2%)**: Moebius operates with a mere **0.22B (226M) parameters**, which represents **less than 2%** of the size of the colossal industrial giant _FLUX.1-Fill-Dev (11.9B)_. It shatters the heavy-compute narrative, making high-quality inpainting accessible on consumer-grade and edge devices.
*   **⚡ 15× Inference Speedup (26ms/step)**: Achieves a blistering inference latency of only **26.01 ms per step** on a single GPU. Combined with optimized sampling steps, Moebius delivers an overall **>15× total runtime acceleration** compared to 10B-level models.

![Image 3](http://hustvl.github.io/Moebius/image_assets/tab1.png)

*   **🏆 10B-Level Inpainting Quality (on-par-with/surpass FLUX.1-Fill-Dev across 6 benchmarks)**: Size contraction does not mean representation degradation. Through the synergistic optimization of architecture and distillation, Moebius performs on par with, and in certain scenarios (such as complex textures and facial plausibility), surpasses 10B-level state-of-the-art (SOTA) generalist models (_FLUX.1-Fill-Dev_, _SD3.5 Large-Inpainting_) across 6 comprehensive benchmarks spanning **both natural** scenes (_Places2_) and **portrait** scenes (_CelebA-HQ_, _FFHQ_).
*   **💡 Synergistic Core Innovations**: 
    *   **Architecture Design (LλMI Block)**: Reformulates both self- and cross-attention by condensing spatial context and global semantic priors into fixed-size linear matrices, bypassing quadratic computational overhead.
    *   **Adaptive Multi-Granularity Distillation Strategy**: Transfers the representational capacity from our _[PixelHacker](https://github.com/hustvl/PixelHacker)_ (teacher) strictly within the latent space (avoiding expensive pixel-space decoding). It bridges the giant capacity gap by aligning multi-granularity supervision—ranging from microscopic intermediate features to macroscopic diffusion trajectories—while dynamically balancing training via a gradient norm adaptive loss weighting mechanism.
    *   **Optimal Synergistic Balancing**: Systematically explores the mutual constraint and upper bound between compact structure and distillation. By mapping this architecture-distillation synergy frontier, we ensure our 0.22B _Moebius_ (student) absorbs the maximum semantic reasoning of _[PixelHacker](https://github.com/hustvl/PixelHacker)_ (teacher) without triggering representation saturation.

![Image 4](http://hustvl.github.io/Moebius/image_assets/tab2.png)

*   **🚀 Task-Specific Specialist over Bloated Generalists**: Rather than blindly scaling up, Moebius answers a fundamental question: _Can a model be smarter, lighter, and faster when the task is explicitly defined?_ It serves as a highly optimized specialist that liberates real-world image inpainting and AI object removal from parameter bloat.

## Visualizations

### - Natural Scenes -

![Image 5](http://hustvl.github.io/Moebius/image_assets/removal/erase_test_79_1_1_masked_gt.png)![Image 6](http://hustvl.github.io/Moebius/image_assets/removal/erase_test_79_1_1_ours1.png)

![Image 7](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_330_masked_gt.png)![Image 8](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_330_ours1.png)

![Image 9](http://hustvl.github.io/Moebius/image_assets/removal/camera_diff_org_37_1_masked_gt.png)![Image 10](http://hustvl.github.io/Moebius/image_assets/removal/camera_diff_org_37_1_ours.png)

![Image 11](http://hustvl.github.io/Moebius/image_assets/removal/color_diff36_masked_gt.png)![Image 12](http://hustvl.github.io/Moebius/image_assets/removal/color_diff36_ours.png)

![Image 13](http://hustvl.github.io/Moebius/image_assets/removal/camera_diff_org_065_1_masked_gt.png)![Image 14](http://hustvl.github.io/Moebius/image_assets/removal/camera_diff_org_065_1_ours.png)

![Image 15](http://hustvl.github.io/Moebius/image_assets/removal/camera_diff_org_064_1_masked_gt.png)![Image 16](http://hustvl.github.io/Moebius/image_assets/removal/camera_diff_org_064_1_ours.png)

![Image 17](http://hustvl.github.io/Moebius/image_assets/removal/camera_diff_org_075_1_masked_gt.png)![Image 18](http://hustvl.github.io/Moebius/image_assets/removal/camera_diff_org_075_1_ours.png)

![Image 19](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_538_masked_gt.2.png)![Image 20](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_538_ours1.2.png)

![Image 21](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_843_masked_gt.3-4.png)![Image 22](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_843_ours1.3-4.png)

![Image 23](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_238_masked_gt.3-4.png)![Image 24](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_238_ours1.3-4.png)

![Image 25](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_764_masked_gt.3-4.png)![Image 26](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_764_ours1.3-4.png)

![Image 27](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_893_masked_gt.3-4.png)![Image 28](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_893_ours1.3-4.png)

![Image 29](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_257_masked_gt.3-4.png)![Image 30](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_257_ours1.3-4.png)

![Image 31](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_101_masked_gt.3-4.png)![Image 32](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_101_ours1.3-4.png)

![Image 33](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_976_masked_gt.3-4.png)![Image 34](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_976_ours1.3-4.png)

![Image 35](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_1311_masked_gt.3-4.png)![Image 36](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_1311_ours1.3-4.png)

![Image 37](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_1122_masked_gt.3-4.png)![Image 38](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_1122_ours1.3-4.png)

![Image 39](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_525_masked_gt.3-4.png)![Image 40](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_525_ours1.3-4.png)

![Image 41](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_596_masked_gt.3-4.png)![Image 42](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_596_ours1.3-4.png)

![Image 43](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_1189_masked_gt.3-4.png)![Image 44](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_1189_ours1.3-4.png)

![Image 45](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_1013_masked_gt.3-4.png)![Image 46](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_1013_ours1.3-4.png)

![Image 47](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_899_masked_gt.3-4.png)![Image 48](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_899_ours1.3-4.png)

![Image 49](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_952_masked_gt.3-4.png)![Image 50](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_952_ours1.3-4.png)

![Image 51](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_641_masked_gt.3-4.png)![Image 52](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_641_ours1.3-4.png)

![Image 53](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_945_masked_gt.3-4.png)![Image 54](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_945_ours1.3-4.png)

![Image 55](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_308_masked_gt.3-4.png)![Image 56](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_308_ours1.3-4.png)

![Image 57](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_326_masked_gt.3-4.png)![Image 58](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_326_ours1.3-4.png)

![Image 59](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_545_masked_gt.3-4.2.png)![Image 60](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_545_ours1.3-4.2.png)

![Image 61](http://hustvl.github.io/Moebius/image_assets/removal/camera_diff_org_04_1_masked_gt.png)![Image 62](http://hustvl.github.io/Moebius/image_assets/removal/camera_diff_org_04_1_ours.png)

![Image 63](http://hustvl.github.io/Moebius/image_assets/removal/camera_diff_org_100_1_masked_gt.png)![Image 64](http://hustvl.github.io/Moebius/image_assets/removal/camera_diff_org_100_1_ours.png)

![Image 65](http://hustvl.github.io/Moebius/image_assets/removal/camera_diff_org_067_1_masked_gt.png)![Image 66](http://hustvl.github.io/Moebius/image_assets/removal/camera_diff_org_067_1_ours.png)

![Image 67](http://hustvl.github.io/Moebius/image_assets/removal/camera_diff_org_31_1_masked_gt.png)![Image 68](http://hustvl.github.io/Moebius/image_assets/removal/camera_diff_org_31_1_ours.png)

![Image 69](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_708_masked_gt.3-4.png)![Image 70](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_708_ours1.3-4.png)

![Image 71](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_1066_masked_gt.png)![Image 72](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_1066_ours1.png)

![Image 73](http://hustvl.github.io/Moebius/image_assets/removal/camera_diff_org_058_1_masked_gt.png)![Image 74](http://hustvl.github.io/Moebius/image_assets/removal/camera_diff_org_058_1_ours.png)

![Image 75](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_57_masked_gt.3-4.png)![Image 76](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_57_ours1.3-4.png)

![Image 77](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_685_masked_gt.3-4.png)![Image 78](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_685_ours1.3-4.png)

![Image 79](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_703_masked_gt.3-4.png)![Image 80](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_703_ours1.3-4.png)

![Image 81](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_175_masked_gt.3-4.png)![Image 82](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_175_ours1.3-4.png)

![Image 83](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_1230_masked_gt.3-4.png)![Image 84](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_1230_ours1.3-4.png)

![Image 85](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_56_masked_gt.3-4.png)![Image 86](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_56_ours1.3-4.png)

![Image 87](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_317_masked_gt.3-4.png)![Image 88](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_317_ours1.3-4.png)

![Image 89](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_1017_masked_gt.3-4.png)![Image 90](http://hustvl.github.io/Moebius/image_assets/xiao_v41/20240712_pic_1017_ours1.3-4.png)

### - Portrait Scenes -

![Image 91](http://hustvl.github.io/Moebius/image_assets/ffhq/02909.gt_with_mask.png)![Image 92](http://hustvl.github.io/Moebius/image_assets/ffhq/02909.ours.png)

![Image 93](http://hustvl.github.io/Moebius/image_assets/celebahq/9874.gt_with_mask.png)![Image 94](http://hustvl.github.io/Moebius/image_assets/celebahq/9874.ours.png)

![Image 95](http://hustvl.github.io/Moebius/image_assets/ffhq/02913.gt_with_mask.png)![Image 96](http://hustvl.github.io/Moebius/image_assets/ffhq/02913.ours.png)

![Image 97](http://hustvl.github.io/Moebius/image_assets/celebahq/9002.gt_with_mask.png)![Image 98](http://hustvl.github.io/Moebius/image_assets/celebahq/9002.ours.png)

![Image 99](http://hustvl.github.io/Moebius/image_assets/ffhq/09649_masked_gt.png)![Image 100](http://hustvl.github.io/Moebius/image_assets/ffhq/09649_ours.png)

![Image 101](http://hustvl.github.io/Moebius/image_assets/ffhq/09726_masked_gt.png)![Image 102](http://hustvl.github.io/Moebius/image_assets/ffhq/09726_ours.png)

![Image 103](http://hustvl.github.io/Moebius/image_assets/celebahq/27950_masked_gt.png)![Image 104](http://hustvl.github.io/Moebius/image_assets/celebahq/27950_ours.png)

![Image 105](http://hustvl.github.io/Moebius/image_assets/celebahq/29318_masked_gt.png)![Image 106](http://hustvl.github.io/Moebius/image_assets/celebahq/29318_ours.png)

![Image 107](http://hustvl.github.io/Moebius/image_assets/ffhq/09785_masked_gt.png)![Image 108](http://hustvl.github.io/Moebius/image_assets/ffhq/09785_ours.png)

![Image 109](http://hustvl.github.io/Moebius/image_assets/celebahq/29065.gt_with_mask.png)![Image 110](http://hustvl.github.io/Moebius/image_assets/celebahq/29065.ours.png)

![Image 111](http://hustvl.github.io/Moebius/image_assets/ffhq/09124.gt_with_mask.png)![Image 112](http://hustvl.github.io/Moebius/image_assets/ffhq/09124.ours.png)

![Image 113](http://hustvl.github.io/Moebius/image_assets/celebahq/25694_masked_gt.png)![Image 114](http://hustvl.github.io/Moebius/image_assets/celebahq/25694_ours.png)

![Image 115](http://hustvl.github.io/Moebius/image_assets/ffhq/09107_masked_gt.png)![Image 116](http://hustvl.github.io/Moebius/image_assets/ffhq/09107_ours.png)

![Image 117](http://hustvl.github.io/Moebius/image_assets/celebahq/27616_masked_gt.png)![Image 118](http://hustvl.github.io/Moebius/image_assets/celebahq/27616_ours.png)

![Image 119](http://hustvl.github.io/Moebius/image_assets/celebahq/27831_masked_gt.png)![Image 120](http://hustvl.github.io/Moebius/image_assets/celebahq/27831_ours.png)

![Image 121](http://hustvl.github.io/Moebius/image_assets/celebahq/28259_masked_gt.png)![Image 122](http://hustvl.github.io/Moebius/image_assets/celebahq/28259_ours.png)

![Image 123](http://hustvl.github.io/Moebius/image_assets/celebahq/28943.gt_with_mask.png)![Image 124](http://hustvl.github.io/Moebius/image_assets/celebahq/28943.ours.png)

![Image 125](http://hustvl.github.io/Moebius/image_assets/ffhq/09728_masked_gt.png)![Image 126](http://hustvl.github.io/Moebius/image_assets/ffhq/09728_ours.png)

![Image 127](http://hustvl.github.io/Moebius/image_assets/ffhq/09778.gt_with_mask.png)![Image 128](http://hustvl.github.io/Moebius/image_assets/ffhq/09778.ours.png)

![Image 129](http://hustvl.github.io/Moebius/image_assets/celebahq/27135_masked_gt.png)![Image 130](http://hustvl.github.io/Moebius/image_assets/celebahq/27135_ours.png)

![Image 131](http://hustvl.github.io/Moebius/image_assets/ffhq/09794_masked_gt.png)![Image 132](http://hustvl.github.io/Moebius/image_assets/ffhq/09794_ours.png)

![Image 133](http://hustvl.github.io/Moebius/image_assets/ffhq/09884_masked_gt.png)![Image 134](http://hustvl.github.io/Moebius/image_assets/ffhq/09884_ours.png)

![Image 135](http://hustvl.github.io/Moebius/image_assets/ffhq/09970_masked_gt.png)![Image 136](http://hustvl.github.io/Moebius/image_assets/ffhq/09970_ours.png)

![Image 137](http://hustvl.github.io/Moebius/image_assets/celebahq/27455_masked_gt.png)![Image 138](http://hustvl.github.io/Moebius/image_assets/celebahq/27455_ours.png)

![Image 139](http://hustvl.github.io/Moebius/image_assets/ffhq/09379_masked_gt.png)![Image 140](http://hustvl.github.io/Moebius/image_assets/ffhq/09379_ours.png)

![Image 141](http://hustvl.github.io/Moebius/image_assets/ffhq/09592_masked_gt.png)![Image 142](http://hustvl.github.io/Moebius/image_assets/ffhq/09592_ours.png)

![Image 143](http://hustvl.github.io/Moebius/image_assets/celebahq/21316.gt_with_mask.png)![Image 144](http://hustvl.github.io/Moebius/image_assets/celebahq/21316.ours.png)

## Comparison on Natural Scenes (Places2)

![Image 145](http://hustvl.github.io/Moebius/image_assets/tab3.png)![Image 146](http://hustvl.github.io/Moebius/image_assets/sup_showcase_places_v2.png)

## Comparison on Portrait Scenes (CelebA-HQ, FFHQ)

![Image 147](http://hustvl.github.io/Moebius/image_assets/tab4.png)![Image 148](http://hustvl.github.io/Moebius/image_assets/sup_showcase_celebahq_ffhq.png)

## BibTeX

```
@misc{DuanAndXu2026Moebius,
      title={Moebius: 0.2B Lightweight Image Inpainting Framework with 10B-Level Performance},
      author={Kangsheng Duan and Ziyang Xu and Wenyu Liu and Xiaohu Ruan and Xiaoxin Chen and Xinggang Wang},
      year={2026},
      eprint={2606.19195},
      archivePrefix={arXiv},
      primaryClass={cs.CV},
      url={https://arxiv.org/abs/2606.19195},
}
```

