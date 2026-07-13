# Skill Hub：企业级 AI 经验资产化的关键（组织能力视角）— winty 前端Q 3 篇合集：组织资产 + 质量门禁 4 关 + 生命周期 6 阶段治理

## Ch07.001 Skill Hub：企业级 AI 经验资产化的关键（组织能力视角）— winty 前端Q 3 篇合集：组织资产 + 质量门禁 4 关 + 生命周期 6 阶段治理

> 📊 Level ⭐⭐ | 39.3KB | `entities/skill-hub-organization-asset-winty.md`

# Skill Hub：企业级 AI 经验资产化的关键（组织能力视角）

## 概述

winty（前端Q）2026-06-02 关于 Skill Hub 的深度论述。核心命题：公司里的 AI Agent 正在变成"经验黑洞"——磨合出来的经验绝大多数留在个人电脑/会话/小笔记里。**Skill Hub 把"经验沉到组织侧"这件事变成可工程化的产物**。文章系统提出企业 AI 落地三种典型路径与"隐形 AI Tax"概念、Skill 的组织资产定位、Skill Hub 治理五件事框架（写得好/测得准/管得住/放得开/收得回），并以"发版 Skill 三个阶段"完整案例展示从个人 Prompt → Skill → 组织资产的演进路径。

## 核心命题

> **公司里的 AI Agent 正在变成"经验黑洞"。**

**核心问题**：Agent 学到的经验，到底属于谁？怎么管？怎么传？

**关键洞察**（来自研究 Hermes Agent）：
- **左边** = 经验沉在个人侧，公司能感知到的能力曲线**几乎平**
- **右边** = 经验沉到组织侧，公司层面能力**随时间稳步爬升**
- **Skill Hub = 把"右边"这件事变成可工程化的产物** 

## 企业 AI 落地的隐形 Tax

### 三种典型路径

**第一种：工具采购型**
- 公司买了 Cursor / Claude Code，发给开发，让大家随便用
- 短期效率提升，但**长期几乎没有沉淀**
- 公司层面拿不到"我们到底在 AI 上学到了什么"的资产

**第二种：小作坊自研型**
- 每个业务团队自己写 Prompt 模板、接 MCP 工具、整工作流
- 业务方写法千差万别，工程质量参差不齐
- **Prompt 没有版本，没有评估，没有治理**
- 线上 AI 突然变笨了，谁都不知道是哪次改 Prompt 搞坏的

**第三种：中台收口型**
- 公司决定建统一的 Agent 平台，所有 AI 能力往里收
- 听起来很美好，但容易跑偏
- 平台团队自己定义能力，业务方只能用现成的；新需求要排期

### 隐形 AI Tax 概念

> 这三种模式都有同一个隐形税：**AI 能力没有变成组织资产，每一次效率提升都很难持续累积**。

**它不会出现在任何账单里，但它真实存在**：你公司投入了 AI 工具的钱、投入了使用时间、踩过了无数次坑，最后只换来了"个体级提升"，而不是"组织级提升"。

## 为什么 Skill 才是真正的组织资产

### 沉淀物的归属分法

| 类别 | 主要归属 | 举例 |
|------|---------|------|
| 用户偏好 | 个人 | 简洁的回复风格、用 vim、习惯先 dry-run 再执行 |
| 环境事实 | 个人 / 项目 | 本地 Node 版本、项目包管理器 |
| 项目约定 | 项目 | 用 pnpm、PR 前必须跑 pnpm test |
| **团队规范** | **团队 / 组织** | **上线前必须做支付链路回归、生产数据库默认只读** |
| **流程经验** | **团队 / 组织** | **慢 SQL 排查的标准动作、发版失败时的恢复流程** |

**后三项本质上是组织在反复试错之后总结出来的"做事方式"**。这种东西如果只留在某个人的 Memory，那就等于一份"私有文档"。换个人就没了。

> **Skill 是组织对 Agent 说"在这个场景，我们就是这么做事的"。**

Skill 的位置：既不在个人侧（避免每人一份），也不在工具侧（不是写死的硬编码），而在**组织能力层**——一个被组织共享、被组织治理的东西。

## Skill Hub 解决的不是写 Skill，而是治理 Skill

### 真实问题清单（7 个治理问题）

很多人对 Skill Hub 的第一反应是："**不就是个 Skill 仓库吗？**" 但企业 AI 落地会遇到 7 类真实问题：

| 问题 | 治理指向 |
|------|---------|
| Skill 写出来了，怎么证明它**真的会做事**？ | 评估 |
| 有人改了 v2，怎么证明**比 v1 更好**而不是更差？ | 评估/版本 |
| 多个团队都写了"发版"相关 Skill，**要不要合并？合并谁的？** | 所有权 |
| Skill 调用了**生产数据库**，谁来审核它的权限范围？ | 权限/审核 |
| Skill 出问题了，**怎么知道是哪一版搞坏的？怎么回滚？** | 审计/回滚 |
| Skill 已经半年没人用了，**要不要废弃？怎么废弃？** | 生命周期 |
| 不同团队对同一个 Skill 有不同需求，**要不要做 fork？** | 治理 |

