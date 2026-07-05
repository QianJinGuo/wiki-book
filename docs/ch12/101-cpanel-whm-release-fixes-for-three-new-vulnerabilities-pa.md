# cPanel, WHM Release Fixes for Three New Vulnerabilities — Patch Now

## Ch12.101 cPanel, WHM Release Fixes for Three New Vulnerabilities — Patch Now

> 📊 Level ⭐⭐ | 4.9KB | `entities/cpanel-whm-patch-3-new-vulnerabilities.md`

# cPanel, WHM Release Fixes for Three New Vulnerabilities — Patch Now
#1 Trusted Cybersecurity News Platform
Followed by 5.70+ million[__](https://twitter.com/thehackersnews)[__](https://www.linkedin.com/company/thehackernews/)[__](https://www.facebook.com/thehackernews)
[![Image 1: The Hacker News Logo](blob:http://localhost/5c34172ae87fab3ecb77bf8cfaf83e48)](http://thehackernews.com/)
[__](javascript:void(0))

## 相关实体
- [Introducing Deepsec Find And Fix Vulnerabilities In Your Code Base](https://github.com/QianJinGuo/wiki/blob/main/entities/introducing-deepsec-find-and-fix-vulnerabilities-in-your-code-base.md)
- [Introducing Seer Agent The Answer Is Already In Sentry Now You Can Ask For It](ch03/045-agent.md)
- [Airbyte Agents A New Era For Airbyte Airbyte](ch04/497-airbyte-agents-a-new-era-for-airbyte-airbyte.md)
- [Airbyte Agents](ch04/277-ai.md)
- [5 Years And 5M Later Inventing A New](ch03/073-5-years-and-5m-later-inventing-a-new-programming-language.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/cpanel-whm-patch-3-new-vulnerabilities.md)

## 深度分析

cPanel 作为全球最广泛使用的 web hosting 控制面板之一，其安全漏洞影响范围极广。本次披露的三个漏洞（CVE-2026-29201、CVE-2026-29202、CVE-2026-29203）覆盖了从文件读取、代码执行到权限提升的完整攻击链，说明攻击者只需一个入口点即可完成从信息泄露到完全接管服务器的完整入侵过程。

其中 CVE-2026-29202 和 CVE-2026-29203 的 CVSS 评分均达到 8.8（高危），属于严重漏洞。前者允许经过认证的用户通过 plugin 参数注入任意 Perl 代码，后者则利用不安全符号链接处理实现任意文件的 chmod 操作，两者均可导致本地权限提升。这说明即使是非特权账户，一旦获得 cPanel 认证，即可向系统管理员乃至 root 权限横向移动。

值得注意的是，cPanel 官方列出了覆盖 11.94.0 至 11.136.0 的 12 个受影响版本区间，并针对仍在使用 CentOS 6 或 CloudLinux 6 的客户发布了专项更新 110.0.114。这种长尾版本支持策略虽体现了对老旧客户的责任感，但也意味着大量历史遗留版本可能仍在生产环境中运行，形成持续性安全风险。

就在此次补丁发布前几天，另一个关键漏洞 CVE-2026-41940 已被野外利用，用于传播 Mirai 僵尸网络变种和名为"Sorry"的勒索软件。这表明针对 cPanel/WHM 的漏洞利用已形成完整的武器化链条——从零日发现到payload交付均有现成工具支持。攻击者的攻击窗口极短，运维团队的补丁响应速度直接决定了被入侵的风险程度。

从攻击链路来看，cPanel 的漏洞利用链条典型路径为：通过 cPanel 账号的低权限入口（如 CVE-2026-29201 的文件读取）获取配置文件或凭证信息；再利用 CVE-2026-29202 实现代码执行；最后借助 CVE-2026-29203 的符号链接权限提升获得 root。这种组合式攻击大幅降低了入侵服务器的门槛。

## 实践启示

- 立即检查当前运行的 cPanel/WHM 版本，对照官方公告中的受影响版本列表。运行 `cPanel --version` 或通过 WHM 界面查看当前版本号，对仍在维护期内的版本（11.124.0.37 之前的所有 11.x 版本）应优先安排维护窗口进行升级。

- 对于仍在使用 CentOS 6/CloudLinux 6 的极老旧系统，即便官方已停止常规支持，也应特别关注本次专项更新 110.0.114。如果业务允许，建议制定迁移计划至受支持的操作系统版本，因为这些系统的底层漏洞修复空间已经非常有限。

- 建立 cPanel 漏洞响应专项流程，将此次披露作为触发点重新审视：cPanel 管理账号的密码策略、多因素认证（MFA）强制开启、以及通过 CSF/ConfigServer 等防火墙限制 adminbin 调用来源 IP。最小权限原则要求非必要不从公网访问 WHM 接口。

- 监控针对 CVE-2026-41940 等已被武器化漏洞的扫描活动。由于 Mirai 等僵尸网络通常通过自动化扫描寻找暴露的 cPanel 管理端口（2082/2083、2086/2087），对公网暴露的 cPanel/WHM 接口应纳入 SOC 重点监控范围。

- 将 cPanel 纳入补丁管理 SLA 考核体系。对于承载关键业务的主机，设定漏洞披露后 72 小时内完成补丁测试和部署的目标，并记录在案。漏洞利用的窗口期正在随 AI 辅助攻击工具的普及而显著缩短。

---

