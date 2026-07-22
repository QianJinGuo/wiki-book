---
title: GitHub Breached — Employee Device Hack Led to Exfiltration of 3,800+ Internal Repos
type: article
tags: [security]
source: newsletter
source_url: https://www.thehackernews.com/2026/05/github-investigating-teampcp-claimed.html
sha256: 870770aadca6
ingested: 2026-05-21
---


Published Time: Thu, 21 May 2026 14:17:09 GMT

Markdown Content:
[![Image 1](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgoDiyeJZY33dxAsa8qElLYXNILLDT4NhloINZiuzcx3La2JvDK_d54kM8qsx_obt8vQ3FpTJr2ZVoMYiEcqHN0sbt-1A_MHlS7mSavlbDiEDg42HN1d4wCffs7ytuZhDvmMjuej5oljVIqIuRezyZCLmafRclN3wNBKcboV-19F0VMMBkVsQZckV5UaiiH/s1700-e365/github.jpg)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgoDiyeJZY33dxAsa8qElLYXNILLDT4NhloINZiuzcx3La2JvDK_d54kM8qsx_obt8vQ3FpTJr2ZVoMYiEcqHN0sbt-1A_MHlS7mSavlbDiEDg42HN1d4wCffs7ytuZhDvmMjuej5oljVIqIuRezyZCLmafRclN3wNBKcboV-19F0VMMBkVsQZckV5UaiiH/s1700-e365/github.jpg)

GitHub on Tuesday said it's investigating unauthorized access to its internal repositories after the notorious threat actor known as TeamPCP listed the platform's source code and internal organizations for sale on a cybercrime forum.

