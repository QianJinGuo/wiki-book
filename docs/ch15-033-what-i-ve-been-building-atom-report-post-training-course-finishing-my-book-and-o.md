## Ch15.033 What I've been building: ATOM Report, post-training course, finishing my book, and ongoing research

> 📊 Level ⭐⭐⭐⭐ | 7.0KB | `entities/what-ive-been-building-atom-report-post-training-course-fini.md`

# What I've been building: ATOM Report, post-training course, finishing my book, and ongoing research

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/what-ive-been-building-atom-report-post-training-course-fini.md)

## 摘要

Nathan Lambert（Interconnects 博客作者、RLHF 领域的权威声音）汇总了近期的四项重要产出：(1) ATOM Report——开源语言模型生态的最新技术报告，包含更新的 RAM（Relative Adoption Metric）评分体系；(2) RLHF Book——已交付印刷，可预购；(3) Post-training 课程——配套书籍的免费视频讲座系列；(4) 近期技术研究——包括多轮对话能力差距和元强化学习在 agentic search 中的应用。

## 核心要点

1. **ATOM Report 与 RAM 评分体系** — ATOM Project 发布了更新的技术报告，核心贡献是 RAM（Relative Adoption Metric），一个时间变化、模型大小归一化的开源模型采用度评分。RAM > 1 表示该模型在其尺寸类别中有望进入历史 Top 10 下载量。报告覆盖了 GPT-OSS 的崛起、推理市场份额、中国中型玩家（Moonshot、Z.ai、MiniMax）的影响力等。

2. **RLHF Book 完成交付** — 《The RLHF Book》已进入 Manning 生产流程，内容编辑完成，约 2 个月后印刷。可在 Amazon 或 Manning 预购。这本书定位为"post-training 领域从入门到精通"的权威参考。

3. **Post-training 视频课程** — 配套书籍的免费 YouTube 讲座系列，涵盖 RLHF 概览、IFT 与 Reward Modeling、策略梯度算法、RL 算法实现等主题。课程目标是将书籍从"单一资源"扩展为"完整学习体验"。

4. **TurnWise: 多轮对话能力差距** — Graf et al. 2026 的研究探索了各模型在多轮对话中的表现差异，以及如何创建训练数据来改善多轮能力。Lambert 的兴趣已完全转向 agent，认为多轮交互是一个重要的用户界面问题。

5. **元强化学习用于 Agentic Search** — Xiao et al. 2026 将 RLVR（Reinforcement Learning with Verifiable Rewards）中解决难题的过程框架化为元学习问题：利用之前尝试的上下文来指导未来的 rollout。这解决了当前 LLM RL 中"模型从近期试验的参数中学习，但从不在上下文中学习"的局限。

## 深度分析

### ATOM Report：开源模型生态的度量基础设施

RAM 评分体系的核心创新在于解决了开源模型采用度比较中的两个难题：**时间归一化**（模型发布后不同时间点的下载量差异巨大）和**大小归一化**（7B 模型和 70B 模型的绝对下载量不可直接比较）。通过将这两个维度标准化，RAM 提供了一个"一目了然"的数字来判断一个模型是否在走红。

这与 ATOM Project 的整体目标一致：为开源模型生态建立可量化的评估基础设施，帮助政策制定者和投资者理解开源 AI 的发展态势。报告中关于中国中型玩家（Moonshot、Z.ai、MiniMax）的分析尤其有价值，填补了英语世界对中国开源模型生态认知的空白。

### RLHF Book：Post-training 领域的知识沉淀

Lambert 的 RLHF Book 填补了 post-training 领域的一个关键空白——在此之前，没有一本系统性的教材覆盖从 reward modeling 到 RL fine-tuning 的完整知识体系。书籍配合免费课程和开源代码的"三位一体"模式，降低了 post-training 技术的学习门槛。

这与 RLHF 和 Post-training 在实际工程中的重要性形成呼应——随着预训练模型能力趋同，post-training 正在成为模型差异化的核心战场。

### 多轮对话与 Agent 的交叉点

TurnWise 研究揭示了一个关键问题：**大多数模型在多轮对话中的能力显著弱于单轮**。这不是简单的"上下文遗忘"问题，而是涉及到模型如何在对话过程中积累和利用信息。

Lambert 将此与 Agent 场景直接关联：在 Agent 执行多步任务的过程中，每一轮交互都是一个"多轮对话回合"。如果模型在多轮场景下能力下降，Agent 的任务完成率就会受到影响。这与 Agent 记忆系统 的研究方向高度相关。

### 元学习视角下的 RL 优化

Meta-RL with Self-Reflection 的核心洞察是：当前 LLM 的 RL 训练完全是 on-policy 的——模型从近期试验的参数更新中学习，但不会从之前尝试的上下文中学习。这在解决复杂问题时是低效的：模型每次都要从零开始探索，而非利用之前的成功和失败经验。

这与人类解决问题的方式形成对比——我们会记住"上次试过这个方法不行"并避免重复犯错。将这种能力引入 LLM 的 RL 训练，可能是提升 agent 任务完成率的关键路径之一。

## 实践启示

- **关注 RAM 评分**：RAM 提供了一个标准化的框架来评估新发布的开源模型的采用趋势，可以作为技术选型的参考指标
- **系统学习 Post-training**：RLHF Book + 课程是当前最完整的 post-training 学习资源，适合有 ML 基础但刚进入 LLM post-training 领域的工程师
- **多轮能力评估**：在评估模型的 agent 适用性时，除了单轮 benchmark，需要特别关注多轮对话和多步任务场景下的表现
- **元学习 + RL 的结合**：关注 meta-RL 和 self-reflection 在 LLM 训练中的应用，这可能是下一代 agent 能力提升的关键技术路径
- **开源模型生态**：中国中型玩家的快速崛起值得关注，RAM 数据为跟踪这一趋势提供了量化工具

## 相关实体

- ATOM Report
- RLHF
- [Post-training](ch01-232-three-years-from-gpt-3-to-gemini-3.html)
- [Agent 记忆系统](ch04-073-agent.html)
- [Karpathy: Agentic Engineering](ch04-070-agent-harness-engineering-a-survey.html)
- MOC: Evaluation Landscape

---
