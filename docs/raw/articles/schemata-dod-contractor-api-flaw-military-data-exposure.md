---
sha256: 0b143ec42a63ef828dc91ff6c7d73c71e2f91b94a87a3e3c8b35dad7087ce32c
source: newsletter
source_url: https://cyberscoop.com/schemata-dod-contractor-api-flaw-military-data-exposure/
tags: [cyberscoop]
title: "A DOD contractor’s API flaw exposed military course data and service member records"
published: 2026-05-06
ingested: 2026-05-12
---
# A DOD contractor’s API flaw exposed military course data and service member records | CyberScoop
[Skip to main content](http://cyberscoop.com/schemata-dod-contractor-api-flaw-military-data-exposure/#main)
Advertisement
*   [CyberScoop](https://cyberscoop.com/)
*   [AIScoop](https://aiscoop.com/)
*   [FedScoop](https://www.fedscoop.com/)
*   [DefenseScoop](https://defensescoop.com/)
*   [StateScoop](https://statescoop.com/)
*   [EdScoop](https://edscoop.com/)
[Advertise](https://scoopnewsgroup.com/oursolutions/)Search Close
 Search for:  Search
[![Image 1: CyberScoop](https://cyberscoop.com/wp-content/themes/scoopnewsgroup/dist/svg/logo-cyber.svg)](https://cyberscoop.com/)
Open navigation
*   [Topics](http://cyberscoop.com/schemata-dod-contractor-api-flaw-military-data-exposure/)
Back
    *   [AI](https://cyberscoop.com/news/ai/)
    *   [Cybercrime](https://cyberscoop.com/news/threats/cybercrime/)
    *   [Commentary](https://cyberscoop.com/news/commentary/)
    *   [Financial](https://cyberscoop.com/news/financial/)
    *   [Government](https://cyberscoop.com/news/government/)
    *   [Policy](https://cyberscoop.com/news/policy/)
    *   [Privacy](https://cyberscoop.com/news/privacy/)
    *   [Technology](https://cyberscoop.com/news/technology/)
    *   [Threats](https://cyberscoop.com/news/threats/)
    *   [Research](https://cyberscoop.com/news/research/)
    *   [Workforce](https://cyberscoop.com/news/workforce/)
*   [Special Reports](https://cyberscoop.com/specials/)
*   [Events](https://cyberscoop.com/attend)
*   [Podcasts](https://cyberscoop.com/listen/)
*   [Videos](https://cyberscoop.com/watch/)
*   [Insights](https://cyberscoop.com/insights/)
*   [CyberScoop 50](https://cyberscoop.com/cyberscoop50/vote/)
 Switch Site 
*   [CyberScoop](https://cyberscoop.com/)
*   [AIScoop](https://aiscoop.com/)
*   [FedScoop](https://www.fedscoop.com/)
*   [DefenseScoop](https://defensescoop.com/)
*   [StateScoop](https://statescoop.com/)
*   [EdScoop](https://edscoop.com/)
[Subscribe](https://cyberscoop.com/subscribe/)
Advertisement
Subscribe to our daily newsletter.
[Subscribe](http://cyberscoop.com/subscribe)
Close
*   [AI](http://cyberscoop.com/schemata-dod-contractor-api-flaw-military-data-exposure/)
# A DOD contractor’s API flaw exposed military course data and service member records
 Researchers say Schemata’s platform exposed names, emails, base assignments, and course materials before the company patched the issue and contacted government authorities. 
**By**[Greg Otto](https://cyberscoop.com/author/greg-otto/ "Greg Otto")
May 6, 2026
[](http://cyberscoop.com/schemata-dod-contractor-api-flaw-military-data-exposure/#)
Listen to this article
0:00
Learn more. This feature uses an automated voice, which may result in occasional errors in pronunciation, tone, or sentiment. 
![Image 2](https://cyberscoop.com/wp-content/uploads/sites/3/2026/05/GettyImages-1373079584.jpg?w=1013)
 (Getty Images) 
A defense technology company with Department of Defense contracts exposed user records and military training materials through API endpoints that lacked meaningful authorization checks, according to [an account published by Strix](https://www.strix.ai/blog/how-strix-found-zero-auth-vulnerability-dod-backed-startup), an open-source autonomous security testing project.
The issue affected Schemata, an [AI](https://cyberscoop.com/tag/artificial-intelligence-ai/)-powered virtual training platform used in military and defense settings. According to Strix, an ordinary low-privilege account was able to access data across multiple tenants, including user listings, organization records, course information, training metadata and direct links to documents hosted on the Schemata’s Amazon Web Services instances.
Strix said the exposed materials included a 3D virtual training course for naval maintenance personnel with documentation marked confidential and proprietary, a course containing Army field manuals on explosive ordnance handling and tactical deployment, and hundreds of user records linked to bases and training enrollments. Additionally, the exposed information included names, email addresses, enrollment details and the military bases where U.S. service members were stationed.
Schemata acknowledged the affected endpoints were exposed May 1, after what Strix described as a 150-day [disclosure](https://cyberscoop.com/tag/vulnerability-disclosure/) process. Strix said it verified remediation before publication and published its account earlier this week, 152 days after its initial disclosure attempt.
The reported vulnerability did not require a complex exploit. Strix said it used a low-privilege account to watch normal browser traffic, identify [API](https://cyberscoop.com/tag/api/) endpoints exposed through the application, and request high-value data using the same session. According to Strix, those requests returned records from outside the account’s own organization, suggesting the API was not properly enforcing tenant boundaries or user permissions.
Advertisement
In multi-tenant software, authorization controls are intended to ensure users can access only the data and functions assigned to their account or organization. The failure described by Strix would represent a basic breakdown in that model. The firm said some routes also appeared “write-enabled,” meaning a malicious actor could potentially modify or delete courses through update or delete requests, though the account does not say Strix performed destructive testing.
Strix did not respond to CyberScoop’s request for comment.
Schemata’s platform serves military and defense training environments, where user identities, assignments and course enrollments can reveal sensitive operational context. Even when information is not classified, records showing where service members are based, what training they are enrolled in and which materials they can access may create risks if exposed outside intended channels.
In a statement [posted on the company’s website](https://schemata.com/blog/security-disclosure-notice-and-response), Schemata said it did not have “evidence that any third party exploited the vulnerability to access customer data.”
The disclosure timeline also raises questions about how companies handling sensitive government-related data receive and respond to vulnerability reports. Strix said it first contacted Schemata on Dec. 2, 2025. According to the account, Schemata’s CEO initially responded, “I would love to hear what the vulnerability is, but I assume you want to get paid for it. Is that the play?”
Advertisement
Strix said it clarified the same day that compensation was not required and that its priority was user safety. It said it sent multiple follow-ups from Dec. 8-29, warning that the vulnerability was critical and asking where to send details. Five months later, after telling Schemata that researchers were publishing the information publicly, Schemata responded, acknowledged the exposed endpoints and said it would patch the issue immediately.
“After we received actionable details about the vulnerability and confirmed the security researcher appeared to be legitimate, our team remediated the vulnerability the same day, and the researcher independently verified the fix before publishing their findings,” Schemata’s statement reads. “We appreciate the security researcher bringing this to our attention and their contribution to the security of our platform.”
Schemata said it’s working with cybersecurity consultants to assist with its response and improve its security posture. The company also said it is in contact with government authorities about the vulnerability.
Defense contractors that handle Controlled Unclassified Information, or CUI, must report cyber incidents to the Department of Defense Cyber Crime Center (DC3). The center did not respond to CyberScoop’s request for comment.
[According to contracting data](https://www.highergov.com/awardee/schemata-inc-169726870/), the company holds $3.4 million in contracts with the Department of Defense. In May 2025, Schemata [announced $5 million in venture funding](https://gamesbeat.com/schemata-raises-5m-for-ai-training-program-for-defense-and-enterprise-sectors/) from several firms, including Andreessen Horowitz.
![Image 3: Greg Otto](https://cyberscoop.com/wp-content/uploads/sites/3/2026/04/Gregory-Otto_26-03-23_DTEX_March_2026_0136.jpg?w=150&h=150&crop=1)
#### Written by Greg Otto
 Greg Otto is Editor-in-Chief of CyberScoop, overseeing all editorial content for the website. Greg has led cybersecurity coverage that has won various awards, including accolades from the Society of Professional Journalists and the American Society of Business Publication Editors. Prior to joining Scoop News Group, Greg worked for the Washington Business Journal, U.S. News & World Report and WTOP Radio. He has a degree in broadcast journalism from Temple University. 
#### In This Story
*   [API](https://cyberscoop.com/tag/api/)
*   [Artificial Intelligence (AI)](https://cyberscoop.com/tag/artificial-intelligence-ai/)
*   [data exposure](https://cyberscoop.com/tag/data-exposure/)
*   [Defense Cyber Crime Center](https://cyberscoop.com/tag/defense-cyber-crime-center/)
*   [Schemata](https://cyberscoop.com/tag/schemata/)
*   [Strix](https://cyberscoop.com/tag/strix/)
*   [vulnerability disclosure](https://cyberscoop.com/tag/vulnerability-disclosure/)
Share
*   [Facebook](https://www.facebook.com/sharer/sharer.php?u=https://cyberscoop.com/schemata-dod-contractor-api-flaw-military-data-exposure/)
*   [LinkedIn](https://www.linkedin.com/cws/share?url=https://cyberscoop.com/schemata-dod-contractor-api-flaw-military-data-exposure/)
*   [Twitter](https://twitter.com/intent/tweet?url=https://cyberscoop.com/schemata-dod-contractor-api-flaw-military-data-exposure/)
*   Copy Link
Advertisement
Advertisement
## More Like This
1.   ### [Google spotted an AI-developed zero-day before attackers could use it](https://cyberscoop.com/google-threat-intelligence-group-ai-developed-zero-day-exploit/)
By [Matt Kapko](https://cyberscoop.com/author/matt-kapko/) 
2.   ### [Sen. Schumer seeks DHS plan on AI cyber coordination with state, local governments](https://cyberscoop.com/chuck-schumer-seeks-dhs-plan-on-ai-cyber-coordination-with-state-local-governments/)
By [Tim Starks](https://cyberscoop.com/author/tim-starkscyberscoop-com/) 
3.   ### [Flaw in Claude’s Chrome extension allowed ‘any’ other plugin to hijack victims’ AI](https://cyberscoop.com/claude-chrome-extension-allows-plugins-to-hijack-ai/)
By [Derek B. Johnson](https://cyberscoop.com/author/derek-johnson/) 
Advertisement
## Top Stories
1.   ### [Family of FSU shooting victim sues OpenAI Foundation for negligence, lack of safety guardrails](https://cyberscoop.com/radio/openai-chatgpt-safety-guardrails-family-lawsuit-fsu-shooting/)
By [Derek B. Johnson](https://cyberscoop.com/author/derek-johnson/) 
2.   ### [The missing cybersecurity leader in small business](https://cyberscoop.com/the-missing-cyber-leader-virtual-fractional-ciso-smb-op-ed/)
By [Georgianna Shea](https://cyberscoop.com/author/georgianna-shea/)[Cason Smith](https://cyberscoop.com/author/cason-smith/) 
Advertisement
## Latest Podcasts
![Image 4](https://cyberscoop.com/wp-content/uploads/sites/3/2026/03/SafeMode-Guest_thumbnail-31.png?w=300)
#### [When iPhone exploits turn into commodities](https://cyberscoop.com/radio/criminal-groups-and-opportunistic-attackers-will-operationalize-it-against-the-enormous-population-of-out-of-date-ios-devices/)
![Image 5](https://cyberscoop.com/wp-content/uploads/sites/3/2026/05/SafeMode-Guest_thumbnail-38.png?w=300)
#### [Can you prove which agent did what?](https://cyberscoop.com/radio/greg-otto-talks-with-howard-ting-ceo-of-opal-security-about-the-growing-security-challenges-created-by-ai-agents/)
![Image 6](https://cyberscoop.com/wp-content/uploads/sites/3/2026/04/SafeMode-Guest_thumbnail-37.png?w=300)
#### [How government and Industry can raise the cost of cybercrime](https://cyberscoop.com/radio/why-addressing-oss-security-will-require-coordinated-action-across-government-and-industry/)
![Image 7](https://cyberscoop.com/wp-content/uploads/sites/3/2026/04/SafeMode-Guest_thumbnail-36.png?w=300)
#### [Proving Identity in the age of agents](https://cyberscoop.com/radio/attackers-are-shifting-away-from-traditional-vulnerabilities-and-focusing-on-identity-as-the-easiest-path-to-account-takeover-and-fraud/)
### Government
*   [Trump officials are steering a cybersecurity scholarship program toward AI](https://cyberscoop.com/sfs-scholarship-program-trump-administration-ai-shift/)
*   [One House Democrat is pressing Commerce on the government’s spyware use](https://cyberscoop.com/democrat-summer-lee-letter-briefing-nso-group-spyware-trump/)
*   [CISA wants critical infrastructure to operate ‘weeks to months’ in isolation during conflict](https://cyberscoop.com/cisa-ci-fortify-critical-infrastructure-isolation-recovery-guidance-during-conflict/)
*   [CISA boasts AI automation improvements to threat analysis, mission support](https://cyberscoop.com/cisa-ai-automation-security-operations-efficiency-uipath-fusion-event/)
### Technology
*   [A college student is suing a dating app that allegedly used her TikTok videos to target men in her dormitory](https://cyberscoop.com/meete-dating-app-lawsuit-geofencing-tiktok-misappropriation/)
*   [US government, allies publish guidance on how to safely deploy AI agents](https://cyberscoop.com/cisa-nsa-five-eyes-guidance-secure-deployment-ai-agents/)
*   [Surveillance campaigns use commercial surveillance tools to exploit long-known telecom vulnerabilities](https://cyberscoop.com/surveillance-campaigns-use-commercial-surveillance-tools-to-exploit-long-known-telecom-vulnerabilities/)
*   [Vuln in Google’s Antigravity AI agent manager could escape sandbox, give attackers remote code execution](https://cyberscoop.com/google-antigravity-pillar-security-agent-sandbox-escape-remote-code-execution/)
### Threats
*   [Ivanti customers confront yet another actively exploited zero-day](https://cyberscoop.com/ivanti-epmm-zero-day-vulnerability-exploited/)
*   [American duo sentenced for hosting laptop farms for North Korean IT workers](https://cyberscoop.com/north-korea-it-worker-scheme-laptop-farm-facilitators-sentenced/)
*   [A critical Palo Alto PAN-OS zero-day is being exploited in the wild](https://cyberscoop.com/palo-alto-networks-pan-os-firewall-zero-day-vulnerability-exploited/)
*   [Latvian national sentenced for ransomware attacks run by former Conti leaders](https://cyberscoop.com/latvian-russia-ransomware-conti-sentenced/)
### Policy
*   [FCC tightens KYC rules for telecoms, closes loophole for banned foreign services](https://cyberscoop.com/fcc-know-your-customer-supply-chain-security-rules/)
*   [Congress kicks the can down the road on surveillance law (again)](https://cyberscoop.com/congress-extends-section-702-surveillance-45-days/)
*   [Congress, industry ponder government posture for protecting data centers](https://cyberscoop.com/congress-industry-ponder-government-posture-for-protecting-data-centers/)
*   [Chinese national extradited to US for pandemic-era Silk Typhoon attacks](https://cyberscoop.com/xu-zewei-extradited-china-national-silk-typhoon-hafnium/)
Advertisement
[![Image 8: Scoop News Group](https://cyberscoop.com/wp-content/themes/scoopnewsgroup/dist/images/logo-sng.svg)](https://scoopnewsgroup.com/)[About Us](https://cyberscoop.com/about/)
*   [FedScoop](https://www.fedscoop.com/)
*   [DefenseScoop](https://defensescoop.com/)
*   [StateScoop](https://statescoop.com/)
*   [EdScoop](https://edscoop.com/)
*   [CyberScoop](https://cyberscoop.com/)
*   [AIScoop](https://aiscoop.com/)
*   [Newsletters](http://cyberscoop.com/subscribe)
*   [Advertise with us](https://scoopnewsgroup.com/oursolutions/)
*   [Ad specs](https://cdn.fedscoop.com/2025_DigitalAdvertisingSpecs.pdf)
*   [(202) 887-8001](tel:202208878001)
*   [hello@cyberscoop.com](mailto:hello@cyberscoop.com)
*   [FB](https://www.facebook.com/cyberscoop)
*   [TW](https://twitter.com/cyberscoopnews)
*   [LinkedIn](https://www.linkedin.com/company/4847467)
*   [IG](https://www.instagram.com/cyberscoopnews)
*   [YT](https://www.youtube.com/@cyberscoop_sng)
[![Image 9: CyberScoop](https://cyberscoop.com/wp-content/themes/scoopnewsgroup/dist/svg/logo-cyber.svg)](https://cyberscoop.com/) Close Ad 
Continue to CyberScoop
![Image 11](https://t.co/i/adsct?bci=3&dv=UTC%26en-US%26Google%20Inc.%26Linux%20x86_64%26255%26800%26600%268%2624%26800%26600%260%26na&eci=2&event_id=39c62923-e5b4-4f4b-8ace-d3b93ce4b975&events=%5B%5B%22pageview%22%2C%7B%7D%5D%5D&integration=advertiser&p_id=Twitter&p_user_id=0&pl_id=fab77e51-8e39-4166-a04d-e1b153e0cfa8&pt=A%20DOD%20contractor%E2%80%99s%20API%20flaw%20exposed%20military%20course%20data%20and%20service%20member%20records%20%7C%20CyberScoop&tw_document_href=https%3A%2F%2Fcyberscoop.com%2Fschemata-dod-contractor-api-flaw-military-data-exposure%2F&tw_iframe_status=0&tw_order_quantity=0&tw_pid_src=1&tw_sale_amount=0&twpid=tw.1778529343762.434240129322103878&txn_id=nv8sr&type=javascript&version=2.3.53)![Image 12](https://analytics.twitter.com/i/adsct?bci=3&dv=UTC%26en-US%26Google%20Inc.%26Linux%20x86_64%26255%26800%26600%268%2624%26800%26600%260%26na&eci=2&event_id=39c62923-e5b4-4f4b-8ace-d3b93ce4b975&events=%5B%5B%22pageview%22%2C%7B%7D%5D%5D&integration=advertiser&p_id=Twitter&p_user_id=0&pl_id=fab77e51-8e39-4166-a04d-e1b153e0cfa8&pt=A%20DOD%20contractor%E2%80%99s%20API%20flaw%20exposed%20military%20course%20data%20and%20service%20member%20records%20%7C%20CyberScoop&tw_document_href=https%3A%2F%2Fcyberscoop.com%2Fschemata-dod-contractor-api-flaw-military-data-exposure%2F&tw_iframe_status=0&tw_order_quantity=0&tw_pid_src=1&tw_sale_amount=0&twpid=tw.1778529343762.434240129322103878&txn_id=nv8sr&type=javascript&version=2.3.53)