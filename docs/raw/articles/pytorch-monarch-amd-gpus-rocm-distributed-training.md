---
source: newsletter
source_url: https://pytorch.org/blog/bringing-pytorch-monarch-to-amd-gpus-single-controller-distributed-training-on-rocm/
ingested: 2026-07-08
sha256: 5c7549a8a8f24b2fc9dd973176cf732d1d5423409632222cfb1deb11c87be33a
---

# Bringing PyTorch Monarch to AMD GPUs: Single-Controller Distributed Training on ROCm

### Featured projects

*   [![Image 1: PyTorch logo](https://pytorch.org/wp-content/uploads/2026/05/PyTorch-Logo-2022_RGB_PyTorchLogo_Horiz_fullColor_RGB2-300x84.png)](https://pytorch.org/projects/pytorch/ "PyTorch")

Training state-of-the-art large language models (LLMs) with billions of parameters requires distributed training across hundreds or thousands of GPUs. At this scale, hardware failures are not exceptional events—they are expected. A single GPU memory error, network partition, or node crash can bring down an entire training run that has been progressing for days or weeks. While our [previous work](https://pytorch.org/blog/efficient-moe-pre-training-at-scale-with-torchtitan/) demonstrated near-linear scaling of FP8 training at scale (achieving 96.16% scaling efficiency on a 1024-GPU MI325 cluster with DeepSeekV3-671B), the key challenge remains: reliability at scale.

To address these challenges, we have brought PyTorch Monarch to AMD Instinct GPUs with ROCm, expanding the single-controller model beyond CUDA environments and bringing this emerging runtime to a broader hardware ecosystem.

In this blog, we will explore the architecture of PyTorch Monarch, walk through the engineering effort required to port Monarch’s GPU runtime and distributed communication stack to ROCm, and demonstrate how the system dynamically recovers from node failures without halting the entire training job. By the end, you will understand how Monarch enables elastic, fault-tolerant distributed training on AMD GPUs and why this represents a significant step toward stable, large-scale AI infrastructure.

## The Challenge: Reliability at Scale

Traditional fault-tolerance strategies rely heavily on periodic checkpointing: saving the full model state to persistent storage at regular intervals. When a failure occurs, the entire job restarts from the last checkpoint. While conceptually simple, this approach has significant drawbacks.

**Challenge****Impact**
**Checkpoint overhead**Writing hundreds of gigabytes of model state to storage consumes time and I/O bandwidth.
**Wasted computation**All progress since the last checkpoint is lost upon failure.
**Cluster idle time**The entire cluster sits idle while the failed node is replaced and the job restarts.
**Scalability limits**As cluster size grows, the probability of failure during any chec
