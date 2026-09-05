---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/announcing-amazon-ec2-g7-instances-accelerated-by-nvidia-rtx-pro-4500-blackwell-server-edition-gpus/
ingested: 2026-06-26
feed_name: AWS China Blog
source_published: 2026-06-26T08:39:17Z
sha256: 186c4550e94123a5d0162feed185d0c9f49145d4e2dda1a87a983d57365b1951
---

# 宣布推出由 NVIDIA RTX PRO 4500 Blackwell 服务器版 GPU 加速的 Amazon EC2 G7 实例

今天，我们宣布 [Amazon Elastic Compute Cloud（Amazon EC2）](<https://aws.amazon.com/ec2/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) G7 实例正式发布。该实例可为人工智能推理、图形和数据分析工作负载提供高性能 GPU 加速。

AWS 是首家支持 NVIDIA RTX PRO 4500 Blackwell 服务器版 GPU 的主要云服务提供商。G7 实例由该款 GPU 加速，搭配定制的第六代英特尔至强可扩展处理器；相较于 [G6 实例](<https://aws.amazon.com/ec2/instance-types/g6/>)，AI 推理性能提升高达 4.6 倍，图形性能提升高达 2.1 倍。此外，G7 实例还可加快基于 [Amazon Elastic Kubernetes Service（Amazon EKS）](<https://aws.amazon.com/eks/>)上的 [Amazon EMR](<https://aws.amazon.com/emr/>) 的 GPU 加速分析的性能。G7 实例非常适合各种支持 GPU 的工作负载，包括 AI 推理、图形渲染、视频转码和分析、空间计算、虚拟桌面基础架构（VDI）和数据分析。

以下是 G7 实例相较于上一代的改进：

  * **GPU 内存速度加快** ：与 G6 实例相比，NVIDIA RTX PRO 4500 Blackwell 服务器版 GPU 的 GPU 内存容量提升了 1.33 倍，GPU 内存带宽提升了 2.45 倍。G7 实例的每个 GPU 均配备 32 GB 的 GPU 内存、第 5 代 Tensor 内核和第 4 代 RT 内核，可提供增强的 AI 推理和图形性能。
  * **高性能联网和存储** ：G7 实例具有 700 Gbps 支持 EFA 的网络吞吐量（是 G6 的 7 倍），可实现 AI 推理、图形密集型应用程序和 GPU 加速数据分析工作负载发挥最佳性能所需的低延迟、高带宽连接。G7 实例支持高达 7.6 TB 的本地 NVMe SSD 存储，使您能够将大型模型和数据集就近存放至计算节点、削减数据传输开销并提升吞吐量。
  * **高级视频编码和解码引擎** ：第九代 NVENC 和第六代 NVDEC 引擎支持适用于高分辨率视频工作流程的 4:2:2 编码和解码，并发视频流处理能力较上一代 G6 实例提升 1.5 倍。



**EC2 G7 实例规格**  
G7 实例配备多达 8 个 NVIDIA RTX PRO 4500 Blackwell 服务器版 GPU，总内存高达 256 GB（每个 GPU 32 GB 内存）和定制的英特尔至强可扩展处理器。此外，它们还提供 7 种规格以供选择，支持多达 192 个 vCPU、高达 700 Gbps 的网络带宽、高达 768 GiB 的系统内存和高达 7.6 TB 的本地 NVMe 固态硬盘存储。

规格如下：

**实例名称** | **GPU** | **GPU 内存（GB）** | **vCPU** | **内存（GiB）** | **存储** | **EBS 带宽（Gbps）** | **网络带宽（Gbps）**  
---|---|---|---|---|---|---|---  
**g7.2xlarge** | 1 | 32 | 8 | 32 | 1 x 600 | 高达 8 个 | 高达 60 个  
**g7.4xlarge** | 1 | 32 | 16 | 64 | 1 x 600 | 8 | 高达 100 个  
**g7.8xlarge** | 1 | 32 | 32 | 128 | 1 x 950 | 16 | 高达 100 个  
**g7.12xlarge** | 2 | 64 | 48 | 192 | 1 x 1900 | 20 | 175  
**g7.24xlarge** | 4 | 128 | 96 | 384 | 1 x 3800 | 40 | 350  
**g7.48xlarge** | 8 | 256 | 192 | 768 | 2 x 3800 | 80 | 700  
**g7.metal*** | 8 | 256 | 192 | 768 | 2 x 3800 | 80 | 700  
  
* 即将推出

G7 实例支持适用于多 GPU 规格的 NVIDIA GPUDirect P2P，搭载 EFA 的 NVIDIA GPUDirect RDMA，搭载 [适用于 Lustre 的 Amazon FSx](<https://aws.amazon.com/fsx/lustre/>) 的 EFA 的 GPUDirect RDMA，可为多 GPU 和多节点工作负载提供 GPU 间低延迟通信能力。

要开始使用 G7 实例，您可以将 [AWS Deep Learning AMI（DLAMI）](<https://aws.amazon.com/ai/machine-learning/amis/>)或 [NVIDIA 工作站 AMI](<https://aws.amazon.com/marketplace/pp/prodview-z4aq5h62z2nv6>) 与预先打包的 GPU 驱动程序结合使用，以处理人工智能推理和图形工作负载。要在 Amazon EKS 中使用 G7 实例，请使用 NVIDIA 驱动程序版本 R595 构建 EKS AMI，并使用 [EKS 提供的自动化功能](<https://docs.aws.amazon.com/eks/latest/userguide/eks-ami-build-scripts.html>)**。** G7 实例支持多种操作系统，包括 Amazon Linux、Ubuntu、RHEL 和 Windows Server,，全面的 NVIDIA 驱动程序集成可与包括 DirectX、Vulkan 和 OpenGL 在内的行业标准图形库兼容。

**立即开始使用**  
您现在可以在两个 AWS 区域开始使用 Amazon EC2 G7 实例：美国东部（俄亥俄州）和美国西部（俄勒冈州）。要查看未来的区域扩张计划，请在[按区域列出的 AWS 功能](<https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/>)页面的 [**CloudFormation**](<https://aws.amazon.com/pt/cloudformation/>) 资源选项卡中查找实例类型。

可通过多种购买方案获取 G7 实例，包括[按需实例](<https://aws.amazon.com/ec2/pricing/on-demand/>)购买、[节省计划](<https://aws.amazon.com/savingsplans/compute-pricing/>)和[竞价型实例](<https://aws.amazon.com/ec2/spot/pricing/>)。`12xlarge`、`24xlarge` 和 `48xlarge` 规格还支持[专用实例](<https://aws.amazon.com/ec2/pricing/dedicated-instances/>)方案。有关详细定价，请访问 [Amazon EC2 定价](<https://aws.amazon.com/ec2/pricing/>)页面。

准备好开始了吗？ 从 [Amazon EC2 控制台](<https://console.aws.amazon.com/ec2/>)启动 G7 实例。如需了解更多详情，请访问 [Amazon EC2 G7 实例](<https://aws.amazon.com/ec2/instance-types/g7/>)页面。我们很乐意听取您的反馈。在 [AWS re:Post for EC2](<https://repost.aws/tags/TAO-wqN9fYRoyrpdULLa5y7g/amazon-ec-2?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) 上分享，或者通过常用 AWS Support 联系方式联系我们。

– Daniel Abib
