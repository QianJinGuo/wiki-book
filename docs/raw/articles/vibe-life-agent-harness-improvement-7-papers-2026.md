---
title: "改进 Agent Harness 的七篇方法梳理（Meta-Harness/AHE/Self-Harness/RHO/RHI/HarnessX/LIFE）"
source_url: "https://mp.weixin.qq.com/s/Cd-FQ3hnqAXEcNS9w-QEjQ"
author: vibe life
platform: WeChat
ingested: 2026-08-13
slug: vibe-life-agent-harness-improvement-7-papers-2026
sha256: 4e31a4672fba0ee418df01dd3e65e15d746efd573f8ad7fc51c906fa6b66fabe
---

公众号「vibe life」梳理 7 篇围绕「如何自动改进 agent harness」的方法论文：Meta-Harness、AHE、Self-Harness、RHO、RHI、HarnessX、LIFE-HARNESS。

## Harness 概念

一个 LLM agent 的真实表现很少由基座模型单独决定。同一个模型换一套不同的 harness——系统提示、工具、检索、记忆、middleware、运行时机制、编排与失败恢复——在同一基准上可拉开数倍乃至更大差距。Harness = 围绕基座模型、中介它与外部世界交互的那一层非参数系统：决定模型如何思考与规划、调用什么工具、感知与管理上下文、把中间产物存到哪里、如何检查自己的结果（Weng 2026 定义）。改 harness 的诱因：权重训练又贵又慢，而 harness 是代码——可读、可改、可审计、可即时部署。与模型 scaling 是两条互补杠杆。

## 通用回路

7 篇方法形态各异，但剥到骨架都是同一个改进回路的实例：
1. **Rollout/执行**：用 H_t 把 agent 跑一遍 → 轨迹 {τ} + 验证结果
2. **错误分析**：把 {τ} 蒸馏成"可归因的失败信号"（哪个失败·根因·该归到哪个可编辑面）
3. **提议/Proposal**：proposer 据 ② 生成候选编辑 ΔH
4. **验证/Validation**：判 ΔH 接受/拒绝（修好目标失败？有无回归？偏好是否胜出？）
5. **更新/Merge**：H_{t+1} ← merge(H_t, 接受的 ΔH)

差异不在"有没有这个回路"，而在每一环用了什么机制、立了多少结构。

## 逐篇梳理

### 1. Meta-Harness（Lee et al., 2026, arXiv 2603.28052）

- **核心贡献**：把 harness 当作待优化的代码，给 coding-agent proposer 完整的执行历史访问（源码+分数+轨迹），而非压缩后的标量反馈。OPRO 无记忆、TextGrad 只回传标量"梯度"、DSPy 把反馈限制成几行模板——proposer 拿到的信号太薄。
- **做了什么**：每个历史候选 harness 写成一个目录（源代码+各任务分数+完整执行轨迹）；proposer 是 coding agent（Claude Code/Opus 4.6），用 grep/cat 主动翻历史，跨失败归纳因果假设。维护 Pareto 前沿（精度×上下文成本）；不施加父代选择规则，proposer 可检视任意既往 harness（含被淘汰的）。测试集全程保密。
- **结果**：TerminalBench-2 上 Opus 4.6 顶到 76.4%（第 2，超手工 Terminus-KIRA 74.7%）；Haiku 4.5 提升 37.6% 列第 1；文本分类 +7.7 点、数学域跨 5 模型平均 +4.7 点。
- **亮点**：诊断与改写委托给 coding agent、不写死搜索逻辑 → 背后 coding agent 变强则 Meta-Harness 自动变强。代价：harness 是无约束代码，成败押在 proposer 自身能力。
- **注脚**：实验只在一个特别强的 coding-agent proposer 上完成。

### 2. AHE（Agentic Harness Engineering, Lin et al., 2026, arXiv 2604.25850）

