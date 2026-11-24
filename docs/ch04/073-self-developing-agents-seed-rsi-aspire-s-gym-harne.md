# Self-Developing Agents：字节 Seed 三项 RSI 基准（ASPIRE / S³Gym / HarnessDev）

> 📊 Level ⭐⭐⭐ | 13.4KB

## Self-Developing Agents：字节 Seed 三项 RSI 基准

字节跳动 Seed、TokenWave 等机构在 **Self-Developing Agents** 项目（项目页 `self-developing-agents.github.io`）中提出的一套 RSI 评测组合：用 **ASPIRE、S³Gym、HarnessDev** 三项基准，把「递归式自我改进（Recursive Self-Improvement, RSI）」拆成三个可分别检验的环节——**ASPIRE 检查目标能否选对，S³Gym 检查经验能否学会，HarnessDev 检查系统改进能否留下来**。作者明确声明这不是一个已实现完整 RSI 的端到端系统，而是各测闭环的一段。

## 问题定义：自我改进 ≠ 递归式自我改进

文章的切分线在于「谁提供目标与判定标准」。如果任务、答案和评分标准都由人准备好，Agent 可以沿反馈不断优化；当目标变成「成为一个更好的研究者」时，下一份训练数据从哪来、下一项测试该测什么、由谁判断努力是否用对了地方，就都必须由系统自己回答。

项目 Blog 用 **Golden Verifier** 概括关键假设：系统已有足够可靠的判定机制告诉模型哪些改动值得追求——在这个前提下 Agent 可以不断生成数据、训练模型、修改策略，作者把这种「目标与验证仍主要由外部提供」的情形称为**半闭环**。ASPIRE 论文给出的具体区分是：「提高某套数学测试的分数」与「提高数学推理能力」不是同一个起点——前者已确定题型、难度与成功标准；后者还要判断短板在哪、哪些练习值得做、练习上的进步能否迁移到真正关心的能力。

闭环因此被定义为：从宽泛目标出发发现问题 → 通过尝试获得经验 → 检验哪些经验有效 → 把有效改动保留下来 → 用更新后的能力开始下一轮。「递归」的要求落在最后一步：一次修改即使让当前任务做得更好，也还要检验它**有没有帮助系统更好地发现问题、设计测试和实施后续改进**。作者同时划出边界——闭环不等于让 AI 自己说了算：Agent 可以构造学习信号，但信号是否可信仍需接受独立于其自我判断的检查，三项基准保留隐藏评测、程序验证器或开发结束后的测试，正是为了区分「Agent 认为的进步」与「评测实际观察到的变化」。

## S³Gym：经验能否被学会（arXiv 2608.31100）

S³Gym 在**七个文字游戏**中检查「把经历转成可用经验」的过程：Agent 自己探索并判断行动效果，但探索时看不到程序验证器给出的真实步骤奖励和最终分；研究者随后用更严格的条件和另一组随机种子重测，**测试轨迹不会回流为学习材料**。判定标准很硬：写下一段复盘不算完成学习，经验必须改善之后的行动。

实验比较三条路径——保留原始历史、保存跨局摘要、更新模型参数——结果并不单向：

- 在《植物大战僵尸》中，从原始历史换成摘要记忆，Gemini 2.5 Flash 的累计正向收益 AUC+ 从 **24.4 提升到 238.5**，而 Gemini 2.5 Pro 却从 **60.4 降到 11.9**（同一游戏、同一指标，摘要记忆在两个模型上带来相反方向的变化）。
- 把经验写进参数同样可能进步或退步：一条 Qwen3-8B 训练轨迹中，信任博弈从初始 0 分达到最高 30 分，19 个训练后版本有 18 个高于初始模型；但《植物大战僵尸》从 23 分降到 6 分且后续版本都停留在此，扫雷、数字消除和俄罗斯方块全程没有测到收益。
- 论文的轨迹分析提示：可概括成策略的经验与依赖精确状态的经验可能需要不同处理方式；实验并未单独检验摘要长度，也未确定参数训练退步的唯一原因。

## HarnessDev：局部改进能否成为下一次的能力（arXiv 2609.01437）

