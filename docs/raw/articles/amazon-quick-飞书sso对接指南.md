---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/amazon-quick-sso-integration-guide
ingested: 2026-07-05
feed_name: AWS China Blog
source_published: 2026-07-01
sha256: "94c97e26896d4632c29dc4db183b0ec85b35e9ea5de00b0e8e6f3ad4c531abe1"
---

# Amazon Quick 飞书SSO对接指南

摘要：Amazon Quick 是 AWS 推出的 AI 工作助手，能够将问题转化为答案、将答案转化为行动。它连接企业内的应用、工具和数据，支持自然语言查询、工作流自动化、文档生成、数据可视化以及跨系统的智能代理任务。  
  
**目录**

01 使用飞书 SSO 登录 Amazon Quick

02 Quick Web 接入飞书（概述）

03 Quick Desktop 接入飞书 SSO

04 基础设施部署（Keycloak on AWS）

05 飞书集成平台配置

06 Keycloak 配置

07 运维

08 使用 AI Agent 辅助配置

09 结语

* * *

## **一、使用飞书 SSO 登录 Amazon Quick**

### 1.1 Amazon Quick 简介

Amazon Quick 是 AWS 推出的 AI 工作助手，能够将问题转化为答案、将答案转化为行动。它连接企业内的应用、工具和数据，支持自然语言查询、工作流自动化、文档生成、数据可视化以及跨系统的智能代理任务。

Quick 有两种主要访问形式：

  * Quick Web：通过浏览器访问，是日常使用的主要入口。
  * Quick Desktop：原生桌面客户端（macOS/Windows），持续运行于本地，可访问本地文件、日历、邮件，并构建个人知识图谱。仅在企业版（Enterprise Edition）中提供，且身份区域须为 `us-east-1`。



### 1.2 与飞书的对接方式

**1.2.1 本文的对接方案基于 飞书 + IAM Identity Center 的组合**

  * 用户目录：Quick 的用户账号统一来自 IAM Identity Center
  * 身份来源：IAM Identity Center 将飞书配置为外部 IdP（SAML），用户实际通过飞书账号完成身份验证
  * 用户同步：飞书用户和组通过 Lambda 函数同步到 IAM Identity Center（飞书不支持 SCIM，详见下节）
  * Quick Web：与 IAM Identity Center 原生集成，用户登录时跳转至飞书完成 SAML 认证后返回
  * Quick Desktop：使用 OIDC 协议（Public Client + PKCE + offline_access），通过 Keycloak 作为中间层衔接飞书（本文重点）



整体架构如下：
    
    
    飞书（身份源）
        │                    │
        │ SAML               │ OIDC/OAuth（Anycross）
        ▼                    ▼
    IAM Identity Center   Keycloak（OIDC 中间层）
        │                    │
        │ 原生集成             │ OIDC
        ▼                    ▼
    Quick Web           Quick Desktop
    

### 1.3 飞书用户同步到 IAM Identity Center

IAM Identity Center 支持通过 SCIM 协议与外部 IdP 自动同步用户和组，但飞书目前不支持 SCIM 协议，无法直接完成自动同步。