- **核心贡献**：harness 演化的瓶颈不是 agent 能力（capability）而是可观测性（observability）——失败时能不能知道哪个组件该负责、能不能拿证据说话。用三大可观测性支柱 + 可证伪/可归因/可回滚的逐编辑契约。
- **三根支柱**：①组件可观测性：可编辑内容文件化为 7 类正交组件（system prompt/tool description/tool implementation/middleware/skill/sub-agent 配置/long-term memory），失败模式映射到组件；②经验可观测性：每个 harness 生成 k 条轨迹，"Agent debugger" 逐轨迹分析产出 per-task 根因报告 + benchmark overview；③决策可观测性（契约机制）："Evolve agent" 产出编辑 + change manifest（失败证据名/推断根因/针对性修复/预测影响，含"预期修好的失败"和"有回归风险的已通过项"），下轮用 pass/fail delta 裁决。文件级回滚。**硬约束**：runs 目录、tracer、verifier、LLM 配置只读，编辑只能落在 harness workspace——从机制上关掉换模型/关 verifier/抬 reasoning 预算这类 reward hacking。
- **结果**：Terminal-Bench-2 pass@1 69.7%→77.0%（+7.3pp），超过手工 harness；冻住的 harness 迁移到 SWE-bench-verified 仍有正向增益。
- **注脚**：不设 hold-out，每条编辑增益由同一 89 任务集 delta 裁决，存在循环论证风险。

### 3. Self-Harness（Zhang et al., 2026, arXiv 2606.09498）

- **核心贡献**：让被部署的同一固定模型自己改进它所运行的 harness（WHO=self），消除对更强外部 agent 的依赖（Meta-Harness 路线的软肋：昂贵、对前沿模型不可得、与目标模型失效模式失配）。
- **三段回路**：①弱点挖掘——按根因聚类而非表面症状：失败签名 φ 含三件（终因 verifier 层面报告/相关 agent 行为的因果地位/trace 暴露的抽象 agent 机制），按 φ 聚类防 proposer 被表面症状误导；②harness 提议——有界、最小、由目标模型自任 proposer（within-model），编辑优先"反复出现且可解决"的模式、窄改动、候选互异；③验证——合取回归门：held-in（目标弱点是否解决）∧ held-out（是否引入新问题）都不退化才接受。
- **结果**：Terminal-Bench-2 上 MiniMax M2.5、Qwen3.5-35B-A3B、GLM-5 绝对增益最高 +21.4pp、相对最高 +138%，三模型两切分均不退化。
- **注脚**：只有两个切分、无独立 test set，held-out 实为 validation。

### 4. RHO（Retrospective Harness Optimization, arXiv 2606.05922）

- **核心贡献**：在无 ground-truth 标签下，只用过去无标签轨迹，通过回顾分析 + 自偏好（self-preference），单遍改进完整 harness。3-准则布尔矩阵定位唯一三者占满（Label-free × Full harness × Single pass）。
- **三阶段**：①coreset 选择：按"难度×多样性"用 DPP 选一小批核心任务 D_core；②group rollout 诊断（无标签错误信号）：每核心任务并行重解 G=3 次，错误信号来自 self-validation（agent 自己的答案能否通过自己可跑的检查）与 self-consistency（3 次解不一致 = 错误证据）；③harness proposal + 成对自偏好：生成 N 个候选与 baseline 成对比较，S_j>0 才接受。solver/diagnose/optimize/rank 全由同一 backbone（gpt-5.5）。held-out 用 (seed, instance_id) SHA-256 严格切分。
- **结果**：SWE-Bench Pro 0.59→0.78、Terminal-Bench-2 0.71→0.76、GAIA-2 0.29→0.37。
- **注脚**：单 seed、无误差棒、无显著性检验；需可 reset 环境；GAIA-2 用同一 gpt-5.5 当 judge 有 self-judge 混淆。

### 5. RHI（Recursive Harness Self-Improvement, Lee et al., Sakana AI / UC Berkeley）

