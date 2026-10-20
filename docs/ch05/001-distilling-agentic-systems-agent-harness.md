# Distilling Agentic Systems：Agent 蒸馏系统级综述（模型 / 可复用资源 / Harness 三条主线）

> 📊 Level ⭐ | 7.9KB

## Distilling Agentic Systems：Agent 蒸馏系统级综述

中南大学、北京智源人工智能研究院、香港理工大学、北京邮电大学等机构联合发布的 57 页综述《Distilling Agentic Systems: A Roadmap across Models, Artifacts, and Harnesses》，把知识蒸馏从「模型→模型」扩展到「完整 Agent 系统→完整 Agent 系统」，以「知识在学生的哪个位置被保留」为主轴建立定义、分类与评估框架。→ [原文存档](https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247723504&idx=1&sn=e81af41ba28ca17028f8bdaa2c3abc93)

## 为什么要从模型蒸馏走向 Agent 蒸馏

Agent 的任务求解能力来自模型、可复用资源与执行控制的共同作用。一个编程 Agent 修好了 Bug，换一个 Agent 接手新仓库时原来的补丁可能已经用不上，但诊断问题的方法、测试的顺序、出现回归时的回滚策略仍然值得复用——这些经验可以被模型学会，也可以沉淀为可调用的技能，或转化为执行流程中的控制规则。知识蒸馏因此必须同时考虑三者。

综述给出的定义是：Agent 蒸馏指从教师 Agent 提供的证据中提炼任务求解知识，并将其持久融入学生 Agent，使这些知识在原始交互结束、教师不再参与后仍可用于后续任务。因此一次临时提示或在线求助本身不构成蒸馏——关键在于它是否给学生留下了可供未来使用的变化。教师也可以是同一个 Agent 的早期版本，这让跨 Agent 传授经验与基于历史经验的自我演进落在同一套定义下。

## 三条主线：知识保留在模型 / Artifacts / Harness

分类依据是知识如何参与未来执行，而不是训练材料叫什么、用了哪种优化算法、或是否保存成了文件。

| 载体 | 知识形态 | 代码修复场景中的表现 | 主要工程难点 |
|------|---------|---------------------|------------|
| Models（参数化） | 通过训练把教师经验压进学生参数 | 学会修改后主动验证、遇回归时调整策略 | 学生的行动会改变后续状态与反馈，仅学教师轨迹覆盖不到自主执行中的情形；需在学生自产轨迹上引入教师指导 |
| Artifacts（可检索/可调用资源） | 记忆、示例、技能、代码、工具 | 把修复过程抽象为带适用条件的调试技能，或保存为验证过的辅助脚本 | 重点是筛选、抽象、验证：临时信息、过时接口、相互冲突的建议都会降低复用价值；资源库需随环境更新、合并、删除 |
| Harnesses（执行控制） | 决定何时调用资源、如何分配预算、哪些结果要检查、失败后如何重试/回滚/终止 | 「出现回归就回滚」写成 Skill 文档是资源，实现为运行时必经分支则是控制 | 需要与 Artifact 明确区分，否则工作流文件、脚本和控制逻辑会被混为一类 |

这里最有判别力的一条是：**文件格式不能决定分类**。单独保存的模型适配器仍属于参数化知识；可调用脚本属于资源；决定何时调用脚本的机制属于执行控制。这条判据把 [Harness](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-harness-engineering-paradigm.md) 从「一堆配置文件」提升为独立的知识载体。

## 跨载体迁移与混合式蒸馏

三类载体之间可以互相转换：一份调试技能可以作为训练材料被学生模型吸收，其中关于检查、重试、回滚的规则也可以进一步转化为执行控制逻辑。综述把这种转换称为**跨载体迁移**，关注的是知识改变表达形式之后，原本有用的判断和行动策略能否保留下来。多个学生组件同时保留知识的状态称为**混合式蒸馏结果**，两者可以同时发生。

这与既有的 [模型蒸馏与压缩](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-distillation-compression.md) 路线形成互补：后者关心参数层面的压缩比与精度损失，前者关心「同一份经验放在哪个载体上最不容易过期」。与 [Hermes Learn 模式的 Skill 蒸馏](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-learn-mode-skill-distillation.md) 这类把轨迹转成可复用技能的实践、以及 [EDV（Execute-Distill-Verify）自进化](https://github.com/QianJinGuo/wiki-public/blob/main/entities/edv-execute-distill-verify-agent-self-evolution-zju.md) 的自蒸馏流程相比，综述提供的是统一的坐标系：先判定知识落在哪一层，再讨论用什么算法。

## 评估：分数提高不等于知识被保留

学生得分提高只能说明系统表现改善，却不能说明教师知识被保留在哪里——提升可能来自模型学习，也可能来自新增技能、更好的路由或更多执行预算。为此综述构建了连接「知识保留—因果贡献—实际任务收益」的评估框架：在控制其他组件、任务条件与执行预算的前提下，把某个蒸馏后的组件恢复到蒸馏前状态，观察学生行为与表现如何变化；再结合新任务测试、成本与失败分析，把「留下了什么」「起了什么作用」「带来多少收益」连接起来。

这一评估设计对 Agent 工程的实际意义是：任何「加了一个 Skill / 加了一条控制规则」的改动，都应当能用组件回退实验区分出收益来自哪一层，否则很容易把路由改善误记为蒸馏收益。它与 [Agent 自我改进循环](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-self-improvement-loops.md) 的验证需求同构——自进化系统的每一次「变强」都需要可归因。

## 工程分配原则：经验放哪里

综述最后落到一个纯工程问题：哪些经验适合训练进模型，哪些适合保存为可编辑资源，哪些应转化为执行控制规则？给出的分配原则是——频繁使用且相对稳定的决策模式可以考虑参数化；经常变化的知识或具体操作规范适合保存在可更新资源中；验证、恢复与权限约束则通过显式控制逻辑实施。具体选择仍取决于成本、更新频率、可迁移性与安全要求。

同时必须承认经验会过期、工具会升级、权限会变化：保留知识之后还需要记录来源、适用条件和依赖关系，并支持修改、撤销与回滚——**持续积累经验也意味着持续维护经验**。这条结论与 [上下文工程](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md) 里「上下文是会腐坏的资产」是同一件事在不同层级上的表述。

## 关联

- [模型蒸馏与压缩](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-distillation-compression.md) — 参数层面的传统蒸馏路线
- [Harness 工程范式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-harness-engineering-paradigm.md) — Harness 作为知识载体的定位
- [Agent 自我改进循环](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-self-improvement-loops.md) — 自蒸馏与经验沉淀的上层循环
- [上下文工程](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md) — 知识的可维护性与腐坏
- [Hermes Learn 模式 Skill 蒸馏](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-learn-mode-skill-distillation.md) — 轨迹→技能的工程实例
- [EDV：执行-蒸馏-验证自进化](https://github.com/QianJinGuo/wiki-public/blob/main/entities/edv-execute-distill-verify-agent-self-evolution-zju.md) — 自蒸馏闭环实例
- → [原文存档](https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247723504&idx=1&sn=e81af41ba28ca17028f8bdaa2c3abc93)

---

