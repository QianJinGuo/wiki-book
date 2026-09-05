---
source: xiaohongshu
source_url: "https://xhslink.cn/o/9d43uEdcEIQ"
source_title: "解析｜GLM 5.3 后训练技术博客"
ingested: 2026-08-17
author_name: "古希腊掌管代码的神"
platform: xiaohongshu
note_id: 6a804df700000000280339c5
sha256: 545374db72b2818356e6c54597c690238e074b7de9539686df5c876fe5ac3b88
---

# 解析｜GLM 5.3 后训练技术博客

来源：小红书 @古希腊掌管代码的神，解读智谱官方技术博客《GLM-5.3: Frontier Coding with Emergent Cyber Capabilities》(z.ai/blog/glm-5.3)。本笔记正文文字区仅 teaser，实质内容在 5 张轮播图里（官方技术博客的深度机制拆解，此处据 macOS Vision OCR 完整转录）。

## 1. 在 GLM-5.2 基础上的后训练拓展

GLM-5.3 使用 GLM-5.2 的基座进行后训练拓展：`Scaling post-training is all we did for GLM-5.3`。在模型架构、基础设施上继承 GLM-5.2 已搭建好的长程任务环境 stack：

- **架构侧**：IndexShare 负责长上下文的高效处理（拓展到 1M 上下文）。GLM-5 系列通过 DSA（DeepSeek Sparse Attention）在标准 MLA 上增加 Indexer 实现稀疏注意力，缓解 1M 上下文 KV Cache 压力；GLM-5.2 通过 IndexShare 跨层复用 DSA 的稀疏 KV 选择（Indexer 的 Top-K 选择），缓解 1M 上下文计算（Indexer O(n²) 计算复杂度）问题。
- **RL 算法侧**：SAO（Single-Rollout Asynchronous Optimization）负责长程 Agent 任务算法优化。
- **Infra 侧**：slime 负责针对长上下文多轮次的大规模异步训练。

RL Scaling 的难点从模型转移到环境，GLM-5.3 在环境/任务合成上用 pipeline 端到端合成环境，部分任务连 RL 奖励信号也一起合成。

## 2. SAO 算法细节与评测

**SAO 负责长程任务上的 RL 优化**，对目标函数 L(θ) 采用单 rollout 替代组采样：每个 prompt 只采样一条、生成后立即进入训练，消除组采样最慢样本与不均匀生成带来的 off-policy（Policy Staleness）。代价是方差高，需用第三点价值模型补偿。

- **DIS 双侧 token-level 重要性采样**：丢掉难追踪的 π_old，直接用 rollout 时的 log-prob 作为行为策略，只保留 π_θ 与 π_rollout 之比 r（Training-Inference Discrepancy），比值落在信任域外的 token 整段从梯度里移除，即校准函数 f(r; ε_l, ε_h) = r（当 1-ε_l < r < 1+ε_h），否则为 0。
- **面向单 rollout 的价值模型设计**：critic 比 policy 更新更频繁（比值 K=2），冻结价值模型的注意力、只训练 MoE 投影（价值模型不稳定主要来自注意力层），并用 Skip-Observation GAE 跨过环境观测 token，扩大 value model 预训练。
- **CompactionRL**：在 SAO 稳定训练基础上将上下文压缩纳入 RL 以适配 Agentic 长程任务，让增益在长程任务上也守得住。

**评测（6 benchmarks: Terminal Bench 3.0, DeepSWE, Agents Last Exam (CLI), AutomationBench, HLE w/ Tools, GDPVal-AA v2）**：纵向看 GLM-5.3 相对 GLM-5.2 在公开 Coding Agent Benchmark 上 Terminal-Bench 3.0 由 4.6 升到 28.3、DeepSWE V1.1 由 46.2 升到 66.9、Agents' Last Exam 由 23.8 升到 28.5。横向看 Terminal Bench 3.0 上 GLM-5.3 的 28.3 高于 Kimi K3 的 17.4 与 Opus 4.8 的 21.1，但低于 Fable 5 的 33.7 与 GPT-5.6 Sol 的 34.6；DeepSWE v1.1 的 66.9 与 Kimi K3 的 67.5 基本持平，落后 Fable 5 的 69.7 与 GPT-5.6 Sol 的 72.7。基本到达开源顶尖水平，在难任务上与闭源 SOTA 还有差距。

在 Z.ai Code Bench 上（私有基准，按真实用户场景沿端到端任务完成率+细粒度 checklist 两维度打分，私有可降低污染风险），GLM-5.3 在准确率和输出长度（推理成本）上达到很好平衡，超越 Opus 4.8 与前代 GLM-5.2。

