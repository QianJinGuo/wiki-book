---
title: Self-Evolving Agents 系统性综述（厦门大学等多机构联合）
source_url: https://mp.weixin.qq.com/s/35R4E6at4bjAjeMvJaHk_A
publish_date: 2026-05-07
tags: [wechat, article, agent, rag, multi-agent, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: f9f58c6dee49a6147354e2f29b53629ea7036ee6d6759fd25ef4e5449d1f1e3c
---
# Self-Evolving Agents 系统性综述（厦门大学等多机构联合）
> 来源：[PaperAgent 公众号](https://mp.weixin.qq.com/s/35R4E6at4bjAjeMvJaHk_A) | 发布：2026-05-04 | 河南
> 原始论文：[A Systematic Survey of Self-Evolving Agents: From Model-Centric to Environment-Driven Co-Evolution](https://www.techrxiv.org/doi/full/10.36227/techrxiv.177203250.05832634/v2) | [GitHub](https://github.com/XMUDeepLIT/Awesome-Self-Evolving-Agents)
## 摘要
厦门大学、香港理工大学、马里兰大学、华盛顿大学圣路易斯分校、UIUC、新加坡管理大学等多机构联合发布系统性综述，系统回答：当 LLM Agent 能够主动探索、获得反馈、更新策略、积累经验时，如何理解其"自进化"？
## 核心概念：Self-Evolving Agents 两个核心特征
1. **Strong autonomy with minimal human supervision**：尽量减少对外部人工监督的依赖
2. **Active exploration through interaction**：通过内部推理或外部环境交互主动探索和改进
## 为什么需要 Self-Evolving Agents？
传统 Agent 依赖"两阶段范式"：
- **Pre-Training**：大规模语料学习通用世界知识
- **Post-Training**：SFT、RLHF、RLAIF 或任务数据
瓶颈：Agent 越复杂，对高质量监督信号依赖越强；而高质量人类标注、人工奖励和专家反馈很难无限扩展。复杂 Agent 任务，人类不仅要判断最终答案，还要理解多步规划、工具调用、环境反馈、错误恢复和长期状态变化。监督成本急剧上升。
## 统一分类：三条自进化路线
### 路线一：Model-Centric Self-Evolution（模型先自己变强）
假设：模型内部已包含大量潜在能力，只是没有被充分激发。
**3.1 Inference-Based Evolution（推理时自进化）**
- Parallel Sampling：并行采样多条推理路径
- Sequential Self-Correction：生成→反思→修正
- Structured Reasoning：树、图等结构化推理
本质：用更多 test-time compute 换取更可靠的单次输出。问题：推理结束后模型参数没变化，能力不会真正内化。
**3.2 Training-Based Evolution（训练时自进化）**
- Synthesis-Driven Offline：离线生成合成数据，再用于训练（"模型给自己出教材"）
- Exploration-Driven Online：在线探索、实时反馈、持续更新策略（"模型不断在探索中试错"）
代表工作：R-Zero、Absolute Zero、Agent0。
### 路线二：Environment-Centric Self-Evolution（环境成为能力来源）
Agent 的进化不只来自参数更新，也来自它如何利用外部知识、经验、工具、记忆和多 Agent 结构。
**四个方向：**
1. **Static Knowledge Evolution**：Agent 会判断自己缺什么知识，主动生成查询、收集证据、整合推理。检索从"前置模块"变为"主动认知行为"。
2. **Dynamic Experience Evolution**：从历史轨迹、成功案例、失败反馈中提炼可复用经验。
   - 知识解决 "what is"，经验解决 "how to do"
   - 哪种工具调用顺序更稳定？哪类错误如何恢复？
3. **Modular Architecture Evolution**：Memory/Tool/Interface/Protocol/Skill Library 这些模块本身也可以演化。Memory 不只是向量数据库，而是能主动决定保留/遗忘/合并/重写/路由的系统。
4. **Agentic Topology Evolution**：让多 Agent 的通信结构、角色分配、团队规模和协作拓扑自动搜索或动态调整。核心问题：多 Agent 系统的组织形式能不能也成为一个可学习、可优化、可进化的对象？
### 路线三：Model-Environment Co-Evolution（未来关键方向）
前两类局限：
- Model-Centric：缺乏外部验证，可能错误累积、自我强化幻觉
- Environment-Centric：很多环境仍是静态的、单任务的、不可扩展的
核心洞察：未来 Self-Evolving Agents 的核心挑战，不只是训练更强的 Agent，而是**设计能够和 Agent 一起成长的环境**。
两个方向：
- **Multi-Agent Policy Co-Evolution**：环境由其他 Agent 构成，Agent 之间协作、竞争、评价形成动态学习场
- **Environment Training**：训练/生成环境——能提供可验证反馈、能按 Agent 能力调整难度、能生成多样化任务、能支持长期开放式探索
代表工作：Reasoning Gym、AgentGym、Agent-World。
## 关键判断（论文核心观点）
> 未来 Self-Evolving Agents 的核心挑战，不只是训练更强的 Agent，而是设计能够和 Agent 一起成长的环境。
## 技术谱系图
- 图1：Self-Evolving Agents 代表性工作发展趋势（2022→2026）
- 图2：统一分类框架（三大范式）
- 图3：技术谱系总览（完整技术地图）
- 图4：离线合成 vs 在线探索进化对比
- 图5：静态知识演化 vs 动态经验演化对比
- 图6：Model-Environment Co-Evolution 优势
## 论文信息
- **标题**：A Systematic Survey of Self-Evolving Agents: From Model-Centric to Environment-Driven Co-Evolution
- **arXiv**：https://www.techrxiv.org/doi/full/10.36227/techrxiv.177203250.05832634/v2
- **GitHub**：https://github.com/XMUDeepLIT/Awesome-Self-Evolving-Agents
- **发布机构**：厦门大学、香港理工大学、马里兰大学、华盛顿大学圣路易斯分校、UIUC、新加坡管理大学
- **公众号来源**：PaperAgent（2026-05-04）