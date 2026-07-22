---
title: "Anthropic宣告「递归自我提升」时代到来，LLM如何实现自我进化？全景综述带你一探究竟"
source_url: "https://mp.weixin.qq.com/s/N_qd_beuSQ4zMcJAActTaQ"
ingested: 2026-06-11
sha256: "fcadf1163da26c1a2ff2ee348b167040869c2758df38ce0e0bc11abb86a42030"
publish_time: "2026-06-11"
sources:
  - "[[entities/llm-self-improvement-system-survey-zesearch-nlp-2026]]"
---

# Anthropic宣告「递归自我提升」时代到来，LLM如何实现自我进化？全景综述带你一探究竟

> 机器之心 | 2026年6月11日 14:49 | 新加坡

近日，Anthropic 发布了一篇引发广泛关注的文章《When AI builds itself》。文中披露了极其惊人的内部数据：截至 2026 年 5 月，Anthropic 超过 80% 的合并代码已由 Claude 编写，工程师的日常代码产出飙升了 8 倍；更令人瞩目的是，AI 智能体已经可以自主提出假设、执行长达数百小时的强化安全实验。

这说明 AI 已开始展现自主参与下一代模型设计与训练的潜力，而这种自我提升能力（Self-Improvement），正在成为下一代 AI 发展的关键驱动力。

过去，探讨大语言模型（LLMs）的下一步发展时，焦点往往局限于更大的参数规模、海量的数据喂养和极限的算力堆叠。

然而，传统依赖人类监督的训练范式正逐渐面临瓶颈：高质量人工标注极其昂贵，专家反馈难以规模化；更致命的是，随着模型能力的指数级攀升，在高等数学、复杂代码生成和前沿科研推理等任务中，人类的认知边界，反而成了限制模型进化的天花板。与此同时，随着智能体技术的成熟，模型已展现出自主生成数据、调用工具和执行代码的强大自动化能力。

这表明，当前的大语言模型已具备主动参与自身迭代的能力，无需再完全依赖人类的监督。这一趋势标志着一种深刻的范式转移：大语言模型的发展正从被动接受人类微调与修正转向自主探索与持续进化。

为了解构大语言模型自我提升的底层逻辑，填补系统性研究的空白，来自纽约州立大学石溪分校 Zesearch NLP Lab 的 Haoyan Yang、Jiawei Zhou 等人经过将近一年的努力，最近发布了一篇 113 页、涵盖 500 余篇前沿文献的关于大模型自我提升的全景综述：

- 论文链接: https://arxiv.org/pdf/2603.25681
- GitHub Repo: https://github.com/Zesearch/self-improvement-llm
- 项目网站: https://zesearch.github.io/self-improvement-llm-website/

## 综述核心框架

论文提出了「LLM 自我提升系统」（LLM Self-Improvement System）这一概念。

相比已有关于自我演化智能体 (Self-Evolving Agents) 的研究，这篇论文更加从模型自身能力出发，关注模型如何凭借内在能力驱动系统持续演化，并将过去分散在数据、训练、推理和评估中的方法，整合为一个由模型能力驱动的系统级闭环生命周期。

在这个框架中，自我提升不再是单一算法，而是一套可持续运转的智能系统。论文围绕一个核心问题展开：如何在不同阶段利用模型自身能力，推动持续且自主的改进？

论文将自我提升系统概括为四个核心环节：数据获取（Data Acquisition）→ 数据筛选（Data Selection）→ 模型优化（Model Optimization）→ 推理细化（Inference Refinement），并由自动评估（Autonomous Evaluation）作为贯穿全程的控制层。每个环节都以模型的自动化能力为核心，使模型能够主动获取数据、筛选样本、优化自身，并在推理中反思改进。

### 数据获取（Data Acquisition）

自我提升首先需要源源不断的学习数据。论文将数据获取分为三类：静态筛选（Static Curation）、环境交互（Environment Interaction）和合成生成（Synthetic Generation）。

静态筛选是从已有语料中挖掘可学习样本；环境交互让模型通过与外部环境交互来主动获取数据；合成生成则进一步让模型自己构造新的训练数据。随着这三类方式递进，模型从使用已有数据走向主动探索甚至是自主创造数据。

### 数据筛选（Data Selection）

在数据获取之后，问题转向数据筛选：重点变成当已经获取到足够的数据后，判断哪些数据真正有价值。低质量、重复或错误的数据可能放大偏差，甚至导致模型坍塌。因此，系统需要筛选出更有效的数据，进入下一步训练。

