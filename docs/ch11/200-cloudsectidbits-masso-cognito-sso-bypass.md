# CloudSectiDbits: Masso - Cognito SSO Bypass

## Ch11.200 CloudSectiDbits: Masso - Cognito SSO Bypass

> 📊 Level ⭐⭐ | 6.0KB | `entities/cloudsectidbits-masso-cognito-sso.html.md`

## 深度分析

**多租户Cognito User Pool的组合风险远超预期。** Doyensec团队在新加坡DEFCON DemoLabs分享的研究揭示了一个正在成为SaaS默认部署模式的架构：一个User Pool支撑多租户，每个租户自带外部IdP。这种组合将OIDC/SAML外部身份提供商注册、Cognito托管UI（或自定义登录页）、Lambda触发器链三个技术层叠加在一起，任何一层的配置疏漏都会在整个认证流程中产生连锁反应 。

**PreSignUp_ExternalProvider是唯一的用户创建前安全闸门。** 在Cognito的众多触发器中，PreSignUp_ExternalProvider是唯一在用户记录被持久化之前执行的钩子。一旦攻击者在PreSignUp窗口内完成身份注入，即使后续的PostConfirmation等触发器检测到异常并阻断会话，用户记录本身已存在于User Pool中，攻击者仍可通过强制密码重置等路径获得非SSO认证能力。联邦登录不会触发migrate user、custom message、custom sender等触发器，进一步缩小了异常检测的覆盖范围 。

**triggerSource分支遗漏是Multi-SSO审计中最常见的致命错误。** Cognito通过event.triggerSource区分不同的认证路径（PreSignUp_SignUp、PreSignUp_ExternalProvider、PreSignUp_AdminCreateUser、PreAuthentication等），但开发者往往只对PreSignUp_SignUp进行域名检查，而遗漏了PreSignUp_ExternalProvider和PreSignUp_AdminCreateUser分支，导致幽灵身份（Ghost Identity）可在第一个登录环节绕过检查被持久化。同样，PreAuthentication只在后续登录触发，首次联邦登录不会经过它——把身份校验逻辑只放在PreAuthentication等于对首次登录毫无保护 。

**Sub-Splitting攻击：attacker-controlled字符串的结构化解析陷阱。** Cognito对联邦用户内部身份Key格式为`<ProviderName>_<sub>`，ProviderName受正则约束不含下划线，但sub字段完全由IdP（攻击者）控制。开发者如果用`split("_")`的不同索引位置在守卫（guard）和消费者（consumer）之间解析同一字符串，会产生 Parser Differential：例如`sub.split("_")[1]`在PreSignup中检查第二个token是否在池中，而`sub.split("_")[-1]`在JIT Provisioning Lambda中存储为自定义邮箱，两者对`EVIL_noise_internal@company.com`的解析结果完全不同，可造成权限提升或身份混淆 。

**IdP标识符劫持是域名接管在身份层的镜像攻击。** 当租户未注册或删除某个域名标识符时（如`gmail.com`），攻击者可利用自定义IdP配置抢先注册该标识符，将所有使用该域名的用户重定向到攻击者控制的IdP。Doyensec特别指出AWS Cognito本身不验证域名所有权，平台必须在IdP注册流程中强制进行域名归属确认，否则后果是全量用户的认证路由被劫持到恶意页面 。

## 实践启示

**在PreSignUp中按triggerSource分支实施精确的安全校验。** 将域名策略（enforce_domain_policy）部署在`PreSignUp_SignUp`、`PreSignUp_ExternalProvider`、`PreSignUp_AdminCreateUser`三个分支都覆盖的代码路径中，确保每次用户创建尝试都经过同一套校验逻辑，不可遗漏任何一个triggerSource 。

**统一`split("_", 1)`的最大分割次数，消除所有索引位置的parser差异。** 如果业务逻辑必须从event.userName解析身份，必须在守卫和消费者两侧使用完全相同的提取方式——即始终传入`maxsplit=1`的split调用，且避免使用位置索引。attacker-controlled的sub字段中的下划线数量是不可预测的，任何依赖位置的解析都是潜在漏洞点 。

**IdpIdentifiers自服务注册必须前置域名所有权验证。** 在多租户平台中，IdP标识符字段（如`email-domain`路由键）不可作为自由文本框暴露给用户自行填写；IaC配置中也应原子性注册，禁止"先删除后添加"的操作序列，防止竞争窗口被利用 。

**对安全敏感的custom属性（如tenantID、role、isAdmin）严禁写入AttributeMapping。** JIT Provisioning Lambda若需要派生这些字段，必须在PreSignUp触发器内部基于验证过的邮箱域名服务器端生成，而非从IdP提供的claims中读取。即使WriteAttributes锁死，AdminUpdateUserAttributes仍可在Lambda中被调用——防御深度需要从映射层延伸到触发器内部逻辑 。

**使用maSSO进行Cognito多租户平台的OIDC/SAML入站测试。** Doyensec开源的maSSO工具（doyensec/maSSO）可模拟恶意IdP向目标SP发送可控的OIDC code flow、SAML断言和/userinfo响应，是发现本文所述各类攻击面的标准化测试工具。建议在CI/CD流程中集成基于maSSO的模糊测试用例，覆盖triggerSource分支和sub字段注入场景 。

## 相关实体
- [Aws Transform Ezconvertbi Bi Migration](ch11/203-aws-transform-ezconvertbi-bi-migration.html)
- [Amazon Cloudfront Deploy Guide Cloudfront Domain Multi Tenant Architecture](../ch05/086-ai.html)
- [Amazon Bedrock Api Security Guide](../ch12/034-amazon-bedrock-api.html)
- [Building A Secure Auth Code Flow Setup Using Agentcore Gatew](../ch04/276-building-a-secure-auth-code-flow-setup-using-agentcore-gatew.html)
- [Based On Prowler Genai Build Fintech Intelligent Compliance 2](ch11/054-prowler-genai.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/cloudsectidbits-masso-cognito-sso.html.md)
-

---

