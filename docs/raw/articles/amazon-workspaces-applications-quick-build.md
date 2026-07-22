---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/based-on-amazon-workspaces-applications-quick-build/
tags: [aws-china-blog, agentic-ai, context-engineering]
feed_name: AWS China Blog
source_published: 2026-05-19T07:12:02Z
ingested: 2026-05-19
sha256: 3a0ee7ffb5a5633dca9ea5b22de8fe42e1c11c7d46a7b9c7c2155f13e565aa2e
review_value: 8
review_confidence: 8
review_recommendation: strong
---
---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/based-on-amazon-workspaces-applications-quick-build/
ingested: 2026-05-19
feed_name: AWS China Blog
source_published: 2026-05-19T07:12:02Z
---
# 基于 Amazon WorkSpaces Applications 快速搭建企业级应用培训环境
摘要：本文介绍如何使用 Amazon WorkSpaces Applications快速搭建企业级应用培训环境。方案涵盖从网络基础设施一键部署、自定义镜像制作、Fleet 弹性扩缩容到批量生成学员访问链接的完整流程，将传统手动配置需要一整天的工作缩短至 1-2 小时。文中还提供了一键启动 CloudFormation 堆栈、成本优化策略和多场景最佳实践，适用于临时大规模培训、周期性技能培训和多应用并行培训等企业场景。
**目录**
01 一、场景与挑战
02 二、方案概述与核心优势
03 三、方案架构设计
04 四、部署流程
05 五、成本优化与最佳实践
06 六、总结
* * *
## **一、场景与挑战**
Amazon WorkSpaces Applications（前身 AppStream 2.0）是一项全托管的应用流式传输服务，用户无需在本地安装任何软件，只需通过浏览器即可访问云端预装好的完整应用环境。这一特性使其天然适用于以下培训场景：
  * 临时短期的大规模培训：例如为期 1-3 天的集中培训，参与者可能达到数十甚至上百人。传统方式下，为每位学员配置统一的软件环境需要大量人力和时间，而培训结束后这些环境即被废弃。WorkSpaces Applications 允许提前制作好标准化镜像，培训前一键预热所需数量的实例，培训结束后立即归零，整个生命周期可精确控制到小时级别。
  * 长期但按需进行的周期性培训：例如每月或每季度定期开展的技能培训。基础设施只需部署一次，镜像制作完成后可反复使用。每次培训只需执行预热和 URL 分发脚本，培训结束后归零，下次培训重新预热即可，无需重复搭建环境。
  * 多应用并行的混合培训：例如同一培训中既需要 GPU 加速的图形软件（如 AI Studio、CAD），又需要普通办公应用。通过多 Fleet 机制，可以在同一套基础设施上同时运行 GPU Fleet 和 Standard Fleet，各自独立管理，互不干扰。
  * 跨地域的远程培训：学员分布在不同城市甚至不同国家，只需通过浏览器打开 Streaming URL 即可接入统一的培训环境，彻底消除地域和设备差异带来的障碍。
然而，即便选择了 WorkSpaces Applications，企业在实际落地时仍面临以下挑战：
  * 环境配置复杂：从网络基础设施（VPC、NAT Gateway）到镜像制作（Image Builder）再到应用分发（Fleet、Stack），涉及多个 AWS 服务的协调配置，手动操作容易出错且耗时。以 50 人规模的 GPU 培训为例，手动完成全部流程（创建 VPC 网络、配置安全组、启动 Image Builder、安装软件、打包镜像、创建 Fleet/Stack、预热 50 台实例、生成学员 URL）通常需要一整天甚至更长。
  * 成本控制困难：GPU 实例价格较高，培训结束后忘记释放或手动逐个关停，容易导致不必要的成本支出。
  * 扩容响应慢：培训场景中学员集中涌入，Auto Scaling 的扩容速度往往跟不上需求，需要提前规划预热策略。
