---
source: newsletter
source_url: https://www.helpnetsecurity.com/2026/05/13/fedora-hummingbird-linux/
review_value: 8
review_confidence: 7
review_recommendation: strong
review_stars: 5
ingested: 2026-05-15
sha256: 608f5c17aac71bbdf772a5b9e048fcac9e2f6687f483dbfc6887f6e158d644a4
---
# Fedora Hummingbird brings the container security model to a Linux host OS
Published Time: 2026-05-12T22:30:26+00:00
Markdown Content:
# Fedora Hummingbird brings the container security model to a Linux host OS - Help Net Security
**[Help Net Security newsletters](https://www.helpnetsecurity.com/newsletter/)**: Daily and weekly news, cybersecurity jobs, open source projects, breaking news – **[subscribe here!](https://www.helpnetsecurity.com/newsletter/)**
[](https://www.helpnetsecurity.com/ "Help Net Security - Daily information security news with a focus on enterprise security.")[](https://www.helpnetsecurity.com/gsearch)
*   [News](https://www.helpnetsecurity.com/view/news/)
*   [Features](https://www.helpnetsecurity.com/view/features/)
*   [CISO](https://www.helpnetsecurity.com/tag/ciso/)
*   [AI](https://www.helpnetsecurity.com/tag/artificial-intelligence/)
*   [Videos](https://www.helpnetsecurity.com/view/video/)
*   [Product showcase](https://www.helpnetsecurity.com/tag/product-showcase/)
*   [Industry news](https://www.helpnetsecurity.com/view/industry-news/)
*   [Reviews](https://www.helpnetsecurity.com/view/reviews/)
*   [Whitepapers](https://www.helpnetsecurity.com/tag/w/)
*   [Events](https://www.helpnetsecurity.com/all-events/)
*   [Newsletters](https://www.helpnetsecurity.com/newsletter/)
*   [](https://www.helpnetsecurity.com/gsearch)
*   [](https://twitter.com/helpnetsecurity)
*   [](https://www.linkedin.com/company/helpnetsecurity)
Please turn on your JavaScript for this page to function normally.
![Image 1: Anamarija Pogorelec](https://img.helpnetsecurity.com/wp-content/uploads/2024/04/16092207/anamarija_pogorelec-100x100.jpg)
[Anamarija Pogorelec](https://www.helpnetsecurity.com/author/anamarijapogorelec/ "Author archive: https://www.helpnetsecurity.com/author/anamarijapogorelec/"), Managing Editor, Help Net Security 
May 13, 2026
**Share**[](https://www.facebook.com/sharer/sharer.php?u=https://www.helpnetsecurity.com/2026/05/13/fedora-hummingbird-linux/&title=Fedora%20Hummingbird%20brings%20the%20container%20security%20model%20to%20a%20Linux%20host%20OS "Share Fedora Hummingbird brings the container security model to a Linux host OS on Facebook")[](https://twitter.com/intent/tweet?url=https://www.helpnetsecurity.com/2026/05/13/fedora-hummingbird-linux/&text=Fedora+Hummingbird+brings+the+container+security+model+to+a+Linux+host+OS "Share Fedora Hummingbird brings the container security model to a Linux host OS on Twitter")[](https://www.linkedin.com/shareArticle?mini=true&url=https://www.helpnetsecurity.com/2026/05/13/fedora-hummingbird-linux/&title=Fedora%20Hummingbird%20brings%20the%20container%20security%20model%20to%20a%20Linux%20host%20OS&source=https://www.helpnetsecurity.com/2026/05/13/fedora-hummingbird-linux/ "Share Fedora Hummingbird brings the container security model to a Linux host OS on LinkedIn")[](mailto:?subject=Fedora%20Hummingbird%20brings%20the%20container%20security%20model%20to%20a%20Linux%20host%20OS&body=Check%20out%20this%20site%20I%20came%20across:%20https://www.helpnetsecurity.com/2026/05/13/fedora-hummingbird-linux/ "Share Fedora Hummingbird brings the container security model to a Linux host OS via E-mail")
Container image security pipelines have spent the past several years pushing toward minimal footprints, hermetic builds, and continuous [CVE remediation](https://www.helpnetsecurity.com/2025/09/04/nucleus-insights-vulnerability-management/). The Fedora Project is now applying that same approach to the host operating system. At Red Hat Summit 2026, Fedora announced Fedora Hummingbird, a container-based rolling Linux distribution delivered as an OCI image.
![Image 2: Fedora Hummingbird](https://img2.helpnetsecurity.com/posts2026/Fedora_Hummingbird-650.webp)
“The Linux market has split: IT operations teams need the decades-long stability of Red Hat Enterprise Linux, while builders, both human and agentic, demand upstream velocity and image-based workflows,” said [Gunnar Hellekson](https://www.linkedin.com/in/gunnarhellekson/), VP and GM, Red Hat Enterprise Linux, Red Hat. “Fedora Hummingbird Linux will define the platform for the agents that build the future of enterprise software.”
### A distroless model extended to the host
Project Hummingbird, the effort underlying the new distribution, targets zero CVE reports across every container image it ships. Over the past eight months, the team has assembled a catalog of 49 distroless container images, totaling 157 variants once FIPS and multi-architecture builds are counted. The lineup covers Python, Go, Node.js, Rust, Ruby, OpenJDK, .NET, PostgreSQL, and nginx, among others. Distroless in this context means no package manager and no shell, leaving only the application and its strict runtime dependencies.
Fedora Hummingbird extends the same model down to the operating system. The OS ships as an OCI image, built through the same Konflux-based pipeline used for the rest of the Hummingbird catalog. It supports x86_64 and aarch64 architectures and runs in container, virtual machine, and bare-metal deployments.
### Pipeline and kernel
The build pipeline uses isolated, reproducible builds from pinned package lists. Incremental updates rely on chunkah, a tool developed by the Hummingbird team that limits downloads to changed portions of an image. [Vulnerability scanning](https://www.helpnetsecurity.com/2026/04/27/25-open-source-security-tools/) runs continuously through Syft and Grype. When an upstream fix lands, the pipeline rebuilds, tests, and publishes the patched image.
Most packages in every Hummingbird image come directly from Fedora Rawhide. The remainder are pulled from upstream when Rawhide lacks the needed version, and changes are contributed back to Fedora. Each package carries its own identity, lifecycle, and CVE feed maintained by Red Hat’s Product Security team. Machine-readable vulnerability data ships with every package and indicates which CVEs affect a given workload.
The distribution uses the ARK (Always Ready Kernel) from the CKI project, which tracks the mainline Linux kernel directly and is already in use within Fedora.
### Atomic updates and read-only root
The bootable container approach gives Fedora Hummingbird atomic updates with built-in rollback. The root filesystem is read-only, and writable state is confined to /var and /etc. Configuration drift and partial update states are eliminated by design.
The project is available for free at [GitLab](https://gitlab.com/redhat/hummingbird/containers).
![Image 3](https://img2.helpnetsecurity.com/posts/divider.gif)
**Download: [The IT and security field guide to AI adoption](https://helpnet.short.gy/cjp1xo)**
More about
*   [containers](https://www.helpnetsecurity.com/tag/containers/ "containers")
*   [cybersecurity](https://www.helpnetsecurity.com/tag/cybersecurity/ "cybersecurity")
*   [Fedora](https://www.helpnetsecurity.com/tag/fedora/ "Fedora")
*   [Linux](https://www.helpnetsecurity.com/tag/linux/ "Linux")
*   [open source](https://www.helpnetsecurity.com/tag/open_source/ "open source")
*   [operating system](https://www.helpnetsecurity.com/tag/operating-system/ "operating system")
*   [Red Hat](https://www.helpnetsecurity.com/tag/red-hat/ "Red Hat")
**Share**[](https://www.facebook.com/sharer/sharer.php?u=https://www.helpnetsecurity.com/2026/05/13/fedora-hummingbird-linux/&title=Fedora%20Hummingbird%20brings%20the%20container%20security%20model%20to%20a%20Linux%20host%20OS "Share Fedora Hummingbird brings the container security model to a Linux host OS on Facebook")[](https://twitter.com/intent/tweet?url=https://www.helpnetsecurity.com/2026/05/13/fedora-hummingbird-linux/&text=Fedora+Hummingbird+brings+the+container+security+model+to+a+Linux+host+OS "Share Fedora Hummingbird brings the container security model to a Linux host OS on Twitter")[](https://www.linkedin.com/shareArticle?mini=true&url=https://www.helpnetsecurity.com/2026/05/13/fedora-hummingbird-linux/&title=Fedora%20Hummingbird%20brings%20the%20container%20security%20model%20to%20a%20Linux%20host%20OS&source=https://www.helpnetsecurity.com/2026/05/13/fedora-hummingbird-linux/ "Share Fedora Hummingbird brings the container security model to a Linux host OS on LinkedIn")[](mailto:?subject=Fedora%20Hummingbird%20brings%20the%20container%20security%20model%20to%20a%20Linux%20host%20OS&body=Check%20out%20this%20site%20I%20came%20across:%20https://www.helpnetsecurity.com/2026/05/13/fedora-hummingbird-linux/ "Share Fedora Hummingbird brings the container security model to a Linux host OS via E-mail")
## **Featured** news
*   [Vector embedding security gap exposes enterprise AI pipelines](https://www.helpnetsecurity.com/2026/05/14/vectorsmuggle-vector-embedding-security/ "Vector embedding security gap exposes enterprise AI pipelines")
*   [Researchers open-source a Wi-Fi cyber range for security training](https://www.helpnetsecurity.com/2026/05/13/wi-fi-cyber-range-security/ "Researchers open-source a Wi-Fi cyber range for security training")
*   [Microsoft May 2026 Patch Tuesday: Many fixes, but no zero-days](https://www.helpnetsecurity.com/2026/05/12/microsoft-may-2026-patch-tuesday/ "Microsoft May 2026 Patch Tuesday: Many fixes, but no zero-days")
[Download: The IT and security field guide to AI adoption](https://helpnet.short.gy/cjp1xo)
## ****Resources****
*   [Download: Secure Foundations for AI Workloads on AWS](https://www.helpnetsecurity.com/2026/05/05/cis-download-secure-foundations-for-ai-workloads-on-aws/ "Download: Secure Foundations for AI Workloads on AWS")
*   [Download: Automating Pentest Delivery Guide](https://www.helpnetsecurity.com/2026/05/01/plextrac-download-automating-pentest-delivery-guide/ "Download: Automating Pentest Delivery Guide")
*   [CIS Benchmarks March 2026 Update](https://www.helpnetsecurity.com/2026/04/01/cis-benchmarks-march-2026-update/ "CIS Benchmarks March 2026 Update")
## **Don't** miss
*   [Vector embedding security gap exposes enterprise AI pipelines](https://www.helpnetsecurity.com/2026/05/14/vectorsmuggle-vector-embedding-security/ "Vector embedding security gap exposes enterprise AI pipelines")
*   [Sandyaa: Open-source autonomous security bug hunter](https://www.helpnetsecurity.com/2026/05/13/sandyaa-open-source-autonomous-security-bug-hunter/ "Sandyaa: Open-source autonomous security bug hunter")
*   [The hidden risk of non-human identities in AI adoption](https://www.helpnetsecurity.com/2026/05/13/hidden-risk-non-human-identities-ai-adoption/ "The hidden risk of non-human identities in AI adoption")
*   [Researchers open-source a Wi-Fi cyber range for security training](https://www.helpnetsecurity.com/2026/05/13/wi-fi-cyber-range-security/ "Researchers open-source a Wi-Fi cyber range for security training")
*   [Android pushes new scam, theft, and AI protections in 2026 update wave](https://www.helpnetsecurity.com/2026/05/13/google-android-security-2026/ "Android pushes new scam, theft, and AI protections in 2026 update wave")
Cybersecurity news
- [x] HNS Daily 
 Daily newsletter sent Monday-Friday 
- [x] HNS Newsletter 
 Weekly newsletter sent on Mondays 
- [x] InSecure Newsletter 
 Editor's choice newsletter sent twice a month 
- [x] Breaking news 
 Periodical newsletter released when there is breaking news 
- [x] Cybersecurity jobs 
 Weekly newsletter listing new cybersecurity job positions 
- [x] Open source 
 Monthly newsletter focusing on open source cybersecurity tools 
Subscribe
- [x] I have read and agree to the [terms & conditions](https://www.helpnetsecurity.com/newsletter/) 
[](https://www.helpnetsecurity.com/ "Help Net Security - Daily information security news with a focus on enterprise security.")
 © Copyright 1998-2026 by [Help Net Security](https://www.helpnetsecurity.com/ "Help Net Security - Daily information security news with a focus on enterprise security.")
[Read our privacy policy](https://www.helpnetsecurity.com/privacy-policy/)|[About us](https://www.helpnetsecurity.com/about-us/)|[Advertise](https://www.helpnetsecurity.com/advertise/)
Follow us[](https://twitter.com/helpnetsecurity)[](https://www.linkedin.com/company/helpnetsecurity)
×