# Agents as Webs of Beliefs

> 📊 Level ⭐⭐⭐⭐ | 9.8KB

> **Source**: [www.lesswrong.com](https://www.lesswrong.com/posts/M39Z2CvyfaxZdaxR4/agents-as-webs-of-beliefs)

Review note: original synthesis with real conceptual depth, but no empirical data or implementation details.

## 摘要

The post sketches an informal model of intelligent agents as *webs of beliefs*, pulling together active inference, agent foundations and machine learning to unify beliefs, goals and actions as three facets of one phenomenon. Its core premise is that beliefs are only **locally** consistent with nearby beliefs and need not be **globally** consistent with all the others, "belief webs" being a still-vague pointer towards a framework handling internal inconsistency and hierarchical concept formation.

## 核心要点

- **Local consistency is the core premise.** Beliefs cohere with their neighbours; global coherence is at best a limiting ideal, so single-distribution accounts of agency fall short.
- **Two frameworks tolerate global inconsistency**: Richardson's probabilistic dependency graphs (empirical) and Garrabrant induction via traders (logical).
- **Base level plus a second layer.** PDG nodes are analogised to an inductor's propositions ("base-level beliefs"); hyperedges and traders impose *local* constraints and gesture at "concepts".
- **Actions are beliefs** (Abram Demski's FixDT): an action is a belief whose holding makes it come true via an external actuator — the *self-predictive model*, against the implicit "argmax model".
- **Goals are beliefs, but fixing them is wrong.** Hard-pinning goals spreads falsehoods; the essay prefers *drives* pulling goal credences up against *anchors* of evidence.
- **Agents as emergent phenomena.** An agent can be a densely connected region of a non-equilibrated belief web that trusts its own updates far more than outside ones.

## 深度分析

### Local consistency and why global consistency is the wrong requirement

Beliefs are typically *locally* consistent with nearby beliefs but not necessarily *globally* consistent with all the rest, except perhaps in the limit of ideal rationality. The essay treats this as a problem for frameworks describing an agent as a single probability distribution — causal graphs, Solomonoff induction, active inference — since such a mind cannot hold two contradictory thoughts at once. Coherence is therefore a graded, local achievement rather than a standing requirement.

### Two frameworks that already tolerate global inconsistency: PDGs and Garrabrant induction

Richardson's probabilistic dependency graphs and Garrabrant induction are the two frameworks that tolerate global inconsistency — the former empirical, the latter logical, a difference the essay abstracts away from. PDG nodes are rough-analogised to an inductor's propositions, a shared element named a "base-level belief" — typically a belief about sensory inputs, with a footnote suggesting gradually-proved logical propositions could be replaced by gradually-observed sensory ones.

A second layer — hyperedges in PDGs, traders in Garrabrant induction — imposes local constraints on those base-level beliefs and is read as a step towards formalising "concepts" (not every hyperedge or trader is one). The motivating case is perceptual: seeing the front half of a cat emerge around a corner, a "cat" hyperedge or trader predicts what you will see next, shaping base-level beliefs.

### Exactly two layers looks artificial: hierarchy and concept formation

Exactly two layers seems artificial: in active inference and predictive processing minds are hierarchical generative models in which each layer forms new concepts with reference to lower-level ones, as deep learning's success suggests. Hyperedges cannot connect hyperedges and traders cannot trade on traders, so "belief webs" names the missing generalisation. Still unclear is what it means for a high-level proposition to be true when its concepts lack binary truth-values — a trader is only more or less profitable, never discretely right or wrong.

### Actions are beliefs, goals are beliefs: the self-predictive model, drives and anchors

PDGs and Garrabrant inductors are epistemic processes rather than agents, so the bridge to agency comes from Abram Demski's FixDT post: beliefs can affect the world directly, not only by shaping actions. Because much of life, most social interaction included, responds to our thoughts and not merely our external acts, the essay unifies them: an action is the subset of beliefs where holding the belief is expected to make it come true through an intervening external actuator — the *self-predictive model*, replacing the implicit "argmax model".

Only Garrabrant induction, unlike active inference, handles self-reference paradoxes via probabilistic logic, so inductors should hold "if I believe X, then X will come true" without difficulty; that grounds which predictions count as actions, and extends to intentions a future self honours. Much of agency then becomes belief management: you must also believe you are the kind of agent who acts on good ideas — linked by the author to the ego, identity as a commitment mechanism, and internal conflict such as procrastination.

On goals, FixDT selects the highest-utility fixed point over beliefs, reintroducing the argmax, reviving problems like 5-and-10, and demanding a global equilibrium; active inference's alternative — goals as beliefs fixed at artificially high credence — fails as it stands. In the toy race example (0.36 chance of winning given training versus 0.04 without, credences of 0.12 on winning and 0.25 on training), raising the winning credence to 0.28 restores consistency only by moving training to 0.75 — an artefact of the prior — and a goal fixed too high leaves no consistent action, spreading falsehood through the web.

The repair is to think in forces instead of fixed goals: *drives* pulling goal credences upward against *anchors* holding empirical credences in place under evidence, equilibrium arriving when they balance. A fully rational agent is then the limiting case of arbitrarily small drives, its utility recoverable from the choices made in that limit; the author credits Davidad's related "nilpotent preferences", and notes drives are guessed to be evolutionarily hardcoded desires, making the goal/belief distinction one of degree.

### What a belief web would buy, and what remains vague

Rigour is the acknowledged open problem, framed as four questions: can belief webs reach the best equilibrium without a FixDT-style jump out of local equilibria (perhaps via hypotheticals that shift probability mass between equilibria); do they have emergent FDT/UDT-like properties despite implicitly implementing EDT; does loose self-reference handling hide Löbian nuances; and what does truth mean for propositions built from concepts without binary truth-values? The longer-term hope: agents become emergent rather than baked in — one huge non-equilibrated belief web whose agents are densely connected regions — opening towards a scale-free unification of single-agent and multi-agent intelligence.

## 实践启示

1. **Design memory for local coherence repair, not global verification.** Constraint links between neighbouring items, plus repairs where violations surface, beat one global truth check.
2. **Separate evidential anchoring from goal pressure.** Keep goal credences out of the evidence pipeline; apply goal pressure only as small, proportionally scaled nudges.
3. **Treat the self-model as an actionable belief, not metadata.** If acting requires believing you are the kind of agent who acts on good ideas, "will I do this?" belongs in the control loop.
4. **Audit coherence regionally and across levels.** Ask where a claim sits, which constraints it touches, and whether drift stays local.
5. **Do not expect one decomposition to carry the whole structure.** Let concept formation iterate, and do not expect the top level to offer crisp truth-values.

## 关联

- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关: Agent 架构
- 相关概念: [Production Agent Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/production-agent-engineering.md)
- 相关概念: [Context Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md)
- 相关实体: Agents as Webs of Beliefs（中文条目）

---

