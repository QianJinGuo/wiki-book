---
source: newsletter
source_url: "https://digbench.ai/"
ingested: 2026-08-19
sha256: a237c17e9625b7ffbbdace54585ec93a7e952d9f7988d8cb2fada77bcb71988f
---

# dig.bench

dig.bench
dig
.
bench
Discovering unknown rules in text-based games
70 interactive games · 21 public
API docs
Paper
GitHub
Leaderboard
Combined
Tier breakdown
Basic Harness
Opus 5
GPT-5.5
Kimi K3
Gemini 3.1 Pro
GLM-5.2
DeepSeek V4 Flash
DeepSeek V4 Pro
Qwen 3.6 27B
Agentic Harness
Opus 5 + Prime Agent
Fable 5 + Claude Code
GPT-5.6 Sol + Codex
Kimi K3 + Kimi Code
Gemini 3.1 Pro + PRO-LONG
Win rate
1
0.5
0
1
2
3
4
5
6
7
6
7
Each game is beaten by at least one human on their first attempt
Difficulty tiers
All games are human beatable, on first attempt, as validated on external human testers. Win rate: each game&#x27;s wins are averaged over its runs, then those are averaged across the tier&#x27;s ten games.
About
dig.bench is a benchmark of scientific discovery.
Each of its 70 games measures whether an agent can experiment to discover that game&#x27;s own unknown rules. Every game is text-based, which puts it in the natural domain of language models: no visual confounds stand between a model and the discovery, so what dig.bench tests is discovery alone. Humans and frontier models play the same games with access to the same information, and progress is scored by whether the game can be beaten within a limited number of steps.
The games come in 7 tiers, depending on their difficulty. No game is easy and they all require effortful play, but humans can make the discoveries necessary to solve even our hardest games, while the best models struggle to beat games in the top tier.
Scale
70 new interactive games (21 publicly released).
What qualities of models do we test
To beat each game an agent must discover the unknown rules and apply them to solve challenges.
Evaluation
Humans and frontier models play through the same interface: identical game states, identical action sets, identical step budgets.
The platform and equivalent human and model interfaces.
marks the available actions
;
creative mode, an option in some games that allows a player to enter another level where they can experiment without it counting towards the step count
;
the current game state
;
game statistics
; and
action and state history
.
Play
21 of the 70 games are public. Tiers get increasingly harder for models (1 = easiest, 7 = hardest).
tier
1
P-1
tier
1
P-2
tier
1
P-3
tier
2
P-4
tier
2
P-5
tier
2
P-6
tier
3
P-7
tier
3
P-8
tier
3
P-9
tier
4
P-10
tier
4
P-11
tier
4
P-12
tier
5
P-13
tier
5
P-14
tier
5
P-15
tier
6
P-16
tier
6
P-17
tier
6
P-18
tier
7
P-19
tier
7
P-20
tier
7
P-21
Reproduce it
Run any model against the games through the SDK or API.
API docs
Join us
Join our community
DisCo
, where you can track your progress on these puzzles and hang out with like-minded folk.
Citation
DiG-bench: Discovery in Games
Ruairidh M. Battleday
,
Kai Sandbrink
,
Jimi Cullen-Drohan
,
Zihan Yan
,
Timothy Muller
,
Clare Maguire
,
Ales Kubicek
,
Fraser Greenlee-Scott
,
Sukrit Sumant
,
Tri Dao
,
Jürgen Schmidhuber
,
Michal Valko
,
Joshua Tenenbaum
,
Thomas L. Griffiths
,
Zeb Kurth-Nelson
,
James C.R. Whittington
@
misc
{
battleday2026dig
,
title=
{
DiG-bench: Discovery in Games
}
,
author=
{
Ruairidh M. Battleday
and
Kai Sandbrink
and
Jimi Cullen-Drohan
and
Zihan Yan
and
Timothy Muller
and
Clare Maguire
and
Ales Kubicek
and
Fraser Greenlee-Scott
and
Sukrit Sumant
and
Tri Dao
and
Jürgen Schmidhuber
and
Michal Valko
and
Joshua Tenenbaum
and
Thomas L. Griffiths
and
Zeb Kurth-Nelson
and
James C.R. Whittington
}
,
year=
{
2026
}
,
eprint
=
{
2608.12593
}
,
archivePrefix
=
{
arXiv
}
,
primaryClass
=
{
cs.AI
}
,
url
=
{
https://arxiv.org/abs/2608.12593
}
,
}
