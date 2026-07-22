---
source_url: "https://netflixtechblog.com/thinking-fast-slow-for-a-personalized-notification-system-4d89b26525cd?source=rss----2615bd06b42e---4"
ingested: 2026-06-26
sha256: b947bd2bb60ee83f
---

# Thinking Fast & Slow for a Personalized Notification System

by [Matthew Wood](<https://www.linkedin.com/in/matthew-wood-bbb32584/>), [Ishan Gupta](<https://www.linkedin.com/in/ishangupta1993/>), Kevin Mercurio, [Devon Bryant](<https://www.linkedin.com/in/devon-bryant-9910ab5/>), and [Claire Dorman](<https://www.linkedin.com/in/clairedorman/>)

In his seminal book “Thinking, Fast and Slow,” Daniel Kahneman describes two systems that drive human cognition: System 1, which operates automatically and quickly with little effort, and System 2, which allocates attention to more challenging mental activities requiring deliberate focus. This dual-process theory has profound implications not just for understanding human behavior, but for designing intelligent systems that must balance immediate responsiveness with strategic foresight. Similar “plan vs. act” decompositions show up in other domains too — for example, robotics and autonomous driving often separate a slower planning layer (setting goals and constraints over longer horizons) from faster control and execution loops, and modern LLM agents frequently pair deliberate planning with rapid, step-by-step tool use and reaction.

At Netflix, our messaging platform faces a similar challenge every day. We send hundreds of millions of personalized notifications — push messages, emails, and in-app alerts — to help members discover content they’ll love. This creates a central tension: optimizing each notification for near-term engagement can conflict with what is best for the member over the long term. Higher message frequency can increase fatigue and opt-out risk, while lower frequency can reduce awareness of relevant titles and features the member would value.

This blog post introduces our framework for personalized notifications — a hierarchical system where a “slow” policy makes strategic, personalized decisions about a member’s weekly messaging plan (e.g., the intended frequency per channel and the resulting pacing over the week), while a “fast” policy handles the tactical, real-time decisions about which specific message to send when a send opportunity occurs. Together, they balance near-term engagement with longer-term member experience.

### The Problem:

Before introducing our new framework, it is helpful to ground the discussion in a representative baseline for a personalized notification system. In our previous production system, we used a causal model to make send decisions by predicting the causal effect of a single message over a short time horizon. While this approach is effective as a baseline, it suffers from two fundamental limitations:

### Short-Term Reward Horizons

The single-message outcome model is trained to optimize short-horizon metrics, such as immediate user actions occurring shortly after a notification is sent. While this is excellent for driving near-term engagement, it misses the cumulative, long-term effects of a messaging strategy. A message that drives an interaction today might also contribute to notification fatigue, reducing responsiveness in the weeks to follow. Because critical indicators of member satisfaction — like sustained viewing habits or gradual opt-out risk — only surface over extended timeframes, a short-term model will always miss the bigger picture.

### Coupled Ranking and Pacing Decisions

When a single system evaluates daily incrementality to decide both whether to send something and, if so, which item to send, an individual member’s weekly message frequency becomes a by-product of those daily decisions rather than an explicit control variable. In our previous single-policy system, frequency was controlled implicitly through a relevance threshold on the model score calibrated to achieve a target aggregate send rate. While effective for managing overall frequency, this mechanism limited the system’s ability to personalize frequency based on individual engagement patterns. Moreover, because send eligibility and message selection were coupled in the same decision rule, adjusting the threshold to control frequency also changed the distribution and quality of selected messages, and vice versa.

To solve these challenges, we needed a system that could separate longer-term strategy from shorter-term decisions. What if we could determine an optimal, personalized message plan for each member, and then focus on selecting the most relevant content within those bounds? In the following sections, we detail how we realized this vision by decoupling our notification engine into a hierarchical ‘System 1’ and ‘System 2’ framework.

### The Proposed Method: A Hierarchical Slow-Fast Architecture

The Slow policy’s primary role is to define a **personalized pacing of messages over a defined time horizon**. The decisions made by slow policy are consumed by the Fast Policy whose role is to maximize immediate relevance and select the optimal message for the member at any given moment.

To illustrate the Slow Policy in practice: For example, if optimized at a weekly cadence, the policy evaluates a member’s long-term engagement patterns to select a “Pacing Plan Action.” To keep the action space manageable yet expressive, we discretize the decision space into a set of actions that independently specify push and email frequencies. This provides approximately O(100) distinct combinations of cross-channel pacing strategies.

**The Utility Function**

The Slow policy selects actions by maximizing a personalized utility function. This function explicitly trades off positive engagement signals against the long-term “cost” of messaging.

_U(member, action) = Σ wₖ·Reward_k(member,action) — Cost(action)_

To capture a holistic view of member health, this utility is composed of:

  * **Positive Signals:** Capturing the likelihood that a member will find value in and engage with the platform.
  * **Negative Signals:** Capturing the likelihood of member fatigue or a propensity to opt out of a messaging channel.



Ideally, negative signals alone would naturally penalize over-messaging. In practice, however, explicit negative feedback is extremely sparse. Without an additional constraint, the predicted ‘cost’ of an incremental message appears negligible, causing the model to gravitate toward maximum frequency.

To address this, we introduce a **universal message cost** that is added to the personalized negative‑feedback prediction for every send. This additional cost term keeps the reward function concave and well‑behaved, preventing degenerate “always send” policies. The message cost parameter is empirically tuned using a combination of online experiments and offline evaluation metrics.

**Pacing Strategy**

The two-stage design naturally allows for optimizing both the average frequency as well as pacing of messages over time. The simplest pacing strategy is uniform random: we translate the frequency target into a per-opportunity send probability and, at each eligible opportunity, effectively flip a weighted coin to decide whether to send. This produces an organically randomized pattern whose expected send rate matches the target.

While uniform pacing provides a clean and robust baseline, the framework readily extends to richer, non-uniform pacing profiles (for example, day-of-week patterns, conditioning on user activity, or launch-aligned bursts) whenever product or user-experience considerations call for more structured temporal distributions.

**Policy-to-Policy Communication**

The true power of this hierarchy lies in decoupling. By splitting into “Slow” and “Fast” policies, we allow each to focus on what it does best.

To bridge these two worlds asynchronously, decisions are events and state is managed through a low-latency feature store:

  * **The Planner (Slow):** The Slow policy calculates a member’s ideal pacing plan. It writes this strategic intent to a feature store
  * **The Executor (Fast):** Every day, when a notification opportunity arises, the Fast Policy simply pulls that stored “plan” as a feature. It then executes the tactical send decision within those strategic guardrails.



This architecture provides two critical advantages:

  1. **“Stickiness”:** It ensures a member receives a consistent experience. The Slow policy will be executed once at a defined cadence; the plan is stored and honored.
  2. **Independent Evolution:** We can retrain, optimize, or A/B test our weekly pacing strategies (the “Slow” layer) without ever touching the real-time ranking logic (the “Fast” layer).

Figure 1: Schematic of the two-layer message personalization system composed of a slow planning policy (top) and a fast execution policy (bottom). A feature store serves as the communication bridge between the two policies.

### Key Results & Takeaways

The transition to a hierarchical architecture resulted in one of our **largest production metric lifts to date**. We observed several key breakthroughs:

  * **Empowering the “Casual Viewer”** : Gains were most significant among members who watch less frequently — a critical cohort where timely, high-relevance awareness of new content is vital.
  * **The Power of Decoupling** : Separating _frequency planning_ from _message selection_ was as transformative as the modeling itself. This new architecture unlocks incredible flexibility, allowing us to iterate on content ranking models and pacing strategies as two independent, clean variables.
  * **Respecting the Horizon** : The impact of messaging is rarely an isolated event; its effects build up cumulatively based on ongoing interactions between our system and the member. By isolating pacing into a dedicated strategic layer, we now have the mechanism to explicitly manage long-term fatigue and opt-out risk.



### Acknowledgments

We could not have delivered this project without the help of our outstanding colleagues, and we sincerely thank them for their contributions.

**Feature Store Team** : [Aaron Lewis](<https://www.linkedin.com/in/aaronlewism/>), [Tom Switzer](<https://www.linkedin.com/in/tom-switzer-59824356/>), [Abby Whittier](<https://www.linkedin.com/in/abbywh/>), [Ray Zhang](<https://www.linkedin.com/in/ray-zhang-a7168a32/>)  
**Product:**[Fiona Li](<https://www.linkedin.com/in/fenglinli/>)  
**AI for Member Systems (supporting contributor):**[Sergi Perez](<https://www.linkedin.com/in/sergipv/>)

* * *

[Thinking Fast & Slow for a Personalized Notification System](<https://netflixtechblog.com/thinking-fast-slow-for-a-personalized-notification-system-4d89b26525cd>) was originally published in [Netflix TechBlog](<https://netflixtechblog.com>) on Medium, where people are continuing the conversation by highlighting and responding to this story.
