# GitHub Breached — Employee Device Hack Led to Exfiltration of 3,800+ Internal Repos

## Ch12.076 GitHub Breached — Employee Device Hack Led to Exfiltration of 3,800+ Internal Repos

> 📊 Level ⭐⭐ | 6.4KB | `entities/github-investigating-teampcp-claimed-17cc77.md`

## 核心要点

Significant security incident reporting on GitHub breach via compromised VS Code extension. Details attack vector, scope (~3800 repos), and response actions. Important supply chain security awareness with practical incident response insights.

## 标签

security, agent, ai

## 深度分析

GitHub 事件的核心是一个经典但破坏力极大的攻击链：员工设备通过一个恶意的 Microsoft Visual Studio Code 扩展被入侵，攻击者借此获取了 GitHub 内部基础设施的访问权限，最终导致约 3800 个内部仓库（涵盖 GitHub Actions 工作流、Copilot 功能、CodeQL 工具、CI/CD 基础设施、安全工具乃至 Pull Request 控制器）被窃取。这本质上是一次供应链攻击的"二层"展开——攻击者并未直接攻入 GitHub 的内部系统，而是通过攻破一个有 GitHub 内部资源访问权限的个人开发者工作站实现的侧向渗透。VS Code 扩展的信任模型使这一路径尤为危险：扩展在 IDE 内部以用户权限运行，可访问所有工作区文件、环境变量、API token，乃至于 Git 仓库的提交历史和 CI/CD 配置。

攻击者的战术选择展现了对开发供应链的深刻理解。TeamPCP（又名 DarkWing）采用"不勒索，只出售"的模式——明确表示"这不是勒索，1个买家我们就销毁数据，找不到买家就免费泄露"，这种表态既规避了法律风险（不构成勒索罪），又制造了紧迫感以驱动买家快速决策。这种模式对高价值目标的威慑力远超传统勒索：GitHub 的内部代码和基础设施工具对竞争对手、国家级行为者或想在开源生态中植入后门的攻击者具有极高的战略价值。LAPSUS$ 的加入（将联合拍卖价格推至 95,000 美元）更表明顶级网络犯罪组织正在形成联盟，整合各自的情报源以最大化收益。

durabletask PyPI 包供应链攻击展示了 TeamPCP 的完整攻击能力。攻击者通过此前盗取的 GitHub 账户凭据访问了 PyPI 发布 token，直接发布了三个恶意版本（1.4.1、1.4.2、1.4.3）。这些版本在 `import` 时即自动执行恶意代码，无需任何用户交互。载荷包括一个针对多家云服务商凭证（AWS、HashiCorp Vault、1Password、Bitwarden）、SSH 密钥、Docker 凭证、VPN 配置和 shell 历史记录的全面凭证窃取器，并实现了通过 AWS SSM SendCommand 在 EC2 实例间传播以及通过 `kubectl exec` 在 Kubernetes 集群内横向移动的能力——这意味着任何安装过受影响 durabletask 版本的机器都应该被视为已被完全入侵。

FIRESCALE 技术（C2 地址隐藏在 GitHub 公开提交信息中）和针对性删除机制（检测以色列或伊朗系统设置后，1/6 概率执行 `rm -rf /*`）进一步揭示了攻击者的技术深度和明确的敌意目标设定。特别是"瞄准以色列/伊朗系统"这一特征，与 CL-UNK-1090 的以色列公司关联形成有趣呼应，可能指向同一或相关威胁行为者。FIRESCALE 的创新在于将 C2 通信伪装成正常的 GitHub commit activity，绕过了大量基于网络流量监控的安全工具——这是对开发平台本身作为攻击基础设施的典型利用。

这次事件对开发工具生态的警示是根本性的。大多数组织并不掌握开发者具体在 VS Code 中安装了哪些扩展，也不清楚这些扩展的权限范围。VS Code Marketplace 缺乏细粒度的权限审查机制，扩展可以请求访问网络、文件系统、环境变量乃至终端——这些权限组合起来等于一个持久化的高级后门。更关键的是，CI/CD 管道中的凭据（PyPI token、AWS credentials、Docker registry 密钥）通常以环境变量形式存在，一旦攻击者通过 IDE 扩展获得对开发者工作站的访问，这些凭据也就暴露了。durabletask 每月 417,000 次的下载量意味着任何机器在安装受影响版本的那一刻就已经被侵入。

## 实践启示

- **强制实施 VS Code 扩展的审批与审查流程**：禁止开发者随意安装非白名单扩展，建立扩展权限的强制声明和审批机制，优先选择最小权限原则的扩展替代品 
- **对所有开发相关 token 实施紧急轮换**：GitHub、Docker Hub、PyPI、npm、AWS 等所有开发者管道凭据均应立即轮换，启用短生命周期 token 和最小权限访问原则，防止单点入侵导致全链路失守
- **监控 PyPI/npm 等包管理平台的异常发布行为**：关注组织账号名下从未发布过的包突然出现新版本、发布频率异常、发布者信息变更等信号；将已知恶意域名（`check.git-service[.]com`、`t.m-kosche[.]com`）纳入网络层封锁 
- **为 durabletask 受害组织提供检测清单**：检查是否存在对 `check.git-service[.]com` 的出站 DNS 查询、EC2 实例上的异常 SSM SendCommand 调用（`aws ssm send-command`）、`rook.pyz` 文件落地和执行痕迹，以及 GitHub commit 中的 `FIRESCALE` 模式字符串 
- **建立开发环境的零信任架构**：开发者工作站应被视为高价值攻击目标，实施持续验证（mTLS/设备证书）、网络分段（开发环境与生产环境隔离）和端点检测响应（EDR）覆盖，特别关注WSL/Linux子系统中的异常进程行为 

## 相关实体
- [Thehackernews Com Github Breached Employee Device Hack Led To Exfilt](../ch01/751-github.html)
- [Exiftool Compromise Mac 592994](../ch01/682-9.html)
- [Skill Issues Compromising Claude Code With Malicious Skills Agents Part 1](../ch01/771-skill-issues-compromising-claude-code-with-malicious-skills.html)
- [Tracking Tampered Chef Clusters Aef374](https://github.com/QianJinGuo/wiki/blob/main/entities/tracking-tampered-chef-clusters-aef374.md)
- [Grafana Github Token Breach Led To Codebase Download And Extortion Attempt](ch12/060-grafana-github-token-breach-led-to-codebase-download-and-ext.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/github-investigating-teampcp-claimed-17cc77.md)

---

