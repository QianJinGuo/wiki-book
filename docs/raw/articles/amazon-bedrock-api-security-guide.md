---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/amazon-bedrock-model-api-invocation-security-guide/
tags: [aws-china-blog, agentic-ai, context-engineering]
title: "别让你的 Amazon Bedrock 模型为他人打工——API 调用安全防护指南"
created: 2026-05-14
updated: 2026-05-14
review_value: 8
review_confidence: 9
review_recommendation: neutral
ingested: 2026-05-16
review_stars: 4
sha256: 790c23bd12dfcf8e46c1d732db8a3a379511430e6edd5bfc1b167745e4837e10
---
# 别让你的 Amazon Bedrock 模型为他人”打工”——API 调用安全防护指南
摘要：本文针对 Amazon Bedrock 模型调用面临的凭证泄露风险，从三个层面提供安全防护指南：凭证管理（IAM Role、AssumeRole 分层授权、避免硬编码）、访问控制（IP 限制、VPC Endpoint、SCP 组织级管控）、持续监控（Budgets 费用告警、CloudWatch 指标、CloudTrail 日志审计），帮助客户构建纵深防御体系，防止未授权调用导致的异常费用。
**目录**
01 一、引言
02 二、理解风险面：为什么 Bedrock 需要额外关注
03 三、凭证管理：从源头减少暴露面
04 四、访问控制：限制谁能调用、从哪里调用、调用什么
05 五、监控与告警：建立异常感知能力
06 六、快速自查清单
07 七、总结
08 八、附录
* * *
## **一、引言**
随着生成式 AI 技术的快速普及，越来越多的企业将 [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/>) 作为调用基础模型（Foundation Model）的核心基础设施。从智能客服到代码生成，从内容创作到数据分析，Bedrock 正在企业的各个业务环节中发挥着不可替代的作用。
然而，与传统 AWS 服务相比，Bedrock 的使用模式带来了一些独特的安全挑战。Foundation Model 的调用具有无需预置资源、调用即产生费用、高频场景下费用累积极快的特性——这意味着一旦访问凭证管理不当，可能在极短时间内产生远超预期的费用。
本文旨在帮助 AWS 客户系统性地审视自身 Bedrock 工作负载的安全态势，并提供一套从凭证管理、访问控制到持续监控的完整防护方案，帮助您在享受生成式 AI 能力的同时，最大程度降低安全风险。
## **二、理解风险面：为什么 Bedrock 需要额外关注**
在设计安全策略之前，我们需要先理解 Amazon Bedrock 与传统 AWS 服务在风险特征上的关键差异。
### 2.1 与传统服务的对比
维度 | 传统服务（如 EC2/S3） | Amazon Bedrock  
---|---|---  
资源上限 | 受 Service Quota、实例数量限制 | 按请求计费，默认 Quota 较高  
费用累积速度 | 通常按小时/GB 渐进增长 | 高频调用可在数小时内产生巨额费用  
攻击者获利方式 | 非法占用计算资源变现、数据勒索/转售 | 转售大模型调用能力，或免费使用高价模型服务  
异常识别难度 | 攻击产生明显特征（如异常实例类型、CPU 飙升），易与正常行为区分 | 恶意调用与正常业务调用形态相同，缺乏明显区分特征  
### 2.2 为什么攻击者盯上了你的 Bedrock 凭证
当前，Foundation Model 服务具有很高的商业价值，这为凭证窃取者创造了清晰的获利动机：获取他人的 AWS 凭证后，通过 API 调用大模型能力，再将输出转售或用于自身业务。与传统的凭证滥用场景不同，这种模式不需要创建任何 AWS 资源，只需发起 API 请求即可产生价值——攻击者无需部署基础设施、无需维护运行环境，获利路径更短、行为更轻量。同时，由于恶意调用与正常业务调用在形态上完全一致，缺乏明显的异常特征，使其更难被及时识别。
此外，由于 Bedrock 调用不需要预置资源，从凭证泄露到产生大额费用的窗口期可能极短——几小时内就可能累积数万甚至数十万美元的费用。这使得传统的”月度账单审查”方式远远不够及时。
## **三、凭证管理：从源头减少暴露面**
凭证管理是整个安全防护体系的根基。绝大多数未授权访问事件都源于凭证的不当管理或意外暴露。
### 3.1 优先使用 IAM Role 与临时凭证
这是最重要的一条建议。 长期 Access Key（AK/SK）是静态凭证，一旦泄露，在被发现和吊销之前，攻击者可以持续使用。相比之下，通过 IAM Role 获取的临时凭证（由 AWS STS 签发）具有自动过期机制，即使被截获，其有效窗口也非常有限。
**推荐做法**
1\. AWS 计算资源内调用：
  * EC2：使用 Instance Profile，通过实例元数据服务（IMDS）自动获取临时凭证。
  * ECS：使用 Task Role，通过 ECS container credential provider 自动获取临时凭证。
  * Lambda：使用 Execution Role，运行时自动注入临时凭证。
