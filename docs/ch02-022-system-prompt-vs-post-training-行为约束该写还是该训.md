## Ch02.022 System Prompt vs Post-Training：行为约束该写还是该训？

> 📊 Level ⭐⭐ | 6.9KB | `entities/system-prompt-vs-post-training-behavioral-constraints-2026.md`

## 概述

System Prompt 与 Post-training 是两种截然不同的"行为约束注入方式"：前者每次调用重新解码、占输入 token、易被上下文漂移覆盖；后者通过 SFT/DPO 写入模型权重、成为模型先验、行为稳定。**2024 年 Prompt Engineering 思维（把规则塞进 System Prompt）正在被 2026 年的"行为约束 → Post-training"工程范式取代**。

## 深度分析

**System Prompt 路线在 production 环境会"逐步退化"，D91 漂移是真实现象。** 原文用 Claude 做了对比实验：要求"必须用 `<think>` 标签输出思考过程"，D1 100% 遵循、D30 70%、D91 已混入错误标签。**根本原因**：System Prompt 占用输入 embedding 位置，每次调用重新解码，"被告知的知识"在模型内部表征是临时性的，会被长上下文中的新内容稀释、覆盖、漂移。**Post-training 路线**（DPO/SFT 把同样约束写入权重）跟踪 D1-D91 始终 100% 遵循——因为约束已 baked into attention/FFN 权重，成为模型先验。

**"被告知的知识"与"被训练的知识"在权重空间分配完全不同。** System Prompt 实质是输入序列的一部分，模型在每层 attention 把它当作"上下文 token"对待——可被后续 token 覆盖、稀释、注意力分散。Post-training 改变的是 transformer 层本身的 attention / FFN 权重，让模型**在生成第一个 token 之前就已经"知道"该约束**。这一区别是工程级的：前者是"查字典"，后者是"记住"。**任何依赖稳定行为的 production agent 都应该走 Post-training 路线**。

**"硬塞 System Prompt"是反智能，但只对行为约束成立。** 关键洞察：System Prompt 与 Post-training 不是"二选一"，而是"各管一摊"。**当下任务参数**（API 端点、用户偏好、当前任务描述、上下文数据）→ 写 System Prompt；**行为/规则/约束**（输出格式、禁用词、风格要求、合规红线）→ Post-training（SFT/DPO）。一个反例警示："你必须用 JSON 输出"是行为约束，应该 SFT/DPO；"今天用户是 VIP"是当下参数，应该 System Prompt。两者混淆是大量 agent 工程失败的根源。

**"Post-training 让 System Prompt 变薄"是 2026 年的范式转折点。** 当所有行为约束都被 Post-training 处理，System Prompt 只剩任务参数，体积可以大幅压缩——这与 Kimi K2.5 / openJiuwen 等"harness 内化"路线形成共鸣：模型层处理行为，harness 层处理任务，prompt 层只做参数注入。**"prompt engineering"作为独立工种在 2026 Q3 之后会大幅萎缩**，因为"写 prompt"和"训 prompt"被分别自动化和工程化。真正稀缺的是 **Post-training Engineer** + **Agent Harness Engineer**。

## 实践启示

1. **在 production agent 中，先做一次"约束审计"**：把所有写在 System Prompt 里的规则分类成"行为约束"vs"任务参数"，把前者全部迁移到 Post-training（DPO/SFT）。这是把"日 D91 漂移"问题一次性根治的工程动作。

2. **用"行为一致性 SLA"做约束选型判断**：如果某个约束的失败代价是"用户看到的输出违反产品规范"（如禁用词、格式、风格），它必须走 Post-training；如果失败代价是"任务执行偏差"（如 API 端点写错），可以放 System Prompt。代价等级 = 选型优先级。

3. **DPO 是行为约束的"轻量 SFT"**：相比完整 SFT，DPO 只需要 (prompt, chosen, rejected) 三元组，训练成本低、效果对齐人类偏好。如果行为约束有明确"对/错"二元（如"必须 JSON 格式"），DPO 优于 SFT。

4. **不要用"长 System Prompt"做行为管理**：长 System Prompt 会被 attention 机制稀释，行为一致性会随上下文长度下降。如果业务要求"在 50K token 上下文中依然稳定遵循规则"，唯一可靠方案是 Post-training。

5. **把"行为约束迁移"作为 2026 Q3 的工程红线**：随着基础模型升级（K2.5、GLM-5.1、Claude 4.x），Prompt-only 的"行为管理"会越来越脆弱。提前做 DPO/SFT 迁移，是为下半年新模型时代的生产稳定性买保险。

## 关键区分：System Prompt vs Post-training

| 维度 | System Prompt | Post-training |
|------|---------------|---------------|
| 实现位置 | 输入 token 序列 | 模型权重 |
| 每次调用代价 | 重新解码 + 算 attention | 0（已 baked in） |
| 行为一致性 | 弱（被上下文漂移影响） | 强（写进先验） |
| 调整成本 | 修改 prompt 字符串 | 重训 / DPO |
| 适合范围 | 当下任务参数 | 行为规则/约束 |
| 类比 | 查字典 | 记住 |

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/system-prompt-vs-post-training-behavioral-constraints-2026.md)

## 相关实体

- [LLM Post-Training 全景指南 — Post-training 方法论基础（RLHF/GRPO/RLVR）](ch01-710-2026-年面向-llm-的-rl-方法总结-从-ppo-到-dpo-到-grpo-再到多智能体-rl.html)
- [Harness + Post-Training bug-finding gap](ch01-232-three-years-from-gpt-3-to-gemini-3.html) — Harness 与 Post-training 的协同效应
- [Qoder Skills 指南](ch04-024-powering-agentic-ai-sales-strategy-with-amazon-bedrock-agent.html) — 讨论 skill 约束与 prompt 边界
- [文心 Post-training 演进 — Post-training 工程实践案例](ch01-232-three-years-from-gpt-3-to-gemini-3.html)
- [Yann Dubois OpenAI Post-Training 访谈 — Post-training 职业路径](ch01-374-introducing-the-ettin-reranker-family.html)
- [Kimi K2.5 架构创新](ch01-882-agentium-agent.html) — 同样强调"模型层处理行为，harness 层处理任务"
- [goodfire predictive data debugging：可解释性指导 post-training 数据塑形](ch01-232-three-years-from-gpt-3-to-gemini-3.html)

---
