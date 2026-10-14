# Ghosts of Encryption Past – How we Read All Your Emails in Salesforce Marketing Cloud › Searchlight Cyber

> 📊 Level ⭐⭐⭐ | 9.7KB

## 摘要
Searchlight Cyber（Assetnote 团队）披露了 Salesforce Marketing Cloud（前身 ExactTarget）的一组严重缺陷：攻击者可借 AMPScript/SSJS 模板注入读取租户内的全部订阅者数据，并利用邮件查看链接中"经典格式"加密查询串（`qs`）的 CBC 填充预言机漏洞完成解密与再加密，从而伪造查看链接、跨租户读取平台上历史上发送过的所有邮件。根因是平台长期依赖**单一静态共享密钥**与**未认证的加密模式**——"加密"在架构上只是参数混淆与传输层保护，而非内容级端到端加密。Salesforce 于 2026 年 1 月完成修复并分配 CVE-2026-22582/22583/22585/22586/2298。

## 深度分析
这项研究（2026 年 1 月 16 日报告，1 月 24 日处置完毕）的价值不在单条利用链，而在于它把一套 SaaS 邮件平台近二十年层层累加的架构债务摊开：同一平台并存三种参数保护格式，"经典格式"的加密形同虚设、早期 XOR 格式只是固定密钥的混淆，唯一的现代方案（AES-GCM）直到 2026 年才全平台启用。它回答的是同一个问题："我们付费买到的加密，究竟保护了什么？"

### 两种"加密"的语义混淆：传输层 TLS vs 内容加密 S/MIME/PGP
研究区分了两种常见但互不等价的实现：传输层加密（TLS）只保护邮件在网络链路传输中的安全，抵达中转节点或托管平台后，内容即以明文或服务商可解的形式存在；内容加密（S/MIME、PGP）保护的是正文本身，只有持有对应私钥的收件人才能还原。
SFMC 的"加密"落在前者一侧。平台中真正被称为加密的是查看链接里的 `qs` 查询串——它承载 JobID、Business Unit、SubscriberID、ListID 等业务参数，目的是把这些字段对终端用户隐藏，而**不是**让内容对服务商隐藏。因此"支持加密"在营销云语境下几乎不构成机密性承诺，它描述的是参数混淆与链路保护。

### Salesforce Marketing Cloud / ExactTarget 的架构为何保留了解密能力
根因在共享架构与集中式加密服务。所有租户的 `view.*`、`pages.*` 域名都 CNAME 到同一套基础设施，域名不参与租户隔离——租户与邮件身份全部塞在 `qs` 密文里，把某个租户的 `qs` 复制到另一个域名同样能打开邮件，因此只要能操纵密文，就能读取任意租户的任意邮件。
更致命的是密钥模型：平台对所有客户使用**同一把静态密钥**，从未按租户派生，测试租户中用 `MicrositeURL` 生成或直接伪造的 `qs` 可原样在目标租户的 `ftaf.aspx` 上生效，服务商天然持有全局解密能力；平台还在每个租户默认开启"转发给朋友"，即使邮件里不露出链接它依然可达，成为稳定的读取出口。此外 AMPScript 的 `LookupRows` 可无限制查询 Data Views 系统表（`_Subscribers`、`_Sent`、`_Job`、`_Click` 等），租户数据在服务商侧以可被模板语言直接读取的形式存在，从另一个方向证明内容对平台始终可见。

### 密钥管理权归属（CMK/BYOK）作为判定标准
既然"是否支持加密"不足以判断机密性，可判定的问题就收缩为一个：**密钥归谁持有，服务商是否在架构上被排除在解密路径之外**。可拆成三层追问：密钥按租户派生还是全局共享（本次答案是后者，跨租户伪造才因此可行，也意味着一次泄露即全平台失效）；平台方自身能否解密——若内部工具、故障排查或数据导出通道持钥可解，机密性就只依赖合同而非密码学；以及是否提供客户管理密钥（CMK/BYOK），客户撤回密钥后服务商是否真正失去解密能力。只有第三层答案为"是"且经验证，"内容级加密"的说法才成立。

