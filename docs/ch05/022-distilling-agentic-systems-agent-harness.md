# Distilling Agentic Systems：Agent 蒸馏系统级综述（模型 / 可复用资源 / Harness 三条主线）

> 📊 Level ⭐⭐⭐ | 13.7KB

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

## 深度分析

### 「文件格式不能决定分类」是把 Harness 升格为独立知识载体的关键判据

综述最锋利的一刀，是把「这条知识保存在哪种载体里」的判定从存储形态中剥离出来：单独保存的模型适配器（如 LoRA 权重）仍属参数化知识，可调用的辅助脚本属 Artifacts，而决定何时调用脚本的机制属 Harnesses。分类依据是知识如何参与未来执行，而不是它叫什么、存在哪里。

这一判据的工程后果是：不能靠「整理文件夹」来治理 Agent 的知识结构——把工作流文件、脚本和控制逻辑混在一个目录里，不等于把它们归为一类知识。Harness 从「一堆配置文件」升格为与模型、资源并列的独立知识载体后，[Harness 工程范式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-harness-engineering-paradigm.md) 的对象才真正清晰：被设计、被版本化、被评估的是「何时调用什么」的控制逻辑本身。它与 [何时不用 Harness 工程](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/when-not-to-harness-engineering.md) 互为边界——正因为 Harness 是一类需要维护的知识，才有「何时不该把它做成 Harness」的成本问题。

### 学生自产轨迹上的教师指导：Agent 蒸馏区别于模型蒸馏的真正难点

模型蒸馏假设学生的输入分布与教师一致；Agent 场景打破了这个假设——学生的每个动作都会改变后续状态与反馈，仅模仿教师轨迹覆盖不到自主执行中才会遇到的情形。综述为此指出的方向是在学生自产轨迹上引入教师指导，让教师信号作用于学生实际会经历的状态分布。

这与强化学习里 on-policy 与 off-policy 的分野同构：教师轨迹是 off-policy 数据，自产轨迹上的指导才逼近 on-policy 训练。对 [Agent 自我改进循环](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-self-improvement-loops.md) 而言，这解释了为什么「回放自己跑过的记录再改进」比「照抄示范」更有效——前者在学生自己的分布上修正策略，后者只在教师的分布上积累偏差。

### 组件回退实验：把「分数提高」归因到具体载体

综述的评估框架核心是一个因果设计：在控制其他组件、任务条件与执行预算的前提下，把某个蒸馏后的组件恢复到蒸馏前状态，观察学生行为与表现的变化——这正是因果推断中的消融/回退实验。它解决的归因问题是真实的：得分提升可能来自模型学习、新增技能、更好的路由，或仅仅更多执行预算，四者混在一起时「蒸馏收益」不可解释。

这条设计把评估从「看总分」推进到「看载体贡献」，与 [Agent 评估基准框架](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-evaluation-benchmark-frameworks.md) 的问题意识一致但更细一层：基准框架回答「系统整体强不强」，回退实验回答「强在哪一层」。对自进化系统，这与 [Eval-Optimizer 防火墙](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/eval-optimizer-firewall.md) 的思路相通——改进主张必须先经过独立评估通道的检验，才能被记入账本。

### 持续维护是被蒸馏知识的一部分，而非蒸馏之后的附加项

综述把「经验会过期、工具会升级、权限会变化」写进了分配原则本身：保留知识之后还需记录来源、适用条件与依赖关系，并支持修改、撤销与回滚。这意味着知识载体的选择不能只看「现在放哪里最有效」，还要看「过期后改哪里最便宜」——参数化知识的修改成本最高（重新训练），资源次之（可编辑），控制逻辑介于两者之间。

这与 [Agent 记忆生命周期哲学](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-lifecycle-philosophies.md) 中「记忆是需要治理的资产」的立场、以及 [Harness 组件过期与 build-to-delete](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-component-expiry-and-build-to-delete.md) 的实践在逻辑上同源：经验积累与经验维护是同一件事的两个阶段，任何只做积累不做维护的蒸馏管线都会随时间净损耗价值。

## 实践启示

1. **先分类，再选算法**：拿到一段可复用经验，先判断它属于参数化知识、可复用资源还是执行控制，再谈具体蒸馏方法；文件格式不构成分类依据。
2. **可变知识不做参数化**：频繁变化的知识（API 约定、操作规范、权限边界）保存在可编辑资源里；只有频繁使用且相对稳定的决策模式才值得训练进模型——重训的成本远高于改一份 Skill 文档。
3. **验证、恢复与权限约束写进 Harness 而非文档**：「出现回归就回滚」写在 Skill 文档里只是资源，做成运行时必经分支才是控制；凡是不执行就无效的约束，都应落在 Harness 层。
4. **每条蒸馏收益都做组件回退实验**：加了一个 Skill 或一条控制规则后，把该组件恢复到蒸馏前状态对比表现，把收益归因到具体载体，避免把路由改善或预算增加误记为蒸馏收益。
5. **教师指导作用于学生自产轨迹**：蒸馏管线应让学生先自主执行、再在其实际产生的轨迹上引入教师反馈，而不是只回放教师轨迹——覆盖学生真实分布的指导才可迁移。
6. **把维护成本计入载体选择**：记录每条沉淀知识的来源、适用条件与依赖，并保留修改、撤销与回滚通道；持续积累经验必然意味着持续维护经验，只进不出的资源库会净损耗价值。

## 关联

- [模型蒸馏与压缩](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-distillation-compression.md) — 参数层面的传统蒸馏路线
- [Harness 工程范式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-harness-engineering-paradigm.md) — Harness 作为知识载体的定位
- [Agent 自我改进循环](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-self-improvement-loops.md) — 自蒸馏与经验沉淀的上层循环
- [上下文工程](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md) — 知识的可维护性与腐坏
- [Hermes Learn 模式 Skill 蒸馏](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-learn-mode-skill-distillation.md) — 轨迹→技能的工程实例
- [EDV：执行-蒸馏-验证自进化](https://github.com/QianJinGuo/wiki-public/blob/main/entities/edv-execute-distill-verify-agent-self-evolution-zju.md) — 自蒸馏闭环实例
- → [原文存档](https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247723504&idx=1&sn=e81af41ba28ca17028f8bdaa2c3abc93)

---