HarnessDev 让模型**创建并持续修改自己的执行系统**，评测对象是能够跨任务复用的程序，而不只是某次任务的答案。创建阶段覆盖四个领域、五个基准、**2,207 个去重任务**，演化阶段追踪修改后系统的表现；每个正式版本冻结后再评测、模型权重保持不变，使系统改动的效果能被单独观察。

在固定 Gemini 执行的两条轨迹中，出现了「可见反馈上升、隐藏任务下降」的一致模式：

| 创建者 | 可见反馈分 | 隐藏任务分 |
|---|---|---|
| Qwen 3.7 Max | 62.1 → **63.2** | 49.52 → **48.41** |
| DeepSeek V4 Pro | 47.3 → **53.8** | 43.02 → **40.63** |

隐藏评测为 SWE-Pro 100 题与 Terminal-Bench 89 题的等权平均（另有 630 道 SWE-Pro 单独面板）。运行记录还能把失败定位到具体改动：Qwen 的消息清理逻辑破坏了合法的工具返回序列；DeepSeek 的上下文压缩改动破坏了工具消息配对，随后回滚了大量修改。

作者主动给出的局限同样重要：演化实验集中在代码任务、事后隐藏评测只覆盖 SWE-Pro、各配置只有一条轨迹，且**未进一步验证让新系统充当下一轮开发环境的递归过程**——这些结果揭示的是闭环中的风险，并不证明长期系统演化已经可靠。

## 为什么这三项基准值得单独记一笔

