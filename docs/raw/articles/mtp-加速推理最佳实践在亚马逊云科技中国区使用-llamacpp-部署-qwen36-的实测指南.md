---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/mtp-inference-best-practices-using-llama-cpp
ingested: 2026-07-24
feed_name: AWS China Blog
source_published: 2026-07-24
sha256: d478d6896abde7f83db30bad4ae9a0be8109f1d31ae8060c2618b8cde28fc6ce
---

# MTP 加速推理最佳实践：在亚马逊云科技中国区使用 llama.cpp 部署 Qwen3.6 的实测指南

摘要：本文在亚马逊云科技中国区（宁夏）使用 llama.cpp 部署 Qwen3.6 系列大语言模型（27B Dense 和 35B-A3B MoE），对比了 Graviton4 ARM CPU、Intel x86 CPU 和 NVIDIA A10G GPU 三种硬件平台上 MTP (Multi-Token Prediction) 投机解码的实际加速效果，并给出了各芯片架构下的部署最佳实践。  
  
**目录**

01 一、背景：中国区用户的困境

02 二、方案选型：为什么是 llama.cpp

03 三、技术背景

04 四、测试环境

05 五、测试结果

06 六、核心发现与分析

07 七、最佳实践推荐

08 八、成本分析

09 九、总结

10 十、参考资料

* * *

## **一、背景：中国区用户的困境**

亚马逊云科技中国区（北京/宁夏）用户在部署大语言模型时面临独特挑战：

  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/>) 尚未落地 — 没有托管 AI 服务（MaaS），必须自建
  * GPU 实例昂贵 — G5 (A10G) 按需价格高，Spot 可能被中断
  * 合规需求 — 数据不出境，模型必须私有化部署



然而，中国区拥有 Graviton4 (C8g) 实例——这为低成本 LLM 推理提供了一条新路径。

## **二、方案选型：为什么是 llama.cpp**

虽然 vLLM 在 GPU 集群高并发场景下表现优异，且通过 OpenVINO 或 ZenDNN 等后端也能支持 CPU 推理，但在资源受限、单机部署、极致轻量化的场景下，llama.cpp 依然是首选：

维度 | llama.cpp | vLLM | 说明  
---|---|---|---  
极致轻量化 | 纯 C/C++，无需 PyTorch/CUDA | 依赖完整 Python + PyTorch 栈 | llama.cpp 单文件即可运行  
量化生态 (GGUF) | 原生 GGUF，Q2~Q8 全支持 | 实验性 GGUF，未深度优化 | CPU 场景下量化是关键  
CPU 推理 | ARM NEON/SVE + x86 AVX 原生优化 | 支持（via OpenVINO/ZenDNN），但门槛高 | vLLM CPU 需额外后端配置  
低显存部署 | Q4 量化 27B ≈ 16GB | FP16 27B ≈ 54GB | 同一张卡能跑更大模型  
跨平台兼容 | Win/Linux/macOS/ARM/x86 | 主要 Linux + CUDA | llama.cpp 从树莓派到服务器通用  
MTP 加速 |  原生支持 |  也支持 | 两者均支持  
高并发吞吐 | 一般 | PagedAttention + 连续批处理 | 多用户高 QPS 场景 vLLM 更优  
  
总结：vLLM 是为企业级高并发 GPU 集群设计的；llama.cpp 则是为本地运行、边缘计算和极致硬件兼容性打造的”万能引擎”。在 AWS 中国区 CPU 实例自建场景下，llama.cpp 的轻量化和成熟的 GGUF 量化生态使其成为最优选择。

核心论点：在 g5.xlarge (A10G 24GB) 上，vLLM 使用 FP16 部署 27B 模型已超出单卡显存容量，而 llama.cpp 通过 Q4 量化将 27B 模型压缩至约 16GB，可在同一张卡上流畅运行。量化技术使得相同硬件能承载更大规模的模型，从而获得更强的模型能力。

## **三、技术背景**

### 3.1 GGUF 量化

GGUF (GPT-Generated Unified Format) 通过将模型权重从 FP16 压缩到 Q4/Q5/Q8 等低比特格式，大幅降低内存需求。本次测试使用 Q4_K_M 量化等级，这是性价比最优的选择：

  * Qwen3.6-27B Q4_K_M ≈ 16GB（vs FP16 的 54GB）
  * Qwen3.6-35B-A3B Q4_K_M ≈ 22GB



