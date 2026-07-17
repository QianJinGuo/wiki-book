# 基于 Firecracker microVM 与 Bedrock AgentCore 的生产级多租户 AI Agent

## Ch11.008 基于 Firecracker microVM 与 Bedrock AgentCore 的生产级多租户 AI Agent

> 📊 Level ⭐⭐ | 39.8KB | `entities/firecracker-bedrock-agentcore-multi-tenant.md`

# 基于 Firecracker microVM 与 Bedrock AgentCore 的生产级多租户 AI Agent

> 5 分钟部署、90 秒自愈、成本降至 1/8 的生产级多租户 AI Agent 方案，基于 Firecracker microVM 隔离 + Bedrock AgentCore。

## 核心内容

# 5 分钟拉起、90 秒自愈、成本 1/8——基于 Firecracker microVM 与 Bedrock AgentCore 的生产级多租户 AI Agent 平台 OpenClaw Pool

## [亚马逊AWS官方博客](https://aws.amazon.com/cn/blogs/china/)

摘要：本文介绍一套使用 Firecracker microVM 在 AWS EC2 上运行多租户 OpenClaw AI Agent 的参考架构。每个租户获得内核级隔离的独立实例，Serverless 控制面统一管理调度、扩缩容和备份，配套开源项目已发布在 aws-samples。

* * *

## **一、引言**

