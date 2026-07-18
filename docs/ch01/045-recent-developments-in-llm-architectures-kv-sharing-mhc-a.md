# Recent Developments in LLM Architectures: KV Sharing, mHC, a

## Ch01.045 Recent Developments in LLM Architectures: KV Sharing, mHC, a

> 📊 Level ⭐ | 8.1KB | `entities/recent_developments_in_llm_architectures.md`

## 核心要点
-

## 深度分析
2026年4月至5月间集中发布的新一代开源LLM架构，呈现出清晰的共同趋向：**在不影响模型质量的前提下，系统性降低长上下文场景下的KV-cache占用与计算成本**。这一转向的背景是推理模型（reasoning models）和Agent工作流需要保留大量token作为上下文，传统注意力机制的资源消耗已成为扩展瓶颈。
当前主流的架构优化思路可归纳为四类：

### 1. 跨层KV复用（Gemma 4）
Gemma 4的E2B/E4B变体引入了Cross-Layer Attention（CLA）机制，后续层直接复用前序层的Key-Value投影，而非在每层独立计算。 这与经典MHA/GQA的"Query头之间共享KV"不同——CLA实现的是"跨层共享KV投影"。以Gemma 4 E2B为例，35层中仅前15层独立计算KV，后续20层复用最近一个同类型（前序滑动窗口层）的KV状态，最终KV cache占用减半，128K上下文下节省约2.7GB显存（E4B节省6GB）。 该技术并非Gemma首创（可追溯至NeurIPS 2024的Cross-Layer Attention论文），但Gemma 4是最早大规模部署的主流模型。CLA的代价是模型容量有所下降，但论文显示影响有限。

### 2. 分层嵌入参数化（PLE，Gemma 4 E系列）
与KV共享互补，PLE针对参数效率。其核心洞察是：传统方案中若想增加token特异性信息，必须扩展整个Transformer堆栈的参数量，成本极高。PLE将额外容量以per-layer embedding tables的形式存储——token ID经过per-layer embedding查找，与常规token embedding一同投影到统一的PLE空间，再按层切成独立的slice，每个Transformer block仅使用自己的ple_l。  这让E2B以2.3B有效参数运行（嵌入层计入后为5.1B），在保持核心计算量紧凑的同时增加了表达能力。PLE的优势在于嵌入参数以查找为主，可高效缓存，不需每次前向都重新计算全量参数。

### 3. 分层注意力预算分配（Laguna XS.2）
Poolside的Laguna XS.2在40层中采用30个滑动窗口注意力层+10个全局注意力层的混合布局，同时引入per-layer query head计数差异化：滑动窗口层分配更多query头（8 Q/KV），全局层分配更少（6 Q/KV），KV head固定为8。  逻辑在于：全局注意力层需要查看完整上下文，已是高成本操作，减少其query头数量可降低计算量；而滑动窗口层本就局部受限，增加query头可在局部范围内提升表达能力。Hugging Face config.json中已支持`num_attention_heads_per_layer`配置，说明该设计已进入生产级开源模型的标配选项。

### 4. 压缩卷积注意力（CCA，ZAYA1-8B）
Zyphra的ZAYA1-8B采用了Compressed Convolutional Attention（CCA），其设计哲学与DeepSeek MLA相似（引入压缩潜在表示），但关键差异在于：MLA用潜在表示减少KV cache存储，CCA直接在压缩空间内执行注意力操作，连注意力计算的FLOPs都一并降低。  CCA额外在压缩后的Q、K张量上施加卷积混合（仅Q和K，不含V），为窄表示引入局部上下文信息，弥补压缩带来的表达力损失。Zyphra报告在可比压缩率下CCA优于MLA。

