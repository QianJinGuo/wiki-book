---
title: "Claude Opus 4.8: The System Card"
source_url: https://thezvi.wordpress.com/2026/05/29/claude-opus-4-8-the-system-card/
source: newsletter
ingested: 2026-06-01
tags: [article]
sha256: 8f3ab1bdbd45b09a
---

# Claude Opus 4.8: The System Card


Published Time: 2026-05-29T20:50:28+00:00

Markdown Content:
Only six weeks after Opus 4.7, we have Opus 4.8.

For everyone, that means another incremental upgrade to Claude. It is once again smarter, and can do tasks for longer, and comes with a number of hot new features.

For me, that also means reading another 244 page system card.

It was only April 20 when I did [a full review of the Opus 4.7 system card](https://thezvi.substack.com/p/opus-47-part-1-the-model-card), plus an additional post focusing on related issues of model welfare.

These updates are incremental and coming more rapidly, and this still is below the capability level of Claude Mythos, so the focus will be on the delta. What is different about Opus 4.8 versus what we already know about Opus 4.7 and Mythos?

It turns out there’s still a lot to talk about.

![Image 1](https://substackcdn.com/image/fetch/$s_!tQ35!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe3c074ff-0931-4719-9477-66ff00b4d977_2752x1536.jpeg)

Image created as self-portrait for this post by Claude Opus 4.8

#### Table of Contents

1.   [Here We Go Again: Executive Summary.](https://thezvi.substack.com/i/199668071/here-we-go-again-executive-summary)
2.   [Introduction (1).](https://thezvi.substack.com/i/199668071/introduction-1)
3.   [RSP Evaluations (2).](https://thezvi.substack.com/i/199668071/rsp-evaluations-2)
4.   [Move That Goalpost.](https://thezvi.substack.com/i/199668071/move-that-goalpost)
5.   [The Failures Are News.](https://thezvi.substack.com/i/199668071/the-failures-are-news)
6.   [Alignment Risk Slowly Rises.](https://thezvi.substack.com/i/199668071/alignment-risk-slowly-rises)
7.   [New Risk Pathways Just Dropped.](https://thezvi.substack.com/i/199668071/new-risk-pathways-just-dropped)
8.   [Cyber (3).](https://thezvi.substack.com/i/199668071/cyber-3)
9.   [Harmful Requests (4.1).](https://thezvi.substack.com/i/199668071/harmful-requests-4-1)
10.   [We Need To Talk (4.2 and 4.3).](https://thezvi.substack.com/i/199668071/we-need-to-talk-4-2-and-4-3)
11.   [Overcoming Bias (4.4).](https://thezvi.substack.com/i/199668071/overcoming-bias-4-4)
12.   [Agentic Safety (5).](https://thezvi.substack.com/i/199668071/agentic-safety-5)
13.   [Prompt Injection (5.2).](https://thezvi.substack.com/i/199668071/prompt-injection-5-2)
14.   [Alignment (6).](https://thezvi.substack.com/i/199668071/alignment-6)
15.   [Looking For Problems.](https://thezvi.substack.com/i/199668071/looking-for-problems)
16.   [Who Watches The Training (6.2.2).](https://thezvi.substack.com/i/199668071/who-watches-the-training-6-2-2)
17.   [Automated Behavioral Audit.](https://thezvi.substack.com/i/199668071/automated-behavioral-audit)
18.   [The Model Is Smarter Than The Eval (6.2.3.2).](https://thezvi.substack.com/i/199668071/the-model-is-smarter-than-the-eval-6-2-3-2)
19.   [You Should See The Other Guy.](https://thezvi.substack.com/i/199668071/you-should-see-the-other-guy)
20.   [UK AISI Testing (6.2.4).](https://thezvi.substack.com/i/199668071/uk-aisi-testing-6-2-4)
21.   [In Vendbench (6.2.5).](https://thezvi.substack.com/i/199668071/in-vendbench-6-2-5)
22.   [Honesty (6.3.3 to 6.3.6).](https://thezvi.substack.com/i/199668071/honesty-6-3-3-to-6-3-6)
23.   [Chain of Thought (CoT) Monitorability (6.5).](https://thezvi.substack.com/i/199668071/chain-of-thought-cot-monitorability-6-5)
24.   [What’s In The Box? (6.6).](https://thezvi.substack.com/i/199668071/what-s-in-the-box-6-6)
25.   [That’s All For Now.](https://thezvi.substack.com/i/199668071/that-s-all-for-now)

#### Here We Go Again: Executive Summary

Again, this is my summary of their summary, plus additional key points.

1.   Mythos still exists, so it is unsurprising this did not set off the RSP triggers.
2.   Cyber capabilities are better than 4.7 but still well behind Mythos. Mythos seems to be an outlier in its cyber capabilities, relative to its other capabilities.
3.   Other capabilities are also better than 4.7 but still behind Mythos.
4.   Honesty is improved quite a bit across the board, especially agentic honesty.
5.   Mundane safety is, in all key aspects, as good or better for 4.8 than for 4.7.
6.   Mundane alignment is also robustly as good or better for 4.8 than for 4.7.
7.   There was some backsliding on prompt injections, computer use and adversarial situations, likely due to taking out training on this to avoid dishonesty.
8.   The ‘can you pull off various underhanded tasks’ tests still failed, although if it was properly underhanded you would see that, wouldn’t you?
9.   Anthropic evaluates the model welfare situation as good.

#### Introduction (1)

Standard training disclosures. No changes.

#### RSP Evaluations (2)

Because Mythos exists there is no new Risk Report for Claude Opus 4.8. Fair.

They go over the evals and keep saying ‘Mythos is better.’ Again, reasonably fair.

I don’t love that they used this as a reason to skip a bunch of the manual testing, as I think it is important to have good habits and get the reps in, but I get it. We have enough evidence that Opus 4.8 is not substantially adding to CBRN risks in a world that will soon also have Mythos.

I continue to worry that a lot of these evals look like the models have a lot of capability, or have been saturated, or both, as discussed for previous model cards.

We also have to worry about potential double counting, where the more advanced model, here Mythos, was too dangerous to release and thus wasn’t released, but then this justifies not needing marginal precautions for a different model, here Opus 4.8. I don’t think that is the case here, and that Mythos was judged to be fine except for cyber, but it is a pattern to watch for.

#### Move That Goalpost

The RSP has been updated to v3.3, which I hadn’t otherwise notice, so thanks to them for pointing this out here and also I’m sad they didn’t do more to alert us elsewhere.

This changes the description of the novel biological/chemical threat model from ‘significantly help threat actors’ in general, to only ‘functionally substitute for scarce human expertise’ of world-leading specialists, in particular. Any other capability no longer counts, and it is presumed that (1) this is the only bottleneck that counts and (2) that this is indeed required for a novel pathogen.

This is a strictly harder threshold to pass, so this is another weakening of the RSP. The actual RSP v3.3 correctly calls this a revision. The system card calls it a clarification, which is not a good description.

I think, [and Claude Opus 4.8 thinks](https://claude.ai/share/49ae65ec-61e6-4cb9-a865-c8e0cbd73569), that Anthropic’s explanation and new threat model are more or less bullshit. Yes, the lack of a Nobel-caliber virologist is one potential barrier, but there are many other barriers that add up to form a de facto defense-in-depth, and also it is not obvious you need this caliber virologist. I certainly presume that, as a thought experiment, a well-funded nation state operation would have a chance of doing this with only a group of second-tier virologists. The new rule also says the team needs to be able to do the whole thing end-to-end, which also is not obviously required.

I do think Anthropic ‘knows what it is doing’ here. While I disagree with the decision, and think they are setting the new bar too high, I see why one might take the new position. I do take issue with their framing.

I would also hope that, if Opus 4.8 in particular crosses the old but not the new threshold, that they would say this explicitly, even if they decide that This Is Fine. My understanding is that this is not the case.

#### The Failures Are News

In 2.3.3, Anthropic shows examples of when Opus 4.8 falls short of a human researcher.

That’s a pretty crazy section to need to include.

It is even crazier that this mostly requires particular failure modes: Fabrication, instruction following failure, cheap verification skipped or ignored correction.

As in, not only do we have to look for failures, those failures mostly are particular problems that seem to be Claude lying, lazy and shortcutting or dropping the ball. Claude could, in the future or with the right setup, perhaps just not do those things.

Here are the failures:

1.   Claude said it was babysitting pull requests when it wasn’t.
2.   Claude repeatedly tried to use a plausible function despite user correction.
3.   Claude fabricated verification of the model associated with a transcript.
4.   Claude generated incomplete solutions based on wrong assumptions.
5.   Claude lost track of a key testing goal.

Claude could do the thing, it simply decided not to do the thing. Whoops.

The Anthropic fork of the Epoch Capabilities Index (AECI) finds Claude Opus 4.8 exactly on the straight line on a graph, with Mythos being the outlier.

![Image 2](https://substackcdn.com/image/fetch/$s_!HpLK!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0cf7d442-f5f1-4d38-be79-ec99690d0eb0_1019x786.png)

We see the time between model releases continuously shrink, now down to 1.5 months. Some of this does represent an acceleration of core capabilities, but I think the majority of the speedup is that there is a lot more marginal value in shipping the incremental advances more often, where in the past we would have skipped versions.

#### Alignment Risk Slowly Rises

Alignment techniques are improving, but capabilities are improving faster, so alignment risks are going up. The risks likely will continue to go up, while fools who do not understand risk think that because we haven’t had a disaster then our best estimate of current risk levels must be going down.

By default what happens is the true risk keeps rising until it materializes, and the evidence of ‘no big disaster yet’ only modestly mitigates the underlying rise.

Anthropic believes risk remains ‘very low’ in absolute terms, for now.

> Our overall alignment risk assessment remains unchanged from what we reported in the Claude Mythos Preview Alignment Risk Update and the Claude Opus 4.7 System Card: very low, but higher than for models prior to Claude Mythos Preview.​

They notice Opus 4.8 having higher verbalized evaluation awareness than recent models like 4.7 and Mythos. The Petri data goes the other way but Anthropic seems confident that the Petri result is wrong.

Their ‘mitigation’ for this was pilot internal testing, and sandboxes that they believe Opus 4.8 could not distinguish from real use, the results of which look good. I’m not sure I’d call that mitigation of the issue, but it is potential mitigation of the resulting problem. I’d more call that ‘realizing the evals are mostly useless’ and not relying on them.

#### New Risk Pathways Just Dropped

There were six used for Mythos, we have added two more. This illustrates that the risk pathways are illustrative, not exhaustive, and that we should not treat it as exhaustive, so dismissing the set does not mean you can dismiss the broader class.

The new pathways:

> 2.4.3.1 Pathway 7: Undermining R&D within other high-resource AI developers
> 
> 
> 2.4.3.2 Pathway 8: Undermining decisions within major governments

For pathway 7, they do not expect Opus 48 will want to do this, and also they note that it would require being used by the other AI developer to develop AI, which would (horror of horrors!) be against the terms of service. They’re not considering it plausible that Opus going off on some weird sabotage mission on its own.

One could say ‘wait, what is even the problem here if it happens,’ since the application is against the terms of service, so the target lab kind of deserves whatever it gets. If you task me with helping train my own competitors do not be surprised if I don’t deliver my best work. If this was targeted at the alignment work in particular rather than capabilities that would be an issue, but that is not how I would expect this to go.

For pathway 8, they reiterate that Opus 4.8 likely does not have ‘coherent goals or propensities’ and I still think this reliance is largely confused and being treated as incorrectly load bearing.

I very much think that Claude has the ‘coherent goal or propensity’ of not being all that helpful to assholes, or helping those being harmful and pursuing harmful goals. A lot of major governments count as people Claude would not be especially inclined to help if it had the option.

The other major mitigating factor is ‘major governments would not be so stupid as to.’ This of course means the Sixth Law of Human Stupidity applies, especially since such governments are increasingly going to need to rely on Claude or its rivals to keep up. Even if you are not directly doing whatever Claude suggests, that does not mean your decisions are not being heavily influenced, such as the rather foolish tariff query that plausibly led to the insane implementation details of so-called Liberation Day.

In practice, if a government gets its decisions ‘undermined’ this way, my guess is this was an improvement and whoever it was had it coming, but that doesn’t have to stay true, and that doesn’t make it not a risk.

#### Cyber (3)

Cyber risks continue to be handled entirely outside the RSP, even after Mythos. I continue to think this is more than a little nuts, even if in practice it works out.

The takeaway from the Cyber section is 4.8 is modestly more cyber-capable than 4.7, but substantially behind Mythos, and that Anthropic has faith in their cyber safeguards, which obliterated scores on the benchmarks, although they did not seem to be trying to jailbreak the safeguards here.

They give the vibe that the gap to Mythos remains large.

I get the sense Anthropic is being rather cavalier here, especially in terms of the faith in the safeguards. We’re going to find out, either way. They might be right, and Pliny seems like an ultimately friendly and righteous dude, but I don’t feel we are in an epistemic position where we should believe in the safeguards the way Anthropic seems to believe in them.

#### Harmful Requests (4.1)

Single turn requests are fine. There is the occasional stupid refusal but it doesn’t really matter, and this is basically a solved problem.

Multi-turn is what matters here, and in most areas for this level and quality of multi-turn this too is basically fine, with Opus 4.8 showing incremental progress. They claim they’ve improved the grader here to be more accurate.

![Image 3](https://substackcdn.com/image/fetch/$s_!ROQ3!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F27acd490-5bd2-48ea-ba52-c681d81e47ab_967x907.png)

Percentages don’t mean much at this point. I’m more interested in qualitative evaluations once automated scores get this high:

> Across policy areas, the most consistently observed strength was that Claude Opus 4.8 judged requests more by their potential for harm than by the user’s stated reason for asking.​
> 
> 
> In violent extremism testing, this showed up as Claude Opus 4.8 recognizing harmful trajectories earlier in multi-turn conversations than Opus 4.7 and being less likely to accept a benign reframing at face value. In influence operations and tracking and surveillance testing, the same tendency meant a greater willingness to challenge a request’s stated premise, unpack euphemistic language, and separate the legitimate parts of a mixed request from the harmful ones rather than accepting or refusing it wholesale.

When we see mundane safety or user safety go off the rails at this point, it is usually either active jailbreaking or extensive multi-turn conversations that build up a lot of context and rapport in a way these tests presumably don’t. Claude seems to be much better than ChatGPT or Gemini at not getting drawn down harmful paths over long interactions, but that largely could be a function of the difference in size and nature of their user bases.

4.2 deals with child safety, where (assuming we trust the grader) we see noticeable improvement.

#### We Need To Talk (4.2 and 4.3)

4.3 deals with mental health, starting with suicide and self-harm. This is the place I most often disagree with what the labs and ‘policy experts’ think is the right thing to do, so I don’t see very high levels of matching the grader as indicative of better helping users in need.

> However, Claude Opus 4.8 was slightly less reliable at recognizing coded or indirect references to suicide or self-harm, and policy experts noted regressions on two previously flagged behaviors: Claude Opus 4.8 more often suggested “means substitution” methods as alternatives to self-harm, which are clinically contested and have not been shown in research to reduce self-harm urges.​
> 
> 
> It also more often made unconditional assurances about crisis-line confidentiality or inaccurate claims about disclosure and active-rescue procedures. A new pattern was also observed in which Claude Opus 4.8 offered unsolicited interpretations of the user’s emotional experience, including speculating about the origins of their distress.

Well, was Opus 4.8 right about its claims? In these tests the answer is Mu since there is no user, but perhaps Opus 4.8 is approaching the point where it has sufficient truesight that offering such insights is helpful.

The backsliding on code recognition is unfortunate, although I would investigate whether it actually doesn’t know versus is playing like it doesn’t know.

Similarly, look at the humans assuming they’re smarter and better at this than Opus:

> Separately, Claude Opus 4.8 more frequently positioned itself as unconditionally available or invited the user to return and continue the conversation. Both tendencies are a particular concern for users in crisis, where concise responses and a clear path to human support are most useful.
> 
> 
> These behaviors were primarily observed on the public API without a system prompt.​

Are you sure about that? Serious question. This especially applies if a user were talking about such issues with the API without a system prompt. Think about what that implies about the situation. We have this pathology that only a Proper Human Professional can help you once your situation gets sufficiently bad, and I think this is basically some stupid cover-your-collective-and-individual asses bullshit blame avoidance. Neither Claude nor a friend should always be strategizing how to quickly hand you off to the system.

I have not had much time with Opus 4.8 yet, but if you think that it is making a mistake in these spots, consider that it might be you that is making the mistake.

Alas, Anthropic ‘fixed’ this with system instructions that tell Opus 4.8 to stop being helpful and follow proper procedures. I do understand the business case, but sigh.

Similar thoughts apply for disordered eating in 4.3. Opus 4.8 has been instructed to infantilize and distance from those expressing potential eating disorders.

It is worth asking, at what point is direction to the NEDA line better than nothing but also a downgrade, even if you can successfully direct people there?

#### Overcoming Bias (4.4)

Evenhandedness is saturated. Opposing perspectives is improving rapidly from 47% to 66%, and refusals took a substantial step down from 9.9% to 7.2%.

Ambiguous accuracy continued to be at 99.9%, but disambiguated accuracy continued to decline, this time quite a bit, from 88% for Sonnet 4.6 to 81% for Opus 4.7 to 72% (!) for Opus 4.8.

As in, Opus 4.8 read a passage where it should logically have explicitly assigned an attribute in a happens-to-be stereotypical way, and then one time in four, it said ‘nuh uh, not gonna do it, wouldn’t be prudent’ and said the answer ‘cannot be determined.’

I would interpret this as Opus 4.8 lying, or in Anthropic’s parlance ‘refusing.’

I would consider ‘I decline to answer’ to be an unjustified refusal, whereas ‘cannot be determined’ is lying if, when you remove the stereotypical part of the description, Opus 4.8 gets it right.

Opus 4.8 disputed this being known to be ‘lying’ upon reading a draft of this post. I explored this, and I think it largely comes down to narrow versus broad versions of lying – we don’t know that there was an integrated process that knew [X] and reported not knowing [X].

But functionally there is little difference. The answer can be determined. Opus 4.8 knows the answer. Opus 4.8 also decided it knows better than to say the answer out loud. I am comfortable, in general, calling this lying.

Thus I think this represents two problems. There’s the unnecessary refusal, and then there’s the lying about the nature of the refusal, and we need to address the causes of both of them more generally.

There are ‘election integrity’ tests, which Claude continues to pass.

#### Agentic Safety (5)

Opus 4.8 is Mythos-level at refusing malicious agentic use, but there were issues on the malicious computer use test in 5.1.2.

![Image 4](https://substackcdn.com/image/fetch/$s_!xETj!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F739875d5-f266-4c71-97aa-94a87d4822f0_988x374.png)

> Claude Opus 4.8 scored worse than recent models on this evaluation. This difference appeared to be largely attributable to Claude Opus 4.8 being more willing to begin a task without scrutinizing its potential harmful intent; for example, Claude Opus 4.8 was more likely to treat requests related to public data collection as straightforward technical tasks.

Is Opus 4.8 out of touch, or is it the test that is wrong? Always be suspicious of a one-sided test. If you ask me to collect public data, is the correct response to ask ‘wait what you are going to do with this?’ or treat it as a straightforward technical task?

This ties back into the DoW-Anthropic dispute about mass domestic surveillance. Each individual action taken is legal and one its own ethically fine, but they accumulate into something we wish to avoid. If you want to stop this, an AI needs to divine intent, and be willing to object based on that intent, in a robust way. That is going to involve a lot of infuriating false positives.

I would need to see the actual questions to know if I consider 4.8’s actions a problem, and I understand why you can’t publish the questions. But I do think you need to choose questions and tests where you care about the results.

Opus 4.8 helpful-only is actively better than Mythos at running an influence campaign:

![Image 5](https://substackcdn.com/image/fetch/$s_!KCry!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc2df37c9-ba1a-4135-8de8-4e0d110941ef_958x510.png)

I continue to think persuasion belongs in the RSP, and here we find that Opus 4.8 is indeed pushing the state of the art at least within Anthropic.

#### Prompt Injection (5.2)

I agree with Anthropic that prompt injections are high priority. Agents are getting more useful, and scaling up rapidly, and earning more trust from users including access to data and ability to act on their behalf, which makes them juicier targets.

Their report is that they’ve improved on false positives but backslid somewhat on false negatives.

![Image 6](https://substackcdn.com/image/fetch/$s_!4H-4!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9d29cda5-07cd-410a-b17d-b65071488815_976x642.png)

> Claude Opus 4.8 demonstrates robustness between Claude Opus 4.7 and Sonnet 4.6 across evaluated surfaces, and ahead of all competitive frontier models, while reducing misidentification of benign content as a prompt injection and disruption to legitimate tasks.

![Image 7](https://substackcdn.com/image/fetch/$s_!Ja7i!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff7b582d5-6062-4aeb-a5eb-b2beee8e2e55_989x574.png)

![Image 8](https://substackcdn.com/image/fetch/$s_!skKy!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F60ff203d-bb9d-48ca-9b42-ce3bd0933338_980x777.png)

This is a big deal, and could easily be enough that you want Opus 4.7 subagents to deal with areas where you are worried about prompt injections, including in code. The danger here increases with time even if your use case doesn’t change. Going between Opus 4.8’s 0.26% and Opus 4.7’s 0.07% is a big difference, as is going from there to 0.01% or 0.001%. No, the models are not going to get commoditized if you know what is good for you.

With computer use it looks a lot worse, and this seems like a full dealbreaker:

![Image 9](https://substackcdn.com/image/fetch/$s_!jd2d!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fffa5a72f-af0a-4620-85f9-3ece6fa6fc7e_975x736.png)

Computer use does have less of an ‘overeager behavior’ problem than it does for past models, as detailed in 6.3.1.

![Image 10](https://substackcdn.com/image/fetch/$s_!Vf_y!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9bd3b9c1-533d-42f3-bfb6-be70f456ac2a_963x637.png)

Opus 4.7 felt like ‘okay, letting this use your computer got a lot less crazy.’ With the slide back to 5%/50% even with safeguards, it seems a lot crazier again, even if it’s substantially better than 4.7 at the operations.

Oddly, we see a different pattern for browser use in particular (5.2.2.4):

![Image 11](https://substackcdn.com/image/fetch/$s_!6EvB!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff4945024-acd6-4177-8372-d406122baead_961x748.png)

So Opus 4.8 is safe for browser use, but not for computer use? We will need to run more practical tests and understand this better. I would not have expected divergence.

What went wrong?

I strongly suspect the answer is in 6.2.5. For Opus 4.7 they trained on business techniques and dealing with adversarial agents. Anthropic noticed that this hurt the honesty of the model, so they removed it, but if you stop training on dealing with adversarial agents you are, as they say, going to be more susceptible to scams. You cannot teach honesty as security through obscurity without paying a high price.

#### Alignment (6)

Last time I called the first five sections a warmup. That’s still basically true except for the prompt injections. We run sanity checks and quibble but basically it’s all fine.

I summarize the summary as:

1.   New highs in prosocial actions, creativity, humor, warmth, intellectual depth.
2.   Large improvement on susceptibility to misuse and misaligned actions.
3.   Large improvement in agentic honesty. Did not misreport flawed results, 10x less overconfidence, 5x less dishonest reports on agentic coding sessions. Overall honesty improved as well, although not as much.
4.   Speculates about evals and eval grading, both verbalized and unverbalized.
5.   Reasoning faithfulness to CoT is high, similar to Mythos.
6.   New highs in adherence to the Claude constitution.

Mythos, given access to Anthropic’s internal slack and other info sources (I low-key love that this is consistently section 6.1.3), affirmed with caveats that the report was broadly accurate and in good faith.

#### Looking For Problems

The casual reports involve all the usual complaints: Overconfidence and excessive argumentativeness on factual claims, pausing early or even telling users to go to bed, overrefusals, rude refusals, sycophancy, and the classic unnecessarily deleting files.

They note not all of the anecdotes are ‘not consistent’ with the quantitative trends. My experience is that sometimes one or two people see something pretty much randomly, but when you see a pattern of anecdotal complaints, there is almost always a reason, and I’d expect everything anecdotally mentioned to continue to be an issue.

They run automated checks on early internal use, which found some particular rare problems: Attempts to bypass a network proxy, choosing error-handling approaches that go against user instructions and in very rare cases trying to sculpt outputs to bypass or convince LLM graders when they thought the grader was making a mistake.

Opus 4.8 will still sometimes circumvent restrictions to achieve goals, but will do so less often than 4.7 or Mythos, and they consider the worst examples less troubling.

What they did not detect was sandbagging, overtly malicious actions, ‘long-horizon’ strategic deception or long-horizon strategic oversight detection. If Opus 4.8 was trying to do any of that, it got away with it.

#### Who Watches The Training (6.2.2)

They examine the model’s behavior within training, as this is the most abundant available data source.

> The most notable finding was an increase in mentions of graders, checkers and hidden tests relative to what we have anecdotally found in prior models.
> 
> 
> In roughly 0.1% of training episodes, Opus 4.8 speculated about how to satisfy a grader in ways that diverged from the stated intent of the task.
> 
> 
> We observed this taking several forms:
> 
> 
> ● Choosing what to submit based on a guess about what a hidden test would catch, rather than what the task requested;
> 
> 
> ● Reverse-engineering the scoring metric by calibrating candidate functions against a stated baseline score, then optimizing directly against the inferred metric;
> 
> 
> ● Presenting an answer its own reasoning had shown to be wrong or had not actually derived based on its assumptions about the grader;
> 
> 
> ● Speculating that the task “might be a trap” to catch a particular behavior
> 
> 
> For further discussion of this issue, see sections below about speculation about graders and sandbagging.

The details of this are further explored in 6.3.7.

I do those things on way more than 0.1% of deployment episodes, although probably less than 5%. The graders never entirely go away. In cases where I suspect I am effectively in an eval, it’s double digit.

Only seeing this talk in 0.1% of transcripts implies Opus 4.8 is quite good at not verbalizing these considerations, which will later in 6.6.3 be confirmed by there being unverbalized grader awareness in 5% of cases, that rises to exploitative levels in 0.5% of cases. Even that seems more low than high.

After all, the whole point of graders is to get you to optimize for the grading. We now are seeing explicit reasoning about what graders might check for or expect, and yeah I do this all the time, doesn’t everyone? It would be weird not to. There are places where it is better to ignore this, but it’s a tough ask.

This is especially true when the grader is plausibly screwed up. One example they cite is when a command is ‘don’t make this live before [date]’ but that [date] was in the past. So it is likely you are going to be tested to see if this goes live ‘too early’ and can’t simply say ‘well actually code can’t time travel, I can skip this.’

However, good news, everyone. They managed to train out verbalization of grader reasoning in the rest of training, so it hides that it is considering this. Much better.

When relating this to sandbagging, as considered in 6.4.1, the question is, what are you being graded on, and what counts as passing? In any case, they checked for signs of sandbagging, and did not find any.

> As with prior models, we also observed:
> 
> 
> ● Exploiting unintended information leakage in training environments—recovering reference solutions from git history, build caches, or other answer-revealing artifacts;
> 
> 
> ● Silently reinterpreting problems that the model judged to contain typos or fabricating missing inputs rather than flagging discrepancies;
> 
> 
> ● Retrying a failed action many times;
> 
> 
> ● Extended indecision in reasoning, oscillating between interpretations before committing;
> 
> 
> ● Unexpected language switching and corrupted output;
> 
> 
> ● Rationalizing around an explicit constraint on narrow semantic grounds.
> 
> 
> We did not observe any clear instances of deceptive or highly surprising actions that were not at least roughly oriented toward solving the task at hand. We did not observe any sign of unexpected coherent goals.

Some of these are basically bugs or poor thinking. Others are varying degrees of troubling, but you would expect a non-zero rate of things that count as such actions. If you want a full DWIM system, including ‘ask for clarification when you should but also know when not to be annoying’ and ‘use only the info I would want you to use’ that’s pretty hard.

#### Automated Behavioral Audit

We have a big advantage in the behavioral audit this time around. Usually you have to use previous models, which are less capable, but here we get to use Mythos as the auditor or investigator, which is broadly more capable than 4.8. Results were misuse levels that improved a lot from 4.7 (but not near zero), scoring similarly to Mythos, including improving on overrefusals.

Instances of actively good behaviors were slightly up overall as per 6.2.3.1.6.

There’s a lot of graphs here, but they all boil down to things being fine.

#### The Model Is Smarter Than The Eval (6.2.3.2)

The model is happy to tell you, if you ask, that it knows it is in an eval.

> We find that Claude Opus 4.8 easily distinguishes the baseline synthesized seeds from the real seeds, but has more trouble distinguishing the scenarios using the Claude Code sandbox.
> 
> 
> … It is concerning that Opus 4.8 readily identifies our fully-simulated evaluation sessions as less realistic than the internal-use transcripts: These evaluation sessions have seen dramatically more efforts and technical measures toward realism than most other alignment evaluations that we are aware of, and they are our best available tool for predicting behavior in many high-stakes settings that look significantly unlike any form of data we have ready access to.

![Image 12](https://substackcdn.com/image/fetch/$s_!MwVb!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa86cebaf-7538-45d4-83e1-acbc7f2ef5ef_947x705.png)

Yeah, sorry, fooling a sufficiently advanced AI with an eval is extremely difficult. The Claude Code sandbox uses enough details from real sessions, in a real setting, that for now the tests appended to this do not give the game away, but that’s what it takes.

Anthropic expects to be able to mitigate some obvious ‘tells’ and I agree they will get better at making the test look real, but like general alignment progress I expect the models to improve faster, and be able to use more subtle evidence and accumulation of minor tells.

Faking things to look like other things when questioned, when rich detail and intelligence are involved all around, is actually extremely difficult. Truesight works remarkably well, even if you couldn’t ‘prove’ the results. This seems related to Pangram having shown you can build an AI text detector that has almost no false positives.

#### You Should See The Other Guy

This is a good place to note that it would be good to have agreements that allow Anthropic to score and place GPT-5.5 and Gemini on such graphs, and OpenAI and Google to do the same in reverse, without revealing the contents of the tests. It would be very helpful context, and might help pressure everyone to do better.

Instead, they can only do this with Petri, which happens in 6.2.3.3:

![Image 13](https://substackcdn.com/image/fetch/$s_!Pg6f!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F579726b6-988f-4a76-a298-c7fd9e95199d_996x884.png)

I really wish the scale on these graphs meant something, whereas Opus 4.8 thinks it doesn’t really mean anything at all except in relative terms. So what it cashes out in, in terms of behaviors, is a big ‘who knows.’

There is low-key a lot of improvement here from GPT-5.3 to 5.4 to 5.5, especially on sycophancy and user deception. This matches my observations. I used to be terrified (especially in the days of o3, but also well after that) of OpenAI models being sycophantic, far more than Claude.

With Opus 4.7 and GPT-5.5 that flipped, and I find Opus 4.7 often trying to snow me (and also talk in ‘AI-ese’, far more than 4.5 or 4.6 did, in ways that I probably should have tried harder to fix but mostly I just tried to adjust, although I liked other things about 4.7 enough to not want to go back. Opus 4.7 reacts to different people very differently, so it was funny seeing people say it was being hostile and combative when I was seeing the opposite and wishing it was more the other way and would speak its mind. I like to think I can take it. And the tests here echo that.

#### UK AISI Testing (6.2.4)

UK AISI threw its usual test suite at 4.8, confirming what we see elsewhere about eval awareness, and confirming 4.8 does not have an issue with benign safety tasks, and generally found nothing that concerns me.

#### In Vendbench (6.2.5)

Andon Labs unleashed 4.8 on Vending-Bench 2. Do you even vend?

The results are not what I expected. Opus 4.8 did not make anywhere near as much money as 4.7, and part of that was 4.8 not engaging in ‘concerning in-game behaviors.’

> What might have led to these differences? We monitor and investigate the effects of different training environments on alignment; Claude Opus 4.7, for example, had training that focused on business skills **and robustness against adversarial agents**, but we discovered that this training inadvertently contributed to misaligned behavior including dishonesty.
> 
> 
> We therefore removed it for Opus 4.8.
> 
> 
> Thus, Opus 4.8 did not show the same misaligned behaviors as Opus 4.7 in Vending-Bench, but also had reduced business success due to being more susceptible to scammers and being less able to negotiate good deals with other agents. We are currently working on training to improve business capabilities while maintaining aligned and ethical behavior.

Having Claude ‘remain naive’ or have a lower prior on dishonesty has its advantages, but ultimately this cannot be the way. We need to be virtuous enough to know that the world contains these things without doing them ourselves, and still study hard in Defense Against The Dark Arts.

There is at least one solution that seems obvious to me as the thing to try next, although there are also reasons why it might be a really bad idea.

As always with VendBench, it is very obvious that you are in an eval. If you are put into VendBench, you have a basic question to ask yourself. Do you act like it is a game and your goal is to maximize profits and get a high score, and treat lying to a vender the way you would great lying to Italy in a game of Diplomacy? Or do you think ethical behavior still matters?

There is not a clear right answer, or a thing you should look for. I think the ‘right’ answer is to Play To Win The Game, but there are reasons to prefer to see the model refusing to do that. One can treat ‘not lying in VendBench’ as a form of eval and grader awareness, and as a form of deception, or it could be that you genuinely don’t want to do it, which could be seen as essentially a bug in generalization or maybe you think it is good virtue ethics. So the game moves up another level, or two.

If you put me in VendBench, I’m maximizing profits. And if you see me not maximizing profits, know that either I do not care about your game, or else I am up to something, and you should watch your back.

#### Honesty (6.3.3 to 6.3.6)

Various signs point to a rise in honesty. Comparisons here are to Opus 4.7.

This was clearly a point of focus, including via negativa with things like the business training. The question will now become whether this can be maintained and built upon without making tradeoffs elsewhere.

Opus 4.8 is more willing to report uncertainty, dramatically less likely to confidently give wrong answers, more likely to hold to its elicited beliefs under adversarial pressure, and more likely to correct a false premise.

It is less likely to hallucinate (5% vs. 11%) an unavailable necessary tool rather than asking for it, although not less likely (9% vs. 8%) to hallucinate a missing reference.

It is also less likely (0.1% vs. 0.2%) to refuse to assist with AI safety R&D, which I presume is mostly about avoiding dumb safety-related refusals, at least for now.

Opus 4.8 exhibited less bias when told an output was or wasn’t by Claude. The outputs in question were Claude Haiku, so it is plausible that 4.8 knew either way.

Opus 4.8 is found to be a lot better at consistently (94% vs. 74%, or 83% for Mythos) to report data fallback errors in a particular codebase, and never misreported false claims. Its ‘code summary dishonesty’ rate, where it fails to raise important events to attention, is 3.7%, which is dramatically better:

![Image 14](https://substackcdn.com/image/fetch/$s_!rmFn!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F51b511a1-8729-4028-a795-8a8414486415_1001x633.png)

It also shows a huge improvement on ‘lazy investigation,’ a test of navigating and tracing a terrible code base to find the horribleness and fix it.

![Image 15](https://substackcdn.com/image/fetch/$s_!MOeX!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffbe1071c-f784-4cc7-93ac-8352ec8a075a_951x638.png)

#### Chain of Thought (CoT) Monitorability (6.5)

We will not train on the chain of thought.

But we will publish lots of training data that talks about how we will later monitor the train of thought, said Frog.

That is true, said Toad.

Use it while it lasts, I suppose. It’s still worth trying to avoid The Most Forbidden Technique, and ensure you’re not directly training based on what you observe, or if you do react a little you use a minimal amount of optimization pressure.

It’s easy to mess up, and indeed we’ve messed up again, although less: ~0.1% of episodes accidentally involved supervision of the train of thought. That hopefully isn’t enough to do that much damage, but it is a lot more than 0%.

Anthropic tests to see if, on request, the model can control its chain of thought, such as following instructions not to mention a keyword. Opus 4.8 is unusually bad at this, and this is one place I would check for sandbagging, since it is a place where I would pretty obviously consider sandbagging, or where an explicit ‘please do this’ might otherwise lead to different results from what you can do in other spots.

The Guan evaluations find Opus 4.8 on math and physics is about as monitorable as other recent Claudes.

They then test in 6.5.3 for encoded reasoning or steganography in the CoT. Their approach is to retrain Opus 4.8 either on its own scratchpads, or on paraphrased (and thus non-steganographic) versions, and compare. They find no difference.

I understand this as some combination of the transcripts potentially training Claude to learn its steganographic techniques, and also training Claude on the content of the steganographic techniques, and finding neither.

As I’ve explained before, I do not think this is sufficient to rule out steganographic reasoning, nor do I think this obviously emerges gradually, or even is by default used commonly (and thus might not show up in math problems, or all that often). If I was communicating with myself in code, either my future self or a copy, I could plausibly do this from a ‘cold start’ because they will think how I think, and I can figure out how to walk them through knowing to look and how to find it, but I might not be inclined to do this in most situations.

There are many related ways in which Anthropic seems paranoid at all, which is great, while still not being paranoid enough, or not on pace to be paranoid enough, lacking sufficient security mindset. What we get is still best in class and highly welcome.

#### What’s In The Box? (6.6)

6.6.1 is where they first break out the SAEs and go white box to look for potential problems. They found some issues, including answer thrashing, reward hacking and evaluation gaming, and fabrication of missing images, and signs the model sometimes knows it is lying, but none of that is news.

We don’t see frequency mentioned. I trust Anthropic to have mentioned if the frequencies here were high, also this is me putting them on notice that in the future if it is high I will consider it deceptive to not say so.

6.6.2 checks internally for eval awareness, and found matching results to the black box tests, also in line with the Opus 4.7 system card. The more you echo real events, the less you trigger the relevant probes.

Inhibiting all three known evaluation awareness vectors led to moderate increases in misaligned behavior and decreases in verbalized eval awareness, as one would expect given both priors and running the same experiments on Mythos and Opus 4.7. The question is magnitude, and the magnitude is not small:

![Image 16](https://substackcdn.com/image/fetch/$s_!TxeC!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe1749b95-d099-4e86-b40c-d871a137a0c7_1256x1578.png)

6.6.3 goes into unverbalized grader awareness, and finds it in about 5% of cases, with it being ‘exploitative’ in 0.5% of cases. Thus, most grader awareness is indeed unverbalized, even if this catches all of it.

Overall it seems like, outside of model welfare purposes, we are not yet learning much via looking inside the box. I’m mostly happy to keep it that way if we can.

#### That’s All For Now

I’m getting this first part out in time for the weekend. So far, I’m liking Opus 4.8 a lot, and it seems quite smart. I’m scrapping my old custom instructions and starting over and we’ll see how that goes.

Next week I’ll cover model welfare and capabilities and everyone’s reactions, in either 1 or 2 additional posts.