### 为什么叫 "Ghosts of Encryption Past"
标题指向历史遗留缺陷的持续性。ExactTarget 作为被收购并入 SFMC 的老技术，带着多年积累的攻击面进入新平台；那套只需 XOR 一段固定密钥（研究中应 Salesforce 要求隐去）加两字节校验和的"古代"格式，虽早已不再由系统生成，却对**全新租户依然可用**——它成了几乎一发命中、无需填充预言机的枚举接口。
历史行为的反复同样典型：邮件主题的二次求值在 2023 年曾被尝试移除，因客户依赖旧行为而回退，直到本次披露后才彻底关闭。密码学意义上的"幽灵"不因发布新版本而消失，只会因向后兼容被无限期保留；最终 Salesforce 以 AES-GCM 全面替换平台加密、作废 2026 年 1 月 23 日 21:00 UTC 之前生成的全部链接，才算斩断继承链。

### 合规背景（GDPR/CCPA）与企业审计视角
被跨租户暴露的是订阅者 PII 与历史邮件正文，直接触及 GDPR 的数据最小化、完整性与机密性原则，以及 CCPA 对个人信息的保护要求。企业作为数据控制者把数据交给作为处理者的营销云托管，却长期无法从技术上验证处理者是否真的"不能读取"——这是本次事件暴露的核心信任缺口。
审计清单上值得主张的包括：加密格式与密钥轮换策略是否可验证；历史链接与令牌是否有强制过期机制（本次修复才补上）；共享租户的隔离边界究竟由域名、密钥还是应用逻辑保证；以及修复窗口内的取证可见性。研究方与 Salesforce 均表示未确认实际未授权访问，但"无法证实被滥用"并不等于"可以不做评估"。

## 实践启示
1. **在评估邮件 SaaS 服务的安全合规性时，明确询问密钥管理架构**：要求供应商说明加密发生在传输层还是内容层、密钥是否按租户派生、平台方自身能否解密；若服务商保留解密能力，该加密只保护传输与混淆层，医疗、金融等敏感通信应选择客户自管理密钥的方案。
2. **把"服务商能否解密"写进采购清单与合同**：将密钥托管方式、轮换频率、撤回密钥后的行为、是否提供 CMK/BYOK 作为硬性条目，而不是安全问卷里一行可勾选的陈述。
3. **对已有 SaaS 邮件服务进行数据流审计**：梳理哪些系统与服务能触达邮件内容，把"仅用于故障排查"的技术访问路径纳入风险评估，并确认是否存在默认开启的旁路入口（如转发/分享类功能）。
4. **关注 Salesforce Marketing Cloud 的密钥管理选项更新**：若你是 SFMC 用户，跟进其是否提供客户自管理密钥（BYOK/CMK）能力，并确认在该能力下 Salesforce 是否在架构上被排除在解密路径之外。
5. **对共享租户平台做跨租户隔离验证**：确认租户标识不是由可被操纵的密文参数单独承载，避免"改一个字节就读到别人邮件"的架构，并把这类验证作为接入共享 SaaS 的前置条件。
6. **建立链接与令牌的强制过期与撤销机制**：确认历史生成的查看链接与跟踪参数具备过期能力，并保留紧急批量作废的运营预案与演练流程。
7. **把供应商的披露与响应时效纳入评估维度**：本次从报告到完成修复约 8 天并分配多个 CVE，可作为衡量供应商安全响应能力的基准参照。

## 相关实体
- [Detect Ai Agent Traffic](https://github.com/QianJinGuo/wiki-public/blob/main/entities/detect-ai-agent-traffic.md)
- [Exiftool Compromise Mac 592994](https://github.com/QianJinGuo/wiki-public/blob/main/entities/exiftool-compromise-mac-592994.md)
- [Oz Multi Harness Cloud Agent Orchestration](https://github.com/QianJinGuo/wiki-public/blob/main/entities/oz-multi-harness-cloud-agent-orchestration.md)
- [Langgraph State Machine Under The Hood](https://github.com/QianJinGuo/wiki-public/blob/main/entities/langgraph-state-machine-under-the-hood.md)
- [打造可靠的 Ai 编程环境Claude Code Hooks 完整开发者指南 V2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/打造可靠的-ai-编程环境claude-code-hooks-完整开发者指南-v2.md)

→ [原文存档](https://slcyber.io/research-center/ghosts-of-encryption-past-salesforce-exacttarget/)

---

