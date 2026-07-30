---
title: "Why do OpenAI's GPT-2 weights beat mine?"
source_url: "https://www.gilesthomas.com/2026/07/why-do-openai-gpt2-weights-beat-mine-1-intro"
ingested: 2026-07-31
sha256: e6bda1307f94842b24c044c046a148e360c0c5bff7d6720b8db713625a8a5c42
---

Title: Why do OpenAI's GPT-2 weights beat mine?

URL Source: https://www.gilesthomas.com/2026/07/why-do-openai-gpt2-weights-beat-mine-1-intro

Published Time: 2026-07-29T15:30:00+0000

Markdown Content:
Writing the post that I wished I'd found when I started learning whatever it was...

Archives

Categories

Blogroll

When I finished my project training an [LLM from scratch](https://www.gilesthomas.com/llm-from-scratch), I was left with a minor mystery. Why were my models worse at instruction-following than the original OpenAI GPT-2 small weights?

I had an evaluation that I was running, based on the instruction fine-tuning code in chapter 7 of "[Build a Large Language Model (from Scratch)](https://www.manning.com/books/build-a-large-language-model-from-scratch)". The process was to train a model on samples from the [Alpaca](https://crfm.stanford.edu/2023/03/13/alpaca.html) instruction-following dataset until validation loss started rising, to use that instruction fine-tuned model to generate completions to a held-back test set, and then to use an LLM to compare the results from various different models. The details are [here](https://www.gilesthomas.com/2026/04/llm-from-scratch-32l-interventions-instruction-fine-tuning-tests); let's call it the IFT eval.

OpenAI's original weights for GPT-2 small consistently beat my own models, even when mine got better results than theirs on a more technical evaluation, where I just measured the cross entropy loss for each model on a held-back set of test sequences. This surprised me; I would have expected a reasonably close correlation between the two evals -- that better test loss would imply better instruction-following.

I have a couple of thoughts about why this might be, and given that I recently set up [`poppy`, my dedicated LLM training box](https://www.gilesthomas.com/2026/07/poppy-the-training-box-1-the-beginnings) I decided to inaugurate her with an experiment to test one of them; further experiments will come in time -- though I don't think this will be a focus for the blog. More of a running theme, with occasional posts until either I solve the mystery, or give up in despair...

In this post I'll give a bit more detail about the nature of the problem, and list some of the things I've been thinking might be the cause. In later posts, I'll dig into some of them.

## More on the mystery

Let's take a look at the results from my most recent runs of the IFT eval. I've highlighted the OpenAI models in bold, and the table is sorted by the test loss -- that more technical evaluation that I mentioned earlier, where lower is better.

How well the model did with the IFT eval is in the last three columns. The "IFT epochs" column shows how many epochs of training the model needed before its validation loss started rising, the score is the average mark out of 100 that (in this case) GPT 5.5 gives the model's answers to the IFT test set, and the rank is the position the model holds in terms of that average score.

|  | Test loss | IFT epochs | IFT score | IFT rank |
| --- | --- | --- | --- | --- |
| **OpenAI weights: medium** | **3.231442** | **2** | **41.62** | **1** |
| JAX, with MHA bias, no dropout | 3.418784 | 4 | 19.25 | 4 |
| JAX, no MHA bias, no dropout | 3.420089 | 3 | 14.66 | 11 |
| JAX, no MHA bias, with dropout | 3.476802 | 4 | 12.94 | 15 |
| **OpenAI weights: small** | **3.499677** | **2** | **26.73** | **2** |
| `1xrtx3090-stacked-interventions` | 3.538161 | 4 | 17.79 | 6 |
| `8xa100m40-stacked-interventions-1` | 3.577761 | 4 | 10.29 | 16 |
| Cloud FineWeb, 8x A100 40 GiB | 3.673623 | 7 | 20.71 | 3 |
| `1xrtx3090-baseline` | 3.683835 | 6 | 15.11 | 9 |
| `8xa100m40-baseline` | 3.691526 | 4 | 14.74 | 10 |
| Cloud FineWeb, 8x H100 80 GiB | 3.724507 | 4 | 13.25 | 14 |
| Cloud FineWeb, 8x A100 80 GiB | 3.729900 | 4 | 14.50 | 12 |
| Cloud FineWeb, 8x B200 160 GiB | 3.771478 | 4 | 16.03 | 8 |
| Local FineWeb train | 3.943522 | 7 | 13.73 | 13 |
| Local FineWeb-Edu extended train | 4.134991 | 7 | 16.70 | 7 |
| Local FineWeb-Edu train | 4.166892 | 7 | 18.68 | 5 |

For the IFT eval, the OpenAI weights are the best. The "medium" model comes first, and the "small" one comes second -- and there's a noticeable gap between "small" and the score for my best model for that eval, "Cloud FineWeb, 8x A100 40 GiB": 26.73 vs 20.71. That difference was consistent across multiple runs of the eval -- the relative rankings of my own models varied more.

It's not surprising that the "medium" model does better -- it's more than double the size of the others -- but the small model consistently beating mine was odd given that I had models with lower test loss.

Another thing that stands out is the number of epochs that the models were trained for. Remember, I trained them until the validation loss started rising -- that is, until the model started overfitting. You can see that the OpenAI weights hit that after two epochs of training, whereas my models ranged between three and seven.

## The loss landscape

My starting hypothesis was that the OpenAI weights were starting off from a better position in the IFT loss landscape than mine. The loss landscape for the task the various models were originally pre-trained for -- "predict the next token for this sequence of text that was pulled from the web" -- is different to the loss landscape for the IFT task, which is something more like "predict the next token in a useful response to this request". Let's dig into that a bit.

The core idea behind the normal LLM training paradigm is that we can get a useful starting point for a model by pre-training -- training on a whole load of cheaply-available stuff from the web -- and only then have to use our much more expensive task-specific datasets for fine-tuning. I've been training my models on approximately 3.2 billion tokens of the [fineweb](https://huggingface.co/datasets/HuggingFaceFW/fineweb) dataset, which was generated from scrapes of the web, and then deduplicated and tidied up a bit.

If I had instead trained them on 3.2 billion tokens of instruction-following samples -- essentially, pre-packaged Q&A sessions between a human and an assistant -- then they would almost certainly be much better than the models I have at instruction-following, for the same cost in compute used to do the training run.

But the cost of generating those 3.2 billion tokens would be incredibly high. Imagine hiring people to do it: the GPT-2 tokeniser averages about 0.75 words per token, and while I don't know how much you'd need to pay people to write 2.4 billion words, I suspect it would be rather a lot. Even generating that much synthetic data from a larger LLM (as the Alpaca dataset was) would not be cheap -- I make it US$144,000 using GPT 5.6 Sol as of mid-2026.

Even worse, the LLM we trained on that kind of data would be "brittle" -- if you wanted it to solve an even slightly different task (for example, Alpaca is single-shot question and answer, so imagine if you wanted it to handle multi-turn conversations like a chatbot), it would be hard to train it to do that.

So: the idea is that if we pre-train a base LLM on less-structured -- but, importantly, still "real" -- data like scraped web pages, we'll get a general-purpose base LLM relatively cheaply. It will have discovered basic stuff like the structure of language, and hopefully some general knowledge (eg. maybe that the capital of France is Paris). Once we have that, we can fine-tune it for specific uses.

Now, both the initial pre-training and -- in this IFT test -- the fine-tuning phase of building our model are done in essentially the same way: trying to minimise the cross entropy loss of the model's predictions against a dataset. [1](https://www.gilesthomas.com/2026/07/why-do-openai-gpt2-weights-beat-mine-1-intro#fn-1) What has changed between them is the targets we're trying to train the model to predict. In the pre-training phase, we're trying to get it to predict web scrape data, in the fine-tuning, we're trying to predict responses to queries.

Putting that idea into slightly more mathematical language (albeit loosely enough that any real mathematicians reading this will probably scream with horror), if we're saying that a pre-trained model is useful as a base for instruction fine-tuning, what we have is an assumption that the loss landscape for the original pre-training phase is reasonably similar to the loss landscape for the fine-tuning. We are hoping that a place that is nice and low on the pre-training landscape is reasonably close (in parameter space) to a place that is low on the fine-tuning landscape.

That's all very abstract; let's try to visualise it. If we imagine the loss landscape for a model with two parameters, that's reasonably easy. The two parameters make up two dimensions -- let's say left and right for one, forward and back for the other -- and the loss at any given point is the vertical dimension. It's an uneven surface, a bit like a rolling landscape, with hills and mountains at points where the parameters have very high loss, and valleys and clefts where the loss is lower.

> In reality, of course, we have _somewhat_ more than two parameters. With the 163,009,536 parameters in my GPT-2-small-style models, the loss landscape is not a surface but a 163,009,536-dimensional hypersurface [2](https://www.gilesthomas.com/2026/07/why-do-openai-gpt2-weights-beat-mine-1-intro#fn-2) in 163,009,537-dimensional space. Good luck visualising that.
> 
> 
> While taking intuitions from levels of dimensionality that we can actually imagine over to insanely high-dimensional spaces like that is often risky -- weird stuff starts happening as the number of dimensions goes up -- for what we're specifically looking at here, it's safe. The landscape image works for intuition.

So, we have one landscape like that for our pre-training phase. When we start fine-tuning, the loss landscape changes to a different one. What we're hoping is that the landscape is reasonably similar; that the low point that we wound up at in the pre-training landscape is close to a low point in the new fine-tuning landscape when that is swapped in. [3](https://www.gilesthomas.com/2026/07/why-do-openai-gpt2-weights-beat-mine-1-intro#fn-3)

The good news is that we know that this process of doing a pre-train then a fine-tune works. Most modern AI is trained using it as a foundation (though there's lots of extra stuff on top). And indeed, you'd intuitively expect it to work -- it would be kind of weird if there was no correlation at all between the "understand language" loss landscape and the "answer questions" one.

But this does mean that we can -- at least in a somewhat hand-wavey way -- characterise the manner in which the OpenAI weights are "better" than mine in terms of the loss landscape.

Both the OpenAI weights and mine have landed in places that were good from the pre-training viewpoint; that's what the "Test loss" results in the table above mean. GPT-2 medium is doing better than any of my models -- given that it's about twice the size, it should -- and GPT-2 small is doing better than most of them.

But the places in the pre-train loss landscape where the OpenAI models landed were clearly better-matched to good places in the fine-tuning loss landscape than my own models' places were. The fact that they took fewer epochs to start overfitting intuitively points in that direction -- after all, if you're closer to somewhere, then it takes less time to get there -- but the fact that they scored better after fine-tuning makes it pretty clear.

But something else that occurs to me as I write this is that the results on the test set also point to a superiority in the OpenAI weights -- one that hadn't occurred to me in the past.

## OpenAI weights: better than we thought!

Let's think about what that test set is. In order to get data that was pre-processed and ready to work with, I downloaded all of the 10 billion token version of FineWeb, and split it into 99% training and 1% validation and test. I tokenised each sample in each of those splits, and then concatenated them together into a single sequence for each, separating the samples with `<|endoftext|>` tokens. My training script took the train split, broke it up into 1024-token sequences, assembled them into batches, and ran through 3.2B token's worth.

The loss test takes 19,660,800 tokens starting at position 50,000,000 in the validation/test split, and runs them through in batches of six, working out the average loss.

Now, the GPT-2 weights were trained on something that I _believe_ was constructed similarly -- get a load of text consisting of a bunch of documents from the web, tokenise them all and tack them together separated with `<|endoftext|>`s, and then use that.

But, importantly, it was a _different_ dataset. Annoyingly, we don't have access to OpenAI's "WebText" dataset, but I think it's reasonably safe to say that even if it is similar to what I came up with, it will be less similar to the sequences used for the loss test than my own training set is.

Given that the loss test for the OpenAI small weights came out with a better result than any of the models I trained in PyTorch, and was only narrowly beaten by the ones I trained with JAX (even then, I think, because the JAX models got lucky with their random weight initialisation before they started training), then I think we can say that the OpenAI weights are already considerably better than my own ones. They were already at a good place in their own loss landscape, but it happened to also be in a good place in my test set's.

An alternative analogy: if you imagine a group of 15 trail runners having a race on a route in a forest, where all but one of them regularly run on different routes in the same forest, but the odd one out is running there for the first time, if the newcomer gets a very close fourth place, then it's not unreasonable to think that they're probably the best runner of all of them. [4](https://www.gilesthomas.com/2026/07/why-do-openai-gpt2-weights-beat-mine-1-intro#fn-4)

Finally -- I've been talking about the models as if they were all the same size (apart from the OpenAI medium weights), but there's one extra important difference with OpenAI's: they use weight tying, while mine don't. That means that their small model is significantly _smaller_ than mine are -- closer to 124M parameters [5](https://www.gilesthomas.com/2026/07/why-do-openai-gpt2-weights-beat-mine-1-intro#fn-5) than the 163M that mine have. Weight tying made a lot of sense back in 2019, when VRAM was even harder to come by than it is now, but when I [looked into it](https://www.gilesthomas.com/2026/03/llm-from-scratch-32g-interventions-weight-tying), it made loss much worse.

Carrying on with the trail runner metaphor, the OpenAI small weights not only don't know the forest well -- they're also (_scratches head looking for a good analogy_) physically weaker. Their performance is even more impressive.

So: OpenAI weights good, mine (relatively) bad. Their smaller model, being tested for loss on a less-familiar-looking test set, does better -- or at least only a tiny bit worse than -- my larger ones. And when instruction fine-tuned, it converges on a better-performing result, and does it faster.

What could the difference be?

## Probably not dropout...?

One thing that occurred to me while I was pondering this was dropout. If, when training, we randomly ignore 10% of the activations, perhaps we get a more generalisable model? Most of what I've read recently about dropout has focused on how it helps to avoid memorisation in multi-epoch training runs, but when I first read about it [I felt that the generalisation argument was also strong](https://www.gilesthomas.com/2025/03/dropout-and-mandatory-vacation). If true, that might explain the lower number of epochs needed for instruction fine-tuning, and maybe even the performance.

Luckily, though, I'd accidentally done an experiment that suggested that this wasn't the difference. As one of my JAX training runs, I'd trained one with dropout, and as you can see if you look back at the results table above, it was one of the worst performers in the IFT test.

One result is not a proof, but the fact that this one was bad compared to the others meant that I felt it was solid enough to ignore dropout as a possibility, at least initially.

## Data quality?

Again, it's kind of annoying that WebText was never published. All we know about it is from [the paper](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf), where they say:

> [W]e created a new web scrape which emphasizes document quality. To do this we only scraped web pages which have been curated/filtered by humans. Manually filtering a full web scrape would be exceptionally expensive so as a starting point, we scraped all outbound links from Reddit, a social media platform, which received at least 3 karma. This can be thought of as a heuristic indicator for whether other users found the link interesting, educational, or just funny.

How does this compare with FineWeb in terms of quality? Without seeing the results, we really can't say. FineWeb is more of a general web-scraping corpus, without the "filtering" provided by those Reddit upvotes. On the other hand, we're talking about Reddit here, and all kinds of awful junk gets upvoted, so I'm not confident that it's _that_ strong a quality signal. And FineWeb has been curated to some degree.

That said, I had previously noticed that the models I had trained on the [FineWeb-Edu dataset](https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu) ("the most educational web pages" from FineWeb) punched above their weight in the IFT test. They got pretty poor loss on the test set, but didn't do too badly in IFT.

In retrospect, it's actually not that surprising that they did badly on the test loss eval; they were trained on a curated dataset of "good" stuff, and then were being evaluated against whatever less-curated stuff appears in the test set -- which you'll remember came from FineWeb. If you train a model on Jane Austen and then evaluate against [Chuck Tingle](https://www.chucktingle.com/), then you're not going to get amazing results.

But then, there's the excellent performance of the OpenAI weights on that same FineWeb test set. Even if WebText was higher quality than FineWeb, that clearly wasn't the whole story.

So data quality felt like it _might_ be part of it -- but it wasn't where I wanted to start.

## Overtraining?

This, finally, is where I landed for a first experiment. I'd been training my models on 20 tokens per parameter -- the Chinchilla-optimal number. But that heuristic dates to 2022, and GPT-2 was trained in 2019. While we don't know for sure, from what I've managed to dig up it looks like it was probably trained on much more data -- and probably over multiple epochs too.

Training on more tokens than the Chinchilla number is called overtraining (not to be confused with overfitting). So: what happens if we overtrain the model? Will we get the loss down? And if so, will we start approaching GPT-2 small's results on the IFT eval?

Stay tuned :-)

[Here's a link to the next post in this series](https://www.gilesthomas.com/2026/07/why-do-openai-gpt2-weights-beat-mine-2-the-bugfix).

* * *

1.   Modern production LLMs tend to use reinforcement learning as a big part of the fine-tuning phase, and that works quite differently.[↩](https://www.gilesthomas.com/2026/07/why-do-openai-gpt2-weights-beat-mine-1-intro#fnref-1 "Jump back to footnote 1 in the text.")

2.   When I started reading up on this, I was hoping that it would be a manifold, largely because I like the word. And it is! A hypersurface is a specific kind of manifold. :-D[↩](https://www.gilesthomas.com/2026/07/why-do-openai-gpt2-weights-beat-mine-1-intro#fnref-2 "Jump back to footnote 2 in the text.")

3.   If you like fantasy, there are some neat parallels there; the different overlaid worlds the characters move between in Philip Pullman's _His Dark Materials_ series (aka _The Golden Compass_), China Miéville's _Un Lun Dun_, V. E. Schwab's _Shades of Magic_, and Charlie Stross's _The Merchant Princes_ series come to mind. Even the Upside Down in _Stranger Things_ works, though then you have to decide which of your loss landscapes is the evil one, and that muddies the analogy annoyingly.[↩](https://www.gilesthomas.com/2026/07/why-do-openai-gpt2-weights-beat-mine-1-intro#fnref-3 "Jump back to footnote 3 in the text.")

4.   Sharp-eyed readers might have noticed that there are 16 models in the table above. I'm excluding the OpenAI medium weights. If you want to extend the analogy, that model is an Olympic runner who happens to have stopped by for the race...[↩](https://www.gilesthomas.com/2026/07/why-do-openai-gpt2-weights-beat-mine-1-intro#fnref-4 "Jump back to footnote 4 in the text.")

5.   The paper says 117M, but the released weights are larger. I can successfully load them into my code with a model config that has 124,439,808 parameters.[↩](https://www.gilesthomas.com/2026/07/why-do-openai-gpt2-weights-beat-mine-1-intro#fnref-5 "Jump back to footnote 5 in the text.")