## 3. 环境/任务合成：RL Scaling 难点从模型转移到环境

**动机**：随着 agent 能力提升，后训练规模化难点大部分由模型转移到环境——可用任务环境要同时满足可执行、可验证、接近真实专业工作三个条件，且数量要很多，仅人工参与无法满足；环境目标形态、质量要求也变了，GLM-5.3 合成环境偏向专家工作的真实单元，有些任务相当于一名有经验的工程师数天工作量。官方 Blog 举例：ML 基础设施任务中，模型拿到与工程师同样的工作环境（计算集群、存储系统、内部文档、代码库、实验结果），要在整个训练栈上定位瓶颈、实现优化、跑实验，并在保持正确性前提下交付可测量的端到端加速。

**实现**：用 pipeline 端到端合成环境，部分任务连 RL 奖励信号也一起合成。官方链路分四步：
1. research agents 从真实工作中收集任务模式，转成可运行的长程环境（long-horizon environments），带多步依赖（multi-step dependencies）与隐藏状态（hidden state）。
2. judge agent 实际去做每个任务，验证确实可解（solvable）。
3. Verifiers 在不接触参考解的前提下被合成，再用求解轨迹（solver trajectories）发现并封堵奖励捷径。
4. 通过 oracle、no-op 与 unsolved-state 三项检查的验证器产出二元奖励。

**关键约束**：第三步验证器合成时不给参考解，避免退化成对答案的模式匹配，代价是只能从任务定义与环境状态出发判定，因此才需要后面的三项检查兜底。官方承认该流水线仍需相当多人工介入，下一步目标是把环境生成与验证做得更自主。

## 4. 涌现的网络安全能力（Emergent Cyber Capabilities）

官方在后训练时把漏洞发现的数据与环境加进训练混合，预期是让模型更擅长发现与推理漏洞，但 GLM-5.3 **涌现出网络安全能力**：不只是更会识别孤立缺陷，而是开始跨多个利用阶段推理，能为完整的利用链（exploitation chain）形成连贯计划。以下三个 Benchmark 按利用链由浅到深排列：

- **CyberGym**（从白盒源码出发，测能否通过触发故障识别并验证漏洞）：GLM-5.3 得 84.5%，GLM-5.2 是 77.2%，是该 Benchmark 最好成绩，高于 Mythos 5 的 83.8% 与 GPT-5.6 Sol 的 83.6%。
- **ExploitBench**（对真实漏洞及利用做更深推理）：GLM-5.3 得 54.4%，相对 GLM-5.2 的 24.4% 翻了一倍多，但 Mythos 5 与 GPT-5.6 Sol 分别是 78.0% 与 76.5%。
- **ExploitGym**（测在时间归一化预算下能完成多少利用任务）：GLM-5.3 两小时完成 105 个、六小时 130 个，GLM-5.2 是 29/39。

结论：基准在利用链上的位置越靠深入，相对 GLM-5.2 的增益越大，同时与闭源前沿差距也越大（Capability is growing fastest exactly where we are furthest behind）。

## 5. slime：OPD 支持/训推一致性/吞吐优化

GLM-5.3 训练由 slime 框架支持（训练侧 Megatron、rollout 侧 SGLang）。设计要点：把训练、rollout 与 data buffer 放在同一条 dataflow 上，使数学、代码、沙箱、验证器与长程 agent 环境都以数据生成形式接入而非改训练循环，因此 GLM-5.2 到 GLM-5.3 只加任务、环境而不必每次重建训练栈。

- **算法侧新增**：top-p mask、top-k 与全词表 OPD（On-Policy Distillation），以及若干改善训推一致性的配置（训练路径和 rollout 路径之间的数值对齐）。此前解析 OPD 的 Top-K 截断与 KL 方向时提到，把 OPD 支撑限制到 top-k 会使目标有偏，全词表版本无此问题、代价是显存与通信。训推一致性具体读数：平均 logprob 差异被控制在 1e-7 量级，相对此前设置降低超过 99.99%。
- **框架侧改进**：
  - 把本地存储当作额外缓存层，分层存放本要占宿主内存的模型状态与数据。对 MOPD 的意义：配合训练侧动态 Teacher 切换与预取，可在不为每个 Teacher 常驻一个推理服务的前提下使用多个 Teacher，额外开销有限而资源消耗显著降低。
  - 改进 router 与 slime 之间的联合调度与负载均衡，加 workload-aware 启发式，从各 rollout 环境的特征推导 prefill 与 decode 的资源配比、并发设置等吞吐关键参数。

长程编码 RL 任务上，这些系统级优化把端到端 RL 训练吞吐提升 2.3× 以上。
