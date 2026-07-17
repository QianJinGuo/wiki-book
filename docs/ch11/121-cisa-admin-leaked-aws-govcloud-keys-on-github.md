# CISA Admin Leaked AWS GovCloud Keys on Github

## Ch11.121 CISA Admin Leaked AWS GovCloud Keys on Github

> 📊 Level ⭐⭐ | 8.6KB | `entities/cisa-admin-leaked-aws-govcloud-keys-on-github.md`

## 事件概述

2026 年 5 月 15 日，网络安全研究员 Guillaume Valadon（GitGuardian 安全研究员）联系 KrebsOnSecurity，反映其公司扫描到 GitHub 上存在一个名为 **"Private-CISA"** 的公开仓库，其中暴露了大量 CISA（网络安全与基础设施安全局）内部敏感凭证。

该仓库由 Nightwing 公司（CISA 签约商）员工创建，包含云密钥、令牌、明文密码、日志以及其他敏感资产。Valadon 多次尝试联系涉事者未果，鉴于暴露信息的敏感性，决定上报。

CISA 发言人表示已获悉该事件并持续调查，同时声称"目前没有证据表明此次事件导致任何敏感数据被泄露"，并称将确保实施额外安全措施以防止未来发生类似事件。

## 核心要点

- CISA 签约商在 GitHub 公开仓库 "Private-CISA" 中暴露了多个高权限 AWS GovCloud 账户凭证及大量内部系统密码
- GitGuardian 安全研究员 Guillaume Valadon 发现该仓库并通知 CISA，但涉事者未回应
- 暴露内容包括三个 AWS GovCloud 管理凭证、内部 "artifactory" 访问权、以及数十个系统的明文密码
- 仓库由 Nightwing 公司员工创建，CISA 在人员削减背景下发生此事件（损失近三分之一员工）
- GitHub 默认启用的 secrets 检测功能被管理员主动禁用
- 仓库下架后，AWS 密钥仍持续有效 48 小时

## 深度分析

### 1. 人为失误与制度失效的叠加效应

尽管 CISA 拥有网络安全专业知识，但单个承包商的个人错误演变成灾难性泄漏，暴露了组织层面缺乏纵深防御机制。

GitHub 默认启用 secrets 检测功能，可以阻止用户将 SSH 密钥或其他敏感信息发布到公共代码仓库中。然而，Valadon 指出该 CISA 管理员**主动禁用了这一默认设置**，使得敏感凭证得以流出的技术保护被解除。

Valadon 描述该仓库的状态为"在 CSV 文件中明文存储密码、git 备份、明确命令禁用 GitHub secrets 检测功能"，他认为这是其职业生涯中见过的最严重泄漏。

### 2. GovCloud 凭证的极高价值

AWS GovCloud 专为联邦政府设计，托管敏感和非敏感工作负载。安全研究员 Philippe Caturegli（Seralys 创始人）验证了暴露的凭证可以高特权级别身份认证到三个 AWS GovCloud 账户，这意味着攻击者可获得等同于 CISA 内部人员的访问权限。

更令人担忧的是，仓库下架后这些 AWS 密钥仍持续有效 48 小时，暴露出一套迟缓的应急响应机制。

### 3. 内部 artifactory 成为持久化攻击目标

Caturegli 指出，暴露的 artifactory（代码包仓库）是极具价值的横向移动目标。该仓库包含 CISA 构建、测试和部署软件的内部流程细节。

攻击者可以在此植入后门，"每次 CISA 构建新软件时自动部署到大量系统"，形成持久化入侵。

### 4. 弱密码实践放大风险

承包商使用"平台名+当年年份"（如 `aws2026`）作为密码，这类凭证据称为内部网络横向移动提供了便利条件。Caturegli 指出，即使这些凭证从未对外暴露，这种弱密码实践本身就构成严重安全威胁，因为攻击者常在获得初始访问权限后利用内部暴露的凭证扩大攻击范围。

### 5. 资源削减与安全能力下降的关联

CISA 自第二 Trump 政府上任以来已损失近三分之一员工，强制提前退休、买断和辞职遍及其各个部门。 这种人员削减直接削弱了对承包商行为的监督能力，为此次事件埋下制度性隐患。

