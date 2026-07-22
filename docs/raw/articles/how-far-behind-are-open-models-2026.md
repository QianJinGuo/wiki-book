---
title: "How far behind are open models? (LessWrong 2026-05)"
source: newsletter
source_url: https://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models
ingested: 2026-06-01
feed_name: LessWrong
source_published: 2026-05-28T09:41:40Z
type: article
sha256: c207b6f3560bd464eeac4b996fb501caac46b2f16a8c71552d354b6b06e56527
tags: [open-models, benchmark, evaluation, lesswrong, ai-frontier]
---
URL: https://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models

Title: How far behind are open models?

URL Source: http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models

Published Time: 2026-05-28T09:41:40.457Z

Markdown Content:
## [LESSWRONG](http://www.lesswrong.com/)

## [LW](http://www.lesswrong.com/)

Login

[How far behind are open models?](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#)

7 min read

•

[Results](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#Results)

•

[Provider degradation may inflate the gap](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#Provider_degradation_may_inflate_the_gap)

•

[Real-world tasks](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#Real_world_tasks)

•

[Methodology](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#Methodology)

•

[Backward-looking vs forward-looking gap](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#Backward_looking_vs_forward_looking_gap)

•

[Additional analyses](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#Additional_analyses)

•

[Open vs closed gap by category](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#Open_vs_closed_gap_by_category)

•

[(Open) Chinese models vs closed models](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#_Open__Chinese_models_vs_closed_models)

•

[Acknowledgements](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#Acknowledgements)

•

[Appendix A: Additional figures](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#Appendix_A__Additional_figures)

•

[Appendix B: Benchmark score provenance](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#Appendix_B__Benchmark_score_provenance)

•

[Notes:](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#Notes_)

•

[Takeaway](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#Takeaway)

[AI Evaluations](http://www.lesswrong.com/w/ai-evaluations)[AI Timelines](http://www.lesswrong.com/w/ai-timelines)[AI](http://www.lesswrong.com/w/ai)[Frontpage](http://www.lesswrong.com/posts/5conQhfa4rgb4SaWx/site-guide-personal-blogposts-vs-frontpage-posts)

[](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#)

# 15

# [How far behind are open models?](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models)

by [Håvard Tveit Ihle](http://www.lesswrong.com/users/havard-tveit-ihle?from=post_header)

28th May 2026

7 min read

[8](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#comments)

[](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#)

# 15

Open models, AI models where you can download the weights online, are generally not as capable as the best closed models (models only available through an API), but **how large is the gap, and how does it change over time?** We try to answer this question by using data from 17 selected benchmarks (8 private, 9 public, ~110 datapoints) measuring various capabilities. All the data and code needed to reproduce this can be found on [github](https://github.com/htihle/open_closed_gap).

# Results

We find that, as of today, on private benchmarks, where the data is not publicly accessible, open models are roughly 8-10 months behind the closed frontier, while for public benchmarks the gap is roughly 4-6 months. We also find that the gap was smallest around the time of DeepSeek R1, in Jan 2025, and since then the gap has been growing.

![Image 1: gaps_over_time_combined_all.png](https://res.cloudinary.com/lesswrong-2-0/image/upload/v1779955698/lexical_client_uploads/mjuz1cwzjzi7ezje2fce.png)

The open-vs-closed gap over time. Each point is one accepted (benchmark, score-threshold) datapoint, placed at the date an open model first crossed that threshold; its height is how many months earlier the closed frontier had first crossed it. Circles are public benchmarks, stars private (colour = benchmark, legend below). The two curves are Gaussian-smoothed trends with 90% bootstrap bands for public and private benchmarks; company logos mark notable open-model releases.

These numbers are backward-looking, meaning that, on private benchmarks, the best open models now perform roughly at the level of the best closed models from 8-10 months ago.

The old data from 2023 and 2024 is partially self reported scores. Newer data is mostly better, but there are still major caveats (discussed in an appendix) including several of the "private" benchmarks not being fully private. These data are not perfect, but it's the best data that we were able to find with medium effort.

The fact that we see essentially the same trend in both the private and public data, completely disjoint sets of benchmarks, suggests (but does not demonstrate) that the trend in both is real. It also suggests that, while public benchmarks significantly underestimate the gap between open and closed models, almost by a factor of two, public benchmarks still provide useful information about model capabilities.

## Provider degradation may inflate the gap

People running a private benchmark on open Chinese models might use third-party providers, with zero-data-retention, to protect their private data. We know that both we (who run WeirdML), [METR](https://x.com/METR_Evals/status/1991658244771836159) (time-horizons) and [Epoch AI](https://x.com/EpochAIResearch/status/2003178198146891876) (Frontiermath) are careful to use third-party providers for this reason, not sure about the others. Sometimes, due to bugs or implementation issues, third-party providers can have subtly degraded performance when serving open models. This can often be adressed by testing and comparing different providers, but it can be hard to detect subtle degradation, and it's also hard to rule it out completely. If present, such degradation would bias the gap to be larger, especially for the private benchmarks.

## Real-world tasks

This is a speculation we're adding here because it's an important consideration, not because it's based much on these data. The difference in results on the private vs public benchmarks suggests that open model developers are doing some combination of not fully filtering out benchmark data and training to the test (or hillclimbing on the test).

Something like that is probably true, only to a lesser extent, for the private benchmarks as well. Model developers train on the kind of tasks they are likely to meet in benchmarks, even if only inadvertently by training on verifiable tasks, which are more easy to make benchmarks for. Big well-resourced closed labs probably have more access to varied data, more enterprise customers (and feedback from real use) and are relatively less focused on benchmark scores. This suggests that the gap on real-world tasks is probably even larger than that measured by private benchmarks.

# Methodology

We define a set of threshold scores for each benchmark, for most benchmarks we define those at 5% intervals from 0.05 and upwards. Then, the first time an open model crosses each of these thresholds we find out how many months earlier a closed model first crossed the threshold, and use that as an estimate of the gap.

![Image 2: simplebench_external_open_vs_closed.png](https://res.cloudinary.com/lesswrong-2-0/image/upload/v1779870766/lexical_client_uploads/er9dutikaqlokkjomzlf.png)

A per-benchmark "delay timeline" (SimpleBench), the building block of the analysis. Each row is a score threshold: the green marker is the first closed model to reach it, the blue marker the first open model, and the red bar is the gap between them (labelled in months). Bold rows are accepted datapoints; greyed rows are excluded (not a genuine first-crosser, a duplicate, or still open). Dashed "open pending" arrows mark thresholds the closed frontier has reached but no open model has yet.

For example, o1-preview was released 12. September 2024, and crossed several thresholds in various benchmarks. When DeepSeek R1 crossed several of the same thresholds in 20. Jan 2025, we count each crossing as a datapoint measuring the gap at 20. Jan 2025 to be about 4.3 months.

This methodology is fairly simple and well-defined, but it assumes that all the benchmarks have tested all the major both open and closed models, which is not typically the case. In practice what we do is to find benchmarks that are high quality and have a good set of results for both open and closed models for some period of time. We then go into each benchmark and look at the different thresholds and the open and closed models that crossed the threshold first and ask if it's plausible that each of those would have been the first to cross the threshold if the benchmark had tested all the relevant models. If a major model that probably would have changed the gap significantly if it was there is not included in the data, then we reject the datapoint from this specific threshold. These judgements were made by Claude Opus 4.7, and the justifications are provided in the git repo. We separately went through manually and overruled some of the judgements, in all cases to accept some datapoints where we thought Opus was a bit too conservative.

In general we were fairly conservative in selecting benchmarks and relatively more liberal in including marginal datapoints from the selected benchmarks, especially high quality ones.

This methodology does have a winner's-curse bias, in that the first models to cross a certain threshold will tend to be a positive fluctuation. This could favor closed models if the benchmarks run more of them (which is typically the case). A more careful analysis could try to estimate this effect based, for example, on the ECI framework.

## Backward-looking vs forward-looking gap

If we take the results from a single threshold that's first crossed by a certain closed model and then later crossed by an open model, say in the example above with o1-preview and DeepSeek R1, we have a clean measurement of the gap (4.3 months), but what time should we associate this gap with? Is this the gap in Sept 2024, when o1-preview was released, or is it the gap in Jan 2025, when R1 was released? These are the forward looking and backward looking perspectives, respectively, and they answer two somewhat different questions.

The forward looking question takes the best closed models now, and asks when open models will be at the same level. The backward looking perspective asks how long do I have to go back in time for the best closed models to be at the same level as the best open models today. While we often are more interested in the forward-looking question, what we can actually answer today (for todays top open models) is the backward looking question, and that is the perspective we are using in this analysis. Specifically the question our method answers are **"How long-lived are the gaps that a top open model closes when it's released?".** We then associate the length of these gaps (in months) with the release date of the open model. By defining the gap in this way we ensure that our estimate of the current gap is not biased by the exclusion of currently-open gaps (thresholds that closed models have crossed, but open models have not yet), and the current gap can be fairly compared to the gaps back in time.

# Additional analyses

## Open vs closed gap by category

It is clear from our main figure above that private vs public is a very important variable for understanding the gap between open and closed models. However we wanted to see if benchmark category was an important variable as well, so we grouped the benchmarks into four categories and here we show the corresponding trend curves. The "reasoning" category clearly has a larger gap than the others, but all the three benchmarks that make up this category are private, so that's probably the more important factor. I don't think we have enough data to say much meaningful about the categories.

![Image 3: gaps_over_time_by_category_final.png](https://res.cloudinary.com/lesswrong-2-0/image/upload/v1779955756/lexical_client_uploads/gehrm1pqulseabc5a1fa.png)

The same accepted datapoints as the main figure, but the trend curves are split by capability category instead of by public/private (marker shape encodes the category). FictionLiveBench (long-context) fits no category and is excluded here.

## (Open) Chinese models vs closed models

We did the same analysis as the main results only restricting ourselves to Chinese open models. The results are basically the same, with only a few exceptions, back to Llama 3.1 (in July 2024), but before this the gap is notably larger in the Chinese-only analysis.

![Image 4: gaps_over_time_combined_chinese.png](https://res.cloudinary.com/lesswrong-2-0/image/upload/v1779955800/lexical_client_uploads/lp6pdq42dikzkr70lm9x.png)

The main analysis restricted to Chinese open-weight models.

# Acknowledgements

Almost all the data used here are from the [Epoch AI Benchmarking Hub](https://epoch.ai/benchmarks), their work in curating and connecting all the data make these analyses much easier.

Claude Opus 4.7 wrote essentially all the code, and did the research into the different benchmarks and data, directed by us. Opus made suggestions and initial justifications for inclusion/exclusion of data, while we had the final say/judgement and overruled Opus in several cases. We also did several spot checks to see if the final data matched the raw data.

We wrote this blog post, with the exception of Appendix B, which is written entirely by Opus and lightly edited by us.

# Appendix A: Additional figures

Here are some additional figures showing accepted and rejected thresholds for some of the benchmarks. Similar figures for all the benchmarks and reasoning behind the choices are on [github](https://github.com/htihle/open_closed_gap).

![Image 5: metr_time_horizons_external_open_vs_closed.png](https://res.cloudinary.com/lesswrong-2-0/image/upload/v1779871653/lexical_client_uploads/xazy3eredhd8v9w9khj3.png)

METR time horizons. Same delay-timeline format as the SimpleBench figure. Thresholds here are task-completion time horizons in **minutes** (the task length a model finishes ~50% of the time), not accuracies — higher is better.

![Image 6: gpqa_diamond_open_vs_closed.png](https://res.cloudinary.com/lesswrong-2-0/image/upload/v1779871682/lexical_client_uploads/ge9xmgphpdlapx8hhlwz.png)

GPQA Diamond (graduate-level science multiple-choice). Same delay-timeline format as the SimpleBench figure. An Epoch-run, cleanly comparable benchmark.

![Image 7: mmlu_external_open_vs_closed.png](https://res.cloudinary.com/lesswrong-2-0/image/upload/v1779871701/lexical_client_uploads/brd2alsdsddxgouf2ksw.png)

MMLU (4-option multiple-choice, ~25% chance). Same delay-timeline format as the SimpleBench figure. An older, near-saturated benchmark whose scores are largely self-reported (see Appendix B), included mainly for early-era coverage.

![Image 8: weirdml_external_open_vs_closed_final.png](https://res.cloudinary.com/lesswrong-2-0/image/upload/v1779871730/lexical_client_uploads/obxrwdle1p46egkyhfen.png)

WeirdML (accuracy on novel ML-coding tasks; private, run end-to-end by us). Same delay-timeline format as the SimpleBench figure.

# Appendix B: Benchmark score provenance

To measure when open-weight models first matched the closed frontier on each benchmark, we need the scores being compared to be _trustworthy and comparable_ — ideally produced by a single independent party running every model through one evaluation harness, rather than a grab-bag of numbers each lab reports for itself under its own favourable settings. We audited all 17 accepted benchmarks on this point (one independent web-research pass per benchmark). The results vary a lot, and we think it's worth being upfront about it.

The table below records, for each benchmark: who actually ran the evaluations, whether Epoch AI's Benchmarking Hub (our main data source) _runs_ the eval itself or merely _mirrors_ an external leaderboard, and our verdict on whether the scores come from a single independent evaluator with no self-reported numbers and comparable settings.

**Legend:** ✅ one independent evaluator ran every model in a fixed harness · ⚠️ mostly, but with a real caveat · ❌ scores are largely self-reported / submitted, or not run comparably.

| Benchmark | Access used | Who ran the evaluations | Epoch Hub | Independent, no self-report, comparable? | Source |
| --- | --- | --- | --- | --- | --- |
| GPQA Diamond | public | Epoch AI (Inspect, 16 runs/model) | runs | ✅ | [link](https://epoch.ai/benchmarks/gpqa-diamond) |
| MATH Level 5 | public | Epoch AI (Inspect, 8 runs/model) | runs | ✅ | [link](https://epoch.ai/benchmarks/math-level-5) |
| OTIS Mock AIME 2024-25 | public | Epoch AI (Inspect, 16 runs/model) | runs | ✅ | [link](https://epoch.ai/benchmarks/otis-mock-aime-2024-2025) |
| GSM8K | public | No single evaluator — ~70% vendor tech-report numbers, mixed shot counts | mirrors | ❌ | [link](https://epoch.ai/benchmarks/gsm8k) |
| MMLU | public | No single evaluator — mostly developer self-reported, varying n-shot | mirrors | ❌ | [link](https://epoch.ai/benchmarks/mmlu) |
| MMLU-Pro | public | TIGER-Lab harness + community submissions (Epoch blends w/ Artificial Analysis) | mirrors¹ | ❌ | [link](https://huggingface.co/spaces/TIGER-Lab/MMLU-Pro) |
| Aider Polyglot | public | Aider (P. Gauthier) + PR-submitted results; per-model configs vary | mirrors | ⚠️ | [link](https://aider.chat/docs/leaderboards/) |
| Terminal-Bench | public | harbor-framework (Stanford/Laude); PR-submitted, scaffolds vary | mirrors | ❌ | [link](https://www.tbench.ai/leaderboard/terminal-bench/2.0) |
| Humanity's Last Exam | public | CAIS + Scale run the official board (one harness)… | mirrors | ⚠️² | [link](https://scale.com/leaderboard/humanitys_last_exam) |
| FrontierMath | private | Epoch AI | runs | ⚠️³ | [link](https://epoch.ai/benchmarks/frontiermath-tiers-1-3) |
| FrontierMath Tier 4 | private | Epoch AI | runs | ⚠️³ | [link](https://epoch.ai/benchmarks/frontiermath-tier-4) |
| WeirdML | private | Håvard Tveit Ihle (one harness, all models) | mirrors | ✅ | [link](https://htihle.github.io/weirdml.html) |
| SimpleBench | private | AI Explained team (private set, AVG@5) | mirrors | ✅ | [link](https://simple-bench.com/) |
| METR Time Horizons | private | METR (own task suite + scaffold) | mirrors | ✅ | [link](https://metr.org/time-horizons/) |
| FictionLiveBench (120k) | private | fiction.live (single platform) | mirrors | ⚠️⁴ | [link](https://epoch.ai/benchmarks/fictionlivebench) |
| ARC-AGI | private | ARC Prize Foundation (semi-private set; not verified by default) | mirrors | ⚠️⁵ | [link](https://arcprize.org/leaderboard) |
| ARC-AGI-2 | private | ARC Prize Foundation (semi-private set; not verified by default) | mirrors | ⚠️⁵ | [link](https://arcprize.org/leaderboard) |

**Notes:**

1.   Our MMLU-Pro CSV was built directly from the TIGER-Lab leaderboard, not Epoch's data dump.
2.   HLE's _official_ board runs all models in one harness, but Epoch's data had almost no open-Chinese models, so we hand-appended 5 from public/self-reported sources — and **all of HLE's open-side first-crossings in our analysis are those self-reported rows.**
3.   FrontierMath is Epoch-run and internally comparable, but OpenAI funded it and has access to most problems, and ran its own o3/o3-mini numbers separately. This exposure can only inflate the _closed_ (OpenAI) side; an inflated closed score makes the closed frontier cross thresholds earlier, biasing the measured gap _upward_ — i.e. it can **overstate** the gap (this cuts against our conclusion; it is not conservative).
4.   Single-source and not self-reported, but the grading method is undocumented.
5.   Scores are on the ARC "semi-private" set: not publicly downloadable, but transmitted to commercial APIs during evaluation (ARC Prize: "exposed to commercial APIs and thus carry some risk of leakage"). The exposure is asymmetric — closed models receive the inputs via their own first-party APIs, open models via third-party hosts — so any contamination inflates the closed side → closed crosses thresholds earlier → **overstates** the gap. We keep ARC as "private" but flag that its measured gap may be inflated (semi-private / partially exposed).

## Takeaway

The benchmarks split into a clean core and a softer periphery. **Independently and comparably run:** GPQA Diamond, MATH Level 5, OTIS Mock AIME (all Epoch-run), plus WeirdML, SimpleBench and METR (each run end-to-end by a single party). **Self-reported or submission-based aggregations:** GSM8K, MMLU, MMLU-Pro, Aider Polyglot, Terminal-Bench, and HLE's open side. The private/contamination-resistant set we lean on most is itself mixed — FrontierMath, WeirdML, SimpleBench and METR are cleanly run, while ARC-AGI/-2 are semi-private and partially API-exposed. Read the provenance benchmark-by-benchmark rather than as one reassuring story: the two clearest contamination biases (FrontierMath's OpenAI access, ARC's API exposure) both act on the **closed** side, and inflating closed scores makes the closed frontier cross thresholds earlier — so on those benchmarks they would, if anything, make the gap look **larger** than it is (the private-side numbers from FrontierMath/ARC may be overstated). They do not make _open_ look artificially good; the risk is over- not under-statement of the gap.

## New to LessWrong?

[Getting Started](http://www.lesswrong.com/about)

[FAQ](http://www.lesswrong.com/faq)

[Library](http://www.lesswrong.com/library)

[AI Evaluations 1](http://www.lesswrong.com/w/ai-evaluations)[AI Timelines 1](http://www.lesswrong.com/w/ai-timelines)[AI 2](http://www.lesswrong.com/w/ai)[Frontpage](http://www.lesswrong.com/posts/5conQhfa4rgb4SaWx/site-guide-personal-blogposts-vs-frontpage-posts)

# 15

[How far behind are open models?](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#)

[3 Random Developer](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#T9TQsDt6yu4SvJ45u)

[3 StanislavKrym](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#Gnknu3XytXgGgJGH4)

[3 Håvard Tveit Ihle](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#ExcNyQCuMHsEyZfJd)

[3 Håvard Tveit Ihle](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#q7fJJ44iR7a665JMy)

[2 StanislavKrym](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#oAhDPjAoXkzyfkRFT)

[3 Håvard Tveit Ihle](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#3EDrNbfRREH44r4iw)

[2 StanislavKrym](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#2MWpQdeKGKsHkGBDi)

[3 Håvard Tveit Ihle](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#2Eg2dSGNcxZCCRRsm)

New Comment

Type here! Use '/' for editor commands.

Submit

8 comments, sorted by 

[top scoring](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models)

Click to highlight new comments since: [Today at 7:55 AM](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models)

[[-]](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models)[Random Developer](http://www.lesswrong.com/users/random-developer)[4d](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models?commentId=T9TQsDt6yu4SvJ45u)3 0

A tangential topic I've been thinking about: There are certain _absolute_ capability thresholds that a model can cross where it provides transformative value. And that value may be adequate for some cost-sensitive users.

This is heavily influenced by whether you want to keep humans in the loop, or go full YOLO and stop looking at your code entirely. Frontier models are clearly better at the later, but they're not _good_ enough to cut humans entirely out of stuff where slop isn't good enough. So there's a whole weird space where you want humans to remain aware of things, and where long-running autonomy is counterproductive because it destroys meaningful human oversight. There's _some_ regime where a Sonnet 4.5 level open model is viable in the hands of an experienced developer.

And so while the frontier versus open model gap is interesting, there are also likely some absolute breakpoints where open models persist on their own merits. (I say this as someone who has sunk-cost access to both Opus 4.6 and to Qwen3.6 27B, and who sometimes actually uses the later. Especially when I want to keep understanding the code, because the 27B forces tight supervision while still automating a lot of boring work nicely.)

[Reply](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models)

[[-]](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models)[StanislavKrym](http://www.lesswrong.com/users/stanislavkrym)[4d](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models?commentId=Gnknu3XytXgGgJGH4)3 0

How does one gather novel evidence for this benchmark? METR's last evaluation of Chinese models was Kimi K2 (Nov. 2025) in the old methodology, ensuring a 58 min 50% TH and a 15 min 80%TH, on par with Claude 3.7 Sonnet. ARC-AGI-2's last eval was of KimiK2.5 (Jan 2026, outsmarted by Grok 4 (JULY 2025), GPT-5-pro, then Claude Sonnet 4.5; HOW did Kimi end up being TEN months behind according to a data point?) ~~Where did METR evaluate DeepSeek v.3.2? ~~What could one do to incorporate DeepSeek v4 Pro's [CAISI-led eval](https://www.nist.gov/news-events/news/2026/05/caisi-evaluation-deepseek-v4-pro) which had CAISI's varsion output 46% as opposed to Opus 4.6's 63% (which [was officially evaluated](https://arcprize.org/leaderboard) as 68.8% or 69.2%) and GPT-5.5's 79% by CAISI/85% by the ARC-AGI team?

[Reply](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models)

[[-]](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models)[Håvard Tveit Ihle](http://www.lesswrong.com/users/havard-tveit-ihle)[4d](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models?commentId=ExcNyQCuMHsEyZfJd)3 2

Incorporating the CAISI-results is not ideal since models are not run in the same setting as the other ARC-AGI2 results. This is a very common pattern, where there are a bunch of benchmarks with interesting results, but it's rare that we have benchmarks where we have:

*   very good coverage of both open and closed models
*   results over a fairly long period of time
*   all the results are directly comparable

The lack of such benchmarks, we have only a few, is what makes this kind of analysis hard.

[Reply](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models)

[[-]](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models)[Håvard Tveit Ihle](http://www.lesswrong.com/users/havard-tveit-ihle)[4d](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models?commentId=q7fJJ44iR7a665JMy)3 0

New datapoints come in as open models are tested and cross a threshold previously crossed by a closed model. There is of course always a problem that each benchmark does not run all the models, so we have to make a judgement in each case (each threshold/datapoint) if both the closed and the open model was plausibly the first model to have crossed that threshold, or if there are other missing models that likely would change the gap significantly if they were included, if so we reject that datapoint.

As for Kimi k2.5 being 10 months behind in one datapoint, this is because we assign all the gaps closed by an open model to the time of the open model release, that is how we define the backward-looking gap. So even though that particular model was less behind the frontier than 10 months, there was a gap there of around 10 months that needs to be counted in the open vs closed comparison. The reason we choose to define the gap in this way, is that then we can compare the data from today with data from previous times without any bias.

[Reply](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models)

[[-]](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models)[StanislavKrym](http://www.lesswrong.com/users/stanislavkrym)[4d](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models?commentId=oAhDPjAoXkzyfkRFT)2 0

Could you explaim the method in more detail? What would you do with a counterfactual OFFICIAL ARC-AGI-2 evaluation of DeepSeek v4 Pro as 40% or 52%?

[Reply](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models)

[[-]](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models)[Håvard Tveit Ihle](http://www.lesswrong.com/users/havard-tveit-ihle)[4d](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models?commentId=3EDrNbfRREH44r4iw)3 0

The methodology is simple. You define a set of thresholds, usually just every 5%, and then we start a clock every time a closed model crosses a threshold, and stop the clock when an open model crosses the same threshold. That is the y-value, a measurement of the gap. Then there is the question of which time (on the x-axis) to associate this y-value with, and we go with the backward-looking perspective and associate the gap with the release date of the open model. The forward-looking perspective would associate the gap with the closed model release date.

As for ARC-AGI 2, here we went with smaller intervals between the thresolds, since there were several scores within a small interval. If DeepSeek-V4 would score 40%, it would cross a bunch of thresholds at once. Some of the thresholds may not count because they would be duplicate (if the same model pair shows up in several thresholds in the same benchmark we only count one of them), some of them may not count if we expect another open model would have crossed it sooner if tested. Any remaining thresholds would be datapoints going into the analysis, the y-value would be determined by the gap since a closed model crossed that threshold, and the x-value would be the release date of DeepSeek-V4.

[Reply](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models)

[[-]](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models)[StanislavKrym](http://www.lesswrong.com/users/stanislavkrym)[4d](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models?commentId=2MWpQdeKGKsHkGBDi)2 0

Does it mean that Deepseek V4-Pro (Apr 24, 2026) would be coupled with Gemini 3 Deep Think, Opus 4.5, Gemini 3 Pro (and Grok 4/GPT-5-Pro since no one crossed the 20/25% thresholds without reaching 30+%?), reaching 5 months for this trio (since it was released in Nov 2025) and 8-9 months for Grok 4 or GPT-5-Pro?

[Reply](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models)

[[-]](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models)[Håvard Tveit Ihle](http://www.lesswrong.com/users/havard-tveit-ihle)[4d](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models?commentId=2Eg2dSGNcxZCCRRsm)3 0

Yea, that sounds right. And some of these thresholds may be judgement calls based on if GLM 5.1 was run etc, but probably I would lean towards accepting them, at least the highest ones. I would have expected DSv4 to shorten the gap more than it has done in the results so far, but if we get scores like this coming in it could affect the results.

[Reply](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models)

[Moderation Log](http://www.lesswrong.com/moderation)

More from[Håvard Tveit Ihle](http://www.lesswrong.com/users/havard-tveit-ihle)

35[A benchmark is a sensor](http://www.lesswrong.com/posts/JzfcJMgfkhfRhwg4C/a-benchmark-is-a-sensor)

[Håvard Tveit Ihle](http://www.lesswrong.com/users/havard-tveit-ihle), [Mathias Bynke](http://www.lesswrong.com/users/mathias-bynke)

24d

2

90[WeirdML Time Horizons](http://www.lesswrong.com/posts/hoQd3rE7WEaduBmMT/weirdml-time-horizons)

[Håvard Tveit Ihle](http://www.lesswrong.com/users/havard-tveit-ihle)

3mo

2

35[Can LLMs Coordinate? A Simple Schelling Point Experiment](http://www.lesswrong.com/posts/fpdjaF7kdtcvmhhfE/can-llms-coordinate-a-simple-schelling-point-experiment)

[Håvard Tveit Ihle](http://www.lesswrong.com/users/havard-tveit-ihle)

8mo

11

[View more](http://www.lesswrong.com/users/havard-tveit-ihle)

Curated and popular this week

130[Empowerment, corrigibility, etc. are simple abstractions (of a messed-up ontology)](http://www.lesswrong.com/posts/vzHtHHBJoKATi5SeK/empowerment-corrigibility-etc-are-simple-abstractions-of-a)

[](http://www.lesswrong.com/recommendations)[Ω](https://alignmentforum.org/posts/vzHtHHBJoKATi5SeK/empowerment-corrigibility-etc-are-simple-abstractions-of-a)

[Steven Byrnes](http://www.lesswrong.com/users/steve2152)

5h

[](http://www.lesswrong.com/recommendations)[Ω](https://alignmentforum.org/posts/vzHtHHBJoKATi5SeK/empowerment-corrigibility-etc-are-simple-abstractions-of-a)

54

251[Bad Problems Don't Stop Being Bad Because Somebody's Wrong About Fault Analysis](http://www.lesswrong.com/posts/PCsmhN9z65HtC4t5v/bad-problems-don-t-stop-being-bad-because-somebody-s-wrong)

[](http://www.lesswrong.com/recommendations)

[Linch](http://www.lesswrong.com/users/linch)

5d

[](http://www.lesswrong.com/recommendations)

73

314[Women should be able to open things](http://www.lesswrong.com/posts/bB5EDwcYH3GwoRWZf/women-should-be-able-to-open-things)

[KatjaGrace](http://www.lesswrong.com/users/katjagrace)

11d

127

[8 Comments](http://www.lesswrong.com/posts/rJcCrXyEsJKmmDpWG/how-far-behind-are-open-models#comments)

8

x

# How far behind are open models? — LessWrong