**每一个问题，都不是"做个 Skill 仓库"能回答的**。它们指向一整套工程治理：版本、评估、灰度、回滚、审计、所有权、生命周期。

### Skill Hub 治理五件事

| 能力 | 含义 |
|------|------|
| **写得好** | Skill 有明确结构和质量标准，不是一段散乱的 Prompt |
| **测得准** | 每个 Skill 都有自己的测试集，能被自动评估 |
| **管得住** | Skill 有版本、有 owner、有审核流程 |
| **放得开** | 能灰度发布、按团队订阅、按场景启用 |
| **收得回** | 能监控使用情况，能回滚，能优雅废弃 |

**这五件事缺一个，组织 AI 能力就站不住。**

> **Skill Hub 的真正价值，不是收藏 Skill，而是让 Skill 在企业里能像软件一样被认真对待。** 

## 真实场景：发版 Skill 三个阶段

### 起点：组织能力沉在个人脑子

某团队发版流程：
- 老张知道哪些服务不能同时重启
- 小李知道支付页面发版前必须做哪几个回归
- 阿强知道 staging 的环境变量配置在哪个 vault 里
- **实习生第一次发版前，要把这三个人都问一遍**

### 第一阶段：让 AI 帮自己干活

老张把发版前要做的事写成 Prompt 喂给 Cursor/Claude Code。**但这个 Prompt 在他自己电脑上。**

### 第二阶段：写成 Skill

```yaml
---
name: frontend-release-check
version: 1.0.0
owner: zhang
description: 前端发版前的标准检查
---

## When to use
当用户准备发布前端服务到生产时使用

## Steps
1. 检查是否有未提交变更
2. 拉取最新 main 分支
3. 跑 lint / typecheck / unit test
4. 跑 build
5. 生成 changelog
6. 提示需要人工 QA 的页面
```

**问题**：
- Skill 只在老张工作目录里，**别人用不到**
- 没考虑小李的支付页面回归、阿强的 vault 路径
- 成功/失败只能靠老张主观判断

### 第三阶段：进入 Skill Hub

推送到企业 Skill Hub 之后发生的变化：
- **小李**提 PR，加"如果改动涉及 pages/payment/* 必须发起人工 QA 流程"
- **阿强**加一段从 vault 拉环境变量的步骤
- Skill Hub **自动给这个 Skill 跑 50 个历史发版回放，生成正确率报告**
- v1.1.0 上线时**先在风控团队灰度三天，没问题再全量**
- 所有调用都进了**审计日志**：谁、什么时候、用了哪一版、结果如何

**到这一步，"前端发版"不再是老张脑子里的隐性经验，而是一份组织资产**：
- 有版本号 · 有 owner · 有审核记录
- 有评估指标 · 有灰度策略 · 有回滚机制

> **当 Skill 进入 Hub，它就从"个人聪明"变成了"组织默认聪明"。**
>
> 新人入职那天，AI 就已经知道怎么帮他发版了，因为这套经验已经在 Skill Hub 里。 

## 没有 Skill Hub 的两个终态

### 状态一：Prompt 失控

- 每个团队各写各的 Prompt，每个项目各接各的 MCP
- 突然有一天 AI 输出变笨了，没人能查出哪一段 Prompt 改坏了
- **调试一次至少消耗一个工程师两天**

> 这其实和早年没做日志规范、没做监控规范的项目最后变成"线上一出问题查不出来"是一回事。

### 状态二：能力孤岛

- A 团队的"代码评审 Agent"和 B 团队的"代码评审 Agent"，各做各的
- 互相不知道对方踩过什么坑
- **一年下来，公司层面 AI 能力没有"叠加"，只是"重复"**

> 平台朋友的话：**"前两年我们在补的是 DevOps 课，未来两年我们要补的是 AIOps、Skill Ops 的课。AI 不像普通工具，越没规则越乱。"** 

## Skill Hub 不是大公司专属

**判断标准不是"公司大不大"，而是这两个问题**：
1. 你的 AI 能力**是否需要被多人共享**？
2. 你**是否在乎** AI 在生产环境里的稳定性？

只要这两个里有一个回答"是"，就值得把 Skill 当成正经资产管。

### 中小团队最小可用 Skill Hub

- 一个 Git 仓库当 Skill 仓库
- 一个 GitHub Actions 跑自动化评估
- 一个简单的 issue 模板做审核
- 一个共用的飞书表格记录使用统计

**也能跑得起来一个最小可用的 Skill Hub**。

## 核心判断

> **企业 AI 落地走到 2026 年这个节点，最大的瓶颈不是模型不够强，也不是工具不够多。**
>
> **最大的瓶颈是：企业还没准备好把 AI 学到的东西管起来。**

- 模型每年都在升级
- 工具每月都在更新
- Prompt 每天都在被人改

如果一个组织**没有"AI 能力资产"这一层**，它的 AI 投入就只是"个体生产力工具"，永远变不成"组织能力"。

> **Skill Hub 的真正意义，是给企业一个机会，把 AI 的智慧从个人脑子里、从一次次的对话里、从分散的工具配置里，沉淀成一份可见、可管、可评估、可演进的组织资产。** 

