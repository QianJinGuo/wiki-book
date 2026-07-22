---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/aws-devops-agent-access-aws-access-ak-sk-authentication
ingested: 2026-07-01
sha256: b6a004b51d64ef20fbb91eab6cce4800c4e1371e60065e4b6709bebd13e728c3
title: "AWS DevOps Agent 接入 AWS 中国区（二）：多账号扩展、跨云接入与无长期 AK/SK 认证"
type: article
tags: [aws, devops-agent, agent-infrastructure, mcp, aws-china]
---

# AWS DevOps Agent 接入 AWS 中国区（二）：多账号扩展、跨云接入与无长期 AK/SK 认证

摘要：本文是 AWS DevOps Agent 接入 AWS 中国区系列的第二篇。前一篇介绍了为什么需要 MCP（Model Context Protocol）桥，以及单账号部署的端到端流程。本文承接上文，聚焦三件事：第一，如何用一个 Helm Chart 管理 N 个 AWS 中国区账号；第二，跨云接入（以阿里云为例）的工程取舍；第三，长期 Access Key 的 90 天轮换实践。  
  
**目录**

01 引言

02 多账号架构：Hub-Spoke 扇出

03 实战 Phase 1：证书和 Hub/Spoke 部署

04 实战 Phase 2：把 ECS 认证切到 Roles Anywhere

05 踩坑：RequestExpired —— 凭证一小时后全失效

06 跨云的现实：阿里云仍然是 AK/SK

07 新增账号清单

08 成本与取舍

09 对比总结

* * *

## **1\. 引言**

