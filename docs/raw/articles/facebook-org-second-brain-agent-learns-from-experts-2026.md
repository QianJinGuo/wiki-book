---
source: newsletter
source_url: "https://engineering.fb.com/2026/09/02/ml-applications/organizational-second-brain-ai-learns-from-experts/"
ingested: 2026-09-05
sha256: f4b46929a9d85e192583418372c785d8b5430975a7200f0896e7517eda6a0699
---

# An Organizational Second Brain: Building an AI That Learns From Experts - Engineering at Meta

Raw expert feedback comes from conversation traces where domain SMEs interacted with the agent and provided corrections. The diagnosis phase extracts structured signals from these conversations.
Our first approach classified feedback by conversational form. If the expert provided information, it must be a knowledge gap; if they redirected the agent, it must be a procedure problem. This heuristic failed because conversational form is a poor proxy for root cause. An expert correcting a conclusion might be exposing a knowledge gap, a recipe flaw, or a genuine ambiguity.
The working approach separates extraction from classification. First, extract every substantive signal from the expert alongside the agent&#8217;s full knowledge manifest (every file loaded, when, and how used). Second, read the actual knowledge files and apply a single attribution test: Could the agent have reached the correct conclusion from its source materials?
If the materials contained the right answer but the agent still erred: recipe problem.
If the materials did not contain the right answer: knowledge gap.
If experts themselves disagree on the right answer: ambiguity, flagged for human discussion.
