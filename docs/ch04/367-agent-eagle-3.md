# 多轮 Agent 场景下，滴滴的 EAGLE-3 训推加速实践

## Ch04.367 多轮 Agent 场景下，滴滴的 EAGLE-3 训推加速实践

> 📊 Level ⭐⭐ | 7.6KB | `entities/taobao-smart-shopping-guide-agent-evaluation-pzmx.md`

# 多轮 Agent 场景下，滴滴的 EAGLE-3 训推加速实践

过去两年，大语言模型（LLM）的应用形态从 ChatBot 快速演进为 AI Agent。在自动化代码工程、长文档分析、多轮工具调用等复杂工作流中，上下文长度已从千级 token 扩展至数十万级；与此同时，LLM 的自回归生成具有强串行特性，导致延迟和吞吐成为制约用户体验与成本的核心瓶颈。
围绕这一问题，本文基于开源投机采样框架——SpecForge，介绍滴滴在多轮 Agent 场景中对 EAGLE-3 训练与推理的实践。在训练侧，针对 EAGLE-3 在长序列场景中的显存与通信瓶颈，引入统一序列并行（USP），使得在大规模集群上训练 128K 乃至更长上下文成为可能，现已将相关能力贡献至 SpecForge 开源社区；推理侧，相较 MTP 方法，EAGLE-3 在长序列场景中可实现超过 2 倍 的 TPOT（Mean/P95）收益。上述训练与推理优化，已在实际业务场景中得到验证。
![](https://mmbiz.qpic.cn/mmbiz_gif/1kYDdPrxHSoWHXVf9t3PR0ZcocQiafYCOt5uciat7FVHcLCeJAFbVibTrAHEwES7JwDLocENUaj2hIFgLXmoZZt7bOZtNhYanJ9uMiaibJkMxv7E/640?wx_fmt=gif&from=appmsg)
**2.1 从 Chat 到 Agent：推理延迟会被"复合放大"**

## 相关实体
- [Ai Skill Skill Creator 源码拆解](../ch01/573-skill-skill.md)
- [Harness Engineering Systematic Explainer](../ch05/062-harness-engineering.md)
- [Didi Eagle 3 Speculative Decoding Agents](../ch09/047-coding-agent.md)
- [Langsmith Trajectory Evals](../ch01/699-langsmith-trajectory-evals.md)
- [Ai Skill Metrics System](../ch01/477-ai-skill.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/taobao-smart-shopping-guide-agent-evaluation-pzmx.md)

## 深度分析

投机解码在 Agent 场景中的加速逻辑，本质上是通过减少 Target 模型的验证 step 数量来实现 TPOT 的均值与尾部延迟双降。滴滴的实践揭示了一个关键洞察：在长上下文 Agent 场景中，Accept Len 的稳定性比绝对值更重要——当高熵片段（前序一步偏差往往导致整段作废）密集出现时，Draft 序列的连续可接受长度会骤降，加速效果产生剧烈波动。这意味着单纯追求高 Accept Len 的算法改进方向并不完整；如何在长尾分布下保持 Accept Len 的稳定性，是投机解码在 Agent 场景落地真正需要解决的问题。EAGLE-3 通过 TTT（Training-Time Test）机制在训练阶段就模拟"带误差历史"的真实推理过程，使模型适应在不完全干净的前序输入下维持稳定的连续接收能力，这正是其在 64K/128K 长序列场景下 Accept Len 显著优于 MTP 的核心原因。

EAGLE-3 的训练形态揭示了长序列场景下显存瓶颈的真实来源：问题不在于模型参数规模，而在于"激活与 attention 中间状态"的爆炸。具体而言，两大"放大器"叠加造成了 16K 序列即触发 OOM 的反直觉现象：一是多层特征融合带来的激活存储增加（Draft 需要使用 Target 的低层/中层/高层 hidden states，而非仅最后一层）；二是 TTT 多步展开（k 步预测需要 k 轮前向展开和反向传播，中间结果全部保留）。当序列长度 L 和 TTT 展开步数 k 叠加时，两者形成乘法效应而非加法效应，使得单卡显存容量在 128K 场景下彻底失效。这一分析将"长序列训练"的工程挑战从"参数量大"重新定义为"中间状态管理"，为后续的并行策略设计提供了准确的靶点。

滴滴为 EAGLE-3 设计的 USP（Unified Sequence Parallelism）方案，其核心价值在于将 Ulysses（按 head 维度切分，适合提升吞吐）和 Ring（按序列/token 维度切分，适合分散显存压力）统一到同一条 attention 计算路径中，并通过"主干+分支"的解耦计算解决了 TTT 树状可见性带来的 mask 不兼容问题。这一工程实现的精妙之处在于：主干通过 ring attention 解决"长序列可计算"的基础问题，分支利用"无需跨卡通信"的局部增量特性在单卡完成更新，最终通过流式 softmax（LSE 融合）保证分布式切分下的归一化口径一致。这套方案使得单机 8 卡即可稳定支持 128K 上下文训练，同时保持了 Accept Len 不受影响——这在工程上是一个相当高的要求，因为任何归一化口径的偏差都会直接体现为训练-推理分布偏移，进而影响推理侧的加速效果。

从系统设计的视角看，滴滴识别的四大挑战（OOD 导致 Accept Len 衰减、长序列训练与特征管线成本高、P95/P99 尾部延迟不稳定、算法快速演进需要可插拔 infra）揭示了 Agent 推理系统从"能跑"到"能长期稳定赚"之间的巨大鸿沟。特别值得关注的是 OOD 的双因素驱动——数据/流程分布漂移（需要更快训练迭代）和 Draft 能力不足（需要更强泛化能力）——意味着单纯缩短训练周期并不足以解决问题，还需要同时在模型架构层面（更强的条件建模能力）发力。此外，近线/在线快速迭代、MoE/Routing Draft、面向扩散式投机等新范式的可插拔框架等规划方向，代表了当前投机解码领域最前沿的工程探索。

## 实践启示

- **在 Agent 场景选择投机解码方案时，优先考察 Accept Len 在长序列下的稳定性而非峰值**：MTP 等方法在短序列上可能表现接近 EAGLE-3，但在 64K/128K 长上下文场景下衰减显著。应在真实业务场景（包含工具调用、多轮推理等高熵片段）下进行压测，而非仅在短序列基准上评估。

- **长序列训练的前置条件是解决中间状态显存问题，而非简单增加卡数**：当序列长度 L × TTT 展开步数 k 较大时，显存瓶颈主要由 attention 中间激活（而非参数规模）主导。此时需要引入序列并行（SP）在 token 维度对激活进行分片，单纯的 tensor parallelism 或 data parallelism 效果有限。

- **USP 适配 EAGLE-3 的关键在于正确处理 TTT 带来的"主干+分支"树状结构**：如果直接使用默认适配标准 causal attention 的 USP 实现，会因 mask 假设被打破而出现归一化口径不一致，导致训练-推理分布偏移和 Accept Len 下降。需要实现先分支再融合的三步计算流程（主干 ring attention → 分支本地增量更新 → 流式 softmax 融合）。

- **面向长期稳定收益的系统设计需要关注 P95/P99 而非仅 Mean TPOT**：在高熵片段或 OOD 场景下，固定步长的"硬跑"策略可能反向放大验证开销，引发尾部延迟波动。系统应具备基于置信度或一致性的动态退让能力，以保障端到端的稳定性。

- **在构建 Agent 推理 Infra 时预留算法演进的灵活性**：投机范式正在快速演进（如 DFlash 扩散式投机），每引入一种新方法都需要避免"重写训练/推理关键路径"。建议抽象出"数据/特征接口、验证接口、调度策略"三层 API，使新方法的接入成本降低为"替换模块"而非"改造架构"。

---

