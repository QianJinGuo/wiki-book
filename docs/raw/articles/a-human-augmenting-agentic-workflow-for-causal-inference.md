---
source_url: "https://netflixtechblog.com/a-human-augmenting-agentic-workflow-for-causal-inference-4623f0a9c5af?source=rss----2615bd06b42e---4"
ingested: 2026-06-26
sha256: 6cfcfe4e47dbd23d
---

# A Human-Augmenting Agentic Workflow for Causal Inference

By Winston Chou, Adrien Alexandre, Lars Olds, Yi Zhang, Garrett Hagemann, and Nathan Kallus

### Introduction

Imagine asking a data agent to analyze the causal relationship between two variables, such as the effect of watching a popular Netflix show on long-term member retention. It queries your data, runs a regression, and confidently returns an answer. How much should you trust it? Can you be confident that the agent accounted for subtle biases — or does it treat passionate fans as if they were the average viewer? Without deep understanding and expertise, would you even be able to tell if it got the answer wrong?

Data analysis is increasingly being delegated to software agents. While this reduces human effort and toil, oversight is still needed to ensure the validity of results. This is especially true for specialized tasks like [Observational Causal Inference (OCI)](<https://en.wikipedia.org/wiki/Observational_study>), which require substantial judgment and domain expertise.

In this blog post, we share an agentic workflow for performing OCI under [unconfoundedness](<https://www.nber.org/system/files/working_papers/t0294/t0294.pdf>). Our workflow is designed for software agents to adhere to rigorous, exhaustive templates for causal inference tasks. Yet, it also seeks to be “[human-augmenting](<https://pubsonline.informs.org/doi/10.1287/mnsc.2024.05684>),” and to enable and empower human inspection and evaluation.

We designed this workflow with OCI practitioners in mind. Although OCI requires context and care to do well, aspects of it — e.g., checking and rechecking covariate balance, conducting sensitivity analyses, and keeping track of multiple iterations — can be repetitive and prone to error. Our workflow seeks to eliminate this toil so that humans can focus on more nuanced tasks, such as framing questions, scrutinizing assumptions, and evaluating results.

To this end, **we are open-sourcing a standalone version of our**[**oci-agent**](<https://github.com/Netflix-Skunkworks/oci-agent>) so that OCI practitioners can model workflows on and suggest improvements to it. We also share evaluations of our agent on the 2016 Atlantic Causal Inference Conference (ACIC) [competition datasets](<https://files.eric.ed.gov/fulltext/ED591944.pdf>), and show that our agent systematically beats one-shot iterations under numerous data-generating processes — while achieving competitive results against hand-tuned benchmarks.

This post describes the principles behind our workflow and gives a case study of its deployment at Netflix.

### Philosophy

Our workflow is built on top of Netflix’s pre-existing OCI toolkit. We built this toolkit — largely in a pre-AI world — to answer “point-in-time” causal questions, such as “what is the effect of playing a Netflix game on member retention?” or “what is the effect of watching a highly popular show on subsequent engagement?” Questions of this kind inform business strategy, guide metric development, and contribute to a rich understanding of what drives member satisfaction.

Our toolkit is guided by a “[target trial emulation](<https://academic.oup.com/aje/article-abstract/183/8/758/1739860>)” philosophy. For any point-in-time OCI question, we ask “what is the ideal A/B test for addressing this question?” This A/B test may be expensive, slow, or even infeasible to run. However, the thought exercise helps to pin down the assumptions needed for a credible answer, such as unconfoundedness of the treatment.

To make the target trial analogy actionable, our toolkit embeds a series of **design diagnostics**. These diagnostics assess whether we are drawing fair comparisons between treated and untreated units — or if there are hidden differences that could imperil our conclusions:

  * _Covariate balance._ After weighting, the standardized mean difference of pre-treatment covariates between treatment and control groups should be less than 0.2.
  * _Overlap._ The probability of receiving treatment (aka propensity score) should be bounded between 0.1 and 0.9.
  * _Placebo outcome._ The “treatment effect” on variables measured prior to the treatment should not be significantly different from zero.
  * _Sensitivity to hidden confounders._ Findings of treatment effects are contextualized by sensitivity to hypothetical omitted variables that explain both treatment and outcome.



As we uplevel our OCI toolkit with agents, such evaluation remains paramount. The standard approach to evaluating agents is to programmatically compare their outputs to ground truth. Yet, outside of artificially simulated data, there is [no ground truth in observational causal inference](<https://en.wikipedia.org/wiki/Rubin_causal_model#The_fundamental_problem_of_causal_inference>).

Without discounting the need for evals (which our workflow also supports), one of our key principles is to augment _human_ evaluation by making each analytic step as transparent as possible. For example, in our workflow, agents publish artifacts in the form of plans, specifications, plots, and notebooks that humans can inspect and re-execute if they wish. In the absence of ground truth, we rely on these “process audits” — coupled with human oversight — to build good agents.

### Principles

Our workflow has three key personas:

  1. **Principal** — the human user (e.g., data scientist) whose goal is to provide a thorough and correct analysis
  2. **Actor** — the software persona that performs the analysis, including diagnostics
  3. **Critic** — the software persona that synthesizes results, identifies gaps, and offers suggestions to improve the analysis



Our agent orchestrates the latter two personas in an actor-critic loop: specifying and triggering the analysis as the actor, then interpreting results and diagnosing flaws as the critic.

Each persona has responsibilities:

**Principals**

  * Provide an initial analysis plan containing its context and goals.
  * Provide context on the main threats to valid inference and the confounders that must be controlled.
  * Specify the tools that can be used for the analysis.
  * Specify the data model and dataset.



**Actors**

  * Refine the principal’s plan into a data analysis spec.
  * Use only the tools provided by the principal.
  * Create human- and machine-checkable artifacts.
  * Perform the four design diagnostics in addition to the core analysis.
  * Report any remediations taken in case of diagnostic failures.



**Critics**

  * Check for blind spots, such as unmentioned confounders, in the principal’s plan.
  * Check for alignment between the plan, spec, and executed analysis.
  * Specify a credibility level in the results after seeing the diagnostics.
  * Specify if and how the estimand differs from the Average Treatment Effect (ATE), for example due to propensity score trimming.
  * Contrast the executed analysis with the ideal target Randomized Controlled Trial (RCT).
  * Suggest at least one alternative measurement strategy (e.g., encouragement RCTs).



Although our workflow is designed for OCI under unconfoundedness, the principles listed in this section are meant to be extensible to other approaches to OCI, such as panel methods with very different assumptions (e.g., parallel trends).

### Empowering Human Evaluation

To empower human oversight of each analytic step, we provide principals with a templated notebook that uses our vetted (non-agentic) OCI toolkit, which employs [doubly robust learning for causal effect estimation](<https://arxiv.org/abs/2506.07462>).

The principal’s remaining responsibilities are to write the initial analysis plan and to evaluate the analysis artifacts (the executed notebook and the critic’s report). To enable thorough evaluation, agents version-control their reports and upload executed notebooks to a file store, where they can be downloaded and re-executed by principals (if they wish).

We diagram this workflow below:

### Case Study — Estimating the Impact of New Entertainment Types

In recent years, we have added a wide variety of entertainment types beyond streaming video to Netflix. A natural question is how these new entertainment types affect members’ satisfaction and their likelihood of continuing to subscribe to Netflix.

To analyze the impact of one of these new entertainment types, which we will call Type X, we wrote a simple analysis plan specifying our

  * **Treatment** : Days engaging with Type X (or “Type X days” for short)
  * **Outcome** : Two-month retention
  * **Potential** **confounders** , including pre-treatment Type X days



To establish a baseline, we fed this analysis plan without additional scaffolding to Claude Sonnet 4.6, a powerful yet accessible general-purpose model. The model chose and executed a defensible analysis strategy: linearly regressing retention on Type X days along with controls.

While the result was polished and impressive, when we ran the same analysis through our paved path tooling and agentic workflow, also using Sonnet 4.6, our agent produced an updated estimate that was just 25% of the baseline! What explains the difference between the baseline and the paved-path estimates?

A core challenge when analyzing new entertainment types is **early adopter bias**. The first users of any new offering are likely to be systematically different from the general population. For example, they may be heavier users of Netflix generally, or they may be extremely strong fans of the underlying titles. Early adopter bias manifested in our analysis as poor “overlap”: the vast majority of observations had a small estimated probability of engaging with Type X, reflecting its early maturity.

This imbalance was caught by our critic agent in its writeup of the analysis. The critic also flagged the failure of the placebo test: early Type X adopters differed significantly from non-adopters in terms of important confounders measured _before_ experiencing the treatment, a warning sign of potential bias.

### Addressing Failed Diagnostics

To address these diagnostic failures, our workflow provides agents with a playbook. For example, to overcome poor overlap, we instruct the agent to use [Crump-style trimming](<https://academic.oup.com/biomet/article-abstract/96/1/187/235329?redirectedFrom=fulltext>). That is, before estimating causal effects, the actor trims units with estimated propensity scores outside the range [0.1, 0.9]. This scopes the treatment effect being estimated to the ATE in the population that is not very likely or unlikely to engage in the new entertainment type — an important caveat we instruct the critic to flag in its report.

Trimming yields an estimate that is much smaller than the baseline estimate, and which only applies to the “overlapping” population (for whom engagement with the new entertainment type is non-deterministic). However, the trimmed estimate is substantially more credible, as it focuses on the members for whom the treatment could plausibly be randomly assigned, as in a target trial.

Contrastively, the baseline effect relies heavily on assumptions to extrapolate outcomes for all members, even those with a very low probability of treatment. The [danger](<https://gking.harvard.edu/files/counterft.pdf?utm_source=chatgpt.com>) here is that extrapolation produces a number that is not backed by robust data and is likely confounded by early adopter bias.

### Orchestrating Followup Analyses

There are two natural followups to this analysis:

  1. First, we need to analyze the sensitivity of estimates to the choice of trimming threshold. Practically, this requires redoing the analysis with multiple trimming thresholds.
  2. Second, we also care about how these causal effects evolve over time. Yet, comparing causal effects across time raises subtle challenges. For example, we need to coordinate the population across all analyses: if a set of users is trimmed to make one analysis more credible, it should be trimmed in the other analyses as well.



Both of these followups require conducting multiple versions of the same analysis, tweaking some parameters while keeping others the same. Managing this complexity and ensuring consistent execution is another area where agents add value.

To illustrate this, below we show a sensitivity analysis for our case study in which we asked the agent to vary the trimming bounds from [0, 1] (no trimming) to [0.15, 0.85]. As the plot shows, the estimated ATE on the overlapping population is robust to the choice of trimming threshold within bounds of [0.005, 0.995]. Although principals could (and should) execute [this and other robustness analyses](<https://psicostat.github.io/4ms-winter-school/papers/Steegen%20et%20al.%202016%20-%20Increasing%20Transparency%20Through%20a%20Multiverse%20Analysis.pdf>), delegating them to agents helps to reduce toil.

Another example is generating a time series by repeating the same analysis across multiple date partitions. For example, below we plot the results of using our agent to refit a different analysis on ten distinct date partitions. The plot shows evidence of seasonality: the treatment has a stronger effect on the winter dates compared to the summer dates.

### Public Repo and Evals

To help OCI practitioners build on and contribute to our workflow, we are open-sourcing a standalone version of [oci-agent](<https://github.com/Netflix-Skunkworks/oci-agent>). This repo implements two evaluations on public datasets from the 2016 Atlantic Causal Inference Competition (ACIC) data analysis competition. It also includes a lightweight version of our internal causal machine learning notebook that only uses open-source software ([EconML](<https://github.com/py-why/EconML>)).

Our first evaluation runs this notebook for three randomly sampled datasets generated by each of the 77 data-generating processes (DGPs) in the ACIC data. Next, it uses the critic to grade the resulting 231 estimates as either satisfactory or unsatisfactory based on the diagnostics.

Below, we plot the average RMSE and coverage of 95% confidence intervals of our ATT estimates against the 44 competitor methods in the ACIC competition. As the scatterplot shows, our statistical methodology is competitive against these benchmarks: it achieves reasonably low RMSE and well-calibrated confidence intervals that cover the truth in ~95% of DGPs.

More to the point, our diagnostics and agentic workflow help to separate more reliable estimates from less reliable estimates. To illustrate this, the following chart plots our ATE estimates in terms of RMSE and coverage. Note that we separate out the RMSE and coverage of:

  * All 231 estimates (purple dot)
  * The 192 satisfactory estimates (blue star)
  * The 39 unsatisfactory estimates (red dot)



As the plot shows, when aided by our diagnostic suite, the critic agent is able to separate good estimates from bad estimates: the satisfactory estimates have _much_ lower RMSE and better calibrated confidence intervals than do the unsatisfactory estimates.

Our second evaluation compares the performance of an LLM on the same analysis plan with our scaffolding and without it (i.e., one-shot prompting). Unsurprisingly, we find that our scaffolding is critical to helping the LLM return useful estimates. This can be seen in the following random sample of ten ACIC datasets. Using our scaffolding, the LLM recovers the ground truth in nine out of ten datasets. Furthermore, estimates are highly correlated with ground truth.

In contrast, giving the same analysis plan to Sonnet 4.6 without any scaffolding (i.e., just prompting it) results in consistently wrong answers that are not at all correlated with ground truth.

A key limitation of our public repo is that, due to the synthetic nature of the underlying datasets, it doesn’t pressure-test our agent’s semantic understanding or performance on real-world OCI tasks. Nonetheless, the repo demonstrates the core principles underlying our workflow. These include (1) giving agents with extensive scaffolding so that they follow best practices by design, and (2) requiring inspectable artifacts so that humans can audit agents’ _processes,_ not just their outcomes.

### Conclusion

We provide a workflow for doing observational causal inference with the help of software agents. Leveraging elements of our pre-AI OCI toolkit, such as templated notebooks, our workflow is designed to ensure that agents conduct rigorous and exhaustive analyses. This helps to reduce the human toil of OCI, which can be a highly iterative and exacting process.

At the same time, motivated by the complexity and ambiguity of observational causal inference, our workflow seeks to be **human-augmenting** and enables human practitioners to evaluate each analytic step.

Using agents for causal inference poses a challenge: how do we evaluate agents’ performance on tasks without ground truth? To meet this challenge, our workflow combines process audits with human oversight. To enable others to learn from and critique our workflow, we have [open-sourced](<https://github.com/Netflix-Skunkworks/oci-agent>) a lightweight, standalone version. We hope this work stimulates more research and development on agentic evaluation in the absence of ground truth.

_For valuable feedback on this post and “dogfooding,” we thank Adith Swaminathan, Ayal Chen-Zion, Colin Gray, Juliet Hougland, and Simon Ejdemyr._

* * *

[A Human-Augmenting Agentic Workflow for Causal Inference](<https://netflixtechblog.com/a-human-augmenting-agentic-workflow-for-causal-inference-4623f0a9c5af>) was originally published in [Netflix TechBlog](<https://netflixtechblog.com>) on Medium, where people are continuing the conversation by highlighting and responding to this story.
