# 在 Amazon EKS 上使用 NVIDIA GPU Operator 管理 GPU 驱动与 CUDA

> 📊 Level ⭐⭐ | 3.4KB | `entities/在-amazon-eks-上使用-nvidia-gpu-operator-管理自定义-gpu-驱动与-cuda-工作负载.md`

# 在 Amazon EKS 上使用 NVIDIA GPU Operator 管理自定义 GPU 驱动与 CUDA 工作负载

→ [原文存档](https://aws.amazon.com/cn/blogs/china/amazon-eks-using-nvidia-gpu-operator-management-gpu-cuda/)

## 深度分析

在 Amazon EKS 上使用 NVIDIA GPU Operator 管理自定义 GPU 驱动与 CUDA 工作负载
### 核心观点
1. # 在 Amazon EKS 上使用 NVIDIA GPU Operator 管理自定义 GPU 驱动与 CUDA 工作负载
摘要：在 EKS 上结合 GPU Operator 与 Kiro+EKS MCP，管理自定义 GPU 驱动和 CUDA 工作负载。
2. 对平台团队来说，难点往往不只是“把 GPU 节点加进集群”，而是如何在可控的运维模型下同时满足几个要求：使用特定 GPU 实例类型、固定 NVIDIA driver 版本、让业务容器使用指定 CUDA runtime、支持节点自动扩缩容，并在日常排障中快速理解集群状态。
3. 本文基于一次在 Amazon EKS 上完成的实际部署与验证，介绍如何使用 EKS GPU 节点组、EKS managed node group、NVIDIA GPU Operator，以及 Kiro + AWS MCP 的 AI 运维方式，落地以下组合：
Amazon EKS 1.
4. 04 EKS optimized AMI
Amazon EC2 G5 / NVIDIA A10G
NVIDIA GPU Operator v26.
5. 1
NVIDIA driver 535.

### 关联实体

- [Scale Robot Reinforcement Learning With Nvidia Isaac Lab On ](https://github.com/QianJinGuo/wiki-public/blob/main/entities/scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on-.md)
- [Nvidia Isaac Lab Sagemaker Robot Rl Humanoid](https://github.com/QianJinGuo/wiki-public/blob/main/entities/nvidia-isaac-lab-sagemaker-robot-rl-humanoid.md)
- [Ethan He Cosmos Grok Imagine Latent Space Video Agent 20260606](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ethan-he-cosmos-grok-imagine-latent-space-video-agent-20260606.md)
- [End To End Encrypted Ml Inference With Amazon Sagemaker Ai A](072-end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-a.html)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-完全指南这可能是全网最新最全的系统化教程了32w字建议收藏-v2.md)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-最新访谈从-vibe-coding-到-agentic-engineering.md)

---

