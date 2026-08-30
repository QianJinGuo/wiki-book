---
source: rss
source_url: https://www.interconnects.ai/p/i-wrote-an-ai-textbook-how-long-until
ingested: 2026-08-30
feed_name: Interconnects
source_published: 2026-08-12
sha256: 3f7bdcbffd13333b
---

# I wrote an AI textbook — how long until AI can do it better?

There are a lot of criticisms of AI writing, but most of them are focused on more creative, high-voice writing like this blog. Those — including [my own piece](<https://www.interconnects.ai/p/why-ai-writing-is-mid>) — often argue that it is because good writing is high-voice, has a point of view, has a deep human expression that needs to come across, and or a process of thinking that you peek into with the chosen words. As LLMs get more refined as tools, rather than conversational assistants, I think we are actually going backwards on our goals of having models produce inspiring writing.

On the other side of things is non-fiction writing. Filler, copy text was one of the genuinely useful abilities of an LLM (Sam Altman said so much about the early business of GPT-3 on a recent [podcast](<https://www.youtube.com/watch?v=XDB5beon4DY&t=1745s&pp=ygUfc2FtIGFsdG1hbiBpbnZlc3QgbGlrZSB0aGUgYmVzdA%3D%3D>)). It has seemed like any flaws here were mostly down to a general lack of intelligence in the models, or some other training issue, and all non-fiction and explanatory text would get obliterated by the rapid pace of progress _eventually_. Having worked with the models as a writing assistant over the last few years, they’ve gotten a bit better, but it’s worth reflecting on what’s holding them back. 

Models being stagnant in long-form, non-fiction writing should be alarming to those reliant on models autonomously solving grand, open science problems in the near future. The models today struggle to organize and compellingly present some of the most established science in their area. This seems like a natural prerequisite that we should expect the models to master before they can solve broad, open-ended problems on their own. Until this is solved, the progress of LLMs for science will look closer to solving low-hanging fruit and merging distant connections across fields, rather than any sort of revolutionary insight.

This is a somewhat controversial take for someone who is very optimistic about AI’s progress, especially writing it on the day that Anthropic published a blog post on Claude making some progress on the famous [Riemann Hypothesis](<https://www.anthropic.com/research/riemann-zeta>). Scientific problems have a vast breadth, and I don’t think current AI models have as much coverage as many think.

Organizing knowledge is a compression. [This compression is needed to make insight](<https://www.interconnects.ai/p/deep-research-information-vs-insight-in-science>). Today’s LLMs increase entropy in long-form non-fiction writing, and I don’t see how that can be stacked on top of itself endlessly. They’ll be reliant on humans acting as sort of guides.

I am still very optimistic about translation from these narrow forms of science, like the extreme advancements we’ve seen in math, into consistent, broader progress — LLMs are the most powerful assistants scientists have ever used. I first need to explain how observing the models work on such grounded, low-level knowledge problems in writing makes me see a surprising lack of generalization.

_For more context, I just finished writing a post-training textbook,[Reinforcement Learning from Human Feedback](<https://rlhfbook.com/>) (buy on [Manning](<https://hubs.la/Q03TsMBq0>) or [Amazon](<https://amzn.to/4cwCDJQ>)). I used LLMs in many ways to support this, from helping wrangle LaTeX formatting for equations, doing extensive copyediting, and creating [diagrams](<https://github.com/natolambert/rlhf-book/tree/main/diagrams>) for programming languages like TikZ (in LaTeX) or Python._

[Share](<https://www.interconnects.ai/p/i-wrote-an-ai-textbook-how-long-until?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

### Why have models stagnated in writing quality?

I would’ve expected _way_ more progress on non-fiction writing from the models. I almost thought I would look dumb publishing a non-fiction book in 2026, given how things looked in 2024. Today, some of the most famous models on writing ability are pretty old, examples include OpenAI’s big [GPT 4.5](<https://www.interconnects.ai/p/gpt-45-not-a-frontier-model>) and Moonshot’s [Kimi K2](<https://www.interconnects.ai/p/kimi-k2-and-when-deepseek-moments>). In and around these releases, the models have gone from okay to superhuman at other tasks like coding and mathematics. Maybe a closer, but still imperfect, comparison is how the models went from incapable to decent at search and research tasks. The pace of progress on most other skills is steep, but writing well feels orthogonal to most of them. I do not think writing is just ignored, but rather it’s challenging and lacks good training data to specifically intervene on it.

There is certainly some low-hanging fruit for making AI models better at writing — such as specialized harnesses like Claude Code, prompts, and training environments that make models spend a lot more inference tokens on the output, but I don’t think these will have a multiplicative impact on ability. Writing well is a very hard task! It’s a shame that we haven’t unlocked inference-time scaling for one of the great intellectual pursuits. Regardless, writing seems very different than what the models are good at.1

Today, the models seem genuinely horrible at long-form technical writing. They can get a sentence right, but if you try and get them to write an entire chapter it’ll be a mix of sprinkled with confusing wording, muddled in its organization, and generally a bit off. They try to be too cute where they don’t need to be and in the process make random conceptual errors. The models in the near future will get much better at the small errors, especially as models get bigger — which allows them to hold more world knowledge — but I do not expect their ability to utilize it to transform.

For example, the GPT models have been incredible at finding typos and minor issues for a long time. I passed a near-final draft of my book as a PDF to GPT 5.5 Pro and it found deep, surprising minor typos across the manuscript that is 200-300 pages. 

On the other hand, the Claude models have been much more useful as an editor. They have a lot more taste, tend to understand the mental model of the task better, and have more interesting suggestions to unstick the different forms of writer’s block.

The examples I’ve given above all have a sort of consistent theme. The models know how to check every unit of content, in this case usually a sentence or equation or figure, or make one, specific section where you are caught. With these skills, they don’t do a good job revisiting components and stringing them together as they make many additions on top of each other. It feels like a sort of irreducible compounding errors. We used to deal with these errors in math and code, but reflecting on it, RLVR has been a truly magical solution in reducing them.

Interconnects AI is a reader-supported publication. Consider becoming a subscriber.

### Getting value out of current models as a writer

I’m willing to share that there are a few technical explanation sentences in my book that came from an AI model — well less than 1% — they’re there because I really loved them. I let myself consider including some AI tokens in the book, as it didn’t feel like cheating if I, as a true expert, felt that the sentence was what the reader needed. Especially in the editing process, where I had a very close eye on things and plenty of concern on if my book would ever be done with all the things I have going on, it was an extremely valuable path forward. 

For example, I had a list of questions from my editor interspersed in a LaTeX file with a specific delimiter like `\editor{}`. I would have Claude Code navigate to each comment, print the context before and after, and let me know if it was an easy typo fix or something more nuanced. I would write a response — the text to insert — or ask Claude for suggestions before fixing it. Intellectually it is a very focusing process of editing, it was a fun way to improve the book. Sometimes phrases from Claude’s suggestions are what made it into the book.

It is definitely a slippery slope and when I accepted a few AI suggestions it was at the point where I was going through my second full-manuscript review. Emotionally the project felt completed but I had more work to do. Coming out of the textbook-writing process I so deeply appreciate the cut and dry rule I have for my writing on Interconnects to never use AI outputs in the content. It is way more fun to write in a way that is only you — high voice, valued so deeply for the process — but writing a standard reference is not really an activity known for being fun. I see why people turn AI tools into a crutch when most of their writing is just an output to fill space, rather than a means to an end. I am motivated to write voluminously to learn, to feel, and to express.

I am working through similar balances in my scientific work too. AI models are great for repetitive pieces of the paper, like drafting a related work or background section that you know by heart, but using them for the abstract, introduction, experiments, or conclusion is a shame. Those are where the story and soul of the work is communicated — it’s where you learn what your research is really about.

I am confident I created a lot more net value by being able to have AI models create and check my non-fiction writing work. They make writing equations trivial, can help refactor the repository, port between languages, and many other things. At the beginning, it was very fun, until I was a bit worn down by the length of the publishing process, watching the field move on.

For an example of why AI was crucial in this case, I had to maintain Markdown and LaTeX versions of my book simultaneously in two spots, as readers gave feedback on the web version and my Manning editorial team reviewed a forked copy. Without AI agents, syncing between the two of them would’ve easily taken me five times as long (and this task took tens of hours already).

Something intertwined with this story, which I stumbled upon when thinking about agents, is how your pace of understanding won’t increase by using agents. That understanding, in the form of intuition, taste, instinct, etc. is what will be valuable in the future. Using AI for non-fiction writing takes away from that progression. Doubly, if you weren’t already an expert you won’t be able to catch its flaws.

In my case, I felt such an urgency to dump the knowledge out of my brain onto the page that there were times that using the AI models was a worthy tool. Much of the motivation of my book was to have _a single reference_ for important post-training methods like [rejection sampling](<https://rlhfbook.com/c/09-rejection-sampling>) or [character training](<https://rlhfbook.com/c/17-product#character-training>), where very little exists on the web.

This textbook was so much of giving back to the community, that it was just such a win to complete it in any form, that I felt it was okay. I would’ve learned more and the product could’ve been marginally improved with more human effort, I am sure. The determining factor was that I felt like the book was going to be aged out by the time it was published, a fear of AI model’s capabilities on one side and how fast the field moves on the other. 

This turned out to be really wrong? I’m very happy with the result and I’m more confident in its staying power now than when I started in 2024, as the models have so failed to live up to the hype in non-fiction writing. 

[Share](<https://www.interconnects.ai/p/i-wrote-an-ai-textbook-how-long-until?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

### Where technical writing goes from here

The models are incredible tools, they let you express knowledge in different forms. They’re wonderful for creating creative filler or background material — e.g. the first draft of [slides](<https://rlhfbook.com/course>) whose real value is being a talking point for the teacher to lecture over — that let any knowledge be transformed from one medium to another.

There’s some subtle, early phase of writing a non-fiction or reference textbook that feels a bit closer to writing a high-voice blog post like this. When pushing through the early organization and the presentation of the core skeleton new knowledge is created. This is the part that takes insight, and the LLMs are far behind in being able to replace it.

The crux of the above paragraph and preceding section is that I would be happy if more of the world’s experts used AI models to write a tiny bit of their books in order to get more of their knowledge shared with the world. The problem is that you can only use AI models to save 10-20% of the effort today, and I don’t see that percentage becoming the majority anytime soon. 

There’s also the social pressure, where people _expect_ LLMs to be the best, personalized educators out there, so they think working on a book or educational content is pointless. I think some of these opinions are aging out, as there’s a massive dearth in the highest quality educational work — and there always has been. AI is great at manipulating said content into the form that suits the student, not creating the content from scratch. 

In the meantime I feel that we are stuck in a frustrating local minimum, where AI models are going to on net reduce the average effort spent on non-fiction writing, but they could enable great expression. Fewer people will start and push through. 

So, in 2-5 years I still expect the best textbooks to be heavily crafted by the human hand. I’m not sure after then, but that’s longer than many would’ve predicted, given just how much knowledge these models have and their structural propensity to stream it.

As for a conclusion on capabilities, the models are great in two contexts: 1) any truly verifiable domain and 2) when given a ton of context and making a small edit — like finding a bug or solving a very specific math problem or giving feedback — not generating prose in an open-ended manner. Long-form writing will definitely fall before creative writing, but it’s a strong tell that the models are not able to express the full extent of their knowledge in underspecified problems. As we try to push the models to be something like “geniuses in a datacenter” solving grand scientific problems, this seems like a fairly fundamental limitation.

* * *

_had a[great piece on why LLMs make good editors](<https://jasmi.news/p/ai-writing>), while being bad writers too._

1

Part of this is in how people use the models. If you ask Claude Fable 5 in Claude Code (or the chat app, I’m sure too): “write me a great poem about a goldfish,” the model will quickly spew out an answer. I asked the model how it did this, and if it had a sort of scratchpad it wrote to and iteratively updated before returning something good, and it said no. It made a minimal plan in its reasoning tokens and then autoregressively generated a poem. It’s taking no advantage of inference-time scaling or approaching it like a hard task.

This is how most people surely use models for writing, and it’s no surprise the results are mediocre. The way to get the best results out of them would be to prompt the models very heavily, get them to work extensively before answering you, and reference other judge models’ opinions before returning you the text. There’s a simple way to make the long form better, given the models have some genuine skills right now.