2\. 通过 SDK 从外部环境调用——使用 `sts:AssumeRole` 分层授权模式：
许多开发者习惯直接将具有 Bedrock 权限的长期 AK/SK 配置在应用中，这意味着凭证一旦泄露，攻击者立即拥有完整的模型调用能力。更安全的做法是采用分层授权模式：将”身份认证”和”业务权限”分离到两个不同的 Role 中。
架构设计
  * 初始 Role/User（仅用于身份认证）：只授予 `sts:AssumeRole` 权限，不授予任何 Bedrock 业务权限。
  * 目标 Role（承载业务权限）：配置实际的 Bedrock 调用权限，并通过信任策略（Trust Policy）严格限制谁可以 Assume 该 Role。
初始 IAM User 的权限策略（仅允许 AssumeRole）
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "OnlyAllowAssumeBedrockRole",
                "Effect": "Allow",
                "Action": "sts:AssumeRole",
                "Resource": "arn:aws:iam::123456789012:role/BedrockAccessRole"
            }
        ]
    }
目标 Role（BedrockAccessRole）的信任策略： 信任策略定义了”谁可以 Assume 这个 Role”。通过添加 `aws:SourceIp` 条件，即使初始凭证泄露，攻击者也必须从指定的企业 IP 段发起 AssumeRole 请求才能获取临时凭证，否则请求会被直接拒绝。
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "AllowAssumeWithConditions",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "arn:aws:iam::123456789012:user/dev-user"
                },
                "Action": "sts:AssumeRole",
                "Condition": {
                    "IpAddress": {
                        "aws:SourceIp": "xxx.xx.xx.xx/xx"
                    }
                }
            }
        ]
    }
目标 Role 的权限策略（实际 Bedrock 访问权限）： 权限策略定义了”这个 Role 能做什么”。这里仅授予特定模型的调用权限，并再次通过 `aws:SourceIp` 限制实际发起 Bedrock 调用时的来源 IP，与信任策略形成双重防线。
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "AllowBedrockInvoke",
                "Effect": "Allow",
                "Action": [
                    "bedrock:InvokeModel",
                    "bedrock:InvokeModelWithResponseStream"
                ],
                "Resource": [
                    " arn:aws:bedrock:<region>::foundation-model/<model-id>"
                ],
                "Condition": {
                    "IpAddress": {
                        "aws:SourceIp": "xxx.xx.xx.xx/xx"
                    }
                }
            }
        ]
    }
**注意：**
这里在权限策略中再次添加 `aws:SourceIp` 限制，与信任策略中的 IP 条件形成双重防线。即使临时凭证被中途截获并传递给第三方，对方也无法从非授权 IP 发起 Bedrock 调用。
这种模式的安全收益：
  * 凭证泄露不等于权限泄露：即使初始 AK/SK 被窃取，攻击者无法直接调用 Bedrock，还必须成功 AssumeRole。
  * 信任策略提供第二道防线：可在信任策略中设置 IP 限制、时间条件等，攻击者即使拿到凭证也无法从非授权环境 AssumeRole。
  * 临时凭证自动过期：AssumeRole 返回的临时凭证有时效限制（默认 1 小时，最长可配置），进一步收窄攻击窗口。
  * 审计能力增强：CloudTrail 会分别记录 AssumeRole 事件和后续的 InvokeModel 事件，安全团队可以更清晰地还原调用链路。
