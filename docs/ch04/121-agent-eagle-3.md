# 多轮 Agent 场景下，滴滴的 EAGLE-3 训推加速实践

## Ch04.121 多轮 Agent 场景下，滴滴的 EAGLE-3 训推加速实践

> 📊 Level ⭐⭐ | 15.0KB | `entities/didi-eagle-3-speculative-decoding-agents.md`

## 背景：为什么 Agent 场景对推理速度要求更高

过去两年，大语言模型（LLM）的应用形态从 ChatBot 快速演进为 [AI Agent](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-agent-patterns.md)。在自动化代码工程、长文档分析、多轮工具调用等复杂工作流中，上下文长度已从千级 token 扩展至数十万级；与此同时，LLM 的自回归生成具有强串行特性，导致延迟和吞吐成为制约用户体验与成本的核心瓶颈。

Agent 执行"思考—行动—观察—再规划"多轮循环，生成 500 tokens 的"思考过程"在 20 tokens/s 速度下需 25 秒，10 轮循环可达分钟级。这种延迟复合放大效应使得 Agent 场景对推理速度的要求远超单轮对话场景。

LLM 的自回归生成是典型的 [memory-bound](https://github.com/QianJinGuo/wiki/blob/main/concepts/inference-optimization.md) 瓶颈：每生成一个 token 都需执行一次前向计算并伴随对显存的高频访问（权重访问 + KV cache 读写），而自回归的串行依赖使整个生成过程难以并行优化。

## 投机解码（Speculative Decoding）核心逻辑

### 两阶段流程

投机解码通过"Draft-Verify-Accept"三阶段实现加速：

1. **Draft 阶段**：使用轻量级模型或策略生成一段候选 token 序列（草稿）
2. **Verify 阶段**：Target 模型对整段候选进行一次性前向校验
3. **Accept/Reject 阶段**：通过的 token 直接输出，失败的 token 则回退并重新生成

加速效果取决于两个核心因素：Draft 的生成成本，以及 Accept Len（单次可被接受的 token 数）的长度与稳定性。

### 长上下文场景的挑战

在 Agent 长上下文场景（工具调用历史、长链路推理、代码/文档混合输入），高熵片段密集，前序一步偏差往往导致整段作废，Accept Len 容易骤降。这对 Draft 模型在长序列上的表现提出了更高要求。

## EAGLE-3 方案选择

### 候选方案对比

当前 speculative decoding 的主要技术路线包括：

| 方案 | 特点 |
|------|------|
| **MTP（Multi-Token Prediction）** | 预测多个未来 token，但长序列下 Accept Len 不稳定 |
| **Model-free** | 无需训练，但效果受限 |
| **独立小 Draft** | 参数量小但与 Target 模型对齐差 |
| **多头预测** | 并行度高但训练复杂 |

EAGLE-3 的核心优势在于使用 TTT（Training-Time Test）机制，按照真实推理流程对齐训练，让长上下文下的连续放行长度更稳。

### 长序列是前置条件

在 Agent 场景中 64K/128K+ 是常态，只用 2K/4K 训练会导致高熵段频繁掉链子。EAGLE-3 的多层特征融合设计（融合 Target 的低层局部形式、中层结构模式、高层语义决策信号）使其在长序列场景下表现更稳健。

## EAGLE-3 训练形态与显存问题

### 多层特征融合的代价

EAGLE-3 的 Draft 模型融合 Target 模型的多层特征：

- **低层特征**：局部形式、短程线索
- **中层特征**：结构与模式识别
- **高层特征**：语义与决策信号

代价是训练时需保留多层特征参与计算，反向传播需保存更多中间激活，显存开销随序列长度增长进一步放大。

### TTT（Training-Time Test）机制

传统训练以 ground truth 历史 token 作为条件，导致训练-推理分布不一致。TTT 机制按照真实 decode 流程展开——先生成一步预测，再将该预测作为下一步输入，多步递进训练，使模型适应实际的推理分布。

### 显存 OOM 本质

EAGLE-3 的显存问题来自 **<长序列 L × TTT 展开步数 k × 多层特征带来的额外中间态>** 的叠加，而不是 Draft 参数量本身。这是长序列训练面临的核心挑战。

## 解决方案：USP（Unified Sequence Parallelism）

### 两种序列并行方式对比

| 方式 | 切分维度 | 优点 | 缺点 |
|------|----------|------|------|
| **Ulysses** | 按 head 切分 | All-to-All 重排，吞吐易提升 | 切分粒度受 head 数限制 |
| **Ring Attention** | 按序列切分 | 显存随 SP 规模近似线性下降 | 通信模式复杂 |

### USP 核心设计

USP 将 Ulysses 和 Ring Attention 统一协同：

- **主干（Main）**：沿用 Ring Attention（causal attention），将主干历史按 token 分片分布到多卡
- **TTT 分支（Branch）**：在本卡完成增量更新（TTT 步数通常在 7 以内）
- **Fusion（流式 softmax 融合）**：采用流式 softmax，在引入分支增量的同时持续维护归一化过程

通过 LSE（Log-Sum-Exp）融合保证分布式切分下归一化口径一致。

### USP 效果

- **显存可控**：每张卡仅需保存 1/SP 的主干 KV 与中间态
- **训练更稳**：借助 LSE 融合保证分布式切分下归一化口径一致
- **吞吐更高**：最重的主干计算交由高效 Ring Attention 路径处理，分支采用轻量级增量更新

工程实践补充：输入与 loss 计算都按 SP 分片，显存随卡数近似线性下降；压缩 hidden states 可使存储下降约 25%，Accept Len 保持 1.93，time/step 仅增加 4%。

## 实测效果

### Accept Len 对比

EAGLE-3 的平均 Accept Len 约为 MTP 的 **2.2–2.3×**，在长序列场景下优势显著。

### TPOT（Time Per Output Token）收益

在并发 1–32 范围内，EAGLE-3 相对 MTP 在 P95 TPOT 上稳定降低约 **35%–44%**。

并发 8 下的详细对比：

| 指标 | EAGLE-3 | MTP | 降幅 |
|------|---------|-----|------|
| Mean TPOT | 4.38 | 10.67 | ≈ 59%（≈ 2.4×） |
| Median TPOT | 3.27 | 11.70 | — |
| P95 TPOT | — | — | 35%–44% |

## 当前挑战与后续规划

### 核心挑战

1. **OOD（分布偏移）**：Accept Len 为何会掉，如何长期稳定是核心问题
2. **长序列训练与特征管线成本仍高**：Offline 依赖 hidden states 落盘与搬运，与线上服务争抢资源
3. **P95/P99 稳定收益**：系统要面向"稳定收益"，尾部延迟比 mean 更重要
4. **算法快速演进**：Infra 必须可插拔以适应算法迭代

### 后续规划

- **A**：分离式特征生成 + 训练解耦（Mooncake store 架构）
- **B**：近线/在线快速迭代（周/月级 → 天级/小时级）
- **C**：更强表达的 Draft + 路由专精（MoE / Routing Draft）
- **D**：面向未来范式的可插拔框架

## 深度分析

### 1. TTT 机制揭示了训练-推理分布一致性问题在 Draft 模型中的核心地位

传统训练以 ground truth token 为条件，而实际推理以模型自己生成的内容为条件——这个分布偏移在 Draft 模型上被放大：Draft 的输出直接影响 Accept Len，进而决定加速效果。EAGLE-3 的 TTT 机制通过多步递进训练模拟真实推理流程，使 Draft 适应自回归生成的分布。这个设计选择解释了为什么 EAGLE-3 的 Accept Len 能达到 MTP 的 2.2-2.3 倍——核心差距不在模型架构，而在于训练目标与推理目标的对齐程度。

### 2. 显存 OOM 的根因分析提供了长序列训练的诊断框架

文章将 EAGLE-3 显存问题归结为「长序列 L × TTT 展开步数 k × 多层特征额外中间态」的叠加。这个分解提供了诊断其他长序列训练显存问题的通用框架：当遇到 OOM 时，首先分析是序列长度贡献大还是 TTT 步数贡献大——如果主要是序列长度，则需要更激进的序列并行；如果主要是 TTT 步数，则需要简化训练流程或减少分支融合复杂度。这个框架不只适用于 EAGLE-3，对任何长序列训练都有参考价值。

### 3. USP 的设计揭示了分布式长序列训练的核心矛盾

USP 将 Ring Attention（序列并行）和 Ulysses（head 并行）的协同作为核心设计，说明单一并行策略在长序列 + 多层特征融合场景下都不够用。Ring Attention 的通信模式复杂但显存效率高；Ulysses 吞吐高但切分粒度受 head 限制。USP 的思路是让最重的计算（主干 causal attention）走 Ring Attention 路径，让轻量但通信复杂的分支融合（TTT 增量更新）走本卡处理。这个分而治之的思路是处理异构计算负载的通用范式。

### 4. P95/P99 延迟比 Mean 更重要是 Agent 场景的性能工程共识

文章强调「P95/P99 稳定收益比 mean 更重要」，这与 Agent 场景的特性密切相关：Agent 的多轮循环使得单次慢推理的影响被放大——如果某一轮延迟抖动导致用户体验下降，即使后续轮次恢复正常，整体任务耗时仍可能超出 SLA。P95/P99 关注的是尾部延迟，这对于需要满足用户感知 SLA 的交互式 Agent 场景至关重要。这个认知应当在性能优化优先级中高于 Mean 延迟优化。

### 5. 算法快速演进要求推理 infra 必须具备可插拔性

文章明确指出「Infra 必须可插拔以适应算法迭代」以及后续规划中的 MoE Draft、Routing Draft 等方向，说明 speculative decoding 仍处于快速演进期，尚未收敛到单一最优方案。这意味着企业在建设推理 infra 时，需要将 Draft 模型视为可替换组件而非硬编码依赖，同时在架构设计层面预留算法切换的灵活性，否则可能面临刚完成适配就需重构的局面。

## 实践启示

### 1. 在 Agent 场景部署 speculative decoding 时，长序列训练是必选项

在 Agent 场景（64K/128K+ 上下文）中，如果 Draft 模型只用 2K/4K 训练，会在高熵段频繁掉链子（Accept Len 骤降），导致实际加速效果远低于预期。企业部署 EAGLE-3 或类似方案时，需要确保训练数据集覆盖目标场景的典型上下文长度，或使用合成数据在长序列上继续训练。如果训练资源有限，应优先保证序列长度覆盖，而非模型参数规模的扩大。

### 2. 使用 Hidden States 压缩作为显存优化的低成本杠杆

在不影响训练稳定性的前提下，对 hidden states 进行压缩可实现存储下降约 25%，同时 Accept Len 仅下降 1.93、time/step 仅增加 4%。这个交换比在生产环境中值得采纳——尤其是在显存成为训练瓶颈时，25% 的显存节省可能意味着可以从单卡扩展到双卡或从双卡扩展到四卡，显著提升训练吞吐量。

### 3. 在设计 Agent 推理系统时，P95/P99 延迟应作为核心 SLO 而非 Mean

Agent 场景的性能评估应优先关注 P95/P99 延迟，因为多轮循环中任何一轮的尾部延迟都会影响整体用户体验和任务完成时间。建议在系统设计阶段就建立 P95/P99 延迟的分位点监控，并将降低 P95 延迟作为优化目标而非仅关注平均延迟。这意味着在容量规划和调度策略上，需要为防止尾部拥堵预留更多 buffer。

### 4. 构建推理 infra 时将 Draft 模型设计为可插拔模块

由于 speculative decoding 算法仍在快速演进（MTP、EAGLE-3、后续可能的 MoE Draft、Routing Draft），推理 infra 应将 Draft 模型的实现作为可配置、可替换的模块，而非硬编码依赖。具体做法：定义统一的 Draft 接口（Draft 生成方法、Accept Len 返回格式、KV cache 交互方式），让不同 Draft 算法通过相同接口接入。这样可以在不改变核心推理路径的情况下切换 Draft 算法进行 A/B 测试或逐步升级。

### 5. 在评估 speculative decoding 方案时，Accept Len 稳定性应优先于 Mean 性能

EAGLE-3 相对 MTP 在 Mean TPOT 上有 59% 改善，但文章更强调 P95/P95 的稳定收益。在选择方案时，应关注：不同输入分布下 Accept Len 的方差（方差大意味着不稳定）、长序列场景下 Accept Len 的衰减曲线、高熵场景（如代码生成、长对话）下的表现而非仅看平均 benchmark。如果一个方案 Mean 更好但 P95 更差，可能不适合 Agent 场景的多轮循环特性。

## 相关技术链接

## 相关实体
- [Eagle 3 Speculative Decoding Optimization](../ch01/1050-spec.html)
- [Taobao Smart Shopping Guide Agent Evaluation Pzmx](../ch03/045-agent.html)
- [Gemma 4 Multi Token Prediction Drafters](../ch01/305-gemma-4-multi-token-prediction-drafters.html)
- [Mellum 2 Jetbrains Open 12B Moe Code Model](ch04/070-ai.html)
- [Wow Harness V3 Governance Protocol](../ch05/009-harness.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/didi-eagle-3-speculative-decoding-agents.md)

→

→ [Transformer 架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/transformer-architecture.md)

→ [Attention 机制](https://github.com/QianJinGuo/wiki/blob/main/concepts/attention-mechanism.md)

---

## 参考文献

- SpecForge GitHub PR: https://github.com/sgl-project/SpecForge/pull/425
- SpecForge GitHub PR: https://github.com/sgl-project/SpecForge/pull/454
- EAGLE-3 论文: arXiv:2503.01840

---

