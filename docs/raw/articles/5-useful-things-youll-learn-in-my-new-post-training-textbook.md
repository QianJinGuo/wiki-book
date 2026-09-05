---
source: rss
source_url: https://www.interconnects.ai/p/5-useful-things-youll-learn-in-my
ingested: 2026-08-29
feed_name: Interconnects
source_published: 2026-08-10
sha256: e1731c90a856d8c6e00988fb5a6b75fe22ddeb684ceb9c6d4a535dcce5bfbf4f
---

# 5 useful things you'll learn in my new post-training textbook (shipping now!)

##### Housekeeping: No voiceover on another quick “launch” post. More essays soon!

After a few long years of finding time to document my lessons from training open models, my post-training book is done! It’s published by Manning, under the title _Reinforcement Learning from Human Feedback: Aligning and Post-training LLMs_. 

Telling the story of the book is a useful way to explain why you may want a copy. 

The book started as a website where I wanted to document key methods of post-training that had potentially no online material explaining them. If there was something, I couldn’t find it. This existed for more topics than you would expect, given post-training was already popular in 2024 (when I bought the domain), and continues to this day. Topics like [rejection sampling](<https://rlhfbook.com/c/09-rejection-sampling>), [outcome reward models](<https://rlhfbook.com/c/05-reward-models#outcome-reward-models>), and [character training](<https://rlhfbook.com/c/17-product#character-training>) are prime examples. This has helped make the [website](<https://rlhfbook.com/>) fairly popular, as it’s still one of the few places discussing these topics at a foundational, intuitive way.

Otherwise, most of the book is about communicating intuitions and history. Much of the LLM industry is defined by core techniques that haven’t changed much in the last few years. This book was my attempt to explain in simple terms why post-training works, what trade-offs people need to make to get it right, and what misconceptions people often get stuck on. To do this, some of the older, foundational blog posts on Interconnects were reworked to stitch together the story behind key mathematical topics. For this reason, a lot of the explanatory text is likely higher voice than your average textbook. 

This is the book I wanted to read when I was getting started a few years ago! With how many people still ask me basic post-training questions, in fact a population that’s accelerating in size, I suspect this book will be very well received. I still use the book regularly and hear from established researchers all over the industry that they do too. So, it’s not a beginner book — it’s more tailored to someone who has already finished a bachelor’s degree in CS — but if you master it you will be far ahead in your post-training worldview.

[Share](<https://www.interconnects.ai/p/5-useful-things-youll-learn-in-my?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

#### A discount to readers!

The book is also freely available [online](<https://rlhfbook.com/>) and comes with a full 12 hour course ([slides](<https://rlhfbook.com/course>) \+ [video on YouTube](<https://www.youtube.com/watch?v=jQPiH-KB4B0&list=PLL1tdVxB1CpVpEtMHxwuR4uI4Lxjw00_y&pp=sAgC>)), a simple [code-base](<https://github.com/natolambert/rlhf-book/tree/main/code>) with suggested exercises, and model completion comparisons. It’s 50% off until August 19th on Manning with the code `PBLambert`.

[Buy my book from Manning](<https://hubs.la/Q03TsMBq0>)

[Buy my book on Amazon](<https://amzn.to/4cwCDJQ>)

Yes, the title of this book is a little outdated — I’ve learned some lessons and fought some battles with the publishing process — but I can guarantee the content is very fresh. I regularly reference the book for my research work, and hear from friends that do the same. I added a section on on-policy distillation at the last possible moment! The book is shipping from Manning and Amazon US now, and from Amazon UK in October.

## 1\. Intuitions for how RL algorithms change the outputs of models

By word or page count, the book is about 25% RL. This seems appropriate. If there’s one thing the book is doing it’s teaching people how to think about various RL algorithms. This intuition, from the policy-gradient theorem to PPO to modern versions like GSPO and CISPO, are crucial to understanding if a new algorithm is fake or has potential (no new algorithm will be proven right out of the gates).

Below is an example intuition you should be able to follow _after_ reading. 

For example, here’s a fun figure that we’ve iterated on for the PPO clipping understanding. At the end of the day, PPO’s surrogate objective reduces to six regions. These can be seen as two gradients, when the advantage for a token is positive or negative, depending on the current value of the policy ratio. For an individual sample in a completion, it lives somewhere on this plot. If it was the first gradient step in the batch, it starts at 1 on the x axis (gradient always flows), then depending how the ratio updates after changing the RL policy behavior, the gradient is either the same or becomes 0 (which is what the clipping arguments are for).

[](<https://substackcdn.com/image/fetch/$s_!L6n5!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6018ee47-c200-4a7e-acbf-8b79dbd86495_4155x3893.png>)

This intuition filters very closely into how the systems are designed, in order to manage the gradients and numerical issues they tend to cause. The math-focused policy-gradient section is pretty thorough, covering all the algorithms you’ve likely heard about in the last 3 years:

  * [Deriving the Policy Gradient](<https://rlhfbook.com/c/06-policy-gradients#deriving-the-policy-gradient>)

  * [Vanilla Policy Gradient](<https://rlhfbook.com/c/06-policy-gradients#vanilla-policy-gradient>)

  * [REINFORCE](<https://rlhfbook.com/c/06-policy-gradients#reinforce>)

  * [REINFORCE Leave One Out (RLOO)](<https://rlhfbook.com/c/06-policy-gradients#reinforce-leave-one-out-rloo>)

  * [Proximal Policy Optimization (PPO)](<https://rlhfbook.com/c/06-policy-gradients#proximal-policy-optimization-ppo>)

  * [Understanding the PPO Objective](<https://rlhfbook.com/c/06-policy-gradients#understanding-the-ppo-objective>)

  * [Value Functions and PPO](<https://rlhfbook.com/c/06-policy-gradients#value-functions-and-ppo>)

  * [Group Relative Policy Optimization (GRPO)](<https://rlhfbook.com/c/06-policy-gradients#group-relative-policy-optimization-grpo>)

  * [Group Sequence Policy Optimization (GSPO)](<https://rlhfbook.com/c/06-policy-gradients#group-sequence-policy-optimization-gspo>)

  * [Clipped Importance Sampling Policy Optimization (CISPO)](<https://rlhfbook.com/c/06-policy-gradients#clipped-importance-sampling-policy-optimization-cispo>)

  * [Comparing Algorithms](<https://rlhfbook.com/c/06-policy-gradients#comparing-algorithms>)




## 2\. An understanding of the crucial factors facing new RL systems and algorithms

Most of modern RL is a systems problem balancing a few problems — how off-policy the data is, training-inference mismatch, and throughput. The core systems design, asynchronous RL with separate GPUs for the learners (the GPUs which take gradient steps) and actors (the GPUs which generate the rollouts in the environment), has been similar for a few years. 

[](<https://substackcdn.com/image/fetch/$s_!IlYo!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff930eabc-71b0-4f2f-9126-d88673466c80_3835x2119.png>)

Agentic tasks are only adding more infrastructure on top of these fundamentals. The book is designed to be the simplest resource to start from roughly 0 LLM RL knowledge and be ready to tinker with the systems. It starts with basics, such as explaining the general form of implementing an RL algorithm:

`pg_loss = -advantages * ratio`

It continues with teaching you about loss aggregation — the idea that spawned DAPO and Dr. GRPO as some of the seminal, early GRPO variants — and truncated importance sampling — the technique used to make PPO work in early RL experiments.

  * [Policy-Gradient Basics](<https://rlhfbook.com/c/06-policy-gradients#policy-gradient-basics>)

  * [Loss Aggregation Tradeoffs](<https://rlhfbook.com/c/06-policy-gradients#loss-aggregation-tradeoffs>)

  * [Asynchronous RL Systems](<https://rlhfbook.com/c/06-policy-gradients#asynchronous-rl-systems>)

  * [Truncated Importance Sampling](<https://rlhfbook.com/c/06-policy-gradients#truncated-importance-sampling>)

  * [Example: PPO](<https://rlhfbook.com/c/06-policy-gradients#example-ppo>)

  * [Example: GRPO](<https://rlhfbook.com/c/06-policy-gradients#example-grpo>)




[Share](<https://www.interconnects.ai/p/5-useful-things-youll-learn-in-my?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

## 3\. The histories that lead to modern post-training

Knowing how a field came to be has always been fascinating to me. As you become an expert, knowing the history of your field better than anyone is what lets you make the best predictions (Bill Gurley gives similar advice in his recent [book](<https://www.amazon.com/Runnin-Down-Dream-Thrive-Actually/dp/0593799666>)). In a time when the foundations of deep learning were being built, like the transformer, the core of modern post-training was also born in the alignment field. The book will walk you through 3 eras, when [researchers learned to do RL on preferences](<https://rlhfbook.com/c/02-related-works#origins-to-2018-rl-on-preferences>) generally until ~2018, spent a few years learning [how to apply it to language models](<https://rlhfbook.com/c/02-related-works#to-2022-rl-from-human-preferences-on-language-models>) from 2019 to 2022, and from 2023 on exploited the examples set by ChatGPT. Much like those early to scaling LLMs, the people who created this field a decade ago deserve incredible credit for how modern progress has unfolded.

Chapter 2 of the book is a crash course on this, but the book is littered with this type of thinking.

[](<https://substackcdn.com/image/fetch/$s_!wzyr!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa96b87d7-181d-4dc0-9a5b-6b1e5fc31675_2401x552.png>)

## 4\. Dispelling the magic of “distillation”

It’s really nice to have a boring textbook [chapter](<https://rlhfbook.com/c/12-synthetic-data>) on distillation given the broader AI policy discussions ongoing. This one, chapter 12, explains the various industry-standard ways that outputs from an LLM are used to train downstream models. When the technique is often described in nefarious ways, and as a tool of geopolitical competition, it’s a deescalatory action to break out a 300 page textbook to explain to someone how broad the term they’re attacking is.

With this, chapters 10 through 12 are all about making some opaque practices of the data industries clearer to readers. 

The distillation chapter continues the theme I outlined above, explaining the key changes that needed to be made to transition the early knowledge distillation literature of 2015 to 2-3 key insights that got us to the multi-teacher on-policy distillation (MOPD) of models like Xiaomi MiMo-V2-Flash and DeepSeek V4.

## 5\. A survey of all the other little headaches you encounter when trying to do post-training right

The second half of this book goes into a tour of over-optimization, regularization, evaluation, and character training, which is all about the many ways post-training can go wrong and what you need to stay on top of. This is what differentiates the book most from those that are just a list of code exercises and equations, but it explains things like [why RL generalizes when SFT forgets](<https://rlhfbook.com/c/15-regularization#implicit-regularization>) (at the math level) or which techniques frontier labs use to [shape the personalities of the models](<https://rlhfbook.com/c/17-product#crafting-model-character-and-products>) and [why those often go too far](<https://rlhfbook.com/c/14-over-optimization#qualitative-over-optimization>). The book presents the tools you will use and then opens up the floodgates of all the challenges you’re going to face when you actually try to put them to use. 

* * *

As I wrote the takeaways for the book, I was reminded of an old piece of advice I gave for the AI era of building companies, and how **people** _**do**_**need to care about research right now**. With the pace of progress in AI, the time it takes for a research paper to land in a frontier model is 3-9months. Previously in big tech, that would be years, so it was fine to take a hands off approach to new research. For people with companies relying on being at the frontier in specific niches of LLMs, the dynamic today can make or break the company. This book is useful because it trains you at understanding which research matters — it helps you develop research taste.

If none of this resonates with you, you should buy my book because it makes me happy and I work very hard on all of this.

I really like this photo.

[](<https://substackcdn.com/image/fetch/$s_!ccYc!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4468909c-7481-4b27-9566-6fc838b95743_1074x731.jpeg>)
