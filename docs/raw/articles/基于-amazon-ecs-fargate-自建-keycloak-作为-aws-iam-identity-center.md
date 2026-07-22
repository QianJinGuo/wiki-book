---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/based-on-amazon-ecs-fargate-keycloak-aws-iam-identity-center/
tags: [aws-china-blog, agentic-ai, context-engineering]
ingested: 2026-05-22
sha256: 492ce0e255041ca1e8c163f4675e54678d0d46325c184aeadbffd9e27395acac
feed_name: AWS China Blog
source_published: 2026-05-22T08:16:31Z
---

# 基于 Amazon ECS Fargate 自建 Keycloak 作为 AWS IAM Identity Center 外部 IdP，为 Kiro 提供企业级 SSO 登录

## 基于 Amazon ECS Fargate 自建 Keycloak 作为 AWS IAM Identity Center 外部 IdP，为 Kiro 提供企业级 SSO 登录

摘要：Kiro 是一款面向开发者的 AI 辅助编程工具，支持 Google、GitHub、AWS Builder ID、AWS IAM Identity Center（以下简称 IdC）多种登录方式。本文聚焦 IdC 这条路径——适合需要把 Kiro 纳入企业身份治理、按组织统一下发权限的团队。

**目录**

01 [背景说明](#section1)

02 [方案与架构](#section2)

03 [服务介绍](#section3)

04 [环境搭建](#section4)

05 [集成与验证](#section5)

06 [效果呈现](#section6)

07 [总结](#section7)

08 [环境清理](#section8)

09 [参考链接](#section9)

* * *

## **1\. 背景说明**

Kiro 是一款面向开发者的 AI 辅助编程工具，支持 Google、GitHub、AWS Builder ID、[AWS IAM](https://aws.amazon.com/cn/iam/) Identity Center（以下简称 IdC）多种登录方式。本文聚焦 IdC 这条路径——适合需要把 Kiro 纳入企业身份治理、按组织统一下发权限的团队。IdC 自带 “Identity Center directory” 可以直接管理用户，但在实际企业场景中，往往还需要：

*   用自己的登录域名（例如 sso.example.com）承载企业品牌；
*   在登录侧做 IP 白名单——ALB 安全组在网络层控制来源，Keycloak 自带 flow 在应用层二次校验，形成纵深防御；
*   把 IdP 的用户目录纳入企业已有的治理体系（密码策略、审计、多因素、后续对接 AD/LDAP）；
*   Realm 级隔离，一套 IdP 同时服务多个下游系统，不止是 IdC。

原生 IdC directory 满足不了上面这些诉求。因此我们选择把 Keycloak 26.2.4 作为外部 SAML IdP 部署在 AWS eu-central-1（Frankfurt），由 IdC 以 “External identity provider” 模式把身份鉴权委托给 Keycloak，再由 IdC 向 Kiro 发放 SSO 凭证。

整个链路最终跑通的形态是：

```
Kiro IDE/CLI
  → IdC access portal
    → Keycloak (sso.example.com, Realm kiro-idp)   ← 用户在这里输入账号密码
      → SAML Assertion 回到 IdC
        → Kiro 拿到 AWS 临时凭证，登录完成
```

本文记录从零到跑通这条链路的完整过程，包括 CloudFormation 叠层、自定义镜像、SAML 集成脚本和登录效果验证，配套代码见 [https://github.com/successzy/keycloak-idc-kiro](https://github.com/successzy/keycloak-idc-kiro)。

## **2\. 方案与架构**

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/22/based-on-amazon-ecs-fargate-keycloak-aws-iam-identity-center-1.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/22/based-on-amazon-ecs-fargate-keycloak-aws-iam-identity-center-1.png)

\[图1\]

### 2.1 整体架构

数据流按先后顺序：

1.  用户登录 Kiro IDE/CLI；
2.  IdC 作为 SP 发起 SAML AuthnRequest，重定向到 Keycloak https://sso.example.com/realms/kiro-idp/protocol/saml；
3.  请求经 Route53 → ALB（HTTPS 443，ACM 证书）→ ECS Fargate task（Keycloak 容器，8080）；
4.  Keycloak 查询 Aurora PostgreSQL 校验用户名密码，生成签名过的 SAML Assertion 回发到 IdC 的 ACS URL；
5.  IdC 用 NameID（email）匹配到 Identity Store 中的用户，向 Kiro 发放临时凭证。

### 2.2 关键设计决策

决策点

选择

原因

Keycloak 运行方式

ECS Fargate（单 task 测试模式）

免运维，HA 时只需改 DesiredCount 和 VPC Endpoint 分布

数据库

Aurora PostgreSQL 15.10 db.t4g.medium

Keycloak 对 DB 要求不高，burstable 实例省钱

Keycloak 版本

26.2.4

当前稳定版本，自带 Infinispan JDBC-PING 集群能力

镜像

自建镜像，Dockerfile 两阶段：builder 跑 kc.sh build 固化配置，runtime 用 start –optimized 秒级启动

启动时不再 build，秒级启动；同时预装 IP 白名单 SPI

凭证存储

AWS Secrets Manager

DB 密码和 admin 密码统一，ECS task 通过执行角色直接注入容器 env

身份同步方式

SAML NameID = email

我们的 Identity Store 把 UserName 约定为 email，NameID 沿用 email 方便反查

## **3\. 服务介绍**

服务

作用

Amazon ECS Fargate

无服务器方式运行 Keycloak 容器，免管 EC2

Amazon Aurora PostgreSQL

Keycloak 持久化存储（Realm、用户、Session）

Application Load Balancer

公网入口，HTTPS 终结，TLS1.3；Target Group IP 模式直挂 Fargate task

AWS Certificate Manager

签 sso.example.com 证书，DNS 自动校验

Amazon Route53

A-alias 记录把域名解析到 ALB

Amazon ECR

私有镜像仓库，IMMUTABLE tag、ScanOnPush、生命周期保留最新 20 个

AWS Secrets Manager

存 DB 凭证和 Keycloak admin 凭证，KMS 加密

AWS IAM Identity Center

SAML Service Provider，把鉴权委托给 Keycloak，再向 Kiro 发临时凭证

## **4\. 环境搭建**

基础设施以 5 个 CloudFormation 叠层分层，依赖顺序 01 → 02 → 03 → 04 → 05。

### 4.1 网络栈（cfn/01-network.yaml）

*   10.100.0.0/16\[示例\] VPC，跨 3 AZ，分 Public / App / Db 三种子网；
*   单 NAT Gateway（成本优化，生产可扩 3 个）；
*   ALB 安全组入站仅放行一个 /32（203.0.113.10/32\[示例\]，对应公司出口 IP）；
*   Fargate task 之间额外放开 7800 端口供 Infinispan JGroups 互联；
*   6 个 Interface VPC Endpoints（Secrets / KMS / ECR API / ECR DKR / Logs / STS）+ S3 Gateway Endpoint，让 Fargate 即使没 NAT 也能拉镜像和取凭证。

省钱痕迹：Interface VPCE 目前只落在 AZ-a。生产 HA 需把 SubnetIds 改回三个 App 子网。

### 4.2 数据库栈（cfn/02-database.yaml）

*   一把 KMS CMK 同时给 Aurora 和 Secret 用；
*   Secrets Manager 自动生成 32 位随机密码，SecretStringTemplate 把 username 固定为 kcadmin；
*   Aurora PG 15.10 单 writer 实例，db.t4g.medium，30 天备份、Performance Insights 7 天；
*   DeletionPolicy: Delete（测试模式），生产要改 Snapshot 并打开 DeletionProtection。

### 4.3 ECR 栈（cfn/03-ecr.yaml）

*   ImageTagMutability: IMMUTABLE——同一个 tag 不允许覆盖，强制升级必须升版本号；
*   生命周期策略：未打 tag 的失败镜像 7 天过期；打 tag 的保留最近 20 个；
*   ScanOnPush: true，漏洞扫描在 push 时自动触发。

### 4.4 ALB / DNS 栈（cfn/04-alb-dns.yaml）

*   ACM 证书走 DNS 验证，DomainValidationOptions 指向同一个 hosted zone，部署时会自动写 CNAME 验证记录；
*   Target Group：IP 模式（Fargate 要求）、lb\_cookie 会话粘性 1 小时；
*   健康检查路径用 /realms/master/.well-known/openid-configuration（Keycloak 26 的 /health/\* 在 9000 管理端口，8080 上不可达）；
*   HTTPS listener 走 ELBSecurityPolicy-TLS13-1-2-2021-06，只允许 TLS 1.2+。

### 4.5 ECS 栈（cfn/05-ecs.yaml）

关键片段：

```
Environment:
  - Name: KC_HOSTNAME
    Value: sso.example.com
  - Name: KC_PROXY_HEADERS
    Value: xforwarded
  - Name: KC_HTTP_ENABLED
    Value: 'true'
  - Name: KC_HTTPS_ENABLED
    Value: 'false'          # TLS 在 ALB 终结，Keycloak 到 ALB 走明文 HTTP
  - Name: KC_CACHE
    Value: ispn
  - Name: KC_CACHE_STACK
    Value: jdbc-ping         # 多 task 时用 DB 做 cluster discovery
```

要点：

*   DB 和 admin 两个密码通过 Secrets 字段从 Secrets Manager 注入容器环境，不落镜像；
*   没有容器级 HealthCheck。Keycloak 基础镜像基于 UBI9 Micro，没有 shell / curl / wget 可用；ALB TG 健康检查已经覆盖就绪探测；
*   Deployment Circuit Breaker 打开，滚动失败自动回滚；
*   EnableExecuteCommand: true，排障可以 aws ecs execute-command。

### 4.6 自定义镜像（docker/Dockerfile）

kc.sh 是 Keycloak 官方镜像自带的入口脚本（位于容器内 /opt/keycloak/bin/kc.sh）。Keycloak 从 Quarkus 版本起把生命周期拆成两段：kc.sh build 在构建期把 DB provider、cache 栈等配置”编译”固化到镜像里，kc.sh start –optimized 在运行期跳过 build 直接启动。把 build 放到 Docker 构建阶段而不是容器启动时，Fargate task 冷启动能从几十秒降到秒级。

两阶段构建：

```
ARG KEYCLOAK_VERSION=26.2.4

FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION} AS builder
ENV KC_DB=postgres \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true \
    KC_CACHE=ispn \
    KC_CACHE_STACK=jdbc-ping \
    KC_LOG_CONSOLE_OUTPUT=json
COPY --chown=keycloak:keycloak providers/ /opt/keycloak/providers/
COPY --chown=keycloak:keycloak themes/    /opt/keycloak/themes/
RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION}
COPY --from=builder /opt/keycloak/ /opt/keycloak/
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized"]
```

*   builder 阶段跑 kc.sh build，把 DB provider、Infinispan、health/metrics 烧进镜像，runtime 直接 start –optimized 秒级启动；
*   providers/ 目录放一个自研的 IP 白名单 Authenticator SPI（打成 jar），启用时由 Keycloak 在启动时自动加载；
*   themes/ 目录给将来定制登录页预留位置。

build-and-push.sh 从 CloudFormation 输出里拿 ECR URI，强制 linux/amd64 以匹配 task definition 的 CpuArchitecture: X86\_64（切 Graviton 的话改成 linux/arm64 + 任务定义同步改 ARM64 即可）。

### 4.7 部署命令

仓库里的模板用了 example.com / 203.0.113.10/32 等占位默认值，真正 deploy 前先准备好 4 个真实参数：

参数

来源

AlbAllowedCidr

办公网出口 IP /32（或多段 CIDR）

HostedZoneId

aws route53 list-hosted-zones-by-name –dns-name <你的域名> 返回的 Id

HostedZoneName

你在 Route53 托管的根域名，例如 yourcompany.com

KeycloakHostname

sso.<HostedZoneName>，必须与 04 栈里的 ACM 证书域名一致

按顺序 deploy 5 个栈（中间叠层 ImportValue 前一叠层的 export，必须严格顺序）：

```
REGION=eu-central-1
ALB_CIDR="<办公网出口 IP>/32"
ZONE_ID="Z0123456789ABCDEFGHIJ"
ZONE_NAME="yourcompany.com"

aws cloudformation deploy --region $REGION \
  --stack-name kc-network-prod --template-file cfn/01-network.yaml \
  --parameter-overrides AlbAllowedCidr=$ALB_CIDR \
  --capabilities CAPABILITY_NAMED_IAM

aws cloudformation deploy --region $REGION \
  --stack-name kc-database-prod --template-file cfn/02-database.yaml \
  --capabilities CAPABILITY_NAMED_IAM

aws cloudformation deploy --region $REGION \
  --stack-name kc-ecr-prod --template-file cfn/03-ecr.yaml \
  --capabilities CAPABILITY_NAMED_IAM

aws cloudformation deploy --region $REGION \
  --stack-name kc-alb-dns-prod --template-file cfn/04-alb-dns.yaml \
  --parameter-overrides HostedZoneId=$ZONE_ID HostedZoneName=$ZONE_NAME \
  --capabilities CAPABILITY_NAMED_IAM

# 构建首版镜像并推 ECR（04 完成后就可以并行开工）
bash docker/build-and-push.sh v1.0.0 prod

aws cloudformation deploy --region $REGION \
  --stack-name kc-ecs-prod --template-file cfn/05-ecs.yaml \
  --parameter-overrides KeycloakHostname=sso.$ZONE_NAME \
  --capabilities CAPABILITY_NAMED_IAM
```

全部栈 CREATE\_COMPLETE 后，在 https://sso.<你的域名>/admin 用 Secrets Manager 里 prod/kc/admin 保存的 admin 账号登录，确认 master realm 可用。

## **5\. 集成与验证**

**开始前：修改脚本顶部的占位变量**

仓库里 scripts/ 下三个脚本（integrate.sh / create-user.sh / configure-ip-flow.sh）顶部硬编码了几个示例值，实际跑之前请按下表改成客户环境的真实值：

脚本

变量

当前示例值

改成

三个脚本都有

KC\_URL

https://sso.example.com

https://sso.<你的域名>

integrate.sh

INSTANCE\_ARN

arn:aws:sso:::instance/ssoins-xxxxxxxxxxxxxxxx

从 IdC console → Settings 拿

integrate.sh / create-user.sh

IDENTITY\_STORE\_ID

d-xxxxxxxxxx

从 IdC console → Settings 拿

configure-ip-flow.sh

DEFAULT\_IPS

203.0.113.10/32

客户办公网出口 /32（也可通过命令行参数覆盖）

Keycloak admin 密码和 DB 密码不需要改——脚本运行时从 [AWS Secrets Manager](https://aws.amazon.com/cn/secrets-manager/) 的 prod/kc/admin 里自动读。

如果 IdC 不在 us-east-1，还要把三个脚本顶部的 IDC\_REGION=”us-east-1″ 也改成对应区域。

### 5.1 在 Keycloak 里建 kiro-idp Realm

仓库里提供了一份已经调好的 realm 模板 kiro-idp-realm-import.json，直接 POST 给 Keycloak Admin API 就能一键建好：

```
KC_URL="https://sso.example.com"
ADMIN_USER=admin
ADMIN_PASS=$(aws secretsmanager get-secret-value --region eu-central-1 \
  --secret-id prod/kc/admin --query SecretString --output text \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['password'])")

TOKEN=$(curl -sf -X POST "${KC_URL}/realms/master/protocol/openid-connect/token" \
  --data-urlencode "username=${ADMIN_USER}" \
  --data-urlencode "password=${ADMIN_PASS}" \
  --data-urlencode "grant_type=password" \
  --data-urlencode "client_id=admin-cli" \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")

curl -X POST "${KC_URL}/admin/realms" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  --data-binary @kiro-idp-realm-import.json
```

也可以用 admin console：左上角 realm 下拉 → Create Realm → Resource file 上传同一份 JSON。

这份模板里关键 realm 级开关：

项

值

原因

bruteForceProtected

true

开启 30 次失败锁定

ssoSessionIdleTimeout

1800 s

30 分钟空闲登出

ssoSessionMaxLifespan

36000 s

10 小时强制重登

sslRequired

none

Keycloak 看到的是 ALB 转发过来的 HTTP；TLS 已在 ALB 终结

realm 建好后，紧接着把应用层 IP 白名单也绑上——scripts/configure-ip-flow.sh 会克隆内置的 browser flow 成 ip-restricted-browser，在其中插入 IP Check execution，并把它设成 realm 的 browserFlow：

```
bash scripts/configure-ip-flow.sh "203.0.113.10/32[示例]"
```

IP Check Authenticator 来自镜像里打包的自研 SPI（docker/providers/ip-check-authenticator.jar），Keycloak 启动时自动加载。完成后，非白名单 IP 连登录表单都看不到（见 6.2 节截图）。

### 5.2 在 IdC 配置外部 IdP

在 IdC console → Settings → Identity source，切换到 “External identity provider”，上传 Keycloak 的 IdP metadata：

```
curl -sf https://sso.example.com/realms/kiro-idp/protocol/saml/descriptor \
  > saml-metadata.xml
```

完成后 AWS 会返回两个 URL（记下来下一步要用）：

*   ACS URL：https://us-east-1.signin.aws.amazon.com/platform/saml/acs/<id>
*   Issuer URL：https://us-east-1.signin.aws.amazon.com/platform/saml/d-xxxxxxxxxx

### 5.3 在 Keycloak 里建 SAML Client（scripts/integrate.sh）

用脚本一次性创建，核心参数：

```
bash scripts/integrate.sh \
  "https://us-east-1.signin.aws.amazon.com/platform/saml/acs/xxxxxxxx" \
  "https://us-east-1.signin.aws.amazon.com/platform/saml/d-xxxxxxxxxx"
```

脚本内关键字段：

属性

值

clientId

等于 IdC Issuer URL（不是任意字符串）

saml\_name\_id\_format

urn:oasis:names:tc:SAML:2.0:nameid-format:emailAddress（完整 URN）

saml\_force\_name\_id\_format

false

saml.assertion.signature

true

saml.force.post.binding

true

redirectUris

单条，精确等于 ACS URL

protocolMappers

email + email-nameid 两枚，不能省

protocolMappers 两枚 mapper 的含义：

1.  email：把 Keycloak 用户的 email 属性写进 SAML Attribute email；
2.  email-nameid：再把 email 写进 NameID（OID urn:oid:0.9.2342.19200300.100.1.3）。

### 5.4 建用户（scripts/create-user.sh）

```
bash scripts/create-user.sh alice '<strong-password>' \
  alice@example.com alice doe
```

脚本做 3 件事：

1.  Keycloak kiro-idp realm 建用户，username=alice，email=alice@example.com；
2.  AWS IdC Identity Store 建用户，UserName 必须等于 Keycloak 发出的 SAML NameID 值。因为我们 NameID 用的是 email，所以这里 UserName 也填 email；
3.  把 IdC 用户加入 kiro-group。

### 5.5 Kiro IDE/CLI 登录验证

```
kiro-cli login --license pro \
  --identity-provider https://d-xxxxxxxxxx.awsapps.com/start \
  --region us-east-1
```

出现设备码后，在白名单 IP 浏览器里打开提示的 URL，跳转到 Keycloak 输入账号密码，回到 IdC 看到 AWS 账号列表——Kiro IDE/CLI 侧同步显示登录成功。

## **6\. 效果呈现**

### 6.1 Kiro IDE 登录成功

Kiro IDE 内触发登录，SAML 链路在 Keycloak 完成账号密码验证后回到 IdC，Kiro IDE 主界面进入已登录状态（右下角显示 Kiro Pro 0 / 1000），可以直接开始 Vibe / Spec 会话。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/22/based-on-amazon-ecs-fargate-keycloak-aws-iam-identity-center-2.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/22/based-on-amazon-ecs-fargate-keycloak-aws-iam-identity-center-2.png)

\[图2\]

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/22/based-on-amazon-ecs-fargate-keycloak-aws-iam-identity-center-3.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/22/based-on-amazon-ecs-fargate-keycloak-aws-iam-identity-center-3.png)

\[图3\]

### 6.2 应用层 IP 白名单拦截效果

从非白名单 IP 访问登录页时，5.1 节绑上的 ip-restricted-browser flow 会在表单加载前直接返回拒绝页，提示 Access denied: your IP xx.xx.xx.xx is not in the allowed list，用户连输密码的机会都没有。相比 ALB 安全组的网络层限制，这一层发生在应用层，可以按 realm / flow 差异化配置，失败事件也会进 Keycloak 审计日志便于排障。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/22/based-on-amazon-ecs-fargate-keycloak-aws-iam-identity-center-4.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/22/based-on-amazon-ecs-fargate-keycloak-aws-iam-identity-center-4.png)

\[图4\]

## **7\. 总结**

指标

结果

最终稳定通路

Kiro IDE/CLI → IdC → Keycloak → Aurora，调通后连续多次验证均成功

登录侧防护

ALB 安全组网络层白名单 + Keycloak ip-restricted-browser flow 应用层校验，形成纵深防御

### 7.1 月度成本粗估

eu-central-1 按需价，单 task + db.t4g.medium，不含数据传输费用。

组件

月费

Fargate（2 vCPU / 4 GB）

~$83

Aurora PostgreSQL（含存储/备份）

~$62

Interface VPC Endpoints × 6

~$57

NAT Gateway

~$38

Application Load Balancer

~$22

其它（Secrets / KMS / CloudWatch / ECR）

~$6

合计

~$268

几个值得记住的点：

*   Keycloak 26 管理面与数据面端口拆开（9000 vs 8080），ALB TG 健康检查要落在 8080 的业务路径上；
*   Keycloak SAML Client 必须显式建 protocolMappers（email + email-nameid 两枚），光靠内部 fallback 时，不同 SP 的校验严格程度不一致，浏览器能跑不代表所有客户端都能跑；
*   IdC 的 ACS / Issuer URL 以实际返回值为准，切换 Identity source 时要回到 Keycloak 同步 redirectUris 和 saml\_assertion\_consumer\_url\_post。

后续计划：

1.  用户生命周期自动化：当前 create-user.sh 手工双写 Keycloak 和 IdC Identity Store，规模化后无法维护。接入 Keycloak User Federation 对接企业 AD/LDAP 把用户源头统一；或让 IdC 通过 SCIM 从 Keycloak 拉用户，消掉手工双写；入职/离职工单触发 API 自动开通回收。
2.  高可用：Fargate 扩到 2-3 个 task 跨 AZ，Interface VPCE 同步铺到三 AZ，让已经预埋的 Infinispan JDBC-PING 集群能力真正跑起来。

**➡️ 下一步行动：**

**相关产品：**

*   [Amazon IAM](https://aws.amazon.com/cn/iam/?p=bl_pr_iam_l=1) — 身份管理和访问权限
*   [Amazon Aurora](https://aws.amazon.com/cn/rds/aurora/?p=bl_pr_aurora_l=2) — 适用于 PostgreSQL、MySQL 和 DSQL 的无服务器关系数据库服务
*   [Amazon Fargate](https://aws.amazon.com/cn/fargate/?p=bl_pr_fargate_l=3) — 适用于容器的无服务器计算
*   [Amazon Secrets Manager](https://aws.amazon.com/cn/secrets-manager/?p=bl_pr_secrets-manager_l=4) — 密钥管理
*   [Amazon ECS](https://aws.amazon.com/cn/ecs/?p=bl_pr_ecs_l=5) — 完全托管的容器编排服务

**相关文章：**

*   [用 Kiro Skill 打造你的专属 AI 工作流：以会议纪要自动生成为例](https://aws.amazon.com/cn/blogs/china/kiro-skill-build-custom-ai-workflow-meeting-minutes-auto-generate/?p=bl_ar_l=1)
*   [一种基于Web访问的Kiro CLI 共享访问实现](https://aws.amazon.com/cn/blogs/china/based-on-web-kiro-cli-share-implement/?p=bl_ar_l=2)
*   [当 Kiro 遇上 OpenClaw：AI Agent 双向协作的实践探索](https://aws.amazon.com/cn/blogs/china/kiro-openclaw-ai-agent-practice-explore/?p=bl_ar_l=3)
*   [用 Kiro CLI 自动搭建 FluentBit 日志采集方案：两种 EKS 埋点数据落地 S3 Parquet 的实战对比](https://aws.amazon.com/cn/blogs/china/kiro-cli-fluentbit-logging-solution-eks-s3-parquet-comparison/?p=bl_ar_l=4)
*   [用 Kiro构建 AI：基于 AWS 基础设施快速构建企业级 Agentic AI 平台](https://aws.amazon.com/cn/blogs/china/building-enterprise-agentic-ai-with-kiro-on-aws/?p=bl_ar_l=5)

## **8\. 环境清理**

按栈逆序删除：

```
aws cloudformation delete-stack --stack-name kc-ecs-prod       --region eu-central-1
aws cloudformation delete-stack --stack-name kc-alb-dns-prod   --region eu-central-1
aws cloudformation delete-stack --stack-name kc-ecr-prod       --region eu-central-1
aws cloudformation delete-stack --stack-name kc-database-prod  --region eu-central-1
aws cloudformation delete-stack --stack-name kc-network-prod   --region eu-central-1
```

另需手动清理：

*   ECR 仓库里的镜像（栈带 Retain，删栈不会清）；
*   Secrets Manager 里 prod/kc/db 和 prod/kc/admin 会进入 7 天 pending deletion，急用可加 –force-delete-without-recovery；
*   KMS CMK 也是 7 天 pending，同上；
*   Route53 hosted zone 中的 sso.example.com A-alias 记录；
*   IdC console 里把 Identity source 切回 “Identity Center directory”；
*   Identity Store 中删除测试用户和 kiro-group。

## **9\. 参考链接**

1.  [Keycloak 26 Server Administration Guide](https://www.keycloak.org/docs/26.2.4/server_admin/)
2.  [AWS IAM Identity Center External IdP](https://docs.aws.amazon.com/singlesignon/latest/userguide/external-idps.html)
3.  [ECS Fargate with Secrets Manager](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/specifying-sensitive-data-secrets.html)
4.  [Aurora PostgreSQL 15](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraPostgreSQLReleaseNotes/)
5.  [keycloak-config-cli](https://github.com/adorsys/keycloak-config-cli)

## 本篇作者

* * *

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/summit-tag3.png)

## 亚马逊云科技中国峰会

聚焦 AI Agent 的构建与部署实践，现场体验企业级 AI 应用的开发流程。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/summit-button4.png)](https://aws.amazon.com/cn/events/summits/shanghai/?ectrk=jyLXNovBYB51qgzUEipIpZcxlfE5%2Bs7NfDTnZwR7hFYtQmPUSToTuN%2FZO5doh20ZJ%2FloW6Rom0l3P4LLcoyUPA%3D%3D&sc_icampaign=glb-summit-blog-p1&sc_ichannel=ha&sc_iplace=blog&trk=ab30be54-aedd-480a-9364-ab0bf98e982d)

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/14/2026_Summits_Commercial_Banner_1440x657.png)