论文将数据筛选方法分为两类：第一类是模型引导评分（Model-Guided Scoring），即利用模型产生的信号对数据进行打分和过滤，例如置信度、困惑度、梯度或损失函数；第二类是自适应选择（Adaptive Selection），即把数据筛选变成一个可学习的策略，根据模型能力和反馈动态更新，选择当前最有价值的数据。

### 模型优化（Model Optimization）

在数据经过获取和筛选之后，模型优化阶段负责将这些数据真正转化为模型能力。

作者将这一过程总结为 GRO 框架，即生成 — 奖励 — 优化（Generation–Reward–Optimization）：模型首先基于已有数据生成反映当前能力的输出，再利用奖励信号判断其质量，并通过训练更新自身参数，使模型在循环迭代中持续提升能力。

在这个 GRO 循环中：

- **生成（Generation）**是起点：模型基于当前能力产生答案、推理链等。论文将生成方式分为三类：自我探索（Self-Exploratory Generation）、精炼生成（Refined Generation）、交互式生成（Interactive Generation）。
- **奖励（Reward）**阶段：系统对生成结果进行自动评估。奖励信号主要包括三类：启发式奖励（Heuristic Reward）、模型奖励（Model-based Reward）、可验证奖励（Verifiable Reward）。
- **优化（Optimization）**阶段：模型利用这些反馈更新自身参数。优化方法可以分为三类：监督微调（Supervised Fine-Tuning, SFT）、强化学习（Reinforcement Learning, RL）、混合优化（Hybrid Optimization）。

此外，作者还总结了三种常见的模型优化范式：迭代拒绝采样（Iterative Rejection Sampling）、自我验证与精炼（Self-Verification and Self-Refinement），以及自我对弈（Self-Play）。

### 推理细化（Inference Refinement）

模型优化关注的是通过训练更新参数，而推理细化（Inference Refinement）关注的是：在参数不一定永久改变的情况下，如何让模型在回答问题时更好地搜索、反思、调用工具并修正自身输出。

论文将推理细化归纳为四类方法：解码策略（Decoding Strategies）、推理式增强（Reasoning-based Improvement）、智能体系统增强（Agentic System-based Improvement）、测试时训练（Test-Time Training）。

这部分的核心意义在于，它把自我提升扩展到推理过程，使系统不仅依赖训练后的参数更新，也能在具体任务中实现动态改进。这也是当前「自我演化智能体」研究最关注的方向之一。

### 自动评估（Autonomous Evaluation）

除了上述四个环节，自我提升系统还需要一个贯穿全程的控制层：自动评估（Autonomous Evaluation）。如果缺少评估，系统就无法判断自身改进是否真实有效。

论文强调两类方法：动态基准（Dynamic Benchmarking）和交互环境评估（Interactive Environment Evaluation）。通过这种方式，评估不再是闭环末端的一次性打分，而是持续指导系统改进的反馈机制。

## 风险与挑战

自我提升系统具有巨大潜力，但也面临一系列挑战。作者一共总结了六个关键问题：

1. **数据自噬（Data Autophagy）**：模型反复学习自身生成的数据
2. **反馈信号缺陷（Flawed Feedback Signals）**：错误或有偏的反馈
3. **优化驱动失败（Optimization-Driven Failures）**：训练和优化过程中的失败
4. **无效自我精炼（Ineffective Self-Refinement）**：推理阶段的自我精炼有时只是表面修改
5. **评估瓶颈（Evaluation Bottlenecks）**
6. **监督瓶颈（Supervision Bottlenecks）**

## 应用场景

作者总结了自我提升系统的六大应用场景：代码（Code）、数学（Math）、医疗（Medicine）、金融（Finance）、算法发现（Algorithm）和科学研究（Science）。

## 未来方向

作者提出了自我提升研究的四大方向：

1. 从模型级优化走向端到端自我提升系统（End-to-End Self-Improving Systems）
2. 发展面向应用的专用自我提升模型（Application-Centric Self-Improved Models）
3. 建立统一基准与自主评估（Unified Benchmarks and Autonomous Evaluation）
4. 在自动化与人类监督之间取得平衡（Balancing Automation and Human Oversight）

## 作者介绍

- **第一作者**：Haoyan Yang，纽约州立大学石溪分校计算机科学博士生
  - 个人主页：https://joyyang158.github.io/haoyan-yang/
- **通讯作者**：Jiawei Zhou，纽约州立大学石溪分校计算机科学系、数据科学项目、应用数学与统计系助理教授
  - 个人主页：https://joezhouai.com
- **其他作者**：Mario Xerri、Solha Park、Huajian Zhang、Yiyang Feng、Sai Akhil Kogilathota，来自纽约州立大学石溪分校

© THE END — 转载请联系机器之心获得授权
