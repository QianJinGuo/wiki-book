---
title: "下一代Benchmark？AI评测走向Eval Harness（HarnessEval-W）"
source_url: "https://www.xiaohongshu.com/explore/6a8680c7000000002500d831?xsec_source=app_share&xsec_token=CBtBWq2Djc4mXJIrkMeRVi2Oqot6iOJSfUouOss6yLlhI="
source_author: "Oscholar"
source_site: "小红书"
source_published: 2026-08-20
ingested: 2026-08-20
type: raw-article
tags: [world-model, evaluation, eval-harness, evidence-tree, oscholar, benchmark]
sha256: "06a295a4e1a7b27751baa82393cb4d7dfef16ad1d9dc33acc345c935c6b30c6f"
---

# 下一代Benchmark？AI评测走向Eval Harness（HarnessEval-W）

现有世界模型 Benchmark 多依赖固定指标或统一评分规则，但判断一个交互世界是否合理，不只要看画面质量，还要判断动作有没有正确发生、物理因果是否成立，以及物体离开视野后是否继续演化。很多错误人一眼能发现，自动评测却很难解释「错在哪」。

MirroS 团队提出 HarnessEval-W，把 LLM 领域的 harness 思路引入世界模型评测。面对不同案例，主 Agent 会先判断应该检查什么、调用哪些评测 Skill，再把问题拆给多个子 Agent 分别调查。比如检查机械臂有没有按要求拿起物体，会分别验证目标是否正确、动作是否发生、最终状态是否符合要求、有没有出现额外事件，最后汇总成一棵可追溯的证据树。评测不再只给一个分数，而是能继续追到「为什么错」。

HarnessEval-W 将世界模型能力拆成三类：观测质量、状态转移正确性和世界持续性，构建 330 个测试案例，统一评测 18 个代表性模型。结果中，Seedance 2.0 以 75.5 分排名第一。

关键发现：
- 不同世界模型出现明显「偏科」：有的擅长执行交互，有的更能维持长期状态，画面质量好也不代表物理世界建模能力强——两项指标的相关性仅为 -0.04。
- 这套 Agent 评测也与人类判断高度一致。在 5000 组人工 A/B 判断中，HarnessEval-W 在主动交互和物理交互上的人类排序相关系数达到 0.93 和 0.87；相比 WBench，物理任务的人类偏好判断准确率从 31.9% 提升至 71.7%。
- 论文还发现，把视频生成模型微调成世界模型，并不是一次「全面升级」：两组模型都在探索和长期状态保持上变强，却明显损失了主动交互和物理响应能力。世界模型能力不是一条单一的 Scaling 曲线，而是一组可能互相取舍的能力。

这篇工作把世界模型评测推进到了「解释世界为什么对或错」，让模型排名之外还留下可审查的失败诊断，更适合指导训练与系统改进。
