# 在 Amazon EKS 上使用 NVIDIA GPU Operator 管理 GPU 驱动与 CUDA

## Ch11.212 在 Amazon EKS 上使用 NVIDIA GPU Operator 管理 GPU 驱动与 CUDA

> 📊 Level ⭐⭐ | 4.8KB | `entities/在-amazon-eks-上使用-nvidia-gpu-operator-管理自定义-gpu-驱动与-cuda-工作负载.md`

# 在 Amazon EKS 上使用 NVIDIA GPU Operator 管理自定义 GPU 驱动与 CUDA 工作负载

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/在-amazon-eks-上使用-nvidia-gpu-operator-管理自定义-gpu-驱动与-cuda-工作负载.md)

## 深度分析

在 Amazon EKS 上使用 NVIDIA GPU Operator 管理自定义 GPU 驱动与 CUDA 工作负载 涉及aws领域的核心技术议题。
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

### 内容结构
- 在 Amazon EKS 上使用 NVIDIA GPU Operator 管理自定义 GPU 驱动与 CUDA 工作负载
- **一、引言**
- **二、Amazon EKS 对 GPU 工作负载的支持方式**
- **三、为什么优先考虑 EKS managed node group**
- **四、Kiro + AWS MCP 带来的 AI 运维体验**
- **五、客户为什么需要自定义 GPU driver 和 CUDA 版本**
- **六、NVIDIA GPU Operator 的价值**
- **七、实践路径**

### 技术要点

- **aws架构**: 本文在aws方向提出的设计理念与实现路径
- **工程挑战**: 实际落地中面临的关键问题与应对策略
- **fine-tuning趋势**: 相关技术演进方向与新兴范式
### 关联实体

- [Scale Robot Reinforcement Learning With Nvidia Isaac Lab On ](ch01/833-scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on.md)
- [Nvidia Isaac Lab Sagemaker Robot Rl Humanoid](https://github.com/QianJinGuo/wiki/blob/main/entities/nvidia-isaac-lab-sagemaker-robot-rl-humanoid.md)
- [Ethan He Cosmos Grok Imagine Latent Space Video Agent 20260606](ch04/503-agent.md)
- [End To End Encrypted Ml Inference With Amazon Sagemaker Ai A](ch11/044-end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-a.md)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](ch03/012-openclaw.md)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](ch04/503-agent.md)

## 实践启示
1. **工程落地**: aws领域方案需关注可观测性、可维护性和成本效率
2. **技术选型**: 根据场景选择合适的技术栈，避免过度设计或盲目追新
3. **持续迭代**: 建立数据驱动的反馈闭环，持续优化系统表现
4. **风险管控**: 引入新技术需评估对现有系统稳定性的影响，做好降级预案

---

