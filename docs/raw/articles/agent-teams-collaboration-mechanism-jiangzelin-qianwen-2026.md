---
title: "从 ReAct 到 Agent Teams：一个工程师视角的 Agent 协作机制思考"
source_url: "https://mp.weixin.qq.com/s/T_sYOS11KrOijp_aCEcgnQ"
author: "蒋泽林(林曜)"
ingested: "2026-08-31"
sha256: "c1e2ffd792ba08a657754fe6f5636c1b71fb0cac4281a667729bebd4b62d2afe"
source_type: "wechat_mp"
---

# 从 ReAct 到 Agent Teams：一个工程师视角的 Agent 协作机制思考

> 原文：https://mp.weixin.qq.com/s/T_sYOS11KrOijp_aCEcgnQ

## 全文

两个月的 Agent 开发实践沉淀，从第一性原理出发，探讨 Agent 的本质、当前多 Agent 协作架构的不足，以及如何借鉴人类组织经验设计真正的 Agent Team 机制。

## 一、Agent 的本质：ReAct 模式即人类智能的工程化抽象

做了两个月的 Agent 开发，我越来越确信：当前 Agent 能真正完成任务，很大程度取决于 ReAct（Reasoning + Acting）模式的出现。ReAct 来自 Yao 等人 2022 年的论文，核心循环是「Thought → Action → Observation」——思考下一步该做什么，执行动作，观察环境返回的信息，再进入下一轮思考。

Agent 本质上就是这个循环的实现，而且可以非常简单。pi-agent（7.6 万 star）的核心 `agent-loop.ts` 约 600 行代码就完成了完整的 Agent 循环。

## 二、第一性原理分拆：思考、行动、观察

沿 ReAct 三环节做分析：

- **思考（Reasoning）**：大模型基座决定，是 Agent 的「智商」。
- **行动（Acting）**：工具集决定，是 Agent 的「手脚」。
- **观察（Observation）**：环境返回的信息，是 Agent 的「感知系统」。

**工程团队的着力点**：我们无法解决模型的「思考」问题，但可以积极解决「行动」和「观察」——提供更好的工具、返回更结构化的执行结果。

## 三、无状态本质与上下文管理

大模型是无状态的。每次调用都是一次独立的前向计算，模型参数不会因为这次调用发生任何改变。它之所以表现得「像知道上次说过什么」，是因为你把历史又塞回 context 里重新告诉了它——这不是记忆，是每次现讲一遍。

人今天学会了 Java，晚上突触就长出来了，明天照样会写——**学习这件事物理性地改写了大脑本身**。大模型完全相反：它跑完一件事、"解决"了一个问题，参数权重一个字节都不会变。

所以 Agent 不会"自动变强"——它只在你为它建了外部记忆的那部分变强。"上下文即记忆"是当前唯一可靠的工程路径。

## 四、从单 Agent 到 Agent Teams：必然的进化方向

当前行业聚焦在单 Agent 的构建——完善一个「人」。但未来一定会大规模出现 Agent 间的协作问题，就像人类社会从个体生存到部落、城邦、国家的演化。

Agent 管理比人简单：没有情绪、即时响应、无沟通摩擦。人类管理中最难的部分（情绪、利益博弈、信息不对称）在 Agent Teams 中天然消解。

## 五、当前 Leader-Worker 架构的不足

主流多 Agent 框架（CrewAI、AutoGen、MetaGPT）大多采用 Leader-Worker 架构。对比现实技术团队，差距明显：

| 维度 | 现实团队 | 当前 Agent Teams |
|------|---------|-----------------|
| Leader 角色 | 资深专家 + 管理者，能兜底 | 任务分发器 + 结果验收器 |
| 任务下达 | 先有方案 → 与 Worker 讨论 → 共识后执行 | 直接拆分 → Worker 埋头干 |
| Worker 间交流 | 自由沟通、互相求助 | 完全隔离 |
| 进度管理 | OKR / 里程碑 / 风险预警 | 几乎无机制 |
| 方案变更 | Leader 审查合理性 | 无审查，出错才返工 |

核心缺陷：Worker 之间完全隔离，缺少 peer-to-peer 的横向信息流。

### 案例：AgentTeams——工业界最完整的 Manager-Workers 实现

阿里 AgentScope 团队开源的 AgentTeams 是当前工业界 Manager-Workers 架构工程完成度最高的项目之一。但结构上它仍然是 Manager-Workers——**通信通道有了，但协作语义没有**：没有方案共同讨论、没有 OKR 协商、没有分歧仲裁、没有任务完成后的集体复盘、没有基于历史的团队演化。

## 六、业界已有的探索

把多 Agent 协作研究串到同一个问题上——「如何把一群各干各的 Agent，组织成一支真正的团队」——它们落到一条清晰的生命周期链上：

### 阶段① 分类与框架：协作类型学（arXiv 2501.06322）

从协作类型、协调策略、通信结构、动态性四个维度，归纳出五种基本组织形态——Flat/P2P、Hierarchical、Team、Society、Hybrid。结论：没有哪一种结构能普适所有场景。

### 阶段② 角色与流程：MetaGPT / Agent-Oriented Planning