第一篇介绍了单账号场景下的基础架构部署。本篇在此基础上展开三个主题——多账号扩展、跨云接入、凭证治理——均为将 [AWS DevOps Agent](<https://aws.amazon.com/cn/devops-agent/>) 接入中国区生产环境后需要解决的工程问题。 

但本篇不会介绍如何”管理多组 AK/SK”。本文的主要是介绍是如何将长期 AK/SK 从架构中彻底移除，转而使用 IAM Roles Anywhere——以证书换取临时凭证、一张证书扇出多账号、泄露后可实现秒级吊销，来保证跨云方式时的安全性。 

前置阅读是第一篇《架构与单账号部署》。下面的部署沿用那篇的 ECS Fargate + 内部 ALB；如果您采用的是 EKS 方案，本文的网络拓扑同样适用，只需将”ECS Service”替换为”Deployment”即可。

本文按照一次真实的从零重建过程编写：生成证书 → 部署 Hub/Spoke → 切换 ECS → 在生产环境中遇到凭证过期问题 → 以更优雅的方式修复。每一步均附有完整命令和实际输出，所有代码均在<https://github.com/warren830/aws-devops-agent-external-mcp>

## **2\. 多账号架构：Hub-Spoke 扇出**

IAM Roles Anywhere 一句话概括：允许不在 AWS 上运行的工作负载，使用 X.509 证书换取 STS 临时凭证。

传统方案中，仅运行在 AWS 上的资源（EC2、Lambda、ECS）能通过 Task Role 获取临时凭证。运行在其他环境中的工作负载（本地数据中心、其他云、另一个 AWS 分区/如；中国区域）只能使用 AK/SK。Roles Anywhere 就是为解决这个问题而设计的

本方案中 MCP Server 部署在全球区 us-east-1，需要访问的目标资源位于中国区 cn-northwest-1 / cn-north-1。这正是”跨分区访问”的典型场景。

### 2.1 三个核心概念

概念  | 类比  | 作用   
---|---|---  
Trust Anchor  | SSH 的 authorized_keys  | 信任哪个 CA 签发的证书   
Profile  | IAM Instance Profile  | 定义可 assume 的 Role 及凭证有效期   
Role  | 普通 IAM Role  | 定义权限，被 assume 后签发临时凭证   
  
Trust Anchor 是信任锚，告诉 Roles Anywhere 信任哪个 CA 签发的证书，可以把它近似理解成 SSH 的 authorized_keys；Profile 决定这张证书能换哪些 role、凭证给多久；Role 还是普通 IAM Role，最终被 assume 后发出临时凭证。

### 2.2 Hub-Spoke：一张证书管所有账号

如果每个目标账号都单独部署一套 Trust Anchor + Profile + Role，新增账号时需要在目标账号中部署三项资源，操作负担较高。 

更好的做法是 Hub-Spoke：仅在一个”Hub 账号”中配置 IAM Roles Anywhere，Hub Role 通过 sts:AssumeRole 扇出到各 Spoke 账号。

链路变成：一张证书 → 一个 Hub Role → N 个 Spoke Role。新增账号时，新账号只需要部署 Spoke Role，再把它的 ARN 加回 Hub。

### 2.3 为什么 Hub 必须在 aws-cn 分区

sts:AssumeRole 不支持跨分区调用（aws → aws-cn 不可行）。因此 Hub 必须与 Spoke 同属 aws-cn 分区。MCP Server 虽然运行在 us-east-1，但其调用的是 rolesanywhere.cn-northwest-1.amazonaws.com.cn 这一公网可达的端点——与当前使用 AK/SK 调用 ec2.cn-northwest-1.amazonaws.com.cn 完全一致，网络路径不变，仅替换认证方式。

## **3\. 实战 Phase 1：证书和 Hub/Spoke 部署**

### 3.1 生成证书
    
    
    cd cfn/
    ./generate-certs.sh ~/mcp-certs
    

脚本会产出四个文件：

文件 | 有效期 | 保管方式  
---|---|---  
ca.crt | 10 年 | 上传到 Roles Anywhere Trust Anchor，可公开  
ca.key | 10 年 | 离线保管（HSM/Vault） —— 签发新客户端证书才用  
client.crt | 1 年 | 存 Secrets Manager，ECS 启动时用  
client.key | 1 年 | 存 Secrets Manager，ECS 启动时用  
  
CA 证书作为长期信任锚，客户端证书按年轮换。轮换时仅需重新签发客户端证书，Trust Anchor 无需变更。

### 3.2 部署 Hub（cn-northwest-1）

本文使用一个中国区账号（宁夏 cn-northwest-1，下文记为 <CN_NW_ACCOUNT_ID>）同时承担 Hub 和 Spoke 角色，另一个账号（北京 cn-north-1，记为 <CN_N_ACCOUNT_ID>）作为第二个 Spoke。Hub 与 Spoke 位于同一账号是合法配置——Hub Role 可以 assume 同账号内的 Spoke Role。
    
    
    aws cloudformation deploy \
    --template-file cfn/roles-anywhere-hub.yaml \
    --stack-name mcp-roles-anywhere-hub \
    --parameter-overrides \
    CACertificateBody="$(cat ~/mcp-certs/ca.crt)" \
    SpokeRoleArns="arn:aws-cn:iam::<CN_NW_ACCOUNT_ID>:role/mcp-spoke-readonly,arn:aws-cn:iam::<CN_N_ACCOUNT_ID>:role/mcp-spoke-readonly" \
    --capabilities CAPABILITY_NAMED_IAM \
    --region cn-northwest-1 \
    --profile china-hub
    

输出三个 ARN（后面 Terraform 配置需引用）：
    
    
    TrustAnchorArn = arn:aws-cn:rolesanywhere:cn-northwest-1:<CN_NW_ACCOUNT_ID>:trust-anchor/xxxx
    ProfileArn = arn:aws-cn:rolesanywhere:cn-northwest-1:<CN_NW_ACCOUNT_ID>:profile/yyyy
    HubRoleArn = arn:aws-cn:iam::<CN_NW_ACCOUNT_ID>:role/mcp-roles-anywhere-hub
    

SpokeRoleArns 是以逗号分隔的列表——这是 Hub-Spoke 扇出的核心机制：后续新增账号时，只需将新 Spoke Role ARN 追加到该列表并重新部署即可。该操作幂等，可重复执行。

### 3.3 部署两个 Spoke
    
    
    # Spoke 1（宁夏，和 Hub 同账号）
    aws cloudformation deploy \
    --template-file cfn/roles-anywhere-spoke.yaml \
    --stack-name mcp-spoke-role \
    --parameter-overrides HubRoleArn="arn:aws-cn:iam::<CN_NW_ACCOUNT_ID>:role/mcp-roles-anywhere-hub" \
    --capabilities CAPABILITY_NAMED_IAM \
    --region cn-northwest-1 --profile china-hub
    
    # Spoke 2（北京）
    aws cloudformation deploy \
    --template-file cfn/roles-anywhere-spoke.yaml \
    --stack-name mcp-spoke-role \
    --parameter-overrides HubRoleArn="arn:aws-cn:iam::<CN_NW_ACCOUNT_ID>:role/mcp-roles-anywhere-hub" \
    --capabilities CAPABILITY_NAMED_IAM \
    --region cn-north-1 --profile china-spoke-2
    

Spoke Role 的信任策略：
    
    
    {
    "Effect": "Allow",
    "Principal": { "AWS": "arn:aws-cn:iam::<CN_NW_ACCOUNT_ID>:role/mcp-roles-anywhere-hub" },
    "Action": "sts:AssumeRole",
    "Condition": { "StringEquals": { "sts:ExternalId": "mcp-bridge" } }
    }
    

ExternalId 是防 confused deputy 的保险。别人即使知道 Hub Role ARN，没有约定的 mcp-bridge 也 assume 不进来。

### 3.4 将证书存入Secrets Manager（us-east-1）
    
    
    aws secretsmanager create-secret --name /mcp/ra-cert \
    --secret-string file://~/mcp-certs/client.crt --region us-east-1
    aws secretsmanager create-secret --name /mcp/ra-key \
    --secret-string file://~/mcp-certs/client.key --region us-east-1
    

注意存的是纯 PEM 文本，不是 JSON。和 AK/SK 模式存 {“AK”:”…”,”SK”:”…”} 不同。

## **4\. 实战 Phase 2：把 ECS 认证切到 Roles Anywhere**

无需修改任何 Terraform 代码。terraform-ecs/ 目录下的代码已内置 auth_mode 条件分支，只需修改 terraform.tfvars 即可。

### 4.1 改 tfvars
    
    
    # ===== 新增：Roles Anywhere 全局配置 =====
    roles_anywhere = {
    cert_secret_arn = "arn:aws:secretsmanager:us-east-1:<GLOBAL_ACCOUNT_ID>:secret:/mcp/ra-cert-xxxx"
    key_secret_arn = "arn:aws:secretsmanager:us-east-1:<GLOBAL_ACCOUNT_ID>:secret:/mcp/ra-key-yyyy"
    trust_anchor_arn = "arn:aws-cn:rolesanywhere:cn-northwest-1:<CN_NW_ACCOUNT_ID>:trust-anchor/xxxx"
    profile_arn = "arn:aws-cn:rolesanywhere:cn-northwest-1:<CN_NW_ACCOUNT_ID>:profile/yyyy"
    hub_role_arn = "arn:aws-cn:iam::<CN_NW_ACCOUNT_ID>:role/mcp-roles-anywhere-hub"
    region = "cn-northwest-1"
    }
    
    # ===== 账号：从 ak_sk 改为 roles_anywhere =====
    accounts = {
    aws-cn = {
    host = "aws-cn.example.cloud"
    aws_region = "cn-northwest-1"
    auth_mode = "roles_anywhere"
    spoke_role_arn = "arn:aws-cn:iam::<CN_NW_ACCOUNT_ID>:role/mcp-spoke-readonly"
    }
    aws-cn-2 = {
    host = "aws-cn-2.example.cloud"
    aws_region = "cn-north-1"
    auth_mode = "roles_anywhere"
    spoke_role_arn = "arn:aws-cn:iam::<CN_N_ACCOUNT_ID>:role/mcp-spoke-readonly"
    use_entrypoint = true
    eks_cluster = "bjs-web"
    eks_region = "cn-north-1"
    }
    }
    

原来的 access_key / secret_key 可以整个删掉。

这里顺手说明一下：aws-cn-2 的 use_entrypoint / eks_cluster / eks_region 和认证切换无关——这些参数用于使容器额外注册 call_kubectl 能力（通过 eks:DescribeCluster 获取 kubeconfig 后操作中国区 EKS 集群），属于该账号的业务需求，并非 Roles Anywhere 配置的一部分。在 AK/SK 模式下这些字段同样存在。

### 4.2 Apply + 构建镜像
    
    
    cd terraform-ecs/
    terraform apply -auto-approve # 34 个资源全新创建
    

ECS Service 启动后，由于 ECR 仓库为空，Task 将因拉取镜像失败而处于 STOPPED 状态。需要构建支持 Roles Anywhere 的镜像（注意使用 Dockerfile.ra 而非 Dockerfile）：
    
    
    aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin <ACCOUNT>.dkr.ecr.us-east-1.amazonaws.com
    docker build --platform linux/amd64 \
    -t <ECR_URL>/mcp-aws:latest -f deploy/Dockerfile.ra .
    docker push <ECR_URL>/mcp-aws:latest
    
    # 拉新镜像
    aws ecs update-service --cluster mcp --service mcp-aws-cn --force-new-deployment --region us-east-1
    aws ecs update-service --cluster mcp --service mcp-aws-cn-2 --force-new-deployment --region us-east-1
    

Dockerfile.ra 相比普通镜像多了三类东西：aws_signing_helper（Roles Anywhere 官方 credential helper）、jq + awscli（做 AssumeRole 和 JSON 解析）、以及实际取凭证的脚本。

部署完成后，两个 Service 均通过健康检查，日志显示凭证获取成功。看上去一切正常——但约一小时后问题出现了。

## **5\. 踩坑：RequestExpired —— 凭证一小时后全失效**

部署次日，在 Agent 里发”查 aws-cn 的 VPC 列表”，报错：
    
    
    {
    "error": "An error occurred (RequestExpired) when calling the DescribeVpcs operation: Request has expired.",
    "error_code": "RequestExpired"
    }
    

Service 显示 healthy，启动日志也正常 —— 但运行约一小时后，所有 AWS API 调用全。

### 5.1 根因：环境变量注入和后台刷新不兼容

最初的 entrypoint-ra.sh 用的是”环境变量注入 + 后台刷新循环”：
    
    
    # 启动时把凭证塞进环境变量，然后 exec MCP server
    export AWS_ACCESS_KEY_ID=$(echo "$CREDS" | jq -r '.AccessKeyId')
    exec python -m awslabs.aws_api_mcp_server.server
    
    # 后台循环每 55 分钟刷新，写到一个文件
    (while true; do
    sleep 3300
    /app/credential-helper.sh > /tmp/ra-credentials.json
    done) &
    

关键缺陷：通过 exec 启动的进程在启动瞬间即固化了环境变量，运行过程中无法由外部修改。MCP Server 在 exec 执行时已将 AWS_ACCESS_KEY_ID 锁定。后台循环虽将新凭证写入 /tmp/ra-credentials.json，但无任何代码读取该文件。一小时后首个临时凭证过期，Server 仍在使用旧凭证，导致 RequestExpired。日志中的 “Credentials refreshed” 实为无效操作——凭证虽已刷新，但无任何进程读取更新后的值。

该问题在前一版文档中已有标注：”刷新后的凭证写入文件，但进程的环境变量不会自动更新……此优化留待下一版本处理”。这笔技术债未能及时处理，最终在生产环境中引发故障。

### 5.2 修复方案：改用 SDK 原生 credential_process

credential-helper.sh 的输出本来就是标准的 credential_process JSON 格式（Version / AccessKeyId / SecretAccessKey / SessionToken / Expiration）。与其自行实现刷新循环，不如将其注册为 SDK 的 credential_process，由 botocore 自动管理凭证刷新。

entrypoint-ra.sh 修改为：
    
    
    export AWS_CONFIG_FILE=/app/certs/aws-config
    export AWS_PROFILE=ra
    cat > "$AWS_CONFIG_FILE" <<EOF
    [profile ra]
    credential_process = /app/credential-helper.sh
    EOF
    
    # Fail fast：启动前先验证 helper 可正常执行
    if /app/credential-helper.sh > /dev/null 2>&1; then
    echo "[entrypoint-ra] Initial credential fetch OK."
    else
    echo "[entrypoint-ra] FATAL: credential-helper.sh failed." >&2
    exit 1
    fi
    

botocore 在每次 API 调用前检查缓存凭证的 Expiration 字段，当凭证临近过期时自动重新调用 credential_process——惰性刷新，无后台线程。不依赖 sleep 的计时精度，只要进程存活，任何 API 请求均会触发按需刷新。

### 5.3 隐藏的递归陷阱

credential-helper.sh 内部会调用 aws sts assume-role。当该脚本作为 credential_process 被调用时，它继承了 AWS_PROFILE=ra 环境变量，导致内部的 aws CLI 再次解析 ra profile → 再次调用 credential_process → 形成无限递归。

解决方法：在执行内部 aws CLI 命令前，清除相关环境变量：
    
    
    # Recursion guard
    unset AWS_PROFILE AWS_CONFIG_FILE
    

这样内部 assume-role 只使用 aws_signing_helper 显式 export 出来的 Hub 凭证；env 变量优先级高，不会再读 ra profile。

重新构建镜像、推送至 ECR、强制重新部署后，启动日志变为：
    
    
    [entrypoint-ra] credential_process configured (profile=ra); SDK will fetch + auto-refresh.
    [entrypoint-ra] Initial credential fetch OK.
    Starting MCP server 'AWS-API-MCP' with transport 'streamable-http' (stateless)
    

凭证实现按需自动刷新，RequestExpired 问题彻底解决。

这次修复对 Agent Space 完全透明 —— 只改容器内部逻辑，endpoint、Private Connection、MCP Server 注册都不变，无需在 Console 重新配置任何东西。

## **6\. 跨云的现实：阿里云仍然是 AK/SK**

跨云这里要现实一点：Roles Anywhere 只解决 AWS 体系内的问题。阿里云、腾讯云没有完全对等的机制，仍然要走 AK/SK；好在两种模式可以放在同一套 Terraform 结构里并存。

本方案的 accounts map 里两种模式可以并存，通过 auth_mode 字段区分：
    
    
    accounts = {
    # AWS 账号走 Roles Anywhere
    aws-cn = {
    host = "aws-cn.example.cloud"
    auth_mode = "roles_anywhere"
    spoke_role_arn = "arn:aws-cn:iam::<CN_NW_ACCOUNT_ID>:role/mcp-spoke-readonly"
    }
    
    # 尚未迁移的 AWS 测试账号，暂保留 AK/SK
    aws-cn-test = {
    host = "aws-cn-test.example.cloud"
    auth_mode = "ak_sk"
    access_key = "AKIA..."
    secret_key = "..."
    }
    
    # 阿里云永远是 AK/SK
    aliyun-prod = {
    provider = "aliyun"
    host = "aliyun.example.cloud"
    access_key = "LTAI..."
    secret_key = "..."
    }
    }
    

### 6.1 阿里云为什么需要独立镜像

阿里云 MCP（alibaba-cloud-ops-mcp-server）和 AWS MCP（awslabs.aws-api-mcp-server）都依赖 fastmcp，但各自锁定的版本不兼容——将二者安装在同一镜像中会触发 pip依赖冲突，因此阿里云使用独立的 Dockerfile.aliyun 和独立的 ECR 仓库，依赖树分别隔离在各自镜像中，升级互不干扰。

从 DevOps Agent 的视角来看，接入阿里云与接入 AWS 账号是同一类操作——新增一条 MCP Server 注册、一个 host，复用同一条 Private Connection。认证方式的差异完全封装在容器内部。

### 6.2 推荐的迁移顺序

  1. 优先将生产 AWS 账号迁移到 Roles Anywhere（安全收益最大）
  2. 验证稳定后迁移其余 AWS 账号
  3. 阿里云及其他云保持 AK/SK，配合 §8 的轮换流程定期更新密钥



## **7\. 新增账号清单**

AWS 账号（Roles Anywhere），新增账号主要变成配置项：
    
    
    [ ] 在新账号部署 cfn/roles-anywhere-spoke.yaml（一个 ReadOnly Role）
    [ ] 把新 Spoke Role ARN 追加到 Hub 的 SpokeRoleArns 参数，重新 deploy Hub
    [ ] terraform.tfvars 的 accounts 加一个 entry（auth_mode=roles_anywhere + spoke_role_arn）
    [ ] terraform apply
    [ ] DNS 加 CNAME <host>.example.cloud → ALB DNS
    [ ] DevOps Agent Console 加 MCP Server，复用现有 Private Connection
    [ ] 在 chat 里发"查 <host> 的 EC2"验证
    

**注意：**

流程中不再包含”创建 IAM User、生成 AK/SK、存入 Secrets Manager”等步骤。新增账号不会产生任何长期密钥。

阿里云账号（AK/SK）： 额外需要在 Secrets Manager 中创建 /mcp/<host> 并存入 {“AK”:”…”,”SK”:”…”}，其余步骤相同。

## **8\. 成本与取舍**

ECS Fargate 方案，每个账号一个 task（256 CPU / 512 MB）：

项目 | 月费  
---|---  
单个 Fargate task（0.25 vCPU + 0.5 GB） | ~$9  
NAT Gateway | ~$32  
内部 ALB | ~$16  
  
成本主要在 NAT 和 ALB，而非task 本身。每新增一个账号仅增加约 $9/月，相对于 $48 的基础设施固定成本几乎可以忽略。这也解释了本架构选择”每账号一个独立 Task”而非”单一 Task 多账号路由”的原因——额外成本很低，但换来了账号级别的 Blast Radius 隔离（单个 Spoke 凭证泄露不影响其他账号）。

仅当账号数达到 10 个以上、且每个 Task 的固定开销开始累积时，才值得考虑”单 Task 内动态 AssumeRole 切换账号”的合并方案——但该方案需要修改应用代码，且会牺牲隔离性。

## **9\. 对比总结**

维度 | AK/SK（旧） | Roles Anywhere（本文）  
---|---|---  
密钥类型 | 永久 AK/SK | X.509 cert → STS 临时凭证  
泄露影响 | 永久有效直到手动轮换 | 临时凭证约 1h；证书泄露可通过吊销快速断开  
多账号凭证数 | N 对 AK/SK | 1 张 cert（Hub AssumeRole 扇出）  
轮换频率 | 每 90 天 / 对 | 证书 1 年一次，临时凭证 SDK 自动刷新  
审计追溯 | CloudTrail 看 AccessKeyId | CloudTrail 看 SourceIdentity（cert CN）  
紧急断连 | 改 SM + 重部署（5-10min） | 禁用 Trust Anchor（秒级）  
加账号成本 | 创建 IAM User + 存 AK/SK | 部署 Spoke CFN（1 个 Role）  
跨云适用 | 通用 | 仅 AWS；阿里云等仍用 AK/SK  
  
一句话总结：IAM Roles Anywhere 以”前期一次性部署复杂度”换取”长期运维安全性与可扩展性”。2–3 个账号时 AK/SK 方案尚可接受，但一旦预期账号数将持续增长，或存在合规审计要求，尽早切换到 Hub-Spoke 架构可获得更高的长期收益。

**下一步行动：**

**相关产品：**

  * [Amazon IAM](<https://aws.amazon.com/cn/iam/?p=bl_pr_iam_l=1>) — 身份管理和访问权限
  * [Amazon ECS](<https://aws.amazon.com/cn/ecs/?p=bl_pr_ecs_l=2>) — 完全托管的容器编排服务
  * [Amazon DevOps Agent](<https://aws.amazon.com/cn/devops-agent/?p=bl_pr_devops-agent_l=3>) — 解决和预防事故的代理
  * [Amazon Secrets Manager](<https://aws.amazon.com/cn/secrets-manager/?p=bl_pr_secrets-manager_l=4>) — 密钥管理
  * [Amazon Fargate](<https://aws.amazon.com/cn/fargate/?p=bl_pr_fargate_l=5>) — 适用于容器的无服务器计算



**系列文章：**

  * [AWS DevOps Agent 接入 AWS 中国区（一）：Partition 隔离与 MCP 单账号桥接](<https://aws.amazon.com/cn/blogs/china/aws-devops-agent-access-aws-partition-mcp/?p=bl_ar_l=1>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 陈映初

亚马逊云科技解决方案架构师，专注于 Agentic AI 与生成式 AI 应用在 AWS 上的架构设计与落地实践。拥有 12 年以上软件研发经验，精通前后端全栈开发，兼具 DevOps 实战经验。Apache DevLake（ASF 顶级项目）PMC 成员。

### 邓文杰

亚马逊云科技客户解决方案经理，Edge TFC成员，在亚马逊云科技主要支持游戏和零售等行业的用户。专注于促进亚马逊云科技用户解决方案落地，提升上云体验，帮助用户实现自身的业务价值。

### 李一鸣

现任亚马逊云科技（AWS）客户解决方案经理（Customer Solutions Manager），常驻中国上海。凭借多年深耕医疗健康与生命科学（HCLS）及零售行业的丰富经验，他长期为客户提供专业咨询，协助其加速云价值实现、最大化人工智能投资回报。他致力于帮助各类组织成功采用并规模化应用人工智能，切实推动可衡量的业务成果落地。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---

