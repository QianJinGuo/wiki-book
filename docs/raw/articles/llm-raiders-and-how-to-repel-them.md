---
title: "LLM raiders and how to repel them"
sha256: 06dc9727dde918c4fff36e98dc529f707e482b82a9a038f1f766f28be080c101
type: entity
tags: [llmjacking, ai-security, lvm-servers, threat-intel]
created: 2026-05-14
updated: 2026-05-14
source: rss
source_url: https://www.kaspersky.com/blog/llmjacking-2026-private-ai-server-security/55768/
review_value: 7
review_confidence: 8
review_recommendation: neutral
ingested: 2026-05-16
---
# LLM raiders and how to repel them
> 来源：[[raw/articles/llm-raiders-and-how-to-repel-them|原文存档]]
## 核心要点
- LLMjacking 攻击趋势：23% 的恶意请求针对 AI 服务器的 LLM 能力
- 攻击者利用被盗 API 密钥访问第三方 LLM 服务，成本比直接运行模型低 10 倍
- 防御建议：严格密钥管理、最小权限原则、API 流量监控
→ [[raw/articles/llm-raiders-and-how-to-repel-them|原文存档]]
Published Time: 2026-05-12T20:35:00+00:00
Markdown Content:
# LLMjacking: what these attacks are, and how to protect AI servers
Solutions for:
*   [Home Products](https://www.kaspersky.com/home-security?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_prodmen_sm-team_______d41e2cff6378ae8f)
*   [Small Business 1-50 employees](https://www.kaspersky.com/small-business-security?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_prodmen_sm-team_______d41e2cff6378ae8f "font-icons icon-small-business")
*   [Medium Business 51-999 employees](https://www.kaspersky.com/small-to-medium-business-security?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_prodmen_sm-team_______d41e2cff6378ae8f)
*   [Enterprise 1000+ employees](https://www.kaspersky.com/enterprise-security?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_prodmen_sm-team_______d41e2cff6378ae8f)
[](https://www.kaspersky.com/blog/llmjacking-2026-private-ai-server-security/55768/)
[_Kaspersky official blog_](https://www.kaspersky.com/blog/ "Kaspersky official blog")
*   [My Account](https://my.kaspersky.com/?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_main-menu_sm-team_______56de5f8d1e0687ee)
    *   [My Kaspersky](https://my.kaspersky.com/?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_main-menu_sm-team_______56de5f8d1e0687ee)
    *   [My Products / Subscriptions](https://my.kaspersky.com/MyLicenses?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_main-menu_sm-team_______56de5f8d1e0687ee)
    *   [My Orders](https://my.kaspersky.com/redirect?target=AccountSettingsPurchaseHistory&icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_main-menu_sm-team_______56de5f8d1e0687ee)
*   [Solutions](https://www.kaspersky.com/enterprise-security?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
    *           *   [![Image 4](https://www.kaspersky.com/content/en-global/images/enterprise/new-product-icons/kl_IoT_Security_black_icon.png)Internet of Things & Embedded Security](https://www.kaspersky.com/enterprise-security/embedded-security-internet-of-things?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)[Learn more](https://www.kaspersky.com/enterprise-security/embedded-security-internet-of-things?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce) 
        *   [![Image 5](https://content.kaspersky-labs.com/se/com/content/en-global/images/enterprise/new-product-icons/kl--industrial--cybersecurity--black--icon/kl--industrial--cybersecurity--black--icon-v4.png)Industrial CyberSecurity](https://www.kaspersky.com/enterprise-security/industrial-cybersecurity?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)[Learn more](https://www.kaspersky.com/enterprise-security/industrial-cybersecurity?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce) 
        *   [![Image 6](https://content.kaspersky-labs.com/se/com/content/en-global/images/enterprise/icons/related-solutions-icons/rs-b-kfp/rs-b-kfp.png)Fraud Prevention](https://www.kaspersky.com/enterprise-security/fraud-prevention?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)[Learn more](https://www.kaspersky.com/enterprise-security/fraud-prevention?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce) 
        *   [![Image 7](https://content.kaspersky-labs.com/se/com/content/en-global/images/enterprise/icons/Related-solutions-icons/kaspersky-os/kaspersky-os.png)KasperskyOS – based solutions](https://www.kaspersky.com/enterprise-security/kasperskyos?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)[Learn more](https://www.kaspersky.com/enterprise-security/kasperskyos?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce) 
    *           *   ###### Other solutions
        *   [Kaspersky for Security Operations Center](https://www.kaspersky.com/enterprise-security/security-operations-center-soc?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
        *   [Kaspersky IoT Infrastructure Security](https://www.kaspersky.com/enterprise-security/kaspersky-iot-infrastructure-security?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
        *   [Kaspersky Secure Remote Workspace](https://www.kaspersky.com/enterprise-security/kaspersky-secure-remote-workspace?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
*   [Industries](https://www.kaspersky.com/enterprise-security/industries?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
    *           *   [![Image 8](https://content.kaspersky-labs.com/se/com/content/en-global/images/enterprise/new-product-icons/kl--national--cybersecurity--black--icon/kl--national--cybersecurity--black--icon-v3.svg)National Cybersecurity](https://www.kaspersky.com/enterprise-security/national-cybersecurity?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)[Learn more](https://www.kaspersky.com/enterprise-security/national-cybersecurity?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce) 
        *   [![Image 9](https://content.kaspersky-labs.com/se/com/content/en-global/images/enterprise/icons/related-solutions-icons/ent-industrial-protection-transparent/ent-industrial-protection-transparent.png)Industrial Cybersecurity](https://www.kaspersky.com/enterprise-security/industrial?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)[Learn more](https://www.kaspersky.com/enterprise-security/industrial?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce) 
        *   [![Image 10](https://content.kaspersky-labs.com/se/com/content/en-global/images/enterprise/new-product-icons/kl--financial--services--cybersecurity--black--icon/kl--financial--services--cybersecurity--black--icon-v3.svg)Finance Services Cybersecurity](https://www.kaspersky.com/enterprise-security/finance?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)[Learn more](https://www.kaspersky.com/enterprise-security/finance?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce) 
        *   [![Image 11](https://content.kaspersky-labs.com/se/com/content/en-global/images/enterprise/new-product-icons/kl--healthcare--cybersecurity--black--icon/kl--healthcare--cybersecurity--black--icon-v3.svg)Healthcare Cybersecurity](https://www.kaspersky.com/enterprise-security/healthcare?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)[Learn more](https://www.kaspersky.com/enterprise-security/healthcare?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce) 
        *   [![Image 12](https://content.kaspersky-labs.com/se/com/content/en-global/images/enterprise/new-product-icons/kl--transportation--cybersecurity--black--icon/kl--transportation--cybersecurity--black--icon.png)Transportation Cybersecurity](https://www.kaspersky.com/enterprise-security/transportation-cybersecurity-it-infrastructure?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)[Learn more](https://www.kaspersky.com/enterprise-security/transportation-cybersecurity-it-infrastructure?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce) 
        *   [![Image 13](https://content.kaspersky-labs.com/se/com/content/en-global/images/enterprise/new-product-icons/kl--retail--cybersecurity--black--icon/kl--retail--cybersecurity--black--icon.png)Retail Cybersecurity](https://www.kaspersky.com/enterprise-security/retail-cybersecurity?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)[Learn more](https://www.kaspersky.com/enterprise-security/retail-cybersecurity?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce) 
        *   [![Image 14](https://content.kaspersky-labs.com/se/com/content/en-global/images/enterprise/icons/ent-new-telecom-banner-black-77-77/ent-new-telecom-banner-black-77-77.png)Telecom Cybersecurity](https://www.kaspersky.com/enterprise-security/telecom?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)[Learn more](https://www.kaspersky.com/enterprise-security/telecom?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce) 
*   [Products](https://www.kaspersky.com/enterprise-security/products?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
    *           *   [![Image 15](https://media.kasperskydaily.com/wp-content/uploads/sites/92/2024/04/10052437/k_Next_RGB_black_icon.png)Kaspersky Next NEW!](https://www.kaspersky.com/next?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)[Learn more](https://www.kaspersky.com/next?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce) 
        *   [![Image 16](https://content.kaspersky-labs.com/se/com/content/en-global/images/enterprise/icons/related-solutions-icons/rs-b-kata/rs-b-kata.png)Kaspersky Anti Targeted Attack Platform](https://www.kaspersky.com/enterprise-security/anti-targeted-attack-platform?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)[Learn more](https://www.kaspersky.com/enterprise-security/anti-targeted-attack-platform?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce) 
        *   [![Image 17](https://content.kaspersky-labs.com/se/com/content/en-global/images/smb/icons/icon-hybrid-cloud/icon-hybrid-cloud.png)Kaspersky Hybrid Cloud Security](https://www.kaspersky.com/enterprise-security/cloud-security?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)[Learn more](https://www.kaspersky.com/enterprise-security/cloud-security?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce) 
        *   [![Image 18](https://content.kaspersky-labs.com/se/com/content/en-global/images/enterprise/new-product-icons/kl--security--for--mail--server--black--icon/kl--security--for--mail--server--black--icon.png)Kaspersky Security for Mail Server](https://www.kaspersky.com/enterprise-security/mail-server-security?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)[Learn more](https://www.kaspersky.com/enterprise-security/mail-server-security?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce) 
        *   [![Image 19](https://content.kaspersky-labs.com/se/com/content/en-global/images/enterprise/new-product-icons/kl--industrial--cybersecurity--black--icon/kl--industrial--cybersecurity--black--icon-v4.png)Kaspersky Industrial CyberSecurity](https://www.kaspersky.com/enterprise-security/industrial-cybersecurity?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)[Learn more](https://www.kaspersky.com/enterprise-security/industrial-cybersecurity?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce) 
    *           *   ###### Other products
        *   [Kaspersky Security for Internet Gateway](https://www.kaspersky.com/enterprise-security/products/internet-gateway?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
        *   [Kaspersky Embedded Systems Security](https://www.kaspersky.com/enterprise-security/embedded-systems?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
        *   [Kaspersky IoT Infrastructure Security](https://www.kaspersky.com/enterprise-security/kaspersky-iot-infrastructure-security?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
        *   [Kaspersky Secure Remote Workspace](https://www.kaspersky.com/enterprise-security/kaspersky-secure-remote-workspace?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
        *   [View all](https://www.kaspersky.com/enterprise-security/products?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
*   [Services](https://www.kaspersky.com/enterprise-security/services?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
    *           *   [![Image 20](https://content.kaspersky-labs.com/se/com/content/en-global/images/enterprise/new-product-icons/kl--cybersecurity--services--black--icon/kl--cybersecurity--services--black--icon.png)Kaspersky Cybersecurity Services](https://www.kaspersky.com/enterprise-security/cybersecurity-services?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)[Learn more](https://www.kaspersky.com/enterprise-security/cybersecurity-services?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce) 
        *   [![Image 21](https://content.kaspersky-labs.com/fm/site-editor/ca/ca65765dc55ec7830b51d9d010c372f7/processed/kl-security-awareness-black-icon-q93.webp)Kaspersky Security Awareness](https://www.kaspersky.com/enterprise-security/security-awareness?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)[Learn more](https://www.kaspersky.com/enterprise-security/security-awareness?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce) 
        *   [![Image 22](https://content.kaspersky-labs.com/se/com/content/en-global/images/enterprise/new-product-icons/kl--premium--support--and--professional--services--black--icon/kl--premium--support--and--professional--services--black--icon.png)Kaspersky Premium Support](https://www.kaspersky.com/enterprise-security/premium-support?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)[Kaspersky Premium Support](https://www.kaspersky.com/enterprise-security/premium-support?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce) 
        *   [![Image 23](https://content.kaspersky-labs.com/se/com/content/en-global/images/enterprise/new-product-icons/kl--threat--intelligence--black--icon/kl--threat--intelligence--black--icon.png)Kaspersky Threat Intelligence](https://www.kaspersky.com/enterprise-security/threat-intelligence?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)[Learn more](https://www.kaspersky.com/enterprise-security/threat-intelligence?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce) 
        *   [![Image 24](https://content.kaspersky-labs.com/se/com/content/en-global/images/enterprise/new-product-icons/kl--managed--protection--black--icon/kl--managed--protection--black--icon.png)Kaspersky Managed Detection and Response](https://www.kaspersky.com/enterprise-security/managed-detection-and-response?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)[Learn more](https://www.kaspersky.com/enterprise-security/managed-detection-and-response?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce) 
        *   [![Image 25](https://content.kaspersky-labs.com/se/com/content/en-global/images/enterprise/new-product-icons/kl--targeted--attack-----discovery--black--icon/kl--targeted--attack-----discovery--black--icon.png)Kaspersky Compromise Assessment](https://www.kaspersky.com/enterprise-security/compromise-assessment?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)[Learn more](https://www.kaspersky.com/enterprise-security/compromise-assessment?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce) 
    *           *   ###### Other services
        *   [Kaspersky Professional Services](https://www.kaspersky.com/enterprise-security/professional-services?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
        *   [Kaspersky Incident Response](https://www.kaspersky.com/enterprise-security/incident-response?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
        *   [Kaspersky Cybersecurity Training](https://www.kaspersky.com/enterprise-security/cyber-security-training?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
        *   [View all](https://www.kaspersky.com/enterprise-security/services?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
*   [Resource Center](https://www.kaspersky.com/enterprise-security/resources?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
    *   [Case Studies](https://www.kaspersky.com/enterprise-security/resources/case-studies?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
    *   [White Papers](https://www.kaspersky.com/enterprise-security/resources/white-papers?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
    *   [Datasheets](https://www.kaspersky.com/enterprise-security/resources/data-sheets?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
    *   [Technologies](https://www.kaspersky.com/enterprise-security/wiki-section/home?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
    *   [MITRE ATT&CK](https://www.kaspersky.com/MITRE?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
*   [About Us](https://www.kaspersky.com/about?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
    *   [Transparency](https://www.kaspersky.com/about/transparency?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
    *   [Corporate News](https://www.kaspersky.com/about/press-releases?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
    *   [Press Center](https://press.kaspersky.com/?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
    *   [Careers](https://www.kaspersky.com/about/careers?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
    *   [Sponsorship](https://www.kaspersky.com/about/sponsorships/?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
    *   [Policy Blog](https://www.kaspersky.com/about/policy-blog?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
    *   [Contacts](https://www.kaspersky.com/about/contact?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
*   [GDPR](https://www.kaspersky.com/gdpr?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
*   [Blog](https://www.kaspersky.com/blog/)
    *   [Business](https://www.kaspersky.com/blog/category/business/)
    *   [News](https://www.kaspersky.com/blog/category/news/)
    *   [Privacy](https://www.kaspersky.com/blog/category/privacy/)
    *   [Products](https://www.kaspersky.com/blog/category/products/)
    *   [Special Projects](https://www.kaspersky.com/blog/category/special-projects/)
    *   [Technology](https://www.kaspersky.com/blog/category/technology/)
    *   [Threats](https://www.kaspersky.com/blog/category/threats/)
    *   [Tips](https://www.kaspersky.com/blog/category/tips/)
    *   [RSS](https://www.kaspersky.com/blog/feed/)
    *   [Newsletter subscription](https://www.kaspersky.com/blog/subscribe/)
*   [Secure Futures](https://www.kaspersky.com/blog/secure-futures-magazine/?icid=gl_kdailyheader_acq_ona_smm__onl_b2b_kdaily_main-menu_sm-team_______ad86ac275857d7ce)
*   [](https://www.kaspersky.com/blog/llmjacking-2026-private-ai-server-security/55768/#)[](https://www.kaspersky.com/blog/llmjacking-2026-private-ai-server-security/55768/#)
*   Solutions for:
*   [Home](https://www.kaspersky.com/blog/llmjacking-2026-private-ai-server-security/55768/#)
    *   [Security Solutions](https://www.kaspersky.com/home-security?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_mobmen_sm-team_______04916cf152d14fc5)
        *   [Kaspersky Premium](https://www.kaspersky.com/premium?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_mobmen_sm-team_______04916cf152d14fc5)
        *   [Kaspersky Plus](https://www.kaspersky.com/plus?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_mobmen_sm-team_______04916cf152d14fc5)
        *   [Kaspersky Standard](https://www.kaspersky.com/standard?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_mobmen_sm-team_______04916cf152d14fc5)
        *   [View All Solutions](https://www.kaspersky.com/home-security?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_mobmen_sm-team_______04916cf152d14fc5)
        *   ###### Privacy & Kids
        *   [Kaspersky Safe Kids](https://www.kaspersky.com/safe-kids?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_mobmen_sm-team_______04916cf152d14fc5)
        *   [Kaspersky VPN Secure Connection](https://www.kaspersky.com/vpn-secure-connection?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_mobmen_sm-team_______04916cf152d14fc5)
        *   [Kaspersky Password Manager](https://www.kaspersky.com/password-manager?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_mobmen_sm-team_______04916cf152d14fc5)
    *   [Renew Licence](https://www.kaspersky.com/renewal-center/home?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_mobmen_sm-team_______04916cf152d14fc5)
    *   [Support](https://support.kaspersky.com/?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_mobmen_sm-team_______04916cf152d14fc5)
    *   [Trials&Update](https://www.kaspersky.com/downloads?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_mobmen_sm-team_______04916cf152d14fc5)
*   [Business](https://www.kaspersky.com/blog/llmjacking-2026-private-ai-server-security/55768/#)
    *   [Kaspersky Next](https://www.kaspersky.com/next?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_mobmen_sm-team_______04916cf152d14fc5)
    *   [Small Business (1-50 employees)](https://www.kaspersky.com/small-business-security?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_mobmen_sm-team_______04916cf152d14fc5)
    *   [Medium Business (51-999 employees)](https://www.kaspersky.com/small-to-medium-business-security?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_mobmen_sm-team_______04916cf152d14fc5)
    *   [Enterprise (1000+ employees)](https://www.kaspersky.com/enterprise-security?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_mobmen_sm-team_______04916cf152d14fc5)
*   [Search blog posts](https://www.kaspersky.com/blog/?s=)
*   [Blog](https://wwww.kaspersky.com/blog/)
    *   [Business](https://www.kaspersky.com/blog/category/business/) 
    *   [News](https://www.kaspersky.com/blog/category/news/) 
    *   [Privacy](https://www.kaspersky.com/blog/category/privacy/) 
    *   [Products](https://www.kaspersky.com/blog/category/products/) 
    *   [Special Projects](https://www.kaspersky.com/blog/category/special-projects/) 
    *   [Technology](https://www.kaspersky.com/blog/category/technology/) 
    *   [Threats](https://www.kaspersky.com/blog/category/threats/) 
    *   [Tips](https://www.kaspersky.com/blog/category/tips/) 
    *   [RSS](https://www.kaspersky.com/blog/feed/)
*   [About us](https://www.kaspersky.com/blog/llmjacking-2026-private-ai-server-security/55768/#)
    *   [About company](https://www.kaspersky.com/about/company?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_mobmen_sm-team_______04916cf152d14fc5)
    *   [Transparency](https://www.kaspersky.com/transparency?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_mobmen_sm-team_______04916cf152d14fc5)
    *   [Corporate News](https://www.kaspersky.com/about/press-releases?rel=1&sel=date)
    *   [Press Center](https://www.kaspersky.com/about/press-center?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_mobmen_sm-team_______04916cf152d14fc5)
    *   [Careers](https://careers.kaspersky.com/?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_mobmen_sm-team_______04916cf152d14fc5)
    *   [Sponsorships](https://www.kaspersky.com/about/sponsorships?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_mobmen_sm-team_______04916cf152d14fc5)
    *   [Policy blog](https://www.kaspersky.com/about/policy-blog?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_mobmen_sm-team_______04916cf152d14fc5)
    *   [Contacts](https://www.kaspersky.com/about/contact?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_mobmen_sm-team_______04916cf152d14fc5)
*   [Partners](https://www.kaspersky.com/blog/llmjacking-2026-private-ai-server-security/55768/#)
    *   [Find a Partner](https://partnersearch.kaspersky.com/?b2b&locale=en)
    *   [Partners](https://www.kaspersky.com/partners?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_mobmen_sm-team_______04916cf152d14fc5)
*   [My Account](https://www.kaspersky.com/blog/llmjacking-2026-private-ai-server-security/55768/#)
    *   [Personal](https://www.kaspersky.com/blog/llmjacking-2026-private-ai-server-security/55768/#)
        *   [My Kaspersky](https://my.kaspersky.com/?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_mobmen_sm-team_______04916cf152d14fc5)
        *   [Renew your product](https://www.kaspersky.com/renewal-center/home?icid=gl_kdailyheader_acq_ona_smm__onl_b2c_kdaily_mobmen_sm-team_______04916cf152d14fc5)
    *   [Business](https://www.kaspersky.com/blog/llmjacking-2026-private-ai-server-security/55768/#)
        *   [KSOS portal](https://ksos.kaspersky.com/)
        *   [Kaspersky Business Hub](https://cloud.kaspersky.com/)
        *   [Renew your License](https://www.kaspersky.com/renewal-center/vsb)
Search
*   [![Image 26](https://media.kasperskydaily.com/wp-content/uploads/sites/92/2019/11/14063725/target.png) AI](https://www.kaspersky.com/blog/tag/ai/)
Attempts at hijacking AI resources are now taking place on an industrial scale. How is AI infrastructure being targeted, and what defensive measures should you implement?
*   [![Image 27](https://media.kasperskydaily.com/wp-content/uploads/2025/05/23110013/Stan-kaminski-avatar-192x192.jpg)](https://www.kaspersky.com/blog/author/stankaminsky/) 
[Stan Kaminsky](https://www.kaspersky.com/blog/author/stankaminsky/)
*   May 12, 2026
![Image 28: LLMjacking: what these attacks are, and how to protect your local AI servers](https://media.kasperskydaily.com/wp-content/uploads/sites/92/2026/05/12163137/llmjacking-2026-private-ai-server-security-featured.jpg)
AI security covers more than just data theft prevention, restricting [rogue AI agents](https://www.kaspersky.com/blog/moltbot-enterprise-risk-management/55317/), or stopping assistants from giving harmful advice. A relatively simple but rapidly scaling threat has emerged: attempts to hijack computational power and exploit someone else’s neural network for personal gain. This is known as LLMjacking. With AI compute costs widely predicted to [surge dramatically](https://oplexa.com/ai-inference-cost-crisis-2026/), the number of attackers driven by these motives is poised to grow. Consequently, when deploying proprietary AI servers and their supporting ecosystems like [RAG](https://en.wikipedia.org/wiki/Retrieval-augmented_generation) or [MCP](https://en.wikipedia.org/wiki/Model_Context_Protocol), it’s critical to establish rigorous security measures from day one.
## Statistics from a honeypot
The speed and scale of these resource-hijacking attempts are best illustrated by an [experiment](https://web.archive.org/web/20260412230759/https:/www.reddit.com/r/ollama/comments/1sff7i0/30_days_of_an_llm_honeypot/?solution=64b4494d52a1506664b4494d52a15066&js_challenge=1&token=bbbe4bf1c9a2b5160829c4be34da586161e5e506c5ef56a1c8acb5184e8d115f) documented in detail in April 2026. The investigator configured a Raspberry Pi to masquerade as a high-performance private AI server, and made it accessible from the internet. When queried, it reported the availability of Ollama, LM Studio, AutoGPT, LangServe, and text-gen-webui servers — all tools commonly used as wrappers for locally hosted AI models. The server also appeared ready to accept API requests in the OpenAI format, which has become the industry standard.
All these services were seemingly powered by a local instance of Qwen3-Coder 30B Heretic, one of the most powerful open-source models, with its safety alignment removed. To throw in a sweetener, the honeypot reported the presence of various RAG databases and an MCP server with tempting capabilities like _get\_credentials_ on board.
In reality, the Raspberry Pi was simply hosting 500 pre-saved responses from an actual Qwen3 model, with a lightweight script selecting the most relevant answer for each incoming query. This setup was enough to pass a superficial check while allowing the researcher to probe the attackers’ intentions.
According to the author, Shodan, a popular internet scanning service, discovered the server within three hours of its going live. Just one hour later, requests resembling capability reconnaissance began pouring in. Over the following month, the server handled more than 113 000 requests from thousands of unique IPs, with 23% of that traffic specifically targeted at discovering AI capabilities and exploiting local LLMs and AI agents.
Requests to endpoints like _/api/tags_ and _/v1/models_ allow attackers to fingerprint which models are hosted on a server, while scanning for _/.cursor/rules_ typically precedes an attempt to exploit an AI agent. Similarly, checking _/.well-known/mcp.json_ serves as an inventory of the victim’s MCP servers. While the author makes no mention of the total number of attacks that progressed beyond simple scanning, there were 175 active attempts to hijack the LLM during the final week of the experiment alone.
## What are the attackers after?
Based on the researcher’s observations, none of those targeting the decoy server attempted to execute arbitrary code or gain root access. (Editorial note: this is surprising and may point to gaps in logging.) Almost all attacks were aimed at siphoning resources. For example, the following activities were logged during the experiment:
*   A well-structured attempt to parse technical documentation for a microprocessor
*   A prompt to write an erotic novel
*   Requests to parse and structure social media text data regarding new vulnerabilities
*   An attempt to call Anthropic models using the compromised server as an API proxy
It’s worth noting that the reconnaissance of AI resources uses standardized and rapidly evolving tools. Requests from an application named LLM-Scanner originated from the infrastructure of seven different cloud providers across eight countries, suggesting that the raiders have put established methodologies in place, as well as specialized platforms for sharing techniques. By the third week of the experiment, the scanner had been updated with an additional check: it now used simple abstract questions to determine whether it’s interacting with live AI or a honeypot returning canned responses.
Among the non-specific attacks, the experiment recorded numerous attempts to exfiltrate credentials from the _.env_ file. Attackers systematically hunted for this file across every conceivable directory on the server. Leaving an _.env_ file publicly accessible is one of the most elementary mistakes when deploying projects on Laravel, _Node.js_, and other frameworks, yet it remains a common oversight — particularly among beginners and vibe coders. Consequently, attackers have every reason to expect their efforts to pay off.
## Conclusions and defense tips
Scanning publicly accessible servers and attempting to exploit them is nothing new, but the rise of LLMs gives attackers another way to monetize their efforts — one that’s both highly lucrative for them and devastating for their victims. To understand how massive these attacks could become, look at their closest counterpart: the cryptojacking market — where criminals mine cryptocurrency using stolen computational resources. That market [grew by 20% in 2025](https://www.economist.com/science-and-technology/2026/04/22/crypto-miners-are-quietly-colonising-computers) alone. As AI-powered solutions proliferate, and as major providers hike subscription costs while local AI chips remain in short supply, we should expect LLMjacking to become an industrial-scale phenomenon.
Key defensive measures for private AI infrastructure
*   For AI systems running locally on a single machine, ensure that servers like LM Studio, Ollama, or similar are configured to accept connections only on the local interface (localhost), rather than all available network interfaces. This restricts LLM access to the host machine itself, and prevents the AI from being reachable over the internet.
*   For servers handling remote requests — even if the server only operates within a local corporate network — implement [robust authentication and authorization](https://www.kaspersky.com/blog/how-to-benefit-from-identity-security/48399/) rather than relying solely on API key validation. Solutions based on OIDC or OAuth2 with short-lived tokens are the most effective. This not only defends against LLMjacking, but also allows for more granular tracking of user activity, and prevents API key abuse. Furthermore, keys must be protected from more than just external attackers; a growing risk is the [misuse of keys by AI agents](https://www.theregister.com/2026/04/27/cursoropus_agent_snuffs_out_pocketos/) themselves. This applies to LLM interfaces as well as MCP, RAG, and others.
*   Use network segmentation and IP allowlists to give AI server access only to the departments, employees, and services that require it.
*   Ensure that all client-server connections are secured with a current version of TLS.
*   Apply the [principle of least privilege](https://www.kaspersky.com/blog/what-is-the-principle-of-least-privilege/50232/) by separating access to specific services; for instance, MCP and LLM components should have their own distinct access tokens.
*   Ensure an [EDR security agent](https://www.kaspersky.com/next-edr-optimum?icid=gl_kdailyplacehold_acq_ona_smm__onl_b2b_kdaily_wpplaceholder_sm-team___knext____3e4d9692a0f54f81) is installed on all workstations and servers, including those hosting AI models.
*   Monitor AI resource consumption, establish usage quotas for different employee roles, and set up alerts for anomalous activity spikes.
*   Maintain detailed logs of LLM responses and requests made to the model and its supporting tools. Integrate these data sources with [your SIEM](https://www.kaspersky.com/enterprise-security/unified-monitoring-and-analysis-platform?icid=gl_kdailyplacehold_acq_ona_smm__onl_b2b_kasperskydaily_wpplaceholder____). Ensure logs are resilient against tampering or deletion.
[![Image 29](https://media.kasperskydaily.com/wp-content/uploads/sites/92/2025/09/25072448/Next-Optimum_EN__1340_400.jpg)](https://www.kaspersky.com/next-optimum?icid=gl_kdailyplacehold_acq_ona_smm__onl_b2b_kdaily_wpplaceholder_sm-team___knext____d0b2d5e7bcf532c5)
*   [AI](https://www.kaspersky.com/blog/tag/ai/)
*   [LLM](https://www.kaspersky.com/blog/tag/llm/)
*   [machine learning](https://www.kaspersky.com/blog/tag/machine-learning/)
*   [security](https://www.kaspersky.com/blog/tag/security-2/)
*   [servers](https://www.kaspersky.com/blog/tag/servers/)
[![Image 30](https://media.kasperskydaily.com/wp-content/uploads/sites/92/2020/07/29124059/reliable-protection-for-your-business-sidebar-en.jpg)](https://www.kaspersky.com/next-optimum?icid=gl_kdailyplacehold_acq_ona_smm__onl_b2b_kdaily_wpplaceholder_sm-team___knext____d0b2d5e7bcf532c5)[![Image 31](https://media.kasperskydaily.com/wp-content/uploads/sites/92/2020/07/29124059/reliable-protection-for-your-business-sidebar-en.jpg)](https://www.kaspersky.com/next-optimum?icid=gl_kdailyplacehold_acq_ona_smm__onl_b2b_kdaily_wpplaceholder_sm-team___knext____d0b2d5e7bcf532c5)
##### Related
[![Image 32: A practical guide to secure vibe-coding for small businesses](https://media.kasperskydaily.com/wp-content/uploads/sites/92/2026/04/28115330/safer-vibe-coding-2026-Featured-700x460.jpg)](https://www.kaspersky.com/blog/safer-vibe-coding-2026/55677/)
### [How to mitigate vibe-coding risks](https://www.kaspersky.com/blog/safer-vibe-coding-2026/55677/)
[![Image 33: Spotting cyberthreats: a guide for blind and low-vision users ](https://media.kasperskydaily.com/wp-content/uploads/sites/92/2026/04/15132754/be-my-eyes-ai-safety-for-visually-impaired-featured-700x460.jpg)](https://www.kaspersky.com/blog/be-my-eyes-ai-safety-for-visually-impaired/55611/)
### [How people with visual impairments can stay safe from cyberthreats](https://www.kaspersky.com/blog/be-my-eyes-ai-safety-for-visually-impaired/55611/)
[![Image 34: The Evolution of Kaspersky SIEM](https://media.kasperskydaily.com/wp-content/uploads/sites/92/2026/05/08073951/Kaspersky-siem-correlation-evolution-Featured-700x460.jpg)](https://www.kaspersky.com/blog/kaspersky-siem-correlation-evolution/55761/)
*   [Read next](https://www.kaspersky.com/blog/kaspersky-siem-correlation-evolution/55761/)
### [The evolution of SIEM correlation rules](https://www.kaspersky.com/blog/kaspersky-siem-correlation-evolution/55761/)
We regularly create new SIEM rules, but behind the scenes lies a more fundamental process —the evolution of the correlation rules themselves.
[![Image 35: The Evolution of Kaspersky SIEM](https://media.kasperskydaily.com/wp-content/uploads/sites/92/2026/05/08073951/Kaspersky-siem-correlation-evolution-Featured-700x460.jpg)](https://www.kaspersky.com/blog/kaspersky-siem-correlation-evolution/55761/)
*   [![Image 36](https://media.kasperskydaily.com/wp-content/uploads/sites/92/2025/11/28052745/Marmalidi-Profile-Picture-2026-192x192.jpg)](https://www.kaspersky.com/blog/author/alexandermarmalidi/) 
[Alexander Marmalidi](https://www.kaspersky.com/blog/author/alexandermarmalidi/)
*   May 8, 2026
##### Tips
*   [![Image 37](https://media.kasperskydaily.com/wp-content/uploads/sites/92/2019/11/14063839/bug.png) Tips](https://www.kaspersky.com/blog/tag/tips/)
### [Cracked in under a minute: (nearly) every other password](https://www.kaspersky.com/blog/passwords-hacking-research-2026/55743/)
We’ve revisited our study on the crackability of real-world passwords leaked on the dark web — originally conducted two years ago. The findings are sobering: nearly every other password can be cracked in under a minute, and three out of five take less than an hour. How can we move away from insecure passwords?
*   [![Image 38](https://media.kasperskydaily.com/wp-content/uploads/2025/05/23113624/alexey_antonov-192x192.jpg)](https://www.kaspersky.com/blog/author/alexeyantonov/) 
[Alexey Antonov](https://www.kaspersky.com/blog/author/alexeyantonov/)
*   May 7, 2026
*   [![Image 39](https://media.kasperskydaily.com/wp-content/uploads/sites/92/2019/11/14063839/bug.png) Tips](https://www.kaspersky.com/blog/tag/tips/)
### [What happens in the bedroom stays in the bedroom](https://www.kaspersky.com/blog/sex-toy-app-privacy-security-guide/55600/)
Smart sex toys and their companion apps collect and process some extremely personal data. We break down the risks involved, and ways to protect your privacy.
*   [![Image 40](https://media.kasperskydaily.com/wp-content/uploads/2025/05/16075858/Alanna.Titterington-192x192.jpg)](https://www.kaspersky.com/blog/author/alannatitterington/) 
[Alanna Titterington](https://www.kaspersky.com/blog/author/alannatitterington/)
*   April 13, 2026
*   [![Image 41](https://media.kasperskydaily.com/wp-content/uploads/sites/92/2019/11/14063839/bug.png) Tips](https://www.kaspersky.com/blog/tag/tips/)
### [Is your security system secure?](https://www.kaspersky.com/blog/security-console-hardening/55577/)
Protecting a security console is more critical than one might think. Here’s the lowdown on control-layer compromise, and how to keep it from happening.
*   [![Image 42](https://media.kasperskydaily.com/wp-content/uploads/sites/92/2025/09/30101827/Stepina-Maria-192x192.jpg)](https://www.kaspersky.com/blog/author/mariastepina/) 
[Maria Stepina](https://www.kaspersky.com/blog/author/mariastepina/)
*   April 8, 2026
*   [![Image 43](https://media.kasperskydaily.com/wp-content/uploads/sites/92/2019/11/14063839/bug.png) Tips](https://www.kaspersky.com/blog/tag/tips/)
### [Android trojan posing as government services and Starlink apps](https://www.kaspersky.com/blog/beatbanker-btmob-android-malware-disguised-starlink-inss-reembolso/55401/)
We break down the BeatBanker trojan attack, which combines espionage, crypto theft, and mining with inventive ways to dig its heels into a smartphone.
*   [![Image 44](https://media.kasperskydaily.com/wp-content/uploads/2017/06/28184811/GReAT.jpg)](https://www.kaspersky.com/blog/author/great/) 
[GReAT](https://www.kaspersky.com/blog/author/great/)
*   March 11, 2026
#### [Home Solutions](https://www.kaspersky.com/home-security?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   [Kaspersky Standard](https://www.kaspersky.com/standard?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   [Kaspersky Plus](https://www.kaspersky.com/plus?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   [Kaspersky Premium](https://www.kaspersky.com/premium?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   [All Solutions](https://www.kaspersky.com/home-security?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060#all)
#### [Small Business Products](https://www.kaspersky.com/small-business-security?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
1-100 EMPLOYEES
*   [Kaspersky Small Office Security](https://www.kaspersky.com/small-business-security/small-office-security?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   [Kaspersky Endpoint Security Cloud](https://www.kaspersky.com/small-to-medium-business-security/cloud?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   [All Products](https://www.kaspersky.com/small-business-security?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
#### [Medium Business Products](https://www.kaspersky.com/small-to-medium-business-security?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
101-999 EMPLOYEES
*   [Kaspersky Next](https://www.kaspersky.com/next?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   [Kaspersky Endpoint Security Cloud](https://www.kaspersky.com/small-to-medium-business-security/cloud?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   [Kaspersky Endpoint Security for Business Select](https://www.kaspersky.com/small-to-medium-business-security/endpoint-select?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   [Kaspersky Endpoint Security for Business Advanced](https://www.kaspersky.com/small-to-medium-business-security/endpoint-advanced?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   [All Products](https://www.kaspersky.com/small-to-medium-business-security?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
#### [Enterprise Solutions](https://www.kaspersky.com/enterprise-security?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
1000 EMPLOYEES
*   [Kaspersky Next](https://www.kaspersky.com/next?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   [Cybersecurity Services](https://www.kaspersky.com/enterprise-security/cybersecurity-services?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   [Threat Management and Defense](https://www.kaspersky.com/enterprise-security/threat-management-defense-solution?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   [Endpoint Security](https://www.kaspersky.com/enterprise-security/endpoint?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   [Hybrid Cloud Security](https://www.kaspersky.com/enterprise-security/cloud-security?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   [All Solutions](https://www.kaspersky.com/enterprise-security?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
Copyright © 2026 AO Kaspersky Lab. All Rights Reserved.
*   [Privacy Policy](https://www.kaspersky.com/web-privacy-policy?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   [Anti-Corruption Policy](https://www.kaspersky.com/anti-corruption-policy?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   [License Agreement B2C](https://www.kaspersky.com/end-user-license-agreement?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   [License Agreement B2B](https://www.kaspersky.com/business/eula?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   [Contact Us](https://www.kaspersky.com/about/contact?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   [About Us](https://www.kaspersky.com/about?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   [Partners](https://www.kaspersky.com/partners?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   [Blog](https://www.kaspersky.com/blog/)
*   [Resource Center](https://www.kaspersky.com/resource-center?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   [Press Releases](https://www.kaspersky.com/about/press-releases?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   [Trust Kaspersky](https://www.kaspersky.com/about-trust?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   ### [Securelist](https://securelist.com/?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   ### [Eugene Personal Blog](https://eugene.kaspersky.com/?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   ### [Encyclopedia](https://encyclopedia.kaspersky.com/?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   ### [Kaspersky ICS CERT](https://ics-cert.kaspersky.com/?icid=gl_kdailyfooter_acq_ona_smm__onl_b2c_kdaily_footer_sm-team_______ca305b37d3bf6060)
*   ### [](https://twitter.com/Kaspersky)
*   ### [](https://www.facebook.com/Kaspersky)
*   ### [](https://www.linkedin.com/company/kaspersky)
*   ### [](https://youtube.com/Kaspersky)
*   ### [](https://www.instagram.com/kasperskylab)
Global
[](https://www.kaspersky.com/blog/llmjacking-2026-private-ai-server-security/55768/#)
*   Americas
*   [Brasil](https://www.kaspersky.com.br/blog/)
*   [México](https://latam.kaspersky.com/blog)
*   Africa
*   [South Africa](https://www.kaspersky.co.za/blog/)
*   Middle East
*   [Middle East](https://me-en.kaspersky.com/blog/)
*   [الشرق الأوسط](https://me.kaspersky.com/blog/)
*   Western Europe
*   [Deutschland & Schweiz](https://www.kaspersky.de/blog/)
*   [España](https://www.kaspersky.es/blog/)
*   [France & Suisse](https://www.kaspersky.fr/blog/)
*   [Italia & Svizzera](https://www.kaspersky.it/blog/)
*   [Nederland & België](https://www.kaspersky.nl/blog)
*   [United Kingdom](https://www.kaspersky.co.uk/blog/)
*   Eastern Europe
*   [Polska](https://plblog.kaspersky.com/)
*   [Türkiye](https://www.kaspersky.com.tr/blog/)
*   [Россия (Russia)](https://www.kaspersky.ru/blog/)
*   [Kazakhstan](https://blog.kaspersky.kz/)
*   Asia & Pacific
*   [Australia](https://www.kaspersky.com.au/blog/)
*   [India](https://www.kaspersky.co.in/blog)
*   [中国 (China)](https://www.kaspersky.com.cn/blog)
*   [日本 (Japan)](https://blog.kaspersky.co.jp/)
*   For all other countries
*   [Global](https://www.kaspersky.com/blog/)
We use cookies to make your experience of our websites better. By using and further navigating this website you accept this. Detailed information about the use of cookies on this website is available by clicking on [more information](https://www.kaspersky.com/third-party-tracking).
ACCEPT AND CLOSE
![Image 46](https://ad.doubleclick.net/ddm/activity/src=13364882;type=invmedia;cat=kaspe015;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=;npa=;gdpr=$%7BGDPR%7D;gdpr_consent=$%7BGDPR_CONSENT_755%7D;ord=3476993035079.5073?)