# Linux Foundation and Industry Leaders Launch Akrites to Defend Critical Open Source Software Against AI-Enabled Cyber Threats

> 📊 Level ⭐⭐⭐ | 14.0KB

> **来源**: [Linux Foundation and Industry Leaders Launch Akrites to Defend Critical Open Source Software Against AI-Enabled Cyber Threats](https://linuxfoundation.org/press/linux-foundation-and-industry-leaders-launch-akrites-to-defend-critical-open-source-software-against-ai-enabled-cyber-threats)

_![Image 1: 1200x628-Jun-24-2026-09-38-16-2854-PM](https://www.linuxfoundation.org/hs-fs/hubfs/1200x628-Jun-24-2026-09-38-16-2854-PM.png?width=911&height=477&name=1200x628-Jun-24-2026-09-38-16-2854-PM.png)_

_Amazon Web Services, Anthropic, Chainguard, Cisco, Citi, Endor Labs, Ericsson, Google, IBM, JPMorganChase, Microsoft and GitHub, NVIDIA, OpenAI, RapidFort, Red Hat, Rust Foundation, Sonatype, Vodafone and Zscaler join coordinated effort to find, fix and responsibly disclose vulnerabilities in open source software the world runs on_

**Summary**

*   The Linux Foundation, joined by leading organizations, today announced Akrites, a coordinated effort to remediate and disclose vulnerabilities in critical open source software.
*   Akrites establishes a shared Security Incident Response Team (SIRT) and a single, standardized Coordinated Vulnerability Disclosure (CVD) process, built on confidentiality-first principles and industry-standard tooling.
*   Founding members commit engineering talent, security expertise and funding to harden the shared open source software that banks, hospitals, power grids, telecoms, governments, and AI labs depend on. 
*   Organizations that contribute engineering resources or funding to the security of critical open source are invited to participate and can learn more at [https://akrites.org](https://akrites.org/).

**SAN FRANCISCO, June 25, 2026**– [The Linux Foundation](https://www.linuxfoundation.org/?hsLang=en), the nonprofit organization enabling mass innovation through open source, today announced [Akrites](https://akrites.org/), a coordinated industry effort to harden the world’s most critical open source software in the era of AI-assisted vulnerability discovery. Backed by founding commitments from Amazon Web Services, Anthropic, Chainguard, Cisco, Citi, Endor Labs, Ericsson, Google, IBM, JPMorganChase, Microsoft and GitHub, NVIDIA _,_ OpenAI, RapidFort, Red Hat, Rust Foundation, Sonatype, Vodafone and Zscaler, the initiative unites major technology companies, AI labs, financial institutions, and security vendors around a shared mission: to coordinate the remediation of vulnerabilities in widely used open source projects with upstream maintainers before those vulnerabilities can be exploited.

Open source software underpins virtually every layer of the modern digital economy, from banking and healthcare to energy, transportation, telecommunication, and government. Akrites enables industry coordination to support and defend critical infrastructure users and consumers of open source. Previously, finding and fixing serious flaws in open source software demanded comparable expertise from attackers and defenders alike. Today, frontier AI models can scan a major open source project and surface vulnerabilities in minutes. Once access to these capabilities is broadly available, bad actors who previously lacked the technical expertise to mount sophisticated attacks will have the tools they need to do so quickly.

To mark the launch, the founding signatories published a joint open letter to the technology industry, _“We All Depend on Open Source. We Will Defend It Together.”_ The full letter is available at [https://akrites.org/letter/](https://akrites.org/letter/).

In the past, security response involved a patchwork of organizations often working on the same problems independently, sometimes shipping conflicting patches or burying maintainers under duplicate reports. Akrites changes that model. The initiative provides a single, trusted place to coordinate, remediate and disclose, with a shared SIRT serving as a predictable partner for maintainers rather than a flood of uncoordinated reports. Akrites commits to working with critical infrastructure to support patch deployment before vulnerable systems can be targeted.

Confidentiality is central to the effort. Bug fixes flow back into each project’s original home, on maintainers’ terms. Where a critical package has no active maintainer, Akrites will serve as maintainer of last resort so fixes to the latest version reach everyone in a timely fashion. The initiative will also coordinate with government efforts so public and private defenders move together.

[Alpha-Omega](https://alpha-omega.dev/), a directed fund of the Linux Foundation, will provide seed funding to support Akrites. Other organizations that contribute engineering resources or funding to the security of critical open source are invited to participate. To learn more or to join, visit [https://akrites.org](https://akrites.org/).

#### **Supporting Quotes**

“Frontier AI models have given defenders the ability to find and fix vulnerabilities in open source software at a speed and scale that were never possible before. That's an enormous opportunity for defenders, and Akrites ensures we seize it together. Maintainers deserve a coordinated partnership, not a flood of reports. AWS is committed to securing the projects our customers depend on and building this shared infrastructure alongside the community.”

**– Matt Wilson, Vice President and Distinguished Engineer, Amazon Web Services**

"Open source projects collectively underpin much of the internet, and the existing model for coordinated disclosure has been outpaced by how quickly AI can now find vulnerabilities. Getting ahead of that requires the industry to coordinate on findings and get fixes upstream before they're disclosed and exploited. Efforts like Akrites drive this level of coordination at the scale and speed this moment requires."

**– Jason Clinton, Deputy Chief Information Security Officer, Anthropic**

"The software supply chain is only as strong as the upstream it draws from, and we see how thin that layer really is. As AI finds more vulnerabilities, the industry will rush to patch them. Without coordination, those fixes will fragment across different patches and forks, and maintainers who are already overwhelmed, unreachab

→ [原文存档](https://linuxfoundation.org/press/linux-foundation-and-industry-leaders-launch-akrites-to-defend-critical-open-source-software-against-ai-enabled-cyber-threats)

---

## 深度分析

### 1. The expertise asymmetry that structured OSS security just collapsed

For most of open source history, finding a serious vulnerability required expertise roughly symmetric between attackers and defenders, so discovery rate stayed bounded by rare human skill on both sides. The press release's core premise breaks that symmetry: frontier AI models can now scan a major open source project and surface vulnerabilities in minutes. Once that capability is broadly available, the defender lead evaporates — the deciding variable shifts from *who can find bugs* to *who can fix, coordinate, and deploy patches faster*. That is an operations-and-coordination problem, which is precisely the layer Akrites is built for.

### 2. Disclosure throughput, not discovery, is the new bottleneck

The pre-Akrites process is described as a patchwork of organizations working on the same problems independently — sometimes shipping conflicting patches, sometimes burying maintainers under duplicate reports. When AI multiplies the discovery rate by orders of magnitude, uncoordinated disclosure floods the system's weakest link: the under-resourced volunteer maintainer. Akrites' shared SIRT plus a single standardized CVD process is essentially a serialization primitive — findings queue through one trusted channel so remediation can be deduplicated, ordered by criticality, and kept confidential until deployment. The innovation is process, not detection.

### 3. Confidentiality-first is a maintainers'-rights design, not a secrecy fetish

Three design commitments stand out: fixes flow back into each project's original home *on maintainers' terms*; where a critical package has no active maintainer, Akrites serves as maintainer of last resort; and the initiative coordinates with government efforts so public and private defenders move together. The model treats maintainer agency and coordinated deployment as the scarce resources worth protecting — a deliberate third way between full-disclosure adversarialism and corporate security-by-hoarding. It answers "who defends the defender?" for the specific person holding the highest-leverage, lowest-resource position in the ecosystem.

### 4. The coalition composition is itself the signal

The founding roster spans direct cloud competitors (AWS, Google, Microsoft), rival AI labs (Anthropic, OpenAI), financial institutions (JPMorganChase, Citi), security vendors (Chainguard, Endor Labs, Sonatype, RapidFort, Zscaler), enterprise incumbents (Cisco, IBM, Ericsson, Vodafone, Red Hat, NVIDIA), and the Rust Foundation. Competitors do not co-fund shared defense infrastructure unless they have independently priced the risk as systemic — an AI-enabled free-for-all against shared OSS damages every member's customer base simultaneously. Alpha-Omega's seed funding continues that fund's standing agenda of hardening critical open source.

### 5. The stated goal inverts the traditional disclosure race

Anthropic's framing is the sharpest formulation: get fixes upstream *before* they are disclosed and exploited. Classic CVD already starts a race at public disclosure; Akrites' target state moves the finish line — patch the critical-infrastructure deploy base first, then disclose. Disclosure becomes the final, scheduled step of a completed defense rather than the starting gun, which is only achievable when discovery, triage, and vendor coordination are pooled in one channel.

## 实践启示

1. **Map your OSS dependency surface now (SBOM).** Coordinated disclosure only protects teams that can locate every affected dependency across their estate within hours of a private advisory. Estate-level dependency inventory is the prerequisite for everything Akrites promises.
2. **Budget your own AI-assisted vulnerability scanning.** The defender lead is eroding on a published timetable; scan your dependency tree before adversaries do. For a structured defense baseline, see [AWS software supply chain security practices](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-software-supply-chain-security-well-architected-best-practices.md).
3. **Consume fixes via upstream only.** The fragmentation risk the press release names — conflicting patches and forks — makes long-term pinning of critical dependencies the riskier posture. Stay near upstream HEAD for anything critical-infrastructure-adjacent.
4. **Maintainers: publish one coordinated channel and a triage SLA.** Akrites' SIRT can only act as a "predictable partner" for projects that are reachable; an unpublished contact channel defaults you back into the duplicate-report flood.
5. **Adopted-but-unmaintained dependencies are the acute exposure.** Do not wait for the maintainer-of-last-resort mechanism to reach your package — budget adoption or funding now. Recent failure modes of the same class: [npm supply chain compromise postmortem](https://github.com/QianJinGuo/wiki-public/blob/main/entities/npm-supply-chain-compromise-postmortem.md), [Checkmarx Jenkins plugin compromise](https://github.com/QianJinGuo/wiki-public/blob/main/entities/checkmarx-jenkins-plugin-compromised-in-new-supply-chain-attack.md). The broader AI-threat landscape context: [AI security landscape](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/ai-security-landscape.md).

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

