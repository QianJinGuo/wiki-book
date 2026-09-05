---
source: newsletter
source_url: https://www.langchain.com/blog/building-a-100x-cheaper-trace-judge-with-fireworks
ingested: 2026-06-17
sha256: ab56ba24fb06186fa5ce8172b9382b6a72cb78177499f82836c8ab9d28ef42c1
---

# Building a 100x Cheaper Trace Judge with Fireworks

Published Time: Tue, 16 Jun 2026 19:08:50 GMT

Markdown Content:
Agents now [produce a majority of the world’s data](https://www.cnet.com/tech/services-and-software/its-official-agentic-bots-surf-the-web-more-than-real-people-do/) and power many applications we use today. As more agents move into production, [traces](https://docs.langchain.com/langsmith/observability-concepts#traces) will become more important as one of the richest sources of data to understand how agentic systems behave with real users.

**Research question:** how can we **cost-effectively** mine important signals from every single trace, while maintaining **frontier performance**?

To answer this question, we partnered with [Fireworks](https://app.fireworks.ai/account/home) to fine-tune a Qwen judge model to detect “Perceived Error” from user interactions.

**What is Perceived Error:**

> Perceived error is when the user thinks the assistant made a mistake or produced something that needed correction. Perceived Error is not judging objective correctness or user happiness. For example, an agent could give a correct answer but the user is frustrated by the information (not the agent).

We usually push for teams to build application specific evaluators, as often the logic to judge a trace needs to have context of that application. We believe, however, that “perceived error” is an example of an evaluator that can be general purpose. We believe the signals that it will look for are universal across applications.

The generality of “perceived error” is a key question. Some of the experiments we run later on are specifically aimed at testing the generality of this metric.

We infer perceived error from trace signals like user corrections, rejection of an agent action, repeated requests, and assistant acknowledgements of errors. The perceived error evaluator then enriches the trace with information in the format shown below:

`{"perceived_error": true, "reason": "The user corrects the meeting date the assistant used."}`

## How we created a dataset

Agents applied on tasks are only as good as the data used to train them. We sourced data from two internal tracing datasets we use in production:

[**chat-langchain**](https://github.com/langchain-ai/chat-langchain)

_Docs Q&A agent that answers questions about LangChain’s libraries and products. Users may ask conceptual questions, debugging questions, or help building things. These exchanges are often technical and involve a good amount of detail_

[**Fleet**](https://www.langchain.com/langsmith/fleet)

_A no-code tool for creating agents that do real work like writing documents and doing research. Users may use Fleet for a wide variety of tasks. They may invoke many different tools or skills._

We selected a portion of traces from each tracing dataset as training and holdout sets. When filtering from the pool of traces, we selected multi-turn traces because judging “perceived error” requires a human response to the AI results (for example, correcting the assistant or repeating the request).

Part of the motivation for using multiple datasets was to test the generality of “perceived error”. Would a model trained to detect perceived error on one dataset transfer to a second one?

| Dataset | Total Examples | Train rows | Holdout rows |
| --- | --- | --- | --- |
| chat-langchain | 885 | 707 | 178 |
| Fleet | 911 | 727 | 184 |

### Data Preparation

When preparing the data for training and prediction, we made the choice to only include Human and AI messages, ignoring all tool calls. We did this because we hypothesized that for the signals we were looking for the human and AI messages are the main source of information. This is a lever we intend to experiment with in the future.

We also included all messages as is, with no trimming of long content. This is another lever we intend to experiment with in the future.

### Labels

To generate labels, we used a mix of model-assisted labeling plus human review to create short JSON labels and rationales for each trace. Specifically, we first asked a panel of models to judge a trace. If they all agreed, we took that as a ground truth label. If they disagreed, we then took all their labels and rationales and passed them to another panel of models, asking them to judge who was right. If that panel agreed, we took that as ground truth. If they still disagreed, we human annotated them manually. Over the dataset, chat-langchain and Fleet had 24% and 18% of traces with a perceived error label respectively.

## Fine-tuning setup

For training, we chose a `Qwen-3.5-35B` as our base model after running a few small scale experiments on testing other models. Much smaller models had high error rates and weren’t strong enough to reason over our multi-turn traces. With `Qwen-3.5-35B` , we had a strong, cheap open model with room to hit frontier performance via fine-tuning.

We trained only on data from the chat-langchain dataset. The reason for only training on data from one dataset was to allow us to test whether it would transfer to a completely different domain.

We also lightly optimized the input prompt after observing common failure modes from small-scale experiments on the base model. For training, we used [managed SFT training on Fireworks with LoRA](https://docs.fireworks.ai/fine-tuning/supervised-fine-tuning).

## Experiments & results

We organized experiments around three questions:

1.   Does fine-tuning improve baseline judge quality up to frontier model performance?
2.   Does a learned judge transfer across datasets?
3.   Is serving a fine-tuned model cost-effective?

**Fine-tuning open models can exceed or match frontier models**

![Image 1](https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/6a302f471ecb5b6b83808987_finetuning-lift-chart_dark%202.png)

| Model | chat-langchain accuracy | Fleet accuracy |
| --- | --- | --- |
| Base Qwen | 90.5% | 83.2% |
| Chat-langchain SFT | 96.1% | 90.8% |
| Fleet SFT | 92.7% | 91.3% |
| Claude Opus | 91.6% | 90.2% |
| GPT-5.5 | 98.9% | 89.1% |

We found that base Qwen with good prompting was a strong out of the box model for perceived error classification, but trailed frontier model classification accuracy. On both datasets, running a LoRA SFT job lifted the base model to be close to or above frontier performance.

In addition to benchmarking against frontier models, we also compared to smaller, cheaper models. A common strategy for running high-volume, low cost inference workloads is using the smallest closed frontier model such as Haiku. But we consistently found that strong open models outperformed Haiku out of the box, while being much cheaper to run.

### A fine-tuned judge transfers well to unseen data

![Image 2](https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/6a3036a1d7442921304a131f_A%20chat-langchain%20judge%20transfers%20to%20Fleet%20(1).png)

Our initial results showed that Fleet was a more challenging dataset for all models. After fine-tuning on chat-langchain, we tested how well this model transferred to Fleet data without any Fleet specific training. The model trained on chat-langchain data outperformed all frontier models on Fleet data.

We then experimented with training a model specifically on Fleet data. This resulted in a small improvement over our chat-langchain SFT’d model.

This is an important result because:

1.   It shows that our perceived error model is able to transfer to other domains and still maintain performance at frontier levels (in this case, slightly above).
2.   For builders who want to push the performance on perceived error (or other finetuned judges) on their own datasets even further, they have the option to fine-tune on application specific traces for some further performance gain.

### Fine-tuned models are much cheaper to run

![Image 3](https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/6a302f7a797316bb69213ed3_cost-quality-frontier_dark%201.png)

Fine-tuned models match frontier accuracy and are much cheaper to run at scale - 10-100x depending on trace volume and model choice. As trace volumes grow, the cost savings from a fine-tuned model continue to grow. And on performance, the fine-tuned Qwen model outperforms all model sizes Haiku, Sonnet, and Opus (and gpt-5.5).

## Future research on trace understanding

Solving Continual Learning will involve tackling large-scale data mining problems around trace understanding. In general, we’re excited to push forward recipes around building specialized, cost-effective models to better understand traces.

[Open models have crossed an intelligence threshold](https://www.langchain.com/blog/open-models-have-crossed-a-threshold) and are now strong out-of-the-box cost-effective classifiers for many tasks. With easy to use training & inference infrastructure from Fireworks, we’re able to push open models towards frontier performance while being orders of magnitude cheaper to run.

Future research directions include helping teams design good training objectives & rubrics to build their own evaluator models for their agent traces. The more we understand our agent traces, the better informed we can be when making changes to improve agents.

## Try our perceived error model

We will be rolling out our fine-tuned perceived error model to a select number of customers over the next few weeks before a broader rollout in a month or two. If you are interested in testing this perceived error judge and providing feedback, please sign up [here](https://airtable.com/appWdRBlSecNOgErA/pagAEfUlHu4F35opm/form)

‍
