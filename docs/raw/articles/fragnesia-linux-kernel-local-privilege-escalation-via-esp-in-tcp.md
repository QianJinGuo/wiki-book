---
title: "Fragnesia: Linux Kernel Local Privilege Escalation via ESP-in-TCP"
source_url: https://www.wiz.io/blog/fragnesia-linux-kernel-local-privilege-escalation-via-esp-in-tcp
source: web
tags: [security, wiz]
ingested: 2026-05-21
sha256: 2a0e89c81e606db41e0efd6e163f7352d23f77de4c4c1b0f75ad737571e69eb9
---
Sign in
Experiencing an incident?
Wiz
Platform
Solutions
Pricing
Resources
Customers
Company
Get a demo
Blog
Fragnesia: Linux Kernel Local Privilege Escalation via ESP-in-TCP
A new page-cache corruption vulnerability in the Dirty Frag family enables unprivileged local attackers to achieve root
Merav Bar, Rami McCarthy
May 13, 2026
|
2 minute read
Researchers have disclosed a new variant in the DirtyFrag family of Linux local privilege escalation (LPE) vulnerabilities, named “Fragnesia.” The vulnerability impacts the Linux kernel’s XFRM ESP-in-TCP subsystem. The vulnerability allows unprivileged local attackers to modify read-only file contents in the kernel page cache and achieve root privileges through a deterministic page-cache corruption primitive.  
Per the researcher who discovered Dirty Frag,  Hyunwoo Kim, Fragnesia emerged as an unintended side effect of one of the patches addressing the original Dirty Frag vulnerabilities.
Technical Details
Fragnesia exploits a logic flaw in the Linux XFRM ESP-in-TCP implementation, specifically involving improper handling of shared page fragments during skb coalescing. The exploit abuses a scenario where file-backed pages are spliced into a TCP receive queue before the socket transitions into espintcp ULP mode. Once ESP processing is enabled, the kernel decrypts the queued data in-place, causing controlled corruption of the underlying page cache through AES-GCM keystream manipulation.
The exploit uses user and network namespaces to obtain CAP_NET_ADMIN privileges within an isolated namespace, installs a crafted ESP security association through NETLINK_XFRM, and repeatedly triggers controlled single-byte writes into cached file pages. Researchers demonstrated overwriting the first bytes of /usr/bin/su with a small ELF payload that invokes setresuid(0,0,0) and executes /bin/sh, resulting in a root shell. The modification exists only in page cache memory and does not alter the on-disk binary. Usage of AppArmor restrictions on unprivileged user namespaces, such as those default in Ubuntu, may serve as a partial mitigation, requiring additional bypasses for successful exploitation. However, unlike DirtyFrag, no host-level privileges are required. 
Recommendations
Apply vendor kernel patches that address the underlying XFRM ESP-in-TCP vulnerability as they become available.
Until patches are deployed, disable the vulnerable modules for both Fragnesia and DirtyFrag, if not required:
rmmod esp4 esp6 rxrpc
printf 'install esp4 /bin/false\ninstall esp6 /bin/false\ninstall rxrpc /bin/false\n' > /etc/modprobe.d/fragnesia.conf
Restrict or disable unprivileged user namespaces where operationally feasible.
Monitor systems for suspicious namespace creation, XFRM manipulation, or abnormal use of AF_ALG.
If exploitation is suspected, reboot affected systems or clear page cache contents to remove modified in-memory binaries:
echo 1 | tee /proc/sys/vm/drop_caches
How Can Wiz Help?
Wiz customers can use the pre-built queries and advisory in the Wiz Threat Intel Center to search for relevant instances in their environment. Wiz Research will continue to update that advisory as the situation develops.
References
Fragnesia disclosure
Tags
#Research
#Threat Intel
Table of contents
Technical Details
Recommendations
How Can Wiz Help?
References
Continue reading
Introducing Wiz Audit History: Track Every Change Across your Environment
Guy Silberman, Alon Weiss, Shaked Rotlevi
May 12, 2026
Wiz Audit History is now GA, providing a continuous, cross-cloud timeline of changes to resource configurations and findings to accelerate incident response and simplify compliance.
Mini Shai-Hulud Strikes Again: TanStack + more npm Packages Compromised
Rami McCarthy, Amitai Cohen, Benjamin Read
May 12, 2026
Detect and mitigate malicious npm packages linked to the latest Mini Shai-Hulud supply chain campaign targeting high-value developer tooling.
Wiz at Wiz: Reducing Risk through Service Ownership
Kelsey Nelson, Omer Mesika
May 11, 2026
How Wiz security uses Service Catalog to turn cloud risk into service ownership
GET A PERSONALIZED DEMO
Ready to see Wiz in action?
"Best User Experience I have ever seen, provides full visibility to cloud workloads."
David Estlick
CISO
"Wiz provides a single pane of glass to see what is going on in our cloud environments."
Adam Fletcher
Chief Security Officer
"We know that if Wiz identifies something as critical, it actually is."
Greg Poniatowski
Head of Threat and Vulnerability Management
Get a demo
Footer
PLATFORM
Cloud & AI Security
Wiz Code
Wiz Cloud
Wiz Defend
Integrations
Environments
Documentation
LEARN
Customer Stories
Cloud Security Courses
Blog
CloudSec Academy
Resources Center
Cloud Threat Landscape
Cloud Security Assessment
Vulnerability Database
COMPANY
About Wiz
Join the Team
Newsroom
Events
Contact Us
Trust Center
Wiz Partner Alliance
English (US)
X
LinkedIn
RSS
© 2026 Wiz, Inc.
Status
Privacy Policy
Terms of Use
Modern Slavery Statement
This website uses cookies for various business purposes, including to enhance site navigation, analyze site usage, and assist in our marketing efforts. By clicking “Agree” or by continuing to navigate on this website after viewing this banner, you agree to our use of cookies. Wiz honors legally-required opt out preference signals. Cookie Policy
Cookie settings
Reject non-essential
Agree