[OpenClaw](https://github.com/openclaw/openclaw) 是一个开源的个人 AI Agent 平台，提供完整的自主任务运行时——包括 Gateway 服务器、交互式 Dashboard、工具执行和会话管理。从邮件处理到代码编写，OpenClaw 让每个用户拥有一个始终在线的 AI 助手。当组织希望为多个团队或客户提供基于 OpenClaw 的 Agent 服务时，一个核心问题随之而来：如何运行数十甚至上百个独立实例，保持强隔离，同时无需为每个实例单独管理基础设施？

在本文中，我们将展示如何使用 [Firecracker](https://firecracker-microvm.github.io/) microVM 在 [AWS EC2](https://aws.amazon.com/cn/ec2/) 实例上部署多租户 OpenClaw AI Agent 的参考架构，每个租户获得完全隔离的 OpenClaw 实例 —— 独立的内核、文件系统、网络和预配置的开发环境 —— 基于无服务器架构的控制面提供统一的 REST API 处理调度、扩缩容、健康监控和备份。该方案的完整实现已作为开源项目 Multi-Tenant OpenClaw on Firecracker 发布在 [aws-samples](https://github.com/aws-samples/sample-multi-tenant-openclaw-on-firecracker) 上。

## **二、多租户 OpenClaw 的挑战**

单个 OpenClaw 实例包含一个 Node.js Gateway 服务器、持久化工作空间、配置文件和可选的 MCP 工具集成。当你需要为多个团队、部门或客户提供隔离的 OpenClaw 环境时，通常会考虑以下三种方案：

A

B

C

D

E

1

方案

隔离级别

启动时间

部署密度

运维复杂度

2

每租户一台 EC2 实例

硬件级（最强）

分钟级

低——空闲实例浪费资源

单租户低，总成本高

3

容器（ECS/EKS）

Namespace 级（共享内核）

秒级

高

高——需要编排专业知识

4

Firecracker microVM

内核级（独立内核）

<125ms

高——每 VM 开销极小

低——控制面自动化管理

容器共享宿主机内核，这意味着内核漏洞可能影响所有租户。独立 EC2 实例提供强隔离，但成本高且配置慢。Firecracker microVM 将虚拟机的安全特性——每个租户拥有独立的 Linux 内核——与容器级别的启动速度和资源效率相结合。这与驱动 [AWS Lambda](https://aws.amazon.com/lambda/)和 [AWS Fargate](https://aws.amazon.com/fargate/)的虚拟化技术完全相同。

## **三、方案概览**

OpenClaw Pool 由三层组成：无服务器控制面、运行 Firecracker microVM 的 EC2 宿主机，以及提供 HTTPS Dashboard 访问的接入层。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/5-self-healing-cost-based-on-firecracker-microvm-bedrock-agentcore-1-new.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/5-self-healing-cost-based-on-firecracker-microvm-bedrock-agentcore-1-new.png)

\\[图1：系统架构，展示控制面、数据面和接入层\\]

### 3.1 控制面（无服务器）

[Amazon API Gateway](https://aws.amazon.com/api-gateway/) 提供以 API Key 保护的 REST API。七个 [AWS Lambda](https://aws.amazon.com/lambda/) 函数分别处理租户生命周期操作、宿主机管理、备份编排、配置模板管理、共享 Skills 列表、健康监控和空闲宿主机回收。[Amazon DynamoDB](https://aws.amazon.com/cn/dynamodb/) 存储租户状态（状态、健康、Gateway Token、rootfs 版本）和宿主机资源追踪（vCPU、内存、VM 数量、空闲时间戳）。[Amazon EventBridge](https://aws.amazon.com/cn/eventbridge/) 调度三个定时任务：健康检查（每 5 分钟）、空闲宿主机回收（每 3 分钟）和每日数据备份。

[Auto Scaling 组](https://docs.aws.amazon.com/autoscaling/ec2/userguide/auto-scaling-groups.html)管理支持[嵌套虚拟化](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/nested-virtualization.html)的 EC2 实例（Intel c8i/m8i/r8i 系列）。每台宿主机运行多个 Firecracker microVM。Host Agent 服务每 15 秒轮询（代码默认 OC\\_AGENT\\_POLL\\_INTERVAL=15）所有本地 VM，执行三项功能：

*   健康监控 — Ping 每个 VM 并探测 OpenClaw Gateway 端口（18789）。将健康状态直接写入 DynamoDB，当 Gateway 响应正常时将租户从 `creating` 提升为 `running`。
*   自动恢复 — 检测 `vm.json`存在但 Firecracker 进程未运行的 VM（例如意外崩溃后），自动重新启动。
*   Balloon 内存管理 — 读取宿主机 `/proc/meminfo`，根据宿主机可用内存比例调整 Firecracker Balloon 设备以回收或归还内存。

### 3.2 接入层

[Amazon CloudFront](https://aws.amazon.com/cloudfront/) 提供 HTTPS 终止，无需自定义域名或 ACM 证书。Application Load Balancer 使用基于路径的规则（`/vm/{tenant-id}/`）将请求路由到正确的宿主机。每台宿主机上的 Nginx 反向代理到租户的 microVM Gateway，支持 WebSocket 以实现交互式 Dashboard 访问。Nginx 配置由 VM 启动和停止脚本自动管理。

## **四、部署架构**

整个基础设施定义为单个 [AWS CDK](https://aws.amazon.com/cdk/) Stack，一条命令即可完成部署。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/5-self-healing-cost-based-on-firecracker-microvm-bedrock-agentcore-2.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/5-self-healing-cost-based-on-firecracker-microvm-bedrock-agentcore-2.png)

\\[图2：部署架构，展示 AWS 服务及其关系\\]

部署创建以下资源：

*   两张 DynamoDB 表（`tenants`、`hosts`），按需计费
*   一个 S3 存储桶，用于 rootfs 镜像、数据模板、备份、共享 Skills、配置模板和 Web 控制台
*   七个 Lambda 函数（API、健康检查、缩容器、备份、Skills、模板、AgentCore 工具）
*   API Gateway，含使用计划和 API Key 认证
*   Auto Scaling 组，含生命周期钩子用于宿主机初始化和优雅终止清理
*   ALB，含基于路径的路由用于租户 Dashboard 访问
*   CloudFront 分配，含 S3 源用于 Web 控制台，以及 CloudFront Function 用于 URL 重写
*   可选的 [Amazon Cognito](https://aws.amazon.com/cognito/) 用户池用于控制台认证
*   可选的 [Amazon Bedrock AgentCore](https://aws.amazon.com/bedrock/agentcore/) 集成（Gateway、Memory、Code Interpreter、Browser）

## **五、租户隔离机制**

每个 microVM 在多个层面实现隔离：

内核隔离。 每个租户在 Firecracker microVM 内运行独立的 Linux 内核。与容器方案中所有租户共享宿主机内核不同，一个租户内核中的漏洞不会影响其他租户。

文件系统隔离。 rootfs 使用 OverlayFS，包含共享的只读基础层和每 VM 独立的可写覆盖层（8 GB 稀疏文件）。自定义的 `/sbin/overlay-init` 脚本作为 VM 的 init 进程运行，在移交给 systemd 之前挂载 overlay。每个租户还拥有独立的数据卷（`data.ext4`），挂载在 `/home/agent`，在重启和 rootfs 重置后持久保留。

网络隔离。 每个 VM 获得专用的 TAP 设备和一个 `/24` 子网（例如，VM 1 使用 `172.16.1.0/24`，VM 2 使用 `172.16.2.0/24`）。出站流量通过宿主机默认接口的 iptables MASQUERADE 转发。VM 子网之间没有路由——租户在网络层面完全不可见。

访问隔离。 每个租户的 OpenClaw Gateway 在创建时生成唯一的认证 Token（48 字符十六进制）。Token 存储在 DynamoDB 中，并包含在控制台的"Open Dashboard"链接中，实现一键访问。

## **六、每个 OpenClaw 租户包含什么**

每个租户是一个运行在 Firecracker microVM 内的完整、自包含的 OpenClaw 环境：

*   OpenClaw Gateway — Agent 的 HTTP/WebSocket 服务器（端口 18789），作为 systemd 用户服务自动启动。提供交互式 Dashboard，用于与 Agent 对话、管理会话和审批工具使用。
*   OpenClaw CLI — 全局预装。租户可以直接运行 `openclaw` 命令。
*   可配置的 LLM 后端 — 每个租户的 `openclaw.json` 指定模型提供商、API Key 和模型 ID。你可以使用配置模板标准化设置，也可以按租户自定义。
*   完整开发工具链 — Python 3.12、Node.js 22、uv、git、GitHub CLI、build-essential 和常用工具（curl、jq、htop、tmux、tree）。
*   共享 Skills，独立记忆 — 所有租户共享集中管理的 Skill 集（从 S3 同步），而每个租户的对话历史和工作空间完全隔离在各自的数据卷上。
*   可选 AgentCore 集成 — 启用后，每个租户自动连接 [Amazon Bedrock AgentCore](https://aws.amazon.com/cn/bedrock/agentcore/)，获得 MCP 工具、持久化记忆、代码解释器和浏览器能力。

## **七、Rootfs 管理与预装工具链**

`build-rootfs.sh` 脚本基于 Ubuntu Noble (24.04) 使用 debootstrap 生成两个镜像：

*   rootfs（只读，共享）— 基础操作系统，预装工具：Python 3.12、Node.js 22、uv（Python 包管理器）、git、GitHub CLI (gh)、OpenClaw CLI、curl、jq、htop、tmux、tree、vim 和 build-essential。
*   data template（每租户复制）— `/home/agent` 目录，包含 OpenClaw 配置、Gateway 服务定义和工作空间结构。

两个镜像使用 pigz 压缩后上传到 S3，附带 `manifest.json` 版本指针。宿主机追踪其 rootfs 版本，`POST /hosts/refresh-rootfs` API 可将新镜像推送到所有活跃宿主机。新租户自动使用最新版本；已有租户可通过 `reset` 操作更新，该操作替换 overlay 层但保留数据卷。

## **八、租户生命周期操作**

API 支持完整的生命周期操作，每个操作通过 [AWS Systems Manager](https://aws.amazon.com/systems-manager/) Run Command 发送到宿主机执行：

A

B

C

1

操作

行为

使用场景

2

`create`

分配资源、启动 microVM、配置网络和 ALB 路由

新建租户

3

`delete`

停止 VM、移除 ALB 规则、更新宿主机计数。可选 `?keep_data=true` 保留数据卷

删除租户

4

`stop` / `start`

优雅关机 / 冷启动（复用现有磁盘）

维护窗口

5

`pause` / `resume`

通过 Firecracker API 冻结/解冻 vCPU（即时，亚毫秒级）

临时挂起

6

`restart`

先停止再启动（复用磁盘，快速）

故障恢复

7

`reset`

删除 overlay、重新启动（数据卷保留，rootfs 刷新到最新版本）

系统更新

8

`backup`

异步：暂停 VM、压缩数据卷、恢复 VM、上传到 S3

数据保护

创建租户时，你可以指定 `config_template` 参数，从 S3 管理的模板中应用预配置的 OpenClaw 配置（LLM 提供商、模型、API Key）。也可以使用 `restore_from` 从已有备份创建新租户。

## **九、共享 Skills**

所有租户共享统一的 Skills（SKILL.md 文件），由 S3 集中管理，每个租户的记忆保持独立。同步链路如下：

*   你将 Skills 上传到 `s3://{bucket}/skills/`（例如通过 `aws s3 sync`）
*   每台宿主机上的 cron 任务每 5 分钟从 S3 同步到 `/data/shared-skills/`
*   新 VM 启动时，`launch-vm.sh` 挂载数据卷并将 Skills 复制到 `.openclaw/skills/`
*   运行中的 VM 在下一次宿主机同步周期接收更新的 Skills

## **十、自动扩缩容与空闲回收**

扩容 – 当用户申请创建新的 Openclaw 租户但没有宿主机拥有足够资源（考虑超配比例后）时，租户进入 `pending` 状态，控制面增加 Auto Scaling 组的期望容量。宿主机初始化过程约需 3–5 分钟（KVM 设置、Firecracker 安装、从 S3 下载 rootfs、DynamoDB 自注册、生命周期钩子完成）。`EC2 Instance Launch Successful` 事件的 EventBridge 规则触发 API Lambda，将所有 pending 租户分配到新可用的宿主机。

缩容 – Scaler Lambda 每 3 分钟运行一次，实施两轮确认机制以防止误终止：

*   `vm_count=0` 超过配置的 `idle_timeout_minutes`（默认 10 分钟）的宿主机被标记为 idle
*   下一轮检查时，如果宿主机仍然空闲且 Auto Scaling 组的期望容量超过最小值，则通过 ASG API 终止该宿主机（`ShouldDecrementDesiredCapacity=True`）
*   如果在两轮之间有租户被分配到该宿主机，Scaler 自动将宿主机恢复为 `active` 状态

终止生命周期钩子触发 API Lambda 清理终止宿主机上所有租户的 DynamoDB 记录和 ALB 规则。

## **十一、两级健康监控**

健康监控采用两级架构以确保可靠性：

一级：Host Agent（默认每 5 秒）。 Agent 作为 systemd 服务运行在每台宿主机上，通过 ping 和 HTTP 探测所有本地 VM。它将健康状态直接写入 DynamoDB，避免了逐租户 SSM 命令的延迟和成本。当 VM 从 `creating` 转为健康状态时，Agent 通过 SSH 读取 Gateway Token 并将租户提升为 `running`。

二级：Lambda Watchdog（默认每 5 分钟）。 健康检查 Lambda 扫描健康数据过期（2 分钟无更新）的运行中租户。如果某台宿主机上的所有租户都过期，Lambda 判定 Host Agent 本身已宕机，通过 SSM 重启它（`systemctl restart host-agent`）。10 分钟冷却期防止重启风暴。

## **十二、备份与恢复**

EventBridge 每日触发所有运行中租户数据卷到 [Amazon S3](https://aws.amazon.com/s3/) 的备份。宿主机上的备份脚本执行以下流程：

*   暂停 VM（Firecracker API，即时）
*   使用 pigz（并行 gzip）压缩 `data.ext4`
*   恢复 VM
*   上传压缩文件到 `s3://{bucket}/backups/{tenant-id}/{timestamp}.gz`

`trap` 处理器确保即使压缩或上传失败，VM 也会自动恢复运行。S3 生命周期规则（通过 CDK CustomResource 配置）自动删除超过保留期（默认 7 天）的备份。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/5-self-healing-cost-based-on-firecracker-microvm-bedrock-agentcore-3.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/5-self-healing-cost-based-on-firecracker-microvm-bedrock-agentcore-3.png)

\\[图3：Backups 页签，展示跨租户备份管理和孤儿备份检测\\]

Web 控制台 — Backups 页签

`GET /backups API` 返回所有租户的所有备份，与租户表左连接以标记每个备份为 `active`（源租户存在）或 `orphan`（源租户已删除）。恢复操作基于备份的数据卷创建新租户——源租户无需存在：

```
# 从指定租户的最新备份恢复（源租户可以已被删除）
curl -s -X POST "${API_URL}tenants" \
  -H "x-api-key: ${API_KEY}" \
  -d '{
    "name": "restored-agent",
    "vcpu": 2, "mem_mb": 4096,
    "restore_from": {"tenant_id": "original-agent-ab12"}
  }' | jq .

# 从指定时间戳的备份恢复
curl -s -X POST "${API_URL}tenants" \
  -H "x-api-key: ${API_KEY}" \
  -d '{
    "name": "restored-agent",
    "restore_from": {"tenant_id": "original-agent-ab12", "timestamp": "20260428-125402"}
  }' | jq .
```

## **十三、成本优化：多层超配与资源效率**

OpenClaw Pool 实现了从计算调度到存储效率的多层成本优化。下表总结了每一层及其效果：

A

B

C

D

1

优化层

机制

典型收益

配置方式

2

CPU 超配

调度超过物理核心数的 vCPU。AI Agent 通常是突发型负载——大部分时间空闲，推理时短暂活跃。

2 倍密度（默认）

`cpu_overcommit_ratio: 2.0`

3

内存超配 + Balloon

调度超过物理 RAM 的内存。Firecracker Balloon 设备动态回收 VM 空闲内存，需要时归还。

1.5 倍密度

`mem_overcommit_ratio: 1.5` + `balloon.enabled: true`

4

共享 rootfs（OverlayFS）

同一宿主机上所有 VM 共享一个只读 rootfs 镜像（~1.5 GB）。每个 VM 仅在 2 GB 稀疏 overlay 文件中存储差异写入。实际磁盘占用通常为 50–200 MB。

rootfs 存储节省 ~90%

内置，无需配置

5

稀疏数据卷

数据卷使用 `cp --sparse=always` 进行模板复制，解压后使用 `fallocate --dig-holes`。名义上 8 GB 的数据卷实际可能仅占用 1–2 GB 磁盘块。

数据存储节省 ~75%

内置

6

Spot 实例

宿主机使用 EC2 Spot 定价。

计算成本降低 60–70%

`asg.use_spot: true`

7

空闲宿主机自动回收

两轮确认：空宿主机先标记为 idle，下一轮仍空闲则终止。不为零租户的宿主机付费。

消除空闲浪费

`scaler.idle_timeout_minutes: 10`

8

无服务器控制面

Lambda + DynamoDB 按需计费 + EventBridge。无 API 调用或定时事件时零成本。

基线成本接近零

内置

9

Firecracker 极低开销

每个 microVM 的 VMM 进程本身仅消耗 <5 MB 宿主机内存，而完整 QEMU/KVM 虚拟机需要 ~500 MB+。

每 VM 开销降低 ~100 倍

内置

### 13.1 超配机制详解

**vCPU 超配**

AI Agent 工作负载天然具有突发性：Agent 大部分时间在等待用户输入或 LLM API 响应，仅在工具执行期间短暂占用 CPU。`cpu_overcommit_ratio`为 2.0 意味着 8 vCPU 的宿主机可以跨租户调度 16 个 vCPU。宿主机上的 Linux CFS 调度器透明地对物理核心进行时间片共享。只要不是所有租户同时突发——对于 AI Agent 工作负载这在统计上是不太可能的——这种方式就是安全的。

**内存超配**

内存超配需要 Firecracker Balloon 设备才能真正生效。不启用时，超配仅是调度层面的优化——如果物理内存耗尽，宿主机内核可能 OOM-kill Firecracker 进程。

```
balloon:
  enabled: true
  max_inflate_ratio: 0.4       # 最多回收 VM 声明内存的 40%
  min_guest_available_mb: 512  # Guest 可用内存不低于 512 MB
  deflate_on_oom: true         # Guest OOM 时自动归还内存
  free_page_reporting: true    # Guest 主动报告空闲页
```

Host Agent 每 5 秒读取 `/proc/meminfo` 并调整 Balloon 目标：

*   宿主机可用内存 < 20% → inflate（从 VM 回收内存到宿主机）
*   宿主机可用内存 > 40% → deflate（归还内存给 VM）
*   20%–40% 迟滞区间防止振荡
*   每个 VM 至少保留 `min_guest_available_mb`，防止过度回收

### 13.2 成本示例

以单台 `m8i.2xlarge` 宿主机（8 vCPU，32 GB RAM，us-east-1 按需约 $0.46/小时）为例：

A

B

C

D

1

场景

超配配置

每宿主机租户数

每租户每小时成本

2

不超配

1.0x CPU, 1.0x Mem

3（每个 2C/8G）

~$0.15

3

仅 CPU 超配

2.0x CPU, 1.0x Mem

6

~$0.08

4

全面超配

2.0x CPU, 1.5x Mem

8–10

~$0.05

5

全面超配 + Spot

2.0x CPU, 1.5x Mem, Spot

8–10

~$0.015

Web 控制台在宿主机资源条上可视化超配：标记线指示物理容量边界，填充区域在分配超配资源时延伸到标记线之外。

## **十四、Web 管理控制台**

项目包含一个基于 Alpine.js 的零依赖单页 Web 管理控制台，托管在 S3 + CloudFront 上。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/5-self-healing-cost-based-on-firecracker-microvm-bedrock-agentcore-4.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/5-self-healing-cost-based-on-firecracker-microvm-bedrock-agentcore-4.png)

\\[图4：Web 控制台 – Tenants 页，展示宿主机资源利用率和租户状态\\]

Web 控制台提供四个tab页：

*   Tenants — 宿主机资源仪表盘（CPU/内存利用率条，含超配可视化和物理容量标记线）、租户列表（VM 和 Gateway 健康指示器）、一键操作（启动、停止、暂停、恢复、重启、重置、删除、打开 Dashboard）。支持按宿主机和状态过滤。
*   Application — 配置模板 CRUD（创建、编辑、删除不同 LLM 提供商的 OpenClaw JSON 配置）、共享 Skills 列表（描述从 SKILL.md frontmatter 解析）。
*   Backups — 跨租户备份浏览器（按租户分组，可折叠历史记录）、孤儿备份过滤、大小和时间戳显示、一键恢复到新租户。
*   Settings — API 连接配置（URL 和 Key，含可见性切换）、AgentCore 状态、系统版本和 GitHub 项目链接。

可选的 Cognito 认证通过 OAuth2 隐式流保护控制台——启用后，用户必须登录才能访问Web 控制台。

## **十五、可选：AgentCore 集成**

在 `config.yml` 中启用 AgentCore 后，CDK Stack 会创建以下 [Amazon Bedrock AgentCore](https://aws.amazon.com/bedrock/agentcore/)资源：

*   Gateway — MCP 兼容的工具中心，含 Lambda 支持的工具（通过 `agentcore_tools` Lambda 注册）。Gateway URL 自动注入到每个 VM 的 `openclaw.json` 中作为 MCP Server。
*   Memory — 每租户持久化记忆，支持语义和用户偏好策略，按租户 ID 命名空间隔离。
*   Code Interpreter — 安全沙箱 Python 执行环境。
*   Browser — 云端 Web 自动化能力。
*   Workload Identity — Agent AWS 访问的 IAM 身份。

每个 VM 在启动时自动连接这些服务——无需逐租户配置。

## **十六、注意事项与限制**

在评估本方案是否适合你的场景时，请考虑以下因素：

*   租户规模上限。 ALB Listener 默认支持最多 100 条规则（申请配额提升后为 200 条）。每个租户需要一条基于路径的规则，因此单集群最大租户数约为 200。更大规模的部署需要修改路由架构（例如基于 Host Header 的路由或自定义代理层）。
*   实例系列要求。 AWS 上的嵌套虚拟化目前仅支持 Intel 实例（c8i、m8i、r8i 系列）。不支持 AMD 和 Graviton 实例。
*   不支持 GPU 直通。 Firecracker 不支持 GPU 设备直通。本方案适用于基于 CPU 的 AI Agent 工作负载。
*   单可用区部署。 默认部署使用默认 VPC 中的单个可用区。需要高可用的生产工作负载需要扩展架构以支持跨可用区。
*   示例项目定位。 本项目作为参考架构发布在 aws-samples 下，旨在用于学习和实验，未经额外加固（例如静态加密、VPC 端点、WAF 集成）不建议直接用于生产环境。
*   DynamoDB Scan 操作。 租户和宿主机列表操作使用 DynamoDB 全表 Scan，随着租户数量增长效率可能下降。当部署接近 200 租户上限时，建议添加全局二级索引。
*   SSM 命令并发。 所有 VM 操作通过 SSM Run Command 执行。对大量租户的并发操作可能受到 SSM API 限流限制。
*   Spot 实例风险。 可选的 Spot 实例模式（`use_spot: true`）可降低 60–70% 成本，但存在实例被回收的风险。被回收宿主机上的所有租户将被终止（终止生命周期钩子会清理 DynamoDB 记录）。

## **十七、最佳实践**

在部署和运维龙虾池 (OpenClaw Pool) 时，我们建议：

*   从保守的超配比例开始（CPU 1.5 倍、内存 1.0 倍），根据观察到的工作负载模式逐步调整。监控 Host Agent 的 Balloon 统计数据以了解实际内存利用率。
*   使用内存超配时务必启用 Balloon 设备。不启用时，内存超配仅是调度层面的优化——如果物理内存耗尽，宿主机内核可能 OOM-kill Firecracker 进程。
*   使用配置模板标准化各租户的 LLM 提供商设置，减少配置漂移。`default` 模板受保护，不可删除。
*   需要更新租户基础系统时，使用 `reset` 操作（保留数据卷，将 rootfs overlay 刷新到最新版本），而非删除后重建。
*   为降低成本，非关键工作负载（开发、测试、Hackathon）可考虑 Spot 实例。`keep_data_volume: true`设置在宿主机终止时保留 EBS 数据卷，允许数据恢复。
*   根据备份保留需求设置合适的 S3 生命周期规则。默认 7 天保留期在存储成本和恢复灵活性之间取得平衡。

## **十八、清理资源**

移除所有已部署的资源：

```
./scripts/destroy.sh           # 销毁 CDK Stack，保留 S3 存储桶和 DynamoDB 表
./scripts/destroy.sh --purge   # 彻底清理，包括 S3 数据、DynamoDB 表、孤立 IAM 角色和 EBS 卷
```

## **十九、总结**

OpenClaw Pool 展示了 Firecracker microVM 如何在保持无服务器控制面运维简洁性的同时，为 AI Agent 工作负载提供内核级租户隔离。通过将 Firecracker 的安全特性与 AWS 托管服务（用于调度、扩缩容和可观测性）相结合，你可以通过单次 CDK 部署和一套 REST API 部署多达 200 个隔离的 AI Agent 实例。

本方案适用于内部 AI 平台、培训环境、Hackathon 和概念验证部署——这些场景需要强租户隔离，但不希望承担 Kubernetes 的运维开销或每租户独立 EC2 实例的成本。

完整源代码、部署说明和 API 参考请访问 AWS Samples：[https://github.com/aws-samples/sample-multi-tenant-openclaw-on-firecracker](https://github.com/aws-samples/sample-multi-tenant-openclaw-on-firecracker)

**➡️ 下一步行动：**

**相关产品：**

*   [Amazon EC2](https://aws.amazon.com/cn/ec2/?p=bl_pr_ec2_l=1) — 安全且可调整大小的计算容量
*   [Amazon S3](https://aws.amazon.com/cn/s3/?p=bl_pr_s3_l=2) — 适用于 AI、分析和存档的几乎无限的安全对象存储
*   [AWS Lambda](https://aws.amazon.com/cn/lambda/?p=bl_pr_lambda_l=3) — 无需服务器即可运行代码
*   [Amazon DynamoDB](https://aws.amazon.com/cn/dynamodb/?p=bl_pr_dynamodb_l=4) — 无服务器分布式 NoSQL 数据库
*   [Amazon Bedrock](https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=5) — 用于构建生成式人工智能应用程序和代理的端到端平台

**相关文章：**

*   [基于 Amazon EKS 和 Graviton 构建多租户 AI Agent 平台：OpenClaw on Kubernetes 实践](https://aws.amazon.com/cn/blogs/china/build-multi-tenant-ai-agent-on-eks-graviton-openclaw-k8s-practice/?p=bl_ar_l=1)
*   [Firecracker 在航空营销多智能体中的应用](https://aws.amazon.com/cn/blogs/china/application-of-firecracker-in-aviation-marketing-multi-agent-systems/?p=bl_ar_l=2)
*   [OpenClaw 在电商平台的应用场景探索](https://aws.amazon.com/cn/blogs/china/exploring-openclaw-use-cases-in-ecommerce-platforms/?p=bl_ar_l=3)
*   [把 OpenClaw 从个人助手变成客服：一次信任模型的翻转](https://aws.amazon.com/cn/blogs/china/openclaw-from-personal-assistant-to-customer-service-a-trust-model-flip/?p=bl_ar_l=4)
*   [短剧视频字幕位置自动识别：OpenCV + Amazon Nova 2 Lite 混合方案](https://aws.amazon.com/cn/blogs/china/video-opencv-amazon-nova-2-lite-solution/?p=bl_ar_l=5)

## **二十、相关资源**

*   [Firecracker microVM](https://firecracker-microvm.github.io/) — 本方案使用的开源 VMM
*   [AWS CDK](https://aws.amazon.com/cdk/) — 用于部署的基础设施即代码框架
*   [Amazon EC2 嵌套虚拟化](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/nested-virtualization.html) — 在 EC2 上运行 Firecracker 的前置条件
*   [使用 AWS Lambda 租户隔离模式构建多租户 SaaS 应用](https://aws.amazon.com/blogs/compute/building-multi-tenant-saas-applications-with-aws-lambdas-new-tenant-isolation-mode/) — AWS 多租户隔离的相关方案
*   [AWS Well-Architected Framework SaaS Lens](https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/saas-lens.html) — AWS 上 SaaS 架构的最佳实践
*   [Amazon Bedrock AgentCore](https://aws.amazon.com/bedrock/agentcore/) — 可选集成，提供 Agent 工具网关、记忆和代码解释器

\*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

* * *

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/summit-tag3.png)

## 亚马逊云科技中国峰会

开发者挑战赛现场开启，基于真实业务场景亲手构建 Agent。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/25/yuyuecanhui.png)](https://aws.amazon.com/cn/events/summits/shanghai/?ectrk=jyLXNovBYB51qgzUEipIpZcxlfE5%2Bs7NfDTnZwR7hFYtQmPUSToTuN%2FZO5doh20ZJ%2FloW6Rom0l3P4LLcoyUPA%3D%3D&sc_icampaign=glb-summit-blog-p2&sc_ichannel=ha&sc_iplace=blog&trk=ab30be54-aedd-480a-9364-ab0bf98e982d)

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/14/2026_Summits_Commercial_Banner_1440x657.png)

## 参考来源

## 深度分析

### 1. Firecracker microVM 在多租户隔离范式中的定位

Firecracker 处于容器与传统 VM 之间的独特生态位：它保留了独立内核这一 VM 核心安全属性，同时将 VMM 内存开销压缩至 <5 MB（比 QEMU/KVM 低约 100 倍），使得在单台 EC2 宿主机上运行数十个租户成为经济上可行的选择 。这一组合在 AWS Lambda 和 Fargate 的生产环境中得到验证，理论上可支撑每主机密度远高于传统 VM 方案的多租户部署。关键在于理解其隔离模型：内核级隔离意味着一个租户内核中的 CVE 无法直接穿透到其他租户或宿主机，这与命名空间级隔离（有共同内核的容器）有本质区别。对安全敏感的多租户 AI Agent 场景，这是核心差异化价值。

### 2. Serverless 控制面与数据面分离的架构优势

方案将租户调度、健康监控、扩缩容等控制平面完全托付给 Lambda + DynamoDB + EventBridge，实现真正的无服务器运维。这种设计将控制面成本压至接近零（无 API 调用时无开销），同时利用 AWS 原生的可用性和扩展性。相比之下，数据面（Host Agent）仅负责本地 VM 生命周期和状态上报，与控制面通过 DynamoDB 解耦。这种分离允许控制面无状态扩展（多个 Lambda 并发处理租户请求），而数据面通过 SSM Run Command 异步执行操作，两层之间无需直接网络通信，大幅降低了架构复杂度 。

### 3. 多层超配机制的成本优化逻辑

成本降至 1/8 的核心并非单一优化手段，而是多层超配的叠加效应：vCPU 超配 2.0x（AI Agent 突发负载天然适合时间片共享）、内存超配配合 Balloon 动态回收（宿主机内存 <20% 时从 VM 回收，>40% 时归还）、共享 rootfs（所有 VM 共用 ~1.5 GB 只读镜像，overlay 差异层仅 50–200 MB）、稀疏数据卷（8 GB 名义卷实际占用 1–2 GB）。这些层叠加后，单台 m8i.2xlarge（8 vCPU / 32 GB）可承载 8–10 个租户，每租户小时成本降至 $0.015（全面超配 + Spot） 。内存超配尤其值得注意：不启用 Balloon 时，超配仅是调度层面的虚假承诺——物理内存耗尽时宿主机内核会 OOM-kill Firecracker 进程；Balloon 启用后，宿主机可通过 inflate/deflate 动态管理实际内存分配，实现真正的内存超配。

### 4. 共享 Skills 与独立记忆的边界设计

方案在多租户场景下巧妙地分离了「共享知识」与「私有状态」：所有租户共享 S3 集中管理的 Skills（通过每 5 分钟的 cron 同步），实现平台级能力的一致性升级（管理员更新一个 Skills 文件，所有租户在下一个同步周期自动获得）；而每个租户的对话历史、工作空间、数据卷完全隔离在各自的 `data.ext4` 上，重启或 rootfs 重置后持久保留 。这一设计在多租户 PaaS 场景中具有普适参考价值：共享的是不可变的平台能力（Skills、工具链），隔离的是可变租户状态（记忆、会话）。配合 AgentCore 的 Memory 集成，还能进一步实现按租户 ID 命名空间隔离的语义记忆。

### 5. 两级健康监控的容错设计

Host Agent（5 秒级）与 Lambda Watchdog（5 分钟级）的两级架构实现了监控的去中心化与容错：Host Agent 直接写入 DynamoDB，避免了逐租户 SSM 命令调用的延迟和成本；Lambda Watchdog 作为独立进程运行，当宿主机的所有租户健康数据同时过期时触发 Host Agent 重启，解决了 Host Agent 本身可能宕机时的自愈问题 。10 分钟冷却期防止重启风暴。这种两级设计体现了分布式系统监控的经典思路：用本地轻量探针处理高频监控，用全局独立进程处理低频哨兵判断。

## 实践启示

### 1. 从保守超配起步，按监控数据迭代

首次部署建议从 CPU 1.5x / 内存 1.0x 的保守比例开始，运行 1–2 周后观察 Host Agent 的 Balloon 统计数据（可通过 DynamoDB 或控制台查看内存实际利用率）。AI Agent 工作负载的突发特征因使用场景差异巨大（代码生成型 vs 对话型 vs 数据分析型），没有放之四海而皆准的超配比例。监控 Balloon 的 inflate/deflate 频率可以帮助判断内存压力，从而安全地逐步提升内存超配比例至 1.3x、1.5x 。

### 2. 使用 `reset` 而非 `delete` 进行系统更新

当需要更新租户的 rootfs 或系统工具链时，应优先使用 `reset` 操作而非删除后重建。`reset` 删除 overlay 层并用最新 rootfs 重新初始化，同时保留 `/home/agent` 数据卷中的租户记忆和工作空间。这意味着租户的 OpenClaw 配置、历史会话、自定义工具均得以保留，用户无感知。对于需要频繁更新基础镜像的多租户 SaaS 场景，这一差异直接影响用户体验和运营成本 。

### 3. 非关键环境优先使用 Spot 实例并配置数据卷保护

对于开发、测试、Hackathon 等非关键工作负载，启用 Spot 实例（`use_spot: true`）可将计算成本降低 60–70%。同时应配置 `keep_data_volume: true`，使宿主机被回收时 EBS 数据卷得以保留而非一并销毁。结合 `restore_from` API，可在 Spot 回收后从保留的数据卷备份快速恢复租户，将实例被回收的影响降到最低。这种配置适合有容错能力的场景，但生产环境建议仍使用按需实例以确保稳定性 。

### 4. 为超过 100 租户的扩展场景提前规划路由架构

默认 ALB Listener 限制 100 条规则（可申请提升至 200），这意味着单集群的租户规模上限约为 100–200。在规划大规模部署时，应提前考虑路由架构的演进路径：基于 Host Header 的路由（将租户 ID 编码在域名中而非路径）可突破规则数量限制；或者引入自定义代理层（如 Nginx 作为 ALB 后的七层反向代理）将路由逻辑从 ALB 规则转移至配置化管理。忽略这一上限可能在运营后期面临架构改造的高成本 。

### 5. 生产部署前的必需加固项

示例项目定位为参考架构和学习实验，直接用于生产环境需进行额外加固：VPC 端点（确保 DynamoDB/API Gateway 流量不经过公网）、静态加密（rootfs 和数据卷的 KMS 加密）、WAF 集成（API Gateway 前置 AWS WAF 防护）、跨可用区高可用（修改为 Multi-AZ 部署）、DynamoDB 全局二级索引（避免 200 租户规模时的 Scan 性能瓶颈）。此外，生产级部署还应建立监控告警体系，监控 Host Agent 的 Balloon 统计、Lambda 的错误率、DynamoDB 的读/写容量单位消耗等关键指标。

## 相关实体
- [Bedrock Agentcore Payment X402 Agent](ch11/050-bedrock-agentcore.html)
- [Agentcore Payments X402 Agentic Commerce](ch11/066-agentcore-payments.html)
- [Aws 一周综述Amazon Bedrock Agentcore 付款适用于 Aws 的 Agent 工具套件等2026 年 5 月 11 日](../ch04/530-amazon-bedrock-agentcore.html)
- [Ai Agent 的迁移与现代化 使用 Amazon Bedrock Agentcore 将 Openclaw 从单机改造为多租户 Serverless 架构 ](../ch04/530-amazon-bedrock-agentcore.html)
- [Using Amazon Bedrock Agentcore Openclaw Multi 4](../ch04/530-amazon-bedrock-agentcore.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/firecracker-bedrock-agentcore-multi-tenant.md)

---

