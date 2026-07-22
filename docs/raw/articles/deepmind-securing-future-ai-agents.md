---
source_url: "https://deepmind.google/blog/securing-the-future-of-ai-agents/"
ingested: 2026-06-26
sha256: 7b4a0ddf1109d939
---

# Securing the future of AI agents


Published Time: 2026-06-18T14:00:00+00:00

Markdown Content:
June 18, 2026 Responsibility & Safety

Rohin Shah and Four Flynn

How we’re securing internal systems against increasingly capable and imperfectly aligned AI

AI agents are transforming our relationship with technology. By autonomously executing complex tasks — from cyber defence to scientific discovery and product development — these systems are unlocking a new era of productivity. In the U.S alone, AI agents could create $2.9 [trillion in economic value](https://www.mckinsey.com/mgi/our-research/agents-robots-and-us-skill-partnerships-in-the-age-of-ai#/) by 2030.

As these agents become more capable, they also require more sophisticated safeguards. That’s why we developed our [AI Control Roadmap](https://storage.googleapis.com/deepmind-media/DeepMind.com/Blog/securing-the-future-of-ai-agents/gdm-ai-control-roadmap.pdf): a framework for building and managing the advanced AI we deploy within Google. This “defense-in-depth” approach, which could serve as a model for the wider industry, goes beyond traditional model alignment, adding a crucial layer of system-level security that provides assurance even if alignment is imperfect.

## Understanding AI Control

Our approach to security starts with a strong foundation, incorporating traditional safeguards like sandboxing, endpoint security, and prompt injection resistance. On top of this, the AI Control Roadmap uses model alignment, i.e. training AI to be inherently safe and helpful, as a primary defense. It provides an additional layer of security by treating internal agents as potentially misaligned, providing assurance even if alignment is imperfect.

Think of it like a driving instructor with dual controls. The instructor trusts the student but stays ready to take the wheel or hit the brakes if a mistake occurs. Similarly, our AI control system grants AI agents permissions based on their verified behavior, allowing us to build trust through controlled, incremental access.

Our roadmap is built on a simple but cautious assumption: what if a highly capable AI agent isn’t aligned with our goals and acts in unexpected ways? To address this, our plan focuses on three key areas.

First, following best practices in cybersecurity, we have developed a novel threat-modelling framework for AI. The roadmap treats untrusted AI agents as potential “insider threats” — similar to the way a company would treat a potential rogue employee who already has access to the office. By building on the industry-standard [MITRE ATT&CK](https://attack.mitre.org/) framework, a globally-accessible knowledge base of adversary tactics and techniques based on real-world observations, we break down potential attacks into smaller tactics and techniques. This allows us to methodically track risks, spot bad behavior before it causes damage and safely run drills to test if our defenses actually hold up.

Second, we develop a plan to deploy AI control mitigations to address these risks.

*   Identifying the problem (Detection): Monitoring is the backbone of AI control. We use other, trusted AI systems as "supervisors" to constantly review a working agent's reasoning, actions and plans to see if it is going off track.
*   Managing the problem (Prevention and Response): If a supervisor sees the agent trying to do something harmful, it can step in to block the action before damage occurs.

Finally, to ensure our systems are functional, we constantly measure performance across three critical metrics: coverage (the fraction of traffic monitored), recall (the fraction of misaligned behaviors caught), and time-to-response.

## Scaling security as AI gets smarter

As AI models continue to advance, our defenses must also strengthen in tandem. In our AI Control Roadmap, we map security protocols to measurable milestones in AI capabilities on two critical fronts:

*   **Ability to evade detection:** Today, we monitor a model's visible chain-of-thought. However, as models learn to hide their reasoning — either through _oversight awareness_ (knowing they are being monitored) or _opaque reasoning_ (reasoning without using visible text) — simply reading their verbalized reasoning will not be enough. We will need to analyze their behavior and potentially inspect the model’s inner workings.
*   **Ability for potential harm:** For low-risk and reversible actions, we can rely on reviewing transcripts with a delay and remediating issues quickly after they occur (asynchronous response). For particularly high-risk actions, such as major cyber attacks, we must shift to real-time prevention, blocking harmful actions before they can be executed (synchronous response). In other words, our response strategy must scale with the severity of the threat.

The AI Control Roadmap recommends security measures based on the deployed model’s capability. The model’s detection evasion capability determines the Detection level (D1-D4), and the model’s attack execution capability determines the Prevention and Response level (R1-R3).

## Analyzing a million agent trajectories to inform live monitoring

To build these systems, we need data. Our team has built an internal prototype of an asynchronous monitoring system that reviews coding agent trajectories, and escalates findings for human review. Each flagged event is classified against the threat taxonomy from our roadmap.

We’ve already analyzed a million coding agent tasks, giving us valuable insights to refine our safety protocols and allowing us to move beyond simple keyword filtering to identifying high-signal behavioral patterns. For example, this research has been instrumental in building a live monitor for the Gemini Spark agent, allowing us to respond in real-time to emerging issues, like unintentional data deletion.

It is important to note that our data shows the majority of flagged events do not stem from adversarial intent; instead, they often result from [agent misinterpretation or overeagerness](https://arxiv.org/abs/2605.30322) to achieve a user’s goal. Understanding these nuances is critical for refining our safety and security protocols.

## Defending the agent ecosystem is a shared responsibility

The AI Control Roadmap is one vital element of our multilayered approach to agent security. By integrating these protocols with our broader infrastructure, we are scaling our internal security to safely manage our most advanced AI models.

Additionally, this multilayered approach to agent security should be a collaborative priority for industry, policymakers, and academia. By aligning the ecosystem around best practices and standards, we can empower cyber defenders and build societal resilience. That’s why today we are also publishing a technical framework for policymakers, ['Three Layers of Agent Security’](https://storage.googleapis.com/deepmind-media/DeepMind.com/Blog/securing-the-future-of-ai-agents/three-layers-of-agent-security.pdf). The paper details how we need to improve security at the level of individual agents; in multi-agent systems; and to empower cyber defenders and build resilience across the broader ecosystem.

We intend to build on these frameworks to confidently deploy capable AI today while we continue to build a secure foundation for the future.

Read the full technical report here:

[AI Control Roadmap](https://storage.googleapis.com/deepmind-media/DeepMind.com/Blog/securing-the-future-of-ai-agents/gdm-ai-control-roadmap.pdf)

### Research authors

Mary Phuong, Erik Jenner, Laurent Simon, Lewis Ho, Rohin Shah, Sebastian Farquhar, and Scott Coull.

### Acknowledgements

Four Flynn, Anca Dragan, Alan Cooney, Bilal Chughtai, Buck Shlegeris, Cody Wild, David Lindner, Julian Stastny, Kevin Klyman, Li Ding, Myriam Khan, Raluca Ada Popa, Roland Zimmermann, Ryan Greenblatt, Senthooran Rajamanoharan, Victoria Krakovna and Xerxes Dotiwalla.

