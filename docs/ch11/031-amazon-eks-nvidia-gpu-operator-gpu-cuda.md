# 在 Amazon EKS 上使用 NVIDIA GPU Operator 管理自定义 GPU 驱动与 CUDA 工作负载

## Ch11.031 在 Amazon EKS 上使用 NVIDIA GPU Operator 管理自定义 GPU 驱动与 CUDA 工作负载

> 📊 Level ⭐⭐ | 15.6KB | `entities/eks-gpu-operator-custom-driver-cuda-workload.md`

# 在 Amazon EKS 上使用 NVIDIA GPU Operator 管理自定义 GPU 驱动与 CUDA 工作负载

## 三个独有贡献（不应合并到现有 entity）

1. **GPU driver / CUDA runtime / CUDA Toolkit 三层职责清晰分离** — 节点只装 driver（GPU Operator 统一管理），业务容器镜像固定 CUDA runtime，**节点 AMI 不装 CUDA Toolkit**。这是平台团队可标准化、可审计、可复现部署的关键架构选择。
2. **GPU Operator + Kiro + EKS MCP 的 AI 运维闭环** — 通过 MCP 把分散在 EKS / Kubernetes / 节点层 / driver 层的状态串联起来，自然语言巡检 + 只读模式生产巡检 + 知识沉淀。属于 GPU + AI Ops 的具体落地模式。
3. **GPU Operator 26.3.1 + R535 + Ubuntu 22.04 + EKS 1.34 完整版本矩阵 + 失败模式实证** — 535.309.01 验证通过；535.15.04 ImagePullBackOff；CUDA 12.2 runtime 在 R535 上向后兼容。**driver 兼容 ≠ GPU Operator 支持矩阵 + NVIDIA Container Registry 中存在 tag**。这是大量 GPU 平台踩坑的真实门槛。

## 相关实体

- [mountpoint s3 vs s3 files：eks 上 s3 数据接入的两种方案实战对比](../ch01/1074-rag.html)
- [规划 amazon eks 从 1.32 升级到 1.35：关键变更识别与逐版本实施路径](https://github.com/QianJinGuo/wiki/blob/main/entities/规划-amazon-eks-从-132-升级到-135关键变更识别与逐版本实施路径.md)
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/在-amazon-eks-上使用-nvidia-gpu-operator-管理自定义-gpu-驱动与-cuda-工作负载.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/tool-use-mcp-patterns.md)
## 深度分析

### 1. 核心问题：平台团队的 GPU 运维边界不清

平台团队在 EKS 上承载 GPU 推理/训练/微调 workload 时，难点不是"把 GPU 节点加进集群"，而是同时满足：

- 使用特定 GPU 实例类型（G5 / G6 / P 系列）
- 固定 NVIDIA driver 版本
- 业务容器使用指定 CUDA runtime
- 节点自动扩缩容
- 日常排障快速理解集群状态

AWS 提供了带 NVIDIA 组件的 accelerated AMI（预装 driver）。但**预装 driver 的 AMI + GPU Operator 同时管 driver 会导致职责重叠**，升级和排障边界变得不清晰。

**本文主张的边界划分**：

| 层级 | 管理者 | 工具 |
|------|--------|------|
| EKS 控制面、节点组、EC2 生命周期 | EKS managed node group | EKS 托管 |
| 节点 NVIDIA 软件栈（driver / container toolkit / device plugin / DCGM）| GPU Operator | Helm + Kubernetes 声明式 |
| 业务 CUDA runtime | 业务容器镜像 | `nvidia/cuda:12.2.2-runtime-ubuntu22.04` |
| 业务应用 | 业务 Pod | 应用代码 |

三处管理边界清晰后，升级和故障定位都会简单很多。

### 2. GPU Operator 的本质：在 host 节点上安装 driver

**关键认知**：GPU Operator 的 `nvidia-driver-daemonset` 不是一个普通业务容器，而是**具备 host 访问能力的特权驱动容器**。它的目标是把 NVIDIA driver 安装到节点 OS 中，让后续业务 Pod 通过 host 上的 driver 使用 GPU。

驱动安装流程：

```
节点启动（AMI 中无 NVIDIA driver）
  ↓
GPU Operator 调度 nvidia-driver-daemonset 到 GPU 节点
  ↓
驱动容器在特权模式下运行
  ├─ 使用 precompiled kernel module 或 DKMS 编译
  ├─ 将 nvidia.ko 等模块加载到 host kernel
  └─ 将 libcuda.so 等 userspace 库放到 host /run/nvidia/driver/
  ↓
节点具备 NVIDIA driver 能力
  ↓
业务 Pod 通过 NVIDIA Container Toolkit 用 host /run/nvidia/driver/* 访问 GPU
```

**重要推论**：

- 一个节点上**只能有一个** NVIDIA driver 版本
- **不可能**让同一节点的 Pod A 用 535 driver、Pod B 用 580 driver
- 需要多 driver 并行 → 拆不同 GPU node group，用 label / taint / nodeSelector 隔离
- CUDA runtime 可随业务镜像变化，但底层 driver 是节点级共享

