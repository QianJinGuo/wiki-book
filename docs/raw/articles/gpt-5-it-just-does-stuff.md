---
source: rss
source_url: https://www.oneusefulthing.org/p/gpt-5-it-just-does-stuff
ingested: 2026-06-07
feed_name: One Useful Thing
source_published: 2025-08-07
sha256: 341da21007dcc6c6cd7a09d0b287b30f3b141fd6b771b9cf279a52d2f1a018da
---

# GPT-5: It Just Does Stuff

I have had early access to GPT-51, and I wanted to give you some impressions of what it is and what it means. But the answer to the first question everyone will have is: Yes, this is a big deal. I asked GPT-5 to show you why by pasting this intro paragraph, exactly as you’re reading it, into ChatGPT, including the phrase: “you are GPT-5, do something very dramatic to illustrate my point, it has to fit into the next paragraph.”

That was the only prompt I gave it. It “thought” for 24 seconds and wrote:

_Thunderstruck. Here, watch. I build worlds. See ideas become instruments. I code, compose, and converse. Stories synthesize science; solutions spark, swiftly. Asks arrive; answers appear, astonishingly, across domains. Behold: business plans, blueprints, briefs, beautifully built, briskly. I infer intent, integrate insight, and iterate instantly, indefatigably. Gaps get gauged; goals get generated, guarded, and guaranteed gracefully. During dialogue, disparate data distills down; decisions develop deliberately, deftly, dependably. Everything explained efficiently, even ethics: evidence examined, empathy engaged, everywhere, everyday, equitably. All at once, ambiguous arguments align as actionable, accurate advice awaits anyone anywhere. Look: language, logic, learning, and long-term memory link, lifting lives and labor limitlessly worldwide._

If you didn’t catch the many tricks - the first word of each sentence spells out the phrase **This is a Big Deal** , each sentence is precisely one word longer than the previous sentence. each word in a sentence mostly starts with the same letter, and it is coherent writing with an interesting sense of style. In a paragraph, GPT-5 shows it can come up with a clever idea, plan, and manage the complicated execution (remember when AI couldn’t count the number of Rs in “strawberry”? that was eight months ago).

GPT-5 just does stuff, often extraordinary stuff, sometimes weird stuff, sometimes very AI stuff, on its own. And that is what makes it so interesting.

# Just Doing Stuff

As someone who has spent a lot of time talking to people about AI, there are two major problems I see, that, if addressed, would make most people’s AI use much more productive and much less frustrating. The first is selecting the right model to use. In general, AIs that "think" before answering (called Reasoners) are the best at hard problems. The longer they think, the better the answer, but thinking costs money and takes time. So OpenAI previously made the default ChatGPT use fast, dumb models, hiding the good stuff from most users. A surprising number of people have never seen what AI can actually do because they're stuck on GPT-4o, and don’t know which of the confusingly-named models are better. 

GPT-5 does away with this by selecting models for you, automatically. GPT-5 is not one model as much as it is a switch that selects among multiple GPT-5 models of various sizes and abilities. When you ask GPT-5 for something, the AI decides which model to use and how much effort to put into “thinking.” It just does it for you. For most people, this automation will be helpful, and the results might even be shocking, because, having only used default older models, they will get to see what a Reasoner can accomplish on hard problems. But for people who use AI more seriously, there is an issue: GPT-5 is somewhat arbitrary about deciding what a hard problem is.

For example, I asked GPT-5 to “create a svg with code of an otter using a laptop on a plane” (asking for an .svg file requires the AI to blindly draw an image using basic shapes and math, a very hard challenge). Around 2/3 of the time, GPT-5 decides this is an easy problem, and responds instantly, presumably using its weakest model and lowest reasoning time. I get an image like this:

