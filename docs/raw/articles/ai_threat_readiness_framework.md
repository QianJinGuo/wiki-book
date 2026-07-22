---
title: A Framework for AI Threat Readiness
type: raw
source: newsletter
source_url: https://www.wiz.io/blog/ai-threat-readiness-framework
tags: [security, wiz]
fetcher: jina
review_value: 8
review_confidence: 9
review_recommendation: worth-reading
ingested: 2026-05-18
sha256: 1801310aac4b648f74265db37b3ab33979dcce347f3813633d0c44ffb26c3143
---
Title: A Framework for AI Threat Readiness
URL Source: https://www.wiz.io/blog/ai-threat-readiness-framework
Published Time: 2026-05-08T14:42:17-04:00
Markdown Content:
Recent and continued advancements in AI models have fundamentally changed how vulnerabilities are found and exploited. Published research, including [our own AI cyber model arena](https://www.wiz.io/cyber-model-arena), has shown that frontier models can now autonomously discover zero-day vulnerabilities, generate working exploits, and chain multiple weaknesses together – changing the scale and speed at which risk emerges.
The pace is still accelerating: more vulnerabilities will be discovered and disclosed, and the time between discovery and exploitation will [continue to shrink](https://zerodayclock.com/). In the short term, exploit development accelerates. In the medium term, the volume of AI-discovered vulnerabilities increases. Over time, security must adapt to continuous, AI-driven discovery and exploitation.
We believe this is ultimately a very positive shift for security, and that it will lead to software becoming more secure than ever. For example, after scanning with Mythos, the Firefox team [fixed more security bugs in April](https://hacks.mozilla.org/2026/05/behind-the-scenes-hardening-firefox/) than they had in the entire previous year.
At the same time, this also creates a new world and a new dynamic of risk that organizations need to prepare for. As vulnerability discovery accelerates, organizations will need to move faster in how they assess exposure, prioritize what matters, and remediate issues before they can be exploited.
## [](https://www.wiz.io/blog/ai-threat-readiness-framework)A Practical Model for AI Threat Readiness
AI readiness is driven by two factors: speed of action and breadth of visibility.
As AI increases the speed of both software development and vulnerability discovery, the gap between exposure and exploitation is shrinking. Security programs need to continuously reduce the time between identification, validation, and remediation across code, infrastructure, and runtime.
Breadth of visibility requires coverage across the full environment, including cloud, code, private infrastructure, SaaS, and the software supply chain. It also requires different levels of analysis, from baseline detection to deeper, AI-driven analysis of complex and exploitable risk. This applies across each layer of the environment.
The following framework is our suggestion for how organizations can think through next steps and evolve their strategy as they navigate a broader shift in the threat landscape. It is built on four key pillars – each of which organizations can start to apply today.
## [](https://www.wiz.io/blog/ai-threat-readiness-framework)1. Eliminate Critical Risk, Reduce Exposure and Scan for Any Exposure with AI
As more vulnerabilities are discovered and exploitation accelerates, the first priority is to reduce unnecessary exposure. Sensitive assets should not be reachable from the internet or exposed to untrusted paths, regardless of patch status. The goal is not only to fix known critical issues, but to reduce what is reachable, validate what can actually be exploited, and make sure new risk does not depend on manual triage.
From there, organizations need to understand how quickly they can patch and respond across exposed technologies. As the number of CVEs increases and exploitation windows shrink, teams need clear ownership, prioritization, and execution paths before the next urgent vulnerability appears on an exposed technology. Any exposed application, service, or technology should be prioritized based on reachability, exploitability, and business impact, with a clear and fast process to route the issue to the right owner and drive remediation.
**Finally, you must scan every exposure with AI.** Attacks are increasingly moving up the stack from exposed infrastructure to applications, APIs, business logic, and identity flows. Traditional ASM helps identify what is exposed, but AI-driven analysis is needed to continuously scan every exposure, determine whether it can be exploited, and understand what it would enable an attacker to do. This makes exposure reduction, fast patching, and continuous AI-driven validation critical parts of the same operating model.
This risk is already measurable. Our data shows that 30% of cloud environments have at least one high-impact machine running software that is exposed externally. Even if that software is not exploitable today, the pace of AI-driven vulnerability discovery means it is likely only a matter of time before it becomes exploitable.
While direct exposure of sensitive data is less common, indirect risk is not. Only 2% of organizations have exposed software running on machines that also host sensitive data. However, 19% of organizations have exposed software on systems with IAM privileges that grant access to sensitive internal assets. In 6% of organizations, exposed software sits on machines with paths to administrative privileges, meaning a single vulnerability could provide attackers with full control of the environment.
“Exposed Versioned Tech” = compute ASM confirmed is exposing versioned software that may contain vulnerabilities.
Crucially, in addition to the above data, the public preview of the [Wiz Red Agent,](https://www.wiz.io/blog/introducing-the-wiz-red-agent) which is an external AI attacker, offers a massive, real-world experiment in large-scale, AI-driven vulnerability exploitation. Since it launched, this AI-powered attacker has been continuously learning and refining its adversarial capabilities across an ever-expanding dataset of over 150,000 production web applications and APIs scanned weekly.
The agent analyzed application logic, processing 100B+ tokens weekly across hundreds of enterprise environments, leading to rapid optimization of its multi-step attack patterns. The improvement is quantified by the results: the agent has matured from identifying basic structural vulnerabilities to consistently uncovering more than 3,000 high and critical exploitable logic flaws _weekly_, the "un-findable" risks that manual and traditional scanning methods routinely miss.
**Key steps**
1.   **Continuous Discovery and Mapping**
    *   Continuously discover and inventory internet-facing assets, APIs, and services
    *   Use AI-powered discovery to identify shadow APIs that may not be documented or visible through traditional scanning
    *   Map legacy applications, dependencies, and ownership gaps across environments
2.   **Exposure Control and Mitigation**
    *   Reduce unnecessary internet exposure and continuously monitor for newly exposed assets as environments change
    *   Segment or isolate unpatchable and high-risk systems
    *   Ensure sensitive assets and privileged access paths are not exposed, regardless of patch status
3.   **AI-driven Risk Analysis and Validation**
    *   Continuously analyze every exposed application, API, service, and identity flow with AI to identify application-layer weaknesses
    *   Validate which exposures are actually exploitable, not just reachable.
    *   Simulate attacker behavior to uncover end-to-end attack paths across application and infrastructure layers
4.   **Establishing Remediation Processes**
    *   Define remediation playbooks so new critical issues are routed and resolved quickly
**Automation playbooks**
*   Continuously scan exposed applications and APIs with AI
*   Continuously remediate AI-validated, high-confidence risks
*   Monitor across exposed services
*   Remove unused or orphaned assets
**Measure**
*   ASM coverage: % of known external assets continuously monitored
*   AI exposure coverage: % of exposed apps/APIs scanned with AI
*   % of known external assets hosting sensitive data or impactful permissions (the goal is to get to 0)
*   % of exposed assets mapped to owner/service/repo/cloud resources
*   % of exposure findings converted into remediation actions
*   Risk MTTR (time from when the exposure is discovered to remediation)
*   Reduction in externally reachable attack surface
*   Reduction in externally exposed critical risks
## [](https://www.wiz.io/blog/ai-threat-readiness-framework)2. Accelerate Patching and Response
As the time between discovery and exploitation shrinks, [response windows are growing smaller](https://www.wiz.io/blog/cloud-threat-retrospective-2026) – patching speed and zero-day response become critical. Advanced models are already capable of rapidly identifying and exploiting vulnerabilities, compressing the window available to respond.
Delays between identification and remediation leave systems exposed, underscoring the need to move from ad hoc fixes to continuous, automated remediation.
This requires distinguishing between a vulnerability in third-party software, such as a CVE, an instance of that vulnerability in your environment, and a vulnerability in first-party code. Each requires a different approach to detection, prioritization, and remediation.
At the same time, organizations should reduce the total volume of vulnerable components in the environment. This includes moving to hardened base images, minimizing unnecessary packages and dependencies, standardizing approved images, and continuously removing outdated or unsupported components. The less vulnerable software teams carry by default, the faster they can respond when a new CVE or zero-day emerges.
**Key steps**
1.   **Define Ownership and Remediation Flows**
    *   Review high-exposure technologies to identify where risk is most likely to concentrate and ensure you have clear patching flow and ownership
    *   Map ownership and trace issues to their source in code or configuration to enable faster remediation and clear accountability
    *   Use AI-driven analysis to identify ownership and impacted systems and auto-remediate back in code when possible
2.   **Proactive Hardening and Prevention**
    *   Standardize on hardened components and base images to reduce constant patching where possible
    *   Enforce guardrails to prevent known risky patterns and vulnerable components from reaching production
3.   **Zero-Day Response**
    *   Establish response workflows for newly disclosed vulnerabilities so zero-day issues can be triaged and addressed quickly
**Automation playbooks**
*   Prioritize vulnerabilities using exploitability, known exploitation, external exposure, runtime usage, asset criticality, identity privileges, and data sensitivity; assign SLAs based on exposure and exploitability
*   Automatically route issues to likely owners using AI-driven context
*   Use AI to decide on the fastest safe action: patch host, upgrade package, rebuild image, update application code, change cloud config, remove exposure, disable feature, or apply compensating control
**Measure**
*   Vulnerability scan coverage across hosts, containers, cloud assets, applications, and packages
*   Time from disclosure to impacted asset inventory
*   Patch MTTR (time from vulnerability being identified to remediated)
*   % of issues remediated at source vs. downstream
*   % of vulnerable assets with owner mapping
*   % of vulnerabilities prioritized with AI-assisted context
*   % of vulnerabilities with AI-recommended remediation path
## [](https://www.wiz.io/blog/ai-threat-readiness-framework)3. Perform Deep AI Code Analysis
Advanced frontier AI models are already being applied to security code analysis, enabling the identification of more complex issues. In the Wiz Cyber Model Arena benchmark, frontier models completed almost half of the challenges. These capabilities reflect a new class of model-driven analysis that goes beyond traditional SAST. Advanced AI code analysis identifies complex logic flaws (like IDOR) and insecure behavior across application flows, dependencies, APIs, and trust boundaries. It also determines how low-to-medium severity vulnerabilities can be chained into exploitable paths. AI's growing capabilities are also reducing the complexity of discovering critical vulnerabilities in binary code, as shown in the recent [GitHub RCE vulnerability (CVE-2026-3854)](https://www.wiz.io/blog/github-rce-vulnerability-cve-2026-3854).
Because this level of analysis requires deeper reasoning across large codebases and produces more complex findings to investigate and validate, organizations need to prioritize which applications and services should be scanned first. The focus should start with the most critical code components: customer-facing applications, internet-exposed services, sensitive data flows, authentication and authorization logic, and other business-critical systems. Broader code coverage should continue through continuous baseline scanning, while the deepest model-driven analysis focuses on where the potential impact is highest.
This also requires building workflows to validate and remediate the findings. Model-driven analysis will surface complex issues that need to be confirmed, prioritized, routed to the right engineering owner, and fixed at the source. The goal is not only to find more issues, but to create a lifecycle where high-impact findings can move quickly from detection to validation to remediation.
As advanced models are applied more broadly, how they are used in practice is still evolving. Teams are starting to explore how to apply the most cost-effective model for each task, which codebases to prioritize, and how to use these approaches alongside existing traditional SCA and SAST scanners.
**Key steps**
*   Prioritize code to be scanned with advanced AI models based on code source, exposure, and business criticality
*   Analyze complex, customer-facing code using advanced models to identify logic flaws, chained vulnerabilities, and insecure application flows
*   Build a continuous AI-driven lifecycle for detection, triage, validation, and remediation
**Automation playbooks**
*   Build mechanism for code bases to be prioritized for advanced model scanning based on runtime and exposure changes
*   Automate validation and prioritization for code findings
*   Automate remediation workflows for eligible code issues through the organization’s AI coding agents
**Measure**
*   AI-powered code scanning coverage
*   Code issue MTTR (time from identification to fix in code)
*   AI finding validation time
*   Number of critical code findings in internet-exposed services
### [](https://www.wiz.io/blog/ai-threat-readiness-framework)4. Detect and Respond to Threats in Real Time
Even with strong prevention, some risk can materialize to an active threat in runtime. In the AI era, the speed of development, deployment, and exploitation means detection and response can no longer depend on manual investigation alone. Security teams need to move from alert review to automated response workflows that can quickly investigate a suspicious identified behavior, understand its context, and take action quickly to limit impact.
This requires full context across code, cloud, runtime, identity, network, workload, and data. Without that context, security operations teams are left with isolated alerts that require manual correlation. With context, detection can become more precise, investigations can be automated, and response can be routed or triggered based on the actual risk and blast radius.
Containment also needs to become faster and more standardized. For high-fidelity runtime threats, organizations should define automated playbooks that can isolate workloads, revoke risky permissions, block suspicious communication, rotate secrets, open incidents, notify owners, and preserve forensic evidence. Human approval can still be required for sensitive actions, but the investigation and recommended response should not start from scratch every time.
Detection and response in the AI era should be measured by whether teams can detect meaningful attacker behavior, investigate with full context, and contain threats quickly enough to reduce business impact.
**Key steps**
*   Achieve comprehensive real-time visibility across all environments by ingesting cloud and workload telemetry, including runtime telemetry for enriched context and runtime detection. This allows teams to understand how applications behave at runtime, how cloud identities are used, what data is being accessed, and how infrastructure is controlled. Guidance on which signals to prioritize should be based on the ability to trace these behaviors across environments.
    *   Baseline visibility should include identity provider logs (such as Entra, Okta, and Google Workspace audit logs)
    *   Ingest cloud audit logs (such as CloudTrail, Azure Activity Logs, and GCP Cloud Audit Logs)
    *   Include version control system audit logs and granular telemetry for data access, secrets usage, and network activity to provide additional context for detection and investigation
*   Use AI to automatically investigate each threat by following multiple investigation steps to finally render a verdict (e.g., malicious, security test, undetermined)
*   Use AI to establish a baseline of regular behaviour and continuously recommend fine-tuning recommendations to reduce noise, and focus on high-fidelity, actionable threats
*   Enhance agent accuracy by adding environment-specific context and memory consisting of previously investigated data sets
**Automation playbooks**
*   Automate response and remediation at the source through automatic assignment of ownership based on code-to-cloud context
*   For high-fidelity malicious threats, automate containment and response workflows where applicable and according to a sensitivity of actions (e.g. isolate workload, revoke data access, revoke identity access, block process)
**Measure**
*   Threat MTTR (time from detection to threat resolution)
*   Agentic threat triage coverage (% of alerts investigated by AI with clear and accurate verdict)
*   Agentic threat containment coverage (% of alerts led to containment by AI)
*   Continuously validate detection efficacy and response speed through attack simulation to stress-test technology, process and people
## [](https://www.wiz.io/blog/ai-threat-readiness-framework)Build and Manage the Readiness Program
As exposure and response cycles accelerate, it helps to establish a consistent way to operate over time. This includes defining ownership, setting expectations, and tracking progress against clear outcomes.
**What to do**
*   Establish governance and clear ownership, including a defined committee, roles, and decision-making processes
*   Define outcomes and key metrics to track progress and report to executive stakeholders
*   Create policies, SLAs, and exception processes to ensure risk is addressed consistently
Helpful metrics include SLA adherence, exception volume, coverage across assets and environments, and progress against defined security outcomes.
## [](https://www.wiz.io/blog/ai-threat-readiness-framework)How Wiz Helps
As AI accelerates how vulnerabilities are discovered and exploited, organizations need a security operating model that can continuously reduce exposure, validate real risk, and respond faster than attackers can adapt. At its core, this becomes a continuous operational flywheel: continuously discover exposure, validate exploitability, prioritize real operational risk, and remediate at machine speed as environments and exploitability evolve over time.
Wiz combines the contextual understanding of the Wiz Security Graph with purpose-built AI agents to help organizations reduce risk across modern cloud and AI-native environments. With context across code, cloud, and runtime, Wiz helps teams continuously validate exposure, prioritize real operational risk, and accelerate remediation.
Horizontal agentic security built for the AI era
### [](https://www.wiz.io/blog/ai-threat-readiness-framework)**1. Eliminate critical risk and scan any exposure with AI**
*   [AI Application Protection Platform (AI APP)](https://www.wiz.io/blog/introducing-wiz-ai-app) helps secure AI applications across modern cloud and AI-native environments by connecting risk context across code, cloud, and runtime
*   [Wiz Attack Surface Management (ASM)](https://www.wiz.io/blog/introducing-wiz-asm) continuously discovers exposed applications, infrastructure, APIs, identities, and runtime environments so teams can reduce unnecessary exposure
*   [Red Agent](https://www.wiz.io/blog/introducing-the-wiz-red-agent) uses AI-powered, context-aware attack simulation to identify and validate complex exploitable attack paths, including application-layer and identity-driven risk traditional testing often misses
### [](https://www.wiz.io/blog/ai-threat-readiness-framework)**2. Accelerate patching and zero-day response**
*   [Green Agent](https://www.wiz.io/blog/introducing-wiz-green-agent) helps identify the fastest and safest remediation path across code, infrastructure, runtime, and AI application context
*   [Workflows](https://www.wiz.io/blog/introducing-wiz-workflows) and [integrations](https://www.wiz.io/integrations)help operationalize remediation and zero-day response across development and security teams
*   Preventative controls and hardened baselines such as [Wiz OS](https://www.wiz.io/solutions/wizos)help reduce vulnerable components and start secure by default
### [](https://www.wiz.io/blog/ai-threat-readiness-framework)**3. Perform deep AI code analysis**
*   Findings from advanced AI model scans can be brought into the Wiz Security Graph to correlate cloud and application context for prioritization and remediation (Preview)
*   Advanced AI-driven code and application analysis scans applications, APIs, dependencies, and runtime environments to identify complex vulnerabilities, insecure application flows, and high-risk attack paths (Preview)
### [](https://www.wiz.io/blog/ai-threat-readiness-framework)**4. Detect and contain threats in real time**
*   [Wiz Defend](https://www.wiz.io/platform/wiz-defend)provides runtime visibility and threat detection across workloads, cloud environments, Kubernetes, identities, and AI runtime activity
*   [Blue Agent](https://www.wiz.io/blog/wiz-blue-agent-generally-available)investigates threats and suspicious behavior using the broader context of the Wiz Security Graph to determine which risks are actively being exercised
*   Automated response workflows help contain threats and operationalize response at machine speed
### [](https://www.wiz.io/blog/ai-threat-readiness-framework)**Build and operationalize the readiness program**
Organizations can operationalize this framework with clear ownership, governance, SLAs, and measurable outcomes. As exploitability changes and new risk is introduced, teams need visibility into exposure, validation, remediation speed, runtime coverage, and operational readiness across the environment.
We are continuing to learn and work with customers on this journey - expanding and building on this framework as we go.