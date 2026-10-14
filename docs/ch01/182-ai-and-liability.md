# AI and Liability

> 📊 Level ⭐⭐⭐ | 10.9KB

> **来源**: [AI and Liability](https://schneier.com/blog/archives/2026/06/ai-and-liability.html)

## 摘要

In this June 2026 essay, Bruce Schneier argues that AI-generated content — Google's AI Overviews in particular — makes the company that deploys it a *publisher*, not a carrier, and therefore liable for what it says. A recent German court ruling held Google responsible for false AI search summaries, rejecting "users can check for themselves" defenses and calling the summaries "an expression of Google's business activities." Schneier traces this to the decades-old legal distinction between carriers (a phone company relaying words) and publishers (a newspaper choosing words), shows that AI Overviews cross the line by rewriting third-party content with editorial discretion, and extends the argument to all deployed AI agents: the Air Canada chatbot precedent, the Visa–OpenAI purchasing-agent partnership, and AI doctors and lawyers. His conclusion: corporations have a duty of care for their AI's statements, and if liability makes some agent use cases commercially unviable, that is a feature — the law need not accommodate fundamentally untrustworthy systems.

## 核心要点

1. **A German court has held Google liable for its AI Overviews** — the court rejected the defenses that "users can check for themselves" and that people know AI output "should not be blindly trusted," ruling that the summaries are reflections of the company and "above all an expression of Google's business activities"
2. **The carrier/publisher distinction is the load-bearing legal frame** — phone companies transmit words without liability; newspapers choose words and are liable for them; Section 230 (1996 Communications Decency Act) let internet companies straddle both sides, and algorithmic feeds pushed platforms toward the publisher end
3. **AI Overviews are structurally publisher-like** — unlike traditional search, which courts have held merely archives and facilitates access to third-party content (Parker v. Google), AI Overviews *rewrite* other people's words, exercising editorial discretion like a newspaper article or original essay
4. **The Air Canada chatbot case established a duty-of-care precedent** — the airline's "the chatbot is a separate legal entity" argument was rejected; a company is as responsible for what its chatbot says as for what its website says
5. **AI agents should be treated by the law as agents of whoever deploys them** — the same way a company is liable for human writers' inaccuracies, bound by its human agent's contracts, and a doctor liable for malpractice
6. **The scale math is stark** — tests found Google's AI Overviews err roughly 10% of the time; at 5 trillion searches per year that is about 16,000 erroneous summaries every second, some of which will cause harm, defame, or otherwise trigger liability

## 深度分析

### 1. Carriers, publishers, and the Section 230 straddle

The essay opens by reviving a distinction that predates the internet. A phone company is a **carrier**: it transmits whatever you say, even planning a crime, because it neither knows nor is liable for the words you choose. A newspaper is a **publisher**: it decides what words appear and is liable if they are defamatory or otherwise illegal.

Internet companies have spent decades playing both ends of this distinction — claiming carrier status when convenient and publisher status when advantageous. Section 230 of the 1996 Communications Decency Act enshrined the straddle: "No provider or user of an interactive computer service shall be treated as the publisher or speaker of any information provided by another information content provider."

The social-media debate then sharpened it. Platforms that merely displayed posts in reverse-chronological order behaved largely like carriers. The next generation — Facebook-style algorithmic feeds — curated who sees what and thereby acted more like publishers. This split the expert community: some argue Section 230 has gone too far and needs reform (protecting human speech, not algorithmic virality); others, notably the EFF, argue it is what holds the modern internet together.

### 2. Why AI Overviews tip the balance

Google's AI Overviews are, in Schneier's phrase, "far less nuanced" than the search product the courts have already assessed. In *Parker v. Google*, courts held that traditional search involves archiving and facilitating access to the editorial content of third parties — a carrier-like function. AI Overviews do not merely quote and republish; the model **rewrites** other people's words, exercising the kind of editorial discretion found in a newspaper article or an original essay.

The German court's framing follows directly: the summaries are not neutral transmissions of the web but "an expression of Google's business activities." Once the output is the company's own words, the publisher's liability regime attaches.

### 3. The precedent trail

The German ruling is not an isolated event; the essay assembles a line of cases and incidents:

- **Air Canada (2024)**: The airline's chatbot promised a bereavement discount the company then refused to honor, arguing in court that the bot was "a separate legal entity that is responsible for its own actions." The tribunal sided with the flyer: the airline is as responsible for what its chatbot says as for what its website says. The emerging precedent is a corporate **duty of care** for the performance of deployed chatbots.
- **The Ashley MacIsaac defamation suit (2026)**: Google's AI summary falsely identified the Canadian fiddler as a sex offender; his Ontario lawsuit is ongoing. If liability forces Google to invest until such errors are exceedingly rare, Schneier judges that a good outcome for users and for the subjects of search alike.
- **Scale exposure**: with a ~10% error rate across 5 trillion annual searches — roughly 16,000 erroneous summaries per second — the volume of harm-inducing, defamatory, or otherwise actionable output is a statistical certainty, not a tail risk.

### 4. Agents are agents

The essay's central normative claim generalizes beyond search. AI agents are agents of the person or organization that deploys them and should be treated by the law as such. The analogy set is deliberately mundane: a company that hired human writers would be liable for their inaccuracies; a company is bound by contracts its human agent signs in its name; a doctor who gives dangerously wrong advice is liable for malpractice. Machine agents should inherit the same allocation.

Allowing businesses to hide behind "faulty AI" in exactly those circumstances would be a massive handout and would create disastrous incentives: why employ human writers, lawyers, or doctors when AI is not only cheaper but also absolves the employer of every mistake?

### 5. Selective honoring and the trust problem

As AI chatbots come to sit at the other end of all sorts of corporate communication channels, a company cannot be allowed to honor its agent's statements when convenient and disavow them when not. The Visa–OpenAI partnership to build personal purchasing agents makes this concrete: if Visa will not take responsibility when its AI makes a purchase in your name that you did not want, no one would trust the system. Properly allocating liability is a precondition for agentic commerce to function at all.

### 6. The contrarian conclusion: unviable is acceptable

Schneier concedes that liability concerns may make many current agent use cases commercially unviable — AI lawyers, AI doctors, AI media influencers may not be operable at a profit if their operators are responsible for what they say and do. His answer: we are OK with this. Nothing in the law requires accommodating AI systems that are fundamentally untrustworthy, just as it does not require accommodating untrustworthy human systems. A company that will not stand behind its agents' statements — human or AI — does not deserve users' time or money.

## 实践启示

1. **Treat every AI-generated public-facing summary as company speech**: if your product rewrites third-party or even first-party content (AI summaries of reviews, laws, procedures, or your own publication), assume a publisher's liability posture rather than a carrier's
2. **Do not draft "the AI is a separate legal entity" clauses**: the Air Canada tribunal rejected that defense outright; the operative standard is that a chatbot's statements bind the company like its website's
3. **Budget for accuracy as a legal requirement, not a quality metric**: at Google's scale a 10% error rate means ~16,000 bad summaries per second; organizations deploying generative summaries should estimate their own harm-volume and invest until actionable errors are exceedingly rare
4. **Design agent delegation on the human-agent analogy**: if you would be liable for a human employee doing the task (writing, contracting, advising), assume you are liable for the AI doing it — and let that test gate which agent use cases you ship
5. **Expect some agentic business models to fail the liability test**: AI legal, medical, and influencer services may be commercially unviable under honest accountability; viability under an exemption from liability is not a business plan
6. **Watch the German ruling's durability**: if it holds on appeal, Google's AI Overviews face a devastating economic calculation, and the carrier/publisher line for generative AI will be redrawn around the world

→ [原文存档](https://schneier.com/blog/archives/2026/06/ai-and-liability.html)

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

