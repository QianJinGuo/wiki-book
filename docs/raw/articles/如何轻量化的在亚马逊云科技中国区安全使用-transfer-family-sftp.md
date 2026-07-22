---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/how-to-security-using-transfer-family-sftp
ingested: 2026-07-06
feed_name: AWS China Blog
source_published: 2026-07-06
sha256: "97091686fdbfd1a1bd70e93c3dc8dc89de8d35f43579a62b40194bc34d917e87"
---

# 如何轻量化的在亚马逊云科技中国区安全使用 Transfer Family SFTP

摘要：在没有 Active Directory、没有自建 IDP，且中国区缺少 Cognito User Pool 的约束下，利用 AWS Transfer Family Custom Identity Provider、Secrets Manager 自动轮换密码和 IAM Roles Anywhere 证书认证，构建一套轻量化的且无长期凭据的安全 SFTP 文件传输方案。

**目录**

01 一、背景与挑战

02 二、方案架构

03 三、核心设计决策

04 四、前提条件

05 五、实施步骤

06 六、端到端验证

07 七、安全分析

08 八、成本估算

09 九、生产化建议

10 十、总结

* * *

## **一、背景与挑战**

SFTP（SSH File Transfer Protocol）是企业间文件交换的常用协议。许多组织需要通过 SFTP 与合作伙伴、供应商进行安全的数据传输。[AWS Transfer Family](<https://www.amazonaws.cn/transfer-family/>) 提供了全托管的 SFTP 服务器，但在实际落地过程中，我们经常会遇到一些约束：

  1. 没有 Active Directory：没有 AD 或 AD不由自己掌控，并且觉得单独为SFTP构建AD过重，排除了 Transfer Family 原生的 AD 集成方案。
  2. 没有自建 IDP：企业也没有 Okta、Entra ID 等第三方身份提供者。
  3. 中国区没有 Cognito User Pool：在海外区可以用 Cognito User Pool 做 M2M（client_credentials）Token 认证，但中国区只有 Cognito Identity Pool，无法签发 OAuth Token。
  4. 不想用固定凭据：传统的固定用户名+密码方案在程序对程序（M2M）场景下安全性不足，一旦泄露无法自动失效。
  5. 程序走公网访问：客户端程序部署在公网环境，需要通过 Internet 连接 SFTP 和 AWS API。



面对这些约束，本文介绍一套在中国区完全可落地的轻量化方案，通过三项服务的组合，最大程度保障 SFTP 的安全访问。

## **二、方案架构**
    
    
    程序（公网部署）
     │  持有：X.509 客户端证书 + 私钥（唯一长期凭据）
     │
     │ ① X.509 证书 → IAM Roles Anywhere
     ▼
    IAM Roles Anywhere（Trust Anchor = 自签 CA）
     │  返回：短时 AWS 临时凭据（AccessKey/Secret/SessionToken，1小时过期）
     │
     │ ② 临时凭据 → Secrets Manager
     ▼
    Secrets Manager（KMS 加密，每 4 小时自动轮换）
     │  返回：当前有效的 SFTP 密码
     │
     │ ③ 用户名 + 密码 → SFTP
     ▼
    Transfer Family SFTP Server
     │  VPC Internet-Facing 端点 + Elastic IP（固定公网 IP 用于白名单）
     │  安全组：仅允许客户端出口 IP 的 22 端口
     │  身份提供者：Custom Identity Provider（Lambda）
     │      - 校验密码（同时接受 AWSCURRENT 和 AWSPREVIOUS 版本）
     │      - 校验客户端源 IP
     │      - 返回 IAM 角色 + S3 逻辑目录映射
     ▼
    Amazon S3（后端存储，KMS 加密）
    

**核心组件**

组件 | 用途  
---|---  
Transfer Family | 全托管 SFTP 服务器  
Custom Identity Provider (Lambda) | 自定义身份认证与授权  
Secrets Manager | 存储 SFTP 密码，自动轮换  
IAM Roles Anywhere | X.509 证书换取临时 AWS 凭据  
Amazon EventBridge | 定时触发密码轮换  
KMS | 加密 Secret 和 S3 数据  
  
## **三、核心设计决策**

问题 | 决策 | 原因  
---|---|---  
中国区无 Cognito User Pool | 用 Secrets Manager 存密码 + Lambda 校验 | 不依赖任何外部身份服务  
不想要固定凭据 | Secrets Manager 自动轮换密码 | 密码持续变化，泄露窗口小  
程序侧不放长期 AWS 密钥 | IAM Roles Anywhere + X.509 证书 | 证书可短有效期+吊销，比 AccessKey 更安全  
轮换切换瞬间不能断连 | Lambda 同时校验 AWSCURRENT + AWSPREVIOUS | 覆盖新旧密码过渡期  
合作伙伴要固定 IP 白名单 | VPC Internet-Facing 端点 + EIP | 提供稳定的公网 IP  
多层纵深防御 | 安全组限源 IP + Lambda 限源 IP + KMS 加密 | 任何单点泄露不足以获取数据  
  
## **四、前提条件**

  1. 亚马逊云科技中国区账号（cn-north-1 或 cn-northwest-1）
  2. AWS CLI 已配置中国区 profile，本文中的profile为china
  3. Python 3.10+（测试用）
  4. OpenSSL（生成 CA 和客户端证书）
  5. Default VPC 可用（或自建 VPC）



## **五、实施步骤**

### 5.1 第一步：创建基础资源

S3 桶（SFTP 后端存储）：
    
    
    aws s3api create-bucket \
      --bucket sftp-poc- \
      --create-bucket-configuration LocationConstraint=cn-north-1 \
      --profile china --region cn-north-1
    
    aws s3api put-public-access-block \
      --bucket sftp-poc- \
      --public-access-block-configuration \
      BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true \
      --profile china --region cn-north-1
    

KMS CMK（加密 Secret）：
    
    
    aws kms create-key \
      --description "SFTP POC - Secrets Manager encryption" \
      --profile china --region cn-north-1
    
    aws kms create-alias \
      --alias-name alias/sftp-secret-key \
      --target-key-id  \
      --profile china --region cn-north-1
    

### 5.2 第二步：创建 IAM 角色

Transfer Family 服务在用户登录后需要代入一个 IAM 角色来访问 S3：
    
    
    {
      "Version": "2012-10-17",
      "Statement": [{
        "Effect": "Allow",
        "Principal": {"Service": "transfer.amazonaws.com"},
        "Action": "sts:AssumeRole"
      }]
    }
    

权限策略（最小权限，限定到具体桶）：
    
    
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": ["s3:ListBucket", "s3:GetBucketLocation"],
          "Resource": "arn:aws-cn:s3:::sftp-poc-"
        },
        {
          "Effect": "Allow",
          "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
          "Resource": "arn:aws-cn:s3:::sftp-poc-/*"
        }
      ]
    }
    

