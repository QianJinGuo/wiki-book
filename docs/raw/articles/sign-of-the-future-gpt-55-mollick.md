---
source: rss
source_url: https://www.oneusefulthing.org/p/sign-of-the-future-gpt-55
ingested: 2026-06-08
sha256: 90f46f0cfd4027afd0e4da5a10c533ed8c99429d00cdd3c5856ac2fd903f17c2
feed_name: One Useful Thing
source_published: 2026-04-23
---

# Sign of the future: GPT-5.5

I had early access to GPT-5.51, and I think it is a big deal. It is a big deal because it indicates that we are not done with the rapid improvement in AI. It is also a big deal because it is just plain good. And it is a big deal because even with all of this, the frontier of AI ability remains jagged.

It is increasingly hard to quickly demonstrate each generational change as AI has gotten better, since a lot of the old things AI was bad at, like math or counting letters in words, are now trivial for AI to do. So, I will give you the complicated details, but first, a simple example that I think is a good illustration. What AI models are best at is coding, so I gave a coding challenge to AIs ranging from OpenAI’s first reasoning model, o3 (released a year and a week ago!) to the current best open weights model (Kimi K2.6) to the new GPT-5.5 Pro: “build me a procedurally generated 3D simulation showing the evolution of a harbor town from 3000 BCE to 3000 AD, it should look beautiful and allow me to have some control over it.”

