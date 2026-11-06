# The Unbearable Cheapness of Open Weight Models – James O'Claire

> 📊 Level ⭐⭐ | 7.8KB

> **来源**: [The Unbearable Cheapness of Open Weight Models – James O'Claire](https://jamesoclaire.com/2026/06/25/the-unbearable-cheapness-of-open-weight-models/)

Today I was setting up Hermes to see how it does with web research. I chose DeepSeek V4 because I know it is cheap, but seeing it’s pricing next to Anthropic and OpenAI ‘frontier’ models is crazy. Nearly a 50x price increase based on tokens alone, let alone how much pondering any of their models might fall into (using more tokens for the same task).

What worries me about this is that Anthropic and OpenAI seem to have backed themselves into a corner of high costs. Can they reasonably decrease their prices by 20-50x to compete with DeepSeek or Xiaomi’s Mimo?

## Open Weight vs Low Cost

Are these models cheap because they are open weight and having hundreds or people stress test running them on different hardware helped to lower the cost? Or is it that they are being provided as loss leaders to drive the prices down?

## How do you keep prices high for commodity products?

You manufacture scarcity. You sell luxury and premium branding. This is what OpenAI and Anthropic seem to be doing by gating ‘frontier’ model usage behind higher walls.

This is how luxury brands have sold cars and hand bags forever. They are clubs and status symbols for the rich and not meant to be widely distributed.

## Will Anthropic & OpenAI lean on China fears to push bans on open weight models?

This has been my fear for a few months now and each week that goes by seems to support this. How do you manufacture scarcity? One easy way is to fear monger and get the government to help restrict access to competition.

## Why not compete?

The US used to be such a champion of open source, and I would hope that serious open source competition can come out of the US to prove that open weight and open source models are ultimately the future.

*   Google Gemma 4 was released in April 2026 
*   Meta had llama which hasn’t had a release
*   OpenAI last released open weight gpt models in 2025
*   Anthropic to my knowledge has never released any open weight model

## True Open Source vs Open Weight

I think the leap frog scenario for Open Source will be the true Open Source models where the data pipeline for training is also open sourced.

[https://allenai.org/olmo](https://allenai.org/olmo) -> You can download these models now and they’re seeing increasing popularity. That being said, they are a bit out of date, with data cutoffs in Dec 2024

Looking to the future, the US NSF partnered with Nvidia to enable Allen AI to develop a true fully open AI:

[https://www.nsf.gov/news/nsf-nvidia-partnership-enables-ai2-develop-fully-open-ai](https://www.nsf.gov/news/nsf-nvidia-partnership-enables-ai2-develop-fully-open-ai)

## Bonus:

Curious to dig more into Claude / ChatGPT tech stacks? Check out the tools they used to build their iOS and Android apps:

[Claude Android](https://appgoblin.info/apps/com.anthropic.claude)

[ChatGPT Android](https://appgoblin.info/apps/com.openai.chatgpt)

You can navigate to SDKs to view even more detailed breakdowns of specific parts as well as unmapped SDK paths.

→ [原文存档](https://jamesoclaire.com/2026/06/25/the-unbearable-cheapness-of-open-weight-models/)

---
## 深度分析

### 20-50x 价差：不是效率差距，是商业模式差距

DeepSeek V4 与 Xiaomi MiMo 这类 open weight 模型的 token 定价，比 Anthropic/OpenAI 的 frontier 模型低近 20-50 倍——这还只是单 token 单价，若计入 frontier 模型在推理时的 extended thinking 额外消耗（同一任务花更多 token），实际成本差距更大。这个量级的价差无法用"模型质量更好"完全解释：当开源权重在多数任务上逼近闭源前沿时，闭源方的定价支撑只剩品牌与信任，而非能力本身。

### 为什么 Anthropic/OpenAI 降不了价：被锁死的高成本位

对 Anthropic 和 OpenAI 而言，降价 20-50 倍不是"愿不愿意"而是"能不能"的问题。巨额训练与推理资本开支、围绕高毛利定价建立的融资叙事和估值、已签约企业客户的合同结构，共同把锁死在高位。这正是软件与云计算史上反复出现的剧本：Windows 对 Linux、Oracle 对 MySQL、AWS 对开源替代品——当商品化产品从下方逼近时，在位者无法把价格降到商品水平而不摧毁自己的商业模式，只能上移（卖平台、卖集成、卖企业服务）。面对 Deepseek V4 的压力，frontier 实验室的回应大概率是继续造更高墙，而不是开门降价。

### 地缘政治禁令：替代不了的护城河

商品化产品的另一个经典守势是把竞争问题转化为政策问题。文章作者观察到，用"中国威胁"叙事推动政府对 open weight 模型设限，正成为制造稀缺性的低成本手段——比起在技术上拉开差距或把价格降到商品水平，借助监管把竞争对手挡在门外便宜得多。这构成了闭源阵营最后的护城河：不是模型能力，而是市场准入。相关动态可对比 [Kimi K3 The Open Weights Escalation](https://github.com/QianJinGuo/wiki-public/blob/main/entities/kimi-k3-the-open-weights-escalation.md) 中开源阵营的升级式反制。

### Open Source vs Open Weight：商品化的终极变量

目前的 open weight 模型（Gemma 4、DeepSeek、MiMo）只放权重，训练数据管道仍不透明；真正的全开源（如 Allen AI 的 OLMo，含数据管道，NSF 与 Nvidia 合作支持）才是跳级式超越的可能路径——当数据、权重、训练方法全部可复现时，"前沿能力"将彻底失去稀缺性定价的根基。这也与 [Open Source Ai Ecosystem](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/open-source-ai-ecosystem.md) 和 [Ai Cost Optimization Framework](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/ai-cost-optimization-framework.md) 的判断一致：模型层的商品化不可逆，长期价值将转移到 harness、推理效率与数据工程。美国阵营的缺席（Anthropic 从未发过 open weight、Meta 的 llama 停更、OpenAI 上一次开源在 2025）反而加速了定价权向开源阵营转移。

## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