### 5.3 第三步：创建 Secret 并配置初始密码
    
    
    aws secretsmanager create-secret \
      --name sftp/prod/app1 \
      --kms-key-id alias/sftp-secret-key \
      --secret-string '{"Password":""}' \
      --profile china --region cn-north-1
    

### 5.4 第四步：创建自定义 IdP Lambda

这是整个方案的核心——自定义身份提供者，负责校验密码和源 IP。
    
    
    import json
    import os
    import hmac
    import boto3
    
    sm = boto3.client("secretsmanager")
    
    SECRET_ID = os.environ["SECRET_ID"]
    ROLE_ARN = os.environ["ROLE_ARN"]
    HOME_BUCKET = os.environ["HOME_BUCKET"]
    ALLOWED_IPS = os.environ.get("ALLOWED_IPS", "").split(",")
    
    DENY = {}
    
    def _get_pw(stage):
        try:
            r = sm.get_secret_value(SecretId=SECRET_ID, VersionStage=stage)
            return json.loads(r["SecretString"]).get("Password", "")
        except Exception:
            return ""
    
    def handler(event, context):
        # 日志（不记录密码）
        print(json.dumps({
            "username": event.get("username"),
            "protocol": event.get("protocol"),
            "sourceIp": event.get("sourceIp")
        }))
    
        if event.get("protocol") != "SFTP":
            return DENY
    
        # 源 IP 白名单校验
        src = event.get("sourceIp", "")
        if ALLOWED_IPS and ALLOWED_IPS[0] and src not in ALLOWED_IPS:
            return DENY
    
        # 强制密码登录
        presented = event.get("password", "")
        if not presented:
            return DENY
    
        # 同时接受当前和上一版本密码（覆盖轮换过渡期）
        for stage in ("AWSCURRENT", "AWSPREVIOUS"):
            valid = _get_pw(stage)
            if valid and hmac.compare_digest(presented, valid):
                return {
                    "Role": ROLE_ARN,
                    "HomeDirectoryType": "LOGICAL",
                    "HomeDirectoryDetails": json.dumps([
                        {"Entry": "/", "Target": f"/{HOME_BUCKET}/users/{event['username']}"}
                    ]),
                }
    
        return DENY
    

