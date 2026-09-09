# Ch12 安全与治理

> Agent 权限越大，安全责任越重：凭据、审计、合规

> 本章收录 **60 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 9 |
| ⭐⭐ 工程师 | 需编程基础 | 5 |
| ⭐⭐⭐ 专家 | 需ML基础 | 24 |
| ⭐⭐⭐⭐ 科学家 | 需研究背景 | 16 |
| ⭐⭐⭐⭐⭐ 大师 | 前沿/哲学 | 6 |

---

## 导读

AI Agent 正在获得越来越多的权限——执行代码、访问数据库、发送邮件、操作文件系统。

权限越大，攻击面越大。本章覆盖 Agent 安全的完整谱系：凭据管理（1Password 的机器身份方案）、Prompt 注入防御、供应链攻击（TanStack npm 事件）、恶意软件分析（GlassWASM WebAssembly 恶意代码）、逆向工程（Themida 脱壳）。

你还会看到 100 万+ AI 服务暴露在公网的扫描报告，以及 Google 与国际特赦组织联手打击商业间谍软件的行动。

安全不是"做完再考虑"的事——它应该内嵌在 Agent 架构的第一天。

---



---

## 本章内容

- [001. CISA urges critical infrastructure firms to 'fortify' before it's too late | Cybersecurity Dive](ch12/001-cisa-urges-critical-infrastructure-firms-to-fortify-before)
- [002. Where OpenClaw Security Is Heading — OpenClaw Blog](ch12/002-where-openclaw-security-is-heading-openclaw-blog)
- [003. Token 撤销触发设备擦除的安全漏洞](ch12/003-token)
- [004. A Framework for AI Threat Readiness](ch12/004-a-framework-for-ai-threat-readiness)
- [005. From SSH to REST: A Security-Driven Modernization of Slack's EMR Data Pipelines](ch12/005-from-ssh-to-rest-a-security-driven-modernization-of-slack-s)
- [006. peerd: 浏览器原生的 AI Agent Harness](ch12/006-peerd-ai-agent-harness)
- [007. How Semgrep Cut Taint Analysis Time by 75%](ch12/007-how-semgrep-cut-taint-analysis-time-by-75)
- [008. Jane Street — 形式化方法与编程的未来](ch12/008-jane-street)
- [009. 中国用户安全高性能访问海外 Bedrock](ch12/009-bedrock)
- [010. OpenAI launches Daybreak to combat cyber threats](ch12/010-openai-launches-daybreak-to-combat-cyber-threats)
- [011. Grafana GitHub Token Breach Led to Codebase Download and Extortion Attempt](ch12/011-grafana-github-token-breach-led-to-codebase-download-and-ext)
- [012. JetBrains Marketplace Ecosystem Security Update: Malicious AI Plugins](ch12/012-jetbrains-marketplace-ecosystem-security-update-malicious-a)
- [013. Unlocking the Cloudflare app ecosystem with OAuth for all](ch12/013-unlocking-the-cloudflare-app-ecosystem-with-oauth-for-all)
- [014. Nikesh Arora 20VC 访谈：Token 定价、FDE、SaaS→AI 转型与记忆护城河](ch12/014-nikesh-arora-20vc-token-fde-saas-ai)
- [015. 飞来汇借助 AWS Security Agent 构建跨境支付应用的智能安全防线](ch12/015-aws-security-agent)
- [016. Disgruntled researcher releases two more Microsoft zero-days](ch12/016-disgruntled-researcher-releases-two-more-microsoft-zero-days)
- [017. Adversaries Leverage AI for Vulnerability Exploitation, Augmented Operations, and Initial Access](ch12/017-adversaries-leverage-ai-for-vulnerability-exploitation-augm)
- [018. 别让你的 Amazon Bedrock 模型为他人打工——API 调用安全防护指南](ch12/018-amazon-bedrock-api)
- [019. Canvas Hackers ShinyHunters Say Their Official Domain Was Suspended](ch12/019-canvas-hackers-shinyhunters-say-their-official-domain-was-su)
- [020. Cyberscammers are bypassing banks' security with illicit tools sold on Telegram](ch12/020-cyberscammers-are-bypassing-banks-security-with-illicit-too)
- [021. U of T AI Worm：CleverHans Lab 展示可自适应的 AI 蠕虫威胁](ch12/021-u-of-t-ai-worm-cleverhans-lab-ai)
- [022. ICO 对 South Staffordshire 处以 96.3 万英镑罚款：2022 年 Cl0p 勒索软件攻击暴露的安全失败](ch12/022-ico-south-staffordshire-96-3-2022-cl0p)
- [023. NGINX Rift: Achieving NGINX Remote Code Execution via an 18-Year-Old Vulnerability | depthfirst](ch12/023-nginx-rift-achieving-nginx-remote-code-execution-via-an-18)
- [024. Offensive Security Blog](ch12/024-offensive-security-blog)
- [025. A 0-click exploit chain for the Pixel 10: When a Door Closes, a Window Opens](ch12/025-a-0-click-exploit-chain-for-the-pixel-10-when-a-door-closes)
- [026. Pwn2Own Berlin 2026, Day Three: DEVCORE Crowned Master of Pwn, $1.298 Million Total](ch12/026-pwn2own-berlin-2026-day-three-devcore-crowned-master-of-pw)
- [027. TeamPCP Claims Sale of Mistral AI Repositories Amid Mini Shai-Hulud Attack](ch12/027-teampcp-claims-sale-of-mistral-ai-repositories-amid-mini-sha)
- [028. AI Voice Cloning: The Technology Behind It, Who's Building It, and Where It's Headed](ch12/028-ai-voice-cloning-the-technology-behind-it-who-s-building-i)
- [029. Temporarily disabling new user registrations](ch12/029-temporarily-disabling-new-user-registrations)
- [030. The down fall of bug bounties](ch12/030-the-down-fall-of-bug-bounties)
- [031. Exploiting vulnerabilities in Johnson & Johnson web apps](ch12/031-exploiting-vulnerabilities-in-johnson-johnson-web-apps)
- [032. GitHub Breached — Employee Device Hack Led to Exfiltration of 3,800+ Internal Repos](ch12/032-github-breached-employee-device-hack-led-to-exfiltration-o)
- [033. Fedora Hummingbird brings the container security model to a Linux host OS](ch12/033-fedora-hummingbird-brings-the-container-security-model-to-a)
- [034. Guide to Security Operations at Machine Speed](ch12/034-guide-to-security-operations-at-machine-speed)
- [035. Forward launches Predict to verify network changes before they reach production - SiliconANGLE](ch12/035-forward-launches-predict-to-verify-network-changes-before-th)
- [036. GitHub Breached — Employee Device Hack Led to Exfiltration](ch12/036-github-breached-employee-device-hack-led-to-exfiltration)
- [037. AI phishing attacks are on the rise — Are you prepared? | Bitwarden](ch12/037-ai-phishing-attacks-are-on-the-rise-are-you-prepared-bi)
- [038. CyberSecQwen-4B](ch12/038-cybersecqwen-4b)
- [039. Mythos finds a curl vulnerability](ch12/039-mythos-finds-a-curl-vulnerability)
- [040. LLMReaper - DOM Based AI Conversation Exfiltration via Browser Extensions](ch12/040-llmreaper-dom-based-ai-conversation-exfiltration-via-brows)
- [041. Resecurity | CVE-2026-20182: Unauthenticated Cisco SD-WAN Control-Plane Compromise via vHub Authentication Bypass](ch12/041-resecurity-cve-2026-20182-unauthenticated-cisco-sd-wan-co)
- [042. Static Devirtualization of Themida](ch12/042-static-devirtualization-of-themida)
- [043. Apple corecrypto formal verification blueprint — post-quantum ML-KEM/ML-DSA in iMessage](ch12/043-apple-corecrypto-formal-verification-blueprint-post-quantu)
- [044. OpenClaw 安全和功能增强实践](ch12/044-openclaw)
- [045. xz-utils Backdoor 2 Years On — Maintainer Trust Hijack Pattern Beyond CVE Scanners](ch12/045-xz-utils-backdoor-2-years-on-maintainer-trust-hijack-patte)
- [046. 100万+AI服务暴露在公网——HackerNews扫描报告](ch12/046-100-ai-hackernews)
- [047. Optimize blueprint extraction accuracy in Amazon Bedrock Data Automation](ch12/047-optimize-blueprint-extraction-accuracy-in-amazon-bedrock-dat)
- [048. Disgruntled researcher releases two more Microsoft zero-days](ch12/048-disgruntled-researcher-releases-two-more-microsoft-zero-days)
- [049. GitLab CI/CD Kill Chain Audit — Black Hills InfoSec 2026 大规模审计研究](ch12/049-gitlab-ci-cd-kill-chain-audit-black-hills-infosec-2026)
- [050. A 0-click exploit chain for the Pixel 10: When a Door Closes, a Window Opens](ch12/050-a-0-click-exploit-chain-for-the-pixel-10-when-a-door-closes)
- [051. bagel — Fleet 级 Secret Scanning 守护开发工作站](ch12/051-bagel-fleet-secret-scanning)
- [052. GlassWASM: WebAssembly Malware Found in Trojanized Open VSX Extensions](ch12/052-glasswasm-webassembly-malware-found-in-trojanized-open-vsx)
- [053. Getting a CVE Without Shipping Slop](ch12/053-getting-a-cve-without-shipping-slop)
- [054. GitHub Secret Scanning: AI/ML 驱动的大规模误报降低](ch12/054-github-secret-scanning-ai-ml)
- [055. Hermes Agent v0.14.0 核心架构与快速上手](ch12/055-hermes-agent-v0-14-0)
- [056. Bleeding Llama：Ollama 未授权内存泄漏漏洞](ch12/056-bleeding-llama-ollama)
- [057. SHub Reaper: macOS Stealer Spoofs Apple, Google, and Microsoft in a Single Attack Chain](ch12/057-shub-reaper-macos-stealer-spoofs-apple-google-and-microso)
- [058. How an image could compromise your](ch12/058-how-an-image-could-compromise-your)
- [059. Static Devirtualization of Themida](ch12/059-static-devirtualization-of-themida)
- [060. Securing AI Agents and Machine Identities](ch12/060-securing-ai-agents-and-machine-identities)
