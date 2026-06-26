# Ch12 安全与治理

> Agent 权限越大，安全责任越重：凭据、审计、合规

> 本章收录 **113 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 8 |
| ⭐⭐ 工程师 | 需编程基础 | 103 |
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

- [001. CISA urges critical infrastructure firms to 'fortify' before it's too late | Cybersecurity Dive](../ch12-001-cisa-urges-critical-infrastructure-firms-to-fortify-before)
- [002. A Framework for AI Threat Readiness](../ch12-002-a-framework-for-ai-threat-readiness)
- [003. From SSH to REST: A Security-Driven Modernization of Slack's EMR Data Pipelines](../ch12-003-from-ssh-to-rest-a-security-driven-modernization-of-slack-s)
- [004. Mozilla warns UK: Breaking VPNs will not magically fix Britain's age-check mess](../ch12-004-mozilla-warns-uk-breaking-vpns-will-not-magically-fix-brita)
- [005. Offensive Security Blog](../ch12-005-offensive-security-blog)
- [006. Sandworm Hackers Shift From IT Breaches to Critical OT Targets](../ch12-006-sandworm-hackers-shift-from-it-breaches-to-critical-ot-targe)
- [007. 5 Things to Know about the CLARITY Act](../ch12-007-5-things-to-know-about-the-clarity-act)
- [008. fedora hummingbird brings the container security model to a linux host os](../ch12-008-fedora-hummingbird-brings-the-container-security-model-to-a)
- [009. Mythos finds a curl vulnerability](../ch12-009-mythos-finds-a-curl-vulnerability)
- [010. 飞来汇借助 AWS Security Agent 构建跨境支付应用的智能安全防线](../ch12-010-飞来汇借助-aws-security-agent-构建跨境支付应用的智能安全防线)
- [011. Canvas Hackers ShinyHunters Say Their Official Domain Was Suspended](../ch12-011-canvas-hackers-shinyhunters-say-their-official-domain-was-su)
- [012. Hermes Agent v0.14.0 核心架构与快速上手](../ch12-012-hermes-agent-v0-14-0-核心架构与快速上手)
- [013. bleeding-llama-critical-unauthenticated-memory-leak-in-ollama](../ch12-013-bleeding-llama-critical-unauthenticated-memory-leak-in-ollam)
- [014. SHub Reaper: macOS Stealer Spoofs Apple, Google, and Microsoft in a Single Attack Chain](../ch12-014-shub-reaper-macos-stealer-spoofs-apple-google-and-microso)
- [015. Resecurity | CVE-2026-20182: Unauthenticated Cisco SD-WAN Control-Plane Compromise via vHub Authentication Bypass](../ch12-015-resecurity-cve-2026-20182-unauthenticated-cisco-sd-wan-co)
- [016. LLMReaper - DOM Based AI Conversation Exfiltration via Browser Extensions](../ch12-016-llmreaper-dom-based-ai-conversation-exfiltration-via-brows)
- [017. Static Devirtualization of Themida](../ch12-017-static-devirtualization-of-themida)
- [018. Static Devirtualization 2024](../ch12-018-static-devirtualization-2024)
- [019. What My Privacy and Security Stack Actually Looks Like](../ch12-019-what-my-privacy-and-security-stack-actually-looks-like)
- [020. How an image could compromise your](../ch12-020-how-an-image-could-compromise-your)
- [021. Alliance for Critical Infrastructure (ACI): US Critical Infrastructure Cybersecurity Coalition](../ch12-021-alliance-for-critical-infrastructure-aci-us-critical-infr)
- [022. Static Devirtualization of Themida](../ch12-022-static-devirtualization-of-themida)
- [023. Inference Theft as AI Endpoint Attack Surface — Vercel Token Theft Defense 2026](../ch12-023-inference-theft-as-ai-endpoint-attack-surface-vercel-token)
- [024. Apple corecrypto formal verification blueprint — post-quantum ML-KEM/ML-DSA in iMessage](../ch12-024-apple-corecrypto-formal-verification-blueprint-post-quantu)
- [025. OpenClaw 安全和功能增强实践](../ch12-025-openclaw-安全和功能增强实践)
- [026. Optimize blueprint extraction accuracy in Amazon Bedrock Data Automation"](../ch12-026-optimize-blueprint-extraction-accuracy-in-amazon-bedrock-dat)
- [027. xz-utils Backdoor 2 Years On — Maintainer Trust Hijack Pattern Beyond CVE Scanners](../ch12-027-xz-utils-backdoor-2-years-on-maintainer-trust-hijack-patte)
- [028. Disgruntled researcher releases two more Microsoft zero-days](../ch12-028-disgruntled-researcher-releases-two-more-microsoft-zero-days)
- [029. Disgruntled researcher releases two more Microsoft zero-days](../ch12-029-disgruntled-researcher-releases-two-more-microsoft-zero-days)
- [030. Where OpenClaw Security Is Heading — OpenClaw Blog](../ch12-030-where-openclaw-security-is-heading-openclaw-blog)
- [031. Canvas Breach Disrupts Schools & Colleges Nationwide](../ch12-031-canvas-breach-disrupts-schools-colleges-nationwide)
- [032. 别让你的 Amazon Bedrock 模型为他人打工——API 调用安全防护指南](../ch12-032-别让你的-amazon-bedrock-模型为他人打工-api-调用安全防护指南)
- [033. Postmortem: TanStack npm supply-chain compromise | TanStack Blog](../ch12-033-postmortem-tanstack-npm-supply-chain-compromise-tanstack)
- [034. 100万+AI服务暴露在公网——HackerNews扫描报告](../ch12-034-100万-ai服务暴露在公网-hackernews扫描报告)
- [035. Canvas Hackers ShinyHunters Say Their Official Domain Was Suspended](../ch12-035-canvas-hackers-shinyhunters-say-their-official-domain-was-su)
- [036. Adversaries Leverage AI for Vulnerability Exploitation, Augmented Operations, and Initial Access](../ch12-036-adversaries-leverage-ai-for-vulnerability-exploitation-augm)
- [037. Disgruntled researcher releases two more Microsoft zero-days](../ch12-037-disgruntled-researcher-releases-two-more-microsoft-zero-days)
- [038. GitLab CI/CD Kill Chain Audit — Black Hills InfoSec 2026 大规模审计研究](../ch12-038-gitlab-ci-cd-kill-chain-audit-black-hills-infosec-2026-大规模)
- [039. INTERPOL Operation Ramz MENA Cybercrime Networks](../ch12-039-interpol-operation-ramz-mena-cybercrime-networks)
- [040. Cyberscammers are bypassing banks' security with illicit tools sold on Telegram](../ch12-040-cyberscammers-are-bypassing-banks-security-with-illicit-too)
- [041. Securing AI Agents and Machine Identities](../ch12-041-securing-ai-agents-and-machine-identities)
- [042. A 0-click exploit chain for the Pixel 10: When a Door Closes, a Window Opens](../ch12-042-a-0-click-exploit-chain-for-the-pixel-10-when-a-door-closes)
- [043. U of T AI Worm：CleverHans Lab 展示可自适应的 AI 蠕虫威胁](../ch12-043-u-of-t-ai-worm-cleverhans-lab-展示可自适应的-ai-蠕虫威胁)
- [044. Canvas LMS 攻击者 ShinyHunters 官方域名被暂停：转向暗网的运营安全转向](../ch12-044-canvas-lms-攻击者-shinyhunters-官方域名被暂停-转向暗网的运营安全转向)
- [045. NGINX Rift: Achieving NGINX Remote Code Execution via an 18-Year-Old Vulnerability | depthfirst](../ch12-045-nginx-rift-achieving-nginx-remote-code-execution-via-an-18)
- [046. Fake Job Interview Apps Drop JobStealer Malware on Windows and macOS](../ch12-046-fake-job-interview-apps-drop-jobstealer-malware-on-windows-a)
- [047. ICO 对 South Staffordshire 处以 96.3 万英镑罚款：2022 年 Cl0p 勒索软件攻击暴露的安全失败](../ch12-047-ico-对-south-staffordshire-处以-96-3-万英镑罚款-2022-年-cl0p-勒索软件攻击暴露)
- [048. AI in Cybersecurity Training Resources | SANS Institute](../ch12-048-ai-in-cybersecurity-training-resources-sans-institute)
- [049. bagel — Fleet 级 Secret Scanning 守护开发工作站](../ch12-049-bagel-fleet-级-secret-scanning-守护开发工作站)
- [050. Funnel Builder Flaw Under Active Exploitation Enables WooCommerce Checkout Skimming](../ch12-050-funnel-builder-flaw-under-active-exploitation-enables-woocom)
- [051. Pwn2Own Berlin 2026, Day Three: DEVCORE Crowned Master of Pwn, $1.298 Million Total](../ch12-051-pwn2own-berlin-2026-day-three-devcore-crowned-master-of-pw)
- [052. Autonomous Vulnerability Hunting with MCP](../ch12-052-autonomous-vulnerability-hunting-with-mcp)
- [053. A 0-click exploit chain for the Pixel 10: When a Door Closes, a Window Opens](../ch12-053-a-0-click-exploit-chain-for-the-pixel-10-when-a-door-closes)
- [054. Static Devirtualization of Themida](../ch12-054-static-devirtualization-of-themida)
- [055. TeamPCP Claims Sale of Mistral AI Repositories Amid Mini Shai-Hulud Attack](../ch12-055-teampcp-claims-sale-of-mistral-ai-repositories-amid-mini-sha)
- [056. Grafana GitHub Token Breach Led to Codebase Download and Extortion Attempt](../ch12-056-grafana-github-token-breach-led-to-codebase-download-and-ext)
- [057. Meta U-turns on encryption push for Instagram as DMs go plaintext](../ch12-057-meta-u-turns-on-encryption-push-for-instagram-as-dms-go-plai)
- [058. AI Voice Cloning: The Technology Behind It, Who's Building It, and Where It's Headed](../ch12-058-ai-voice-cloning-the-technology-behind-it-who-s-building-i)
- [059. Google and Amnesty International teamed up to make Android spyware detectable](../ch12-059-google-and-amnesty-international-teamed-up-to-make-android-s)
- [060. RFC 9958: Post-Quantum Cryptography for Engineers](../ch12-060-rfc-9958-post-quantum-cryptography-for-engineers)
- [061. Disgruntled researcher releases two more Microsoft zero-days](../ch12-061-disgruntled-researcher-releases-two-more-microsoft-zero-days)
- [062. OpenAI launches Daybreak to combat cyber threats](../ch12-062-openai-launches-daybreak-to-combat-cyber-threats)
- [063. Funnel Builder 漏洞正被利用于 WooCommerce 支付 skimming](../ch12-063-funnel-builder-漏洞正被利用于-woocommerce-支付-skimming)
- [064. The down fall of bug bounties](../ch12-064-the-down-fall-of-bug-bounties)
- [065. Mozilla warns UK: Breaking VPNs will not magically fix Britain's age-check mess](../ch12-065-mozilla-warns-uk-breaking-vpns-will-not-magically-fix-brita)
- [066. JetBrains Marketplace Ecosystem Security Update: Malicious AI Plugins](../ch12-066-jetbrains-marketplace-ecosystem-security-update-malicious-a)
- [067. GlassWASM: WebAssembly Malware Found in Trojanized Open VSX Extensions](../ch12-067-glasswasm-webassembly-malware-found-in-trojanized-open-vsx)
- [068. ai detection and response aidr a zero impact operating model](../ch12-068-ai-detection-and-response-aidr-a-zero-impact-operating-model)
- [069. GitHub Breached — Employee Device Hack Led to Exfiltration of 3,800+ Internal Repos](../ch12-069-github-breached-employee-device-hack-led-to-exfiltration-o)
- [070. Exploiting vulnerabilities in Johnson & Johnson web apps](../ch12-070-exploiting-vulnerabilities-in-johnson-johnson-web-apps)
- [071. The IT and security field guide to AI adoption | Tines](../ch12-071-the-it-and-security-field-guide-to-ai-adoption-tines)
- [072. Mythos for Offensive Security: XBOW's Evaluation](../ch12-072-mythos-for-offensive-security-xbow-s-evaluation)
- [073. Getting a CVE Without Shipping Slop](../ch12-073-getting-a-cve-without-shipping-slop)
- [074. Fedora Hummingbird brings the container security model to a Linux host OS](../ch12-074-fedora-hummingbird-brings-the-container-security-model-to-a)
- [075. Meet Bluekit: The AI-Powered All-in-One Phishing Kit](../ch12-075-meet-bluekit-the-ai-powered-all-in-one-phishing-kit)
- [076. Building is just the beginning: Introducing Discoverability | Lovable](../ch12-076-building-is-just-the-beginning-introducing-discoverability)
- [077. Scammers Send Physical Phishing Letters to Steal Ledger Wallet Seed Phrases](../ch12-077-scammers-send-physical-phishing-letters-to-steal-ledger-wall)
- [078. LLMReaper: 浏览器扩展的对话窃取攻击](../ch12-078-llmreaper-浏览器扩展的对话窃取攻击)
- [079. How Unified EDR and ITDR Stop Attacks Before They Spread](../ch12-079-how-unified-edr-and-itdr-stop-attacks-before-they-spread)
- [080. Cyberscammers are bypassing banks' security with illicit tools sold on Telegram](../ch12-080-cyberscammers-are-bypassing-banks-security-with-illicit-too)
- [081. Guide to Security Operations at Machine Speed](../ch12-081-guide-to-security-operations-at-machine-speed)
- [082. Discord 全平台端到端加密](../ch12-082-discord-全平台端到端加密)
- [083. A 0-click exploit chain for the Pixel 10: When a Door Closes, a Window Opens](../ch12-083-a-0-click-exploit-chain-for-the-pixel-10-when-a-door-closes)
- [084. Funnel Builder Flaw Under Active Exploitation Enables WooCommerce Checkout Skimming](../ch12-084-funnel-builder-flaw-under-active-exploitation-enables-woocom)
- [085. Forward launches Predict to verify network changes before they reach production - SiliconANGLE](../ch12-085-forward-launches-predict-to-verify-network-changes-before-th)
- [086. Static Devirtualization of Themida](../ch12-086-static-devirtualization-of-themida)
- [087. GitHub Breached — Employee Device Hack Led to Exfiltration](../ch12-087-github-breached-employee-device-hack-led-to-exfiltration)
- [088. CyberSecQwen-4B](../ch12-088-cybersecqwen-4b)
- [089. Mystery Microsoft bug leaker keeps the zero-days coming](../ch12-089-mystery-microsoft-bug-leaker-keeps-the-zero-days-coming)
- [090. AI phishing attacks are on the rise — Are you prepared? | Bitwarden](../ch12-090-ai-phishing-attacks-are-on-the-rise-are-you-prepared-bi)
- [091. cPanel, WHM Release Fixes for Three New Vulnerabilities — Patch Now](../ch12-091-cpanel-whm-release-fixes-for-three-new-vulnerabilities-pa)
- [092. semgrep intercom php security](../ch12-092-semgrep-intercom-php-security)
- [093. A DOD contractor’s API flaw exposed military course data and service member records](../ch12-093-a-dod-contractor-s-api-flaw-exposed-military-course-data-and)
- [094. Anthropic's bug-hunting Mythos was greatest marketing stunt ever, says cURL creator](../ch12-094-anthropic-s-bug-hunting-mythos-was-greatest-marketing-stunt)
- [095. incendium fuzzing ms rpc](../ch12-095-incendium-fuzzing-ms-rpc)
- [096. How Semgrep Cut Taint Analysis Time by 75%](../ch12-096-how-semgrep-cut-taint-analysis-time-by-75)
- [097. Sandworm Hackers Shift From IT Breaches to Critical OT Targets](../ch12-097-sandworm-hackers-shift-from-it-breaches-to-critical-ot-targe)
- [098. On Post-Quantum Security Adoption](../ch12-098-on-post-quantum-security-adoption)
- [099. Jane Street — 形式化方法与编程的未来](../ch12-099-jane-street-形式化方法与编程的未来)
- [100. semgrep intercom php supply chain](../ch12-100-semgrep-intercom-php-supply-chain)
- [101. ICO fines Cl0p victim South Staffs Water over data breach](../ch12-101-ico-fines-cl0p-victim-south-staffs-water-over-data-breach)
- [102. peerd: 浏览器原生的 AI Agent Harness](../ch12-102-peerd-浏览器原生的-ai-agent-harness)
- [103. Drupal to Release Urgent Core Security Updates on May 20, Sites Told to Prepare](../ch12-103-drupal-to-release-urgent-core-security-updates-on-may-20-si)
- [104. Cyberscammers are bypassing banks’ security with illicit tools sold on Telegram](../ch12-104-cyberscammers-are-bypassing-banks-security-with-illicit-too)
- [105. Hackers accessed BWH Hotels reservation system for months](../ch12-105-hackers-accessed-bwh-hotels-reservation-system-for-months)
- [106. ICO fines South Staffordshire £963K over 2022 breach](../ch12-106-ico-fines-south-staffordshire-963k-over-2022-breach)
- [107. 中国用户安全高性能访问海外 Bedrock](../ch12-107-中国用户安全高性能访问海外-bedrock)
- [108. ShinyHunters hack 7-Eleven: franchisee data and Salesforce records exposed](../ch12-108-shinyhunters-hack-7-eleven-franchisee-data-and-salesforce-r)
- [109. Temporarily disabling new user registrations](../ch12-109-temporarily-disabling-new-user-registrations)
- [110. Romanian Man Faces Up to 30 Years in US Prison Over Vishing Scams](../ch12-110-romanian-man-faces-up-to-30-years-in-us-prison-over-vishing)
- [111. GitHub Secret Scanning: AI/ML 驱动的大规模误报降低](../ch12-111-github-secret-scanning-ai-ml-驱动的大规模误报降低)
- [112. U of T researchers demonstrate AI worm: self-spreading malware using open-weight models](../ch12-112-u-of-t-researchers-demonstrate-ai-worm-self-spreading-malwa)
- [113. Japan’s PM orders cybersecurity review to defend against Anthropic Mythos](../ch12-113-japan-s-pm-orders-cybersecurity-review-to-defend-against-ant)
