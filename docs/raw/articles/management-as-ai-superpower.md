---
source: rss
source_url: https://www.oneusefulthing.org/p/management-as-ai-superpower
ingested: 2026-06-07
feed_name: One Useful Thing
source_published: 2026-01-27
sha256: c8ebea33afc28978ec915bbca502a6452a5f2cbf23974f11cffaebe15a5df9d1
---

# Management as AI superpower

I just taught an experimental class at the University of Pennsylvania where I challenged students to create a startup from scratch in four days. Most of the people in the class were in the executive MBA program, so they were taking classes while also working as doctors, managers, or leaders in a variety of large and small companies. Few had ever coded. I introduced them to Claude Code and Google Antigravity, which they needed to use to build a working prototype. But a prototype alone is not a startup, so they used ChatGPT, Claude, and Gemini to accelerate the idea generation, market research, competitive positioning, pitching, and financial modelling processes. I was curious how far they could get in such a short time. It turns out they got very far.

[](<https://substackcdn.com/image/fetch/$s_!5DG2!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1ff5bdf5-c9ce-43a5-a5de-4af06f5f0ff5_3359x720.png>)Examples of demos: Ticket Passport (a market for verified ticket sales) by [Dee Sethmajhi](<https://www.linkedin.com/in/debashree-sethmajhi-9b047510/>), [Jane Lian Wang](<https://www.linkedin.com/in/janelianwang/>), and [Yue Ma](<https://www.linkedin.com/in/yuemaus/ and>). Revenue Resilience (Identifies at-risk revenue for small businesses and creates agentic solutions) by [Whit Chiles](<https://www.linkedin.com/in/whit-chiles-b9000840/>), [Jose Olivares](<https://www.linkedin.com/in/olivaresjosea/>), and S[pencer Louie](<https://www.linkedin.com/in/spencer-louie/>). Parenting companion (matching kid interests to activities) by [Manoj Massand](<http://www.linkedin.com/in/manoj-massand-028454a>), [Samuel Lee](<https://www.linkedin.com/in/samuelleemit/>), and Harry Lu. Invive (blood sugar prediction) by [Angela Argentati](<https://www.linkedin.com/in/angelaargentati/>), [Sabeen Chawla](<http://www.linkedin.com/in/sabeenchawla>), and [Adeel Rizwan](<https://www.linkedin.com/in/adeel-r-a4232571/>). (There were lots of other great ones, but these teams gave me permission to share screenshots!)

I’ve been teaching entrepreneurship for a decade and a half, and I've seen thousands of startup ideas (some of which turned into large companies) so I have a good sense of the expectations for what a class of smart MBA students can accomplish. I would estimate that what I saw in a couple of days was an order of magnitude further along the path to a real startup than I had seen out of students working over a full semester before AI. Most of the prototypes were not just sample screens but actually had a core feature working. Ideas were far more diverse and interesting than usual. Market and customer analyses were insightful. It was really impressive. These were not yet working startups nor were they fully operational products (with a couple exceptions) — but they had shaved months and huge amounts of money and effort from the traditional process. And there was something else: most early startups need to pivot, changing direction as they learn more about what the market wants and what is technically possible. By lowering the costs of pivoting, it was much easier to explore the possibilities without being locked in or even explore multiple startups at once: you just tell the AI what you want.

I wish I could say this impressive output was the result of my brilliant teaching, but we don’t really have a great framework yet for how to use all these tools, the students largely figured it out on their own. It helped that they had some management and subject matter expertise because it turns out that the key to success was actually the last bit of the previous paragraph: telling the AI what you want. As AIs are increasingly capable of tasks that would take a human hours to do, and as evaluating those results becomes increasingly time consuming, the value of being good at delegation increases. But when should you delegate to AI?

# The Equation of Agentic Work

We actually have an answer, but it is a bit complicated. Consider three factors: First, because of the [Jagged Frontier of AI ability](<https://www.oneusefulthing.org/p/the-shape-of-ai-jaggedness-bottlenecks>), you don’t reliably know what the AI will be good or bad at on complex tasks. Second, whether the AI is good or bad, it is definitely fast. It produces work in minutes that would take many hours for a human to do. Third, it is cheap (relative to professional wages), and it doesn’t mind if you generate multiple versions and throw most of them away.

These three factors mean that deciding to delegate to AI depends on three variables:

  1. **Human Baseline Time:** how long the task would take you to do yourself

  2. **Probability of Success:** how likely the AI is to produce an output that meets your bar on a given attempt

  3. **AI Process Time:** how long it takes you to request, wait for, and evaluate an AI output




[](<https://substackcdn.com/image/fetch/$s_!6M7R!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fec5279eb-e12f-408f-8727-ffcc7b1f3ba7_2816x1536.jpeg>)

A useful mental model is that you’re trading off “doing the whole task” (**Human Baseline Time**) against “paying the overhead cost” (**AI Process Time**), possibly multiple times until you get something acceptable. The higher **Probability of Success** is, the fewer times you have to pay **AI Process Time** , and the more useful it is to turn things over to the AI. For example, consider a task that takes you an hour to do, but the AI can do it in minutes, though checking the answer takes thirty minutes. In that case, you should only give the work to the AI if **Probability of Success** is very high, otherwise you’ll spend more time generating and checking drafts than just doing it yourself. If the **Human Baseline Time** is 10 hours, though, it could be worth several hours of working with the AI, assuming that the AI can be made to do a competent job.

[](<https://substackcdn.com/image/fetch/$s_!DGBv!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F67e742b5-a332-4765-bc98-ed0c4e4f4b33_2134x948.png>)An example of a many hour Human Baseline Time prompt, with an initial AI Process Time of 30 minutes (when you can be doing something else) plus the time to check and write the prompt. If you have to make a lot of corrections, though, it isn’t worth it.

We know this equation works because this past summer, OpenAI released one of the more important papers on AI and real work, GDPval. [I have discussed it before](<https://www.oneusefulthing.org/p/giving-your-ai-a-job-interview>), but the key was that it pitted experienced human experts in diverse fields from finance to medicine to government against the latest AIs, with another set of experts working as judges. It took experts seven hours on average to do the work, so, in this case, that is the **Human Baseline Time**. The **AI Process Time** was interesting: the AI took only minutes for tasks, but it required an hour for experts to actually check the work, and, of course, prompts take time to write as well. As for **Probability of Success** , when GDPval first came out, judges gave human work the win the majority of the time, but, with the release of GPT-5.2, the balance shifted. GPT-5.2 Thinking and Pro models tied or beat human experts an average of 72% of the time.

[](<https://substackcdn.com/image/fetch/$s_!Q_JU!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F998921b0-ec16-4f41-b735-bb8c7d87b86c_1497x1137.png>)Speed and cost improvements from AI-assisted work on GDPval tasks under a “draft → review → retry if needed” workflow (relative to unaided experts at 1×, 1×). The GPT‑5.2 point is a projection using its ~72% win-or-tie rate on GDPval; other model points are from the GDPval paper. Real‑world outcomes will vary sharply by task: some tasks are “easy wins,” some are clear failures, and the hardest cases are plausible‑looking failures.

We can now calculate how many hours you would save on a seven-hour task, assuming that 72% probability of success and an hour of evaluation. If you tried every task by taking the time to prompt the AI, evaluating the answer for an hour, and then doing it yourself if the AI answer was bad, you would save 3 hours on average. Tasks the AI failed on would take longer (you wasted time prompting and reviewing!) but tasks the AI succeeded on would be much faster. But we can change the equation even more in our favor using techniques from management!

# Delegation as the new prompting

There are three things we can do to make delegating to AI more worthwhile by increasing the Probability of Success and lowering AI Process Time. We can give better instructions, setting clear goals that the AI can execute on with a higher chance of succeeding. We can get better at evaluation and feedback, so we need to make fewer attempts to get the AI to do the right thing. And we can make it easier to evaluate whether the AI is good or bad at a task without spending as much time. All of these factors are improved by subject matter expertise — an expert knows what instructions to give, they can better see when something goes wrong, and they are better at correcting it.

[](<https://substackcdn.com/image/fetch/$s_!SjMz!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8b08f126-d32d-470b-b3ff-04f6bd8182c3_2816x1536.jpeg>)

If you don’t need something specific, AI models have become incredibly capable of figuring out how to solve problems themselves. For example, I found Claude Code was able to generate an entire 1980s style adventure game with one prompt to "create an entirely original old-school Sierra style adventure game with EGA-like graphics. You should use your image agent to generate images and give me a parser. Make all puzzles interesting and solvable. Finish the game (it should take 10-15 minutes to play), don’t ask any questions. make it amazing and delightful." That’s it, the AI made everything, including the art. With two final prompts it tested the game and deployed it. You can play it yourself: [enchanted-lighthouse-game.netlify.app](<https://enchanted-lighthouse-game.netlify.app>)

[](<https://substackcdn.com/image/fetch/$s_!DrVT!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fba24a861-8568-4c96-b6ee-01f0b482794f_1293x878.jpeg>)

This is genuinely amazing, but that amazement is amplified because I didn’t need anything specific, just an adventure game that the AI was free to improvise. But real work, and real delegation, means that you have a specific output in mind, and that is where things can get tricky. How do you communicate your intention to the AI to execute on what you want, so it can use “judgement” to solve problems while still giving you the output you desire?

This problem existed long before AI and is so universal that every field has invented their own paperwork to solve it. Software developers write [Product Requirements Documents](<https://addyosmani.com/blog/good-spec/>). Film directors hand off shot lists. Architects create design intent documents. The Marines use Five Paragraph Orders (situation, mission, execution, administration, command). Consultants scope engagements with detailed deliverable specs. All of these documents work remarkably well as AI prompts for this new world of agentic work (and the AI can handle many pages of instructions at a time). The reason you can use so many formats to instruct AI is that all of these are really the same thing: attempts to get what’s in one person’s head into someone else’s actions.

When you look at what actually goes into good delegation documentation, it’s remarkably consistent: What are we trying to accomplish, and why? Where are the limits of the delegated authority? What does “done” look like? What specific outputs do I need? What interim outputs do I need to follow your progress? And what should you check before telling me you’re finished? If these are well-specified, the AI, like humans, is far more likely to do a good job.

And in figuring out how to give these instructions to the AI, it turns out you are basically reinventing management.

# Managing Agents

I find it interesting to watch as some of the most well-known software developers at the major AI labs note how their jobs are changing from mostly programming to mostly management of AI agents. Coding has always had a very organized structure, with clearly verifiable outputs (the code either works or it doesn’t) so it has been one of the first areas where AI tools have matured, and thus the first profession to feel this change. It isn’t the last.

[](<https://substackcdn.com/image/fetch/$s_!4PIq!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffd126edf-ce22-42d4-bc81-7725bfd4c9aa_1590x612.png>)

As a business school professor, I think many people have the skills they need, or can learn them, in order to work with AI agents - they are management 101 skills. If you can explain what you need, give effective feedback, and design ways of evaluating work, you are going to be able to work with agents. In many ways, at least in your area of expertise, it is much easier than trying to design clever prompts to help you get work done, as it is more like working with people. At the same time, management has always assumed scarcity: you delegate because you can’t do everything yourself, and because talent is limited and expensive. AI changes the equation. Now the “talent” is abundant and cheap. What’s scarce is knowing what to ask for.

This is why my students did so well. They weren’t AI experts. But they’d spent years learning how to scope problems in their fields of expertise, define deliverables, and recognize when a financial model or medical report was off. They had hard-earned frameworks from classes and jobs, and those frameworks became their prompts. The skills that are so often dismissed as “soft” turned out to be the hard ones.

I don’t know exactly what work looks like when everyone is a manager with an army of tireless agents. But I suspect the people who thrive will be the ones who know what good looks like — and can explain it clearly enough that even an AI can deliver it. My students figured this out in four days. Not because they were AI natives, but because they already knew how to manage. All that training, it turns out, was accidentally preparing them for exactly this moment.

[Subscribe now](<https://www.oneusefulthing.org/subscribe?>)

[Share](<https://www.oneusefulthing.org/p/management-as-ai-superpower?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

[](<https://substackcdn.com/image/fetch/$s_!ml-7!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6cbe84ef-5e39-49bb-a6e8-4d427d42b54e_2496x1696.jpeg>)