**关键设计点：**

  * 使用 `hmac.compare_digest` 进行恒定时间比较，防止时序攻击
  * 同时校验 `AWSCURRENT` 和 `AWSPREVIOUS`，确保密码轮换时不会中断服务
  * 返回空对象 `{}` 表示拒绝登录
  * 通过逻辑目录映射实现用户隔离，每个用户只能访问自己的目录



### 5.5 第五步：创建 Transfer Family SFTP Server

创建 VPC Internet-Facing 端点的 SFTP 服务器：
    
    
    # 1. 创建安全组（仅允许客户端 IP 访问 22 端口）
    aws ec2 create-security-group \
      --group-name sftp-sg \
      --description "SFTP - allow client IP only" \
      --vpc-id  \
      --profile china --region cn-north-1
    
    aws ec2 authorize-security-group-ingress \
      --group-id  \
      --ip-permissions '[{"IpProtocol":"tcp","FromPort":22,"ToPort":22,
        "IpRanges":[{"CidrIp":"/32"}]}]' \
      --profile china --region cn-north-1
    
    # 2. 分配 EIP（每个子网一个）
    aws ec2 allocate-address --domain vpc --profile china --region cn-north-1
    
    # 3. 创建 SFTP Server（先不带 EIP）
    aws transfer create-server \
      --endpoint-type VPC \
      --endpoint-details '{"SubnetIds":["",""],
        "VpcId":"","SecurityGroupIds":[""]}' \
      --identity-provider-type AWS_LAMBDA \
      --identity-provider-details '{"Function":"",
        "SftpAuthenticationMethods":"PASSWORD"}' \
      --protocols '["SFTP"]' \
      --profile china --region cn-north-1
    
    # 4. 停止 → 挂载 EIP → 启动（EIP 只能在 OFFLINE 状态挂载）
    aws transfer stop-server --server-id  ...
    aws transfer update-server --server-id  \
      --endpoint-details '{"AddressAllocationIds":["",""],
        "SubnetIds":["",""]}' ...
    aws transfer start-server --server-id  ...
    

### 5.6 第六步：配置密码自动轮换

通过 EventBridge + Lambda 实现每 4 小时自动轮换密码：

**5.6.1 密码轮换 Lambda 代码：**
    
    
    import json
    import secrets
    import string
    import boto3
    
    sm = boto3.client("secretsmanager")
    SECRET_ID = "sftp/prod/app1"
    
    def handler(event, context):
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        new_pw = "".join(secrets.choice(alphabet) for _ in range(32))
        sm.put_secret_value(
            SecretId=SECRET_ID,
            SecretString=json.dumps({"Password": new_pw})
        )
        print(f"Rotated password for {SECRET_ID}")
        return {"statusCode": 200}
    

**5.6.2 EventBridge 规则：**
    
    
    aws events put-rule \
      --name sftp-rotate-every-4h \
      --schedule-expression "rate(4 hours)" \
      --profile china --region cn-north-1
    

为什么用 EventBridge + PutSecretValue 而不是 Secrets Manager 原生轮换？   
原生轮换需要实现 4 步 Lambda（createSecret/setSecret/testSecret/finishSecret），对于”密码唯一真相源就是 Secret 本身”的场景过于复杂。直接 PutSecretValue 写新密码时，Secrets Manager 会自动将原 AWSCURRENT 降级为 AWSPREVIOUS，天然支持过渡期。 

### 5.7 第七步：配置 [IAM Roles Anywhere](<https://docs.aws.amazon.com/rolesanywhere/latest/userguide/introduction.html>)

这一步让程序侧彻底不存放长期 AWS AccessKey，改用 X.509 证书换取短时凭据。

**5.7.1 生成 CA 和客户端证书：**
    
    
    # CA（必须包含完整 v3 扩展，Roles Anywhere 验证严格）
    cat > ca.cnf  client_ext.cnf 注册 Trust Anchor 和 Profile：
    
    __CODE_START__
    # 注册 CA 为 Trust Anchor
    aws rolesanywhere create-trust-anchor \
      --name sftp-ca \
      --source '{"sourceType":"CERTIFICATE_BUNDLE",
        "sourceData":{"x509CertificateData":""}}' \
      --profile china --region cn-north-1
    
    aws rolesanywhere enable-trust-anchor --trust-anchor-id  ...
    
    # 创建角色（信任 rolesanywhere 服务，限定 Trust Anchor）
    # 权限：仅允许 GetSecretValue + KMS Decrypt
    
    # 创建 Profile
    aws rolesanywhere create-profile \
      --name sftp-profile \
      --role-arns '["arn:aws-cn:iam:::role/sftp-secrets-reader-role"]' \
      --duration-seconds 3600 \
      --profile china --region cn-north-1
    
    aws rolesanywhere enable-profile --profile-id  ...
    