- **核心贡献**：把 harness 定义为 prompt 级的 agent loop（roles/instructions/contracts/hops），只与"前一版的自己"成对比较（trajectory-local），把种群搜索 Θ(m²) 松弛到 Θ(1)。回应"自动 harness 演化计入开销后未必胜过 test-time scaling"（Wang et al. 2026）。
- **一轮五步**：①coding agent 接任务 x 与当前 harness H^(i) 解出 output[i]；②LLM 评估器（2 judge × 3 seed）与上一轮 output[i-1] 成对比较；③存"自比较历史"；④LLM harness optimizer 据历史更新 H^(i+1)；⑤输出缓存复用。
- **结果**：30 个合成 ML 研究任务（量化金融/机器人/制药各 10）上，少数几轮就把低 reasoning-effort 的 sonnet-4.6/opus-4.7/opus-4.8 顶到各自 test-time scaling 天花板之上，推理成本最多降 60%。增益来自更有效的任务特定上下文管理（inter-agent 信息流）而非更长输出。
- **注脚**：无 held-out（per-task 特化，优化与评测同批）；全靠 LLM-as-judge。

### 6. HarnessX（arXiv 2606.14249）

- **核心贡献**：把 harness 形式化为一阶类型对象 agent = model_config.agentic(harness_config)，配九维行为分类法（D1 model selection…D9 training bridge），每维度由带类型接口的 processor 实例化、挂生命周期 hook 上，组合/替换代数（insert/replace/remove）保证类型安全。支撑 foundry 三条操作：Compose/Adapt/Evolve。
- **Adapt**：四阶段 AEGIS 引擎（Digester/Planner/Evolver/Critic）+ 确定性 seesaw 门控（"任何已解任务都不许回退"）。**Evolve**（§5）：7 篇里唯一动权重的一篇——cross-harness GRPO 在共享 replay buffer 上把 harness 演化与模型训练交织（co-evolution）。
- **结果**：5 benchmark（GAIA/ALFWorld/WebShop/τ³-Bench/SWE-bench Verified）平均 +14.5%，inverse-scaling（最弱 task agent 增益最大）。
- **注脚**：无独立测试集，增益在同任务集上测峰值（best round），带 selection bias。

### 7. LIFE-HARNESS（Xu et al., 北京大学, 2026）

- **核心贡献**：针对确定性、规则驱动的 agent——失败多发生在 model-environment 接口处（观测结构差/工具契约被误解/动作不可执行/反馈未触发恢复/轨迹退化），而非推理能力不足。立场是不改权重、改 runtime interface，按 agent 交互生命周期排四层干预。
- **四层**：Environment Contract（交互前，显式化稳定环境约束）/ Procedural Skill（任务条件化，检索相关技能）/ Action Realization（执行前，校验动作可执行、拦截注定失败的动作）/ Trajectory Regulation（执行后，监测无进展并触发恢复）。harness 用 Codex 从训练轨迹演化，全程对测试集保密。
- **结果**：7 个确定性环境平均 +88.5% 相对增益；92%（116/126）跨 17 个底座广谱迁移（harness 仅从 Qwen3-4B-Instruct 单一轨迹源演化）。显式 train/eval 切分 + 留出测试集 + in-domain/OOD 双视角（7 篇里评测最干净）。

## 七篇坐标总表

| 论文 | WHO | 信号（错误分析） | 可优化组件 | 验证 | 冻结 | 独特点 |
|------|-----|----------------|-----------|------|------|--------|
| Meta-Harness | 外部 coding agent | 全历史（不压缩） | prompt/检索/记忆/编排 | Pareto | model | proposer 全文件系统访问 |
| AHE | 外部 evolve agent | 可观测性蒸馏 | 7 组件 | 可证伪契约 | model+infra | 瓶颈是 observability |
| Self-Harness | 自身（被部署模型） | 失败签名 φ | ~10 可编辑面 | held-in∧held-out 回归门 | model+evaluator | WHO=self |
| RHO | 自偏好回路 | self-val+consistency | tools/prompts/skills | 成对自偏好 | model | 无标签+单遍 |
| RHI | 自比较（LLM 优化器） | trajectory-local 成对 | roles/instructions/contracts/hops | 成对（LLM judge） | model | O(1)/轮无标签+轻量 |
| HarnessX | 外部 AEGIS | trace+RL reward | 9 维 | seesaw 门 | frozen/可训练 | 唯一 co-evolution |
| LIFE | 外部 Codex | 轨迹失败 | 4 生命周期层 | regression check | model+env | 改接口不改模型 |