Then I [posted every answer to this gallery](<https://69e8dfc625a99f19144c86bf--hg-20f7d1a3ce.netlify.app/#openai-o3>) so you can experiment with them (actually, I had GPT-5.5 Codex build the gallery page for me). You should play with them to feel the difference, but you can see a few of these examples below. In addition to being better along all the other dimensions, only GPT-5.5 Pro actually modelled an evolving town, rather than just generating new building replacements over time. GPT-5.5 Pro is also much faster than its previous iteration: GPT-5.4 Pro took 33 minutes to complete the task, GPT-5.5 Pro took 20.

# Models, Apps, and Harnesses

I have been encouraging you to think about AI not as a single thing, but as a set of three interlinked concepts. You need to consider **models** , like Opus 4.7, Gemini 3.1, or (now) GPT-5.5. You also want to pay attention to **apps** , which are the products you actually use to talk to a model, and which let models do real work for you. The most common app is the website for each of these models: chatgpt.com, claude.ai, gemini.google.com. But, increasingly, desktop applications like Claude Code, Claude Cowork, and OpenAI Codex are becoming the most useful apps for AI. Finally, there are **harnesses** , the tools that an AI can use and how the AI models are hooked up to these tools. Tools allow the AI to control your computer, write code, do research, and make images.

OpenAI has made advances in all three areas. On the model front, GPT-5.5 is a powerful family of models, with GPT-5.5 Pro (accessible only on the website) the most competent. There have also been major advances recently in apps, with OpenAI’s Codex increasingly following the path of the excellent Claude Code and making an accessible and useful desktop application. Finally, there are harnesses and the tools they can use. There have been a lot of new harness improvements, but one of the most interesting is from OpenAI, which has a new image model

This new model can now render high-quality text and create almost any picture you can describe. Long-time readers know about my [Otter Test](<https://www.oneusefulthing.org/p/the-recent-history-of-ai-in-32-otters>), which asks the AI to make an image of an otter on a plane using wifi. Rather than describe it again, let’s let the new image model (sometimes called GPT-imagegen-2) explain it for me: “a photo of an otter scientist demonstrating the results of Ethan Mollick’s otter test, which shows how well an AI image maker can make images of an otter sitting on an airplane using wifi”

[](<https://substackcdn.com/image/fetch/$s_!yClN!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd052e0ae-5993-4dab-b51a-59504f85d4ac_1448x1086.jpeg>)

Maybe you want to see the academic paper about it? “Show me the first page of the academic paper on the Otter test, well-formatted, sitting on a desk” (feel free to zoom in on the text)

[](<https://substackcdn.com/image/fetch/$s_!EIqx!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2e9f0c7b-c9ad-426e-aa0d-67907d83e914_1448x1086.png>)

Or maybe we should just make it art? “now show an elaborate art gallery, every image on the walls is an otter on an airplane using a laptop, in the styles of Klimt and Rothko and Matisse and Monet and Picasso and Titian and Rembrandt and O’Keefe. There should be readable labels below each one.” (This is worth zooming in on)

[](<https://substackcdn.com/image/fetch/$s_!I-g3!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F14e71374-9b3a-465d-8b8d-ba09b65737c4_1448x1086.jpeg>)

All of this is very cool, and would have been impossible a few months ago, but it is useful as well. An image generator that can make detailed text and images can be used to make PowerPoint slides or product mockups or example websites or anything else you ask for. But this is just one tool, and the real magic happens when you combine harnesses, apps, and models on a real problem. Here's one I've been procrastinating about for a decade.

# Bringing it together

I am an academic, and a lot of my non-AI work, especially in the early 2010s, focused on crowdfunding. I have hundreds of anonymized data files on the topic that I have collected from surveys and analysis and research work, a mix of STATA, CSV, XLS and Word files that I never got around to writing a paper about. I wanted to see how far GPT-5.5 could get with this information. So, I used Codex powered by GPT-5.5 and asked: “Help me sort [the data] out and generate a new hypothesis that might be interesting and test it in sophisticated ways and write an academic paper.” I also asked it to include a literature review and formatting. The results were very impressive, especially after I asked GPT-5.5 Pro to comment on the paper and fed those results back into Codex. [You can read the results here](<https://drive.google.com/file/d/1ahtmtBYlFkd8QmmyiNVNnq_SoOVb_JxH/view?usp=sharing>). It isn’t perfect, but that is no longer because there are obvious errors: the literature review is all real, as are the statistics. Instead, it is because, as an expert, I think the hypothesis is not that interesting and there are some standard concerns about causation, even though the AI used very sophisticated statistical methods to try and address them. In short, I would have been very happy if this paper was the outcome of a 2nd year PhD project. And I just gave it four prompts, without ever touching the text myself.

[](<https://substackcdn.com/image/fetch/$s_!Nrfp!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7a876f9f-9be0-472a-b1c0-027b3035690e_3157x1294.png>)

We can bring harnesses and apps and models together another way as well. I asked Codex to create an entirely new tabletop roleplaying game, basically its own version of Dungeons and Dragons in a fantasy world of its own invention, full of all of the tables and rules you need to play. I also asked it to simulate players experiencing the game and revise the rules based on what it found. [As you can see, the AI complied, including laying out an attractive 101 page PDF and illustrating it using its image generator.](<https://drive.google.com/file/d/10QKnfjJaWHxsTu4fo_dgMU6pAJXxuw3t/view?usp=sharing>)

[](<https://substackcdn.com/image/fetch/$s_!eiPp!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F40ee48a2-ad74-4183-8180-c9857bac1c72_4415x1400.png>)

In addition to being technically neat, there is a lot to like about the actual content. The setting is interesting and novel, and the rules appear to make sense, drawing on existing game patterns while adding unique elements. However, a closer inspection also reveals the jagged frontier of AI ability is not entirely gone. Every generation of AI models has struggled with actually building long-form fiction. If you are a frequent reader of AI writing you see the same problems here: a love of the uncanny; overly complex ideas that do not fully pay off; weird metaphors (“weather and architecture are the same argument at different speeds”); too many ornate sentences (“the holy things that surface when a sea forgets it was once a road,” is cool once, an entire book of that is exhausting); dialogue where every character speaks in the same clipped tone; and the name “Mara.” So, even amongst all the amazing technical progress, there are still rough edges.

GPT-5.5 shows us that the models keep getting smarter, the apps keep getting more capable, and the harnesses keep getting better, making them ever more effective at solving real problems. I can get a near PhD-quality paper from four prompts or a playable roleplaying game, illustrated and “playtested,” from one. But the fiction is still flat and the hypotheses are sometimes uninteresting even when the statistics are sound. But still. A year ago, none of this was close, and, with the latest releases, capability gains appear to be accelerating.

GPT-5.5 is clearly not the end of this process, but it is a noteworthy step along the way. I have been writing this newsletter for over three years now, and the pattern has not changed: every few months a new model arrives. I run my tests and something that was impossible becomes easy, while the size of the leaps grows each new release cycle. The jagged frontier is still there. It is just much further out than it used to be.

[Subscribe now](<https://www.oneusefulthing.org/subscribe?>)

[Share](<https://www.oneusefulthing.org/p/sign-of-the-future-gpt-55?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

[](<https://substackcdn.com/image/fetch/$s_!hesI!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2c591570-ee4a-4107-a9d1-b167d3f4a64a_1484x1060.png>)This is how GPT-5.5 chose to illustrate this piece, and who am I to argue?

1

I take no money from OpenAI or any other AI lab, and OpenAI has not seen this post in advance. Also, I don’t know all the details of the launch at the time I am writing this, so I apologize for any errors.
