## Ch14.026 Metric Semantic Layer: How Lyft Governs and Scales Key Data Definitions

> 📊 Level ⭐⭐ | 3.2KB | `entities/metric-semantic-layer-how-lyft-governs-and-scales-key-data-definitions.md`

# Metric Semantic Layer: How Lyft Governs and Scales Key Data Definitions

Markdown Content:
[![Image 1: Iraklikhorguani](https://miro.medium.com/v2/da:true/resize:fill:64:64/0*m85T5tMk8enr2P2-)](https://medium.com/@iraklikhorguani?source=post_page---byline--56bee3643c29---------------------------------------)

![Image 2](https://miro.medium.com/v2/resize:fit:700/1*9r1bGT0StHEZaLhFgNhI7A.png)

_Written by_[_Rohit Channe_](https://www.linkedin.com/in/rohit-channe-5368b469/)_and_[_Simran Mirchandani_](https://www.linkedin.com/in/simranmirchandani/)_at Lyft._

At Lyft, data isn’t just a resource — it’s woven into everything we do. Metrics drive key forecasts, steer operational decisions, and put our boldest hypotheses to the test. But as Lyft scaled, products launched and evolved, and team members came and went, we found ourselves at risk of different teams using different definitions for a given metric. What did “Metric ABC” actually mean? The answer often depended on the context and application of the team you asked.

The consequences were predictable. Without centralized version control or a shared standard, outdated metric definitions crept into decision-making.

Our solution was to build an internal **Metric Semantic Layer (MSL)**: a centralized repository that serves as a single, authoritative home for every metric’s definition — providing both a clear, plain-English description and the definitive SQL code. No more hunting across codebases or tribal knowledge — just one place to store and access a standardized, agreed-upon definition. With MSL, we have **a single source of truth** — consistent terminology and assumptions across every team, so everyone is genuinely speaking the same language. We achieve this through three key principles:

1.   **Simplified onboarding and change management** — update a metric definition once, and the change automatically and frictionlessly flows through every downstream application that depends on it
2.   **Intentional governance**— clarified ownership, defined scope, clear accountability for data quality, and a structure resilient enough to survive org changes, team rotations, and attrition
3.   **Transparency and accessibility** — definitions are easy for both technical and non-technical users (and downstream applications) to find and integrate into day-to-day workflows

Taking the above principles into account, we **implemented the Metrics Semantic Layer as a Python package**:

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/metric-semantic-layer-how-lyft-governs-and-scales-key-data-definitions.md)

---
