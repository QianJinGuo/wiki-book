# 高德广告工程 Harness/SDD 体系演进：从\"氛围编程\"治理到 AI Native 全流程闭环

## Ch05.016 高德广告工程 Harness/SDD 体系演进：从\"氛围编程\"治理到 AI Native 全流程闭环

> 📊 Level ⭐⭐ | 20.3KB | `entities/gaode-sdd-harness-team-ai-coding-paradigm-IBJFu.md`

# 告别"氛围编程"：基于 Harness 治理和 SDD 的团队级 AI 研发范式演进与实践
> Source: https://mp.weixin.qq.com/s/-_IBJFuXpvoqMJxL9oaEJQ
> Author: 王树新 (高德大模型应用平台)
> Collected: 2026-05-07

## 一、识别 AI Coding 的三大核心问题

## 相关实体
- [Claude Code Prompt Context Harness](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-prompt-context-harness.md)
- [Fudan Peking Ahe Agentic Harness Engineering](../ch04-220-fudan-peking-ahe-agentic-harness-engineering)
- [Pi Openclaw Coding Harness](../ch05-032-coding-harness-工程本质-从-pi-到-openclaw)
- [Ai Production Development Workflow Openspec Superpowers Gstack](../ch05-019-ai-production-development-workflow-openspec-superpowers-gsta)
- [Harness Engineeringai 能在真正出事会炸的后端系统里写代码吗 V2](../ch05-052-harness-engineering-ai-能在真正-出事会炸-的后端系统里写代码吗)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/gaode-sdd-harness-team-ai-coding-paradigm-IBJFu.md)

- [从提需求到部署发布全Ai全自动化后研发效能全面跃升](../ch09-065-从提需求到部署发布-全ai全自动化后-研发效能全面跃升)
## 二、从"出码率"看"提效"背后的深层困境

**原因1：研发是全链路，不仅仅是写代码**

需求从提出到上线完整链路：产品提需、产研评审、方案设计、开发、代码评审、测试、联调、上线。《人月神话》——没有银弹。AI 优化了编码环节，但编码只占整个链路的 30%，整体提效有限。

**原因2：Vibe Coding 在存量应用中风险极高**

存量应用有历史包袱、隐式依赖、业务知识沉淀在代码里。"氛围编程"可能生成与现有系统完全不兼容的方案，问题可能在上线后才暴露。案例：AI 修改了一个核心接口的参数顺序，单元测试全过，上线后三个下游服务报错，排查整整一天。

**原因3：任务粒度过大时 AI 顾此失彼**

一个涉及前后端十几个模块的重构任务，不可能在一个对话里完成，AI 上下文窗口有限，注意力分散。

**结论：AI 编程要从"个人技能"升级为"团队级工程能力"，从"氛围编程"进化为"规范驱动、工程治理"的研发范式。**

## 三、解法：SDD 与 Harness

### SDD（规范驱动开发）

**核心思想颠覆：** 规范不再是写给人类看的散文，而是结构化的、可被 AI Agent 精确理解和执行的"意图代码"。

传统开发：PRD/设计文档 = 指导书，代码 = 唯一真理之源 → 文档很快过期、与代码脱节。

SDD 颠覆：规范 = 唯一真实来源。需求变更时，首先修改"规范"，AI 工具根据规范重新生成、验证并更新底层代码。

**SDD 四步流程：**

1. **Specify（定义规范）**：开发者与 AI 探讨，输出一份结构化规范，定义用户故事、验收标准和系统约束。
2. **Plan（制定计划）**：AI 像编译器一样，将规范"编译"成详细的技术方案和任务拆解列表。
3. **Implement（执行落地）**：AI Agent 逐个执行任务列表，自动生成高质量代码。
4. **Validate（验证闭环）**：根据规范自动生成测试用例并执行，确保生成的代码与规范完全契合。

**SDD 关键：验收标准必须是可测试的、无歧义的。** 例如"用户登录成功后跳转到首页"是模糊的，而"用户登录成功后，3秒内跳转到首页，并在首页显示用户昵称"就是可测试的。

### Harness（驾驭工程）

**类比：** 想象一匹野马——AI 大模型拥有无穷力量，但没有马具，你根本骑不上去。Harness Engineering 的核心不是改变马的基因（模型本身），而是为这匹野马设计一套精密的控制系统。

**Harness 四大核心支柱：**

