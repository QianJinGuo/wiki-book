# Device Code Phishing Forensics: What We Learned from BEC Investigations in the Wild

> 📊 Level ⭐⭐⭐ | 8.0KB

## 摘要

本文来自一线 BEC（Business Email Compromise）调查复盘：攻击者正规模化滥用 OAuth 2.0 Device Authorization Grant（RFC 8628，device code flow），把钓鱼从"伪造假登录页"升级为"诱导受害者在真实 Microsoft 登录页上替攻击者设备授权"。域名、登录页与 MFA 提示全部为真，传统钓鱼检测几乎失效；取证也更难——攻击者与用户共享同一 session ID。

## 核心要点

- device code flow 本是服务于无浏览器环境的登录方式（视频会议终端、Azcopy、Azure CLI），攻击者反用其设计：诱导受害者把攻击者生成的短码输入 `microsoft.com/devicelogin`，等于替攻击者放行。
- 手法并不新（Dirk-jan Mollema 早有 Entra PRT 钓鱼研究），新的是规模化：某客户单日出现四起报告，此后持续上升。
- 取证难点：device code 登录中攻击者与用户共用 session ID，无法按 ID 切分 Unified Audit Log（UAL）；出路是 linkable token identifier（每个 access token 唯一）加上 Entra 的 non-interactive sign-in logs。
- 攻击者偏爱 FOCI 家族的 "Microsoft Office"（refresh token 可兑换 M365 生态几乎任意应用）与 "Microsoft Authentication Broker"（可注册设备换取 PRT，跨应用有效且存活于 session revocation 之后）。
- 防御细节：Conditional Access 的 device code flow block 必须作用于 "All resources"，否则 Auth Broker 可绕过；拦截点前移至投递短码的社工页（静态页、SPA kit、AES-GCM 加密 loader）。

## 深度分析

### device code flow 为什么天生可被滥用

攻击者脚本先以某应用身份向 Microsoft 申请 `device_code` 与 `user_code`，再在后台轮询 token endpoint；受害者被诱导拿短码去真实的 `microsoft.com/devicelogin` 输入并完成认证（含被要求的 MFA），认证成立后攻击者的轮询即拿到 access token 与 refresh token。问题不在协议有漏洞，而在于它把信任建立在"人的意图"而非密码学绑定上：链路中没有任何环节把"输入短码的人"与"发起请求的设备"绑定，而页面显示的应用名（如 "Microsoft Azure CLI"）又足够可信。合法长尾很长（终端开发者、打印机、Dynamics 365 等），检测只能从"存在即可疑"退回"哪些组合不合理"。

### 攻击者 tradecraft：从 AitM 到加密 loader

上一代 Adversary-in-the-Middle（AitM）代理需伪造登录页并代理真实认证，因而留下稳定痕迹——仿冒域名、错误 action URL、品牌与 host 不匹配。device code phishing 在攻击时刻几乎没有这类信号：登录真实、域名真实、MFA 提示真实；唯一观察面是投递短码的社工页（案例中仿冒 Docusign、OneDrive），而现代 kit 把它做成单页应用、运行时才向 Microsoft 拉码，扫描器初次加载时页面近乎空白。

对抗进一步升级为 EvilTokens：钓鱼 UI 被封进 AES-GCM 加密 blob，由 loader 运行时解密后用 `document.write` 与 `TextDecoder` 写入页面，静态签名扫描无从下手。检测因此改为匹配 loader（`crypto.subtle.decrypt` + AES-GCM + `document.write`），且须赶在解密前动作——`document.write` 一执行，原有依赖的 `MutationObserver` 会随文档重写而失效。

### MFA 为什么挡不住：被劫持的是 token 而非认证

最易被误读的一点：MFA 没有被绕过，而是被受害者本人在真实提示上正常完成了。该攻击打的是认证之后的产物——把已过 MFA 的 refresh token 转移到攻击者手中，因此"全员开启 MFA"完全无法阻断它。

