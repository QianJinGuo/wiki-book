# Harness Engineering 的未来——什么会消失，什么不会

> 📊 Level ⭐⭐⭐⭐ | 10.8KB

> **背景**：郭美青，2026年5月21日。本文从模型能力跃升的视角审视 Harness Engineering 的未来，提出"主权不可自生"作为划分可自动化与不可自动化工作的核心框架。

## 摘要

随着模型能力持续跃升，Harness Engineering 中的部分工作将被内化到模型中——但治理层面的工作不仅不会消失，反而更加重要。本文提出"主权不可自生"（Sovereignty Cannot Self-Generate）作为分界线的本质：被取代的工作回答"怎么做"（how），不会被取代的工作回答"该不该做"（whether）。在此框架下，Harness Engineering 将经历三阶段演进：短期 Agent 架构师 → 中期审核自动生成的 Harness → 长期治理工程。

## 核心框架：主权线

### "主权不可自生"原则

模型能力的边界在于：它可以在给定权限和环境内高效执行，但不能自行决定自己应该拥有什么权限、应该在什么环境中运行。这就是"主权不可自生"——Agent 的主权（意志、权限、边界）必须由外部注入，而非自我生成。

这一原则自然地将 Harness Engineering 的工作分为两类：

### 被取代的工作（回答"怎么做"）

这些工作本质上是"模式匹配 + 格式转换"，模型能力提升后可以内化：

| 工作类型 | 说明 | 被取代原因 |
|---------|------|-----------|
| 工具调用编排 | 格式化 API 请求、解析响应 | 模型已擅长结构化 I/O |
| 格式适配 | 输入输出格式转换 | 模式匹配任务 |
| 窗口管理 | 上下文窗口的截断、优先级排序 | 模型上下文能力增强 |
| 基础规划 | 简单任务分解和步骤编排 | Chain-of-thought 已内化 |
| 基础自验证 | 输出格式检查、基本合理性验证 | 模型可自行检查 |
| 通用 Skill 封装 | 标准化的工具包装和接口适配 | 可由模型直接生成 |

### 不会消失的工作（回答"该不该做"）

这些工作涉及 Agent 的"主权"——意志注入、权限授予、环境供给、边界划定、治理与审计——模型无法自行决定：

| 工作类型 | 说明 | 不可取代原因 |
|---------|------|-------------|
| 意志注入 | 定义 Agent 的目标和价值观 | 模型不能自定目标 |
| 权限授予 | 决定 Agent 可访问哪些资源和操作 | 安全边界需要外部设定 |
| 环境供给 | 配置运行时环境、依赖和约束 | 环境定义先于执行 |
| 边界划定 | 设定 Agent 行为的红线和限制 | 防护措施需要外部施加 |
| 治理与审计 | 追踪、审查、合规 | 审计权不能由被审计者自授 |

## 三阶段演进路径

### 短期：Agent 架构师

当前阶段，Harness Engineer 的核心工作是设计和构建 Agent 的运行框架——包括工具链集成、上下文管理、错误处理等。这一阶段的工作大部分属于"怎么做"的范畴。

### 中期：审核自动生成的 Harness

随着模型能力提升，Harness 的生成将部分自动化——模型可以自动编排工具调用、适配格式。但 Harness Engineer 的角色转变为**审核者**：审查自动生成的 Harness 是否安全、合规、符合设计意图。重点从"构建"转向"审查"。

### 长期：治理工程

最终阶段，Harness Engineering 演化为治理工程——专注于 Agent 的意志注入、权限管理、边界划定和审计追溯。这些"该不该做"的问题成为核心工作，而"怎么做"的大部分已被模型内化。

## 深度分析

### 与 Harness Engineering 概念体系的关系

本文的"主权线"框架为 Harness Engineering 概念提供了时间维度的演进视角，回答了一个关键问题：当模型越来越强时，Harness Engineering 师的角色如何变化？

答案不是"消失"，而是"上移"——从技术实现层上移到治理决策层，与软件工程"抽象层次不断提升"的历史规律一致：汇编程序员演化为系统架构师和安全工程师。

更进一步，主权线框架为 [Agentic Harness Engineering 范式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-harness-engineering-paradigm.md) 补上了动态维度：多数讨论聚焦"Harness 该怎么设计"，本文追问"哪些设计工作会被模型进步吸收掉"。技能全落在主权线以下的工程师，其资产随模型每次能力跃升值折旧；线上的部分则随 Agent 自主性增强而增值。

### 主权线的侵蚀是不均匀的：内化速度分层

"怎么做"一侧并非同时被取代，而是按"模式匹配纯度"从高到低依次被内化：