1. **上下文工程**：不再是简单的 RAG，而是结构化的信息投喂。维护一个"单一事实来源"，让 Agent 知道项目的目录结构、当前的执行计划以及哪些文档是最新的。
2. **架构约束**：这是 Harness 最硬核的部分。通过物理手段强制 AI 遵守规则。例如，规定 UI 层的代码绝对禁止直接访问数据库层。如果 AI 试图违反架构分层，代码甚至无法通过语法检查，从而在提交前就被拦截。
3. **反馈回路与熵管理**：AI 一定会犯错，关键在于如何发现并修正。建立自动化的测试沙箱：Agent 写完代码 → 自动运行测试 → 失败 → 读取错误日志 → 自我修正并重试。将人类修复错误的经验固化为新的规则，确保 AI 永远不会犯同样的错误两次。
4. **人类监督**：人类从"写代码的人"变成了"审核员"和"环境设计师"。职责是定义复杂的业务边界，处理那 5% AI 无法判断的模糊逻辑，以及优化 Harness 本身的规则。

**范式转移：**

- 提示词工程 → 上下文工程 → Harness Engineering
- "怎么跟 AI 说话" → "AI 应该看到什么" → "AI 如何在受控环境中运行"

## 四、Qoder 平台落地实践

### 知识库三层分层

**项目层知识：** 项目概述、目录结构、架构设计、技术选型。维护一个顶层 README.md 文件作为 Qoder 的"单一事实来源"。

**技术层知识：** 通用技术知识、编码规范、中间件、三方库文档、最佳实践、常见问题解决方案。跨项目复用。

**资产层知识：** 可复用的代码片段、组件、模板、历史需求 PRD、技术方案、归档的测试 Case。团队多年积累的"砖块"。

### Quest Spec 模式（Spec 生成）

通过 Spec 模式，AI 会主动提问，引导开发者澄清隐性知识，逐步补齐完整的 Spec。包含：数据模型、接口规范、验收标准。

**HITL（Human-In-The-Loop）：** 需求文档中有很多"隐性知识"——产品经理认为理所当然但实际需要澄清的信息。需求澄清不是全自动的，需要人工干预。

### 专家团模式（Experts Mode）

不同任务由不同角色的 Agent 来完成：前端工程师、后端工程师、测试工程师、架构师等。AI 根据 Spec 生成执行计划，把大型任务拆解成可管理的小任务，每个小任务都有明确的输入、输出和验收标准。

**用户角色转变：** 用户也是协调链路的一部分。可以在专家团运行时随时介入，Experts Leader 在下一轮循环中处理。和 Experts Leader 澄清意图、对齐方向、审核计划、验收结果——更像带一个有经验的研发小组。

### 部署全链路

通过 Aone（阿里内部CI/CD平台）提供的 MCP（Model Context Protocol）工具，将构建产物交付给运维 Agent 进行部署。打通从需求到部署的全链路。

### Skills 能力扩展

Skills 是 Qoder 的能力扩展机制。例如数据库操作 Skill：AI 可以直接查询和修改数据库，进行数据准备和验证。

## 深度分析

### 从"出码率"到"提效"：指标幻觉的本质

高德团队发现一个反直觉现象：出码率从 53% 提升到 80%-90%，但团队提效并不明显。这揭示了 AI Coding 在工程化落地时的核心矛盾——**局部指标优化不等于全局效率提升**。研发链路中编码环节仅占 30%，即使这一环 AI 全替代，整体也不过 30% 的提升空间，且还要面对存量系统的兼容性风险。

### SDD 的本质：从"文档驱动"到"规范即源码"

SDD 颠覆的不是开发流程，而是**知识的确权关系**。传统模式下，代码是唯一真实来源（Single Source of Truth），文档是附属品，必然过期。SDD 将"规范"提升为新的真实来源，规范本身结构化、可执行、可验证，AI 工具以规范为输入重新生成代码。这意味着需求的变更不再是改代码，而是改规范——代码自动同步更新。

### Harness Engineering 的核心：控制论而非优化论

Harness 的类比值得深思：不改变马的基因（模型本身），而是为马设计控制系统。这一定调区分了 Harness Engineering 与模型 fine-tuning 或评测榜单优化。核心关注点是**如何让 AI 在受控边界内运行**，而非如何让 AI 变得更聪明。架构约束通过物理手段（语法检查、提交前拦截）而非规则说教来强制执行，是这一思路的集中体现。

### 熵管理：AI Coding 的不可逃避规律

"反馈回路与熵管理"是文章中最有洞见的思想之一：AI 一定会犯错，关键在于建立**自动化的错误发现与修正循环**。这一思路将人类修复错误的历史经验转化为新的 Harness 规则，使 AI 犯错的边际成本递减。从长期看，这是在为团队构建一个"AI 错误知识库"，其价值可能远超代码本身。