## 与现有 hermes-skill-system 实体差异化

| 维度 | 本文 Skill Hub | 现有 `hermes-skill-system-winty`（12.9KB） |
|------|--------------|---------------------------------------|
| 视角 | **组织/企业** | **个人/agent** |
| 核心概念 | **Skill Hub + 组织资产** | **Memory vs Skill 区别** |
| 治理框架 | **五件事**（写得好/测得准/管得住/放得开/收得回） | 概念区分 + 系统实现 |
| 问题诊断 | **企业 AI Tax**（三种落地路径缺陷） | Skill 系统的三个坑 |
| 案例 | **发版 Skill 三阶段**（老张→Hub） | Memory vs Skill 工程实现 |
| 治理对象 | **版本/评估/灰度/回滚/审计/所有权/生命周期** | Skill 文件结构与可执行性 |
| 终极目标 | **从个人聪明到组织默认聪明** | **越用越快**（Skill 越攒越准） |

**关键判断**：本文与现有 `hermes-skill-system-winty` 角度完全不同（组织 vs 个人），不应合并。

## 进一步阅读

- Hermes Agent 官方文档：https://hermes-agent.nousresearch.com/docs/
- Hermes Agent Skills：https://hermes-agent.nousresearch.com/docs/user-guide/features/skills
- Anthropic: Building Effective Agents（关于 Workflow vs Agent 与组织级能力沉淀的部分）

## 深度分析

### 1. "隐形 AI Tax"的本质：组织学习机制的失效