危害被两件事放大：诱饵应用若属 FOCI（Family of Client IDs），refresh token 可兑换到 M365 生态几乎任意应用；若用 Microsoft Authentication Broker，攻击者能注册设备换取 PRT，对全应用有效且存活于 session revocation 之后，唯有删除该设备才能作废。这也是封堵必须覆盖 "All resources" 的原因。

### 取证方法：UAL + non-interactive 日志与 linkable token identifier

BEC 后段的默认动作是拉 UAL，再从中区分真实用户与攻击者。常规场景并不难：每台新设备登录分配新 session ID，按 ID 过滤即可切出攻击者活动。device code 打破了这个前提——会话 ID 在双方之间共享，必须换成"凭据级"追踪。

出路是 linkable token identifier：Entra 为每个 access token 签发唯一标识，而 UAL 只记录交互式登录，故须另导出 non-interactive sign-in logs 枚举。顺利时直接筛 `originalTransferMethod == "deviceCodeFlow"`，取其 unique token identifier 过滤 UAL，即得到攻击者的 Exchange 活动视图；若用户本身合法使用 device code，则借助 IP 或 user-agent 摘出签发给攻击者的 token。

## 实践启示

1. **先审计再封堵**：在 Entra UI "Monitoring & health > Sign-in logs" 按 Authentication Protocol = Device Code 拉一个月历史，确认哪些账号在用，再决定迁移登录方式、加排除项或只放行公司出口 IP。
2. **Conditional Access 阻断 device code flow**：条件选 `Conditions > Authentication flows > Device code flow`、动作 `Block access`，范围先覆盖 All users / All resources / All network locations 再逐项加白；**资源必须选 "All resources"**，否则 Auth Broker 路径可绕过，上线前确认不会把自己锁在门外。
3. **Sentinel 登录侧检测**：`SigninLogs` 筛 `ResultType == 0` 且 `AuthenticationProtocol == "deviceCode"`；命中 FOCI 的 Microsoft Office（`d3590ed6-52b3-4102-aeff-aad2292ab01c`）或 Auth Broker 搭配 `Microsoft Graph` 资源，再用 `NetworkLocationDetails` 剔除 trustedNamedLocation。
4. **设备注册检测**：`AuditLogs` 筛 `OperationName == "Register device"`，取 `TargetResources` 中 type 为 `Device` 的 displayName，匹配 `^DESKTOP-[0-9A-F]{6,8}$`（Windows 默认是 7 位字母数字）。
5. **IR 检查清单**：同时导出 UAL 与 non-interactive sign-in logs；以 linkable/unique token identifier 而非 session ID 切分活动；交叉核对 `originalTransferMethod`、IP、user-agent；发现攻击者注册的设备先删设备作废 PRT 再做 session revocation。
6. **前移拦截并持续迭代**：钓鱼框架会不断更换 AppId、设备命名与目标资源，检测规则需定期更新；同时在浏览器侧拦截 device code 投递页，把防线放在短码输入之前。

## 相关实体

- [AI 钓鱼攻击正在上升](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-phishing-attacks-are-on-the-rise-are-you-prepared-bitward.md)
- [Amazon Bedrock 如何捕获 AI 钓鱼](https://github.com/QianJinGuo/wiki-public/blob/main/entities/how-amazon-bedrock-catches-ai-generated-phishing.md)
- [基于身份行为的 ITDR 方案](https://github.com/QianJinGuo/wiki-public/blob/main/entities/identity-behavior-context-itdr-solution.md)
- [白宫联邦身份安全与 AI](https://github.com/QianJinGuo/wiki-public/blob/main/entities/white-house-federal-identity-security-ai.md)
- [Agent 安全威胁模型](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-threat-models.md)
- [网络安全与隐私 MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/cybersecurity-privacy.md)

→ [原文存档](https://research.eye.security/device-code-phishing-forensics/)

---

