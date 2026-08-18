# CloudSecTidbits：云安全研究摘要

## Ch11.114 CloudSecTidbits：云安全研究摘要

> 📊 Level ⭐⭐ | 9.8KB | `entities/cloudsectidbits.md`

# CloudSecTidbits：云安全研究摘要

## 摘要
CloudSecTidbits 是 Doyensec 的云安全研究系列，专门呈现「Web 技术与云技术不安全组合」产生的漏洞，每期附赠可一键部署的 IaC 实验环境。本条目对应 Tidbit No. 4「The Danger of Multi-SSO User Pools」（2026-05-05，Francesco Lacerenza 与 Mohamed Ouad，曾于首届 DEFCON Singapore DemoLabs 展示）：在多租户 AWS Cognito User Pool 场景下，攻击者以恶意 IdP 身份接入，绕过平台依托 Lambda trigger 构建的全部身份约束，实现 ghost identity 注入、解析差异提权与 IdP 路由劫持——这正是「Masso」所代表的 Cognito SSO 认证绕过。

## 核心要点
- **漏洞场景是 SaaS 多租户默认形态**：一个 User Pool 注册多个外部 IdP（OIDC 与 SAML），每个租户自带 IdP，经 `CreateIdentityProvider` API 注册，通过 hosted UI 或自定义登录页暴露。
- **信任链断裂点在 trigger 编排**：`PreSignUp_ExternalProvider` 是用户记录落库前唯一的 gate；一旦未做检查，后续 `PostConfirmation`/`PreAuthentication` 只能「事后拦截」，无法阻止身份对象已存在的事实。
- **攻击核心原语是恶意 IdP**：攻击者注册自控 OIDC 服务器（Doyensec 开源了 weaponized IdP —— [maSSO](https://github.com/doyensec/masso)，支持 OIDC/SAML 2.0/SCIM），可任意伪造 email、sub 等 claims，向 Cognito 注入完全受控的身份数据。
- **三条典型 anti-pattern**：JIT ghost identity 注入（落库后无自动回滚）、triggerSource 分支遗漏（首登与后续登录链只共享 TokenGeneration trigger）、基于 `<ProviderName>_<sub>` 的解析差异攻击（含 homoglyph ProviderName 碰撞）。
- **IdP 路由劫持**：Cognito 按 email domain 做 IdP 路由但不校验域名所有权；租户未注册的 identifier 可被抢占，例如劫持 `gmail.com` 后所有 Google 用户都会被重定向到攻击者页面。
- **影响远超登录本身**：ghost identity 可用于强制密码重置以换取非 SSO 认证能力、冒充用户获取直接会话，是身份层的系统性失守而非单个端点 bug。
- **可复现性**：Doyensec 提供 Terraform IaC lab（`doyensec/cloudsec-tidbits/tree/main/lab-masso`），配合 maSSO 即可完整复现攻击链。

## 深度分析
### 1. Masso 漏洞机理：多 SSO 改写了身份信任边界
多租户多 SSO 不是「多加几个 IdP」，而是系统性改变三个底层事实：哪些 trigger 会触发、应用把什么当作身份主键、有多少攻击者可控字符串被当作结构去解析。Cognito 对 federated user 的内部身份键是 `<ProviderName>_<sub>`（即 trigger 中的 `event.userName` 与 token 中的 `cognito:username`），ProviderName 是池内注册的 IdP 名称，sub 完全由 IdP 控制；且 ProviderName 正则禁止 `_`，sub 不受限，身份字符串中可以出现多个下划线。另一个不对称在 trigger 链条：首次 federated sign-in 与后续登录只在 TokenGeneration trigger 上重合，任何只放在一条链上的认证约束都可能被另一条链完整绕过；federated sign-in 也不会触发 custom auth challenge、migrate user、custom message 等 trigger，「所有登录都走同一套检查」是常见错误假设。

### 2. 攻击链推演：从恶意 IdP 到身份接管
攻击链分三步。**JIT ghost identity 注入**：通过自助 SSO 配置页注册恶意 IdP（EvilCorp），用 `attacker@company.com` 发起 federation；`PreSignUp_ExternalProvider` 未含 domain 检查则 Cognito 持久化用户记录，随后 `PostConfirmation` 的 domain 检查抛错、会话被阻断，但记录已留下——平台即使有回滚机制，也存在可操作窗口：强制密码重置换取非 SSO 认证能力，或冒充用户获取直接会话。**Sub-Splitting 解析差异提权**：恶意 IdP 发送 `sub = EVIL_noise_internal@company.com`，唯一性守卫用 `split("_")[1]` 读到 "noise"（放行），JIT provisioning 消费方用 `split("_")[-1]` 读到 "internal@company.com" 并写入 `custom:primaryEmail`——同一输入在守卫与消费者眼中是两个值；ProviderName 还允许同形碰撞（`LegitCorp` 与含西里尔字母 е 的 `LеgitCorp` 可同池共存）。**IdP 路由劫持**：控制一个 IdpIdentifier 即控制该 domain 所有用户的初始重定向，平台若在租户确认 domain 所有权前允许抢占 identifier，就能把未认领域名（如 gmail.com）的用户导向攻击者页面。

### 3. 对身份架构与 Zero Trust 的冲击
核心教训是「不要信任 IdP」：一旦平台信任外部 IdP 传来的属性，`AttributeMapping` 中任何字段都攻击者可控，且 `WriteAttributes` 白名单可被 JIT Lambda 的 `AdminUpdateUserAttributes` 绕过——权限模型锁得再死，也挡不住身份属性层的注入。Zero Trust 的「永不信任、始终验证」以身份层自身可信为前提，本漏洞证明：当 IdP 注册、属性映射、路由决策都建立在平台自建逻辑上时，身份边界本身可被租户侧的恶意 IdP 击穿。这与 [AgentCore Identity 的 3-legged OAuth + Session Binding 架构](ch11/271-aws-bedrock-agentcore.html)形成对照：前者把安全寄托于「属性映射正确」，后者寄托于「每次会话最小权限 + 会话绑定 + 可撤销」，后者对 IdP 侧注入的鲁棒性明显更强。对任何以 Cognito/Okta/Auth0 为信任根的架构，IdP 层都应获得与应用层同等甚至更高的威胁建模与红队投入。

### 4. 防御要点：把安全门放回 trigger 编排
防御收敛为一条主线——**在 PreSignUp 放置安全门并按 triggerSource 分支**，这是多 SSO 部署中收益最高的单点变更：对 `PreSignUp_SignUp`、`PreSignUp_ExternalProvider`、`PreSignUp_AdminCreateUser` 统一执行 email domain 策略。配套要求：绝不按位置索引 `split("_")` 解析 `event.userName`，必须解析则全链路统一 `split("_", 1)`（守卫与消费者用完全相同的提取逻辑）；安全敏感 custom attribute（如 `custom:tenantID`、`custom:role`、`custom:isAdmin`）不进 AttributeMapping，由 trigger 从已验证 email domain 服务端派生；PreSignUp 严格校验 email；IdpIdentifiers 不作为自助注册的自由表单字段，IaC 原子化注册（禁止先删后加）。审计 checklist：池中是否注册外部 IdP、AttributeMapping 是否含攻击者可控字段、PreSignUp 是否覆盖 `_ExternalProvider` 与 `_AdminCreateUser` 分支、JIT 与后续登录两条 trigger 链是否都被覆盖、是否有人按位置索引解析 `cognito:username`、IdpIdentifiers 是否被自助暴露。

## 实践启示
1. **PreSignUp 按 triggerSource 分支构建统一安全门**：对 `PreSignUp_SignUp`、`PreSignUp_ExternalProvider`、`PreSignUp_AdminCreateUser` 执行同一份 domain policy，这是抵御 ghost identity 注入的最有效单点修复。
2. **统一身份键解析，禁止位置索引**：审查所有读取 `event.userName`/`cognito:username` 的 Lambda，任何 `split("_")[n]` 都是 parser differential 漏洞；全链路改用 `split("_", 1)`，守卫与消费者逻辑保持一致。
3. **安全敏感属性移出 AttributeMapping**：`custom:tenantID`、`custom:role`、`custom:isAdmin` 一律不进映射，由 JIT trigger 从已验证 email domain 服务端派生；记住 `WriteAttributes` 挡不住 `AdminUpdateUserAttributes`。
4. **IdpIdentifiers 绝不开放自助抢占**：租户确认 domain 所有权后才允许 claim identifier；IaC 原子化注册，杜绝「先 drop 再 add」的窗口期。
5. **两条 trigger 链都要覆盖**：首次 federated 登录与后续登录只在 TokenGeneration 上重合，且 `TokenGeneration_Authentication` 与 `TokenGeneration_HostedAuth` 是两个不同 source——检查逻辑不能只放一条链，审计时逐个 triggerSource 核对。
6. **用 maSSO 主动验证**：将 weaponized IdP（maSSO）与 `lab-masso` Terraform 环境纳入多租户身份架构的回归测试，把「恶意 IdP 注入、homoglyph ProviderName、sub-splitting」变成可重复的测试用例。

## 相关实体
- [AgentCore Identity: 3-legged OAuth + Session Binding 的安全架构](ch11/271-aws-bedrock-agentcore.html)
- [AWS IDP Accelerator](ch11/308-aws-idp-accelerator.html)
- [Secure AI agents with Policy and Lambda interceptors in Amazon Bedrock](../ch04/670-ai-agent.html)
- [AWS Continuum：机器速度的安全自动化](../ch01/433-aws.html)
- [基于 Prowler 与 GenAI 构建金融行业智能合规中枢](ch11/064-prowler-genai.html)
- [别让你的 Amazon Bedrock 模型为他人打工——API 调用安全防护指南](../ch12/036-amazon-bedrock-api.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/cloudsectidbits-masso-cognito-sso.html.md)

---

