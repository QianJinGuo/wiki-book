# Reducing container cold start times using SOCI index on DLAMI and DLC

> 📊 Level ⭐ | 2.3KB | `entities/reducing-container-cold-start-times-using-soci-index-on-dlam.md`

# Reducing container cold start times using SOCI index on DLAMI and DLC

→ [原文存档](https://aws.amazon.com/blogs/machine-learning/reducing-container-cold-start-times-using-soci-index-on-dlami-and-dlc/)

## 深度分析

Reducing container cold start times using SOCI index on DLAMI and DLC
### 核心观点
1. # Reducing container cold start times using SOCI index on DLAMI and DLC
Deep Learning AMI and AWS Deep Learning Containers are now enabled with support for SOCI snapshotter and index.
2. Seekable OCI (SOCI) is a technology that enables efficient container image management through selective file downloading.
3. It uses a layer-based indexing system to map file locations within container images, allowing containers to start with only the necessary files loaded (lazy loading).
4. This approach reduces network bandwidth usage and improves container startup times, making it particularly valuable for organizations managing large container images in cloud environments.
5. In this post, we look at how to use SOCI on publicly available Deep Learning AMIs and Containers, when to use the various SOCI modes provided by the tool, and how to quickly and efficiently use this tool in your workloads today.

### 关联实体

- [Scale Robot Reinforcement Learning With Nvidia Isaac Lab On ](https://github.com/QianJinGuo/wiki-public/blob/main/entities/scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on-.md)
- [Nvidia Isaac Lab Sagemaker Robot Rl Humanoid](https://github.com/QianJinGuo/wiki-public/blob/main/entities/nvidia-isaac-lab-sagemaker-robot-rl-humanoid.md)
- [Ethan He Cosmos Grok Imagine Latent Space Video Agent 20260606](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ethan-he-cosmos-grok-imagine-latent-space-video-agent-20260606.md)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/存之有序治之有矩agent-记忆系统的工程实践与演进.md)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-最新访谈从-vibe-coding-到-agentic-engineering.md)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-完全指南这可能是全网最新最全的系统化教程了32w字建议收藏.md)

---