## 实践启示

### 短期可落地（1-3个月）

1. **建立项目级 README 作为"单一事实来源"**：在项目初期维护一份结构化的项目概述文档，包含目录结构、架构设计、技术选型，作为 AI 理解项目的起点。
2. **推行 Spec-first 轻量流程**：在现有研发流程中引入 Spec 环节，要求需求澄清必须产出结构化验收标准（可测试、无歧义），而非自然语言描述。
3. **为 AI 生成代码配置强制 Gate**：在 CI/CD 链路中加入架构合规检查（如禁止跨层直接调用），使 AI 生成的违规代码无法提交。

### 中期需建设（3-6个月）

4. **构建团队级知识分层体系**：区分项目层、技术层、资产层知识，建立跨项目复用的规范组件库，减少 AI 每次从零理解团队规范的成本。
5. **引入 Human-in-the-Loop 机制**：在 Spec 生成和验收环节保留人工审核节点，尤其在需求存在隐性知识时，不追求全自动澄清。
6. **建立 AI 错误知识沉淀机制**：将每次 AI 犯错的根因和修复方案固化为新的 Rules 或规范，形成团队级"AI 错题本"。

### 长期需布局（6个月以上）

7. **探索多 Agent 协作模式**：从单 Agent 过渡到专家团模式，不同任务由不同角色的 Agent 负责，Agent 之间通过 Spec 协调。
8. **打通全链路工具链**：通过 MCP 协议将 AI 编程工具与 CI/CD、运维平台串联，实现从需求到部署的端到端自动化。
9. **逐步演进到 Spec-as-Source**：从 Spec-first 逐步演进到 Spec-anchored，最终实现规范作为主要源文件，代码由规范生成并与规范保持同步。

## 第 2 来源 — 信息业务中心 (高德技术 2026-06-15)

> Source: [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/gaode-ads-ai-native-end-to-end-pipeline-sdd-atdd-skills.md)
> Author: 信息业务中心 (高德技术公众号)
> Date: 2026-06-15

这是 5 月那篇"告别氛围编程"的**体系化延续**——从单点 Harness 治理升级为完整的 AI Native 工程体系（5 类工程产物 + K/S/T 知识底座 + 5 层业务分层 + SkillHub + Agent Team 平台化）。

### 互补角度

1. **五类工程产物（核心贡献）**：把 Spec / 知识 / 验收 / 执行状态 / Skills 升级为与代码同等地位的工程产物，给出完整的"过去 vs 升级后"对照表。5 月那篇只讲 SDD/Harness 抽象理念，本文给出**可落地的工程产物清单**。
2. **K/S/T × 5 层业务分层（核心贡献）**：事实/规范/任务三类知识用途 × 语义/架构/服务/项目/运维五层工程组织的二维结构；并给出"研发阶段 → 优先读取层级"的最小正确上下文策略（需求门禁/理解/设计/开发/测试/运维各有不同读取层级）。这是 5 月那篇没涉及的具体知识组织方法。
3. **状态机六阶段**：start → spec → apply → test → archive → kb-flow，每阶段四要素（进入门禁/产物清单/退出门禁/状态记录），可任意阶段触发 clarify 子流程。把"AI 长周期任务跑断"问题工程化解决。
4. **Intake Gate（入口闸口）**：复杂需求不能直接交给 Agent——必须先做需求完整度评估/影响范围判断/缺失信息召回/需求拆分/Non-Goals 明确/准入打回判断。Intake 不是可选增强，是 SDD 前的必要闸口。
5. **ATDD 测试闭环的真实短板**：首次诚实暴露 ATDD 当前卡点（部署/编译环境未打通、功能测试生成不足、Diff/bug 修复未闭环、测试进度感知弱），并给出下一步具体动作。团队使用覆盖 20+ 同学，多数有效样本集中在 30%-60% 阶段性提效区间（**体感，非严格实验**——作者明确自我标注）。
6. **运维 Agent 矩阵原则**：Agent 的结论不是事实源，日志/指标/变更/Case/巡检结果才是事实源。Agent 三件事：找到应该查什么 / 把查到的事实串起来 / 给出诊断、影响范围、处理建议和治理项。这是给运维 Agent 的明确边界。
7. **执行治理三件套（Tool Gateway / Trace/Artifact / Knowledge Delta）**：谁能调用工具/调用前是否需要审批/失败如何降级；每次执行必须能复盘过程；Agent 不直接写正式知识库而先生成候选知识带来源/证据/owner/置信度/有效期/冲突检查。这是从"AI 能干活"到"AI 可治理地干活"的关键工程化设计。

