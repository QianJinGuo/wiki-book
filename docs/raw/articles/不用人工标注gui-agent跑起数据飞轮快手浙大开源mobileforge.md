---
source: wechat
source_url: https://mp.weixin.qq.com/s/la86XLaDIwOB2mHHbl0oDQ
ingested: 2026-07-09
feed_name: 机器之心
wechat_mp_fakeid: MP_WXS_3073282833
source_published: 2026-07-09
sha256: 606c04fab8251cb1d656fab060c7c5daa70b3eeb021cfa91ad28e0f1051d52b2
---

# 不用人工标注，GUI Agent跑起「数据飞轮」：快手、浙大开源MobileForge

大模型驱动的手机 GUI Agent 已经能够理解屏幕、点击按钮、输入文本并完成一系列移动端任务。但一旦进入真实应用场景，一个核心问题就会暴露出来：手机 App 数量庞大、更新频繁，功能和界面变化很快。如果每适配一个 App 都要人工编写任务、录制专家轨迹、标注奖励信号，那么成本会迅速失控。

  


来自浙江大学 APRIL 实验室、快手主站技术部和清华大学的研究团队提出了 MobileForge，试图把手机 GUI Agent 的适配过程变成一个 “无标注、自探索、自反馈、自优化” 的闭环系统。

  


论文题为 MobileForge: Annotation-Free Adaptation for Mobile GUI Agents with Hierarchical Feedback-Guided Policy Optimization。它的核心思路可以概括为一句话：让 Agent 在真实目标 App 中探索功能、自动生成可执行任务、对自己的执行过程进行分层评估，再把这些反馈转化为可训练的策略优化信号。

  


在实验中，仅使用自动生成的无标注适配数据，MobileForge 将通用视觉语言模型 Qwen3-VL-8B 在 AndroidWorld 上的 Pass@3 提升至 67.2%，接近闭源数据训练的 GUI 专用基础模型 GUI-Owl-1.5-8B 的 69.0%。进一步地，基于 GUI-Owl-1.5-8B 适配得到的 ForgeOwl-8B 在 AndroidWorld 上达到 77.6% Pass@3，并在未参与训练的 MobileWorld GUI-only 任务上取得 41.0% 成功率。

  


论文 Figure 1：AndroidWorld scaling 趋势、域内适配结果和 MobileWorld 跨域泛化结果

  


论文的共同第一作者为浙江大学 APRIL 实验室的博士生刘广义、硕士生赵鹏翔、硕士生吴高和清华大学博士生殷翊文，通讯作者为浙江大学刘勇教授。MobileForge 全链路开源，代码、数据、模型、训练 / 评测 pipeline 都已开放。

  


  


  * 论文：https://arxiv.org/abs/2606.19930

  * 项目主页：https://mobile-forge.github.io/

  * Github：https://github.com/kwai/MobileForge

  * Huggingface Daily Paper：https://huggingface.co/papers/2606.19930

  * MobileForge 全链路数据：https://huggingface.co/collections/lgy0404/mobileforge-datasets

  * MobileForge 全链路模型：https://huggingface.co/collections/lgy0404/mobileforge-models

  


手机 GUI Agent 的瓶颈：不是不会点，而是不会适应

  


过去一年，GUI Agent 研究进展很快。从网页、桌面到手机，越来越多模型可以根据截图和任务描述执行点击、滑动、输入、返回、打开应用等操作。但移动端有其特殊困难。

  


首先，移动 App 生态极其碎片化。不同 App 的页面结构、功能入口、交互逻辑差异很大；即便是同一个 App，版本更新后也可能改变按钮位置、菜单层级和任务流程。

  


其次，移动端任务往往是长链路的。一个任务可能需要打开应用、进入某个页面、搜索、筛选、选择条目、确认操作，甚至跨多个 App 传递信息。只给最终成功 / 失败的稀疏奖励，很难判断到底是哪一步出了问题。

  


第三，已有 “无标注” GUI 学习方法虽然减少了人工数据依赖，但通常仍存在两个断点：探索、任务生成、执行和反馈没有形成统一底座；策略优化时，模型往往只把一次 rollout 当成孤立样本，依赖粗粒度奖励，难以从失败轨迹中的正确局部动作中学习。

  


论文 Figure 2：已有方法的两个瓶颈以及 MobileForge 的解决思路

  


MobileForge 正是围绕这两个问题设计的。

  


