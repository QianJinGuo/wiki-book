---
title: "自动优化 Agent Harness 的三条路径：Meta-Harness · AHE · Self-Harness 深度精读"
source_url: "https://mp.weixin.qq.com/s/P4FUXBM6x-Bss8iZEfqA-A"
author: vibe life
platform: WeChat
ingested: 2026-08-13
slug: vibe-life-meta-harness-ahe-self-harness-deep-read-2026
sha256: 822e2d35fed6d7b5e869cda7c52aea4066bf2fd861ade6e8f4d23e65cd4b6fe6
---

公众号「vibe life」深度精读三篇 harness 自动化论文：Meta-Harness（arXiv 2603.28052）、AHE / Agentic Harness Engineering（arXiv 2604.25850）、Self-Harness（arXiv 2606.09498）。本文为该公众号《改进 Agent Harness 的七篇方法梳理》的姊妹篇，但深度远超（逐节阅读笔记级）。

## 导言：为什么 harness 工程值得自动化

同一模型换一套 harness（系统提示、工具、检索、记忆、middleware、运行时机制、编排逻辑、失败恢复）可在同一基准上拉开数倍乃至 6× 的差距。但 harness 工程至今主要靠人工专家逐条翻轨迹、调启发式。模型迭代越快，人工 harness 工程越跟不上。三篇论文构成清晰谱系：**由谁来改进**（更强外部 agent vs 目标 agent 自身）× **用什么机制驱动**（全历史文件系统诊断 vs 可观测性支柱+可证伪合约 vs 聚类执行迹+回归测试门控）。

## 范式一览

| 维度 | Meta-Harness | AHE | Self-Harness |
|------|-------------|-----|--------------|
| 改进主体 | 外部 coding-agent proposer（Claude Code/Opus-4.6） | 外部 Evolve Agent（GPT-5.4 xhigh） | 目标 agent 自身（同一固定模型切 proposer 角色） |
| 依赖更强模型 | 是 | 是 | 否，within-model、权重全程冻结 |
| 诊断对象 | 全历史 code/score/trace 经文件系统选择性检视 | 七类组件文件 + 分层蒸馏 evidence corpus | 当前 harness 可编辑 surface + 聚类执行迹 |
| 核心机制 | coding agent 自由诊断全历史、跨失败因果假设；维护 Pareto 前沿 | 三大 observability 支柱 + 可证伪 change manifest（下轮任务 delta 裁决） | 三段式失败签名（终因/因果地位/agent 机制）扎根 verifier 精确聚类 → 有界 minimal 候选 → held-out 回归门保守接受 |
| 主要结果 | Opus 4.6 榜 #2（76.4%）、Haiku 4.5 榜 #1（37.6%） | pass@1 69.7%→77.0%，冻结 harness 跨基准/跨模型族迁移正向（最高 +10.1pp） | 绝对增益最高 +21.4pp、相对最高 +138%（跨 3 模型族） |

谱系：Human Harness Engineering（人工）→ Meta-Harness/AHE（更强外部 agent 驱动）→ Self-Harness（agent 改进自身）。Self-Harness Figure 1 明确把"依赖更强外部模型 = 昂贵、对前沿模型不可得、与目标模型失效模式失配"作为动机，直接回应 Meta-Harness 路线的局限。

## 三篇论文的共识

1. **改 harness > 改 prompt**：真正搬动指标的改动很少是"把 prompt 写长"，而是落在检索、编排、记忆与运行时机制。Meta-Harness 文本分类域核心杠杆是"如何从记忆选/排对比样例"而非 few-shot 数量（>32 反伤精度），TerminalBench 域最佳改动是纯加性 env bootstrap 而前 6 轮改 prompt 全部回归；AHE 组件消融显示 system-prompt 单独换入反而退化（−2.3pp），增益集中在 tools/middleware/long-term memory，8 条 manifest 变更里只有 2 条纯 prompt；Self-Harness 保留编辑改的是 bootstrap/execution/failure_recovery/verification 的机制缺陷。
2. **执行证据驱动 + held-out 信号防过拟合**：三者都不靠裸标量分数或自辩式 rationale，把执行迹/任务 delta 作为改进与验证依据。
3. **改进会平台化/饱和，根因相似**：Meta-Harness 平台期归为四重叠加机制（见下），Self-Harness 归因于剩余失败触及模型能力上限，AHE 归因于"修好的−撞坏的"算术不对称。共同印证 RSI 文献共识：只改脚手架、不动权重的自我改进，能力上限被基座锁死。

## 核心分歧：改进主体外部还是内部

