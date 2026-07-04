# 京东健康 OPC 团队产品全流程 Skill 探索

## Ch07.031 京东健康 OPC 团队产品全流程 Skill 探索

> 📊 Level ⭐⭐ | 10.0KB | `entities/jd-health-opc-skill-full-process.md`

# 京东健康 OPC 团队产品全流程 Skill 探索

## 摘要

京东健康 OPC（One Person Company）团队在无专职产品角色的模式下，探索将产品全流程 Skill 化——从需求判断、方案设计到交付验证，构建完整的 Agent Skill 体系。基于 Anthropic 开源的 Product Management Skills，他们适配了 OPC 场景的 8 个核心 Skill，实现从问题发现到上线复盘的完整产品闭环。

## 背景

在 OPC 团队中，没有专职产品角色。团队不仅要关注"把需求做完"，还必须回答更前置的问题：这个问题是否真的值得做？证据来自用户、数据还是直觉？需求边界是否清楚？上线后如何判断成功或失败？Anthropic 开源的 Product Management Skills 正好可以承接这些问题——它本质上是一套产研共同决策框架，把从发现问题到上线复盘的过程拆成一组可重复使用的动作。

## 核心设计

### 8 个 Product Management Skill

京东健康基于 Anthropic 开源的 `product-management/skills` 仓库适配了 8 个 Skill，覆盖产品全流程：

| Skill | 阶段 | 功能 |
|-------|------|------|
| synthesize-research | 问题判断 | 综合研究材料，判断问题价值 |
| metrics-review | 问题判断/复盘 | 用指标验证结果 |
| competitive-brief | 问题判断 | 竞品分析简报 |
| product-brainstorming | 需求定义 | 发散问题空间和方案空间 |
| write-spec | 需求定义 | 生成结构化需求规格 |
| roadmap-update | 排期执行 | 在路线图中定位需求 |
| sprint-planning | 排期执行 | 把路线图落到迭代计划 |
| stakeholder-update | 上线复盘 | 分对象同步进展 |

### 产品全流程四阶段

#### 第一阶段：问题判断

目标：判断"这个问题是否足够重要"，而不是证明"我们想做的方案是对的"。

关键实践——不要直接把材料无差别丢给 AI，每份材料进入 Skill 前至少带上 5 个字段：来源、时间、对象、内容、关联。Anthropic 的做法是支持三类输入：直接粘贴（访谈记录、会议纪要、工单摘要）、上传文件（研究文档、表格、录音转写）、连接工具（知识库、用户反馈系统）。虽然海外工具连接器在中国不可用，但思路完全可以复用——把内部系统的材料映射到同样的证据类别。

**本阶段产出**：问题主题清单 + 证据与置信度评估 + 是否进入需求定义的结论。

#### 第二阶段：需求定义

目标：把"值得做的问题"打磨成可评审、可拆解、可验收的需求规格。

先发散（product-brainstorming）——帮助团队拆开问题空间、方案空间和关键假设，推动团队追问"谁真正有这个问题？用户现在如何绕过？这是症状还是根因？最便宜的验证方式是什么？"。再收敛（write-spec）——生成包含 Problem、Evidence、Goals、Non-goals、Requirements(P0/P1/P2)、Acceptance Criteria、Metrics、Open Questions 八个部分的结构化需求规格。

**本阶段产出**：经过假设检验的方向 + 一份结构完整的需求规格文档。

#### 第三阶段：排期执行

目标：把需求放进优先级、容量和依赖约束，落成可执行的迭代计划。

先定位置（roadmap-update）——判断需求应放在 Now/Next/Later，写清楚变更原因、影响范围、取舍结果。再落计划（sprint-planning）——确定 sprint goal、团队真实可用容量、P0/P1/P2。关键原则：建议只规划 70-80% 的产研资源容量，剩余空间留给线上问题、临时协作和不可预期中断。新增需求不是"多做一点"，而是一次资源再分配。

**本阶段产出**：一份带取舍说明的 roadmap 变更记录 + 一份带容量约束的迭代计划。

#### 第四阶段：上线复盘

目标：用指标验证结果，形成下一步决策，并向不同对象完成同步。

用 metrics-review 对照需求最初定义的成功指标，回答：目标指标是否变化？哪些领先指标最先出现信号？哪些用户群体受益最大？是否出现负向影响？复盘时要避免只说"已上线""已完成"，应回答"上线后我们学到了什么，下一步决策是什么"。同步时使用固定状态色（Green/Yellow/Red）帮助团队尽早处理风险，且同一件事对不同对象应有不同表达方式。

