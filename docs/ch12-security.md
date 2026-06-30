# Ch12 安全与治理

> Agent 权限越大，安全责任越重：凭据、审计、合规

> 本章收录 **121 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 9 |
| ⭐⭐ 工程师 | 需编程基础 | 110 |
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

- [001. CISA urges critical infrastructure firms to 'fortify' before it's too late | Cybersecurity Dive](ch12/001-cisa-urges-critical-infrastructure-firms-to-fortify-before.md)
- [002. A Framework for AI Threat Readiness](ch12/002-a-framework-for-ai-threat-readiness.md)
- [003. Token 撤销触发设备擦除的安全漏洞](ch12/003-token.md)
- [004. From SSH to REST: A Security-Driven Modernization of Slack's EMR Data Pipelines](ch12/004-from-ssh-to-rest-a-security-driven-modernization-of-slack-s.md)
- [005. Mozilla warns UK: Breaking VPNs will not magically fix Britain's age-check mess](ch12/005-mozilla-warns-uk-breaking-vpns-will-not-magically-fix-brita.md)
- [006. Offensive Security Blog](ch12/006-offensive-security-blog.md)
- [007. Sandworm Hackers Shift From IT Breaches to Critical OT Targets](ch12/007-sandworm-hackers-shift-from-it-breaches-to-critical-ot-targe.md)
- [008. 5 Things to Know about the CLARITY Act](ch12/008-5-things-to-know-about-the-clarity-act.md)
- [009. fedora hummingbird brings the container security model to a linux host os](ch12/009-fedora-hummingbird-brings-the-container-security-model-to-a.md)
- [010. Mythos finds a curl vulnerability](ch12/010-mythos-finds-a-curl-vulnerability.md)
- [011. 飞来汇借助 AWS Security Agent 构建跨境支付应用的智能安全防线](ch12/011-aws-security-agent.md)
- [012. Canvas Hackers ShinyHunters Say Their Official Domain Was Suspended](ch12/012-canvas-hackers-shinyhunters-say-their-official-domain-was-su.md)
- [013. Hermes Agent v0.14.0 核心架构与快速上手](ch12/013-hermes-agent-v0-14-0.md)
- [014. Bleeding Llama：Ollama 未授权内存泄漏漏洞](ch12/014-bleeding-llama-ollama.md)
- [015. SHub Reaper: macOS Stealer Spoofs Apple, Google, and Microsoft in a Single Attack Chain](ch12/015-shub-reaper-macos-stealer-spoofs-apple-google-and-microso.md)
- [016. Resecurity | CVE-2026-20182: Unauthenticated Cisco SD-WAN Control-Plane Compromise via vHub Authentication Bypass](ch12/016-resecurity-cve-2026-20182-unauthenticated-cisco-sd-wan-co.md)
- [017. LLMReaper - DOM Based AI Conversation Exfiltration via Browser Extensions](ch12/017-llmreaper-dom-based-ai-conversation-exfiltration-via-brows.md)
- [018. Static Devirtualization of Themida](ch12/018-static-devirtualization-of-themida.md)
- [019. Towards Native Post-Quantum Private ETH - Privacy - Ethereum Research](ch12/019-towards-native-post-quantum-private-eth-privacy-ethereum.md)
- [020. Static Devirtualization 2024](ch12/020-static-devirtualization-2024.md)
- [021. What My Privacy and Security Stack Actually Looks Like](ch12/021-what-my-privacy-and-security-stack-actually-looks-like.md)
- [022. How an image could compromise your](ch12/022-how-an-image-could-compromise-your.md)
- [023. Alliance for Critical Infrastructure (ACI): US Critical Infrastructure Cybersecurity Coalition](ch12/023-alliance-for-critical-infrastructure-aci-us-critical-infr.md)
- [024. Static Devirtualization of Themida](ch12/024-static-devirtualization-of-themida.md)
- [025. Inference Theft as AI Endpoint Attack Surface — Vercel Token Theft Defense 2026](ch12/025-inference-theft-as-ai-endpoint-attack-surface-vercel-token.md)
- [026. Apple corecrypto formal verification blueprint — post-quantum ML-KEM/ML-DSA in iMessage](ch12/026-apple-corecrypto-formal-verification-blueprint-post-quantu.md)
- [027. OpenClaw 安全和功能增强实践](ch12/027-openclaw.md)
- [028. xz-utils Backdoor 2 Years On — Maintainer Trust Hijack Pattern Beyond CVE Scanners](ch12/028-xz-utils-backdoor-2-years-on-maintainer-trust-hijack-patte.md)
- [029. Disgruntled researcher releases two more Microsoft zero-days](ch12/029-disgruntled-researcher-releases-two-more-microsoft-zero-days.md)
- [030. Disgruntled researcher releases two more Microsoft zero-days](ch12/030-disgruntled-researcher-releases-two-more-microsoft-zero-days.md)
- [031. Where OpenClaw Security Is Heading — OpenClaw Blog](ch12/031-where-openclaw-security-is-heading-openclaw-blog.md)
- [032. Canvas Breach Disrupts Schools & Colleges Nationwide](ch12/032-canvas-breach-disrupts-schools-colleges-nationwide.md)
- [033. 别让你的 Amazon Bedrock 模型为他人打工——API 调用安全防护指南](ch12/033-amazon-bedrock-api.md)
- [034. Postmortem: TanStack npm supply-chain compromise | TanStack Blog](ch12/034-postmortem-tanstack-npm-supply-chain-compromise-tanstack.md)
- [035. 100万+AI服务暴露在公网——HackerNews扫描报告](ch12/035-100-ai-hackernews.md)
- [036. Canvas Hackers ShinyHunters Say Their Official Domain Was Suspended](ch12/036-canvas-hackers-shinyhunters-say-their-official-domain-was-su.md)
- [037. Adversaries Leverage AI for Vulnerability Exploitation, Augmented Operations, and Initial Access](ch12/037-adversaries-leverage-ai-for-vulnerability-exploitation-augm.md)
- [038. Disgruntled researcher releases two more Microsoft zero-days](ch12/038-disgruntled-researcher-releases-two-more-microsoft-zero-days.md)
- [039. GitLab CI/CD Kill Chain Audit — Black Hills InfoSec 2026 大规模审计研究](ch12/039-gitlab-ci-cd-kill-chain-audit-black-hills-infosec-2026.md)
- [040. INTERPOL Operation Ramz MENA Cybercrime Networks](ch12/040-interpol-operation-ramz-mena-cybercrime-networks.md)
- [041. Cyberscammers are bypassing banks' security with illicit tools sold on Telegram](ch12/041-cyberscammers-are-bypassing-banks-security-with-illicit-too.md)
- [042. Securing AI Agents and Machine Identities](ch12/042-securing-ai-agents-and-machine-identities.md)
- [043. A 0-click exploit chain for the Pixel 10: When a Door Closes, a Window Opens](ch12/043-a-0-click-exploit-chain-for-the-pixel-10-when-a-door-closes.md)
- [044. U of T AI Worm：CleverHans Lab 展示可自适应的 AI 蠕虫威胁](ch12/044-u-of-t-ai-worm-cleverhans-lab-ai.md)
- [045. Optimize blueprint extraction accuracy in Amazon Bedrock Data Automation](ch12/045-optimize-blueprint-extraction-accuracy-in-amazon-bedrock-dat.md)
- [046. Canvas LMS 攻击者 ShinyHunters 官方域名被暂停：转向暗网的运营安全转向](ch12/046-canvas-lms-shinyhunters.md)
- [047. NGINX Rift: Achieving NGINX Remote Code Execution via an 18-Year-Old Vulnerability | depthfirst](ch12/047-nginx-rift-achieving-nginx-remote-code-execution-via-an-18.md)
- [048. Fake Job Interview Apps Drop JobStealer Malware on Windows and macOS](ch12/048-fake-job-interview-apps-drop-jobstealer-malware-on-windows-a.md)
- [049. ICO 对 South Staffordshire 处以 96.3 万英镑罚款：2022 年 Cl0p 勒索软件攻击暴露的安全失败](ch12/049-ico-south-staffordshire-96-3-2022-cl0p.md)
- [050. AI in Cybersecurity Training Resources | SANS Institute](ch12/050-ai-in-cybersecurity-training-resources-sans-institute.md)
- [051. bagel — Fleet 级 Secret Scanning 守护开发工作站](ch12/051-bagel-fleet-secret-scanning.md)
- [052. Funnel Builder Flaw Under Active Exploitation Enables WooCommerce Checkout Skimming](ch12/052-funnel-builder-flaw-under-active-exploitation-enables-woocom.md)
- [053. Pwn2Own Berlin 2026, Day Three: DEVCORE Crowned Master of Pwn, $1.298 Million Total](ch12/053-pwn2own-berlin-2026-day-three-devcore-crowned-master-of-pw.md)
- [054. Autonomous Vulnerability Hunting with MCP](ch12/054-autonomous-vulnerability-hunting-with-mcp.md)
- [055. A 0-click exploit chain for the Pixel 10: When a Door Closes, a Window Opens](ch12/055-a-0-click-exploit-chain-for-the-pixel-10-when-a-door-closes.md)
- [056. Static Devirtualization of Themida](ch12/056-static-devirtualization-of-themida.md)
- [057. TeamPCP Claims Sale of Mistral AI Repositories Amid Mini Shai-Hulud Attack](ch12/057-teampcp-claims-sale-of-mistral-ai-repositories-amid-mini-sha.md)
- [058. CVE-2026-20182: Unauthenticated Cisco SD-WAN Control Plane Compromise via vHub Authentication Bypass](ch12/058-cve-2026-20182-unauthenticated-cisco-sd-wan-control-plane-c.md)
- [059. Grafana GitHub Token Breach Led to Codebase Download and Extortion Attempt](ch12/059-grafana-github-token-breach-led-to-codebase-download-and-ext.md)
- [060. Meta U-turns on encryption push for Instagram as DMs go plaintext](ch12/060-meta-u-turns-on-encryption-push-for-instagram-as-dms-go-plai.md)
- [061. AI Voice Cloning: The Technology Behind It, Who's Building It, and Where It's Headed](ch12/061-ai-voice-cloning-the-technology-behind-it-who-s-building-i.md)
- [062. Stealing Passwords via HTML Injection Under a Strict CSP](ch12/062-stealing-passwords-via-html-injection-under-a-strict-csp.md)
- [063. Google and Amnesty International teamed up to make Android spyware detectable](ch12/063-google-and-amnesty-international-teamed-up-to-make-android-s.md)
- [064. RFC 9958: Post-Quantum Cryptography for Engineers](ch12/064-rfc-9958-post-quantum-cryptography-for-engineers.md)
- [065. Disgruntled researcher releases two more Microsoft zero-days](ch12/065-disgruntled-researcher-releases-two-more-microsoft-zero-days.md)
- [066. OpenAI launches Daybreak to combat cyber threats](ch12/066-openai-launches-daybreak-to-combat-cyber-threats.md)
- [067. Funnel Builder 漏洞正被利用于 WooCommerce 支付 skimming](ch12/067-funnel-builder-woocommerce-skimming.md)
- [068. The down fall of bug bounties](ch12/068-the-down-fall-of-bug-bounties.md)
- [069. Mozilla warns UK: Breaking VPNs will not magically fix Britain's age-check mess](ch12/069-mozilla-warns-uk-breaking-vpns-will-not-magically-fix-brita.md)
- [070. JetBrains Marketplace Ecosystem Security Update: Malicious AI Plugins](ch12/070-jetbrains-marketplace-ecosystem-security-update-malicious-a.md)
- [071. NIST SP 800-213r1 — IoT Product Cybersecurity Guidelines](ch12/071-nist-sp-800-213r1-iot-product-cybersecurity-guidelines.md)
- [072. GlassWASM: WebAssembly Malware Found in Trojanized Open VSX Extensions](ch12/072-glasswasm-webassembly-malware-found-in-trojanized-open-vsx.md)
- [073. AI Detection and Response Aidr a Zero Impact Operating Model](ch12/073-ai-detection-and-response-aidr-a-zero-impact-operating-model.md)
- [074. Thinkst Package Proxy: Supply Chain Safety Checks](ch12/074-thinkst-package-proxy-supply-chain-safety-checks.md)
- [075. GitHub Breached — Employee Device Hack Led to Exfiltration of 3,800+ Internal Repos](ch12/075-github-breached-employee-device-hack-led-to-exfiltration-o.md)
- [076. Exploiting vulnerabilities in Johnson & Johnson web apps](ch12/076-exploiting-vulnerabilities-in-johnson-johnson-web-apps.md)
- [077. The IT and security field guide to AI adoption | Tines](ch12/077-the-it-and-security-field-guide-to-ai-adoption-tines.md)
- [078. Romanian Man Faces Up to 30 Years in US Prison Over Vishing Scams](ch12/078-romanian-man-faces-up-to-30-years-in-us-prison-over-vishing.md)
- [079. Mythos for Offensive Security: XBOW's Evaluation](ch12/079-mythos-for-offensive-security-xbow-s-evaluation.md)
- [080. Getting a CVE Without Shipping Slop](ch12/080-getting-a-cve-without-shipping-slop.md)
- [081. Fedora Hummingbird brings the container security model to a Linux host OS](ch12/081-fedora-hummingbird-brings-the-container-security-model-to-a.md)
- [082. Meet Bluekit: The AI-Powered All-in-One Phishing Kit](ch12/082-meet-bluekit-the-ai-powered-all-in-one-phishing-kit.md)
- [083. Building is just the beginning: Introducing Discoverability | Lovable](ch12/083-building-is-just-the-beginning-introducing-discoverability.md)
- [084. Scammers Send Physical Phishing Letters to Steal Ledger Wallet Seed Phrases](ch12/084-scammers-send-physical-phishing-letters-to-steal-ledger-wall.md)
- [085. LLMReaper: 浏览器扩展的对话窃取攻击](ch12/085-llmreaper.md)
- [086. How Unified EDR and ITDR Stop Attacks Before They Spread](ch12/086-how-unified-edr-and-itdr-stop-attacks-before-they-spread.md)
- [087. GitHub Secret Scanning: AI/ML 驱动的大规模误报降低](ch12/087-github-secret-scanning-ai-ml.md)
- [088. Unlocking the Cloudflare app ecosystem with OAuth for all](ch12/088-unlocking-the-cloudflare-app-ecosystem-with-oauth-for-all.md)
- [089. Cyberscammers are bypassing banks' security with illicit tools sold on Telegram](ch12/089-cyberscammers-are-bypassing-banks-security-with-illicit-too.md)
- [090. Guide to Security Operations at Machine Speed](ch12/090-guide-to-security-operations-at-machine-speed.md)
- [091. Discord 全平台端到端加密](ch12/091-discord.md)
- [092. A 0-click exploit chain for the Pixel 10: When a Door Closes, a Window Opens](ch12/092-a-0-click-exploit-chain-for-the-pixel-10-when-a-door-closes.md)
- [093. Funnel Builder Flaw Under Active Exploitation Enables WooCommerce Checkout Skimming](ch12/093-funnel-builder-flaw-under-active-exploitation-enables-woocom.md)
- [094. Forward launches Predict to verify network changes before they reach production - SiliconANGLE](ch12/094-forward-launches-predict-to-verify-network-changes-before-th.md)
- [095. Static Devirtualization of Themida](ch12/095-static-devirtualization-of-themida.md)
- [096. GitHub Breached — Employee Device Hack Led to Exfiltration](ch12/096-github-breached-employee-device-hack-led-to-exfiltration.md)
- [097. CyberSecQwen-4B](ch12/097-cybersecqwen-4b.md)
- [098. Mystery Microsoft bug leaker keeps the zero-days coming](ch12/098-mystery-microsoft-bug-leaker-keeps-the-zero-days-coming.md)
- [099. AI phishing attacks are on the rise — Are you prepared? | Bitwarden](ch12/099-ai-phishing-attacks-are-on-the-rise-are-you-prepared-bi.md)
- [100. cPanel, WHM Release Fixes for Three New Vulnerabilities — Patch Now](ch12/100-cpanel-whm-release-fixes-for-three-new-vulnerabilities-pa.md)
- [101. Semgrep Intercom Php Security](ch12/101-semgrep-intercom-php-security.md)
- [102. A DOD contractor’s API flaw exposed military course data and service member records](ch12/102-a-dod-contractor-s-api-flaw-exposed-military-course-data-and.md)
- [103. Anthropic's bug-hunting Mythos was greatest marketing stunt ever, says cURL creator](ch12/103-anthropic-s-bug-hunting-mythos-was-greatest-marketing-stunt.md)
- [104. Incendium Fuzzing Ms Rpc](ch12/104-incendium-fuzzing-ms-rpc.md)
- [105. OpenSandbox：阿里开源的云端 Agent 安全沙箱（凭据 Vault + egress sidecar）](ch12/105-opensandbox-agent-vault-egress-sidecar.md)
- [106. How Semgrep Cut Taint Analysis Time by 75%](ch12/106-how-semgrep-cut-taint-analysis-time-by-75.md)
- [107. Sandworm Hackers Shift From IT Breaches to Critical OT Targets](ch12/107-sandworm-hackers-shift-from-it-breaches-to-critical-ot-targe.md)
- [108. peerd: 浏览器原生的 AI Agent Harness](ch12/108-peerd-ai-agent-harness.md)
- [109. On Post-Quantum Security Adoption](ch12/109-on-post-quantum-security-adoption.md)
- [110. Jane Street — 形式化方法与编程的未来](ch12/110-jane-street.md)
- [111. Semgrep Intercom Php Supply Chain](ch12/111-semgrep-intercom-php-supply-chain.md)
- [112. ICO fines Cl0p victim South Staffs Water over data breach](ch12/112-ico-fines-cl0p-victim-south-staffs-water-over-data-breach.md)
- [113. Drupal to Release Urgent Core Security Updates on May 20, Sites Told to Prepare](ch12/113-drupal-to-release-urgent-core-security-updates-on-may-20-si.md)
- [114. Cyberscammers are bypassing banks’ security with illicit tools sold on Telegram](ch12/114-cyberscammers-are-bypassing-banks-security-with-illicit-too.md)
- [115. Hackers accessed BWH Hotels reservation system for months](ch12/115-hackers-accessed-bwh-hotels-reservation-system-for-months.md)
- [116. ICO fines South Staffordshire £963K over 2022 breach](ch12/116-ico-fines-south-staffordshire-963k-over-2022-breach.md)
- [117. 中国用户安全高性能访问海外 Bedrock](ch12/117-bedrock.md)
- [118. ShinyHunters hack 7-Eleven: franchisee data and Salesforce records exposed](ch12/118-shinyhunters-hack-7-eleven-franchisee-data-and-salesforce-r.md)
- [119. Temporarily disabling new user registrations](ch12/119-temporarily-disabling-new-user-registrations.md)
- [120. U of T researchers demonstrate AI worm: self-spreading malware using open-weight models](ch12/120-u-of-t-researchers-demonstrate-ai-worm-self-spreading-malwa.md)
- [121. Japan’s PM orders cybersecurity review to defend against Anthropic Mythos](ch12/121-japan-s-pm-orders-cybersecurity-review-to-defend-against-ant.md)