Meta-Harness 与 AHE 借更强外部 agent 改较弱目标 agent 的 harness，代价是依赖可能昂贵、对前沿模型不可得、与目标模型失效模式失配的"外部大脑"；Self-Harness 把改进循环内化到目标 agent 自身，换取 within-model 可扩展性，但放弃更强 proposer 的搜索能力。Meta-Harness 直言实验只在一个特别强的 coding-agent proposer 上完成。

## 评测协议的共同短板（本精读的独立分析）

- **数据集划分**：Meta-Harness 在分类/数学有干净 held-out（甚至 OOD），TerminalBench-2 完全不划分（搜索=评测同一 89 题，只能靠人工+regex 审计查泄漏；且论文内部数据不一致：§4.2 称数学搜索集 250 题、附录 D 写 88 题）；AHE 不设 hold-out（每编辑增益由同一 89 任务集 delta 裁决，存在循环论证风险，只能靠迁移到 off-target 反证）；Self-Harness held-out 实为 validation（进入接受/拒绝选择决策），反复作门控会缓慢适配"不退化"边界，abstract"generalize to unseen tasks"表述偏强。
- **无不确定性报告**：三篇都做了少量复评却无误差棒/CI/显著性检验。AHE k=2 使每任务 pass@1 只能取 {0, 0.5, 1}；粗估 AHE 89 任务 × 2 = 178 attempt、p≈0.77，聚合 pass@1 的 1 个标准误约 ±3.2pp——而它声称相对种子 +7.3pp、Meta-Harness 仅比 Terminus-KIRA 高 +1.7pp，都落在同量级噪声带里。三篇都没做配对检验，任何"X 显著优于 Y"从论文本身无从支撑。
- **搜索过程是单次抽样**：最终 harness 是个随机变量，三篇只给一条搜索轨迹的终点，未报告搜索方差或可复现性。
- **改进有界**：Meta-Harness 强调 harness 空间内可达上确界有界、改不动冻结的 M；AHE 自定位"受控研究原型而非成熟自主自改系统"；Self-Harness 明言研究固定 benchmark 下的有界 harness 编辑。最小改动是补齐配对 bootstrap 置信区间 + 报告多次重跑搜索方差。

## Meta-Harness 阅读笔记（补充分析：平台期四重机制）

### 核心设计
- 每个历史候选 harness 写成一个目录（源代码 + 各任务分数 + 完整执行轨迹）；proposer 是 coding agent，用 grep/cat 主动翻历史，跨失败归纳因果假设。
- 与 text optimizer 对比（历史访问/日志内容/每轮上下文规模三轴）：OPRO 0.002 MTok/iter、TextGrad 0.015、AlphaEvolve 0.022、GEPA 0.008、Feedback Descent 0.012、TTT-Discover 0.026，**Meta-Harness 10.0**——约三个数量级之差。压缩反馈的方法在 harness 这种长程、诊断信息散落各处的场景会系统性丢信号。
- 维护 Pareto 前沿（精度×上下文成本）；不施加父代选择规则；测试集全程保密。单次评估最多产生 10,000,000 token 诊断信息；proposer 每轮中位读取 82 个文件（源码 41%/trace 40%/分数摘要 6%/其他 13%）。

### 三域结果
- **在线文本分类**：平均 48.6%（ACE 高 7.7 点、MCE 高 8.6 点），只用 11.4K token（ACE 用 50.8K、MCE 用 28.5K）。消融：只给分数 34.6/41.3（median/best）、分数+摘要 34.9/38.7（摘要反而帮倒忙）、**完整 trace 50.0/56.7**——对原始执行 trace 的访问是使能 harness 搜索的关键成分。OOD 9 数据集平均 73.1 比 ACE 高 2.9 点。
- **检索增强数学推理**：200 道 IMO 级 held-out 题跨 5 模型平均 +4.7 点。发现四路 BM25 检索 harness（词法路由：combinatorics 取 20 去重到 8 重排留 3 / geometry 1 固定 hard 参考+2 原始邻居不重排 / number-theory 取 12 重排留 3 / default 自适应 K），复用 sparse BM25 栈、数学感知分词器、不引入 dense 编码器。两成功谱系由搜索自主合并。
- **TerminalBench-2**：Opus 4.6 达 76.4%（超手工 Terminus-KIRA 74.7%、列第 2，唯一更高 ForgeCode 81.8% 无法复现）；Haiku 4.5 达 37.6%（列第 1）。核心改动是 environment bootstrapping（agent 循环前跑复合 shell 采沙箱快照注入初始 prompt，15 秒超时守护、约 +80 行纯加性改动），增益集中 7/89 题（protein-assembly、path-tracing 等需领域特定工具的任务）。proposer 因果推理弧线：前 2 轮结构修复+prompt 改动均回归（-5.6pp/-6.7pp）→ 第 3 轮识别混淆（共享 prompt 干预）→ 第 7 轮转纯加性 env bootstrap 成最佳 → 第 10 轮跨 run 迁移经验。

