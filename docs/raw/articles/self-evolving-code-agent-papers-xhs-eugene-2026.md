---
title: "Self-Evolving Code Agent 论文合集（SSR/ASP/CODESKILL/Socratic-SWE/SwarmResearch）"
source_url: "https://www.xiaohongshu.com/explore/6a7d370c000000002701f33a"
author: Eugene（小红书）
platform: Xiaohongshu
ingested: 2026-08-13
slug: self-evolving-code-agent-papers-xhs-eugene-2026
sha256: 8bea8f9ef938877425073829f6f97f8ceadfe0e79af5462ffaaa404d58285ab1
---

小红书「Eugene」发布的 Self-Evolving Code Agent 论文合集，5 篇论文（2026.05-2026.07），每篇含 Motivation 与 Method 摘要。标签：#博士申请 #大模型 #人工智能 #科研。

## 1️⃣ SSR：Toward Training Superintelligent Software Agents through Self-Play SWE-RL（2026.06）

- **Motivation**：训练数据（issue/PR）与环境（测试）重度依赖人工整理，构成通往更强智能体的根本瓶颈。
- **Method**：仅需沙箱化真实仓库——单个 LLM 智能体自博弈 RL，交替注入与修复复杂度递增的 bug（bug 由测试补丁而非自然语言定义）；SWE-bench Verified 上显著超人工数据 RL。

## 2️⃣ ASP：Anchored Self-Play for Code Repair（2026.07，ICML 2026）

- **Motivation**：单元测试只验证对错不验证真实性，generator-fixer 自博弈会漂向"难但不真实"的 bug——合成 bug 上涨分、人写 bug 上掉分。
- **Method**：用小规模参考 bug 集锚定自博弈——代码嵌入相似度奖励把生成器拉向目标分布，参考 bug 混入 fixer 训练；配 **BugSourceBench**（人写/LM 生成/人改 LM 三源），平均修复率相对 +24%。

## 3️⃣ CODESKILL：Learning Self-Evolving Skills for Coding Agents（2026.05，NTU）

- **Motivation**：固定 prompt 与启发式规则预设了"抽什么、怎么更新"，分不清长轨迹中可复用知识与偶然细节。
- **Method**：训一个 RL 优化的技能模型——从轨迹提取多粒度程序性技能、随新经验进化并维护紧凑技能库；rubric 密集奖励+执行稀疏奖励混合，三基准平均 +9.69。

## 4️⃣ Socratic-SWE：Self-Evolving Coding Agents via Trace-Derived Agent Skills（2026.06）

- **Motivation**：合成 SWE 任务多靠固定变异/注 bug，任务分布与智能体自身弱点和训练进度脱节。
- **Method**：闭环自进化——把历史求解轨迹蒸馏成"高频失败+有效修复"技能，反过来指导在真实仓库生成针对性任务，经执行验证+solver 梯度对齐奖励筛选。

## 5️⃣ SwarmResearch：Orchestrating Coding Agents for Open-Ended Discovery（2026.07）

- **Motivation**：长跑型 coding agent 早早锁死单一高层方案后只做低层微调；根源在单智能体累积上下文+只暴露单一程序状态。
- **Method**：Shepherd Agent 持全局上下文引导一群 Search Agent 在各自 git 分支以局部上下文探索；15 项开放优化任务 13 项优于或持平 SOTA LLM 进化方法。
