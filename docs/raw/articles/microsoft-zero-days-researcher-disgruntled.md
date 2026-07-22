---
title: "Mystery Microsoft bug leaker keeps the zero-days coming"
source_url: "microsoft-zero-days-researcher-disgruntled"
tags: [wechat, article, claude, openai]
ingested: "2026-05-20"
type: raw
sha256: 02cb14da81100e13d9f07e6824da87d1a89aa55135e7ae16bd1bec027b458092
---
---
# Mystery Microsoft bug leaker keeps the zero-days coming
Security
Security pros warn YellowKey claim could make stolen laptops a much bigger problem
        Connor Jones
                [
                Connor
                Jones
                ](https:&#x2F;&#x2F;www.theregister.com&#x2F;author&#x2F;connor-jones)
                Cybersecurity reporter
            Published
            wed 13 May 2026 // 17:16 UTC
            [](https://www.facebook.com/sharer.php?u=https%3A%2F%2Fwww.theregister.com%2Fsecurity%2F2026%2F05%2F13%2Fdisgruntled-researcher-releases-two-more-microsoft-zero-days%2F5239758)
            [](https://twitter.com/intent/tweet?url=https%3A%2F%2Fwww.theregister.com%2Fsecurity%2F2026%2F05%2F13%2Fdisgruntled-researcher-releases-two-more-microsoft-zero-days%2F5239758)
            [](https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fwww.theregister.com%2Fsecurity%2F2026%2F05%2F13%2Fdisgruntled-researcher-releases-two-more-microsoft-zero-days%2F5239758)
            [](https://bsky.app/intent/compose?text=Mystery%20Microsoft%20bug%20leaker%20keeps%20the%20zero-days%20coming%0Ahttps%3A%2F%2Fwww.theregister.com%2Fsecurity%2F2026%2F05%2F13%2Fdisgruntled-researcher-releases-two-more-microsoft-zero-days%2F5239758)
            [](https://www.reddit.com/submit?url=https%3A%2F%2Fwww.theregister.com%2Fsecurity%2F2026%2F05%2F13%2Fdisgruntled-researcher-releases-two-more-microsoft-zero-days%2F5239758&title=Mystery%20Microsoft%20bug%20leaker%20keeps%20the%20zero-days%20coming)
            [](https://api.whatsapp.com/send?text=Mystery%20Microsoft%20bug%20leaker%20keeps%20the%20zero-days%20coming%0Ahttps%3A%2F%2Fwww.theregister.com%2Fsecurity%2F2026%2F05%2F13%2Fdisgruntled-researcher-releases-two-more-microsoft-zero-days%2F5239758)
The anonymous security researcher who has already maliciously exposed three Windows zero-days this year has revealed two more, dropping them just after Microsoft's monthly Patch Tuesday update. 
Nightmare-Eclipse, or Chaotic Eclipse, depending on which of their aliases you prefer, released details about [YellowKey](https://github.com/Nightmare-Eclipse/YellowKey) and [GreenPlasma](https://github.com/Nightmare-Eclipse/GreenPlasma) - respectively a BitLocker bypass and a privilege escalation flaw, handing SYSTEM access to attackers.
Experts speaking to The Register warned that both vulnerabilities present serious security concerns, especially since Nightmare-Eclipse released substantial technical information about exploiting them.
        REG AD
Nightmare-Eclipse described YellowKey as "one of the most insane discoveries I ever found." They provided the files, which have to be loaded onto a USB drive, and if the attacker completes the key sequence correctly, they are granted unrestricted shell access to a BitLocker-protected machine.
        REG AD
When it comes to claims like these, we usually exercise some caution, as this bug requires physical access to a Windows PC. However, seeing that [BitLocker](https://www.theregister.com/security/2026/01/23/surrender-as-a-service-microsoft-unlocks-bitlocker-for-feds/4387769) acts as Windows' last line of defense for stolen devices, bypassing the technology grants thieves the ability to access encrypted files.
Rik Ferguson, VP of security intelligence at Forescout, said: "If [the researcher's claim] holds up, a stolen laptop stops being a hardware problem and becomes a breach notification."
Despite the physical access requirement, Gavin Knapp, cyber threat intelligence principal lead at Bridewell, told The Register that YellowKey remains "a huge security problem for organizations using BitLocker." 
Citing information shared in cyber threat intelligence circles, he added that YellowKey can be mitigated by implementing a BitLocker PIN and a BIOS password lock.
Nightmare-Eclipse hinted at YellowKey also acting as a backdoor, allegedly injected by Microsoft, although the people we spoke to said this was impossible to verify based on the information available.
The researcher also published partial exploit code for GreenPlasma, rather than a fully formed proof of concept exploit (PoC). 
Ferguson noted attackers need to take the code provided by the researcher and figure out how to weaponize it themselves, which is no small task: in its current state it triggers a UAC consent prompt in default Windows configurations, meaning a silent exploit remains a work in progress.
Knapp warned that these kinds of privilege escalation flaws are often used by attackers after they gain an initial foothold in a victim's system.
        REG AD
"These elevation of privilege vulnerabilities are often weaponized during post-exploitation to enable threat actors to discover and harvest credentials and data, before moving laterally to other systems, prior to end goals such as data theft and/or ransomware deployment," he said. 
## MORE CONTEXT
        - 
    [
### Doozy of a Patch Tuesday includes 30 critical Microsoft CVEs
    ](&#x2F;patches&#x2F;2026&#x2F;05&#x2F;13&#x2F;doozy-of-a-patch-tuesday-includes-30-critical-microsoft-cves&#x2F;5239224)
- 
    [
### Microsoft's massive Patch Tuesday: It's raining bugs
    ](&#x2F;security&#x2F;2026&#x2F;04&#x2F;14&#x2F;microsofts-massive-patch-tuesday-its-raining-bugs&#x2F;5219841)
- 
    [
### Researchers claim Windows Defender can be fooled into deleting databases
    ](&#x2F;security&#x2F;2024&#x2F;04&#x2F;22&#x2F;researchers-windows-defender-attack-can-delete-databases&#x2F;319027)
- 
    [
### Surrender as a service: Microsoft unlocks BitLocker for feds
    ](&#x2F;security&#x2F;2026&#x2F;01&#x2F;23&#x2F;surrender-as-a-service-microsoft-unlocks-bitlocker-for-feds&#x2F;4387769)
"Currently, there is no known mitigation for GreenPlasma. It will be important to patch when Microsoft addresses the issue." 
### Four, five… and more?
YellowKey and GreenPlasma are the latest in a series of five Microsoft zero-day bugs the researcher has exposed this year.
When Nightmare-Eclipse [released BlueHammer](https://www.theregister.com/security/2026/04/14/microsofts-massive-patch-tuesday-its-raining-bugs/5219841) (CVE-2026-32201, 6.5) - patched by Microsoft in April - they were described as a disgruntled researcher who has since been rumored to be a former Microsoft employee.
According to their maiden blog post under the Chaotic Eclipse alias, the bug leak began after an alleged violation of trust.
"I never wanted to reopen a blog and a new [GitHub](https://www.theregister.com/software/2026/04/29/mitchell-hashimoto-says-github-no-longer-for-serious-work/5227505) account to drop code," they wrote. "But someone violated our agreement and left me homeless with nothing. They knew this will happen and they still stabbed me in the back anyways, this is their decision not mine."
In early April, the researcher leaked proof-of-concept code for Windows Defender exploits they called RedSun and UnDefend - another admin privilege escalation bug and denial-of-service flaw, respectively - as well as BlueHammer.
        REG AD
Both RedSun and UnDefend remain unfixed, and [according to Huntress](https://www.huntress.com/blog/nightmare-eclipse-intrusion), the proof-of-concept code released was quickly picked up and abused in real-world attacks.
Ferguson described the exposure of YellowKey and GreenPlasma as the latest in an escalating, retaliatory campaign against Microsoft, and warned of more coming.
"Prior releases include BlueHammer and RedSun, both of which attracted serious community attention and real forks," he said. 
"The same post linking yesterday's releases warns of another Patch Tuesday surprise and hints at future RCE disclosures. They claim to have a dead man's switch with more ready to go. This researcher has followed through on every prior threat." ®
            [security](/tag/security)
            [bitlocker](/tag/bitlocker)
            [windows](/tag/windows)
            [zero-day vulnerabilities](/tag/zero-day%20vulnerabilities)
            [microsoft](/tag/microsoft)
                                    [](https://www.facebook.com/sharer.php?u=https%3A%2F%2Fwww.theregister.com%2Fsecurity%2F2026%2F05%2F13%2Fdisgruntled-researcher-releases-two-more-microsoft-zero-days%2F5239758)
                                    [](https://twitter.com/intent/tweet?url=https%3A%2F%2Fwww.theregister.com%2Fsecurity%2F2026%2F05%2F13%2Fdisgruntled-researcher-releases-two-more-microsoft-zero-days%2F5239758)
                                    [](https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fwww.theregister.com%2Fsecurity%2F2026%2F05%2F13%2Fdisgruntled-researcher-releases-two-more-microsoft-zero-days%2F5239758)
                                    [](https://bsky.app/intent/compose?text=Mystery%20Microsoft%20bug%20leaker%20keeps%20the%20zero-days%20coming%0Ahttps%3A%2F%2Fwww.theregister.com%2Fsecurity%2F2026%2F05%2F13%2Fdisgruntled-researcher-releases-two-more-microsoft-zero-days%2F5239758)
                                    [](https://www.reddit.com/submit?url=https%3A%2F%2Fwww.theregister.com%2Fsecurity%2F2026%2F05%2F13%2Fdisgruntled-researcher-releases-two-more-microsoft-zero-days%2F5239758&title=Mystery%20Microsoft%20bug%20leaker%20keeps%20the%20zero-days%20coming)
                                    [](https://api.whatsapp.com/send?text=Mystery%20Microsoft%20bug%20leaker%20keeps%20the%20zero-days%20coming%0Ahttps%3A%2F%2Fwww.theregister.com%2Fsecurity%2F2026%2F05%2F13%2Fdisgruntled-researcher-releases-two-more-microsoft-zero-days%2F5239758)