# Checkmarx Jenkins plugin compromised in new supply chain attack

## Ch01.430 Checkmarx Jenkins plugin compromised in new supply chain attack

> 📊 Level ⭐⭐ | 11.7KB | `entities/checkmarx-jenkins-plugin-compromised-in-new-supply-chain-attack.md`

## 深度分析
此次 Checkmarx Jenkins AST 插件供应链攻击事件揭示了多个值得深入剖析的安全问题，以下从技术、战术和战略三个层面进行解读。

### 1. 攻击者对 CI/CD 生态的精准定向
TeamPCP 选择攻击 Jenkins 插件生态并非偶然——Jenkins 是全球最广泛使用的 CI/CD 平台之一，其插件市场缺乏严格的代码签名验证和发布审批流程。攻击者通过直接篡改 GitHub 仓库并发布恶意版本，绕过了传统安全边界，直抵开发人员的核心构建环境。这种"攻开发者以入企业"的路径，意味着一旦插件被植入后门，所有使用该插件的企业构建流水线都将暴露在攻击者视野中。

### 2. 高危 CVE 与快速响应的重要性
CVE-2026-33634 的 CVSS 9.4 分值表明这是一个极度严重的漏洞。Checkmarx 在事件确认后快速提供了降级建议——回退至 2025 年 12 月的旧版本 2.0.13-829.vc72453fa_1c16。这一快速响应为受影响用户提供了明确的止损路径，但同时也意味着，如果企业没有建立实时的 CVE 监控和预设的降级预案，响应速度将被大大拖慢。在 9.4 分级的高危漏洞面前，"反应时间"直接等于"损失半径"。

### 3. "Dune 主题"——攻击者的署名标识与检测线索
恶意代码仓库使用 Dune 科幻小说主题命名（如 "kralizec-navigator-709"、"mentat-navigator-124"，描述为 "A Mini Shai-Hulud has Appeared"）。这种署名风格并非首次出现——TeamPCP 在此前针对 Trivy 和 LiteLLM 的攻击中同样使用了类似标记。对于防御者而言，这种特征模式可被转化为威胁狩猎规则：在 GitHub 审计日志中搜索包含 "navigator"、Dune  reference 的仓库名称，可快速发现潜在的失陷指标（IoC）。

### 4. 供应链攻击的"多触角"特性
这不是 TeamPCP 首次对 Checkmarx 发起攻击——2026 年 3 月他们已染指 checkmarx/ast-github-action 和 checkmarx/kics-github-action，并同期对 Trivy、LiteLLM 以及 66 个 npm 包发起攻势，波及至少 1,000 家企业 SaaS 环境。这种"一次入侵、多点开花"的战术，说明攻击者已在受害组织内部站稳脚跟，并试图以最低成本扩散战果。单一组件的失陷可能不是终点，而是整个供应链攻击链的起点。

### 5. 云凭证窃取——供应链攻击的核心目标
文章明确指出，攻击者的目标是云服务凭证（AWS/GCP/Azure）、npm publication tokens 和 SSH 密钥。Jenkins 插件通常拥有较高的权限来访问代码仓库、部署环境和敏感配置，因此插件被植入后门等同于在企业内网中获得了一个高权限跳板。从安全架构角度看，CI/CD 流水线节点应被视为"准生产环境"，其安全管控级别不应低于生产服务器。
---

## 实践启示
供应链攻击已成为攻击者入侵企业的主流路径，而此次 Checkmarx Jenkins 插件事件更是将攻击的复杂性与危害程度推向了新高度。以下从多个维度提取可操作的实践启示，帮助安全团队建立更健壮的防御体系。

### 1. 插件生态的安全风险
Jenkins 作为最流行的 CI/CD 平台之一，其插件生态长期处于安全管理的灰色地带。插件申请门槛低、更新机制松散、版本溯源能力弱，使得攻击者能够通过劫持发布流程或直接篡改代码库的方式植入恶意代码。**实践要点**：

- 建立插件白名单制度，仅允许经过安全审查的插件在生产 Jenkins 实例上运行
- 定期审计已安装插件版本，对比插件仓库的正式发布版本，检测是否存在本地篡改
- 使用插件签名验证机制（如果 Jenkins 版本支持），并对插件源代码进行哈希校验
- 监控 Jenkins 插件页面的变更日志和发布记录，及时发现异常发布活动

### 2. 秘密轮换的紧迫性
CVE-2026-33634 的 CVSS 评分高达 9.4，属于极度严重的漏洞等级。一旦确认受影响版本被安装，**立即轮换所有可能被暴露的秘密**是不可协商的安全准则。GitHub 令牌、云服务凭证（AWS/GCP/Azure）、Kubernetes 配置、Docker 凭证和 SSH 密钥都应被视为已泄露并立即吊销和重新生成。轮换后，还应检查这些凭证的使用日志，确认是否存在异常调用。

### 3. 识别 Dune 主题恶意代码
恶意软件的"Dune 主题"是一个关键的检测特征。攻击者在被控账户下创建的仓库使用了类似 "kralizec-navigator-709" 和 "mentat-navigator-124" 这样的名称，并配有描述"A Mini Shai-Hulud has Appeared"。这些命名模式可以用于**威胁狩猎（threat hunting）**：

- 在 GitHub 企业组织的审计日志中搜索包含 "navigator"、"Shai-Hulud" 或其他 Dune reference 的仓库名称
- 检查 Jenkins 构建日志中是否存在到未知域名的出站流量，特别是与 Dune 主题相关的域
- 使用 YARA 规则或 SIGMA 规则对构建产物进行静态扫描，识别 Dune 主题的恶意代码特征