研究团队提出的问题是：能否构建一个不依赖人工任务、专家示范或奖励标签的手机 GUI Agent 适配系统，让任务生成来自目标 App 真实交互，让反馈足够细粒度，并把 Agent 自己采集到的经验转化为可优化的策略信号？

  


MobileForge = MobileGym + HiFPO

  


MobileForge 由两个耦合组件组成：

  


一是 MobileGym，MobileGym 是交互与评估底座。它在目标 App 中探索可达状态，基于真实交互轨迹挖掘可执行任务，并对 Agent 的完整执行过程进行细粒度分层评估。

  


二是 HiFPO，全称为 Hierarchical Feedback-Guided Policy Optimization，即层级反馈引导的策略优化。它负责调度多次尝试、复用前一次失败得到的纠错提示、筛选有价值任务和步骤，并最终用 hint-contextualized step-level GRPO 更新模型。

  


Figure 3：MobileForge 总体流程

  


可以把 MobileForge 看成一条从 “真实 App 交互” 到 “策略更新” 的自动流水线：

  


目标 App 探索 → 任务课程生成 → 多次 rollout → 分层评估 → 任务 / 轨迹 / 步骤过滤 → 带纠错提示的 GRPO 训练。

  


这条链路中没有人工编写任务，也没有专家演示或人工奖励标签。

  


MobileGym：先在真实 App 中找到 “能学什么”

  


MobileGym 解决的是数据来源问题：没有人工任务和示范，Agent 到底应该学什么？

  


它包含三个关键阶段。

  


第一是目标 App 探索。MobileForge 会直接进入目标 App，结合 APK 中声明的 activity 等结构信息和当前截图，生成面向功能的探索目标。探索过程采用类似深度优先遍历的方式，当需要从某个父状态分支到新目标时，系统会恢复父状态并继续探索。

  


这里的探索轨迹并不被当作专家示范。它的作用是发现真实 App 中可达的页面、可操作的控件和实际存在的功能，避免模型凭空幻想某个 App 应该支持什么。

  


每个被探索到的状态转移都会记录操作前后截图、执行动作、目标元素、执行元数据和自然语言摘要。这些记录组成证据池，用于后续任务生成。

  


第二是 MobileGym-Curriculum。它会把探索证据转化为可执行任务。对每条探索轨迹，系统首先判断这段行为是否连贯、原本目标是否完成，然后围绕同一 App 功能生成多个任务变体。

  


论文中将一个生成任务表示为五元组：任务指令、预估步数预算、核心功能、变化类型和前置条件。这个 schema 很轻量，重点不在形式复杂，而在于每个任务都必须锚定到真实观察到的 App 行为。

  


第三是 MobileGym-Critic。它不是训练一个奖励模型，而是用 agentic hierarchical evaluator 对完整 rollout 进行分层评估。给定一次任务执行，Critic 会输出三类反馈：轨迹级 outcome label、步骤级 process label，以及纠错 hint。

  


轨迹级标签回答 “任务最终是否完成”；步骤级标签回答 “每一步是否合理，为什么合理或不合理”；纠错提示则总结失败原因、要避免的行为、建议的替代策略和关键任务洞察。

  


Figure 4：移动端 GUI Agent 无标注适配基座 MobileGym

  


这套分层反馈非常关键。传统做法往往把一次 rollout 简化成成功或失败，但在长链路手机任务中，失败轨迹也可能包含正确的局部步骤，成功轨迹中也可能有冗余甚至偶然动作。MobileGym-Critic 的作用，就是把这些信息拆开。

  


HiFPO：把 “失败经验” 变成训练信号

  


如果说 MobileGym 负责产生任务和反馈，那么 HiFPO 负责把反馈变成策略更新。

  


论文 Figure 5：HiFPO 流程图

  


它的第一步是带提示的多次尝试。对于每个任务，HiFPO 会让当前策略连续尝试 K 次。第一次尝试没有额外提示；如果失败或出现不合理步骤，MobileGym-Critic 会生成纠错 hint。第二次尝试时，这些 hint 会被追加到任务指令中，帮助模型避免重复犯错。

  


换句话说，Agent 不是简单地多采样几次，而是在同一个任务上积累经验。前一次失败会变成下一次尝试的上下文。

  


论文 Figure 6：纠错提示改善 rollout 的案例

  


第二步是任务过滤。HiFPO 会计算同一任务多次尝试的经验成功率 SR (x)。如果一个任务所有尝试都成功，说明当前策略已经掌握，训练价值不大，因此被移除。相反，全失败任务和部分成功任务都会保留。

  