本文介绍的方案通过 CloudFormation 自动化基础设施和一套自研 Shell 脚本工具链，系统性地解决了上述挑战。
## **二、方案概述与核心优势**
本方案将 WorkSpaces Applications 与 CloudFormation 自动化基础设施、一套自研 Shell 脚本工具链相结合，形成一个端到端的培训环境管理解决方案：
部署效率提升 90%以 50 人 GPU 培训为例，基础设施部署约 15 分钟、镜像制作约 30 分钟、Fleet 预热约 15 分钟，端到端约 1-2 小时交付就绪桌面
环境标准化 | 所有学员共享同一自定义镜像，零配置差异，确保培训一致性  
---|---  
按需计费 | ON_DEMAND 模式下仅在用户实际连接时计费，空闲实例每小时仅 $0.025  
弹性扩缩容 | Auto Scaling 自动应对人数波动，配合提前预热可支持数十至上百学员同时接入  
多应用并行 | 通过多 Fleet 机制同时运营 GPU 应用和非 GPU 应用，互不干扰  
一键生命周期管理 | 从预热到归零，每个阶段一条命令完成，避免资源遗忘和浪费  
## **三、方案架构设计**
整体架构分为两层：
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/19/based-on-amazon-workspaces-applications-quick-build-1.png>) [图1：Amazon WorkSpaces Applications 培训环境整体架构图]  
---  
基础设施层（CloudFormation 一次部署）： 包含 VPC、公有/私有子网、NAT Gateway、Security Groups、S3 Bucket（存放软件安装包）、IAM Role 以及 Image Builder 实例。这一层只需部署一次，可被多个培训项目共享。
应用服务层（脚本按需创建）： 通过 fleet-stack-deploy.sh 脚本创建 Fleet（实例集群）和 AppStream Stack（用户入口）。支持多次执行以创建多个 Fleet，通过 fleet-suffix 参数区分不同的培训场景。每个 Fleet 可独立配置实例类型、镜像和计费模式。
关键约束 – 镜像兼容性：镜像必须与 Fleet 的实例系列严格匹配。GPU 系列镜像（如 G4dn、G5、G6）只能用于对应系列的 Fleet，不可跨系列混用。例如，用 G4dn Image Builder 制作的镜像不能部署到 Standard Fleet 上，AppStream API 会直接拒绝该操作。因此在规划多种应用时，需要为每个实例系列分别制作镜像。 
## **四、部署流程**
### 4.1 环境准备
首先确保已安装并配置 AWS CLI，然后克隆本文配套的代码仓库：
    git clone https://github.com/weinick/workspaces-apps-demo.git
    cd workspaces-apps-demo
仓库包含 CloudFormation 模板和全部自动化脚本，后续步骤均在此目录下执行。
### 4.2 部署前检查
在正式部署前，通过 pre-deploy-check.sh 脚本自动验证目标 Region 中的资源就绪情况：
    bash scripts/pre-deploy-check.sh <region> <instance-type> <fleet-capacity>
参数说明：
  * `<region>`（必填）：AWS 区域，如 `ap-southeast-1`
  * `<instance-type>`（必填）：计划使用的实例类型，如 `stream.graphics.g4dn.xlarge`，脚本据此查询对应系列的 Base Image
  * `<fleet-capacity>`（必填）：计划的 Fleet 容量，脚本据此检查 Service Quota 是否充足
`pre-deploy-check.sh` 会自动列出目标 Region 中该实例系列的所有可用 Base Image 并推荐最新版本。支持的实例类型参考 CFN 模板中的 `AllowedValues` 列表或运行 `fleet-stack-deploy.sh --help`，主要包括：
系列 | 实例类型 | 适用场景  
---|---|---  
通用 | `stream.standard.small/medium/large/xlarge/2xlarge` | 办公、浏览器、轻量应用  
计算优化 | `stream.compute.large` ~ `8xlarge` | 高 CPU 计算  
内存优化 | `stream.memory.large` ~ `8xlarge` | 大内存数据集  
GPU G4dn | `stream.graphics.g4dn.xlarge` ~ `16xlarge`（NVIDIA T4） | AI 推理、图形软件  
GPU G5 | `stream.graphics.g5.xlarge` ~ `48xlarge`（NVIDIA A10G） | 高端图形、视频渲染  
GPU G6 | `stream.graphics.g6.xlarge` ~ `48xlarge`（NVIDIA L4） | 新一代 GPU，性价比高  
脚本会检查以下内容：目标 Region 是否存在可用的 Base Image（AWS 托管基础镜像）、当前账号的 Service Quota 是否满足所需实例数、VPC 和 EIP 配额是否充足。检查通过后，脚本会输出推荐的 CloudFormation 部署命令和最新的 Base Image 名称。
### 4.3 基础设施部署（CloudFormation）
    aws cloudformation deploy \
      --template-file cfn-workspaces-apps-demo.yaml \
      --stack-name <env-name> \
      --region <region> \
      --capabilities CAPABILITY_NAMED_IAM \
      --parameter-overrides \
        ResourcePrefix=<prefix> \
        ImageBuilderInstanceType=<instance-type> \
        BaseImageName=<base-image-name>
