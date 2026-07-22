# QoderWork Skills 开发实践：从传统数科到 AI 数科的转型探索

## Ch09.057 QoderWork Skills 开发实践：从传统数科到 AI 数科的转型探索

> 📊 Level ⭐⭐ | 11.1KB | `entities/qoderwork-skills-development-practice-taobao.md`

# QoderWork Skills 开发实践：从传统数科到 AI 数科的转型探索

> 大淘宝技术团队系统总结了QoderWork Skills开发的方法论与工程体系，提出了由编排层（SKILL.md）、参数层（config.yaml）、实现层（scripts/）和知识层（references/）构成的四层分离架构。通过用户洞察报告、AB实验分析等自研Skill的实战经验，提炼了Description定义、流程编排、配置模板化及渐进式披露等关键开发技巧，旨在通过工程化手段实现团队知识沉淀与标准化，释放人力聚焦高价值业务决策。

## 摘要

本文以作者从传统数据科学（数科）向AI数科转型的实践为背景，系统阐述了QoderWork Skills的开发方法论与工程体系。核心洞见是：Skill不是独立的工具或应用，而是给AI Agent的一份"领域专家手册"——将领域知识、标准流程及避坑指南封装为AI Agent可执行的"数字助手"。文章通过对比Follow Builders和Frontend Slides两个优秀Skill案例，以及用户洞察报告、AB实验分析两个自研Skill的实战经验，深入分析了SKILL.md的编排职责、config.yaml的模板化设计哲学、scripts/的确定性逻辑封装、references/的渐进式披露策略。特别值得一提的是，文章揭示了"Skill开发中70-80%的工作量在于测试而非编写"这一反直觉事实，以及"给代码不如给流程"的核心原则。

## 核心要点

1. **四层分离架构**：SKILL.md（编排层，只负责流程编排和决策指引，不嵌入大段实现代码）+ config.yaml（参数层，模板而非表单，用`auto`占位符让运行时填充）+ scripts/（实现层，封装确定性逻辑确保执行一致性）+ references/（知识层，渐进式披露详细原理和背景知识）
2. **SKILL.md的核心原则**：控制在200行以内（实测170行和133行效果最佳），只回答四个问题——何时触发（触发条件）、有哪些步骤（步骤编排）、每一步调用哪个脚本的哪个函数（实现委托）、遇到异常如何决策（判定标准）
3. **config.yaml的设计哲学**：应定义为参数结构模板而非填写好的表单。好的config用`auto`占位符表示自动检测填充，用空列表`[]`定义结构框架，注释标注[必填]/[自动检测]/[默认值]
4. **Skill = 领域知识 + 标准流程 + 输出模板 + 避坑指南**：Agent读取这份手册后，能按照团队专业标准执行分析任务。Skill解决的不是"让模型更聪明"，而是"让系统更可控"
5. **测试是Skill开发的主体工作**：用模拟数据跑通全流程、反复调整优化，测试工作占据了Skill实际开发的70-80%。Token消耗极大，需要思考如何在开发过程中节约成本

## 深度分析

### 1. 四层分离架构的设计理性

四层分离的本质是对"AI Agent在不同抽象层级上的能力边界"的精准判断：

- **SKILL.md（编排层）**：Agent最擅长理解结构化指令和流程，但它不擅长在单一文件中同时管理流程和代码——长文本中代码段会导致注意力散失。因此SKILL.md只做编排。
- **scripts/（实现层）**：Agent能写代码，但每次临场发挥的代码在一致性上不可靠。统计检验方法选择、字段自动检测、图表样式等确定性的复杂逻辑必须固化到脚本中，保证每次执行结果一致。
- **references/（知识层）**：上下文窗口是稀缺资源。SKILL.md只告诉Agent"怎么做"，references/回答"为什么这么做"。Agent在正常执行时读SKILL.md就够了；当用户追问时再按需引用references/——这是"渐进式披露"的核心实践。
- **config.yaml（参数层）**：将"跨会话持久化"的配置从运行时对话中剥离出来，避免每次启动时重复收集信息。

这一架构与[Harness Engineering](../ch05/116-harness-engineering.html)中的"三层叠加"（Prompt → Context → Harness）异曲同工：四层分离正是Harness Engineering在Skill粒度上的具体实现。

### 2. Follow Builders vs Frontend Slides——两种Skill设计范式的对比

文章对两个外部Skill案例的深入拆解是本文最精彩的部分，揭示了Skill设计的两个极端。

**Follow Builders**（中心化数据服务 + 极简配置）：没有config.yaml，配置通过对话收集并存到`~/.follow-builders/config.json`；数据源通过GitHub Actions流水线预抓取，用户端无需API key。这代表了"配置溶解到运行时 + 数据服务外置"的胖服务端模式。

**Frontend Slides**（纯编排 + 零脚本核心 + 反模式清单集中化）：核心功能（生成HTML幻灯片）完全靠SKILL.md编排 + 知识层4个文件，不依赖任何脚本——因为生成HTML/CSS/JS代码恰好是AI最擅长的事。设计上通过"NON-NEGOTIABLE"标注法（同一铁律出现4次不同表述对抗注意力衰减）、反模式清单（显式阻断最高频输出组合）、内容密度限制表、一次性问完指令等技巧，将AI的工程化发挥到极致。

