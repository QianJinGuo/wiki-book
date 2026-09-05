# Ch12 安全与治理

> Agent 权限越大，安全责任越重：凭据、审计、合规

> 本章收录 **105 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 12 |
| ⭐⭐ 工程师 | 需编程基础 | 13 |
| ⭐⭐⭐ 专家 | 需ML基础 | 47 |
| ⭐⭐⭐⭐ 科学家 | 需研究背景 | 26 |
| ⭐⭐⭐⭐⭐ 大师 | 前沿/哲学 | 7 |

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
- [006. Sandworm Hackers Shift From IT Breaches to Critical OT Targets](ch12/006-sandworm-hackers-shift-from-it-breaches-to-critical-ot-targe)
- [007. peerd: 浏览器原生的 AI Agent Harness](ch12/007-peerd-ai-agent-harness)
- [008. How Semgrep Cut Taint Analysis Time by 75%](ch12/008-how-semgrep-cut-taint-analysis-time-by-75)
- [009. On Post-Quantum Security Adoption](ch12/009-on-post-quantum-security-adoption)
- [010. Jane Street — 形式化方法与编程的未来](ch12/010-jane-street)
- [011. 中国用户安全高性能访问海外 Bedrock](ch12/011-bedrock)
- [012. Cyberscammers are bypassing banks’ security with illicit tools sold on Telegram](ch12/012-cyberscammers-are-bypassing-banks-security-with-illicit-too)
- [013. Towards Native Post-Quantum Private ETH - Privacy - Ethereum Research](ch12/013-towards-native-post-quantum-private-eth-privacy-ethereum)
- [014. Mozilla warns UK: Breaking VPNs will not magically fix Britain's age-check mess](ch12/014-mozilla-warns-uk-breaking-vpns-will-not-magically-fix-brita)
- [015. Funnel Builder Flaw Under Active Exploitation Enables WooCommerce Checkout Skimming](ch12/015-funnel-builder-flaw-under-active-exploitation-enables-woocom)
- [016. NIST SP 800-213r1 — IoT Product Cybersecurity Guidelines](ch12/016-nist-sp-800-213r1-iot-product-cybersecurity-guidelines)
- [017. OpenAI launches Daybreak to combat cyber threats](ch12/017-openai-launches-daybreak-to-combat-cyber-threats)
- [018. Grafana GitHub Token Breach Led to Codebase Download and Extortion Attempt](ch12/018-grafana-github-token-breach-led-to-codebase-download-and-ext)
- [019. JetBrains Marketplace Ecosystem Security Update: Malicious AI Plugins](ch12/019-jetbrains-marketplace-ecosystem-security-update-malicious-a)
- [020. Unlocking the Cloudflare app ecosystem with OAuth for all](ch12/020-unlocking-the-cloudflare-app-ecosystem-with-oauth-for-all)
- [021. Mythos for Offensive Security: XBOW's Evaluation](ch12/021-mythos-for-offensive-security-xbow-s-evaluation)
- [022. Nikesh Arora 20VC 访谈：Token 定价、FDE、SaaS→AI 转型与记忆护城河](ch12/022-nikesh-arora-20vc-token-fde-saas-ai)
- [023. Anthropic's bug-hunting Mythos was greatest marketing stunt ever, says cURL creator](ch12/023-anthropic-s-bug-hunting-mythos-was-greatest-marketing-stunt)
- [024. Semgrep Intercom Php Supply Chain](ch12/024-semgrep-intercom-php-supply-chain)
- [025. Japan’s PM orders cybersecurity review to defend against Anthropic Mythos](ch12/025-japan-s-pm-orders-cybersecurity-review-to-defend-against-ant)
- [026. Alliance for Critical Infrastructure (ACI): US Critical Infrastructure Cybersecurity Coalition](ch12/026-alliance-for-critical-infrastructure-aci-us-critical-infr)
- [027. Disgruntled researcher releases two more Microsoft zero-days](ch12/027-disgruntled-researcher-releases-two-more-microsoft-zero-days)
- [028. Adversaries Leverage AI for Vulnerability Exploitation, Augmented Operations, and Initial Access](ch12/028-adversaries-leverage-ai-for-vulnerability-exploitation-augm)
- [029. 别让你的 Amazon Bedrock 模型为他人打工——API 调用安全防护指南](ch12/029-amazon-bedrock-api)
- [030. Canvas Hackers ShinyHunters Say Their Official Domain Was Suspended](ch12/030-canvas-hackers-shinyhunters-say-their-official-domain-was-su)
- [031. Postmortem: TanStack npm supply-chain compromise | TanStack Blog](ch12/031-postmortem-tanstack-npm-supply-chain-compromise-tanstack)
- [032. Cyberscammers are bypassing banks' security with illicit tools sold on Telegram](ch12/032-cyberscammers-are-bypassing-banks-security-with-illicit-too)
- [033. Canvas LMS 攻击者 ShinyHunters 官方域名被暂停：转向暗网的运营安全转向](ch12/033-canvas-lms-shinyhunters)
- [034. U of T AI Worm：CleverHans Lab 展示可自适应的 AI 蠕虫威胁](ch12/034-u-of-t-ai-worm-cleverhans-lab-ai)
- [035. Fake Job Interview Apps Drop JobStealer Malware on Windows and macOS](ch12/035-fake-job-interview-apps-drop-jobstealer-malware-on-windows-a)
- [036. ICO 对 South Staffordshire 处以 96.3 万英镑罚款：2022 年 Cl0p 勒索软件攻击暴露的安全失败](ch12/036-ico-south-staffordshire-96-3-2022-cl0p)
- [037. NGINX Rift: Achieving NGINX Remote Code Execution via an 18-Year-Old Vulnerability | depthfirst](ch12/037-nginx-rift-achieving-nginx-remote-code-execution-via-an-18)
- [038. Static Devirtualization of Themida](ch12/038-static-devirtualization-of-themida)
- [039. Offensive Security Blog](ch12/039-offensive-security-blog)
- [040. ICO fines Cl0p victim South Staffs Water over data breach](ch12/040-ico-fines-cl0p-victim-south-staffs-water-over-data-breach)
- [041. A 0-click exploit chain for the Pixel 10: When a Door Closes, a Window Opens](ch12/041-a-0-click-exploit-chain-for-the-pixel-10-when-a-door-closes)
- [042. Pwn2Own Berlin 2026, Day Three: DEVCORE Crowned Master of Pwn, $1.298 Million Total](ch12/042-pwn2own-berlin-2026-day-three-devcore-crowned-master-of-pw)
- [043. Autonomous Vulnerability Hunting with MCP](ch12/043-autonomous-vulnerability-hunting-with-mcp)
- [044. Sandworm Hackers Shift From IT Breaches to Critical OT Targets](ch12/044-sandworm-hackers-shift-from-it-breaches-to-critical-ot-targe)
- [045. How Unified EDR and ITDR Stop Attacks Before They Spread](ch12/045-how-unified-edr-and-itdr-stop-attacks-before-they-spread)
- [046. Static Devirtualization of Themida](ch12/046-static-devirtualization-of-themida)
- [047. TeamPCP Claims Sale of Mistral AI Repositories Amid Mini Shai-Hulud Attack](ch12/047-teampcp-claims-sale-of-mistral-ai-repositories-amid-mini-sha)
- [048. AI Voice Cloning: The Technology Behind It, Who's Building It, and Where It's Headed](ch12/048-ai-voice-cloning-the-technology-behind-it-who-s-building-i)
- [049. Temporarily disabling new user registrations](ch12/049-temporarily-disabling-new-user-registrations)
- [050. Google and Amnesty International teamed up to make Android spyware detectable](ch12/050-google-and-amnesty-international-teamed-up-to-make-android-s)
- [051. RFC 9958: Post-Quantum Cryptography for Engineers](ch12/051-rfc-9958-post-quantum-cryptography-for-engineers)
- [052. Disgruntled researcher releases two more Microsoft zero-days](ch12/052-disgruntled-researcher-releases-two-more-microsoft-zero-days)
- [053. The down fall of bug bounties](ch12/053-the-down-fall-of-bug-bounties)
- [054. Mozilla warns UK: Breaking VPNs will not magically fix Britain's age-check mess](ch12/054-mozilla-warns-uk-breaking-vpns-will-not-magically-fix-brita)
- [055. LLMReaper: 浏览器扩展的对话窃取攻击](ch12/055-llmreaper)
- [056. Exploiting vulnerabilities in Johnson & Johnson web apps](ch12/056-exploiting-vulnerabilities-in-johnson-johnson-web-apps)
- [057. 5 Things to Know about the CLARITY Act](ch12/057-5-things-to-know-about-the-clarity-act)
- [058. Romanian Man Faces Up to 30 Years in US Prison Over Vishing Scams](ch12/058-romanian-man-faces-up-to-30-years-in-us-prison-over-vishing)
- [059. GitHub Breached — Employee Device Hack Led to Exfiltration of 3,800+ Internal Repos](ch12/059-github-breached-employee-device-hack-led-to-exfiltration-o)
- [060. Hackers accessed BWH Hotels reservation system for months](ch12/060-hackers-accessed-bwh-hotels-reservation-system-for-months)
- [061. The IT and security field guide to AI adoption | Tines](ch12/061-the-it-and-security-field-guide-to-ai-adoption-tines)
- [062. Fedora Hummingbird brings the container security model to a Linux host OS](ch12/062-fedora-hummingbird-brings-the-container-security-model-to-a)
- [063. ShinyHunters hack 7-Eleven: franchisee data and Salesforce records exposed](ch12/063-shinyhunters-hack-7-eleven-franchisee-data-and-salesforce-r)
- [064. Scammers Send Physical Phishing Letters to Steal Ledger Wallet Seed Phrases](ch12/064-scammers-send-physical-phishing-letters-to-steal-ledger-wall)
- [065. Guide to Security Operations at Machine Speed](ch12/065-guide-to-security-operations-at-machine-speed)
- [066. Discord 全平台端到端加密](ch12/066-discord)
- [067. Funnel Builder Flaw Under Active Exploitation Enables WooCommerce Checkout Skimming](ch12/067-funnel-builder-flaw-under-active-exploitation-enables-woocom)
- [068. Forward launches Predict to verify network changes before they reach production - SiliconANGLE](ch12/068-forward-launches-predict-to-verify-network-changes-before-th)
- [069. GitHub Breached — Employee Device Hack Led to Exfiltration](ch12/069-github-breached-employee-device-hack-led-to-exfiltration)
- [070. CyberSecQwen-4B](ch12/070-cybersecqwen-4b)
- [071. AI phishing attacks are on the rise — Are you prepared? | Bitwarden](ch12/071-ai-phishing-attacks-are-on-the-rise-are-you-prepared-bi)
- [072. Drupal to Release Urgent Core Security Updates on May 20, Sites Told to Prepare](ch12/072-drupal-to-release-urgent-core-security-updates-on-may-20-si)
- [073. Mythos finds a curl vulnerability](ch12/073-mythos-finds-a-curl-vulnerability)
- [074. 飞来汇借助 AWS Security Agent 构建跨境支付应用的智能安全防线](ch12/074-aws-security-agent)
- [075. Canvas Hackers ShinyHunters Say Their Official Domain Was Suspended](ch12/075-canvas-hackers-shinyhunters-say-their-official-domain-was-su)
- [076. LLMReaper - DOM Based AI Conversation Exfiltration via Browser Extensions](ch12/076-llmreaper-dom-based-ai-conversation-exfiltration-via-brows)
- [077. Resecurity | CVE-2026-20182: Unauthenticated Cisco SD-WAN Control-Plane Compromise via vHub Authentication Bypass](ch12/077-resecurity-cve-2026-20182-unauthenticated-cisco-sd-wan-co)
- [078. Static Devirtualization of Themida](ch12/078-static-devirtualization-of-themida)
- [079. What My Privacy and Security Stack Actually Looks Like](ch12/079-what-my-privacy-and-security-stack-actually-looks-like)
- [080. Inference Theft as AI Endpoint Attack Surface — Vercel Token Theft Defense 2026](ch12/080-inference-theft-as-ai-endpoint-attack-surface-vercel-token)
- [081. Apple corecrypto formal verification blueprint — post-quantum ML-KEM/ML-DSA in iMessage](ch12/081-apple-corecrypto-formal-verification-blueprint-post-quantu)
- [082. OpenClaw 安全和功能增强实践](ch12/082-openclaw)
- [083. xz-utils Backdoor 2 Years On — Maintainer Trust Hijack Pattern Beyond CVE Scanners](ch12/083-xz-utils-backdoor-2-years-on-maintainer-trust-hijack-patte)
- [084. U of T researchers demonstrate AI worm: self-spreading malware using open-weight models](ch12/084-u-of-t-researchers-demonstrate-ai-worm-self-spreading-malwa)
- [085. Disgruntled researcher releases two more Microsoft zero-days](ch12/085-disgruntled-researcher-releases-two-more-microsoft-zero-days)
- [086. 100万+AI服务暴露在公网——HackerNews扫描报告](ch12/086-100-ai-hackernews)
- [087. Optimize blueprint extraction accuracy in Amazon Bedrock Data Automation](ch12/087-optimize-blueprint-extraction-accuracy-in-amazon-bedrock-dat)
- [088. Disgruntled researcher releases two more Microsoft zero-days](ch12/088-disgruntled-researcher-releases-two-more-microsoft-zero-days)
- [089. GitLab CI/CD Kill Chain Audit — Black Hills InfoSec 2026 大规模审计研究](ch12/089-gitlab-ci-cd-kill-chain-audit-black-hills-infosec-2026)
- [090. INTERPOL Operation Ramz MENA Cybercrime Networks](ch12/090-interpol-operation-ramz-mena-cybercrime-networks)
- [091. AI in Cybersecurity Training Resources | SANS Institute](ch12/091-ai-in-cybersecurity-training-resources-sans-institute)
- [092. A 0-click exploit chain for the Pixel 10: When a Door Closes, a Window Opens](ch12/092-a-0-click-exploit-chain-for-the-pixel-10-when-a-door-closes)
- [093. bagel — Fleet 级 Secret Scanning 守护开发工作站](ch12/093-bagel-fleet-secret-scanning)
- [094. GlassWASM: WebAssembly Malware Found in Trojanized Open VSX Extensions](ch12/094-glasswasm-webassembly-malware-found-in-trojanized-open-vsx)
- [095. CVE-2026-20182: Unauthenticated Cisco SD-WAN Control Plane Compromise via vHub Authentication Bypass](ch12/095-cve-2026-20182-unauthenticated-cisco-sd-wan-control-plane-c)
- [096. Stealing Passwords via HTML Injection Under a Strict CSP](ch12/096-stealing-passwords-via-html-injection-under-a-strict-csp)
- [097. Getting a CVE Without Shipping Slop](ch12/097-getting-a-cve-without-shipping-slop)
- [098. GitHub Secret Scanning: AI/ML 驱动的大规模误报降低](ch12/098-github-secret-scanning-ai-ml)
- [099. Hermes Agent v0.14.0 核心架构与快速上手](ch12/099-hermes-agent-v0-14-0)
- [100. Bleeding Llama：Ollama 未授权内存泄漏漏洞](ch12/100-bleeding-llama-ollama)
- [101. SHub Reaper: macOS Stealer Spoofs Apple, Google, and Microsoft in a Single Attack Chain](ch12/101-shub-reaper-macos-stealer-spoofs-apple-google-and-microso)
- [102. Static Devirtualization 2024](ch12/102-static-devirtualization-2024)
- [103. How an image could compromise your](ch12/103-how-an-image-could-compromise-your)
- [104. Static Devirtualization of Themida](ch12/104-static-devirtualization-of-themida)
- [105. Securing AI Agents and Machine Identities](ch12/105-securing-ai-agents-and-machine-identities)
