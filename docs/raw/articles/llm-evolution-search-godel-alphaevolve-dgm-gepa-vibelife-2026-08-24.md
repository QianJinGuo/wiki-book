---
title: "进化搜索 × 自我改进：Gödel Agent、AlphaEvolve、DGM、GEPA 四篇论文阅读"
source_url: "https://mp.weixin.qq.com/s/NIuPYcMgost1khgJ64qnVQ"
source_name: "vibe life"
author: "vibe life"
ingested: 2026-08-24
sha256: 7da2698d076f168f1204defc5d01fccd362c70e2f763de8ddba105e6765e1116
---

# 进化搜索 × 自我改进：Gödel Agent、AlphaEvolve、DGM、GEPA 四篇论文阅读

> 来源：vibe life（独立公众号综述档，2026-08-22）。把 Gödel Agent / AlphaEvolve / Darwin Gödel Machine / GEPA 四篇「LLM 进化搜索 / 自我改进」范式论文装进同一条「六环节进化闭环」逐篇拆解机制，最后用五个设计问题收束：改进方向从哪来？改坏了怎么办？自指和可信为何难以兼得？

## 三句话总结

1. **共同范式「LLM 进化搜索」**：无梯度搜索，同时维护一组候选解，循环「生成 → 评估 → 择优」，让 LLM 自己充当变异算子。四个代表：一个 agent 反复改写自己的代码 SWE-bench 从 20.0% 爬到 50.0%（Gödel Agent）；一段被演化出的算法 56 年来首次打破 Strassen 矩阵乘法纪录（AlphaEvolve）；一组进化提示词用比 RL 少 35 倍样本反超 GRPO 最高 20%（GEPA）；一个 agent 在没人教的情况下「重新发明」多角色 CoT、自一致投票和 few-shot。
2. **六环节进化闭环（S0-S5）**：S0 任务定义与初始化（可改范围）→ S1 种群/档案维护 → S2 父代选择（探索×利用）→ S3 变异/交叉生成（LLM 语义算子）→ S4 评估（fitness 信号 + 省算力/降噪）→ S5 留存与终止。四篇在每环节的差异构成横向对比表。
3. **四篇关键差异**：Gödel Agent（2024-10，arXiv 2410.04444）S3 自指机制最激进（monkey patching + 递归改写自身代码含改写逻辑本身），代价是拆掉种群/选择/留存三道保险；AlphaEvolve（2025-05）S0 抽象层次（搜整份代码文件而非单函数）+ S4 评测工程（EVOLVE-BLOCK 圈范围、评测级联）；DGM（Darwin Gödel Machine，2025-05）S1/S2 开放式探索（档案只进不退 + 性能×新颖性父选择）；GEPA（2025-07）S3 定向反思变异（文本反馈归因）+ S2 Pareto 逐题冠军选择。

## 主要内容

- **Gödel Agent（PKU/UCSB/UA，arXiv 2410.04444）**：受 Schmidhuber Gödel machine 启发，让 agent 获得自指能力——能分析并改写自身代码，包括「负责分析与改写」的那部分代码，从而递归自我改进、消除人设先验。实现用 monkey patching 在 runtime memory 动态读写自身代码，主函数写成递归函数。三范式对比：Hand-Designed（人工先验静态/自由度最低）→ Meta-Learning Optimized（固定元学习算法调参/中）→ Self-Referential Gödel Agent（仅给高层目标/最高自由度）。初始工具消融显示 think（行动前推理）与 err（错误处理）最关键（↓13.4/↓14.8）。
- **AlphaEvolve**：前身 FunSearch 只能演化单个函数，AlphaEvolve 把同一循环放大到整份代码文件（数百行、任意语言）：从程序数据库采样父代（岛屿分群探索、每格只留精英），LLM 对父代产 diff，用户提供 evaluate 打分，有前途的解写回数据库当下一轮父代；EVOLVE-BLOCK 注释圈定可改范围，评测级联让贵的测试只留给过便宜测试的解。
- **DGM（Darwin Gödel Machine）**：Gödel machine 要求每次自我修改都有形式证明，实践中证不出来；DGM 改用经验证据——每轮让 agent 用自己的工具改自己的代码库（诊断 FM 读失败日志产出任务书，与下游任务同构），改完上 benchmark 实测，能编译且保留编辑能力的全部入档。父代按「性能×新颖性」采样，低分旧分支永远保留翻身机会；档案只进不退，best-so-far 有保底。
- **GEPA**：冻结权重、只改各模块提示词——反思 LM 读取小批量题目的执行轨迹与编译器报错等文本反馈，归因到具体模块后定向改写提示。候选池不按总分排名、按「每道题谁最强」保留多条路线轮流改进；学习用与选拔用数据分开，最终返回史上最佳而非最后一轮。
- **六环节差异速览**：S0 初始化（AlphaEvolve EVOLVE-BLOCK 圈代码块 / DGM 限定 agent 自己代码库 / Gödel Agent 只给目标不划界 / GEPA 固定系统结构只改提示词）；S1 种群（数据库/档案树/Pareto 池三种留法，Gödel Agent 单线递归连历史都不保留）；S2 父代选择（都不总选最优——偏高分短程序/性能×新颖性/按上榜题数抽签）；S3 变异方向（历史解上下文/失败日志诊断/模型自主决策/文本反馈归因——四篇真正分水岭）；S4 评估（纯标量→标量+文本反馈；级联/分层评测/两级准入省算力）；S5 留存（档案只进不退/写回数据库/返回史上最佳，Gödel Agent 无留存靠自纠）。
- **五个设计问题（第六部分）**：改进方向从哪来（变异方向性来源）；改坏了怎么办（留存机制 vs 自纠）；自指与可信为何难以兼得（Gödel Agent 自指最彻底但拆掉保险 vs DGM 有种群但改写机制固定——两者在「自指×种群」两轴互为镜像）；评估器是命门（S0 评估器决定整条路线）；以及综述坐标与研究缺口定位。

## 点评（入库评估）

vibe life（独立公众号综述档 c=5，同 gurubar/2026-08-14 先例）对 Gödel Agent / AlphaEvolve / DGM / GEPA 四篇自我改进论文的综述式精读，以「六环节进化闭环」框架横向对比。四篇论文及自我改进范式均已被库内实体覆盖（AlphaEvolve → alphaevolve-deepmind-discovery-agent、GEPA → gepa-optimize-anything、范式 → self-improvements-modern-agentic-systems-survey / lilian-weng-harness-engineering-self-improvement / agent-self-improvement-six-mechanisms 等）。新意主要是六环节对比框架这一综述性综合，但来自 c=5 个人综述号，且 35<42 无 entity 可 SUPP → v=7、c=5、v×c=35 → **Raw only**（与 2026-08-14 vibe life 综述 35 Raw 档位一致）。
