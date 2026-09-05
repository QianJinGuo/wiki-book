---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/amazon-eks-using-nvidia-gpu-operator-management-gpu-cuda/
ingested: 2026-06-03
feed_name: AWS China Blog
source_published: 2026-06-03T09:22:40Z
sha256: fea37cf5fa65db5666a6c3b6818b9999a98b00f074e2f6d0b9bc628074643d8c
---

# 在 Amazon EKS 上使用 NVIDIA GPU Operator 管理自定义 GPU 驱动与 CUDA 工作负载

摘要：在 EKS 上结合 GPU Operator 与 Kiro+EKS MCP，管理自定义 GPU 驱动和 CUDA 工作负载。  
  
**目录**

01 一、引言

02 二、Amazon EKS 对 GPU 工作负载的支持方式

03 三、为什么优先考虑 EKS managed node group

04 四、Kiro + AWS MCP 带来的 AI 运维体验

05 五、客户为什么需要自定义 GPU driver 和 CUDA 版本

06 六、NVIDIA GPU Operator 的价值

07 七、实践路径

08 八、实践结论

09 九、总结

10 十、参考资料

* * *

## **一、引言**

生成式 AI、推理服务、模型微调和图像处理等工作负载正在让 GPU 成为 Kubernetes 平台里的关键资源。对平台团队来说，难点往往不只是“把 GPU 节点加进集群”，而是如何在可控的运维模型下同时满足几个要求：使用特定 GPU 实例类型、固定 NVIDIA driver 版本、让业务容器使用指定 CUDA runtime、支持节点自动扩缩容，并在日常排障中快速理解集群状态。

