---
sha256: b5e0dec2eddb941cbbb8e3eebd48fec3e0bce46a64b5149c82898a2a05005966
source: newsletter
source_url: https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/
tags: [security]
title: "Canvas Breach Disrupts Schools & Colleges Nationwide"
published: 2026-05-12
ingested: 2026-05-12
---
# Canvas Breach Disrupts Schools & Colleges Nationwide – Krebs on Security
Advertisement
[![Image 1](http://krebsonsecurity.com/b-doppel/9.png)](https://www.doppel.com/?utm_source=krebsonsecurity&utm_medium=display&utm_campaign=fy27brandcampaign&utm_content=imitation)
Advertisement
[![Image 2](http://krebsonsecurity.com/b-knowbe4/49.jpg)](https://www.knowbe4.com/training-humans-ai-agents?utm_source=krebs&utm_medium=display&utm_campaign=traininghumansandai&utm_content=bannerai)
[](http://twitter.com/briankrebs)[](https://krebsonsecurity.com/feed/)[](https://www.linkedin.com/in/bkrebs/)
[![Image 3: Krebs on Security](https://krebsonsecurity.com/wp-content/uploads/2021/03/kos-27-03-2021.jpg)](https://krebsonsecurity.com/ "Krebs on Security")
[](http://twitter.com/briankrebs)[](https://krebsonsecurity.com/feed/)[](https://www.linkedin.com/in/bkrebs/)
[Skip to content](http://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#content "Skip to content")
*   [Home](https://krebsonsecurity.com/)
*   [About the Author](https://krebsonsecurity.com/about/)
*   [Advertising/Speaking](https://krebsonsecurity.com/cpm/)
# Canvas Breach Disrupts Schools & Colleges Nationwide
May 7, 2026
[49 Comments](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comments)
An ongoing data extortion attack targeting the widely-used education technology platform **Canvas** disrupted classes and coursework at school districts and universities across the United States today, after a cybercrime group defaced the service’s login page with a ransom demand that threatened to leak data from 275 million students and faculty across nearly 9,000 educational institutions.
![Image 4](https://krebsonsecurity.com/wp-content/uploads/2026/05/shinyhunters-instructure-canvas.png)
A screenshot shared by a reader showing the extortion message that was shown on the Canvas login page today.
Canvas parent firm **Instructure** responded to today’s defacement attacks by disabling the platform, which is used by thousands of schools, universities and businesses to manage coursework and assignments, and to communicate with students.
Instructure acknowledged a data breach earlier this week, after the cybercrime group **ShinyHunters** claimed responsibility and said they would leak data on tens of millions of students and faculty unless paid a ransom. The stated deadline for payment was initially set at May 6, but it was later pushed back to May 12.
In [a statement](https://status.instructure.com/incidents/9wm4knj2r64z) on May 6, Instructure said the investigation so far shows the stolen information includes “certain identifying information of users at affected institutions, such as names, email addresses, and student ID numbers, as well as as messages among users.” The company said it found no evidence the breached data included more sensitive information, such as passwords, dates of birth, government identifiers or financial information.
The May 6 update stated that Canvas was fully operational, and that Instructure was not seeing any ongoing unauthorized activity on their platform. “At this stage, we believe the incident has been contained,” Instructure wrote.
However, by mid-day on Thursday, May 7, students and faculty at dozens of schools and universities were flooding social media sites with comments saying that a ransom demand from ShinyHunters had replaced the usual Canvas login page. Instructure responded by pulling Canvas offline and replacing the portal with the message, “Canvas is currently undergoing scheduled maintenance. Check back soon.”
“We anticipate being up soon, and will provide updates as soon as possible,” reads the current message on Instructure’s [status page](https://status.instructure.com/incidents/m88d7ymwpzpy).
While the data stolen by ShinyHunters may or may not contain particularly sensitive information (ShinyHunters claims it includes several billion private messages among students and teachers, as well as names, phone numbers and email addresses), this attack could hardly have come at a worse time for Instructure: Many of the affected schools and universities are in the middle of final exams, and a prolonged outage could be highly damaging for the company.
The extortion message that greeted countless Canvas users today advised the affected schools to negotiate their own ransom payments to prevent the publication of their data — regardless of whether Instructure decides to pay.
“ShinyHunters has breached Instructure (again),” the extortion message read. “Instead of contacting us to resolve it they ignored us and did some ‘security patches.'”
A source close to the investigation who was not authorized to speak to the press told KrebsOnSecurity that a number of universities have already approached the cybercrime group about paying. The same source also pointed out that the ShinyHunters data leak blog no longer lists Instructure among its current extortion victims, and that the samples of data stolen from Canvas customers were removed as well. Data extortion groups like ShinyHunters will typically only remove victims from their leak sites after receiving an extortion payment or after a victim agrees to negotiate.
**Dipan Mann**, founder and CEO of the security firm **Cloudskope**, slammed Instructure for referring to today’s outage as a “scheduled maintenance” event on its status page. Mann said Shiny Hunters first demonstrated they’d breached Instructure on May 1, prompting Instructure’s Chief Information Security Officer **Steve Proud** to declare the following day that the incident had been contained. But Mann said today’s attack is at least the third time in the past eight months that Instructure has been breached by ShinyHunters.
In a blog post today, Mann noted that in September 2025, ShinyHunters released thousands of internal University of Pennsylvania files — donor records, internal memos, and other confidential materials — through what the Daily Pennsylvanian and other outlets later determined was, in part, a Canvas/Instructure-mediated access path.
“Penn was the named victim,” Mann [wrote](https://www.cloudskope.com/insights/post/instructure-canvas-ransomware-attack-hits-universities-2026). “Instructure was the mechanism. The incident was treated as a Penn-specific story by most of the national press and quietly handled by Instructure as a customer-specific matter. That framing was wrong then. It is dramatically more wrong in light of the May 2026 events, which now look like the planned escalation of an attack pattern that ShinyHunters had been working against Instructure’s environment for at least eight months prior. The September 2025 Penn breach was the proof of concept. The May 1, 2026 incident was the production run. The May 7, 2026 recompromise was ShinyHunters demonstrating publicly that the May 2 ‘containment’ did not happen.”
In February, a ShinyHunters spokesperson told _The Daily Pennsylvanian_ that Penn [failed to pay a $1 million ransom demand](https://www.thedp.com/article/2026/02/penn-hack-donor-data-ransom-one-million-shinyhunters-gse-emai). On March 5, ShinyHunters published 461 megabytes worth of data stolen from Penn, including thousands of files such as donor records and internal memos.
ShinyHunters is a prolific and fluid cybercriminal group that specializes in data theft and extortion. They typically gain access to companies through voice phishing and social engineering attacks that often involve impersonating IT personnel or other trusted members of a targeted organization.
Last month, ShinyHunters relieved the home security giant **ADT** of personal information on 5.5 million customers. The extortion group [told BleepingComputer](https://www.bleepingcomputer.com/news/security/home-security-giant-adt-data-breach-affects-55-million-people/) they breached the company by compromising an employee’s Okta single sign-on account in a voice phishing attack that enabled access to ADT’s Salesforce instance. BleepingComputer says ShinyHunters recently has taken credit for a number of extortion attacks against high-profile organizations, including Medtronic, Rockstar Games, McGraw Hill, 7-Eleven and the cruise line operator Carnival.
The attack on Canvas customers is just one of several major cybercrime campaigns being launched by ShinyHunters at the moment, said **Charles Carmakal**, chief technology officer at the Google-owned **Mandiant Consulting**. Carmakal declined to comment specifically on the Canvas breach, but said “there are multiple concurrent and discrete ShinyHunters intrusion and extortion campaigns happening right now.”
Cloudskope’s Mann said what happens next depends largely on whether Instructure’s customers — the universities, K-12 districts, and education ministries paying for Canvas — choose to apply pressure or absorb the breach quietly.
“The history of education-vendor incidents suggests the path of least resistance is the second one,” he concluded.
**Update, May 8, 11:05 a.m. ET:** Instructure has published [an incident update page](https://www.instructure.com/incident_update) that includes more information about the breach. Instructure said its Canvas portal is functioning normally again, and that the hackers exploited an issue related to Free-for-Teacher accounts.
“This is the same issue that led to the unauthorized access the prior week,” Instructure wrote. “As a result, we have made the difficult decision to temporarily shut down Free-for-Teacher accounts. These accounts have been a core part of our platform, and we’re committed to resolving the issues with these accounts.”
Instructure said affected organizations were notified on May 6.
“If your organization is affected, Instructure will contact your organization’s primary contacts directly,” the update states. “Please don’t rely on third-party lists or social media posts naming potentially affected organizations as those lists aren’t verified. Instructure will confirm validated information through direct outreach to all affected organizations.”
_This entry was posted on Thursday 7th of May 2026 10:58 PM_
[A Little Sunshine](https://krebsonsecurity.com/category/sunshine/)[Data Breaches](https://krebsonsecurity.com/category/data-breaches/)[Ne'er-Do-Well News](https://krebsonsecurity.com/category/neer-do-well-news/)[Ransomware](https://krebsonsecurity.com/category/ransomware/)
[Canvas hack](https://krebsonsecurity.com/tag/canvas-hack/)[Charles Carmakal](https://krebsonsecurity.com/tag/charles-carmakal/)[Cloudskope](https://krebsonsecurity.com/tag/cloudskope/)[Dipan Mann](https://krebsonsecurity.com/tag/dipan-mann/)[Instructure hack](https://krebsonsecurity.com/tag/instructure-hack/)[Mandiant Consulting](https://krebsonsecurity.com/tag/mandiant-consulting/)[ShinyHunters](https://krebsonsecurity.com/tag/shinyhunters/)[Steve Proud](https://krebsonsecurity.com/tag/steve-proud/)
Post navigation
[← Anti-DDoS Firm Heaped Attacks on Brazilian ISPs](https://krebsonsecurity.com/2026/04/anti-ddos-firm-heaped-attacks-on-brazilian-isps/)
## 49 thoughts on “Canvas Breach Disrupts Schools & Colleges Nationwide”
1.   Name withheld [May 7, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654524)
These hackers have no honor. They have brought shame to both their families and their ancestors. Their parents should be embarrassed by them.
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654524#respond)→ 
    1.   [Deejenerate](http://who/?)[May 7, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654526)
To be entirely honest, what they just accomplished is groundbreaking. Horrible for sure, but for a system that literally robs their students- what a HUGE pull of attention to a system that needs to be scrutinized. Hopefully the schools do the right thing by their students, and pay the hackers. They do nothing but generate money and put students in to massive amounts of debt just for information that can be self taught, but not looked at because it wasn’t “Credited” by a university…
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654526#respond)→ 
        1.   Taylor [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654562)
You’re going to get your wish and see a wave of universities closing across the country, because critical thought is just too dangerous and anyway it can all be self-taught with Youtube videos.
Get me out of this stupid fucking country.
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654562#respond)→ 
        2.   Don't worry about it [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654568)
“Hopefully the schools do the right thing by their students, and pay the hackers”…is a horrible way to deal with this. You really think by paying the ransom they are actually going to honor what they say? There are actual laws in some states that bar against paying cyber ransoms. If a cyber criminal is good at their job, which it seems to be for this one, they are quite good at it, they are going to make copies/backups as SOON as they get the data they are after. They will just take the money and sell the data to the blackmarket. Sometimes you just have to cut your losses and rebuild stronger.
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654568#respond)→ 
            1.   [Big Chungus](http://search.brave.com/)[May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654574)
You might be responding to a SH affiliate performing their duties as “Public Relations content creator”…
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654574#respond)→ 
                1.   KingJames [May 11, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654800)
Perfecto !!
 Easy to guess
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654800#respond)→ 
    2.   Robert Hollander [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654533)
honor? shame? embarressed ancestors?
dude, are you living in the 17th century???
 lol
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654533#respond)→ 
    3.   Worf, Son of Mogh [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654555)
Spoken like a true Klingon!
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654555#respond)→ 
        1.   mealy [May 10, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654731)
Yer no True Klingsmon!
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654731#respond)→ 
    4.   Silver [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654604)
It is entirely IN STRUCTURES FAULT. THEY WARNED THEM MULTIPLE TIMES. INSTRUCTOR IGNORED THEIR WARNINGS FOR BUG FIXING.
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654604#respond)→ 
2.   T [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654529)
Yet take a computer away from these turds and what are they? Small insignificant manchildren. They have no life skills and owe their parents so much for babying them and letting them learn the ability to… be a criminal? Seriously, is that it?
 Idiots can’t go after places that matter, so they go after education…? Which is already poorly funded as is, mind you…
I pray to all deities known to man and hope that just a little karmic justice will come to light. They should be considered cyberterrorists for this act alone.
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654529#respond)→ 
    1.   NWBStu [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654578)
Karmic justice would be awesome. But as someone else pointed out, the U.S. educational industrial complex is not poorly funded, at least not the larger universities. All the local colleges and below are usually strapped. But this whole thing is indeed big money, but we’ll have to see if Instructure takes the bait and coughs up some of its millions for this. I doubt even an ivy-league university will pay for Instructure’s lack of security or for its pride, wanting to act like the emperor still has clothes.
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654578#respond)→ 
    2.   tomoko kuroki [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654610)
projection is strong with this one
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654610#respond)→ 
3.   Nico T. [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654530)
Regarding “Canvas parent firm Instructure [NYSE:INST]”, Instructure was taken private in 2024. It is no longer a public company.
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654530#respond)→ 
    1.   AEH [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654575)
If it was bought by private equity you know exactly why it has gone to crap.
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654575#respond)→ 
4.   MYOB [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654531)
Given the current political climate in the U.S., my foremost concern is access to which classes students are taking, what pronouns they use, and the papers and discussion posts they are writing. I also see far too little attention to the fact that **they stole personal information about children** since Canvas is heavily used in K-12. We’ve got plenty of ways to protect ourselves against identity theft, but nobody’s talking about how to protect children who experiment with using “they/them” pronouns, or who wrote a term paper for or against gay marriage, abortion, or capitalism? Or adult scholars working on gender studies, black studies, Christianity, Islam, or the Israeli-Palestinian crisis? Those early papers (high school and college) tend to be very un-nuanced and “read” as more extreme than the person’s actual beliefs, and could even be an assignment or thought exercise in arguing the opposite of what they really believe. In the past, all of that would be inaccessible to the wider world. Making all of that public, especially right now, especially for children and young adults, is very concerning.
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654531#respond)→ 
    1.   Sara [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654572)
THAT’s your concern, out of EVERYTHING else that was stolen?! And you think THAT’s what the hackers, any hackers, are after?!
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654572#respond)→ 
        1.   [HumanRights Johnson](http://www.splcenter.com/)[May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654581)
Your dismissive comment towards MYOB shows your privilege, Sara.
I am as concerned as MYOB is. The real sensitive information is anything that the US’s right-wing authoritarian regime is opposed to — like anyone not white, straight, cis, and the correct flavor of Christian — being tied to one’s name. The 20-somethin’ year-old Elon-fanboys with surely use AI to pour over the hacked data, build a list, and use it to harm dissenters.
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654581#respond)→ 
            1.   Santa Claus [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654587)
they were after $ – nothing else, they could care less about politics, or religion, or other social issues
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654587#respond)→ 
                1.   No Media [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654603)
That’s not really the point, it’s not that the hackers are after that data, but if it becomes public, certain things might land you on certain lists, and you could become a political target regardless of what the hackers’ intentions are
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654603#respond)→ 
            2.   Sara [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654635)
Canvas does not have information about who is LGBTQ+. Nor do they have information about what color people are, who they believe in, etc. What you will find on Canvas is exams, discussion boards, reading materials, and grades.
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654635#respond)→ 
                1.   No Way [May 9, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654676)
And you don’t see how those are connected? Pretty dim bulb, ain’t you.
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654676#respond)→ 
                2.   Allen [May 9, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654680)
Backdoor Canvas certainly does contain information on students, i.e. student i.d. numbers, students’ personnel phone and email, possibly bank account links … and possibly demographics. Even if all I could obtain was a student i.d. number, I could, in short order, obtain pretty much any information about a student that I wanted: financial, demographic, address, email, phone, social media … and on and on.
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654680#respond)→ 
    2.   W Simpson [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654606)
That is why redundancy is important, but most in Government have no idea what that is…….
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654606#respond)→ 
        1.   mealy [May 10, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654732)
Oh I think they understand redundancy lol.. it doesn’t impart usefulness per se.
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654732#respond)→ 
    3.   King James [May 11, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654801)
Whaaat?
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654801#respond)→ 
5.   Dennis [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654534)
“Canvas is currently undergoing scheduled ransomware negotiation. Check back soon”
Fixed it.
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654534#respond)→ 
6.   Harvey Terhorst [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654539)
Even in Europe, in the Netherlands, all universities and colleges have been hacked.
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654539#respond)→ 
7.   Steve [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654547)
” this attack could hardly have come at a worse time for Instructure: Many of the affected schools and universities are in the middle of final exams, and a prolonged outage could be highly damaging for the company.”
I don’t feel bad for the company, except any employee that was screaming about security and wasn’t listened to.
The week or two before, then finals week was always a very stressful time for me, so I feel for the students going through this hell. Plus the added burden of wondering what info on them is now floating around the Internet…
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654547#respond)→ 
8.   [Doug Levin](https://www.k12six.org/)[May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654549)
The company is private, not public: [https://www.instructure.com/press-release/instructure-to-be-acquired-by-KKR](https://www.instructure.com/press-release/instructure-to-be-acquired-by-KKR). See also KKR: [https://www.kkr.com/invest/portfolio?cfnode=instructure-holdings-inc-](https://www.kkr.com/invest/portfolio?cfnode=instructure-holdings-inc-). This matters because it means the company is subject to different regulatory and enforcement rules.
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654549#respond)→ 
9.   Jon Marcus [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654552)
Huh, they were taken private less than two years ago. I wonder what the new owners did with “unnecessary” spending on security?
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654552#respond)→ 
10.   Cybermom [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654554)
Oof, it’s like Instructure took every piece of advice on handling this type of attack and threw it out the window. It doesn’t make me super confident that anything they’ve stated regarding breached information is accurate. Great that the colleges might be able to pay up, but the cash-strapped public school systems don’t have an extra few million hanging around to give away.
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654554#respond)→ 
11.   [Doug Levin](https://www.k12six.org/)[May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654557)
Those claims from Mann sure are something. Cybersecurity practices at Instructure did not appear to be immature: [https://trust.instructure.com/](https://trust.instructure.com/).
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654557#respond)→ 
    1.   [Dipan Mann](http://www.cloudskope.com/)[May 10, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654775)
Doug: appreciate the link. To be clear, the post isn’t a claim that Instructure has no security program; SOC 2 and the trust portal are documented.
The argument is narrower: the May 2 ‘contained’ assertion didn’t survive contact with May 7, and the choice to label that day’s outage ‘scheduled maintenance’ on the login surface while the status page lagged is the response posture I’m critiquing, not the underlying controls.
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654775#respond)→ 
        1.   D. Choudhury [May 10, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654778)
What does “didn’t survive contact with” mean, here, exactly?
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654778#respond)→ 
            1.   [Dipan Mann](http://www.cloudskope.com/)[May 11, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654797)
Mr. Choudhury, military phrasing on my part. There’s an old line from a Prussian general named von Moltke: “no plan survives contact with the enemy.” It’s proving just as true in modern cyber as it was on the battlefield. The May 2 “contained” statement didn’t hold. ShinyHunters hit Instructure again on May 7 using the same access path. They said it was over. But unfortunately, it wasn’t.
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654797#respond)→ 
12.   Roman Segal [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654558)
I think it’s time to look at other platforms like blackboard instead of Canvas that might be more secure.
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654558#respond)→ 
    1.   URLOCALDUMBASS [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654561)
Blackboard had many functioning issues so our schools got rid of it a while ago.
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654561#respond)→ 
        1.   mealy [May 10, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654733)
The question is, why are ANY of these considered necessary? Why exactly?
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654733#respond)→ 
13.   [Dipan Mann](http://www.cloudskope.com/)[May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654559)
Brian,
thank you for picking up the cover-up angle — most outlets are still
 leading with the breach itself rather than the company’s response to it. A
 few things from our reporting that may be useful to your readers:
The 21-minute gap between the “scheduled maintenance” cover (4:20 PM ET on
 May 7) and the status page acknowledgment (4:41 PM) wasn’t accidental
 architecture. status.instructure.com runs on Statuspage (Atlassian) —
 infrastructure independent from canvas.instructure.com. Updating one does
 not require updating the other. The maintenance message went up on the
 surface where students were being actively redirected from a ransom screen.
 The acknowledgment went up on a surface their IT teams would eventually
 check. Two separate decisions, two separate surfaces, timing arbitraged
 accordingly.
As of this comment, status.instructure.com still shows “No incidents
 reported today” for May 7, and Canvas LMS is still flagged “Operational.”
 Multiple universities are still publicly reporting the platform is down.
 That delta is the story.
For anyone working on follow-up reporting: the question that surfaces the
 next layer of accountability is what specific Instructure communications
 school IT teams received between May 1 and May 7 — and whether they were
 told the incident was “resolved” or “contained.” Several university
 communications offices have already reproduced Instructure’s May 6
 “resolved” language verbatim in messages to parents.
Thanks again, Brian. The reporting matters.
— Dipan Mann, Cloudskope
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654559#respond)→ 
    1.   tomoko kuroki [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654609)
are you able to do anything in your life without using the clanker? you deserve to be automated out of your job
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654609#respond)→ 
    2.   Just some guy [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654638)
Are you one of those people that saves your own comments in a text document (not even bothering to fix your linefeeds when pasting them), thinking they are a gift to a future mankind, or like me and do not believe in saving your sent messages to people after weeks of no replies, Dipan?
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654638#respond)→ 
14.   [Doug Levin](https://www.k12six.org/)[May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654573)
Company has made a statement: [https://www.instructure.com/incident_update](https://www.instructure.com/incident_update)
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654573#respond)→ 
15.   Uni Librarian [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654580)
I work at a university, fortunately in the library and not on the education side. It was _not_ a good day for the students.
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654580#respond)→ 
16.   Larry Seltzer [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654584)
They say they’ve fixed the problem. If there’s no leak, can we assume they paid the ransom?
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654584#respond)→ 
17.   tomoko kuroki [May 8, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654608)
> “Penn was the named victim,” Mann wrote. “Instructure was the mechanism.
 that’s like blaming the car manufacturer because you left it unlocked and someone stole your laptop from inside.
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654608#respond)→ 
18.   Scott Nicholson [May 9, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654663)
As a CISO myself, I do have to wonder why Salesforce is not a bit in the crosshairs with Canvas running on their platform!
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654663#respond)→ 
19.   Mark [May 10, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654749)
Don’t tell me, let me guess . . . Instructure will offer a year of free credit monitoring to the affected customers. Add that to the four other instances of free credit monitoring they already have courtesy of other irresponsible companies who lost their info.
Hard to implement for sure, but it would be nice to see the big companies feel more pain for these incidents. Big financial punishment is all they will understand.
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654749#respond)→ 
    1.   Mike H. [May 10, 2026](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#comment-654769)
So, the eight year old kids can claim it in nine years or so?
[Reply](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/?replytocom=654769#respond)→ 
### Leave a Reply [Cancel reply](http://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/#respond)
Your email address will not be published.Required fields are marked *
Comment *
Name *
Email *
Website
Δ
Advertisement
[![Image 5](http://krebsonsecurity.com/b-doppel/11.png)](https://www.doppel.com/?utm_source=krebsonsecurity&utm_medium=display&utm_campaign=fy27brandcampaign&utm_content=imitation)
Advertisement
Mailing List
[Subscribe here](http://krebsonsecurity.com/subscribe/)
Search KrebsOnSecurity
Search for: 
Recent Posts
*   [Canvas Breach Disrupts Schools & Colleges Nationwide](https://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/)
*   [Anti-DDoS Firm Heaped Attacks on Brazilian ISPs](https://krebsonsecurity.com/2026/04/anti-ddos-firm-heaped-attacks-on-brazilian-isps/)
*   [‘Scattered Spider’ Member ‘Tylerb’ Pleads Guilty](https://krebsonsecurity.com/2026/04/scattered-spider-member-tylerb-pleads-guilty/)
*   [Patch Tuesday, April 2026 Edition](https://krebsonsecurity.com/2026/04/patch-tuesday-april-2026-edition/)
*   [Russia Hacked Routers to Steal Microsoft Office Tokens](https://krebsonsecurity.com/2026/04/russia-hacked-routers-to-steal-microsoft-office-tokens/)
[](http://krebsonsecurity.com/2026/05/canvas-breach-disrupts-schools-colleges-nationwide/)
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
[![Image 6](https://krebsonsecurity.com/wp-content/uploads/2017/06/computered-580x389.png)](https://krebsonsecurity.com/2017/06/why-so-many-top-hackers-hail-from-russia/)
 © Krebs on Security - [Mastodon](https://infosec.exchange/@briankrebs)