针对这一问题，可通过一个 Lambda 函数定期调用飞书开放 API 获取用户和组信息，再调用 IAM Identity Center 的 SCIM 接口完成创建和更新，实现类似原生 SCIM 同步的效果。该方案的具体实现已上传至 [GitHub](<https://github.com/hhhsummer6967/feishu-idp-sync-to-aws>)，供参考。

如果只是将 IAM Identity Center作为Quick的用户来源，不希望同步所有企业内用户到 IAM Identity Center，也可以手动在 IAM Identity Center创建用户，只要确保使用企业邮件作为 IAM Identity Center的用户即可。

## **一、Quick Web 接入飞书（概述）**

Quick Web 使用 IAM Identity Center 原生集成方式，与飞书的对接分两部分：将飞书配置为 IAM Identity Center 的外部 IdP，以及将 Quick 账号与 IAM Identity Center 关联。

**第一步：在 IAM Identity Center 中配置飞书为外部 IdP**

  * 在飞书开放平台创建企业自建应用，配置为 SAML 应用，下载飞书的 IdP metadata XML
  * 打开 [IAM Identity Center 控制台](<https://console.aws.amazon.com/singlesignon>) → Settings → Identity source → Actions → Change identity source
  * 选择 External identity provider，点击 Next
  * 在 Service provider metadata 下，下载 IAM Identity Center 的 SAML metadata 文件，上传到飞书 SAML 应用（配置 ACS URL 和 Entity ID）
  * 在 Identity provider metadata 下，上传飞书的 IdP metadata XML
  * 输入 `ACCEPT` 确认并提交



**第二步：创建 Quick 账号时选择 IAM Identity Center**

在注册或配置 Amazon Quick Enterprise 账号时，选择 IAM Identity Center 作为身份来源。Quick 会自动与 IAM Identity Center 建立原生集成，IAM Identity Center 中的用户和组自动同步至 Quick。

**注意：**

IAM Identity Center 的身份来源一旦设置后变更会影响现有用户分配，请提前规划。详细步骤可参考 AWS 官方文档。

## **二、Quick Desktop 接入飞书 SSO**

### 2.1 Quick Desktop 的认证要求

Quick Desktop 使用 OIDC 协议，具体要求：

  * Public Client + PKCE：桌面应用不持有 client_secret
  * offline_access scope：通过 refresh token 维持长期会话
  * 标准 OIDC Discovery 端点：客户端自动发现配置
  * email claim：通过 token 中的 email 字段映射 Quick 用户



飞书的 OAuth/OIDC 实现不满足上述要求：不支持 Public Client、PKCE、`offline_access`，飞书原生平台也不提供标准 OIDC Discovery 端点。因此需要引入 Keycloak 作为中间层，由 Keycloak 向 Quick Desktop 提供符合规范的 OIDC 服务，同时以 OAuth 客户端身份向飞书发起授权。

### 2.2 架构

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/30/amazon-quick-sso-integration-guide-1.png>) [图1]  
---  
  
**2.2.1 登录流程**

  * 用户在 Quick Desktop 点击”Enterprise login”
  * 浏览器弹出 Keycloak 登录页，点击”飞书”
  * 跳转至飞书授权页面，用户确认
  * 返回 Quick Desktop，登录成功



### 2.3 飞书应用创建方式

飞书提供两种创建应用的入口，与 Keycloak 对接的复杂度差异显著：

| 飞书集成平台（Anycross） | 飞书原生平台（自建应用）  
---|---|---  
入口 | https://anycross.feishu.cn | https://open.feishu.cn  
OIDC Discovery |  支持 |  不支持  
Token 认证方式 |  `client_secret_basic` / `post` |  仅 `post`  
UserInfo 格式 | 标准扁平结构 | 嵌套 `data` 层，非标准  
Keycloak 对接 | 内置 OIDC，零代码 | 需自定义 SPI 插件  
  
推荐使用飞书集成平台（Anycross），以下以此为主方案，原生平台方案见附录。

## **三、基础设施部署（Keycloak on AWS）**

### 3.1 部署架构
    
    
    Internet ──► ALB (HTTPS 443) ──► EC2 t3.small
                                          │
                                      Keycloak 26.x :8080
                                          │
                                      EBS gp3 数据卷
                                          │
                                     DLM 每日快照
    

### 3.2 前置条件

  * AWS 账号（需 EC2、ALB、Route 53、ACM 权限）
  * 已备案域名及对应 ACM 证书
  * 飞书集成平台企业应用的 App ID 和 App Secret（见下节）



### 3.3 创建 EC2 实例

  * AMI：Amazon Linux 2023
  * 实例类型：t3.small
  * 存储：gp3 20GB
  * 安全组：入站仅允许 ALB 访问 8080 端口


    
    
    IAM Role：AmazonSSMManagedInstanceCore
    

### 3.4 安装 Docker
    
    
    sudo dnf update -y
    sudo dnf install -y docker
    sudo systemctl enable docker && sudo systemctl start docker
    sudo usermod -aG docker ec2-user
    

### 3.5 部署 Keycloak

`/home/ec2-user/keycloak/docker-compose.yml`：
    
    
    services:
      postgres:
        image: postgres:16-alpine
        container_name: keycloak-db
        restart: always
        environment:
          POSTGRES_DB: keycloak
          POSTGRES_USER: keycloak
          POSTGRES_PASSWORD: ${DB_PASSWORD}
        volumes:
          - ./pgdata:/var/lib/postgresql/data
        healthcheck:
          test: ["CMD-SHELL", "pg_isready -U keycloak"]
          interval: 10s
          timeout: 5s
          retries: 5
    
      keycloak:
        image: quay.io/keycloak/keycloak:26.0
        container_name: keycloak
        restart: always
        depends_on:
          postgres:
            condition: service_healthy
        environment:
          KC_DB: postgres
          KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
          KC_DB_USERNAME: keycloak
          KC_DB_PASSWORD: ${DB_PASSWORD}
          KC_HOSTNAME: ${KC_HOSTNAME}
          KC_PROXY_HEADERS: xforwarded
          KC_HTTP_ENABLED: "true"
          KC_HEALTH_ENABLED: "true"
          KEYCLOAK_ADMIN: admin
          KEYCLOAK_ADMIN_PASSWORD: ${ADMIN_PASSWORD}
        command: start
        ports:
          - "8080:8080"
        volumes:
          - ./providers:/opt/keycloak/providers

`.env：`
    
    
    DB_PASSWORD=<强密码>
    ADMIN_PASSWORD=<管理员密码>
    KC_HOSTNAME=auth.yourcompany.com
    
    
    
    cd /home/ec2-user/keycloak &amp;&amp; docker compose up -d<br />curl http://localhost:8080/health/ready

### 3.6 配置 ALB

  * 创建 Target Group（HTTP:8080，健康检查 `/health/ready`）
  * 创建 ALB，HTTPS 443，绑定 ACM 证书
  * Route 53 指向 ALB



## **四、飞书集成平台配置**

  * 登录 https://anycross.feishu.cn，创建 OIDC 应用
  * 记录 App ID、App Secret 和 Well-Known URL
  * 配置 Scope：`openid profile email offline_access`
  * 配置回调地址：[https://auth.yourcompany.com/realms/{realm}/broker/feishu/endpoint](<https://auth.yourcompany.com/realms/%7Brealm%7D/broker/feishu/endpoint>)
  * 发布应用



## **五、Keycloak 配置**

Keycloak 使用 Realm 作为独立的租户单元，每个 Realm 有自己的用户、客户端和 IdP 配置。不要在默认的 `master` Realm 下配置业务应用——`master` 仅用于管理 Keycloak 本身。以下步骤需先创建一个新的业务 Realm。

### 5.1 创建 Realm

  * 登录 Keycloak 管理后台（<https://auth.yourcompany.com/auth/admin>）
  * 左上角点击 master 下拉菜单 → Create realm
  * 填写：
  * Realm name：如 `quick`（即后续 URL 中的 `{realm}`）
  * 点击 Create



创建完成后，所有后续操作均在此 Realm 下进行。

### 5.2 关闭不必要的登录选项

由于用户只通过飞书登录，不需要 Keycloak 自身的注册、密码登录等功能。

**5.2.1 进入 Realm settings → Login 标签，建议关闭**

选项 | 建议值 | 说明  
---|---|---  
User registration | Off | 禁止用户自行注册  
Forgot password | Off | 无本地密码，无需此功能  
  
### 5.3 添加飞书 Identity Provider

进入 Identity Providers → Add provider → OpenID Connect v1.0，填写：

字段 | 值  
---|---  
Alias | `feishu`  
Display Name | `飞书`  
Discovery endpoint | 飞书集成平台提供的 Well-Known URL  
Client ID | 飞书 App ID  
Client Secret | 飞书 App Secret  
Client Authentication | `Client secret sent as basic`  
Default Scopes | `openid profile email`  
  
保存后 Keycloak 会自动从 Discovery endpoint 拉取所有 OIDC 端点，无需手动填写 Token / Authorization 等地址。

设置默认 IdP（可选但推荐）：若 Keycloak 只对接飞书，可在 Authentication → Flows → browser 中将飞书设为默认 IdP，这样用户点击登录后直接跳转飞书，不会看到 Keycloak 中间页。

### 5.4 配置用户属性映射

飞书返回的企业邮箱字段名为 `enterprise_email`，而 Quick Desktop 通过 token 中的 `email` claim 识别用户，需要在 Keycloak 中配置映射。

**5.4.1 进入 Identity Providers → feishu → Mappers → Add mapper**

字段 | 值  
---|---  
Name | `enterprise_email → email`  
Sync mode override | `Inherit`  
Type | `Attribute Importer`  
Claim | `enterprise_email`  
User Attribute Name | `email`  
  
### 5.5 处理”首次登录”流程（解决验证邮件问题）

这是对接中最容易被忽略的配置。用户通过飞书首次登录 Keycloak 时，Keycloak 默认会触发”First Broker Login”流程，要求用户完成邮件验证、更新个人信息等操作，导致登录流程中断。

由于飞书已经是可信的企业 IdP，用户身份已在飞书侧完成验证，这些额外步骤是不必要的。

**5.5.1 禁用不必要的首次登录动作**

进入 Authentication → Flows → first broker login，找到以下步骤并将其设为 Disabled：

步骤 | 默认状态 | 建议状态  
---|---|---  
Review Profile | Required | Disabled  
Verify Existing Account By Email | Alternative | Disabled  
  
同时检查 Realm settings → Login → Email verification，若未配置 SMTP，应关闭此选项，避免 Keycloak 尝试发送验证邮件而失败。

**5.5.2 关闭 Required Actions 中的默认验证**

进入 Authentication → Required actions，确认以下项目的 Default 列为 Off：

  * Verify Email
  * Update Profile



完成以上配置后，用户通过飞书授权后将直接完成登录，无需任何额外交互。

### 5.6 创建 Quick Desktop Client

**5.6.1 进入 Clients → Create client**

**5.6.2 General Settings**

字段 | 值  
---|---  
Client type | OpenID Connect  
Client ID | `amazon-quick-desktop`  
  
**5.6.3 Capability config**

字段 | 值  
---|---  
Client authentication | Off（Public Client，无 client_secret）  
Authorization | Off  
Authentication flow | 仅勾选 Standard flow  
  
**5.6.4 Login settings**

字段 | 值  
---|---  
Valid redirect URIs | `http://localhost:18080`  
Web origins | `http://localhost:18080`  
  
保存后，进入该 Client 的 Client Scopes 标签，确认以下 scope 已在 Assigned 列表中：`openid`、`email`、`profile`、`offline_access`。

### 5.7 配置 Quick Desktop Extension Access

Extension Access 是在 Amazon Quick 管理控制台中登记 OIDC 端点信息的配置，告知 Quick Desktop 去哪里完成用户认证。

**注意：**

Extension Access 创建后无法编辑，填写前请仔细核对所有值。如有填错，需删除后重新创建。

**5.7.1 第一步：在 Quick 控制台添加 Extension Access**

  * 登录 Amazon Quick 管理控制台
  * 左侧导航 → Permissions → Extension access → Add extension access
  * 选择 Desktop application for Quick，点击 Next
  * 填写以下信息：

字段 | 值  
---|---  
Name | 自定义名称，如 `Feishu SSO`  
Issuer URL | `https://auth.yourcompany.com/realms/quick`  
Authorization Endpoint | `https://auth.yourcompany.com/realms/quick/protocol/openid-connect/auth`  
Token Endpoint | `https://auth.yourcompany.com/realms/quick/protocol/openid-connect/token`  
JWKS URI | `https://auth.yourcompany.com/realms/quick/protocol/openid-connect/certs`  
Client ID | `amazon-quick-desktop`  
  
  * 点击 Add



以上端点地址可通过 Keycloak Discovery 文档事先确认：
    
    
    https://auth.yourcompany.com/realms/quick/.well-known/openid-configuration
    

**5.7.2 第二步：创建 Extension**

  * 左侧导航 → Connect apps and data → Extensions → Add extension
  * 选择上一步创建的 Extension Access，点击 Next → Create



**5.7.3 第三步：验证配置**

下载并安装 Quick Desktop 客户端，点击 Enterprise login，应跳转至飞书授权页，完成授权后成功进入 Quick。

常见问题排查：

错误现象 | 排查方向  
---|---  
`redirect_mismatch` | 检查 Keycloak Client 中 Valid redirect URIs 是否为 `http://localhost:18080`  
登录后提示”User not found” | IdP token 中的 email 必须与 Quick 中对应用户的 email 完全一致，检查 5.4 的属性映射是否生效  
Token validation failure | 检查 Issuer URL 与 Keycloak 实际 issuer 是否完全一致（注意末尾是否有多余斜杠）  
会话频繁过期 | 检查 Keycloak Client 是否启用了 `offline_access` scope，以及飞书集成平台应用的 Scope 中是否包含 `offline_access`  
  
## **六、运维**

备份：通过 AWS DLM 每日自动快照 EBS 数据卷。

升级：
    
    
    # 先创建 EBS 快照，再执行：
    docker compose pull keycloak && docker compose up -d keycloak

安全加固：EC2 不分配公网 IP，通过 Session Manager 管理；ALB 规则限制 `/auth/admin` 仅允许管理员 IP。

**监控告警**

指标 | 告警阈值  
---|---  
EC2 StatusCheckFailed | ≥ 1  
ALB HealthyHostCount | < 1  
ALB TargetResponseTime | > 3s  
  
## **七、使用 AI Agent 辅助配置**

本文涉及的配置步骤较多，其中基础设施部署和 Keycloak 配置部分可以借助支持 CLI 工具调用的 AI Agent（如 Kiro）来完成，减少手动操作。

使用方式：将本文地址提供给 Agent，由 Agent 读取文档内容后自行解析步骤并执行。

示例指令：

“请参考 {本文 URL} 中的部署步骤，帮我完成 Keycloak 的 AWS 基础设施部署，EC2 部署在 xxx区域，域名为 [auth.yourcompany.com](<http://auth.yourcompany.com>)。请额外添加其他指定参数，比如AMI、安全组等等””请参考 {本文 URL} 中的 Keycloak 配置步骤，帮我完成 quick realm 的创建、飞书 IdP 配置和 Quick Desktop Client 创建，飞书 App ID 是 xxx，App Secret 是 yyy，Well-Known URL 是 zzz。”

### 7.1 Agent 可以帮你完成的部分

**7.1.1 基础资源创建与 Keycloak 部署**

通过 AWS CLI，Agent 可以完成：

  * 创建 EC2 实例（指定 AMI、实例类型、安全组、IAM Role）
  * 创建 Target Group 和 ALB，配置 HTTPS 监听器
  * 配置 Route 53 记录
  * 通过 SSM Session Manager 连接 EC2，安装 Docker，写入 `docker-compose.yml` 和 `.env` 文件并启动 Keycloak



**7.1.2 Keycloak 侧配置**

Keycloak 提供完整的 REST Admin API，Agent 可以通过调用接口完成：

  * 创建 Realm
  * 添加飞书 OIDC Identity Provider 并配置 Mappers
  * 修改 First Broker Login 流程（禁用 Review Profile、Verify Email 等步骤）
  * 关闭 Required Actions 默认值
  * 创建 `amazon-quick-desktop` Public Client 并配置 Scopes



### 7.2 需要手动操作的部分

以下步骤目前需要在对应控制台中手动完成：

**7.2.1 飞书集成平台（Anycross）配置**

  * 创建 OIDC 应用、获取 App ID / Secret / Well-Known URL
  * 填写回调地址并发布应用



飞书集成平台暂无公开 API，无法自动化。

**7.2.2 Quick Web SAML 登录配置**

  * 在飞书开放平台配置 SAML 应用并下载 metadata
  * 在 [AWS IAM](<https://aws.amazon.com/cn/iam/>) 控制台创建 SAML Identity Provider 并配置角色



涉及 IAM 资源变更，建议由具有相应权限的管理员在控制台审核后操作。

**7.2.3 Quick Desktop Extension Access 配置**

  * 在 Amazon Quick 管理控制台创建 Extension Access 并填写 OIDC 端点
  * 创建 Extension



Extension Access 创建后不可编辑，需要人工核对所有端点值后再提交。

## **九、结语**

**下一步行动：**

**相关产品：**

  * [Amazon IAM](<https://aws.amazon.com/cn/iam/?p=bl_pr_iam_l=1>) — 身份管理和访问权限
  * [Amazon EC2](<https://aws.amazon.com/cn/ec2/?p=bl_pr_ec2_l=2>) — 安全且可调整大小的计算容量
  * [Amazon Route 53](<https://aws.amazon.com/cn/route53/?p=bl_pr_route-53_l=3>) — 全球域名系统（DNS）
  * [Amazon EBS](<https://aws.amazon.com/cn/ebs/?p=bl_pr_ebs_l=4>) — 高性能数据块存储
  * [Amazon Connect](<https://aws.amazon.com/cn/connect/?p=bl_pr_connect_l=5>) — AI 客户体验解决方案



**相关文章：**

  * [从数据库连接到自然语言查询：Amazon QuickSuite 数据分析全流程实践](<https://aws.amazon.com/cn/blogs/china/amazon-quicksuite-data-analysis-end-to-end-practice/?p=bl_ar_l=1>)
  * [基于 Amazon Connect 数据湖与 Quick 构建联络中心智能分析平台](<https://aws.amazon.com/cn/blogs/china/based-on-amazon-connect-data-lake-quick-build-intelligent-analytics-platform/?p=bl_ar_l=2>)
  * [快时尚电商行业智能体设计思路与应用实践（七）Amazon Bedrock AgentCore Runtime 深度解析和场景分析](<https://aws.amazon.com/cn/blogs/china/amazon-bedrock-agentcore-runtime-deep-dive-and-scenario-analysis/?p=bl_ar_l=3>)
  * [三剑合璧Quick Suite + Agent Core + Kiro联动实践：海外物流报价助手实战](<https://aws.amazon.com/cn/blogs/china/quick-suite-agent-core-kiro-logistics-quote-assistant/?p=bl_ar_l=4>)
  * [基于 Amazon Bedrock AgentCore Runtime 部署 Apache Doris MCP Server为 Quick Suite 等 AI 客户端提供原生数据分析能力](<https://aws.amazon.com/cn/blogs/china/runtime-deploy-apache-doris-mcp-server-quick-suite-ai-analytics/?p=bl_ar_l=5>)



## 本篇作者

### 海国慧

亚马逊云科技解决方案架构师，负责云计算解决方案的咨询和设计，具有丰富的解决客户实际问题的经验。同时致力于云计算安全、生成式 AI 的应用与推广。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