- **MetaGPT**（ICLR 2024）：把 SOP 直接编码进多 Agent 系统，用标准化流程约束交互。
- **Agent-Oriented Planning**（ICLR 2025）：Meta-Agent 动态拆解任务，Reward Model 给分配质量打分。

### 阶段③ 目标管理：OKR-Agent（arXiv 2311.16542）

把 OKR 搬进 Agent 世界：层级递归拆解 Objective → Key Result。但整个过程是单个 Agent 的递归分解，Worker 依然只是目标的接收者。

### 阶段④ 经验积累：Experiential Co-Learning（ACL 2024）

从历史任务中提取「捷径经验」，任务质量从基线 0.43 提升到 0.73。但经验还停留在个体层面，没有上升成团队资产。

### 阶段⑤ 团队演化：Meta-Team / EvoChamber

- **Meta-Team**（arXiv 2605.29790）：三层协作演化（Agent 层/交互层/团队层），平均比不进化的 MAS 高出 6.6%。初始手工设计的 MAS 在 9 个测试里有 6 个反而不如单个 Agent。
- **EvoChamber**（arXiv 2605.11136）：CoDream 五阶段循环（Reflect→Contrast→Imagine→Debate→Crystallize）。消融实验：去掉协作进化机制后，20 个 Agent 的团队和 1 个 Agent 表现完全没有差别。

**结论：多 Agent 的价值 100% 来自协作机制本身，堆 Agent 数量本身不产生任何价值。**

## 七、我的设计：真正的 Agent Team 机制

### 7.1 重新定义 Leader：从分发器到资深专家兼管理者

Leader 要具备四个特征：
1. **深度参与方案制定**——收到任务时脑子里已有大致解决路径
2. **与 Worker 讨论后再执行**——方案不是单方灌输，达成共识后再动手
3. **具备兜底能力**——Worker 做不了时能亲自接手
4. **负责方案变更审查**——避免局部最优毁掉全局

Leader 与 Worker 应当**有能力差**（更强的模型、更长的 context），而不是同质化 Agent 换个 prompt。

### 7.2 启发式管理：Leader 是激发者，不是命令者

同一个 Agent，命令式描述产出保守机械；鼓励式引导产出深度创造性有肉眼可见提升。背后机理：RLHF/DPO 对齐训练中"合作、鼓励、探索"语境对应高质量回复；"命令、否定"语境对应保守回复。

### 7.3 讨论 → 共识 → 执行：任务启动的三步走

Phase 1（Leader Proposal）→ Phase 2（Worker Feedback）→ Phase 3（Consensus）→ 进入执行。三 phase 可异步并行，秒级完成。

### 7.4 Worker 间横向通信：打破"埋头干"的信息孤岛

三种模式：主动广播、被动查询、求助升级。需要引入"熟人网络"、"技能索引"、"通信预算"等约束。

### 7.5 基于 OKR 的目标与进度管理

Team OKR 由 Leader 和所有 Worker 共同讨论产出；Worker OKR 由每个 Worker 认领并进一步拆解。里程碑触发、偏离预警、KR 达成即关闭。

### 7.6 岗位要求与团队宗旨：让每个 Agent 知道自己为什么在这里

引入显式岗位定义（JD）：能力要求、可用 Skill 池、质量标准、汇报关系、SLA。Mission 回答"我们为什么存在"；核心宗旨回答"我们做事的原则是什么"；OKR 回答"我们本季度具体做什么"。

### 7.7 集体复盘与团队演化

Leader 主持、所有 Worker 参与，结构化输出三类资产：方法论、协作模式、反模式。

## 八、与现有框架差异维度

| | CrewAI / AutoGen | Meta-Team | 我的 Team 机制 |
|--|-----------------|-----------|--------------|
| Leader | 分发器 | 无显式 Leader | 资深专家 + 兜底人 |
| 任务启动 | 直接拆分 | 手工设计 | 讨论后产出 OKR |
| Worker 交互 | 隔离 | 仅演化阶段讨论 | 执行中 P2P + 求助 |
| 进度管理 | 无 | 无 | OKR + 里程碑 |
| 经验沉淀 | 无 | 三层集体进化 | Leader 驱动复盘 → 团队资产 |
| 团队目标 | 无 | 无 | Mission + OKR |

## 九、类比人类组织演化

- **部落（当前）**：简单分工，做完就散，无记忆无沉淀
- **城邦（近期）**：明确角色、协作规则、进度跟踪
- **企业（中期）**：Mission + OKR，集体复盘，人才梯度
- **生态（远期）**：多 Team 形成协作网络，有契约、竞合、知识交换

## 十、Agent Autonomy 分级

- L1 - Copilot：人主导，Agent 辅助
- L2 - Task Agent：人给明确指令，Agent 执行单步
- L3 - ReAct Agent：人给意图，Agent 自主完成
- L4 - Team Agent：多 Agent 协作，有内部协调机制
- L5 - Autonomous Organization：自主发现问题、组建团队、协作执行、集体演化

**当前在 L3→L4 之间。Meta-Team / EvoChamber 标志着 L4→L5 过渡开始。**
