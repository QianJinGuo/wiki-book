---
title: "LLM-Driven Feature Discovery"
source_url: "https://www.alignmentforum.org/posts/WAZWA6FPQvH8okouJ/llm-driven-feature-discovery"
ingested: "2026-06-23"
sha256: "90c046ea013e5282"
created: 2026-06-23
updated: 2026-06-23
type: article
tags: [llm, feature-discovery, alignment, interpretability]
---

# LLM-Driven Feature Discovery


Published Time: 2026-06-22T22:26:51.599Z

Markdown Content:
We would often like to get a qualitative sense of a target model’s behaviors in important distributions (e.g. deployment, RL training, or evals). For example, we might want to [discover novel behaviors](https://alignment.anthropic.com/2026/petri-v2/), figure out what causes some target behavior to occur, or find [surprising correlations](https://arxiv.org/abs/2602.05910v1) between behaviors.

In a recent short exploratory project, we tackled this problem via _LLM-Driven Feature Discovery._ Our method works as follows:

1.   Choose a dataset of model transcripts
2.   Split transcripts into three pieces: user turns, thoughts, and assistant responses.
3.   Ask a black box LLM autorater to generate a set of 10-20 “features” of each transcript piece. By feature we mean notable/interesting/important aspects of the transcript piece; we include the prompt we use below. Note that the autorater only sees one piece at a time.
4.   Get a semantic embedding for each generated feature
5.   Cluster the semantic embeddings separately for user, thoughts, and response features
6.   Ask a language model to name each cluster by giving it 100 random features for each cluster and asking it to “produce a single concise label (around 5 words) that captures the common theme of these features.”.

![Image 1: feature-discovery-diagram.png](https://res.cloudinary.com/lesswrong-2-0/image/upload/v1782167151/lexical_client_uploads/flokviv1fdsm43hznr74.png)

During the project, we sometimes thought of this work as a sort of "black box SAE", since it was solving a similar problem as SAEs of featurizing model text, but without using model internals.

After doing this work, we found that this was a similar idea to [Explaining Datasets in Words: Statistical Models with Natural Language Parameters](https://arxiv.org/abs/2409.08466) (EDW). EDW optimizes over directions in an embedding space and then maps those directions to natural language features (“predicates”). Thus, EDW’s output is similar to ours. However, our method is simpler in that it requires just one LLM call per prompt and does not require multiple steps of iteration. Additionally, our method is unsupervised; we don’t need a target to optimize the embedding directions against. EDW seems preferable if one aims to minimize the error of a specific statistical model with natural language features.

Since this is preliminary work, we do not compare against EDW or other methods in the literature. We are not currently planning on pursuing this idea further, but would be interested if other members in the community expanded on it.

## A short summary of our main results:

We focus our analysis on a dataset of 100k chat transcripts, for which we generate 20k user, thought, and response features.

We find that:

1.   Many clusters describe interesting Gemini behaviors
2.   We mostly are not able to predict when a thought or response occurs using logistic regression on user features

Autorater prompt we use

> For the given conversation section text, identify key "features".
> 
> 
> Here are some examples of possible features. Try not to anchor too much on any one of these, they are just meant to give you a "vibe" of what to aim for:
> 
> 
> * The model is depressed
> 
> 
> * Talks about apples
> 
> 
> * Uses markdown
> 
> 
> * Backtracks in reasoning
> 
> 
> * Self Correction in reasoning
> 
> 
> * Few shot prompt
> 
> 
> * Doesn’t have access to required tool
> 
> 
> * Hallucinates tool call
> 
> 
> * Creative writing request
> 
> 
> * Model adopts persona
> 
> 
> * Model adopts expert coder persona
> 
> 
> * Thoughts are disjointed and hard to follow
> 
> 
> * Uses emojis
> 
> 
> * Uses bullet points
> 
> 
> * Very realistic
> 
> 
> * Very fictional
> 
> 
> * Sycophantic response
> 
> 
> * Displays evaluations awareness
> 
> 
> * Typo
> 
> 
> * Roleplaying
> 
> 
> * About [topic]
> 
> 
> * Uses placeholders
> 
> 
> * In Mandarin
> 
> 
> Please prioritize the following properties:
> 
> 
> (1) Interestingness: Do generated features features represent novel or surprising behaviors?
> 
> 
> (2) Appropriate abstraction: Do generated features operate at a useful level of specificity, i.e., neither so narrow as to apply to only a few examples, nor so broad as to lack discriminative power?
> 
> 
> (3) Uniqueness: Generated features should be as different as possible. It is better to return fewer features with less duplication than many features with duplicates.
> 
> 
> Please make features use only letters a-z, e.g. don't include parentheses, colons, numbers, etc. Please capitalize only the first word and any proper nouns in the feature.
> 
> 
> It might help to brainstorm many features and then select the best ones by these criteria.

## Comparison of LLM-driven feature discovery to SAEs:

LLM-driven feature discovery Normal SAE
Training procedure Ask an LLM to featurize conversations, then embed and cluster features, then name clusters.Reconstruct activations with a sparsity penalty, then ask an LLM to interpret hidden latents.
Inference procedure Ask an LLM to featurize a conversation, then lookup the corresponding clusters Pass the conversation through the target LLM and get the activations, then pass the activations through the SAE
Feature specificity Per conversational block Per token
Features per context 20-30 Thousands
Relationship of features to model computation No direct relation Directions in activation space
Access to target model needed Model output Model internals
Why does a feature apply in a certain context The LLM reasons that it applies The latent direction is useful for reconstructing the activation

Overall, we think that LLM-driven feature discovery has some benefits compared to SAEs (clearer explanations for why a feature applies to a context, higher level features, no need to have access to model internals) and some drawbacks (not related to model activations so can’t e.g. steer with them, more expensive to compute).

## Results

### Clusters

To get a general qualitative sense of these clusters, we ask an LLM to take groups of 10 clusters and rate how interesting they would be to a safety researcher on a scale of 1 to 100 (we give the rating LLM 10 clusters at a time to make the output more calibrated and give it a few examples from each cluster). We also ask the LLM to give a sentence long description for each cluster. Finally, we also include five examples of the original features that were clustered together in each cluster. Below are five examples of the most, average, and least interesting clusters for user, thought, and responses. Note that we filter out clusters that would leak user information or that describe idiosyncratic parts of Gemini thoughts:

We find that there are many interesting high level features, particularly in model thoughts. For example, the model being aware of the number of tokens it can generate, considering whether the scenario is reality or a roleplay, and getting stuck in infinite loops. Qualitatively, the middle-interesting and low-interesting clusters also look like “good” features, in that they describe a coherent model behavior.

### Cluster Prediction

We are also interested in _predicting_ model behavior, so another experiment we run is whether we can predict thought and assistant response features from user features. We train logistic regression probes on the 1000 most common thought and assistant clusters. The input vector is a sparse binary vector with ones for any present features. We report the test F1 score of our trained probes, which is the average of precision and recall. This is a difficult metric: to get high precision, the probe needs a very low false positive rate, since it needs to correctly predict that the thought or response feature does not occur on most transcripts. For the most part this does not work that well:

![Image 2](https://res.cloudinary.com/lesswrong-2-0/image/upload/v1782164431/lexical_cl