### ⚠️ 平台期四重机制（论文没专门讨论，本精读的补充理论分析）

best-so-far 曲线：33→50→55→55→56→56，约 +17 分几乎全在前 5 次评估拿到，第 10 次以后 30 次评估只挪约 1 分。平台期是"多重决定"的：

1. **极值统计（max-of-n 的凹性）**：搜索再挑最好 = 对已评候选取最大值。极值理论（Fisher–Tippett–Gnedenko）：期望最大值趋近上确界，但缺口只以 1/n 幂次（有界→Weibull）或 √(2ln n)（高斯类）收缩。第 n+1 个样本边际增益必然快速趋 0——纯随机搜索也凹。Meta-Harness 靠历史把提议分布前移只是"更快到顶"，没取消凹性。
2. **硬天花板**：H* = argmax E[r] 中奖励有界，且 harness 空间内可达上确界本身有界——harness 只能重排上下文/检索/记忆，改不动 M 权重。存在不可约天花板，要突破必须动 M（论文把 co-evolve 列为 future work）。与 RSI 文献一致：只改脚手架的天花板明显低于改权重。
3. **赢家诅咒 / 过拟合搜索集**：选择在很小（分类 50-100 例）、带噪的 search set 上做，带噪指标上"从很多候选挑最大值"系统性高估。过某点后继续迭代买到的是方差拟合而非信号。旁证：few-shot 加到 32 以上在 7/9 任务反而变差。验证器界限：自我改进只在"验证能力强于生成能力"时有效。
4. **搜索动力学**：proposer 在崎岖代码地形上近似贪心局部搜索。容易的高概率改进被吃光后新提议超过当前最好概率骤降；为躲避回归 proposer 主动降低提议方差变保守（被困盆地）；候选趋同后 execution traces 越来越像、诊断信号衰减。

一句话：统计（max-of-n 凹性）+ 结构（harness 空间×冻结模型硬上限）+ 选择（有限带噪搜索集赢家诅咒）+ 动力学（局部最优+proposer 转保守+trace 信号衰减）。要再往上唯一出路是换更强 M 或联合进化权重，而不是加迭代次数。

## AHE 阅读笔记（补充：self-attribution 量化分析）

### 核心设计
- 三大 observability 支柱：组件 observability（NexAU 七类正交组件文件化：system prompt/tool description/tool implementation/middleware/skill/sub-agent 配置/long-term memory，git commit 粒度 diff 与回滚）、经验 observability（Agent Debugger 四阶段分层蒸馏：生成 k 条 trace → 探查（每条 message 一个文件）→ 蒸馏（每任务 analysis report + pass/fail）→ 聚合（benchmark overview），原始 traces 按 progressive disclosure 提供）、决策 observability（Evolve Agent 编辑 + change manifest：失败证据/推断根因/靶向 fix/预测影响，下轮任务 delta 裁决）。
- 两大约束：controllability（只在 harness workspace 内写，runs/tracer/verifier/LLM 配置只读，seed system prompt 不可删——堵住关 verifier/换模型/抬 reasoning 预算的 reward hacking）+ evidence-driven（每编辑附 manifest 条目）。
- 极简 seed：只暴露单个 shell 执行 tool、无 middleware/skills/sub-agents/memory——归因洁净，每个组件凭实测 rollout 证明自己。
- 10 轮迭代（约 32 小时），每任务 k=2 rollout，E2B 远程沙箱隔离。

### 结果
- Terminal-Bench 2：pass@1 69.7%→77.0%，超过人工（Codex 71.9%）与自演化基线（ACE 68.9%、TF-GRPO 72.3%）。Hard 档 53.3% 略低于 Codex 56.7%（组件长程干扰，单独 memory 换入即超 Codex）。
- 跨基准迁移（SWE-bench-verified 500 任务）：75.6% 最高，增益集中 django/sphinx-doc；token 比 ACE 少 32%、TF-GRPO 少 21%、seed 少 12%；聚合 Succ/Mtok 1.64 最高。
- 跨模型迁移：五个备用基座全部正向（+2.3 到 +10.1pp），**跨族增益大于族内增益**（deepseek-v4-flash +10.1、qwen-3.6-plus +6.3、gemini-3.1-flash-lite +5.1 vs GPT-5.4 medium/xhigh +2.3）——离饱和更远的基座更依赖已固化进 tools/middleware/memory 的协调模式。
- 组件消融：memory only 75.3%（Hard 63.3% 超 full AHE）、tool only 73.0%、middleware only 71.9%、**system_prompt only 67.4%（唯一回归 −2.3pp）**。三个正向单组件增益和 +11.1pp 超过 full AHE 的 +7.3pp——组件非加性，堆叠会在长程预算里花轮数做冗余复查，封顶总增益。

