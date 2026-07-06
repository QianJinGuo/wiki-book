# 两篇Harness论文：微软M⋆记忆进化 + 谷歌AutoHarness动作约束

## Ch01.694 两篇Harness论文：微软M⋆记忆进化 + 谷歌AutoHarness动作约束

> 📊 Level ⭐⭐ | 6.3KB | `entities/two-harness-papers-microsoft-google.md`

# 两篇Harness论文：微软M⋆记忆进化 + 谷歌AutoHarness动作约束
> AI研究风向变了：从"如何让模型更聪明"转向"如何给Agent配一个更合适的Harness框架"。

## 一、M⋆：每个任务都值得拥有专属的记忆Harness
当前LLM Agent的记忆系统采用"一刀切"设计——对话Agent用语义检索、代码Agent用技能系统、专业领域用结构化数据库。但为一个领域优化的记忆设计无法迁移到其他领域。

- 对话任务（LoCoMo）：实体关系图追踪人物关系

## 相关实体
- [Harness Evolution Papers](ch05/085-harness.md)
- [Code As Agent Harness Survey](ch09/051-code-as-agent-harness.md)
- [Cong 30 Fen Zhong Shou Gu Agent Dao Harness Cheng Wei Xin Hou Duan](ch01/216-0.md)
- [从 30 分钟手搓 Agent到 Harness 成为新后端](ch01/216-0.md)
- [Agentexecutorgooglesdistributedagentruntime](ch03/045-agent.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/two-harness-papers-microsoft-google.md)

## 深度分析

**1. 记忆结构具有强任务特异性，跨任务迁移甚至有害。** M⋆在 LoCoMo、ALFWorld、HealthBench、PRBench 四个不同 Benchmark 上进化出截然不同的记忆结构——t-SNE 可视化显示各任务收敛于不同结构聚类（LLM-Centric、Semantic Search、Hybrid Retrieval 等）。更关键的是，跨任务迁移实验证明将 A 任务进化出的记忆程序用于 B 任务，表现甚至不如通用基线。这说明记忆结构必须与任务协同优化，无法通用化。

**2. 可执行程序表示解锁记忆进化空间。** M⋆将记忆 Harness 表示为 Python 记忆程序（Schema + Logic + Instruction），而非静态数据结构。反射式代码进化流程通过验证循环采样→编码 Agent 生成补丁→约束检查与自动修复，实现记忆程序的自动化迭代优化。这种"程序即记忆"的表示方式让记忆系统可以被进化优化，而非手工设计。

**3. 专用 Harness 可以让小模型击败大模型。** AutoHarness 实验显示 Gemini-2.5-Flash（较小）+ Harness 对阵 Gemini-2.5-Pro（较大）取得 9/16 胜率，总体胜率 56.3% vs 38.2%。这与"缩放定律越大越好"的直觉相悖——专用框架的杠杆效应可以弥补模型规模差距。更极端的是 Harness-as-Policy 模式：16 个 1P 游戏取得 0.870 平均奖励，超越 GPT-5.2-High（0.844），且测试时零 LLM 调用成本。

**4. 动作约束是代码生成系统和游戏 Agent 的核心失败原因。** 在 Kaggle GameArena 国际象棋比赛中，78% 的 Gemini-2.5-Flash 失败都源于非法移动。这一数字揭示了一个被忽视的瓶颈：当前 LLM 在严格定义环境中的动作合法性极差。传统方法需要为每个游戏手工编写约束代码，既费力又容易出错，AutoHarness 的树搜索+Thompson 采样方法实现了自动化。

**5. AI 研究风向从"模型中心"转向"Harness 框架中心"。** 两篇论文共同指向一个趋势：模型能力提升的边际收益在递减，而为模型配置合适的 Harness 框架带来的收益越来越显著。M⋆证明记忆结构需要任务协同优化，AutoHarness 证明动作约束可以弥补模型能力不足。这不是某篇论文的偶然发现，而是整个领域正在发生的范式转移。

## 实践启示

1. **采用"M⋆思维"为不同任务类型配置专用记忆 Harness。** 不要用通用记忆系统处理所有任务。在项目早期就识别出核心任务类型（对话、代码、具身智能、专业查询等），为每类任务设计专用的记忆结构和检索策略。通用记忆系统在特定任务上的表现必然不如专用设计。

2. **建立可进化的 Harness 程序库积累最佳实践。** M⋆的开源方法表明记忆程序可以被积累和复用。团队应该建立内部 Harness 库，记录每类任务的最优记忆程序配置（Schema、Logic、Instruction），而非每次重新设计。新项目从库中选取相近任务类型的程序作为起点，通过进化微调优化。

3. **代码生成和游戏类 Agent 必须集成 Harness 动作约束。** 如果你的 Agent 在严格定义环境中失败率较高，第一反应应该是检查是否缺少动作合法性约束，而非尝试更强的模型。AutoHarness 的三种模式（action-filter、action-verifier、policy）中，action-verifier 是大多数场景的最佳起点。

4. **在 AutoHarness 的树搜索范式中探索其他严格约束场景。** Thompson 采样引导的树搜索不只适用于游戏环境。任何有明确合法动作空间、可以返回奖励信号的严格定义环境（代码编译器、安全策略、金融交易等）都可以用这一框架自动合成 Harness。

5. **优先测试 Harness-as-Policy 模式以降低推理成本。** 当任务稳定且动作空间可枚举时，Harness-as-Policy 可以在测试时完全消除 LLM 调用，成本接近零且性能更高。这对于需要高频率调用、延迟敏感的生产环境尤其有价值。

6. **在 Agent 框架选型时关注任务特异性和框架效率，而非单纯模型规模。** 评估标准应该包括：框架是否支持可进化的 Harness、是否能配置专用记忆结构、动作约束机制是否完善。以"小模型 + 专用 Harness"能击败"大模型 + 通用框架"为评估目标。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/two-harness-papers-microsoft-google.md)

---

