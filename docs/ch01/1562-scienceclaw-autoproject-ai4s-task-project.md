# ScienceClaw AutoProject：紫东太初把 AI4S 从 Task 推向 Project（项目级自主科研引擎）

> 📊 Level ⭐⭐⭐ | 5.9KB | `entities/scienceclaw-autoproject-project-level-ai4s-zidong-taichu-2026.md`

# ScienceClaw AutoProject：紫东太初把 AI4S 从 Task 推向 Project

## 核心命题：AI 在科研中的工作单位，从 Task 走向 Project

AI for Science 正进入新的分水岭。过去 AI 更多作为工具或任务智能体，在科研人员明确目标、边界和路径后完成一个个相对独立的 Task；但真实科研并非任务的简单集合——一个 Project 往往从模糊的研究构想开始，包含多个相互依赖的任务，并随新文献、实验结果和异常数据不断调整研究路线。「把一个个 Task 做好，不等于真正完成一个 Project。」

真正的项目级科研，需要 AI 理解科学目标、主动拆解任务、协调任务依赖、持续执行，并根据研究反馈动态调整，最终推动整个项目走向结论。中科紫东太初（中国科学院自动化研究所孵化的多模态大模型企业）旗下科研原生智能体 ScienceClaw 完成关键升级，推出 AutoProject 项目级自主科研引擎，让 AI 的工作单位从 Task 走向 Project——这本质是 AI 科研能力由「工具级」向「系统级」的跨越。

## AutoProject 的三层核心能力

AutoProject 并非简单延长任务执行链路，而是围绕项目规划、长程执行、证据验证构建项目级自主科研能力，全流程为：项目规划→子 Task 拆解→长程执行→证据验证→动态修复→成果沉淀。

- **Project2Task（项目级规划）**：回答「这个 Project 应该怎么做？」综合研究目标、文献证据、资源约束与任务依赖，自主确定研究路径、拆解子 Task、规划串并行关系与资产复用，生成可执行可迭代的任务网络。支持横向拆分、纵向拆分、先横后纵、先纵后横四种项目拓扑。从「人定义 Task、AI 执行」到「人提出目标、AI 规划路径」。

- **TaskExecutor（长程自主执行）**：回答「确定方向后如何持续推进？」打破「一次调用、一次返回」的线性模式，搭建目标驱动的自主科研循环：全局监控 Project 状态、持续捕获实验反馈、自动排查异常、修正研究假设与模型参数；任务失败时可回溯评估、重构任务网络、自主重跑实验。

- **EviGraph（证据驱动验证）**：回答「结论是否有充分证据支撑？」科研结论不能仅满足行文通顺，每条项目级结论必须依托明确研究问题、科学假设、多组对照实验与真实数据。EviGraph 构建全链路、跨子任务、可核验、可回溯、可修复的可信科研闭环，校验不再局限于单个子任务内部，还兼顾跨任务逻辑一致性；一旦检出偏差，沿证据链定位根因、按需重跑实验。

## 实证数据（ARCBenchML）

在 ARCBenchML 评测中，EviGraph 综合得分 0.865（最优基线 0.596）；代表结论贴合实验事实的 Result Analysis 指标由 0.442 提升至 0.794；可追溯证据的 Claim Support Rate 达 0.38，较最优基线 0.27 提升 40.74%；实验数据一致性 EDC 为 0.88。

## 人机协作定位：自主科研 ≠ 无人科研

即便引擎能完成规划、执行、校验、成果沉淀的全链路，科研人员仍发挥不可替代的核心作用——可随时介入，针对 AI 输出的研究路径、实验假设、中间数据开展鉴赏评判、及时纠偏，注入人类领域直觉与科学洞察力。AI 的角色从被动响应需求的科研助手，成长为科研项目的自主推进者。

## 技术根基：多模态 + 分层自治多智能体架构

ScienceClaw 并非传统「主从 Agent」体系，而是一套面向复杂科研任务的分层自治、多智能体动态协同架构：系统围绕科研目标自动生成任务图，按需调度学科、代码、搜索、数据分析、仿真等专业 Agent，形成可动态组网、协同执行、反馈重规划的科研智能体集群。紫东太初自 2021 年发布全球首个千亿参数三模态大模型，如今紫东太初 4.0 从「理解多模态」走向「多模态推理」。已覆盖生命科学、材料、化学、物理、天文等领域。

## 相关实体

- [AI4S 2026 H1 跨学科前沿全景](../ch05/113-ai.html) — AI4S 赛道全景（尹希），与本文的项目级范式互补
- [深度原理 MIRA + MPA 材料基座模型](../ch05/113-ai.html) — 另一 AI4S 材料基座技术路线
- [Claude Science 科研 Agent](../ch03/085-claude-code.html) — 西方科研 Agent 对比参照
- [多智能体编排](https://github.com/QianJinGuo/wiki/blob/main/concepts/multi-agent-orchestration.md)
- [Agent 规划与推理](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-planning-reasoning.md)
- [Agent 编排模式](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-orchestration-patterns.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/ai4s-project-era-zidong-taichu-scienceclaw-autoproject-2026.md)

---