关键参数说明：
  * `ResourcePrefix`：所有资源的命名前缀，用于标识和管理
  * `ImageBuilderInstanceType`：Image Builder 的实例类型，决定了将来制作出的镜像适用于哪个实例系列
  * `BaseImageName`：AWS 提供的基础镜像，包含 Windows Server 操作系统和 AppStream Agent
### 4.4 制作自定义镜像
CloudFormation 部署（4.2）已自动创建了 Image Builder 实例。此步骤是登录该 Image Builder 安装培训所需软件并打包为自定义镜像。如果只需一种实例系列的镜像，无需额外创建 Image Builder。
首先上传培训所需的软件安装包到 S3，然后通过脚本获取 Image Builder 的登录 URL：
    bash scripts/imagebuilder-setup.sh <region> <stack-name>
参数说明：
  * `<region>`（必填）：AWS 区域
  * `<stack-name>`（必填）：CloudFormation Stack 名称，用于读取 S3 Bucket 和 Image Builder 信息
  * `<presign-ttl-seconds>`（可选）：S3 Presigned URL 有效期（秒），默认 3600
  * `<installer-filter>`（可选）：安装包名称过滤关键字（大小写不敏感），只输出匹配的 Presigned URL
  * `<builder-suffix>`（可选）：指定连接非默认的 Image Builder（多实例系列场景使用）
脚本输出 Image Builder 的 Streaming URL（用于登录 Windows 桌面）和 S3 Presigned URL（用于在桌面内下载安装包）。登录后安装所有培训所需软件，安装完成后双击桌面上的 Image Assistant -> 添加应用 -> Create Image。镜像打包约 20-30 分钟。
成本提醒：镜像制作完成后应立即删除 Image Builder 以停止计费。如需制作多个镜像，Image Builder 在完成一个镜像后会自动重启恢复干净状态，可以串行制作。 
### 4.5 创建 Fleet 与 Stack
镜像就绪后，创建 Fleet（实例集群）和 Stack（用户访问入口）：
    ```bash
    bash scripts/fleet-stack-deploy.sh \
      <region> \
      <cfn-stack-name> \
      <image-name> \
      <fleet-suffix> \
      <min-capacity> \
      <max-capacity> \
      <instance-type> \
      [fleet-type] \
      [max-session] \
      [disconnect-timeout] \
      [idle-timeout]
    ```
参数说明：
  * `<region>`（必填）：AWS 区域
  * `<cfn-stack-name>`（必填）：CloudFormation Stack 名称，用于读取 VPC/SG 等网络配置
  * `<image-name>`（必填）：自定义镜像名称（Image Assistant 制作完成后的名称）
  * `<fleet-suffix>`（必填）：Fleet 标识后缀，自由命名，用于区分多个 Fleet（如 `gpu`、`mendix`）
  * `<min-capacity>`（可选，默认 2）：Fleet 最小实例数
  * `<max-capacity>`（可选，默认 20）：Auto Scaling 上限
  * `<instance-type>`（必填）：实例类型，须与镜像系列严格匹配
  * `[fleet-type]`（可选，默认 ON_DEMAND）：Fleet 计费模式（ON_DEMAND / ALWAYS_ON / ELASTIC）
  * `[max-session]`（可选，默认 9000）：会话最长时间（秒），即用户单次连接的最大持续时间。范围 600-432000（10 分钟 ~ 5 天）。培训场景建议设为培训时长 + 30 分钟缓冲
  * `[disconnect-timeout]`（可选，默认 900）：用户断开连接后，实例保持运行的超时时间（秒）。超时后实例释放。范围 60-432000
  * `[idle-timeout]`（可选，默认 900）：用户无操作后自动断开连接的超时时间（秒）。范围 60-3600，设为 0 表示不自动断开
