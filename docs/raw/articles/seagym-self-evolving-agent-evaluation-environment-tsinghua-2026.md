---
sha256: fc899171f340007224b5268e31b2311e5cae1899568e5b71efa5a252822835cb
source: wechat
source_url: https://mp.weixin.qq.com/s/_9KACIPUZhPYfqvhpffzVQ
ingested: 2026-07-15
feed_name: 机器之心
wechat_mp_fakeid: MP_WXS_3073282833
source_published: 2026-07-15
---

# 翁荔长文谈Harness自进化：Agent越用越强，评测难点怎么破？

机器之心发布

近日，翁荔发布长文 《Harness Engineering for Self-Improvement》，系统梳理了 harness engineering 在 AI 自我改进中的作用。她指出，原始模型与真实世界任务之间的 harness layer 正在变得和模型本身一样重要：它决定模型如何规划、调用工具、管理上下文、保存状态、评估结果，并在长期任务中持续迭代。

这也揭示了当下 LLM Agent 研究中的一个关键转向：Agent 的能力提升不再只来自模型参数更新，也越来越来自模型外部系统的演化。Prompt、memory、tools、workflow、middleware、permission control、runtime state 等组件共同构成 agent harness，而这些组件正在成为自进化系统的核心优化对象。

但随之而来的问题是：如果 Agent 会不断修改自己的 harness，我们应该如何评测这种「自我改进」？

现有 Agent benchmark 大多仍然面向静态系统：给定一个固定 Agent，在一组独立任务上运行，然后报告最终成功率。这种评测方式无法回答 harness evolution 中更关键的问题：一次更新到底改进了什么？提升是否能迁移到未见任务？是否只是过拟合近期反馈？是否遗忘了旧能力？是否引入了更高成本或运行时不稳定？

针对这一评测空白，清华大学团队提出了 SEAGym: An Evaluation Environment for Self-Evolving LLM Agents。

如果说 harness engineering 正在成为自进化 Agent 的重要技术路线，那么 SEAGym 关注的就是这条路线的评测基础设施：不只评估 Agent 最终得了多少分，而是评估它在更新过程中如何变强、何时退化、是否泛化、是否遗忘，以及付出了什么成本。

* 论文标题：SEAGym: An Evaluation Environment for Self-Evolving LLM Agents
* 论文地址：https://arxiv.org/abs/2606.17546
* 代码地址：https://github.com/antropy-research/SEAGym

从静态 benchmark 到动态自进化环境

SEAGym 将自进化 Agent 形式化为一个和强化学习算法训练过程对齐的评测过程。

每个 Agent snapshot 被表示为 (M, H)，其中 M 是固定的基础模型和不可变运行组件，H 是可更新的 harness state，包括 prompts、memories、skills、tools、middleware、runtime configuration 等。

在每一步中，环境采样一批训练任务，Agent 在这些任务上执行，产生轨迹和反馈，然后根据自身的更新规则修改 harness：H' = update(H, trajectories, feedback)。

这里，SEAGym 并不规定具体的更新算法。不同自进化方法可以保留自己的 native update rule，只需要通过统一的 rollout/update interface 接入即可。

这种设计使得 SEAGym 可以在同一套协议下比较不同类型的自进化方法，例如：ACE（主要积累 prompt-visible skillbook 或过程经验）；TF-GRPO（利用 grouped rollout evidence 更新 experience/context store）；AHE（直接编辑更广义的 agent harness，包括 prompts、tools、middleware 和 runtime 行为）。

通过将 agent 自进化过程与强化学习算法训练过程对齐，SEAGym 能够将静态的 benchmark 通过 train batch 组织为自进化过程中的某个任务，并且利用 harbor 实现了对不同类型的 benchmark 的适配兼容，将复杂的 agent 自进化过程统一用简洁清晰的超参数控制，为后续自进化 agent 研究提供了统一的训练评测协议。

多视角评测：不只问「有没有变强」，还问「怎样变强」

SEAGym 的关键设计是将传统数据 split 与评测 view 区分开来。训练任务只用于产生更新证据，评测视角则被拆分为多个部分：

* Train batch：提供 Agent 更新所需的轨迹和反馈；
* Update-validation：冻结中间 snapshot，观察更新过程是否带来阶段性提升；
* ID transfer：测试更新是否能迁移到同分布但未见过的任务；
* OOD transfer：测试更新是否能迁移到分布外任务；
* Replay：回放旧任务，检查是否出现遗忘或回归；
* Cost records：记录 token、工具调用、运行时间和更新成本。

这使得研究者可以看到自进化过程中的细粒度动态。例如，一个 snapshot 可能在 validation 上提升，但在 OOD 上下降；一个中间版本可能短暂变强，之后因为错误的 middleware 修改而崩溃；一个最终版本可能整体得分更高，但同时遗忘了一部分原本能解决的任务。

SEAGym 不只是输出一个 leaderboard 分数，而是保存每个阶段的 snapshot、trajectory、public feedback、update summary、harness diff 和 metric records，用于后续诊断。

实验设置：Terminal-Bench 2.0 + HLE

论文在两个互补任务源上实例化 SEAGym：
* Terminal-Bench 2.0：偏 execution-heavy，包含命令行、软件工程和环境交互任务；
* HLE：偏 reasoning-heavy，论文使用其中 text-only Math/Physics 作为 source task，并使用 CS/AI 与 Engineering 作为 OOD transfer task。

论文比较了 ACE、TF-GRPO 和 AHE 三类自进化方法，并进一步做了 batch size、source diversity 和 cross-model transfer 等分析。

主要结果一：validation 提升不等于稳定泛化

在主实验中，三种方法呈现出明显不同的更新动态。

AHE 在 validation、ID 和 OOD 三个视角上都取得了提升：
* validation：40.0 -> 57.1，提升 17.1 个百分点；
* ID test：40.0 -> 49.1，提升 9.1 个百分点；
* OOD test：22.5 -> 28.8，提升 6.3 个百分点。

ACE 的提升更温和：
* validation 提升 2.9 个百分点；
* ID 提升 1.3 个百分点；
* OOD 提升 0.1 个百分点。

TF-GRPO 在 validation 上有一定提升（40.0 -> 46.5），但 OOD 反而下降 0.1 个百分点。

关键结论：只在 validation 上提升是不够的。如果更新只提升了分布内性能但没有改善甚至恶化了泛化能力，这种「自进化」的质量需要审慎评估。

主要结果二：batch 多样性 > batch 大小

独立的 batch 实验中，使用 10 个高多样性任务（10 diverse）的设定在 ID 和 OOD 上均达到最佳，而使用 20 个低多样性任务（20 less diverse）的表现反而更差。这说明在自进化场景中，不是「练得越多就越好」，而是「练得越广越好」。

SEAGym 的包管理器

SEAGym 提出了 harbor 包管理器概念，相当于 apt-get install 各类 benchmark，将 Term-Bench、HLE、SWE-bench 等包统一声明/注册并一键运行。这使得研究者可以快速将新 benchmark 接入自进化评测框架。
