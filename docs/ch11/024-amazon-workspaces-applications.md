# 基于 Amazon WorkSpaces Applications 快速搭建企业级应用培训环境

## Ch11.024 基于 Amazon WorkSpaces Applications 快速搭建企业级应用培训环境

> 📊 Level ⭐⭐ | 18.5KB | `entities/amazon-workspaces-applications-quick-build.md`

## 核心要点
- **痛点**：50 人规模 GPU 培训手动配置需一整天，涉及 VPC、NAT Gateway、Image Builder、Fleet、Stack 等多个 AWS 服务协调
- **方案**：WorkSpaces Applications + CloudFormation 自动化 + Shell 脚本工具链，端到端 1-2 小时交付，效率提升 90%
- **计费模式**：ON_DEMAND 按需计费，空闲实例 $0.025/小时
- **弹性扩缩**：Auto Scaling + 预热策略支持数十至上百学员同时接入
- **工具链**：fleet-stack-deploy.sh、fleet-warmup.sh、fleet-destroy.sh；配套 GitHub 仓库 [weinick/workspaces-apps-demo](https://github.com/weinick/workspaces-apps-demo)

## 场景与挑战
WorkSpaces Applications（前身 AppStream 2.0）无需本地安装软件，通过浏览器即可访问云端预装应用环境，天然适用于以下培训场景：

- **临时短期大规模培训**：1-3 天集中培训可达数十甚至上百人。传统方式需为每位学员配置统一软件环境，WorkSpaces Applications 可提前制作标准化镜像，培训前一键预热，培训结束后立即归零，生命周期精确控制到小时级别
- **周期性技能培训**：每月/每季度定期培训，基础设施只需部署一次，镜像制作完成后可反复使用，每次只需执行预热和 URL 分发
- **多应用并行混合培训**：同一培训中既需要 GPU 加速图形软件（AI Studio、CAD），又需要普通办公应用；通过多 Fleet 机制同时运行 GPU Fleet 和 Standard Fleet，互不干扰
- **跨地域远程培训**：学员分布在不同城市甚至国家，只需浏览器打开 Streaming URL 即可接入统一培训环境
**实际落地挑战**：

- 环境配置复杂——50 人规模 GPU 培训手动完成全部流程（VPC 网络、安全组、Image Builder、安装软件、打包镜像、Fleet/Stack、预热 50 台实例、生成学员 URL）通常需要一整天甚至更长
- 成本控制困难——GPU 实例价格较高，培训结束后忘记释放容易导致不必要支出
- 扩容响应慢——学员集中涌入时，Auto Scaling 扩容速度往往跟不上需求

## 方案概述与核心优势
本方案将 WorkSpaces Applications + CloudFormation 自动化基础设施 + 自研 Shell 脚本工具链结合，形成端到端培训环境管理解决方案 ：
| 核心优势 | 说明 |
|---|---|
| 部署效率提升 90% | 50 人 GPU 培训：基础设施部署约 15 分钟、镜像制作约 30 分钟、Fleet 预热约 15 分钟，端到端约 1-2 小时交付 |
| 环境标准化 | 所有学员共享同一自定义镜像，零配置差异，确保培训一致性 |
| 按需计费 | ON_DEMAND 模式下仅在用户实际连接时计费，空闲实例每小时仅 $0.025 |
| 弹性扩缩容 | Auto Scaling 自动应对人数波动，配合提前预热可支持数十至上百学员同时接入 |
| 多应用并行 | 通过多 Fleet 机制同时运营 GPU 应用和非 GPU 应用，互不干扰 |
| 一键生命周期管理 | 从预热到归零，每个阶段一条命令完成，避免资源遗忘和浪费 |

## 架构
整体架构分为两层 ：

- **基础设施层**（CloudFormation 一次部署）：VPC、公有/私有子网、NAT Gateway、Security Groups、S3 Bucket（存放软件安装包）、IAM Role、Image Builder 实例。此层只需部署一次，可被多个培训项目共享
- **应用服务层**（脚本按需创建）：通过 `fleet-stack-deploy.sh` 创建 Fleet（实例集群）和 AppStream Stack（用户入口）。支持多次执行以创建多个 Fleet，通过 `fleet-suffix` 参数区分不同培训场景
> [!important]
> **关键约束——镜像兼容性**：镜像必须与 Fleet 实例系列严格匹配。GPU 系列镜像（G4dn、G5、G6）只能用于对应系列 Fleet，不可跨系列混用。例如 G4dn Image Builder 制作的镜像不能部署到 Standard Fleet 上，AppStream API 会直接拒绝该操作。规划多种应用时需为每个实例系列分别制作镜像。

## 部署流程
### 4.1 环境准备
首先确保已安装并配置 AWS CLI，然后克隆配套代码仓库：
```bash
git clone https://github.com/weinick/workspaces-apps-demo.git
cd workspaces-apps-demo
```
仓库包含 CloudFormation 模板和全部自动化脚本。

### 4.2 部署前检查
通过 `pre-deploy-check.sh` 脚本自动验证目标 Region 资源就绪情况：
```bash
bash scripts/pre-deploy-check.sh <region> <instance-type> <fleet-capacity>
```
参数说明：

- `<region>`（必填）：AWS 区域，如 `ap-southeast-1`
- `<instance-type>`（必填）：计划使用的实例类型，如 `stream.graphics.g4dn.xlarge`
- `<fleet-capacity>`（必填）：计划的 Fleet 容量，检查 Service Quota 是否充足
脚本会自动列出目标 Region 中该实例系列的所有可用 Base Image 并推荐最新版本。支持的实例类型包括：
| 系列 | 实例类型 | 适用场景 |
|---|---|---|
| 通用 | `stream.standard.small` ~ `2xlarge` | 办公、浏览器、轻量应用 |
| 计算优化 | `stream.compute.large` ~ `8xlarge` | 高 CPU 计算 |
| 内存优化 | `stream.memory.large` ~ `8xlarge` | 大内存数据集 |
| GPU G4dn | `stream.graphics.g4dn.xlarge` ~ `16xlarge`（NVIDIA T4） | AI 推理、图形软件 |
| GPU G5 | `stream.graphics.g5.xlarge` ~ `48xlarge`（NVIDIA A10G） | 高端图形、视频渲染 |
| GPU G6 | `stream.graphics.g6.xlarge` ~ `48xlarge`（NVIDIA L4） | 新一代 GPU，性价比高 |

### 4.3 基础设施部署（CloudFormation）
```bash
aws cloudformation deploy \
  --template-file cfn-workspaces-apps-demo.yaml \
  --stack-name <env-name> \
  --region <region> \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    ResourcePrefix=<prefix> \
    ImageBuilderInstanceType=<instance-type> \
    BaseImageName=<base-image-name>
```
关键参数说明：

- `ResourcePrefix`：所有资源的命名前缀，用于标识和管理
- `ImageBuilderInstanceType`：Image Builder 实例类型，决定制作出的镜像适用于哪个实例系列
- `BaseImageName`：AWS 提供的基础镜像，包含 Windows Server 操作系统和 AppStream Agent

### 4.4 制作自定义镜像
CloudFormation 部署已自动创建 Image Builder 实例。上传培训所需软件安装包到 S3 后，通过脚本获取 Image Builder 登录 URL：
```bash
bash scripts/imagebuilder-setup.sh <region> <stack-name>
```
登录后安装培训所需软件，安装完成后双击桌面上的 Image Assistant → 添加应用 → Create Image。镜像打包约 20-30 分钟。
> [!important]
> **成本提醒**：镜像制作完成后应立即删除 Image Builder 以停止计费。如需制作多个镜像，Image Builder 在完成一个镜像后会自动重启恢复干净状态，可以串行制作。

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
关键参数：

- `<fleet-suffix>`（必填）：Fleet 标识后缀，用于区分多个 Fleet（如 `gpu`、`mendix`）
- `[fleet-type]`（可选，默认 ON_DEMAND）：Fleet 计费模式（ON_DEMAND / ALWAYS_ON / ELASTIC）
Fleet 类型选择：
| 类型 | 计费方式 | 启动延迟 | 推荐场景 |
|---|---|---|---|
| ON_DEMAND | 用户连接时按实例运行时计费；停止 $0.025/hr | 1-2 分钟 | **培训首选** |
| ALWAYS_ON | 实例 24/7 持续全价计费 | 即时 | 企业日常办公 |
| ELASTIC | 按会话秒计费（最低 15 分钟） | 较长 | 低频轻量应用 |

### 4.6 培训前预热
培训开始前 10-15 分钟执行预热：
```bash
bash scripts/scale-fleet.sh warmup <count>
```
建议将预热数量设为预期学员人数的 1.1 倍。
> [!important]
> 培训场景中学员会在短时间内集中涌入，不能依赖 Auto Scaling 实时扩容，必须提前预热。

### 4.7 批量生成学员 URL
```bash
bash scripts/generate-urls.sh <region> <env-name>-<fleet-suffix> <user-count> <validity-hours>
```
参数依次为：Region、Fleet 环境名、学员数量、URL 有效时长（小时）。脚本同时输出 CSV 和 TXT 两种格式。URL 有效期仅控制链接可用窗口，过期后不影响正在进行的会话。

### 4.8 培训结束资源归零
```bash
bash scripts/scale-fleet.sh down
```
归零后 Fleet 配置保留，实例数降为 0。下次培训重新 warmup 即可，无需重建 Fleet。

### 4.9 资源清理（完整删除）
当培训项目彻底结束时，使用 cleanup.sh 一键清理所有相关资源：
```bash
bash scripts/cleanup.sh <region> <cfn-stack-name> <fleet-suffix> [custom-image-name]
```
多 Fleet 场景需分别执行 cleanup.sh 清理每个 Fleet，最后再删除 CFN 基础设施。
> [!note]
> `scale-fleet.sh down`（4.8）仅将实例数归零，Fleet/Stack 配置保留可复用；`cleanup.sh`（4.9）则彻底删除 Fleet、Stack、镜像甚至基础设施，适用于项目结束后的完整清理。

## 脚本工具链
完整工具链见 GitHub 仓库 [weinick/workspaces-apps-demo](https://github.com/weinick/workspaces-apps-demo) ：
| 脚本 | 功能 |
|---|---|
| `pre-deploy-check.sh` | 部署前检查：验证 Region 可用性、Service Quota、VPC/EIP 配额 |
| `imagebuilder-setup.sh` | 获取 Image Builder 登录 URL 和 S3 Presigned URL |
| `fleet-stack-deploy.sh` | 创建 Fleet 和 AppStream Stack，支持多 Fleet 并行 |
| `scale-fleet.sh warmup <count>` | 培训前预热指定数量实例 |
| `scale-fleet.sh down` | 培训后归零，保留 Fleet 配置 |
| `generate-urls.sh` | 批量生成学员访问链接（CSV/TXT 双格式） |
| `cleanup.sh` | 彻底删除 Fleet、Stack、镜像和基础设施 |

## 成本优化与最佳实践
- **培训场景首选 ON_DEMAND + 提前预热**：ON_DEMAND Fleet 在用户未连接时仅收取 $0.025/hr 的 stopped 费用，配合培训前 warmup 兼顾响应速度和成本
- **Image Builder 用完即删**：Image Builder 按运行时间计费，镜像打包完成后应立即删除
- **多项目共用基础设施**：不同培训项目可共用同一套 CloudFormation 基础设施，通过不同的 fleet-suffix 创建各自的 Fleet
**成本参考**（ap-southeast-1）：
| 实例类型 | 运行费 | 停止费 | 适用场景 |
|---|---|---|---|
| `stream.standard.xlarge` | ~$0.30/hr | $0.025/hr | 办公、浏览器、轻量 IDE |
| `stream.graphics.g4dn.xlarge` | ~$1.45/hr | $0.025/hr | AI 推理、图形软件 |

## 深度分析
### 基础设施层的复用设计
本方案将基础设施层（VPC、子网、NAT Gateway、S3、IAM）与应用服务层（Fleet、Stack）明确解耦，这一设计决策具有深远影响。
**复用价值**：CloudFormation 基础设施只需部署一次，即可被多个培训项目共享。每个培训项目通过不同的 `fleet-suffix` 创建独立的 Fleet，彼此隔离且互不干扰。这意味着一家每月举办 4 场不同主题培训的企业，只需一套基础设施，而非四套。
**成本量化**：以 ap-southeast-1 为例，一套基础 CloudFormation 资源的月度成本约 $15-30（VPC、NAT Gateway 等），而每次培训按需创建的 Fleet 实例按实际使用时长计费。假设每场培训持续 8 小时、使用 50 个 GPU 实例，使用 ON_DEMAND 模式的总成本约为 50 × $1.45 × 8 = $580，培训结束后立即归零，下月复用同一基础设施。

### ON_DEMAND 计费模式的深度解读
文章强调 ON_DEMAND 是培训场景首选，但这一选择背后有更精细的考量。
ON_DEMAND Fleet 的计费逻辑是：用户连接时按正常运行费计费（约 $1.45/hr for G4dn）；用户断开后实例进入 `stopped` 状态，仅收 $0.025/hr。这意味着一个学员从上午 9 点上线、12 点下线、下午 2 点重新上线的场景，实际计费约为 (3hr × $1.45) + (2hr stopped × $0.025) + (3hr × $1.45) = $8.72 而非假设的 8 小时全价。
**临界点计算**：对于 G4dn 实例，ALWAYS_ON 月费约 $1.45 × 24 × 30 = $1,044，而 ON_DEMAND 在每天只用 4 小时的情况下月费约为 30 × 4 × $1.45 = $174，差距近 6 倍。这解释了为何文章称 ON_DEMAND 是培训场景的最优解。

### 镜像兼容性约束的本质影响
文章特别强调了"镜像必须与 Fleet 实例系列严格匹配"这一约束，这在实操中远比表面看起来更关键。
GPU Fleet（g4dn/g5/g6）与 Standard Fleet 使用不同的物理实例类型，镜像中的驱动程序和 CUDA 版本与底层硬件紧耦合。AWS AppStream API 在创建 Fleet 时会验证镜像与实例系列的匹配性，不匹配则直接拒绝。
**实操影响**：如果一家企业同时需要 AutoCAD（GPU）和 Office（Standard）两类培训，必须制作两个镜像：GPU 镜像用 G4dn Image Builder 制作，Standard 镜像用 standard 系列 Image Builder 制作。两个 Fleet 共享同一 CloudFormation 基础设施，但各需独立管理生命周期。

### 预热策略的工程逻辑
文章建议"培训前 10-15 分钟预热，数量设为预期学员人数的 1.1 倍"，这背后有具体的工程逻辑。
WorkSpaces Applications 的 Auto Scaling 机制基于 대기时间（waiting time）调整：当用户请求集中涌入时，Fleet 会触发扩容流程，但扩容速度受限于实例启动时间（约 1-2 分钟）。在培训开场的前 5 分钟内，如果 50 名学员同时点击链接，而 Fleet 初始容量为 0，系统需要在 1-2 分钟内快速创建并预热实例，这可能导致前几名学员遇到排队。
预热到 55（1.1 倍）的策略确保了培训开场时有充足的缓冲容量，Auto Scaling 在后台继续扩容，学员不会遇到明显的等待。

## 实践启示
### 1. 将 Image Builder 纳入 CI/CD 流水线
手动登录 Image Builder 安装软件、打包镜像的流程存在两个问题：

- **环境不可复现**：手动操作的步骤难以标准化，不同时间制作的镜像可能存在差异
- **缺乏版本控制**：无法回滚到历史版本的镜像
建议将 Image Builder 的制作流程纳入 CI/CD：预先准备好安装了所有必要软件的 Golden Image，通过 AppStream Image Builder API 或 AWS SDK 自动化完成镜像打包，然后推送到生产 Fleet。

### 2. 建立培训生命周期的成本监控机制
文章提及"GPU 实例价格较高，培训结束后忘记释放容易导致不必要支出"，这提示企业需要建立培训资源的成本监控机制。
**推荐实践**：

- 在 Fleet 创建时设置 `disconnect-timeout`（默认 900 秒）和 `idle-timeout`（默认 900 秒），确保用户断开后实例能及时释放
- 使用 AWS Budgets 设置每月的支出阈值提醒
- 在培训结束后自动触发 `scale-fleet.sh down`，可通过 Lambda + CloudWatch Events 定时执行

### 3. 多地域灾备与低延迟接入
文章未涉及多地域部署，但对于在全国或全球有分支的企业，多地域部署值得考虑。

- 在亚太的新加坡（ap-southeast-1）和中国的北京（cn-north-1）各部署一套基础设施
- 通过 Route 53 的地理位置路由，将用户请求路由到最近的数据中心
- 镜像制作只需在一个 Region 完成，通过跨区域复制 AMI（Amazon Machine Image）同步到其他 Region

### 4. 与企业 SSO 集成的身份管理
当前方案使用 AppStream 内置用户管理，批量生成 URL 分发给学员。但在企业场景下，更常见的需求是与现有身份提供商（IdP）集成，如 Okta、Azure AD 或 AWS IAM Identity Center。
AppStream 2.0 支持 SAML 2.0 federated authentication，企业员工使用统一的企业账号登录，通过 IdP 的 MFA 验证后直接进入培训环境，无需额外的账号创建和链接分发流程。

## 相关产品
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/amazon-workspaces-applications-quick-build.md)
- [Amazon WorkSpaces Applications 开发者文档](https://docs.aws.amazon.com/appstream2/latest/developerguide/)
- [AppStream 2.0 定价](https://aws.amazon.com/cn/workspaces/applications/pricing/)
- [Amazon CloudFormation](https://aws.amazon.com/cn/cloudformation/) — 基础设施即代码服务
- [Amazon S3](https://aws.amazon.com/cn/s3/) — 对象存储
- [Amazon VPC](https://aws.amazon.com/cn/vpc/) — 隔离云网络
- [Amazon IAM](https://aws.amazon.com/cn/iam/) — 身份管理和访问权限

## 相关实体
- [Building Blocks for Foundation Model Training and Inference on AWS](ch11/120-building-blocks-for-foundation-model-training-and-inference.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/mlops-training-inference.md)

---

