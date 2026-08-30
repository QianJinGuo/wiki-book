# Ch12 安全与治理

> Agent 权限越大，安全责任越重：凭据、审计、合规

> 本章收录 **102 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 8 |
| ⭐⭐ 工程师 | 需编程基础 | 92 |
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
- [010. Canvas Hackers ShinyHunters Say Their Official Domain Was Suspended](ch12/010-canvas-hackers-shinyhunters-say-their-official-domain-was-su)
- [011. Hermes Agent v0.14.0 核心架构与快速上手](ch12/011-hermes-agent-v0-14-0)
- [012. Bleeding Llama：Ollama 未授权内存泄漏漏洞](ch12/012-bleeding-llama-ollama)
- [013. SHub Reaper: macOS Stealer Spoofs Apple, Google, and Microsoft in a Single Attack Chain](ch12/013-shub-reaper-macos-stealer-spoofs-apple-google-and-microso)
- [014. LLMReaper - DOM Based AI Conversation Exfiltration via Browser Extensions](ch12/014-llmreaper-dom-based-ai-conversation-exfiltration-via-brows)
- [015. Resecurity | CVE-2026-20182: Unauthenticated Cisco SD-WAN Control-Plane Compromise via vHub Authentication Bypass](ch12/015-resecurity-cve-2026-20182-unauthenticated-cisco-sd-wan-co)
- [016. Towards Native Post-Quantum Private ETH - Privacy - Ethereum Research](ch12/016-towards-native-post-quantum-private-eth-privacy-ethereum)
- [017. Static Devirtualization of Themida](ch12/017-static-devirtualization-of-themida)
- [018. Static Devirtualization 2024](ch12/018-static-devirtualization-2024)
- [019. What My Privacy and Security Stack Actually Looks Like](ch12/019-what-my-privacy-and-security-stack-actually-looks-like)
- [020. Alliance for Critical Infrastructure (ACI): US Critical Infrastructure Cybersecurity Coalition](ch12/020-alliance-for-critical-infrastructure-aci-us-critical-infr)
- [021. How an image could compromise your](ch12/021-how-an-image-could-compromise-your)
- [022. Static Devirtualization of Themida](ch12/022-static-devirtualization-of-themida)
- [023. Inference Theft as AI Endpoint Attack Surface — Vercel Token Theft Defense 2026](ch12/023-inference-theft-as-ai-endpoint-attack-surface-vercel-token)
- [024. Apple corecrypto formal verification blueprint — post-quantum ML-KEM/ML-DSA in iMessage](ch12/024-apple-corecrypto-formal-verification-blueprint-post-quantu)
- [025. OpenClaw 安全和功能增强实践](ch12/025-openclaw)
- [026. xz-utils Backdoor 2 Years On — Maintainer Trust Hijack Pattern Beyond CVE Scanners](ch12/026-xz-utils-backdoor-2-years-on-maintainer-trust-hijack-patte)
- [027. Disgruntled researcher releases two more Microsoft zero-days](ch12/027-disgruntled-researcher-releases-two-more-microsoft-zero-days)
- [028. Where OpenClaw Security Is Heading — OpenClaw Blog](ch12/028-where-openclaw-security-is-heading-openclaw-blog)
- [029. Disgruntled researcher releases two more Microsoft zero-days](ch12/029-disgruntled-researcher-releases-two-more-microsoft-zero-days)
- [030. Adversaries Leverage AI for Vulnerability Exploitation, Augmented Operations, and Initial Access](ch12/030-adversaries-leverage-ai-for-vulnerability-exploitation-augm)
- [031. 别让你的 Amazon Bedrock 模型为他人打工——API 调用安全防护指南](ch12/031-amazon-bedrock-api)
- [032. Canvas Hackers ShinyHunters Say Their Official Domain Was Suspended](ch12/032-canvas-hackers-shinyhunters-say-their-official-domain-was-su)
- [033. Postmortem: TanStack npm supply-chain compromise | TanStack Blog](ch12/033-postmortem-tanstack-npm-supply-chain-compromise-tanstack)
- [034. 100万+AI服务暴露在公网——HackerNews扫描报告](ch12/034-100-ai-hackernews)
- [035. Optimize blueprint extraction accuracy in Amazon Bedrock Data Automation](ch12/035-optimize-blueprint-extraction-accuracy-in-amazon-bedrock-dat)
- [036. Disgruntled researcher releases two more Microsoft zero-days](ch12/036-disgruntled-researcher-releases-two-more-microsoft-zero-days)
- [037. GitLab CI/CD Kill Chain Audit — Black Hills InfoSec 2026 大规模审计研究](ch12/037-gitlab-ci-cd-kill-chain-audit-black-hills-infosec-2026)
- [038. INTERPOL Operation Ramz MENA Cybercrime Networks](ch12/038-interpol-operation-ramz-mena-cybercrime-networks)
- [039. Cyberscammers are bypassing banks' security with illicit tools sold on Telegram](ch12/039-cyberscammers-are-bypassing-banks-security-with-illicit-too)
- [040. AI in Cybersecurity Training Resources | SANS Institute](ch12/040-ai-in-cybersecurity-training-resources-sans-institute)
- [041. Canvas LMS 攻击者 ShinyHunters 官方域名被暂停：转向暗网的运营安全转向](ch12/041-canvas-lms-shinyhunters)
- [042. U of T AI Worm：CleverHans Lab 展示可自适应的 AI 蠕虫威胁](ch12/042-u-of-t-ai-worm-cleverhans-lab-ai)
- [043. Securing AI Agents and Machine Identities](ch12/043-securing-ai-agents-and-machine-identities)
- [044. A 0-click exploit chain for the Pixel 10: When a Door Closes, a Window Opens](ch12/044-a-0-click-exploit-chain-for-the-pixel-10-when-a-door-closes)
- [045. Fake Job Interview Apps Drop JobStealer Malware on Windows and macOS](ch12/045-fake-job-interview-apps-drop-jobstealer-malware-on-windows-a)
- [046. ICO 对 South Staffordshire 处以 96.3 万英镑罚款：2022 年 Cl0p 勒索软件攻击暴露的安全失败](ch12/046-ico-south-staffordshire-96-3-2022-cl0p)
- [047. Static Devirtualization of Themida](ch12/047-static-devirtualization-of-themida)
- [048. bagel — Fleet 级 Secret Scanning 守护开发工作站](ch12/048-bagel-fleet-secret-scanning)
- [049. ICO fines Cl0p victim South Staffs Water over data breach](ch12/049-ico-fines-cl0p-victim-south-staffs-water-over-data-breach)
- [050. A 0-click exploit chain for the Pixel 10: When a Door Closes, a Window Opens](ch12/050-a-0-click-exploit-chain-for-the-pixel-10-when-a-door-closes)
- [051. Pwn2Own Berlin 2026, Day Three: DEVCORE Crowned Master of Pwn, $1.298 Million Total](ch12/051-pwn2own-berlin-2026-day-three-devcore-crowned-master-of-pw)
- [052. Funnel Builder Flaw Under Active Exploitation Enables WooCommerce Checkout Skimming](ch12/052-funnel-builder-flaw-under-active-exploitation-enables-woocom)
- [053. Autonomous Vulnerability Hunting with MCP](ch12/053-autonomous-vulnerability-hunting-with-mcp)
- [054. Sandworm Hackers Shift From IT Breaches to Critical OT Targets](ch12/054-sandworm-hackers-shift-from-it-breaches-to-critical-ot-targe)
- [055. How Unified EDR and ITDR Stop Attacks Before They Spread](ch12/055-how-unified-edr-and-itdr-stop-attacks-before-they-spread)
- [056. Static Devirtualization of Themida](ch12/056-static-devirtualization-of-themida)
- [057. GlassWASM: WebAssembly Malware Found in Trojanized Open VSX Extensions](ch12/057-glasswasm-webassembly-malware-found-in-trojanized-open-vsx)
- [058. NIST SP 800-213r1 — IoT Product Cybersecurity Guidelines](ch12/058-nist-sp-800-213r1-iot-product-cybersecurity-guidelines)
- [059. CVE-2026-20182: Unauthenticated Cisco SD-WAN Control Plane Compromise via vHub Authentication Bypass](ch12/059-cve-2026-20182-unauthenticated-cisco-sd-wan-control-plane-c)
- [060. Stealing Passwords via HTML Injection Under a Strict CSP](ch12/060-stealing-passwords-via-html-injection-under-a-strict-csp)
- [061. TeamPCP Claims Sale of Mistral AI Repositories Amid Mini Shai-Hulud Attack](ch12/061-teampcp-claims-sale-of-mistral-ai-repositories-amid-mini-sha)
- [062. AI Voice Cloning: The Technology Behind It, Who's Building It, and Where It's Headed](ch12/062-ai-voice-cloning-the-technology-behind-it-who-s-building-i)
- [063. OpenAI launches Daybreak to combat cyber threats](ch12/063-openai-launches-daybreak-to-combat-cyber-threats)
- [064. Grafana GitHub Token Breach Led to Codebase Download and Extortion Attempt](ch12/064-grafana-github-token-breach-led-to-codebase-download-and-ext)
- [065. Temporarily disabling new user registrations](ch12/065-temporarily-disabling-new-user-registrations)
- [066. Google and Amnesty International teamed up to make Android spyware detectable](ch12/066-google-and-amnesty-international-teamed-up-to-make-android-s)
- [067. RFC 9958: Post-Quantum Cryptography for Engineers](ch12/067-rfc-9958-post-quantum-cryptography-for-engineers)
- [068. Disgruntled researcher releases two more Microsoft zero-days](ch12/068-disgruntled-researcher-releases-two-more-microsoft-zero-days)
- [069. The down fall of bug bounties](ch12/069-the-down-fall-of-bug-bounties)
- [070. Mozilla warns UK: Breaking VPNs will not magically fix Britain's age-check mess](ch12/070-mozilla-warns-uk-breaking-vpns-will-not-magically-fix-brita)
- [071. JetBrains Marketplace Ecosystem Security Update: Malicious AI Plugins](ch12/071-jetbrains-marketplace-ecosystem-security-update-malicious-a)
- [072. LLMReaper: 浏览器扩展的对话窃取攻击](ch12/072-llmreaper)
- [073. Exploiting vulnerabilities in Johnson & Johnson web apps](ch12/073-exploiting-vulnerabilities-in-johnson-johnson-web-apps)
- [074. Romanian Man Faces Up to 30 Years in US Prison Over Vishing Scams](ch12/074-romanian-man-faces-up-to-30-years-in-us-prison-over-vishing)
- [075. GitHub Breached — Employee Device Hack Led to Exfiltration of 3,800+ Internal Repos](ch12/075-github-breached-employee-device-hack-led-to-exfiltration-o)
- [076. Hackers accessed BWH Hotels reservation system for months](ch12/076-hackers-accessed-bwh-hotels-reservation-system-for-months)
- [077. Getting a CVE Without Shipping Slop](ch12/077-getting-a-cve-without-shipping-slop)
- [078. The IT and security field guide to AI adoption | Tines](ch12/078-the-it-and-security-field-guide-to-ai-adoption-tines)
- [079. Unlocking the Cloudflare app ecosystem with OAuth for all](ch12/079-unlocking-the-cloudflare-app-ecosystem-with-oauth-for-all)
- [080. Mythos for Offensive Security: XBOW's Evaluation](ch12/080-mythos-for-offensive-security-xbow-s-evaluation)
- [081. Fedora Hummingbird brings the container security model to a Linux host OS](ch12/081-fedora-hummingbird-brings-the-container-security-model-to-a)
- [082. ShinyHunters hack 7-Eleven: franchisee data and Salesforce records exposed](ch12/082-shinyhunters-hack-7-eleven-franchisee-data-and-salesforce-r)
- [083. GitHub Secret Scanning: AI/ML 驱动的大规模误报降低](ch12/083-github-secret-scanning-ai-ml)
- [084. Scammers Send Physical Phishing Letters to Steal Ledger Wallet Seed Phrases](ch12/084-scammers-send-physical-phishing-letters-to-steal-ledger-wall)
- [085. Guide to Security Operations at Machine Speed](ch12/085-guide-to-security-operations-at-machine-speed)
- [086. Discord 全平台端到端加密](ch12/086-discord)
- [087. Nikesh Arora 20VC 访谈：Token 定价、FDE、SaaS→AI 转型与记忆护城河](ch12/087-nikesh-arora-20vc-token-fde-saas-ai)
- [088. Funnel Builder Flaw Under Active Exploitation Enables WooCommerce Checkout Skimming](ch12/088-funnel-builder-flaw-under-active-exploitation-enables-woocom)
- [089. Forward launches Predict to verify network changes before they reach production - SiliconANGLE](ch12/089-forward-launches-predict-to-verify-network-changes-before-th)
- [090. CyberSecQwen-4B](ch12/090-cybersecqwen-4b)
- [091. GitHub Breached — Employee Device Hack Led to Exfiltration](ch12/091-github-breached-employee-device-hack-led-to-exfiltration)
- [092. AI phishing attacks are on the rise — Are you prepared? | Bitwarden](ch12/092-ai-phishing-attacks-are-on-the-rise-are-you-prepared-bi)
- [093. peerd: 浏览器原生的 AI Agent Harness](ch12/093-peerd-ai-agent-harness)
- [094. Anthropic's bug-hunting Mythos was greatest marketing stunt ever, says cURL creator](ch12/094-anthropic-s-bug-hunting-mythos-was-greatest-marketing-stunt)
- [095. How Semgrep Cut Taint Analysis Time by 75%](ch12/095-how-semgrep-cut-taint-analysis-time-by-75)
- [096. On Post-Quantum Security Adoption](ch12/096-on-post-quantum-security-adoption)
- [097. Jane Street — 形式化方法与编程的未来](ch12/097-jane-street)
- [098. 中国用户安全高性能访问海外 Bedrock](ch12/098-bedrock)
- [099. Drupal to Release Urgent Core Security Updates on May 20, Sites Told to Prepare](ch12/099-drupal-to-release-urgent-core-security-updates-on-may-20-si)
- [100. Cyberscammers are bypassing banks’ security with illicit tools sold on Telegram](ch12/100-cyberscammers-are-bypassing-banks-security-with-illicit-too)
- [101. U of T researchers demonstrate AI worm: self-spreading malware using open-weight models](ch12/101-u-of-t-researchers-demonstrate-ai-worm-self-spreading-malwa)
- [102. Japan’s PM orders cybersecurity review to defend against Anthropic Mythos](ch12/102-japan-s-pm-orders-cybersecurity-review-to-defend-against-ant)
