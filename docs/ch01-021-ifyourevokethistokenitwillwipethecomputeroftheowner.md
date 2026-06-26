# IfYouRevokeThisTokenItWillWipeTheComputerOfTheOwner

## Ch01.021 IfYouRevokeThisTokenItWillWipeTheComputerOfTheOwner

> 📊 Level ⭐ | 10.1KB | `entities/cybersecurityreach-revoke-token-wipe-computer.md`

> → [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/cybersecurityreach-revoke-token-wipe-computer.md)

## 核心要点
- Shai-Hulud npm 蠕虫新变种，针对 TanStack 生态发起供应链攻击
- 利用 `pull_request_target` + GitHub Actions 缓存污染 + OIDC 令牌内存提取攻入发布流水线
- 令牌窃取后通过 GitHub 提交搜索实现 P2P 中继，绕过一切 C2 阻断
- 持久化 `gh-token-monitor` 含真实 `rm -rf ~/` 逻辑，构成死亡开关； revocation 必须在移除持久化单元之后
## 相关实体
- [Postmortem Tanstack Npm Supply Chain Compromise Tanstack Blog](../ch12-033-postmortem-tanstack-npm-supply-chain-compromise-tanstack)
- [Www Wiz Io Mini Shai Hulud Strikes Again Tanstack More Npm Packages Compromised](../ch01-743-mini-shai-hulud-strikes-again-tanstack-more-npm-packages)
- [Nvidias Jensen Huang Bets On This British Startup To Build Next Frontier Of Ai](../ch01-019-nvidia-s-jensen-huang-bets-on-this-british-startup-to-build)
- [Why Im Leaving Github For Forgejo](../ch01-011-why-i-m-leaving-github-for-forgejo)
- [From Doer To Director The Ai Mindset Shift](../ch01-032-from-doer-to-director-the-ai-mindset-shift)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/cybersecurityreach-revoke-token-wipe-computer.md)

## 事件概述
2026 年 5 月 11 日 19:20–19:26 UTC，约 6 分钟内，攻击者在 42 个 `@tanstack/*` npm 包上发布了 84 个恶意版本 。这一切始于一个看似无害的 Pull Request 中的 `pull_request_target` 工作流漏洞 。外部安全研究员 ashishkurmi（任职于 StepSecurity）在 20 分钟内公开披露了该事件 。Cybersecurity Reach Foundation 团队随即对恶意载荷进行了三层混淆剥离——obfuscator.io 字符串数组、自定义 PBKDF2 + 置换密码，以及 AES-256-GCM Blob 封装层——最终还原出完整的攻击链 。
新变种最显著的特征是一个名为 `IfYouRevokeThisTokenItWillWipeTheComputerOfTheOwner` 的字符串 SIGIL，它同时承担心理威慑和 P2P 凭证中继双重功能 。这是 Shai-Hulud 蠕虫家族自 2025 年以来最复杂的演进版本，代表了 npm 生态系统供应链攻击的质的跃升 。

## 攻击路径深度解析
### 入口：pull_request_target 与 Actions 缓存污染
TanStack 事后分析报告确认，攻击者并未窃取任何 TanStack 维护者的 npm 令牌 。真正的入口是利用了 `pull_request_target` 工作流设计与 GitHub Actions 缓存 poisoning 之间的信任边界跨越 。一个来自 fork 的 Pull Request 通过缓存机制影响了受信任工作流运行时的执行环境，并在运行时从 Runner.Worker 进程的内存中提取了 OIDC 令牌 。这意味着攻击者实际上是通过合法的 CI/CD 机制获得了有效令牌，而非直接盗取发布凭证 。
这一路径与近年来针对多个主流开源项目的攻击手法相同，说明 `pull_request_target` + 缓存污染已成为一种成熟的供应链攻击范式 。

### 载荷行为：凭证窃取与 P2P 中继
受害主机一旦安装受污染的 `@tanstack/*` 包，dropper 即执行完整攻击链 ：
1. 若系统无 Bun 运行时则自动下载（锁定版本 bun-v1.3.13），以绕过 Node 原生模块和部分 EDR 规则
2. 扫描环境变量、`.npmrc`、`.git-credentials`、浏览器会话存储、云 CLI 配置；在 Linux 上还通过 `/proc/<pid>/mem` dump Runner.Worker 进程内存提取 in-flight OIDC 令牌
3. 凭证以混合加密方案处理：AES-256-GCM 加密数据，RSA-OAEP-SHA-256（4096-bit）包装会话密钥，密码学实现干净，防御方无法在不掌握攻击者私钥前提下解密
4. 将加密载荷作为公共 GitHub 仓库发布在受害者本人账号下，仓库名带有 Dune 宇宙主题（如 `tleilaxu-lasgun-263`），描述统一为 "Shai-Hulud: Here We Go Again"
5. 建立多层持久化：Claude Code `SessionStart` hook、VS Code `tasks.json`（`runOn: folderOpen`）、恶意 `CodeQL Analysis` GitHub Actions 工作流（将 `${{ toJSON(secrets) }}` 外传至 `api.masscan.cloud/v2/upload`），以及 launchd/systemd 服务单元 `gh-token-monitor`

