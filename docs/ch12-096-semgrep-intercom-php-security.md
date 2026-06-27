# semgrep intercom php security

## Ch12.096 semgrep intercom php security

> 📊 Level ⭐⭐ | 4.7KB | `entities/semgrep-intercom-php-security.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/semgrep-intercom-php-security.md)

# Semgrep Intercom PHP Supply Chain Attack
Semgrep: Intercom PHP 供应链攻击 Mini-Shai-Hulud，Packagist/Composer 投毒

## 摘要
At RSA, we launched Semgrep Multimodal to combine AI reasoning with rule-based detection [Learn More → ](https://semgrep.dev/blog/2026/attackers-cant-...

## 原文存档
- [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/semgrep-intercom-php-security.md)

## 相关资源
## 深度分析
Intercom PHP供应链攻击（Mini Shai-Hulud行动）揭示了Packagist/Composer生态中一个根本性的架构安全缺陷：Packagist缺乏发布前的安全审查门禁，任何已标记版本的代码更新都会在Webhook触发后自动向全网提供服务。
**1. Composer/Packagist的"Tag即发布"模型是这场攻击的结构性根源。** 与PyPI/npm不同，Packagist不存储tarball，而是注册GitHub VCS仓库URL并爬取composer.json。当作者推送恶意tag时，Webhook立即触发，Packagist重新索引，全网任何人运行`composer update`都会在几分钟内收到恶意版本。没有任何预发布隔离区、没有任何人工审批——这是npm/PyPI在多次重大攻击后才逐步引入安全机制之前的等价状态。
**2. 横向移动（lateral movement）能力使这次攻击影响远超常规供应链投毒。** 恶意代码在包安装时执行（而非使用时执行），意味着只要CI/CD服务器或开发机安装了5.0.2版本，攻击者就能窃取GitHub token、SSH key、云服务商凭证、环境变量——并通过加密和外部C2服务器（zero.masscan.cloud）外泄。这不仅仅是代码被污染的问题，而是整个开发基础设施的credentials被一次性收割。
**3. Semgrep Supply Chain的可达性分析（reachability analysis）是本次响应的关键能力——它不仅检查composer.lock中是否有问题版本，还检查代码是否实际调用了有漏洞的函数。** PHP的可达性分析覆盖2017年以来的高危和严重CVEs，意味着即使某依赖有漏洞，但如果代码从未调用危险函数，则不会报告为严重风险。这个设计显著降低了安全告警噪音。
**4. 恶意包在文件系统中留下的痕迹（.claude/router_runtime.js、.vscode/setup.mjs、results/results-*.json）表明攻击者针对的是开发者工具链本身，而非应用代码。** .claude/和.vscode/是Claude Code和VS Code的配置目录——这意味着攻击者预判了目标环境中存在AI编程工具，试图通过污染开发环境来获取更高价值的会话上下文和API密钥。

## 实践启示
**对于PHP开发者：** 立即检查composer.lock和项目中是否存在intercom/intercom-php@5.0.2。如果使用了受影响版本，立即撤销所有可能暴露的credentials（GitHub token、SSH key、云服务商密钥），并审计~/.composer/目录是否存在异常文件。重点关注.claude/和.vscode/目录——如果发现非预期的setup.mjs或router_runtime.js文件，立即隔离并审计。
**对于DevSecOps团队：** composer.lock必须提交到版本控制，并配置CI/CD在构建时进行依赖扫描。Packagist缺乏预发布安全门禁意味着：锁定已知-good版本号（而非使用^5.0.2这样的宽松范围）是防御供应链投毒的最低成本手段。对于高敏感项目，考虑使用private Packagist mirror或Artifactory对上游依赖做镜像审查。
**对于安全工具厂商：** Semgrep的这次快速响应（多生态联动：PyPI+npm+Packagist）展示了自动化威胁情报共享的价值。在新攻击手法可以在多平台快速复制的今天，安全规则的生成和分发速度是竞争的关键维度。

## 相关资源
- [Agent Memory 架构](/ch04-146-agent-memory-架构本质/)
- [Claude Managed Agents 开发者指南](/ch01-329-claude-managed-agents-开发者指南/)

## 相关实体

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/2026.md)

- [semgrep intercom php supply chain](/ch12-100-semgrep-intercom-php-supply-chain/)

---

