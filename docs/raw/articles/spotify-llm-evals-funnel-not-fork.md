---
title: Better Experiments with LLM Evals — A funnel, not a fork | Spotify Engineering
source: newsletter
source_url: https://engineering.atspotify.com/2026/5/better-experiments-with-llm-evals-a-funnel-not-a-fork
sha256: 18072bd0d727
created: 2026-05-22
updated: 2026-05-22
tags: [llm,evaluation,spotify]
---

# Better Experiments with LLM Evals — A funnel, not a fork | Spotify Engineering

Markdown Content:
TL;DRLLM evals, automated judges that assess relevance, coherence, and quality at scale, are a powerful new tool. Paired with online experiments, they raise the hit rate of what we test and create a feedback loop that makes both evals and experiments smarter over time.

  

At Spotify, only about 12% of A/B tests end in a shipped positive result. Around 64% produce valid learning: a regression caught, an idea ruled out, a hypothesis refined. The win rate understates the value of experimentation.

Now we have a new capability. LLM evals can assess dimensions we couldn't scale before (relevance, coherence, tone, intent alignment) faster and cheaper than human annotation, on any data from test sets to A/B test variants. Evals and experiments measure different things. The right relationship is a funnel, not a fork. Schultzberg and Ottens (2024) call it an evaluation funnel, where evals belong _before_ your experiment, not _instead of_ it. A strong eval stack means you don't test to find out if the change does what you intend. Evals already told you that. You test to validate the intended change drives the business outcome it was meant to, and to bound the risk of harming the business.

(https://images.ctfassets.net/p762jor363g1/5y0hOm3YYiouSfaaS91It8/a84544ea64b53b1a9bae3a2e9cd58295/image1.png)
What evals give us, and what they don’t

Schultzberg and Ottens distinguish _verification_ from _validation_. Evals verify: does the output conform to quality standards? Experiments validate: do real users respond as predicted? Evals discard the non-promising candidates before they consume experiment bandwidth. They raise the hit rate of the experiments that follow.

Evals also generate hypotheses. Consider a team that builds an LLM judge to flag trust-breaking content, say a recommendation shared with a user it doesn't fit. The judge surfaces patterns the team didn't know to look for. Those patterns become product fixes. After the fix ships, the same judge can verify it worked: the flagged violations should drop. That's the eval doing two jobs: discovering what to improve, and confirming the improvement was realized.

What the eval can't tell you is whether users who received the improved version actually had better outcomes: whether the fix prevented the slow erosion of trust that eventually leads to churn. This question requires an experiment.

Beyond the dimensions you're measuring are the ones you aren't measuring. At Spotify, teams roll back about 42% of launched experiments to prevent regression in secondary metrics: session length dropping, crash rates climbing, retention eroding. No evals or offline evaluation flagged those. As we've described in our work on guardrail metrics, the point of a guardrail is to watch dimensions you care about but aren't optimizing for. An eval measures quality of implementation in one dimension. An experiment quantifies the impact on systems in production and end users.

Two calibration layers, one feedback loop

Evals are proxies. They substitute a score for an outcome you actually care about. That substitution is only valid as long as the score tracks the real outcome, the same dynamic we've described with proxy metrics.

Now LLM judges add a second calibration layer on top of traditional quantitative metrics (ranking scores, precision, recall). Both layers need validation against online outcomes. Both can drift. When the judge says Variant A is better, does it actually deliver a better user experience, or is the judge rewarding surface patterns that don't drive outcomes?

For example, when Anthropic released the Opus 4.5 model, Qodo's coding evals showed no improvement, but the model had improved substantially on longer tasks a controlled experiment would have surfaced. Miscalibration runs both ways. Without offline-online signal calibration, our evals are opinions, not evidence.By construction, long-running tasks and long-term behaviour are challenging to capture with evals. By continuously adjusting the evals to improve their mapping to online outcomes, the evals are becoming better and better _verification_ tools. We are not ruling out that in the future, as AI develops, evals can map well enough to start acting as _validations_: By having the offline/online calibration loop in place we have continuous transparency on what role evals _can play_ in the evaluation funnel as AI keeps improving.

Teams under speed pressure sometimes call A/B tests "costly." We know from experience that shipping without an experiment can be incredibly costly, if a major regression in top business metrics goes undetected. The more complex the system, the more important it is to bound the risk.

Close the loop

Run evals early and often to find the best treatments. Then let the experiment validate that real users and systems respond as predicted, and monitor the metrics you didn't optimize for. Not every change needs the same evidence: quick directional tests for iteration and data gathering, rigorous tests for ship decisions.

Then: run your LLM evals on the A/B test data itself. Did the version the judge preferred actually perform better with users? This extends the traditional evaluation funnel. LLM judges let us ask not just "did the metric move?" but "did the qualitative aspects change?" When the gap between eval scores and experiment outcomes is large, that's diagnostic gold. Each cycle helps calibrate the next.

Return to the trust-breaking recommendation team: the experiment is the final step. If users who received the improved version show better long-term engagement, the team has confirmed that what the judge measures actually matters. If the judge scores improved but user outcomes didn't, that's the calibration signal: the judge is capturing something, but not the thing that drives value. Both results make the system smarter.

Spotify already has a strong evaluation culture in the shape of experimentation. LLM evals extend that culture upstream, with a clear role in the funnel: find the best treatments before the experiment, and calibrate the judges after it. As Ankargren (2025) argues, success comes from doing the basics well at scale. The value compounds when the system is simple enough to use, and rigorous enough to trust.

---
原文存档：[[raw/articles/spotify-llm-evals-funnel-not-fork|Better Experiments with LLM Evals — A funnel, not a fork | Spotify Engineering]]