### 3.2 MTP (Multi-Token Prediction)

MTP 是一种内置于模型的投机解码技术。与传统 Speculative Decoding 需要额外 draft 模型不同，MTP 模型自带预测头（MTP head），在推理时：

  1. MTP head 同时预测多个候选 token（draft）
  2. 主模型在一次 forward pass 中验证所有 draft token
  3. 被接受的 token 直接输出，未接受的重新生成



理论加速比：1.4x ~ 2x（取决于 draft acceptance rate 和硬件验证开销）。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/22/mtp-inference-best-practices-using-llama-cpp-1.png>) [图1]  
---  
  
### 3.3 Qwen3.6 模型家族

模型 | 架构 | 总参数 | 激活参数 | MTP 支持  
---|---|---|---|---  
Qwen3.6-27B | Dense | 27B | 27B |   
Qwen3.6-35B-A3B | MoE | 35B | ~3B |   
  
本次测试选择 Qwen3.6 系列模型，因为它是目前少数同时支持 MoE 架构和原生 MTP 加速的开源模型。35B-A3B 采用 Mixture-of-Experts 架构，总参数 35B，但每次推理仅激活约 3B 参数——这使其在 CPU 上推理速度极快，在 GPU 上还能通过 MTP 获得额外 83% 的加速。两种硬件路径都能受益于这一模型家族。

## **四、测试环境**

### 4.1 硬件平台

实例 | 芯片 | 架构 | vCPU | 内存 | 加速器 | 内核  
---|---|---|---|---|---|---  
c8g.4xlarge | AWS Graviton4 | ARMv9.0 (Neoverse V2) | 16 | 32 GB | — | Linux 6.17.0-1017-aws aarch64  
c8i.4xlarge | Intel Xeon (8th Gen) | x86_64 | 16 | 32 GB | — | Linux 6.17.0-1017-aws x86_64  
g5.xlarge | AMD EPYC + NVIDIA A10G | x86_64 | 4 | 16 GB | A10G 24GB VRAM | Linux 6.17.0-1017-aws x86_64  
  
所有实例均运行 Ubuntu 24.04 LTS (#17~24.04.1-Ubuntu SMP)，内核版本一致（6.17.0），确保测试环境的公平性。

### 4.2 软件栈

  * 推理引擎: llama.cpp b9501 预编译二进制
  * 模型: Qwen3.6-27B-Q4_K_M, Qwen3.6-35B-A3B-MTP-UD-Q4_K_M (from ModelScope/HuggingFace)
  * OS: Ubuntu 24.04 LTS ARM64 / x64
  * MTP 参数: –spec-type draft-mtp –spec-draft-n-max 2



注：–spec-draft-n-max 设为 2。实测发现该参数越大，draft acceptance 下降明显（>2 时低于 70%），反而拖慢整体性能，因此选择 n-max=2 作为最优平衡点。

### 4.3 测试方法

  * Prompt: “从优点、缺点两个方面介绍新能源汽车，分两点罗列，语言通俗，字数120字左右，不用专业名词”
  * 输出长度: max_tokens = 2048
  * Thinking Mode: ON（模型默认开启思考模式）
  * Prompt Cache: OFF (–cache-ram 0)，确保每次请求独立
  * 并发: 单请求 (parallel = 1)



注：并发设为 1 是为了测试单请求场景下的最大推理性能。实际生产环境中，应根据业务并发需求配置 Load Balancer (ALB/NLB) 和 Auto Scaling Group (ASG)，通过水平扩展多实例来支撑高并发流量。

## **五、测试结果**

### 5.1 完整数据

实例 | 硬件 | 模型 | MTP | 总时间(s) | 有效 tok/s | Draft Acc  
---|---|---|---|---|---|---  
c8g.4xlarge | Graviton4 ARM | Qwen3.6-27B (Dense) | OFF | 245.1 | 8.50 | —  
c8g.4xlarge | Graviton4 ARM | Qwen3.6-27B (Dense) | ON | 342.4 | 6.08 | 84.8%  
c8g.4xlarge | Graviton4 ARM | Qwen3.6-35B-A3B (MoE) | OFF | 52.9 | 39.34 | —  
c8g.4xlarge | Graviton4 ARM | Qwen3.6-35B-A3B (MoE) | ON | 87.8 | 23.72 | 81.2%  
c8i.4xlarge | Intel x86 | Qwen3.6-27B (Dense) | OFF | 456.9 | 4.56 | —  
c8i.4xlarge | Intel x86 | Qwen3.6-27B (Dense) | ON | 281.1 | 5.36 | 80.3%  
c8i.4xlarge | Intel x86 | Qwen3.6-35B-A3B (MoE) | OFF | 123.9 | 16.81 | —  
c8i.4xlarge | Intel x86 | Qwen3.6-35B-A3B (MoE) | ON | 151.5 | 13.75 | 82.8%  
g5.xlarge | A10G GPU | Qwen3.6-27B (Dense) | OFF | 79.6 | 26.17 | —  
g5.xlarge | A10G GPU | Qwen3.6-27B (Dense) | ON | 43.5 | 47.89 | 78.8%  
  
g5.xlarge 未测试 35B-A3B 模型，因 A10G 24GB VRAM 不足以加载该模型的 Q4 量化版（约 22GB 权重 + KV cache）。

### 5.2 MTP 加速效果

实例 | 硬件 | 模型 | 无 MTP | 有 MTP | 变化 | Draft Acc  
---|---|---|---|---|---|---  
g5.xlarge | A10G GPU | 27B Dense | 26.17 | 47.89 | +83.0%  | 78.8%  
c8i.4xlarge | Intel x86 | 27B Dense | 4.56 | 5.36 | +17.6%  | 80.3%  
c8i.4xlarge | Intel x86 | 35B-A3B MoE | 16.81 | 13.75 | -18.2%  | 82.8%  
c8g.4xlarge | Graviton4 | 27B Dense | 8.50 | 6.08 | -28.4%  | 84.8%  
c8g.4xlarge | Graviton4 | 35B-A3B MoE | 39.34 | 23.72 | -39.7%  | 81.2%  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/22/mtp-inference-best-practices-using-llama-cpp-2.png>) [图2]  
---  
  
