# 如何轻量化的在亚马逊云科技中国区安全使用 Transfer Family SFTP

> 📊 Level ⭐⭐⭐ | 12.7KB

→ [原文存档](https://aws.amazon.com/cn/blogs/china/how-to-security-using-transfer-family-sftp)

## 如何轻量化的在亚马逊云科技中国区安全使用 Transfer Family SFTP

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

SFTP（SSH File Transfer Protocol）是企业间文件交换的常用协议。许多组织需要通过 SFTP 与合作伙伴、供应商进行安全的数据传输。AWS Transfer Family 提供了全托管的 SFTP 服务器，但在实际落地过程中，我们经常会遇到一些约束：

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

      BlockPublicAcls=true,IgnorePublicAcls=true,Block

---

## 深度分析

### 中国区约束下的身份认证替代路径

这个方案的起点不是安全需求，而是一条分区约束：中国区没有 Cognito User Pool，无法像海外区那样用 OAuth client_credentials 做 M2M 认证。作者的解法是用"Secrets Manager 存密码 + Lambda 自定义校验"替代任何外部身份服务，彻底绕开 IdP 依赖。这提示了一个更普遍的规律：跨国云架构中，分区间的服务能力差异是第一等约束，海外区的惯用模式必须逐项重新验证后才能迁移。

### 两条凭据链路的无长期化设计

方案在两条链路上同时消灭了长期凭据：程序→AWS 侧用 IAM Roles Anywhere 把 X.509 证书换成 1 小时过期的临时凭据；客户端→SFTP 侧用 EventBridge 每 4 小时轮换的动态密码。整个系统唯一的长期凭据是可设短有效期、支持 CRL 吊销的证书私钥。这与 [无长期 AK/SK 认证实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-devops-agent-接入-aws-中国区二多账号扩展跨云接入与无长期-aksk-认证.md) 的思路一致：纵深防御的关键不是消灭凭据，而是把每个凭据的生命周期压缩到远小于攻击者的利用窗口。

### 用平台既有机制替代自建状态机

Secrets Manager 的原生轮换要求实现 createSecret/setSecret/testSecret/finishSecret 四步 Lambda 状态机，而此场景下"密码的唯一真相源就是 Secret 本身"，作者直接用 EventBridge 定时触发 PutSecretValue 写新密码——平台会自动把旧版本降级为 AWSPREVIOUS，IdP Lambda 同时校验两个版本即可无缝覆盖过渡期。这是典型的架构简化：先问平台已有的版本机制能不能顶上，再考虑自建流程。同样思路还体现在用 hmac.compare_digest 恒定时间比较防时序攻击、用 LOGICAL 目录映射做用户隔离。

### 轻量化的真实成本边界

成本表的结构很说明问题：Transfer Family 端点约 ¥1,500/月，占总成本 99% 以上，Secrets Manager、Lambda、KMS 合计不到 ¥15。所谓"轻量化"省下的是 AD/IdP 基础设施和 SFTP 服务器运维的复杂度，而不是钱。这类方案的经济学成立前提是：全托管端点本身的价值足以覆盖其费用，安全增强部分几乎免费搭车。

## 实践启示

1. 在中国区设计 AWS 方案前，先逐项核对分区服务能力清单（如 Cognito User Pool 缺失、Cognito Identity Pool 无法签发 OAuth Token），把服务差异写进架构约束再选型。
2. 程序侧绝不落长期 AccessKey：工作负载在 AWS 之外时，用 IAM Roles Anywhere 以 X.509 证书换取短时凭据，唯一需要保管的长期凭据是可吊销的证书私钥。
3. 凭据自动轮换必须处理过渡期：IdP 校验要同时接受 AWSCURRENT 和 AWSPREVIOUS 两个版本，否则高频轮换会造成间歇性登录失败，参见 [Secrets Manager 身份实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/bedrock-agentcore-secrets-manager-identity.md)。
4. 当凭据的唯一真相源就是 Secret 本身时，用 EventBridge 定时 + PutSecretValue 直写替代 Secrets Manager 四步原生轮换状态机，让平台自动维护新旧版本。
5. 纵深防御的每一层要独立成立：安全组限源 IP、Lambda 二次校验源 IP、KMS 加密、CloudTrail 审计，任何单点被攻破都不足以拿到数据。
6. M2M 密码校验用 hmac.compare_digest 做恒定时间比较防时序攻击，日志只记录用户名、协议、源 IP，绝不落密码明文。

## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

