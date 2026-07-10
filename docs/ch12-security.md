# Ch12 安全与治理

> Agent 权限越大，安全责任越重：凭据、审计、合规

> 本章收录 **124 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 9 |
| ⭐⭐ 工程师 | 需编程基础 | 113 |
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
- [002. A Framework for AI Threat Readiness](ch12/002-a-framework-for-ai-threat-readiness)
- [003. Token 撤销触发设备擦除的安全漏洞](ch12/003-token)
- [004. From SSH to REST: A Security-Driven Modernization of Slack's EMR Data Pipelines](ch12/004-from-ssh-to-rest-a-security-driven-modernization-of-slack-s)
- [005. Mozilla warns UK: Breaking VPNs will not magically fix Britain's age-check mess](ch12/005-mozilla-warns-uk-breaking-vpns-will-not-magically-fix-brita)
- [006. Offensive Security Blog](ch12/006-offensive-security-blog)
- [007. Sandworm Hackers Shift From IT Breaches to Critical OT Targets](ch12/007-sandworm-hackers-shift-from-it-breaches-to-critical-ot-targe)
- [008. 5 Things to Know about the CLARITY Act](ch12/008-5-things-to-know-about-the-clarity-act)
- [009. fedora hummingbird brings the container security model to a linux host os](ch12/009-fedora-hummingbird-brings-the-container-security-model-to-a)
- [010. Mythos finds a curl vulnerability](ch12/010-mythos-finds-a-curl-vulnerability)
- [011. 飞来汇借助 AWS Security Agent 构建跨境支付应用的智能安全防线](ch12/011-aws-security-agent)
- [012. Canvas Hackers ShinyHunters Say Their Official Domain Was Suspended](ch12/012-canvas-hackers-shinyhunters-say-their-official-domain-was-su)
- [013. Hermes Agent v0.14.0 核心架构与快速上手](ch12/013-hermes-agent-v0-14-0)
- [014. Bleeding Llama：Ollama 未授权内存泄漏漏洞](ch12/014-bleeding-llama-ollama)
- [015. SHub Reaper: macOS Stealer Spoofs Apple, Google, and Microsoft in a Single Attack Chain](ch12/015-shub-reaper-macos-stealer-spoofs-apple-google-and-microso)
- [016. Resecurity | CVE-2026-20182: Unauthenticated Cisco SD-WAN Control-Plane Compromise via vHub Authentication Bypass](ch12/016-resecurity-cve-2026-20182-unauthenticated-cisco-sd-wan-co)
- [017. LLMReaper - DOM Based AI Conversation Exfiltration via Browser Extensions](ch12/017-llmreaper-dom-based-ai-conversation-exfiltration-via-brows)
- [018. Static Devirtualization of Themida](ch12/018-static-devirtualization-of-themida)
- [019. Towards Native Post-Quantum Private ETH - Privacy - Ethereum Research](ch12/019-towards-native-post-quantum-private-eth-privacy-ethereum)
- [020. Static Devirtualization 2024](ch12/020-static-devirtualization-2024)
- [021. What My Privacy and Security Stack Actually Looks Like](ch12/021-what-my-privacy-and-security-stack-actually-looks-like)
- [022. How an image could compromise your](ch12/022-how-an-image-could-compromise-your)
- [023. Alliance for Critical Infrastructure (ACI): US Critical Infrastructure Cybersecurity Coalition](ch12/023-alliance-for-critical-infrastructure-aci-us-critical-infr)
- [024. Static Devirtualization of Themida](ch12/024-static-devirtualization-of-themida)
- [025. Inference Theft as AI Endpoint Attack Surface — Vercel Token Theft Defense 2026](ch12/025-inference-theft-as-ai-endpoint-attack-surface-vercel-token)
- [026. Apple corecrypto formal verification blueprint — post-quantum ML-KEM/ML-DSA in iMessage](ch12/026-apple-corecrypto-formal-verification-blueprint-post-quantu)
- [027. OpenClaw 安全和功能增强实践](ch12/027-openclaw)
- [028. xz-utils Backdoor 2 Years On — Maintainer Trust Hijack Pattern Beyond CVE Scanners](ch12/028-xz-utils-backdoor-2-years-on-maintainer-trust-hijack-patte)
- [029. Disgruntled researcher releases two more Microsoft zero-days](ch12/029-disgruntled-researcher-releases-two-more-microsoft-zero-days)
- [030. Mythos 对企业安全架构影响的思考](ch12/030-mythos)
- [031. Disgruntled researcher releases two more Microsoft zero-days](ch12/031-disgruntled-researcher-releases-two-more-microsoft-zero-days)
- [032. Where OpenClaw Security Is Heading — OpenClaw Blog](ch12/032-where-openclaw-security-is-heading-openclaw-blog)
- [033. Canvas Breach Disrupts Schools & Colleges Nationwide](ch12/033-canvas-breach-disrupts-schools-colleges-nationwide)
- [034. 别让你的 Amazon Bedrock 模型为他人打工——API 调用安全防护指南](ch12/034-amazon-bedrock-api)
- [035. Postmortem: TanStack npm supply-chain compromise | TanStack Blog](ch12/035-postmortem-tanstack-npm-supply-chain-compromise-tanstack)
- [036. 100万+AI服务暴露在公网——HackerNews扫描报告](ch12/036-100-ai-hackernews)
- [037. Canvas Hackers ShinyHunters Say Their Official Domain Was Suspended](ch12/037-canvas-hackers-shinyhunters-say-their-official-domain-was-su)
- [038. Adversaries Leverage AI for Vulnerability Exploitation, Augmented Operations, and Initial Access](ch12/038-adversaries-leverage-ai-for-vulnerability-exploitation-augm)
- [039. Disgruntled researcher releases two more Microsoft zero-days](ch12/039-disgruntled-researcher-releases-two-more-microsoft-zero-days)
- [040. How Amazon Bedrock catches AI-generated phishing](ch12/040-how-amazon-bedrock-catches-ai-generated-phishing)
- [041. GitLab CI/CD Kill Chain Audit — Black Hills InfoSec 2026 大规模审计研究](ch12/041-gitlab-ci-cd-kill-chain-audit-black-hills-infosec-2026)
- [042. INTERPOL Operation Ramz MENA Cybercrime Networks](ch12/042-interpol-operation-ramz-mena-cybercrime-networks)
- [043. Cyberscammers are bypassing banks' security with illicit tools sold on Telegram](ch12/043-cyberscammers-are-bypassing-banks-security-with-illicit-too)
- [044. Securing AI Agents and Machine Identities](ch12/044-securing-ai-agents-and-machine-identities)
- [045. A 0-click exploit chain for the Pixel 10: When a Door Closes, a Window Opens](ch12/045-a-0-click-exploit-chain-for-the-pixel-10-when-a-door-closes)
- [046. U of T AI Worm：CleverHans Lab 展示可自适应的 AI 蠕虫威胁](ch12/046-u-of-t-ai-worm-cleverhans-lab-ai)
- [047. Optimize blueprint extraction accuracy in Amazon Bedrock Data Automation](ch12/047-optimize-blueprint-extraction-accuracy-in-amazon-bedrock-dat)
- [048. Canvas LMS 攻击者 ShinyHunters 官方域名被暂停：转向暗网的运营安全转向](ch12/048-canvas-lms-shinyhunters)
- [049. NGINX Rift: Achieving NGINX Remote Code Execution via an 18-Year-Old Vulnerability | depthfirst](ch12/049-nginx-rift-achieving-nginx-remote-code-execution-via-an-18)
- [050. Fake Job Interview Apps Drop JobStealer Malware on Windows and macOS](ch12/050-fake-job-interview-apps-drop-jobstealer-malware-on-windows-a)
- [051. ICO 对 South Staffordshire 处以 96.3 万英镑罚款：2022 年 Cl0p 勒索软件攻击暴露的安全失败](ch12/051-ico-south-staffordshire-96-3-2022-cl0p)
- [052. AI in Cybersecurity Training Resources | SANS Institute](ch12/052-ai-in-cybersecurity-training-resources-sans-institute)
- [053. bagel — Fleet 级 Secret Scanning 守护开发工作站](ch12/053-bagel-fleet-secret-scanning)
- [054. Funnel Builder Flaw Under Active Exploitation Enables WooCommerce Checkout Skimming](ch12/054-funnel-builder-flaw-under-active-exploitation-enables-woocom)
- [055. Pwn2Own Berlin 2026, Day Three: DEVCORE Crowned Master of Pwn, $1.298 Million Total](ch12/055-pwn2own-berlin-2026-day-three-devcore-crowned-master-of-pw)
- [056. Autonomous Vulnerability Hunting with MCP](ch12/056-autonomous-vulnerability-hunting-with-mcp)
- [057. A 0-click exploit chain for the Pixel 10: When a Door Closes, a Window Opens](ch12/057-a-0-click-exploit-chain-for-the-pixel-10-when-a-door-closes)
- [058. Static Devirtualization of Themida](ch12/058-static-devirtualization-of-themida)
- [059. TeamPCP Claims Sale of Mistral AI Repositories Amid Mini Shai-Hulud Attack](ch12/059-teampcp-claims-sale-of-mistral-ai-repositories-amid-mini-sha)
- [060. CVE-2026-20182: Unauthenticated Cisco SD-WAN Control Plane Compromise via vHub Authentication Bypass](ch12/060-cve-2026-20182-unauthenticated-cisco-sd-wan-control-plane-c)
- [061. Grafana GitHub Token Breach Led to Codebase Download and Extortion Attempt](ch12/061-grafana-github-token-breach-led-to-codebase-download-and-ext)
- [062. Meta U-turns on encryption push for Instagram as DMs go plaintext](ch12/062-meta-u-turns-on-encryption-push-for-instagram-as-dms-go-plai)
- [063. AI Voice Cloning: The Technology Behind It, Who's Building It, and Where It's Headed](ch12/063-ai-voice-cloning-the-technology-behind-it-who-s-building-i)
- [064. Stealing Passwords via HTML Injection Under a Strict CSP](ch12/064-stealing-passwords-via-html-injection-under-a-strict-csp)
- [065. Google and Amnesty International teamed up to make Android spyware detectable](ch12/065-google-and-amnesty-international-teamed-up-to-make-android-s)
- [066. RFC 9958: Post-Quantum Cryptography for Engineers](ch12/066-rfc-9958-post-quantum-cryptography-for-engineers)
- [067. Disgruntled researcher releases two more Microsoft zero-days](ch12/067-disgruntled-researcher-releases-two-more-microsoft-zero-days)
- [068. OpenAI launches Daybreak to combat cyber threats](ch12/068-openai-launches-daybreak-to-combat-cyber-threats)
- [069. Funnel Builder 漏洞正被利用于 WooCommerce 支付 skimming](ch12/069-funnel-builder-woocommerce-skimming)
- [070. The down fall of bug bounties](ch12/070-the-down-fall-of-bug-bounties)
- [071. Mozilla warns UK: Breaking VPNs will not magically fix Britain's age-check mess](ch12/071-mozilla-warns-uk-breaking-vpns-will-not-magically-fix-brita)
- [072. NIST SP 800-213r1 — IoT Product Cybersecurity Guidelines](ch12/072-nist-sp-800-213r1-iot-product-cybersecurity-guidelines)
- [073. GlassWASM: WebAssembly Malware Found in Trojanized Open VSX Extensions](ch12/073-glasswasm-webassembly-malware-found-in-trojanized-open-vsx)
- [074. JetBrains Marketplace Ecosystem Security Update: Malicious AI Plugins](ch12/074-jetbrains-marketplace-ecosystem-security-update-malicious-a)
- [075. Thinkst Package Proxy: Supply Chain Safety Checks](ch12/075-thinkst-package-proxy-supply-chain-safety-checks)
- [076. AI Detection and Response Aidr a Zero Impact Operating Model](ch12/076-ai-detection-and-response-aidr-a-zero-impact-operating-model)
- [077. GitHub Breached — Employee Device Hack Led to Exfiltration of 3,800+ Internal Repos](ch12/077-github-breached-employee-device-hack-led-to-exfiltration-o)
- [078. Exploiting vulnerabilities in Johnson & Johnson web apps](ch12/078-exploiting-vulnerabilities-in-johnson-johnson-web-apps)
- [079. The IT and security field guide to AI adoption | Tines](ch12/079-the-it-and-security-field-guide-to-ai-adoption-tines)
- [080. Romanian Man Faces Up to 30 Years in US Prison Over Vishing Scams](ch12/080-romanian-man-faces-up-to-30-years-in-us-prison-over-vishing)
- [081. Mythos for Offensive Security: XBOW's Evaluation](ch12/081-mythos-for-offensive-security-xbow-s-evaluation)
- [082. Getting a CVE Without Shipping Slop](ch12/082-getting-a-cve-without-shipping-slop)
- [083. Fedora Hummingbird brings the container security model to a Linux host OS](ch12/083-fedora-hummingbird-brings-the-container-security-model-to-a)
- [084. Meet Bluekit: The AI-Powered All-in-One Phishing Kit](ch12/084-meet-bluekit-the-ai-powered-all-in-one-phishing-kit)
- [085. Building is just the beginning: Introducing Discoverability | Lovable](ch12/085-building-is-just-the-beginning-introducing-discoverability)
- [086. Scammers Send Physical Phishing Letters to Steal Ledger Wallet Seed Phrases](ch12/086-scammers-send-physical-phishing-letters-to-steal-ledger-wall)
- [087. Unlocking the Cloudflare app ecosystem with OAuth for all](ch12/087-unlocking-the-cloudflare-app-ecosystem-with-oauth-for-all)
- [088. LLMReaper: 浏览器扩展的对话窃取攻击](ch12/088-llmreaper)
- [089. How Unified EDR and ITDR Stop Attacks Before They Spread](ch12/089-how-unified-edr-and-itdr-stop-attacks-before-they-spread)
- [090. GitHub Secret Scanning: AI/ML 驱动的大规模误报降低](ch12/090-github-secret-scanning-ai-ml)
- [091. Cyberscammers are bypassing banks' security with illicit tools sold on Telegram](ch12/091-cyberscammers-are-bypassing-banks-security-with-illicit-too)
- [092. Guide to Security Operations at Machine Speed](ch12/092-guide-to-security-operations-at-machine-speed)
- [093. Discord 全平台端到端加密](ch12/093-discord)
- [094. Nikesh Arora 20VC 访谈：Token 定价、FDE、SaaS→AI 转型与记忆护城河](ch12/094-nikesh-arora-20vc-token-fde-saas-ai)
- [095. Funnel Builder Flaw Under Active Exploitation Enables WooCommerce Checkout Skimming](ch12/095-funnel-builder-flaw-under-active-exploitation-enables-woocom)
- [096. Forward launches Predict to verify network changes before they reach production - SiliconANGLE](ch12/096-forward-launches-predict-to-verify-network-changes-before-th)
- [097. Static Devirtualization of Themida](ch12/097-static-devirtualization-of-themida)
- [098. GitHub Breached — Employee Device Hack Led to Exfiltration](ch12/098-github-breached-employee-device-hack-led-to-exfiltration)
- [099. CyberSecQwen-4B](ch12/099-cybersecqwen-4b)
- [100. Mystery Microsoft bug leaker keeps the zero-days coming](ch12/100-mystery-microsoft-bug-leaker-keeps-the-zero-days-coming)
- [101. AI phishing attacks are on the rise — Are you prepared? | Bitwarden](ch12/101-ai-phishing-attacks-are-on-the-rise-are-you-prepared-bi)
- [102. cPanel, WHM Release Fixes for Three New Vulnerabilities — Patch Now](ch12/102-cpanel-whm-release-fixes-for-three-new-vulnerabilities-pa)
- [103. Semgrep Intercom Php Security](ch12/103-semgrep-intercom-php-security)
- [104. A DOD contractor’s API flaw exposed military course data and service member records](ch12/104-a-dod-contractor-s-api-flaw-exposed-military-course-data-and)
- [105. peerd: 浏览器原生的 AI Agent Harness](ch12/105-peerd-ai-agent-harness)
- [106. 飞连 AI 办公安全体系 1+3+N 架构](ch12/106-ai-1-3-n)
- [107. Anthropic's bug-hunting Mythos was greatest marketing stunt ever, says cURL creator](ch12/107-anthropic-s-bug-hunting-mythos-was-greatest-marketing-stunt)
- [108. Incendium Fuzzing Ms Rpc](ch12/108-incendium-fuzzing-ms-rpc)
- [109. OpenSandbox：阿里开源的云端 Agent 安全沙箱（凭据 Vault + egress sidecar）](ch12/109-opensandbox-agent-vault-egress-sidecar)
- [110. How Semgrep Cut Taint Analysis Time by 75%](ch12/110-how-semgrep-cut-taint-analysis-time-by-75)
- [111. Sandworm Hackers Shift From IT Breaches to Critical OT Targets](ch12/111-sandworm-hackers-shift-from-it-breaches-to-critical-ot-targe)
- [112. On Post-Quantum Security Adoption](ch12/112-on-post-quantum-security-adoption)
- [113. Jane Street — 形式化方法与编程的未来](ch12/113-jane-street)
- [114. Semgrep Intercom Php Supply Chain](ch12/114-semgrep-intercom-php-supply-chain)
- [115. ICO fines Cl0p victim South Staffs Water over data breach](ch12/115-ico-fines-cl0p-victim-south-staffs-water-over-data-breach)
- [116. Drupal to Release Urgent Core Security Updates on May 20, Sites Told to Prepare](ch12/116-drupal-to-release-urgent-core-security-updates-on-may-20-si)
- [117. Cyberscammers are bypassing banks’ security with illicit tools sold on Telegram](ch12/117-cyberscammers-are-bypassing-banks-security-with-illicit-too)
- [118. Hackers accessed BWH Hotels reservation system for months](ch12/118-hackers-accessed-bwh-hotels-reservation-system-for-months)
- [119. ICO fines South Staffordshire £963K over 2022 breach](ch12/119-ico-fines-south-staffordshire-963k-over-2022-breach)
- [120. 中国用户安全高性能访问海外 Bedrock](ch12/120-bedrock)
- [121. ShinyHunters hack 7-Eleven: franchisee data and Salesforce records exposed](ch12/121-shinyhunters-hack-7-eleven-franchisee-data-and-salesforce-r)
- [122. Temporarily disabling new user registrations](ch12/122-temporarily-disabling-new-user-registrations)
- [123. U of T researchers demonstrate AI worm: self-spreading malware using open-weight models](ch12/123-u-of-t-researchers-demonstrate-ai-worm-self-spreading-malwa)
- [124. Japan’s PM orders cybersecurity review to defend against Anthropic Mythos](ch12/124-japan-s-pm-orders-cybersecurity-review-to-defend-against-ant)
