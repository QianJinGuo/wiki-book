---
source: rss
source_url: https://www.interconnects.ai/p/farewell-ai2
ingested: 2026-07-05
feed_name: Interconnects
source_published: 2026-06-02
sha256: "0faa08721487accc26cc855717501f9fe223d1704326e28b51d083e0edf8f765"
---

# Farewell Ai2

I’m departing the Allen Institute for AI (Ai2), where I got the great privilege to work on the Olmo models, to grow, to learn, and to have broad lasting impacts. This post is an attempt to reflect on why what we did was influential, despite obviously being far from the frontier in performance (even when within size buckets), and how this reflects on various paths to impact in AI today.

To start, I shared the following note with the company yesterday:

> Dear Ai2.
> 
> As many of you know, today is my last day working at Ai2.
> 
> I joined Ai2 largely as an accident. I met Luca at ICML 2023 in Hawaii and realized I could level up my open post-training work dramatically if I got the chance to join. When I got an offer it was an absolute no-brainer, it was such a welcoming and exciting environment.
> 
> It has been a wonderful ride that has transformed my life, and I couldn’t be prouder of the work we did together. Ai2 has a wonderful scientific culture at its core and I’m excited to see this continue. I feel very lucky to have been here and that I personally have benefited massively from everyone who has worked so hard to cultivate that culture and environment. It is and has been a team effort. This includes all the people whose longest interactions with me were brief chats at the coffee machine. I drew so much energy and excitement from all the different ways people at Ai2 showed up for the mission.
> 
> I’ve already thanked much of the OE team directly, but I wanted to thank everyone else that went into this. Legal, IT, Comms, and the Office team all do a great job enabling and leveling up our research work. It’s often work that is forgotten, outside of the lime light, or remembered at the last minute, but it all has been crucial to achieving our goals. I’m excited to keep visiting the wonderful Northlake space in the coming years.
> 
> Even though I’m leaving, I’m more excited than ever about Ai2’s mission. Ai2 operates in such a rare niche between academia and industry, where we can explore and influence the most important technology of our lifetime. Doing this openly is the best way to ensure the technology diffuses safely to everyone who may benefit. Ai2 needs to stay as ambitious as possible, trying to influence the cutting edge of AI and the biggest issues of the field. Do not shy away from these challenges – AI needs independent voices as it only becomes more geopolitical, socially disruptive, and central to the economy.
> 
> I will still be working in this space, working to make the open ecosystem better coordinated and more useful.
> 
> So as I go off to try something new, don’t be strangers. I’ll always be reachable at [nathan@natolambert.com](<mailto:nathan@natolambert.com>) and will still live in Seattle for most of the year.
> 
> Nathan

I have loved and will still love Ai2. Ai2 has a deep culture of caring about the research process, the outputs that get shared, and most importantly the people who do the work. This is why the institution creates countless wonderful people that go and spread the gospel throughout the research community. This core culture will remain through the rebuild, and there are plenty of resources to do impactful research across the spectrum of AI.

