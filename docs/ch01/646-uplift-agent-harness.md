# 高德 Uplift 模型迭代 Agent：长时间运行 Harness

> 📊 Level ⭐⭐ | 3.2KB | `entities/gaode-uplift-model-iteration-agent-long-running-harness.md`

# Gaode Uplift Model Iteration Agent Long Running Harness

## 相关实体

- [xz, two years on: what scanners still cannot catch](458-xz.html)
- [一个 mission 跑 16 天、烧 7.78 亿 token：factory 公开了多 agent 系统的构建哲学](../ch03/004-agent.html)
- [gemma 4 and what makes an open model succeed](454-gemma-4-and-what-makes-an-open-model-succeed.html)
- [model-harness-fit-agent-harness](191-model-harness-fit-agent.html)
- [what i’ve been building: atom report, post-training course,](../ch04/135-ai.html)
→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/gaode-uplift-model-iteration-agent-long-running-harness.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/data-infrastructure.md)
## 深度分析

Gaode Uplift Model Iteration Agent Long Running Harness 涉及agent领域的核心技术议题。
### 核心观点
1. > 来源：高德技术
> 作者：信息业务中心
> 原文：https://mp.
2. com/s/LHPA3qlEsKOlrSsDPEnAyA
## 本期导读
高德营销算法团队构建的 AI Agent 系统：只需输入一句话目标（如"训练发券模型，目标击败 online baseline"），便能自主完成"提出假设 → 拼接样本 → 训练模型 → 离线评估 → 迭代决策"的全链路闭环。
3. **效益：** 过去工程师完成一次完整模型迭代通常需要 3–5 天；该 Agent 系统可在1–2 天内无人值守地跑通同等流程，工程师介入次数 = 0。
4. ## 一、它是什么
一个 AI Agent 系统，专做一件事：替算法工程师跑完 **Uplift 模型迭代的完整生命周期**（Uplift 模型预测的是"给用户发券能多撬动多少 GMV"，是营销算法的核心资产）。
5. **输入：** 一段自然语言（例: "训练旅游 uplift 模型, 目标 sim 胜率 > 50%"）
**输出：** 1-2 天后给你一个训练完的模型 + AUUC 评估报告 + 整个过程的审计日志。

### 关联实体

- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](../ch04/176-openclaw.html)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](../ch03/004-agent.html)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](../ch04/176-openclaw.html)
- [Karpathy Vibe Coding Agentic Engineering](../ch04/098-karpathy-vibe-coding-agentic-engineering.html)
- [你不知道的 Agent原理架构与工程实践 V2](../ch03/004-agent.html)
- [Ethan He Cosmos Grok Imagine Latent Space Video Agent 20260606](../ch03/004-agent.html)

---

