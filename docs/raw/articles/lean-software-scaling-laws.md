sha256: 7d18a440117de0f1a01d54b8555ff36660db0a8095620c987a516b8fda7125a4
---
title: "Lean Software Scaling Laws"
source_url: "https://gwern.net/lean-scaling"
type: article
created: 2026-06-30
ingested: 2026-06-30
---

# Lean Software Scaling Laws


Markdown Content:
Research proposal for measuring how coding LLM perplexity scales with codebase context size, using Lean as a test case for whether formal languages have better predictability exponents and could lead to safer, more secure software worldwide.

> Research idea: empirically measure the scaling of coding LLM perplexity over codebase size to estimate the scaling laws of ‘predictability’ by programming language or other factors. This should translate into overall security and safety.
> 
> 
> We can measure this in contemporary LLMs expensively, by training from scratch and finetuning, or cheaply, by measuring perplexity over increasingly large context windows of source code.
> 
> 
> Codebases, and programming languages, which have better exponents in their scaling laws will eventually become easier for LLMs to understand, fix, and write.
> 
> 
> In particular, the Lean programming language likely has, with 2026-era LLMs, a worse baseline constant and total loss on existing codebases, but better scaling exponents. This would imply that implementations in Lean can eventually win and deliver large benefits in program correctness at global scale—and thus could help justify large-scale investments in rewriting existing codebases in Lean or paying for new Lean code, thereby improving global cybersecurity.