### 5.3 硬件平台对比

模型 | MTP | c8g (Graviton4) | c8i (Intel) | g5 (GPU) | Graviton4/Intel  
---|---|---|---|---|---  
27B Dense | OFF | 8.50 | 4.56 | 26.17 | 1.86x  
27B Dense | ON | 6.08 | 5.36 | 47.89 | 1.13x  
35B-A3B MoE | OFF | 39.34 | 16.81 | — | 2.34x  
35B-A3B MoE | ON | 23.72 | 13.75 | — | 1.73x  
  
### 5.4 模型架构对比（同硬件，无 MTP）

硬件 | 27B Dense (tok/s) | 35B-A3B MoE (tok/s) | MoE 提速  
---|---|---|---  
c8g.4xlarge (Graviton4) | 8.50 | 39.34 | 4.63x  
c8i.4xlarge (Intel) | 4.56 | 16.81 | 3.69x  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/22/mtp-inference-best-practices-using-llama-cpp-3.png>) [图3]  
---  
  
## **六、核心发现与分析**

### 6.1 发现 1：MTP 在 GPU 上加速显著，CPU 上需避免使用

MTP 在 GPU (A10G) 上带来了 +83% 的显著加速——这是因为 GPU 并行计算让 batch verify 的边际成本接近 0，draft token 验证几乎”免费”。这验证了 MTP 作为 GPU 推理加速技术的巨大价值。

然而在 CPU 平台上（无论 ARM 还是 x86），尽管 Draft Acceptance Rate 高达 80-85%，MTP 反而导致性能下降（-18% ~ -40%）。原因是 CPU 串行执行每个 draft token 的 verify 都有实际计算开销，抵消了 acceptance 带来的节省。

实践建议：GPU 部署务必开启 MTP；CPU 部署则关闭 MTP，直接裸跑即可获得最佳性能。

### 6.2 发现 2：Graviton4 内存带宽优势显著

同为 4xlarge（16 vCPU），Graviton4 比 Intel x86 快 1.86x ~ 2.34x。

LLM 推理是典型的 memory-bandwidth-bound 任务（每生成一个 token 需读取全部模型权重），Graviton4 的 DDR5-5600 + ARM SVE/MMLA 指令优化在此场景下优势巨大。

### 6.3 发现 3：MoE 模型是 CPU 部署的关键

