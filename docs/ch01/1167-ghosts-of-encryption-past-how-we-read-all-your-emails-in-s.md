# Ghosts of Encryption Past – How we Read All Your Emails in Salesforce Marketing Cloud › Searchlight Cyber

## Ch01.1167 Ghosts of Encryption Past – How we Read All Your Emails in Salesforce Marketing Cloud › Searchlight Cyber

> 📊 Level ⭐⭐⭐ | 3.5KB | `entities/slcyber-io-research-center-ghosts-of-encryption-past-salesforce-exacttarget.md`

## 深度分析
Searchlight Cyber 的这篇研究披露了 Salesforce Marketing Cloud（ExactTarget）在邮件加密实现上的历史遗留漏洞。研究的核心发现是：尽管企业付费使用 Salesforce 的营销云服务发送Transactional 和 Marketing 邮件，但 Salesforce 自身保留了解密这些邮件的能力——这意味着"加密"在服务提供商的架构层面并非真正的端到端加密。
**加密架构的两种模式**：研究中区分了两种常见的邮件加密实现方式——一种是传输层加密（TLS），仅保护邮件在网络传输过程中的安全；另一种是内容加密（如 S/MIME 或 PGP），确保只有持有私钥的收件人能解密内容。Salesforce Marketing Cloud 的加密实现更接近前者，而非后者。
**企业安全评估的关键问题**：这个发现对企业安全团队的重要启示是：在评估 SaaS 邮件服务时，不能仅看服务提供商是否声称支持"加密"，而需要明确追问：(1) 服务提供商自身是否能访问邮件内容？(2) 加密密钥的管理权归属？(3) 如果使用客户管理的密钥（CMK），服务提供商是否在任何情况下都无法解密？
**"Ghosts of Encryption Past"的含义**：标题暗示这是一种历史上被忽视但持续存在的架构缺陷。随着数据隐私法规（GDPR、CCPA）的严格执行和，企业对数据控制权的关注度提升，这类架构设计开始被更严格地审视。

## 实践启示
1. **在评估邮件 SaaS 服务的安全合规性时，明确询问密钥管理架构**：如果服务提供商声称支持"加密"但保留解密能力，则该加密仅保护传输层，而非内容层。对于需要真正内容加密的场景（如医疗、金融行业的敏感通信），应选择客户自管理密钥的方案。
2. **对已有 SaaS 邮件服务进行数据流审计**：检查哪些系统和服务有邮件内容的访问权限，即使是"仅用于故障排查"的技术访问也应纳入风险评估范围。
3. **关注 Salesforce Marketing Cloud 的密钥管理选项更新**：如果你是 Salesforce Marketing Cloud 的用户，关注其是否提供客户自管理密钥（BYOK 或 CMK）功能，以及该功能下 Salesforce 是否在架构上被排除在解密路径之外。
## 相关实体
- [Detect Ai Agent Traffic](ch04/069-ai.md)
- [Exiftool Compromise Mac 592994](https://github.com/QianJinGuo/wiki/blob/main/entities/exiftool-compromise-mac-592994.md)
- [Oz Multi Harness Cloud Agent Orchestration](ch05/085-harness.md)
- [Langgraph State Machine Under The Hood](ch04/196-langgraph.md)
- [打造可靠的 Ai 编程环境Claude Code Hooks 完整开发者指南 V2](ch04/069-ai.md)

---