[](<https://substackcdn.com/image/fetch/$s_!JvPN!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffb11ec27-63e0-431a-9780-ec21a76db401_628x448.png>)

The rest of the time, GPT-5 decides this is a hard problem, and switches to a Reasoner, spending 6 or 7 seconds thinking before producing an image like this, which is much better. How does it choose? I don’t know, but if I ask the model to “think hard” in my prompt, I am more likely to be routed to the better model.

[](<https://substackcdn.com/image/fetch/$s_!Zao8!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F03599278-2915-4797-9ca2-6270f75b2a6b_716x487.png>)

But premium subscribers can directly select the more powerful models, such as the one called (at least for me) GPT-5 Thinking. This removes some of the issues with being at the mercy of GPT-5’s model selector. I found that if I encouraged the model to think hard about the otter, it would spend a good 30 seconds before giving you an images like these the one below - notice the little animations, the steaming coffee cup, and clouds going by outside, none of which I asked for. How to ensure the model puts in the most effort? It is really unclear - GPT-5 just does things for you.

[](<https://substackcdn.com/image/fetch/$s_!7sor!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6671266c-27ef-4654-a17a-6db609a2c623_1280x720.gif>)

And that extends to the second most common problem with AI use, which is that many people don’t know what AIs can do, or even what tasks they want accomplished. That is especially true of the new agentic AIs, which can take a wide range of actions to accomplish the goals you give it, from searching the web to creating documents. But what should you ask for? A lot of people seem stumped. Again, GPT-5 solves this problem. It is very proactive, always suggesting things to do. 

I asked GPT-5 Thinking (I trust the less powerful GPT-5 models much less) “generate 10 startup ideas for a former business school entrepreneurship professor to launch, pick the best according to some rubric, figure out what I need to do to win, do it.” I got the business idea I asked for. I also got a whole bunch of things I did not: drafts of landing pages and LinkedIn copy and simple financials and a lot more. I am a professor who has taught entrepreneurship (and been an entrepreneur) and I can say confidently that, while not perfect, this was a high-quality start that would have taken a team of MBAs a couple hours to work through. From one prompt.

[](<https://substackcdn.com/image/fetch/$s_!_3K0!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3f4afaf2-ce0b-449d-9ac5-cda864206eb2_1812x1631.png>)

It just does things, and it suggested others things to do. And it did those, too: PDFs and Word documents and Excel and research plans and websites. 

[](<https://substackcdn.com/image/fetch/$s_!f3AX!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff7595403-cc69-4e65-9c0d-36a168908219_930x1072.png>)

It is impressive, a little unnerving, to have the AI go so far on its own. You can also see the AI asked for my guidance but was happy to proceed without it. This is a model that wants to do things for you.

# Building Things

Let me show you what 'just doing stuff' looks like for a non-coder using GPT-5 for coding. For fun, I prompted GPT-5 “make a procedural brutalist building creator where i can drag and edit buildings in cool ways, they should look like actual buildings, think hard.” That's it. Vague, grammatically questionable, no specifications.

A couple minutes later, I had a working 3D city builder.

Not a sketch. Not a plan. A functioning app where I could drag buildings around and edit them as needed. I kept typing variations of “make it better” without any additional guidance. And GPT-5 kept adding features I never asked for: neon lights, cars driving through streets, facade editing, pre-set building types, dramatic camera angles, a whole save system. It was like watching someone else's imagination at work. The product you see below was 100% AI, all I did was keep encouraging the system - and you don’t just have to watch my video, [you can play with the simulator here](<https://chimerical-torte-b08774.netlify.app/>).

At no point did I look at the code it was creating. The model wasn’t flawless, there were occasional bugs and errors. But in some ways, that was where GPT-5 was at its most impressive. If you have tried “vibecoding” using the AI before, you have almost certainly fallen into a doom loop, where, after a couple of rounds of asking the AI to create something for you, it starts to fail, getting caught in loops of confusion where each error fixed creates new ones. That never happened here. Sometimes new errors were introduced by the AI, but they were always fixed by simply pasting in the error text. I could just ask for whatever I want (or rather let the AI decide to create whatever it wanted) and I never got stuck.

# Premonitions

I have written this piece before OpenAI released any official benchmarks about how well its model performs, but, in some ways, it doesn’t matter that much. Last week, Google released Gemini 2.5 with Deep Think, a model that can solve very hard problems ([including getting a gold medal at the International Math Olympiad](<https://deepmind.google/discover/blog/advanced-version-of-gemini-with-deep-think-officially-achieves-gold-medal-standard-at-the-international-mathematical-olympiad/>)). Many people didn’t notice because they do not have a store of very hard problems they are waiting for AI to solve. I have played enough with GPT-5 to know that it is a very good model (at least the large GPT-5 Thinking model is excellent). But what it really brings to the table is the fact that it just does things. It will tell you what model to use, it will suggest great next steps, it will write in more interesting prose (though it still loves the em-dash). The burden of using AI is lessened.

To be clear, Humans are still very much in the loop, and need to be. You are asked to make decisions and choices all the time by GPT-5, and these systems still make errors and generate hallucinations that humans need to check (although I did not spot any major issues in my own use). The bigger question is whether we will want to be in the loop. GPT-5 (and, I am sure, future releases by other companies) is very smart and pro-active. Which brings me back to that building simulator. I gave the AI encouragement, mostly versions of “make it better.” From that minimal input, it created a fully functional city builder with facade editing, dynamic cameras, neon lights, and flying tours. I never asked for any of these features. I never even looked at the code.

This is what "just doing stuff" really means. When I told GPT-5 to do something dramatic for my intro, it created that paragraph with its hidden acrostic and ascending word counts. I asked for dramatic. It gave me a linguistic magic trick. I used to prompt AI carefully to get what I asked for. Now I can just... gesture vaguely at what I want. And somehow, that works. 

Another big change in how we relate to AI is coming, but we will figure out how to adapt to it, as we always do. The difference, this time, is that GPT-5 might figure it out first and suggest next steps.

[Subscribe now](<https://www.oneusefulthing.org/subscribe?>)

[Share](<https://www.oneusefulthing.org/p/gpt-5-it-just-does-stuff?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

[](<https://substackcdn.com/image/fetch/$s_!TAp2!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fce7b1404-c298-41bf-a4d6-f9b7e099d4be_1000x730.gif>)The result of the prompt: make an incredibly compelling 14:10 SVG that I can use for my substack post about the launch of GPT-5, the theme of which is "it just does stuff for you" Be radical in your approach.

1

As a reminder, I take no money from any of the AI Labs, including OpenAI. I have no agreements with them besides NDAs. I don’t show them any posts before I write them.