### 三个典型场景的量化提效

| 场景 | 收益 |
|---|---|
| 品牌广告旧索引下线/配置清理 | 从约 1 天压缩到约 0.5 天，完整跑通 Intake/SDD/ATDD 全流程 |
| openCreativeChain 迁移 | 历史逻辑梳理、迁移方案生成、代码辅助，迁移周期明显缩短 |
| 汇川 ADX 程序化接入 | 逻辑梳理阶段反馈约 50% 提效 |

**共同点**：AI 在逻辑梳理、方案设计、代码生成、迁移辅助上效果明显；但越靠近复杂链路、测试部署、历史知识和跨系统事实，越依赖工程基建补齐。

### 八个真实卡点与对应工程动作（直接可借鉴）

| 卡点 | 对应工程动作 |
|---|---|
| PRD 太大、上下文占用高 | Intake 增加需求拆分、Non-Goals、验收口径确认 |
| HSF 接口被 AI 自行构造 | 建设接口事实库，Tool Gateway 提供可信接口查询 |
| test 未使用或能力不足 | ATDD 补功能测试、冒烟、Diff 分析、复验闭环 |
| TPP/US 无法自动部署编译 | 补仓库/环境适配矩阵 |
| 告警诊断无法关联指标 | 建设场景-指标-链路-变更事实网络 |
| 上下文丢失、长任务慢 | Trace/Artifact/session 状态沉淀 |
| AI 自行 git commit | Skill 中明确禁止动作，关键动作必须人工确认 |
| 默认跑错 Skill 或旧流程 | SkillHub 统一路由、版本、触发条件和强制入口 |

### 三阶段路线图

- **第一阶段（基本完成）**：统一基建骨架——gad-sdd 主链路 / 统一 Skill 仓库 / K/S/T + 5 层知识库 / ATDD 测试链路 / Trace·Artifact·Knowledge Delta
- **第二阶段（持续建设）**：广告内部跨团队闭环——总控 Agent 上线 / 复杂需求拆成多子 Agent / Mock Server 支持前置联调 / 任何子 Agent ATDD 失败精准定位 / 运维 Agent 矩阵覆盖核心场景
- **第三阶段（跨组织）**：跨业务线 Agent 协同 / 跨端 MCP 与 Browser-use 接入 / CodeWiki·LSP·图谱能力 / 广告业务评测集建设 / AI 参与值班和告警 RCA / 一键预案推荐

### 与第 1 来源的关系

- **第 1 来源（5 月）**：聚焦 Harness 治理哲学 + RAG/Quest 模式 + 出码率 vs 提效悖论 + 短期/中期/长期落地建议——偏**理念层**
- **第 2 来源（6 月）**：聚焦五类工程产物体系 + K/S/T 知识底座 + SkillHub 50+ Skill 全景 + 真实卡点工程动作——偏**体系落地层**

两篇是同一团队（高德广告工程 / 高德技术公众号）在 6 周内的演进：先讲"为什么要 Harness"，再讲"具体 Harness 体系长什么样"。

## 相关实体（更新）
- [Claude Code Prompt Context Harness](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-prompt-context-harness.md)
- [Fudan Peking Ahe Agentic Harness Engineering](../ch04-220-fudan-peking-ahe-agentic-harness-engineering)
- [Pi Openclaw Coding Harness](../ch05-032-coding-harness-工程本质-从-pi-到-openclaw)
- [Ai Production Development Workflow Openspec Superpowers Gstack](../ch05-019-ai-production-development-workflow-openspec-superpowers-gsta)
- [Harness Engineeringai 能在真正出事会炸的后端系统里写代码吗 V2](../ch05-052-harness-engineering-ai-能在真正-出事会炸-的后端系统里写代码吗)
- [K/S/T 知识底座](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-harness-context-management-working-set.md)（相关：K/S/T 是知识用途分类，本文在工程层落地）
- [Harness Engineering 综述](../ch04-069-agent-harness-engineering-a-survey)（相关：三阶段 Prompt→Context→Harness）
- [Spec as AIOS (高德 App 平台)](../ch01-703-spec-as-aios-ai-native-全栈交付的抗熵架构)（同团队同主题另一视角）

→ [第 1 来源原文](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/gaode-sdd-harness-team-ai-coding-paradigm-IBJFu.md)
→ [第 2 来源原文](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/gaode-ads-ai-native-end-to-end-pipeline-sdd-atdd-skills.md)

---

