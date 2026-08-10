---
title: "How Cursor Router chooses the right model for the task"
source_url: "https://cursor.com/blog/how-cursor-router-works"
ingested: 2026-08-10
language: en
type: raw-article
sha256: "e023b01047df2303a9911635e5537bb7d2ddc25e34681a71b2cc83037ce98cf5"
---

# blog-how-cursor-router-works

How Cursor Router chooses the right model for the task · Cursor
Skip to content
Cursor
Sign in
Contact
Contact sales
Download
Blog
/
research
Aug 6, 2026
·
research
How Cursor Router chooses the right model for the task
Connor O&#x27;Keefe & Yuri Volkov
·
6 min read
On July 22, we
launched Cursor Router
with two new configurations, Auto Intelligence and Auto Balance. Since then, we have continued improving both modes as new models have arrived and our routing system has learned from more production traffic.
Today, Auto Intelligence delivers above Fable-level user satisfaction at 68% lower cost, a further 18% reduction since its launch. Auto Balance outperforms Opus 4.8 at 41% lower cost, a further 8% reduction over the same period, while further increasing user satisfaction by 3%.
We&#x27;re working towards a Cursor Router that improves alongside the model frontier. This post explains how the current system works.
Cursor Router increases satisfaction and cuts cost vs. frontier models
Numbers in graph reported relative to Opus 4.8
Cursor Router increases satisfaction and cuts cost vs. frontier models
Numbers in graph reported relative to Opus 4.8
Cursor Router increases satisfaction and cuts cost vs. frontier models
Numbers in graph reported relative to Opus 4.8
#
A data-driven approach to routing
Cursor Router is built around the idea that model selection should be learned from how models perform on real developer work, rather than inferred from benchmark scores.
The router makes each decision using signals from the current turn and recent conversation state. These include structured features such as the task category, along with recent tool calls and the broader context of the work.
From there, routing happens in two parts.
First, we need to decide whether a turn is simple enough for a price-efficient model. Compass, our complexity predictor, makes this decision.
Second, if the turn is more demanding, we need to decide which frontier model is most likely to perform well on that kind of work. To make that decision, we classify the turn using a taxonomy of tasks, domains, and modifiers learned from real developer traffic.
#
Building a dataset
To develop the routing system, we first needed a dataset that reflected the conditions it would encounter in production. We built it from live Cursor traffic so it would preserve the actual mix of developer tasks, the context surrounding each turn, and the effects of switching between models.
As always, we respected users&#x27; privacy mode and data retention settings throughout this process.
The dataset contains hundreds of thousands of turns sampled across a range of models. Each datapoint includes the conversation signals available to the router, along with two outcomes we use to compare routing choices.
Performance.
We infer performance from what the user does next. Moving on to the next task is a strong positive signal, while correcting the agent is a strong negative one.
Cost.
We calculate cost from API pricing and token usage for that turn. Because the data comes from live traffic, it also captures costs that benchmarks often miss, including cache misses caused by switching models.
#
Predicting complexity with Compass
Compass estimates the complexity of each turn by predicting whether the user will be satisfied with Cursor&#x27;s response. We train it on the performance signal mentioned above.
We use the resulting prediction as a proxy for complexity. This works because users rarely ask for corrections after simple tasks, like making a commit, while they&#x27;re more likely to make follow-up requests when the work is more complex.
We evaluated Compass online and confirmed that its scores are strong predictors of user satisfaction. Turns that Compass rated as most likely to succeed received a positive performance signal 96% of the time, while turns it rated as least likely to succeed received one 71% of the time.
Compass scores predict user satisfaction
Compass scores predict user satisfaction
Compass scores predict user satisfaction
In practice, Compass assigns each turn a continuous complexity score between 0 and 1. We set a threshold within that range to determine which turns stay on a price-efficient model and which are upgraded to a frontier model. Lower thresholds keep more traffic on the price-efficient model, while higher thresholds upgrade more often.
Raising the Compass threshold trades cost for more quality gain
Compass threshold sweep
Raising the Compass threshold trades cost for more quality gain
Compass threshold sweep
Raising the Compass threshold trades cost for more quality gain
Compass threshold sweep
#
Learning model strengths
After Compass tells us when a turn is complex enough to justify using a frontier model, the next question is which frontier model to use.
To answer it, we built a taxonomy from real developer traffic that describes each turn across three dimensions:
Domains
identify where the work happens: backend, database schemas, frontend
Tasks
identify what the developer wants done: fixing bugs, running commands, writing tests
Modifiers
capture characteristics that cut across domains and tasks, but may change which model performs best: bounded edits, product questions, visual-heavy changes
We then compare how different models perform across those categories. We found that no model dominates every kind of work, and each has categories where it outperforms:
Grok offers strong value across broad, routine work.
Its low inference cost made it especially effective for categories such as Git commands and general database operations.
Sol performs especially well on planning and codebase comprehension.
It also delivered strong results across several implementation tasks at a lower cost than other frontier models.
Opus performs well on execution-heavy work.
It showed particular strengths in devops, database queries, and performance optimization.
Fable excels at debugging and visual implementation.
Its quality gains were most valuable on complex tasks where they justified its higher cost.
Cursor Router uses those differences to match each turn to the model best suited to it.
#
Combining into an algorithm
Compass and the taxonomy play complementary roles. Compass estimates the model-agnostic complexity of the turn and compares that score with a routing threshold. Depending on where the score falls, we either send the turn to Grok, given its low inference cost, or use the taxonomy to identify the frontier model with the strongest observed performance on that kind of work.
route
(
x
)
=
{
price-efficient model
,
task router
,
​
C
o
m
p
a
ss
≥
τ
C
o
m
p
a
ss
<
τ
​
When Compass does send a turn to the taxonomy router, model selection follows two rules:
Only route when performance is clearly better.
A candidate model becomes eligible only when its observed performance on that task label clears a one-sided 75% uplift threshold against the price-efficient model. Roughly, this means we need 75% confidence that the improvement is real.
Choose the best mix within the budget.
From the eligible candidates, the optimizer chooses the traffic-weighted combination expected to deliver the largest performance gain while keeping the average cost per turn within the mode&#x27;s budget.
Together, the Compass threshold and the task router&#x27;s cost budget define each mode&#x27;s position on the cost-performance curve. Auto Balance keeps more traffic on the price-efficient path and gives the task router a smaller budget. Auto Intelligence gives the task router more room to select frontier models when the expected performance gain justifies the cost.
#
Evaluating performance in production
We evaluated our routing policies in two stages. First, we used cross-validation to tune the Compass thresholds and optimization budgets without overfitting to a particular split. We then evaluated the selected policies on a held-out test set that had not been used during training.
This gives us a more reliable estimate of how each policy should perform on new traffic. It helps us eliminate weak candidates and compare expected cost and performance before deployment. But offline analysis still cannot fully capture how a policy will behave in production, and benchmarks are limited for the same reason. Live developer traffic remains the most representative test.
Offline evaluation surfaces candidate policies to test online
*Cost and performance relative to Opus 4.8
Offline evaluation surfaces candidate policies to test online
*Cost and performance relative to Opus 4.8
Offline evaluation surfaces candidate policies to test online
*Cost and performance relative to Opus 4.8
We then tested the policies on live traffic, where we could measure user satisfaction and the actual cost of each turn under production conditions. This captures effects that are difficult to model offline, including token usage, caching, and the cost of switching between models.
Before launch, we tested both modes on live traffic and found that each improved the cost-performance tradeoff relative to individual frontier models. Auto Balance delivered higher satisfaction than Opus 4.8 at lower cost, while Auto Intelligence approached Fable-level satisfaction at a much lower cost.
We have since repeated this process as the routing system and available models have improved, moving both modes further beyond the cost-performance frontier.
#
Keeping pace with the model frontier
Since launching Cursor Router, we&#x27;ve added Opus 5 to the routing mix and improved Compass&#x27;s predictions. That gives the router both a stronger set of models to choose from and a better signal for deciding when each one is worth using.
Over time, we want the router to become more adaptive by predicting each model&#x27;s expected quality and cost, learning from production outcomes, and updating continuously. As the system improves, Cursor users will be able to benefit from frontier models where they&#x27;re needed most, without paying frontier-model prices on every turn.
Read more in our
docs
.
Related posts
Jul 20, 2026
·
Research
Agent swarms and the new model economics
Wilson Lin
·
17 min read
Jul 30, 2026
·
Research
How we set up our cloud agent environment
Mathew & Arvind
·
7 min read
Jul 14, 2026
·
Research
Grok 4.5 Model Card
Cursor Team
·
1 min read
View more posts
→
Skip to content
Cursor
Sign in
Contact
Contact sales
Download
Blog
/
research
Aug 6, 2026
·
research
How Cursor Router chooses the right model for the task
Connor O&#x27;Keefe & Yuri Volkov
·
6 min read
On July 22, we
launched Cursor Router
with two new configurations, Auto Intelligence and Auto Balance. Since then, we have continued improving both modes as new models have arrived and our routing system has learned from more production traffic.
Today, Auto Intelligence delivers above Fable-level user satisfaction at 68% lower cost, a further 18% reduction since its launch. Auto Balance outperforms Opus 4.8 at 41% lower cost, a further 8% reduction over the same period, while further increasing user satisfaction by 3%.
We&#x27;re working towards a Cursor Router that improves alongside the model frontier. This post explains how the current system works.
Cursor Router increases satisfaction and cuts cost vs. frontier models
Numbers in graph reported relative to Opus 4.8
Cursor Router increases satisfaction and cuts cost vs. frontier models
Numbers in graph reported relative to Opus 4.8
Cursor Router increases satisfaction and cuts cost vs. frontier models
Numbers in graph reported relative to Opus 4.8
#
A data-driven approach to routing
Cursor Router is built around the idea that model selection should be learned from how models perform on real developer work, rather than inferred from benchmark scores.
The router makes each decision using signals from the current turn and recent conversation state. These include structured features such as the task category, along with recent tool calls and the broader context of the work.
From there, routing happens in two parts.
First, we need to decide whether a turn is simple enough for a price-efficient model. Compass, our complexity predictor, makes this decision.
Second, if the turn is more demanding, we need to decide which frontier model is most likely to perform well on that kind of work. To make that decision, we classify the turn using a taxonomy of tasks, domains, and modifiers learned from real developer traffic.
#
Building a dataset
To develop the routing system, we first needed a dataset that reflected the conditions it would encounter in production. We built it from live Cursor traffic so it would preserve the actual mix of developer tasks, the context surrounding each turn, and the effects of switching between models.
As always, we respected users&#x27; privacy mode and data retention settings throughout this process.
The dataset contains hundreds of thousands of turns sampled across a range of models. Each datapoint includes the conversation signals available to the router, along with two outcomes we use to compare routing choices.
Performance.
We infer performance from what the user does next. Moving on to the next task is a strong positive signal, while correcting the agent is a strong negative one.
Cost.
We calculate cost from API pricing and token usage for that turn. Because the data comes from live traffic, it also captures costs that benchmarks often miss, including cache misses caused by switching models.
#
Predicting complexity with Compass
Compass estimates the complexity of each turn by predicting whether the user will be satisfied with Cursor&#x27;s response. We train it on the performance signal mentioned above.
We use the resulting prediction as a proxy for complexity. This works because users rarely ask for corrections after simple tasks, like making a commit, while they&#x27;re more likely to make follow-up requests when the work is more complex.
We evaluated Compass online and confirmed that its scores are strong predictors of user satisfaction. Turns that Compass rated as most likely to succeed received a positive performance signal 96% of the time, while turns it rated as least likely to succeed received one 71% of the time.
Compass scores predict user satisfaction
Compass scores predict user satisfaction
Compass scores predict user satisfaction
In practice, Compass assigns each turn a continuous complexity score between 0 and 1. We set a threshold within that range to determine which turns stay on a price-efficient model and which are upgraded to a frontier model. Lower thresholds keep more traffic on the price-efficient model, while higher thresholds upgrade more often.
Raising the Compass threshold trades cost for more quality gain
Compass threshold sweep
Raising the Compass threshold trades cost for more quality gain
Compass threshold sweep
Raising the Compass threshold trades cost for more quality gain
Compass threshold sweep
#
Learning model strengths
After Compass tells us when a turn is complex enough to justify using a frontier model, the next question is which frontier model to use.
To answer it, we built a taxonomy from real developer traffic that describes each turn across three dimensions:
Domains
identify where the work happens: backend, database schemas, frontend
Tasks
identify what the developer wants done: fixing bugs, running commands, writing tests
Modifiers
capture characteristics that cut across domains and tasks, but may change which model performs best: bounded edits, product questions, visual-heavy changes
We then compare how different models perform across those categories. We found that no model dominates every kind of work, and each has categories where it outperforms:
Grok offers strong value across broad, routine work.
Its low inference cost made it especially effective for categories such as Git commands and general database operations.
Sol performs especially well on planning and codebase comprehension.
It also delivered strong results across several implementation tasks at a lower cost than other frontier models.
Opus performs well on execution-heavy work.
It showed particular strengths in devops, database queries, and performance optimization.
Fable excels at debugging and visual implementation.
Its quality gains were most valuable on complex tasks where they justified its higher cost.
Cursor Router uses those differences to match each turn to the model best suited to it.
#
Combining into an algorithm
Compass and the taxonomy play complementary roles. Compass estimates the model-agnostic complexity of the turn and compares that score with a routing threshold. Depending on where the score falls, we either send the turn to Grok, given its low inference cost, or use the taxonomy to identify the frontier model with the strongest observed performance on that kind of work.
route
(
x
)
=
{
price-efficient model
,
task router
,
​
C
o
m
p
a
ss
≥
τ
C
o
m
p
a
ss
<
τ
​
When Compass does send a turn to the taxonomy router, model selection follows two rules:
Only route when performance is clearly better.
A candidate model becomes eligible only when its observed performance on that task label clears a one-sided 75% uplift threshold against the price-efficient model. Roughly, this means we need 75% confidence that the improvement is real.
Choose the best mix within the budget.
From the eligible candidates, the optimizer chooses the traffic-weighted combination expected to deliver the largest performance gain while keeping the average cost per turn within the mode&#x27;s budget.
Together, the Compass threshold and the task router&#x27;s cost budget define each mode&#x27;s position on the cost-performance curve. Auto Balance keeps more traffic on the price-efficient path and gives the task router a smaller budget. Auto Intelligence gives the task router more room to select frontier models when the expected performance gain justifies the cost.
#
Evaluating performance in production
We evaluated our routing policies in two stages. First, we used cross-validation to tune the Compass thresholds and optimization budgets without overfitting to a particular split. We then evaluated the selected policies on a held-out test set that had not been used during training.
This gives us a more reliable estimate of how each policy should perform on new traffic. It helps us eliminate weak candidates and compare expected cost and performance before deployment. But offline analysis still cannot fully capture how a policy will behave in production, and benchmarks are limited for the same reason. Live developer traffic remains the most representative test.
Offline evaluation surfaces candidate policies to test online
*Cost and performance relative to Opus 4.8
Offline evaluation surfaces candidate policies to test online
*Cost and performance relative to Opus 4.8
Offline evaluation surfaces candidate policies to test online
*Cost and performance relative to Opus 4.8
We then tested the policies on live traffic, where we could measure user satisfaction and the actual cost of each turn under production conditions. This captures effects that are difficult to model offline, including token usage, caching, and the cost of switching between models.
Before launch, we tested both modes on live traffic and found that each improved the cost-performance tradeoff relative to individual frontier models. Auto Balance delivered higher satisfaction than Opus 4.8 at lower cost, while Auto Intelligence approached Fable-level satisfaction at a much lower cost.
We have since repeated this process as the routing system and available models have improved, moving both modes further beyond the cost-performance frontier.
#
Keeping pace with the model frontier
Since launching Cursor Router, we&#x27;ve added Opus 5 to the routing mix and improved Compass&#x27;s predictions. That gives the router both a stronger set of models to choose from and a better signal for deciding when each one is worth using.
Over time, we want the router to become more adaptive by predicting each model&#x27;s expected quality and cost, learning from production outcomes, and updating continuously. As the system improves, Cursor users will be able to benefit from frontier models where they&#x27;re needed most, without paying frontier-model prices on every turn.
Read more in our
docs
.
Related posts
Jul 20, 2026
·
Research
Agent swarms and the new model economics
Wilson Lin
·
17 min read
Jul 30, 2026
·
Research
How we set up our cloud agent environment
Mathew & Arvind
·
7 min read
Jul 14, 2026
·
Research
Grok 4.5 Model Card
Cursor Team
·
1 min read
View more posts
→
