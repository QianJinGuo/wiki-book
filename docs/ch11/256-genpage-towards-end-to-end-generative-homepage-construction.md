# GenPage: Towards End-to-End Generative Homepage Construction at Netflix

## Ch11.256 GenPage: Towards End-to-End Generative Homepage Construction at Netflix

> 📊 Level ⭐⭐ | 3.5KB | `entities/genpage-towards-end-to-end-generative-homepage-construction-.md`

# GenPage: Towards End-to-End Generative Homepage Construction at Netflix

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/genpage-towards-end-to-end-generative-homepage-construction-.md)

# GenPage: Towards End-to-End Generative Homepage Construction at Netflix

Authors: [Lequn Wang](<https://www.linkedin.com/in/lequn-luke-wang-9226b2129/>), J[iangwei Pan](<https://www.linkedin.com/in/jiangwei-pan-66a62a13/>), and [Linas Baltrunas](<https://www.linkedin.com/in/linasbaltrunas/>)

**Figure 1.** Autoregressive homepage generation. GenPage builds a Netflix homepage one row or entity at a time, each one conditioned on what’s already on the page and the user’s context.

### Introduction

The Netflix homepage is the first thing users see when they open the app and the primary way they discover content to enjoy. Almost every part of it is personalized, including which rows appear, which entities show up within those rows, and how everything is arranged on the page.

Constructing that homepage is a genuinely hard problem. It is not simply producing one ranked list. The homepage is a structured, two-dimensional layout, made up of recommendation rows and the entities within them. Here, an entity can be a movie, show, game, live event, or other recommendable item. Each choice can affect the value of the others. Traditionally, it is built through a complex, multi-stage pipeline, with separate components for candidate generation and ranking at both the row and entity levels.

We saw an opportunity to rethink this design. Large language models have shown that a single generative model can perform diverse tasks just by generating a response to a prompt. Inspired by this prompt-response paradigm, we trained a single generative model to build the homepage by directly answering one question:

> Given everything we know about this user and this request, what homepage should we generate to maximize user satisfaction?

We call this approach GenPage. It treats the user history and request context as the prompt, and autoregressively generates the entire homepage as the response (Figure 1). Unlike most generative recommenders, such as[ TIGER](<https://arxiv.org/abs/2305.05065>),[ HSTU](<https://arxiv.org/abs/2402.17152>), and[ OneRec](<https://arxiv.org/abs/2506.13695>), which generate flat ranked lists, GenPage generates the rows, entities, and layout together.

This shift is motivated by several goals:

  * **End-to-end modeling.** A single transformer model that constructs the page from raw input signals can replace a complex multi-stage recommender stack. This reduces the number of ML models to maintain, avoids misaligned objectives across stages, and eliminates much of the traditional feature engineering.
  * **Whole-page optimization via reinforcement learning (RL).** Autoregressive page generation makes it possible to optimize for page-level rewards with RL. This can capture interactions across rows and entities, such as diversity or the balance between rows with different _stopping power_. For example, a Continue Watching row near the top of the page may strongly satisfy a user’s immediate intent, but also reduce how much of the page they browse.

---

