# Ch12 安全与治理

> Agent 权限越大，安全责任越重：凭据、审计、合规

> 本章收录 **95 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 8 |
| ⭐⭐ 工程师 | 需编程基础 | 85 |
| ⭐⭐⭐⭐ 科学家 | 需研究背景 | 1 |
| ⭐⭐⭐⭐⭐ 大师 | 前沿/哲学 | 1 |

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
- [002. Token 撤销触发设备擦除的安全漏洞](ch12/002-token)
- [003. A Framework for AI Threat Readiness](ch12/003-a-framework-for-ai-threat-readiness)
- [004. From SSH to REST: A Security-Driven Modernization of Slack's EMR Data Pipelines](ch12/004-from-ssh-to-rest-a-security-driven-modernization-of-slack-s)
- [005. Mozilla warns UK: Breaking VPNs will not magically fix Britain's age-check mess](ch12/005-mozilla-warns-uk-breaking-vpns-will-not-magically-fix-brita)
- [006. Offensive Security Blog](ch12/006-offensive-security-blog)
- [007. Sandworm Hackers Shift From IT Breaches to Critical OT Targets](ch12/007-sandworm-hackers-shift-from-it-breaches-to-critical-ot-targe)
- [008. 5 Things to Know about the CLARITY Act](ch12/008-5-things-to-know-about-the-clarity-act)
- [009. 飞来汇借助 AWS Security Agent 构建跨境支付应用的智能安全防线](ch12/009-aws-security-agent)
- [010. Hermes Agent v0.14.0 核心架构与快速上手](ch12/010-hermes-agent-v0-14-0)
- [011. SHub Reaper: macOS Stealer Spoofs Apple, Google, and Microsoft in a Single Attack Chain](ch12/011-shub-reaper-macos-stealer-spoofs-apple-google-and-microso)
- [012. LLMReaper - DOM Based AI Conversation Exfiltration via Browser Extensions](ch12/012-llmreaper-dom-based-ai-conversation-exfiltration-via-brows)
- [013. Resecurity | CVE-2026-20182: Unauthenticated Cisco SD-WAN Control-Plane Compromise via vHub Authentication Bypass](ch12/013-resecurity-cve-2026-20182-unauthenticated-cisco-sd-wan-co)
- [014. Static Devirtualization of Themida](ch12/014-static-devirtualization-of-themida)
- [015. Static Devirtualization 2024](ch12/015-static-devirtualization-2024)
- [016. What My Privacy and Security Stack Actually Looks Like](ch12/016-what-my-privacy-and-security-stack-actually-looks-like)
- [017. How an image could compromise your](ch12/017-how-an-image-could-compromise-your)
- [018. Alliance for Critical Infrastructure (ACI): US Critical Infrastructure Cybersecurity Coalition](ch12/018-alliance-for-critical-infrastructure-aci-us-critical-infr)
- [019. Static Devirtualization of Themida](ch12/019-static-devirtualization-of-themida)
- [020. Inference Theft as AI Endpoint Attack Surface — Vercel Token Theft Defense 2026](ch12/020-inference-theft-as-ai-endpoint-attack-surface-vercel-token)
- [021. Apple corecrypto formal verification blueprint — post-quantum ML-KEM/ML-DSA in iMessage](ch12/021-apple-corecrypto-formal-verification-blueprint-post-quantu)
- [022. OpenClaw 安全和功能增强实践](ch12/022-openclaw)
- [023. xz-utils Backdoor 2 Years On — Maintainer Trust Hijack Pattern Beyond CVE Scanners](ch12/023-xz-utils-backdoor-2-years-on-maintainer-trust-hijack-patte)
- [024. Disgruntled researcher releases two more Microsoft zero-days](ch12/024-disgruntled-researcher-releases-two-more-microsoft-zero-days)
- [025. Where OpenClaw Security Is Heading — OpenClaw Blog](ch12/025-where-openclaw-security-is-heading-openclaw-blog)
- [026. Disgruntled researcher releases two more Microsoft zero-days](ch12/026-disgruntled-researcher-releases-two-more-microsoft-zero-days)
- [027. Adversaries Leverage AI for Vulnerability Exploitation, Augmented Operations, and Initial Access](ch12/027-adversaries-leverage-ai-for-vulnerability-exploitation-augm)
- [028. 别让你的 Amazon Bedrock 模型为他人打工——API 调用安全防护指南](ch12/028-amazon-bedrock-api)
- [029. Canvas Hackers ShinyHunters Say Their Official Domain Was Suspended](ch12/029-canvas-hackers-shinyhunters-say-their-official-domain-was-su)
- [030. Postmortem: TanStack npm supply-chain compromise | TanStack Blog](ch12/030-postmortem-tanstack-npm-supply-chain-compromise-tanstack)
- [031. 100万+AI服务暴露在公网——HackerNews扫描报告](ch12/031-100-ai-hackernews)
- [032. Optimize blueprint extraction accuracy in Amazon Bedrock Data Automation](ch12/032-optimize-blueprint-extraction-accuracy-in-amazon-bedrock-dat)
- [033. GitLab CI/CD Kill Chain Audit — Black Hills InfoSec 2026 大规模审计研究](ch12/033-gitlab-ci-cd-kill-chain-audit-black-hills-infosec-2026)
- [034. INTERPOL Operation Ramz MENA Cybercrime Networks](ch12/034-interpol-operation-ramz-mena-cybercrime-networks)
- [035. Cyberscammers are bypassing banks' security with illicit tools sold on Telegram](ch12/035-cyberscammers-are-bypassing-banks-security-with-illicit-too)
- [036. AI in Cybersecurity Training Resources | SANS Institute](ch12/036-ai-in-cybersecurity-training-resources-sans-institute)
- [037. Canvas LMS 攻击者 ShinyHunters 官方域名被暂停：转向暗网的运营安全转向](ch12/037-canvas-lms-shinyhunters)
- [038. U of T AI Worm：CleverHans Lab 展示可自适应的 AI 蠕虫威胁](ch12/038-u-of-t-ai-worm-cleverhans-lab-ai)
- [039. Securing AI Agents and Machine Identities](ch12/039-securing-ai-agents-and-machine-identities)
- [040. A 0-click exploit chain for the Pixel 10: When a Door Closes, a Window Opens](ch12/040-a-0-click-exploit-chain-for-the-pixel-10-when-a-door-closes)
- [041. Fake Job Interview Apps Drop JobStealer Malware on Windows and macOS](ch12/041-fake-job-interview-apps-drop-jobstealer-malware-on-windows-a)
- [042. ICO 对 South Staffordshire 处以 96.3 万英镑罚款：2022 年 Cl0p 勒索软件攻击暴露的安全失败](ch12/042-ico-south-staffordshire-96-3-2022-cl0p)
- [043. Static Devirtualization of Themida](ch12/043-static-devirtualization-of-themida)
- [044. bagel — Fleet 级 Secret Scanning 守护开发工作站](ch12/044-bagel-fleet-secret-scanning)
- [045. ICO fines Cl0p victim South Staffs Water over data breach](ch12/045-ico-fines-cl0p-victim-south-staffs-water-over-data-breach)
- [046. A 0-click exploit chain for the Pixel 10: When a Door Closes, a Window Opens](ch12/046-a-0-click-exploit-chain-for-the-pixel-10-when-a-door-closes)
- [047. Pwn2Own Berlin 2026, Day Three: DEVCORE Crowned Master of Pwn, $1.298 Million Total](ch12/047-pwn2own-berlin-2026-day-three-devcore-crowned-master-of-pw)
- [048. Funnel Builder Flaw Under Active Exploitation Enables WooCommerce Checkout Skimming](ch12/048-funnel-builder-flaw-under-active-exploitation-enables-woocom)
- [049. Autonomous Vulnerability Hunting with MCP](ch12/049-autonomous-vulnerability-hunting-with-mcp)
- [050. Sandworm Hackers Shift From IT Breaches to Critical OT Targets](ch12/050-sandworm-hackers-shift-from-it-breaches-to-critical-ot-targe)
- [051. How Unified EDR and ITDR Stop Attacks Before They Spread](ch12/051-how-unified-edr-and-itdr-stop-attacks-before-they-spread)
- [052. Static Devirtualization of Themida](ch12/052-static-devirtualization-of-themida)
- [053. NIST SP 800-213r1 — IoT Product Cybersecurity Guidelines](ch12/053-nist-sp-800-213r1-iot-product-cybersecurity-guidelines)
- [054. TeamPCP Claims Sale of Mistral AI Repositories Amid Mini Shai-Hulud Attack](ch12/054-teampcp-claims-sale-of-mistral-ai-repositories-amid-mini-sha)
- [055. GlassWASM: WebAssembly Malware Found in Trojanized Open VSX Extensions](ch12/055-glasswasm-webassembly-malware-found-in-trojanized-open-vsx)
- [056. CVE-2026-20182: Unauthenticated Cisco SD-WAN Control Plane Compromise via vHub Authentication Bypass](ch12/056-cve-2026-20182-unauthenticated-cisco-sd-wan-control-plane-c)
- [057. OpenAI launches Daybreak to combat cyber threats](ch12/057-openai-launches-daybreak-to-combat-cyber-threats)
- [058. Stealing Passwords via HTML Injection Under a Strict CSP](ch12/058-stealing-passwords-via-html-injection-under-a-strict-csp)
- [059. AI Voice Cloning: The Technology Behind It, Who's Building It, and Where It's Headed](ch12/059-ai-voice-cloning-the-technology-behind-it-who-s-building-i)
- [060. Grafana GitHub Token Breach Led to Codebase Download and Extortion Attempt](ch12/060-grafana-github-token-breach-led-to-codebase-download-and-ext)
- [061. Temporarily disabling new user registrations](ch12/061-temporarily-disabling-new-user-registrations)
- [062. Google and Amnesty International teamed up to make Android spyware detectable](ch12/062-google-and-amnesty-international-teamed-up-to-make-android-s)
- [063. RFC 9958: Post-Quantum Cryptography for Engineers](ch12/063-rfc-9958-post-quantum-cryptography-for-engineers)
- [064. Disgruntled researcher releases two more Microsoft zero-days](ch12/064-disgruntled-researcher-releases-two-more-microsoft-zero-days)
- [065. The down fall of bug bounties](ch12/065-the-down-fall-of-bug-bounties)
- [066. Mozilla warns UK: Breaking VPNs will not magically fix Britain's age-check mess](ch12/066-mozilla-warns-uk-breaking-vpns-will-not-magically-fix-brita)
- [067. JetBrains Marketplace Ecosystem Security Update: Malicious AI Plugins](ch12/067-jetbrains-marketplace-ecosystem-security-update-malicious-a)
- [068. LLMReaper: 浏览器扩展的对话窃取攻击](ch12/068-llmreaper)
- [069. Exploiting vulnerabilities in Johnson & Johnson web apps](ch12/069-exploiting-vulnerabilities-in-johnson-johnson-web-apps)
- [070. Romanian Man Faces Up to 30 Years in US Prison Over Vishing Scams](ch12/070-romanian-man-faces-up-to-30-years-in-us-prison-over-vishing)
- [071. GitHub Breached — Employee Device Hack Led to Exfiltration of 3,800+ Internal Repos](ch12/071-github-breached-employee-device-hack-led-to-exfiltration-o)
- [072. Hackers accessed BWH Hotels reservation system for months](ch12/072-hackers-accessed-bwh-hotels-reservation-system-for-months)
- [073. The IT and security field guide to AI adoption | Tines](ch12/073-the-it-and-security-field-guide-to-ai-adoption-tines)
- [074. Getting a CVE Without Shipping Slop](ch12/074-getting-a-cve-without-shipping-slop)
- [075. Unlocking the Cloudflare app ecosystem with OAuth for all](ch12/075-unlocking-the-cloudflare-app-ecosystem-with-oauth-for-all)
- [076. Mythos for Offensive Security: XBOW's Evaluation](ch12/076-mythos-for-offensive-security-xbow-s-evaluation)
- [077. Fedora Hummingbird brings the container security model to a Linux host OS](ch12/077-fedora-hummingbird-brings-the-container-security-model-to-a)
- [078. ShinyHunters hack 7-Eleven: franchisee data and Salesforce records exposed](ch12/078-shinyhunters-hack-7-eleven-franchisee-data-and-salesforce-r)
- [079. GitHub Secret Scanning: AI/ML 驱动的大规模误报降低](ch12/079-github-secret-scanning-ai-ml)
- [080. Scammers Send Physical Phishing Letters to Steal Ledger Wallet Seed Phrases](ch12/080-scammers-send-physical-phishing-letters-to-steal-ledger-wall)
- [081. Guide to Security Operations at Machine Speed](ch12/081-guide-to-security-operations-at-machine-speed)
- [082. Discord 全平台端到端加密](ch12/082-discord)
- [083. Funnel Builder Flaw Under Active Exploitation Enables WooCommerce Checkout Skimming](ch12/083-funnel-builder-flaw-under-active-exploitation-enables-woocom)
- [084. Nikesh Arora 20VC 访谈：Token 定价、FDE、SaaS→AI 转型与记忆护城河](ch12/084-nikesh-arora-20vc-token-fde-saas-ai)
- [085. Forward launches Predict to verify network changes before they reach production - SiliconANGLE](ch12/085-forward-launches-predict-to-verify-network-changes-before-th)
- [086. GitHub Breached — Employee Device Hack Led to Exfiltration](ch12/086-github-breached-employee-device-hack-led-to-exfiltration)
- [087. CyberSecQwen-4B](ch12/087-cybersecqwen-4b)
- [088. AI phishing attacks are on the rise — Are you prepared? | Bitwarden](ch12/088-ai-phishing-attacks-are-on-the-rise-are-you-prepared-bi)
- [089. peerd: 浏览器原生的 AI Agent Harness](ch12/089-peerd-ai-agent-harness)
- [090. Jane Street — 形式化方法与编程的未来](ch12/090-jane-street)
- [091. Semgrep Intercom Php Supply Chain](ch12/091-semgrep-intercom-php-supply-chain)
- [092. 中国用户安全高性能访问海外 Bedrock](ch12/092-bedrock)
- [093. Drupal to Release Urgent Core Security Updates on May 20, Sites Told to Prepare](ch12/093-drupal-to-release-urgent-core-security-updates-on-may-20-si)
- [094. U of T researchers demonstrate AI worm: self-spreading malware using open-weight models](ch12/094-u-of-t-researchers-demonstrate-ai-worm-self-spreading-malwa)
- [095. Japan’s PM orders cybersecurity review to defend against Anthropic Mythos](ch12/095-japan-s-pm-orders-cybersecurity-review-to-defend-against-ant)