### 6. 仓库使用模式分析

Caturegli 分析认为，该仓库的使用模式显示个人将其作为工作笔记本电脑和家庭电脑之间的文件同步工具。仓库自 2025 年 11 月 13 日创建以来，该承包商持续提交 commits，表明这是一种常规性的个人工作习惯而非一次性的意外疏忽。

仓库同时使用 CISA 关联邮箱和个人邮箱，进一步证实了这一跨设备同步的推断。

## 受影响系统与暴露资产

| 暴露类型 | 具体内容 | 风险等级 |
|---------|---------|---------|
| AWS GovCloud 凭证 | 三个管理级账户 | 极高 |
| 内部系统密码 | "AWS-Workspace-Firefox-Passwords.csv" 明文存储数十个系统凭证 | 极高 |
| Artifactory 访问权 | CISA 软件构建仓库 | 高 |
| 开发环境详情 | "LZ-DSO"（Landing Zone DevSecOps）secure code 开发环境 | 高 |

## 关键时间线

- **2025 年 9 月**：涉事承包商 GitHub 账户创建
- **2025 年 11 月 13 日**：Private-CISA 仓库创建
- **2026 年 5 月 15 日**：GitGuardian 研究员 Valadon 联系 KrebsOnSecurity 报告此事件
- **2026 年 5 月 18 日**：CISA 下线该仓库（事件公开披露后）
- **仓库下架后 +48 小时**：AWS 密钥仍保持有效

## 实践启示

### 1. 强制实施 GitHub 组织级策略

组织应通过 GitHub Enterprise 或其他平台强制执行安全策略，确保任何个人用户都无法单独禁用 secrets 检测功能。将此作为组织策略而非依赖个人判断。

### 2. 部署自动化的 secrets 扫描和告警

使用 GitGuardian、truffleHog 等工具持续扫描所有公共和私有仓库，并在检测到凭证暴露时立即通过安全渠道告警，而不仅仅依赖被动通知。

### 3. 凭证轮换的快速响应机制

建立"检测-验证-轮换"的标准化应急流程，确保一旦确认暴露，高特权凭证能在 24 小时内完成轮换而非等待 48 小时。

### 4. 禁止使用个人 GitHub 账户处理工作敏感数据

制定明确政策并通过技术手段（如 IP 白名单、强制 SSO）隔离工作环境与个人开发环境，防止承包商将个人账户作为跨设备同步工具。

### 5. 假设已沦陷的纵深防御设计

即使单一凭证泄露也能限制影响范围。实施最小权限原则，对 artifactory 等高价值目标强制多因素认证和会话监控。

### 6. 强化承包商安全管理

此次事件暴露了 CISA 对承包商监督的缺失。组织应建立更严格的承包商安全准入标准、定期审计机制，并在合同中明确禁止将工作敏感数据存储在非授权平台。

## 相关人物与组织

- **Guillaume Valadon**：GitGuardian 安全研究员，最初发现并报告此次泄漏
- **Philippe Caturegli**：Seralys 创始人，安全研究员，验证了暴露凭证的有效性和访问范围
- **Nightwing**：位于弗吉尼亚州杜勒斯的政府承包商，涉事员工所属公司
- **CISA**：网络安全与基础设施安全局，美国联邦政府网络安全主要机构

## 外部参考

## 相关实体
- [Github Copilot Individual Plans Flex Allotments](../ch01/768-github-copilot-individual-plans-flex-allotments-in-pro-and.html)
- [Vscode Github Token Stealing 1 Click Pwn Ammaraskar 2026](../ch01/801-github.html)
- [Andrej Karpathy Claude Md 134K Stars 2026](../ch01/284-claude-md.html)
- [Open Source Projects Leaving Github](../ch01/801-github.html)
- [Cost Effective Deployment Of Vision Language Models For Pet Behavior Detection O](ch11/196-cost-effective-deployment-of-vision-language-models-for-pet.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/cisa-admin-leaked-aws-govcloud-keys-on-github.md)- [github multilingual repositories dataset — 4000 万仓库多语言元数据](../ch01/801-github.html)

---