**Driver container image ≠ 业务 CUDA 镜像**：

| 镜像 | 使用者 | 作用 |
|------|--------|------|
| `nvcr.io/nvidia/driver:535.309.01-ubuntu22.04` | GPU Operator / nvidia-driver-daemonset | 给 host 装 driver |
| `nvidia/cuda:12.2.2-runtime-ubuntu22.04` | 业务 workload Pod | 给业务容器提供 CUDA runtime |
| 业务应用镜像 | 应用 Pod | 推理 / 训练 / 图像处理 |

### 3. 关键踩坑：driver 兼容性不只是 CUDA 兼容矩阵

**反直觉**：driver 版本号理论兼容 ≠ 能用。必须同时满足两个条件：

1. **CUDA 兼容性** — R535 driver 满足 CUDA 12.2 runtime 的最低 driver 要求（向后兼容）
2. **GPU Operator 支持矩阵** — 必须确认 GPU Operator 26.3.1 提供对应 driver container image
3. **NVIDIA Container Registry 实际存在 tag** — 镜像必须可拉取

**实测失败案例**（来自本文实证）：

- 535.15.04 理论兼容 CUDA 12.2
- 但 `nvcr.io/nvidia/driver:535.15.04-ubuntu22.04` 在 registry 中**不存在**
- 结果：nvidia-driver-daemonset ImagePullBackOff
- 节点未损坏，但 driver 装不上 → Pod 全部 Pending

**生产配置必须选择 GPU Operator 支持矩阵 + NVIDIA Container Registry 中真实存在的版本**。

### 4. 节点组架构：managed vs self-managed

实测在相同 Ubuntu 22.04 EKS AMI、相同 G5 实例、相同 GPU Operator 配置下，两种节点组都能成功完成 driver 安装、GPU 资源暴露、CUDA 12.2 workload 验证。

| 维度 | Self-managed node group | Managed node group |
|------|------------------------|-------------------|
| 节点生命周期 | 用户管理 | EKS 托管 |
| 节点升级 | 用户设计滚动替换 | EKS 托管升级 |
| 故障替换 | ASG + 用户流程 | EKS 参与健康管理 |
| 自定义 AMI | 支持 | 支持 |
| GPU Operator 兼容性 | 支持 | 支持 |
| 运维负担 | 更高 | **更低** |

**结论**：managed node group 更适合作为生产默认。self-managed 保留给特殊场景（自建 ASG 体系、复杂 Spot 混合策略、完全自定义启动流程）。

### 5. 容易被忽略的调度问题：taint / toleration

**生产陷阱**：

- GPU 节点通常带 `nvidia.com/gpu=true:NoSchedule` taint → 避免普通 workload 误调度到 GPU 节点
- 如果集群里**只有**带此 taint 的 GPU 节点，**GPU Operator 控制面 Pod 会 Pending**（没有对应 toleration）
- 同时 CoreDNS、监控、日志等系统组件也会 Pending

**生产建议**：集群保留**至少一个普通节点组**，让 GPU Operator 控制面 + CoreDNS + 监控 + 日志运行在非 GPU 节点上。

这是 AI Ops 工具（Kiro + EKS MCP）能快速定位的典型问题，但人工排障需要看多层。

### 6. Kiro + EKS MCP 的 AI 运维闭环

GPU 平台运维的复杂度来自 9 层堆叠：EKS 控制面、节点组、EC2 实例、AMI、kernel、driver、container runtime、DaemonSet、Pod 调度。任何一层配置不匹配都可能表现为 Pod Pending / driver 安装失败 / device plugin 未暴露资源。

**EKS MCP Server** 让兼容 MCP 的 AI 助手通过自然语言连接并管理 EKS 集群。Kiro 原生支持 MCP，可通过 mcp-proxy-for-aws 用本地 AWS 凭证完成 SigV4 身份验证。

**AI 运维在 GPU 场景的两个具体价值**：

1. 快速梳理 GPU Operator、driver、CUDA runtime、OS/kernel、EKS 节点组之间的适配关系
2. 定位容易被忽略的调度问题（taint / toleration / Pending 根因）

**Read-only 模式适合生产巡检**（降低误操作风险）；Write 模式可辅助资源创建、修复、变更；可把版本矩阵、排障经验沉淀为可复用工程知识。

## 生产推荐组合

```
Amazon EKS managed node group
Ubuntu 22.04 EKS optimized AMI
Amazon EC2 G5 / NVIDIA A10G
NVIDIA GPU Operator v26.3.1
NVIDIA driver 535.309.01
CUDA workload image nvidia/cuda:12.2.2-runtime-ubuntu22.04
保留至少一个普通非 GPU 节点组运行系统组件和 GPU Operator 控制面
```

**Ubuntu 24.04 的情况**：建议考虑 R570 或 R580 分支 driver，而非 R535。CUDA 12.2 workload 仍可运行（向后兼容），但 driver 分支必须同时满足 OS/kernel + GPU Operator 支持矩阵。

