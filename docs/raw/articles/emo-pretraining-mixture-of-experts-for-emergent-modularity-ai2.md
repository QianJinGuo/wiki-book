---
source: newsletter
source_url: https://allenai.org/blog/emo
ingested: 2026-05-12
sha256: fd88f39d83f66e9f1d936574878daf026db3334868bc49aa1a2a3cdf7dad8fad
---
Title: EMO: Pretraining mixture of experts for emergent modularity  | Ai2
URL Source: https://allenai.org/blog/emo
Markdown Content:
# EMO: Pretraining mixture of experts for emergent modularity | Ai2
[Skip to main content ->](https://allenai.org/blog/emo#main-content)
[Ai2](https://allenai.org/)
*   Open models
### Open models
    *   [Olmo](https://allenai.org/olmo)
    *   [Tülu 3](https://allenai.org/tulu)
    *   [Molmo](https://allenai.org/molmo)
    *   [Playground](https://playground.allenai.org/)
    *   [Language models](https://allenai.org/language-models)
    *   [Multimodal models](https://allenai.org/multimodal-models)
    *   [Evaluation frameworks](https://allenai.org/evaluation-frameworks)
    *   [Open data](https://allenai.org/open-data)
![Image 1](blob:http://localhost/550cf32d3c959e8af216e740ba4c560a)![Image 2](blob:http://localhost/d82bccf2c4124736af17a7cdaf9117ab)
*   Applications
![Image 4](blob:http://localhost/550cf32d3c959e8af216e740ba4c560a)![Image 5](blob:http://localhost/72df22329faf7d837d2420448e49799a)  
### AI for science
    *   [Asta](https://allenai.org/asta)
    *   [AstaBench](https://allenai.org/asta/bench)
    *   [Research with Asta](https://asta.allen.ai/)
    *   [Asta leaderboards](https://allenai.org/asta/leaderboard)
    *   [Semantic Scholar](https://www.semanticscholar.org/)
    *   [All projects](https://allenai.org/ai-for-science)
### AI for the planet
    *   [OlmoEarth](https://allenai.org/olmoearth)
    *   [EarthRanger](https://allenai.org/earthranger)
    *   [Skylight](https://allenai.org/skylight)
    *   [Climate Modeling](https://allenai.org/climate-modeling)
    *   [All projects](https://allenai.org/ai-for-the-environment)
### AI for robotics
    *   [Embodied AI](https://allenai.org/embodied-ai)
*   Research
### Research
    *   [Latest](https://allenai.org/research)
    *   [Papers](https://allenai.org/papers)
    *   [Research principles](https://allenai.org/research-principles)
*   [News](https://allenai.org/news)
*   Institute
### Institute
    *   [About](https://allenai.org/about)
    *   [Careers](https://allenai.org/careers)
    *   [Media center](https://allenai.org/media-center)
Navigation Menu
# EMO: Pretraining mixture of experts for emergent modularity
May 8, 2026
Ai2
Share
* * *
[Models](https://huggingface.co/collections/allenai/emo)[Tech Report](https://allenai.org/papers/emo)[Code](https://github.com/allenai/EMO)[Visualization](https://emovisualization.netlify.app/)
Today we're releasing [**EMO**](https://huggingface.co/allenai/EMO), a new mixture-of-experts (MoE) model pretrained end-to-end so that modular structure emerges directly from the data without relying on human-defined priors. EMO lets you use a small subset of its experts – just 12.5% of the total – for a given task while keeping near full-model performance, and still works as a strong general-purpose model when all experts are used together.
Large language models are typically trained and deployed as monolithic systems: a single model is initialized, pretrained, fine-tuned, and served as one unified entity. But applications often need only a subset of capabilities—such as code generation, mathematical reasoning, or domain-specific knowledge. As frontier language models routinely reach trillions of parameters, using and adapting the full model becomes impractical for most users and incurs unnecessary computational cost and memory to host parameters that may not even be needed.
Mixture-of-experts (MoE) models seem like a natural way to relax this constraint. Instead of using one large feedforward network at each layer, MoEs contain many smaller ones, called experts, and activate only a small subset for each input token. In principle, a task that only needs one capability could load only the relevant experts.
In practice, however, existing MoEs still need the full model to work well. Even within a single input, different tokens often activate different experts, so a task can end up using all the experts during its generation. As we show in our paper, this happens partly because experts in standard MoEs often specialize in low-level lexical patterns like prepositions or punctuation rather than higher-level domains or capabilities. As a result, small subsets of experts are not reliably usable on their own.
We instead want MoE models whose experts organize into coherent groups that can be selectively used and composed.
One way to encourage this during pretraining is to route tokens to experts based on predefined semantic domains, such as math, biology, or code. Prior work like BTX and our FlexOlmo project has tried this. However, predefined domains come with important limitations. They require domain labels across the pretraining corpus, which can be ambiguous and expensive to obtain, and they may inject too much human bias into how the model is allowed to organize itself. More importantly, fixing the domains upfront also fixes the model’s modular structure: if a new domain or capability emerges at inference time, it isn’t obvious which experts should be used.
That’s where EMO comes in.
We show that EMO – a 1B-active, 14B-total-parameter (8-expert active, 128-expert total) MoE trained on 1 trillion tokens – supports selective expert use: for a given task or domain, we can use only a small subset of experts (just 12.5% of total experts) while retaining near full-model performance. At the same time, when all experts are used together, EMO remains a strong general-purpose model. In contrast, a standard MoE of equal architecture trained on the same data shows severe degradation when selectively using its expert subsets.
![Image 7](blob:http://localhost/ed6d29130312919a900bcd86ec1dbe8b)![Image 8](blob:http://localhost/35746b595f6c946d203de0e5b17f4b6c)
EMO is an MoE trained with modularity as a first-class objective. For a given domain (e.g., math, code, biomedical), users can select a small subset of experts of any size and retain near full-model performance. This turns a single model into a composable architecture, enabling flexible deployment with improved memory-accuracy tradeoffs for large, sparse MoEs.
### **How do we get modularity to emerge?**
In an MoE, a small network called the router decides which experts each token activates. We want the router to learn that tokens from similar domains should activate similar subsets of experts. Our key observation is that _tokens from the same document usually come from the same domain_. We therefore use document boundaries as a weak supervisory signal: during training, all tokens in a document are restricted to choose their active experts from a shared expert pool.
![Image 10](blob:http://localhost/1ba936f99e615339ccde1fa79ec54c14)![Image 11](blob:http://localhost/e6639b9d6166b807218d6f87ea31bbbc)
Comparison of training of a standard MoE and EMO (k = 2, n = 10, shared experts omitted for simplicity). (Left) In a standard MoE, each token independently selects its top-k experts. Across tokens, all experts are used (Right). In EMO, the router first selects a subset of experts for each document, and all tokens are constrained to route within this subset. This enforces consistent expert usage across the document, encouraging groups of experts to form domain specialization.
For example, in an MoE with 10 total experts and 2 active experts per token, all tokens in a document are restricted to route within the same pool of 4 experts, as shown in the figure above. This pool is chosen by the router itself: we average the router’s expert preferences across all tokens in the document, then select the most-used experts as the document’s shared pool. Different documents can use different pools, allowing recurring expert groups to emerge directly from the training data.
There are a few considerations when implementing the system:
**Load balancing.** One technical challenge is load balancing. In standard MoE training, the load-balancing objective is used to prevent the model from collapsing onto only a small number of experts. At first glance, this seems to conflict with EMO’s training objective: we are explicitly restricting each document to use only a subset of experts.
The conflict comes from the scale at which load balancing is usually applied. In many MoE implementations, load balancing is computed locally, often within a micro-batch containing only a small number of documents. This local objective can push tokens within the same document to spread across many experts, directly opposing EMO’s objective of keeping expert usage consistent within a document.
To resolve this, we apply load balancing globally across many documents. At this larger scale, the two objectives become complementary: EMO encourages tokens within the same document to use a coherent expert pool, while global load balancing encourages different documents to collectively cover all experts. In practice, we found that global load-balancing is important for stable training.
**Document pool size**: The document pool size controls how restrictive the modularity constraint is. A smaller pool forces tokens in the same document to share a tighter set of experts, encouraging stronger modularity; a larger pool gives the model more flexibility but weakens the constraint.
Rather than fixing one pool size, we randomly sample it during training. This prevents EMO from overfitting to a single subset size and lets it support different expert subset sizes at inference time.
### **Benchmark results**
On general-purpose benchmarks, EMO matches the performance of a standard MoE model, showing that the modularity objective does not come at the cost of full-model performance. The more important question, however, is whether the model can still work when we only keep a subset of experts. In this setting, we construct task-specific expert subsets by ranking experts according to their routing usage on a small amount of task validation data, keeping the most-used experts and discarding the rest.
The figure below shows that EMO remains robust under selective expert use. When we keep only 25% of the experts (32 expert subset), EMO loses only about 1% absolute performance across all benchmarks; even when we keep only 12.5% of the experts (16 expert subset), the overall drop is only about 3%. This holds both before and after fine-tuning. In contrast, the matching standard MoE degrades sharply as the expert subset gets smaller, often falling close to or below random performance in the smallest expert subset settings.
![Image 13](blob:http://localhost/4a16ee0cb20403c029b07cd1f7aeca95)![Image 14](blob:http://localhost/bc2676d7a77b61fe738b1d75f48f5794)
![Image 16](blob:http://localhost/65e690b16358c557ca8ea70c8e2bb598)![Image 17](blob:http://localhost/2fcd3f7332c1bf53229f0a99b22a3a18)
![Image 19](blob:http://localhost/6f296f7939d5cd26492a4d19c86ab859)![Image 20](blob:http://localhost/40731b7b0d3ec10e0b5185634bba523e)
Furthermore, we show that selecting the right experts for a task is surprisingly cheap—a single example with few-shot demonstrations is enough to identify a module that performs on par with one selected using a full validation set. And EMO isn't tied to any particular selection method: it works well with existing expert-pruning approaches like Easy-EP, and the two complement each other.
![Image 22](blob:http://localhost/cf29b86befcfe5c2d3755a0d25599d22)![Image 23](blob:http://localhost/8c9d8dd65ec1066c1b0c86ef53cbc57c)
Smaller 130B-token setting. Averaged performance over 16 MMLU categories across different memory budgets. EMO expert subsets push the Pareto frontier in memory-accuracy trade-off, outperforming standard MoEs and even fixed-budget models trained from scratch.
### **What are expert subsets specializing to?**
To see what EMO actually learned after training, we clustered router activations of the first 100 tokens across 12K pretraining documents. The difference from a standard MoE is stark.
EMO's token clusters correspond to things like _Health, Medical & Wellness_, _News Reporting_, US _Politics & Elections_, and _Film & Music_. A standard MoE produces clusters like _Prepositions_, _Proper Names_, _Copula Verbs_, or _Definite Articles_. In EMO, tokens from a given document mostly land in the same cluster; in a standard MoE, they end up scattered across many.
The contrast is easiest to see on a single example. Take a health article—in EMO, almost every token would route into the _Health, Medical & Wellness_ cluster. In a standard MoE, the top cluster is _Possessives & Definite Articles_; the model would group the article with every other text that happens to use the word _the_ or _your_, regardless of what that text is about.
![Image 25](blob:http://localhost/bcbc7c0249955601c0f0c8d1595c8dfc)![Image 26](blob:http://localhost/9c214d9922ff101d55053f1053cb51b0)
Token Clusters of pretraining data on MoEs trained on 1T tokens. EMO clusters correspond to semantically meaningful domains, with tokens from the same document largely grouped together. Standard MoE training produces clusters of surface-level or syntactic features, with document tokens dispersed across multiple clusters.
Because EMO forms modules that map to semantic domains rather than surface features, you can pick a small expert subset and still have a functioning model—the group corresponds to a real capability.
You can play around with the clustering results yourself in [our interactive visualization](https://emovisualization.netlify.app/).
### **What we're releasing**
We’re releasing the [full EMO-trained model](https://huggingface.co/collections/allenai/emo), a matched standard-MoE baseline trained on the same data, and the [training code](https://github.com/allenai/EMO). We hope these artifacts are useful for other groups studying emergent modularity in MoEs.
There’s more work to do. EMO is an early step toward making large sparse models more modular, but many questions remain: how to better select and compose expert subsets, how to update modules without disrupting the full model, and how to use modular structure for better interpretability and control. Releasing these models should help the community to study these questions and build toward modular language models that are easier to deploy, adapt, inspect, and compose.
## Subscribe to receive monthly updates about the latest Ai2 news.
First Name 
Last Name 
Email 
Sign up
**Contact us**
Questions about our work, or need support with one of our technologies?
[Get in touch](https://allenai.org/contact)
**Resources**
*   [Media center](https://allenai.org/media-center)
*   [Documentation](https://docs.allenai.org/)
*   [Careers](https://allenai.org/careers)
*   [Team directory](https://allenai.org/team)
**Community**
*   [Discord](https://discord.gg/ai2)
*   [Reddit](https://www.reddit.com/r/allenai/)
*   [X/Twitter](https://x.com/allen_ai)
*   [GitHub](https://github.com/allenai)
*   [Hugging Face](https://huggingface.co/allenai)
*   [LinkedIn](https://www.linkedin.com/company/allen-ai/)
*   [Bluesky](https://bsky.app/profile/ai2.bsky.social)
**Legal**
*   [Terms of use](https://allenai.org/terms)
*   [Privacy policy](https://allenai.org/privacy-policy)
*   [DMCA policy](https://allenai.org/dmca-policy)
*   [Business code of conduct](https://allenai.org/business-code-of-conduct)
*   [Responsible use](https://allenai.org/responsible-use)
© The Allen Institute for Artificial Intelligence - All Rights Reserved.