这和很多直觉不同。MobileForge 并不会简单丢弃失败任务，因为失败轨迹中可能包含正确的打开 App、导航、搜索或识别步骤。只要步骤级反馈能够把合理动作挑出来，失败也能转化成有效学习材料。

  


第三步是轨迹与步骤选择。对于保留下来的任务，如果存在成功轨迹，系统会选择步骤质量最高的成功轨迹；如果全部失败，则选择局部合理步骤比例最高的失败轨迹。随后，训练集只保留被 Critic 判定为合理的局部步骤。

  


这样，长链路轨迹被拆成了密集的 step-level 训练样本，同时避免把失败轨迹中的错误动作也强化进去。

  


第四步是 hint-contextualized step-level GRPO。这里 HiFPO 并没有发明一个全新的优化器，而是改造了 GRPO 的使用状态。每个 step-level 样本都包含任务、截图、交互历史，以及当时可用的纠错提示。模型在同一个带 hint 的状态下采样多个候选动作，再用规则化 GUI action reward 进行组内比较。

  


实验设置：AndroidWorld 域内适配，MobileWorld 跨域测试

  


实验包括两个基准。

  


AndroidWorld 是域内设置。MobileForge 在 AndroidWorld App 生态中探索、生成任务、收集 rollout 并训练，最终在 116 个 AndroidWorld 任务上评测 Pass@1、Pass@2 和 Pass@3。

  


MobileWorld GUI-only 是域外设置。论文在其 117 任务划分上进行测试，但训练过程中不使用任何 MobileWorld rollout、任务或反馈。

  


基础模型包括两个 8B 规模 instruct agent：通用模型 Qwen3-VL-8B 和 GUI 专用模型 GUI-Owl-1.5-8B。

  


MobileForge 一共生成了 3249 个 AndroidWorld 侧候选任务，这些任务来自 20 个 App、527 个源轨迹标识。为了研究扩展效果，论文分别使用 200、400 和 900 个任务子集训练。

  


结果一：通用 8B 模型接近闭源数据 GUI 专用基座

  


论文 Table 1：AndroidWorld 域内适配与 scaling 结果

  


在 AndroidWorld 上，Qwen3-VL-8B 基线的 Pass@3 为 55.2%。经过 900 个自动生成任务适配后，ForgeQwen3-8B 的 Pass@3 提升到 67.2%，Pass@1 从 40.5% 提升到 50.9%，Pass@2 从 49.1% 提升到 60.3%。

  


这使得一个通用 VLM 在 AndroidWorld 上接近 GUI-Owl-1.5-8B 基座的 69.0% Pass@3。考虑到 MobileForge 不使用人工任务、专家演示或人工奖励标签，这个结果说明真实 App 交互中的无标注反馈确实可以转化为有效能力提升。

  


更强的 GUI 专用模型也能继续受益。GUI-Owl-1.5-8B 基线在 AndroidWorld 上的 Pass@3 为 69.0%；经过 MobileForge 适配后，ForgeOwl-8B 达到 77.6% Pass@3，Pass@1 也从 56.0% 提升到 67.2%。

  


从任务难度看，MobileForge 对 easy 和 medium 任务提升稳定；在 GUI-Owl-1.5-8B 上，hard 任务单次成功率也从 19.3% 提升到 29.8%。

  


结果二：只用 AndroidWorld 适配，也能迁移到 MobileWorld

  


论文 Table 2：MobileWorld GUI-only 跨域泛化结果

  


跨域测试更能说明适配是否只是 “记住了训练 App”。论文在 MobileWorld GUI-only 上评估时，没有使用任何 MobileWorld 任务、轨迹或反馈进行训练。

  


结果显示，ForgeOwl-8B 在 MobileWorld GUI-only 117 任务划分上达到 41.0% 成功率，高于 GUI-Owl-1.5-8B 基线的 37.6%，也超过论文比较范围内的多个 open-data mobile GUI agent。ForgeQwen3-8B 从 Qwen3-VL-8B 的 7.6% 提升到 10.3%，提升幅度较小，但仍有正向迁移。

  


这也揭示了一个现实问题：跨域泛化不仅依赖适配算法，也强烈依赖基础模型本身的手机 GUI 能力。MobileForge 可以让已有能力进一步组织和强化，但如果基座对移动 UI 的理解较弱，迁移收益也会受限。

  


消融实验：MobileForge 的数据飞轮到底靠什么转起来？

  


论文做了多组消融，分别验证纠错提示、训练目标、任务过滤、评价器选择和课程生成方式的作用。

  