### 3.2 对长期凭证的管控
如果业务场景确实需要使用长期 AK/SK（例如某些传统应用无法改造），请确保以下控制措施到位：
  * 定期轮换：为 Access Key 建立定期轮换机制，避免同一凭证长期有效。
  * 集中化存储：使用 [AWS Secrets Manager](<https://aws.amazon.com/cn/secrets-manager/>) 存储和管理 Access Key，而非硬编码在配置文件中。结合自定义轮换 Lambda 函数，可实现 Access Key 的自动化轮换。
  * 最小化数量：定期审计 IAM User，识别并清理未使用或过期的 Access Key。建议每个 IAM User 仅保留一个活跃的 Access Key（AWS 允许最多 2 个，第二个仅在轮换过渡期间短暂使用）。
### 3.3 代码层面的防护
凭证硬编码在源代码中是最常见也最危险的暴露途径。正确的做法是让代码中完全不出现凭证，而非事后扫描和补救。
**利用 AWS SDK Credential Provider Chain**
AWS SDK 内置了一套凭证解析链（Credential Provider Chain），会按照固定顺序自动查找可用凭证，开发者无需在代码中显式传入 AK/SK：
  1. 环境变量：`AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`AWS_SESSION_TOKEN`
  2. 共享凭证文件：`~/.aws/credentials`（本地开发环境使用，不提交到代码仓库）
  3. IAM Role：EC2 Instance Profile / ECS Task Role / Lambda Execution Role（生产环境推荐）
    # 正确做法：不传入任何凭证，SDK 自动从环境中获取
    import boto3
    client = boto3.client('bedrock-runtime', region_name='us-east-1')
    response = client.invoke_model(
        modelId='<model-id>',
        body=payload
    )
    # 错误做法：将凭证硬编码在代码中
    import boto3
    client = boto3.client(
        'bedrock-runtime',
        aws_access_key_id='AKIAIOSFODNN7EXAMPLE',      # 不要这样做
        aws_secret_access_key='wJalrXUtnFEMI/K7MDENG/...', # 不要这样做
        region_name='us-east-1'
    )
**关键原则**
  * 开发环境：通过环境变量或 `~/.aws/credentials` 配置凭证，代码本身不包含任何凭证信息。
  * 生产环境：使用 IAM Role，SDK 自动通过元数据服务或凭证提供程序获取临时凭证，无需任何配置。
  * 配置文件管理：将 `.aws/`、`.env` 等包含凭证的文件加入 `.gitignore`，从根本上防止意外提交。
## **四、访问控制：限制谁能调用、从哪里调用、调用什么**
即使凭证管理做到位，纵深防御（Defense in Depth）原则要求我们在访问控制层面增加额外的限制。当凭证意外泄露时，这些控制措施可以显著缩小攻击面。
### 4.1 IAM Policy 精细化
避免使用 `bedrock:*` 这样过于宽泛的权限。根据最小权限原则，精确限定可调用的模型和操作：
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "AllowSpecificBedrockModels",
                "Effect": "Allow",
                "Action": [
                    "bedrock:InvokeModel",
                    "bedrock:InvokeModelWithResponseStream"
                ],
                "Resource": [
                    "arn:aws:bedrock:<region>::foundation-model/<model-id>"
                ]
            }
        ]
    }
**关键限制维度**
  * 模型范围：只授权业务实际需要的模型，避免授权所有模型。
  * 操作范围：仅授予必要的操作权限。
  * Region 限制：如果业务只在特定 Region 使用 Bedrock，通过 Resource ARN 中的 Region 字段限制。
### 4.2 网络来源限制
限制 API 调用的来源网络是防止凭证泄露后被外部利用的最直接手段：
**方式一：IAM Policy 中使用 IP Condition**
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "AllowBedrockFromAuthorizedIPsOnly",
                "Effect": "Allow",
                "Action": [
                    "bedrock:InvokeModel",
                    "bedrock:InvokeModelWithResponseStream"
                ],
                "Resource": [
                    "arn:aws:bedrock:<region>::foundation-model/<model-id>"
                ],
                "Condition": {
                    "IpAddress": {
                        "aws:SourceIp": [
                            "xxx.xx.xx.xx/24",
                            "xxx.xx.xx.xx/16"
                        ]
                    }
                }
            }
        ]
    }
通过在 Allow 策略中直接附加 IP 条件，即使凭证泄露，攻击者从非企业网络发起的调用也不会获得授权。
**方式二：通过 VPC Endpoint 调用**
对于运行在 VPC 内的工作负载，建议通过 VPC Endpoint 访问 Bedrock，而非通过公网：
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "AllowBedrockOnlyViaVPCE",
                "Effect": "Allow",
                "Action": [
                    "bedrock:InvokeModel",
                    "bedrock:InvokeModelWithResponseStream"
                ],
                "Resource": [
                    "arn:aws:bedrock:<region>::foundation-model/<model-id>"
                ],
                "Condition": {
                    "StringEquals": {
                        "aws:SourceVpce": "vpce-0123456789abcdef0"
                    }
                }
            }
        ]
    }
此策略确保只有通过指定 VPC Endpoint 发起的请求才会被授权调用 Bedrock，流量不经过公网，从网络路径上杜绝了外部未授权访问的可能性。同时，可在 VPC Endpoint 上配置 Endpoint Policy，进一步限制通过该 Endpoint 可访问的模型和操作。
### 4.3 组织级管控：Service Control Policy (SCP)
对于使用 AWS Organizations 的企业，SCP 提供了跨所有成员账户的统一管控能力：
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "EnforceBedrockVPCEndpoint",
                "Effect": "Deny",
                "Action": [
                    "bedrock:InvokeModel",
                    "bedrock:InvokeModelWithResponseStream",
                    "bedrock:Converse",
                    "bedrock:ConverseStream"
                ],
                "Resource": "*",
                "Condition": {
                    "StringNotEqualsIfExists": {
                        "aws:SourceVpce": [
                            "vpce-0123456789abcdef0",
                            "vpce-0fedcba9876543210"
                        ]
                    }
                }
            }
        ]
    }
SCP 的核心价值在于提供组织级别的强制护栏——无论成员账户内的 IAM Policy 如何配置，SCP 的 Deny 都无法被绕过。企业可根据自身安全要求，通过 SCP 集中管控 Bedrock 的网络访问路径、可用模型范围、调用来源等维度，确保所有账户遵循统一的安全基线。
## **五、监控与告警：建立异常感知能力**
安全防护不能只依赖预防。完善的监控体系确保即使防线被突破，您也能在第一时间发现并响应。
### 5.1 费用维度的监控
**AWS Budgets**
为 Bedrock 服务设置独立的预算监控，根据业务实际用量设定合理的告警阈值。当费用超出预期时，通过 SNS 通知安全团队介入；同时可配置 Budget Actions 自动执行预定义操作（如应用限制性 IAM Policy、应用 SCP），减少损失扩大。
需要注意的是，AWS 费用数据并非实时更新，从费用产生到反映在 Budgets 中可能存在数小时的延迟。因此 Budgets 更适合作为兜底防线，而非第一道告警。对于需要更快响应的场景，建议结合下文的 CloudWatch 指标监控（接近实时）共同使用。
### 5.2 调用维度的监控
**CloudWatch 指标监控**
Amazon Bedrock 会自动发布调用相关的 CloudWatch 指标。建议对以下指标设置告警：
  * `Invocations`：调用次数的突增
  * `InputTokenCount / OutputTokenCount`：Token 消耗量的异常变化
配置 CloudWatch Alarm，当指标超过基线的 N 倍标准差时触发告警。
**CloudTrail 日志分析**
CloudTrail 记录了 Bedrock API 调用的关键元数据，通过查询以下字段可以快速定位异常行为：
  * `sourceIPAddress`：识别非企业 IP 段的调用来源
  * `userIdentity.accessKeyId`：定位发起调用的具体凭证
  * `userAgent`：识别异常的客户端标识
  * `eventTime`：发现非工作时段的异常调用
将 CloudTrail 日志通过 [Amazon Athena](<https://aws.amazon.com/cn/athena/>) 进行查询，可以按 IP、凭证、时间段等维度聚合分析，快速还原异常调用的完整链路。
## **六、快速自查清单**
使用以下清单评估您当前 Bedrock 工作负载的安全态势：
### 6.1 凭证管理
  * 调用 Bedrock 的工作负载是否已尽可能使用 IAM Role（而非长期 AK/SK）？
  * 仍在使用的长期 Access Key 是否有轮换策略？
  * 代码中是否避免了硬编码凭证，通过 SDK Credential Provider Chain 自动获取？
  * 是否定期审计 IAM User 并清理未使用的 Access Key？
### 6.2 访问控制
  * Bedrock 相关 IAM Policy 是否限制了具体的模型和 Region？
  * 是否配置了 IP 来源或 VPC Endpoint 条件限制？
  * 是否在组织层面通过 SCP 实施了统一的 Bedrock 访问管控？
### 6.3 监控告警
  * 是否为 Bedrock 配置了每日费用告警？
  * 是否启用了 CloudTrail 对 Bedrock Runtime API 的日志记录？
  * 是否有定期审计 CloudTrail 日志中异常调用模式的机制？
如果以上任何一项回答为”否”，建议立即制定计划进行加固。
## **七、总结**
本文围绕 Amazon Bedrock 模型调用的安全防护，介绍了三个层面的措施：
  1. 凭证管理——尽可能消除长期凭证，采用 IAM Role 和 AssumeRole 分层模式，从源头降低泄露风险。
  2. 访问控制——通过 IP 限制、VPC Endpoint、SCP 等手段，即使凭证泄露也能阻止未授权调用。
  3. 持续监控——通过 Budgets 和 CloudWatch 指标设置告警，结合 CloudTrail 日志审计，及时发现并响应异常。
安全防护的投入远低于事后补救的成本。我们建议对照前文的自查清单逐项排查，识别当前防护中的薄弱环节并优先加固，让生成式 AI 在安全的框架下持续为业务创造价值。
**下一步行动：**
**相关产品：**
  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=1>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon IAM](<https://aws.amazon.com/cn/iam/?p=bl_pr_iam_l=2>) — 身份管理和访问权限
  * [Amazon VPC](<https://aws.amazon.com/cn/vpc/?p=bl_pr_vpc_l=3>) — 隔离云网络
  * [Amazon CloudTrail](<https://aws.amazon.com/cn/cloudtrail/?p=bl_pr_cloudtrail_l=4>) — 审计跟踪
  * [Amazon CloudWatch](<https://aws.amazon.com/cn/cloudwatch/?p=bl_pr_cloudwatch_l=5>) — 可观测性工具
**更多文章：**
  * [Amazon Bedrock 护栏通过集中控制和管理支持跨账户防护](<https://aws.amazon.com/cn/blogs/china/amazon-bedrock-guardrails-supports-cross-account-safeguards-with-centralized-control-and-management/?p=bl_ar_l=1>)
  * [以 Kiro 快速部署云上 Agent：只需几个小时，从业务需求到部署于 Amazon Bedrock Agentcore 落地](<https://aws.amazon.com/cn/blogs/china/kiro-quick-deploy-agent-deploy-amazon-bedrock-agentcore/?p=bl_ar_l=2>)
  * [一种基于 Web 访问的 Kiro CLI 共享访问实现](<https://aws.amazon.com/cn/blogs/china/based-on-web-kiro-cli-share-implement/?p=bl_ar_l=3>)
## **八、附录**
  * [IAM Policies for Amazon Bedrock](<https://docs.aws.amazon.com/bedrock/latest/userguide/security-iam.html>)
  * [AWS CloudTrail Logging for Bedrock](<https://docs.aws.amazon.com/bedrock/latest/userguide/logging-using-cloudtrail.html>)
  * [VPC Endpoint for Amazon Bedrock](<https://docs.aws.amazon.com/bedrock/latest/userguide/vpc-interface-endpoints.html>)
  * [AWS Budgets](<https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html>)
*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。
## 本篇作者
### 卢皓宇
亚马逊云科技解决方案架构师，负责基于亚马逊云科技的云计算方案架构的设计和技术咨询，同时致力于亚马逊云科技在开发者和学生群体中的应用与推广，在无服务器领域有丰富经验。
* * *
## AWS 架构师中心：云端创新的引领者
探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---