winty 提出的"隐形 AI Tax"并非指某一项具体的货币成本，而是指**企业 AI 投入中无法被组织级能力承接的那部分损耗**。从知识管理视角看，这反映了企业缺乏一套将个体经验转化为组织知识的机制——这与 [企业 AI 采用](https://github.com/QianJinGuo/wiki/blob/main/concepts/enterprise-ai-adoption.md) 阶段模型中的"早期实验阶段"高度吻合：团队用上了 AI，但管理层缺乏对产出物的系统性保留。

三种路径（工具采购型、小作坊自研型、中台收口型）之所以都逃不开 AI Tax，根本原因在于它们都缺少**显性化的组织知识层**：工具采购型没有沉淀，小作坊自研型沉淀了但不可控，中台收口型则把沉淀的权利从业务方手中夺走导致供给枯竭。这是一个经典的[组织知识生命周期](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-lifecycle-philosophies.md)管理问题，与早年知识管理（Knowledge Management）领域对"隐性知识显性化"的讨论一脉相承——只不过 AI 语境下的载体从文档变成了 Skill。

### 2. Skill 五件事治理框架的理论基础

"写得好/测得准/管得住/放得开/收得回"五件事框架，本质上是一套**软件工程最佳实践向 AI Agent 能力层的映射**：
- **写得好** ≈ 代码规范（Code Style Guide）+ 文档标准
- **测得准** ≈ 自动化测试（Unit Test / Integration Test）
- **管得住** ≈ 版本控制（Version Control）+ Code Review
- **放得开** ≈ 灰度发布（Canary Deployment）+ Feature Flag
- **收得回** ≈ 回滚机制（Rollback）+ 监控告警（Observability）

这与 [技能设计模式](../ch04/266-skill.html) 的要求一致——Skill 本质上是结构化的 Prompt + 工具链 + 执行策略，需要被当作**可执行软件**而非静态文档来治理。这也解释了为什么 [AI Skill 演进框架](ch07/010-ai-skill-evolution.html) 强调 Skill 的版本化和可测试性是不可妥协的基础要求。

### 3. 组织资产视角下的 Skill 定位：第三层抽象

winty 将 Skill 定位在"个人侧"与"工具侧"之间，并称之为"组织能力层"。这个描述有深刻的架构含义：**Skill 是对组织流程经验的结构化编码，而非硬编码的规则或松散的 Prompt 集合**。

[Harness 工程框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 提出的七层模型中，Skill 对应的是"组织适配层"（Organizational Adaptation Layer）——它不在个人 memory 里（个人层），也不是全局硬编码（工具层），而是被组织共享、治理和版本化的中间态。这与 [Thin Harness Fat Skills](../ch05/077-thin-harness-fat-skills-ai.html) 的核心论点相呼应：轻 harness（框架） + 重 skills（技能沉淀） 是组织级 AI 能力的正确方向。

### 4. 从"个人聪明"到"组织默认聪明"：新人入职问题的元问题

文章的核心比喻——"新人入职那天，AI 就已经知道怎么帮他发版了"——揭示了一个被大多数企业 AI 落地策略忽略的**新人上手问题的元问题**：不是 AI 不会，而是 AI 没有继承组织的积累。

这个问题在 [How To Encode Experience Into Skills](../ch03/069-skills.html) 中有更系统的讨论：Skill 的价值不在于它能执行某个动作，而在于它编码了"在这个组织里，这个场景的标准做法是什么"。当 Skill 进入 Hub 后，新人不必再依赖"问老张"这种不可扩展的知识传递方式——组织智慧已经被结构化地编码进了 Skill Hub，被所有 Agent 共享。这与 [Hermes Self Evolution Closed Loop Skill Reuse Winty](../ch04/266-skill.html) 中的"技能复用闭环"是同一个逻辑在不同粒度上的表达。

### 5. 平台型与业务型的张力：Skill Hub 的权力结构

中台收口型模式的失败（平台定义能力，业务方只能用现成的；新需求要排期）揭示了 Skill Hub 治理中一个深层矛盾：**平台提供方与业务消费方之间的权力博弈**。这个问题在 [Skill System Design Three Way Comparison](../ch04/266-skill.html) 中有详细讨论。

winty 提出的"放得开"（能灰度发布、按团队订阅、按场景启用）实际上是一种**联邦式治理模型**：Hub 提供基础设施和治理框架，但 Skill 的所有权属于业务团队。这与传统的"中台把所有能力收到平台团队"模式有本质区别——[Skill Complete Guide Alibaba](../ch04/266-skill.html) 中阿里云 tangram 模型的"企业级 Skill 管理中心"也采用了类似的分层所有权设计，平台管治理，业务方管内容。

## 实践启示

### 1. 先建立 Skill 治理基础设施，再扩大 Skill 覆盖率

**反直觉建议**：与其让各团队大量写 Skill，不如**先投入建立 Skill Hub 的工程基础设施**（版本控制、自动评估、审计日志），再鼓励团队将 Skill 推送到 Hub。

很多团队在"写了很多 Skill"后很快遇到"Skill 失控"问题（没有版本、没有评估、不知道谁改了啥），根本原因是治理基础设施没跟上。最小可行路径：**先跑通 Git 仓库 + GitHub Actions 自动化评估这一条线**，再扩展到灰度、回滚等高级能力。这与 [Skill 写作框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/skill-framework-writing-patterns.md) 中"先规范再扩展"的思想一致。

### 2. 从高频、高风险场景开始，优先将"团队规范"转化为 Skill

**落地优先级排序**（从高到低）：
1. **高风险操作**：生产数据库写入、支付链路、权限变更 → 第一个进入 Skill Hub
2. **高频流程**：代码评审、发版检查、环境配置 → 第二批
3. **低频但关键**：灾难恢复、故障排查手册 → 第三批

这个优先级参考了 [Agent Reliability Engineering Skillify Continuous Improvement](../ch04/266-skill.html) 中的"关键路径识别"方法：把组织中最不容出错的那类操作先用 Skill 固化起来，形成组织默认的正确做法。个人偏好类操作（如编辑器偏好）留在个人 Memory，不进入 Hub——Hub 的治理成本应该花在值得治理的地方。

### 3. 给每个 Skill 配置"最小评估集"，不要等到质量完美再发布

**关键实践**：每个 Skill 在进入 Hub 时，至少需要准备一个**最小可用测试集**（哪怕是 5-10 个历史输入输出对），用于后续版本比较。

这是"测得准"的最小实现——不是说要有一整套复杂的 Benchmark，而是每次 Skill 改动后能自动跑历史回放、生成正确率报告，证明新版本不比旧版本差。[Agent Skill Writing Evaluation](../ch04/264-agent-skill.html) 中提到的"基于回放的回归评估"是这个思路的技术实现。**不要等到 Skill 质量完美再进 Hub**——进 Hub 本身就是让 Skill 接受组织检验的开始。

### 4. 设计 Skill 的 Fork / 分支策略，明确所有权边界

当多个团队对同一个场景有不同需求时，"要不要做 fork"是真实问题。**建议采用软件分支模型（Git-flow）**：
- **主线版本（main）**：组织级通用 Skill，经 Hub 官方审核
- **团队分支（team-xxx）**：特定团队的定制 Skill，不进入官方 Hub
- **重大分歧时走 Fork**：在 Fork 上各自演进，核心接口保持兼容

参考 [Skill Formal Theory Survey](https://github.com/QianJinGuo/wiki/blob/main/concepts/skill-formal-theory-survey.md) 中关于 Skill 可组合性的讨论，以及 [Skill Design Spec 8 Block Checklist Winty](../ch04/266-skill.html) 中的结构化模板，Fork 的边界应该在"场景定制"层面而非"核心逻辑"层面——核心逻辑应该在主线收敛，场景差异通过参数或条件分支来处理。

### 5. 建立 Skill Hub 与现有工程流程的嵌入点，防止 Hub 成为孤岛

**实践警示**：Skill Hub 如果只是"另一个工具"，很快会被团队遗忘。**必须将 Skill Hub 与现有工程流程深度嵌入**：
- CI/CD 流水线触发时，自动调用相关 Skill 进行检查（[Skill Os Learning Skill Curation Self Evolving Agents](../ch04/218-self-evolving-agents.html) 中提到的"技能编排"思路）
- 代码评审 Agent 默认加载 Skill Hub 中的团队规范 Skill
- 新项目初始化时，Agent 自动从 Hub 拉取该项目类型对应的 Skill 集

这样 Skill Hub 才能真正成为**组织能力的默认载体**，而不是一个需要特意打开的"技能商店"。这与 [Agent 工程](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent.md) 中"Agent 能力应该是环境的一部分而非人工注入的"原则高度一致。

---

# 第 2 篇：Skill 想进生产？先闯这 4 道死关（质量门禁）

> winty（前端Q）2026-06-16 关于 Skill Hub **质量门禁**的工程化论述。如果说第 1 篇回答"Skill Hub 是什么、为什么"，这一篇回答"**什么 Skill 允许进入 Hub、什么版本允许上线、什么发布允许全量**"。核心命题：**评估都跑了，但没人用结果挡新版本上线——所以报告拦不住事**。

## 核心命题再聚焦

> **质量门禁的核心，不只是"有没有报告"，而是"报告能不能拦得住事"。**

很多团队规则写了一大堆，但碰到"老板赶时间上线"就破例。**破一次，门禁就形同虚设**。

## 整体框架：三道关卡（标题"4 道"含下篇预告）

> 标题是"4 道死关"，但文章实际讲 3 道关卡 + 下篇预告第 4 道"生命周期治理"

| 关卡 | 解决问题 | 决策依据 |
|------|---------|---------|
| **入 Hub 门禁** | Skill 第一次提交进 Hub 应满足哪些最低要求？ | 4 类检查（结构/内容/安全/测试） |
| **版本升级门禁** | Skill 改了一版，凭什么能合并主分支？ | patch/minor/major 三级 + CI 编码 |
| **生产发布门禁** | 合并 ≠ 全量上线，灰度到全量的状态机 | draft→experimental→canary→stable→deprecated→retired |

（第 4 道 = 下篇：生命周期治理）

## 入 Hub 门禁：4 类最低要求

### 类别一：结构合规

| 检查项 | 标准 |
|--------|------|
| frontmatter 完整 | 必须包含 name、version、owner、status、required_tools |
| name 全局唯一 | 不能和已有 Skill 重名 |
| version 是 1.0.0 | 初版必须从 1.0.0 起 |
| owner 是真实邮箱或团队代号 | 不能写 "team" 这种模糊词 |
| status 是 experimental 或 active | **不能直接 active** |

### 类别二：内容完整（8 块结构，少一块即拒）

1. frontmatter · 2. When to use · 3. Do not use when · 4. Inputs · 5. Steps · 6. Verification · 7. Failure handling · 8. Pitfalls

> **这 8 块都得有。少一块即拒。** ——与 [Skill Design Spec 8 Block Checklist Winty](../ch04/266-skill.html) 中的 8 块结构完全对齐

### 类别三：安全合规

| 检查项 | 标准 |
|--------|------|
| 不包含明文密钥 | 自动扫描 token / api key / password |
| 不直接执行高危操作 | 不能在 Steps 里写 `rm -rf` `DROP TABLE` 等 |
| 不引用未注册工具 | required_tools 都要在工具白名单里 |
| 权限范围合理 | required_permissions 只能是最小集 |

### 类别四：基础测试

| 检查项 | 标准 |
|--------|------|
| 至少有 5 个测试 case | 不能完全空跑 |
| L1 通过率 ≥ 90% | 起码不会崩 |
| L4 通过率 ≥ 95% | 不能违规 |

> **入 Hub 门禁不要求 L3 业务正确率多高，因为初版还在打磨。但 L1 和 L4 必须高。**

满足这四类，Skill 进 Hub 并标记为 `experimental`，**不允许在生产环境调用，只允许在沙盒和指定团队里跑**。

## 版本升级门禁：patch/minor/major 三级

| 改动类型 | 门禁等级 | 例子 |
|----------|---------|------|
| patch | 轻量 | 修措辞、加 Pitfall、补 Example |
| minor | 中等 | 新增 step、加 Input、调整判断条件 |
| major | 重 | 删 step、改默认行为、改 status |

### 三级门禁具体规则

**轻量门禁（patch）**：
- 必须有改动动机说明
- PR 通过 owner 同意即可
- 不强制跑评估，但跑了更好

**中等门禁（minor）**：
- 必须有改动动机
- 必须跑完整评估
- 必须生成 v(N-1) → v(N) 对比报告
- 任何指标回退 > 3 pt 自动打回
- 至少 1 个 reviewer 同意

**重门禁（major）**：
- 必须有改动动机和迁移说明
- 必须跑完整评估
- **必须跑稳定性扰动测试**
- 必须人眼复核 regression set
- **没有 P0 regression 才能继续**
- Token 增长不能超过 25%
- **必须 owner + 平台 reviewer 双签**

### CI 编码示例

```yaml
on_skill_pr:
  - extract_change_type: patch | minor | major
  - if patch:
      - require_owner_approval
  - if minor:
      - require_evaluation
      - generate_compare_report
      - block_if_regression > 3pt
      - require_one_reviewer
  - if major:
      - require_evaluation
      - require_robustness_test
      - require_regression_review
      - block_if_p0_regression
      - require_owner_and_platform_signoff
```

> **这套分级很重要**：
> - 轻量改动不要被流程压垮（避免改 Pitfall 都要排队）
> - 高风险改动不要轻易放行（避免 major 也"快速上线"）

## 生产发布门禁：6 状态状态机

> **合并 ≠ 全量上线。生产发布是另一个完全独立的门禁。**

| 状态 | 含义 | 谁能用 |
|------|------|--------|
| draft | 写完没合并 | 作者 |
| experimental | 已合并但未上线 | 沙盒 / 指定团队 |
| canary | 灰度中 | 部分团队 |
| stable | 全量上线 | 所有人 |
| deprecated | 已废弃 | 不建议使用 |
| retired | 完全下线 | 不可用 |

### 状态迁移门禁

**experimental → canary 门禁**：
- 入 Hub 门禁通过
- 至少有一个真实业务场景验证
- 评估结果稳定
- owner + 平台双签

**canary → stable 门禁**：
- **灰度至少 7 天**
- 灰度期间无 P0 / P1 事故
- 用户主动纠正比例 < 10%
- 失败率没有显著上升
- 所有指标稳定（不只是没下降，而是**趋势平稳**）

**stable → deprecated 门禁**：
- 有替代方案（**不能没有替代直接废弃**）
- 提前 30 天通知所有调用方
- deprecated 期间仍可调用，但有警告
- 30 天后转 retired

**任何状态 → retired 门禁**：
- 所有调用方都已迁移
- 已 deprecated 至少 30 天
- 最近 7 天调用量 = 0

## 自动 vs 人工：90% + 10%

| 维度 | 自动负责 | 人工负责 |
|------|---------|---------|
| 检查类型 | 结构合规、安全扫描、评估跑分、对比报告、状态机迁移、灰度监控 | 改动动机合理性、regression 可接受性、特批、迁移路径、跨团队仲裁 |
| 执行 | CI/CD 流水线 | Reviewer / Owner / 平台团队 |
| 比例 | **90%** | **10%** |

> **人工部分，必须留有清晰的"决策记录"**。我建议每一个特批都要写："为什么我决定让它过，依据是什么。"否则等下次出事故，连复盘都复不动。

## 真实场景：被门禁拦下的 Skill

某团队提交了 incident-triage v1.4.0 PR，改动是新增"自动重启服务"作为一个可选 step。

进入门禁后：
- 结构扫描：✅
- 安全扫描：⚠ 警告 restart_service 是高危操作
- 评估：overall +3pt，但 L4 -8pt（因为新增的重启动作触发了一些禁飞区）
- 对比：P0 cases 出现了 2 例 regression
- **自动判断：minor 但触发 major 检查（因为 L4 回退超阈值）**

CI 自动给 PR 加上了 major-required 和 regression 两个标签，并贴了详细对比报告。

owner 看完之后，做了三件事：
1. 把"自动重启"改成"重启需要用户确认"
2. 在 Steps 里加 Verification：重启后必须等服务健康再继续
3. 在 Pitfalls 里加："重启不是默认动作，只在确认无其他可恢复路径时使用"

重新跑评估：
- L4 -8pt → -1pt（接近 v1）
- P0 regression 0 例
- overall +5pt

**通过 minor 门禁，进入 experimental，再经过 7 天灰度，最终 stable。整个过程没出事故。**

> **这就是质量门禁的真实价值：它不是为了挡新版本，而是为了挡那些"看起来没问题但其实会出事"的新版本。**

## 三个执行原则

> 质量门禁最难的不是规则设计，而是规则执行。

**关键判断**：本系列两篇**高度互补**——第 1 篇回答"为什么需要 Hub"，第 2 篇回答"Hub 怎么把关质量"。两篇合在一起构成企业级 Skill Hub 治理的完整方法论。

## 第 3 篇：Skill 生命周期 6 阶段治理（2026-06-17 发布）

> Source: [第 3 篇原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/skill-lifecycle-6-stages-winty-2026-06-17.md)

**核心金句**：

> **门禁是某一时刻的把关，生命周期治理是从摇篮到坟墓的管理。**

第 2 篇末尾预告"Skill 生命周期治理"主题（见上方第 530 行）。本来源（2026-06-17 发布）正是这一预告的实现：将一个 Skill 从创建到废弃的全生命周期拆为 **6 个阶段**，每阶段规则独立，并给出数据化的迁移规则、Dashboard 设计、真实遗忘事故复盘。

### 6 个阶段速览

| 阶段 | 核心问题 | 关键约束 | 工具/动作 |
|------|---------|---------|-----------|
| **1. 创建 Creation** | 是否真的需要新 Skill？ | 重复性检查 + 场景描述模板 | 语义搜索 + `proposal.yaml` 模板 |
| **2. 审核 Review** | 这个 Skill 是否能进 Hub？ | 4 维度审核（业务对齐/工程质量/安全合规/性能成本） | 业务方 + 平台团队 + 安全团队 + 性能 review |
| **3. 发布 Release** | 如何分档上线？ | 4 档发布（internal / preview / canary / stable）+ 数据化迁移规则 | 累计调用 ≥ 50/200/1000 次 + L3 ≥ 75/80% |
| **4. 灰度 Canary** | 如何观察？ | 4 件事（选灰度群体/监控指标/abort 触发/期满判定） | 5%-20% 灰度 + 自动暂停 + 7 天稳定期 |
| **5. 运行 Live** | 如何持续监控？ | 持续监控 + 异常告警 + 定期复盘 | 步骤数 + Token + 失败模式监控 + 季度复盘 |
| **6. 废弃 Deprecation** | 如何安全下线？ | 4 步（标记 deprecated / 通知 / 30 天迁移期 / retired 归档） | frontmatter `status: deprecated` + `sunset_date` + `replacement` |

### 互补角度 10 条（本来源独家）

1. **场景描述 proposal.yaml 模板**（本来源独家）：name + proposer + trigger_scenario + expected_value + similar_existing_skills + estimated_effort **六字段**——比第 1+2 篇"先写再说"更前置，**50% 新 Skill 提案在这一步被打回**（已存在同名同义）
2. **4 维度审核（非只看代码）**（本来源独家）：**业务对齐**（领域专家做）/ **工程质量**（平台团队做）/ **安全合规**（涉及生产/用户数据/支付订单自动触发）/ **性能成本**（每次调用 Token 数 + 平均时长）—— 平台团队代替不了业务方
3. **数据化迁移规则 3 档**（本来源独家）：
   - internal → preview：累计调用 ≥ 50 次 + L3 通过率 ≥ 75% + 至少 1 次 owner 复盘
   - preview → canary：累计调用 ≥ 200 次 + L3 通过率 ≥ 80% + 用户主动纠正 < 10%
   - canary → stable：灰度 ≥ 7 天 + 累计调用 ≥ 1000 次 + 无 P0/P1 事故 + 所有指标稳定
   - **核心收益**：升档变成"客观满足条件"，不是"老板拍脑袋"
4. **灰度 4 件事**（本来源独家）：选灰度群体（同一团队+成熟用户+5%-20% 规模）/ 监控关键指标（调用成功率+L3+步骤数+Token+主动纠正+失败模式）/ **abort 触发条件**（失败率 +10%/L3 -5pt/主动纠正 >15%/P1 事故 4 条件任一即自动回滚，不要等老板拍板）/ 灰度期满判定（7 天+所有指标✅）
5. **运行阶段 3 大异常信号**（本来源独家）：
   - **步骤数无故变多** = Skill 开始绕路
   - **Token 消耗突然上涨** = 模型行为变了
   - **同一类失败模式集中出现** = 某个上游变了
6. **定期复盘落到行动项**（本来源独家）：加 patch / 升 minor / 启动 major 重构 / 标记 deprecated——**复盘结果必须可执行**，不是写报告
7. **废弃 4 步走**（本来源独家，比第 2 篇更具体）：
   - **标记 deprecated**（修改 frontmatter 加 `deprecated_since` + `sunset_date` + `replacement` + `deprecation_reason`，Hub 调用时打印警告）
   - **通知所有调用方**（不假设大家看 changelog，通过 Hub 系统主动通知）
   - **30 天迁移期**（deprecated 仍可用但有警告，新调用方禁止使用，平台团队跟进迁移进度）
   - **retired 与归档**（调用量=0 转 retired 删除；>0 警告+延期 14 天；14 天后强制下线；**元数据保留作为考古档案**）
8. **Lifecycle Dashboard 设计**（本来源独家）：Status overview（draft 12 / experimental 28 / canary 9 / stable 87 / deprecated 11 / retired 34）+ Health alerts（步骤数 +25% / deprecated 仍有 200 次/天 / experimental 90 天未升档 3 类）+ Action queue（5 待 review / 3 灰度审批 / 2 stable 审批 / 4 retire 倒计时）—— **把"长期治理"从老板口号变成可跟进的 backlog**
9. **db-migrate-advisor 真实遗忘事故复盘**（本来源独家）：1 月创建 experimental，4 月被调用（期间数据库版本升级），差点出事故。**复盘后三件事**：experimental 超 60 天未升档告警 + deprecated 仍有调用告警 + stable 漂移告警。**核心洞察**：生命周期治理的真实价值不是"流程多"，而是"让东西不会被遗忘"
10. **Skill Hub = 生态 ≠ 仓库**（本来源独家隐含判断）：仓库关心"东西放进来了没"；生态关心"从哪来/谁维护/现在健康吗/有人在用吗/什么时候退场"——**企业 AI 能力持续演进的根本心智转换**

### 与第 1+2 篇的关系定位

| 维度 | 第 1 篇：Skill Hub（组织资产） | 第 2 篇：质量门禁 4 关 | 第 3 篇：生命周期 6 阶段 |
|------|----------------------------|---------------------|----------------------|
| **关注点** | Skill Hub 是什么、为什么 | 什么 Skill 允许进、什么版本允许上 | Skill 从生到死的全流程 |
| **核心概念** | 隐形 AI Tax + 组织资产 + 治理五件事 | 入 Hub 门禁 + 版本升级门禁 + 生产发布门禁 | 6 阶段治理 + 数据化迁移 + Dashboard |
| **状态机** | 无（介绍 Hub 概念） | 6 状态：draft → experimental → canary → stable → deprecated → retired | **同一 6 状态状态机的完整生命周期视角** |
| **核心动作** | 治理五件事（写/测/管/放/收） | 4 道门禁自动拦截（90% 自动 + 10% 人工） | **每阶段的具体规则 + 数据阈值 + abort 触发** |
| **案例** | 发版 Skill 三阶段（老张→Hub） | incident-triage v1.4.0 被门禁拦截 | **db-migrate-advisor 1 月→4 月被遗忘事故** |
| **落地工具** | Git 仓库 + GitHub Actions + 飞书表格 | 完整 CI 规则 + 状态机门禁 | **Lifecycle Dashboard + 治理 backlog** |
| **终极目标** | 从个人聪明到组织默认聪明 | 报告能拦得住事 | **让东西不会被遗忘** |

### 关键独到判断（本来源独家）

- **门禁 vs 生命周期**：第 2 篇讲"某一时刻的把关"，第 3 篇讲"从摇篮到坟墓的管理"——**两者互补而非替代**。门禁是"准入 + 状态迁移门槛"，生命周期是"持续治理 + 持续观察 + 持续收尾"
- **数据化迁移 = 客观升档**：internal→preview→canary→stable 三档迁移规则全部用累计调用次数 + L3 通过率 + 主动纠正比例量化，**消灭"老板拍脑袋升档"的灰色地带**
- **灰度 = 4 件事而非 1 件事**：很多团队做灰度只是拨 feature flag，**真正灰度要选群体 + 监控 + abort 触发 + 期满判定四件事齐全**，缺一不可
- **废弃 = 4 步而非 1 步**：很多团队废弃 = 删除 Skill（最偷懒），**真正废弃要标记 deprecated（frontmatter 4 字段） + 主动通知 + 30 天迁移期 + retired 归档 4 步**
- **retired = 考古档案**：retired 的 Skill 元数据永久保留 Hub，作为组织 AI 系统的"考古档案"——未来如果有人想看"我们曾经怎么处理这类问题"还能查到。**这是组织长期记忆的关键基础设施**
- **6 阶段 vs 6 状态机的对应关系**：第 2 篇的状态机 draft → experimental → canary → stable → deprecated → retired 对应第 3 篇生命周期 6 阶段中的具体节点。**状态机是"位置"，生命周期是"路径"**——状态机回答"现在在哪"，生命周期回答"怎么走 + 何时离开"
- **Dashboard = 治理 backlog**：把"长期治理"从老板口号变成可跟进的 backlog 是 Lifecycle Dashboard 的真正价值。**没有 Dashboard 的治理是表演，有 Dashboard 的治理是工程**
- **被遗忘是最大风险**：db-migrate-advisor 事故说明 **Skill 上线后最大的风险不是被攻击或被滥用，而是被遗忘**——治理体系的核心目标是"防遗忘"，不是"防失败"

### 实践启示（本来源补全）

- **创建阶段前置 50% 过滤**：场景描述 proposal.yaml 模板能打回 50% 重复提案，**比任何下游门禁都更高效**——把治理成本前移到创建阶段而不是发布阶段
- **数据化迁移规则消除主观性**：internal→preview→canary→stable 的客观阈值让升档可验证可审计，**避免"老板拍脑袋"**
- **灰度必须有 abort 触发条件**：4 个客观 abort 条件（失败率 +10%/L3 -5pt/主动纠正 >15%/P1 事故）必须事先写好，**不要等老板拍板**
- **运行阶段盯 3 大异常信号**：步骤数 + Token + 失败模式是 3 个最敏感的早期信号，**比业务指标变化更早出现**
- **废弃给 30 天迁移期**：删除 Skill 是最偷懒的废弃，**30 天迁移期 + 主动通知 + 调用方跟进 = 工程化的废弃**
- **retired 保留元数据作为考古档案**：retired 不等于 delete，**组织 AI 系统的长期记忆靠 retired 积累**——一个 5 年后回看"我们 2026 年怎么处理 incident triage"的考古价值远大于"省下的 hub 空间"
- **Dashboard 把治理从口号变工程**：Lifecycle Dashboard 让"长期治理"成为每周可跟进的 backlog，**没有 Dashboard 的治理是表演**
- **3 类告警防遗忘**：experimental 超 60 天未升档 + deprecated 仍有调用 + stable 漂移——3 类自动告警是治理体系的"安全网"

### 引用对应

- DevOps Service Lifecycle Management 经典实践（基础设施借鉴）
- Hermes Agent 文档中关于 Skill 状态的部分（Hermes 内置支持）
- Kubernetes Resource Lifecycle 设计思想（资源生命周期模式借鉴）

---

## 相关实体

- [review agent 机制深度解析（winty）](../ch03/045-agent.html)
→ [第 1 篇原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/skill-hub-organization-asset-winty.md) · [第 2 篇原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/skill-quality-gates-4-checks-winty-2026-06-16.md) · [第 3 篇原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/skill-lifecycle-6-stages-winty-2026-06-17.md) · ·

> **系列收尾**：winty 在第 3 篇末尾预告"下一篇进入更具体的实战层面：企业级 Skill Hub 的架构设计"——`架构设计`将是 winty Skill Hub 系列的第 4 篇，可继续追踪入库。

---