**5.7.2 注册 Trust Anchor 和 Profile：**
    
    
    # 注册 CA 为 Trust Anchor
    aws rolesanywhere create-trust-anchor \
      --name sftp-ca \
      --source '{"sourceType":"CERTIFICATE_BUNDLE",
        "sourceData":{"x509CertificateData":"<CA-CERT-PEM>"}}' \
      --profile china --region cn-north-1
    
    aws rolesanywhere enable-trust-anchor --trust-anchor-id <ID> ...
    
    # 创建角色（信任 rolesanywhere 服务，限定 Trust Anchor）
    # 权限：仅允许 GetSecretValue + KMS Decrypt
    
    # 创建 Profile
    aws rolesanywhere create-profile \
      --name sftp-profile \
      --role-arns '["arn:aws-cn:iam::<ACCOUNT>:role/sftp-secrets-reader-role"]' \
      --duration-seconds 3600 \
      --profile china --region cn-north-1
    
    aws rolesanywhere enable-profile --profile-id <ID> ...

`aws_signing_helper` 工具可从 [官方](<https://rolesanywhere.amazonaws.com/releases/>) 下载

## **六、端到端验证**

完整测试程序验证整个链路：
    
    
    #!/usr/bin/env python3
    """完整链路测试：证书 → 临时凭据 → 取密码 → SFTP"""
    import json, subprocess, boto3, paramiko
    
    # 1. X.509 证书 → Roles Anywhere 换取临时凭据
    result = subprocess.run([
        "./aws_signing_helper", "credential-process",
        "--certificate", "pki/client.crt",
        "--private-key", "pki/client.key",
        "--trust-anchor-arn", "
    ",
        "--profile-arn", "
    ",
        "--role-arn", "",
        "--region", "cn-north-1"
    ], capture_output=True, text=True, check=True)
    creds = json.loads(result.stdout)
    print(f"临时凭据获取成功，过期时间：{creds['Expiration']}")
    
    # 2. 临时凭据 → Secrets Manager 取密码
    session = boto3.Session(
        aws_access_key_id=creds["AccessKeyId"],
        aws_secret_access_key=creds["SecretAccessKey"],
        aws_session_token=creds["SessionToken"],
        region_name="cn-north-1"
    )
    sm = session.client("secretsmanager")
    password = json.loads(
        sm.get_secret_value(SecretId="sftp/prod/app1")["SecretString"]
    )["Password"]
    print(f"密码已获取（长度={len(password)}）")
    
    # 3. 密码 → 连接 SFTP
    transport = paramiko.Transport(("", 22))
    transport.connect(username="app1", password=password)
    sftp = paramiko.SFTPClient.from_transport(transport)
    
    sftp.open("/test.txt", "w").write("Hello SFTP!\n")
    print("上传成功")
    print(f"目录列表：{sftp.listdir('/')}")
    sftp.remove("/test.txt")
    print("全部验证通过！")
    

实际测试输出：
    
    
    临时凭据获取成功，过期时间：2026-06-25T15:05:22Z
    密码已获取（长度=32）
    上传成功
    目录列表：['test.txt']
    全部验证通过！
    

## **七、安全分析**

本方案实现了多层纵深防御，每一层独立降低风险：

防御层 | 机制 | 保护对象  
---|---|---  
网络层 | 安全组限制源 IP + VPC 端点 | SFTP 服务器入口  
传输层 | SSH/TLS 加密 | 传输中数据  
认证层 | 4h 轮换密码 + 源 IP 二次校验 | SFTP 登录凭据  
凭据层 | IAM Roles Anywhere（1h 临时凭据） | AWS API 访问  
根凭据层 | X.509 证书（短有效期 + CRL 吊销） | 唯一长期凭据  
存储层 | KMS 加密 | 静态数据（Secret / S3）  
审计层 | CloudTrail + CloudWatch Logs | 所有操作痕迹  
  
## **八、成本估算**

组件 | 月费用（cn-north-1） | 说明  
---|---|---  
Transfer Family SFTP 端点 | ~¥1,500 | 按小时计费，单协议 24×30  
数据传输 | ~¥0.28/GB | 上传+下载  
Secrets Manager | ~¥3 | 1 个 Secret + API 调用  
Lambda（IdP + 轮换） | <¥1 | 按调用次数  
KMS | ~¥7 | 1 个 CMK  
EIP | ¥0（使用中） | 挂载在 endpoint 上不收费  
合计（低流量） | ~¥1,510/月 | 主要成本是 Transfer Family 端点  
  
## **九、生产化建议**

  1. 固定出口 IP：生产环境的客户端程序应部署在有固定出口 IP 的环境，避免 IP 变动导致安全组和 IdP 白名单频繁更新。
  2. 证书生命周期管理： 
     * 使用 AWS Private CA 或企业 PKI 签发证书
     * 设置短有效期（7-30 天）+ 自动续签
     * 建立 CRL 分发点，支持证书紧急吊销
  3. 监控告警： 
     * CloudWatch Alarm 监控 Lambda 错误率
     * 对异常源 IP 登录尝试设置告警
     * 监控 Secrets Manager API 调用异常
  4. 多用户支持：本文示例为单用户，生产环境可扩展为按 username 从 DynamoDB 查询各用户的角色、目录映射和对应 Secret。
  5. 高可用：Transfer Family 本身跨多 AZ（本方案配置了 2 个子网 + 2 个 EIP），已具备高可用能力。
  6. 日志合规：启用 Transfer Family 的结构化日志（JSON 格式），包含用户名、操作类型、文件路径、传输字节数，满足审计合规要求。



## **十、总结**

本文展示了如何在亚马逊云科技中国区轻量化的构建一套安全的 SFTP 文件传输方案。核心价值在于：

  * 无长期 AWS 密钥：程序侧唯一长期凭据是 X.509 证书私钥，可短有效期+即时吊销
  * 凭据自动轮换：SFTP 密码自动更换，消除固定密码的安全隐患
  * 全托管基础设施：Transfer Family 免去 SFTP 服务器的运维负担
  * 纵深防御：网络层、认证层、凭据层、存储层的多重安全控制



**下一步行动：**

**相关产品：**

  * [AWS Transfer Family](<https://www.amazonaws.cn/transfer-family/?p=bl_pr_secrets-manager_l=1>) — 全托管 SFTP/FTPS/FTP 文件传输服务
  * [AWS Secrets Manager](<https://www.amazonaws.cn/secrets-manager/?p=bl_pr_lambda_l=2>) — 安全存储和自动轮换密钥
  * [IAM Roles Anywhere](<https://docs.aws.amazon.com/rolesanywhere/latest/userguide/introduction.html?p=bl_pr_iam_l=3>) — 为 AWS 外部工作负载提供临时凭据
  * [AWS KMS](<https://www.amazonaws.cn/kms/?p=bl_pr_kms_l=4>) — 托管加密密钥服务



**相关文章：**

  * [AWS IAM Identity Center 现在支持适用于 AWS 账户访问和应用程序使用的多区域复制功能](<https://aws.amazon.com/cn/blogs/china/aws-iam-identity-center-now-supports-multi-region-replication-for-aws-account-access-and-application-use/?p=bl_ar_l=1>)
  * [如何实现AWS账户登录活动自动化告警和响应（二）](<https://aws.amazon.com/cn/blogs/china/automating-aws-account-login-alerts-and-response-part-2/?p=bl_ar_l=2>)
  * [将 AWS DevOps Agent 智能运维能力延伸到中国区](<https://aws.amazon.com/cn/blogs/china/aws-devops-agent-intelligent-operations/?p=bl_ar_l=3>)
  * [如何实现AWS账户登录活动自动化告警和响应（一）](<https://aws.amazon.com/cn/blogs/china/automating-aws-account-login-alerts-and-response-part-1/?p=bl_ar_l=4>)
  * [AWS DevOps Agent 实战：云网络故障自主调查与修复建议](<https://aws.amazon.com/cn/blogs/china/aws-devops-agent-network-fault/?p=bl_ar_l=5>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 郭松

亚马逊云科技解决方案架构师，负责企业级客户的架构咨询及设计优化，同时致力于 AWS IoT 和存储服务在国内和全球企业客户的应用和推广。加入亚马逊云科技之前在 EMC 研发中心担任系统工程师，对企业级存储应用的高可用架构，方案及性能调优有深入研究。

### 王维超

亚马逊云科技解决方案架构师，负责基于亚马逊云科技的云计算方案的架构设计，同时致力于亚马逊云科技云服务在汽车行业的应用和推广。

### 马卫军

AWS中国团队的解决方案架构师，负责基于AWS的云计算方案架构咨询和设计。有丰富的数据仓库以及大数据开发和架构设计经验。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
