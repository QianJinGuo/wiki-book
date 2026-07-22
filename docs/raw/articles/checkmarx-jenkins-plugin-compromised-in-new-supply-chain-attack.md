---
source: newsletter
source_url: https://www.techzine.eu/news/security/141212/checkmarx-jenkins-plugin-compromised-in-new-supply-chain-attack/
tags: [techzine]
title: "Checkmarx Jenkins plugin compromised in new supply chain attack"
sha256: 792efb7f1240557ac53bdc7ae9cbba546a87073dcc84c3934fbc65e445eef5ca
domain: techzine.eu
review_value: 8
review_confidence: 8
review_recommendation: strong
review_stars: 5
ingested: 2026-05-13
---
URL Source: https://www.techzine.eu/news/security/141212/checkmarx-jenkins-plugin-compromised-in-new-supply-chain-attack/
Published Time: 2026-05-11T13:29:24+00:00
Markdown Content:
# Checkmarx Jenkins plugin compromised in new supply chain attack - Techzine Global
[Skip to content](https://www.techzine.eu/news/security/141212/checkmarx-jenkins-plugin-compromised-in-new-supply-chain-attack/#main)
[Techzine Global](https://www.techzine.eu/)
*   [Home](https://www.techzine.eu/)
*   [Topstories](https://www.techzine.eu/topstories/)
*   [Topics](https://www.techzine.eu/news/security/141212/checkmarx-jenkins-plugin-compromised-in-new-supply-chain-attack/#)
    *   [Analytics](https://www.techzine.eu/analytics/)
    *   [Applications](https://www.techzine.eu/applications/)
    *   [Collaboration](https://www.techzine.eu/collaboration/)
    *   [Data Management](https://www.techzine.eu/data-management/)
    *   [Devices](https://www.techzine.eu/devices/)
    *   [Devops](https://www.techzine.eu/devops/)
    *   [Infrastructure](https://www.techzine.eu/infrastructure/)
    *   [Privacy & Compliance](https://www.techzine.eu/privacy-compliance/)
    *   [Security](https://www.techzine.eu/security/)
*   [Insights](https://www.techzine.eu/news/security/141212/checkmarx-jenkins-plugin-compromised-in-new-supply-chain-attack/#)
    *   [All Insights](https://www.techzine.eu/insights/)
    *   [Agentic AI](https://www.techzine.eu/insights/agentic-ai/)
    *   [Analytics](https://www.techzine.eu/insights/analytics/)
    *   [Cloud ERP](https://www.techzine.eu/insights/cloud-erp/)
    *   [Generative AI](https://www.techzine.eu/insights/gen-ai/)
    *   [IT in Retail](https://www.techzine.eu/insights/it-in-retail/)
    *   [NIS2](https://www.techzine.eu/insights/nis2/)
    *   [RSAC 2025 Conference](https://www.techzine.eu/insights/rsac-2025-conference/)
    *   [Security Platforms](https://www.techzine.eu/insights/security-platforms/)
    *   [SentinelOne](https://www.techzine.eu/insights/sentinelone/)
*   [More](https://www.techzine.eu/news/security/141212/checkmarx-jenkins-plugin-compromised-in-new-supply-chain-attack/#)
    *   [Become a partner](https://www.dolphin.pub/)
    *   [About us](https://www.techzine.eu/about-us/)
    *   [Contact us](https://www.techzine.eu/contact)
    *   [Terms and conditions](https://www.techzine.eu/conditions)
    *   [Privacy Policy](https://www.techzine.eu/privacy)
*   [Techzine Global](https://www.techzine.eu/)
*   [Techzine Netherlands](https://www.techzine.nl/)
*   [Techzine Belgium](https://www.techzine.be/)
*   [Techzine TV](https://www.techzine.tv/)
*    
*   [ICTMagazine Netherlands](https://www.ictmagazine.nl/)
*   [ICTMagazine Belgium](https://www.ictmagazine.nl/)
[Techzine](https://www.techzine.eu/) » [News](https://www.techzine.eu/news/) » [Security](https://www.techzine.eu/security/) » **Checkmarx Jenkins plugin compromised in new supply chain attack**
2 min[Security](https://www.techzine.eu/security/)
# Checkmarx Jenkins plugin compromised in new supply chain attack
![Image 1](https://www.techzine.nl/wp-content/uploads/2022/03/berry-e1646954074511.jpg)
[Berry Zwets](https://www.techzine.eu/author/berry-zwets/)[May 11, 2026 3:29 pm May 11, 2026](https://www.techzine.eu/news/security/141212/checkmarx-jenkins-plugin-compromised-in-new-supply-chain-attack/)
[](javascript:void(0))
[](javascript:void(0))
[](javascript:void(0))
![Image 2: Checkmarx Jenkins plugin compromised in new supply chain attack](https://www.techzine.eu/wp-content/uploads/2026/05/shutterstock_2524529137-768x536.jpg)
**A tampered version of the Checkmarx Jenkins AST plugin has appeared in the Jenkins Marketplace. The attack has been assigned a CVE identifier (CVE-2026-33634) with a CVSS score of 9.4. Checkmarx has confirmed the incident and advises users to take immediate action.**
The hacker group TeamPCP renamed the Checkmarx Jenkins AST plugin’s GitHub repository to “Checkmarx-Fully-Hacked-by-TeamPCP-and-Their-Customers-Should-Cancel-Now.” The repository description was changed to: “Checkmarx fails to rotate secrets again. with love – TeamPCP.” The group then backdoored the plugin release itself. Jenkins instances that [installed](https://socradar.io/blog/checkmarx-jenkins-plugin-teampcp-backdoor/?utm_campaign=27596841-LeadGen_Organic-Social_Global_1025&utm_source=linkedin&utm_medium=social) version 2026.5.09 are therefore running a compromised plugin.
The malware has a Dune theme. Repositories on the compromised cx-plugins-releases account have names like kralizec-navigator-709 and mentat-navigator-124, all with the description “A Mini Shai-Hulud has Appeared.”
This is not the first time TeamPCP has targeted Checkmarx. In March 2026, the group had already compromised checkmarx/ast-github-action and checkmarx/kics-github-action. During that same campaign, more than 66 npm packages were compromised, and [at least 1,000 enterprise SaaS environments](https://checkmarx.com/blog/supply-chain-security-incident-update-may-9/) were potentially exposed. Trivy and LiteLLM were also targeted. [Previous findings revealed](https://www.techzine.eu/news/security/140610/aikido-endpoint-offers-developers-additional-protection-against-supply-chain-attacks/) how these supply chain attacks target developer endpoints, with attackers specifically hunting for cloud credentials, npm publication tokens, and SSH keys.
## What should users do?
Checkmarx recommends [using](https://checkmarx.com/blog/ongoing-security-updates/) only [version 2.0.13-829.vc72453fa_1c16](https://checkmarx.com/blog/ongoing-security-updates/), published on December 17, 2025. Anyone who has installed version 2026.5.09 must rotate all secrets that were visible to the Jenkins runner: GitHub tokens, cloud credentials (AWS/GCP/Azure), Kubernetes configurations, Docker credentials, and SSH keys. In addition, SOCRadar recommends checking Jenkins build logs for outbound traffic to unknown domains and searching for Dune-related repository names in GitHub organizations.
Checkmarx is working on a new, clean version of the plugin and promises further updates.
#### Tags:
[Checkmarx](https://www.techzine.eu/tag/checkmarx/) / [CI/CD](https://www.techzine.eu/tag/ci-cd/) / [jenkins](https://www.techzine.eu/tag/jenkins/) / [supply chain attack](https://www.techzine.eu/tag/supply-chain-attack/) / [TeamPCP](https://www.techzine.eu/tag/teampcp/)
"*" indicates required fields
Instagram 
This field is for validation purposes and should be left unchanged.
#### Stay tuned, subscribe!
E-mailadres* 
Nieuwsbrieven*
- [x] Morning Bytes 
- [x] Weekly Advisor 
## Related
## [Popular Daemon Tools utility exploited in supply chain attack](https://www.techzine.eu/news/security/141034/popular-daemon-tools-utility-exploited-in-supply-chain-attack/ "Popular Daemon Tools utility exploited in supply chain attack")
## [Malicious Python package poses new supply chain threat](https://www.techzine.eu/news/security/140826/malicious-python-package-poses-new-supply-chain-threat/ "Malicious Python package poses new supply chain threat")
## [Aikido Endpoint offers developers additional protection against supply chain attacks](https://www.techzine.eu/news/security/140610/aikido-endpoint-offers-developers-additional-protection-against-supply-chain-attacks/ "Aikido Endpoint offers developers additional protection against supply chain attacks")
## [Vercel hit by attack via compromised AI tool](https://www.techzine.eu/news/security/140591/vercel-hit-by-attack-via-compromised-ai-tool/ "Vercel hit by attack via compromised AI tool")
![Image 3](https://www.techzine.eu/pixel.php?u=/news/security/141212/checkmarx-jenkins-plugin-compromised-in-new-supply-chain-attack/)
## Editor picks
## [SAS analytics moves closer to Snowflake, Databricks, and Fabric](https://www.techzine.eu/blogs/analytics/141157/sas-analytics-moves-closer-to-snowflake-databricks-and-fabric/ "SAS analytics moves closer to Snowflake, Databricks, and Fabric")
SAS is expanding its analytics integrations to multiple external data...
## [“Full-stack AI” sounds appealing, but the IT reality is more complex](https://www.techzine.eu/blogs/infrastructure/141111/full-stack-ai-sounds-appealing-but-the-reality-of-it-environments-is-more-complex/ "“Full-stack AI” sounds appealing, but the IT reality is more complex")
IT vendors often choose to market a solution as “full-stack AI,” ...
## [“MCP is just an API,” and that is precisely the problem with Gemini Enterprise](https://www.techzine.eu/blogs/applications/140930/mcp-is-just-an-api-and-that-is-precisely-the-problem-with-gemini-enterprise/ "“MCP is just an API,” and that is precisely the problem with Gemini Enterprise")
Google presents the Agentic Data Cloud as the connective tissue of th...
## [Who will dominate enterprise AI? ServiceNow claims it will, but rivals are closing in](https://www.techzine.eu/blogs/analytics/141094/who-will-dominate-enterprise-ai-servicenow-claims-it-will-but-rivals-are-closing-in/ "Who will dominate enterprise AI? ServiceNow claims it will, but rivals are closing in")
### Is ServiceNow becoming a security company?
## [Techzine.tv](https://www.techzine.tv/)
[![Image 4: NetApp balances sovereignty with AI infrastructure needs](https://www.techzine.tv/wp-content/uploads/2026/03/maxresdefault-4-640x360.jpg)](https://www.techzine.tv/videos/how-netapp-balances-sovereignty-with-ai-infrastructure-needs/)
## [NetApp balances sovereignty with AI infrastructure needs](https://www.techzine.tv/videos/how-netapp-balances-sovereignty-with-ai-infrastructure-needs/ "NetApp balances sovereignty with AI infrastructure needs")
[![Image 5: Cisco wants to tackle the 80-tool security problem](https://www.techzine.tv/wp-content/uploads/2026/04/maxresdefault-13-640x360.jpg)](https://www.techzine.tv/videos/cisco-wants-to-tackle-the-80-tool-security-problem/)
## [Cisco wants to tackle the 80-tool security problem](https://www.techzine.tv/videos/cisco-wants-to-tackle-the-80-tool-security-problem/ "Cisco wants to tackle the 80-tool security problem")
[![Image 6: Why major tech companies forked Redis to create Valkey](https://www.techzine.tv/wp-content/uploads/2026/03/maxresdefault-5-640x360.jpg)](https://www.techzine.tv/videos/why-major-tech-companies-forked-redis-to-create-valkey/)
## [Why major tech companies forked Redis to create Valkey](https://www.techzine.tv/videos/why-major-tech-companies-forked-redis-to-create-valkey/ "Why major tech companies forked Redis to create Valkey")
[![Image 7: How to migrate from Redis to Valkey with zero downtime](https://www.techzine.tv/wp-content/uploads/2026/04/maxresdefault-6-640x360.jpg)](https://www.techzine.tv/videos/how-to-migrate-from-redis-to-valkey-with-zero-downtime/)
## [How to migrate from Redis to Valkey with zero downtime](https://www.techzine.tv/videos/how-to-migrate-from-redis-to-valkey-with-zero-downtime/ "How to migrate from Redis to Valkey with zero downtime")
## [Read more on Security](https://www.techzine.eu/security/)
[![Image 8: NTT Research wants to accelerate innovation with Scale Academy: SaltGrain is the first result](https://www.techzine.eu/wp-content/uploads/2026/04/Screenshot-2026-04-15-145650-450x300.png)](https://www.techzine.eu/blogs/security/140484/ntt-research-wants-to-accelerate-innovation-with-scale-academy-saltgrain-is-the-first-result/ "NTT Research wants to accelerate innovation with Scale Academy: SaltGrain is the first result")
[Top story](https://www.techzine.eu/topstories/)## [NTT Research wants to accelerate innovation with Scale Academy: SaltGrain is the first result](https://www.techzine.eu/blogs/security/140484/ntt-research-wants-to-accelerate-innovation-with-scale-academy-saltgrain-is-the-first-result/ "NTT Research wants to accelerate innovation with Scale Academy: SaltGrain is the first result")
### Attribute-based encryption at the data layer
[Sander Almekinders](https://www.techzine.eu/author/sander-almekinders/)April 15, 2026
[![Image 9: Hackers tipped off Dutch telco Odido about its own data breach](https://www.techzine.eu/wp-content/uploads/2026/05/shutterstock_2739595461-450x300.jpg)](https://www.techzine.eu/news/security/141288/hackers-tipped-off-dutch-telco-odido-about-its-own-data-breach/ "Hackers tipped off Dutch telco Odido about its own data breach")
## [Hackers tipped off Dutch telco Odido about its own data breach](https://www.techzine.eu/news/security/141288/hackers-tipped-off-dutch-telco-odido-about-its-own-data-breach/ "Hackers tipped off Dutch telco Odido about its own data breach")
Telecom provider Odido was unaware for two days that the hack in early February had resulted in a massive dat...
[Colin Baak](https://www.techzine.eu/author/colin-baak/)7 hours ago
[![Image 10: Security by Design prevents higher bills](https://www.techzine.eu/wp-content/uploads/2026/04/sbd-450x283.jpg)](https://www.techzine.eu/blogs/security/140502/security-by-design-prevents-higher-bills/ "Security by Design prevents higher bills")
[Top story](https://www.techzine.eu/topstories/)## [Security by Design prevents higher bills](https://www.techzine.eu/blogs/security/140502/security-by-design-prevents-higher-bills/ "Security by Design prevents higher bills")
Those who build in security only after the fact pay up to fifteen times the original cost. That’s why a str...
[Berry Zwets](https://www.techzine.eu/author/berry-zwets/)April 16, 2026
[![Image 11: Foxconn attackers allegedly obtained Apple and Nvidia data](https://www.techzine.eu/wp-content/uploads/2025/03/shutterstock_2060550662-450x300.jpg)](https://www.techzine.eu/news/security/141296/foxconn-attackers-alledgedly-obtained-apple-and-nvidia-data/ "Foxconn attackers allegedly obtained Apple and Nvidia data")
## [Foxconn attackers allegedly obtained Apple and Nvidia data](https://www.techzine.eu/news/security/141296/foxconn-attackers-alledgedly-obtained-apple-and-nvidia-data/ "Foxconn attackers allegedly obtained Apple and Nvidia data")
Foxconn has confirmed a cyberattack on its North American factories. The Nitrogen ransomware group posted the...
[Erik van Klinken](https://www.techzine.eu/author/erik-van-klinken/)6 hours ago
## [Expert Talks](https://www.techzine.eu/experts/)
[![Image 12: The only thing constant in technology is change, except for unrealistic hopefulness](https://www.techzine.eu/wp-content/uploads/2026/04/shutterstock_2755551255-150x90.jpg)](https://www.techzine.eu/experts/devops/140904/the-only-thing-constant-in-technology-is-change-except-for-unrealistic-hopefulness/ "The only thing constant in technology is change, except for unrealistic hopefulness")
## [The only thing constant in technology is change, except for unrealistic hopefulness](https://www.techzine.eu/experts/devops/140904/the-only-thing-constant-in-technology-is-change-except-for-unrealistic-hopefulness/ "The only thing constant in technology is change, except for unrealistic hopefulness")
If anyone was ever forced to pick the tritest phrase in the world, it...
[![Image 13: mnemonic opens Dutch Security Operations Centre (SOC) and relocates to new office in Utrecht](https://www.techzine.eu/wp-content/uploads/2026/04/Screenshot-2026-04-30-102050-150x90.png)](https://www.techzine.eu/experts/security/140917/mnemonic-opens-dutch-security-operations-centre-soc-and-relocates-to-new-office-in-utrecht/ "mnemonic opens Dutch Security Operations Centre (SOC) and relocates to new office in Utrecht")
## [mnemonic opens Dutch Security Operations Centre (SOC) and relocates to new office in Utrecht](https://www.techzine.eu/experts/security/140917/mnemonic-opens-dutch-security-operations-centre-soc-and-relocates-to-new-office-in-utrecht/ "mnemonic opens Dutch Security Operations Centre (SOC) and relocates to new office in Utrecht")
The new SOC in the Netherlands further strengthens mnemonic’s regio...
## [AI governance: the invisible prerequisite for success](https://www.techzine.eu/experts/analytics/140867/ai-governance-the-invisible-prerequisite-for-success/ "AI governance: the invisible prerequisite for success")
### When AI never gets past the demo
## [Agentic AI is reshaping the network – and it’s time to upgrade](https://www.techzine.eu/experts/infrastructure/140771/agentic-ai-is-reshaping-the-network-and-its-time-to-upgrade/ "Agentic AI is reshaping the network – and it’s time to upgrade")
Wireless connectivity is becoming a critical infrastructure for the A...
## [Tech calendar](https://www.techcalendar.eu/)
## [Infosecurity Europe](https://www.techcalendar.eu/events/infosecurity-europe/ "Infosecurity Europe")
June 2, 2026 London
## [.NEXT On Tour Amsterdam](https://www.techcalendar.eu/events/next-on-tour-amsterdam/ ".NEXT On Tour Amsterdam")
June 9, 2026 Amsterdam
## [Oxygenate](https://www.techcalendar.eu/events/oxygenate/ "Oxygenate")
June 11, 2026 Hilversum
## [VivaTech](https://www.techcalendar.eu/events/vivatech/ "VivaTech")
June 17, 2026 Paris Expo Porte de Versailles 1 Place de la Porte de Versailles Pavillon 7 F-75015 Paris France
## [GITEX AI EUROPE 2026](https://www.techcalendar.eu/events/giex-ai-europe-2026/ "GITEX AI EUROPE 2026")
June 30, 2026 Messe Berlin Exhibition Center, South Entrance
## [GOTO Copenhagen 2026](https://www.techcalendar.eu/events/goto-copenhagen-2026/ "GOTO Copenhagen 2026")
September 28, 2026 TAP1, Raffinaderivej 10, 2300 København S, Denmark
## [Whitepapers](https://www.techzine.eu/whitepapers/)
[![Image 14: Experience Synology’s latest enterprise backup solution](https://www.techzine.eu/wp-content/uploads/2025/01/Synology-ActiveProtect01-150x90.jpg)](https://www.techzine.eu/whitepapers/infrastructure/130239/experience-synologys-latest-enterprise-backup-solution/ "Experience Synology’s latest enterprise backup solution")
## [Experience Synology’s latest enterprise backup solution](https://www.techzine.eu/whitepapers/infrastructure/130239/experience-synologys-latest-enterprise-backup-solution/ "Experience Synology’s latest enterprise backup solution")
How do you ensure your company data is both secure and quickly recove...
[![Image 15: How to choose the right Enterprise Linux platform?](https://www.techzine.eu/wp-content/uploads/2025/03/shutterstock_395537074-150x90.jpg)](https://www.techzine.eu/whitepapers/infrastructure/131104/how-to-choose-the-right-enterprise-linux-platform/ "How to choose the right Enterprise Linux platform?")
## [How to choose the right Enterprise Linux platform?](https://www.techzine.eu/whitepapers/infrastructure/131104/how-to-choose-the-right-enterprise-linux-platform/ "How to choose the right Enterprise Linux platform?")
"A Buyer's Guide to Enterprise Linux" comprehensively analyzes the mo...
## [Enhance your data protection strategy for 2025](https://www.techzine.eu/whitepapers/infrastructure/129552/enhance-your-data-protection-strategy-for-2025/ "Enhance your data protection strategy for 2025")
The Data Protection Guide 2025 explores the essential strategies and...
## [Strengthen your cybersecurity with DNS best practices](https://www.techzine.eu/whitepapers/security/129390/strengthen-your-cybersecurity-with-dns-best-practices/ "Strengthen your cybersecurity with DNS best practices")
The white paper "DNS Best Practices" by Infoblox presents essential g...
### Techzine Global
Techzine focusses on IT professionals and business decision makers by publishing the latest IT news and background stories. The goal is to help IT professionals get acquainted with new innovative products and services, but also to offer in-depth information to help them understand products and services better.
### Follow us
[Twitter](https://x.com/techzine)
[LinkedIn](https://www.linkedin.com/company/techzine-eu)
[YouTube](https://www.youtube.com/@Techzine)
© 2026 Dolphin Publications B.V.
All rights reserved.
### Techzine Service
*   [Become a partner](https://www.dolphin.pub/)
*   [Advertising](https://www.dolphin.pub/)
*   [About Us](https://www.techzine.eu/about-us/)
*   [Contact](https://www.techzine.eu/contact/)
*   [Terms & Conditions](https://www.techzine.eu/conditions/)
*   [Privacy Statement](https://www.techzine.eu/privacy/)