"While we currently have no evidence of impact to customer information stored outside of GitHub's internal repositories (such as our customers' enterprises, organizations, and repositories), we are closely monitoring our infrastructure for follow-on activity," the Microsoft-owned subsidiary [said](https://x.com/github/status/2056884788179726685).

The company also noted that it will notify customers via established incident response and notification channels if any impact is discovered.

The development comes after TeamPCP, a threat actor behind a string of software supply chain attacks targeting open-source packages, listed GitHub's source code for sale for an asking price of no less than $50,000. The alleged data dump is said to include about 4,000 repositories.

"As always, this is not a ransom," the group said in a post, [according to screenshots](https://x.com/DarkWebInformer/status/2056831051742527507) shared by Dark Web Informer. "We do not care about extorting GitHub, 1 buyer and we shred the data on our end, it looks like our retirement is soon so if no buyer is found, we leak it for free."

[![Image 2: Cybersecurity](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhnNON5UeWywT7OcPNw7V4L7QNWnCnm7Xl_99Y9ek8dL-gRwx-bWxQM1TKqt8deqqrdpUyKMuuijAWyyPQVB0s0qf8ntQ6ldFAJLru-QUWhddKTopc7SeNbBBnd-TsfFyRPP-AAyDuclLlL6XHK4_LXqDC_7eyaz9pzToYr7U543MhrJ7qcK-89sVWHTQUZ/s728-e100/zz-2-d.jpg)](https://thehackernews.uk/threatlabz-vpn-risk-2026-d)

In a follow-up update shared on X, GitHub said it detected and contained a compromise of an employee device involving a poisoned Microsoft Visual Studio Code extension. As a risk mitigation measure, the company has rotated critical secrets, while prioritizing highest-impact credentials.

"Our current assessment is that the activity involved exfiltration of GitHub-internal repositories only," GitHub [said](https://x.com/github/status/2056949168208552080). "The attacker's current claims of ~3,800 repositories are directionally consistent with our investigation so far."

GitHub did not disclose the name of the VS code extension, although it's worth noting that [Nx Console](https://thehackernews.com/2026/05/compromised-nx-console-18950-targeted.html) recently suffered a compromise that allowed threat actors to push a multi-stage credential stealer and a supply chain poisoning tool. The Nx team has since [acknowledged](https://github.com/nrwl/nx-console/security/advisories/GHSA-c9j4-9m59-847w) that "very few users were compromised."

Following the incident, an X account linked to TeamPCP, [xploitrsturtle2](https://www.ox.security/blog/teampcps-telnyx-windows-malware-technical-analysis/), [stated](https://x.com/xploitrsturtle2/status/2056927898771067006): "GitHub knew for hours, they delayed telling you and they won't be honest in the future. What an amazing run, it's been an honor to play around with the cats over the past few months."

### TeamPCP Compromises durabletask PyPI Package[](https://www.thehackernews.com/2026/05/github-investigating-teampcp-claimed.html#teampcp-compromises-durabletask-pypi-package)

News of the sale comes as TeamPCP's self-replicating malware campaign, known as [Mini Shai-Hulud](https://thehackernews.com/2026/05/mini-shai-hulud-worm-compromises.html), continues to expand in reach with the compromise of durabletask, an official Microsoft Python client for the Durable Task workflow execution framework. Three malicious package versions have been identified: 1.4.1, 1.4.2, and 1.4.3.

"The attacker compromised a GitHub account via a previous attack, dumped GitHub secrets from a repository to which the user had access, and from there had access to the PyPi token to publish directly," Google-owned Wiz [said](https://www.wiz.io/blog/durabletask-teampcp-supply-chain-attack).

The payload embedded into the package is a dropper, which is configured to fetch and run a second-stage payload ("rope.pyz") from an external server ("check.git-service[.]com"). The malware is assessed to be an evolution of the payload deployed in connection with the compromise of the [guardrails-ai package](https://thehackernews.com/2026/05/mini-shai-hulud-worm-compromises.html) last week.

[![Image 3](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgHBPAvTjqSKkmsWL6htHglfONKxWRlMxkN39FMW8MfDgpUwqCxrp8xTGg_N7xrv212054zvl3OttJwv6xVWcY3intJhnH6VF65yd5qf2od8NCAR97aEoP7M4WAoLflM0JBaucHcMCoHM_5AWG3KNWasGkv85Tp0dAS9gFh2lZtmrTyg7sab6yXcNHKM3uK/s1700-e365/payload.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgHBPAvTjqSKkmsWL6htHglfONKxWRlMxkN39FMW8MfDgpUwqCxrp8xTGg_N7xrv212054zvl3OttJwv6xVWcY3intJhnH6VF65yd5qf2od8NCAR97aEoP7M4WAoLflM0JBaucHcMCoHM_5AWG3KNWasGkv85Tp0dAS9gFh2lZtmrTyg7sab6yXcNHKM3uK/s1700-e365/payload.png)

Specifically, it's designed to activate a full-featured infostealer that's capable of harvesting credentials associated with major cloud providers, password managers, and developer tools, and exfiltrating the data to the attacker-controlled domain. It's worth noting that the stealer is configured to execute only on Linux systems.

According to [SafeDep](https://safedep.io/malicious-durabletask-pypi-supply-chain-attack/), the 28KB Python stealer also attempts to read HashiCorp Vault KV secrets, unlock and dump 1Password and Bitwarden password vaults, and access SSH keys, Docker credentials, VPN configurations, and shell history.

"If the machine is running inside AWS, it propagates itself to other EC2 instances using SSM. If it's inside Kubernetes, it propagates through kubectl exec," Aikido Security [said](https://www.aikido.dev/blog/durabletask-package-compromised-mini-shai-hulud). "And if it detects Israeli or Iranian system settings, there's a 1-in-6 chance it plays audio and then runs rm -rf /*."

"After enumerating SSM-managed instances, it uses SendCommand with the AWS-RunShellScript document to execute the rope.pyz payload on up to 5 other EC2 instances per profile," per [StepSecurity](https://www.stepsecurity.io/blog/microsofts-durabletask-pypi-package-compromised-in-supply-chain-attack#c2-infrastructure). "The propagation script downloads the payload from the primary C2, falling back to the secondary domain t.m-kosche[.]com, and runs it in the background."

[![Image 4: Cybersecurity](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjPEV6-530TOlxG6PjrmdlY623wpBwduZ7t1HV6flcmO5R4q4AmfixDUzW0CrhlvMVNWbhvOIso-UDNTka4W_W9Chrdj_dglwBZwi7DuePM2IMIl-hfUYVIqBXgfpr_2619K8Gptb4LzwJ6gUbi7lWl2M8AFQJsHEaw63Q7tZ6708YGruiHrr0Y2W9YYxLQ/s728-e100/ThreatLocker-d.png)](https://thehackernews.uk/ai-cant-stop-d)

Also notable is the use of the FIRESCALE mechanism to identify a backup command-and-control (C2) address in the event the primary domain is unreachable. It does this by searching GitHub's public commit messages for the pattern "FIRESCALE <base64_url>.<base64_signatue>" and extracting the C2 information from it. Details of this technique were [previously highlighted](https://thehackernews.com/2026/05/tanstack-supply-chain-attack-hits-two.html) by Hunt.io.

Because the worm propagates using tokens stolen from infected environments, the number of affected packages is expected to grow. Any machine or pipeline that installed an affected version of the package should be treated as fully compromised.

"The package is downloaded roughly 417,000 times a month, and the malicious code runs automatically the moment the package is imported, with no error messages and no visible signs of compromise," Endor Labs researcher Peyton Kennedy [said](https://www.endorlabs.com/learn/trojanized-microsoft-sdk-durabletask-1-4-1-through-1-4-3-deliver-credential-stealing-malware).

### Update[](https://www.thehackernews.com/2026/05/github-investigating-teampcp-claimed.html#update)

The LAPSUS$ cybercrime group has teamed up with TeamPCP for a joint sale of GitHub repositories for $95,000. "Everything for the main platform is there," says an accompanying statement, per [screenshots](https://x.com/DarkWebInformer/status/2057109380282110350) from Dark Web Informer. "No ransom, we do not care about extorting GitHub. If no buyer is found, we leak for free."

According to security researcher Rakesh Krishnan, the [leaked repositories](https://theravenfile.com/2026/05/20/github-leak-your-code-risk/) are related to GitHub Actions, agentic workflows, Copilot internal projects, CodeQL tools, internal infrastructure, security tools, marketing, and GitHub-related programs like Codespaces and Dependabot. Also included is a Rails controller and a Pull Requests Controller that are responsible for managing organizations and every pull request.

Found this article interesting? Follow us on [Google News](https://news.google.com/publications/CAAqLQgKIidDQklTRndnTWFoTUtFWFJvWldoaFkydGxjbTVsZDNNdVkyOXRLQUFQAQ), [Twitter](https://twitter.com/thehackersnews) and [LinkedIn](https://www.linkedin.com/company/thehackernews/) to read more exclusive content we post.
