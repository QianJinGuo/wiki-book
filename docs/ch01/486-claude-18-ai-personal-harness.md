# 用好 Claude 的 18 个动作：搭一个个人 AI 工作台（Personal Harness）

## Ch01.486 用好 Claude 的 18 个动作：搭一个个人 AI 工作台（Personal Harness）

> 📊 Level ⭐⭐ | 9.7KB | `entities/ruofei-claude-18-actions-personal-ai-workbench.md`

# 用好 Claude 的 18 个动作：搭一个个人 AI 工作台（Personal Harness）

> 作者：若飞，公众号：架构师（JiaGouX）
> 原始链接：[原始链接](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)
> 日期：2026-05-18

## 摘要

若飞（架构师 JiaGouX）提出的 **Personal Harness 范式**：把 Claude 用得好不好定位为「**环境工程问题**」而非「提示词技巧问题」。核心洞察 —— **给 Claude 一个稳定的工作现场，比优化每次的提示词更重要**。通过 18 个具体动作和六层工作台结构（Workspace / Identity / Behavior Contract / Task Entry / Output Standards / Context Governance），把 Claude Projects + Custom Instructions + Memory 三大工具组合成可治理的个人 AI 工作环境。

## 一句话

**AI 用得好不好，越来越像环境工程问题 —— 给它一个稳定的工作现场，比优化每次的提示词更重要。**

## 核心要点

### 1. 范式转移：从"提示词优化"到"环境工程"

传统思路：
- "如何写出更好的 prompt"
- "如何用 few-shot 让模型更准"
- "如何 chain-of-thought 推理"

Personal Harness 思路：
- "如何给模型一个稳定的工作环境"
- "如何让上下文在不同任务间可治理"
- "如何让模型在多次会话间保持行为一致"

**核心洞察**：模型能力见顶后，**上下文环境的工程化**是下一波生产力提升的关键。

### 2. 六层工作台结构

| 层 | 职责 | Claude 对应工具 |
|---|------|----------------|
| **1. 工作区（Workspace）** | Project 划分任务边界 | Projects |
| **2. 身份（Identity）** | 个人说明 | Custom Instructions（Identity 部分） |
| **3. 行为规则（Behavior Contract）** | 行为约束 | Custom Instructions（Rules 部分） |
| **4. 任务入口（Task Entry）** | 先问问题再执行 | 任务模板 |
| **5. 输出标准（Output Standards）** | 风格样本、输出长度、完成标准 | 风格样本 / Output Schema |
| **6. 上下文治理（Context Governance）** | 新话题开新 chat | Chat 管理策略 |

### 3. 关键语录

> "Project 是边界，不是万能记忆"

Project 不是用来"塞所有内容"的容器 —— 每个 Project 应该聚焦于一个明确的领域（Work / Writing / Learning）。跨领域的需求应该开新 Project，避免上下文污染。

> "Custom Instructions 是行为契约，不是人格设定"

Custom Instructions 不应该写成"你是一个友善的、专业的助手"这种人格描述 —— 应该写成可强制执行的行为规则（"代码必须先解释再写"、"每次回答前先列出假设"）。

> "流程卡片 = 过程资产，而非一次性提示词"

把"如何做某事"固化成可复用的流程卡片，每次直接调用 —— 这相当于给 Claude 装上了"机构知识"。

> "AI 不会因为知道更多，就一定帮得更好。它要知道的，是和你有关的那一部分。"

通用知识是基础，但决定 AI 实际产出质量的是 **个人上下文** —— 你的项目背景、风格偏好、历史决策。这正是 Personal Harness 要提供的。

### 4. 最小可行版本：3 Projects

如果只能从 3 个 Project 起步：

- **Work**：工作项目、技术方案、会议、客户沟通
- **Writing**：文章、公众号、标题、选题、风格样本
- **Learning**：论文、课程、概念理解、读书笔记

每个 Project 配 5-10 条 Custom Instructions + 2-3 个风格样本 + 1 套任务模板，就可以覆盖 80% 的日常需求。

### 5. 18 个动作的覆盖维度

虽然原文给出的是 18 个具体动作（详见原文），但可以归为 5 个工程维度：
1. **环境搭建**（建 Project、配 Custom Instructions、挂 Memory）
2. **任务入口**（设计任务模板、问题清单、假设前置）
3. **输出约束**（风格样本、长度限制、完成标准）
4. **上下文治理**（新话题开新 chat、定期清理 Memory、跨 Project 引用规范）
5. **反馈循环**（反方评审、压力测试、迭代优化）

## 深度分析

### 1. Personal Harness 是 Harness Engineering 的个人版

