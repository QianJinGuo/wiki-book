---
sha256: ec52c33880b0159e38333f9efb742c12ff265985729e0f1138b1aab57cfeb1c2
source: rss
source_url: https://www.oneusefulthing.org/p/the-twilight-of-the-chatbots
ingested: 2026-07-02
feed_name: One Useful Thing
source_published: 2026-06-30
---

# The twilight of the chatbots

If you feel like things are accelerating in AI, you are probably right. Better AI models from the leading American AI labs have been releasing more quickly than ever (though government interventions stopped access temporarily to two of the most powerful models, Claude Fable and GPT-5.6). 

[](<https://substackcdn.com/image/fetch/$s_!XxGz!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F586bd72d-edfe-4be3-bfc8-c301b776b0fd_2850x1380.png>)

But it isn't just release timing. The evidence points to accelerating capability gains as well (though the frontier stays jagged, and AIs remain weak in many places). This is especially obvious when we look at the ability of AIs to do real work. There are a few good assessments that try to measure how much human work AIs can do. Two of the most famous, from [METR ](<https://metr.org/time-horizons/>)and the UK’s official government [AI Security Institute](<https://www.aisi.gov.uk/blog/how-fast-is-autonomous-ai-cyber-capability-advancing>), estimate the amount of human programmer hours’ worth of effort the AI can do with a single prompt. GDPval compares human experts in many fields to AI performance using professional judges. They are all increasing at a better than exponential rate.

[](<https://substackcdn.com/image/fetch/$s_!wZP5!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4f3020ea-05d8-4bb1-894d-dd02f1e55966_6120x1106.png>)

Another organization doing similar experiments, [Epoch](<https://epoch.ai/files/MirrorCode.pdf>), recently found Opus 4.7, working on its own for 14 hours, was able to build a software package that would take 2-17 weeks of human engineering work (it cost $251 in tokens). Again, AI systems cannot pass every test, nor are they always cheap to run, but they are definitely improving at a very rapid rate. In my own [experiments](<https://www.oneusefulthing.org/p/what-it-feels-like-to-work-with-mythos>), I found Fable was able to work autonomously for 9 hours to execute on very complex software projects that would have taken a team well over a week to do.

[](<https://substackcdn.com/image/fetch/$s_!gNml!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F41adbcf7-6d9c-48cf-8a2f-967cb8cc920d_899x445.png>)

So far, I have focused on the frontier models, those with the highest “intelligence.” They are made by three American companies — Anthropic, OpenAI, and Google (though it has been a while since Google has released a new model). But there is a second set of near-frontier AI models that typically lag 6-12 months behind the frontier, all of which are from China. These are open weights models, which means that anyone can use or modify them after release (as opposed to the frontier models which are proprietary). That makes them quite cheap to operate. They, too, are climbing up an exponential improvement curve, though lagging the American closed models. You can see this in my graph of AI performance in a test called [AA-Briefcase](<https://artificialanalysis.ai/evaluations/aa-briefcase>), which simulates a complex multi-week consulting engagement where AI has to do many kinds of analysis. The open-weights Chinese models (other countries produce open weights models, but none are near the frontier) are on their own exponential curve, behind closed US models

[](<https://substackcdn.com/image/fetch/$s_!_02e!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F91733430-15b7-490a-9f2b-ca758de84665_1133x640.jpeg>)

But abstract graphs only get you so far, and they can hide how jagged the frontier is (and also the fact that the open weights models, while very impressive, do not always perform as well as their benchmarks would indicate). To get real insight, you need to try using AI for different use cases and rigorously assess how good they are in the areas that matter to you. As a fun example, I created a test where AIs have to build an interactive simulation of a harbor evolving over time. [You can play with all the result here.](<https://ai-harbor-town-gallery.netlify.app/>) I think it gives an interesting perspective on how much models can differ from each other in areas like design, stylistic approach, and even judgement. As systems do ever longer tasks, these hard-to-benchmark factors become more important.

[](<https://substackcdn.com/image/fetch/$s_!RuBh!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe0dd6cc6-66d4-4315-a7ff-be0bab878685_2400x2400.png>)

# The way we use AI is changing

As AIs can do longer and longer tasks, the way people are using AI is changing. Until recently, the dominant way to use AI was as a co-intelligence. You would ask the AI to do something, check the results, and then ask for it to do the next step of your job. By careful prompting and human attention, you could guide AIs to do complex and long-term tasks.

This approach to using AI is still common and useful, but, increasingly, it is not the way AI is being used for valuable work. Long-running, smart, and self-correcting AI systems do not need constant human intervention, and they require a different way of working (this is also the subject of my upcoming book, [Co-Existence, which you might want to pre-order here](<https://co-existence.ai/>)). And, as opposed to chatbots, agents come with extra machinery: harnesses that give the AI access to tools and an environment to act in, and apps built for agents like Claude Code or OpenAI's Codex. As a result, the already increasing ability of AI models can be improved still further by a good harness or app.

So work is increasingly about assigning work to agents, rather than working together with chatbots. A [joint study](<https://cdn.openai.com/pdf/5d1e1489-21c0-43e4-9d42-f87efdbf0082/the-shift-to-agentic-ai-evidence-from-codex.pdf>) by OpenAI and academic economists shows how quickly this is happening inside their own organization. Critically, it isn’t just coders who are using agents. Legal, HR, and other non-tech functions have adopted agents at nearly the same rate. OpenAI may be a sort of canary in the coal mine for what will happen elsewhere in work.

[](<https://substackcdn.com/image/fetch/$s_!YFgC!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc447cc81-84c8-48f6-8ff1-3446286f41ee_2027x517.png>)

Increasingly, work at OpenAI looks like managing AI. A quarter of OpenAI workers have at least four agents running at one time every week. And, as coding is done by AIs in specialized harnesses and apps, other roles start to become coders of a sort. And they are good at it. A separate [study of Claude Code users](<https://cdn.sanity.io/files/4zrzovbb/website/b93c7465925dc052b9102209b29b58f11df4fe55.pdf>) found that software engineers had a similar success rate to other professions when actually using Claude code on coding tasks.

[](<https://substackcdn.com/image/fetch/$s_!pEXs!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa3964b06-2073-4885-8a87-3c214e254639_1370x966.jpeg>)

What actually mattered was not the profession of the user, but their expertise. The more domain experience someone had, the more successful they were in using Claude Code in that domain. And, even more interestingly, the more useful output they got from Claude from each prompt.

[](<https://substackcdn.com/image/fetch/$s_!NLCW!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0a8b9ada-eb63-45f4-b739-b602704cfd7c_1579x1094.png>)

We are moving from a world where non-experts use chatbots to fill in gaps to one in which experts use agents to get work done. And the best way to use agents is to[ think of yourself as a manager.](<https://www.oneusefulthing.org/p/management-as-ai-superpower>)

# A moment in time

Being on an exponential means each change over a fixed window is larger than the one before it. If your organization wrote an AI plan any time before the winter of 2025, it described a system that could do a couple of hours of work with a fairly high error rate. A few months later, you can get sixteen hours or more of work from a single prompt. This is why AI keeps feeling like it is making leaps, even though it is a curve on a graph, we keep experiencing a steady doubling of capability as a series of shocks. We are very bad at feeling exponentials from the inside, and we are currently inside one.

[](<https://substackcdn.com/image/fetch/$s_!ooRI!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F999ef6f2-a277-4626-8234-dfa70e896e2b_1568x844.png>)

I think this also explains the turbulence around AI better than the usual stories about hype. AI is not capable of being a real cybersecurity threat until suddenly it is, causing sudden and improvised policy changes at the highest level of government. Markets discount whether AI might threaten to undermine a business model until suddenly it can, leading to massive swings in stocks. These lurches these get read as signs of an immature field that will eventually settle into something stable. I don’t think it is going to settle anytime soon. The instability is what happens when institutions that move at the speed of people (or worse, committees) try to track a capability curve that is very much not human in nature. And as long as we are on some sort of exponential, and for as long as it lasts, the gap only widens.

[Subscribe now](<https://www.oneusefulthing.org/subscribe?>)

[Share](<https://www.oneusefulthing.org/p/the-twilight-of-the-chatbots?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

[](<https://substackcdn.com/image/fetch/$s_!CQgP!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8215c2ac-ba16-483d-a53d-2957f2add233_1376x864.png>)
