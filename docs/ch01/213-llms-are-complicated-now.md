# LLMs are complicated now

> 📊 Level ⭐⭐⭐ | 9.9KB

> 原文存档：[原文存档](https://ianbarber.blog/2026/06/19/llms-are-complicated-now/)

## 核心内容

Back in 2022 and 2023 there were two big branches of machine learning happening at Meta[1](http://ianbarber.blog/2026/06/19/llms-are-complicated-now/#2c91a856-5a90-414f-bc85-26d82760c71d). The LLM work that led to Llama was a clean, smooth stack of repeated Transformer modules; the recommendation systems graphs were, by contrast, terrifying. Luckily, the industry has remedied that state of affairs by making LLMs a lot more complicated.

Seb Raschka maintains an excellent [gallery](https://sebastianraschka.com/llm-architecture-gallery/) of model architectures. You can use it to diff two of the best open models of their respective eras, Llama 3 and Nemotron 3 Ultra.

![Image 1](https://i0.wp.com/ianbarber.blog/wp-content/uploads/2026/06/Screenshot-2026-06-19-at-8.56.02-AM.png?resize=1024%2C598&ssl=1)
Attention might be all you need, but modern models certainly use a lot of different variants of it: query grouping, compressed, sparse, linear, sliding-window and more. Mixture-of-Experts added selective routing to feed-forward layers, and we have since started routing just about everything else too, from attention blocks to the residual stream. Vision and audio encoders have gone from bolted on to mixed-in, and models have scaled to run at inference time across multiple GPUs, which throws comms ops in that add extra boundaries in the middle of your model.

This is not too different from what happened with recsys. The basic architecture of recommendation systems, for the best part of a decade, was a relatively straightforward two-tower sparse neural net. The complexity came from the tension between the need to continually increase capabilities and the need to stay efficient, particularly for inference.

It’s tempting to assume that agents will Fix This: that you’ll hand your PyTorch or JAX definition to Claude Telenovela or whatever and have it generate optimally fused kernels[2](http://ianbarber.blog/2026/06/19/llms-are-complicated-now/#b106a18d-98b3-4821-a60f-d77f1269ad3b). To make that work you need a fixed, usable baseline to make sure that what is generated is… right.

What happened with recsys was that the gap between performance being an _optimization_ and performance being a _necessity_ became very, very small. Conceptually you can keep a pure model definition that gives you a baseline; in practice, training and testing a model takes significant resources and performance improvements become load-bearing.

If you want to swap attention variant `A` for variant `B`, you can afford for `B` to be ten percent slower. You probably can’t afford for it to be an order-of-magnitude worse. If `A` is fused and optimized, you need at least a _partially_ fused and optimized version of `B` before you can even tell whether it’s worth exploring. The research iteration loop demands a different kind of flexibility than just “optimize this known quantity”. You can’t hand-fuse your way back without investing significant time that might not be worth it, and you can’t generate your way forward without a baseline to check. The only way out is to design for composability up front.

One of my favorite kernel developments of the last few years was [FlexAttention](https://pytorch.org/blog/flexattention/) in PyTorch, which took a whole class of attention operations and allowed you to generate kernels for them, via Triton templates. It built on a huge body of work in attention kernels, and it was designed to be composable and verifiable up front: you can explore with only a very mild impact to performance.

Andrej Karpathy recently joined Anthropic, in part to develop richer auto-research-style loops at the frontier. As he has spent the last few years showing, though, being able to cut architectures to their essence and make them composable is as important as a clever agentic setup in climbing that kind of hill.

1.   And many smaller ones, shout outs to all my Content Understanding and integri

---
## 深度分析

### recsys→LLM 的复杂性收敛

Ian Barber 的核心论点是：LLM 架构正在重演 recsys 的轨迹。2022-2023 年的 Meta 同时在做两件事——Llama 的前身是一条干净、平滑、重复堆叠的 Transformer 流水线，而推荐系统的图则"令人恐惧"。十年间，recsys 从干净的双塔（two-tower）稀疏神经网络出发，被"能力持续增长"与"推理必须高效"这对张力一步步逼进了优化迷宫。如今 LLM 也在走同一条路：注意力变体、MoE 路由、多模态混合、多卡推理的通信算子，全都长进了模型定义的中间。区别只在于起点更干净，终点的混乱程度正在追平。

### 注意力变体爆炸是一个 composability 问题

现代模型的注意力早已不是单一算子：query grouping、compressed、sparse、linear、sliding-window 层出不穷；MoE 先给 FFN 加上了 selective routing，随后 routing 蔓延到 attention block 乃至 residual stream；视觉/音频编码器从外挂变成内嵌；推理跨多卡展开又引入了横切模型的通信边界。变体多本身不是问题，问题是这些变体都要求 fused kernel 才有竞争力——每换一次变体，就要重做一轮手写融合。这正是 [Attention Mechanism](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/attention-mechanism.md) 的研究迭代被 kernel 工程绑架的结构性原因：换掉变体 `A` 时，`B` 慢 10% 可以接受，慢一个数量级就不行；若 `A` 已高度 fused，`B` 至少要有部分 fused 版本才值得探索。相关落地案例可参见 [Sliding-window beats linear attention](https://github.com/QianJinGuo/wiki-public/blob/main/entities/sliding-window-beats-linear-attention-microsoft-2026.md) 与 [DeepSeek V3 MoE 架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepseek-v3-moe-architecture.md)。

### FlexAttention：composable + verifiable 的正面证明

出路是 upfront 设计成可组合。PyTorch 的 FlexAttention 是 Barber 最欣赏的 kernel 开发之一：它把一整类 attention 操作收进统一抽象，经由 Triton 模板按需生成 kernel。关键在于它建立在庞大的 attention kernel 工作积累之上，并且从第一天就被设计为 composable 且 verifiable——研究者可以只付出很小的性能代价去探索新变体，而不必为每个变体手写融合。这就是"为 composability 设计"能把研究迭代循环从 kernel 工程中解耦出来的证明。

### agent 自动融合的 caveat：没有基线就无法验证

很 tempting 的假设是 agent 会 Fix This——把 PyTorch/JAX 定义丢给 agent，让它生成最优 fused kernel（Hazy Research 的 Megakernels 是这个方向的原型）。但要让生成的 kernel 可信，需要一个 fixed、usable 的 baseline 来判定生成结果"是对的"。recsys 的教训在这里生效：性能从 optimization 变成 necessity 的缝隙极小——概念上可以保留一个纯模型定义当基线，实际上训练和测试一个模型要消耗大量资源，性能改进很快变成 load-bearing。没有可验证基线的 auto-fusion 循环是空中楼阁；Karpathy 加入 Anthropic 做 auto-research loop 时也强调，把架构裁剪到本质并使其可组合，与聪明的 agentic setup 同样重要。类似的 agent 生成 kernel 实例可参见 [Fable 5 手搓 CUDA 超级内核](https://github.com/QianJinGuo/wiki-public/blob/main/entities/fable-5-cuda-super-kernel-187x-speedup-2026.md)。

## 实践启示

1. **为 composability 提前设计**：在你自己的模型/推理栈里，把 attention 变体、routing 策略做成可插拔组件，而不是把变体 fuse 死在一个 monolithic kernel 里——参考 FlexAttention 的 Triton 模板思路。
2. **守住一个可验证的 baseline**：任何 auto-fusion 或 agent 生成 kernel 的工作流，必须先固定一个"纯模型定义"基线用于正确性校验，否则生成的代码无法判定对错。
3. **警惕性能从优化变成承重墙**：当性能改进开始 load-bearing（训练/测试成本高到无法重跑）时，重构窗口就关闭了——留给架构调整的时间比想象中少。
4. **评估新变体用相对成本阈值**：换注意力变体时，能接受 ~10% 的性能损失用于探索，不能接受数量级倒退；这决定了变体在多大程度融合后才值得评估。
5. **把 kernel 能力视为研究迭代的一等公民**：变体爆炸时代，没有 kernel 路径的架构想法无法被验证；团队应把 kernel 生成/组合能力当作基础设施投入，而非一次性优化任务。

## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