三个孤点最醒目：Self-Harness 的 WHO=self、RHO 的无标签+单遍、HarnessX 的 co-evolution，是 7 篇里真正的方法 delta。

## Future Challenges

1. **天花板被基座锁死**：只改脚手架、不动权重的自我改进，能力上限被冻结基座锁死——HarnessX §4 撞 scaffolding 天花板、Self-Harness 把饱和归因于剩余失败触及模型能力上限。要再往上必须联合进化权重（HarnessX §5）或换更强基座。
2. **弱且模糊的验证器**：研究品味、新颖性、长期价值难量化；RHO/RHI 用 LLM 当 judge 引入 self-judge 混淆与噪声。验证器与权限控制应落在演化回路之外（held-out test、trace 审计、人在关键决策点介入）。
3. **优化即评测的耦合**：AHE 不设 hold-out、RHI per-task 特化——优化目标与评测目标耦合，只能靠迁移到 off-target 任务反证。LIFE/RHO 的 held-out 切分更干净，值得作默认。
4. **单 seed 的脆弱**：RHO 单 seed、无误差棒、coreset 消融单点 20pt 摆动。急需多 seed + 显著性检验标配。
5. **reward hacking**：回路优化它被给的任何信号——来自单测就过拟合单测，来自 judge 就学 judge 的 trick。AHE 只读冻结面是范本但远未解决。
6. **多样性的坍缩**：演化与 RL 回路倾向剥削已知高回报模式，种群会塌缩成同一解的变体；开放式探索尤其需要防坍缩机制。
7. **上下文与记忆的生命周期**：agent 越自主记忆越涨，harness 得管理上下文以补足长上下文生成局限——正从"软件系统层"上移为"智能的一部分"。

贯穿判断：这 7 篇都把"自动 harness 优化"刻画成可审计、可证伪、但天花板受基座锁死的工程循环，而非通用的能力跃升。

## 附录：评测基准速查

- Terminal-Bench-2 / τ-bench 家族：AHE/Meta-Harness/Self-Harness/RHO 直接用 TB2；LIFE 用 τ-bench/τ²-bench；HarnessX 用 τ³-Bench
- SWE-bench(-Pro/-Verified)：AHE 跨基准迁移、RHO（SWE-Bench Pro）、HarnessX 用 Verified
- GAIA(-2)：RHO、HarnessX
- ALFWorld/WebShop/AgentBench：LIFE（确定性域）、HarnessX
- 30 合成 ML 研究任务：RHI（量化金融/机器人/制药）

## References

1. Lee et al. "Meta-Harness: End-to-End Optimization of Model Harnesses." arXiv 2603.28052, 2026.
2. Lin et al. "Agentic Harness Engineering: Observability-Driven Automatic Evolution of Coding-Agent Harnesses." arXiv 2604.25850, 2026.
3. Zhang et al. "Self-Harness: Harnesses That Improve Themselves." arXiv 2606.09498, 2026.
4. "Evolving Agents in the Dark: Retrospective Harness Optimization via Self-Preference." arXiv 2606.05922, 2026.
5. Lee et al. "Recursive Harness Self-Improvement." Sakana AI / UC Berkeley, 2026.
6. "HarnessX: A Composable, Adaptive, and Evolvable Agent Harness Foundry." arXiv 2606.14249, 2026.
7. Xu et al. "Adapting the Interface, Not the Model: Runtime Harness Adaptation for Deterministic LLM Agents." 北京大学, 2026.
8. Weng, Lilian. "Harness Engineering for Self-Improvement." Lil'Log, Jul 2026.