In the last two years of my time at Ai2 I’ve done so much meaningful work. Of course Olmo is at the top and has been my priority, but making time for consistent practice here on Interconnects, weekend cram sessions for [ATOM](<https://atomproject.ai/>), and also the fun [RLHF book](<https://rlhfbook.com/>) make for a list that makes me wonder how I did it all. I was obviously obsessed with work, but not in a way that made me lose sleep or lose my overall wellness. It was the right long-term approach.

This impressive list is one where I was ruthless in saying no to things that didn’t matter and got all my work out to see the light of day. I had no medium-sized projects that didn’t succeed in the last few years. It makes me wonder if I wasn’t taking enough risk. It shows you can truly do so much with your time, and it’s actually harder to find the right problems and environment to do it. Many people are in environments where their work never becomes public or they’re forced to change topics consistently.

[Share](<https://www.interconnects.ai/p/farewell-ai2?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

## **From zero to hero**

To start, I’d like to do a short recap on my path to Ai2 to show what Ai2 was just as much a growth story for me as an execution story.

I studied electrical engineering in undergrad, focusing on linear systems math and microelectronics.

I was admitted to the UC Berkeley EECS Ph.D. program to study microelectromechanical systems (MEMS).

I showed up at Berkeley in August of 2017 and realized AI was obviously the thing I should be doing. I asked the likes of Sergey Levine or Pieter Abbeel if they could advise me – they said no.

I threw all my energy into learning what I could about AI. I got a break to get advised by one of Sergey’s post-docs in 2018 or 2019. I went all in on that, I fought for funding, I fought to have _an_ AI paper.

This process worked out by the end of my Ph.D. in 2022: I had access to the Berkeley AI Research (BAIR) building and collaborations in the department. It was a bumpy road.

I wanted to go to industry research, to get a nice paying job with intellectual freedom, something like FAIR or Google Brain at the time. HuggingFace was the only job that fit that bill, it was easy to say yes to.

I joined HuggingFace in May of 2022 and wasted my time at the company until ChatGPT was released. I used my RL background to write a [blog post](<https://huggingface.co/blog/rlhf>) on RLHF which went viral. HuggingFace decided it would be good for me to form a team around this success.

In 2023 I learned NLP and about language models. I had a lot of fun and built an initial community. I got burned out by working remote with a huge time difference. I met Luca Soldaini at ICML in Hawaii, where I was giving a tutorial on RLHF, and they told me Ai2 was hiring.

I got the job at Ai2 largely because of my excitement and how I was saying I wanted to do a lot of stuff that sounded cool to them but no one was likely to do (RL related things). My interviews were far from a sure thing – this is a great job to land!

I started at Ai2 in October of 2023. I worked remotely for a while. I was doing normal research, I made the first reward model evaluation, RewardBench. It was a solid success, but nothing like how the pretraining team was getting ready to release the first Olmo.

I helped coach Ai2 on how to release models well, helping the Tülu 2 project land (the first model to do DPO well, publicly at the 70B scale).

The first Olmo was released in early 2024, I squeaked onto the papers just by trying to be helpful and doing some basic post-training. I was already good at paying attention to which projects are actually important.

That summer I started rounding everyone up to do a “big frontier post-training project.” This became Tülu 3, one of my favorite projects ever released, in fall of 2024. The goal was to beat Llama 3’s post-training with their own base model. The team morale was incredibly high and the execution was so timely, allowing us to coin the term Reinforcement Learning with Verifiable Rewards (RLVR) in the paper.

The crazy lengths I went to get the Tülu 3 and Olmo 2 post-training done had me sending 40% more slack messages than anyone at the company and got me the award “The Cat Herder.”

2025 was a much simpler year. We were too slow to react to reasoning models, given we had been doing similar stuff with Tülu 3, but sometimes that happens.

Originally we wanted to release Olmo 3 by June or July of 2025. That obviously didn’t happen, but we got the slim chance to train a bigger model, and it really landed. We threaded the needle.

Since Olmo 3 was released, it was clear that some changes were coming and I personally never got a big post-training project off the ground after that. Many other people managed great work in the spring of 2026.

This all leaves me here today showing you that only about half of my story at Ai2 is what I was known widely for, and the rest was building momentum. It often takes a year of building relationships and direction before really big successes can happen in a career.

I was just about a nobody when I joined Ai2 and I got to join a team that was willing to learn from the skills I had brought from HuggingFace. With how media works, I often think I get more recognition than I deserve for Ai2’s success.

The likes of Tülu 3, Olmo 2, and Olmo 3 felt like generational team efforts. The amount of personal successes and breakthroughs that happened for those projects is immense – and to sustain them over such a long time period is incredibly hard to replicate. The sum far exceeded the individual parts.

I’ve heard many times in the last few months how people wouldn’t know about Ai2 if it wasn’t for my writing. Statements like this are overblown, but they are partially true and reiterate how crucial building relationships and getting the word out is today. 

When you write a plan that is feasible, the world bends towards that plan. When you convince people it’s going to happen it only becomes more likely. Vision and compelling explanations are one of the items in shortest supply in the tech industry. Often building the thing is easy and explaining it is hard. If no one knows about your work, the value is often close to 0. So much of building reputation is about building relationships with people who will receive your work.

Reflecting on all of this, I’ve had a shockingly linear path through my career to incremental success. I would expect the first 10 years of most careers to be in search of finding one opportunity as good as Ai2, and you will not always be able to seize it. There are some ways to create more opportunities. 

I’ve [discussed before](<https://www.interconnects.ai/p/my-path-into-ai>) how a large part of my rise is down to many more senior and more established scientists being drawn into the closed ecosystems at the same time as an immense swell in interest for AI. This created a power vacuum that I, and a few other prominent scientists that I think form my “generation”, got to grow rapidly into.

Interconnects AI is a reader-supported publication. Consider becoming a subscriber.

## **The role of public scientists**

With my work at Ai2 and Interconnects, I summarize my role and mission as trying to accomplish three things:

  1. **Provide clarity in the evolution of frontier models.** This is easiest when the science has caught up, but even applying a scientific lens to how the models are changing is very useful to building trust in the broader AI ecosystem.

  2. **Create a vibrant and diverse open (model) ecosystem.** This is crucial to mitigating some risks of AI, particularly with concentration of power and myopia in studying frontier safety, that has motivated me now for 3-4 years. The risks haven’t abated.

  3. **To build institutions** that create people and ideas that further the above missions, and generally mission-driven individuals that are willing to advocate and build a future they believe in. AI is a grand problem, and not one that I can do alone, so I need to build brands to rise through the noise and attract likeminded people. 




At my best, I have many avenues for impact. I help open researchers work on impactful problems – not wasting the precious compute and time they have during the AI boom. I help policymakers know what is true. I build models that people use. I tell stories that make people smile. I keep the list wide so that I can stay motivated.

I see all of this continuing, and have been thinking about the broader impacts of this repeatedly over the last few months. Hearing that Andrej Karpathy was joining Anthropic prompted me to finally share more of [my opinions](<https://x.com/natolambert/status/2056772229120295416>):

> For a long time, academic researchers being at the cutting edge of new technologies has been a great social equilibrium. Neutral, unbiased technologists have been the people to spread new ideas to the world.
> 
> As AI research takes off in velocity, it is also going behind closed doors. The tech industry has sowed distrust, and now they are the ones trying to tell the world about incredible changes coming. It’s a big loss to a form of social contract in America.
> 
> There’s been a history of scientists helping society understand new technologies. There is a public service in the culture of science that I want to see continue.
> 
> It’s being exacerbated by feelings of FOMO, especially financially driven, where I’m seeing many people who previously wanted to be professors -- and likely still do deep down -- feel a need to conform and chase money, in a pocket of industry. I get it, I grapple with this.
> 
> For those with a safety net, there will be great returns to some who choose to zag, and try to build something good, for people who need something different. For me, this is building interesting, fully-open models, to show what you can do with a variety of open weight sizes.
> 
> Yes, AI’s immediate future is dictated by the frontier, but it’s long-term trajectory still deeply includes academic institutions and open science. Knowledge will always diffuse, but to whom?
> 
> As of today, I think China is positioned to be the global home of AI research in a few years. The home of research is where ideas are accessible, spread rapidly, and are nurtured. The U.S. seems to be unwinding many institutions and relationships.
> 
> The largest returns go to people who build something differentiated, at least in reputation, and a lot of people are not being shown that this path exists.

To elaborate on this, I don’t fault any of the individuals who are going to industry today. I’ve been very close to doing this myself in the past weeks of job searching, or rather job exploring. It’s a systematic problem where scientists cannot easily get the support to take bold stances, especially stances that are designed around the public good.

To go a step further and say that only the research within closed, frontier labs matters is very myopic. Yes, there’s a sort of research you can only do with vast compute resources, and they will directly impact the most revolutionary tools of the day. But, I see the relative opportunity to do good elsewhere as higher for plenty of people.

Open research will always be the standard that sets the language people use to understand AI. It’ll always be how the next generation is trained – even if it’s behind what industry has built. It’ll be the ecosystem where new long-shot ideas are built. Without investing in this open ecosystem, all of these cycles will be kneecapped.

At the end of the day, so much of my role now is just showing the path to impact in this domain. To show how clever, mid-sized open models can impact real problems in the world. To show how policy-makers and educators need open research to structure the rest of society around AI. This is a fun role too! It would be very sad for me to see this light diminish ever further, into the lightest embers of a fire that looks almost entirely out.

Even if the pace of research were to slow further, if the folks remaining like myself got financial offers they can’t refuse for their families’ sake, the torch of open research will never fully go out. It’s core to how science is taught and done. There is a next generation coming, they just look for guidance and role-models.

## **What ’s next**

I see the best Ai2 work as research infrastructure. Building recipes in public gives countless researchers the ability to ask very specific questions of training processes. We need these researchers in the broader community, as Ai2 could never answer all the interesting questions themselves. One of my great joys in recent months has been visiting a top ML university and hearing so many graduate students say they’re building on Olmo. This is how the world should work!

Going forward, I still plan to operate in similar spaces, fighting for open-science, imagining what the future of the open model ecosystem can be, and doing my best to make the social transition to an AI-native era smooth. I’m most excited by how you can train medium sized open models on specific tasks that become useful tools in complement to the frontier models – massively winning on price. I want to invest in the ecological diversity of open models and coordination across builders.

For something that isn’t surprising given my past focus areas, I’m watching the pace of releases from all labs open & closed, and how they’re hillclimbing on super ripe new post-training veins (on-policy distillation, agentic workflows, etc.), it’s clear that fully-open post training recipes are about as far behind as they ever have been & falling further behind. I’d like to fix this. It’s not 100% clear yet if I will this year, but I’ll try.

To do this best and to execute, mostly personally, I needed a new start and fresh perspectives. I’ll be carefully building what I’m doing next over the next few months and am eager to share more about it when I can. One of my close teammates at Ai2 shared this quote with me in a farewell card, and I found it very apt in where I’m going next.

> The object of life is not to be on the side of the majority, but to escape finding oneself in the ranks of the insane. — Marcus Aurelius

Thank you all for your continued support.
