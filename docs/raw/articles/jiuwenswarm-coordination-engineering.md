---
title: "蜂群Agent来了！openJiuwen社区发布JiuwenSwarm，引领Coordination Engineering新范式"
platform: "InfoQ"
author: "openJiuwen"
date: "2026-05-18"
source_url: "https://mp.weixin.qq.com/s/-nnf0dnC_9VmEn_qLD05Qw"
sha256: "a9640f96d0206ffc5719d4740784ea5a23e160696f2f801626b089c9ff59db1e"
review_value: 8
review_confidence: 7
review_recommendation: strong
review_stars: 4
tags: ["multi-agent", "coordination-engineering", "openjiuwen", "jiuwenswarm", "harness", "agent-swarm"]
type: article
---
# 蜂群Agent来了！openJiuwen社区发布JiuwenSwarm，引领Coordination Engineering新范式
作者｜openJiuwen
编辑｜杨过
刚刚，华为支持的开源 AI Agent 平台社区 openJiuwen 发布并开源了 JiuwenSwarm。
这是一个面向多智能体协作的蜂群智能体。它的出现，指向 Agent 工程中正在浮现的一个新问题：当任务不再适合交给单个 Agent 完成，多个 Agent 如何像一个团队一样工作？
## 1 为什么从 Harness 走向 Coordination？
从 Prompt Engineering → Context Engineering → Harness Engineering，AI Agent 领域的工程范式持续更迭。紧接着浮现的下一个命题是：**如何让多个 Agent 像一支精锐团队一样协同作战？**
真实世界的复杂任务（跨领域调研、软件交付、多角色决策、复杂业务流程编排）从来都不是"一个人"能搞定的——需要一支团队。
openJiuwen 提出的下一跳范式：**Coordination Engineering（协同工程）**——围绕"多 Agent 协同"的工程化范式。
这一次，openJiuwen 把"协同"从理念做成了一整套**可跑、可装、可共建、全套开源**的工程交付：JiuwenSwarm。
## 2 Coordination Engineering 核心设计理念
要让一支 Agent 团队真正 work 起来，需要解决四个递进问题：
1. **多个 Agent 怎么自主分工、动态协商？** — 协同的起点
2. **最佳实践和角色搭配怎么沉淀成可复用资产？** — 协同不能每次从零开始
3. **能力怎么在开发者之间流通、复用、二次创作？** — 经验只有被分享才能放大价值
4. **整套系统怎么越用越强？** — 否则就是静态框架，撑不起"群体智能"
JiuwenSwarm 给出了对应的全栈技术体系：**Agent Swarm + Swarm Skills + Swarm Skills Hub + Swarm Skills 自演进**。
### Agent Swarm — 让多个 Agent "成军"
整套体系的内核。提供多智能体团队的协同机制，让多个 Agent 能够**自主分工、动态协商、高效协作**，完成从"单兵作战"到"精锐团队"的关键跨越。支持**成员对不同模型的路由**，针对不同角色提供合适能力的模型，减少负载压力。
### Swarm Skills — 让"一支团队"沉淀成"一套作战能力"
把团队协作中跑通的最佳实践、SOP、角色搭配、调度策略，**标准化封装成可复用的"团队级技能"**——让"一支优秀的 Agent 团队"变成"一套任何场景下都能即插即用的作战能力"。
### Swarm Skills Hub — 团队技能的共享市场
打通开放的共享生态，让团队级的协作经验在开发者社区中流通、复用、二次创作。
地址：https://swarmskills.openjiuwen.com/
### Swarm Skills 自演进 — 越用越强的飞轮
演进引擎持续观察任务拆解、角色调度、消息往来等完整轨迹，**自动从轨迹里反推出可复用的 Swarm Skill**，提交用户审批即可入库。
两个层面同时演进：
- **团队层**：自动增减角色、补充约束规则、优化协作流程
- **成员层**：沉淀工具报错、接口超时、调用技巧等实战经验
## 3 人如何参与协同：HOTS & HITS
### HOTS（Human on the Swarm）：人，是 Agent 团队的指挥官
人站在更高位置，**实时观察整个 Agent 团队的运行状态**（任务进展、角色负载、协作瓶颈），随时下场介入——调整优先级、切换角色、中途变更方案。
### HITS（Human in the Swarm）：人，也是团队中的一名成员
人和 Agent **同队、同场景、同流程、实时协作、共同推演**——人就是蜂群里的一只"蜂"。如狼人杀里的玩家，就是这种姿态。
HITS 是**沉浸式参与**，HOTS 是**全局调度**——两种模式是人与 Agent 团队协作的两种最核心姿态。
## 4 JiuwenSwarm 实战效果
### 案例 1：多学科医疗专家团队联合会诊
23 位不同专科的 AI 医学专家组成医疗团队，可根据用户病情按需动态创建多个不同专家成员进行联合会诊。各专家**实时沟通诊断结果**，求同存异，相比单专家诊断有效提升会诊水平。
### 案例 2：昇腾算子开发 & 优化团队
各专家分别承担算法设计、Kernel 实现与性能优化等角色，在协同中实现算子从论文到工程的落地过程。
### 案例 3：短视频制作团队（Swarm Skills 自演进）
首次创作任务完成后，演进引擎自动识别可复用的协作模式并生成 Swarm Skill；再次执行时识别到角色形象与画风不一致等信号，据此优化技能——**用得越多、团队越强**。
### 案例 4：多模型狼人杀（HOTS/HITS）
- HOTS：Human 通过"上帝视角"操控全局游戏
- HITS：Human 作为玩家（狼人/预言家/村民）与其他 AI 队友一起讨论、投票、发言、推理
### 案例 5：沉浸式多学科课程辅导
孩子和家长"以身入局"，与其他学科老师智能体深度互动。老师评估学生知识掌握情况给出学习建议。
## 5 openJiuwen Harness 提供底层支撑
JiuwenSwarm 的每位"队员"底座是 openJiuwen Harness。
**Benchmark 数据：**
- **PinchBench**：JiuwenSwarm 94.2% SOTA（OpenClaw 91.6%），token 消耗降低 34.8%
- **LOCOMO**：记忆准确率 85%（使用 8B 大模型），优于业界主流记忆系统
## 6 开源地址
- AtomGit：https://atomgit.com/openJiuwen/jiuwenswarm
- GitHub：https://github.com/openJiuwen-ai/jiuwenswarm
- Swarm Skills Hub：https://swarmskills.openjiuwen.com/
**关于 openJiuwen**：华为支持的开源 AI Agent 平台社区，由华为 2012 实验室与华为云 AgentArts 团队联合构建。