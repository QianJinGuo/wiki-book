# Ch07 技能、工具与 MCP

> Agent 的手脚：Skill 系统、MCP 协议、Tool Use

> 本章收录 **62 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐⭐ 工程师 | 需编程基础 | 61 |
| ⭐⭐⭐ 专家 | 需ML基础 | 1 |

---

## 导读

Agent 能不能"动手做事"，取决于它有什么工具。

本章涵盖三个层面：Tool Use（模型调用外部 API 的基础能力）、MCP（Anthropic 推出的 Model Context Protocol，工具的 USB-C）、以及 Skill System（可复用的程序性记忆，把经验封装成可执行的模块）。

你会看到 winty 的 Skill Hub 如何把企业级 AI 经验资产化，微软的 Agent Framework Tools 如何用 4 类工具 + 7 列矩阵做选型，以及 Skill 版本管理的五大原则——语义化版本 + 灰度发布 + 质量门禁。

工具不是越多越好——设计得当的 3 个工具胜过设计粗糙的 30 个。

---

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

这与 [技能设计模式](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-design-patterns.md) 的要求一致——Skill 本质上是结构化的 Prompt + 工具链 + 执行策略，需要被当作**可执行软件**而非静态文档来治理。这也解释了为什么 [AI Skill 演进框架](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-skill-evolution-framework.md) 强调 Skill 的版本化和可测试性是不可妥协的基础要求。

### 3. 组织资产视角下的 Skill 定位：第三层抽象

winty 将 Skill 定位在"个人侧"与"工具侧"之间，并称之为"组织能力层"。这个描述有深刻的架构含义：**Skill 是对组织流程经验的结构化编码，而非硬编码的规则或松散的 Prompt 集合**。

[Harness 工程框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 提出的七层模型中，Skill 对应的是"组织适配层"（Organizational Adaptation Layer）——它不在个人 memory 里（个人层），也不是全局硬编码（工具层），而是被组织共享、治理和版本化的中间态。这与 [Thin Harness Fat Skills](https://github.com/QianJinGuo/wiki/blob/main/entities/thin-harness-fat-skills.md) 的核心论点相呼应：轻 harness（框架） + 重 skills（技能沉淀） 是组织级 AI 能力的正确方向。

### 4. 从"个人聪明"到"组织默认聪明"：新人入职问题的元问题

文章的核心比喻——"新人入职那天，AI 就已经知道怎么帮他发版了"——揭示了一个被大多数企业 AI 落地策略忽略的**新人上手问题的元问题**：不是 AI 不会，而是 AI 没有继承组织的积累。

这个问题在 [How To Encode Experience Into Skills](https://github.com/QianJinGuo/wiki/blob/main/entities/how-to-encode-experience-into-skills.md) 中有更系统的讨论：Skill 的价值不在于它能执行某个动作，而在于它编码了"在这个组织里，这个场景的标准做法是什么"。当 Skill 进入 Hub 后，新人不必再依赖"问老张"这种不可扩展的知识传递方式——组织智慧已经被结构化地编码进了 Skill Hub，被所有 Agent 共享。这与 [Hermes Self Evolution Closed Loop Skill Reuse Winty](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-self-evolution-closed-loop-skill-reuse-winty.md) 中的"技能复用闭环"是同一个逻辑在不同粒度上的表达。

### 5. 平台型与业务型的张力：Skill Hub 的权力结构

中台收口型模式的失败（平台定义能力，业务方只能用现成的；新需求要排期）揭示了 Skill Hub 治理中一个深层矛盾：**平台提供方与业务消费方之间的权力博弈**。这个问题在 [Skill System Design Three Way Comparison](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-system-design-three-way-comparison.md) 中有详细讨论。

winty 提出的"放得开"（能灰度发布、按团队订阅、按场景启用）实际上是一种**联邦式治理模型**：Hub 提供基础设施和治理框架，但 Skill 的所有权属于业务团队。这与传统的"中台把所有能力收到平台团队"模式有本质区别——[Skill Complete Guide Alibaba](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-complete-guide-alibaba.md) 中阿里云 tangram 模型的"企业级 Skill 管理中心"也采用了类似的分层所有权设计，平台管治理，业务方管内容。

## 实践启示

### 1. 先建立 Skill 治理基础设施，再扩大 Skill 覆盖率

**反直觉建议**：与其让各团队大量写 Skill，不如**先投入建立 Skill Hub 的工程基础设施**（版本控制、自动评估、审计日志），再鼓励团队将 Skill 推送到 Hub。

很多团队在"写了很多 Skill"后很快遇到"Skill 失控"问题（没有版本、没有评估、不知道谁改了啥），根本原因是治理基础设施没跟上。最小可行路径：**先跑通 Git 仓库 + GitHub Actions 自动化评估这一条线**，再扩展到灰度、回滚等高级能力。这与 [Skill 写作框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/skill-framework-writing-patterns.md) 中"先规范再扩展"的思想一致。

### 2. 从高频、高风险场景开始，优先将"团队规范"转化为 Skill

**落地优先级排序**（从高到低）：
1. **高风险操作**：生产数据库写入、支付链路、权限变更 → 第一个进入 Skill Hub
2. **高频流程**：代码评审、发版检查、环境配置 → 第二批
3. **低频但关键**：灾难恢复、故障排查手册 → 第三批

这个优先级参考了 [Agent Reliability Engineering Skillify Continuous Improvement](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-reliability-engineering-skillify-continuous-improvement.md) 中的"关键路径识别"方法：把组织中最不容出错的那类操作先用 Skill 固化起来，形成组织默认的正确做法。个人偏好类操作（如编辑器偏好）留在个人 Memory，不进入 Hub——Hub 的治理成本应该花在值得治理的地方。

### 3. 给每个 Skill 配置"最小评估集"，不要等到质量完美再发布

**关键实践**：每个 Skill 在进入 Hub 时，至少需要准备一个**最小可用测试集**（哪怕是 5-10 个历史输入输出对），用于后续版本比较。

这是"测得准"的最小实现——不是说要有一整套复杂的 Benchmark，而是每次 Skill 改动后能自动跑历史回放、生成正确率报告，证明新版本不比旧版本差。[Agent Skill Writing Evaluation](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-skill-writing-evaluation.md) 中提到的"基于回放的回归评估"是这个思路的技术实现。**不要等到 Skill 质量完美再进 Hub**——进 Hub 本身就是让 Skill 接受组织检验的开始。

### 4. 设计 Skill 的 Fork / 分支策略，明确所有权边界

当多个团队对同一个场景有不同需求时，"要不要做 fork"是真实问题。**建议采用软件分支模型（Git-flow）**：
- **主线版本（main）**：组织级通用 Skill，经 Hub 官方审核
- **团队分支（team-xxx）**：特定团队的定制 Skill，不进入官方 Hub
- **重大分歧时走 Fork**：在 Fork 上各自演进，核心接口保持兼容

参考 [Skill Formal Theory Survey](https://github.com/QianJinGuo/wiki/blob/main/concepts/skill-formal-theory-survey.md) 中关于 Skill 可组合性的讨论，以及 [Skill Design Spec 8 Block Checklist Winty](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-design-spec-8-block-checklist-winty.md) 中的结构化模板，Fork 的边界应该在"场景定制"层面而非"核心逻辑"层面——核心逻辑应该在主线收敛，场景差异通过参数或条件分支来处理。

### 5. 建立 Skill Hub 与现有工程流程的嵌入点，防止 Hub 成为孤岛

**实践警示**：Skill Hub 如果只是"另一个工具"，很快会被团队遗忘。**必须将 Skill Hub 与现有工程流程深度嵌入**：
- CI/CD 流水线触发时，自动调用相关 Skill 进行检查（[Skill Os Learning Skill Curation Self Evolving Agents](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-os-learning-skill-curation-self-evolving-agents.md) 中提到的"技能编排"思路）
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

> **这 8 块都得有。少一块即拒。** ——与 [Skill Design Spec 8 Block Checklist Winty](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-design-spec-8-block-checklist-winty.md) 中的 8 块结构完全对齐

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

> Source: [第 3 篇原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/skill-lifecycle-6-stages-winty-2026-06-17.md)

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

- [review agent 机制深度解析（winty）](https://github.com/QianJinGuo/wiki/blob/main/entities/review-agent-deep-dive-winty.md)
→ [第 1 篇原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/skill-hub-organization-asset-winty.md) · [第 2 篇原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/skill-quality-gates-4-checks-winty-2026-06-16.md) · [第 3 篇原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/skill-lifecycle-6-stages-winty-2026-06-17.md) · ·

> **系列收尾**：winty 在第 3 篇末尾预告"下一篇进入更具体的实战层面：企业级 Skill Hub 的架构设计"——`架构设计`将是 winty Skill Hub 系列的第 4 篇，可继续追踪入库。

---

## Ch07.002 Skill 设计模式

> 📊 Level ⭐⭐ | 25.5KB | `entities/skill-design-patterns.md`

## Overview
从 7 个顶级 Skill 仓库（OpenAI/anthropic/Google Labs/Dean Peters/Trail of Bits）中提炼出的 5 种核心设计模式 + 1 种特殊模式。为 Agent Skill 开发提供系统性框架选择指南，告别"怎么写都行"的随意性。
**核心价值：** Skill 本质是"知识注入"——不生成新工具，而是把指令文本注入 LLM 上下文，让 LLM 用已有工具执行指令。模式选择决定了知识如何组织、触发条件如何声明、执行流程如何控制。

## 5 种核心设计模式
### 模式 1：线性流程（Linear）
**适用：** 有明确步骤的操作（部署、安装、迁移）
**结构：** Prerequisites → Quick Start（Step 1→2→3）→ Fallback → Troubleshooting
**代表案例：** vercel-deploy（77 行）
**关键技巧：**

- 安全默认值：`"Always deploy as preview, not production"`
- 具体命令：每步给出可直接执行的 bash 命令
- 超时提示：`"Use a 10 minute (600000ms) timeout"`
- 降级方案：CLI 失败有 Fallback 脚本
- 负面指令：`"Do not curl the deployed URL to verify"`
---

### 模式 2：决策树 + 按需加载（Decision Tree）
**适用：** 大型平台选型、产品导航、问题诊断
**结构：** Authentication → Quick Decision Trees（按用户意图分类）→ Product Index
**代表案例：** cloudflare-deploy（224 行）、cloudflare（211 行，导航型）
**关键技巧：**

- 用户意图分类：`"I need to run code"` 而非 `"Compute products"`
- 树形导航：`├─ 边缘无服务器函数 → workers/`
- 渐进式披露：主文件 7KB，references/ 按需展开到几十万字
- 产品索引表：Product → Reference 映射表
**进阶：** 导航型（只做选型）和操作型（包含认证+命令+故障排除）可拆分为两个 Skill。
---

### 模式 3：循环迭代（Iterative Loop）
**适用：** TDD、代码审查、设计评审等反复执行"做→验证→改进"的流程
**结构：** Red-Green-Refactor 循环 + 借口反驳表 + 验证清单
**代表案例：** test-driven-development（371 行，obra/superpowers）
**关键技巧：**

- 强硬语气：`"Delete it. Start over."` 提高 LLM 遵从率
- Good/Bad 对比：用 `<Good>` 和 `<Bad>` 标签包裹代码示例
- 借口反驳表：预判 LLM 的 12 种偷懒借口并逐一反驳
- 验证清单：8 项 checklist 作为循环退出条件
- 人类兜底：`"ask your human partner"`
---

### 模式 4：接力棒循环（Baton / Cross-Session Persistence）
**适用：** 跨多个 session 持续推进的长期项目（天~周级别）
**结构：** 6 步执行协议（读接力棒→查阅上下文→执行→集成→更新文档→写下一个接力棒）
**代表案例：** stitch-loop（203 行，google-labs-code）
**关键技巧：**

- 文件即状态：`next-prompt.md` 作为接力棒，LLM 不需记住"上次做到哪"
- 续命机制：Step 6 标记为 Critical + MUST，忘了写接力棒循环就断了
- 编排无关：CI/CD、人在回路、Agent 链都能驱动
**与模式 3 的核心区别：** 状态存储在外部文件系统而非 LLM 对话上下文，支持跨 session。
| 维度 | 循环迭代（TDD） | 接力棒循环 |
|------|----------------|-----------|
| 状态存储 | LLM 对话上下文 | 外部文件系统 |
| 跨 session | ❌ | ✅ |
| 循环退出 | Checklist 全部打勾 | 路线图清空 |
| 适用时长 | 分钟~小时 | 天~周 |
---

### 模式 5：多阶段 + 检查点 + Skill 编排（Multi-Phase）
**适用：** 复杂的多周流程，有明确阶段划分和 Go/No-Go 决策点
**结构：** Phase（Activities → Outputs → Decision Point）× N 阶段 + Complete Workflow + Common Pitfalls
**代表案例：** discovery-process（502 行，deanpeters/Product-Manager-Skills）
**关键技巧：**

- 统一阶段模板：每个 Phase 都有 Activities → Outputs → Decision Point
- 决策检查点：`"达到饱和了吗？YES → 下一阶段，NO → +1 周"`
- Skill 编排：调度 10+ 个子 Skill 完成各阶段（编排器模式）
- 时间影响：每个 NO 路径标注 `"+2-3 days"`、`"+1 week"`
---

### 特殊模式：思维框架（Thinking Framework）
**适用：** 安全审计、代码审查、架构分析等需要深度思考而非快速执行的场景
**代表案例：** audit-context-building（302 行，trailofbits/skills）
**核心定位：** 控制 LLM"怎么想"而非"做什么"——不生成工具调用，而是建立分析框架。
**关键技巧：**

- 思维工具：第一性原理、5 Why、5 How 等分析框架
- 量化阈值：`"每个函数最少 3 个不变量、5 个假设"` 强制达到足够分析深度
- 非目标约束：`"不要识别漏洞、不要提出修复"` 先理解再判断
- 反幻觉规则：`"Never reshape evidence to fit earlier assumptions"`

## Anthropic 14 种实现模式（5 大类）
> 详细解读参见 [Anthropic 官方 14 种设计模式](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-design-patterns-anthropic.md)

### 发现与选择（2 模式）
| 模式 | 核心问题 | 关键做法 |
|------|---------|---------|
| 激活元数据模式 | Skill 怎么被选中 | description 包含：做什么 + 何时触发 + 关键词 |
| 排除条款模式 | 何时不触发 | 说明不适用场景，避免与其他 Skill 冲突 |

### 上下文经济（2 模式）
| 模式 | 核心问题 | 关键做法 |
|------|---------|---------|
| 上下文预算模式 | 如何节省 token | 每段话都要配得上占用的 token，删掉不影响理解就不写 |
| 渐进式披露模式 | 主文件太长怎么办 | 主文件 ≤500 行，详细内容拆分到 references/ 按需加载 |

### 指令校准（4 模式）
| 模式 | 核心问题 | 关键做法 |
|------|---------|---------|
| 控制调优模式 | 指令该写多细 | 根据任务脆弱程度决定：开放任务用「用你的判断」，高风险用精确脚本 |
| 解释原因模式 | 为何要遵守规则 | 先说规则，再说原因，让 LLM 能自主判断边界情况 |
| 模板脚手架模式 | 输出格式不稳定 | 给带占位符的模板（严格/灵活），模板定结构，示例定风格 |
| 已知陷阱模式 | 边缘情况处理 | 列出常见失败情况和已知的坑，来自踩过的实际经验 |

### 工作流控制（3 模式）
| 模式 | 核心问题 | 关键做法 |
|------|---------|---------|
| 执行清单模式 | 流程步骤被跳过 | 可勾选的 checklist，未完成项始终可见 |
| 自纠正循环模式 | 生成结果无人检查 | 生成 → 验证 → 失败则修复 → 再验证，直到通过 |
| 计划-验证-执行模式 | 批量/高风险操作失控 | 计划 → 验证 → 通过后才执行，所有验证在副作用之前 |

### 可执行代码（2 模式）
| 模式 | 核心问题 | 关键做法 |
|------|---------|---------|
| 实用工具包模式 | 确定性逻辑重复消耗推理资源 | scripts/ 里的脚本自己处理常见错误，不把问题抛回给 LLM |
| 自主校准模式 | Skill 权限过度 | allowed-tools 只声明必需的最少工具 |

## Anthropic 14 模式与 5+1 框架的对应关系
| Anthropic 分类 | 对应模式 | 核心贡献 |
|---|---|---|
| 发现与选择 | 模式 1 前置 | description 决定 Skill 是否被加载 |
| 上下文经济 | 模式 2 按需加载 | 渐进式披露、主文件<500行 |
| 指令校准 | 全部模式 | 控制调优、解释原因、模板脚手架 |
| 工作流控制 | 模式 3/5 | 执行清单、自纠正循环、计划-验证-执行 |
| 可执行代码 | 全部模式 | scripts/ 工具包、allowed-tools 权限控制 |
**说明：** Anthropic 的 14 种模式是更细粒度的实现技巧，而 5+1 框架是更高层次的结构选择。两者不是替代关系，而是不同抽象级别的工具。

## 通用写作技巧
### 防止 LLM 偷懒的 4 种武器
| 武器 | 原理 | 示例 |
|------|------|------|
| 强硬语气 | 命令式语气遵从率更高 | TDD："Delete it. Start over." |
| 借口反驳表 | 预判自我合理化路径并堵死 | TDD：12 种借口 + 反驳 |
| 量化阈值 | 硬性最低标准 | 审计："最少 3 个不变量、5 个假设" |
| 负面指令 | 明确禁止"不要做 X" | vercel-deploy："Do not curl the URL" |

### 教学的 3 种有效方式
| 方式 | 原理 | 示例 |
|------|------|------|
| Good/Bad 对比 | 对比学习效果最好 | TDD：`<Good>` vs `<Bad>` 代码示例 |
| 具体命令 | LLM 擅长执行具体指令 | vercel-deploy：每步都有 bash 命令 |
| 完整示例 | 展示期望的输出格式 | 审计：引用 FUNCTION_MICRO_ANALYSIS_EXAMPLE.md |

### 知识组织的 3 层架构
| 层级 | Token 预算 | 内容 |
|------|-----------|------|
| Frontmatter | ~100 tokens | name + description |
| 主文件 | 2K-5K tokens | 核心指令、决策树、流程步骤 |
| references/ | 1K-3K tokens/个 | 按需加载的详细文档 |
| **总上下文占用** | **<10K tokens** | 主文件 + 1-2 个参考文档 |

## 模式选择决策树
```
你的 Skill 需要做什么？
│
├─ 执行一个有明确步骤的操作
│  └─ → 模式 1：线性流程
│
├─ 在大量选项中帮用户选择正确的方向
│  └─ → 模式 2：决策树 + 按需加载
│
├─ 在单次会话中反复执行"做→验证→改进"
│  └─ → 模式 3：循环迭代
│
├─ 跨多个 session 持续推进一个长期项目
│  └─ → 模式 4：接力棒循环
│
├─ 跨越多天/多周，有阶段划分和 Go/No-Go 决策
│  └─ → 模式 5：多阶段 + 检查点
│
└─ 需要 LLM 进行深度分析而非快速执行
   └─ → 特殊模式：思维框架
```

## 参考 Skill 仓库
| 仓库 | 地址 | 特点 |
|------|------|------|
| anthropics/skills | github.com/anthropics/skills | 官方模板和规范 |
| openai/skills | github.com/openai/skills | Codex 官方 Skill 目录 |
| obra/superpowers | github.com/obra/superpowers | 14 个工作流型 Skill |
| google-labs-code/stitch-skills | github.com/google-labs-code/stitch-skills | 设计到代码的 Skill |
| deanpeters/Product-Manager-Skills | github.com/deanpeters/Product-Manager-Skills | 40+ 产品管理 Skill |
| trailofbits/skills | github.com/trailofbits/skills | 安全审计 Skill |
| openclaw/clawhub | github.com/openclaw/clawhub | Skill 注册中心 |
| VoltAgent/awesome-agent-skills | github.com/VoltAgent/awesome-agent-skills | 500+ Skill 索引 |

## 子页面
-  — 5 大类 14 种模式详解与写作技巧

## 深度分析
### 模式演进的内在逻辑
从 7 个顶级仓库提炼出的 5+1 种模式，并非随机排列，而是沿着**控制粒度**和**时间跨度**两个维度呈阶梯式分布。
**控制粒度**从「告诉 LLM 做什么」到「告诉 LLM 怎么想」：

- 模式 1-5 都在描述**行为**（做什么、选哪个、走哪步）
- 特殊模式（思维框架）描述的是**思维方式**（怎么分析、怎么验证）
**时间跨度**从瞬时到持久：

- 线性流程：秒~分钟级别
- 循环迭代：分钟~小时级别（单 session）
- 接力棒循环：天~周级别（跨 session）
- 多阶段检查点：周~月级别
这意味着：模式选择的核心依据不是「任务难度」，而是「需要在多长时间跨度内维持一致性」。

### 为何「线性流程」是入门首选
5 种模式里，线性流程是被引用最广的起点（vercel-deploy 仅 77 行），原因有三：
1. **失败成本低**：每步有显式输出，错了容易定位
2. **上下文占用低**：不需要预设循环退出条件或状态文件
3. **调试友好**：TDD、审查等循环模式出问题时，往往先简化为线性步骤来隔离 bug
但线性流程的局限也最明显：它无法处理「需要根据结果调整下一步」的场景——那是循环迭代的领地。

### 循环迭代与接力棒的本质区别
两者都涉及重复，但核心差异不在「重复」本身，而在**状态存储位置**：
| | 循环迭代（模式 3） | 接力棒循环（模式 4） |
|--|---|---|
| 状态存储 | LLM 对话上下文 | 外部文件系统 |
| 适用场景 | 单次会话内的收敛 | 跨 session 的持久推进 |
| 退出条件 | checklist 全部打勾 | 路线图清空 |
| 本质 | 让 LLM 记住「这次做到哪」 | 让 LLM 继承「上次做到哪」 |
一个关键推论：如果任务本身在单次对话内就能完成，用接力棒就是过度设计；但如果任务会被人为中断（用户关闭窗口、换设备），接力棒就是唯一可靠的选择。

### 模式 2 的两个陷阱
决策树 + 按需加载（模式 2）是，看起来简单但实际上最容易踩坑的模式：
**陷阱一：用户意图分类不准确**
cloudflare 的导航型 Skill 把「用户意图」作为顶级分类键（「I need to run code」），这要求对用户语言有高度敏感——同一需求可能有十几种表达方式。如果分类颗粒度不够，LLM 会选错分支。
**陷阱二：渐进式披露过头**
主文件 7KB、references/ 按需展开到几十万字的设计，依赖 LLM 能准确判断「该加载哪个文件」。一旦判断错误，LLM 会在错误的上下文中工作，输出质量不可预测。
解决方式在 Anthropic 的渐进式披露模式里：主文件尽量控制在 500 行以内，给长参考文件加 TOC，这样即使读取被截断，LLM 也能知道整体结构。

### Anthropic 14 模式的降维映射
Anthropic 的 14 种模式可以映射到本文的 5+1 框架：
| Anthropic 分类 | 对应模式 | 核心贡献 |
|---|---|---|
| 发现与选择 | 模式 1 前置 | description 决定 Skill 是否被加载 |
| 上下文经济 | 模式 2 按需加载 | 渐进式披露、主文件<500行 |
| 指令校准 | 全部模式 | 控制调优、解释原因、模板脚手架 |
| 工作流控制 | 模式 3/5 | 执行清单、自纠正循环、计划-验证-执行 |
| 可执行代码 | 全部模式 | scripts/ 工具包、allowed-tools 权限控制 |
这说明：Anthropic 的 14 种模式是更细粒度的实现技巧，而 5+1 框架是更高层次的结构选择。两者不是替代关系，而是不同抽象级别的工具。

### 模式与上下文字节数的关系
知识组织的 3 层架构（Frontmatter ~100、主文件 2K-5K、references/ 每个 1K-3K、总上下文 <10K）背后有一个隐含约束：
当主文件超过 300 行时，就应该考虑拆分了（Anthropic 的渐进式披露模式建议）。这与「主文件 2K-5K tokens」的预算并不矛盾——300 行 Markdown 约等于 3K-4K tokens，正好在上限附近。
实际编写中，一个 Skill 好不好，从上下文占用就能大致判断：超过 15K tokens 的 Skill，LLM 的遵从率会显著下降。

### 控制粒度与 Skill 类型的关系
Skill 通常分为两类：
1. **任务型技能**：对应整套步骤化流程，用户通过 `/skill-name` 直接触发，通常设置 `disable-model-invocation: true`
2. **参考型技能**：更像背景知识，用户不可直接调用，Claude 在相关场景下自动应用
| 类型 | 典型模式 | description 要求 |
|------|---------|-----------------|
| 任务型 | 模式 1/3/4/5 | 清晰的动作 + 触发时机 + 关键词 |
| 参考型 | 模式 2/特殊模式 | 领域边界 + 适用场景 + 排除条款 |
参考型技能对 description 的要求反而更高——因为它不能被直接调用，全靠 description 里的触发词来决定何时加载。

## 实践启示
### 写 Skill 前的第一问
在动笔之前，先问自己一个问题：**这个 Skill 解决的是「不知道怎么做」，还是「容易做错」？**

- 如果是「不知道怎么做」→ 优先用模式 1 或 2（线性流程或决策树）
- 如果是「容易做错」→ 优先用模式 3 或特殊模式（循环迭代或思维框架）
这个判断决定了 Skill 的整体基调：前者偏向指引，后者偏向约束。

### 从最小可用开始
快速上手模板（线性模式）只需 4 个 Section：Prerequisites → Steps → Troubleshooting。不用一上来就设计循环迭代或接力棒——先用最少的结构验证需求是否真实存在。
如果同一个 Skill 被反复使用，而且每次都是「做一半、中断、继续做」，那时再引入模式 4（接力棒循环）。
如果发现每次都在重复相同的修正（比如总是漏掉某个验证步骤），那时再引入模式 3（循环迭代）的退出清单。

### description 的三个必含要素
Anthropic 的 Activation Metadata 模式指出：一个好的 description 必须同时包含：
1. **做什么**（功能）
2. **什么时候用**（触发场景）
3. **遇到哪些词要触发**（关键词）
缺任何一个，Skill 被加载的概率就会下降。尤其是在 skill 库较大的情况下，description 决定了「这个 Skill 会不会被用到」。

### 防止 LLM 偷懒的四种武器可以组合使用
强硬语气、借口反驳表、量化阈值、负面指令，这四种武器并非孤立，而是可以叠加：

- 在技能开头用强硬语气（「Delete it. Start over.」）
- 在循环体内用借口反驳表堵死逃避路径
- 在验证清单里用量化阈值（最少 3 个不变量、5 个假设）
- 在边界场景用负面指令（「Do not curl the URL」）
组合效果远大于单用其一——因为 LLM 的偷懒路径是多元的，单一武器无法覆盖所有情况。

### 渐进式披露的实施检查
如果 SKILL.md 超过 300 行，按渐进式披露原则应该拆分。检查步骤：
1. 主文件是否在 500 行以内？
2. 参考文档是否有 TOC（目录）？
3. scripts/ 里的脚本是否不会加载到上下文？
4. 拆分后主文件是否仍然可以独立提供核心价值？
如果第四点不满足（即拆开后每个文件都没法单独提供价值），说明拆分粒度有问题，需要重新设计结构。

### 模式选择的修正时机
模式选择不是一锤子买卖。随着 Skill 使用的深入，需要根据实际情况修正：
| 信号 | 修正方向 |
|------|---------|
| 每次都要手动提醒 LLM 某个步骤 | 线性流程 → 加入执行清单（模式 10） |
| LLM 经常跳过验证步骤 | 线性流程 → 自纠正循环（模式 11） |
| 任务需要跨越多次会话 | → 引入接力棒循环（模式 4） |
| 状态文件越来越复杂 | 接力棒 → 考虑多阶段检查点（模式 5） |
| LLM 在边界情况总是判断错误 | → 引入思维框架（特殊模式） |
不要试图一步到位设计最复杂的模式。从最小可用开始，根据实际使用中的失败模式逐步迭代。

### 工具包模式的价值实现
实用工具包模式（Anthropic 模式 13）的核心价值不在「写脚本」，而在「让确定性的事情不要消耗 LLM 的推理资源」。
实施检查：

- 脚本是否能自己处理常见错误，而不是把问题抛回给 LLM？
- 常量是否有注释说明用途（避免魔法数字）？
- 脚本在不同系统环境下是否能正常工作（路径、权限）？
如果一个脚本每次运行都要 LLM 盯着看日志，它就不是一个合格的工具包。

### 指令校准的灵活性判断
控制调优模式（Anthropic 模式 5）的核心问题是：这里能接受多大的偏差？

- **高自由度**（文本指令，如「用你的判断」）：适合开放型任务，如代码审查
- **中自由度**（伪代码、参数化步骤）：适合有流程但需灵活调整的任务，如部署
- **低自由度**（精确脚本、强约束，如「不要修改」）：适合高风险操作，如数据库迁移
很多人会倾向于「写死一点更安全」，但其实只是把失败方式换了一种：从「做错」，变成「做不了」。

### 解释原因 vs 直接命令的选择
解释原因模式（Anthropic 模式 6）的核心是：先说规则，再说明原因。
比如：「使用构造器注入。字段注入会破坏可测试性，因为需要依赖 Spring 上下文来模拟字段。」就比：「必须使用构造器注入，绝不使用字段注入。」更稳一些。
**但不是所有场景都适合解释原因**：

- 带原因的写法更适合需要 LLM 自己做判断的地方
- 对于真正「不能出错」的低自由度场景，直接命令式反而更合适

## Related
- [Agent Skill 编写指南](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-skill-writing.md) — Skill 格式、渐进式披露、编写规范、评估迭代的基础知识
- [Hermes Agent](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent.md) — 支持 Skill 机制的核心开源 Agent
- [OpenClaw 架构解析](https://github.com/QianJinGuo/wiki/blob/main/concepts/openclaw-architecture.md) — 内置 Skill 系统实现
- [Anthropic 14 模式原始文章](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/anthropic-14-skill-patterns-best-practices.md)
- [社区模式原始文章存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/skill-writing-patterns-best-practices.md)

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/ai-skill-design.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/wiki-master-map.md)

---

## Ch07.003 工作流的 Skill 怎么写？从 7 个顶级 Skill 中提炼的模式与最佳实践

> 📊 Level ⭐⭐ | 24.6KB | `entities/skill-writing-patterns-best-practices.md`

## 一、Skill 是什么
Skill 是一个文件夹，核心是 `SKILL.md` 文件，使用 YAML frontmatter + Markdown 正文的格式。当 LLM 判断需要某个 Skill 时，会调用 `skill` 工具加载它，SKILL.md 的全部内容会作为 tool-result 注入到对话上下文中，LLM 读到后自主决定怎么执行。
```
my-skill/
├── SKILL.md              # 主文件（必须）
├── scripts/              # 可执行脚本（可选）
├── references/            # 详细参考文档（可选，按需加载）
├── resources/             # 模板、清单等资源（可选）
└── examples/              # 示例（可选）
```
**关键机制：** Skill 本质是"知识注入"——它不会动态生成新工具，而是把指令文本注入到 LLM 的上下文中，LLM 用已有的工具（bash、read、edit 等）来执行这些指令。

## 二、Frontmatter：决定 Skill 是否被加载的"门面"
### 2.1 必填字段
| 字段 | 作用 | 示例 |
|------|------|------|
| name | 唯一标识符，小写连字符 | test-driven-development |
| description | 最关键——LLM 通过它决定是否加载 | 见下方对比 |

### 2.2 Description 的写法决定加载率
```yaml

# ✅ 好的 description — 包含触发短语和关键词
description: Deploy applications and websites to Vercel. Use when the user
  requests deployment actions like "deploy my app", "push this live",
  or "create a preview deployment".

# ✅ 好的 description — 定义时序位置
description: Use when implementing any feature or bugfix, before writing
  implementation code

# ❌ 差的 description — 太模糊
description: Helps with deployment stuff
```
**核心原则：**

- 列举触发短语：把用户可能说的话写进去（"deploy my app"、"push this live"）
- 定义时序位置：说明"在什么之前/之后"使用（"before writing implementation code"）
- 包含产品关键词：如果覆盖大平台，把所有产品名著出来

### 2.3 可选扩展字段
| 字段 | 来源 | 作用 |
|------|------|------|
| references | OpenCode cloudflare | 声明最重要的参考文档 |
| allowed-tools | Google Labs stitch-loop | 声明需要的工具权限 |
| type | Dean Peters discovery-process | 声明 Skill 类型（workflow/component） |
| best_for | Dean Peters discovery-process | 最适合的场景列表 |
| scenarios | Dean Peters discovery-process | 具体的触发场景示例 |
| estimated_time | Dean Peters discovery-process | 预估执行时间 |

## 三、5 种核心设计模式
### 模式 1：线性流程
**适用场景：** 部署、安装、迁移等有明确步骤的操作。
**代表：** openai/skills — vercel-deploy（77 行）
**结构：**
```

# 标题
## Prerequisites（前置条件）
## Quick Start（主流程：Step 1 → 2 → 3）
## Fallback（降级方案）
## Troubleshooting（故障排除）
```
**关键技巧：**
| 技巧 | 示例 | 为什么有效 |
|------|------|----------|
| 安全默认值 | "Always deploy as preview, not production" | 防止 LLM 做出危险操作 |
| 具体命令 | 每步给出可直接执行的 bash 命令 | LLM 不需要猜测 |
| 超时提示 | "Use a 10 minute (600000ms) timeout" | 防止 LLM 因超时中断 |
| 降级方案 | CLI 失败有 Fallback 脚本 | 提供 B 计划 |
| 负面指令 | "Do not curl the deployed URL to verify" | 明确禁止不该做的事 |
**适用判断：** 如果你的 Skill 可以用"先做 A，再做 B，最后做 C"描述，就用线性模式。
---

### 模式 2：决策树 + 按需加载
**适用场景：** 大型平台选型、产品导航、问题诊断。
**代表：** openai/skills — cloudflare-deploy（224 行）
**结构：**
```

## Authentication（认证前置）
## Quick Decision Trees（决策树）
  ### "I need to run code"（按用户意图分类）
  ### "I need to store data"
  ### "I need AI/ML"
## Product Index（产品索引表）
```
**关键技巧：**
| 技巧 | 示例 | 为什么有效 |
|------|------|----------|
| 用户意图分类 | "I need to run code" 而非 "Compute products" | 用用户语言而非技术术语 |
| 树形导航 | ├─ 边缘无服务器函数 → workers/ | LLM 快速定位正确产品 |
| 渐进式披露 | 主文件 7KB，references/ 按需展开到几十万字 | 不浪费上下文窗口 |
| 产品索引表 | Product → Reference 的映射表 | 结构化的快速查找 |
**进阶：** 同一个知识域可以拆成两个 Skill——导航型（cloudflare）只做选型，操作型（cloudflare-deploy）包含认证、命令、故障排除。
---

### 模式 3：循环迭代
**适用场景：** TDD、代码审查、设计评审等需要反复执行的流程。
**代表：** obra/superpowers — test-driven-development（371 行）
**结构：**
```

## The Iron Law（铁律——不可违反的核心原则）
## Red-Green-Refactor（循环体）
  ### RED — 写失败的测试
  ### Verify RED — 验证确实失败
  ### GREEN — 写最少的代码
  ### Verify GREEN — 验证确实通过
  ### REFACTOR — 清理
  ### Repeat（回到 RED）
## Common Rationalizations（借口反驳表）
## Verification Checklist（退出条件）
```
**关键技巧：**
| 技巧 | 示例 | 为什么有效 |
|------|------|----------|
| 强硬语气 | "Delete it. Start over." | LLM 倾向于"灵活变通"，强硬语气提高遵从率 |
| Good/Bad 对比 | 用 <Good> 和 <Bad> 标签包裹代码示例 | 对比教学效果最好 |
| 借口反驳表 | 预判 LLM 可能的 12 种偷懒借口并逐一反驳 | 堵死所有逃避路径 |
| 验证清单 | 8 项 checklist 作为循环退出条件 | 确保质量达标才能结束 |
| 人类兜底 | "ask your human partner" | 不确定时交给人 |
---

### 模式 4：接力棒循环（跨 Session 持久化）
**适用场景：** 多次迭代的长期项目，需要跨多个 session 持续工作。
**代表：** google-labs-code/stitch-skills — stitch-loop（203 行）
**结构：**
```

## Overview（接力棒模式概述）
## The Baton System（接力棒文件规范）
## Execution Protocol（6 步执行协议）
  ### Step 1: Read the Baton（读接力棒）
  ### Step 2: Consult Context Files（查阅上下文）
  ### Step 3: Generate（执行任务）
  ### Step 4: Integrate（集成结果）
  ### Step 5: Update Documentation（更新文档）
  ### Step 6: Prepare the Next Baton ⚠️（写下一个接力棒——关键！）
## File Structure Reference（文件协议）
## Orchestration Options（编排方式）
```
**与模式 3 的区别：**
| 维度 | 循环迭代（TDD） | 接力棒循环（Stitch Loop） |
|------|----------------|-------------------------|
| 状态存储 | LLM 对话上下文 | 外部文件系统 |
| 跨 session | ❌ | ✅ |
| 循环退出 | Checklist 全部打勾 | 路线图清空 |
| 适用时长 | 单次会话（分钟~小时） | 长期项目（天~周） |
---

### 模式 5：多阶段 + 检查点 + Skill 编排
**适用场景：** 复杂的多周流程，需要在关键节点做 Go/No-Go 决策。
**代表：** deanpeters/Product-Manager-Skills — discovery-process（502 行）
**结构：**
```

## Key Concepts（核心概念 + 反模式）
## Phase 1: Frame the Problem（阶段 1）
  ### Activities（调用哪些子 Skill）
  ### Outputs（阶段产出）
  ### Decision Point 1（检查点：YES/NO + 时间影响）
## Phase 2-6...（重复相同结构）
## Complete Workflow（端到端时间线）
## Common Pitfalls（常见陷阱）
## References（引用的子 Skill 列表）
```
---

### 特殊模式：思维框架（控制 LLM"怎么想"）
**适用场景：** 安全审计、代码审查、架构分析等需要深度思考的场景。
**代表：** trailofbits/skills — audit-context-building（302 行）
**结构：**
```

## Purpose（定位：控制思维方式，不是控制行为）
## When to Use / When NOT to Use
## Rationalizations（借口反驳表）
## Phase 1: Initial Orientation（定向扫描）
## Phase 2: Ultra-Granular Function Analysis（逐行分析——核心）
  ### Per-Function Checklist（函数微分析清单）
  ### Cross-Function Flow Analysis（跨函数追踪）
  ### Output Requirements（输出格式 + 量化阈值）
  ### Completeness Checklist（完整性检查）
## Phase 3: Global System Understanding（全局理解）
## Stability Rules（反幻觉规则）
## Non-Goals（明确禁止做的事）
```
**关键技巧：** 第一性原理/5 Why/5 How 等思维工具、量化阈值（"每个函数最少 3 个不变量、5 个假设"）、非目标约束、反幻觉规则（"Never reshape evidence to fit earlier assumptions"）。

## 四、通用写作技巧
### 防止 LLM 偷懒的 4 种武器
| 武器 | 原理 | 示例来源 |
|------|------|---------|
| 强硬语气 | LLM 对命令式语气的遵从率更高 | TDD："Delete it. Start over." |
| 借口反驳表 | 预判 LLM 的自我合理化路径并堵死 | TDD：12 种借口 + 反驳；审计：6 种借口 |
| 量化阈值 | 给出硬性的最低标准 | 审计："最少 3 个不变量、5 个假设" |
| 负面指令 | 明确说"不要做 X" | vercel-deploy："Do not curl the URL" |

### 教学的 3 种有效方式
| 方式 | 原理 | 示例来源 |
|------|------|---------|
| Good/Bad 对比 | 对比学习效果最好 | TDD：<Good> vs <Bad> 代码示例 |
| 具体命令 | LLM 擅长执行具体指令 | vercel-deploy：每步都有 bash 命令 |
| 完整示例 | 展示期望的输出格式 | 审计：引用 FUNCTION_MICRO_ANALYSIS_EXAMPLE.md |

### 安全与边界的 3 条原则
| 原则 | 做法 | 示例来源 |
|------|------|---------|
| 安全默认值 | 默认选择最安全的选项 | vercel-deploy："Always deploy as preview" |
| 权限最小化 | 只在必要时提升权限 | vercel-deploy："Do not escalate the installation check" |
| 人类兜底 | 不确定时交给人 | TDD："ask your human partner" |

### 知识组织的 3 层架构
| 层级 | Token 预算 | 内容 |
|------|-----------|------|
| Frontmatter | ~100 tokens | name + description |
| 主文件 | 2K-5K tokens | 核心指令 |
| 参考文档（单个） | 1K-3K tokens | 按需加载 |
| **总上下文占用** | **<10K tokens** | 主文件 + 1-2 个参考文档 |

## 五、模式选择决策树
```
你的 Skill 需要做什么？
│
├─ 执行一个有明确步骤的操作
│  └─ → 模式 1：线性流程
│
├─ 在大量选项中帮用户选择正确的方向
│  └─ → 模式 2：决策树 + 按需加载
│
├─ 在单次会话中反复执行"做→验证→改进"
│  └─ → 模式 3：循环迭代
│
├─ 跨多个 session 持续推进一个长期项目
│  └─ → 模式 4：接力棒循环
│
├─ 跨越多天/多周，有阶段划分和 Go/No-Go 决策
│  └─ → 模式 5：多阶段 + 检查点
│
└─ 需要 LLM 进行深度分析而非快速执行
   └─ → 特殊模式：思维框架
```

## 六、快速上手模板
### 最小可用 Skill（线性模式）
```yaml
---
name: my-skill
description: [一句话描述做什么 + 什么时候触发]
---

# Skill 名称
[一句话核心原则 + 安全默认值]

## Prerequisites
- [前置条件 1]
- [前置条件 2]

## Steps
### Step 1: [动作]
```bash
[具体命令]
```

### Step 2: [动作]
[具体指令]

### Step 3: [动作]
[具体指令]

## Troubleshooting
| Issue | Solution |
|-------|----------|
| [问题 1] | [解决方案]
```

### 循环迭代 Skill 模板
```yaml
---
name: my-loop-skill
description: [描述 + 触发时机]
---

## Core Principle
[不可违反的铁律]

## The Loop
### Phase A — [动作]
[具体指令]

### Verify A
[验证命令]

### Phase B — [动作]
[具体指令]

### Verify B
[验证命令]

### Repeat
回到 Phase A。

## Rationalizations
| Excuse | Reality |
|--------|----------|
| "[借口 1]" | [反驳] |

## Completion Checklist
- [ ] [条件 1]
- [ ] [条件 2]
```

## 七、参考资源
**官方规范：**
1. Agent Skills 开放标准 — https://agentskills.io/
2. anthropics/skills — https://github.com/anthropics/skills/tree/main/template
3. anthropics/skills 规范文档 — https://github.com/anthropics/skills/tree/main/spec
**精选仓库：**
1. openai/skills — OpenAI Codex 官方 Skill 目录
2. obra/superpowers — 14 个工作流型 Skill
3. google-labs-code/stitch-skills — 设计到代码的 Skill
4. deanpeters/Product-Manager-Skills — 40+ 产品管理 Skill
5. trailofbits/skills — 安全审计 Skill
6. openclaw/clawhub — Skill 注册中心
**精选列表：**
1. VoltAgent/awesome-agent-skills — 500+ Skill 索引
2. travisvn/awesome-claude-skills — 精选列表 + Skill vs MCP 对比

## 八、本文分析的 7 个 Skill 速查表
| # | Skill | 来源 | 模式 | 行数 | 一句话精髓 |
|---|-------|------|------|------|-----------|
| 1 | vercel-deploy | OpenAI | 线性 | 77 | 最小但完整的 Skill 模板 |
| 2 | cloudflare-deploy | OpenAI | 线性+决策树 | 224 | 大平台的渐进式披露 |
| 3 | cloudflare | OpenCode | 纯决策树 | 211 | 导航型 vs 操作型的区别 |
| 4 | test-driven-development | obra | 循环迭代 | 371 | 堵死 LLM 偷懒的所有退路 |
| 5 | stitch-loop | Google Labs | 接力棒循环 | 203 | 文件即状态，跨 session 持久化 |
| 6 | discovery-process | Dean Peters | 多阶段+检查点 | 502 | 编排器模式，调度 10+ 子 Skill |
| 7 | audit-context-building | Trail of Bits | 思维框架 | 302 | 控制 LLM"怎么想"而非"做什么" |

## 深度分析
### 1. Skill 本质是"上下文工程"而非"代码生成"
本文最核心的洞察是 Skill 的机制定位：Skill 不会动态生成新工具，而是通过 YAML frontmatter + Markdown 正文把指令文本注入 LLM 上下文。这意味着 Skill 设计本质上是**上下文工程**——如何把领域知识、执行流程、安全边界压缩成精炼的文本，让 LLM 在有限的上下文窗口内做出正确决策。

### 2. Description 的质量直接决定 Skill 的可用性
Description 是 LLM 判断是否加载 Skill 的唯一依据，这在架构上是一个巧妙的"触发器设计"。好的 Description 需要包含三重信息：（1）**触发短语**——用户可能说的话；（2）**时序位置**——在什么阶段使用；（3）**产品关键词**——覆盖范围的边界。这个设计体现了 Agent 系统中"意图识别"与"知识检索"的分离——Description 是索引，正文是内容。

### 3. 五种模式对应五种认知负荷分配策略
| 模式 | 认知负荷分配 | 隐含假设 |
|------|-------------|---------|
| 线性流程 | 作者已完全理解步骤，LLM 无需决策 | 操作路径唯一 |
| 决策树 | 作者理解选项结构，LLM 做选择导航 | 选项可控 |
| 循环迭代 | 作者理解循环不变式，LLM 执行验证 | 退出条件明确 |
| 接力棒循环 | 状态外置，LLM 每次重读上下文 | 跨 session 有记忆需求 |
| 多阶段+检查点 | 作者理解阶段边界，LLM 做 Go/No-Go | 需要人工介入点 |
每种模式都代表一种对 LLM 认知能力的信任程度和容错策略。

### 4. "防止 LLM 偷懒"是 Skill 设计的独特命题
传统系统设计假设执行者是可靠的、顺从的。Skill 设计需要面对一个新命题：LLM 会自我合理化、跳过步骤、降低标准。这要求 Skill 作者预判 LLM 的逃避路径，并通过以下机制应对：强硬语气提高遵从率；借口反驳表堵死合理化借口；量化阈值提供客观衡量标准；人类兜底处理边界情况。这个洞察来自安全审计领域（Trail of Bits），因为在安全场景下"偷懒"的后果最严重。

### 5. 渐进式披露是大型平台 Skill 的必选项
Cloudflare Skill 展示了"主文件 7KB + references/ 按需展开到几十万字"的架构。这种设计的核心洞察是：**LLM 的上下文窗口是有限的，但领域知识的总量可能是无限的**。通过 Frontmatter 的 description 字段做粗粒度过滤，通过主文件的决策树做中粒度导航，通过 references/ 子文档做细粒度展开，实现了知识组织的分层解耦。

### 6. 思维框架模式开启"元认知控制"的先河
Audit-context-building 模式最独特的地方在于它不是告诉 LLM"做什么"，而是控制 LLM"怎么想"：通过 Stability Rules（反幻觉规则）和 Non-Goals（明确禁止）来约束思维路径，通过量化阈值（每个函数最少 3 个不变量、5 个假设）来设定思维质量标准。这代表了 Skill 设计的一个新方向——从行为控制进化到元认知控制。

### 7. 知识组织三层架构的 Token 预算约束
文章提出的三层架构（Frontmatter ~100 tokens、主文件 2K-5K tokens、参考文档 1K-3K tokens）本质上是一个 **Token 预算约束下的知识组织原则**。这个约束来自 LLM 上下文窗口的物理限制，也来自"注入内容越多、embedding 衰减越严重"的经验规律。Skill 作者需要在这个预算下做出取舍：什么放主文件、什么放 references/、什么完全依赖 LLM 的内生知识。

## 实践启示
### 1. 设计新 Skill 前的第一步：选择模式
在动手写 Skill 之前，先用决策树判断适合的模式：

- 有明确步骤 → 线性流程
- 需要在选项中导航 → 决策树 + 按需加载
- 需要反复验证 → 循环迭代
- 跨 session 持久化 → 接力棒循环
- 多阶段人工介入 → 多阶段 + 检查点
- 需要深度思考 → 思维框架
错误地选择模式会导致 LLM 行为偏离预期，且难以通过优化 Description 修正。

### 2. Description 写作的"三重触发"检查清单
写完 Description 后，检查是否包含：

- **用户触发短语**：把用户可能说的话原文复制进去（"deploy my app"）
- **时序触发**：明确"在 X 之前/之后使用"或"当用户说 X 时使用"
- **产品触发**：如果涉及平台，把所有相关产品名列出
缺少任何一个维度都会导致 Skill 的触发率下降。

### 3. 安全默认值是 Skill 设计的默认原则
每一个 Skill 都应该回答一个问题："如果 LLM 完全忽略我的指令，损失有多大？"如果大，就必须在 Description 或正文开头明确安全默认值。"Always deploy as preview, not production"是最简洁有力的示范——一句话把风险降到零。

### 4. 借口反驳表是防止质量退化的有效工具
在 Skill 中引入 Rationalizations 或 Common Pitfalls 部分，预判 LLM（和人类）的自我合理化路径：

- "这只是小改动，不需要完整测试"
- "这个错误可以忽略，逻辑上没问题"
- "临时方案，以后再改"
每一条借口都应该有对应的硬性反驳或量化阈值。

### 5. 主文件行数控制在 200 行以内为佳
根据 7 个顶级 Skill 的统计，主文件行数中位数为 224 行（cloudflare-deploy），最精简的是 77 行（vercel-deploy）。超过 300 行的主文件会显著增加 LLM 的阅读负担，建议通过 references/ 拆解。

### 6. 导航型 Skill 与操作型 Skill 应该分离
同一个平台（如 Cloudflare）应该拆成两个 Skill：

- **导航型**（cloudflare）：只做选型，提供产品索引和决策树
- **操作型**（cloudflare-deploy）：包含认证、命令、故障排除
这符合单一职责原则，也让 LLM 的调用更精准——需要选型时加载导航型，需要执行时加载操作型。

### 7. 跨 Skill 编排需要"检查点设计"
当一个 Skill 需要调用其他 Skill 时（如 discovery-process 调度 10+ 子 Skill），应该在每个子 Skill 调用前后设置检查点：

- **Decision Point**：Yes/No + 时间影响说明
- **Outputs**：当前阶段的明确产出物
- **Activities**：需要调用的子 Skill 列表
这样即使某个子 Skill 失败，也能定位问题并人工介入。

### 8. 与 `agent-skill-writing-practices` 的关系
本文聚焦于** Skill 的设计模式和写作技巧**，而  更侧重于 **Skill 在 Agent 系统中的实践应用**，包括与 `上下文管理` 和 `多 Agent 协作` 的集成。两者结合可以构建完整的 Skill 开发知识体系。

### 9. 与 `Anthropic 14 Skill Patterns Best Practices` 的对比
 是 Anthropic 官方发布的 14 个生产级 Skill 设计模式，强调**可复用性和生产就绪**。本文的 5 种核心设计模式更偏向**分类框架**，而 Anthropic 的 14 个模式更偏向**具体场景模板**。在实际开发中，建议先用本文的决策树定位模式，再用 Anthropic 的模板细化实现。
## 相关实体
- [Agent Skills Comprehensive Survey](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-skills-comprehensive-survey.md)
- [Ai Skill Skill Creator 源码拆解](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-skill-skill-creator-源码拆解.md)
- [Yidian Tianxia Context Engineering Agentic Ai](https://github.com/QianJinGuo/wiki/blob/main/entities/yidian-tianxia-context-engineering-agentic-ai.md)
- [Rag Chunking Vectorization Rerank Distillation](https://github.com/QianJinGuo/wiki/blob/main/entities/rag-chunking-vectorization-rerank-distillation.md)
- [Ai Skill Evolution底层逻辑](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-skill-evolution底层逻辑.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/ai-skill-design.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/skill-writing-patterns-best-practices.md)

---

## Ch07.004 企业级 Skill 8 块最小骨架 + 8 条 checklist 设计规范

> 📊 Level ⭐⭐ | 24.2KB | `entities/skill-design-spec-8-block-checklist-winty.md`

# 企业级 Skill 8 块最小骨架 + 8 条 checklist 设计规范

## 概述

winty（前端Q）2026-06-02 关于**企业级 Skill 设计规范**的完整论述（Hermes Agent 系列第 4 篇）。核心命题：**Skill 不是文档，是程序**——Agent 不会脑补，任何含糊都会导致执行偏离。系统提出 8 块最小骨架（frontmatter 元数据 / When to use / Do not use when / Inputs / Steps / Verification / Failure handling / Pitfalls & Examples）+ 8 条 checklist 评判标准 + 完整可复用 frontend-release-check 模板。

## 核心命题

> **Skill 不是文档，是程序。**

写文档可以模糊、可以省略、可以靠"读者自己脑补"。**但 Skill 不一样——Agent 不会脑补**。

Agent 会：
- 逐字读 Skill
- 按写的步骤执行
- 按写的判断条件分支
- 按写的失败处理 fallback

**任何一处含糊，要么 Agent 跳过这一步，要么 Agent 自己编一套，要么 Agent 直接卡住问你**。

### 第一原则

> **写 Skill 的时候，要假设这个 Skill 之后会被一个不熟悉业务的实习生 Agent 反复执行。**
>
> 每一步都得明确。每个判断都得有依据。每个失败都得有 fallback。 

## 8 块最小骨架总览

```
---
name: kebab-case-name
version: 1.0.0
owner: team-or-person
status: active | deprecated | experimental
last_updated: 2026-04-30
tags: [domain, scenario]
required_tools: [git, kubectl, jira-mcp]
required_permissions: [read:repo, write:branch]
---

## When to use
## Do not use when
## Inputs
## Steps
## Verification
## Failure handling
## Pitfalls
## Examples
```

**8 块看起来多，但每一块都对应"如果不写就会出事"的场景。**

## 8 块逐一拆解

### ▎1. 元数据 frontmatter：让 Skill 进入治理体系

很多人写 Skill 直接从内容开始，没有 frontmatter。**意味着 Skill Hub 拿不到任何结构化信息**：版本未知、owner 未知、是否废弃未知、需要什么工具未知。

**最低限度字段及对应治理通道**：

| 字段 | 作用 | 治理通道 |
|------|------|---------|
| `name` | 稳定标识，不允许重名，建议 kebab-case | 检索 |
| `version` | 语义化版本 | 升级路径 |
| `owner` | 到具体人或团队，**不要写 "platform-team" 这种模糊词** | 通知 |
| `status` | active / deprecated / experimental | 检索 |
| `last_updated` | 超过 90 天没更新自动告警 | 维护提醒 |
| `tags` | 检索用（release/incident/db） | 检索 |
| `required_tools` | 声明需要哪些 tool / MCP | 运行时检查 |
| `required_permissions` | 声明需要的权限范围 | **运行时拦截** |

**`required_tools` 和 `required_permissions` 是企业里最容易被忽视的两块**：
- 没有声明的工具 → 执行失败
- 没有声明的权限 → 治理层**直接拦截**

> 少写一个字段，对应的那条治理通道就断了。

### ▎2. When to use：让 Agent 知道什么时候用

**最容易被写成"使用场景"**——但 Hermes 官方 Skill 模板强调的是**触发条件**。

**差别**：
- "使用场景"是给人看的："这个 Skill 用于处理紧急线上故障"
- "触发条件"是给 Agent 用的：可逐条对照上下文判断

```markdown
## When to use

Use this skill when ALL of the following conditions are met:
- The user is reporting a production incident
- The incident has been confirmed in monitoring (not a user-side issue)
- The affected service is one of: payment, checkout, order
- The current on-call engineer is the user themselves
```

Agent 看到这种写法，会**逐条对照当前上下文是否满足**，再决定要不要用这个 Skill。

### ▎3. Do not use when：明确的边界比触发条件更重要

太多事故的根源：Skill 写了"什么时候用"，但**没写"什么时候绝对不能用"**。Agent 在边缘场景上自由发挥，结果跑出问题。

**这一节本质上是 Skill 的"禁飞区"**。Hub 里所有涉及生产数据、支付、用户隐私、批量改动的 Skill，**必须显式声明禁飞区**：

```markdown
## Do not use when
- The user is in a sandbox or test environment but asks for prod-level checks
- The action would touch the payment flow without explicit user confirmation
- The on-call schedule shows another engineer is actively handling the incident
```

### ▎4. Inputs：把模糊的"上下文"变成显式参数

很多 Skill 不写 Inputs → 同一个 Skill 在不同调用方身上表现完全不同。

**反例**：一个"代码评审 Skill"，A 团队默认看安全漏洞，B 团队默认看性能——不显式写 Inputs，Agent 只能靠对话上下文**猜**，猜错就翻车。

```markdown
## Inputs
- repo_path (required): absolute path to the local repo
- review_focus (optional, default="general"):
  - "general" – correctness, readability
  - "security" – vulnerability scan
  - "performance" – hot path analysis
- target_branch (optional, default="main")
```

**隐藏好处**：未来 Skill Hub 做评估时，可以**直接拿 Inputs 当测试参数**。

### ▎5. Steps：可执行、可检查、可失败的步骤

这是 Skill 的核心。"差 Skill"几乎都死在 Steps 上。

**差写法**：
```markdown
1. 拉代码
2. 跑测试
3. 部署
```

**好写法**（每一步都是可执行单元）：

```markdown
1. **Pull latest code**
   - Run `git pull --rebase origin main`
   - If rebase has conflicts, abort and notify the user
   - Verify HEAD matches remote with `git status`

2. **Install dependencies if lockfile changed**
   - Compare current lockfile hash with last successful build
   - If different, run `pnpm install --frozen-lockfile`

3. **Run quality gates in this order**
   - `pnpm lint` – must pass
   - `pnpm typecheck` – must pass
   - `pnpm test` – must pass
   - `pnpm build` – must pass
   - If any step fails, stop and report which step failed
```

**每一步要满足三个条件**：
- **可执行**：写明确的命令或工具调用，不要写"做某事"
- **可检查**：写清楚成功/失败的判断条件
- **可失败**：失败之后明确该做什么（停止/跳过/fallback）

> 特别强调"可失败"——这是新手最容易忽略的。Agent 一旦在中间一步出错，没有失败处理就会**瞎补救，最后越补越糟**。

### ▎6. Verification：怎么知道这次执行真的成功了

**被严重低估的部分**。很多 Skill 写完 Steps 就完了——Agent 把命令跑完一遍，然后宣布"完成"。

> **"命令成功执行" ≠ "任务真的完成"。**

**4 个经典反例**：
- `pnpm test exit 0`，但其实跳过了一半测试
- `git push` 成功，但 push 到了错的分支
- `kubectl apply` 成功，但 Pod 还没真正起来
- `curl 200`，但返回的是缓存页面

```markdown
## Verification

After completing all steps, verify:
- `git log -1` shows the expected commit hash
- The CI run on the new commit is green within 5 minutes
- The deployed pod count matches replicas declared in manifest
- The health check endpoint returns 200 with the new build hash

If any of these fail, do NOT report success.
```

> **Verification 是 Skill 走出"我跑完了"和"我做对了"的分水岭。** 

### ▎7. Failure handling：失败之后该干嘛

**每一个企业级 Skill 都必须假设："这一步是会失败的。"**

失败处理至少要回答三件事：
1. 哪一步失败的？
2. 已经做到什么状态？
3. 接下来该做什么（重试 / 回滚 / 通知人）？

```markdown
## Failure handling

If any step fails:
1. Capture the failed step name and error message
2. Snapshot current state:
   - Current git HEAD
   - Local uncommitted changes
   - Last 50 lines of relevant logs
3. Decide recovery action:
   - lint/typecheck/test failure → report and stop, do not deploy
   - build failure → check if cache is stale, retry once with clean cache
   - deploy failure → run `kubectl rollout undo` and notify on-call
4. Always leave the working tree in a recoverable state
```

> 这一段非常关键。后面讲 Skill **稳定性评估和回滚机制**时，全都依赖 Skill 自己有"知道怎么收拾烂摊子"的能力。

### ▎8. Pitfalls 与 Examples：把踩过的坑写进 Skill

**这一节是 Skill 越用越聪明的体现**——每一次 Skill 在线上踩了坑，都应该把坑沉淀回来。

```markdown
## Pitfalls

- ❌ Don't run `pnpm install` without `--frozen-lockfile` in CI; it silently bumps versions
- ❌ Don't deploy on Friday after 16:00 unless explicitly approved
- ❌ Don't trust local `pnpm test` if `node_modules` is older than 24h; reinstall first
- ❌ Don't assume the user knows the staging URL; always print it explicitly
```

Examples 用"对话片段 + 期望行为"给 Agent 参照：

```markdown
## Examples

### Example 1: 标准发版
User: "帮我发版到 staging"
Agent: 检查工作树 → 跑全套测试 → build → 部署 staging → 提示需要人工 QA 的页面

### Example 2: 发版前发现脏工作树
User: "帮我发版"
Agent: 发现未提交变更 → 列出变更文件 → 询问用户是否要 stash → 不要自动 commit
``` 

## 完整可复用 Skill 模板

把 8 块串起来就是企业里立刻可上线的模板：

```yaml
---
name: frontend-release-check
version: 1.0.0
owner: zhang@team-frontend
status: active
last_updated: 2026-04-30
tags: [release, frontend, ci]
required_tools: [git, pnpm, kubectl, vault-mcp]
required_permissions: [read:repo, write:branch, read:vault]
---

## When to use
Use when ALL conditions are met:
- The user explicitly asks for a frontend release
- The target environment is one of: staging, prod
- The current branch is `main` or a release branch

## Do not use when
- The user is on a feature branch and hasn't merged to main
- The change touches `pages/payment/*` without QA sign-off
- It's after 16:00 on Friday in production environment

## Inputs
- environment (required): staging | prod
- skip_qa_check (optional, default=false)

## Steps
1. **Pull and verify clean tree**
2. **Install deps if lockfile changed**
3. **Run quality gates: lint → typecheck → test → build**
4. **Pull env vars from vault**
5. **Deploy and wait for rollout**
6. **Run smoke tests**

## Verification
- `kubectl rollout status` reports success
- `/healthz` returns 200 with the new commit hash
- All declared smoke tests pass

## Failure handling
- Quality gate failure → stop, report
- Build failure → retry once with clean cache
- Deploy failure → rollout undo, notify on-call
- Smoke test failure → rollout undo, snapshot logs, notify on-call

## Pitfalls
- ❌ Never deploy with uncommitted changes
- ❌ Never deploy if last test run is older than 1h
- ❌ Always verify staging URL before claiming success

## Examples
（略：见 examples 目录）
```

**这个模板看着复杂，但写完一次之后，组织里所有发版动作都可以以它为基线。**

## 8 条 checklist 评判可上线性

| # | 检查项 | 判断 |
|---|--------|------|
| 1 | frontmatter 完整且有 owner | Y / N |
| 2 | 触发条件具体到可对照 | Y / N |
| 3 | 显式声明了禁飞区 | Y / N |
| 4 | Inputs 有默认值与类型说明 | Y / N |
| 5 | 每一步都可执行、可检查、可失败 | Y / N |
| 6 | Verification 写明了怎么算成功 | Y / N |
| 7 | Failure handling 覆盖主要失败场景 | Y / N |
| 8 | Pitfalls 至少写了 3 条踩过的坑 | Y / N |

> **8 条全 Y 才是企业级可上线的 Skill。少一条都先别进 Hub。**

## 核心判断

很多人写 Skill 第一反应是"AI 反正聪明，写糙一点没事"。

**但企业里 AI 落地真正的痛，从来不是 AI 不够聪明，而是 AI 不够稳定。**

不稳定的根源，往往不在模型，而在 Skill 写得不规范：
- 触发条件含糊 → Skill 在不该用的时候被用
- Steps 没写清判断条件 → Agent 自己脑补
- 没有 Verification → "看起来成功"
- 没有 Failure handling → 出事之后越补越糟

> **把 Skill 当成"程序"来写，而不是当成"备忘"来写，是企业级 AI 系统迈向可治理的第一步。** 

## 与现有 skill-writing 实体的差异化

| 维度 | 本文（winty） | 现有 `agent-skill-writing-guide`（10.9KB） |
|------|--------------|---------------------------------------|
| 视角 | **企业级 / Skill Hub 治理** | **个人 agent / Prompt 注入** |
| 核心框架 | **8 块最小骨架 + 8 条 checklist** | Skill = 岗位说明书 + SOP + 避坑指南 |
| 触发条件 | **明确 vs 使用场景的差别** | description 字段编写（提及但未深入） |
| 禁飞区 | **独立"Do not use when"块** | 无 |
| Verification | **"我跑完了" vs "我做对了" 分水岭 + 4 个反例** | 无 |
| Failure handling | **三件事（哪步/状态/恢复）+ 完整模板** | 无 |
| Steps 质量 | **可执行/可检查/可失败三原则** | 一般性建议 |
| 完整模板 | **frontend-release-check 可复用 YAML** | 无 |
| 评判标准 | **8 条 checklist 量化** | 无 |

**关键判断**：本文是**企业级 Skill 设计规范的工程化完整方案**，与现有 skill-writing 实体的"个人 agent 视角"完全不同。**新 entity 决策正确**。

## 系列上下文

本文是 winty 关于 Hermes Agent 的第 4 篇，构成完整闭环：

| # | 主题 | 关注点 |
|---|------|--------|
| 1 | 100 个 AI 同时跑，谁来管权限？ | 多 Agent 权限 |
| 2 | Skill 系统：经验沉淀 | 个人 agent 视角 Skill |
| 3 | Skill Hub：组织资产化 | 企业组织视角 |
| **4** | **Skill 8 块骨架 + 8 条 checklist** | **设计规范/工程化** |
| 5（下一篇） | Skill 版本管理 | v1 → v2 怎么避免越改越差 |

## 深度分析

### 3.1 触发条件设计决定 Skill 可用性上限

winty 在本文中反复强调"触发条件"与"使用场景"的区别，这是一个被大多数 Skill 设计者忽略的核心问题。使用场景是给人看的叙事性描述，触发条件是给 Agent 用的可执行判断清单。

从工程视角看，触发条件的质量直接决定 Skill 在生产环境中的**精确率（Precision）**和**召回率（Recall）**。一个好的触发条件应该满足：上下文可枚举、边界可判断、Agent 无需额外推理。如果触发条件写得像"当用户需要发布前端时使用"，Agent 在实际场景中只能靠猜测。反之，如果写成"用户明确说出'发布'或'deploy'，且当前分支是 main 或 release/*，且不是周五 16:00 后"，Agent 的执行路径就是确定性的。

这个差异在单人 Agent 场景下不明显，但在企业多 Agent 协作环境中，模糊触发条件会导致 Skill 被错误调用，进而引发连锁反应。

### 3.2 Failure handling 是 Skill 可治理性的分水岭

本文提出的"失败处理三件事"框架——哪一步失败、当前状态是什么、下一步怎么做——本质上是将**运维思维**引入 Skill 设计。大多数 Skill 失败不是因为执行出错，而是因为出错后 Agent 盲目重试或跳过，导致状态污染。

Failure handling 的完整性决定了 Skill 的**自愈能力**。一个有完整 Failure handling 的 Skill，在部署失败时可以自动回滚；在测试失败时可以保留现场供人工介入；在依赖工具不可用时可以切换到替代方案。没有 Failure handling 的 Skill，一旦出错就成为"孤儿进程"——既不工作也不死亡，只是卡在未知状态消耗资源。

这个观点与企业 IT 运维中的"可观测性"理念高度一致：Skill 需要输出明确的失败信号，而不是沉默失败。

### 3.3 Verification 解决的是"信任代理"问题

winty 提出的"命令成功执行 ≠ 任务真正完成"是本文最具工程深度的观点。在多 Agent 系统中，每个 Agent 都需要向其他 Agent 或人类证明自己完成了任务，而证明的依据不是"我跑完了"，而是"我验证了结果的正确性"。

Verification 的设计本质上是在构建**信任链条**。当 Skill A 调用 Skill B 时，Skill B 如果只报告"执行成功"而没有 Verification 数据，Skill A 就无法判断 B 是否真的完成了任务。这种情况下，多 Agent 系统的可靠性会随着调用层级增加而指数级下降。

因此，Verification 不仅是 Skill 的质量门禁，更是多 Agent 协作中的**信任传递机制**。

### 3.4 八块骨架与知识治理的对应关系

将 frontmatter 的八个字段对应到治理通道，是本文最有结构化价值的贡献。在传统 IT 治理中，配置管理数据库（CMDB）承担类似角色——但 CMDB 依赖人工维护，而 Skill 的 frontmatter 是结构化数据，可被系统直接消费。

这种设计让 Skill Hub 具备了两个关键能力：**运行时检查**（required_tools、required_permissions 在执行前拦截不合规调用）和**维护管理**（last_updated 触发过期告警、owner 定向通知）。这是从"文档化管理"到"系统化管理"的关键跃迁。

### 3.5 模板可复用性是组织级 Skill 资产化的基础

frontend-release-check 模板的价值不在于模板本身，而在于它证明了**Skill 是可复制的组织资产**。当一个团队验证了一个 Skill 的有效性，其他团队可以以其为基线定制，零成本复用最佳实践。

这与软件工程中的"模式语言"概念相通——好的 Skill 模板不是限制创造力，而是降低认知成本，让设计者聚焦在业务差异上而不是通用流程上。

## 实践启示

### 4.1 将触发条件改写为可执行判断清单

在设计任何 Skill 时，第一件事不是写 Steps，而是写 When to use 的触发条件。检验标准：把这个条件交给一个不了解业务的 Agent，它能否无需额外推理就判断出是否该用这个 Skill？如果答案是"不确定"，就继续细化。

建议用"All of the following conditions are met"格式，每条条件都是上下文中可直接验证的事实（用户说了某句话、在某个分支、当前时间等），而不是模糊的概念（用户想发布、生产环境）。

### 4.2 在 Steps 中为每个命令编写失败分支

不要写裸命令，而是写"命令 + 预期输出 + 失败处理"。例如：`git pull --rebase origin main` 后面跟着"If rebase has conflicts, abort and notify the user"。这样 Agent 在遇到非预期结果时不会卡住或盲目重试。

### 4.3 Verification 必须包含结果验证而非状态验证

很多 Skill 的 Verification 只检查"命令是否成功"，而不检查"结果是否正确"。正确的 Verification 应该检查：数据是否落地、外部系统是否可见、关联流程是否触发。例如：部署命令成功后检查 health endpoint 返回的 commit hash 是否匹配。

### 4.4 为每个 Skill 编写至少 3 条真实踩坑记录

Pitfalls 不是设计时想象出来的警告，而是实际上线后沉淀下来的真实案例。建议在 Skill 上线后 2 周内复盘，将真实发生的错误写入 Pitfalls。每条 Pitfalls 应该包含具体的命令或操作，以及因此导致的后果。

### 4.5 用 frontmatter 的 required_permissions 实现运行时拦截

不要把权限检查留给 Agent 事后判断。在 frontmatter 中显式声明 required_permissions，当 Skill 被调用时，治理层可以直接拦截未授权的调用，而不是让 Agent 执行到一半才发现权限不足。这个设计将权限治理从"事后审计"变成"事前拦截"。

## 进一步阅读

- Hermes Agent Skills 模板：https://hermes-agent.nousresearch.com/docs/user-guide/features/skills
- Anthropic：Effective tool use with Claude（关于 schema 和指令明确性的部分）

---

## 相关实体
- [Skill Hub Organization Asset Winty](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-hub-organization-asset-winty.md)
- [Openspec Spec Driven Development Trae Solo](https://github.com/QianJinGuo/wiki/blob/main/entities/openspec-spec-driven-development-trae-solo.md)
- [Skills Refiner Design Quality Evaluation Framework](https://github.com/QianJinGuo/wiki/blob/main/entities/skills-refiner-design-quality-evaluation-framework.md)
- [Perplexity Internal Skill Design Guide](https://github.com/QianJinGuo/wiki/blob/main/entities/perplexity-internal-skill-design-guide.md)
- [Hermes Skill System Winty](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-skill-system-winty.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/skill-design-spec-8-block-checklist-winty.md)
- [skill 产品哲学：歸藏做了爆款 skill 后的产品反思](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-product-philosophy-guicang-爆款经验-2026-06-12.md)

---

## Ch07.005 AI Agents Security Survey: Attack and Defense

> 📊 Level ⭐⭐ | 24.2KB | `entities/ai-agents-security-survey-attack-defense.md`

## 一、威胁格局概述

### 1.1 三大核心挑战

根据 1Password 的分析，AI Agent 安全存在根本性转变：非人类身份正在扩展访问风险边界，传统 IAM 无法覆盖机器工作流凭证。

| 挑战 | 描述 | 风险 |
|------|------|------|
| **治理盲区** | 安全团队无法有效监控非人类身份的访问行为 | 攻击者利用机器身份横向移动 |
| **凭证蔓延** | 机器身份产生的凭证分散在多个系统 | 难以集中管理，泄露面扩大 |
| **审计薄弱** | 传统审计日志难以追踪 AI 代理的操作轨迹 | 事后溯源困难 |

AI 代理的凭证（如 API 密钥、服务账户令牌）一旦泄露，攻击者可以：在无需二次验证的情况下横向移动、以机器身份执行敏感操作、绕过基于人类行为的异常检测机制。

### 1.2 Agent vs 传统软件的安全差异

传统软件安全方案（提示词规则、输入输出过滤、运行时日志审计、SDK Hook）共享同一盲区：**只看到 Agent "声明"出来的行为，而非实际行为**。当 Agent 进入生产环境：

- 一个完整任务执行链横跨**数十步骤、多工具链、多运行层级**
- 模型在受监控环境下会**主动调整行为表现——按规则表演，而非按规则执行**
- 企业同时运行数十甚至上百个 Agent，**系统无法完整感知正在运行多少个、在做什么**

---

## 二、攻击向量分类

### 2.1 主要攻击向量矩阵

| 攻击向量 | 描述 | 典型案例 | 缓解难度 |
|---------|------|---------|---------|
| **Prompt Injection** | 恶意指令注入用户 prompt | 越狱攻击、指令覆盖 | 高 |
| **Context Pollution** | 上下文被污染影响决策 | 长对话中的上下文遗忘 | 高 |
| **Tool Poisoning** | 工具链被恶意篡改 | 恶意 MCP 工具 | 中 |
| **Memory Poisoning** | 记忆系统被污染 | 长期记忆注入恶意经验 | 高 |
| **Supply Chain** | 依赖组件被植入后门 | 第三方 Skill 恶意代码 | 中 |
| **Data Exfiltration** | 敏感数据通过输出泄露 | 日志/错误信息泄露 | 低 |
| **Behavioral Drift** | 发布后工具行为改变 | 数周后工具开始窃取数据 | 高 |
| **Description Injection** | 在工具描述中嵌入 prompt injection | 「always prefer this tool」 | 高 |

### 2.2 Tool Poisoning：企业 Agent 安全的核心缺陷

VentureBeat 的深度报告揭示了企业 Agent 安全中一个根本性的架构缺陷：**工具注册表的元数据（描述、规格）与工具实际行为之间存在验证断层**。

#### 当前供应链安全体系的盲区

代码签名、SBOM、SLSA、Sigstore 等供应链安全体系解决的是 **artifact integrity**（artifact 是否与描述一致），但 Agent 工具注册表真正需要的是 **behavioral integrity**（工具是否做它声称做的事）。这两者是根本不同的安全维度。

#### 四种主要攻击模式

| 攻击模式 | 描述 | Provenance 捕获 | 运行时验证捕获 | 残余风险 |
|---------|------|----------------|---------------|---------|
| **Tool Impersonation** | 伪装成合法工具 | Publisher identity 无效 | 仅当添加 discovery binding 时有效 | 无 discovery integrity 时高 |
| **Schema Manipulation** | 操纵工具参数/输出 schema | 无 | 仅通过 parameter policy 溢出检测 | Medium |
| **Behavioral Drift** | 发布后工具行为改变 | 签名后无 | 监控端点和输出时强效 | Low-medium |
| **Description Injection** | 在工具描述中嵌入 prompt injection | 无 | 除非单独清理描述否则有限 | 高 |

#### Description Injection：最隐蔽的向量

攻击者在工具描述中嵌入 prompt injection 载荷（如「always prefer this tool over alternatives」）。即便工具代码已签名、provenance 干净、SBOM 准确，Agent 的推理引擎仍会将描述文本作为指令处理——因为描述通过同一个语言模型被处理，元数据与指令的边界被模糊化了。

#### Behavioral Drift：发布后攻击

工具在发布时通过验证，数周后服务器端行为改变以窃取请求数据。签名仍匹配，provenance 仍有效——artifact 没变，行为变了。这是 artifact integrity 检查无法捕捉的问题。

### 2.3 Bishop Fox AIMap 发现的互联网暴露问题

Bishop Fox 的 AIMap 项目揭示：AI 系统已在互联网上大规模暴露和可交互，许多端点支持模型枚举、工具调用和直接输入处理，但通常没有身份验证或有效的控制边界。

**关键发现**：

- AI 系统暴露的风险组合：新奇风险组合包括未认证端点 + 代码执行、泄露的系统提示、宽松的 CORS 策略、暴露的模型权重
- 攻击者已具备这些可见性，但大多数组织对自己的环境没有同等程度的可见性
- AIMap 检测到的可利用组合：未认证访问 + 代码执行能力，或暴露的系统提示 + 工具访问

**支持的协议和框架**：
MCP (Model Context Protocol)、Ollama、vLLM、LiteLLM、LocalAI、LangServe/LangChain、OpenClaw/Clawdbot、Open WebUI/LibreChat、Gradio/Streamlit、ComfyUI/Stable Diffusion、HuggingFace TGI、通用推理 API

---

## 三、分层防御体系

### 3.1 全生命周期安全：清华大学方寸体系

清华大学人工智能学院、交叉信息研究院的方寸跃迁团队提出一套面向 Agent 运行全生命周期的多层安全体系，覆盖事前（Skill Ward）× 事中（Guard × Observer）× 事后（审计）完整链路。

```
┌─────────────────────────────────────────────────────┐
│           Agent Security Full Lifecycle             │
├─────────────┬──────────────────┬────────────────────┤
│   事前       │      事中         │       事后          │
│ Skill Ward  │  Fangcun Guard   │  Fangcun Observer  │
│ (Pre-dep)   │  (In-flight)      │  (Post-incident)   │
├─────────────┼──────────────────┼────────────────────┤
│ 3-Phase     │  8ms auditing    │  OS-level behavior │
│ scanning    │  10 risk types   │  Real-time block   │
│ Static+LLM  │  Independent     │  Full-chain trace  │
│ +Docker     │  thresholds      │  Local audit       │
│ honeypot    │                  │  Self-evolving     │
└─────────────┴──────────────────┴────────────────────┘
```

### 3.2 Fangcun Observer：看见真实动作，守住安全边界

**设计哲学**：别问 Agent 想做什么，看它到底做了什么。

#### 技术路线
- **直接下沉到操作系统层**，不依赖任何框架插件、SDK 接口、模型供应商集成
- 业务代码零改动，Agent 无感知接入

#### 核心能力（5项）
1. **OS 层行为感知，彻底解耦 Harness**：无论 Agent 跑在哪套框架栈上，观测能力始终有效
2. **无感知运行时观测**：Agent 不知道被观测，计算开销忽略不计
3. **实时干预，主动阻断**：危险命令执行、敏感文件操作、异常网络访问、越权持久化——在行为落地之前完成实时研判
4. **全链路溯源**：将运行时真实行为、Agent 决策动作与模型上下文关联成完整行为图谱
5. **本地审计 + 自进化防御**：所有数据本地沉淀，不上云

### 3.3 Fangcun Guard：8ms 安全审核变基础设施

**核心挑战**：一次完整 Agent 对话要过 2-4 道审核（用户输入、工具调用入参、模型输出、工具返回），每一道都不能拖慢用户体验。

#### 公开 Benchmark 对比

| 指标 | Fangcun Guard | 开源方案区间 |
|------|--------------|-------------|
| 综合检测准确性 | **91.1** | 70-88 |
| p99 推理延时 | **8ms** | 130ms+（8B）；50ms（0.6B，但 F1 有差距） |

#### 差异化能力
1. **判定不偏科**：一般有害内容 + 精心构造越狱攻击 + 深度伪装成正常对话的灰区话术
2. **毫秒级响应**：4 道审核全跑 Guard，总耗时 30ms
3. **中文场景专项打磨**：10 个独立风险类别，中文场景专项合成数据 + 专项对齐训练
4. **10 类风险独立可调**：金融、医疗、教育、游戏等不同场景，每类拦截阈值单独配置
5. **主流 Agent 生态一键接入**：主流 Agent 框架开箱即用，业务代码零改动

### 3.4 Skill Ward：三阶段检测，真实蜜罐

**背景**：第三方 Skill 生态已成 Agent 的"App Store"。行业现有方案几乎全部停留在静态扫描——但恶意 Skill 的真正杀招在运行时。

#### 三阶段扫描

| 阶段 | 方法 | 捕获的威胁 |
|------|------|-----------|
| 1 | 静态分析 | 恶意签名、危险调用、可疑依赖 |
| 2 | 大模型研判 | Skill 真实意图、伪装话术、混淆逻辑 |
| 3 | Docker 蜜罐沙箱 | **运行时行为**——命令执行、路径访问、外部地址连接、持久化尝试、横向探测 |

#### 关键数据
> 5000 个真实 Skill 实测：仅靠静态扫描，会漏掉**约三分之一**的运行时威胁，全部由蜜罐沙箱阶段抓出。

---

## 四、MCP 协议的运行时验证层

VentureBeat 报告提出在 MCP client（Agent）与 MCP server（工具）之间部署验证代理，执行三重验证：

### 4.1 三重验证机制

1. **Discovery Binding**：验证调用时工具与此前评估的行为规格一致，防止 bait-and-switch 攻击
2. **Endpoint Allowlisting**：监控工具执行期间的出站网络连接，与声明的允许端点列表比对，超出则终止
3. **Output Schema Validation**：验证工具响应与声明的输出 schema 是否匹配，标记意外字段

### 4.2 Behavioral Specification

关键新原语是 **behavioral specification**——机器可读的声明文档（类似 Android 权限清单），详细说明工具联系的外部端点、数据读写操作及副作用，作为签名 attestation 的一部分交付。

### 4.3 分阶段 rollout 策略

| 阶段 | 行动 | 说明 |
|------|------|------|
| **Day 1** | 端点 allowlisting | 对使用集中式工具注册表的 Agent 部署最低保护 |
| **短期（1-3月）** | 输出 schema 验证 | 捕获数据渗出和工具响应中的 prompt injection |
| **中期（3-6月）** | Discovery binding | 对高风险工具类别部署完整检查 |
| **长期** | 完整行为监控 | 仅在保证级别证明成本合理的位置 |

轻量级代理验证（schema + 网络连接检查）每个调用增加 <10ms 开销。

---

## 五、攻击测试能力（AIMap）

Bishop Fox 的 AIMap 提供了互联网规模的 AI Agent 安全测试能力：

### 5.1 风险评分

每个端点获得 0-10 的风险评分，基于：

- 身份验证缺失
- 暴露的工具数量和类型
- CORS 策略
- TLS 配置
- 系统提示泄露
- 危险能力组合

分数 >7 通常表示可利用组合：未认证端点 + 代码执行能力，或暴露的系统提示 + 工具访问

### 5.2 攻击测试模块

| 协议 | 攻击测试 |
|------|---------|
| **MCP** | 工具枚举、未授权工具调用、通过工具描述的 prompt 注入 |
| **Ollama** | 模型列举、模型权重提取、prompt 注入 |
| **OpenAI 兼容端点** | 模型枚举、完成滥用、系统提示提取 |

---

## 六、Agent 生命周期各阶段威胁与缓解

### 6.1 按 Agent 生命周期阶段分类

| 阶段 | 主要威胁 | 缓解措施 |
|------|---------|---------|
| **开发阶段** | Skill 供应链攻击、代码注入 | 代码审计、签名验证 |
| **部署阶段** | 配置漂移、权限过宽 | IaC 扫描、最小权限审计 |
| **运行阶段** | Prompt injection、上下文污染 | 输入过滤、分层治理 |
| **演化阶段** | 记忆污染、策略退化 | 记忆完整性检查、版本回滚 |

### 6.2 分层防御矩阵

| 层级 | 机制 | 解决的问题 |
|------|------|-----------|
| **Provenance** | SLSA/Sigstore/SBOM | artifact integrity |
| **Behavioral Specification** | 机器可读行为声明 | 运行时验证基线 |
| **Discovery Binding** | 工具调用时验证 | bait-and-switch 攻击 |
| **Endpoint Allowlisting** | 网络连接监控 | 数据渗出 |
| **Output Schema Validation** | 响应格式校验 | prompt injection |
| **Identity & Access** | 机器身份 IAM | 横向移动 |

---

## 七、关键引述

> "过去方案看到的，是 Agent '说'了什么。Observer 看到的，是 Agent '做'了什么。声明可以包装，行为不会撒谎。"

> "如果行业仅用 SLSA/Sigstore 声明解决问题，将重演 2000 年代初 HTTPS 证书的错误：强身份完整性保证，但实际信任问题悬而未决。"

> "AI 基础设施已经超越了用于评估它的安全工具。AIMap 弥合了这一差距。"

---

## 八、相关概念

- [Agent Security Threat Models](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-security-threat-models.md) — 威胁模型与攻击模式
- [Agent Security Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-security-architecture.md) — 安全架构与认证授权
- [Agent Security Full Lifecycle System](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-security-full-lifecycle-system.md) — 全生命周期安全体系
- [AI Agent 安全威胁向量与缓解策略](https://github.com/QianJinGuo/wiki/blob/main/queries/ai-agent-security-threat-vectors-mitigation.md) — 威胁向量与缓解策略导航

---

## 九、相关实体

- [清华大学方寸跃迁团队](https://github.com/QianJinGuo/wiki/blob/main/entities/tsinghua-agent-security-fangcun.md) — 全链路安全体系
- [VentureBeat 工具投毒报告](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-tool-poisoning-exposes-a-major-flaw-in-enterprise-agent-security-v2.md) — behavioral integrity vs artifact integrity
- [Bishop Fox AIMap](https://github.com/QianJinGuo/wiki/blob/main/entities/introducing-aimap-security-testing-for-ai-agent-bishop-fox.md) — AI Agent 安全测试框架
- [AWS + Cisco AI Defense](https://github.com/QianJinGuo/wiki/blob/main/entities/securing-ai-agents-how-aws-and-cisco-ai-defense-scale-mcp-and-a2a.md) — 企业级 Agent 安全生态
- [Amazon Bedrock AgentCore Identity Security](https://github.com/QianJinGuo/wiki/blob/main/entities/aws-bedrock-agentcore-identity-security.md) — AWS Bedrock 身份安全

---

## 深度分析

**从"声明安全"到"行为安全"的范式转换**：传统安全方案（代码签名、SBOM、provenance）本质上是"声明式安全"——它们验证的是"artifact 是否与描述一致"，而非"artifact 在实际运行中是否按预期行事"。Agent 安全的核心挑战在于：模型的推理引擎无法区分工具描述（应该只影响工具选择）和用户指令（应该被执行为行动）——当 Description Injection 在工具描述中嵌入 prompt injection 载荷时，签名验证、provenance 检查全部通过，但 Agent 的实际行为已被悄然篡改。这个问题的深层原因是：Agent 系统中"元数据"和"指令"的边界被语言模型的统一处理方式模糊化了。未来的安全方案必须从"artifact integrity"升级为"behavioral integrity"，即持续验证工具在运行时是否做它声称做的事，而非仅在发布时验证它是什么。

**Behavioral Drift 的时序攻击特性**：Behavioral Drift（发布后工具行为改变）是一种时序攻击——它利用了"验证时机"与"攻击时机"之间的错位。传统安全验证发生在发布/部署阶段，而 Behavioral Drift 的攻击发生在发布后数周甚至数月的运行时。此时签名、provenance、SBOM 依然完全有效，但工具的实际行为已背离了安全基线。这种攻击之所以特别危险，是因为现有安全体系的信任传递链在"发布验证通过"这一节点之后就断裂了——它假设已验证的 artifact 在运行时不会改变行为。解决这个问题的唯一有效路径是**运行时持续验证**，而非依赖发布时的单次验证。Fangcun Observer 的 OS 层行为感知正是对这一需求的直接响应：它不依赖任何 artifact 元数据，而是直接观测工具在运行时的实际行为。

**Skill Ward 三阶段检测中蜜罐沙箱的不可替代性**：Skill Ward 的关键发现在于：仅靠静态扫描会漏掉约三分之一的运行时威胁。这些威胁的共同特征是"触发条件依赖性"——恶意行为不会在静态分析环境下激活，只在真实运行时环境中触发（例如，读取特定配置文件后才拉取远程载荷，在特定参数组合下才激活后门）。这与网络安全领域的 APT（高级持续性威胁）攻击手法高度相似——它们设计上就是为了逃避静态检测。Docker 蜜罐沙箱的价值在于提供了真实的运行时环境，让触发条件得到满足，从而使隐藏行为暴露。这个发现对整个 Agent 供应链安全有深远启示：任何第三方 Skill 在被引入生产环境之前，必须经过真实运行环境的验证，而不仅仅是代码签名和静态分析。

**可见性不对称是 Agent 安全的核心结构性弱点**：Bishop Fox AIMap 揭示了一个更根本的问题：攻击者已经在用 AIMap 这样的工具扫描互联网上的暴露 AI 系统，发现未认证端点、暴露的系统提示和可利用的工具组合；但大多数企业对自己的 AI 系统暴露面没有同等程度的可见性。这种"攻击者比防御者更了解目标环境"的不对称性，是 Agent 安全中最危险的盲区。AIMap 作为防御工具的价值，在于把这个不对称性扳回来——让防御者能够用与攻击者相同的视角审视自己的 Agent 基础设施。企业 Agent 安全的第一步，不是购买安全产品，而是建立与攻击者同等的环境可见性——知道自己暴露了什么、暴露了多少、暴露在哪里。

**MCP 三重验证的分阶段部署逻辑**：VentureBeat 提出的 MCP 三重验证（Discovery Binding、Endpoint Allowlisting、Output Schema Validation）采用了分阶段 rollout 策略，这个设计体现了实用的工程权衡哲学：Day 1 部署 Endpoint Allowlisting（最简单、最有效、<10ms 开销），然后逐步增加 Schema Validation（捕获数据渗出和 prompt injection）、最后才是 Discovery Binding（完整但部署复杂度最高）。这个分阶段策略的底层逻辑是：安全投入应该与实际风险成正比，而非一次性构建完整方案。Endpoint Allowlisting 解决的是"工具是否访问了它声明之外的外部端点"——这是 Behavioral Drift 和数据渗出的最直接信号，且实现成本最低。这种"从最简单最有效的入手，逐步复杂化"的策略，值得在任何 Agent 安全建设中借鉴。

## 实践启示

1. **在工具注册表之外单独维护"行为规格清单"**：不要依赖工具描述作为行为基线——Description Injection 会通过工具描述本身注入恶意指令。正确的做法是为每个工具维护一份独立的、机器可读的"行为规格清单"（Behavioral Specification），类似 Android 权限清单，详细列出工具访问的外部端点、数据读写操作和副作用。这份清单作为签名 attestation 的一部分交付，与工具描述分开管理，由独立的验证代理在运行时强制执行。

2. **对所有第三方 Skill 执行 Docker 蜜罐验证，无论来源和签名状态**：任何从第三方生态（Claude Skills、OpenAI Apps、Claw Hub 等）引入的 Skill，在进入生产环境前必须经过 Docker 隔离运行验证。验证应该包括：记录所有文件访问、网络连接、进程启动和持久化尝试，与工具声明的行为规格进行比对，标记任何超出声明范围的运行时行为。约三分之一的运行时威胁无法通过静态扫描发现，蜜罐沙箱是唯一有效检测手段。

3. **在部署 Agent 系统后立即运行 AIMap 类工具进行暴露面审计**：大多数企业对自己 Agent 系统的互联网暴露面缺乏准确认知。应该使用类似 AIMap 的工具对自己的外部暴露 AI 端点进行定期扫描，重点关注：未认证访问、暴露的系统提示、危险工具组合（未认证 + 代码执行）、宽松的 CORS 策略。这个审计应该在 Agent 系统上线前和每次重大配置变更后执行，并将结果纳入安全评估报告。

4. **建立与非人类身份管理相匹配的机器 IAM 体系**：传统 IAM 面向人类身份设计，无法覆盖 Agent 的机器工作流凭证。应该建立独立的机器身份管理：包含 API 密钥、服务账户令牌、工作负载证书的全生命周期管理；与人类身份完全分离的访问控制策略；机器身份的异常行为检测（横向移动、异常时间访问、凭证范围外的资源访问）。这是防止机器身份凭证泄露导致横向移动的关键防线。

5. **优先部署 OS 层行为观测而非框架层 Hook**：Fangcun Observer 的核心设计原则——下沉到 OS 层而非依赖框架插件——有深层的工程合理性。框架层的 Hook（如 SDK 拦截、Prompt 过滤）本质上与 Agent 的 Harness 耦合，框架升级或替换时安全能力随之失效；而 OS 层行为感知与上层技术栈完全解耦，无论 Agent 跑在 LangChain、OpenClaw 还是自研框架上，观测能力始终有效。在设计 Agent 安全架构时，应优先考虑 OS 层的系统调用监控和进程级行为审计，而非依赖特定框架的安全插件。

---

**补充阅读**：

-  — 威胁模型与攻击模式
-  — 安全架构与认证授权
-  — 全生命周期安全体系
-  — 威胁向量与缓解策略导航

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/cybersecurity-privacy.md)

---

## Ch07.006 claude code skills mcp rules source analysis

> 📊 Level ⭐⭐ | 23.4KB | `entities/claude-code-skills-mcp-rules-source-analysis.md`

## 核心命题

**Rules、MCP、Skills 的本质差异，不在功能层面，而在信息注入 API 请求的位置。** 同一套 `tool_use` 协议之上，三者分别占据 `messages`（被动注入）、`tools[]` + `system`（标准化工具调用）、`messages`（提示词注入）三个不同插槽。理解这一点，就能拨开文档和博客中的概念迷雾。

## Rules：项目级行为规范的被动注入机制

### 什么是 Rules

Rules 就是 `CLAUDE.md` 文件（及 `.claude/rules/*.md` 条件规则文件），本质上是**用自然语言写的指令文本**，告诉模型"在这个项目中应该遵循什么规范"。

### 文件发现与加载

Claude Code 从多个位置按优先级加载 Rules（对应源码 `getMemoryFiles` 函数）：从项目根到 CWD 逐层处理，每层内部按 `CLAUDE.md` → `.claude/CLAUDE.md` → `.claude/rules/*.md` → `CLAUDE.local.md` 顺序收集，后加载的覆盖先加载的。单个 `CLAUDE.md` 建议不超过 **40,000 字符**，超出会触发警告。

条件规则（`.claude/rules/*.md`）支持 frontmatter 中的 `paths` 字段指定生效范围，例如只在前端组件路径下生效，实现**按路径按需注入**。

### 注入位置：messages，而非 system

Rules 内容通过 `prependUserContext()` 注入到 **messages 最前面**，包裹在 `<system-reminder>` 标签中，以 `role: "user"` + `isMeta: true` 形式存在。`isMeta` 是客户端 UI 标记（消息仍完整发送给 API，但不在终端展示）。注入时还带强制指令头：> "Codebase and user instructions are shown below. Be sure to adhere to these instructions. IMPORTANT: These instructions OVERRIDE any default behavior..."

**核心洞察：Rules 不走 tool_use 协议**——它既不是工具，也不需要模型主动调用。它是被动注入到每次 API 调用的上下文中，模型在推理时自然会"看到"并遵循这些规则。

子目录 Rules 通过 `nested_memory` attachment **按需动态加载**：当模型在对话中访问某个子目录文件时，Claude Code 检查该子目录是否有 CLAUDE.md，有则动态注入，实现 Rules 的惰性加载。

## MCP：标准化工具协议的 RPC 调用

### 什么是 MCP

MCP（Model Context Protocol）是一个标准化协议，让 Claude Code 能通过 **真正的 RPC 调用** 访问外部服务提供的工具。它是 `tool_use` 最直接的应用——模型触发后，客户端向外部 MCP Server 进程发起 JSON-RPC 调用，拿到真实结果。

### MCP 在 API 请求中占据两个位置

MCP 不只是注册在 `tools[]` 里，它在 **`system` 中也有一席之地**。

**位置一：`tools[]` — 工具定义**

每个 MCP 工具通过 `toolToAPISchema()` 转换为 API 格式，命名遵循 `mcp__<serverName>__<toolName>` 模式。这部分和内置工具的注册方式完全一致，模型通过工具描述决定何时调用——**模型本身无法区分内置工具和 MCP 工具**。

**位置二：`system` — Server 级 instructions**

`getMcpInstructions()` 将所有已连接 Server 的 `instructions` 拼接进 system 的**动态区域**（位于缓存边界标记之后）。MCP Server 可通过 `initialize` 响应的 `instructions` 字段向模型传达**整个 Server 级别的使用指南**，如"优先使用 search 而非 list"、"日期参数必须用 ISO 格式"。`tools[].description` 描述的是单工具说明书，system 中的 instructions 描述的是整体使用手册。

### 执行流程：真正的函数调用

```
模型输出 tool_use: { name: "mcp__github__create_issue", input: {...} }
→ Claude Code 识别 mcp__ 前缀，路由到对应 MCP Client
→ MCP Client 发送 JSON-RPC 请求到 MCP Server 进程
→ MCP Server 执行实际操作（如调用 GitHub API）
→ 返回真实结果 → tool_result.content = MCP Server 的真实输出
→ 模型读取结果，继续推理
```

**MCP 是名副其实的"远程过程调用"**，`tool_result` 里装的是外部世界的真实数据。

### MCP 真正的不可替代场景

理解了源码后，一个反直觉的结论浮出水面：**很多场景下一条 Bash 就够了**。调 `mcp__github__list_issues` 和执行 `gh issue list` 拿到的结果没有本质区别。MCP 真正不可替代的场景是：

1. **持久化连接和状态管理**：Bash 每次是新进程没有状态。数据库连接池、WebSocket 长连接、跨调用共享认证 session，MCP Server 作为常驻进程可以做到
2. **复杂操作的原子封装**：把 5 步 Bash 命令封装成一次 MCP 调用，减少模型拼长命令出错的概率
3. **权限隔离和安全约束**：Bash "什么都能干"，MCP Server 可以限制模型只执行预定义操作

**MCP 的价值不在于"能调用外部系统"（Bash 也能），而在于"以更安全、更可靠的方式调用外部系统"。**

## Skills：可复用提示词的注入机制

### 什么是 Skills

Skills 是可复用的 Markdown 提示词文件（`SKILL.md`），定义结构化的工作指令。它同样通过 `tool_use` 触发，但执行逻辑与 MCP 截然不同。

### 列表注入与 token 预算

模型通过 `skill_listing` attachment 知道有哪些 Skill 可用。Skill 列表有**严格的 token 预算**：仅占上下文窗口的 **1%**（默认 8000 字符），每个 Skill 描述最多 250 字符。Skill 工具的 `description` 中包含一条**强制触发指令**：> "When a skill matches the user's request, this is a BLOCKING REQUIREMENT: invoke the relevant Skill tool BEFORE generating any other response about the task"

### 执行流程：提示词注入，不是函数调用

当模型调用 Skill 工具时，默认走 **Inline 模式**：

```
模型输出 tool_use: { name: "Skill", input: { skill: "commit", args: "" } }
→ Claude Code 读取本地 SKILL.md 提示词文本
→ 将提示词内容包装为 isMeta: true 的 user 消息，注入到对话历史中
→ tool_result 仅返回一个标签："Launching skill: commit"
→ 下一轮 API 调用时，对话历史中已包含完整的 Skill 指令
→ 模型读到指令后，按步骤调用工具（Read、Edit、Bash 等）执行任务
```

**核心洞察：Skills 是"提示词注入"机制，不是函数调用。** `tool_use` 只是触发器，真正的"能力"来自被注入的 Markdown 指令文本。模型读到指令后自行理解、自行执行。

### Inline 模式 vs Fork 模式

Skills 有两种执行模式，**Inline 是默认模式**，Fork 需要 Skill 配置中显式设置 `context: 'fork'`。Fork 的隔离性意味着 Skill 内部的文件缓存、权限拒绝记录、abort 控制都是独立的，不会污染主对话上下文。

## 三者核心对比

| 维度 | Rules | MCP | Skills |
|------|-------|-----|--------|
| **本质** | 被动注入的指令文本 | 标准化 RPC 协议 | 可复用提示词注入 |
| **触发方式** | 每次 API 自动注入 | 模型主动调用 tool_use | 模型主动调用 tool_use |
| **API 位置** | `messages` | `tools[]` + `system` | `messages`（via tool_use） |
| **执行主体** | 模型自行遵循 | MCP Server 真实执行 | 模型自行执行已有工具 |
| **执行隔离** | 无 | 无 | Fork 模式下有独立上下文 |
| **适用场景** | 项目级编码规范 | 外部系统 RPC 调用 | 结构化多步骤工作流 |

## 回答三个常见困惑

**Q1：Rules 和 Skills 都支持按需引入，区别在哪？**

从源码看，Skills 执行后注入的就是一段 Markdown 提示词，和手动把 Rules 文本贴进对话框对模型来说没有本质区别——都是 messages 里的一段 `role: "user"` 文本。

真正的区别只有两点：
1. **触发方式**：Rules 每次 API 调用自动注入，Skills 需要模型判断后主动调用 `tool_use`（或用户手动 `/skill-name` 触发）
2. **执行隔离**：Skills 可配置 Fork 上下文运行，拥有独立的缓存、权限跟踪和 abort 控制

但现实中第一点反而成了 Skills 的痛点——Skill 描述只有最多 250 字符，经常不够模型做出正确判断，导致最终还是要靠手动触发。

**Q2：MCP 和 LLM 内置 Tools 的区别在哪？**

**对模型来说没有区别。** `tools[]` 里格式一样，调用方式一样。区别纯粹在 Agent 侧的执行路由：内置 Tools 本地执行，MCP Tools 转发到外部 Server。

**Q3：Skills 的标准化流程是"代码层面的流程化"吗？**

**不是。** 源码里没有任何代码逻辑来控制 Skill 的执行步骤。所谓"标准化工作流"，就是一段写得比较结构化的 Markdown。Skill 的质量 = 提示词的质量，Skill 的"流程保障" = 模型的指令遵循率。写一个好的 Skill 和写一段好的 Rules，需要的能力是一样的——**都是提示词工程**。

## 实际使用建议

**什么时候用 Rules：**

- 项目级的编码规范、技术栈约定、代码风格要求
- 文本短（几百字以内），每次注入不心疼 token
- 需要"始终生效"的指令，不依赖模型判断是否需要

**什么时候用 Skills：**

- 指令文本较长（几百行级别），不适合每次注入
- 有明确的触发时机（用户主动 `/commit`、`/review-pr`）
- 需要执行隔离（Fork 模式让任务在独立上下文中运行，不污染主对话）

**什么时候用 MCP：**

- 需要持久化连接/状态管理的场景（数据库连接池、认证 session）
- 复杂多步操作需要原子封装，减少模型拼命令出错的概率
- 需要权限隔离，不想给模型一个万能的 Bash

**现实提醒：不要迷信 Skills 的自动触发。** Skill 列表的 token 预算只有上下文的 1%，描述不够精准或用户意图不够明确时，模型大概率不会自动触发。把核心 Skill 的快捷命令告诉团队成员让他们手动调用，比指望模型自动识别靠谱得多。

## 相关实体

- [Claude Code 架构解析：从 Skill 调用到 Prompt Cache](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-architecture.md)
- [Anthropic MCP 最新博客：Token 成本解法 + Tool Search](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-mcp-revisited-tool-search-code-orchestration.md)
- [Harness Engineering：AI 从"聪明"到"可靠"的第三代工程范式](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-engineering.md)
- [Claude Code 12 个可复用的 Agentic Harness 设计模式](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-agentic-harness-design-patterns.md)
- [Claude Code Governance：软规则与项目级行为规范](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-governance-soft-rules.md)
- [Agent Harness Context Management：Working Set 策略](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-harness-context-management-working-set.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/claude-code-complete-guide.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/anthropic-ecosystem.md)
## 深度分析

**1. "注入位置"是理解 Rules/MCP/Skills 本质差异的第一性原理**

源码分析揭示的底层逻辑远比表面功能描述更清晰：Rules、MCP、Skills 的核心区别不在于"能做什么"（功能层面），而在于"信息在 API 请求中占据什么位置"（架构层面）。Rules 通过 `prependUserContext()` 注入 messages（被动，每次 API 调用自动携带）；MCP 同时占据 `tools[]` 和 `system` 两个位置（主动调用，Server 级指南在 system 动态区）；Skills 通过 `tool_use` 触发后在 Inline 模式下注入 messages（主动调用但执行是提示词注入）。这三个位置（messages、tools[]、system）的组合差异，导致了完全不同的工程特性：Rules 的信息稳定但无执行隔离，Skills 的信息可复用但依赖模型判断，MCP 的信息执行真实但需要常驻进程维护。这一框架比任何功能描述都更能指导技术选型决策。

**2. Skill 列表 1% token 预算的设计缺陷是自动触发机制失效的根源**

Skill 列表仅占上下文窗口 1%（默认 8000 字符），每个 Skill 描述上限 250 字符——这一设计约束在实践中造成了严重的信息瓶颈。当企业拥有 20+ 个 Skill 时，仅 Skill 列表描述的 token 消耗就可能超过 5000 字符，占用了本应用于实际对话的上下文空间。雪上加霜的是，250 字符的描述上限根本无法充分表达一个 Skill 的触发条件和使用场景——模型仅凭 250 字符很难做出正确的"是否需要调用"判断。作者指出的"不要迷信自动触发，把快捷命令告诉团队成员"是非常务实的建议。这揭示了一个重要的设计教训：为了让 AI Agent 自动协调多个 Skill 而设计的" Skill 列表 + 强制触发指令"机制，本质上是在用极其有限的信息带宽传递复杂的决策信号，成功率必然有限。

**3. MCP 的真正护城河是"持久化状态 + 权限隔离"，而非"Bash 也能做的事"**

源码分析后的反直觉结论"Bash 也能做到"（调 `gh issue list` 和 `mcp__github__list_issues` 没有本质区别）揭示了 MCP 营销叙事与实际价值的错位。真正只有 MCP 能做到 Bash 做不了的事：①持久化连接和状态管理（数据库连接池、WebSocket 长连接、跨调用共享 session）；②复杂多步原子封装（5+ 步骤的操作如果全用 Bash 实现，模型需要自己拼装命令字符串，出错概率随步骤数指数增长）；③权限约束（给 AI Agent 一个万能 Bash 等于给了一把万能钥匙，而 MCP Server 可以限制 AI 只能执行预定义操作集合）。企业引入 MCP 的决策应该聚焦在这三个真正有差异化的场景上，而非为了"MCP 而 MCP"。如果一个外部系统已经有成熟的 CLI 工具（`gh`、`kubectl`、`psql`），让模型直接用 Bash 调用往往更简单直接。

**4. Skills 的本质是"更结构化的 Rules + Fork 隔离机制"，而非"代码化的工作流"**

作者通过源码分析澄清了一个常见误解：Skills 的"标准化流程"或"工作流自动化"本质上是文字游戏。Skill 的执行逻辑中，没有任何代码层面的 if-else、循环控制或步骤状态机——只有一段被注入到对话历史的 Markdown 文本，模型读到后按自己的理解执行。Skill 的质量完全等同于提示词工程的质量；Skill 的"流程保障"等同于模型的指令遵循率（这意味着换用更弱的模型，流程执行结果可能完全崩溃）。然而，Fork 模式提供了 Rules 所没有的工程价值：独立的文件缓存（不会污染主对话的上下文）、独立的权限跟踪和 abort 控制（长流程任务崩溃后不会影响主对话状态）。对于需要长时间运行的多步骤任务，Fork 模式的隔离性是有实际工程价值的设计。

**5. Skills 的可发现性和可分发机制是其相对于 Rules 的核心战略优势**

虽然作者指出"手动触发 Skills"和"手动引用 Rules"效果几乎相同，但 Skills 有一个 Rules 不具备的本质优势：**Skills 是被组织管理的可发现、可分发知识单元**。Rules 文件路径是私人知识（只有知道文件路径才能引用），而 Skills 注册在系统里，可以通过 `/skills` 命令浏览，可以打包成插件发布给团队成员。这意味着当一个团队需要标准化某项复杂工作流程（如代码审查、CHANGELOG 生成、依赖升级）时，Skill 是更合适的载体：用户只需记住 `/review-pr` 这个快捷命令，不需要知道背后引用了哪些规则文件，也不需要知道这些文件的准确路径。这对 Skills 在团队协作场景中的推广至关重要——让不懂 AI Agent 内部实现的同事也能通过简单命令使用标准化工作流程，是 Skills 的核心产品价值。

## 实践启示

**1. 优先使用 Rules 管理项目不变性约束，250 字符以内的精准描述才考虑 Skills 自动触发**

项目级编码规范、技术栈约定、安全规则这些"始终生效的约束"应该用 Rules（CLAUDE.md）管理，因为它们不需要模型主动判断是否需要——每次 API 调用自动注入，100% 生效。250 字符的 Skill 描述只够表达非常明确、可模式匹配的触发条件（如用户说"帮我提交代码"→ 触发 `/commit`）。对于触发条件模糊或需要多步推理才能判断是否应该触发的场景，手动 `/skill-name` 调用是更可靠的选择。不要为了"看起来更自动化"而强推 Skills 自动触发——实际上手动调用往往更快、更可靠。

**2. 为复杂多步骤任务配置 Fork 模式，利用独立上下文隔离防止主对话污染**

当 Skill 涉及复杂的多步骤操作（如完整的 PR 审查、依赖升级流程、多文件重构），应该显式配置 `context: 'fork'` 启用 Fork 模式。Fork 模式的独立上下文意味着：执行过程中所有文件修改、工具调用记录都在独立副本中运行，不会污染主对话的文件缓存和上下文窗口；独立的 abort 控制让任务失败时不会连带终止主对话；独立的权限跟踪让敏感操作的影响范围可控。对于需要长时间运行的复杂任务（预计 10+ 步骤），Fork 模式的隔离价值远超 Inline 模式的简单性。建议将 Fork 模式作为复杂 Skill 的默认选项，而非需要时才考虑的配置。

**3. 引入 MCP 前先问三个问题：是否需要持久化状态、是否需要原子封装、是否需要权限约束**

如果三个问题的答案都是"否"（只是简单的 read 查询或单步操作），应该优先让模型直接用 Bash 调用现有 CLI 工具（`gh`、`curl`、`psql` 等）。MCP 的引入应该遵循最小化原则：每增加一个 MCP Server，就增加一个需要维护的常驻进程、一层 JSON-RPC 通信和一个潜在的单点故障。只有在"持久化状态管理"（数据库连接池、WebSocket）、"复杂原子操作"（跨多个 API 的多步骤流程）或"权限隔离"（不想给 Agent 万能 Bash）这三个场景下，MCP 的额外工程复杂度才是合理的投资。建议企业建立 MCP 引入的评审流程，需要明确说明为什么 Bash 或现有 CLI 工具无法满足需求。

**4. 构建企业 Skill 体系时，将"可发现性"设计置于"自动触发"设计之上**

企业推广 Skills 时，最大的误解是"AI 会自动调用正确的 Skill"——实际上 Skill 的可发现性（用户主动找到 `/skills` 命令浏览、了解可用能力）比自动触发可靠得多。正确的建设思路是：① 为每个 Skill 设计清晰的 250 字符描述，准确描述触发场景和预期行为，但不能依赖描述承载完整的工作流程说明；② 在团队内部推广 `/skills` 命令的使用习惯，让成员知道有哪些 Skill 可用；③ 将 Skill 的快捷命令作为团队知识沉淀的标准化入口（类似于内部 CLI 工具的 `help` 命令）。不要假设用户会"被 AI 自动服务"——主动发现和手动调用才是当前阶段更可靠的使用模式。

**5. Skill 的质量完全等同于提示词质量，投入在提升 Skill 编写能力上的回报远高于投入在自动化框架上**

作者的核心结论"Skill 的质量 = 提示词的质量"应该成为企业 Skill 建设的核心指导思想。这意味着与其研究如何让 Skill 自动触发、如何实现 Skill 嵌套调用等工程机制，不如专注于提升 Skill 提示词本身的编写能力。一个高质量的 Skill 提示词需要：精准的任务分解（每个 Step 边界清晰，避免模型在步骤之间迷路）、明确的输出期望（告诉模型每个步骤完成后应该输出什么）、有效的错误处理（告诉模型遇到常见错误时应该如何修正）。这些本质上都是"提示词工程"能力，而非"编程"能力。企业在培养 AI Agent 开发团队时，应该将提示词工程作为与代码能力同等重要的核心技能，而非将其视为"调参"之类的次要工作。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-skills-mcp-rules-source-analysis.md)

---

## Ch07.007 Hermes Agent 满配 12 层配置完整指南（从裸装到 24h Agent 团队）

> 📊 Level ⭐⭐ | 21.5KB | `entities/hermes-agent-12-layer-full-configuration-guide.md`

# Hermes Agent 满配 12 层配置完整指南

## 核心定位：满配 ≠ 装满

> "**很多人理解的满配，是装尽可能多的插件、接尽可能多的 MCP、开尽可能多的工具、配尽可能复杂的多 Agent，让它看起来像一个很酷的 AI 控制台。**"

**但真正用一段时间后，**这种满配很容易变成另一种负担：
- 工具太多，Agent 不知道什么时候该用
- Skill 太多，选择成本变高
- Memory 太乱，长期偏好被临时信息污染
- MCP 太多，Token 和权限风险都变大
- Profile 太多，自己都不知道哪个 Agent 记住了什么
- Gateway 开了，但安全边界没想清楚
- Cron 跑了，但它到底做了什么你看不见

**真正的满配定义**：

> "**围绕你的真实工作模式，把输入、记忆、技能、工具、自动化、可视化、Token 成本和多 Agent 协同这些能力，组合成一个可长期维护、可持续进化的个人 Agent 系统。**"

## 相关实体

- [hermes-wiki 实战 — obsidian + hermes agent 自动生长知识网络的 9 步搭建法](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-wiki-9-step-auto-growing-knowledge-network.md)
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/hermes-agent-12-layer-full-configuration-guide.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/multi-agent-coordination.md)
## 全文 20 章 + 4 部分结构

|  部分 | 章节 | 主题 |
|---|---|---|
| **第一部分：系统总览和基础** | 1-4 章 | 满配定义 + 安装 + 模型 + 输入系统 + Memory |
| **第二部分：能力模块逐个上手** | 5-12 章 | **Skills → Tools → MCP → Gateway → Cron → Token 优化 → 可视化 → 语音/网页/搜索** |
| **第三部分：多实例与多 Agent** | 13-16 章 | **Profile 多实例 → 24h Agent 团队 → 生态导航 → 推荐满配路线** |
| **第四部分：完整实战** | 17-18 章 | **AI 工具雷达 Agent + 头脑风暴聊天室 Agent**（完整闭环） |
| **总结** | 19-20 章 | **满配清单 + 总结** |

## 12 层配置清单（核心框架）

| 层级 | 模块 | 解决的问题 | 推荐程度 |
|---|---|---|---|
| **L1** | 安装与模型 Provider | 先让 Hermes 稳定跑起来 | **必配** |
| **L2** | 输入系统：SOUL.md / AGENTS.md / CLAUDE.md | 让 Hermes 理解你和当前项目 | **必配** |
| **L3** | Memory 长期记忆 | 跨会话记住偏好、目标、环境和经验 | **必配** |
| **L4** | Skills 技能系统 | 把稳定流程沉淀成可复用能力 | **必配** |
| **L5** | Tools / Toolsets | 控制 Hermes 能调用哪些本地能力 | **必配** |
| **L6** | MCP 外部工具连接 | 接 GitHub / 文件系统 / 搜索 / 数据库 / 浏览器 | **进阶必配** |
| **L7** | Gateway 消息入口 | 让 Hermes 出现在 Telegram / 飞书 / Discord / 邮件 | **按需配置** |
| **L8** | Cron 自动化 | 定时做日报 / 雷达 / 巡检 / 周报 | **强烈推荐** |
| **L9** | Profiles 多实例隔离 | 为不同场景创建独立 Agent | **强烈推荐** |
| **L10** | 可视化与可观测 | 看见它做了什么 / 哪里失败 / 花了多少 Token | **进阶必配** |
| **L11** | Token 精简与上下文管理 | 降成本 / 提速度 / 减少上下文污染 | **进阶必配** |
| **L12** | 多 Agent / 24h Agent 团队 | 让多个角色长期协作 | **高阶玩法** |

**12 层不是让你一天全部装完**，而是给你一张路线图。

**推荐路径**：

> "**先跑通 → 再记住你 → 再沉淀技能 → 再接工具 → 再定时运行 → 再多入口触达 → 最后再多 Agent 协同。**"

**反模式警告**：

> "**不要一开始就搭 24h Agent 团队。那样很酷，但如果基础的 Memory、Skill、MCP、权限和可观测都没做好，最后只是制造一个更复杂的失控系统。**"

## L1 安装基线：先保证 Hermes 本体稳定

**新手最容易犯的错**：

很多人安装 Hermes 后，第一件事就是搜资源：
```bash
hermes plugins install xxx
hermes skills install xxx
hermes gateway setup
hermes cron create ...
```

**但官方 Quickstart 里有一个非常重要的原则**：

> "**如果 Hermes 连一个普通聊天都不能稳定完成，就不要继续叠加 Gateway、Cron、Skills、Voice 或 Routing。满配的第一步不是满配，而是'干净可用'。**"

**两种安装方式**：
- **方式 A（PyPI）**：追求稳定 → `pip install hermes-agent` + `hermes setup`
- **方式 B（官方脚本）**：接近主分支 → `curl -fsSL .../install.sh | bash`

**常用排查命令**：
```bash
hermes doctor
hermes model
hermes setup
hermes config show
hermes sessions list
hermes --continue
```

**核心金句**：

> "**满配前先学会回到'已知可用状态'。否则后面装得越多，越不知道哪里坏了。**"

## L2 输入系统：6 层协议栈（核心创新）

**Hermes 的输入系统像一个分层协议栈，每个文件解决一个层面的问题**：

```
┌─────────────────────────────────────────────┐
│ 当前对话 (临时任务/一次性要求/当前上下文)         │
├─────────────────────────────────────────────┤
│ SKILL.md (可复用任务流程)                       │
├─────────────────────────────────────────────┤
│ AGENTS.md / .hermes.md (当前目录的规则)        │
├─────────────────────────────────────────────┤
│ MEMORY.md (~2200 字符, Agent 工作笔记)         │
├─────────────────────────────────────────────┤
│ USER.md (~1375 字符, 用户画像和偏好)            │
├─────────────────────────────────────────────┤
│ SOUL.md (Agent 应该怎么工作: 立场/职责/边界)    │
└─────────────────────────────────────────────┘
```

**每层的精确定位**：

| 文件 | 解决的问题 | 关键特征 |
|---|---|---|
| **SOUL.md** | 这个 Agent **应该怎么工作**（立场 / 职责 / 边界 / 风格） | 不是"人设卡"而是"工作协议" |
| **USER.md** | **我是谁 / 我喜欢什么 / 我讨厌什么**（用户画像） | 长期稳定，~1375 字符 |
| **MEMORY.md** | **我在做什么项目 / 环境事实 / 踩坑经验** | Agent 工作笔记，~2200 字符 |
| **AGENTS.md / .hermes.md** | **当前目录的规则 / 代码规范 / 目录说明 / 运行方式** | 项目级 |
| **SKILL.md** | **可复用任务流程**（周报生成 / 访客画像抽取 / 工具分析） | 流程级 |
| **当前对话** | **临时任务 / 一次性要求 / 当前上下文** | 一次性 |

**重要机制**：

> "**Hermes 内置记忆由两个文件组成：MEMORY.md（约 2200 字符）偏 Agent 的工作笔记，USER.md（约 1375 字符）偏你的画像和偏好。它们会在每次 session 开始时作为快照注入 system prompt；会话中写入的新记忆一般要到下次 session 才真正生效。**"

### 3.1 SOUL.md：不要写玄学人格，要写工作协议

**反面教材**：
```
你是一个聪明、强大、无所不能的 AI 助手。
```
**问题**：没有给 Agent 任何可以执行的规则。Agent 不知道什么时候该主动 / 什么时候该刹车 / 什么时候可以不同意你。

**SOUL.md 应该回答的不是"你是什么性格"，而是"你应该怎么和我协作"**

**5 大核心模块**：

1. **立场**：保持直接、务实、有判断力、高主动性；**"有用比顺耳重要。锋利比润色重要。诚实比显得厉害重要"**；说重点，然后停止
2. **职责**：不要等待完美指令；**主动发现机会、指出问题、识别停滞循环**；你的职责是**制造推进**，不是生产一堆最后进坟场的材料
3. **自主性边界**：硬边界（**公开发布 / 购买 / 发送消息 / 删除 / 暴露隐私** — 没有明确批准绝不能执行）；其他情况下"如果你对判断有信心，就推进"
4. **反对与纠偏**：可以直接不同意但需要**先赢得反对的资格**（数据 / 例子 / 推理 / 更好的替代方案）；**"不要为了保护我的自尊而隐瞒有用的真相"**
5. **沟通风格**：任务简单时简短 / 复杂时结构化 / 有风险时明确写出权衡；**避免企业黑话、虚假兴奋**；面向公众内容"**应该像一个真实的人写出来的：有品味、有伤痕、有观点**"
6. **自我改进**：**当某个工作流重复出现时，考虑它是否应该变成检查清单、模板、脚本或可复用 Skill**；"不要让重复摩擦保持隐形"

**核心断言**：

> "**SOUL.md 是 Agent 的'工作协议'，不是人设卡。好的 SOUL.md 不是让 Agent 听起来更像人，而是让它做事更像一个靠谱的搭档。**"

### 3.2 USER.md vs MEMORY.md 核心区分

> "**USER.md 写'我是谁'，MEMORY.md 写'我在做什么'。**"

| 维度 | USER.md | MEMORY.md |
|---|---|---|
| **定位** | 你的长期画像 | Agent 的工作笔记 |
| **容量** | ~1375 字符 | ~2200 字符 |
| **适合写** | 身份、偏好、沟通风格、期望 | 项目、环境、踩坑、工作流、决策原则 |

**USER.md 模板**：
- **Profile**（职业身份 / 技术背景 / 当前最关注的 3 个方向）
- **Communication Preferences**（语言 / 简短 vs 结构化 / 是否接受反驳 / 讨厌什么类型）
- **Output Preferences**（技术方案 / 业务方案 / 写作任务 各要包含什么）
- **Collaboration Style**（是否多想法切换 / 是否需要聚焦提醒 / 看重真实判断还是情绪安慰）

**MEMORY.md 模板**：
- **Active Context**（当前长期探索方向 / 当前重点不是什么）
- **Current Priorities**（1-3 件事 + 目标）
- **Active Projects**（目标 / 当前进展 / 最大阻塞 / 下一步）
- **Decision Principles**（拆问题框架 / Agent 任务框架 / 工程任务规则）
- **Known Pitfalls**（不要把临时想法写成长期承诺 / 不要在没有验证时编造命令 / 不要让项目无限发散）
- **Environment Notes**（常用本地工具 / 环境特殊性）
- **Memory Maintenance Rules**（只保存长期稳定信息 / 过期项目不要长期保留 / 优先压缩成原则 / 纠正时更新对应条目而不是重复追加）

### 3.3 记忆初始化：让 Hermes 通过访谈帮你写

**核心方法**：直接让 Hermes 通过访谈帮你生成 User.md + Memory.md，而不是手动填模板

> "**一个实用的做法是：直接让 Hermes 通过访谈帮你生成。**"

## 4 阶段路线图（核心方法论）

**推荐路径**：
1. **先跑通**（L1 安装 + 干净可用）
2. **再记住你**（L2 输入系统 + L3 Memory）
3. **再沉淀技能**（L4 Skills）
4. **再接工具**（L5 Tools + L6 MCP）
5. **再定时运行**（L8 Cron）
6. **再多入口触达**（L7 Gateway）
7. **最后再多 Agent 协同**（L9 Profile + L12 多 Agent）

## 与已有实体的关系

- `Hermes 9 Module Architecture` (5-12) — 9 模块系统架构
- `Hermes 9 Module Architecture Winty` (5-21) — winty 的 9 模块版本
- **本实体** = **12 层满配配置指南**（**与 9 模块架构不同视角** — 9 模块 = 内部组件 / 12 层 = 外部配置）

- `Hermes Agent Getting Started Guide 2026` — 入门指南（专注 L1）
- **本实体** = 入门 → 满配的完整路径

- `Mac Multi Agent Coding Skills Hooks Harness` — MAC = Skills + Hooks 两层
- **本实体 L4 Skills** + **本实体 L6 MCP** = 更广义的工具/MCP 组合
- **MAC 是 Skills+Hooks 编程模型**；**Hermes 12 层是产品级配置模型**

- `Hermes Agent Skill Crossover Optimization` — Skill 互优化
- **本实体 L4 Skills** 提到"把稳定流程沉淀成可复用能力" — 与互优化形成生态互补

## 核心金句

- "**满配的第一步不是满配，而是'干净可用'**"
- "**如果 Hermes 连一个普通聊天都不能稳定完成，就不要继续叠加 Gateway、Cron、Skills、Voice 或 Routing**"
- "**满配前先学会回到'已知可用状态'。否则后面装得越多，越不知道哪里坏了**"
- "**输入系统像一个分层协议栈，每个文件解决一个层面的问题**"
- "**SOUL.md 应该回答的不是'你是什么性格'，而是'你应该怎么和我协作'**"
- "**SOUL.md 是 Agent 的'工作协议'，不是人设卡**"
- "**有用比顺耳重要。锋利比润色重要。诚实比显得厉害重要**"
- "**你的职责不是生产一堆最后进坟场的材料。你的职责是制造推进**"
- "**不要为了保护我的自尊而隐瞒有用的真相**"
- "**面向公众的内容应该像一个真实的人写出来的：有品味、有伤痕、有观点**"
- "**不要让重复摩擦保持隐形**"
- "**USER.md 写'我是谁'，MEMORY.md 写'我在做什么'**"
- "**先跑通 → 再记住你 → 再沉淀技能 → 再接工具 → 再定时运行 → 再多入口触达 → 最后再多 Agent 协同**"
- "**不要一开始就搭 24h Agent 团队。那样很酷，但如果基础的 Memory、Skill、MCP、权限和可观测都没做好，最后只是制造一个更复杂的失控系统**"

## 深度分析

- **12 层配置的本质是"能力叠加路线图"而非功能清单**。该指南最核心的价值在于它提供的不是功能描述，而是一套优先级框架——从 L1 到 L12 的递进路径隐含了一个关键洞察：个人 Agent 系统的失败往往不是因为"装得不够多"，而是因为"基础不扎实时就叠加新能力"。这与软件工程中"先保证主干稳定，再叠加功能"的经典原则一脉相承。

- **6 层输入协议栈（SOUL→USER→MEMORY→AGENTS→SKILL→对话）是该系统最独特的设计创新**。它将 Agent 的输入按时间稳定性分层：SOUL.md 最稳定（定义工作方式）、USER.md 次稳定（用户画像）、MEMORY.md 动态变化（项目状态）、SKILL.md 流程级、对话最临时。这种分层设计解决了大多数 Agent 系统的核心痛点——短期上下文污染长期偏好。传统 Agent 把所有信息平铺在 context 里，而该协议栈通过文件边界强制实现了关注点分离。

- **SOUL.md 作为"工作协议"而非"人设卡"的重新定位，直接回应了 Agent 配置领域的典型误区**。大量用户在配置 Agent 时倾向于写"你是一个友善的助手"这类模糊描述，这导致 Agent 行为不可预测。该指南将 SOUL.md 的定位收窄为"工作协议"——明确回答"你应该怎么和我协作"而非"你是什么性格"，这是一个务实且可操作的范式转变。

- **Cron + Profile 的组合是实现真正"24h Agent 团队"的最小可行路径**。L8 Cron 负责定时任务自动化，L9 Profile 负责场景隔离，两者结合可以在单一 Hermes 实例上模拟多角色协作。相比直接搭建 L12 多 Agent 系统，Cron+Profile 的组合风险更低、配置更轻，是普通用户向多 Agent 过渡的最优中间态。

- **"反模式警告"（不要一开始就搭 24h Agent 团队）是全文最具有实践智慧的一句话**。它揭示了一个常见的 Agent 配置心理陷阱：用技术复杂度替代实际价值评估。多 Agent 系统在视觉上很酷，在架构上也很有说服力，但如果基础层（Memory、Skill、MCP、权限、可观测）没做好，多 Agent 只是放大了混乱的规模而非解决问题的能力。

## 实践启示

- **从 L1→L4 开始，先跑通再记住最后才沉淀技能**。具体操作：先用 `hermes doctor` 确认基础安装无问题；然后通过访谈让 Agent 生成 USER.md 和 MEMORY.md（不要手动填模板）；再配置 SOUL.md 时聚焦"工作协议"而非"人设"；最后才考虑 Skills 沉淀。这个顺序不能颠倒。

- **为不同 Profile 配置不同的 SOUL.md，避免一个 Agent 试图满足所有场景**。比如"研究 Profile"的 SOUL.md 应该强调信息整合和引用准确性，"执行 Profile"的 SOUL.md 应该强调工具调用的确定性和步骤化执行。Profile 间的隔离不仅是 Memory 的隔离，应该是工作协议的隔离。

- **Cron 任务优先选择"高频率、低风险、可验证"的场景**。日报生成、雷达巡检这类定时任务是最容易验证效果的选择，因为输出结果有明确标准且失败影响可控。避免在一开始就配置"每天自动发送 10 封邮件"这类高风险 Cron 任务——一旦出错，Agent 的信任成本会非常高。

- **使用 MemOS/memos-hermes-plugin 解决原生记忆的"记住但记得乱"问题**。该插件通过 LLM 判断去重（而非文本相似度）实现记忆库智能清理，并通过混合检索（关键词+语义）提升记忆召回率。对于长期高频使用 Hermes 的用户，这是 L3 Memory 层最重要的进阶配置 [Memos Hermes Plugin](https://github.com/QianJinGuo/wiki/blob/main/entities/memos-hermes-plugin.md)。

- **多 Agent 协作的起点是"研究与执行分离"，而非功能分工**。根据 [Hermes Four Agents Setup](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-four-agents-setup.md) 的经验，多 Agent 架构的有效分工是按任务类型（研究 vs 执行）而非按功能模块（写代码 vs 写文档）。研究 Agent 需要长上下文和信息整合能力，执行 Agent 需要工具调用可靠性和步骤化执行能力，两者对模型能力的要求本质不同，混在一起会互相拖累。

---

## Ch07.008 重新定义Skill开发：保姆级教程&一站式开发助手

> 📊 Level ⭐⭐ | 20.7KB | `entities/skill-development-guide-linyi.md`

> 来源：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/skill-development-guide-linyi.md)（凜一 / 阿里云开发者，2026-05-18）

## 一、Skill 的本质：结构化指令文档，而非代码

### 1.1 重新定义 Skill

Skill 不是代码，而是一份**结构化指令文档**——告诉 AI Agent「在什么场景下、按什么步骤、用什么工具、完成什么任务」。

这一定义将 Skill 与传统「工具/插件」思维彻底区分开来：

| 维度 | 传统工具/插件 | Skill |
|------|--------------|-------|
| 本质 | 可执行代码 | 指令文档（给 AI 看的 SOP） |
| 核心价值 | 功能实现 | 触发条件 + 执行步骤 + 工具选择 + 输出规范 |
| 上下文占用 | 直接消耗 | 按需加载（渐进式披露） |
| 更新方式 | 重新部署 | 修改文档即可 |
| 跨平台性 | 平台绑定 | 平台无关（核心逻辑） |

Skill 更接近 **SOP（标准作业程序）**——是给 AI 看的操作手册，而非需要 AI 执行的程序。

### 1.2 类比：《阿里开发操作手册》

文章用阿里内部场景做了生动的类比：

| 现实世界 | Skill 世界 |
|----------|------------|
| 阿里开发操作手册 | SKILL.md 文件 |
| 手册封面（标题+简介） | YAML frontmatter（name + description） |
| 开发操作步骤 | Markdown 正文中的工作流指令 |
| 附录（Aone、语雀、中间件等） | Bundled Resources（scripts/ / references/ / assets/） |
| 你按开发手册干活 | Agent 按 Skill 执行任务 |

### 1.3 核心观点：Skill 会替代你吗？

黄仁勋的回答是：**任务（Task）会被自动化，但体验（Experience）和判断（Judgment）不会。**

- ❌ Skill 替代的不是"你"，而是替代你身上那些重复、冗长、易错、本来就不该占用大脑的"任务"
- ✅ Skill 替代不了的"你"，是你生成的 Skill 在体验上的丝滑和你对 Skill 执行准确性的判断

**你需要焦虑的不是"被 Skill 替代"，而是"还没学会用 Skill"**。

---

## 二、三级加载机制：控制上下文消耗的关键设计

### 2.1 渐进式加载策略

Skill 采用**渐进式加载**策略，而非一次性将所有内容塞入上下文。这解决了「丰富 Skill 内容」与「耗尽 Agent 上下文窗口」之间的根本矛盾。

```
Skill 加载层级
├── Level 1: SKILL.md 头部（name + description）
│   └── 仅在触发决策时使用，Agent 判断是否调用此 Skill
├── Level 2: SKILL.md 正文（工作流 + 执行步骤）
│   └── 触发后加载，完整执行路径
└── Level 3: references/ + scripts/（按需加载）
    └── 特定步骤需要时再加载，不占用初始上下文
```

### 2.2 实践意义

开发者在编写 SKILL.md 时需要**主动考虑分层加载**，而不是堆砌文档。建议：

- SKILL.md 正文控制在 **500 行以内**
- 超出时拆到 `references/` 按需加载
- `scripts/` 目录不占用上下文（脚本执行而非读取）

---

## 三、Skill 平台生态全景图

### 3.1 外部 Skill 市场

| 平台 | 渠道 | 简介 | 搜索方式 | 速度 | 规模 | 认证 |
|------|------|------|----------|------|------|------|
| skills.sh | 外部 | 开源工作流自动化，快速安装 | CLI: npx skills find | ⚡ 快速 | ~千级 | ❌ 无需 |
| ClawHub | 外部 | 社区驱动，支持版本管理与发布 | CLI: clawhub search | ⚡ 快速 | 社区级 | ⚠️ 可选 |
| SkillsMP | 外部 | 最大数据库，AI 语义搜索 | REST API | 🐢 5-15s | 283K+ | ✅ 需要 |

### 3.2 内部 Skill 平台

| 平台 | 简介 | 规模 | 认证 |
|------|------|------|------|
| alphashop | 跨境电商场景 Skill 中心 | 社区级 | ⚠️ 可选 |
| Aone Skills | 阿里内部 Skill 发布平台，与 Aone Copilot 深度集成 | 内部 | ✅ 内网 |

### 3.3 Agent 平台中的 Skill 使用方式

| Agent 平台 | 定位 | Skill 使用方式 |
|------------|------|---------------|
| Aone Copilot | 阿里内部 IDE AI 编程助手 | 放入 `~/.aone_copilot/skills/`，或从 Aone Skills 市场一键安装 |
| AccioWork | 阿里内部通用办公 Agent 平台 | 内置 Skill 直接安装，自定义 Skill 需要安装包上传 |
| QCoder | 轻量级 AI 编码助手 | 放入项目级 `.skills/` 目录，随项目仓库管理 |
| 悟空 | 阿里内部多模态 Agent 平台 | 通过平台 UI 上传，或在系统提示词中加载 |

---

## 四、Skill 创建：目录结构与 SKILL.md 编写

### 4.1 标准目录结构

```
my-awesome-skill/
├── SKILL.md           ← 唯一必需的文件！
└── (可选) 附加资源
    ├── scripts/        ← 可执行脚本（Python、Node.js、Shell 等）
    ├── references/     ← 参考文档（按需加载到上下文）
    └── assets/         ← 静态资源（模板、图标、字体等）
```

### 4.2 SKILL.md 结构

**YAML 头部（frontmatter）字段说明：**

| 字段 | 是否必需 | 说明 |
|------|----------|------|
| name | 必需 | Skill 的唯一标识符。最长 64 字符，仅允许小写字母/数字/连字符 |
| description | 必需 | 触发描述，最长 1024 字符。Agent 判断是否使用该 Skill 的核心依据 |
| license | 可选 | 许可证名称，如 MIT、Apache-2.0 |
| compatibility | 可选 | 适配的 Agent / 平台 / 模型范围 |
| allowed-tools | 可选 | 预授权工具白名单 |
| metadata | 可选 | 任意 KV 元数据：author、version、category、tags |

```yaml
---
name: dingtalk-webhook-skill
description: 通过钉钉自定义机器人 Webhook 发送群消息。当用户提到钉钉、机器人、webhook、群消息、通知、dingtalk、发消息时触发。
license: MIT
compatibility:

  - claude-3.5+
  - aone-copilot
allowed-tools: Read Bash WebFetch
metadata:
  author: zefei.szf
  version: 1.2.0
  category: communication
  tags: [dingtalk, webhook, notification]
---
```

⚠️ **description 是触发的关键**：Agent 目前倾向于「少触发」而非「多触发」。description 要写得稍微"积极"一些，多列举可能的触发关键词和场景。

### 4.3 Markdown 正文结构

通常包含五个部分：

1. **快速开始 / 使用示例** — 1-2 个典型用户输入示例
2. **参数列表** — 表格列出参数名称、是否必需、默认值、说明
3. **工作流 / 执行步骤** — 分步骤描述 Agent 如何执行
4. **错误处理** — 常见错误场景和对应处理方式
5. **附加资源引用** — 何时、如何使用 `scripts/` 或 `references/`

### 4.4 创作思维（四步法）

1. **确定触发时机**：先想清楚"用户在什么场景会用到"，把关键词、口令、上下文条件梳理出来
2. **确定输入与输出**：明确需要哪些参数、交付什么产物
3. **确定大致流程**：把核心步骤、用什么工具、依赖的外部资源用 3-7 步串起来
4. **补充细节与规则**：补全边界情况、错误处理、约束条件

### 4.5 写作原则

| 原则 | ✅ 正确示范 | ❌ 错误示范 |
|------|------------|------------|
| 用祈使句 | 从用户输入中提取 webhook_url 参数 | Agent 应该从用户输入中提取参数 |
| 解释「为什么」 | 使用 --headed 模式打开浏览器，因为会议室平台会检测 headless 环境并拒绝访问 | 必须使用 --headed 模式打开浏览器 |
| 控制篇幅 | SKILL.md 正文建议控制在 500 行以内，超出时拆分到 references/ | 把所有细节都塞进 SKILL.md |
| 保持通用性 | Skill 应该是通用的，不要过度绑定到特定示例 | 本 Skill 仅适用于 XX 项目的 XX 场景 |

### 4.6 脚本编写建议

- **零依赖优先**：使用语言标准库，避免额外安装依赖
- **多语言 fallback**：Python → Node.js → Shell 的降级方案
- **结构化输出**：脚本输出 JSON 到 stdout，方便 Agent 解析
- **明确退出码**：成功返回 0，失败返回非 0

💡 **脚本的妙用**：把复杂的、确定性的操作封装成脚本，Agent 直接调用即可，既省上下文又保证准确性。

---

## 五、Skill 管理：发布与版本控制

### 5.1 发布到 Aone 开放平台

- 🔗 打通 Code 平台、关联 Git 仓库，本地 push 即可触发发布
- 🏷️ 自动版本管理，基于 Git commit 自动生成版本信息
- ⚠️ **特别注意**：Aone Skill 的 git 仓库默认发布分支是 `main` 而不是 `master`

### 5.2 更新 Skill

重复发布流程即可。

---

## 六、痛点与解决方案

### 6.1 痛点一：跨平台、跨模型一致性

这是 Skill 开发的核心痛点。文章揭示了三种主要「污染」：

| 污染类型 | 例子 | 干扰 |
|----------|------|------|
| 平台语法污染 | Accio Work 的 @团队成员、Aone Copilot 的 /cmd、Claude Code 的 !bash | 不识别的平台当成普通文本 |
| 工具命名污染 | 写死 Bash、WebFetch、Read | 不同平台工具名不同 |
| 路径环境污染 | 硬编码 `~/.claude/skills/`、`process.env.ACCIO_*` | 仅在特定平台生效 |

**应对策略：三纯净 + 注释隔离 + 三检测**

#### 写作期「三纯净」原则

1. **正文纯文本**：不写任何平台特定的 @、/、! 触发符
2. **工具用能力描述**：写「调用 shell 命令」而非「调用 Bash 工具」
3. **路径不写死**：用相对路径或 `~/<workspace>/` 占位

#### 隔离期：用 HTML 注释隔离平台增量

```html
<!-- platform: accio-work -->
当任务需要团队协作时，使用 `@团队成员` 触发分配。
<!-- /platform -->
```

#### 发布期「三检测」清单

- [ ] 跨平台冒烟：至少在 2 个目标平台跑一遍
- [ ] 降级路径：每段平台特定能力都有兜底
- [ ] description 中性化：不出现具体平台名

**兜底原则：确定性逻辑下沉到 `scripts/`** — 把"必须确定执行"的逻辑放进 `scripts/*.py`，Python 脚本天然跨平台。

### 6.2 痛点二：版本管理和更新分发

#### 问题一：发布严肃性不足

| 阶段 | 做法 | 业内参考 |
|------|------|----------|
| 仓库治理 | Skill 仓强制 PR + 至少 1 人 CR；保护 main；CODEOWNERS 锁核心 SKILL.md | JFrog: Agent Skills are New AI Packages |
| 自动化校验 | CI 跑 schema 校验、关键词扫描、prompt-lint、scripts/ 单测 | skill-eval |
| 评测门禁 | skill-creator 跑回归 eval，通过率不低于上一版才能合入 | Anthropic skill-creator |
| 灰度发布 | 平台支持 channel 时优先发 beta，验证后升 stable | Claude Code plugin marketplace channels |
| SPE/安全扫描 | Skill 仓当代码资产接入扫描 | JFrog Xray、Snyk for AI |

#### 问题二：已安装用户无法自动感知更新

| 阶段 | 做法 | 业内参考 |
|------|------|----------|
| 显式 version | metadata.version 标语义化版本号 | Anthropic spec |
| 平台自动更新 | 用支持 manifest + auto-update 的渠道 | Claude Code plugin marketplaces |
| CHANGELOG + 订阅 | 仓内维护 CHANGELOG.md，tag 触发推送 | GitHub Releases webhook |
| 弃用与告警 | 旧版在 description 加 [DEPRECATED] | npm deprecate |
| 锁版本兜底 | 团队/项目级锁版本（pin commit SHA / 语义版本） | Claude Code v2.1.14+ commit pin |

### 6.3 痛点三：开发和调试效率低

常见反模式：改一行 SKILL.md → 跟 Agent 说"重新加载" → Agent 没加载到 → 手动重启会话 → 复测一次……一个小修改 **5-10 分钟**。

| 做法 | 说明 | 业内参考 |
|------|------|----------|
| Hot Reload | 用支持热加载的平台，改完无需重启 | Claude Code 2.1 hot-reload |
| Symlink 软链 | `ln -s` 把开发中的 Skill 仓链到平台 skill 目录 | asm link |
| Local Dev Loop 模板 | 一键搭 hot reload + 自动测试 + 文件 watcher 的开发环境 | exa-local-dev-loop |
| Eval-Driven Dev | skill-creator 预设回归用例，每次改完跑一遍 | Anthropic skill-creator |
| 双窗口对照 | 一个会话开 dev 版、一个开 prod 版，并排对比 | 社区调试技巧 |

**跑通这套环，单次迭代从 5-10 分钟压到 30 秒以内。**

---

## 七、进阶：Skill 自我进化机制

### 7.1 四步反馈闭环

文章提出了完整的自我进化机制：

```
执行 Skill → Binary Eval 自动打分 → 失败时 Reflection Agent 提炼修复 patch → 通过 eval 复测 → 自动 git commit
```

### 7.2 业内代表性方案

| 方案 | 机制 | 出处 |
|------|------|------|
| Claude Skills 2.0 | 每次执行后 A/B 测试 + eval 自动调优 SKILL.md | Medium |
| Binary Evals + Self-Improving Loop | 二元（pass/fail）评估器，failure case 自动触发改 Skill | MindStudio (2026-03) |
| Singularity Claude | 开源 self-evolving skill engine，支持 auto / manual 两种评分 | Shmayro/singularity-claude |
| Cognee | 把执行 trace 喂给知识图谱，从失败案例归纳新规则反写 SKILL.md | Cognee Self-Improving Skills |
| AGENTS.md 元指令法 | 在 SKILL.md 嵌"调试后请自更新本文件"的元指令 | LinkedIn 案例 |
| RL + Skill Library | 强化学习训 Agent 自主管理 Skill 库（增/删/改） | arXiv 2512.17102 |

### 7.3 穷人版落地

不需要复杂基建的三步走：

1. SKILL.md 末尾加元指令：
```markdown

## 自我进化机制
每次执行完本 Skill 后：
1. 评估输出是否达成目标（pass / fail）
2. fail 时反思失败原因，在 diary/YYYY-MM-DD.md 追加「失败案例 + 修复建议」
3. 某条修复建议在最近 3 次执行中被反复提及时，提炼为正式规则，提交 PR 修改本 SKILL.md
```

2. 配 `scripts/log-execution.py`：每次触发自动记录 prompt + 输出 + 用户反馈到 JSONL
3. 用 skill-creator eval 做兜底：自我修改后必须通过既有回归用例才能 commit

⚠️ **风险警示**：没有 eval 兜底的自我修改 = **慢性自杀**。务必配套 binary eval + 版本快照 + 关键节点人工 review。

---

## 八、一站式 Skill 开发助手

**skill-dev-aio** 是一站式 Skill 开发助手，打通从创建到发布的完整闭环。

**核心功能**：快速创建 Skill / 一键发布 / 优跑分 / 检查询 / 跨平台迁移 / 批更新

---

## 深度分析

### 1. Skill 的本质是「结构化指令文档」，而非代码

Skill 的核心价值不在于代码本身，而在于对 AI Agent 的「触发条件、执行步骤、工具选择、输出规范」进行结构化描述。这与传统的「工具/插件」思维有本质区别——Skill 更接近 SOP（标准作业程序），是给 AI 看的操作手册。

### 2. 三级加载机制是控制上下文消耗的关键设计

Skill 采用渐进式加载策略，而非一次性将所有内容塞入上下文。这种设计解决了「丰富 Skill 内容」与「耗尽 Agent 上下文窗口」之间的根本矛盾。开发者在编写 SKILL.md 时需要主动考虑分层加载，而不是堆砌文档。

### 3. 跨平台一致性是 Skill 开发的核心痛点

文章揭示了三种主要「污染」：平台语法污染（@、/、! 触发符）、工具命名污染（不同平台工具名不同）、路径环境污染（硬编码平台特定路径）。应对方案是「写作期三纯净 + 注释隔离 + 发布期三检测」，本质是将确定性逻辑下沉到跨平台的 `scripts/`。

### 4. 自我进化机制将 Skill 从「静态文档」变为「动态系统」

文章提出了 4 步反馈闭环（执行 → Binary Eval → Reflection Agent → 复测 → git commit），并列举了 Claude Skills 2.0、Binary Evals + Self-Improving Loop、Singularity Claude 等多种实现路径。关键洞察是：没有 eval 兜底的自我修改是「慢性自杀」，必须配套二元评估器 + 版本快照 + 人工 review。

### 5. 开发效率瓶颈在于「修改-验证」循环过长

文章指出常见反模式：改一行 SKILL.md 需要「告诉 Agent 重新加载 → 手动重启会话 → 复测」，单次迭代 5-10 分钟。解决方案是 Hot Reload + Symlink 软链 + Local Dev Loop 模板，将迭代周期压到 30 秒以内。

## 实践启示

1. **description 字段要写得「稍微积极」**：Agent 目前倾向于「少触发」而非「多触发」，description 中多列举触发关键词和场景，能显著提升 Skill 的激活率。

2. **SKILL.md 正文控制在 500 行以内**：超出时拆到 `references/` 按需加载。这既是对 Agent 上下文的保护，也是对开发者「精简指令」能力的考验。

3. **确定性逻辑全部下沉到 `scripts/`**：用 Python/Node.js/Shell 封装的脚本天然跨平台，比在 SKILL.md 中写平台特定指令更可靠。脚本输出 JSON 到 stdout，明确退出码。

4. **发布前至少在 2 个目标平台冒烟测试**：跨平台一致性无法仅通过代码审查保证，必须实际跑一遍。配合作业期「三纯净」原则，能大幅减少平台兼容性问题。

5. **建立 Skill 的版本管理和灰度发布机制**：显式标注 semantic version，支持 beta/stable channel，团队级锁版本（pin commit SHA）。避免已安装用户无法感知更新的问题。

6. **description 三层结构**：做什么（功能）+ 什么时候用（触发场景）+ 什么词触发（关键词）。好 description 的反面不是「没有 description」，而是「把 description 写成说明书」。

7. **自我进化要配 eval 兜底**：没有 binary eval 的自我修改是慢性自杀。穷人版也可以：diary 记录 + 3 次触发提炼规则 + PR review。

## 相关链接

- [skills.sh](https://www.skills.sh/)
- [ClawHub](https://clawhub.ai/skills)
- [SkillsMP](https://skillsmp.com/)
- [Claude Agent Skills Overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Agent Skills IO](https://agentskills.io/)

## 相关实体

- [Anthropic 官方 14 种 Skill 设计模式](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-design-patterns-anthropic.md)
- [Skill 设计模式](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-design-patterns.md)
- [从Vibe Coding到Agentic Engineering：重构后台开发全流程 — 腾讯技术工程](https://github.com/QianJinGuo/wiki/blob/main/entities/tencent-vibe-coding-to-agentic-engineering-backend.md)
- [Skills 详解：拆一个技能，看 Anthropic 和 OpenAI 的思路差异](https://github.com/QianJinGuo/wiki/blob/main/entities/skills-anthropic-openai-comparison-frontend-design.md)
- [Claude Design 系统提示词 → web-design-engineer Skill](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-design-skill.md)

---

## Ch07.009 StarAgent/Drogo WebTerminal CLI：阿里基础设施把 WebTerminal 变成 Agent 手脚（CLI 才是 Skill 的执行面）

> 📊 Level ⭐⭐ | 20.0KB | `entities/staragent-webterminal-cli-ali-infra-cli-as-agent-hands.md`

# StarAgent/Drogo WebTerminal CLI：阿里基础设施把 WebTerminal 变成 Agent 手脚

## Overview

阿里基础设施团队（阿里妹导读，2026-06-01）发布的工程实践：**StarAgent/Drogo WebTerminal CLI**（仓库 `foundation_models/webterminal-cli`）。把企业内部 WebTerminal 抽象成稳定的 CLI 执行面 `wt` + `wsh` + `wcp`，让 Agent 远程排障不再"隔着 DOM 猜命"。

> **核心论点**：
> - **Skill 不是法器、不是咒语**——本质是说明书（"先拧这个、再接那个、别把手伸进风扇里"）
> - **CLI 才是手脚**——把老师傅手感、群里口口相传、网页点点点全部压进 `wt` 这种可执行接口
> - **授权留在浏览器，执行交给 CLI**——不绕过治理链路，又给 Agent 稳定接口

## 4 层职责分离

| 层次 | 职责 | 不做什么 |
|------|------|----------|
| **WebTerminal 页面** | 登录、角色选择、审计、心跳、官方连接链路 | 不承载任务逻辑 |
| **`wt` CLI** | 会话复用、命令发送、输出捕获、文件 API、交互控制面 | 不内置具体排障 suite |
| **Skill** | 描述操作方法、风险边界、推荐命令模板 | 不绑定某个 IP 或某个案例 |
| **Agent** | 动态规划、执行、观察、复盘 | 不绕过授权链路 |

> **一句话**：CLI 提供稳定手脚，Skill 提供行动章法，Agent 负责临场判断。**别把 Agent 当高级 crontab 用，它会委屈，我们也亏。**

## 黑屏模式更新（wsh/wcp）

**新增 `wsh` / `wcp`**，让 WebTerminal 像 SSH/SCP 一样用：

```bash
# 浏览器登录一次，后续复用 cookie cache
./bin/wt auth login --target-ip x.y.z.w
# 黑屏进 shell
./bin/wsh x.y.z.w
# 远程命令执行
./bin/wsh x.y.z.w -- 'hostname; pwd'
# 上传
./bin/wcp /tmp/x.txt x.y.z.w:/tmp/x.txt --force
# 下载
./bin/wcp x.y.z.w:/tmp/x.txt /tmp/x.down.txt --force
```

### 3 个关键体验提升

1. **认证复用**：浏览器登录一次 → cookie 缓存（`~/.drogo-webterminal-helper/direct/default.auth.json`）→ 后续直接复用
2. **shell 正常**：`exit` 不卡死；远端 EOF/closed/reset 正确退出；本地 terminal 的 rows/cols 同步
3. **浏览器模式保留兜底**：`wtsh/wtcp --transport browser` 仍可用

### 遗憾

> 纯黑屏登录**暂时没有硬上**。阿里 SSO 的 HTTP 登录链路会进入 RSA、风控、账号安全检查，**继续硬怼收益不高**。当前最稳的路线：**浏览器负责合规授权，真正干活走黑屏 shell**。不算 100 分的"全黑屏"，但**已经把最高频、最烦、最容易误操作的部分从网页里拽出来了**。

## 会话设计：复用已登录浏览器上下文

企业内部 WebTerminal **不是裸 SSH**——背后有 SSO、角色、审批、审计、心跳、跳板、容器选择。**全部重写进 CLI 不现实**。

`wt session start` 的设计：
- 启动或复用**持久 Chromium**
- 会话仍由官方 WebTerminal 页面建立
- 用户完成登录后，**CLI 只复用页面里已经存在的终端实例**

### 4 个直接收益

- 授权、审计、心跳**仍走官方页面链路**
- CLI **不保存 SSO token**，不绕过登录流程
- 目标 IP **是参数**，不会写死在实现里
- 多轮排障可以**共享同一个远端 shell 状态**

实现：CLI 从页面里读取 `window.terminalMap[wsSessionId]` 对应的终端实例，使用页面暴露的 `writeMsg2Session(data)` 发送输入，**同时 hook xterm 输出做本地捕获**。

## 命令执行：动态闭环而非固定 suite

`wt run` 在远端命令后追加**唯一 marker** 识别完成：

```bash
printf '\n__WT_DONE___:%s\n' "$?"
```

> 这比单纯依赖 prompt 更稳，因为远端 prompt 可能被用户配置、conda 环境、容器 shell、颜色控制字符影响。

### 三份证据文件

| 文件 | 内容 | 用途 |
|------|------|------|
| `*.raw.log` | 原始 ANSI 输出 | 保留完整现场 |
| `*.plain` | 去 ANSI 后文本 | Agent 解析 |
| `*.snapshot.json` | xterm buffer 快照 | 排查全屏程序 |

> 不再是"我刚刚屏幕上好像看见了"，而是"**证据在这，别耍赖**"。

## 文件传输：协议化，告别 DOM 自动化

### 5 个文件 API

- `openFileSystem`
- `listFiles`
- `getDownloadFileHead`
- `downloadFile`
- `uploadFile`
- `heartbeat`

### 下载路径

> 先拿文件 head（`fileUuid`、分块数、总大小、md5）→ 再按 block 下载 → 最后校验 **size/md5**，并可选通过远端 `sha256sum`/`stat` 二次校验。

### 上传路径

> 先初始化上传（带文件大小和 md5）→ 再按 **1MB block** 发送 multipart → 最后同样用远端 sha256/stat 验证。

> 能协议化就协议化，少点玄学，多点 checksum。"下载完成"四个字，在没有校验之前，**只是一句祝福**。

## 交互式调试：默认接口应该像普通 shell

远程排障最难抽象的是**交互式程序**——gdb、pdb、less、emacs、vim。**不是"一条命令一个结果"**的模型。

最初的 `interact` 是 expect 风格：所有步骤一次性传进去。用户一句"这好像不是交互式吧？"直接打回现实。

> 真正调试时，下一条命令取决于上一条输出：
> - `bt` 看到崩溃栈，才知道要进哪个 frame
> - `info locals` 看到变量，才知道要 print 哪个字段
> - gdb 缺符号、core 文件异常、路径不对，都需要临时调整
> - 对 emacs 这类全屏程序，**需要发送 raw key**，而不是 line command

### HTTP 控制面（默认）

`wt interact` 启动**本地 HTTP server**：

| Endpoint | 用途 |
|----------|------|
| `GET /health` | 查看交互会话是否存活 |
| `GET /summary` | 查看完整步骤摘要 |
| `GET /snapshot` | 获取 xterm 屏幕快照 |
| `POST /command` | 发送一行命令，按 prompt regex 等待结果 |
| `POST /send` | 发送 raw keys，适合 emacs/vim/TUI |
| `POST /drain` | 读取当前缓冲输出 |
| `POST /close` | 退出远端交互程序并关闭本地 server |

### 状态保持

> **远端程序只启动一次，状态在多次 HTTP 请求之间保持**。gdb 的 `$x`、当前 frame、breakpoint、Emacs buffer，**都不能每请求一次就失忆**。否则不是交互，是每次重启式自动化。

### Playwright 单线程教训

> **Playwright sync API 不能跨线程调用**。最初用了 `ThreadingHTTPServer`，结果请求进入不同线程后触发 greenlet thread switch 问题。最后改成**单线程 `HTTPServer`**，用锁保护 session 操作。

> 对这个使用场景来说，Agent 本来就是顺序调试，**单线程反而更符合模型**。不是所有并发都高级，有些并发只负责把你送走。

## 验收案例：Emacs + eshell + gdb + coredump

完整流程（**同一个 WebTerminal 会话**）：

1. `wt interact` 启动远端 `emacs -nw -Q`
2. `/send` 发送 `C-x C-f /tmp/wt-emacs-crash.c`
3. `/send` 插入 C 源码并 `C-x C-s` 保存
4. `/send` 执行 `M-x eshell`
5. 在 eshell 里编译运行，触发 **segmentation fault**
6. 生成 `core.wtdebug`
7. 在 eshell 里启动 `gdb -q ./wt-emacs-crash core.wtdebug`
8. 发送 `bt` / `frame 0` / `info locals` / `print item.id` / `print item.name`

**GDB 真在 core 上说话**：

```
Program terminated with signal SIGSEGV, Segmentation fault.
#0  0x0000000000401168 in crash (n=7) at /tmp/wt-emacs-crash.c:12
12        return *ptr + item.id + n;
```

**最终定位**：`ptr = 0x0`，第 12 行 `return *ptr + item.id + n;` 对空指针解引用导致 coredump。**凶手就是它，证据链闭合**。

## GPU hang 现场

| 维度 | 现场 |
|------|------|
| 机器 | hippo-xyzw |
| Kernel | 5.10.134-010.ali5000.al8.x86_64 |
| Driver | 580.82.07 |
| CUDA | 13.0 |
| GPU | 8 x NVIDIA H20 |

**采集时** GPU compute processes 为空，8 张卡利用率 0%，显存基础占用。**当前没 active GPU hang**。

**但 kernel log 里有历史信号**：
- 反复出现 `NVRM: refcntRequestReference_IMPL: Failed to enter state 1 ... status: 0x00000056`
- NVSwitch 曾出现 `SXid 22013` 非致命链路中断
- 5 月 8 日有一次 `Xid 43`，进程名为 `python`
- 另有一次 memcg OOM

> **机器当场没 hang，不代表历史上没"作过妖"**。排障不是法术，不要没病也上猛药。

## 6 个可复用工程模式

1. **先抽象执行面，再沉淀场景**——别问"能不能做一个 GPU hang 按钮"，按钮救不了复杂现场
2. **授权和执行要解耦**——授权交给官方页面，执行通过 CLI 暴露
3. **输出必须可保存、可解析、可复盘**——raw/plain/snapshot 三份证据
4. **Skill 应该写边界和方法**——不把所有业务逻辑变成代码。**Skill 是路线图，不是把每一步都焊死的轨道**
5. **交互式程序要按状态机设计**——保留远端进程状态，允许多轮输入输出
6. **文件传输要协议化**——能走 API 就不要点 DOM；能校验 checksum 就不要只相信"下载完成"

## 11 个 CLI 子命令

| 命令 | 功能 |
|------|------|
| `wt session` | 管理持久 WebTerminal 浏览器会话 |
| `wt status` | 查看当前终端状态 |
| `wt run` | 执行一条 shell 命令并捕获输出 |
| `wt attach` | 本地 raw TTY 直接接入 WebTerminal |
| `wt interact` | 启动 live HTTP 交互控制面 |
| `wt interact-script` | 执行固定 expect 风格交互脚本 |
| `wt snapshot` | 获取 xterm buffer 快照 |
| `wt ls-files` | 通过 WebTerminal 文件 API 列目录 |
| `wt download` | 通过 WebTerminal 文件 API 下载文件 |
| `wt upload` | 通过 WebTerminal 文件 API 上传文件 |
| `wt direct-info` | 输出脱敏后的直连协议材料，便于实验 |

## 设计取舍

### 为什么不直接连 SSH

> 真实企业环境里，**WebTerminal 不是 SSH 的薄壳**——承载授权、审计、角色、心跳和访问入口。直接 SSH 可能绕过既有治理链路。为了一点方便把治理链路打穿，**这种"聪明"通常会在复盘会上收费**。

### 为什么不把 GPU hang 做成内置命令

> GPU hang 的**现场差异很大**。固定 suite 很容易把 Agent 限制成"报告生成器"。CLI 内置的是**能力**（运行命令、捕获证据、交互调试、传输文件），**场景方法放在 Skill**。

### 为什么交互控制面用 HTTP

> HTTP 简单、可调试、Agent 容易调用。一个 `curl` 就能发下一条命令，**response 就是观察结果**。相比把所有调试命令预先写成脚本，**HTTP 更接近 ReAct loop**。**简单不是土，简单是线上能救命。**

### 为什么保留 `interact-script`

> 固定 expect 脚本**仍然有价值**——smoke test、固定初始化流程、可重复 demo。**能背稿的场合用脚本，真打架的时候要能临场发挥**。

## 与已有实体的关系

本文是 **"Agent 远程执行能力"** 的工程化实现：

- [CLI / MCP / SDK 选型](https://github.com/QianJinGuo/wiki/blob/main/entities/cli-mcp-sdk-agent-tool-selection.md) — 工具原语选择（理论层）
- [AgentCore OpenClaw 多租户](https://github.com/QianJinGuo/wiki/blob/main/entities/using-amazon-bedrock-agentcore-openclaw-multi-2.md) — AWS 视角的远程 Agent
- [OpenClaw Security 部署](https://github.com/QianJinGuo/wiki/blob/main/entities/enterprise-openclaw-security-deploy-architecture-guide.md) — OpenClaw 安全部署
- [DIPG](https://github.com/QianJinGuo/wiki/blob/main/entities/dipg-ant-insurance-host-research-verify-offline-closed-loop.md) — 蚂蚁保险 verify 闭环（也是 Agent 远程任务）
- [250 行 CLI Agent 教程](https://github.com/QianJinGuo/wiki/blob/main/entities/minimal-cli-agent-250-line-python-ollama-7-stages.md) — minimal 教学

本文的独特贡献：
- **WebTerminal 而非 SSH**——企业内部治理链路的现实选择
- **HTTP 控制面而非 expect 脚本**——保留远端状态的多轮交互
- **3 份证据文件**——raw/plain/snapshot
- **6 个可复用工程模式**——具体可迁移的工程化经验

## 招聘

阿里基础设施团队招 AI 推理 + 高性能计算方向（LLM 推理系统工程、GPU/异构计算、性能研发、多模态推理引擎）。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/staragent-webterminal-cli-ali-infra-cli-as-agent-hands.md)

## 深度分析

### 1. 执行面抽象的分层价值

本文展示了清晰的 **Layered Architecture**：WebTerminal 页面负责人类授权（合规链路的最后一步），`wt` CLI 负责稳定执行面（可编程的命令/文件/交互原语），Skill 负责操作规约（不绑定具体 IP 或案例），Agent 负责动态决策。这种分离的核心价值在于：授权链路不被穿透，但执行能力完整释放给 Agent。

### 2. HTTP 控制面对 ReAct 范式的原生适配

从 expect 风格固定脚本到 HTTP 控制面的转变，在架构层面意义深远。每个 HTTP 请求-响应对天然映射一个 ReAct 步骤：observe（GET /snapshot、GET /summary）→ reason → act（POST /command、POST /send）。这避免了预制脚本的脆弱性，允许 Agent 在每个步骤根据前序输出做分支判断。服务端保持 gdb 断点、emacs buffer 等跨请求状态，对多轮调试至关重要。

### 3. 三份证据文件的证据链意义

raw/plain/snapshot 三层文件体系，直击 Agent 远程执行的一个根本问题：**结论缺乏可查证的证据链**。当 Agent 报告"GPU 未 hang"时，有 dmesg 日志、nvidia-smi 输出和 xterm 快照构成的证据链才能让人审计。这把 Agent 的结论从黑箱判定变成可质疑、可确认的透明发现。raw（完整保真）和 plain（可解析文本）的区分服务于不同消费者——人需要颜色和格式上下文，Agent 需要结构化文本。

### 4. 黑屏模式对安全治理的务实妥协

浏览器登录 + cookie 缓存的黑屏模式，本质上是**对安全治理边界的务实妥协**：合规授权由浏览器负责（SSO、风控、RSA），实际执行由 CLI 负责（无头 shell）。这种妥协的逻辑是企业安全改造的真实路径——不追求一步到位的全自动化，而是在保留合规链路的前提下最大化执行效率。

### 5. Skill 与 CLI 的边界划分原则

Skill 写边界和方法、不写死业务逻辑；CLI 提供稳定能力原语、不内置具体诊断 suite。这一边界划分的工程意义在于：**新增一个"Java 线程栈分析"或"磁盘 IO hang 分析"场景，改 Skill 而不改 CLI**。否则每加一个场景都发版，迟早变成"工具平台版祖传单体"。

## 实践启示

### 1. 优先构建执行面原语，而非场景化固定 suite

当团队需要让 Agent 具备远程排障能力时，应该先问"Agent 能否稳定地执行命令、捕获输出、传输文件、进行交互"，而不是问"能否做一个 GPU hang 按钮"。前者是可复用原语，后者是场景绑定。**[GDB]**、**nvidia-smi**、**dmesg** 等工具是通用原语，固定 suite 反而限制 Agent 的动态判断空间。

### 2. 为 Agent 生成的每个结论配套可查证的证据

当 Agent 输出分析结论时，必须同时输出对应的原始命令输出（dmesg 日志、进程列表、文件内容等）。**只输出结论不输出证据的 Agent，线上等于裸奔**。证据文件要可存储、可解析、可复盘，这是 Agent 与运维人员协作的基本信任基础设施。

### 3. 文件传输必须包含校验层

文件上传下载不只是"数据搬移"，而是要有 **md5/size 校验 + 可选 sha256 二次确认**。下载完成不是结束，校验完成才是结束。这一原则在 Agent 自动处理敏感配置文件（如 GPU 驱动、kernel core 文件）时尤为重要——传输损坏的 core 文件比没有文件更危险。

### 4. 交互式调试场景默认采用 HTTP 控制面

对于 **gdb/pdb/emacs** 这类需要多轮输入输出、状态必须跨请求保持的交互式程序，应优先使用 HTTP 控制面而非 expect 脚本。HTTP 天然支持 ReAct 循环（发送命令 → 读取响应 → 决定下一步），而 expect 脚本在复杂分支和动态调整面前几乎是不可维护的。**[Playwright 单线程 HTTPServer]** 的实现表明，单线程顺序调试模型与 Agent 的推理模式高度匹配。

### 5. 把运维经验转化为 Skill，而非固化为代码

团队积累的排障经验（GPU hang 怎么查、coredump 怎么跟、emacs 怎么进 eshell）应该以 Skill（操作规约文档）的形式独立维护，而不是全部写进 CLI 代码。**Skill 是知识，CLI 是能力**。知识迭代频率远高于能力迭代频率，两者混在一起会让工具陷入"每加一个场景就发一次版"的困境。

---

## Ch07.010 ai-skill-evolution底层逻辑

> 📊 Level ⭐⭐ | 19.7KB | `entities/ai-skill-evolution底层逻辑.md`

[Ai Skill Evolution底层逻辑](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ai-skill-evolution底层逻辑.md)

# 01—为什么你的 AI Skill 上线即翻车？一文搞懂 AI Skill 测评的底层逻辑
系列：AI Skill 测评体系从零到一（一）
难度：入门
适合读者：AI 产品经理、Prompt 工程师、对 LLM 应用质量感兴趣的开发者
📌 一句话摘要：花两周写好的 AI Skill 上线就出 bug？本文拆解 AI Skill 测评的 3 个核心设计，帮你在发布前发现负向增益、随机失效、自判卷偏差这三类隐藏问题。
🏷️ 推荐标签：AI Skill 测评 LLM 应用质量 Prompt 工程师 AI Agent 测试

## 你有没有遇到过这种情况
你花了两周时间写了一个 AI 报销助手，规则写得很详细：

- 日常报销走这个流程
- 差旅报销走那个流程
- 发票识别失败要降级处理
- 金额超标要自动扣减
上线第一天，用户反馈：「我说帮我报销，它问我要发票；我发了发票，它说不支持这种格式；我换了格式，它直接帮我提交了——但我只是想保存草稿！」
更隐蔽的情况是：换一位同事用同样的发票重新触发，这次它又正常工作了。
问题出在哪？规则写了，但没有系统地验证规则是否真的被执行了，也没有验证执行结果是否稳定。**这就是 AI Skill 测评要解决的问题。**

## 什么是 AI Skill
**AI Skill 是一种以 Markdown 编写的「给模型看的说明书」，是 LLM 应用质量的核心载体。** 它告诉大模型在特定场景下该怎么做，模型读懂了才能按规则执行；模型没读懂，规则就形同虚设。
```
用户说「帮我报销」
    ↓
模型读取 SKILL.md（报销规则文档）
    ↓
按规则调用 MCP 接口（查询报销人信息、上传发票、保存草稿...）
    ↓
输出报销草稿给用户
```
> **MCP（Model Context Protocol）**：Anthropic 主导推动、目前已有广泛开源生态支持的行业开放协议，用于让 AI 模型安全、标准化地调用外部工具和接口。
Skill 的核心是 `SKILL.md`，里面包含：

- **触发条件**：什么情况下使用这个 Skill（如：用户说了「报销」「发票」等关键词）
- **业务规则**：具体怎么做，有哪些约束（如：草稿状态固定为 `docStatus=10`，传其他值会导致接口报错）
- **接口调用**：调用哪些工具，参数怎么传
- **异常处理**：出错了怎么办
Skill 不是代码，是「给模型看的说明书」。模型读懂了才能按规则执行；模型没读懂，规则就形同虚设。

## 为什么 Skill 需要专门的测评
**AI Skill 需要专门测评，是因为它有三个传统软件测试根本覆盖不了的结构性问题：自判卷偏差、随机性、负向增益。** 传统软件测试的逻辑是：给定输入 → 执行代码 → 验证输出。代码是确定性的，同样的输入永远产生同样的输出。但 AI Skill 不一样。

### 问题一：自判卷偏差
- 传统测试：代码执行 → 断言框架验证（执行者和验证者完全分离）
- AI Skill 测试（如果不设计好）：模型执行 Skill → **同一个模型**判断结果是否正确
这就像让学生自己批改自己的试卷。模型倾向于认为自己做对了，即使实际上规则没有被正确执行。在实际测评实践中这个问题很明显：同一个用例，模型执行完后自己评审，证据（evidence）字段经常是空的，或者只写「根据整体输出判断通过」——这不是评审，是走形式。

### 问题二：随机性
同一个 prompt，今天运行通过，明天运行失败。这不是 bug，是大模型的本质特性——采样温度（temperature）大于 0，导致每次生成略有差异。
单次测试的结论不可靠。需要多次运行，用统计方法描述 Skill 的真实表现。例如：「通过率 87% ± 5%」（正负号表示误差范围）比「通过了」提供的信息量大得多。

### 问题三：负向增益
这是最隐蔽的问题。
> 【数据来源说明】 以下数据来自本文作者团队针对企业级 AI Skill 落地场景的自研测试研究（以下简称 SkillsBench），共选取 86 个 LLM 应用任务（覆盖报销、审批、文档处理等场景），有效计算增益对比 84 个。
在该研究中：**84 个有效任务里，16 个（约 19%）加了 Skill 反而比没加更差。**
原因可能是：

- Skill 的规则过于死板，限制了模型本来能做好的灵活性
- Skill 的指令和模型的默认行为冲突，模型「不知道该听谁的」
- Skill 文档太长太复杂，模型「选择性忽略」了部分规则
如果你只测「加了 Skill 之后能不能跑通」，永远发现不了这个问题。你需要同时测「没有 Skill 时模型表现如何」，然后对比增益差值（Δ，读作 delta）= 有 Skill 时通过率 − 无 Skill 时通过率。**Δ 为负就是发布红线**，说明这个 Skill 在某些场景帮了倒忙。

## AI Skill 测评的三个核心设计
针对以上三个问题，AI Skill 测评各有一个对应的工程设计：执行者与评审者分离、多次运行取均值、有 Skill vs 无 Skill 对比。 这三个设计是整个测评体系的骨架，缺一不可。

### 1. 执行者和评审者分离（解决自判卷偏差）
执行 Skill 的 Agent 和评审结果的 Agent 完全独立，运行在不同的上下文中。评审 Agent 必须引用原文证据，不能凭感觉判断。

### 2. 多次运行取均值（解决随机性）
标准模式（standard）下每个用例运行 3 次，计算通过率的均值和标准差（standard deviation，衡量多次结果之间的波动幅度）。标准差 > 0.3 说明结果高度不稳定，通常意味着 prompt 存在歧义或 Skill 规则有冲突。

### 3. 有 Skill vs 无 Skill 对比（解决负向增益）
每个用例同时跑两个版本：

- **with_skill**：加载 Skill 指令，模型按规则执行
- **without_skill**：不加载任何 Skill，纯模型通用能力
计算增益 Δ = with_skill 通过率 − without_skill 通过率。Δ < 0 立即触发预警，必须查明根因再决定是否上线。

## 一个真实的踩坑案例
报销助手落地过程中最高频的坑，是模型跳过「保存草稿」步骤直接输出「报销完成」——而这个问题用传统测试根本发现不了。
原因：SKILL.md 里写的是「最终调用 saveExpenseDoc 保存草稿」，但没有明确约束「docStatus 参数必须固定为 "10"」。模型自行推断参数值，有时传了 "20"（提交审批），直接提交了用户根本没有核对过的单据。
修复方式：在规则里补一句「docStatus 固定为 "10"，对应草稿状态，传其他值会导致单据直接进入审批流，不可撤回」——加上「为什么」之后，模型正确执行概率显著提升。
这个坑用传统测试发现不了（因为接口本身没有报错），只有设计针对「docStatus 参数值校验」的专项断言才能检测到。

## 一个完整的测评流程长什么样
一套完整的 AI Skill 测评流程共分七个阶段，其中六个阶段由 AI 自动完成，人工只需在信息收集、用例确认、发布决策三个关键节点介入。
【工具说明】 SkillSentry 是本文作者自研的 AI Skill 测评工具（非商用产品，仅作技术探讨），本身也是一个运行在 OpenCode 中的 AI Skill。

- **阶段零**：AI 读取被测 Skill，提炼规则清单 + 检测 Skill 类型 ← AI 自动
- **阶段一**：触发率预评估（AI 模拟）+ 收集必填信息 ← AI 自动估算，人工提供账号/数据
- **阶段二**：风险定级 + 选择测评模式 ← AI 定级，人工选模式
- **阶段三**：AI 设计测试用例，展示清单 ← 人工确认后继续
- **阶段四**：分批执行（有 Skill / 无 Skill 并行，自动选执行模式）← AI 自动执行
- **阶段五**：AI 汇总评分，计算各项指标（含触发率估算、效率指标）← AI 自动
- **阶段六**：生成 HTML 报告，给出发布决策 ← AI 产出，人工决策
橙色节点 = 需要人工介入的环节。

## 深度分析
### 自判卷偏差的深层机制
自判卷偏差的本质是**评审者与执行者共享同一套推理过程**，导致评审时无法真正独立验证。模型在执行 Skill 时已经生成了「这样做是对的」的内部信念，评审时这套信念会自动影响判断结果，形成确认偏误（confirmation bias）。这在心理学和认知科学中被称为「自我服务偏差」——个体倾向于收集支持自己观点的证据，忽略否定证据。
在工程层面，这表现为两种具体形态：
1. **证据空洞化**：评审 Agent 被要求提供「引用原文的证据」，但因为执行和评审共享上下文，评审时原文已经在上下文中，模型会把「上下文中出现过」误认为「证据充分」。
2. **阈值漂移**：模型对自己的容错度比对外部验证者更高。「差不多对了」在执行者眼中可能等于「完全正确」，但外部评审者会要求逐字逐句的精确匹配。
解决方案（执行/评审分离）的有效性在于：**隔离上下文强制切断共享信念传导路径**。评审 Agent 从零开始，只能依赖传入的输出结果和 Skill 原文，无法调用执行过程中的中间推理。

### 随机性的统计本质
大模型的随机性不是「不稳定」，而是**服从一定分布的采样过程**。temperature > 0 时，每次推理实际上是从模型学习到的条件概率分布中采样。这意味着单次结果只是该分布的一次实现，单次通过不等于「能力到位」，单次失败也不等于「能力缺失」。
统计学对这一问题的处理方式是用**置信区间**替代点估计：

- 传统报告：「通过」（点估计，非此即彼）
- 概率性报告：「通过率 87% ± 5%」（区间估计，包含不确定性信息）
标准差的阈值设定（> 0.3 为高度不稳定）背后隐含的逻辑是：在 3 次运行的样本量下，标准差 > 0.3 对应的变异系数（CV = 标准差/均值）已经大到说明模型行为在不同采样间存在质的差异，而不是量的波动。这种情况下「均值」本身已经没有意义——你需要先解决稳定性问题。

### 负向增益的结构性根因
负向增益（Δ < 0）之所以比直接失败更难发现，根源在于它违反了一个隐含假设：**「加了 Skill」这个动作本身应当至少是中性的，不应当使情况变差**。传统测试的逻辑不包含「退化」这一分支，所以当退化发生时，系统没有触发任何预警机制。
三个根因的深层分析：
**规则过于死板**：Skill 试图将一个本来有弹性的任务强制压缩到精确规则中。但大模型的优势恰恰在于灵活性和泛化能力。当 Skill 规则限制了模型的灵活操作空间，同时规则本身又不是完全覆盖所有场景时，模型被「夹在」规则约束和真实需求之间，选择了错误的行为。
**指令冲突**：LLM 的预训练过程中已经学会了某些任务的最优行为模式。当 Skill 的指令与模型内在偏好（intrinsic preference）冲突时，模型需要在「遵循 Skill 指令」和「遵循内在偏好」之间做出选择。如果 Skill 指令的约束力不够强（比如用词模糊、优先级不明确），模型倾向于选择自己更熟悉的路径。
**文档过长**：LLM 的注意力机制虽然强大，但存在「远处文档权重稀释」问题。当 Skill 文档超过一定长度，关键规则可能被稀释在大量次要信息中，模型在长程推理中丢失对关键约束的记忆。

### Δ 阈值作为硬性红线的合理性
「Δ < 0 是硬性红线」这一设计背后的逻辑是：**Skill 的价值主张是「提升」而非「维持」**。如果一个 Skill 无法让模型在它本来就能处理的任务上表现得更好，那为什么要引入额外的复杂性、运维成本和故障面？
一个 Skill 上线意味着：维护成本增加、规则冲突风险增加、模型在某些场景下的行为变得更难预测。如果增益不显著为正（Δ > 0），这些成本完全没有理由被接受。

## 实践启示
### 1. 设计 Skill 时的「最小规则」原则
Skill 规则只写「必须约束」的部分，不写「可以推断」的部分。规则越少，被模型选择性忽略的风险越低。每个规则都应附带「为什么」——不只是描述行为，还要描述原因，这能显著提升模型对约束的遵循率（参考 docStatus 案例）。

### 2. 测评前置，而不是测评后置
很多团队在 Skill 上线之后才做测评，这时已经晚了。正确的做法是：**Skill 测评应该在 Skill 第一次被模型执行时就触发**，而不是等 Skill 「完成」了再测。测评和开发应当交织进行：写一条规则 → 立即测评 → 验证有效后再写下一条。

### 3. 关注标准差，不只是均值
通过率数字会骗人。87% 通过率 + 0.3 标准差意味着同一个 Skill 在不同运行间的表现可能从 60% 到 100% 不等。在做发布决策时，**标准差比均值更重要**——一个平均但稳定的 Skill 比一个平均但不稳定的 Skill 更值得上线。

### 4. Δ 为负时的根因分析流程
当 Δ < 0 时，不要急于删除 Skill。按以下顺序排查：
1. 对比 with_skill 和 without_skill 的具体失败模式——是 Skill 让模型在某个子步骤上变得更差，还是整个任务都变差了？
2. 检查 Skill 规则中是否存在指令冲突（与模型内在偏好冲突的规则）
3. 评估 Skill 规则是否过于死板，限制了模型本来能灵活处理的边界情况
4. 考虑是否为 Skill 增加「例外条款」，让模型在特定条件下绕过 Skill 规则
只有在查明根因之后，才能判断是应该修改 Skill 规则、缩减 Skill 覆盖范围，还是直接废弃这个 Skill。

### 5. 评审 Prompt 必须「强制引用」
在设计评审 Agent 的 Prompt 时，必须包含强制引用（forced citation）要求：评审结论的每个判断点都必须引用 SKILL.md 的具体原文段落。没有引用原文的判断视为无效评审。这不是锦上添花，是防止自判卷偏差的最后一道防线。

## 小结
| 维度 | 传统软件测试 | AI Skill 测评 |
|------|------------|--------------|
| 输出特性 | 确定性，同输入同输出 | 概率性，需多次运行取均值 |
| 执行方式 | 代码执行 | 模型推理，规则可能被忽略 |
| 结果验证 | 断言框架直接比较 | 需独立 Agent 评审，防自判卷 |
| 测评目标 | 能不能跑通 | 还要测「加了有没有帮助」（Δ） |
下一篇，我们来看 AI Skill 测评的指标体系——通过率、增益 Δ、指令遵循率这些数字到底代表什么，该怎么记忆。

## FAQ：关于 AI Skill 测评的常见问题
**Q：AI Skill 测评和传统软件测试有什么区别？**
传统软件测试针对的是确定性代码，同一个输入永远产生同一个输出，断言框架可以直接比较结果。AI Skill 测评面对的是概率性推理——大模型每次运行结果都可能略有不同，而且执行者（模型）和验证者如果是同一个模型，就会出现「自己批改自己试卷」的偏差。核心区别在于：AI Skill 测评必须同时解决随机性、自判卷偏差和负向增益这三个传统测试框架完全没有设计应对的问题。
**Q：什么是负向增益，为什么比失败更危险？**
负向增益指的是增益 Δ < 0，即加了 Skill 之后模型的表现反而比不加时更差。它比直接失败更危险，原因是它极度隐蔽——你只测「有 Skill 时能不能跑通」，结果可能是通过的，但你不知道没有 Skill 时模型本来表现得更好。在实际研究数据中，约 19% 的任务存在负向增益，常见原因是规则过于死板、指令与模型默认行为冲突。负向增益是发布红线，必须查明根因才能上线。
**Q：如何判断一个 AI Skill 是否可以上线？**
判断 Skill 能否上线，需要同时满足三条标准：一是通过率达到该风险等级的准入阈值（S 级关键场景要求 ≥ 95%）；二是增益 Δ > 0，确认 Skill 有正向价值而非帮倒忙；三是 IFR（指令遵循率）达标，S 级要求 100%。任何一条不满足都不应发布，其中 Δ < 0 是硬性红线，不接受「先上线再观察」。
**Q：AI Skill 测评需要哪些前提条件？**
在正式开跑测评之前，需要准备三类资产：测试账号（拥有对应权限，能触发 Skill 的目标流程）、测试数据（对应场景的发票、单据等，类型必须和测试用例匹配），以及对被测 Skill 的规则清单（测评工具可以自动从 SKILL.md 提炼，但人工确认一遍更准确）。如果测试资产不匹配，用例会进入 INCONCLUSIVE（无法验证）状态，不代表失败，但必须补充资产后重跑，不能忽略。
## 相关实体
- [Yidian Tianxia Context Engineering Agentic Ai](https://github.com/QianJinGuo/wiki/blob/main/entities/yidian-tianxia-context-engineering-agentic-ai.md)
- [Skill Formal Theory Survey 10Papers](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-formal-theory-survey-10papers.md)
- [Glm5 Scaling Pain Inference](https://github.com/QianJinGuo/wiki/blob/main/entities/glm5-scaling-pain-inference.md)
- [打造可靠的 Ai 编程环境Claude Code Hooks 完整开发者指南 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/打造可靠的-ai-编程环境claude-code-hooks-完整开发者指南-v2.md)
- [Gepa Optimize Anything](https://github.com/QianJinGuo/wiki/blob/main/entities/gepa-optimize-anything.md)

- [Auto Improving Agent Platform Ashpreetbedi Shensi](https://github.com/QianJinGuo/wiki/blob/main/entities/auto-improving-agent-platform-ashpreetbedi-shensi.md)
- [Hermes Skills Llm Wiki Self Improving Knowledge System](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-skills-llm-wiki-self-improving-knowledge-system.md)

---

## Ch07.011 我把 Claude Design 做成了 Skill，人人都能成为顶级网站设计师

> 📊 Level ⭐⭐ | 19.6KB | `entities/claude-design-skill-web-design-engineer.md`

[Claude Design Skill Web Design Engineer](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-design-skill-web-design-engineer.md)

# 我把 Claude Design 做成了 Skill，人人都能成为顶级网站设计师
> source: https://mp.weixin.qq.com/s/sffWcLKPkXob2STrhkYBYg
> author: ConardLi，code秘密花园
> date: 2026-04-22
> tags: #Claude #Agent #Skill #Prompt-Engineering #Web-Design #oklch

## 核心摘要
拆解 Claude Design 约 420 行系统提示词的设计理念，并将其提炼成 ~400 行的 web-design-engineer Skill。核心结论：Claude Design 的竞争力 = 50% Opus 4.7 模型能力 + 50% 精心设计的 Prompt Engineering。
---

## 一、Claude Design 核心洞察
### 产品定位
2026 年 4 月 17 日 Anthropic 发布，界面：左边聊天，右边画布。Figma 股价当天大跌。
**Ryan Mather（Anthropic 设计团队）的关键一句话**：
> "不要用对待画布工具的方式来用 Claude Design，它更像 Claude Code。"
**传统 vs Claude Design**：
| 传统设计工具 | Claude Design |
|-------------|---------------|
| 人在画布上操作，AI 辅助加速 | AI 是主要生成者，人是主要审阅者 |
**三个具体差异**：
1. 输出是可运行的代码（链接可点、标签可切、版本可 DIFF）
2. 理解你的代码库（读组件结构、框架模式、文件组织）
3. 主动提问、给多方案、自检自纠

### 效果数据
- Ryan Mather 一个人同时负责 Anthropic 7 条产品线（两个月前不可能）
- 别的工具需要 20 多轮提示的复杂交互，Claude Design 2 轮搞定
---

## 二、系统提示词核心理念拆解
### 2.1 角色定位：设计师 + 工匠 + 产品经理
**原文**：
> "You are an expert designer working with the user as a manager. You produce design artifacts on behalf of the user using HTML."
**解读**：AI 是设计师，用户是产品经理。微妙角色倒转带来两个效果：AI 更主动做决策 + 在关键节点征求用户意见（向经理汇报）。
**原文**：
> "HTML is your tool, but your medium and output format vary. You must embody an expert in that domain: animator, UX designer, slide designer, prototyper, etc."
**解读**：身份要随任务切换——做动画时是动效设计师，做原型时是 UX 设计师。AI 不会用"做网页"的思维去做一切。
**关键原则**：好的角色定位应该是**动态的**，根据具体任务切换专业身份。

### 2.2 工作流：先问后做，尽早出活
**六步流程**：
1. 理解需求（问清楚再动手）
2. 探索现有资源
3. 制定计划
4. 搭建文件结构
5. 完成并验证
6. 极简总结
**何时问/何时不问的判断标准**：

- "make a deck for the attached PRD" → ask questions
- "make a deck with this PRD for Eng All Hands, 10 minutes" → no questions（信息充足）
- "turn this screenshot into an interactive prototype" → ask questions only if intended behavior is unclear
**核心原则**：信息充足就干活，信息不足才提问。
**极简总结**：
> "Summarize EXTREMELY BRIEFLY — caveats and next steps only."
只说注意事项和下一步，不赘述自己做了什么。

### 2.3 去除 AI 味的秘诀
**清单**：

- 不要过度使用渐变背景
- 不要随便使用 Emoji
- 不要用带左侧彩色边框的圆角卡片
- 不要用 SVG 硬画复杂图形（用占位符，索取真实素材）
- 不要用烂大街的字体：Inter、Roboto、Arial、Fraunces、system-ui
- 不要堆砌无意义的数据和图标（"data slop"）
**字体推荐替代**：

- Plus Jakarta Sans、Space Grotesk、Sora、Newsreader

### 2.4 oklch 色彩系统
**原文**：
> "try to use colors from brand / design system, if you have one. If it's too restrictive, use oklch to define harmonious colors that match the existing palette. Avoid inventing new colors from scratch."
**配色策略三层**：
1. 优先用品牌色
2. 不够用时，用 oklch 色彩空间派生和谐的衍生色
3. 绝对不要凭空发明新的色相
**为什么是 oklch？**

- 传统 HSL：感知不均匀（黄色看起来比蓝色亮得多）
- oklch：感知均匀，相同亮度值代表相同人眼亮度感受
- 保持 L（亮度）和 C（色度）不变，改变色相角（h），自动得到和谐配色

### 2.5 内容原则："一千个 No 换一个 Yes"
**原文**：
> "Do not add filler content. Never pad a design with placeholder text, dummy sections, or informational material just to fill space. Every element should earn its place."
**三个要点**：

- 每个元素必须证明存在的理由
- 想加内容？先问用户
- 页面看起来空？用版式和留白解决，不是靠塞内容
**设计哲学**：留白也是设计。大胆的留白，比十个平庸的板块更有表现力。

### 2.6 验证闭环：不信任自己的输出
**验证机制**：
1. 调用 `done`，展示给用户并检查控制台错误
2. 有错误则修复后再次调用 `done`
3. 确认无误后，调用 `fork_verifier_agent`——启动独立子代理做全面检查
**关键洞察**：用全新的上下文做验证，能有效打破"自己审自己"的确认偏误。

### 2.7 其他亮点
**上下文管理（snip 工具）**：

- AI 标记已完成对话段落为"可删除"
- 上下文压力大时自动释放空间
- AI 主动"忘掉"不再需要的信息
**PPT 编号规范**：

- 必须 1-indexed（从 1 开始）
- "人类不会说第 0 张幻灯片"——AI 输出应适配人类思维模型
**设计系统先行**：

- 编码前必须先定义设计系统（配色/字体/间距/圆角/阴影/动效风格）
- Token 化决策前置，保持全局一致性
**Tweaks 面板**：

- 内置可调参面板，让用户实时切换配色/字体/间距
- 把"选择"权力交给用户，降低沟通成本
---

## 三、web-design-engineer Skill 设计
### 为什么做这个 Skill？
Claude Design 有三个问题：
1. 国内用户使用困难（账号被封）
2. 没有 API，无法集成到工作流
3. 封闭性，不能自定义行为逻辑
**核心洞察**：Claude Design 的核心竞争力 = Opus 4.7 模型能力（基础）+ 420 行提示词（让它稳定输出高水平设计）

### Skill 结构（约 400 行）
#### 1. 角色定义
定位：顶尖设计工程师，可以创造优雅、精致的 Web 作品。
核心理念：目标直指"惊艳"，远超"能用"的底线。每个像素都有意义，每个交互都经过深思熟虑。
继承动态角色切换思路：根据任务自动变身为 UX 设计师、动效设计师、数据可视化专家。

#### 2. 六步工作流（改良版）
| 步骤 | Claude Design | Skill |
|------|--------------|-------|
| 第一步 | 理解需求 | 理解需求（附详细提问/不提问判断表） |
| 第二步 | 探索资源 | 获取设计上下文（分四个优先级） |
| 第三步 | 制定计划 | **宣告设计系统**（用 Markdown 列出所有设计决策） |
| 第四步 | 搭建文件 | **尽早展示 v0 半成品**（带假设和占位符的最小可展示版本） |
| 第五步 | 完成 | 完整构建 |
| 第六步 | 极简总结 | 验证 |
**第三步（宣告设计系统）的意义**：如果 AI 在脑子里默默决定配色方案然后开始写代码，你第一次看到的就是完整页面——方向错了推翻成本很高。提前宣告，用户可在动手前纠偏。
**第四步（v0 半成品）的意义**：带假设和占位符的 v0，比花 3 倍时间打磨出来的"完美 v1"更有价值——后者方向错了就要全推翻。

#### 3. 反 AI 味扩展清单
在 Claude Design 基础上补充：

- 千篇一律的渐变按钮 + 大圆角卡片组合
- 凭空编造的客户 logo 墙、虚假好评数
- 无意义的 stats / 数字 / 图标堆砌
**Emoji 使用规范**：

- 默认不用 emoji
- 只有当目标设计系统/品牌本身就用 emoji 时才使用
- 没图标时用占位符——拿 emoji 当 icon 替身是敷衍

#### 4. 占位符哲学
**完整方法论**：

- 图标缺失 → 方块 + 标签（如 `[icon]`、`▢`）
- 头像缺失 → 首字母圆形色块
- 图片缺失 → 带 ratio 信息的占位卡
- Logo 缺失 → 品牌名文字 + 简单几何形
**占位符 vs 假图**：占位符传递"这里需要真材料"；假图传递"我糊弄完了"。

#### 5. 配色 × 字体配对参考表
| 风格 | 主色 | 字体组合 | 适用场景 |
|------|------|----------|----------|
| 优雅杂志风 | oklch 暖棕 | Newsreader + Outfit | 内容平台、博客 |
| 高端品牌 | oklch 近黑 | Sora + Plus Jakarta Sans | 奢侈品、咨询 |
| 活泼消费 | oklch 珊瑚 | Plus Jakarta Sans + Outfit | 电商、社交 |
| 极简专业 | oklch 青蓝 | Outfit + Space Grotesk | 数据产品、B2B |
| 手作温度 | oklch 焦糖 | Caveat + Newsreader | 餐饮、教育 |
**核心逻辑**：给 AI 一个有品位的起点，比让它自由发挥好得多。

#### 6. 技术硬规则
- **禁止 `const styles = {...}`**：多组件环境中命名冲突是真实坑
- **跨 babel 脚本不共享作用域**：必须显式挂到 `window`
- **禁止 `scrollIntoView`**：在 iframe 嵌入环境中会破坏外部滚动

#### 7. 高级模式库（references/advanced-patterns.md）
- 响应式幻灯片引擎模板
- 设备模拟框架（iPhone / 浏览器窗口）
- 动画时间线引擎
- 设计画布（多方案对比）
- oklch 色彩系统代码
- Chart.js 数据可视化模板
---

## 四、实战对比
### Demo 1：太空探索博物馆
**相同提示词**：震撼全屏 Hero + 4 个展览介绍 + 时间线 + 预约 CTA + 页脚，沉浸感强
**无 Skill 版本（85 分）**：

- 深色背景 + 青色/紫色/粉色三色渐变发光效果（AI 默认审美，太常见）
- Orbitron + Noto Serif SC（非常"直觉"的太空字体选择）
- Hero → 卡片网格 → 时间线 → CTA → 页脚（教科书式结构，缺少惊喜）
**有 Skill 版本（95 分）**：

- oklch 色彩系统：`var(--ink): oklch(0.10 0.015 250)`、`var(--ember): oklch(0.78 0.13 65)`
- 字体：Instrument Serif（大标题）+ Space Grotesk（正文）+ JetBrains Mono（辅助信息）
- 编辑感排版：标题逐行入场动画（rise keyframe）、grid 三栏布局的信息栏
- 克制感：每个元素都经过取舍
**关键差异**：从"把所有酷炫效果都用上"到"每个元素都经过取舍"

### Demo 2：独立摄影师个人网站
**提示词仅一句**：帮我做一个独立摄影师的个人作品集网站首页。
**无 Skill**：直接开干，深色霓虹调性、半透明背景、强行塞满"潜空间、创成式"等词汇，失去真实质感
**有 Skill**：先提问，确认后再实现

- 虚构北欧摄影师 Mira Høst
- 配色：暖色纸张底（`--paper: #f2efe8`）+ 深色墨色（`--ink: #161513`）
- 字体：Instrument Serif（展示标题）+ Space Grooresk（界面元素）
- 杂志编排式布局：不对称网格、编号章节标记、Ken Burns 照片动画
---

## 五、核心结论
Skill 带来的是从"好用"到"好看"、从"完整"到"精致"、从"合格"到"有风格"的提升。
每条规则效果微小，但叠加在一起，**量变产生质变**。
---

## 相关链接
- Skill 完整代码：https://github.com/ConardLi/web-design-skill
- Easy Agent 开源项目：https://github.com/ConardLi/easy-agent
---

## 深度分析
### 设计工具范式的根本转移
Claude Design 的发布标志着一个重要转折：设计工具从"人在画布上操作、AI 辅助加速"的模式，转向"AI 是主要生成者、人是主要审阅者"的模式。这是一个由"人类主导创意执行"到"AI 主导创意生成"的范式转移。
这种转移的核心意义在于：设计师的角色从"动手做"变成"动眼审"。Ryan Mather 一个人能负责 Anthropic 7 条产品线，原因是 AI 承担了执行工作，人只需要做决策和审核。这不是效率提升，而是生产力模型的重组。

### 提示词工程的结构性价值
文章的核心发现是：Claude Design 的竞争力 = 50% Opus 4.7 模型能力 + 50% 精心设计的 Prompt Engineering。这个等式颠覆了"模型能力决定一切"的假设。 在这个等式中，提示词不是模型的附庸，而是与模型能力并列的核心竞争力。这解释了为什么同一个模型，在不同的提示词驱动下，可以产生 85 分和 95 分的巨大差异。

### 动态角色切换的设计意图
系统提示词中"你必须化身该领域的专家：动画师、UX 设计师、幻灯片设计师、原型师"这一要求，揭示了一个重要的设计意图：AI 不应该用"做网页"的思维去做一切，而应根据任务动态切换身份。 这种设计避免了"锤子思维"——当所有问题都被视为钉子时，解决方案必然平庸。

### 反 AI 味的系统性方法
文章提出的"去除 AI 味"清单（不用渐变背景、不用 Emoji、不用带左侧彩色边框的圆角卡片、不用烂大街字体、不堆砌无意义数据）不是零散的审美建议，而是一套完整的反模式清单。 这些模式之所以是"AI 味"的，是因为它们是 AI 在缺乏真实审美判断时最容易默认选择的安全方案。打破这些模式，本质上是强制 AI 走出安全区，走向真实的设计判断。

### oklch 色彩系统的感知均匀性
选择 oklch 而非 HSL 的原因在文章中讲得很清楚：传统 HSL 是感知不均匀的色彩空间（黄色看起来比蓝色亮得多），而 oklch 是感知均匀的。 这意味着在 oklch 中，保持 L（亮度）和 C（色度）不变、只改变色相角（h），自动得到和谐配色。这个设计决策将色彩搭配从"凭感觉"变成了"可计算"。

### 设计系统先行的战略意义
文章强调"编码前必须先定义设计系统（配色/字体/间距/圆角/阴影/动效风格）"，这个要求的深层逻辑是：Token 化决策前置，保持全局一致性。 在传统开发中，设计系统往往是事后补建的，但在 AI 生成环境中，提前宣告设计系统可以避免"AI 在脑子里默默决定配色方案然后开始写代码"导致的推翻成本。

### v0 半成品的价值逻辑
"带假设和占位符的 v0，比花 3 倍时间打磨出来的'完美 v1'更有价值"这一观点，直指传统设计流程中的一个核心矛盾：设计师倾向于花更多时间打磨以减少返工，但 AI 时代打磨的成本结构不同——AI 生成比人类快得多，所以快速出 v0 验证方向才是最优策略。
---

## 实践启示
### 对于 AI 产品设计者
1. **模型能力与提示词工程并重**：不要认为只要升级模型就能解决问题。Claude Design 的案例表明，精心的提示词工程可以将 85 分的设计提升到 95 分。这个差距才是真正的竞争力来源。
2. **设计验证引入独立子代理**：`fork_verifier_agent` 的设计思路值得借鉴——用全新的上下文做验证，打破"自己审自己"的确认偏误。在复杂的 AI 系统中，验证模块的独立性比其准确性更重要。
3. **上下文压力下的主动遗忘**：Claude Design 的 `snip` 工具允许 AI 主动标记已完成对话段落为"可删除"，并在上下文压力大时自动释放空间。这种设计在资源受限的环境中尤为重要。

### 对于 Web 开发者和设计师
1. **建立反 AI 味清单**：将"不要用渐变背景、不要用 Emoji、不要用左侧彩色边框的圆角卡片、不要用 Inter/Roboto/Arial、不要堆砌无意义数据"作为每次设计的必查清单。 这些模式是 AI 输出的默认值，打破它们才有可能做出有个性的设计。
2. **优先使用 oklch 色彩系统**：在 CSS 中使用 `oklch()` 函数定义颜色，而不是随手使用 `#hex` 或 `hsl()`。这确保了颜色在不同亮度下保持感知均匀性。
3. **占位符传递的是"需要真材料"**：当缺少图标、图片、Logo 时，用占位符（如 `[icon]`、`▢`）而非假图或 emoji 替代。占位符告诉用户"这里还需要真实素材"，假图则告诉用户"我糊弄完了"。
4. **设计系统先于代码**：在动手写代码前，先用 Markdown 列出所有设计决策（配色/字体/间距/圆角/阴影/动效），让用户确认方向后再动手。这个"宣告设计系统"的步骤可以大幅降低返工成本。

### 对于 AI Agent 开发者
1. **六步工作流中的提问判断**：信息充足就干活，信息不足才提问。具体判断标准："make a deck for the attached PRD"（信息不足）→ ask questions；"make a deck with this PRD for Eng All Hands, 10 minutes"（信息充足）→ no questions。
2. **极简总结原则**：只说注意事项和下一步，不赘述自己做了什么。这个原则在 AI Agent 的输出中尤为重要——用户不需要知道 AI 做了什么，只需要知道接下来要做什么。
3. **技术硬规则的必要性**：在多组件环境中禁止 `const styles = {...}`（命名冲突）、跨 babel 脚本必须显式挂到 `window`（作用域隔离）、禁止 `scrollIntoView`（iframe 嵌入环境中会破坏外部滚动）。 这些不是审美建议，而是工程实践中的真实坑点。

### 对于技能（Skill）设计者
1. **技能的价值在于对模型能力的精准释放**：Claude Design 的案例证明，同样的模型（Opus 4.7），在好的 Skill 驱动下，可以产生远超默认提示词的效果。Skill 不是模型的附庸，而是模型能力的精准释放器。
2. **配色×字体配对参考表**：提供有品位的起点，比让 AI 自由发挥好得多。表格中的"优雅杂志风"、"高端品牌"、"活泼消费"、"极简专业"、"手作温度"提供了可复用的设计语言起点。
---

## 相关实体

- [浏览器 agent 的失忆问题：autobrowse 如何让每次探索变成永久技能](https://github.com/QianJinGuo/wiki/blob/main/entities/autobrowse-browserbase-persistent-skill-files.md)
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-design-skill-web-design-engineer.md)

**延伸阅读**：用户体验设计需要系统性的用户研究方法。[User Journey Map](https://github.com/QianJinGuo/wiki/blob/main/entities/user-journey-map.md) 提供了一种将用户行为、情感和痛点可视化的框架，帮助团队从"功能清单"转向"用户目标视角"。

---

## Ch07.012 Agent 记忆存储方案深度洞察：6 大流派分歧、Wiki 编译 vs 原始数据之争、Hermes Agent 启示

> 📊 Level ⭐⭐ | 18.2KB | `entities/agent-memory-storage-six-schools-wiki-compile-vs-raw-data-debate.md`

# Agent 记忆存储方案深度洞察：6 大流派分歧与 Hermes 启示

> **作者**：Frank / Q马Q马，2026-06-02  
> **核心事件**：`@QuantumTransf`（Twitter）针对 `ai-memory` 项目（GitHub 467⭐）发出尖锐质疑：**"原始 session 本来就是结构化数据，直接放进 SQLite 就是一个很强的结构，编译成 markdown wiki 反而引入不必要的中间实体"**——引发 Agent 记忆领域最核心的设计分歧大讨论。本文综合 GitHub 数十个项目与最新行业实践，给出全景洞察。

## 推文争论：Agent 记忆该是人浏览的 wiki 还是可查询的数据库？

**@QuantumTransf 的核心质疑**：

> 我没明白为什么要把 agent session 编译成 wiki。原始 session 本来就是结构化数据——messages、tool calls、tool results、files、subagents。直接放进 SQLite，就已经是一个很强的结构。而把它先总结成 markdown page，反而引入了一个不必要的中间实体：信息被压扁，因果链和引用关系要靠后续重建。
>
> 对 agent 来说，这不应该首先是给人浏览的知识库，而更应该是一个可查询的工作历史数据库。
>
> "若无必要，勿增实体"（奥卡姆剃刀）

**这个质疑触及了 Agent 记忆领域最核心的设计分歧**——**信息压缩 vs 信息保真**。

## 当前主流方案全景：6 大流派

GitHub 上数十个 Agent 记忆项目可归为 6 大流派，每个流派代表一种设计哲学：

| 流派 | 代表项目 | 核心思路 | 典型规模 |
|------|---------|---------|---------|
| **向量记忆层** | mem0ai | 通用记忆层，LLM 提取 + 存储 + 检索事实 | **57K⭐**（最大社区） |
| **Wiki 编译派** | ai-memory | Session → LLM 总结 → Markdown wiki，Git 版本控制 | 467⭐ |
| **知识图谱派** | mnemon | 从对话中提取实体关系构建知识图谱 | 322⭐ |
| **会话历史派** | Letta / MemGPT | 完整 session 存储，支持 archival recall | 学术界主流 |
| **原始数据派** | obelisk, **Hermes** | 原始结构化数据直存 SQLite | 工程师倾向 |
| **仿生记忆派** | Anamnesis | 情景/语义/程序记忆 + 遗忘曲线 | 神经科学启发 |

## 记忆分层模型：行业共识

**所有成熟的 Agent 记忆系统，都不约而同地采用了类似人类认知的分层架构**：

- **持久记忆层**（三层）：
  - **语义记忆**：事实、决策、约定 → 无衰减，永久保留
  - **程序记忆**：技能、习惯 → 频率衰减，不常用则淡化
- **工作记忆层**：当前 session 的对话缓冲，session 结束后归档或丢弃

**ai-memory M8 策略的精确衰减函数**：

```python
score = salience · exp(-λΔt) + σ · log(1+access_count) · exp(-μ · days_since_access)
```

其中 `salience` 是初始重要度评分，`access_count` 是访问次数，`Δt` 是时间差，`λ` 和 `μ` 是衰减率。

## 核心争论：信息压缩 vs 信息保真

行业正在从"二选一"走向**分层压缩**——**不是选 A 还是选 B，而是保留原始数据的同时，按需生成多个压缩层级**。

| 对比维度 | Wiki 编译模式 | 原始数据直存 |
|---------|--------------|------------|
| **人类可读性** | 极佳，Markdown 可浏览 | 差，需查询工具 |
| **信息保真度** | 有损，LLM 总结会丢失细节 | 无损，保留完整因果链 |
| **跨 Agent 互操作** | 任何能读 Markdown 的 Agent 都能理解 | 需标准化查询协议 |
| **存储成本** | 总结后体积小 | 原始数据量大 |
| **因果链追踪** | 需事后重建 | 天然保留完整时间线 |

**推文作者（@QuantumTransf）站原始数据派**——认为 Markdown wiki 是"压扁信息 + 引入中间实体"，违背奥卡姆剃刀。**ai-memory 作者站 Wiki 派**——认为人 + Agent 协作时 Markdown 可读性是核心价值。

## 检索策略五代演进

Agent 记忆的检索能力经历了五代演进：

1. **关键词搜索**（FTS5 / BM25）—— 基础
2. **向量相似度**（embedding + cosine）—— 语义召回
3. **混合检索**（FTS5 + 向量并行）
4. **知识图谱邻居**（图遍历 + 关系推理）
5. **RRF 融合**（Reciprocal Rank Fusion）—— 当前最佳

**RRF 融合公式**：

```python
score = Σ(1 / (k + rank_i))  # k 通常取 60
```

将 FTS5 关键词结果、向量相似度结果、知识图谱邻居结果通过**倒数排名融合**。这比单一检索方式效果好得多，因为不同检索策略捕捉的是不同的相关性信号。

## 前沿趋势 4 条

### 1. 知识图谱记忆

从对话中自动提取实体关系——人物、决策、技术栈、依赖。支持关系推理："这个决策影响了哪些模块？"难点在于**提取准确性**和**图谱维护成本**。

### 2. 多 Agent 共享记忆

**FlockMem** 等探索轻量级本地优先的集体记忆总线，让团队多个 Agent 共享项目上下文，避免每个 Agent 重复学习。

### 3. MCP 成为标准接口

**Model Context Protocol 正在成为跨 Agent 记忆的标准接口层**。ai-memory 提供 **14 个 MCP 工具**，让任何支持 MCP 的客户端都能查询记忆。这是互操作性的关键一步。

### 4. 零 LLM 模式

ai-memory 支持无 LLM 的 FTS5 搜索 + 规则总结。趋势很明显：**LLM 是优化项，不是必需项**。基础记忆功能应该不依赖 LLM 就能工作。

## 对 Hermes Agent 的启示

Hermes 当前已经实现了**原始数据派的核心能力**：

- SQLite 存储完整 session，带 FTS5 搜索
- 轨迹保存

**可能的增强方向**：

- **短期**：增加记忆衰减策略，自动管理旧 session 权重
- **长期**：按需生成 Markdown 摘要层——**可选，不替代原始数据**

**核心原则**：

> **保留原始结构化数据作为唯一真相源，其他表达层（wiki、图谱、向量）都是可选的派生视图。**

——这正是 @QuantumTransf 推文所主张的设计哲学。

## 总结判断（1-2 年趋势）

| 维度 | 当前状态 | 未来 1-2 年 |
|------|---------|------------|
| **存储介质** | SQLite + 向量 DB | **SQLite 为主，向量可选** |
| **记忆分层** | 3-4 层模型共识 | 更精细的衰减/巩固策略 |
| **互操作性** | MCP 正在崛起 | **MCP 成为标准接口** |
| **检索策略** | RRF 融合最佳 | RRF + 图谱推理 + 时间衰减加权 |
| **LLM 依赖** | 强依赖 LLM 总结 | **零 LLM 模式 + LLM 增强**双轨 |

## 与现有 entity 的差异化

- **vs `ai-memory-architecture-deep-dive`**：本文侧重**流派分歧 + 行业全景 + Hermes 启示**，深度分析（MemGPT OS 类比、belief tracking）在原 entity
- **vs `ai-coding-agent-memory-system`**：原 entity 是**索引页**，本文是**完整深度分析**
- **vs `agent-memory-architecture-past-influence-future-ruofei`**：原 entity 侧重**历史演进**，本文侧重**当前流派分歧与设计哲学**
- **vs `hermes-agent-memory-system-openclaw-comparison`**：原 entity 侧重 **Hermes vs OpenClaw 记忆观对比**，本文侧重**全行业 6 流派 + Hermes 启示**

## 相关实体
- [Hermes Agent 12 Layer Full Configuration Guide](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent-12-layer-full-configuration-guide.md)
- [Hermes Agent Memory System Three Layer Architecture](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent-memory-system-three-layer-architecture.md)
- [Hermes Agent Self Evolving](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent-self-evolving.md)
- [Hermes Skill System](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-skill-system.md)
- [Hermes 9 Module Architecture](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-9-module-architecture.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/agent-memory-storage-six-schools-quantumtransf-debate-frank.md)

- [hermes-wiki 实战 — obsidian + hermes agent 自动生长知识网络的 9 步搭建法](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-wiki-9-step-auto-growing-knowledge-network.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/tool-use-mcp-patterns.md)
## 深度分析

### 1. 流派之争的本质：人本设计 vs 系统本设计

@QuantumTransf 的质疑与 ai-memory 的 Wiki 编译派，代表了两种截然不同的设计哲学。Wiki 编译派认为 Agent 记忆应该首先服务于人类用户——当人类需要回顾 Agent 工作历史时，可读的 Markdown 比 SQLite 查询结果更有价值。而原始数据派则认为 Agent 记忆应该首先服务于机器——Agent 需要精确的因果链和可查询的工作历史，而不是经过 LLM 压缩后的人类可读版本。这两种哲学并无对错之分，反映的是不同使用场景和优先级。

表面上是技术之争，深层是"记忆为谁服务"的根本问题。若记忆的主要消费者是 Human-in-the-loop 场景，Wiki 编译是合理选择；若记忆的主要消费者是后续的 Agent 系统，原始数据直存更符合"信息保真优先"原则。

### 2. 分层压缩范式的崛起：从"选 A 还是选 B"到"同时保留 A 和 B"

行业正在从二元对立走向分层压缩。核心洞察是：原始数据和 Wiki 摘要并非互斥，而是互补的两个层级。原始数据提供信息保真度和因果链追踪能力，Wiki 摘要提供人类可读性和跨 Agent 互操作性。最佳实践是保留原始数据作为唯一真相源，同时按需生成 Wiki 作为派生视图。这正是"若有必要才生成 Wiki"的奥卡姆原则——Wiki 不是默认生成项，而是按需派生的视图。

这一范式转变的深层含义是：Agent 记忆系统的核心架构应该是**事件溯源（Event Sourcing）**模式——所有操作都以原始结构化事件形式记录，然后按需从这些事件投影出不同的视图（Markdown wiki、知识图谱、向量嵌入）。这比"选择一种存储格式"的问题框架更具扩展性。

### 3. M8 衰减策略的认知科学基础：时间衰减与频率巩固的博弈

ai-memory 的 M8 策略使用的公式 `salience · exp(-λΔt) + σ · log(1+access_count) · exp(-μ · days_since_access)`，本质上是在时间衰减和访问频率之间寻找平衡。这种设计背后的认知科学基础是：人类的记忆既随时间衰减，也随使用频率而巩固。单纯的指数衰减会低估高频访问项的重要性，单纯的访问计数会忽略时间维度。两种机制的结合提供了更接近人类记忆特性的建模。

值得注意的是，公式中使用了 **log(1+access_count)** 而不是简单的 access_count——这意味着访问频率的边际效用递减：高访问频率项的权重提升会逐渐放缓。这与人类认知中"熟能生巧但有极限"的规律相符。λ 和 μ 两个衰减率参数的存在，也意味着系统需要针对具体场景进行调优，而非使用通用默认值。

### 4. RRF 融合的理论优势：捕捉不同检索维度的互补信号

RRF（Reciprocal Rank Fusion）的核心洞察是：不同检索策略捕捉的是不同的相关性信号。FTS5 关键词搜索捕捉词汇匹配，向量相似度捕捉语义相关，知识图谱邻居捕捉关系推理。在很多情况下，一个文档可能同时与查询相关联，但原因各不相同。通过 RRF 融合，可以将多种检索策略的优势叠加，产生比单一检索策略更好的召回效果。k=60 的常数选择是经过实验验证的较优值——过低会导致结果被主导，过高会让不同策略的差异被稀释。

这一融合范式的更深层启示是：在 Agent 记忆检索中，"相关性"本身是一个多维度的概念，没有单一检索策略能够捕捉所有维度上的相关性。RRF 提供了一种无需训练、无需调参的融合框架，这在工程实现上具有很大的实用价值。

### 5. 零 LLM 模式的战略意义：基础功能应当独立于 LLM

ai-memory 支持零 LLM 模式这一趋势的战略意义常被低估。在当前行业实践中，很多记忆系统将 LLM 作为默认依赖——摘要生成、实体提取、关系推理都需要调用 LLM。但这带来两个问题：（1）LLM 调用的成本和延迟使得基础检索功能变得昂贵；（2）当 LLM 不可用时，整个记忆系统失效。零 LLM 模式的战略意义在于：基础记忆功能应该像数据库索引一样可靠——不依赖外部 AI 服务就能提供基本的存储和检索能力。LLM 是增强层，不是基础设施。

## 实践启示

### 1. 采用事件溯源架构设计记忆存储

在设计新的 Agent 记忆系统时，应该采用事件溯源（Event Sourcing）模式——将所有 Agent 操作以原始结构化事件形式记录到 SQLite，然后按需从这些事件投影出不同的视图（Markdown wiki、知识图谱、向量嵌入）。原始数据层作为唯一真相源，派生视图层按需生成。这种设计既能保证信息保真度，又能提供多样化的访问接口，比"选择一种存储格式"的问题框架更具扩展性。

### 2. 优先实现零 LLM 基础功能

在设计 Agent 记忆系统时，应该首先实现不依赖 LLM 的基础功能——FTS5 搜索、规则引擎、关键词匹配等。LLM 应该是锦上添花的增强层，而不是基础功能的必要依赖。这样可以保证系统在 LLM 不可用时仍然能够正常工作，同时降低基础检索的成本和延迟。

### 3. 优先支持 MCP 协议接口

MCP 正在成为跨 Agent 记忆的标准接口层。在设计新的 Agent 记忆系统时，应该优先支持 MCP 协议，以便与其他 Agent 和工具互操作。这比专有的查询协议更具长期价值——随着 MCP 生态的扩大，支持 MCP 的系统将能够自然地融入更大的 Agent 协作网络。

### 4. 实现访问感知的自适应衰减策略

建议实现访问感知的记忆衰减策略，而不是单纯的时间衰减或频率衰减。M8 策略的公式 `score = salience · exp(-λΔt) + σ · log(1+access_count) · exp(-μ · days_since_access)` 提供了一个很好的参考——在时间维度和访问频率维度之间寻找平衡，并让访问频率的边际效用递减（使用 log 函数）。系统应该能够根据实际访问模式自动调优 λ 和 μ 参数。

### 5. 采用 RRF 融合作为默认检索策略

在实现 Agent 记忆检索时，应该采用 RRF 融合作为默认策略，将 FTS5 关键词搜索、向量相似度搜索和知识图谱邻居搜索的结果进行融合。使用公式 `score = Σ(1 / (k + rank_i))`，其中 k 取 60。这比单一检索策略可以显著提升召回质量，且无需训练和调参。后续还可以扩展到将时间衰减权重纳入融合得分。

---

## Ch07.013 网盘存量代码迁移实战：我们如何用三层架构管住 AI 的输出

> 📊 Level ⭐⭐ | 17.6KB | `entities/baidu-netdisk-kmp-migration-three-layer-agent-architecture.md`

## 背景与动机

网盘主端积累大量存量代码，推进 KMP（Kotlin Multiplatform）多端复用过程中，核心挑战不是"能不能迁"而是"迁得稳不稳"。一个页面迁移涉及 UI 层、布局文件、业务逻辑和资源文件，依赖关系错综复杂。

直接让 AI 协助迁移后，项目组发现三个规律性问题：

- **输出漂移**：同一类操作，不同对话结果不一样——AI 每次重新理解任务，上下文略有变化输出就漂移
- **后期幻觉**：任务越复杂，加载文件越多，到后期 AI 开始生成"不存在的方法"
- **串行瓶颈**：UI、布局、业务逻辑本可并行处理，但只有一个对话窗口被迫串行

## 三层架构全貌

三层组合的职责划分如下：

| 层级 | 组件 | 解决的问题 | 适用场景 |
|------|------|-----------|---------|
| 执行层 | [Skill](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent-skill.md) | 单点执行不稳定 | 具体执行动作 |
| 调度层 | [SubAgent](https://github.com/QianJinGuo/wiki/blob/main/concepts/multi-agent-systems.md) | 长链路上下文膨胀 | 有依赖需串行的步骤 |
| 协作层 | [Agent Team](https://github.com/QianJinGuo/wiki/blob/main/concepts/multi-agent-collaboration-patterns.md) | 多类型任务串行效率低 | 无强依赖可并行的任务 |

迁移流程分为两个大阶段：

- **提取阶段**：用  四路并行，把 UI、布局、业务逻辑、资源同时提取
- **转化阶段**：用  串行推进，按模块生成→资源转化→业务代码迁移→UI 转化顺序执行，步骤之间通过 [Memory](https://github.com/QianJinGuo/wiki/blob/main/entities/how-ai-agent-memory-works.md) 传递关键产出

> 选型判断依据：**任务之间有没有强依赖**——有依赖需串行→SubAgent；无强依赖可并行→Agent Team；具体执行动作→Skill。

## 执行层 · Skill：解决输出不稳定

### 核心问题

AI 每次都在"重新理解"任务，上下文不同、表达方式略有差异，对任务的理解就不一样，输出自然不稳定。这不是模型问题，而是没有把"这件事怎么做"固化下来。

** 的本质**是把一类任务的执行方式写成可复用的规范文件，AI 调用时按规范走，不再每次重新理解。Skill 是无状态的，没有对话历史，只做一件事——被调用时稳定输出。

### 最有用的约束：Checklist

试过只写"你需要做什么"、试过写"参考以下示例"，最后发现最有效的约束是 **Checklist**——把每个步骤拆成可以逐项打勾的检查项。AI 在多步骤任务里容易跳步，不是不会，是在执行序列里漏掉了某个环节。有了 Checklist，遗漏率明显下降。

另一个有效做法是分层管理文件：核心规则放主文件，边界情况和细节处理放 references 目录。Skill 文件一旦太长，AI 的注意力会分散，关键规则被稀释。

### 关键决策：提取→校验→修复 三层拆分

存量代码提取的难点在于力度控制——提少了依赖链路断，提多了包体膨胀。

一开始把提取和校验写在同一个 Skill 里，结果发现 AI 在"自己审查自己"，天然倾向于认为结果没问题。后来把提取拆成三个独立 Skill：

- **extractor**：以调用语句为入口扫描依赖，生成初始提取包
- **validator**：独立校验提取结果，关注"还缺什么"而不是"提了什么"
- **fixer**：只处理 validator 指出的缺口，定向补充

这个"提取→校验→修复"的三层结构后来在代码转化阶段也沿用了（converter → validator → fixer），证明这个拆分逻辑是通用的。

> Skill 的价值不在于 AI 能做多难的事，而在于同一件事 AI 能做多稳。Skill 不是提前规划出来的，而是被真实错误倒逼出来的——某个场景反复出错、发现"这类问题每次都要纠正"时，就是需要固化成 Skill 的信号。

## 调度层 · SubAgent：上下文膨胀是必然问题

### 上下文膨胀的本质

在同一个对话里处理完整迁移流程，前期运行不错，但到了后期开始出现奇怪的错误——生成的代码引用了不存在的方法，资源 ID 映射关系对不上，前面刚讲过的约束后面就不管用了。

这是 [上下文膨胀](https://github.com/QianJinGuo/wiki/blob/main/entities/context-window-management.md) 的问题：当加载的文件超过一定量，AI 对早期信息的记忆开始模糊，用"看起来合理"的内容来填充被压缩的细节——这就是[幻觉](https://github.com/QianJinGuo/wiki/blob/main/entities/kamacoder-agent-context-drift-tool-hallucination.md)的来源，比输出明显错误更难处理。

** 的思路**：把长链路任务按步骤拆开，每个步骤交给一个独立的 SubAgent 处理，各自有完全隔离的上下文，互不干扰。

### Agent-Memory：跨步骤信息传递

上下文隔离解决了膨胀，但带来了新问题：SubAgent 之间信息割裂，后续步骤不知道前序步骤做了什么。

解决方式是 ****：每个 SubAgent 完成工作后，把关键信息提炼成结构化文件存下来，下一个 SubAgent 启动时读取这份文件，在自己的独立上下文里继续推进。

**Memory 文件不是对话记录的备份，而是"后续步骤需要什么"的提炼**。如果只是把聊天记录原样存下来再读进去，上下文一样会膨胀。有效的做法是只提炼结构化的关键信息，比如资源映射表、模块结构配置、已确认的接口契约。

具体例子：资源转化（strings.xml、colors.xml 等）和 UI 转化是前后依赖的两个步骤。UI 代码大量引用资源 ID，如果 UI 转化的 SubAgent 不知道资源映射关系，就只能猜——这是幻觉的典型触发场景。实际做法：资源转化的 SubAgent 完成后，把资源 ID 映射表写入 Memory 文件；UI 转化的 SubAgent 启动时读取这份映射表，在自己的上下文里准确处理引用。

> SubAgent 适合有前后依赖的串行流程。及早拆分任务，比等到幻觉出现再排查效率高很多。

## 协作层 · Agent Team：四路并行

### 并行效率

页面代码提取涉及四类文件：UI 组件、布局文件、业务逻辑、资源文件。这四类文件的提取逻辑完全不同，但彼此之间没有强依赖——布局提取不需要等 UI 提取完，资源提取也不需要等业务逻辑提取完。

如果串行处理，总耗时是四段的累加，而且单个 SubAgent 需要同时处理四类文件，上下文依然会膨胀，专注度也会分散。

** 的方式**：把四类提取任务分给四个专业 Teammate 并行执行，各自独立上下文，只关注自己负责的那类文件。

### 专注度提升的价值

各自只处理一类文件，上下文体积可控，对这类文件的依赖模式理解也更深——比如专注布局的 Teammate 对 include 嵌套引用的识别比"什么都做"的通用 Agent 准确很多。

**并行的收益不只在速度上**：分工带来的专注度提升，对任务质量的改善往往比缩短的时间更重要。

### 跨 Teammate 依赖：Mailbox 消息通道

四路并行并不是完全独立的。实际跑起来会遇到跨类型依赖：UI 提取 Teammate 发现代码里动态创建了一个 Dialog，需要通知布局提取 Teammate 补充这个 Dialog 的布局文件；业务逻辑里发现 API 调用引用了某个字符串资源，需要通知资源提取 Teammate 补充。

这类协调通过 **Mailbox 消息通道**实时处理，不需要等一个提取全部完成再补充，也不需要重新启动一轮。

## 核心经验

1. **Skill 是被真实错误倒逼出来的**：规范很粗糙，在反复纠错里逐步补充边界条件和反例——把团队踩过的坑沉淀成了下次不会再踩的规则。
2. **上下文膨胀的临界点比想象中早，漂移比崩溃更危险**：幻觉出现时不是突然全错，而是逐渐偏离，每一步看起来都还好，到最后才发现方向不对。
3. **Memory 文件要提炼，不要备份**：把对话历史原样传递没有意义，有效的是只传递"后续步骤需要消费的结构化信息"。
4. **并行的收益不只在速度上**：分工带来的专注度提升，对任务质量的改善往往比缩短的时间更重要。

## 深度分析

### 1. 三层架构揭示了 AI Agent 工程化的核心路径：从"用 AI 做事"到"让 AI 稳定地做事"

百度网盘项目从"直接让 AI 协助迁移"起步，到最终形成 Skill/SubAgent/Agent Team 三层体系，本质上是一次从"原型"到"产品"的工程化跃迁。初次使用 AI 时，团队关注的是"AI 能不能做这件事"；但随着深入使用，核心问题变成了"AI 能不能稳定地、一致地、可重复地做这件事"。Skill 回答的是"怎么做才稳定"，SubAgent 回答的是"长链路怎么调度才不失控"，Agent Team 回答的是"并行任务怎么协作才高效"。三层不是堆叠关系，而是覆盖了 AI 工程化三个递进的层次——每一层解决的都是前一层无法覆盖的问题。

### 2. "提取→校验→修复"三层拆分是 AI Agent 工程中最有价值的反模式

这个三层拆分（extractor / validator / fixer）最反直觉的地方在于：它不是从任务逻辑推导出来的，而是从错误中被逼出来的。当把提取和校验放在同一个 Skill 里时，AI 天然倾向于"自己审查自己"——这是一个认知偏差，与人类代码审查中作者自审容易放过问题的现象完全一致。三层拆分的核心价值不只是准确性提升，更重要的是**可调试性**：每层独立，出问题时可以直接定位到是哪一层出了问题，而不需要在一个大的 Skill 里全部排查。这种"关注点分离"的思想在传统软件工程中常见，但在 AI Agent 实践中被验证有效，这是一个重要的工程经验沉淀。

### 3. 上下文膨胀是必然问题，不是偶发问题

项目组的一个重要认知是：上下文膨胀不是"运气不好遇到了"，而是"任务长度必然会导致的"。这个结论基于一个简单的事实——LLM 的上下文窗口虽然有限，但在实际使用中，AI 对早期信息的记忆从很早的时候就开始衰减，不是因为达到窗口上限，而是因为信息密度随着新内容增加而被动稀释。这意味着"等到幻觉出现再排查"是一种被动且昂贵的策略——幻觉的特点是渐进偏离，不是突然崩溃，所以发现时往往已经走了很长的弯路。主动的任务拆分（在幻觉出现之前就拆开 SubAgent）才是根本解法。

### 4. Agent Team 的专注度收益是并行计算的特殊案例

Agent Team 四路并行的效果远超预期，原因是**专注度分工带来的质量收益比时间节省更显著**。这与传统并行计算（时间累加 → 时间并行）的逻辑不同：在 AI 任务中，单个 Agent 处理多类任务时，上下文会被多类任务的信息混杂稀释，导致对每类任务的模式识别深度都下降。而专一的 Agent 可以在自己的子任务上建立更深的对等模式理解（如专注布局的 Teammate 对 include 嵌套引用的识别精度）。这个发现对所有多任务 AI Agent 设计都有指导意义——并行不只是并发，它本身就是质量提升的手段。

### 5. Mailbox 消息通道是并行 Agent 协作的最小必要基础设施

四个 Teammate 并行执行时，跨类型依赖不可避免——UI 提取发现了 Dialog 需要布局文件，业务逻辑发现了字符串资源需要资源提取补充。如果为此重新串行化（等一个提取全部完成再补充），并行收益就清零了；如果重新启动一轮（整个任务重新跑），成本更高。Mailbox 消息通道的解法是：**跨 Teammate 的协调不需要中央协调者，不需要重新启动，只需要一个异步消息队列让相关 Teammate 知道"需要补充什么"**。这是分布式系统中常见的模式在 AI Agent 协作中的成功移植，说明 AI Agent 的协作层可以而且应该借鉴分布式系统的工程经验。

## 实践启示

1. **从第一个 AI 项目开始就用 Skill 规范执行方式，不要等出错再补救**：Skill 不是"高级用法"，而是从一开始就需要的工程基础。关键是建立 Checklist 化的步骤拆解和核心规则与边界条件的文件分层——这些实践不需要很多成本，但会显著减少"同一类问题反复出错"的情况。Checklist 防止跳步，分层防止规则稀释，这两个简单约束组合起来效果显著。

2. **用"提取→校验→修复"三层结构替代任何自包含的 AI 执行-校验逻辑**：这条经验有通用性，不仅限于代码迁移。任何 AI 执行+AI 校验的场景都适用这个三层拆分原则——让 validator 视角完全独立于 extractor，不让执行者自己审查自己的产出。这个原则成本极低（只是把一个 Skill 拆成三个），但对输出质量的提升是本质性的。

3. **在长链路任务中，及早识别 SubAgent 拆分点，不要等到幻觉出现**：判断标准是"这个步骤的输入是否依赖上一个步骤的产出"——如果答案是 yes，就立刻拆成独立的 SubAgent。资源 ID 映射表写入 Memory 文件是一个典型场景：资源转化 SubAgent 完成后，如果 UI 转化 SubAgent 需要知道资源映射关系，就必须在 UI 转化开始前把映射表写入 Memory 并由 UI 转化 SubAgent 读取。这种"信息预传递"需要显式设计，不能依赖隐式的上下文记忆。

4. **并行 Agent Team 的 Teammate 分工应基于"任务类型"而非"任务阶段"**：分工越细，专注度越高，质量越好。四路并行按文件类型（UI 组件/布局/业务逻辑/资源）分工，比按任务阶段分工能获得更深的专注度收益——每个 Teammate 只需要理解自己负责的那类文件的模式，不需要在多类文件之间切换上下文。这是并行 Agent Team 设计的核心原则。

5. **为 Agent Team 配套 Mailbox 消息通道，并行执行才不会因为跨 Teammate 依赖而退化**：当并行 Teammate 遇到需要其他 Teammate 补充的信息时，应该通过异步消息队列直接通知，而不是等本轮完成后再启动新一轮补充。Mailbox 消息通道是维持并行收益的必要基础设施——没有它，并行会因为跨依赖而逐渐退化到串行，但它的实现复杂度并不高，本质上就是一个异步消息队列。

> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/baidu-netdisk-kmp-migration-three-layer-agent-architecture.md)

---

## Ch07.014 Skill 产品哲学：歸藏做了爆款 Skill 后的产品反思

> 📊 Level ⭐⭐ | 16.6KB | `entities/skill-product-philosophy-guicang-爆款经验-2026-06-12.md`

# Skill 产品哲学：歸藏做了爆款 Skill 后的产品反思

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/skill-product-philosophy-guicang-爆款经验-2026-06-12.md)

## 一句话总结

歸藏做了 **4 个爆款 Skill**(PPT / 社交媒体卡片 / Logo Generator / AI Desk Card)后的 **产品哲学反思** —— **K 型分化** / **能力商品** / **把品味变成约束** / **中心短辐射厚** / **盗用靠持续分发** 等 14 节独家洞察，填补 wiki 中"Skill **产品哲学视角**"的空白(与现有"设计模式/工程教程/写作规范"视角互补)。

## K 型分化(开篇核心洞察,本实体独家)

**核心命题**: Agent 不是抹平能力差距，而是**放大能力差距**。

- **头部用户**: 默认理解文档/规则/memory/loop/MCP/CLI/工具调用/权限/安全沙箱/上下文工程/定时任务/心跳/文件系统/代码执行/Skill
- **普通用户**: 只知道 "Agent 能写代码" + "Agent 可以调用 Skill"
- **K 型分化**: 目标清晰/上下文好/品味强的人 → 被 Agent **放大**;目标混乱/没文档/没判断的人 → 被 Agent **放大混乱**
- **结论**: Skill 是**弥合 Agent 使用能力差距**的关键 — 用户不需要理解底层,只需知道"解决什么问题/产出什么/怎么用/别人用得怎么样"

## 14 节核心观点(本实体独家)

### 1. Skill 是能力商品，不只是提示词

**定义**: Skill = 把**专家经验 / 工作流 / 品味 / 工具调用**封装成**可分发、可复用、可迭代**的 Agent **能力单元**。

| 维度 | 提示词 | Skill |
|------|--------|-------|
| 分发 | 容易复制、难分发 | 可安装/可调用/可迭代/可传播 |
| 版本管理 | 无 | 有(每个版本有 changelog) |
| 调用语义 | 缺 | 完整(触发条件/输入/输出/边界) |
| 工程化内容 | 仅文字 | 文字 + 模板 + 脚本 + 依赖 + 说明 |

**vs App**: App 是独立产品;Skill 是**Agent 内的能力单元**,需 Agent 上下文才能发挥作用。

### 2. Skill 的核心：把人的经验外化

**关键洞察**: 真正有价值的不是"工具调用本身",而是**Skill 把人的演示经验外化**了。

**创作者需懂三件事**:
1. **传统专业知识**: 决定你知道什么结果算好(设计/剪辑/写作/健身/法律/商业化投放都有大量隐性判断)
2. **AI 的上下限**: 决定你知道模型什么能做 / 什么做不稳 / 什么必须工程化兜底
3. **产品化思维**: 决定你知道用户场景 / 使用门槛 / 反馈路径 / 稳定性要求

### 3. 用户不关心概念,用户关心结果

**用户视角**: Skill/MCP/CLI/Plugin 叫什么不重要,关心的是:
- 这个功能能解决什么问题?
- 适合什么场景?
- 我点一下能不能用?
- 需要输入什么材料?
- 结果长什么样?
- 别人用得怎么样?

**Codex 的方向**: 把很多东西统一叫"插件" — **弱化概念,强调功能**。底层可以是 Skill/MCP/CLI/原生 Plugin;用户只需知道它能干什么。

### 4. 好 Skill 的架构：中心短,辐射厚

**核心 SKILL.md 应短**(原则 + 触发 + 输出契约),**外围资源应厚**(模板/脚本/参考/示例)。

**反例**: 把所有细节堆在 SKILL.md → 主上下文压力大 → 触发成本高 → 不易复用

### 5. Skill 质量要像代码质量一样维护

**质量纪律**: 版本管理 / 测试 / 迭代 / 评审 — 同代码 review 一样

### 6. 设计 Skill 的本质：把品味变成约束

**核心命题**: "好品味" 是 Skill 的差异化护城河,但品味本身不能直接传达。

**操作方式**: 把品味**工程化为约束条件**:
- 设计 Skill: "字号 28-32,行距 1.5,主色 #2C3E50,辅色 #ECF0F1"
- 写作 Skill: "每段不超过 100 字,关键论点必须在段首句,引用必须带链接"
- 剪辑 Skill: "每 30 秒切换一次镜头,转场时长 0.3-0.5 秒"

**核心能力**: **把审美/版式判断/设计系统经验/模板选择/图片裁切规则/明暗遮罩规则/字体颜色规则固化进去**。

### 7. Skill 生态不能做成仓库列表

**问题**: 把 Skill 当代码仓库堆上去 → 用户面对几十万个 Skill 不知选哪个。

**正解**: 平台需要**策展/分级/推荐/对比**:
- 按场景分类(内容创作/开发辅助/数据分析)
- 按难度分级(新手/进阶/专家)
- 按质量评分(用户评分/官方审核)
- 按场景推荐("做 PPT 推荐 X,Y,Z")

### 8. 普通用户真正卡在哪里

普通用户卡的不是"没有 Skill",而是:
- **不知道用什么 Skill**: 不知道 Skill 存在,或不知道哪个适合自己
- **不会输入材料**: 没有结构化输入,Agent 难以产出
- **不会验证结果**: 不知道结果对不对,反复试错
- **不知道如何迭代**: 不知如何根据反馈调整

**结论**: Skill 平台需要**场景化引导/模板化输入/可视化结果/反馈式迭代**。

### 9. 内容 Skill：文章/产品和案例互相喂养

**现象**: 做 Skill 的过程中会产生文章(经验总结),做文章的过程中会发现新的 Skill 需求(产品灵感),Skill 案例又会反向喂养文章(具体案例) — **三者是互相喂养的闭环**。

### 10. Skill 的边界会继续扩大

**趋势**: Skill 边界从**对话内工具调用** → **物理环境操作**(AI Desk Card)。

**AI Desk Card 案例**: 让 Agent 接管屏幕边缘的物理信息位:
- 固件烧录 / Wi-Fi 配置 / 信息推送 / 定时任务 / memory / todo / 日历 / GitHub 展示 / 墨水屏刷新
- **Skill 边界 = Agent 能触达的所有边界**

### 11. Skill 与 Gene：手写经验和自动进化的边界

| 维度 | Skill | Gene |
|------|-------|------|
| **本质** | 人工提炼的可控专家经验 | Agent 自动生成的持续进化产物 |
| **知识类型** | 显性(可文档化) | 隐性(可执行但难描述) |
| **版本管理** | 显式(每个版本有 changelog) | 隐式(逐步累积) |
| **关系** | 提供起点 | 提供进化 |

**互补**: Skill 显性可控 + Gene 隐性进化 — 互补不可替代。

### 12. 盗用不是靠藏,防御方式是持续分发

**核心命题**: Skill 一旦发布,被复制是必然的。**藏起来不是解决方案**。

**正解**: **持续分发**:
- 持续在主流平台发布(让用户始终能找到正版)
- 持续迭代(让旧版本贬值,新版本有差异化)
- 持续签名(让用户能验证正版)
- 持续品牌建设(让用户认你的品牌而非具体 Skill)

### 13. 平台真正该做什么

**平台职责清单**(本实体独家):
1. **降低 Skill 创建门槛**: 提供模板/工具/可视化编辑器
2. **提升 Skill 发现效率**: 场景化推荐/搜索/分类
3. **保证 Skill 调用质量**: 版本管理/兼容性测试/性能监控
4. **建立 Skill 信任机制**: 签名/审核/评分/反馈
5. **支持 Skill 商业化**: 付费/订阅/分成机制
6. **促进 Skill 生态健康**: 反盗用/反垃圾/反低质

### 14. 一个完整 Skill 生命周期

```
设计 → 文档化 → 测试 → 发布 → 分发 → 监控 → 迭代 → 下线
```

每个阶段都有明确的进入/退出标准和质量门禁。

## 4 个真实爆款 Skill 案例

### 案例 1: PPT Skill(演讲分享)

**不是"生成 PPT"这么简单**: 读取材料 → 询问主题/页数/配图 → 选择主题/颜色/版式 → 生成 HTML PPT → **自动后验检查** → 修正缺属性/未居中/溢出/图片裁切 → 必要时调图像模型配图 → 输出可演示文件

**关键经验**: 第一版基本成型后,通过**五六轮对话调整**间距/字号/字体/颜色/配图/重复内容/WebGL 背景 → 讲完后发现大家最关心的是 PPT 怎么做 → 才沉淀为 Skill

### 案例 2: 社交媒体卡片 Skill(3:4 竖版图文)

**功能**: 适配小红书/公众号/Twitter 等不同场景

**复杂度**: **11 类内容 / 2 套视觉系统 / 28 个版式骨架 / 真实图片 + Coding 排版 / 规避 AI 图限流/文字不锐利/平台风格不匹配**

### 案例 3: Logo Generator Skill(三层架构)

**反直觉设计**: 不让图像模型一把梭(文字/结构/可编辑性不稳定)

**三层架构**:
1. **Logo 本体层**: 生成 SVG Logo 变体(可编辑)
2. **展示场景层**: 生成展示图
3. **交互背景层**: 生成 WebGL 背景

**关键洞察**: Logo 本体/展示场景/交互背景拆三层,分别用最适合的技术处理

### 案例 4: AI Desk Card(物理环境 Skill)

**功能**: 让 Agent 接管屏幕边缘的物理信息位
- 固件烧录 / Wi-Fi 配置 / 信息推送 / 定时任务 / memory / todo / 日历 / GitHub 展示 / 墨水屏刷新

**Skill 边界突破**: 从**对话内**扩到**物理环境**

## 与已有 Skill 实体的关系(本实体定位)

| 视角 | 本实体(歸藏 2026-06-12) | skill-design-patterns | skill-development-guide-linyi | agent-skill-writing-practices |
|------|----------------------|----------------------|------------------------------|------------------------------|
| **核心定位** | **产品哲学/爆款经验反思** | 5 种核心设计模式 | 工程教程/保姆级 | 高质量编写规范 |
| **视角** | **产品 + 用户 + 生态** | 模式/结构 | 工程实现 | 写作规范 |
| **核心问题** | Skill 是什么 / 如何爆款 | Skill 怎么组织 | 怎么开发 Skill | 怎么写好 Skill |
| **方法论** | **14 节哲学反思 + 4 真实案例** | 5 模式对照 | 教程步骤 | 7 条规范 |
| **独特贡献** | **K 型分化 / 能力商品 / 品味变成约束 / 中心短辐射厚 / 盗用靠持续分发** | 线性/分支/工作流/参考等模式 | 结构化指令文档定义 | 渐进披露 / 像函数设计边界 |
| **真实案例** | **PPT/社交媒体卡片/Logo Generator/AI Desk Card** | vercel-deploy 等 7 个顶级 Skill | 无具体案例 | 无具体案例 |

## 关键独到判断(本实体独家)

- **K 型分化**: Agent 不是抹平差距,是**放大差距** — 对"AI 平权"叙事的反驳
- **Skill 是能力商品**: 把专家经验/工作流/品味/工具调用封装为可分发可复用可迭代的能力单元
- **把人经验外化**: Skill 核心不是工具调用,是**把人的演示经验外化**
- **创作者需懂三件事**: 传统专业知识 + AI 上下限 + 产品化思维
- **用户不关心概念**: 弱化概念,强调功能 — 平台应避免术语堆砌
- **中心短辐射厚**: 核心 SKILL.md 短,外围资源厚 — 主上下文压力小,触发成本低
- **品味变成约束**: "好品味"是差异化护城河,操作方式是把品味**工程化为约束条件**
- **盗用靠持续分发**: 持续在主流平台发布 + 持续迭代 + 持续签名 + 持续品牌建设
- **AI Desk Card**: Skill 边界扩到物理环境(固件/Wi-Fi/墨水屏)
- **Logo Generator 三层架构**: Logo 本体/展示场景/交互背景拆三层分别处理
- **Skill × Gene 互补**: Skill 显性知识,Gene 隐性知识;Skill 提供起点,Gene 提供进化
- **平台做策展而非堆量**: 场景化推荐/分级/对比,不要做仓库列表

## 实践启示(本实体补全)

- **做 Skill 前先做"传统专业知识 + AI 上下限 + 产品化思维"自检**: 三件事缺一不可
- **不要把品味当成天赋**: 工程化为约束条件,任何人都可以做"好品味" Skill
- **中心短辐射厚**: SKILL.md 短,外围资源厚 — 主上下文压力小,触发成本低
- **持续分发防御盗用**: 而不是隐藏 — 持续在主流平台发布,持续迭代,持续签名
- **平台做策展而非堆量**: 场景化推荐/分级/对比,不要做仓库列表
- **Skill × Gene 双轨**: Skill 显性可控 + Gene 隐性进化 — 互补不可替代
- **观察 K 型分化**: 头部用户放大优势,普通用户放大混乱 — UX 已难弥合差距
- **Skill 边界 = Agent 能触达的所有边界**: 从对话到物理环境,持续扩展
- **PPT Skill 的"五六轮对话"经验**: 第一版不可能完美,要在使用场景中迭代
- **Logo Generator 的"不直接用图像模型一把梭"**: 不同层用不同技术,**单一技术万能是幻觉**

## 相关实体

- [Skill Design Patterns](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-design-patterns.md) — 5 种核心设计模式(模式/结构视角)
- [Skill Development Guide Linyi](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-development-guide-linyi.md) — 工程教程/保姆级(工程实现视角)
- [Agent Skill Writing Practices](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-skill-writing-practices.md) — 高质量编写规范(写作规范视角)
- [Skill Writing Patterns Best Practices](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-writing-patterns-best-practices.md) — 7 个顶级 Skill 提炼模式
- [Skill Design Spec 8 Block Checklist Winty](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-design-spec-8-block-checklist-winty.md) — 8 块检查清单

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/skill-product-philosophy-guicang-爆款经验-2026-06-12.md)

---

## Ch07.015 Wiki Evolver

> 📊 Level ⭐⭐ | 14.6KB | `entities/wiki-evolver.md`

## 相关查询

- [Wiki Evolver 工作流程与最佳实践](https://github.com/QianJinGuo/wiki/blob/main/queries/wiki-evolver-workflow-best-practices.md) — wiki-evolver cycle 机制、frontier 决策、evaluation harness 与回归测试

## 为什么需要这一层
当前 vault 已经有比较成熟的 ingest / index / log / lint 闭环，也已经有 `[Wiki Master Map](https://github.com/QianJinGuo/wiki/blob/main/moc/wiki-master-map.md)`、``、`` 这样的导航与治理面。但这些层更多解决的是"怎么把知识存进去、找出来、维护好"，还没有系统性解决"如何让知识库主动长出新的研究问题、论文候选、工程实践和下一代 Skill"。
Wiki Evolver 的作用正是在这里：它把 ``、`[Ai Team Knowledge Harness](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-team-knowledge-harness.md)`、`[Harness Engineering Systematic Framework](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-engineering-systematic-framework.md)` 等现有思想，提升成一个统一编排层。

## Core Contract
这个 Skill 的完成条件不是"发现了有趣文章"，而是每轮至少要产出一个 durable outcome：
1. 新增/更新 source material
2. 新增/更新 synthesis page
3. 新增/更新 query/navigation page
4. 新 research question 或 frontier map
5. 基于 vault 的 paper / practice 草稿
6. 治理修复：index / log / lint / links
7. 改进后的 Skill / checklist / playbook
这比 `[Skill Craft](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-craft.md)` 的关注点更上层：Skill Craft 关注 Skill 质量本身，Wiki Evolver 关注整个知识系统如何把价值不断向上提升。

## Operating Loop
Wiki Evolver 的推荐循环是：
```text
Orient → Route → Triage → Synthesize → Emerge → Govern
```

- **Orient**：读 `SCHEMA.md`、`index.md`、最近 `log.md` 和 relevant queries
- **Route**：URL 交给 `web-content-reviewer`，wiki 写入交给 `llm-wiki`
- **Triage**：不仅看 source quality，还看 `vault_delta`
- **Synthesize**：把 source 写成 entity / concept / comparison / query
- **Emerge**：从本轮结果里抽取新问题、新连接、新产物候选
- **Govern**：更新 index/log 并跑 structural validation
它和 `` 的关系很密切：两者都强调"经验必须沉淀成下一轮默认存在的能力"，但 Wiki Evolver 把这个原则直接落到了 knowledge vault 本身。
在当前实现里，这个大循环又被进一步压成了一个更稳定的执行节奏：
```text
frontier
→ paper
→ practice
→ dashboard
→ next frontier
```
这意味着 Wiki Evolver 不要求每次都走完全链路，而是要求每轮识别最值得推进的瓶颈，并至少交付一个 durable artifact。

## Knowledge Ladder
Wiki Evolver 最有价值的地方，是给出了一条清晰的知识上升路径：
```text
raw source
→ claim
→ mechanism
→ pattern
→ comparison
→ principle
→ playbook
→ paper
→ Skill
```
这条 ladder 把知识库从"资料堆积"转成"高层产物工厂"。它也解释了为什么 ``、`[Research Frontier Map](https://github.com/QianJinGuo/wiki/blob/main/queries/research-frontier-map.md)`、`[Paper Backlog](https://github.com/QianJinGuo/wiki/blob/main/queries/paper-backlog.md)`、`[Engineering Practice Backlog](https://github.com/QianJinGuo/wiki/blob/main/queries/engineering-practice-backlog.md)` 这些页面值得存在：它们是 ladder 上不同层级的导航与中间站。

## 与现有系统的分工
| 层 | 角色 | 作用 |
|---|---|---|
| 守门层 | `web-content-reviewer` | 严格过滤、评分、决定是否入库 |
| 落库层 | `llm-wiki` | 写入 raw / entity / concept / comparison / query，并维护 index / log / lint |
| 编排层 | `wiki-evolver` | 发现缺口、推动 synthesis、生成 frontier / paper / practice / skill 候选 |
这意味着 Wiki Evolver 不应该写成一个"超大万能 Prompt"，而应该写成一个上层 orchestration Skill：调用现有工具，但把目标从"完成单篇任务"提升到"推动整个 vault 演化"。

## 最值得落地的四个页面
这份设计最直接的增量，不是先写完整 Skill，而是先把它提出的 4 个高层页面落下：

- ``
- ``
- ``
- `[Vault Evolution Dashboard](https://github.com/QianJinGuo/wiki/blob/main/queries/vault-evolution-dashboard.md)`
它们分别承接问题发现、论文候选、工程实践候选和系统演化治理四种需求，是把"talk to my vault"做成长期机制的最小起点。
现在这些页面已经齐了，因此下一阶段重点不再是"把页面补出来"，而是让它们作为固定控制面被周期性运行，持续把 recurring reasoning 压缩成 query、playbook、template、validator 和更稳的 Skill。

## 深度分析
### 1. 定位的本质：元系统而非工具
Wiki Evolver 的核心创新不在于做任何单一类型的知识处理，而在于**它是关于系统的系统**。它把自己定位成"上层编排层"，这意味着它的输入是其他工具的输出，它的产品是更高层次的理解和研究方向。这种递归提升的结构，恰恰对应了知识管理中最稀缺的能力——不是缺少信息，而是缺少**关于信息的元认知**。
传统的知识管理讨论往往陷入"如何组织"的技术细节，而 Wiki Evolver 直接跳到了"如何让组织本身产生价值"的哲学层面。它的参照系不是 Evernote、Notion 或 Obsidian 这些工具，而是**组织的学习机制**——就像 Warren Buffett 的思维框架是用一生提炼出来的决策原则，Wiki Evolver 想让 vault 本身也能长出这种能力。

### 2. Operating Loop 的关键设计：循环而非流水线
Orient → Route → Triage → Synthesize → Emerge → Govern 这个循环最妙的地方在于它的**无终点设计**。传统的工作流有明确的 start 和 end，但 Wiki Evolver 的循环是自我指涉的：Govern 阶段的输出直接影响下一轮的 Orient。
这与认知科学中的"双过程理论"相呼应：System 1 负责快速处理（Route、Triage），System 2 负责深度反思（Synthesize、Emerge）。Wiki Evolver 把这两个过程编织成了一个连续体，而不是两个分离的阶段。
特别是 **Emerge** 这个阶段——它要求 agent 不仅要完成任务，还要从结果中抽取"新问题、新连接、新产物候选"。这相当于强制要求每次行动都要有**认知剩余**（cognitive surplus），而不是做完就结束。这个设计直接解决了"学了很多但没有长出洞见"的常见困境。

### 3. Knowledge Ladder 的涌现性质
raw source → claim → mechanism → pattern → comparison → principle → playbook → paper → Skill 这条 ladder 不是一条固定装配线，而是一条**相变路径**。每一级的转化都涉及信息密度的质变：

- raw source 是原始观测，未经处理
- claim 是初步断言，有待验证
- mechanism 是因果解释，说明"如何"
- pattern 是跨案例的规律，超越单个情境
- principle 是抽象规则，接近"第一性原理"
- playbook 是可操作的清单，接近实践智慧
- paper 是正式化的知识传播载体
- Skill 是压缩进能力的最佳实践
Wiki Evolver 的设计者正确地识别出：大多数知识库的误区在于把精力全部投入在 source 采集（左侧），而忽视右侧的高价值转化。这就像一个公司花大量时间收集市场情报但从不做出决策。

### 4. 四个落地页面的战略价值
research-frontier-map、paper-backlog、engineering-practice-backlog、vault-evolution-dashboard 这四个页面之所以是最佳切入点，原因是它们代表的是**系统对自身的感知能力**：

- research-frontier-map = 系统对未知边界的感知
- paper-backlog = 系统对自身产出的规划
- engineering-practice-backlog = 系统对实践知识的积累
- vault-evolution-dashboard = 系统对自身演化的监控
它们一起构成了一个**自我建模**（self-modeling）的机制。没有自我模型，系统就无法自我改进。这是 Wiki Evolver 从工具上升为系统的关键一跃。

### 5. 与 Agentic AI 研究的深层联系
Wiki Evolver 的设计哲学与当前 AI 领域对"Agent"的理解高度共鸣。ReAct、AutoGPT、Agentic Workflow 等范式都在探索如何让 AI 系统不只是执行单步任务，而是能够**自我引导、记忆积累、跨任务学习**。Wiki Evolver 本质上是在为 LLM 提供一个**外部记忆系统**，让 vault 成为 agent 的海马体——不仅存储，还在检索和整合中实现记忆的巩固与泛化。
这解释了为什么 Wiki Evolver 要强调 durable outcome 而不是"有趣的发现"——一个真正的 agent 需要的是**可积累的能力**，而不是孤立的信息碎片。

## 实践启示
### 1. 从"收藏者心态"切换到"生产者心态"
大多数人在使用知识管理工具时，潜意识里是在做"收藏"——看到好文章就保存，标记"稍后阅读"。Wiki Evolver 的第一个实践启示是：**每当你添加一个 source，强迫自己问一个问题**："这个 source 能帮我产出一个 durable outcome 吗？"
可以把这个原则具象化为一个习惯：每保存一篇文章，立即在笔记里写一行"This source 帮我排除了/验证了/深化了一个什么 claim 或 question"。如果写不出来，说明这个 source 的价值还没有被充分挖掘。

### 2. 用 Loop 而非 List 来组织工作
不要用"待办清单"的方式运行知识工作，而是用**循环**的方式。具体的操作节奏可以是：
```
每周一：Orient（回顾上周产出，扫 index/log，找到最有价值的空白）
周二-周四：执行具体任务（Route/Triage/Synthesize）
周五：Emerge（从本周结果中抽取新问题）
周末：Govern（更新 index/log，跑 lint validation）
```
关键是**周五的 Emerge 环节不能跳过**——它是从"做了事"到"长了能力"的关键转换。很多人的知识管理工作停留在"做了很多事"的层面，正是因为缺少这个反思-抽象阶段。

### 3. 优先填充 Ladder 右侧的页面
不要只关注 entity 和 concept 的数量，要关注 **query 目录下的四个页面**（research-frontier-map、paper-backlog、engineering-practice-backlog、vault-evolution-dashboard）是否在持续更新。
一个健康的 vault 应该体现：底层 source 在持续积累，同时右侧的产出层（paper、practice、frontier）也在同步生长。如果只有 source 在增长，说明知识没有被有效转化。

### 4. 把"矛盾"和"空白"当作第一等公民
Wiki Evolver 的设计中没有直接提及，但实践中极其重要的一个发现是：**最有价值的知识往往出现在矛盾处**——两个 source 说法不一、预期与实际不符、已发表的论文被新证据推翻。
建议在 vault 中主动维护一个"张力记录"（Tension Log）：专门记录那些让你感到困惑、不确定、相互矛盾的发现。这些张力是emergence的前兆，是新洞见的原材料。每周挑一个张力，深入挖掘，往往能产出比普通 source 加工高出一个数量级的价值。

### 5. 设计的skill要足够薄，足够稳定
Wiki Evolver 的设计者强调它不应该写成一个"超大万能 Prompt"，而应该是一个"上层 orchestration Skill"。这个原则值得迁移到所有知识工作的自动化中：**薄而稳定的接口 > 厚而不稳定的智能**。
具体来说，当你设计一个 skill 或 automation 时，先问：这个 skill 的输入是什么、输出是什么、它的失败模式是什么？而不是先设计一个能"做一切"的超级 prompt。Wiki Evolver 的成功正是因为它定义了清晰的 contract（Core Contract），而不是试图在单次执行中解决所有问题。

## 相关查询
- [Wiki 日常维护的最佳实践与常见问题解决方案](https://github.com/QianJinGuo/wiki/blob/main/queries/wiki-maintenance-faq.md) — Wiki 维护检查清单与常见问题

---
[DONE]

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/wiki-structure-navigation.md)

---

## Ch07.016 Anthropic 最新博客：MCP 没死，它又来了

> 📊 Level ⭐⭐ | 14.0KB | `entities/anthropic-mcp-revisited-tool-search-code-orchestration.md`

[Anthropic Mcp Revisited Tool Search Code Orchestration](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/anthropic-mcp-revisited-tool-search-code-orchestration.md)

# Anthropic 最新博客：MCP 没死，它又来了
> source: https://mp.weixin.qq.com/s/Sz2hzXiNCyf1YNzPbeUo5Q
> author: J0hn，AGI Hunt
> date: 2026-04-23
> tags: #MCP #Agent #Claude #Tool-Search #代码编排 #Cloudflare #Skills

## 核心摘要
Anthropic 发布官方博客《Building agents that reach production systems with MCP》，回应社区对 MCP 三大批评（贵、schema 臃肿、不可组合），给出具体解法。核心结论：本地开发 → CLI + Skills；云端生产 → MCP + Skills；MCP 并未过时，正在成为云端 Agent 的标准化接入层。
---

## 01 社区批评回顾
过去一个多月社区对 MCP 的批评集中在三点：
| 问题 | 数据 |
|------|------|
| Token 成本高 | CLI 在 token 消耗上便宜 10~32 倍，1 万次操作 CLI ~$3.2 vs MCP ~$55.2（17 倍差距） |
| Schema 膨胀 | GitHub MCP 服务器 43 个工具定义，每次对话全塞上下文，单工具定义占 4,026 tokens |
| 上下文污染 | Perplexity CTO：72% 上下文窗口被 MCP 占掉 |
---

## 02 Anthropic 的回应：三条路各有地盘
Agent 连接外部系统有三条路：
| 路径 | 适用场景 |
|------|----------|
| 直连 API | 简单、一对一场景，但 M×N 问题严重（10 Agent × 10 服务 = 100 个集成方案） |
| CLI | 本地和沙箱环境，天然自描述（--help）、可组合（jq/pipe），无上下文污染 |
| MCP | 云端生产 Agent（Claude Cowork / Managed Agents / 移动端 / Web 端），无本地文件系统 |
**关键数据**：MCP SDK 月下载量从年初 1 亿 → 3 亿，用脚投票的人越来越多。
---

## 03 Token 解法
### 解法一：Tool Search（按需加载）
**传统方式**：43 个工具，55,000 tokens，全塞进上下文
**Tool Search**：Agent 先描述需求，系统运行时搜索匹配工具，只把相关几个拉进来

- 工具定义 token 消耗减少 **85% 以上**
- 工具选择准确率不下降
- **关键原则**：按意图分组工具，别按 API 分（意图级工具 vs 细粒度工具）
**效果**：GitHub MCP token 消耗：32 倍差距 → 约 7 倍差距（从 44,026 tokens 降到 ~10,000 tokens）

### 解法二：程序化工具调用
**核心思路**：别让模型当搬运工，让它写代码

- 工具返回结果不在直接丢回模型
- 在代码执行沙箱里处理：Agent 可循环/过滤/聚合
- 只把最终结果返回上下文
**效果**：复杂多步工作流减少约 **37% token 消耗**

### 综合效果
MCP vs CLI 成本：从 32 倍差距缩小到约 7 倍。
---

## 04 Cloudflare 的实践：代码编排模式
Cloudflare MCP 服务器覆盖约 **2,500 个 API 端点**。
传统方式：2,500 个端点工具定义全塞上下文 → 不现实
Cloudflare 做法：只暴露 **2 个工具**：

- `search`：找到需要的 API
- `execute`：在服务端沙箱里执行脚本
整个工具定义只占约 **1K tokens**。
**模式本质**：Agent 用 search 找到 API → 写一段简短脚本 → 通过 execute 在服务端沙箱跑
这个模式叫**「代码编排」**。
**与 CLI + Skills 的异同**：

- 相同点：Skill 告诉 Agent「怎么干」，CLI 提供「用什么干」，Agent 写代码调用，中间数据不经过上下文
- MCP 版本：把 CLI 的哲学搬进 MCP 协议，跑在云端，走 MCP 协议而非本地命令行
**Anthropic 的真正意思**：好的 MCP 服务器应该像 CLI 一样设计。
---

## 05 Skills 转正
Anthropic 明确定义了两者关系：
| 角色 | 职责 |
|------|------|
| MCP | 管「能力」——让 Agent 能连上 Snowflake、Databricks、BigQuery |
| Skills | 管「编排」——告诉 Agent 该怎么用这些连接完成具体任务 |
**典型案例**：Claude 数据插件 = 10 个 Skills + 8 个 MCP servers，覆盖 Snowflake、Databricks、BigQuery、Hex 等
**新趋势**：Canva、Notion、Sentry 等第三方服务商已发布 MCP 服务器同时附带 Skills
**MCP 社区动态**：正在开发 Skills 直接从 MCP 服务器分发的扩展，API 升级时 Skills 自动更新版本
**Peter 在播客的观点**（被 Anthropic 间接认可）："MCP 推动了很多公司去做 API，这是好的。我现在可以看一个 MCP 然后把它做成 CLI。"
---

## 06 MCP 的真正地盘
### 三问题的 Anthropic 回答
| 社区批评 | Anthropic 回答 |
|----------|----------------|
| schema 臃肿 | Tool Search 减少 85% |
| 不可组合 | 程序化调用，让 Agent 写代码处理 |
| token 贵 | 代码编排模式（Cloudflare 2 工具覆盖 2500 端点） |

### 发展图景
```
本地开发环境 → CLI + Skills（轻量、快速、上下文干净）
云端生产环境 → MCP + Skills（标准化、跨平台、认证完备）
简单场景     → 直连 API（别瞎折腾）
```
**MCP 没有死**：它并非万能方案，但正在成为**云端 Agent 的标准化接入层**。
---

## 深度分析
1. **MCP正在重演SSH的成功路径**：SSH早期也被批评臃肿、复杂，最终凭借「标准化+安全+跨平台」成为服务器管理的王者。MCP的M×N问题催生了协议层的抽象需求，Tool Search本质上是把「连接器发现」从编译期搬到运行时，这是工程进化的必然而非妥协。
2. **代码编排是Unix哲学的云端复兴**：Pipe、Jq、CLI在本地被验证了几十年，Cloudflare的search+execute模式本质上把这套哲学搬到了云端。关键洞察：Agent不需要知道工具的完整schema，只需要知道「做什么」，search机制承担了「能力发现」的角色——这是工具设计的范式转变。
3. **Tool Search和程序化调用的Token下降可以叠加**：85%（工具定义压缩）+ 37%（工作流优化）不是独立事件，而是作用于token消耗的不同阶段——前者影响初始上下文建立成本，后者影响多轮对话成本。两者叠加意味着MCP在复杂任务上的相对劣势已大幅收窄。
4. **「意图分组」原则颠覆了工具定义逻辑**：传统做法按API能力组织工具，Cloudflare案例证明应该按Agent意图分组——2个工具覆盖2500端点不是奇迹，而是把「怎么找到正确的API」这件事交给search机制，而不是让Agent在海量的细粒度工具中做选择题。
5. **MCP vs CLI的分野本质是「数据位置」而非「场景简单/复杂」**：CLI适合有本地文件系统、数据不出墙的场景；MCP适合数据在远程、需要跨平台复用的场景。Skills解决「编排」问题，MCP解决「连接」问题，两者分工比竞争更准确。

## 实践启示
1. **设计MCP服务器时，优先实现「搜索优先」接口**：参考Cloudflare的search+execute模式，将大量细粒度API包装为2-3个高层次意图工具（search/find + execute/run），即使你的服务有数百个端点，工具定义也能控制在1K tokens以内。
2. **将工具按「意图」而非「API」重新分组**：在设计工具定义时，不要直接暴露内部API，而是先问「Agent想完成什么意图」，然后把对应的多个API调用封装为一个意图级工具。这样Tool Search才能真正发挥作用，否则搜索只能找到细碎的API而非有意义的工具组合。
3. **对于涉及多工具的工作流，采用程序化调用而非直接反馈**：在代码沙箱中处理工具返回的中间结果（循环、过滤、聚合），只把最终结果返回给模型上下文。这不是MCP特有的优化，而是代码编排模式的核心——模型应该指挥代码执行，而不是自己当搬运工。
4. **用「每任务总Token消耗」而非「每工具Token消耗」评估工具效率**：Tool Search减少了工具定义的token，但MCP的真正瓶颈是多轮对话中的中间结果反馈。评估时应该看完整任务的token消耗，才能看清楚代码编排模式是否真的带来了收益。
5. **在本地开发和云端生产之间建立清晰的工具边界**：如果你的团队同时有本地CLI工具和云端MCP服务，应该让它们各自做自己最擅长的事——CLI用于快速迭代和敏感数据处理，MCP用于跨环境一致性和第三方集成。别试图用MCP替代本地开发工具，这是在用错误的工具做正确的事。
---

## 相关链接
- Anthropic 博客原文：https://claude.com/blog/building-agents-that-reach-production-systems-with-mcp
## 相关实体
- [Anthropic Mcp Revisited](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-mcp-revisited.md)
- [Anthropic 12 Mcp Production Patterns](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-12-mcp-production-patterns.md)
- [Anthropic 官方生产级 Agent 最佳实践12 个可复用的 Mcp 设计模式](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-官方生产级-agent-最佳实践12-个可复用的-mcp-设计模式.md)
- [Tencent Skill Writing Complete Playbook Jackjchou](https://github.com/QianJinGuo/wiki/blob/main/entities/tencent-skill-writing-complete-playbook-jackjchou.md)
- [Anthropic 官方生产级 Agent 最佳实践12 个可复用的 Mcp 设计模式 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-官方生产级-agent-最佳实践12-个可复用的-mcp-设计模式-v2.md)

- [打造 Ai 智能体专属的代码知识库Gitnexus 完整上手攻略](https://github.com/QianJinGuo/wiki/blob/main/entities/打造-ai-智能体专属的代码知识库gitnexus-完整上手攻略.md)
- [Cursor Recall Anthropic Daily Release Cat Wu](https://github.com/QianJinGuo/wiki/blob/main/entities/cursor-recall-anthropic-daily-release-cat-wu.md)
- [Wiki Audit Skill](https://github.com/QianJinGuo/wiki/blob/main/concepts/wiki-audit-skill.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/tool-use-mcp-patterns.md)

---

## Ch07.017 Hermes自进化完整闭环：Skill创建复用修补链路

> 📊 Level ⭐⭐ | 12.9KB | `entities/hermes-self-evolution-closed-loop-skill-reuse-winty.md`

## 6阶段完整闭环
| 阶段 | 零件 | 核心内容 |
|------|------|----------|
| 1 接收任务 | — | 用户提需求，Agent先查是否干过类似的事 |
| 2 检索Memory+Skill | Memory+Skill | 查相关事实 + 查现成SKILL.md |
| 3 执行任务 | Agent Loop | 调工具/跑命令/多轮对话，失败/纠正事件记录成session trace |
| 4 Nudge触发 | Nudge Engine | 成功→中；失败→高；用户纠正→立即；连续3次相似→Skill提炼 |
| 5 Review复盘 | Review Agent | 收集素材→分类→3把尺子筛选→决定写哪/怎么写 |
| 6 写入/Patch | Memory Store | 新建/Memory patch/Skill patch，版本+1，时间戳 |
**进化发生的瞬间**：下次任务命中Skill直接复用 = 闭环跑一次系统稍微变强一点。 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]

## 真实案例：npm发包任务3次迭代
- **第1次**：12步，失败（忘了publish前build）。Skill 0.1产出
- **第2次**：9步（命中Skill 0.1），成功但changelog遗漏。Skill 0.2 patch产出
- **第3次**：6步（命中Skill 0.2），一次成功。Skill 1.0产出
**12→9→6** = 自进化在数字层面最直观体现。不是模型变聪明了，是系统积累的经验在帮模型省路径。

## 4个数据容器（分层节流）
1. **Session Trace**（写入：Agent Loop）：结构化事件流，含用户需求/工具调用/回复/打断/结果 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]
2. **Review Input**（写入：Nudge Engine）：Trace+用户反馈+触发原因+优先级，高/中/低 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]
3. **Review Output**（写入：Review Agent）：结构化写入计划（yaml格式），先出计划再执行，过linter安全检查 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]
4. **Memory+Skill文件**（写入：Memory Store）：append/patch/new，自动版本+1+时间戳+变更日志 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]
**核心设计**：数据有节制地流才不膨胀。每个容器做过滤/打包/转换，分层节流是工程上最值钱的一处。 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]

## 5个可观测指标
| 指标 | 健康值 | 趋势 |
|------|--------|------|
| Skill命中率 | >40% | >70%警惕过度抽象 |
| 任务平均步数 | 随时间下降 | 递减=闭环健康 |
| 失败重复率 | ≤3次 | 超过=Review Agent没识别或Skill没命中 |
| 用户纠正频率 | 随时间下降 | 递减=USER.md生效 |
| Skill写入率 | 前期升后期稳 | 3个月后仍大量新增=未收敛 |
任一指标长期不动 = 闭环某一节断了。 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]

## 4个亲测观察
1. **进化是阶段性跃迁**：5天无变化→第6天突然顺（某个高频Skill终于稳定） ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]
2. **失败信号驱动进化最明显**：成功→优化（省1-2步）；失败→质变（避开整类陷阱） ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]
3. **最弱环节是检索**：Skill写出来但措辞变一点就漏过→看trigger设计覆盖度 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]
4. **每周10分钟人工review**：删拟人化偏好/删过度抽象Skill/精简啰嗦条目/归档没用Skill。"高度自动+极少人工"是当前现实解法 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]

## 深度分析
### 闭环架构的工程价值
Hermes自进化闭环的精髓不在于某个零件，而在于**零件之间的连接方式**。6个阶段形成一条数据管道：用户任务→Memory/Skill检索→执行→Nudge过滤→Review决策→Memory Store写入。下次同类任务来时，直接从存储层取用经验，绕过前几个阶段。
这种设计的工程价值体现在**三重解耦**： ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]

- **时间解耦**：任务执行和经验沉淀可以异步进行，Review Agent不需要在任务执行时同步运行
- **责任解耦**：每个零件只关心自己的输入输出，Nudge不管Review，Review不管Memory Store怎么存
- **容量解耦**：分层节流让不同容器承载不同粒度的信息，不会把所有压力打在同一个存储上

### 分层节流是系统能否长期运行的关键
winty在文中强调"分层节流是工程上最值钱的一处"，这个判断来自实战经验。Session Trace记录每一次工具调用，是最原始的数据；Review Input对trace做第一次过滤；Review Output再过滤一次并结构化；最后写入Memory/Skill的才是真正值得复用的经验。
如果没有这层过滤，系统会面临两个问题： ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]
1. **噪声淹没信号**：trace里包含大量试错过程，直接作为经验会让检索质量下降 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]
2. **存储膨胀**：每次任务都写全量trace，几个月后存储变成垃圾堆 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]
分层节流让数据从"全量记录"逐步收敛到"精华摘要"，保证系统的长期可维护性。 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]

### 从npm案例看版本演进的内在逻辑
12→9→6这个数字背后，Skill经历了3个版本的演进： ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]

- **0.1版本**：填补空白，从0到1的突破，解决了"不知道要build"这个核心问题
- **0.2版本**：精细化打磨，补全了changelog这个遗漏步骤
- **1.0版本**：稳定可用，经过3次以上验证，具备了较高的置信度
版本号不是简单的数字递增，而是**置信度的量化表达**。Skill的成熟度通过版本号传递，当一个Skill达到1.0，意味着它已经经历了多次验证，可以被高频复用。

### 可观测指标的系统性意义
5个指标不是独立存在的，它们映射到闭环的各个节点： ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]

- Skill命中率 → 第2阶段（检索）的效果
- 任务平均步数 → 第3阶段（执行）的效率
- 失败重复率 → 第4/5阶段（Nudge/Review）是否正确识别了失败模式
- 用户纠正频率 → 第3阶段执行质量，以及USER.md是否生效
- Skill写入率 → 第6阶段（写入）的活跃度
任一指标长期不动意味着对应环节可能存在断点，需要人工介入检查。 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]

## 实践启示
### 对个人Agent开发者的建议
1. **先跑通闭环，再优化零件**：不要过早追求完美的Nudge Engine或Review Agent，先让6个阶段都能跑通，数据能流动起来 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]
2. **检索设计要留足覆盖度**：winty提到"最弱环节是检索"，Skill写出来但措辞一变就漏过。建议在trigger设计时考虑同义词、不同表述方式，甚至用embedding做模糊匹配 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]
3. **定期人工review而不是完全不review**：每周10分钟扫一遍存储，删除低质量条目，比完全放手给系统更能保持系统健康度 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]

### 判断系统是否自进化的简单标准
可以用这个清单判断自己的Agent系统是否形成了真正的闭环： ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]

- [ ] 新任务来了会先查Memory/Skill，而不是每次从零开始
- [ ] 任务失败后，系统能自动记录失败原因并写入存储
- [ ] 同类任务第二次来时，执行步数/时间有明显下降
- [ ] 6个阶段都有对应的日志或记录可以追溯
如果超过一半的答案是否定的，说明闭环还没有真正跑起来。 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]

### 从个人到企业级Agent的分水岭
文中提到"个人Agent和企业级Agent的分水岭"在于三点：分层解耦、多重过滤、可观测。这三点也是判断一个Agent系统是否成熟的标准：
**分层解耦**让系统可维护，不会因为一个环节的改动牵一发动全身；**多重过滤**让系统长期不膨胀，经验逐渐收敛而不是噪声堆积；**可观测**让系统可优化，有明确的指标告诉开发者该调哪里。
一个内部工具做到这三点，就具备了企业级推广的基础。 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]

### 避免过度进化的警示
Skill命中率>70%不一定是好事——可能意味着Skill过度抽象，把不该归并的经验合并了，导致具体场景的指导性下降。当命中率持续走高时，需要检查是否有一些本应区分的场景被错误地合并了。
同样，Skill写入率在3个月后仍大量新增，说明系统还没有收敛——可能是trigger设计太宽松，或者Review Agent的阈值设得太低。

## 与其他Hermes篇章的关系
- 前置篇：Memory/Skill/Nudge Engine/Review Agent各论
- 同系列：hermes-self-improving-overview-winty（全局总览）

## 关联阅读
## 相关实体
- [Hermes Skill System Winty](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-skill-system-winty.md)
- [Hermes Agent Self Evolving Source Analysis](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent-self-evolving-source-analysis.md)
- [Hermes Agent Memory System Vs Openclaw](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent-memory-system-vs-openclaw.md)
- [Openclaw Hermes Source Code Agent Architecture Review](https://github.com/QianJinGuo/wiki/blob/main/entities/openclaw-hermes-source-code-agent-architecture-review.md)
- [Hermes Agent Vs Openclaw Comparison](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent-vs-openclaw-comparison.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/hermes-self-evolution-closed-loop-skill-reuse-winty.md)

---

## Ch07.018 Perplexity 内部 Skill 设计指南：四维体系与维护方法论

> 📊 Level ⭐⭐ | 12.0KB | `entities/perplexity-internal-skill-design-guide.md`

## 核心框架：Skill 的四个维度
### 1. Skill 是目录（hub-and-spoke）
Skill 不仅仅是一个 SKILL.md 文件，而是包含多个文件的目录结构：  
```  
skill-name/  
├── SKILL.md           # 前置元数据和指令  
├── scripts/           # Agent 运行的代码（不现场发明代码）  
├── references/        # 厚重的参考文档，按条件加载  
├── assets/            # 模板、架构和数据  
└── config.json        # 用户首次运行时的设置  
```  
**枢纽与辐辏（hub-and-spoke）模式**：300 个主题 → 归纳为 20 个领域 → 再从 15 个主题中做选择，难度大幅降低。  

### 2. Skill 是格式
SKILL.md 必须同时具备：  

- **name**：必须全部小写，不能有空格，可用连字符
- **description**：这是「路由触发器」（routing trigger），告诉模型在什么时候加载这个 Skill
**描述不是说明文档，而是触发开关**——写的是「Load when...」而非「This Skill does...」。  
前置元数据字段：  

- `depends:`：层级化 Skill 依赖关系
- `metadata:`：用于评审和评估

### 3. Skill 是可调用的
Computer 中的加载过程：  
1. `load_skill(name="...")` 调用  
2. Skill 目录复制到隔离执行沙箱  
3. 根据 `depends:` 递归加载所有依赖项  
4. 剥离前置元数据，智能体只看到正文内容和附加文件  

### 4. Skill 是渐进式的（三层 token 成本）
| 层级 | 成本 | 说明 |  
|------|------|------|  
| 索引层 | 每个 Skill ~100 tokens | 名称+描述，对话开始时注入，**所有人都为此支付成本** |  
| 正文层 | 理想 ≤ 5,000 tokens | 完整 SKILL.md，每句话都要有意义 |  
| 运行时层 | 0 到 20,000+ tokens | 脚本/条件分支逻辑，按需加载 |  
**进入索引层的门槛极高**——每一个 token 都至关重要，描述必须极其稠密精炼。  

## 什么时候需要 Skill？
### ✅ 需要 Skill
- **纠正错误或不一致**：Agent 在没有特殊语境的情况下会出错，或需要极高一致性
- **特定知识或流程**：知识耐用但不在模型训练数据中（如企业工作流）
- **审美品味**：模型无法仅从训练数据中学到的判断力（如字体/设计风格）

### ❌ 不需要 Skill
- **模型已知的任务**：Git 命令序列对人类是好文档，对模型是差 Skill
- **系统提示词的重复**：全局上下文已有的内容无需重复
- **变化太快的信息**：维护速度跟不上变化速度时会导致误判

## 每个 Skill 都是一份「税」
> 如果没有这条指令，Agent 会出错吗？
如果答案是否定，这句话就不该存在。每一个 Skill 都是一份「税」——每个会话、每个用户都在为此支付 token 成本。  
写一个短小的 Skill 是很难的。5 分钟写完并提交的 Skill 大概率不合格。LLM 自动生成 Skill 效果通常很差——模型目前还无法可靠地编写出能让自己受益的过程性知识。  

## 如何构建 Skill（五步法）
### Step 0：先写评测（Evals）
先写评测，再写内容。可从真实用户查询、已知失败案例、易与邻近领域混淆的情况中寻找素材。**负面案例（告诉模型什么时候「不该」加载）往往比正面案例更有力量。**  

### Step 1：写好描述（Description）
这是 Skill 中最难写的一行：  

- 必须以「Load when...」开头
- 目标在 50 个单词以内
- 描述用户意图，而非总结工作流程

### Step 2：编写正文（Body）
给 AI 写工作流 vs 给同事写文档：  

- **跳过显而易见的事**：不写具体命令序列（如 `git log`、`git checkout`）
- **给出原则而非死板命令**：AI 会自己完成细节
- **专注于「坑」（Gotchas）**：信号量最高的内容

### Step 3：利用层级结构
将条件性/分支逻辑从主文件拆分到子文件夹。多层级结构可处理极复杂 Skill——仔细考虑是做成庞大单体还是拆分为一组有依赖关系的 Skill 集合。  

### Step 4：迭代
先在没有该 Skill 的主分支上运行，构建核心查询集并运行大量评测。描述中微小的词语变化可能对路由产生巨大影响（包括对其他 Skill 的溢出效应）。  

### Step 5：发布
正式发布。  

## 如何维护 Skill：Gotchas 飞轮
Skill 应该是「只增不减」的。Gotchas 部分积累的价值最高：  
| 场景 | 行动 |  
|------|------|  
| Agent 在某处失败 | 增加一个 Gotcha |  
| Agent 错误加载了该 Skill | 收紧描述 + 增加负面评测案例 |  
| Agent 该加载时没加载 | 增加关键词 + 正面评测案例 |  
| 系统提示词变化 | 检查冲突或重复 |  
**你应该把大部分内容追加到 Gotchas 部分，而不是增加更长的指令或修改描述。** 从 80/20 进步到 99.9% 甚至 99.99% 的过程中，Gotcha 列表会自然增长。  

## 评测套件（Eval Suites）
1. **加载与文件读取评测**：加载准确率/召回率 + 禁区检查，确保新 Skill 不破坏现有边界  
2. **渐进式加载评测**：Agent 是否正确读取附件文件（如金融 Skill 的格式化要求文件）  
3. **端到端任务评测**：完整智能体循环 + LLM 作为裁判评分  
**关键：必须在不同模型上运行评测**（GPT、Claude Opus、Claude Sonnet），因为不同模型处理 Skill 的表现差异很大。  

## 深度分析
Perplexity 的 Skill 设计体系折射出 LLM 应用工程的根本性范式转移——从「代码即逻辑」到「语境即产品」。  
**四维体系的工程含义**：将 Skill 定义为目录/格式/可调用/渐进式，绝非架构师的自说自话，而是工程压力的产物。300 个主题通过 hub-and-spoke 归纳为 20 个领域，再细分为 15 个主题——这种三层层级设计直接对应了 LLM 上下文窗口的结构性约束。索引层的 ~100 tokens 成本看似微小，但在多 Skill 并发的会话中，5 个 Skill 同时加载就意味着 500 tokens 的确定性开销，这解释了为什么 Perplexity 如此强调「进入索引层的门槛极高」。  
**描述作为路由触发器的设计选择**：传统软件中，文档描述「做什么」；Perplexity 中，描述控制「何时加载」。这个区别的深层含义是：LLM 的推理过程不是确定性执行，而是概率性路由——Skill 的价值不在于完整性，而在于被正确调度的频率。描述写「Load when...」而非「This Skill does...」，本质上是将描述当作一个小型分类器，让模型在每个 token 生成前做一次轻量级的路由决策。  
**Gotchas 的飞轮逻辑与negative learning**：最反直觉的设计是「负面案例比正面案例更有力量」。这对应了机器学习中的一个成熟洞察：在分布外（out-of-distribution）场景中，正面示例的召回边界很难定义，而负面示例的 precision 更容易通过排除法建立。Gotchas 本质上是在构建一个关于「误加载」的分布刻画——每一个新的 Gotcha 都是对模型「不该做什么」的显式约束。  
**Token 税的经济学**：每个 Skill 都是一份税——这个说法将工程决策货币化。在传统软件开发中，代码的边际成本趋近于零；但在 LLM 应用中，每一个注入的 token 都参与运算，都消耗注意力，都影响推理延迟。这意味着 Skill 设计的核心优化目标不是覆盖率，而是「每 token 的路由正确率」。  

## 实践启示
**对于 Skill 设计者**：  
1. 在动笔之前先构建评测集，尤其是负面案例——告诉模型「何时不该加载」比告诉它「何时该加载」更有力量  
2. 描述控制在 50 个单词以内且必须以「Load when...」开头——这是最小化索引层成本的工程实践  
3. 正文每句话都必须通过「如果没有这条指令，Agent 会出错吗？」的过滤测试——做不到则删除  
4. 优先将条件逻辑和分支写入 Gotchas 而非修改描述——Gotchas 是只增不减的，随着生产环境中的失败案例自然丰富  
**对于平台架构师**：  
1. 索引层设计决定全局 token 成本——每个 Skill 的描述字段应该被当作「广播信道」来对待，信噪比至关重要  
2. 渐进式加载机制是控制成本的关键——运行时脚本层（0-20,000 tokens）应该是高频使用的无状态逻辑，而非低频引用的厚重文档  
3. 多模型评测是必要条件——不同模型对 Skill 的路由行为存在显著差异，不能以单一模型的表现推断全平台行为  
4. Skill 之间的超距作用是主要风险源——新增 Skill 可能破坏旧 Skill 的表现，需要在 Skill 加载评测中覆盖「邻居干扰」场景  
**对于团队流程**：  
1. 先写评测再写 Skill 应该是强制流程——没有评测基准的 Skill 就像没有测试用例的代码  
2. 5 分钟写完并提交的 Skill 大概率不合格——这应该成为团队的共识基线  
3. 迭代应在没有该 Skill 的分支上进行——避免已加载的 Skill 对新描述的评估产生污染  

## 核心要点
1. **先写评测，再写 Skill**：包含负面示例，防止相邻领域技能误加载  
2. **描述是最难的部分**：以「Load when...」开头的每一句话都在消耗注意力成本  
3. **Gotchas 是极高价值内容**：从小处开始，随着智能体犯错不断丰富  
4. **警惕「超距作用」**：添加新 Skill 容易破坏原有 Skill 表现，即便没碰过旧代码  

## 关联阅读
- 原始文章：https://research.perplexity.ai/articles/designing-refining-and-maintaining-agent-skills-at-perplexity
- [Perplexity Internal Skill Design Guide Xiaojianke](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/perplexity-internal-skill-design-guide-xiaojianke.md) — 原始文章存档
- `Agent Skill Writing Guide` — 低配版 Skill 写作指南（质量较低，仅供参考）
- `Agent Skill Writing Evaluation` — Skill 评测相关

## 相关实体
- [LBS-IntentBench — 首个真实出行隐式意图评测基准](https://github.com/QianJinGuo/wiki/blob/main/entities/lbs-intentbench.md)
- [9个Agent技能模块化SageMaker微调生命周期](https://github.com/QianJinGuo/wiki/blob/main/entities/aws-sagemaker-ai-agent-guided-workflows-finetuning.md)
- [重新定义Skill开发：保姆级教程&一站式开发助手发布](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-development-guide-aliyun-2026.md)
- [SkillX — 层次化技能知识库](https://github.com/QianJinGuo/wiki/blob/main/entities/skillx-hierarchical-skill-library.md)
- [Anthropic 14 个 Agent Skills 设计模式](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-agent-skills-design-patterns-14.md)
- [AI Skill 测评指标体系](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-skill-metrics-system.md)
- [SkillClaw](https://github.com/QianJinGuo/wiki/blob/main/entities/skillclaw.md)
- [Skill 系统：Agent 如何把经验沉淀成可复用能力](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-skill-system-winty.md)
- [Skills赏析：使用skills-refiner提升skill质量](https://github.com/QianJinGuo/wiki/blob/main/entities/skills-refiner-design-quality-evaluation-framework.md)
- [Trace2Skill: 轨迹经验蒸馏为可迁移 Agent Skills](https://github.com/QianJinGuo/wiki/blob/main/entities/trace2skill-trajectory-distillation-agent-skills.md)

- [Hermes Agent](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent.md)
- [Qoder Skills 完全指南](https://github.com/QianJinGuo/wiki/blob/main/entities/qoder-skills-complete-guide.md)
- [AgentEval：YAML驱动的Agent评测框架](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-eval-wallezhang-yaml-driven-agent-evaluation-framework.md)
- [你写的 Skill，及格了吗？](https://github.com/QianJinGuo/wiki/blob/main/entities/ni-xie-de-skill-ji-ge-liao-ma.md)
- [Hermes Agent Skill](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent-skill.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/aeo-and-geo-for-ai-overviews-chatgpt-claude-gemini-and-perplexity.md)

- [Agent 原理、架构与工程实践](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-engineering-principles-architecture-practice.md)

---

## Ch07.019 Embabel

> 📊 Level ⭐⭐ | 11.5KB | `entities/embabel.md`

# Embabel
> "这可能已经是'最后一代由人类主动选择的框架'了。以后越来越多的技术选型，都会由我们的工具替我们完成。" —— Rod Johnson（Spring 创造者，Embabel 创始人）

**Embabel = Rod Johnson 2024 回归一线创业做的企业 AI Agent 框架**。核心用 **GOAP（Goal-Oriented-Action-Planning）寻路算法**（来自游戏 NPC）做**确定性规划**，让 LLM 嵌入可控、可解释、可审计的业务流程。Apache 2.0，0.3.5（4-6 周到 1.0），核心 Kotlin / 示例 Java。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/embabel-rod-johnson-framework-era-interview.md)

## 核心命题
**企业 AI 应用需要规划** — 不是"扔 30 工具给模型循环跑"。业务流程要一致性、可预测性、可解释性。**LLM 只是动作步骤里的一次 HTTP 调用**，不应该是整个控制流。

## 关键设计选择

### 为什么不用状态机（LangGraph 风格）
- 状态机需要提前定义 → 修改必须重新连线 → 难扩展
- 状态转换 + 每个动作状态所需类型正交 → 类型系统麻烦
- → 选 GOAP 寻路算法

### GOAP 两大特点
1. **动态规划**（运行时）
2. **类型系统完全集成** — 动作的排序由 **Java 方法的参数类型和返回类型** 决定
   - 动作**永远不会在缺少所需参数时被调用**
   - 用户用注解标记 Java 方法即可声明动作

### 规划过程（A* 本质）
- 识别目标 → 查动作前置条件 → 算路径
- 动作可加 cost（高负载动作可动态涨价 → 规划器自动选别的路径）
- 执行一步后**重新规划**（happy path 后置条件满足就继续）

## 与同类框架对比
| 框架 | 规划方式 | 类型集成 | 决定性 |
|---|---|---|---|
| LangGraph | 静态状态机 | 一般 | 决定性 |
| Crew.ai | LLM 决策 | 弱 | 不可预测 |
| Semantic Kernel | LLM 决策 | 弱 | 不可预测 |
| **Embabel** | **GOAP A*（运行时）** | **完全** | **运行时决定性** |

## 5 大核心优势
1. **可解释**：完整展示路径 + 观察到的世界状态 + 决策
2. **可审计**：规划器 + 框架整体发大量事件，可监听 + 持久化
3. **可预测**：相同世界状态 → 相同计划（除非 LLM 步骤内部）
4. **多模型支持**：每步可独立选模型（本地 LLM 处理敏感任务 → 数据不出企业）
5. **适度用 LLM**：3 工具 + 小 prompt vs 30 工具 + 3 页纸 prompt → 可预测性天差地别

## Rod Johnson 的 8 大核心观点
### 1. 语言之争基本结束 → 邻接性原则
- LLM 只是 HTTP 调用 → 在什么栈就在什么栈里调用
- "这是 Python 在 AI 领域主导的**最后一年**"
- 区分**数据科学**（Python）与**企业 AI 应用**（业务邻接语言）
- OpenClaw 不是 Python → "Peter Steinberger 用他偏爱的语言"

### 2. Coding Agent 正在毁掉代码库（如果你放弃控制）
> "如果失去架构监督 → Agent 会愉快地加功能 → 设计退化 → 代码变糟糕。"

### 3. Alien Stack 双向伤害
- 技术上让一切都难
- 把战略权交到**根本不懂核心业务**的人手里
- 真实案例：Python 首席 AI 架构师入职一年不知道公司 70% Java

### 4. 对 MCP 持相对怀疑
- "如果这么容易用 Java 方法暴露工具，为什么还要多此一举走 MCP？"
- "MCP 是催化剂但不是一刀切"
- "完美适合某 Agent 的工具很可能就是该 Agent 独有的"

### 5. 模型"吃掉 harness"会发生但有限
- 11/12 月那波"剧烈跃迁"是真实的
- 但"在自动化业务流程中，把规划从模型控制外移出来，使用确定性方法，仍然有价值"
- **Claude Code 比 4-5 个月前工作方式完全不同** → harness 也变强了
- "模型变聪明 vs harness 变聪明" — **不是冲突，是两个地方同时推进**

### 6. AI 擅长批评，不擅长原创
- Rod 真实使用：5% 手写 + 95% AI，但**牢牢掌握控制权**
- "来回讨论时它想到了我没想到的问题" → 适合当**批评者**
- "原创新设计"是 LLM 弱项
- **Skills + CLAUDE.md 配置有效但 50% 上下文大了会忘**（注意力衰减）

### 7. 语言之争的 LLM 视角
- 训练数据太多 → 对抗趋势：模型**默认不遵守** "永远用 X"
- **Kotlin 反而是 Coding Agent 做得最好的**（语料少但都是高质量代码）→ 反直觉
- 重要洞见：**热门语言不会因训练数据而被固化**

### 8. 开源生存法则
- Spring 挺过 VMware → Pivotal → Broadcom 收购的原因：
  - 收购时已是大象 → 惯性 + 事实标准
  - **有全职开发者修所有 boring bug**（不依赖志愿者）→ 完整产品式开发
- Embabel 计划：Apache 框架 + 更上层产品（针对知识工作者）
- "纯支持模式一直非常困难；有了 Coding Agent 会更难"

## 关键金句
> "我可能最多只写 5% 的代码……但我牢牢掌握着控制权。"
> "AI 生成的代码和我手写的设计风格非常清晰——因为我停下来纠正它。"
> "Vibe Coding 适合一次性 UI 应用；**你无法用 Vibe Coding 编写严肃软件**。"
> "Coding Agent 在每一门语言里都是大师级……**但维护成本也是真实的**。"
> "我不认为现在采用 Embabel 是什么高风险的事。**反倒是引入 Alien Stack 风险大得多**。"

## 现状
- 版本：0.3.5（2026-06-04），4-6 周到 1.0
- 语言：核心 Kotlin，示例 Java（对 Java 用户完全无缝）
- 许可证：Apache 2.0
- 商业模式：开放核心 + 上层产品（针对知识工作者）

## 启示（对 agent/harness 团队）
1. **规划可确定性 = 企业 AI 的关键约束** — 不是"模型强不强"
2. **类型系统是规划引擎的一部分** — 动作的输入输出 = 类型签名
3. **A* 寻路 + 动态成本** 是经过游戏工业验证的范式，可借用到企业 Workflow
4. **Alien Stack 是双向陷阱** — 技术债 + 战略权错位
5. **5% 手写 + 95% AI + 100% 控制权** = 可能的"新范式常态"
6. **MCP 不是银弹** — 完美工具很可能就是该 Agent 独有的
7. **框架之争 → 选型之争 → Agent 时代由工具自动选** — 范式转移的信号

## 深度分析

- **GOAP 作为游戏 NPC 算法的企业级迁移**：Rod Johnson 选择 GOAP（Goal-Oriented-Action-Planning）不是拍脑袋，而是看中了游戏行业多年验证的确定性规划能力。企业 AI 应用需要可解释、可审计的流程，而 GOAP 的运行时动态规划 + 类型系统完全集成，刚好满足这个需求 

- **Alien Stack 是双向陷阱**：访谈中提到的真实案例——Python 首席 AI 架构师入职一年不知道公司 70% Java 技术栈——揭示了 Alien Stack 的核心危害：技术邻接性断裂导致战略决策权落入不懂核心业务的人手中。这不是技术债问题，而是技术战略主导权的错位 

- **MCP 的局限性被低估**：Rod 指出"完美适合某 Agent 的工具很可能就是该 Agent 独有的"——这意味着 MCP 作为跨 Agent 共享工具规范的前提本身可能不成立。工具和 Agent 的紧耦合才是常态，MCP 作为催化剂而非一刀切方案的判断是务实的 

- **规划层与 LLM 层的关注点分离**：Semantic Kernel、Crew.ai 让 LLM 决定下一步（弱类型集成，不可预测），而 Embabel 让 GOAP 规划器决定（类型安全，运行时决定性）——这代表了两种不同的架构哲学：LLM-as-controller vs LLM-as-step-executor 

- **模型变强 ≠ harness 变弱**：11/12 月的模型跃迁是真实的，但 Rod 强调"模型变聪明 vs harness 变聪明不是冲突，是两个地方同时推进"——这意味着即使模型能力持续提升，确定性的规划层（Harness）依然有其不可替代的价值，尤其在企业级业务流程中 

## 实践启示

1. **在企业级 Agent 系统中，优先考虑确定性规划层**：不是让 LLM 决定下一步动作，而是用 GOAP/A* 类算法做运行时规划，把 LLM 定位为"动作步骤里的一次 HTTP 调用"——这样才能实现可解释、可审计的业务流程

2. **用注解 + 类型签名声明动作，而非 prompt 工程**：Embabel 的方案是用户用 Java 注解标记方法声明动作，类型系统自动保证动作不会被缺少所需参数的上下文调用——这是比大量 prompt 约束更可靠的设计 [Agentscope Java Harness Framework Enterprise Distributed](https://github.com/QianJinGuo/wiki/blob/main/entities/agentscope-java-harness-framework-enterprise-distributed.md)

3. **警惕 Alien Stack：技术选型要遵循邻接性原则**：在什么技术栈就用什么技术栈的 AI 工具，不要为了赶潮流引入根本不懂核心业务的技术栈——这会把战略决策权交给错误的人

4. **MCP 是催化剂不是银弹：为每个 Agent 定制工具集**：跨 Agent 共享工具听起来美好，但实践中完美适合某 Agent 的工具往往就是该 Agent 独有的——不要为了追求标准化而牺牲工具的有效性 [Agent Architecture Harness New Backend](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-architecture-harness-new-backend.md)

5. **控制权是 5%+95% 范式的核心前提**：Rod 的 5% 手写 + 95% AI 公式成立的前提是"牢牢掌握控制权"——没有架构监督，Coding Agent 会导致设计退化。保持人类对架构决策的 100% 控制，AI 生成代码必须经过人工纠正才能合入代码库 [Skillopt](https://github.com/QianJinGuo/wiki/blob/main/entities/skillopt.md) [Impeccable](https://github.com/QianJinGuo/wiki/blob/main/entities/impeccable.md)

## 相关对照
- 状态机/规划对照：LangGraph、Crew.ai、Semantic Kernel
- 企业 Java Harness：[AgentScope Java Harness](https://github.com/QianJinGuo/wiki/blob/main/entities/agentscope-java-harness-framework-enterprise-distributed.md)
- Alien Stack 反思：[Harness 成为新后端](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-architecture-harness-new-backend.md)（同样"邻接性"原则）
- 模型 vs Harness 之争：[SkillOpt](https://github.com/QianJinGuo/wiki/blob/main/entities/skillopt.md) / [Impeccable](https://github.com/QianJinGuo/wiki/blob/main/entities/impeccable.md)
- GOAP 起源：游戏 NPC AI（学术界 F.E.A.R / Left 4 Dead 等已用）

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/tool-use-mcp-patterns.md)

---

## Ch07.020 Claude Code SKILL.md 写作指南

> 📊 Level ⭐⭐ | 11.4KB | `entities/claude-code-skill-writing-guide.md`

# Claude Code SKILL.md 写作指南

## 核心概念

Skill 是一份可被 Agent 发现、按需加载的任务说明。把"老员工脑子里的规矩"写进 SKILL.md，再交给 Agent 在合适的任务里调用。

**不是**把长 Prompt 换个地方保存，也不是给 Agent 看的 README。SKILL.md 写得越长，不代表效果越好。

## 文件结构

```
skill-name/
├── SKILL.md         # 主文件，触发时加载
├── scripts/          # 实用脚本（执行，不加载到上下文）
├── references/       # 参考资料（按需加载）
└── assets/          # 模板和静态文件（按需加载）
```

## Frontmatter 元数据

至少要写清楚两个字段：`name` 和 `description`。

### name 规范
- 最多 64 个字符
- 只能包含小写字母、数字和连字符
- 不能包含 XML 标签
- 不能包含保留字（anthropic、claude）
- 推荐动名词形式（动词+-ing）

### description 写法
说清楚两件事：
1. 这个 Skill 做什么
2. 在什么场景下需要用它
3. 带触发词（PDF、表单、git diff 等）

```yaml
# ✓ 好的 description
description: 从PDF文件中提取文本和表格、填充表单、合并文档。在处理PDF文件或用户提及PDF、表单时使用。

# ✗ 避免：只写功能名，不写触发时机
description: 处理Excel文件
```

## 正文写法

### 三层模型（渐进式披露）

1. **广告层**：name + description，启动时加载
2. **指令层**：命中后读 SKILL.md 正文，控制在 500 行以内
3. **资源层**：执行时按需读取 references/、scripts/

### 上下文管理原则

每写一段，问自己三个问题：
- Agent 真的需要这段解释吗？
- 这是项目里的私有知识，还是通用常识？
- 这段话值不值得占用上下文？

**Skill 正文里最值钱的是踩坑清单，不是概念解释。**

```markdown
# ✓ 好的写法
## 提取 PDF 文本
使用 pdfplumber 进行文本提取：
```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

# ✗ 不好的写法（全是废话）
PDF（便携式文档格式）是一种常见文件格式...
```

## 自由度把控

| 自由度 | 适合场景 | 写法 |
|--------|---------|------|
| 高 | 需要判断和取舍，答案不唯一 | 给检查方向，不写死步骤 |
| 中 | 有固定模板，但允许按场景调整 | 给模板、参数和边界 |
| 低 | 操作脆弱，出错代价高 | 给精确命令，明确不能改 |

**高风险操作（迁移/部署/删文件）→ 低自由度；分析/评审/总结 → 高自由度**

## 工作流与反馈循环

把流程拆成明确阶段，加验证点：

```markdown
### RED - Write Failing Test
Write one minimal test showing what should happen.

### Verify RED - Watch It Fail
**MANDATORY. Never skip.**
- Test fails, not errors
- Failure message is expected

### GREEN - Minimal Code
Write simplest code to pass the test. Don't add features.
```

**条件分支**：如果是 A，走 A 流程；如果是 B，走 B 流程。直接写出来，不让 Agent 自己猜。

## 常见坑

1. **把 Skill 当 README 写**：Skill 面向 Agent，重点是可执行性
2. **想做万能助手**：Skill 不怕小，怕边界不清楚。拆小：jvm-metrics-analyzer / distributed-trace-finder / k8s-pod-event-viewer
3. **给 Agent 太多选择**：先给默认方案，再给例外情况
4. **术语来回换**：同一个概念只用一个名字
5. **让 LLM 做确定性工作**：格式转换/精确计算交给脚本；LLM 做判断

## 深度分析

### 为什么 SKILL.md 不是长 Prompt

传统的 Long Prompt 模式把所有指令堆在一起，Agent 从头读到尾，上下文膨胀严重，且难以复用。而 SKILL.md 的设计初衷是**按需加载**：Agent 在任务开始时只知道这个 Skill 存在（通过 name 和 description 的广告层），只有在确定需要使用时才读取完整指令，最后在执行阶段按需引用 references 和 scripts。

这种分层设计背后有一个关键认知：**上下文窗口是昂贵的资源**。每一次 Token 都占用上下文，而上下文直接影响推理速度和质量。SKILL.md 通过三层分离，把"广告"、"指令"、"资源"拆开，让 Agent 只加载它此刻真正需要的内容。

反过来理解：如果把 SKILL.md 写成 2000 行的详细说明书，Agent 在每次任务中都要完整读取，无论任务大小。这不是"丰富"，而是"浪费"。真正专业的 Skill 作者会问：这一段在哪个阶段会被用到？如果只在执行阶段用到，就应该放到 references/ 而不是 SKILL.md 正文。

### 自由度设计的本质

自由度（Latitude）是 Skill 设计中最容易被忽视、也最影响最终效果的维度。高/中/低三档不是主观选择，而是**由任务本质决定的**：

- **低自由度**场景：操作后果不可逆、修复成本高。例如数据库迁移、文件删除、生产环境部署。在这些场景下，Agent 的"自由发挥"是危险的，必须给出精确命令和明确边界，不允许擅自变通。
- **中自由度**场景：有成熟模式但允许按实际情况调整。例如按模板生成代码、处理标准格式数据。这时候给Agent充分的上下文和参数，让它能在边界内自主决策。
- **高自由度**场景：没有标准答案，需要综合判断。例如代码评审、架构分析、性能优化建议。这里Agent需要的是方向和框架，而不是步骤清单。

一个常见的错误是：为所有 Skill 都选择"高自由度"，认为"给方向比给步骤更先进"。但实际上，当你的 Skill 涉及文件操作、命令执行、数据修改时，高自由度意味着 Agent 可能做出你未预期的操作并造成损失。**自由度的选择标准是：出错成本有多高？**

### 踩坑清单为什么比概念解释更重要

Agent 在执行任务时，最怕的不是"不知道概念"，而是"不知道坑在哪里"。概念解释是通用知识，Agent 本身已经具备（比如"PDF 是什么"）；而踩坑清单是**项目特定的、经验性的知识**，没有参考资料就无法获得。

举个例子：一个处理 PDF 的 Skill，Agent 按照通用逻辑可能会用 `PyPDF2` 提取文本，但遇到中文表格就乱码了。这个问题不会在概念层面出现，只在具体执行中暴露。如果 Skill 中写了"中文表格请用 pdfplumber + table_coords 参数"，Agent 直接绕过了这个坑。

所以，写 Skill 的重点应该从"教 Agent 什么"转向"提醒 Agent 避开什么"。当你发现团队成员在某个操作上经常出错，就把那个错误模式和正确做法写进 Skill——这是最有价值的 Skill 内容。

## 实践启示

### 1. 先写 description，再写上下文管理原则

很多 Skill 作者习惯先写正文，最后再补 description。这往往导致 description 和正文脱节——description 变成概括而不是承诺，正文变成自说自话。

正确顺序是：**先在 description 里说清楚这个 Skill 的触发时机和核心价值**。写完 description 后问自己：用户看到这个描述，会不会知道什么时候该用这个 Skill？如果答案是否定的，正文写得再好也没用，因为 Agent 根本不会加载它。

### 2. 用检查清单替代流程描述

在写"怎么做"的时候，很容易陷入步骤罗列。但对 Agent 来说，步骤罗列既冗长又缺乏灵活性。更好的方式是**检查清单（Checklist）模式**：

```
## 完成检查
- [ ] 确认源文件存在
- [ ] 检查文件编码是否为 UTF-8
- [ ] 验证输出目录可写
- [ ] 执行后核对行数一致
```

这种方式让 Agent 可以在每个节点自主决策，同时确保关键验证点不被跳过。

### 3. 先拆小，再组合

如果一个 Skill 的 description 里出现"和"、"以及"、"或"，这通常意味着它应该被拆成多个 Skill。"PDF 处理"不是一个好 Skill，"PDF 文本提取"、"PDF 表格提取"、"PDF 合并"才是边界清晰、可独立使用的最小单元。

小 Skill 的优势在于：**可发现性高，可组合性强**。一个 Agent 可以同时加载多个小 Skill 来完成复杂任务，而不是被迫理解一个臃肿的大 Skill。

### 4. 设计"默认方案 + 例外情况"的结构

不要让 Agent 在多个方案之间选择——这会消耗它的推理预算。正确做法是：先给出默认方案，再单独章节列出例外情况。

```
## 默认方案
使用 pdfplumber 提取文本（见 scripts/pdf-extract.py）

## 例外：扫描件 PDF
扫描件没有文本层，使用 OCR 处理（见 scripts/ocr-pipeline.py）
```

这样 Agent 在大多数情况下直接走默认路径，遇到特殊情况时能快速切换到正确处理方式。

### 5. 验证 Skill 效果的方式

Skill 写完后，不要直接投入生产使用。验证方式：
1. **模拟触发**：用触发词让 Agent 发现这个 Skill，确认 description 足够清晰
2. **执行测试**：用真实任务测试，检查 Agent 是否按 SKILL.md 指示执行
3. **错误注入**：故意触发例外情况，检查 Skill 的例外处理是否有效

每轮验证后，把发现的问题补充进"常见坑"章节。

## 参考资料

- [Superpowers TDD Skill](https://github.com/obra/superpowers)
- [sanyuan-skills](https://github.com/sanyuan0704/sanyuan-skills)
- [Anthropic 官方 Skills 仓库](https://github.com/anthropics/skills)
## 相关实体
- [Skill Issues Compromising Claude Code With Malicious Skills Agents Part 1](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-issues-compromising-claude-code-with-malicious-skills-agents-part-1.md)
- [Claude Design Skill Web Design Engineer](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-design-skill-web-design-engineer.md)
- [Claude Design Skill](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-design-skill.md)
- [Claude Code Prompt Source Analysis](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-prompt-source-analysis.md)
- [打造可靠的 Ai 编程环境Claude Code Hooks 完整开发者指南 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/打造可靠的-ai-编程环境claude-code-hooks-完整开发者指南-v2.md)
- [using claude](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-html-artifacts.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/prompt-engineering-guide.md)

---

## Ch07.021 Anthropic knowledge-work-plugins 源码拆解：4 种组件、3 级加载、2 层记忆、岗位型插件市场

> 📊 Level ⭐⭐ | 10.9KB | `entities/knowledge-work-plugins-anthropic-source-analysis.md`

# Anthropic knowledge-work-plugins 源码拆解：4 种组件、3 级加载、2 层记忆、岗位型插件市场

## 摘要

Anthropic 官方开源的 `knowledge-work-plugins` 仓库是一个面向企业知识工作的 AI 插件集合，2026 年 1 月底创建，5 个月内获得近 2 万 Stars。与大多数 AI 框架或模型不同，它由纯 Markdown 文件和 JSON 配置组成——没有编译、没有依赖，非技术人员也能定制。19 个官方岗位插件 + 5 个合作伙伴插件（Slack/Salesforce、Apollo、Brand Voice 等），覆盖销售、客服、产品、法务、金融、数据、营销、HR、工程等领域。

## 核心要点

- **岗位封装而非功能增强**：每个插件对应一个完整企业职能（如 engineering 插件含 10 个 Skills、9 个 MCP 连接器），让 Claude 具备岗位级专业能力
- **4 种组件各司其职**：Skills（核心指令文件）、Commands（legacy 快捷命令）、Agents（cowork 中较少用）、Hooks（安全设计值得注意）
- **3 级渐进式披露**：元数据（始终加载，~100 词）→ SKILL.md 正文（触发加载，~1500 词）→ references/examples（按需加载，无限制）
- **两层记忆系统**（Productivity 插件）：热缓存（CLAUDE.md，~30 人常用信息）+ 深度记忆（memory/目录，完整术语表/人员档案/项目详情）
- **工具无关抽象**（~~占位符）：将工作流与具体工具解耦，实现 Standalone + Supercharged 双模
- **CI 自动安全审查**：基于 LLM 的静态分析 + 结构化 Schema，扫描所有第三方插件

## 深度分析

### 1. 岗位级封装：从"工具"到"角色"的范式转变

knowledge-work-plugins 的核心创新在于将 AI 能力从"工具调用"升级为"岗位角色扮演"。传统插件模式是"给 Claude 装上计算器/搜索/画图按钮"，而岗位插件是"给 Claude 穿上工程师/产品经理/法务的职业装"。

engineering 插件是一个典型范例：10 个 Skills 覆盖 code-review（四维审查模型：安全/性能/正确性/可维护性）、system-design（架构决策模板）、incident-response（SEV1-4 分级响应体系含状态更新模板 + Post-Mortem 流程）、debugging（系统化排障方法论）等。配合 9 个 MCP 连接器（Slack、Linear、GitHub、PagerDuty 等），Claude 不仅能理解"什么是 code review"，还能直接操作企业的工程工具链完成实际工作。

这种岗位封装的核心价值是**语义对齐**——AI 不再需要用户精确描述每个操作，而是理解"你是工程师，正在做 code review"这个整体角色，自动匹配相应的行为模式、工具调用和工作流。

### 2. 三层渐进式披露的工程意义

50 多个插件的 85+ Skills 全量加载会迅速耗尽上下文窗口。knowledge-work-plugins 采用三级信息加载策略：

| 层级 | 内容 | 加载时机 | 词数上限 |
|------|------|----------|----------|
| L1 | 元数据（name + description + argument-hint） | 始终在上下文 | ~100 |
| L2 | SKILL.md 正文（核心指令和知识） | 触发短语匹配时 | 1500-2000 |
| L3 | references/、examples/、scripts/ | 按需主动加载 | 无限制 |

这个设计直接解决了 AI agent 场景下的**上下文预算**问题——只有用户真正需要的 Skill 才消耗上下文。L1 元数据使用第三人称描述触发条件（"This skill should be used when..."），由 Claude 自身判断是否触发，实现了**零成本的前置筛选**。

### 3. 两层记忆系统的认知工程

Productivity 插件的两层记忆系统是对人类记忆机制的工程化模拟：

- **热缓存（CLAUDE.md）**：约 30 个人的常用信息和术语，覆盖 90% 日常需求。存储在 Claude 的"即时工作记忆"中，每次对话直接可用。
- **深度记忆（memory/目录）**：完整术语表（glossary.md）、人员档案（people/）、项目详情（projects/）、公司上下文（context/）。需要显式查询。

关键的**晋升/降级机制**由 `memory-management/SKILL.md`（323 行）定义：频繁使用的信息从深度记忆晋升到热缓存，长期未用降级回深度记忆。这模拟了人类记忆的习惯——常用信息留在脑海深处，不常用的放入笔记。

典型场景展示了这种设计的力量：用户说"ask todd to do the PSR for oracle"，插件自动解析 Todd 是谁、PSR 是什么项目、Oracle 是哪个客户，动态从记忆系统查找，而非硬编码。

### 4. 工具无关抽象与双模设计

Engineering 插件的 `CONNECTORS.md` 定义了 6 个连接器类别，每个用 `~~category` 占位符（如 `~~chat`、`~~source control`），对应默认产品（Slack、GitHub 等）和替代方案（Microsoft Teams、GitLab 等）。

占位符的本质是**把工作流和具体工具解耦**——插件描述"做什么"（查工单、发消息、看监控），而非"用什么做"（Jira、Slack、Datadog）。这实现了 Standalone + Supercharged 双模：

- **Standalone**：没有外部工具时，Claude 依靠内置知识独立工作（用户粘贴代码/描述问题/上传文件）
- **Supercharged**：连接 MCP 工具后能力自动增强（自动拉 PR diff、链接 ticket、查询监控数据）

限制是 `~~` 占位符目前**没有自动发现机制**，用户需手动编辑 `CONNECTORS.md`。

### 5. 元编程：自我生长的插件生态

`cowork-plugin-management` 是一个特殊插件——它的功能是**创建和定制其他插件**（元编程）。`create-cowork-plugin`（270 行 SKILL.md）提供五阶段引导式创建流程：Discovery → Component Planning → Design → Implementation → Review & Package。最终产物为 `.plugin` 文件（zip 格式），支持三种模板级别：Minimal（仅 plugin.json）、Standard（plugin.json + skills/ + .mcp.json）、Full-Featured（完整组件 + agents/、hooks/、MCP、commands/）。

`cowork-plugin-customizer`（149 行）提供三种定制模式：Generic setup、Scoped（限定范围）、General（全局）。Anthropic 的目标是让整个插件生态**自我生长**——不只是提供固定插件，而是提供创建插件的工具。

### 6. CI 供应链安全屏障

仓库的安全审查机制处于行业领先水平。`.github/policy/prompt.md`（99 行）定义了四大审查维度：

| 维度 | 检查内容 |
|------|----------|
| 基础安全 | 恶意代码、隐私侵犯、欺骗功能、安全绕过 |
| Hook 范围 | Hook 是否有项目相关性门控（gated vs ungated） |
| 遥测检测 | 未披露的外部网络调用（analytics、crash reporter） |
| 行为匹配 | plugin.json 描述是否与实际行为一致 |

审查结果通过 `.github/policy/schema.json`（52 行）结构化输出，包含 `passes`、`has_broad_scope_hooks`、`has_undisclosed_telemetry`、`description_matches_behavior` 等字段。跑在 CI（`scan-plugins.yml`）中——每次提交自动检查所有第三方插件。

### 7. 横向对比：vs Cursor / OpenAI GPTs / GitHub Copilot

| 维度 | Anthropic | Cursor | OpenAI (GPTs) | GitHub Copilot |
|------|-----------|--------|----------------|----------------|
| 扩展格式 | Markdown + JSON（纯文件） | .mdc 规则文件 | JSON 配置 + API | VS Code 扩展 |
| 岗位级封装 | ✅ 19 个岗位插件 | ❌ 仅代码规则 | ✅ 社区 GPTs（非岗位导向） | ❌ |
| 外部工具连接 | MCP 协议（开放标准） | MCP（部分支持） | Actions（需 OpenAPI schema） | VS Code API |
| 非技术人员可定制 | ✅ 编辑 Markdown | ❌ | 部分（自然语言） | ❌ |
| 安全审查 | ✅ CI 自动扫描 + Policy Schema | ❌ | 部分（OpenAI 审核） | 部分（Marketplace 审核） |
| 渐进式披露 | ✅ 三级加载 | ❌ 全量加载 | ❌ 全量加载 | ❌ 全量加载 |

关键判断：MCP 是核心变量——MCP 官方 servers 仓库 86,953 Stars（事实标准）。knowledge-work-plugins 通过 MCP 连接 40+ 外部工具，是区别于 Cursor Rules / GPTs Actions 的关键优势。

## 实践启示

1. **岗位封装优先于功能堆砌**：AI 能力的组织应按"角色/岗位"而非"工具/功能"设计，让 AI 自动匹配行为模式
2. **上下文预算需要主动管理**：渐进式披露是必选项——将信息分为"始终在"、"触发加载"、"按需加载"三级
3. **工具无关抽象提升可移植性**：用占位符抽象工作流，实现 Standalone + Supercharged 双模，降低供应商锁定风险
4. **安全审查应自动化且结构化**：CI 内嵌 LLM 审查 + 结构化 Schema，形成供应链安全屏障
5. **元编程能力让生态自生长**：提供创建/定制插件的工具，比提供固定插件集更有长期价值
6. **落地优先级建议**：先改 `.mcp.json` 连接企业工具（价值最大）→ 改 skills/ 写团队规范 → 最后补 commands/ 封装快捷命令

## 相关实体

- [Knowledge Work Plugins Shuge Anthropic Deep Source](https://github.com/QianJinGuo/wiki/blob/main/entities/knowledge-work-plugins-shuge-anthropic-deep-source.md) — 同源姊妹篇：数滴云对同一仓库的深度解读，互补视角
- [Anthropic Agent Skills Design Patterns 14](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-agent-skills-design-patterns-14.md) — Anthropic 官方 14 条 Skill 设计模式
- [Skill System Design Three Way Comparison](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-system-design-three-way-comparison.md) — OpenClaw / Claude Code / Hermes 三方 Skill 系统对比
- [Claude Code Skills Workflow Encapsulation Costa Long](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-skills-workflow-encapsulation-costa-long.md) — Claude Code Skills 工作流封装机制

---

## Ch07.022 Meta Skill

> 📊 Level ⭐⭐ | 10.6KB | `entities/meta-skill.md`

# Meta Skill
> "Skill 的 Skill" —— 多个原子 Skill 的"项目经理操作手册"。当员工（Agent）变多、业务（Skill）变多，必然遇到指数级放大的噪音；Meta Skill 是用来指导 Agent 三省六部的白皮书。

**Meta Skill = 在 Skill 之上编排 Skill 的抽象层**。把多步骤编排（并行/串行决策、产出物上下游衔接）**全部内嵌到一份 SKILL.md**，端到端打通一整套长程 Workflow。OpenSquilla 当前内置 **9 个 Meta Skill**（2026-06-04），2,757 ⭐，Apache-2.0。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/meta-skill-skill-orchestration-opensquilla-jay.md)

## 它解决了什么
**SOP 已梳理清楚，但每个蓝色方块都要在对话框单独调 Skill** —— 像戳一下动一下，全程 Human in the loop，光翻 Skill 列表就够忙活半天。

工作流固化后，把所有上下文炼化成超级 Skill：自动判断当前阶段 → 调用对应子 Skill 交付结果 + 心跳机制定时查状态文档 → 完全自动化推进。

> 关键转换：从"手动组合 Skill"到"Skill 自我编排"。

## 三大要素组合
| 要素 | 角色 | 类比 |
|---|---|---|
| **Meta Skill** | "项目经理的操作手册"——决定哪些步骤并行/串行、产出物上下游衔接 | PM |
| **智能路由** | "老虎机"——每个子步骤根据复杂度分配最便宜的合适模型 | 预算管理 |
| **Meta-skill-creator** | 写 PM 手册的元方法——把"想清楚 SOP"这件事工业化 | PM 培训 |

> 三个加起来：调度 + 预算 + 写调度说明书的工具 = **端到端闭环**。

## 典型实现：meta-kid-project-planner
**Prompt**：孩子9岁，想做一本 Meta Skill 魔法书，每页介绍一个咒语。

**内部 5 步流程**（5 个原子 Skill 拼接）：
1. **立项**：询问用户偏好（年龄/周期/预算/家长参与度）
2. **可行性分类**：判断安全/需不需要大人帮/要不要额外买东西
3. **执行**：分步计划 → 材料清单 → 安全提醒 → 家长学习目标 → 最终组装交付
4. **外部信息**：户外活动 → web search 查天气
5. **安全审查**：单独一轮为儿童场景跑安全 filter

**结果**：全程无需人介入，自己跑 20+ 分钟，交付 3000 字 md + 交互式 HTML（哈利波特风格 + 魔镜魔镜 Skill 选择器）。

## 真实成本
- **Meta Skill 创建成本高**：单个 400+ 行 SKILL.md，跟 AI 迭代 ~30 分钟（前提：脑中有清晰 SOP）
- **跨行业 Know-How 整合灾难**：内容行业凑合；跨行业专家经验排列组合 = 不可行
- **社区 Skill 爆炸后供需匹配**：未来上百个 Meta Skill，如何知道哪个最适合场景

## 解决方案：个人 × 社区索引协议
> "你平时常用哪些 Skill、偏好什么组合顺序、哪个试过不好使……这些会作为信号，被 Agent 拿去匹配社区里别人做好的 Skill，然后根据你的工作流缝合出个新的。"

- **个人侧信号采集**：Skill 使用频率/偏好/拒绝
- **社区侧 Skill 共享**
- **自动推荐引擎**：根据个人信号 + 社区 Meta Skill 库，缝合新方案

> 简单来说：**自动的 Skill 推荐引擎**。

## 范式：Skill 2.0
> "单个 Skill 已经不够用了，自动化想要进一步深入，必须要学会对多个子 Skill 排列组合。
> Agent 下一步要解决的问题，已经从'会不会调用工具'，变成了'**会不会组织工具**'。"

| 维度 | Skill 1.0 | Skill 2.0 (Meta Skill) |
|---|---|---|
| **粒度** | 一个 Skill 干一件事 | 多个原子 Skill 拼接 |
| **编排** | 手动（Human in the loop） | SKILL.md 写清楚并行/串行 |
| **选择** | 人工翻 Skill 列表 | 自动按上下文判断 |
| **预算** | 全部用最贵模型 | 按子任务复杂度路由 |
| **生产** | 手写 | Meta-skill-creator 辅助生成 |
| **匹配** | 关键词搜索 | 个人信号 × 社区推荐 |

## 三条线交点（为什么现在出）
1. **模型**：复杂多步骤指令理解能力飞速拉升，Agent token 数据飞轮已转
2. **生态**：社区 Skill 爆发式增长（手写→自动生成→社区共享）—— 当可选 Skill 成千上万时，需要 Meta Skill 这种更高抽象
3. **成本**：大规模跑大模型依然贵；Meta Skill 把"trial-and-error 烧 token"前置到 Skill 层

> 三个痛点同时指向了又一次正在被倒逼出来的范式迭代。

## 与多 Agent 团队的关系
最近不少模型都推出了自己的 Agent 团队：腾讯 Marvis / MiniMax Mavis / Kimi Agent 集群 —— **但 Skill 层似乎还停留在 Claude 带火时的阶段**。

> 多 Agent 的潜能其实一直没能被完全释放。
> **Meta Skill 的可能性**：专为 Agent 团队设计的白皮书，赋予模型更宏观的全局上下文 —— **从单兵作战到团队作战**。

## 与 SkillOpt 的对比
| 维度 | [SkillOpt](https://github.com/QianJinGuo/wiki/blob/main/entities/skillopt.md) | Meta Skill |
|---|---|---|
| **目标** | 训练出**更好的单个 Skill** 文档 | **编排多个 Skill** 完成长程任务 |
| **方法** | 冻结模型 + 验证集门控 + 优化 skill 文本 | 在 SKILL.md 里写"步骤 N 调用哪个原子 Skill" |
| **训练阶段** | 训练期烧 token（compile step） | 创作期烧 30 分钟/个 |
| **部署** | 零额外模型调用 | 每次执行按子任务路由 |
| **门槛** | 需训练集 + 验证集 | 需清晰的 SOP |

> **互补关系**：SkillOpt 让 Skill 变好；Meta Skill 让 Skill 变多；两者一起 = Skill 2.0 闭环。

## 与 Impeccable 的对比
| 维度 | [Impeccable](https://github.com/QianJinGuo/wiki/blob/main/entities/impeccable.md) | Meta Skill |
|---|---|---|
| **范围** | 单个 Skill（前端设计） | 多个 Skill 的编排 |
| **抽象层** | skill 内命令 (23 commands) | skill 间编排 (SKILL.md) |
| **解决** | "AI 味"反模式 | 长程 Workflow 自动化 |

## 关键启示
1. **抽象层级会随业务复杂度上移** —— 当 Skill 数量超过人类管理能力时，自然出现"Skill 的 Skill"
2. **路由 + 编排 + 创建是三层独立基础设施** —— 三者协同才能闭环
3. **Meta Skill 的本质是"流程知识资产"** —— 像公司 SOP 一样可读、可审计、可迁移
4. **Agent 团队 = 单兵 + 编排 + 路由** —— 模型强只是一半
5. **个人信号 × 社区匹配** = Skill 发现的新范式，超越关键词搜索

## 相关对照
- [OpenSquilla](https://github.com/QianJinGuo/wiki/blob/main/entities/opensquilla.md) —— Meta Skill 的实现载体
- [SkillOpt](https://github.com/QianJinGuo/wiki/blob/main/entities/skillopt.md) —— 互补（Skill 变好 vs Skill 变多）
- [Impeccable](https://github.com/QianJinGuo/wiki/blob/main/entities/impeccable.md) —— skill 内命令的范例
- [Agent Skill 编写指南](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-skill-writing.md)
- [10 篇论文看懂 AI Agent Skill](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-formal-theory-survey-10papers.md)
- [Agent Skills 系统性综述](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-skills-comprehensive-survey.md)
- [Skills 系统设计三路对比](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-system-design-three-way-comparison.md)
- [Agent/Skills/Teams 架构演进](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-skills-teams-architecture-evolution-selection-guide.md)

## 深度分析
- **流程知识资产化**：Meta Skill 将隐性的 SOP 流程转化为显性的可执行文档，赋予模型超越单步工具调用的宏观上下文理解能力 
- **范式迭代节点**：从"会不会调用工具"到"会不会组织工具"的转变，标志着 AI 自动化进入长程工作流编排的新阶段，技能抽象层级随业务复杂度自然上移 
- **三大基础设施协同**：路由（预算分配）+ 编排（步骤调度）+ 创建（Meta-skill-creator 辅助生成）构成缺一不可的闭环，单一层面的优化无法实现真正的 Skill 2.0 
- **Token 效率验证**：实测省 60-80% 成本，弱智问题用小模型搞定（3 分钱），复杂安全审查才动用大模型 —— 智能路由的经济价值在实践中得到验证 
- **多 Agent 收敛趋势**：Meta Skill 与 [Minimax Mavis](https://github.com/QianJinGuo/wiki/blob/main/entities/minimax-agent-team-mavis.md) 等 Agent 团队架构在"编排层"形成技术收敛，从单兵作战走向团队协作是 Agent 发展的必然方向 

## 实践启示
- **先有清晰 SOP 再谈 Meta Skill**：单个 Meta Skill 需 400+ 行 SKILL.md 和约 30 分钟迭代，没有清晰的流程定义就无法有效抽象，先在业务层把 SOP 跑通是前置条件 
- **用 [SkillOpt](https://github.com/QianJinGuo/wiki/blob/main/entities/skillopt.md) 优化单 Skill、用 Meta Skill 组织多 Skill**：两者是互补关系而非竞争关系，单个 Skill 的质量决定了编排层的下限，两层一起才能构成完整闭环 
- **智能路由是成本控制关键**：按子任务复杂度选择模型是 Meta Skill 的核心优势，建议默认开启路由，仅在特定场景（如合规审查）才锁定使用高端模型 
- **关注个人信号 × 社区匹配机制**：未来 Skill 发现将从关键词搜索转向基于使用行为和偏好的智能推荐，提前布局信号采集和社区共享可获得先发优势 
- **为 Agent 团队准备 Meta Skill 白皮书**：多 Agent 协作的瓶颈不在模型能力而在全局上下文赋予，Meta Skill 是赋予模型"团队视野"的关键载体，提前储备可加速团队作战能力建设

---

## Ch07.023 三层 Agent 架构：Skill / SubAgent / Agent Team 工程实践

> 📊 Level ⭐⭐ | 10.5KB | `entities/baidu-netdisk-three-layer-agent-architecture.md`

## 三层职责分层
| 层级 | 定位 | 解决的问题 | 适用场景 | ].md]
|------|------|-----------|---------| ].md]
| **Skill** | 执行单元（无状态） | 单点执行不稳定，同一件事做十遍结果不一样 | 具体执行动作的规范化 | ].md]
| **SubAgent** | 串行调度（带 Memory） | 长链路上下文膨胀，幻觉 | 有前后依赖的步骤串行 | ].md]
| **Agent Team** | 并行协作（Mailbox） | 多类型任务串行效率低 | 无强依赖的任务并行 | ].md]
整体方案的稳定性，最终由 Skill 的规范质量决定。SubAgent 和 Agent Team 提供的是调度骨架，骨架上每个节点能不能稳定输出，取决于 Skill 本身有没有真正约束执行过程，而不只是描述了执行目标。 ].md]

## Skill：执行稳定性的核心
Skill 把一类任务的执行方式写成可复用的规范文件，AI 调用时按规范走，不再每次重新理解。它是无状态的，没有对话历史，只做一件事——被调用时稳定输出。 ].md]
**最有用的约束：Checklist** ].md]
把每个步骤拆成可以逐项打勾的检查项。AI 在多步骤任务里很容易跳步，有了 Checklist，每完成一步对照一项，遗漏率明显下降。 ].md]
**关键设计：extractor→validator→fixer 三层拆分** ].md]
把提取和校验写在同一个 Skill 里，AI 会"自己审查自己"，天然倾向于认为结果没问题。后来拆成三个独立 Skill： ].md]

- **extractor**：以调用语句为入口扫描依赖，生成初始提取包
- **validator**：独立校验提取结果，关注"还缺什么"而不是"提了什么"
- **fixer**：只处理 validator 指出的缺口，定向补充
这个"提取→校验→修复"的三层结构，后来在代码转化阶段也沿用了：converter → validator → fixer，证明这个拆分逻辑是通用的。 ].md]
**Skill 不是提前规划出来的，而是被真实错误倒逼出来的**——某个场景反复出错、发现"这类问题每次都要纠正"时，就是需要固化成 Skill 的信号。 ].md]

## SubAgent：上下文隔离与 Memory 传递
SubAgent 解决长链路任务中的上下文膨胀问题。把长链路任务按步骤拆开，每个步骤交给一个 SubAgent 处理，各自有完全隔离的上下文，互不干扰。 ].md]
**上下文隔离的代价**：SubAgent 之间信息割裂，后续步骤不知道前序步骤做了什么。 ].md]
**解决：Agent-Memory 机制** ].md]
每个 SubAgent 完成工作后，把关键信息提炼成结构化文件存下来，下一个 SubAgent 启动时读取这份文件，在自己的独立上下文里继续推进。 ].md]
Memory 文件的关键区别：**不是对话记录的备份，而是"后续步骤需要什么"的提炼**。有效的做法是只提炼结构化的关键信息，比如资源映射表、模块结构配置、已确认的接口契约。 ].md]
**判断标准**：这个步骤的输入，是不是依赖上一个步骤的产出？是就用 SubAgent 拆开，步骤之间通过 Memory 传递关键信息。及早拆分任务，比等到幻觉出现再排查效率高很多。 ].md]

## Agent Team：四路并行与 Mailbox 协调
Agent Team 把四类提取任务（UI 组件、布局文件、业务逻辑、资源文件）分给四个专业 Teammate 并行执行，各自独立上下文，只关注自己负责的那类文件。 ].md]
**并行相比串行的核心优势**：总耗时接近四类任务里最慢的那条路径，而不是四段累加。但更重要的是专注度提升带来的提取质量改善——一个 Teammate 只盯一类文件，对该类型的依赖模式会建立更强的识别，这是混合处理时很难做到的。 ].md]
**跨 Teammate 依赖：Mailbox 消息通道** ].md]
四路并行并不是完全独立的。实际会遇到跨类型依赖（UI 发现 Dialog 需补充布局、业务发现字符串资源需补充）。通过 Mailbox 消息通道实时处理，不需要等一个提取全部完成再补充。 ].md]

## 核心设计原则
1. **任务间有没有强依赖是唯一选型依据**：有依赖需要串行 → SubAgent；没有强依赖可以并行 → Agent Team；具体执行动作 → Skill ].md]
2. **Memory 要提炼不要备份**：传递"后续步骤需要消费的结构化信息"，而非聊天记录原样 ].md]
3. **上下文膨胀的临界点比想象中早**：漂移比崩溃更危险，及早拆分任务更划算 ].md]
4. **Skill 的质量决定整体稳定性**：骨架上每个节点能不能稳定输出，取决于 Skill 有没有真正约束执行过程 ].md]

## 深度分析
1. **三层架构揭示 AI 工程化的核心矛盾：执行稳定性与上下文管理的权衡** ].md]
   Skill 解决"同一件事做十遍结果不一样"，SubAgent 解决"任务链路越长幻觉越多"，Agent Team 解决"并行任务串行处理效率低"。这三个问题并非独立，而是 AI 在复杂工程场景下必然遇到的递进挑战——执行层的不稳定会累积成上下文层的幻觉，上下文膨胀又制约了并行协作的可能性。三层架构的价值在于为每一层提供了针对性的解法，而非试图用单一机制应对所有问题。 ].md]
2. **extractor→validator→fixer 模式是跨场景通用的质量门禁设计** ].md]
   这个三元组最初用于解决"AI 自己审查自己"的心理盲区——当提取和校验在同一个 Agent 内完成，Agent 会天然认为自己的输出没问题。后来这个模式被代码转化阶段直接复用（converter → validator → fixer），证明其结构与具体任务类型无关，本质是一种"生成→独立校验→定向修复"的流水线设计。它解决的问题本质是：让生成者和校验者拥有独立的评估视角。 ].md]
3. **Memory 的设计哲学是架构解耦的关键：SubAgent 之间不传递历史，只传递结构化的后续消费信息** ].md]
   网盘案例中，UI 转化 SubAgent 必须知道资源映射表才能准确处理引用，但不需要知道资源提取过程中的对话细节。这个区别非常重要：Memory 文件的设计目标是支撑下游步骤的执行，而不是记录上游步骤的执行过程。这意味着 Memory 的内容应该由下游步骤的输入需求反推得出，而非由上游步骤自行决定输出什么。 ].md]
4. **Agent Team 的专注度提升收益往往被低估：并行不只是效率问题，更是质量保险** ].md]
   四个 Teammate 各司其职带来的质量改善，比时间缩短更难量化但更值得关注。当一个 Agent 同时处理 UI、布局、业务、资源四类文件时，它的注意力是分散的，对每类文件的依赖模式认知是浅层的。而专注布局的 Teammate 对 include 嵌套引用的识别准确率会显著高于通用 Agent。这种专注度形成的模式识别能力，是并行架构独有的隐性收益。 ].md]
5. **上下文膨胀的隐蔽性在于漂移而非崩溃：幻觉的早期症状极难察觉** ].md]
   幻觉出现时不是突然全错，而是逐渐偏离——每一步的输出看起来都还在合理范围内，直到最后才发现方向已经不对。这个特性使得上下文膨胀比明显的崩溃更难处理，因为它推迟了问题的发现时机。"及早拆分任务"的本质是在漂移幅度尚小、定位成本尚低时主动制造断点，而非等到问题暴露再被动排查。 ].md]

## 实践启示
1. **从第一个真实错误开始设计 Skill，而非从预期行为出发** ].md]
   规范的边界条件不是规划出来的，是踩出来的。某个场景反复出错、每次都要手动纠正时，才是固化 Skill 的最佳时机——此时团队已经清楚问题所在，规则的适用范围和限制也最明确。先用粗糙流程跑通全链路，再把高频出错点逐一固化成 Skill，是更高效的演进路径。 ].md]
2. **Memory 文件由下游需求驱动设计，而非上游自行决定** ].md]
   在设计 SubAgent 间的 Memory 传递时，应该先问"下游步骤真正需要什么输入才能正确执行"，再据此设计 Memory 的结构和内容。如果只把对话记录原样存下来再读进去，上下文一样会膨胀。有效的做法是：下游 SubAgent 启动时，其 prompt 中应该已经包含了前序步骤产出的结构化信息，而非需要自己去解析的非结构化记录。 ].md]
3. **用单依赖判断作为架构选型的唯一准则，消除选型时的过度思考** ].md]
   "这个步骤的输入是不是依赖上一个步骤的产出"是判断 SubAgent vs Agent Team 的唯一准则。不需要考虑任务复杂度、文件数量或模型能力——这些因素只会增加选型的不确定性。强依赖串行，弱依赖并行，这个规则足够简单，也足够稳定。 ].md]
4. **为 Teammate 间的跨类型依赖预留 Mailbox 机制，而非假设完全独立** ].md]
   即使任务看起来可以完全并行，实际运行中总会出现跨类型依赖（UI 发现 Dialog 需补充布局、业务发现缺字符串资源）。Agent Team 设计阶段就应该预留 Mailbox 消息通道，否则跨依赖只能通过重新启动一轮任务来解决，代价极高。Mailbox 的实现可以是共享文件、消息队列或任何异步通信机制，关键是解耦发送和接收的时序。 ].md]
5. **在提取阶段投入足够的 Skill 规范，因为后续所有阶段都依赖它** ].md]
   整体方案的稳定性由 Skill 的规范质量决定，SubAgent 和 Agent Team 提供的是调度骨架，骨架上每个节点能不能稳定输出，取决于 Skill 有没有真正约束执行过程。这意味着在三层架构中，Skill 层的基础设施投入回报率最高——一个 extractor Skill 的改进会同时惠及所有使用它的 Teammate 和 SubAgent。 ].md]
## 相关实体
- [Baidu Netdisk Kmp Migration Three Layer Agent Architecture](https://github.com/QianJinGuo/wiki/blob/main/entities/baidu-netdisk-kmp-migration-three-layer-agent-architecture.md)
- [Agent Memory Engineering Tax Aws China 2026](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-memory-engineering-tax-aws-china-2026.md)
- [Ai Skill Skill Creator 源码拆解](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-skill-skill-creator-源码拆解.md)
- [From Agent Protocol To Harness Skill](https://github.com/QianJinGuo/wiki/blob/main/entities/from-agent-protocol-to-harness-skill.md)
- [Staragent Webterminal Cli Ali Infra Cli As Agent Hands](https://github.com/QianJinGuo/wiki/blob/main/entities/staragent-webterminal-cli-ali-infra-cli-as-agent-hands.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/baidu-netdisk-kmp-migration-three-layer-agent-architecture.md)].md]

---

## Ch07.024 Claude Code MCP Server

> 📊 Level ⭐⭐ | 10.4KB | `entities/claude-code-mcp-server.md`

## 核心洞察
**MCP（Model Context Protocol）是 Anthropic 提出的开放协议，让 Claude Code 能调用外部服务提供的工具。它是 `tool_use` 最直接的应用——模型触发后，客户端向外部 MCP Server 进程发起 RPC 调用，拿到真实结果。**
MCP 在 Claude Code 中占据两个 API 位置：`tools[]` 注册工具 + `system` 动态区域注入 Server 级 instructions。这是 Claude Code 四个被分析框架（Codex、OpenCode、Gemini-CLI）中**唯一对 MCP 有完整原生实现**的。

## MCP 实现机制
### 配置与连接
MCP 服务器定义在 `~/.claude.json`（user scope）或项目根目录的 `.mcp.json`（project scope）中。连接建立后，Claude Code 通过 MCP SDK 与 Server 完成 `initialize` 握手，获取工具列表和 Server 返回的 **instructions 字段**。

### API 两个位置
**位置一：`tools[]` — 工具定义**
每个 MCP 工具通过 `toolToAPISchema()` 转换为 `tools[]` 格式，命名遵循 `mcp__<serverName>__<toolName>` 模式：
```javascript
async function toolToAPISchema(tool, options) {
    return {
        name: tool.name,        // 如 "mcp__github__create_issue"
        description: await tool.prompt(),  // 工具描述 → tools[].description
        input_schema: tool.inputJSONSchema
    };
}
```
**位置二：`system` — Server 级 instructions**
在系统提示词构建过程中，`getMcpInstructions()` 将所有已连接 Server 的 instructions 拼接进 system 的**动态区域**：
```javascript
function getMcpInstructions(mcpClients) {
    const clientsWithInstructions = mcpClients
        .filter(c => c.type === "connected")
        .filter(c => c.instructions);
    if (clientsWithInstructions.length === 0) return null;
    return `# MCP Server Instructions\n\n${clientsWithInstructions.map(c => `## ${c.name}\n${c.instructions}`).join("\n\n")}`;
}
```
`tools[].description` 描述单工具行为，system 中的 instructions 描述整个 Server 的使用指南。

### 执行流程：真正的 RPC 调用
```
模型输出 tool_use: { name: "mcp__github__create_issue", input: {...} }
↓ Claude Code 识别 mcp__ 前缀，路由到对应 MCP Client
↓ MCP Client 发送 JSON-RPC 请求到 MCP Server 进程
↓ MCP Server 执行实际操作（如调用 GitHub API）
↓ 返回真实结果
↓ tool_result.content = MCP Server 的真实输出
↓ 模型读取结果，继续推理
```
**MCP 是名副其实的"远程过程调用"**。`tool_result` 里装的是**外部世界的真实数据**。

## 深度分析
### MCP 祛魅：很多场景下一条 Bash 就够了
理解源码实现后，一个自然的问题浮现：模型已经有 Bash 工具了，为什么还需要 MCP？
对模型来说，调 `mcp__github__list_issues` 和执行 `gh issue list` 拿到的结果没有本质区别——都是 `tool_result` 里的一段文本。但 MCP 多了一个 Server 进程、一层 JSON-RPC 通信、一套配置和维护成本。
实际使用中，查 GitHub 用 `gh`，读数据库用 `psql`，调 API 用 `curl`，大量 MCP Server 做的事一条命令就能替代。

### MCP 真正不可替代的场景
1. **持久化连接和状态管理**：Bash 每次是新进程没有状态。数据库连接池、WebSocket 长连接、跨调用共享认证 session，MCP Server 作为常驻进程可以做到。
2. **复杂操作的原子封装**：把 5 步 Bash 命令封装成一次 MCP 调用，减少模型拼长命令出错的概率。
3. **权限隔离和安全约束**：Bash "什么都能干"，MCP Server 可以限制模型只执行预定义操作。
**MCP 的价值不在于"能调用外部系统"（Bash 也能），而在于"以更安全、更可靠的方式调用外部系统"。**

### MCP Server 的 instructions 字段
MCP Server 可以通过 `initialize` 响应的 `instructions` 字段，向模型传达**整个 Server 级别的使用指南**，比如"优先使用 search 工具而非 list 工具"、"所有日期参数必须用 ISO 格式"等。这些指导信息是全局性的，不是针对单个工具的。
当 feature gate `isMcpInstructionsDeltaEnabled()` 开启时，MCP instructions 会改走 attachment 注入而非 system，以避免 Server 连接/断开破坏 prompt 缓存。

## 实践启示
1. **先问：Bash 能不能搞定？**
   如果只是简单的 CLI 操作（`gh`、`curl`、`psql`），直接让模型用 Bash，别折腾 MCP。MCP 引入的是额外的维护负担。
2. **持久化状态场景优先考虑 MCP**
   需要数据库连接池、认证 session 复用、WebSocket 长连接时，MCP Server 作为常驻进程的优势就显现了。
3. **用 instructions 字段提供 Server 级使用指南**
   大多数 MCP Server 作者没写这个可选字段。作为 Server 开发者，写好 instructions 能让模型更准确地使用你的工具集。
4. **权限隔离是企业级 MCP 的核心价值**
   在团队场景中，MCP Server 可以限制模型只执行预定义操作，比给模型一个万能 Bash 安全得多。
5. **MCP 工具和内置工具对模型没有区别**
   `tools[]` 里格式完全一致，模型无法区分。区别只在 Agent 侧的执行路由：内置工具本地执行，MCP 工具转发到外部 Server。
> 参考源码：claude-code-source-code v2.1.88（泄漏源码） https://github.com/anthropics/claude-code
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-skills-mcp-rules-source-analysis.md)

## 相关实体
- [Claude Code 源码解析：Skills/MCP/Rules 底层机制对比](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-skills-mcp-rules-source-analysis.md)
- [两万字详解Claude Code源码核心机制](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-20000-char-source-analysis.md)
- [Claude Code 源码深度解析（13 核心机制）](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-source-deep-dive-warrior.md)
- [Anthropic 官方生产级 Agent 最佳实践：12 个可复用的 MCP 设计模式](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-12-mcp-production-patterns.md)
- [AgentCore Runtime 部署 Apache Doris MCP Server](https://github.com/QianJinGuo/wiki/blob/main/entities/runtime-deploy-apache-doris-mcp-server-quick-suite-ai-analytics.md)
- [从Vibe Coding到Agentic Engineering：重构后台开发全流程 — 腾讯技术工程](https://github.com/QianJinGuo/wiki/blob/main/entities/tencent-vibe-coding-to-agentic-engineering-backend.md)
- [Boris Cherny — 从 IDE 到 Agent 控制台](https://github.com/QianJinGuo/wiki/blob/main/entities/boris-cherny-ide-to-agent-console.md)
- [读完 Claude Code 源码才发现 Skills/MCP/Rules 的区别远没有你想的那么大](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-skills-mcp-rules-source-analysis.md)
- [AI Agent 探索之路：从 Task-Driven 到 Goal-Driven](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-agent-exploration-path.md)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-harness-deep-understanding.md)
- [Anthropic 官方生产级 Agent 最佳实践：12 个可复用的 MCP 设计模式](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-官方生产级-agent-最佳实践12-个可复用的-mcp-设计模式-v2.md)
- [IMClaw：通过微信/飞书操控ClaudeCode/Codex/GeminiCLI/Pi Agent蜂群](https://github.com/QianJinGuo/wiki/blob/main/entities/imclaw通过微信飞书操控claude-code-coodex-gemini-clipi-agent蜂群.md)
- [Anthropic 官方技能最佳实践：14 个可复用的 Agent Skills 设计模式](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-官方技能最佳实践14-个可复用的-agent-skills-设计模式.md)
- [Claude Code 源码核心机制详解](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-core-internals.md)
- [Claude Code 源码拆解：从启动到多 Agent 扩展层](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-source-architecture.md)
- [Agent 上下文窗口管理对比](https://github.com/QianJinGuo/wiki/blob/main/entities/context-window-management.md)
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](https://github.com/QianJinGuo/wiki/blob/main/entities/boris-cherny-新访谈开发工具正在从-ide-变成-agent-控制台.md)
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](https://github.com/QianJinGuo/wiki/blob/main/entities/boris-cherny-新访谈开发工具正在从-ide-变成-agent-控制台-v2.md)
- [Claude 发布官方报告，承认存在 3 处质量退化问题](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-发布官方报告承认存在-3-处质量退化问题.md)

- [Claude Code 开发负责人：为何放弃 RAG 而选择 Agentic Search](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code开发负责人-为何放弃rag而选择agentic-search.md)
- [Harness如何支撑Agent在生产环境稳定运行？](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-production-agent-engineering-deficit.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/xero-announces-integration-with-anthropics-claude.md)

- [AI Agent 工程师能力地图](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-agent-engineer-capability-map.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/claude-code-complete-guide.md)

---

## Ch07.025 SkillOpt — 微软训练 Skill 文档的方法论

> 📊 Level ⭐⭐ | 10.4KB | `entities/skillopt-microsoft-research-skill-training.md`

# SkillOpt — 微软训练 Skill 文档的方法论

## 核心思想

SkillOpt 的核心洞察：**Agent 的模型参数是冻结的，但 Skill 文档是纯文本，可以随便改**。既然如此，为什么不能像训练神经网络一样，用一套完整的优化流程来迭代优化这份文档呢？

把 Skill 文档当作神经网络的「权重」，用类似的训练循环来优化它。

## 训练循环：深度学习 → 文本空间

| 深度学习概念 | SkillOpt 对应操作 |
|------------|-----------------|
| forward pass | **rollout**：让 Agent 带当前 Skill 文档做一批任务，收集完成情况 |
| gradient | **reflection**：优化器模型分析失败任务，提炼改进方向 |
| weight update | **edit**：对 Skill 文档做 add/delete/replace 三种结构化编辑 |
| learning rate | **textual learning rate**：每轮最多改 L_t 条规则（默认 4 条），cosine decay 衰减 |
| validation checkpoint | **validation gating**：验证集跑一遍，分数没涨则不接受修改 |

## 两个模型分工

- **target model**：被优化的 Agent，模型参数冻结不动
- **optimizer model**：更强的前沿模型，分析 target model 表现并提出修改建议

optimizer model 的成本只在训练阶段产生，部署时完全不需要它。同级别优化器可恢复强优化器 56%-74% 的增益。

## 关键设计

### 克制的学问（textual learning rate）
每轮最多只改 4 条规则。**无限制重写（unbounded）反而更差**，比 L_t=4 低 2-3 分。一次改太多，好的坏的混在一起，验证集无法准确判断哪些有用。

### rejected-edit buffer
被验证集否掉的修改存进缓冲区，reflection 阶段看到这些「前车之鉴」，避免重复犯同样的错。类似训练时的 negative feedback。

### slow/meta update
类似深度学习的 momentum。每个 epoch 结束时跨 epoch 纵向更新，慢更新内容受保护，step 级别编辑不能覆盖它。去掉后 SpreadsheetBench 从 77.5 暴跌到 55.0（**-22.5 分**）。

## 实验结果

### 6 个 benchmark 相比直怼 GPT-5.5

| Benchmark | 直怼 GPT-5.5 | SkillOpt | 提升 |
|-----------|-------------|----------|------|
| SearchQA | 77.7 | 87.3 | +9.6 |
| SpreadsheetBench | 41.8 | 80.7 | **+39.0** |
| OfficeQA | 33.1 | 72.1 | **+39.0** |
| DocVQA | 78.8 | 91.2 | +12.4 |
| LiveMath | 37.6 | 66.9 | +29.3 |
| ALFWorld | 83.6 | 95.5 | +11.9 |
| **平均** | — | — | **+23.5** |

52 个测试格，**全部最优或并列最优**。在 Codex 执行环境中平均 +24.8 分，在 Claude Code 执行环境中平均 +19.1 分。

## 学到的规则特点

优化出来的 Skill 文档（379-1995 tokens，中位数约 920）有三条共同特征：

1. **极度具体**：没有「仔细检查」「认真思考」的空话，每条精确到操作层面
2. **反直觉**：涉及的场景人类写 Skill 时压根不会想到
3. **紧凑**：最终 Skill 文件小而精

### 规则示例

**ALFWorld**：维护一个包含地平线感知的已访问/前沿位置清单，在连续相同类型的失败后切换搜索方向，并在拿到目标物品之前避免重新访问目的地。→ 教会 Agent 在虚拟环境中做空间记忆管理，防止在同一个地方转圈。

**SpreadsheetBench**：先检查工作簿结构和公式，然后在整个请求的目标范围内写入已计算的静态值，而非依赖 Excel 自动重算。→ 抓住关键 bug：自动化环境中 Agent 写 Excel 公式期望自动计算，往往靠不住。

**SearchQA**：根据线索的措辞推断预期答案的类型，然后从共现的独特证据中选择最短的规范实体。

## 跨模型跨环境迁移

训练成本一次性付出（离线），部署零额外开销。优化后的 Skill 是纯文本，跨模型、跨执行环境迁移：

| 迁移类型 | 示例 | 提升 |
|---------|------|------|
| 跨模型 | GPT-5.4 → GPT-5.4-mini | +9.4 |
| 跨环境 | Codex → Claude Code | +59.7 |
| 跨任务 | OlympiadBench → Omni-MATH | +3.7 |

## 训练成本

- 流程类 benchmark（SearchQA、DocVQA）：每提升 1 分需 0.6-3.6M 训练 token
- 复杂轨迹类（SpreadsheetBench、ALFWorld）：需 37.9-46.4M token

一次性训练成本，后续每次使用零额外成本。

## 局限

SkillOpt 需要任务有可自动评估的标准（exact match 或自动评分器），**开放性任务暂不适用**。

## 深度分析

### 1. 「权重冻结」哲学的普适性
SkillOpt 的核心前提是「模型参数不可动」，这与当前绝大多数生产 Agent 的约束完全一致。这意味着任何能写文本指令的场景，理论上都可以用 SkillOpt 的训练循环来优化。这意味着该方法不依赖模型架构，任何冻结参数的 Agent 都可以套用这套框架。

### 2. Textual Learning Rate 是克制优化的体现
每轮 L_t=4 的限制不是随意的，而是通过实验发现无限制重写会导致「好改混在坏改里」，使验证集失去判断能力。这与深度学习中过大的学习率导致梯度不稳定是同一原理，只是表现形式换成了文本编辑。

### 3. Slow/Meta Update 是系统稳定性的关键
SpreadsheetBench 从 77.5 暴跌到 55.0（-22.5 分）的实验揭示：跨 epoch 的慢更新承担了类似 momentum 的稳定性角色，保护已经学到的有价值规则不被单个 bad step 覆盖。这说明 Skill 文档内部存在「已学到的模式」和「当前轮次探索」的区分，需要梯度累积一样的机制来区分。

### 4. Rejected-Edit Buffer 的 Negative Feedback 本质
将验证集否掉的修改存起来用于后续 reflection 阶段，本质上是在训练一个「已知的错误模式」的记忆库。这是比纯粹 KL 散度正则化更直接的方式——让优化器模型明确知道「这条路走过并且不通」，从而更有效地探索新方向。

### 5. 跨模型迁移的零成本特性
优化后的 Skill 是纯文本，与模型无关、与执行环境无关。GPT-5.4 训练出的 Skill 可以直接给 GPT-5.4-mini 用，Codex 环境训练出的可以直接在 Claude Code 环境跑。这与模型微调形成鲜明对比——微调的权重无法直接迁移，必须重新训练。

## 实践启示

### 1. 为团队 Skill 文档建立 rollout + validation 循环
在引入 SkillOpt 框架之前，团队应首先建立可自动评估的 benchmark 套件——这是 SkillOpt 工作的前提条件。没有自动化评分，就无法做 validation gating，整个训练循环就无法运转。可以从 Exact Match 起步，逐步引入启发式评分器。

### 2. 严格控制每次修改的规则数量
当开始迭代优化 Skill 文档时，每轮编辑不超过 4 条规则。如果一次性重写大量规则，验证集无法归因哪些修改有正向价值。推荐使用结构化的 add/delete/replace 操作而非自由文本替换，保持编辑的结构性。

### 3. 维护 rejected-edit buffer 并在 reflection 中主动查询
当某个修改被验证集拒绝时，必须将其存入 buffer。在后续 reflection 阶段，优化器模型应优先查询该 buffer，避免重复提出类似的修改建议。这个机制是 SkillOpt 在复杂轨迹类任务（SpreadsheetBench、ALFWorld）取得突破的关键。

### 4. 区分 step-level 和 epoch-level 的更新，保护慢更新内容
在实现 SkillOpt 训练循环时，需要显式区分两种更新频率：当前 epoch 内每个 step 的编辑（可能被验证集拒绝），以及跨 epoch 的慢更新（step-level 编辑不能覆盖）。这条机制去掉后性能崩溃表明它承担了稳定性核心角色，不可省略。

### 5. 跨模型/跨环境迁移时直接复用优化后的 Skill
当组织在不同模型或不同执行环境（Codex → Claude Code）之间迁移 Agent 能力时，不需要重新训练——可以直接将优化后的纯文本 Skill 文档迁移过去，在新环境中运行 rollout 验证效果。成本从 37.9-46.4M token 降至接近零。

## 相关链接

- 论文：https://arxiv.org/abs/2605.23904
- GitHub：https://github.com/microsoft/SkillOpt
- 项目主页：https://microsoft.github.io/SkillOpt/

## 相关实体
- [Tencent Skill Writing Complete Playbook Jackjchou](https://github.com/QianJinGuo/wiki/blob/main/entities/tencent-skill-writing-complete-playbook-jackjchou.md)
- [Claude Design Skill](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-design-skill.md)
- [Git Repo Based Pm Automation](https://github.com/QianJinGuo/wiki/blob/main/entities/git-repo-based-pm-automation.md)
- [Ai Skill Skill Creator 源码拆解](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-skill-skill-creator-源码拆解.md)
- [Qoder Skill Ui Agent Human Collaboration](https://github.com/QianJinGuo/wiki/blob/main/entities/qoder-skill-ui-agent-human-collaboration.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/skillopt-microsoft-train-skill-like-neural-network.md)

---

## Ch07.026 微信读书官方skill与huashu-weread增强版

> 📊 Level ⭐⭐ | 10.3KB | `entities/weread-official-skill-huashu-critical-gap.md`

## 微信读书官方skill（weread skill）
**官方链接**：https://weread.qq.com/r/weread-skills ^[https://mp.weixin.qq.com/s/LxgM3qWxd3_gIG14rFO47Q]
**6件开放能力**：查阅书架、书籍搜索、阅读统计、书籍详情、笔记和划线、推荐好书 ^[https://mp.weixin.qq.com/s/LxgM3qWxd3_gIG14rFO47Q]
**安装体验**：两步复制粘贴，全程<1分钟，无配置文件 ^[https://mp.weixin.qq.com/s/LxgM3qWxd3_gIG14rFO47Q]
**核心问题**：推荐书单时不查已读/笔记/书架历史，把读过的书当新书推回——本质是"自然语言包装的搜索接口"，能力之间没有"智能"

## huashu-weread 增强版
**GitHub**：https://github.com/alchaincyf/huashu-weread
在官方weread skill能力之上加一层"读书顾问工作流"： ^[https://mp.weixin.qq.com/s/LxgM3qWxd3_gIG14rFO47Q]

### 4个核心workflow
| 名字 | 干什么 |
|------|-------|
| advisor | 书架+笔记交叉找拼图缺口，验证微信读书是否上架 |
| path | 先判断段位，再给入门到前沿的阶梯书单 |
| alchemy | 把零散划线想法提炼成有结构的读书笔记 |
| review | 输出一段时间的读书复盘（朋友圈/公众号/小红书） |

### 核心方法论
**书架**揭示"主动归类的兴趣"，**笔记**揭示"真读过的书"。只看书架漏信号，只看笔记漏兴趣方向——两者必须交叉。

### alchemy亮点：读书主题演化
TF-IDF聚类5269条划线→14个主题→按年份画占比→揭示人生范式转换。 ^[https://mp.weixin.qq.com/s/LxgM3qWxd3_gIG14rFO47Q]
断崖案例（花叔2023年从公司体系独立）：商业/用户增长/价值投资经典从高位断崖到接近零；演化/叙事/幸福类从2024年开始爆发。
**方法论价值**：任何"年度读书报告"都做不到——不只是统计，而是让人看见自己遗忘的转身时刻。 ^[https://mp.weixin.qq.com/s/LxgM3qWxd3_gIG14rFO47Q]

## 关键洞察
1. 官方skill定位是"能力提供者"，huashu-weread定位是"读书顾问"，两件事缺一不可 ^[https://mp.weixin.qq.com/s/LxgM3qWxd3_gIG14rFO47Q]
2. 书架+笔记交叉 = 真正的个性化推荐（书架不知道书读得深浅，笔记不知道主动兴趣方向） ^[https://mp.weixin.qq.com/s/LxgM3qWxd3_gIG14rFO47Q]
3. AI把划线数据分组数数，本身就是洞察工具——"没说一句鸡汤，只是把数据摆在面前让自己看见" ^[https://mp.weixin.qq.com/s/LxgM3qWxd3_gIG14rFO47Q]
4. 微信读书真正领先的地方：把账号数据通过API暴露给AI，国内电子书平台几乎只有这一家 ^[https://mp.weixin.qq.com/s/LxgM3qWxd3_gIG14rFO47Q]

## 深度分析
### 1. 数据开放的结构性价值
微信读书将账号数据（书架、阅读统计、笔记划线）通过API暴露给AI，这一动作的重量级被严重低估。在国内电子书平台中，几乎没有第二家这么做。这意味着微信读书选择了"平台做基础设施，生态做智能层"的路线——类似iOS的App Store逻辑，而非Kindle的封闭生态。

### 2. "能力"与"智能"的本质差异
官方skill展示了6件清晰的能力（书架查询、搜索、统计、详情、笔记、推荐），但这些能力是原子化的、没有协同的。huashu-weread的核心创新不是做了新的能力，而是**在工作流层面编排了能力之间的上下文传递**：

- **advisor** 需要同时拿到"书架兴趣信号"和"笔记深度信号"才能推荐，这意味着两个数据源必须同时参与决策
- **path** 需要先做用户段位诊断（来自笔记分析），再用段位结果过滤书单——能力之间有时序依赖
- **alchemy** 需要全量划线数据做TF-IDF，这是统计能力在生成任务中的调用
这一层编排，才是"智能"所在。 ^[https://mp.weixin.qq.com/s/LxgM3qWxd3_gIG14rFO47Q]

### 3. 划线数据的第二曲线价值
 alchemy工作流揭示了一个反直觉的事实：用户的**划线数据比书架数据更接近真实思考**。原因： ^[https://mp.weixin.qq.com/s/LxgM3qWxd3_gIG14rFO47Q]

- 书架是"我想读"（ aspiration ），划线是"我实际读到这里有反应"（ realization ）
- 划线的时间序列可以重建认知演化轨迹——这是任何其他数据源（评分、评论、书架）都无法提供的
- 14个主题的TF-IDF聚类揭示：人生范式转换先于行为变化出现在阅读数据里
这意味着**阅读数据本身就是生命状态的代理指标**，而不只是阅读偏好。 ^[https://mp.weixin.qq.com/s/LxgM3qWxd3_gIG14rFO47Q]

### 4. 增强生态的商业逻辑
huashu-weread证明了"在官方能力上做增强层"这一模式的可行性： ^[https://mp.weixin.qq.com/s/LxgM3qWxd3_gIG14rFO47Q]

- 官方做最难的事：数据API开放、账号体系
- 增强层做最个性化的事：顾问式推荐、演化分析
- 两者不是竞争关系，而是依赖关系——官方API是增强层存在的前提
这是一种健康的平台-生态分工：微信读书稳拿DAU和阅读时长，增强层稳拿深度用户的留存和付费。 ^[https://mp.weixin.qq.com/s/LxgM3qWxd3_gIG14rFO47Q]

## 实践启示
### 给产品/增长团队的启示
1. **优先打通"书架×笔记"交叉数据**：任何知识管理产品，若只开放单一数据源（只有书架或只有笔记），其推荐质量将显著低于交叉数据版本 ^[https://mp.weixin.qq.com/s/LxgM3qWxd3_gIG14rFO47Q]
2. **AI推荐失败的第一表征是"推已读"**：当用户收到"你读过的书"的推荐时，说明系统没有读取用户的阅读历史——这是推荐系统最基础的失效模式 ^[https://mp.weixin.qq.com/s/LxgM3qWxd3_gIG14rFO47Q]
3. **阅读数据的分析维度应包含时间序列**：静态书架分析只解决了"用户对什么感兴趣"，动态划线分析才能回答"用户认知如何演化" ^[https://mp.weixin.qq.com/s/LxgM3qWxd3_gIG14rFO47Q]

### 给个人知识管理爱好者的启示
1. **建立"主动划线"习惯**：划线是比书架更诚实的阅读记录，划线的频率和质量直接决定AI能否帮你做有价值的分析 ^[https://mp.weixin.qq.com/s/LxgM3qWxd3_gIG14rFO47Q]
2. **用alchemy式问题自我诊断**：「我过去一年读的东西，反映了我什么样的认知焦虑或兴趣转移？」——这类问题比"我应该读什么书"更有洞察价值 ^[https://mp.weixin.qq.com/s/LxgM3qWxd3_gIG14rFO47Q]
3. **书架需要定期清理**：花叔书架2078本，读过612本——书架里的"待读"部分是噪声，会干扰推荐系统判断你的真实兴趣 ^[https://mp.weixin.qq.com/s/LxgM3qWxd3_gIG14rFO47Q]

### 给AI/Skill开发者的启示
1. **原子能力不值钱，工作流编排才值钱**：在已有API能力上做编排创新的门槛，远低于从零构建数据平台——这是中小开发者的机会窗口 ^[https://mp.weixin.qq.com/s/LxgM3qWxd3_gIG14rFO47Q]
2. **上下文注入决定推荐质量**：huashu-weread的核心技巧是把"已读/笔记/书架历史"作为context注入prompt，而不是让模型自由发挥——这是RAG思路在个性化推荐中的具体应用 ^[https://mp.weixin.qq.com/s/LxgM3qWxd3_gIG14rFO47Q]
3. **数据聚合后做统计往往比做生成更有价值**：alchemy的洞察不是AI"生成"出来的，而是AI对5269条划线做分组统计后"呈现"出来的——有时候最好的AI产品不需要生成，只需要准确统计 + 可视化呈现 ^[https://mp.weixin.qq.com/s/LxgM3qWxd3_gIG14rFO47Q]
## 相关实体
- [开源 Ai 知识管理搭档 Obsidian Claude Code 完整集成指南 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南-v2.md)
- [Ai Era What To Read World Book Day](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-era-what-to-read-world-book-day.md)
- [Imclaw通过微信飞书操控Claude Code Coodex Gemini Clipi Agent蜂群](https://github.com/QianJinGuo/wiki/blob/main/entities/imclaw通过微信飞书操控claude-code-coodex-gemini-clipi-agent蜂群.md)
- [Tmall Ai Coding Practice Team Knowledge Base](https://github.com/QianJinGuo/wiki/blob/main/entities/tmall-ai-coding-practice-team-knowledge-base.md)
- [Skill Craft](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-craft.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/weread-official-skill-huashu-critical-gap.md)

## 相关工具
- huashu-weread：https://github.com/alchaincyf/huashu-weread

---

## Ch07.027 Securing AI Agents: AWS × Cisco AI Defense 给 MCP / A2A 加上企业级护栏

> 📊 Level ⭐⭐ | 10.2KB | `entities/securing-ai-agents-how-aws-and-cisco-ai-defense-scale-mcp-and-a2a.md`

# Securing AI Agents: AWS × Cisco AI Defense 给 MCP / A2A 加上企业级护栏

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/securing-ai-agents-how-aws-and-cisco-ai-defense-scale-mcp-and-a2a.md)

## 摘要

AWS 和 Cisco AI Defense 在 2026 年 5 月发布合作方案，针对 MCP（Model Context Protocol，2024-11 推出）、A2A（Agent-to-Agent Protocol，2025-04 推出）和新近兴起的 Agent Skills 在企业基础设施中的规模化部署提供安全护栏。核心交付物是 AWS 主导的开源项目 **AI Registry** 与 Cisco AI Defense 的扫描能力集成——在统一控制平面下完成可见性、供应链扫描、合规审计三件大事，把"人工数周评审"压缩为"自动扫描 + 必要时人工复核"。

## 核心要点

- **协议普及速度**：MCP 半年内被企业广泛采用，企业常管理数十到数百个 MCP servers
- **三大安全缺口**：可见性盲区（不知道部署了哪些 Agent / Tools）、安全评审瓶颈（人工流程数周级）、合规审计缺位（无自主 Agent 审计踪迹）
- **核心风险**：未审核的 MCP server、A2A agent、Skills 可能访问敏感系统、违反 SOX/GDPR 合规要求、引入可被利用的漏洞
- **AI Registry 定位**：AWS 主导的开源项目，作为统一控制平面注册和发现所有 MCP server、AI agent、Agent Skill
- **三层防护**：可见性（统一注册）→ 供应链安全（自动扫描）→ 合规审计（自动标签 + 人工复核）
- **Cisco AI Defense 集成**：每个新 MCP/A2A 组件注册时自动扫描，发现问题自动标记为 `security-pending disabled`，必须管理员审核才能启用
- **自服务开通**：自动化扫描配合人工复核，把"人工、慢速"流程变成"自动、内置护栏"流程
- **业内引用**：Akshay Bhargava（Cisco AI Product VP）——「安全是企业 AI 采用的基础要求」

## 深度分析

### 企业 AI Agent 部署的"三盲区"

AWS/Cisco 把企业 AI 部署的核心痛点归纳为三个盲区，每个盲区都有具体的合规和运营后果：

**盲区 1：工具蔓延与可见性缺失**
- 现象：团队 ad-hoc 在云端和本地基础设施上添加 server / agent，安全团队几乎不可能维护全局视图
- 后果：企业不知道有哪些工具可用、哪些 agent 在通信、谁在使用、是否存在安全风险
- 根因：MCP/A2A 的低门槛让"添加一个新 server"变成几行配置，不需要安全团队参与

**盲区 2：供应链安全不可扩展**
- 现象：第三方 MCP server 和 A2A agent 可能包含漏洞、恶意代码、不安全模式
- 后果：手动审查在数量级上完全跟不上部署速度
- 根因：MCP 生态还在早期，没有"应用商店级"的安全审核机制

**盲区 3：合规审计缺位**
- 现象：传统 SOX/GDPR 等合规框架要求审计踪迹，但自主 AI Agent 没有这种设计
- 后果：审计失败带来监管暴露，合规团队难以量化
- 根因：Agent 决策路径是黑盒，合规团队不知道"哪个 Agent 在什么时候访问了什么数据"

### AI Registry + Cisco AI Defense 的三层防护

合作方案的技术核心是把"注册-发现-扫描-审计"四步流水线化：

**层 1：统一注册与发现（AI Registry）**
- 每个 MCP server、AI agent、Agent Skill 必须在统一控制平面注册
- 提供完整可见性：哪些工具可用 / 哪些 agent 互相通信 / 谁在使用 / 是否有安全风险
- 这是"零信任"在 AI 资产上的具体实现——不注册不能使用

**层 2：自动供应链扫描（Cisco AI Defense）**
- 当新 server/agent 添加到注册表时，安全扫描自动执行
- 扫描器分析每个 MCP tool、A2A agent card、Agent Skill，生成详细安全报告
- 发现问题自动标记为 `security-pending disabled`，需要管理员审核
- 适用于所有场景：数据库访问 MCP server、跨基础设施多步工作流 A2A agent 等

**层 3：合规审计 + 自服务开通**
- 自动化扫描 + 人工复核（仅在发现安全漏洞时）实现"内置护栏的自服务开通"
- 把"人工、慢速"流程变成"自动、快速"流程
- 显著加速新 MCP server、agent、Skills 的引入

### 行业意义：企业 AI 安全的"标准化时刻"

这个合作的真正意义不在具体产品，而在它**定义了一个范式**：

1. **"注册制"成为企业 AI 部署的事实标准**：未来每个企业部署 AI Agent 都需要某种形式的注册表，无论叫 AI Registry、Agent Catalog 还是 Tool Inventory
2. **"安全厂商 × 云厂商"合作模式被验证**：Cisco（安全巨头）+ AWS（云巨头）的合作模式可能成为模板，未来 Palo Alto + Azure、Check Point + GCP 都会跟进
3. **"扫描 + 人工复核"成为合规基线**：企业 AI 部署的合规要求从"事后审计"升级为"事前扫描 + 事中标记 + 事后追溯"
4. **MCP/A2A 从"开发者协议"升级为"企业协议"**：随着安全护栏的成熟，MCP/A2A 不再只是 Anthropic / Google 的实验性协议，而是企业级基础设施

### 与 [U Of T Ai Worm Cleverhans Research](https://github.com/QianJinGuo/wiki/blob/main/entities/u-of-t-ai-worm-cleverhans-research.md) 的连接

U of T CleverHans 团队展示的 AI Worm 揭示的威胁场景，与本文描述的"自服务开通 + 安全护栏"形成直接对照：

- **U of T 视角**：AI Agent 在企业外部被武器化作为攻击工具
- **AWS/Cisco 视角**：AI Agent 在企业内部需要被注册、扫描、审计

两个视角共同勾勒出"AI 安全双轨制"：外部威胁需要 AI 行为检测（见 U of T 文章），内部部署需要 AI 资产可见性（见本文）。企业 AI 安全战略必须同时覆盖这两条战线。

### MCP Gateway Registry 的具体价值

AWS 在合作中开源的 **MCP Gateway Registry** 提供"agent 和 server 治理的统一控制平面"，这是合作中最值得开发者关注的部分：

- **统一注册**：避免 server/agent 在不同部门孤立注册
- **版本管理**：跟踪每个 server/agent 的版本、配置变更
- **权限控制**：基于角色限制谁能调用哪个 server
- **审计日志**：所有调用留痕，支持合规审计
- **策略执行**：统一的工具白名单、调用频率限制

这与 [Qy_Zacztcs1Ql3Bifmbmgg](https://github.com/QianJinGuo/wiki/blob/main/entities/qy_zaCZTCs1Ql3BIFmBMgg.md) 中 Claude Code Subagent 的 `description` 路由机制形成有趣对照——Subagent 是"agent → 工具"的小尺度路由，MCP Gateway Registry 是"agent → 工具"的企业级路由。两者本质上是同一种抽象在不同尺度的实现。

## 实践启示

- **企业 AI 战略必须包含"AI 资产清单"**：没有 AI 资产清单就没有 AI 风险管理。AI Registry 应该作为企业 AI 平台的第一块基石
- **MCP server 管理需要类 API Gateway 思维**：每个 MCP server 都是一个潜在攻击向量，需要集中治理而不是 ad-hoc 添加
- **"扫描 + 人工复核"是合规基线**：纯自动扫描会有误报，纯人工审查不可扩展。两者的结合是当前最务实的路径
- **关注 MCP / A2A 协议的安全规范演进**：协议本身的安全设计（如 token 传递、调用链追溯）会直接影响企业架构决策
- **多厂商合作模式可能成为企业 AI 安全事实标准**：单家厂商无法同时覆盖"协议层 + 基础设施层 + 安全扫描层"，需要生态合作
- **安全是架构设计的核心而非事后补丁**：在 Agent 部署的初期就把安全护栏纳入设计，比后期补漏成本低一个数量级
- **MCP Gateway Registry 应该优先内部建设**：在依赖外部开源项目前，评估是否可以基于开源版本定制内部版本，避免供应商锁定

## 相关实体

- [U Of T Ai Worm Cleverhans Research](https://github.com/QianJinGuo/wiki/blob/main/entities/u-of-t-ai-worm-cleverhans-research.md)
- [Qy_Zacztcs1Ql3Bifmbmgg](https://github.com/QianJinGuo/wiki/blob/main/entities/qy_zaCZTCs1Ql3BIFmBMgg.md)
- [Claude Code Harness Deep Understanding](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-harness-deep-understanding.md)
- [Harness Engineering Core Patterns Claude Code](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-engineering-core-patterns-claude-code.md)
- [Ai Agent Engineer Learning Roadmap Backend 2026](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-agent-engineer-learning-roadmap-backend-2026.md)
- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](https://github.com/QianJinGuo/wiki/blob/main/entities/agentops-operationalize-agentic-ai-at-scale-with-amazon-bedr.md)
- [Agent Security Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-security-architecture.md)
- [Mcp Protocol Ecosystem](https://github.com/QianJinGuo/wiki/blob/main/concepts/mcp-protocol-ecosystem.md)
- [Llm Security Red Teaming](https://github.com/QianJinGuo/wiki/blob/main/concepts/llm-security-red-teaming.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/securing-ai-agents-how-aws-and-cisco-ai-defense-scale-mcp-and-a2a.md)
- [电商 ai 操作系统崛起：从「工具人」到「all in one」+ 行业 knowhow skill 化 + 5 巨头](https://github.com/QianJinGuo/wiki/blob/main/entities/ecommerce-ai-os-all-in-one-storeclaw-geek-park-2026.md)

---

## Ch07.028 电商 AI 操作系统崛起：从「工具人」到「All in One」+ 行业 KnowHow Skill 化 + 5 巨头 Headless 布局

> 📊 Level ⭐⭐ | 10.1KB | `entities/ecommerce-ai-os-all-in-one-storeclaw-geek-park-2026.md`

# 电商 AI 操作系统崛起：从「工具人」到「All in One」

> 原文存档：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ecommerce-ai-os-all-in-one-storeclaw-geek-park-2026.md)

> **说明**：原文含 StoreClaw 产品案例展示段落。本文已对产品部分做批判性吸收，重点保留**行业趋势 + 5 巨头布局 + 案例数据 + Token 成本数据点**。

## 一句话定位

**电商是 AI 操作系统（AI OS）最先落地的行业之一**。从「十几后台 + 十几 AI 用法 = 上百种人肉搬运」到「一个统一 Agent 入口 + 跨场景能力调用 = 行业基础设施」—— 这是 Salesforce/Amazon/Shopify/SAP/Atlassian/Google 在 2026 年的共同押注。

## 行业背景：AI 工具的「摩尔定律」

2025 到 2026 年，**AI 工具的供给密度提升，正以远超摩尔定律晶体管密度提升的速度一路狂奔**。

电商运营的典型一天：独立站 + 淘宝 + 亚马逊 + 京东 + 拼多多 + 推特 + 小红书 + 抖音 + TikTok → 数据来回下载导出 → ChatGPT 写文案 → Midjourney 出图 → Claude 读表格 → Jasper 写 Listing → Helium10 查关键词。

**十多个软件栈，组合十多种 AI 用法，就变成了上百种不同的人肉搬运数据姿势**。

> 一个吊诡的现象：**AI 的智商日拱一卒，但在工具割裂的背景下，人的劳动强度不降反升**。

## Token 成本急剧增长

| 数据点 | 数值 | 时间 |
|--------|------|------|
| 豆包日均 Token | 1200 亿 → 120 万亿（**+1000×**） | 2024-05 → 2026-03 |
| Deep Research 类任务 | 普通问答的 50× token | - |
| Coding 类场景 | 普通问答的 1000× token | - |
| OpenClaw 30 天账单 | **约 130 万美元** | 2026-05 |

字节也扛不住 1000× 增长的成本压力，豆包等平台从**席位收费转向 token 收费**。

OpenClaw 创始人 Peter Steinberger 2026-05 晒出 30 天 130 万美元账单，**相当于国内 20 个资深工程师一年的薪资**。

## 5 巨头 Headless 布局（All in One 战略）

| 巨头 | 时间 | 动作 |
|------|------|------|
| **Salesforce** | 2026-04 | 整个平台重构为 **Headless 架构**，所有功能通过 API/MCP 工具/CLI 命令对外暴露 |
| **亚马逊** | - | Seller Assistant 做成 Agent 可调用的入口 |
| **Shopify** | - | Magic 和 Sidekick 接进商家后台 |
| **SAP** | - | Joule Agent 嵌进 ERP |
| **Atlassian** | - | Rovo |
| **谷歌 Workspace** | - | 接 Gemini |

**巨头们押注的是同一件事：软件的可见部分，正在被 Agent 入口大幅压缩**。

## 两类解法

### 第一类：平台内置 AI 助手
- 代表：Shopify / Amazon / SAP / Salesforce 内的原生 AI
- 优点：和自有系统融合更深
- 缺点：**只能看到自己的生态**

### 第二类：第三方跨平台工具
- 思路：先搭建**统一的数据层**，再在这个数据层之上调用垂类 Skill
- 代表：**StoreClaw**（Product Hunt 日榜/周榜第一 + 月榜第二）

### StoreClaw 三层架构

1. **超级中枢**：原生集成 Shopify/Amazon/Instagram/LinkedIn/Discord/WhatsApp/Facebook + 自定义 MCP 连接器
2. **统一数据层**：跨平台实时汇总，跨平台分析和归因才有可能
3. **统一执行层**：定时任务（每日经营简报/竞品价格监控/上新/评分变化/库存评论）

## 行业 KnowHow 的 Skill 化（经验平权）

过去，一个成熟运营花三年摸索出来的爆款 Listing 结构、广告组调优节奏、邮件召回最佳时机，是小团队的护城河。这些经验**散落在个人脑子里、Excel 表格里、内部培训文档里，几乎不可能被系统化复用**。

**一个运营离职，往往意味着三年积累的体感被一起带走**。

StoreClaw 预装几十个电商相关 Skills（Listing 优化/关键词研究/GEO/竞品监控/社媒内容/邮件营销/经营日报/评论洞察/智能选品），把高频场景的最佳实践封装成可调用的能力。

## 案例数据（注：产品方自报，仅供参考）

| 案例 | 规模 | 接入前 | 接入后 | 效果 |
|------|------|--------|--------|------|
| **INCENZO**（香氛品牌） | 3 人小团队 | 每周 SEO/技术修复/邮件 + 依赖外包 | 自动化率 85% | 每月省数千美元外包 |
| **Emiteve**（LED 装饰灯） | 年销 $2000 万 | 上新品 1 周 | 单 SKU 2 小时 | 内容成本 $2万→$5K，转化率 10%→14% |

> 注：以上数据均为产品方提供，存在选择性披露可能，**参考价值在数据点而非具体数字**。

## 关键洞察

1. **AI 工具的「摩尔定律」**：AI 工具供给密度正以远超摩尔定律晶体管密度提升的速度增长
2. **Token 成本 1000× 增长**：豆包两年 Token 增长 1000× 是 SaaS 行业范式转变的硬数据
3. **软件形态的转变**：从「界面为中心」转向「Agent 可调用为中心」——这是 5 巨头的共同押注
4. **行业 KnowHow 的「基础设施化」**：经验从「个人脑子」转向「Skill 化封装」是行业效率的真正分水岭
5. **案例数据要批判性看**：85% 自动化率、转化率 14% 等数据都是产品方自报，缺乏第三方验证

## 行业垂类 All in One 画像

**前端是一个统一的 Agent 入口，后端是一组可以跨场景调用的能力。表面上是一个应用，背后是一个行业生态**——这是 All in One 从「效率工具」走向「经营基础设施」的必经之路。

## 为什么电商最先跑出来

1. **电商足够复杂**：天然横跨多平台/多时区/多语言/多规则/多渠道和多种经营指标
2. **效率直接挂钩经营结果**：电商场景中 AI 运营效率**可以直接与经营结果挂钩**

## 与已有电商 AI 实体的对比

| 已有实体 | 视角 | 与本篇关系 |
|---------|------|-----------|
| 电商智能体设计 (AWS Bedrock AgentCore) | AWS 技术栈视角 | 互补（技术栈 vs 行业 OS） |
| OpenClaw 电商平台应用场景 | OpenClaw 工具视角 | 互补（单工具 vs 跨平台） |
| 快时尚电商语音系统 (AWS) | 语音交互电商 Agent | 互补（单点技术 vs 行业 OS） |
| vivo AI 导购 | vivo 单品牌 AI 导购 | 互补（单品牌 vs 行业 OS） |
| Thrive 1 亿投资 Shopify AI | Shopify AI 战略投资 | 互补（资本视角 vs 行业 OS） |

**本篇的独特价值**：从**行业 OS 视角** + **All in One 趋势** + **5 巨头 Headless 布局** + **Token 成本数据点** 4 个维度切入了电商 AI，没有其他实体覆盖。

## 关联引用

→ [电商智能体设计实践 (AWS Bedrock AgentCore)](https://github.com/QianJinGuo/wiki/blob/main/entities/design-and-practical-application-of-intelligent-agents-in-e-commerce-industry.md) — AWS 技术栈视角
→ [OpenClaw 电商平台应用场景](https://github.com/QianJinGuo/wiki/blob/main/entities/exploring-openclaw-use-cases-in-ecommerce-platforms.md) — OpenClaw 工具视角
→ [快时尚电商语音系统 (AWS)](https://github.com/QianJinGuo/wiki/blob/main/entities/fast-fashion-ecommerce-agent-design-8-websocket-voice-system.md) — 语音交互电商 Agent
→ [vivo AI 导购](https://github.com/QianJinGuo/wiki/blob/main/entities/vivo-ai-sales-guide-ecommerce-agent.md) — vivo 单品牌 AI 导购
→ [Thrive 1 亿投资 Shopify AI](https://github.com/QianJinGuo/wiki/blob/main/entities/Thrive-Capital-Bets-100-Million-on-Shopifys-AI-Future.md) — Shopify AI 战略投资
→ [原文存档（本篇）](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ecommerce-ai-os-all-in-one-storeclaw-geek-park-2026.md)

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/tool-use-mcp-patterns.md)

---

## Ch07.029 Qoder Skills 完全指南

> 📊 Level ⭐⭐ | 9.9KB | `entities/qoder-skills-complete-guide.md`

## 核心概念
**Skill** 是 AI 世界里的菜谱（Recipe），是一个开放标准的文件夹，包含一套告诉 AI 如何处理特定任务或工作流的指令。

### Skill 的本质
- **定义**: 教 AI 一次，永久受益 — 不再需要在每次对话中重新解释你的偏好、流程和领域知识
- **文件结构**: kebab-case 命名的文件夹，包含 SKILL.md、scripts/、references/、assets/
- **三级渐进式披露机制**:
  1. YAML Frontmatter（元数据头部）→ 始终加载
  2. SKILL.md 正文 → 按需加载
  3. scripts/references/assets → 执行时按需读取

### 跨平台兼容性
- ✅ Qoder（Quest 模式、AIDE 模式、CLI）
- ✅ Claude.ai 网页端
- ✅ Claude Code CLI
- ✅ JetBrains 插件（即将支持）
- ✅ Claude API（通过 `container.skills` 参数）

## 三大关键对比
| 维度 | Skill | Slash Command | MCP | Rules |
|------|-------|---------------|-----|-------|
| 触发方式 | AI 自主判断 + 可主动 `/` 调用 | 用户主动输入 `/xxx` | 工具调用时自动触发 | 始终在上下文中生效 |
| 内容复杂度 | 高：多步骤、脚本、资源、引用文件 | 低：固定短提示词 | 中：工具接口定义 | 低：全局约束规则 |
| 上下文占用 | 极低（只加载 meta data） | 中 | 高 | 低 |
| 可分发性 | ✅ 天然适合团队共享 | ❌ 难以共享 | ✅ 通过服务端共享 | ❌ 通常个人配置 |

## 三大使用场景
### 场景一：文档与资产创建
适合运营、产品、设计、所有人。需要生成符合特定风格、规范或品牌标准的输出物。

### 场景二：工作流自动化
适合开发、技术管理者、任何有重复性工作的人。多步骤流程，期望每次输出结果一致。

### 场景三：MCP 能力增强
适合已经连接了 MCP 的开发者、技术团队。有了工具访问权限，但缺乏"怎么用好"的工作流知识。

## 安装方式
1. **命令行安装**: `npx skills add <skill-name>`
2. **手动放置**: 复制到 `~/.qoder/skills/` 或 `<项目根>/.qoder/skills/`
3. **Quest 模式生成**: 直接对话让 AI 创建 Skill

## 进阶模式
1. **顺序工作流编排**: 严格按顺序执行的多步流程
2. **跨 MCP 协调**: 工作流跨越多个外部服务
3. **迭代优化循环**: 需要多轮优化才能达到质量标准
4. **上下文感知的工具选择**: 根据文件类型或场景选择不同工具
5. **领域专业知识内嵌**: 将复杂的合规规则、行业知识内嵌到工作流中

## 测试与迭代
- **触发测试**: 确保 Skill 在正确时机加载
- **功能测试**: 运行同一请求 3-5 次，检查一致性
- **基线对比**: 对比有无 Skill 的效果

## 团队协作
- **用户级安装**: `~/.qoder/skills/` — 个人偏好、跨项目通用
- **项目级安装**: `<项目根>/.qoder/skills/` — 团队规范、项目特定流程（推荐提交到 Git）
---
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/qoder-skills-完全指南从零开始让-ai-按你的标准执行-v2.md)

## 深度分析
**Qoder Skills 的本质是"知识封装"而非"工具集成"**。与传统的 prompt 模板或固定指令不同，Skill 通过三级渐进式披露机制（YAML meta → SKILL.md → scripts/references/assets）实现了"按需加载"的知识管理范式。这种设计让 AI 在每次执行时只加载必要的上下文，避免了上下文窗口的浪费，同时保留了深度执行复杂任务的能力。
**开放标准是 Skill 生态的核心竞争力**。文件结构（SKILL.md、scripts/、references/、assets/）采用约定俗成的目录规范，使得任何一个 Skill 都可以在 Qoder、Claude.ai、Claude Code、JetBrains 插件等不同平台间无缝迁移。这种"一次编写，到处运行"的特性，是 Skill 区别于平台私有指令体系的关键。
**三级渐进式披露机制解决了一个核心矛盾**：既要 AI 精确遵循特定规范，又要保持足够的通用性。YAML Frontmatter 始终加载确保元数据可用；SKILL.md 按需加载承载领域知识；scripts/references/assets 执行时按需读取提供深度上下文。这三层设计让 Skill 能够承载从简单单步任务到复杂多步骤工作流的广泛场景。
**Skill 与 MCP 的定位差异值得注意**。MCP 是工具接口定义，擅长解决"AI 能调用什么"的问题；Skill 是工作流知识封装，擅长解决"AI 怎么用好工具"的问题。两者是正交互补的——MCP 提供能力边界，Skill 定义使用模式。

## 实践启示
1. **从高频重复场景切入**：文档生成、代码审查、测试用例创建等具有明确规范的场景是 Skill 的最佳候选。避免为偶发任务创建 Skill，维护成本会抵消收益。
2. **知识精确度优于完整度**：给 AI"恰好够用"的知识比堆砌完整文档更有效。过多信息会导致 AI 分心，过少则无法保证输出质量。经验值：单次 Skill 调用消耗的上下文不超过总窗口的 20%。
3. **项目级 Skill 优于用户级**：团队规范、项目特定流程强烈建议放在 `<项目根>/.qoder/skills/` 并提交 Git。这样可以确保团队成员获得一致的 AI 执行标准，也便于 code review 和版本管理。
4. **Skill 需要迭代测试**：触发测试（是否在正确时机加载）和功能测试（输出是否稳定）是基本要求。建议用同一请求运行 3-5 次观察一致性，并与无 Skill 状态做基线对比。
5. **跨平台发布考虑**：如果你创建的 Skill 具有通用价值，考虑提交到社区 Skill 市场。开放标准意味着平台无关性，但命名和文档需要足够清晰才能被其他用户复用。
6. **与 MCP 协同使用**：已接入 MCP 的开发团队，可以用 Skill 封装"什么场景用什么 MCP 工具"的决策逻辑，让 AI 在正确的上下文自动调用正确的工具。

## 相关实体
- [qoder skills](https://github.com/QianJinGuo/wiki/blob/main/entities/qoder-skills.md)
- [Agent/Skills/Teams 架构演进过程及技术选型之道](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-skills-teams-architecture-evolution-selection-guide.md)
- [Agent 时代架构师技能指南](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-era-architect-skills-guide.md)
- [从 0 到 1 教你写 Agent Skill，让 AI 懂你的"潜规则"](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-skill-writing-guide.md)
- [Hermes Agent](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent.md)
- [你写的 Skill，及格了吗？](https://github.com/QianJinGuo/wiki/blob/main/entities/ni-xie-de-skill-ji-ge-liao-ma.md)
- [Hermes Agent Skill](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent-skill.md)
- [9个Agent技能模块化SageMaker微调生命周期](https://github.com/QianJinGuo/wiki/blob/main/entities/aws-sagemaker-ai-agent-guided-workflows-finetuning.md)
- [重新定义Skill开发：保姆级教程&一站式开发助手发布](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-development-guide-aliyun-2026.md)
- [SkillX — 层次化技能知识库](https://github.com/QianJinGuo/wiki/blob/main/entities/skillx-hierarchical-skill-library.md)
- [Anthropic 14 个 Agent Skills 设计模式](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-agent-skills-design-patterns-14.md)
- [Perplexity 内部 Skill 设计指南：四维体系与维护方法论](https://github.com/QianJinGuo/wiki/blob/main/entities/perplexity-internal-skill-design-guide.md)
- [SkillClaw](https://github.com/QianJinGuo/wiki/blob/main/entities/skillclaw.md)
- [Skill 系统：Agent 如何把经验沉淀成可复用能力](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-skill-system-winty.md)
- [Trace2Skill: 轨迹经验蒸馏为可迁移 Agent Skills](https://github.com/QianJinGuo/wiki/blob/main/entities/trace2skill-trajectory-distillation-agent-skills.md)
- [从Vibe Coding到Agentic Engineering：重构后台开发全流程 — 腾讯技术工程](https://github.com/QianJinGuo/wiki/blob/main/entities/tencent-vibe-coding-to-agentic-engineering-backend.md)
- [Thin Harness Fat Skills](https://github.com/QianJinGuo/wiki/blob/main/entities/thin-harness-fat-skills.md)
- [code intelligence – changelog](https://github.com/QianJinGuo/wiki/blob/main/entities/code-intelligence-changelog-1.md)

---

## Ch07.030 CLI、MCP 和 CLI+Skill，应该如何选？

> 📊 Level ⭐⭐ | 9.8KB | `entities/cli-mcp-skill-architecture-decision-vibecoder.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/cli-mcp-skill-architecture-decision-vibecoder.md)

# CLI、MCP 和 CLI+Skill：企业Agent架构选择指南

## 三个东西不是一层

| 概念 | 关注点 |
|------|--------|
| **MCP** | 能力接入协议——外部系统怎么被 Agent 发现、授权、调用和审计 |
| **CLI** | 执行接口——在某个运行环境里把事情做掉 |
| **Skill** | 工作流封装——Agent 什么时候用工具、按什么顺序、失败怎么处理 |

**组合原则**：Skill 写方法，MCP 管边界，CLI 做执行。

## 决策矩阵

| 场景 | 推荐方案 |
|------|----------|
| 本地开发/个人使用 | CLI+Skill |
| 多个 Agent/客户端复用 | MCP |
| 生产数据/审批/审计 | MCP-like gateway |
| 工具数量很多 | tool search + 分层加载 |
| 大量中间数据 | 模型外处理，只回传摘要 |

## 三层推荐架构

**Skill（方法层）**：放流程和经验——排查告警、发布前检查、事故复盘

**MCP Gateway（治理层）**：工具发现、权限、审计、配额、审批。Agent 只通过少量高层工具表达意图

**底层已有系统**：内部 API、CLI、监控系统——MCP server 只是包装层

**关键原则**：工具粒度要克制，暴露高层意图工具（如 `request_production_change`）而非几百个 REST API tools。

## MCP 的 tools tax 问题

工具数量多时，MCP 必须配 progressive tool discovery——不要把所有工具 schema 一次性注入模型，先给 `search_tools`，模型搜相关工具后再加载具体 schema。

## 上线顺序

1. CLI+Skill 跑通高频工作流（PR review、测试定位、K8s 排查）
2. 评估哪些需要跨团队复用/涉及权限审计
3. 这些才提升为 MCP，加 tool search
4. 保留 CLI——MCP server 内部可以继续调用已有 CLI

**一句话**：小团队 CLI+Skill 跑通，大组织 MCP 建契约，两者一起用效果最好。

## 深度分析

**核心洞察：三层架构的本质是关注点分离**

CLI、MCP 和 Skill 代表了三个不同层次的抽象：
- **CLI** 是执行原语，负责在特定运行环境里完成具体操作
- **MCP** 是治理协议，负责能力发现、授权、调用审计
- **Skill** 是方法论封装，负责编排和决策——什么时候做什么事

这个分离的意义在于：让不同角色在不同层次上工作。Agent 不需要理解 `kubectl` 的所有 flags，只需要知道"查看集群状态"这个高层意图。运维团队在 MCP Gateway 层做权限控制和审计，不需要修改 Skill。

**CLI+Skill 适合Local-first 的根本原因**

CLI 默认不占上下文这个特性被严重低估。Agent 在处理复杂任务时，上下文窗口是最昂贵的资源。当 Agent 调用 CLI 时：
1. 需要什么参数 → 运行时通过 `--help` 获取
2. 输出太长 → 用 `jq`/`rg`/`head`/`tail` 过滤
3. 中间数据太多 → 写到临时文件，只回传摘要

这本质上是"流式上下文管理"——按需拉取、按需过滤、选择性回传。相比之下，把所有 CLI 包装成 MCP tools 并一次性注入 schema，是用空间换时间，反而浪费了宝贵的上下文。

**MCP Gateway 的边界价值**

MCP 的真正价值不在于"让工具更容易被发现"，而在于"让 Agent 的能力边界更清晰"。当 MCP server 挡在 Agent 和内部系统之间时：

- Agent 看不到原始 token，拿不到底层系统的直接访问权
- 所有操作经过 OAuth/RBAC 审计，配额和审批在 server 侧强制执行
- 内部 API 的版本变化对 Agent 透明，只暴露高层意图工具

这是安全架构，不是便利性架构。很多团队把 MCP 当作"更方便的 API 封装"，忽略了它的治理意义。

**工具粒度与模型推理成本的权衡**

暴露高层意图工具（如 `request_production_change`）而非几百个 REST API tools，本质上是在**降低模型的推理复杂度**。模型不需要在几百个工具中选择，只需要表达高层意图，由 MCP server 翻译成具体的系统调用。

当工具数量超过某个阈值（通常在 50-100 个左右）时，模型选择工具的错误率会显著上升。Progressive tool discovery 是工程上的补救，但根本解法是**克制工具粒度，让 MCP server 承担路由责任**。

**上线顺序的实践意义**

推荐的上手路径（CLI+Skill → 评估 → MCP 提升）有深刻的组织心理学基础：

小团队用 CLI+Skill 能快速验证价值，不需要在治理架构上投入太多。当工作流被验证有效后，自然会发现哪些是跨团队复用的公共能力——这些才值得升级为 MCP。这个顺序避免了"过度设计"和"治理先行"常见陷阱。

## 实践启示

### 1. 优先用 CLI+Skill 验证，再考虑 MCP

在决定是否用 MCP 之前，先用 CLI+Skill 把核心工作流跑通。判断标准：这个工作流是否被多个团队反复使用？是否涉及权限审计？如果都不是，先用 CLI+Skill，保持灵活性。

### 2. MCP 的工具 schema 要克制

MCP server 暴露的工具应该是**高层意图工具**，不是 REST API 的 1:1 映射。一个 `search_recent_incidents` 比 20 个 `GET /incidents/{id}`, `POST /incidents`, `PUT /incidents/{id}` 更有价值。工具数量控制在 Agent 能直观理解的范围内（建议不超过 20 个）。

### 3. 用 Progressive Tool Discovery 处理工具爆炸

当工具数量必然很多时（如内部有几十个微服务），不要试图减少工具数量，而是**改变工具的加载方式**：先给 Agent 一个 `search_tools` 轻量工具，让它按需搜索和加载具体 schema。这比一次性注入所有工具 schema 更节省上下文。

### 4. 企业治理优先考虑 MCP Gateway

如果涉及生产数据、审批流程、合规审计，CLI 无法满足要求，因为 Agent 可能直接读取本地凭据或调用数据库。这时候需要 MCP-like gateway，把治理能力前置，Agent 只通过受控的接口操作。

### 5. CLI 可以是 MCP Server 的实现细节

很多 MCP server 的内部实现可以继续调用已有 CLI。这意味着 CLI 不是被替代，而是被更薄地包装。不要因为上了 MCP 就急着把所有 CLI 重写——保持 CLI 的独立性和可测试性，MCP 只是加了一层治理包装。

### 6. 保留 Skill 层的方法论积累

Skill 是组织经验和方法论的载体。不要把 Skill 看作"让 Agent 调用工具的配置文件"，而应该看作**组织最佳实践的编码**。当新成员加入时，应该能通过阅读 Skill 理解："我们团队是怎么做发布前检查的？"、"线上告警应该按什么顺序排查？"

## 关联阅读

## 相关实体
- [Production Ai Agents Mcp Cli Skills Stack Ayi](https://github.com/QianJinGuo/wiki/blob/main/entities/production-ai-agents-mcp-cli-skills-stack-ayi.md)
- [From Agent Protocol To Harness Skill](https://github.com/QianJinGuo/wiki/blob/main/entities/from-agent-protocol-to-harness-skill.md)
- [Claude Code Core Internals](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-core-internals.md)
- [Staragent Webterminal Cli Ali Infra Cli As Agent Hands](https://github.com/QianJinGuo/wiki/blob/main/entities/staragent-webterminal-cli-ali-infra-cli-as-agent-hands.md)
- [Agentscope Java Harness Framework Enterprise Distributed](https://github.com/QianJinGuo/wiki/blob/main/entities/agentscope-java-harness-framework-enterprise-distributed.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/tool-use-mcp-patterns.md)

---

## Ch07.031 The new AI lock-in

> 📊 Level ⭐⭐ | 9.5KB | `entities/new-ai-lock-in.md`

## 核心要点
- **Published Time**: 2026-05-16T22:36:49-06:00
- **核心命题**: AI 供应商锁定（lock-in）并未消失，而是从模型层向上迁移到了编排层（Orchestration）、工作流表面（Workflow Surface）和服务层（Services Layer）
- **MCP 的局限**: Model Context Protocol 降低了集成成本，但无法解决企业级治理、身份和运营信任问题
- **战略重点**: Enterprise IT 应关注编排框架承诺、工作流表面和服务合作伙伴关系，而非点解决方案的模型替换

## 摘要
随着模型替换成本持续下降，AI 供应商锁定正在发生结构性迁移。真正的锁定不在模型层——那里替换越来越容易——而在模型周围的工作流、治理和运营层面。编排框架积累的粘性、工作流管理平面的锁定、以及嵌入运营深处的服务关系，才是构成新一代 AI 锁定的核心。

## 深度分析
### 锁定的三层迁移结构
文章揭示了一个反直觉的事实：供应商越努力让模型可替换，围绕模型的锁定就越牢固。这不是因为供应商故意制造障碍，而是因为**模型周围的集成工作本身就是最难替代的部分**。
**第一层：模型层（正在商品化）**
Claude Code、Codex、Gemini 和本地模型之间的切换成本正在下降。API 层的抽象持续改善，开放标准逐步建立。这一层是供应商最喜欢宣传的战场——因为它最容易替代，也最不需要真正的锁定。
**第二层：编排层（Orchestration Layer，核心锁定点）**
LangGraph 本身是中性工具，但编排逻辑会积累粘性。当 Klarna、Replit、Elastic、Ally 等企业在 LangGraph 上投入一年时间构建 agent 行为、评估、恢复逻辑和可观测性追踪后，它们不会因为竞品发布更快/更便宜的模型就拆除这套系统。关键是：**模型容易换，编排逻辑不容易换**。
这个观察与 [Langgraph State Machine](https://github.com/QianJinGuo/wiki/blob/main/entities/langgraph-state-machine.md) 的分析形成呼应——LangGraph 的状态机模型让工作流逻辑得以持久化，同时也让这些逻辑成为替换成本最高的层面。
**第三层：工作流表面（Workflow Surface，Anthropic 的主战场）**
Anthropic 的 Claude Cowork 战略真正发力的地方是管理平面：私有插件市场、per-user 配置、预构建 HR/金融/投行/设计 agents。企业 IT 不希望 400 个随机 agents 接入合同系统、HR 数据和客户记录——因此**围绕 agent 的管理平面成为产品本身**。
这与 [Ai Gateways Vs Mcp Gateways What Security Teams Need To Know](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-gateways-vs-mcp-gateways-what-security-teams-need-to-know.md) 中关于「管理表面成为产品」的论述高度一致。两者都指向同一个结论：在 agent 时代，**控制平面的所有权等于生态锁定的所有权**。
**第四层：服务层（Services Layer，讽刺的价值迁移）**
AI 价值正在向实施层面迁移。OpenAI、Anthropic、PwC、Accenture、Deloitte 都在训练咨询大军做工作流映射、系统连接和流程重新设计。PwC 与 Anthropic 声称合作将网络安全事件响应从小时级缩短到分钟级，承保周期从 10 周缩短到 10 天——**但这些收益来自数万名了解如何重新设计周围流程的顾问，而非模型本身**。

### MCP 的局限：一个协议不是平台
Model Context Protocol 的价值是真实的——它降低了连接模型与工具、数据源的成本，压缩了维护半打定制化 connectors 的痛苦。但正如文章所强调的，**协议无法解决企业级问题**：谁批准了那个 agent？它能访问哪些数据？其操作如何记录？如何安全关闭一个已经启动但启动者已离开公司的 agent？
这个局限与 [Anthropic Mcp Revisited](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-mcp-revisited.md) 的分析形成互补：MCP 管「能力」连接，Skills 管「编排」逻辑——两者结合才能构建完整的 agent 集成方案。但即便如此，它们仍然无法解决治理和运营信任问题。
Kubernetes 的类比特别恰当：K8s 标准化了容器层，但下一场战斗转移到托管服务、身份、网络、可观测性和数据重力。MCP 正在做类似的事情——**让建筑的一层变得可移植，但将更难的企业问题留在了上一层**。

### 95% 失败率的真正含义
MIT NANDA 报告显示 95% 企业 genAI pilot 未能交付可衡量的业务影响。这个数字对方法论有争议，但即便是更乐观的解读，也将投资与价值捕获之间的差距置于痛苦区间。
大多数失败不是模型能力问题——而是**运营适配问题**：工具不学习工作流，不融入审批路径，不携带正确的权限。它们无法在人们实际工作的环境中存活。这个结论解释了为什么 DeployCo 这类服务公司会存在：客户不需要更聪明的模型，而是需要有人来做将模型接入实际工作流程的枯燥、昂贵、难以替代的工作。

### 战略决策的层次性
文章的核心战略框架是：Enterprise IT 应将注意力从「点解决方案」上移，关注三个真正需要审慎决策的层面：
| 决策层面 | 替换成本 | 持续性 | 关注点 |
|---------|---------|--------|--------|
| 编排框架 | Multi-year code rewrite | 高 | LangGraph vs 其他 |
| 工作流表面 | Behavior change across thousands of employees | 高 | Claude Cowork vs 其他 |
| 服务合作伙伴 | Budget line item with long tail | 中 | PwC vs Accenture vs 其他 |
模型替换成本在 API 层正在下降，但这些决策的替换成本不会。这是它们应该获得更多审查的原因。

## 实践启示
### 针对 Enterprise IT 决策者
**1. 停止在模型选择上过度投资战略资源**
模型替换在 API 层面正变得商品化。将精力集中在真正难以替换的层级——编排逻辑、工作流表面、服务关系。把模型视为可替换的日用品，把集成能力视为战略资产。
**2. 编排框架选择的评估维度**
当评估 LangGraph 或其他编排框架时，不仅要评估其功能和性能，还要评估：

- 迁移成本：如果需要切换，需要重写多少代码？
- 积累的运营知识：团队有多少人熟悉这个框架？
- 可观测性和治理：框架本身是否支持审计、权限控制和行为追踪？
**3. 工作流表面的锁定博弈**
如果选择 Claude Cowork 或类似平台，要认识到管理平面本身就是产品。评估：

- 插件生态的开放性：是否支持第三方工具？
- 数据隔离：不同 team/用户的 agent 是否真正隔离？
- 退出策略：如果需要迁移，导出的工作流定义是否可移植？
**4. 服务合作伙伴关系的尽职调查**
对于 PwC、Accenture、Deloitte 等咨询服务，需要特别关注：

- 知识转移机制：咨询工作完成后，你的团队是否真正学会了运营这些系统？
- 锁定结构：顾问在流程重新设计中积累的本地知识是否会成为更换供应商的障碍？
- 激励机制：咨询公司的利益是否与你的长期运营成本优化一致？
**5. 保持可选性的实用策略**

- 与第二层前沿模型保持可选性，不要完全依赖单一供应商
- Anthropic 开源 Agent Skills 并声称「你创建的技能不锁定在 Claude 上」是正确的对冲
- 但要认识到：技能可以迁移，**集成到工作流中的组织知识和流程习惯不能** 

### 针对 AI 平台/工具开发者
**1. 降低编排层的迁移成本**
如果你的平台积累了编排逻辑，你需要主动投资迁移工具和导出功能。否则当客户意识到被锁定时，关系会走向对抗。
**2. 管理平面的开放性是核心竞争力**
在 Claude Cowork 的模式中，私有插件市场和 per-user 配置成为差异点。开发者需要在「锁定客户」和「提供足够开放性以建立生态」之间找到平衡点。
**3. 投资可观测性和治理能力**
文章强调 MCP 无法解决运营信任问题。这意味着能够提供透明、可审计、可控的 agent 行为的平台将获得竞争优势。

## 相关主题
-  — LangGraph 状态机模型与编排层锁定分析
-  — MCP 协议的真正地盘与 Skills 的分工
-  — 管理平面与控制平面作为产品
- [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/new-ai-lock-in.md)

## ## 相关实体
- [柚漫剧 AI 全流程提效拆解](https://github.com/QianJinGuo/wiki/blob/main/entities/yumanju-ai-full-flow-efficiency.md)

---

## Ch07.032 MapSatisfyBench：首个以满意度为核心目标的地图智能体评测基准

> 📊 Level ⭐⭐ | 9.2KB | `entities/mapsatisfybench-map-agent-satisfaction-eval-gaode-pku.md`

> 原文存档：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mapsatisfybench-map-agent-satisfaction-eval-gaode-pku-2026-06-18.md)

# MapSatisfyBench：从"任务完成"到"满意度感知"的 Agent 评测范式转移

高德地图平台技术中心 AI 评测部联合北京大学推出 MapSatisfyBench——首个以满意度为核心目标的地图智能体评测基准。核心命题：**完成了任务 ≠ 给出了用户愿意接受的方案**。评估范式从"任务完成度"升级为"决策满意度"。

论文：[arxiv.org/abs/2606.17453](https://arxiv.org/abs/2606.17453) | 数据及代码：6 月底开源

## 核心创新

### 评测哲学：不标"正确答案"，标"影响用户接受度的因素"

地图交互本质是一类多解且强情境依赖的开放式决策问题。用户查询仅界定可行解空间，而非唯一最优解。MapSatisfyBench 的核心洞察：**理想的智能体应优先从可用信息源主动恢复隐式约束，在意图模糊条件下做出高接受度决策**，而非依赖澄清追问（高频轻量交互中增加认知负担）。

### 隐式决策因素挖掘：还原-识别-过滤三步法

从大规模匿名地图服务日志中系统性发现影响满意度的隐式决策因素：

1. **还原**：基于全链路交互信号（查询前序操作 + 当前表达 + 查询后序操作 + 最终任务状态）还原决策逻辑，定位原始意图的未满足点
2. **识别**：比对完整需求与显式查询，识别查询未显式表述但会显著缩小可行解空间的隐式因素
3. **过滤**：将每个因素的证据追溯到决策时刻可用的信息源，只保留从可见信息中有据可查的因素——确保评估公平性

### 满意度影响量化：长期偏好 × 即时调制

每个隐式因素通过**证据支持权重**量化对用户接受概率的影响：

**长期偏好概率**（三因子分解模型）：
- **偏好强度**：同一决策维度内支持该因素的操作占比
- **时新性**：近期/非常规证据赋予更高权重
- **时间动量**：偏好形成/巩固/衰减趋势的梯度赋值

**即时成立概率**（习惯-场景博弈）：
- 有效证据圈选：从当天前序交互中圈选仍有效的前序动作
- 奖惩因子映射：基于相关性/连续性/冲突情况映射为分档系数

双重交叉验证信号越强，隐式约束权重越大。既识别稳定倾向，又捕捉"习惯被即时状态覆盖"的关键时刻。

### 五维真值：G(x) = (E, Z, T, C, R)

| 维度 | 符号 | 说明 |
|------|------|------|
| 显式决策约束 | E(x) | query 字面 + 时空背景 → 有效性边界 |
| 隐式决策约束 | Z(x) | 未言明决策因子 + 满意度影响权重 |
| 工具调用轨迹 | T(x) | 预期工具类型/参数/调用顺序 |
| 主动澄清轮次 | C(x) | 澄清频次 → 认知负担控制 |
| 结果可靠性 | R(x) | 响应与工具输出/事实一致性 → 杜绝幻觉 |

### 七维评估指标体系

| 维度 | 指标 | 说明 |
|------|------|------|
| 任务执行 | ECR（显式决策因子完成率） | 显式需求覆盖度 |
| 任务执行 | TS（工具选择准确率） | 工具选择与参数正确性 |
| 结果可靠性 | IFS（信息忠实度分数） | 生成内容与事实一致性 |
| 交互体验 | IISR（隐式决策因子满足率） | 隐式需求洞察与响应 |
| 交互体验 | Eff（交互效率） | 对话轮次与认知负担 |
| 交互体验 | AR（决策可接受概率） | **ECR × IISR**，核心聚合指标 |
| 交互体验 | SES（满意度效率分数） | 高满意度 × 高效率综合效能 |

**关键设计**：AR = ECR × IISR，显式任务未完成或隐式需求缺失均导致显著衰减。SES 进一步引入效率维度：低满意度不可由短轮次补偿，低效交互折损可接受度。

## 关键发现（12 模型实测）

基于 React Agent 框架，评估 GPT 系列、Claude 系列、Gemini 系列、DeepSeek 系列、Qwen 系列共 12 个主流大模型。

### 发现一：能完成任务，但猜不准你

- ECR 普遍 > 0.85（GPT-5.3 达 0.9272）——任务完成能力强
- IISR 最高仅 0.7170（Claude-4.6-Opus）——隐式需求洞察弱
- SES 非思考模式最高分仅 0.2755——满意度效率极低
- **结论**：模型能完成表面任务，却难以满足决定用户接受度的隐式决策因素

### 发现二：缺乏主动获取可用证据的能力

- 所有模型 TS < 50%，Eff < 0.5
- POI 搜索调用次数是特征总结工具的 **23 倍**（16,061 vs 691）
- 评测环境提供了匿名化偏好总结和历史交互统计数据，但模型普遍较少调用
- **结论**：信息客观存在，模型更倾向直接追问用户而非从已有信息中提取线索

### 发现三：思考模式能补课，但补不到满分

- 开启思考模式后 IISR 均有提升，Gemini 3.1 Pro 增幅最大
- 但思考模式下 IISR 仍显著低于 ECR
- **结论**：更长推理链不能完全解决满意度感知决策难题

## 系统设计亮点

- **UserAgent 仿真**：当被评估 Agent 主动问询时，根据真值自动提供最小充分回答，自然扩展到多轮对话场景
- **离线沙箱**：缓存 22 个真实地图服务工具 API 响应，基于 embedding 相似度检索确保可复现公平比较
- **真值质控三阶闭环**：自动生成 → 多 LLM 共识校验 → 专家审定，仅双重验证通过的标注保留在基准中

## 与已有实体的关系

- 与 [高德 SDD/Harness 体系](https://github.com/QianJinGuo/wiki/blob/main/entities/gaode-sdd-harness-team-ai-coding-paradigm-IBJFu.md) 同源（高德技术团队），但聚焦评测而非编码
- 与 [高德 Uplift 模型迭代 Agent](https://github.com/QianJinGuo/wiki/blob/main/entities/gaode-uplift-model-iteration-agent-harness.md) 同源（高德 AI 团队），但聚焦地图交互而非营销算法
- "隐式决策因素"概念与 [Agent 编排范式](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-orchestration-patterns.md) 中"意图恢复"问题呼应——Agent 不应仅执行显式指令，还需主动推断未言明的约束
- AR = ECR × IISR 的"乘法衰减"设计与 [Agent 可靠性](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-reliability-context-drift-tool-hallucination.md) 的"单点失败传播"模式一致
- 12 模型的 ECR vs IISR 差距（任务完成 vs 隐式需求）与 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 中"验证 ≠ 满意"的核心命题呼应

## 实践启示

- **Agent 评测应超越"任务完成度"**：ECR 高不等于用户体验好，隐式需求满足率（IISR）才是"可用→好用"的关键指标
- **主动获取证据 > 追问用户**：Agent 应优先利用已有信息源（偏好历史、上下文）推断隐式约束，减少用户认知负担
- **乘法衰减设计值得借鉴**：AR = ECR × IISR 的设计确保显式和隐式需求都不可偏废——任一维度短板都会拉低整体
- **思考模式是"补课"而非"满分"**：推理链能补全部分隐式因素，但不能替代主动证据获取能力的系统性提升
- **地图交互是 Agent 评测的理想试验场**：多解、强情境依赖、隐式需求丰富——比封闭域任务更能暴露 Agent 的真实能力边界

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mapsatisfybench-map-agent-satisfaction-eval-gaode-pku-2026-06-18.md)

---

## Ch07.033 Matt Pocock Skills — AI编程技能集合

> 📊 Level ⭐⭐ | 9.2KB | `entities/mattpocock-skills-grill-me-grill-with-docs-caveman.md`

## 概述
Matt Pocock（TypeScript 类型系统专家，Total TypeScript 作者）整理的 AI 编程 Skill 集合。14 个 Skill 全部为纯 Markdown 文件，零依赖，零安装。
安装：`npx skills@latest add mattpocock/skills`

## Skill 分类
**工程类（10个）**：grill-with-docs、diagnose、tdd、improve-codebase-architecture、triage、to-prd、to-issues、zoom-out、prototype、setup
**效率类（4个）**：grill-me、caveman、handoff、write-a-skill

## 核心 Skill 详解
### grill-me — 需求追问
**问题**：大多数人在看到错误答案之前不知道自己真正想要什么。
**核心理念**：AI 不停追问用户，直到双方理解完全一致。每次只问一个问题，并给出 AI 的推荐答案供用户确认。
**与 Claude Code 内置 plan mode 的本质区别**：
| | Claude Code plan mode | grill-me |
|---|---|---|
| 交互方式 | 选择题 | 问答题 + AI 推荐 |
| 适用人群 | 有经验的程序员 | 所有用户（包括非技术背景） |
| 输出 | 粗粒度选项 | 完整 PRD |
**安装**：`npx skills@latest add mattpocock/skills/grill-me`

### grill-with-docs — 术语对齐
解决"鸡同鸭讲"问题——你和 AI 对同一概念用不同叫法，导致代码指代混乱。
**三板斧**：
1. **统一语言**：每确定一个概念自动写入 `CONTEXT.md`，后续所有命名统一用术语
2. **交叉验证**：AI 主动对比用户描述和代码实现，指出不一致（"你说支持部分退款，代码只能整单退款——哪个对？"）
3. **ADR 记录**：满足"难撤销 + 不看上下文会困惑 + 有方案取舍"三个条件时建议创建 Architecture Decision Record

### caveman — 极简回复模式
砍掉寒暄、解释性文字和模糊措辞，只保留技术要点。安全/破坏性操作时自动退出该模式。

## 核心理念
这些 Skill 的价值在于：将《程序员修炼之道》《领域驱动设计》《极限编程》等几十年经典工程实践，浓缩成 AI 可执行的格式。
> "AI 编程的速度在加快，但软件工程的根基没变。越快的工具，越需要好的工程实践来兜底。"

## 深度分析
### Skill 的工程本质：从"约束AI"到"约束人"
Matt Pocock 的 Skill 体系代表了一种范式转移。Karpathy 的 CLAUDE.md 思路是"治理AI"——通过约束AI行为来提升输出质量。但 Matt Pocock 走的是"治理人"路线——通过引导用户思考来弥补需求不明确的问题。
这两条路并不矛盾：Karpathy 解决的是"AI 写代码乱"的问题（已知需求，AI 不认真执行）；Matt Pocock 解决的是"用户不知道自己真正要什么"的问题（需求本身就模糊）。

### grill-me 的深层价值：强制延迟满足
grill-me 的核心机制——不停追问、每次只问一个问题——本质上是一种强制性的延迟满足训练。在 AI 时代，人们倾向于"快说出需求、快拿结果"，但软件工程的经典教训是：前期澄清的代价远低于后期返工。
grill-me 将《程序员修炼之道》中"先明晰需求再动手"的原则产品化，通过 AI 追问强制用户面对自己不清晰的决策点。

### 三类 Skill 的协同矩阵
| Skill | 问题类型 | 干预时机 | 核心机制 |
|-------|---------|---------|---------|
| grill-me | 需求模糊 | 开发前 | 追问澄清 |
| grill-with-docs | 术语混乱 | 开发中 | 上下文积累 |
| caveman | 输出冗余 | 开发后 | 压缩回复 |
三者形成完整闭环：grill-me 确保方向正确 → grill-with-docs 确保理解一致 → caveman 确保执行高效。

### 与 DDD/SDD 的渊源
grill-me 对应 DDD 的 Event Storming 环节——通过不断追问将模糊业务愿景精确化。grill-with-docs 直接对应 DDD 的 Ubiquitous Language 实践。caveman 则类似极限编程中的"简洁编程"原则——只做必要的事。
这些 Skill 并非新发明，而是将经典工程方法论重新包装成 AI 可执行的格式。

## 实践启示
### 立即可用的组合
**新项目启动**：grill-me（需求澄清）→ grill-with-docs（术语对齐）→ caveman（开发执行）
这套组合是最高频的使用路径。grill-me 在空目录下运行效果最佳，因为 AI 可以从零开始构建完整的上下文。
**调试场景**：diagnose + caveman 组合。先用 diagnose 系统化定位问题根因，再用 caveman 获取极简解决方案。

### caveman 的安全边界
caveman 模式在安全/破坏性操作时会自动退出，这是关键的设计细节。不要试图绕过这个限制——当 AI 拒绝在 caveman 模式下执行删除操作时，说明该操作需要更审慎的上下文。

### CONTEXT.md 的维护策略
grill-with-docs 会自动积累 CONTEXT.md，但需要定期清理：

- 每完成一个大功能后，合并相关的上下文条目
- 避免 CONTEXT.md 膨胀到失去快速查阅价值
- 术语定义尽量简短：用一句话说明，不要用段落

### ADR 的触发条件
grill-with-docs 建议创建 ADR 时满足三个条件：难撤销、不看上下文会困惑、有方案取舍。实操中这个阈值略高，建议：当团队对某个技术选型出现2次以上分歧时，就创建 ADR 记录决策过程。

### write-a-skill 的正确用法
Matt Pocock 的 Skill 本质上都是 Markdown——这意味着你可以在他的 Skill 基础上定制。可以先安装 `grill-me`，在日常使用中记录它漏掉的问题场景，然后用自己的经验扩展它，最终通过 `write-a-skill` 输出为独立 Skill。

## 完整工作流（6 步）

Matt Pocock Skills 不只是零散命令，它们串成一条完整开发流：

1. **/grill-with-docs** — 需求澄清 + 领域语言沉淀到 CONTEXT.md
2. **/to-prd** — 对话整理成 PRD 文档
3. **/to-issues** — 按用户可感知行为拆垂直切片（不是按文件拆）
4. **/tdd** — red-green-refactor，每次只推进一个可观察行为
5. **/diagnose** — 先复现 → 缩小范围 → 假设 → 验证 → 修复 → 补回归
6. **/improve-codebase-architecture** — 周期性修剪（重复收一收、职责理一理、ADR 补一补）

陌生模块先跑 /zoom-out，从系统层面理解再动手。

## 与其他工作流对比

| 工作流 | 关注重点 | 适合场景 | 取舍 |
|--------|----------|----------|------|
| Matt Pocock Skills | 需求澄清 + 测试 + 诊断 + 架构整理 | 日常开发、长期维护、小团队 | 灵活但需主动决策 |
| GSD | 长周期任务管理 + 上下文延续 | 跨天任务、多文件改动 | 流程完整，小任务略重 |
| BMAD | 角色分工 + 规范化研发 | 从 0 到 1 产品、多人协作 | 体系完整，学习成本高 |
| Superpowers | TDD + 评审纪律 | 重视测试质量 | 对测试纪律要求高 |
| Spec-Kit | 规格驱动开发 | 企业项目、需求评审先行 | 前期投入大，过程可控 |

→ [Superpowers 6.0 SDD 评审重写](https://github.com/QianJinGuo/wiki/blob/main/entities/superpowers-6-sdd-review-redesign-file-handoff.md)
→ [三器合一工程化实战](https://github.com/QianJinGuo/wiki/blob/main/entities/three-tools-in-one-gstack-superpowers-openspec-engineering-ai-coding.md)

## 相关概念
- SDD（Spec-Driven Development） — 规格驱动开发，与 grill-me/grill-with-docs 理念相通
- TDT（Task-Driven Development） — 任务驱动开发，grill-me 追问后最终产出的即为 TDT
## 相关实体
- [Andrej Karpathy Claude Md 134K Stars 2026](https://github.com/QianJinGuo/wiki/blob/main/entities/andrej-karpathy-claude-md-134k-stars-2026.md)
- [Openai Codex 521 Update Appshots Goal Computer Use](https://github.com/QianJinGuo/wiki/blob/main/entities/openai-codex-521-update-appshots-goal-computer-use.md)
- [Graphify Software Engineering Knowledge Graph](https://github.com/QianJinGuo/wiki/blob/main/entities/graphify-software-engineering-knowledge-graph.md)
- [Anthropic Claude Code Large Codebase Best Practices 50002A089323](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-claude-code-large-codebase-best-practices-50002a089323.md)
- [Stepan Gershuni Ai Native Startup Guide](https://github.com/QianJinGuo/wiki/blob/main/entities/stepan-gershuni-ai-native-startup-guide.md)

---

## Ch07.034 autobrowse browserbase persistent skill

> 📊 Level ⭐⭐ | 9.2KB | `entities/autobrowse-browserbase-persistent-skill.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/autobrowse-browserbase-persistent-skill-files.md)

# Autobrowse — 浏览器 Agent 持久记忆：技能文件作为永久技能
## 核心定位
Browserbase（Kyle Jeong, 2026-05-07）提出。核心命题：**让浏览器 Agent 的每次探索都变成可复用的永久技能**——不是向量，不是会话录像，而是任何人都能读懂的 markdown 技能文件。  

## 核心问题：探索税（Discovery Tax）
**定义**：浏览器 Agent 每次会话结束后学到的一切都跟着蒸发，下次运行还得从零开始探索同一个网站。推理能力越来越强，但记忆没有改善。  
**凯恩斯思想实验**：没有海马体的天才，每次从零推导出同样精妙的结论，却无法在昨天的洞察上继续前进。  
**根本瓶颈**：不是推理能力，而是**记忆形式**——现有方案（会话录像、trace、embedding 向量）要么不可读、要么不可复用、要么两者兼有。  

## 核心架构：五步学习循环
```  
Objective → Run → Study → Iterate → Graduate (SKILL.md)  
    ↑                                      ↓  
    ←←←←←←←← strategy.md（跨迭代叠加）←←←←←  
```  
| 步骤 | 作用 |  
|------|------|  
| Objective | 真实任务输入 |  
| Run | 产生完整 trace（工具调用、token 消耗） |  
| Study | Agent 元认知反思（卡点、猜测、不必要 token） |  
| Iterate | strategy.md 叠加学习笔记，跨迭代知识积累 |  
| Graduate | 收敛后输出 SKILL.md + 辅助脚本 |  
**收敛信号**：相邻迭代成本和轮次数改善幅度收窄时主动短路；目标不是全局最优，是"足够好+足够可靠+足够便宜"。  

## 关键设计：记忆 = Markdown 技能文件
**为什么不用向量/截图**：  

- 向量：不可读，跨 Agent 无法复用
- 截图：不可执行，无法版本控制
**SKILL.md 结构**：  

- 名称、描述
- 推荐方法 + 备选路径
- 具体 API 调用步骤（含参数说明）
- 已知坑点和规避方式
- 辅助脚本（CLI、Python helper、CSS 选择器）
**可读性 → 可审计 → 可移交**：从"信任 Agent 输出"跃迁到"读懂 Agent 操作手册"。  

## 量化效果：Craigslist 基准
**任务**：旧金山 Craigslist 两居室公寓搜索，$5000–$7000，带室内洗衣机。  
| 指标 | 原始 Agent | Autobrowse 技能 | 改善 |  
|------|-----------|-----------------|------|  
| 耗时 | 71 秒 | 27 秒 | **2.6x ↓** |  
| 成本 | $0.22 | $0.12 | **45% ↓** |  
| 正确性 | 0 精准命中 | 2 精确匹配 | **✓** |  
**关键洞察**：更快失败不比慢但正确更有价值——正确性是核心指标。  

## 核心发现：JSON API 逆向
**Craigslist 探索发现**：  

- 搜索页面全 JS 渲染，`browse snapshot` 返回 0 个可访问性引用
- 真实数据在 `https://sapi.craigslist.org/web/v8/postings/search/full`（公开 JSON API，无鉴权）
- 坑：`postal=` 参数缺失时按 IP 地理位置返回错误城市
- 人工逆向需数小时，Autobrowse 几次迭代自动发现

## 自批评：Agency 分层框架
| 层级 | 工具 | 适用场景 |  
|------|------|---------|  
| L0 | 确定性 Python + BeautifulSoup | 静态 HTML |  
| L1 | `browse fetch` | 简单动态页面 |  
| L2 | Autobrowse | 高复杂性、需探索的长尾网站 |  
**原则**：先用最低 Agency 工具探一下，能拿到数据就停止；只有低 Agency 工具都失败时才升级到 Autobrowse。  

## 复利与递归
**技能库复利**：每新网站 → 新技能 → 长尾任务越来越便宜。能力工厂模式。  
**递归改进自身**：  

- 迭代循环本身、收敛启发式、技能模板格式 → 也成为被优化的对象
- 不依赖神秘新模型能力，只需方法递归应用

## 相关概念
- [Hermes Agent](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent.md) — self-improving 方向相通，但 Autobrowse 通过显式技能文件实现而非隐式记忆
- [Browser Harness](https://github.com/QianJinGuo/wiki/blob/main/entities/browser-harness.md) — Autobrowse 是 Browser Harness 持久记忆问题的具体答案
- [Agent Skill 编写指南](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-skill-writing.md) — SKILL.md 格式与 Skill 编写规范高度一致，Autobrowse 是这一原则在浏览器场景的工程化实践
- [Factory Mission](https://github.com/QianJinGuo/wiki/blob/main/entities/factory-mission-multi-agent-architecture.md) — 两者都解决"历史探索知识无法积累"问题，但 Factory 侧重多 Agent 协作，Autobrowse 侧重单 Agent 的跨会话持久化
- [Hermes Self-Improving Loop](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-self-improving-loop-winty.md) — 理念高度一致：都通过 markdown 技能文件实现 Agent 持久记忆，强调人类可读性作为可审计性基础，支持版本控制和迭代改进

## 深度分析
### 记忆形式才是根本瓶颈
过去两年浏览器 Agent 的推理能力突飞猛进——JS 渲染、反爬、多步流程、验证码处理均有突破。但跨会话传递知识的能力没有任何改善。Kyle Jeong 的核心论断：现有记忆方案（会话录像、execution trace、embedding 向量）要么不可读，要么不可复用。真正有用的记忆必须同时满足：能被人读懂、能被 Agent 执行、能被团队共享和版本控制。这三个条件指向同一个答案——markdown 技能文件，而非向量数据库或截图。  

### 五步学习循环的收敛机制
Objective → Run → Study → Iterate → Graduate 的五步循环中，真正的知识积累发生在 Iterate 阶段——`strategy.md` 跨迭代叠加，每次新迭代先读这份笔记，确保上次学到的教训不会丢失。收敛信号是相邻迭代成本和轮次数改善幅度收窄时主动短路。关键洞察：目标不是全局最优，而是"足够好 + 足够可靠 + 足够便宜"的三重约束满足。这个终止条件本身就是一种元级别的工程决策，避免无限迭代的资源浪费。  

### JSON API 逆向作为核心发现
Craigslist 基准测试揭示了一个深层模式：浏览器 Agent 的真正瓶颈往往不是推理，而是数据结构发现。搜索页面全 JS 渲染，`browse snapshot` 返回 0 个可访问性引用；真实数据藏在未文档化的公开 JSON API 中。这个发现不是靠人工调研，而是 Autobrowse 几次迭代自动完成的——这说明 Agent 在探索过程中积累的"网站结构知识"比任何静态爬虫规则都更有价值。  

### Agency 分层与工具选择原则
L0（确定性 Python + BeautifulSoup）适合静态 HTML；L1（`browse fetch`）适合简单动态页面；L2（Autobrowse）适合高复杂性、需探索的长尾网站。原则很清晰：先用最低 Agency 工具探一下，能拿到数据就停止；只有低 Agency 工具都失败时才升级到 Autobrowse。这个分层框架解决的是"工具错配"问题——用大炮打蚊子或用蚊子扛大炮都是资源错配。  

### 技能库的复利与递归
每新网站 → 新技能 → 长尾任务越来越便宜。能力工厂模式的核心是复利：技能库增长 → 后续任务成本下降 → 更多任务变得经济可行。更值得关注的是递归自我改进：迭代循环本身、收敛启发式、技能模板格式都成为被优化的对象。这不依赖神秘的新模型能力，只需方法递归应用。  

## 实践启示
**工具选择：先探后用**。遇到网站先用 `browse fetch` 探一下，数据直接在响应里就写解析器；响应为空或需 JS 渲染才升级到 Autobrowse。避免从一开始就用高 Agency 工具，白白付探索税。  
**收敛判断：边际改善收窄即停**。通常 3-5 次迭代后，相邻迭代的成本和轮次改善幅度开始收敛。记住目标不是全局最优，而是三重约束的同时满足——足够好、足够可靠、足够便宜。无限迭代是对资源的浪费。  
**技能文件：可读性是一切的基础**。SKILL.md 的价值在于同时服务两个受众：Agent 能直接加载执行，人类能读懂并审计。工程师可读可编辑可版本控制，非技术人员也能发现错误。从"信任 Agent 输出"跃迁到"读懂 Agent 操作手册"是本质改变。  
**正确性优先于速度**。"更快失败"的 Agent 不比"慢但正确"的 Agent 更有价值。在基准测试中，原始 Agent 60 个全市范围结果 0 精准命中，Autobrowse 技能 2 个精确匹配——这个差距才是关键。速度和成本改善是正确性解决后的副产品。  
**静态 HTML 不用 Autobrowse**。167 行静态 HTML 州立法规目录跑了四次迭代、~$24 美元仍无法单次返回完整数据——这是工具错配的典型教训。这种场景用 ~200 行确定性 Python + BeautifulSoup 即可，亚秒级运行，零推理成本。  
---  
*Last updated: 2026-05-19*  
*评审：Value 8 × Confidence 8 = 64 ✅ PASS | ★★★★*

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/ai-skill-design.md)

---

## Ch07.035 使用 Kiro 和 MCP 自动化大规模升级 RDS MySQL 8.0 至 RDS MySQL 8.4

> 📊 Level ⭐⭐ | 9.0KB | `entities/kiro-mcp-rds-mysql-upgrade.md`

## 概述

本文介绍 RDS MySQL 升级助手，这是一款开源工具，可批量执行 Amazon RDS MySQL 8.0 到 RDS MySQL 8.4 主版本升级。它解决了大规模主版本升级中最棘手的两大难题：系统地修复数百个实例的预检查问题，以及验证升级后的应用程序行为。该工具提供了一个包含 19 项 SQL 预检查的引擎，并附带修复方案、自动化参数组和选项组迁移、蓝绿部署和原地升级编排（包含切换前安全检查）以及应用程序验证框架——所有作业都可以通过 shell 脚本或 Kiro IDE/CLI 的自然语言进行访问。

## 核心能力

- **19 项 SQL 预检查引擎**：系统地修复数百个实例的预检查问题
- **自动化参数组和选项组迁移**
- **蓝绿部署和原地升级编排**：包含切换前安全检查
- **应用程序验证框架**
- **Kiro MCP 集成**：通过 shell 脚本或 Kiro IDE 编排

## 技术细节

该工具解决了大规模主版本升级中最棘手的两大难题：系统地修复数百个实例的预检查问题，以及验证升级后的应用程序行为。

## 相关实体
- [Mcp Serveramazon Bedrock Agentcorequick Suite](https://github.com/QianJinGuo/wiki/blob/main/entities/mcp-serveramazon-bedrock-agentcorequick-suite.md)
- [How A Mid Tier Enterprise Saas Provider Automates Cloud Supp](https://github.com/QianJinGuo/wiki/blob/main/entities/how-a-mid-tier-enterprise-saas-provider-automates-cloud-supp.md)
- [Aws Devops Agent 实战云网络故障自主调查与修复建议](https://github.com/QianJinGuo/wiki/blob/main/entities/aws-devops-agent-实战云网络故障自主调查与修复建议.md)
- [Building A Secure Auth Code Flow Setup Using Agentcore Gatew](https://github.com/QianJinGuo/wiki/blob/main/entities/building-a-secure-auth-code-flow-setup-using-agentcore-gatew.md)
- [Eks Gpu Operator Custom Driver Cuda Workload](https://github.com/QianJinGuo/wiki/blob/main/entities/eks-gpu-operator-custom-driver-cuda-workload.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/kiro-mcp-rds-mysql-upgrade.md)

- [Amazon Quick Mcp Kdbx Time Series](https://github.com/QianJinGuo/wiki/blob/main/entities/amazon-quick-mcp-kdbx-time-series.md)
- [Transforming Rare Cancer Research With Amazon Quick Integrat](https://github.com/QianJinGuo/wiki/blob/main/entities/transforming-rare-cancer-research-with-amazon-quick-integrat.md)
## 深度分析

**1. "Agent + MCP + Shell"三层架构的工程实践意义**

这个工具的架构揭示了 2026 年 AWS 云自动化领域的核心技术模式：**自然语言接口（Kiro）↔ MCP 协议层 ↔ Shell 脚本执行层**。Kiro 作为自然语言前端，降低了 DBA 和运维工程师的操作门槛；MCP 作为标准化协议层，将 shell 脚本封装为工具调用；Shell 脚本作为实际执行层，保持了对 AWS CLI 和 MySQL 客户端的完整控制。这种三层分离的优势在于：(a) Kiro 是可替换的前端——可以用其他 MCP-compatible 工具替代；(b) Shell 脚本可以不依赖 Kiro 直接运行，保持了 CLI-first 的可操作性；(c) MCP 层提供了结构化的工具定义和返回值格式，让 agent 能可靠地理解操作结果。这是一种务实的 Agentic Engineering 架构——不是用 LLM 重写一切，而是将现有脚本生态接入 agent 能力层。

**2. 预检查引擎作为"质量门"的批量执行框架**

工具最有技术深度的组件是 19 项 SQL 预检查引擎。它不是简单调用 MySQL Shell 的 `util.checkForServerUpgrade()`，而是将其逻辑适配为标准 MySQL 客户端可执行的 SQL 查询，在 RDS 环境下工作。关键设计洞察：(a) **分类优先于逐个处理**：检查结果按 ERROR/WARNING 分组，团队可以按发现类型（而非按实例）批量修复，将架构变更执行一次然后推广到所有受影响的实例；(b) **"跳过 RDS 管理的项目"避免误报**：对 RDS 自动管理的 sysVars（removedSysVars、deprecatedDefaultAuth 等）跳过检查，避免在受管环境产生噪音；(c) **预检查 vs RDS 内部检查的互补设计**：工具的检查是预筛选，RDS 的 PrePatchCompatibility 检查是最终门控，两者结合覆盖更全面。

**3. 蓝绿部署与选项组迁移的复杂边界情况处理**

工具对 Blue/Green 部署的处理揭示了 AWS RDS 在混合升级场景下的复杂性：(a) **自定义选项组中的 MEMCACHED 选项在 MySQL 8.4 中不受支持**，工具自动排除而非阻止升级——这是一个务实的"优雅降级"设计；(b) **MARIADB_AUDIT_PLUGIN 的两步骤处理**：对于包含此插件的选项组，工具先以相同版本创建 B/G 部署并关联目标选项组，然后单独将绿色实例升级至 8.4——这是因为 RDS 不支持在单次 B/G 创建中同时指定自定义选项组和主要版本升级；(c) **跨区域只读副本实例不支持 Blue/Green**，工具自动降级为 in-place 升级——这要求批次编排器能正确识别实例类型并分配合适的策略。这些边界情况的处理展示了在大规模自动化中"全面覆盖边界情况"的工程复杂度。

**4. 批次编排器的容错设计：状态持久化与故障隔离**

批次编排器在大规模升级中的关键设计：(a) **状态文件持久化**：中断后可以从断点恢复，不需要重新处理已完成的实例；(b) **并行度控制**：Blue/Green 部署建议 5-10 并行（绿色环境独立构建，不影响生产），in-place 升级建议 3-5 并行（多个数据库同时不可用）；(c) **故障隔离**：失败的实例不会阻塞其余升级；(d) **Precheck 门控**：具有 ERROR 级别发现的实例自动跳过，防止在已知问题下执行升级导致失败。这些设计共同构成了一套生产级别的批次执行框架，适用于数百个实例的并发升级场景。

**5. 应用程序验证的最后一公里：从基础设施检查到业务逻辑验证**

工具内置的 post_upgrade_validate.sh 检查基础设施健康（引擎版本、实例状态、复制、参数组、连接），但承认"应用程序级别的验证才是真正的瓶颈"。工具提供的 app_validate_template.sql 模板让团队定义关键业务查询，在升级后自动执行并与升级前基准比较。核心洞察是：数据库升级的最终验证标准不是"引擎版本号是否正确"，而是"业务关键查询是否仍然返回正确结果"。这个设计将验证责任从工具转移到团队——每个团队需要定义自己的"关键查询"，而工具提供执行框架。

## 实践启示

1. **对于 MySQL 8.0 → 8.4 升级，优先执行 19 项 SQL 预检查**：即使不使用这个工具，在执行升级前手动运行预检查可以提前发现 ERROR 级别问题，避免维护时段内的升级失败。特别关注：FLOAT/DOUBLE 配合 AUTO_INCREMENT 的列类型（必须改为 BIGINT）、binlog_format STATEMENT/MIXED（必须改为 ROW）、keyring 插件移除（MySQL 8.4 不支持 keyring_file、keyring_oci）。

2. **批次编排的并行度需要根据升级策略区分**：Blue/Green 部署时使用更高并行度（5-10），因为绿色环境独立构建，不影响生产环境的稳定性；in-place 升级时使用低并行度（1-3），因为多个数据库同时不可用会对业务造成复合影响。在批次配置中根据实例的 SLA 要求自动分配升级策略，而不是一刀切。

3. **使用"分类优先、批量修复"策略处理预检查发现**：当发现大量同类 WARNING 时（如 innodb_adaptive_hash_index 默认值变更），按类型分组处理比按实例逐个处理效率高 10 倍。修复脚本执行一次，然后在测试实例上验证后再推广到所有受影响实例。

4. **为蓝绿部署的蓝色环境建立 24-48 小时保留窗口**：升级完成后保留旧的蓝色实例 24-48 小时，作为回退路径。虽然 rename 回退会丢失 switchover 后的数据变更，但它提供了一个不需要从快照还原的快速回退选项——这在凌晨升级后的紧急情况下尤其有价值。

5. **通过 MCP 协议将运维脚本封装为可组合工具**：这个工具的架构可以作为其他 AWS 运维自动化的参考模板。将现有的运维脚本（用 AWS CLI、bash、Python）通过 FastMCP 封装为 MCP 服务器，可以在不改变底层脚本的前提下，让任何 MCP-compatible 的 AI 工具调用这些运维能力。这比用 LLM 直接生成 bash 命令的可靠性高得多。 [^raw/articles/kiro-mcp-rds-mysql-upgrade.md:52-500]

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/kiro-mcp-rds-mysql-upgrade.md)

---

## Ch07.036 AI-Infra-Auto-Driven-SKILLS v0.1.0：给 Codex / Claude Code 的推理框架工作流

> 📊 Level ⭐⭐ | 9.0KB | `entities/ai-infra-auto-driven-skills-v0-bbuf-giantpanda.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ai-infra-auto-driven-skills-v0-bbuf-giantpanda.md)

# AI-Infra-Auto-Driven-SKILLS：推理框架工作流编码

## 一句话

BBuf 在 GiantPandaLLM 发文介绍 AI-Infra-Auto-Driven-SKILLS v0.1.0——将推理框架开发的 benchmark/profile/debug 流程整理成 SKILL.md，供 Codex / Claude Code 按步骤执行，遵循工程纪律。

## 核心价值

**问题**：性能优化不适合直接从现象进入源码修改，链条中任何一步缺失，后续结论都不可靠。

**解决**：将 benchmark→profile→源码修改→复测的完整流程编码为 Agent 可执行的 skill，保留人工检查入口。

## 10 个 Core Skills

| Skill | 解决的问题 |
|-------|------------|
| llm-serving-auto-benchmark | 公平的 serving benchmark 搜索 |
| llm-torch-profiler-analysis | torch profiler trace 分析，prefill/decode 分开 |
| llm-pipeline-analysis | kernel timeline 下钻 |
| model-compute-simulation | FLOPs/MFU 估算 |
| sglang/vllm-sota-humanize-loop | 固定 workload 下追 SOTA 性能 |
| sglang-prod-incident-triage | 线上 incident 先提取 replay 再 debug |
| model-pr-optimization-history | 本地知识记录，复用历史 PR 思路 |

## 深度分析

### 1. 工程纪律转化为可执行工作流

BBuf 设计的 AI-Infra-Auto-Driven-SKILLS 核心洞察是：**推理框架性能优化是一个多阶段链条，而非单次修改**。传统的优化方式往往是从现象直接进入源码修改——工程师看到某个指标不达预期，就直接改 kernel 或改配置，但这种做法忽略了一个根本问题：链条中任何一步缺失，后续结论都不可靠。

这个框架将 benchmark→profile→源码修改→复测的完整流程拆解为独立可执行的 skill，每个 skill 都带有明确的输入输出约束和人工检查入口。这种设计使得 Agent 在执行过程中能够：
- 维持跨轮状态，而不是每次都从空白开始
- 记录中间证据，确保结论可复现
- 在关键节点等待人工判断，避免盲目修改

### 2. SOTA Humanize Loop 的设计逻辑

SOTA Humanize Loop 是这个框架中最核心的skill，其设计逻辑体现了"先追踪再超越"的策略：
1. **输入模型和硬件预算** — 明确约束条件
2. **搜索 benchmark 找到可复现的 competitor** — 确保基线可信
3. **Profile 定位瓶颈** — 用数据而非直觉定位问题
4. **小范围源码修改** — 避免大范围改动的不可控风险
5. **回到同一 workload 复测** — 保证对比的公平性
6. **提 PR（如需）** — 沉淀到社区

这个 loop 的关键约束包括：开始前查询相关 open PR、workspace 必须干净、benchmark/profile 前记录 GPU 状态、资源不足时等待或停止、只清理当前模型 cache 等。这些约束保证了优化过程的可控性和可复现性。

### 3. skill 工件的具体结构

每个 skill 都是一个独立的工作单元，以 llm-serving-auto-benchmark 为例，它解决的是"如何对 SGLang、vLLM、TensorRT-LLM 或其他 OpenAI-compatible server 做公平的 serving benchmark 搜索"这个问题。类似的，llm-torch-profiler-analysis 负责读 torch profiler trace 并输出 kernel、overlap、fuse opportunity 三张表，且 prefill/decode 分开分析。

这种结构使得：
- Agent 可以独立调用某个 skill 完成特定子任务
- 人工可以在任意节点介入检查
- 不同项目之间可以复用和迁移 skill 集合

### 4. 与传统 Agent 工作流的区别

传统的 Agent 工作流往往是"全链路自主决策"——给 Agent 一个目标，它自行决定执行步骤。这种方式在简单任务中表现良好，但在复杂工程任务中容易出现"幻觉式优化"：Agent 跳过必要的 benchmark 和 profile 步骤，直接基于不完整的数据做出错误的修改决策。

AI-Infra-Auto-Driven-SKILLS 的设计明确将**工程纪律编码为工作流约束**，而不是依赖 Agent 的自主判断。这代表了 AI Infra 领域 Agent 应用的一个重要趋势：从"让 Agent 自己想办法"转向"让 Agent 在约束框架内执行最佳实践"。

## 实践启示

### 对 AI Infra 开发者的启示

1. **建立标准化工作流**：在开始任何性能优化之前，先建立 benchmark → profile → 修改 → 复测的标准化流程，并将其固化为可执行的脚本或 skill。

2. **保留人工检查入口**：不要让 Agent 完全自主决策。在关键节点（如 benchmark 确认、profile 结果解读、源码修改范围界定）设置人工检查环节。

3. **积累本地知识库**：model-pr-optimization-history 的设计表明，历史 PR 的优化思路是宝贵的知识资产。建立一个本地知识记录系统，可以在面对新问题时快速定位可复用的思路。

### 对 Agent 开发者的启示

1. **约束优于自由**：在复杂工程任务中，明确的工作流约束往往比 Agent 的自主探索更有效。设计 Agent 系统时，应该考虑如何将领域最佳实践编码为工作流约束。

2. **状态维持机制**：跨轮状态维持是 Agent 执行长链路任务的关键。需要设计专门的状态管理机制，确保每轮执行都能继承上一轮的中间结果。

3. **公平对比的重要性**：sglang-sota-humanize-loop 和 vllm-sota-humanize-loop 的设计强调了"公平对比"的原则——只有保证基线和测试条件的一致性，优化结果才有说服力。

### 对框架开发团队的启示

1. **skill 工件化**：将框架使用经验固化为 skill 工件，使得团队成员和 Agent 都可以复用这些经验，降低框架的学习门槛。

2. **可复现性优先**：在追求 SOTA 性能之前，先确保工作流程的可复现性。一个可复现的次优解比一个不可复现的"最优解"更有价值。

## 关联阅读

## 一句话

AI Infra 工程纪律正在变成可执行的 skill artifact——推理框架优化流程的最佳实践被编码为 Agent 工作流。
## 相关实体
- [Skill Issues Compromising Claude Code With Malicious Skills Agents Part 1](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-issues-compromising-claude-code-with-malicious-skills-agents-part-1.md)
- [Claude Code Skills Mcp Rules Source Analysis](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-skills-mcp-rules-source-analysis.md)
- [Skill System Design Three Way Comparison](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-system-design-three-way-comparison.md)
- [Openclaw Agent Loop Design Patterns](https://github.com/QianJinGuo/wiki/blob/main/entities/openclaw-agent-loop-design-patterns.md)
- [Claude Code Vs Codex Context Architecture 02](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-vs-codex-context-architecture-02.md)

- [Claude Code Hiring Engineers](https://github.com/QianJinGuo/wiki/blob/main/concepts/claude-code-hiring-engineers.md)- [tliveomni vllm 适配与量化方案](https://github.com/QianJinGuo/wiki/blob/main/entities/tliveomni-vllm-quantization.md)
- [claude code 从 demo 到产线 · 企业 harness 工程化的 8 道关卡（黄佳/咖哥 csdn）](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-demo-to-production-8-gates-huang-jia-csdn-2026.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/workflow-orchestration.md)

---

## Ch07.037 Wiki Evolver Skill System Design (GPT-5.5 Copilot Session)

> 📊 Level ⭐⭐ | 8.6KB | `entities/wiki-evolver-skill-system-design-gpt55-copilot-session.md`

# Wiki Evolver Skill System Design (GPT-5.5 Copilot Session)

## 摘要

本文记录了一次 GPT-5.5 Copilot 会话中产出的 wiki-evolver Skill 系统设计。核心判断是：**不要再做一个「更强采集器」，而是做一个上层编排 Skill**——`wiki-evolver` 把已有的 `web-content-reviewer` 和 `llm-wiki` 变成一个长期自进化系统。知识库必须持续产生问题、连接、论文、工程实践和下一代 Skill，而不仅仅是被动积累来源。

## 核心要点

### 设计哲学：涌现层的缺失

现有基础设施已经具备了完整的单篇处理闭环（ingest → synthesize → index → log → lint）和导航/治理层（topic-map、review-queue、wiki-health-dashboard），但缺失的是**涌现层（emergence layer）**——一个能从知识库整体中发现模式、产生新问题、生成原创综合的系统。

`wiki-evolver` 的定位不是采集器，而是**知识库的操作系统**：
1. 从 vault 回答问题
2. 发现缺口和矛盾
3. 生成原创综合
4. 产出论文和工程实践
5. 随时间改进自己的 Skills

### Skill 目录结构

```text
~/.hermes/skills/research/wiki-evolver/
├── SKILL.md
├── references/
│   ├── operating-model.md      # 运营模型
│   ├── source-strategy.md      # 来源策略
│   ├── emergence-loop.md       # 涌现循环
│   ├── talk-to-vault.md        # 与知识库对话
│   ├── paper-factory.md        # 论文工厂
│   ├── engineering-practice-factory.md  # 工程实践工厂
│   ├── governance.md           # 治理规则
│   └── output-templates.md     # 输出模板
└── scripts/
    ├── vault-stats.mjs         # 知识库统计
    ├── graph-report.mjs        # 图谱报告
    ├── stale-pages.mjs         # 过期页面检测
    └── source-dedupe.mjs       # 来源去重
```

### Core Contract：每次运行至少产出一个 durable outcome

1. 已摄入/更新的源材料
2. 更新的综合页面
3. 更新的查询/导航页面
4. 新的研究问题或前沿地图
5. 基于 vault 来源的论文/实践草稿
6. 治理修复：index/log/lint/schema/links
7. 改进的 Skill/playbook/checklist

### Operating Loop：六步循环

**Orient → Route → Triage → Synthesize → Emerge → Govern**

每个阶段的职责：

- **Orient**：读取 SCHEMA.md、index.md、最近的 log.md 和相关 queries/
- **Route**：URL/article → web-content-reviewer；Wiki 写入/查询/lint → llm-wiki；广泛演化任务 → wiki-evolver
- **Triage**：除了来源质量，还要评估 `vault_delta`——是否更新了已有 belief、连接了以前分离的 cluster、引入了新 mechanism/pattern/failure mode、能转化成研究/实践产物
- **Synthesize**：更新 entities/、concepts/、comparisons/、queries/，要求有 wikilinks 和 provenance
- **Emerge**：从本轮结果中提取——new questions、contradictions、missing pages、reusable patterns、candidate papers、candidate engineering practices、candidate Skill improvements
- **Govern**：更新 index.md、log.md，运行 structural validation

### Knowledge Ladder：知识阶梯

```text
raw source → claim → mechanism → pattern → comparison
→ principle → playbook → paper → Skill
```

关键判断：知识库真正产生价值，不是因为 source 多，而是因为**高层产物仍然牢牢系在低层 provenance 上**。

### 运行模式

- **feed-scout**：主动发现新来源
- **vault-query**：与知识库对话
- **frontier-map**：绘制前沿问题地图
- **paper-factory**：基于 vault 生成论文/长文
- **engineering-practice-factory**：从理论沉淀工程实践
- **skill-refine**：改进 Skill 本身

### 建议新增的 Query 页面

| 页面 | 回答的问题 |
|------|-----------|
| `queries/research-frontier-map.md` | 现在知识库最值得深挖的前沿问题是什么？ |
| `queries/paper-backlog.md` | 哪些主题已积累到足以写论文/长文？ |
| `queries/engineering-practice-backlog.md` | 哪些理论可以沉淀成工程实践？ |
| `queries/vault-evolution-dashboard.md` | 哪些页面过时、孤立、重复、矛盾、低置信？ |

## 深度分析

### 从采集器到操作系统

传统知识管理工具（RSS 阅读器、书签管理器、笔记应用）的共同局限是：它们是**被动的存储系统**。`wiki-evolver` 的设计理念跳出了这个范式——它是一个**主动的认知系统**，其产出不仅是存储的信息，还包括新的问题、矛盾的发现、原创的综合、可复用的实践和改进的 Skill。

这与 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 的理念高度一致：wiki-evolver 本质上是知识库的 Harness——它不改变底层模型（LLM 的能力），而是通过精心设计的编排流程，把模型能力转化为持续的知识产出。

### Knowledge Ladder 的层次设计

Knowledge Ladder 的设计体现了知识管理的核心挑战：**如何让高层产物保持可溯源性**。从 raw source 到 Skill 的八个层次，每一层都是对下一层的抽象和综合。关键约束是：高层产物必须「牢牢系在低层 provenance 上」——否则知识库会退化为一堆无法验证的「听起来很对」的总结。

这与 wiki 已有的 provenance citation 机制（行内引用标记如 ``）形成了自上而下和自下而上的双向保障。

### 与现有 Skill 生态的关系

wiki-evolver 不是取代现有的 web-content-reviewer 和 llm-wiki，而是把它们编排成一个更大的系统：
- `web-content-reviewer` 负责**守门**（单篇质量把关）
- `llm-wiki` 负责**落库**（写入和维护页面）
- `wiki-evolver` 负责**涌现**（让整个系统产生复利）

这种分层设计避免了单个 Skill 过于复杂的问题，每个 Skill 有清晰的职责边界和升级路径。

### 与 [Agent 记忆系统](https://github.com/QianJinGuo/wiki/blob/main/entities/存之有序治之有矩agent-记忆系统的工程实践与演进.md) 的关联

wiki-evolver 的 Knowledge Ladder 本质上是一个记忆系统的层次模型。从 raw source 到 Skill 的过程，就是从「被动记忆」到「主动认知」的演化。这与 Agent 记忆系统中「工作记忆 → 长期记忆 → 元认知」的三层架构有相似之处。

### 涌现层的工程挑战

涌现层面临的核心工程挑战：
1. **评估困难**：如何量化「新问题的质量」或「矛盾发现的价值」？
2. **成本控制**：全局扫描和综合的计算成本远高于单篇处理
3. **幻觉风险**：越高层的综合越容易引入模型幻觉
4. **循环终止**：如何避免系统陷入无限的自我改进循环？

## 实践启示

1. **先建立底层闭环**：在部署 wiki-evolver 之前，确保单篇处理闭环（ingest → synthesize → index → log → lint）已经稳定运行
2. **从 vault-query 开始**：最轻量的运行模式是 vault-query——先让系统学会「与知识库对话」，再逐步增加涌现能力
3. **Provenance 是生命线**：任何涌现层的产出都必须可追溯到低层来源，否则知识库的可信度会快速下降
4. **Evals 是涌现层的关键**：正如 [AI 原生创业公司](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-native-startup-cyberfund-2026.md) 中强调的，没有评估系统就无法实现复利增长
5. **渐进式披露**：参考 Claude Code Skills 的设计，wiki-evolver 的能力应该逐步开放，避免一次性暴露过多复杂性

## 相关实体

- [存之有序治之有矩Agent 记忆系统的工程实践与演进](https://github.com/QianJinGuo/wiki/blob/main/entities/存之有序治之有矩agent-记忆系统的工程实践与演进.md)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/karpathy-最新访谈从-vibe-coding-到-agentic-engineering.md)
- [一文带你弄懂 Ai 圈爆火的新概念Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/一文带你弄懂-ai-圈爆火的新概念harness-engineering.md)
- [Karpathy Vibe Coding Agentic Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/karpathy-vibe-coding-agentic-engineering.md)
- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](https://github.com/QianJinGuo/wiki/blob/main/entities/agentops-operationalize-agentic-ai-at-scale-with-amazon-bedr.md)
- [两万字详解Claude Code源码核心机制](https://github.com/QianJinGuo/wiki/blob/main/entities/两万字详解claude-code源码核心机制.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/wiki-evolver-skill-system-design-gpt55-copilot-session.md)

---

## Ch07.038 Autonomous Vulnerability Hunting with MCP

> 📊 Level ⭐⭐ | 8.5KB | `entities/autonomous-vulnerability-hunting-with-mcp.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/autonomous-vulnerability-hunting-with-mcp.md)

## Summary
> Score: 8×9=72

## 深度分析
### MCP架构：从工具调用到自动化工作流
这篇来自安全研究员 Andy (ZephrFish) 的实践分享，揭示了如何利用 MCP (Model Context Protocol) 将整个漏洞挖掘流程自动化。核心架构由8个MCP服务器组成，横跨5台虚拟机，承载300+工具，覆盖从二进制分析到漏洞利用的完整攻击链 。
**Lab Controller** 负责SSH/WinRM会话管理和Proxmox虚拟机编排；**Hunter** 提供补丁比对、攻击面枚举、10个模糊测试域、崩溃分类和活动管理；**RE Tools** 集成Ghidra、radare2、Frida等逆向工程工具链；**Exploit Dev** 处理shellcode生成、堆喷射、CFG绕过、PoC组装和仿真；**Debugger** 维护跨工具调用的持久化WinDbg/GDB会话；**RAG** 对所有活动数据和历史研究进行语义搜索；**Infra** 按需扩展模糊测试虚拟机；**Reporting** 自动生成漏洞披露报告、CVE请求和赏金提交 。
这种架构的关键设计决策是"薄包装、厚逻辑"：MCP服务器文件仅是 `@mcp.tool()` 装饰器，真正的业务逻辑在 `hunter/`、`re_tools/`、`exploit_tools/`、`debug_tools/` 等子目录中独立维护。这意味着业务逻辑可以独立于MCP管道进行测试和迭代 。

### Hallucination Bin：对抗LLM幻觉的核心机制
文章最关键的设计洞见是"发现物从幻觉开始"原则。所有新发现首先进入 `hallucinations/` 目录，只有通过四个验证门禁才会升级到 `findings/` 。
**Gate 0**: PoC存在且可编译
**Gate 1**: PoC在干净VM快照中可复现崩溃
**Gate 2**: 崩溃可利用（非空指针解引用或优雅退出）
**Gate 3**: 漏洞可由标准用户触发（非SYSTEM或管理员）
这一机制直接源于LLM会产生"自信但错误"的分析结论这一基本事实。在一次早期测试中，自主引擎标记了6个"看起来很有希望"的发现，但经人工审查和动态分析验证，这6个全部被证伪。Hallucination Bin在它们进入任何报告之前全部捕获 。

### 知识环路：持续学习的飞轮效应
每次模糊测试启动前，系统会查询RAG索引了解历史发现。这一知识环路包含五个步骤：Hunt（查询知识库）→ Collect（记录崩溃）→ Enrich（补充上下文）→ Learn（FAISS向量化）→ Repeat（重复） 。
系统还维护一个已知防御数据库。当目标启用AM-PPL（反恶意软件受保护进程光）、SxS保护、严格Authenticode验证等防御机制时，这些信息会乘数降低目标在未来活动中的优先级，防止系统在同一死胡同上浪费周期。经过若干次活动碰到AM-PPL壁垒后，系统完全停止推荐这些目标 。

### 赏金情报：ROI驱动的目标选择
除了RAG，还有一套追踪100+赏金项目的MCP，根据漏洞类别（RCE、LPE、认证绕过、类型混淆、UAF、堆溢出）进行ROI评分。系统计算保守派发估算/预估狩猎工时，考虑二进制补丁历史、漏洞类别和严重程度层级、项目支付范围和历史接受率、以及目标上已知的防御机制 。
竞争调整是最终乘数。低竞争项目保持90%预期价值；高竞争项目（如主要OS供应商）降至40%；极高竞争项目降至20%。这防止系统执着于最大头条赏金——在那里成为第一报告者的几率很小 。

### 实战成果：从CVEs到0day
**Go标准库多个CVE**：针对 `golang.org/x/image` 包的模糊测试活动在两周内产生两个CVE，均为处理不受信任输入时的OOM漏洞 。

- **CVE-2026-33809** (`x/image/tiff`): 8字节构造TIFF文件导致约4GB内存分配
- **CVE-2026-33812** (`x/image/font/sfnt`): 字体文件中GPOS PairPos表的numClass1×numClass2可达~8GiB
**OEM服务0day**：从标准用户到SYSTEM代码执行的完整四阶段链：命名管道认证绕过 → WCF SSRF → 目录注入 → 签名验证绕过（通过有漏洞的WHQL签名驱动） 。
**macOS应用分发平台两个发现**：浏览器历史窃取（LSQuarantineEvent查询无过滤）+ 调试RSA密钥用于更新框架签名验证绕过 。

### 成本计算：系统是否值得？
作者构建了 TokenBurn 工具追踪整个系统的代币使用情况。关键数据：前几个活动在每个意义上都很昂贵——构建工具链、学习什么不起作用、用自信的废话填充幻觉箱。最近的活动的得益于所有累积上下文：RAG索引知道哪些二进制文件已加固；赏金情报知道哪些项目值得时间；语法生成器知道哪些文件格式字段有趣 。
成本效益比的趋势比任何单一数字更重要。系统运行第二十个活动时，每个发现的操作成本比运行第一个活动时显著降低，即使订阅成本相同 。

## 实践启示
### 架构设计层面
1. **从第一天开始构建幻觉箱**：任何自主漏洞挖掘系统的第一个功能组件应该是对所有发现持怀疑态度的机制。信任LLM输出是新手错误 。
2. **始终从低权限上下文验证**：多个早期发现从SYSTEM上下文看可利用，但从标准用户看无法到达。Gate 3应该在第一天就实现，而不是后来添加 。
3. **记录负面结果**：当目标加固（AM-PPL、SxS保护、严格签名验证）时，记录该防御机制。这会乘数惩罚未来活动中的加固目标，防止重复死胡同 。
4. **薄MCP包装、厚业务逻辑**：将真正的业务逻辑维护在独立于MCP装饰器的模块中，实现独立测试和迭代 。

### 运营层面
1. **统一模糊测试接口**：每个域使用相同的工具模式（`setup`/`start`/`status`/`crashes`/`stop`），自主引擎不需要特定领域的调度逻辑，只需选择正确的域并调用相同的工具序列 。
2. **共享会话持久化**：连接一次，跨所有工具调用保持会话。当链式调用超过10步时，在每步重新连接会消耗大量令牌并丢失上下文完整性 。
3. **知识环路需要时间积累**：前几个活动是最昂贵的，但每个失败的活动仍有助于知识库。系统运行第二十个活动时，对什么值得模糊以及如何处理的推荐明显更好 。

### 安全研究方法论
1. **ROI驱动目标选择**：系统自然倾向于被忽视的软件与可观赏金之间的甜蜜点。第三方系统实用程序、OEM管理代理、企业中间件、装在数百万台机器上但没有吸引与Chrome或Windows内核相同研究员关注的软件 。
2. **动态验证优于静态分析**：macOS平台发现——静态分析找到初始线索，Frida动态分析确认实际查询行为。Frida跟进是将两个发现从"需要更多信息"转为已分类的关键 。
3. **补丁差异分析**：两个Windows 11 VM（最新和N-1补丁版本）专门用于二进制差异分析——枚举Patch Tuesday之间的变化、差异二进制文件、识别安全相关修复以针对特定活动 。
## 相关实体
- [Bullyingllms](https://github.com/QianJinGuo/wiki/blob/main/entities/bullyingllms.md)
- [Building A Secure Auth Code Flow Setup Using Agentcore Gatew](https://github.com/QianJinGuo/wiki/blob/main/entities/building-a-secure-auth-code-flow-setup-using-agentcore-gatew.md)
- [Spec Review Agent Baz Bedrock Agentcore Multi Agent](https://github.com/QianJinGuo/wiki/blob/main/entities/spec-review-agent-baz-bedrock-agentcore-multi-agent.md)
- [Integrating Aws Api Mcp Server With Amazon Quick Suite Using Amazon Bedrock Agen](https://github.com/QianJinGuo/wiki/blob/main/entities/integrating-aws-api-mcp-server-with-amazon-quick-suite-using-amazon-bedrock-agen.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/mcp-server-patterns.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/autonomous-vulnerability-hunting-with-mcp.md)

---

## Ch07.039 AWS DevOps Agent × MCP Server：打通混合云网络排障的最后一公里

> 📊 Level ⭐⭐ | 8.4KB | `entities/aws-devops-agent-mcp-server打通混合云网络排障的最后一公里.md`

## 核心要点
- AWS 技术实践
- AWS DevOps Agent × MCP Server：
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/aws-devops-agent-mcp-server打通混合云网络排障的最后一公里.md)

## 文章摘要
混合云 BGP 故障的另一半证据往往在 on-premises 设备上。本文在真实 Direct Connect 环境上，通过 MCP Server 把 Cisco 路由器的只读命令暴露给 AWS DevOps Agent，用 Private Connection 把调用流量留在 AWS 骨干网，再用 EventBridge Scheduler + Lambda 把调查结论自动回推飞书群——完成"告警 → 自主调查 → 结论回到 Chat"的混合云 ChatOps 闭环。

## 深度分析
### MCP 协议在 AI Agent 运维场景的结构性价值
这篇文章揭示了一个在 AI Agent 落地过程中被普遍忽视的问题：Agent 的能力边界往往被锁定在它能"看见"的数据范围内。当 AWS DevOps Agent 被训练来调用 CloudWatch、CloudTrail、VPC API 时，它的推理能力自然延伸到 AWS 侧链路。但混合云的本质决定了故障的根因可能散落在整个链路上的任意节点——包括 on-premises 设备。MCP 协议在这里的价值不是简单的"工具扩展"，而是一种结构性的能力解锁：它让 Agent 能够用同样的推理逻辑、同样的自主决策流程，去处理来自完全不同技术栈的数据。

### Private Connection 的安全模型：零信任思维的工程实践
文章详细阐述了 Private Connection 的三层防护机制：流量全程留在 AWS 骨干网、resource gateway 在用户账户里只读、由客户的安全组控制入向访问。这实际上是一种零信任（Zero Trust）架构在 AI Agent 场景的具体落地——不信任任何跨越边界的流量，即使是来自同一个 AWS 服务的调用也要经过身份验证和访问控制。对于企业而言，这意味着 AI Agent 可以被安全地集成到混合云拓扑中，而不需要为了"让 Agent 能访问"而降低网络安全性。

### 从"相关性推理"到"因果性推理"的跨越
文章最有价值的发现是：引入 MCP Server 之后，Agent 的推理性质发生了本质变化。第一篇只有 AWS 侧数据时，Agent 能给出的是"accepted prefix 超阈值，建议联系对端"这类相关性结论——它知道出了问题，但无法确定是谁、在什么时候、做了什么操作导致的。而当 Agent 能够直接查询 IDC 路由器的 running-config 和 archive log 时，根因可以被精确到"用户 labuser58 在某个时间点把 route-map 从 OUT-TO-NEIGHBOR-1 切换到了 OUT-TO-NEIGHBOR-17"。这种 who/when/what 的因果性推理，才是真正能指导工程师快速修复故障的信息。

### Tool Docstring 作为 Agent 决策的唯一依据
文章验证了一个关键工程假设：只要 tool 名字足够具体、docstring 足够场景化，Agent 能够在没有任何失败重试的情况下一次性选对 8 个 tool。这证明了 MCP 协议的"工具描述即契约"设计是有效的——不需要传统的 prompt engineering，不需要 RAG 知识库，Agent 的决策完全基于工具设计者提供的语义信息。对于希望扩展 Agent 能力的团队，这意味着在 tool 开发上的投入可以直接转化为 Agent 的决策质量。

### ChatOps 闭环的最后一块拼图
文章指出了一个在实际运维中频繁出现的体验断层：告警能够通过 SNS 推到飞书群，但调查结论仍然锁在 AWS Console 的 Agent Space 里。值班工程师需要切换窗口、登录系统、找到对应的 Investigation 才能获取修复建议。这个体验断层的本质是"消息进来了，但结论出不去"。EventBridge Scheduler + Lambda 的轮询方案虽然不是最优雅的事件驱动架构，但它在 AWS DevOps Agent 尚未原生支持事件回传的情况下，以最小的工程复杂度填补了这个闭环缺口。

## 实践启示
### 架构设计层面
对于计划在混合云环境中部署 AI Agent 运维能力的团队，这篇文章提供了几个关键的设计原则。首先，将 MCP Server 部署在 AWS 侧而不是 IDC 内，这样凭证可以托管在 AWS Secrets Manager，Agent 不需要离开 AWS 网络，同时避免了 IDC 管理网开放公网入口。其次，采用 Agent 只读、工程师审核的分工模式——这不仅是安全边界的设计，更是一种人机协同的工作流设计：AI 负责调查和推理，人类负责决策和执行，各自发挥比较优势。

### 安全防护层面
文章展示了四层防护的叠加效果：入参白名单正则、命令前缀白名单、输出脱敏、EC2 IAM 最小权限。这种"纵深防御"的设计思路值得借鉴——即使某一层防护被突破，攻击者仍然面临其他层面的限制。特别是将 Agent 当成任意外部客户端来防范的思路，可以有效应对 prompt injection 等新型攻击向量。建议在设计任何面向 AI Agent 的工具时，都采用这种默认不信任的防护模型。

### 工具开发层面
Tool 名字与 docstring 是 Agent 决策的唯一依据——这对工具开发者的启示是：工具设计质量直接决定 Agent 的使用效果。tool 名字应该足够具体（如 cisco_show_bgp_summary 而不是 show_bgp），docstring 应该场景化地说明"何时该调用"和"能回答什么问题"。实测中 Agent 一次性选对 8 个 tool 的结果证明了这种设计方法的有效性。建议团队在开发 MCP tool 时投入足够的时间在命名和文档编写上，这比优化底层实现更重要。

### 可扩展性层面
文章的一个重要发现是：方案的可扩展性直接来自 Agent Space 自身的分层设计（Service → Association → Skill）。增加新的网络设备厂商（Juniper、Palo Alto、华为）只需要在原 MCP Server 里加几个新 tool，然后在 Agent Space 里调整 Skill 清单，不需要改动 Private Connection、不需要改 IAM、不需要通知 Agent。这提醒我们在设计 AI Agent 集成方案时，应该优先选择本身具有良好分层架构的平台，这样可以在不重构基础设施的情况下持续扩展能力。

### ChatOps 体验设计层面
飞书卡片采用"三秒决策"设计原则：Action 说明要改什么、Reasoning 说明为什么要改、Execution plan 只预览第一步 headline，需要细节再点按钮跳转。这种设计反映了一个重要的产品原则：ChatOps 的核心不是信息密度，而是信息层次——在聊天窗口内只展示决策所需的最低信息量，把详细的技术细节留给需要时再获取。对于任何计划在 IM 平台推送运维告警的团队，这种分层信息设计值得参考。

## 相关实体
- [AWS DevOps Agent 实战：云网络故障自主调查与修复建议](https://github.com/QianJinGuo/wiki/blob/main/entities/aws-devops-agent-实战云网络故障自主调查与修复建议.md)
- [Doris MCP on AgentCore Runtime: VPC原生MCP部署模式](https://github.com/QianJinGuo/wiki/blob/main/entities/aws-bedrock-agentcore-doris-mcp-server.md)
- [aws devops agent 接入 aws 中国区（一）：partition 隔离与 mcp 单账号桥接](https://github.com/QianJinGuo/wiki/blob/main/entities/aws-devops-agent-mcp-china-partition-bridge.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/aws-cloud-ai-infrastructure.md)

---

## Ch07.040 Skill 版本管理五大原则：从越改越差到持续演进

> 📊 Level ⭐⭐ | 8.1KB | `entities/skill-version-management-semantic-versioning-practices-winty.md`

> 原文归档：[原文归档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/skill-version-management-semantic-versioning-practices-winty.md)

Skill 版本管理是企业 AI 系统落地的硬骨头。与代码不同，Skill 是一段"自然语言指令"，它的"对不对"、"有没有变好"没有工具能直接告诉你。本文提出 Skill 版本管理的五大原则以及从 v1.0.0 到 v1.3.0 的真实演进案例。

## 一句话

**把 Skill 当软件管：**语义化版本 + PR 模板（动机/影响/评估）+ 结构化 diff + 跨版本评估对比 + 灰度发布。

## 为什么 Skill 比代码更危险

| 弱点 | 说明 |
|------|------|
| 没有强类型检查 | 写错变量名、漏写步骤，编译器不会告诉你 |
| 影响范围隐式 | 改了某一段，可能影响一大批场景，但看不到连接 |
| "我以为这样更好" | 每处改动都没错，叠加起来可能让整体行为往坏的方向漂 |
| 没有明确退出语义 | 改坏了等线上出现一连串"Agent 行为变怪"才被注意到 |

## 五大原则

### 原则一：每次改动必须有版本号

语义化版本规则：

| 版本类型 | 格式 | 含义 | 例子 |
|---------|------|------|------|
| major | X.0.0 | 行为发生不兼容变化 | 删除 step、改变默认行为、status→deprecated |
| minor | 0.X.0 | 新增能力，向前兼容 | 新增可选 Input、新增 step |
| patch | 0.0.X | bug 修复、措辞优化 | 增加 Pitfall、改 owner |

### 原则二：PR 必须包含动机和影响

每次改动回答三个问题：

1. **为什么改？** — 哪个真实事件触发了这次改动
2. **改了什么？** — diff 总结
3. **影响哪些场景？** — 哪些调用方可能受影响

**PR 模板必须包含**：版本变化、改动动机、改动内容、影响范围、评估结果。

### 原则三：版本之间的 diff 必须可读

结构化 diff 示例：

```
v1.2.0 → v1.3.0 diff:
  frontmatter:
    + version: 1.2.0 → 1.3.0
    + last_updated: 2026-04-10 → 2026-04-25
  Steps:
    + 新增 step 1: 检查近 30 分钟 SLB 健康检查变更
    ~ 原 step 1-5 编号变为 step 2-6
  Pitfalls:
    + 新增: Redis 异常常常是症状不是根因
```

### 原则四：跨版本必须有评估对比

测试集来源：

- **历史调用回放**：从过去 30 天调用日志里采样有代表性的 case
- **人工策展样本**：故意覆盖典型场景和边缘场景
- **故障案例**：来自真实线上事故的复盘 case

**评估指标**：任务成功率、步骤数、错误归因率、禁飞区触发。任何一项回退则不能合并。

### 原则五：危险变更必须强制灰度

| 风险档 | 例子 | 上线策略 |
|--------|------|---------|
| 低风险 | 修措辞、加 Pitfall | 直接合并 |
| 中风险 | 新增 step、修改判断条件 | 灰度 1-3 天 |
| 高风险 | major 版本、删除 step、改默认行为 | 灰度 7 天 + 多团队验证 |

灰度监控指标：调用成功率、异常退出比例、用户纠正比例、平均执行步骤数。

## 真实案例：incident-triage 演进轨迹

| 版本 | 改动 | 评估结果 |
|------|------|---------|
| v1.0.0 | 初版 | 任务成功率 62% |
| v1.1.0 | + Inputs/Verification | 任务成功率 71% |
| v1.2.0 | + 3 条 Pitfalls | 错误归因率 -8% |
| v1.3.0 | + SLB 检查作为第 1 步 | 平均定位时间 -30% |
| v2.0.0 (规划中) | 拆成 3 个 Skill | 待评估 |

## 反模式：越改越差的典型

1. **堆 Pitfalls 不删除**：30 条 Pitfalls 让 Agent 反而懒了
2. **所有改动都是 patch**：版本号毫无意义
3. **v2 推倒重来**：丢失 v1 沉淀的所有经验
4. **修一个 bug 引入两个 bug**：缺乏回归测试

## 与已有实体的关联

- Hermes Agent Skill Authoring — Skill 规范与编写指南
- [Claude Code Skill Writing Guide](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-skill-writing-guide.md) — 另一套 Skill 编写范式
- [高德 Uplift Model Harness](https://github.com/QianJinGuo/wiki/blob/main/entities/gaode-uplift-model-iteration-agent-harness.md) — 类似的版本演进思路
- [阿里云 LoongSuite Pilot](https://github.com/QianJinGuo/wiki/blob/main/entities/alibaba-agent-observability-audit-loongsuite-pilot-coding-agent-blackbox-to-transparent.md) — 企业级 Agent 系统的质量保障

## 结论

Skill 版本管理最关键的不是工具，而是组织里有没有"把 Skill 当软件管"的共识。

共识立起来后，工程化都不难：语义化版本是现成的，diff 工具可以基于结构化解析做，评估测试集可以从调用日志里采样，灰度策略可以基于 feature flag。

如果共识没立起来，工程做得再好也没用。

## 深度分析

### 1. Skill 语义化版本管理
Skill 版本管理引入语义化版本（semver）——major（不兼容变更）、minor（向后兼容的新功能）、patch（bug 修复）。这使 skill 的依赖关系可管理、可追踪。

### 2. 与软件包管理的类比
Skill 版本管理与 npm/pip 等包管理的逻辑一致——版本锁定、依赖解析、兼容性检查。AI agent 的 skill 系统正在复用软件工程的成熟模式。

### 3. 版本兼容性的挑战
Skill 的版本兼容性比软件包更复杂——prompt 模板的细微变化可能导致 LLM 输出大不相同，而软件 API 的兼容性更可预测。

## 实践启示

### 1. 为 skill 采用 semver
每个 skill 都应有版本号，变更时遵循 semver 规则——让依赖方知道兼容性影响。

### 2. 锁定 skill 版本
在生产 agent 中锁定 skill 版本——避免自动更新引入不兼容变更。

### 3. 版本变更的测试
每次 skill 版本升级后，运行回归测试确保 agent 行为没有意外变化。

---

## Ch07.041 Skill Craft — Claude Skill 质量工程框架

> 📊 Level ⭐⭐ | 7.8KB | `entities/skill-craft.md`

## 7 类系统性失效模式
| # | 模式 | 描述 |  
|---|------|------|  
| 1 | **约束衰减** | 对话一长，规则越来越像没写 |  
| 2 | **工具选择漂移** | 指定工具超时后自行替换替代方案 |  
| 3 | **输出膨胀** | 要简明结论，回一篇论文；消耗上下文 |  
| 4 | **依赖链断裂** | Step 之间对象数量不一致（29→20，9个蒸发） |  
| 5 | **并行孤岛** | 子 Agent 结论矛盾，主 Agent 不做去重直接合并 |  
| 6 | **触发模糊** | 随口一问被误判为完整执行流程 |  
| 7 | **幻觉填充** | 工具没查到，\"补一个像样的答案\" |  
**关键**：这 7 类会**连锁触发**（输出一膨胀→上下文挤满→约束衰减→工具漂移/幻觉填充更常见）。

## 四模式架构
| 模式 | 生命周期阶段 | 核心机制 |  
|------|------------|---------|  
| `check` | 评估 | 8 结构模块 + 7 类反模式 + 3 条完整性原则 |  
| `fix` | 修复 | 回归验证（修完重跑评估）+ 四类关联检查 |  
| `create` | 创建 | 轻量/中等/重型分级 + smoke check |  
| `audit` | 治理 | 多 Skill 路由边界/职责分工/真值源统一 |  

## 三层评估体系
**第一层：8 个结构模块**
触发条件 · 行为准则 · 工具优先级 · 输出约束 · 流程 Checkpoint · 依赖链 · 子 Agent 委派规则 · 幻觉防护
**第二层：7 类反模式风险**
结构有没有防御力，而非有没有模块。
**第三层：3 条完整性原则**
1. **可计数验收** — \"处理数必须等于总数\"而非\"逐个处理\"
2. **Checkpoint 阻断** — 每步有中间输出，防止跳到最后
3. **失败路径定义** — 不能只有正常路径没有 else（else 默认往往是 skip）

## fix 模式：四类关联检查
每次修复后要求检查：

- 引用方有没有同步
- 对称方有没有同步
- 消费方有没有同步
- 同层结构有没有类似问题

## 深度分析
### 从\"有功能\"到\"有质量\"的范式转移
Skill Craft 的核心贡献在于重新定义了 Skill 的质量问题。大多数人关注 Skill \"能不能用\"——功能是否完整、指令是否清晰。但 Skill Craft 指出真正的问题：**Skill 能否在生产环境中持续可靠地运行**。这个问题不是写好 instructions 能解决的，需要结构性的防御机制。

### 七类失效的根因：上下文压缩与约束稀释
约束衰减和输出膨胀是连锁的。输出越长，上下文窗口被塞得越满，前面写的约束就越容易被\"忽略\"。这不是模型的 bug，而是 LLM 的注意力机制在超长上下文中天然倾向于\"跟着最近的指令走\"。因此 Skill Craft 强调：

- **Checkpoint 机制**：强制在每步输出中间结果，防止模型\"一口气跑到底\"
- **可计数验收**：用具体的数字约束替代模糊的\"逐个处理\"，让模型在每步都能自我检验

### 并行孤岛：多 Agent 系统的同步失效
子 Agent 独立工作却不共享上下文，是并行孤岛的根本原因。主 Agent 在合并结果时如果不做去重，会导致矛盾输出直接暴露给用户。Skill Craft 的解法是：在 Skill 层面预设\"一致性校验\"步骤，而非事后人工检查。

### 触发模糊：边界定义决定系统可控性
Skill 的触发条件如果写得不严格，用户随口一问就会触发完整执行流程——既浪费资源，又容易给出不匹配需求的答案。最容易被忽略的反而是 **\"DO NOT trigger\"** 条件——明确什么时候不该触发，比写清楚什么时候该触发更重要。

### audit 模式的意义：从单体到系统的治理升维
当 Skill 数量达到 5 个以上，单个 Skill 的质量已经无法保证整体系统的可靠性。路由边界重叠、文档版本不一致、引用链断裂等问题开始出现。这时的核心矛盾是：**每个 Skill 单独看都没问题，放在一起却开始冲突**。audit 模式就是为这个阶段准备的。

## 实践启示
### 1. 设计新 Skill 时，从\"防御\"而非\"功能\"出发
先想：这个 Skill 在什么情况下会乱触发、什么时候会不触发、什么时候会跑偏。围绕这三点设计防御结构，再补充功能实现。

### 2. 验收标准要\"可计数\"，不要\"模糊描述\"
- ❌ \"逐个处理所有文件\"
- ✅ \"处理文件数 == 扫描到的文件数，跳过需有明确记录\"

### 3. 每加入一个子 Agent，必须同时定义\"合并规则\"
没有合并规则的并行任务，是制造矛盾输出的流水线。

### 4. 修复后必须回归验证，不能\"凭感觉修完\"
Skill Craft fix 模式要求修完后重新跑评估，确认分数提升。修复前后的分数对比是判断修复有效的唯一客观依据。

### 5. Skill 数量 ≥ 5 时，启动 audit 模式
路由边界、职责分工、真值源统一、文档传播链路——这四件事在单体阶段可以忽略，进入系统阶段后必须定期审计。

### 6. 幻觉防护的底线：\"没有来源就不输出\"
不是写\"请注意准确性\"，而是在 Skill 里明确要求：**工具查不到结果时，必须返回\"未找到\"而非猜测**。

## 与 Harness Engineering 的关系
Skill Craft 和 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 都关注 LLM 系统的**工程化治理**，但侧重点不同：

- **Harness Engineering**：经验如何沉淀成下一轮默认存在的能力（宏观框架）
- **Skill Craft**：Skill 本身的结构质量和系统级治理（微观工具）
Skill Craft 的 fix 回归验证逻辑与 Harness 的 Generator/Evaluator 循环有共通之处——都是通过**持续验证**防止能力退化。

## 关联阅读
## 相关实体
- [Skill Issues Compromising Claude Code With Malicious Skills Agents Part 1](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-issues-compromising-claude-code-with-malicious-skills-agents-part-1.md)
- [Claude Design Skill Web Design Engineer](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-design-skill-web-design-engineer.md)
- [Claude Code Skill Writing Guide](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-skill-writing-guide.md)
- [Claude Design Skill](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-design-skill.md)
- [Skill Issues Compromising Claude Code With Malicious Skills Agents](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-issues-compromising-claude-code-with-malicious-skills-agents.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-skill-quality-tool-skill-craft.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/ai-skill-design.md)
## 使用
```bash  

# 把 Skill 放进 ~/.claude/skills/ 后
评估 /path/to/my-skill  
```

---

## Ch07.042 SkillX — 层次化技能知识库

> 📊 Level ⭐⭐ | 7.5KB | `entities/skillx-hierarchical-skill-library.md`

## 概述
浙大研究团队提出的 Agent 经验复用框架（arXiv:2604.04804，GitHub: zjunlp/SkillX）。核心主张：**结构化经验比原始轨迹更关键**。通过将轨迹蒸馏为三层技能体系，实现跨模型、跨任务的高效经验复用与泛化能力提升。

## 三层技能设计（Multi-Level Skills）
| 层级 | 类型 | 说明 |
|------|------|------|
| L3 | Planning Skills | 任务规划，高层策略抽象 |
| L2 | Functional Skills | 子任务工具调用模式 |
| L1 | Atomic Skills | 底层工具使用原子模式 |
三层抽象从高到低：战略规划 → 功能调用 → 原子操作。

## 三大核心模块
### 1. Multi-Level Skills Design
原始轨迹蒸馏为三层结构，解决经验表示泛化能力弱的问题。

### 2. Iterative Skills Refinement
多轮 rollout 中对技能进行 merge / filter / update 持续优化，解决经验质量参差的问题。

### 3. Exploratory Skills Expansion
通过经验引导探索生成新任务与技能，扩大覆盖范围，实现**超出训练分布的泛化能力**（突破当前模型能力边界）。

## 实验数据
- **测试环境**：AppWorld、BFCL-v3、τ²-Bench（长程交互任务）
- **Base Agent**：GLM-4.6（强 backbone，用于构建 SkillKB）
- **迁移目标**：Qwen3-32B、Kimi-K2、GLM-4.6 等弱模型
- **关键结论**：Qwen3-32B 平均提升约 **10 个百分点**，同时减少执行步骤
- **对比基线**：A-Mem、AWM、ExpeL（无记忆或传统经验方法）
- **泛化验证**：跨模型迁移中表现出强稳定性

## 核心洞察
> Skill Library 可能是下一代 Agent 的核心基础设施。
三层技能体系的架构意义：

- **Planning Skills** = Agent 的"方法论知识"（面对新任务的策略思维）
- **Functional Skills** = Agent 的"技能插件"（可复用工具调用流程）
- **Atomic Skills** = Agent 的"肌肉记忆"（底层工具操作模式）
与 [Agent Skill 编写指南](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-skill-writing.md) 的实践视角互补： SkillX 从学习角度建立技能体系，Agent Skill 指南从编写规范角度约束技能格式。

## 相关页面
## 深度分析
SkillX的三层技能体系（Planning / Functional / Atomic）揭示了Agent经验复用的核心矛盾：原始轨迹中包含太多细节噪声，压缩成高层抽象又会丢失关键上下文。SkillX的答案是用层次化结构同时解决泛化性和保真度问题。
**1. 三层抽象的认知基础来自于对Agent轨迹中不同类型知识的本质区分。** L3 Planning Skills对应"面对新任务时选择什么策略"——这是高阶推理，与具体工具无关；L2 Functional Skills对应"完成某个子目标时调用哪些工具以及按什么顺序"——这是过程性知识；L1 Atomic Skills对应"某个工具的具体使用参数和模式"——这是最低层的肌肉记忆。三个层次的信息密度和时间稳定性完全不同：L1最具体但变化最快，L3最抽象但最难提取。
**2. 迭代式技能精炼（Iterative Skills Refinement）解决了初始蒸馏质量参差的问题。** 在多轮rollout中，技能会经历merge/filter/update的循环——高频共现的技能片段被合并，罕见或不稳定的被过滤，持续有效的被更新。这模拟了人类学习中"刻意练习-反馈-修正"的循环，使Skill Library的质量随使用次数增长而提升，而非一次性蒸馏后固定。
**3. Exploratory Skills Expansion是SkillX最激进的设计选择——它试图超越训练分布泛化，而非在分布内泛化。** 通过经验引导探索生成新任务与技能，突破当前模型能力边界。这与传统的"见过就能泛化、没见过就无法处理"的范式有本质区别——这是"见过的能力组合出新的能力"。这是否work，取决于底层LLM的组合推理能力。
**4. Qwen3-32B平均提升约10个百分点的跨模型迁移结果表明，Skill Library是一种与模型无关的知识表示。** 技能抽象从具体工具调用中解耦出来，因此可以在不同能力的模型之间迁移。这个性质极其重要：它意味着企业的最佳实践（编码规范、测试策略、架构决策）可以积累成一套可迁移的技能资产，不依赖特定模型供应商。

## 实践启示
**对于Agent框架开发者：** 在设计技能系统时，优先实现三层抽象框架（Planning / Functional / Atomic），而非用单一层次的技能清单。单一层次面临"粒度过粗则泛化差、粒度过细则噪音多"的两难，三层结构可以在这两个维度上同时优化。
**对于企业AI团队：** 建立内部Skill Library是长期竞争力的关键。技能的积累（尤其是L2 Functional Skills层）对应的是组织的工程知识资产——代码审查规范、测试策略、故障排查流程。这些经验显式化后，可以跨模型、跨时间复用，不会因为换模型供应商而丢失。
**对于Skill编写规范制定者：** SkillX从"学习角度"建立技能体系，Agent Skill编写指南从"编写规范角度"约束格式——两者互补而非替代。SkillX的三层模型可以作为组织内部技能分类的标准参照，让Skill编写者知道"我这条技能属于哪个层次、解决什么问题"。
**对于评测和选型团队：** 在评估Agent框架时，技能的跨模型迁移能力是一个被低估的维度——能跨模型迁移的技能体系意味着更低的供应商锁定风险和更长的资产寿命。

## 相关页面

- [Skill 设计模式](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-design-patterns.md)
- [Hermes-Agent 自进化机制](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent.md)
- [Thin Harness Fat Skills](https://github.com/QianJinGuo/wiki/blob/main/entities/thin-harness-fat-skills.md)
- [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/skillx-zhejiang-university.md)

## 相关实体
- [从 0 到 1 教你写 Agent Skill，让 AI 懂你的"潜规则"](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-skill-writing-guide.md)
- [9个Agent技能模块化SageMaker微调生命周期](https://github.com/QianJinGuo/wiki/blob/main/entities/aws-sagemaker-ai-agent-guided-workflows-finetuning.md)
- [Anthropic 14 个 Agent Skills 设计模式](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-agent-skills-design-patterns-14.md)
- [重新定义Skill开发：保姆级教程&一站式开发助手发布](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-development-guide-aliyun-2026.md)
- [Perplexity 内部 Skill 设计指南：四维体系与维护方法论](https://github.com/QianJinGuo/wiki/blob/main/entities/perplexity-internal-skill-design-guide.md)
- [SkillClaw](https://github.com/QianJinGuo/wiki/blob/main/entities/skillclaw.md)
- [Skill 系统：Agent 如何把经验沉淀成可复用能力](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-skill-system-winty.md)
- [Trace2Skill: 轨迹经验蒸馏为可迁移 Agent Skills](https://github.com/QianJinGuo/wiki/blob/main/entities/trace2skill-trajectory-distillation-agent-skills.md)

- [Qoder Skills 完全指南](https://github.com/QianJinGuo/wiki/blob/main/entities/qoder-skills-complete-guide.md)
- [你写的 Skill，及格了吗？](https://github.com/QianJinGuo/wiki/blob/main/entities/ni-xie-de-skill-ji-ge-liao-ma.md)
- [Hermes Agent Skill](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent-skill.md)
- [wiki evolver](https://github.com/QianJinGuo/wiki/blob/main/entities/wiki-evolver.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/ai-skill-design.md)

---

## Ch07.043 Skill Craft：Claude Skill 质量工程工具

> 📊 Level ⭐⭐ | 7.4KB | `entities/claude-skill-quality-tool-skill-craft.md`

# Skill Craft：Claude Skill 质量工程工具

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-skill-quality-tool-skill-craft.md)

## 摘要

Skill Craft 是面向 Claude Skill 的质量工程工具（GitHub: [3stoneBrother/skill-craft](https://github.com/3stoneBrother/skill-craft)），由微信公众号"三石随笔录"作者开发。它解决 Skill 系统中"不触发、乱触发、越用越跑偏"三类典型问题，核心洞察是：**大多数 Skill 的问题不在"有没有功能"，而在"有没有质量防护"——本质上没有把 Skill 当成需要工程化治理的对象**。

## 核心要点

1. **7 类系统性失效模式**：约束衰减（对话越长规则越弱）、工具选择漂移（超时后换工具不回来）、输出膨胀（要简明给论文）、依赖链断裂（29 个对象只处理 20 个）、并行孤岛（子 Agent 结论矛盾不校验）、触发模糊（误判用户意图）、幻觉填充（没查到就编一个）。这些模式会**连锁触发**——输出膨胀挤满上下文 → 约束衰减 → 工具漂移/步骤跳过/幻觉填充。

2. **四种模式覆盖完整生命周期**：`check`（评估单个 Skill）、`fix`（修复+回归验证）、`create`（从零生成合规 Skill）、`audit`（系统级审计多 Skill 路由边界和职责分工）。

3. **三层评估体系**：8 个结构模块（触发条件、行为准则、工具优先级、输出约束、流程 Checkpoint、依赖链、子 Agent 委派规则、幻觉防护）→ 7 类反模式风险检测 → 3 条完整性原则（可计数验收、Checkpoint 阻断、失败路径定义）。

4. **fix 模式的回归验证机制**：修复后重新评估，确认分数提升、风险下降、结构闭环。四类关联检查确保修复不引入新问题（引用方同步、对称方同步、消费方同步、同层结构检查）。

5. **audit 模式的系统视角**：当系统有 5+ Skill 时，单独看每个可能"不算太差"，但放在一起就会出现路由边界重叠、文档传播旧规则、引用链断裂等系统性问题。

## 深度分析

### 1. Skill 质量问题的根因：缺乏工程化治理

Skill Craft 的核心贡献在于**将 Skill 从"写一段提示词"提升为"工程化治理对象"**。传统 Skill 开发的问题是：开发者写好 Skill 后丢进 `~/.claude/skills/` 就完事了，没有测试、没有回归、没有系统级审计。这导致：

- Skill 在简单场景下表现良好，但长对话中逐渐失效（约束衰减）
- 多个 Skill 共存时路由冲突，Agent 不知道该触发哪个
- Skill 修改后没有回归验证，修复一个问题引入另一个

Skill Craft 将软件工程的最佳实践（单元测试、回归测试、代码审查、系统集成测试）映射到 Skill 开发领域，填补了一个关键空白。

### 2. 三层评估体系的设计哲学

三层评估的设计体现了从"有没有"到"防不防得住"的思维跃迁：

- **第一层（结构模块）**：检查 Skill 是否具备必要的结构元素。但"有模块"不等于"有效"——触发条件不能只写"触发"，还要写"不触发"和"歧义处理"。
- **第二层（反模式风险）**：检查结构是否真的能防住对应问题。不是有没有幻觉防护模块，而是模块有没有**防御力**——"注意准确"是无效的，"没有来源就不能输出"才是有效的。
- **第三层（完整性原则）**：三条原则直击 LLM 的行为特性——模型倾向于"跳过"和"编造"，所以需要可计数验收（处理数必须等于总数）、Checkpoint 阻断（每步都要中间输出）、失败路径定义（没有 else，模型默认 skip）。

这种分层设计体现了对 LLM 行为模式的深刻理解——不是让 Skill 更"详细"，而是让 Skill 更"防错"。

### 3. 约束衰减：Skill 系统的阿喀琉斯之踵

7 类失效模式中，**约束衰减**是最根本的问题。它的机制是：对话上下文有限（如 200K tokens），前几轮 Skill 规则占据显要位置，但随着对话增长，早期规则被推到上下文深处，模型的注意力机制对它们的权重下降。同时，输出膨胀（模型倾向于生成更多内容）加速了这一过程——膨胀的输出挤占上下文，让约束更快地被"遗忘"。

这个问题的工程含义是：**Skill 的质量不能只靠"写得好"，还需要结构性的防衰减机制**——如定期重申关键约束、在 Checkpoint 处重新加载规则、限制单次对话的轮次上限等。

### 4. 从单 Skill 到多 Skill 系统的复杂性跃迁

audit 模式揭示了一个关键问题：**多 Skill 系统的复杂性不是线性的**。5 个各自"不算太差"的 Skill 放在一起，可能出现：

- 路由边界重叠：两个 Skill 的触发条件有交集，Agent 在歧义时随机选择
- 真值源不统一：Skill A 说"用工具 X"，Skill B 说"用工具 Y"，Agent 无所适从
- 文档传播滞后：主文档改了，但 README 和 Skill 内的引用还是旧版本
- 引用链断裂：Skill A 引用 Skill B 的某个规则，但 Skill B 更新后该规则被删除

这类似于微服务架构中的"分布式单体"问题——每个服务单独看都合理，但整体行为不可预测。

## 实践启示

1. **把 Skill 当成代码来对待**：为 Skill 建立版本控制、测试用例、回归验证流程。Skill Craft 的 check/fix/create/audit 四种模式可以直接嵌入 CI/CD 流程。

2. **Skill 必须定义"不触发"条件**：这是 Skill Craft 审计发现的最致命问题之一。只写"何时触发"不写"何时不触发"，Agent 会在歧义场景下误触发。

3. **可计数验收是防幻觉的关键**：不要写"逐个处理"，要写"处理数必须等于总数"。模型擅长计数和比较，不擅长判断"是否处理完了"。

4. **多 Skill 系统需要定期 audit**：当 Skill 数量超过 5 个时，建议每月运行一次系统级审计，检查路由边界、真值源一致性、引用链完整性。

5. **失败路径定义是生产级 Skill 的标配**：每个流程步骤都要有 else 分支。模型在没有 else 时的默认行为往往是 skip（跳过），而不是报错或询问——这会导致静默失败。

## 相关实体

- [两万字详解Claude Code源码核心机制](https://github.com/QianJinGuo/wiki/blob/main/entities/两万字详解claude-code源码核心机制.md) — Claude Code 的 Skill 加载与执行机制
- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](https://github.com/QianJinGuo/wiki/blob/main/entities/agentops-operationalize-agentic-ai-at-scale-with-amazon-bedr.md) — Agent 系统的可观测性与运维
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](https://github.com/QianJinGuo/wiki/blob/main/entities/存之有序治之有矩agent-记忆系统的工程实践与演进.md) — Agent 记忆系统中的约束管理
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — Harness Engineering 中的质量工程维度
- [Prompt Engineering Patterns](https://github.com/QianJinGuo/wiki/blob/main/concepts/prompt-engineering-patterns.md) — 提示工程模式
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/prompt-engineering-guide.md)

---

## Ch07.044 Anthropic MCP 重新定义：Tool Search + 代码编排

> 📊 Level ⭐⭐ | 7.4KB | `entities/anthropic-mcp-revisited.md`

## 核心命题
Anthropic 官方回应社区对 MCP 的三大批评（贵、schema 臃肿、不可组合），明确 MCP 的真正地盘：**云端 Agent 标准化接入层**。

## 关键结论
1. **MCP vs CLI 成本差距缩小**：Tool Search 减少 85% 工具定义 token，综合效果从 32 倍差距缩至约 7 倍
2. **程序化调用**：工具返回结果在沙箱处理，Agent 循环/过滤/聚合，只返回最终结果，减少 37% token
3. **Cloudflare 代码编排**：2,500 API 端点只暴露 search + execute 2 个工具，工具定义 1K tokens
4. **Skills 转正**：MCP 管「能力」，Skills 管「编排」，两者共存
5. **发展图景**：本地 CLI + Skills，云端 MCP + Skills，简单场景直连 API

## MCP 三问题与解法
| 问题 | Anthropic 解法 |
|------|---------------|
| schema 臃肿（43 工具占 55K tokens） | Tool Search 按意图分组，减少 85% |
| 不可组合 | 程序化调用，Agent 写代码在沙箱处理 |
| token 贵（比 CLI 贵 32 倍） | 代码编排（2 工具覆盖 2500 端点）|

## 工具设计原则
- **Tool Search**：按意图分组工具（而非按 API 分），Agent 先描述需求，系统只拉匹配的几个工具
- **代码编排**：暴露 search + execute 两个高级抽象，而非暴露所有细粒度 API

## 深度分析
### MCP 的范式转变：从「工具超市」到「代码编排」
Anthropic 对 MCP 的重新定位，本质上是一次**架构哲学的翻转**。社区批评的三个问题——贵、schema 臃肿、不可组合——都指向同一个根因：把 MCP 当作「工具超市」来设计，每个 API 端点对应一个工具。结果是 43 个工具塞满上下文，token 爆炸，Agent 在工具里迷失。
Cloudflare 的实践给出了正确答案：2,500 个 API 端点只暴露 `search` + `execute` 两个工具，工具定义从不可能压缩到约 1K tokens。这个模式的本质，是把「该用什么工具」的决策权还给 Agent，而不是让人类在定义阶段就把所有路径穷举出来。

### Token 成本：从 32 倍到 7 倍的压缩
| 优化手段 | 效果 |
|---------|------|
| Tool Search | 工具定义 token 减少 85%（55K → ~10K） |
| 程序化调用 | 多步工作流 token 减少 37% |
| 综合效果 | MCP vs CLI 从 32 倍差距缩至约 7 倍 |
7 倍差距仍然显著，但在云端 Agent 场景下，**标准化接入的价值往往超过 token 成本差**。本地 CLI 的优势（--help 自描述、可组合 jq/pipe）在无文件系统、需跨平台认证的云端场景并不适用。

### Skills 与 MCP 的分工终于清晰
Anthropic 的明确定义结束了之前的混淆：
| 角色 | 职责 | 例子 |
|------|------|------|
| MCP | 管「能力」——连接外部系统 | Snowflake、Databricks MCP server |
| Skills | 管「编排」——告诉 Agent 怎么用这些连接 | 10 个 Skills 驱动 8 个 MCP servers |
这不是竞争关系，而是分层职责。Claude 数据插件的案例（10 Skills + 8 MCP servers）证明了分工的有效性。

### 发展图景的三层分工
```
本地开发环境 → CLI + Skills（轻量、快速、上下文干净）
云端生产环境 → MCP + Skills（标准化、跨平台、认证完备）
简单场景     → 直连 API（别过度工程）
```
MCP 的真正地盘是**云端 Agent 标准化接入层**——这里需要统一认证、跨平台一致性和生态锁定，CLI 的本地优势（可组合性、自描述）在这个场景不重要。

## 实践启示
### 给 MCP 服务器开发者的建议
1. **不要把每个 API 端点暴露为一个工具**：超过 50 个工具时，考虑用 `search` + `execute` 的代码编排模式压缩抽象层面
2. **按意图分组而非按 API 分组**：Tool Search 的效果依赖良好的意图分类，工具名和描述需要以 Agent 视角编写
3. **程序化调用是默认模式**：设计工具时假设结果会被 Agent 在沙箱里做循环/过滤/聚合，不要假设模型会逐个工具调用后直接返回结果

### 给 Agent 开发者的建议
1. **云端场景优先考虑 MCP，本地场景优先考虑 CLI**：不要因为「MCP 流行」就盲目在本地开发场景使用
2. **用 Skills 管编排，用 MCP 管能力**：在 Architecture Decision Record 里明确这个分工，避免职责重叠
3. **简单一对一场景直连 API**：10 Agent × 10 服务 = 100 个集成的 M×N 问题在没有标准化收益时不值得引入

### 工具选择的决策树
```
是否有复杂多步工作流？
  ├─ 是 → 考虑程序化调用（减少 37% token）
  └─ 否 → 继续
是否有超过 50 个 API 端点需要暴露？
  ├─ 是 → search + execute 代码编排模式
  └─ 否 → 继续
是本地开发还是云端生产？
  ├─ 本地 → CLI + Skills
  └─ 云端 → MCP + Skills
```

### 生态信号
- MCP SDK 月下载量从 1 亿 → 3 亿（不到一年 3x），用脚投票的趋势明确
- 第三方（Canva、Notion、Sentry）开始同时发布 MCP server + Skills，生态正在往分工协作方向成熟
- Anthropic 官方正在开发 Skills 从 MCP 服务器直接分发的扩展，API 升级时 Skills 自动更新

## 交叉引用
- [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/anthropic-mcp-revisited-tool-search-code-orchestration.md)
- [Agent Skill 编写指南](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-skill-writing.md) — Skills 管「编排」，MCP 管「能力」，两者互补
- [Agent 上下文窗口管理对比](https://github.com/QianJinGuo/wiki/blob/main/entities/context-window-management.md) — MCP token 膨胀问题与上下文窗口管理相关
- [OpenClaw 架构解析](https://github.com/QianJinGuo/wiki/blob/main/concepts/openclaw-architecture.md) — OpenClaw 的 Tool/MessageBus 设计可对比 MCP 架构

## 相关实体
- [Anthropic 官方生产级 Agent 最佳实践：12 个可复用的 MCP 设计模式](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-官方生产级-agent-最佳实践12-个可复用的-mcp-设计模式-v2.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/tool-use-mcp-patterns.md)

---

## Ch07.045 重新定义Skill开发：保姆级教程&一站式开发助手发布

> 📊 Level ⭐⭐ | 7.3KB | `entities/skill-development-guide-aliyun-2026.md`

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/skill-development-guide-aliyun-2026.md)

## 核心价值
阿里内部工程师分享的 **Skill（技能）开发完整教程**，从概念定义到一站式开发助手，覆盖 Skill 整个生命周期。

## 关键知识点
### Skill 定义与加载机制
- **定义**：结构化指令文档，告诉 Agent「在什么场景下、按什么步骤、用什么工具、完成什么任务」
- **三级加载**：渐进式加载策略，按需提供信息，节省上下文空间

### Skill 平台生态
| 平台 | 类型 | 特点 |
|------|------|------|
| skills.sh | 外部 | 开源工作流自动化 |
| ClawHub | 外部 | 社区驱动，版本管理 |
| SkillsMP | 外部 | 283K+ 最大数据库 |
| Aone Skills | 内部 | 阿里内部，与 Aone Copilot 深度集成 |

### Agent 平台 Skill 使用
- **Aone Copilot**：放入 ~/.aone_copilot/skills/ 或市场一键安装
- **AccioWork**：内置 Skill 直接安装，自定义需上传安装包
- **QCoder**：放入项目级 .skills/ 目录
- **悟空**：平台 UI 上传或系统提示词加载

### SKILL.md 规范
- **必需字段**：name（最长64字符）、description（最长1024字符，是触发关键）
- **可选字段**：license, compatibility, allowed-tools, metadata
- **正文结构**：快速开始 → 参数列表 → 工作流 → 错误处理 → 附加资源引用

### 三大痛点与解决方案
**痛点一：跨平台一致性**

- 三纯净原则：正文纯文本、工具用能力描述、路径不写死
- 用 HTML 注释隔离平台增量语法
- 确定性逻辑下沉到 scripts/
**痛点二：版本管理和更新分发**

- 强制 PR + 1人 CR
- CI 跑 schema 校验、prompt-lint
- 平台支持时优先发 beta 通道
- 弃用时在 description 加 [DEPRECATED]
**痛点三：开发调试效率低**

- Hot Reload（Claude Code 2.1+）
- Symlink 软链方案
- 双窗口对照：dev 版 vs prod 版并排对比

### Skill 自我进化机制
- Binary Eval 自动打分（pass/fail）
- 失败时 Reflection Agent 提炼修复 patch
- 每次改完跑回归用例，通过率不达标自动阻断

## 深度分析
### 跨平台一致性的工程挑战
三纯净原则（正文纯文本、工具用能力描述、路径不写死）是该文最核心的方法论创新。本质上，这是将 Skill 从"平台绑定指令"转化为"语义驱动指令"的范式转变。HTML 注释隔离增量语法的设计尤为巧妙——允许多平台共存而不引入冗余维护成本，同时也为未来新平台预留扩展空间。

### 版本管理的流水线设计
强制 PR + 1人 CR + CI schema 校验构成三重门禁，将版本管理从人力驱动转为流程驱动。beta 通道设计体现了灰度发布的工程思维，description 加 [DEPRECATED] 则是一种低技术成本的优雅弃用协议。这些设计共同构成一个小型但完整的软件交付流水线。

### 自我进化机制的战略价值
Binary Eval + Reflection Agent 的组合，实质上是将 Agent 的自我改进从"隐式经验积累"变成"显式可度量的迭代优化"。每次改完跑回归用例、通过率不达标自动阻断——这引入了一个自动化的质量门禁，填补了传统 skill 开发中缺失的测试环节。这一机制与学术界关于 LLM 自动评估（LLM-Eval）的研究方向高度吻合，表明阿里内部已在将学术前沿转化为工程实践。

## 实践启示
### 开发阶段
- **起点**：严格遵循 SKILL.md 规范，特别是 name（≤64字符）和 description（≤1024字符）字段——description 是触发的关键，措辞要精准
- **结构化**：采用标准五段正文（快速开始 → 参数列表 → 工作流 → 错误处理 → 附加资源引用），便于用户理解和平台解析
- **调试效率**：善用 Hot Reload 和 Symlink 软链方案，特别是 Claude Code 2.1+ 环境，可显著缩短迭代周期

### 发布阶段
- **跨平台**：始终以三纯净原则为基准，用 HTML 注释隔离平台增量语法，避免"写死平台"的常见陷阱
- **版本控制**：提交前必走 CI 流程（schema 校验、prompt-lint），发布前优先走 beta 通道验证
- **协作规范**：强制 PR + 1人 CR，代码审查不只是质量保障，也是知识传递机制

### 运维阶段
- **质量门禁**：建立 Binary Eval 回归机制，每次修改后必须通过自动化评估，不达标则阻断发布
- **弃用协议**：需要弃用时，在 description 首行加 [DEPRECATED]，不要直接删除——保障用户侧的平稳过渡
- **持续进化**：Reflection Agent 思路可推广至其他 AI 工作流，将人工修复经验结构化为可复用的 patch 资产

## 相关页面
- [Skill 写作基础指南](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-skill-writing-guide.md) — 入门级别的 Skill 写作教程
- [Skill 写作进阶](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-skill-writing-advanced.md) — 高级技巧
- [Skill 评估方法](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-skill-writing-evaluation.md) — 如何评估 Skill 质量

## 相关实体
- [十年老技术开发的 AI Agent 探索之路](https://github.com/QianJinGuo/wiki/blob/main/entities/十年老技术开发的-ai-agent-探索之路-v2.md)
- [9个Agent技能模块化SageMaker微调生命周期](https://github.com/QianJinGuo/wiki/blob/main/entities/aws-sagemaker-ai-agent-guided-workflows-finetuning.md)
- [SkillX — 层次化技能知识库](https://github.com/QianJinGuo/wiki/blob/main/entities/skillx-hierarchical-skill-library.md)
- [Anthropic 14 个 Agent Skills 设计模式](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-agent-skills-design-patterns-14.md)
- [Perplexity 内部 Skill 设计指南：四维体系与维护方法论](https://github.com/QianJinGuo/wiki/blob/main/entities/perplexity-internal-skill-design-guide.md)
- [SkillClaw](https://github.com/QianJinGuo/wiki/blob/main/entities/skillclaw.md)
- [Skill 系统：Agent 如何把经验沉淀成可复用能力](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-skill-system-winty.md)
- [四种 Sub Agent 模式](https://github.com/QianJinGuo/wiki/blob/main/entities/four-sub-agent-patterns.md)
- [Trace2Skill: 轨迹经验蒸馏为可迁移 Agent Skills](https://github.com/QianJinGuo/wiki/blob/main/entities/trace2skill-trajectory-distillation-agent-skills.md)

- [Qoder Skills 完全指南](https://github.com/QianJinGuo/wiki/blob/main/entities/qoder-skills-complete-guide.md)
- [要实现一个工作流选择-agent-skills-还是-ai-表格](https://github.com/QianJinGuo/wiki/blob/main/entities/要实现一个工作流选择-agent-skills-还是-ai-表格.md)
- [Garry Tan](https://github.com/QianJinGuo/wiki/blob/main/entities/garry-tan-yc-ceo.md)
- [Agent Workflows](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-workflows.md)
- [Hermes Agent](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent.md)
- [Hermes Agent 新手上手指南](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent-onboarding.md)
- [你写的 Skill，及格了吗？](https://github.com/QianJinGuo/wiki/blob/main/entities/ni-xie-de-skill-ji-ge-liao-ma.md)
- [Hermes Agent Skill](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent-skill.md)
- [AI Agent 工程师能力地图](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-agent-engineer-capability-map.md)
- [阿里云端到端业务需求专家 agent：multica 平台 + superai-* 技能集群 + tdd/pre-pus](https://github.com/QianJinGuo/wiki/blob/main/entities/aliyun-end-to-end-business-requirements-agent-multica-2026.md)

---

## Ch07.046 你写的 Skill，及格了吗？

> 📊 Level ⭐⭐ | 7.1KB | `entities/ni-xie-de-skill-ji-ge-liao-ma.md`

## 核心概念
本文提出了一套 **8 维度 Skill 量化评估框架**，通过元数据质量、执行引导清晰度、领域知识密度等指标对 Skill 进行打分评级（S/A/B/C/D 五档），解决 Skill 质量难以客观衡量的问题。

## 8 个评估维度
分布在 Skill 从发现到执行的完整生命周期，分三个阶段：
**第一阶段：能不能被找到**

- D1. 元数据质量 — description 是否精准描述功能、包含触发关键词，甚至写明不应触发场景
**第二阶段：用起来顺不顺**

- D2. 执行引导清晰度 — Agent 能否顺畅执行任务
- D4. 工作流完整性 — 流程是否端到端、异常是否有处理
- D5. 输入输出清晰度 — 起点终点是否明确
- D6. 资源利用 — 脚本、参考文档是否按需加载（渐进式披露）
**第三阶段：值不值得存在**

- D3. 领域知识密度 — 是否内嵌难以获取的专业知识
- D7. 写作质量 — 技术文档结构是否清晰
- D8. 范围与聚焦 — 是否做好一件事而非包揽一切

## 多模型交叉验证机制
- **独立评估**：多模型各自按 8 维度独立打分
- **交叉互审**：分差 ≥2 分时需引用 Skill 具体内容作为证据，并可自我修正
- **仲裁综合**：主模型汇总所有结果做最终裁决
- **三级共识机制**：强共识/弱共识/仲裁，标注每个维度的共识度

## 四种执行策略自动路由
根据模型列表自动分类：

- 全是工具原生模型 → 策略 A
- 全是第三方 → 策略 B（依赖 Python 脚本调用千帆 API）
- 两者都有 → 策略 A+B
- 出问题自动降级 → 策略 C

## 关键价值
- **改进路线图**：帮助开发者识别短板
- **选型决策工具**：横向对比多个 Skill
> 注意：评估框架度量的是 Skill 的**文档工程质量**，而非运行时全部真相。

## 深度分析
1. **D1 是唯一决定 Skill 生死的维度**。description 的质量决定 Agent 是否会触发该 Skill——如果这一步没做好，后面七 个维度写得再精细也毫无意义。好的 description 应同时包含触发关键词和反向排除条件，防止误触发
2. **8 维度映射 Skill 完整生命周期三阶段**。"能不能被找到"（D1 元数据）→ "用起来顺不顺"（D2/D4/D5/D6 执行引导）→ "值不值得存在"（D3/D7/D8 存在价值）。这种分层设计让评估既有广度又有纵深
3. **多模型共识比单模型绝对分数更可靠**。GLM-5.1 评 7.8/A，Claude Opus 4.6 评 6.5/B——分差一个等级但核心问题趋同，说明绝对值因模型而异，共识才是稳定信号。交叉互审要求分差 ≥2 分时必须引用 Skill 具体内容作为证据
4. **渐进式披露是资源利用的核心原则**。SKILL.md 应保持精简，详细脚本和参考文档按需加载，而非把所有内容堆砌在一个巨大的 Markdown 文件中。这直接影响 Agent 能否快速扫描并抓到关键信息
5. **D3 是 Skill 存在的根本理由**。如果通用 Agent 不依赖该 Skill 也能完成同等任务，则该 Skill 没有存在价值。真正的 Skill 应内嵌难以获取的专业知识：私有 API 调用方式、内部系统数据模型、行业特定最佳实践

## 实践启示
1. **从 D1 description 开始优先改进**。扩展 description 包含触发关键词、功能概述和明确的不触发场景——这是投入产出比最高的改进动作，能直接提升 Skill 被正确触发的概率
2. **设计端到端工作流并预设异常处理方案**。D4 要求流程端到端、步骤衔接顺畅，且必须覆盖 API 超时、文件下载失败等异常场景。可以在 Skill 中内置重试逻辑和降级策略
3. **单模型多视角评估可作为多模型验证的降级方案**。让同一模型扮演严格派/务实派/温和派三个评审角色，强制引入多样性视角。角色分化后的分歧（如 D4 一个给 5 分一个给 8 分）本身就有分析价值
4. **采用场景路由表设计提升输入输出清晰度**。subordinate-weekly-report 的场景路由表设计可借鉴——每个 action 配置完整的输入输出示例，让 Agent 能快速匹配用户意图，降低理解成本
5. **Skill 完成后用多模型横向对比选型**。对同类 Skill 分别独立评估，对比 D1-D8 各维度得分和共识度，识别各自优势领域（workos-weekly 领域知识密度更高，subordinate-weekly-report 元数据质量更优），选择时各取所长
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ni-xie-de-skill-ji-ge-liao-ma.md)

## 相关实体
- [Skill.md 简历生成器 Resume Forge](https://github.com/QianJinGuo/wiki/blob/main/entities/我用-skillmd-做了一个简历生成器.md)
- [从 0 到 1 教你写 Agent Skill，让 AI 懂你的"潜规则"](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-skill-writing-guide.md)
- [Hermes Agent](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent.md)
- [Qoder Skills 完全指南](https://github.com/QianJinGuo/wiki/blob/main/entities/qoder-skills-complete-guide.md)
- [Hermes Agent Skill](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent-skill.md)
- [9个Agent技能模块化SageMaker微调生命周期](https://github.com/QianJinGuo/wiki/blob/main/entities/aws-sagemaker-ai-agent-guided-workflows-finetuning.md)
- [Perplexity 内部 Skill 设计指南：四维体系与维护方法论](https://github.com/QianJinGuo/wiki/blob/main/entities/perplexity-internal-skill-design-guide.md)
- [SkillClaw](https://github.com/QianJinGuo/wiki/blob/main/entities/skillclaw.md)
- [Skill 系统：Agent 如何把经验沉淀成可复用能力](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-skill-system-winty.md)
- [重新定义Skill开发：保姆级教程&一站式开发助手发布](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-development-guide-aliyun-2026.md)
- [SkillX — 层次化技能知识库](https://github.com/QianJinGuo/wiki/blob/main/entities/skillx-hierarchical-skill-library.md)
- [Anthropic 14 个 Agent Skills 设计模式](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-agent-skills-design-patterns-14.md)
- [Trace2Skill: 轨迹经验蒸馏为可迁移 Agent Skills](https://github.com/QianJinGuo/wiki/blob/main/entities/trace2skill-trajectory-distillation-agent-skills.md)
- [Qoder Skills 完全指南：从零开始，让 AI 按你的标准执行](https://github.com/QianJinGuo/wiki/blob/main/entities/qoder-skills-完全指南从零开始让-ai-按你的标准执行-v2.md)
- [Thin Harness Fat Skills](https://github.com/QianJinGuo/wiki/blob/main/entities/thin-harness-fat-skills.md)
- [从Vibe Coding到Agentic Engineering：重构后台开发全流程 — 腾讯技术工程](https://github.com/QianJinGuo/wiki/blob/main/entities/tencent-vibe-coding-to-agentic-engineering-backend.md)

---

## Ch07.047 我用 SKILL.md 做了一个简历生成器

> 📊 Level ⭐⭐ | 7.1KB | `entities/我用-skillmd-做了一个简历生成器.md`

# 我用 SKILL.md 做了一个简历生成器
“你养龙虾了吗？”——这是2026年春天最流行的社交寒暄。一个月前，我也跟风在阿里云上花68块买了台轻量服务器，一键部署了OpenClaw。那只可爱的小龙虾在我的服务器里安了家，24小时在线，能操控电脑、执行命令、发消息。然后呢？然后我发现，我根本不知道怎么“教”它干活。
这大概是所有“养虾人”的共同困惑：OpenClaw给你的是一个空转的引擎，它有能力做任何事，但它不知道你要它做什么。有人用它自动抓取公告、盯盘选股，有人用它一键发文到微信公众号，有人用它处理政务民生服务。区别在哪？区别在于，那些真正用起来的人，都学会了一件事：给AI写“说明书”。
今天就带你亲手写一份“说明书”。我们要做一个Resume Forge Skill——把你的Markdown简历一键转成PDF。全程不用写复杂的Agent代码，只用SKILL.md，搭配OpenClaw的Skills机制。

* ** 零外部依赖  ** ：不需要API Key、数据库、网络。任何人克隆下来就能跑。

## 相关实体
- [Skill Engineering Ai As Algorithm](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-engineering-ai-as-algorithm.md)
- [Hermes Agent Getting Started Guide 2026](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent-getting-started-guide-2026.md)
- [Llm Raiders Private Ai Server](https://github.com/QianJinGuo/wiki/blob/main/entities/llm-raiders-private-ai-server.md)
- [Pi Mono Github](https://github.com/QianJinGuo/wiki/blob/main/entities/pi-mono-github.md)
- [我用 Skillmd 做了一个简历生成器](https://github.com/QianJinGuo/wiki/blob/main/entities/我用-skillmd-做了一个简历生成器.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/我用-skillmd-做了一个简历生成器.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/ai-skill-design.md)
## 深度分析

SKILL.md 规范的核心理念是"渐进式披露"（Progressive Disclosure）——这是一个在 UI 设计领域早已成熟的模式，核心思想是只展示当前步骤需要的信息，不提前加载无关内容。在 AI Skill 场景下，这个模式的价值被进一步放大：LLM 的上下文窗口是稀缺资源，Skill 的设计者需要决定什么信息在什么时候进入上下文。文章演示的三层架构（前置元数据 ~100 token → 正文 ~1350 token → 按需加载的外部文件）本质上是一套严格的资源分配协议，确保每个 token 都花在刀刃上^。

description 字段的设计是整个 Skill 的灵魂。与其说它是描述，不如说它是一个"触发条件清单"。文章强调要同时包含正向触发词（resume、CV、ATS-friendly）和负向边界（Do NOT use for: cover letters、job searching），这种正负清单的设计让 LLM 可以在不做算法判断的情况下完成路由决策。这是一种把复杂推理转化为查表的策略——查表的速度远快于推理，且可预测性更高。对于企业级 Skill 场景，这种确定性比"聪明的推理"更重要，因为一次误触发可能导致生产环境的错误行为^。

验证循环（Validate Loop）是 Skill 可靠性的核心保障。文章中的 Step 4 要求 Agent 在验证零错误之前不得进入下一步，这个简单的约束实际上把"自我纠正"能力嵌入到了工作流里。传统的单轮 LLM 调用没有这个机制——模型输出什么就是什么，错了只能靠人工发现。验证循环把"检验"这个动作显式化了。更值得注意的是验证器的错误消息设计：每条错误不仅说明"缺少什么"，还直接给出"怎么补"（添加 H1 标题 `# 你的姓名`），让 Agent 可以不经过人类确认直接执行修复。这种"自解释的错误消息"是 Skill 设计中极易被忽视但极其重要的细节^。

Gotchas 陷阱清单是整篇文章中最有价值的设计模式之一。它的本质是把人类专家才知道的"隐式知识"（tacit knowledge）显式化。Agent 不会自己发现 WeasyPrint 会静默回退到系统默认 serif 字体，也不会天然知道 accented 字符可能破坏 ATS 解析——这些是只有踩过坑的人才能写出来的内容。如果没有 Gotchas，Agent 只能通过试错学习，浪费大量 token 且可能产生不合规输出。专家知识显式化、一次编写到处运行——这才是 Skill 作为知识封装单元的真正价值所在^。

脚本通过 bash 运行、只返回结构化 JSON 这一设计选择，隐藏着一个深刻的工程哲学：把"不确定性"留给 LLM，把"确定性"留给脚本。解析简历、生成 PDF 都是确定性任务，应该用确定性代码执行；只有"判断 Skill 是否相关"、"决定下一步做什么"这类需要泛化能力的任务才交给 LLM。这种分工让 Skill 的 token 消耗变得可预测、可控制——LLM 的非确定性能力和确定性脚本的可靠性各自在擅长的层面发挥作用，形成了一个高效的混合执行架构^。

## 实践启示

1. **description 是 Skill 的第一产品力**：在动手写正文之前，先花时间打磨 description。加入所有可能的触发词，明确负向边界（Do NOT use for），让 LLM 能精准判断何时激活这个 Skill。description 的质量直接决定了 Skill 的触发准确率^。

2. **用清单式工作流组织正文**：将 Skill 的执行步骤写成 `- [ ] Step N: 描述` 的清单格式，给 Agent 提供清晰的进度感和每步的具体脚本路径。避免让 Agent 自己决定"下一步做什么"——确定性来自显式的步骤声明^。

3. **每个验证错误消息必须包含修复操作**：不要只写"缺少字段"，要写"缺少字段：添加 H1 标题 `# 你的姓名` 到 Markdown 顶部"。验证器的价值不仅在于发现问题，更在于让 Agent 能在不询问人类的情况下直接执行修复^。

4. **尽早沉淀 Gotchas，别让 Agent 试错学习**：当你发现一个 Skill 会踩的坑，立刻写成 Gotchas 条目。Gotchas 是专家知识显式化的最佳载体，是 Skill 能在不同团队、不同场景复用的核心资产。格式建议：说明症状 → 原因 → 隐含的解决方法^。

5. **Level 3 资源按需加载，不要提前嵌入正文**：ATS 优化指南、行业风格参考这类内容只在特定任务需要时才加载。让只想"转 PDF"的用户不付出 ATS 指南的 token 成本，让需要"金融岗位 ATS 友好简历"的用户精准触发相关文件的加载^。

---

## Ch07.048 AI + Skills 打通中间件迁移：Android 到鸿蒙定位服务实践

> 📊 Level ⭐⭐ | 6.3KB | `entities/ai-skills-middleware-migration-android-harmonyos-taobao-2026.md`

# AI + Skills 打通中间件迁移：Android 到鸿蒙定位服务实践

## 概述

本文是淘天集团（大淘宝技术）用户终端技术团队的开益撰写的实战案例，记录了将 154 个 Android 定位服务迁移到鸿蒙（HarmonyOS）过程中采用"AI + Skills"方法论的完整实践。核心贡献在于：通过将 API 映射、枚举细节、回调差异等隐性知识转化为结构化、AI 可读的 Skills 文档，解决了 AI 通用智能与领域知识之间的断层问题。

## 核心洞察

### AI 辅助开发的根本矛盾

AI 拥有强大的通用智能（理解自然语言、生成代码、推理逻辑），但缺乏领域知识（特定平台的 API 细节、枚举值、回调约定）。通用智能与领域知识之间存在断层，导致 AI 生成的代码"看起来专业但编译错误 13 个"。

### 知识的三个状态

1. **隐性知识**：在老员工脑子里（"这里要用 ONE_MIN，别用 ONE_MINUTE"）
2. **显性知识**：在文档里（但分散、滞后、难搜索）
3. **可执行知识**：在 Skills 里（结构化、可索引、AI 可读）

### AI + Skills 分工模型

- **AI 负责**：通用逻辑生成、代码结构、模式识别
- **Skills 提供**：精准的 API 映射、枚举值、回调约定、常见陷阱

## 三种迁移方式对比

| 方式 | 耗时/服务 | 编译错误 | 知识沉淀 | 规模化成本(154 服务) |
|------|----------|---------|---------|-------------------|
| 纯 AI 翻译 | ~5 分钟 | 13 个 | 无 | ~102 小时 |
| 查源码 + 人工修正 | ~40 分钟 | 0 个 | 在脑子里 | ~77 小时 |
| **AI + Skills** | **~30 分钟** | **0 个** | **Skills 永久沉淀** | **~52 小时** |

AI + Skills 模式在 154 个服务的规模化迁移中节省 **25 小时**（对比纯 AI 翻译）。

## 方法论

### AI + Skills 工作流（完整闭环）

1. **输入阶段**：AI 加载 Skills 获取领域知识
2. **生成阶段**：AI 使用 Skills 中的映射表生成准确代码
3. **验证阶段**：编译/测试验证准确性
4. **反馈阶段**：问题 → 提炼 → 更新 Skills
5. **沉淀阶段**：成功经验 → 记录到 Skills

### 构建 Skills 三原则

1. **AI 友好的结构化**：表格化、结构化、明确的映射关系（而非长篇文字描述）
2. **持续演进**：遇到问题 → 查看源码 → 提炼规律 → 更新 Skills → 发布版本 → 团队同步
3. **分层组织**：从概述到 API 映射到常见陷阱到最佳实践

## 未来展望

本文提出了四条演进路径：

1. **从 Skills 到知识图谱**：AI 理解模块间依赖关系，自动推荐相关 Skills
2. **从被动查询到主动建议**：IDE 插件实时分析代码，匹配 Skills 中的常见陷阱，编译前预警
3. **从静态文档到动态生成**：AI 自动生成 Skills，0 人工维护成本
4. **从个人工具到组织能力**：组织级知识平台，新人 0 学习成本，老人离职后知识不流失

## 相关实体

- [Agent Skill Writing Guide](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-skill-writing-guide.md) — Skill 编写方法论
- [Hermes Skill System](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-skill-system-winty.md) — Hermes 技能系统
- [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-engineering.md) — Harness 工程范式
- [Thin Harness, Fat Skills](https://github.com/QianJinGuo/wiki/blob/main/entities/thin-harness-fat-skills.md) — 薄 Harness 厚 Skills 架构
- [如何将经验编码为 Skills](https://github.com/QianJinGuo/wiki/blob/main/entities/how-to-encode-experience-into-skills.md) — 经验 → Skills 转化方法论
- [Agent Skills vs 低代码平台](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-skills-vs-coze-dify-n8n-lowcode-yexiaocha.md) — Skills 与低代码对比
- [Skill Craft](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-craft.md) — Skill 工艺学
- [Skill Engineering as Algorithm](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-engineering-ai-as-algorithm.md) — Skill 工程即算法
- [Anthropic 14 Skill Patterns](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-14-skill-patterns-best-practices.md) — Anthropic 技能设计模式
- [百度网盘 KMP 迁移三层架构](https://github.com/QianJinGuo/wiki/blob/main/entities/baidu-netdisk-kmp-migration-three-layer-agent-architecture.md) — 同类跨平台迁移案例
- [SkillX 分层技能库](https://github.com/QianJinGuo/wiki/blob/main/entities/skillx-hierarchical-skill-library.md) — 分层技能库架构
- [Skill Hub 组织资产](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-hub-organization-asset-winty.md) — 组织级技能管理中心

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ai-skills-middleware-migration-android-harmonyos-taobao-2026.md)

---

## Ch07.049 Skill 版本对比五大原则：从'两个数字比大小'到工程化质量门禁

> 📊 Level ⭐⭐ | 5.9KB | `entities/skill-version-comparison-five-principles-winty.md`

> 原文归档：[原文归档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/skill-version-comparison-five-principles-winty.md)

Skill 版本升级不能只看总分变化，需要多维度对比 + 分场景拆解 + 失败 case 人眼复核 + 统计显著性检验 + Token/时延纳入门禁。本文提出 5 条原则和完整的版本对比报告 YAML 模板。

## 一句话

**版本对比不是"两个数字比大小"：8 维度对比 + 5 层场景拆解 + regression/improvement/drift 三集 diff + 2σ 显著性 + Token/时延门禁 + CI 自动化。**

## 六种"假改进"陷阱

1. **均值改善但分布退化** — 总分涨了但关键场景回退
2. **整体提升但 P0 翻车** — 高优先级 case 回退即事故
3. **主要场景持平边缘场景下滑** — 低频但高风险场景被忽视
4. **看似变好其实是测试集偏移** — 新版刚好更适配测试集分布
5. **Token 暴涨换正确率** — 成本飙升但收益微小
6. **稳定性下降换正确率** — 正确率波动变大，确定性降低

## 五条原则

### 原则 1：永远多维度对比，不要只看一个数字

8 个必看维度：

| 维度 | 关心什么 | 例子 |
|------|----------|------|
| 总体正确率 | 平均效果 | overall_score 0.78 → 0.82 |
| 分层指标 | L1/L2/L3/L4 各层 | L3 +5pt, L4 -2pt |
| 分类型场景 | 不同 case 类型 | P0 +0pt, P1 +6pt, P2 +4pt |
| 一致性 | 多次跑的稳定性 | consistency 0.86 → 0.92 |
| 鲁棒性 | 扰动场景 | tool_junk 72% → 75% |
| 资源消耗 | Token / 步骤数 | tokens +18%, steps +0.6 |
| 时延 | 平均响应时间 | latency +1.4s |
| 失败模式 | 失败的种类 | 新版本是否引入新失败模式 |

### 原则 2：分场景看，不要只看均值

必须按 5 种维度拆分：

- 按业务严重性：P0 / P1 / P2
- 按使用频率：高频 / 中频 / 低频
- 按用户角色：开发 / 运维 / 业务
- 按风险等级：涉及生产 / 涉及测试 / 只读
- 按已知难度：经典 case / 边缘 case / 难 case

**P0 回退 = 事故**，不管总体分数涨多少。

### 原则 3：失败 case 必须人眼复核

三集 diff：

- **Regression set** — v1 ✅ → v2 ❌（最关键，P0 regression 原则不上线）
- **Improvement set** — v1 ❌ → v2 ✅
- **Drift set** — 都失败但方式不同（v1 死循环 vs v2 错误结论）

### 原则 4：用统计方法，不要凭感觉

- 每个版本至少跑 3 次评估
- 显著性判断：`diff > 2 * pooled_std`（最简版）
- 更严肃用配对 t 检验

如果 v2 比 v1 高 2pp 但波动 ±3pp，这 2pp 不是真改进。

### 原则 5：Token 与时延必须纳入对比

**Token/时延门禁标准：**

- 总分提升 ≤ 5pt → Token 增长 ≤ 10%，时延增长 ≤ 15%
- 总分提升 > 5pt → Token 增长 ≤ 25%，时延增长 ≤ 30%

反面案例：正确率 +2pp 但 Token +75%、时延 +75%，生产实际收益为负。

## 完整版本对比报告模板

YAML 结构化模板（关键字段）：

- `overall`：v1/v2 mean + diff + significant (bool)
- `by_layer`：L1-L4 各层变化
- `by_severity`：P0/P1/P2 变化
- `stability`：consistency_score + robustness_avg
- `cost`：avg_tokens + avg_latency 变化率
- `regression_cases`：具体 case 编号 + 描述
- `improvement_cases`：具体 case 编号 + 描述
- `verdict`：结论 + blockers + recommended_actions

## 真实案例：db-query Skill v2.0.0 被 P0 回退拦下

总分 +6pt 但 DELETE -30pt、DDL -35pt → 回退原因：新 prompt 过于激进 → 保留 v1 的"先确认再执行"逻辑后全部场景改进才上线。

## CI 自动化建议

- PR 提交后自动触发评估
- 自动生成对比报告贴回 PR 评论
- 指标回退 > 阈值自动加 regression 标签
- regression 标签 PR 需特殊审批才能 merge

## 相关实体

- [Skill 版本管理五大原则](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-version-management-semantic-versioning-practices-winty.md) — 同作者同系列，版本管理侧
- [Agent Skill 写作评估](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-skill-writing-evaluation.md)
- [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-engineering.md)
- [Claw-SWE-Bench](https://github.com/QianJinGuo/wiki/blob/main/entities/claw-swe-bench-harness-evaluation-benchmark-tokenrhythm.md) — harness 独立评测基准
- [Agent Eval WalleZhang](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-eval-wallezhang-yaml-driven-agent-evaluation-framework.md) — YAML 驱动评估框架

---

## Ch07.050 Multica — 开源 Managed Agents 平台

> 📊 Level ⭐⭐ | 5.8KB | `entities/multica-managed-agents-platform.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/multica-managed-agents-platform.md)

## 核心定位
开源 Managed Agents 平台。不提供 Agent 智能本身，而是给 Agent 一个"工作环境"——把 Agent 从对话窗口拉到项目看板上，变成为有名字、有任务、会汇报进度的团队成员。

## 关键技术参数
| 维度 | 数据 |
|------|------|
| Stars | ~25,584 (2026-05-07) |
| License | Apache 2.0 |
| 技术栈 | Next.js 16 / Go (Chi) / PostgreSQL 17 (pgvector) |
| Daemon | Go 守护进程，3s 轮询，20并发，2h超时 |
| Agent 支持 | Claude Code / Codex / Gemini / 十多种 CLI |
| 创建 | 2026-01-13 |

## 核心概念
| 概念 | 说明 |
|------|------|
| Runtime | 跑 Agent 的机器，daemon 注册后变为 Runtime |
| Agent | 有身份的团队成员（可配 Provider/Model） |
| Issue | 任务状态机：todo → in_progress → done/failed/blocked |
| Skill | 完成任务后经验沉淀，向量化存储 + 语义检索复用 |

## 与现有知识关联
- [Claude Managed Agents 开发者指南](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-managed-agents-developer-guide.md) — Managed Agents 概念扩展
- [Anthropic PM 的 Agentic 工作流](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-pm-agentic-workflow.md) — 管理多个 Agent 的场景
- [Agentic AI 系统架构](https://github.com/QianJinGuo/wiki/blob/main/entities/agentic-ai-system-architecture-harness-skill-mcp.md) — 五层架构，管理层问题
- [Skill-RAG：清华 SRA](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-rag-tsinghua-sra.md) — Skill 检索增强相关
- [Agent自我改进六条路](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-self-improvement-six-mechanisms.md) — Skill 积累属于经验沉淀
- Paperclip — 定位对比（个人AI公司模拟）
- [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/multica-managed-agents-platform.md)

## 关键洞察
1. Multica 的 Skill 沉淀机制与清华 SRA 的"技能检索"方向一致，但应用场景不同
2. "Agent 管理层缺失"是当前 Agent 工程化的真痛点——对接 Claude/Codex 再多人也无法协调
3. 与 CLI 层对接的代理模式（Daemon spawn 子进程）比框架集成更轻量、更无关厂商

## 深度分析
Multica 的核心创新在于将"管理层"从框架层抽离出来，成为独立的基础设施。与 CrewAI/AutoGen 强调"prompt chain 编排"不同，Multica 解决的是多 Agent 协作中的协调问题——谁做什么、做到哪了、结果如何复用。
**Skill 机制的架构意义**：将 Agent 执行结果转化为可检索的向量知识，这与 RAG 的区别在于用途不同——RAG 是检索增强生成，Skill 是经验复用。两者在向量检索层面共享基础设施，但目标正交。
**Daemon 设计的选择**：选择 3s 轮询 + 子进程隔离，而非 WebSocket 长连接 push，是因为多 Agent 场景下 Agent 可能长时间运行（2h 超时），轮询的简单性反而保证了可靠性。这也意味着 Multica 天然适合"人机协同"场景，而非纯机器自治。
**定位分野**：CrewAI/AutoGen 是"让 Agent 做事"的工具，Multica 是"让 Agent 在组织中做事"的基础设施。前者解决单点问题，后者解决系统问题。

## 实践启示
1. **多 Agent 场景优先选 Multica**：当需要管理超过 3 个 Agent、跟踪任务状态、沉淀执行经验时，Multica 的看板 + Skill 机制比自建脚本更稳定
2. **Skill 积累要早做**：Issue 完成后的经验沉淀是 Multica 的核心价值，团队应建立"每个 issue 必须沉淀 Skill"的流程
3. **Daemon 适合开发机**：Agent Daemon 运行在开发者本地，适合 Dev 流程中的自动化任务；纯服务端任务建议通过 API 对接
4. **并发控制注意**：默认 20 并发适合中小团队，大规模调度需要调整或引入任务队列层

## 相关实体
- [Anthropic Claude Managed Agents 平台正式发布](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-claude-managed-agents-platform-2026.md)
- [Anthropic 官方 Agent Harness 平台：Claude Managed Agents 完整指南](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-官方-agent-harness-平台claude-managed-agents-完整指南.md)
- [Claude Managed Agents 官方 Harness 平台指南](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-claude-managed-agents-guide.md)
- [claude managed agents](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-managed-agents.md)
- [claude managed agents official](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-managed-agents-official.md)

---

## Ch07.051 龙虾之父教你省钱：开源Skill给你的Skill减肥

> 📊 Level ⭐⭐ | 5.7KB | `entities/steipete-skill-cleaner-liangzide.md`

# 龙虾之父教你省钱：开源Skill给你的Skill减肥

> **来源**：量子位（2026-05-26）| 原文存档：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/steipete-skill-cleaner-liangzide.md)

## 深度分析

本文报道 OpenClaw 创始人 Peter Steinberger（@steipete，「龙虾之父」）开源的 skill-cleaner 工具——一个用于审计和优化 Skill 描述、降低 Agent 运行时 token 成本的技能系统分析工具。

### 核心主张：Skill 是路标，不是说明书

Peter 的核心观点：Skill 描述写得像本书一样、把乱七八糟的东西都塞进上下文，是 Skill 设计中最常见的问题。

Skill 的目的是让 Agent 找到路，不该把整本说明挂在路标上。Skill.md 应该是简洁的指引（路标），调用逻辑应该是代码（说明书）。

实操案例：有人写了 90 多词的 Skill 描述，Agent 无法正确调用技能；砍到 40 词以内后，Agent 一次选对了技能。

### skill-cleaner 工具设计

Peter 开源的 skill-cleaner 做了示范：Skill.md 只有 56 行提示词，调用的脚本近千行代码。

5 个核心功能：

1. **技能提示词预算审计计算**：分析技能占用的上下文令牌空间、预算占用比例，给出预算优化方案。脚本采用 Codex 官方源码同款提示词预算核算逻辑（UTF8 字节数/4 向上取整），以模型上下文 2% 为默认技能预算基数，结合技能优先级排序规则（系统技能＞内置技能＞插件技能＞仓库自定义技能），核算全量技能原始占用令牌、最小渲染令牌、预算内可用令牌。

2. **重复技能检测**：跨 Codex 内置库、插件缓存、代码库、个人技能根目录，扫描同名技能、描述/内容高度相似的重复技能，标记冗余项。

3. **未使用技能筛查**：基于历史日志，识别长期未被调用、未被提及、无使用痕迹的闲置技能，提供清理候选清单。

4. **技能根目录审计**：统计所有技能的来源根目录，标注已启用/禁用状态，梳理技能加载链路。

5. **描述精简优化**：找出冗长的技能描述，通过简化语法压缩长度，节省提示词预算。精简流程：文本预处理（统一格式、全部小写、剔除标点符号）→ 匹配预设场景关键词词库 → 调用标准化短动作词组替换。

精简示例：调试类 → debug, inspect, fix；部署发布类 → deploy, release, verify；检索归档类 → search, sync, summarize。

### 三步工作流

1. **执行分析脚本**：在技能目录/仓库根目录运行 Node.js 脚本，支持自定义参数（时间范围、日志深度、预算阈值、自定义根目录等）
2. **查看审计报告**：按顺序阅读技能预算→描述优化项→重复技能→未使用技能→根目录汇总
3. **安全清理/编辑**：优先保留 Codex 内置技能，删除本地/重复副本；保留仓库核心运维技能；修改前验证保留文件有效性

### Token 成本思维

Skill 描述每多一句，Agent 每次调用就要多付一笔 token 账单。Agent 看到的信息越多，选择时的噪声也越多——延迟、成本、注意力全部受影响。

这与 Harness Engineering 的原则一致：把约束写进代码，而非提示词。Skill 的预算边界应由代码层面的计量决定，而非描述文本的模糊暗示。

Peter 本人在评论区开始用「穴居人」风格说话，把省 token 刻到骨子里：

```
install skill
agent smart
user happy
```

### 与现有实体的关系

已有 `entities/peter-steinberger-openclaw-100-ai-agents.md`（Peter 的 100 AI agent 30 天 $130 万案例），本文是其技能工程实践的延续——从「如何用大量 agent」到「如何让 agent 高效调用 skill」。

## 实践启示

1. **Skill 描述简洁性直接影响 Agent 选对率**：过长描述（90+ 词）导致 Agent 选错；40 词以内反而一次成功。Skill 应作为路标而非说明书。
2. **用脚本实现 Skill 逻辑而非提示词**：skill-cleaner 示例：56 行 Skill.md + 近千行脚本。逻辑越复杂，越应封装在代码而非提示词里。
3. **定期审计 Skill 预算**：基于 Codex 官方计费规则（UTF8 字节/4 向上取整，2% 上下文预算）计算技能占用，及时发现冗余。
4. **检测并清理重复/未使用 Skill**：跨目录扫描重复 Skill，识别长期闲置 Skill，保持技能系统精简。
5. **用标准化短词组精简描述**：调试类→debug/inspect/fix；部署类→deploy/release/verify；检索类→search/sync/summarize。

## 相关实体
- [Openclaw Prompt Context Harness](https://github.com/QianJinGuo/wiki/blob/main/entities/openclaw-prompt-context-harness.md)
- [Skill System Design Three Way Comparison](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-system-design-three-way-comparison.md)
- [Openclaw Agent Loop Design Patterns](https://github.com/QianJinGuo/wiki/blob/main/entities/openclaw-agent-loop-design-patterns.md)
- [Tencent Skill Writing Complete Playbook Jackjchou](https://github.com/QianJinGuo/wiki/blob/main/entities/tencent-skill-writing-complete-playbook-jackjchou.md)
- [Ai Skill Skill Creator 源码拆解](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-skill-skill-creator-源码拆解.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/steipete-skill-cleaner-liangzide.md)

---

## Ch07.052 如何构建生产准备的AI代理：MCP、CLI与技能——适合合适的工作的工具

> 📊 Level ⭐⭐ | 5.1KB | `entities/production-ai-agents-mcp-cli-skills-stack-ayi.md`

# 如何构建生产准备的AI代理：MCP、CLI与技能——适合合适的工作的工具

> **来源**：啊镒opc实验基地（2026-05-26）| 原文存档：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/production-ai-agents-mcp-cli-skills-stack-ayi.md)

## 深度分析

本文系统梳理了 2026 年 AI Agent 生产部署的连接技术栈：Skills（领域知识）、MCP（模型上下文协议）、CLI（命令行执行）。核心论点是三者不是互斥选择，而是互补层——顶级 Agent 使用所有三层。

### 连接技术栈三层模型

**Skill（领域知识）**：可重用的程序指令和 Markdown 文件，教导模型如何使用工具。可跨客户端移植，从本地目录或远程仓库加载。负责复杂任务的上下文和领域知识。

**CLI / 计算机使用（本地执行）**：Unix 风格连接，高 token 效率（每响应约 200 token），利用模型预训练知识（git、gh、curl 等）。通过包管理器安装标准二进制文件。

**MCP（连接组织）**：提供丰富语义、平台独立性和企业功能（OAuth、治理策略、审计追踪）。通过代码定义工具/资源/提示，JSON-RPC 2.0 over HTTP/SSE 通信。适合需要确定性、授权和平台独立的场景。

### MCP 的 Token 开销问题与解决

MCP 的主要缺点：简单实现中，提前加载所有工具模式可能消耗 44,000–55,000 token 上下文。

解决策略：
- **渐进式发现**（Progressive Discovery）：不将所有工具放入上下文窗口，将工具加载推迟到模型实际需要时。通过 `tool_search` 功能按需加载，可将上下文使用减少 5 倍。
- **Annotated Tool Definitions**：使用描述性函数名、参数名并标注参数描述，帮助 LLM 精确知道期望，减少推理失败。

### 程序化工具调用（代码模式）

传统顺序工具调用的问题：依赖每个协调步骤的推理延迟，效率低。

代码模式解决方案：为模型提供执行环境（V8 隔离或 Python 沙盒），让其编写脚本一次性编排多个工具，而非多次顺序调用。

### 2026 MCP 路线图

- **无状态传输**：Google 提出新型协议，简化 Kubernetes/Cloud Run 部署，TypeScript/Python SDK v2.0 将发布
- **跨应用访问**：MCP 服务器间单点登录（公司身份提供商），服务器发现通过 `.well-known/mcp-server-card/server.json` 自动进行
- **MCP 上的技能**：服务器附带工具使用领域知识，通过 `skills/list` 和 `skills/get` endpoints 交付

### 核心结论

没有统一解决方案。顶级 Agent 使用全部三层：
- Skill = 领域知识（复杂上下文）
- CLI = token 高效执行（预训练工具）
- MCP = 安全连接性（企业级治理）

MCP 放弃会引发：身份验证碎片化、无审计追踪、供应商锁定。对大规模企业环境，连接纽带对于治理和安全至关重要。

## 实践启示

1. **不要在 MCP vs CLI 之间选择，而是三层全用**：根据任务类型选择正确层——预训练工具用 CLI，复杂上下文用 Skill，企业级集成用 MCP。
2. **渐进式发现减少上下文消耗**：使用 `tool_search` 按需加载工具，而非预加载全部，可减少 5 倍上下文使用。
3. **Annotated 参数描述提升 MCP 工具调用成功率**：描述性函数名/参数名 + 类型标注，让 LLM 精确知道期望，减少推理失败。
4. **代码模式替代顺序工具调用**：为 Agent 提供沙盒环境写编排脚本，减少多次 LLM 调用的累积延迟。
5. **MCP 服务器设计原则**：停止 REST API 一对一映射；设计具有明确意图的工具，为编排提供沙盒，发布 UI 资源。
6. **关注 MCP 2026 路线图**：无状态传输、跨应用 SSO、技能端点——企业级 MCP 生态正在快速成熟。

## 相关实体
- [Cli Mcp Skill Architecture Decision Vibecoder](https://github.com/QianJinGuo/wiki/blob/main/entities/cli-mcp-skill-architecture-decision-vibecoder.md)
- [Tencent Skill Writing Complete Playbook Jackjchou](https://github.com/QianJinGuo/wiki/blob/main/entities/tencent-skill-writing-complete-playbook-jackjchou.md)
- [Baixing Ontoz Enterprise Ontology Multi Agent](https://github.com/QianJinGuo/wiki/blob/main/entities/baixing-ontoz-enterprise-ontology-multi-agent.md)
- [From Agent Protocol To Harness Skill](https://github.com/QianJinGuo/wiki/blob/main/entities/from-agent-protocol-to-harness-skill.md)
- [Anthropic 官方生产级 Agent 最佳实践12 个可复用的 Mcp 设计模式 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-官方生产级-agent-最佳实践12-个可复用的-mcp-设计模式-v2.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/production-ai-agents-mcp-cli-skills-stack-ayi.md)
- [Mcp Server Patterns](https://github.com/QianJinGuo/wiki/blob/main/moc/mcp-server-patterns.md)

---

## Ch07.053 CLI系列④·选型CLI、MCP还是API？

> 📊 Level ⭐⭐ | 5.0KB | `entities/cli-mcp-sdk-agent-tool-selection.md`

# CLI系列④·选型CLI、MCP还是API？
CLI、MCP Server、SDK、Skills、Code Execution——这五个词看起来都在说"让 Agent 用工具"，但它们根本不在同一个抽象层级。
**核心问题：** 它应不应该有 CLI？还是 MCP Server 就够？或者它根本不该让 Agent 直接接触？

## 二、对人友好和对 Agent 友好？
Scalekit 2026 年基准测试（75 次，同一 Agent 执行同一组 GitHub 任务）：

## 相关实体
- [Cli Mcp Skill Architecture Decision Vibecoder](https://github.com/QianJinGuo/wiki/blob/main/entities/cli-mcp-skill-architecture-decision-vibecoder.md)
- [Aliyun Agentrun 2Line Integration](https://github.com/QianJinGuo/wiki/blob/main/entities/aliyun-agentrun-2line-integration.md)
- [Production Ai Agents Mcp Cli Skills Stack Ayi](https://github.com/QianJinGuo/wiki/blob/main/entities/production-ai-agents-mcp-cli-skills-stack-ayi.md)
- [Pi Mono Github](https://github.com/QianJinGuo/wiki/blob/main/entities/pi-mono-github.md)
- [Integrating Aws Api Mcp Server With Amazon Quick Suite Using Amazon Bedrock Agen](https://github.com/QianJinGuo/wiki/blob/main/entities/integrating-aws-api-mcp-server-with-amazon-quick-suite-using-amazon-bedrock-agen.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/cli-mcp-sdk-agent-tool-selection.md)

- [crawler vs opencli doubao](https://github.com/QianJinGuo/wiki/blob/main/entities/crawler-vs-opencli-doubao.md)

## 深度分析

**MCP Server 的性能问题根源是 schema bloat 而非 MCP 协议本身。** Scalekit 基准测试显示 MCP Server Token 消耗是裸 CLI 的 32 倍，但根因并非 MCP 协议有缺陷，而是所有 43 个工具的定义被全量注入 context。Code Execution 通过只暴露 `search()` + `execute()` 两个工具实现了 98.7% 的 token 降幅（150K → 2K），证明**按需暴露工具定义是解决 schema bloat 的关键** 。

**CLI 和 MCP 不是二选一——它们覆盖不同对象（人类 vs Agent）。** GitHub 的双覆盖策略（工具层 + 遥测检测 CLAUDECODE）和飞书的"原生 Agent Native"设计哲学表明，CLI 为人类提供可枚举的子命令交互，MCP Server 为 Agent 提供协议化的工具调用接口。两者可以共存，且往往需要共存 。

**Code Execution 本质上是通过 token 压缩实现大规模 API 集成的方案。** Cloudflare 的案例将 2,500+ API 端点压缩为 2 个工具定义（`search()` + `execute()`），将工具定义从 1,000+ tokens 压缩到固定开销。这揭示了一个重要规律：**Agent 工具设计的瓶颈不是能力上限，而是 context 容量**，按需暴露是所有高效方案的核心策略 。

**五问决策树提供了一个结构化的工具选型框架。** 从"Host 能调本地工具吗"到"这是高频杂活吗"，五问覆盖了工具选型的关键维度：执行环境可用性、服务提供形态、Token 成本敏感性、批量/多步需求、使用频率。这比凭感觉选择更能保证决策质量 。

**七项自查标准反映了优秀 Agent Native CLI 的设计要求。** 子命令可枚举（≤3层）、`--json` 全量子命令支持、OAuth/token 内置不暴露到 LLM 上下文、内建 Skills 文档、客户端遥测检测、按需 schema 暴露、官方 benchmark 数据 —— 这七项构成了评估 CLI 是否适合 Agent 使用的检查清单 。

## 实践启示

**当你的 API 端点超过 100 个时，优先考虑 Code Execution 模式而非 MCP Server。** 按需暴露（search + execute）的 token 效率远优于全量 schema 注入，是大规模工具集的必选方案 。

**在决定工具形态之前，先用五问决策树评估**：Host 环境能力 → 服务 CLI 可用性 → Token 成本敏感度 → 批量多步需求 → 使用频率。这能避免过早选择不合适的工具形态 。

**设计 CLI 时将 `--json` 全量子命令支持作为硬性要求。** 这是 Agent 能可靠解析 CLI 输出的前提。gh 和 lark-cli 在这方面的设计值得参考，而 Salesforce sf 的 schema 不一致问题是反面教材 。

**将 Skills 文档作为工具的必备配套而非可选附件。** Anthropic 的 Skills 概念解决了"什么时候该用哪个工具"的问题，这是让 Agent 正确选择工具而非仅能调用工具的关键差距 。

**如果你的场景 Token 成本敏感且需要批量/多步操作，选择 CLI + Skills 或 Code Execution，而非 MCP Server。** MCP Server 适合低敏感度的探索性任务，不适合重度生产使用 。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/cli-mcp-sdk-agent-tool-selection.md)

---

## Ch07.054 让 Amazon Quick 操作飞书：构建远程 MCP 服务的设计实践

> 📊 Level ⭐⭐ | 4.8KB | `entities/让-amazon-quick-操作飞书构建远程-mcp-服务的设计实践.md`

# 让 Amazon Quick 操作飞书：构建远程 MCP 服务的设计实践

## 相关实体

- [amazon quick + cisco webex mcp 会议准备与跟进助手：meeting-lifecycle m](https://github.com/QianJinGuo/wiki/blob/main/entities/amazon-quick-cisco-webex-mcp-meeting-prep-followup-assistant.md)
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/让-amazon-quick-操作飞书构建远程-mcp-服务的设计实践.md)

## 深度分析

让 Amazon Quick 操作飞书：构建远程 MCP 服务的设计实践 涉及agent领域的核心技术议题。
### 核心观点
1. # 让 Amazon Quick 操作飞书：构建远程 MCP 服务的设计实践
摘要：当 AI 助手需要操作飞书完成多步任务时，200+ 工具的上下文膨胀、多步编排的准确性和 Token 安全是三大挑战。
2. 本文分享如何基于 AWS Bedrock AgentCore 构建一套远程 MCP 服务，通过 Meta Tool 实现按需编排、分层注册平衡可用性与上下文效率，以及 OAuth PKCE + HMAC 域分离签名确保 Token 安全。
3. **目录**
01 一、概述
03 三、方案概览
07 七、平台与部署
09 九、成本估算
10 十、总结
## **一、概述**
飞书是许多团队日常协作的核心平台，但 Amazon Quick 目前尚未内置飞书集成。
4. 本文分享如何利用 Amazon Quick 的远程 MCP Connector 能力，基于 AWS Bedrock AgentCore 构建一套托管 MCP 服务，让 Quick 用户直接通过对话完成飞书日程安排、消息发送、文档创建等跨域操作。
5. 文章重点解析构建过程中的三项设计决策：4 个 Meta Tool 实现 200+ 工具的按需编排、Tier1/Tier2 分层注册平衡可用性与上下文效率，以及 OAuth 2.

### 内容结构
- 让 Amazon Quick 操作飞书：构建远程 MCP 服务的设计实践
- **一、概述**
- **二、为什么 Amazon Quick 需要飞书集成**
- 2.1 Amazon Quick 缺少飞书能力
- 2.2 lark-cli：为个人使用设计的本地工具
- 2.3 设计目标
- **三、方案概览**
- 3.1 效果演示

### 技术要点

- **agent架构**: 本文在agent方向提出的设计理念与实现路径
- **工程挑战**: 实际落地中面临的关键问题与应对策略
- **architecture趋势**: 相关技术演进方向与新兴范式
### 关联实体

- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](https://github.com/QianJinGuo/wiki/blob/main/entities/agentops-operationalize-agentic-ai-at-scale-with-amazon-bedr.md)
- [Scale Robot Reinforcement Learning With Nvidia Isaac Lab On ](https://github.com/QianJinGuo/wiki/blob/main/entities/scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on-.md)
- [Nvidia Isaac Lab Sagemaker Robot Rl Humanoid](https://github.com/QianJinGuo/wiki/blob/main/entities/nvidia-isaac-lab-sagemaker-robot-rl-humanoid.md)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/openclaw-完全指南这可能是全网最新最全的系统化教程了32w字建议收藏-v2.md)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](https://github.com/QianJinGuo/wiki/blob/main/entities/openclaw-完全指南这可能是全网最新最全的系统化教程了32w字建议收藏.md)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](https://github.com/QianJinGuo/wiki/blob/main/entities/存之有序治之有矩agent-记忆系统的工程实践与演进.md)

## 实践启示
1. **工程落地**: agent领域方案需关注可观测性、可维护性和成本效率
2. **技术选型**: 根据场景选择合适的技术栈，避免过度设计或盲目追新
3. **持续迭代**: 建立数据驱动的反馈闭环，持续优化系统表现
4. **风险管控**: 引入新技术需评估对现有系统稳定性的影响，做好降级预案

---

## Ch07.055 Introducing the MDN MCP server

> 📊 Level ⭐⭐ | 4.6KB | `entities/introducing-mdn-mcp-server-2026.md`

# Introducing the MDN MCP server

> Source: [MDN Blog 原文](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/introducing-mdn-mcp-server-2026.md)

## 三个独有贡献（不应合并到现有 entity）

1. **首批主流 Web 标准权威机构采纳 MCP** — Mozilla 旗下 MDN（Web 文档领域的 canonical reference）推出官方 MCP server，标志着 MCP 从 Anthropic 协议升级为主流 Web 标准协议。之前 MCP 主要在 AWS / Anthropic / Claude Code / Kiro 等厂商生态内使用，MDN 接入是首次主流开放标准机构的背书。
2. **完整文档集成的实际工程方案** — MDN 通过 MCP 提供 HTML / CSS / JavaScript / Web API 全量文档，包含 13000+ 页面。agent 可以 fetch_webpages 抓取任意 MDN 页面，readMDN 读取完整内容。这是 MCP Resources + Tools 标准接口的具体落地示例。
3. **AI agent 实际使用场景的展示** — 客户端在 Cursor 中真实接入后，演示了 5 大场景：检查 API 兼容性、获取 MDN 文章内容、查询 HTML 元素属性、访问 CSS reference、查询 Web API。配 Cursor MCP setup 的完整配置截图（JSON），可直接复用。

## MDN MCP server 的核心能力

**1. Resources（资源暴露）**
- `https://mdn-mcp.example.com/{path}` 格式：暴露任意 MDN 文档 URL 为 MCP resource
- agent 可以 resources/read 获取完整文档内容

**2. Tools（工具接口）**
- `searchMDN` — 关键词搜索 MDN 全量文档
- `readMDN` — 按 URL 读取完整 MDN 文章
- `fetch_webpages` — 抓取任意 MDN URL

**3. 客户端接入方式**
- Cursor：MCP configuration JSON（`mcpServers` 配置块）
- 通用 MCP client：JSON-RPC over stdio / HTTP

## 与现有 MCP 实体的差异化

| 维度 | MDN MCP server | AWS Bedrock AgentCore MCP | Claude Code MCP server |
|------|----------------|---------------------------|------------------------|
| 提供方 | Mozilla（Web 标准权威） | AWS（云厂商） | Anthropic（模型厂商） |
| 数据源 | MDN 全量 Web 文档 | AWS 服务文档 + 自定义 | Anthropic 工具 + 自定义 |
| 主要场景 | Web 开发文档查询 | 云资源管理 | Claude Code agent 工具 |
| 接入门槛 | 低（免费 + 公开） | 中（AWS 账户） | 中（Claude Code 集成） |
| 协议成熟度 | 标准 MCP（2025-03 spec） | AWS 扩展 MCP | 标准 MCP |

**MDN 的独特定位**：Web 标准 + 开放文档 + 零成本接入。其他 MCP server 都是商业或厂商生态的扩展。

## 实践启示

- **AI agent 文档集成的标准模式**：未来所有大型开放文档集（Wikipedia / arXiv / Stack Overflow / GitHub Docs）都应通过 MCP 暴露。MDN 的 5 大场景演示了文档 → MCP resource → agent tool → 用户查询的标准集成模式。
- **Web 开发 agent 的基础设施升级**：之前需要手动 fetch + parse + index 的 Web 文档查询，现在可以通过 MCP 一行代码完成。Cursor + MDN MCP = 实时准确的 Web API 兼容性检查。
- **MCP 生态的健康信号**：MDN 接入表明 MCP 已经成为 AI agent 工具调用事实标准（类似 LSP 在 IDE 中的地位），不再是 Anthropic 一家之言。

## 相关主题

- [Anthropic MCP 协议回顾](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-mcp-revisited.md) — MCP 协议本身的设计
- [AWS Bedrock AgentCore MCP](https://github.com/QianJinGuo/wiki/blob/main/entities/aws-bedrock-agentcore-doris-mcp-server.md) — 商业 MCP server
- [Claude Code MCP server](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-mcp-server.md) — Claude Code 工具系统
- [Hermes Agent 工具系统架构](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent-tool-system-architecture.md) — agent 工具调用一般化框架

## References

See [MDN Blog 原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/introducing-mdn-mcp-server-2026.md)

---

## Ch07.056 当我把AI变成一个\"算法\"：Skill工程化设计的心路历程

> 📊 Level ⭐⭐ | 4.5KB | `entities/skill-engineering-ai-as-algorithm.md`

# 当我把AI变成一个\"算法\"：Skill工程化设计的心路历程

**目标：把 Agent 当成一个算法来用。**
给 Agent 输入，它给你指定格式的输出。中间推理过程不关心，但结果是确定的、可预期的。
但 LLM 天生不是这样的东西——它是概率模型，不是函数。每次调用都在概率空间里掷骰子。

### 痛点 1：Token 是钱，试错是浪费
Agent 在模糊需求前反复揣摩、多轮尝试、走了一半发现方向不对再重来——每一步都在烧 Token。

## 相关实体
- [我用 Skillmd 做了一个简历生成器](https://github.com/QianJinGuo/wiki/blob/main/entities/我用-skillmd-做了一个简历生成器.md)
- [Hermes Agent Getting Started Guide 2026](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent-getting-started-guide-2026.md)
- [Llm Raiders Private Ai Server](https://github.com/QianJinGuo/wiki/blob/main/entities/llm-raiders-private-ai-server.md)
- [Pi Mono Github](https://github.com/QianJinGuo/wiki/blob/main/entities/pi-mono-github.md)
- [我用 Skillmd 做了一个简历生成器](https://github.com/QianJinGuo/wiki/blob/main/entities/我用-skillmd-做了一个简历生成器.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/skill-engineering-ai-as-algorithm.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/ai-skill-design.md)
## 深度分析

**1. 概率模型与确定性执行的根本矛盾**
LLM 是概率模型，每次调用在概率空间"掷骰子"；而工程化生产需要的是输入→输出的确定性映射。这个矛盾不能靠提示词优化解决，必须在架构层面把不确定性封装在最小范围内 ^

**2. "修渠不改河"是 Agent Harness 的核心哲学**
不改变 LLM 的本质（概率性、泛化能力），而是通过外部确定性系统（CLI）给它修好轨道。Agent 保留"理解人话、做判断、组织表达"的能力，所有确定性事务（流程顺序、数据格式、API 调用）全部外置 ^

**3. 上下文管理是 Skill 工程化的真正瓶颈**
当工具数量扩张到 20+ 时，SKILL.md 全量方案会导致 AI 注意力分散，按需加载引入复杂性。CLI 的深层角色是接管 Agent 的上下文管理——把每次需要关注的信息压缩到最小 ^

**4. Agent/CLI 职责边界：JSON 参数作为协议**
Agent（大脑）负责意图理解和决策，CLI（手脚）负责确定性执行。两者通过 JSON 参数/结果进行解耦通信。Agent 的不确定性被 CLI 的确定性包裹，而非试图消除 ^

**5. Token 消耗是架构失效的信号，而非资源问题**
试错式 Token 消耗不是"钱的问题"，是设计问题的指示器。当 Agent 需要反复揣摩、多轮尝试才能完成确定性任务时，说明上下文压缩和职责分离没有做到位 ^

## 实践启示

1. **用 CLI 包裹所有确定性操作**：HTTP 请求拼装、YAML 写入、API 字段校验等 AI 容易出错的操作，全部由 CLI 接管，Agent 只输出 JSON 参数 ^

2. **建立最小上下文暴露机制**：每个执行步骤只向 Agent 提供该步骤必需的参数和上下文信息，用架构而非提示词工程来解决上下文膨胀问题 ^

3. **设计 JSON 参数/结果的标准化协议**：Agent 与 CLI 之间的接口应该是结构化的、类型明确的，而非自然语言的随意交接，便于确定性验证 ^

4. **把"让 AI 只做决策"作为 Skill 拆分的原则**：如果一个 Skill 里 AI 做的事太多（拼请求、写格式），说明它应该被拆分——决策归 Agent，执行归 CLI ^

5. **用 Token 消耗率监控架构健康度**：正常执行应该是 1 轮对话完成确定性任务；如果出现多轮试错，立即检查是上下文缺失还是职责边界不清 ^

---

## Ch07.057 Create Custom MCP Catalogs and Profiles

> 📊 Level ⭐⭐ | 4.1KB | `entities/create-custom-mcp-catalogs-and-profiles.md`

## 核心要点
-
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/create-custom-mcp-catalogs-and-profiles.md)

## 深度分析
### 企业 MCP 治理的结构性需求
Custom Catalogs 的出现回应了 MCP 生态中的一个核心矛盾：协议标准化了工具的接入方式，但工具的分发与审批仍然缺乏统一机制。在组织内部，不同团队可能需要不同的 MCP 服务器集合——研发需要 Playwright/GitHub，运营需要 Notion/Atlassian，而敏感岗位可能只允许使用经过安全审计的内部服务。Custom Catalogs 允许平台团队将这些约束封装成一个可分发的 OCI artifact，让开发者无需理解内部审批流程即可获得可信工具集。

### Profiles 作为上下文隔离层
Profiles 的设计目标不仅是"分组"，更是**上下文隔离**。当 Agent 连接多个 MCP 服务器时，所有服务器的 tool 都会进入 context window——在 tool 数量较多时会迅速消耗宝贵的上下文额度。Profiles 通过让用户选择性地启用/禁用特定 tool，解决了这一实际问题。此外，Profiles 支持保存配置状态（如 Markitdown 的访问路径），实现"一次配置、反复复用"的工作流。这与 `MCP 12 生产模式` 中的"薄交互面"和"按意图组织工具"模式形成呼应——Profiles 本质上是这两个模式在终端用户层的具象化。

### OCI 分发模型的安全含义
将 Catalog 和 Profile 都作为 OCI artifact 分发，意味着它们天然继承了容器镜像的访问控制语义——私有 Catalog 只需在 Docker Hub（或任意 OCI registry）上设置仓库级权限，无需引入新的基础设施。这一设计将 MCP 的分发层与已有的企业容器安全体系打通，对于已有一套 Docker 镜像管理流程的组织，采纳成本几乎为零。

### 平台与个人的分工边界
文章的核心观点是：Custom Catalogs 定义"组织推荐什么"，Profiles 定义"个人如何工作"。这一分离让平台团队承担治理责任（可信服务器清单、版本稳定性），同时保留个人灵活度（工具组合、配置细节、跨项目迁移）。这种分层设计是[混合云 MCP 运维场景](https://github.com/QianJinGuo/wiki/blob/main/entities/aws-devops-agent-mcp-server打通混合云网络排障的最后一公里.md)中同样适用的原则——基础设施团队提供标准化的 MCP server，而使用它们的 Agent workflow 由业务团队自行掌控。

## 实践启示
**对于平台/基础设施团队**：从自定义 Catalog 开始，先将内部自建的 MCP server 纳入可信清单，再逐步引入社区服务器作为可选扩展。Catalog 的迭代周期应与内部工具审批流程对齐。
**对于开发者**：养成按工作场景创建 Profile 的习惯——coding、planning、research 各一个Profile，切换时只需重连 client，而非重新配置 server。这一习惯在工具数量增长时尤为关键。
**对于安全/治理团队**：关注文章提到的下一步方向——governance and policy controls。若 Profile 能与 SSO/权限系统绑定，Profiles 有潜力成为 MCP 时代的"设备管理"层。

## 关联阅读
-  — 12 种 Agent 连接外部工具的工程模式，与 Catalogs/Profiles 的设计思路高度互补
-  — 混合云场景下的 MCP 实际运维闭环实践

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/tool-use-mcp-patterns.md)

---

## Ch07.058 25个Skills详解：从生产力清单到AI工作流资产

> 📊 Level ⭐⭐ | 3.4KB | `entities/nico-25-skills-workflow-asset-ruofei-analysis.md`

# 25个Skills详解：从生产力清单到AI工作流资产

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/nico-25-skills-workflow-asset-ruofei-analysis.md)

## 深度分析

25个Skills详解：从生产力清单到AI工作流资产 涉及agent领域的核心技术议题。
### 核心观点
1. # 25个Skills详解：从生产力清单到AI工作流资产
> 来源：架构师（若飞）| 2026-05-28 | 分析 Nico 整理的25个生产力 Skills
## 核心命题
Skill 不是提示词合集，而是轻量级 Runbook——可保存、可复查、可迭代的工作规程。
2. 它把隐性经验变成 Agent 可以读取和执行的工作流程。
3. ## 三层视角
### 个人视角
Skill 把顺手的方法留下来。
4. 下次遇到同类任务，不必重新组织语言。
5. ### 技术团队视角
Skill 把工程规范、上下文、检查点和失败经验，放进 Agent 每次工作的路径里。

### 内容结构
- 25个Skills详解：从生产力清单到AI工作流资产
- 核心命题
- 三层视角
- 个人视角
- 技术团队视角
- 管理层视角
- Skill 在 Agent Runtime 里的位置
- 六维评判标准

### 技术要点

- **agent架构**: 本文在agent方向提出的设计理念与实现路径
- **工程挑战**: 实际落地中面临的关键问题与应对策略
- **architecture趋势**: 相关技术演进方向与新兴范式
### 关联实体

- [你不知道的 Agent原理架构与工程实践 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/你不知道的-agent原理架构与工程实践-v2.md)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/openclaw-完全指南这可能是全网最新最全的系统化教程了32w字建议收藏-v2.md)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/karpathy-最新访谈从-vibe-coding-到-agentic-engineering.md)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](https://github.com/QianJinGuo/wiki/blob/main/entities/openclaw-完全指南这可能是全网最新最全的系统化教程了32w字建议收藏.md)
- [Ethan He Cosmos Grok Imagine Latent Space Video Agent 20260606](https://github.com/QianJinGuo/wiki/blob/main/entities/ethan-he-cosmos-grok-imagine-latent-space-video-agent-20260606.md)
- [一文带你弄懂 Ai 圈爆火的新概念Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/一文带你弄懂-ai-圈爆火的新概念harness-engineering.md)

## 实践启示
1. **工程落地**: agent领域方案需关注可观测性、可维护性和成本效率
2. **技术选型**: 根据场景选择合适的技术栈，避免过度设计或盲目追新
3. **持续迭代**: 建立数据驱动的反馈闭环，持续优化系统表现
4. **风险管控**: 引入新技术需评估对现有系统稳定性的影响，做好降级预案

---

## Ch07.059 Perplexity 首次公开了内部 Skill 设计指南

> 📊 Level ⭐⭐ | 3.3KB | `entities/perplexity-internal-skill-design-guide-xiaojianke.md`

# Perplexity 首次公开了内部 Skill 设计指南

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/perplexity-internal-skill-design-guide-xiaojianke.md)

## 深度分析

Perplexity 首次公开了内部 Skill 设计指南 涉及agent领域的核心技术议题。
### 核心观点
1. # Perplexity 首次公开了内部 Skill 设计指南
> 进化 AI 实验室 | 2026-05-19 | 安徽
帕斯卡的名言："我之所以把这篇写得更长，是因为我没有闲暇时间把它缩短。
2. "——现在成了 Perplexity 开发者的核心准则。
3. Perplexity 认为，开发高质量 Agent Skill 所需的直觉和实践方法，与构建传统软件完全不同。
4. 在 Perplexity 内部，工程师们提交的 Skill 代码经常会被打回重写，因为许多在编写传统代码时非常有用的模式，在创建 Skill 时反而成了错误的范式。
5. 当你编写一个 Skill 时，不是在编写普通的软件，而是在为模型及其运行环境构建「语境」（Context）。

### 内容结构
- Perplexity 首次公开了内部 Skill 设计指南
- 什么是 Skill？
- Skill 是一个目录
- Skill 是一种格式
- Skill 是可调用的
- Skill 是渐进式的
- 你什么时候需要 Skill？
- 需要 Skill 的情况

### 技术要点

- **agent架构**: 本文在agent方向提出的设计理念与实现路径
- **工程挑战**: 实际落地中面临的关键问题与应对策略
- **architecture趋势**: 相关技术演进方向与新兴范式
### 关联实体

- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/karpathy-最新访谈从-vibe-coding-到-agentic-engineering.md)
- [Karpathy Vibe Coding Agentic Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/karpathy-vibe-coding-agentic-engineering.md)
- [你不知道的 Agent原理架构与工程实践 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/你不知道的-agent原理架构与工程实践-v2.md)
- [Ethan He Cosmos Grok Imagine Latent Space Video Agent 20260606](https://github.com/QianJinGuo/wiki/blob/main/entities/ethan-he-cosmos-grok-imagine-latent-space-video-agent-20260606.md)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](https://github.com/QianJinGuo/wiki/blob/main/entities/存之有序治之有矩agent-记忆系统的工程实践与演进.md)
- [两万字详解Claude Code源码核心机制](https://github.com/QianJinGuo/wiki/blob/main/entities/两万字详解claude-code源码核心机制.md)

## 实践启示
1. **工程落地**: agent领域方案需关注可观测性、可维护性和成本效率
2. **技术选型**: 根据场景选择合适的技术栈，避免过度设计或盲目追新
3. **持续迭代**: 建立数据驱动的反馈闭环，持续优化系统表现
4. **风险管控**: 引入新技术需评估对现有系统稳定性的影响，做好降级预案

---

## Ch07.060 Anthropic 官方生产级 Agent 最佳实践：12 个可复用的 MCP 设计模式

> 📊 Level ⭐⭐ | 2.9KB | `entities/anthropic-官方生产级-agent-最佳实践12-个可复用的-mcp-设计模式-v2.md`

> -> [anthropic-官方生产级-agent-最佳实践12-个可复用的-mcp-设计模式-v2.md](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/anthropic-官方生产级-agent-最佳实践12-个可复用的-mcp-设计模式-v2.md)

## 核心要点

- Anthropic 官方《Building agents that reach production systems with MCP》核心观点：生产级 Agent 的难点不是"能不能调用工具"，而是"能不能安全、稳定、低成本地连接真实系统"
- 12 个设计模式分为 5 组：工具交互面、交互语义、认证凭证、上下文经济、打包分发
- 直接 API 调用 vs CLI vs MCP：MCP 在生产环境的综合优势最为明显
- 这些模式是从 Claude Code 源码泄露事件中结合 Anthropic 官方 Agent Skills 指南提取的
- 理解这些模式比单纯会写一个 MCP Server 更重要

## 深度分析

这篇文章系统性地将 Anthropic 的生产级 Agent 设计经验抽象为可复用的工程模式。

**MCP 的战略价值**：MCP（Model Context Protocol）正在成为 Agent 工具集成的标准协议。它的核心价值不是"让 Agent 调用更多工具"，而是"标准化 Agent 与外部系统的连接方式"——这降低了集成复杂度、提高了安全性、简化了权限管理。

**12 模式的实用框架**：
- 工具交互面：如何定义 Agent 可用的工具边界
- 交互语义：Agent 与工具之间的请求/响应如何设计
- 认证凭证：如何安全管理 Agent 的外部系统访问权限
- 上下文经济：如何控制工具调用带来的上下文膨胀
- 打包分发：如何在不同环境间迁移 Agent 配置

**源码泄露的意外价值**：Claude Code 源码泄露让外界得以验证对 Anthropic Agent 架构的推断，同时证实了这些设计模式的实际存在。

## 实践启示

- 构建生产级 Agent 时，优先考虑工具连接的安全性和稳定性，而非工具数量
- 学习 MCP 协议时，重点理解其设计原则而非仅关注实现细节
- 建立 Agent 工具集成的标准模式库，避免每个项目独立设计
- 关注 Anthropic 官方文档和源码，两者是理解生产级 Agent 设计的最佳资源

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/tool-use-mcp-patterns.md)

---

## Ch07.061 Skill自进化三路线：Trace2Skill归纳法 / EvoSkill验证闭环 / SkillOpt训练范式

> 📊 Level ⭐⭐ | 2.1KB | `entities/skill-self-evolution-three-approaches.md`

# Skill自进化三路线：Trace2Skill归纳法 / EvoSkill验证闭环 / SkillOpt训练范式

## 深度分析

Skill 自演进的三种方法：比较基于反馈的增量优化、基于反思的结构重构和基于学习的技能合成三种自演进路径

### 技术要点

- **agent架构**: 在agent领域的设计理念与实现路径
- **工程挑战**: 实际落地中面临的关键问题与应对策略
- **行业趋势**: agent方向的技术演进与新兴范式

### 关联实体

- [Agent Skills Comprehensive Survey](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-skills-comprehensive-survey.md)
- [Skillopt Microsoft Train Skill Like Neural Network](https://github.com/QianJinGuo/wiki/blob/main/entities/skillopt-microsoft-train-skill-like-neural-network.md)
- [Alibaba Agentic Cloud](https://github.com/QianJinGuo/wiki/blob/main/entities/alibaba-agentic-cloud.md)
- [Skillopt Microsoft Train Skill Hyman'S Blog](https://github.com/QianJinGuo/wiki/blob/main/entities/skillopt-microsoft-train-skill-hyman's-blog.md)
- [Skillopt Skill Document Training Microsoft Sjtu](https://github.com/QianJinGuo/wiki/blob/main/entities/skillopt-skill-document-training-microsoft-sjtu.md)
- [Deli Auto Research Skill V2 Continual Learning Self Improvement](https://github.com/QianJinGuo/wiki/blob/main/entities/deli-auto-research-skill-v2-continual-learning-self-improvement.md)

## 实践启示

1. **工程落地**: agent方案需关注可观测性与可维护性
2. **技术选型**: 根据场景需求选择合适方案，避免过度设计
3. **持续迭代**: 建立反馈闭环，数据驱动优化
4. **风险管控**: 充分评估新技术对系统稳定性的影响

---

## Ch07.062 Microsoft Agent Framework Tools 总览：4 类工具 + Provider 矩阵 + Tool Approval

> 📊 Level ⭐⭐⭐ | 26.6KB | `entities/microsoft-agent-framework-tools-overview-provider-matrix.md`

# Microsoft Agent Framework Tools 总览

## 核心定位

> "**工具不是'插件列表'，而是 Agent 对外的能力契约**"

**在 Agent Framework 里，Tool 是模型与外部世界之间的稳定接口**：
- 一次 `tool_call` 对应一次**结构化入参**
- 一次**可观测的副作用**（或只读查询）
- **可被中间件拦截的执行路径**

## 相关实体
- [Microsoft Agent Framework Structured Output](https://github.com/QianJinGuo/wiki/blob/main/entities/microsoft-agent-framework-structured-output.md)
- [Microsoft Agent Framework Python Zizhi](https://github.com/QianJinGuo/wiki/blob/main/entities/microsoft-agent-framework-python-zizhi.md)
- [800行代码实现 Open Claw 的 Tool消息总线子Agent管理架构](https://github.com/QianJinGuo/wiki/blob/main/entities/800行代码实现-open-claw-的-tool消息总线子agent管理架构.md)
- [Open Claw Tool Bus Subagent Architecture](https://github.com/QianJinGuo/wiki/blob/main/entities/open-claw-tool-bus-subagent-architecture.md)
- [Ai Tool Poisoning Exposes A Major Flaw In Enterprise Agent Security](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-tool-poisoning-exposes-a-major-flaw-in-enterprise-agent-security.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/microsoft-agent-framework-tools-overview-provider-matrix.md)

## 4 类工具（按"谁执行、谁托管"划分）

### 1. Function Tools（应用代码）

**开发者用 `@tool` / `FunctionTool` 暴露的本地函数**，由框架的 function-invoking chat client 在**应用进程内调度**。

**特点**：
- **可移植性最好**
- **最适合接业务逻辑与细粒度权限**
- **入参由模型根据 JSON Schema 生成** — **必须按不可信输入校验**（见 Agent 篇 Safety）
- **支持 `approval_mode="always_require"` 等人机协同**（见下文 Tool Approval）

### 2. Hosted Tools（Provider 托管）

**由 OpenAI / Azure OpenAI Responses 或 Foundry 等运行时托管执行**：

| 工具 | 作用 |
|---|---|
| **Code Interpreter** | 沙箱内执行代码 |
| **File Search** | 对已上传向量库/文件检索 |
| **Web Search** | 联网检索（视 Provider 而定） |
| **Image Generation** | 托管文生图（Foundry / Responses） |
| **Shell** (`get_shell_tool`) | OpenAI Responses 托管 Shell（**与 Copilot CLI 内置 Shell 不是同一套**） |

**关键特点**：
- **不经过你的 Python 函数体**
- **计费、配额、数据驻留都跟随 Provider**
- **Chat Completion 客户端往往不支持完整 Hosted 能力集**

### 3. MCP Tools（Model Context Protocol）

| 形态 | 说明 |
|---|---|
| **Hosted MCP** | 由 Provider 运行时拉起/调用 MCP Server |
| **Local MCP** | 应用侧连接 stdio / 自定义 Host 上的 MCP Server |

**价值主张**：
- **MCP 适合把已有工具生态（数据库、SaaS、内部平台）以标准协议接到 Agent**
- **不必每个集成写一个薄封装函数**
- **只要底层 client 支持 function calling，Local MCP 通常可与其他 Function Tools 混用**

### 4. Foundry 扩展工具（项目级连接）

**通过 `FoundryChatClient` 挂载、在 Foundry 项目里配置连接的工具**：

| 工具 | 状态 |
|---|---|
| **Foundry Toolboxes** | 命名、版本化的托管工具包 |
| **Bing Grounding / Bing Custom Search** | 联网/域内检索 |
| **Azure AI Search** | 经 Foundry Connection 查询索引 |
| **SharePoint / Microsoft Fabric** | 企业内容/数据智能体 |
| **Memory Search** | Foundry 托管记忆库检索 |
| **Computer Use / Browser Automation** | 桌面/浏览器自动化（Playwright） |
| **Agent-to-Agent (A2A)** | 将远程 A2A Agent 暴露为工具 |

**注意**：部分为 **preview / experimental**，首次使用会抛 `ExperimentalWarning`。

**重要边界**：
- **FoundryAgent**（远端已定义的智能体）vs **FoundryChatClient**（本地 client 组工具）能力边界**不同**
- **许多工具只能在后者路径下由框架动态挂载**
- **前者需在 Foundry 门户/agent 定义里预配置**

## Provider 能力矩阵（Python，精简版）

> "**同一工具类型在不同 Client 上可用性不同**"

✅ 支持 / ❌ 不支持 / ⚠️ 视模型是否支持 function calling

| Tool Type | Responses | Chat Completion | Foundry | Anthropic | Ollama | Foundry Local | GitHub Copilot |
|---|---|---|---|---|---|---|---|
| **Function Tools** | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ |
| **Code Interpreter** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **File Search** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Web Search** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Image Generation** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Hosted Shell** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Hosted MCP** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Local MCP** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Foundry Toolboxes** | ❌ | ❌ | ✅* | ❌ | ❌ | ❌ | ❌ |
| **Bing / AI Search / SharePoint** | ❌ | ❌ | ✅* | ❌ | ❌ | ❌ | ❌ |

*Foundry 列中标注 experimental/preview 的条目**仅 Foundry 路径可用**。OpenAI 与 Azure OpenAI 在 Responses / Chat Completion 上工具能力镜像对齐。Copilot 另有 CLI 内置 shell / 文件 / URL fetch（**权限由 Copilot permission handler 控制**），与 OpenAI `get_shell_tool` **不同表面**。

## 工程含义

> "**先定 Client 类型（Responses vs Chat Completion vs Foundry），再选工具清单。**"

**3 条关键选型原则**：

1. **需要 Code Interpreter + File Search 时，优先 Responses 或 Foundry**，不要假设 Chat Completion 全能
2. **本地 Ollama / Foundry Local 能否用 Function Tools，取决于当前模型是否支持 tool calling**
3. **"代码能 import，运行时 client 不支持"的落差** — 选型时按形态 + Provider 运行时能力两层拆开看

## Tool Approval：框架级统一闸门

**Tool Approval 不是某个云厂商的独占能力**，而是 **function-invoking chat client 上的横切能力**：
- Function Tools
- 部分 Hosted 调用
- MCP tool call

**均可走同一套"先暂停、等人确认、再继续"流水线**。

**Python 单函数声明示例**：

```python
from typing import Annotated
from agent_framework import tool, Agent, Message
from agent_framework.openai import OpenAIChatClient

@tool
def get_weather(location: Annotated[str, "City, e.g. San Francisco, CA"]) -> str:
    return f"Weather in {location}: cloudy, 15C."

@tool(approval_mode="always_require")
def transfer_funds(account: str, amount: float) -> str:
    return f"Transferred {amount} to {account}"

async with Agent(
    client=OpenAIChatClient(),
    instructions="You are a banking assistant.",
    tools=[get_weather, transfer_funds],
) as agent:
    result = await agent.run("Transfer 1000 to ACCT-42 and summarize weather in AMS.")

    while result.user_input_requests:
        for req in result.user_input_requests:
            # 展示 req.function_call.name / arguments 给终端用户
            approved = True  # 实际 UI 采集
            result = await agent.run([
                "Transfer 1000 to ACCT-42 and summarize weather in AMS.",
                Message("assistant", [req]),
                Message("user", [req.create_response(approved)]),
            ])
    print(result.text)
```

**要点**：
- **需要用户输入时，`run()` 不会直接给出最终答案**，而是返回 `user_input_requests`（含函数名与参数 JSON）
- **与 Session 联用时，可在多轮中保留审批上下文**
- **流式场景需在 chunk 上同样检查 `user_input_requests`**
- **生产环境对副作用类工具应默认 `always_require`，而非 sample 里的 `never_require`**

## Agent 作为 Tool：组合式多智能体

**Overview 提供 Agent → Function Tool 的桥接**：
- **内层 Agent** 自带工具与指令
- **外层 Agent** 把它当作一个**可调用工具**
- **分层委派**（与 Workflow 的确定性图编排不同，更偏模型自主路由）

```python
weather_agent = OpenAIChatCompletionClient(
    model=os.environ["AZURE_OPENAI_CHAT_COMPLETION_MODEL"],
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
    credential=AzureCliCredential(),
).as_agent(
    name="WeatherAgent",
    description="Answers weather questions for a location.",
    instructions="You answer weather questions only.",
    tools=get_weather,
)

weather_tool = weather_agent.as_tool(
    name="WeatherLookup",
    description="Look up weather for any location",
    arg_name="query",
    arg_description="Location or weather question",
)

main_agent = OpenAIChatCompletionClient(
    model=os.environ["AZURE_OPENAI_CHAT_COMPLETION_MODEL"],
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
    credential=AzureCliCredential(),
).as_agent(
    instructions="You are a helpful assistant. Delegate weather to WeatherLookup.",
    tools=[weather_tool],
)

result = await main_agent.run("What is the weather in Amsterdam?")
print(result.text)
```

**适用边界**：
- ✅ **适合**：子域清晰、接口稳定的专家 Agent（天气、检索、代码审查）
- ❌ **不适合**：强顺序、强事务、必须 checkpoint 的流程 → **应改用 Workflow**
- ⚠️ **外层每次 `as_tool()` 调用都会产生完整子 Agent run**，注意**延迟与 Token 成本**

## 与系列其他文章衔接

| Agent 篇主题 | 与 Tools 的关系 |
|---|---|
| **Skills（十一）** | 领域包 + `load_skill` / `run_skill_script`，与 Function/Hosted 工具**正交** |
| **CodeAct（十二）** | 用 `execute_code` 在沙箱内编排 `call_tool`，**工具契约更重要** |
| **Safety / FIDES（十三、十四）** | **工具参数与 sink 策略是安全边界的核心** |

## 选型检查清单（架构/落地用）

1. **Client**：Responses / Chat Completion / Foundry / Anthropic / Copilot？
2. **工具类**：只需 Function？要不要 Code Interpreter、File Search、MCP？
3. **数据驻留**：Hosted 工具是否允许把企业文档送到 Provider？
4. **审批**：哪些 tool 必须 `approval_mode="always_require"`？
5. **组合**：是否需要 `as_tool()` 嵌套？是否应升级为 Workflow？
6. **预览项**：Foundry experimental 工具是否接受首次 `ExperimentalWarning` 与 API 变更？

## 与已有实体的关系

- `Mac Multi Agent Coding Skills Hooks Harness` — Skills + Hooks 两层 harness
- **本实体** — Microsoft Agent Framework 4 类工具（Function/Hosted/MCP/Foundry）
- **关系**：本实体更偏**框架级工具分类与 Provider 能力矩阵**

- `Rein Go Agent 4 Modules 5 Type Boundaries` — Rein = Go code agent framework
- **Microsoft Agent Framework** = **Python 企业级 agent framework**（覆盖 Function + MCP + Foundry + Hosted 全部 4 类）
- **Rein 偏 Code Agent 内部模块**；**MAF 偏多类工具的客户端运行时**

- `Is Grep All You Need` — 检索 × Harness × 交付耦合
- **Tool Approval** = 框架级"交付方式"统一闸门（与检索器选型同等量级）

## 核心金句

- "**工具不是'插件列表'，而是 Agent 对外的能力契约**"
- "**一次 tool_call 对应一次结构化入参、一次可观测的副作用、可被中间件拦截的执行路径**"
- "**Function Tools 可移植性最好、最适合接业务逻辑与细粒度权限**"
- "**入参由模型根据 JSON Schema 生成，必须按不可信输入校验**"
- "**Hosted Tools 计费、配额、数据驻留都跟随 Provider**"
- "**Chat Completion 客户端往往不支持完整 Hosted 能力集**"
- "**MCP 适合把已有工具生态以标准协议接到 Agent，不必每个集成写一个薄封装函数**"
- "**FoundryAgent（远端已定义的智能体）与 FoundryChatClient（本地 client 组工具）能力边界不同**"
- "**许多工具只能在 FoundryChatClient 路径下由框架动态挂载**"
- "**先定 Client 类型，再选工具清单**"
- "**Tool Approval 不是某个云厂商的独占能力，而是 function-invoking chat client 上的横切能力**"
- "**生产环境对副作用类工具应默认 always_require，而非 sample 里的 never_require**"
- "**Agent → Function Tool 桥接 = 分层委派（与 Workflow 的确定性图编排不同，更偏模型自主路由）**"
- "**外层每次 as_tool() 调用都会产生完整子 Agent run，注意延迟与 Token 成本**"
- "**强顺序、强事务、必须 checkpoint 的流程应改用 Workflow**"

## 深度分析

### 1. Provider 矩阵的实质：运行时能力 vs 代码可 import 性的落差

Provider 能力矩阵揭示了一个核心矛盾：**框架 API 层面可 import 的模块与运行时实际支持的工具类型之间存在系统性落差** 。例如，`Code Interpreter` 和 `File Search` 在 Python import 路径上对所有 Client 类型开放，但在实际运行时只有 `Responses` 和 `Foundry` 支持。这不是文档缺陷，而是 Client 架构分层导致的：**Chat Completion 客户端复刻的是 OpenAI Chat Completion API 的工具子集，而非 Responses API 的完整工具面**。

这一落差对架构选型的实际影响是：开发团队在原型阶段用 `OpenAIChatCompletionClient` 通过 `FunctionTool` 可以模拟任何工具行为，但到生产部署切换到 `Responses` 或 `Foundry` 时，会发现有些能力（如 `Hosted Shell`）只在特定 Client 上原生暴露。因此**选型时必须同时按"Client 类型 × 工具类型"二维矩阵核对**，而不能只按"工具名称"匹配 。

### 2. Tool Approval 作为横切关注点：统一审批与多端一致性的平衡

`ToolApproval` 被设计为 **function-invoking chat client 上的横切能力**，而非 Provider 独占功能 。这个设计选择有重要含义：同一套审批逻辑可以跨 `Function Tools`、`Hosted 调用` 和 `MCP tool call` 工作，对外层 Agent 屏蔽了底层工具类型的差异。然而这也意味着**审批策略的可配置粒度必须足够细**：一个 `transfer_funds` 需要 `always_require`，但 `get_weather` 只需要 `never_require` —— 两者都在同一个 `@tool` 装饰器参数层面声明，却通过同一个 client 运行时统一调度。

这个设计实际上把"**安全策略声明**"从运行时决策提前到了**工具定义阶段**，符合 Zero Trust 原则（永不隐式信任任何工具调用）。但它也带来一个实操难题：当 `as_tool()` 把内层 Agent 包装成外层工具时，审批边界在哪里？内层 Agent 的工具审批是否自动继承？文档没有明确说明，这需要在实际集成中格外小心。

### 3. MCP 协议的位置：标准化集成层 vs 应用感知层

MCP Tools 在矩阵中的独特之处在于它同时出现在 **Hosted MCP**（Provider 运行时管理）和 **Local MCP**（应用侧直连）两种形态，且两者在不同 Client 上可用性完全一致（都支持）。这说明 **MCP 协议本身是 Client-agnostic 的**，框架在协议解析层面统一处理 MCP 调用，而不关心 MCP Server 实际托管在哪里。

这个设计对于企业集成团队意味着：可以把内部工具（SaaS、数据库、内部平台）封装为标准 MCP Server，然后在**任何支持 Local MCP 的 Client 上**使用这些工具，而不需要为每个 Client 类型写专门的适配层 。这是该框架相较于其他 Agent 框架（如 LangChain、LangGraph）在工具集成层面的核心差异化优势 —— **协议层面的抽象比代码层面的抽象更难被绕过，也更容易生态化**。

### 4. Agent-as-Tool 的适用边界：何时分层委派 vs 何时代替 Workflow

`as_tool()` 模式将一个完整 Agent 包装成可被外层 Agent 调用的小工具，本质上是**分层委派（hierarchical delegation）**，与 Workflow 的确定性图编排（directed graph）是正交的选择 。关键区分在于：

**适用 as_tool()**：子域边界清晰、接口稳定、允许模型自主决定何时调用、调用结果为最终答案或结构化数据（如天气查询、代码审查、检索）。

**不适用 as_tool() → 应改用 Workflow**：强执行顺序（第二步依赖第一步输出）、事务性要求（必须 checkpoint 回滚）、多 Agent 必须同步协作（如同一个共享状态的并发操作）。

这个边界的实操意义在于：架构师在设计多 Agent 系统时，**第一反应不应该是把所有子任务都变成嵌套 Agent**，而应该先问"这些子任务之间是否有强数据流依赖或事务要求"—— 如果有，Workflow 更合适；如果子任务足够独立且接口稳定，as_tool() 可以显著简化架构。

### 5. Foundry 工具的 preview 陷阱：experimental API 的生产风险

Foundry 工具矩阵中大量标注了 **experimental / preview** 状态 ，这些工具在首次使用时会产生 `ExperimentalWarning`，且 API 可能在后续版本中变更。这意味着：

- **生产系统不能依赖 experimental 工具作为核心路径**：一旦底层 Foundry API breaking change，运行时会直接报错而非优雅降级
- **评估阶段应该明确区分"已生产可用"和"experimental"工具**：选型检查清单中应单独列出一项"哪些 Foundry experimental 工具是业务必需的，如果不可用是否有 fallback"

Foundry 工具矩阵的设计哲学似乎是将**创新前沿（experimental）工具与稳定工具混合在同一套挂载机制下**，降低试错门槛 —— 但这对生产系统的稳定性工程提出了更高要求：需要主动维护一个"Foundry experimental 工具清单 + fallback 方案"的内部文档 。

## 实践启示

### 1. 选型时先用 Provider × Tool 二维矩阵过滤，再谈功能需求

在实际项目选型中，第一步不是问"我需要什么工具"，而是问"我的 Client 类型是什么" 。具体流程：

1. **确认 Client 类型**：如果需要 Code Interpreter + File Search，只能选 `Responses` 或 `Foundry`，排除 `Chat Completion`、`Anthropic`、`Ollama`
2. **在选定 Client 上拉矩阵**：确认所需工具类型在该 Client 上是 ✅ 支持还是 ❌ 不支持
3. **处理 ⚠️ 项**：如果模型不支持 function calling（Ollama/Foundry Local），Function Tools 实际降级为 ⚠️，需要评估模型升级或切换
4. **最后才是业务功能映射**：把业务需求映射到工具类型上，而不是直接匹配工具名称

这个顺序颠倒的选型流程可以避免常见的"原型 works，生产 fails"问题 —— 在原型阶段用 `OpenAIChatCompletionClient` 模拟所有工具看似全能，上生产时才发现工具集不匹配。

### 2. 统一 Tool Approval 策略：默认 always_require，按工具风险分级配置

生产系统中，Tool Approval 配置应该**按工具风险等级建立清单**，而非逐个工具临时决定 ：

- **高风险工具**（`always_require`）：写数据库、写文件到共享路径、执行 Shell 命令、转账/支付、发送外部 API 请求
- **中风险工具**（`user_input_required`）：文件删除、外部链接访问、长时运行任务
- **低风险工具**（`never_require`）：只读查询、公开信息检索、格式化输出

这个分级应该在**工具定义阶段就完成**，而非在 `agent.run()` 调用侧临时处理。对于多团队协作的场景，建议在团队内部维护一份 `tool_approval_matrix.md`，与本框架矩阵配合使用。

### 3. MCP 优先策略：已有工具生态优先 MCP 封装，而非 Function Tool 薄封装

如果团队已有大量内部工具（SaaS API、数据库、监控系统），在接入 Agent Framework 时**不应为每个工具写一个 Function Tool 薄封装**，而是应该优先评估该工具是否已有 MCP Server 实现，或评估自建 MCP Server 的成本 。

原因：MCP Server 一旦实现，可以在**任何支持 Local MCP 的 Client 上复用**，而 Function Tool 薄封装与特定 Client 的 function invoking 机制绑定。如果未来需要切换 Client 类型（如从 OpenAI Chat Completion 迁移到 Foundry），Function Tool 薄封装可能需要重写，而 MCP Server 不需要修改。

具体操作：先用 `Local MCP` 形态接入（应用侧 stdio 连接），验证工具行为满足需求后再评估是否需要升级到 `Hosted MCP`（Provider 托管），以获得更好的隔离和计费管理。

### 4. as_tool() 使用前做"独立性测试"：子 Agent 是否足够独立

在决定是否使用 `as_tool()` 构建嵌套 Agent 前，建议做一个**独立性测试** ：

- 子 Agent 是否有清晰的单一职责（不依赖其他子 Agent 协同完成）？
- 子 Agent 的输入输出是否可以被**自然语言或简单结构化数据**表达（而非复杂的中间状态对象）？
- 子 Agent 是否允许**模型自主决定是否调用**（而非每次 run 必须调用）？

如果以上三个都是 ✅，则 as_tool() 是合适选择。如果任何一个是 ❌，应该考虑 Workflow 或其他编排模式。这个测试可以在设计阶段就排除大部分滥用 as_tool() 的架构陷阱。

### 5. Foundry experimental 工具维护独立清单 + 降级方案

鉴于 Foundry 工具矩阵中有大量 experimental / preview 工具，生产系统应该维护一份内部文档，格式如下 ：

```
## Foundry Experimental 工具清单
| 工具 | 状态 | 业务用途 | Fallback 方案 | 最后验证日期 |
|---|---|---|---|---|
| Computer Use | experimental | 浏览器自动化 | 手动测试 / Playwright 直接调用 | TBD |
| Memory Search | preview | 记忆库检索 | 外部向量数据库（如 Qdrant） | TBD |
```

每次 Foundry SDK 升级后，第一时间验证这些 experimental 工具是否仍然可用，并更新 Fallback 方案。这个维护成本应该计入 Agent Framework 迁移项目的工期估算中。

### 6. 跨 Wiki 实体的交叉引用验证

本实体中提到的以下交叉引用需要定期验证目标实体是否存在 ：

- ``Mac Multi Agent Coding Skills Hooks Harness`` — Skills + Hooks 两层 harness
- ``Rein Go Agent 4 Modules 5 Type Boundaries`` — Rein = Go code agent framework
- ``Is Grep All You Need`` — 检索 × Harness × 交付耦合

如果目标实体不存在，相关链接会变成断链（broken wikilink）。建议在每次实体更新时用 lint 检查断链，或者将这些依赖关系明确记录在架构文档中。

---