### 4. 应对持续性供应链威胁
TeamPCP 并非首次对 Checkmarx 发起攻击——2026 年 3 月就曾入侵 checkmarx/ast-github-action 和 checkmarx/kics-github-action，并同时针对 Trivy 和 LiteLLM 发起攻势。这表明**供应链攻击具有高度的持续性和多目标性**，攻击者会反复利用同一组织的不同组件。**实践要点**：

- 对关键依赖供应商的安全能力进行持续监控，而不是一次性评估
- 建立软件物料清单（SBOM），在攻击发生时能够快速定位受影响范围
- 采用"零信任"思路——即使是从官方仓库下载的工具，也应视为不受信任，需要进行独立验证
- 在 CI/CD 流水线中加入安全扫描环节（SAST、依赖扫描、artifact 签名验证），在攻击者植入恶意代码后及时发现异常

### 5. 快速响应框架
面对高危 CVE，快速响应能力直接决定了损失范围。此次事件中 Checkmarx 快速确认了恶意版本并推荐降级至 2025 年 12 月的旧版本，这为受影响用户提供了明确的止损路径。**企业应建立的响应机制**：

- 维护一个 CVE 监控订阅源，对关键基础设施组件的高危漏洞设置即时告警
- 预先定义受影响组件的降级路径和回滚方案，避免在事件发生时手足无措
- 建立与供应商的直接沟通渠道，在供应商确认安全事件后能够第一时间获取官方修复建议
- 进行定期的应急响应演练，确保安全团队在真实攻击发生时能够快速协调隔离、取证、恢复等步骤
---
## 相关实体
- [Npm Supply Chain Compromise Postmortem](ch04/150-ai.md)
- [Rigged Game Scarcruft Compromises Gaming Platform Supply Chain Attack](ch04/150-ai.md)
- [Semgrep Intercom Php Supply Chain](ch12/105-semgrep-intercom-php-supply-chain.md)
- [Shub Reaper Macos Stealer Attack Chain](ch04/150-ai.md)
- [Postmortem Tanstack Npm Supply Chain Compromise Tanstack Blog](ch04/150-ai.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/security-landscape.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/checkmarx-jenkins-plugin-compromised-in-new-supply-chain-attack.md)

# "Checkmarx Jenkins plugin compromised in new supply chain attack"
URL Source: https://www.techzine.eu/news/security/141212/checkmarx-jenkins-plugin-compromised-in-new-supply-chain-attack/
Published Time: 2026-05-11T13:29:24+00:00
Markdown Content:

# Checkmarx Jenkins plugin compromised in new supply chain attack - Techzine Global
[Skip to content](https://www.techzine.eu/news/security/141212/checkmarx-jenkins-plugin-compromised-in-new-supply-chain-attack/#main)
[Techzine Global](https://www.techzine.eu/)

*   [Home](https://www.techzine.eu/)
*   [Topstories](https://www.techzine.eu/topstories/)
*   [Topics](https://www.techzine.eu/news/security/141212/checkmarx-jenkins-plugin-compromised-in-new-supply-chain-attack/#)
    *   [Analytics](https://www.techzine.eu/analytics/)
    *   [Applications](https://www.techzine.eu/applications/)
    *   [Collaboration](https://www.techzine.eu/collaboration/)
    *   [Data Management](https://www.techzine.eu/data-management/)
    *   [Devices](https://www.techzine.eu/devices/)
    *   [Devops](https://www.techzine.eu/devops/)
    *   [Infrastructure](https://www.techzine.eu/infrastructure/)
    *   [Privacy & Compliance](https://www.techzine.eu/privacy-compliance/)
    *   [Security](https://www.techzine.eu/security/)
*   [Insights](https://www.techzine.eu/news/security/141212/checkmarx-jenkins-plugin-compromised-in-new-supply-chain-attack/#)
    *   [All Insights](https://www.techzine.eu/insights/)
    *   [Agentic AI](https://www.techzine.eu/insights/agentic-ai/)
    *   [Analytics](https://www.techzine.eu/insights/analytics/)
    *   [Cloud ERP](https://www.techzine.eu/insights/cloud-erp/)
    *   [Generative AI](https://www.techzine.eu/insights/gen-ai/)
    *   [IT in Retail](https://www.techzine.eu/insights/it-in-retail/)
    *   [NIS2](https://www.techzine.eu/insights/nis2/)
    *   [RSAC 2025 Conference](https://www.techzine.eu/insights/rsac-2025-conference/)
    *   [Security Platforms](https://www.techzine.eu/insights/security-platforms/)
    *   [SentinelOne](https://www.techzine.eu/insights/sentinelone/)
*   [More](https://www.techzine.eu/news/security/141212/checkmarx-jenkins-plugin-compromised-in-new-supply-chain-attack/#)
    *   [Become a partner](https://www.dolphin.pub/)
    *   [About us](https://www.techzine.eu/about-us/)
    *   [Contact us](https://www.techzine.eu/contact)
    *   [Terms and conditions](https://www.techzine.eu/conditions)
    *   [Privacy Policy](https://www.techzine.eu/privacy)
*   [Techzine Global](https://www.techzine.eu/)
*   [Techzine Netherlands](https://www.techzine.nl/)
*   [Techzine Belgium](https://www.techzine.be/)
*   [Techzine TV](https://www.techzine.tv/)
*

*   [ICTMagazine Netherlands](https://www.ictmagazine.nl/)
*   [ICTMagazine Belgium](https://www.ictmagazine.nl/)
[Techzine](https://www.techzine.eu/) » [News](https://www.techzine.eu/news/) » [Security](https://www.techzine.eu/security/) » **Checkmarx Jenkins plugin compromised in new supply chain attack**
2 min[Security](https://www.techzine.eu/security/)

---