### ⚠️ self-attribution 量化（本精读核心增量）

把每轮 evolve 模型自宣告的 fix/regression 预测与下一轮 ground truth 对比：
- **fix 面**：precision 33.7%、recall 51.4%，约为随机基线（6.5%、10.6%）的 **5 倍**——每次编辑落在真实、被预见的目标上，但逐轮从近零摆到近饱和（informative if noisy）。
- **regression 面失明**：precision 11.8%、recall 11.1%，仅约随机基线（5.6%、5.4%）的 **2 倍**且逐轮贴底——agent 能解释为何一个编辑该 help，却无法可靠指出同一编辑会 break 哪些任务。9 轮里 43 条 regression 预测仅 5 条命中（累计 P=11.6%），40 条实际回归未被预见（累计 R=11.1%）。
- **为什么 per-iteration 非单调**：Δpass@1 ∝ N（fail→pass 新修好）− M（pass→fail 新撞坏）。agent 对 N 大致看得见（fix 5× 随机）、对 M 基本失明（2× 随机贴地）；且**回滚只兜"该修没修"（predicted fixes 没出现），对"没说要坏却坏了"（未预见的 regression）完全无效**——Algorithm 1 phase 3 只在 predicted fixes 缺席时回滚，regression 不在 predicted 集合里触发不了回滚。未预见的 M 漏过、留在 workspace，直接变成下挫。即便编辑都"对"也会回吐：组件非加性把原本能过的任务拖到超时。报告里的 best-so-far 单调是 H_best 跟踪拉出来的，不是每轮真在涨。
- 论文把 regression foresight 定位为最清晰的未来方向。

## Self-Harness 阅读笔记（补充细节）

- 三范式定位（Figure 1）：Human Harness Engineering → Meta-Harness（外部）→ Self-Harness（自身）。
- 失败签名 φ = (ci 终因, qi 因果地位, mi agent 机制) 三元组，三者完全一致才聚类——同一 timeout 可能源于完全不同根因（探索不收敛 vs 死循环重试），按症状聚类会逼 proposer 开"别超时"的泛泛药。聚类 deterministic（签名相等的硬条件）且 verifier-grounded。
- 有界 proposal 上下文四件套：可编辑 surface / verifier-grounded 失效模式 / 应保留的通过行为护栏 / 已尝试编辑摘要（防重复造轮子）。Diversity vs Minimality：分支间广撒网（不同机制/surface），分支内只改一处（可解释、可归因）。
- 接受规则：Δin ≥ 0 ∧ Δho ≥ 0 ∧ max(Δin, Δho) > 0——保守晋升，只在一个切分换另一个的提案被拒。
- 结果（Terminal-Bench-2.0，64-case 子集）：M2.5 held-in 43.0→50.0/held-out 40.5→61.9（+53% rel）、Qwen3.5 held-in 15.1→36.0（+138% rel）/held-out 23.8→38.1、GLM-5 held-in 47.7→57.0/held-out 42.9→57.1。保留编辑：M2.5（bootstrap 早建产物/execution 格式正确/runtime_control 超限重定向）、Qwen3.5（bootstrap 依赖预检/execution 探索循环打断/failure_recovery 禁精确重试/middleware 工具错误触发产物创建）、GLM-5（bootstrap 持久 PATH/verification 探索过久转实现）。共性主题 artifact reliability，模型特异性明显——同一初始 harness 对不同模型暴露不同执行病理。
- 平台有干净机制解释（拒绝即保持 At=∅⇒ht+1=ht + 保守门拒大量候选）；饱和是讨论不足处（addressability：剩余失败可能是任务难度/模型能力上限，harness 改不动）。
- 局限：held-out 实为 validation（进入选择决策），无独立 test set；接受的编辑可能反映 benchmark 特定失效模式。

## 一句话总结

三篇都把"自动 harness 优化"刻画成可审计、可证伪、但天花板受基座锁死、且现有评测还不足以分辨小幅度增益与噪声的工程循环——要把它从"工程"推进为"可复现的科学"，最小改动是补齐配对 bootstrap 置信区间、并报告多次重跑搜索的方差。
