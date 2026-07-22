---
title: "Scaling Laws, Carefully"
source_url: "https://lilianweng.github.io/posts/2026-06-24-scaling-laws/"
ingested: 2026-06-26
type: article
created: 2026-06-26
sha256: 2ae874711e7fe8fc717e6b5ac4a328817c706a126e86675168846592ba83d383
---

# Scaling Laws, Carefully


Published Time: 2026-06-24T00:00:00Z

Markdown Content:
Scaling laws are one of the most critical empirical findings in deep learning. The observation is simple in form: the training loss decreases predictably as we scale up model size , dataset size , and compute , following a power-law curve, which appears as a straight line on a log-log plot. We can view scaling laws as a framework for describing the relationship between compute, loss, model size and data; at its core, it is about how to allocate precious compute optimally between and .

This predictability makes scaling laws highly valuable in practice. A common workflow is to fit scaling laws on a handful of small runs and then extrapolate to estimate the token and compute requirements for larger models.

| Symbol | Note |
| --- | --- |
| $N$ | Model size, measured in parameter count. |
| $D$ | Training dataset size, usually measured in token count. |
| $C$ | Training compute in FLOPs. As a useful approximation, $C \approx 6 N D$ ([Kaplan et al. 2020](https://arxiv.org/abs/2001.08361)), where $2 N D$ accounts for the forward pass and $4 N D$ for backpropagation. |
| $E$ | Irreducible loss |
| $L , \hat{L} \left(\right. . \left.\right)$ | Test loss / test loss prediction function; can also refer to training loss, since they are strongly correlated. |
| $\epsilon$ | Generalization error. |

## Early days: ML loss predictability

The predictability of generalization error with scale had already been investigated before scaling laws became a mainstream concept.

[Amari et al. (1992)](https://ieeexplore.ieee.org/document/6796972) derived four types of learning curves using a Bayesian approach and the annealed approximation.

1.   Deterministic learning algorithm, noiseless data, one unique solution: , where is some constant.
2.   Deterministic learning algorithm, noiseless data, multiple equivalent solutions: ; the learning is faster with each new data point, because the model only learns the optimal manifold of parameters, instead of finding the single solution point.
3.   Deterministic learning algorithm, noisy data: ; noises in data make learning harder.
4.   Stochastic learning algorithm, noisy data: ; here the irreducible loss is the residual error that a stochastic learner cannot reduce further, for example when the model runs out of capacity on large data. All four types of learning curves follow a power law:

where can be 0 and . Although their theoretical setup is based on a simplified binary classification task, it points in a useful direction for building empirical ML loss prediction models.

One of the earliest empirical studies by [Hestness et al. (2017)](https://arxiv.org/abs/1712.00409) explained the relationship between generalization error, model size and data. For a given training data size, they identified the best-fit model size via grid search and then plotted loss against training dataset size. Across four different domains in deep learning (neural machine translation, image classification, language modeling, and speech recognition), a recurring pattern was observed where:

*   Generalization error scales as a power law across a set of factors (e.g. data size).
*   Model improvements shift the error curve but do not seem to affect the power-law exponent.
*   Interestingly, architecture changes the offset () of the power-law fit but does not change the exponent (). The slope of the power law appears to be a property of the problem domain rather than the model architecture.
*   The number of model parameters needed to fit a dataset of size also scales as a power law.

![Image 1](http://lilianweng.github.io/posts/2026-06-24-scaling-laws/hestness-1.png)

Learning curves for (Left) Deep-Speech-2 (DS2) and attention speech model and for (Right) DS2 models of various sizes. The losses of small models plateau when training data becomes large. (Image source: Hestness et al. 2017)

A conceptual illustration breaks the learning curve into three stages. In the small-data region, when there are not enough learning signals, the model performs only slightly better than random guessing. In the middle (“power-law region”), we observe a power-law relationship between loss, data, and model size. The final irreducible-error region can be attributed to factors such as noise in the data.

![Image 2](http://lilianweng.github.io/posts/2026-06-24-scaling-laws/hestness-2.png)

Illustration of power-law learning curve phases. (Image source: Hestness et al. 2017)

[Rosenfeld et al. (2020)](https://arxiv.org/abs/1909.12673) pushed this further by trying to model error as a joint function of both model size and data size , across a diverse set of architectures (ResNet, WRN, LSTM, Transformer) and optimizers (Adam, SGD variants). Empirically they observed that, holding one axis fixed, the error decays as a power law in the other:

which can be combined into a joint form:

where are scalar constants and is not dependent on either or .

![Image 3](http://lilianweng.github.io/posts/2026-06-24-scaling-laws/rosenfeld-1.png)

A 3D contour plot of data size, model size and generalization error in log-log-log scale. Blue dots are derived from empirical experiments and the surface is a linear interpolation between blue dots. (Image source: Rosenfeld et al. 2020)

Thus, they can build a prediction model in the form of a simple parametric function with to predict the expected loss for > certain thresholds by only training on a set of smaller training configs, < certain thresholds.

![Image 4](http://lilianweng.github.io/posts/2026-06-24-scaling-laws/rosenfeld-2.png)

Fitting the parametric error model on small-scale configurations and extrapolating to larger model/data regimes: (a) Illustration of the experiment setup; Experiment results on (b) ImageNet, (c) WikiText-103 and (d) CIFAR100 Error estimation with three architectures (WRN, VGG, DenseNet) and two optimizers (SGD, Adam). (Image source: Rosenfeld et al. 2020)

Side note: These early works lean on classical learning-theory intuition like the [VC dimension](https://en.wikipedia.org/wiki/Vapnik%E2%80%93Chervonenkis_dimension) (the cardinality of the largest set of points a model can shatter) as a proxy for capacity, but in modern deep learning work the VC dimension is often too coarse to explain the behavior and the empirical power laws turned out to be much cleaner and more practical than the worst-case bounds that theory provides.

## Scaling Laws in Data-Infinite Region

## Kaplan et al.’s Scaling Laws

[Kaplan et al. (2020)](https://arxiv.org/abs/2001.08361) popularized the concept of scaling laws in the language modeling community. They found that the cross-entropy test loss scales as a power law with each of model size (excluding embedding layers), dataset size , and training compute across many orders of magnitude. The findings are aligned with early work in the last section, but Kaplan et al. formalized the concept with a focus on Transformer language models and empirical experimentation at a larger scale, with model size ranging from 768M to 1.5B non-embedding parameters and dataset size from 22M to 23B tokens. All training runs in the paper used a learning rate schedule with a 3000 step linear warmup, followed by a cosine decay to zero.

List of key findings:

*   The loss scales as a power law with , , and individually; for optimal performance all three must scale in tandem.
*   Training curves follow predictable power laws whose parameters are roughly independent of model size.
*   Larger models are more sample-efficient, meaning that they reach a given loss with fewer optimization steps and fewer data points than small models.
*   Architectural details (width, aspect ratio, etc.) matter less than sheer scale.
*   Train loss and test loss are positively correlated. (Sounds trivial but this is the foundation for pretraining work. On the other hand, whether pretraining loss improvement transfers to posttraining evaluation needs separate studies.)
*   Given a fixed compute budget, it is more efficient to train a very large model and stop _before convergence_ than to train a smaller model all the way to convergence. **This finding is where the Chinchilla scaling laws (the next section) disagree: Kaplan et al. overestimated the optimal model size as their fitted exponent was larger.**

They summarize the joint dependence on and in a single equation:

A nice consequence of this form is that the extent of overfitting (i.e. model is complex or data is small) depends predominantly on the ratio , which indicates that the data needs to grow in a specific proportion to the growth of the model size to avoid training being data-limited.

![Image 5](http://lilianweng.github.io/posts/2026-06-24-scaling-laws/kaplan-1.png)

Test loss as a power law in compute, dataset size, and parameters, spanning many orders of magnitude. (Image source: Kaplan et al. 2020)

The most influential and, in hindsight, most contested conclusion was the compute-optimal allocation. Kaplan et al. found and concluded that model size should grow faster than dataset size. Concretely, for a 10x increase in compute they suggested scaling the model size by ~5.5x but the training tokens by only ~1.8x. The Chinchilla paper would later overturn this recommendation, arguing that it leaves large models badly _undertrained_.

Another useful analysis in Kaplan et al. approximates the number of training FLOPs needed based on and . Each multiply-add is counted as ~2 FLOPs.

![Image 6](http://lilianweng.github.io/posts/2026-06-24-scaling-laws/kaplan-2.png)

Parameter and compute estimation for different Transformer architectural components, given the number of layers , model width (= ; the notation is inconsistent in the original table), dimension of feed-forward layer (often equivalent to , attention dimension (often equivalent to ), the context length and the vocabulary size . (Image source: Kaplan et al. 2020)

Given a standard config where , and excluding embedding layers from and the per-token forward compute:

Then we count backward-pass FLOPs as twice the forward-pass FLOPs, because backpropagation runs two matrix multiplications, for gradients with respect to the input activations and the weights, respectively. Thus, in total, the training FLOPs per token are approximately , and the total FLOPs for training over tokens are .

## Chinchilla Scaling Laws

The Chinchilla paper ([Hoffmann et al. 2022](https://arxiv.org/abs/2203.15556)) studied the relationship between the optimal model size (total parameters, _including_ embeddings) and the number of tokens under a _fixed_ compute budget with a more careful experimental design and arrived at a somewhat different answer from Kaplan et al..

![Image 7](http://lilianweng.github.io/posts/2026-06-24-scaling-laws/animal.png)

You should know how chinchilla looks 😊 (Image source: ChatGPT generated)

The central question is on the best strategy to allocate resources given a constraint . In other words, when we have only limited FLOPs (a given number of GPUs running for a given period of time), how should we choose between more data tokens and more model parameters?

The Chinchilla paper presented three neatly designed methods for scaling laws fitting.

The empirical experiments scanned over 400 models, with sizes from 70M to over 16B parameters and training tokens from 5B to 500B. The experiments were under the assumption that every training token is unique (the infinite-data regime). All runs used a cosine learning-rate schedule decaying by 10x over the training horizon. Sweeping over model sizes traces out the compute-optimal frontier.

### Method 1: Fix model sizes, vary the token budget

For each parameter count , train several runs with different token budgets, and record the minimal loss achieved per FLOP budget .

![Image 8](http://lilianweng.github.io/posts/2026-06-24-scaling-laws/chinchilla-1.png)

Chinchilla Method 1: training loss curves over FLOP budgets for a sweep of model sizes. (Image source: Hoffmann et al. 2022)

### Method 2: IsoFLOP profiles

Fix a compute budget and plot the final loss against parameter count . Each iso-FLOP curve is roughly a parabola in log-space, and its minimum flags the optimal model size for that compute budget. Then repeating across budgets traces a power-law line in the plot.

![Image 9](http://lilianweng.github.io/posts/2026-06-24-scaling-laws/chinchilla-2.png)

Chinchilla Method 2: IsoFLOP parabolas; the minimum of each curve is the compute-optimal model size for that budget. (Image source: Hoffmann et al. 2022)

### Method 3: Parametric fit

[](http://lilianweng.github.io/posts/2026-06-24-scaling-laws/)Fit the same parametric function as in [Rosenfeld et al. (2020)](https://arxiv.org/abs/1909.12673) directly,

We can actually get a closed form approximation of optimal by minimizing under the constraint .

First let’s reduce the expression to contain only :

When , model size and training tokens should scale at equal rates.

To find the optimal , the Chinchilla paper adopts a [Huber loss](https://en.wikipedia.org/wiki/Huber_loss) (robust to outliers; ) and the [L-BFGS algorithm](https://en.wikipedia.org/wiki/Limited-memory_BFGS) (good for curve fitting with a small number of parameters).

Chinchilla arrives at its answer through three complementary methods whose final results agree with each other, and this is part of why the result was quite convincing.

![Image 10](http://lilianweng.github.io/posts/2026-06-24-scaling-laws/chinchilla-3.png)

The three methods agree on a compute-optimal frontier where , but disagree with Kaplan et al. Note that method 3's results are slightly off from the other two, which we will explain later. (Image source: Hoffmann et al. 2022)

![Image 11](http://lilianweng.github.io/posts/2026-06-24-scaling-laws/chinchilla-4.png)

The plot of the Chinchilla predictions by three different approaches, as well as predictions by Kaplan et al. (2020). All three methods suggest that several mainstream LLMs at the time were undertrained. (Image source: Hoffmann et al. 2022)

The claim in the Chinchilla paper that most large models (at the time, ~2022) were undertrained is supported by a famous demonstration: under the same compute budget as Gopher ([Rae et al. 2021](https://arxiv.org/abs/2112.11446); 280B parameter count, 300B token budget), they trained Chinchilla (70B parameter count, 1.4T token budget), a model 4x smaller but trained on roughly 4x more tokens and it outperformed Gopher across the board.

## Reconciling Kaplan and Chinchilla

The Chinchilla scaling laws disagree with Kaplan et al. as follows:

*   Instead of “grow the model faster than the data” (), for every doubling of model size, you should also double the number of training tokens ().
*   Instead of “train a big model and stop before convergence,” you should train a smaller model on more data.

Both papers still agree on the same underlying principle, but they disagree on where the optimal size-vs-token tradeoff lies. Why do they disagree so much?

**Difference 1: Kaplan et al. experimented mostly on small models.** Kaplan et al. experimented mostly on smaller models, while the Chinchilla paper’s experiments reached more than 10x larger scales. When we extrapolate in log-log space, a small difference in the fit can result in large differences (See [toy simulation](http://lilianweng.github.io/posts/2026-06-24-scaling-laws/#toy-simulation)).

**Difference 2: Embedding parameter count matters for small models.** In the small-parameter regime, embedding parameters are a non-negligible fraction of the total and thus counting them or not matters. [Pearce & Song (2024)](https://arxiv.org/abs/2406.12907) did a thorough analysis along this line. Let’s use to denote model size and compute when embedding is excluded and use to count total parameters.

*   Kaplan et al.: (non-embedding)
*   Chinchilla: (total)

To bridge them, they fit a relationship between total parameters and non-embedding parameters , for some constant :

This form has nice properties of being strictly increasing and (because .

Plugging this into the Chinchilla laws equation,

The relationship between and in the above equation is no longer a clean power law. We can only approximate it locally as , where is a local exponent based on a first-order derivative () rather than a global power-law exponent, resulting in . See the full details of how the exponent is approximated in Appendix A.1 in [Pearce & Song (2024)](https://arxiv.org/abs/2406.12907).

![Image 12](http://lilianweng.github.io/posts/2026-06-24-scaling-laws/pearce-1.png)

Visualization of how the local power-law exponent grows with . (Image source: Pearce & Song 2024)

As shown in the visualization above, as gets larger, converges to the Chinchilla estimate. By generating synthetic training curves using above equation, in the range of model size from 768M to 1.5B (as in Kaplan et al.), they estimated that is close to the Kaplan coefficient of 0.73 in that region.

## Why power law?

Power laws are widely observed across many domains outside AI, such as in [Zipf’s law](https://en.wikipedia.org/wiki/Zipf%27s_law), [scale-free networks](https://en.wikipedia.org/wiki/Scale-free_network), [urban scaling laws](https://en.wikipedia.org/wiki/Urban_scaling), and many other complex systems. The recurring pattern is that large events are rare, small events are common and the relationship between size and frequency often follows a straight line at log-log scale.

**Why do LLM scaling laws also have the shape of a power law?**

Inspired partly by different domains displaying different exponents ([Hestness et al. 2017](https://arxiv.org/abs/1712.00409)), one early explanation by [Sharma & Kaplan (2020)](https://arxiv.org/abs/2004.10802) hypothesizes that language modeling can be viewed as doing regression on a low-dimensional manifold of data. More model parameters can induce a finer partition of the data manifold and therefore smaller generalization error. In the simplest terms, if a model of effective size partitions a -dimensional manifold into regions, the typical linear resolution scales like . This has a similar power-law form to the scaling laws above. This theory applies most cleanly in the infinite-data, underfitting regime, but in reality estimating the intrinsic dimension of a data manifold is quite hard.

A later hypothesis ([Michaud et al. 2023](https://arxiv.org/abs/2303.13506), [Brill 2024](https://arxiv.org/abs/2412.07942)) assumes that knowledge or skills are learned in discrete chunks (“quantized”) and that the frequency distribution of these skills follows a power law. The model learns common skills first and rare skills later, resulting in a smooth power-law decay in loss.

I only listed two hypotheses here, but there are more studies on explaining the shape of power-law scaling through spectral tails of data, kernel eigenvalues, natural-language statistics, or phase transitions in training dynamics.

## Scaling Laws in Data-Limited Region

Classic scaling laws assume effectively _unlimited unique data_, no repetition, and no multi-epoch training. As the model size grows significantly, we are running out of enough high-quality unique tokens. In fact, some arguments about how long scaling in AI can continue are centered on whether we are hitting a “data wall”.

It is also worth emphasizing that the dataset behind is expected to be already cleaned. The pretraining data pipeline is often a large part of an effective pretraining pipeline, with common steps like deduplication (exact and fuzzy), quality filtering, boilerplate removal, safety filtering, PII/copyright masking, benchmark decontamination and careful reweighting of data mix components based on language, quality, content type, etc. Even when two datasets contain the same token count , a high-quality dataset and a dataset of Internet slop can yield drastically different compute efficiency.

The study by [Hernandez et al. (2022)](https://arxiv.org/abs/2205.10487) focused on a controlled version: a mostly-unique dataset with a small fraction of repeated data. Starting from a large dataset, the data mix keeps 90% non-repeated but replaces the remaining 10% with repeats of a tiny portion of the original. By training a Transformer model for 100B tokens, they observed a double-descent phenomenon, that is, the test loss can actually get _worse_ and then better again as a function of how much the repeated data is emphasized, an effect that becomes more pronounced as the repeated fraction grows.

![Image 13](http://lilianweng.github.io/posts/2026-06-24-scaling-laws/hernandez-1.png)

Double-descent in the test loss as the repeated fraction increases (90% repeated on the left, 50% on the right). (Image source: Hernandez et al. 2022)

The flat or increasing trend in the middle of training is possibly due to memorization of repeated data. Learning curves with such shapes make scaling law fitting less accurate. They also concluded repeated data hurts some OOD evaluation and downstream fine-tuning. However, their data mix is constructed in a more lab-like setup, and repetition in real-world data is often more nuanced (e.g. different data has different levels of repetition, semantic repetition, etc.).

Rather than saying data repetition hurts training, we are more interested in how to fit scaling laws, given that the unique high-quality data is not infinite and we likely have to repeat data during training.

[Muennighoff et al. (2023)](https://arxiv.org/abs/2305.16264) took on the research question of how compute should be allocated optimally when model training is data-constrained. Specifically, they empirically studied the impact of data repetition across roughly 400 experiments, 10M–9B parameters, data sizes up to 900B tokens, and up to 1500 epochs. The exact same dataset is repeated each epoch, shuffled between epochs, and evaluated on a held-out test set.

The key modeling adjustment is to decompose the total token count into two parts: (i) the number of unique tokens and (ii) the number of repeats (i.e. num. epochs - 1). Thus we have . With a unique-data budget , by definition and . They use the Chinchilla scaling laws to find the optimal model size for fitting , and define excess model size via repeats .

They then update the Chinchilla parametric fit ([method 3](http://lilianweng.github.io/posts/2026-06-24-scaling-laws/#chinchilla-method3)) to use effective (discounted) data and model size in place of the raw quantities:

The intuition is that a token’s value decays _exponentially_ as it is repeated. In their modeling, each repetition costs the token a fraction of its remaining value, where is a learnable “half-life” parameter. When or , we recover .

A symmetric formulation handles excess model size, , capturing the idea that “larger models overfit more quickly on repeated data” and that “a model can be too large for its dataset.” This component is less intuitive, and I could not find a satisfactory explanation for why model size needs to appear in such a symmetric form as repeated data. Later work by [Lovelace et al. (2026)](https://arxiv.org/abs/2605.01640) changed this assumption.

Their empirical fit finds that _excess parameters decay faster in value than repeated data_, , so we should allocate more resources on more epochs rather than more model parameters. One weakness of this modeling, as the authors also pointed out, is that it significantly underestimates the final test loss of failing models (i.e. models whose loss increases midway through training), such as models trained for 44 epochs.

![Image 14](http://lilianweng.github.io/posts/2026-06-24-scaling-laws/muennighoff-1.png)

Data-constrained scaling under repetition captures the experimental results better than data-unaware fitting; the value of repeated tokens decays exponentially toward a ceiling. The fitting gets worse with more epochs as high repetition causes the test loss to increase midway through training, not depicted in the plot. (Image source: Muennighoff et al. 2023)

Most recently, [Lovelace et al. (2026)](https://arxiv.org/abs/2605.01640) revisited the same problem with a different approach. Rather than modeling overparameterization as a diminishing return on effective model size, Lovelace et al. model the interaction between model size data repetition explicitly. Empirically, they trained about 300 models, spanning 15M to 1B parameters and 50M to 6B unique tokens.

When they plot the fit residual for a fixed model size across a range of data-repetition levels, the observation is intuitive: more epochs cause more damage, and interestingly _larger models are more sensitive_ to repetition. This hints that the loss penalty is likely a function of both model size and data size.

![Image 15](http://lilianweng.github.io/posts/2026-06-24-scaling-laws/lovelace-1.png)

Residuals of the effective-size fit reveal that overfitting damage grows with both the number of epochs and the model size. (Image source: Lovelace et al. 2026)

An explicit overfitting penalty term was introduced and built around the _capacity ratio_ (parameter count relative to unique tokens):

where:

*    is the repetition count;
*   the scalar is a learnable parameter;
*   the exponent (the 2nd learnable parameter) lets the penalty scale nonlinearly with the capacity ratio ;
*   the separate exponent (the 3rd learnable parameter) on the repetition count decouples repetition nonlinearity from .

The added term (in red) is a direct overfitting penalty that grows with both how many times you repeat the data and how over-parameterized the model is relative to the unique data available.

They also did a case study on how weight decay impacts training with the limited-data constraint and found that strong weight decay reduces the overfitting penalty caused by data repetition.

![Image 16](http://lilianweng.github.io/posts/2026-06-24-scaling-laws/lovelace-2.png)

Strong weight decay reduces the overfitting penalty from data repetition. (Image source: Lovelace et al. 2026)

Both modeling approaches by Muennighoff et al. and Lovelace et al. are constructed from empirical curve fitting, so it is still unclear why data-constrained scaling laws should have exactly these forms and why each free parameter is needed. Curious about more theoretical work along this line.

## Trickiness of Fitting Scaling Laws in Reality

Despite its clean form, in practice, scaling law fitting can be surprisingly sensitive to seemingly trivial procedural choices, like how you count parameters, how you round the precision, how you sum or average the loss, etc.

Because a scaling law is only fit on the (relatively small, relatively cheap) models that we can afford to train, and the prediction is _extrapolated_ for a model orders of magnitude larger. In such a setup, choices that look like rounding error may lead to wild differences in prediction.

Meanwhile, scaling-law fitting assumes the only changing factor is _scale_, which means that the model architecture, optimizer, learning rate schedule, batch ramp, data mix, tokenizer, and other design choices should remain the same. Another underlying assumption is that all these settings should have been carefully tuned, as cases like undertrained models can lead to a different conclusion.

The disagreement between results by Kaplan et al. and Chinchilla is one example to showcase the trickiness of scaling laws fitting.

[](http://lilianweng.github.io/posts/2026-06-24-scaling-laws/)A second example is a follow-up analysis investigating why Chinchilla [method 3](http://lilianweng.github.io/posts/2026-06-24-scaling-laws/#method-3-parametric-fit) is slightly off from the other two methods. [Besiroglu et al. (2024)](https://arxiv.org/abs/2404.10102) extracted the raw data points from Figure 4 of Hoffmann et al. (2022) and re-ran the method 3 parametric fitting. They found a couple of concrete issues:

*   A high loss scale in the L-BFGS-B minimizer, caused by averaging Huber-loss values over examples instead of summing them, which led to premature termination of the optimization. The early stopping of loss minimization during both the original fit and bootstrapping produced inconsistent estimates and implausibly narrow confidence intervals.
*   The reported and were rounded to 2 digits of precision, which made the derived look more off than they really were.

## Toy simulation

Here is a toy simulation widget, created by ChatGPT, designed to demonstrate three specific failure modes.

We assume the ground truth function is:

and thus . This is the estimate from [Besiroglu et al. (2024)](https://arxiv.org/abs/2404.10102).

The simulation plots the loss prediction vs dataset size , while providing a set of sliders to show case:

*   Loss precision: rounding losses from high to low decimal points can change the fitted parameter values.
*   Loss noise: perturbing loss values by only a multiplier of milli-loss (0.001) units leads to different fit.
*   Fit-region sensitivity: fitting only small models, only medium models, or all models gives different apparent scaling laws.

## Citation

Please cite this work as:

```
Weng, Lilian. "Scaling Laws, Carefully". Lil'Log (Jun 2026). https://lilianweng.github.io/posts/2026-06-24-scaling-laws/
```

Or use the BibTex citation:

```
@article{weng2026scaling,
 title = {Scaling Laws, Carefully},
 author = {Weng, Lilian},
 journal = {lilianweng.github.io},
 year = {2026},
 month = {June},
 url = "https://lilianweng.github.io/posts/2026-06-24-scaling-laws/"
}
```

## References

[1] S. Amari, N. Fujita, and S. Shinomoto. [“Four Types of Learning Curves. Neural Computation.”](https://ieeexplore.ieee.org/document/6796972) 4(4):605–618, 1992.

[2] Hestness et al. [“Deep Learning Scaling is Predictable, Empirically.”](https://arxiv.org/abs/1712.00409) arXiv preprint arXiv:1712.00409, 2017.

[3] Rosenfeld et al. [“A Constructive Prediction of the Generalization Error Across Scales.”](https://arxiv.org/abs/1909.12673) ICLR 2020.

[4] Kaplan et al. [“Scaling Laws for Neural Language Models.”](https://arxiv.org/abs/2001.08361) arXiv preprint arXiv:2001.08361, 2020.

[5] Hoffmann et al. [“Training Compute-Optimal Large Language Models.”](https://arxiv.org/abs/2203.15556) NeurIPS 2022.

[6] Pearce and Song. [“Reconciling Kaplan and Chinchilla Scaling Laws.”](https://arxiv.org/abs/2406.12907) TMLR 2024.

[7] Bahri et al. [“Explaining Neural Scaling Laws.”](https://arxiv.org/abs/2102.06701) arXiv preprint arXiv:2102.06701, 2021.

[8] Sharma and Kaplan. [“A Neural Scaling Law from the Dimension of the Data Manifold.”](https://arxiv.org/abs/2004.10802) arXiv preprint arXiv:2004.10802, 2020.

[9] Hernandez et al. [“Scaling Laws and Interpretability of Learning from Repeated Data.”](https://arxiv.org/abs/2205.10487) arXiv preprint arXiv:2205.10487, 2022.

[10] Muennighoff et al. [“Scaling Data-Constrained Language Models.”](https://arxiv.org/abs/2305.16264) NeurIPS 2023.

[11] Lovelace et al. [“Prescriptive Scaling Laws for Data Constrained Training.”](https://arxiv.org/abs/2605.01640) arXiv preprint arXiv:2605.01640, 2026.

[12] Besiroglu et al. [“Chinchilla Scaling: A Replication Attempt.”](https://arxiv.org/abs/2404.10102) arXiv preprint arXiv:2404.10102, 2024.

[13] Michaud et al. [“The Quantization Model of Neural Scaling”](https://arxiv.org/abs/2303.13506) NeurIPS 2023.

[14] Brill. [“Neural Scaling Laws Rooted in the Data Distribution.”](https://arxiv.org/abs/2412.07942) arXiv preprint arXiv:2412.07942, 2024.

[15] Rae et al. [“Scaling Language Models: Methods, Analysis & Insights from Training Gopher.”](https://arxiv.org/abs/2112.11446) arXiv preprint arXiv:2112.11446, 2021.