首先是纠错提示。使用 Qwen3-VL-8B 在 200 个生成任务上做 rollout，如果不加入前一次失败的 hint，多次尝试总成功率为 52.0%；加入纠错提示后，总成功率提升到 77.0%。Pass@3 也从 49.0% 提升到 72.5%，平均每次尝试步数从 18.4 降到 17.2。

  


论文 Table 3：纠错提示 rollout 消融

  


这说明，多次尝试之所以有效，并不是因为模型随机采样更多，而是因为反馈在同一任务的多次尝试之间累积起来，形成了可复用经验。

  


其次是训练目标。论文比较了 no-hint SFT、hint SFT 和 hint-contextualized GRPO。结果显示，no-hint SFT 效果较弱，甚至可能低于基线；加入 hint 后 SFT 有提升，但带 hint 上下文的 GRPO 在 200 和 900 任务设置下都最好。900 任务时，hint-contextualized GRPO 达到 50.9% AndroidWorld Pass@1。

  


论文 Table 4：训练目标消融

  


第三是任务过滤。论文发现，最佳策略并不是去掉失败任务，而是去掉当前模型已经全部成功的 mastered tasks，保留全失败和部分成功任务，再用步骤级反馈从中恢复合理局部动作。对应的成功率范围是 [0.0, 0.9]。

  


论文 Table 5：任务级成功率过滤消融

  


第四是评价器模型。MobileGym-Critic 中 final-decision model 使用 Gemini 2.5 Pro 时结果最好，但即便换成 Qwen3-VL-8B 作为决策模型，仍能把基线 Pass@1 从 40.5% 提升到 44.8%，Pass@3 从 55.2% 提升到 60.3%。这说明 MobileForge 的反馈到优化闭环并不完全依赖某个特定闭源评价器。

  


论文 Table 6：MobileGym-Critic 模型消融

  


第五是课程 grounding。以 Broccoli 任务为例，只基于 landing screen 生成任务会过度集中在菜谱创建、编辑和删除等首页可见功能上，其中菜谱删除占 27.3%。而基于探索轨迹的 MobileGym-Curriculum 能覆盖购物清单、烹饪助手、膳食计划、设置、媒体分享等更广泛功能。

  


论文 Table 7：不同的任务挖掘方法功能覆盖对比（以 Broccoli 为例）

  


案例：学会在重复 UI 流程中保持任务意图

  


论文给出了一个 AndroidWorld 案例：任务要求在 Pro Expense 中删除三项支出，分别是 Streaming Services、Unexpected Expenses 和 Pet Supplies。

  


基础 Qwen3-VL-8B 能进入删除确认流程，但在删除早期项目后丢失任务流，反复打开和关闭侧边栏，无法继续完成剩余删除。经过 MobileForge 适配后，ForgeQwen3-8B 能沿着同一 App 的删除模式连续处理多个项目，最终完成全部删除。

  


论文 Figure 7：AndroidWorld ExpenseDeleteMultiple2 案例对比

  


这个案例很典型。MobileForge 提升的并不是单次点击能力，而是在 App 特定流程中保持任务意图、复用操作模式、避免重复错误的能力。

  


论文还做了 tag-wise failure-rate reduction 分析。结果显示，MobileForge 在 verification、search、complex UI、screen reading、repetition、information retrieval 等与 App grounding 强相关的能力上提升明显。与此同时，game-playing、multi-app、memorization、math-counting 等任务仍然较难，说明当前系统在长程状态、跨 App 协调和非标准任务规则方面还有改进空间。

  


论文 Figure 8：AndroidWorld 不同任务标签下失败率下降热力图

  


结语

  


MobileForge 提出的不只是一种无标注适配方法，更是一套面向 GUI Agent 的数据飞轮：Agent 在真实 App 中探索功能，MobileGym 将交互轨迹转化为任务和层级反馈，HiFPO 再把成功、失败与纠错提示沉淀为 step-level 策略更新信号。

  


在这套闭环里，数据不再依赖人工写任务、录演示、标奖励，而是来自 Agent 与目标 App 的持续交互。每一次尝试、失败和修正，都有机会成为下一轮优化的燃料。

  


这也意味着，手机 GUI Agent 的进化路径正在从 “依赖静态数据集训练”，转向 “在动态 App 生态中自探索、自反馈、自优化”。MobileForge 让这条无标注数据飞轮真正转了起来。

  


  


© THE END

转载请联系本公众号获得授权

投稿或寻求报道：liyazhou@jiqizhixin.com