35B-A3B MoE（激活参数仅 ~3B）在 CPU 上比 27B Dense 快 3.7x ~ 4.6x。

这意味着 CPU 方案不应追求”更大的 Dense 模型”，而应选择”更聪明的 MoE 模型”——以极低的推理成本获得接近大模型的能力。

### 6.4 发现 4：CPU 方案可达 GPU 82% 性能

  * c8g.4xlarge + 35B MoE (无 MTP) = 39.34 tok/s
  * g5.xlarge + 27B Dense + MTP = 47.89 tok/s



Graviton4 方案仅达到 GPU 方案的 82%，但完全不需要 GPU 配额，弹性扩缩更灵活。

### 6.5 发现 5：GPU + MTP 是性能王者

g5.xlarge 上开启 MTP 后性能翻倍（+83%），从 26 tok/s 跃升至 48 tok/s。如果有 GPU 配额，这是最佳选择。

## **七、最佳实践推荐**

### 7.1 方案选型决策树

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/22/mtp-inference-best-practices-using-llama-cpp-4.png>) [图4]  
---  
  
**7.1.1 Q1: 是否有 GPU 配额？**

  * 是 → g5.xlarge + Qwen3.6-27B Dense + MTP ON
  * 性能: 48 tok/s | RI 月成本: ¥2,852
  * 否 → 继续 Q2



**7.1.2 Q2: 是否需要最高性价比？**

  * 是 → c8g.4xlarge + Qwen3.6-35B-A3B MoE (MTP OFF)
  * 性能: 39 tok/s | RI 月成本: ¥756 | 性价比最优
  * 否（需要更多并发余量） → ???? c8g.8xlarge + 35B-A3B MoE (MTP OFF)
  * 性能: ~45-50 tok/s | RI 月成本: ~¥1,500



### 7.2 关键配置建议

配置项 | 推荐  
---|---  
CPU 实例上 MTP |  关闭，直接裸跑更快  
GPU 实例上 MTP |  开启， –spec-type draft-mtp –spec-draft-n-max 2  
CPU 上的模型选择 | MoE 模型优先（如 35B-A3B），不要跑大 Dense 模型  
GPU 上的模型选择 | Dense 模型 + MTP 最优  
量化等级 | Q4_K_M（性价比最优）  
Prompt Cache | 生产环境开启，benchmark 时关闭  
  
### 7.3 部署方式说明

本文测试采用 EC2 + Docker 直接部署，原因是侧重性能验证和快速迭代。对于生产环境的部署选择：

场景 | 推荐方式 | 说明  
---|---|---  
测试验证 / 快速迭代 | EC2 + Docker | 灵活、启动快、Spot 实例降本 60-70%  
长期稳定运行的生产环境 | SageMaker Endpoint (BYOC) 或 EKS | SageMaker 提供托管运维；EKS 提供容器编排灵活性和多服务混部能力  
高弹性 / 流量波动大 | EC2 + ASG + ALB | 根据并发负载自动水平扩展  
  
生产部署建议：SageMaker BYOC 适合需要全托管运维的场景；EKS 则适合已有 Kubernetes 基础设施、需要统一管理多个推理服务或混合部署的团队。两者均可承载 llama.cpp 容器化部署。

## **八、成本分析**

基于宁夏区 (cn-northwest-1) 1 年 Standard RI All Upfront 定价，按 100% 利用率（24/7 满载）计算单位 output token 成本：

实例 | 最优配置 | tok/s | 年费 (¥) | 月均 (¥) | ¥/百万 output token  
---|---|---|---|---|---  
c8g.4xlarge | 35B-A3B MoE, MTP OFF | 39.34 | 9,069 | 755.75 | ¥7.41  
c8i.4xlarge | 35B-A3B MoE, MTP OFF | 16.81 | 13,237 | 1,103.08 | ¥25.32  
g5.xlarge | 27B Dense, MTP ON | 47.89 | 34,228 | 2,852.33 | ¥22.98  
  
注：实际利用率低于 100% 时，单位 token 成本相应倍增。自建方案的核心优势除成本外，还有数据不出境、无调用频率限制、可定制模型等合规和灵活性价值。

## **九、总结**