### 5. 流形约束超连接与混合压缩注意力（DeepSeek V4）
DeepSeek V4引入两项关键创新：
**mHC（Manifold-Constrained Hyper-Connections）**：基于2024年Zhu等人的超连接工作，将单条残差流扩展为n条平行残差流（DeepSeek V4中n=4），层间通过学习的Pre/Post/Res Mapping变换桥接。  相比标准HC，mHC对Res Mapping施加约束——投影到双随机矩阵流形（非负、行列和为1）——使残差信息混合更稳定，避免深层堆叠时信号放大或收缩失控。DeepSeek报告27B规模下额外训练时间仅6.7%。
**CSA/HCA（Compressed Sparse Attention + Heavily Compressed Attention）**：与MLA的per-token压缩不同，CSA/HCA沿序列维度压缩。MLA每个token保留一个压缩表示条目，CSA/HCA将多个token分组压缩为更少的条目（m=4的稀疏选择 vs m'=128的密集压缩），从而缩短缓存长度。  DeepSeek V4-Pro在1M token上下文下仅使用V3.2的27%推力FLOPs和10%的KV cache；V4-Flash更降至10%和7%。

### 架构演化趋势与本质判断
从GPT-2（2019）到DeepSeek V4-Pro（2026），Decoder-only Transformer架构基底未变，但每代都在特定组件上打补丁：注意力变体（MLA → GQA → CCA → CSA/HCA）、残差连接（单流 → 多流+mHC）、嵌入策略（共享 → PLE）。  这些优化整体上在降低（而非增加）运行时成本，但在实现复杂度上已大幅超越原始设计——如今一个完整的transformer block实现代码量约是2019年的10倍。

## 实践启示
对于LLM工程实践者，以下几点值得重点关注：
**KV cache优化已是标配**：无论是跨层KV共享、GQA、还是CSA/HCA，降低KV cache占用已不是可选项，而是2026年后新模型的默认设计。新发布模型的KV cache策略直接影响其在长上下文场景（Agent、多轮对话、文档分析）的可用性。评估模型时应将KV cache大小纳入核心指标，而非仅看参数总量。
**Per-layer差异化配置是效率杠杆**：Laguna的分层注意力预算分配说明，并非所有层都需要相同的注意力计算量。在本地侧/边缘部署场景，可借鉴此思路对特定层（如深层）施加更激进的滑动窗口或更低的query头配置，以换取延迟和显存优势。
**压缩注意力已接近实用临界点**：CCA和CSA/HCA代表了注意力机制从"减少存储"向"减少计算+存储"演进的趋势。Zyphra和DeepSeek的报告均显示这些技术已可在保持模型质量的同时大幅降低资源消耗，随着硬件支持和开源实现进一步完善，预计会成为更多模型的标准组件。
**mHC对系统设计的影响值得关注**：mHC的多残差流意味着hidden state维度在层间会动态变化（n倍展开），这对内存带宽、流水线调度和显存分配都提出新的要求。在设计训练或推理系统时，需要考虑这种非均匀残差流带来的复杂度。
**数据质量仍是核心驱动力**：尽管架构调整贡献显著，Sebastian Raschka在文末强调，模型质量的主要驱动力仍然是数据质量和训练配方，而非架构本身。  这提示在关注架构演进的同时，不应低估数据工程和训练稳定性的基础价值。
## 相关实体
- [Recent Developments In Llm Architectures Kv Sharing Mhc And Compressed Attention](ch01/045-recent-developments-in-llm-architectures-kv-sharing-mhc-a.html)
- [Recent Developments In Llm Architectures Jiqizhixin](ch01/961-llm.html)
- [Why Im Leaving Github For Forgejo](ch01/801-github.html)
- [From Doer To Director The Ai Mindset Shift](ch01/029-from-doer-to-director-the-ai-mindset-shift.html)
- [Microsoft For Startups Microsoft](ch01/531-microsoft-for-startups-microsoft.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/recent_developments_in_llm_architectures.md)

## 关联阅读
-
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/recent_developments_in_llm_architectures.md)

---

