# DeepSeek点燃大模型效率之争，阶跃火速接棒：JetSpec让大模型解码速度最高提升近10倍

## Ch01.665 DeepSeek点燃大模型效率之争，阶跃火速接棒：JetSpec让大模型解码速度最高提升近10倍

> 📊 Level ⭐⭐ | 7.0KB | `entities/deepseek点燃大模型效率之争阶跃火速接棒jetspec让大模型解码速度最高提升近10倍.md`

# DeepSeek点燃大模型效率之争，阶跃火速接棒：JetSpec让大模型解码速度最高提升近10倍

**来源**: 量子位

**发布日期**: 2026-06-30

**原文链接**: https://mp.weixin.qq.com/s/JucDgrZBncTtEAu7Quv_Og

## 摘要

2026 年中，DeepSeek 发布 DSpark 推理加速方案后，阶跃星辰随即发表 JetSpec 论文，两家公司的同期工作共同指向大模型行业的新阶段：模型能力仍然重要，但推理效率正在成为决定 Agent 能否规模化落地的基础变量。DSpark 从系统层面减少无效计算，JetSpec 从算法层面用因果并行树生成（Causal Parallel Tree Drafting）提高有效 token 生成率，在 Qwen3-8B 上最高实现 9.64 倍端到端解码加速。

## 核心要点

- **DSpark**（DeepSeek）：面向高并发服务场景，通过因果递归状态的置信度调度验证，在 Qwen3-8B、AIME25 上将平均接受长度从 4.07 提升到 5.01
- **JetSpec**（阶跃星辰）：面向低延迟场景，将因果性融入并行草稿头，在 MATH-500 上平均可接受 10.76 token，HumanEval 实现 7.12 倍加速，MT-Bench 实现 4.58 倍加速
- **共同指向因果一致性**：当草稿生成足够便宜后，保留因果一致性让并行生成的 token 通过目标验证成为关键瓶颈
- **阶跃的技术路线**：JetSpec 是 Flash 模型叙事的一部分，与 Step 3.5/3.7 Flash 的"面向 Agent 场景的高效智能"方向一致
- **PD 分离先驱**：阶跃与 UCSD 此前合作的 DistServe 是 Prefill-Decode Disaggregation 路线的开山论文，已被 NVIDIA TensorRT-LLM、SGLang、vLLM 采用

## 深度分析

### 投机解码的效率边界

投机解码通过轻量级草稿模型提前生成候选 token，再由目标模型一次性并行验证，从而加速自回归生成。其加速比由三个参数决定：草稿成本与验证成本之比（c）、逐 token 接受率（α）和草稿长度（γ）。在草稿生成足够便宜（c 很低）的条件下，接受率 α 成为主导因素——从 0.85 提升到 0.95 会带来显著的加速比差异。这一理论框架解释了为什么 DSpark 和 JetSpec 都聚焦于提升接受率而非继续降低草稿成本：草稿生成的瓶颈已经解决，因果一致性成为新高地。

### DSpark：吞吐量优先的调度方案

DSpark 面向高并发、吞吐量导向的服务场景。它保持并行草稿主干的低成本特性，同时加入轻量级的串行头和置信度估计机制，用来判断哪些候选结果值得送去验证，从而控制每个请求的计算预算。相比传统 MTP（Multi-Token Prediction）这类纯自回归草稿方法——草稿越长需要越多串行步骤——DSpark 能够在相同计算预算下持续提升吞吐量。在 Qwen3-8B 模型和 AIME25 基准上，投机预算设为 7 时，DSpark 将平均接受长度从 DFlash 的 4.07 提升到 5.01。

### JetSpec：低延迟场景的因果并行草稿

JetSpec 面向低并发、延迟导向的服务场景，系统有更充裕的 FLOPs 预算用于提升接受率。其核心创新是因果并行草稿（Causal Parallel Tree Drafting）：将因果性直接融入并行草稿头，使模型更有可能产生更长的可接受前缀。关键结果是将平均接受长度从投机预算 16 时的 7.23 提升到预算 128 时的 9.82，超过了同预算下 DFlash 的 7.34 和 DDTree 的 8.66。更重要的是，JetSpec 的加速效果具有通用性——不仅限于数学任务（MATH-500 上 9.64 倍），在代码任务（HumanEval 上 7.12 倍、LiveCodeBench 上 7.67 倍）和对话任务（MT-Bench 上 4.58 倍）上均表现显著。

### 从推理效率到 Agent 规模化

DSpark 和 JetSpec 的同期出现不是巧合。它们共同标志着大模型行业进入新阶段：推理效率正在从可选项变为必选项。当模型开始被 Agent 高频、长链路、持续调用时，真正决定体验和成本的，不只是模型能不能回答，而是它能不能以足够高的效率完成一次又一次推理。阶跃的技术路线一直强调"面向 Agent 场景的高效智能"——更快的输出速度、更优的调用成本、更好的工具调用与多模态任务执行能力。JetSpec 从推理算法层面补上了这块拼图。这一趋势也反映在作者阵容中：DSpark 有梁文锋，JetSpec 有阶跃 CEO 姜大昕和 CTO 朱亦博，显示了各公司对推理效率的高度重视。

## 实践启示

1. **区分吞吐量优先与延迟优先的服务场景**。对于高并发 API 服务（如面向大量用户的编码助手），DSpark 式的调度方案更合适；对于低并发但要求低延迟的场景（如实时交互），JetSpec 式的加速方案是更好选择。

2. **关注推理效率的 Agent 规模效应**。推理加速方案在单次调用中的收益可能只有几倍，但在 Agent 高频调用场景下——一个 Agent 可能在一次任务中调用模型数百次——这个乘数效应会产生巨大的成本和延迟差异。

3. **PD 分离架构是基础设施级的趋势**。DistServe 已被主流推理框架采用，Prefill-Decode 分离架构正在成为大模型推理的标准范式。新的推理服务部署应默认采用 PD 分离的架构设计。

4. **因果一致性是下一阶段推理优化的关键**。当草稿生成不再昂贵后，提升接受率成为效率瓶颈。关注 DSpark 和 JetSpec 代表的因果一致性方向，这是投机解码社区的前沿共识。

5. **阶跃的 Flash 路线值得关注**。从 Step 3.5 Flash 到 Step 3.7 Flash，再到 JetSpec，阶跃在"面向 Agent 的高效智能"方向上的系统布局——推理算法、模型架构、部署优化三位一体——符合 AI 规模化落地的实际需求。

## 相关实体

- [Token 不经济](../ch12/003-token.html)
- [注意力坍塌与上下文管理](https://github.com/QianJinGuo/wiki/blob/main/entities/attention-collapse-context-management.md)
- [DeepSeek V3 分析](ch01/811-deepseek-v3-moe.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/deepseek点燃大模型效率之争阶跃火速接棒jetspec让大模型解码速度最高提升近10倍.md)

---