Fleet 类型选择指南：
类型 | 计费方式 | 启动延迟 | 推荐场景  
---|---|---|---  
ON_DEMAND | 用户连接时按实例运行时计费；停止 $0.025/hr | 1-2 分钟 | 培训首选  
ALWAYS_ON | 实例 24/7 持续全价计费 | 即时 | 企业日常办公  
ELASTIC | 按会话秒计费（最低 15 分钟） | 较长 | 低频轻量应用  
### 4.6 培训前预热
培训开始前 10-15 分钟执行预热：
    bash scripts/scale-fleet.sh warmup <count>
参数说明：
  * `<count>`（必填）：预热的实例数量，建议为预期学员人数的 1.1 倍
**重要提示：**   
培训场景中学员会在短时间内集中涌入，不能依赖 Auto Scaling 实时扩容，必须提前预热。建议将预热数量设为预期学员人数的 1.1 倍。 
### 4.7 批量生成学员 URL
    bash scripts/generate-urls.sh <region> <env-name>-<fleet-suffix> <user-count> <validity-hours>
参数依次为：Region、Fleet 环境名、学员数量、URL 有效时长（小时）。脚本同时输出 CSV 和 TXT 两种格式，方便分发给学员。URL 有效期仅控制链接可用窗口，过期后不影响正在进行的会话。
### 4.8 培训结束资源归零
    bash scripts/scale-fleet.sh down
归零后 Fleet 配置保留，实例数降为 0。下次培训重新 warmup 即可，无需重建 Fleet。
### 4.9 资源清理（完整删除）
当培训项目彻底结束、不再需要保留 Fleet 和镜像时，使用 cleanup.sh 一键清理所有相关资源：
    bash scripts/cleanup.sh <region> <cfn-stack-name> <fleet-suffix> [custom-image-name]
参数说明：
  * `<region>`（必填）：AWS 区域
  * `<cfn-stack-name>`（必填）：CloudFormation Stack 名称
  * `<fleet-suffix>`（必填）：Fleet 标识后缀（与 fleet-stack-deploy.sh 创建时一致）
  * `[custom-image-name]`（可选）：自定义镜像名称，提供则同时删除镜像
多 Fleet 场景：如果部署了多个 Fleet，需要分别执行 cleanup.sh 清理每个 Fleet，最后再删除 CFN 基础设施：
    # 先清理各 Fleet（选择 N 跳过 CFN 删除）
    bash scripts/cleanup.sh ap-southeast-1 my-demo standard my-standard-image-v1
    bash scripts/cleanup.sh ap-southeast-1 my-demo gpu my-gpu-image-v1
    # 所有 Fleet 清理完后，手动删除 CFN 基础设施
    aws cloudformation delete-stack --stack-name my-demo --region ap-southeast-1
???? 4.7 vs 4.8 的区别：4.7 的 `scale-fleet.sh down` 仅将实例数归零，Fleet/Stack 配置保留可复用；4.8 的 `cleanup.sh` 则彻底删除 Fleet、Stack、镜像甚至基础设施，适用于项目结束后的完整清理。
## **五、成本优化与最佳实践**
  * 培训场景首选 ON_DEMAND + 提前预热：ON_DEMAND Fleet 在用户未连接时仅收取 $0.025/hr 的 stopped 费用，配合培训前 warmup 兼顾响应速度和成本
  * Image Builder 用完即删：Image Builder 按运行时间计费，镜像打包完成后应立即删除
  * 多项目共用基础设施：不同培训项目可共用同一套 CloudFormation 基础设施，通过不同的 fleet-suffix 创建各自的 Fleet