[C](https://gwern.net/dropcap#yinit)oding LLMs are currently on track to produce most software in the near-future, despite being generally mediocre quality or outright insecure (with vibecoded software being especially bad). Future rewrites with coding LLMs may help, but are not guaranteed to happen or to plug as many holes as we need to be secure against pervasive cybersecurity LLM offensives. How can we avoid this? LLMs could potentially write all software in provably secure, safe ways like formally-verifiable systems, but progress in that lags behind.

How far behind?

## [Language Priors](https://gwern.net/lean-scaling#language-priors "Link to section: § 'Language Priors'")

[Neural scaling law⁠](https://en.wikipedia.org/wiki/Neural_scaling_law) methodology remains under-applied in deep learning for validating existing approaches and forecasting future applications. An example is in coding agents: it’s commonly observed that [LLMs⁠](https://en.wikipedia.org/wiki/Large_language_model) are better at more common languages due to more available data, and [⁠Luo et al 2025⁠](https://arxiv.org/abs/2510.08702) argues that programming is especially data-hungry, and thus there might be long-term ‘lock-in’ and upgrading to better technologies like [Haskell⁠](https://en.wikipedia.org/wiki/Haskell) or [Rust⁠](https://en.wikipedia.org/wiki/Rust_(programming_language)) or [Lean⁠](https://en.wikipedia.org/wiki/Lean_(proof_assistant)) will be impossible.

But this does not follow: being a popular language with a lot of training data only means that LLMs _start off by default_ performing well. (Because it’s hard to disentangle a programming language from its ecosystem as a whole, here I will just refer to ‘languages’.)

Any corpus can be seen as a ‘prior’, with [⁠⁠a certain exchange rate between languages⁠](https://gwern.net/doc/ai/scaling/abstract#exchange-rate) where better [Python⁠](https://en.wikipedia.org/wiki/Python_(programming_language)) skills will partially transfer to, say, Haskell (see [⁠Yang et al 2025⁠](https://arxiv.org/abs/2512.13472)). So it’s possible that a ‘rising tide will lift all boats’, and in fact, better coding LLMs might lead to a renaissance for obscurer languages when the LLMs get ‘good enough’, and programmers need no longer spend years relearning everything.

## [Scale Failure](https://gwern.net/lean-scaling#scale-failure "Link to section: § 'Scale Failure'")

It also doesn’t mean that they will keep performing well as codebases expand. Many things work well at small scales, but increasingly fail at scale. The ‘BDSM’ discipline of a language like Haskell can be infuriating and painful if you’re writing a quick throwaway program, but may become indispensable when you have a million lines of complex code. So, it may be easy for an LLM to write a _little_ Python… but what about a _lot_? A short script is easy to write and has few gotchas, especially since an LLM can easily look at the whole thing in its context window. But what happens as the codebase gets larger and more complex and older and no longer fits into context windows? Can it keep the [⁠dynamic types⁠](https://en.wikipedia.org/wiki/Dynamic_types) and [⁠exceptions⁠](https://en.wikipedia.org/wiki/Exceptions) straight? What about that [⁠monkey-patching⁠](https://en.wikipedia.org/wiki/Monkey-patching) over in that dark corner? Or that dependency which changed runtime behavior during an upgrade? Because if it can’t, even a single error can be fatal and force a human programmer to spend weeks debugging subtle errors.

Perhaps the most extreme programming language which is plausible for implementing large software programs, in terms of runtime speed and programming language power, is Lean, which has been enjoying a sudden burst of popularity as people and LLMs discover its use beyond theorem-proving, for implementing real programs. Even things like a [zlib⁠](https://en.wikipedia.org/wiki/Zlib)[⁠rewrite in Lean](https://leodemoura.github.io/blog/2026-2-28-when-ai-writes-the-worlds-software-who-verifies-it/#a-sign-of-things-to-come)!

## [Lean Bottleneck](https://gwern.net/lean-scaling#lean-bottleneck "Link to section: § 'Lean Bottleneck'")

We can now imagine rewriting software, and writing new software, in Lean, to eliminate memory-safety problems, exceptions, out-of-bounds errors, prove correctness of major properties like lossless compression, etc.

The downside is… there’s not much Lean source code out there. So unsurprisingly, the LLMs are not _that_ good at it. Not yet good enough to autonomously translate large complex codebases with more complex I/O or behavior than zlib.

So we have something of a chicken-and-egg problem. We could use LLMs to create large Lean codebases, to train on, so we can replace all our existing code with Lean, only if we had a lot of large Lean codebases to begin with and presumably got them from having replaced our existing code with Lean.

And it’s unclear if Lean is all that great, or if LLMs even _could_ write large Lean codebases effectively were they to exist and LLMs be trained on them. Maybe Lean is just badly designed—how would we know? Maybe a real-world Lean codebase winds up collapsing into [a big ball of mud](http://www.laputan.org/mud/mud.html), or have lots of ad hoc special case bruteforce proofs (what was inevitably dubbed ‘mathslop’).

## [Predictability Proxy](https://gwern.net/lean-scaling#predictability-proxy "Link to section: § 'Predictability Proxy'")

One way to test this would be to ask what we would expect a well-designed language to look like, from an LLM’s point of view.

If it was full of ad hoc design choices, large amounts of bruteforce, bugs or duplication, etc, from an LLM’s point of view, this should look like a codebase which is ‘hard to read’. One would need to read ever more tokens to understand what is going on; there would be highly unpredictable behavior, because there would be global state and overrides and ‘gotchas’—you could not simply look at one file on its own and understand what is going on, you’d have to look at a dozen other files, tracing replacements and rewrites, to figure out that it _usually_ does _X_ unless this undocumented shell variable has been set by the user in which case it’ll do _Z_ (probably). This means that you would never be quite sure what you will read next; at any moment, some random thing could interrupt, or you could mispredict a line because the original code is just plain buggy… Even if the current module is well-written and uses just a de facto ‘safe subset’, at scale, the codebase will be a curate’s egg—the more programmers and time and complexity involved, the more the codebase is a patchwork.

And conversely, a well-architected codebase, with a strongly typed memory-safe language, should be the opposite: it is easy to read code in isolation, because there are no escape hatches or backdoors, and everything is as it seems; things go in and out at the documented interfaces, and it is, well… in a word… _predictable_.

But it’s not simply being predictable, because vast amounts of boilerplate or data or redundant test-cases might also be predictable. Good design, at scale, is _increasingly_ predictable, as you see more of the system and come to understand the design. And bad code at scale is increasingly _un_ predictable, because seeing more of the system doesn’t help you understand the rest of it. (The more bad code there is, the more permissive the languages and systems, the more you genuinely can’t be sure of anything, because there will be bugs or unintended interactions in even the most immaculate hand-written codebase. And the signature of ‘bad’ proofs like bruteforce cases or reductions is that you don’t ‘learn anything’—each case is exactly as predictable as the last one.)

So I suggest that LLM prediction accuracy, or [⁠perplexity⁠](https://en.wikipedia.org/wiki/Perplexity)/bits per character (BPC), is a weak proxy for the predictability of the system as a whole, and the predictability is a key scaling property. Programming languages which, compared to their competitors, have increasingly predictable large-scale systems, will work better with LLMs—eventually.

## [Measurement Design](https://gwern.net/lean-scaling#measurement-design "Link to section: § 'Measurement Design'")

We can measure this empirically most cheaply by using frozen pretrained LLMs (eg. [⁠GLM-5.2](https://z.ai/blog/glm-5.2)) to:

1.   **Corpus construction**: take existing source code corpuses by language, turning them into a single large text file (with appropriate metadata headers), perhaps shuffled or perhaps in a dependency-sorted order;

2.   **Loss measurement**: run LLM forward passes to measure the perplexity per token position in the full context window (normalizing into bytes to account for tokenizer biases, and ideally with per-language normalization to account for general line-of-code length differences as languages can differ 10× in length, confusing things);

    *   _Cross-check_:

        *   Anomaly/bug detection: to further test this, as a kind of ‘inverse scaling’, we can inject noise, like subtle bugs, into the context window; the more surprised the LLM is, the better. (A missing bounds check, wrong unit conversion, sign error, overly broad exception handler, silent dtype cast, or plausible-but-wrong theorem lemma may look stylistically perfect, and require deep semantic understanding of the codebase as a whole to flag.)

        *   Correctness: with artificial context limits to hide increasingly more of the codebase, how many sampled rollouts still compile and pass all quality tests?

            *   **Lean signatures**: in particular, can a coding LLM predict a working Lean module given only the module signature header? Do the type signatures constrain the problem space so much that ‘there is only one way to do it’?

    *   _Ablations_: any optional components, like [type signatures⁠](https://en.wikipedia.org/wiki/Type_signatures), can be removed/added and the global benefit quantified. (_Do_ type signatures actually help coding LLMs… or are they just redundant clutter? Or do they only help after a certain scale?)

    *   _Semantics_: which parts, exactly, are especially unpredictable in a given language? And what is highly predictable boilerplate? The former may reflect bugs or misleading source code, and to be ignored (perhaps some programmers just write very confusing inconsistent identifiers), and the latter may reflect design defects in a language which has failed to provide adequate abstractions.

    *   _[Coreset⁠](https://en.wikipedia.org/wiki/Coreset)/minimal context_: a well-designed system with good modularity is a system you only need to read a few key bits of to understand any given part. An LLM can try to produce the minimal context to achieve approximately the same loss as the full codebase prefix (oracle) achieves (cf.[my SAE truesight proposal⁠](https://gwern.net/sae-truesight)); the shorter the better, and this should scale well.

A well-designed Lean codebase should require a much smaller context window (just the types and theorem signatures) to perfectly predict the next function, whereas a Python codebase might require the LLM to read 10 different files to guess the dynamic runtime behavior.

    *   _Scoring improvements_: do refactors and cleanup edits make the codebase more predictable? Then this provides useful training data signal, particularly in scenarios like stress-testing software-engineering ‘taste’ of coding LLMs by only iteratively introducing new requirements.

3.   **Position averaging**: average by token position in the context window;

4.   **Curve-fitting**: fit scaling laws per language;

5.   **Extrapolation**: finally, extrapolate to look for crossovers (eg at what size would a Lean codebase become more absolutely predictable than a Python codebase? how large would a coding LLM need to be to achieve adequate performance, including with in-context learning or [dynamic evaluation⁠](https://arxiv.org/abs/2403.01518#deepmind)?)—and looking at the constants/exponents as design metrics.

This is easy enough I think that a grad student or a [⁠MATS](https://www.matsprogram.org/ "MATS Research") project could do this.

## [Crossover Forecast](https://gwern.net/lean-scaling#crossover-forecast "Link to section: § 'Crossover Forecast'")

I predict that we would find that ‘weak’ languages, which support few invariants or have dynamic typing or mutable global state etc. will be easier to predict at small scales, like thousands of lines of code, but have worse scaling exponents, and ‘cross over’ the most popular ‘strong’ languages like Haskell at hundreds of thousands or millions of lines of code. And we would find that Lean would not necessarily ‘cross over’ in absolute loss at any reasonable length, because it suffers from a very high constant, but it would have the best scaling exponent, and so would still cross over at some point.

This would motivate large investments in Lean R&D and porting, to solve the chicken-and-egg by just paying for training data.

One could probably also estimate the total training corpuses and the ratios of Lean to Python/JS/etc, and try to back out an estimate of _how much_ training data it would take to bring the Lean crossover point down to any specific repository scale, by regressing the constant on the corpus. Lean might be too expensive, so one could also try to estimate the exchange rates, and consider if buying/generating more code in other languages, like Haskell, would be more cost-effective. (Code can be bought on the market using data-labelers, or by compute using agentic LLMs to try to automatically transpile codebases, perhaps repeatedly, which should have roughly log scaling in the number of attempts.)

## [Bias Controls](https://gwern.net/lean-scaling#bias-controls "Link to section: § 'Bias Controls'")

The initial estimates would be at least partially confounded by the programmers and domains; Lean code emphasizes math and Lean programmers are highly unusual (often academics or hobbyists), but JavaScript programming emphasizes web dev and business code by ordinary programmers, and so these differences will themselves drive different exponents. It’s unclear how severe these systemic biases would be; if the first analysis found that JavaScript scaled better than Lean, the naive approach would have to be discarded.

This can be partially controlled by attempting to match up codebases by ‘topic’, and analyze differences in pairs. But as coding LLMs get better and their evaluations get more and more realistic, more ambitious programming language scaling law sweeps can start fixing these biases by synthesizing controlled comparisons: write a specification in two different languages, up to the same measured quality, and _then_ measure perplexity differences. (For example, the original C zlib vs the Lean zlib.)

## [Context Learning](https://gwern.net/lean-scaling#context-learning "Link to section: § 'Context Learning'")

We may be further concerned that languages systematically differ in their in-context learning: LLMs may be too ignorant of Lean to make anywhere near optimal use of context windows, and therefore the scaling within context window is meaningless. I suspect that there is enough Lean, and that frontier AI labs now emphasize math/programming enough, that the ‘basic Lean programming skills’ are solid and the remaining errors due to smaller corpuses.

However, we could check for such things by extending the procedure further. We could run with LLMs finetuned on source code datasets, or even trained from scratch, to control as many factors as possible, and check for the ‘basic’ bias by looking at how the estimated Lean scaling exponent itself scales with increasing training data—but I doubt it is worth the vastly greater cost.

## [Failure Modes](https://gwern.net/lean-scaling#failure-modes "Link to section: § 'Failure Modes'")

And one could try to reuse this compressibility derivative approach in benchmarking math-focused approaches: a good method or tool should produce theorems which help reduce the size of a corpus and modularity, but also help improve its understandability, which can be quantified as the scaling exponent. Good formalization should create reusable semantic compression, and mathslop should have poor reuse and poor repair locality.

If this approach is fatally wrong, I suspect the most likely failure mode is that ecosystem maturity and corpus prior effects dominate language-level invariants. That would itself be useful: it would imply that tooling, conventions, and documentation beat formal language properties for agentic programming—at least for now.

