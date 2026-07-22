---
sha256: 8dcb7b0a0538de1a218271603b91fd1c7170995fa4a7127ae90e47b1e5b538a1
source: rss
source_url: https://www.oneusefulthing.org/p/what-it-feels-like-to-work-with-mythos
ingested: 2026-07-02
feed_name: One Useful Thing
source_published: 2026-06-09
---

# What it feels like to work with Mythos

I had early access to the first Mythos-class AI model being released to the public, Claude 5 Fable. Much of the discussion of Mythos has centered on its impact on software security, but I tested it on everything except that (the guardrails around Fable essentially prevent it from being used for cybersecurity at all). My conclusion is that it represents a very real leap over every model I have used before, and, maybe more important, suggests our relationship with AI is changing in drastic ways.

First, how good is Fable? In experiment after experiment I conducted, it outperformed basically every other public model I have used by a considerable margin. It was capable across many problems and produced some startling results — it would work up to a dozen hours executing on multi-page specifications. I’ll walk you through a couple of more complex, and serious, use cases shortly, but you could see the general improvement across the board on every task. The problem about communicating this in a post is that many of the most impressive results are going to be interesting to only small portions of my readers. For example, it made[ the most sophisticated academic social science paper](<https://verdicts-not-evidence-paper.netlify.app/>) I have yet seen from an AI from a single prompt and one piece of feedback. It also created[ a 10-page epic rhyming poem](<https://claude.ai/public/artifacts/32ebc671-f415-4072-b46d-5353d4ffaad4>) about a haircut where every word starts with the letter s.

So, as a more accessible and entertaining example, I also had it create a bunch of games you can try. All of these are one initial prompt in Claude Code where Fable had to take my vague prompts and generate something workable, followed by a couple of additional prompts with minor encouragement (“make it better”) or feedback. What makes these especially impressive is that Claude cannot generate images, so every piece of art or 3D object was made with math alone, not using any external assets. You can try any of them: [a game about flipping coins](<https://play-flipside.netlify.app/>) (prompt: “Balatro, but for the game of coin flips”) that is quite fun; [a snake game](<https://snake-stable-build.netlify.app/>) where the snake is self-aware and crazy things happen; or a game about [descending into the depths](<https://strata-descent.netlify.app/>) to see what is there.

So the output is impressive. But, especially as I turned to more serious projects, I often felt using the tool was somewhere between delightful and unnerving. Delightful because I just asked for something at it happened. And also unnerving because I just asked for something and it happened.

# Maps and Methods

To see why, it helps to understand the way in which Fable gets work done, and for that I want to turn to an example I have tested on many previous AI models: building an isochrone map. This is a map that shows the distance you can travel in a given length of time, and the first one was created in 1881 showing travel times from London.

[](<https://substackcdn.com/image/fetch/$s_!a0S0!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0c6c38c3-5f48-4440-969f-5c3a04c0dcb1_1145x749.jpeg>)The original map

No previous model did an even halfway useful job with trying to create a map like this because it involves researching thousands of potential trip distances and a lot of small judgement calls and decisions. I decided to try it on Fable using Claude Code with this prompt: _i want you to build a fully researched and beautiful isochronic map that lets me pick various cities and see real isochronic lines based on real data. I want the design to be unique. You should take into account airports (and travel time to and from airports) trains, walking, driving. The data does not need to be live but should be real based on your research and data. You can start with a few cities but more general is better, this should be an entirely new project._ It then suggested that it do this in the style of the original map. I agreed, and it got to work.

It is worth a second looking at the transcript of the multiple hour building session the AI went through on its own, because you can see some unusual things. First, the AI launched multiple other AIs (I believe mostly the cheaper Claude Sonnet) to help it conduct research on travel times, ultimately retrieving over 2,200 specific flights, the rail schedules for trains from the TGV to the Shinkansen, and road speeds per country from multiple academic papers. And while those agents were running, it started coding. Then it launched yet more agents and tests to verify its code, all the while taking notes about its progress.

[](<https://substackcdn.com/image/fetch/$s_!wXis!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff8ea82dc-c7f8-48b6-ab84-d0b4318ce17f_2566x1205.png>)

The result was a fully functioning map of impressive sophistication that looked a lot like the 1881 original, but that doesn’t mean it was perfect. I noticed that a lot of remote locations (like Greenland) just contained estimates of travel time, not exact numbers, so I told Fable to fix it, including the instructions: _actually get travel times to remote airports and locations._ This time the AI launched a workflow, adversarial groups of agents that did research and tested each others results. It figured out how often ships sail to Pitcairn Island in the Pacific and how to get to Grise Fjord from Ottawa. And it used a tremendous number of tokens in a very short period of time (more on this soon).

[](<https://substackcdn.com/image/fetch/$s_!UewI!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F00144072-5e27-4de4-9e82-05adbdf8e014_971x557.png>)

The results were impressive. I pushed a few more times in directions that interested me (including asking for other visualization approaches, etc.). [I would recommend spending a couple minutes clicking around](<https://isochronic-passage-chart.netlify.app/#nyc>) the results, and you can read its methods and sources at the bottom of the graph.

[](<https://isochronic-passage-chart.netlify.app/#nyc>)What the AI generated. Click on the map to go to the interactive version

This is probably not a useful project for you unless you really like travel and maps, but it is indicative of AI solving a hard problem involving research, math, visual development, taste, judgement, complex coding, and more. And, the unnerving part was how little I did. I gave a really ambitious instruction, the AI followed it. I gave a couple of minor pieces of feedback, and the AI figured it out. My role was extremely limited.

Importantly, it was just limited in how much work I did relative to the model, it was also limited in how much control I had over how the model did things, why the model chose particular approaches, or even how in-depth its results would be. The details of the AI’s decision making are not shown to me, and the process would be too long to even be worth following. The map required the AI to make judgement calls about hundreds of little choices, and it just made them, without me understanding the choices or having a chance to weigh in. In many ways, it is miraculous (I can always ask for edits at the end) on the other, it turns AI into the ultimate black box. 

# Working with a Mythos-class model

The most ambitious project I got from Fable takes a little more explanation. I do a lot of research where humans produce messy answers and doing any sort of analysis requires categorize those answers properly: how innovative is an idea? why do people like this book? To figure this out, we used human researchers to make a judgement call about a piece of information, and statistically compare their answers with others to figure out whether we can trust the data. A lot of recent research has shown that AIs might be able to do this important work, but calibrating AI and human judgement has been difficult and expensive. So I asked Fable to solve the problem, first generating a [complex 19 page design document](<https://claude.ai/public/artifacts/35ab6e17-fbf4-4cf1-9362-2c55a9afa57c>) and then executing it.

It worked for nine and a half hours.

[](<https://substackcdn.com/image/fetch/$s_!oDKl!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F313cee40-acdc-423b-85e1-222f2caeca08_1664x1179.png>)

The result was an extremely sophisticated piece of software the AI called Concord that could take in multiple datasets, calibrate human and AI responses, and then conduct complex data analysis on the results. Again, it wasn’t perfect. As an expert, I was able to spot some errors and omissions (some as a result of the design I had asked for) that I had the AI correct. But the scope of the delivery on this project, and many others, exceeded anything I had seen before. In this case, it was a piece of software that researchers have needed for years but was never profitable to create. [You can now just use or modify the code here](<https://github.com/emollick/concord>). I am sure it is not perfect (I only spent an hour working with the results), but a software engineer would iron out the remaining potential bugs that I could not find quickly (which is one reason we may need more, not less, coders in the future, to help with the explosion of new uses for software).

This power goes hand in hand with strangeness and limits. Among those limits is its token usage. Fable is twice as expensive as Opus, and it burns through tokens at a rate that suggests the answer to how much it costs in production is “a lot,” though its clever delegation to cheaper models may lower the real price considerably. The guardrails for Fable also trip at the faintest hint of a security problem, defaulting to the less powerful Claude 4.8 Opus, and it happens way too often. And the jagged frontier is still there. For example, the AI still writes in the same weird style (in fact the software Fable produces bears traces of Claudisms; so do its progress reports, all that carrying the weight and earning the answer). But the deeper strangeness is how little I had to do, and how little I could see while it was being done.

Last year I called this working with a [wizard](<https://www.oneusefulthing.org/p/on-working-with-wizards>): you chant the spell and something happens. With Fable the spell has gotten powerful enough that I am no longer sure I am the wizard. I am closer to a patron. I describe what I want, I pay for it, and I judge the result. The conjuring happens somewhere I cannot watch, in hundreds of small choices I never get a vote on. The work has shifted from process to outcome. I no longer steer; I commission.

It is possible the sidelining is temporary, just an artifact of interfaces that haven’t caught up, and that we’ll get better windows into what these models are doing and better ways to steer them midstream. It is also possible that the opposite is true: that the more capable the model, the less there is for a human to meaningfully do, and the black box is the price of the power. I suspect that is more likely to be the real direction. None of this is a loss of control in the obvious sense. I can still steer Fable, and it follows instructions remarkably well: the more ambitious the instruction, the better the result. But steering is no longer the same as doing. I brief the model, it spins up its own agents to research and write and check one another’s work, and what comes back is finished. A patron commissions a single artist. Fable is closer to a whole studio, where I am the client who signs off on the final work without ever setting foot on the floor.

[Subscribe now](<https://www.oneusefulthing.org/subscribe?>)

[Share](<https://www.oneusefulthing.org/p/what-it-feels-like-to-work-with-mythos?utm_source=substack&utm_medium=email&utm_content=share&action=share>)
