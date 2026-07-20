# Ch12 安全与治理

> Agent 权限越大，安全责任越重：凭据、审计、合规

> 本章收录 **125 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 9 |
| ⭐⭐ 工程师 | 需编程基础 | 114 |
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
- [018. Towards Native Post-Quantum Private ETH - Privacy - Ethereum Research](ch12/018-towards-native-post-quantum-private-eth-privacy-ethereum)
- [019. Static Devirtualization of Themida](ch12/019-static-devirtualization-of-themida)
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
- [039. 首篇VLA安全综述出炉：机器人听懂指令，安全评测也要升级](ch12/039-vla)
- [040. Disgruntled researcher releases two more Microsoft zero-days](ch12/040-disgruntled-researcher-releases-two-more-microsoft-zero-days)
- [041. Optimize blueprint extraction accuracy in Amazon Bedrock Data Automation](ch12/041-optimize-blueprint-extraction-accuracy-in-amazon-bedrock-dat)
- [042. How Amazon Bedrock catches AI-generated phishing](ch12/042-how-amazon-bedrock-catches-ai-generated-phishing)
- [043. GitLab CI/CD Kill Chain Audit — Black Hills InfoSec 2026 大规模审计研究](ch12/043-gitlab-ci-cd-kill-chain-audit-black-hills-infosec-2026)
- [044. INTERPOL Operation Ramz MENA Cybercrime Networks](ch12/044-interpol-operation-ramz-mena-cybercrime-networks)
- [045. Cyberscammers are bypassing banks' security with illicit tools sold on Telegram](ch12/045-cyberscammers-are-bypassing-banks-security-with-illicit-too)
- [046. Securing AI Agents and Machine Identities](ch12/046-securing-ai-agents-and-machine-identities)
- [047. A 0-click exploit chain for the Pixel 10: When a Door Closes, a Window Opens](ch12/047-a-0-click-exploit-chain-for-the-pixel-10-when-a-door-closes)
- [048. U of T AI Worm：CleverHans Lab 展示可自适应的 AI 蠕虫威胁](ch12/048-u-of-t-ai-worm-cleverhans-lab-ai)
- [049. Canvas LMS 攻击者 ShinyHunters 官方域名被暂停：转向暗网的运营安全转向](ch12/049-canvas-lms-shinyhunters)
- [050. NGINX Rift: Achieving NGINX Remote Code Execution via an 18-Year-Old Vulnerability | depthfirst](ch12/050-nginx-rift-achieving-nginx-remote-code-execution-via-an-18)
- [051. Fake Job Interview Apps Drop JobStealer Malware on Windows and macOS](ch12/051-fake-job-interview-apps-drop-jobstealer-malware-on-windows-a)
- [052. ICO 对 South Staffordshire 处以 96.3 万英镑罚款：2022 年 Cl0p 勒索软件攻击暴露的安全失败](ch12/052-ico-south-staffordshire-96-3-2022-cl0p)
- [053. ICO fines South Staffordshire £963K over 2022 breach](ch12/053-ico-fines-south-staffordshire-963k-over-2022-breach)
- [054. AI in Cybersecurity Training Resources | SANS Institute](ch12/054-ai-in-cybersecurity-training-resources-sans-institute)
- [055. bagel — Fleet 级 Secret Scanning 守护开发工作站](ch12/055-bagel-fleet-secret-scanning)
- [056. Funnel Builder Flaw Under Active Exploitation Enables WooCommerce Checkout Skimming](ch12/056-funnel-builder-flaw-under-active-exploitation-enables-woocom)
- [057. Pwn2Own Berlin 2026, Day Three: DEVCORE Crowned Master of Pwn, $1.298 Million Total](ch12/057-pwn2own-berlin-2026-day-three-devcore-crowned-master-of-pw)
- [058. Autonomous Vulnerability Hunting with MCP](ch12/058-autonomous-vulnerability-hunting-with-mcp)
- [059. A 0-click exploit chain for the Pixel 10: When a Door Closes, a Window Opens](ch12/059-a-0-click-exploit-chain-for-the-pixel-10-when-a-door-closes)
- [060. Static Devirtualization of Themida](ch12/060-static-devirtualization-of-themida)
- [061. TeamPCP Claims Sale of Mistral AI Repositories Amid Mini Shai-Hulud Attack](ch12/061-teampcp-claims-sale-of-mistral-ai-repositories-amid-mini-sha)
- [062. CVE-2026-20182: Unauthenticated Cisco SD-WAN Control Plane Compromise via vHub Authentication Bypass](ch12/062-cve-2026-20182-unauthenticated-cisco-sd-wan-control-plane-c)
- [063. Grafana GitHub Token Breach Led to Codebase Download and Extortion Attempt](ch12/063-grafana-github-token-breach-led-to-codebase-download-and-ext)
- [064. Meta U-turns on encryption push for Instagram as DMs go plaintext](ch12/064-meta-u-turns-on-encryption-push-for-instagram-as-dms-go-plai)
- [065. AI Voice Cloning: The Technology Behind It, Who's Building It, and Where It's Headed](ch12/065-ai-voice-cloning-the-technology-behind-it-who-s-building-i)
- [066. Stealing Passwords via HTML Injection Under a Strict CSP](ch12/066-stealing-passwords-via-html-injection-under-a-strict-csp)
- [067. Google and Amnesty International teamed up to make Android spyware detectable](ch12/067-google-and-amnesty-international-teamed-up-to-make-android-s)
- [068. RFC 9958: Post-Quantum Cryptography for Engineers](ch12/068-rfc-9958-post-quantum-cryptography-for-engineers)
- [069. Disgruntled researcher releases two more Microsoft zero-days](ch12/069-disgruntled-researcher-releases-two-more-microsoft-zero-days)
- [070. OpenAI launches Daybreak to combat cyber threats](ch12/070-openai-launches-daybreak-to-combat-cyber-threats)
- [071. Funnel Builder 漏洞正被利用于 WooCommerce 支付 skimming](ch12/071-funnel-builder-woocommerce-skimming)
- [072. The down fall of bug bounties](ch12/072-the-down-fall-of-bug-bounties)
- [073. Mozilla warns UK: Breaking VPNs will not magically fix Britain's age-check mess](ch12/073-mozilla-warns-uk-breaking-vpns-will-not-magically-fix-brita)
- [074. NIST SP 800-213r1 — IoT Product Cybersecurity Guidelines](ch12/074-nist-sp-800-213r1-iot-product-cybersecurity-guidelines)
- [075. GlassWASM: WebAssembly Malware Found in Trojanized Open VSX Extensions](ch12/075-glasswasm-webassembly-malware-found-in-trojanized-open-vsx)
- [076. JetBrains Marketplace Ecosystem Security Update: Malicious AI Plugins](ch12/076-jetbrains-marketplace-ecosystem-security-update-malicious-a)
- [077. Thinkst Package Proxy: Supply Chain Safety Checks](ch12/077-thinkst-package-proxy-supply-chain-safety-checks)
- [078. AI Detection and Response Aidr a Zero Impact Operating Model](ch12/078-ai-detection-and-response-aidr-a-zero-impact-operating-model)
- [079. GitHub Breached — Employee Device Hack Led to Exfiltration of 3,800+ Internal Repos](ch12/079-github-breached-employee-device-hack-led-to-exfiltration-o)
- [080. Exploiting vulnerabilities in Johnson & Johnson web apps](ch12/080-exploiting-vulnerabilities-in-johnson-johnson-web-apps)
- [081. The IT and security field guide to AI adoption | Tines](ch12/081-the-it-and-security-field-guide-to-ai-adoption-tines)
- [082. Romanian Man Faces Up to 30 Years in US Prison Over Vishing Scams](ch12/082-romanian-man-faces-up-to-30-years-in-us-prison-over-vishing)
- [083. Mythos for Offensive Security: XBOW's Evaluation](ch12/083-mythos-for-offensive-security-xbow-s-evaluation)
- [084. Getting a CVE Without Shipping Slop](ch12/084-getting-a-cve-without-shipping-slop)
- [085. Fedora Hummingbird brings the container security model to a Linux host OS](ch12/085-fedora-hummingbird-brings-the-container-security-model-to-a)
- [086. 飞连 AI 办公安全体系 1+3+N 架构](ch12/086-ai-1-3-n)
- [087. Meet Bluekit: The AI-Powered All-in-One Phishing Kit](ch12/087-meet-bluekit-the-ai-powered-all-in-one-phishing-kit)
- [088. Building is just the beginning: Introducing Discoverability | Lovable](ch12/088-building-is-just-the-beginning-introducing-discoverability)
- [089. Scammers Send Physical Phishing Letters to Steal Ledger Wallet Seed Phrases](ch12/089-scammers-send-physical-phishing-letters-to-steal-ledger-wall)
- [090. Unlocking the Cloudflare app ecosystem with OAuth for all](ch12/090-unlocking-the-cloudflare-app-ecosystem-with-oauth-for-all)
- [091. LLMReaper: 浏览器扩展的对话窃取攻击](ch12/091-llmreaper)
- [092. How Unified EDR and ITDR Stop Attacks Before They Spread](ch12/092-how-unified-edr-and-itdr-stop-attacks-before-they-spread)
- [093. GitHub Secret Scanning: AI/ML 驱动的大规模误报降低](ch12/093-github-secret-scanning-ai-ml)
- [094. Cyberscammers are bypassing banks' security with illicit tools sold on Telegram](ch12/094-cyberscammers-are-bypassing-banks-security-with-illicit-too)
- [095. Guide to Security Operations at Machine Speed](ch12/095-guide-to-security-operations-at-machine-speed)
- [096. Discord 全平台端到端加密](ch12/096-discord)
- [097. Nikesh Arora 20VC 访谈：Token 定价、FDE、SaaS→AI 转型与记忆护城河](ch12/097-nikesh-arora-20vc-token-fde-saas-ai)
- [098. Funnel Builder Flaw Under Active Exploitation Enables WooCommerce Checkout Skimming](ch12/098-funnel-builder-flaw-under-active-exploitation-enables-woocom)
- [099. Forward launches Predict to verify network changes before they reach production - SiliconANGLE](ch12/099-forward-launches-predict-to-verify-network-changes-before-th)
- [100. Static Devirtualization of Themida](ch12/100-static-devirtualization-of-themida)
- [101. GitHub Breached — Employee Device Hack Led to Exfiltration](ch12/101-github-breached-employee-device-hack-led-to-exfiltration)
- [102. CyberSecQwen-4B](ch12/102-cybersecqwen-4b)
- [103. Mystery Microsoft bug leaker keeps the zero-days coming](ch12/103-mystery-microsoft-bug-leaker-keeps-the-zero-days-coming)
- [104. AI phishing attacks are on the rise — Are you prepared? | Bitwarden](ch12/104-ai-phishing-attacks-are-on-the-rise-are-you-prepared-bi)
- [105. cPanel, WHM Release Fixes for Three New Vulnerabilities — Patch Now](ch12/105-cpanel-whm-release-fixes-for-three-new-vulnerabilities-pa)
- [106. Semgrep Intercom Php Security](ch12/106-semgrep-intercom-php-security)
- [107. A DOD contractor’s API flaw exposed military course data and service member records](ch12/107-a-dod-contractor-s-api-flaw-exposed-military-course-data-and)
- [108. peerd: 浏览器原生的 AI Agent Harness](ch12/108-peerd-ai-agent-harness)
- [109. Anthropic's bug-hunting Mythos was greatest marketing stunt ever, says cURL creator](ch12/109-anthropic-s-bug-hunting-mythos-was-greatest-marketing-stunt)
- [110. Incendium Fuzzing Ms Rpc](ch12/110-incendium-fuzzing-ms-rpc)
- [111. OpenSandbox：阿里开源的云端 Agent 安全沙箱（凭据 Vault + egress sidecar）](ch12/111-opensandbox-agent-vault-egress-sidecar)
- [112. How Semgrep Cut Taint Analysis Time by 75%](ch12/112-how-semgrep-cut-taint-analysis-time-by-75)
- [113. Sandworm Hackers Shift From IT Breaches to Critical OT Targets](ch12/113-sandworm-hackers-shift-from-it-breaches-to-critical-ot-targe)
- [114. On Post-Quantum Security Adoption](ch12/114-on-post-quantum-security-adoption)
- [115. Jane Street — 形式化方法与编程的未来](ch12/115-jane-street)
- [116. Semgrep Intercom Php Supply Chain](ch12/116-semgrep-intercom-php-supply-chain)
- [117. ICO fines Cl0p victim South Staffs Water over data breach](ch12/117-ico-fines-cl0p-victim-south-staffs-water-over-data-breach)
- [118. 中国用户安全高性能访问海外 Bedrock](ch12/118-bedrock)
- [119. Drupal to Release Urgent Core Security Updates on May 20, Sites Told to Prepare](ch12/119-drupal-to-release-urgent-core-security-updates-on-may-20-si)
- [120. Cyberscammers are bypassing banks’ security with illicit tools sold on Telegram](ch12/120-cyberscammers-are-bypassing-banks-security-with-illicit-too)
- [121. Hackers accessed BWH Hotels reservation system for months](ch12/121-hackers-accessed-bwh-hotels-reservation-system-for-months)
- [122. ShinyHunters hack 7-Eleven: franchisee data and Salesforce records exposed](ch12/122-shinyhunters-hack-7-eleven-franchisee-data-and-salesforce-r)
- [123. Temporarily disabling new user registrations](ch12/123-temporarily-disabling-new-user-registrations)
- [124. U of T researchers demonstrate AI worm: self-spreading malware using open-weight models](ch12/124-u-of-t-researchers-demonstrate-ai-worm-self-spreading-malwa)
- [125. Japan’s PM orders cybersecurity review to defend against Anthropic Mythos](ch12/125-japan-s-pm-orders-cybersecurity-review-to-defend-against-ant)
