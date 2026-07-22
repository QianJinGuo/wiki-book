---
source: rss
source_url: https://www.oneusefulthing.org/p/mass-intelligence
ingested: 2026-06-07
feed_name: One Useful Thing
source_published: 2025-08-28
sha256: c01f4653051eae489a739fb0bda4d65afccb17050fa53d9a3894d7f6ee53d4dd
---

# Mass Intelligence

More than a billion people use AI chatbots regularly. ChatGPT has over 700 million weekly users. Gemini and other leading AIs add hundreds of millions more. In my posts, I often focus on the advances that AI is making (for example, in the past few weeks, both OpenAI and Google AIs chatbots got [gold medals](<https://www.nytimes.com/2025/07/21/technology/google-ai-international-mathematics-olympiad.html>) in the International Math Olympiad), but that obscures a broader shift that's been building: we're entering an era of Mass Intelligence, where powerful AI is becoming as accessible as a Google search.

Until recently, free users of these systems (the overwhelming majority) had access only to older, smaller AI models that frequently made mistakes and had limited use for complex work. The best models, like Reasoners that can solve very hard problems and hallucinate much less often, required paying somewhere between $20 and $200 a month. And even then, you needed to know which model to pick and how to prompt it properly. But the economics and interfaces are changing rapidly, with fairly large consequences for how all of us work, learn, and think.

# Powerful AI is Getting Cheaper and Easier to Access

There have been two barriers to accessing powerful AI for most users. The first was confusion. Few people knew to select an AI model. Even fewer knew that picking o3 from a menu in ChatGPT would get them access to an excellent Reasoner AI model, while picking 4o (which seems like a higher number) would give them something far less capable. According to OpenAI, less than 7% of paying customers selected o3 on a regular basis, meaning even power users were missing out on what Reasoners could do.

Another factor was cost. Because the best models are expensive, free users were often not given access to them, or else given very limited access. Google led the way in giving some free access to its best models, but OpenAI stated that almost none of its free customers had regular access to reasoning models prior to the launch of GPT-5.

GPT-5 was supposed to solve both of these problems, which is partially why its debut was so messy and confusing. GPT-5 is actually two things. It was the overall name for a family of quite different models, from the weaker GPT-5 Nano to the powerful GPT-5 Pro. It was also the name given to the tool that picked which model to use and how much computing power the AI should use to solve your problem. When you are writing to “GPT-5” you are actually talking to a router that is supposed to automatically decide whether your problem can be solved by a smaller, faster model or needs to go to a more powerful Reasoner. 

[](<https://substackcdn.com/image/fetch/$s_!kiXa!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd1914e7d-fe26-403d-b1ea-b156065ac3ff_1632x1168.png>)When you pick ChatGPT 5 you are actually picking Auto mode, which selects among the various ChatGPT 5 models, some of which are among the best models in the world, some of which are much weaker. If you pay for access, select “GPT-5 Thinking” for almost any problem beyond a simple chat.

You could see how this was supposed to expand access to powerful AI to more users: if you just wanted to chat, GPT-5 was supposed to use its weaker specialized chat models; if you were trying to solve a math problem, GPT-5 was supposed to send you to its slower, more expensive GPT-5 Thinking model. This would save money and give more people access to the best AIs. But the rollout had issues. This practice wasn’t well explained and the router did not work well at first. The result is that one person using GPT-5 got a very smart answer while another got a bad one. Despite these issues, OpenAI reported early success. Within a few days of launch, the percentage of paying customers who had used a Reasoner went from 7% to 24% and the number of free customers using the most powerful models went from almost zero to 7%. 

Part of this change is driven by the fact that smarter models are getting dramatically more efficient to run. This graph shows how fast this trend has played out, mapping the capability of AI on the y-axis and the logarithmically decreasing costs on the x-axis. When GPT-4 came out it was around $50 to work with a million tokens (a token is roughly a word), now it costs around 14 cents per million tokens to use GPT-5 nano, a much more capable model than the original GPT-4.

[](<https://substackcdn.com/image/fetch/$s_!Kn3w!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbc777761-5ac9-4380-b78d-2216a9835b13_1886x1360.png>)The Graduate-Level Google-Proof Q&A test (GPQA) is a series of very hard multiple-choice problems designed to test advanced knowledge. non-experts with access to the internet get 34% right, PhDs with internet access get 74-81% inside their specialty. The cost per million tokens is the cost of using the model. (I gathered this data, so apologies for any errors.)

This efficiency gain isn't just financial, it's also environmental. [Google has reported that energy efficiency per prompt has improved by 33x ](<https://services.google.com/fh/files/misc/measuring_the_environmental_impact_of_delivering_ai_at_google_scale.pdf>)in the last year alone. The marginal energy used by a standard prompt from a modern LLM in 2025 [is relatively established at this point](<https://x.com/emollick/status/1959989512228208785>), from both independent tests and official announcements. It is roughly 0.0003 kWh, the same energy use as 8-10 seconds of streaming Netflix or the equivalent of a Google search in 2008 (interestingly, image creation seems to use a similar amount of energy as a text prompt)1. How much water these models use per prompt is less clear but ranges from a few drops to a fifth of a shot glass (.25mL to 5mL+), depending on the definitions of water use (here is [the low water argument](<https://andymasley.substack.com/p/an-example-of-what-i-consider-a-misleading>) and the [high water argument](<https://www.linkedin.com/posts/shaolei-ren-68557415_today-google-released-a-paper-disclosing-activity-7364343376986427392-oMhX/>)).

These improvements mean that even as AI gets more powerful, it's also becoming viable to give to more people. The marginal cost of serving each additional user has collapsed, which means more business models, like ad support, become possible. Free users can now run prompts that would have cost dollars just two years ago. This is how a billion people suddenly get access to powerful AIs: not through some grand democratization initiative, but because the economics finally make it possible.

# Powerful AI is Getting Easy to Use

Getting access to a powerful AI is not enough, people need to actually use it to get things done. Using AI well used to be a pretty challenging process which involved crafting a prompt using techniques like chain-of-thought along with learning tips and tricks to get the most out of your AI. In a recent series of experiments, however, we have discovered that [these techniques don’t really help anymore](<https://gail.wharton.upenn.edu/research-and-insights/tech-report-chain-of-thought/>). Powerful AI models are just getting better at doing what you ask them to or even figuring out what you want and going beyond what you ask (and no, [threatening ](<https://gail.wharton.upenn.edu/research-and-insights/techreport-threaten-or-tip/>)them or [being nice to them](<https://gail.wharton.upenn.edu/research-and-insights/tech-report-prompt-engineering-is-complicated-and-contingent/>) does not seem to help on average).

And it isn’t just text models that are becoming cheaper and easier to use. Google released a new image model with the code name “nano banana” and the much more boring official name Gemini 2.5 Flash Image Generator. In addition to being excellent (though better at editing images than creating new ones), it is also cheap enough that free users can access it. And, unlike previous generations of AI image generators, it follows instructions in plain language very well.

As an example of both its power and ease of use, I uploaded an iconic (and copyright free) image of the Apollo 11 astronauts and a random picture of a sparkly tuxedo and gave it the simplest prompts: “ _dress Neil Armstrong on the left in this tuxedo_ ”

[](<https://substackcdn.com/image/fetch/$s_!zmP2!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6b305085-662d-4190-bea2-ad4fd8b76fa9_1896x828.png>)

Here is what it gave me a few seconds later:

[](<https://substackcdn.com/image/fetch/$s_!dLl6!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F80f4d0d5-9a57-4444-9c07-c471f2a0abc5_1024x1024.png>)

There are issues that someone with an expert eye would spot, but it is still impressive to see the realistic folds of the tuxedo and how it is blended into the scene (the NASA pin on the lapel was a nice touch). There is still a lot of randomness in the process that makes AI image editing unsuitable for many professional applications, but for most people, this represents a huge leap in not just what they can do, but how easy it is to do it.

And we can go further: “ _now show a photograph where neil armstrong and buzz aldrin, in the same outfits, are sitting in their seats in a modern airplane, neil looks relaxed and is leaning back, playing a trumpet, buzz seems nervous and is holding a hamburger, in the middle seat is a realistic otter sitting in a seat and using a laptop._ ”

[](<https://substackcdn.com/image/fetch/$s_!t7UQ!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe3fce0d2-f57d-48a0-b267-a16fd4cd8a55_1024x1024.png>)

This is many things: A pretty impressive output from the AI (look at the expressions, and how it preserved Buzz’s ring and Neil’s lapel pin). A distortion of a famous moment in history made possible by AI. And a potential warning about how weird things are going to get when these sorts of technologies are used widely.

# The Weirdness of Mass Intelligence

When powerful AI is in the hands of a billion people, a lot of things are going to happen at once. A lot of things are already happening at once.

Some people have [intense relationships](<https://www.reddit.com/r/MyBoyfriendIsAI/>) with AI models while other people are being [saved from loneliness.](<https://www.nature.com/articles/s44184-023-00047-6>) AI models may be[ causing mental breakdowns](<https://www.psychologytoday.com/us/blog/urban-survival/202507/the-emerging-problem-of-ai-psychosis>) and [dangerous behavior](<https://www.acpjournals.org/doi/epdf/10.7326/aimcc.2024.1260>) for some while being [used to diagnose the diseases of others](<https://www.yahoo.com/news/chatgpt-uncovers-hidden-cancer-saves-215135629.html>). It is being used to [write obituaries](<https://www.theatlantic.com/technology/archive/2025/06/ai-obituaries-chatgpt/683096/>) and [create scriptures](<https://www.vox.com/future-perfect/440950/ai-chatgpt-bible-religion-spiritual-buddhism>) and cheat on homework and launch new ventures and thousands of other unexpected uses. These uses, and both the problems and benefits, are likely to only multiply as AI systems get more powerful.

And while Google's AI image generator has guardrails to limit misuse, as well as invisible watermarks to identify AI images, I expect much less restrictive AI image generators will likely get close to nano banana in quality in the coming months.

The AI companies (whether you believe their commitments to safety or not) seem to be [as unable to absorb all of this](<https://x.com/sama/status/1953953990372471148>) as the rest of us are. When a billion people have access to advanced AI, we've entered what we might call the era of Mass Intelligence. Every institution we have — schools, hospitals, courts, companies, governments — was built for a world where intelligence was scarce and expensive. Now every profession, every institution, every community has to figure out how to thrive with Mass Intelligence. How do we harness a billion people using AI while managing the chaos that comes with it? How do we rebuild trust when anyone can fabricate anything? How do we preserve what's valuable about human expertise while democratizing access to knowledge?

So here we are. Powerful AI is cheap enough to give away, easy enough that you don't need a manual, and capable enough to outperform humans at a range of intellectual tasks. A flood of opportunities and problems are about to show up in classrooms, courtrooms, and boardrooms around the world. The Mass Intelligence era is what happens when you give a billion people access to an unprecedented set of tools and see what they do with it. We are about to find out what that is like.

[Subscribe now](<https://www.oneusefulthing.org/subscribe?>)

[Share](<https://www.oneusefulthing.org/p/mass-intelligence?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

[](<https://substackcdn.com/image/fetch/$s_!YEXj!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1cec29eb-e93d-4e77-9ca2-2ebf86d7002c_1376x864.png>)

1

This is the energy required to answer a standard prompt. It does not take into account the energy needed to train AI models, which is a one-time process that is very energy intensive. We do not know how much energy is used to create a modern model, but it was estimated that training GPT-4 took a little above 500,000 kWh, about 18 hours of a Boeing 737 in flight.
