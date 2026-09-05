---
source: newsletter
source_url: https://www.techzine.eu/blogs/analytics/141272/the-ui-is-dead-long-live-the-agent-servicenow-goes-headless-and-opens-its-platform/
tags: [techzine]
ingested: 2026-05-15
sha256: 3cdc222560030e7f22387b0c460bd03dc04b045ca4585a1d0d700e778753b9ee
---
Published Time: 2026-05-13T08:30:00+00:00
Markdown Content:
# The UI is dead, long live the agent: ServiceNow goes headless and opens its platform - Techzine Global
[Skip to content](https://www.techzine.eu/blogs/analytics/141272/the-ui-is-dead-long-live-the-agent-servicenow-goes-headless-and-opens-its-platform/#main)
[Techzine Global](https://www.techzine.eu/)
*   [Home](https://www.techzine.eu/)
*   [Topstories](https://www.techzine.eu/topstories/)
*   [Topics](https://www.techzine.eu/blogs/analytics/141272/the-ui-is-dead-long-live-the-agent-servicenow-goes-headless-and-opens-its-platform/#)
    *   [Analytics](https://www.techzine.eu/analytics/)
    *   [Applications](https://www.techzine.eu/applications/)
    *   [Collaboration](https://www.techzine.eu/collaboration/)
    *   [Data Management](https://www.techzine.eu/data-management/)
    *   [Devices](https://www.techzine.eu/devices/)
    *   [Devops](https://www.techzine.eu/devops/)
    *   [Infrastructure](https://www.techzine.eu/infrastructure/)
    *   [Privacy & Compliance](https://www.techzine.eu/privacy-compliance/)
    *   [Security](https://www.techzine.eu/security/)
*   [Insights](https://www.techzine.eu/blogs/analytics/141272/the-ui-is-dead-long-live-the-agent-servicenow-goes-headless-and-opens-its-platform/#)
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
*   [More](https://www.techzine.eu/blogs/analytics/141272/the-ui-is-dead-long-live-the-agent-servicenow-goes-headless-and-opens-its-platform/#)
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
[Techzine](https://www.techzine.eu/) » [Blogs](https://www.techzine.eu/blogs/) » [Analytics](https://www.techzine.eu/analytics/) » **The UI is dead, long live the agent: ServiceNow goes headless and opens its platform**
6 min[Analytics](https://www.techzine.eu/analytics/)
# The UI is dead, long live the agent: ServiceNow goes headless and opens its platform
## Door is open to third-party agents
![Image 1](https://www.techzine.nl/wp-content/uploads/2025/10/coen-author.png)
[Coen van Eenbergen](https://www.techzine.eu/author/coen-van-eenbergen/)[May 13, 2026 10:30 am May 13, 2026](https://www.techzine.eu/blogs/analytics/141272/the-ui-is-dead-long-live-the-agent-servicenow-goes-headless-and-opens-its-platform/)
[](javascript:void(0))
[](javascript:void(0))
[](javascript:void(0))
![Image 2: The UI is dead, long live the agent: ServiceNow goes headless and opens its platform](https://www.techzine.eu/wp-content/uploads/2026/05/servicenow-action-fabric-768x451.jpg)
**With Action Fabric, ServiceNow is opening up its entire system of workflows, playbooks, and business processes to all AI agents. It’s own, but more importantly, those from third parties as well. The choice of a headless architecture is striking and appears to be becoming an industry trend, as ServiceNow is not the first to adopt this approach.**
At Knowledge 2026, ServiceNow is introducing Action Fabric, an architectural layer that makes the entire ServiceNow platform accessible to (external) AI agents. This means those agents can connect directly to ServiceNow via an MCP server and, through that channel, execute workflows and playbooks, as well as perform actions, resolve tickets, or read data and context.
This has enormous implications, because over the past decade, organizations have built tens of thousands of workflows in ServiceNow that are now suddenly available to AI agents. Previously, these were only accessible via the platform and its interface. Action Fabric now opens up those workflows to any agent.
![Video 1](https://www.youtube.com/watch?v=5VubgBSPgCo)
## Governed execution: more than just reading and writing data
Action Fabric enables agents to perform tasks, which are processes that not only modify or add a record but also execute the entire chain of workflows.
A good example is a new employee who starts on Monday. In a traditional record system, this is just a single row in a database. In ServiceNow, creating that record triggers a series of automated actions: IT creates accounts in all systems associated with this employee’s role, security issues a badge based on the role, an onboarding document is generated, finance sets up payroll so the employee receives their salary, and facilities arranges a laptop and phone for the employee. SLAs monitor every step. If something goes wrong, the platform automatically escalates the issue.
That layered execution logic is what ServiceNow claims others cannot easily replicate. Not because the data is unique, but because the context, workflows, and governance are already built into it. Every action that runs through Action Fabric automatically passes through the AI Control Tower, where identity, permissions, and the audit trail are verified.
## Headless: the interface is no longer the product
The most striking architectural choice in Action Fabric is the decision to go headless. While enterprise software traditionally revolves around interfaces, portals, dashboards, and forms, headless is the exact opposite. Headless means that the underlying logic is directly accessible without a user interface, but via APIs and MCP. No user interface is involved.
A user’s password can be reset via the Now platform’s interface or directly through an AI agent. The same workflow is executed to accomplish this, and the steps followed are identical. Consequently, the same governance and observability apply. An agent can initiate any process or workflow, evaluate it, and then provide feedback to a user. All headless within an interface of your choice.
## Anthropic is the first to deploy agents on the Now platform
Anthropic is the first design partner for Action Fabric. Claude Cowork, Anthropic’s desktop application for autonomous task execution, is directly linked to ServiceNow’s governed system of action. An employee working in Cowork can request access rights directly in ServiceNow via Claude, after which the platform automatically activates the appropriate approval chain. No ticket, no help desk, no wait time.
## Headless is the new industry standard and the answer to the SaaSpocalypse
Headless is not new in itself; it has been used by developers for years. For example, there are various applications that are fundamentally designed to be headless, such as certain CMS or ERP solutions. However, the fact that enterprise applications are now becoming headless is new, and this is entirely due to the requirement that such software must be agent-ready.
Headless is the answer to the SaaSpocalypse. Some self-proclaimed AI experts and financial analysts believe that AI can replace all SaaS solutions, that companies can simply build their own ERP, CRM, or ITSM using AI. We’ve written before [that this is a pipe dream and will never happen](https://www.techzine.eu/blogs/applications/140683/the-saaspocalypse-is-a-myth-and-salesforce-proves-it/). We compared it with building a car. There’s a huge difference between simply building the body on top of an existing chassis with an engine, steering wheel, transmission, and safety systems, and having to design and build all those components yourself. Things like integrations, governance, observability, and optimal workflows are simply hard requirements within organizations.
SaaS solutions that have specialized in their fields for years have this well under control. That’s why the industry moves to Headless, allowing customers to leverage the knowledge and expertise of the application platform, while still building their own agents and interfaces without worrying about the underlying layer.
Headless is becoming the new industry standard; Salesforce announced this a few weeks ago, and now ServiceNow has as well. The rest will naturally follow. It is no coincidence that both companies are making this choice at virtually the same time. The reasoning is identical: in a world where AI agents perform the work, the interface is no longer the product; that is now the layer where the work is executed, the layer of workflows, data, context, and governance.
## The strategic logic behind Action Fabric and opening up the platform
Opening up the ServiceNow platform to agents, including those from competitors, might seem like a foolish move. If you open everything up, doesn’t your value decrease? Bill McDermott clarified the reasoning behind this during a conversation. He stated that every agent that performs actions via ServiceNow generates operational data that flows back into the CMDB and the Context Engine. All that data, those processes, and that context ultimately give the customer more insights into their own organization. The more intelligent the system, the more effective the agent.
ServiceNow doesn’t have to be the only agent builder; what’s more important is that agents operate on the ServiceNow platform, because that’s how they gain the knowledge, data, and context. That is also the architectural logic behind the AI Gateway that Bhakti Pitre explained to us earlier: when MCP traffic flows through the gateway, ServiceNow has visibility and control, regardless of which agent initiates the action or on which platform the agent runs.
That has major implications. It means that the battle for the enterprise customer is no longer won on UX quality or screen design, but on the quality of the underlying data, workflows, and governance. Whoever has the richest execution layer attracts the most agents. Whoever attracts the most agents generates the richest operational data. And whoever has the richest data builds the most effective agents.
## Availability of Action Fabric
Action Fabric’s MCP Server is now generally available and included in every Now Assist and AI Native SKU. Headless actions consume the same Assist credits as Now Assist and AI Agents. Additional features are expected in the second half of 2026.
**Also read:**[Who will dominate enterprise AI? ServiceNow claims it will, but rivals are closing in](https://www.techzine.eu/blogs/analytics/141094/who-will-dominate-enterprise-ai-servicenow-claims-it-will-but-rivals-are-closing-in/)
#### Tags:
[Action Fabric](https://www.techzine.eu/tag/action-fabric/) / [AI Agents](https://www.techzine.eu/tag/ai-agents/) / [headless](https://www.techzine.eu/tag/headless/) / [industry](https://www.techzine.eu/tag/industry/) / [Now Platform](https://www.techzine.eu/tag/now-platform/) / [SaaSpocalypse](https://www.techzine.eu/tag/saaspocalypse/) / [ServiceNow](https://www.techzine.eu/tag/servicenow/)
"*" indicates required fields
LinkedIn 
This field is for validation purposes and should be left unchanged.
#### Stay tuned, subscribe!
E-mailadres* 
Nieuwsbrieven*
- [x] Morning Bytes 
- [x] Weekly Advisor 
## Related
## [ServiceNow makes its entire portfolio AI-native for every customer](https://www.techzine.eu/news/applications/140342/servicenow-makes-its-entire-portfolio-ai-native-for-every-customer/ "ServiceNow makes its entire portfolio AI-native for every customer")
## [ServiceNow seals Moveworks deal to fuel its agentic ambitions](https://www.techzine.eu/news/applications/137334/servicenow-seals-moveworks-deal-to-fuel-its-agentic-ambitions/ "ServiceNow seals Moveworks deal to fuel its agentic ambitions")
## [ServiceNow makes AI a primary part of its platform with AI Experience](https://www.techzine.eu/blogs/applications/135084/servicenow-makes-ai-a-primary-part-of-its-platform-with-ai-experience/ "ServiceNow makes AI a primary part of its platform with AI Experience")
## [ServiceNow Zurich: Building agents and enhanced security for Enterprise AI](https://www.techzine.eu/blogs/applications/134492/servicenow-zurich-building-agents-and-enhanced-security-for-enterprise-ai/ "ServiceNow Zurich: Building agents and enhanced security for Enterprise AI")
![Image 3](https://www.techzine.eu/pixel.php?u=/blogs/analytics/141272/the-ui-is-dead-long-live-the-agent-servicenow-goes-headless-and-opens-its-platform/)
## Editor picks
## [SAP blocks external AI agents. Salesforce and ServiceNow don’t.](https://www.techzine.eu/blogs/applications/141323/sap-blocks-external-ai-agents-salesforce-and-servicenow-dont/ "SAP blocks external AI agents. Salesforce and ServiceNow don’t.")
### At SAP, everything runs through Joule, whether you like it or not
## [AWS invests massively in AI: can it stay ahead of the pack?](https://www.techzine.eu/blogs/infrastructure/141299/aws-invests-massively-in-ai-can-it-stay-ahead-of-the-pack/ "AWS invests massively in AI: can it stay ahead of the pack?")
AWS is still the biggest hyperscaler, even though the gap with Micros...
## [One year of IFS Nexus Black: major impact on FSM and manufacturing](https://www.techzine.eu/blogs/analytics/141215/one-year-of-ifs-nexus-black-a-major-impact-on-fsm-and-manufacturing/ "One year of IFS Nexus Black: major impact on FSM and manufacturing")
IFS Nexus Black is celebrating its first anniversary around this time...
## [The UI is dead, long live the agent: ServiceNow goes headless and opens its platform](https://www.techzine.eu/blogs/analytics/141272/the-ui-is-dead-long-live-the-agent-servicenow-goes-headless-and-opens-its-platform/ "The UI is dead, long live the agent: ServiceNow goes headless and opens its platform")
### Door is open to third-party agents
## [Techzine.tv](https://www.techzine.tv/)
[![Image 4: Cisco's 102.4 terabit chip supercharges AI data centers](https://www.techzine.tv/wp-content/uploads/2026/03/maxresdefault-3-640x360.jpg)](https://www.techzine.tv/videos/cisco-reveals-102-4-terabit-chip-rivaling-nvidia-and-broadcom/)
## [Cisco's 102.4 terabit chip supercharges AI data centers](https://www.techzine.tv/videos/cisco-reveals-102-4-terabit-chip-rivaling-nvidia-and-broadcom/ "Cisco's 102.4 terabit chip supercharges AI data centers")
[![Image 5: Discover how edge AI transforms manufacturing with private 5G](https://www.techzine.tv/wp-content/uploads/2026/05/maxresdefault-640x360.jpg)](https://www.techzine.tv/videos/discover-how-edge-ai-transforms-manufacturing-with-private-5g/)
## [Discover how edge AI transforms manufacturing with private 5G](https://www.techzine.tv/videos/discover-how-edge-ai-transforms-manufacturing-with-private-5g/ "Discover how edge AI transforms manufacturing with private 5G")
[![Image 6: How to migrate from Redis to Valkey with zero downtime](https://www.techzine.tv/wp-content/uploads/2026/04/maxresdefault-6-640x360.jpg)](https://www.techzine.tv/videos/how-to-migrate-from-redis-to-valkey-with-zero-downtime/)
## [How to migrate from Redis to Valkey with zero downtime](https://www.techzine.tv/videos/how-to-migrate-from-redis-to-valkey-with-zero-downtime/ "How to migrate from Redis to Valkey with zero downtime")
[![Image 7: How Falco catches threats that static analysis misses](https://www.techzine.tv/wp-content/uploads/2026/03/maxresdefault-6-640x360.jpg)](https://www.techzine.tv/videos/how-falco-catches-threats-that-static-analysis-misses/)
## [How Falco catches threats that static analysis misses](https://www.techzine.tv/videos/how-falco-catches-threats-that-static-analysis-misses/ "How Falco catches threats that static analysis misses")
## [Read more on Analytics](https://www.techzine.eu/analytics/)
[![Image 8: One year of IFS Nexus Black: major impact on FSM and manufacturing](https://www.techzine.eu/wp-content/uploads/2026/05/IFS-AI-scaled-1-450x300.jpg)](https://www.techzine.eu/blogs/analytics/141215/one-year-of-ifs-nexus-black-a-major-impact-on-fsm-and-manufacturing/ "One year of IFS Nexus Black: major impact on FSM and manufacturing")
[Top story](https://www.techzine.eu/topstories/)## [One year of IFS Nexus Black: major impact on FSM and manufacturing](https://www.techzine.eu/blogs/analytics/141215/one-year-of-ifs-nexus-black-a-major-impact-on-fsm-and-manufacturing/ "One year of IFS Nexus Black: major impact on FSM and manufacturing")
IFS Nexus Black is celebrating its first anniversary around this time. With this program, IFS aims to give th...
[Sander Almekinders](https://www.techzine.eu/author/sander-almekinders/)2 days ago
[![Image 9: SAS analytics moves closer to Snowflake, Databricks, and Fabric](https://www.techzine.eu/wp-content/uploads/2026/05/PXL_20260428_150715070-scaled-1-398x300.jpg)](https://www.techzine.eu/blogs/analytics/141157/sas-analytics-moves-closer-to-snowflake-databricks-and-fabric/ "SAS analytics moves closer to Snowflake, Databricks, and Fabric")
[Top story](https://www.techzine.eu/topstories/)## [SAS analytics moves closer to Snowflake, Databricks, and Fabric](https://www.techzine.eu/blogs/analytics/141157/sas-analytics-moves-closer-to-snowflake-databricks-and-fabric/ "SAS analytics moves closer to Snowflake, Databricks, and Fabric")
SAS is expanding its analytics integrations to multiple external data platforms, including Snowflake, Databri...
[Berry Zwets](https://www.techzine.eu/author/berry-zwets/)May 8, 2026
[![Image 10: Celonis launches Context Model and acquires Ikigai Labs](https://www.techzine.eu/wp-content/uploads/2026/05/image-4-1-450x253.png)](https://www.techzine.eu/news/analytics/141221/celonis-launches-context-model-and-acquires-ikigai-labs/ "Celonis launches Context Model and acquires Ikigai Labs")
## [Celonis launches Context Model and acquires Ikigai Labs](https://www.techzine.eu/news/analytics/141221/celonis-launches-context-model-and-acquires-ikigai-labs/ "Celonis launches Context Model and acquires Ikigai Labs")
Celonis is launching the Celonis Context Model (CCM). The CCM serves as a dynamic, real-time digital twin of ...
[Berry Zwets](https://www.techzine.eu/author/berry-zwets/)2 days ago
[![Image 11: OpenAI launches Deployment Company to build and deploy AI systems](https://www.techzine.eu/wp-content/uploads/2026/05/Frame__7_-450x253.png)](https://www.techzine.eu/news/analytics/141219/openai-launches-deployment-company-to-build-and-deploy-ai-systems/ "OpenAI launches Deployment Company to build and deploy AI systems")
## [OpenAI launches Deployment Company to build and deploy AI systems](https://www.techzine.eu/news/analytics/141219/openai-launches-deployment-company-to-build-and-deploy-ai-systems/ "OpenAI launches Deployment Company to build and deploy AI systems")
OpenAI is launching the OpenAI Deployment Company, a new entity designed to help organizations systematically...
[Berry Zwets](https://www.techzine.eu/author/berry-zwets/)May 11, 2026
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