# LLaDA2.2：全球首个大规模 Agentic 扩散模型（边行动边纠错，128K 上下文）

## Ch04.809 LLaDA2.2：全球首个大规模 Agentic 扩散模型（边行动边纠错，128K 上下文）

> 📊 Level ⭐⭐⭐ | 2.6KB | `entities/全球首个agentic扩散模型来了边行动边纠错128k上下文追平自回归.md`

# LLaDA2.2：全球首个大规模 Agentic 扩散模型（边行动边纠错，128K 上下文）

## 核心：扩散模型首次进入智能体长程任务

蚂蚁集团 inclusionAI 团队推出 **LLaDA2.2**：千亿参数的 MoE 扩散语言模型，原生支持 128K 上下文，是全球首个大规模 Agentic 扩散模型。自回归模型（ChatGPT、Claude 等）统治 Agent 赛道多年，逐 Token 生成慢但具备序列因果性；LLaDA2.2 证明扩散模型也能承担 Agent 任务——不仅能并行生成，还能在生成过程中**自我增删、动态修正**。

## 三代演进：扩散架构从生成工具到行动架构

从 2.0 时期的规模化尝试，到 2.1 版本的边写边改，再到 2.2 的智能体觉醒，半年时间三代模型完成扩散架构从生成工具到行动架构的递进。LLaDA2.2 第一次将 **Levenshtein 编辑、面向环境反馈的强化学习、长上下文工程架构**整合进同一套扩散模型 Agent 系统。

## 为什么扩散 Agent 难：序列因果性与错误固化

Agent 场景中输出要被真实执行，再小的 bug 也会影响整个流程，"一步错步步错"，错误会在后续交互中被持续固化成硬约束，最终导致整体目标漂移。传统扩散模型可以同时处理一个 block 中的多个位置，速度比自回归快，但 Token 之间缺乏严格的序列条件约束——这正是 LLaDA2.2 要解决的核心矛盾。

## 与 Wiki 现有知识的关联

- 扩散模型架构：[扩散模型架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/diffusion-model-architecture.md)
- 扩散语言模型推理：[ACL 2026 扩散 LM block size 推理](../ch01/360-acl-2026.html)
- Agentic 扩散视频：[A2RD Agentic 扩散长视频](ch04/725-agentic.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/全球首个agentic扩散模型来了边行动边纠错128k上下文追平自回归.md)

---