| GPU 方案 | CPU 方案（推荐） | CPU 方案（x86）  
---|---|---|---  
实例 | g5.xlarge | c8g.4xlarge | c8i.4xlarge  
模型 | 27B Dense | 35B-A3B MoE | 35B-A3B MoE  
MTP | ON | OFF | OFF  
性能 | 47.89 tok/s | 39.34 tok/s | 16.81 tok/s  
月成本 (RI) | ¥2,852 | ¥755 | ¥1,103  
¥/百万 token | ¥22.98 | ¥7.41 | ¥25.32  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/22/mtp-inference-best-practices-using-llama-cpp-5.png>) [图5]  
---  
  
本文以 Qwen3.6 系列模型（27B Dense 和 35B-A3B MoE）为例，在 AWS 中国区（宁夏）实测了 llama.cpp 在 Graviton4 ARM CPU、Intel x86 CPU 和 NVIDIA A10G GPU 三种硬件平台上的推理性能，并验证了 MTP (Multi-Token Prediction) 加速技术在不同平台上的实际效果。

**最佳实践**

  * GPU 场景：g5.xlarge + Qwen3.6-27B Dense + MTP ON → 48 tok/s，MTP 带来 +83% 加速
  * CPU 场景：c8g.4xlarge + Qwen3.6-35B-A3B MoE + MTP OFF → 39 tok/s，RI 月成本仅 ¥756
  * 关键原则：GPU 部署务必开启 MTP；CPU 部署选择 MoE 模型并关闭 MTP，即可以 GPU 方案 26% 的成本获得 82% 的性能



**下一步行动：**

**相关产品：**

  * [Amazon EC2](<https://aws.amazon.com/cn/ec2/?p=bl_pr_ec2_l=1>) — 安全且可调整大小的计算容量
  * [Amazon SageMaker](<https://aws.amazon.com/cn/sagemaker/?p=bl_pr_sagemaker_l=2>) — 适用于所有数据、分析和 AI 的中心
  * [Amazon EKS](<https://aws.amazon.com/cn/eks/?p=bl_pr_eks_l=3>) — 托管式 Kubernetes 服务
  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=4>) — 用于构建生成式人工智能应用程序和代理的端到端平台



**相关文章：**

  * [从IDC到云上GPU：基于 Amazon EKS 的大模型推理混合云弹性部署实践](<https://aws.amazon.com/cn/blogs/china/idc-gpu-based-on-amazon-eks-large-model-inference-hybrid-cloud-elastic-deploy-practice/?p=bl_ar_l=1>)
  * [Zenjoy 基于 Amazon Bedrock 和 EKS 构建 AIOps Agent：打通 Prometheus、ES 与夜莺的智能化告警实战](<https://aws.amazon.com/cn/blogs/china/zenjoy-based-on-strands-amazon-bedrock-agentcore-build-eks/?p=bl_ar_l=2>)
  * [基于SGLang的大模型推理实践——从benchmark方法论到部署方案选型与调优](<https://aws.amazon.com/cn/blogs/china/based-on-sglang-large-model-inference-practice/?p=bl_ar_l=3>)
  * [基于AgentCore harness构建高效、稳定的行程分配与优化多智能体系统](<https://aws.amazon.com/cn/blogs/china/based-on-agentcore-harness-build-efficient/?p=bl_ar_l=4>)
  * [给 Openclaw瘦身-利用Nova MME 和 S3 Vector实现Skill按需召回](<https://aws.amazon.com/cn/blogs/china/openclaw-leveraging-nova-mme-s3-vector-implement-skill/?p=bl_ar_l=5>)



## **十、参考资料**

  * [AWS Graviton + llama.cpp 技术指南](<https://aws.github.io/graviton/machinelearning/llama.cpp.html>)
  * [ARM: Best-in-class LLM performance on Graviton3](<https://community.arm.com/arm-community-blogs/b/servers-and-cloud-computing-blog/posts/best-in-class-llm-performance>)
  * [llama.cpp MTP PR #22673](<https://github.com/ggml-org/llama.cpp/pull/22673>)
  * [Qwen3.6-35B-A3B-MTP-GGUF (ModelScope)](<https://modelscope.cn/models/unsloth/Qwen3.6-35B-A3B-MTP-GGUF>)
  * [AWS 中国区 EC2 C8g 实例](<https://amazonaws.cn/en/ec2/instance-types/c8g/>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 吕文石

西云数据技术客户经理，致力于帮助亚马逊云科技中国区客户实现应用上云、架构优化与高效技术支持，提升云端业务价值与系统弹性。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