**本阶段产出**：一份指标对照的复盘结论 + 面向不同对象的同步材料。

## 深度分析

### 1. OPC 模式的本质：产品判断力的技能化

OPC（One Person Company）模式的核心理念是让小型团队拥有端到端的交付能力。京东健康的实践揭示了一个更深层的洞察：OPC 最稀缺的不是技术能力，而是**产品判断力**——判断问题是否值得做、证据是否充分、方案是否最优。通过将产品管理流程 Skill 化，团队将产品思维从个人的隐性知识转化为可复用、可评审、可迭代的显式工作协议。这不是在替代产品角色，而是在赋能无产品角色的团队做出更好的产品决策。

### 2. Skill 作为决策框架而非自动化脚本

值得注意的设计哲学：这些 Skill 不是简单的任务自动化脚本，而是一套**决策框架**。每个 Skill 的目的是引导人类做出更好的判断，而不是替代人类的判断。例如 synthesize-research 帮助团队评估证据强度，write-spec 强制团队回答"为什么不做"（Non-goals）和"做到什么程度算完成"（Acceptance Criteria）。这与 [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 中"Agent 应辅助人类而非替代人类"的核心理念一致。

### 3. 从"快速交付"到"做正确的事"的范式转变

传统 OPC 的挑战在于：团队以交付速度为导向，但缺乏产品判断环节，容易做错误的事情。京东健康的实践引入了一个关键前置门禁——"任何需求只要进入开发，就至少要经过‘证据、假设、边界、排期、验收、复盘’六个环节"。这条判断链的内在逻辑是：先判断问题是否值得做（证据+假设），再把方向打磨成可执行需求（边界），再把需求放进约束条件（排期），最后用指标验证结果（验收+复盘）。这种结构化流程将产品风险从"上线后才发现做错了"前移到"开发前就验证假设"。

### 4. 七大常见错误与反模式

京东健康在实践中总结的七大常见误区，对任何采用 AI 辅助产品开发的团队都有借鉴价值：(1) 拿到需求就写 PRD——跳过问题判断阶段；(2) 用 Skill 证明既定方案的合理性——问题判断的目标不是找论据；(3) 材料无差别丢给 AI——缺少结构化输入产出低置信度结论；(4) 把新增需求当成"多做一点"——容量恒定时，新增需求必然挤占其他；(5) 迭代排满 100% 容量——没有缓冲空间应对不可预期中断；(6) 复盘只说"已上线"——上线是验证的开始，不是结束；(7) 对所有人用同一份汇报——不同角色的信息需求不同。

### 5. 与行业趋势的关联

京东健康的 OPC Skill 实践与多个行业趋势高度相关：(1) 与 Anthropic Product Management Plugin 的深度绑定：这些 Skill 直接来源于 Anthropic 的开源仓库，体现了 AI 原生开发工具的生态化趋势；(2) 与 Agent Harness 工程范式框架的互补：Harness 关注 Agent 的技术基础设施，而 OPC Skill 关注产品决策流程——两者共同构成了 Agent 团队协作的全栈能力；(3) OPC 模式在 Agent 时代的价值：当 AI 能加速"做"的速度时，"判断做什么"的能力变得更加稀缺和关键。

## 实践启示

1. **产品判断力 > 技术执行力**：在 OPC 模式中，最稀缺的是产品判断力而非编程能力。将产品流程 Skill 化是弥补这一缺口的高效方式。

2. **结构化输入决定输出质量**：材料进入 Skill 前至少带上来源、时间、对象、内容、关联五个字段。无差别输入是 AI 辅助决策失败的头号原因。

3. **保留 20-30% 容量缓冲**：迭代计划只排 70-80% 容量，为线上问题、临时协作和返工预留空间。这条原则在 OPC 团队中尤为关键。

4. **复盘回答"学到了什么"而非"做了什么"**：上线是验证的开始。复盘的核心产出应该是假设验证结果和下一步决策，而非上线清单。

5. **最小启动路径**：不需要一次性启用全部 8 个 Skill——先用 synthesize-research → write-spec → metrics-review 三个 Skill 跑通核心链路，再逐步补充其余环节。

6. **分层同步**：管理层要结论和决策点，研发要阻塞和优先级，跨职能团队要配合事项。同一件事按对象裁剪表达。

## 相关实体

- [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- [Agent Harness Engineering Paradigm](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-harness-engineering-paradigm.md)
- [面向 Agent 的后端设计](ch03/045-agent.md)
- [企业 Agent 编排](ch03/045-agent.md)

## 来源

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jd-health-opc-skill-full-process.md)

---