本文基于一次在 [Amazon EKS](<https://aws.amazon.com/cn/eks/>) 上完成的实际部署与验证，介绍如何使用 EKS GPU 节点组、EKS managed node group、NVIDIA GPU Operator，以及 Kiro + AWS MCP 的 AI 运维方式，落地以下组合：
    
    
    Amazon EKS 1.34
    Ubuntu 22.04 EKS optimized AMI
    Amazon EC2 G5 / NVIDIA A10G
    NVIDIA GPU Operator v26.3.1
    NVIDIA driver 535.309.01
    CUDA workload image nvidia/cuda:12.2.2-runtime-ubuntu22.04
    

实际验证表明：在不预装 NVIDIA driver 的 Ubuntu 22.04 EKS 节点上，GPU Operator 可以自动安装指定版本的 NVIDIA driver，并同时适配 EKS self-managed node group 和 EKS managed node group。业务容器无需依赖节点上的 CUDA Toolkit，只要容器镜像固定 CUDA runtime，且节点 driver 满足 CUDA runtime 的最低要求，就可以稳定运行。

## **二、Amazon EKS 对 GPU 工作负载的支持方式**

Amazon EKS 通过 EC2 节点承载 GPU workload。对于 NVIDIA GPU 场景，常见选择包括 G5、G6、P 系列等 GPU 实例族。本文中的实际验证使用 [Amazon EC2](<https://aws.amazon.com/cn/ec2/>) G5 实例，GPU 型号为 NVIDIA A10G。

在 Kubernetes 中，GPU 并不是普通 CPU 或内存资源。节点需要具备以下能力后，Pod 才能通过 nvidia.com/gpu 申请 GPU：

  * 节点操作系统和 kernel 能够加载 NVIDIA driver；
  * 容器运行时具备 NVIDIA Container Toolkit 集成；
  * Kubernetes 集群中运行 NVIDIA device plugin；
  * 节点被正确发现并打上 GPU 特征标签；
  * GPU workload 使用合适的 toleration、node selector 和 GPU resource limit。



AWS 提供了带 NVIDIA 组件的 accelerated AMI，可以让 GPU 节点开箱具备一定 GPU 能力。但在客户需要自定义 driver 版本时，预装 driver 的 AMI 反而会带来职责重叠：节点 AMI 管 driver，GPU Operator 也管 driver，升级和排障边界容易变得不清晰。

因此，本文采用了另一种更适合平台标准化的方式：节点 AMI 不预装 NVIDIA driver 和 CUDA Toolkit，driver、container toolkit、device plugin、DCGM exporter 和 GPU feature discovery 由 NVIDIA GPU Operator 统一管理。

## **三、为什么优先考虑 EKS managed node group**

EKS 支持 self-managed node group 和 managed node group 两种节点组模式。两者底层都运行在 EC2 和 Auto Scaling Group 上，都可以承载 GPU 实例，也都可以配合自定义 AMI 使用。

区别在于节点生命周期管理责任：

维度 | Self-managed node group | Managed node group  
---|---|---  
节点生命周期 | 用户自行管理 | EKS 托管管理  
节点升级 | 用户设计滚动替换流程 | EKS 提供托管升级能力  
故障替换 | 主要依赖 ASG 和用户流程 | EKS 参与节点健康管理  
自定义 AMI | 支持 | 支持  
GPU Operator 兼容性 | 支持 | 支持  
运维负担 | 更高 | 更低  
  
实际部署覆盖了 self-managed 和 managed 两种节点组。结果显示，在相同 Ubuntu 22.04 EKS AMI、相同 G5 实例、相同 GPU Operator 配置下，两种节点组都可以成功完成 driver 安装、GPU 资源暴露和 CUDA 12.2 workload 验证。

这意味着，如果客户没有必须自行控制 ASG 生命周期的特殊需求，managed node group 更适合作为生产默认选项。它可以降低节点升级、替换和日常运维负担，同时仍然保留使用自定义 AMI 与 GPU Operator 管理 driver 的灵活性。

Self-managed node group 仍然适合一些特殊场景，例如客户已有成熟的 ASG 管理体系、需要更复杂的 Spot 与 On-Demand 混合策略，或者需要完全自定义节点启动流程。

## **四、Kiro + AWS MCP 带来的 AI 运维体验**

GPU 平台运维的复杂度通常来自多个层级：EKS 控制面、节点组、EC2 实例、AMI、kernel、driver、container runtime、DaemonSet、Pod 调度、taint/toleration、GPU 资源发现，以及业务容器 CUDA runtime。任何一层配置不匹配，都可能表现为 Pod Pending、driver 安装失败、device plugin 未暴露资源，或 workload 无法访问 GPU。

AWS 正在通过 Model Context Protocol (MCP) 改善这类场景的运维体验。根据 Amazon EKS MCP Server 文档，EKS MCP Server 可以让兼容 MCP 的 AI 助手通过自然语言方式连接并管理 EKS 集群。Kiro 原生支持 MCP，可以通过 mcp-proxy-for-aws 使用本地 AWS 凭证完成 AWS SigV4 身份验证，并与 EKS MCP Server 交互。

这类方式对 GPU 运维特别有价值：

  * 平台工程师可以用自然语言询问集群、节点组、Kubernetes 资源和异常状态；
  * AI 助手可以把分散在 EKS、Kubernetes 和节点层的状态串联起来；
  * 只读模式可以用于生产环境巡检和排障，降低误操作风险；
  * 在授权允许的情况下，写入模式可以辅助完成资源创建、修复和变更；
  * 团队可以把版本矩阵、排障经验和运行方式沉淀为可复用的工程知识。



在这个场景中，AI 运维的价值主要体现在两个方面。第一，它帮助快速梳理 GPU Operator、driver、CUDA runtime、OS/kernel 和 EKS 节点组之间的适配关系。第二，它帮助定位一个容易被忽略的调度问题：当集群里只有带 nvidia.com/gpu=true:NoSchedule taint 的 GPU 节点时，GPU Operator 控制面 Pod 如果没有对应 toleration，就会 Pending。生产上更推荐保留至少一个普通节点组，让 GPU Operator 控制面、CoreDNS、监控、日志等系统组件运行在非 GPU 节点上。

## **五、客户为什么需要自定义 GPU driver 和 CUDA 版本**

很多客户不会简单接受“使用最新版 driver 和最新版 CUDA”的默认答案。原因包括：

  * 业务镜像已经基于特定 CUDA runtime 构建，例如 CUDA 12.2；
  * 机器学习框架、推理引擎或商业软件对 driver/CUDA 组合有认证要求；
  * 生产环境需要固定版本以满足可重复部署、审计和回滚要求；
  * 客户希望不同业务团队可以使用不同 CUDA 容器镜像，而不是在节点 AMI 上安装 CUDA Toolkit；
  * 平台团队希望 driver 升级由统一组件管理，而不是散落在 AMI 构建脚本和节点手工操作中。



因此，更合理的职责划分是：
    
    
    NVIDIA driver: 节点级能力，由 GPU Operator 管理
    CUDA runtime: workload 级能力，由业务容器镜像固定
    CUDA Toolkit: 不建议安装在 EKS GPU 节点 AMI 中
    

本文选择 535.309.01 作为节点 driver，并使用 nvidia/cuda:12.2.2-runtime-ubuntu22.04 作为 workload 镜像。CUDA 12.2 workload 可以运行，是因为 R535 driver 满足 CUDA 12.2 runtime 的最低 driver 要求。

另一个重要结论是，driver 版本不能只看版本号是否“理论兼容”，还要确认 GPU Operator 是否提供对应 driver container image，以及该 driver 是否在目标 OS/kernel 的 precompiled 支持矩阵中。实际验证中，旧版本 535.15.04 对应的 driver image 不存在，节点进入 ImagePullBackOff。这个失败模式没有损坏节点，但说明生产配置必须选择 GPU Operator 支持矩阵和 NVIDIA Container Registry 中真实存在的版本。

## **六、NVIDIA GPU Operator 的价值**

NVIDIA GPU Operator 的核心价值是把 GPU 节点所需的多个组件从“手工安装和 AMI 固化”转成 Kubernetes 原生的声明式管理。

在 EKS 上，GPU Operator 通常通过 Helm 安装到集群中。它不是 EKS 托管插件，而是运行在集群内的一组 Kubernetes workload。典型模式是：Operator 控制面组件运行在普通节点组，负责协调和管理；GPU 相关 DaemonSet 运行在 GPU 节点上，负责安装 driver、配置 NVIDIA Container Toolkit、暴露 nvidia.com/gpu、采集 GPU 指标并执行验证。
    
    
    EKS Cluster
    ├─ 普通节点组
    │   └─ GPU Operator 控制面组件
    │      ├─ gpu-operator controller
    │      └─ node-feature-discovery master/gc
    │
    └─ GPU 节点组
        ├─ nvidia-driver-daemonset
        ├─ nvidia-container-toolkit-daemonset
        ├─ nvidia-device-plugin-daemonset
        ├─ gpu-feature-discovery
        ├─ nvidia-dcgm-exporter
        └─ validator pods
    

这种部署模式要求集群里最好保留至少一个普通节点组。GPU 节点通常会带有 nvidia.com/gpu=true:NoSchedule taint，如果集群里只有 GPU 节点，Operator 控制面或其他系统组件可能因为没有对应 toleration 而 Pending。

这里需要特别说明“GPU Operator 安装 driver”的含义。GPU Operator 会在 GPU 节点上调度 nvidia-driver-daemonset。这个 DaemonSet 运行的不是普通业务容器，而是具备 host 访问能力的特权驱动容器。它的目标是把 NVIDIA driver 安装到节点操作系统中，让后续业务 Pod 可以通过节点上的 driver 使用 GPU。

驱动安装过程可以简化理解为：
    
    
    节点启动，AMI 中没有预装 NVIDIA driver
      ↓
    GPU Operator 调度 nvidia-driver-daemonset 到 GPU 节点
      ↓
    驱动容器在特权模式下运行
      ├─ 使用预编译 kernel module，或通过 DKMS 编译 kernel module
      ├─ 将 nvidia.ko 等模块加载到 host kernel
      └─ 将 libcuda.so 等 userspace driver 库放到 host 上的 /run/nvidia/driver/
      ↓
    节点具备 NVIDIA driver 能力
      ↓
    业务 Pod 通过 NVIDIA Container Toolkit
    使用 host 上的 /run/nvidia/driver/* 库访问 GPU
    

因此，GPU Operator 的驱动容器本质上仍然是在给 host 安装和管理 driver。安装完成后，同一个节点上的所有 GPU workload 共用这套 host driver。这也带来几个重要推论：

  * 一个节点上只能有一个 NVIDIA driver 版本；
  * 不可能让同一节点上的 Pod A 使用 535 driver，同时让 Pod B 使用 580 driver；
  * 如果需要同时运行不同 driver 版本，应使用不同 GPU node group / node pool，并通过 label、taint、nodeSelector 或调度策略把 workload 分配到对应节点池；
  * CUDA runtime 可以随业务容器镜像变化，但底层 driver 是节点级共享能力。



这里的 driver container image 可以理解为 GPU Operator 用来给节点安装 NVIDIA driver 的“安装包 + 执行环境”。它不是业务 Pod 使用的 CUDA 镜像，而是 nvidia-driver-daemonset 使用的镜像。例如，当指定 driver 版本为 535.309.01 时，GPU Operator 会使用类似下面的 driver image：
    
    
    nvcr.io/nvidia/driver:535.309.01-ubuntu22.04
    

这个镜像需要同时匹配 driver 版本和节点 OS。它提供 driver 安装材料、kernel module、userspace driver libraries 和安装逻辑，并在特权容器中完成 host driver 的安装。它和业务 CUDA 镜像的职责不同：

镜像 | 使用者 | 作用  
---|---|---  
nvcr.io/nvidia/driver:535.309.01-ubuntu22.04 | GPU Operator / nvidia-driver-daemonset | 给 host 节点安装 NVIDIA driver  
nvidia/cuda:12.2.2-runtime-ubuntu22.04 | 业务 workload Pod | 给业务容器提供 CUDA runtime  
业务应用镜像 | 应用 Pod | 运行模型推理、训练、图像处理等业务逻辑  
  
这也是为什么不是所有 535.x 小版本都能直接使用。除了理论上的 CUDA compatibility，还必须确认 NVIDIA Container Registry 中存在对应的 driver container image tag。实际验证中，535.15.04 对应的 nvcr.io/nvidia/driver:535.15.04-ubuntu22.04 镜像不存在，因此 driver DaemonSet 会进入 ImagePullBackOff。

在实际部署中，GPU Operator 自动完成了以下工作：

  * 在 GPU 节点上安装指定版本 NVIDIA driver；
  * 安装 NVIDIA Container Toolkit；
  * 部署 NVIDIA device plugin，向 Kubernetes 暴露 nvidia.com/gpu；
  * 运行 GPU Feature Discovery，为节点添加 GPU 相关标签；
  * 部署 DCGM Exporter，提供 GPU 监控指标；
  * 运行 validator，验证 driver、runtime 和 CUDA 访问是否正常。



这带来几个直接收益：

  * 新 GPU 节点加入集群后，driver 和 GPU 组件自动安装；
  * driver 版本可以通过 Helm values 或 GitOps 固定；
  * AMI 不需要内置 CUDA Toolkit，降低镜像维护复杂度；
  * 业务镜像可以独立选择 CUDA runtime；
  * GPU 节点初始化流程更容易标准化和审计。



GPU Operator 与 EKS 的适配关系可以总结为：EKS 负责 Kubernetes 控制面、节点组和 EC2 生命周期；GPU Operator 负责节点上的 NVIDIA 软件栈；业务 workload 负责选择自己的 CUDA runtime。三者边界清晰后，升级和故障定位都会简单很多。

## **七、实践路径**

本文使用一个 EKS 1.34 集群，在 us-west-2 区域创建 GPU 节点组。由于当时可用的 Ubuntu 22.04 EKS optimized AMI 最高对应 Kubernetes 1.32 kubelet，实际节点 kubelet 为 1.32，控制面为 1.34。该差异仍在 Kubernetes version skew policy 支持范围内。

整体实践路径分为六个阶段：

1\. 查询并选择 Ubuntu 22.04 EKS optimized AMI；

2\. 创建 self-managed G5 GPU 节点组；

3\. 安装 NVIDIA GPU Operator v26.3.1，并指定 driver 535.309.01；

4\. 部署 CUDA 12.2 runtime workload，确认 nvidia-smi 和 GPU 资源可用；

5\. 引入不支持的旧 driver 版本 535.15.04，观察失败模式；

6\. 创建 EKS managed G5 GPU 节点组，确认同一方案在 managed node group 上同样可用。

实践中特别关注了一个生产常见条件：GPU 节点带有 nvidia.com/gpu=true:NoSchedule taint，普通 workload 不会误调度到昂贵 GPU 节点。与此同时，集群保留普通节点组，用于运行 GPU Operator 控制面和其他系统组件。

## **八、实践结论**

这一路径得到以下结论：

结论 | 说明  
---|---  
EKS 支持 GPU workload 的关键在于节点 NVIDIA 软件栈与 Kubernetes device plugin | GPU 资源最终通过 nvidia.com/gpu 暴露给 Pod  
EKS managed node group 可以承载 GPU Operator 管理的 GPU 节点 | managed 与 self-managed 功能等价  
Managed node group 更适合作为生产默认选项 | EKS 托管节点升级和生命周期，降低运维负担  
GPU Operator 可以统一安装指定 driver | 535.309.01 在 Ubuntu 22.04 + kernel 6.8 场景验证通过  
CUDA 版本应放在业务容器镜像中管理 | 节点不需要安装 CUDA Toolkit  
Ubuntu 22.04 更适合 R535 + CUDA 12.2 的组合 | GPU Operator 26.3.1 precompiled driver 支持 Ubuntu 22.04 + R535  
不在支持矩阵或 registry 中不存在的 driver 版本不可用 | 535.15.04 的结果为 ImagePullBackOff  
GPU Operator 控制面建议运行在普通节点 | 只有 tainted GPU 节点时，控制面 Pod 可能 Pending  
Kiro + AWS MCP 可以提升 EKS 运维效率 | 适合用于自然语言巡检、排障和知识沉淀  
  
最终推荐的生产组合是：
    
    
    Amazon EKS managed node group
    Ubuntu 22.04 EKS optimized AMI
    Amazon EC2 G5 / NVIDIA A10G
    NVIDIA GPU Operator v26.3.1
    NVIDIA driver 535.309.01
    CUDA workload image nvidia/cuda:12.2.2-runtime-ubuntu22.04
    保留至少一个普通非 GPU 节点组运行系统组件和 GPU Operator 控制面
    

如果客户必须使用 Ubuntu 24.04，则建议考虑 R570 或 R580 分支 driver，而不是 R535。CUDA 12.2 workload 仍然可以运行，因为 NVIDIA driver 对旧 CUDA runtime 具备向后兼容能力，但 driver 分支必须同时满足 OS/kernel 和 GPU Operator 支持矩阵。

## **九、总结**

在 EKS 上运行 GPU workload 时，最佳实践不是把所有组件都固化进 AMI，而是把节点生命周期、NVIDIA 软件栈和业务 CUDA runtime 分层管理。EKS managed node group 提供更低运维负担的节点生命周期管理；NVIDIA GPU Operator 提供声明式、可自动化的 GPU driver 和设备插件管理；业务团队通过容器镜像固定 CUDA runtime。

结合 Kiro 和 AWS MCP，平台团队还可以用自然语言方式进行 EKS 集群巡检、资源查询和问题排查，把 GPU 平台运维从“查命令、拼状态、逐层排错”推进到“上下文感知、权限可控、可沉淀”的 AI 运维模式。

**下一步行动：**

**相关产品：**

  * [Amazon EKS](<https://aws.amazon.com/cn/eks/?p=bl_pr_eks_l=1>) — 托管式 Kubernetes 服务
  * [Amazon EC2](<https://aws.amazon.com/cn/ec2/?p=bl_pr_ec2_l=2>) — 安全且可调整大小的计算容量
  * [Amazon KMS](<https://aws.amazon.com/cn/kms/?p=bl_pr_kms_l=3>) — 托管式密钥管理



**相关文章：**

  * [用 Kiro CLI 自动搭建 FluentBit 日志采集方案：两种 EKS 埋点数据落地 S3 Parquet 的实战对比](<https://aws.amazon.com/cn/blogs/china/kiro-cli-fluentbit-logging-solution-eks-s3-parquet-comparison/?p=bl_ar_l=1>)
  * [从IDC到云上GPU：基于 Amazon EKS 的大模型推理混合云弹性部署实践](<https://aws.amazon.com/cn/blogs/china/idc-gpu-based-on-amazon-eks-large-model-inference-hybrid-cloud-elastic-deploy-practice/?p=bl_ar_l=2>)
  * [使用 Karpenter 和 HAMi 实现 GPU 分片和动态扩缩容](<https://aws.amazon.com/cn/blogs/china/using-karpenter-and-hami-for-gpu-fractional-sharing-and-dynamic-scaling/?p=bl_ar_l=3>)
  * [宣布推出由 NVIDIA RTX PRO 6000 Blackwell 服务器版 GPU 加速的 Amazon EC2 G7e 实例](<https://aws.amazon.com/cn/blogs/china/announcing-amazon-ec2-g7e-instances-accelerated-by-nvidia-rtx-pro-6000-blackwell-server-edition-gpus/?p=bl_ar_l=4>)
  * [由定制英特尔至强 6 处理器提供支持的 Amazon EC2 X8i 实例正式发布，适用于内存密集型工作负载](<https://aws.amazon.com/cn/blogs/china/amazon-ec2-x8i-instances-powered-by-custom-intel-xeon-6-processors-are-generally-available-for-memory-intensive-workloads/?p=bl_ar_l=5>)



## **十、参考资料**

  * [Amazon EKS MCP 服务器入门](<https://docs.aws.amazon.com/zh_cn/eks/latest/userguide/eks-mcp-getting-started.html>)
  * [NVIDIA GPU Operator 26.3 Platform Support](<https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/26.3/platform-support.html>)
  * [NVIDIA GPU Operator with Amazon EKS](<https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/26.3/amazon-eks.html>)
  * [NVIDIA Data Center Drivers and CUDA Toolkit Versions](<https://docs.nvidia.com/datacenter/tesla/drivers/supported-drivers-and-cuda-toolkit-versions.html>)
  * [CUDA 12.2 Release Notes](<https://docs.nvidia.com/cuda/archive/12.2.0/cuda-toolkit-release-notes/index.html>)
  * [Amazon EC2 G5 Instances](<https://aws.amazon.com/ec2/instance-types/g5/>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 薛东

亚马逊云科技资深解决方案架构师，负责基于亚马逊云科技的解决方案设计和构建。加入亚马逊云科技之前曾就职于 EMC，阿里云等头部 IT 企业，积累了丰富的企业级应用开发，测试和架构经验。目前服务亚马逊云科技中国媒体和广告行业客户。专注于无服务，安全，生成式 AI 等技术方向。

### 任耀洲

亚马逊云科技解决方案架构师，负责企业客户应用在亚马逊云科技的架构咨询和设计。在微服务架构设计、数据库等领域有丰富的经验。

* * *

## 亚马逊云科技中国峰会

Agentic AI 代码秀、Hands-on Lab、Chalk Talk 白板推演——为技术构建者准备的深度内容。 [](<https://aws.amazon.com/cn/events/summits/shanghai/?ectrk=jyLXNovBYB51qgzUEipIpZcxlfE5%2Bs7NfDTnZwR7hFYtQmPUSToTuN%2FZO5doh20ZJ%2FloW6Rom0l3P4LLcoyUPA%3D%3D&sc_icampaign=glb-summit-blog-p3&sc_ichannel=ha&sc_iplace=blog&trk=ab30be54-aedd-480a-9364-ab0bf98e982d>) |   
---|---
