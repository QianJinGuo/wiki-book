# Ch12 安全与治理

> Agent 权限越大，安全责任越重：凭据、审计、合规

> 本章收录 **115 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 8 |
| ⭐⭐ 工程师 | 需编程基础 | 105 |
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
- [003. From SSH to REST: A Security-Driven Modernization of Slack's EMR Data Pipelines](ch12/003-from-ssh-to-rest-a-security-driven-modernization-of-slack-s.md)
- [004. Mozilla warns UK: Breaking VPNs will not magically fix Britain's age-check mess](ch12/004-mozilla-warns-uk-breaking-vpns-will-not-magically-fix-brita.md)
- [005. Offensive Security Blog](ch12/005-offensive-security-blog.md)
- [006. Sandworm Hackers Shift From IT Breaches to Critical OT Targets](ch12/006-sandworm-hackers-shift-from-it-breaches-to-critical-ot-targe.md)
- [007. 5 Things to Know about the CLARITY Act](ch12/007-5-things-to-know-about-the-clarity-act.md)
- [008. fedora hummingbird brings the container security model to a linux host os](ch12/008-fedora-hummingbird-brings-the-container-security-model-to-a.md)
- [009. Mythos finds a curl vulnerability](ch12/009-mythos-finds-a-curl-vulnerability.md)
- [010. 飞来汇借助 AWS Security Agent 构建跨境支付应用的智能安全防线](ch12/010-aws-security-agent.md)
- [011. Canvas Hackers ShinyHunters Say Their Official Domain Was Suspended](ch12/011-canvas-hackers-shinyhunters-say-their-official-domain-was-su.md)
- [012. Hermes Agent v0.14.0 核心架构与快速上手](ch12/012-hermes-agent-v0-14-0.md)
- [013. bleeding-llama-critical-unauthenticated-memory-leak-in-ollama](ch12/013-bleeding-llama-critical-unauthenticated-memory-leak-in-ollam.md)
- [014. SHub Reaper: macOS Stealer Spoofs Apple, Google, and Microsoft in a Single Attack Chain](ch12/014-shub-reaper-macos-stealer-spoofs-apple-google-and-microso.md)
- [015. Resecurity | CVE-2026-20182: Unauthenticated Cisco SD-WAN Control-Plane Compromise via vHub Authentication Bypass](ch12/015-resecurity-cve-2026-20182-unauthenticated-cisco-sd-wan-co.md)
- [016. LLMReaper - DOM Based AI Conversation Exfiltration via Browser Extensions](ch12/016-llmreaper-dom-based-ai-conversation-exfiltration-via-brows.md)
- [017. Static Devirtualization of Themida](ch12/017-static-devirtualization-of-themida.md)
- [018. Static Devirtualization 2024](ch12/018-static-devirtualization-2024.md)
- [019. What My Privacy and Security Stack Actually Looks Like](ch12/019-what-my-privacy-and-security-stack-actually-looks-like.md)
- [020. How an image could compromise your](ch12/020-how-an-image-could-compromise-your.md)
- [021. Alliance for Critical Infrastructure (ACI): US Critical Infrastructure Cybersecurity Coalition](ch12/021-alliance-for-critical-infrastructure-aci-us-critical-infr.md)
- [022. Static Devirtualization of Themida](ch12/022-static-devirtualization-of-themida.md)
- [023. Inference Theft as AI Endpoint Attack Surface — Vercel Token Theft Defense 2026](ch12/023-inference-theft-as-ai-endpoint-attack-surface-vercel-token.md)
- [024. Apple corecrypto formal verification blueprint — post-quantum ML-KEM/ML-DSA in iMessage](ch12/024-apple-corecrypto-formal-verification-blueprint-post-quantu.md)
- [025. OpenClaw 安全和功能增强实践](ch12/025-openclaw.md)
- [026. xz-utils Backdoor 2 Years On — Maintainer Trust Hijack Pattern Beyond CVE Scanners](ch12/026-xz-utils-backdoor-2-years-on-maintainer-trust-hijack-patte.md)
- [027. Disgruntled researcher releases two more Microsoft zero-days](ch12/027-disgruntled-researcher-releases-two-more-microsoft-zero-days.md)
- [028. Disgruntled researcher releases two more Microsoft zero-days](ch12/028-disgruntled-researcher-releases-two-more-microsoft-zero-days.md)
- [029. Where OpenClaw Security Is Heading — OpenClaw Blog](ch12/029-where-openclaw-security-is-heading-openclaw-blog.md)
- [030. Canvas Breach Disrupts Schools & Colleges Nationwide](ch12/030-canvas-breach-disrupts-schools-colleges-nationwide.md)
- [031. 别让你的 Amazon Bedrock 模型为他人打工——API 调用安全防护指南](ch12/031-amazon-bedrock-api.md)
- [032. Postmortem: TanStack npm supply-chain compromise | TanStack Blog](ch12/032-postmortem-tanstack-npm-supply-chain-compromise-tanstack.md)
- [033. 100万+AI服务暴露在公网——HackerNews扫描报告](ch12/033-100-ai-hackernews.md)
- [034. Canvas Hackers ShinyHunters Say Their Official Domain Was Suspended](ch12/034-canvas-hackers-shinyhunters-say-their-official-domain-was-su.md)
- [035. Adversaries Leverage AI for Vulnerability Exploitation, Augmented Operations, and Initial Access](ch12/035-adversaries-leverage-ai-for-vulnerability-exploitation-augm.md)
- [036. Disgruntled researcher releases two more Microsoft zero-days](ch12/036-disgruntled-researcher-releases-two-more-microsoft-zero-days.md)
- [037. GitLab CI/CD Kill Chain Audit — Black Hills InfoSec 2026 大规模审计研究](ch12/037-gitlab-ci-cd-kill-chain-audit-black-hills-infosec-2026.md)
- [038. INTERPOL Operation Ramz MENA Cybercrime Networks](ch12/038-interpol-operation-ramz-mena-cybercrime-networks.md)
- [039. Cyberscammers are bypassing banks' security with illicit tools sold on Telegram](ch12/039-cyberscammers-are-bypassing-banks-security-with-illicit-too.md)
- [040. Securing AI Agents and Machine Identities](ch12/040-securing-ai-agents-and-machine-identities.md)
- [041. A 0-click exploit chain for the Pixel 10: When a Door Closes, a Window Opens](ch12/041-a-0-click-exploit-chain-for-the-pixel-10-when-a-door-closes.md)
- [042. U of T AI Worm：CleverHans Lab 展示可自适应的 AI 蠕虫威胁](ch12/042-u-of-t-ai-worm-cleverhans-lab-ai.md)
- [043. Optimize blueprint extraction accuracy in Amazon Bedrock Data Automation](ch12/043-optimize-blueprint-extraction-accuracy-in-amazon-bedrock-dat.md)
- [044. Canvas LMS 攻击者 ShinyHunters 官方域名被暂停：转向暗网的运营安全转向](ch12/044-canvas-lms-shinyhunters.md)
- [045. NGINX Rift: Achieving NGINX Remote Code Execution via an 18-Year-Old Vulnerability | depthfirst](ch12/045-nginx-rift-achieving-nginx-remote-code-execution-via-an-18.md)
- [046. Fake Job Interview Apps Drop JobStealer Malware on Windows and macOS](ch12/046-fake-job-interview-apps-drop-jobstealer-malware-on-windows-a.md)
- [047. ICO 对 South Staffordshire 处以 96.3 万英镑罚款：2022 年 Cl0p 勒索软件攻击暴露的安全失败](ch12/047-ico-south-staffordshire-96-3-2022-cl0p.md)
- [048. AI in Cybersecurity Training Resources | SANS Institute](ch12/048-ai-in-cybersecurity-training-resources-sans-institute.md)
- [049. bagel — Fleet 级 Secret Scanning 守护开发工作站](ch12/049-bagel-fleet-secret-scanning.md)
- [050. Funnel Builder Flaw Under Active Exploitation Enables WooCommerce Checkout Skimming](ch12/050-funnel-builder-flaw-under-active-exploitation-enables-woocom.md)
- [051. Pwn2Own Berlin 2026, Day Three: DEVCORE Crowned Master of Pwn, $1.298 Million Total](ch12/051-pwn2own-berlin-2026-day-three-devcore-crowned-master-of-pw.md)
- [052. Autonomous Vulnerability Hunting with MCP](ch12/052-autonomous-vulnerability-hunting-with-mcp.md)
- [053. A 0-click exploit chain for the Pixel 10: When a Door Closes, a Window Opens](ch12/053-a-0-click-exploit-chain-for-the-pixel-10-when-a-door-closes.md)
- [054. Static Devirtualization of Themida](ch12/054-static-devirtualization-of-themida.md)
- [055. TeamPCP Claims Sale of Mistral AI Repositories Amid Mini Shai-Hulud Attack](ch12/055-teampcp-claims-sale-of-mistral-ai-repositories-amid-mini-sha.md)
- [056. Grafana GitHub Token Breach Led to Codebase Download and Extortion Attempt](ch12/056-grafana-github-token-breach-led-to-codebase-download-and-ext.md)
- [057. Meta U-turns on encryption push for Instagram as DMs go plaintext](ch12/057-meta-u-turns-on-encryption-push-for-instagram-as-dms-go-plai.md)
- [058. AI Voice Cloning: The Technology Behind It, Who's Building It, and Where It's Headed](ch12/058-ai-voice-cloning-the-technology-behind-it-who-s-building-i.md)
- [059. Stealing Passwords via HTML Injection Under a Strict CSP](ch12/059-stealing-passwords-via-html-injection-under-a-strict-csp.md)
- [060. Google and Amnesty International teamed up to make Android spyware detectable](ch12/060-google-and-amnesty-international-teamed-up-to-make-android-s.md)
- [061. RFC 9958: Post-Quantum Cryptography for Engineers](ch12/061-rfc-9958-post-quantum-cryptography-for-engineers.md)
- [062. Disgruntled researcher releases two more Microsoft zero-days](ch12/062-disgruntled-researcher-releases-two-more-microsoft-zero-days.md)
- [063. OpenAI launches Daybreak to combat cyber threats](ch12/063-openai-launches-daybreak-to-combat-cyber-threats.md)
- [064. Funnel Builder 漏洞正被利用于 WooCommerce 支付 skimming](ch12/064-funnel-builder-woocommerce-skimming.md)
- [065. The down fall of bug bounties](ch12/065-the-down-fall-of-bug-bounties.md)
- [066. Mozilla warns UK: Breaking VPNs will not magically fix Britain's age-check mess](ch12/066-mozilla-warns-uk-breaking-vpns-will-not-magically-fix-brita.md)
- [067. JetBrains Marketplace Ecosystem Security Update: Malicious AI Plugins](ch12/067-jetbrains-marketplace-ecosystem-security-update-malicious-a.md)
- [068. GlassWASM: WebAssembly Malware Found in Trojanized Open VSX Extensions](ch12/068-glasswasm-webassembly-malware-found-in-trojanized-open-vsx.md)
- [069. ai detection and response aidr a zero impact operating model](ch12/069-ai-detection-and-response-aidr-a-zero-impact-operating-model.md)
- [070. GitHub Breached — Employee Device Hack Led to Exfiltration of 3,800+ Internal Repos](ch12/070-github-breached-employee-device-hack-led-to-exfiltration-o.md)
- [071. Exploiting vulnerabilities in Johnson & Johnson web apps](ch12/071-exploiting-vulnerabilities-in-johnson-johnson-web-apps.md)
- [072. The IT and security field guide to AI adoption | Tines](ch12/072-the-it-and-security-field-guide-to-ai-adoption-tines.md)
- [073. Romanian Man Faces Up to 30 Years in US Prison Over Vishing Scams](ch12/073-romanian-man-faces-up-to-30-years-in-us-prison-over-vishing.md)
- [074. Mythos for Offensive Security: XBOW's Evaluation](ch12/074-mythos-for-offensive-security-xbow-s-evaluation.md)
- [075. Getting a CVE Without Shipping Slop](ch12/075-getting-a-cve-without-shipping-slop.md)
- [076. Fedora Hummingbird brings the container security model to a Linux host OS](ch12/076-fedora-hummingbird-brings-the-container-security-model-to-a.md)
- [077. Meet Bluekit: The AI-Powered All-in-One Phishing Kit](ch12/077-meet-bluekit-the-ai-powered-all-in-one-phishing-kit.md)
- [078. Building is just the beginning: Introducing Discoverability | Lovable](ch12/078-building-is-just-the-beginning-introducing-discoverability.md)
- [079. Scammers Send Physical Phishing Letters to Steal Ledger Wallet Seed Phrases](ch12/079-scammers-send-physical-phishing-letters-to-steal-ledger-wall.md)
- [080. LLMReaper: 浏览器扩展的对话窃取攻击](ch12/080-llmreaper.md)
- [081. How Unified EDR and ITDR Stop Attacks Before They Spread](ch12/081-how-unified-edr-and-itdr-stop-attacks-before-they-spread.md)
- [082. GitHub Secret Scanning: AI/ML 驱动的大规模误报降低](ch12/082-github-secret-scanning-ai-ml.md)
- [083. Unlocking the Cloudflare app ecosystem with OAuth for all](ch12/083-unlocking-the-cloudflare-app-ecosystem-with-oauth-for-all.md)
- [084. Cyberscammers are bypassing banks' security with illicit tools sold on Telegram](ch12/084-cyberscammers-are-bypassing-banks-security-with-illicit-too.md)
- [085. Guide to Security Operations at Machine Speed](ch12/085-guide-to-security-operations-at-machine-speed.md)
- [086. Discord 全平台端到端加密](ch12/086-discord.md)
- [087. A 0-click exploit chain for the Pixel 10: When a Door Closes, a Window Opens](ch12/087-a-0-click-exploit-chain-for-the-pixel-10-when-a-door-closes.md)
- [088. Funnel Builder Flaw Under Active Exploitation Enables WooCommerce Checkout Skimming](ch12/088-funnel-builder-flaw-under-active-exploitation-enables-woocom.md)
- [089. Forward launches Predict to verify network changes before they reach production - SiliconANGLE](ch12/089-forward-launches-predict-to-verify-network-changes-before-th.md)
- [090. Static Devirtualization of Themida](ch12/090-static-devirtualization-of-themida.md)
- [091. GitHub Breached — Employee Device Hack Led to Exfiltration](ch12/091-github-breached-employee-device-hack-led-to-exfiltration.md)
- [092. CyberSecQwen-4B](ch12/092-cybersecqwen-4b.md)
- [093. Mystery Microsoft bug leaker keeps the zero-days coming](ch12/093-mystery-microsoft-bug-leaker-keeps-the-zero-days-coming.md)
- [094. AI phishing attacks are on the rise — Are you prepared? | Bitwarden](ch12/094-ai-phishing-attacks-are-on-the-rise-are-you-prepared-bi.md)
- [095. cPanel, WHM Release Fixes for Three New Vulnerabilities — Patch Now](ch12/095-cpanel-whm-release-fixes-for-three-new-vulnerabilities-pa.md)
- [096. semgrep intercom php security](ch12/096-semgrep-intercom-php-security.md)
- [097. A DOD contractor’s API flaw exposed military course data and service member records](ch12/097-a-dod-contractor-s-api-flaw-exposed-military-course-data-and.md)
- [098. Anthropic's bug-hunting Mythos was greatest marketing stunt ever, says cURL creator](ch12/098-anthropic-s-bug-hunting-mythos-was-greatest-marketing-stunt.md)
- [099. incendium fuzzing ms rpc](ch12/099-incendium-fuzzing-ms-rpc.md)
- [100. How Semgrep Cut Taint Analysis Time by 75%](ch12/100-how-semgrep-cut-taint-analysis-time-by-75.md)
- [101. Sandworm Hackers Shift From IT Breaches to Critical OT Targets](ch12/101-sandworm-hackers-shift-from-it-breaches-to-critical-ot-targe.md)
- [102. peerd: 浏览器原生的 AI Agent Harness](ch12/102-peerd-ai-agent-harness.md)
- [103. On Post-Quantum Security Adoption](ch12/103-on-post-quantum-security-adoption.md)
- [104. Jane Street — 形式化方法与编程的未来](ch12/104-jane-street.md)
- [105. semgrep intercom php supply chain](ch12/105-semgrep-intercom-php-supply-chain.md)
- [106. ICO fines Cl0p victim South Staffs Water over data breach](ch12/106-ico-fines-cl0p-victim-south-staffs-water-over-data-breach.md)
- [107. Drupal to Release Urgent Core Security Updates on May 20, Sites Told to Prepare](ch12/107-drupal-to-release-urgent-core-security-updates-on-may-20-si.md)
- [108. Cyberscammers are bypassing banks’ security with illicit tools sold on Telegram](ch12/108-cyberscammers-are-bypassing-banks-security-with-illicit-too.md)
- [109. Hackers accessed BWH Hotels reservation system for months](ch12/109-hackers-accessed-bwh-hotels-reservation-system-for-months.md)
- [110. ICO fines South Staffordshire £963K over 2022 breach](ch12/110-ico-fines-south-staffordshire-963k-over-2022-breach.md)
- [111. 中国用户安全高性能访问海外 Bedrock](ch12/111-bedrock.md)
- [112. ShinyHunters hack 7-Eleven: franchisee data and Salesforce records exposed](ch12/112-shinyhunters-hack-7-eleven-franchisee-data-and-salesforce-r.md)
- [113. Temporarily disabling new user registrations](ch12/113-temporarily-disabling-new-user-registrations.md)
- [114. U of T researchers demonstrate AI worm: self-spreading malware using open-weight models](ch12/114-u-of-t-researchers-demonstrate-ai-worm-self-spreading-malwa.md)
- [115. Japan’s PM orders cybersecurity review to defend against Anthropic Mythos](ch12/115-japan-s-pm-orders-cybersecurity-review-to-defend-against-ant.md)
