---
title: CISA Admin Leaked AWS GovCloud Keys on Github
type: raw
source: newsletter
source_url: https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/
tags: [security]
ingested: 2026-05-20
sha256: eb1e350db3707163
---
Title: CISA Admin Leaked AWS GovCloud Keys on Github
URL Source: https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/
Published Time: Wed, 20 May 2026 10:13:02 GMT
Markdown Content:
# CISA Admin Leaked AWS GovCloud Keys on Github – Krebs on Security
Advertisement
[![Image 3](https://krebsonsecurity.com/b-knowbe4/48.jpg)](https://www.knowbe4.com/training-humans-ai-agents?utm_source=krebs&utm_medium=display&utm_campaign=traininghumansandai&utm_content=bannerai)
Advertisement
[![Image 4](https://krebsonsecurity.com/b-doppel/10.png)](https://www.doppel.com/?utm_source=krebsonsecurity&utm_medium=display&utm_campaign=fy27brandcampaign&utm_content=imitation)
[](http://twitter.com/briankrebs)[](https://krebsonsecurity.com/feed/)[](https://www.linkedin.com/in/bkrebs/)
[![Image 5: Krebs on Security](https://krebsonsecurity.com/wp-content/uploads/2021/03/kos-27-03-2021.jpg)](https://krebsonsecurity.com/ "Krebs on Security")
[](http://twitter.com/briankrebs)[](https://krebsonsecurity.com/feed/)[](https://www.linkedin.com/in/bkrebs/)
[Skip to content](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#content "Skip to content")
*   [Home](https://krebsonsecurity.com/)
*   [About the Author](https://krebsonsecurity.com/about/)
*   [Advertising/Speaking](https://krebsonsecurity.com/cpm/)
# CISA Admin Leaked AWS GovCloud Keys on Github
May 18, 2026
[67 Comments](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comments)
Until this past weekend, a contractor for the **Cybersecurity & Infrastructure Security Agency** (CISA) maintained a public **GitHub** repository that exposed credentials to several highly privileged **AWS GovCloud** accounts and a large number of internal CISA systems. Security experts said the public archive included files detailing how CISA builds, tests and deploys software internally, and that it represents one of the most egregious government data leaks in recent history.
On May 15, KrebsOnSecurity heard from **Guillaume Valadon**, a researcher with the security firm **GitGuardian**. Valadon’s company constantly scans public code repositories at GitHub and elsewhere for exposed secrets, automatically alerting the offending accounts of any apparent sensitive data exposures. Valadon said he reached out because the owner in this case wasn’t responding and the information exposed was highly sensitive.
[![Image 6](https://krebsonsecurity.com/wp-content/uploads/2026/05/privatecisa.png)](https://krebsonsecurity.com/wp-content/uploads/2026/05/privatecisa.png)
A redacted screenshot of the now-defunct “Private CISA” repository maintained by a CISA contractor.
The GitHub repository that Valadon flagged was named “**Private-CISA**,” and it harbored a vast number of internal CISA/DHS credentials and files, including cloud keys, tokens, plaintext passwords, logs and other sensitive CISA assets.
Valadon said the exposed CISA credentials represent a textbook example of poor security hygiene, noting that the commit logs in the offending GitHub account show that the CISA administrator disabled the default setting in GitHub that blocks users from publishing SSH keys or other secrets in public code repositories.
“Passwords stored in plain text in a csv, backups in git, explicit commands to disable GitHub secrets detection feature,” Valadon wrote in an email. “I honestly believed that it was all fake before analyzing the content deeper. This is indeed the worst leak that I’ve witnessed in my career. It is obviously an individual’s mistake, but I believe that it might reveal internal practices.”
One of the exposed files, titled “importantAWStokens,” included the administrative credentials to three Amazon AWS GovCloud servers. Another file exposed in their public GitHub repository — “AWS-Workspace-Firefox-Passwords.csv” — listed plaintext usernames and passwords for dozens of internal CISA systems. According to Caturegli, those systems included one called “LZ-DSO,” which appears short for “Landing Zone DevSecOps,” the agency’s secure code development environment.
**Philippe Caturegli**, founder of the security consultancy **Seralys**, said he tested the AWS keys only to see whether they were still valid and to determine which internal systems the exposed accounts could access. Caturegli said the GitHub account that exposed the CISA secrets exhibits a pattern consistent with an individual operator using the repository as a working scratchpad or synchronization mechanism rather than a curated project repository.
“The use of both a CISA-associated email address and a personal email address suggests the repository may have been used across differently configured environments,” Caturegli observed. “The available Git metadata alone does not prove which endpoint or device was used.”
![Image 7](https://krebsonsecurity.com/wp-content/uploads/2026/05/privatecisa-filelist.png)
The Private CISA GitHub repo exposed dozens of plaintext credentials for important CISA GovCloud resources.
Caturegli said he validated that the exposed credentials could authenticate to three AWS GovCloud accounts at a high privilege level. He said the archive also includes plain text credentials to CISA’s internal “artifactory” — essentially a repository of all the code packages they are using to build software — and that this would represent a juicy target for malicious attackers looking for ways to maintain a persistent foothold in CISA systems.
“That would be a prime place to move laterally,” he said. “Backdoor in some software packages, and every time they build something new they deploy your backdoor left and right.”
In response to questions, a spokesperson for CISA said the agency is aware of the reported exposure and is continuing to investigate the situation.
“Currently, there is no indication that any sensitive data was compromised as a result of this incident,” the CISA spokesperson wrote. “While we hold our team members to the highest standards of integrity and operational awareness, we are working to ensure additional safeguards are implemented to prevent future occurrences.”
A review of the GitHub account and its exposed passwords show the “Private CISA” repository was maintained by an employee of **Nightwing**, a government contractor based in Dulles, Va. Nightwing declined to comment, directing inquiries to CISA.
CISA has not responded to questions about the potential duration of the data exposure, but Caturegli said the Private CISA repository was created on November 13, 2025. The contractor’s GitHub account was created back in September 2018.
The GitHub account that included the Private CISA repo was taken offline shortly after both KrebsOnSecurity and Seralys notified CISA about the exposure. But Caturegli said the exposed AWS keys inexplicably continued to remain valid for another 48 hours.
CISA is currently operating with only a fraction of its normal budget and staffing levels. The agency has [lost nearly a third of its workforce](https://www.cybersecuritydive.com/news/cisa-cybersecurity-division-reorganization/812155/) since the beginning of the second Trump administration, which forced a series of early retirements, buyouts, and resignations across the agency’s various divisions.
The now-defunct Private CISA repo showed the contractor also used easily-guessed passwords for a number of internal resources; for example, many of the credentials used a password consisting of each platform’s name followed by the current year. Caturegli said such practices would constitute a serious security threat for any organization even if those credentials were never exposed externally, noting that threat actors often use key credentials exposed on the internal network to expand their reach after establishing initial access to a targeted system.
“What I suspect happened is [the CISA contractor] was using this GitHub to synchronize files between a work laptop and a home computer, because he has regularly committed to this repo since November 2025,” Caturegli said. “This would be an embarrassing leak for any company, but it’s even more so in this case because it’s CISA.”
_This entry was posted on Monday 18th of May 2026 04:48 PM_
[A Little Sunshine](https://krebsonsecurity.com/category/sunshine/)[Data Breaches](https://krebsonsecurity.com/category/data-breaches/)[Latest Warnings](https://krebsonsecurity.com/category/latest-warnings/)[The Coming Storm](https://krebsonsecurity.com/category/comingstorm/)
[AWS GovCloud](https://krebsonsecurity.com/tag/aws-govcloud/)[Cybersecurity & Infrastructure Security Agency](https://krebsonsecurity.com/tag/cybersecurity-infrastructure-security-agency/)[GitGuardian](https://krebsonsecurity.com/tag/gitguardian/)[GitHub](https://krebsonsecurity.com/tag/github/)[Guillaume Valadon](https://krebsonsecurity.com/tag/guillaume-valadon/)[Nightwing](https://krebsonsecurity.com/tag/nightwing/)[Philippe Caturegli](https://krebsonsecurity.com/tag/philippe-caturegli/)[Seralys](https://krebsonsecurity.com/tag/seralys/)
Post navigation
[← Patch Tuesday, May 2026 Edition](https://krebsonsecurity.com/2026/05/patch-tuesday-may-2026-edition/)
## 67 thoughts on “CISA Admin Leaked AWS GovCloud Keys on Github”
1.   Phil [May 18, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655071)
The incompetence of this government is beyond compare. They are all just so stupid……..
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655071#respond)→ 
    1.   Dean Lo [May 18, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655086)
Easy there sunshine. This is a contractor, not a government employee. What i will say, is that CISA did not have enough controls in place over the years to have been able to snoop this. So they can’t blame Trump Cuts for that incompetence. Also, Nightingale failed in managing their employees. They’re are a LOT of really smart talented people in government, you just won’t hear about them, because they don’t make these kinds of mistakes.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655086#respond)→ 
        1.   Wannabe Techguy [May 18, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655088)
Trump is blamed for everything.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655088#respond)→ 
            1.   Kevin [May 18, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655092)
He’s called head of state for a reason. It’s not just a title.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655092#respond)→ 
            2.   mealy [May 20, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655169)
Mostly just lying all the time. All the time.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655169#respond)→ 
        2.   Teddy McFarcicle [May 18, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655097)
LOL “LOT of really smart talented people…dont make these kinds of mistakes”. May I introduce you to the Iran school strike? WHose boot are you licking?
Also, the mistake isn’t just technical. It’s failure to correctly supervise the contractor – definitely the government’s fault…bad contracting management, project management, process management…should I continue?
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655097#respond)→ 
            1.   Analyst [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655129)
How could the US military striking a school in Iran possibly contradict the claim that there are a lot of really smart and talented people in government? For example, there are a lot of government scientists and engineers in NOAA who have made weather tracking technology that has made weather prediction massively more accurate and precise over my lifetime. How does the strike on that school in Iran contradict the talent and success of those scientists and engineers?
330 million people live in the US, and 2.7 million of them are civilian employees of the US government, doing things like keeping your food and water safe, your air breathable, the infrastructure you take for granted running so smoothly that you are liberated from having to think about it. If your worldview can’t handle the fact that there are many, many incredibly talented, capable, and dedicated people working for the US government, you’re just never going to understand the systemic problems well enough to have anything intelligent to say about government.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655129#respond)→ 
        3.   Taylor Rogers [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655100)
a well done job goes unnoticed(the good workers understand that one).
 And even though this was a contractor who I’m assuming passed a through back ground check(I had to pass one to just lay the carpet at the coast guards on base housing and I didn’t even get a gate code), and probably had at least some top secret clearance access, who was just working for the government in its cyber security division?! (and had this out grievous practice of making all his note transfers public and all organized by contracts) and not just a citizen you would hope a world power government would keep a better eye on it’s employees.
 So I’d be asking the hard to see questions,
 1. So how long has this ip been transferring notes publicly(not just in this cases recovered intel)
 You would assume someone using GitHub as a horrible replacement for something more private like idk something like gnupg and KDE connect (for something of the top of the head that’s free even), would be unstructured and globed together with other subjects initially while they learned the environment.
 2. Time frame those beginning scratch pages started being organizationally structured.
 3. Now how long before the notes got their own respiratory per contract (especially this one) or do they normally go by subject pertained within the notes or do they normally glob notes and go by date(if I was to use a respiratory to transfer my classified notes I would want to just transfer the days notes every night I dealt with that contract right(got to keep receipts for those big paying hours right).
 And like I said I’m looking at the ip uploading and accessing this persons respiratories for all accounts that even connected to look this and may have resent any in whole or parts. Just to remind everyone who we are and that we don’t take kindly to this kind of incident
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655100#respond)→ 
            1.   Mike H. [May 20, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655165)
No one cares who you are any more than the Chinese care about my job in New Jersey in 1997, or the Russians care about a pastrami sandwich.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655165#respond)→ 
        4.   LogicWins [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655114)
Who hired the contractors?
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655114#respond)→ 
            1.   Terrified in MN [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655120)
Kristy Noem
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655120#respond)→ 
        5.   Rocky [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655137)
Speaking as a former fed, there is vanishingly little work in government IT that isn’t done by contractors, including nearly all security oversight. There are feds ‘in charge’, but the churn at CISA has likely only left those people who are incompetent or purely administrative.
At least until recently, the federal government was largely staffed by incredibly dedicated people doing good work under trying conditions. But federal IT departments have never been a good place to find those people, and CISA in particular has always been a bit of an embarassment.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655137#respond)→ 
        6.   Milan [May 20, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655178)
Sorry, but those super talented government employees should have insider risk in place or basically any other 40 security layers that could prevent this.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655178#respond)→ 
    2.   specs [May 18, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655096)
This wasn’t incompetence. This was a deliberate act of sabotage. The contractor will almost certainly face criminal charges.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655096#respond)→ 
        1.   Sam Adams [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655111)
specs,
You have no idea what you are talking about!!!!
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655111#respond)→ 
        2.   Sam Adams [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655112)
specs,
You have no idea what you are talking about! Why do the people with the least knowledge about a subject believe that they are an expert in that subject?
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655112#respond)→ 
        3.   [Sad Sam](http://n/a)[May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655113)
Specs, you have no idea what you are talking about! Why do the people with the least knowledge about a subject believe that they are an expert in that subject?
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655113#respond)→ 
        4.   Pspice [May 20, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655168)
Fifi, catch.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655168#respond)→ 
    3.   C Becker [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655117)
Did you read the article?? It’s not “the government” that sucks , it’s the people that came in to run it and instead of running it, fired and laid off career experts only to hired incompetent temporary contract replacements.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655117#respond)→ 
2.   Pete [May 18, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655072)
The DOGE circus continues. No surprise when you cut essential people in an essential agency.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655072#respond)→ 
3.   Pete [May 18, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655073)
The DOGE circus continues. A predictable outcome when you cut essential, experienced personnel from an essential agency. It can only get worse. This is cybersecurity 101 stuff….
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655073#respond)→ 
4.   [Catwhisperer](https://happycattech.com/)[May 18, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655075)
My money is on infiltration of the contractor by a faux employee candidate. Got that idea from the AWS key staying valid for 48 hours. Some of the mistakes seem those of a fly by Nightwing noob operation, but where better to insert the droud…
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655075#respond)→ 
5.   Frazier [May 18, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655076)
The incompetence is breathtaking. One is left to wonder if the responsible parties (DOGE?) weren’t working for foreign entities. When this administration is finally held accountable I hope that everyone involved is identified and publicly humiliated.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655076#respond)→ 
6.   Dennis [May 18, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655078)
Does it even surprise anyone? At the current level of the incompetency of the U.S. government it’s just something that would preoccupy the news cycle for less than a day. And then there will be another gaff… and another one. I mean is it even that bad when our commander in chief is an open Russian asset?
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655078#respond)→ 
7.   idzero [May 18, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655079)
Hmmmm who would have warned them about this when they first put that stuff in the cloud? If only there was someone who would have told them this was a very bad idea? Oh wait, I remember.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655079#respond)→ 
    1.   idone [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655133)
Hey Jason!
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655133#respond)→ 
        1.   Time for your Zoloft is my Venlafaxime and it's little houses we all need [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655143)
We have finally located the onr and only fictional novel inside the one true closet and near the one true suitcase!
Pargin will soon make a bajillion dollars and we will all teach me also about the REAL GOOD LUNCH I just did not go eat from my groceries in the friend fridge!
But the closet is your mental hospital lantzy not mine
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655143#respond)→ 
8.   Troy Mursch [May 18, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655080)
CISA is a hollow shell of itself since Chris Krebs (no relation) was removed.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655080#respond)→ 
    1.   Manchurian Falcoln [May 18, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655089)
Actually more related than you think the two of them are. Sorta like us.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655089#respond)→ 
9.   Patrick [May 18, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655081)
C’mon, you cannot blame the administration for this. Any employee/contractor and especially one working for CISA should know better than this particularly given the current “climate” where cyber espionage is so prevalent. The employee/contractor should be marched off the premises asap.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655081#respond)→ 
    1.   Wannabe Techguy [May 18, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655090)
Nah it’s just easier to blame Trump. It’s too funny.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655090#respond)→ 
    2.   Claudia [May 18, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655094)
While we’re at it, should discipline so many teams that fell down on the job here detecting this — IAM, AppSec, direction engineering, cloud security, GRC. Oh wait, there’s no budgets, staff, institutional knowledge in these teams anymore? Ok then the problem is more organizational. Where should blame lay then?
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655094#respond)→ 
    3.   Teddy McFarcicle [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655098)
Excellence starts from the top. When something good happens, the administration – ANY administration – takes credit. When something bad happens, it’s always a rogue employee/contractor/intern.
The government cannot escape blame and accountability for this.When agencies are literally run by DEI hires – cronies with no qualifications – who aren’t held to account for literal crimes, it sets the tone.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655098#respond)→ 
        1.   TrumpIsAlmost80 [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655099)
Nice try. All the DEI hires were already removed, remember?
 These problems are caused by what’s left after the department was gutted.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655099#respond)→ 
            1.   R. Cake [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655107)
I believe Teddy was using “DEI” in a parodistic way, effectively as in “the people in charge here were exactly what DEI hires have been accused of being = hired for politically desirable attributes rather than competence”.
 In reality, here the inverse of DEI would be the more fitting abbreviation… so they should be called IED hires?
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655107#respond)→ 
                1.   bruce.desertrat [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655124)
“IED hires” is right on at many levels.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655124#respond)→ 
10.   Chris Adams [May 18, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655082)
Yes, the contractor screwed up epically but that also means there was a catastrophic failure in oversight and monitoring. Just as your bank doesn’t trust each teller to be impeccably honest, there should have been auditing mechanisms on GitHub and on those services preventing long-lived credentials, forcing strong passwords, preventing reuse, etc. .
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655082#respond)→ 
    1.   Craig Hicks [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655102)
Chris
> there should have been auditing mechanisms on GitHub
 The article states there were default-on auditing mechanisms on Github which were explicitly turned off by the offending user.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655102#respond)→ 
        1.   Alan Peery [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655105)
And the offending user should have been blocked from turning those Github *defaults* by an organization policy applied to all their users.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655105#respond)→ 
            1.   Dan [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655121)
This only works if the account was listed under an organization though. I expect that this was a case of the contractor used their private account for it, which wouldn’t be under restriction of the company. I find it super unlikely that the contractor would have been allowed to publish that information publicly in a official organization, it would have been at the very least forced private if it was allowed to be published at all
I’m more concerned at the fact that it didn’t flag anything network logging side though, files such as “passwords”, “tokens” or “config” I would have thought would have been blocked or at the very least logged as a potential malicious actor.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655121#respond)→ 
        2.   Chris Adams [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655109)
Exactly: the fact that someone was allowed to turn them off and nobody asked about it is what elevates it to a senior management issue, especially at a security-centric organization. One person making a bad decision shouldn’t be catastrophic.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655109#respond)→ 
11.   Bob [May 18, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655084)
This seems on par for anyone who has ever had the misfortune of having to work with CISA. There are good folks there, and many are doing their best, but that level of responsibility simply doesn’t come from the prices or bureaucratic structure provided by DHS, even in the best of times.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655084#respond)→ 
12.   [Rhonda Marion](https://krebsonsecurity.com/)[May 18, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655093)
Rhonda,
 This just goes to show how mistakes can happen very easy with lack of carelessness, making personal information very vulnerable to hackers, I think CISA/Nightingale should better screen the contract /worker, there is blame on both sides, It’s so sad that this happened and caused most of the others to lose their jobs.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655093#respond)→ 
13.   James [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655103)
“CISA’s internal “artifactory””
Artifactory (a software repository/caching/proxy solution) doesn’t need to be in quotes, it needs to be capitalized.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655103#respond)→ 
14.   richard chambers [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655104)
Since when is krebsonsecurity comment section filled with lunatics makng political comments? You guys do know this is a cybersecurity blog?
 I guess the TDS is overwhelming and you guys gotta bounce some conspiracies around the echo chamber just to feel good. Must be a depressing way to go through life, constantly angry and constantly the victim
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655104#respond)→ 
    1.   Alan Peery [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655106)
It is not TDS to point out that Trump has favored people who will do exactly what he wants over more qualified candidates. I give you Patel, Hegseth, Bondi, Lindsay Halligan, etc. This is in addition to dismissing competent staff already in place.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655106#respond)→ 
        1.   d [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655131)
Right, because Biden only hired stellar people like Mayorkas or Brinton.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655131#respond)→ 
            1.   the REAL d [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655134)
Who’s talking about Biden? He’s not ever running again and has been out of office for almost 18 months. It’s time to move on.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655134#respond)→ 
                1.   Make milk illegal or the cat might die! [May 20, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655177)
sure man, it ended with the chemo. Just like hunter’s corruption and mamdani’s incredible fake generosity.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655177#respond)→ 
15.   Bimpster T. Finster [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655108)
It’s like trusting your software vendor to do the right thing with an open credit card. Some people just shouldn’t be trusted.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655108#respond)→ 
16.   [Bosco](https://www.netwitness.com/)[May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655110)
was it correctly supervised? weakness in contracting process and management maybe
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655110#respond)→ 
17.   [Debra B](https://trustedciso.com/)[May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655116)
My first thought is it just a mistake or did a Chinese National or other type of anti-gov insider get the contracting job. I have no idea, but was this an accident????
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655116#respond)→ 
    1.   Mike H. [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655123)
Hey man, .va was hard, even in 2009, Polly-0.
Quit trying to be phishers of men.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655123#respond)→ 
18.   Mike [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655118)
This is nothing more than a glaring example of the lack of qualified IT Security Professionals. The contractor hired whoever they could find to fill the spot without qualifying the individual and then granting them too much trust.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655118#respond)→ 
19.   Mike H [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655122)
Man, Brian, look at that rush of comments to avoid comments numbered in the teens, twenties, or thirties.
Reminds me of the GIAC breach.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655122#respond)→ 
20.   Mark [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655125)
I guess one of the DOGE Bros is working for Nightwing now.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655125#respond)→ 
21.   Christopher D [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655126)
I would go straight to this guy’s house. I bet he leaves his keys under the doormat with a label, “Totally Not The Keys To My House”. You do have to wonder about an AWS engineer who isn’t paranoid about any presence of static creds — considering the wide array of alternative solutions these days.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655126#respond)→ 
22.   Bob [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655127)
How much more of this ‘winning’ can we take!
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655127#respond)→ 
    1.   Not Santa or a genie [May 20, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655175)
We have just won again! Finally twitter employees can go hang out with other employees and do their removals without consequence some more!
Hail eris!
Ps of course identity thieving presidents of both ‘parties’ deserve no repercussions, otherwise how can we just keep winning so much.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655175#respond)→ 
23.   BillyBob [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655128)
There is always one @sshat who is smart enough to evade the security rules, but not smart enough understand why the rules should apply to them too.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655128#respond)→ 
24.   [Izzet Genc](http://www.emberwipe.com/)[May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655130)
The “importantAWStokens” filename is almost poetic —
 someone knew these were important, just not important
 enough to keep off GitHub.
The deeper issue here isn’t the individual mistake, it’s
 that there’s no automated last-resort protection.
 GitGuardian caught it externally after the fact.
The pattern is always the same: credentials exist in
 plaintext somewhere “temporary” that becomes permanent.
 The only reliable defense is assuming breach and designing
 for it — encrypt locally before any sync, treat every
 cloud path as compromised by default.
Disabling GitHub’s secret detection feature is the part
 that’s hardest to explain. That’s not an accident, that’s
 a deliberate choice with consequences.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655130#respond)→ 
25.   BigP [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655132)
This seems deliberate to me as well. The company he works for may have things like USB ports locked down to prevent any data from leaving the building. Using Github for “backups” is a way around that kind of restriction because often using Github as a repo is not only allowed but encouraged for version control. Setting the repo to public is also pretty damning.
Still, could be a mistake I suppose…. but you’d have to be a superior moron to use Github as a backup for credentials like this… even if you did make it private.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655132#respond)→ 
    1.   There. We don't need this name either. [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655150)
Apparently the BipIP section of our universal my resume I haven’t been able it to write is hanging out at Denny’s again, making sure the Kubernetes section of the diner in my wallet scorns me for not tipping thousands of miles away again for the imaginary life we insist we returned.
Ps: Matt died. Good luck, licking a pole in a movie we really all enjoyed over and over here with Jimmy You on Christmas 1997, forever.
Now go bring that thirty year old toilet back for Warren Buffett and the retards in King of Prussia. Or maybe the awesome we are sharing too an imaginary love in the country of an olive flag is a bag near us all me
 Time for my docent at the museum of our universal is me
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655150#respond)→ 
26.   ThreatWise [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655135)
This incident underscores the critical importance of robust secrets management and developer security training, especially when dealing with highly sensitive environments like GovCloud. Implementing automated static application security testing (SAST) and dynamic application security testing (DAST) in CI/CD pipelines can help detect such exposures pre-deployment. Furthermore, integrating credential scanning tools into version control systems is essential to prevent accidental commits of sensitive keys. Regular audits of access controls and least privilege principles are also fundamental to mitigating insider threats, whether malicious or accidental. This serves as a stark reminder that even well-resourced organizations face challenges in maintaining perfect operational security.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655135#respond)→ 
27.   Erik [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655152)
Calling this a clown show is a disservice to actual clowns.
Capital T, Trump-level ineptitude here.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655152#respond)→ 
28.   cyber [May 19, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655157)
Anyone who works in cloud security knows that this is not uncommon incident. It is why organizations need to invest in github monitoring tools like GitGuardian.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655157#respond)→ 
    1.   Project Blue [May 20, 2026](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#comment-655167)
As soon as git became attached to a public company that IPOed in the past this became not only about git, same as reddit.
Ask me to explain git in 2010 (roughly August through early Autumn) or reddit, especially since its IPO date (and its soundalikes, also public, if you ever have the balls to discuss the things tech, blockchain, and the stock markets are doing now. Not homophones but similar. You are all soaking in it).
I mean most of us that have been around for a while know it. And it is only part of why so many people are treating their friends like things to hunt down and remove. It is ugly.
I remember clearance work. I do not mean K-Mart.
[Reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/?replytocom=655167#respond)→ 
### Leave a Reply [Cancel reply](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/#respond)
Your email address will not be published.Required fields are marked *
Comment *
Name *
Email *
Website
Δ
Advertisement
[![Image 8](https://krebsonsecurity.com/b-doppel/11.png)](https://www.doppel.com/?utm_source=krebsonsecurity&utm_medium=display&utm_campaign=fy27brandcampaign&utm_content=imitation)
Advertisement
Mailing List
[Subscribe here](https://krebsonsecurity.com/subscribe/)
Search KrebsOnSecurity
Search for: 
Recent Posts
*   [CISA Admin Leaked AWS GovCloud Keys on Github](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/)
*   [Patch Tuesday, May 2026 Edition](https://krebsonsecurity.com/2026/05/patch-tuesday-may-2026-edition/)
*   [Canvas Breach Disrupts Schools & Colleges Nationwide](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/)
*   [Anti-DDoS Firm Heaped Attacks on Brazilian ISPs](https://krebsonsecurity.com/2026/04/anti-ddos-firm-heaped-attacks-on-brazilian-isps/)
*   [‘Scattered Spider’ Member ‘Tylerb’ Pleads Guilty](https://krebsonsecurity.com/2026/04/scattered-spider-member-tylerb-pleads-guilty/)
[](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/)
Story Categories
*   [A Little Sunshine](https://krebsonsecurity.com/category/sunshine/)
*   [All About Skimmers](https://krebsonsecurity.com/category/all-about-skimmers/)
*   [Ashley Madison breach](https://krebsonsecurity.com/category/ashley-madison-breach/)
*   [Breadcrumbs](https://krebsonsecurity.com/category/breadcrumbs/)
*   [Data Breaches](https://krebsonsecurity.com/category/data-breaches/)
*   [DDoS-for-Hire](https://krebsonsecurity.com/category/ddos-for-hire/)
*   [DOGE](https://krebsonsecurity.com/category/doge/)
*   [Employment Fraud](https://krebsonsecurity.com/category/employment-fraud/)
*   [How to Break Into Security](https://krebsonsecurity.com/category/how-to-break-into-security/)
*   [Internet of Things (IoT)](https://krebsonsecurity.com/category/internet-of-things-iot/)
*   [Latest Warnings](https://krebsonsecurity.com/category/latest-warnings/)
*   [Ne'er-Do-Well News](https://krebsonsecurity.com/category/neer-do-well-news/)
*   [Other](https://krebsonsecurity.com/category/other/)
*   [Pharma Wars](https://krebsonsecurity.com/category/pharma-wars/)
*   [Ransomware](https://krebsonsecurity.com/category/ransomware/)
*   [Russia's War on Ukraine](https://krebsonsecurity.com/category/russias-war-on-ukraine/)
*   [Security Tools](https://krebsonsecurity.com/category/security-tools/)
*   [SIM Swapping](https://krebsonsecurity.com/category/sim-swapping/)
*   [Spam Nation](https://krebsonsecurity.com/category/spam-nation/)
*   [Target: Small Businesses](https://krebsonsecurity.com/category/smallbizvictims/)
*   [Tax Refund Fraud](https://krebsonsecurity.com/category/tax-refund-fraud/)
*   [The Coming Storm](https://krebsonsecurity.com/category/comingstorm/)
*   [Time to Patch](https://krebsonsecurity.com/category/patches/)
*   [Web Fraud 2.0](https://krebsonsecurity.com/category/web-fraud-2-0/)
Why So Many Top Hackers Hail from Russia
[![Image 9](https://krebsonsecurity.com/wp-content/uploads/2017/06/computered-580x389.png)](https://krebsonsecurity.com/2017/06/why-so-many-top-hackers-hail-from-russia/)
 © Krebs on Security - [Mastodon](https://infosec.exchange/@briankrebs)