这两个案例揭示的规律是：**脚本层的大小与核心任务是否属于AI擅长领域成反比**——AI越擅长核心任务，脚本层越小，编排层越精妙。

### 3. 从Idealab RAG到QoderWork Skills的演进——结构化的力量

作者在Idealab AI Studio上的实践（Prompt Engineering + 知识库RAG构建"用户理解助手"）是Skills的雏形。从Idealab到QoderWork的演进，本质上是一次"从对话型助手到结构化Skill"的质变：

| 维度 | Idealab RAG | QoderWork Skills |
|------|-------------|------------------|
| 知识注入 | 运行时Retrieval | 设计时结构化 |
| 流程控制 | 用户对话驱动 | Skill编排驱动 |
| 输出质量 | 依赖模型即时能力 | 模板+脚本保障一致 |
| 复用性 | 每次从头对话 | 一次编写多次调用 |
| 团队协作 | 个人经验 | 团队知识沉淀 |

这一演进映射了AI工程化从"让AI更聪明"到"让系统更可控"的范式转变——不是追求模型本身能力的提升，而是通过工程手段将确定性注入概率性系统。这与[Agent落地真相](../ch03/046-agent.html)中"从跑通到投产"的鸿沟是同一枚硬币的两面。

### 4. 测试驱动Skill开发的70-80%法则

文章揭示了一个反直觉但至关重要的经验：Skill开发中70-80%的工作量是测试，而非编写。原因在于Agent的"大模型随机性"——同一个Skill在相同输入下每次执行可能走不同的分支，结果是不可穷举的。有效的测试策略包括：
- 用模拟数据（而非真实数据）跑通全流程，确保边界条件被覆盖
- 反复测试直到Agent在不同温度参数下都能稳定产出符合Schema的输出
- 通过`find-skills`元Skill检索社区已有方案，避免重复造轮子

这一数字与[Agent配置模型](../ch04/267-skill.html)中"配置需要反复调参"的经验高度一致——AI工程的测试成本远高于传统软件工程，因为概率性系统的行为空间远大于确定性系统。

### 5. "给代码不如给流程"的深层含义

文章强调"SKILL.md的职责不是怎么写Python，而是分析应该包含哪些步骤、关注哪些指标、注意哪些陷阱"。这一原则的背后是"Agent能力分布的非对称性"：

Agent极擅长的事情：理解自然语言指令、设计代码结构、编写样板代码、解释已有代码
Agent不擅长的事情：把控商业数据分析流程、理解隐性业务约束、做出领域特定的权衡决策

所以SKILL.md的正确写法是：用自然语言说清楚流程（当数据不满足正态分布时回退到Mann-Whitney U），把代码实现放scripts/让Agent调用。这看似"把简单的事情复杂化"，实则是"把AI的注意力集中在它最不擅长的那部分（流程决策），而把确定性逻辑（代码实现）交给脚本保障"。

## 实践启示

1. **从"对话助手"起步，逐步Skill化**：不需要一开始就追求四层分离的完整架构。可以先从简单的SKILL.md开始，体验到Agent按规范流程工作的效果后，再将确定性逻辑逐步下沉到scripts/，将背景知识逐步沉淀到references/。关键是先跑通再优化。

2. **test-cases.md与requirements.md同源产出**：在P1（需求）阶段同时产出测试用例和需求文档，共用同一份AC（Acceptance Criteria）列表。这可以防止P4（测试）阶段"重新理解一遍需求自己写测试"导致的认知偏差。

3. **反模式清单是Skill设计的高阶技巧**：不仅告诉Agent"要做什么"，还显式列出"不要做什么"——如"不要使用Inter/Roboto/Arial字体"、"不要使用紫色渐变配白色背景"。大模型的"模式坍缩"倾向会让它总是输出最高频的组合，必须用负向约束显式阻断。

4. **单元测试驱动开发（UTDD）是最有效的质量保障**：先生成测试用例，再生成实现代码，用测试用例约束代码质量。这比事后Review更高效，因为测试定义了"正确"的边界，AI的实现只需满足这些边界即可。

5. **Token消耗是Skill开发的一级成本**：测试一个中等复杂度Skill可能消耗数十万tokens。建议（a）使用模拟数据而非全量数据测试，（b）在开发阶段使用性价比更高的模型，（c）将`find-skills`元Skill作为常规步骤，发现已有轮子就不重复发明轮子。

## 相关实体

- [Harness Engineering探索之旅](../ch05/116-harness-engineering.html)
- [Agent配置模型](../ch04/267-skill.html)
- [Agent落地真相](../ch03/046-agent.html)
- [淘宝数字人Agentic架构](../ch04/235-agentic.html)
- [阿里巴巴NL2SQL Harness](../ch05/116-harness-engineering.html)
- [AI友好后端标准](../ch05/023-ai-friendly.html)
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- AI原生工程

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/qoderwork-skills-开发实践.md)

---

