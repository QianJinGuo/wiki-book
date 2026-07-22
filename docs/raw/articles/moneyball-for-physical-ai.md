---
title: "Moneyball for Physical AI"
source_url: "https://praxiscurrents.substack.com/p/moneyball-for-physical-ai"
ingested: 2026-06-30
sha256: f33161516103fc7b
tags: [newsletter, physical-ai, robotics, data]
feed_name: Praxis Currents
---


Published Time: 2026-06-25T15:08:59+00:00

Markdown Content:
In 2002, the Oakland Athletics won 103 games despite maintaining the third-lowest payroll in Major League Baseball. This advantage emerged because the market for player assets was mispriced: legacy scouts favored subjective aesthetics, stolen bases, and batting averages, whereas forward-looking management mathematically isolated on-base percentage, the statistic that actually correlated with runs.

_Finding the signal with the correct statistic in a field full of intuitive pundits:_**Moneyball**!

Data for Physical AI is misunderstood, and mis-priced.

[![Image 1](https://substackcdn.com/image/fetch/$s_!BVpC!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7cdb54b8-6d97-4bd5-a745-afcb30b697f0_1470x832.jpeg)](https://substackcdn.com/image/fetch/$s_!BVpC!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7cdb54b8-6d97-4bd5-a745-afcb30b697f0_1470x832.jpeg)

Data doesn’t exist for Physical AI. Data has a inherent cost of creation. We need to move beyond from naive scaling data in hours or tokens.

Being scale-pilled often amounts to “believe in data”. However, unlike text, robot data isn't available to be mined. Every useful hour is paid for, so collection scales linearly while costs don't fall. Recently, Ken Goldberg estimated that frontier robotics models might require[approximately 100,000 years](https://www.science.org/doi/10.1126/scirobotics.aea7390).

> **AGI revolution will not be supervised with****Sweatshop Teleop.**

To bypass this bottleneck, the industry has scaled manual teleoperation infrastructure. However, optimizing for cumulative operational hours replicates the “batting average” fallacy of early baseball: it prioritizes a visible, easily fundable metric that correlates weakly with actual downstream model performance. An alternative strategy proposes deploying robots into production to harvest telemetry as a zero-cost byproduct of operational revenue. This model introduces a subtler version of the same statistical error**.**The niches where deployment is possible today are the ones with least variance and yield low-entropy, correlated data streams with minimal marginal utility.

**This essay builds a framework for the marginal utility of data, and uses it to discuss value accrual in Physical AI.** We take the perspective of the scaling laws that guide how loss behaves with data, and the unit economics that govern what a dollar of data is worth. Together they give an approximate marginal utility per dollar, the on-base percentage of physical AI.

**Capital efficiency scales not by maximizing data volume, but by accurately computing and pricing data novelty.**

If you’d rather skip to conclusions, [jump to recommendations](https://praxiscurrents.substack.com/i/203375072/8-strategic-recommendations).

Varied stakeholders have differing views on data. Conveniently, _each worldview happens to make their slice the most valuable._

Foundation-model labs sell generalized model scale, as a result overweight the role of large-scale pretraining, operating under the assumption that raw compute scaling will eventually eliminate edge-case errors. Teleoperation vendors are infrastructural utility that prioritize and monetize raw operational hours, since their revenue scales with data volume rather than utility or novelty. Hardware incumbents operate on the assumption of environmental stationarity, since their solution fails out-of-distribution. And large camp of academic roboticists denies it is a data problem at all and expects physics, models, and control to close the gap without the deluge.

The key archetype to analyze is the _[neo-integrator](https://www.linkedin.com/pulse/rise-neo-integrator-avi-zurlo-uiwwe/)_. This model attempts to bypass data-collection bottlenecks by deploying specialized robotic units into commercial production, utilizing human-in-the-loop oversight to manage operational failures. The core thesis relies on an unproven economic flywheel: production telemetry will generate the novelty required to train multi-task capabilities. [Evan Beard](https://www.notboring.co/p/robot-steps) of Standard Bots makes the case at length. [Kyle Vedder](https://vedder.io/misc/novelty_pump.html) pushes back on deployment first, arguing that the environments willing to pay for early-stage deployment are naturally low-variance, creating a "novelty pump" constraint.

> We analyze this debate through a neutral framework combining **empirical scaling laws** and **the unit economics of data capture**, isolating exactly which allocation strategy yields the highest model capability per dollar.

Data operations in physical AI map across three modalities, each defined by trade-offs between cost and information density:

*   **Observational Data:** Low-cost, high-breadth, action-deficient corpora (e.g., egocentric and exocentric video). This modality expands support of the representation, but lacks direct action supervision.

*   **Interventional Data:** High-cost, low-breadth, action-dense demonstrations (e.g., teleoperation). This modality maps explicit state-action trajectories but scales linearly with human labor.

*   **Deployment Data:** Endogenous telemetry generated by production systems, often running at a loss. This modality is un-curated and samples an environmental distribution dictated by commercial operations rather than algorithmic design.

Data maximization often introduces low-entropy noise that degrades training efficiency. As demonstrated by the [C4 dataset](https://www.tensorflow.org/datasets/catalog/c4) in language modeling,_subset subtraction results in model improvements_. Notably, filtering boilerplate and near-duplicates to maximize distinct token coverage within a fixed budget.

As stakeholders, the questions we have to ask are these. What does a dollar buy in each type of data? Where does new information come from? And can deployment, the data we are paid to collect, widen the set of tasks we can deploy, or does it run dry quickly?

**Evaluating a data pipeline is a capital-allocation problem**: balancing the marginal cost of data against novel information and ability to advance the model’s generalizability.

The scaling-law literature answers these questions on language models. What matters about a dataset goes beyond its size: how many distinct examples it holds, how diverse the mixture is, how often each example repeats, and how close new data is relative to existing data.

_Yes, as a power law with diminishing returns, down to a floor._ Test loss falls as a straight line in log-log against data, model size, and compute ([Kaplan 2020](https://arxiv.org/abs/2001.08361)). With size _N_ and tokens _D_, under the joint scaling formulation ([Hoffmann 2022](https://arxiv.org/abs/2203.15556)) loss is modeled as:

The functional form is consistent, while the numerical values remain approximations ([Besiroglu 2024](https://arxiv.org/abs/2404.10102)). At the compute-optimal allocation the two reducible terms decay at the data rate and collapse to a one-dimensional envelope,

The constant **E** represents the model's irreducible predictive uncertainty.

_Yes, operating across independent axes from dataset volume._ A diverse data mixture yields two simultaneous effects: it drives down the asymptotic error floor via cross-domain transfer and expanded manifold coverage, and it increases the intrinsic dimension of the dataset (_d int_). In the resolution-limited regime _β ≈ 4/d int_ for a smooth target, where _d int_ is the intrinsic dimension of the data manifold ([Sharma & Kaplan 2020](https://arxiv.org/abs/2004.10802); [Bahri 2021](https://arxiv.org/abs/2102.06701)).

> Because `β` enters as an inverse of dimension, halving a task's intrinsic dimension roughly doubles the scaling exponent: the loss curve falls faster. But this is at the cost of convergence to an inferior optima which doesn’t yield generalization. To maximize generalization, pre-training distributions must deliberately avoid artificially low intrinsic dimensionality.

The data-mixing law ([Ye et al. 2024](https://arxiv.org/abs/2403.16952)) decomposes a mixture's loss into orthogonal per-domain power laws and cross-coupling terms, which dictate either positive transfer or negative interference.

Repetition provides marginal utility up to approximately four epochs, matching the efficiency of fresh tokens; beyond this threshold, utility decays rapidly, eventually degrading capability. [Muennighoff et al. (2023)](https://arxiv.org/abs/2305.16264) fit exponential saturation with half-life _R* ≈ 15[1](https://praxiscurrents.substack.com/p/moneyball-for-physical-ai#footnote-1)_: four passes incur negligible penalty, while sixteen passes define a strict regime of diminishing returns where additional compute yields zero information gain. Furthermore, over-indexing on a narrow data fraction drives a localized double-descent anomaly in test loss and fundamentally degrades circuit mechanisms, specifically induction and copying heads, that govern in-context learning ([Hernandez et al. (2022)](https://arxiv.org/abs/2205.10487)). Repeating just 0.1% of a corpus 100 times collapses the downstream performance of an 800M-parameter model to that of a 400M-parameter baseline, demonstrating that even minor distributional redundancies act as massive capital drains.

[![Image 2](https://substackcdn.com/image/fetch/$s_!KxsU!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdaaee104-cce8-4ebe-8c5a-9146f9139cc4_902x876.png)](https://substackcdn.com/image/fetch/$s_!KxsU!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdaaee104-cce8-4ebe-8c5a-9146f9139cc4_902x876.png)

Loss of LLMs (4.2B parameters) scaled on repeated data decays resulting in worse than expected performance ([Muenninghoff et al 2023](https://arxiv.org/pdf/2305.16264))

Near-duplicates exist on a utility continuum bounded by exact repetition and entirely novel samples. Removing these redundancies improves model generalization while optimizing the token budget for distinct manifolds. [Lee et al. (2021)](https://arxiv.org/abs/2107.06499) found that individual sentences appearing over 60,000 times within the C4 corpus. Redundancy in large-scale corpora necessitates systematic deduplication to mitigate verbatim memorization while accelerating convergence velocity. Mechanistically, a small perturbation forces a model to map identical targets across a bounded neighborhood (_x_ and _x + ε_), serving as an implicit consistency regularization. Consequently, the near-duplicates are very low utility. At moderate _ε,_ regularization is useful, and as _ε_ expands, it becomes a distinct data point._**Densely-sampling within a narrow neighborhood rapidly saturates local capacity, and hurts model performance.**_

Rare, out-of-distribution (OOD) events yield outsized marginal utility because model performance at the scaling limit is constrained by the failure tail. Real-world physical distributions are heavy-tailed; scaling macro-capabilities emerges from mastering a Zipfian distribution of subskills acquired sequentially based on frequency ([Michaud et al., 2023](https://arxiv.org/abs/2310.12112)). Achieving frontier accuracy requires fitting these rare subpopulations, which collectively constitute a large volume of total operational density ([Feldman, 2020](https://arxiv.org/abs/1906.11304)). Consequently, optimizing a corpus by filtering for high-difficulty, low-frequency samples can bypass standard power-law scaling constraints entirely ([Sorscher et al., 2022](https://arxiv.org/abs/2206.14486)). Because these edge cases are rooted in real-world stochasticity, they are intractable to replicate via synthetic generation or structured staging. However, as the model’s known distribution expands, remaining novel variations become exponentially rarer, driving a steep increase in the marginal cost of discovery.

**Summary**:

*   More data buys a power law down to a floor.

*   Diversity lowers the floor at the cost of rate.

*   Repetition buys little and eventually hurts performance.

*   Near-duplicate data is the weakest of all, short of a deliberate small perturbation.

*   The long tail rare events are very informative, yet are increasingly costlier to discover.

In language modeling, compute is the binding constraint and data is abundant and low-cost. Conversely in robotics, useful data is strictly constrained by data acquisition costs. Consequently, the objective function shifts from maximizing compute efficiency to maximizing marginal loss reduction per dollar.

The global capability target is modeled as a convex combination over discrete task clusters _j_ with assigned prior weights (_π j_). Each independent cluster obeys a distinct scaling envelope conditioned on environmental parameters:

a floor _A j(φ)_ over a data-reducible term, with exponent _β j ≈ 4/d j_ set by the cluster’s intrinsic dimension (_d j_).

To optimize a finite capital allocation, **resource expenditure must equalize the marginal value per dollar across all available collection and curation channels.**

1.   **Interventional Channel:**Active demonstration data carries a premium for direct action supervision. It triggers rapid volume saturation, yielding economic utility primarily through cross-task skill transfer. An action channel _i_ purchases directional coverage _D j =_ Σ _i w ij g i(n i)_ at price _c i,_ with _g i_ saturating and _w ij_ denotes the cross-domain transfer projection from channel _i_ to task cluster _j_. Differentiating this return against capital expenditure maps the marginal utility per dollar to optimize resource allocation.

1.   **Observational Channel**: Passive observational data carries a distinct price. Without action labels, it yields economic utility by optimizing the underlying representation space. It simultaneously suppresses the aleatoric floor and regularizes the scaling coefficient.

**The floor depends on the sensors.** The aleatoric term is irreducible only relative to the information state observed by the specific robot configuration. We formalize the floor on task cluster _j_ under sensing configuration _φ_ via conditional entropy: _A j(φ)_ _= E [H[a | s φ]]._ This total risk decomposes into an absolute physical limit and a sensor-addressable margin:

**Operational Implication.**An environmental variance that a low-resolution sensor cannot resolve manifests as stochastic aleatoric noise to that model, whereas a higher-fidelity sensor converts it into predictable epistemic error. Action data drives the data-reducible term down toward _A j(φ);_ while better sensing lowers _A j(φ)_ itself.

> A task is viable only if break-even loss threshold is reachable _A j(φ) <_<_L neutral_ . If an optimal sensing yields _A j min_ ≥ _L neutral_, scaling data volume is mathematically futile. The system requires either hardware reconfiguration or an entirely different operational task.

Production telemetry behaves like an oil well following a steep decline curve: initial operations yield high-entropy failure modes, which rapidly decay into a low-utility, near-duplicate regime as anomalies are resolved. This localized distribution sampling undergoes exponential saturation: _U eff (n) = U 0 + ΔU(1 - e-n/n\_c)_. Past the covering number (_n c_), the production stream collapses into pure repetition with low-utility.

High-value data is concentrated strictly within the failure tail; routine operational successes contain zero marginal utility. The value is in the failures, not the routine successes. Crucially, in deployment the net cost per datum after revenue offset (_c dep_) is endogenous, scales non-linearly, and is bounded by the model's instantaneous loss (_L_):

All terms are dollars per logged task-attempt; _v_ is per-task completion value, _ρ(L)_ the error rate, `κ_int` and `κ_prod` the per-attempt intervention and lost-throughput costs. Prior to reaching the operational break-even threshold (_c dep_~0), data collection operates at a deficit, meaning the **early deployment phase must be capitalized as an R&D asset rather than funded by operational revenue.**

[![Image 3](https://substackcdn.com/image/fetch/$s_!SYno!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F30825557-7f3a-4583-b83e-ad9399191c87_1282x1006.png)](https://substackcdn.com/image/fetch/$s_!SYno!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F30825557-7f3a-4583-b83e-ad9399191c87_1282x1006.png)

An illustration of deployment of a model that is not ready yet. With logs-scale X-axis (capturing data/cost), the improvement that achieves cost neutrality can be large, while this data is not necessarily high-value. 

**Crossing the gap costs capital.** The usual trope is _start performance with model performing at least at 95%, with error-handling with interventions, and at 99.5% the deployment becomes profitable_. We can quantify this intuition as _L start_ (the largest loss for starting deployment) and _L neutral_ (the operational break-even threshold _)._ During this phase, deployment operates at a deficit, requiring external capitalization.[2](https://praxiscurrents.substack.com/p/moneyball-for-physical-ai#footnote-2)

Notably, data requirement scales with a power law, so this difference is in orders of magnitude, hence a very large total cost. Even more importantly, **a task whose break-even rate is near its aleatoric floor**(_L neutral_ ~ _A j(φ))_**is a capital sink**, which is the quantitative case for spending on breadth before scaling deployment.

To achieve viable commercial deployment under a sub-optimal foundation model, integrators must artificially constrain environmental variance, effectively collapsing the task's intrinsic dimensionality. As shown in §3.2, reducing the task’s intrinsic dimension to a smaller _d j_ ⇒ larger _β j_: convergence steepens but onto a narrow, non-transferable manifold. _Consequently, the data collected within these reachable commercial niches yields low entropy and contains negligible information density to advance a generalized foundation model._

This creates a self-reinforcing deficit. Structured operational cells yield low-entropy, correlated data. This data fails to expand the model's broader generalization boundary, permanently restricting the system to its initial niche. Operating within fragmented, low-variance niches incurs heavy non-recurring engineering overhead per task. To unlock software-like margins, the marginal integration cost of sequential tasks must asymptotically approach zero. Narrow, low-variance deployment telemetry is incapable of reducing this integration overhead.

This formulation unifies the divergent perspectives within the ecosystem:

*   **Staged Bias (Interventional Data):** High action density, but artificially structured. This data type preferred by model providers ([Vedder](https://vedder.io/misc/novelty_pump.html)’s post). It samples from a bounded, clean simulation or laboratory environment. While it maps explicit trajectories well, it fails to sample the chaotic aleatoric failure tail of real-world physics.

*   **Distributional Bias (Deployment Data):** High real-world presence, but artificially narrowed. This is the pillar neo-integrators lean on([Beard](https://www.notboring.co/p/robot-steps)’s post). To maintain commercial viability, systems are restricted to low-variance operational niches. It samples from the wrong distributional mixture, yielding low-entropy, correlated data that fails to drive generalized representation.

Working sequentially from narrow to broad applications is economically viable only if the expansion velocity of deployable tasks outpaces the compounding NRE integration deficit. Because deployment data from commercial niches cannot drive this expansion, the model requires exogenous inputs: _observational breadth_ to depress the aleatoric floor (A j​), and _interventional diversity_ to extend the model’s generalization boundary. **The production flywheel turns only after this baseline breadth is established.**

Data engineering pipelines should deprecate cumulative operational hours as a primary metric. Teams should instead track quantifiable task-specific telemetry, ordered by their computational estimability.

1.   **Marginal Integration Cost** Track the non-recurring engineering cost per novel task via project accounting. If this metric fails to decay as the task portfolio scales, the underlying model layer is not compounding cross-task representations, shifting the business model from scalable software to linear system integration.

2.   **Per-Task Saturation Point** (_n c_) Identify the inflection point where a task-specific or environment-specific learning curve flatlines. Ceasing data collection at this boundary mitigates the main driver of capital waste in manual teleoperation budgets.

3.   **Distributional Drift** (_v j_) Monitor the velocity of out-of-distribution (OOD) inputs and the frequency of required model retraining. A non-stationary target distribution continually generates informative failure modes, making it the sole operational regime where continuous deployment telemetry yields a sustained data edge.

4.   **Cluster coverage**, Quantify the volume of orthogonal task, object, and environmental clusters within a standard data embedding, rather than tracking raw episodic counts. The longitudinal trend of cluster expansion serves as a proxy for cross-domain generalization.

5.   **Data Novelty Density:** Proxy the information density of incoming streams using active learning heuristics, such as ensemble disagreement or predictive variance at logged states. This filters out low-entropy, routine operational successes to prioritize the high-utility failure tail.

**The Boundary of Unmeasurable Uncertainty.**The primary variable governing feasibility, the aleatoric floor _A j(φ),_ cannot be directly mapped. While it can be approximated by fitting _L(D) = E + B D-β_ and isolating the asymptote _E,_ due to approximation challenges, it cannot be used directly.

An organization's position within the physical AI supply chain dictates its data visibility, operational focus, and blind spots.

1.   **Model-first labs:** Focus on pre-training via massive curation and cleaning of cross-embodiment observational corpora. This breadth drives compounding generalization. World-model labs make a bet on data creation to manufacture interventional data cheaply with a learned model. However there remains a big bottleneck due to the heavy use of staged interventional data. The aleatoric failure tail of edge-case deployments, which neither static pre-training nor synthetic simulation can accurately replicate.

2.   **Vertical Integrated Players:**Focus on deployment telemetry, owning data collection and cleaning directly on proprietary hardware. While hardware-aligned data is efficient, this strategy is bottlenecked. Outside of naturally high-variance domains like autonomous driving, deployed systems face a circularity trap: to survive commercially, they must restrict operations to low-variance environments, which yields low-novelty data that fails to drive broader model generalization.

3.   **Neo-integrators:** Maintain shallow operational footprints across diverse industrial environments. They are positioned to harvest task diversity (the compounding scaling term). However, their business models typically treat this footprint as a billing surface rather than an active data curation landscape, which is a strategic error.

4.   **Teleoperation vendors:** Monetize data creation by selling operational hours. Because their economic incentive is to maximize raw volume rather than unique sample coverage, they operate past the per-task saturation threshold (_n c_). They sell infrastructural utilities (”shovels”) that generate localized revenue but offer no scaling edge.

5.   **Hardware Incumbents :** Defend profitable, low-variability market segments designed for deterministic motion replay. They collect little data for learning and lack a path up the scaling curve.

**The scarcest capability in physical AI is the identification and capture of data novelty**. Value will systematically accrue to the operations teams capable of isolating out-of-distribution variations, independent of traditional organizational divisions between research and hardware engineering.

The success of software application layers (e.g., Cursor, Harvey) that rent foundation models by the token suggests value can be captured without prioritizing model pretraining or data novelty. However, economic value capture and model capability are independent variables. While downstream applications successfully monetize workflow integration and proprietary distribution, their technical constraints differ from physical AI across three axes:

*   **Task Dimensionality and Saturation:** Data utility is determined by the intrinsic dimensionality of the target domain. Software development exhibits high intrinsic dimensionality, meaning continuous workflow feedback yields ongoing marginal utility. Conversely, many physical tasks (e.g., structured warehouse picking) possess low intrinsic dimensionality; consequently, task-specific data streams saturate rapidly, transitioning quickly into a regime of diminishing returns.

*   **Foundation Asymmetries:** Software applications operate downstream of generalized, heavily subsidized foundation models. Because physical AI lacks a comparable rentable foundation layer, current robotics deployment strategies must artificially reduce environmental variation to maintain operational viability. This constraint restricts data collection to specialized subsets that fail to drive broader generalization.

*   **Telemetry and Margin Constraints:** Software environments permit complete, low-cost observation of the entire operational loop (e.g., source code, user modifications, and compilation outcomes). Physical telemetry is costly to capture and inherently under-observed due to sensor resolution thresholds (the aleatoric floor). Furthermore, if the foundational observational data for physical AI remains rivalrous and proprietary, leverage will concentrate at the upstream model layer. Infrastructure providers will retain monopoly pricing power, compressing downstream application margins

Optimizing a data budget by tracking raw volume (e.g., cumulative operational hours) is an ineffective metric for model performance. 

Neither staged interventional data nor narrow deployment data can scale a foundation model in isolation. High-volume interventional data collection in staged settings results in diminishing returns because sample coverage saturates rapidly on a per-task basis. In contrast, relying on commercial deployments as a low-cost data collection strategy introduces an economic trap: commercial niches that yield revenue generally lack the novelty required to improve model generalization. Instead, each new environment incurs non-recurring engineering costs to integrate the narrow model with error handling.

> Data engineering pipelines should deprecate cumulative operational hours as a primary metric. **Engineering efficiency and model scaling should be evaluated using quantifiable parameters**: marginal engineering integration cost per task, per-task saturation thresholds, cluster coverage within data embeddings, and distribution drift (_v j_).

**An optimal capital allocation strategy balances data types against their specific utility metrics:**

*   **Observational Breadth:** Prioritize low-cost, diverse observational data to lower the aleatoric error floor and expand the baseline capability boundary.

*   **Interventional Staging:** Limit high-cost interventional demonstration data strictly to the task’s saturation threshold (n c), reallocating the remaining budget to task diversity rather than repetitive iterations.

*   **Deployment Telemetry:** Filter production streams to isolate out-of-distribution edge cases and failure modes, discarding high-volume routine successes that lack information density.

*   **Cost hemorrhage in early deployment:**While early deployment may provide some useful signal, continued deployment before breakeven is wasted capital.

**Moneyball for Physical AI:** Ultimately, capital efficiency scales not by maximizing data volume, but by accurately pricing data novelty.

If you find these frameworks useful for your research or strategic planning, please consider citing this post:

[1](https://praxiscurrents.substack.com/p/moneyball-for-physical-ai#footnote-anchor-1)

Given _U_ unique examples and _r = T/U_ passes, effective dataset size scales as _D eff = U·f(r)_ where _f(r)_ saturates exponentially.

[2](https://praxiscurrents.substack.com/p/moneyball-for-physical-ai#footnote-anchor-2)

The gap diverges as the margin _Δ safe(φ) = L neutral - A j(φ)→ 0:_ data-to-reach-loss-`L` scales as `(L − A_j)^(−1/β_j)`, so as the break-even target approaches the aleatoric floor, required data—and thus cost—blows up super-linearly even though the exponent `β_j` is fixed.

