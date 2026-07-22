---
source: rss
source_url: https://www.oneusefulthing.org/p/a-guide-to-which-ai-to-use-in-the
ingested: 2026-06-07
feed_name: One Useful Thing
source_published: 2026-02-18
sha256: 7c8b29acca37763c21a38d3b05a53237ae51b54187957b23400531c80b728097
---

# A Guide to Which AI to Use in the Agentic Era

I have written eight of these guides since ChatGPT came out, but this version represents a very large break with the past, because what it means to “use AI” has changed dramatically. Until a few months ago, for the vast majority of people, “using AI” meant talking to a chatbot in a back-and-forth conversation. But over the past few months, it has become practical to use AI as an agent: you can assign them to a task and they do them, using tools as appropriate. Because of this change, you have to consider three things when deciding what AI to use: Models, Apps, and Harnesses.

[](<https://substackcdn.com/image/fetch/$s_!0VjC!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F59cd7383-bdba-4322-8714-006f0157e0e1_4582x1337.png>)The exact same model, Claude Opus 4.6, asked the exact same question, “Compare ChatGPT and Claude and Gemini” in three different apps and harnesses. With no harness the information is out of date, on the Claude.ai site I get updated information and verifiable sources, using Claude Cowork, I get a sophisticated analysis and well-formatted head-to-head comparisons

**Models** are the underlying AI brains, and the big three are GPT-5.2/5.3, Claude Opus 4.6, and Gemini 3 Pro (the companies are releasing new models much more rapidly than the past, so version numbers may change in the coming weeks). These are what determine how smart the system is, how well it reasons, how good it is at writing or coding or analyzing a spreadsheet, and how well it can see images or create them. Models are what the benchmarks measure and what the AI companies race to improve. When people say “Claude is better at writing” or “ChatGPT is better at math,” they’re talking about models.

**Apps** are the products you actually use to talk to a model, and which let models do real work for you. The most common app is the website for each of these models: chatgpt.com, claude.ai, gemini.google.com (or else their equivalent application on your phone). Increasingly, there are other apps made by each of these AI companies as well, including coding tools like OpenAI Codex or [Claude Code,](<https://www.oneusefulthing.org/p/claude-code-and-what-comes-next>) and desktop tools like Claude Cowork. 

**Harnesses** are what let the power of AI models do real work, like a horse harness takes the raw power of the horse and lets it pull a cart or plow. A harness is a system that lets the AI use tools, take actions, and complete multi-step tasks on its own. Apps come with a harness. Claude on the website has a harness that lets Claude 4.6 Opus do web searches and write code but also has instructions about how to approach various problems like creating spreadsheets or doing graphic design work. Claude Code has an even more extensive harness: it gives Claude 4.6 Opus a virtual computer, a web browser, a code terminal, and the ability to string these together to actually do stuff like researching, building, and testing your new website from scratch. Manus (recently acquired by Meta) was essentially a standalone harness that could wrap around multiple models. OpenClaw, which made big news recently, is mostly a harness that allows you to use any AI model locally on your computer. 

Until recently, you didn’t have to know this. The model _was_ the product, the app was the website, and the harness was minimal. You typed, it responded, you typed again. Now the same model can behave very differently depending on what harness it’s operating in. Claude Opus 4.6 talking to you in a chat window is a very different experience from Claude Opus 4.6 operating inside Claude Code, autonomously writing and testing software for hours at a stretch. GPT-5.2 answering a question is a very different experience from GPT-5.2 Thinking navigating websites and building you a slide deck.

It means that the question “which AI should I use?” has gotten harder to answer, because the answer now depends on what you’re trying to do with it. So let me walk through the landscape.

## The Models Right Now

The top models are remarkably close in overall capability and are generally “smarter” and make fewer errors than ever. But, if you want to use an advanced AI seriously, you’ll need to pay at least $20 a month (though some areas of the world have alternate plans that charge less). Those $20 get you two things: a choice of which model to use and the ability to use the more advanced frontier models and apps. I wish I could tell you the free models currently available are as good as the paid models, but they are not. The free models are all optimized for chat, rather than accuracy, so they are very fast and often more fun to talk to, but much less accurate and capable. Often, when someone posts an example of an AI doing something stupid, it is because they are either using the free models or because they have not selected a smarter model to work with.

The big three frontier models are [Claude Opus 4.6 ](<https://claude.ai/>)from Anthropic, Google’s [Gemini 3.0 Pro](<https://gemini.google.com/>), and OpenAI’s [ChatGPT 5.2 Thinking](<https://chatgpt.com/>). With all of the options, you get access to top-of-the-line AI models with a voice mode, the ability to see images and documents, the ability to execute code, good mobile apps, and the ability to create images and video (Claude lacks here, however). They all have different personalities and strengths and weaknesses, but for most people, just selecting the one they like best will suffice. For now, the other companies in this space have fallen behind, whether in models or in apps and harnesses, though some users may still have reasons for picking them.

[](<https://substackcdn.com/image/fetch/$s_!uPZ-!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F58559981-9fb2-4a07-b3e6-b3d0d73914e8_1205x428.png>)This is only a slight exaggeration - for casual chats where being right doesn’t matter, you can use smaller models, otherwise please pick advanced models!

When you are using any AI app (more on those shortly), including phone apps or websites, **the single most important thing you can do is pick the right model,** which the AI companies do not make easy. If you are just chatting, the default models are fine, if you want to do real work, they are not. For ChatGPT, no matter whether you use the free or pay version, the default model you are given is “ChatGPT 5.2”. The issue is that GPT-5.2 is not one model, it is many, from the very weak GPT-5.2 mini to the very good GPT-5.2 Thinking to the extremely powerful GPT-5.2 Pro. When you select GPT-5.2, what you are really getting is “auto” mode, where the AI decides which model to use, often a less powerful one. By paying, you get to decide which model to use, and, to further complicate things, you can also select how hard the model “thinks” about the answer. For anything complex, I always manually select **GPT-5.2 Thinking Extended** (on the $20 plan) or **GPT-5.2 Thinking Heavy** (on more expensive plans). For a really hard problem that requires a lot of thinking, you can pick GPT-5.2 Pro, the strongest model, which is only available at a higher cost tier.

For Gemini, there are three options: Gemini 3 Flash, Gemini 3 Thinking, and, for some paid plans, 3 Pro. If you pay for the Ultra plan, you get access to Gemini Deep Think for very hard problems (which is in another menu entirely). Always pick **Gemini 3 Pro or Thinking** for any serious problem. For Claude, you need to pick **Opus 4.6** (though the new **Sonnet 4.6** is also powerful, it is not quite as good) and turn on the “extended thinking” switch.

Again, for most people, the model differences are now small enough that the _app_ and _harness_ matter more than the model. Which brings us to the bigger question.

## The Chatbot Interfaces

The vast majority of people use chatbots, the main websites or mobile apps of ChatGPT, Claude, and Gemini, to access their AI models. In fact, we can call the chatbot the most important and widespread AI app. In the past few months, these apps have become quite different from each other.

Some of the differences are which features are bundled with AI:

  * Bundled into the Gemini chatbot (and accessible with the little plus button): you can access nano banana (the best current AI image creation tool), Veo 3.1 (a leading AI video creation tool), Guided Learning (when trying to study, this helps the AI act more like a tutor), and Deep Research

  * Bundled into ChatGPT is even more of a hodgepodge of options accessible with the plus button. You can Create Images (the image generator is almost as good as nano banana, but you can’t access the Sora video creator through the chatbot), Study and Learn (the equivalent to Guided Learning in Gemini, but there is also a separate Quizzes creator for some reason), Deep Research and Shopping Research (surprisingly good and overlooked), and a set of other options that most people will not use often, so I won’t cover here.

  * Claude has only Deep Research as bundled option, but you can access a study mode by creating a Project and selecting study project. 

  * All of the AI models let you connect to data, such as letting the AI read your email and calendar, access your files, or connect to other applications. This can make AI far more useful, but, again, each AI tool has a different set of connectors you can use.




These are confusing! For most people doing real work, the most important additional feature is Deep Research and connecting AI to your content, but you may want to experiment with the others. Increasingly, however, what matters is the harness - the tools the AI has access to. And here, OpenAI and Anthropic have clear leads over Google. Both Claude.ai and ChatGPT have the ability to write and execute code, give you files, do extensive research, and a lot more. Google’s Gemini website is much less capable (even though its AI model is just as good),

[](<https://substackcdn.com/image/fetch/$s_!sNyH!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F44e62d7f-ed4c-44d3-bc93-b4b2867a581b_5312x4355.png>)

As you can see, asking a similar question gets working spreadsheets and PowerPoints from ChatGPT and Claude, along with clear citations I can follow up on. Gemini, however, is unable to produce either kind of document, and it does not provide citations or research. I do expect that Google will catch up here soon, however.

One final note on Chatbots. GPT-5.2 Pro, with the harness that comes with it, is a VERY smart model. It is the model that just helped [derive a novel result in physics](<https://openai.com/index/new-result-theoretical-physics/>) and it is the one I find most capable of doing complex statistical and analytical work. It is only accessible through more expensive plans. Google Gemini 3 Deep Think also seems very capable, but suffers from the same harness problem.

[](<https://substackcdn.com/image/fetch/$s_!YiA6!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbf7efcae-93af-4ebf-bc6e-dbad488b63c8_1892x2888.png>)Prompt: “you are an economic sociologist. I want you to figure out some novel hypotheses you can test with this data, do sophisticated experiments, and tell me the findings.” and I gave it a large excel dataset.

## Other apps and harnesses

The chatbot websites are where most people interact with AI, but they are increasingly not where the most impressive work gets done. A growing set of other apps wrap these same models in more powerful harnesses, and they matter.

**Claude Code, OpenAI Codex, and Google Antigravity** are the most well-developed of these, and they are all aimed at coders. Each of them gives an AI model access to your codebase, a terminal, and the ability to write, run, and test code on its own. You describe what you want built and the AI goes and builds it, coming back when it’s done or stuck. If you write code for a living, these tools are changing your job. Because they have the most extensive harnesses, even if you don’t code, they can still do a tremendous amount.

For example, a couple years ago, I became interested in how you would make an entirely paper-based LLM by providing all of the original GPT-1’s internal weights and parameters (the code of the AI, listed as 117 million numbers) in a set of books. In theory, with enough time, you could use those numbers to do the math of an AI by hand. This seemed like a fun idea, but obviously not worth doing. A week ago, I asked Claude Code to just do it for me. Over the course of an hour or so (mostly the AI working, with a couple suggestions), it made 80 beautifully laid out volumes containing all of GPT-1, along with a guide to the math. It also came up with, and executed, covers for each volume that visualized the interior weights. It then put together a very elegant website (including the animation below), hooked it up to Stripe for payment and Lulu to print on demand, tested the whole thing, and launched it for me. I never touched or looked at any code. I had it make 20 books available at cost to see what happened - and sold out the same day. All of the volumes are still available as [free PDFs on the site](<https://weights-press.netlify.app/>). Now, I can have a little project idea that would have required a lot of work, and just have it executed for me with very little effort on my part. 

But the coding harnesses remain risky for amateurs and, obviously, focused on coding. New apps and harnesses are starting to focus on other types of knowledge work.

**Claude for Excel and Powerpoint** are examples of specific harnesses inside of applications. Both of them provide very impressive extensions to these programs. Claude for Excel, in particular, feels like a massive change in working with spreadsheets, with the potential for a similar impact to Claude Code for those who work with Excel for a living - you can, increasingly, tell the AI what you want to do and it acts a sort of junior analyst and does the work. Because the results are in Excel, they are easy to check. Google has some integration with Google Sheets (but not as deeply) and OpenAI does not really have an equivalent product.

[](<https://substackcdn.com/image/fetch/$s_!IOnc!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcc527f70-b3e4-498b-80bb-bfa03f24dd5b_1900x1175.png>)

**[Claude Cowork](<https://claude.ai/downloads>)** is something genuinely new, and it deserves its own category. Released by Anthropic in January, Cowork is essentially Claude Code for non-technical work. It runs on your desktop and can work directly with your local files and your browser. However, it is much more secure than Claude Code and less dangerous for non-technical users (it runs in a VM with default-deny networking and hard isolation baked in, for those who care about the details) You describe an outcome (organize these expense reports, pull data from these PDFs into a spreadsheet, draft a summary) and Claude makes a plan, breaks it into subtasks, and executes them on your computer while you watch (or don’t). It was built on the same agentic architecture as Claude Code, and was itself largely built _by_ Claude Code in about two weeks. Neither OpenAI or Google have a direct equivalent, at least this week. Cowork is still a research preview, meaning it’s early and will eat through your usage limits fast, but it is a clear sign of where all of this is heading: AI that doesn’t just talk to you about your work, but does your work.

[](<https://substackcdn.com/image/fetch/$s_!5NR5!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F933c53d7-43f9-455e-b4e7-2ee52f4a33ee_1565x1184.png>)NotebookLM lets you conduct research reports and gather source documents (on the left), ask questions of the sources and material (the middle) and turn them into things like slide shows (on the right)

**[NotebookLM](<https://notebooklm.google.com/>)** is Google’s answer to a different problem: how do you use AI to make sense of a lot of information? You can ask NotebookLM to do its own deep research, or else add in your own papers, YouTube videos, websites, or files, and NotebookLM builds an interactive knowledge base you can query, turn into slides, mind maps, videos and, most famously, AI-generated podcasts where two hosts discuss your material (you can even interrupt the hosts to ask questions). If you are a student, a researcher, or anyone who regularly needs to make sense of a pile of documents, NotebookLM is a very useful tool..

And then there is **OpenClaw** , which I want to mention even though it doesn’t fit neatly into any of these categories and which you almost definitely shouldn’t use. OpenClaw is an open-source AI agent that went viral in late January. It runs locally on your computer, connects to whatever AI model you want, and you talk to it like you were chatting with a person using standard chats like WhatsApp or iMessage. It can browse the web, manage your files, send emails, and run commands. It is sort of a 24/7 personal assistant that lives on your machine. It is also a serious security risk: you are giving an AI broad access to your computer and your accounts, and no one knows exactly what dangers you are exposing yourself to. But it does serve as a sign of where things are going.

# **What to do now**

I know this is a lot. Let me simplify.

If you are just getting started, pick one of the three systems (ChatGPT, Claude, or Gemini), pay the $20, and select the advanced model. The advice from my book still holds: invite AI to everything you do. Start using it for real work. Upload a document you’re actually working on. [Give the AI a very complex task in the form of an RFP or SOP.](<https://www.oneusefulthing.org/p/management-as-ai-superpower>) Have a back-and-forth conversation and push it. This alone will teach you more than any guide.

If you are already comfortable with chatbots, try the specific apps. NotebookLM is free and easy to use, which makes it a good starting place. If you want to go deeper, Anthropic offers the most powerful package in Claude Code, Claude Cowork (both accessible through Claude Desktop) as well as the specialized PowerPoint and Excel Plugins. Give them a try. Again, not as a demo, but with something you actually need done. Watch what it does. Steer it when it goes wrong. You aren’t prompting, you are (as I wrote in my last piece) managing.

The shift from chatbot to agent is the most important change in how people use AI since ChatGPT launched. It is still early, and these tools are still hard to figure out and will still do baffling things. But an AI that does things is fundamentally more useful than an AI that says things, and learning to use it that way is worth your time.

[Subscribe now](<https://www.oneusefulthing.org/subscribe?>)

[Share](<https://www.oneusefulthing.org/p/a-guide-to-which-ai-to-use-in-the?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

[](<https://substackcdn.com/image/fetch/$s_!O-pO!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff77c79c7-9fb2-4cd0-b075-a6201a212a6c_1456x816.png>)
