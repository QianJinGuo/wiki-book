---
source: rss
source_url: https://netflixtechblog.com/evaluating-netflix-show-synopses-with-llm-as-a-judge-6269251e6f28?source=rss----2615bd06b42e---4
ingested: 2026-06-07
feed_name: Netflix Tech Blog
source_published: 2026-04-10
sha256: 1581746ac619f4f4eb181a4bffdd8954c1e13ed09671512d8687c8b033ca7c70
---

# Evaluating Netflix Show Synopses with LLM-as-a-Judge

by [Gabriela Alessio](<https://www.linkedin.com/in/gabrielaalessio/>), [Cameron Taylor](<https://www.linkedin.com/in/cameronntaylor/>), and [Cameron R. Wolfe](<https://www.linkedin.com/in/cwolferesearch/>)

### Introduction

When members log into Netflix, one of the hardest choices is what to watch. The challenge isn’t a lack of options —  _there are thousands of titles_ — but finding the most intriguing one is complex and deeply personal. To help, we surface [personalized promotional assets](<https://netflixtechblog.com/artwork-personalization-c589f074ad76>), especially the show synopsis —  _a brief description highlighting key plot elements, with cues like genre or talent_.

Strong synopses help members scan, understand, and choose. Poor synopses frustrate, mislead, and drive abandonment. Ensuring high-quality synopses is essential, but scaling quality validation is hard. We host hundreds of thousands of synopses, usually with multiple variants per show. We need to ensure quality at scale so every member gets a consistently great experience every time they read a synopsis. This approach helps us scale high‑quality synopsis coverage for our rapidly expanding catalog, enabling greater speed and coverage without sacrificing quality.

This report outlines our LLM-based approach for evaluating synopsis quality. Using recent advances in agents, reasoning, and LLM-as-a-Judge, we score four key synopsis quality dimensions, achieving 85%+ agreement with creative writers. Additionally, we show that higher LLM judge quality is correlated with key streaming metrics, _allowing us to proactively identify and fix impactful issues weeks or months before a show debuts on Netflix_.

### The Making of a “Good” Synopsis

Writing high-quality synopses requires creative expertise. Our expert creative leads are best positioned to craft the creative approaches and define quality standards. However, AI can help us consistently evaluate these expert-driven quality criteria at scale. Synopsis quality at Netflix, which our system aims to predict, is viewed along two dimensions:

  1. _Creative Quality_ : members of our creative writing team assess synopsis quality according to our internal writing guidelines and rubrics.
  2. _Member Implicit Feedback_ : we measure the relative impact of a particular show synopsis on core streaming metrics.



These two definitions of quality capture distinct and important aspects of quality, one focused upon creative excellence and the other upon utility to members.

#### Creative Quality

For this project, we evaluate synopses against a subset of our creative writing quality rubric —  _the same criteria to which human writers would adhere_. These quality rubrics change over time as quality standards evolve. Given Netflix’s distinctive voice and elevated editorial standards, the quality bar is high. Each criterion has extensive guidelines with examples across regions, genres, and synopsis types.

**Human evaluation.** We began by partnering with a group of creative writing experts to iteratively refine our definition of creative quality. We initially labeled ~1,000 diverse synopses, where three expert writers scored each against the criteria and explained their ratings. Due to the subjectivity of the task, early instance-level agreement was low. To reach a better consensus, we conducted calibration rounds (~50 synopses per round), surfaced disagreements, and evolved our quality scoring guidelines. Key interventions that were found to improve agreement include:

  * Using binary scores (instead of 1–4 Likert scores).
  * Allowing writers to reference past examples.
  * Maintaining a searchable taxonomy of common errors.



**Golden evaluation data.** After eight calibration rounds, writer agreement reached ~80%. To further stabilize labels, we used a model-in-the-loop consensus where:

  * Multiple writers score each synopsis.
  * An LLM, guided by the rubric, aggregates to a final label.
  * Writers review cases with substantial disagreement.



The result is a golden set of ~600 synopses with binary, criteria-level scores and explanations —  _our North Star for aligning an LLM judge with expert opinion_.

#### Member Implicit Feedback

Netflix gauges implicit member feedback on a synopsis with two metrics:

  1. _Take Fraction_ : how often members who see a title’s synopsis choose to start watching it.
  2. _Abandonment Rate_ : how often members start a title but stop watching soon after.



Higher take fraction indicates more choosing, while lower abandonment suggests authentic, non-misleading presentation. Both of these metrics have been validated via A/B testing to serve as short-term behavioral proxies for long-term member retention. As part of evaluating our system, we also study the ability of LLM-derived quality scores to predict short-term engagement metrics. This step confirms that our scores capture behaviorally meaningful signals and assesses our ability to forecast member response to a given synopsis.

### Scaling Quality Scoring with LLM-as-a-Judge

We begin our experiments by creating simple, per-criteria prompts that:

  1. Supply criterion-specific show metadata.
  2. Summarize the relevant quality guidelines.
  3. Use [zero-shot chain-of-thought prompting](<https://arxiv.org/abs/2205.11916>) to elicit an explanation.
  4. Request a binary decision for the synopsis.



Using a single prompt to evaluate all quality criteria is found to overload the LLM and yields poor performance —  _dedicated judges for each criteria perform better_. Because criteria are unique, each task has its own setup, but there are some shared components:

  * We use the same LLM for all criteria.
  * The judge always outputs an explanation before its final score.
  * Final scores are binary.



Due to our use of binary scoring, judges can be evaluated with simple accuracy metrics over the golden dataset. Next, we summarize the experiments that led to our final system.

**Prompt optimization.** Because LLMs are sensitive to prompt phrasing, we apply [Automatic Prompt Optimization (APO)](<https://arxiv.org/abs/2305.03495>) over a ~300-sample dev set. Scoring guidelines are provided as additional context to the prompt optimizer. After APO, we manually refine candidate prompts with the help of an LLM, yielding initial prompts with accuracies shown below. These prompts work well for some criteria (e.g., precision) but poorly for others (e.g., clarity), highlighting criterion-specific nuances.

**Improved reasoning.** Many failures of our initial system arise due to a lack of accurate reasoning through highly-subjective evaluation examples. To improve reasoning accuracy, we leverage two forms of inference-time scaling:

  * _Longer rationales_ : increase the length of the rationale or explanation generated by the LLM prior to producing a final score.
  * _Consensus scoring_ : sample several outputs from the LLM and aggregate their scores to produce the final result.



**Tiered rationales.** Using tone as an example, we tested whether longer rationales are helpful by defining three rationale length tiers (shown above) and comparing their accuracies. Accuracy rises with longer rationales but returns are diminishing. Medium rationales noticeably outperform short ones, while long rationales offer only a slight additional gain; see below.

Longer rationales improve performance but degrade human-readability, which is problematic given that explanations are key pieces of evidence for creative experts. As a solution, we adopt tiered rationales: _the judge reasons at any length but concisely summarizes its reasoning process prior to the final score._ Tiered rationales preserve the benefits of extended reasoning, make outputs easier to inspect, and even benefit scoring accuracy. For example, our tone evaluator improves from 86.55% to 87.85% binary accuracy when using tiered rationales.

**Consensus scoring.** We can also allocate more inference-time compute by sampling multiple outputs per synopsis and aggregating their scores. We aggregate via a rounded average to ensure that the final score remains binary. For tone and clarity criteria with tiered rationales, 5× consensus scoring yields a clear accuracy boost as shown below.

Consensus scoring on the precision evaluator, which uses a vanilla (short) chain-of-thought, yields no benefit. As an explanation, we notice that longer rationales increase variance in scores across multiple outputs, while short rationales yield consistent scores. Consensus may be most useful for evaluators with longer rationales, where it helps to stabilize score variance. When shorter rationales are used, all scores tend to be the same, making consensus less meaningful.

**What about reasoning models?** While our setup elicits reasoning from a standard LLM, we also explored quality scoring with true reasoning models (i.e., models that generate long reasoning trajectories prior to final output). For tone, using a reasoning model with 5× consensus yields improving accuracy with increasing reasoning effort, even outperforming tiered rationales at the highest reasoning effort; see below. However, we skip reasoning models in our final system, as they significantly increase inference costs for only a marginal performance gain.

**Agents-as-a-Judge for factuality.** Synopses have four common types of factuality errors:

  1. Incorrect plot information.
  2. Incorrect metadata (e.g., genre, location, release date).
  3. Incorrect on- or off-screen talent.
  4. Incorrect award information.



Detecting these factuality errors requires comparing the synopsis to ground-truth context, where necessary context varies per criteria. For example, plot information requires a plot summary or script, while award information needs a list of awards. As we have learned, simplicity drives reliability: _too much context or too many criteria harms accuracy_. Motivated by this idea, we adopt factuality agents, where each agent evaluates one narrow aspect of factuality.

An agent receives context tailored to one facet of factuality and produces both a rationale and a binary factuality score. The final score of the Agents-as-a-Judge system is the minimum factuality score across agents —  _any failed aspect yields an overall fail_. All rationales are fed to an LLM aggregator to produce a combined rationale to accompany the final score. As shown below, leveraging factuality agents significantly benefits scoring accuracy. Further benefits are achieved by using tiered rationales and consensus scoring within each agent.

**Final system.** In summary, our automatic evaluation system uses a combination of standard LLM-as-a-Judge, tiered rationales, consensus scoring, and Agents-as-a-Judge to maximize binary scoring accuracy for each criteria. A summary of the techniques used for each criteria and the associated binary scoring accuracy is provided below.

### Member Validation of LLM-as-a-Judge

Beyond expert agreement, we also study how LLM-as-a-Judge scores relate to member behavior. This analysis serves two goals:

  * Further validating LLM-judge accuracy.
  * Linking creative quality to member-perceived quality.



Framed as predictors of member outcomes, LLM judges help us assess how promotional assets affect viewing and determine which creative attributes matter most to members discovering content they enjoy. To perform this analysis, we take advantage of the fact that most shows have multiple, personalized synopses (i.e., a synopsis “suite”). Using this suite, we can measure the causal effect of synopsis selection on metrics like take fraction and abandonment rate.

**Our methodology.** We correlate synopsis performance (take fraction or abandonment) with LLM quality scores. Specifically, within each show s, we relate changes in a synopsis’s LLM score to changes in its performance, normalizing by the show-level standard deviation and clustering standard errors by show; see below.

β captures the average association between within-show changes in LLM score and changes in performance. While we don’t have clean, experimental variation in LLM scores, this analysis still validates predictive value and practical utility.

**Member-focused results.** We report correlations for individual LLM criteria and a “Weighted Score” that combines all criteria to reduce noise and maximize signal from behavioral data. As shown below, results show promising prediction of take fraction and abandonment. Precision and clarity are especially predictive, and the weighted score provides a statistically useful signal of higher take and lower abandonment. In short, LLM evaluators capture factors that matter to members, making them a valuable tool for monitoring synopsis quality and engagement.

### Closing Remarks

The LLM-as-a-Judge system used to evaluate show synopses at Netflix is the result of extensive experimentation grounded in both creative expertise and member outcomes. Building an automatic evaluation system that works reliably in practice is hard, and the approach we have described reflects countless lessons learned through iteration to improve accuracy and scalability. We have validated the system extensively with human evaluation at both the system and component levels, and we have shown that its outputs correlate with key streaming metrics. As a result, we are confident that it captures the dimensions of synopsis quality that matter most — both creatively and from the member perspective — which has driven its widespread adoption in the Netflix synopsis authoring workflow.

* * *

[Evaluating Netflix Show Synopses with LLM-as-a-Judge](<https://netflixtechblog.com/evaluating-netflix-show-synopses-with-llm-as-a-judge-6269251e6f28>) was originally published in [Netflix TechBlog](<https://netflixtechblog.com>) on Medium, where people are continuing the conversation by highlighting and responding to this story.