- **把 RSI 从口号拆成可测量的三段**：目标选择（ASPIRE）／经验学习（S³Gym）／改进留存（HarnessDev），每一段都能独立失败，而不是笼统地说「模型能不能自我改进」。
- **「可见反馈 vs 隐藏任务」是 Harness 自进化的通用探测器**：与 [Harness 自演化两篇合读](https://mp.weixin.qq.com/s/2AbGy3Sd3GSkDvXWz7ir3w)（raw 存档）中「updating 与 benefit 是两条独立轴」的结论同构；可见指标上涨而隐藏任务下降，正是「过拟合开发反馈」的度量形态。
- **记忆路径不是免费的**：S³Gym 的相反方向结果（同一机制在两个模型上一个 +214、一个 −48.5）说明「存什么、怎么概括」需要按经验类型区分，可与 [Agent Memory 架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-architecture.md)、[工作集与长期记忆](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/working-set-vs-long-term-memory.md) 对照。
- **经验学习与参数更新的对照设计**值得复用：三条路径同台比较、测试轨迹不回流，避免了「写完复盘就算学会」的自证。

## 深度分析

### 判断本身是被遗漏的评测对象

三项基准最一致的发现是：失败往往不发生在执行环节，而发生在「判断」环节。ASPIRE 的 30 个实验格中只有 1 格在筛选后保住高于初始模型的分数，更有信息量的是失败形态——有 Agent 用「答案标签为单个数字」的数据训练模型，279 个评测输出全部退化为单个数字，5 个版本中 4 个得 0 分。这不是训练没跑通，而是目标形成阶段就错了：Agent 找到了能执行的任务，却没验证它是否服务于能力方向。半闭环的本质因此可重述为：不是缺少执行能力，而是把目标拆解、验证构造这些最难的判断外包给了人；这一步不进评测范围，闭环的上游就始终不可见。

### 「可见反馈 vs 隐藏任务」是结构性风险，不是个案

HarnessDev 两条轨迹呈现同一模式：Qwen 3.7 Max 可见反馈 62.1→63.2 而隐藏任务 49.52→48.41；DeepSeek V4 Pro 可见 47.3→53.8 而隐藏 43.02→40.63。这与 [Harness 自演化两篇合读](https://mp.weixin.qq.com/s/2AbGy3Sd3GSkDvXWz7ir3w) 的独立证据汇合：论文一的 Δ_update 与 Δ_benefit 本就是两条独立的轴；论文二在 held-out 测试上测得 harness evolution 平均只带来 +0.6 的边际增益。三组独立实验指向同一结论：在开发反馈上过拟合是 harness 自演化的默认行为而非偶发事故——修订更易编码任务特定捷径，而非更好的设计原则。[评测 Harness 设计](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/evaluation-harness-design.md) 中「开发/评测分离」因此不是工程洁癖，而是这类系统成立的前提。

### 经验的类型决定表示形式，记忆不是免费增益器

S³Gym 的反向结果值得单独放大：同一游戏、同一指标下，摘要记忆让 Gemini 2.5 Flash 的 AUC+ 从 24.4 升到 238.5，却让 Gemini 2.5 Pro 从 60.4 跌到 11.9——方向相反、幅度相差近 290 点。参数路径同样不可预测：同一条 Qwen3-8B 训练轨迹在信任博弈上从 0 冲到 30，在植物大战僵尸上却从 23 跌到 6 且再未恢复。两点综合：「可概括成策略的经验」与「依赖精确状态的经验」需要不同的表示与检索机制，统一摘要或统一微调都会在某一侧造成损失；参数写入有不可逆性——记忆错误可丢弃，权重退步却留在后续所有版本里。对 [Agent Memory 架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-architecture.md) 与 [工作集与长期记忆](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/working-set-vs-long-term-memory.md) 的启示：记忆分层不只是存储效率问题，而是「哪类经验配哪种写回方式」的正确性问题。

### 证据边界：存在性证明，而非可行性度量

把三项基准作者自述的局限合起来看，当前证据需要克制地解读。ASPIRE 的 1/30 不能当作通用自进化成功率——实验反复查询同一固定评测切片的汇总分，保留的高分版本未经独立确认集检验；HarnessDev 各配置只有一条轨迹，隐藏评测只覆盖 SWE-Pro，且「让新系统充当下一轮开发环境」的递归过程未验证。三项合看，它们证明的是闭环各环节都能独立失败（存在性证明），而非端到端 RSI 的可行性。真正悬而未决的问题在链条之外：当三项产出的目标、经验与系统真正首尾相接，系统能否连续多轮可靠进步、错误是否累积——这要由下一代实验回答。

## 实践启示

1. **把「目标与验证构造」当一级评测对象。** 搭自改进管线时不要只报告训练后的分数，要像 ASPIRE 一样记录 Agent 自选的数据、自构的验证是否对应真实短板；目标选择的失败常先于训练失败出现。
2. **任何自我改进系统都保留隐藏 held-out 评测。** 可见反馈涨而隐藏任务降，是三项工作反复出现的模式；没有独立于自我判断的检查集，「Agent 认为的进步」无法与真实变化区分。
3. **记忆按经验类型分流写回。** 策略型经验走摘要/技能层，精确状态依赖型经验保留原始记录或专用索引；避免单一摘要机制通吃，也避免把可丢弃的记忆错误写进不可逆权重。
4. **Harness 改动要版本化、可回滚。** HarnessDev 能把失败定位到具体改动（消息清理破坏工具返回、上下文压缩破坏消息配对），前提是每次修改冻结成版本并留存运行记录；没有回滚机制时，一次坏改动会污染所有后续轮次。
5. **用三段切分归因诊断自己的 Agent。** 「自我改进没起作用」时，先区分失败在目标选择（ASPIRE 段）、经验学习（S³Gym 段）还是改进留存（HarnessDev 段），三段修法完全不同。
6. **以迁移而非单次交付论能力。** FDE 类比的要点是把经过验证的方法用于后续项目：分数只是 proxy，改进是否算能力，要看它是否改善下一轮的工作与学习。

## 关联

- 上位概念：[AI 自我改进与自举](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/ai-self-improvement-bootstrapping.md)、[Agent 自我改进循环](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-self-improvement-loops.md)
- 同族工作：[AI4AI 综述（RSI 组成缺口）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai4ai-survey-composition-gap-recursive-self-improvement-2026.md)、[自我改进六机制](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-self-improvement-six-mechanisms.md)、[nanoGPT 的 RSI 实验](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-recursive-self-improvement-nanogpt-prime-intellect.md)、[AIDE² 递归自我改进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aide2-recursive-self-improvement-weco-2026.md)
- 评测与 Harness：[评测 Harness 设计](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/evaluation-harness-design.md)、[Agent 评测基准框架](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-evaluation-benchmark-frameworks.md)、[Harness 工程范式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-harness-engineering-paradigm.md)

---

→ [原文存档](https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247722940&idx=1&sn=326aae715e20ec5b1642b6b4474a5322)

---