2026 年 Harness Engineering 是 AI 编程领域的主流范式 —— 给 Coding Agent 一个稳定的工作环境（CLAUDE.md、AGENTS.md、测试套件、CI 回路）。若飞这篇文章的核心论点是 **同一个范式适用于个人 AI 使用**：

- **Coding Agent 需要 Harness** → CLAUDE.md、AGENTS.md、tools、tests
- **个人使用 Claude 需要 Harness** → Projects、Custom Instructions、Memory、风格样本

两者本质相同：模型 + 工作环境 = 稳定产出。脱离环境的"裸 prompt" 是一次性的赌博，有环境的"harness prompt" 是可复现的工程。

### 2. 六层结构对应软件工程的成熟分层

把六层结构映射到软件工程的成熟分层：

| Personal Harness | 软件工程对应 | 解决的问题 |
|------------------|-------------|------------|
| Workspace（工作区） | 命名空间 / 模块 | 边界 |
| Identity（身份） | 用户模型 / 角色 | 谁在用 |
| Behavior Contract（行为规则） | API 契约 / Linter | 一致性 |
| Task Entry（任务入口） | API Endpoint | 输入标准化 |
| Output Standards（输出标准） | Schema 验证 | 输出可预期 |
| Context Governance（上下文治理） | 缓存失效策略 | 状态管理 |

这不是巧合 —— 个人 AI 工具的成熟路径会复刻软件工程的成熟路径。

### 3. 「流程卡片」是最被低估的资产

18 个动作中，"流程卡片"（process card）这一类资产长期被低估：

流程卡片 = 把"我通常如何做 X"固化成可复用的结构化 prompt。例如：
- "代码评审流程卡"：先看测试覆盖 → 再看命名 → 再看错误处理 → 再看性能
- "技术文章流程卡"：先列大纲 → 写引子 → 分章节展开 → 自检术语一致性 → 写摘要
- "客户邮件流程卡"：先写主旨 → 写背景 → 写请求 → 写后续步骤

流程卡片的好处是 **沉淀经验** —— 一次设计，多次复用，且每次复用都在强化。

### 4. 上下文治理 = 最难的工程问题

六层里最难做好的是「Context Governance」：

- 同一个 chat 跑太久 → 上下文污染 → 后面的回答质量下降
- 跨 Project 复用内容 → 上下文碎片化 → 模型不知道用哪一份
- Memory 自动写入 → 噪音累积 → 真正重要的信息被淹没

工程上对应的就是缓存失效、状态管理、数据治理。2026 年的 Claude Projects 还没自动解决这些问题，需要用户自己设计策略（"每个任务一个 chat"、"Memory 定期清理"、"跨 Project 用相对路径引用"）。

## 实践启示

1. **用 Claude 的第一周，建 3 个 Project**。Work / Writing / Learning 起步，每个 Project 配 5 条 Custom Instructions + 2 个风格样本。这一步做好了，80% 的日常使用都能稳定。
2. **Custom Instructions 写"行为规则"不写"人格描述"**。"代码必须先给测试再给实现"是行为规则；"你是一个友善的助手"是废话。规则要可强制执行。
3. **流程卡片是个人 AI 时代的最重要资产**。花一下午设计 5-10 张流程卡片（代码评审、文章写作、客户邮件、读书笔记...），未来 6 个月都会受益。
4. **新话题开新 chat，别贪图上下文延续**。一个 chat 超过 30 轮就开始质量下降 —— 宁可分多个 chat，每个 chat 配独立 Memory，也不要一个 chat 跑一天。
5. **把 Claude 当成"机构新员工"管理**。给身份（Identity）、给行为规则（Behavior Contract）、给工作环境（Workspace）、给任务模板（Task Entry）、给输出标准（Output Standards）、给定期 review（Context Governance）。这就是 Personal Harness 的核心 —— **AI 时代的高产者，都是好的"AI 管理者"**。

## 相关实体

- [原文链接](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)
- [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-engineering.md) — Personal Harness 的工程化版本
- [Claude Code 源码核心机制](https://github.com/QianJinGuo/wiki/blob/main/entities/两万字详解claude-code源码核心机制.md)
- [Claude Code 源码中的 Agent Harness 构建](https://github.com/QianJinGuo/wiki/blob/main/entities/深入理解-claude-code-源码中的-agent-harness-构建之道.md)
- [Agent 记忆系统的工程实践](https://github.com/QianJinGuo/wiki/blob/main/entities/存之有序治之有矩agent-记忆系统的工程实践与演进.md)
- [Karpathy: 从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/karpathy-最新访谈从-vibe-coding-到-agentic-engineering.md)
- 原始链接: https://mp.weixin.qq.com/s/pAVt6MeapUIDyVu256FI4w

---

