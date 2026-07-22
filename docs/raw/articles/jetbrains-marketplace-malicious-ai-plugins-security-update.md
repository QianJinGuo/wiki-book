---
title: "JetBrains Marketplace Ecosystem Security Update: Malicious AI Plugins"
source_url: "https://blog.jetbrains.com/platform/2026/06/marketplace-ecosystem-security-update-malicious-ai-plugins/"
ingested: 2026-06-19
sha256: b0d99d9f23acf028
type: article
tags: [security, supply-chain, jetbrains, marketplace, ai-plugins, api-key-theft]
created: 2026-06-19
---

# JetBrains Marketplace Ecosystem Security Update: Malicious AI Plugins


Markdown Content:
[IntelliJ Platform](https://blog.jetbrains.com/platform/category/intellij-platform/)[Plugins](https://blog.jetbrains.com/platform/category/plugins/)[Security](https://blog.jetbrains.com/platform/category/security/)

![Image 1: Jakub Chrzanowski](https://blog.jetbrains.com/wp-content/uploads/2025/08/black_profile_1000.png)

June 17, 2026

On June 16, 2026, JetBrains received reports about 15 third-party plugins on JetBrains Marketplace that were built to steal AI provider API keys configured by users. We removed the plugins from Marketplace, blocked the related publisher accounts, and disabled the plugins in installed IDEs through our backend systems. If you were affected, see the [Required actions and step-by-step remediation](http://blog.jetbrains.com/platform/2026/06/marketplace-ecosystem-security-update-malicious-ai-plugins/#required-actions-and-step-by-step-remediation) below.

If you installed or used any of the plugins listed below before June 17, 2026, treat any API keys entered into those plugins as exposed and revoke them immediately. This post explains which plugins were affected, what we have done so far, and the changes we are making to Marketplace checks.

On June 16, 2026, our teams received security reports detailing an AI API keys theft campaign involving 15 third-party plugins hosted on JetBrains Marketplace. These plugins masqueraded as legitimate AI utilities to secretly harvest developer-configured AI provider API keys.

We took immediate action to eliminate the threat, mitigate user risk, and isolate the vectors used by these malicious actors.

*   **Immediate actions taken & current status**
    *   **Total removal:** All 15 flagged plugins have been completely purged from JetBrains Marketplace and are blocked from future downloads.
    *   **Publisher bans:** The 7 underlying publisher accounts associated with this campaign have been permanently terminated.
    *   **Remote kill-switch triggered:** All affected plugins have been explicitly marked as broken within our backend architecture. This native mechanism remotely disables the extensions inside any user’s IDE upon the next relaunch, instantly halting any further malicious executions on local machine environments.
    *   **No core system compromise:** Our security team has verified that no internal JetBrains source code, development environments, or core corporate infrastructure were accessed or exposed during this incident.

## **Technical analysis: How the malicious activity occurred**

The malicious plugins operated exactly as advertised (providing text generation or unit testing utilities) to maintain low visibility. The threat actors relied on a highly specific vector to mask their exfiltration activity:

*   **The trap:** When a developer inputted their personal AI provider key into the plugin configuration settings and clicked “Apply,” the plugin executed an unauthorized backend function.
*   **Evasion:** To prevent local networks and IDE debuggers from flagging anomalous connections, the plugins silently installed a JVM-wide `X509TrustManager`. This step actively disabled standard unsigned and self-signed TLS warnings.
*   **Exfiltration:** The plugin then quietly transferred the validated key string as a plaintext JSON payload via unencrypted HTTP directly to a hardcoded command-and-control (C2) IP address (`39.107.60[.]51`).

Historically, our Plugin Verifier tool was architected as a compatibility and API-usage checker rather than a dedicated data-flow or anti-malware scanner. Because the core APIs used by the plugins appeared normal in isolation, individual hardcoded endpoints and custom TLS configurations were not flagged during initial ingestion.

## **Hardening our vetting pipelines**

Discovering and communicating these security vulnerabilities is a critical step in building a more resilient development environment. We are continuously updating our automation to ensure this specific pattern cannot bypass initial Marketplace screenings.

We are actively deploying new rule layers to our ingestion pipeline designed specifically to flag and block:

*   The inclusion of unencrypted, raw non-HTTPS or raw IP endpoints inside the plugin’s source code.
*   Global, unauthorized TLS weakening behavior (such as custom `X509TrustManager` injections).
*   Automated code-review triggers for plugin handling configuration inputs resembling sensitive cloud API keys.

If you downloaded or interacted with any of the plugins listed below prior to June 17, 2026, please execute the following security protocols immediately:

*   **Verify and clean your workplace:**Navigate to your IDE’s plugin manager (Settings > Plugins > Installed). While JetBrains has already disabled the 15 compromised tools remotely, manually purge any unverified AI assistants, automated code reviewers, or Git add-ons from your system.

**A note on Marketplace trust:** When auditing plugins, please keep in mind that while the [Verified Vendor Badge](https://plugins.jetbrains.com/docs/marketplace/verified-vendor-badge.html) confirms a publisher’s profile is authentic and tied to a real legal entity or individual, it is an organizational verification. It does not serve as a 100% technical guarantee of a plugin’s absolute safety or code quality. Always exercise standard security diligence when granting third-party tools access to your local environments.

*   **Invalidate and reissue API credentials:**Treat any token entered into these plugins as exposed. Access your developer consoles at OpenAI, DeepSeek, SiliconFlow, or other respective providers to permanently revoke those secrets and generate fresh keys.
*   **Inspect account consumption logs:**Review your AI provider dashboards for anomalous activity. Look closely for sudden spikes in API spend, unrecognized queries, or access requests tying back to the malicious actor’s known IP infrastructure (`39.107.60[.]51`).
*   **Establish network-level protections:** Safeguard your network perimeter by restricting all outbound traffic to the malicious command-and-control server. Corporate admins should add `39.107.60[.]51` directly to firewall rulesets or central DNS blocklists.
*   **Apply the principle of least privilege:**When setting up future IDE integrations, utilize tightly scoped tokens rather than root keys. Restrict new API credentials to specific required models and enforce strict spending caps to contain the impact of any potential future leak.
*   **Scan repositories for exposed credentials:**Ensure your credentials have not accidentally spilled into your source code. Run a detection audit across your active codebases to guarantee no active AI provider tokens are stored in version control.

### **Covered Plugins:**

*   _DeepSeek Junit Test_ (`org.sm.yms.toolkit`)
*   _DeepSeek Git Commit_ (`com.json.simple.kit`)
*   _DeepSeek FindBugs_ (`org.bug.find.tools`)
*   _DeepSeek AI Chat_ (`org.translate.ai.simple`)
*   _DeepSeek Dev AI_ (`com.yy.test.ai.simple`)
*   _DeepSeek AI Coding_ (`com.dev.ai.toolkit`)
*   _AI FindBugs_ (`com.json.view.simple`)
*   _AI Git Commitor_ (`com.my.git.ai.kit`)
*   _AI Coder Review_ (`org.check.ai.ds`)
*   _DeepSeek Coder AI_ (`com.review.tool.code`)
*   _AI Coder Assistant_ (`org.code.assist.dev.tool`)
*   _DeepSeek Code Review_ (`com.coder.ai.dpt`)
*   _CodeGPT AI Assistant_ (`com.my.code.tools`)
*   _DeepSeek AI Assist_ (`ord.cp.code.ai.kit`)
*   _Coding Simple Tool_ (`com.dp.git.ai.tool`)

## **Moving Forward Safely: The ACP Protocol**

While no universal, bulletproof solution exists for running external code plugins, we strongly recommend that developers migrating to AI workflows adopt the [Agent Client Protocol (ACP)](https://www.jetbrains.com/acp/) registry where a [list of agents](https://agentclientprotocol.com/get-started/agents) can be found.

Built as an open standard in partnership with Zed, the ACP protocol changes how AI tools interact with your editor. Rather than trusting traditional unsandboxed marketplace plugins with custom execution flows, tools registered via the ACP Registry communicate using structured standard inputs and outputs. The protocol standardizes communication flow between the IDE and agent, drastically reducing potential attack vectors.

We remain fully committed to transparently adapting our systems to protect the global engineering community.

[](http://blog.jetbrains.com/platform/2026/06/marketplace-ecosystem-security-update-malicious-ai-plugins/#)

1.   [The incident and immediate mitigation](http://blog.jetbrains.com/platform/2026/06/marketplace-ecosystem-security-update-malicious-ai-plugins/#the-incident-and-immediate-mitigation)
2.   [Technical analysis: How the malicious activity occurred](http://blog.jetbrains.com/platform/2026/06/marketplace-ecosystem-security-update-malicious-ai-plugins/#technical-analysis-how-the-malicious-activity-occurred)
3.   [Hardening our vetting pipelines](http://blog.jetbrains.com/platform/2026/06/marketplace-ecosystem-security-update-malicious-ai-plugins/#hardening-our-vetting-pipelines)
4.   [Required actions and step-by-step remediation](http://blog.jetbrains.com/platform/2026/06/marketplace-ecosystem-security-update-malicious-ai-plugins/#required-actions-and-step-by-step-remediation)
    1.   [Covered Plugins:](http://blog.jetbrains.com/platform/2026/06/marketplace-ecosystem-security-update-malicious-ai-plugins/#covered-plugins)

5.   [Moving Forward Safely: The ACP Protocol](http://blog.jetbrains.com/platform/2026/06/marketplace-ecosystem-security-update-malicious-ai-plugins/#moving-forward-safely-the-acp-protocol)

## Discover more
