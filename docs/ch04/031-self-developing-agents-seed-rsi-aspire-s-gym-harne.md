# Self-Developing Agents：字节 Seed 三项 RSI 基准（ASPIRE / S³Gym / HarnessDev）

> 📊 Level ⭐⭐ | 8.6KB

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

## 关联

- 上位概念：[AI 自我改进与自举](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/ai-self-improvement-bootstrapping.md)、[Agent 自我改进循环](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-self-improvement-loops.md)
- 同族工作：[AI4AI 综述（RSI 组成缺口）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai4ai-survey-composition-gap-recursive-self-improvement-2026.md)、[自我改进六机制](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-self-improvement-six-mechanisms.md)、[nanoGPT 的 RSI 实验](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-recursive-self-improvement-nanogpt-prime-intellect.md)、[AIDE² 递归自我改进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aide2-recursive-self-improvement-weco-2026.md)
- 评测与 Harness：[评测 Harness 设计](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/evaluation-harness-design.md)、[Agent 评测基准框架](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-evaluation-benchmark-frameworks.md)、[Harness 工程范式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-harness-engineering-paradigm.md)

---

→ [原文存档](https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247722940&idx=1&sn=326aae715e20ec5b1642b6b4474a5322)

---