成本参考（ap-southeast-1）：
实例类型 | 运行费 | 停止费 | 适用场景  
---|---|---|---  
stream.standard.xlarge | ~$0.30/hr | $0.025/hr | 办公、浏览器、轻量 IDE  
stream.graphics.g4dn.xlarge | ~$1.45/hr | $0.025/hr | AI 推理、图形软件  
## **六、总结**
本文介绍的方案通过 Amazon WorkSpaces Applications 结合 CloudFormation 和自动化脚本工具链，将企业级应用培训环境的搭建时间从数天压缩到数小时。ON_DEMAND 计费模式配合生命周期管理脚本（warmup -> generate-urls -> down），让培训组织者可以精确控制资源的启停，避免浪费。多 Fleet 机制使得 GPU 与非 GPU 应用可以并行运行，满足多样化的培训需求。无论是临时大规模集训、周期性技能培训还是多应用混合培训，该方案都能提供灵活、经济、标准化的解决路径。
**参考链接**
  * Amazon WorkSpaces Applications 开发者文档：https://docs.aws.amazon.com/appstream2/latest/developerguide/
  * AppStream 2.0 定价：https://aws.amazon.com/cn/workspaces/applications/pricing/
**下一步行动：**
**相关产品：**
  * [Amazon CloudFormation](<https://aws.amazon.com/cn/cloudformation/?p=bl_pr_cloudformation_l=1>) — 基础设施即代码服务
  * [Amazon S3](<https://aws.amazon.com/cn/s3/?p=bl_pr_s3_l=2>) — 适用于 AI、分析和存档的几乎无限的安全对象存储
  * [Amazon VPC](<https://aws.amazon.com/cn/vpc/?p=bl_pr_vpc_l=3>) — 隔离云网络
  * [Amazon IAM](<https://aws.amazon.com/cn/iam/?p=bl_pr_iam_l=4>) — 身份管理和访问权限
**相关文章：**
  * [让 AI 工作空间更智能：Amazon Quick Suite 集成博查搜索实践](<https://aws.amazon.com/cn/blogs/china/let-ai-workspaces-smarter-amazon-quick-suite-integrates-boocha-search-practices/?p=bl_ar_l=1>)
  * [快时尚电商行业智能体设计思路与应用实践（七）Amazon Bedrock AgentCore Runtime 深度解析和场景分析](<https://aws.amazon.com/cn/blogs/china/amazon-bedrock-agentcore-runtime-deep-dive-and-scenario-analysis/?p=bl_ar_l=2>)
  * [通过AWS Site-to-Site VPN和AWS Directory Service对Amazon WorkSpaces进行私有访问和策略控制](<https://aws.amazon.com/cn/blogs/china/private-access-policy-control-vpn-directory-service/?p=bl_ar_l=3>)
  * [Amazon Connect结合Strands框架及Bedrock Agent Core的智能客服机器人解决方案（实践篇）](<https://aws.amazon.com/cn/blogs/china/intelligent-customer-service-chatbot-solution-practical-edition/?p=bl_ar_l=4>)
*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。
## 本篇作者
### 魏羽
亚马逊云科技高级解决方案架构师，在 IT 行业有从业超过 13 年的工作经验，其中超过 7 年作为公有云架构师角色帮助企业级客户完成业务上云的需求。当前在亚马逊云科技主要负责若干世界 500 强中的制造业和高科技行业客户的上云规划和支持，技术上致力于推广 IoT 和大数据分析相关技术在企业中的应用。在加入亚马逊云科技前，曾在华为、微软等公司任职，负责过华为云以及微软 Azure 云上的项目落地。
* * *
## 亚马逊云科技中国峰会
聚焦 AI Agent 的构建与部署实践，现场体验企业级 AI 应用的开发流程。 [](<https://aws.amazon.com/cn/events/summits/shanghai/?ectrk=jyLXNovBYB51qgzUEipIpZcxlfE5%2Bs7NfDTnZwR7hFYtQmPUSToTuN%2FZO5doh20ZJ%2FloW6Rom0l3P4LLcoyUPA%3D%3D&sc_icampaign=glb-summit-blog-p1&sc_ichannel=ha&sc_iplace=blog&trk=ab30be54-aedd-480a-9364-ab0bf98e982d>) |   
---|---