1. **最先被侵蚀**：格式适配、工具调用编排——纯结构化 I/O 转换，训练分布内即可解；
2. **随后被侵蚀**：窗口管理、基础自验证——含少量启发式判断，但标准可表达为可检查规则；
3. **最难被侵蚀**：基础规划、通用 Skill 封装——隐含对任务域的先验，模型能生成候选方案，但"哪个适合本业务"仍需外部校准。

由此推论：Harness 的**表面积持续收缩但不会归零**——被内化的是"胶水层"，留下的是"决策层"。这与 [AI Coding 范式演进](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/ai-coding-paradigm-evolution.md) 同构：脚手架代码消失，规格与验收标准留存。终态不是"百行代码的 loop"，而是"薄执行面 + 厚治理面"。

### 主权线的经济学：为什么"该不该做"越来越贵

两侧供给侧结构完全不同。"怎么做"一侧的供给随模型能力无限扩张，边际成本趋零；"该不该做"一侧受三个刚性约束：

- **责任不可委托**：权限授予、边界划定是组织级承诺，出错必须有人担责，模型无法成为责任主体；
- **审计权不可自授**：审计者必须独立于被审计者，是制度设计而非技术问题；
- **意志必须外部注入**：目标与价值观来自组织意图，模型只能逼近、不能自生。

三者共同决定：Agent 自主性每提高一档，治理面工作量与风险敞口就放大一档。这是 [Agent 安全架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-architecture.md) 与 [Agent 安全全生命周期体系](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-full-lifecycle-system.md) 成为工程刚需的原因——它们正是主权线以上工作的制度化产物。同理，[AI 自我改进](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/ai-self-improvement-bootstrapping.md) 回路始终需要外部护栏，：自改进系统无法为自己的扩权行为背书，"主权不可自生"在此是字面成立的安全约束。

### 实际落地的张力

"主权线"框架清晰，但实操存在张力：

1. **灰色地带**：许多工作（如 prompt engineering、错误恢复策略）既涉及"怎么做"也涉及"该不该做"——prompt 中的价值观约束属于意志注入，格式调优属于模式匹配。实操按"决策"而非"工件"划线：工件可自动化，决策点须留人工签核。
2. **模型幻觉风险**：模型在"怎么做"层面出错仍需人工干预，完全自动化不可行。更深层的是：幻觉在执行层表现为错误输出，在治理层表现为"看似合规的越权"，后者检测成本远高于前者，故审核自动生成的 Harness 还须验证权限最小化。
3. **治理滞后**：Agent 能力增长可能快于治理框架建设：能力以月为单位跃升，制度以季度为单位演进，时间差即风险敞口。务实策略是先建最小审计闭环（可追溯、可回放、可撤权），再逐步加厚。

### 对从业者的影响

- **技术实现层**：需向治理层转型，否则面临被取代的风险。判断标准：把日常工作逐项放到主权线上，若"怎么做"项过半，转型窗口正在收窄。
- **安全/合规层**：需求不减反增，需要能同时读懂权限模型与执行链路的治理专家，传统合规人员难以直接转岗胜任。
- **新角色涌现**：Agent 审计师、AI 治理工程师等新职位将出现，核心能力是把"该不该做"从隐性工程直觉显性化为可审计的决策记录。

## 实践启示

1. **能力分层意识**：明确自己当前工作的"主权线"位置——是在做"怎么做"还是"该不该做"
2. **提前布局治理能力**：即使当前以技术实现为主，也应积累权限设计、安全审计等治理能力
3. **工具链标准化**：将可自动化的工作标准化，为模型内化做好准备
4. **建立审计机制**：在 Agent 能力快速提升的同时，建立可追溯的操作审计体系

## 相关实体

- Harness Engineering
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](https://github.com/QianJinGuo/wiki-public/blob/main/entities/深入理解-claude-code-源码中的-agent-harness-构建之道.md)
- [一文带你弄懂 Ai 圈爆火的新概念Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/一文带你弄懂-ai-圈爆火的新概念harness-engineering.md)
- [两万字详解Claude Code源码核心机制](https://github.com/QianJinGuo/wiki-public/blob/main/entities/两万字详解claude-code源码核心机制.md)
- [你不知道的 Agent原理架构与工程实践 V2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/你不知道的-agent原理架构与工程实践-v2.md)
- [龙虾装上了可以用来干啥分享下我的 Openclaw 多智能体团队搭建经验 V2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/龙虾装上了可以用来干啥分享下我的-openclaw-多智能体团队搭建经验-v2.md)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道 V2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/深入理解-claude-code-源码中的-agent-harness-构建之道-v2.md)

→ [原文存档](https://mp.weixin.qq.com/s/489qawXNdqLIz9EAh14QtA)

---

