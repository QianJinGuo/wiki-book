# 启发学习（Inspirational Learning）：让大模型认知从外化到内生

> 📊 Level ⭐⭐ | 3.3KB | `entities/inspirational-learning-isaac-llm.md`

# 启发学习（Inspirational Learning）：让大模型认知从外化到内生

> **Background**：本文基于机器之心 2026-08-26 对「启发学习（Inspirational Learning）」及其推理侧实现 Isaac 的介绍。作者认为，当前大模型很多能力并非自己长出来的，而是被人为地在外面包了一层又一层框架，能力上限卡在脚手架上；启发学习尝试把「经验怎么复用」写进推理本身。

## 问题：能力上限卡在脚手架

过去两年主流做法是人为地为模型加脚手架——Agent、Skills、Function Calling、RAG、Harness 轮番上场，把临时判断固化成可调用的工作流。这套做法有效，但换场景就要重写流程，换工具就要重排提示和权限：系统看起来更能干，知识却越来越多地挂在流程外面。

作者认为，现在主流方案多停在接口与检索层面，很少把「经验怎么复用」写进推理本身——外挂和算力人人都能堆，更难的是让模型在新问题上自己调用旧经验。

## 认知进化飞轮

启发学习借鉴人类学习方式（复盘成败、把结构相近的问题连起来、把一次有效推理留到下次还能用），提出四步闭环：

1. **类比检索（Analogical Retrieval）** — 面对新领域、新问题，检索聚焦的不是字面相似的文本，而是经验库里其它领域解答过的类似问题的思路
2. **逻辑重组（Re-composition）** — 把这些思路整理后合并进当前输入
3. **内生注入（Endogenous Injection）** — 注入阶段把重组后的思路集成到推理侧
4. **经验沉淀（Experience Loop）** — 把新题的思维链抽象成可复用条目，写回经验库

## Isaac：站在巨人肩膀上

作者将这一路线集成到推理侧，取名 Isaac（源自牛顿的名字，寓意「站在巨人肩膀上」）。人类智慧演化中，重大突破很少从零开始：库仑受牛顿万有引力思维模式启发提出库仑定律，霍兰德把达尔文自然选择逻辑迁移到计算机领域催生遗传算法——最常见的路径是把已知结构搬到新领域：类比、迁移、再重组。

## 关联

- 相关概念: [推理模型](https://github.com/QianJinGuo/wiki/blob/main/concepts/reasoning-models.md)、[工具使用推理](https://github.com/QianJinGuo/wiki/blob/main/concepts/tool-use-reasoning.md)、[Agent 自我改进循环](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-self-improvement-loops.md)、[LLM RL 算法演进](https://github.com/QianJinGuo/wiki/blob/main/concepts/llm-rl-algorithms-ppo-dpo-grpo-marl-evolution-2026.md)
- 相关实体: [CPU 缓存类比与 Agent 上下文管理](../ch03/006-agent.html)、[Agent 弃权](../ch04/298-agentic.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/inspirational-learning-isaac-llm-2026.md)

---