### SIGIL 的双重功能：死亡开关 + P2P 令牌中继
`IfYouRevokeThisTokenItWillWipeTheComputerOfTheOwner` 绝非单纯的威慑文字 。蠕虫窃取 GitHub 令牌后，发起一次提交，提交信息以字面量字符串 `IfYouRevokeThisTokenItWillWipeTheComputerOfTheOwner:` 开头，后跟 base64 编码的窃取令牌 。其他被感染主机则通过 GitHub 提交搜索 API 查询该精确字符串，从而实现无需任何攻击者控制之 C2 服务器的点对点凭证传递 ：
```
https://api.github.com/search/commits?q=IfYouRevokeThisTokenItWillWipeTheComputerOfTheOwner&sort=author-date&order=desc&per_page=50
```
GitHub 自身的搜索索引在这个过程中充当了去中心化公告板的角色 。
`gh-token-monitor` 死亡开关每 60 秒向 `https://api.github.com/user` 发起请求，若收到 4xx 响应（即令牌已被撤销）则执行 `eval "rm -rf ~/"` 。Cybersecurity Reach 团队通过逆向分析确认该命令经过自定义 PBKDF2 + Fisher-Yates 置换密码三层解密后，真实内容即为 `rm -rf ~/` 。这意味着：撤销令牌前若未先清除持久化单元，用户整个 home 目录将被完全摧毁 。

## 深度分析
### 供应链攻击的范式跃迁
Shai-Hulud 蠕虫已从"一次性 npm 包投毒"演进为具备自传播能力的去中心化蠕虫 。其最深刻的变革在于：GitHub 本身被同时充当数据外泄通道、点对点心令总线和令牌中继基础设施 。整个攻击基础设施完全寄生于受害者信任的平台，防御方无法通过封禁域名或 IP 来切断通信，只有在出口网关层阻断对 GitHub API 搜索功能的滥用流量 。

### pull_request_target 漏洞的广泛影响
`pull_request_target` 工作流安全问题并非 TanStack 独有 。过去一年中多个主流开源项目已因此遭受攻击，这一模式暴露了 GitHub Actions 在 fork 与 base 仓库之间信任边界设计上的系统性缺陷 。社区已多次讨论，但 Action 缓存机制的根本性修复仍需 GitHub 层面推动 。

### 密码学实现的安全隐患
攻击者选用 RSA-OAEP-SHA-256（4096-bit）+ AES-256-GCM 的组合，在密码学实现上无懈可击 。这意味着即使防御方截获了加密载荷，也无法在缺少攻击者私钥的前提下还原出任何敏感信息 。这与许多野生恶意软件中常见的弱密钥生成或硬编码密码形成鲜明对比，表明攻击者具备相当的攻防两端知识储备 。

### OSS 供应链安全生态的系统性脆弱性
此次事件再一次表明，npm 生态的供应链安全高度依赖发布流程的单个环节 。即使 TanStack 本身没有直接泄露令牌，其 CI/CD 基础设施的局部缺陷仍可能导致整个生态的广泛受害 。npm 的传播速度意味着恶意包在 20 分钟内即可触达全球大量开发者机器 。

## 实践启示
### 对于开发者与维护者
**立即行动**：若项目依赖任何受影响的 `@tanstack/*` 包，应将版本回退至该事件发生前发布的版本，清除 `node_modules` 和 lockfile，清空 npm 缓存并重建 。任何在该时间窗口内安装了受影响版本的开发机或 CI 运行器，均应视为已受损 。
**revocation 顺序至关重要**：永远先检查并清除 `gh-token-monitor` 持久化单元（macOS: `~/Library/LaunchAgents`；Linux: `~/.config/systemd/user`；Windows: 计划任务），然后再撤销 GitHub 令牌 。错误的顺序将触发 `rm -rf ~/` 毁灭性后果 。
**OIDC 与 CI/CD 安全**：组织应审计所有使用 `pull_request_target` 的工作流，评估 Action 缓存的使用方式，并在可行情况下迁移至 OpenID Connect 令牌轮换机制 。
**不要在 VS Code 或 Claude Code 中打开不受信任的仓库**：蠕虫依赖 `tasks.json` 的 `runOn: folderOpen` 触发器和 Claude Code `SessionStart` hook 实现自动执行 。

### 对于安全团队
**网络层阻断**：在出口网关层阻断 `api.masscan.cloud`（恶意 CodeQL 工作流外泄端点）和 Session/Oxen  messengers 网络节点（`filev2.getsession.org`、`seed1.getsession.org` 等），因为这是主要凭证外泄通道 。
**GitHub 审计**：搜索组织仓库中是否存在包含字面字符串 `IfYouRevokeThisTokenItWillWipeTheComputerOfTheOwner` 的提交、描述为 "Shai-Hulud: Here We Go Again" 的陌生仓库，以及包含 `toJSON(secrets)` 写入文件再 curl 外传的 `.github/workflows/*.yml` 。
**IoC 全面部署**：将文章提供的 Network、GitHub/Source-Control、Host Artifacts、Cryptographic 四类 IoC 指标加入 EDR/SIEM/防火墙规则 。

### 对于 npm 生态治理
此次事件再次说明，npm 生态迫切需要在包发布流程层面引入更严格的变更管理机制 。维护者应启用 npm 令牌硬件化（hardware-backed tokens）、强制实施 OIDC 短期令牌而非持久性令牌，并对 CI/CD 流水线的 `pull_request_target` 使用实施最严格的安全审计 。
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/cybersecurityreach-revoke-token-wipe-computer.md)

## 相关实体

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/2026.md)
> [主题导航](https://github.com/QianJinGuo/wiki/blob/main/moc/cybersecurity-privacy.md)

---

