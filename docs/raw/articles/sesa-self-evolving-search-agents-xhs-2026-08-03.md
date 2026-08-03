---
source_url: "https://www.xiaohongshu.com/explore/6a704b0500000000320210f1?xsec_source=app_share&xsec_token=CBjhtLDgr4aGkqF4rKYaATYc4Ex8tJDFkVS8gXNcCKMmY="
source_author: "kuailexuexi"
source_title: "让Agent从失败中持续进化🚀（SESA：Self-Evolving Search Agents）"
source_date: "2026-08-03"
source_publication: "小红书（第一方作者发布）"
ingested: "2026-08-03"
sha256: "1b2e403e91ebaa9c9637b133cd5421c2cb913f275168e5e5157e3773d23b1a15"
---

让Agent从失败中持续进化🚀

最近，我们完成了一项关于 Self-Evolving Search Agent 的新工作：

**Self-Play Meets Skill Evolution: Self-Evolving Search Agents that Pose, Solve, and Remember**

现有的 Self-Play Agent 可以自己出题、自己解题，但训练过程中遇到的失败，往往只产生一次梯度更新，之后就被"忘掉"了。

于是我们提出了 **SESA（Self-Evolving Skill-Augmented Agent）**，让搜索智能体真正做到：自己出题、自己解题、从失败中总结经验，并把经验用于下一轮进化。

SESA 会将有价值的失败轨迹提炼成可复用的 **Skill Card**，存入持续更新的 **Skill Bank**。随着 Solver 学会更多技能，Proposer 也会继续生成更困难的问题，从而形成：

**失败 → 技能 → 能力提升 → 更难问题 → 新失败** 的闭环自进化过程。

在 7 个开放域和多跳问答 Benchmark 上，SESA 相比 Search Self-Play 平均提升 1.2～3.2 个点；即使推理时关闭 Skill Bank，模型依然能够保留大部分能力增益，说明这些技能不仅是提示词，而是真正参与并影响了模型训练。

一句话概括：我们希望 Agent 不只是从失败中更新一次参数，而是能够记住失败、总结技能，并主动决定下一步应该练习什么。

论文和代码均已公开，欢迎大家交流讨论，也欢迎 Star ⭐️！

- https://github.com/Zenghuang-Fu/SESA-Self-Evolving-Search-Agents
- https://arxiv.org/abs/2607.29468

#大模型 #LLMAgent #智能体 #强化学习 #SelfPlay #DeepResearch #AI科研 #论文分享 #人工智能 #搜索智能体