## 实践路径（6 步）

1. 查询并选择 Ubuntu 22.04 EKS optimized AMI
2. 创建 self-managed G5 GPU 节点组
3. 安装 NVIDIA GPU Operator v26.3.1，指定 driver 535.309.01
4. 部署 CUDA 12.2 runtime workload，确认 nvidia-smi 和 GPU 资源可用
5. 引入不支持的旧 driver 535.15.04，观察 ImagePullBackOff 失败模式
6. 创建 EKS managed G5 GPU 节点组，确认同一方案在 managed node group 上同样可用

## 关键结论表

| 结论 | 说明 |
|------|------|
| EKS 支持 GPU workload 的关键在节点 NVIDIA 软件栈 + Kubernetes device plugin | GPU 资源最终通过 `nvidia.com/gpu` 暴露 |
| EKS managed node group 可承载 GPU Operator 管理的 GPU 节点 | managed 与 self-managed 功能等价 |
| **Managed node group 更适合作为生产默认选项** | EKS 托管节点升级和生命周期，降低运维负担 |
| GPU Operator 可统一安装指定 driver | 535.309.01 在 Ubuntu 22.04 + kernel 6.8 验证通过 |
| **CUDA 版本应放在业务容器镜像中管理** | 节点不需装 CUDA Toolkit |
| **不在支持矩阵 / registry 中不存在的 driver 版本不可用** | 535.15.04 → ImagePullBackOff |
| **GPU Operator 控制面建议运行在普通节点** | 只有 tainted GPU 节点时控制面 Pod 可能 Pending |
| Kiro + AWS MCP 提升 EKS 运维效率 | 自然语言巡检、排障、知识沉淀 |

## 与现有相关实体的差异化

| 实体 | 焦点 | 与本文关系 |
|------|------|----------|
| [Building Blocks For Foundation Model Training And Inference On Aws](ch11/119-building-blocks-for-foundation-model-training-and-inference.html) | AWS 训练/推理基础设施通用构件 | 上层基础设施视角，本文专注 GPU 节点驱动管理 |
| [Foundation Model Building Blocks](../ch03/087-foundation-model-building-blocks.html) | 训练/inference building blocks | 同上，更上层 |
| [在 Amazon Ec2 Gpu 实例上部署 Nvidia Nemoclaw 以 Amazon Bedrock 作为推理](ch11/154-amazon-bedrock.html) | Nemoclaw 安全沙箱 + Bedrock 混合推理 | 应用层，本文是底层 driver 管理 |
| [Kiro Cli Fluentbit Logging Solution Eks S3 Parquet Comparison](https://github.com/QianJinGuo/wiki/blob/main/entities/kiro-cli-fluentbit-logging-solution-eks-s3-parquet-comparison.md) | EKS 日志采集 + S3 Parquet + Kiro CLI | 同样使用 Kiro CLI 但场景是日志，不是 GPU 运维 |
| [From Manual To Smart Use Kiro Cli Opensearch Mcp To Make Everyone An Opensearch Expert](https://github.com/QianJinGuo/wiki/blob/main/entities/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert.md) | Kiro + OpenSearch MCP | MCP 通用方法论，本文是 GPU + EKS MCP 应用 |
| [Gpu Virtualization Using Mig Technology On Amazon Sagemaker Hyperpod](../ch04/029-pod.html) | SageMaker HyperPod MIG 虚拟化 | SageMaker 路径，与 EKS 路径平行 |

**本文填补的空白**：EKS + GPU Operator + 自定义 driver 管理的完整版本矩阵 + 失败模式实证 + AI 运维闭环。现有 entities 中无 GPU Operator 主题覆盖。

## 相关主题

- [Building Blocks For Foundation Model Training And Inference On Aws](ch11/119-building-blocks-for-foundation-model-training-and-inference.html)
- [Foundation Model Building Blocks](../ch03/087-foundation-model-building-blocks.html)
- [在 Amazon Ec2 Gpu 实例上部署 Nvidia Nemoclaw 以 Amazon Bedrock 作为推理](ch11/154-amazon-bedrock.html)
- [Kiro Cli Fluentbit Logging Solution Eks S3 Parquet Comparison](https://github.com/QianJinGuo/wiki/blob/main/entities/kiro-cli-fluentbit-logging-solution-eks-s3-parquet-comparison.md)
- [From Manual To Smart Use Kiro Cli Opensearch Mcp To Make Everyone An Opensearch Expert](https://github.com/QianJinGuo/wiki/blob/main/entities/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert.md)
- [Gpu Virtualization Using Mig Technology On Amazon Sagemaker Hyperpod](../ch04/029-pod.html)
- [Build Multi Tenant Ai Agent On Eks Graviton Openclaw K8S Practice](ch11/222-openclaw.html)
- [Openclaw Amazon Bedrock Eks Printer Qc](ch11/154-amazon-bedrock.html)

---

